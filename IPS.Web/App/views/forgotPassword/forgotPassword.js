'use strict';

angular.module('ips.forgotPassword', ['ui.router', 'ngCookies', 'ngResource', 'ngSanitize'])

.config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
    $stateProvider
        .state('forgotPassword', {
            url: '/forgotPassword',
            templateUrl: 'views/forgotPassword/forgotPassword.html',
            controller: "forgotPasswordCtrl"
        });
}])

    .controller('forgotPasswordCtrl', ['$scope', '$location', 'authService', 'ngAuthSettings', '$timeout', '$rootScope', 'cssInjector', '$state', 'dialogService', 'apiService', '$translate', function ($scope, $location, authService, ngAuthSettings, $timeout, $rootScope, cssInjector, $state, dialogService, apiService, $translate) {

    cssInjector.add('views/forgotPassword/forgotPassword.css');

    $scope.sentSuccessfully = false;
    $scope.message = "";
    $scope.userName = "";
    $scope.info = "";

    $scope.messageClean = function ()
    {
        $scope.message = "";
        $scope.info = "";
    }

    $scope.sendMail = function () {
        $scope.message = "";
        $scope.info = "";
        apiService.getAll("Account/ForgotPassword/" + $scope.userName).then(function (data) {
            $scope.sentSuccessfully = true;
            $scope.info = $translate.instant('LOGIN_FORGOTPASSWORD_PASSWORD_HAS_BEEN_SENT_TO_EMAIL');
            $scope.$apply();
        },
         function (message) {
             $scope.message = message;
             $scope.$apply();
         });
    };
}]);