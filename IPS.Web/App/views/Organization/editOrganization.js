'use strict';

angular
    .module('ips.organization')
.config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
    var baseNewOrganizationResolve = {
        pageName: function ($translate) {
            return $translate.instant('ORGANIZATIONS_NEWORGANIZATION_NEW_ORGANIZATION');
        }
    };
    var baseEditOrganizationResolve = {
        pageName: function ($translate) {
            return $translate.instant('ORGANIZATIONS_EDIT_ORGANIZATION');
        }
    };
    $stateProvider
        .state('home.organizations.organizations.new', {
            url: "/new",
            templateUrl: "views/organization/organization.edit.html",
            controller: "OrganizationEditCtrl",
            resolve: baseNewOrganizationResolve,
            data: {
                displayName: '{{pageName}}',//'New Organization',
                paneLimit: 1,
                depth: 3,
                resource: "Organizations",
            }
        })
        .state('home.organizations.organizations.edit', {
            url: "/edit/:organizationId",
            templateUrl: "views/organization/organization.edit.html",
            controller: "OrganizationEditCtrl",
            resolve: baseEditOrganizationResolve,
            data: {
                displayName: '{{pageName}}',//'Edit Organization',
                paneLimit: 1,
                depth: 3,
                resource: "Organizations",
            }
        });
}])

    .controller('OrganizationEditCtrl', ['$scope', '$location', '$stateParams', 'authService', 'apiService', '$cacheFactory', 'cssInjector', 'organizationService', 'organizationManager', '$translate', function ($scope, $location, $stateParams, authService, apiService, $cacheFactory, cssInjector, organizationService, organizationManager, $translate) {
    cssInjector.removeAll();
    cssInjector.add('views/organization/organization.css');
    $scope.apiName = 'organization';
    $scope.isEdit = isEdit();
    $scope.paneDepth=2;
    $scope.allOrganizations = [];
    $scope.selectedOrganization;
    $scope.countries;
    $scope.industries;
    $scope.groupTab = 'departments';
    $scope.organizationInfo = {};
    $scope.organizationId = $stateParams.organizationId;
    $scope.authService = authService;

    createCacheFactory();
    activate();


    //local permission values
    var vm = new Object();
    vm[$scope.authService.actions.Edit] = null;
    vm[$scope.authService.actions.Delete] = null;

    $scope.isDisabled = function(action) {
        if (vm[action] == null) {
            vm[action] = !$scope.authService.hasPermition($scope.organizationId, 'Organizations', action);
        }
        return vm[action];
    }

    function activate() {

        getAllOrganization();
        getAllCountries();
        getAllIndustries();

        isEdit() ? activateEditPage() : '';
    }

    function activateEditPage() {
        setOrganizationInfo();
    }

    function createCacheFactory() {
        if (!$cacheFactory.get('cacheId')) {
            $scope.cache = $cacheFactory('cacheId');
        } else {
            $scope.cache = $cacheFactory.get('cacheId')
        }
    }

    function getAllOrganization() {
        var apiName = 'organization';
        var query = '?$select=Id,Name';
        organizationManager.getOrganizations(query).then(function (data) {
            $scope.allOrganizations = data;
            if (isEdit()) {
                $scope.organizationInfo.parentOrganization = getById($scope.organizationInfo.parentId, $scope.allOrganizations);
                if ($scope.organizationInfo.parentOrganization == undefined || $scope.organizationInfo.parentOrganization == null) {
                    $scope.organizationInfo.parentOrganization = {};
                }
               
            }
        });
    }

    function getAllCountries() {
        var apiName = 'country';
        var query = '?$select=Id,CountryName';
        apiService.getAll(apiName, query).then(function (data) {
            $scope.countries = data;
            if (isEdit()) {
                $scope.organizationInfo.organizationCountry = getById($scope.organizationInfo.countryId, $scope.countries);
                $scope.organizationInfo.organizationVisitingCountry = getById($scope.organizationInfo.visitingCountryId, $scope.countries)
            }
        });
    }

    function getAllIndustries() {
        var apiName = 'industries';
        var query = '?$select=Id,Name';
        apiService.getAll(apiName, query).then(function (data) {
            $scope.industries = data;
            if (isEdit()) {
                $scope.organizationInfo.organizationIndustry = getById($scope.organizationInfo.industryId, $scope.industries);
            }
        });
    }

    function getOrganizationById(organizationId) {
        var key = $scope.apiName + organizationId;
        var query = '$expand=Teams($expand=Link_TeamUsers($expand=User)),Departments($expand=Users)';

        if ($scope.cache.get(key) === undefined) {
            return apiService.getById($scope.apiName, organizationId, query).then(function (data) {
                organizationService.selectedOrganization = data;
                $scope.selectedOrganization = organizationService.selectedOrganization;
                if (isEdit()) {
                    $scope.organizationInfo = organizationService.selectedOrganization;
                    getAllCountries();
                    getAllOrganization();
                    getAllIndustries();
                }
                $scope.put(key, data);
            });
        } else {
            organizationService.selectedOrganization = $scope.cache.get(key);
            $scope.selectedOrganization = organizationService.selectedOrganization;
            if (isEdit()) {
                $scope.organizationInfo = organizationService.selectedOrganization;
                getAllCountries();
                getAllOrganization();
                getAllIndustries();
            }
        }
    }

    function setOrganizationInfo() {
        if ($stateParams.organizationId) {
            if (organizationService.selectedOrganization && $stateParams.organizationId == organizationService.selectedOrganization.id) {
                $scope.organizationInfo = organizationService.selectedOrganization;
            } else {
                getOrganizationById($stateParams.organizationId);
            }
        }
    }

    function setSelectableFields() {
        if ($scope.organizationInfo) {
            $scope.organizationInfo.parentOrganization = getById($scope.organizationInfo.parentId, $scope.allOrganizations);
            if ($scope.organizationInfo.parentOrganization == undefined || $scope.organizationInfo.parentOrganization == null) {
                $scope.organizationInfo.parentOrganization = {};
            }
            $scope.organizationInfo.organizationIndustry = $scope.organizationInfo.industry.id;
        }
    }

    function getById(id, myArray) {
        return myArray.filter(function (obj) {
            if (obj.id == id) {
                return obj
            }
        })[0]
    }
    

    function saveOrganization() {
        isEdit() ? updateOrganization() : createOrganization();
    }

    function createOrganization() {
        ($scope.organizationInfo.parentOrganization) ? $scope.organizationInfo['parentId'] = $scope.organizationInfo.parentOrganization.id : '';
        ($scope.organizationInfo.organizationIndustry) ? $scope.organizationInfo['industryId'] = $scope.organizationInfo.organizationIndustry.id : '';
        ($scope.organizationInfo.organizationCountry) ? $scope.organizationInfo['countryId'] = $scope.organizationInfo.organizationCountry.id : '';
        ($scope.organizationInfo.organizationVisitingCountry) ? $scope.organizationInfo['visitingCountryId'] = $scope.organizationInfo.organizationVisitingCountry.id : '';
        ($scope.organizationInfo.contactTitle) ? $scope.organizationInfo['contactTitleId'] = $scope.organizationInfo.contactTitle.id : '';
        ($scope.organizationInfo.contactRole) ? $scope.organizationInfo['contactRoleId'] = $scope.organizationInfo.contactRole.id : '';
        if ($scope.organizationInfo) {
            apiService.add($scope.apiName, $scope.organizationInfo).then(function (data) {
                (data) ? notification($translate.instant('ORGANIZATIONS_ORGANIZATION_SAVED_SUCCESSFULLY'), redirectToOrganization) : notification($translate.instant('ORGANIZATIONS_SAVE_FAILED'));
            });
        }
    }

    function updateOrganization() {
        ($scope.organizationInfo.parentOrganization) ? $scope.organizationInfo['parentId'] = $scope.organizationInfo.parentOrganization.id : '';
        ($scope.organizationInfo.organizationIndustry) ? $scope.organizationInfo['industryId'] = $scope.organizationInfo.organizationIndustry.id : '';
        ($scope.organizationInfo.organizationCountry) ? $scope.organizationInfo['countryId'] = $scope.organizationInfo.organizationCountry.id : '';
        ($scope.organizationInfo.organizationVisitingCountry) ? $scope.organizationInfo['visitingCountryId'] = $scope.organizationInfo.organizationVisitingCountry.id : '';
        ($scope.organizationInfo.contactTitle) ? $scope.organizationInfo['contactTitleId'] = $scope.organizationInfo.contactTitle.id : '';
        ($scope.organizationInfo.contactRole) ? $scope.organizationInfo['contactRoleId'] = $scope.organizationInfo.contactRole.id : '';
        apiService.update($scope.apiName, $scope.organizationInfo).then(function (data) {
            (data) ? notification($translate.instant('ORGANIZATIONS_ORGANIZATION_SAVED_SUCCESSFULLY'), redirectToOrganization) : notification($translate.instant('ORGANIZATIONS_SAVE_FAILED'));
        });
    }

    function removeOrganization() {
        apiService.remove($scope.apiName, $scope.organizationInfo.id).then(function (data) {
            (data) ? notification($translate.instant('ORGANIZATIONS_ORGANIZATION_REMOVED_SUCCESSFULLY'), redirectToOrganization) : notification($translate.instant('ORGANIZATIONS_REMOVE_FAILED'));
        });
    }

    function notification(message, callback) {
        $scope.notificationSavedSuccess.show(message, "info");
        callback();
    }

    function redirectToOrganization() {
        $location.path('/home/organizations/organizations');
    }

    function isEdit() {
        return ($location.path().indexOf('edit') > -1);
    }

    function isRequired() {
        if ($scope.organizationInfo) {
            if ($scope.organizationInfo.name) {
                return true;
            }
        }
        return false;
    }

    function goBack() {
        history.back();
    }

    $scope.isRequired = isRequired;

    $scope.removeOrganization = removeOrganization;

    $scope.notification = notification;

    $scope.getOrganization = getOrganizationById;

    $scope.goBack = goBack;

    $scope.put = function (key, value) {
        $scope.cache.put(key, value === undefined ? null : value);
    }

    $scope.saveOrganization = saveOrganization;
}])