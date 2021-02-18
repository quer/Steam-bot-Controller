var express = require('express')
var router = express.Router();
var modulesContainer = require('../../ModulesController/controller')
router.get('/', function (req, res) {
   
    res.json({status: true, modules: modulesContainer.GetModuls()});
})
router.post('/GetModuleFields', async function (req, res) {
    var moduleId = req.param('moduleId');
    var bots = req.param('bots[]');
    if(!Array.isArray(bots)){
        var selectedBot = bots;
        bots = [selectedBot];
    }
    res.json(await modulesContainer.GetModuleFields(moduleId, bots));
    
})
router.post('/RunModule', async function (req, res) {
    var moduleId = req.param('moduleId');
    var bots = req.param('bots[]');
    var objToModule = req.param('objToModule');
    if(!Array.isArray(bots)){
        var selectedBot = bots;
        bots = [selectedBot];
    }
    if(objToModule != null && objToModule != ""){
        objToModule = JSON.parse(objToModule);
    }
    res.json(await modulesContainer.RunModule(moduleId, bots, objToModule));
});


module.exports = router