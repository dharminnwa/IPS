(function () {
    'use strict';

    angular
        .module('ips')
        .directive('headerNavigation', headerNavigation);

    headerNavigation.$inject = [];

    function headerNavigation() {

        var directive = {
            restrict: 'E',
            templateUrl: 'directives/headerNavigation/headerNavigation.html',
            scope: {
                pageName: '@pageName',
                backFunction: '&backFunction',
                reload: '=?'
            },
            controller: headerNavigationCtrl
        };

        return directive;

        function headerNavigationCtrl($scope, $attrs, $state) {
            function goBack() {
                if ($attrs.backFunction != undefined) {
                    $scope.backFunction();
                } else {
                    if ($scope.reload) {
                        $state.go('^', null, { reload: true });
                    }
                    else {
                        history.back();
                    }
                }
            }

            $scope.goBack = goBack;
        }
    }
})();