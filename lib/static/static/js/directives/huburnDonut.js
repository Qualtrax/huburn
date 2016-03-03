(function () {
    'use strict'

    angular
        .module('huburn')
        .directive('huburnDonut', huburnDonut);

    huburnDonut.$inject = ['$window', 'd3'];

    function huburnDonut($window, d3) {
        var directive = {
            restrict: 'E',
            scope: {
                value: '='
            },
            link: link
        };

        return directive;

        function link(scope, element, attrs) {
            var duration = 500;
            var firstWatch = true;
            
            scope.$watch("value", function(newValue, oldValue) {
                if (firstWatch || (newValue !== null || typeof newValue !== "undefined") && typeof oldValue !== "undefined" && newValue !== oldValue) {
                    drawDonutChart('#' + element[0].id, scope.value, 75, 75, ".35em");
                    firstWatch = false;
                }
            });

            function drawDonutChart(element, percent, width, height, text_y) {
                width = typeof width !== 'undefined' ? width : 85;
                height = typeof height !== 'undefined' ? height : 85;
                text_y = typeof text_y !== 'undefined' ? text_y : "-.10em";

                var dataset = {
                        lower: calcPercent(0),
                        upper: calcPercent(percent)
                };
                var radius = Math.min(width, height) / 2;
                var pie = d3.layout.pie().sort(null);
                var format = d3.format(".0%");

                var arc = d3.svg.arc()
                        .innerRadius(radius - 12)
                        .outerRadius(radius);

                var donut = d3.select(element);
                donut.selectAll('svg').remove();
                var svg = donut.append("svg")
                        .attr("width", width)
                        .attr("height", height)
                        .append("g")
                        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

                var path = svg.selectAll("path")
                        .data(pie(dataset.lower))
                        .enter().append("path")
                        .attr("class", function(d, i) { return "color" + i })
                        .attr("d", arc)
                        .each(function(d) { this._current = d; });

                var text = svg.append("text")
                        .attr("text-anchor", "middle")
                        .attr("dy", text_y);

                if (typeof(percent) === "string") {
                    text.text(percent);
                }
                else {
                    var progress = 0;
                    var timeout = setTimeout(function () {
                        clearTimeout(timeout);
                        path = path.data(pie(dataset.upper));
                        path.transition().duration(duration).attrTween("d", function (a) {
                            // Store the displayed angles in _current.
                            // Then, interpolate from _current to the new angles.
                            // During the transition, _current is updated in-place by d3.interpolate.
                            var i  = d3.interpolate(this._current, a);
                            var i2 = d3.interpolate(progress, percent)
                            this._current = i(0);
                            return function(t) {
                                text.text( format(i2(t) / 100) );
                                return arc(i(t));
                            };
                        });
                    }, 200);
                }
            };

            function calcPercent(percent) {
                return [percent, 100-percent];
            };
        }
    }
})();