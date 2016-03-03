(function() {
  angular.module('huburn')
    .controller('burndownCtrl', ['$routeParams', '$scope', 'burndownCalculator', 'velocityMetrics', 'gitHubService',
      function ($routeParams, $scope, burndownCalculator, velocityMetrics, gitHubService) {
        $scope.sprintsDisplayed = 20;
        $scope.sprintsInVelocity = 6;
        $scope.milestones = [];
        $scope.loading = true;
        
        function getMetadata (milestone) {
          var matches = milestone.description.match(/@huburn: { .* }/);

          if (!matches)
            return { met: false };

          var firstMatch = matches[0];
          return JSON.parse(firstMatch.substring(8));
        }
          
        gitHubService.get({
                path: '/repos/' + $routeParams.repo + '/milestones',
                state: 'closed',
                sort: 'due_date',
                direction: 'desc'
            })
            .then(getPastMilestoneData)
            .then(getCurrentMilestoneData);

        function getPastMilestoneData(milestones) {
            for (var i = 0; i < $scope.sprintsDisplayed && i < milestones.length; i++)
                getVelocity(milestones[i]);
        }

        function getVelocity(milestone) {
            gitHubService.get({
                    path: '/repos/' + $routeParams.repo + '/issues',
                    milestone: milestone.number,
                    state: 'all',
                    per_page: 100
                })
                .then(function success(issues) {
                    getPastMilestoneDataFrom(issues, milestone);
                });
        }

        function getPastMilestoneDataFrom(issues, milestone) {
            milestone.metadata = getMetadata(milestone);
            milestone.metadata.points = milestone.metadata.pointsEarned;
            milestone.metadata.categories = burndownCalculator.getCategoryData(issues);
            milestone.metadata.totalPointsWorkedOn = burndownCalculator.getTotalPoints(issues);
            
            milestone.metadata.freeranges = burndownCalculator.getNumberOfLabel(issues, /freerange/);
            milestone.metadata.firelanes = burndownCalculator.getNumberOfLabel(issues, /firelane/);
            milestone.metadata.escalations = burndownCalculator.getNumberOfLabel(issues, /escalation/);
            milestone.metadata.scopeChanges = burndownCalculator.getNumberOfLabel(issues, /scope change/);
            milestone.metadata.zeroDefects = burndownCalculator.getNumberOfLabel(issues, /zero-defect/);
            milestone.metadata.nearMisses = burndownCalculator.getNumberOfLabel(issues, /near-miss/);

            var milestones = $scope.milestones.slice(0);
            milestones.push(milestone);
            milestones.sort(function (a, b) {
                return new Date(a.due_on).getTime() - new Date(b.due_on).getTime();
            });
            $scope.milestones = milestones;

            $scope.closedIterationData = velocityMetrics.getMetrics(milestones);
        }

        function getCurrentMilestoneData() {
            gitHubService.get({
                    path: '/repos/' + $routeParams.repo + '/milestones',
                    state: 'open',
                    sort: 'due_date',
                    direction: 'asc'
                })
                .then(function success(milestones) {
                    gitHubService.get({
                            path: '/repos/' + $routeParams.repo + '/issues',
                            milestone: milestones[0].number,
                            state: 'all',
                            per_page: 100
                        })
                        .then(function success(issues) {
                            $scope.burndown = burndownCalculator.getBurndown(milestones[0], issues);

                            milestones[0].metadata = getMetadata(milestones[0]);  
                            milestones[0].metadata.zeroDefectBacklog = burndownCalculator.getNumberOfLabelOpen(issues, /zero-defect/);
                            milestones[0].metadata.nearMissBacklog = burndownCalculator.getNumberOfLabelOpen(issues, /near-miss/);

                            $scope.openIterationData = velocityMetrics.getCurrentSprintMetrics(milestones[0]);
                        })
                        .then(finishLoading);
                });
        }

        function finishLoading() {
            $scope.loading = false;
        }
      }]);
}());

