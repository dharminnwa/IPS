'use strict';

angular.module('ips.blog', ['ui.router'])

.config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
    $stateProvider
        .state('blog', {
            url: "/blog",
            templateUrl: "views/blog/blog.html",
            controller: "BlogCtrl"
        });
}])


.controller('BlogCtrl', ['$scope', '$location', 'authService', '$window', '$rootScope', 'cssInjector', function ($scope, $location, authService, $window, $rootScope, cssInjector) {
    cssInjector.removeAll();
    cssInjector.add('views/blog/blog.css');
}])