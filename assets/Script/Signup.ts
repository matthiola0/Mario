const { ccclass, property } = cc._decorator;

@ccclass
export default class Signup extends cc.Component {

  // This function runs when the component first loads
  start() {
    // Initialize the "Signup" and "Back" buttons with their respective event handlers
    this.initButton("Signup", "signup");
    this.initButton("Back", "backToMenu");
  }
  
  // This function initializes a button with a specific name and corresponding event handler
  initButton(buttonName, handlerName) {
    let clickEventHandler = new cc.Component.EventHandler();
    clickEventHandler.target = this.node; // This refers to the current node/component where the event handler is being added
    clickEventHandler.component = "Signup"; // The name of the script component
    clickEventHandler.handler = handlerName; // The function to be executed when the button is clicked

    // The event handler is added to the button's list of click events
    cc.find(`Canvas/menu_bg/orange/${buttonName}`).getComponent(cc.Button).clickEvents.push(clickEventHandler);
  }

  // This function is executed when the "Signup" button is clicked
  signup() {
    // Retrieving user inputs for username, email, and password
    // username
    var username = cc.find("Canvas/menu_bg/orange/Username").getComponent(cc.EditBox).string.toUpperCase();
    // email
    var email = cc.find("Canvas/menu_bg/orange/Email").getComponent(cc.EditBox).string;
    // password
    var password = cc.find("Canvas/menu_bg/orange/Password").getComponent(cc.EditBox).string;
    
    // Using Firebase's authentication service to create a new user account with the provided email and password
    firebase.auth().createUserWithEmailAndPassword(email, password).then(() => {
      // Upon successful account creation, initial user data is saved in the Firebase database under the 'rank' and 'users' nodes
      firebase.database().ref('rank/' + username).set({score: 0})
      firebase.database().ref('users/' + email.split(".").join("_").replace(/@/g, "_")).set({
        name: username, email: email, password: password,    // user info
        life: 5, coin: 0, score: 0,                          // score
      }).then(() => {     // success
        alert("Successfully Signed Up!");
        // If the signup process is successful, the scene transitions to the "StartMenu" scene
        cc.director.loadScene("StartMenu");
      }).catch(error => {
        // If an error occurs while saving user data, the error message is alerted
        alert(error.message);
      });
    }).catch(error => {
      // If an error occurs while creating the user account, the error message is alerted
      alert(error.message);
    });

  }

  // This function is executed when the "Back" button is clicked. It simply transitions the scene back to the "Menu" scene
  backToMenu() {
    cc.director.loadScene("Menu");
  }
}
