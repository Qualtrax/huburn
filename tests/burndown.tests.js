describe("Burndown", function() {

  it("should group issues closed on the same day", function() {
    var issues = [
      { labels: [ { name: "points: 1" } ], closed_at: "2014-07-01T18:58:10Z" },
      { labels: [ { name: "points: 2" } ], closed_at: "2014-07-01T18:58:10Z" },
      { labels: [ { name: "points: 2" } ], closed_at: "2014-07-02T18:58:10Z" },
      { labels: [ { name: "points: 2" } ], closed_at: "2014-07-03T18:58:10Z" },
      { labels: [ { name: "points: 2" } ], closed_at: "2014-07-03T18:58:10Z" },
    ];
    
    var expectedBurndown = {
      total: 9,
      coords: [ 
        { date: new Date(2014, 6, 1), burned: 3, remaining: 6 },
        { date: new Date(2014, 6, 2), burned: 2, remaining: 4 },
        { date: new Date(2014, 6, 3), burned: 4, remaining: 0 },
      ]
    };
    
    expect(getBurndown(issues)).toEqual(expectedBurndown);
  });

  it("should sort coords by day", function() {
    var issues = [
      { labels: [ { name: "points: 2" } ], closed_at: "2014-07-02T18:58:10Z" },
      { labels: [ { name: "points: 2" } ], closed_at: "2014-07-01T18:58:10Z" },
      { labels: [ { name: "points: 1" } ], closed_at: "2014-07-01T18:58:10Z" },
      { labels: [ { name: "points: 2" } ], closed_at: "2014-07-03T18:58:10Z" },
      { labels: [ { name: "points: 2" } ], closed_at: "2014-07-03T18:58:10Z" },
    ];
    
    var expectedBurndown = {
      total: 9,
      coords: [ 
        { date: new Date(2014, 6, 1), burned: 3, remaining: 6 },
        { date: new Date(2014, 6, 2), burned: 2, remaining: 4 },
        { date: new Date(2014, 6, 3), burned: 4, remaining: 0 },
      ]
    };
    
    expect(getBurndown(issues)).toEqual(expectedBurndown);
  });

  it("should ignore ignore open issues", function() {
    var issues = [
      { labels: [ { name: "points: 2" } ], closed_at: "2014-07-02T18:58:10Z" },
      { labels: [ { name: "points: 2" } ], closed_at: "2014-07-01T18:58:10Z" },
      { labels: [ { name: "points: 1" } ], closed_at: "2014-07-01T18:58:10Z" },
      { labels: [ { name: "points: 2" } ], closed_at: "2014-07-03T18:58:10Z" },
      { labels: [ { name: "points: 2" } ], closed_at: null },
    ];
    
    var expectedBurndown = {
      total: 9,
      coords: [ 
        { date: new Date(2014, 6, 1), burned: 3, remaining: 6 },
        { date: new Date(2014, 6, 2), burned: 2, remaining: 4 },
        { date: new Date(2014, 6, 3), burned: 2, remaining: 2 }
      ]
    };
    
    expect(getBurndown(issues)).toEqual(expectedBurndown);
  });
});