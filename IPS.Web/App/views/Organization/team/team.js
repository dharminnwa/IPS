'use strict';

angular.module('ips.team', ['ui.router', 'kendo.directives', 'growing-panes'])

.config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
    $stateProvider
        .state('home.organizations.organizations.details.teams', {
            url: "/teams",
            abstract: true,
            templateUrl: "views/organization/team/teams.html",
            data: {
                resource: "Teams"
            }
        })
        .state('home.organizations.organizations.details.teams.edit', {
            url: "/edit/:teamId",
            templateUrl: "views/organization/team/team.edit.html",
            controller: "TeamCtrl",
            resolve: {
                team: function ($stateParams, teamService) {
                    return teamService.getById($stateParams.teamId);
                }
            },
            data: {
                displayName: '{{team.name}}',
                paneLimit: 1,
                depth: 4,
                resource: "Teams"
            }
        })
        .state('home.organizations.organizations.details.department.edit.teams', {
            url: "/teams",
            abstract: true,
            templateUrl: "views/organization/team/teams.html",
            data: {
                resource: "Teams"
            }
        })
        .state('home.organizations.organizations.details.department.edit.teams.edit', {
            url: "/edit/:teamId",
            templateUrl: "views/organization/team/team.edit.html",
            controller: "TeamCtrl",
            resolve: {
                team: function ($stateParams, teamService) {
                    return teamService.getById($stateParams.teamId);
                }
            },
            data: {
                displayName: '{{team.viewName}}',
                paneLimit: 1,
                depth: 5,
                data: {
                    resource: "Teams"
                }
            }
        });
}])

    .service('teamService', ['apiService', '$translate', function (apiService, $translate) {
    this.getById = function (id) {
        if (id > 0) {
            return apiService.getById("team", id, "$expand=Link_TeamUsers($expand=User)").then(function (data) {
                data.viewName = data.name;
                return data;
            });
        }
        else {
            return {
                viewName: $translate.instant('ORGANIZATIONS_NEW_TEAM')
            };
        }
        
    };
}])

    .controller('TeamCtrl', ['$scope', '$location', 'authService', 'apiService', '$stateParams', 'cssInjector', 'team', '$state', '$translate', function ($scope, $location, authService, apiService, $stateParams, cssInjector, team, $state, $translate) {

    cssInjector.add('views/organization/team/team.css');

    $scope.isEdit = isEdit();
    $scope.organizationId = $stateParams.organizationId;
    $scope.organizationUsers;
    $scope.userSearch;
    $scope.userCurrentPage = 0;
    $scope.userListCurrentPage = 0;
    $scope.teamUsers = {};
    $scope.parentDepartment;
    $scope.isDepartment = ($stateParams.departmentId) ? true : false;
    $scope.allDepartments;
    $scope.authService = authService;
    $scope.teamInfo = team;

    activate();

    //local permission values
    var vm = new Object();
    vm[$scope.authService.actions.Create] = null;
    vm[$scope.authService.actions.Read] = null;
    vm[$scope.authService.actions.Update] = null;
    vm[$scope.authService.actions.Delete] = null;

    function isDisabled(action) {
        if (vm[action] == null) {
            vm[action] = !authService.hasPermition($scope.organizationId, 'Teams', action);
            return vm[action];
        } else {
            return vm[action];
        }
    }
    $scope.isDisabled = isDisabled;


    function activate() {
        getOrganizationUsers($scope.organizationId, getSelectedTeam);
        getAllDepartments();
    }

    function getOrganizationUsers(organizationId, callback) {
        var apiName = 'user';
        var query = '?$select=Id,FirstName,LastName,ImagePath,WorkPhoneNo,WorkEmail,UserTypeId,UserKey&$expand=JobPositions';
        var filter = '&$filter=OrganizationId eq ' + organizationId + '&$orderby=LastName';
        apiService.getAll(apiName, query + filter).then(function (data) {
            $scope.organizationUsers = data;
            (isEdit() && callback) ? callback() : '';
        });
    }

    function getAllDepartments() {
        var apiName = 'departments/getDepartmentsByOrgId/' + $scope.organizationId;
        var query = '?$select=Id,Name';
        //var filter = '&$filter=OrganizationId eq ' + $scope.organizationId;
        apiService.getAll(apiName, query).then(function (data) {
            $scope.allDepartments = data;
            isUnderDepartment();
        });
    }

    function isUnderDepartment() {
        ($stateParams.departmentId) ? setParentDepartment($stateParams.departmentId) : '';
    }

    function isEdit() {
        return $stateParams.teamId > 0;
    }

    function getSelectedTeam() {
        setTeamLead($scope.teamInfo.teamLeadId);
        setParentDepartment($scope.teamInfo.departmentId);
    }

    function setTeamLead(teamLeadId) {
        if ($scope.organizationUsers && $scope.teamInfo) {
            $scope.teamInfo.lead = getObjectById(teamLeadId, $scope.organizationUsers);
        }
    }

    function setParentDepartment(departmentId) {
        if (departmentId && $scope.allDepartments && $scope.teamInfo) {
            $scope.teamInfo.departmentId = departmentId;
            $scope.parentDepartment = getObjectById(departmentId, $scope.allDepartments);
        }
    }

    function getObjectById(id, searchArray) {
        return searchArray.filter(function (obj) {
            if (obj.id == id) {
                return obj
            }
        })[0];
    }

    /*function getDepartments() {
        var apiName = 'department';
        var query = '$select'
    }*/

    function setDefaultTeamInfo() {
        if ($scope.teamInfo.lead) {
            (!$scope.teamInfo.email) ? $scope.teamInfo.email = $scope.teamInfo.lead.workEmail : '';
            (!$scope.teamInfo.phone) ? $scope.teamInfo.phone = $scope.teamInfo.lead.workPhoneNo : '';
        }
    }

    function isRequired() {
        if ($scope.teamInfo) {
            if ($scope.teamInfo.name) {
                return true;
            }
        }
        return false;
    }

    function saveTeam() {
        isEdit() ? updateTeam() : createNewTeam();
    }

    function createNewTeam() {
        var apiName = 'team';
        if ($scope.teamInfo) {
            var newEntity = {
                name: $scope.teamInfo.name,
                description: $scope.teamInfo.description,
                organizationId: $scope.organizationId,
                teamLeadId: ($scope.teamInfo.lead) ? $scope.teamInfo.lead.id : '',
                email: $scope.teamInfo.email,
                departmentId: ($scope.parentDepartment) ? $scope.parentDepartment.id : '',
                phone: $scope.teamInfo.phone,
                link_TeamUsers: $scope.teamInfo.link_TeamUsers,
                isActive: $scope.teamInfo.isActive,
            }
            apiService.add(apiName, newEntity).then(function (data) {
                (data) ? notification($translate.instant('ORGANIZATIONS_TEAM_SAVED_SUCCESSFULLY'), redirectToOrganization) : notification($translate.instant('ORGANIZATIONS_SAVE_FAILED'));
            });
        }
    }

    function notification(message, callback) {
        $scope.notificationSavedSuccess.show(message, "info");
        callback();
    }

    function updateTeam() {
        var apiName = 'team';
        if ($scope.teamInfo) {
            var teamEntity = {
                name: $scope.teamInfo.name,
                description: $scope.teamInfo.description, 
                organizationId: ($scope.organizationId) ? $scope.organizationId : '',
                id: ($scope.teamInfo.id) ? $scope.teamInfo.id : '',
                teamLeadId: ($scope.teamInfo.lead) ? $scope.teamInfo.lead.id : '',
                departmentId: ($scope.parentDepartment) ? $scope.parentDepartment.id : '',
                email: $scope.teamInfo.email,
                phone: $scope.teamInfo.phone,
                link_TeamUsers: $scope.teamInfo.link_TeamUsers,
                isActive: $scope.teamInfo.isActive,
            }
            apiService.update(apiName, teamEntity).then(function (data) {
                (data) ? notification($translate.instant('ORGANIZATIONS_TEAM_SAVED_SUCCESSFULLY'), redirectToOrganization) : notification($translate.instant('ORGANIZATIONS_SAVE_FAILED'));
            });
        }
    }

    function userPageSize(currentPage, defaultSize) {
        (!defaultSize) ? defaultSize = 24 : '';
        ($scope.userSearch) ? currentPage = 0 : '';
        return ($scope.userSearch) ? $scope.organizationUsers.length : defaultSize;
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
        $scope.teamUsers = {};
        if ($scope.teamInfo && $scope.teamInfo.link_TeamUsers) {
            var currentTeamUsers = $scope.teamInfo.link_TeamUsers;
            for (var teamUser in currentTeamUsers) {
                var currentUser = currentTeamUsers[teamUser].user;
                users[currentUser.id] = currentUser;
            }
        }
        if ($scope.teamInfo.lead) {
            var teamLead = $scope.teamInfo.lead;
            teamLead['isTeamLead'] = true;
            users[teamLead.id] = teamLead;
        }
        $scope.teamUsers = users;

    }

    function resetCurrentPage() {
        ($scope.userSearch) ? $scope.userCurrentPage = 0 : '';
    }

    function isTeamUser(userId) {
        return $scope.teamUsers[userId];
    }

    function addTeamUser(user) {
        $scope.teamUsers[user.id] = user;
    }

    function removeTeamUser(userId) {
        delete $scope.teamUsers[userId];
    }

    function previewUser(userKey) {
        $location.path($location.path() + '/users/preview/' + userKey);
    }

    function addUsersToTeam() {
        if ($scope.teamUsers) {
            $scope.teamInfo['link_TeamUsers'] = {};
            var users = [];
            for (var user in $scope.teamUsers) {
                users.push({
                    teamId: $stateParams.teamId,
                    userId: $scope.teamUsers[user].id,
                    user: $scope.teamUsers[user],
                });
            }
            $scope.teamInfo.link_TeamUsers = users;
        }
    }

    function removeTeam() {
        var apiName = 'team';
        if ($scope.teamInfo.id) {
            apiService.remove(apiName, $scope.teamInfo.id).then(function (data) {
                (data) ? notification($translate.instant('ORGANIZATIONS_TEAM_REMOVED_SUCCESSFULLY'), redirectToOrganization) : notification($translate.instant('ORGANIZATIONS_REMOVE_FAILED'));
            });
        }
    }

    function redirectToOrganization() {
        $state.go($state.$current.parent.parent.name, $stateParams, {
            reload: true
        });
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

    $scope.setDefaultTeamInfo = setDefaultTeamInfo;

    $scope.refreshUsersArray = refreshUsersArray;

    $scope.resetCurrentPage = resetCurrentPage;

    $scope.addTeamUser = addTeamUser;

    $scope.removeTeamUser = removeTeamUser;

    $scope.numberOfUserPages = numberOfUserPages;

    $scope.userPageSize = userPageSize;

    $scope.previewUser = previewUser;

    $scope.isTeamUser = isTeamUser;

    $scope.isRequired = isRequired;

    $scope.saveTeam = saveTeam;

    $scope.removeTeam = removeTeam;

    $scope.addUsersToTeam = addUsersToTeam;

    $scope.goBack = goBack;

}]);