var crypto = require('crypto');
var http = require('http');
var express = require('express');
var session = require('express-session');

var config = require(__dirname + '/config.js');
var oauth = require(__dirname + '/lib/oauth-github');
var github = require(__dirname + '/lib/github');
var static = require(__dirname + '/lib/static');

var app = express();

app.use(session({
    name: 'huburn.sid',
    cookie: {
        expires: false,
        httpOnly: true
    },
    secret: crypto.randomBytes(20).toString('hex'),
    resave: true,
    saveUninitialized: true
}));

app.use(function (req, res, next) {
    if (!req.session.access_token && req.path.slice(0, 7) != '/login/')
    {
        req.session.returnUrl = req.originalUrl;   
        res.redirect('/login/oauth');
    }
    else
    {
        next();
    }
});

app.use(static);
app.use(oauth);
app.use(github);
app.use('/js', express.static(__dirname + '/lib/static/static/js'));
app.use('/css', express.static(__dirname + '/lib/static/static/css'));

app.use(function(req, res) {
    res.sendfile(__dirname + '/lib/static/static/index.html');
});

http.createServer(app).listen(8080);
