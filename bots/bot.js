const config = require('../config')
const Steam = require('steam');
const SteamTotp = require('steam-totp');
const SteamWebLogOn = require('steam-weblogon');
const request = require('../request');
const Storage = require('../storage/controller')
var cheerio = require('cheerio');
class Bot {
    constructor(botData) {
        
        this.callbackWhitResult = null;
        this.callbackWhitErrorResult = null;

        this.requestCommunity = null;
        this.requestStore = null;
        this.sessionID = null;
        this.steamid = null;
        this.online = false;

        this.botData = botData;
        this.accountinfo = this.botData.accountInfo ?? null;
        this.apiKey = this.botData.apiKey ?? null;
        this.games = this.botData.games ?? null;
        this.profileurl = null;
        this.avatar = null;
        this.personaname = null;

        this.loginName = botData.loginName;
        this.password = botData.password;
        this.sharedSecret = botData.sharedSecret;
        this.steamClient = new Steam.SteamClient(),
        this.steamUser = new Steam.SteamUser(this.steamClient),
        this.steamFriends = new Steam.SteamFriends(this.steamClient),
        this.steamWebLogOn = new SteamWebLogOn(this.steamClient, this.steamUser);
        
        this.logOnResponseCallback = null;

        var steamServers = Storage.Bots.GetServer();
        if(steamServers && steamServers != null){
            Steam.servers = steamServers;
        }

        this.steamClient.on('servers', function(server) {
            Storage.Bots.SetServer(server);
        });
        
        this.steamClient.on('connected', function() {
            console.log("Connected to Steam.");
            this.steamUser.logOn({
                account_name: this.loginName,
                password: this.password,
                two_factor_code: SteamTotp.getAuthCode(this.sharedSecret)
            });
        }.bind(this));

        this.steamClient.on('logOnResponse', async function onSteamLogOn(logonResp) {
            //when adding a new bot, the client want to know if the bot was able to log on and start.
            if (logonResp.eresult == Steam.EResult.OK) {
                this.SetPersonaState();
                //the bot is online! 
                console.log("bot online");
                this.loops = 0;
                this.forceRertyToLogin = false;
                this.online = true;
                this.steamid = this.steamClient.steamID;
                await this.SetWebSession();
                this.StartIdleFromStorage();
            }else{
                console.log("bot not online");
                this.online = false;
            }

            if(this.callbackWhitResult != null){
                this.callbackWhitResult(logonResp.eresult == Steam.EResult.OK);
                this.callbackWhitResult = null;
            }

        }.bind(this));

        this.steamClient.on('loggedOff', function onSteamLogOff(eresult) {
            console.log("Logged off from Steam.");
            this.online = false;
        }.bind(this));
        
        this.loops = 0;
        this.forceRertyToLogin = false;
        this.steamClient.on('error', function onSteamError(error) {
            console.log("Connection closed by server - ", error);
            var botData = Storage.Bots.GetBot(this.loginName);
            this.online = false;
            if((botData && botData.startOnConnectionFail) || this.forceRertyToLogin){
                if(this.loops < 3){
                    setTimeout(function () {
                        ++this.loops;
                        this.steamClient.connect();                    
                    }.bind(this), 3000);
                }else{
                    this.loops = 0;
                    this.forceRertyToLogin = false;
                    console.log("Have retryed 3 time to reconnect, will stop");
                    if(this.callbackWhitErrorResult != null){
                        this.callbackWhitErrorResult(error);
                        this.callbackWhitErrorResult = null;
                    }
                }
            }else{
                if(this.callbackWhitErrorResult != null){
                    this.callbackWhitErrorResult(error);
                    this.callbackWhitErrorResult = null;
                }
            }
        }.bind(this));
    }
    
    startBot(){
        return new Promise(function (resolve, reject) {
            if(!this.online){
                this.callbackWhitResult = resolve;
                this.callbackWhitErrorResult = reject;
                this.steamClient.connect();    
            }else{
                resolve();
            }
        }.bind(this));
    }
    stopBot(){
        this.steamClient.disconnect();
        this.online = false;
    }
    updateBotData(data){
        this.botData = data;
    }
    SetWebSession() {	
        return new Promise(function (resolve) {
            console.log("websession start");
            this.steamWebLogOn.webLogOn(function(sessionID, newCookie) {
                this.requestCommunity = new request('https://steamcommunity.com');
                this.requestStore = new request('https://store.steampowered.com');
                newCookie.forEach(function(name) {
                    this.requestCommunity.setCookie(name);
                    this.requestStore.setCookie(name);
                }.bind(this));
                this.sessionID = sessionID;
                resolve();
            }.bind(this));
        }.bind(this));
    }
    GetAccountInfo(accountApiKey){
        return new Promise(async function (resolve, reject) {
            if(this.requestCommunity != null){
                try {
                    if(accountApiKey != null){
                        this.requestCommunity.get({uri: "https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key="+ accountApiKey +"&steamids=" + this.steamid }, function(error, response, body) {
                            if(error){
                                reject(error);
                            }else{
                                var jsonData = JSON.parse(body)
                                console.log(jsonData);
                                var accountData = {};
                                if(jsonData && jsonData.response && jsonData.response.players && jsonData.response.players[0])
                                {
                                    accountData = jsonData.response.players[0];
                                }
                                resolve(accountData);
                            }
                        }.bind(this))
                    }else{
                        reject("ApiKey error: did not get one");
                    }
                } catch (apiKeyError) {
                    reject("ApiKey error:" + apiKeyError);
                    
                }
            }else{
                reject("web session not set");
            }
        }.bind(this));
    }
    GetAccountApiKey(){
        return new Promise(function (resolve, reject) {
            if(this.requestCommunity != null){
                this.requestCommunity.get({uri: "https://steamcommunity.com/dev/apikey" }, function(error, response, body) {
                    if(error){
                        console.log("get steam api key, error: ", error)
                        reject();
                        return;
                    }
                    var $ = cheerio.load(body);
                    if ($('#mainContents h2').text() === 'Access Denied') {
                        reject('Access Denied, the account is limited account, read more herer https://support.steampowered.com/kb_article.php?ref=3330-IAGK-7663');
                        return
                    }

                    if ($('#bodyContents_ex h2').text() === 'Your Steam Web API Key') {
                        var key = $('#bodyContents_ex p')
                            .eq(0)
                            .text()
                            .split(' ')[1];
                        resolve(key);
                        return
                    }


                    // acount do not have a key
                    this.requestCommunity.post({
                        url: "https://steamcommunity.com/dev/registerkey",
                        form:{
                            domain: this.loginName,
                            agreeToTerms: 'agreed',
                            sessionid: this.sessionID,
                            submit: 'Register'
                        }
                    }, function(error, response, body){
                        var recurveCall = this.GetOrSetAccountApiKey();
                        recurveCall.then(resolve);
                    }.bind(this))
                    
                }.bind(this));
            }
        }.bind(this));
    }
    GetGamesOwned(apiKey){
        return new Promise(function (resolve, reject) {
            if(this.requestCommunity != null){
                this.requestCommunity.get({uri: "https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?key="+ apiKey +"&steamid=" + this.steamid + "&include_appinfo=true" }, function(error, response, body) {
                    if(error){
                        reject("error fetch games "+ error);
                        return;
                    }else{
                        try {
                            var jsonData = JSON.parse(body);
                            resolve(jsonData.response.games);
                            return;
                        } catch (error) {
                            reject("fetch games", error);
                            return;
                        }
                    }
                });
            }
        }.bind(this));
    }
    GetForClient(){
        return {...this.botData.accountInfo,
            startOnConnectionFail: this.botData.startOnConnectionFail,
            startSystemStart: this.botData.startSystemStart,
            online: this.online,
            personastate: {
                id: this.botData.personastate,
                name: Object.keys(Steam.EPersonaState).find(key => Steam.EPersonaState[key] === this.botData.personastate),
            },
            steamid: this.steamid,
            loginName: this.loginName
        }
    }
    SetPersonaState(){
        this.steamFriends.setPersonaState(this.botData.personastate);
    }
    StartIdleGames(idleList){
        
        this.steamUser.gamesPlayed(idleList);
    }
    RefreshData(){
        var botdata = Storage.Bots.GetBot(this.loginName);
        this.botData = botdata;
        this.accountinfo = this.botData.accountInfo ?? null;
        this.apiKey = this.botData.apiKey ?? null;
        this.games = this.botData.games ?? null;
    }
    StartIdleFromStorage(){
        var idleList = Storage.IdleBots.GetBot(this.loginName);
        if(idleList != null )
        {
            this.StartIdleGames(idleList);
        }
    }

    /** module part */
    GetModuleOptionsObj(){
        return {
            UserName: this.loginName,
            steamUser: this.steamUser,
            steamFriends: this.steamFriends,
            accountPretty: this.steamClient.steamID + " - " + this.loginName + ":"
        };
    }
    async RunAsPreModule(ModuleCallBack){
        try {
            var didStartBot = false;
            //we need to besure to start the bot, to get the session and cookies for the requests.
            if(!this.online){
                didStartBot = true;
                this.forceRertyToLogin = true;
                var didStart = await this.startBot(); // will create session and cookies, when it conneded
                console.log(didStart);
            }else{
                await this.SetWebSession(); // ensure the web session has not expired
            }
            //if the bot is not online, here, then somefing have gone wrong. then abande premodule
            if(!this.online)
            {
                return null;
            }
            var preObject = await ModuleCallBack(this.steamClient, this.requestCommunity, this.requestStore, this.sessionID, this.GetModuleOptionsObj())
           return preObject; 
        } catch (error) {
            console.error("RunAsPreModule", error);
            return null;
        }
        finally {
            if(didStartBot){
                this.stopBot();
            }
        }
    }
    async RunModule(ModuleCallBack, objToModule){
        try {
            objToModule = objToModule || {};
            var didStartBot = false;
            //we need to besure to start the bot, to get the session and cookies for the requests.
            if(!this.online){
                didStartBot = true;
                this.forceRertyToLogin = true;
                var didStart = await this.startBot(); // will create session and cookies, when it conneded
                console.log(didStart);
            }else{
                await this.SetWebSession(); // ensure the web session has not expired
            }
            //if the bot is not online, here, then somefing have gone wrong. then abande premodule
            if(!this.online)
            {
                return null;
            }
            await ModuleCallBack(objToModule, this.steamClient, this.requestCommunity, this.requestStore, this.sessionID, this.GetModuleOptionsObj())
            return true; 
        } catch (error) {
            console.error(this.loginName + " RunModule", error);
            return false;
        }
        finally {
            if(didStartBot){
                this.stopBot();
            }
        }
    }
}
module.exports = Bot;