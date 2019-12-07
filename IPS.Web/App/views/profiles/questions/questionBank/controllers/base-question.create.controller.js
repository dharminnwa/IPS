'use strict';

angular
    .module('ips.questions')

    .config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
        var baseResolve = {
            pageName: function ($translate) {
                return $translate.instant('SOFTPROFILE_NEW_QUESTION');
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

            scales: function (apiService) {
                var apiName = 'scales';
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
        var softResolve = _.clone(baseResolve);
        softResolve.profileType = function () {
            return "soft";
        };

        var ktResolve = _.clone(baseResolve);
        ktResolve.profileType = function () {
            return "knowledgetest";
        };
        $stateProvider
            .state('home.profiles.soft.questionbank.new', {
                url: "/new",
                templateUrl: "views/profiles/questions/questionBank/views/editQuestion.html",
                controller: "softQuestionNewCtrl",
                resolve: softResolve,
                data: {
                    displayName: '{{pageName}}',//'New Question',
                    paneLimit: 1,
                    depth: 4,
                    resource: "Profiles"
                }
            })
            .state('home.profiles.knowledgetest.questionbank.new', {
                url: "/new",
                templateUrl: "views/profiles/questions/questionBank/views/question.kt.edit.html",
                controller: "ktQuestionNewCtrl",
                resolve: ktResolve,
                data: {
                    displayName: '{{pageName}}',//'New Question',
                    paneLimit: 1,
                    depth: 4,
                    resource: "Profiles"
                }
            });
    }])

    .controller('baseQuestionNewCtrl', ['$scope', 'cssInjector', '$location', 'profileType', 'questionBankManager', 'organizations', 'skills', 'answerTypes', 'profileTypes', 'scales', 'structureLevels', 'industries', 'authService', 'dialogService', '$translate',
        function ($scope, cssInjector, $location, profileType, questionBankManager, organizations, skills, answerTypes,
            profileTypes, scales, structureLevels, industries, authService, dialogService, $translate) {
            cssInjector.removeAll();
            cssInjector.add('views/profiles/questions/questionBank/questionBank.css');

            $scope.organizations = organizations;
            $scope.answerTypes = answerTypes;
            $scope.profileTypes = profileTypes;
            $scope.scales = scales;
            $scope.structureLevels = structureLevels;
            $scope.industries = industries;
            $scope.gridoptions = new kendo.data.ObservableArray([]);
            $scope.selectedSkills = [];

            $scope.newQuestion = {
                isActive: false,
                isTemplate: true,
                organizationId: $scope.organizations.length == 1 ? $scope.organizations[0].id : null,
                industryId: null,
                subIndustryId: null,
            };
            $scope.subIndustries = [];

            function save() {
                !isEdit() ? saveQuestion() : '';
            }

            function isEdit() {
                return (($location.path().indexOf('questionbank/edit') > -1) || ($location.path().indexOf('editQuestion') > -1));
            }

            $scope.isQuestionsUpdate = {organizationId: $scope.newQuestion.organizationId, isPermition: null};

            function isDisabled() {
                if (($scope.isQuestionsUpdate.organizationId == $scope.newQuestion.organizationId) && ($scope.isQuestionsUpdate.isPermition != null)) {
                    return $scope.isQuestionsUpdate.isPermition;
                }
                else {
                    $scope.isQuestionsUpdate.isPermition = !authService.hasPermition($scope.newQuestion.organizationId, 'Questions', authService.actions.Create);
                    $scope.isQuestionsUpdate.organizationId = $scope.newQuestion.organizationId;
                    return $scope.isQuestionsUpdate.isPermition;

                }

            }

            $scope.isDisabled = isDisabled;

            function saveQuestion() {
                var item = angular.copy($scope.newQuestion);
                if (item.possibleAnswer) {
                    if (!_.isString(item.possibleAnswer.answer)) {
                        item.possibleAnswer.answer = JSON.stringify(item.possibleAnswer.answer);
                    }
                }
                if (item.subIndustryId) {
                    item.industryId = item.subIndustryId;
                }
                questionBankManager.saveQuestion(item).then(
                    function (data) {
                        questionBankManager.goToEditPage(data);
                    }
                );
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