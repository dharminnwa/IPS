'use strict';

angular.module('ips.login', ['ui.router', 'ngCookies', 'ngResource', 'ngSanitize'])

    .config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
        $stateProvider
            .state('login', {
                url: '/login',
                templateUrl: 'views/login/login.html',
                controller: "loginCtrl"
            });
    }])

    .controller('loginCtrl', ['$scope', '$location', 'authService', 'ngAuthSettings', '$timeout', '$rootScope', 'cssInjector', '$state', 'progressBar', 'globalVariables', function ($scope, $location, authService, ngAuthSettings, $timeout, $rootScope, cssInjector, $state, progressBar, globalVariables) {

        cssInjector.add('views/login/login.css');
        cssInjector.add('views/login/user-login.css');
        //$('.login-bg').backstretch([
        //        "images/logo.png",
        //], {
        //    fade: 1000,
        //    duration: 8000
        //});


        $scope.loginData = {
            userName: "",
            password: "",
            //useRefreshTokens: false
        };

        $scope.savedSuccessfully = false;
        $scope.message = "";



        $scope.message = "";

        $scope.messageClean = function () {
            $scope.message = "";
        }

        $scope.login = function () {
            if (_.isNotNullandUndefinedandEmpty($scope.loginData.userName) && _.isNotNullandUndefinedandEmpty($scope.loginData.password)) {
                $scope.message = "";
                progressBar.startProgress();
                authService.login($scope.loginData).then(function (response) {
                    progressBar.stopProgress();
                    if ($rootScope.returnToState) {
                        $state.go($rootScope.returnToStateName, $rootScope.returnToStateParams);
                    }
                    else {
                        if (globalVariables.returnToURL) {
                            $location.path(globalVariables.returnToURL);
                            globalVariables.returnToURL = '';
                        }
                        else {
                            $location.path('/home');
                        }
                    }
                },
                    function (err) {
                        progressBar.stopProgress();
                        if (err.error_description != undefined) {
                            $scope.message = err.error_description;
                        }
                        else {
                            $scope.message = err;
                        }

                        $scope.$apply();
                    });
            }
        };

        $scope.enterKey = function (event) {
            if (event.which === 13) {
                $scope.login();
            }
        }
    }]);