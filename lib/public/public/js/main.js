(function() {
  var huburn = angular.module('huburn', ['burndown', 'd3']);

  huburn.controller('burndownCtrl', ['$scope', '$http', 'burndown', function ($scope, $http, burndown) {
    $scope.milestones = [];

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
          $scope.milestones = $scope.milestones.concat(milestone).sort(function(a,b) { return a.due_on > b.due_on; });
        });
      };

      for (var i = 0; i < 8 && i < milestones.length; i++) {
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
      link: function(scope, element, attrs) {
        var svg = d3.select(element[0])
          .append('svg')
          .style('width', '100%');

        var margin = 20;
        var barWidth = 20;
        var barPadding = 5;

        var render = function(data) {
          svg.selectAll(*).remove();

          if (!data) return;

          var width = d3.select(element[0]).node().offsetWidth - margin;
          var height = d3.select(element[0]).node().offsetHeight - margin;
          var color = d3.scale.category20();
          var yScale = d3.scale.linear()
                        .domain([0, d3.max(data, function(d) {
                          return d.score;
                        })])
                        .range([0, height]);
        }; 
      }
    };
  }]);

}());