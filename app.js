var crypto = require('crypto');
var http = require('http');
var express = require('express');
var session = require('express-session');

var config = require('./config.js');
var oauth = require('./lib/oauth-github');
var github = require('./lib/github');
var static = require('./lib/static');

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
        res.redirect('/login/oauth');
    else
        next();
});

app.use(static);
app.use(oauth);
app.use(github);

http.createServer(app).listen(8080);
