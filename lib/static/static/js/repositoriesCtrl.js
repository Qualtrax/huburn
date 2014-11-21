(function() {
  angular.module('huburn').controller('repositoriesCtrl', ['$scope', '$http', 'navigationService', function($scope, $http, navigationService) {
    $scope.repositories = [];

    navigationService.clear();

    $http.get('/github', { params: { path: '/user/repos' } }).success(function(repos) {
      addRepos(repos);
    });

    $http.get('/github', { params: { path: '/user/orgs' } }).success(function(orgs) {
      orgs.forEach(function(org) {
        $http.get('/github', { params: { path: '/orgs/' + org.login + '/repos' } }).success(function(repos) {
          addRepos(repos);
        });
      });
    });

    var addRepos = function(repos) {
      var newRepos = $scope.repositories.concat(repos);
      newRepos.sort(function(a,b) { return a.full_name.localeCompare(b.full_name); });
      $scope.repositories = newRepos;
    };
  }]);
}());