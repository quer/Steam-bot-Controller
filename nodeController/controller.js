var fs = require("fs"),
    path = require("path"),
    Node = require("./node"),
    StandardNodeFolderPath = path.join(__dirname, '../nodeStandardModules/');


class NodeController {
    constructor(){
        this.loaded = false;
        this.Nodes = [];
        fs.readdirSync(StandardNodeFolderPath).forEach(function(file) {
            var currentStandardNodePath = path.join(StandardNodeFolderPath, file);
            if(!fs.statSync(currentStandardNodePath).isDirectory()){
                var loadedNodes = require(currentStandardNodePath);
                for (let i = 0; i < loadedNodes.length; i++) {
                    const node = loadedNodes[i];
                    this.Nodes.push(new Node(node));
                }
            }
        }.bind(this));
        this.loaded = true;
    }
    
    //for web
    GetNodes() {
        var nodeList = [];
        for (let i = 0; i < this.Nodes.length; i++) {
            const node = this.Nodes[i];
            var webObj = node.BuildForWebPanel();
            if(webObj != null){
                nodeList.push(webObj)
            }
        }
        return {
            Moduler: nodeList,
            Load: '{"boxes":[{"UniqId":"testxx","RealId":1,"x":"686px","y":"344px","fields":[]},{"UniqId":"testx","RealId":4,"x":"314px","y":"173px","fields":[]}],"connection":[{"FromID":"testx_O_0","FromRealId":4,"ToID":"testxx_I_0","ToRealId":1}]}'
        };
    }
}
var controller = new NodeController();
module.exports = controller;