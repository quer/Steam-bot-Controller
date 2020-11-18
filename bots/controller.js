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
                var accountApiKey = null;
                var games = null;
                try {
                    accountApiKey = await bot.GetAccountApiKey();
                    info = await bot.GetAccountInfo(accountApiKey);
                    games = await bot.GetGamesOwned(accountApiKey)
                } catch (error) {
                    reject(error);
                }
                Storage.Bots.SetAccountDetails(loginName, {
                    accountInfo: info,
                    games: games,
                    apiKey: accountApiKey
                });
                bot.RefreshData();
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
    // idle part
    AddIdleBot(loginName, theList){
        //list format : [{ game_id: "730" }]
        var list = [];
        for (let i = 0; i < theList.length; i++) {
            const appInList = theList[i];
            list.push({ game_id: appInList });
        }

        Storage.IdleBots.SetBot(loginName, list);
        var bot = this.FindBot(loginName);
        if(bot != null){
            bot.StartIdleGames(list);
        }
    }
    StopIdleBot(loginName){
        var theEmptyIdleList = [];
        Storage.IdleBots.SetBot(loginName, theEmptyIdleList);
        var bot = this.FindBot(loginName);
        if(bot != null){
            bot.StartIdleGames(theEmptyIdleList);
        }
    }
    IdleListToClient(){
        var list = [];
        for (let i = 0; i < this.clients.length; i++) {
            const bot = this.clients[i];
            var botClient = bot.GetForClient();


            botClient.idleList = this.GetIdleGamesForBot(bot.loginName);
            list.push(botClient);
        }
        return list;
    }
    GetIdleGamesForBot(loginName){
        var returnList = [];
        var activeList = Storage.IdleBots.GetBot(loginName);
        if(activeList != null){
            var botGames = Storage.IdleBots.GetBotGames(loginName);
            for (let i = 0; i < activeList.length; i++) {
                const idleApp = activeList[i];
                for (let ii = 0; ii < botGames.length; ii++) {
                    const botGame = botGames[ii];
                    if(botGame.appid == idleApp.game_id){
                        returnList.push({appid: idleApp.game_id, name: botGame.name, playtime: botGame.playtime_forever});
                        break;
                    }
                }
            }
        }
        return returnList;
    }
    GetBotIdleGameList(loginName){
        var returnList = [];
        var botGames = Storage.IdleBots.GetBotGames(loginName);
        for (let i = 0; i < botGames.length; i++) {
            const game = botGames[i];
            returnList.push({appid: game.appid, name: game.name});
        }
        return returnList;
    }
}
var Bots = new BotController();
module.exports = Bots;