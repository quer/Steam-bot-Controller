# Web panel to control multi account at once.
[![Steam Donate][steam-img]][steam-url]

# Working a node module builder
Im current working on a node module builder, where you build the action for the account. 

Se it here:
https://github.com/quer/Steam-bot-Controller/tree/node-build-module/nodeController

# Setup
Just run ´npm install´ in the root folder,
set global chance in  ´config.js´ file.
and then ´node main´ 

# Features
 * add bot
 * remove bot
 * edit basic bot setting.
 * Set Persona State 
 * start
 * stop
 * start idle
 * * you can select from each game the account own. 
 * set new idle
 * stop idle
 * see list of idling games
 * hide all behind a login.
 * only access if you have login, via the pass set in config file. 
 * run scripts modules.

# to do
 * chat system
 * friends request
 * updated stored account data.
 * and more

# Module

A simple but powerfuld module system have been added.

a short description of how it works.

each module need to be placed in a folder in the "Modules" folder.

Each folder is a module. 

In the module folder, there must be a "package.json", whit the following properties
```js
{
  "name": "testmodule", // the make, it will show in the module page
  "version": "1.0.0", // the version of the module. at the moment it is not used, but shoud be at a later date
  "description": "", // a description of what it is
  "main": "main.js" // what file is the module ( where it will execute the module )
}
```
Then in the main file, eks "main.js" 
it must have the following
```js
var helper = require('../moduleHelper');
module.exports = {
    Mode: helper.mode.sinkel, // this must be one of the enums in 'helper.mode' it defindes how it will be showen. if only for one account a the time or more.
    Execute: function(objectToEdit, steamClient, RequestCommunity, RequestStore, SessionID, options){
        // must be a promise, the action that will be runed for each account
    }
}
```
but it can also have the following fields:
```js
fields: { // if you what to show some user input fields in the web, then defined them here.
    customURL: {// this is the name of the key in the object that BeforeShowUserField returns, where the value will be stored
        type: helper.field.type.text, // what type the field is, text box or that
        text: "Custom url", // the showen text next to the field
        description: "Your profile will eks be available at......" // not mandatory, but if set, it will be showen under the field
    },
    ...
},
BeforeShowUserField:  function(steamClient, RequestCommunity, RequestStore, SessionID, options){
    // this is do somfing before you send field to web gui, and before Execute
    // this must be a promise, and the promise must return a obj, whit the thing that each account shoud have in the Execute.
    // the obj that this return, will be send to the web gui, and the field, will set the value to the keys, of this obj.
    // then that obj will be passed in "Execute" as "objectToEdit"
}
```
i have made a test module, that mirrow the module in 'https://github.com/quer/the-steam-awards/blob/master/modules/Edit%20Profile/chanceAccountSettings_general.js', you can see it in the "Modules" folder.

there will be a more detailed guide, at a later point. 

# It not bulletproof
this is a web client, where it do calles whit ajax to the server. and as right now. there is not check serverside that the call it get is valid, ( if you use the web panel it will work as it shoud) this means if some one make manuel call to the end point i can crash the node project. This shoud be fix later on. 
But is shoud be safe to use, as all endpint have been hidden behind a login. when you have loged in, then all endpint and menues can be uses. until signin, the endpoints just return "{status: true, message: "not login"}"
And if 2 ore more start module on account that do not run. as it might get to a point where, both, make the bot starte, and stop.


[steam-img]:  https://img.shields.io/badge/donate-Steam-lightgrey.svg?style=flat-square
[steam-url]:  https://steamcommunity.com/tradeoffer/new/?partner=29967844&token=ipZz21tf
