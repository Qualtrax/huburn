var getPoints = function(issue) {
  for(var i = 0; i < issue.labels.length; i++)
    if (/^points: \d+$/.test(issue.labels[i].name))
      return parseInt(issue.labels[i].name.substring(8));
};
