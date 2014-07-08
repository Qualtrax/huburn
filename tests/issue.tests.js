var getPoints = function(issue) {
  for(var i = 0; i < issue.labels.length; i++)
    if (/^points: \d+$/.test(issue.labels[i].name))
      return parseInt(issue.labels[i].name.substring(8));
};

describe("Point value of an issue", function() {
  it("Should be based on points label", function() {
    var issue = { labels: [ { name: "bug" }, { name: "points: 1" } ] };
    expect(getPoints(issue)).toBe(1);
  });

  it("Uses the first points label found", function() {
    var issue = { labels: [ { name: "bug" }, { name: "points: 1" }, { name: "points: 5" } ] };
    expect(getPoints(issue)).toBe(1);
  });

  it("Should handle more than single digit point values", function() {
    var issue = { labels: [ { name: "points: 10" } ] };
    expect(getPoints(issue)).toBe(10);
  });
});
