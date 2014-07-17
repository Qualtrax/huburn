(function() {
  var huburn = angular.module('huburn', ['d3']);

  huburn.controller('burndownCtrl', ['$scope', '$http', 'burndownCalculator', function ($scope, $http, burndownCalculator) {
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
          milestone.points = burndownCalculator.getTotalPoints(data);
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

    githubRequest($http, { path: '/repos/qualtrax/qualtrax/milestones/5' }, function(milestone) {
      githubRequest($http, { path: '/repos/qualtrax/qualtrax/issues', milestone: '5', state: 'all' }, function(data) {
       $scope.burndown = burndownCalculator.getBurndown(milestone, data);
      });
    });

  }]);

}());