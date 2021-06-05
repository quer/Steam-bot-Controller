module.exports = {
    sessionSecret: "SteamWebSession", // will sone have a login
    webSitePassword: "test",
    webPort: 3000,
    SteamApiKey: "",
    module: {
        AutoUpdate: true,
        Interval: 1440 //in minutes ( 1440 is one day)
    }
}
/*
if(module.exports.sessionSecret == "SteamWebSession")
{
    throw "Chance web session code for more secure using";
}
if(module.exports.SteamApiKey == "")
{
    throw "add a steam api key.";
}
if(module.exports.webSitePassword == "test")
{
    throw "Set your password to access the website";
}
*/