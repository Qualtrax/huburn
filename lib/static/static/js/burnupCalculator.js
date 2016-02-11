(function() {
  'use strict'

  angular
    .module('huburn')
    .factory('burnupCalculator', burnupCalculator);
  
  burnupCalculator.$inject = ['availabilityService'];

  function burnupCalculator (availabilityService) {
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

    var getPoints = function(issue) {        
      var potentialPoints = 0;
      for(var i = 0; i < issue.labels.length; i++)
        if (/^points: \d+$/.test(issue.labels[i].name))
    	  potentialPoints = parseInt(issue.labels[i].name.substring(8));
        else if (issue.labels[i].name == 'non cap')
          return 0;
          
      return potentialPoints;
    };

    var getNumberOfLabel = function(issues, regex) {
      return issues.filter(function(i) { return hasLabel(i, regex); }).length;
    };

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
    burnup.prototype.getPoints = getPoints;
    burnup.prototype.getTotalPoints = getTotalPoints;
    burnup.prototype.getRecommendedPoints = getRecommendedPoints;
    burnup.prototype.getNumberOfLabel = getNumberOfLabel;
    burnup.prototype.getNumberOfLabelOpen = getNumberOfLabelOpen;
    return new burnup();
  }
}());  
