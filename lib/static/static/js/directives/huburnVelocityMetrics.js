(function() {
  var milestonesInVelocity = 6;

  angular.module('huburn')
    .directive('huburnVelocityMetrics', ['d3', '$window', function(d3, $window) {
      return {
        restrict: 'E',
        scope: {
          closedIterationData: '=',
          openIterationData: '=',
          showMet: '='

        },
        templateUrl: 'templates/velocityMetrics.html'
      };
    }]);

})();