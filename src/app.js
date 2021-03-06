'use strict';

var fs = require('fs');
var path = require('path');
var express = require('express');
var session = require('express-session');
var flash = require('express-flash');
var passport = require('passport');
var favicon = require('serve-favicon');
var morgan = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

require('./app/initConfig');
const configs = require('y-config').getConfig();


var app = express();

var logDirectory = configs.logs;

// ensure log directory exists
fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);

var log = require('./app/utils/log.js');
app.log = log;

app.configs = configs;

// view engine setup
app.set('view engine', 'ejs');
app.set('trust proxy', 1); // trust first proxy
app.set('views', configs.views);
app.set('port', configs.port);
app.use(express.static(configs.public));

if (app.get('env') === 'development') {
    app.use(morgan('dev'));
} else {
    var accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' });
    app.use(morgan('combined', { stream: accessLogStream }));
}

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
    secret: 'VYYcrQIHm05qY7lJVBiKgxh5Jn5qgvsL59jySwHP0zMhuaJbDcuzpQhpGSyqmIvu6ZJLrz4G9WN4xEcvM4D8Cx4k8SQLENkUEJiv',
    resave: false,
    saveUninitialized: true,
    cookie: { httpOnly: true, secure: false, maxAge: 2 * 60 * 100000 }
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

require('./app/route')(app, passport);

console.log('-------------------------------');
console.log('访问: ' + configs.domainUrl);
var port = configs.port != 80 ? ':' + configs.port : ''
configs.IPv4Address.forEach(function(ip) {
    console.log('ip访问: ' + ip + port);
});
console.log('-------------------------------');

module.exports = app;
