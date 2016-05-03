var express = require('express');
var request = require('request');
var cache = require('memory-cache');

var app = module.exports = express();

app.get('/githubEvents/:issue', function(req, res) { 
    var issue = req.params.issue;
    var eventKey = 'event_' + issue;
    
    var event = cache.get(eventKey);
    
    if (event) {
        console.log('sent from cache');
        res.send(event);
    }
    else {
        console.log('not using cache');
        request({
            method: 'GET',
            url: 'https://api.github.com/repos/Qualtrax/Qualtrax/issues/' + issue + '/events', 
            qs: req.query, 
            headers: {
                'Accept': 'application/vnd.github.v3+json',
                'Authorization': 'token ' + req.session.access_token,
                'User-Agent': 'Huburn'
            }
        }, function (error, response, body) {
            cache.put(eventKey, body, 360000);
            res.send(body);
        });
    }
});

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
    }, function (error, response, body) {
        res.send(body);
    });
  
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