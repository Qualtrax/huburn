(function() {
  var milestonesInVelocity = 6;

  angular.module('huburn')
    .directive('huburnEffortDistribution', [function() {
      return {
        restrict: 'E',
        scope: {
          closedIterationData: '='
        },
        templateUrl: 'templates/huburnEffortDistribution.html'
      };
    }]);

})();