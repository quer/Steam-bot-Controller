var Storage = require('../storage/controller')
var Bot = require('./bot')
class BotController {
    constructor(){
        this.loaded = false;
        this.clients = [];

        var allBots = Storage.Bots.GetAll();
        console.log(allBots.length);
        var startBotPromises = [];
        for (let i = 0; i < allBots.length; i++) {
            var botData = allBots[i];
            var bot = new Bot(botData);
            this.clients.push(bot);
            if(botData.startSystemStart)
                startBotPromises.push(bot.startBot());
        }
        Promise.all(startBotPromises).then((values) => {
            console.log(values);
            this.loaded = true;
        });
    }
    addBot(loginName, password, sharedSecret, startWhenSystemStartRestart, restartOnConnectionFail)
    {
        return new Promise(async function (resolve, reject) {
            var theNewBot = new Bot({ 
                loginName: loginName, 
                password: password, // add encode and decode key.  
                sharedSecret: sharedSecret,
                startSystemStart: startWhenSystemStartRestart,
                startOnConnectionFail: restartOnConnectionFail
            });
            try {
                var botstatus = await theNewBot.startBot();
                if(botstatus){
                    this.clients.push(theNewBot);
                    Storage.Bots.Add(loginName, password, sharedSecret, startWhenSystemStartRestart, restartOnConnectionFail);
                    try {
                        await this.updateBotInfo(loginName)
                        resolve();
                    } catch (error) {
                        resolve({massage: "account is valid, but was not able to get account info", error: error});                    
                    }
                }else{
                    reject("was not able to log in");
                }
            } catch (errorFromLogin) {
                reject(errorFromLogin);
            }
        }.bind(this));
    }
    updateBotInfo(loginName){
        return new Promise(async function (resolve, reject) {
            var bot = this.FindBot(loginName);
            if(bot != null){
                var info = null;
                try {
                    info = await bot.GetAccountInfo();
                } catch (error) {
                    reject(error);
                }
                Storage.Bots.SetAccount(loginName, info);
                bot.accountinfo = info;
                resolve();
            }else{
                reject("Account do not exist");
            }
        }.bind(this));
    }
    RemoveBot(loginName){
        var bot = this.FindBot(loginName);
        if(bot != null)
        {
            bot.stopBot();
            var index = this.FindBotIndex(loginName);
            this.clients.splice(index, 1);
            Storage.Bots.RemoveBot(loginName);
        }
    }
    async StartBot(loginName){
        var bot = this.FindBot(loginName);
        if(bot != null)
        {
            try {
                await bot.startBot();
                return true;
            } catch (error) {
                return false;
            }
        }
    }
    StopBot(loginName) {
        var bot = this.FindBot(loginName);
        if(bot != null)
        {
            bot.stopBot();
        }
    }
    editBot(loginName, tartWhenSystemStartRestart, restartOnConnectionFail){
        var bot = this.FindBot(loginName);
        if(bot != null)
        {
            var botData = Storage.Bots.ChanceBotSetting(loginName, { 
                startSystemStart: tartWhenSystemStartRestart,
                startOnConnectionFail: restartOnConnectionFail
            });
            bot.updateBotData(botData);
        }
    }
    FindBot(loginName){
        for (let index = 0; index < this.clients.length; index++) {
            const bot = this.clients[index];
            if(bot.loginName == loginName){
                return bot;
            }
        }
        return null;
    }
    FindBotIndex(loginName){
        for (let index = 0; index < this.clients.length; index++) {
            const bot = this.clients[index];
            if(bot.loginName == loginName){
                return index;
            }
        }
        return null;
    }
    //need check that personaState is valid
    SetBotPersonaState(loginName, personaState){
        var bot = this.FindBot(loginName);
        if(bot != null)
        {
            var botData = Storage.Bots.ChanceBotSetting(loginName, { 
                personastate: personaState
            });
            bot.updateBotData(botData);
            bot.SetPersonaState();
        }
    }
}
var Bots = new BotController();
module.exports = Bots;