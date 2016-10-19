var express = require('express');
var request = require('request');
var cache = require('memory-cache');

var app = module.exports = express();

app.get('/githubEvents/:issue', function(req, res) { 
    var eventData = [];
    
    var issue = req.params.issue;
    var path = req.query.path;
    delete req.query["path"];
    var eventKey = 'events_' + issue;

    function getData(pageCounter) {
        var url = 'https://api.github.com' + path + '?page=' + pageCounter;
        request({
            method: 'GET',
            url: url, 
            qs: req.query, 
            headers: {
                'Accept': 'application/vnd.github.v3+json',
                'Authorization': 'token ' + req.session.access_token,
                'User-Agent': 'Huburn'
            },
            json: true
        }, 
        function (error, response, body) {
            if(!error && response.statusCode === 200) {
                for(var eventIndex = 0; eventIndex < body.length; eventIndex++)
                    eventData.push(body[eventIndex]);

                if(body.length < 30) {
                    cache.put(eventKey, eventData, 360000);
                    res.send(eventData);
                }
                else {
                    getData(pageCounter + 1);
                }
            }
        });
    };

    var event = cache.get(eventKey);
    
    if (event)
        res.send(event);
    else
        getData(1);    
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