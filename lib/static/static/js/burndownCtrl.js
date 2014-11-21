(function() {
  angular.module('huburn')
    .controller('burndownCtrl', [ '$route', '$routeParams', '$scope', '$http', 'burndownCalculator', 'velocityMetrics', 'navigationService',
      function ($route, $routeParams, $scope, $http, burndownCalculator, velocityMetrics, navigationService) {
        $scope.sprintsDisplayed = 20;
        $scope.sprintsInVelocity = 6;
        $scope.milestones = [];

        navigationService.update('availability', $routeParams.repo, 'Availability Calculator');

        function githubRequest ($http, params, success) {
          $http.get('/github', { params: params }).success(success);
        }

        function getMetadata (milestone) {
          var matches = milestone.description.match(/@huburn: { .* }/);

          if (!matches)
            return { met: false };

          var firstMatch = matches[0];
          return JSON.parse(firstMatch.substring(8));
        }

        githubRequest($http, { path: '/repos/' + $routeParams.repo + '/milestones', state: 'closed', sort: 'due_date', direction: 'desc' }, function(milestones) {  
          var getVelocity = function(milestone) {
            githubRequest($http, { path: '/repos/' + $routeParams.repo + '/issues', milestone: milestone.number, state: 'all', per_page: 100 }, function(issues) {                    
              
              milestone.metadata = getMetadata(milestone);         
              milestone.metadata.points = burndownCalculator.getTotalPoints(issues); 
              milestone.metadata.freeranges = burndownCalculator.getNumberOfLabel(issues, /freerange/);
              milestone.metadata.firelanes = burndownCalculator.getNumberOfLabel(issues, /firelane/);
              milestone.metadata.escalations = burndownCalculator.getNumberOfLabel(issues, /escalation/);
              milestone.metadata.scopeChanges = burndownCalculator.getNumberOfLabel(issues, /scope change/);
              milestone.metadata.zeroDefects = burndownCalculator.getNumberOfLabel(issues, /zero-defect/);
              milestone.metadata.nearMisses = burndownCalculator.getNumberOfLabel(issues, /near-miss/);

              var milestones = $scope.milestones.slice(0);
              milestones.push(milestone);
              milestones.sort(function(a,b) { return new Date(a.due_on).getTime() - new Date(b.due_on).getTime(); });
              $scope.milestones = milestones;

              $scope.closedIterationData = velocityMetrics.getMetrics(milestones);
            });
          };

          for (var i = 0; i < $scope.sprintsDisplayed && i < milestones.length; i++)
            getVelocity(milestones[i]);
        });

        githubRequest($http, { path: '/repos/' + $routeParams.repo + '/milestones', state: 'open', sort: 'due_date', direction: 'asc' }, function(milestones) {
          githubRequest($http, { path: '/repos/' + $routeParams.repo + '/issues', milestone: milestones[0].number, state: 'all', per_page: 100 }, function(issues) {
            $scope.burndown = burndownCalculator.getBurndown(milestones[0], issues);

            milestones[0].metadata = getMetadata(milestones[0]);  
            milestones[0].metadata.zeroDefectBacklog = burndownCalculator.getNumberOfLabelOpen(issues, /zero-defect/);
            milestones[0].metadata.nearMissBacklog = burndownCalculator.getNumberOfLabelOpen(issues, /near-miss/);

            $scope.openIterationData = velocityMetrics.getCurrentSprintMetrics(milestones[0]);
          });
        });
      }]);
}());