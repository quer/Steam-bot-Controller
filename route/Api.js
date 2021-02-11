const Steam = require('steam');
var express = require('express')
var router = express.Router();
var Bots = require('../bots/controller')

router.use('/Module', require('./Api/Module'))
router.get('/', function (req, res) {
    res.json({status: false});
})
router.get('/GetBots', function (req, res) {
    var returnObj = [];
    for (let i = 0; i < Bots.clients.length; i++) {
        const bot = Bots.clients[i];
        returnObj.push(bot.GetForClient());
    }
    res.json({status: true, bot: returnObj});
})
router.post('/AddBot', async function (req, res) {
    
    var loginName = req.param('loginName');
    var password = req.param('password');
    var sharedSecret = req.param('sharedSecret');
    var startWhenSystemStartRestart = req.param('startWhenSystemStartRestart') == "true" ? true : false;
    var restartOnConnectionFail = req.param('restartOnConnectionFail') == "true" ? true : false;
    if(loginName != undefined && loginName != "" && password != "" && sharedSecret != ""){
        try {
            var result = await Bots.addBot(loginName, password, sharedSecret, startWhenSystemStartRestart, restartOnConnectionFail);
            res.json({status: true, massage: result});
        }
        catch (error) {
            res.json({status: false, massage: error});
        }
    }else{
        res.json({status: false, massage: "fill all fields"});

    }
})
router.post('/RemoveBot', function (req, res) {
    var loginName = req.param('loginName');
    if(loginName){
        Bots.RemoveBot(loginName);
        res.json({status: true});
    }else{
        res.json({status: false, massage: "send loginName"});
    }
})
router.post('/StartBot', function (req, res) {
    var loginName = req.param('loginName');
    if(loginName){
        var started = Bots.StartBot(loginName);
        res.json({status: started});
    }else{
        res.json({status: false, massage: "send loginName"});
    }
});
router.post('/StopBot', function (req, res) {
    var loginName = req.param('loginName');
    if(loginName){
        Bots.StopBot(loginName);
        res.json({status: true});
    }else{
        res.json({status: false, massage: "send loginName"});
    }
});

router.post('/EditBot', function (req, res) {
    var loginName = req.param('loginName');
    if(loginName){
        var startWhenSystemStartRestart = req.param('startWhenSystemStartRestart') == "true" ? true : false;
        var restartOnConnectionFail = req.param('restartOnConnectionFail') == "true" ? true : false;
        Bots.editBot(loginName, startWhenSystemStartRestart, restartOnConnectionFail);
        res.json({status: true});
    }else{
        res.json({status: false, massage: "send loginName"});
    }
})

router.get('/debugCall', function (req, res) {
    res.json({status: true});
})

router.get('/GetPersonaState', function (req, res) {
    res.json({status: true, list: Steam.EPersonaState});
});

router.post('/SetBotPersonaState', function (req, res) {
    var loginName = req.param('loginName');
    var personaState = req.param('PersonaState');
    if(loginName && personaState){
        personaState = parseInt(personaState, 10)
        Bots.SetBotPersonaState(loginName, personaState);
        res.json({status: true});
    }else{
        res.json({status: false, massage: "send loginName and PersonaState"});
    }
})

router.get('/GetIdleBots', function (req, res) {
    res.json({status: true, bot: Bots.IdleListToClient()});
})

router.post('/IdleGames', function (req, res) {
    var loginName = req.param('loginName');
    if(loginName){
        var Games = req.param('Games');
        if (typeof Games === 'string') {
            var newList = [Games];
            Games = newList;
        }
        Bots.AddIdleBot(loginName, Games);
        res.json({status: true});
    }else{
        res.json({status: false, massage: "send loginName"});
    }
});

router.post('/IdleStop', function (req, res) {
    var loginName = req.param('loginName');
    if(loginName){
        Bots.StopIdleBot(loginName);
        res.json({status: true});
    }else{
        res.json({status: false, massage: "send loginName"});
    }
});

router.get('/GetBotIdleGameList', function (req, res) {
    var loginName = req.param('loginName');
    if(loginName){
        res.json({status: true, games: Bots.GetBotIdleGameList(loginName)});
    }else{
        res.json({status: false, massage: "send loginName"});
    }
})


module.exports = router