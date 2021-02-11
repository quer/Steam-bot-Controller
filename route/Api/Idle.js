var express = require('express')
var router = express.Router();
var Bots = require('../../bots/controller')

router.get('/', function (req, res) {
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