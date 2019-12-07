angular.module('ips.profiles')
    .constant('profileSetupTypeEnum', {
        New: 'New',
        Edit: 'Edit',
        Template: 'Template',
    })
    .constant('profileTypeEnum', {
        Soft: 1,
        Knowledge: 5,
        Hard: 3,
        DRIV: 'DRIV',
    })
    .constant("passCriteriaEnum", {
        passScore: 1,
        medalRules: 2
    })
    .constant('defaulQuestionValuesByAnswerTypeEnum', {
        numeric: { points: 1, minutesForQuestion: 2 },
        text: { points: 5, minutesForQuestion: 30 },
        singleChoice: { points: 1, minutesForQuestion: 2 },
        multipleChoice: { points: 2, minutesForQuestion: 3 },
        order: { points: 3, minutesForQuestion: 5 }
    })
    .directive("questionCorrectAnswer", function () {
        return {
            restrict: "E",
            templateUrl: 'views/softprofilewizard/directives/correct-answer.html'
        }
    })
    .config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
        $stateProvider
            .state('newprofile', {
                url: "/newprofile",
                templateUrl: "views/softprofilewizard/views/softProfileWizard.html",
                resolve: {
                    organizations: function (profilesService) {
                        return profilesService.getOrganizations();
                    },
                    industries: function (profilesService) {
                        return profilesService.getIndustries();
                    },
                    levels: function (profilesService) {
                        return profilesService.getProfileLevels();
                    },
                    pageName: function (localStorageService, profilesService, $translate) {
                        if (localStorageService.get("projectId")) {
                            var projectId = localStorageService.get("projectId");
                            return profilesService.getProjectById(projectId).then(function (data) {
                                return data.name + " : " + $translate.instant('MYPROJECTS_PROJECTPROFILES_SOFT_PROFILE_SETUP');
                            });
                        }
                    },

                    profileCategories: function (profileCategoryService) {
                        return profileCategoryService.getProfileCategories();
                    },
                    profileTargetGroups: function (profilesService) {
                        return profilesService.getProfileTargetGroups()
                    },

                    scaleSettingsRules: function (profilesService) {
                        return profilesService.getScaleSettingsRules();
                    },
                    scales: function (profilesService) {
                        return profilesService.getScales();
                    },
                    notificationTemplates: function (stageGroupManager, $translate) {
                        return stageGroupManager.getNotificationTemplates().then(function (data) {
                            data.unshift({ id: null, name: $translate.instant('MYPROJECTS_SELECT_TEMPLATE') });
                            return data;
                        });
                    },
                    projects: function (profilesService, $translate) {
                        return profilesService.getAllProject().then(function (data) {
                            data.unshift({ id: null, name: $translate.instant('MYPROJECTS_SELECT_PROJECT') });
                            return data;
                        });
                    },
                    profileTags: function (profileTagService) {
                        return profileTagService.getProfileTags().then(function (response) {
                            return response;
                        }, function (e) {

                        });
                    },
                    answerTypes: function (apiService) {
                        var apiName = 'answerTypes';
                        return apiService.getAll(apiName).then(function (data) {
                            return data;
                        })
                    },
                    medalRules: function (profilesService) {
                        return profilesService.getMedalRules();
                    },
                    profile: function () {
                        return null;
                    },

                    trainingLevels: function ($stateParams, profileTrainingManager) {
                        return profileTrainingManager.getTrainingLevels();
                    },
                    trainingTypes: function ($stateParams, profileTrainingManager) {
                        return profileTrainingManager.getTrainingTypes();
                    },
                    durationMetrics: function ($stateParams, profileTrainingManager) {
                        return profileTrainingManager.getDurationMetrics();
                    },
                    exerciseMetrics: function ($stateParams, profileTrainingManager) {
                        return profileTrainingManager.getExerciseMetrics();
                    }

                },
                controller: 'softProfileWizardCtrl',
                data: {
                    displayName: '{{pageName}}',
                    paneLimit: 1,
                    depth: 2
                }
            })
            .state('profile', {
                url: "/profile/:id",
                templateUrl: "views/softprofilewizard/views/softProfileWizard.html",
                resolve: {
                    profile: function ($stateParams, apiService) {
                        return apiService.getById("profiles/getFullProfileById", $stateParams.id, "").then(function (profileDatail) {
                            var profile = profileDatail;
                            _.each(profile.performanceGroups, function (pgItem) {
                                pgItem.link_PerformanceGroupSkills = _.sortBy(pgItem.link_PerformanceGroupSkills, "skill.seqNo");
                                _.each(pgItem.link_PerformanceGroupSkills, function (link_PerformanceGroupSkillItem) {
                                    link_PerformanceGroupSkillItem.name = link_PerformanceGroupSkillItem.skill.name;
                                    link_PerformanceGroupSkillItem.description = link_PerformanceGroupSkillItem.skill.description;
                                    _.each(link_PerformanceGroupSkillItem.questions, function (questionsItem) {
                                        questionsItem["skillId"] = link_PerformanceGroupSkillItem.skillId;
                                    });
                                });
                            });
                            _.each(profile.stageGroups, function (sgItem) {
                                sgItem.startDate = moment(kendo.parseDate(sgItem.startDate)).format('L LT');
                                sgItem.endDate = moment(kendo.parseDate(sgItem.endDate)).format('L LT');
                                _.each(sgItem.stages, function (stageItem) {
                                    stageItem.startDateTime = moment(kendo.parseDate(stageItem.startDateTime)).format('L LT')
                                    stageItem.endDateTime = moment(kendo.parseDate(stageItem.endDateTime)).format('L LT')
                                    stageItem.redAlarmTime = moment(kendo.parseDate(stageItem.redAlarmTime)).format('L LT');
                                    stageItem.yellowAlarmTime = moment(kendo.parseDate(stageItem.yellowAlarmTime)).format('L LT');
                                    stageItem.greenAlarmTime = moment(kendo.parseDate(stageItem.greenAlarmTime)).format('L LT');
                                });
                            });
                            return profile;
                        }, function () {

                        })
                    },
                    project: function (profile, profilesService) {
                        if (profile.projectId > 0) {
                            return profilesService.getProjectById(profile.projectId).then(function (data) {
                                data.expectedEndDate = moment(kendo.parseDate(data.expectedEndDate)).format('L LT')
                                data.expectedStartDate = moment(kendo.parseDate(data.expectedStartDate)).format('L LT')
                                return data;
                            });
                        }
                        else {
                            var today = new Date(moment({ hour: 0, minute: 0, seconds: 0, milliseconds: 0 })._d)
                            return {
                                name: "",
                                summary: "",
                                expectedEndDate: moment(today).add("months", 3).format('L LT'),
                                expectedStartDate: moment(today).format('L LT'),
                                missionStatement: "",
                                visionStatement: "",
                                projectSteeringGroups: [],
                                goalStrategies: [],
                                projectGoals: [],
                                projectUsers: [],
                            }
                        }
                    },

                    organizations: function (profilesService) {
                        return profilesService.getOrganizations();
                    },
                    industries: function (profilesService) {
                        return profilesService.getIndustries();
                    },
                    levels: function (profilesService) {
                        return profilesService.getProfileLevels();
                    },
                    pageName: function (project, profile, $translate) {
                        if (profile.projectId > 0) {
                            return project.name + ' > ' + profile.name + " : " + $translate.instant('MYPROJECTS_PROJECTPROFILES_EDIT_PROFILE_SETUP');
                        }
                        else {
                            return $translate.instant('MYPROJECTS_PROFILE_SETUP');
                        }
                    },
                    profileCategories: function (profileCategoryService) {
                        return profileCategoryService.getProfileCategories();
                    },
                    profileTargetGroups: function (profilesService) {
                        return profilesService.getProfileTargetGroups()
                    },

                    scaleSettingsRules: function (profilesService) {
                        return profilesService.getScaleSettingsRules();
                    },
                    scales: function (profilesService) {
                        return profilesService.getScales();
                    },
                    notificationTemplates: function (stageGroupManager, $translate) {
                        return stageGroupManager.getNotificationTemplates().then(function (data) {
                            data.unshift({ id: null, name: $translate.instant('MYPROJECTS_SELECT_TEMPLATE') });
                            return data;
                        });
                    },
                    projects: function (profilesService, $translate) {
                        return profilesService.getAllProject().then(function (data) {
                            data.unshift({ id: null, name: $translate.instant('MYPROJECTS_SELECT_PROJECT') });
                            return data;
                        });
                    },
                    profileTags: function (profileTagService) {
                        return profileTagService.getProfileTags().then(function (response) {
                            return response;
                        }, function (e) {

                        });
                    },
                    answerTypes: function (apiService) {
                        var apiName = 'answerTypes';
                        return apiService.getAll(apiName).then(function (data) {
                            return data;
                        })
                    },
                    medalRules: function (profilesService) {
                        return profilesService.getMedalRules();
                    },

                    trainingLevels: function ($stateParams, profileTrainingManager) {
                        return profileTrainingManager.getTrainingLevels();
                    },
                    trainingTypes: function ($stateParams, profileTrainingManager) {
                        return profileTrainingManager.getTrainingTypes();
                    },
                    durationMetrics: function ($stateParams, profileTrainingManager) {
                        return profileTrainingManager.getDurationMetrics();
                    },
                    exerciseMetrics: function ($stateParams, profileTrainingManager) {
                        return profileTrainingManager.getExerciseMetrics();
                    }

                },
                controller: 'softProfileWizardCtrl',
                data: {
                    displayName: '{{pageName}}',
                    paneLimit: 1,
                    depth: 2
                }
            })
            .state('viewprofile', {
                url: "/viewprofile/:id",
                templateUrl: "views/softprofilewizard/views/viewProfileWizard.html",
                resolve: {
                    profile: function ($stateParams, apiService) {
                        return apiService.getById("profiles/getFullProfileById", $stateParams.id, "").then(function (profileDatail) {
                            var profile = profileDatail;
                            _.each(profile.performanceGroups, function (pgItem) {
                                _.each(pgItem.link_PerformanceGroupSkills, function (link_PerformanceGroupSkillItem) {
                                    link_PerformanceGroupSkillItem.name = link_PerformanceGroupSkillItem.skill.name;
                                    link_PerformanceGroupSkillItem.description = link_PerformanceGroupSkillItem.skill.description;
                                    _.each(link_PerformanceGroupSkillItem.questions, function (questionsItem) {
                                        questionsItem["skillId"] = link_PerformanceGroupSkillItem.skillId;
                                    });
                                });
                            });
                            _.each(profile.stageGroups, function (sgItem) {
                                sgItem.startDate = moment(kendo.parseDate(sgItem.startDate)).format('L LT');
                                sgItem.endDate = moment(kendo.parseDate(sgItem.endDate)).format('L LT');
                                _.each(sgItem.stages, function (stageItem) {
                                    stageItem.startDateTime = moment(kendo.parseDate(stageItem.startDateTime)).format('L LT')
                                    stageItem.endDateTime = moment(kendo.parseDate(stageItem.endDateTime)).format('L LT')
                                    stageItem.redAlarmTime = moment(kendo.parseDate(stageItem.redAlarmTime)).format('L LT');
                                    stageItem.yellowAlarmTime = moment(kendo.parseDate(stageItem.yellowAlarmTime)).format('L LT');
                                    stageItem.greenAlarmTime = moment(kendo.parseDate(stageItem.greenAlarmTime)).format('L LT');
                                });
                            });
                            return profile;
                        }, function () {

                        })
                    },
                    project: function (profile, profilesService) {
                        if (profile.projectId > 0) {
                            return profilesService.getProjectById(profile.projectId).then(function (data) {
                                data.expectedEndDate = moment(kendo.parseDate(data.expectedEndDate)).format('L LT')
                                data.expectedStartDate = moment(kendo.parseDate(data.expectedStartDate)).format('L LT')
                                return data;
                            });
                        }
                        else {
                            var today = new Date(moment({ hour: 0, minute: 0, seconds: 0, milliseconds: 0 })._d)
                            return {
                                name: "",
                                summary: "",
                                expectedEndDate: moment(today).add("months", 3).format('L LT'),
                                expectedStartDate: moment(today).format('L LT'),
                                missionStatement: "",
                                visionStatement: "",
                                projectSteeringGroups: [],
                                goalStrategies: [],
                                projectGoals: [],
                                projectUsers: [],
                            }
                        }
                    },

                    organizations: function (profilesService) {
                        return profilesService.getOrganizations();
                    },
                    industries: function (profilesService) {
                        return profilesService.getIndustries();
                    },
                    levels: function (profilesService) {
                        return profilesService.getProfileLevels();
                    },
                    pageName: function (project, profile, $translate) {
                        if (profile.projectId > 0) {
                            return project.name + ' > ' + profile.name + " : " + $translate.instant('MYPROJECTS_PROJECTPROFILES_EDIT_PROFILE_SETUP');
                        }
                        else {
                            return $translate.instant('MYPROJECTS_PROFILE_SETUP');
                        }
                    },
                    profileCategories: function (profileCategoryService) {
                        return profileCategoryService.getProfileCategories();
                    },
                    profileTargetGroups: function (profilesService) {
                        return profilesService.getProfileTargetGroups()
                    },

                    scaleSettingsRules: function (profilesService) {
                        return profilesService.getScaleSettingsRules();
                    },
                    scales: function (profilesService) {
                        return profilesService.getScales();
                    },
                    notificationTemplates: function (stageGroupManager, $translate) {
                        return stageGroupManager.getNotificationTemplates().then(function (data) {
                            data.unshift({ id: null, name: $translate.instant('MYPROJECTS_SELECT_TEMPLATE') });
                            return data;
                        });
                    },
                    projects: function (profilesService, $translate) {
                        return profilesService.getAllProject().then(function (data) {
                            data.unshift({ id: null, name: $translate.instant('MYPROJECTS_SELECT_PROJECT') });
                            return data;
                        });
                    },
                    profileTags: function (profileTagService) {
                        return profileTagService.getProfileTags().then(function (response) {
                            return response;
                        }, function (e) {

                        });
                    },
                    answerTypes: function (apiService) {
                        var apiName = 'answerTypes';
                        return apiService.getAll(apiName).then(function (data) {
                            return data;
                        })
                    },
                    medalRules: function (profilesService) {
                        return profilesService.getMedalRules();
                    },

                    trainingLevels: function ($stateParams, profileTrainingManager) {
                        return profileTrainingManager.getTrainingLevels();
                    },
                    trainingTypes: function ($stateParams, profileTrainingManager) {
                        return profileTrainingManager.getTrainingTypes();
                    },
                    durationMetrics: function ($stateParams, profileTrainingManager) {
                        return profileTrainingManager.getDurationMetrics();
                    },
                    exerciseMetrics: function ($stateParams, profileTrainingManager) {
                        return profileTrainingManager.getExerciseMetrics();
                    }

                },
                controller: 'softProfileWizardCtrl',
                data: {
                    displayName: '{{pageName}}',
                    paneLimit: 1,
                    depth: 2
                }
            });
    }])

    .controller('softProfileWizardCtrl', ['$scope', '$location', '$compile', 'authService', 'apiService', '$window', '$rootScope', 'cssInjector', 'profilesService', 'profileCategoryService', 'profileTagService', 'stageGroupManager', 'softProfileManager', 'profileTrainingManager',
        '$stateParams', '$state', 'organizations', 'industries', 'profileCategories', 'profileTargetGroups', 'scaleSettingsRules', 'scales', 'notificationTemplates', 'projects', 'profileTags', 'answerTypes', 'trainingLevels', 'trainingTypes', 'durationMetrics', 'exerciseMetrics', 'medalRules', 'dialogService', 'levels', 'pageName',
        'profileSetupTypeEnum', 'profileTypeEnum', 'passCriteriaEnum', 'defaulQuestionValuesByAnswerTypeEnum', 'answerTypesEnum', 'materialTypeEnum', 'projectPhasesEnum', 'phasesLevelEnum',
        'localStorageService', 'Upload', 'profile', '$translate',
        function ($scope, $location, $compile, authService, apiService, $window, $rootScope, cssInjector, profilesService, profileCategoryService, profileTagService, stageGroupManager, softProfileManager, profileTrainingManager,
            $stateParams, $state, organizations, industries, profileCategories, profileTargetGroups, scaleSettingsRules, scales, notificationTemplates, projects, profileTags, answerTypes, trainingLevels, trainingTypes, durationMetrics, exerciseMetrics, medalRules, dialogService, levels, pageName,
            profileSetupTypeEnum, profileTypeEnum, passCriteriaEnum, defaulQuestionValuesByAnswerTypeEnum, answerTypesEnum, materialTypeEnum, projectPhasesEnum, phasesLevelEnum, localStorageService, Upload, profile, $translate) {
            cssInjector.removeAll();
            //cssInjector.add('css/components.min.css');
            //cssInjector.add('css/default.min.css');
            cssInjector.add('views/softprofilewizard/softprofilewizard.css');
            cssInjector.add('views/profileTraining/training-material.css');
            var authData = localStorageService.get('authorizationData');
            $scope.currentUser = authData.user;
            $scope.defaultProjectId = 0;

            $scope.profileSetupTypeEnum = profileSetupTypeEnum;
            $scope.profileTypeEnum = profileTypeEnum;
            $scope.passCriteriaEnum = passCriteriaEnum;
            $scope.questionTypesEnum = answerTypesEnum;
            $scope.materialTypeEnum = materialTypeEnum;
            $scope.materialTypes = [
                { name: $translate.instant('COMMON_IMAGE'), value: materialTypeEnum.image },
                { name: $translate.instant('COMMON_DOCUMENT'), value: materialTypeEnum.document },
                { name: $translate.instant('COMMON_AUDIO'), value: materialTypeEnum.audio },
                { name: $translate.instant('COMMON_LINK'), value: materialTypeEnum.link },
                { name: $translate.instant('COMMON_VIDEO'), value: materialTypeEnum.video }
            ];
            $scope.projectPhasesEnum = projectPhasesEnum;
            $scope.phasesLevelEnum = phasesLevelEnum;
            $scope.passCriteria = [];
            $scope.projectManagers = new kendo.data.ObservableArray([]);
            $scope.organizations = organizations;
            $scope.industries = industries;
            $scope.categories = profileCategories;
            $scope.targetGroups = profileTargetGroups;
            $scope.scaleSettingsRules = scaleSettingsRules;
            $scope.notificationTemplates = notificationTemplates;
            $scope.scales = scales;
            $scope.levels = levels;
            $scope.projects = projects;
            $scope.profileTags = profileTags;
            $scope.answerTypes = answerTypes;

            $scope.trainingLevels = trainingLevels;
            $scope.trainingTypes = trainingTypes;
            $scope.durationMetrics = durationMetrics;
            $scope.exerciseMetrics = exerciseMetrics;
            $scope.defaultDurationMetric = _.find(durationMetrics, function (item) {
                return item.name == "Minutes";
            });

            $scope.medalRules = medalRules;
            $scope.questionDisplayRule = [
                {
                    id: 1,
                    name: $translate.instant('MYPROJECTS_PERFORMANCE_GROUP_PER_STEP')
                },
                {
                    id: 2,
                    name: $translate.instant('MYPROJECTS_QUESTION_PER_STEP')
                },
                {
                    id: 3,
                    name: $translate.instant('MYPROJECTS_ALL_QUESTIONS_ON_THE_SINGLE_PAGE')
                }
            ]
            $scope.subIndustries = [];
            $scope.question = {
                id: 0,
                questionText: null,
                description: null,
                answerTypeId: 1,
                isActive: true,
                isTemplate: false,
                organizationId: $scope.currentUser.organizationId,
                profileTypeId: 1,
                scaleId: null,
                questionSettings: null,
                structureLevelId: null,
                industryId: null,
                seqNo: 0,
                points: null,
                timeForQuestion: null,
                parentQuestionId: null,
                possibleAnswer: null
            }
            $scope.skill = {
                id: 0,
                name: "",
                description: "",
                parentId: null,
                organizationId: $scope.currentUser.organizationId,
                isTemplate: false,
                structureLevelId: null,
                isActive: true,
                profileTypeId: null
            },
                $scope.link_PerformanceGroupSkill = {
                    trainings: [],
                    questions: [],
                    skill1: null,
                    skill: null,
                    id: 0,
                    name: "",
                    description: "",
                    performanceGroupId: 0,
                    skillId: 0,
                    subSkillId: null,
                    benchmark: 8,
                    weight: 8,
                    csfList: [],
                    csf: null,
                    actionList: [],
                    action: null
                };
            $scope.performanceGroup = {
                link_PerformanceGroupSkills: [],
                scorecardPerspective: null,
                id: null,
                name: "Performance Group 001",
                description: null,
                organizationId: $scope.currentUser.organizationId,
                isTemplate: false,
                parentId: null,
                levelId: null,
                industryId: null,
                scorecardPerspectiveId: null,
                isActive: true,
                seqNo: null,
                scaleId: null,
                profileId: 0,
                trainingComments: null
            };
            $scope.industry = {
                id: 0,
                name: null,
                description: null,
                parentId: 0
            },
                $scope.scale = {
                    measureUnit: {
                        id: 0,
                        name: null
                    },
                    scaleCategory: {
                        id: 0,
                        name: null
                    },
                    scaleRanges: [],
                    id: 0,
                    name: null,
                    description: null,
                    scaleCategoryId: 0,
                    measureUnitId: 0,
                    includeNotRelevant: false,
                    isTemplate: false,
                    profileType: 0
                };
            $scope.scaleView = {
                measureUnit: {
                    id: 0,
                    name: null
                },
                scaleCategory: {
                    id: 0,
                    name: null
                },
                scaleRanges: [],
                id: 0,
                name: null,
                description: null,
                scaleCategoryId: 0,
                measureUnitId: 0,
                includeNotRelevant: false,
                isTemplate: false,
                profileType: 0
            };
            $scope.scaleRange = {
                id: 0,
                scaleId: 0,
                min: 0,
                max: 0,
                description: 0,
                color: null,
            };
            $scope.stageGroup = {
                id: 0,
                name: null,
                description: null,
                startDate: moment(new Date()).format('L LT'),
                endDate: null,
                parentStageGroupId: null,
                parentParticipantId: null,
                monthsSpan: 0,
                weeksSpan: 6,
                daysSpan: 0,
                hoursSpan: 0,
                minutesSpan: 0,
                totalMilestones: 5,
                stages: [],
            }


            $scope.newTraining = {
                id: 0,
                name: $translate.instant('MYPROJECTS_NEW_TRAINING'),
                typeId: null,
                levelId: null,
                why: '',
                what: '',
                how: '',
                additionalInfo: '',
                startDate: moment(new Date()).format('L LT'),
                endDate: '',
                duration: 30,
                durationMetricId: null,
                frequency: "FREQ=WEEKLY;BYDAY=WE",
                howMany: 1,
                exerciseMetricId: null,
                howManySets: 1,
                howManyActions: 1,
                isActive: true,
                organizationId: $scope.currentUser.organizationId,
                trainingMaterial: { id: 0, name: "", description: "", title: "", materialType: "", resourceType: "" },
                trainingMaterials: new kendo.data.ObservableArray([]),
                userId: $scope.userId,
                skillId: null,
                notificationTemplateId: null,
                isNotificationByEmail: true,
                emailNotificationIntervalId: null,
                emailBefore: null,
                isNotificationBySMS: false,
                smsNotificationIntervalId: null,
            }
            $scope.selectOptions = {
                placeholder: $translate.instant('MYPROJECTS_SELECT_TARGET_AUDIENCE'),
                dataTextField: "name",
                dataValueField: "id",
                valuePrimitive: false,
                autoBind: false,
                dataSource: {
                    type: "json",
                    data: $scope.targetGroups,
                }
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
            $scope.private = {
                getById: function (id, myArray) {
                    if (myArray.filter) {
                        return myArray.filter(function (obj) {
                            if (obj.id == id) {
                                return obj
                            }
                        })[0]
                    }
                    return undefined;
                }
            };
            $scope.profileTypeId = 1;
            $scope.profileSetupType = null;
            $scope.profileType = null;
            $scope.projectInfo = null;

            $scope.moveBack = function (option) {
                $scope.profileSetupType = null;
            }

            $scope.setprofilesetuptype = function (option) {
                if (option == "New") {
                    $scope.profileSetupType = profileSetupTypeEnum.New;
                }
                else if (option == "Template") {

                    $scope.profileSetupType = profileSetupTypeEnum.Template;
                }
            }

            $scope.selectProfileTemplate = function (templateProfileId) {
                if (templateProfileId > 0) {
                    apiService.getById("profiles/getTemplateProfileById", templateProfileId, "").then(function (profileTemaplateDatail) {
                        $scope.formProfileSetup.$dirty = true;
                        $scope.profile = profileTemaplateDatail;
                        $scope.profile.id = 0;
                        $scope.profile.projectId = $scope.defaultProjectId;
                        $scope.profile.isTemplate = false;
                        _.each($scope.profile.performanceGroups, function (pgItem, index) {
                            pgItem.id = (index + 1) * -1;
                            _.each(pgItem.link_PerformanceGroupSkills, function (link_PerformanceGroupSkillItem, skillIndex) {
                                link_PerformanceGroupSkillItem.id = (skillIndex + 1) * -1;
                                link_PerformanceGroupSkillItem.performanceGroupId = pgItem.id;
                                link_PerformanceGroupSkillItem.name = link_PerformanceGroupSkillItem.skill.name;
                                link_PerformanceGroupSkillItem.description = link_PerformanceGroupSkillItem.skill.description;

                                _.each(link_PerformanceGroupSkillItem.questions, function (questionsItem, questionsIndex) {
                                    questionsItem["skillId"] = link_PerformanceGroupSkillItem.id;
                                    questionsItem.id = (questionsIndex + 1) * -1;
                                    if (questionsItem.description == null || questionsItem.description == "") {
                                        questionsItem.description = link_PerformanceGroupSkillItem.skill.description;
                                    }
                                });

                            });
                        });
                        if ($scope.profile.scaleId) {
                            profilesService.getScaleById($scope.profile.scaleId).then(function (scaledata) {
                                $scope.scale = scaledata;
                                $scope.profile.scale = scaledata;
                            }, function () { });
                            //$scope.scaleUpdate($scope.profile.scaleId)
                        }

                        $scope.profileSetupType = profileSetupTypeEnum.New;
                        $scope.setprofiletype($scope.profile.profileTypeId);
                        if ($scope.profile.link_ProfileTags.length > 0) {
                            $scope.profile["tags"] = new kendo.data.ObservableArray([]);
                            _.each($scope.profile.link_ProfileTags, function (tagItem) {
                                var tag = _.find($scope.profileTags, function (profileTag) {
                                    return profileTag.id == tagItem.tagId;
                                });
                                if (tag) {
                                    $scope.profile.tags.push(tag);
                                }

                            });
                        }
                        $("#profileTemplateModal").modal("hide");
                    }, function () {

                    })
                }
            }

            $scope.viewProfileTemplate = function (templateProfileId) {
                if (templateProfileId > 0) {
                    apiService.getById("profiles/getTemplateProfileById", templateProfileId, "").then(function (profileTemaplateDatail) {
                        $scope.formProfileSetup.$dirty = true;
                        $scope.profileView = profileTemaplateDatail;
                        $scope.profileView.id = 0;
                        $scope.profileView.projectId = $scope.defaultProjectId;
                        $scope.profileView.isTemplate = false;
                        _.each($scope.profileView.performanceGroups, function (pgItem, index) {
                            pgItem.id = (index + 1) * -1;
                            _.each(pgItem.link_PerformanceGroupSkills, function (link_PerformanceGroupSkillItem, skillIndex) {
                                link_PerformanceGroupSkillItem.id = (skillIndex + 1) * -1;
                                link_PerformanceGroupSkillItem.performanceGroupId = pgItem.id;
                                link_PerformanceGroupSkillItem.name = link_PerformanceGroupSkillItem.skill.name;
                                link_PerformanceGroupSkillItem.description = link_PerformanceGroupSkillItem.skill.description;

                                _.each(link_PerformanceGroupSkillItem.questions, function (questionsItem, questionsIndex) {
                                    questionsItem["skillId"] = link_PerformanceGroupSkillItem.id;
                                    questionsItem.id = (questionsIndex + 1) * -1;
                                    if (questionsItem.description == null || questionsItem.description == "") {
                                        questionsItem.description = link_PerformanceGroupSkillItem.skill.description;
                                    }
                                });

                            });
                        });
                        if ($scope.profileView.scaleId) {
                            profilesService.getScaleById($scope.profileView.scaleId).then(function (scaledata) {
                                $scope.scalePreview = scaledata;
                                $scope.profileView.scale = scaledata;
                            }, function () { });
                            //$scope.scaleUpdate($scope.profileView.scaleId)
                        }

                        //$scope.profileSetupType = profileSetupTypeEnum.New;
                        //$scope.setprofiletype($scope.profileView.profileTypeId);
                        if ($scope.profileView.link_ProfileTags.length > 0) {
                            $scope.profile["tags"] = new kendo.data.ObservableArray([]);
                            _.each($scope.profileView.link_ProfileTags, function (tagItem) {
                                var tag = _.find($scope.profileTags, function (profileTag) {
                                    return profileTag.id == tagItem.tagId;
                                });
                                if (tag) {
                                    $scope.profileView.tags.push(tag);
                                }

                            });
                        }
                        $("#viewProfileTemplateModal").modal("show");
                    }, function () {

                    })
                }
            }



            $scope.setprofiletype = function (option) {
                if ($scope.profileSetupType == profileSetupTypeEnum.Template) {
                    if (option == profileTypeEnum.Soft) {
                        $scope.profileType = profileTypeEnum.Soft;
                    }
                    else if (option == profileTypeEnum.Knowledge) {
                        $scope.profileType = profileTypeEnum.Knowledge;
                    }
                    else if (option == profileTypeEnum.Hard) {
                        $scope.profileType = profileTypeEnum.Hard;
                    }
                    $scope.profileTemaplates = [];
                    if ($scope.defaultProjectId) {
                        profilesService.getProjectProfileTemplates($scope.defaultProjectId, option).then(function (profileTemaplatesData) {
                            $scope.profileTemaplates = profileTemaplatesData;
                            $("#profileTemplateModal").modal("show");
                        }, function () {

                        })
                    }
                }
                else if ($scope.profileSetupType == profileSetupTypeEnum.New) {
                    if (option == profileTypeEnum.Soft) {
                        $scope.profileType = profileTypeEnum.Soft;
                        $scope.profile.profileTypeId = profileTypeEnum.Soft;
                    }
                    else if (option == profileTypeEnum.Knowledge) {
                        $scope.profileType = profileTypeEnum.Knowledge;
                        $scope.profile.profileTypeId = profileTypeEnum.Knowledge;
                    }
                    else if (option == profileTypeEnum.Hard) {
                        $scope.profileType = profileTypeEnum.Hard;
                        $scope.profile.profileTypeId = profileTypeEnum.Hard;
                    }
                }


                //else if (option == profileTypeEnum.DRIV) {
                //    $scope.profileType = profileSetupTypeEnum.DRIV;
                //}
            }
            $scope.passCriterion = null;
            $scope.init = function () {
                if ($('#form_profilesetup_wizard')) {
                    $('#form_profilesetup_wizard').bootstrapWizard({
                        'nextSelector': '.button-next',
                        'previousSelector': '.button-previous',
                        onTabClick: function (tab, navigation, index, clickedIndex) {
                            if (clickedIndex == 1) {
                                if (!$scope.formProfileSetup.$valid) {
                                    return false;
                                }
                                else {
                                    if ($scope.formProfileSetup.$dirty) {
                                        if (!($scope.profile.id > 0)) {
                                            var tags = [];
                                            _.each($scope.profile.tags, function (tagItem) {
                                                var index = _.findIndex($scope.profile.link_ProfileTags, function (profileTagItem) {
                                                    return profileTagItem.tagId == tagItem.id;
                                                });
                                                if (index < 0) {
                                                    tags.push({
                                                        profileId: $scope.profile.id, tagId: tagItem.id
                                                    });
                                                }
                                            });
                                            _.each(tags, function (item) {
                                                $scope.profile.link_ProfileTags.push(item);
                                            })

                                            var profile = angular.copy($scope.profile);
                                            profile.performanceGroups = [];
                                            profile.stageGroups = [];
                                            if (profile.scale) {
                                                profile.scale.isTemplate = false;
                                            }
                                            return apiService.add("profiles", profile).then(function (data) {
                                                if (data > 0) {
                                                    $scope.profile.id = data;
                                                    dialogService.showNotification($translate.instant('MYPROJECTS_PROJECTPROFILES_PROFILE_DETAIL_SAVED_SUCCESSFULLY'), 'info');
                                                    return true;
                                                }
                                                else {
                                                    return false;
                                                }
                                            });
                                        }
                                        else {

                                            var tags = [];
                                            _.each($scope.profile.tags, function (tagItem) {
                                                var index = _.findIndex($scope.profile.link_ProfileTags, function (profileTagItem) {
                                                    return profileTagItem.tagId == tagItem.id;
                                                });
                                                if (index < 0) {
                                                    tags.push({
                                                        profileId: $scope.profile.id, tagId: tagItem.id
                                                    });
                                                }
                                            });
                                            _.each(tags, function (item) {
                                                $scope.profile.link_ProfileTags.push(item);
                                            })

                                            var profile = angular.copy($scope.profile);
                                            profile.performanceGroups = [];
                                            profile.stageGroups = [];
                                            if (profile.scale) {
                                                profile.scale.isTemplate = false;
                                            }

                                            apiService.update("profiles", profile).then(function (data) {
                                                dialogService.showNotification($translate.instant('MYPROJECTS_PROJECTPROFILES_PROFILE_DETAIL_UPDATED_SUCCESSFULLY'), 'info');
                                            }, function (message) {
                                                dialogService.showNotification(message, 'warning');
                                            });
                                        }
                                    }
                                }
                            }
                            else if (clickedIndex == 2) {
                                $scope.allQuestions = [];
                                $scope.allOldQuestions = [];
                                var hasNewPg = false;
                                var hasOldPg = false;
                                _.each($scope.profile.performanceGroups, function (item) {
                                    if (!(item.id > 0)) {
                                        hasNewPg = true;
                                        _.each(item.link_PerformanceGroupSkills, function (pgSkillItem) {
                                            _.each(pgSkillItem.questions, function (questionItem) {
                                                $scope.allQuestions.push(questionItem);
                                            });
                                        });
                                    }
                                    else {
                                        hasOldPg = true;
                                        _.each(item.link_PerformanceGroupSkills, function (pgSkillItem) {
                                            _.each(pgSkillItem.questions, function (questionItem) {
                                                $scope.allOldQuestions.push(questionItem);
                                            });
                                        });
                                    }
                                });
                                if (hasNewPg) {
                                    if (hasOldPg) {
                                        if ($scope.allQuestions.length > 0) {
                                            $scope.performanceGroupSave();
                                        }
                                    }
                                    else {
                                        if (!($scope.allQuestions.length >= ($scope.profile.kpiStrong + $scope.profile.kpiWeak))) {
                                            dialogService.showNotification($translate.instant('MYPROJECTS_PROJECTPROFILES_YOU_NEED_TO_ADD_ATLEAST') + " " + ($scope.profile.kpiStrong + $scope.profile.kpiWeak) + " " + $translate.instant('MYPROJECTS_PROJECTPROFILES_QUESTION'), "error");
                                            return false;
                                        }
                                        else {
                                            $scope.performanceGroupSave();
                                        }
                                    }

                                }
                                else {
                                    var newPgs = _.filter($scope.profile.performanceGroups, function (pgItem) {
                                        return pgItem.id < 0;
                                    });
                                    var oldPgs = _.filter($scope.profile.performanceGroups, function (pgItem) {
                                        return pgItem.id > 0;
                                    });
                                    if (!(newPgs.length > 0) && (!(oldPgs.length > 0))) {
                                        dialogService.showNotification($translate.instant('MYPROJECTS_PROJECTPROFILES_PLEASE_ADD_PERFORMANCE_GROUP_IN_PERFORMANCE_GROUP_SETUP'), "error");
                                        return false;
                                    }
                                }

                            }
                            else if (clickedIndex == 3) {
                                if (!($scope.profile.performanceGroups.length > 0)) {
                                    dialogService.showNotification($translate.instant('MYPROJECTS_PROJECTPROFILES_PLEASE_ADD_PERFORMANCE_GROUP_IN_PERFORMANCE_GROUP_SETUP'), "error");
                                    return false;
                                }
                                else if (!($scope.profile.stageGroups.length > 0)) {
                                    dialogService.showNotification($translate.instant('MYPROJECTS_PROJECTPROFILES_PLEASE_ADD_SEND_OUT_IN_SENDOUT_SETTING_SETUP'), "error");
                                    return false;
                                }
                                else if (!($scope.participants.length > 0)) {
                                    dialogService.showNotification($translate.instant('MYPROJECTS_PROJECTPROFILES_PLEASE_ADD_PARTICIPANTS_IN_SENDOUT_SETTING_SETUP'), "error");
                                    return false;
                                }
                                else {
                                    return true;
                                }
                            }
                            else {
                                $scope.handleTitle(tab, navigation, index);
                            }
                        },
                        onNext: function (tab, navigation, index) {
                            if (index == 1) {
                                if (!$scope.formProfileSetup.$valid) {
                                    return false;
                                }
                                else {
                                    if ($scope.formProfileSetup.$dirty) {
                                        if (!($scope.profile.id > 0)) {
                                            var tags = [];
                                            _.each($scope.profile.tags, function (tagItem) {
                                                var index = _.findIndex($scope.profile.link_ProfileTags, function (profileTagItem) {
                                                    return profileTagItem.tagId == tagItem.id;
                                                });
                                                if (index < 0) {
                                                    tags.push({
                                                        profileId: $scope.profile.id, tagId: tagItem.id
                                                    });
                                                }
                                            });
                                            _.each(tags, function (item) {
                                                $scope.profile.link_ProfileTags.push(item);
                                            })

                                            var profile = angular.copy($scope.profile);
                                            profile.performanceGroups = [];
                                            profile.stageGroups = [];
                                            if (profile.scale) {
                                                profile.scale.isTemplate = false;
                                            }
                                            return apiService.add("profiles", profile).then(function (data) {
                                                if (data > 0) {
                                                    $scope.profile.id = data;
                                                    dialogService.showNotification($translate.instant('MYPROJECTS_PROJECTPROFILES_PROFILE_DETAIL_SAVED_SUCCESSFULLY'), 'info');
                                                    return true;
                                                }
                                                else {
                                                    return false;
                                                }
                                            });
                                        }
                                        else {

                                            var tags = [];
                                            _.each($scope.profile.tags, function (tagItem) {
                                                var index = _.findIndex($scope.profile.link_ProfileTags, function (profileTagItem) {
                                                    return profileTagItem.tagId == tagItem.id;
                                                });
                                                if (index < 0) {
                                                    tags.push({
                                                        profileId: $scope.profile.id, tagId: tagItem.id
                                                    });
                                                }
                                            });
                                            _.each(tags, function (item) {
                                                $scope.profile.link_ProfileTags.push(item);
                                            })

                                            var profile = angular.copy($scope.profile);
                                            profile.performanceGroups = [];
                                            profile.stageGroups = [];
                                            if (profile.scale) {
                                                profile.scale.isTemplate = false;
                                            }
                                            apiService.update("profiles", profile).then(function (data) {
                                                dialogService.showNotification($translate.instant('MYPROJECTS_PROJECTPROFILES_PROFILE_DETAIL_UPDATED_SUCCESSFULLY'), 'info');
                                            }, function (message) {
                                                dialogService.showNotification(message, 'warning');
                                            });
                                        }
                                    }
                                }
                            }
                            else if (index == 2) {
                                $scope.allQuestions = [];
                                $scope.allOldQuestions = [];
                                var hasNewPg = false;
                                var hasOldPg = false;
                                _.each($scope.profile.performanceGroups, function (item) {
                                    if (!(item.id > 0)) {
                                        hasNewPg = true;
                                        _.each(item.link_PerformanceGroupSkills, function (pgSkillItem) {
                                            _.each(pgSkillItem.questions, function (questionItem) {
                                                $scope.allQuestions.push(questionItem);
                                            });
                                        });
                                    }
                                    else {
                                        hasOldPg = true;
                                        _.each(item.link_PerformanceGroupSkills, function (pgSkillItem) {
                                            _.each(pgSkillItem.questions, function (questionItem) {
                                                $scope.allOldQuestions.push(questionItem);
                                            });
                                        });
                                    }
                                });
                                if (hasNewPg) {
                                    if (hasOldPg) {
                                        if ($scope.allQuestions.length > 0) {
                                            $scope.performanceGroupSave();
                                        }
                                    }
                                    else {
                                        if (!($scope.allQuestions.length >= ($scope.profile.kpiStrong + $scope.profile.kpiWeak))) {
                                            dialogService.showNotification($translate.instant('MYPROJECTS_PROJECTPROFILES_YOU_NEED_TO_ADD_ATLEAST') + " " + ($scope.profile.kpiStrong + $scope.profile.kpiWeak) + " " + $translate.instant('MYPROJECTS_PROJECTPROFILES_QUESTION'), "error");
                                            return false;
                                        }
                                        else {
                                            $scope.performanceGroupSave();
                                        }
                                    }

                                }
                                else {
                                    var newPgs = _.filter($scope.profile.performanceGroups, function (pgItem) {
                                        return pgItem.id < 0;
                                    });
                                    var oldPgs = _.filter($scope.profile.performanceGroups, function (pgItem) {
                                        return pgItem.id > 0;
                                    });
                                    if (!(newPgs.length > 0) && (!(oldPgs.length > 0))) {
                                        dialogService.showNotification($translate.instant('MYPROJECTS_PROJECTPROFILES_PLEASE_ADD_PERFORMANCE_GROUP_IN_PERFORMANCE_GROUP_SETUP'), "error");
                                        return false;
                                    }
                                }

                            }
                            else if (index == 3) {
                                if (!($scope.profile.performanceGroups.length > 0)) {
                                    dialogService.showNotification($translate.instant('MYPROJECTS_PROJECTPROFILES_PLEASE_ADD_PERFORMANCE_GROUP_IN_PERFORMANCE_GROUP_SETUP'), "error");
                                    return false;
                                }

                            }
                            else {
                                $scope.handleTitle(tab, navigation, index);
                            }
                        },
                        onTabShow: function (tab, navigation, index) {
                            $scope.currentStepIndex = 0;
                            var total = navigation.find('li').length;
                            var current = index + 1;
                            var $percent = (current / total) * 100;
                            $('#form_profilesetup_wizard').find('.progress-bar').css({
                                width: $percent + '%'
                            });
                            if (current == total) {
                                $scope.scaleView = null;
                                $scope.scaleView = angular.copy($scope.scale);
                                //var linkFn = $compile($("#ngScaleViewDiv"));
                                //linkFn($scope);
                            }
                            $scope.setIndex(current);
                        }
                    });
                }
                $scope.passCriteria = [{ id: passCriteriaEnum.passScore, name: $translate.instant('MYPROJECTS_PASS_SCORE') },
                    { id: passCriteriaEnum.medalRules, name: $translate.instant('MYPROJECTS_MEDAL_RULES') }];

                $scope.passCriterion = $scope.profile.medalRuleId ? passCriteriaEnum.medalRules : passCriteriaEnum.passScore;
                if (localStorageService.get("projectId")) {
                    $scope.defaultProjectId = localStorageService.get("projectId")
                    localStorageService.set("projectId", null);
                }
                if ($scope.defaultProjectId > 0) {
                    $scope.profile.projectId = $scope.defaultProjectId;
                    profilesService.getProjectById($scope.profile.projectId).then(function (data) {
                        $scope.projectInfo = data;
                        $state.data;
                        $scope.profile.description = $scope.projectInfo.summary;
                        $scope.projectManagers = new kendo.data.ObservableArray([]);
                        _.each($scope.projectInfo.projectSteeringGroups, function (steeringGroupItem) {
                            _.each(steeringGroupItem.users, function (userItem) {
                                if (userItem.roleName == "Manager" || userItem.roleName == "Trainer") {
                                    userItem["id"] = userItem.userId
                                    userItem["name"] = userItem.firstName + " " + userItem.lastName
                                    $scope.projectManagers.push(userItem);
                                }
                            })
                        })
                    })
                }
            }
            $scope.handleTitle = function (tab, navigation, index) {
                var total = navigation.find('li').length;
                var current = index + 1;

                // set done steps
                var li_list = navigation.find('li');
                for (var i = 0; i < index; i++) {
                    //jQuery(li_list[i]).addClass("done");
                }

                if (current == 1) {
                    $scope.currentStepIndex = 1;
                    $('#form_profilesetup_wizard').find('.button-previous').hide();
                } else {
                    $scope.currentStepIndex = current;
                    $('#form_profilesetup_wizard').find('.button-previous').show();
                }
                if (current >= total) {
                    $('#form_profilesetup_wizard').find('.button-next').hide();
                    $('#form_profilesetup_wizard').find('.button-submit').show();

                } else {
                    $('#form_profilesetup_wizard').find('.button-next').show();
                    $('#form_profilesetup_wizard').find('.button-submit').hide();
                }

            }
            $scope.setIndex = function (current) {
                $scope.currentStepIndex = current;
                if (current == 1) {
                    $scope.currentStepIndex = 1;
                    $('#form_profilesetup_wizard').find('.button-previous').hide();
                } else {
                    $scope.currentStepIndex = current;
                    $('#form_profilesetup_wizard').find('.button-previous').show();
                }
                if (current >= 3) {
                    $('#form_profilesetup_wizard').find('.button-next').hide();
                    $('#form_profilesetup_wizard').find('.button-submit').show();
                } else {
                    $('#form_profilesetup_wizard').find('.button-next').show();
                    $('#form_profilesetup_wizard').find('.button-submit').hide();
                }
            }

            $scope.isMedalRuleRequired = isMedalRuleRequired($scope.passCriterion);

            $scope.optionModel = {
                material: {
                    file: {}
                }
            };
            $scope.fileModel = null;
            $scope.openAnswerOrderOption = function () {
                resetOptionModel();
                $("#questionOptionModal").modal("show");
                //switch ($scope.question.answerTypeId) {
                //    case $scope.questionTypesEnum.singleChoice:
                //    case $scope.questionTypesEnum.multipleChoice:
                //        return $scope.winChoiceOption;
                //    case $scope.questionTypesEnum.order:
                //        return $scope.winAnswerOrderOption;
                //    default:
                //        return null;
                //}
            };
            $scope.editAnswerOrderOption = function (id) {
                $scope.optionModel = _.clone(_.find($scope.question.possibleAnswer.answer, { id: id }));
                $("#questionOptionModal").modal("show");
            };
            $scope.removeAnswerOrderOption = function (id) {
                _.remove($scope.question.possibleAnswer.answer, { id: id });
            };

            var resetOptionModel = function () {
                $scope.optionModel = {
                    material: {
                        file: {}
                    }
                };
                $scope.fileModel = null;
                angular.element("input[name='fileOptionModel']").val(null);
            };
            $scope.onFileSelect = function ($files) {
                for (var index = 0; index < $files.length; index++) {
                    var $file = $files[index];
                    $scope.optionModel.material.file = {};
                    Upload.upload({
                        url: webConfig.serviceBase + "api/upload/answerMaterials",
                        method: "POST",
                        file: $file
                    }).success(function (data) {
                        $scope.optionModel.material.file.id = data.id;
                        $scope.optionModel.material.file.name = data.name;
                    }).error(function (data) {
                        dialogService.showNotification(data, 'warning');
                    });
                }
            };
            $scope.saveKTQuestionOption = function () {
                if ($scope.formQuestionOption.$valid) {
                    removeExtraData();
                    if ($scope.optionModel.id) {
                        updateAnswerOption($scope.optionModel);
                    }
                    else {
                        $scope.optionModel.id = $scope.question.possibleAnswer.answer.length + 1;
                        $scope.question.possibleAnswer.answer.push($scope.optionModel);
                    }
                    $scope.closeOptionWin();
                }
            };
            var removeExtraData = function () {
                switch (parseInt($scope.optionModel.material.type)) {
                    case materialTypeEnum.image:
                    case materialTypeEnum.document:
                    case materialTypeEnum.video:
                    case materialTypeEnum.audio:
                        delete $scope.optionModel.material.url;
                        break;
                    case materialTypeEnum.link:
                        delete $scope.optionModel.material.file;
                        break;
                    default:
                        delete $scope.optionModel.material.url;
                        delete $scope.optionModel.material.file;
                        break;
                }
            };
            function getIndexById(id) {
                return _.findIndex($scope.question.possibleAnswer.answer, { id: id });
            }
            function updateAnswerOption(data) {
                $scope.question.possibleAnswer.answer[getIndexById(data.id)] = data;
            }

            function isMedalRuleRequired(passCriterion) {
                return passCriterion == passCriteriaEnum.medalRules;
            };

            $scope.changeMedalRule = function () {
                if ($scope.profile.medalRuleId) {
                    profilesService.getMedalRule($scope.profile.medalRuleId).then(function (data) {
                        $scope.profile.ktMedalRule = data;
                    });
                }
                else {
                    $scope.profile.ktMedalRule = {};
                }
            };
            $scope.changeAnswerType = function () {
                //Pending
            }
            //Profile Setup
            $scope.openNewProfileCategoryModal = function () {
                $scope.newProfileCategory = {
                    organizationId: ($scope.currentUser.organizationId) ? $scope.currentUser.organizationId : null,
                    name: "",
                };
                $("#profileCategoryModal").modal("show");
            }
            $scope.addProfileCategory = function () {
                profileCategoryService.newProfileCategory($scope.newProfileCategory).then(function (data) {
                    $scope.refreshItems(data);
                    dialogService.showNotification($translate.instant('MYPROJECTS_PROJECTPROFILES_PROFILE_CATEGORY_SAVED_SUCCESFULLY'), "success");
                }, function (data) {
                    dialogService.showNotification($translate.instant('MYPROJECTS_PROJECTPROFILES_ERROR_SAVING_PROFILE_CATEGORY'), "error");
                });
            }
            $scope.refreshItems = function (profileLevelId) {
                profileCategoryService.getProfileCategories().then(function (data) {
                    $scope.categories = data;
                });
            }

            $scope.openNewProfileTagModal = function () {
                $scope.newProfileTag = {
                    organizationId: ($scope.currentUser.organizationId) ? $scope.currentUser.organizationId : null,
                    name: "",
                };
                $("#profileTagModal").modal("show");
            }
            $scope.addProfileTag = function () {
                profileTagService.newProfileTag($scope.newProfileTag).then(function (data) {
                    $scope.refreshTagItems(data);
                    dialogService.showNotification($translate.instant('MYPROJECTS_PROJECTPROFILES_PROFILE_TAG_SAVED_SUCCESFULLY'), "success");
                }, function (data) {
                    dialogService.showNotification($translate.instant('MYPROJECTS_PROJECTPROFILES_ERROR_SAVING_PROFILE_TAG'), "error");
                });
            }
            $scope.refreshTagItems = function (profileLevelId) {
                profileTagService.getProfileTags().then(function (response) {
                    $scope.profileTags = response;
                    if ($("#tagId").data("kendoMultiSelect")) {
                        $("#tagId").data("kendoMultiSelect").value([]);
                        $("#tagId").kendoMultiSelect("refresh");
                        $("#tagId").data("kendoMultiSelect").dataSource.data($scope.profileTags);
                        $("#tagId").kendoMultiSelect("refresh");
                    }
                }, function (e) {

                });
            }

            $scope.openNewPerformanceGroupModal = function () {
                $scope.performanceGroup = {
                    link_PerformanceGroupSkills: [],
                    scorecardPerspective: null,
                    id: 0,
                    name: "Performance Group 001",
                    description: "",
                    organizationId: $scope.currentUser.organizationId,
                    isTemplate: false,
                    parentId: null,
                    levelId: null,
                    industryId: null,
                    scorecardPerspectiveId: null,
                    isActive: true,
                    seqNo: null,
                    scaleId: null,
                    profileId: 0,
                    trainingComments: null
                };
                $("#performanceGroupModal").modal("show");
            }

            $scope.openSearchPerformanceGroupModal = function () {
                $scope.performanceGroupTemplates = [];
                profilesService.getProjectPerformanceGroupTemplates($scope.defaultProjectId).then(function (data) {
                    $scope.performanceGroupTemplates = data;
                    $("#performanceGroupTemplateModal").modal("show");
                }, function () {
                })

            }
            $scope.selectPerformanceGroupTemplate = function (templatePerformanceGroupId) {
                if (templatePerformanceGroupId > 0) {
                    apiService.getById("Performance_groups", templatePerformanceGroupId, "$expand=ScorecardGoals,Link_PerformanceGroupSkills($expand=Skill,Skill1,Questions($expand=AnswerType),Trainings($expand=Skills,TrainingMaterials)),PerformanceGroups1,Scale($expand=ScaleRanges),Profile,ProfileTypes,JobPositions,Industry").then(function (data) {
                        $("#performanceGroupTemplateModal").modal("hide");
                        $scope.performanceGroup = {
                            link_PerformanceGroupSkills: [],
                            scorecardPerspective: null,
                            id: ($scope.profile.performanceGroups.length + 1) * -1,
                            name: data.name,
                            description: data.description,
                            organizationId: $scope.currentUser.organizationId,
                            isTemplate: false,
                            parentId: null,
                            levelId: null,
                            industryId: null,
                            scorecardPerspectiveId: null,
                            isActive: true,
                            seqNo: null,
                            scaleId: null,
                            profileId: 0,
                            trainingComments: null
                        };
                        var index = 0;
                        _.each(data.link_PerformanceGroupSkills, function (pgSkillItem) {
                            pgSkillItem.id = (index + 1) * -1;
                            pgSkillItem.skillId = (index + 1) * -1;
                            pgSkillItem.skill.id = pgSkillItem.skillId;
                            pgSkillItem["name"] = pgSkillItem.skill.name;
                            pgSkillItem["description"] = pgSkillItem.skill.description;
                            pgSkillItem.performanceGroupId = $scope.performanceGroup.id;
                            var questionIndex = 0;
                            _.each(pgSkillItem.questions, function (questionItem) {
                                questionItem.id = (questionIndex + 1) * -1;
                                if (!(questionItem.description)) {
                                    questionItem.description = pgSkillItem.description;
                                }
                                questionItem["skillId"] = pgSkillItem.skillId;
                                questionItem["performanceGroupId"] = $scope.performanceGroup.id;
                                questionIndex++;
                            });
                            index++;
                        });
                        $scope.performanceGroup.link_PerformanceGroupSkills = data.link_PerformanceGroupSkills;
                        $scope.profile.performanceGroups.push($scope.performanceGroup);
                    });
                }
            }
            $scope.openEditPerformanceGroupModal = function (performanceGroupId) {
                var performanceGroup = _.find($scope.profile.performanceGroups, function (pgItem) {
                    return pgItem.id == performanceGroupId;
                });
                if (performanceGroup) {
                    $scope.performanceGroup = angular.copy(performanceGroup);
                }
                $("#performanceGroupModal").modal("show");
            }

            $scope.openViewTemplatePerformanceGroupModal = function (performanceGroupId) {
                var performanceGroup = _.find($scope.profileView.performanceGroups, function (pgItem) {
                    return pgItem.id == performanceGroupId;
                });
                if (performanceGroup) {
                    $scope.performanceGroupView = angular.copy(performanceGroup);
                }
                $("#viewPerformanceGroupModal").modal("show");
            }

            $scope.openViewPerformanceGroupModal = function (performanceGroupId) {
                var performanceGroup = _.find($scope.profile.performanceGroups, function (pgItem) {
                    return pgItem.id == performanceGroupId;
                });
                if (performanceGroup) {
                    $scope.performanceGroupView = angular.copy(performanceGroup);
                }
                $("#viewPerformanceGroupModal").modal("show");
            }

            $scope.cancelPerformanceGroup = function () {

            }
            $scope.addNewPerformanceGroup = function () {
                if ($scope.formPerformanceGroup.$valid) {
                    if ($scope.performanceGroup.id == 0) {
                        $scope.performanceGroup.id = ($scope.profile.performanceGroups.length + 1) * -1;
                        $scope.profile.performanceGroups.push($scope.performanceGroup)
                    }
                    else {
                        // Edit
                        apiService.update("Performance_groups", $scope.performanceGroup).then(function (data) {
                            if (data) {
                                _.each($scope.profile.performanceGroups, function (pgItem) {
                                    if (pgItem.id == $scope.performanceGroup.id) {
                                        pgItem.name = $scope.performanceGroup.name;
                                        pgItem.description = $scope.performanceGroup.description;
                                    }
                                });
                            }
                        });


                    }
                }
            }
            $scope.industryUpdate = function (industryId) {
                $scope.industry = $scope.private.getById(industryId, $scope.industries);
            };
            $scope.scaleUpdate = function (scaleId) {
                $scope.scale = $scope.private.getById(scaleId, $scope.scales);
                $scope.profile.scale = $scope.scale;
            };
            $scope.projectChanged = function () {
                if ($scope.participants.length > 0 || $scope.evaluators.length > 0 || $scope.finalScoreManagers.length > 0) {
                    dialogService.showYesNoDialog($translate.instant('COMMON_CONFIRM'), $translate.instant('MYPROJECTS_PROJECTPROFILES_YOU_HAVE_ADDED_PARTICIPANT_EVALUATORS_FINAL_SCORE_MANAGERS_IN_SEND_OUT') + " " + $translate.instant('MYPROJECTS_PROJECTPROFILES_ON_CONFIRM_IT_WILL_REMOVED') + " " + $translate.instant('MYPROJECTS_PROJECTPROFILES_ARE_YOU_SURE_YOU_WANT_TO_CONTINUE')).then(
                        function () {
                            $scope.participants = [];
                            $scope.evaluators = [];
                            $scope.finalScoreManagers = [];
                            $scope.projectInfo = null;
                            if ($scope.profile.projectId > 0) {
                                profilesService.getProjectById($scope.profile.projectId).then(function (data) {
                                    $scope.defaultProjectId = $scope.profile.projectId;
                                    $scope.projectInfo = data;
                                    $scope.profile.description = $scope.projectInfo.summary;
                                    $scope.projectManagers = new kendo.data.ObservableArray([]);
                                    _.each($scope.projectInfo.projectSteeringGroups, function (steeringGroupItem) {
                                        _.each(steeringGroupItem.users, function (userItem) {
                                            if (userItem.roleName == "Project Manager") {
                                                userItem["id"] = userItem.userId
                                                userItem["name"] = userItem.firstName + " " + userItem.lastName
                                                $scope.projectManagers.push(userItem);
                                            }
                                        })
                                    })
                                })
                            }
                        },
                        function () {
                            //alert('No clicked');
                            if ($scope.projectInfo != null) {
                                $scope.profile.projectId = $scope.projectInfo.id;
                            }
                        });

                    localStorageService.set("projectId")


                }
                else {
                    $scope.projectInfo = null;
                    if ($scope.profile.projectId > 0) {
                        $scope.defaultProjectId = $scope.profile.projectId;
                        profilesService.getProjectById($scope.profile.projectId).then(function (data) {
                            $scope.projectInfo = data;
                            $scope.profile.description = $scope.projectInfo.summary;
                            $scope.projectManagers = new kendo.data.ObservableArray([]);
                            _.each($scope.projectInfo.projectSteeringGroups, function (steeringGroupItem) {
                                _.each(steeringGroupItem.users, function (userItem) {
                                    if (userItem.roleName == "Project Manager") {
                                        userItem["id"] = userItem.userId
                                        userItem["name"] = userItem.firstName + " " + userItem.lastName
                                        $scope.projectManagers.push(userItem);
                                    }
                                })
                            })
                        })
                    }
                }
            }
            $scope.performanceGroupSave = function () {
                _.each($scope.profile.performanceGroups, function (performanceGroup) {
                    var item = angular.copy(performanceGroup);
                    item.levelId = $scope.profile.levelId
                    item.profileId = $scope.profile.id
                    item.industry = null;
                    item.profile = null;
                    item.link_PerformanceGroupSkills = null;
                    item.trainings = null;
                    item.goals = null;
                    item.questions = null;
                    if (($scope.profile) && (($scope.profile.scaleSettingsRuleId == 2) || ($scope.profile.scaleSettingsRuleId == 5))) {
                        if (item.scaleId != null) {
                            item.scale.id = item.scaleId;
                        }
                    }
                    else {
                        item.scale = null;
                        item.scaleId = null;
                    }

                    if (item.id > 0) {
                        //apiService.update("Performance_groups", item).then(function (data) {
                        //    profilesService.updateTree();
                        //    var skillIds = [];
                        //    angular.forEach($scope.skills, function (key, value) {
                        //        this.push({
                        //            id: 0,
                        //            skillId: key.skillId,
                        //            subSkillId: key.subSkillId,
                        //            benchmark: key.benchmark,
                        //            weight: key.weight,
                        //            csf: key.csf,
                        //            action: key.action
                        //        });
                        //    }, skillIds);

                        //    apiService.update("Performance_groups/" + item.id + "/skills", skillIds).then(function (data) {
                        //        var trainingIds = [];
                        //        angular.forEach($scope.trainings, function (key, value) {
                        //            this.push({ trainingId: key.id, skillId: key.skillId });
                        //        }, trainingIds);

                        //        apiService.update("Performance_groups/" + item.id + "/trainings", trainingIds).then(function (data) {
                        //            apiService.update("Performance_groups/" + item.id + "/questions", questionTabService.questions).then(function (data) {
                        //                $scope.performanceGroup.id = item.id;
                        //                performanceGroupsService.load(loadQuery);
                        //                dialogService.showNotification('Performance group saved successfully', 'info');
                        //            }, $scope.showError);
                        //        }, $scope.showError);
                        //    }, $scope.showError);
                        //}, $scope.showError);
                    }
                    else {
                        console.log("addNewPerformanceGroup " + new Date());
                        softProfileManager.addNewPerformanceGroup(item).then(function (id) {
                            console.log("addNewPerformanceGroup success " + new Date());
                            if (id > 0) {
                                item.id = id;
                                performanceGroup.id = id;
                                performanceGroup.profileId = $scope.profile.id
                                //$scope.performanceGroup.id = id;
                                angular.forEach(performanceGroup.link_PerformanceGroupSkills, function (link_PerformanceGroupSkillItem) {
                                    link_PerformanceGroupSkillItem.performanceGroupId = id;
                                    console.log("newskills" + link_PerformanceGroupSkillItem.id);
                                    var skillIds = [link_PerformanceGroupSkillItem];
                                    console.log("addPerformanceGroupSkill  " + new Date());
                                    var isProcessed = false;
                                    softProfileManager.addPerformanceGroupSkill(item.id, skillIds).then(function (skilldata) {
                                        console.log("addPerformanceGroupSkill  Success" + new Date());
                                        link_PerformanceGroupSkillItem.id = skilldata[0].id;
                                        link_PerformanceGroupSkillItem.skill.id = skilldata[0].skillId;
                                        link_PerformanceGroupSkillItem.skillId = skilldata[0].skillId;
                                        if (link_PerformanceGroupSkillItem.questions) {
                                            _.each(link_PerformanceGroupSkillItem.questions, function (questionsItem) {
                                                questionsItem.skillId = link_PerformanceGroupSkillItem.skillId;
                                                questionsItem.performanceGroupId = performanceGroup.id;
                                                prepareQuesionTimeBeforeSave(questionsItem);
                                                $scope.newQuestion = {
                                                    id: 0,
                                                    questionText: questionsItem.questionText,
                                                    description: questionsItem.description,
                                                    answerTypeId: questionsItem.answerTypeId,
                                                    isActive: true,
                                                    isTemplate: false,
                                                    organizationId: $scope.currentUser.organizationId,
                                                    profileTypeId: $scope.profile.profileTypeId,
                                                    scaleId: $scope.profile.scaleId,
                                                    questionSettings: $scope.profile.questionDisplayRuleId,
                                                    structureLevelId: $scope.profile.levelId,
                                                    industryId: $scope.profile.industryId,
                                                    seqNo: questionsItem.seqNo,
                                                    points: questionsItem.points,
                                                    timeForQuestion: questionsItem.timeForQuestion,
                                                    parentQuestionId: questionsItem.parentQuestionId,
                                                    possibleAnswer: questionsItem.possibleAnswer,
                                                    performanceGroupId: questionsItem.performanceGroupId,
                                                    skillId: questionsItem.skillId,
                                                };

                                                console.log("addNewQuestion " + new Date());

                                                softProfileManager.addNewQuestion($scope.newQuestion).then(function (questiondata) {
                                                    console.log("addNewQuestion  Success" + new Date());
                                                    questionsItem.id = questiondata;
                                                    var allQuestion = [];
                                                    allQuestion.push({
                                                        skillId: link_PerformanceGroupSkillItem.skillId,
                                                        questionId: questiondata,
                                                        seqNo: parseInt($scope.newQuestion.seqNo),
                                                    });
                                                    console.log("addPerformanceGroupQuestion " + new Date());

                                                    softProfileManager.addPerformanceGroupQuestion(item.id, allQuestion).then(function (data) {
                                                        console.log("addPerformanceGroupQuestion  Success" + new Date());

                                                        questionsItem.id = data[0].questionId;
                                                        //dialogService.showNotification('Performance group saved successfully', 'info');
                                                    }, $scope.showError)


                                                },
                                                    function (data) {
                                                        return null;
                                                    });
                                            })
                                        }
                                        if (link_PerformanceGroupSkillItem.trainings) {
                                            _.each(link_PerformanceGroupSkillItem.trainings, function (trainingItem) {
                                                var NewTrainingItem = {
                                                    id: 0,
                                                    name: trainingItem.name,
                                                    typeId: trainingItem.typeId,
                                                    levelId: trainingItem.levelId,
                                                    why: trainingItem.why,
                                                    what: trainingItem.what,
                                                    how: trainingItem.how,
                                                    additionalInfo: trainingItem.additionalInfo,
                                                    duration: 30,
                                                    durationMetricId: trainingItem.durationMetricId,
                                                    frequency: trainingItem.frequency,
                                                    howMany: trainingItem.howMany,
                                                    exerciseMetricId: trainingItem.exerciseMetricId,
                                                    howManySets: trainingItem.howManySets,
                                                    howManyActions: trainingItem.howManyActions,
                                                    isActive: true,
                                                    organizationId: $scope.currentUser.organizationId,
                                                    trainingMaterial: null,
                                                    trainingMaterials: new kendo.data.ObservableArray([]),
                                                    userId: $scope.userId,
                                                    skillId: link_PerformanceGroupSkillItem.skillId,
                                                    notificationTemplateId: null,
                                                    isNotificationByEmail: true,
                                                    emailNotificationIntervalId: null,
                                                    emailBefore: null,
                                                    isNotificationBySMS: false,
                                                    smsNotificationIntervalId: null,
                                                    performanceGroupId: performanceGroup.id
                                                }

                                                var skill = null;
                                                var skill = link_PerformanceGroupSkillItem;
                                                if (skill.skill1) {
                                                    NewTrainingItem.skills = [skill.skill1];
                                                    NewTrainingItem.skill = skill.skill1;
                                                    NewTrainingItem.skillId = skill.skill1.id;
                                                    NewTrainingItem.skillName = skill.skill1.name;
                                                } else if (skill.subSkill) {
                                                    NewTrainingItem.skills = [skill.subSkill];
                                                    NewTrainingItem.skill = skill.subSkill;
                                                    NewTrainingItem.skillId = skill.subSkill.id;
                                                    NewTrainingItem.skillName = skill.subSkill.name;
                                                } else {
                                                    NewTrainingItem.skills = [skill.skill];
                                                    NewTrainingItem.skill = skill.skill;
                                                    NewTrainingItem.skillId = skill.skill.id;
                                                    NewTrainingItem.skillName = skill.skill.name;
                                                }
                                                if (trainingItem.trainingMaterials) {
                                                    _.each(trainingItem.trainingMaterials, function (tm) {
                                                        var newTM = _.clone(tm);
                                                        newTM.id = 0;
                                                        newTM.trainingId = 0;
                                                        NewTrainingItem.trainingMaterials.push(newTM);
                                                    });
                                                }
                                                profileTrainingManager.addNewTraining(NewTrainingItem).then(function (data) {
                                                    NewTrainingItem.id = data.id;
                                                    if (NewTrainingItem.id > 0) {

                                                        var trainingIds = [];
                                                        trainingIds.push({ trainingId: NewTrainingItem.id, skillId: NewTrainingItem.skillId });

                                                        profileTrainingManager.SetPerformanceGroupTraining(NewTrainingItem.performanceGroupId, trainingIds).then(function (data) {
                                                            if (data) {
                                                                _.each($scope.profile.performanceGroups, function (item) {
                                                                    if (item.id == NewTrainingItem.performanceGroupId) {
                                                                        _.each(item.link_PerformanceGroupSkills, function (pgSkillItem) {
                                                                            if (pgSkillItem.skillId == NewTrainingItem.skillId) {
                                                                                pgSkillItem.trainings.push(NewTrainingItem);
                                                                            }
                                                                        });
                                                                    }
                                                                });
                                                                dialogService.showNotification($translate.instant('MYPROJECTS_PROJECTPROFILES_TRAINING_SAVED_SUCCESSFULLY'), 'info');
                                                            }
                                                        });
                                                        //$state.go('^');
                                                    } else {
                                                        dialogService.showNotification($translate.instant('MYPROJECTS_PROJECTPROFILES_SAVE_FAILED'), 'warning');
                                                    }
                                                }, function (error) {
                                                    dialogService.showNotification(error, "warning");
                                                });



                                            })
                                        }
                                        isProcessed = true;
                                    }, $scope.showError);
                                    console.log("next addPerformanceGroupSkill  " + new Date());
                                })
                            }
                            else {
                                $scope.showError($translate.instant('MYPROJECTS_PROJECTPROFILES_SAVE_FAILED'))
                            }
                        }, $scope.showError);
                    }
                });
            }

            if (profile != null) {
                $scope.profile = profile;
                $scope.defaultProjectId = profile.projectId;
                if ($scope.profile.scaleId > 0) {
                    profilesService.getScaleById($scope.profile.scaleId).then(function (scaledata) {
                        $scope.scale = scaledata;
                        $scope.profile.scale = scaledata;
                        var isScaleExist = _.find(scales, function (item) { return item.id == $scope.profile.scaleId });
                        if (!isScaleExist) {
                            $scope.scales.push(scaledata);
                        }
                    }, function () { });
                    //$scope.scaleUpdate($scope.profile.scaleId)
                }

                if ($scope.profile.medalRuleId > 0) {
                    $scope.changeMedalRule();
                }

                profilesService.getProjectById($scope.profile.projectId).then(function (data) {
                    $scope.projectInfo = data;
                    $scope.profileSetupType = profileSetupTypeEnum.New;
                    $scope.setprofiletype($scope.profile.profileTypeId);
                    _.each($scope.profile.stageGroups, function (sgItem) {
                        $scope.stage = sgItem.stages[0];
                        stageGroupManager.getParticipants(sgItem.id).then(function (data) {
                            _.each(data, function (participantItem) {
                                _.each($scope.projectInfo.projectSteeringGroups, function (steeringGroup) {
                                    _.each(steeringGroup.users, function (userItem) {
                                        if (userItem.userId == participantItem.userId) {
                                            participantItem["userImage"] = userItem.userImage;
                                            participantItem["stageGroupId"] = sgItem.id;
                                            participantItem["email"] = userItem.email;
                                            $scope.participants.push(participantItem);
                                        }
                                    });
                                });
                            });
                        });
                        stageGroupManager.getEvaluators(sgItem.id).then(function (data) {
                            _.each(data, function (evaluatorItem) {
                                if (evaluatorItem.isScoreManager) {
                                    _.each($scope.projectInfo.projectSteeringGroups, function (steeringGroup) {
                                        _.each(steeringGroup.users, function (userItem) {
                                            if (userItem.userId == evaluatorItem.userId) {
                                                evaluatorItem["userImage"] = userItem.userImage;
                                                evaluatorItem["email"] = userItem.email;
                                                evaluatorItem["stageGroupId"] = sgItem.id;
                                                var participant = _.filter($scope.participants, function (participantItem) {
                                                    return participantItem.participantId == evaluatorItem.evaluateeId
                                                });
                                                if (participant.length > 0) {

                                                    evaluatorItem["participant"] = participant[0];
                                                }
                                                $scope.finalScoreManagers.push(evaluatorItem);
                                            }
                                        });
                                    });
                                    //evaluatorItem["participantId"] = data;
                                    //evaluatorItem["evaluateeId"] = evaluator.evaluateeId;
                                }
                                else {
                                    _.each($scope.projectInfo.projectSteeringGroups, function (steeringGroup) {
                                        _.each(steeringGroup.users, function (userItem) {
                                            if (userItem.userId == evaluatorItem.userId) {
                                                evaluatorItem["userImage"] = userItem.userImage;
                                                evaluatorItem["stageGroupId"] = sgItem.id;
                                                evaluatorItem["email"] = userItem.email;
                                                var participant = _.filter($scope.participants, function (participantItem) {
                                                    return participantItem.participantId == evaluatorItem.evaluateeId
                                                });
                                                if (participant.length > 0) {
                                                    evaluatorItem["participant"] = participant[0];
                                                }
                                                $scope.evaluators.push(evaluatorItem);
                                                //$scope.finalScoreManagers.push(evaluatorItem);
                                            }
                                        });
                                    });

                                }
                            });
                        });
                    })

                    if ($scope.profile.link_ProfileTags.length > 0) {
                        $scope.profile["tags"] = new kendo.data.ObservableArray([]);
                        _.each($scope.profile.link_ProfileTags, function (tagItem) {
                            var tag = _.find($scope.profileTags, function (profileTag) {
                                return profileTag.id == tagItem.tagId;
                            });
                            if (tag) {
                                $scope.profile.tags.push(tag);
                            }

                        });
                    }
                    if ($state.current.name == "viewprofile") {
                        $scope.profileView = $scope.profile;
                    }
                })




            }
            else {
                $scope.profile = {
                    id: 0,
                    projectId: null,
                    name: "",
                    description: "",
                    performanceGroups: [],
                    jobPositions: [],
                    industry: null,
                    scale: null,
                    stageGroups: [],


                    organizationId: parseInt($scope.currentUser.organizationId),
                    profileTypeId: null,
                    industryId: null,
                    subIndustryId: null,
                    categoryId: null,

                    scaleId: null,
                    scale: null,
                    scaleSettingsRuleId: $scope.profileType == profileTypeEnum.Soft ? 4 : 1,
                    levelId: null,
                    isActive: true,
                    kpiWeak: 1,
                    kpiStrong: 1,
                    isTemplate: false,
                    questionDisplayRuleId: $scope.profileType == profileTypeEnum.Soft ? 1 : 2,
                    setKPIInSurvey: false,
                    randomizeQuestions: null,
                    allowRevisitAnsweredQuestions: null,
                    passScore: null,

                    ktMedalRule: null,
                    medalRuleId: null,
                    link_ProfileTags: [],
                };
            }

            function sleep(delay) {
                var start = new Date().getTime();
                while (new Date().getTime() < start + delay);
            }
            function saveQuestion(question) {


            }
            function prepareQuestionTimeAfterGet(question) {
                if (question.timeForQuestion) {
                    question.minutesForQuestion = Math.floor(question.timeForQuestion / 60);
                    question.secondsForQuestion = question.timeForQuestion % 60;
                }
            }
            function prepareQuesionTimeBeforeSave(question) {
                question.timeForQuestion = 0
                question.timeForQuestion += question.minutesForQuestion * 60;
                question.timeForQuestion += question.secondsForQuestion;

                if (question.possibleAnswer) {
                    if (question.possibleAnswer.answer.length > 0) {
                        question.possibleAnswer.answer = JSON.stringify(question.possibleAnswer.answer)
                    }
                }

            }


            //Skill
            $scope.openNewSkillModal = function (performanceGroupId) {
                $scope.link_PerformanceGroupSkill = {
                    trainings: [],
                    questions: [],
                    skill1: null,
                    skill: null,
                    id: 0,
                    name: "",
                    description: "",
                    performanceGroupId: performanceGroupId,
                    skillId: 0,
                    subSkillId: null,
                    benchmark: 8,
                    weight: 8,
                    csf: null,
                    csfList: [],
                    action: null,
                    actionList: [],
                };
                $("#skillModal").modal("show");
                $("#skillModal .modal-title").html($translate.instant('MYPROJECTS_PLEASE_ADD_NEW_SKILL'));
            }

            $scope.openEditSkillModal = function (performanceGroupId, skillId) {
                $scope.isSkillModalDisabled = false;
                _.each($scope.profile.performanceGroups, function (item) {
                    if (item.id == performanceGroupId) {
                        _.each(item.link_PerformanceGroupSkills, function (skillItem) {
                            if (skillItem.id == skillId) {
                                if (skillItem.weight) {
                                    skillItem.weight = parseInt(skillItem.weight);
                                }
                                $scope.link_PerformanceGroupSkill = angular.copy(skillItem);;
                                return (false);
                            }
                        })
                    }
                });
                $("#skillModal").modal("show");
                $("#skillModal .modal-title").html($translate.instant('MYPROJECTS_PROJECTPROFILES_EDIT_SKILL_DETAILS'))
            }
            $scope.openViewTemplateSkillModal = function (performanceGroupId, skillId) {
                $scope.isSkillModalDisabled = true;
                _.each($scope.profileView.performanceGroups, function (item) {
                    if (item.id == performanceGroupId) {
                        _.each(item.link_PerformanceGroupSkills, function (skillItem) {
                            if (skillItem.id == skillId) {
                                if (skillItem.weight) {
                                    skillItem.weight = parseInt(skillItem.weight);
                                }
                                $scope.link_PerformanceGroupSkill = angular.copy(skillItem);;
                                return (false);
                            }
                        })
                    }
                });
                $("#viewSkillModal").modal("show");
                $("#viewSkillModal .modal-title").html($translate.instant('MYPROJECTS_PROJECTPROFILES_VIEW_SKILL_DETAILS'))
            }

            $scope.removeSkill = function (performanceGroupId, skillId) {
                var hasQuestions = false;
                _.each($scope.profile.performanceGroups, function (item) {
                    if (item.id == performanceGroupId) {
                        var skillItem = _.find(item.link_PerformanceGroupSkills, function (skillItem) {
                            return skillItem.id == skillId
                        })
                        if (skillItem) {
                            if (skillItem.questions.length > 0) {
                                hasQuestions = true;
                            };
                        }
                    }
                });
                if (hasQuestions) {
                    dialogService.showYesNoDialog($translate.instant('COMMON_CONFIRM'), $translate.instant('MYPROJECTS_PROJECTPROFILES_THIS_SKILL_HAS_SOME_QUESTIONS') + " " + $translate.instant('MYPROJECTS_PROJECTPROFILES_IF_YOU_CONFIRM_THEN_QUESTIONS_FOR_THIS_SKILL_WILL_BE_ALSO_DELETED') + " " + $translate.instant('COMMON_ARE_YOU_SURE_YOU_WANT_TO_DELETE')).then(
                        function () {
                            _.each($scope.profile.performanceGroups, function (item) {
                                if (item.id == performanceGroupId) {
                                    var skillIndex = _.findIndex(item.link_PerformanceGroupSkills, function (skillItem) {
                                        return skillItem.id == skillId
                                    })
                                    if (skillIndex > -1) {
                                        item.link_PerformanceGroupSkills.splice(skillIndex, 1);
                                        dialogService.showNotification($translate.instant('MYPROJECTS_PROJECTPROFILES_SKILL_WITH_QUESTIONS_REMOVED_SUCCESSFULLY'), "success")
                                    }
                                }
                            });
                        },
                        function () {
                            //alert('No clicked');
                        });
                }
                else {
                    dialogService.showYesNoDialog($translate.instant('COMMON_CONFIRM'), $translate.instant('COMMON_ARE_YOU_SURE_YOU_WANT_TO_DELETE')).then(
                        function () {
                            _.each($scope.profile.performanceGroups, function (item) {
                                if (item.id == performanceGroupId) {
                                    var skillIndex = _.findIndex(item.link_PerformanceGroupSkills, function (skillItem) {
                                        return skillItem.id == skillId
                                    })
                                    if (skillIndex > -1) {
                                        item.link_PerformanceGroupSkills.splice(skillIndex, 1);
                                        dialogService.showNotification($translate.instant('MYPROJECTS_PROJECTPROFILES_SKILL_REMOVED_SUCCESSFULLY'), "success")
                                    }
                                }
                            });
                        },
                        function () {
                            //alert('No clicked');
                        });
                }
            }
            $scope.addNewSkill = function () {
                if ($scope.link_PerformanceGroupSkill.id == 0) {
                    if ($scope.link_PerformanceGroupSkill.performanceGroupId > 0) {
                        _.each($scope.profile.performanceGroups, function (item) {
                            if (item.id == $scope.link_PerformanceGroupSkill.performanceGroupId) {
                                $scope.link_PerformanceGroupSkill.id = (item.link_PerformanceGroupSkills.length + 1) * -1
                                $scope.link_PerformanceGroupSkill.skillId = (item.link_PerformanceGroupSkills.length + 1) * -1
                                if ($scope.link_PerformanceGroupSkill.skill) {

                                    $scope.link_PerformanceGroupSkill.skill["name"] = $scope.link_PerformanceGroupSkill.name;
                                    $scope.link_PerformanceGroupSkill.skill["description"] = $scope.link_PerformanceGroupSkill.description;

                                    if ($scope.link_PerformanceGroupSkill.skill.trainingDescriptions) {
                                    }

                                }
                                else {
                                    $scope.link_PerformanceGroupSkill.skill = {
                                        name: $scope.link_PerformanceGroupSkill.name,
                                        description: $scope.link_PerformanceGroupSkill.description,
                                    }
                                }
                                var skillIds = [$scope.link_PerformanceGroupSkill];
                                softProfileManager.addPerformanceGroupSkill($scope.link_PerformanceGroupSkill.performanceGroupId, skillIds).then(function (skilldata) {
                                    $scope.link_PerformanceGroupSkill.id = skilldata[0].id;
                                    $scope.link_PerformanceGroupSkill.skill.id = skilldata[0].skillId;
                                    $scope.link_PerformanceGroupSkill.skillId = skilldata[0].skillId;
                                    item.link_PerformanceGroupSkills.push($scope.link_PerformanceGroupSkill);
                                });

                            }
                        });


                    }
                    else {
                        _.each($scope.profile.performanceGroups, function (item) {
                            if (item.id == $scope.link_PerformanceGroupSkill.performanceGroupId) {
                                $scope.link_PerformanceGroupSkill.id = (item.link_PerformanceGroupSkills.length + 1) * -1
                                $scope.link_PerformanceGroupSkill.skillId = (item.link_PerformanceGroupSkills.length + 1) * -1
                                if ($scope.link_PerformanceGroupSkill.skill) {

                                    $scope.link_PerformanceGroupSkill.skill["name"] = $scope.link_PerformanceGroupSkill.name;
                                    $scope.link_PerformanceGroupSkill.skill["description"] = $scope.link_PerformanceGroupSkill.description;
                                    if ($scope.link_PerformanceGroupSkill.skill.trainingDescriptions) {
                                    }

                                }
                                else {
                                    $scope.link_PerformanceGroupSkill.skill = {
                                        name: $scope.link_PerformanceGroupSkill.name,
                                        description: $scope.link_PerformanceGroupSkill.description,
                                    }
                                }
                                item.link_PerformanceGroupSkills.push($scope.link_PerformanceGroupSkill);
                            }
                        });
                    }
                }
                else {
                    //Edit
                    if ($scope.link_PerformanceGroupSkill.id > 0) {
                        var skill = {
                            id: $scope.link_PerformanceGroupSkill.skillId,
                            name: $scope.link_PerformanceGroupSkill.name,
                            description: $scope.link_PerformanceGroupSkill.description
                        };

                        apiService.update("skills", skill).then(function (data) {
                            if (data) {
                                var skillIds = [$scope.link_PerformanceGroupSkill];
                                apiService.update("Performance_groups/" + $scope.link_PerformanceGroupSkill.performanceGroupId + "/newskills", skillIds).then(function (dataResult) {
                                    _.each($scope.profile.performanceGroups, function (item) {
                                        if (item.id == $scope.link_PerformanceGroupSkill.performanceGroupId) {
                                            _.each(item.link_PerformanceGroupSkills, function (skillItem) {
                                                if (skillItem.id == $scope.link_PerformanceGroupSkill.id) {
                                                    skillItem.skill = {
                                                        name: $scope.link_PerformanceGroupSkill.name,
                                                        description: $scope.link_PerformanceGroupSkill.description,
                                                    }
                                                    skillItem.name = $scope.link_PerformanceGroupSkill.name;
                                                    skillItem.description = $scope.link_PerformanceGroupSkill.description;
                                                    skillItem.benchmark = $scope.link_PerformanceGroupSkill.benchmark;
                                                    skillItem.weight = $scope.link_PerformanceGroupSkill.weight;
                                                    skillItem.csf = $scope.link_PerformanceGroupSkill.csf;
                                                    skillItem.action = $scope.link_PerformanceGroupSkill.action;
                                                    return (false);
                                                }
                                            })
                                        }
                                    });
                                    dialogService.showNotification($translate.instant('MYPROJECTS_PROJECTPROFILES_SKILL_UPDATED_SUCCESSFULLY'), 'info')
                                }, function (error) {
                                    dialogService.showNotification(error, 'warning');
                                })

                                //$state.go('^');
                            }
                            else {
                                dialogService.showNotification($translate.instant('MYPROJECTS_PROJECTPROFILES_SAVE_FAILED'), 'warning');
                            }
                        }, function (error) {
                            dialogService.showNotification(error, "warning");
                        })
                    }
                    else {
                        _.each($scope.profile.performanceGroups, function (item) {
                            if (item.id == $scope.link_PerformanceGroupSkill.performanceGroupId) {
                                _.each(item.link_PerformanceGroupSkills, function (skillItem) {
                                    if (skillItem.id == $scope.link_PerformanceGroupSkill.id) {
                                        skillItem.skill = {
                                            name: $scope.link_PerformanceGroupSkill.name,
                                            description: $scope.link_PerformanceGroupSkill.description,
                                        }
                                        skillItem.name = $scope.link_PerformanceGroupSkill.name;
                                        skillItem.description = $scope.link_PerformanceGroupSkill.description;
                                        skillItem.benchmark = $scope.link_PerformanceGroupSkill.benchmark;
                                        skillItem.weight = $scope.link_PerformanceGroupSkill.weight;
                                        skillItem.csf = $scope.link_PerformanceGroupSkill.csf;
                                        skillItem.action = $scope.link_PerformanceGroupSkill.action;
                                        return (false);
                                    }
                                })
                            }
                        });
                    }

                }
            }
            $scope.pgSkills = [];

            $scope.searchText = "";
            $scope.skillList = [];
            $scope.filterOptions = {
                profileTypeId: $scope.profile.profileTypeId,
                profileLevelId: $scope.profile.levelId,
                profileCategoryId: $scope.profile.categoryId,
                profileCategoryName: "",
                profileLevelName: "",
                profileTypeName: "",
            }
            $scope.openSearchSkillModal = function (performanceGroupId) {
                var catageory = _.find($scope.categories, function (item) { return item.id == $scope.profile.categoryId; });
                var level = _.find($scope.levels, function (item) { return item.id == $scope.profile.levelId; });

                $scope.filterOptions = {
                    performanceGroupId: performanceGroupId,
                    profileTypeId: $scope.profile.profileTypeId,
                    profileLevelId: $scope.profile.levelId != null ? $scope.profile.levelId : 0,
                    profileCategoryId: $scope.profile.categoryId != null ? $scope.profile.categoryId : 0,
                    profileCategoryName: $scope.profile.categoryId != null ? catageory.name : "",
                    profileLevelName: $scope.profile.levelId != null ? level.name : "",
                    profileTypeName: $scope.profile.profileTypeId == 1 ? 'Soft' : 'Knoweledge',
                }
                profilesService.getFilteredProfileSkill($scope.filterOptions).then(function (data) {
                    $scope.skillList = _.filter(data, function (item) {
                        return item.profileLevelId == $scope.profile.levelId || item.profileCategoryId == $scope.profile.categoryId
                    });

                    if ($("#searchSkillGrid").data("kendoGrid")) {
                        $("#searchSkillGrid").kendoGrid("destroy");
                    }

                    $("#searchSkillGrid").kendoGrid({
                        dataBound: $scope.onGridDataBound,
                        dataSource: {
                            type: "json",
                            data: $scope.skillList,
                            pageSize: 10,
                            //group: { field: "parentRoleLevelId", field: "parentRoleLevelName" },
                        },
                        filterable: {
                            extra: false,
                            operators: {
                                string: {
                                    startswith: "Starts with",
                                    eq: "Is equal to",
                                    neq: "Is not equal to"
                                }
                            }
                        },
                        sortable: true,
                        pageable: true,
                        columns: [
                            {
                                field: "name", title: $translate.instant('COMMON_NAME'), template: function (dataItem) {
                                    return '<span class="bold">' + dataItem.name + '</span>';
                                }
                            },
                            {
                                field: "profileTypeId", title: $translate.instant('COMMON_TYPE'), template: function (dataItem) {
                                    var result = '';
                                    if (dataItem.profileTypeId > 0) {
                                        var cssClass = "btn-default";
                                        if (dataItem.profileTypeId == $scope.profile.profileTypeId) {
                                            cssClass = "btn-success";
                                        }
                                        result += '<span class="btn btn-sm btn-circle ' + cssClass + ' ">' + dataItem.profileTypeName + '</span>';
                                    }
                                    result += '';
                                    return result;
                                }
                            },
                            {
                                field: "profileLevelName", title: $translate.instant('COMMON_LEVEL'), template: function (dataItem) {
                                    var result = '';
                                    if (dataItem.profileLevelId > 0) {
                                        var cssClass = "btn-default";
                                        if (dataItem.profileLevelId == $scope.profile.levelId) {
                                            cssClass = "btn-success";
                                        }
                                        result += '<span class="btn btn-sm btn-circle ' + cssClass + ' "> ' + dataItem.profileLevelName + '</span>';
                                    }
                                    result += '';
                                    return result;
                                }
                            },
                            {
                                field: "profileCategoryName", title: $translate.instant('COMMON_CATEGORY'), template: function (dataItem) {
                                    var result = '';
                                    if (dataItem.profileCategoryId > 0) {
                                        var cssClass = "btn-default";
                                        if (dataItem.profileCategoryId == $scope.profile.categoryId) {
                                            cssClass = "btn-success";
                                        }
                                        result += '<span class="btn btn-sm btn-circle ' + cssClass + ' ">' + dataItem.profileCategoryName + '</span>';
                                    }
                                    return result;
                                }
                            },
                            {
                                field: "id", title: $translate.instant('COMMON_ACTION'), filterable: false, template: function (dataItem) {
                                    return '<a href="javascript:;" class="btn btn-primary addAsSkill" data-skillid="' + dataItem.id + '"><i class="fa fa-plus"></i> Add </a>'
                                }
                            },
                        ],
                    });
                    $("#searchSkillGrid").kendoTooltip({
                        filter: "th", // show tooltip only on these elements
                        position: "top",
                        animation: {
                            open: {
                                effects: "fade:in",
                                duration: 200
                            },
                            close: {
                                effects: "fade:out",
                                duration: 200
                            }
                        },
                        // show tooltip only if the text of the target overflows with ellipsis
                        show: function (e) {
                            if (this.content.text() != "") {
                                $('[role="tooltip"]').css("visibility", "visible");
                            }
                        }
                    });

                    $("#searchSkillModal").modal("show");
                })
            }
            function AddAsSkill(skillId) {
                profilesService.getSkillById(skillId).then(function (data) {
                    data.performanceGroupId = $scope.filterOptions.performanceGroupId;
                    data.benchmark = 8;
                    data.weight = 8;
                    data.skillId = skillId;
                    var csfList = profilesService.getCSFListBySkillId(skillId).then(function (responseCSF) {
                        data["csfList"] = responseCSF;
                        profilesService.getActionListBySkillId(skillId).then(function (responseAction) {
                            data["actionList"] = responseAction;
                            $scope.link_PerformanceGroupSkill = data;
                            $("#searchSkillModal").modal("hide");
                            $("#skillModal").modal("show");
                            $("#skillModal .modal-title").html($translate.instant('MYPROJECTS_PROJECTPROFILES_PLEASE_ADD_SKILL_DETAILS'));
                        })
                    });


                });
            }

            $scope.searchSkillGrid = function (searchText) {
                var gridObject = $("#searchSkillGrid").data("kendoGrid");
                if (gridObject) {
                    gridObject.dataSource.filter({ field: "name", operator: "contains", value: searchText });
                }

            }

            $scope.openNewQuestionModal = function (performanceGroupId, skillId) {
                $scope.pgSkills = [];
                _.each($scope.profile.performanceGroups, function (item) {
                    if (item.id == performanceGroupId) {
                        _.each(item.link_PerformanceGroupSkills, function (skillItem) {
                            $scope.pgSkills.push(skillItem);
                        })
                    }
                });
                $scope.question = {
                    id: 0,
                    questionText: "",
                    description: "",
                    answerTypeId: 1,
                    isActive: true,
                    isTemplate: false,
                    organizationId: parseInt($scope.currentUser.organizationId),
                    profileTypeId: $scope.profile.profileTypeId,
                    scaleId: null,
                    questionSettings: null,
                    structureLevelId: null,
                    industryId: null,
                    seqNo: 0,
                    points: null,
                    timeForQuestion: null,
                    parentQuestionId: null,
                    performanceGroupId: performanceGroupId,
                    skillId: null,
                    possibleAnswer: null
                }

                if (skillId) {
                    $scope.question.skillId = skillId;
                    $scope.chageQuestionSkill(skillId);
                }

                if ($scope.profile.profileTypeId == profileTypeEnum.Knowledge) {
                    $scope.resetAnswer();
                }
                $("#questionModal").modal("show");
            }
            $scope.chageQuestionSkill = function () {
                if ($scope.question.skillId != 0) {
                    var skill = _.find($scope.pgSkills, function (skillItem) {
                        return skillItem.skillId == $scope.question.skillId;
                    });
                    if (skill) {
                        $scope.question.description = skill.description;
                    }
                }
            }
            $scope.openEditQuestionModal = function (performanceGroupId, questionId, skillId) {
                $scope.pgSkills = [];
                _.each($scope.profile.performanceGroups, function (item) {
                    if (item.id == performanceGroupId) {
                        _.each(item.link_PerformanceGroupSkills, function (skillItem) {
                            $scope.pgSkills.push(skillItem);
                        })
                    }
                });

                _.each($scope.profile.performanceGroups, function (item) {
                    if (item.id == performanceGroupId) {
                        _.each(item.link_PerformanceGroupSkills, function (pgSkillItem) {
                            if (pgSkillItem.skillId == skillId) {
                                _.each(pgSkillItem.questions, function (questionItem) {
                                    if (questionItem.id == questionId) {
                                        if (questionItem.answerTypeId == $scope.questionTypesEnum.order || questionItem.answerTypeId == $scope.questionTypesEnum.numeric) {
                                            if (questionItem.possibleAnswer) {
                                                questionItem.possibleAnswer.answer = parseInt(questionItem.possibleAnswer.answer)
                                            }
                                        }
                                        else if (questionItem.answerTypeId == $scope.questionTypesEnum.singleChoice || questionItem.answerTypeId == $scope.questionTypesEnum.multipleChoice) {
                                            if (typeof (questionItem.possibleAnswer.answer) == "string") {
                                                questionItem.possibleAnswer.answer = JSON.parse(questionItem.possibleAnswer.answer)
                                            }
                                        }
                                        questionItem["performanceGroupId"] = performanceGroupId;
                                        $scope.question = angular.copy(questionItem);
                                        prepareQuestionTimeAfterGet($scope.question);
                                    }
                                })
                            }
                        })
                    }
                });
                $("#questionModal").modal("show");
            }


            $scope.openViewQuestionModal = function (performanceGroupId, questionId, skillId) {
                $scope.pgSkills = [];
                _.each($scope.profile.performanceGroups, function (item) {
                    if (item.id == performanceGroupId) {
                        _.each(item.link_PerformanceGroupSkills, function (skillItem) {
                            $scope.pgSkills.push(skillItem);
                        })
                    }
                });

                _.each($scope.profile.performanceGroups, function (item) {
                    if (item.id == performanceGroupId) {
                        _.each(item.link_PerformanceGroupSkills, function (pgSkillItem) {
                            if (pgSkillItem.skillId == skillId) {
                                _.each(pgSkillItem.questions, function (questionItem) {
                                    if (questionItem.id == questionId) {
                                        if (questionItem.answerTypeId == $scope.questionTypesEnum.order || questionItem.answerTypeId == $scope.questionTypesEnum.numeric) {
                                            if (questionItem.possibleAnswer) {
                                                questionItem.possibleAnswer.answer = parseInt(questionItem.possibleAnswer.answer)
                                            }
                                        }
                                        else if (questionItem.answerTypeId == $scope.questionTypesEnum.singleChoice || questionItem.answerTypeId == $scope.questionTypesEnum.multipleChoice) {
                                            if (typeof (questionItem.possibleAnswer.answer) == "string") {
                                                questionItem.possibleAnswer.answer = JSON.parse(questionItem.possibleAnswer.answer)
                                            }
                                        }
                                        questionItem["performanceGroupId"] = performanceGroupId;
                                        $scope.questionView = angular.copy(questionItem);
                                        prepareQuestionTimeAfterGet($scope.questionView);
                                    }
                                })
                            }
                        })
                    }
                });
                $("#viewTemplateQuestionModal").modal("show");
            }


            $scope.openViewTemplateQuestionModal = function (performanceGroupId, questionId, skillId) {
                $scope.pgSkills = [];
                _.each($scope.profileView.performanceGroups, function (item) {
                    if (item.id == performanceGroupId) {
                        _.each(item.link_PerformanceGroupSkills, function (skillItem) {
                            $scope.pgSkills.push(skillItem);
                        })
                    }
                });
                _.each($scope.profileView.performanceGroups, function (item) {
                    if (item.id == performanceGroupId) {
                        _.each(item.link_PerformanceGroupSkills, function (pgSkillItem) {
                            if (pgSkillItem.skillId == skillId) {
                                _.each(pgSkillItem.questions, function (questionItem) {
                                    if (questionItem.id == questionId) {
                                        if (questionItem.answerTypeId == $scope.questionTypesEnum.order || questionItem.answerTypeId == $scope.questionTypesEnum.numeric) {
                                            if (questionItem.possibleAnswer) {
                                                questionItem.possibleAnswer.answer = parseInt(questionItem.possibleAnswer.answer)
                                            }
                                        }
                                        else if (questionItem.answerTypeId == $scope.questionTypesEnum.singleChoice || questionItem.answerTypeId == $scope.questionTypesEnum.multipleChoice) {
                                            if (typeof (questionItem.possibleAnswer.answer) == "string") {
                                                questionItem.possibleAnswer.answer = JSON.parse(questionItem.possibleAnswer.answer)
                                            }
                                        }
                                        questionItem["performanceGroupId"] = performanceGroupId;
                                        $scope.questionView = angular.copy(questionItem);
                                        prepareQuestionTimeAfterGet($scope.questionView);
                                    }
                                })
                            }
                        })
                    }
                });
                $("#viewTemplateQuestionModal").modal("show");
            }

            $scope.removePerformanceGroup = function (performanceGroupId) {
                dialogService.showYesNoDialog($translate.instant('COMMON_CONFIRM'), $translate.instant('COMMON_ARE_YOU_SURE_YOU_WANT_TO_DELETE')).then(function () {
                    var index = _.findIndex($scope.profile.performanceGroups, function (pgItem) {
                        return pgItem.id == performanceGroupId;
                    });
                    if (index >= 0) {
                        $scope.profile.performanceGroups.splice(index, 1);
                    }
                }, function () {
                });
            }
            $scope.resetAnswer = function () {
                $scope.question.secondsForQuestion = 0;
                switch ($scope.question.answerTypeId) {
                    case $scope.questionTypesEnum.singleChoice:
                        $scope.question.points = defaulQuestionValuesByAnswerTypeEnum.singleChoice.points;
                        $scope.question.minutesForQuestion = defaulQuestionValuesByAnswerTypeEnum.singleChoice.minutesForQuestion;
                        $scope.question.possibleAnswer = { answer: [] };
                        break;
                    case $scope.questionTypesEnum.multipleChoice:
                        $scope.question.points = defaulQuestionValuesByAnswerTypeEnum.multipleChoice.points;
                        $scope.question.minutesForQuestion = defaulQuestionValuesByAnswerTypeEnum.multipleChoice.minutesForQuestion;
                        $scope.question.possibleAnswer = { answer: [] };
                        break;
                    case $scope.questionTypesEnum.order:
                        $scope.question.points = defaulQuestionValuesByAnswerTypeEnum.order.points;
                        $scope.question.minutesForQuestion = defaulQuestionValuesByAnswerTypeEnum.order.minutesForQuestion;
                        $scope.question.possibleAnswer = { answer: [] };
                        break;
                    case $scope.questionTypesEnum.numeric:
                        $scope.question.points = defaulQuestionValuesByAnswerTypeEnum.numeric.points;
                        $scope.question.minutesForQuestion = defaulQuestionValuesByAnswerTypeEnum.numeric.minutesForQuestion;
                        $scope.question.possibleAnswer = { answer: null };
                        break;
                    case $scope.questionTypesEnum.text:
                        $scope.question.points = defaulQuestionValuesByAnswerTypeEnum.text.points;
                        $scope.question.minutesForQuestion = defaulQuestionValuesByAnswerTypeEnum.text.minutesForQuestion;
                        $scope.question.possibleAnswer = { answer: null };
                        break;
                }
            };
            $scope.checkAll = false;
            $scope.selectAllDescription = function () {
                $scope.checkAll = !$scope.checkAll;
                if ($scope.checkAll) {
                    _.each($scope.trainingDescriptions, function (item) {
                        item.isChecked = true;
                    });
                }
                else {
                    _.each($scope.trainingDescriptions, function (item) {
                        item.isChecked = false;
                    });
                }

            }
            $scope.trainingDescriptions = [];
            $scope.openNewCSFModal = function () {
                $scope.checkAll = false;
                $scope.trainingDescriptions = [];
                $scope.IsCSF = true;
                $scope.IsAction = false;
                $scope.trainingDescription = {
                    id: 0,
                    descriptionType: 3,
                    description: "",
                    skillId: 0,
                    isChecked: false,
                }
                if ($scope.link_PerformanceGroupSkill.skillId > 0) {
                    $scope.trainingDescription.skillId = $scope.link_PerformanceGroupSkill.skillId;
                    profileTrainingManager.getReasonDescriptions($scope.link_PerformanceGroupSkill.skillId).then(function (data) {
                        $scope.trainingDescriptions = _.filter(data, function (item) {
                            item["isChecked"] = false;
                            return item.descriptionType == 3;
                        });
                        $("#DescriptionReasonModal").modal("show");
                    });
                }
                else {
                    $("#DescriptionReasonModal").modal("show");
                }
            }
            $scope.openNewActionModal = function () {
                $scope.checkAll = false;
                $scope.trainingDescriptions = [];
                $scope.IsCSF = false;
                $scope.IsAction = true;
                $scope.trainingDescription = {
                    id: 0,
                    descriptionType: 4,
                    description: "",
                    skillId: 0,
                    isChecked: false,
                }

                if ($scope.link_PerformanceGroupSkill.skillId > 0) {
                    $scope.trainingDescription.skillId = $scope.link_PerformanceGroupSkill.skillId;
                    profileTrainingManager.getReasonDescriptions($scope.link_PerformanceGroupSkill.skillId).then(function (data) {
                        $scope.trainingDescriptions = _.filter(data, function (item) {
                            item["isChecked"] = false;
                            return item.descriptionType == 4;
                        });
                        $("#DescriptionReasonModal").modal("show");
                    });
                }
                else {
                    $("#DescriptionReasonModal").modal("show");
                }


            }
            $scope.openAddCSFAction = function () {
                var csfActionItem = angular.copy($scope.trainingDescription);
                csfActionItem.description = "";
                $scope.trainingDescription = csfActionItem;
                $("#AddReasonModal").modal('show');
            }
            $scope.addCSFAction = function () {
                if ($scope.trainingDescription.skillId > 0) {
                    profileTrainingManager.addNewReason($scope.trainingDescription).then(function (data) {
                        if (data) {
                            $scope.trainingDescription.id = data;
                            $scope.trainingDescriptions.push($scope.trainingDescription);
                            $("#AddReasonModal").modal('hide');
                        }
                    })
                }
                else {
                    $scope.trainingDescriptions.push($scope.trainingDescription);
                    $("#AddReasonModal").modal('hide');
                }
            }


            $scope.addSelectedDescriptions = function () {

                $scope.selectedReasons = _.filter($scope.trainingDescriptions, function (dataItem) {
                    return dataItem.isChecked == true;
                })
                if ($scope.trainingDescription.descriptionType == 3) {

                    var csf = []
                    if ($scope.link_PerformanceGroupSkill.csf) {
                        csf.push($scope.link_PerformanceGroupSkill.csf);
                    }
                    _.each($scope.selectedReasons, function (item) {
                        csf.push(item.description);
                    })
                    $scope.link_PerformanceGroupSkill.csf = csf.join(',')
                }
                if ($scope.trainingDescription.descriptionType == 4) {
                    var actions = []
                    if ($scope.link_PerformanceGroupSkill.action) {
                        actions.push($scope.link_PerformanceGroupSkill.action);
                    }
                    _.each($scope.selectedReasons, function (item) {
                        actions.push(item.description);
                    })
                    $scope.link_PerformanceGroupSkill.action = actions.join(',')

                }
                if (!($scope.link_PerformanceGroupSkill.skill)) {
                    $scope.link_PerformanceGroupSkill.skill = {};
                }
                if ($scope.link_PerformanceGroupSkill.skill["trainingDescriptions"]) {
                    _.each($scope.selectedReasons, function (item) {
                        $scope.link_PerformanceGroupSkill.skill["trainingDescriptions"].push(item);

                    })
                }
                else {
                    $scope.link_PerformanceGroupSkill.skill["trainingDescriptions"] = $scope.selectedReasons;
                }
                $("#DescriptionReasonModal").modal('hide');

            }
            $scope.removeQuestion = function (performanceGroupId, questionId) {

                dialogService.showYesNoDialog($translate.instant('COMMON_CONFIRM'), $translate.instant('COMMON_ARE_YOU_SURE_YOU_WANT_TO_DELETE')).then(function () {
                    apiService.remove("questions", questionId).then(function (data) {
                        if (data) {
                            _.each($scope.profile.performanceGroups, function (item) {
                                if (item.id == $scope.question.performanceGroupId) {
                                    _.each(item.link_PerformanceGroupSkills, function (pgSkillItem) {
                                        var questionIndex = _.findIndex(pgSkillItem.questions, function (questionItem) {
                                            return questionItem.id == questionId;
                                        });
                                        pgSkillItem.questions.splice(questionIndex, 1);
                                        dialogService.showNotification($translate.instant('MYPROJECTS_PROJECTPROFILES_QUESTION_REMOVED_SUCCESSFULLY'), "success")
                                        return (false);
                                    })
                                }
                            });
                        }
                    },
                        function (error) {
                            dialogService.showNotification(error, "error");
                        });
                },
                    function () {
                        //alert('No clicked');
                    });


            }
            $scope.addNewQuestion = function () {
                if ($scope.question.id == 0) {
                    if ($scope.question.skillId > 0) {
                        prepareQuesionTimeBeforeSave($scope.question);
                        apiService.add('questions', $scope.question).then(function (questiondata) {
                            $scope.question.id = questiondata;
                            var allQuestion = [];
                            allQuestion.push({
                                skillId: $scope.question.skillId,
                                questionId: questiondata,
                                seqNo: parseInt($scope.question.seqNo),
                            });

                            //var allQuestion = [$scope.question]
                            apiService.update("Performance_groups/" + $scope.question.performanceGroupId + "/newquestions", allQuestion).then(function (resultData) {
                                _.each($scope.profile.performanceGroups, function (item) {
                                    if (item.id == $scope.question.performanceGroupId) {
                                        _.each(item.link_PerformanceGroupSkills, function (pgSkillItem) {
                                            if (pgSkillItem.skillId == $scope.question.skillId) {
                                                $scope.question.id = resultData[0].questionId;
                                                //$scope.question.possibleAnswer.answer =  JSON.stringify($scope.question.possibleAnswer.answer)
                                                pgSkillItem.questions.push($scope.question);
                                            }
                                        })
                                    }
                                });
                                //dialogService.showNotification('Performance group saved successfully', 'info');
                            }, $scope.showError)

                        }, $scope.showError);

                    }
                    else {
                        _.each($scope.profile.performanceGroups, function (item) {
                            if (item.id == $scope.question.performanceGroupId) {
                                _.each(item.link_PerformanceGroupSkills, function (pgSkillItem) {
                                    if (pgSkillItem.skillId == $scope.question.skillId) {
                                        $scope.question.id = (pgSkillItem.questions.length + 1) * -1;
                                        prepareQuesionTimeBeforeSave($scope.question);
                                        //$scope.question.possibleAnswer.answer =  JSON.stringify($scope.question.possibleAnswer.answer)
                                        pgSkillItem.questions.push($scope.question);
                                    }
                                })
                            }
                        });
                    }

                }
                else {
                    //Edit
                    if ($scope.question.id > 0) {
                        prepareQuesionTimeBeforeSave($scope.question);
                        apiService.update("questions", $scope.question).then(function (data) {
                            if (data) {
                                _.each($scope.profile.performanceGroups, function (item) {
                                    if (item.id == $scope.question.performanceGroupId) {
                                        _.each(item.link_PerformanceGroupSkills, function (pgSkillItem) {
                                            _.each(pgSkillItem.questions, function (questionItem) {
                                                if (questionItem.id == $scope.question.id) {
                                                    questionItem.questionText = $scope.question.questionText;
                                                    questionItem.description = $scope.question.description;
                                                    questionItem.possibleAnswer = $scope.question.possibleAnswer;
                                                    questionItem.answerTypeId = $scope.question.answerTypeId;
                                                }
                                            })
                                        })
                                    }
                                });
                                dialogService.showNotification($translate.instant('MYPROJECTS_PROJECTPROFILES_QUESTION_UPDATED_SUCCESSFULLY'), 'success');
                            }
                            else {
                                dialogService.showNotification($translate.instant('MYPROJECTS_PROJECTPROFILES_QUESTION_UPDATE_FAILED'), 'warning');
                            }
                        },
                            function (error) {
                                dialogService.showNotification(error, 'warning');
                            });
                    }
                    else {
                        _.each($scope.profile.performanceGroups, function (item) {
                            if (item.id == $scope.question.performanceGroupId) {
                                _.each(item.link_PerformanceGroupSkills, function (pgSkillItem) {
                                    if (pgSkillItem.skillId == $scope.question.skillId) {
                                        _.each(pgSkillItem.questions, function (questionItem) {
                                            if (questionItem.id == $scope.question.id) {
                                                questionItem.questionText = $scope.question.questionText;
                                                questionItem.description = $scope.question.description;
                                            }
                                        })
                                    }
                                })
                            }
                        });
                    }
                }
            }

            $scope.openNewPresetTrainnigModal = function (performanceGroupId, skillId) {
                $scope.pgSkills = [];
                _.each($scope.profile.performanceGroups, function (item) {
                    if (item.id == performanceGroupId) {
                        _.each(item.link_PerformanceGroupSkills, function (skillItem) {
                            $scope.pgSkills.push(skillItem);
                        })
                    }
                });

                $scope.newTraining = {
                    id: 0,
                    name: $translate.instant('MYPROJECTS_NEW_TRAINING'),
                    typeId: null,
                    levelId: null,
                    why: '',
                    what: '',
                    how: '',
                    additionalInfo: '',
                    startDate: moment(new Date()).format('L LT'),
                    endDate: '',
                    duration: 30,
                    durationMetricId: null,
                    frequency: "FREQ=WEEKLY;BYDAY=WE",
                    howMany: 1,
                    exerciseMetricId: null,
                    howManySets: 1,
                    howManyActions: 1,
                    isActive: true,
                    organizationId: $scope.currentUser.organizationId,
                    trainingMaterial: { id: 0, name: "", description: "", title: "", materialType: "", resourceType: "" },
                    trainingMaterials: new kendo.data.ObservableArray([]),
                    userId: $scope.userId,
                    skillId: skillId,
                    notificationTemplateId: null,
                    isNotificationByEmail: true,
                    emailNotificationIntervalId: null,
                    emailBefore: null,
                    isNotificationBySMS: false,
                    smsNotificationIntervalId: null,
                    performanceGroupId: performanceGroupId,
                }
                if (skillId) {
                    $scope.newTraining.skillId = skillId;
                    $scope.skillChanged();
                }

                $("#presetTrainingModal").modal("show");
            }


            $scope.openNewPresetTrainnigMaterialModal = function (performanceGroupId) {
                $scope.trainingMaterial = {
                    id: 0,
                    description: "",
                    title: "",
                    materialType: "",
                    resourceType: "",
                    link: "",
                    name: "",
                },
                    $("#presetTrainingMaterialModal").modal("show");
            }
            $scope.openEditPresetTrainnigMaterialModal = function (trainnigMaterialId) {
                var trainingMaterial = _.find($scope.newTraining.trainingMaterials, function (trainingMaterialItem) {
                    return trainingMaterialItem.id == trainnigMaterialId;
                });
                if (trainingMaterial) {
                    $scope.trainingMaterial = {
                        id: trainingMaterial.id,
                        description: trainingMaterial.description,
                        title: trainingMaterial.title,
                        materialType: trainingMaterial.materialType,
                        resourceType: trainingMaterial.resourceType,
                        link: trainingMaterial.link,
                        name: trainingMaterial.name,
                    },
                        $("#presetTrainingMaterialModal").modal("show");
                }
            }
            $scope.addNewPresetTrainnigMaterial = function () {
                if ($scope.trainingMaterial.id == 0) {
                    $scope.trainingMaterial.id = ($scope.newTraining.trainingMaterials.length + 1) * -1;
                    $scope.newTraining.trainingMaterials.push($scope.trainingMaterial);
                }
                else {
                    _.each($scope.newTraining.trainingMaterials, function (trainingMaterialItem) {
                        if (trainingMaterialItem.id == $scope.trainingMaterial.id) {
                            trainingMaterialItem = $scope.trainingMaterial;
                        }
                    })
                    //Edit
                }
            }
            $scope.openEditPresetTrainnigModal = function (performanceGroupId, trainingId) {
                $scope.pgSkills = [];
                _.each($scope.profile.performanceGroups, function (item) {
                    if (item.id == performanceGroupId) {
                        _.each(item.link_PerformanceGroupSkills, function (skillItem) {
                            $scope.pgSkills.push(skillItem);
                        });
                    }
                });
                _.each($scope.profile.performanceGroups, function (item) {
                    if (item.id == performanceGroupId) {
                        _.each(item.link_PerformanceGroupSkills, function (skillItem) {
                            _.each(skillItem.trainings, function (trainingItem) {
                                if (trainingItem.id == trainingId) {
                                    $scope.newTraining = angular.copy(trainingItem);
                                    $scope.newTraining["skillId"] = skillItem.skillId;
                                }
                            })
                        })
                    }
                });
                $("#presetTrainingModal").modal("show");
            }

            $scope.openViewTemplatePresetTrainnigModal = function (performanceGroupId, trainingId) {
                $scope.pgSkills = [];
                _.each($scope.profileView.performanceGroups, function (item) {
                    if (item.id == performanceGroupId) {
                        _.each(item.link_PerformanceGroupSkills, function (skillItem) {
                            $scope.pgSkills.push(skillItem);
                        });
                    }
                });
                _.each($scope.profileView.performanceGroups, function (item) {
                    if (item.id == performanceGroupId) {
                        _.each(item.link_PerformanceGroupSkills, function (skillItem) {
                            _.each(skillItem.trainings, function (trainingItem) {
                                if (trainingItem.id == trainingId) {
                                    $scope.newTraining = angular.copy(trainingItem);
                                    $scope.newTraining["skillId"] = skillItem.skillId;
                                }
                            })
                        })
                    }
                });
                $("#viewPresetTrainingModal").modal("show");
            }

            $scope.openViewPresetTrainnigMaterialModal = function (trainnigMaterialId) {
                var trainingMaterial = _.find($scope.newTraining.trainingMaterials, function (trainingMaterialItem) {
                    return trainingMaterialItem.id == trainnigMaterialId;
                });
                if (trainingMaterial) {
                    $scope.viewTrainingMaterial = {
                        id: trainingMaterial.id,
                        description: trainingMaterial.description,
                        title: trainingMaterial.title,
                        materialType: trainingMaterial.materialType,
                        resourceType: trainingMaterial.resourceType,
                        link: trainingMaterial.link,
                        name: trainingMaterial.name,
                    },
                        $("#viewPresetTrainingMaterialModal").modal("show");
                }
            }


            $scope.removePresetTrainnigMaterialModal = function (trainnigMaterialId) {
                dialogService.showYesNoDialog($translate.instant('COMMON_CONFIRM'), $translate.instant('COMMON_ARE_YOU_SURE_YOU_WANT_TO_DELETE')).then(
                    function () {
                        var index = _.findIndex($scope.newTraining.trainingMaterials, function (item) {
                            return item.id == trainnigMaterialId;
                        })
                        $scope.newTraining.trainingMaterials.splice(index, 1);
                        _.each($scope.newTraining.trainingMaterials, function (tmItem, tmindex) {
                            if (tmItem.id < 0) {
                                tmItem.id = (tmindex + 1) * -1;
                            }
                        })
                        dialogService.showNotification($translate.instant('MYPROJECTS_PROJECTPROFILES_TRAINING_MATERIAL_REMOVED_SUCCESSFULLY'), "success")
                    },
                    function () {
                        //alert('No clicked');
                    });




            }

            //$scope.addNewTraining = function () {
            //    if ($scope.newTraining.id == 0) {
            //        _.each($scope.profile.performanceGroups, function (item) {
            //            if (item.id == $scope.newTraining.performanceGroupId) {
            //                _.each(item.link_PerformanceGroupSkills, function (pgSkillItem) {
            //                    if (pgSkillItem.id == $scope.newTraining.skillId) {
            //                        $scope.newTraining.id = (pgSkillItem.trainings.length + 1) * -1
            //                        pgSkillItem.trainings.push($scope.newTraining);
            //                    }
            //                })
            //            }
            //        });
            //    }
            //    else {
            //        //Edit
            //    }
            //}


            // PG Training
            $scope.skillChanged = function () {
                if ($scope.newTraining.skillId > 0) {
                    profileTrainingManager.getTrainingTemplatesBySkill($scope.newTraining.skillId).then(function (data) {
                        $scope.trainingTemplates = data;
                        var trainingTemplate = _.max($scope.trainingTemplates, function (o) { return o.id; });
                        if (trainingTemplate) {
                            var newTraining = {
                                id: 0,
                                name: $scope.newTraining.name,
                                typeId: trainingTemplate.typeId,
                                levelId: trainingTemplate.levelId,
                                why: trainingTemplate.why,
                                what: trainingTemplate.what,
                                how: trainingTemplate.how,
                                additionalInfo: trainingTemplate.additionalInfo,
                                startDate: $scope.newTraining.startDate,
                                endDate: $scope.newTraining.endDate,
                                duration: trainingTemplate.duration ? trainingTemplate.duration : 30,
                                durationMetricId: trainingTemplate.durationMetricId ? trainingTemplate.durationMetricId : ($scope.defaultDurationMetric ? $scope.defaultDurationMetric.id : null),
                                frequency: "FREQ=WEEKLY;BYDAY=WE",
                                howMany: trainingTemplate.howMany ? trainingTemplate.howMany : 1,
                                exerciseMetricId: trainingTemplate.exerciseMetricId,
                                howManySets: trainingTemplate.howManySets ? trainingTemplate.howManySets : 1,
                                howManyActions: trainingTemplate.howManyActions ? trainingTemplate.howManyActions : 1,
                                isActive: true,
                                organizationId: $scope.currentUser.organizationId,
                                trainingMaterial: { id: 0, name: "", description: "", title: "", materialType: "", resourceType: "" },
                                trainingMaterials: new kendo.data.ObservableArray([]),
                                userId: $scope.currentUser.userId,
                                skillId: $scope.newTraining.skillId,
                                notificationTemplateId: trainingTemplate.notificationTemplateId,
                                isNotificationByEmail: true,
                                emailNotificationIntervalId: trainingTemplate.emailNotificationIntervalId,
                                emailBefore: null,
                                isNotificationBySMS: false,
                                smsNotificationIntervalId: null,
                                performanceGroupId: $scope.newTraining.performanceGroupId,
                            }
                            _.each(trainingTemplate.trainingMaterials, function (item, index) {
                                item.id = (index + 1) * -1
                                newTraining.trainingMaterials.push(item);
                            });
                            $scope.newTraining = newTraining;
                        }
                    });
                }
            }
            $scope.searchTrainigTemplate = function () {
                $scope.trainingTemplates = [];
                profileTrainingManager.getTrainingTemplatesBySkill($scope.newTraining.skillId).then(function (data) {
                    $scope.trainingTemplates = data;
                    $("#presetTrainingTemplateModal").modal("show");
                });

            }
            $scope.addNewTraining = function () {
                var item = angular.copy($scope.newTraining);
                var sd = kendo.parseDate(item.startDate);
                var ed = kendo.parseDate(item.endDate);
                item.startDate = sd;
                item.endDate = ed;
                if (item.id > 0) {
                    profileTrainingManager.updateTraining(item).then(function (data) {
                        if (data) {
                            _.each($scope.profile.performanceGroups, function (item) {
                                if (item.id == $scope.newTraining.performanceGroupId) {
                                    _.each(item.link_PerformanceGroupSkills, function (pgSkillItem) {
                                        if (pgSkillItem.skillId == $scope.newTraining.skillId) {
                                            _.each(pgSkillItem.trainings, function (trainingItem) {
                                                trainingItem = $scope.newTraining;
                                            });
                                        }
                                    });
                                }
                            });
                            dialogService.showNotification($translate.instant('MYPROFILES_TRAINING_SAVED_SUCCESSFULLY'), 'info')
                        }
                        else {
                            dialogService.showNotification($translate.instant('MYPROJECTS_PROJECTPROFILES_SAVE_FAILED'), 'warning');
                        }

                    }, function (error) {
                        dialogService.showNotification(error, "warning");
                    });
                }
                else {
                    var skill = null;
                    var skill = _.find($scope.pgSkills, function (skillItem) {
                        return skillItem.skillId == $scope.newTraining.skillId;
                    });
                    if (skill.skill1) {
                        item.skills = [skill.skill1];
                        item.skill = skill.skill1;
                        item.skillId = skill.skill1.id;
                        item.skillName = skill.skill1.name;
                    } else if (skill.subSkill) {
                        item.skills = [skill.subSkill];
                        item.skill = skill.subSkill;
                        item.skillId = skill.subSkill.id;
                        item.skillName = skill.subSkill.name;
                    } else {
                        item.skills = [skill.skill];
                        item.skill = skill.skill;
                        item.skillId = skill.skill.id;
                        item.skillName = skill.skill.name;
                    }

                    profileTrainingManager.addNewTraining(item).then(function (data) {
                        item.id = data.id;
                        $scope.newTraining.id = item.id;

                        if (item.id > 0) {

                            var trainingIds = [];
                            trainingIds.push({ trainingId: item.id, skillId: $scope.newTraining.skillId });

                            profileTrainingManager.SetPerformanceGroupTraining($scope.newTraining.performanceGroupId, trainingIds).then(function (data) {
                                if (data) {
                                    _.each($scope.profile.performanceGroups, function (item) {
                                        if (item.id == $scope.newTraining.performanceGroupId) {
                                            _.each(item.link_PerformanceGroupSkills, function (pgSkillItem) {
                                                if (pgSkillItem.skillId == $scope.newTraining.skillId) {
                                                    pgSkillItem.trainings.push($scope.newTraining);
                                                }
                                            });
                                        }
                                    });

                                    dialogService.showNotification($translate.instant('MYPROFILES_TRAINING_SAVED_SUCCESSFULLY'), 'info');
                                }
                            });



                            //$state.go('^');
                        } else {
                            dialogService.showNotification($translate.instant('MYPROJECTS_PROJECTPROFILES_SAVE_FAILED'), 'warning');
                        }
                    }, function (error) {
                        dialogService.showNotification(error, "warning");
                    });
                }
            }

            $scope.viewTrainingTemplate = function (trainingId) {
                var trainingTemplate = _.find($scope.trainingTemplates, function (trainingTemplateItem) {
                    return trainingTemplateItem.id == trainingId;
                });
                if (trainingTemplate) {
                    var newTraining = {
                        id: trainingTemplate.id,
                        name: trainingTemplate.name,
                        typeId: trainingTemplate.typeId,
                        levelId: trainingTemplate.levelId,
                        why: trainingTemplate.why,
                        what: trainingTemplate.what,
                        how: trainingTemplate.how,
                        additionalInfo: trainingTemplate.additionalInfo,
                        duration: trainingTemplate.duration,
                        durationMetricId: trainingTemplate.durationMetricId,
                        frequency: trainingTemplate.frequency,
                        howMany: trainingTemplate.howMany,
                        exerciseMetricId: trainingTemplate.exerciseMetricId,
                        howManySets: trainingTemplate.howManySets,
                        howManyActions: trainingTemplate.howManyActions,
                        organizationId: $scope.currentUser.organizationId,
                        trainingMaterial: { id: 0, name: "", description: "", title: "", materialType: "", resourceType: "" },
                        trainingMaterials: new kendo.data.ObservableArray([]),
                        userId: $scope.currentUser.userId,
                        skillId: $scope.newTraining.skillId,
                        notificationTemplateId: trainingTemplate.notificationTemplateId,
                        isNotificationByEmail: trainingTemplate.isNotificationByEmail,
                        emailNotificationIntervalId: trainingTemplate.emailNotificationIntervalId,
                        emailBefore: trainingTemplate.emailBefore,
                        isNotificationBySMS: trainingTemplate.isNotificationBySMS,
                        smsNotificationIntervalId: trainingTemplate.smsNotificationIntervalId,
                    }
                    _.each(trainingTemplate.trainingMaterials, function (item, index) {
                        newTraining.trainingMaterials.push(item);
                    });
                    $scope.viewTraining = newTraining;
                    $("#viewpresetTrainingTemplateModal").modal("show");
                }
            }
            $scope.viewTrainingTemplateTrainingMaterials = function (trainingId) {
                var trainingTemplate = _.find($scope.trainingTemplates, function (trainingTemplateItem) {
                    return trainingTemplateItem.id == trainingId;
                });
                if (trainingTemplate) {
                    $scope.trainingMaterials = [];
                    _.each(trainingTemplate.trainingMaterials, function (item, index) {
                        $scope.trainingMaterials.push(item);
                    });
                    $("#viewTrainingTemplateTrainingMaterials").modal("show");
                    if ($("#training-material").hasClass("cbp-caption-active")) {
                        $("#training-material").cubeportfolio('destroy');
                    }
                    setTimeout(function () {
                        $("#training-material").cubeportfolio({
                            filters: "#training-material-filters",
                            layoutMode: "grid",
                            defaultFilter: "*",
                            animationType: "quicksand",
                            gapHorizontal: 35,
                            gapVertical: 30,
                            gridAdjustment: "responsive",
                            mediaQueries: [{
                                width: 1500,
                                cols: 5
                            }, {
                                width: 1100,
                                cols: 4
                            }, {
                                width: 800,
                                cols: 3
                            }, {
                                width: 480,
                                cols: 2
                            }, {
                                width: 320,
                                cols: 1
                            }],
                            caption: "overlayBottomReveal",
                            displayType: "sequentially",
                            displayTypeSpeed: 80,
                            lightboxDelegate: ".cbp-lightbox",
                            lightboxGallery: !0,
                            lightboxTitleSrc: "data-title",
                            lightboxCounter: '<div class="cbp-popup-lightbox-counter">{{current}} of {{total}}</div>',
                            singlePageDelegate: ".cbp-singlePage",
                            singlePageDeeplinking: !0,
                            singlePageStickyNavigation: !0,
                            singlePageCounter: '<div class="cbp-popup-singlePage-counter">{{current}} of {{total}}</div>',
                            singlePageCallback: function (i, t) {
                                var l = this;
                                if ($(t).data("link")) {
                                    i = $(t).data("link");
                                }
                                i = decodeURIComponent(i);
                                if (i.indexOf("youtube") > -1) {
                                    var v = getParameterByName(i, 'v');
                                    i = "https://www.youtube.com/embed/" + v;
                                }

                                var IsInsecureLink = false;
                                if (i.indexOf("https") == -1) {
                                    IsInsecureLink = true;
                                }

                                $scope.materialInfo = _.find($scope.trainingMaterials, function (info) {
                                    return t.id == info.id;
                                });
                                //var training = null;

                                if ($scope.materialInfo) {
                                    $scope.materialInfo["skill"] = "";
                                    $scope.materialInfo["skillDescription"] = "";
                                    $scope.materialInfo.link = i;
                                    $scope.materialInfo.IsInsecureLink = IsInsecureLink;
                                    if ($scope.newTraining.skillId) {
                                        var skill = _.find($scope.pgSkills, function (item) {
                                            return item.skillId == $scope.newTraining.skillId;
                                        })
                                        if (skill) {
                                            $scope.materialInfo["skill"] = skill.name;
                                            $scope.materialInfo["skillDescription"] = skill.description;
                                        }
                                    }

                                    var compiledeHTML = $compile("<training-template-material-popup material-info='materialInfo'></training-template-material-popup>")($scope);
                                    l.updateSinglePage(compiledeHTML);
                                }
                                else {
                                    l.updateSinglePage("<div>There is something wrong!!</div>");
                                }
                            }
                        });
                    }, 500);
                }
            }
            function getParameterByName(url, name) {
                var match = RegExp('[?&]' + name + '=([^&]*)').exec(url);
                return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
            }
            $scope.trainingMaterialClass = function (type) {
                //{ { :  : material.materialType == 'Image' ? (material.name.length > 0 ? getLink(material.name) : material.link) : 'images/url.png' } }
                if (type == "Video") {
                    return "tm-video";
                }
                else if (type == "Document") {
                    return "tm-document";
                }
                else if (type == "Audio") {
                    return "tm-audio";
                }
                else if (type == "Image") {
                    return "tm-image";
                }
                else {
                    return "tm-link";
                }
            }

            $scope.selectTrainingTemplate = function (trainingId) {
                var trainingTemplate = _.find($scope.trainingTemplates, function (trainingTemplateItem) {
                    return trainingTemplateItem.id == trainingId;
                })
                if (trainingTemplate) {
                    var newTraining = {
                        id: 0,
                        name: $scope.newTraining.name,
                        typeId: trainingTemplate.typeId,
                        levelId: trainingTemplate.levelId,
                        why: trainingTemplate.why,
                        what: trainingTemplate.what,
                        how: trainingTemplate.how,
                        additionalInfo: trainingTemplate.additionalInfo,
                        startDate: $scope.newTraining.startDate,
                        endDate: $scope.newTraining.endDate,
                        duration: trainingTemplate.duration ? trainingTemplate.duration : 30,
                        durationMetricId: trainingTemplate.durationMetricId ? trainingTemplate.durationMetricId : ($scope.defaultDurationMetric ? $scope.defaultDurationMetric.id : null),
                        frequency: "FREQ=WEEKLY;BYDAY=WE",
                        howMany: trainingTemplate.howMany ? trainingTemplate.howMany : 1,
                        exerciseMetricId: trainingTemplate.exerciseMetricId,
                        howManySets: trainingTemplate.howManySets ? trainingTemplate.howManySets : 1,
                        howManyActions: trainingTemplate.howManyActions ? trainingTemplate.howManyActions : 1,
                        isActive: true,
                        organizationId: $scope.currentUser.organizationId,
                        trainingMaterial: { id: 0, name: "", description: "", title: "", materialType: "", resourceType: "" },
                        trainingMaterials: new kendo.data.ObservableArray([]),
                        userId: $scope.currentUser.userId,
                        skillId: $scope.newTraining.skillId,
                        notificationTemplateId: trainingTemplate.notificationTemplateId,
                        isNotificationByEmail: true,
                        emailNotificationIntervalId: trainingTemplate.emailNotificationIntervalId,
                        emailBefore: null,
                        isNotificationBySMS: false,
                        smsNotificationIntervalId: null,
                        performanceGroupId: $scope.newTraining.performanceGroupId,
                    }
                    _.each(trainingTemplate.trainingMaterials, function (item, index) {
                        item.id = (index + 1) * -1
                        newTraining.trainingMaterials.push(item);
                    });
                    $scope.newTraining = newTraining;
                    $("#viewpresetTrainingTemplateModal").modal("hide");
                    $("#presetTrainingTemplateModal").modal("hide");
                }
            }

            $scope.showError = function () {
                dialogService.showNotification($translate.instant('MYPROJECTS_PROJECTPROFILES_SOMETHING_WENT_WRONG'), "error");
            }
            $scope.openLink = function (link) {
                var win = window.open(link);
                win.focus();
            };
            $scope.removeTraining = function (performanceGroupId, trainingId) {
                profileTrainingManager.checkTrainingInUse(trainingId).then(function (data) {
                    if (data) {
                        dialogService.showYesNoDialog($translate.instant('COMMON_CONFIRM'), $translate.instant('COMMON_ARE_YOU_SURE_YOU_WANT_TO_DELETE')).then(
                            function () {

                                profileTrainingManager.removeTraining(trainingId).then(function (data) {
                                    if (data) {
                                        _.each($scope.profile.performanceGroups, function (item) {
                                            if (item.id == performanceGroupId) {
                                                _.each(item.link_PerformanceGroupSkills, function (skillItem) {

                                                    var index = _.findIndex(skillItem.trainings, function (trainingItem) {
                                                        return trainingItem.id == trainingId;
                                                    })
                                                    if (index > -1) {
                                                        skillItem.trainings.splice(index, 1);
                                                        dialogService.showNotification($translate.instant('MYPROJECTS_PROJECTPROFILES_TRAINING_REMOVED_SUCESSFULLY'), 'success');
                                                    }

                                                })
                                            }
                                        });
                                    }
                                }, function (message) {
                                    dialogService.showNotification($translate.instant('MYPROJECTS_PROJECTPROFILES_TRAINING_CANNOT_BE_REMOVED') + message, 'error');
                                });
                            },
                            function () {
                                //alert('No clicked');
                            });
                    }
                }, function (message) {
                    dialogService.showNotification($translate.instant('MYPROJECTS_PROJECTPROFILES_TRAINING_CANNOT_BE_REMOVED') + message, 'error');
                });

            };


            $scope.openAddReason = function () {
                $("#AddReasonModal").modal('show');
            }
            $scope.checkAll = false;
            $scope.selectAllDescription = function () {
                $scope.checkAll = !$scope.checkAll;
                if ($scope.checkAll) {
                    _.each($scope.reasonDescriptions, function (item) {
                        item.isChecked = true;
                    });
                }
                else {
                    _.each($scope.reasonDescriptions, function (item) {
                        item.isChecked = false;
                    });
                }

            }
            $scope.addWhyReasons = function () {
                $scope.checkAll = false;
                $scope.selectedReasons = [];
                $scope.reasonDescriptions = [];
                var skillId = $scope.newTraining.skillId;
                if (skillId) {
                    profileTrainingManager.getReasonDescriptions(skillId).then(function (data) {
                        $scope.reasonDescriptions = _.filter(data, function (item) {
                            item["isChecked"] = false;
                            return item.descriptionType == 0;
                        });

                    });
                    $scope.trainingDescription = {
                        id: 0,
                        descriptionType: 0,
                        description: "",
                        skillId: skillId
                    }
                    $("#DescriptionReasonModal").modal('show');
                } else {
                    dialogService.showNotification($translate.instant('MYPROJECTS_PROJECTPROFILES_PLEASE_SELECT_THE_SKILL'), "warning");
                }
            }

            $scope.addWhatReasons = function () {
                $scope.checkAll = false;
                $scope.selectedReasons = [];
                $scope.reasonDescriptions = [];
                var skillId = $scope.newTraining.skillId;
                if (skillId) {
                    profileTrainingManager.getReasonDescriptions(skillId).then(function (data) {
                        $scope.reasonDescriptions = _.filter(data, function (item) {
                            item["isChecked"] = false;
                            return item.descriptionType == 1;
                        });

                    });
                    $scope.trainingDescription = {
                        id: 0,
                        descriptionType: 1,
                        description: "",
                        skillId: skillId
                    }
                    $("#DescriptionReasonModal").modal('show');




                } else {
                    dialogService.showNotification($translate.instant('MYPROJECTS_PROJECTPROFILES_PLEASE_SELECT_THE_SKILL'), "warning");
                }
            }

            $scope.addHowReasons = function () {
                $scope.checkAll = false;
                $scope.selectedReasons = [];
                $scope.reasonDescriptions = [];
                var skillId = $scope.newTraining.skillId;
                if (skillId) {
                    profileTrainingManager.getReasonDescriptions(skillId).then(function (data) {
                        $scope.reasonDescriptions = _.filter(data, function (item) {
                            item["isChecked"] = false;
                            return item.descriptionType == 2;
                        });
                    });
                    $scope.trainingDescription = {
                        id: 0,
                        descriptionType: 2,
                        description: "",
                        skillId: skillId
                    }

                    $("#DescriptionReasonModal").modal('show');


                } else {
                    dialogService.showNotification($translate.instant('MYPROJECTS_PROJECTPROFILES_PLEASE_SELECT_THE_SKILL'), "warning");
                }
            }

            $scope.addSelectedDescriptions = function () {

                $scope.selectedReasons = _.filter($scope.reasonDescriptions, function (dataItem) {
                    return dataItem.isChecked == true;
                })
                if ($scope.trainingDescription.descriptionType == 0) {
                    var why = [$scope.newTraining.why]
                    _.each($scope.selectedReasons, function (item) {
                        why.push(item.description);
                    })
                    $scope.newTraining.why = why.join(',')
                }
                if ($scope.trainingDescription.descriptionType == 1) {
                    var what = [$scope.newTraining.what]
                    _.each($scope.selectedReasons, function (item) {
                        what.push(item.description);
                    })
                    $scope.newTraining.what = what.join(',');

                }
                if ($scope.trainingDescription.descriptionType == 2) {
                    var how = [$scope.newTraining.how]
                    _.each($scope.selectedReasons, function (item) {
                        how.push(item.description);
                    })
                    $scope.newTraining.how = how.join(',');
                }
                $("#DescriptionReasonModal").modal('hide');
            }

            $scope.addNewReason = function () {
                profileTrainingManager.addNewReason($scope.trainingDescription).then(function (data) {
                    if (data) {
                        $scope.trainingDescription.id = data;
                        $scope.reasonDescriptions.push($scope.trainingDescription);
                        $("#AddReasonModal").modal('hide');
                    }
                })
            }

            // End 

            $scope.StartDateOpen = function (event) {
                var datepicker = $(event.sender.element).data("kendoDateTimePicker");
                datepicker.setOptions({
                    min: new Date(moment({ hour: 0, minute: -1, seconds: 0, milliseconds: 0 })._d)
                });
            }
            $scope.StartDateChange = function () {
                if (!(kendo.parseDate($scope.newTraining.startDate) > kendo.parseDate($scope.newTraining.endDate))) {
                    $scope.newTraining.endDate = "";
                }
            };
            $scope.EndDateOpen = function (event) {
                var datepicker = $(event.sender.element).data("kendoDateTimePicker")
                datepicker.setOptions({
                    min: new Date(moment({ hour: 0, minute: 0, seconds: 0, milliseconds: 0 })._d)
                });

            };

            //Send Out
            $scope.sendOutTotalDiffrence = {
                months: 0,
                weeks: 0,
                days: 0,
                hours: 0,
                minutes: 0,
            }
            $scope.StageGroupStartDateOpen = function (event) {
                var datepicker = $(event.sender.element).data("kendoDateTimePicker");
                datepicker.setOptions({
                    min: kendo.parseDate($scope.projectInfo.expectedStartDate)
                });
            }
            $scope.StageGroupStartDateChange = function (event) {
                if (!(kendo.parseDate($scope.newTraining.startDate) > kendo.parseDate($scope.stageGroup.endDate))) {
                    $scope.stageGroup.endDate = "";
                }
                else {
                    var diffTime = null;
                    var a = moment(kendo.parseDate($scope.stageGroup.endDate));
                    var b = moment(kendo.parseDate($scope.stageGroup.startDate));
                    diffTime = a.diff(b);
                    if ($scope.profile.profileTypeId == profileTypeEnum.Soft) {
                        var duration = moment.duration(diffTime);
                        $scope.sendOutTotalDiffrence = {
                            months: duration.months(),
                            weeks: duration.weeks(),
                            days: duration.days(),
                            hours: duration.hours(),
                            minutes: duration.minutes(),
                        }
                        if (duration.years() > 0) {
                            $scope.sendOutTotalDiffrence.months = $scope.sendOutTotalDiffrence.months + (duration.years() * 12);
                        }
                        diffTime = a.diff(b) / 5 // 1
                    }
                    duration = moment.duration(diffTime);
                    $scope.stageGroup.monthsSpan = duration.months();
                    $scope.stageGroup.weeksSpan = duration.weeks();
                    $scope.stageGroup.daysSpan = duration.days();
                    if ($scope.stageGroup.weeksSpan > 0) {
                        $scope.stageGroup.daysSpan = $scope.stageGroup.daysSpan - ($scope.stageGroup.weeksSpan * 7);
                    }
                    $scope.stageGroup.hoursSpan = duration.hours();
                    $scope.stageGroup.minutesSpan = duration.minutes();
                }
            };
            $scope.StageGroupEndDateOpen = function (event) {
                var datepicker = $(event.sender.element).data("kendoDateTimePicker")
                datepicker.setOptions({
                    min: new Date(moment({ hour: 0, minute: 0, seconds: 0, milliseconds: 0 })._d),
                    max: kendo.parseDate($scope.projectInfo.expectedEndDate)
                });
            };

            $scope.StageGroupEndDateChange = function () {
                var diffTime = null;
                var a = moment(kendo.parseDate($scope.stageGroup.endDate));
                var b = moment(kendo.parseDate($scope.stageGroup.startDate));
                diffTime = a.diff(b);
                if ($scope.profile.profileTypeId == profileTypeEnum.Soft) {
                    var duration = moment.duration(diffTime);
                    $scope.sendOutTotalDiffrence = {
                        months: duration.months(),
                        weeks: duration.weeks(),
                        days: duration.days(),
                        hours: duration.hours(),
                        minutes: duration.minutes(),
                    }
                    if (duration.years() > 0) {
                        $scope.sendOutTotalDiffrence.months = $scope.sendOutTotalDiffrence.months + (duration.years() * 12);
                    }
                    diffTime = a.diff(b) / 5 // 1
                }
                duration = moment.duration(diffTime);
                $scope.stageGroup.monthsSpan = duration.months();
                $scope.stageGroup.weeksSpan = duration.weeks();
                $scope.stageGroup.daysSpan = duration.days();
                if ($scope.stageGroup.weeksSpan > 0) {
                    $scope.stageGroup.daysSpan = $scope.stageGroup.daysSpan - ($scope.stageGroup.weeksSpan * 7);
                }
                $scope.stageGroup.hoursSpan = duration.hours();
                $scope.stageGroup.minutesSpan = duration.minutes();
            };
            $scope.openNewSendOutModal = function () {

                $scope.stageGroup = {
                    id: 0,
                    name: $scope.projectInfo.name,
                    description: $scope.projectInfo.summary,
                    startDate: moment(kendo.parseDate($scope.projectInfo.expectedStartDate)).format('L LT'),
                    endDate: moment(kendo.parseDate($scope.projectInfo.expectedEndDate)).format('L LT'),
                    parentStageGroupId: null,
                    parentParticipantId: null,
                    monthsSpan: 0,
                    weeksSpan: 6,
                    daysSpan: 0,
                    hoursSpan: 0,
                    minutesSpan: 0,
                    totalMilestones: 5,
                    stages: [],
                }

                if ($scope.profileType == profileTypeEnum.Knowledge) {
                    var globalSetting = null;
                    if ($scope.projectInfo.projectGlobalSettings.length > 0) {
                        globalSetting = $scope.projectInfo.projectGlobalSettings[0]
                    }
                    if (globalSetting) {
                        $scope.stageGroup.monthsSpan = globalSetting.knowledgeProfileMonthSpan;
                        $scope.stageGroup.weeksSpan = globalSetting.knowledgeProfileWeekSpan;
                        $scope.stageGroup.daysSpan = globalSetting.knowledgeProfileDaySpan;
                        $scope.stageGroup.hoursSpan = globalSetting.knowledgeProfileHourSpan;
                        $scope.stageGroup.minutesSpan = globalSetting.knowledgeProfileMinuteSpan;
                    }
                    else {
                        var diffTime = null;
                        var a = moment(kendo.parseDate($scope.projectInfo.expectedEndDate));
                        var b = moment(kendo.parseDate($scope.projectInfo.expectedStartDate));
                        diffTime = a.diff(b);
                        if ($scope.profile.profileTypeId == profileTypeEnum.Soft) {
                            var duration = moment.duration(diffTime);
                            $scope.sendOutTotalDiffrence = {
                                months: duration.months(),
                                weeks: duration.weeks(),
                                days: duration.days(),
                                hours: duration.hours(),
                                minutes: duration.minutes(),
                            }
                            if (duration.years() > 0) {
                                $scope.sendOutTotalDiffrence.months = $scope.sendOutTotalDiffrence.months + (duration.years() * 12);
                            }
                            diffTime = a.diff(b) / 5 // 1
                        }
                        duration = moment.duration(diffTime);
                        $scope.stageGroup.monthsSpan = duration.months();
                        $scope.stageGroup.weeksSpan = duration.weeks();
                        $scope.stageGroup.daysSpan = duration.days();
                        if ($scope.stageGroup.weeksSpan > 0) {
                            $scope.stageGroup.daysSpan = $scope.stageGroup.daysSpan - ($scope.stageGroup.weeksSpan * 7);
                        }
                        $scope.stageGroup.hoursSpan = duration.hours();
                        $scope.stageGroup.minutesSpan = duration.minutes();
                    }
                }
                $("#stageGroupModal").modal("show");
            }
            $scope.openEditSendOutModal = function (stageGroupId) {
                var stageGroup = _.find($scope.profile.stageGroups, function (stageGroupItem) {
                    return stageGroupItem.id == stageGroupId;
                });
                if (stageGroup) {
                    $scope.stageGroup = angular.copy(stageGroup);
                }
                $("#stageGroupModal").modal("show");

            }
            $scope.statusOfStages = [];
            $scope.fpStatusOfStages = [];
            $scope.addNewStageGroup = function () {
                if ($scope.formStageGroup.$valid) {

                    if ($scope.stageGroup.id == 0) {
                        $scope.stageGroup.id = ($scope.profile.stageGroups.length + 1) * -1;
                        var profile = angular.copy($scope.profile);
                        profile.stageGroups = [];
                        $scope.stageGroup["profiles"] = [profile];
                        var stageGroup = _.clone($scope.stageGroup);
                        stageGroup.startDate = kendo.parseDate(stageGroup.startDate);
                        stageGroup.endDate = kendo.parseDate(stageGroup.endDate);
                        apiService.add('stageGroups', stageGroup).then(function (data) {
                            $scope.stageGroup.id = data;
                            dialogService.showNotification($translate.instant('MYPROJECTS_PROJECTPROFILES_SEND_OUT_SETTING_ADDED_SUCCESSFULLY'), "successs");

                            apiService.getAll("stagegroups/" + $scope.stageGroup.id + "/allstages").then(function (stagesdata) {
                                _.each(stagesdata, function (stageItem, index) {
                                    if ($scope.profileType == profileTypeEnum.Knowledge) {
                                        var globalSetting = null;
                                        if ($scope.projectInfo.projectGlobalSettings.length > 0) {
                                            globalSetting = $scope.projectInfo.projectGlobalSettings[0]
                                        }
                                        if (globalSetting) {
                                            stageItem.startDateTime = moment(kendo.parseDate(globalSetting.knowledgeProfileStartDate)).format('L LT')
                                            stageItem.endDateTime = moment(kendo.parseDate(globalSetting.knowledgeProfileEndDate)).format('L LT')
                                            stageItem.greenAlarmTime = moment(kendo.parseDate(globalSetting.knowledgeProfileGreenAlarmTime)).format('L LT')
                                            stageItem.yellowAlarmTime = moment(kendo.parseDate(globalSetting.knowledgeProfileYellowAlarmTime)).format('L LT')
                                            stageItem.redAlarmTime = moment(kendo.parseDate(globalSetting.knowledgeProfileRedAlarmTime)).format('L LT')
                                            stageItem.managerId = globalSetting.managerId;
                                            stageItem.trainerId = globalSetting.trainerId;

                                            stageItem.externalStartNotificationTemplateId = globalSetting.knowledgeProfileExternalStartNotificationTemplateId;
                                            stageItem.externalCompletedNotificationTemplateId = globalSetting.knowledgeProfileExternalCompletedNotificationTemplateId;
                                            stageItem.externalResultsNotificationTemplateId = globalSetting.knowledgeProfileExternalResultsNotificationTemplateId;
                                            stageItem.evaluatorStartNotificationTemplateId = globalSetting.knowledgeProfileEvaluatorStartNotificationTemplateId;
                                            stageItem.evaluatorCompletedNotificationTemplateId = globalSetting.knowledgeProfileEvaluatorCompletedNotificationTemplateId;
                                            stageItem.evaluatorResultsNotificationTemplateId = globalSetting.knowledgeProfileEvaluatorResultsNotificationTemplateId;
                                            stageItem.trainerStartNotificationTemplateId = globalSetting.knowledgeProfileTrainerStartNotificationTemplateId;
                                            stageItem.trainerCompletedNotificationTemplateId = globalSetting.knowledgeProfileTrainerCompletedNotificationTemplateId;
                                            stageItem.trainerResultsNotificationTemplateId = globalSetting.knowledgeProfileTrainerResultsNotificationTemplateId;
                                            stageItem.managerStartNotificationTemplateId = globalSetting.knowledgeProfileManagerStartNotificationTemplateId;
                                            stageItem.managerCompletedNotificationTemplateId = globalSetting.knowledgeProfileManagerCompletedNotificationTemplateId;
                                            stageItem.managerResultsNotificationTemplateId = globalSetting.knowledgeProfileManagerResultsNotificationTemplateId;

                                        }
                                        else {
                                            stageItem.startDateTime = moment(kendo.parseDate(stageItem.startDateTime)).format('L LT')
                                            stageItem.endDateTime = moment(kendo.parseDate(stageItem.endDateTime)).format('L LT')
                                            stageItem.greenAlarmTime = moment(kendo.parseDate(stageItem.greenAlarmTime)).format('L LT')
                                            stageItem.yellowAlarmTime = moment(kendo.parseDate(stageItem.yellowAlarmTime)).format('L LT')
                                            stageItem.redAlarmTime = moment(kendo.parseDate(stageItem.redAlarmTime)).format('L LT')

                                        }
                                    }
                                    else if ($scope.profileType == profileTypeEnum.Soft) {
                                        var globalSetting = null;
                                        if ($scope.projectInfo.projectGlobalSettings.length > 0) {
                                            globalSetting = $scope.projectInfo.projectGlobalSettings[0]
                                        }
                                        if (globalSetting) {
                                            stageItem.managerId = globalSetting.managerId;
                                            stageItem.trainerId = globalSetting.trainerId;
                                            if (index == 0) {
                                                stageItem.emailNotification = globalSetting.softProfileStartEmailNotification;
                                                stageItem.smsNotification = globalSetting.softProfileStartSmsNotification;

                                                stageItem.startDateTime = moment(kendo.parseDate(globalSetting.startStageStartDate)).format('L LT')
                                                stageItem.endDateTime = moment(kendo.parseDate(globalSetting.startStageEndDate)).format('L LT')
                                                stageItem.greenAlarmTime = moment(kendo.parseDate(globalSetting.softProfileStartGreenAlarmTime)).format('L LT')
                                                stageItem.yellowAlarmTime = moment(kendo.parseDate(globalSetting.softProfileStartYellowAlarmTime)).format('L LT')
                                                stageItem.redAlarmTime = moment(kendo.parseDate(globalSetting.softProfileStartRedAlarmTime)).format('L LT')

                                                stageItem.externalStartNotificationTemplateId = globalSetting.softProfileStartExternalStartNotificationTemplateId;
                                                stageItem.externalCompletedNotificationTemplateId = globalSetting.softProfileStartExternalCompletedNotificationTemplateId;
                                                stageItem.externalResultsNotificationTemplateId = globalSetting.softProfileStartExternalResultsNotificationTemplateId;
                                                stageItem.evaluatorStartNotificationTemplateId = globalSetting.softProfileStartEvaluatorStartNotificationTemplateId;
                                                stageItem.evaluatorCompletedNotificationTemplateId = globalSetting.softProfileStartEvaluatorCompletedNotificationTemplateId;
                                                stageItem.evaluatorResultsNotificationTemplateId = globalSetting.softProfileStartEvaluatorResultsNotificationTemplateId;
                                                stageItem.trainerStartNotificationTemplateId = globalSetting.softProfileStartTrainerStartNotificationTemplateId;
                                                stageItem.trainerCompletedNotificationTemplateId = globalSetting.softProfileStartTrainerCompletedNotificationTemplateId;
                                                stageItem.trainerResultsNotificationTemplateId = globalSetting.softProfileStartTrainerResultsNotificationTemplateId;
                                                stageItem.managerStartNotificationTemplateId = globalSetting.softProfileStartManagerStartNotificationTemplateId;
                                                stageItem.managerCompletedNotificationTemplateId = globalSetting.softProfileStartManagerCompletedNotificationTemplateId;
                                                stageItem.managerResultsNotificationTemplateId = globalSetting.softProfileStartManagerResultsNotificationTemplateId;

                                                stageItem.greenAlarmParticipantTemplateId = globalSetting.softProfileStartGreenAlarmParticipantTemplateId;
                                                stageItem.greenAlarmEvaluatorTemplateId = globalSetting.softProfileStartGreenAlarmEvaluatorTemplateId;
                                                stageItem.greenAlarmManagerTemplateId = globalSetting.softProfileStartGreenAlarmManagerTemplateId;
                                                stageItem.greenAlarmTrainerTemplateId = globalSetting.softProfileStartGreenAlarmTrainerTemplateId;
                                                stageItem.yellowAlarmParticipantTemplateId = globalSetting.softProfileStartYellowAlarmParticipantTemplateId;
                                                stageItem.yellowAlarmEvaluatorTemplateId = globalSetting.softProfileStartYellowAlarmEvaluatorTemplateId;
                                                stageItem.yellowAlarmManagerTemplateId = globalSetting.softProfileStartYellowAlarmManagerTemplateId;
                                                stageItem.yellowAlarmTrainerTemplateId = globalSetting.softProfileStartYellowAlarmTrainerTemplateId;
                                                stageItem.redAlarmParticipantTemplateId = globalSetting.softProfileStartRedAlarmParticipantTemplateId;
                                                stageItem.redAlarmEvaluatorTemplateId = globalSetting.softProfileStartRedAlarmEvaluatorTemplateId;
                                                stageItem.redAlarmManagerTemplateId = globalSetting.softProfileStartRedAlarmManagerTemplateId;
                                                stageItem.redAlarmTrainerTemplateId = globalSetting.softProfileStartRedAlarmTrainerTemplateId;



                                            }
                                            if (index == 1) {

                                                stageItem.emailNotification = globalSetting.softProfileShortGoalEmailNotification;
                                                stageItem.smsNotification = globalSetting.softProfileShortGoalSmsNotification;

                                                stageItem.startDateTime = moment(kendo.parseDate(globalSetting.shortGoalStartDate)).format('L LT')
                                                stageItem.endDateTime = moment(kendo.parseDate(globalSetting.shortGoalEndDate)).format('L LT')
                                                stageItem.greenAlarmTime = moment(kendo.parseDate(globalSetting.softProfileShortGoalGreenAlarmTime)).format('L LT')
                                                stageItem.yellowAlarmTime = moment(kendo.parseDate(globalSetting.softProfileShortGoalYellowAlarmTime)).format('L LT')
                                                stageItem.redAlarmTime = moment(kendo.parseDate(globalSetting.softProfileShortGoalRedAlarmTime)).format('L LT')

                                                stageItem.externalStartNotificationTemplateId = globalSetting.softProfileShortGoalExternalStartNotificationTemplateId;
                                                stageItem.externalCompletedNotificationTemplateId = globalSetting.softProfileShortGoalExternalCompletedNotificationTemplateId;
                                                stageItem.externalResultsNotificationTemplateId = globalSetting.softProfileShortGoalExternalResultsNotificationTemplateId;
                                                stageItem.evaluatorStartNotificationTemplateId = globalSetting.softProfileShortGoalEvaluatorStartNotificationTemplateId;
                                                stageItem.evaluatorCompletedNotificationTemplateId = globalSetting.softProfileShortGoalEvaluatorCompletedNotificationTemplateId;
                                                stageItem.evaluatorResultsNotificationTemplateId = globalSetting.softProfileShortGoalEvaluatorResultsNotificationTemplateId;
                                                stageItem.trainerStartNotificationTemplateId = globalSetting.softProfileShortGoalTrainerStartNotificationTemplateId;
                                                stageItem.trainerCompletedNotificationTemplateId = globalSetting.softProfileShortGoalTrainerCompletedNotificationTemplateId;
                                                stageItem.trainerResultsNotificationTemplateId = globalSetting.softProfileShortGoalTrainerResultsNotificationTemplateId;
                                                stageItem.managerStartNotificationTemplateId = globalSetting.softProfileShortGoalManagerStartNotificationTemplateId;
                                                stageItem.managerCompletedNotificationTemplateId = globalSetting.softProfileShortGoalManagerCompletedNotificationTemplateId;
                                                stageItem.managerResultsNotificationTemplateId = globalSetting.softProfileShortGoalManagerResultsNotificationTemplateId;

                                                stageItem.greenAlarmParticipantTemplateId = globalSetting.softProfileShortGoalGreenAlarmParticipantTemplateId;
                                                stageItem.greenAlarmEvaluatorTemplateId = globalSetting.softProfileShortGoalGreenAlarmEvaluatorTemplateId;
                                                stageItem.greenAlarmManagerTemplateId = globalSetting.softProfileShortGoalGreenAlarmManagerTemplateId;
                                                stageItem.greenAlarmTrainerTemplateId = globalSetting.softProfileShortGoalGreenAlarmTrainerTemplateId;
                                                stageItem.yellowAlarmParticipantTemplateId = globalSetting.softProfileShortGoalYellowAlarmParticipantTemplateId;
                                                stageItem.yellowAlarmEvaluatorTemplateId = globalSetting.softProfileShortGoalYellowAlarmEvaluatorTemplateId;
                                                stageItem.yellowAlarmManagerTemplateId = globalSetting.softProfileShortGoalYellowAlarmManagerTemplateId;
                                                stageItem.yellowAlarmTrainerTemplateId = globalSetting.softProfileShortGoalYellowAlarmTrainerTemplateId;
                                                stageItem.redAlarmParticipantTemplateId = globalSetting.softProfileShortGoalRedAlarmParticipantTemplateId;
                                                stageItem.redAlarmEvaluatorTemplateId = globalSetting.softProfileShortGoalRedAlarmEvaluatorTemplateId;
                                                stageItem.redAlarmManagerTemplateId = globalSetting.softProfileShortGoalRedAlarmManagerTemplateId;
                                                stageItem.redAlarmTrainerTemplateId = globalSetting.softProfileShortGoalRedAlarmTrainerTemplateId;

                                            }
                                            if (index == 2) {

                                                stageItem.emailNotification = globalSetting.softProfileMidGoalEmailNotification;
                                                stageItem.smsNotification = globalSetting.softProfileMidGoalSmsNotification;

                                                stageItem.startDateTime = moment(kendo.parseDate(globalSetting.midGoalStartDate)).format('L LT')
                                                stageItem.endDateTime = moment(kendo.parseDate(globalSetting.midGoalEndDate)).format('L LT')
                                                stageItem.greenAlarmTime = moment(kendo.parseDate(globalSetting.softProfileMidGoalGreenAlarmTime)).format('L LT')
                                                stageItem.yellowAlarmTime = moment(kendo.parseDate(globalSetting.softProfileMidGoalYellowAlarmTime)).format('L LT')
                                                stageItem.redAlarmTime = moment(kendo.parseDate(globalSetting.softProfileMidGoalRedAlarmTime)).format('L LT')

                                                stageItem.externalStartNotificationTemplateId = globalSetting.softProfileMidGoalExternalStartNotificationTemplateId;
                                                stageItem.externalCompletedNotificationTemplateId = globalSetting.softProfileMidGoalExternalCompletedNotificationTemplateId;
                                                stageItem.externalResultsNotificationTemplateId = globalSetting.softProfileMidGoalExternalResultsNotificationTemplateId;
                                                stageItem.evaluatorStartNotificationTemplateId = globalSetting.softProfileMidGoalEvaluatorStartNotificationTemplateId;
                                                stageItem.evaluatorCompletedNotificationTemplateId = globalSetting.softProfileMidGoalEvaluatorCompletedNotificationTemplateId;
                                                stageItem.evaluatorResultsNotificationTemplateId = globalSetting.softProfileMidGoalEvaluatorResultsNotificationTemplateId;
                                                stageItem.trainerStartNotificationTemplateId = globalSetting.softProfileMidGoalTrainerStartNotificationTemplateId;
                                                stageItem.trainerCompletedNotificationTemplateId = globalSetting.softProfileMidGoalTrainerCompletedNotificationTemplateId;
                                                stageItem.trainerResultsNotificationTemplateId = globalSetting.softProfileMidGoalTrainerResultsNotificationTemplateId;
                                                stageItem.managerStartNotificationTemplateId = globalSetting.softProfileMidGoalManagerStartNotificationTemplateId;
                                                stageItem.managerCompletedNotificationTemplateId = globalSetting.softProfileMidGoalManagerCompletedNotificationTemplateId;
                                                stageItem.managerResultsNotificationTemplateId = globalSetting.softProfileMidGoalManagerResultsNotificationTemplateId;

                                                stageItem.greenAlarmParticipantTemplateId = globalSetting.softProfileMidGoalGreenAlarmParticipantTemplateId;
                                                stageItem.greenAlarmEvaluatorTemplateId = globalSetting.softProfileMidGoalGreenAlarmEvaluatorTemplateId;
                                                stageItem.greenAlarmManagerTemplateId = globalSetting.softProfileMidGoalGreenAlarmManagerTemplateId;
                                                stageItem.greenAlarmTrainerTemplateId = globalSetting.softProfileMidGoalGreenAlarmTrainerTemplateId;
                                                stageItem.yellowAlarmParticipantTemplateId = globalSetting.softProfileMidGoalYellowAlarmParticipantTemplateId;
                                                stageItem.yellowAlarmEvaluatorTemplateId = globalSetting.softProfileMidGoalYellowAlarmEvaluatorTemplateId;
                                                stageItem.yellowAlarmManagerTemplateId = globalSetting.softProfileMidGoalYellowAlarmManagerTemplateId;
                                                stageItem.yellowAlarmTrainerTemplateId = globalSetting.softProfileMidGoalYellowAlarmTrainerTemplateId;
                                                stageItem.redAlarmParticipantTemplateId = globalSetting.softProfileMidGoalRedAlarmParticipantTemplateId;
                                                stageItem.redAlarmEvaluatorTemplateId = globalSetting.softProfileMidGoalRedAlarmEvaluatorTemplateId;
                                                stageItem.redAlarmManagerTemplateId = globalSetting.softProfileMidGoalRedAlarmManagerTemplateId;
                                                stageItem.redAlarmTrainerTemplateId = globalSetting.softProfileMidGoalRedAlarmTrainerTemplateId;

                                            }
                                            if (index == 3) {

                                                stageItem.emailNotification = globalSetting.softProfileLongTermEmailNotification;
                                                stageItem.smsNotification = globalSetting.softProfileLongTermSmsNotification;


                                                stageItem.startDateTime = moment(kendo.parseDate(globalSetting.longTermGoalStartDate)).format('L LT')
                                                stageItem.endDateTime = moment(kendo.parseDate(globalSetting.longTermGoalEndDate)).format('L LT')
                                                stageItem.greenAlarmTime = moment(kendo.parseDate(globalSetting.softProfileLongTermGoalGreenAlarmTime)).format('L LT')
                                                stageItem.yellowAlarmTime = moment(kendo.parseDate(globalSetting.softProfileLongTermGoalYellowAlarmTime)).format('L LT')
                                                stageItem.redAlarmTime = moment(kendo.parseDate(globalSetting.softProfileLongTermGoalRedAlarmTime)).format('L LT')

                                                stageItem.externalStartNotificationTemplateId = globalSetting.softProfileLongTermGoalExternalStartNotificationTemplateId;
                                                stageItem.externalCompletedNotificationTemplateId = globalSetting.softProfileLongTermGoalExternalCompletedNotificationTemplateId;
                                                stageItem.externalResultsNotificationTemplateId = globalSetting.softProfileLongTermGoalExternalResultsNotificationTemplateId;
                                                stageItem.evaluatorStartNotificationTemplateId = globalSetting.softProfileLongTermGoalEvaluatorStartNotificationTemplateId;
                                                stageItem.evaluatorCompletedNotificationTemplateId = globalSetting.softProfileLongTermGoalEvaluatorCompletedNotificationTemplateId;
                                                stageItem.evaluatorResultsNotificationTemplateId = globalSetting.softProfileLongTermGoalEvaluatorResultsNotificationTemplateId;
                                                stageItem.trainerStartNotificationTemplateId = globalSetting.softProfileLongTermGoalTrainerStartNotificationTemplateId;
                                                stageItem.trainerCompletedNotificationTemplateId = globalSetting.softProfileLongTermGoalTrainerCompletedNotificationTemplateId;
                                                stageItem.trainerResultsNotificationTemplateId = globalSetting.softProfileLongTermGoalTrainerResultsNotificationTemplateId;
                                                stageItem.managerStartNotificationTemplateId = globalSetting.softProfileLongTermGoalManagerStartNotificationTemplateId;
                                                stageItem.managerCompletedNotificationTemplateId = globalSetting.softProfileLongTermGoalManagerCompletedNotificationTemplateId;
                                                stageItem.managerResultsNotificationTemplateId = globalSetting.softProfileLongTermGoalManagerResultsNotificationTemplateId;


                                                stageItem.greenAlarmParticipantTemplateId = globalSetting.softProfileLongTermGoalGreenAlarmParticipantTemplateId;
                                                stageItem.greenAlarmEvaluatorTemplateId = globalSetting.softProfileLongTermGoalGreenAlarmEvaluatorTemplateId;
                                                stageItem.greenAlarmManagerTemplateId = globalSetting.softProfileLongTermGoalGreenAlarmManagerTemplateId;
                                                stageItem.greenAlarmTrainerTemplateId = globalSetting.softProfileLongTermGoalGreenAlarmTrainerTemplateId;
                                                stageItem.yellowAlarmParticipantTemplateId = globalSetting.softProfileLongTermGoalYellowAlarmParticipantTemplateId;
                                                stageItem.yellowAlarmEvaluatorTemplateId = globalSetting.softProfileLongTermGoalYellowAlarmEvaluatorTemplateId;
                                                stageItem.yellowAlarmManagerTemplateId = globalSetting.softProfileLongTermGoalYellowAlarmManagerTemplateId;
                                                stageItem.yellowAlarmTrainerTemplateId = globalSetting.softProfileLongTermGoalYellowAlarmTrainerTemplateId;
                                                stageItem.redAlarmParticipantTemplateId = globalSetting.softProfileLongTermGoalRedAlarmParticipantTemplateId;
                                                stageItem.redAlarmEvaluatorTemplateId = globalSetting.softProfileLongTermGoalRedAlarmEvaluatorTemplateId;
                                                stageItem.redAlarmManagerTemplateId = globalSetting.softProfileLongTermGoalRedAlarmManagerTemplateId;
                                                stageItem.redAlarmTrainerTemplateId = globalSetting.softProfileLongTermGoalRedAlarmTrainerTemplateId;
                                            }
                                            if (index == 4) {
                                                stageItem.emailNotification = globalSetting.softProfileFinalGoalEmailNotification;
                                                stageItem.smsNotification = globalSetting.softProfileFinalGoalSmsNotification;

                                                stageItem.startDateTime = moment(kendo.parseDate(globalSetting.finalGoalStartDate)).format('L LT')
                                                stageItem.endDateTime = moment(kendo.parseDate(globalSetting.finalGoalEndDate)).format('L LT')
                                                stageItem.greenAlarmTime = moment(kendo.parseDate(globalSetting.softProfileFinalGoalGreenAlarmTime)).format('L LT')
                                                stageItem.yellowAlarmTime = moment(kendo.parseDate(globalSetting.softProfileFinalGoalYellowAlarmTime)).format('L LT')
                                                stageItem.redAlarmTime = moment(kendo.parseDate(globalSetting.softProfileFinalGoalRedAlarmTime)).format('L LT');

                                                stageItem.externalStartNotificationTemplateId = globalSetting.softProfileFinalGoalExternalStartNotificationTemplateId;
                                                stageItem.externalCompletedNotificationTemplateId = globalSetting.softProfileFinalGoalExternalCompletedNotificationTemplateId;
                                                stageItem.externalResultsNotificationTemplateId = globalSetting.softProfileFinalGoalExternalResultsNotificationTemplateId;
                                                stageItem.evaluatorStartNotificationTemplateId = globalSetting.softProfileFinalGoalEvaluatorStartNotificationTemplateId;
                                                stageItem.evaluatorCompletedNotificationTemplateId = globalSetting.softProfileFinalGoalEvaluatorCompletedNotificationTemplateId;
                                                stageItem.evaluatorResultsNotificationTemplateId = globalSetting.softProfileFinalGoalEvaluatorResultsNotificationTemplateId;
                                                stageItem.trainerStartNotificationTemplateId = globalSetting.softProfileFinalGoalTrainerStartNotificationTemplateId;
                                                stageItem.trainerCompletedNotificationTemplateId = globalSetting.softProfileFinalGoalTrainerCompletedNotificationTemplateId;
                                                stageItem.trainerResultsNotificationTemplateId = globalSetting.softProfileFinalGoalTrainerResultsNotificationTemplateId;
                                                stageItem.managerStartNotificationTemplateId = globalSetting.softProfileFinalGoalManagerStartNotificationTemplateId;
                                                stageItem.managerCompletedNotificationTemplateId = globalSetting.softProfileFinalGoalManagerCompletedNotificationTemplateId;
                                                stageItem.managerResultsNotificationTemplateId = globalSetting.softProfileFinalGoalManagerResultsNotificationTemplateId;

                                                stageItem.greenAlarmParticipantTemplateId = globalSetting.softProfileFinalGoalGreenAlarmParticipantTemplateId;
                                                stageItem.greenAlarmEvaluatorTemplateId = globalSetting.softProfileFinalGoalGreenAlarmEvaluatorTemplateId;
                                                stageItem.greenAlarmManagerTemplateId = globalSetting.softProfileFinalGoalGreenAlarmManagerTemplateId;
                                                stageItem.greenAlarmTrainerTemplateId = globalSetting.softProfileFinalGoalGreenAlarmTrainerTemplateId;
                                                stageItem.yellowAlarmParticipantTemplateId = globalSetting.softProfileFinalGoalYellowAlarmParticipantTemplateId;
                                                stageItem.yellowAlarmEvaluatorTemplateId = globalSetting.softProfileFinalGoalYellowAlarmEvaluatorTemplateId;
                                                stageItem.yellowAlarmManagerTemplateId = globalSetting.softProfileFinalGoalYellowAlarmManagerTemplateId;
                                                stageItem.yellowAlarmTrainerTemplateId = globalSetting.softProfileFinalGoalYellowAlarmTrainerTemplateId;
                                                stageItem.redAlarmParticipantTemplateId = globalSetting.softProfileFinalGoalRedAlarmParticipantTemplateId;
                                                stageItem.redAlarmEvaluatorTemplateId = globalSetting.softProfileFinalGoalRedAlarmEvaluatorTemplateId;
                                                stageItem.redAlarmManagerTemplateId = globalSetting.softProfileFinalGoalRedAlarmManagerTemplateId;
                                                stageItem.redAlarmTrainerTemplateId = globalSetting.softProfileFinalGoalRedAlarmTrainerTemplateId;
                                            }

                                        }
                                        else {
                                            stageItem.startDateTime = moment(kendo.parseDate(stageItem.startDateTime)).format('L LT')
                                            stageItem.endDateTime = moment(kendo.parseDate(stageItem.endDateTime)).format('L LT')
                                            stageItem.greenAlarmTime = moment(kendo.parseDate(stageItem.greenAlarmTime)).format('L LT')
                                            stageItem.yellowAlarmTime = moment(kendo.parseDate(stageItem.yellowAlarmTime)).format('L LT')
                                            stageItem.redAlarmTime = moment(kendo.parseDate(stageItem.redAlarmTime)).format('L LT')
                                        }
                                    }

                                    $scope.stageGroup.stages.push(stageItem);
                                    if (!($scope.profile.profileTypeId == profileTypeEnum.Knowledge)) {
                                        $scope.statusOfStages.push({ stageId: stageItem.id, isLocked: false, isInUse: false })
                                        $scope.fpStatusOfStages.push({ stageId: stageItem.id, isLocked: true, isInUse: true })
                                    }


                                });


                                $scope.profile.stageGroups.push($scope.stageGroup);
                                if ($scope.stageGroup.stages.length > 0) {
                                    $scope.stage = $scope.stageGroup.stages[0];
                                    $scope.setDefaults();
                                }
                            },
                                function (data) {

                                });

                            //var stageNames = ["Start Stage", "Short Goal", "Mid  Goal", "Long Term Goal", "Final Goal"];
                            //for (var i = 0; i < 5; i++) {
                            //    $scope.stage = {
                            //        id: (i + 1) * -1,
                            //        name: stageNames[i],
                            //        stageGroupId: $scope.stageGroup.id,
                            //        startDateTime: "",
                            //        endDateTime: "",
                            //        evaluationDurationMinutes: 0,
                            //        emailNotification: true,
                            //        smsNotification: true,
                            //        greenAlarmParticipantTemplateId: 0,
                            //        greenAlarmTime: "",
                            //        yellowAlarmParticipantTemplateId: 0,
                            //        yellowAlarmTime: "",
                            //        redAlarmParticipantTemplateId: 0,
                            //        redAlarmTime: "",
                            //        externalStartNotificationTemplateId: 0,
                            //        externalCompletedNotificationTemplateId: null,
                            //        externalResultsNotificationTemplateId: null,
                            //        evaluatorStartNotificationTemplateId: 0,
                            //        evaluatorCompletedNotificationTemplateId: null,
                            //        evaluatorResultsNotificationTemplateId: null,
                            //        trainerStartNotificationTemplateId: null,
                            //        trainerCompletedNotificationTemplateId: null,
                            //        trainerResultsNotificationTemplateId: null,
                            //        managerStartNotificationTemplateId: null,
                            //        managerCompletedNotificationTemplateId: null,
                            //        managerResultsNotificationTemplateId: null,
                            //        managerId: null,
                            //        trainerId: null,
                            //        invitedAt: null,
                            //        greenAlarmEvaluatorTemplateId: 0,
                            //        greenAlarmManagerTemplateId: 0,
                            //        greenAlarmTrainerTemplateId: 0,
                            //        yellowAlarmEvaluatorTemplateId: 0,
                            //        yellowAlarmManagerTemplateId: 0,
                            //        yellowAlarmTrainerTemplateId: 0,
                            //        redAlarmEvaluatorTemplateId: 0,
                            //        redAlarmManagerTemplateId: 0,
                            //        redAlarmTrainerTemplateId: 0,
                            //    }

                            //}
                            //$scope.stageTimespanChanged();



                        }, function (data) {
                        });

                    }
                    else {
                        // Edit
                        var stageGroup = angular.copy($scope.stageGroup);
                        stageGroup.stages = [];
                        stageGroup.profiles = [];
                        stageGroup.startDate = kendo.parseDate(stageGroup.startDate);
                        stageGroup.endDate = kendo.parseDate(stageGroup.endDate);
                        apiService.update('stageGroups', stageGroup).then(function (data) {
                            if (data) {
                                _.each($scope.profile.stageGroups, function (pgItem) {
                                    if (pgItem.id == $scope.stageGroup.id) {
                                        pgItem.name = $scope.stageGroup.name;
                                        pgItem.description = $scope.stageGroup.description;
                                        pgItem.startDate = $scope.stageGroup.startDate;
                                        pgItem.endDate = $scope.stageGroup.endDate;
                                    }
                                });
                                dialogService.showNotification($translate.instant('MYPROJECTS_PROJECTPROFILES_STAGE_GROUP_UPDATED_SUCCESSFULLY'), "success");
                            }
                            else {
                                dialogService.showNotification($translate.instant('MYPROJECTS_PROJECTPROFILES_STAGE_GROUP_UPDATE_FAILED'), "warning");
                            }
                        }, function (error) {
                            dialogService.showNotification(error, "warning")
                        })
                    }
                    $("#stageGroupModal").modal("hide");
                }
            }
            $scope.changeStage = function (stageGroupId, stageId) {
                _.each($scope.profile.stageGroups, function (stageGroupItem) {
                    if (stageGroupItem.id == stageGroupId) {
                        _.each(stageGroupItem.stages, function (stageItem) {
                            if (stageItem.id == stageId) {
                                $scope.stage = angular.copy(stageItem);
                                $scope.projectManagers = new kendo.data.ObservableArray([]);
                                _.each($scope.projectInfo.projectSteeringGroups, function (steeringGroupItem) {
                                    _.each(steeringGroupItem.users, function (userItem) {
                                        if (userItem.roleName == "Project Manager") {
                                            userItem["id"] = userItem.userId
                                            userItem["name"] = userItem.firstName + " " + userItem.lastName
                                            $scope.projectManagers.push(userItem);
                                        }
                                    })
                                })
                            }
                        })
                    }
                })
            }
            $scope.stageTimespanChanged = function () {
                var newDate = new Date();
                var mindate = moment(newDate).add({ days: 1, hours: 1 });
                var calculatedDate = moment(newDate).add({ months: $scope.stageGroup.monthsSpan, days: $scope.stageGroup.daysSpan + ($scope.stageGroup.weeksSpan * 7), hours: $scope.stageGroup.hoursSpan, minutes: $scope.stageGroup.minutesSpan });

                //if ((calculatedDate._d.getTime() - mindate._d.getTime()) >= 0) {

                _.forEach($scope.stageGroup.stages, function (item, index) {
                    if (index == 0) {

                        $scope.stageGroup.stages[index].endDateTime = moment(kendo.parseDate($scope.stageGroup.startDate)).add({ months: $scope.stageGroup.monthsSpan, days: $scope.stageGroup.daysSpan + ($scope.stageGroup.weeksSpan * 7), hours: $scope.stageGroup.hoursSpan, minutes: $scope.stageGroup.minutesSpan }).format('L LT');
                        $scope.stageGroup.stages[index].startDateTime = moment(kendo.parseDate($scope.stageGroup.startDate)).format('L LT')
                        var startdatetime = kendo.parseDate($scope.stageGroup.stages[index].startDateTime);
                        var enddatetime = kendo.parseDate($scope.stageGroup.stages[index].endDateTime);
                        var TotalDiffrence = enddatetime.getTime() - startdatetime.getTime();
                        var greenAlarmAt = parseInt(TotalDiffrence * 0.20);
                        var yellowAlarmAt = parseInt(TotalDiffrence * 0.60);
                        var redAlarmAt = parseInt(TotalDiffrence * 0.90);
                        $scope.stageGroup.stages[index].greenAlarmTime = moment(new Date(startdatetime.getTime() + greenAlarmAt)).format('L LT');
                        $scope.stageGroup.stages[index].yellowAlarmTime = moment(new Date(startdatetime.getTime() + yellowAlarmAt)).format('L LT');
                        $scope.stageGroup.stages[index].redAlarmTime = moment(new Date(enddatetime.getTime())).add(1, 'minutes').format('L LT');
                    }
                    else {
                        $scope.stageGroup.stages[index].startDateTime = $scope.stageGroup.stages[index - 1].endDateTime;
                        $scope.stageGroup.stages[index].endDateTime = moment(kendo.parseDate($scope.stageGroup.stages[index].startDateTime)).add({ months: $scope.stageGroup.monthsSpan, days: $scope.stageGroup.daysSpan + ($scope.stageGroup.weeksSpan * 7), hours: $scope.stageGroup.hoursSpan, minutes: $scope.stageGroup.minutesSpan }).format('L LT');
                        $scope.stageGroup.endDate = moment(kendo.parseDate($scope.stageGroup.stages[index].endDateTime)).add('days', 1).format("L LT");
                        var startdatetime = kendo.parseDate($scope.stageGroup.stages[index].startDateTime);
                        var enddatetime = kendo.parseDate($scope.stageGroup.stages[index].endDateTime);
                        var TotalDiffrence = enddatetime.getTime() - startdatetime.getTime();
                        var greenAlarmAt = parseInt(TotalDiffrence * 0.20);
                        var yellowAlarmAt = parseInt(TotalDiffrence * 0.60);
                        var redAlarmAt = parseInt(TotalDiffrence * 0.90);

                        $scope.stageGroup.stages[index].greenAlarmTime = moment(new Date(startdatetime.getTime() + greenAlarmAt)).format('L LT');
                        $scope.stageGroup.stages[index].yellowAlarmTime = moment(new Date(startdatetime.getTime() + yellowAlarmAt)).format('L LT');
                        $scope.stageGroup.stages[index].redAlarmTime = moment(new Date(enddatetime.getTime())).add(1, 'minutes').format('L LT');

                    }
                });

            }

            // Send out - Participants 
            $scope.AddParticipantsModal = function (stageGroupId) {
                $scope.stageGroupId = stageGroupId;
                if ($scope.projectInfo != null) {
                    $("#participantModal").modal("show");
                }
            }
            $scope.participants = [];
            $scope.selfEvaluationChange = function (userId) {
                var evaluators = _.filter($scope.evaluators, function (evaluatorItem) {
                    return evaluatorItem.participantId == userId;
                });

                if (evaluators.length > 0) {
                    dialogService.showYesNoDialog($translate.instant('COMMON_CONFIRM'), $translate.instant('MYPROJECTS_PROJECTPROFILES_YOU_ALREADY_HAVE_ADDED_EVALUATORS_IF_YOU_CONFIRM_EVALUATOES_WIL_LBE_REMOVED') + " " + $translate.instant('MYPROJECTS_PROJECTPROFILES_ARE_YOU_SURE_YOU_WANT_TO_MAKE_YOU_SELF_AS_EVALUTOR')).then(
                        function () {
                            var participantevaluators = angular.copy($scope.evaluators);
                            participantevaluators = _.filter(participantevaluators, function (item) {
                                return item.participantId != userId;
                            });
                            $scope.evaluators = participantevaluators;
                        },
                        function () {
                            //alert('No clicked');
                            _.each($scope.participants, function (participantItem) {
                                if (participantItem.id == userId) {
                                    participantItem.isSelfEvaluation = false;
                                }
                            })
                        });
                }
            }
            $scope.checkParticipantAdded = function (stageGroupId, userId) {
                var IsParticipantAdded = _.findIndex($scope.participants, function (participantItem) {
                    return participantItem.userId == userId && participantItem.stageGroupId == stageGroupId;
                })
                if (IsParticipantAdded >= 0) {
                    return true;
                }
                else {
                    return false;
                }
            }
            $scope.checkEvaluatorAdded = function (stageGroupId, userId, participantId) {
                var IsEvaluatorAdded = _.findIndex($scope.evaluators, function (participantItem) {
                    return participantItem.userId == userId && participantItem.stageGroupId == stageGroupId && participantItem.participant.userId == participantId;
                })
                if (IsEvaluatorAdded >= 0) {
                    return true;
                }
                else {
                    return false;
                }
            }
            $scope.checkFinalScoreManagerAdded = function (steeringGroupid, userId, participantId) {
                var IsFinalScoreManagerAdded = _.findIndex($scope.finalScoreManagers, function (participantItem) {
                    return participantItem.userId == userId && participantItem.stageGroupId == steeringGroupid && participantItem.participant.userId == participantId;
                })
                if (IsFinalScoreManagerAdded >= 0) {
                    return true;
                }
                else {
                    return false;
                }
            }
            $scope.addAsParticipant = function (userid) {
                if ($scope.projectInfo != null) {
                    _.each($scope.projectInfo.projectSteeringGroups, function (steeringGroupItem) {
                        _.each(steeringGroupItem.users, function (userItem) {
                            if (userItem.userId == userid) {
                                userItem["stageGroupId"] = $scope.stageGroupId;
                                userItem["isSelfEvaluation"] = $scope.profile.profileTypeId == profileTypeEnum.Knowledge;
                                profilesService.getUserById(userItem.userId).then(function (data) {
                                    userItem["user"] = data;
                                    var participant = {
                                        stageGroupId: $scope.stageGroupId,
                                        user: userItem.user,
                                        evaluateeId: null,
                                        firstName: userItem.user.firstName,
                                        lastName: userItem.user.lastName,
                                        isSelfEvaluation: $scope.profile.profileTypeId == profileTypeEnum.Knowledge,
                                        organizationName: "",
                                        participantId: -1,
                                        roleId: 2,
                                        evaluationRoleId: 2,
                                        userId: userItem.user.id,
                                        isLocked: false,
                                        isScoreManager: false
                                    };
                                    apiService.add("EvaluationParticipants", participant).then(function (data) {
                                        if (data) {
                                            userItem["participantId"] = data;
                                            $scope.participants.push(userItem);
                                            $("#participantModal").modal("hide");
                                        }
                                    },
                                        function (data) {

                                        });


                                })

                            }
                        });
                    });
                }
            }

            $scope.evaluators = [];
            $scope.evaluatorFor = null;
            $scope.stageGroupId = null;
            $scope.AddEvaluatorModal = function (stageGroupId, participantId) {
                if ($scope.projectInfo != null) {
                    $scope.evaluatorFor = participantId;
                    $scope.stageGroupId = stageGroupId;
                    $("#evaluatorModal").modal("show");
                }
            }
            $scope.addAsEvaluator = function (userid, participantId) {
                if ($scope.projectInfo != null) {
                    _.each($scope.projectInfo.projectSteeringGroups, function (steeringGroupItem) {
                        _.each(steeringGroupItem.users, function (userItem) {
                            if (userItem.userId == userid) {
                                userItem["stageGroupId"] = $scope.stageGroupId;
                                userItem["participantId"] = participantId;
                                userItem["participant"] = _.find($scope.participants, function (participantItem) {
                                    return participantItem.userId == participantId;
                                });
                                profilesService.getUserById(userItem.userId).then(function (data) {
                                    userItem["user"] = data;

                                    var evaluator = {
                                        stageGroupId: $scope.stageGroupId,
                                        user: userItem.user,
                                        evaluateeId: userItem.participant.participantId,
                                        evaluatee: userItem.participant,
                                        firstName: userItem.user.firstName,
                                        lastName: userItem.user.lastName,
                                        isSelfEvaluation: false,
                                        organizationName: "",
                                        participantId: -1,
                                        roleId: 1,
                                        evaluationRoleId: 1,
                                        userId: userItem.user.id,
                                        isLocked: false,
                                        isScoreManager: false,
                                    };
                                    apiService.add("EvaluationParticipants", evaluator).then(function (data) {
                                        if (data) {
                                            userItem["participantId"] = data;
                                            userItem["evaluateeId"] = evaluator.evaluateeId;
                                            $scope.evaluators.push(userItem);
                                            $("#evaluatorModal").modal("hide");

                                        }
                                    },
                                        function (data) {

                                        });


                                })

                                //$scope.evaluators.push(userItem);
                            }
                        });
                    });
                }
            }

            $scope.finalScoreManagers = [];
            $scope.AddFinalScoreManagerModal = function (stageGroupId, participantId) {
                if ($scope.projectInfo != null) {
                    $scope.evaluatorFor = participantId;
                    $scope.stageGroupId = stageGroupId;
                    $("#finalscoreManagerModal").modal("show");
                }
            }
            $scope.addAsFinalScoreManager = function (userid, participantId) {
                if ($scope.projectInfo != null) {
                    _.each($scope.projectInfo.projectSteeringGroups, function (steeringGroupItem) {
                        _.each(steeringGroupItem.users, function (userItem) {
                            if (userItem.userId == userid) {
                                userItem["participantId"] = participantId;
                                userItem["stageGroupId"] = $scope.stageGroupId;
                                userItem["participant"] = _.find($scope.participants, function (participantItem) {
                                    return participantItem.userId == participantId;
                                });
                                profilesService.getUserById(userItem.userId).then(function (data) {
                                    userItem["user"] = data;

                                    var evaluator = {
                                        stageGroupId: $scope.stageGroupId,
                                        user: userItem.user,
                                        evaluateeId: userItem.participant.participantId,
                                        evaluatee: userItem.participant,
                                        firstName: userItem.user.firstName,
                                        lastName: userItem.user.lastName,
                                        isSelfEvaluation: false,
                                        organizationName: "",
                                        participantId: -1,
                                        roleId: 1,
                                        evaluationRoleId: 1,
                                        userId: userItem.user.id,
                                        isLocked: false,
                                        isScoreManager: true,
                                    };
                                    apiService.add("EvaluationParticipants", evaluator).then(function (data) {
                                        if (data) {
                                            userItem["participantId"] = data;
                                            userItem["evaluateeId"] = evaluator.evaluateeId;
                                            $scope.finalScoreManagers.push(userItem);
                                            $("#finalscoreManagerModal").modal("hide");
                                        }
                                    },
                                        function (data) {

                                        });


                                })
                            }
                        });
                    });
                }
            }

            $scope.RemoveParticipant = function (stageGroupId, participantId) {
                var participantEvaluators = _.each($scope.evaluators, function (evaluatorItem) {
                    return evaluatorItem.participantId == participantId;
                });

                var participantFinalScoreManager = _.each($scope.finalScoreManagers, function (finalScoreManagerItem) {
                    return finalScoreManagerItem.participantId == participantId;
                });
                if (participantEvaluators.length > 0 || participantFinalScoreManager.length > 0) {
                    dialogService.showYesNoDialog($translate.instant('COMMON_CONFIRM'), $translate.instant('MYPROJECTS_PROJECTPROFILES_ALL_EVALUATORS_AND_SURVEY_ANSWERS_FOR_SELECTED_PARTICIPANT_WILL_BE_REMOVED') + " " + $translate.instant('MYPROJECTS_PROJECTPROFILES_ARE_YOU_SURE_YOU_WANT_TO_PROCEED')).then(
                        function () {

                            apiService.remove("stageGroups/participant", participantId).then(function (data) {
                                if (data) {
                                    var participantevaluators = angular.copy($scope.evaluators);
                                    participantevaluators = _.filter(participantevaluators, function (item) {
                                        return item.evaluateeId != participantId;
                                    });
                                    $scope.evaluators = participantevaluators;

                                    var participantfinalScoreManagers = angular.copy($scope.finalScoreManagers);
                                    participantfinalScoreManagers = _.filter(participantfinalScoreManagers, function (item) {
                                        return item.evaluateeId != participantId;
                                    });
                                    $scope.finalScoreManagers = participantfinalScoreManagers;


                                    var participantIndex = _.findIndex($scope.participants, function (item) {
                                        return item.participantId == participantId && item.stageGroupId == stageGroupId;
                                    });
                                    if (participantIndex > -1) {
                                        $scope.participants.splice(participantIndex, 1);
                                    }
                                }
                            },
                                function (error) {

                                });



                        },
                        function () {
                        });
                }
                else {
                    dialogService.showYesNoDialog($translate.instant('COMMON_CONFIRM'), $translate.instant('COMMON_ARE_YOU_SURE_YOU_WANT_TO_DELETE')).then(function () {
                        apiService.remove("stageGroups/participant", participantId).then(function (data) {
                            if (data) {
                                var participantIndex = _.findIndex($scope.participants, function (item) {
                                    return item.participantId == participantId && item.stageGroupId == stageGroupId;
                                });
                                if (participantIndex > -1) {
                                    $scope.participants.splice(participantIndex, 1);
                                }
                            }
                        }, function () { })
                    }, function () { });
                }
            }

            $scope.RemoveEvaluator = function (stageGroupId, evaluatorId) {

                dialogService.showYesNoDialog($translate.instant('COMMON_CONFIRM'), $translate.instant('COMMON_ARE_YOU_SURE_YOU_WANT_TO_DELETE')).then(function () {

                    apiService.remove("stageGroups/participant", evaluatorId).then(function (data) {
                        if (data) {
                            var evaluatorIndex = _.findIndex($scope.evaluators, function (item) {
                                return item.participantId == evaluatorId && item.stageGroupId == stageGroupId;
                            });
                            if (evaluatorIndex > -1) {
                                $scope.evaluators.splice(evaluatorIndex, 1);
                            }
                        }
                    }, function () { })


                }, function () { });

            }

            $scope.RemoveFinalScoreManager = function (stageGroupId, finalScoreManagerId) {
                dialogService.showYesNoDialog($translate.instant('COMMON_CONFIRM'), $translate.instant('COMMON_ARE_YOU_SURE_YOU_WANT_TO_DELETE')).then(function () {

                    apiService.remove("stageGroups/participant", finalScoreManagerId).then(function (data) {
                        if (data) {
                            var finalScoreManagerIndex = _.findIndex($scope.finalScoreManagers, function (item) {
                                return item.participantId == finalScoreManagerId && item.stageGroupId == stageGroupId;
                            });
                            if (finalScoreManagerIndex > -1) {
                                $scope.finalScoreManagers.splice(finalScoreManagerIndex, 1);
                            }
                        }
                    }, function () { })


                }, function () { })

            }

            $scope.AddProjectManagerModal = function () {
                if ($scope.projectInfo != null) {
                    $("#projectManagerModal").modal("show");
                }
            }

            $("body").on("click", ".addAsSkill", function () {
                var skillId = $(this).data("skillid");
                AddAsSkill(skillId);
            })

            $scope.setDefaults = function () {
                if ($scope.profileType == profileTypeEnum.Knowledge) {
                    var globalSetting = null;
                    if ($scope.projectInfo.projectGlobalSettings.length > 0) {
                        globalSetting = $scope.projectInfo.projectGlobalSettings[0]
                    }
                    if (globalSetting) {

                        $scope.stageGroup.stages[0].emailNotification = globalSetting.knowledgeProfileEmailNotification;
                        $scope.stageGroup.stages[0].smsNotification = globalSetting.knowledgeProfileSmsNotification;

                        $scope.stageGroup.stages[0].startDateTime = moment(kendo.parseDate(globalSetting.knowledgeProfileStartDate)).format('L LT')
                        $scope.stageGroup.stages[0].endDateTime = moment(kendo.parseDate(globalSetting.knowledgeProfileEndDate)).format('L LT')
                        $scope.stageGroup.stages[0].greenAlarmTime = moment(kendo.parseDate(globalSetting.knowledgeProfileGreenAlarmTime)).format('L LT')
                        $scope.stageGroup.stages[0].yellowAlarmTime = moment(kendo.parseDate(globalSetting.knowledgeProfileYellowAlarmTime)).format('L LT')
                        $scope.stageGroup.stages[0].redAlarmTime = moment(kendo.parseDate(globalSetting.knowledgeProfileRedAlarmTime)).format('L LT')
                        $scope.stageGroup.stages[0].managerId = globalSetting.managerId;
                        $scope.stageGroup.stages[0].trainerId = globalSetting.trainerId;

                        $scope.stageGroup.stages[0].externalStartNotificationTemplateId = globalSetting.knowledgeProfileExternalStartNotificationTemplateId;
                        $scope.stageGroup.stages[0].externalCompletedNotificationTemplateId = globalSetting.knowledgeProfileExternalCompletedNotificationTemplateId;
                        $scope.stageGroup.stages[0].externalResultsNotificationTemplateId = globalSetting.knowledgeProfileExternalResultsNotificationTemplateId;
                        $scope.stageGroup.stages[0].evaluatorStartNotificationTemplateId = globalSetting.knowledgeProfileEvaluatorStartNotificationTemplateId;
                        $scope.stageGroup.stages[0].evaluatorCompletedNotificationTemplateId = globalSetting.knowledgeProfileEvaluatorCompletedNotificationTemplateId;
                        $scope.stageGroup.stages[0].evaluatorResultsNotificationTemplateId = globalSetting.knowledgeProfileEvaluatorResultsNotificationTemplateId;
                        $scope.stageGroup.stages[0].trainerStartNotificationTemplateId = globalSetting.knowledgeProfileTrainerStartNotificationTemplateId;
                        $scope.stageGroup.stages[0].trainerCompletedNotificationTemplateId = globalSetting.knowledgeProfileTrainerCompletedNotificationTemplateId;
                        $scope.stageGroup.stages[0].trainerResultsNotificationTemplateId = globalSetting.knowledgeProfileTrainerResultsNotificationTemplateId;
                        $scope.stageGroup.stages[0].managerStartNotificationTemplateId = globalSetting.knowledgeProfileManagerStartNotificationTemplateId;
                        $scope.stageGroup.stages[0].managerCompletedNotificationTemplateId = globalSetting.knowledgeProfileManagerCompletedNotificationTemplateId;
                        $scope.stageGroup.stages[0].managerResultsNotificationTemplateId = globalSetting.knowledgeProfileManagerResultsNotificationTemplateId;


                        $scope.stageGroup.stages[0].greenAlarmParticipantTemplateId = globalSetting.knowledgeProfileGreenAlarmParticipantTemplateId;
                        $scope.stageGroup.stages[0].greenAlarmEvaluatorTemplateId = globalSetting.knowledgeProfileGreenAlarmEvaluatorTemplateId;
                        $scope.stageGroup.stages[0].greenAlarmManagerTemplateId = globalSetting.knowledgeProfileGreenAlarmManagerTemplateId;
                        $scope.stageGroup.stages[0].greenAlarmTrainerTemplateId = globalSetting.knowledgeProfileGreenAlarmTrainerTemplateId;
                        $scope.stageGroup.stages[0].yellowAlarmParticipantTemplateId = globalSetting.knowledgeProfileYellowAlarmParticipantTemplateId;
                        $scope.stageGroup.stages[0].yellowAlarmEvaluatorTemplateId = globalSetting.knowledgeProfileYellowAlarmEvaluatorTemplateId;
                        $scope.stageGroup.stages[0].yellowAlarmManagerTemplateId = globalSetting.knowledgeProfileYellowAlarmManagerTemplateId;
                        $scope.stageGroup.stages[0].yellowAlarmTrainerTemplateId = globalSetting.knowledgeProfileYellowAlarmTrainerTemplateId;
                        $scope.stageGroup.stages[0].redAlarmParticipantTemplateId = globalSetting.knowledgeProfileRedAlarmParticipantTemplateId;
                        $scope.stageGroup.stages[0].redAlarmEvaluatorTemplateId = globalSetting.knowledgeProfileRedAlarmEvaluatorTemplateId;
                        $scope.stageGroup.stages[0].redAlarmManagerTemplateId = globalSetting.knowledgeProfileRedAlarmManagerTemplateId;
                        $scope.stageGroup.stages[0].redAlarmTrainerTemplateId = globalSetting.knowledgeProfileRedAlarmTrainerTemplateId;


                    }
                    else {
                        $scope.stageGroup.stages[0].emailNotification = true;
                        $scope.stageGroup.stages[0].smsNotification = true;
                        $scope.stageGroup.stages[0].externalStartNotificationTemplateId = 78;
                        $scope.stageGroup.stages[0].evaluatorStartNotificationTemplateId = 20;

                        $scope.stageGroup.stages[0].greenAlarmParticipantTemplateId = 62;
                        $scope.stageGroup.stages[0].greenAlarmEvaluatorTemplateId = 65;
                        $scope.stageGroup.stages[0].greenAlarmManagerTemplateId = 70;
                        $scope.stageGroup.stages[0].greenAlarmTrainerTemplateId = 73;
                        $scope.stageGroup.stages[0].yellowAlarmParticipantTemplateId = 66;
                        $scope.stageGroup.stages[0].yellowAlarmEvaluatorTemplateId = 79;
                        $scope.stageGroup.stages[0].yellowAlarmManagerTemplateId = 71;
                        $scope.stageGroup.stages[0].yellowAlarmTrainerTemplateId = 74;
                        $scope.stageGroup.stages[0].redAlarmParticipantTemplateId = 67;
                        $scope.stageGroup.stages[0].redAlarmEvaluatorTemplateId = 72;
                        $scope.stageGroup.stages[0].redAlarmManagerTemplateId = 75;
                        $scope.stageGroup.stages[0].redAlarmTrainerTemplateId = 77;
                    }
                }
                else if ($scope.profileType == profileTypeEnum.Soft) {
                    var globalSetting = null;
                    if ($scope.projectInfo.projectGlobalSettings.length > 0) {
                        globalSetting = $scope.projectInfo.projectGlobalSettings[0]
                    }
                    if (globalSetting) {
                        if ($scope.stageGroup.stages.length == 5) {

                            $scope.stageGroup.stages[0].emailNotification = globalSetting.softProfileStartEmailNotification;
                            $scope.stageGroup.stages[0].smsNotification = globalSetting.softProfileStartSmsNotification;

                            $scope.stageGroup.stages[0].startDateTime = moment(kendo.parseDate(globalSetting.startStageStartDate)).format('L LT')
                            $scope.stageGroup.stages[0].endDateTime = moment(kendo.parseDate(globalSetting.startStageEndDate)).format('L LT')
                            $scope.stageGroup.stages[0].greenAlarmTime = moment(kendo.parseDate(globalSetting.softProfileStartGreenAlarmTime)).format('L LT')
                            $scope.stageGroup.stages[0].yellowAlarmTime = moment(kendo.parseDate(globalSetting.softProfileStartYellowAlarmTime)).format('L LT')
                            $scope.stageGroup.stages[0].redAlarmTime = moment(kendo.parseDate(globalSetting.softProfileStartRedAlarmTime)).format('L LT')
                            $scope.stageGroup.stages[0].externalStartNotificationTemplateId = globalSetting.softProfileStartExternalStartNotificationTemplateId;
                            $scope.stageGroup.stages[0].externalCompletedNotificationTemplateId = globalSetting.softProfileStartExternalCompletedNotificationTemplateId;
                            $scope.stageGroup.stages[0].externalResultsNotificationTemplateId = globalSetting.softProfileStartExternalResultsNotificationTemplateId;
                            $scope.stageGroup.stages[0].evaluatorStartNotificationTemplateId = globalSetting.softProfileStartEvaluatorStartNotificationTemplateId;
                            $scope.stageGroup.stages[0].evaluatorCompletedNotificationTemplateId = globalSetting.softProfileStartEvaluatorCompletedNotificationTemplateId;
                            $scope.stageGroup.stages[0].evaluatorResultsNotificationTemplateId = globalSetting.softProfileStartEvaluatorResultsNotificationTemplateId;
                            $scope.stageGroup.stages[0].trainerStartNotificationTemplateId = globalSetting.softProfileStartTrainerStartNotificationTemplateId;
                            $scope.stageGroup.stages[0].trainerCompletedNotificationTemplateId = globalSetting.softProfileStartTrainerCompletedNotificationTemplateId;
                            $scope.stageGroup.stages[0].trainerResultsNotificationTemplateId = globalSetting.softProfileStartTrainerResultsNotificationTemplateId;
                            $scope.stageGroup.stages[0].managerStartNotificationTemplateId = globalSetting.softProfileStartManagerStartNotificationTemplateId;
                            $scope.stageGroup.stages[0].managerCompletedNotificationTemplateId = globalSetting.softProfileStartManagerCompletedNotificationTemplateId;
                            $scope.stageGroup.stages[0].managerResultsNotificationTemplateId = globalSetting.softProfileStartManagerResultsNotificationTemplateId;
                            $scope.stageGroup.stages[0].greenAlarmParticipantTemplateId = globalSetting.softProfileStartGreenAlarmParticipantTemplateId;
                            $scope.stageGroup.stages[0].greenAlarmEvaluatorTemplateId = globalSetting.softProfileStartGreenAlarmEvaluatorTemplateId;
                            $scope.stageGroup.stages[0].greenAlarmManagerTemplateId = globalSetting.softProfileStartGreenAlarmManagerTemplateId;
                            $scope.stageGroup.stages[0].greenAlarmTrainerTemplateId = globalSetting.softProfileStartGreenAlarmTrainerTemplateId;
                            $scope.stageGroup.stages[0].yellowAlarmParticipantTemplateId = globalSetting.softProfileStartYellowAlarmParticipantTemplateId;
                            $scope.stageGroup.stages[0].yellowAlarmEvaluatorTemplateId = globalSetting.softProfileStartYellowAlarmEvaluatorTemplateId;
                            $scope.stageGroup.stages[0].yellowAlarmManagerTemplateId = globalSetting.softProfileStartYellowAlarmManagerTemplateId;
                            $scope.stageGroup.stages[0].yellowAlarmTrainerTemplateId = globalSetting.softProfileStartYellowAlarmTrainerTemplateId;
                            $scope.stageGroup.stages[0].redAlarmParticipantTemplateId = globalSetting.softProfileStartRedAlarmParticipantTemplateId;
                            $scope.stageGroup.stages[0].redAlarmEvaluatorTemplateId = globalSetting.softProfileStartRedAlarmEvaluatorTemplateId;
                            $scope.stageGroup.stages[0].redAlarmManagerTemplateId = globalSetting.softProfileStartRedAlarmManagerTemplateId;
                            $scope.stageGroup.stages[0].redAlarmTrainerTemplateId = globalSetting.softProfileStartRedAlarmTrainerTemplateId;

                            $scope.stageGroup.stages[1].emailNotification = globalSetting.softProfileShortGoalEmailNotification;
                            $scope.stageGroup.stages[1].smsNotification = globalSetting.softProfileShortGoalSmsNotification;
                            $scope.stageGroup.stages[1].startDateTime = moment(kendo.parseDate(globalSetting.shortGoalStartDate)).format('L LT')
                            $scope.stageGroup.stages[1].endDateTime = moment(kendo.parseDate(globalSetting.shortGoalEndDate)).format('L LT')
                            $scope.stageGroup.stages[1].greenAlarmTime = moment(kendo.parseDate(globalSetting.softProfileShortGoalGreenAlarmTime)).format('L LT')
                            $scope.stageGroup.stages[1].yellowAlarmTime = moment(kendo.parseDate(globalSetting.softProfileShortGoalYellowAlarmTime)).format('L LT')
                            $scope.stageGroup.stages[1].redAlarmTime = moment(kendo.parseDate(globalSetting.softProfileShortGoalRedAlarmTime)).format('L LT')
                            $scope.stageGroup.stages[1].externalStartNotificationTemplateId = globalSetting.softProfileShortGoalExternalStartNotificationTemplateId;
                            $scope.stageGroup.stages[1].externalCompletedNotificationTemplateId = globalSetting.softProfileShortGoalExternalCompletedNotificationTemplateId;
                            $scope.stageGroup.stages[1].externalResultsNotificationTemplateId = globalSetting.softProfileShortGoalExternalResultsNotificationTemplateId;
                            $scope.stageGroup.stages[1].evaluatorStartNotificationTemplateId = globalSetting.softProfileShortGoalEvaluatorStartNotificationTemplateId;
                            $scope.stageGroup.stages[1].evaluatorCompletedNotificationTemplateId = globalSetting.softProfileShortGoalEvaluatorCompletedNotificationTemplateId;
                            $scope.stageGroup.stages[1].evaluatorResultsNotificationTemplateId = globalSetting.softProfileShortGoalEvaluatorResultsNotificationTemplateId;
                            $scope.stageGroup.stages[1].trainerStartNotificationTemplateId = globalSetting.softProfileShortGoalTrainerStartNotificationTemplateId;
                            $scope.stageGroup.stages[1].trainerCompletedNotificationTemplateId = globalSetting.softProfileShortGoalTrainerCompletedNotificationTemplateId;
                            $scope.stageGroup.stages[1].trainerResultsNotificationTemplateId = globalSetting.softProfileShortGoalTrainerResultsNotificationTemplateId;
                            $scope.stageGroup.stages[1].managerStartNotificationTemplateId = globalSetting.softProfileShortGoalManagerStartNotificationTemplateId;
                            $scope.stageGroup.stages[1].managerCompletedNotificationTemplateId = globalSetting.softProfileShortGoalManagerCompletedNotificationTemplateId;
                            $scope.stageGroup.stages[1].managerResultsNotificationTemplateId = globalSetting.softProfileShortGoalManagerResultsNotificationTemplateId;
                            $scope.stageGroup.stages[1].greenAlarmParticipantTemplateId = globalSetting.softProfileShortGoalGreenAlarmParticipantTemplateId;
                            $scope.stageGroup.stages[1].greenAlarmEvaluatorTemplateId = globalSetting.softProfileShortGoalGreenAlarmEvaluatorTemplateId;
                            $scope.stageGroup.stages[1].greenAlarmManagerTemplateId = globalSetting.softProfileShortGoalGreenAlarmManagerTemplateId;
                            $scope.stageGroup.stages[1].greenAlarmTrainerTemplateId = globalSetting.softProfileShortGoalGreenAlarmTrainerTemplateId;
                            $scope.stageGroup.stages[1].yellowAlarmParticipantTemplateId = globalSetting.softProfileShortGoalYellowAlarmParticipantTemplateId;
                            $scope.stageGroup.stages[1].yellowAlarmEvaluatorTemplateId = globalSetting.softProfileShortGoalYellowAlarmEvaluatorTemplateId;
                            $scope.stageGroup.stages[1].yellowAlarmManagerTemplateId = globalSetting.softProfileShortGoalYellowAlarmManagerTemplateId;
                            $scope.stageGroup.stages[1].yellowAlarmTrainerTemplateId = globalSetting.softProfileShortGoalYellowAlarmTrainerTemplateId;
                            $scope.stageGroup.stages[1].redAlarmParticipantTemplateId = globalSetting.softProfileShortGoalRedAlarmParticipantTemplateId;
                            $scope.stageGroup.stages[1].redAlarmEvaluatorTemplateId = globalSetting.softProfileShortGoalRedAlarmEvaluatorTemplateId;
                            $scope.stageGroup.stages[1].redAlarmManagerTemplateId = globalSetting.softProfileShortGoalRedAlarmManagerTemplateId;
                            $scope.stageGroup.stages[1].redAlarmTrainerTemplateId = globalSetting.softProfileShortGoalRedAlarmTrainerTemplateId;


                            $scope.stageGroup.stages[2].emailNotification = globalSetting.softProfileMidGoalEmailNotification;
                            $scope.stageGroup.stages[2].smsNotification = globalSetting.softProfileMidGoalSmsNotification;

                            $scope.stageGroup.stages[2].startDateTime = moment(kendo.parseDate(globalSetting.midGoalStartDate)).format('L LT')
                            $scope.stageGroup.stages[2].endDateTime = moment(kendo.parseDate(globalSetting.midGoalEndDate)).format('L LT')
                            $scope.stageGroup.stages[2].greenAlarmTime = moment(kendo.parseDate(globalSetting.softProfileMidGoalGreenAlarmTime)).format('L LT')
                            $scope.stageGroup.stages[2].yellowAlarmTime = moment(kendo.parseDate(globalSetting.softProfileMidGoalYellowAlarmTime)).format('L LT')
                            $scope.stageGroup.stages[2].redAlarmTime = moment(kendo.parseDate(globalSetting.softProfileMidGoalRedAlarmTime)).format('L LT')

                            $scope.stageGroup.stages[2].externalStartNotificationTemplateId = globalSetting.softProfileMidGoalExternalStartNotificationTemplateId;
                            $scope.stageGroup.stages[2].externalCompletedNotificationTemplateId = globalSetting.softProfileMidGoalExternalCompletedNotificationTemplateId;
                            $scope.stageGroup.stages[2].externalResultsNotificationTemplateId = globalSetting.softProfileMidGoalExternalResultsNotificationTemplateId;
                            $scope.stageGroup.stages[2].evaluatorStartNotificationTemplateId = globalSetting.softProfileMidGoalEvaluatorStartNotificationTemplateId;
                            $scope.stageGroup.stages[2].evaluatorCompletedNotificationTemplateId = globalSetting.softProfileMidGoalEvaluatorCompletedNotificationTemplateId;
                            $scope.stageGroup.stages[2].evaluatorResultsNotificationTemplateId = globalSetting.softProfileMidGoalEvaluatorResultsNotificationTemplateId;
                            $scope.stageGroup.stages[2].trainerStartNotificationTemplateId = globalSetting.softProfileMidGoalTrainerStartNotificationTemplateId;
                            $scope.stageGroup.stages[2].trainerCompletedNotificationTemplateId = globalSetting.softProfileMidGoalTrainerCompletedNotificationTemplateId;
                            $scope.stageGroup.stages[2].trainerResultsNotificationTemplateId = globalSetting.softProfileMidGoalTrainerResultsNotificationTemplateId;
                            $scope.stageGroup.stages[2].managerStartNotificationTemplateId = globalSetting.softProfileMidGoalManagerStartNotificationTemplateId;
                            $scope.stageGroup.stages[2].managerCompletedNotificationTemplateId = globalSetting.softProfileMidGoalManagerCompletedNotificationTemplateId;
                            $scope.stageGroup.stages[2].managerResultsNotificationTemplateId = globalSetting.softProfileMidGoalManagerResultsNotificationTemplateId;

                            $scope.stageGroup.stages[2].greenAlarmParticipantTemplateId = globalSetting.softProfileShortGoalGreenAlarmParticipantTemplateId;
                            $scope.stageGroup.stages[2].greenAlarmEvaluatorTemplateId = globalSetting.softProfileShortGoalGreenAlarmEvaluatorTemplateId;
                            $scope.stageGroup.stages[2].greenAlarmManagerTemplateId = globalSetting.softProfileShortGoalGreenAlarmManagerTemplateId;
                            $scope.stageGroup.stages[2].greenAlarmTrainerTemplateId = globalSetting.softProfileShortGoalGreenAlarmTrainerTemplateId;
                            $scope.stageGroup.stages[2].yellowAlarmParticipantTemplateId = globalSetting.softProfileShortGoalYellowAlarmParticipantTemplateId;
                            $scope.stageGroup.stages[2].yellowAlarmEvaluatorTemplateId = globalSetting.softProfileShortGoalYellowAlarmEvaluatorTemplateId;
                            $scope.stageGroup.stages[2].yellowAlarmManagerTemplateId = globalSetting.softProfileShortGoalYellowAlarmManagerTemplateId;
                            $scope.stageGroup.stages[2].yellowAlarmTrainerTemplateId = globalSetting.softProfileShortGoalYellowAlarmTrainerTemplateId;
                            $scope.stageGroup.stages[2].redAlarmParticipantTemplateId = globalSetting.softProfileShortGoalRedAlarmParticipantTemplateId;
                            $scope.stageGroup.stages[2].redAlarmEvaluatorTemplateId = globalSetting.softProfileShortGoalRedAlarmEvaluatorTemplateId;
                            $scope.stageGroup.stages[2].redAlarmManagerTemplateId = globalSetting.softProfileShortGoalRedAlarmManagerTemplateId;
                            $scope.stageGroup.stages[2].redAlarmTrainerTemplateId = globalSetting.softProfileShortGoalRedAlarmTrainerTemplateId;

                            $scope.stageGroup.stages[3].emailNotification = globalSetting.softProfileLongTermGoalEmailNotification;
                            $scope.stageGroup.stages[3].smsNotification = globalSetting.softProfileLongTermGoalSmsNotification;
                            $scope.stageGroup.stages[3].startDateTime = moment(kendo.parseDate(globalSetting.longTermGoalStartDate)).format('L LT')
                            $scope.stageGroup.stages[3].endDateTime = moment(kendo.parseDate(globalSetting.longTermGoalEndDate)).format('L LT')
                            $scope.stageGroup.stages[3].greenAlarmTime = moment(kendo.parseDate(globalSetting.softProfileLongTermGoalGreenAlarmTime)).format('L LT')
                            $scope.stageGroup.stages[3].yellowAlarmTime = moment(kendo.parseDate(globalSetting.softProfileLongTermGoalYellowAlarmTime)).format('L LT')
                            $scope.stageGroup.stages[3].redAlarmTime = moment(kendo.parseDate(globalSetting.softProfileLongTermGoalRedAlarmTime)).format('L LT')
                            $scope.stageGroup.stages[3].externalStartNotificationTemplateId = globalSetting.softProfileLongTermGoalExternalStartNotificationTemplateId;
                            $scope.stageGroup.stages[3].externalCompletedNotificationTemplateId = globalSetting.softProfileLongTermGoalExternalCompletedNotificationTemplateId;
                            $scope.stageGroup.stages[3].externalResultsNotificationTemplateId = globalSetting.softProfileLongTermGoalExternalResultsNotificationTemplateId;
                            $scope.stageGroup.stages[3].evaluatorStartNotificationTemplateId = globalSetting.softProfileLongTermGoalEvaluatorStartNotificationTemplateId;
                            $scope.stageGroup.stages[3].evaluatorCompletedNotificationTemplateId = globalSetting.softProfileLongTermGoalEvaluatorCompletedNotificationTemplateId;
                            $scope.stageGroup.stages[3].evaluatorResultsNotificationTemplateId = globalSetting.softProfileLongTermGoalEvaluatorResultsNotificationTemplateId;
                            $scope.stageGroup.stages[3].trainerStartNotificationTemplateId = globalSetting.softProfileLongTermGoalTrainerStartNotificationTemplateId;
                            $scope.stageGroup.stages[3].trainerCompletedNotificationTemplateId = globalSetting.softProfileLongTermGoalTrainerCompletedNotificationTemplateId;
                            $scope.stageGroup.stages[3].trainerResultsNotificationTemplateId = globalSetting.softProfileLongTermGoalTrainerResultsNotificationTemplateId;
                            $scope.stageGroup.stages[3].managerStartNotificationTemplateId = globalSetting.softProfileLongTermGoalManagerStartNotificationTemplateId;
                            $scope.stageGroup.stages[3].managerCompletedNotificationTemplateId = globalSetting.softProfileLongTermGoalManagerCompletedNotificationTemplateId;
                            $scope.stageGroup.stages[3].managerResultsNotificationTemplateId = globalSetting.softProfileLongTermGoalManagerResultsNotificationTemplateId;


                            $scope.stageGroup.stages[3].greenAlarmParticipantTemplateId = globalSetting.softProfileLongTermGoalGreenAlarmParticipantTemplateId;
                            $scope.stageGroup.stages[3].greenAlarmEvaluatorTemplateId = globalSetting.softProfileLongTermGoalGreenAlarmEvaluatorTemplateId;
                            $scope.stageGroup.stages[3].greenAlarmManagerTemplateId = globalSetting.softProfileLongTermGoalGreenAlarmManagerTemplateId;
                            $scope.stageGroup.stages[3].greenAlarmTrainerTemplateId = globalSetting.softProfileLongTermGoalGreenAlarmTrainerTemplateId;
                            $scope.stageGroup.stages[3].yellowAlarmParticipantTemplateId = globalSetting.softProfileLongTermGoalYellowAlarmParticipantTemplateId;
                            $scope.stageGroup.stages[3].yellowAlarmEvaluatorTemplateId = globalSetting.softProfileLongTermGoalYellowAlarmEvaluatorTemplateId;
                            $scope.stageGroup.stages[3].yellowAlarmManagerTemplateId = globalSetting.softProfileLongTermGoalYellowAlarmManagerTemplateId;
                            $scope.stageGroup.stages[3].yellowAlarmTrainerTemplateId = globalSetting.softProfileLongTermGoalYellowAlarmTrainerTemplateId;
                            $scope.stageGroup.stages[3].redAlarmParticipantTemplateId = globalSetting.softProfileLongTermGoalRedAlarmParticipantTemplateId;
                            $scope.stageGroup.stages[3].redAlarmEvaluatorTemplateId = globalSetting.softProfileLongTermGoalRedAlarmEvaluatorTemplateId;
                            $scope.stageGroup.stages[3].redAlarmManagerTemplateId = globalSetting.softProfileLongTermGoalRedAlarmManagerTemplateId;
                            $scope.stageGroup.stages[3].redAlarmTrainerTemplateId = globalSetting.softProfileLongTermGoalRedAlarmTrainerTemplateId;


                            $scope.stageGroup.stages[4].emailNotification = globalSetting.softProfileFinalGoalEmailNotification;
                            $scope.stageGroup.stages[4].smsNotification = globalSetting.softProfileFinalGoalSmsNotification;
                            $scope.stageGroup.stages[4].startDateTime = moment(kendo.parseDate(globalSetting.finalGoalStartDate)).format('L LT')
                            $scope.stageGroup.stages[4].endDateTime = moment(kendo.parseDate(globalSetting.finalGoalEndDate)).format('L LT')
                            $scope.stageGroup.stages[4].greenAlarmTime = moment(kendo.parseDate(globalSetting.softProfileFinalGoalGreenAlarmTime)).format('L LT')
                            $scope.stageGroup.stages[4].yellowAlarmTime = moment(kendo.parseDate(globalSetting.softProfileFinalGoalYellowAlarmTime)).format('L LT')
                            $scope.stageGroup.stages[4].redAlarmTime = moment(kendo.parseDate(globalSetting.softProfileFinalGoalRedAlarmTime)).format('L LT');

                            $scope.stageGroup.stages[4].externalStartNotificationTemplateId = globalSetting.softProfileFinalGoalExternalStartNotificationTemplateId;
                            $scope.stageGroup.stages[4].externalCompletedNotificationTemplateId = globalSetting.softProfileFinalGoalExternalCompletedNotificationTemplateId;
                            $scope.stageGroup.stages[4].externalResultsNotificationTemplateId = globalSetting.softProfileFinalGoalExternalResultsNotificationTemplateId;
                            $scope.stageGroup.stages[4].evaluatorStartNotificationTemplateId = globalSetting.softProfileFinalGoalEvaluatorStartNotificationTemplateId;
                            $scope.stageGroup.stages[4].evaluatorCompletedNotificationTemplateId = globalSetting.softProfileFinalGoalEvaluatorCompletedNotificationTemplateId;
                            $scope.stageGroup.stages[4].evaluatorResultsNotificationTemplateId = globalSetting.softProfileFinalGoalEvaluatorResultsNotificationTemplateId;
                            $scope.stageGroup.stages[4].trainerStartNotificationTemplateId = globalSetting.softProfileFinalGoalTrainerStartNotificationTemplateId;
                            $scope.stageGroup.stages[4].trainerCompletedNotificationTemplateId = globalSetting.softProfileFinalGoalTrainerCompletedNotificationTemplateId;
                            $scope.stageGroup.stages[4].trainerResultsNotificationTemplateId = globalSetting.softProfileFinalGoalTrainerResultsNotificationTemplateId;
                            $scope.stageGroup.stages[4].managerStartNotificationTemplateId = globalSetting.softProfileFinalGoalManagerStartNotificationTemplateId;
                            $scope.stageGroup.stages[4].managerCompletedNotificationTemplateId = globalSetting.softProfileFinalGoalManagerCompletedNotificationTemplateId;
                            $scope.stageGroup.stages[4].managerResultsNotificationTemplateId = globalSetting.softProfileFinalGoalManagerResultsNotificationTemplateId;

                            $scope.stageGroup.stages[4].greenAlarmParticipantTemplateId = globalSetting.softProfileFinalGoalGreenAlarmParticipantTemplateId;
                            $scope.stageGroup.stages[4].greenAlarmEvaluatorTemplateId = globalSetting.softProfileFinalGoalGreenAlarmEvaluatorTemplateId;
                            $scope.stageGroup.stages[4].greenAlarmManagerTemplateId = globalSetting.softProfileFinalGoalGreenAlarmManagerTemplateId;
                            $scope.stageGroup.stages[4].greenAlarmTrainerTemplateId = globalSetting.softProfileFinalGoalGreenAlarmTrainerTemplateId;
                            $scope.stageGroup.stages[4].yellowAlarmParticipantTemplateId = globalSetting.softProfileFinalGoalYellowAlarmParticipantTemplateId;
                            $scope.stageGroup.stages[4].yellowAlarmEvaluatorTemplateId = globalSetting.softProfileFinalGoalYellowAlarmEvaluatorTemplateId;
                            $scope.stageGroup.stages[4].yellowAlarmManagerTemplateId = globalSetting.softProfileFinalGoalYellowAlarmManagerTemplateId;
                            $scope.stageGroup.stages[4].yellowAlarmTrainerTemplateId = globalSetting.softProfileFinalGoalYellowAlarmTrainerTemplateId;
                            $scope.stageGroup.stages[4].redAlarmParticipantTemplateId = globalSetting.softProfileFinalGoalRedAlarmParticipantTemplateId;
                            $scope.stageGroup.stages[4].redAlarmEvaluatorTemplateId = globalSetting.softProfileFinalGoalRedAlarmEvaluatorTemplateId;
                            $scope.stageGroup.stages[4].redAlarmManagerTemplateId = globalSetting.softProfileFinalGoalRedAlarmManagerTemplateId;
                            $scope.stageGroup.stages[4].redAlarmTrainerTemplateId = globalSetting.softProfileFinalGoalRedAlarmTrainerTemplateId;
                        }
                    }
                    else {
                        $scope.stageGroup.stages[0].emailNotification = true;
                        $scope.stageGroup.stages[0].smsNotification = true;
                        $scope.stageGroup.stages[0].externalStartNotificationTemplateId = 78;
                        $scope.stageGroup.stages[0].evaluatorStartNotificationTemplateId = 20;

                        $scope.stageGroup.stages[0].greenAlarmParticipantTemplateId = 62;
                        $scope.stageGroup.stages[0].greenAlarmEvaluatorTemplateId = 65;
                        $scope.stageGroup.stages[0].greenAlarmManagerTemplateId = 70;
                        $scope.stageGroup.stages[0].greenAlarmTrainerTemplateId = 73;
                        $scope.stageGroup.stages[0].yellowAlarmParticipantTemplateId = 66;
                        $scope.stageGroup.stages[0].yellowAlarmEvaluatorTemplateId = 79;
                        $scope.stageGroup.stages[0].yellowAlarmManagerTemplateId = 71;
                        $scope.stageGroup.stages[0].yellowAlarmTrainerTemplateId = 74;
                        $scope.stageGroup.stages[0].redAlarmParticipantTemplateId = 67;
                        $scope.stageGroup.stages[0].redAlarmEvaluatorTemplateId = 72;
                        $scope.stageGroup.stages[0].redAlarmManagerTemplateId = 75;
                        $scope.stageGroup.stages[0].redAlarmTrainerTemplateId = 77;

                        $scope.stageGroup.stages[0].redAlarmTime = moment(kendo.parseDate($scope.stageGroup.stages[0].endDateTime)).add(1, 'minutes').format('L LT');
                        $scope.stageGroup.stages[0].yellowAlarmTime = moment(kendo.parseDate($scope.stageGroup.stages[0].endDateTime)).add(-180, 'minutes').format('L LT');
                        $scope.stageGroup.stages[0].greenAlarmTime = moment(kendo.parseDate($scope.stageGroup.stages[0].endDateTime)).add(-1440, 'minutes').format('L LT');

                        if ($scope.stageGroup.stages.length == 5) {

                            $scope.stageGroup.stages[1].emailNotification = true;
                            $scope.stageGroup.stages[1].smsNotification = true;
                            $scope.stageGroup.stages[1].externalStartNotificationTemplateId = 28;
                            $scope.stageGroup.stages[1].evaluatorStartNotificationTemplateId = 30;

                            $scope.stageGroup.stages[1].greenAlarmParticipantTemplateId = 62;
                            $scope.stageGroup.stages[1].greenAlarmEvaluatorTemplateId = 65;
                            $scope.stageGroup.stages[1].greenAlarmManagerTemplateId = 70;
                            $scope.stageGroup.stages[1].greenAlarmTrainerTemplateId = 73;
                            $scope.stageGroup.stages[1].yellowAlarmParticipantTemplateId = 66;
                            $scope.stageGroup.stages[1].yellowAlarmEvaluatorTemplateId = 79;
                            $scope.stageGroup.stages[1].yellowAlarmManagerTemplateId = 71;
                            $scope.stageGroup.stages[1].yellowAlarmTrainerTemplateId = 74;
                            $scope.stageGroup.stages[1].redAlarmParticipantTemplateId = 67;
                            $scope.stageGroup.stages[1].redAlarmEvaluatorTemplateId = 72;
                            $scope.stageGroup.stages[1].redAlarmManagerTemplateId = 75;
                            $scope.stageGroup.stages[1].redAlarmTrainerTemplateId = 77;

                            $scope.stageGroup.stages[1].redAlarmTime = moment(kendo.parseDate($scope.stageGroup.stages[1].endDateTime)).add(1, 'minutes').format('L LT');
                            $scope.stageGroup.stages[1].yellowAlarmTime = moment(kendo.parseDate($scope.stageGroup.stages[1].endDateTime)).add(-180, 'minutes').format('L LT');
                            $scope.stageGroup.stages[1].greenAlarmTime = moment(kendo.parseDate($scope.stageGroup.stages[1].endDateTime)).add(-1440, 'minutes').format('L LT');

                            $scope.stageGroup.stages[2].emailNotification = true;
                            $scope.stageGroup.stages[2].smsNotification = true;
                            $scope.stageGroup.stages[2].externalStartNotificationTemplateId = 27;
                            $scope.stageGroup.stages[2].evaluatorStartNotificationTemplateId = 31;

                            $scope.stageGroup.stages[2].greenAlarmParticipantTemplateId = 62;
                            $scope.stageGroup.stages[2].greenAlarmEvaluatorTemplateId = 65;
                            $scope.stageGroup.stages[2].greenAlarmManagerTemplateId = 70;
                            $scope.stageGroup.stages[2].greenAlarmTrainerTemplateId = 73;
                            $scope.stageGroup.stages[2].yellowAlarmParticipantTemplateId = 66;
                            $scope.stageGroup.stages[2].yellowAlarmEvaluatorTemplateId = 79;
                            $scope.stageGroup.stages[2].yellowAlarmManagerTemplateId = 71;
                            $scope.stageGroup.stages[2].yellowAlarmTrainerTemplateId = 74;
                            $scope.stageGroup.stages[2].redAlarmParticipantTemplateId = 67;
                            $scope.stageGroup.stages[2].redAlarmEvaluatorTemplateId = 72;
                            $scope.stageGroup.stages[2].redAlarmManagerTemplateId = 75;
                            $scope.stageGroup.stages[2].redAlarmTrainerTemplateId = 77;

                            $scope.stageGroup.stages[2].redAlarmTime = moment(kendo.parseDate($scope.stageGroup.stages[2].endDateTime)).add(1, 'minutes').format('L LT');
                            $scope.stageGroup.stages[2].yellowAlarmTime = moment(kendo.parseDate($scope.stageGroup.stages[2].endDateTime)).add(-180, 'minutes').format('L LT');
                            $scope.stageGroup.stages[2].greenAlarmTime = moment(kendo.parseDate($scope.stageGroup.stages[2].endDateTime)).add(-1440, 'minutes').format('L LT');

                            $scope.stageGroup.stages[3].emailNotification = true;
                            $scope.stageGroup.stages[3].smsNotification = true;
                            $scope.stageGroup.stages[3].externalStartNotificationTemplateId = 29;
                            $scope.stageGroup.stages[3].evaluatorStartNotificationTemplateId = 32;

                            $scope.stageGroup.stages[3].greenAlarmParticipantTemplateId = 62;
                            $scope.stageGroup.stages[3].greenAlarmEvaluatorTemplateId = 65;
                            $scope.stageGroup.stages[3].greenAlarmManagerTemplateId = 70;
                            $scope.stageGroup.stages[3].greenAlarmTrainerTemplateId = 73;
                            $scope.stageGroup.stages[3].yellowAlarmParticipantTemplateId = 66;
                            $scope.stageGroup.stages[3].yellowAlarmEvaluatorTemplateId = 79;
                            $scope.stageGroup.stages[3].yellowAlarmManagerTemplateId = 71;
                            $scope.stageGroup.stages[3].yellowAlarmTrainerTemplateId = 74;
                            $scope.stageGroup.stages[3].redAlarmParticipantTemplateId = 67;
                            $scope.stageGroup.stages[3].redAlarmEvaluatorTemplateId = 72;
                            $scope.stageGroup.stages[3].redAlarmManagerTemplateId = 75;
                            $scope.stageGroup.stages[3].redAlarmTrainerTemplateId = 77;

                            $scope.stageGroup.stages[3].redAlarmTime = moment(kendo.parseDate($scope.stageGroup.stages[3].endDateTime)).add(1, 'minutes').format('L LT');
                            $scope.stageGroup.stages[3].yellowAlarmTime = moment(kendo.parseDate($scope.stageGroup.stages[3].endDateTime)).add(-180, 'minutes').format('L LT');
                            $scope.stageGroup.stages[3].greenAlarmTime = moment(kendo.parseDate($scope.stageGroup.stages[3].endDateTime)).add(-1440, 'minutes').format('L LT');

                            $scope.stageGroup.stages[4].emailNotification = true;
                            $scope.stageGroup.stages[4].smsNotification = true;
                            $scope.stageGroup.stages[4].externalStartNotificationTemplateId = 19;
                            $scope.stageGroup.stages[4].evaluatorStartNotificationTemplateId = 80;

                            $scope.stageGroup.stages[4].greenAlarmParticipantTemplateId = 62;
                            $scope.stageGroup.stages[4].greenAlarmEvaluatorTemplateId = 65;
                            $scope.stageGroup.stages[4].greenAlarmManagerTemplateId = 70;
                            $scope.stageGroup.stages[4].greenAlarmTrainerTemplateId = 73;
                            $scope.stageGroup.stages[4].yellowAlarmParticipantTemplateId = 66;
                            $scope.stageGroup.stages[4].yellowAlarmEvaluatorTemplateId = 79;
                            $scope.stageGroup.stages[4].yellowAlarmManagerTemplateId = 71;
                            $scope.stageGroup.stages[4].yellowAlarmTrainerTemplateId = 74;
                            $scope.stageGroup.stages[4].redAlarmParticipantTemplateId = 67;
                            $scope.stageGroup.stages[4].redAlarmEvaluatorTemplateId = 72;
                            $scope.stageGroup.stages[4].redAlarmManagerTemplateId = 75;
                            $scope.stageGroup.stages[4].redAlarmTrainerTemplateId = 77;

                            $scope.stageGroup.stages[4].redAlarmTime = moment(kendo.parseDate($scope.stageGroup.stages[4].endDateTime)).add(1, 'minutes').format('L LT');
                            $scope.stageGroup.stages[4].yellowAlarmTime = moment(kendo.parseDate($scope.stageGroup.stages[4].endDateTime)).add(-180, 'minutes').format('L LT');
                            $scope.stageGroup.stages[4].greenAlarmTime = moment(kendo.parseDate($scope.stageGroup.stages[4].endDateTime)).add(-1440, 'minutes').format('L LT');
                        }
                    }
                }
                _.each($scope.stageGroup.stages, function (stageItem) {
                    var stageItemCopy = _.clone(stageItem);
                    stageItemCopy.startDateTime = kendo.parseDate(stageItemCopy.startDateTime);
                    stageItemCopy.endDateTime = kendo.parseDate(stageItemCopy.endDateTime);
                    stageItemCopy.greenAlarmTime = kendo.parseDate(stageItemCopy.greenAlarmTime);
                    stageItemCopy.yellowAlarmTime = kendo.parseDate(stageItemCopy.yellowAlarmTime);
                    stageItemCopy.redAlarmTime = kendo.parseDate(stageItemCopy.redAlarmTime);
                    stageItemCopy.evaluationStartDate = kendo.parseDate(stageItemCopy.evaluationStartDate);
                    stageItemCopy.evaluationEndDate = kendo.parseDate(stageItemCopy.evaluationEndDate);
                    stageItemCopy.invitedAt = kendo.parseDate(stageItemCopy.invitedAt);
                    apiService.update("stages", stageItemCopy).then(function (data) {
                    }, function (data) {
                    });
                })
            }

            $scope.updateStage = function () {
                var stageItem = _.clone($scope.stage);
                stageItem.startDateTime = kendo.parseDate(stageItem.startDateTime);
                stageItem.endDateTime = kendo.parseDate(stageItem.endDateTime);
                stageItem.greenAlarmTime = kendo.parseDate(stageItem.greenAlarmTime);
                stageItem.yellowAlarmTime = kendo.parseDate(stageItem.yellowAlarmTime);
                stageItem.redAlarmTime = kendo.parseDate(stageItem.redAlarmTime);
                stageItem.evaluationStartDate = kendo.parseDate(stageItem.evaluationStartDate);
                stageItem.evaluationEndDate = kendo.parseDate(stageItem.evaluationEndDate);
                stageItem.invitedAt = kendo.parseDate(stageItem.invitedAt);
                apiService.update("stages", stageItem).then(function (data) {
                },
                    function (data) {
                    });
            }

            $scope.saveProfile = function () {
                var item = $scope.profile;

                _.each($scope.profile.performanceGroups, function (item) {
                    if (item.id == $scope.question.performanceGroupId) {
                        _.each(item.link_PerformanceGroupSkills, function (pgSkillItem) {

                            _.each(pgSkillItem.questions, function (pgSkillQuestionsItem) {
                                if (pgSkillQuestionsItem.possibleAnswer) {
                                    pgSkillQuestionsItem.possibleAnswer.answer = JSON.stringify(pgSkillQuestionsItem.possibleAnswer.answer);
                                }
                            })
                        })
                    }
                });
                if ($scope.profile.id > 0) {
                    //apiService.update("profiles", item).then(function (data) {
                    //    profilesService.reload($scope.profileTypeId);
                    //    dialogService.showNotification('Profile saved successfully', 'info');

                    //    $state.go($state.current, {}, { reload: true });


                    //}, function (message) {
                    //    dialogService.showNotification(message, 'warning');
                    //});
                }
                else {
                    apiService.add("profiles/addProfile", item).then(function (data) {
                        //item.id = data;
                        //profilesService.reload($scope.profileTypeId);
                        if (data > 0) {
                            dialogService.showNotification($translate.instant('MYPROJECTS_PROJECTPROFILES_PROFILE_SAVED_SUCCESSFULLY'), 'info');
                        } else {
                            dialogService.showNotification($translate.instant('MYPROJECTS_PROJECTPROFILES_SAVE_FAILED'), 'warning');
                        }
                    }, function (message) {
                        dialogService.showNotification(message, 'warning');
                    });
                }
            }

            $scope.gotoProfileSendOut = function () {
                $location.path("/profileSendOut/" + $scope.profile.id);
            }
            $scope.showError = function () {
                dialogService.showNotification($translate.instant('MYPROJECTS_PROJECTPROFILES_SOMETHING_WENT_WRONG'), "error");

            }

            $scope.SearchProfileTemplateManually = function (type) {
                if ($scope.defaultProjectId) {
                    localStorageService.set("projectId", $scope.defaultProjectId)
                }
                if (type == $scope.profileTypeEnum.Soft) {
                    $location.path('/home/profiles/profiles/soft');
                    $("#profileTemplateModal").modal("hide");
                }
                else if (type == $scope.profileTypeEnum.Knowledge) {
                    $location.path('/home/profiles/profiles/knowledgetest')
                    $("#profileTemplateModal").modal("hide");
                }

            }
            $scope.manuallySerachProfileTemplates = function () {
                if ($scope.profileType == $scope.profileTypeEnum.Soft) {

                }
            }
        }]);
