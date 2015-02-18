(function () {
    'use strict'

    angular.module('huburn')
        .controller('navigationCtrl', navigationCtrl);
    
    navigationCtrl.$inject = ['$scope', 'navigationService', '$location'];
    
    function navigationCtrl ($scope, navigationService, $location) {
        var vm = this;
        vm.repo = navigationService.repo;

        function getRepoManuallyFromUrl() {
            var url = $location.url();
            var startIndex = url.indexOf('/', 2) + 1;

            if (startIndex == 0)
                return '';

            return url.substring(startIndex, url.length);
        }

        if (!vm.repo) {
            var routeRepo = getRepoManuallyFromUrl();
            navigationService.update(routeRepo);
        }

        $scope.$watch(function () {
            return navigationService.repo;
        }, function (newValue) {
            vm.repo = newValue;
        });
    }
}());