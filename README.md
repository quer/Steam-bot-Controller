# Web panel to control multi account at once.
[![Steam Donate][steam-img]][steam-url]

# Setup
Just run ´npm install´ in the root folder,
set global chance in  ´config.js´ file.
and then ´node main´

# Fetures
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

# to do
 * add login to panel
 * chat system
 * friends request
 * run scripts modules.
 * and more

# It not bulletproof
this is a web client, where it do calles whit ajax to the server. and as right now. there is not check serverside that the call it get is valid, ( if you use the web panel it will work as it shoud) this means if some one make manuel call to the end point i can crash the node project. This shoud be fix later on. 
Also all that have the url as i right now, can access the bot. later there will added a login to ensure only allow users can handle the bots


[steam-img]:  https://img.shields.io/badge/donate-Steam-lightgrey.svg?style=flat-square
[steam-url]:  https://steamcommunity.com/tradeoffer/new/?partner=29967844&token=ipZz21tf