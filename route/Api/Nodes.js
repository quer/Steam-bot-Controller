var express = require('express')
var router = express.Router();
var NodesContainer = require('../../nodeController/controller')
router.get('/', function (req, res) {
    res.json({status: false, message: "cant use direct"});
})
router.get('/GetNodes', function (req, res) {
    res.json({status: true, data: NodesContainer.GetNodes() });
})

module.exports = router