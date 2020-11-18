const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const passwordHash = require('password-hash')

const adapter = new FileSync('db.json')
const db = low(adapter)

db.defaults({ steamBots: [], user: [] }).write()

module.exports = {
    User: {
        CanLogin: function (username, password) {
            return db.get('user')
            .find({ 
                username: username, 
                password: passwordHash.generate(password) 
            })
            .value() != null;
        },
        AddUser: function (username, password) {
            if(!this.UserNameExist(username)){
                db.get('user')
                .push({ 
                    username: username, 
                    password: passwordHash.generate(password) 
                })
                .write();
                return true;
            }else{
                return false;
            }
        },
        UserNameExist: function (username) {
            return db.get('user')
            .find({ 
                username: username,  
            })
            .value() != null;
        }
    },
    Bots: {
        GetAll: function () {
            return db.get('steamBots').value();
        },
        Add: function (loginName, password, sharedSecret, startSystemStart, startOnConnectionFail) {
            var botExits = db.get('steamBots').find({loginName: loginName}).value();
            if(botExits == null){
                db.get('steamBots')
                .push({ 
                    loginName: loginName, 
                    password: password, // add encode and decode key.  
                    sharedSecret: sharedSecret,
                    startSystemStart: startSystemStart,
                    startOnConnectionFail: startOnConnectionFail,
                    personastate: 2,
                    accountInfo: {}
                })
                .write();
            }
        },
        // {accountInfo: xxxx, games: xxxx, apiKey: xxxx}
        SetAccountDetails: function (loginName, data) {
            if(data != null){
                var storedData = this.GetBot(loginName)
                if(data.accountInfo){
                    storedData.accountInfo = data.accountInfo;
                }
                if(data.games){
                    storedData.games = data.games;
                }
                if(data.apiKey){
                    storedData.apiKey = data.apiKey;
                }
                //save chances
                db.get('steamBots')
                .find({ loginName: loginName })
                .assign(storedData)
                .write()
            }
        },
        Remove: function (loginName) {
            db.get('steamBots')
            .remove({ loginName: loginName })
            .write();
        },
        GetBot: function (loginName) {
            return db.get('steamBots').find({loginName: loginName}).value();
        },
        RemoveBot: function (loginName) {
            db.get('steamBots')
            .remove({ loginName: loginName })
            .write()
        },
        ChanceBotSetting: function (loginName, data){
            
            db.get('steamBots')
            .find({ loginName: loginName })
            .assign(data)
            .write()
            return this.GetBot(loginName);
        },
        SetServer: function (serverData) {
            db.set('steamServer', serverData).write();
        },
        GetServer: function () {
            return db.get('steamServer').value();
        }
    },
    IdleBots: {
        GetBot: function (loginName) {
            if(db.get('steamBots').find({loginName: loginName}).has('idleList').value()){
                return db.get('steamBots').find({loginName: loginName})
                    .value().idleList;
            }
            return [];
        },
        SetBot: function (loginName, List) {
            db.get('steamBots')
            .find({ loginName: loginName })
            .assign({idleList: List})
            .write()
        },
        GetBotGames: function (loginName) {
            if(db.get('steamBots').find({loginName: loginName}).has('games').value()){
                return db.get('steamBots').find({loginName: loginName})
                    .value().games;
            }
            return [];
        }
    }
}