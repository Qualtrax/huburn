(function() {

  angular.module('huburn').directive('huburnBurndown', [ '$window', 'd3', function($window, d3) {
    return {
      restrict: 'E',
      scope: {
        data: '='
      },
      link: function(scope, element, attrs) {
        var svg = d3.select(element[0])
          .append('svg')
          .attr({ class: "burndown" });

        var render = function(data) {
          svg.selectAll('*').remove();

          if (!data || !data.burndownLine || !data.burndownLine.length) return;

          var tip = d3.tip()
            .attr('class', 'd3-tip')
            .offset([-10, 0])
            .html(function(d) {
              return d.remaining;
            })

          svg.call(tip);

          var width = svg.node().offsetWidth - 150;
          var height = svg.node().offsetHeight;
          var padding = 20;          

          var xScale = d3.scale.linear()
            .domain([0, data.burndownLine.length])
            .range([0, width - padding * 2]);

          var yValue = function(d) { return d.remaining; };

          var yScale = d3.scale.linear()
            .domain([0, d3.max(data.burndownLine, yValue) * 1.05])
            .range([height - padding * 4, 0]);

          var yAxis = d3.svg.axis()
            .scale(yScale)
            .orient('left')
            .tickSize(width - padding * 3)
            .ticks(5);
  
          var gy = svg.append('g')
            .attr({ class: "axis", transform: "translate(" + (width - padding) + "," + padding + ")" })
            .call(yAxis);

          var xValue = function(d) { return new Date(d.date); };

          var xScale = d3.scale.ordinal()
            .domain(data.burndownLine.map(xValue))
            .rangePoints([0, width - padding * 4]);

          var xAxis = d3.svg.axis()
            .scale(xScale)
            .orient('bottom')
            .ticks(d3.time.days, 1)
            .tickSize(-height + padding * 3)
            .tickFormat(d3.time.format('%a'));

          var gx = svg.append('g')
            .attr({ class: "axis", transform: "translate(" + padding * 2.5 + "," + (height - padding * 2.5) + ")" })
            .call(xAxis);

          var pastDays = data.burndownLine.filter(function(d) { return new Date(xValue(d)) < new Date(); });

          var drawLine = function(svg, coords, groupClass) {
            var line = d3.svg.line()
            .x(function(d,i) { return padding * 2.5 + xScale(xValue(d)); })
            .y(function(d) { return padding + yScale(yValue(d)); });

            var g = svg.append('g')
              .attr({ class: groupClass });

            g.append('path')
            .datum(coords)
            .attr({ d: line });
          }

          drawLine(svg, data.idealLine, 'ideal-line');
          drawLine(svg, pastDays, 'burndown-line');

          svg.select('g.burndown-line')
            .selectAll('circle')
            .data(pastDays)
            .enter()
              .append('circle')
              .attr({
                cx: function(d,i) { return padding * 2.5 + xScale(xValue(d)); },
                cy: function(d) { return padding + yScale(yValue(d)); },
                r: 6
              })
              .on('mouseover', tip.show)
              .on('mouseout', tip.hide);

          svg.append('g')
            .attr({ class: "in-progress" })
            .selectAll('circle')
            .data([ { remaining: data.remaining - data.pointsInProgress }])
            .enter()
              .append('circle')
              .attr({
                cx: function(d,i) { return padding * 2.5 + xScale(xValue(pastDays[pastDays.length-1])); },
                cy: function(d) { return padding + yScale(yValue(d)); },
                r: 5
              })
              .on('mouseover', tip.show)
              .on('mouseout', tip.hide);

          var daysRemaining = svg.append('g').attr({ class: "badge", transform: "translate(" + width + "," + 0 + ")" });
          daysRemaining.append('text').attr({ class: "title", x: 0, y: 28 }).text('DAYS');
          daysRemaining.append('text').attr({ class: "title", x: 0, y: 28 + 28 }).text('REMAINING');
          daysRemaining.append('text').attr({ class: "value", x: 0, y: 28 + 28 + 48 }).text(data.daysToGo);

          var pointsRemaining = svg.append('g').attr({ class: "badge", transform: "translate(" + width + "," + 110 + ")" });
          pointsRemaining.append('text').attr({ class: "title", x: 0, y: 28 }).text('POINTS');
          pointsRemaining.append('text').attr({ class: "title", x: 0, y: 28 + 28 }).text('REMAINING');
          pointsRemaining.append('text').attr({ class: "value", x: 0, y: 28 + 28 + 48 }).text(data.remaining);
        }; 

        scope.$watch('data', function(newVals, oldVals) {
          return render(newVals);
        }, true);
      }
    };
  }]);
})();