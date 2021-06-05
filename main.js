var express = require('express')
var config = require('./config')
var session = require('express-session')
var Storage = require('./storage/controller')
var Bots = require('./bots/controller')
var Modules = require('./ModulesController/controller')
var routeApi = require('./route/Api')
var bodyParser = require('body-parser')
var http = require('http')
var path = require('path')
var app = express()
// view engine setup

//app.set('trust proxy', 1) // trust first proxy
var session = session({
    secret: config.sessionSecret,
    resave: true,
    key: 'sid',
    saveUninitialized: true,
    cookie: { 
        secure: false ,
        maxAge: 3600000
    }
});
app.use(session)
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

// define the home page route
app.get('/', function (req, res) {
    if (req.session.login) {
        res.sendFile(path.join(__dirname +'/public/index.html'));
    } else {
        return res.redirect('/login');
    }
})
app.get('/login', function (req, res) {
    res.sendFile(path.join(__dirname +'/public/login.html'));
})
app.post('/login', function (req, res) {
    var password = req.param('password');
    if(password == config.webSitePassword){
        req.session.login = true;
        req.session.save(function(err) {
            return res.redirect('/');
        })
    }else{
        return res.redirect('/login');
    }
})
app.get('/logout', function (req, res) {
    req.session.destroy(function(err) {
        return res.redirect('/login');
    })
})

app.use('/api', routeApi)

app.use(express.static('./public'));
app.use('/moduleHelper.js', express.static(__dirname, {index: 'Modules/moduleHelper.js'}));

//app.listen(config.webPort, () => console.log(`Example app listening at http://localhost:${config.webPort}`))

process.on('SIGTERM', () => {
    debug('SIGTERM signal received: closing HTTP server')
    app.close(() => {
      debug('HTTP server closed')
    })
})


var sharedsession = require("express-socket.io-session");
var server = http.createServer(app);
const io = require('socket.io')(server);
io.use(sharedsession(session));

server.listen(config.webPort, () => {
    console.log('Server listening at port %d', config.webPort);
});
// we need to be sure, only connections that have sign into the site, can use the socket.
io.use((socket, next) => {
    console.log("use")
    if(socket.handshake.session.login){
        next();
    }else{
        next(new Error("Not logedin"));
    }
});

io.on('connection', function (client) {
  console.log("connection") 
});