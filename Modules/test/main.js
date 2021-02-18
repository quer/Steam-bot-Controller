var helper = require('../moduleHelper');
var AccountHelpe = require('./chanceAccountHelper');
module.exports = {
    Mode: helper.mode.sinkel,
    fields: {
        personaName: {
            type: helper.field.type.text,
            text: "Profile Name"
        },
        real_name: {
            type: helper.field.type.text,
            text: "Real Name"
        },
        customURL: {
            type: helper.field.type.text,
            text: "Custom url",
            description: "Your profile will eks be available at: https://steamcommunity.com/id/Custom_url/"
        },
        country: {
            type: helper.field.type.text,
            text: "Country"
        },
        state: {
            type: helper.field.type.text,
            text: "State"
        },
        city: {
            type: helper.field.type.text,
            text: "City"
        },
        summary: {
            type: helper.field.type.textField,
            text: "Summary"
        },
        hide_profile_awards: {
            type: helper.field.type.bool,
            text: "Hide Profile Awards"
        }
    },
    BeforeShowUserField: function(steamClient, RequestCommunity, RequestStore, SessionID, options){
        return new Promise(async function (resolve, reject) {
            var accountInfo = await AccountHelpe.GetAccountInfo(RequestCommunity, steamClient.steamID);
            accountInfo = accountInfo.ProfileEdit;
            if(accountInfo == null){
                console.log(options.accountPretty + " something went wrong when getting account info!");
                reject(options.accountPretty + " something went wrong when getting account info!");
                return;
            }
            var objectToEdit = {
                "type": "profileSave", 
                "weblink_1_title": "",
                "weblink_1_url": "",
                "weblink_2_title": "",
                "weblink_2_url": "",
                "weblink_3_title": "",
                "weblink_3_url": "",
                "personaName": accountInfo.strPersonaName,
                "real_name": accountInfo.strRealName,
                "customURL": accountInfo.strCustomURL,
                "country": accountInfo.LocationData.locCountryCode,
                "state": accountInfo.LocationData.locStateCode,
                "city": accountInfo.LocationData.locCityCode,
                "summary": accountInfo.strSummary,
                "hide_profile_awards": accountInfo.ProfilePreferences.hide_profile_awards,
                "json": 1
            }
            resolve(objectToEdit)
        })
    },
    Execute: function(objectToEdit, steamClient, RequestCommunity, RequestStore, SessionID, options){
        return new Promise(function (resolve, reject) {
            objectToEdit.sessionID = SessionID;
            RequestCommunity.post({uri: "https://steamcommunity.com/profiles/"+ steamClient.steamID +"/edit/info", form: objectToEdit}, function(error, response, body) {
                var returnJson = JSON.parse(body); // {success: 1, errmsg: ""}
                if(returnJson.success == 1){
                    console.log(options.accountPretty+ " Setting changed!");
                }else{
                    console.log(options.accountPretty+ " Error saving Setting! Error:" + returnJson.errmsg);
                    reject("Error saving Setting! Error:" + returnJson.errmsg);
                    return;
                }
                resolve(true);
            });
        });
    }
}