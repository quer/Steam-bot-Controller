class Node {
    constructor(node){
        this.Node = node;
        if(this.TestNodeIsValid()){
            this.valid = true;
        }else{
            console.log(this.Node.Name+" Error loading!");
        }
    }
    BuildForWebPanel(){
        var returnObj = null;
        if(this.valid){
            returnObj = {};
            returnObj.Name = this.Node.Name;
            returnObj.UniqId = this.Node.UniqId;

            if('width' in this.Node){
                returnObj.Width = this.node.Width;
            }
            if('Output' in this.Node){
                returnObj.Output = [];
                for (let i = 0; i < this.Node.Output.length; i++) {
                    const output = this.Node.Output[i];
                    var webObj = {
                        "UniqId": returnObj.UniqId + "_O_" + i,
                        "Type": output.Type,
                        "Text": output.Text
                    }

                    returnObj.Output.push(webObj);
                }
            }
            if('Input' in this.Node){
                returnObj.Input = [];
                for (let i = 0; i < this.Node.Input.length; i++) {
                    const input = this.Node.Input[i];
                    var webObj = {
                        "UniqId": returnObj.UniqId + "_I_" + i,
                        "Type": input.Type,
                        "Text": input.Text
                    }
                    if('Mandatory' in input){
                        webObj.Mandatory = input.Mandatory;
                    }
                    returnObj.Input.push(webObj);
                }
            }
            
        }
        return returnObj;
    }
    TestNodeIsValid(){
        const node = this.Node;
        if(
            ('UniqId' in node === false) ||
            ('Name' in node === false) ||
            ('Execute' in node === false)
        ){
            return false;
        }
        if('Output' in node){
            for (let ii = 0; ii < node.Output.length; ii++) {
                const output = node.Output[ii];
                if(
                    ('Text' in output === false) ||
                    ('Type' in output === false)
                ){
                    return false;
                }
            }
        }
        
        if('Input' in node){
            for (let ii = 0; ii < node.Input.length; ii++) {
                const input = node.Input[ii];
                if(
                    ('Text' in input === false) ||
                    ('Type' in input === false)
                ){
                    return false;
                }
            }
        }
            // need more checks
        
        return true;
    }
}
module.exports = Node;