import Player from "./Player";

const {ccclass, property} = cc._decorator;

@ccclass
export default class Enemy extends cc.Component {
    // 敵人的速度
    private enemySpeed: number = -100;
    // 判斷敵人是否死亡
    private die: boolean = false;
    // 龜的狀態 (1: 移動，2: 收縮，3: 收縮移動)
    private turtle_state: number = 1;
    // animation
    private anim = null;
    // player
    @property(Player)
    player: Player = null;

    onLoad() {
        // cc.director.getPhysicsManager().enabled = true;
        // this.anim = this.getComponent(cc.Animation);   	
        cc.director.getPhysicsManager().enabled = true;
        //cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        // cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this);
        this.anim = this.getComponent(cc.Animation);
    }

    start() {
        // 如果節點名稱為Goomba，則每0.1秒讓其在X軸上縮放-1，以產生左右移動的視覺效果
        if(this.node.name == "Goomba") {
            this.schedule(function() { 
                this.node.scaleX *= -1;
            }, 0.1);
        }
    }

    update(dt) {
        // 當龜不在收縮狀態，敵人未死亡，玩家未死亡，遊戲未暫停，節點的x位置不等於300時，敵人移動
        if(!(this.turtle_state == 2) && !this.die && !this.player.isDead && !this.player.isPause) {
            if(this.node.x != 300 && this.node.x - cc.find("Canvas/Main Camera").x < 800) {
                this.node.x += this.enemySpeed*dt;
            }
        }
        // 當龜在收縮移動狀態時，若節點超出攝影機視野則銷毀該節點
        if(this.turtle_state == 3) {
            var X = this.node.x - cc.find("Canvas/Main Camera").x;
            var Y = this.node.y - cc.find("Canvas/Main Camera").y;
            if(X > 480 || X < -480 || Y > 320 || Y < -320) {
                this.node.destroy();
            }
        }
    }

    // contact
    onBeginContact(contact, self, other) {
        switch (other.tag) {
            // ground & block & some platforms
            case 0:
            case 1:
                if (contact.getWorldManifold().normal.x == -1) {         //right bound
                    if (contact.getWorldManifold().normal.y == -0) {
                        this.enemySpeed *= -1;
                        this.node.scaleX = -2;
                    }
                }
                else if (contact.getWorldManifold().normal.x == 1) {      //left bound
                    if (contact.getWorldManifold().normal.y == -0) {
                        this.enemySpeed *= -1;
                        this.node.scaleX = 2;
                    }
                }
                break;
    
            // player
            case 10:
                if(this.player.isDead || this.player.isStrong || this.die) {
                    contact.disabled = true;
                    break;
                }
    
                switch(this.node.name) {
                    case "Goomba": //goomba
                        if(contact.getWorldManifold().normal.x == 0) {
                            if (contact.getWorldManifold().normal.y == 1) {
                                this.die = true;
                                this.anim.play("goomba_die");
                                this.player.stompEnemy_100(self);
                            } 
                            else 
                                this.player.decrease();
                        }
                        else 
                            this.player.decrease();
                        break;
    
                    default: //turtle
                        switch(this.turtle_state) {
                            case 1: // move
                                if (contact.getWorldManifold().normal.x == 0) {
                                    if (contact.getWorldManifold().normal.y == 1) {
                                        this.turtle_state = 2;
                                        this.anim.play("turtle_shrink");
                                        // player effect
                                        this.player.stompEnemy_100(self);
                                    } 
                                    else
                                        this.player.decrease();
                                }
                                else
                                    this.player.decrease();
                                break;
    
                            case 2: // shrink
                                if(self.node.x <= other.node.x) { 
                                    // kick - left move
                                    this.turtle_state = 3;
                                    this.enemySpeed = -300;
                                    this.anim.play("turtle_shrink_move");
                                    // player effect
                                    this.player.playEffect(this.player.kickSound);
                                    this.player.jump();
                                    // this.anim.play("turtle_shrink_move");
                                } 
                                else if(self.node.x > other.node.x) { 
                                    // kick - right move
                                    this.turtle_state = 3;
                                    this.enemySpeed = 300;
                                    this.anim.play("turtle_shrink_move");
                                    // player effect
                                    this.player.playEffect(this.player.kickSound);
                                    this.player.jump();
                                }
                                break;
    
                            case 3: // shrink_move
                                if (contact.getWorldManifold().normal.x == 0) {
                                    if (contact.getWorldManifold().normal.y == 1) {
                                        // state change
                                        this.turtle_state = 2;
                                        this.anim.play("turtle_shrink");
                                        // player effect
                                        this.player.jump();
                                    }
                                    else {
                                        this.player.decrease();
                                    }
                                }
                                else {
                                    this.player.decrease();
                                }
                                break;
                        }
                        break;
                }
                break;
            // other cases
            case 4:
            case 5:
                if(this.turtle_state == 3) {
                    this.player.enemyDie_100(other);
                    other.node.destroy();
                } 
                else {
                    contact.disabled = true;
                }
                break;
    
            default:
                if(other.tag != 3) {
                    contact.disabled = true;
                }
                break;
        }
    }
    
    onEndContact(contact, self, other){}

    onPreSolve(contact, selfCollider, otherCollider) {}

    onPostSolve(contact, selfCollider, otherCollider) {}
}
