'use strict';

angular.module('ips.admin.users', ['ui.router'])

 .config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
     $stateProvider
         .state('admin.users', {
             url: "/admin/users",
             templateUrl: "views/admin/users/users.html",
             controller: "UsersCtrl"
         });
 }])

.controller('UsersCtrl', ['$scope', '$filter', 'authService', '$rootScope', function ($scope, $filter, authService, $rootScope) {
    $rootScope.Title = "USERS";
    $scope.show = "All";
    $scope.isLoaded = false;
    $scope.message = "";
    $scope.userSearch = "";

    authService.getUsers().then(function (response) {
        $scope.users = response.data;
        $scope.isLoaded = true;
    }, function (err) {
        if (err.error_description != undefined) {
            $scope.message = err.error_description;
        }
        else {
            $scope.message = err;
        }

        //$scope.$apply();
    });

    $scope.addUser = function() {
        //$scope.users.push({text:$scope.todoText, done:false});
        //$scope.todoText = '';
    };

    $scope.disableUser = function (id)
    {

        $filter('filter')($scope.users, function (d) { return d.id == id; })[0].isActive = false;
        $scope.$apply();
    }

    $scope.todoSortable = {
        containment: "parent",//Dont let the user drag outside the parent
        cursor: "move",//Change the cursor icon on drag
        tolerance: "pointer"//Read http://api.jqueryui.com/sortable/#option-tolerance
    };

    /* Filter Function for All | Incomplete | Complete */
    $scope.showFn = function (user) {
        if ($scope.show === "All") {
            return true;
        } else if (user.isActive && $scope.show === "Active") {
            return true;
        } else if (!user.isActive && $scope.show === "Inactive") {
            return true;
        } else {
            return false;
        }
    };

    $scope.searchFn = function (item) {
        return (angular.lowercase(item.username + item.firstName + item.lastName)).match(angular.lowercase($scope.userSearch))
    }

  }]);