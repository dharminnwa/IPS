'use strict';

angular.module('ips.about', ['ui.router'])

.config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
    $stateProvider
        .state('about', {
            url: "/about",
            templateUrl: "views/about/about.html",
            controller: "aboutCtrl"
        });
}])

.controller('aboutCtrl', ['$scope', 'cssInjector', '$rootScope', function ($scope, cssInjector, $rootScope) {
    $rootScope.Title = "ABOUT";
    cssInjector.removeAll();
    cssInjector.add('views/about/about.css');
}]);