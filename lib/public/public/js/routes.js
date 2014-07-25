(function() {

  angular.module('huburn').config(['$routeProvider',
    function($routeProvider) {
      $routeProvider.
        when('/burndown', {
          templateUrl: 'partials/burndown.html',
          controller: 'burndownCtrl'
        }).
        when('/login', {
          templateUrl: 'partials/login.html'
        }).
        otherwise({
          redirectTo: '/login'
        });
  }]);

}());