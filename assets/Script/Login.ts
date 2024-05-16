const { ccclass, property } = cc._decorator;

@ccclass
export default class Login extends cc.Component {

    start() {
        // Initialize different buttons
        this.initButton("Login", "login");
        this.initButton("GoogleLogin", "loginWithGoogle");
        this.initButton("Back", "backToMenu");
    }
    
    // This function adds an event handler to a button
    initButton(buttonName, handlerName) {
        let clickEventHandler = new cc.Component.EventHandler();
        clickEventHandler.target = this.node; // This refers to the component where the event handler is being added
        clickEventHandler.component = "Login"; // The name of the component script
        clickEventHandler.handler = handlerName; // The function to run when the event is triggered
    
        // Add the created event handler to the button's click events list
        cc.find(`Canvas/menu_bg/orange/${buttonName}`).getComponent(cc.Button).clickEvents.push(clickEventHandler);
    }
    
    // This function logs in a user using their email and password
    login() {
        // Retrieve email and password from EditBox components
        // email
        var email = cc.find("Canvas/menu_bg/orange/Email").getComponent(cc.EditBox).string;
        // password
        var password = cc.find("Canvas/menu_bg/orange/Password").getComponent(cc.EditBox).string;
        
        // Attempt to sign in with the provided email and password
        firebase.auth().signInWithEmailAndPassword(email, password).then(() => {
            alert("Successfully Signed In!");
            // Load the StartMenu scene upon successful sign-in
            cc.director.loadScene("StartMenu");
        }).catch(error => {
            // Display an error message if sign-in fails
            alert(error.message);
        });
    }

    // This function logs in a user using Google authentication
    loginWithGoogle() {
        // Initialize a Google Auth Provider
        var provider = new firebase.auth.GoogleAuthProvider();
        
        // Attempt to sign in using Google authentication
        firebase.auth().signInWithPopup(provider).then((result) => {
            // Extract user information from the sign-in result
            var user = result.user;
            var username = user.displayName;
            var email = user.email;
    
            // Check if user data already exists in the database
            firebase.database().ref('users/' + email.split(".").join("_").replace(/@/g, "_")).once('value', snapshot => {
                if (snapshot.exists()) {
                    // If user data already exists, just log in
                    alert("Successfully Signed In with Google!");
                    cc.director.loadScene("StartMenu");
                } else {
                    // If user data does not exist, save it
                    firebase.database().ref('rank/' + username).set({score: 0});
                    firebase.database().ref('users/' + email.split(".").join("_").replace(/@/g, "_")).set({
                        name: username, email: email,       // user info               
                        life: 5, coin: 0, score: 0,         // score
                    }).then(() => {                         // success
                        alert("Successfully Signed Up with Google!");
                        cc.director.loadScene("StartMenu");
                    }).catch(error => {
                        alert(error.message);
                    });
                }
            });
        }).catch((error) => {
            alert(error.message);
        });
    }

    // This function returns the user to the main menu
    backToMenu() {
        cc.director.loadScene("Menu");
    }
}
