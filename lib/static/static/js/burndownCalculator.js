(function() {

  var burndownModule = angular.module('huburn');

  burndownModule.factory('burndownCalculator', function() {
    function Burndown() {}  

    Burndown.prototype.getBurndown = function(milestone, issues) {
      var daysToGo = getDaysToGo(new Date(milestone.due_on));
      var total = this.getTotalPoints(issues);
      var burndownLine = getBurndownLine(this, total, milestone, issues);
      var idealLine = getIdealLine(burndownLine, total);
      var pointsRemaining = burndownLine[burndownLine.length-1].remaining;
      return { remaining: pointsRemaining, burndownLine: burndownLine, daysToGo: daysToGo, idealLine: idealLine };
    };

    var getBurndownLine = function(burndown, total, milestone, issues) {      
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
          burned: burndown.getTotalPoints(dateBuckets[key])
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

    Burndown.prototype.getPoints = function(issue) {
      for(var i = 0; i < issue.labels.length; i++)
        if (/^points: \d+$/.test(issue.labels[i].name))
          return parseInt(issue.labels[i].name.substring(8));

      return 0;
    };

    Burndown.prototype.getTotalPoints = function(issues) {
      if (!issues || !issues.length) return 0;

      return issues.map(this.getPoints).reduce(function(a,b) { return a+b; });
    };

    return new Burndown();
  });
}());  
