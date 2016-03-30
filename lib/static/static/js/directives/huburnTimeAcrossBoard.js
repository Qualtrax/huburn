(function() {
  var milestonesInVelocity = 6;

  angular.module('huburn')
    .directive('huburnTimeAcrossBoard', [function() {
      return {
        restrict: 'E',
        scope: {
          closedIterationData: '='
        },
        templateUrl: 'templates/huburnTimeAcrossBoard.html'
      };
    }]);

})();