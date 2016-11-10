(function() {
'use strict'

  angular
    .module('huburn')
    .factory('issueService', issueService);

    function issueService() {
      return {
        getPoints: getPoints,
        getTotalPoints: getTotalPoints,
        getTotalPointsForLabel: getTotalPointsForLabel,
        getIssuesWithLabel: getIssuesWithLabel,
        getNumberOfIssuesWithLabel: getNumberOfIssuesWithLabel,
        getNumberOfOpenIssuesWithLabel: getNumberOfOpenIssuesWithLabel,
        hasLabel: hasLabel
      };

      function getPoints(issue) {
          for(var i = 0; i < issue.labels.length; i++)
            if (/^points: \d+$/.test(issue.labels[i].name))
                return parseInt(issue.labels[i].name.substring(8));
            
          return 0;
      }

      function getIssuesWithLabel(issues, labelName) {
          var issuesWithLabel = [];

          for (var i = 0; i < issues.length; i++)
            for(var j = 0; j < issues[i].labels.length; j++)
                if (issues[i].labels[j].name == labelName)
                    issuesWithLabel.push(issues[i]);

          return issuesWithLabel;
      }

      function getTotalPoints(issues) {
          if (!issues || !issues.length)
              return 0;

          return issues.map(getPoints)
              .reduce(function(a, b) { 
                  return a + b; 
              });
      }
      
      function getTotalPointsForLabel(issues, labelRegEx) {
          var issues = issues.filter(function(i) { return hasLabel(i, labelRegEx); });
        
            if (issues.length > 0)
                return issues.map(getPoints).reduce(function(a, b) { return a + b; });
            else
                return 0;
      }

      function getNumberOfIssuesWithLabel(issues, regex) {
          return issues.filter(function(i) { return hasLabel(i, regex); }).length;
      };

      function getNumberOfOpenIssuesWithLabel(issues, regex) {
          return issues.filter(function(i) { return hasLabel(i, regex) && i.state == 'open'; }).length;
      };

      function hasLabel(issue, labelRegEx) {
          for(var i = 0; i < issue.labels.length; i++)
              if(labelRegEx.test(issue.labels[i].name))
                  return true;

          return false;
      }
  }
}()); 

