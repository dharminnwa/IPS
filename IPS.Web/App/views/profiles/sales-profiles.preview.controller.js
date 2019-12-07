'use strict';

angular.module('ips.profiles')
    .config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
        var stateResolveConfig = {
            pageName: function ($translate) {
                return $translate.instant('MYPROJECTS_FINAL_PROFILE');
            },
            profileType: function () {
                return "soft";
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
            scales: function ($stateParams, profilesService) {
                return profilesService.getScales();
            },
            organizations: function ($stateParams, profilesService) {
                return profilesService.getOrganizations();
            },
            profileCategories: function ($stateParams, profilesService) {
                return profilesService.getProfileCategories();
            },
            scaleSettingsRules: function ($stateParams, profilesService) {
                return profilesService.getScaleSettingsRules();
            },
            treeItems: function ($stateParams, profilesService, profileType) {
                return profilesService.getTreeItems($stateParams.profileId, profileType).then(function (data) {
                    return data;
                });
            }
        };

        $stateProvider
            .state('home.profiles.soft.edit.preview', {
                url: "/preview",
                templateUrl: "views/profiles/profiles.soft.preview.html",
                controller: "SoftProfilePreviewCtrl",
                resolve: stateResolveConfig,
                data: {
                    displayName: '{{pageName}}',//'Final Profile',
                    paneLimit: 1,
                    depth: 4
                }
            });
    }])
    .controller('SoftProfilePreviewCtrl', ['$scope',
        '$location', 'authService', 'apiService', '$stateParams', '$window', '$rootScope',
        'cssInjector', 'profilesService', '$state', 'profile', 'isInUse', 'industries',
        'profileLevels', 'jobTitles', 'scales', 'organizations', 'profileCategories',
        'scaleSettingsRules', 'dialogService', 'treeItems', '$controller', '$translate',
        function ($scope, $location, authService, apiService, $stateParams, $window, $rootScope,
                  cssInjector, profilesService, $state, profile, isInUse, industries,
                  profileLevels, jobTitles, scales, organizations, profileCategories,
            scaleSettingsRules, dialogService, treeItems, $controller, $translate) {

            $controller('SoftProfileEditorCtrl', {
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
                scales: scales,
                organizations: organizations,
                profileCategories: profileCategories,
                scaleSettingsRules: scaleSettingsRules,
                dialogService: dialogService,
                treeItems: treeItems,
                $controller: $controller
            });

            $scope.selectedProfile.scaleSettingsRuleName = $scope.private.getById($scope.selectedProfile.scaleSettingsRuleId, $scope.scaleSettingsRules).name;

            if ($scope.selectedProfile.scale) {
                $scope.gridScaleRangesOptions = {
                    dataSource: {
                        type: "json",
                        data: $scope.selectedProfile.scale.scaleRanges,
                        schema: {
                            model: {
                                id: "id",
                                fields: {
                                    id: {type: 'number'},
                                    min: {type: 'number'},
                                    max: {type: 'number'},
                                    description: {type: 'string'},
                                    color: {type: 'string'},
                                    scaleId: {type: 'number'}
                                }
                            }
                        }
                    },
                    columns: [
                        { field: "min", title: $translate.instant('COMMON_START'), width: "20%"},
                        { field: "max", title: $translate.instant('COMMON_END'), width: "20%"},
                        { field: "description", title: $translate.instant('COMMON_DESCRIPTION'), width: "40%"},
                        {
                            field: "color", title: $translate.instant('COMMON_TYPE'), width: "20%", template: function (dataItem) {
                            return "<div style='background-color: " + dataItem.color + ";'>&nbsp;</div>";
                        }
                        }
                    ]
                }
            }

            $controller('ProfilePreviewCtrl', {
                $scope: $scope
            });
        }]);
