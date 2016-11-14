(function() {
  angular
        .module('huburn')
        .controller('availabilityCtrl', availabilityCtrl);

  availabilityCtrl.$inject = ['$routeParams', '$scope', '$q', 'gitHubService', 'availabilityService', 'issueService', '$timeout'];

  function availabilityCtrl($routeParams, $scope, $q, gitHubService, availabilityService, issueService, $timeout) {
    var sprintsInVelocity = 6;
    var currentMilestone;
    var velocityMilestones = [];
    
    $scope.loading = true;
    $scope.display = 'none';
    $scope.companyDaysOff = 0;
    $scope.teamMembers = [];
    $scope.teamMembersToLoad = ['kawillia', 'ImpulseChimp', 'timallen527', 'jramey', 'kevpo']; // Make this configurable
    $scope.newTeamMember = { name: '', daysOff: 0 };
    $scope.availabilityInDays = 0;
    $scope.recommendedPoints = 0;
    $scope.possibleDaysInIteration = [5, 6, 7, 8, 9, 10]; // Make this configurable
    $scope.daysInIteration = 8;
    $scope.updateMilestoneDescription = updateMilestoneDescription;
    $scope.currentMilestoneTitle = "";
    $scope.saveSuccessful = false;
    $scope.saveFailed = false;

    activate();

    function getMetadata (milestone) {
        var matches = milestone.description.match(/@huburn: { .* }/);

        if (!matches)
          return { met: false };

        var firstMatch = matches[0];
        return JSON.parse(firstMatch.substring(8));
    }

    function activate() {
        $scope.display = 'none';
        $scope.loading = true;

        var promises = [];
        var deferred = $q.defer();
        
        getTeamMembers()
          .then(populateTeamMembers)
          .then(getCurrentMilestone)
          .then(populateCurrentMilestone)
          .then(getOrganization)
          .then(populateOrganization)
          .then(getHistoricalMilestones)
          .then(getVelocityData)
          .then(finishLoading);
    }

    function getTeamMembers() {
        return gitHubService.get( { path: '/teams/' + 2028682 + '/members' });
    }

    function populateTeamMembers(team) {
        team.forEach(function(member, index) {
            member.daysOff = 0;
            $scope.teamMembers.push(member);
            $scope.$watch('teamMembers[' + index + '].daysOff', recompute);
        }, this);
    }

    function getCurrentMilestone() {
        return gitHubService.get({
            path: '/repos/' + $routeParams.repo + '/milestones',
            state: 'open',
            sort: 'due_date',
            direction: 'asc'
        });
    }

    function populateCurrentMilestone(milestones) {
        currentMilestone = milestones[0].number;
        $scope.currentMilestoneTitle = milestones[0].title;
    }

    function getOrganization() {
        return gitHubService.get( { path: '/orgs/' + $routeParams.repo.split('/')[0] });
    }  

    function populateOrganization(organization) {
        $scope.organization = organization;
    }

    function getHistoricalMilestones() {
        return gitHubService.get( { path: '/repos/' + $routeParams.repo + '/milestones', state: 'closed', sort: 'due_date', direction: 'desc', per_page: sprintsInVelocity } )
    }

    function getVelocityData(milestones) {
        var velocityPromises = [];

        milestones.forEach(function (milestone) {
            var deferred = $q.defer();
            
            gitHubService.get( { path: '/repos/' + $routeParams.repo + '/issues', milestone: milestone.number, state: 'all', per_page: 100 })
            .then(function populateVelocityData(issues) {
                milestone.metadata = getMetadata(milestone);   
                milestone.metadata.totalPointsWorkedOn = issueService.getTotalPoints(issues);
                var milestones = velocityMilestones.slice(0);
                milestones.push(milestone);
                milestones.sort(function(a,b) { return new Date(a.due_on).getTime() - new Date(b.due_on).getTime(); });
                velocityMilestones = milestones;

                deferred.resolve();
            });

            velocityPromises.push(deferred.promise);
        });

        return $q.all(velocityPromises);
    }

    function finishLoading() {
        recompute();
        $scope.display = 'block';
        $scope.loading = false;
    }
            
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
    
    function updateMilestoneDescription() {
      gitHubService.patch({
            path: '/repos/' + $routeParams.repo + '/milestones/' + currentMilestone,
            'description': '<!--- @huburn: { "met": true, "availabilityInDays": ' + $scope.availabilityInDays + ' } -->'
        }).then(function success(data) {
            $scope.saveSuccessful = true;
        }, 
        function failure(error) {
          $scope.saveFailed = true;
        })
        .then(function () {
          $timeout(function () {
            $scope.saveSuccessful = false;  
            $scope.saveFailed = false;
          }, 3000);
        });
    }
  }
}());

