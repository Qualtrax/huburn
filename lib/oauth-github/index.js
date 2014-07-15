var config = require('../../config.js');
var uri = require('urijs');
var request = require('request');
var crypto = require('crypto');
var express = require('express');
var app = module.exports = express();

app.get('/login/oauth', function(req, res) {
  req.session.oauth_csrf = crypto.randomBytes(20).toString('hex');
  res.redirect(new uri('https://github.com/login/oauth/authorize').query({
    client_id: config.githubClientId,
    scope: 'repo',
    state: req.session.oauth_csrf
  }));
});

app.get('/login/oauth/callback', function(req, res) {
  if (req.query.state == undefined || req.query.state != req.session.oauth_csrf)
    res.send(404, 'Not Found');

  request({
    method: 'POST',
    url: 'https://github.com/login/oauth/access_token',
    json: {
      client_id: config.githubClientId,
      client_secret: config.githubClientSecret,
      code: req.query.code
    }
  }, function(error, response, body) {
    if (error)
      res.send(500, 'Server error');

    req.session.access_token = body.access_token;
    res.redirect('/');
  });
});
