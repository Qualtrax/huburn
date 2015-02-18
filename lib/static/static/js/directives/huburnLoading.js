(function () {
    'use strict'

    angular
        .module('huburn')
        .directive('huburnLoading', huburnLoading);

    huburnLoading.$inject = ['$window'];

    function huburnLoading($window) {
        var directive = {
            restrict: 'E',
            templateUrl: "../../templates/loading.html",
            scope: {
                open: '='
            },
            link: link

        };

        return directive;

        function link(scope) {
            var overlay = $('#loading-overlay');
            
            overlay.popup({
                background: true,
                blur: false,
                opacity: 1.0,
                color: 'white',
                escape: false
            });

            scope.$watch('open', function (newValue) {
                if (newValue)
                    overlay.popup('show');
                else
                    overlay.popup('hide');
            });
        }
    };
})();