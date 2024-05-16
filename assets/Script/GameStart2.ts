const {ccclass, property} = cc._decorator;

@ccclass
export default class GameStart2 extends cc.Component {
    // Method triggered when the script or the object containing the script is loaded
    onLoad() {}

    // Method triggered at the start of the script
    start() {
        // Schedule a function to be executed after a delay
        this.schedule(function() {
            // Load the Stage1 scene after a delay of 2 seconds
            cc.director.loadScene("Stage2");
        }, 2);
    }
}
