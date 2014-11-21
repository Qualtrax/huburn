(function() {
  angular.module('huburn')
    .controller('navigationCtrl', [ '$route', '$routeParams', '$scope', '$http', 'navigationService',
      function ($route, $routeParams, $scope, $http, navigationService) {
        var vm = this;
        
        vm.route = '';
        vm.repo = '';
        vm.title = '';

        navigationService.addListener(function(route, repo, title) {
          vm.route = route;
          vm.repo = repo;
          vm.title = title;
        });
      }]);
}());