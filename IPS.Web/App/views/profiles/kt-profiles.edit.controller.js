'use strict';

angular.module('ips.profiles')
    .constant("questionDisplayRulesEnum", {
        performanceGroupPerStep: 1,
        questionPerStep: 2,
        allQuestionsOnTheSinglePage: 3
    })
    .constant("passCriteriaEnum", {
        passScore: 1,
        medalRules: 2
    })
    .config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
        var stateResolveConfig = {
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
            .state('home.profiles.knowledgetest.edit', {
                url: "/edit/:profileId",
                resolve: stateResolveConfig,
                controller: 'KTProfileEditCtrl',
                templateUrl: "views/profiles/profiles.kt.edit.html",
                data: {
                    displayName: '{{ profile.viewName }}',
                    paneLimit: 1,
                    depth: 3,
                    resource: "Profiles"
                }
            });
        $stateProvider
           .state('home.profiles.knowledgetest.view', {
               url: "/view/:profileId",
               resolve: stateResolveConfig,
               controller: 'KTProfileEditCtrl',
               templateUrl: "views/profiles/profiles.kt.edit.html",
               data: {
                   displayName: '{{ profile.viewName }}',
                   paneLimit: 1,
                   depth: 3,
                   resource: "Profiles"
               }
           });
    }])
    .controller('KTProfileEditCtrl', ['$scope',
        '$location', 'authService', 'apiService', '$stateParams', '$window', '$rootScope',
        'cssInjector', 'profilesService', '$state', 'profile', 'isInUse', 'industries',
        'profileLevels', 'jobTitles', 'organizations', 'profileCategories',
        'dialogService', 'treeItems', 'medalRules', '$controller', 'questionDisplayRulesEnum', 'passCriteriaEnum', '$translate',
        function ($scope, $location, authService, apiService, $stateParams, $window, $rootScope,
                  cssInjector, profilesService, $state, profile, isInUse, industries,
                  profileLevels, jobTitles, organizations, profileCategories,
            dialogService, treeItems, medalRules, $controller, questionDisplayRulesEnum, passCriteriaEnum, $translate) {
            $scope.profileTypeId = 5;
            $scope.profileUrlModifier = 'knowledgetest';
            $scope.medalRules = medalRules;
            $scope.init = function () {
                $scope.passCriteriaEnum = passCriteriaEnum;
                $scope.passCriteria = [{ id: passCriteriaEnum.passScore, name: $translate.instant('SOFTPROFILE_PASS_SCORE') },
                    { id: passCriteriaEnum.medalRules, name: $translate.instant('SOFTPROFILE_MEDAL_RULES') }];
                $scope.passCriterion = profile.medalRuleId ? passCriteriaEnum.medalRules : passCriteriaEnum.passScore;
                setMedalRulesRequired($scope.passCriterion);
            };

            $scope.changePassCriteria = function (passCriterion) {
                if (passCriterion == passCriteriaEnum.medalRules) {
                    delete profile.passScore;
                }
                else {
                    delete profile.medalRuleId;
                    delete profile.ktMedalRule;
                }
                setMedalRulesRequired(passCriterion);
            };

            var setMedalRulesRequired = function (passCriterion) {
                $scope.isMedalRuleRequired = isMedalRuleRequired(passCriterion);
            };

            var isMedalRuleRequired = function (passCriterion) {
                return passCriterion == passCriteriaEnum.medalRules;
            };
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

            $scope.prepareSelectedProfileForSave = function () {
                var item = angular.copy($scope.selectedProfile);
                item.performanceGroups = null;
                item.industry = null;
                if (item.levelId < 0) {
                    item.levelId = null;
                }
                if (item.categoryId < 0) {
                    item.categoryId = null;
                }
                return item;
            };

            $scope.changeMedalRule = function () {
                if ($scope.selectedProfile.medalRuleId) {
                    profilesService.getMedalRule($scope.selectedProfile.medalRuleId).then(function (data) {
                        $scope.selectedProfile.ktMedalRule = data;
                    });
                }
                else {
                    $scope.selectedProfile.ktMedalRule = {};
                }
            };

            $scope.minThan = function (value) {
                if (value) {
                    return value - 1;
                }
                return value;
            };

            $scope.moreThan = function (value) {
                if (value) {
                    return value + 1;
                }
                return value;
            }

            $scope.setQuestionDisplayRule = function () {
                if ($scope.selectedProfile.allowRevisitAnsweredQuestions) {
                    $scope.selectedProfile.questionDisplayRuleId = questionDisplayRulesEnum.questionPerStep;
                }
            }
        }]);