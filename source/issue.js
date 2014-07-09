var getPoints = function(issue) {
  for(var i = 0; i < issue.labels.length; i++)
    if (/^points: \d+$/.test(issue.labels[i].name))
      return parseInt(issue.labels[i].name.substring(8));

  return 0;
};

var getTotalPoints = function(issues) {
  return issues.map(getPoints).reduce(function(a,b) { return a+b; });
};

var getBurndown = function(issues) {
  var dateBuckets = {};

  for(var i = 0; i < issues.length; i++) {
    if (!issues[i].closed_at) continue;

    var dateClosedStr = new Date(issues[i].closed_at).toDateString();
  
    if (dateBuckets.hasOwnProperty(dateClosedStr) == false)
      dateBuckets[dateClosedStr] = [];

    dateBuckets[dateClosedStr].push(issues[i]);
  }

  var coords = [];
  var keys = Object.keys(dateBuckets);

  if (keys.length == 0)
    return { total: 0, coords: [] };

  keys.forEach(function(key) {
    coords.push({
      date: new Date(key),
      burned: getTotalPoints(dateBuckets[key])
    });
  });  

  coords.sort(function(a,b) { return a.date > b.date; });
   
  var total = getTotalPoints(issues);
  coords[0].remaining = total - coords[0].burned;

  for(var i = 1; i < coords.length; i++)
    coords[i].remaining = coords[i-1].remaining - coords[i].burned;
  
  return { total: total, coords: coords };
};