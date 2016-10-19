(function() {

  angular.module('huburn')
    .config(['$routeProvider', '$locationProvider',
      function($routeProvider, $locationProvider) {
      $locationProvider.html5Mode(true).hashPrefix('!');
          
        $routeProvider
         .when('/landing/:repo*', {
            templateUrl: 'templates/landing.html'
          })
          .when('/burndown/:repo*', {
            templateUrl: 'templates/burndown.html',
            controller: 'burndownCtrl'
          })
          .when('/burnup/:repo*', {
            templateUrl: 'templates/burnup.html',
            controller: 'burnupCtrl'
          })
          .when('/metrics/:repo*', {
            templateUrl: 'templates/metrics.html',
            controller: 'metricsCtrl as vm'
          })
          .when('/availability/:repo*', {
            templateUrl: 'templates/availability.html',
            controller: 'availabilityCtrl'
          })
          .when('/repositories', {
            templateUrl: 'templates/repositories.html',
            controller: 'repositoriesCtrl'
          })
          .otherwise({
            redirectTo: '/repositories'
          });
      }
    ])
  .run(function($rootScope) {
    $rootScope.$on( "$routeChangeStart", function(event, next, current) {
     $rootScope.repo = next.params.repo;
    })
  });
}());