(function() {
  'use strict'

  angular
    .module('huburn')
    .factory('burnupCalculator', burnupCalculator);
  
  burnupCalculator.$inject = ['availabilityService', 'LABEL'];

  function burnupCalculator (availabilityService, LABEL) {
    var getBurnup = function(velocityMilestones, milestone, issues) {
      var daysToGo = getDaysToGo(new Date(milestone.due_on));
      var total = getRecommendedPoints(velocityMilestones, milestone.metadata.availabilityInDays);
      var burnupLine = getBurnupLine(total, milestone, issues);
      var idealLine = getIdealLine(burnupLine, total);
      var pointsToGoal = total - burnupLine[burnupLine.length - 1].earned;
      var pointsInProgress = getPointsInProgress(issues);

      return { 
        title: milestone.title,
        pointsToGoal: pointsToGoal,
        burnupLine: burnupLine,
        daysToGo: daysToGo,
        idealLine: idealLine,
        pointsInProgress: pointsInProgress
      };
    };

    var getBurnupLine = function(total, milestone, issues) {      
      var dateBuckets = {};

      var d = new Date(milestone.due_on);
      dateBuckets[d.toDateString()] = [];

      for(var i = 0; i < 13; i++) {
        d.setDate(d.getDate() - 1);
        dateBuckets[d.toDateString()] = [];
      }      

      for(var i = 0; i < issues.length; i++) {
        if (!issues[i].closed_at) continue;

        var dateClosedStr = new Date(issues[i].closed_at).toDateString();
        
        if (dateBuckets.hasOwnProperty(dateClosedStr) == false)
          dateBuckets[dateClosedStr] = [];

        dateBuckets[dateClosedStr].push(issues[i]);
      }

      var keys = Object.keys(dateBuckets);

      var coords = [];

      keys.forEach(function(key) {
        coords.push({
          date: new Date(key),
          burned: getTotalPoints(dateBuckets[key])
        });
      });  

      coords.sort(function(a,b) { return a.date.getTime() - b.date.getTime(); });   

      coords = removeWeekends(coords);

      coords[0].earned = coords[0].burned;

      for(var i = 1; i < coords.length; i++)
        coords[i].earned = coords[i-1].earned + coords[i].burned;

      return coords;
    }

    var getDaysToGo = function(dueOn) {
      var dueOnTime = new Date(dueOn).getTime();
      var d = new Date();

      if (d.getTime() > dueOnTime) 
        return 0;

      var daysToGo = 1;

      while (d.getTime() < dueOnTime) {
        if (!isWeekend(d))
          daysToGo++;

        d.setDate(d.getDate() + 1);
      }
      
      return daysToGo;
    }

    var getIdealLine = function (burnup, total) {
      var idealCoords = [];
      var dailyBurn = total / (burnup.length - 1);

      for (var i = 0; i < burnup.length; i++)
        idealCoords.push({ date: burnup[i].date, earned: dailyBurn * i });
            
      return idealCoords;
    }

    var removeWeekends = function(coords) {
      var withoutWeekends = [];
      var carryOver = 0;

      for(var i = 0; i < coords.length; i++) {
        if (isWeekend(coords[i].date)) {
          carryOver += coords[i].burned;
        } else {
          coords[i].burned += carryOver;
          carryOver = 0;          
          withoutWeekends.push(coords[i]);
        }        
      }

      return withoutWeekends;
    }

    var isWeekend = function (d) {
      var day = new Date(d).getDay();
      return day == 6 || day == 0;
    }   

    var getPointsInProgress = function(issues) {
      if (!issues || !issues.length) return 0;

      var issuesInProgress = issues.filter(function(i) { return isInProgress(i); });
      return getTotalPoints(issuesInProgress);
    }

    var isInProgress = function(issue) {
      for(var i = 0; i < issue.labels.length; i++)
        if (/^(2 - In Progress|3 - Review|4 - Testing|5 - Merge)$/.test(issue.labels[i].name))
          return true;

      return false;
    };
    
    var getCategoryData = function(issues, totalPointsForIssues) {
        var categories = [];
        
        // categories.push(getCategoryFor(LABEL.FIRELANES, issues.filter(function(i) { return hasLabel(i, /firelane/); })));
        // categories.push(getCategoryFor(LABEL.ESCALATIONS, issues.filter(function(i) { return hasLabel(i, /escalation/); })));
        // categories.push(getCategoryFor(LABEL.FREERANGES, issues.filter(function(i) { return hasLabel(i, /freerange/); })));
        // categories.push(getCategoryFor(LABEL.NEAR_MISSES, issues.filter(function(i) { return hasLabel(i, /near-miss/); })));
        // categories.push(getCategoryFor(LABEL.BUILD_MACHINE, issues.filter(function(i) { return hasLabel(i, /Build Machine/); })));
        // categories.push(getCategoryFor(LABEL.ZERO_DEFECTS, issues.filter(function(i) { return hasLabel(i, /zero-defect/); })));
        // categories.push(getCategoryFor(LABEL.FEATURES, issues.filter(function(i) { return hasLabel(i, /feature/); })));
        categories.push(getCategoryFor(LABEL.RESEARCH, issues.filter(function(i) { return hasLabel(i, /research/); })));
        // categories.push(getCategoryFor(LABEL.TECHNICAL_DEBT, issues.filter(function(i) { return hasLabel(i, /technical debt/); })));
        // categories.push(getCategoryFor(LABEL.SCOPE_CHANGES, issues.filter(function(i) { return hasLabel(i, /scope change/); })));
        
        return categories;
    }
    
    var getCategoryFor = function(title, issues) {
        var category = {
          name: title,
          count: issues.length,
          points: getPointsForLabel(issues),
          averageTimeAcrossBoard: getTimeAcrossBoardAverageForLabel(issues)  
        };
        
        return category;
    }
    
    var getPointsForLabel = function(issues) {
        if (issues.length > 0)
            return issues.map(getPoints).reduce(function(a, b) { return a + b; });
        else
            return 0;
    }
    
    var getPoints = function(issue) {
        for(var i = 0; i < issue.labels.length; i++)
            if (/^points: \d+$/.test(issue.labels[i].name))
                return parseInt(issue.labels[i].name.substring(8));
            
        return 0;
    }
    
    var getTimeAcrossBoardAverageForLabel = function(issues) {
        if (issues.length > 0){
            var issuesWithDuration = [];
            issues.forEach(function(issue) {
               if (issue.duration > 0)
                    issuesWithDuration.push(issue); 
            });
            var total = issuesWithDuration.map(duration).reduce(sum);
            return  Math.round(total / issuesWithDuration.length);
        }  
        else {
            return 0;
        }
    }
    
    function duration(i) { return i.duration; };
    function sum(a,b) { return a+b; };

    var getNumberOfLabelOpen = function(issues, regex) {
      return issues.filter(function(i) { return hasLabel(i, regex) && i.state == 'open'; }).length;
    };

    var hasLabel = function(issue, regex) {
      for(var i = 0; i < issue.labels.length; i++)
        if(regex.test(issue.labels[i].name))
          return true;

      return false;
    };
    
    var getTotalPoints = function(issues) {
      if (!issues || !issues.length)
        return 0;

      return issues.map(getPoints)
        .reduce(function(a, b) { 
          return a + b; 
        });
    };

    var getRecommendedPoints = function(milestones, availabilityInDays) {
      return availabilityService.getRecommendedPoints(milestones, availabilityInDays);
    };

    function burnup() {}
    burnup.prototype.getBurnup = getBurnup;
    burnup.prototype.getTotalPoints = getTotalPoints;
    burnup.prototype.getRecommendedPoints = getRecommendedPoints;
    burnup.prototype.getNumberOfLabelOpen = getNumberOfLabelOpen;
    burnup.prototype.getCategoryData = getCategoryData;
    return new burnup();
  }
}());  
