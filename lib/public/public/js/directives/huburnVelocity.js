(function() {

  angular.module('huburn').directive('huburnVelocity', ['d3', function(d3) {
    return {
      restrict: 'E',
      scope: {
        data: '='
      },
      link: function(scope, element, attrs) {
        var svg = d3.select(element[0])
          .append('svg')
          .attr({
            class: 'velocity'
          })
          .style({
            width: "100%",
            height: 100
          });

        var render = function(data) {
          svg.selectAll('*').remove();

          if (!data || !data.length) return;

          var yValue = function(d) { return d.points; };

          var width = svg.node().offsetWidth;
          var height = svg.node().offsetHeight;
          var padding = 20;
          var barPadding = 3;

          var chartWidth = width - 150 - padding * 2;

          var yScale = d3.scale.linear()
                        .domain([0, d3.max(data, yValue)])
                        .range([height - padding * 2, 0]);

          var yAxis = d3.svg.axis()
                        .scale(yScale)
                        .orient('right')
                        .tickSize(width)
                        .ticks(2);

          svg.append('g')
            .attr({ 
              class: "axis",
              transform: "translate(" + (padding + 5) + "," + padding + ")"
            })
            .call(yAxis);

          svg.selectAll('rect')
            .data(data)
            .enter()
              .append('rect')
              .attr({
                class: "bar",
                height: 0,
                width: chartWidth / data.length - barPadding,
                x: function(d,i) { return i * chartWidth / data.length + padding + 20; },
                y: height - padding
              })
              .transition()
              .duration(750)
              .attr({
                height: function(d) { return height - padding * 2 - yScale(yValue(d)); },
                y: function(d) { return padding + yScale(yValue(d)); }
              });
              

          svg.selectAll('rect')
            .append('title')
            .text(function(d) { return d.title + ' - ' + d.points + ' points'; });

          svg.append('text')
            .attr({
              x: padding + chartWidth + padding + 20,
              y: height - padding - 50,
              "font-family": "'HelveticaNeue-CondensedBold','Helvetica Neue','Arial Narrow',Arial,sans-serif",
              "font-size": "1.75em",
              fill: "#E53820"
            })
            .text('VELOCITY');

          svg.append('text')
            .attr({
              x: padding + chartWidth + padding + 20,
              y: height - padding,
              "font-family": "'HelveticaNeue-CondensedBold','Helvetica Neue','Arial Narrow',Arial,sans-serif",
              "font-size": "4em",
              fill: "#fff"
            })
            .text(d3.mean(data, yValue).toFixed(1));
        }; 

        scope.$watch('data', function(newVals, oldVals) {
          return render(newVals);
        }, true);
      }
    };
  }]);

})();