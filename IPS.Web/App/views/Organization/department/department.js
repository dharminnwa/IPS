'use strict';

angular.module('ips.department', ['ui.router', 'kendo.directives', 'growing-panes'])

.config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
      $stateProvider
        .state('home.organizations.organizations.details.department', {
            url: "/department",
            abstract: true,
            templateUrl: "views/organization/department/department.html",
            data: {
                resource:"Departments",
            }
        })
        .state('home.organizations.organizations.details.department.edit', {
            url: "/edit/:departmentId",
            templateUrl: "views/organization/department/department.edit.html",
            controller: "DepartmentCtrl",
            resolve: {
                department: function ($stateParams, departmentService) {
                    return departmentService.getById($stateParams.departmentId);
                }
            },
            data: {
                displayName: '{{department.viewName}}',
                paneLimit: 1,
                depth: 4,
                resource: "Departments",
            }
        });
}])


    .service('departmentService', ['apiService', '$translate', function (apiService, $translate) {
    this.getById = function (id) {
        if (id > 0) {
            return apiService.getById("department", id, "$expand=Teams,Users($expand=JobPositions)").then(function (data) {
                data.viewName = data.name;
                return data;
            });
        }
        else {
            return {
                viewName: $translate.instant('ORGANIZATIONS_NEW_DEPARTMENT')
            };
        }
    };
}])

    .controller('DepartmentCtrl', ['$scope', '$location', 'authService', 'apiService', '$stateParams', 'cssInjector', 'department', 'departmentService', '$state', '$translate', function ($scope, $location, authService, apiService, $stateParams, cssInjector, department, organizationService, $state, $translate) {
        
    cssInjector.add('views/organization/department/department.css');
    $scope.organizationId = $stateParams.organizationId;
    $scope.organizationUsers;
	$scope.paneDepth=3;
    $scope.userCurrentPage = 0;
    $scope.userListCurrentPage = 0;
    $scope.teamsCurrentPage = 0;
    $scope.userSearch;
    $scope.departmentUsers = {};
    $scope.authService = authService;
    activate();

    $scope.departmentInfo = department;

    //local permission values
    var vm = new Object();
        vm[$scope.authService.actions.Create] = null;
        vm[$scope.authService.actions.Read] = null;
        vm[$scope.authService.actions.Update] = null;
        vm[$scope.authService.actions.Delete] = null;

    function isDisabled(action) {
        if (vm[action] == null) {
            vm[action] = !authService.hasPermition($scope.organizationId, 'Departments', action);
            return vm[action];
        } else {
            return vm[action];
        }
    }
    $scope.isDisabled = isDisabled;
        
    function activate() {
        getOrganizationUsers($scope.organizationId, getSelectedDepartment);
    }


    function getOrganizationUsers(organizationId, callback) {
        var apiName = 'user';
        var query = '?$select=Id,FirstName,LastName,ImagePath,WorkPhoneNo,WorkEmail,UserTypeId,UserKey&$expand=JobPositions';
        var filter = '&$filter=OrganizationId eq ' + organizationId + '&$orderby=LastName';
        apiService.getAll(apiName, query + filter).then(function (data) {
            $scope.organizationUsers = data;
            isEdit() ? callback() : '';

        });
    }

    
    function isEdit() {
        return $stateParams.departmentId > 0; //($location.path().indexOf('department/edit') > -1);
    }

    function getSelectedDepartment() {
        setManager($scope.departmentInfo.managerId);
        setDepartmentUsers();
    }

    function setManager(managerId) {
        if ($scope.organizationUsers) {
            ( $scope.departmentInfo ) ? $scope.departmentInfo.manager = getObjectById(managerId, $scope.organizationUsers) : '';
        }
    }

    function setDepartmentUsers() {
        
    }

    function getObjectById(id, searchArray) {
        return searchArray.filter(function (obj) {
            if (obj.id == id) {
                return obj
            }
        })[0];
    }

    function createNewDepartment() {
        var apiName = 'department';
        if ($scope.departmentInfo) {
            var newEntity = {
                name: ($scope.departmentInfo.name) ? $scope.departmentInfo.name : '',
                description: ($scope.departmentInfo.description) ? $scope.departmentInfo.description : '',
                organizationId: ($scope.organizationId) ? $scope.organizationId : '',
                managerId: ($scope.departmentInfo.manager) ? $scope.departmentInfo.manager.id : '',
                email: ($scope.departmentInfo.email) ? $scope.departmentInfo.email : '',
                phone: ($scope.departmentInfo.phone) ? $scope.departmentInfo.phone : '',
                users: ($scope.departmentInfo.users) ? $scope.departmentInfo.users : '',
                isActive: $scope.departmentInfo.isActive,
            }
            apiService.add(apiName, newEntity).then(function (data) {
                (data) ? notification($translate.instant('ORGANIZATIONS_DEPARTMENT_SAVED_SUCCESSFULLY'), refreshOrganization) : notification($translate.instant('ORGANIZATIONS_SAVE_FAILED'));
            });
        }
    }

    function updateDepartment() {
        var apiName = 'department';
        if ($scope.departmentInfo) {
            var departmentEntity = {
                name: ($scope.departmentInfo.name) ? $scope.departmentInfo.name : '',
                description: ($scope.departmentInfo.description) ? $scope.departmentInfo.description : '',
                organizationId: ($scope.organizationId) ? $scope.organizationId : '',
                id: ($scope.departmentInfo) ? $scope.departmentInfo.id : '',
                managerId: ($scope.departmentInfo.manager) ? $scope.departmentInfo.manager.id : '',
                email: ($scope.departmentInfo.email) ? $scope.departmentInfo.email : '',
                phone: ($scope.departmentInfo.phone) ? $scope.departmentInfo.phone : '',
                users: ($scope.departmentInfo.users) ? $scope.departmentInfo.users : '',
                isActive: $scope.departmentInfo.isActive,
            }
            apiService.update(apiName, departmentEntity).then(function (data) {
                (data) ? notification($translate.instant('ORGANIZATIONS_DEPARTMENT_SAVED_SUCCESSFULLY'), refreshOrganization) : notification($translate.instant('ORGANIZATIONS_SAVE_FAILED'));
            });
        }
    }

    function removeDepartment() {
        var apiName = 'department';
        if ($scope.departmentInfo.id) {
            apiService.remove(apiName, $scope.departmentInfo.id).then(function (data) {
                (data) ? notification($translate.instant('ORGANIZATIONS_DEPARTMENT_REMOVED_SUCCESSFULLY'), refreshOrganization) : notification($translate.instant('ORGANIZATIONS_REMOVE_FAILED'));
            });
        }
    }

    function addTeam() {
        $location.path($location.path() + '/teams/edit/0');
    }

    function refreshOrganization() {
        $state.go($state.$current.parent.parent.name, $stateParams, {
            reload: true
        });
    }

    function saveDepartment() {
        isEdit() ? updateDepartment() : createNewDepartment();
    }

    function notification(message, callback) {
        $scope.notificationSavedSuccess.show(message, "info");
        (callback) ? callback() : '';
    }

   
    function isRequired() {
        if ($scope.departmentInfo) {
            if ($scope.departmentInfo.name) {
                return true;
            }
        }
        return false;
    }

    function setDefaultDepartmentInfo() {
        if ($scope.departmentInfo.manager) {
            (!$scope.departmentInfo.email) ? $scope.departmentInfo.email = $scope.departmentInfo.manager.workEmail : '';
            (!$scope.departmentInfo.phone) ? $scope.departmentInfo.phone = $scope.departmentInfo.manager.workPhoneNo : '';
        }
    }

    function addDepartmentUser(user) {
        $scope.departmentUsers[user.id] = user;
    }

    function removeDepartmentUser(userId) {
        delete $scope.departmentUsers[userId];
    }

    function isDepartmentUser(userId) {
        if ($scope.departmentUsers[userId])
        {
            return true;
        }
        return false;
    }

    function previewUser(userKey) {
        $location.path($location.path() + '/users/preview/' + userKey);
    }

    function numberOfUserPages(countObj) {
        if (countObj && countObj.length) {
            var counter = countObj.length / $scope.userPageSize();
            isNextPage(counter) ? counter += 1 : '';
            return Math.ceil(counter)
        }
    }

    function isNextPage(number) {
        return (number >= 1.7);
    }

    function refreshUsersArray() {
        var users = {};
        if ($scope.departmentInfo && $scope.departmentInfo.users) {
            for (var user in $scope.departmentInfo.users) {
                var currentUser = $scope.departmentInfo.users[user];
                users[currentUser.id] = currentUser;
            }
        }
        if ($scope.departmentInfo.manager) {
            var manager = $scope.departmentInfo.manager;
            manager['isManager'] = true;
            users[manager.id] = manager;
        }
        $scope.departmentUsers = users;

    }

    function resetCurrentPage() {
        ($scope.userSearch) ? $scope.userCurrentPage = 0 : '';
    }

    function userPageSize(currentPage, defaultSize) {
        (!defaultSize) ? defaultSize = 24 : '';
        ($scope.userSearch) ? currentPage = 0 : '';
        return ($scope.userSearch) ? $scope.organizationUsers.length : defaultSize;
    }



    function addUsersToDepartment() {
        if ($scope.departmentUsers) {
            var users = [];
            for (var user in $scope.departmentUsers) {
                users.push($scope.departmentUsers[user]);
            }
            $scope.departmentInfo['users'] = users;
        }
    }

    function goBack() {
        history.back();
    }

    $scope.notificationOptions = {
        position: {
            top: 30,
            right: 30
        }
    }

    $scope.setDefaultDepartmentInfo = setDefaultDepartmentInfo;

    $scope.refreshUsersArray = refreshUsersArray;

    $scope.resetCurrentPage = resetCurrentPage;

    $scope.addDepartmentUser = addDepartmentUser;

    $scope.removeDepartmentUser = removeDepartmentUser;

    $scope.numberOfUserPages = numberOfUserPages;

    $scope.userPageSize = userPageSize;

    $scope.previewUser = previewUser;

    $scope.isDepartmentUser = isDepartmentUser;

    $scope.isRequired = isRequired;

    $scope.saveDepartment = saveDepartment;
    
    $scope.removeDepartment = removeDepartment;

    $scope.addUsersToDepartment = addUsersToDepartment;
    
    $scope.addTeam = addTeam;

    $scope.goBack = goBack;

}]);