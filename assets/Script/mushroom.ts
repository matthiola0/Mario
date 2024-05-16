const {ccclass, property} = cc._decorator;

@ccclass
export default class mushroom extends cc.Component {
    private speed: number = -100; // Define the initial speed of the mushroom

    // This method is called once when the script or component is loaded
    onLoad() {
        // Enable physics for the mushroom using the physics manager
        cc.director.getPhysicsManager().enabled = true;
    }

    start() {
        // The start function is called before the first frame update
    }

    // The update method is called every frame
    update(dt) {
        // Move the mushroom node horizontally by the defined speed and the change in time
        this.node.x += this.speed * dt;

        // Calculate the difference in Y position between the mushroom and the main camera
        var Y = this.node.y - cc.find("Canvas/Main Camera").y;
        // If the mushroom node is off the screen (below -320), destroy the node
        if(Y < -320)
            this.node.destroy();
    }

    // This method is called when the collider attached to the mushroom comes into contact with another collider
    onBeginContact(contact, self, other) {
        // If the other collider is tagged as ground (0) or block (1)
        if(other.tag == 0 || other.tag == 1) {
            // Log the normal vector at the point of contact
            cc.log(contact.getWorldManifold().normal);
            // If the contact is from the right (normal vector is to the left)
            if(contact.getWorldManifold().normal.x == -1)
                if(contact.getWorldManifold().normal.y == -0) {
                    // Flip the mushroom horizontally
                    this.node.scaleX = -3;
                    // Change the direction of movement to the right
                    this.speed = 100;
                }
            // If the contact is from the left (normal vector is to the right)
            else if(contact.getWorldManifold().normal.x == 1)
                if(contact.getWorldManifold().normal.y == -0) {
                    // Flip the mushroom horizontally
                    this.node.scaleX = 3;
                    // Change the direction of movement to the left
                    this.speed = -100;
                }
        }
    }
}
