(function () {
    angular
        .module('huburn')
        .controller('metricsCtrl', metricsCtrl);

    metricsCtrl.$inject = ['$routeParams', '$q', 'metricService', 'gitHubService', 'cycleTimeService'];

    function metricsCtrl($routeParams, $q, metricService, gitHubService, cycleTimeService) {
        var vm = this;
        vm.numberOfMilestones = 6;
        vm.currentMilestoneIssues = [];
        vm.repo = $routeParams.repo;
        vm.categories = [
            {
                label: /firelane/,
                title: "FIRELANE"
            },
            {
                label: /escalation/,
                title: 'ESCALATION'
            },
            {
                label: /freerange/,
                title: 'FREERANGE'
            },
            {
                label: /near-miss/,
                title: 'NEAR MISS'
            },
            {
                label: /Build Machine/,
                title: 'BUILD MACHINE'
            },
            {
                label: /zero-defect/,
                title: 'ZERO DEFECT'
            },
            {
                label: /feature/,
                title: 'FEATURE'
            },
            {
                label: /research/,
                title: 'RESEARCH'
            },
            {
                label: /technical debt/,
                title: 'TECHNICAL DEBT'
            }
        ];

        activate();

        function activate() {
            vm.display = 'none';
            vm.displayCycleTimes = 'none';
            vm.displayDistributions = 'none';
            vm.loading = true;

            getCurrentMilestone()
                .then(getIssues)
                .then(getEventsForIssues)
                .then(function (issuesWithEventsForCurrentMilestone) {
                    vm.currentMilestoneIssues = issuesWithEventsForCurrentMilestone;

                    getMilestones()
                        .then(getIssues)
                        .then(getEventsForIssues)
                        .then(loadMetrics)
                        .then(finishLoading);
                });        
        }

        function getCurrentMilestone() {
            return gitHubService.get({
                path: '/repos/' + $routeParams.repo + '/milestones',
                state: 'open',
                sort: 'created_at',
                direction: 'desc',
                per_page: 1
            });
        }

        function getMilestones() {
            return gitHubService.get({
                path: '/repos/' + $routeParams.repo + '/milestones',
                state: 'closed',
                sort: 'due_date',
                direction: 'desc',
                per_page: vm.numberOfMilestones
            });
        }

        function getIssues(milestones) {
            var issuePromises = [];

            milestones.forEach(function (milestone) {
                 issuePromises.push(gitHubService.getIssues($routeParams.repo, milestone.number));
            });

            return $q.all(issuePromises);
        }

        function getEventsForIssues(issuesPerMilestone) {
            var issues = [].concat.apply([], issuesPerMilestone);
            var eventPromises = [];

            issues.forEach(function(issue) {
                eventPromises.push(gitHubService.getIssueEvents(issue));
            });
        
            return $q.all(eventPromises);
        }

        function loadMetrics(issuesWithEvents) {
            vm.effortDistribution = metricService.getEffortDistribution(issuesWithEvents, vm.categories).sort(descendingCategory);
            vm.escalationCycleTimes = cycleTimeService.getEscalationCycleTimes(issuesWithEvents);
            vm.firelaneCycleTimes = cycleTimeService.getFirelaneCycleTimes(issuesWithEvents);
            vm.cycleTimes = cycleTimeService.getCycleTimes(issuesWithEvents);
            vm.standardDeviationSummary = cycleTimeService.getStandardDeviationSummary(vm.currentMilestoneIssues, issuesWithEvents);
        }

        function finishLoading() {
            vm.display = 'flex';
            vm.displayCycleTimes = 'flex';
            vm.loading = false;
        }

        vm.calculateLeftRedPercentage = function calculateLeftRedPercentage(statistic, standardDeviationSummary) {
            var leftRedValue = calculateLeftRedValue(statistic);
            var leftRedRange = (leftRedValue - standardDeviationSummary.collectiveMinValue) / standardDeviationSummary.collectiveRange;
            return convertToPercentage(leftRedRange);
        };

        function calculateLeftRedValue(statistic) {
            return statistic.mean - (2 * statistic.standardDeviation);
        }

        vm.calculateYellowPercentage = function calculateYellowPercentage(statistic, standardDeviationSummary) {
            var leftRedValue = calculateLeftRedValue(statistic);
            var leftYellowValue = calculateLeftYellowValue(statistic);
            var leftYellowRange = (leftYellowValue - leftRedValue) / standardDeviationSummary.collectiveRange;

            return convertToPercentage(leftYellowRange);
        };

        function calculateLeftYellowValue(statistic) {
            return statistic.mean - statistic.standardDeviation;
        }

        vm.calculateGreenPercentage = function calculateGreenPercentage(statistic, standardDeviationSummary) {
            var greenValue = statistic.mean;
            var leftYellowValue = calculateLeftYellowValue(statistic);
            var greenValue = 2 * (greenValue - leftYellowValue) / standardDeviationSummary.collectiveRange;

            return convertToPercentage(greenValue);
        };

        vm.calculateRightRedPercentage = function calculateRightRedPercentage(statistic, standardDeviationSummary) {
            var redValue = (standardDeviationSummary.collectiveMaxValue - (statistic.mean + (2 * statistic.standardDeviation))) / standardDeviationSummary.collectiveRange;
            return convertToPercentage(redValue);
        };

        function convertToPercentage(value) {
            return value * 100;
        }

        function descendingCategory(a,b) { return b.count - a.count; }

        vm.showCycleTimes = function showCycleTimes() {
            vm.displayCycleTimes = 'flex';
            vm.displayDistributions = 'none';
        }

        vm.showDistributions = function showDistributions() {
            vm.displayCycleTimes = 'none';
            vm.displayDistributions = 'flex';
        }
    }
}());