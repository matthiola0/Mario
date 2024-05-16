import Player from "./Player";

const {ccclass, property} = cc._decorator;

@ccclass
export default class Enemy extends cc.Component {
    // Boolean variable to control scheduling
    private isSchedule: boolean = false;

    // Player property from Player script
    @property(Player)
    player: Player = null;

    // Method triggered when the script or the object containing the script is loaded
    onLoad() {
        // Enable physics manager
        cc.director.getPhysicsManager().enabled = true;
    }

    // Method triggered at the start of the script
    start() {
    }

    // Update method called every frame
    update(dt) {
        // If player is dead, stop all animations and actions
        if(this.player.isDead == true) {
            var anim = this.getComponent(cc.Animation);
            // stop all
            anim.pause();
            this.node.stopAllActions();
            return;
        }

        // If not scheduled and enemy is within a certain range from the camera
        if(!this.isSchedule && this.node.x - cc.find("Canvas/Main Camera").x < 600) {
            // Set schedule to true
            this.isSchedule = true;
            // Schedule a sequence of actions to be performed every 6 seconds
            this.schedule(function() {
                // Action sequence: move up by 40 units in 1.5 seconds, wait for 1 second, then move down by 40 units in 1.5 seconds
                let action = cc.sequence(cc.moveBy(1.5, 0, 40), //
                                        cc.delayTime(1),        //
                                        cc.moveBy(1.5, 0, -40));//
                // Run the action on the enemy node
                this.node.runAction(action);
            }, 6);
        }
    }
}
