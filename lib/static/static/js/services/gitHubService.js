(function() {
'use strict'

	angular
		.module('huburn')
		.factory('gitHubService', gitHubService);

		gitHubService.$inject = ['$http', '$q']

		function gitHubService($http, $q) {
			return {
				get: get,
				patch: patch,
				getIssues: getIssues,
				getIssueEvents: getIssueEvents
			};

		function get (params) {
			var deferred = $q.defer();

			$http.get('/github', { params: params } )
				.success(function(data) {
					deferred.resolve(data);
				});

			return deferred.promise;
		}
		
		function patch (params) {
			var deferred = $q.defer();
			
			$http.get('/github-patch', { params: params } )
				.success(function (data) {
					deferred.resolve(data);
				});
				
			return deferred.promise;
		}

		function getIssues(repository, milestone) {
			var deferred = $q.defer();
			var params = {
					path: '/repos/' + repository + '/issues',
					milestone: milestone,
					state: 'all',
					per_page: 100
			};
			
			$http.get('/github', { params: params } )
				.success(function (issues) {
						deferred.resolve(issues);
				});
			
			return deferred.promise;
		 }

		function getIssueEvents(issue) {
			var deferred = $q.defer();
			var params = {
				path: '/repos/Qualtrax/Qualtrax/issues/' + issue.number + '/events'
			};

			$http.get('/githubEvents/' + issue.number, { params: params })
				.then(function (response) {
					var issueWithEvents = issue;
					issueWithEvents.events = response.data;
					deferred.resolve(issueWithEvents);
				});

			return deferred.promise;
		}
	}
}()); 