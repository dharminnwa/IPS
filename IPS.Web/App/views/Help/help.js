'use strict';

angular.module('ips.help', ['ui.router'])

.config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
    $stateProvider
        .state('help', {
            url: "/help",
            templateUrl: "views/help/help.html",
            controller: "HelpCtrl"
        });
}])


.controller('HelpCtrl', ['$scope', '$location', 'authService', '$window', '$rootScope', 'cssInjector', function ($scope, $location, authService, $window, $rootScope, cssInjector) {
    cssInjector.removeAll();
    cssInjector.add('views/help/help.css');
    $scope.signIn = function () {
        $location.url("/login?target=1");
    }
}])