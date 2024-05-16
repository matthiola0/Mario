const {ccclass, property} = cc._decorator;
////////////////////////////////
@ccclass
export default class Menu extends cc.Component {
    // bgm
    @property({type:cc.AudioClip})
    bgm: cc.AudioClip = null;

    // Function that runs when the component first loads
    start() {
        // Play the background music and initialize the buttons
        this.playBGM();
        this.initButton("Login", "login");
        this.initButton("Signup", "signup");
    }

    // Function to play the background music
    playBGM(){
        cc.audioEngine.playMusic(this.bgm, true);
    }

    // Function to stop the background music
    stopBGM(){
        cc.audioEngine.pauseMusic();
    }

    // Function to initialize a button with a given name and handler
    initButton(buttonName, handlerName) {
        let clickEventHandler = new cc.Component.EventHandler();
        clickEventHandler.target = this.node; // This refers to the component where the event handler is being added
        clickEventHandler.component = "Menu"; // The name of the component script
        clickEventHandler.handler = handlerName; // The function to run when the event is triggered

        // Add the created event handler to the button's click events list
        cc.find(`Canvas/menu_bg/${buttonName}`).getComponent(cc.Button).clickEvents.push(clickEventHandler);
    }

    // Function to load the Login scene
    login() {
        cc.director.loadScene("Login");
    }

    // Function to load the Signup scene
    signup() {
        cc.director.loadScene("Signup");
    }
}
