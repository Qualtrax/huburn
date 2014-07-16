(function() {
  var huburn = angular.module('huburn', ['burndown', 'd3']);

  huburn.controller('burndownCtrl', ['$scope', '$http', 'burndown', function ($scope, $http, burndown) {
    $scope.milestones = [];

    for(var i = 0; i < 15; i++) {
      $scope.milestones.push({ points: Math.floor((Math.random() * 10) + 15), due_on: new Date(1900, 1, 1) });
    }

    var githubRequest = function($http, params, success) {
      $http.get('/github', { params: params }).success(success);
    };

    var getUrlPath = function(url) {
      var anchor = document.createElement('a');
      anchor.href = url;
      return anchor.pathname;
    };

    githubRequest($http, { path: '/repos/qualtrax/qualtrax/milestones', state: 'all', direction: 'desc' }, function(milestones) {  
      var getVelocity = function(milestone) {
        githubRequest($http, { path: '/repos/qualtrax/qualtrax/issues', milestone: milestone.number, state: 'all' }, function(data) {                    
          milestone.points = burndown.getTotalPoints(data);
          var milestones = $scope.milestones.slice(0);
          milestones.push(milestone);
          milestones.sort(function(a,b) { return new Date(a.due_on) > new Date(b.due_on); });
          $scope.milestones = milestones;
        });
      };

      for (var i = 0; i < 20 && i < milestones.length; i++) {
        getVelocity(milestones[i]);
      }
    });

    githubRequest($http, { path: '/repos/qualtrax/qualtrax/issues', milestone: '5', state: 'all' }, function(data) {
     $scope.burndown = burndown.getBurndown(data);
    });

  }]);

  huburn.directive('huburnVelocity', ['d3', function(d3) {
    return {
      restrict: 'E',
      scope: {
        data: '='
      },
      link: function(scope, element, attrs) {
        
        var height = 100;
        var padding = 10;
        var barPadding = 1;
  
        var svg = d3.select(element[0])
          .append('svg')
          .style('width', '100%')
          .style('height', height);


        var render = function(data) {
          svg.selectAll('*').remove();

          if (!data || !data.length) return;

          var yValue = function(d) { return d.points; };

          var width = svg.node().offsetWidth;
          var yScale = d3.scale.linear()
                        .domain([0, d3.max(data, yValue)])
                        .range([0, height - padding]);

          svg.selectAll('rect')
            .data(data)
            .enter()
              .append('rect')
              .attr({
                height: function(d) { return yScale(yValue(d)); },
                width: width / data.length - barPadding,
                x: function(d,i) { return i * width / data.length; },
                y: height,
                fill: d3.rgb(136, 197, 63)
              })
              .transition()
              .delay(1000)
              .duration(750)
              .attr({
                y: function(d) { return height - yScale(yValue(d)); }
              });

          svg.selectAll('rect')
            .append('title')
            .text(yValue);
        }; 

        scope.$watch('data', function(newVals, oldVals) {
          return render(newVals);
        }, true);
      }
    };
  }]);

}());