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
            .attr({ class: 'velocity' });

          function render(data) {
          	var height = 140;
          	var width = svg.node().offsetWidth;
          	renderGraph(data, 0, 0, height, width);
          	renderBadges(data, 40, 150);
          };

          function renderBadges(data, x, y) {
          	svg.select('g.badges').remove();

          	var badges = svg.append('g').attr({ class: 'badges', transform: translate(x,y) });

            if (!data.length) return;

            var velocityMilestones = getVelocityMilestones(data);

          	var numberMet = velocityMilestones.filter(met).length;
            appendBadge(badges, 0, 0, "Met", numberMet, metClass);

            var velocity = (velocityMilestones.map(points).reduce(sum) / milestonesInVelocity).toFixed(1);
            appendBadge(badges, 100, 0, "Velocity", velocity, noValueClass);

            var averageFreeranges = (velocityMilestones.map(freeranges).reduce(sum) / milestonesInVelocity).toFixed(1);
            appendBadge(badges, 240, 0, "Freerange", averageFreeranges, freerangeClass);

            var numberFirelanes = (velocityMilestones.map(firelanes).reduce(sum) / milestonesInVelocity).toFixed(1);
            appendBadge(badges, 390, 0, "Firelanes", numberFirelanes, firelaneClass);

            var numberEscalation = (velocityMilestones.map(escalations).reduce(sum) / milestonesInVelocity).toFixed(1);
            appendBadge(badges, 530, 0, "Escalations", numberEscalation, escalationClass);
          };

          function renderGraph(data, x, y, height, width) {
          	svg.select('g.graph').remove();

          	var graph = svg.append('g')
                           .attr({
                             class: 'graph',
                             transform: translate(x,y)
                           });

          	if (!data.length) return;

          	var axisPadding = 20;

          	var yScale = d3.scale.linear()
              .domain([0, d3.max(data, points)])
              .range([height - axisPadding * 3, 0]);

            var yAxis = d3.svg.axis()
              .scale(yScale)
              .orient('left')
              .tickSize(width - axisPadding * 2)
              .ticks(2);

            var gy = graph.append('g')
              .attr({ 
                class: "axis",
                transform: translate(width, axisPadding * 2)
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

            var velocityScale = d3.scale.ordinal()
              .domain([0])
              .rangeBands([0, barPosition(null, data.length) - barPosition(null, data.length - milestonesInVelocity)]);

            var velocityAxis = d3.svg.axis()
              .scale(velocityScale)
              .orient('bottom')
              .ticks(1)
              .tickSize(5)
              .tickFormat('VELOCITY');

            var gVelocity = graph.append('g')
              .attr({
                class: "velocity-axis",
                transform: translate(barPosition(null, data.length - milestonesInVelocity) - 2, axisPadding)
              })
              .call(velocityAxis);

            gVelocity.selectAll('text').attr({ transform: "translate(0, -24)" });
            gVelocity.selectAll('.tick line').attr({ transform: "translate(0,-2)" });

            var barPadding = 3; 

            function barPosition(d,i) { return i * (width - axisPadding * 2 - 8) / data.length + axisPadding * 2 + 5; };

            var tip = d3.tip()
              .attr('class', 'd3-tip')
              .offset([-10, 0])
              .html(function(m) {
                var titleAndPoints = '<span class="title">' + m.title + ':</span> <span class="points">' + points(m) + ' points</span>';
  
                if (met(m))
                  return titleAndPoints + ' <span class="met">(Met)</span>';
              
                return titleAndPoints + ' <span class="not-met">(Not Met)</span>';
              });

            graph.call(tip);

            graph.selectAll('rect')
              .data(data)
              .enter()
                .append('rect')
                .attr({
                  class: getRectClass,
                  height: 0,
                  width: (width - axisPadding) / data.length - barPadding,
                  x: barPosition,
                  y: height - axisPadding
                })
                .on('mouseover', tip.show)
                .on('mouseout', tip.hide)
                .transition()
                .duration(750)
                .attr({
                  height: function(d) { return height - axisPadding * 3 - yScale(points(d)); },
                  y: function(d) { return axisPadding * 2 + yScale(points(d)); }
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

          function metClass(value) {
            if (value == 6) return 'super-green';
            else if (value == 5) return 'green';
            else if (value == 4 || value == 3) return 'yellow';
            else return 'red';
          }

          function freerangeClass(value) {
            if (value >= 5) return 'super-green';
            else if (value >= 4) return 'green';
            else if (value >= 3) return 'yellow';
            else return 'red';
          }

          function firelaneClass(value) {
            if (value == 0) return 'super-green';
            else if (value <= 2 / milestonesInVelocity) return 'green';
            else if (value <= 3 / milestonesInVelocity) return 'yellow';
            else return 'red';
          }

          function escalationClass(value) {
            if (value < 1) return 'super-green';
            else if (value < 1.5) return 'green';
            else if (value < 2) return 'yellow';
            else return 'red';
          }

          function noValueClass() {
            return '';
          }

          function appendBadge(parent, x, y, title, value, valueClassFunc) {
            var badge = parent.append('g').attr({ class: "badge", transform: "translate(" + x + "," + y + ")" });
            badge.append('text').attr({ class: "title", x: 0, y: 28 }).text(title);

            if (valueClassFunc)
              badge.append('text').attr({ class: "value " + valueClassFunc(value), x: 0, y: 28 + 48 }).text(value);
            else
		          badge.append('text').attr({ class: "value", x: 0, y: 28 + 48 }).text(value);
		      };

          scope.$watch('data', function(newVals, oldVals) {
            return render(newVals);
          }, true);
        }
      };
    }]);

})();