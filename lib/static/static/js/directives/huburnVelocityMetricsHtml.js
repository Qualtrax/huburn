(function() {
  var milestonesInVelocity = 6;

  angular.module('huburn')
    .directive('huburnVelocityMetricsHtml', ['d3', '$window', function(d3, $window) {
      return {
        restrict: 'E',
        scope: {
          data: '='
        },
        templateUrl: 'partials/velocityMetrics.html'
      };
    }]);

})();