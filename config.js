module.exports = {
    sessionSecret: "SteamWebSession", // will sone have a login
    webPort: 3000,
    SteamApiKey: ""
}

if(module.exports.sessionSecret == "SteamWebSession")
{
    throw "Chance web session code for more secure using";
}
if(module.exports.SteamApiKey == "")
{
    throw "add a steam api key.";
}