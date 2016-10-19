describe("Milestones", function() {
    var issueService;

    beforeEach(module('huburn'));

    beforeEach(inject(function (_issueService_) {
        issueService = _issueService_;
    }));

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

        expect(issueService.getTotalPoints(issues)).toBe(11);
    });

    it("should be based on a point label", function() {
        var issue = { labels: [ { name: "bug" }, { name: "points: 1" } ] };
        expect(issueService.getPoints(issue)).toBe(1);
    });

    it("is determined by the first point label found", function() {
        var issue = { labels: [ { name: "bug" }, { name: "points: 1" }, { name: "points: 5" } ] };
        expect(issueService.getPoints(issue)).toBe(1);
    });

    it("can be more than a single digit", function() {
        var issue = { labels: [ { name: "points: 10" } ] };
        expect(issueService.getPoints(issue)).toBe(10);
    });

    it("should be zero for issues without a point label", function() {
        var issue = { labels: [] }
        expect(issueService.getPoints(issue)).toBe(0);
    });
});