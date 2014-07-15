var fs = require('fs');
var crypto = require('crypto');
var http = require('http');
var https = require('https');
var express = require('express');
var session = require('express-session');

var oauth = require('./lib/oauth');
var github = require('./lib/github');
var public = require('./lib/public');

http.createServer(function(req, res) {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Huburn is served over SSL, change the address to start with "https".');
}).listen(8080);

var app = express();

app.use(session({
  name: 'huburn.sid',
  cookie: { expires: false, secure: true },
  secret: crypto.randomBytes(20).toString('hex'),
  resave: true,
  saveUninitialized: true
}));

app.use(public);
app.use(oauth);
app.use(github);

var options = {
  key: fs.readFileSync(__dirname + '/server.key'),
  cert: fs.readFileSync(__dirname + '/server.crt')
};

https.createServer(options, app).listen(8443);