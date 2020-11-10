const Steam = require('steam');
var express = require('express')
var router = express.Router();
var Bots = require('../bots/controller')

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
    Bots.RemoveBot(loginName);
    res.json({status: true});
})
router.post('/StartBot', function (req, res) {
    var loginName = req.param('loginName');
    var started = Bots.StartBot(loginName);
    res.json({status: started});
});
router.post('/StopBot', function (req, res) {
    var loginName = req.param('loginName');
    Bots.StopBot(loginName);
    res.json({status: true});
});
router.post('/EditBot', function (req, res) {
    var loginName = req.param('loginName');
    var startWhenSystemStartRestart = req.param('startWhenSystemStartRestart') == "true" ? true : false;
    var restartOnConnectionFail = req.param('restartOnConnectionFail') == "true" ? true : false;
        Bots.editBot(loginName, startWhenSystemStartRestart, restartOnConnectionFail);
        res.json({status: true});
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
    personaState = parseInt(personaState, 10)
    Bots.SetBotPersonaState(loginName, personaState);
    res.json({status: true});
})
module.exports = router