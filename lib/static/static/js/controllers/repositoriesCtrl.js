(function() {
  angular
    .module('huburn')
    .controller('repositoriesCtrl', repositoriesCtrl);

  repositoriesCtrl.$inject = ['$scope', 'gitHubService'];

  function repositoriesCtrl($scope, gitHubService) {    
    $scope.repositories = [];

    function addUserRepos() {
      gitHubService.get({
        path:'/user/repos',
        has_issues: false
      }).then(function(repos) {
        repos.forEach(function(repo) {
          addRepoWithAnyMilestoneThatHasAssociatedIssues(repo);
        });
      });
    }

    function addOrgRepos() {
      gitHubService.get({
        path: '/user/orgs',
        has_issues: false
      }).then(function(orgs) {
        orgs.forEach(function(org) {
          addFilteredOrgRepos(org);
        });
      });
    }

    function addFilteredOrgRepos(org) {
      gitHubService.get({
        path: '/orgs/' + org.login + '/repos',
      }).then(function(repos) {
        repos.forEach(function(repo) {
            addRepoWithAnyMilestoneThatHasAssociatedIssues(repo);
        });
      });
    }

    function addRepoWithAnyMilestoneThatHasAssociatedIssues(repo) {
      if (repo.has_issues) {
        gitHubService.get({
          path: '/repos/' + repo.owner.login + '/' + repo.name + '/milestones'
        }).then(function(milestones) {
          if (anyMilestoneHasAssociatedIssues(milestones))
            addRepo(repo);
        });
      }
    }

    function anyMilestoneHasAssociatedIssues(milestones) {
      return milestones.some(function(milestone) {
          return (milestone.open_issues > 0 || milestone.closed_issues > 0);
      });
    }

    function addRepo(repo) {
      for (var i = 0; i < $scope.repositories.length; i++)
          if ($scope.repositories[i].id === repo.id)
              return;
    
          
      var newRepos = $scope.repositories.concat(repo);
      newRepos.sort(function(a,b) { return a.full_name.localeCompare(b.full_name); });
      $scope.repositories = newRepos;
    }

    addUserRepos();
    addOrgRepos();
  }
}());