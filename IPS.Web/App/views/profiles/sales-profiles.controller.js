'use strict';

angular.module('ips.profiles')
    .config(['$stateProvider', '$urlRouterProvider', 'profilesTypesEnum', function ($stateProvider, $urlRouterProvider, profilesTypesEnum) {
        $stateProvider
            .state('home.profiles.sales', {
                url: "/profiles/sales",
                templateUrl: "views/profiles/profiles.html",
                resolve: {
                    organizations: function ($stateParams, profilesService) {
                        return profilesService.getOrganizations();
                    },
                    industries: function ($stateParams, profilesService) {
                        return profilesService.getIndustries();
                    },
                    levels: function ($stateParams, profilesService) {
                        return profilesService.getProfileLevels();
                    },
                    performanceGroups: function ($stateParams, profilesService) {
                        return profilesService.getPerformanceGroups("&$filter=(Profile/ProfileTypeId eq " + profilesTypesEnum.soft + ")");
                    },
                    pageName: function ($translate) {
                        return $translate.instant('SOFTPROFILE_SALES_PROFILES');//'Sales Profiles';
                    }
                },
                controller: 'SalesProfilesCtrl',
                data: {
                    displayName: '{{pageName}}',
                    paneLimit: 1,
                    depth: 2
                }
            });
    }])
    .controller('SalesProfilesCtrl', ['$scope', '$location', 'authService', 'apiService', '$window', '$rootScope', 'cssInjector', 'profilesService',
        '$stateParams', '$state', 'organizations', 'industries', 'dialogService', 'levels', 'performanceGroups', 'pageName', '$controller',
        function ($scope, $location, authService, apiService, $window, $rootScope, cssInjector, profilesService,
                  $stateParams, $state, organizations, industries, dialogService, levels, performanceGroups, pageName, $controller) {
            $scope.profileTypeId = 1;

            $controller('ProfilesCtrl', {
                $scope: $scope,
                $location: $location,
                authService: authService,
                apiService: apiService,
                $window: $window,
                $rootScope: $rootScope,
                cssInjector: cssInjector,
                profilesService: profilesService,
                $stateParams: $stateParams,
                $state: $state,
                organizations: organizations,
                industries: industries,
                dialogService: dialogService,
                levels: levels,
                performanceGroups: performanceGroups,
                pageName: pageName
            });
        }]);