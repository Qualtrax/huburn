(function () {
    angular
        .module('huburn')
        .controller('metricsCtrl', metricsCtrl);

    metricsCtrl.$inject = ['$routeParams', '$q', 'metricService', 'gitHubService', 'cycleTimeService'];

    function metricsCtrl($routeParams, $q, metricService, gitHubService, cycleTimeService) {
        var vm = this;
        vm.numberOfMilestones = 6;
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
            vm.loading = true;

            getMilestones()
                .then(getIssues)
                .then(getEventsForIssues)
                .then(loadMetrics)
                .then(finishLoading);
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
        }

        function finishLoading() {
            vm.display = 'flex';
            vm.loading = false;
        }

        function descendingCategory(a,b) { return b.count - a.count; }
    }
}());