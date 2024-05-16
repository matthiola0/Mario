const {ccclass, property} = cc._decorator;

@ccclass
export default class GameOver extends cc.Component {
    onLoad() {}
    start() {
        this.scheduleOnce(function() {
            // 死亡回到第一關
            cc.director.loadScene("SelectStage1");  
            // cc.director.loadScene("StartMenu"); 
        }, 5);
    }
}
