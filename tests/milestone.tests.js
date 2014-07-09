describe("Milestones", function() {
  
  it("should have a due date", function() {
    var milestone = { due_on: "2014-07-17T07:00:00Z" };
    expect(new Date(milestone.due_on)).toEqual(new Date(Date.UTC(2014, 6, 17, 7, 00, 00)));
  });

  it("should have a total point value", function() {
    var issues = [
      { labels: [ { name: "points: 1" } ] },
      { labels: [ { name: "points: 2" } ] },
      { labels: [ { name: "points: 3" } ] },
      { labels: [ { name: "points: 5" } ] }
    ];

    expect(getTotalPoints(issues)).toBe(11);
  });
});