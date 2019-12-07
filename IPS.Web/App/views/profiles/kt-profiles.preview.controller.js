'use strict';

angular.module('ips.profiles')
    .config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
        var stateResolveConfig = {
            pageName: function ($translate) {
                return $translate.instant('MYPROJECTS_FINAL_PROFILE');
            },
            profileType: function () {
                return "knowledgetest";
            },
            profile: function ($stateParams, profilesService, profileType) {
                return profilesService.getById($stateParams.profileId, profileType);
            },
            isInUse: function ($stateParams, profilesService) {
                return profilesService.isProfileInUse($stateParams.profileId);
            },
            industries: function ($stateParams, profilesService) {
                return profilesService.getIndustries();
            },
            profileLevels: function ($stateParams, profilesService) {
                return profilesService.getProfileLevels();
            },
            jobTitles: function ($stateParams, profilesService) {
                return profilesService.getJobTitles();
            },
            organizations: function ($stateParams, profilesService) {
                return profilesService.getOrganizations();
            },
            profileCategories: function ($stateParams, profilesService) {
                return profilesService.getProfileCategories();
            },
            treeItems: function ($stateParams, profilesService, profileType) {
                return profilesService.getTreeItems($stateParams.profileId, profileType).then(function (data) {
                    return data;
                });
            },
            medalRules: function ($stateParams, profilesService) {
                return profilesService.getMedalRules();
            }
        };

        $stateProvider
            .state('home.profiles.knowledgetest.edit.preview', {
                url: "/preview",
                templateUrl: "views/profiles/profiles.kt.preview.html",
                controller: "KTProfilePreviewCtrl",
                resolve: stateResolveConfig,
                data: {
                    displayName: '{{pageName}}',//'Final Profile',
                    paneLimit: 1,
                    depth: 4,
                    resource: "Profiles"
                }
            });
    }])
    .controller('KTProfilePreviewCtrl', ['$scope',
        '$location', 'authService', 'apiService', '$stateParams', '$window', '$rootScope',
        'cssInjector', 'profilesService', '$state', 'profile', 'isInUse', 'industries',
        'profileLevels', 'jobTitles', 'organizations', 'profileCategories',
        'dialogService', 'treeItems', 'medalRules', '$controller', '$translate',
        function ($scope, $location, authService, apiService, $stateParams, $window, $rootScope,
                  cssInjector, profilesService, $state, profile, isInUse, industries,
                  profileLevels, jobTitles, organizations, profileCategories,
            dialogService, treeItems, medalRules, $controller, $translate) {
            $controller('KTProfileEditCtrl', {
                $scope: $scope,
                $location: $location,
                authService: authService,
                apiService: apiService,
                $stateParams: $stateParams,
                $window: $window,
                $rootScope: $rootScope,
                cssInjector: cssInjector,
                profilesService: profilesService,
                $state: $state,
                profile: profile,
                isInUse: isInUse,
                industries: industries,
                profileLevels: profileLevels,
                jobTitles: jobTitles,
                organizations: organizations,
                profileCategories: profileCategories,
                dialogService: dialogService,
                treeItems: treeItems,
                medalRules: medalRules,
                $controller: $controller
            });

            var medalRule = $scope.private.getById($scope.selectedProfile.medalRuleId, $scope.medalRules);
            $scope.selectedProfile.medalRuleName = medalRule ? medalRule.name : $translate.instant('MYPROJECTS_SELECT_MEDAL_RULE');

            $controller('ProfilePreviewCtrl', {
                $scope: $scope
            });
        }]);