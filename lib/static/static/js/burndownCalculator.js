(function() {
  'use strict'

  angular
    .module('huburn')
    .factory('burndownCalculator', burndownCalculator);

    burndownCalculator.$inject = ['issueService'];
  
  function burndownCalculator(issueService) {
    var getBurndown = function(milestone, issues) {
      var daysToGo = getDaysToGo(new Date(milestone.due_on));
      var total = issueService.getTotalPoints(issues);
      var burndownLine = getBurndownLine(total, milestone, issues);
      var idealLine = getIdealLine(burndownLine, total);
      var pointsRemaining = burndownLine[burndownLine.length-1].remaining;
      var pointsInProgress = getPointsInProgress(issues);

      return { 
        title: milestone.title,
        remaining: pointsRemaining,
        burndownLine: burndownLine,
        daysToGo: daysToGo,
        idealLine: idealLine,
        pointsInProgress: pointsInProgress
      };
    };

    var getBurndownLine = function(total, milestone, issues) {      
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
          burned: issueService.getTotalPoints(dateBuckets[key])
        });
      });  

      coords.sort(function(a,b) { return a.date.getTime() - b.date.getTime(); });   

      coords = removeWeekends(coords);

      coords[0].remaining = total - coords[0].burned;

      for(var i = 1; i < coords.length; i++)
        coords[i].remaining = coords[i-1].remaining - coords[i].burned;

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

    var getIdealLine = function (burndown, total) {
      var idealCoords = [];
      var dailyBurn = total / (burndown.length - 1);

      for (var i = 0; i < burndown.length; i++)
        idealCoords.push({ date: burndown[i].date, remaining: total - dailyBurn * i });
            
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
      return issueService.getTotalPoints(issuesInProgress);
    }

    var isInProgress = function(issue) {
      for(var i = 0; i < issue.labels.length; i++)
        if (/^(2 - In Progress|3 - Review|4 - Testing|5 - Merge)$/.test(issue.labels[i].name))
          return true;

      return false;
    };

    function Burndown() {}
    Burndown.prototype.getBurndown = getBurndown;
    return new Burndown();
  }
}());   
