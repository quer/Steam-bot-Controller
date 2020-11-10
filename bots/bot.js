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
                this.online = true;
                this.steamid = this.steamClient.steamID;
                await this.SetWebSession();
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
        this.steamClient.on('error', function onSteamError(error) {
            console.log("Connection closed by server - ", error);
            var botData = Storage.Bots.GetBot(this.loginName);
            this.online = false;
            if(botData && botData.startOnConnectionFail){
                if(this.loops < 3){
                    setTimeout(function () {
                        ++this.loops;
                        this.steamClient.connect();                    
                    }.bind(this), 3000);
                }else{
                    this.loops = 0;
                    console.log("Have retryed 3 time to reconnect, will stop");
                    if(this.callbackWhitErrorResult != null){
                        this.callbackWhitErrorResult(error);
                        this.callbackWhitErrorResult = null;
                    }
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
    GetAccountInfo(){
        return new Promise(function (resolve, reject) {
            if(this.requestCommunity != null){
                this.requestCommunity.get({uri: "https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key="+ config.SteamApiKey +"&steamids=" + this.steamid }, function(error, response, body) {
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
            }
        }.bind(this));
    }
    GetOrSetAccountApiKey(){
        return new Promise(function (resolve, reject) {
            if(!this.botData.apikey){
                if(this.requestCommunity != null){
                    this.requestCommunity.get({uri: "https://steamcommunity.com/dev/apikey" }, function(error, response, body) {
                        if(error){
                            console.log("get steam api key, error: ", error)
                            reject();
                            return;
                        }
                        var $ = cheerio.load(body);
                        // acount do not have a key
                        if($("#domain").length > 0){
                            this.requestCommunity.post({
                                url: "https://steamcommunity.com/dev/registerkey",
                                form:{
                                    domain: this.loginName,
                                    agreeToTerms: 1,
                                    sessionid: this.sessionID
                                }
                            }, function(error, response, body){
                                var recurveCall = this.GetOrSetAccountApiKey();
                                recurveCall.then(function (key) {
                                    resolve(key);
                                })
                            })
                        }else{
                            var fieldText = $("#bodyContents_ex").find("p").first().text();
                            var key = fieldText.replace("Key: ", "");
                            resolve(key)
                        }
                    });
                }
            }
            else 
            {
                resolve(this.botData.apikey)
            }
        });
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
}
module.exports = Bot;