(function() {
  var milestonesInVelocity = 6;

  angular.module('huburn')
    .directive('huburnVelocity', ['d3', function(d3) {
      return {
        restrict: 'E',
        scope: {
          data: '='
        },
        link: function(scope, element, attrs) {
          var svg = d3.select(element[0])
            .append('svg')
            .attr({ class: 'velocity' })
            .style({ height: '20em' });

          function render(data) {
          	var height = 140;
          	var width = svg.node().offsetWidth;
          	renderGraph(data, height, width);
          	renderBadges(data, 40, 150);
          };

          function renderBadges(data, x, y) {
          	svg.select('g.badges').remove();

          	var badges = svg.append('g').attr({ class: 'badges', transform: translate(x,y) });

     		if (!data.length) return;

     		var velocityMilestones = getVelocityMilestones(data);

          	var numberMet = velocityMilestones.filter(met).length;
            appendBadge(badges, 0, 0, "Met", numberMet);

            var velocity = (velocityMilestones.map(points).reduce(sum) / milestonesInVelocity).toFixed(1);
            appendBadge(badges, 100, 0, "Velocity", velocity);

            var averageFreeranges = (velocityMilestones.map(freeranges).reduce(sum) / milestonesInVelocity).toFixed(1);
            appendBadge(badges, 240, 0, "Freerange", averageFreeranges);

            var numberFirelanes = (velocityMilestones.map(firelanes).reduce(sum) / milestonesInVelocity).toFixed(1);
            appendBadge(badges, 390, 0, "Firelanes", numberFirelanes);

            var numberEscalation = (velocityMilestones.map(escalations).reduce(sum) / milestonesInVelocity).toFixed(1);
            appendBadge(badges, 530, 0, "Escalations", numberEscalation);
          };

          function renderGraph(data, height, width) {
          	svg.select('g.graph').remove();

          	var graph = svg.append('g').attr({ class: 'graph' });

          	if (!data.length) return;

          	var axisPadding = 20;

          	var yScale = d3.scale.linear()
              .domain([0, d3.max(data, points)])
              .range([height - axisPadding * 2, 0]);

            var yAxis = d3.svg.axis()
              .scale(yScale)
              .orient('left')
              .tickSize(width - axisPadding * 2)
              .ticks(2);

            var gy = graph.append('g')
              .attr({ 
                class: "axis",
                transform: translate(width, axisPadding)
              })
              .call(yAxis);

            var xScale = d3.time.scale()
              .domain([d3.min(data, dueOn), d3.max(data, dueOn)])
              .rangeRound([0, width - axisPadding * 2]);

            var xAxis = d3.svg.axis()
              .scale(xScale)
              .orient('bottom')
              .ticks(d3.time.months, 3)
              .tickSize(0)
              .tickFormat(d3.time.format('%b'));

            var gx = graph.append('g')
              .attr({
                class: "axis",
                transform: translate(axisPadding, height - axisPadding)
              })
              .call(xAxis);

            var barPadding = 3; 

            var xPosition = function(d,i) { return i * (width - axisPadding * 2 - 8) / data.length + axisPadding * 2 + 5; };

            graph.selectAll('rect')
              .data(data)
              .enter()
                .append('rect')
                .attr({
                  class: getRectClass,
                  height: 0,
                  width: (width - axisPadding) / data.length - barPadding,
                  x: xPosition,
                  y: height - axisPadding
                })
                .transition()
                .duration(750)
                .attr({
                  height: function(d) { return height - axisPadding * 2 - yScale(points(d)); },
                  y: function(d) { return axisPadding + yScale(points(d)); }
                });
          };

          function getRectClass(m) { return met(m) ? 'met' : ''; };
          function translate(x,y) { return 'translate(' + x + ',' + y + ')' };

          function getVelocityMilestones(data) { return data.slice(-milestonesInVelocity); };
          function sum(a,b) { return a+b; };
          function met(m) { return m.metadata.met; };
          function points(m) { return m.metadata.pointsEarned ? m.metadata.pointsEarned : m.metadata.points; };
          function freeranges(m) { return m.metadata.freeranges; };
          function firelanes(m) { return m.metadata.firelanes; };
          function escalations(m) { return m.metadata.escalations; };
          function dueOn(m) { return new Date(m.due_on); };

          function appendBadge(parent, x, y, title, value) {
		    var badge = parent.append('g').attr({ class: "badge", transform: "translate(" + x + "," + y + ")" });
		    badge.append('text').attr({ class: "title", x: 0, y: 28 }).text(title);
		    badge.append('text').attr({ class: "value", x: 0, y: 28 + 48 }).text(value);
		  };

          scope.$watch('data', function(newVals, oldVals) {
            return render(newVals);
          }, true);
        }
      };
    }]);

})();