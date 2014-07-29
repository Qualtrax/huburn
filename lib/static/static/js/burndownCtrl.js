(function() {
  angular.module('huburn')
    .controller('burndownCtrl', [ '$routeParams', '$scope', '$http', 'burndownCalculator',
      function ($routeParams, $scope, $http, burndownCalculator) {
        $scope.milestones = [];

        var githubRequest = function($http, params, success) {
          $http.get('/github', { params: params }).success(success);
        };

        githubRequest($http, { path: '/repos/' + $routeParams.repo + '/milestones', state: 'all', sort: 'due_date', direction: 'desc' }, function(milestones) {  
          var getVelocity = function(milestone) {
            githubRequest($http, { path: '/repos/' + $routeParams.repo + '/issues', milestone: milestone.number, state: 'all' }, function(data) {                    
              milestone.points = burndownCalculator.getTotalPoints(data);
              var milestones = $scope.milestones.slice(0);
              milestones.push(milestone);
              milestones.sort(function(a,b) { return new Date(a.due_on) - new Date(b.due_on); });
              $scope.milestones = milestones;
            });
          };

          var getBurndown = function(milestone) {
            githubRequest($http, { path: '/repos/' + $routeParams.repo + '/issues', milestone: milestone.number, state: 'all' }, function(data) {
             $scope.burndown = burndownCalculator.getBurndown(milestone, data);
            });
          }

          for (var i = 0; i < 20 && i < milestones.length; i++) {
            if (i == 0)
              getBurndown(milestones[i]);

            getVelocity(milestones[i]);
          }
        });
      }]);
}());