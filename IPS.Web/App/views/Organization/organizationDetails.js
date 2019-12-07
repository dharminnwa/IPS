'use strict';

angular
    .module('ips.organization')
.config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
    $stateProvider
        .state('home.organizations.organizations.details', {
            url: "/details/:organizationId",
            templateUrl: "views/organization/organizations.html",
                 controller: "OrganizationCtrl",
            resolve: {
                organization: function ($stateParams, organizationService) {
                    return organizationService.getById($stateParams.organizationId);
                }
            },
            data: {
                displayName: '{{organization.name}}',
                paneLimit: 1,
                depth: 3,
                resource: "Organizations"
            }
        });
}])

.controller('OrganizationDetailsCtrl', ['$scope', '$location', '$stateParams', 'authService', 'apiService', '$cacheFactory', 'cssInjector', 'organizationService', 'organizationManager', 'organization', function ($scope, $location, $stateParams, authService, apiService, $cacheFactory, cssInjector, organizationService, organizationManager, organization) {
    
    console.log($stateParams);
    cssInjector.removeAll();
    cssInjector.add('views/organization/organization.css');
    console.log($scope.depth+" "+$scope.paneDepth+" "+$scope.paneLimit);
    $scope.selectedOrganizationDetailsTab;
    //$scope.paneDepth=2;
    $scope.userCurrentPage = 0;
    $scope.groupTab = {
        name: (organizationService.hrViewGroupBy) ? organizationService.hrViewGroupBy : 'departments'
    };
    $scope.userPageSize = 24;
    $scope.parentOrganization;
    $scope.allOrganizations = [];
    $scope.organizationIndustry;
    $scope.organizationCountry;
    $scope.organizationVisitingCountry;
    $scope.countries;
    $scope.industries;
    $scope.authService = authService;
    $scope.organizationId = $stateParams.organizationId;
    
    $scope.selectedOrganizationDetailsTab = organization;

    $scope.Math = window.Math;

    //local permission values
    var vm = new Object();
    vm['departments' + $scope.authService.actions.Create] = null;
    vm['teams' + $scope.authService.actions.Create] = null;
    vm['users' + $scope.authService.actions.Create] = null;
    console.log($scope);
    //filterUsers();

    function filterUsers() {
        $scope.selectedOrganizationDetailsTab.users = getActive(organization.users);
        
        for (var i = 0; i < $scope.selectedOrganizationDetailsTab.departments.length; i++) {
            $scope.selectedOrganizationDetailsTab.departments[i].users = getActive($scope.selectedOrganizationDetailsTab.departments[i].users);
        }

        for (var i = 0; i < $scope.selectedOrganizationDetailsTab.teams.length; i++) {
            var tu = [];
            for (var j = 0; j < $scope.selectedOrganizationDetailsTab.teams[i].link_TeamUsers.length; j++) {
                if ($scope.selectedOrganizationDetailsTab.teams[i].link_TeamUsers[j].user.isActive)
                    tu.push($scope.selectedOrganizationDetailsTab.teams[i].link_TeamUsers[j]);
            }
            $scope.selectedOrganizationDetailsTab.teams[i].link_TeamUsers = tu;
        }
    }

    function getActive(users) {
        var u = [];
        for (var i = 0; i < users.length; i++) {
            if (users[i].isActive)
                u.push(users[i]);
        }
        return u;
    }

    function isDisabled(permissionName, action) {
        if (vm[permissionName.toLowerCase() + action] == null) {
            vm[permissionName.toLowerCase() + action] = !$scope.authService.hasPermition($scope.organizationId, permissionName, action);
        }
        return vm[permissionName.toLowerCase() + action];
    }

    function setSelectedTab() {
        (organizationService.selectedTab) ? $("#kendo-tab-strip").kendoTabStrip().data("kendoTabStrip").select(organizationService.selectedTab) : '';
    }

    function getAllOrganization() {
        var apiName = 'organization';
        var query = '?$select=Id,Name';
        organizationManager.getOrganizations(query).then(function (data) {
            $scope.allOrganizations = data;
            $scope.parentOrganization = getById($scope.selectedOrganizationDetailsTab.parentId, $scope.allOrganizations);
        });
    }

    function getAllCountries() {
        var apiName = 'country';
        var query = '?$select=Id,CountryName';
        apiService.getAll(apiName, query).then(function (data) {
            $scope.countries = data;
            $scope.organizationCountry = getById($scope.selectedOrganizationDetailsTab.countryId, $scope.countries);
            $scope.organizationVisitingCountry = getById($scope.selectedOrganizationDetailsTab.visitingCountryId, $scope.countries);
        });
    }

    function getAllIndustries() {
        var apiName = 'industries';
        var query = '?$select=Id,Name';
        apiService.getAll(apiName, query).then(function (data) {
            $scope.industries = data;
            $scope.organizationIndustry = getById($scope.selectedOrganizationDetailsTab.industryId, $scope.industries);
        });
    }

    function getById(id, myArray) {
        return myArray.filter(function (obj) {
            if (obj.id == id) {
                return obj
            }
        })[0]
    }

    function isOrganizationTeams() {
        if($scope.selectedOrganizationDetailsTab.teams){
            var teams = $scope.selectedOrganizationDetailsTab.teams;
            for(var i = 0, len = teams.length; i < len; i++){
                if (!teams[i].departmentId) {
                    return true;
                }
            }
            return false;
        } else {
            return false;
        }
    }

    function newTeam(organizationId) {
        organizationService.hrViewGroupBy = $scope.groupTab.name;
        organizationService.selectedTab = $("#kendo-tab-strip").kendoTabStrip().data("kendoTabStrip").select().index();
           $location.path($location.path() +'/details/'+organizationId+'/teams/edit/0');
    }

    function editTeam(teamId, departmentId) {
        organizationService.hrViewGroupBy = $scope.groupTab.name;
        organizationService.selectedTab = $("#kendo-tab-strip").kendoTabStrip().data("kendoTabStrip").select().index();
		if(departmentId==null)
		{
			var location=$location.path() +'/details/'+$scope.selectedOrganizationDetailsTab.id+'/department/edit/'+departmentId+'/teams/edit/' + teamId;
		}
		else
		{
			var location=$location.path() +'/details/'+$scope.selectedOrganizationDetailsTab.id+'/teams/edit/' + teamId;
		}
        $location.path(location);
    }

    function newUser(organizationId) {
        organizationService.hrViewGroupBy = $scope.groupTab.name;
        organizationService.selectedTab = $("#kendo-tab-strip").kendoTabStrip().data("kendoTabStrip").select().index();
        console.log($location.path() + '/details'+organizationId+'/users/new');
        $location.path($location.path() + '/details'+organizationId+'/users/new');
    }

    function newDepartment(organizationId) {
        organizationService.hrViewGroupBy = $scope.groupTab.name;
        organizationService.selectedTab = $("#kendo-tab-strip").kendoTabStrip().data("kendoTabStrip").select().index();
        console.log($location.path() +'/details'+organizationId+ '/department/edit/0');
		$location.path($location.path() +'/details'+organizationId+ '/department/edit/0');
    }

    function editDepartment(departmentId) {
        organizationService.hrViewGroupBy = $scope.groupTab.name;
        organizationService.selectedTab = $("#kendo-tab-strip").kendoTabStrip().data("kendoTabStrip").select().index();
        $location.path($location.path() + '/department/edit/' + departmentId);
    }

    function expandUsers(departmentId) {
        var userListId = '#department-' + departmentId;
        $(userListId + ' li.hide').removeClass('hide');
        $('#expand-button-' + departmentId).addClass('hide');
        $('#collapse-button-' + departmentId).removeClass('hide');
    }

    function collapseUsers(departmentId) {
        var userListId = '#department-' + departmentId;
        var users = $(userListId + ' li');

        for (var i = 0; i < users.length; i++) {
            (i >= 6) ? users[i].className = users[i].className + ' hide' : '';
        }

        $('#expand-button-' + departmentId).removeClass('hide');
        $('#collapse-button-' + departmentId).addClass('hide');
    }

    function goBack() {
        history.back();
    }

    function numberOfUserPages() {
        if (organizationService.selectedOrganization) {
            return Math.ceil(organizationService.selectedOrganization.users.length / $scope.userPageSize);
        }
    }

    function previewUser(userId) {
        $location.path($location.path() + '/users/preview/' + userId);
    }

    $scope.previewUser = previewUser;

    $scope.numberOfUserPages = numberOfUserPages;

    $scope.newDepartment = newDepartment;

    $scope.isOrganizationTeams = isOrganizationTeams;

    $scope.newUser = newUser;

    $scope.setSelectedTab = setSelectedTab;

    $scope.editDepartment = editDepartment;

    $scope.newTeam = newTeam;

    $scope.editTeam = editTeam;

    $scope.expandUsers = expandUsers;

    $scope.collapseUsers = collapseUsers;

    $scope.put = function (key, value) {
        $scope.cache.put(key, value === undefined ? null : value);
    }

    $scope.goBack = goBack;

    $scope.isDisabled = isDisabled;


}])