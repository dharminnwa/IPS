'use strict';

angular.module('ips.admin.user', ['ui.router'])


.config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
    $stateProvider
        .state('admin.user', {
            url: "/admin/user",
            templateUrl: "views/admin/user/user.html",
            controller: "UserCtrl"
        });
}])

    .controller('UserCtrl', ['$scope', '$location', '$routeParams', 'authService', '$window', 'cssInjector', '$translate', function ($scope, $location, $routeParams, authService, $window, cssInjector, $translate) {

    cssInjector.add('views/admin/User/User.css');

    $scope.message = "";
    $scope.user = { roles: {}};
    $scope.roles = {};

    if ($routeParams.id == undefined) {
        $scope.message = $translate.instant('ORGANIZATIONS_USER_ID_UNDEFINED');
    } else {

        authService.getUserById($routeParams.id).then(function (response) {
            $scope.user = response.data;
            authService.getAllRoles().then(function (response) {
                $scope.roles = response.data;
            }, ifError);
        }, ifError);

    }

    $scope.saveUser = function () {
        $scope.message = "";
        authService.updateUser($scope.user).then(function (response) {
            $window.history.back();
        }, ifError);
    };

    $scope.deleteUser = function () {
        $scope.message = "";
        authService.deleteUser($scope.user.id).then(function (response) {
            $window.history.back();
        }, ifError);
    };
    

    $scope.removeRole = function (role) {
        if (!$scope.isLinkDisabled(role)) {
            var index = $scope.user.roles.indexOf(role);
            $scope.user.roles.splice(index, 1);
        }
    };

    $scope.addRole = function (role) {
        $scope.user.roles.push(role);
    };

    $scope.cancel = function () {
        $window.history.back();
    };

    $scope.changePassword = function () {
        $location.path('/admin/ChangePassword');
    };

    $scope.showFn = function (role) {
        if ($scope.user.roles.indexOf(role) != -1) {
            return false;
        } else {
            return true;
        } 
    };


    $scope.isLinkDisabled = function (role) {
        if (($scope.user.id == authService.authentication.user.id) && (role == 'Admin'))
        {
            return true;
        }
        else
        {
            return false;
        }
    }

    $scope.isCurrentUser = function (role) {
        if ($scope.user.id == authService.authentication.user.id) {
            $('#btn-save').css('width', '50%');
            
            $('#btn-cancel').css('width', '47%');
            

            return true;
        }
        else {
            $('#btn-save').css('width', '33%');
            
            $('#btn-cancel').css('width', '31%');
            $('#btn-cancel').css('margin-left', '10px');
            
            $('#btn-delete').css('width', '30%');
            $('#btn-delete').css('margin-left', '10px');
            
            return false;
        }
    }

    function ifError (err) {
        if (err.error_description != undefined) {
            $scope.message = err.error_description;
        }
        else {
            $scope.message = err;
        }

        $scope.$apply();
    }

  }]);