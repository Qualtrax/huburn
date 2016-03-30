(function() {
'use strict'

  angular
    .module('huburn')
    .factory('gitHubService', gitHubService);

    gitHubService.$inject = ['$http', '$q']

    function gitHubService($http, $q) {
      return {
        get: get,
        patch: patch,
        getIssues: getIssues,
        getDuration: getDuration
      };

    function get (params) {
      var deferred = $q.defer();

      $http.get('/github', { params: params } ).success(function(data) {
          deferred.resolve(data);
      });

      return deferred.promise;
    }
    
    function patch (params) {
      var deferred = $q.defer();
      
      $http.get('/github-patch', { params: params } )
        .success(function (data) {
          deferred.resolve(data);
        });
        
      return deferred.promise;
    }

    function getIssues(repository, milestone) {
        var deferred = $q.defer();
        var params = {
            path: '/repos/' + repository + '/issues',
            milestone: milestone,
            state: 'all',
            per_page: 100
        };
        
        $http.get('/github', { params: params } )
        .success(function (issues) {
            deferred.resolve(issues);
        });
        
        return deferred.promise;
    }
    
    function getDuration(issue) {
        var deferred = $q.defer();
        var eventParams = {
            path: '/repos/Qualtrax/Qualtrax/issues/' + issue.number + '/events',
            per_page: 100
        };
        
        $http.get('/github', { params: eventParams } )
        .success(function (events) {
            deferred.resolve(getDurationFor(issue, events));
        });
        
        return deferred.promise;
    }
    
    function getDurationFor(issue, events) {
        if (hasLabel(issue, /escalation/) || hasLabel(issue, /firelane/))
            return getDurationForEscalationOrFirelane(issue, events);
            
        return getDurationFromInProgressState(issue, events);
    }
    
    function getDurationForEscalationOrFirelane(issue, events) {
        var readyEvents = events.filter(function(i) { return i.event === "labeled" && i.label.name === '1 - Ready'; });
        
        if (readyEvents.length < 1) {
            var inProgressEvents = events.filter(function(i) { return i.event === "labeled" && i.label.name === '2 - In Progress'; });
            
            if (inProgressEvents.length < 1) {
                return buildDuration(issue, getDaysBetween(new Date(issue.created_at), new Date(issue.closed_at)));
            }
            else {
                inProgressEvents.sort(ascendingEvents);
                return buildDuration(issue, getDaysBetween(new Date(inProgressEvents[0].created_at), new Date(issue.closed_at)));
            }
        }
        
        readyEvents.sort(ascendingEvents); 
        return buildDuration(issue, getDaysBetween(new Date(readyEvents[0].created_at), new Date(issue.closed_at)));
    }
    
    function getDurationFromInProgressState(issue, events) {
        var inProgressEvents = events.filter(function(i) { return i.event === "labeled" && i.label.name === '2 - In Progress'; });
        
        if (inProgressEvents.length < 1) {
             var readyEvents = events.filter(function(i) { return i.event === "labeled" && i.label.name === '1 - Ready'; });
             
             if (readyEvents.length < 1) {
                return buildDuration(issue, getDaysBetween(new Date(issue.created_at), new Date(issue.closed_at)));
             }
             else {
                 readyEvents.sort(descendingEvents);
                 return buildDuration(issue, getDaysBetween(new Date(readyEvents[0].created_at), new Date(issue.closed_at)));
             }
        }
        
        inProgressEvents.sort(descendingEvents);
        return buildDuration(issue, getDaysBetween(new Date(inProgressEvents[0].created_at), new Date(issue.closed_at)));
    }
    
    function hasLabel(issue, regex) {
      for(var i = 0; i < issue.labels.length; i++)
        if(regex.test(issue.labels[i].name))
          return true;

      return false;
    };
    
    function getDaysBetween(firstDate, secondDate) {
        var oneDay = 24*60*60*1000; // hours*minutes*seconds*milliseconds
        
        return Math.round(Math.abs((firstDate.getTime() - secondDate.getTime())/(oneDay)));
    };
    
    function buildDuration(issue, durationTime) { return { issueNumber: issue.number, duration: durationTime }; };
    function ascendingEvents(a,b) { return new Date(a.created_at).getTime() - new Date(b.created_at).getTime(); };
    function descendingEvents(a,b) { return new Date(b.created_at).getTime() - new Date(a.created_at).getTime(); };

  }
}()); 

