(function() {
  angular.module('huburn')
    .controller('landingCtrl', ['$route', '$routeParams', 'navigationService',
      function ($route, $routeParams, navigationService) {
        var vm = this;
        vm.repo = $routeParams.repo;
        
        navigationService.update($routeParams.repo);
      }]);
}());

