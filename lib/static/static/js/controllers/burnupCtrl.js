(function () {
    angular
        .module('huburn')
        .controller('burnupCtrl', burnupCtrl);

    burnupCtrl.$inject = ['$routeParams', '$scope', 'burnupCalculator', 'velocityMetrics', 'gitHubService', 'availabilityService', 'LABEL', '$q'];

    function burnupCtrl($routeParams, $scope, burnupCalculator, velocityMetrics, gitHubService, availabilityService, LABEL, $q) {
        $scope.milestonesDisplayed = 20;
        $scope.milestonesInVelocity = 6;
        $scope.milestones = [];
        $scope.loading = true;

        gitHubService.get({
            path: '/repos/' + $routeParams.repo + '/milestones',
            state: 'closed',
            sort: 'due_date',
            direction: 'desc',
            per_page: $scope.milestonesDisplayed
        })
        .then(getPastMilestoneData)
        .then(getCurrentMilestoneData);

        function getPastMilestoneData(milestones) {
            milestones.forEach(function (milestone) {
                loadMilestoneMetrics(milestone);
            });
        }

        function loadMilestoneMetrics(milestone) {
            gitHubService.getIssues($routeParams.repo, milestone.number)
            .then(function (issues) {
                var durationPromises = [];
                issues.forEach(function(issue) {
                    durationPromises.push(gitHubService.getDuration(issue));
                })
            
                $q.all(durationPromises)
                .then(function (durations) {
                    var issuesWithDuration = [];
                    durations.forEach(function(issueDuration) {
                        var issue = getIssue(issues, issueDuration.issueNumber);
                        issue.duration = issueDuration.duration;
                        issuesWithDuration.push(issue);
                    });
                
                    return setPastMilestoneDataFrom(issuesWithDuration, milestone); 
                });
            });
        }
        
        function getIssue(issues, issueNumber) {
            for (var i=0; i < issues.length; i++) {
                if (issues[i].number === issueNumber)
                    return issues[i];
            }
            
            return undefined;
        }
        
        // function loadIssueData(issues) {
        //     var durationPromises = [];
        //     issues.forEach(function(issue) {
        //         durationPromises.push(gitHubService.getDuration(issue.number));
        //     })
            
        //     $q.all(durationPromises)
        //     .then(function (durations) {
        //         var issuesWithDuration = [];
        //         durations.forEach(function(issueDuration) {
        //             var issue = issues.find(function(i) { i.number === issueDuration.number; });
        //             issue.duration = issueDuration.duration;
        //             issuesWithDuration.push(issue);
        //         });
                
        //         return setPastMilestoneDataFrom(issuesWithDuration, milestone); 
        //     });
        // }

        function setPastMilestoneDataFrom(issues, milestone) {
            milestone.metadata = getMetadata(milestone);
            milestone.metadata.categories = burnupCalculator.getCategoryData(issues);
            milestone.metadata.points = milestone.metadata.pointsEarned;
            milestone.metadata.totalPointsWorkedOn = burnupCalculator.getTotalPoints(issues);
            
            var categories = burnupCalculator.getCategoryData(issues, milestone.metadata.points);
            
            milestone.metadata.categories = {
                freerange: findCategory(LABEL.FREERANGES, categories).points,
                firelane: findCategory(LABEL.FIRELANES, categories).points,
                escalation: findCategory(LABEL.ESCALATIONS, categories).points,
                nearMiss: findCategory(LABEL.NEAR_MISSES, categories).points,
                build: findCategory(LABEL.BUILD_MACHINE, categories).points,
                zeroDefect: findCategory(LABEL.ZERO_DEFECTS, categories).points,
                feature: findCategory(LABEL.FEATURES, categories).points,
                research: findCategory(LABEL.RESEARCH, categories).points,
                technicalDebt: findCategory(LABEL.TECHNICAL_DEBT, categories).points
            };
            
            milestone.metadata.freeranges = findCategory(LABEL.FREERANGES, categories).count;
            milestone.metadata.firelanes = findCategory(LABEL.FIRELANES, categories).count;
            milestone.metadata.escalations = findCategory(LABEL.ESCALATIONS, categories).count;
            milestone.metadata.scopeChanges = findCategory(LABEL.SCOPE_CHANGES, categories).count;
            milestone.metadata.zeroDefects = findCategory(LABEL.ZERO_DEFECTS, categories).count;
            milestone.metadata.nearMisses = findCategory(LABEL.NEAR_MISSES, categories).count;

            var milestones = $scope.milestones.slice(0);
            milestones.push(milestone);
            milestones.sort(function (a, b) {
                return new Date(a.due_on).getTime() - new Date(b.due_on).getTime();
            });
            
            $scope.milestones = milestones;
            $scope.closedIterationData = velocityMetrics.getMetrics(milestones);
        }
        
        function getMetadata(milestone) {
            var matches = milestone.description.match(/@huburn: {.*}/);

            if (!matches)
                return {
                    met: false
                };

            var firstMatch = matches[0];
            return JSON.parse(firstMatch.substring(8));
        }
        
        function findCategory(label, categories) {
            for (var i=0; i < categories.length; i++) {
                if (categories[i].name === label)
                    return categories[i];
            }
                  
            return undefined;
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
                        milestones[0].metadata = getMetadata(milestones[0]);
                        milestones[0].metadata.zeroDefectBacklog = burnupCalculator.getNumberOfLabelOpen(issues, /zero-defect/);
                        milestones[0].metadata.nearMissBacklog = burnupCalculator.getNumberOfLabelOpen(issues, /near-miss/);

                        var startIndex = $scope.milestonesDisplayed - $scope.milestonesInVelocity;
                        var velocityMilestones = $scope.milestones.slice(startIndex, $scope.milestones.length);
                        $scope.burnup = burnupCalculator.getBurnup(velocityMilestones, milestones[0], issues);
                        $scope.openIterationData = velocityMetrics.getCurrentSprintMetrics(milestones[0]);
                    })
                    .then(finishLoading);
            });
        }

        function finishLoading() {
            $scope.loading = false;
        }
    };
}());