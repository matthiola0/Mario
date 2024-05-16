const {ccclass, property} = cc._decorator;

@ccclass
export default class Player extends cc.Component {
    // The speed of the player
    private playerSpeed: number = 0;
    // Boolean flags to track if movement keys are pressed
    private leftDown: boolean = false;
    private rightDown: boolean = false;
    private upDown: boolean = false;
    // Boolean flag to check if the player is dead
    isDead: boolean = false;
    // Boolean flag to track if the player is powered up
    private isPower: boolean = false;
    // Boolean flag to pause the game
    public isPause: boolean = false;
    // Boolean flag to indicate a power down state
    isStrong: boolean = false;
    // Boolean flag to check if the player has won
    private isWin: boolean = false;
    // Boolean flag to check if the player is on the ground
    private onGround: boolean = false;
    // Variables to keep track of the player's score, coins, life, etc.
    private score: number = 0;
    private coin: number = 0;
    private life: number = 5;
    // Variables for power-up timing and duration
    private powerUpTimer: number = 0;
    private powerUpDuration: number = 10;
    // Remaining time for the game
    private remainTime: number = 300;
    // User credentials
    private user: string;
    private email: string;
    // Animation component
    private anim = null;

    // Various Prefab properties for gameplay elements
    // coin
    @property(cc.Prefab)
    coinPrefab: cc.Prefab = null;
    // 100 score
    @property(cc.Prefab)
    score100Prefab: cc.Prefab = null;
    // 1000 score
    @property(cc.Prefab)
    score1000Prefab: cc.Prefab = null;
    // mashroom
    @property(cc.Prefab)
    mushroomPrefab: cc.Prefab = null;
    // SpriteFrame property for a new question mark
    @property(cc.SpriteFrame)
    newquestionSpriteFrame: cc.SpriteFrame = null;

    // AudioClip properties for various game sounds
    @property({type:cc.AudioClip})
    bgm: cc.AudioClip = null;
    @property({type:cc.AudioClip})
    jumpSound: cc.AudioClip = null;
    @property({type:cc.AudioClip})
    stompSound: cc.AudioClip = null;
    @property({type:cc.AudioClip})
    kickSound: cc.AudioClip = null;
    @property({type:cc.AudioClip})
    coinSound: cc.AudioClip = null;
    @property({type:cc.AudioClip})
    mushroomSound: cc.AudioClip = null;
    @property({type:cc.AudioClip})
    reserveSound: cc.AudioClip = null;
    @property({type:cc.AudioClip})
    powerUpSound: cc.AudioClip = null;
    @property({type:cc.AudioClip})
    powerDownSound: cc.AudioClip = null;
    @property({type:cc.AudioClip})
    loseLifeSound: cc.AudioClip = null;
    @property({type:cc.AudioClip})
    gameoverSound: cc.AudioClip = null;
    @property({type:cc.AudioClip})
    winSound: cc.AudioClip = null;

    onLoad() {
        // Enable physics manager
        cc.director.getPhysicsManager().enabled = true;

        // Get the animation component of the player
        this.anim = this.getComponent(cc.Animation);   

        // Register event handlers for key down and key up events 
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this);
    }

    start() {
        // Play the background music, initialize game information and hide win information at the start
        this.playBGM();
        this.initInformation();
        this.hideWinInformation();
        this.platformrenew();
    }
    
    // Plays the background music
    playBGM() {
        // The 'playMusic' method plays the given audio clip
        // The second argument 'true' means the audio clip will loop indefinitely
        cc.audioEngine.playMusic(this.bgm, true);
    }

    // Stops the background music
    stopBGM() {
        // The 'pauseMusic' method pauses the currently playing music
        cc.audioEngine.pauseMusic();
    }

    // Plays a given sound effect
    playEffect(sound) {
        // The 'playEffect' method plays the given audio clip
        // The second argument 'false' means the audio clip will play only once (it won't loop)
        cc.audioEngine.playEffect(sound, false);
    }

    update(dt) {
        // If player is dead, return without updating
        if(this.isDead == true) 
            return;
        // if (this.isPower && this.powerUpTimer > 0) {
        //     this.powerUpTimer -= dt;
        //     if (this.powerUpTimer <= 0) {
        //         this.powerDown();
        //     }
        // }

        // If player has not won, decrement remaining time, if it's zero then player loses life
        if(!this.isWin) {
            if(Math.floor(this.remainTime) <= 0) {
                this.loseLife();
            }
            else {
                this.remainTime -= dt;
            }
        }
        // Pause: pause the animation if game is paused, else resume player movement and animation
        if(this.isPause == true) {
            this.getComponent(cc.Animation).pause();
        }
        else {
            this.playerMovement(dt);
            this.getComponent(cc.Animation).resume();
        }
        // Update the UI with player stats
        cc.find("Canvas/Main Camera/score").getComponent(cc.Label).string = (Array(7).join("0") + this.score.toString()).slice(-7);
        // coin
        cc.find("Canvas/Main Camera/coinNum").getComponent(cc.Label).string = String(this.coin);
        // life
        cc.find("Canvas/Main Camera/lifeNum").getComponent(cc.Label).string = String(this.life);
        // time
        cc.find("Canvas/Main Camera/timeNum").getComponent(cc.Label).string = String(Math.floor(this.remainTime));
        // If player falls out of the window, player loses life
        if(this.node.y - cc.find("Canvas/Main Camera").y < -600) 
            this.loseLife();
    }

    // Initialize player information based on Firebase user information
    initInformation() {
        firebase.auth().onAuthStateChanged((user) => {
            if (user) {
                this.email = user.email.split(".").join("_").replace(/@/g, "_");
                // Firebase
                firebase.database().ref('users/' + this.email).once('value').then(snapshot => {
                    // user
                    this.user = snapshot.val().name;
                    // life
                    this.life = Number(snapshot.val().life);
                    // coin
                    this.coin = Number(snapshot.val().coin);
                    // score
                    this.score = Number(snapshot.val().score);
                });
            }
            else { // If no user is signed in, load the Menu scene.
                cc.director.loadScene("Menu");
            }
        });
    }

    // Update Firebase with current player stats
    updateFirebase() { // when lose life and win
        firebase.auth().onAuthStateChanged((user) => {
            if (user) {
                // If current score is greater than the score in Firebase, update the score in Firebase
                firebase.database().ref('rank/' + this.user).once('value').then(snapshot => {
                    if(this.score > snapshot.val().score) {
                        // Update the score in Firebase
                        firebase.database().ref('rank/' + this.user).update({score: this.score})
                    }
                });

                if (this.life > 0) {
                    // If player has no lives left, reset player stats in Firebase, otherwise update with current stats
                    firebase.database().ref('users/' + this.email).update({ life: this.life, coin: this.coin, score: this.score })
                }
                else {
                    firebase.database().ref('users/' + this.email).update({ life: 5, coin: 0, score: 0 })
                }
            }
            // If no user is signed in, load the Menu scene.
            else { // No user is signed in.
                cc.director.loadScene("Menu");
            }
        });
    }

    // Hides the win information by making associated objects inactive
    hideWinInformation() {
        // Obtain each element by their unique identifier ("Canvas/element_name")
        // and set their active property to false (makes them invisible)
        const elementsToHide = ["black", "level", "clear", "multiple", "10", "="];
        elementsToHide.forEach(element => cc.find(`Canvas/${element}`).active = false);
    }

    platformrenew() {
        const elementsToHide = ["platform1"];
        elementsToHide.forEach(element => cc.find(`Canvas/${element}`).active = false);
        const elementsToShow = ["white1"];
        elementsToShow.forEach(element => cc.find(`Canvas/${element}`).active = true);
    }

    // Shows the win information by making associated objects active
    showWinInformation() {
        // Obtain each element by their unique identifier ("Canvas/element_name")
        // and set their active property to true (makes them visible)
        const elementsToShow = ["black", "level", "clear", "multiple", "10", "="];
        elementsToShow.forEach(element => cc.find(`Canvas/${element}`).active = true);
    }

    // Triggered when a key is pressed
    onKeyDown(event) {
        // Handle specific key presses:
        // 'a' - Set left movement to true, right movement to false
        // 'd' - Set right movement to true, left movement to false
        // 'w' - Set up movement to true
        switch(event.keyCode) {
            case cc.macro.KEY.a:
                this.leftDown = true;
                this.rightDown = false;
                break;
            case cc.macro.KEY.d:
                this.rightDown = true;
                this.leftDown = false;
                break;
            case cc.macro.KEY.w:
                this.upDown = true;
                break;
        }
    }

    // Triggered when a key is released
    onKeyUp(event) {
        // Handle specific key releases:
        // 'a' - Set left movement to false
        // 'd' - Set right movement to false
        // 'w' - Set up movement to false
        switch(event.keyCode) {
            case cc.macro.KEY.a:
                this.leftDown = false;
                break;
            case cc.macro.KEY.d:
                this.rightDown = false;
                break;
            case cc.macro.KEY.w:
                this.upDown = false;
                break;
        }
    }

    // Function called when player loses a life
    loseLife() {
        this.isDead = true; // Sets player status as dead
        this.life -= 1; // Decreases life count by 1
        this.stopBGM(); // Stops the background music
        this.updateFirebase(); // Updates player data in Firebase

        // Checks if the player is out of lives
        if(this.life <= 0) { 
            this.playEffect(this.loseLifeSound); // Plays the lose life sound effect

            // Animation based on player's power status
            if(!this.isPower) {
                this.anim.play("die"); // Plays dying animation for regular state
            } else {
                this.anim.play("big_die"); // Plays dying animation for power-up state
            }
            
            // Sets player's vertical velocity upwards
            this.getComponent(cc.RigidBody).linearVelocity = cc.v2(0, 1500);

            // Schedules a function to execute after 2 seconds
            this.scheduleOnce(function() {
                this.playEffect(this.gameoverSound); // Plays gameover sound effect
                cc.director.loadScene("GameOver"); // Loads the GameOver scene
            }, 2);
            
        } else { // If player still has lives left
            this.playEffect(this.loseLifeSound); // Plays the lose life sound effect

            // Animation based on player's power status
            if(this.isPower) {
                this.anim.play("big_die"); // Plays dying animation for power-up state
            } else {
                this.anim.play("die"); // Plays dying animation for regular state
            }

            // Sets player's vertical velocity upwards
            this.getComponent(cc.RigidBody).linearVelocity = cc.v2(0, 1000);

            // Schedules a function to execute after 2 seconds
            this.scheduleOnce(function() {
                // Load the appropriate scene based on the current world number
                if(cc.find("Canvas/Main Camera/worldNum").getComponent(cc.Label).string == "1") {
                    // level1
                    cc.director.loadScene("GameStart1");
                }
                else {
                    // level2
                    cc.director.loadScene("GameStart2");
                }
            }, 2);   
        }
    }

    // Function to move the camera based on player's position
    cameraMove(dt) {
        // If the player is moving to the right and the camera hasn't reached its right limit
        if(this.node.x - cc.find("Canvas/Main Camera").x > 0)
            if (cc.find("Canvas/Main Camera").x < 4430) 
                cc.find("Canvas/Main Camera").x += 300 * dt; // Moves camera to the right

        // If the player is moving to the left and the camera isn't at its left limit
        if(this.node.x - cc.find("Canvas/Main Camera").x < 0)
            if (cc.find("Canvas/Main Camera").x > 0)
                cc.find("Canvas/Main Camera").x -= 300 * dt; // Moves camera to the left

        var d = this.node.y - cc.find("Canvas/Main Camera").y; // Distance between player and camera along the y-axis

        // If player is above the upper camera limit
        if(d > 150) {
            cc.find("Canvas/Main Camera").y += d - 150; // Moves camera upwards
        }

        // If player is below the upper camera limit and camera isn't at its lower limit
        if(d < 150 &&  cc.find("Canvas/Main Camera").y > 0) {
            cc.find("Canvas/Main Camera").y += d - 150; // Moves camera downwards
        }
    }

    // Function to control the player's movements
    playerMovement(dt) {
        // If the player is dead, terminate the function
        if(this.isDead)
            return;

        // Initialize the player speed
        this.playerSpeed = 0;

        // Check if the left key is pressed
        if(this.leftDown){
            // Set the player speed to move left
            this.playerSpeed = -300;

            // Check if the player is in power mode
            if(!this.isPower) {
                // If the player is not currently moving or jumping, play the "move" animation
                if (!this.anim.getAnimationState("move").isPlaying)
                    if (!this.anim.getAnimationState("jump").isPlaying)
                        this.anim.play("move");
            }
            else {
                // If the player is not currently moving or jumping in power mode, play the "big_move" animation
                if  (!this.anim.getAnimationState("big_move").isPlaying)
                    if (!this.anim.getAnimationState("big_jump").isPlaying)
                        this.anim.play("big_move");
            }

            // Update the direction the player is facing
            if(this.node.scaleX > 0)
                this.node.scaleX *= -1;
        }
        // Check if the right key is pressed
        else if(this.rightDown){
            // Set the player speed to move right
            this.playerSpeed = 300;

            // Check if the player is in power mode
            if(!this.isPower) {
                // If the player is not currently moving or jumping, play the "move" animation
                if (!this.anim.getAnimationState("move").isPlaying)
                    if (!this.anim.getAnimationState("jump").isPlaying)
                        this.anim.play("move");
            }
            else {
                // If the player is not currently moving or jumping in power mode, play the "big_move" animation
                if (!this.anim.getAnimationState("big_move").isPlaying)
                    if (!this.anim.getAnimationState("big_jump").isPlaying)
                        this.anim.play("big_move");
            }
            
            // Update the direction the player is facing
            if(this.node.scaleX < 0)
                this.node.scaleX *= -1;
        }
        // If neither left or right keys are pressed and player is not jumping
        else if(!this.upDown) {
            // Play idle animation based on player's power status
            if(!this.isPower)
                this.anim.play("idle");
            else    //big
                this.anim.play("big_idle");
        }

        // Check if the up key is pressed and the player is on the ground
        if(this.upDown && this.onGround) {
            this.jump(); // Calls the jump function
            if(!this.isPower) {
                // Plays jumping animation based on player's power status
                if(!this.anim.getAnimationState("jump").isPlaying)
                    this.anim.play("jump");
            }
            else {
                if(!this.anim.getAnimationState("big_jump").isPlaying)
                    this.anim.play("big_jump");
            }
        }

        // Update the player's x position based on the player speed
        this.node.x += this.playerSpeed * dt;

        // Move the camera following the player
        this.cameraMove(dt);
    }

    // Function to make the player jump
    jump() {
        this.onGround = false; // Set onGround flag to false indicating player is in air

        // Set player's vertical velocity to make him jump
        this.getComponent(cc.RigidBody).linearVelocity = cc.v2(0, 1200);
        // Play jump sound effect
        this.playEffect(this.jumpSound);
    }

    // Function to add 100 points to the score when a coin is collected
    addCoin_100(other) { //questionBox_coin
        // Create score and coin prefabs
        let score = cc.instantiate(this.score100Prefab);
        let coin = cc.instantiate(this.coinPrefab);

        // Add score and coin to canvas
        score.parent = cc.find("Canvas");
        coin.parent = cc.find("Canvas");

        // Set position of score and coin
        score.setPosition(other.node.x, other.node.y+50);
        coin.setPosition(other.node.x, other.node.y+50);

        // Define actions to add score and coins and to destroy coin
        let add100 = cc.callFunc(function(target) { this.score += 100;}, this);
        //coin
        let addcoin = cc.callFunc(function(target) { this.coin += 1;}, this);
        let destroy = cc.callFunc(function(target) { coin.destroy(); }, this);

        //score
        score.runAction(cc.sequence(cc.spawn(cc.moveBy(1, 0, 50), cc.fadeOut(1)), add100));
        //coin 
        coin.runAction(cc.sequence(cc.moveBy(0.2, 0, 100), cc.moveBy(0.2, 0, -100), addcoin, destroy));
    }

    // Function to add 100 points to the score when an enemy dies
    enemyDie_100(other) {
        // Play kick sound effect
        this.playEffect(this.kickSound);
        // Create score prefab
        let score = cc.instantiate(this.score100Prefab);
        // Add score to canvas
        score.parent = cc.find("Canvas");
        // Set position of score
        score.setPosition(other.node.x, other.node.y+50);
        // Define action to add score
        let add100 = cc.callFunc(function(target) {this.score += 100;}, this);
        // Run the action sequence
        score.runAction(cc.sequence(cc.spawn(cc.moveBy(0.5, 0, 50), cc.fadeOut(0.5)), add100));
    }

    // Function to handle stomping on an enemy
    stompEnemy_100(other) {
        // Play stomp sound effect and make the player jump
        this.playEffect(this.stompSound);
        this.jump();
        // Create score prefab
        let score = cc.instantiate(this.score100Prefab);
        // Add score to canvas
        score.parent = cc.find("Canvas");
        // Set position of score
        score.setPosition(other.node.x, other.node.y+50);
        // Define action to add score and to destroy enemy
        let add100 = cc.callFunc(function(target) {this.score += 100;}, this);
        let destroy = cc.callFunc(function(target) {other.node.destroy(); }, this);          
        // goomba
        if(other.tag == 4) 
            score.runAction(cc.sequence(cc.spawn(cc.moveBy(0.5, 0, 50), cc.fadeOut(0.5)), add100, destroy));
        // turtle
        else 
            score.runAction(cc.sequence(cc.spawn(cc.moveBy(0.5, 0, 50), cc.fadeOut(0.5)), add100));
    }

    // Function to add 1000 points to the score when a mushroom is eaten
    eatMushroom_1000(other) {
        // Create score prefab
        let score = cc.instantiate(this.score1000Prefab);
        // Add score to canvas
        score.parent = cc.find("Canvas");
        // Set position of score
        score.setPosition(this.node.x, this.node.y+50);
        // Define action to add score
        let add1000 = cc.callFunc(function(target) {this.score += 1000;}, this);
        // Define action to destroy the mushroom
        let destroy = cc.callFunc(function(target) {other.node.destroy(); }, this);
        // Run the action sequence
        score.runAction(cc.sequence(destroy, cc.spawn(cc.moveBy(1, 0, 50), cc.fadeOut(1)), add1000));
    }

    // Function to power up the player
    powerUp() {
        // Set power and pause flags
        this.isPower = true;
        this.isPause = true;

        // Define actions for after power up animation
        let finished = cc.callFunc(function(target) {
            this.isPause = false;
            // adjust scale
            this.node.scaleX *= 2/3;
            this.node.scaleY *= 2/3;
            // Adjusting the collider size to match the power-up scale change
            this.getComponent(cc.PhysicsBoxCollider).size.height = 22.5;
            this.getComponent(cc.PhysicsBoxCollider).size.weight = 17.25;
            this.node.scaleX *= -1;
            this.node.scaleX *= -1;
        }, this);

        // Run the action sequence
        this.node.runAction(cc.sequence(
            cc.repeat(
                cc.sequence(
                    cc.scaleBy(0.2, 1.15), 
                    cc.hide(), 
                    cc.delayTime(0.1), 
                    cc.show()
                ), 3
            ),
            finished
        ));

        // Play power up sound effect
        this.playEffect(this.powerUpSound);

        // Start the power-up timer
        this.scheduleOnce(function() {
            if (this.isPower) {
                this.powerDown();
            }
        }, 10);
    }

    // Function to power down the player
    powerDown() {
        // Set flags
        this.isPower = false;
        this.isPause = true;
        this.isStrong = true;
        this.powerUpTimer = 0; // Reset the power-up timer

        // Define actions for after power down animation
        let finished = cc.callFunc(function(target) {
            this.isPause = false;
            // Rescale the player to normal size
            this.node.scaleX *= 3/2;
            this.node.scaleY *= 3/2;
            // Adjust the collider size back to normal
            this.getComponent(cc.PhysicsBoxCollider).size.height = 15;
            this.getComponent(cc.PhysicsBoxCollider).size.weight = 11.5;
            // adjust scale
            this.node.scaleX *= -1;
            this.node.scaleX *= -1;
            // Set the player as not strong after 1 second
            this.scheduleOnce(function() {
                this.isStrong = false;
            }, 1);
        }, this);

        // Run the action sequence
        this.node.runAction(cc.sequence(
            cc.repeat(
                cc.sequence(
                    cc.scaleBy(0.2, 20/23),
                    cc.hide(),
                    cc.delayTime(0.1),
                    cc.show()
                ), 3
            ),
            finished
        ));

        // Play power down sound effect
        this.playEffect(this.powerDownSound);
    }

    // Function to decrease power level
    decrease() {
        // If player is not strong
        if(!this.isStrong) {
            // If player is powered up, power down
            if(this.isPower) {
                this.powerDown();
            }
            // If player is not paused, lose life
            else {
                if(!this.isPause)
                    this.loseLife();
            }
        }
    }

    // Function to show mushroom
    mushroomShow(other) {
        // Play mushroom sound effect
        this.playEffect(this.mushroomSound);

        // Create mushroom prefab
        let mushroom = cc.instantiate(this.mushroomPrefab);

        // Add mushroom to canvas
        mushroom.parent = cc.find("Canvas");

        // Set position of mushroom
        mushroom.setPosition(other.node.x, other.node.y+50);
    }

    // Function to handle contact with other game elements
    onBeginContact(contact, self, other) {
        // If player is dead, disable contact and return
        if(this.isDead) {
            contact.disabled = true;
            return;
        }
        // Player hits the ground
        if(other.tag == 0) { //ground
            // cc.log("Player hits the ground");
            this.onGround = true;
        }
        // Player hits a block
        else if(other.tag == 1) {
            // cc.log("Player hits the block");
            if (contact.getWorldManifold().normal.x == 0)
                if (contact.getWorldManifold().normal.y == -1) { //upside
                    this.onGround = true;
                }
        }
        // Player hits a question box
        else if(other.tag == 2) { //questionBox
            cc.log("Player hits the questionBox");
            if(contact.getWorldManifold().normal.x == 0 && contact.getWorldManifold().normal.y == -1) {
                // if (contact.getWorldManifold().normal.y == -1) { //upside
                    this.onGround = true;
                // }
            }
            else if(contact.getWorldManifold().normal.x == 0) {
                if (contact.getWorldManifold().normal.y == 1) { //downside
                    // cc.log("isnew");
                    if(other.node.getComponent(cc.Sprite).spriteFrame != this.newquestionSpriteFrame) {
                        other.node.getComponent(cc.Sprite).spriteFrame = this.newquestionSpriteFrame;
                        let randomNum = Math.random();
            
                        if(randomNum <= 0.3) {  
                            // If random number is less than or equal to 0.3, show a mushroom
                            this.mushroomShow(other);
                        }
                        else { 
                            // Otherwise, play a coin sound and add coin
                            this.playEffect(this.coinSound);
                            this.addCoin_100(other);
                        }
                    }
                }
            }
        }
        else if(other.tag == 3) { //platform 
            // cc.log("Player hits the platform");
            if (contact.getWorldManifold().normal.x == 0) {
                if (contact.getWorldManifold().normal.y == -1)  //upside
                    this.onGround = true;
                else 
                    contact.disabled = true;
            }
            else 
                contact.disabled = true;
        }
        else if(other.tag == 4) { //goomba
            // cc.log("Player hits the goomba");
        }
        // Player hits a turtle
        else if(other.tag == 5) { //turtle
            // cc.log("Player hits the turtle");
        }
        // Player hits a flower
        else if(other.tag == 6) { //flower
            // cc.log("Player hits the flower");
            // Decrease player's power
            this.decrease();
        }
        // Player hits a mushroom
        else if(other.tag == 7) { //mushroom
            // cc.log("Player hits the mushroom");
            // If player is not powered up, power up. Else, play reserve sound
            this.eatMushroom_1000(other);
            if(!this.isPower)
                this.powerUp();
            else
                this.playEffect(this.reserveSound);
        }
        else if(other.tag == 8) { //flag
            // cc.log("Player hits the flag");
            var originalPosition = other.node.position;
            var originalScale = other.node.scale;

            var newAnchor = cc.v2(0.5, 1);
            other.node.setAnchorPoint(newAnchor);

            other.node.position = originalPosition;
            other.node.scale = originalScale;
        }
        else if (other.tag == 11) {     // door1
            this.isWin = true;
            // win
            this.scheduleOnce(function() {this.isPause = true;}, 0.3);
            // bgm stop
            this.stopBGM();
            this.playEffect(this.winSound);
            this.showWinInformation();
            // show score info
            cc.find("Canvas/addScore").getComponent(cc.Label).string = String(Math.floor(this.remainTime) * 10);
            cc.find("Canvas/time").getComponent(cc.Label).string = String(Math.floor(this.remainTime));
            // update score
            this.score += Math.floor(this.remainTime) * 10;
            this.updateFirebase();
            // to stage2
            this.scheduleOnce(function() {cc.director.loadScene("SelectStage2");}, 5);
        }
        else if (other.tag == 12) {     // door2
            this.isWin = true;
            // win
            this.scheduleOnce(function() {this.isPause = true;}, 0.3);
            // bgm stop
            this.stopBGM();
            this.playEffect(this.winSound);
            this.showWinInformation();
            // show score info
            cc.find("Canvas/addScore").getComponent(cc.Label).string = String(Math.floor(this.remainTime) * 20);
            cc.find("Canvas/time").getComponent(cc.Label).string = String(Math.floor(this.remainTime));
            // update score
            this.score += Math.floor(this.remainTime) * 20;
            this.updateFirebase();
            // return to menu
            this.scheduleOnce(function() {cc.director.loadScene("StartMenu");
            }, 5);
        }
        else if (other.tag == 21) {
            cc.log("contact button");
            if (contact.getWorldManifold().normal.x == 0) {
                if (contact.getWorldManifold().normal.y == -1) {
                    this.onGround = true;
                    cc.log("contact platform show");
                    const elementsToShow = ["platform1"];
                    elementsToShow.forEach(element => cc.find(`Canvas/${element}`).active = true);
                    const elementsToHide = ["white1"];
                    elementsToHide.forEach(element => cc.find(`Canvas/${element}`).active = false);
                }
            }
        }
    }
}
