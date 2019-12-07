'use strict';

angular.module('ips.profiles')
    .config(['$stateProvider', '$urlRouterProvider', 'profilesTypesEnum', function ($stateProvider, $urlRouterProvider, profilesTypesEnum) {
        $stateProvider
            .state('home.profiles.knowledgetest', {
                url: "/profiles/knowledgetest",
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
                        return profilesService.getPerformanceGroups("&$filter=(Profile/ProfileTypeId eq " + profilesTypesEnum.knowledgetest + ")");
                    },
                    pageName: function ($translate) {
                        return $translate.instant('SOFTPROFILE_KNOWLEDGE_PROFILES');//'Knowledge Profiles';
                    }
                },
                controller: 'KTProfilesCtrl',
                data: {
                    displayName: '{{pageName}}',
                    paneLimit: 1,
                    depth: 2,
                    resource: "Profiles"
                }
            });
    }])
    .controller('KTProfilesCtrl', ['$scope', '$location', 'authService', 'apiService', '$window', '$rootScope', 'cssInjector', 'profilesService',
        '$stateParams', '$state', 'organizations', 'industries', 'dialogService', 'levels', 'performanceGroups', 'pageName', '$controller',
        function ($scope, $location, authService, apiService, $window, $rootScope, cssInjector, profilesService,
                  $stateParams, $state, organizations, industries, dialogService, levels, performanceGroups, pageName, $controller) {
            $scope.profileTypeId = 5;

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