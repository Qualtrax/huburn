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
                        .domain([0, d3.max(data.coords, yValue) * 1.1])
                        .range([height - padding * 2, 0]);

          var yAxis = d3.svg.axis()
                        .scale(yScale)
                        .orient('left')
                        .tickSize(width - padding * 3)
                        .ticks(5);

          var gy = svg.append('g')
            .attr({ 
              class: "axis",
              transform: "translate(" + (width - padding) + "," + padding + ")"
            })
            .call(yAxis);

          gy.selectAll("g")
            .filter(function(d) { return d; })
            .classed("minor", true);

          var xValue = function(d) { return new Date(d.date); };

          var xScale = d3.time.scale()
                        .domain([d3.min(data.coords,xValue), d3.max(data.coords,xValue)])
                        .rangeRound([0, width]);

          console.log(d3.min(data.coords, xValue));
          console.log(d3.max(data.coords, xValue));   
            

          var xAxis = d3.svg.axis()
                        .scale(xScale)
                        .orient('bottom')
                        .ticks(d3.time.days, 1)
                        .tickSize(0);

          var gx = svg.append('g')
                    .attr({
                      class: "axis",
                      transform: "translate(0," + (height - padding) + ")"
                    })
                    .call(xAxis);

          var line = d3.svg.line()
                      .x(function(d,i) { return padding * 3 + xScale(xValue(d)); })
                      .y(function(d) { return padding + yScale(yValue(d)); });

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
                cx: function(d,i) { return padding  * 3 + xScale(i); },
                cy: function(d) { return padding + yScale(yValue(d)); },
                r: 5,
                fill: "#88C53F",
                stroke: "#65922F",
                "stroke-width": 3
              });

          svg.selectAll('circle')
            .append('title')
            .text(yValue);

          var daysRemaining = svg.append('g').attr({ class: "badge", transform: "translate(" + width + "," + padding + ")" });
          daysRemaining.append('text').attr({ class: "title", x: 0, y: 28 }).text('DAYS');
          daysRemaining.append('text').attr({ class: "title", x: 0, y: 28 + 28 }).text('REMAINING');
          daysRemaining.append('text').attr({ class: "value", x: 0, y: 28 + 28 + 48 }).text(data.daysToGo);

          var pointsRemaining = svg.append('g').attr({ class: "badge", transform: "translate(" + width + "," + 130 + ")" });
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