'use strict';

angular.module('ips.reports', ['ui.router'])

.config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
    $stateProvider
        .state('reports', {
            url: "/reports",
            templateUrl: "views/reports/reports.html",
            controller: "ReportsCtrl"
        });
}])


.controller('ReportsCtrl', ['$scope', '$location', 'authService', '$window', '$rootScope', 'cssInjector', function ($scope, $location, authService, $window, $rootScope, cssInjector) {
    cssInjector.removeAll();
    cssInjector.add('views/reports/reports.css');
    
}])