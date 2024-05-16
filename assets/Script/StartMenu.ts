// Import cocos creator decorator
const {ccclass, property} = cc._decorator;

// Apply the ccclass decorator to StartMenu class
@ccclass
export default class StartMenu extends cc.Component {
    // Define the background music property
    @property({type:cc.AudioClip})
    bgm: cc.AudioClip = null;

    // The start method is called before the first frame update
    start() {
        // Initialize the game
        this.playBGM();
        this.initInformation();
        this.initButtons();
    }

    // Play the background music
    playBGM(){
        cc.audioEngine.playMusic(this.bgm, true);
    }

    // Stop the background music
    stopBGM(){
        cc.audioEngine.pauseMusic();
    }

    // Initialize the game information from firebase
    initInformation() {
        // Retrieve user data from Firebase
        firebase.auth().onAuthStateChanged((user) => {
            // If user is authenticated
            if (user) {
                var email = user.email.split(".").join("_").replace(/@/g, "_");
    
                // Fetch user data from Firebase
                firebase.database().ref('users/' + email).once('value').then(snapshot => {
                    // Display user data on the UI
                    // username
                    cc.find("Canvas/menu_bg/username").getComponent(cc.Label).string = snapshot.val().name;
                    // lifenum
                    cc.find("Canvas/menu_bg/lifeNum").getComponent(cc.Label).string = snapshot.val().life;
                    // coinnum
                    cc.find("Canvas/menu_bg/coinNum").getComponent(cc.Label).string = snapshot.val().coin;
                    // scorenum
                    cc.find("Canvas/menu_bg/scoreNum").getComponent(cc.Label).string = (Array(7).join("0") + snapshot.val().score).slice(-7);
                });
            }
            else {
                // If user is not authenticated, load the Menu scene
                cc.director.loadScene("Menu");
            }
        });
    }

    // Initialize the button events
    initButtons() {
        this.initRankButton();
        this.initButtonEvent("Canvas/menu_bg/rank", "rank");
        this.initButtonEvent("Canvas/menu_bg/question", "question");
        this.initButtonEvent("Canvas/menu_bg/Start", "selectstage");
    }

    // Initialize button event helper
    initButtonEvent(buttonPath, handler) {
        ////////////////////////////////
        let clickEventHandler = new cc.Component.EventHandler();   
        //create event handler
        clickEventHandler.target = this.node;
        clickEventHandler.component = "StartMenu";
        // handler
        clickEventHandler.handler = handler;

        cc.find(buttonPath).getComponent(cc.Button).clickEvents.push(clickEventHandler);
    }

    // Initialize the Rank button
    initRankButton() {
        // Retrieve the scores from the Firebase database, ordered by score
        firebase.database().ref('rank/').orderByChild("score").once("value", function (snapshot) {
            // set variables
            var user = [];
            var score = [];

            // For each item in the snapshot, push the key (user) and score to respective arrays
            snapshot.forEach(function (item) {
                user.push(item.key);score.push(item.val().score);
            })

            // Reverse the order of the users and scores so highest is first
            user.reverse();score.reverse(); 

            // For the top 10 (or less if there are less than 10 users), set the rank, user, and score in the UI
            for (var i = 1; i <= 10 && i <= user.length; i++) {
                cc.find("Canvas/menu_bg/rank_text/"+String(i)).getComponent(cc.Label).string = String(i);         
                // 
                cc.find("Canvas/menu_bg/rank_text/user"+String(i)).getComponent(cc.Label).string = user[i-1];     
                // user
                cc.find("Canvas/menu_bg/rank_text/score"+String(i)).getComponent(cc.Label).string = score[i-1];   
                // score
            }
        });
    }
    

    // Display or hide the rank text
    rank() {
        cc.find("Canvas/menu_bg/rank_text").active = !cc.find("Canvas/menu_bg/rank_text").active;
    }

    // Display or hide the question text
    question() {
        cc.find("Canvas/menu_bg/question_text").active = !cc.find("Canvas/menu_bg/question_text").active;
    }

    // Load the SelectStage1 scene
    selectstage() {
        this.stopBGM();
        cc.director.loadScene("SelectStage1");
    }
}
