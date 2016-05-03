(function() {
  var milestonesInVelocity = 6;

  angular.module('huburn')
    .directive('huburnVelocityGraph', ['d3', '$window', function(d3, $window) {
      return {
        restrict: 'E',
        scope: {
          data: '=',
          showMet: '='
        },
        link: function(scope, element, attrs) {
          
          var svg = d3.select(element[0])
            .append('svg')
            .attr({ class: 'velocity graph' });

          function render(data) {
          	var height = 140;
            
          	var rect = svg[0][0].getBoundingClientRect();
            var width = rect.right - rect.left;
          	renderGraph(data, 0, 0, height, width);
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
              .tickFormat('METRIC PERIOD');

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
                
                if (!scope.showMet)
                  return titleAndPoints;

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
                  class: function(m) { return met(m) || !scope.showMet ? 'met' : ''; },
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

          function translate(x,y) { return 'translate(' + x + ',' + y + ')' };
          function getVelocityMilestones(data) { return data.slice(-milestonesInVelocity); };
          function sum(a,b) { return a+b; };
          function met(m) { return m.metadata.met; };
          function points(m) { return m.metadata.pointsEarned ? m.metadata.pointsEarned : m.metadata.points; };
          function dueOn(m) { return new Date(m.due_on); };

          window.onresize = function() {
            scope.$apply();
          };

          scope.$watch(function() {
            return angular.element($window)[0].innerWidth;
          }, function() {
            render(scope.data);
          });

          scope.$watch('data', function(newVals, oldVals) {
            return render(newVals);
          }, true);
        }
      };
    }]);

})();