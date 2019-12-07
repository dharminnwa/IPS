'use strict';

angular
    .module('ips.questions')

    .config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
        var baseQuestionEditResolve = {
            pageName: function ($translate) {
                return $translate.instant('COMMON_EDIT');
            },

            isProfileInUse: function ($stateParams, questionBankManager) {
                return questionBankManager.isProfileInUse($stateParams.questionId);
            },

            question: function (questionBankManager, $stateParams) {
                var query = '$expand=PossibleAnswer,QuestionMaterial,Skills,Industry($expand=SubIndustries)';
                return questionBankManager.getQuestionById($stateParams.questionId, query).then(function (data) {
                    return data;
                });
            },

            organizations: function (organizationManager) {
                var query = '?$select=Id,Name';
                return organizationManager.getOrganizations(query).then(function (data) {
                    return data;
                })
            },

            skills: function (apiService, questionBankManager) {
                var apiName = 'skills';
                var query = '?&orderby=Name desc';
                return apiService.getAll(apiName, query).then(function (data) {
                    if (data) {
                        return questionBankManager.getParentSkillsNames(data).then(function (data) {
                            return data;
                        })
                    }
                })
            },
            answerTypes: function (apiService) {
                var apiName = 'answerTypes';
                return apiService.getAll(apiName).then(function (data) {
                    return data;
                })
            },

            profileTypes: function (apiService) {
                var apiName = 'profileType';
                return apiService.getAll(apiName).then(function (data) {
                    return data;
                })
            },

            structureLevels: function (apiService) {
                var apiName = 'profile_levels';
                return apiService.getAll(apiName).then(function (data) {
                    return data;
                })
            },

            industries: function (apiService) {
                var apiName = 'industries?$expand=SubIndustries';
                return apiService.getAll(apiName).then(function (data) {
                    return data;
                })
            }
        };
        var softQuestionEditResolve = _.clone(baseQuestionEditResolve);
        softQuestionEditResolve.profileType = function () {
            return "soft";
        };

        var ktQuestionEditResolve = _.clone(baseQuestionEditResolve);
        ktQuestionEditResolve.profileType = function () {
            return "knowledgetest";
        };
        var basePerformanceGroupQuestionEditResolve = {
            pageName: function ($translate) {
                return $translate.instant('COMMON_EDIT');
            },
            isProfileInUse: function ($stateParams, questionBankManager) {
                return questionBankManager.isProfileInUse($stateParams.questionId);
            },
            question: function (questionBankManager, $stateParams) {
                var query = '$expand=Skills,QuestionMaterial,PossibleAnswer,Industry($expand=SubIndustries)';
                return questionBankManager.getQuestionById($stateParams.questionId, query).then(function (data) {
                    return data;
                });
            },

            organizations: function (organizationManager) {
                var query = '?$select=Id,Name';
                return organizationManager.getOrganizations(query).then(function (data) {
                    return data;
                })
            },

            skills: function (apiService, questionBankManager) {
                var apiName = 'skills';
                var query = '?&orderby=Name';
                return apiService.getAll(apiName, query).then(function (data) {
                    if (data) {
                        return questionBankManager.getParentSkillsNames(data).then(function (data) {
                            return data;
                        })
                    }
                })
            },
            answerTypes: function (apiService) {
                var apiName = 'answerTypes';
                return apiService.getAll(apiName).then(function (data) {
                    return data;
                })
            },

            profileTypes: function (apiService) {
                var apiName = 'profileType';
                return apiService.getAll(apiName).then(function (data) {
                    return data;
                })
            },

            structureLevels: function (apiService) {
                var apiName = 'profile_levels';
                return apiService.getAll(apiName).then(function (data) {
                    return data;
                })
            },

            industries: function (apiService) {
                var apiName = 'industries?$expand=SubIndustries';
                return apiService.getAll(apiName).then(function (data) {
                    return data;
                })
            }
        };
        var softPerformanceGroupQuestionEditResolve = _.clone(basePerformanceGroupQuestionEditResolve);
        softPerformanceGroupQuestionEditResolve.profileType = function () {
            return "soft";
        };

        var ktPerformanceGroupQuestionEditResolve = _.clone(basePerformanceGroupQuestionEditResolve);
        ktPerformanceGroupQuestionEditResolve.profileType = function () {
            return "knowledgetest";
        };

        var basePerformanceGroupsQuestionEditResolve = {
            pageName: function ($translate) {
                return $translate.instant('COMMON_EDIT');
            },
            isProfileInUse: function ($stateParams, questionBankManager) {
                return questionBankManager.isProfileInUse($stateParams.questionId);
            },
            question: function (questionBankManager, $stateParams) {
                var query = '$expand=Skills,PossibleAnswer,Industry($expand=SubIndustries)';
                return questionBankManager.getQuestionById($stateParams.questionId, query).then(function (data) {
                    return data;
                });
            },

            organizations: function (organizationManager) {
                var query = '?$select=Id,Name';
                return organizationManager.getOrganizations(query).then(function (data) {
                    return data;
                })
            },

            skills: function (apiService, questionBankManager) {
                var apiName = 'skills';
                var query = '?&orderby=Name';
                return apiService.getAll(apiName, query).then(function (data) {
                    if (data) {
                        return questionBankManager.getParentSkillsNames(data).then(function (data) {
                            return data;
                        })
                    }
                })
            },
            answerTypes: function (apiService) {
                var apiName = 'answerTypes';
                return apiService.getAll(apiName).then(function (data) {
                    return data;
                })
            },

            profileTypes: function (apiService) {
                var apiName = 'profileType';
                return apiService.getAll(apiName).then(function (data) {
                    return data;
                })
            },

            structureLevels: function (apiService) {
                var apiName = 'profile_levels';
                return apiService.getAll(apiName).then(function (data) {
                    return data;
                })
            },

            industries: function (apiService) {
                var apiName = 'industries?$expand=SubIndustries';
                return apiService.getAll(apiName).then(function (data) {
                    return data;
                })
            }
        };
        var softPerformanceGroupsQuestionEditResolve = _.clone(basePerformanceGroupsQuestionEditResolve);
        softPerformanceGroupsQuestionEditResolve.profileType = function () {
            return "soft";
        };

        var ktPerformanceGroupsQuestionEditResolve = _.clone(basePerformanceGroupsQuestionEditResolve);
        ktPerformanceGroupsQuestionEditResolve.profileType = function () {
            return "knowledgetest";
        };
        $stateProvider
            .state('home.profiles.soft.questionbank.edit', {
                url: "/edit/:questionId",
                templateUrl: "views/profiles/questions/questionBank/views/editQuestion.html",
                controller: "softQuestionEditCtrl",
                resolve: softQuestionEditResolve,
                data: {
                    displayName: '{{pageName}} {{question.name}}',
                    paneLimit: 1,
                    depth: 4,
                    resource: "Profiles"
                }
            })
            .state('home.profiles.soft.edit.performanceGroups.edit.editQuestion', {
                url: "/editQuestion/:questionId",
                templateUrl: "views/profiles/questions/questionBank/views/editQuestion.html",
                controller: "softQuestionEditCtrl",
                resolve: softPerformanceGroupQuestionEditResolve,
                data: {
                    displayName: '{{pageName}} {{question.name}}',
                    paneLimit: 1,
                    depth: 6,
                    resource: "Profiles"
                }
            })
            .state('home.profiles.soft.performanceGroups.edit.editQuestion', {
                url: "/editQuestion/:questionId",
                templateUrl: "views/profiles/questions/questionBank/views/editQuestion.html",
                controller: "softQuestionEditCtrl",
                resolve: softPerformanceGroupsQuestionEditResolve,
                data: {
                    displayName: '{{pageName}} {{question.name}}',
                    paneLimit: 1,
                    depth: 5,
                    resource: "Profiles"
                }
            })
            .state('home.profiles.knowledgetest.questionbank.edit', {
                url: "/edit/:questionId",
                templateUrl: "views/profiles/questions/questionBank/views/question.kt.edit.html",
                controller: "ktQuestionEditCtrl",
                resolve: ktQuestionEditResolve,
                data: {
                    displayName: '{{pageName}} {{question.name}}',
                    paneLimit: 1,
                    depth: 4,
                    resource: "Profiles"
                }
            })
            .state('home.profiles.knowledgetest.edit.performanceGroups.edit.editQuestion', {
                url: "/editQuestion/:questionId",
                templateUrl: "views/profiles/questions/questionBank/views/question.kt.edit.html",
                controller: "ktQuestionEditCtrl",
                resolve: ktPerformanceGroupQuestionEditResolve,
                data: {
                    displayName: '{{pageName}} {{question.name}}',
                    paneLimit: 1,
                    depth: 6,
                    resource: "Profiles"
                }
            })
            .state('home.profiles.knowledgetest.performanceGroups.edit.editQuestion', {
                url: "/editQuestion/:questionId",
                templateUrl: "views/profiles/questions/questionBank/views/question.kt.edit.html",
                controller: "ktQuestionEditCtrl",
                resolve: ktPerformanceGroupsQuestionEditResolve,
                data: {
                    displayName: '{{pageName}} {{question.name}}',
                    paneLimit: 1,
                    depth: 5,
                    resource: "Profiles"
                }
            });
    }])

    .controller('baseQuestionEditCtrl', ['$scope', 'cssInjector', '$stateParams', '$location', 'profileType',
        'questionBankManager', 'question', 'organizations', 'skills', 'answerTypes', 'profileTypes',
        'structureLevels', 'industries', 'authService', 'dialogService', 'isProfileInUse', '$translate',
        function ($scope, cssInjector, $stateParams, $location, profileType, questionBankManager, question,
                  organizations, skills, answerTypes, profileTypes, structureLevels, industries, authService,
            dialogService, isProfileInUse, $translate) {
            cssInjector.add('views/profiles/questions/questionBank/questionBank.css');
            $scope.isProfileInUse = isProfileInUse;
            $scope.organizations = organizations;
            $scope.answerTypes = answerTypes;
            $scope.profileTypes = profileTypes;
            $scope.structureLevels = structureLevels;
            $scope.industries = industries;
            $scope.gridoptions = new kendo.data.ObservableArray([]);
            $scope.selectedSkills = [];

            $scope.newQuestion = question;
            $scope.newQuestion.subIndustryId = ($scope.newQuestion.industry && $scope.newQuestion.industry.parentId) ? $scope.newQuestion.industryId : null;

            $scope.subIndustries = [];
            if ($scope.newQuestion.subIndustryId) {
                $scope.newQuestion.industryId = $scope.newQuestion.industry.parentId;
                var subIndId = $scope.newQuestion.subIndustryId;
                industryChanged();
                $scope.newQuestion.subIndustryId = subIndId;
            }

            function isEdit() {
                return (($location.path().indexOf('questionbank/edit') > -1) || ($location.path().indexOf('editQuestion') > -1));
            }

            function save() {
                isEdit() ? updateQuestion() : '';
            }

            function updateQuestion() {
                var item = angular.copy($scope.newQuestion);
                if (item.possibleAnswer) {
                    if (!_.isString(item.possibleAnswer.answer)) {
                        item.possibleAnswer.answer = JSON.stringify(item.possibleAnswer.answer);
                    }
                }
                if (item.subIndustryId) {
                    item.industryId = item.subIndustryId;
                }
                questionBankManager.updateQuestion(item).then(
                    function (data) {
                        dialogService.showNotification($translate.instant('SOFTPROFILE_SAVED_SUCCESFULLY'), 'info');
                        questionBankManager.goToEditPage($stateParams.questionId);
                    }
                );
            }

            function goBack() {
                history.back();
            }

            function checkProfileType() {
                var softProfileId = 1;
                var numericAnswerTypeId = 1;
                $scope.disableAnswerType = false;
                if ($scope.newQuestion.profileTypeId == softProfileId) {
                    $scope.newQuestion.answerTypeId = numericAnswerTypeId;
                    $scope.disableAnswerType = true;
                } else {
                    $scope.disableAnswerType = false;
                }
            }

            $scope.isQuestionsUpdate = {organizationId: $scope.newQuestion.organizationId, isPermition: null};

            function isDisabled() {
                if (($scope.isQuestionsUpdate.organizationId == $scope.newQuestion.organizationId) && ($scope.isQuestionsUpdate.isPermition != null)) {
                    return $scope.isQuestionsUpdate.isPermition;
                }
                else {
                    $scope.isQuestionsUpdate.isPermition = !authService.hasPermition($scope.newQuestion.organizationId, 'Questions', authService.actions.Update);
                    $scope.isQuestionsUpdate.organizationId = $scope.newQuestion.organizationId;
                    return $scope.isQuestionsUpdate.isPermition;

                }

            }

            function industryChanged() {
                $scope.subIndustries = [];
                angular.forEach($scope.industries, function (item, index) {
                    if (item.id == $scope.newQuestion.industryId) {
                        $scope.subIndustries = item.subIndustries;
                    }

                });

                $scope.newQuestion.subIndustryId = null;
            }

            $scope.industryChanged = industryChanged;

            $scope.isDisabled = isDisabled;

            $scope.checkProfileType = checkProfileType;

            $scope.save = save;

            $scope.isEdit = isEdit;

            $scope.goBack = goBack;

            $scope.skillsOptions = {
                placeholder: $translate.instant('SOFTPROFILE_SKILLS'),
                dataTextField: "name",
                dataValueField: "id",
                valuePrimitive: false,
                autoBind: false,
                dataSource: {
                    type: "json",
                    transport: {
                        read: function (options) {
                            options.success(skills);
                        }
                    }
                }
            }
        }]);