var fs = require("fs"),
    path = require("path");
class Module {
    constructor(folder, id) {
        this.id = id;
        this.folder = folder;
        this.valid = false;
        this.validStage = 0; // if this is -1 then all was loaded as it shoud
        var packageFilePath = path.join(this.folder, 'package.json');
        if(fs.existsSync(packageFilePath)){
            try {
                const packageData = fs.readFileSync(packageFilePath, { encoding:'utf8', flag:'r' });
                this.packageData = JSON.parse(packageData);
                this.validStage = 1;
                if(
                    'name' in this.packageData && 
                    'version' in this.packageData && 
                    'description' in this.packageData && 
                    'main' in this.packageData
                    ){
                        this.LoadeNodeModuleForModule();
                        var mainFilePath = path.join(this.folder, this.packageData.main);
                        if(fs.existsSync(mainFilePath)){
                            this.mainFileName = this.packageData.main;
                            this.mainFilePath = mainFilePath;
                            this.name = this.packageData.name;
                            this.version = this.packageData.version;
                            this.description = this.packageData.description;
                            this.WillPlaygame = this.packageData.WillPlaygame || false; // if the module will starte playing a game
                            this.repoId = this.packageData.repoId || null; // if the module is from the office module list, the we bind them whit the repoId

                            this.module = require(this.mainFilePath);
                            if(
                                'Mode' in this.module && 
                                'Execute' in this.module
                            ){
                                this.mode = this.module.Mode;
                                this.validStage = -1;
                                //load module into 
                                this.valid = true;
                            }
                        }
                    }else{
                        console.log(`missing mandatory proppertys in package.json in '${packageFilePath}'`);
                    }


            } catch (error) {
                console.log(`error get module '${packageFilePath}' package.json file. and converting it to json`)
            }
        }
    }
    GetInfo(){
        return {
            id: this.id,
            name: this.name, 
            version: this.version,
            description: this.description,
            validStage: this.validStage,
            valid: this.valid,
            mode: this.mode
        }
    }
    //load module
    // we only load if the module have dependencies, if not then it can only use what i is giving
    LoadeNodeModuleForModule(){
        if(this.packageData != null && 'dependencies' in this.packageData && Object.keys(this.packageData.dependencies).length > 0){
            if(!fs.existsSync(path.join(this.folder, 'node_modules'))){
                console.log(`TODO: download modules for module`)

            }else{
                console.log(`allready downloaded modules for module '${packageFilePath}'`)
            }
        }
    }
    async GetFieldsAndPreModuleObject(bots){
        if(bots.length > 0){
            var fields = this.module.fields;
            var preObj = {};
            //if the module do not have a "BeforeShowUserField" function then, there is no pre data, to fill the form in the web
            if(this.module.hasOwnProperty('BeforeShowUserField')){
                var firstBot = bots[0];
                // if it is null, then somefing went wrong in the module
                preObj = await firstBot.RunAsPreModule(this.module.BeforeShowUserField);
                if(preObj == null){
                    return null;
                }
            }
            //we convert the preObj to string, to send to front end
            return { fields: fields, preObj: JSON.stringify(preObj) }
        }else{
            return null;
        }
    }
    async RunModule(bots, objToModule){
        if(bots.length > 0 && this.module.hasOwnProperty('Execute')){
            var returnMessage = "";
            var allPassed = true;
            for (let i = 0; i < bots.length; i++) {
                const bot = bots[i];
                var status = await bot.RunModule(this.module.Execute, objToModule);
                if(status){
                    returnMessage += bot.loginName + ": passed!\n";
                }else{
                    allPassed = false;
                    returnMessage += bot.loginName + ": Error!\n";
                }
            }
            return { passed: allPassed, message: returnMessage }
        }else{
            return null;
        }
    }
}

module.exports = Module;