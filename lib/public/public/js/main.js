(function() {
  var huburn = angular.module('huburn', ['d3']);

  huburn.controller('burndownCtrl', ['$scope', '$http', 'burndownCalculator', function ($scope, $http, burndownCalculator) {
    $scope.milestones = [];
    $scope.signedIn = false;

    var githubRequest = function($http, params, success) {
      $http.get('/github', { params: params }).success(success);
    };

    var getUrlPath = function(url) {
      var anchor = document.createElement('a');
      anchor.href = url;
      return anchor.pathname;
    };

    $http.get('/signedin').success(function(data) {
      $scope.signedIn = data.signedIn;
    });

    var getData = function() {
      githubRequest($http, { path: '/repos/qualtrax/qualtrax/milestones', state: 'all', direction: 'desc' }, function(milestones) {  
        var getVelocity = function(milestone) {
          githubRequest($http, { path: '/repos/qualtrax/qualtrax/issues', milestone: milestone.number, state: 'all' }, function(data) {                    
            milestone.points = burndownCalculator.getTotalPoints(data);
            var milestones = $scope.milestones.slice(0);
            milestones.push(milestone);
            milestones.sort(function(a,b) { return new Date(a.due_on) - new Date(b.due_on); });
            $scope.milestones = milestones;
          });
        };

        for (var i = 0; i < 20 && i < milestones.length; i++) {
          getVelocity(milestones[i]);
        }
      });

      githubRequest($http, { path: '/repos/qualtrax/qualtrax/milestones/23' }, function(milestone) {
        githubRequest($http, { path: '/repos/qualtrax/qualtrax/issues', milestone: '23', state: 'all' }, function(data) {
         $scope.burndown = burndownCalculator.getBurndown(milestone, data);
        });
      });
    };

    $scope.$watch('signedIn', function(signedIn) {
      if (signedIn)
        getData();
    }, true);
  }]);

}());