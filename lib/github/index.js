var express = require('express');
var request = require('request');

var app = module.exports = express();

app.get('/repos', function(req, res) { 
  request({
    method: 'GET',
    url: 'https://api.github.com/user/repos',
    headers: {
      'Accept': 'application/vnd.github.v3+json',
      'Authorization': 'token ' + req.session.access_token,
      'User-Agent': 'Huburn'
    }
  }).pipe(res);
});