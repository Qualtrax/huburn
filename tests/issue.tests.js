describe("Point value of an issue", function() {

  it("should be based on a point label", function() {
    var issue = { labels: [ { name: "bug" }, { name: "points: 1" } ] };
    expect(getCapitalizablePoints(issue)).toBe(1);
  });

  it("is determined by the first point label found", function() {
    var issue = { labels: [ { name: "bug" }, { name: "points: 1" }, { name: "points: 5" } ] };
    expect(getCapitalizablePoints(issue)).toBe(1);
  });

  it("can be more than a single digit", function() {
    var issue = { labels: [ { name: "points: 10" } ] };
    expect(getCapitalizablePoints(issue)).toBe(10);
  });

  it("should be zero for issues without a point label", function() {
    var issue = { labels: [] }
    expect(getCapitalizablePoints(issue)).toBe(0);
  });
});
