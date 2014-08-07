(function() {

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

          var render = function(data) {
            svg.selectAll('*').remove();

            if (!data || !data.length) return;

            var yValue = function(d) { 
              if (d.pointsEarned)
                return d.pointsEarned;

              return d.points;
            };

            var tip = d3.tip()
              .attr('class', 'd3-tip')
              .offset([-10, 0])
              .html(function(d) {
                var titleAndPoints = '<span class="title">' + d.title + ':</span> <span class="points">' + yValue(d) + ' points</span>';
  
                if (d.met)
                  return titleAndPoints + ' <span class="met">(Met)</span>';
              
                return titleAndPoints + ' <span class="not-met">(Not Met)</span>';
              });

            svg.call(tip);

            var width = svg.node().offsetWidth;
            var height = svg.node().offsetHeight;
            var yPadding = 30;
            var xPadding = 20;
            var barPadding = 2;
            var chartWidth = width - 150 - xPadding * 3;

            var yScale = d3.scale.linear()
              .domain([0, d3.max(data, yValue)])
              .range([height - yPadding * 2, 0]);

            var yAxis = d3.svg.axis()
              .scale(yScale)
              .orient('left')
              .tickSize(chartWidth)
              .ticks(2);

            var gy = svg.append('g')
              .attr({ 
                class: "axis",
                transform: "translate(" + (chartWidth + xPadding * 2) + "," + yPadding + ")"
              })
              .call(yAxis);

            var xValue = function(d) { return new Date(d.due_on); };

            var xScale = d3.time.scale()
              .domain([d3.min(data,xValue), d3.max(data,xValue)])
              .rangeRound([0, chartWidth]);

            var xAxis = d3.svg.axis()
              .scale(xScale)
              .orient('bottom')
              .ticks(d3.time.months, 3)
              .tickSize(0)
              .tickFormat(d3.time.format('%b'));

            var xPosition = function(d,i) { return i * (chartWidth - 8) / data.length + xPadding * 2 + 5; };

            var gx = svg.append('g')
              .attr({
                class: "axis",
                transform: "translate(" + xPadding + "," + (height - yPadding) + ")"
              })
              .call(xAxis);

            var velocityScale = d3.scale.ordinal()
              .domain([0])
              .rangeBands([0, xPosition(null, data.length) - xPosition(null, data.length - 8)]);

            var velocityAxis = d3.svg.axis()
              .scale(velocityScale)
              .orient('bottom')
              .ticks(1)
              .tickSize(5)
              .tickFormat('VELOCITY');

            var gVelocity = svg.append('g')
              .attr({
                class: "velocity-axis",
                transform: "translate(" + (xPosition(null, data.length - 8) - 2) + "," + (yPadding - 10) + ")"
              })
              .call(velocityAxis);

            var getRectClass = function(d,i) {
              var classes = [];

              if (i > data.length - 9 && i <= data.length - 1)
                classes.push('in-velocity');

              if (d.met)
                classes.push('met');

              return classes.join(' '); 
            }

            gVelocity.selectAll('text')
              .attr({
                transform: "translate(0, -24)"
              })

            gVelocity.selectAll('.tick line')
              .attr({
                transform: "translate(0,-2)"
              })

            svg.selectAll('rect')
              .data(data)
              .enter()
                .append('rect')
                .attr({
                  class: getRectClass,
                  height: 0,
                  width: (chartWidth - xPadding) / data.length - barPadding,
                  x: xPosition,
                  y: height - yPadding
                })
                .on('mouseover', tip.show)
                .on('mouseout', tip.hide)
                .transition()
                .duration(750)
                .attr({
                  height: function(d) { return height - yPadding * 2 - yScale(yValue(d)); },
                  y: function(d) { return yPadding + yScale(yValue(d)); }
                });

            var lastEightMilestones = data.slice(-8);

            appendBadge(svg, chartWidth + xPadding * 3, height - (yPadding + 28 + 48), 'Velocity', d3.mean(lastEightMilestones, yValue).toFixed(1));
          }; 

          scope.$watch('data', function(newVals, oldVals) {
            return render(newVals);
          }, true);
        }
      };
  }]);

  var appendBadge = function(svg, x, y, title, value) {
    var badge = svg.append('g').attr({ class: "badge", transform: "translate(" + x + "," + y + ")" });
    badge.append('text').attr({ class: "title", x: 0, y: 28 }).text(title);
    badge.append('text').attr({ class: "value", x: 0, y: 28 + 48 }).text(value);
  };

})();