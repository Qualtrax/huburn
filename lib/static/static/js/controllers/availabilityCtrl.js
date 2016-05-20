(function() {
  angular.module('huburn')
    .controller('availabilityCtrl', ['$routeParams', '$scope', 'gitHubService', 'availabilityService',
      function ($routeParams, $scope, gitHubService, availabilityService) {
        var sprintsInVelocity = 6;
        var velocityMilestones = [];
        
        $scope.companyDaysOff = 0;
        $scope.teamMembers = [];
        $scope.teamMembersToLoad = ['kawillia', 'ImpulseChimp', 'timallen527', 'jramey', 'kevpo']; // Make this configurable
        $scope.newTeamMember = { name: '', daysOff: 0 };
        $scope.availabilityInDays = 0;
        $scope.recommendedPoints = 0;
        $scope.possibleDaysInIteration = [5, 6, 7, 8, 9, 10]; // Make this configurable
        $scope.daysInIteration = 8;

        function getMetadata (milestone) {
          var matches = milestone.description.match(/@huburn: { .* }/);

          if (!matches)
            return { met: false };

          var firstMatch = matches[0];
          return JSON.parse(firstMatch.substring(8));
        }

        gitHubService.get( { path: '/repos/' + $routeParams.repo + '/milestones', state: 'closed', sort: 'due_date', direction: 'desc', per_page: sprintsInVelocity } )
        .then(function success(milestones) {
          var getVelocity = function(milestone) {
           gitHubService.get( { path: '/repos/' + $routeParams.repo + '/issues', milestone: milestone.number, state: 'all', per_page: 100 })                   
           .then(function success(issues) {  
              milestone.metadata = getMetadata(milestone);         
              var milestones = velocityMilestones.slice(0);
              milestones.push(milestone);
              milestones.sort(function(a,b) { return new Date(a.due_on).getTime() - new Date(b.due_on).getTime(); });
              velocityMilestones = milestones;
            });
          };

          for (var i = 0; i < milestones.length; i++)
            getVelocity(milestones[i]);
        });
        
        gitHubService.get( { path: '/orgs/' + $routeParams.repo.split('/')[0] })
            .then(function success(organization) {
                $scope.organization = organization;
            });
        
        gitHubService.get( { path: '/teams/' + 2028682 + '/members' })
        .then(function success(team) {
            team.forEach(function(member, index) {
                member.daysOff = 0;
                $scope.teamMembers.push(member);
                $scope.$watch('teamMembers[' + index + '].daysOff', recompute);
            }, this);
        });  
                
        $scope.changeDaysInIteration = function changeDaysInIteration(days) {
            $scope.daysInIteration = days;
        }
        
        $scope.$watch('daysInIteration', recompute);
        $scope.$watch('companyDaysOff', recompute);

        function recompute () {
          computeAvailability();
          computeRecommendedPoints();
        }

        function computeAvailability () {
          $scope.availabilityInDays = availabilityService.getAvailability($scope.daysInIteration, $scope.companyDaysOff, $scope.teamMembers);
        }

        function computeRecommendedPoints () {
          if (velocityMilestones.length > 0)
            $scope.recommendedPoints = availabilityService.getRecommendedPoints(velocityMilestones, $scope.availabilityInDays);
          else
            $scope.recommendedPoints = 0;
        }
      }]);
}());

