var express = require('express')
var config = require('./config')
var session = require('express-session')
var Storage = require('./storage/controller')
var Bots = require('./bots/controller')
var Modules = require('./ModulesController/controller')
var routeApi = require('./route/Api')
var bodyParser = require('body-parser')
var path = require('path')
var app = express()
// view engine setup

//app.set('trust proxy', 1) // trust first proxy
app.use(session({
    secret: config.sessionSecret,
    resave: true,
    saveUninitialized: true,
    cookie: { 
        secure: false ,
        maxAge: 3600000
    }
}))
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

app.listen(config.webPort, () => console.log(`Example app listening at http://localhost:${config.webPort}`))

process.on('SIGTERM', () => {
    debug('SIGTERM signal received: closing HTTP server')
    app.close(() => {
      debug('HTTP server closed')
    })
  })