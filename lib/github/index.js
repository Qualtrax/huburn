var express = require('express');
var request = require('request');
var apicache = require('apicache').options({ debug: true }).middleware;

var app = module.exports = express();

// app.get('/github/repos/Qualtrax/Qualtrax/issues/:issueNumber/events', apicache('5 minutes'), function(req, res) { 
//   var path = req.query.path;
//   delete req.query["path"];
//   console.log('heyadfadfaf');
//   request({
//     method: 'GET',
//     url: 'https://api.github.com' + path, 
//     qs: req.query, 
//     headers: {
//       'Accept': 'application/vnd.github.v3+json',
//       'Authorization': 'token ' + req.session.access_token,
//       'User-Agent': 'Huburn'
//     }
//   }).pipe(res)
// }),

app.get('/github', function(req, res) { 
  var path = req.query.path;
  delete req.query["path"];
  
  request({
    method: 'GET',
    url: 'https://api.github.com' + path, 
    qs: req.query, 
    headers: {
      'Accept': 'application/vnd.github.v3+json',
      'Authorization': 'token ' + req.session.access_token,
      'User-Agent': 'Huburn'
    }
  }).pipe(res);
});

app.get('/github-patch', function(req, res) { 
  var path = req.query.path;
  delete req.query["path"];
  
  request({
    method: 'PATCH',
    url: 'https://api.github.com' + path,
    headers: {
      'Accept': 'application/vnd.github.v3+json',
      'Authorization': 'token ' + req.session.access_token,
      'User-Agent': 'Huburn'
    },
    json: req.query
  }).pipe(res);
});