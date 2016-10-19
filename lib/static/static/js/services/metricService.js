(function() {
'use strict'

  angular
    .module('huburn')
    .factory('metricService', metricService);

    metricService.$inject = ['issueService'];

    function metricService(issueService) {
		return {
			getEffortDistribution: getEffortDistribution
		};

		function getEffortDistribution(issues, categories) {
			var effortDistribution = [];
			var totalPoints = issueService.getTotalPoints(issues);

			categories.forEach(function(category) {
				effortDistribution.push(getCategoryData(category, issues, totalPoints));
			});

			return effortDistribution;
		}

		function getCategoryData(category, issues, totalPoints) {
			var points = issueService.getTotalPointsForLabel(issues, category.label);

			var category = {
				title: category.title,
				count: Math.round(points / totalPoints * 100)
			};
	
			return category;
		}
	}
}()); 

