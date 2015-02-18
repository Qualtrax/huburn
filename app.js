var fs = require('fs');
var crypto = require('crypto');
var http = require('http');
var https = require('https');
var express = require('express');
var session = require('express-session');

var config = require('./config.js');
var oauth = require('./lib/oauth-github');
var github = require('./lib/github');
var static = require('./lib/static');

http.createServer(function (req, res) {
    res.writeHead(200, {
        'Content-Type': 'text/plain'
    });
    res.end('Huburn is served over SSL, change the address to start with "https".');
}).listen(8080);

var app = express();

app.use(session({
    name: 'huburn.sid',
    cookie: {
        expires: false,
        secure: true
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

var options = {
    key: fs.readFileSync(__dirname + config.sslKeyPath),
    cert: fs.readFileSync(__dirname + config.sslCertPath)
};

https.createServer(options, app).listen(8443);