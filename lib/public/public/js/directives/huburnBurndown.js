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
                    .attr({
                      class: "burndown"
                    })
                    .style({
                      width: "100%",
                      height: 400
                    });

        var render = function(data) {
          svg.selectAll('*').remove();

          if (!data || !data.coords || !data.coords.length) return;

          var width = svg.node().offsetWidth - 150;
          var height = svg.node().offsetHeight;
          var padding = 20;          

          var xScale = d3.scale.linear()
                        .domain([0, data.coords.length])
                        .range([0, width - padding * 2]);

          var yValue = function(d) { return d.remaining; };

          var yScale = d3.scale.linear()
                        .domain([0, d3.max(data.coords, yValue) * 1.05])
                        .range([height - padding * 2, 0]);

          var yAxis = d3.svg.axis()
                        .scale(yScale)
                        .orient('right')
                        .tickSize(width)
                        .ticks(5);

          var line = d3.svg.line()
                      .x(function(d,i) { return padding + padding + 5 + xScale(i); })
                      .y(function(d) { return padding + yScale(yValue(d)); });

          var gy = svg.append('g')
            .attr({
              class: "y axis",
              transform: "translate(0," + padding + ")"
            })  
            .call(yAxis);

          gy.selectAll("g")
            .filter(function(d) { return d; })
            .classed("minor", true);

          gy.selectAll("text")
            .attr({ 
              x: 4,
              dy: 4
            });

          svg.append("path")
            .datum(data.coords)
            .attr({
              class: "line",
              d: line
            });

          svg.selectAll('circle')
            .data(data.coords)
            .enter()
              .append('circle')
              .attr({
                cx: function(d,i) { return padding + padding + 5 + xScale(i); },
                cy: function(d) { return padding + yScale(yValue(d)); },
                r: 5,
                fill: "#88C53F",
                stroke: "#65922F",
                "stroke-width": 3
              });

          svg.selectAll('circle')
            .append('title')
            .text(yValue);

          svg.append('text')
            .attr({
              x: width + padding,
              y: padding + 50,
              "font-family": "'HelveticaNeue-CondensedBold','Helvetica Neue','Arial Narrow',Arial,sans-serif",
              "font-size": "1.75em",
              fill: "#E53820"
            })
            .text('DAYS');

          svg.append('text')
            .attr({
              x: width + padding,
              y: padding + 75,
              "font-family": "'HelveticaNeue-CondensedBold','Helvetica Neue','Arial Narrow',Arial,sans-serif",
              "font-size": "1.75em",
              fill: "#E53820"
            })
            .text('REMAINING');

          svg.append('text')
            .attr({
              x: width + padding,
              y: padding + 125,
              "font-family": "'HelveticaNeue-CondensedBold','Helvetica Neue','Arial Narrow',Arial,sans-serif",
              "font-size": "4em",
              fill: "#fff"
            })
            .text(data.daysToGo);

          svg.append('text')
            .attr({
              x: width + padding,
              y: padding + 175,
              "font-family": "'HelveticaNeue-CondensedBold','Helvetica Neue','Arial Narrow',Arial,sans-serif",
              "font-size": "1.75em",
              fill: "#E53820"
            })
            .text('POINTS');

          svg.append('text')
            .attr({
              x: width + padding,
              y: padding + 200,
              "font-family": "'HelveticaNeue-CondensedBold','Helvetica Neue','Arial Narrow',Arial,sans-serif",
              "font-size": "1.75em",
              fill: "#E53820"
            })
            .text('REMAINING');

          svg.append('text')
            .attr({
              x: width + padding,
              y: padding + 250,
              "font-family": "'HelveticaNeue-CondensedBold','Helvetica Neue','Arial Narrow',Arial,sans-serif",
              "font-size": "4em",
              fill: "#fff"
            })
            .text(data.remaining);

        }; 

        scope.$watch('data', function(newVals, oldVals) {
          return render(newVals);
        }, true);
      }
    };
  }]);

})();