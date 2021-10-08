var Type = require("../nodeController/nodeType");
var nodes = [
    //Get Queue
    {
        "UniqId": "testx",
        "Name": "Get Queue",
        "Output": [
            //output index 0
            {
                "Text": "appid",
                "Type": Type.AppID
            }
        ],
        "Execute": function (options) {
            return new Promise(function (resolve, reject) {
                options.RequestStore.post({
                    url:'https://store.steampowered.com/explore/generatenewdiscoveryqueue',
                    form:{
                        sessionid: options.SessionID,
                        queuetype: 0
                    },
                }, function (error, response, body) {
                    if(error){
                        reject(error);
                        return;
                    }
                    try {
                        var data = JSON.parse(body);
                        resolve(data.queue);
                    } catch (e) {
                        console.log("was not able to get new queue")
                        console.log(body);
                        reject(e);
                    }
                });
            })   
        }
    },
    {
        "UniqId": "testxx",
        "Name": "App Details",
        "Output": [
            //output index 0
            {
                "Text": "App Details",
                "Type": Type.AppDetails
            }
        ],
        "Input": [
            //input index 0
            {
                "Text": "appid",
                "Type": Type.AppID,
                "Mandatory": true
            }
        ],
        "Execute": function (options, appID) {
            return new Promise(function (resolve, reject) {
                options.RequestStore.get({
                    url:'https://store.steampowered.com/api/appdetails',
                    form:{
                        appids: appID
                    },
                }, function (error, response, body) {
                    if(error){
                        reject(error);
                        return;
                    }
                    try {
                        var data = JSON.parse(body);
                        resolve(data[appID]);
                    } catch (e) {
                        console.log("was not able to get appdetails for appid:"+appID)
                        console.log(body);
                        reject(e);
                    }
                });
            })   
        }
    }
];

module.exports = nodes;