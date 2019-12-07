'use strict';

angular.module('ips.profiles')
    .config(['$stateProvider', function ($stateProvider) {
        var stateResolveConfig = {
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
            },
            profileTags: function (profileTagService) {
                return profileTagService.getProfileTags().then(function (response) {
                    return response;
                }, function (e) {

                });
            },
            projects: function (profilesService, $translate) {
                return profilesService.getAllProject().then(function (data) {
                    data.unshift({ id: null, name: $translate.instant('MYPROJECTS_SELECT_PROJECT') });
                    return data;
                });
            },
        };
        $stateProvider
            .state('home.profiles.soft.edit', {
                url: "/edit/:profileId",
                resolve: stateResolveConfig,
                controller: 'SoftProfileEditorCtrl',
                templateUrl: "views/profiles/profiles.soft.edit.html",
                data: {
                    displayName: '{{ profile.viewName }}',
                    paneLimit: 1,
                    depth: 3,
                    resource: "Profiles"
                }
            });
        $stateProvider
            .state('home.profiles.soft.view', {
                url: "/view/:profileId",
                resolve: stateResolveConfig,
                controller: 'SoftProfileEditorCtrl',
                templateUrl: "views/profiles/profiles.soft.edit.html",
                data: {
                    displayName: '{{ profile.viewName }}',
                    paneLimit: 1,
                    depth: 3,
                    resource: "Profiles"
                }
            });
    }])
    .controller('SoftProfileEditorCtrl', ['$scope',
        '$location', 'authService', 'apiService', '$stateParams', '$window', '$rootScope',
        'cssInjector', 'profilesService', '$state', 'profile', 'isInUse', 'industries',
        'profileLevels', 'jobTitles', 'scales', 'organizations', 'profileCategories',
        'scaleSettingsRules', 'profileTags', 'projects', 'dialogService', 'treeItems', '$controller', '$translate',
        function ($scope, $location, authService, apiService, $stateParams, $window, $rootScope,
            cssInjector, profilesService, $state, profile, isInUse, industries,
            profileLevels, jobTitles, scales, organizations, profileCategories,
            scaleSettingsRules, profileTags, projects, dialogService, treeItems, $controller, $translate) {
            cssInjector.removeAll();
            cssInjector.add('views/profiles/new-soft-profile.css');

            $scope.profileTypeId = 1;
            $scope.profileUrlModifier = 'soft';

            $scope.scale = profile.scale;
            $scope.scaleSettingsRules = scaleSettingsRules;
            $scope.scales = scales;
            $scope.profileTags = profileTags;
            $scope.projects = projects;
            if ($scope.scale != null) {
                $scope.scales.unshift($scope.scale);
            }

            $scope.scaleSettingsRules = scaleSettingsRules;
            var isReadOnly = false;
            if ($state.current.name.indexOf("view") > -1) {
                isInUse = true;
                isReadOnly = true;
            }
            $controller('ProfileEditCtrl', {
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
                isReadOnly: isReadOnly,
                industries: industries,
                profileLevels: profileLevels,
                jobTitles: jobTitles,
                organizations: organizations,
                profileCategories: profileCategories,
                dialogService: dialogService,
                treeItems: treeItems
            });

            $scope.scaleUpdate = function (scaleId) {
                $scope.scale = $scope.private.getById(scaleId, $scope.scales);
                $scope.selectedProfile.scale = $scope.scale;
            };
            $scope.selectTagOptions = {
                placeholder: $translate.instant('MYPROJECTS_SELECT_TAGS'),
                dataTextField: "name",
                dataValueField: "id",
                valuePrimitive: false,
                autoBind: false,
                dataSource: {
                    type: "json",
                    data: $scope.profileTags,
                }
            };
            $scope.prepareSelectedProfileForSave = function () {
                if ($scope.selectedProfile.scaleId != null) {
                    $scope.selectedProfile.scale = $scope.scale;
                    $scope.selectedProfile.scaleId = $scope.scale.id;
                }

                var item = angular.copy($scope.selectedProfile);
                item.performanceGroups = null;
                item.industry = null;
                if (item.levelId < 0) {
                    item.levelId = null;
                }
                if (item.categoryId < 0) {
                    item.categoryId = null;
                }

                if (item.scaleSettingsRuleId != 1) {
                    item.scaleId = null;
                    item.scale = null;
                }

                if ($scope.selectedProfile.id > 0) {
                    if (item.scaleId != null) {
                        item.scale.id = item.scaleId;
                    }
                }
                return item;
            };
        }]);