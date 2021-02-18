var fs = require("fs"),
    path = require("path"),
    moduleFolderPath = path.join(__dirname, '../Modules/'),
    ModuleClass = require('./module'),
    moduleHelper = require('../Modules/moduleHelper'),
    botContainer = require('../bots/controller')


class ModulesController {
    constructor(){
        this.loaded = false;
        this.modules = [];
        this.lastUsedId = -1;
        fs.readdirSync(moduleFolderPath).forEach(function(file) {
            var currentModulePath = path.join(moduleFolderPath, file);
            if(fs.statSync(currentModulePath).isDirectory()){
                this.modules.push(new ModuleClass(currentModulePath, ++this.lastUsedId));
            }
        }.bind(this));
        console.log(this.modules.length);
        this.loaded = true;
    }
    GetModuls() {
        var modulesList = [];
        for (let i = 0; i < this.modules.length; i++) {
            const element = this.modules[i];
            modulesList.push(element.GetInfo());
        }
        return modulesList;
    }
    GetModule(moduleId){
        for (let i = 0; i < this.modules.length; i++) {
            const element = this.modules[i];
            if(element.id == moduleId){
                return element;
            }
        }
        return null;
    }
    async GetModuleFields(moduleId, bots){
     
        if(moduleId && bots && Array.isArray(bots) && bots.length > 0){
            var module = this.GetModule(moduleId);
            if(module == null){
                return {status: false, message: "The module do not exits"};
            }
            if(module.mode == moduleHelper.mode.sinkel && bots.length > 1){
                return {status: false, message: "The module only allow one account"};
            }
            var botObjects = botContainer.FindBots(bots);
            if(botObjects == null){
                return {status: false, message: "One or more of the bots, selected do not extist"} ;
            }
            // all is good we can start finding the fields. 
            var moduleFieldsAndPreObject = await module.GetFieldsAndPreModuleObject(botObjects);
            if(moduleFieldsAndPreObject == null){
                return {status: false, message: "somefint went wrong in the module"} ;
            }
            return {status: true, data: moduleFieldsAndPreObject}

        }else{
            return {status: false, message: "Select a module and a/some account"};
        }
    }
    async RunModule(moduleId, bots, objToModule){
        if(moduleId && bots && Array.isArray(bots) && bots.length > 0){
            var module = this.GetModule(moduleId);
            if(module == null){
                return {status: false, message: "The module do not exits"};
            }
            if(module.mode == moduleHelper.mode.sinkel && bots.length > 1){
                return {status: false, message: "The module only allow one account"};
            }
            var botObjects = botContainer.FindBots(bots);
            if(botObjects == null){
                return {status: false, message: "One or more of the bots, selected do not extist"} ;
            } 
            var moduleRunStatus = await module.RunModule(botObjects, objToModule);
            if(moduleRunStatus == null){
                return {status: false, message: "somefint went wrong in the module, and did not run a any account"} ;
            }
            if(moduleRunStatus.passed){
                return {status: true}
            }else{
                return {status: false, message: moduleRunStatus.message}
            }

        }else{
            return {status: false, message: "Select a module and a/some account"};
        }
    }
}

var controller = new ModulesController();
module.exports = controller;