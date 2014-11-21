(function() {
  angular.module('huburn')
    .controller('availabilityCtrl', [ '$route', '$routeParams', '$scope', '$http', 'navigationService',
      function ($route, $routeParams, $scope, $http, navigationService) {
        var sprintsInVelocity = 6;
        var velocityMilestones = [];
        
        $scope.daysInIteration = 8;
        $scope.companyDaysOff = 0;
        $scope.teamMembers = [];
        $scope.newTeamMember = { name: '', daysOff: 0 };
        $scope.availabilityInDays = 0;
        $scope.recommendedPoints = 0;

        navigationService.update('burndown', $routeParams.repo, 'Burndown');

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

        githubRequest($http, { path: '/repos/' + $routeParams.repo + '/milestones', state: 'closed', sort: 'due_date', direction: 'desc', per_page: sprintsInVelocity }, function(milestones) {  
          var getVelocity = function(milestone) {
            githubRequest($http, { path: '/repos/' + $routeParams.repo + '/issues', milestone: milestone.number, state: 'all', per_page: 100 }, function(issues) {                    
              
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

        $scope.addNewMember = function () {
          if ($scope.newTeamMember.name.length <= 0)
            return;

          var newMember = { name: $scope.newTeamMember.name, daysOff: $scope.newTeamMember.daysOff };
          $scope.teamMembers.push(newMember);

          $scope.newTeamMember.name = '';
          $scope.newTeamMember.daysOff = 0;

          var newMemberIndex = $scope.teamMembers.length - 1;
          $scope.$watch('teamMembers[' + newMemberIndex + '].daysOff', recompute);
        };
        
        $scope.$watch('daysInIteration', recompute);
        $scope.$watch('companyDaysOff', recompute);

        function recompute () {
          computeAvailability();
          computeRecommendedPoints();
        }

        function computeAvailability () {
          var totalDays = ($scope.daysInIteration - $scope.companyDaysOff) * $scope.teamMembers.length;

          var totalDaysOff = $scope.teamMembers.map(function(teamMember) { 
            return teamMember.daysOff
          }).reduce(function(total, daysOff) {
            return total + daysOff;
          }, 0);

          $scope.availabilityInDays = totalDays - totalDaysOff;
        }

        function computeRecommendedPoints () {
          var totalPointsPerDay = velocityMilestones.map(function(milestone) {
            return milestone.metadata.pointsEarned / milestone.metadata.availabilityInDays;
          }).reduce(function(total, pointsPerDay) {
            return total + pointsPerDay;
          }, 0);

          var averagePointsPerDay = totalPointsPerDay / velocityMilestones.length;
          $scope.recommendedPoints = averagePointsPerDay * $scope.availabilityInDays;
        }
      }]);
}());