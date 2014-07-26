(function() {

  angular.module('huburn')
    .config(['$routeProvider', '$httpProvider',
      function($routeProvider, $httpProvider) {
        $routeProvider.
          when('/burndown', {
            templateUrl: 'partials/burndown.html',
            controller: 'burndownCtrl'
          }).
          otherwise({
            redirectTo: '/burndown'
          });
      }
    ]);

}());