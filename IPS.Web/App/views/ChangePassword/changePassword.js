'use strict';

angular.module('ips.changePassword', ['ui.router', 'ngCookies', 'ngResource', 'ngSanitize'])

.config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
    $stateProvider
        .state('changePassword', {
            url: "/changePassword",
            templateUrl: "views/changePassword/changePassword.html",
            controller: "changePasswordCtrl"
        });
}])

    .controller('changePasswordCtrl', ['$scope', '$location', 'authService', 'ngAuthSettings', '$timeout', '$window', 'cssInjector', '$translate', function ($scope, $location, authService, ngAuthSettings, $timeout, $window, cssInjector, $translate) {

    cssInjector.add('views/changePassword/changePassword.css');

    $scope.changedSuccessfully = false;
    $scope.message = "";

    $scope.passwordInfo = {
        userId: "",
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: ""
    };

    $scope.changePassword = function () {
        $scope.changedSuccessfully = false;
        $scope.message = "";
        authService.changePassword($scope.passwordInfo).then(function (response) {
            $scope.changedSuccessfully = true;
            $scope.message = $translate.instant('LOGIN_CHANGEPASSWORD_PASSWORD_CHANGED_SUCCESSFULLY') + " " + $translate.instant('LOGIN_CHANGEPASSWORD_WILL_REDIRECTED_TO_PREVIOUS_PAGE');
            startTimer();
        },
         function (response) {
             if (response.data.modelState != undefined) {
                 var errors = [];
                 for (var key in response.data.modelState) {
                     for (var i = 0; i < response.data.modelState[key].length; i++) {
                         if (errors.indexOf(response.data.modelState[key][i]) < 0) {
                             errors.push(response.data.modelState[key][i]);
                         }
                     }
                 }
                 $scope.message = $translate.instant('LOGIN_CHANGEPASSWORD_FAILED_TO_CHANGE_PASSWORD') + errors.join(' ');
             }
             else {
                 $scope.message = response.data.message;
             }
         });
    };
    $scope.cancel = function () {
        $window.history.back();
    }

    var startTimer = function () {
        var timer = $timeout(function () {
            $timeout.cancel(timer);
            $window.history.back();
            $scope.message = "";
        }, 2000);
    }
}]);