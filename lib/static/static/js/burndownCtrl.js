(function() {
  angular.module('huburn')
    .controller('burndownCtrl', [ '$route', '$routeParams', '$scope', '$http', 'burndownCalculator',
      function ($route, $routeParams, $scope, $http, burndownCalculator) {
        $scope.milestones = [];

        var githubRequest = function($http, params, success) {
          $http.get('/github', { params: params }).success(success);
        };

        var getMetadata = function(milestone) {
          var matches = milestone.description.match(/@huburn: { .* }/);

          if (!matches)
            return { met: false };

          var firstMatch = matches[0];
          return JSON.parse(firstMatch.substring(8));
        };

        githubRequest($http, { path: '/repos/' + $routeParams.repo + '/milestones', state: 'closed', sort: 'due_date', direction: 'desc' }, function(milestones) {  
          var getVelocity = function(milestone) {
            githubRequest($http, { path: '/repos/' + $routeParams.repo + '/issues', milestone: milestone.number, state: 'all' }, function(issues) {                    
              
              milestone.metadata = getMetadata(milestone);         
              milestone.metadata.points = burndownCalculator.getTotalPoints(issues); 
              milestone.metadata.freeranges = burndownCalculator.getNumberOfLabel(issues, /freerange/);
              milestone.metadata.firelanes = burndownCalculator.getNumberOfLabel(issues, /firelane/);
              milestone.metadata.escalations = burndownCalculator.getNumberOfLabel(issues, /escalation/);

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