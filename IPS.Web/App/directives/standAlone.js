(function () {
    'use strict';

    angular
        .module('ips')
        .directive('standAlone', standAlone);

    standAlone.$inject = ['authService'];

    function standAlone(authService) {

        var directive = {
            restrict: 'A',
            link: link,
        };

        return directive;

        function link(scope, element, attributes) {
            scope.$watch(authService.isStandaloneMode, function () {
                scope.isStandaloneMode = authService.isStandaloneMode;
                if (authService.isStandaloneMode) {
                    element.addClass('hide');
                }
            })
        }
    }
})();