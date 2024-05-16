// Import decorator from cocos creator module
const {ccclass, property} = cc._decorator;

// Apply ccclass decorator to QuestionBox class
@ccclass
export default class QuestionBox extends cc.Component {

    // onLoad is called when the script instance is loading
    onLoad() {
        // Enable the physics manager in cocos creator
        cc.director.getPhysicsManager().enabled = true;
    }

    // start is called before the first frame update
    start() {
        // Initialize any variables or states here
    }

    // update is called for every frame update, with dt (deltaTime) as the time in seconds it took to complete the last frame
    update(dt) {
        // Use for actions that need to be done every frame
    }
}
