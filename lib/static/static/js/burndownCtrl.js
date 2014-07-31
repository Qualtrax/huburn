(function() {
  angular.module('huburn')
    .controller('burndownCtrl', [ '$routeParams', '$scope', '$http', 'burndownCalculator',
      function ($routeParams, $scope, $http, burndownCalculator) {
        $scope.milestones = [];

        var githubRequest = function($http, params, success) {
          $http.get('/github', { params: params }).success(success);
        };

        var isMet = function(milestone) {
          var huburnMetaData = (milestone.description.match(/@huburn: { .* }/));

          if (huburnMetaData == null)
            return true;

          var firstMatch = huburnMetaData[0];
          var huburnDescription = JSON.parse(firstMatch.substring(8));

          return huburnDescription.met;
        };

        githubRequest($http, { path: '/repos/' + $routeParams.repo + '/milestones', state: 'closed', sort: 'due_date', direction: 'desc' }, function(milestones) {  
          var getVelocity = function(milestone) {
            githubRequest($http, { path: '/repos/' + $routeParams.repo + '/issues', milestone: milestone.number, state: 'all' }, function(data) {                    
              milestone.points = burndownCalculator.getTotalPoints(data);                            
              milestone.met = isMet(milestone);            

              var milestones = $scope.milestones.slice(0);
              milestones.push(milestone);
              milestones.sort(function(a,b) { return new Date(a.due_on).getTime() - new Date(b.due_on).getTime(); });
              $scope.milestones = milestones;
            });
          };

          for (var i = 0; i < 20 && i < milestones.length; i++)
            getVelocity(milestones[i]);
        });

        githubRequest($http, { path: '/repos/' + $routeParams.repo + '/milestones', state: 'open', sort: 'due_date', direction: 'desc' }, function(milestones) {  
          githubRequest($http, { path: '/repos/' + $routeParams.repo + '/issues', milestone: milestones[0].number, state: 'all' }, function(issues) {
           $scope.burndown = burndownCalculator.getBurndown(milestones[0], issues);
          });
        });
      }]);
}());