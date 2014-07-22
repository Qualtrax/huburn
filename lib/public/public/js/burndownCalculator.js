(function() {

  var burndownModule = angular.module('huburn');

  burndownModule.factory('burndownCalculator', function() {
    function Burndown() {}  

    Burndown.prototype.getBurndown = function(milestone, issues) {
      var self = this;
      var dateBuckets = {};
      var total = self.getTotalPoints(issues);

      var dueOn = new Date(milestone.due_on);
      dateBuckets[dueOn.toDateString()] = [];

      for(var i = 0; i < 13; i++) {
        dueOn.setDate(dueOn.getDate() - 1);
        dateBuckets[dueOn.toDateString()] = [];
      }      

      var due_on = setToJustBeforeMidnight(new Date(milestone.due_on));

      var millsecondsToGo = due_on.getTime() - new Date().getTime(); 
      var daysToGo = millsecondsToGo <= 0 ? 0 : Math.ceil(millsecondsToGo / (1000 * 3600 * 24)); 

      for(var i = 0; i < issues.length; i++) {
        if (!issues[i].closed_at) continue;

        var dateClosedStr = new Date(issues[i].closed_at).toDateString();
        
        if (dateBuckets.hasOwnProperty(dateClosedStr) == false)
          dateBuckets[dateClosedStr] = [];

        dateBuckets[dateClosedStr].push(issues[i]);
      }

      var keys = Object.keys(dateBuckets);

      if (keys.length == 0)
        return { total: total, remaining: total, coords: [], daysToGo: daysToGo };

      var coords = [];

      keys.forEach(function(key) {
        coords.push({
          date: new Date(key),
          burned: self.getTotalPoints(dateBuckets[key])
        });
      });  

      coords.sort(function(a,b) { return a.date - b.date; });   

      coords = removeWeekends(coords);

      coords[0].remaining = total - coords[0].burned;

      for(var i = 1; i < coords.length; i++)
        coords[i].remaining = coords[i-1].remaining - coords[i].burned;

      return { total: total, remaining: coords[coords.length-1].remaining, coords: coords, daysToGo: daysToGo };
    };

    var setToJustBeforeMidnight = function(date) {
      date.setHours(23);
      date.setMinutes(59);
      date.setSeconds(59);
      date.setMilliseconds(999);
      return date;
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
