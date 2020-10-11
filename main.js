var express = require('express')
var config = require('./config')
var session = require('express-session')
var Storage = require('./storage/controller')
var Bots = require('./bots/controller')
var routeApi = require('./route/Api')
var bodyParser = require('body-parser')
var app = express()
// view engine setup
app.use(express.static('./public'));

app.set('trust proxy', 1) // trust first proxy
app.use(session({
  secret: config.sessionSecret,
  resave: false,
  saveUninitialized: true
}))
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

// ...

app.use('/api', routeApi)

// define the home page route
app.get('/', function (req, res) {
    if (req.session.views) {
        req.session.views++
    } else {
        req.session.views = 1
    }
    res.render('public/index.html');
})
app.get('/api', function (req, res) {

    res.render('public/index.html');
})

app.listen(config.webPort, () => console.log(`Example app listening at http://localhost:${config.webPort}`))