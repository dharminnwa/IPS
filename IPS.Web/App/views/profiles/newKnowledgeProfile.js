'use strict';
angular.module('ips.profiles')
    .config(['$stateProvider', function ($stateProvider) {
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
            medalRules: function ($stateParams, profilesService) {
                return profilesService.getMedalRules();
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
        var stateEditPerformanceGroupResolve = {
            pageName: function ($translate) {
                return $translate.instant('COMMON_PERFORMANCE_GROUPS');
            },
            profile: function ($stateParams, apiService, globalVariables) {
                return apiService.getById("profiles/getFullProfileById", $stateParams.profileId, "").then(function (profileDatail) {
                    var profile = profileDatail;
                    _.each(profile.performanceGroups, function (pgItem) {
                        _.each(pgItem.link_PerformanceGroupSkills, function (link_PerformanceGroupSkillItem) {
                            link_PerformanceGroupSkillItem.name = link_PerformanceGroupSkillItem.skill.name;
                            link_PerformanceGroupSkillItem.description = link_PerformanceGroupSkillItem.skill.description;
                            _.each(link_PerformanceGroupSkillItem.questions, function (questionsItem) {
                                questionsItem["skillId"] = link_PerformanceGroupSkillItem.id;
                            });
                        });
                    });
                    moment.locale(globalVariables.lang.currentUICulture);
                    _.each(profile.stageGroups, function (sgItem) {
                        sgItem.startDate = moment(kendo.parseDate(sgItem.startDate)).format('L LT');
                        sgItem.endDate = moment(kendo.parseDate(sgItem.endDate)).format('L LT');
                        if (sgItem.startStageStartDate) {
                            sgItem.startStageStartDate = moment(kendo.parseDate(sgItem.startStageStartDate)).format('L LT');
                        }
                        if (sgItem.startStageEndDate) {
                            sgItem.startStageEndDate = moment(kendo.parseDate(sgItem.startStageEndDate)).format('L LT');
                        }
                        if (sgItem.milestoneStartDate) {
                            sgItem.milestoneStartDate = moment(kendo.parseDate(sgItem.milestoneStartDate)).format('L LT');
                        }
                        if (sgItem.milestoneEndDate) {
                            sgItem.milestoneEndDate = moment(kendo.parseDate(sgItem.milestoneEndDate)).format('L LT');
                        }
                        _.each(sgItem.stages, function (stageItem) {
                            stageItem.startDateTime = moment(kendo.parseDate(stageItem.startDateTime)).format('L LT')
                            stageItem.endDateTime = moment(kendo.parseDate(stageItem.endDateTime)).format('L LT')
                            stageItem.redAlarmTime = moment(kendo.parseDate(stageItem.redAlarmTime)).format('L LT');
                            stageItem.yellowAlarmTime = moment(kendo.parseDate(stageItem.yellowAlarmTime)).format('L LT');
                            stageItem.greenAlarmTime = moment(kendo.parseDate(stageItem.greenAlarmTime)).format('L LT');

                            if (stageItem.evaluationStartDate != null) {
                                stageItem.evaluationStartDate = moment(kendo.parseDate(stageItem.evaluationStartDate)).format('L LT');
                            }
                            if (stageItem.evaluationEndDate != null) {
                                stageItem.evaluationEndDate = moment(kendo.parseDate(stageItem.evaluationEndDate)).format('L LT');
                            }
                        });
                        var sortedStages = _.sortByOrder(sgItem.stages, function (o) { return new moment(kendo.parseDate(o.startDate)).format('L LT'); }, ['asc']);
                        sgItem.stages = sortedStages;
                    });
                    return profile;
                }, function () {
                })
            },
            profileTypeId: function (profilesTypesEnum) {
                return profilesTypesEnum.knowledgetest;
            },
            performanceGroup: function ($stateParams, performanceGroupsService) {
                return performanceGroupsService.getById(0, $stateParams.profileId);
            },
            loadQuery: function ($stateParams) {
                return "&$filter=ProfileId eq " + $stateParams.profileId;
            },
            performanceGroups: function ($stateParams, performanceGroupsService, profileTypeId) {
                return performanceGroupsService.load("&$filter=ProfileId eq " + $stateParams.profileId);
            },
            performanceGroupsFilter: function ($stateParams, performanceGroupsService, profileTypeId) {
                return performanceGroupsService.getAllPerformanceGroups("&$filter=ProfileId eq " + $stateParams.profileId);
            },
            isProfileInUse: function ($stateParams, profilesService) {
                return profilesService.isProfileInUse($stateParams.profileId);
            },
            organizations: function () {
                return [];
            },
            industries: function () {
                return [];
            },
            skills: function () {
                return [];
            },
            levels: function () {
                return [];
            },
            hideFilter: function () {
                return true;
            }
        };
        var stateProfileSkillsResolve = {
            pageName: function ($translate) {
                return $translate.instant('COMMON_PERFORMANCE_GROUPS');
            },
            profileTypeId: function (profilesTypesEnum) {
                return profilesTypesEnum.knowledgetest;
            },

            performanceGroups: function ($stateParams, performanceGroupsService, profileTypeId) {
                return performanceGroupsService.load("&$filter=ProfileId eq " + $stateParams.profileId);
            },
            isProfileInUse: function ($stateParams, profilesService) {
                return profilesService.isProfileInUse($stateParams.profileId);
            },
            skills: function ($stateParams, performanceGroupsService) {
                return performanceGroupsService.getProfileSkills($stateParams.profileId)
            }

        };
        var stateProfileQuestionsResolve = {
            pageName: function ($translate) {
                return $translate.instant('COMMON_PERFORMANCE_GROUPS');
            },
            profileTypeId: function (profilesTypesEnum) {
                return profilesTypesEnum.knowledgetest;
            },

            performanceGroups: function ($stateParams, performanceGroupsService, profileTypeId) {
                return performanceGroupsService.load("&$filter=ProfileId eq " + $stateParams.profileId);
            },
            isProfileInUse: function ($stateParams, profilesService) {
                return profilesService.isProfileInUse($stateParams.profileId);
            },
            skills: function ($stateParams, performanceGroupsService) {
                return performanceGroupsService.getProfileSkills($stateParams.profileId)
            },
            answerTypes: function (apiService) {
                var apiName = 'answerTypes';
                return apiService.getAll(apiName).then(function (data) {
                    return data;
                })
            },

        };
        var stateProfileTrainingsResolve = {
            pageName: function ($translate) {
                return $translate.instant('COMMON_PERFORMANCE_GROUPS');
            },
            profileTypeId: function (profilesTypesEnum) {
                return profilesTypesEnum.knowledgetest;
            },

            performanceGroups: function ($stateParams, performanceGroupsService, profileTypeId) {
                return performanceGroupsService.load("&$filter=ProfileId eq " + $stateParams.profileId);
            },
            isProfileInUse: function ($stateParams, profilesService) {
                return profilesService.isProfileInUse($stateParams.profileId);
            },
            skills: function ($stateParams, performanceGroupsService) {
                return performanceGroupsService.getProfileSkills($stateParams.profileId)
            },
            trainingLevels: function (performanceGroupsService) {
                return performanceGroupsService.getTrainingLevels();
            },
            trainingTypes: function (performanceGroupsService) {
                return performanceGroupsService.getTrainingTypes();
            },
            durationMetrics: function (performanceGroupsService) {
                return performanceGroupsService.getDurationMetrics();
            },
            exerciseMetrics: function (performanceGroupsService) {
                return performanceGroupsService.getExerciseMetrics();
            },
            //notificationTemplates: function (performanceGroupsService) {
            //    return performanceGroupsService.getNotificationTemplates();
            //}
            notificationTemplates: function (stageGroupManager, $translate, templateTypeEnum, globalVariables) {
                return stageGroupManager.getNotificationTemplates().then(function (data) {
                    data = _.filter(data, function (item) {
                        return item.notificationTemplateTypeId == templateTypeEnum.ProfileTrainingNotification;
                    })
                    data.unshift({ id: null, name: $translate.instant('MYPROJECTS_SELECT_TEMPLATE'), culture: { cultureName: "" } });
                    return data;
                });
            },

        };
        var stateProfileMilestonesResolve = {
            profile: function ($stateParams, apiService, globalVariables) {
                return apiService.getById("profiles/getFullProfileById", $stateParams.profileId, "").then(function (profileDatail) {
                    var profile = profileDatail;
                    _.each(profile.performanceGroups, function (pgItem) {
                        _.each(pgItem.link_PerformanceGroupSkills, function (link_PerformanceGroupSkillItem) {
                            link_PerformanceGroupSkillItem.name = link_PerformanceGroupSkillItem.skill.name;
                            link_PerformanceGroupSkillItem.description = link_PerformanceGroupSkillItem.skill.description;
                            _.each(link_PerformanceGroupSkillItem.questions, function (questionsItem) {
                                questionsItem["skillId"] = link_PerformanceGroupSkillItem.id;
                            });
                        });
                    });
                    moment.locale(globalVariables.lang.currentUICulture);
                    _.each(profile.stageGroups, function (sgItem) {
                        sgItem.startDate = moment(kendo.parseDate(sgItem.startDate)).format('L LT');
                        sgItem.endDate = moment(kendo.parseDate(sgItem.endDate)).format('L LT');
                        if (sgItem.startStageStartDate) {
                            sgItem.startStageStartDate = moment(kendo.parseDate(sgItem.startStageStartDate)).format('L LT');
                        }
                        if (sgItem.startStageEndDate) {
                            sgItem.startStageEndDate = moment(kendo.parseDate(sgItem.startStageEndDate)).format('L LT');
                        }
                        if (sgItem.milestoneStartDate) {
                            sgItem.milestoneStartDate = moment(kendo.parseDate(sgItem.milestoneStartDate)).format('L LT');
                        }
                        if (sgItem.milestoneEndDate) {
                            sgItem.milestoneEndDate = moment(kendo.parseDate(sgItem.milestoneEndDate)).format('L LT');
                        }
                        _.each(sgItem.stages, function (stageItem) {
                            stageItem.startDateTime = moment(kendo.parseDate(stageItem.startDateTime)).format('L LT')
                            stageItem.endDateTime = moment(kendo.parseDate(stageItem.endDateTime)).format('L LT')
                            stageItem.redAlarmTime = moment(kendo.parseDate(stageItem.redAlarmTime)).format('L LT');
                            stageItem.yellowAlarmTime = moment(kendo.parseDate(stageItem.yellowAlarmTime)).format('L LT');
                            stageItem.greenAlarmTime = moment(kendo.parseDate(stageItem.greenAlarmTime)).format('L LT');

                            if (stageItem.evaluationStartDate != null) {
                                stageItem.evaluationStartDate = moment(kendo.parseDate(stageItem.evaluationStartDate)).format('L LT');
                            }
                            if (stageItem.evaluationEndDate != null) {
                                stageItem.evaluationEndDate = moment(kendo.parseDate(stageItem.evaluationEndDate)).format('L LT');
                            }
                        });
                        var sortedStages = _.sortByOrder(sgItem.stages, function (o) { return new moment(kendo.parseDate(o.startDate)).format('L LT'); }, ['asc']);
                        sgItem.stages = sortedStages;
                    });
                    return profile;
                }, function () {
                })
            },
            projectInfo: function (profile, profilesService) {
                if (profile.projectId > 0) {
                    return profilesService.getProjectById(profile.projectId).then(function (data) {
                        return data;
                    });
                }
                else {

                    var today = kendo.parseDate(moment({ hour: 0, minute: 0, seconds: 0, milliseconds: 0 })._d)
                    return {
                        id: 0,
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
                        projectGlobalSettings: [],
                        isActive: false,
                    }
                }

            },
            pageName: function (profile, projectInfo, $translate) {
                if (projectInfo) {
                    return projectInfo.name + ' > ' + profile.name + '  : ' + $translate.instant('MYPROJECTS_PROFILE_TRAININGS');
                }
                else {
                    return $translate.instant('MYPROJECTS_PROFILE_SEND_OUT');
                }
            },
            notificationTemplates: function (stageGroupManager, $translate, templateTypeEnum, globalVariables) {
                return stageGroupManager.getNotificationTemplates().then(function (data) {

                    data.unshift({ id: null, name: $translate.instant('MYPROJECTS_SELECT_TEMPLATE'), culture: { cultureName: "" } });
                    return data;
                });
            },
            durationMetrics: function (profileTrainingManager) {
                return profileTrainingManager.getDurationMetrics();
            },

        }
        var stateProfileParticipantsResolve = {
            profile: function ($stateParams, apiService, globalVariables) {
                return apiService.getById("profiles/getFullProfileById", $stateParams.profileId, "").then(function (profileDatail) {
                    var profile = profileDatail;
                    _.each(profile.performanceGroups, function (pgItem) {
                        _.each(pgItem.link_PerformanceGroupSkills, function (link_PerformanceGroupSkillItem) {
                            link_PerformanceGroupSkillItem.name = link_PerformanceGroupSkillItem.skill.name;
                            link_PerformanceGroupSkillItem.description = link_PerformanceGroupSkillItem.skill.description;
                            _.each(link_PerformanceGroupSkillItem.questions, function (questionsItem) {
                                questionsItem["skillId"] = link_PerformanceGroupSkillItem.id;
                            });
                        });
                    });
                    moment.locale(globalVariables.lang.currentUICulture);
                    _.each(profile.stageGroups, function (sgItem) {
                        sgItem.startDate = moment(kendo.parseDate(sgItem.startDate)).format('L LT');
                        sgItem.endDate = moment(kendo.parseDate(sgItem.endDate)).format('L LT');
                        if (sgItem.startStageStartDate) {
                            sgItem.startStageStartDate = moment(kendo.parseDate(sgItem.startStageStartDate)).format('L LT');
                        }
                        if (sgItem.startStageEndDate) {
                            sgItem.startStageEndDate = moment(kendo.parseDate(sgItem.startStageEndDate)).format('L LT');
                        }
                        if (sgItem.milestoneStartDate) {
                            sgItem.milestoneStartDate = moment(kendo.parseDate(sgItem.milestoneStartDate)).format('L LT');
                        }
                        if (sgItem.milestoneEndDate) {
                            sgItem.milestoneEndDate = moment(kendo.parseDate(sgItem.milestoneEndDate)).format('L LT');
                        }
                        _.each(sgItem.stages, function (stageItem) {
                            stageItem.startDateTime = moment(kendo.parseDate(stageItem.startDateTime)).format('L LT')
                            stageItem.endDateTime = moment(kendo.parseDate(stageItem.endDateTime)).format('L LT')
                            stageItem.redAlarmTime = moment(kendo.parseDate(stageItem.redAlarmTime)).format('L LT');
                            stageItem.yellowAlarmTime = moment(kendo.parseDate(stageItem.yellowAlarmTime)).format('L LT');
                            stageItem.greenAlarmTime = moment(kendo.parseDate(stageItem.greenAlarmTime)).format('L LT');

                            if (stageItem.evaluationStartDate != null) {
                                stageItem.evaluationStartDate = moment(kendo.parseDate(stageItem.evaluationStartDate)).format('L LT');
                            }
                            if (stageItem.evaluationEndDate != null) {
                                stageItem.evaluationEndDate = moment(kendo.parseDate(stageItem.evaluationEndDate)).format('L LT');
                            }
                        });
                        var sortedStages = _.sortByOrder(sgItem.stages, function (o) { return new moment(kendo.parseDate(o.startDate)).format('L LT'); }, ['asc']);
                        sgItem.stages = sortedStages;
                    });
                    return profile;
                }, function () {
                })
            },
            projectInfo: function (profile, profilesService) {
                if (profile.projectId > 0) {
                    return profilesService.getProjectById(profile.projectId).then(function (data) {
                        return data;
                    });
                }
                else {

                    var today = kendo.parseDate(moment({ hour: 0, minute: 0, seconds: 0, milliseconds: 0 })._d)
                    return {
                        id: 0,
                        name: "",
                        summary: "",
                        expectedEndDate: moment(today).add("months", 6).format('L LT'),
                        expectedStartDate: moment(today).format('L LT'),
                        missionStatement: "",
                        visionStatement: "",
                        projectSteeringGroups: [],
                        goalStrategies: [],
                        projectGoals: [],
                        projectUsers: [],
                        projectGlobalSettings: [],
                        isActive: false,
                    }
                }

            },
            pageName: function (profile, projectInfo, $translate) {
                if (projectInfo) {
                    return projectInfo.name + ' > ' + profile.name + '  : ' + $translate.instant('MYPROJECTS_PROFILE_TRAININGS');
                }
                else {
                    return $translate.instant('MYPROJECTS_PROFILE_SEND_OUT');
                }
            },
            notificationTemplates: function (stageGroupManager, $translate) {
                return stageGroupManager.getNotificationTemplates().then(function (data) {
                    data.unshift({ id: null, name: $translate.instant('MYPROJECTS_SELECT_TEMPLATE'), culture: { cultureName: "" } });
                    return data;
                });
            },
            durationMetrics: function (profileTrainingManager) {
                return profileTrainingManager.getDurationMetrics();
            },
            organizations: function ($stateParams, profilesService) {
                return profilesService.getOrganizations();
            },
        }
        var stateProfileStatusResolve = {
            profile: function ($stateParams, apiService, globalVariables) {
                return apiService.getById("profiles/getFullProfileById", $stateParams.profileId, "").then(function (profileDatail) {
                    var profile = profileDatail;
                    _.each(profile.performanceGroups, function (pgItem) {
                        _.each(pgItem.link_PerformanceGroupSkills, function (link_PerformanceGroupSkillItem) {
                            link_PerformanceGroupSkillItem.name = link_PerformanceGroupSkillItem.skill.name;
                            link_PerformanceGroupSkillItem.description = link_PerformanceGroupSkillItem.skill.description;
                            _.each(link_PerformanceGroupSkillItem.questions, function (questionsItem) {
                                questionsItem["skillId"] = link_PerformanceGroupSkillItem.id;
                            });
                        });
                    });
                    moment.locale(globalVariables.lang.currentUICulture);
                    _.each(profile.stageGroups, function (sgItem) {
                        sgItem.startDate = moment(kendo.parseDate(sgItem.startDate)).format('L LT');
                        sgItem.endDate = moment(kendo.parseDate(sgItem.endDate)).format('L LT');
                        if (sgItem.startStageStartDate) {
                            sgItem.startStageStartDate = moment(kendo.parseDate(sgItem.startStageStartDate)).format('L LT');
                        }
                        if (sgItem.startStageEndDate) {
                            sgItem.startStageEndDate = moment(kendo.parseDate(sgItem.startStageEndDate)).format('L LT');
                        }
                        if (sgItem.milestoneStartDate) {
                            sgItem.milestoneStartDate = moment(kendo.parseDate(sgItem.milestoneStartDate)).format('L LT');
                        }
                        if (sgItem.milestoneEndDate) {
                            sgItem.milestoneEndDate = moment(kendo.parseDate(sgItem.milestoneEndDate)).format('L LT');
                        }
                        _.each(sgItem.stages, function (stageItem) {
                            stageItem.startDateTime = moment(kendo.parseDate(stageItem.startDateTime)).format('L LT')
                            stageItem.endDateTime = moment(kendo.parseDate(stageItem.endDateTime)).format('L LT')
                            stageItem.redAlarmTime = moment(kendo.parseDate(stageItem.redAlarmTime)).format('L LT');
                            stageItem.yellowAlarmTime = moment(kendo.parseDate(stageItem.yellowAlarmTime)).format('L LT');
                            stageItem.greenAlarmTime = moment(kendo.parseDate(stageItem.greenAlarmTime)).format('L LT');

                            if (stageItem.evaluationStartDate != null) {
                                stageItem.evaluationStartDate = moment(kendo.parseDate(stageItem.evaluationStartDate)).format('L LT');
                            }
                            if (stageItem.evaluationEndDate != null) {
                                stageItem.evaluationEndDate = moment(kendo.parseDate(stageItem.evaluationEndDate)).format('L LT');
                            }
                        });
                        var sortedStages = _.sortByOrder(sgItem.stages, function (o) { return new moment(kendo.parseDate(o.startDate)).format('L LT'); }, ['asc']);
                        sgItem.stages = sortedStages;
                    });
                    return profile;
                }, function () {
                })
            },
            projectInfo: function (profile, profilesService) {
                if (profile.projectId > 0) {
                    return profilesService.getProjectById(profile.projectId).then(function (data) {
                        return data;
                    });
                }
                else {

                    var today = kendo.parseDate(moment({ hour: 0, minute: 0, seconds: 0, milliseconds: 0 })._d)
                    return {
                        id: 0,
                        name: "",
                        summary: "",
                        expectedEndDate: moment(today).add("months", 6).format('L LT'),
                        expectedStartDate: moment(today).format('L LT'),
                        missionStatement: "",
                        visionStatement: "",
                        projectSteeringGroups: [],
                        goalStrategies: [],
                        projectGoals: [],
                        projectUsers: [],
                        projectGlobalSettings: [],
                        isActive: false,
                    }
                }

            },
            pageName: function (profile, projectInfo, $translate) {
                if (projectInfo) {
                    return projectInfo.name + ' > ' + profile.name + '  : ' + $translate.instant('MYPROJECTS_PROFILE_TRAININGS');
                }
                else {
                    return $translate.instant('MYPROJECTS_PROFILE_SEND_OUT');
                }
            },
            notificationTemplates: function (stageGroupManager, $translate) {
                return stageGroupManager.getNotificationTemplates().then(function (data) {
                    data.unshift({ id: null, name: $translate.instant('MYPROJECTS_SELECT_TEMPLATE'), culture: { cultureName: "" } });
                    return data;
                });
            },
        }

        $stateProvider.state('home.knowledgeProfile', {
            url: "/knowledge/profile/:profileId",
            resolve: stateResolveConfig,
            controller: 'KnowledgeProfileCtrl',
            templateUrl: "views/profiles/newknowledgeprofile.html",
            data: {
                displayName: '{{ profile.viewName }}',
                paneLimit: 1,
                depth: 2
            }
        });
        $stateProvider.state('home.knowledgeperformancegroups', {
            url: "/knowledge/:profileId/performancegroups",
            resolve: stateEditPerformanceGroupResolve,
            controller: 'KnowledgeProfilePerformanceGroupsCtrl',
            templateUrl: "views/profiles/performancegroups.html",
            data: {
                displayName: '{{ profile.viewName }}',
                paneLimit: 1,
                depth: 2
            }
        })
        $stateProvider.state('home.knowledgeskills', {
            url: "/knowledge/:profileId/skills",
            resolve: stateProfileSkillsResolve,
            controller: 'KnowledgeProfileSkillsCtrl',
            templateUrl: "views/profiles/skills.html",
            data: {
                displayName: '{{ profile.viewName }}',
                paneLimit: 1,
                depth: 2
            }
        })
        $stateProvider.state('home.knowledgeQuestions', {
            url: "/knowledge/:profileId/questions",
            resolve: stateProfileQuestionsResolve,
            controller: 'KnowledgeProfileQuestionsCtrl',
            templateUrl: "views/profiles/questions.html",
            data: {
                displayName: '{{ profile.viewName }}',
                paneLimit: 1,
                depth: 2
            }
        })
        $stateProvider.state('home.knowledgeTrainings', {
            url: "/knowledge/:profileId/trainings",
            resolve: stateProfileTrainingsResolve,
            controller: 'KnowledgeProfileTrainingsCtrl',
            templateUrl: "views/profiles/trainings.html",
            data: {
                displayName: '{{ profile.viewName }}',
                paneLimit: 1,
                depth: 2
            }
        })
        $stateProvider.state('home.knowledgeMilestones', {
            url: "/knowledge/:profileId/milestones",
            resolve: stateProfileMilestonesResolve,
            controller: 'KnowledgeProfileMilestonesCtrl',
            templateUrl: "views/profiles/milestones.html",
            data: {
                displayName: '{{ profile.viewName }}',
                paneLimit: 1,
                depth: 2
            }
        })
        $stateProvider.state('home.knowledgeParticipants', {
            url: "/knowledge/:profileId/participants",
            resolve: stateProfileParticipantsResolve,
            controller: 'KnowledgeProfileParticipantsCtrl',
            templateUrl: "views/profiles/participants.html",
            data: {
                displayName: '{{ profile.viewName }}',
                paneLimit: 1,
                depth: 2
            }
        })
        $stateProvider.state('home.knowledgeStatus', {
            url: "/knowledge/:profileId/status",
            resolve: stateProfileStatusResolve,
            controller: 'KnowledgeProfileStatusCtrl',
            templateUrl: "views/profiles/status.html",
            data: {
                displayName: '{{profile.viewName}}',
                paneLimit: 1,
                depth: 2
            }
        })
        $stateProvider.state('home.knowledgeHistory', {
            url: "/knowledge/:profileId/history",
            resolve: stateProfileStatusResolve,
            controller: 'KnowledgeProfileHistoryCtrl',
            templateUrl: "views/profiles/history.html",
            data: {
                displayName: '{{ profile.viewName }}',
                paneLimit: 1,
                depth: 2
            }
        })
    }])
    .controller('KnowledgeProfileCtrl', ['$scope',
        '$location', 'authService', 'apiService', '$stateParams', '$window', '$rootScope',
        'cssInjector', 'profilesService', '$state', 'profile', 'isInUse', 'industries',
        'profileLevels', 'jobTitles', 'organizations', 'profileCategories', 'profileTags', 'projects',
        'dialogService', 'treeItems', 'medalRules', '$controller', 'questionDisplayRulesEnum', 'passCriteriaEnum', '$translate', 'localStorageService',
        function ($scope, $location, authService, apiService, $stateParams, $window, $rootScope,
            cssInjector, profilesService, $state, profile, isInUse, industries,
            profileLevels, jobTitles, organizations, profileCategories, profileTags, projects,
            dialogService, treeItems, medalRules, $controller, questionDisplayRulesEnum, passCriteriaEnum, $translate, localStorageService) {
            cssInjector.removeAll();
            cssInjector.add('views/profiles/new-knowledge-profile.css');
            var authData = localStorageService.get('authorizationData');
            $scope.currentUser = authData.user;
            if (!profile.id > 0) {
                if ($scope.currentUser) {
                    profile.organizationId = $scope.currentUser.organizationId
                }
            }
            $scope.profileTypeId = 5;
            $scope.profileUrlModifier = 'knowledge';
            $scope.medalRules = medalRules;
            $scope.organizations = organizations;
            $scope.profileTags = profileTags;
            $scope.projects = projects;
            $scope.init = function () {
                $scope.passCriteriaEnum = passCriteriaEnum;
                $scope.passCriteria = [{ id: passCriteriaEnum.passScore, name: $translate.instant('SOFTPROFILE_PASS_SCORE') },
                { id: passCriteriaEnum.medalRules, name: $translate.instant('SOFTPROFILE_MEDAL_RULES') }];
                $scope.passCriterion = profile.medalRuleId ? passCriteriaEnum.medalRules : passCriteriaEnum.passScore;
                setMedalRulesRequired($scope.passCriterion);
            };
            var setMedalRulesRequired = function (passCriterion) {
                $scope.isMedalRuleRequired = isMedalRuleRequired(passCriterion);
            };
            var isMedalRuleRequired = function (passCriterion) {
                return passCriterion == passCriteriaEnum.medalRules;
            };

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

            $scope.gotoPerformanceGroup = function () {
                if (profile.id > 0) {
                    $location.path("/home/" + $scope.profileUrlModifier + "/" + profile.id + "/performancegroups");
                }
                else {
                    dialogService.showNotification($translate.instant("PLEASE_ADD_PROFILE_DETAIL"), "error");
                }
            }
            $scope.gotoSendOut = function () {
                if (profile.id > 0) {
                    $location.path("/home/" + $scope.profileUrlModifier + "/" + profile.id + "/milestones");
                }
                else {
                    dialogService.showNotification($translate.instant("PLEASE_ADD_PROFILE_DETAIL"), "error");
                }
            }
        }])
    .controller('KnowledgeProfilePerformanceGroupsCtrl', ['$scope', 'localStorageService', 'authService', 'profilesService', 'apiService', '$window',
        '$rootScope', 'cssInjector', 'performanceGroupsService', '$stateParams', '$state', 'dialogService',
        'performanceGroups', 'performanceGroupsFilter', 'isProfileInUse', 'loadQuery', 'organizations', 'industries', 'skills', 'levels', 'hideFilter', 'profileTypeId', '$translate', 'performanceGroup', 'profile', '$location', 'profileTypeEnum',
        function ($scope, localStorageService, authService, profilesService, apiService, $window, $rootScope, cssInjector,
            performanceGroupsService, $stateParams, $state, dialogService, performanceGroups, performanceGroupsFilter, isProfileInUse,
            loadQuery, organizations, industries, skills, levels, hideFilter, profileTypeId, $translate, performanceGroup, profile, $location, profileTypeEnum) {
            cssInjector.add('views/profiles/new-soft-profile.css');
            $scope.profile = profile;
            $scope.profileUrlModifier = 'knowledge';
            $scope.performanceGroup = _.clone(performanceGroup);
            var authData = localStorageService.get('authorizationData');
            $scope.currentUser = authData.user;
            $scope.authService = authService;
            function isDisabled(organizationId, action) {
                if ($scope['Performance Groups' + organizationId + action] == undefined) {
                    $scope['Performance Groups' + organizationId + action] = !authService.hasPermition(organizationId, 'Performance Groups', action);
                }
                return $scope['Performance Groups' + organizationId + action];
            }

            $scope.isDisabled = isDisabled;

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
                },
                processTable: function (data, idField, foreignKey, rootLevel) {
                    var hash = {};

                    for (var i = 0; i < data.length; i++) {
                        var item = data[i];
                        item.text = item.name;
                        var id = item[idField];
                        var parentId = item[foreignKey];

                        hash[id] = hash[id] || [];
                        hash[parentId] = hash[parentId] || [];

                        item.items = hash[id];
                        hash[parentId].push(item);
                    }
                    return hash[rootLevel];
                }
            }
            $scope.pgInit = function () {
                $('[id=ddlSkills]').select2();
                $('[id=ddlTargetGroup]').select2();
            }

            skills.push({ id: null, name: $translate.instant('SOFTPROFILE_SELECT_SKILL'), parentId: "0" });

            $scope.treeSkillsData = new kendo.data.HierarchicalDataSource({
                data: $scope.private.processTable(skills, "id", "parentId", 0)
            });

            $scope.skillsFlatList = profilesService.flattenSkillsList(skills);

            $scope.skillSelected = function (item) {
                $scope.filter.skillId = item.id;
                $scope.doFilter();
            }

            profilesService.jobPositionList().then(function (data) {
                $scope.selectJobPositionsOptions = data;
            });

            if (organizations) {
                $scope.organizations = organizations.sort(sortByName);
            } else {
                $scope.organizations = []
            }
            if (industries) {
                $scope.industries = industries;
            } else {
                $scope.industries = []
            }
            if (levels) {
                $scope.levels = levels;
            } else {
                $scope.levels = []
            }

            function sortByName(a, b) {
                var aName = a.name.toLowerCase();
                var bName = b.name.toLowerCase();
                return ((aName < bName) ? -1 : ((aName > bName) ? 1 : 0));
            }

            $scope.profileId = $stateParams.profileId;
            $scope.hideFilter = hideFilter;

            $scope.performanceGroups = performanceGroups;

            $scope.performanceGroupsFilter = performanceGroupsFilter;

            $scope.edit = function (id, index) {
                //$location.path($location.path() + '/edit/' + id);
                dialogService.showNotification("Coming Soon", "info");
            };

            $scope.delete = function (id) {

                dialogService.showYesNoDialog($translate.instant('COMMON_CONFIRM'), $translate.instant('COMMON_ARE_YOU_SURE_YOU_WANT_TO_DELETE')).then(
                    function () {
                        var item = $scope.private.getById(id, $scope.performanceGroups);
                        var index = $scope.performanceGroups.indexOf(item);
                        apiService.remove("Performance_groups", id).then(function (data) {
                            if (data) {
                                performanceGroupsService.remove(index);
                                profilesService.updateTree();
                            }
                        }, function (message) {
                            dialogService.showNotification(message, 'warning');
                        });
                    },
                    function () {
                        //alert('No clicked');
                    });
            }
            $scope.openPerformancegroup = function (id) {
                if (id > 0) {
                    var performanceGroupItem = _.find($scope.profile.performanceGroups, function (item) {
                        return item.id == id;
                    })
                    $scope.performanceGroup = _.clone(performanceGroupItem);
                    $("#addperformancegroup").modal("show");
                }
                else {
                    $scope.performanceGroup = _.clone(performanceGroup);
                    $("#addperformancegroup").modal("show");
                }
            }
            $scope.addNewPerformanceGroup = function () {
                if ($scope.formPerformanceGroup.$valid) {
                    var item = angular.copy($scope.performanceGroup);
                    item.industry = null;
                    item.profile = null;
                    if (item.link_PerformanceGroupSkills) {
                        if (!item.link_PerformanceGroupSkills.length > 0) {
                            item.link_PerformanceGroupSkills = null;
                        }
                    }
                    else {
                        item.link_PerformanceGroupSkills = null;
                    }
                    item.trainings = null;
                    item.goals = null;
                    item.questions = null;
                    if (($scope.performanceGroup.profile) && (($scope.performanceGroup.profile.scaleSettingsRuleId == 2) || ($scope.performanceGroup.profile.scaleSettingsRuleId == 5))) {
                        if (item.scaleId != null) {
                            item.scale.id = item.scaleId;
                        }
                    }
                    else {
                        item.scale = null;
                        item.scaleId = null;
                    }
                    item.scorecardGoals = []
                    if (!($scope.performanceGroup.id > 0)) {
                        apiService.add("Performance_groups", item).then(function (id) {
                            if (id > 0) {
                                $("#addperformancegroup").modal("hide");
                                performanceGroupsService.load("&$filter=ProfileId eq " + $stateParams.profileId);
                            }
                        })
                    }
                    else {
                        // Edit
                        apiService.update("Performance_groups", $scope.performanceGroup).then(function (data) {
                            if (data) {
                                _.each($scope.performanceGroups, function (pgItem) {
                                    if (pgItem.id == $scope.performanceGroup.id) {
                                        pgItem.name = $scope.performanceGroup.name;
                                        pgItem.description = $scope.performanceGroup.description;
                                    }
                                });
                                $("#addperformancegroup").modal("hide");
                            }
                        });


                    }
                }
            }

            $scope.clone = function (id) {
                performanceGroupsService.clone(id).then(function (data) {
                    ($scope.hideFilter) ? performanceGroupsService.load("&$filter=ProfileId eq " + $stateParams.profileId) : $scope.doFilter();
                },
                    function (data) {
                        console.log(data);
                    })
            }

            $scope.onUserAssignGridDataBound = function (e) {
                var grid = e.sender;
                if (grid.dataSource.total() == 0) {
                    var colCount = grid.columns.length;
                    $(e.sender.wrapper)
                        .find('tbody')
                        .append('<tr class="kendo-data-row"><td colspan="' + colCount + '" class="no-data">There is no data to show in the grid.</td></tr>');
                }

            };

            function displayOrderUpdate(pgId) {
                var seqNo = $('.order' + pgId)[0].value;
                performanceGroupsService.updatePerformanceGroupOrder(pgId, seqNo);
                var item = $scope.private.getById(pgId, $scope.performanceGroups);
                item.seqNo = seqNo;
                //var grid = $("#pgGrid").data("kendoGrid");
                //grid.dataSource.sort({ field: "seqNo", dir: "asc" });
            }

            $scope.displayOrderUpdate = displayOrderUpdate;

            $scope.gridOptions = {
                dataSource: performanceGroupsService.dataSource(),
                dataBound: $scope.onUserAssignGridDataBound,
                //detailInit: detailInit,
                columns: [
                    { field: "name", title: $translate.instant('COMMON_PERFORMANCE_GROUP'), width: "200px" },
                    { field: "description", title: $translate.instant('COMMON_DESCRIPTION'), width: "210px", template: "<div class='readmoreText' title='#= description #'>#= description # </div>" },
                    //{
                    //    field: "skills",
                    //    title: $translate.instant('SOFTPROFILE_SKILLS'),
                    //    width: "210px",
                    //    filterable: false,
                    //    template: function (dataItem) {
                    //        return "<div ng-repeat='skill in dataItem.skills'>{{skill.name}}</div>";
                    //    },
                    //},
                    //{
                    //    field: "skillsDescription",
                    //    title: $translate.instant('SOFTPROFILE_SKILL_DESCRIPTION'),
                    //    width: "210px",
                    //    filterable: false,
                    //    template: function (dataItem) {
                    //        return "<div ng-repeat='skill in dataItem.skills'>{{skill.description}}</div>";
                    //    },
                    //},
                    {
                        field: "seqNo",
                        title: $translate.instant('SOFTPROFILE_ORDER'),
                        width: "120px",
                        template: "<input style='width:100%'  class='order#= id #' type='number' onchange=\"angular.element(this).scope().displayOrderUpdate(#= id #)\" min='0'  value='#= seqNo ? seqNo : 0 #'/>"
                    },
                    {
                        field: "actions",
                        title: $translate.instant('COMMON_ACTIONS'),
                        width: "120px",
                        filterable: false,
                        sortable: false,
                        template: function (dataItem) {
                            var res = "<div class='icon-groups'><a class='fa fa-pencil fa-lg hide' ng-click='edit(" + dataItem.id + ", " + performanceGroupsService.list().indexOf(dataItem) + ")' ></a>";
                            if (!isProfileInUse && !isDisabled(dataItem.organizationId, authService.actions.Create)) {
                                res += "<a class='fa fa-copy fa-lg' ng-click='clone(" + dataItem.id + ")'></a>"
                            }

                            if (!isProfileInUse && !isDisabled(dataItem.organizationId, authService.actions.Delete)) {
                                res += "<a class='fa fa-trash fa-lg' ng-click='delete(" + dataItem.id + ")'></a>"
                            }
                            res += "</div>";

                            return res;
                        },
                    },
                ],
                sortable: true,
                columnMenu: false,
                filterable: true,
                pageable: true,
            };

            $scope.tooltipOptions = {
                filter: "th.k-header", // show tooltip only on these elements
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
            };


            $scope.goBack = function back() {
                $state.go('^', null, { reload: true });
            }

            $scope.doSearch = function (searchText) {
                $scope.gridInstance.dataSource.filter([
                    {
                        logic: "or",
                        filters: [
                            {
                                field: "name",
                                operator: "contains",
                                value: searchText
                            },
                            {
                                field: "description",
                                operator: "contains",
                                value: searchText
                            },
                        ]
                    }]);
            }

            $scope.$on("kendoRendered", function (event) {
                if (event.targetScope.performanceGroupsGrid) {
                    $scope.gridInstance = event.targetScope.performanceGroupsGrid;
                }
            });

            $scope.addPerformanceGroupFromTemplate = function () {
                var parameters = [{ key: "IsTemplate", value: true }];
                var getQuery = "(IsTemplate eq true)";

                dialogService.showSelectableGridDialog("Select Performance Group", ["name", "description"], "Performance_groups", "Name", getQuery, parameters, true).then(
                    function (data) {
                        apiService.add("profiles/" + $stateParams.profileId + "/performance_groups/copy_from", data).then(function (data) {
                            dialogService.showNotification("Performance Group Add from template", "success");
                            $scope.gotoSkills();
                            //($scope.hideFilter) ? performanceGroupsService.load("&$filter=ProfileId eq " + $stateParams.profileId) : $scope.doFilter();
                            //profilesService.updateTree();
                        }, function (message) {
                            dialogService.showNotification(message, 'warning');
                        });
                    });
            }

            $scope.pgTemplates = new kendo.data.ObservableArray([]);
            $scope.pgTemplateDataSource = new kendo.data.DataSource({
                type: "json",
                data: $scope.pgTemplates,
                pageSize: 10,
                schema: {
                    model: {
                        id: "id",
                        fields: {
                            id: { type: 'string', },
                            name: { type: 'string' },
                            description: { type: 'string' },
                        }
                    }
                },
                sort: {
                    field: "name",
                    dir: "asc"
                },
            });
            $scope.pgTemplateGridOptions = {
                dataSource: $scope.pgTemplateDataSource,
                columns: [
                    { field: "name", title: $translate.instant('COMMON_PERFORMANCE_GROUP'), width: "100px" },
                    { field: "description", title: $translate.instant('COMMON_DESCRIPTION'), width: "170px", template: "<div class='readmoreText' title='#= description #'>#= description # </div>" },
                    {
                        field: "actions", title: $translate.instant('COMMON_ACTIONS'), width: "100px",
                        template: function (dataItem) {
                            var res = "<div class='icon-groups'>"
                            res += "<a class='fa fa-plus-square fa-lg' title='Use PG' ng-click=\"selectPerformanceGroupTemplate('" + dataItem.id + "')\"></a>"
                            res += "</div>"
                            return res;
                        },
                    },
                ],
                sortable: true,
                pageable: true,
                filterable: true,
            };

            $scope.openSearchPerformanceGroupModal = function () {
                $scope.performanceGroupTemplates = [];
                var projectId = $scope.profile.projectId ? $scope.profile.projectId : 0;
                profilesService.getProjectPerformanceGroupTemplates(projectId).then(function (data) {

                    data = _.filter(data, function (pg) {
                        if (pg.profileTypes.length > 0) {
                            var isKT = _.any(pg.profileTypes, function (pt) {
                                return pt.id == profileTypeEnum.Knowledge;
                            });
                            if (isKT) {
                                return pg;
                            }
                        };
                    })

                    $scope.performanceGroupTemplates = data;

                    $scope.pgTemplates = data;
                    $scope.pgTemplateDataSource = new kendo.data.DataSource({
                        type: "json",
                        data: $scope.pgTemplates,
                        pageSize: 10,
                        schema: {
                            model: {
                                id: "id",
                                fields: {
                                    id: { type: 'string', },
                                    name: { type: 'string' },
                                    description: { type: 'string' },
                                }
                            }
                        },
                        sort: {
                            field: "name",
                            dir: "asc"
                        },
                    });
                    var grid = $("#pgTemplateGrid").data("kendoGrid");
                    if (grid) {
                        grid.setDataSource($scope.pgTemplateDataSource)
                    }

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
                            id: templatePerformanceGroupId,
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
                            profileId: $scope.profileId,
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

                        apiService.add("profiles/" + $stateParams.profileId + "/performance_groups/copy_from", [$scope.performanceGroup]).then(function (data) {
                            dialogService.showNotification("Performance Group Add from template", "success");
                            $scope.performanceGroups.push($scope.performanceGroup);
                            $scope.gotoSkills();
                            //($scope.hideFilter) ? performanceGroupsService.load("&$filter=ProfileId eq " + $stateParams.profileId) : $scope.doFilter();
                            //profilesService.updateTree();
                        }, function (message) {
                            dialogService.showNotification(message, 'warning');
                        });

                        //$("#addperformancegroup").modal("show");
                        //$scope.profile.performanceGroups.push($scope.performanceGroup);
                    });
                }
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



            $scope.filter = {
                performanceGroupId: null,
                organizationId: null,
                industryId: null,
                skillId: null,
                levelId: null,
                isShowActive: true,
                isTemplate: false,
                isShowInactive: false,
                jobPositions: null,
                subIndustryId: null,
            };

            $scope.$watch('filter.jobPositions', function () {
                ($scope.hideFilter) ? '' : $scope.doFilter();
            });

            $scope.doFilter = function () {

                var query = "";

                if ($scope.filter.performanceGroupId > 0) {
                    if (query) {
                        query += "and";
                    }
                    query += "((Link_PerformanceGroupSkills/any(j:j/PerformanceGroupId eq " + $scope.filter.performanceGroupId + "))or(Link_PerformanceGroupSkills/any(j:j/PerformanceGroupId eq " + $scope.filter.performanceGroupId + ")))";
                }

                if ($scope.filter.organizationId > 0) {
                    if (query) {
                        query += "and";
                    }
                    query += "(OrganizationId eq " + $scope.filter.organizationId + ")";
                }

                if ($scope.filter.industryId) {
                    if (query) {
                        query += "and";
                    }
                    query += "(IndustryId eq " + $scope.filter.industryId + ")";
                }

                if ($scope.filter.levelId > 0) {
                    if (query) {
                        query += "and";
                    }
                    query += "(LevelId eq " + $scope.filter.levelId + ")";
                }

                if ($scope.filter.skillId > 0) {
                    if (query) {
                        query += "and";
                    }
                    query += "((Link_PerformanceGroupSkills/any(j:j/SkillId eq " + $scope.filter.skillId + "))or(Link_PerformanceGroupSkills/any(j:j/SubSkillId eq " + $scope.filter.skillId + ")))";
                }

                if ($scope.filter.isTemplate) {
                    if (query) {
                        query += "and";
                    }
                    query += "(IsTemplate eq " + $scope.filter.isTemplate + ")";
                }

                if ($scope.filter.isShowActive) {
                    if ($scope.filter.isShowActive) {
                        if (query) {
                            query += "and";
                        }
                        query += "(IsActive eq " + $scope.filter.isShowActive + ")";
                    }
                }

                if ($scope.filter.jobPositions != null) {
                    if ($scope.filter.jobPositions.length > 0) {
                        if (query) {
                            query += "and";
                        }
                        query += "(";
                        angular.forEach($scope.filter.jobPositions, function (key, index) {
                            if (index != 0) {
                                query += "or";
                            }
                            query += "(JobPositions/any(j:j/Id eq " + key.id + "))";
                        });
                        query += ")";

                    }
                }

                if (query) {
                    query = "&$filter=" + query;
                } else {
                    query = "";
                }

                performanceGroupsService.load(query, profileTypeId);
            };

            $scope.gotoSkills = function () {
                if (($scope.profileId > 0) && ($scope.performanceGroups.length > 0)) {
                    $location.path("/home/knowledge/" + $scope.profileId + "/skills");
                }
                else {
                    dialogService.showNotification($translate.instant("MYPROJECTS_PROJECTPROFILES_PLEASE_ADD_PERFORMANCE_GROUP_IN_PERFORMANCE_GROUP_SETUP"), "error");
                }
            }
            $scope.gotoQuestions = function () {
                if (($scope.profileId > 0) && ($scope.performanceGroups.length > 0)) {
                    $location.path("/home/knowledge/" + $scope.profileId + "/questions");
                }
                else {
                    dialogService.showNotification($translate.instant("MYPROJECTS_PROJECTPROFILES_PLEASE_ADD_PERFORMANCE_GROUP_IN_PERFORMANCE_GROUP_SETUP"), "error");
                }
            }
            $scope.gotoTrainings = function () {
                if (($scope.profileId > 0) && ($scope.performanceGroups.length > 0)) {
                    $location.path("/home/knowledge/" + $scope.profileId + "/trainings");

                }
                else {
                    dialogService.showNotification($translate.instant("MYPROJECTS_PROJECTPROFILES_PLEASE_ADD_PERFORMANCE_GROUP_IN_PERFORMANCE_GROUP_SETUP"), "error");
                }
            }
        }])

    .controller('KnowledgeProfileSkillsCtrl', ['$scope', 'localStorageService', 'authService', 'apiService',
        'cssInjector', 'performanceGroupsService', '$stateParams', '$state', 'dialogService',
        'performanceGroups', 'isProfileInUse', 'skills', 'profileTypeId', '$translate', '$location',
        function ($scope, localStorageService, authService, apiService, cssInjector, performanceGroupsService,
            $stateParams, $state, dialogService, performanceGroups, isProfileInUse,
            skills, profileTypeId, $translate, $location) {
            cssInjector.add('views/profiles/new-soft-profile.css');
            var authData = localStorageService.get('authorizationData');
            $scope.currentUser = authData.user;
            $scope.authService = authService;
            $scope.pgInit = function () {
                $('[id=ddlSkills]').select2();
                $('[id=ddlTargetGroup]').select2();
            }
            $scope.profileId = $stateParams.profileId;
            $scope.profileUrlModifier = 'knowledge';
            $scope.performanceGroups = performanceGroups;
            $scope.goBack = function back() {
                $state.go('^', null, { reload: true });
            }
            // Skills
            $scope.action = authService.actions.Create;
            function isPGSkillDisabled() {
                if ($scope['Performance Groups' + $scope.currentUser.organizationId] == undefined) {
                    $scope['Performance Groups' + $scope.currentUser.organizationId] = !authService.hasPermition($scope.currentUser.organizationId, 'Performance Groups', $scope.action);
                }
                return $scope['Performance Groups' + $scope.currentUser.organizationId];
            }
            $scope.skills = new kendo.data.ObservableArray(skills);
            $scope.skillsDataSource = new kendo.data.DataSource({
                type: "json",
                data: $scope.skills,
                pageSize: 10,
                schema: {
                    model: {
                        id: "id",
                        fields: {
                            id: { type: 'string', },
                            name: { type: 'string' },
                            description: { type: 'string' },
                            performanceGroupName: { type: 'string' },
                        }
                    }
                },
                sort: {
                    field: "name",
                    dir: "asc"
                },
            });
            $scope.skillsGridOptions = {
                dataSource: $scope.skillsDataSource,
                columns: [
                    { field: "performanceGroupName", title: $translate.instant('MYPROJECTS_PERFORMANCE_GROUP_NAME'), width: "130px", },

                    { field: "name", title: $translate.instant('COMMON_SKILL'), width: "130px" },
                    { field: "description", title: $translate.instant('SOFTPROFILE_SKILL_DESCRIPTION'), width: "130px", template: "<div class='readmoreText' title='#= description #'>#= description # </div>" },
                    {
                        field: "benchmark",
                        title: $translate.instant('SOFTPROFILE_BENCHMARK'),
                        width: "130px",
                        template: function (dataItem) {
                            return "<input style='width:90%' " + (isPGSkillDisabled() ? "disabled=\"disabled\"" : "") + " class='form-control tab-control benchmark" +
                                dataItem.id + "' type='number' ng-focus=\"startListenBenchmark('"
                                + dataItem.id + "')\" ng-blur=\"stopListenBenchmark()\" min='0'  value='" + dataItem.benchmark + "'/>";
                        }
                    },
                    {
                        field: "weight",
                        title: $translate.instant('SOFTPROFILE_WEIGHT'),
                        width: "130px",
                        template: function (dataItem) {
                            return "<input style='width:90%' " + (isPGSkillDisabled() ? "disabled=\"disabled\"" : "") + " name='weight#= id #' class='form-control tab-control weight#= id #' type='text' ng-model='dataItem.weight' min='0'  value='#= weight ? weight : 0 #'/>"
                        }
                    },
                    {
                        field: "csf",
                        title: $translate.instant('SOFTPROFILE_CSF'),
                        width: "200px",
                        template: function (dataItem) {
                            return "<input style='width:90%' " + (isPGSkillDisabled() ? "disabled=\"disabled\"" : "") + " name='csf#= id #' class='form-control tab-control csf#= id #' type='text' ng-model='dataItem.csf' min='0'  value='#= csf ? csf : '' #'/>"
                        }
                    },
                    {
                        field: "action",
                        title: $translate.instant('COMMON_ACTION'),
                        width: "200px",
                        template: "<input style='width:90%' " + (isPGSkillDisabled() ? "disabled=\"disabled\"" : "") + " name='action#= id #' class='form-control tab-control action#= id #' type='text' ng-model='dataItem.action' min='0'  value='#= action ? action : '' #'/>"
                    },
                    {
                        field: "actions", title: $translate.instant('COMMON_ACTIONS'), width: "100px", hidden: isPGSkillDisabled(),
                        template: function (dataItem) {
                            var res = "<div class='icon-groups'>"

                            if (!isPGSkillDisabled()) {
                                res += "<a class='fa fa-pencil fa-lg' title='Edit Skill' ng-click=\"editSkill('" + dataItem.id + "')\"></a>"
                                res += "<a class='fa fa-trash fa-lg' ng-click=\"deleteSkill('" + dataItem.id + "',$index)\"></a>"
                            }

                            res += "</div>"
                            return res;
                        },
                    },
                ],
                sortable: true,
                pageable: true,
                filterable: true,
            };
            $scope.skillsGridTooltipOptions = {
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
            };

            $scope.openNewSkillModal = function (performanceGroupId) {
                $scope.link_PerformanceGroupSkill = {
                    trainings: [],
                    questions: [],
                    skill1: null,
                    skill: null,
                    id: 0,
                    name: "",
                    description: "",
                    performanceGroupId: null,
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

            $scope.skillTemplates = [];
            $scope.skillsTemplateDataSource = new kendo.data.DataSource({
                type: "json",
                data: $scope.skillTemplates,
                pageSize: 10,
                schema: {
                    model: {
                        id: "id",
                        fields: {
                            id: { type: 'string', },
                            name: { type: 'string' },
                            description: { type: 'string' },
                            performanceGroupName: { type: 'string' },
                        }
                    }
                },
                sort: {
                    field: "name",
                    dir: "asc"
                },
            });
            $scope.skillsTemplateGridOptions = {
                dataSource: $scope.skillsTemplateDataSource,
                columns: [
                    { field: "name", title: $translate.instant('COMMON_SKILL'), width: "100px" },
                    { field: "description", title: $translate.instant('SOFTPROFILE_SKILL_DESCRIPTION'), width: "170px", template: "<div class='readmoreText' title='#= description #'>#= description # </div>" },
                    {
                        field: "actions", title: $translate.instant('COMMON_ACTIONS'), width: "100px", hidden: isPGSkillDisabled(),
                        template: function (dataItem) {
                            var res = "<div class='icon-groups'>"
                            if (!isPGSkillDisabled()) {
                                res += "<a class='fa fa-plus-square fa-lg' title='Edit Skill' ng-click=\"useSkill('" + dataItem.id + "')\"></a>"
                            }
                            res += "</div>"
                            return res;
                        },
                    },
                ],
                sortable: true,
                pageable: true,
                filterable: true,
            };
            $scope.addSkillFromTemplate = function () {
                apiService.getAll("skills?$orderby=Name&$filter=(ParentId eq null)and(ProfileTypeId eq " + profileTypeId + " or ProfileTypeId eq null)and((OrganizationId eq " + $scope.currentUser.organizationId + ")or(OrganizationId eq null))and(IsTemplate eq true)").then(function (data) {
                    $scope.skillTemplates = data;
                    $scope.skillsTemplateDataSource = new kendo.data.DataSource({
                        type: "json",
                        data: $scope.skillTemplates,
                        pageSize: 10,
                        schema: {
                            model: {
                                id: "id",
                                fields: {
                                    id: { type: 'string', },
                                    name: { type: 'string' },
                                    description: { type: 'string' },
                                    performanceGroupName: { type: 'string' },
                                }
                            }
                        },
                        sort: {
                            field: "name",
                            dir: "asc"
                        },
                    });
                    var grid = $("#skillsTemplateGrid").data("kendoGrid");
                    if (grid) {
                        grid.setDataSource($scope.skillsTemplateDataSource)
                    }
                    $("#skillTemplates").modal("show");
                });

            }
            $scope.useSkill = function (templateSkillId) {
                var templateSkill = _.find($scope.skillTemplates, function (item) {
                    return item.id = templateSkillId
                });
                if (templateSkill) {
                    $("#skillTemplates").modal("hide");
                    $scope.link_PerformanceGroupSkill = {
                        trainings: [],
                        questions: [],
                        skill1: null,
                        skill: null,
                        id: 0,
                        name: templateSkill.name,
                        description: templateSkill.description,
                        performanceGroupId: null,
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
            }
            $scope.addNewSkill = function () {
                if ($scope.link_PerformanceGroupSkill.id == 0) {
                    if ($scope.link_PerformanceGroupSkill.performanceGroupId > 0) {
                        _.each($scope.performanceGroups, function (item) {
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
                                performanceGroupsService.addPerformanceGroupSkill($scope.link_PerformanceGroupSkill.performanceGroupId, skillIds).then(function (skilldata) {
                                    $scope.link_PerformanceGroupSkill.id = skilldata[0].id;
                                    $scope.link_PerformanceGroupSkill.skill.id = skilldata[0].skillId;
                                    $scope.link_PerformanceGroupSkill.skillId = skilldata[0].skillId;
                                    performanceGroupsService.getProfileSkills($stateParams.profileId).then(function (skillsData) {
                                        skills = skillsData;
                                        $scope.skills = new kendo.data.ObservableArray(skills);
                                        $scope.skillsDataSource = new kendo.data.DataSource({
                                            type: "json",
                                            data: $scope.skills,
                                            pageSize: 10,
                                            schema: {
                                                model: {
                                                    id: "id",
                                                    fields: {
                                                        id: { type: 'string', },
                                                        name: { type: 'string' },
                                                        description: { type: 'string' },
                                                        performanceGroupName: { type: 'string' },
                                                    }
                                                }
                                            },
                                            sort: {
                                                field: "name",
                                                dir: "asc"
                                            },
                                        });
                                        var grid = $("#skillsGrid").data("kendoGrid");
                                        if (grid) {
                                            grid.setDataSource($scope.skillsDataSource)
                                        }
                                        $("#skillModal").modal("hide");
                                    })
                                });
                            }
                        });
                    }
                    else {
                        _.each($scope.performanceGroups, function (item) {
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
                                    _.each($scope.performanceGroups, function (item) {
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
                        _.each($scope.performanceGroups, function (item) {
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
            $scope.editSkill = function (skillId) {
                if (skillId) {
                    //$location.path($location.path() + '/editSkill/' + id);
                    _.each($scope.performanceGroups, function (item) {
                        _.each(item.link_PerformanceGroupSkills, function (skillItem) {
                            if (skillItem.skillId == skillId) {
                                if (skillItem.weight) {
                                    skillItem.weight = parseInt(skillItem.weight);
                                }
                                if (skillItem.skill) {
                                    skillItem.name = skillItem.skill.name;
                                    skillItem.description = skillItem.skill.description;
                                }
                                $scope.link_PerformanceGroupSkill = angular.copy(skillItem);;
                                return (false);
                            }
                        })
                    });
                    $("#skillModal").modal("show");
                    $("#skillModal .modal-title").html($translate.instant('MYPROJECTS_PROJECTPROFILES_EDIT_SKILL_DETAILS'))

                }
            }
            $scope.deleteSkill = function (id) {
                dialogService.showYesNoDialog($translate.instant('COMMON_CONFIRM'), $translate.instant('COMMON_ARE_YOU_SURE_YOU_WANT_TO_DELETE')).then(
                    function () {

                        var item = _.find($scope.skills, function (skill) {
                            return skill.id == id;
                        });

                        if (item) {
                            var index = $scope.skills.indexOf(item);
                            apiService.remove("RemoveSkillFromPerformanceGroup/" + item.performanceGroupId, id).then(function (data) {
                                if (data == true) {
                                    $scope.skills.splice(index, 1);
                                }
                            }, function (message) {
                                dialogService.showNotification(message, 'warning');
                            });
                        }
                    },
                    function () {

                    });

            }
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

            $scope.gotoQuestions = function () {
                if (($scope.profileId > 0) && ($scope.skills.length > 0)) {
                    $location.path("/home/knowledge/" + $scope.profileId + "/questions");
                }
                else {
                    dialogService.showNotification($translate.instant("MYPROJECTS_PROJECTPROFILES_PLEASE_ADD_SKILL_DETAILS"), "error");
                }
            }
            $scope.gotoTrainings = function () {
                if (($scope.profileId > 0) && ($scope.skills.length > 0)) {
                    $location.path("/home/knowledge/" + $scope.profileId + "/trainings");

                }
                else {
                    dialogService.showNotification($translate.instant("MYPROJECTS_PROJECTPROFILES_PLEASE_ADD_SKILL_DETAILS"), "error");
                }
            }
        }])
    .controller('KnowledgeProfileQuestionsCtrl', ['$scope', 'localStorageService', 'authService', 'apiService',
        'cssInjector', 'performanceGroupsService', '$stateParams', '$state', 'dialogService',
        'performanceGroups', 'isProfileInUse', 'profileTypeEnum', 'skills', 'profileTypeId',
        '$translate', '$location', 'answerTypesEnum', 'defaultQuestionValuesByAnswerTypeEnum',
        'answerTypes', 'materialTypeEnum', 'Upload',
        function ($scope, localStorageService, authService, apiService, cssInjector, performanceGroupsService,
            $stateParams, $state, dialogService, performanceGroups, isProfileInUse, profileTypeEnum,
            skills, profileTypeId, $translate, $location, answerTypesEnum, defaultQuestionValuesByAnswerTypeEnum,
            answerTypes, materialTypeEnum, Upload) {
            cssInjector.add('views/profiles/new-soft-profile.css');
            var authData = localStorageService.get('authorizationData');
            $scope.currentUser = authData.user;
            $scope.authService = authService;
            $scope.profileId = $stateParams.profileId;
            $scope.profileUrlModifier = 'knowledge';
            $scope.performanceGroups = performanceGroups;
            $scope.skills = skills;
            $scope.materialTypeEnum = materialTypeEnum;
            $scope.goBack = function back() {
                $state.go('^', null, { reload: true });
            }
            $scope.profileTypeEnum = profileTypeEnum;
            $scope.questionTypesEnum = answerTypesEnum;
            $scope.answerTypes = answerTypes;
            // questions

            var allQuestions = prepareQuestions();
            $scope.questions = new kendo.data.ObservableArray(allQuestions);
            $scope.questionsDataSource = new kendo.data.DataSource({
                type: "json",
                data: $scope.questions,
                pageSize: 10,
                schema: {
                    model: {
                        id: "id",
                        fields: {
                            id: { type: 'string', },
                            question: { type: 'string' },
                            skill: { type: 'string' },
                        }
                    }
                },
                sort: {
                    field: "name",
                    dir: "asc"
                },
            });
            $scope.questionsGridOptions = {
                dataSource: $scope.questionsDataSource,
                selectable: false,
                sortable: true,
                pageable: true,
                columns: [
                    { field: "number", title: '#', width: '50px' },

                    { field: "performanceGroupName", title: $translate.instant('MYPROJECTS_PERFORMANCE_GROUP_NAME'), width: '130px' },
                    { field: "skill", title: $translate.instant('SOFTPROFILE_SKILL_SUB_SKILL'), width: '130px' },
                    {
                        field: "answerType",
                        title: $translate.instant('SOFTPROFILE_QUESTION_TYPE'),
                        width: '130px',
                        hidden: profileTypeId == profileTypeEnum.Soft
                    },
                    { field: "question", title: $translate.instant('SOFTPROFILE_QUESTION'), width: '200px' },
                    {
                        field: "seqNo",
                        title: $translate.instant('SOFTPROFILE_ORDER'),
                        width: "100px",
                        template: "<input style='width:90%'  ng-disabled=\"isDisabled()\" ng-class=\"{'invalidSeqNo': dataItem.isWrongSecNo}\"" +
                            "ng-change='validateQuestionsOrder()'  class='order#= id #' type='number' min='0' ng-model=\"dataItem.seqNo\"/>"
                    },
                    {
                        field: "action", title: $translate.instant('COMMON_ACTIONS'), width: '70px', template: "<div class='icon-groups'>" +
                            "<a class='fa fa-pencil fa-lg' ng-click='editQuestion(dataItem.questionId)' ng-disabled=\"isDisabled()\"></a>" +
                            "<a class='fa fa-trash fa-lg' ng-click='removeQuestion(dataItem.questionId)' ng-disabled=\"isDisabled()\"></a>" +
                            "</div>"
                    }
                ]

            }
            $scope.questionsGridTooltipOptions = {
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
            };

            $scope.openNewQuestionModal = function () {
                $scope.pgSkills = skills;
                $scope.question = {
                    id: 0,
                    questionText: "",
                    description: "",
                    answerTypeId: 1,
                    isActive: true,
                    isTemplate: false,
                    organizationId: parseInt($scope.currentUser.organizationId),
                    profileTypeId: profileTypeId,
                    scaleId: null,
                    questionSettings: null,
                    structureLevelId: null,
                    industryId: null,
                    seqNo: 0,
                    points: null,
                    timeForQuestion: null,
                    parentQuestionId: null,
                    performanceGroupId: null,
                    skillId: null,
                    possibleAnswer: null
                }
                if (profileTypeId == profileTypeEnum.Knowledge) {
                    $scope.resetAnswer();
                }
                $("#questionModal").modal("show");
            }
            $scope.resetAnswer = function () {
                $scope.question.secondsForQuestion = 0;
                switch ($scope.question.answerTypeId) {
                    case $scope.questionTypesEnum.singleChoice:
                        $scope.question.points = defaultQuestionValuesByAnswerTypeEnum.singleChoice.points;
                        $scope.question.minutesForQuestion = defaultQuestionValuesByAnswerTypeEnum.singleChoice.minutesForQuestion;
                        $scope.question.possibleAnswer = { answer: [] };
                        break;
                    case $scope.questionTypesEnum.multipleChoice:
                        $scope.question.points = defaultQuestionValuesByAnswerTypeEnum.multipleChoice.points;
                        $scope.question.minutesForQuestion = defaultQuestionValuesByAnswerTypeEnum.multipleChoice.minutesForQuestion;
                        $scope.question.possibleAnswer = { answer: [] };
                        break;
                    case $scope.questionTypesEnum.order:
                        $scope.question.points = defaultQuestionValuesByAnswerTypeEnum.order.points;
                        $scope.question.minutesForQuestion = defaultQuestionValuesByAnswerTypeEnum.order.minutesForQuestion;
                        $scope.question.possibleAnswer = { answer: [] };
                        break;
                    case $scope.questionTypesEnum.numeric:
                        $scope.question.points = defaultQuestionValuesByAnswerTypeEnum.numeric.points;
                        $scope.question.minutesForQuestion = defaultQuestionValuesByAnswerTypeEnum.numeric.minutesForQuestion;
                        $scope.question.possibleAnswer = { answer: null };
                        break;
                    case $scope.questionTypesEnum.text:
                        $scope.question.points = defaultQuestionValuesByAnswerTypeEnum.text.points;
                        $scope.question.minutesForQuestion = defaultQuestionValuesByAnswerTypeEnum.text.minutesForQuestion;
                        $scope.question.possibleAnswer = { answer: null };
                        break;
                }
            };
            $scope.changePeformanceGroup = function () {
                $scope.pgSkills = [];
                $scope.question.skillId = null;
                $scope.question.description = null;
                if ($scope.question.performanceGroupId) {
                    $scope.pgSkills = _.filter(skills, function (item) {
                        return item.performanceGroupId == $scope.question.performanceGroupId;
                    })
                }
            }
            $scope.chageQuestionSkill = function () {
                if ($scope.question.skillId != 0) {
                    var skill = _.find($scope.skills, function (skillItem) {
                        return skillItem.id == $scope.question.skillId;
                    });
                    if (skill) {
                        $scope.question.description = skill.description;
                    }
                }
            }

            $scope.editQuestion = function (questionId) {
                $scope.pgSkills = skills;

                if (profileTypeId == profileTypeEnum.Knowledge) {
                    $scope.resetAnswer();
                }

                if (questionId) {
                    var question = _.find($scope.questions, function (item) {
                        return item.id == questionId;
                    })
                    if (question) {
                        prepareQuestionTimeAfterGet(question);
                        $scope.question = {
                            id: question.questionId,
                            questionText: question.question,
                            description: question.description,
                            answerTypeId: question.answerTypeId,
                            isActive: question.isActive,
                            isTemplate: false,
                            organizationId: parseInt($scope.currentUser.organizationId),
                            profileTypeId: profileTypeId,
                            scaleId: question.scaleId,
                            questionSettings: question.questionSettings,
                            structureLevelId: question.structureLevelId,
                            industryId: question.industryId,
                            seqNo: question.seqNo,
                            points: question.points,
                            timeForQuestion: question.timeForQuestion,
                            minutesForQuestion: question.minutesForQuestion,
                            secondsForQuestion: question.secondsForQuestion,
                            parentQuestionId: null,
                            performanceGroupId: question.performanceGroupId,
                            skillId: question.skillId,
                            possibleAnswer: question.possibleAnswer
                        }
                    }
                }
                $("#questionModal").modal("show");
            }

            function prepareQuestionTimeAfterGet(question) {
                if (question.timeForQuestion) {
                    question.minutesForQuestion = Math.floor(question.timeForQuestion / 60);
                    question.secondsForQuestion = question.timeForQuestion % 60;
                }
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
                                _.each($scope.performanceGroups, function (item) {
                                    if (item.id == $scope.question.performanceGroupId) {
                                        _.each(item.link_PerformanceGroupSkills, function (pgSkillItem) {
                                            if (pgSkillItem.skillId == $scope.question.skillId) {
                                                $scope.question.id = resultData[0].questionId;
                                                //$scope.question.possibleAnswer.answer =  JSON.stringify($scope.question.possibleAnswer.answer)
                                                reloadQuestionGrid();
                                            }
                                        })
                                    }
                                });
                                //dialogService.showNotification('Performance group saved successfully', 'info');
                            }, $scope.showError)

                        }, $scope.showError);

                    }
                }
                else {
                    //Edit
                    if ($scope.question.id > 0) {
                        prepareQuesionTimeBeforeSave($scope.question);
                        apiService.update("questions", $scope.question).then(function (data) {
                            if (data) {
                                dialogService.showNotification($translate.instant('MYPROJECTS_PROJECTPROFILES_QUESTION_UPDATED_SUCCESSFULLY'), 'success');
                                reloadQuestionGrid();
                            }
                            else {
                                dialogService.showNotification($translate.instant('MYPROJECTS_PROJECTPROFILES_QUESTION_UPDATE_FAILED'), 'warning');
                            }
                        },
                            function (error) {
                                dialogService.showNotification(error, 'warning');
                            });
                    }
                }
            }

            $scope.removeQuestion = function (performanceGroupId, questionId) {

                dialogService.showYesNoDialog($translate.instant('COMMON_CONFIRM'), $translate.instant('COMMON_ARE_YOU_SURE_YOU_WANT_TO_DELETE')).then(function () {
                    apiService.remove("questions", questionId).then(function (data) {
                        if (data) {
                            dialogService.showNotification($translate.instant('MYPROJECTS_PROJECTPROFILES_QUESTION_REMOVED_SUCCESSFULLY'), "success")
                            reloadQuestionGrid();
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
            function prepareQuesionTimeBeforeSave(question) {
                question.timeForQuestion = 0
                question.timeForQuestion += question.minutesForQuestion * 60;
                question.timeForQuestion += question.secondsForQuestion;

                if (question.possibleAnswer) {
                    if (question.possibleAnswer.answer) {
                        if (question.possibleAnswer.answer.length > 0) {
                            question.possibleAnswer.answer = JSON.stringify(question.possibleAnswer.answer)
                        }
                    }
                }

            }
            function prepareQuestions() {
                var result = [];
                _.each(performanceGroups, function (performanceGroup) {
                    _.each(performanceGroup.link_PerformanceGroupSkills, function (pgskill) {
                        if (pgskill.questions) {
                            for (var j = 0, qlen = pgskill.questions.length; j < qlen; j++) {
                                var questionText, type, skillId, questionId, seqNo;

                                var question = pgskill.questions[j];
                                (question.questionText) ? questionText = question.questionText : questionText = '';
                                (question.seqNo) ? seqNo = question.seqNo : seqNo = '0';
                                (pgskill.subSkillId) ? type = 'SS' : type = 'MS';
                                (pgskill.subSkillId) ? skillId = pgskill.subSkillId : skillId = pgskill.skillId;
                                var answerType = question && question.answerType ? question.answerType.typeName : '';

                                questionId = question.id;
                                result.push(
                                    {
                                        performanceGroupId: performanceGroup.id,
                                        performanceGroupName: performanceGroup.name,
                                        skillId: skillId,
                                        number: result.length + 1,
                                        skill: pgskill.skill.name,
                                        question: questionText,
                                        description: question.description,
                                        answerTypeId: question.answerTypeId,
                                        answerType: answerType,
                                        isActive: question.isActive,
                                        questionId: questionId,
                                        seqNo: parseInt(seqNo),
                                        type: type,
                                        id: questionId,
                                        points: question.points ? question.points : 0,

                                        scaleId: question.scaleId,
                                        questionSettings: question.questionSettings,
                                        structureLevelId: question.structureLevelId,
                                        industryId: question.industryId,
                                        timeForQuestion: question.timeForQuestion,
                                        parentQuestionId: question.parentQuestionId,
                                        possibleAnswer: question.possibleAnswer
                                    }
                                )
                            }
                        }
                    })
                });
                return result;

            }

            function reloadQuestionGrid() {

                performanceGroupsService.load("&$filter=ProfileId eq " + $stateParams.profileId).then(function (performanceGroupsData) {
                    performanceGroups = performanceGroupsData;
                    var allQuestions = prepareQuestions();
                    $scope.questions = new kendo.data.ObservableArray(allQuestions);
                    $scope.questionsDataSource = new kendo.data.DataSource({
                        type: "json",
                        data: $scope.questions,
                        pageSize: 10,
                        schema: {
                            model: {
                                id: "id",
                                fields: {
                                    id: { type: 'string', },
                                    question: { type: 'string' },
                                    skill: { type: 'string' },
                                }
                            }
                        },
                        sort: {
                            field: "name",
                            dir: "asc"
                        },
                    });
                    var grid = $("#questionsGrid").data("kendoGrid");
                    if (grid) {
                        grid.setDataSource($scope.questionsDataSource)
                    }
                })
            }
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
            function updateAnswerOption(data) {
                $scope.question.possibleAnswer.answer[getIndexById(data.id)] = data;
            }
            $scope.closeOptionWin = function () {
                resetOptionModel();
                $("#questionOptionModal").modal("hide");
            };
            var currentWindow = function () {
                switch ($scope.question.answerTypeId) {
                    case $scope.questionTypesEnum.singleChoice:
                    case $scope.questionTypesEnum.multipleChoice:
                        return $scope.winChoiceOption;
                    case $scope.questionTypesEnum.order:
                        return $scope.winAnswerOrderOption;
                    default:
                        return null;
                }
            };
            $scope.gotoTrainings = function () {
                if (($scope.profileId > 0) && ($scope.questions.length > 0)) {
                    $location.path("/home/knowledge/" + $scope.profileId + "/trainings");

                }
                else {
                    dialogService.showNotification($translate.instant("COMMON_ERROR_ADD_QUESTIONS"), "error");
                }
            }
        }])
    .controller('KnowledgeProfileTrainingsCtrl', ['$scope', 'localStorageService', 'authService', 'apiService',
        'cssInjector', 'performanceGroupsService', 'profileTrainingManager', '$stateParams', '$state', 'dialogService',
        'performanceGroups', 'trainingLevels', 'trainingTypes', 'durationMetrics', 'exerciseMetrics', 'notificationTemplates', 'isProfileInUse', 'profilesTypesEnum', 'skills', 'profileTypeId', '$translate', 'Upload', 'materialTypeEnum', 'reminderEnum', 'globalVariables', '$location',
        function ($scope, localStorageService, authService, apiService, cssInjector, performanceGroupsService, profileTrainingManager,
            $stateParams, $state, dialogService, performanceGroups, trainingLevels, trainingTypes, durationMetrics, exerciseMetrics, notificationTemplates, isProfileInUse, profilesTypesEnum,
            skills, profileTypeId, $translate, Upload, materialTypeEnum, reminderEnum, globalVariables, $location) {
            cssInjector.add('views/profiles/new-soft-profile.css');
            var authData = localStorageService.get('authorizationData');
            $scope.currentUser = authData.user;
            $scope.authService = authService;
            $scope.profileId = $stateParams.profileId;
            $scope.profileUrlModifier = 'knowledge';
            $scope.performanceGroups = performanceGroups;
            $scope.trainingLevels = trainingLevels;
            $scope.trainingTypes = trainingTypes;
            $scope.durationMetrics = durationMetrics;
            $scope.exerciseMetrics = exerciseMetrics;
            $scope.notificationTemplates = notificationTemplates;
            $scope.skills = skills;
            $scope.materialTypes = [
                { name: $translate.instant('COMMON_IMAGE'), value: materialTypeEnum.image },
                { name: $translate.instant('COMMON_DOCUMENT'), value: materialTypeEnum.document },
                { name: $translate.instant('COMMON_AUDIO'), value: materialTypeEnum.audio },
                { name: $translate.instant('COMMON_LINK'), value: materialTypeEnum.link },
                { name: $translate.instant('COMMON_VIDEO'), value: materialTypeEnum.video }
            ];
            $scope.goBack = function back() {
                $state.go('^', null, { reload: true });
            }
            $scope.reminders = [
                { value: -1440, text: $translate.instant('COMMON_BEFORE_1_DAY') },
                { value: -60, text: $translate.instant('COMMON_BEFORE_1_HOUR') },
                { value: -30, text: $translate.instant('COMMON_BEFORE_30_MIN') },
                { value: -15, text: $translate.instant('COMMON_BEFORE_15_MIN') },
                { value: -5, text: $translate.instant('COMMON_BEFORE_5_MIN') }];
            // questions
            $scope.changePeformanceGroup = function () {
                $scope.pgSkills = [];
                $scope.newTraining.skillId = null;
                if ($scope.newTraining.performanceGroupId) {
                    $scope.pgSkills = _.filter(skills, function (item) {
                        return item.performanceGroupId == $scope.newTraining.performanceGroupId;
                    })
                }
            }
            $scope.skillChanged = function () {
                if ($scope.newTraining.skillId > 0) {
                    performanceGroupsService.getTrainingTemplatesBySkill($scope.newTraining.skillId).then(function (data) {
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
                                emailBefore: reminderEnum[0].value,
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

            $scope.trainings = new kendo.data.ObservableArray(prepareTrainings());
            $scope.onUserAssignGridDataBound = function (e) {
                var grid = e.sender;
                if (grid.dataSource.total() == 0) {
                    var colCount = grid.columns.length;
                    $(e.sender.wrapper)
                        .find('tbody')
                        .append('<tr class="kendo-data-row"><td colspan="' + colCount + '" class="no-data">There is no data to show in the grid.</td></tr>');
                }
            };
            $scope.trainingsDataSource = new kendo.data.DataSource({
                type: "json",
                data: $scope.trainings,
                pageSize: 10,
                schema: {
                    model: {
                        id: "id",
                        fields: {
                            id: { type: 'number', nullable: true, editable: false },
                            name: { type: 'string', editable: false },
                            description: { type: 'string' },
                        }
                    }
                }
            });

            $scope.trainingsGridOptions = {
                dataSource: $scope.trainingsDataSource,
                dataBound: $scope.onUserAssignGridDataBound,
                columns: [
                    {
                        field: "code", title: "#", width: 30, template: function (dataItem) {
                            if (dataItem.skill) {
                                if (dataItem.skill.parentId) {
                                    return "<div>SS</div>";
                                }
                                else {
                                    return "<div>MS</div>";
                                }

                            }
                            else {
                                return "";
                            }
                        },
                    },
                    { field: "skillName", title: $translate.instant('COMMON_SKILL'), width: 150, values: $scope.skills, defaultValue: null },
                    { field: "name", title: $translate.instant('COMMON_TRAINING'), width: 150, },
                    {
                        field: "actions", title: $translate.instant('COMMON_ACTIONS'), width: 50,
                        template: function (dataItem) {
                            return "<div class='icon-groups'><a class='fa fa-pencil fa-lg' ng-click='openEditPresetTrainnigModal(" + dataItem.performanceGroupId + "," + dataItem.id + ")' ></a><a class='fa fa-trash fa-lg' ng-click='removeTraining(" + dataItem.performanceGroupId + "," + dataItem.id + ")'></a></div>";
                        },
                    },
                ],
                sortable: true,
                pageable: true,
            };
            $scope.addNewTraining = function () {
                var item = angular.copy($scope.newTraining);
                var sd = kendo.parseDate(item.startDate);
                var ed = kendo.parseDate(item.endDate);
                item.startDate = sd;
                item.endDate = ed;
                if (item.id > 0) {
                    profileTrainingManager.updateTraining(item).then(function (data) {
                        if (data) {
                            reloadTrainingGrid();
                            dialogService.showNotification($translate.instant('MYPROFILES_TRAINING_SAVED_SUCCESSFULLY'), 'info')
                            $("#presetTrainingModal").modal("hide");
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
                        return skillItem.id == $scope.newTraining.skillId;
                    });
                    if (skill) {
                        item.skills = [skill];
                        item.skill = skill;
                        item.skillId = skill.id;
                        item.skillName = skill.name;
                    }

                    profileTrainingManager.addNewTraining(item).then(function (data) {
                        item.id = data.id;
                        $scope.newTraining.id = item.id;

                        if (item.id > 0) {

                            var trainingIds = [];
                            trainingIds.push({ trainingId: item.id, skillId: $scope.newTraining.skillId });

                            profileTrainingManager.SetPerformanceGroupTraining($scope.newTraining.performanceGroupId, trainingIds).then(function (data) {
                                if (data) {
                                    reloadTrainingGrid();
                                    dialogService.showNotification($translate.instant('MYPROFILES_TRAINING_SAVED_SUCCESSFULLY'), 'info');
                                    $("#presetTrainingModal").modal("hide");
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

            $scope.openNewPresetTrainnigModal = function () {
                $scope.pgSkills = skills;
                var notificationTemplateId = null;
                var notificationTemplate = _.filter($scope.notificationTemplates, function (item) {
                    return item.culture.cultureName == globalVariables.lang.currentUICulture
                });
                if (notificationTemplate.length > 0) {
                    notificationTemplateId = notificationTemplate[0].id;
                }
                else if ($scope.notificationTemplates.length > 0) {
                    var notificationTemplates = _.filter($scope.notificationTemplates, function (item) {
                        return item.id != null;
                    });
                    if (notificationTemplates.length > 0) {
                        notificationTemplateId = notificationTemplates[0].id;
                    }
                }
                var durationMetric = _.filter($scope.durationMetrics, function (item) {
                    return item.name.indexOf("Minute") > -1
                })
                var durationMetricId = null;
                if (durationMetric.length > 0) {
                    durationMetricId = durationMetric[0].id;
                }

                var exerciseMetricId = null;
                var exerciseMetric = _.filter($scope.exerciseMetrics, function (item) {
                    return item.name.indexOf("mm") > -1
                });
                if (exerciseMetric.length > 0) {
                    exerciseMetricId = exerciseMetric[0].id;
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
                    durationMetricId: durationMetricId,
                    frequency: "FREQ=WEEKLY;BYDAY=WE",
                    howMany: 1,
                    exerciseMetricId: exerciseMetricId,
                    howManySets: 1,
                    howManyActions: 1,
                    isActive: true,
                    organizationId: $scope.currentUser.organizationId,
                    trainingMaterial: { id: 0, name: "", description: "", title: "", materialType: "", resourceType: "" },
                    trainingMaterials: new kendo.data.ObservableArray([]),
                    userId: $scope.userId,
                    skillId: null,
                    notificationTemplateId: notificationTemplateId,
                    isNotificationByEmail: true,
                    emailNotificationIntervalId: null,
                    emailBefore: reminderEnum[0].value,
                    isNotificationBySMS: false,
                    smsNotificationIntervalId: null,
                    performanceGroupId: null,
                }


                //if (skillId) {
                //    $scope.newTraining.skillId = skillId;
                //    $scope.skillChanged();
                //}
                $("#presetTrainingModal").modal("show");
            }
            $scope.openNewPresetTrainnigMaterialModal = function () {
                $scope.trainingMaterial = {
                    id: 0,
                    description: "",
                    title: "",
                    materialType: "",
                    resourceType: "",
                    link: "",
                    name: "",
                };
                $("#presetTrainingMaterialModal").modal("show");
            }

            $scope.removeTraining = function (performanceGroupId, trainingId) {
                profileTrainingManager.checkTrainingInUse(trainingId).then(function (data) {
                    if (data) {
                        dialogService.showYesNoDialog($translate.instant('COMMON_CONFIRM'), $translate.instant('COMMON_ARE_YOU_SURE_YOU_WANT_TO_DELETE')).then(
                            function () {

                                profileTrainingManager.removeTraining(trainingId).then(function (data) {
                                    if (data) {
                                        _.each($scope.performanceGroups, function (item) {
                                            if (item.id == performanceGroupId) {
                                                reloadTrainingGrid();
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

            $scope.openEditPresetTrainnigModal = function (performanceGroupId, trainingId) {
                $scope.pgSkills = skills;
                var skillId = 0;
                _.each($scope.performanceGroups, function (item) {
                    if (item.id == performanceGroupId) {
                        _.each(item.link_PerformanceGroupSkills, function (skillItem) {
                            _.each(skillItem.trainings, function (trainingItem) {
                                if (trainingItem.id == trainingId) {

                                    trainingItem["skillId"] = skillItem.skillId;
                                    skillId = skillItem.skillId;
                                    return (false);
                                }
                            })
                        })
                    }
                });
                performanceGroupsService.getTrainingById(trainingId).then(function (data) {
                    $scope.newTraining = _.clone(data);
                    $scope.newTraining.startDate = moment(kendo.parseDate(data.startDate)).format('L LT');
                    $scope.newTraining.endDate = moment(kendo.parseDate(data.endDate)).format('L LT');
                    $scope.newTraining.performanceGroupId = performanceGroupId;
                    $scope.newTraining.skillId = skillId;
                    $("#presetTrainingModal").modal("show");
                });

                $("#presetTrainingModal").modal("show");
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

            $scope.optionModel = {
                material: {
                    file: {}
                }
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

            $scope.trainingsGridTooltipOptions = {
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
            };
            $scope.trainingTemplates = new kendo.data.ObservableArray([]);
            $scope.trainingTemplatesDataSource = new kendo.data.DataSource({
                type: "json",
                data: $scope.trainingTemplates,
                pageSize: 10,
                schema: {
                    model: {
                        id: "id",
                        fields: {
                            id: { type: 'number', nullable: true, editable: false },
                            name: { type: 'string', editable: false },
                            why: { type: 'string' },
                        }
                    }
                }
            });

            $scope.trainingTemplatesGridOptions = {
                dataSource: $scope.trainingTemplatesDataSource,
                dataBound: $scope.onUserAssignGridDataBound,
                columns: [
                    { field: "name", title: $translate.instant('COMMON_TRAINING'), width: 150, },
                    { field: "why", title: $translate.instant('COMMON_WHY'), width: 150, },
                    {
                        field: "actions", title: $translate.instant('COMMON_ACTIONS'), width: 150,
                        template: function (dataItem) {
                            return "<div class='icon-groups'><a class='fa fa-eye fa-lg' ng-click='viewTrainingTemplate(" + dataItem.id + ")' ></a><a class='fa fa-info fa-lg' ng-click='viewTrainingTemplateTrainingMaterials(" + dataItem.id + ")'></a><a class='fa fa-plus fa-lg' ng-click='selectTrainingTemplate(" + dataItem.id + ")' ></a></div>";
                        },
                    },
                ],
                sortable: true,
                pageable: true,
            };

            $scope.searchTrainigTemplate = function () {
                $scope.trainingTemplates = new kendo.data.ObservableArray([]);
                if ($scope.newTraining) {
                    profileTrainingManager.getTrainingTemplatesBySkill($scope.newTraining.skillId).then(function (data) {
                        _.each(data, function (item) {
                            $scope.trainingTemplates.push(item);
                        });
                        var grid = $("#trainingTemplatesGrid").data("kendoGrid")
                        if (grid) {
                            $scope.trainingTemplatesDataSource = new kendo.data.DataSource({
                                type: "json",
                                data: $scope.trainingTemplates,
                                pageSize: 10,
                                schema: {
                                    model: {
                                        id: "id",
                                        fields: {
                                            id: { type: 'number', nullable: true, editable: false },
                                            name: { type: 'string', editable: false },
                                            why: { type: 'string' },
                                        }
                                    }
                                }
                            });
                            grid.setDataSource($scope.trainingTemplatesDataSource)
                        }

                    });
                }
                $("#trainingTemplatesModal").modal("show");
            }
            $scope.templateSkillChanged = function () {
                profileTrainingManager.getTrainingTemplatesBySkill($scope.newTraining.skillId).then(function (data) {
                    _.each(data, function (item) {
                        $scope.trainingTemplates.push(item);
                    });
                    var grid = $("#trainingTemplatesGrid").data("kendoGrid")
                    if (grid) {
                        $scope.trainingTemplatesDataSource = new kendo.data.DataSource({
                            type: "json",
                            data: $scope.trainingTemplates,
                            pageSize: 10,
                            schema: {
                                model: {
                                    id: "id",
                                    fields: {
                                        id: { type: 'number', nullable: true, editable: false },
                                        name: { type: 'string', editable: false },
                                        why: { type: 'string' },
                                    }
                                }
                            }
                        });
                        grid.setDataSource($scope.trainingTemplatesDataSource)
                    }

                });
            }

            $scope.selectTrainingTemplate = function (trainingId) {
                var trainingTemplate = _.find($scope.trainingTemplates, function (trainingTemplateItem) {
                    return trainingTemplateItem.id == trainingId;
                })
                if (trainingTemplate) {

                    var newTraining = {
                        id: 0,
                        name: null,
                        typeId: trainingTemplate.typeId,
                        levelId: trainingTemplate.levelId,
                        why: trainingTemplate.why,
                        what: trainingTemplate.what,
                        how: trainingTemplate.how,
                        additionalInfo: trainingTemplate.additionalInfo,
                        startDate: null,
                        endDate: null,
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
                        performanceGroupId: null,
                    };
                    var pg = _.find($scope.skills, function (item) {
                        return item.id == $scope.newTraining.skillId;
                    });
                    if (pg) {
                        newTraining.performanceGroupId = pg.performanceGroupId;
                    }
                    _.each(trainingTemplate.trainingMaterials, function (item, index) {
                        item.id = (index + 1) * -1
                        newTraining.trainingMaterials.push(item);
                    });
                    $scope.newTraining = newTraining;
                    $("#trainingTemplatesModal").modal("hide");
                    $("#viewpresetTrainingTemplateModal").modal("hide");
                    $("#presetTrainingTemplateModal").modal("hide");
                    $scope.performanceGroups = performanceGroups;
                    $scope.pgSkills = skills;
                    $("#presetTrainingModal").modal("show");
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
                        skillId: null,
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
            function prepareTrainings() {
                var result = [];
                _.each(performanceGroups, function (performanceGroup) {
                    _.each(performanceGroup.link_PerformanceGroupSkills, function (pgskill) {
                        if (pgskill.trainings.length > 0) {
                            angular.forEach(pgskill.trainings, function (keyTraining, value) {
                                keyTraining.skillName = pgskill.skill.name;
                                keyTraining.skill = pgskill.skill;
                                keyTraining.skillId = pgskill.skill.id;
                                keyTraining["performanceGroupId"] = performanceGroup.id;
                                result.push(keyTraining);
                            });
                        }
                    })
                });
                return result;
            }
            function reloadTrainingGrid() {

                performanceGroupsService.load("&$filter=ProfileId eq " + $stateParams.profileId).then(function (performanceGroupsData) {
                    performanceGroups = performanceGroupsData;
                    $scope.performanceGroups = performanceGroups;
                    $scope.trainings = new kendo.data.ObservableArray(prepareTrainings());
                    $scope.trainingsDataSource = new kendo.data.DataSource({
                        type: "json",
                        data: $scope.trainings,
                        pageSize: 10,
                        schema: {
                            model: {
                                id: "id",
                                fields: {
                                    id: { type: 'number', nullable: true, editable: false },
                                    name: { type: 'string', editable: false },
                                    description: { type: 'string' },
                                }
                            }
                        }
                    });
                    var grid = $("#TrainingGrid").data("kendoGrid");
                    if (grid) {
                        grid.setDataSource($scope.trainingsDataSource)
                    }
                })
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

            $scope.openAddReason = function () {
                $("#AddReasonModal").modal('show');
            }


            $scope.gotoMilestones = function () {
                if (($scope.profileId > 0) && ($scope.skills.length > 0)) {
                    $location.path("/home/knowledge/" + $scope.profileId + "/milestones");

                }
                else {
                    dialogService.showNotification($translate.instant("MYPROJECTS_PROJECTPROFILES_PLEASE_ADD_SKILL_DETAILS"), "error");
                }
            }
        }])
    .controller('KnowledgeProfileMilestonesCtrl', ['$scope', 'localStorageService', 'authService', 'apiService', 'dialogService', 'cssInjector', '$stateParams', 'profile', 'profileTypeEnum', 'projectInfo', 'notificationTemplates', 'profilesService', 'stageGroupManager', '$translate', 'globalVariables', 'templateTypeEnum', 'stageTypesEnum', 'evaluationRolesEnum', '$location',
        function ($scope, localStorageService, authService, apiService, dialogService, cssInjector, $stateParams, profile, profileTypeEnum, projectInfo, notificationTemplates, profilesService, stageGroupManager, $translate, globalVariables, templateTypeEnum, stageTypesEnum, evaluationRolesEnum, $location) {
            cssInjector.add('views/profiles/new-soft-profile.css');
            var authData = localStorageService.get('authorizationData');
            $scope.currentUser = authData.user;
            $scope.authService = authService;
            $scope.profileId = $stateParams.profileId;
            $scope.profileUrlModifier = 'knowledge';
            $scope.profileTypeId = 5;
            $scope.profile = null;
            $scope.projectInfo = projectInfo;
            $scope.profileTypeEnum = profileTypeEnum;
            $scope.notificationTemplates = notificationTemplates;
            $scope.statusOfStages = [];
            $scope.fpStatusOfStages = [];
            $scope.participants = [];
            if (profile != null) {
                $scope.profile = profile;
                $scope.profileType = profile.profileTypeId;

                if ($scope.profile.scaleId > 0) {
                    profilesService.getScaleById($scope.profile.scaleId).then(function (scaledata) {
                        $scope.scale = scaledata;
                        $scope.profile.scale = scaledata;
                    }, function () { });
                    //$scope.scaleUpdate($scope.profile.scaleId)
                }

                _.each($scope.profile.stageGroups, function (sgItem) {
                    $scope.selectedStageGroup = sgItem;
                    $scope.stage = sgItem.stages[0];
                    $scope.isStartStage = true;
                    stageGroupManager.getParticipants(sgItem.id).then(function (data) {
                        _.each(data, function (participantItem) {
                            _.each($scope.projectInfo.projectSteeringGroups, function (steeringGroup) {
                                _.each(steeringGroup.users, function (userItem) {
                                    if (userItem.userId == participantItem.userId && participantItem.stageGroupId == sgItem.id && userItem.roleName == "Participant") {
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



            }
            $scope.openNewSendOutModal = function () {

                $scope.stageGroup = {
                    id: 0,
                    name: null,
                    description: null,
                    startDate: null,
                    endDate: null,
                    parentStageGroupId: null,
                    parentParticipantId: null,
                    monthsSpan: 0,
                    weeksSpan: 6,
                    daysSpan: 0,
                    hoursSpan: 0,
                    minutesSpan: 0,
                    actualTimeSpan: 0,
                    totalMilestones: 5,
                    stages: [],
                    startStageStartDate: null,
                    startStageEndDate: null,
                    milestoneStartDate: null,
                    milestoneEndDate: null,
                }




                var globalSetting = null;
                if ($scope.projectInfo) {
                    $scope.stageGroup.name = $scope.projectInfo.name;
                    $scope.stageGroup.startDate = moment(kendo.parseDate($scope.projectInfo.expectedStartDate)).format('L LT');
                    $scope.stageGroup.endDate = moment(kendo.parseDate($scope.projectInfo.expectedEndDate)).format('L LT');
                    $scope.stageGroup.startStageStartDate = moment(kendo.parseDate($scope.projectInfo.expectedStartDate)).format('L LT');
                    $scope.stageGroup.startStageEndDate = moment(kendo.parseDate($scope.projectInfo.expectedStartDate)).add("days", 7).format('L LT');
                    $scope.stageGroup.milestoneStartDate = moment(kendo.parseDate($scope.projectInfo.expectedStartDate)).add("days", 7).format('L LT');
                    $scope.stageGroup.milestoneEndDate = moment(kendo.parseDate($scope.projectInfo.expectedEndDate)).format('L LT');
                    if ($scope.projectInfo.projectGlobalSettings.length > 0) {
                        globalSetting = $scope.projectInfo.projectGlobalSettings[0];
                    }
                }

                if ($scope.profile.profileTypeId == profileTypeEnum.Soft || $scope.profile.profileTypeId == profileTypeEnum.Hard) {
                    var diffTime = null;
                    var a = moment(kendo.parseDate($scope.stageGroup.milestoneEndDate));
                    var b = moment(kendo.parseDate($scope.stageGroup.milestoneStartDate));
                    diffTime = a.diff(b);
                    if ($scope.profile.profileTypeId == profileTypeEnum.Soft || $scope.profile.profileTypeId == profileTypeEnum.Hard) {
                        var duration = moment.duration(diffTime);
                        $scope.sendOutMilestoneDiffrence = {
                            months: duration.months(),
                            weeks: duration.weeks(),
                            days: duration.days(),
                            hours: duration.hours(),
                            minutes: duration.minutes(),
                        }
                        if (duration.years() > 0) {
                            $scope.sendOutMilestoneDiffrence.months = $scope.sendOutMilestoneDiffrence.months + (duration.years() * 12);
                        }
                        if ($scope.stageGroup.totalMilestones > 0) {
                            diffTime = a.diff(b) / $scope.stageGroup.totalMilestones; // 1
                        }
                        else {
                            diffTime = a.diff(b) / 5; // 1
                        }
                    }
                    duration = moment.duration(diffTime);
                    $scope.stageGroup.actualTimeSpan = diffTime,
                        $scope.stageGroup.monthsSpan = duration.months();
                    $scope.stageGroup.weeksSpan = duration.weeks();
                    $scope.stageGroup.daysSpan = duration.days();
                    if ($scope.stageGroup.weeksSpan > 0) {
                        $scope.stageGroup.daysSpan = $scope.stageGroup.daysSpan - ($scope.stageGroup.weeksSpan * 7);
                    }
                    $scope.stageGroup.hoursSpan = duration.hours();
                    $scope.stageGroup.minutesSpan = duration.minutes();
                }
                if (globalSetting) {
                    if ($scope.profile.profileTypeId == profileTypeEnum.Soft || $scope.profile.profileTypeId == profileTypeEnum.Hard) {

                    }
                    else {
                        $scope.stageGroup.actualTimeSpan = globalSetting.knowledgeProfileActualTimeSpan,
                            $scope.stageGroup.monthsSpan = globalSetting.knowledgeProfileMonthSpan;
                        $scope.stageGroup.weeksSpan = globalSetting.knowledgeProfileWeekSpan;
                        $scope.stageGroup.daysSpan = globalSetting.knowledgeProfileDaySpan;
                        $scope.stageGroup.hoursSpan = globalSetting.knowledgeProfileHourSpan;
                        $scope.stageGroup.minutesSpan = globalSetting.knowledgeProfileMinuteSpan;
                    }
                }
                else {
                    if ($scope.projectInfo) {
                        var diffTime = null;
                        var a = moment(kendo.parseDate($scope.projectInfo.expectedEndDate));
                        var b = moment(kendo.parseDate($scope.projectInfo.expectedStartDate));
                        diffTime = a.diff(b);
                        if ($scope.profile.profileTypeId == profileTypeEnum.Soft || $scope.profile.profileTypeId == profileTypeEnum.Hard) {
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
                            if ($scope.stageGroup.totalMilestones > 0) {
                                diffTime = a.diff(b) / $scope.stageGroup.totalMilestones; // 1
                            }
                            else {
                                diffTime = a.diff(b) / 5; // 1
                            }
                        }
                        duration = moment.duration(diffTime);
                        $scope.stageGroup.actualTimeSpan = diffTime,
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
                    actualTimeSpan: 0,
                    totalMilestones: 5,
                    stages: [],
                    startStageStartDate: moment(kendo.parseDate($scope.projectInfo.expectedStartDate)).format('L LT'),
                    startStageEndDate: moment(kendo.parseDate($scope.projectInfo.expectedStartDate)).add("days", 7).format('L LT'),
                    milestoneStartDate: moment(kendo.parseDate($scope.projectInfo.expectedStartDate)).add("days", 7).format('L LT'),
                    milestoneEndDate: moment(kendo.parseDate($scope.projectInfo.expectedEndDate)).format('L LT'),
                }
                var stageGroup = _.find($scope.profile.stageGroups, function (stageGroupItem) {
                    return stageGroupItem.id == stageGroupId;
                });
                if (stageGroup) {
                    $scope.stageGroup = angular.copy(stageGroup);

                    $scope.numberOfMilestoneChange();
                }
                $("#stageGroupModal").modal("show");

            }
            $scope.removeSendOut = function (stageGroupId) {

                stageGroupManager.isStageGroupInUse(stageGroupId).then(
                    function (data) {
                        if (data == true) {
                            dialogService.showNotification($translate.instant('MYPROJECTS_STAGE_GROUP_CANNOT_BE_REMOVED') + ' ' + $translate.instant('MYPROJECTS_THIS_STAGE_GROUP_IS_ALREADY_IN_USE'), 'warning');
                        } else {
                            dialogService.showYesNoDialog($translate.instant('COMMON_CONFIRM'), $translate.instant('COMMON_ARE_YOU_SURE_YOU_WANT_TO_DELETE')).then(
                                function () {
                                    stageGroupManager.removeStageGroup(stageGroupId).then(
                                        function (data) {
                                            var index = _.findIndex($scope.profile.stageGroups, function (stageGroupItem) {
                                                return stageGroupItem.id == stageGroupId;
                                            });
                                            if (index > -1) {
                                                $scope.profile.stageGroups.splice(index, 1);
                                                dialogService.showNotification($translate.instant('MYPROJECTS_SEND_OUT_REMOVED_SUCCESSFULLY'), "success");
                                            }
                                        },
                                        function (data) {
                                            console.log(data);
                                        }
                                    );
                                },
                                function () {
                                }
                            );
                        }
                    }
                );
            }
            $scope.StageGroupStartDateOpen = function (event) {
                var datepicker = $(event.sender.element).data("kendoDateTimePicker");
                datepicker.setOptions({
                    min: kendo.parseDate($scope.projectInfo.expectedStartDate)
                });
            };
            $scope.StageGroupStartDateChange = function (event) {
                if (!(kendo.parseDate($scope.stageGroup.startDate) > kendo.parseDate($scope.stageGroup.endDate))) {
                    $scope.stageGroup.endDate = "";
                }
                else {
                    var diffTime = null;
                    var a = moment(kendo.parseDate($scope.stageGroup.endDate));
                    var b = moment(kendo.parseDate($scope.stageGroup.startDate));
                    diffTime = a.diff(b);
                    if ($scope.profile.profileTypeId == profileTypeEnum.Soft || $scope.profile.profileTypeId == profileTypeEnum.Hard) {
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
                        if ($scope.stageGroup.totalMilestones > 0) {
                            diffTime = a.diff(b) / $scope.stageGroup.totalMilestones; // 1
                        }
                        else {
                            diffTime = a.diff(b) / 5; // 1
                        }
                    }

                    if ($scope.stageGroup.startStageStartDate == null) {
                        duration = moment.duration(diffTime);
                        $scope.stageGroup.actualTimeSpan = diffTime,
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
            };
            $scope.StageGroupEndDateOpen = function (event) {
                var datepicker = $(event.sender.element).data("kendoDateTimePicker")
                if ($scope.projectInfo.id > 0) {
                    datepicker.setOptions({
                        min: kendo.parseDate($scope.projectInfo.expectedStartDate),
                        max: kendo.parseDate($scope.projectInfo.expectedEndDate)
                    });
                }
                else {
                    datepicker.setOptions({
                        min: kendo.parseDate($scope.projectInfo.expectedStartDate),
                    });
                }
            };
            $scope.StageGroupEndDateChange = function (event) {
                var diffTime = null;
                var a = moment(kendo.parseDate(event.sender.value()));
                var b = moment(kendo.parseDate($scope.stageGroup.startDate));
                diffTime = a.diff(b);
                if ($scope.profile.profileTypeId == profileTypeEnum.Soft || $scope.profile.profileTypeId == profileTypeEnum.Hard) {
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
                    if ($scope.stageGroup.totalMilestones > 0) {
                        diffTime = a.diff(b) / $scope.stageGroup.totalMilestones; // 1
                    }
                    else {
                        diffTime = a.diff(b) / 5; // 1
                    }
                }

                if ($scope.stageGroup.startStageStartDate != null) {
                    duration = moment.duration(diffTime);
                    $scope.stageGroup.actualTimeSpan = diffTime;
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


            $scope.StageGroupStartStageStartDateOpen = function (event) {
                var datepicker = $(event.sender.element).data("kendoDateTimePicker");
                datepicker.setOptions({
                    min: kendo.parseDate($scope.projectInfo.expectedStartDate),
                    max: kendo.parseDate($scope.projectInfo.expectedEndDate)
                });
            }
            $scope.StageGroupStartStageStartDateChange = function (event) {

                if ((kendo.parseDate($scope.stageGroup.startStageStartDate) > kendo.parseDate($scope.stageGroup.startStageEndDate))) {
                    $scope.stageGroup.startStageEndDate = null;
                }
            };

            $scope.StageGroupStartStageEndDateOpen = function (event) {
                var datepicker = $(event.sender.element).data("kendoDateTimePicker")
                datepicker.setOptions({
                    min: kendo.parseDate($scope.stageGroup.startStageStartDate),
                    max: kendo.parseDate($scope.projectInfo.expectedEndDate)
                });
            };
            $scope.StageGroupStartStageEndDateChange = function (event) {
                $scope.stageGroup.milestoneStartDate = moment(kendo.parseDate(event.sender.value())).format('L LT');
            };


            $scope.StageGroupMilestoneStartDateOpen = function (event) {
                var datepicker = $(event.sender.element).data("kendoDateTimePicker");
                datepicker.setOptions({
                    min: kendo.parseDate($scope.stageGroup.startStageEndDate),
                    max: kendo.parseDate($scope.projectInfo.expectedEndDate)
                });
            }
            $scope.StageGroupMilestoneStartDateChange = function (event) {
                if ((kendo.parseDate(event.sender.value()) > kendo.parseDate($scope.stageGroup.milestoneEndDate))) {
                    $scope.stageGroup.milestoneEndDate = "";
                }
                else {
                    var diffTime = null;
                    var a = moment(kendo.parseDate($scope.stageGroup.milestoneEndDate));
                    var b = moment(kendo.parseDate(event.sender.value()));
                    diffTime = a.diff(b);
                    if ($scope.profile.profileTypeId == profileTypeEnum.Soft || $scope.profile.profileTypeId == profileTypeEnum.Hard) {
                        var duration = moment.duration(diffTime);
                        $scope.sendOutMilestoneDiffrence = {
                            months: duration.months(),
                            weeks: duration.weeks(),
                            days: duration.days(),
                            hours: duration.hours(),
                            minutes: duration.minutes(),
                        }
                        if (duration.years() > 0) {
                            $scope.sendOutMilestoneDiffrence.months = $scope.sendOutMilestoneDiffrence.months + (duration.years() * 12);
                        }
                        if ($scope.stageGroup.totalMilestones > 0) {
                            diffTime = a.diff(b) / $scope.stageGroup.totalMilestones; // 1
                        }
                        else {
                            diffTime = a.diff(b) / 5; // 1
                        }
                    }
                    duration = moment.duration(diffTime);
                    $scope.stageGroup.actualTimeSpan = diffTime,
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


            $scope.StageGroupMilestoneEndDateOpen = function (event) {
                var datepicker = $(event.sender.element).data("kendoDateTimePicker")
                datepicker.setOptions({
                    min: kendo.parseDate($scope.stageGroup.milestoneStartDate),
                    max: kendo.parseDate($scope.projectInfo.expectedEndDate)
                });
            };
            $scope.StageGroupMilestoneEndDateChange = function (event) {
                var diffTime = null;
                var a = moment(kendo.parseDate(event.sender.value()));
                var b = moment(kendo.parseDate($scope.stageGroup.milestoneStartDate));
                diffTime = a.diff(b);
                if ($scope.profile.profileTypeId == profileTypeEnum.Soft || $scope.profile.profileTypeId == profileTypeEnum.Hard) {
                    var duration = moment.duration(diffTime);
                    $scope.sendOutMilestoneDiffrence = {
                        months: duration.months(),
                        weeks: duration.weeks(),
                        days: duration.days(),
                        hours: duration.hours(),
                        minutes: duration.minutes(),
                    }
                    if (duration.weeks() > 0) {
                        $scope.sendOutMilestoneDiffrence.days = duration.days() - (duration.weeks() * 7);
                    }
                    if (duration.years() > 0) {
                        $scope.sendOutMilestoneDiffrence.months = $scope.sendOutMilestoneDiffrence.months + (duration.years() * 12);
                    }
                    if ($scope.stageGroup.totalMilestones > 0) {
                        diffTime = a.diff(b) / $scope.stageGroup.totalMilestones; // 1
                    }
                    else {
                        diffTime = a.diff(b) / 5; // 1
                    }
                }
                duration = moment.duration(diffTime);
                $scope.stageGroup.actualTimeSpan = diffTime,
                    $scope.stageGroup.monthsSpan = duration.months();
                $scope.stageGroup.weeksSpan = duration.weeks();
                $scope.stageGroup.daysSpan = duration.days();
                if ($scope.stageGroup.weeksSpan > 0) {
                    $scope.stageGroup.daysSpan = $scope.stageGroup.daysSpan - ($scope.stageGroup.weeksSpan * 7);
                }
                if (duration.years() > 0) {
                    $scope.sendOutMilestoneDiffrence.months = $scope.sendOutMilestoneDiffrence.months + (duration.years() * 12);
                }
                $scope.stageGroup.hoursSpan = duration.hours();
                $scope.stageGroup.minutesSpan = duration.minutes();
            };
            $scope.numberOfMilestoneChange = function () {
                var diffTime = null;
                if ($scope.stageGroup.milestoneStartDate && $scope.stageGroup.milestoneEndDate) {
                    var a = moment(kendo.parseDate($scope.stageGroup.milestoneEndDate));
                    var b = moment(kendo.parseDate($scope.stageGroup.milestoneStartDate));
                    diffTime = a.diff(b);
                    if ($scope.profile.profileTypeId == profileTypeEnum.Soft || $scope.profile.profileTypeId == profileTypeEnum.Hard) {
                        var duration = moment.duration(diffTime);
                        $scope.sendOutMilestoneDiffrence = {
                            months: duration.months(),
                            weeks: duration.weeks(),
                            days: duration.days(),
                            hours: duration.hours(),
                            minutes: duration.minutes(),
                        }
                        if (duration.years() > 0) {
                            $scope.sendOutMilestoneDiffrence.months = $scope.sendOutMilestoneDiffrence.months + (duration.years() * 12);
                        }
                        if ($scope.stageGroup.totalMilestones > 0) {
                            diffTime = a.diff(b) / $scope.stageGroup.totalMilestones; // 1
                        }
                        else {
                            diffTime = a.diff(b) / 5; // 1
                        }
                    }
                    duration = moment.duration(diffTime);
                    $scope.stageGroup.actualTimeSpan = diffTime,
                        $scope.stageGroup.monthsSpan = duration.months();
                    $scope.stageGroup.weeksSpan = duration.weeks();
                    $scope.stageGroup.daysSpan = duration.days();
                    if ($scope.stageGroup.weeksSpan > 0) {
                        $scope.stageGroup.daysSpan = $scope.stageGroup.daysSpan - ($scope.stageGroup.weeksSpan * 7);
                    }

                    $scope.stageGroup.hoursSpan = duration.hours();
                    $scope.stageGroup.minutesSpan = duration.minutes();
                }
                else {
                    var a = moment(kendo.parseDate($scope.stageGroup.endDate));
                    var b = moment(kendo.parseDate($scope.stageGroup.startDate));
                    diffTime = a.diff(b);
                    if ($scope.profile.profileTypeId == profileTypeEnum.Soft || $scope.profile.profileTypeId == profileTypeEnum.Hard) {
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
                        if ($scope.stageGroup.totalMilestones > 0) {
                            diffTime = a.diff(b) / $scope.stageGroup.totalMilestones; // 1
                        }
                        else {
                            diffTime = a.diff(b) / 5; // 1
                        }
                    }
                    duration = moment.duration(diffTime);
                    $scope.stageGroup.actualTimeSpan = diffTime,
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

            $scope.addNewStageGroup = function () {
                if ($scope.formStageGroup.$valid) {
                    if ($scope.stageGroup.id == 0) {
                        $scope.stageGroup.id = ($scope.profile.stageGroups.length + 1) * -1;
                        var profile = angular.copy($scope.profile);
                        profile.stageGroups = [];
                        $scope.isStartStage = true;
                        $scope.stageGroup["profiles"] = [profile];

                        var stageGroupCopy = _.clone($scope.stageGroup);
                        stageGroupCopy.startDate = kendo.parseDate(stageGroupCopy.startDate);
                        stageGroupCopy.endDate = kendo.parseDate(stageGroupCopy.endDate);
                        stageGroupCopy.startStageStartDate = kendo.parseDate(stageGroupCopy.startStageStartDate);
                        stageGroupCopy.startStageEndDate = kendo.parseDate(stageGroupCopy.startStageEndDate);
                        stageGroupCopy.milestoneStartDate = kendo.parseDate(stageGroupCopy.milestoneStartDate);
                        stageGroupCopy.milestoneEndDate = kendo.parseDate(stageGroupCopy.milestoneEndDate);
                        apiService.add('stageGroups', stageGroupCopy).then(function (data) {
                            if (data > 0) {
                                $scope.stageGroup.id = data;


                                dialogService.showNotification($translate.instant('MYPROJECTS_PROJECTPROFILES_SEND_OUT_SETTING_ADDED_SUCCESSFULLY'), "successs");

                                var globalSetting = null;
                                if ($scope.projectInfo.projectGlobalSettings.length > 0) {
                                    globalSetting = $scope.projectInfo.projectGlobalSettings[0]
                                }
                                apiService.getAll("stagegroups/" + $scope.stageGroup.id + "/allstages").then(function (stagesdata) {
                                    $scope.stageGroup["userRecurrentNotificationSettings"] = [];
                                    _.each(stagesdata, function (stageItem, index) {
                                        stageItem.startDateTime = moment(kendo.parseDate(stageItem.startDateTime)).format("L LT");
                                        stageItem.endDateTime = moment(kendo.parseDate(stageItem.endDateTime)).format("L LT");
                                        stageItem.evaluationStartDate = moment(kendo.parseDate(stageItem.evaluationStartDate)).format("L LT");
                                        stageItem.evaluationEndDate = moment(kendo.parseDate(stageItem.evaluationEndDate)).format("L LT");
                                        var recurrentNotificationSettings = {
                                            id: 0,
                                            stageGroupId: $scope.stageGroup.id,
                                            stageId: stageItem.id,
                                            userId: 0,
                                            emailNotification: true,
                                            smsNotification: false,
                                            greenAlarmParticipantTemplateId: null,
                                            greenAlarmEvaluatorTemplateId: null,
                                            greenAlarmManagerTemplateId: null,
                                            greenAlarmTrainerTemplateId: null,
                                            greenAlarmProjectManagerTemplateId: null,
                                            greenAlarmFinalScoreManagerTemplateId: null,
                                            greenAlarmTime: null,
                                            yellowAlarmParticipantTemplateId: null,
                                            yellowAlarmEvaluatorTemplateId: null,
                                            yellowAlarmManagerTemplateId: null,
                                            yellowAlarmTrainerTemplateId: null,
                                            yellowAlarmProjectManagerTemplateId: null,
                                            yellowAlarmFinalScoreManagerTemplateId: null,
                                            yellowAlarmTime: null,
                                            redAlarmParticipantTemplateId: null,
                                            redAlarmEvaluatorTemplateId: null,
                                            redAlarmManagerTemplateId: null,
                                            redAlarmTrainerTemplateId: null,
                                            redAlarmProjectManagerTemplateId: null,
                                            redAlarmFinalScoreManagerTemplateId: null,
                                            redAlarmTime: null,
                                            externalStartNotificationTemplateId: null,
                                            externalCompletedNotificationTemplateId: null,
                                            externalResultsNotificationTemplateId: null,
                                            evaluatorStartNotificationTemplateId: null,
                                            evaluatorCompletedNotificationTemplateId: null,
                                            evaluatorResultsNotificationTemplateId: null,
                                            trainerStartNotificationTemplateId: null,
                                            trainerCompletedNotificationTemplateId: null,
                                            trainerResultsNotificationTemplateId: null,
                                            managerStartNotificationTemplateId: null,
                                            managerCompletedNotificationTemplateId: null,
                                            managerResultsNotificationTemplateId: null,
                                            finalScoreManagerStartNotificationTemplateId: null,
                                            finalScoreManagerCompletedNotificationTemplateId: null,
                                            finalScoreManagerResultsNotificationTemplateId: null,
                                            projectManagerStartNotificationTemplateId: null,
                                            projectManagerCompletedNotificationTemplateId: null,
                                            projectManagerResultsNotificationTemplateId: null,
                                            howMany: null,
                                            metricId: null,
                                            howManySet: null,
                                            howManyActions: null,
                                        }
                                        var externalStartNotificationTemplate = _.filter(notificationTemplates, function (item) {
                                            return item.notificationTemplateTypeId == templateTypeEnum.RecurrentTrainingNotification && item.evaluationRoleId == evaluationRolesEnum.participant && item.isDefualt == true;
                                        });
                                        if (externalStartNotificationTemplate.length > 0) {
                                            recurrentNotificationSettings.externalStartNotificationTemplateId = externalStartNotificationTemplate[0].id;
                                        }
                                        var evaluatorStartNotificationTemplate = _.filter(notificationTemplates, function (item) {
                                            return item.notificationTemplateTypeId == templateTypeEnum.RecurrentTrainingNotification && item.evaluationRoleId == evaluationRolesEnum.evaluator && item.isDefualt == true;
                                        });
                                        if (evaluatorStartNotificationTemplate.length > 0) {
                                            recurrentNotificationSettings.evaluatorStartNotificationTemplateId = evaluatorStartNotificationTemplate[0].id;
                                            recurrentNotificationSettings.finalScoreManagerStartNotificationTemplateId = evaluatorStartNotificationTemplate[0].id;
                                        }
                                        var managerStartNotificationTemplate = _.filter(notificationTemplates, function (item) {
                                            return item.notificationTemplateTypeId == templateTypeEnum.RecurrentTrainingNotification && item.evaluationRoleId == evaluationRolesEnum.manager && item.isDefualt == true;
                                        });
                                        if (managerStartNotificationTemplate.length > 0) {
                                            recurrentNotificationSettings.managerStartNotificationTemplateId = managerStartNotificationTemplate[0].id;
                                            recurrentNotificationSettings.projectManagerStartNotificationTemplateId = managerStartNotificationTemplate[0].id;
                                        }
                                        var trainerStartNotificationTemplate = _.filter(notificationTemplates, function (item) {
                                            return item.notificationTemplateTypeId == templateTypeEnum.RecurrentTrainingNotification && item.evaluationRoleId == evaluationRolesEnum.trainer && item.isDefualt == true;
                                        });
                                        if (trainerStartNotificationTemplate.length > 0) {
                                            recurrentNotificationSettings.trainerStartNotificationTemplateId = trainerStartNotificationTemplate[0].id;
                                        }

                                        var globalSetting = null;
                                        if ($scope.projectInfo.projectGlobalSettings.length > 0) {
                                            globalSetting = $scope.projectInfo.projectGlobalSettings[0];
                                            recurrentNotificationSettings.howMany = globalSetting.softProfileHowMany;
                                            recurrentNotificationSettings.howManyActions = globalSetting.softProfileHowManyActions;
                                            recurrentNotificationSettings.howManySet = globalSetting.softProfileHowManySets;
                                            recurrentNotificationSettings.metricId = globalSetting.softProfileMetricId;
                                            recurrentNotificationSettings.recurrentTrainningFrequency = globalSetting.softProfileRecurrentTrainingTimeSpan;
                                            recurrentNotificationSettings.emailNotification = globalSetting.softProfileStartEmailNotification;
                                            recurrentNotificationSettings.sMSNotification = globalSetting.softProfileStartSmsNotification;

                                        }

                                        $scope.stageGroup.userRecurrentNotificationSettings.push(recurrentNotificationSettings);


                                        if ($scope.profile.profileTypeId == profileTypeEnum.Knowledge) {
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

                                                stageItem.finalScoreManagerStartNotificationTemplateId = globalSetting.knowledgeProfileFinalScoreManagerStartNotificationTemplateId;
                                                stageItem.finalScoreManagerCompletedNotificationTemplateId = globalSetting.knowledgeProfileFinalScoreManagerCompletedNotificationTemplateId;
                                                stageItem.finalScoreManagerResultsNotificationTemplateId = globalSetting.knowledgeProfileFinalScoreManagerResultsNotificationTemplateId;

                                                stageItem.projectManagerStartNotificationTemplateId = globalSetting.knowledgeProfileProjectManagerStartNotificationTemplateId;
                                                stageItem.projectManagerCompletedNotificationTemplateId = globalSetting.knowledgeProfileProjectManagerCompletedNotificationTemplateId;
                                                stageItem.projectManagerResultsNotificationTemplateId = globalSetting.knowledgeProfileProjectManagerResultsNotificationTemplateId;

                                            }
                                            else {
                                                stageItem.startDateTime = moment(kendo.parseDate(stageItem.startDateTime)).format('L LT')
                                                stageItem.endDateTime = moment(kendo.parseDate(stageItem.endDateTime)).format('L LT')
                                                stageItem.greenAlarmTime = moment(kendo.parseDate(stageItem.greenAlarmTime)).format('L LT')
                                                stageItem.yellowAlarmTime = moment(kendo.parseDate(stageItem.yellowAlarmTime)).format('L LT')
                                                stageItem.redAlarmTime = moment(kendo.parseDate(stageItem.redAlarmTime)).format('L LT')

                                            }
                                        }
                                        else if ($scope.profile.profileTypeId == profileTypeEnum.Soft || $scope.profile.profileTypeId == profileTypeEnum.Hard) {
                                            var globalSetting = null;
                                            if ($scope.projectInfo.projectGlobalSettings.length > 0) {
                                                globalSetting = $scope.projectInfo.projectGlobalSettings[0]
                                            }
                                            if (globalSetting) {
                                                stageItem.managerId = globalSetting.managerId;
                                                stageItem.trainerId = globalSetting.trainerId;
                                                stageItem.evaluationStartDate = moment(kendo.parseDate(stageItem.evaluationStartDate)).format('L LT')
                                                stageItem.evaluationEndDate = moment(kendo.parseDate(stageItem.evaluationEndDate)).format('L LT')
                                                if (index == 0) {
                                                    stageItem.emailNotification = globalSetting.softProfileStartEmailNotification;
                                                    stageItem.smsNotification = globalSetting.softProfileStartSmsNotification;

                                                    stageItem.startDateTime = moment(kendo.parseDate(stageItem.startDateTime)).format('L LT')
                                                    stageItem.endDateTime = moment(kendo.parseDate(stageItem.endDateTime)).format('L LT')
                                                    stageItem.greenAlarmTime = moment(kendo.parseDate(stageItem.greenAlarmTime)).format('L LT')
                                                    stageItem.yellowAlarmTime = moment(kendo.parseDate(stageItem.yellowAlarmTime)).format('L LT')
                                                    stageItem.redAlarmTime = moment(kendo.parseDate(stageItem.redAlarmTime)).format('L LT')


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

                                                    stageItem.finalScoreManagerStartNotificationTemplateId = globalSetting.softProfileStartFinalScoreManagerStartNotificationTemplateId;
                                                    stageItem.finalScoreManagerCompletedNotificationTemplateId = globalSetting.softProfileStartFinalScoreManagerCompletedNotificationTemplateId;
                                                    stageItem.finalScoreManagerResultsNotificationTemplateId = globalSetting.softProfileStartFinalScoreManagerResultsNotificationTemplateId;

                                                    stageItem.projectManagerStartNotificationTemplateId = globalSetting.softProfileStartProjectManagerStartNotificationTemplateId;
                                                    stageItem.projectManagerCompletedNotificationTemplateId = globalSetting.softProfileStartProjectManagerCompletedNotificationTemplateId;
                                                    stageItem.projectManagerResultsNotificationTemplateId = globalSetting.softProfileStartProjectManagerResultsNotificationTemplateId;


                                                    stageItem.greenAlarmParticipantTemplateId = globalSetting.softProfileStartGreenAlarmParticipantTemplateId;
                                                    stageItem.greenAlarmEvaluatorTemplateId = globalSetting.softProfileStartGreenAlarmEvaluatorTemplateId;
                                                    stageItem.greenAlarmManagerTemplateId = globalSetting.softProfileStartGreenAlarmManagerTemplateId;
                                                    stageItem.greenAlarmTrainerTemplateId = globalSetting.softProfileStartGreenAlarmTrainerTemplateId;
                                                    stageItem.greenAlarmProjectManagerTemplateId = globalSetting.softProfileStartGreenAlarmProjectManagerTemplateId;
                                                    stageItem.greenAlarmFinalScoreManagerTemplateId = globalSetting.softProfileStartGreenAlarmFinalScoreManagerTemplateId;

                                                    stageItem.yellowAlarmParticipantTemplateId = globalSetting.softProfileStartYellowAlarmParticipantTemplateId;
                                                    stageItem.yellowAlarmEvaluatorTemplateId = globalSetting.softProfileStartYellowAlarmEvaluatorTemplateId;
                                                    stageItem.yellowAlarmManagerTemplateId = globalSetting.softProfileStartYellowAlarmManagerTemplateId;
                                                    stageItem.yellowAlarmTrainerTemplateId = globalSetting.softProfileStartYellowAlarmTrainerTemplateId;
                                                    stageItem.yellowAlarmProjectManagerTemplateId = globalSetting.softProfileStartYellowAlarmProjectManagerTemplateId;
                                                    stageItem.yellowAlarmFinalScoreManagerTemplateId = globalSetting.softProfileStartYellowAlarmFinalScoreManagerTemplateId;

                                                    stageItem.redAlarmParticipantTemplateId = globalSetting.softProfileStartRedAlarmParticipantTemplateId;
                                                    stageItem.redAlarmEvaluatorTemplateId = globalSetting.softProfileStartRedAlarmEvaluatorTemplateId;
                                                    stageItem.redAlarmManagerTemplateId = globalSetting.softProfileStartRedAlarmManagerTemplateId;
                                                    stageItem.redAlarmTrainerTemplateId = globalSetting.softProfileStartRedAlarmTrainerTemplateId;
                                                    stageItem.redAlarmProjectManagerTemplateId = globalSetting.softProfileStartRedAlarmProjectManagerTemplateId;
                                                    stageItem.redAlarmFinalScoreManagerTemplateId = globalSetting.softProfileStartRedAlarmFinalScoreManagerTemplateId;


                                                }
                                                else {
                                                    if ($scope.projectInfo.projectDefaultNotificationSettings.length > 0) {

                                                        var projectDefaultNotificationSettings = $scope.projectInfo.projectDefaultNotificationSettings[0];

                                                        stageItem.emailNotification = projectDefaultNotificationSettings.emailNotification;
                                                        stageItem.smsNotification = projectDefaultNotificationSettings.smsNotification;

                                                        stageItem.startDateTime = moment(kendo.parseDate(stageItem.startDateTime)).format('L LT')
                                                        stageItem.endDateTime = moment(kendo.parseDate(stageItem.endDateTime)).format('L LT')
                                                        stageItem.greenAlarmTime = moment(kendo.parseDate(stageItem.greenAlarmTime)).format('L LT')
                                                        stageItem.yellowAlarmTime = moment(kendo.parseDate(stageItem.yellowAlarmTime)).format('L LT')
                                                        stageItem.redAlarmTime = moment(kendo.parseDate(stageItem.redAlarmTime)).format('L LT')

                                                        stageItem.externalStartNotificationTemplateId = projectDefaultNotificationSettings.participantsStartNotificationId;
                                                        stageItem.externalCompletedNotificationTemplateId = projectDefaultNotificationSettings.participantsCompletedNotificationId;
                                                        stageItem.externalResultsNotificationTemplateId = projectDefaultNotificationSettings.participantsResultNotificationId;
                                                        stageItem.evaluatorStartNotificationTemplateId = projectDefaultNotificationSettings.evaluatorsStartNotificationId;
                                                        stageItem.evaluatorCompletedNotificationTemplateId = projectDefaultNotificationSettings.evaluatorsCompletedNotificationId;
                                                        stageItem.evaluatorResultsNotificationTemplateId = projectDefaultNotificationSettings.evaluatorsResultNotificationId;
                                                        stageItem.trainerStartNotificationTemplateId = projectDefaultNotificationSettings.trainersStartNotificationId;
                                                        stageItem.trainerCompletedNotificationTemplateId = projectDefaultNotificationSettings.trainersCompletedNotificationId;
                                                        stageItem.trainerResultsNotificationTemplateId = projectDefaultNotificationSettings.trainersResultNotificationId;
                                                        stageItem.managerStartNotificationTemplateId = projectDefaultNotificationSettings.managersStartNotificationId;
                                                        stageItem.managerCompletedNotificationTemplateId = projectDefaultNotificationSettings.managersCompletedNotificationId;
                                                        stageItem.managerResultsNotificationTemplateId = projectDefaultNotificationSettings.managersResultNotificationId;


                                                        stageItem.finalScoreManagerStartNotificationTemplateId = projectDefaultNotificationSettings.finalScoreManagersStartNotificationId;
                                                        stageItem.finalScoreManagerCompletedNotificationTemplateId = projectDefaultNotificationSettings.finalScoreManagersCompletedNotificationId;
                                                        stageItem.finalScoreManagerResultsNotificationTemplateId = projectDefaultNotificationSettings.finalScoreManagersResultNotificationId;

                                                        stageItem.projectManagerStartNotificationTemplateId = projectDefaultNotificationSettings.projectManagersStartNotificationId;
                                                        stageItem.projectManagerCompletedNotificationTemplateId = projectDefaultNotificationSettings.projectManagersCompletedNotificationId;
                                                        stageItem.projectManagerResultsNotificationTemplateId = projectDefaultNotificationSettings.projectManagersResultNotificationId;


                                                        stageItem.greenAlarmParticipantTemplateId = projectDefaultNotificationSettings.participantGreenNotificationId;
                                                        stageItem.greenAlarmEvaluatorTemplateId = projectDefaultNotificationSettings.evaluatorGreenNotificationId;
                                                        stageItem.greenAlarmManagerTemplateId = projectDefaultNotificationSettings.managerGreenNotificationId;
                                                        stageItem.greenAlarmTrainerTemplateId = projectDefaultNotificationSettings.trainerGreenNotificationId;
                                                        stageItem.greenAlarmProjectManagerTemplateId = projectDefaultNotificationSettings.projectManagersGreenNotificationId;
                                                        stageItem.greenAlarmFinalScoreManagerTemplateId = projectDefaultNotificationSettings.finalScoreManagersGreenNotificationId;



                                                        stageItem.yellowAlarmParticipantTemplateId = projectDefaultNotificationSettings.participantYellowNotificationId;
                                                        stageItem.yellowAlarmEvaluatorTemplateId = projectDefaultNotificationSettings.evaluatorYellowNotificationId;
                                                        stageItem.yellowAlarmManagerTemplateId = projectDefaultNotificationSettings.managerYellowNotificationId;
                                                        stageItem.yellowAlarmTrainerTemplateId = projectDefaultNotificationSettings.trainerYellowNotificationId;
                                                        stageItem.yellowAlarmProjectManagerTemplateId = projectDefaultNotificationSettings.projectManagersYellowNotificationId;
                                                        stageItem.yellowAlarmFinalScoreManagerTemplateId = projectDefaultNotificationSettings.finalScoreManagersYellowNotificationId;

                                                        stageItem.redAlarmParticipantTemplateId = projectDefaultNotificationSettings.participantRedNotificationId;
                                                        stageItem.redAlarmEvaluatorTemplateId = projectDefaultNotificationSettings.evaluatorRedNotificationId;
                                                        stageItem.redAlarmManagerTemplateId = projectDefaultNotificationSettings.managerRedNotificationId;
                                                        stageItem.redAlarmTrainerTemplateId = projectDefaultNotificationSettings.trainerRedNotificationId;
                                                        stageItem.redAlarmProjectManagerTemplateId = projectDefaultNotificationSettings.projectManagersRedNotificationId;
                                                        stageItem.redAlarmFinalScoreManagerTemplateId = projectDefaultNotificationSettings.finalScoreManagersRedNotificationId;
                                                    }
                                                    else {
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


                                                            stageItem.finalScoreManagerStartNotificationTemplateId = globalSetting.softProfileShortGoalFinalScoreManagerStartNotificationTemplateId;
                                                            stageItem.finalScoreManagerCompletedNotificationTemplateId = globalSetting.softProfileShortGoalFinalScoreManagerCompletedNotificationTemplateId;
                                                            stageItem.finalScoreManagerResultsNotificationTemplateId = globalSetting.softProfileShortGoalFinalScoreManagerResultsNotificationTemplateId;

                                                            stageItem.projectManagerStartNotificationTemplateId = globalSetting.softProfileShortGoalProjectManagerStartNotificationTemplateId;
                                                            stageItem.projectManagerCompletedNotificationTemplateId = globalSetting.softProfileShortGoalProjectManagerCompletedNotificationTemplateId;
                                                            stageItem.projectManagerResultsNotificationTemplateId = globalSetting.softProfileShortGoalProjectManagerResultsNotificationTemplateId;


                                                            stageItem.greenAlarmParticipantTemplateId = globalSetting.softProfileShortGoalGreenAlarmParticipantTemplateId;
                                                            stageItem.greenAlarmEvaluatorTemplateId = globalSetting.softProfileShortGoalGreenAlarmEvaluatorTemplateId;
                                                            stageItem.greenAlarmManagerTemplateId = globalSetting.softProfileShortGoalGreenAlarmManagerTemplateId;
                                                            stageItem.greenAlarmTrainerTemplateId = globalSetting.softProfileShortGoalGreenAlarmTrainerTemplateId;
                                                            stageItem.greenAlarmProjectManagerTemplateId = globalSetting.softProfileShortGoalGreenAlarmProjectManagerTemplateId;
                                                            stageItem.greenAlarmFinalScoreManagerTemplateId = globalSetting.softProfileShortGoalGreenAlarmFinalScoreManagerTemplateId;



                                                            stageItem.yellowAlarmParticipantTemplateId = globalSetting.softProfileShortGoalYellowAlarmParticipantTemplateId;
                                                            stageItem.yellowAlarmEvaluatorTemplateId = globalSetting.softProfileShortGoalYellowAlarmEvaluatorTemplateId;
                                                            stageItem.yellowAlarmManagerTemplateId = globalSetting.softProfileShortGoalYellowAlarmManagerTemplateId;
                                                            stageItem.yellowAlarmTrainerTemplateId = globalSetting.softProfileShortGoalYellowAlarmTrainerTemplateId;
                                                            stageItem.yellowAlarmProjectManagerTemplateId = globalSetting.softProfileShortGoalYellowAlarmProjectManagerTemplateId;
                                                            stageItem.yellowAlarmFinalScoreManagerTemplateId = globalSetting.softProfileShortGoalYellowAlarmFinalScoreManagerTemplateId;

                                                            stageItem.redAlarmParticipantTemplateId = globalSetting.softProfileShortGoalRedAlarmParticipantTemplateId;
                                                            stageItem.redAlarmEvaluatorTemplateId = globalSetting.softProfileShortGoalRedAlarmEvaluatorTemplateId;
                                                            stageItem.redAlarmManagerTemplateId = globalSetting.softProfileShortGoalRedAlarmManagerTemplateId;
                                                            stageItem.redAlarmTrainerTemplateId = globalSetting.softProfileShortGoalRedAlarmTrainerTemplateId;
                                                            stageItem.redAlarmProjectManagerTemplateId = globalSetting.softProfileShortGoalRedAlarmProjectManagerTemplateId;
                                                            stageItem.redAlarmFinalScoreManagerTemplateId = globalSetting.softProfileShortGoalRedAlarmFinalScoreManagerTemplateId;


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


                                                            stageItem.finalScoreManagerStartNotificationTemplateId = globalSetting.softProfileMidGoalFinalScoreManagerStartNotificationTemplateId;
                                                            stageItem.finalScoreManagerCompletedNotificationTemplateId = globalSetting.softProfileMidGoalFinalScoreManagerCompletedNotificationTemplateId;
                                                            stageItem.finalScoreManagerResultsNotificationTemplateId = globalSetting.softProfileMidGoalFinalScoreManagerResultsNotificationTemplateId;

                                                            stageItem.projectManagerStartNotificationTemplateId = globalSetting.softProfileMidGoalProjectManagerStartNotificationTemplateId;
                                                            stageItem.projectManagerCompletedNotificationTemplateId = globalSetting.softProfileMidGoalProjectManagerCompletedNotificationTemplateId;
                                                            stageItem.projectManagerResultsNotificationTemplateId = globalSetting.softProfileMidGoalProjectManagerResultsNotificationTemplateId;

                                                            stageItem.greenAlarmParticipantTemplateId = globalSetting.softProfileMidGoalGreenAlarmParticipantTemplateId;
                                                            stageItem.greenAlarmEvaluatorTemplateId = globalSetting.softProfileMidGoalGreenAlarmEvaluatorTemplateId;
                                                            stageItem.greenAlarmManagerTemplateId = globalSetting.softProfileMidGoalGreenAlarmManagerTemplateId;
                                                            stageItem.greenAlarmTrainerTemplateId = globalSetting.softProfileMidGoalGreenAlarmTrainerTemplateId;
                                                            stageItem.greenAlarmProjectManagerTemplateId = globalSetting.softProfileMidGoalGreenAlarmProjectManagerTemplateId;
                                                            stageItem.greenAlarmFinalScoreManagerTemplateId = globalSetting.softProfileMidGoalGreenAlarmFinalScoreManagerTemplateId;


                                                            stageItem.yellowAlarmParticipantTemplateId = globalSetting.softProfileMidGoalYellowAlarmParticipantTemplateId;
                                                            stageItem.yellowAlarmEvaluatorTemplateId = globalSetting.softProfileMidGoalYellowAlarmEvaluatorTemplateId;
                                                            stageItem.yellowAlarmManagerTemplateId = globalSetting.softProfileMidGoalYellowAlarmManagerTemplateId;
                                                            stageItem.yellowAlarmTrainerTemplateId = globalSetting.softProfileMidGoalYellowAlarmTrainerTemplateId;
                                                            stageItem.yellowAlarmProjectManagerTemplateId = globalSetting.softProfileMidGoalYellowAlarmProjectManagerTemplateId;
                                                            stageItem.yellowAlarmFinalScoreManagerTemplateId = globalSetting.softProfileMidGoalYellowAlarmFinalScoreManagerTemplateId;


                                                            stageItem.redAlarmParticipantTemplateId = globalSetting.softProfileMidGoalRedAlarmParticipantTemplateId;
                                                            stageItem.redAlarmEvaluatorTemplateId = globalSetting.softProfileMidGoalRedAlarmEvaluatorTemplateId;
                                                            stageItem.redAlarmManagerTemplateId = globalSetting.softProfileMidGoalRedAlarmManagerTemplateId;
                                                            stageItem.redAlarmTrainerTemplateId = globalSetting.softProfileMidGoalRedAlarmTrainerTemplateId;
                                                            stageItem.redAlarmProjectManagerTemplateId = globalSetting.softProfileMidGoalRedAlarmProjectManagerTemplateId;
                                                            stageItem.redAlarmFinalScoreManagerTemplateId = globalSetting.softProfileMidGoalRedAlarmFinalScoreManagerTemplateId;


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

                                                            stageItem.finalScoreManagerStartNotificationTemplateId = globalSetting.softProfileLongTermGoalFinalScoreManagerStartNotificationTemplateId;
                                                            stageItem.finalScoreManagerCompletedNotificationTemplateId = globalSetting.softProfileLongTermGoalFinalScoreManagerCompletedNotificationTemplateId;
                                                            stageItem.finalScoreManagerResultsNotificationTemplateId = globalSetting.softProfileLongTermGoalFinalScoreManagerResultsNotificationTemplateId;

                                                            stageItem.projectManagerStartNotificationTemplateId = globalSetting.softProfileLongTermGoalProjectManagerStartNotificationTemplateId;
                                                            stageItem.projectManagerCompletedNotificationTemplateId = globalSetting.softProfileLongTermGoalProjectManagerCompletedNotificationTemplateId;
                                                            stageItem.projectManagerResultsNotificationTemplateId = globalSetting.softProfileLongTermGoalProjectManagerResultsNotificationTemplateId;

                                                            stageItem.greenAlarmParticipantTemplateId = globalSetting.softProfileLongTermGoalGreenAlarmParticipantTemplateId;
                                                            stageItem.greenAlarmEvaluatorTemplateId = globalSetting.softProfileLongTermGoalGreenAlarmEvaluatorTemplateId;
                                                            stageItem.greenAlarmManagerTemplateId = globalSetting.softProfileLongTermGoalGreenAlarmManagerTemplateId;
                                                            stageItem.greenAlarmTrainerTemplateId = globalSetting.softProfileLongTermGoalGreenAlarmTrainerTemplateId;
                                                            stageItem.greenAlarmProjectManagerTemplateId = globalSetting.softProfileLongTermGoalGreenAlarmProjectManagerTemplateId;
                                                            stageItem.greenAlarmFinalScoreManagerTemplateId = globalSetting.softProfileLongTermGoalGreenAlarmFinalScoreManagerTemplateId;

                                                            stageItem.yellowAlarmParticipantTemplateId = globalSetting.softProfileLongTermGoalYellowAlarmParticipantTemplateId;
                                                            stageItem.yellowAlarmEvaluatorTemplateId = globalSetting.softProfileLongTermGoalYellowAlarmEvaluatorTemplateId;
                                                            stageItem.yellowAlarmManagerTemplateId = globalSetting.softProfileLongTermGoalYellowAlarmManagerTemplateId;
                                                            stageItem.yellowAlarmTrainerTemplateId = globalSetting.softProfileLongTermGoalYellowAlarmTrainerTemplateId;
                                                            stageItem.yellowAlarmProjectManagerTemplateId = globalSetting.softProfileLongTermGoalYellowAlarmProjectManagerTemplateId;
                                                            stageItem.yellowAlarmFinalScoreManagerTemplateId = globalSetting.softProfileLongTermGoalYellowAlarmFinalScoreManagerTemplateId;

                                                            stageItem.redAlarmParticipantTemplateId = globalSetting.softProfileLongTermGoalRedAlarmParticipantTemplateId;
                                                            stageItem.redAlarmEvaluatorTemplateId = globalSetting.softProfileLongTermGoalRedAlarmEvaluatorTemplateId;
                                                            stageItem.redAlarmManagerTemplateId = globalSetting.softProfileLongTermGoalRedAlarmManagerTemplateId;
                                                            stageItem.redAlarmTrainerTemplateId = globalSetting.softProfileLongTermGoalRedAlarmTrainerTemplateId;
                                                            stageItem.redAlarmProjectManagerTemplateId = globalSetting.softProfileLongTermGoalRedAlarmProjectManagerTemplateId;
                                                            stageItem.redAlarmFinalScoreManagerTemplateId = globalSetting.softProfileLongTermGoalRedAlarmFinalScoreManagerTemplateId;


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
                                                            stageItem.greenAlarmProjectManagerTemplateId = globalSetting.softProfileFinalGoalGreenAlarmProjectManagerTemplateId;
                                                            stageItem.greenAlarmFinalScoreManagerTemplateId = globalSetting.softProfileFinalGoalGreenAlarmFinalScoreManagerTemplateId;

                                                            stageItem.finalScoreManagerStartNotificationTemplateId = globalSetting.softProfileFinalGoalFinalScoreManagerStartNotificationTemplateId;
                                                            stageItem.finalScoreManagerCompletedNotificationTemplateId = globalSetting.softProfileFinalGoalFinalScoreManagerCompletedNotificationTemplateId;
                                                            stageItem.finalScoreManagerResultsNotificationTemplateId = globalSetting.softProfileFinalGoalFinalScoreManagerResultsNotificationTemplateId;

                                                            stageItem.projectManagerStartNotificationTemplateId = globalSetting.softProfileFinalGoalProjectManagerStartNotificationTemplateId;
                                                            stageItem.projectManagerCompletedNotificationTemplateId = globalSetting.softProfileFinalGoalProjectManagerCompletedNotificationTemplateId;
                                                            stageItem.projectManagerResultsNotificationTemplateId = globalSetting.softProfileFinalGoalProjectManagerResultsNotificationTemplateId;


                                                            stageItem.greenAlarmParticipantTemplateId = globalSetting.softProfileFinalGoalGreenAlarmParticipantTemplateId;
                                                            stageItem.greenAlarmEvaluatorTemplateId = globalSetting.softProfileFinalGoalGreenAlarmEvaluatorTemplateId;
                                                            stageItem.greenAlarmManagerTemplateId = globalSetting.softProfileFinalGoalGreenAlarmManagerTemplateId;
                                                            stageItem.greenAlarmTrainerTemplateId = globalSetting.softProfileFinalGoalGreenAlarmTrainerTemplateId;
                                                            stageItem.yellowAlarmParticipantTemplateId = globalSetting.softProfileFinalGoalYellowAlarmParticipantTemplateId;
                                                            stageItem.yellowAlarmEvaluatorTemplateId = globalSetting.softProfileFinalGoalYellowAlarmEvaluatorTemplateId;
                                                            stageItem.yellowAlarmManagerTemplateId = globalSetting.softProfileFinalGoalYellowAlarmManagerTemplateId;
                                                            stageItem.yellowAlarmTrainerTemplateId = globalSetting.softProfileFinalGoalYellowAlarmTrainerTemplateId;
                                                            stageItem.yellowAlarmProjectManagerTemplateId = globalSetting.softProfileFinalGoalYellowAlarmProjectManagerTemplateId;
                                                            stageItem.yellowAlarmFinalScoreManagerTemplateId = globalSetting.softProfileFinalGoalYellowAlarmFinalScoreManagerTemplateId;

                                                            stageItem.redAlarmParticipantTemplateId = globalSetting.softProfileFinalGoalRedAlarmParticipantTemplateId;
                                                            stageItem.redAlarmEvaluatorTemplateId = globalSetting.softProfileFinalGoalRedAlarmEvaluatorTemplateId;
                                                            stageItem.redAlarmManagerTemplateId = globalSetting.softProfileFinalGoalRedAlarmManagerTemplateId;
                                                            stageItem.redAlarmTrainerTemplateId = globalSetting.softProfileFinalGoalRedAlarmTrainerTemplateId;
                                                            stageItem.redAlarmProjectManagerTemplateId = globalSetting.softProfileFinalGoalRedAlarmProjectManagerTemplateId;
                                                            stageItem.redAlarmFinalScoreManagerTemplateId = globalSetting.softProfileFinalGoalRedAlarmFinalScoreManagerTemplateId;

                                                        }
                                                    }
                                                }
                                            }
                                            else {

                                                stageItem.evaluationStartDate = moment(kendo.parseDate(stageItem.evaluationStartDate)).format('L LT')
                                                stageItem.evaluationEndDate = moment(kendo.parseDate(stageItem.evaluationEndDate)).format('L LT')
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
                                        $scope.setDefaults($scope.stageGroup.id);
                                    }
                                },
                                    function (data) {

                                    });
                            }

                        }, function (data) {
                        });

                    }
                    else {
                        // Edit
                        stageGroupManager.isStageGroupInUse($scope.stageGroup.id).then(function (data) {
                            if (data == true) {
                                //dialogService.showNotification($translate.instant('MYPROJECTS_STAGE_GROUP_CANNOT_BE_UPDATE') + ' ' + $translate.instant('MYPROJECTS_THIS_STAGE_GROUP_IS_ALREADY_IN_USE'), 'warning');
                                var clonnedStageGroup = _.clone($scope.stageGroup);
                                clonnedStageGroup.startDate = kendo.parseDate(clonnedStageGroup.startDate);
                                clonnedStageGroup.endDate = kendo.parseDate(clonnedStageGroup.endDate);
                                stageGroupManager.updateStageGroupBasicInfo(clonnedStageGroup).then(function (data) {
                                    dialogService.showNotification($translate.instant('SOFTPROFILE_STAGE_GROUP_BASIC_INFO_UPDATE'), 'info');
                                })

                            } else {
                                dialogService.showYesNoDialog($translate.instant('COMMON_CONFIRM'), $translate.instant('MYPROJECTS_ARE_YOU_SURE_YOU_WANT_TO_UPDATE')).then(function () {
                                    var stageGroup = angular.copy($scope.stageGroup);
                                    stageGroup.stages = [];
                                    stageGroup.profiles = [];
                                    var profile = angular.copy($scope.profile);
                                    stageGroup["profiles"] = [profile];
                                    stageGroup.startDate = kendo.parseDate(stageGroup.startDate);
                                    stageGroup.endDate = kendo.parseDate(stageGroup.endDate);
                                    stageGroup.startStageStartDate = kendo.parseDate(stageGroup.startStageStartDate);
                                    stageGroup.startStageEndDate = kendo.parseDate(stageGroup.startStageEndDate);
                                    stageGroup.milestoneStartDate = kendo.parseDate(stageGroup.milestoneStartDate);
                                    stageGroup.milestoneEndDate = kendo.parseDate(stageGroup.milestoneEndDate);
                                    apiService.update('stageGroups', stageGroup).then(function (data) {
                                        if (data) {
                                            apiService.getById("profiles/getFullProfileById", $stateParams.profileId, "").then(function (profileDatail) {
                                                var profile = profileDatail;
                                                _.each(profile.performanceGroups, function (pgItem) {
                                                    _.each(pgItem.link_PerformanceGroupSkills, function (link_PerformanceGroupSkillItem) {
                                                        link_PerformanceGroupSkillItem.name = link_PerformanceGroupSkillItem.skill.name;
                                                        link_PerformanceGroupSkillItem.description = link_PerformanceGroupSkillItem.skill.description;
                                                        _.each(link_PerformanceGroupSkillItem.questions, function (questionsItem) {
                                                            questionsItem["skillId"] = link_PerformanceGroupSkillItem.id;
                                                        });
                                                    });
                                                });
                                                _.each(profile.stageGroups, function (sgItem) {
                                                    sgItem.startDate = moment(kendo.parseDate(sgItem.startDate)).format('L LT');
                                                    sgItem.endDate = moment(kendo.parseDate(sgItem.endDate)).format('L LT');
                                                    if (sgItem.startStageStartDate) {
                                                        sgItem.startStageStartDate = moment(kendo.parseDate(sgItem.startStageStartDate)).format('L LT');
                                                    }
                                                    if (sgItem.startStageEndDate) {
                                                        sgItem.startStageEndDate = moment(kendo.parseDate(sgItem.startStageEndDate)).format('L LT');
                                                    }
                                                    if (sgItem.milestoneStartDate) {
                                                        sgItem.milestoneStartDate = moment(kendo.parseDate(sgItem.milestoneStartDate)).format('L LT');
                                                    }
                                                    if (sgItem.milestoneEndDate) {
                                                        sgItem.milestoneEndDate = moment(kendo.parseDate(sgItem.milestoneEndDate)).format('L LT');
                                                    }
                                                    _.each(sgItem.stages, function (stageItem) {
                                                        stageItem.startDateTime = moment(kendo.parseDate(stageItem.startDateTime)).format('L LT');
                                                        stageItem.endDateTime = moment(kendo.parseDate(stageItem.endDateTime)).format('L LT');
                                                        stageItem.redAlarmTime = moment(kendo.parseDate(stageItem.redAlarmTime)).format('L LT');
                                                        stageItem.yellowAlarmTime = moment(kendo.parseDate(stageItem.yellowAlarmTime)).format('L LT');
                                                        stageItem.greenAlarmTime = moment(kendo.parseDate(stageItem.greenAlarmTime)).format('L LT');

                                                        if (stageItem.evaluationStartDate != null) {
                                                            stageItem.evaluationStartDate = moment(kendo.parseDate(stageItem.evaluationStartDate)).format('L LT');
                                                        }
                                                        if (stageItem.evaluationEndDate != null) {
                                                            stageItem.evaluationEndDate = moment(kendo.parseDate(stageItem.evaluationEndDate)).format('L LT');
                                                        }
                                                    });
                                                    var sortedStages = _.sortByOrder(sgItem.stages, function (o) { return new moment(kendo.parseDate(o.startDate)).format('L LT'); }, ['asc']);
                                                    sgItem.stages = sortedStages;
                                                });
                                                $scope.profile = profile;
                                                $scope.profileType = profile.profileTypeId;
                                                dialogService.showNotification($translate.instant('MYPROJECTS_PROJECTPROFILES_STAGE_GROUP_UPDATED_SUCCESSFULLY'), "success");
                                            }, function () {
                                            })
                                        }
                                        else {
                                            dialogService.showNotification($translate.instant('MYPROJECTS_PROJECTPROFILES_STAGE_GROUP_UPDATE_FAILED'), "warning");
                                        }
                                    }, function (error) {
                                        dialogService.showNotification(error, "warning")
                                    })
                                })


                            }
                        })
                    }
                    $("#stageGroupModal").modal("hide");
                }
            }

            $scope.changeStage = function (stageGroupId, stageId) {
                $scope.isStartStage = false;
                _.each($scope.profile.stageGroups, function (stageGroupItem) {
                    if (stageGroupItem.id == stageGroupId) {
                        _.each(stageGroupItem.stages, function (stageItem, index) {
                            if (stageItem.id == stageId) {
                                if (index == 0) {
                                    $scope.isStartStage = true;
                                }
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

            $scope.checkMilestoneDatesAreValid = function () {
                var result = true;
                $scope.errors = [];
                if ($scope.selectedStageGroup) {
                    _.each($scope.selectedStageGroup.stages, function (stageItem) {
                        //
                        if (stageItem && $scope.selectedStageGroup) {
                            var stageIndex = _.findIndex($scope.selectedStageGroup.stages, function (item) {
                                return item.id == stageItem.id;
                            });

                            if (stageItem.evaluationStartDate == null) {
                                $scope.errors.push($translate.instant('MYPROJECTS_INVALID_EVALUATION_START_DATE_OF') + " " + stageItem.name);
                            }
                            if (kendo.parseDate(stageItem.evaluationStartDate) < kendo.parseDate(stageItem.startDateTime)) {
                                $scope.errors.push($translate.instant('MYPROJECTS_EVALUATION_START_DATE_START_BEFORE_RCT_OPEN_FOR') + " " + stageItem.name);
                            }
                            if (kendo.parseDate(stageItem.endDateTime) < kendo.parseDate(stageItem.startDateTime)) {
                                $scope.errors.push($translate.instant('MYPROJECTS_RCT_DUE_DATE_BEFORE_THE_RCT_START_DATE_FOR') + " " + stageItem.name);
                            }
                            if (stageItem.endDateTime == null) {
                                $scope.errors.push($translate.instant('MYPROJECTS_INVALID_DUE_DATE_OF') + " " + stageItem.name);
                            }


                            if (stageItem.endDateTime != null) {
                                _.each($scope.selectedStageGroup.stages, function (item, index) {
                                    if (index == (stageIndex + 1)) {
                                        if (kendo.parseDate(stageItem.endDateTime) > kendo.parseDate(item.startDateTime)) {
                                            $scope.errors.push(item.name + " " + $translate.instant('MYPROJECTS_START_BEFORE') + " " + stageItem.name + " " + $translate.instant('MYPROJECTS_DUE'));
                                        }
                                    }
                                    if (index == (stageIndex - 1)) {
                                        if (kendo.parseDate(stageItem.startDateTime) < kendo.parseDate(item.endDateTime)) {
                                            $scope.errors.push(stageItem.name + " " + $translate.instant('MYPROJECTS_START_BEFORE') + " " + item.name + " " + $translate.instant('MYPROJECTS_DUE'));
                                        }
                                    }
                                });
                            }
                        }
                        //
                    })
                    if ($scope.errors.length > 0) {
                        result = false;
                    }
                }
                return result;
            }
            $scope.updateStage = function () {
                var stageItem = _.clone($scope.stage);
                if ($scope.checkMilestoneDatesAreValid()) {
                    stageItem.startDateTime = kendo.parseDate(stageItem.startDateTime);
                    stageItem.endDateTime = kendo.parseDate(stageItem.endDateTime);
                    stageItem.greenAlarmTime = kendo.parseDate(stageItem.greenAlarmTime);
                    stageItem.yellowAlarmTime = kendo.parseDate(stageItem.yellowAlarmTime);
                    stageItem.redAlarmTime = kendo.parseDate(stageItem.redAlarmTime);
                    stageItem.evaluationStartDate = kendo.parseDate(stageItem.evaluationStartDate);
                    stageItem.evaluationEndDate = kendo.parseDate(stageItem.evaluationEndDate);
                    stageItem.invitedAt = kendo.parseDate(stageItem.invitedAt);
                    apiService.update("stages", stageItem).then(function (data) {
                        if (data) {
                            dialogService.showNotification($translate.instant('MYPROJECTS_STAGE_DETAIL_UPDATED'));
                        }
                    },
                        function (data) {
                        });
                }
            }
            $scope.setDefaults = function (stageGroupId) {
                if (stageGroupId) {
                    $scope.stageGroup = _.find($scope.profile.stageGroups, function (stageGroupItem) {
                        return stageGroupItem.id == stageGroupId;
                    })
                }
                if ($scope.stageGroup) {

                    if ($scope.profile.profileTypeId == profileTypeEnum.Knowledge) {
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

                            $scope.stageGroup.stages[0].finalScoreManagerStartNotificationTemplateId = globalSetting.knowledgeProfileFinalScoreManagerStartNotificationTemplateId;
                            $scope.stageGroup.stages[0].finalScoreManagerCompletedNotificationTemplateId = globalSetting.knowledgeProfileFinalScoreManagerCompletedNotificationTemplateId;
                            $scope.stageGroup.stages[0].finalScoreManagerResultsNotificationTemplateId = globalSetting.knowledgeProfileFinalScoreManagerResultsNotificationTemplateId;

                            $scope.stageGroup.stages[0].projectManagerStartNotificationTemplateId = globalSetting.knowledgeProfileProjectManagerStartNotificationTemplateId;
                            $scope.stageGroup.stages[0].projectManagerCompletedNotificationTemplateId = globalSetting.knowledgeProfileProjectManagerCompletedNotificationTemplateId;
                            $scope.stageGroup.stages[0].projectManagerResultsNotificationTemplateId = globalSetting.knowledgeProfileProjectManagerResultsNotificationTemplateId;



                            $scope.stageGroup.stages[0].greenAlarmParticipantTemplateId = globalSetting.knowledgeProfileGreenAlarmParticipantTemplateId;
                            $scope.stageGroup.stages[0].greenAlarmEvaluatorTemplateId = globalSetting.knowledgeProfileGreenAlarmEvaluatorTemplateId;
                            $scope.stageGroup.stages[0].greenAlarmManagerTemplateId = globalSetting.knowledgeProfileGreenAlarmManagerTemplateId;
                            $scope.stageGroup.stages[0].greenAlarmProjectManagerTemplateId = globalSetting.knowledgeProfileGreenAlarmProjectManagerTemplateId;
                            $scope.stageGroup.stages[0].greenAlarmFinalScoreManagerTemplateId = globalSetting.knowledgeProfileGreenAlarmFinalScoreManagerTemplateId;
                            $scope.stageGroup.stages[0].greenAlarmTrainerTemplateId = globalSetting.knowledgeProfileGreenAlarmTrainerTemplateId;
                            $scope.stageGroup.stages[0].yellowAlarmParticipantTemplateId = globalSetting.knowledgeProfileYellowAlarmParticipantTemplateId;
                            $scope.stageGroup.stages[0].yellowAlarmEvaluatorTemplateId = globalSetting.knowledgeProfileYellowAlarmEvaluatorTemplateId;
                            $scope.stageGroup.stages[0].yellowAlarmManagerTemplateId = globalSetting.knowledgeProfileYellowAlarmManagerTemplateId;
                            $scope.stageGroup.stages[0].yellowAlarmProjectManagerTemplateId = globalSetting.knowledgeProfileYellowAlarmProjectManagerTemplateId;
                            $scope.stageGroup.stages[0].yellowAlarmFinalScoreManagerTemplateId = globalSetting.knowledgeProfileYellowAlarmFinalScoreManagerTemplateId;
                            $scope.stageGroup.stages[0].yellowAlarmTrainerTemplateId = globalSetting.knowledgeProfileYellowAlarmTrainerTemplateId;
                            $scope.stageGroup.stages[0].redAlarmParticipantTemplateId = globalSetting.knowledgeProfileRedAlarmParticipantTemplateId;
                            $scope.stageGroup.stages[0].redAlarmEvaluatorTemplateId = globalSetting.knowledgeProfileRedAlarmEvaluatorTemplateId;
                            $scope.stageGroup.stages[0].redAlarmManagerTemplateId = globalSetting.knowledgeProfileRedAlarmManagerTemplateId;
                            $scope.stageGroup.stages[0].redAlarmProjectManagerTemplateId = globalSetting.knowledgeProfileRedAlarmProjectManagerTemplateId;
                            $scope.stageGroup.stages[0].redAlarmFinalScoreManagerTemplateId = globalSetting.knowledgeProfileRedAlarmFinalScoreManagerTemplateId;
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
                    else if ($scope.profile.profileTypeId == profileTypeEnum.Soft || $scope.profile.profileTypeId == profileTypeEnum.Hard) {
                        var globalSetting = null;
                        if ($scope.projectInfo.projectGlobalSettings.length > 0) {
                            globalSetting = $scope.projectInfo.projectGlobalSettings[0]
                        }
                        if (globalSetting) {
                            _.each($scope.stageGroup.stages, function (stageItem, index) {
                                if (index == 0) {
                                    stageItem.emailNotification = globalSetting.softProfileStartEmailNotification;
                                    stageItem.smsNotification = globalSetting.softProfileStartSmsNotification;

                                    stageItem.startDateTime = moment(kendo.parseDate(stageItem.startDateTime)).format('L LT')
                                    stageItem.endDateTime = moment(kendo.parseDate(stageItem.endDateTime)).format('L LT')
                                    stageItem.greenAlarmTime = moment(kendo.parseDate(stageItem.greenAlarmTime)).format('L LT')
                                    stageItem.yellowAlarmTime = moment(kendo.parseDate(stageItem.yellowAlarmTime)).format('L LT')
                                    stageItem.redAlarmTime = moment(kendo.parseDate(stageItem.redAlarmTime)).format('L LT')


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

                                    stageItem.finalScoreManagerStartNotificationTemplateId = globalSetting.softProfileStartFinalScoreManagerStartNotificationTemplateId;
                                    stageItem.finalScoreManagerCompletedNotificationTemplateId = globalSetting.softProfileStartFinalScoreManagerCompletedNotificationTemplateId;
                                    stageItem.finalScoreManagerResultsNotificationTemplateId = globalSetting.softProfileStartFinalScoreManagerResultsNotificationTemplateId;

                                    stageItem.projectManagerStartNotificationTemplateId = globalSetting.softProfileStartProjectManagerStartNotificationTemplateId;
                                    stageItem.projectManagerCompletedNotificationTemplateId = globalSetting.softProfileStartProjectManagerCompletedNotificationTemplateId;
                                    stageItem.projectManagerResultsNotificationTemplateId = globalSetting.softProfileStartProjectManagerResultsNotificationTemplateId;


                                    stageItem.greenAlarmParticipantTemplateId = globalSetting.softProfileStartGreenAlarmParticipantTemplateId;
                                    stageItem.greenAlarmEvaluatorTemplateId = globalSetting.softProfileStartGreenAlarmEvaluatorTemplateId;
                                    stageItem.greenAlarmManagerTemplateId = globalSetting.softProfileStartGreenAlarmManagerTemplateId;
                                    stageItem.greenAlarmTrainerTemplateId = globalSetting.softProfileStartGreenAlarmTrainerTemplateId;
                                    stageItem.greenAlarmProjectManagerTemplateId = globalSetting.softProfileStartGreenAlarmProjectManagerTemplateId;
                                    stageItem.greenAlarmFinalScoreManagerTemplateId = globalSetting.softProfileStartGreenAlarmFinalScoreManagerTemplateId;

                                    stageItem.yellowAlarmParticipantTemplateId = globalSetting.softProfileStartYellowAlarmParticipantTemplateId;
                                    stageItem.yellowAlarmEvaluatorTemplateId = globalSetting.softProfileStartYellowAlarmEvaluatorTemplateId;
                                    stageItem.yellowAlarmManagerTemplateId = globalSetting.softProfileStartYellowAlarmManagerTemplateId;
                                    stageItem.yellowAlarmTrainerTemplateId = globalSetting.softProfileStartYellowAlarmTrainerTemplateId;
                                    stageItem.yellowAlarmProjectManagerTemplateId = globalSetting.softProfileStartYellowAlarmProjectManagerTemplateId;
                                    stageItem.yellowAlarmFinalScoreManagerTemplateId = globalSetting.softProfileStartYellowAlarmFinalScoreManagerTemplateId;

                                    stageItem.redAlarmParticipantTemplateId = globalSetting.softProfileStartRedAlarmParticipantTemplateId;
                                    stageItem.redAlarmEvaluatorTemplateId = globalSetting.softProfileStartRedAlarmEvaluatorTemplateId;
                                    stageItem.redAlarmManagerTemplateId = globalSetting.softProfileStartRedAlarmManagerTemplateId;
                                    stageItem.redAlarmTrainerTemplateId = globalSetting.softProfileStartRedAlarmTrainerTemplateId;
                                    stageItem.redAlarmProjectManagerTemplateId = globalSetting.softProfileStartRedAlarmProjectManagerTemplateId;
                                    stageItem.redAlarmFinalScoreManagerTemplateId = globalSetting.softProfileStartRedAlarmFinalScoreManagerTemplateId;


                                }
                                else {
                                    if ($scope.projectInfo.projectDefaultNotificationSettings.length > 0) {

                                        var projectDefaultNotificationSettings = $scope.projectInfo.projectDefaultNotificationSettings[0];

                                        stageItem.emailNotification = projectDefaultNotificationSettings.emailNotification;
                                        stageItem.smsNotification = projectDefaultNotificationSettings.smsNotification;

                                        stageItem.startDateTime = moment(kendo.parseDate(stageItem.startDateTime)).format('L LT')
                                        stageItem.endDateTime = moment(kendo.parseDate(stageItem.endDateTime)).format('L LT')
                                        stageItem.greenAlarmTime = moment(kendo.parseDate(stageItem.greenAlarmTime)).format('L LT')
                                        stageItem.yellowAlarmTime = moment(kendo.parseDate(stageItem.yellowAlarmTime)).format('L LT')
                                        stageItem.redAlarmTime = moment(kendo.parseDate(stageItem.redAlarmTime)).format('L LT')

                                        stageItem.externalStartNotificationTemplateId = projectDefaultNotificationSettings.participantsStartNotificationId;
                                        stageItem.externalCompletedNotificationTemplateId = projectDefaultNotificationSettings.participantsCompletedNotificationId;
                                        stageItem.externalResultsNotificationTemplateId = projectDefaultNotificationSettings.participantsResultNotificationId;
                                        stageItem.evaluatorStartNotificationTemplateId = projectDefaultNotificationSettings.evaluatorsStartNotificationId;
                                        stageItem.evaluatorCompletedNotificationTemplateId = projectDefaultNotificationSettings.evaluatorsCompletedNotificationId;
                                        stageItem.evaluatorResultsNotificationTemplateId = projectDefaultNotificationSettings.evaluatorsResultNotificationId;
                                        stageItem.trainerStartNotificationTemplateId = projectDefaultNotificationSettings.trainersStartNotificationId;
                                        stageItem.trainerCompletedNotificationTemplateId = projectDefaultNotificationSettings.trainersCompletedNotificationId;
                                        stageItem.trainerResultsNotificationTemplateId = projectDefaultNotificationSettings.trainersResultNotificationId;
                                        stageItem.managerStartNotificationTemplateId = projectDefaultNotificationSettings.managersStartNotificationId;
                                        stageItem.managerCompletedNotificationTemplateId = projectDefaultNotificationSettings.managersCompletedNotificationId;
                                        stageItem.managerResultsNotificationTemplateId = projectDefaultNotificationSettings.managersResultNotificationId;


                                        stageItem.finalScoreManagerStartNotificationTemplateId = projectDefaultNotificationSettings.finalScoreManagersStartNotificationId;
                                        stageItem.finalScoreManagerCompletedNotificationTemplateId = projectDefaultNotificationSettings.finalScoreManagersCompletedNotificationId;
                                        stageItem.finalScoreManagerResultsNotificationTemplateId = projectDefaultNotificationSettings.finalScoreManagersResultNotificationId;

                                        stageItem.projectManagerStartNotificationTemplateId = projectDefaultNotificationSettings.projectManagersStartNotificationId;
                                        stageItem.projectManagerCompletedNotificationTemplateId = projectDefaultNotificationSettings.projectManagersCompletedNotificationId;
                                        stageItem.projectManagerResultsNotificationTemplateId = projectDefaultNotificationSettings.projectManagersResultNotificationId;


                                        stageItem.greenAlarmParticipantTemplateId = projectDefaultNotificationSettings.participantGreenNotificationId;
                                        stageItem.greenAlarmEvaluatorTemplateId = projectDefaultNotificationSettings.evaluatorGreenNotificationId;
                                        stageItem.greenAlarmManagerTemplateId = projectDefaultNotificationSettings.managerGreenNotificationId;
                                        stageItem.greenAlarmTrainerTemplateId = projectDefaultNotificationSettings.trainerGreenNotificationId;
                                        stageItem.greenAlarmProjectManagerTemplateId = projectDefaultNotificationSettings.projectManagersGreenNotificationId;
                                        stageItem.greenAlarmFinalScoreManagerTemplateId = projectDefaultNotificationSettings.finalScoreManagersGreenNotificationId;



                                        stageItem.yellowAlarmParticipantTemplateId = projectDefaultNotificationSettings.participantYellowNotificationId;
                                        stageItem.yellowAlarmEvaluatorTemplateId = projectDefaultNotificationSettings.evaluatorYellowNotificationId;
                                        stageItem.yellowAlarmManagerTemplateId = projectDefaultNotificationSettings.managerYellowNotificationId;
                                        stageItem.yellowAlarmTrainerTemplateId = projectDefaultNotificationSettings.trainerYellowNotificationId;
                                        stageItem.yellowAlarmProjectManagerTemplateId = projectDefaultNotificationSettings.projectManagersYellowNotificationId;
                                        stageItem.yellowAlarmFinalScoreManagerTemplateId = projectDefaultNotificationSettings.finalScoreManagersYellowNotificationId;

                                        stageItem.redAlarmParticipantTemplateId = projectDefaultNotificationSettings.participantRedNotificationId;
                                        stageItem.redAlarmEvaluatorTemplateId = projectDefaultNotificationSettings.evaluatorRedNotificationId;
                                        stageItem.redAlarmManagerTemplateId = projectDefaultNotificationSettings.managerRedNotificationId;
                                        stageItem.redAlarmTrainerTemplateId = projectDefaultNotificationSettings.trainerRedNotificationId;
                                        stageItem.redAlarmProjectManagerTemplateId = projectDefaultNotificationSettings.projectManagersRedNotificationId;
                                        stageItem.redAlarmFinalScoreManagerTemplateId = projectDefaultNotificationSettings.finalScoreManagersRedNotificationId;
                                    }
                                    else {
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


                                            stageItem.finalScoreManagerStartNotificationTemplateId = globalSetting.softProfileShortGoalFinalScoreManagerStartNotificationTemplateId;
                                            stageItem.finalScoreManagerCompletedNotificationTemplateId = globalSetting.softProfileShortGoalFinalScoreManagerCompletedNotificationTemplateId;
                                            stageItem.finalScoreManagerResultsNotificationTemplateId = globalSetting.softProfileShortGoalFinalScoreManagerResultsNotificationTemplateId;

                                            stageItem.projectManagerStartNotificationTemplateId = globalSetting.softProfileShortGoalProjectManagerStartNotificationTemplateId;
                                            stageItem.projectManagerCompletedNotificationTemplateId = globalSetting.softProfileShortGoalProjectManagerCompletedNotificationTemplateId;
                                            stageItem.projectManagerResultsNotificationTemplateId = globalSetting.softProfileShortGoalProjectManagerResultsNotificationTemplateId;


                                            stageItem.greenAlarmParticipantTemplateId = globalSetting.softProfileShortGoalGreenAlarmParticipantTemplateId;
                                            stageItem.greenAlarmEvaluatorTemplateId = globalSetting.softProfileShortGoalGreenAlarmEvaluatorTemplateId;
                                            stageItem.greenAlarmManagerTemplateId = globalSetting.softProfileShortGoalGreenAlarmManagerTemplateId;
                                            stageItem.greenAlarmTrainerTemplateId = globalSetting.softProfileShortGoalGreenAlarmTrainerTemplateId;
                                            stageItem.greenAlarmProjectManagerTemplateId = globalSetting.softProfileShortGoalGreenAlarmProjectManagerTemplateId;
                                            stageItem.greenAlarmFinalScoreManagerTemplateId = globalSetting.softProfileShortGoalGreenAlarmFinalScoreManagerTemplateId;



                                            stageItem.yellowAlarmParticipantTemplateId = globalSetting.softProfileShortGoalYellowAlarmParticipantTemplateId;
                                            stageItem.yellowAlarmEvaluatorTemplateId = globalSetting.softProfileShortGoalYellowAlarmEvaluatorTemplateId;
                                            stageItem.yellowAlarmManagerTemplateId = globalSetting.softProfileShortGoalYellowAlarmManagerTemplateId;
                                            stageItem.yellowAlarmTrainerTemplateId = globalSetting.softProfileShortGoalYellowAlarmTrainerTemplateId;
                                            stageItem.yellowAlarmProjectManagerTemplateId = globalSetting.softProfileShortGoalYellowAlarmProjectManagerTemplateId;
                                            stageItem.yellowAlarmFinalScoreManagerTemplateId = globalSetting.softProfileShortGoalYellowAlarmFinalScoreManagerTemplateId;

                                            stageItem.redAlarmParticipantTemplateId = globalSetting.softProfileShortGoalRedAlarmParticipantTemplateId;
                                            stageItem.redAlarmEvaluatorTemplateId = globalSetting.softProfileShortGoalRedAlarmEvaluatorTemplateId;
                                            stageItem.redAlarmManagerTemplateId = globalSetting.softProfileShortGoalRedAlarmManagerTemplateId;
                                            stageItem.redAlarmTrainerTemplateId = globalSetting.softProfileShortGoalRedAlarmTrainerTemplateId;
                                            stageItem.redAlarmProjectManagerTemplateId = globalSetting.softProfileShortGoalRedAlarmProjectManagerTemplateId;
                                            stageItem.redAlarmFinalScoreManagerTemplateId = globalSetting.softProfileShortGoalRedAlarmFinalScoreManagerTemplateId;


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


                                            stageItem.finalScoreManagerStartNotificationTemplateId = globalSetting.softProfileMidGoalFinalScoreManagerStartNotificationTemplateId;
                                            stageItem.finalScoreManagerCompletedNotificationTemplateId = globalSetting.softProfileMidGoalFinalScoreManagerCompletedNotificationTemplateId;
                                            stageItem.finalScoreManagerResultsNotificationTemplateId = globalSetting.softProfileMidGoalFinalScoreManagerResultsNotificationTemplateId;

                                            stageItem.projectManagerStartNotificationTemplateId = globalSetting.softProfileMidGoalProjectManagerStartNotificationTemplateId;
                                            stageItem.projectManagerCompletedNotificationTemplateId = globalSetting.softProfileMidGoalProjectManagerCompletedNotificationTemplateId;
                                            stageItem.projectManagerResultsNotificationTemplateId = globalSetting.softProfileMidGoalProjectManagerResultsNotificationTemplateId;

                                            stageItem.greenAlarmParticipantTemplateId = globalSetting.softProfileMidGoalGreenAlarmParticipantTemplateId;
                                            stageItem.greenAlarmEvaluatorTemplateId = globalSetting.softProfileMidGoalGreenAlarmEvaluatorTemplateId;
                                            stageItem.greenAlarmManagerTemplateId = globalSetting.softProfileMidGoalGreenAlarmManagerTemplateId;
                                            stageItem.greenAlarmTrainerTemplateId = globalSetting.softProfileMidGoalGreenAlarmTrainerTemplateId;
                                            stageItem.greenAlarmProjectManagerTemplateId = globalSetting.softProfileMidGoalGreenAlarmProjectManagerTemplateId;
                                            stageItem.greenAlarmFinalScoreManagerTemplateId = globalSetting.softProfileMidGoalGreenAlarmFinalScoreManagerTemplateId;


                                            stageItem.yellowAlarmParticipantTemplateId = globalSetting.softProfileMidGoalYellowAlarmParticipantTemplateId;
                                            stageItem.yellowAlarmEvaluatorTemplateId = globalSetting.softProfileMidGoalYellowAlarmEvaluatorTemplateId;
                                            stageItem.yellowAlarmManagerTemplateId = globalSetting.softProfileMidGoalYellowAlarmManagerTemplateId;
                                            stageItem.yellowAlarmTrainerTemplateId = globalSetting.softProfileMidGoalYellowAlarmTrainerTemplateId;
                                            stageItem.yellowAlarmProjectManagerTemplateId = globalSetting.softProfileMidGoalYellowAlarmProjectManagerTemplateId;
                                            stageItem.yellowAlarmFinalScoreManagerTemplateId = globalSetting.softProfileMidGoalYellowAlarmFinalScoreManagerTemplateId;


                                            stageItem.redAlarmParticipantTemplateId = globalSetting.softProfileMidGoalRedAlarmParticipantTemplateId;
                                            stageItem.redAlarmEvaluatorTemplateId = globalSetting.softProfileMidGoalRedAlarmEvaluatorTemplateId;
                                            stageItem.redAlarmManagerTemplateId = globalSetting.softProfileMidGoalRedAlarmManagerTemplateId;
                                            stageItem.redAlarmTrainerTemplateId = globalSetting.softProfileMidGoalRedAlarmTrainerTemplateId;
                                            stageItem.redAlarmProjectManagerTemplateId = globalSetting.softProfileMidGoalRedAlarmProjectManagerTemplateId;
                                            stageItem.redAlarmFinalScoreManagerTemplateId = globalSetting.softProfileMidGoalRedAlarmFinalScoreManagerTemplateId;


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

                                            stageItem.finalScoreManagerStartNotificationTemplateId = globalSetting.softProfileLongTermGoalFinalScoreManagerStartNotificationTemplateId;
                                            stageItem.finalScoreManagerCompletedNotificationTemplateId = globalSetting.softProfileLongTermGoalFinalScoreManagerCompletedNotificationTemplateId;
                                            stageItem.finalScoreManagerResultsNotificationTemplateId = globalSetting.softProfileLongTermGoalFinalScoreManagerResultsNotificationTemplateId;

                                            stageItem.projectManagerStartNotificationTemplateId = globalSetting.softProfileLongTermGoalProjectManagerStartNotificationTemplateId;
                                            stageItem.projectManagerCompletedNotificationTemplateId = globalSetting.softProfileLongTermGoalProjectManagerCompletedNotificationTemplateId;
                                            stageItem.projectManagerResultsNotificationTemplateId = globalSetting.softProfileLongTermGoalProjectManagerResultsNotificationTemplateId;

                                            stageItem.greenAlarmParticipantTemplateId = globalSetting.softProfileLongTermGoalGreenAlarmParticipantTemplateId;
                                            stageItem.greenAlarmEvaluatorTemplateId = globalSetting.softProfileLongTermGoalGreenAlarmEvaluatorTemplateId;
                                            stageItem.greenAlarmManagerTemplateId = globalSetting.softProfileLongTermGoalGreenAlarmManagerTemplateId;
                                            stageItem.greenAlarmTrainerTemplateId = globalSetting.softProfileLongTermGoalGreenAlarmTrainerTemplateId;
                                            stageItem.greenAlarmProjectManagerTemplateId = globalSetting.softProfileLongTermGoalGreenAlarmProjectManagerTemplateId;
                                            stageItem.greenAlarmFinalScoreManagerTemplateId = globalSetting.softProfileLongTermGoalGreenAlarmFinalScoreManagerTemplateId;

                                            stageItem.yellowAlarmParticipantTemplateId = globalSetting.softProfileLongTermGoalYellowAlarmParticipantTemplateId;
                                            stageItem.yellowAlarmEvaluatorTemplateId = globalSetting.softProfileLongTermGoalYellowAlarmEvaluatorTemplateId;
                                            stageItem.yellowAlarmManagerTemplateId = globalSetting.softProfileLongTermGoalYellowAlarmManagerTemplateId;
                                            stageItem.yellowAlarmTrainerTemplateId = globalSetting.softProfileLongTermGoalYellowAlarmTrainerTemplateId;
                                            stageItem.yellowAlarmProjectManagerTemplateId = globalSetting.softProfileLongTermGoalYellowAlarmProjectManagerTemplateId;
                                            stageItem.yellowAlarmFinalScoreManagerTemplateId = globalSetting.softProfileLongTermGoalYellowAlarmFinalScoreManagerTemplateId;

                                            stageItem.redAlarmParticipantTemplateId = globalSetting.softProfileLongTermGoalRedAlarmParticipantTemplateId;
                                            stageItem.redAlarmEvaluatorTemplateId = globalSetting.softProfileLongTermGoalRedAlarmEvaluatorTemplateId;
                                            stageItem.redAlarmManagerTemplateId = globalSetting.softProfileLongTermGoalRedAlarmManagerTemplateId;
                                            stageItem.redAlarmTrainerTemplateId = globalSetting.softProfileLongTermGoalRedAlarmTrainerTemplateId;
                                            stageItem.redAlarmProjectManagerTemplateId = globalSetting.softProfileLongTermGoalRedAlarmProjectManagerTemplateId;
                                            stageItem.redAlarmFinalScoreManagerTemplateId = globalSetting.softProfileLongTermGoalRedAlarmFinalScoreManagerTemplateId;


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
                                            stageItem.greenAlarmProjectManagerTemplateId = globalSetting.softProfileFinalGoalGreenAlarmProjectManagerTemplateId;
                                            stageItem.greenAlarmFinalScoreManagerTemplateId = globalSetting.softProfileFinalGoalGreenAlarmFinalScoreManagerTemplateId;

                                            stageItem.finalScoreManagerStartNotificationTemplateId = globalSetting.softProfileFinalGoalFinalScoreManagerStartNotificationTemplateId;
                                            stageItem.finalScoreManagerCompletedNotificationTemplateId = globalSetting.softProfileFinalGoalFinalScoreManagerCompletedNotificationTemplateId;
                                            stageItem.finalScoreManagerResultsNotificationTemplateId = globalSetting.softProfileFinalGoalFinalScoreManagerResultsNotificationTemplateId;

                                            stageItem.projectManagerStartNotificationTemplateId = globalSetting.softProfileFinalGoalProjectManagerStartNotificationTemplateId;
                                            stageItem.projectManagerCompletedNotificationTemplateId = globalSetting.softProfileFinalGoalProjectManagerCompletedNotificationTemplateId;
                                            stageItem.projectManagerResultsNotificationTemplateId = globalSetting.softProfileFinalGoalProjectManagerResultsNotificationTemplateId;


                                            stageItem.greenAlarmParticipantTemplateId = globalSetting.softProfileFinalGoalGreenAlarmParticipantTemplateId;
                                            stageItem.greenAlarmEvaluatorTemplateId = globalSetting.softProfileFinalGoalGreenAlarmEvaluatorTemplateId;
                                            stageItem.greenAlarmManagerTemplateId = globalSetting.softProfileFinalGoalGreenAlarmManagerTemplateId;
                                            stageItem.greenAlarmTrainerTemplateId = globalSetting.softProfileFinalGoalGreenAlarmTrainerTemplateId;
                                            stageItem.yellowAlarmParticipantTemplateId = globalSetting.softProfileFinalGoalYellowAlarmParticipantTemplateId;
                                            stageItem.yellowAlarmEvaluatorTemplateId = globalSetting.softProfileFinalGoalYellowAlarmEvaluatorTemplateId;
                                            stageItem.yellowAlarmManagerTemplateId = globalSetting.softProfileFinalGoalYellowAlarmManagerTemplateId;
                                            stageItem.yellowAlarmTrainerTemplateId = globalSetting.softProfileFinalGoalYellowAlarmTrainerTemplateId;
                                            stageItem.yellowAlarmProjectManagerTemplateId = globalSetting.softProfileFinalGoalYellowAlarmProjectManagerTemplateId;
                                            stageItem.yellowAlarmFinalScoreManagerTemplateId = globalSetting.softProfileFinalGoalYellowAlarmFinalScoreManagerTemplateId;

                                            stageItem.redAlarmParticipantTemplateId = globalSetting.softProfileFinalGoalRedAlarmParticipantTemplateId;
                                            stageItem.redAlarmEvaluatorTemplateId = globalSetting.softProfileFinalGoalRedAlarmEvaluatorTemplateId;
                                            stageItem.redAlarmManagerTemplateId = globalSetting.softProfileFinalGoalRedAlarmManagerTemplateId;
                                            stageItem.redAlarmTrainerTemplateId = globalSetting.softProfileFinalGoalRedAlarmTrainerTemplateId;
                                            stageItem.redAlarmProjectManagerTemplateId = globalSetting.softProfileFinalGoalRedAlarmProjectManagerTemplateId;
                                            stageItem.redAlarmFinalScoreManagerTemplateId = globalSetting.softProfileFinalGoalRedAlarmFinalScoreManagerTemplateId;

                                        }
                                    }
                                }
                            })
                        }
                        else {

                            $scope.stageGroup.stages[0].emailNotification = true;
                            $scope.stageGroup.stages[0].smsNotification = true;
                            $scope.stageGroup.stages[0].externalStartNotificationTemplateId = $scope.setParticipantStartNotificationTemplates();
                            $scope.stageGroup.stages[0].evaluatorStartNotificationTemplateId = $scope.setEvaluatorStartNotificationTemplates();

                            $scope.stageGroup.stages[0].managerResultsNotificationTemplateId = $scope.setManagerResultNotificationTemplates();
                            $scope.stageGroup.stages[0].evaluatorResultsNotificationTemplateId = $scope.setEvaluatorResultNotificationTemplates();

                            $scope.stageGroup.stages[0].greenAlarmParticipantTemplateId = $scope.setStartStageGreenAlarmParticipantTemplates();
                            $scope.stageGroup.stages[0].greenAlarmEvaluatorTemplateId = $scope.setStartStageGreenAlarmEvaluatorTemplates();
                            $scope.stageGroup.stages[0].greenAlarmManagerTemplateId = $scope.setStartStageGreenAlarmManagerTemplates();
                            $scope.stageGroup.stages[0].greenAlarmTrainerTemplateId = $scope.setStartStageGreenAlarmTrainerTemplates();
                            $scope.stageGroup.stages[0].yellowAlarmParticipantTemplateId = $scope.setStartStageYellowAlarmParticipantTemplates();
                            $scope.stageGroup.stages[0].yellowAlarmEvaluatorTemplateId = $scope.setStartStageYellowAlarmEvaluatorTemplates();
                            $scope.stageGroup.stages[0].yellowAlarmManagerTemplateId = $scope.setStartStageYellowAlarmManagerTemplates();
                            $scope.stageGroup.stages[0].yellowAlarmTrainerTemplateId = $scope.setStartStageYellowAlarmTrainerTemplates();
                            $scope.stageGroup.stages[0].redAlarmParticipantTemplateId = $scope.setStartStageRedAlarmParticipantTemplates();
                            $scope.stageGroup.stages[0].redAlarmEvaluatorTemplateId = $scope.setStartStageRedAlarmEvaluatorTemplates();
                            $scope.stageGroup.stages[0].redAlarmManagerTemplateId = $scope.setStartStageRedAlarmManagerTemplates();
                            $scope.stageGroup.stages[0].redAlarmTrainerTemplateId = $scope.setStartStageRedAlarmTrainerTemplates();


                            $scope.stageGroup.stages[0].redAlarmTime = moment(kendo.parseDate($scope.stageGroup.stages[0].endDateTime)).add(1, 'minutes').format('L LT');
                            $scope.stageGroup.stages[0].yellowAlarmTime = moment(kendo.parseDate($scope.stageGroup.stages[0].endDateTime)).add(-180, 'minutes').format('L LT');
                            $scope.stageGroup.stages[0].greenAlarmTime = moment(kendo.parseDate($scope.stageGroup.stages[0].endDateTime)).add(-1440, 'minutes').format('L LT');

                            if ($scope.stageGroup.stages.length > 1) {
                                for (var i = 1; i < $scope.stageGroup.stages.length; i++) {
                                    $scope.stageGroup.stages[i].emailNotification = true;
                                    $scope.stageGroup.stages[i].smsNotification = true;
                                    $scope.stageGroup.stages[i].externalStartNotificationTemplateId = $scope.setParticipantMilestoneStartTemplates();
                                    $scope.stageGroup.stages[i].evaluatorStartNotificationTemplateId = $scope.setEvaluatorMilestoneStartNotificationTemplates();

                                    $scope.stageGroup.stages[i].managerResultsNotificationTemplateId = $scope.setManagerResultNotificationTemplates();
                                    $scope.stageGroup.stages[i].evaluatorResultsNotificationTemplateId = $scope.setEvaluatorResultNotificationTemplates();

                                    $scope.stageGroup.stages[i].greenAlarmParticipantTemplateId = $scope.setMilestoneGreenAlarmParticipantTemplates();
                                    $scope.stageGroup.stages[i].greenAlarmEvaluatorTemplateId = $scope.setMilestoneGreenAlarmEvaluatorTemplates();
                                    $scope.stageGroup.stages[i].greenAlarmManagerTemplateId = $scope.setMilestoneGreenAlarmManagerTemplates();
                                    $scope.stageGroup.stages[i].greenAlarmTrainerTemplateId = $scope.setMilestoneGreenAlarmTrainerTemplates();
                                    $scope.stageGroup.stages[i].yellowAlarmParticipantTemplateId = $scope.setMilestoneYellowAlarmParticipantTemplates();
                                    $scope.stageGroup.stages[i].yellowAlarmEvaluatorTemplateId = $scope.setMilestoneYellowAlarmEvaluatorTemplates();
                                    $scope.stageGroup.stages[i].yellowAlarmManagerTemplateId = $scope.setMilestoneYellowAlarmManagerTemplates();
                                    $scope.stageGroup.stages[i].yellowAlarmTrainerTemplateId = $scope.setMilestoneYellowAlarmTrainerTemplates();
                                    $scope.stageGroup.stages[i].redAlarmParticipantTemplateId = $scope.setMilestoneRedAlarmParticipantTemplates();
                                    $scope.stageGroup.stages[i].redAlarmEvaluatorTemplateId = $scope.setMilestoneRedAlarmEvaluatorTemplates();
                                    $scope.stageGroup.stages[i].redAlarmManagerTemplateId = $scope.setMilestoneRedAlarmManagerTemplates();
                                    $scope.stageGroup.stages[i].redAlarmTrainerTemplateId = $scope.setMilestoneRedAlarmTrainerTemplates();

                                    $scope.stageGroup.stages[i].redAlarmTime = moment(kendo.parseDate($scope.stageGroup.stages[i].endDateTime)).add(1, 'minutes').format('L LT');
                                    $scope.stageGroup.stages[i].yellowAlarmTime = moment(kendo.parseDate($scope.stageGroup.stages[i].endDateTime)).add(-180, 'minutes').format('L LT');
                                    $scope.stageGroup.stages[i].greenAlarmTime = moment(kendo.parseDate($scope.stageGroup.stages[i].endDateTime)).add(-1440, 'minutes').format('L LT');
                                }
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
                        },
                            function (data) {
                            });
                    })
                }
            }
            $scope.restoreDefault = function (stageGroupId) {
                dialogService.showYesNoDialog($translate.instant('COMMON_CONFIRM'), $translate.instant('MYPROJECTS_ARE_YOU_SURE_WANT_TO_RESTORE_NOTIFICATION_SETTINGS')).then(function () {
                    $scope.setDefaults(stageGroupId);
                });
            }
            $scope.goToNotificationTemplate = function (id) {
                if (id) {
                    var template = _.find(notificationTemplates, function (item) {
                        return item.id == id;
                    });
                    if (template) {
                        $location.path("/home/notificationTemplates/" + template.organizationId + "/edit/" + id);
                    }
                }
            }
            $scope.setParticipantStartNotificationTemplates = function () {
                var filterTemplate = _.find(notificationTemplates, function (item) {
                    return item.culture.cultureName == globalVariables.lang.currentUICulture && item.stageTypeId == stageTypesEnum.StartProfile && item.notificationTemplateTypeId == templateTypeEnum.MilestoneStartNotification && item.evaluationRoleId == evaluationRolesEnum.participant && item.isDefualt == true;
                });
                if (filterTemplate) {
                    return filterTemplate.id;
                }
                else {
                    var filterTemplate = _.find(notificationTemplates, function (item) {
                        return item.stageTypeId == stageTypesEnum.StartProfile && item.notificationTemplateTypeId == templateTypeEnum.MilestoneStartNotification && item.evaluationRoleId == evaluationRolesEnum.participant && item.isDefualt == true;
                    });
                    if (filterTemplate) {
                        return filterTemplate.id;
                    }
                }
            }
            $scope.setParticipantMilestoneStartTemplates = function () {
                var filterTemplate = _.find(notificationTemplates, function (item) {
                    return item.culture.cultureName == globalVariables.lang.currentUICulture && item.stageTypeId == stageTypesEnum.Milestone && item.notificationTemplateTypeId == templateTypeEnum.MilestoneStartNotification && item.evaluationRoleId == evaluationRolesEnum.participant && item.isDefualt == true;
                });
                if (filterTemplate) {
                    return filterTemplate.id;
                }
                else {
                    var filterTemplate = _.find(notificationTemplates, function (item) {
                        return item.stageTypeId == stageTypesEnum.Milestone && item.notificationTemplateTypeId == templateTypeEnum.MilestoneStartNotification && item.evaluationRoleId == evaluationRolesEnum.participant && item.isDefualt == true;
                    });
                    if (filterTemplate) {
                        return filterTemplate.id;
                    }
                }
            }
            $scope.setEvaluatorStartNotificationTemplates = function () {
                var filterTemplate = _.find(notificationTemplates, function (item) {
                    return item.culture.cultureName == globalVariables.lang.currentUICulture && item.stageTypeId == stageTypesEnum.StartProfile && item.notificationTemplateTypeId == templateTypeEnum.MilestoneStartNotification && item.evaluationRoleId == evaluationRolesEnum.evaluator && item.isDefualt == true;
                });
                if (filterTemplate) {
                    return filterTemplate.id;
                }
                else {
                    var filterTemplate = _.find(notificationTemplates, function (item) {
                        return item.stageTypeId == stageTypesEnum.StartProfile && item.notificationTemplateTypeId == templateTypeEnum.MilestoneStartNotification && item.evaluationRoleId == evaluationRolesEnum.evaluator && item.isDefualt == true;
                    });
                    if (filterTemplate) {
                        return filterTemplate.id;
                    }
                }
            }

            $scope.setManagerResultNotificationTemplates = function () {
                var filterTemplate = null;
                if ($scope.isStartStage) {
                    filterTemplate = _.find(notificationTemplates, function (item) {
                        return item.culture.cultureName == globalVariables.lang.currentUICulture && item.stageTypeId == stageTypesEnum.Milestone && item.notificationTemplateTypeId == templateTypeEnum.MilestoneResultNotification && item.evaluationRoleId == evaluationRolesEnum.manager && item.isDefualt == true;
                    });
                }
                else {
                    filterTemplate = _.find(notificationTemplates, function (item) {
                        return item.culture.cultureName == globalVariables.lang.currentUICulture && item.stageTypeId == stageTypesEnum.Milestone && item.notificationTemplateTypeId == templateTypeEnum.MilestoneResultNotification && item.evaluationRoleId == evaluationRolesEnum.manager && item.isDefualt == true;
                    });
                }
                if (filterTemplate) {
                    return filterTemplate.id;
                }
                else {
                    if ($scope.isStartStage) {
                        filterTemplate = _.find(notificationTemplates, function (item) {
                            return item.stageTypeId == stageTypesEnum.StartProfile && item.notificationTemplateTypeId == templateTypeEnum.MilestoneResultNotification && item.evaluationRoleId == evaluationRolesEnum.manager && item.isDefualt == true;
                        });
                    }
                    else {
                        filterTemplate = _.find(notificationTemplates, function (item) {
                            return item.stageTypeId == stageTypesEnum.Milestone && item.notificationTemplateTypeId == templateTypeEnum.MilestoneResultNotification && item.evaluationRoleId == evaluationRolesEnum.manager && item.isDefualt == true;
                        });
                    }
                    if (filterTemplate) {
                        return filterTemplate.id;
                    }
                    else {
                        return null;
                    }
                }
            }
            $scope.setEvaluatorResultNotificationTemplates = function () {
                var filterTemplate = null;
                if ($scope.isStartStage) {
                    filterTemplate = _.find(notificationTemplates, function (item) {
                        return item.culture.cultureName == globalVariables.lang.currentUICulture && item.stageTypeId == stageTypesEnum.StartProfile && item.notificationTemplateTypeId == templateTypeEnum.MilestoneResultNotification && item.evaluationRoleId == evaluationRolesEnum.evaluator && item.isDefualt == true;
                    });
                }
                else {
                    filterTemplate = _.find(notificationTemplates, function (item) {
                        return item.culture.cultureName == globalVariables.lang.currentUICulture && item.stageTypeId == stageTypesEnum.Milestone && item.notificationTemplateTypeId == templateTypeEnum.MilestoneResultNotification && item.evaluationRoleId == evaluationRolesEnum.evaluator && item.isDefualt == true;
                    });
                }
                if (filterTemplate) {
                    return filterTemplate.id;
                }
                else {
                    if ($scope.isStartStage) {
                        filterTemplate = _.find(notificationTemplates, function (item) {
                            return item.stageTypeId == stageTypesEnum.StartProfile && item.notificationTemplateTypeId == templateTypeEnum.MilestoneResultNotification && item.evaluationRoleId == evaluationRolesEnum.evaluator && item.isDefualt == true;
                        });
                    }
                    else {
                        filterTemplate = _.find(notificationTemplates, function (item) {
                            return item.stageTypeId == stageTypesEnum.Milestone && item.notificationTemplateTypeId == templateTypeEnum.MilestoneResultNotification && item.evaluationRoleId == evaluationRolesEnum.evaluator && item.isDefualt == true;
                        });
                    }
                    if (filterTemplate) {
                        return filterTemplate.id;
                    }
                    else {
                        return null;
                    }
                }
            }


            $scope.setEvaluatorMilestoneStartNotificationTemplates = function () {
                var filterTemplate = _.find(notificationTemplates, function (item) {
                    return item.culture.cultureName == globalVariables.lang.currentUICulture && item.stageTypeId == stageTypesEnum.Milestone && item.notificationTemplateTypeId == templateTypeEnum.MilestoneStartNotification && item.evaluationRoleId == evaluationRolesEnum.evaluator && item.isDefualt == true;
                });
                if (filterTemplate) {
                    return filterTemplate.id;
                }
                else {
                    var filterTemplate = _.find(notificationTemplates, function (item) {
                        return item.stageTypeId == stageTypesEnum.Milestone && item.notificationTemplateTypeId == templateTypeEnum.MilestoneStartNotification && item.evaluationRoleId == evaluationRolesEnum.evaluator && item.isDefualt == true;
                    });
                    if (filterTemplate) {
                        return filterTemplate.id;
                    }
                }
            }

            $scope.setStartStageGreenAlarmParticipantTemplates = function () {
                var filterTemplate = _.find(notificationTemplates, function (item) {
                    return item.culture.cultureName == globalVariables.lang.currentUICulture && item.stageTypeId == stageTypesEnum.StartProfile && item.notificationTemplateTypeId == templateTypeEnum.GreenMilestoneAlarm && item.evaluationRoleId == evaluationRolesEnum.participant && item.isDefualt == true;
                });
                if (filterTemplate) {
                    return filterTemplate.id;
                }
                else {
                    var filterTemplate = _.find(notificationTemplates, function (item) {
                        return item.stageTypeId == stageTypesEnum.StartProfile && item.notificationTemplateTypeId == templateTypeEnum.GreenMilestoneAlarm && item.evaluationRoleId == evaluationRolesEnum.participant && item.isDefualt == true;
                    });
                    if (filterTemplate) {
                        return filterTemplate.id;
                    }
                }
            }
            $scope.setStartStageGreenAlarmEvaluatorTemplates = function () {
                var filterTemplate = _.find(notificationTemplates, function (item) {
                    return item.culture.cultureName == globalVariables.lang.currentUICulture && item.stageTypeId == stageTypesEnum.StartProfile && item.notificationTemplateTypeId == templateTypeEnum.GreenMilestoneAlarm && item.evaluationRoleId == evaluationRolesEnum.evaluator && item.isDefualt == true;
                });
                if (filterTemplate) {
                    return filterTemplate.id;
                }
                else {
                    var filterTemplate = _.find(notificationTemplates, function (item) {
                        return item.stageTypeId == stageTypesEnum.StartProfile && item.notificationTemplateTypeId == templateTypeEnum.GreenMilestoneAlarm && item.evaluationRoleId == evaluationRolesEnum.evaluator && item.isDefualt == true;
                    });
                    if (filterTemplate) {
                        return filterTemplate.id;
                    }
                }
            }
            $scope.setStartStageGreenAlarmManagerTemplates = function () {
                var filterTemplate = _.find(notificationTemplates, function (item) {
                    return item.culture.cultureName == globalVariables.lang.currentUICulture && item.stageTypeId == stageTypesEnum.StartProfile && item.notificationTemplateTypeId == templateTypeEnum.GreenMilestoneAlarm && item.evaluationRoleId == evaluationRolesEnum.manager && item.isDefualt == true;
                });
                if (filterTemplate) {
                    return filterTemplate.id;
                }
                else {
                    var filterTemplate = _.find(notificationTemplates, function (item) {
                        return item.stageTypeId == stageTypesEnum.StartProfile && item.notificationTemplateTypeId == templateTypeEnum.GreenMilestoneAlarm && item.evaluationRoleId == evaluationRolesEnum.manager && item.isDefualt == true;
                    });
                    if (filterTemplate) {
                        return filterTemplate.id;
                    }
                }
            }
            $scope.setStartStageGreenAlarmTrainerTemplates = function () {
                var filterTemplate = _.find(notificationTemplates, function (item) {
                    return item.culture.cultureName == globalVariables.lang.currentUICulture && item.stageTypeId == stageTypesEnum.StartProfile && item.notificationTemplateTypeId == templateTypeEnum.GreenMilestoneAlarm && item.evaluationRoleId == evaluationRolesEnum.trainer && item.isDefualt == true;
                });
                if (filterTemplate) {
                    return filterTemplate.id;
                }
                else {
                    var filterTemplate = _.find(notificationTemplates, function (item) {
                        return item.stageTypeId == stageTypesEnum.StartProfile && item.notificationTemplateTypeId == templateTypeEnum.GreenMilestoneAlarm && item.evaluationRoleId == evaluationRolesEnum.trainer && item.isDefualt == true;
                    });
                    if (filterTemplate) {
                        return filterTemplate.id;
                    }
                }
            }
            $scope.setMilestoneGreenAlarmParticipantTemplates = function () {
                var filterTemplate = _.find(notificationTemplates, function (item) {
                    return item.culture.cultureName == globalVariables.lang.currentUICulture && item.stageTypeId == stageTypesEnum.Milestone && item.notificationTemplateTypeId == templateTypeEnum.GreenMilestoneAlarm && item.evaluationRoleId == evaluationRolesEnum.participant && item.isDefualt == true;
                });
                if (filterTemplate) {
                    return filterTemplate.id;
                }
                else {
                    var filterTemplate = _.find(notificationTemplates, function (item) {
                        return item.stageTypeId == stageTypesEnum.Milestone && item.notificationTemplateTypeId == templateTypeEnum.GreenMilestoneAlarm && item.evaluationRoleId == evaluationRolesEnum.participant && item.isDefualt == true;
                    });
                    if (filterTemplate) {
                        return filterTemplate.id;
                    }
                }
            }
            $scope.setMilestoneGreenAlarmEvaluatorTemplates = function () {
                var filterTemplate = _.find(notificationTemplates, function (item) {
                    return item.culture.cultureName == globalVariables.lang.currentUICulture && item.stageTypeId == stageTypesEnum.Milestone && item.notificationTemplateTypeId == templateTypeEnum.GreenMilestoneAlarm && item.evaluationRoleId == evaluationRolesEnum.evaluator && item.isDefualt == true;
                });
                if (filterTemplate) {
                    return filterTemplate.id;
                }
                else {
                    var filterTemplate = _.find(notificationTemplates, function (item) {
                        return item.stageTypeId == stageTypesEnum.Milestone && item.notificationTemplateTypeId == templateTypeEnum.GreenMilestoneAlarm && item.evaluationRoleId == evaluationRolesEnum.evaluator && item.isDefualt == true;
                    });
                    if (filterTemplate) {
                        return filterTemplate.id;
                    }
                }
            }
            $scope.setMilestoneGreenAlarmManagerTemplates = function () {
                var filterTemplate = _.find(notificationTemplates, function (item) {
                    return item.culture.cultureName == globalVariables.lang.currentUICulture && item.stageTypeId == stageTypesEnum.Milestone && item.notificationTemplateTypeId == templateTypeEnum.GreenMilestoneAlarm && item.evaluationRoleId == evaluationRolesEnum.manager && item.isDefualt == true;
                });
                if (filterTemplate) {
                    return filterTemplate.id;
                }
                else {
                    var filterTemplate = _.find(notificationTemplates, function (item) {
                        return item.stageTypeId == stageTypesEnum.Milestone && item.notificationTemplateTypeId == templateTypeEnum.GreenMilestoneAlarm && item.evaluationRoleId == evaluationRolesEnum.manager && item.isDefualt == true;
                    });
                    if (filterTemplate) {
                        return filterTemplate.id;
                    }
                }
            }
            $scope.setMilestoneGreenAlarmTrainerTemplates = function () {
                var filterTemplate = _.find(notificationTemplates, function (item) {
                    return item.culture.cultureName == globalVariables.lang.currentUICulture && item.stageTypeId == stageTypesEnum.Milestone && item.notificationTemplateTypeId == templateTypeEnum.GreenMilestoneAlarm && item.evaluationRoleId == evaluationRolesEnum.trainer && item.isDefualt == true;
                });
                if (filterTemplate) {
                    return filterTemplate.id;
                }
                else {
                    var filterTemplate = _.find(notificationTemplates, function (item) {
                        return item.stageTypeId == stageTypesEnum.Milestone && item.notificationTemplateTypeId == templateTypeEnum.GreenMilestoneAlarm && item.evaluationRoleId == evaluationRolesEnum.trainer && item.isDefualt == true;
                    });
                    if (filterTemplate) {
                        return filterTemplate.id;
                    }
                }
            }

            $scope.setStartStageYellowAlarmParticipantTemplates = function () {
                var filterTemplate = _.find(notificationTemplates, function (item) {
                    return item.culture.cultureName == globalVariables.lang.currentUICulture && item.stageTypeId == stageTypesEnum.StartProfile && item.notificationTemplateTypeId == templateTypeEnum.YellowMilestoneAlarm && item.evaluationRoleId == evaluationRolesEnum.participant && item.isDefualt == true;
                });
                if (filterTemplate) {
                    return filterTemplate.id;
                }
                else {
                    var filterTemplate = _.find(notificationTemplates, function (item) {
                        return item.stageTypeId == stageTypesEnum.StartProfile && item.notificationTemplateTypeId == templateTypeEnum.YellowMilestoneAlarm && item.evaluationRoleId == evaluationRolesEnum.participant && item.isDefualt == true;
                    });
                    if (filterTemplate) {
                        return filterTemplate.id;
                    }
                }
            }
            $scope.setStartStageYellowAlarmEvaluatorTemplates = function () {
                var filterTemplate = _.find(notificationTemplates, function (item) {
                    return item.culture.cultureName == globalVariables.lang.currentUICulture && item.stageTypeId == stageTypesEnum.StartProfile && item.notificationTemplateTypeId == templateTypeEnum.YellowMilestoneAlarm && item.evaluationRoleId == evaluationRolesEnum.evaluator && item.isDefualt == true;
                });
                if (filterTemplate) {
                    return filterTemplate.id;
                }
                else {
                    var filterTemplate = _.find(notificationTemplates, function (item) {
                        return item.stageTypeId == stageTypesEnum.StartProfile && item.notificationTemplateTypeId == templateTypeEnum.YellowMilestoneAlarm && item.evaluationRoleId == evaluationRolesEnum.evaluator && item.isDefualt == true;
                    });
                    if (filterTemplate) {
                        return filterTemplate.id;
                    }
                }
            }
            $scope.setStartStageYellowAlarmManagerTemplates = function () {
                var filterTemplate = _.find(notificationTemplates, function (item) {
                    return item.culture.cultureName == globalVariables.lang.currentUICulture && item.stageTypeId == stageTypesEnum.StartProfile && item.notificationTemplateTypeId == templateTypeEnum.YellowMilestoneAlarm && item.evaluationRoleId == evaluationRolesEnum.manager && item.isDefualt == true;
                });
                if (filterTemplate) {
                    return filterTemplate.id;
                }
                else {
                    var filterTemplate = _.find(notificationTemplates, function (item) {
                        return item.stageTypeId == stageTypesEnum.StartProfile && item.notificationTemplateTypeId == templateTypeEnum.YellowMilestoneAlarm && item.evaluationRoleId == evaluationRolesEnum.manager && item.isDefualt == true;
                    });
                    if (filterTemplate) {
                        return filterTemplate.id;
                    }
                }
            }
            $scope.setStartStageYellowAlarmTrainerTemplates = function () {
                var filterTemplate = _.find(notificationTemplates, function (item) {
                    return item.culture.cultureName == globalVariables.lang.currentUICulture && item.stageTypeId == stageTypesEnum.StartProfile && item.notificationTemplateTypeId == templateTypeEnum.YellowMilestoneAlarm && item.evaluationRoleId == evaluationRolesEnum.trainer && item.isDefualt == true;
                });
                if (filterTemplate) {
                    return filterTemplate.id;
                }
                else {
                    var filterTemplate = _.find(notificationTemplates, function (item) {
                        return item.stageTypeId == stageTypesEnum.StartProfile && item.notificationTemplateTypeId == templateTypeEnum.YellowMilestoneAlarm && item.evaluationRoleId == evaluationRolesEnum.trainer && item.isDefualt == true;
                    });
                    if (filterTemplate) {
                        return filterTemplate.id;
                    }
                }
            }
            $scope.setMilestoneYellowAlarmParticipantTemplates = function () {
                var filterTemplate = _.find(notificationTemplates, function (item) {
                    return item.culture.cultureName == globalVariables.lang.currentUICulture && item.stageTypeId == stageTypesEnum.Milestone && item.notificationTemplateTypeId == templateTypeEnum.YellowMilestoneAlarm && item.evaluationRoleId == evaluationRolesEnum.participant && item.isDefualt == true;
                });
                if (filterTemplate) {
                    return filterTemplate.id;
                }
                else {
                    var filterTemplate = _.find(notificationTemplates, function (item) {
                        return item.stageTypeId == stageTypesEnum.Milestone && item.notificationTemplateTypeId == templateTypeEnum.YellowMilestoneAlarm && item.evaluationRoleId == evaluationRolesEnum.participant && item.isDefualt == true;
                    });
                    if (filterTemplate) {
                        return filterTemplate.id;
                    }
                }
            }
            $scope.setMilestoneYellowAlarmEvaluatorTemplates = function () {
                var filterTemplate = _.find(notificationTemplates, function (item) {
                    return item.culture.cultureName == globalVariables.lang.currentUICulture && item.stageTypeId == stageTypesEnum.Milestone && item.notificationTemplateTypeId == templateTypeEnum.YellowMilestoneAlarm && item.evaluationRoleId == evaluationRolesEnum.evaluator && item.isDefualt == true;
                });
                if (filterTemplate) {
                    return filterTemplate.id;
                }
                else {
                    var filterTemplate = _.find(notificationTemplates, function (item) {
                        return item.stageTypeId == stageTypesEnum.Milestone && item.notificationTemplateTypeId == templateTypeEnum.YellowMilestoneAlarm && item.evaluationRoleId == evaluationRolesEnum.evaluator && item.isDefualt == true;
                    });
                    if (filterTemplate) {
                        return filterTemplate.id;
                    }
                }
            }
            $scope.setMilestoneYellowAlarmManagerTemplates = function () {
                var filterTemplate = _.find(notificationTemplates, function (item) {
                    return item.culture.cultureName == globalVariables.lang.currentUICulture && item.stageTypeId == stageTypesEnum.Milestone && item.notificationTemplateTypeId == templateTypeEnum.YellowMilestoneAlarm && item.evaluationRoleId == evaluationRolesEnum.manager && item.isDefualt == true;
                });
                if (filterTemplate) {
                    return filterTemplate.id;
                }
                else {
                    var filterTemplate = _.find(notificationTemplates, function (item) {
                        return item.stageTypeId == stageTypesEnum.Milestone && item.notificationTemplateTypeId == templateTypeEnum.YellowMilestoneAlarm && item.evaluationRoleId == evaluationRolesEnum.manager && item.isDefualt == true;
                    });
                    if (filterTemplate) {
                        return filterTemplate.id;
                    }
                }
            }
            $scope.setMilestoneYellowAlarmTrainerTemplates = function () {
                var filterTemplate = _.find(notificationTemplates, function (item) {
                    return item.culture.cultureName == globalVariables.lang.currentUICulture && item.stageTypeId == stageTypesEnum.Milestone && item.notificationTemplateTypeId == templateTypeEnum.YellowMilestoneAlarm && item.evaluationRoleId == evaluationRolesEnum.trainer && item.isDefualt == true;
                });
                if (filterTemplate) {
                    return filterTemplate.id;
                }
                else {
                    var filterTemplate = _.find(notificationTemplates, function (item) {
                        return item.stageTypeId == stageTypesEnum.Milestone && item.notificationTemplateTypeId == templateTypeEnum.YellowMilestoneAlarm && item.evaluationRoleId == evaluationRolesEnum.trainer && item.isDefualt == true;
                    });
                    if (filterTemplate) {
                        return filterTemplate.id;
                    }
                }
            }

            $scope.setStartStageRedAlarmParticipantTemplates = function () {
                var filterTemplate = _.find(notificationTemplates, function (item) {
                    return item.culture.cultureName == globalVariables.lang.currentUICulture && item.stageTypeId == stageTypesEnum.StartProfile && item.notificationTemplateTypeId == templateTypeEnum.RedMilestoneAlarm && item.evaluationRoleId == evaluationRolesEnum.participant && item.isDefualt == true;
                });
                if (filterTemplate) {
                    return filterTemplate.id;
                }
                else {
                    var filterTemplate = _.find(notificationTemplates, function (item) {
                        return item.stageTypeId == stageTypesEnum.StartProfile && item.notificationTemplateTypeId == templateTypeEnum.RedMilestoneAlarm && item.evaluationRoleId == evaluationRolesEnum.participant && item.isDefualt == true;
                    });
                    if (filterTemplate) {
                        return filterTemplate.id;
                    }
                }
            }
            $scope.setStartStageRedAlarmEvaluatorTemplates = function () {
                var filterTemplate = _.find(notificationTemplates, function (item) {
                    return item.culture.cultureName == globalVariables.lang.currentUICulture && item.stageTypeId == stageTypesEnum.StartProfile && item.notificationTemplateTypeId == templateTypeEnum.RedMilestoneAlarm && item.evaluationRoleId == evaluationRolesEnum.evaluator && item.isDefualt == true;
                });
                if (filterTemplate) {
                    return filterTemplate.id;
                }
                else {
                    var filterTemplate = _.find(notificationTemplates, function (item) {
                        return item.stageTypeId == stageTypesEnum.StartProfile && item.notificationTemplateTypeId == templateTypeEnum.RedMilestoneAlarm && item.evaluationRoleId == evaluationRolesEnum.evaluator && item.isDefualt == true;
                    });
                    if (filterTemplate) {
                        return filterTemplate.id;
                    }
                }
            }
            $scope.setStartStageRedAlarmManagerTemplates = function () {
                var filterTemplate = _.find(notificationTemplates, function (item) {
                    return item.culture.cultureName == globalVariables.lang.currentUICulture && item.stageTypeId == stageTypesEnum.StartProfile && item.notificationTemplateTypeId == templateTypeEnum.RedMilestoneAlarm && item.evaluationRoleId == evaluationRolesEnum.manager && item.isDefualt == true;
                });
                if (filterTemplate) {
                    return filterTemplate.id;
                }
                else {
                    var filterTemplate = _.find(notificationTemplates, function (item) {
                        return item.stageTypeId == stageTypesEnum.StartProfile && item.notificationTemplateTypeId == templateTypeEnum.RedMilestoneAlarm && item.evaluationRoleId == evaluationRolesEnum.manager && item.isDefualt == true;
                    });
                    if (filterTemplate) {
                        return filterTemplate.id;
                    }
                }
            }
            $scope.setStartStageRedAlarmTrainerTemplates = function () {
                var filterTemplate = _.find(notificationTemplates, function (item) {
                    return item.culture.cultureName == globalVariables.lang.currentUICulture && item.stageTypeId == stageTypesEnum.StartProfile && item.notificationTemplateTypeId == templateTypeEnum.RedMilestoneAlarm && item.evaluationRoleId == evaluationRolesEnum.trainer && item.isDefualt == true;
                });
                if (filterTemplate) {
                    return filterTemplate.id;
                }
                else {
                    var filterTemplate = _.find(notificationTemplates, function (item) {
                        return item.stageTypeId == stageTypesEnum.StartProfile && item.notificationTemplateTypeId == templateTypeEnum.RedMilestoneAlarm && item.evaluationRoleId == evaluationRolesEnum.trainer && item.isDefualt == true;
                    });
                    if (filterTemplate) {
                        return filterTemplate.id;
                    }
                }
            }
            $scope.setMilestoneRedAlarmParticipantTemplates = function () {
                var filterTemplate = _.find(notificationTemplates, function (item) {
                    return item.culture.cultureName == globalVariables.lang.currentUICulture && item.stageTypeId == stageTypesEnum.Milestone && item.notificationTemplateTypeId == templateTypeEnum.RedMilestoneAlarm && item.evaluationRoleId == evaluationRolesEnum.participant && item.isDefualt == true;
                });
                if (filterTemplate) {
                    return filterTemplate.id;
                }
                else {
                    var filterTemplate = _.find(notificationTemplates, function (item) {
                        return item.stageTypeId == stageTypesEnum.Milestone && item.notificationTemplateTypeId == templateTypeEnum.RedMilestoneAlarm && item.evaluationRoleId == evaluationRolesEnum.participant && item.isDefualt == true;
                    });
                    if (filterTemplate) {
                        return filterTemplate.id;
                    }
                }
            }
            $scope.setMilestoneRedAlarmEvaluatorTemplates = function () {
                var filterTemplate = _.find(notificationTemplates, function (item) {
                    return item.culture.cultureName == globalVariables.lang.currentUICulture && item.stageTypeId == stageTypesEnum.Milestone && item.notificationTemplateTypeId == templateTypeEnum.RedMilestoneAlarm && item.evaluationRoleId == evaluationRolesEnum.evaluator && item.isDefualt == true;
                });
                if (filterTemplate) {
                    return filterTemplate.id;
                }
                else {
                    var filterTemplate = _.find(notificationTemplates, function (item) {
                        return item.stageTypeId == stageTypesEnum.Milestone && item.notificationTemplateTypeId == templateTypeEnum.RedMilestoneAlarm && item.evaluationRoleId == evaluationRolesEnum.evaluator && item.isDefualt == true;
                    });
                    if (filterTemplate) {
                        return filterTemplate.id;
                    }
                }
            }
            $scope.setMilestoneRedAlarmManagerTemplates = function () {
                var filterTemplate = _.find(notificationTemplates, function (item) {
                    return item.culture.cultureName == globalVariables.lang.currentUICulture && item.stageTypeId == stageTypesEnum.Milestone && item.notificationTemplateTypeId == templateTypeEnum.RedMilestoneAlarm && item.evaluationRoleId == evaluationRolesEnum.manager && item.isDefualt == true;
                });
                if (filterTemplate) {
                    return filterTemplate.id;
                }
                else {
                    var filterTemplate = _.find(notificationTemplates, function (item) {
                        return item.stageTypeId == stageTypesEnum.Milestone && item.notificationTemplateTypeId == templateTypeEnum.RedMilestoneAlarm && item.evaluationRoleId == evaluationRolesEnum.manager && item.isDefualt == true;
                    });
                    if (filterTemplate) {
                        return filterTemplate.id;
                    }
                }
            }
            $scope.setMilestoneRedAlarmTrainerTemplates = function () {
                var filterTemplate = _.find(notificationTemplates, function (item) {
                    return item.culture.cultureName == globalVariables.lang.currentUICulture && item.stageTypeId == stageTypesEnum.Milestone && item.notificationTemplateTypeId == templateTypeEnum.RedMilestoneAlarm && item.evaluationRoleId == evaluationRolesEnum.trainer && item.isDefualt == true;
                });
                if (filterTemplate) {
                    return filterTemplate.id;
                }
                else {
                    var filterTemplate = _.find(notificationTemplates, function (item) {
                        return item.stageTypeId == stageTypesEnum.Milestone && item.notificationTemplateTypeId == templateTypeEnum.RedMilestoneAlarm && item.evaluationRoleId == evaluationRolesEnum.trainer && item.isDefualt == true;
                    });
                    if (filterTemplate) {
                        return filterTemplate.id;
                    }
                }
            }

            $scope.gotoParticipants = function () {
                if (($scope.profileId > 0) && ($scope.profile.stageGroups.length > 0)) {
                    $location.path("/home/knowledge/" + $scope.profileId + "/participants");

                }
                else {
                    $("#bootstrap-wizard-1 li").removeClass("active");
                    $("#bootstrap-wizard-1 li[data-tabDiv='milestones']").addClass("active");

                    dialogService.showNotification($translate.instant("MYPROJECTS_PROJECTPROFILES_PLEASE_ADD_SEND_OUT_IN_SENDOUT_SETTING_SETUP"), "error");
                }
            }
            $scope.gotoStatus = function () {
                if (($scope.profileId > 0) && ($scope.profile.stageGroups.length > 0)) {
                    $location.path("/home/knowledge/" + $scope.profileId + "/status");

                }
                else {
                    $("#bootstrap-wizard-1 li").removeClass("active");
                    $("#bootstrap-wizard-1 li[data-tabDiv='milestones']").addClass("active");

                    dialogService.showNotification($translate.instant("MYPROJECTS_PROJECTPROFILES_PLEASE_ADD_SEND_OUT_IN_SENDOUT_SETTING_SETUP"), "error");
                }
            }
            $scope.gotoHistory = function () {
                if (($scope.profileId > 0) && ($scope.profile.stageGroups.length > 0)) {
                    $location.path("/home/knowledge/" + $scope.profileId + "/history");

                }
                else {
                    dialogService.showNotification($translate.instant("MYPROJECTS_PROJECTPROFILES_PLEASE_ADD_SEND_OUT_IN_SENDOUT_SETTING_SETUP"), "error");
                }
            }

        }])
    .controller('KnowledgeProfileParticipantsCtrl', ['$scope', 'localStorageService', 'authService', 'apiService', 'dialogService', 'cssInjector', '$stateParams', 'profile', 'profileTypeEnum', 'projectInfo', 'notificationTemplates', 'organizations', 'profilesService', 'stageGroupManager', '$translate', 'globalVariables', 'templateTypeEnum', 'stageTypesEnum', 'evaluationRolesEnum', '$location',
        function ($scope, localStorageService, authService, apiService, dialogService, cssInjector, $stateParams, profile, profileTypeEnum, projectInfo, notificationTemplates, organizations, profilesService, stageGroupManager, $translate, globalVariables, templateTypeEnum, stageTypesEnum, evaluationRolesEnum, $location) {
            cssInjector.add('views/profiles/new-soft-profile.css');
            var authData = localStorageService.get('authorizationData');
            $scope.currentUser = authData.user;
            $scope.authService = authService;
            $scope.profileId = $stateParams.profileId;
            $scope.profileUrlModifier = 'knowledge';
            $scope.profile = null;
            $scope.projectInfo = projectInfo;
            $scope.profileTypeEnum = profileTypeEnum;
            $scope.notificationTemplates = notificationTemplates;
            $scope.organizations = organizations;
            $scope.statusOfStages = [];
            $scope.fpStatusOfStages = [];
            if (profile != null) {
                $scope.profile = profile;
                $scope.profileType = profile.profileTypeId;

                if ($scope.profile.scaleId > 0) {
                    profilesService.getScaleById($scope.profile.scaleId).then(function (scaledata) {
                        $scope.scale = scaledata;
                        $scope.profile.scale = scaledata;
                    }, function () { });
                    //$scope.scaleUpdate($scope.profile.scaleId)
                }

                _.each($scope.profile.stageGroups, function (sgItem) {
                    $scope.selectedStageGroup = sgItem;
                    $scope.stage = sgItem.stages[0];
                    $scope.isStartStage = true;
                    stageGroupManager.getParticipants(sgItem.id).then(function (data) {
                        _.each(data, function (participantItem) {
                            if ($scope.projectInfo.projectSteeringGroups.length > 0) {
                                _.each($scope.projectInfo.projectSteeringGroups, function (steeringGroup) {
                                    _.each(steeringGroup.users, function (userItem) {
                                        if (userItem.userId == participantItem.userId && participantItem.stageGroupId == sgItem.id && userItem.roleName == "Participant") {
                                            participantItem["userImage"] = userItem.userImage;
                                            participantItem["stageGroupId"] = sgItem.id;
                                            participantItem["email"] = userItem.email;

                                            $scope.participants.push(participantItem);
                                        }
                                    });
                                });
                            }
                            else {
                                participantItem["userImage"] = participantItem.user.imagePath;
                                participantItem["stageGroupId"] = sgItem.id;
                                participantItem["email"] = participantItem.user.workEmail;
                                $scope.participants.push(participantItem);
                            }
                        });
                    });
                    stageGroupManager.getEvaluators(sgItem.id).then(function (data) {
                        _.each(data, function (evaluatorItem) {
                            if (evaluatorItem.isScoreManager) {
                                if ($scope.projectInfo.projectSteeringGroups.length > 0) {
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
                                }
                                else {
                                    evaluatorItem["userImage"] = evaluatorItem.user.imagePath;
                                    evaluatorItem["email"] = evaluatorItem.user.workEmail;
                                    evaluatorItem["stageGroupId"] = sgItem.id;
                                    var participant = _.filter($scope.participants, function (participantItem) {
                                        return participantItem.participantId == evaluatorItem.evaluateeId
                                    });
                                    if (participant.length > 0) {
                                        evaluatorItem["participant"] = participant[0];
                                    }
                                    $scope.finalScoreManagers.push(evaluatorItem);
                                }
                                //evaluatorItem["participantId"] = data;
                                //evaluatorItem["evaluateeId"] = evaluator.evaluateeId;
                            }
                            else {
                                if ($scope.projectInfo.projectSteeringGroups.length > 0) {
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
                                else {
                                    evaluatorItem["userImage"] = evaluatorItem.user.imagePath;
                                    evaluatorItem["stageGroupId"] = sgItem.id;
                                    evaluatorItem["email"] = evaluatorItem.user.workEmail;
                                    var participant = _.filter($scope.participants, function (participantItem) {
                                        return participantItem.participantId == evaluatorItem.evaluateeId
                                    });
                                    if (participant.length > 0) {
                                        evaluatorItem["participant"] = participant[0];
                                    }
                                    $scope.evaluators.push(evaluatorItem);
                                    //$scope.finalScoreManagers.push(evaluatorItem);
                                }
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



            }
            $scope.openNewSendOutModal = function () {

                $scope.stageGroup = {
                    id: 0,
                    name: null,
                    description: null,
                    startDate: null,
                    endDate: null,
                    parentStageGroupId: null,
                    parentParticipantId: null,
                    monthsSpan: 0,
                    weeksSpan: 6,
                    daysSpan: 0,
                    hoursSpan: 0,
                    minutesSpan: 0,
                    actualTimeSpan: 0,
                    totalMilestones: 5,
                    stages: [],
                    startStageStartDate: null,
                    startStageEndDate: null,
                    milestoneStartDate: null,
                    milestoneEndDate: null,
                }




                var globalSetting = null;
                if ($scope.projectInfo) {
                    $scope.stageGroup.name = $scope.projectInfo.name;
                    $scope.stageGroup.startDate = moment(kendo.parseDate($scope.projectInfo.expectedStartDate)).format('L LT');
                    $scope.stageGroup.endDate = moment(kendo.parseDate($scope.projectInfo.expectedEndDate)).format('L LT');
                    $scope.stageGroup.startStageStartDate = moment(kendo.parseDate($scope.projectInfo.expectedStartDate)).format('L LT');
                    $scope.stageGroup.startStageEndDate = moment(kendo.parseDate($scope.projectInfo.expectedStartDate)).add("days", 7).format('L LT');
                    $scope.stageGroup.milestoneStartDate = moment(kendo.parseDate($scope.projectInfo.expectedStartDate)).add("days", 7).format('L LT');
                    $scope.stageGroup.milestoneEndDate = moment(kendo.parseDate($scope.projectInfo.expectedEndDate)).format('L LT');
                    if ($scope.projectInfo.projectGlobalSettings.length > 0) {
                        globalSetting = $scope.projectInfo.projectGlobalSettings[0];
                    }
                }

                if ($scope.profile.profileTypeId == profileTypeEnum.Soft || $scope.profile.profileTypeId == profileTypeEnum.Hard) {
                    var diffTime = null;
                    var a = moment(kendo.parseDate($scope.stageGroup.milestoneEndDate));
                    var b = moment(kendo.parseDate($scope.stageGroup.milestoneStartDate));
                    diffTime = a.diff(b);
                    if ($scope.profile.profileTypeId == profileTypeEnum.Soft || $scope.profile.profileTypeId == profileTypeEnum.Hard) {
                        var duration = moment.duration(diffTime);
                        $scope.sendOutMilestoneDiffrence = {
                            months: duration.months(),
                            weeks: duration.weeks(),
                            days: duration.days(),
                            hours: duration.hours(),
                            minutes: duration.minutes(),
                        }
                        if (duration.years() > 0) {
                            $scope.sendOutMilestoneDiffrence.months = $scope.sendOutMilestoneDiffrence.months + (duration.years() * 12);
                        }
                        if ($scope.stageGroup.totalMilestones > 0) {
                            diffTime = a.diff(b) / $scope.stageGroup.totalMilestones; // 1
                        }
                        else {
                            diffTime = a.diff(b) / 5; // 1
                        }
                    }
                    duration = moment.duration(diffTime);
                    $scope.stageGroup.actualTimeSpan = diffTime,
                        $scope.stageGroup.monthsSpan = duration.months();
                    $scope.stageGroup.weeksSpan = duration.weeks();
                    $scope.stageGroup.daysSpan = duration.days();
                    if ($scope.stageGroup.weeksSpan > 0) {
                        $scope.stageGroup.daysSpan = $scope.stageGroup.daysSpan - ($scope.stageGroup.weeksSpan * 7);
                    }
                    $scope.stageGroup.hoursSpan = duration.hours();
                    $scope.stageGroup.minutesSpan = duration.minutes();
                }
                if (globalSetting) {
                    if ($scope.profile.profileTypeId == profileTypeEnum.Soft || $scope.profile.profileTypeId == profileTypeEnum.Hard) {

                    }
                    else {
                        $scope.stageGroup.actualTimeSpan = globalSetting.knowledgeProfileActualTimeSpan,
                            $scope.stageGroup.monthsSpan = globalSetting.knowledgeProfileMonthSpan;
                        $scope.stageGroup.weeksSpan = globalSetting.knowledgeProfileWeekSpan;
                        $scope.stageGroup.daysSpan = globalSetting.knowledgeProfileDaySpan;
                        $scope.stageGroup.hoursSpan = globalSetting.knowledgeProfileHourSpan;
                        $scope.stageGroup.minutesSpan = globalSetting.knowledgeProfileMinuteSpan;
                    }
                }
                else {
                    if ($scope.projectInfo) {
                        var diffTime = null;
                        var a = moment(kendo.parseDate($scope.projectInfo.expectedEndDate));
                        var b = moment(kendo.parseDate($scope.projectInfo.expectedStartDate));
                        diffTime = a.diff(b);
                        if ($scope.profile.profileTypeId == profileTypeEnum.Soft || $scope.profile.profileTypeId == profileTypeEnum.Hard) {
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
                            if ($scope.stageGroup.totalMilestones > 0) {
                                diffTime = a.diff(b) / $scope.stageGroup.totalMilestones; // 1
                            }
                            else {
                                diffTime = a.diff(b) / 5; // 1
                            }
                        }
                        duration = moment.duration(diffTime);
                        $scope.stageGroup.actualTimeSpan = diffTime,
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
                    actualTimeSpan: 0,
                    totalMilestones: 5,
                    stages: [],
                    startStageStartDate: moment(kendo.parseDate($scope.projectInfo.expectedStartDate)).format('L LT'),
                    startStageEndDate: moment(kendo.parseDate($scope.projectInfo.expectedStartDate)).add("days", 7).format('L LT'),
                    milestoneStartDate: moment(kendo.parseDate($scope.projectInfo.expectedStartDate)).add("days", 7).format('L LT'),
                    milestoneEndDate: moment(kendo.parseDate($scope.projectInfo.expectedEndDate)).format('L LT'),
                }
                var stageGroup = _.find($scope.profile.stageGroups, function (stageGroupItem) {
                    return stageGroupItem.id == stageGroupId;
                });
                if (stageGroup) {
                    $scope.stageGroup = angular.copy(stageGroup);

                    $scope.numberOfMilestoneChange();
                }
                $("#stageGroupModal").modal("show");

            }
            $scope.removeSendOut = function (stageGroupId) {

                stageGroupManager.isStageGroupInUse(stageGroupId).then(
                    function (data) {
                        if (data == true) {
                            dialogService.showNotification($translate.instant('MYPROJECTS_STAGE_GROUP_CANNOT_BE_REMOVED') + ' ' + $translate.instant('MYPROJECTS_THIS_STAGE_GROUP_IS_ALREADY_IN_USE'), 'warning');
                        } else {
                            dialogService.showYesNoDialog($translate.instant('COMMON_CONFIRM'), $translate.instant('COMMON_ARE_YOU_SURE_YOU_WANT_TO_DELETE')).then(
                                function () {
                                    stageGroupManager.removeStageGroup(stageGroupId).then(
                                        function (data) {
                                            var index = _.findIndex($scope.profile.stageGroups, function (stageGroupItem) {
                                                return stageGroupItem.id == stageGroupId;
                                            });
                                            if (index > -1) {
                                                $scope.profile.stageGroups.splice(index, 1);
                                                dialogService.showNotification($translate.instant('MYPROJECTS_SEND_OUT_REMOVED_SUCCESSFULLY'), "success");
                                            }
                                        },
                                        function (data) {
                                            console.log(data);
                                        }
                                    );
                                },
                                function () {
                                }
                            );
                        }
                    }
                );
            }
            $scope.StageGroupStartDateOpen = function (event) {
                var datepicker = $(event.sender.element).data("kendoDateTimePicker");
                datepicker.setOptions({
                    min: kendo.parseDate($scope.projectInfo.expectedStartDate)
                });
            };
            $scope.StageGroupStartDateChange = function (event) {
                if (!(kendo.parseDate($scope.stageGroup.startDate) > kendo.parseDate($scope.stageGroup.endDate))) {
                    $scope.stageGroup.endDate = "";
                }
                else {
                    var diffTime = null;
                    var a = moment(kendo.parseDate($scope.stageGroup.endDate));
                    var b = moment(kendo.parseDate($scope.stageGroup.startDate));
                    diffTime = a.diff(b);
                    if ($scope.profile.profileTypeId == profileTypeEnum.Soft || $scope.profile.profileTypeId == profileTypeEnum.Hard) {
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
                        if ($scope.stageGroup.totalMilestones > 0) {
                            diffTime = a.diff(b) / $scope.stageGroup.totalMilestones; // 1
                        }
                        else {
                            diffTime = a.diff(b) / 5; // 1
                        }
                    }

                    if ($scope.stageGroup.startStageStartDate == null) {
                        duration = moment.duration(diffTime);
                        $scope.stageGroup.actualTimeSpan = diffTime,
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
            };
            $scope.StageGroupEndDateOpen = function (event) {
                var datepicker = $(event.sender.element).data("kendoDateTimePicker")
                if ($scope.projectInfo.id > 0) {
                    datepicker.setOptions({
                        min: kendo.parseDate($scope.projectInfo.expectedStartDate),
                        max: kendo.parseDate($scope.projectInfo.expectedEndDate)
                    });
                }
                else {
                    datepicker.setOptions({
                        min: kendo.parseDate($scope.projectInfo.expectedStartDate),
                    });
                }
            };
            $scope.StageGroupEndDateChange = function (event) {
                var diffTime = null;
                var a = moment(kendo.parseDate(event.sender.value()));
                var b = moment(kendo.parseDate($scope.stageGroup.startDate));
                diffTime = a.diff(b);
                if ($scope.profile.profileTypeId == profileTypeEnum.Soft || $scope.profile.profileTypeId == profileTypeEnum.Hard) {
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
                    if ($scope.stageGroup.totalMilestones > 0) {
                        diffTime = a.diff(b) / $scope.stageGroup.totalMilestones; // 1
                    }
                    else {
                        diffTime = a.diff(b) / 5; // 1
                    }
                }

                if ($scope.stageGroup.startStageStartDate != null) {
                    duration = moment.duration(diffTime);
                    $scope.stageGroup.actualTimeSpan = diffTime;
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


            $scope.StageGroupStartStageStartDateOpen = function (event) {
                var datepicker = $(event.sender.element).data("kendoDateTimePicker");
                datepicker.setOptions({
                    min: kendo.parseDate($scope.projectInfo.expectedStartDate),
                    max: kendo.parseDate($scope.projectInfo.expectedEndDate)
                });
            }
            $scope.StageGroupStartStageStartDateChange = function (event) {

                if ((kendo.parseDate($scope.stageGroup.startStageStartDate) > kendo.parseDate($scope.stageGroup.startStageEndDate))) {
                    $scope.stageGroup.startStageEndDate = null;
                }
            };

            $scope.StageGroupStartStageEndDateOpen = function (event) {
                var datepicker = $(event.sender.element).data("kendoDateTimePicker")
                datepicker.setOptions({
                    min: kendo.parseDate($scope.stageGroup.startStageStartDate),
                    max: kendo.parseDate($scope.projectInfo.expectedEndDate)
                });
            };
            $scope.StageGroupStartStageEndDateChange = function (event) {
                $scope.stageGroup.milestoneStartDate = moment(kendo.parseDate(event.sender.value())).format('L LT');
            };


            $scope.StageGroupMilestoneStartDateOpen = function (event) {
                var datepicker = $(event.sender.element).data("kendoDateTimePicker");
                datepicker.setOptions({
                    min: kendo.parseDate($scope.stageGroup.startStageEndDate),
                    max: kendo.parseDate($scope.projectInfo.expectedEndDate)
                });
            }
            $scope.StageGroupMilestoneStartDateChange = function (event) {
                if ((kendo.parseDate(event.sender.value()) > kendo.parseDate($scope.stageGroup.milestoneEndDate))) {
                    $scope.stageGroup.milestoneEndDate = "";
                }
                else {
                    var diffTime = null;
                    var a = moment(kendo.parseDate($scope.stageGroup.milestoneEndDate));
                    var b = moment(kendo.parseDate(event.sender.value()));
                    diffTime = a.diff(b);
                    if ($scope.profile.profileTypeId == profileTypeEnum.Soft || $scope.profile.profileTypeId == profileTypeEnum.Hard) {
                        var duration = moment.duration(diffTime);
                        $scope.sendOutMilestoneDiffrence = {
                            months: duration.months(),
                            weeks: duration.weeks(),
                            days: duration.days(),
                            hours: duration.hours(),
                            minutes: duration.minutes(),
                        }
                        if (duration.years() > 0) {
                            $scope.sendOutMilestoneDiffrence.months = $scope.sendOutMilestoneDiffrence.months + (duration.years() * 12);
                        }
                        if ($scope.stageGroup.totalMilestones > 0) {
                            diffTime = a.diff(b) / $scope.stageGroup.totalMilestones; // 1
                        }
                        else {
                            diffTime = a.diff(b) / 5; // 1
                        }
                    }
                    duration = moment.duration(diffTime);
                    $scope.stageGroup.actualTimeSpan = diffTime,
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


            $scope.StageGroupMilestoneEndDateOpen = function (event) {
                var datepicker = $(event.sender.element).data("kendoDateTimePicker")
                datepicker.setOptions({
                    min: kendo.parseDate($scope.stageGroup.milestoneStartDate),
                    max: kendo.parseDate($scope.projectInfo.expectedEndDate)
                });
            };
            $scope.StageGroupMilestoneEndDateChange = function (event) {
                var diffTime = null;
                var a = moment(kendo.parseDate(event.sender.value()));
                var b = moment(kendo.parseDate($scope.stageGroup.milestoneStartDate));
                diffTime = a.diff(b);
                if ($scope.profile.profileTypeId == profileTypeEnum.Soft || $scope.profile.profileTypeId == profileTypeEnum.Hard) {
                    var duration = moment.duration(diffTime);
                    $scope.sendOutMilestoneDiffrence = {
                        months: duration.months(),
                        weeks: duration.weeks(),
                        days: duration.days(),
                        hours: duration.hours(),
                        minutes: duration.minutes(),
                    }
                    if (duration.weeks() > 0) {
                        $scope.sendOutMilestoneDiffrence.days = duration.days() - (duration.weeks() * 7);
                    }
                    if (duration.years() > 0) {
                        $scope.sendOutMilestoneDiffrence.months = $scope.sendOutMilestoneDiffrence.months + (duration.years() * 12);
                    }
                    if ($scope.stageGroup.totalMilestones > 0) {
                        diffTime = a.diff(b) / $scope.stageGroup.totalMilestones; // 1
                    }
                    else {
                        diffTime = a.diff(b) / 5; // 1
                    }
                }
                duration = moment.duration(diffTime);
                $scope.stageGroup.actualTimeSpan = diffTime,
                    $scope.stageGroup.monthsSpan = duration.months();
                $scope.stageGroup.weeksSpan = duration.weeks();
                $scope.stageGroup.daysSpan = duration.days();
                if ($scope.stageGroup.weeksSpan > 0) {
                    $scope.stageGroup.daysSpan = $scope.stageGroup.daysSpan - ($scope.stageGroup.weeksSpan * 7);
                }
                if (duration.years() > 0) {
                    $scope.sendOutMilestoneDiffrence.months = $scope.sendOutMilestoneDiffrence.months + (duration.years() * 12);
                }
                $scope.stageGroup.hoursSpan = duration.hours();
                $scope.stageGroup.minutesSpan = duration.minutes();
            };
            $scope.numberOfMilestoneChange = function () {
                var diffTime = null;
                if ($scope.stageGroup.milestoneStartDate && $scope.stageGroup.milestoneEndDate) {
                    var a = moment(kendo.parseDate($scope.stageGroup.milestoneEndDate));
                    var b = moment(kendo.parseDate($scope.stageGroup.milestoneStartDate));
                    diffTime = a.diff(b);
                    if ($scope.profile.profileTypeId == profileTypeEnum.Soft || $scope.profile.profileTypeId == profileTypeEnum.Hard) {
                        var duration = moment.duration(diffTime);
                        $scope.sendOutMilestoneDiffrence = {
                            months: duration.months(),
                            weeks: duration.weeks(),
                            days: duration.days(),
                            hours: duration.hours(),
                            minutes: duration.minutes(),
                        }
                        if (duration.years() > 0) {
                            $scope.sendOutMilestoneDiffrence.months = $scope.sendOutMilestoneDiffrence.months + (duration.years() * 12);
                        }
                        if ($scope.stageGroup.totalMilestones > 0) {
                            diffTime = a.diff(b) / $scope.stageGroup.totalMilestones; // 1
                        }
                        else {
                            diffTime = a.diff(b) / 5; // 1
                        }
                    }
                    duration = moment.duration(diffTime);
                    $scope.stageGroup.actualTimeSpan = diffTime,
                        $scope.stageGroup.monthsSpan = duration.months();
                    $scope.stageGroup.weeksSpan = duration.weeks();
                    $scope.stageGroup.daysSpan = duration.days();
                    if ($scope.stageGroup.weeksSpan > 0) {
                        $scope.stageGroup.daysSpan = $scope.stageGroup.daysSpan - ($scope.stageGroup.weeksSpan * 7);
                    }

                    $scope.stageGroup.hoursSpan = duration.hours();
                    $scope.stageGroup.minutesSpan = duration.minutes();
                }
                else {
                    var a = moment(kendo.parseDate($scope.stageGroup.endDate));
                    var b = moment(kendo.parseDate($scope.stageGroup.startDate));
                    diffTime = a.diff(b);
                    if ($scope.profile.profileTypeId == profileTypeEnum.Soft || $scope.profile.profileTypeId == profileTypeEnum.Hard) {
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
                        if ($scope.stageGroup.totalMilestones > 0) {
                            diffTime = a.diff(b) / $scope.stageGroup.totalMilestones; // 1
                        }
                        else {
                            diffTime = a.diff(b) / 5; // 1
                        }
                    }
                    duration = moment.duration(diffTime);
                    $scope.stageGroup.actualTimeSpan = diffTime,
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

            $scope.addNewStageGroup = function () {
                if ($scope.formStageGroup.$valid) {
                    if ($scope.stageGroup.id == 0) {
                        $scope.stageGroup.id = ($scope.profile.stageGroups.length + 1) * -1;
                        var profile = angular.copy($scope.profile);
                        profile.stageGroups = [];
                        $scope.isStartStage = true;
                        $scope.stageGroup["profiles"] = [profile];

                        var stageGroupCopy = _.clone($scope.stageGroup);
                        stageGroupCopy.startDate = kendo.parseDate(stageGroupCopy.startDate);
                        stageGroupCopy.endDate = kendo.parseDate(stageGroupCopy.endDate);
                        stageGroupCopy.startStageStartDate = kendo.parseDate(stageGroupCopy.startStageStartDate);
                        stageGroupCopy.startStageEndDate = kendo.parseDate(stageGroupCopy.startStageEndDate);
                        stageGroupCopy.milestoneStartDate = kendo.parseDate(stageGroupCopy.milestoneStartDate);
                        stageGroupCopy.milestoneEndDate = kendo.parseDate(stageGroupCopy.milestoneEndDate);
                        apiService.add('stageGroups', stageGroupCopy).then(function (data) {
                            if (data > 0) {
                                $scope.stageGroup.id = data;


                                dialogService.showNotification($translate.instant('MYPROJECTS_PROJECTPROFILES_SEND_OUT_SETTING_ADDED_SUCCESSFULLY'), "success");

                                var globalSetting = null;
                                if ($scope.projectInfo.projectGlobalSettings.length > 0) {
                                    globalSetting = $scope.projectInfo.projectGlobalSettings[0]
                                }
                                apiService.getAll("stagegroups/" + $scope.stageGroup.id + "/allstages").then(function (stagesdata) {
                                    $scope.stageGroup["userRecurrentNotificationSettings"] = [];
                                    _.each(stagesdata, function (stageItem, index) {
                                        stageItem.startDateTime = moment(kendo.parseDate(stageItem.startDateTime)).format("L LT");
                                        stageItem.endDateTime = moment(kendo.parseDate(stageItem.endDateTime)).format("L LT");
                                        stageItem.evaluationStartDate = moment(kendo.parseDate(stageItem.evaluationStartDate)).format("L LT");
                                        stageItem.evaluationEndDate = moment(kendo.parseDate(stageItem.evaluationEndDate)).format("L LT");
                                        var recurrentNotificationSettings = {
                                            id: 0,
                                            stageGroupId: $scope.stageGroup.id,
                                            stageId: stageItem.id,
                                            userId: 0,
                                            emailNotification: true,
                                            smsNotification: false,
                                            greenAlarmParticipantTemplateId: null,
                                            greenAlarmEvaluatorTemplateId: null,
                                            greenAlarmManagerTemplateId: null,
                                            greenAlarmTrainerTemplateId: null,
                                            greenAlarmProjectManagerTemplateId: null,
                                            greenAlarmFinalScoreManagerTemplateId: null,
                                            greenAlarmTime: null,
                                            yellowAlarmParticipantTemplateId: null,
                                            yellowAlarmEvaluatorTemplateId: null,
                                            yellowAlarmManagerTemplateId: null,
                                            yellowAlarmTrainerTemplateId: null,
                                            yellowAlarmProjectManagerTemplateId: null,
                                            yellowAlarmFinalScoreManagerTemplateId: null,
                                            yellowAlarmTime: null,
                                            redAlarmParticipantTemplateId: null,
                                            redAlarmEvaluatorTemplateId: null,
                                            redAlarmManagerTemplateId: null,
                                            redAlarmTrainerTemplateId: null,
                                            redAlarmProjectManagerTemplateId: null,
                                            redAlarmFinalScoreManagerTemplateId: null,
                                            redAlarmTime: null,
                                            externalStartNotificationTemplateId: null,
                                            externalCompletedNotificationTemplateId: null,
                                            externalResultsNotificationTemplateId: null,
                                            evaluatorStartNotificationTemplateId: null,
                                            evaluatorCompletedNotificationTemplateId: null,
                                            evaluatorResultsNotificationTemplateId: null,
                                            trainerStartNotificationTemplateId: null,
                                            trainerCompletedNotificationTemplateId: null,
                                            trainerResultsNotificationTemplateId: null,
                                            managerStartNotificationTemplateId: null,
                                            managerCompletedNotificationTemplateId: null,
                                            managerResultsNotificationTemplateId: null,
                                            finalScoreManagerStartNotificationTemplateId: null,
                                            finalScoreManagerCompletedNotificationTemplateId: null,
                                            finalScoreManagerResultsNotificationTemplateId: null,
                                            projectManagerStartNotificationTemplateId: null,
                                            projectManagerCompletedNotificationTemplateId: null,
                                            projectManagerResultsNotificationTemplateId: null,
                                            howMany: null,
                                            metricId: null,
                                            howManySet: null,
                                            howManyActions: null,
                                        }
                                        var externalStartNotificationTemplate = _.filter(notificationTemplates, function (item) {
                                            return item.notificationTemplateTypeId == templateTypeEnum.RecurrentTrainingNotification && item.evaluationRoleId == evaluationRolesEnum.participant && item.isDefualt == true;
                                        });
                                        if (externalStartNotificationTemplate.length > 0) {
                                            recurrentNotificationSettings.externalStartNotificationTemplateId = externalStartNotificationTemplate[0].id;
                                        }
                                        var evaluatorStartNotificationTemplate = _.filter(notificationTemplates, function (item) {
                                            return item.notificationTemplateTypeId == templateTypeEnum.RecurrentTrainingNotification && item.evaluationRoleId == evaluationRolesEnum.evaluator && item.isDefualt == true;
                                        });
                                        if (evaluatorStartNotificationTemplate.length > 0) {
                                            recurrentNotificationSettings.evaluatorStartNotificationTemplateId = evaluatorStartNotificationTemplate[0].id;
                                            recurrentNotificationSettings.finalScoreManagerStartNotificationTemplateId = evaluatorStartNotificationTemplate[0].id;
                                        }
                                        var managerStartNotificationTemplate = _.filter(notificationTemplates, function (item) {
                                            return item.notificationTemplateTypeId == templateTypeEnum.RecurrentTrainingNotification && item.evaluationRoleId == evaluationRolesEnum.manager && item.isDefualt == true;
                                        });
                                        if (managerStartNotificationTemplate.length > 0) {
                                            recurrentNotificationSettings.managerStartNotificationTemplateId = managerStartNotificationTemplate[0].id;
                                            recurrentNotificationSettings.projectManagerStartNotificationTemplateId = managerStartNotificationTemplate[0].id;
                                        }
                                        var trainerStartNotificationTemplate = _.filter(notificationTemplates, function (item) {
                                            return item.notificationTemplateTypeId == templateTypeEnum.RecurrentTrainingNotification && item.evaluationRoleId == evaluationRolesEnum.trainer && item.isDefualt == true;
                                        });
                                        if (trainerStartNotificationTemplate.length > 0) {
                                            recurrentNotificationSettings.trainerStartNotificationTemplateId = trainerStartNotificationTemplate[0].id;
                                        }

                                        var globalSetting = null;
                                        if ($scope.projectInfo.projectGlobalSettings.length > 0) {
                                            globalSetting = $scope.projectInfo.projectGlobalSettings[0];
                                            recurrentNotificationSettings.howMany = globalSetting.softProfileHowMany;
                                            recurrentNotificationSettings.howManyActions = globalSetting.softProfileHowManyActions;
                                            recurrentNotificationSettings.howManySet = globalSetting.softProfileHowManySets;
                                            recurrentNotificationSettings.metricId = globalSetting.softProfileMetricId;
                                            recurrentNotificationSettings.recurrentTrainningFrequency = globalSetting.softProfileRecurrentTrainingTimeSpan;
                                            recurrentNotificationSettings.emailNotification = globalSetting.softProfileStartEmailNotification;
                                            recurrentNotificationSettings.sMSNotification = globalSetting.softProfileStartSmsNotification;

                                        }

                                        $scope.stageGroup.userRecurrentNotificationSettings.push(recurrentNotificationSettings);


                                        if ($scope.profile.profileTypeId == profileTypeEnum.Knowledge) {
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

                                                stageItem.finalScoreManagerStartNotificationTemplateId = globalSetting.knowledgeProfileFinalScoreManagerStartNotificationTemplateId;
                                                stageItem.finalScoreManagerCompletedNotificationTemplateId = globalSetting.knowledgeProfileFinalScoreManagerCompletedNotificationTemplateId;
                                                stageItem.finalScoreManagerResultsNotificationTemplateId = globalSetting.knowledgeProfileFinalScoreManagerResultsNotificationTemplateId;

                                                stageItem.projectManagerStartNotificationTemplateId = globalSetting.knowledgeProfileProjectManagerStartNotificationTemplateId;
                                                stageItem.projectManagerCompletedNotificationTemplateId = globalSetting.knowledgeProfileProjectManagerCompletedNotificationTemplateId;
                                                stageItem.projectManagerResultsNotificationTemplateId = globalSetting.knowledgeProfileProjectManagerResultsNotificationTemplateId;

                                            }
                                            else {
                                                stageItem.startDateTime = moment(kendo.parseDate(stageItem.startDateTime)).format('L LT')
                                                stageItem.endDateTime = moment(kendo.parseDate(stageItem.endDateTime)).format('L LT')
                                                stageItem.greenAlarmTime = moment(kendo.parseDate(stageItem.greenAlarmTime)).format('L LT')
                                                stageItem.yellowAlarmTime = moment(kendo.parseDate(stageItem.yellowAlarmTime)).format('L LT')
                                                stageItem.redAlarmTime = moment(kendo.parseDate(stageItem.redAlarmTime)).format('L LT')

                                            }
                                        }
                                        else if ($scope.profile.profileTypeId == profileTypeEnum.Soft || $scope.profile.profileTypeId == profileTypeEnum.Hard) {
                                            var globalSetting = null;
                                            if ($scope.projectInfo.projectGlobalSettings.length > 0) {
                                                globalSetting = $scope.projectInfo.projectGlobalSettings[0]
                                            }
                                            if (globalSetting) {
                                                stageItem.managerId = globalSetting.managerId;
                                                stageItem.trainerId = globalSetting.trainerId;
                                                stageItem.evaluationStartDate = moment(kendo.parseDate(stageItem.evaluationStartDate)).format('L LT')
                                                stageItem.evaluationEndDate = moment(kendo.parseDate(stageItem.evaluationEndDate)).format('L LT')
                                                if (index == 0) {
                                                    stageItem.emailNotification = globalSetting.softProfileStartEmailNotification;
                                                    stageItem.smsNotification = globalSetting.softProfileStartSmsNotification;

                                                    stageItem.startDateTime = moment(kendo.parseDate(stageItem.startDateTime)).format('L LT')
                                                    stageItem.endDateTime = moment(kendo.parseDate(stageItem.endDateTime)).format('L LT')
                                                    stageItem.greenAlarmTime = moment(kendo.parseDate(stageItem.greenAlarmTime)).format('L LT')
                                                    stageItem.yellowAlarmTime = moment(kendo.parseDate(stageItem.yellowAlarmTime)).format('L LT')
                                                    stageItem.redAlarmTime = moment(kendo.parseDate(stageItem.redAlarmTime)).format('L LT')


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

                                                    stageItem.finalScoreManagerStartNotificationTemplateId = globalSetting.softProfileStartFinalScoreManagerStartNotificationTemplateId;
                                                    stageItem.finalScoreManagerCompletedNotificationTemplateId = globalSetting.softProfileStartFinalScoreManagerCompletedNotificationTemplateId;
                                                    stageItem.finalScoreManagerResultsNotificationTemplateId = globalSetting.softProfileStartFinalScoreManagerResultsNotificationTemplateId;

                                                    stageItem.projectManagerStartNotificationTemplateId = globalSetting.softProfileStartProjectManagerStartNotificationTemplateId;
                                                    stageItem.projectManagerCompletedNotificationTemplateId = globalSetting.softProfileStartProjectManagerCompletedNotificationTemplateId;
                                                    stageItem.projectManagerResultsNotificationTemplateId = globalSetting.softProfileStartProjectManagerResultsNotificationTemplateId;


                                                    stageItem.greenAlarmParticipantTemplateId = globalSetting.softProfileStartGreenAlarmParticipantTemplateId;
                                                    stageItem.greenAlarmEvaluatorTemplateId = globalSetting.softProfileStartGreenAlarmEvaluatorTemplateId;
                                                    stageItem.greenAlarmManagerTemplateId = globalSetting.softProfileStartGreenAlarmManagerTemplateId;
                                                    stageItem.greenAlarmTrainerTemplateId = globalSetting.softProfileStartGreenAlarmTrainerTemplateId;
                                                    stageItem.greenAlarmProjectManagerTemplateId = globalSetting.softProfileStartGreenAlarmProjectManagerTemplateId;
                                                    stageItem.greenAlarmFinalScoreManagerTemplateId = globalSetting.softProfileStartGreenAlarmFinalScoreManagerTemplateId;

                                                    stageItem.yellowAlarmParticipantTemplateId = globalSetting.softProfileStartYellowAlarmParticipantTemplateId;
                                                    stageItem.yellowAlarmEvaluatorTemplateId = globalSetting.softProfileStartYellowAlarmEvaluatorTemplateId;
                                                    stageItem.yellowAlarmManagerTemplateId = globalSetting.softProfileStartYellowAlarmManagerTemplateId;
                                                    stageItem.yellowAlarmTrainerTemplateId = globalSetting.softProfileStartYellowAlarmTrainerTemplateId;
                                                    stageItem.yellowAlarmProjectManagerTemplateId = globalSetting.softProfileStartYellowAlarmProjectManagerTemplateId;
                                                    stageItem.yellowAlarmFinalScoreManagerTemplateId = globalSetting.softProfileStartYellowAlarmFinalScoreManagerTemplateId;

                                                    stageItem.redAlarmParticipantTemplateId = globalSetting.softProfileStartRedAlarmParticipantTemplateId;
                                                    stageItem.redAlarmEvaluatorTemplateId = globalSetting.softProfileStartRedAlarmEvaluatorTemplateId;
                                                    stageItem.redAlarmManagerTemplateId = globalSetting.softProfileStartRedAlarmManagerTemplateId;
                                                    stageItem.redAlarmTrainerTemplateId = globalSetting.softProfileStartRedAlarmTrainerTemplateId;
                                                    stageItem.redAlarmProjectManagerTemplateId = globalSetting.softProfileStartRedAlarmProjectManagerTemplateId;
                                                    stageItem.redAlarmFinalScoreManagerTemplateId = globalSetting.softProfileStartRedAlarmFinalScoreManagerTemplateId;


                                                }
                                                else {
                                                    if ($scope.projectInfo.projectDefaultNotificationSettings.length > 0) {

                                                        var projectDefaultNotificationSettings = $scope.projectInfo.projectDefaultNotificationSettings[0];

                                                        stageItem.emailNotification = projectDefaultNotificationSettings.emailNotification;
                                                        stageItem.smsNotification = projectDefaultNotificationSettings.smsNotification;

                                                        stageItem.startDateTime = moment(kendo.parseDate(stageItem.startDateTime)).format('L LT')
                                                        stageItem.endDateTime = moment(kendo.parseDate(stageItem.endDateTime)).format('L LT')
                                                        stageItem.greenAlarmTime = moment(kendo.parseDate(stageItem.greenAlarmTime)).format('L LT')
                                                        stageItem.yellowAlarmTime = moment(kendo.parseDate(stageItem.yellowAlarmTime)).format('L LT')
                                                        stageItem.redAlarmTime = moment(kendo.parseDate(stageItem.redAlarmTime)).format('L LT')

                                                        stageItem.externalStartNotificationTemplateId = projectDefaultNotificationSettings.participantsStartNotificationId;
                                                        stageItem.externalCompletedNotificationTemplateId = projectDefaultNotificationSettings.participantsCompletedNotificationId;
                                                        stageItem.externalResultsNotificationTemplateId = projectDefaultNotificationSettings.participantsResultNotificationId;
                                                        stageItem.evaluatorStartNotificationTemplateId = projectDefaultNotificationSettings.evaluatorsStartNotificationId;
                                                        stageItem.evaluatorCompletedNotificationTemplateId = projectDefaultNotificationSettings.evaluatorsCompletedNotificationId;
                                                        stageItem.evaluatorResultsNotificationTemplateId = projectDefaultNotificationSettings.evaluatorsResultNotificationId;
                                                        stageItem.trainerStartNotificationTemplateId = projectDefaultNotificationSettings.trainersStartNotificationId;
                                                        stageItem.trainerCompletedNotificationTemplateId = projectDefaultNotificationSettings.trainersCompletedNotificationId;
                                                        stageItem.trainerResultsNotificationTemplateId = projectDefaultNotificationSettings.trainersResultNotificationId;
                                                        stageItem.managerStartNotificationTemplateId = projectDefaultNotificationSettings.managersStartNotificationId;
                                                        stageItem.managerCompletedNotificationTemplateId = projectDefaultNotificationSettings.managersCompletedNotificationId;
                                                        stageItem.managerResultsNotificationTemplateId = projectDefaultNotificationSettings.managersResultNotificationId;


                                                        stageItem.finalScoreManagerStartNotificationTemplateId = projectDefaultNotificationSettings.finalScoreManagersStartNotificationId;
                                                        stageItem.finalScoreManagerCompletedNotificationTemplateId = projectDefaultNotificationSettings.finalScoreManagersCompletedNotificationId;
                                                        stageItem.finalScoreManagerResultsNotificationTemplateId = projectDefaultNotificationSettings.finalScoreManagersResultNotificationId;

                                                        stageItem.projectManagerStartNotificationTemplateId = projectDefaultNotificationSettings.projectManagersStartNotificationId;
                                                        stageItem.projectManagerCompletedNotificationTemplateId = projectDefaultNotificationSettings.projectManagersCompletedNotificationId;
                                                        stageItem.projectManagerResultsNotificationTemplateId = projectDefaultNotificationSettings.projectManagersResultNotificationId;


                                                        stageItem.greenAlarmParticipantTemplateId = projectDefaultNotificationSettings.participantGreenNotificationId;
                                                        stageItem.greenAlarmEvaluatorTemplateId = projectDefaultNotificationSettings.evaluatorGreenNotificationId;
                                                        stageItem.greenAlarmManagerTemplateId = projectDefaultNotificationSettings.managerGreenNotificationId;
                                                        stageItem.greenAlarmTrainerTemplateId = projectDefaultNotificationSettings.trainerGreenNotificationId;
                                                        stageItem.greenAlarmProjectManagerTemplateId = projectDefaultNotificationSettings.projectManagersGreenNotificationId;
                                                        stageItem.greenAlarmFinalScoreManagerTemplateId = projectDefaultNotificationSettings.finalScoreManagersGreenNotificationId;



                                                        stageItem.yellowAlarmParticipantTemplateId = projectDefaultNotificationSettings.participantYellowNotificationId;
                                                        stageItem.yellowAlarmEvaluatorTemplateId = projectDefaultNotificationSettings.evaluatorYellowNotificationId;
                                                        stageItem.yellowAlarmManagerTemplateId = projectDefaultNotificationSettings.managerYellowNotificationId;
                                                        stageItem.yellowAlarmTrainerTemplateId = projectDefaultNotificationSettings.trainerYellowNotificationId;
                                                        stageItem.yellowAlarmProjectManagerTemplateId = projectDefaultNotificationSettings.projectManagersYellowNotificationId;
                                                        stageItem.yellowAlarmFinalScoreManagerTemplateId = projectDefaultNotificationSettings.finalScoreManagersYellowNotificationId;

                                                        stageItem.redAlarmParticipantTemplateId = projectDefaultNotificationSettings.participantRedNotificationId;
                                                        stageItem.redAlarmEvaluatorTemplateId = projectDefaultNotificationSettings.evaluatorRedNotificationId;
                                                        stageItem.redAlarmManagerTemplateId = projectDefaultNotificationSettings.managerRedNotificationId;
                                                        stageItem.redAlarmTrainerTemplateId = projectDefaultNotificationSettings.trainerRedNotificationId;
                                                        stageItem.redAlarmProjectManagerTemplateId = projectDefaultNotificationSettings.projectManagersRedNotificationId;
                                                        stageItem.redAlarmFinalScoreManagerTemplateId = projectDefaultNotificationSettings.finalScoreManagersRedNotificationId;
                                                    }
                                                    else {
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


                                                            stageItem.finalScoreManagerStartNotificationTemplateId = globalSetting.softProfileShortGoalFinalScoreManagerStartNotificationTemplateId;
                                                            stageItem.finalScoreManagerCompletedNotificationTemplateId = globalSetting.softProfileShortGoalFinalScoreManagerCompletedNotificationTemplateId;
                                                            stageItem.finalScoreManagerResultsNotificationTemplateId = globalSetting.softProfileShortGoalFinalScoreManagerResultsNotificationTemplateId;

                                                            stageItem.projectManagerStartNotificationTemplateId = globalSetting.softProfileShortGoalProjectManagerStartNotificationTemplateId;
                                                            stageItem.projectManagerCompletedNotificationTemplateId = globalSetting.softProfileShortGoalProjectManagerCompletedNotificationTemplateId;
                                                            stageItem.projectManagerResultsNotificationTemplateId = globalSetting.softProfileShortGoalProjectManagerResultsNotificationTemplateId;


                                                            stageItem.greenAlarmParticipantTemplateId = globalSetting.softProfileShortGoalGreenAlarmParticipantTemplateId;
                                                            stageItem.greenAlarmEvaluatorTemplateId = globalSetting.softProfileShortGoalGreenAlarmEvaluatorTemplateId;
                                                            stageItem.greenAlarmManagerTemplateId = globalSetting.softProfileShortGoalGreenAlarmManagerTemplateId;
                                                            stageItem.greenAlarmTrainerTemplateId = globalSetting.softProfileShortGoalGreenAlarmTrainerTemplateId;
                                                            stageItem.greenAlarmProjectManagerTemplateId = globalSetting.softProfileShortGoalGreenAlarmProjectManagerTemplateId;
                                                            stageItem.greenAlarmFinalScoreManagerTemplateId = globalSetting.softProfileShortGoalGreenAlarmFinalScoreManagerTemplateId;



                                                            stageItem.yellowAlarmParticipantTemplateId = globalSetting.softProfileShortGoalYellowAlarmParticipantTemplateId;
                                                            stageItem.yellowAlarmEvaluatorTemplateId = globalSetting.softProfileShortGoalYellowAlarmEvaluatorTemplateId;
                                                            stageItem.yellowAlarmManagerTemplateId = globalSetting.softProfileShortGoalYellowAlarmManagerTemplateId;
                                                            stageItem.yellowAlarmTrainerTemplateId = globalSetting.softProfileShortGoalYellowAlarmTrainerTemplateId;
                                                            stageItem.yellowAlarmProjectManagerTemplateId = globalSetting.softProfileShortGoalYellowAlarmProjectManagerTemplateId;
                                                            stageItem.yellowAlarmFinalScoreManagerTemplateId = globalSetting.softProfileShortGoalYellowAlarmFinalScoreManagerTemplateId;

                                                            stageItem.redAlarmParticipantTemplateId = globalSetting.softProfileShortGoalRedAlarmParticipantTemplateId;
                                                            stageItem.redAlarmEvaluatorTemplateId = globalSetting.softProfileShortGoalRedAlarmEvaluatorTemplateId;
                                                            stageItem.redAlarmManagerTemplateId = globalSetting.softProfileShortGoalRedAlarmManagerTemplateId;
                                                            stageItem.redAlarmTrainerTemplateId = globalSetting.softProfileShortGoalRedAlarmTrainerTemplateId;
                                                            stageItem.redAlarmProjectManagerTemplateId = globalSetting.softProfileShortGoalRedAlarmProjectManagerTemplateId;
                                                            stageItem.redAlarmFinalScoreManagerTemplateId = globalSetting.softProfileShortGoalRedAlarmFinalScoreManagerTemplateId;


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


                                                            stageItem.finalScoreManagerStartNotificationTemplateId = globalSetting.softProfileMidGoalFinalScoreManagerStartNotificationTemplateId;
                                                            stageItem.finalScoreManagerCompletedNotificationTemplateId = globalSetting.softProfileMidGoalFinalScoreManagerCompletedNotificationTemplateId;
                                                            stageItem.finalScoreManagerResultsNotificationTemplateId = globalSetting.softProfileMidGoalFinalScoreManagerResultsNotificationTemplateId;

                                                            stageItem.projectManagerStartNotificationTemplateId = globalSetting.softProfileMidGoalProjectManagerStartNotificationTemplateId;
                                                            stageItem.projectManagerCompletedNotificationTemplateId = globalSetting.softProfileMidGoalProjectManagerCompletedNotificationTemplateId;
                                                            stageItem.projectManagerResultsNotificationTemplateId = globalSetting.softProfileMidGoalProjectManagerResultsNotificationTemplateId;

                                                            stageItem.greenAlarmParticipantTemplateId = globalSetting.softProfileMidGoalGreenAlarmParticipantTemplateId;
                                                            stageItem.greenAlarmEvaluatorTemplateId = globalSetting.softProfileMidGoalGreenAlarmEvaluatorTemplateId;
                                                            stageItem.greenAlarmManagerTemplateId = globalSetting.softProfileMidGoalGreenAlarmManagerTemplateId;
                                                            stageItem.greenAlarmTrainerTemplateId = globalSetting.softProfileMidGoalGreenAlarmTrainerTemplateId;
                                                            stageItem.greenAlarmProjectManagerTemplateId = globalSetting.softProfileMidGoalGreenAlarmProjectManagerTemplateId;
                                                            stageItem.greenAlarmFinalScoreManagerTemplateId = globalSetting.softProfileMidGoalGreenAlarmFinalScoreManagerTemplateId;


                                                            stageItem.yellowAlarmParticipantTemplateId = globalSetting.softProfileMidGoalYellowAlarmParticipantTemplateId;
                                                            stageItem.yellowAlarmEvaluatorTemplateId = globalSetting.softProfileMidGoalYellowAlarmEvaluatorTemplateId;
                                                            stageItem.yellowAlarmManagerTemplateId = globalSetting.softProfileMidGoalYellowAlarmManagerTemplateId;
                                                            stageItem.yellowAlarmTrainerTemplateId = globalSetting.softProfileMidGoalYellowAlarmTrainerTemplateId;
                                                            stageItem.yellowAlarmProjectManagerTemplateId = globalSetting.softProfileMidGoalYellowAlarmProjectManagerTemplateId;
                                                            stageItem.yellowAlarmFinalScoreManagerTemplateId = globalSetting.softProfileMidGoalYellowAlarmFinalScoreManagerTemplateId;


                                                            stageItem.redAlarmParticipantTemplateId = globalSetting.softProfileMidGoalRedAlarmParticipantTemplateId;
                                                            stageItem.redAlarmEvaluatorTemplateId = globalSetting.softProfileMidGoalRedAlarmEvaluatorTemplateId;
                                                            stageItem.redAlarmManagerTemplateId = globalSetting.softProfileMidGoalRedAlarmManagerTemplateId;
                                                            stageItem.redAlarmTrainerTemplateId = globalSetting.softProfileMidGoalRedAlarmTrainerTemplateId;
                                                            stageItem.redAlarmProjectManagerTemplateId = globalSetting.softProfileMidGoalRedAlarmProjectManagerTemplateId;
                                                            stageItem.redAlarmFinalScoreManagerTemplateId = globalSetting.softProfileMidGoalRedAlarmFinalScoreManagerTemplateId;


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

                                                            stageItem.finalScoreManagerStartNotificationTemplateId = globalSetting.softProfileLongTermGoalFinalScoreManagerStartNotificationTemplateId;
                                                            stageItem.finalScoreManagerCompletedNotificationTemplateId = globalSetting.softProfileLongTermGoalFinalScoreManagerCompletedNotificationTemplateId;
                                                            stageItem.finalScoreManagerResultsNotificationTemplateId = globalSetting.softProfileLongTermGoalFinalScoreManagerResultsNotificationTemplateId;

                                                            stageItem.projectManagerStartNotificationTemplateId = globalSetting.softProfileLongTermGoalProjectManagerStartNotificationTemplateId;
                                                            stageItem.projectManagerCompletedNotificationTemplateId = globalSetting.softProfileLongTermGoalProjectManagerCompletedNotificationTemplateId;
                                                            stageItem.projectManagerResultsNotificationTemplateId = globalSetting.softProfileLongTermGoalProjectManagerResultsNotificationTemplateId;

                                                            stageItem.greenAlarmParticipantTemplateId = globalSetting.softProfileLongTermGoalGreenAlarmParticipantTemplateId;
                                                            stageItem.greenAlarmEvaluatorTemplateId = globalSetting.softProfileLongTermGoalGreenAlarmEvaluatorTemplateId;
                                                            stageItem.greenAlarmManagerTemplateId = globalSetting.softProfileLongTermGoalGreenAlarmManagerTemplateId;
                                                            stageItem.greenAlarmTrainerTemplateId = globalSetting.softProfileLongTermGoalGreenAlarmTrainerTemplateId;
                                                            stageItem.greenAlarmProjectManagerTemplateId = globalSetting.softProfileLongTermGoalGreenAlarmProjectManagerTemplateId;
                                                            stageItem.greenAlarmFinalScoreManagerTemplateId = globalSetting.softProfileLongTermGoalGreenAlarmFinalScoreManagerTemplateId;

                                                            stageItem.yellowAlarmParticipantTemplateId = globalSetting.softProfileLongTermGoalYellowAlarmParticipantTemplateId;
                                                            stageItem.yellowAlarmEvaluatorTemplateId = globalSetting.softProfileLongTermGoalYellowAlarmEvaluatorTemplateId;
                                                            stageItem.yellowAlarmManagerTemplateId = globalSetting.softProfileLongTermGoalYellowAlarmManagerTemplateId;
                                                            stageItem.yellowAlarmTrainerTemplateId = globalSetting.softProfileLongTermGoalYellowAlarmTrainerTemplateId;
                                                            stageItem.yellowAlarmProjectManagerTemplateId = globalSetting.softProfileLongTermGoalYellowAlarmProjectManagerTemplateId;
                                                            stageItem.yellowAlarmFinalScoreManagerTemplateId = globalSetting.softProfileLongTermGoalYellowAlarmFinalScoreManagerTemplateId;

                                                            stageItem.redAlarmParticipantTemplateId = globalSetting.softProfileLongTermGoalRedAlarmParticipantTemplateId;
                                                            stageItem.redAlarmEvaluatorTemplateId = globalSetting.softProfileLongTermGoalRedAlarmEvaluatorTemplateId;
                                                            stageItem.redAlarmManagerTemplateId = globalSetting.softProfileLongTermGoalRedAlarmManagerTemplateId;
                                                            stageItem.redAlarmTrainerTemplateId = globalSetting.softProfileLongTermGoalRedAlarmTrainerTemplateId;
                                                            stageItem.redAlarmProjectManagerTemplateId = globalSetting.softProfileLongTermGoalRedAlarmProjectManagerTemplateId;
                                                            stageItem.redAlarmFinalScoreManagerTemplateId = globalSetting.softProfileLongTermGoalRedAlarmFinalScoreManagerTemplateId;


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
                                                            stageItem.greenAlarmProjectManagerTemplateId = globalSetting.softProfileFinalGoalGreenAlarmProjectManagerTemplateId;
                                                            stageItem.greenAlarmFinalScoreManagerTemplateId = globalSetting.softProfileFinalGoalGreenAlarmFinalScoreManagerTemplateId;

                                                            stageItem.finalScoreManagerStartNotificationTemplateId = globalSetting.softProfileFinalGoalFinalScoreManagerStartNotificationTemplateId;
                                                            stageItem.finalScoreManagerCompletedNotificationTemplateId = globalSetting.softProfileFinalGoalFinalScoreManagerCompletedNotificationTemplateId;
                                                            stageItem.finalScoreManagerResultsNotificationTemplateId = globalSetting.softProfileFinalGoalFinalScoreManagerResultsNotificationTemplateId;

                                                            stageItem.projectManagerStartNotificationTemplateId = globalSetting.softProfileFinalGoalProjectManagerStartNotificationTemplateId;
                                                            stageItem.projectManagerCompletedNotificationTemplateId = globalSetting.softProfileFinalGoalProjectManagerCompletedNotificationTemplateId;
                                                            stageItem.projectManagerResultsNotificationTemplateId = globalSetting.softProfileFinalGoalProjectManagerResultsNotificationTemplateId;


                                                            stageItem.greenAlarmParticipantTemplateId = globalSetting.softProfileFinalGoalGreenAlarmParticipantTemplateId;
                                                            stageItem.greenAlarmEvaluatorTemplateId = globalSetting.softProfileFinalGoalGreenAlarmEvaluatorTemplateId;
                                                            stageItem.greenAlarmManagerTemplateId = globalSetting.softProfileFinalGoalGreenAlarmManagerTemplateId;
                                                            stageItem.greenAlarmTrainerTemplateId = globalSetting.softProfileFinalGoalGreenAlarmTrainerTemplateId;
                                                            stageItem.yellowAlarmParticipantTemplateId = globalSetting.softProfileFinalGoalYellowAlarmParticipantTemplateId;
                                                            stageItem.yellowAlarmEvaluatorTemplateId = globalSetting.softProfileFinalGoalYellowAlarmEvaluatorTemplateId;
                                                            stageItem.yellowAlarmManagerTemplateId = globalSetting.softProfileFinalGoalYellowAlarmManagerTemplateId;
                                                            stageItem.yellowAlarmTrainerTemplateId = globalSetting.softProfileFinalGoalYellowAlarmTrainerTemplateId;
                                                            stageItem.yellowAlarmProjectManagerTemplateId = globalSetting.softProfileFinalGoalYellowAlarmProjectManagerTemplateId;
                                                            stageItem.yellowAlarmFinalScoreManagerTemplateId = globalSetting.softProfileFinalGoalYellowAlarmFinalScoreManagerTemplateId;

                                                            stageItem.redAlarmParticipantTemplateId = globalSetting.softProfileFinalGoalRedAlarmParticipantTemplateId;
                                                            stageItem.redAlarmEvaluatorTemplateId = globalSetting.softProfileFinalGoalRedAlarmEvaluatorTemplateId;
                                                            stageItem.redAlarmManagerTemplateId = globalSetting.softProfileFinalGoalRedAlarmManagerTemplateId;
                                                            stageItem.redAlarmTrainerTemplateId = globalSetting.softProfileFinalGoalRedAlarmTrainerTemplateId;
                                                            stageItem.redAlarmProjectManagerTemplateId = globalSetting.softProfileFinalGoalRedAlarmProjectManagerTemplateId;
                                                            stageItem.redAlarmFinalScoreManagerTemplateId = globalSetting.softProfileFinalGoalRedAlarmFinalScoreManagerTemplateId;

                                                        }
                                                    }
                                                }
                                            }
                                            else {

                                                stageItem.evaluationStartDate = moment(kendo.parseDate(stageItem.evaluationStartDate)).format('L LT')
                                                stageItem.evaluationEndDate = moment(kendo.parseDate(stageItem.evaluationEndDate)).format('L LT')
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
                                        $scope.setDefaults($scope.stageGroup.id);
                                    }
                                },
                                    function (data) {

                                    });
                            }

                        }, function (data) {
                        });

                    }
                    else {
                        // Edit
                        stageGroupManager.isStageGroupInUse($scope.stageGroup.id).then(function (data) {
                            if (data == true) {
                                //dialogService.showNotification($translate.instant('MYPROJECTS_STAGE_GROUP_CANNOT_BE_UPDATE') + ' ' + $translate.instant('MYPROJECTS_THIS_STAGE_GROUP_IS_ALREADY_IN_USE'), 'warning');
                                var clonnedStageGroup = _.clone($scope.stageGroup);
                                clonnedStageGroup.startDate = kendo.parseDate(clonnedStageGroup.startDate);
                                clonnedStageGroup.endDate = kendo.parseDate(clonnedStageGroup.endDate);
                                stageGroupManager.updateStageGroupBasicInfo(clonnedStageGroup).then(function (data) {
                                    dialogService.showNotification($translate.instant('SOFTPROFILE_STAGE_GROUP_BASIC_INFO_UPDATE'), 'info');
                                })

                            } else {
                                dialogService.showYesNoDialog($translate.instant('COMMON_CONFIRM'), $translate.instant('MYPROJECTS_ARE_YOU_SURE_YOU_WANT_TO_UPDATE')).then(function () {
                                    var stageGroup = angular.copy($scope.stageGroup);
                                    stageGroup.stages = [];
                                    stageGroup.profiles = [];
                                    var profile = angular.copy($scope.profile);
                                    stageGroup["profiles"] = [profile];
                                    stageGroup.startDate = kendo.parseDate(stageGroup.startDate);
                                    stageGroup.endDate = kendo.parseDate(stageGroup.endDate);
                                    stageGroup.startStageStartDate = kendo.parseDate(stageGroup.startStageStartDate);
                                    stageGroup.startStageEndDate = kendo.parseDate(stageGroup.startStageEndDate);
                                    stageGroup.milestoneStartDate = kendo.parseDate(stageGroup.milestoneStartDate);
                                    stageGroup.milestoneEndDate = kendo.parseDate(stageGroup.milestoneEndDate);
                                    apiService.update('stageGroups', stageGroup).then(function (data) {
                                        if (data) {
                                            apiService.getById("profiles/getFullProfileById", $stateParams.profileId, "").then(function (profileDatail) {
                                                var profile = profileDatail;
                                                _.each(profile.performanceGroups, function (pgItem) {
                                                    _.each(pgItem.link_PerformanceGroupSkills, function (link_PerformanceGroupSkillItem) {
                                                        link_PerformanceGroupSkillItem.name = link_PerformanceGroupSkillItem.skill.name;
                                                        link_PerformanceGroupSkillItem.description = link_PerformanceGroupSkillItem.skill.description;
                                                        _.each(link_PerformanceGroupSkillItem.questions, function (questionsItem) {
                                                            questionsItem["skillId"] = link_PerformanceGroupSkillItem.id;
                                                        });
                                                    });
                                                });
                                                _.each(profile.stageGroups, function (sgItem) {
                                                    sgItem.startDate = moment(kendo.parseDate(sgItem.startDate)).format('L LT');
                                                    sgItem.endDate = moment(kendo.parseDate(sgItem.endDate)).format('L LT');
                                                    if (sgItem.startStageStartDate) {
                                                        sgItem.startStageStartDate = moment(kendo.parseDate(sgItem.startStageStartDate)).format('L LT');
                                                    }
                                                    if (sgItem.startStageEndDate) {
                                                        sgItem.startStageEndDate = moment(kendo.parseDate(sgItem.startStageEndDate)).format('L LT');
                                                    }
                                                    if (sgItem.milestoneStartDate) {
                                                        sgItem.milestoneStartDate = moment(kendo.parseDate(sgItem.milestoneStartDate)).format('L LT');
                                                    }
                                                    if (sgItem.milestoneEndDate) {
                                                        sgItem.milestoneEndDate = moment(kendo.parseDate(sgItem.milestoneEndDate)).format('L LT');
                                                    }
                                                    _.each(sgItem.stages, function (stageItem) {
                                                        stageItem.startDateTime = moment(kendo.parseDate(stageItem.startDateTime)).format('L LT');
                                                        stageItem.endDateTime = moment(kendo.parseDate(stageItem.endDateTime)).format('L LT');
                                                        stageItem.redAlarmTime = moment(kendo.parseDate(stageItem.redAlarmTime)).format('L LT');
                                                        stageItem.yellowAlarmTime = moment(kendo.parseDate(stageItem.yellowAlarmTime)).format('L LT');
                                                        stageItem.greenAlarmTime = moment(kendo.parseDate(stageItem.greenAlarmTime)).format('L LT');

                                                        if (stageItem.evaluationStartDate != null) {
                                                            stageItem.evaluationStartDate = moment(kendo.parseDate(stageItem.evaluationStartDate)).format('L LT');
                                                        }
                                                        if (stageItem.evaluationEndDate != null) {
                                                            stageItem.evaluationEndDate = moment(kendo.parseDate(stageItem.evaluationEndDate)).format('L LT');
                                                        }
                                                    });
                                                    var sortedStages = _.sortByOrder(sgItem.stages, function (o) { return new moment(kendo.parseDate(o.startDate)).format('L LT'); }, ['asc']);
                                                    sgItem.stages = sortedStages;
                                                });
                                                $scope.profile = profile;
                                                $scope.profileType = profile.profileTypeId;
                                                dialogService.showNotification($translate.instant('MYPROJECTS_PROJECTPROFILES_STAGE_GROUP_UPDATED_SUCCESSFULLY'), "success");
                                            }, function () {
                                            })
                                        }
                                        else {
                                            dialogService.showNotification($translate.instant('MYPROJECTS_PROJECTPROFILES_STAGE_GROUP_UPDATE_FAILED'), "warning");
                                        }
                                    }, function (error) {
                                        dialogService.showNotification(error, "warning")
                                    })
                                })


                            }
                        })
                    }
                    $("#stageGroupModal").modal("hide");
                }
            }


            $scope.AddParticipantsModal = function (stageGroupId) {
                $scope.stageGroupId = stageGroupId;
                if ($scope.projectInfo != null) {
                    $("#participantModal").modal("show");
                }
            }
            $scope.participants = [];
            $scope.selfEvaluationChange = function (stageGroupId, userId) {

                var participant = _.find($scope.participants, function (participantItem) {
                    return participantItem.userId == userId;
                });

                var evaluators = _.filter($scope.evaluators, function (evaluatorItem) {
                    return evaluatorItem.evaluateeId == participant.participantId;
                });

                if (evaluators.length > 0) {
                    dialogService.showYesNoDialog($translate.instant('COMMON_CONFIRM'), $translate.instant('MYPROJECTS_YOU_HAVE_ALREADY_ADDED_EVALUATORS_IF_CONFIRM_EVALUATOES_REMOVED') + $translate.instant('MYPROJECTS_ARE_YOU_SURE_YOU_WANT_TO_MAKE_YOUR_SELF_AS_EVALUTOR')).then(
                        function () {
                            var participantevaluators = angular.copy($scope.evaluators);
                            //var evaluatorstoRemove = _.filter(participantevaluators, function () {
                            //    return item.evaluateeId == participant.participantId;
                            //});
                            _.each(evaluators, function (item) {
                                apiService.remove("stageGroups/participant", item.participantId).then(function (data) {
                                    if (data) {
                                        var evaluatorIndex = _.findIndex($scope.evaluators, function (item) {
                                            return item.participantId == item.participantIs && item.stageGroupId == stageGroupId;
                                        });
                                        if (evaluatorIndex > -1) {
                                            $scope.evaluators.splice(evaluatorIndex, 1);
                                        }
                                    }
                                }, function () { })
                            });

                            participantevaluators = _.filter(participantevaluators, function (item) {
                                return item.evaluateeId != participant.participantId;
                            });
                            $scope.evaluators = participantevaluators;

                            if (participant) {
                                apiService.update("stageGroups/Participant/" + participant.participantId + "/" + participant.isSelfEvaluation, null).then(function (data) {
                                    dialogService.showNotification($translate.instant('MYPROJECTS_UPDATED_SUCCESSFULLY'), "success");
                                },
                                    function (data) {
                                    });
                            }
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
                else {

                    if (participant) {
                        apiService.update("stageGroups/Participant/" + participant.participantId + "/" + participant.isSelfEvaluation, null).then(function (data) {
                            dialogService.showNotification($translate.instant('MYPROJECTS_UPDATED_SUCCESSFULLY'), "success");
                        },
                            function (data) {
                            });
                    }

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
                    return participantItem.userId == userId && participantItem.stageGroupId == stageGroupId && participantItem.participantId == participantId;
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
                    return participantItem.userId == userId && participantItem.stageGroupId == steeringGroupid && participantItem.participantId == participantId;
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
                    if ($scope.projectInfo.projectSteeringGroups.length > 0) {
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
                                                userItem["userImage"] = userItem.user.imagePath;
                                                userItem["stageGroupId"] = $scope.stageGroupId;
                                                userItem["email"] = userItem.user.workEmail;
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
                    else {
                        _.each($scope.users, function (userItem) {
                            if (userItem.id == userid) {
                                userItem["stageGroupId"] = $scope.stageGroupId;
                                userItem["isSelfEvaluation"] = $scope.profile.profileTypeId == profileTypeEnum.Knowledge;
                                profilesService.getUserById(userItem.id).then(function (data) {
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
                                            userItem["userImage"] = userItem.user.imagePath;
                                            userItem["stageGroupId"] = $scope.stageGroupId;
                                            userItem["email"] = userItem.user.workEmail;
                                            $scope.participants.push(userItem);
                                            $("#participantModal").modal("hide");
                                        }
                                    },
                                        function (data) {

                                        });


                                })

                            }
                        });
                    }
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
                    if ($scope.projectInfo.projectSteeringGroups.length > 0) {
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
                    else {
                        _.each($scope.users, function (userItem) {
                            if (userItem.id == userid) {
                                userItem["stageGroupId"] = $scope.stageGroupId;
                                userItem["participantId"] = participantId;
                                userItem["participant"] = _.find($scope.participants, function (participantItem) {
                                    return participantItem.userId == participantId;
                                });
                                profilesService.getUserById(userItem.id).then(function (data) {
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
                    }
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
                    if ($scope.projectInfo.projectSteeringGroups.length > 0) {
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
                    else {
                        _.each($scope.users, function (userItem) {
                            if (userItem.id == userid) {
                                userItem["participantId"] = participantId;
                                userItem["stageGroupId"] = $scope.stageGroupId;
                                userItem["participant"] = _.find($scope.participants, function (participantItem) {
                                    return participantItem.userId == participantId;
                                });
                                profilesService.getUserById(userItem.id).then(function (data) {
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
                    }
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
                    dialogService.showYesNoDialog($translate.instant('COMMON_CONFIRM'), $translate.instant('MYPROJECTS_ARE_YOU_SURE_WANT_TO_DELETE')).then(function () {
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

                dialogService.showYesNoDialog($translate.instant('COMMON_CONFIRM'), $translate.instant('MYPROJECTS_ARE_YOU_SURE_WANT_TO_DELETE')).then(function () {

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
                dialogService.showYesNoDialog($translate.instant('COMMON_CONFIRM'), $translate.instant('MYPROJECTS_ARE_YOU_SURE_WANT_TO_DELETE')).then(function () {

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
            $scope.participantOrganizationId = null;
            $scope.organizationChanged = function (id) {
                $scope.users = [];
                if (id > 0) {
                    profilesService.getOrganizationUsers(id).then(function (data) {
                        $scope.users = data;
                    });
                }
            }

            $scope.gotoStatus = function () {
                if (($scope.profileId > 0) && ($scope.participants.length > 0)) {
                    $location.path("/home/knowledge/" + $scope.profileId + "/status");
                }
                else {
                    dialogService.showNotification($translate.instant("SOFTPROFILE_PLEASE_ADD_PARTICIPANTS_TO_STAGE_GROUP"), "error");
                    $("#bootstrap-wizard-1 li").removeClass("active");
                    $("#bootstrap-wizard-1 li[data-tabDiv='participants']").addClass("active");

                }
            }
            $scope.gotoHistory = function () {
                if (($scope.profileId > 0) && ($scope.participants.length > 0)) {
                    $location.path("/home/knowledge/" + $scope.profileId + "/history");

                }
                else {
                    dialogService.showNotification($translate.instant("SOFTPROFILE_PLEASE_ADD_PARTICIPANTS_TO_STAGE_GROUP"), "error");
                    $("#bootstrap-wizard-1 li").removeClass("active");
                    $("#bootstrap-wizard-1 li[data-tabDiv='participants']").addClass("active");
                }
            }
        }])
    .controller('KnowledgeProfileStatusCtrl', ['$scope', 'localStorageService', 'authService', 'apiService', 'dialogService', 'cssInjector', '$stateParams', 'profile', 'profileTypeEnum', 'projectInfo', 'notificationTemplates', 'profilesService', 'stageGroupManager', '$translate', 'globalVariables', 'templateTypeEnum', 'stageTypesEnum', 'evaluationRolesEnum',
        function ($scope, localStorageService, authService, apiService, dialogService, cssInjector, $stateParams, profile, profileTypeEnum, projectInfo, notificationTemplates, profilesService, stageGroupManager, $translate, globalVariables, templateTypeEnum, stageTypesEnum, evaluationRolesEnum) {
            cssInjector.add('views/profiles/new-soft-profile.css');
            var authData = localStorageService.get('authorizationData');
            $scope.currentUser = authData.user;
            $scope.authService = authService;
            $scope.profileId = $stateParams.profileId;
            $scope.profileUrlModifier = 'knowledge';
            $scope.profile = null;
            $scope.projectInfo = projectInfo;
            $scope.profileTypeEnum = profileTypeEnum;
            $scope.statusOfStages = [];
            $scope.fpStatusOfStages = [];
            if (profile != null) {
                $scope.profile = profile;
                $scope.profileType = profile.profileTypeId;
            }
            $scope.openNewSendOutModal = function () {

                $scope.stageGroup = {
                    id: 0,
                    name: null,
                    description: null,
                    startDate: null,
                    endDate: null,
                    parentStageGroupId: null,
                    parentParticipantId: null,
                    monthsSpan: 0,
                    weeksSpan: 6,
                    daysSpan: 0,
                    hoursSpan: 0,
                    minutesSpan: 0,
                    actualTimeSpan: 0,
                    totalMilestones: 5,
                    stages: [],
                    startStageStartDate: null,
                    startStageEndDate: null,
                    milestoneStartDate: null,
                    milestoneEndDate: null,
                }




                var globalSetting = null;
                if ($scope.projectInfo) {
                    $scope.stageGroup.name = $scope.projectInfo.name;
                    $scope.stageGroup.startDate = moment(kendo.parseDate($scope.projectInfo.expectedStartDate)).format('L LT');
                    $scope.stageGroup.endDate = moment(kendo.parseDate($scope.projectInfo.expectedEndDate)).format('L LT');
                    $scope.stageGroup.startStageStartDate = moment(kendo.parseDate($scope.projectInfo.expectedStartDate)).format('L LT');
                    $scope.stageGroup.startStageEndDate = moment(kendo.parseDate($scope.projectInfo.expectedStartDate)).add("days", 7).format('L LT');
                    $scope.stageGroup.milestoneStartDate = moment(kendo.parseDate($scope.projectInfo.expectedStartDate)).add("days", 7).format('L LT');
                    $scope.stageGroup.milestoneEndDate = moment(kendo.parseDate($scope.projectInfo.expectedEndDate)).format('L LT');
                    if ($scope.projectInfo.projectGlobalSettings.length > 0) {
                        globalSetting = $scope.projectInfo.projectGlobalSettings[0];
                    }
                }

                if ($scope.profile.profileTypeId == profileTypeEnum.Soft || $scope.profile.profileTypeId == profileTypeEnum.Hard) {
                    var diffTime = null;
                    var a = moment(kendo.parseDate($scope.stageGroup.milestoneEndDate));
                    var b = moment(kendo.parseDate($scope.stageGroup.milestoneStartDate));
                    diffTime = a.diff(b);
                    if ($scope.profile.profileTypeId == profileTypeEnum.Soft || $scope.profile.profileTypeId == profileTypeEnum.Hard) {
                        var duration = moment.duration(diffTime);
                        $scope.sendOutMilestoneDiffrence = {
                            months: duration.months(),
                            weeks: duration.weeks(),
                            days: duration.days(),
                            hours: duration.hours(),
                            minutes: duration.minutes(),
                        }
                        if (duration.years() > 0) {
                            $scope.sendOutMilestoneDiffrence.months = $scope.sendOutMilestoneDiffrence.months + (duration.years() * 12);
                        }
                        if ($scope.stageGroup.totalMilestones > 0) {
                            diffTime = a.diff(b) / $scope.stageGroup.totalMilestones; // 1
                        }
                        else {
                            diffTime = a.diff(b) / 5; // 1
                        }
                    }
                    duration = moment.duration(diffTime);
                    $scope.stageGroup.actualTimeSpan = diffTime,
                        $scope.stageGroup.monthsSpan = duration.months();
                    $scope.stageGroup.weeksSpan = duration.weeks();
                    $scope.stageGroup.daysSpan = duration.days();
                    if ($scope.stageGroup.weeksSpan > 0) {
                        $scope.stageGroup.daysSpan = $scope.stageGroup.daysSpan - ($scope.stageGroup.weeksSpan * 7);
                    }
                    $scope.stageGroup.hoursSpan = duration.hours();
                    $scope.stageGroup.minutesSpan = duration.minutes();
                }
                if (globalSetting) {
                    if ($scope.profile.profileTypeId == profileTypeEnum.Soft || $scope.profile.profileTypeId == profileTypeEnum.Hard) {

                    }
                    else {
                        $scope.stageGroup.actualTimeSpan = globalSetting.knowledgeProfileActualTimeSpan,
                            $scope.stageGroup.monthsSpan = globalSetting.knowledgeProfileMonthSpan;
                        $scope.stageGroup.weeksSpan = globalSetting.knowledgeProfileWeekSpan;
                        $scope.stageGroup.daysSpan = globalSetting.knowledgeProfileDaySpan;
                        $scope.stageGroup.hoursSpan = globalSetting.knowledgeProfileHourSpan;
                        $scope.stageGroup.minutesSpan = globalSetting.knowledgeProfileMinuteSpan;
                    }
                }
                else {
                    if ($scope.projectInfo) {
                        var diffTime = null;
                        var a = moment(kendo.parseDate($scope.projectInfo.expectedEndDate));
                        var b = moment(kendo.parseDate($scope.projectInfo.expectedStartDate));
                        diffTime = a.diff(b);
                        if ($scope.profile.profileTypeId == profileTypeEnum.Soft || $scope.profile.profileTypeId == profileTypeEnum.Hard) {
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
                            if ($scope.stageGroup.totalMilestones > 0) {
                                diffTime = a.diff(b) / $scope.stageGroup.totalMilestones; // 1
                            }
                            else {
                                diffTime = a.diff(b) / 5; // 1
                            }
                        }
                        duration = moment.duration(diffTime);
                        $scope.stageGroup.actualTimeSpan = diffTime,
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
                    actualTimeSpan: 0,
                    totalMilestones: 5,
                    stages: [],
                    startStageStartDate: moment(kendo.parseDate($scope.projectInfo.expectedStartDate)).format('L LT'),
                    startStageEndDate: moment(kendo.parseDate($scope.projectInfo.expectedStartDate)).add("days", 7).format('L LT'),
                    milestoneStartDate: moment(kendo.parseDate($scope.projectInfo.expectedStartDate)).add("days", 7).format('L LT'),
                    milestoneEndDate: moment(kendo.parseDate($scope.projectInfo.expectedEndDate)).format('L LT'),
                }
                var stageGroup = _.find($scope.profile.stageGroups, function (stageGroupItem) {
                    return stageGroupItem.id == stageGroupId;
                });
                if (stageGroup) {
                    $scope.stageGroup = angular.copy(stageGroup);

                    $scope.numberOfMilestoneChange();
                }
                $("#stageGroupModal").modal("show");

            }
            $scope.removeSendOut = function (stageGroupId) {

                stageGroupManager.isStageGroupInUse(stageGroupId).then(
                    function (data) {
                        if (data == true) {
                            dialogService.showNotification($translate.instant('MYPROJECTS_STAGE_GROUP_CANNOT_BE_REMOVED') + ' ' + $translate.instant('MYPROJECTS_THIS_STAGE_GROUP_IS_ALREADY_IN_USE'), 'warning');
                        } else {
                            dialogService.showYesNoDialog($translate.instant('COMMON_CONFIRM'), $translate.instant('COMMON_ARE_YOU_SURE_YOU_WANT_TO_DELETE')).then(
                                function () {
                                    stageGroupManager.removeStageGroup(stageGroupId).then(
                                        function (data) {
                                            var index = _.findIndex($scope.profile.stageGroups, function (stageGroupItem) {
                                                return stageGroupItem.id == stageGroupId;
                                            });
                                            if (index > -1) {
                                                $scope.profile.stageGroups.splice(index, 1);
                                                dialogService.showNotification($translate.instant('MYPROJECTS_SEND_OUT_REMOVED_SUCCESSFULLY'), "success");
                                            }
                                        },
                                        function (data) {
                                            console.log(data);
                                        }
                                    );
                                },
                                function () {
                                }
                            );
                        }
                    }
                );
            }
            $scope.StageGroupStartDateOpen = function (event) {
                var datepicker = $(event.sender.element).data("kendoDateTimePicker");
                datepicker.setOptions({
                    min: kendo.parseDate($scope.projectInfo.expectedStartDate)
                });
            };
            $scope.StageGroupStartDateChange = function (event) {
                if (!(kendo.parseDate($scope.stageGroup.startDate) > kendo.parseDate($scope.stageGroup.endDate))) {
                    $scope.stageGroup.endDate = "";
                }
                else {
                    var diffTime = null;
                    var a = moment(kendo.parseDate($scope.stageGroup.endDate));
                    var b = moment(kendo.parseDate($scope.stageGroup.startDate));
                    diffTime = a.diff(b);
                    if ($scope.profile.profileTypeId == profileTypeEnum.Soft || $scope.profile.profileTypeId == profileTypeEnum.Hard) {
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
                        if ($scope.stageGroup.totalMilestones > 0) {
                            diffTime = a.diff(b) / $scope.stageGroup.totalMilestones; // 1
                        }
                        else {
                            diffTime = a.diff(b) / 5; // 1
                        }
                    }

                    if ($scope.stageGroup.startStageStartDate == null) {
                        duration = moment.duration(diffTime);
                        $scope.stageGroup.actualTimeSpan = diffTime,
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
            };
            $scope.StageGroupEndDateOpen = function (event) {
                var datepicker = $(event.sender.element).data("kendoDateTimePicker")
                if ($scope.projectInfo.id > 0) {
                    datepicker.setOptions({
                        min: kendo.parseDate($scope.projectInfo.expectedStartDate),
                        max: kendo.parseDate($scope.projectInfo.expectedEndDate)
                    });
                }
                else {
                    datepicker.setOptions({
                        min: kendo.parseDate($scope.projectInfo.expectedStartDate),
                    });
                }
            };
            $scope.StageGroupEndDateChange = function (event) {
                var diffTime = null;
                var a = moment(kendo.parseDate(event.sender.value()));
                var b = moment(kendo.parseDate($scope.stageGroup.startDate));
                diffTime = a.diff(b);
                if ($scope.profile.profileTypeId == profileTypeEnum.Soft || $scope.profile.profileTypeId == profileTypeEnum.Hard) {
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
                    if ($scope.stageGroup.totalMilestones > 0) {
                        diffTime = a.diff(b) / $scope.stageGroup.totalMilestones; // 1
                    }
                    else {
                        diffTime = a.diff(b) / 5; // 1
                    }
                }

                if ($scope.stageGroup.startStageStartDate != null) {
                    duration = moment.duration(diffTime);
                    $scope.stageGroup.actualTimeSpan = diffTime;
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


            $scope.StageGroupStartStageStartDateOpen = function (event) {
                var datepicker = $(event.sender.element).data("kendoDateTimePicker");
                datepicker.setOptions({
                    min: kendo.parseDate($scope.projectInfo.expectedStartDate),
                    max: kendo.parseDate($scope.projectInfo.expectedEndDate)
                });
            }
            $scope.StageGroupStartStageStartDateChange = function (event) {

                if ((kendo.parseDate($scope.stageGroup.startStageStartDate) > kendo.parseDate($scope.stageGroup.startStageEndDate))) {
                    $scope.stageGroup.startStageEndDate = null;
                }
            };

            $scope.StageGroupStartStageEndDateOpen = function (event) {
                var datepicker = $(event.sender.element).data("kendoDateTimePicker")
                datepicker.setOptions({
                    min: kendo.parseDate($scope.stageGroup.startStageStartDate),
                    max: kendo.parseDate($scope.projectInfo.expectedEndDate)
                });
            };
            $scope.StageGroupStartStageEndDateChange = function (event) {
                $scope.stageGroup.milestoneStartDate = moment(kendo.parseDate(event.sender.value())).format('L LT');
            };


            $scope.StageGroupMilestoneStartDateOpen = function (event) {
                var datepicker = $(event.sender.element).data("kendoDateTimePicker");
                datepicker.setOptions({
                    min: kendo.parseDate($scope.stageGroup.startStageEndDate),
                    max: kendo.parseDate($scope.projectInfo.expectedEndDate)
                });
            }
            $scope.StageGroupMilestoneStartDateChange = function (event) {
                if ((kendo.parseDate(event.sender.value()) > kendo.parseDate($scope.stageGroup.milestoneEndDate))) {
                    $scope.stageGroup.milestoneEndDate = "";
                }
                else {
                    var diffTime = null;
                    var a = moment(kendo.parseDate($scope.stageGroup.milestoneEndDate));
                    var b = moment(kendo.parseDate(event.sender.value()));
                    diffTime = a.diff(b);
                    if ($scope.profile.profileTypeId == profileTypeEnum.Soft || $scope.profile.profileTypeId == profileTypeEnum.Hard) {
                        var duration = moment.duration(diffTime);
                        $scope.sendOutMilestoneDiffrence = {
                            months: duration.months(),
                            weeks: duration.weeks(),
                            days: duration.days(),
                            hours: duration.hours(),
                            minutes: duration.minutes(),
                        }
                        if (duration.years() > 0) {
                            $scope.sendOutMilestoneDiffrence.months = $scope.sendOutMilestoneDiffrence.months + (duration.years() * 12);
                        }
                        if ($scope.stageGroup.totalMilestones > 0) {
                            diffTime = a.diff(b) / $scope.stageGroup.totalMilestones; // 1
                        }
                        else {
                            diffTime = a.diff(b) / 5; // 1
                        }
                    }
                    duration = moment.duration(diffTime);
                    $scope.stageGroup.actualTimeSpan = diffTime,
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


            $scope.StageGroupMilestoneEndDateOpen = function (event) {
                var datepicker = $(event.sender.element).data("kendoDateTimePicker")
                datepicker.setOptions({
                    min: kendo.parseDate($scope.stageGroup.milestoneStartDate),
                    max: kendo.parseDate($scope.projectInfo.expectedEndDate)
                });
            };
            $scope.StageGroupMilestoneEndDateChange = function (event) {
                var diffTime = null;
                var a = moment(kendo.parseDate(event.sender.value()));
                var b = moment(kendo.parseDate($scope.stageGroup.milestoneStartDate));
                diffTime = a.diff(b);
                if ($scope.profile.profileTypeId == profileTypeEnum.Soft || $scope.profile.profileTypeId == profileTypeEnum.Hard) {
                    var duration = moment.duration(diffTime);
                    $scope.sendOutMilestoneDiffrence = {
                        months: duration.months(),
                        weeks: duration.weeks(),
                        days: duration.days(),
                        hours: duration.hours(),
                        minutes: duration.minutes(),
                    }
                    if (duration.weeks() > 0) {
                        $scope.sendOutMilestoneDiffrence.days = duration.days() - (duration.weeks() * 7);
                    }
                    if (duration.years() > 0) {
                        $scope.sendOutMilestoneDiffrence.months = $scope.sendOutMilestoneDiffrence.months + (duration.years() * 12);
                    }
                    if ($scope.stageGroup.totalMilestones > 0) {
                        diffTime = a.diff(b) / $scope.stageGroup.totalMilestones; // 1
                    }
                    else {
                        diffTime = a.diff(b) / 5; // 1
                    }
                }
                duration = moment.duration(diffTime);
                $scope.stageGroup.actualTimeSpan = diffTime,
                    $scope.stageGroup.monthsSpan = duration.months();
                $scope.stageGroup.weeksSpan = duration.weeks();
                $scope.stageGroup.daysSpan = duration.days();
                if ($scope.stageGroup.weeksSpan > 0) {
                    $scope.stageGroup.daysSpan = $scope.stageGroup.daysSpan - ($scope.stageGroup.weeksSpan * 7);
                }
                if (duration.years() > 0) {
                    $scope.sendOutMilestoneDiffrence.months = $scope.sendOutMilestoneDiffrence.months + (duration.years() * 12);
                }
                $scope.stageGroup.hoursSpan = duration.hours();
                $scope.stageGroup.minutesSpan = duration.minutes();
            };
            $scope.numberOfMilestoneChange = function () {
                var diffTime = null;
                if ($scope.stageGroup.milestoneStartDate && $scope.stageGroup.milestoneEndDate) {
                    var a = moment(kendo.parseDate($scope.stageGroup.milestoneEndDate));
                    var b = moment(kendo.parseDate($scope.stageGroup.milestoneStartDate));
                    diffTime = a.diff(b);
                    if ($scope.profile.profileTypeId == profileTypeEnum.Soft || $scope.profile.profileTypeId == profileTypeEnum.Hard) {
                        var duration = moment.duration(diffTime);
                        $scope.sendOutMilestoneDiffrence = {
                            months: duration.months(),
                            weeks: duration.weeks(),
                            days: duration.days(),
                            hours: duration.hours(),
                            minutes: duration.minutes(),
                        }
                        if (duration.years() > 0) {
                            $scope.sendOutMilestoneDiffrence.months = $scope.sendOutMilestoneDiffrence.months + (duration.years() * 12);
                        }
                        if ($scope.stageGroup.totalMilestones > 0) {
                            diffTime = a.diff(b) / $scope.stageGroup.totalMilestones; // 1
                        }
                        else {
                            diffTime = a.diff(b) / 5; // 1
                        }
                    }
                    duration = moment.duration(diffTime);
                    $scope.stageGroup.actualTimeSpan = diffTime,
                        $scope.stageGroup.monthsSpan = duration.months();
                    $scope.stageGroup.weeksSpan = duration.weeks();
                    $scope.stageGroup.daysSpan = duration.days();
                    if ($scope.stageGroup.weeksSpan > 0) {
                        $scope.stageGroup.daysSpan = $scope.stageGroup.daysSpan - ($scope.stageGroup.weeksSpan * 7);
                    }

                    $scope.stageGroup.hoursSpan = duration.hours();
                    $scope.stageGroup.minutesSpan = duration.minutes();
                }
                else {
                    var a = moment(kendo.parseDate($scope.stageGroup.endDate));
                    var b = moment(kendo.parseDate($scope.stageGroup.startDate));
                    diffTime = a.diff(b);
                    if ($scope.profile.profileTypeId == profileTypeEnum.Soft || $scope.profile.profileTypeId == profileTypeEnum.Hard) {
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
                        if ($scope.stageGroup.totalMilestones > 0) {
                            diffTime = a.diff(b) / $scope.stageGroup.totalMilestones; // 1
                        }
                        else {
                            diffTime = a.diff(b) / 5; // 1
                        }
                    }
                    duration = moment.duration(diffTime);
                    $scope.stageGroup.actualTimeSpan = diffTime,
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

            $scope.addNewStageGroup = function () {
                if ($scope.formStageGroup.$valid) {
                    if ($scope.stageGroup.id == 0) {
                        $scope.stageGroup.id = ($scope.profile.stageGroups.length + 1) * -1;
                        var profile = angular.copy($scope.profile);
                        profile.stageGroups = [];
                        $scope.isStartStage = true;
                        $scope.stageGroup["profiles"] = [profile];

                        var stageGroupCopy = _.clone($scope.stageGroup);
                        stageGroupCopy.startDate = kendo.parseDate(stageGroupCopy.startDate);
                        stageGroupCopy.endDate = kendo.parseDate(stageGroupCopy.endDate);
                        stageGroupCopy.startStageStartDate = kendo.parseDate(stageGroupCopy.startStageStartDate);
                        stageGroupCopy.startStageEndDate = kendo.parseDate(stageGroupCopy.startStageEndDate);
                        stageGroupCopy.milestoneStartDate = kendo.parseDate(stageGroupCopy.milestoneStartDate);
                        stageGroupCopy.milestoneEndDate = kendo.parseDate(stageGroupCopy.milestoneEndDate);
                        apiService.add('stageGroups', stageGroupCopy).then(function (data) {
                            if (data > 0) {
                                $scope.stageGroup.id = data;


                                dialogService.showNotification($translate.instant('MYPROJECTS_PROJECTPROFILES_SEND_OUT_SETTING_ADDED_SUCCESSFULLY'), "successs");

                                var globalSetting = null;
                                if ($scope.projectInfo.projectGlobalSettings.length > 0) {
                                    globalSetting = $scope.projectInfo.projectGlobalSettings[0]
                                }
                                apiService.getAll("stagegroups/" + $scope.stageGroup.id + "/allstages").then(function (stagesdata) {
                                    $scope.stageGroup["userRecurrentNotificationSettings"] = [];
                                    _.each(stagesdata, function (stageItem, index) {
                                        stageItem.startDateTime = moment(kendo.parseDate(stageItem.startDateTime)).format("L LT");
                                        stageItem.endDateTime = moment(kendo.parseDate(stageItem.endDateTime)).format("L LT");
                                        stageItem.evaluationStartDate = moment(kendo.parseDate(stageItem.evaluationStartDate)).format("L LT");
                                        stageItem.evaluationEndDate = moment(kendo.parseDate(stageItem.evaluationEndDate)).format("L LT");
                                        var recurrentNotificationSettings = {
                                            id: 0,
                                            stageGroupId: $scope.stageGroup.id,
                                            stageId: stageItem.id,
                                            userId: 0,
                                            emailNotification: true,
                                            smsNotification: false,
                                            greenAlarmParticipantTemplateId: null,
                                            greenAlarmEvaluatorTemplateId: null,
                                            greenAlarmManagerTemplateId: null,
                                            greenAlarmTrainerTemplateId: null,
                                            greenAlarmProjectManagerTemplateId: null,
                                            greenAlarmFinalScoreManagerTemplateId: null,
                                            greenAlarmTime: null,
                                            yellowAlarmParticipantTemplateId: null,
                                            yellowAlarmEvaluatorTemplateId: null,
                                            yellowAlarmManagerTemplateId: null,
                                            yellowAlarmTrainerTemplateId: null,
                                            yellowAlarmProjectManagerTemplateId: null,
                                            yellowAlarmFinalScoreManagerTemplateId: null,
                                            yellowAlarmTime: null,
                                            redAlarmParticipantTemplateId: null,
                                            redAlarmEvaluatorTemplateId: null,
                                            redAlarmManagerTemplateId: null,
                                            redAlarmTrainerTemplateId: null,
                                            redAlarmProjectManagerTemplateId: null,
                                            redAlarmFinalScoreManagerTemplateId: null,
                                            redAlarmTime: null,
                                            externalStartNotificationTemplateId: null,
                                            externalCompletedNotificationTemplateId: null,
                                            externalResultsNotificationTemplateId: null,
                                            evaluatorStartNotificationTemplateId: null,
                                            evaluatorCompletedNotificationTemplateId: null,
                                            evaluatorResultsNotificationTemplateId: null,
                                            trainerStartNotificationTemplateId: null,
                                            trainerCompletedNotificationTemplateId: null,
                                            trainerResultsNotificationTemplateId: null,
                                            managerStartNotificationTemplateId: null,
                                            managerCompletedNotificationTemplateId: null,
                                            managerResultsNotificationTemplateId: null,
                                            finalScoreManagerStartNotificationTemplateId: null,
                                            finalScoreManagerCompletedNotificationTemplateId: null,
                                            finalScoreManagerResultsNotificationTemplateId: null,
                                            projectManagerStartNotificationTemplateId: null,
                                            projectManagerCompletedNotificationTemplateId: null,
                                            projectManagerResultsNotificationTemplateId: null,
                                            howMany: null,
                                            metricId: null,
                                            howManySet: null,
                                            howManyActions: null,
                                        }
                                        var externalStartNotificationTemplate = _.filter(notificationTemplates, function (item) {
                                            return item.notificationTemplateTypeId == templateTypeEnum.RecurrentTrainingNotification && item.evaluationRoleId == evaluationRolesEnum.participant && item.isDefualt == true;
                                        });
                                        if (externalStartNotificationTemplate.length > 0) {
                                            recurrentNotificationSettings.externalStartNotificationTemplateId = externalStartNotificationTemplate[0].id;
                                        }
                                        var evaluatorStartNotificationTemplate = _.filter(notificationTemplates, function (item) {
                                            return item.notificationTemplateTypeId == templateTypeEnum.RecurrentTrainingNotification && item.evaluationRoleId == evaluationRolesEnum.evaluator && item.isDefualt == true;
                                        });
                                        if (evaluatorStartNotificationTemplate.length > 0) {
                                            recurrentNotificationSettings.evaluatorStartNotificationTemplateId = evaluatorStartNotificationTemplate[0].id;
                                            recurrentNotificationSettings.finalScoreManagerStartNotificationTemplateId = evaluatorStartNotificationTemplate[0].id;
                                        }
                                        var managerStartNotificationTemplate = _.filter(notificationTemplates, function (item) {
                                            return item.notificationTemplateTypeId == templateTypeEnum.RecurrentTrainingNotification && item.evaluationRoleId == evaluationRolesEnum.manager && item.isDefualt == true;
                                        });
                                        if (managerStartNotificationTemplate.length > 0) {
                                            recurrentNotificationSettings.managerStartNotificationTemplateId = managerStartNotificationTemplate[0].id;
                                            recurrentNotificationSettings.projectManagerStartNotificationTemplateId = managerStartNotificationTemplate[0].id;
                                        }
                                        var trainerStartNotificationTemplate = _.filter(notificationTemplates, function (item) {
                                            return item.notificationTemplateTypeId == templateTypeEnum.RecurrentTrainingNotification && item.evaluationRoleId == evaluationRolesEnum.trainer && item.isDefualt == true;
                                        });
                                        if (trainerStartNotificationTemplate.length > 0) {
                                            recurrentNotificationSettings.trainerStartNotificationTemplateId = trainerStartNotificationTemplate[0].id;
                                        }

                                        var globalSetting = null;
                                        if ($scope.projectInfo.projectGlobalSettings.length > 0) {
                                            globalSetting = $scope.projectInfo.projectGlobalSettings[0];
                                            recurrentNotificationSettings.howMany = globalSetting.softProfileHowMany;
                                            recurrentNotificationSettings.howManyActions = globalSetting.softProfileHowManyActions;
                                            recurrentNotificationSettings.howManySet = globalSetting.softProfileHowManySets;
                                            recurrentNotificationSettings.metricId = globalSetting.softProfileMetricId;
                                            recurrentNotificationSettings.recurrentTrainningFrequency = globalSetting.softProfileRecurrentTrainingTimeSpan;
                                            recurrentNotificationSettings.emailNotification = globalSetting.softProfileStartEmailNotification;
                                            recurrentNotificationSettings.sMSNotification = globalSetting.softProfileStartSmsNotification;

                                        }

                                        $scope.stageGroup.userRecurrentNotificationSettings.push(recurrentNotificationSettings);


                                        if ($scope.profile.profileTypeId == profileTypeEnum.Knowledge) {
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

                                                stageItem.finalScoreManagerStartNotificationTemplateId = globalSetting.knowledgeProfileFinalScoreManagerStartNotificationTemplateId;
                                                stageItem.finalScoreManagerCompletedNotificationTemplateId = globalSetting.knowledgeProfileFinalScoreManagerCompletedNotificationTemplateId;
                                                stageItem.finalScoreManagerResultsNotificationTemplateId = globalSetting.knowledgeProfileFinalScoreManagerResultsNotificationTemplateId;

                                                stageItem.projectManagerStartNotificationTemplateId = globalSetting.knowledgeProfileProjectManagerStartNotificationTemplateId;
                                                stageItem.projectManagerCompletedNotificationTemplateId = globalSetting.knowledgeProfileProjectManagerCompletedNotificationTemplateId;
                                                stageItem.projectManagerResultsNotificationTemplateId = globalSetting.knowledgeProfileProjectManagerResultsNotificationTemplateId;

                                            }
                                            else {
                                                stageItem.startDateTime = moment(kendo.parseDate(stageItem.startDateTime)).format('L LT')
                                                stageItem.endDateTime = moment(kendo.parseDate(stageItem.endDateTime)).format('L LT')
                                                stageItem.greenAlarmTime = moment(kendo.parseDate(stageItem.greenAlarmTime)).format('L LT')
                                                stageItem.yellowAlarmTime = moment(kendo.parseDate(stageItem.yellowAlarmTime)).format('L LT')
                                                stageItem.redAlarmTime = moment(kendo.parseDate(stageItem.redAlarmTime)).format('L LT')

                                            }
                                        }
                                        else if ($scope.profile.profileTypeId == profileTypeEnum.Soft || $scope.profile.profileTypeId == profileTypeEnum.Hard) {
                                            var globalSetting = null;
                                            if ($scope.projectInfo.projectGlobalSettings.length > 0) {
                                                globalSetting = $scope.projectInfo.projectGlobalSettings[0]
                                            }
                                            if (globalSetting) {
                                                stageItem.managerId = globalSetting.managerId;
                                                stageItem.trainerId = globalSetting.trainerId;
                                                stageItem.evaluationStartDate = moment(kendo.parseDate(stageItem.evaluationStartDate)).format('L LT')
                                                stageItem.evaluationEndDate = moment(kendo.parseDate(stageItem.evaluationEndDate)).format('L LT')
                                                if (index == 0) {
                                                    stageItem.emailNotification = globalSetting.softProfileStartEmailNotification;
                                                    stageItem.smsNotification = globalSetting.softProfileStartSmsNotification;

                                                    stageItem.startDateTime = moment(kendo.parseDate(stageItem.startDateTime)).format('L LT')
                                                    stageItem.endDateTime = moment(kendo.parseDate(stageItem.endDateTime)).format('L LT')
                                                    stageItem.greenAlarmTime = moment(kendo.parseDate(stageItem.greenAlarmTime)).format('L LT')
                                                    stageItem.yellowAlarmTime = moment(kendo.parseDate(stageItem.yellowAlarmTime)).format('L LT')
                                                    stageItem.redAlarmTime = moment(kendo.parseDate(stageItem.redAlarmTime)).format('L LT')


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

                                                    stageItem.finalScoreManagerStartNotificationTemplateId = globalSetting.softProfileStartFinalScoreManagerStartNotificationTemplateId;
                                                    stageItem.finalScoreManagerCompletedNotificationTemplateId = globalSetting.softProfileStartFinalScoreManagerCompletedNotificationTemplateId;
                                                    stageItem.finalScoreManagerResultsNotificationTemplateId = globalSetting.softProfileStartFinalScoreManagerResultsNotificationTemplateId;

                                                    stageItem.projectManagerStartNotificationTemplateId = globalSetting.softProfileStartProjectManagerStartNotificationTemplateId;
                                                    stageItem.projectManagerCompletedNotificationTemplateId = globalSetting.softProfileStartProjectManagerCompletedNotificationTemplateId;
                                                    stageItem.projectManagerResultsNotificationTemplateId = globalSetting.softProfileStartProjectManagerResultsNotificationTemplateId;


                                                    stageItem.greenAlarmParticipantTemplateId = globalSetting.softProfileStartGreenAlarmParticipantTemplateId;
                                                    stageItem.greenAlarmEvaluatorTemplateId = globalSetting.softProfileStartGreenAlarmEvaluatorTemplateId;
                                                    stageItem.greenAlarmManagerTemplateId = globalSetting.softProfileStartGreenAlarmManagerTemplateId;
                                                    stageItem.greenAlarmTrainerTemplateId = globalSetting.softProfileStartGreenAlarmTrainerTemplateId;
                                                    stageItem.greenAlarmProjectManagerTemplateId = globalSetting.softProfileStartGreenAlarmProjectManagerTemplateId;
                                                    stageItem.greenAlarmFinalScoreManagerTemplateId = globalSetting.softProfileStartGreenAlarmFinalScoreManagerTemplateId;

                                                    stageItem.yellowAlarmParticipantTemplateId = globalSetting.softProfileStartYellowAlarmParticipantTemplateId;
                                                    stageItem.yellowAlarmEvaluatorTemplateId = globalSetting.softProfileStartYellowAlarmEvaluatorTemplateId;
                                                    stageItem.yellowAlarmManagerTemplateId = globalSetting.softProfileStartYellowAlarmManagerTemplateId;
                                                    stageItem.yellowAlarmTrainerTemplateId = globalSetting.softProfileStartYellowAlarmTrainerTemplateId;
                                                    stageItem.yellowAlarmProjectManagerTemplateId = globalSetting.softProfileStartYellowAlarmProjectManagerTemplateId;
                                                    stageItem.yellowAlarmFinalScoreManagerTemplateId = globalSetting.softProfileStartYellowAlarmFinalScoreManagerTemplateId;

                                                    stageItem.redAlarmParticipantTemplateId = globalSetting.softProfileStartRedAlarmParticipantTemplateId;
                                                    stageItem.redAlarmEvaluatorTemplateId = globalSetting.softProfileStartRedAlarmEvaluatorTemplateId;
                                                    stageItem.redAlarmManagerTemplateId = globalSetting.softProfileStartRedAlarmManagerTemplateId;
                                                    stageItem.redAlarmTrainerTemplateId = globalSetting.softProfileStartRedAlarmTrainerTemplateId;
                                                    stageItem.redAlarmProjectManagerTemplateId = globalSetting.softProfileStartRedAlarmProjectManagerTemplateId;
                                                    stageItem.redAlarmFinalScoreManagerTemplateId = globalSetting.softProfileStartRedAlarmFinalScoreManagerTemplateId;


                                                }
                                                else {
                                                    if ($scope.projectInfo.projectDefaultNotificationSettings.length > 0) {

                                                        var projectDefaultNotificationSettings = $scope.projectInfo.projectDefaultNotificationSettings[0];

                                                        stageItem.emailNotification = projectDefaultNotificationSettings.emailNotification;
                                                        stageItem.smsNotification = projectDefaultNotificationSettings.smsNotification;

                                                        stageItem.startDateTime = moment(kendo.parseDate(stageItem.startDateTime)).format('L LT')
                                                        stageItem.endDateTime = moment(kendo.parseDate(stageItem.endDateTime)).format('L LT')
                                                        stageItem.greenAlarmTime = moment(kendo.parseDate(stageItem.greenAlarmTime)).format('L LT')
                                                        stageItem.yellowAlarmTime = moment(kendo.parseDate(stageItem.yellowAlarmTime)).format('L LT')
                                                        stageItem.redAlarmTime = moment(kendo.parseDate(stageItem.redAlarmTime)).format('L LT')

                                                        stageItem.externalStartNotificationTemplateId = projectDefaultNotificationSettings.participantsStartNotificationId;
                                                        stageItem.externalCompletedNotificationTemplateId = projectDefaultNotificationSettings.participantsCompletedNotificationId;
                                                        stageItem.externalResultsNotificationTemplateId = projectDefaultNotificationSettings.participantsResultNotificationId;
                                                        stageItem.evaluatorStartNotificationTemplateId = projectDefaultNotificationSettings.evaluatorsStartNotificationId;
                                                        stageItem.evaluatorCompletedNotificationTemplateId = projectDefaultNotificationSettings.evaluatorsCompletedNotificationId;
                                                        stageItem.evaluatorResultsNotificationTemplateId = projectDefaultNotificationSettings.evaluatorsResultNotificationId;
                                                        stageItem.trainerStartNotificationTemplateId = projectDefaultNotificationSettings.trainersStartNotificationId;
                                                        stageItem.trainerCompletedNotificationTemplateId = projectDefaultNotificationSettings.trainersCompletedNotificationId;
                                                        stageItem.trainerResultsNotificationTemplateId = projectDefaultNotificationSettings.trainersResultNotificationId;
                                                        stageItem.managerStartNotificationTemplateId = projectDefaultNotificationSettings.managersStartNotificationId;
                                                        stageItem.managerCompletedNotificationTemplateId = projectDefaultNotificationSettings.managersCompletedNotificationId;
                                                        stageItem.managerResultsNotificationTemplateId = projectDefaultNotificationSettings.managersResultNotificationId;


                                                        stageItem.finalScoreManagerStartNotificationTemplateId = projectDefaultNotificationSettings.finalScoreManagersStartNotificationId;
                                                        stageItem.finalScoreManagerCompletedNotificationTemplateId = projectDefaultNotificationSettings.finalScoreManagersCompletedNotificationId;
                                                        stageItem.finalScoreManagerResultsNotificationTemplateId = projectDefaultNotificationSettings.finalScoreManagersResultNotificationId;

                                                        stageItem.projectManagerStartNotificationTemplateId = projectDefaultNotificationSettings.projectManagersStartNotificationId;
                                                        stageItem.projectManagerCompletedNotificationTemplateId = projectDefaultNotificationSettings.projectManagersCompletedNotificationId;
                                                        stageItem.projectManagerResultsNotificationTemplateId = projectDefaultNotificationSettings.projectManagersResultNotificationId;


                                                        stageItem.greenAlarmParticipantTemplateId = projectDefaultNotificationSettings.participantGreenNotificationId;
                                                        stageItem.greenAlarmEvaluatorTemplateId = projectDefaultNotificationSettings.evaluatorGreenNotificationId;
                                                        stageItem.greenAlarmManagerTemplateId = projectDefaultNotificationSettings.managerGreenNotificationId;
                                                        stageItem.greenAlarmTrainerTemplateId = projectDefaultNotificationSettings.trainerGreenNotificationId;
                                                        stageItem.greenAlarmProjectManagerTemplateId = projectDefaultNotificationSettings.projectManagersGreenNotificationId;
                                                        stageItem.greenAlarmFinalScoreManagerTemplateId = projectDefaultNotificationSettings.finalScoreManagersGreenNotificationId;



                                                        stageItem.yellowAlarmParticipantTemplateId = projectDefaultNotificationSettings.participantYellowNotificationId;
                                                        stageItem.yellowAlarmEvaluatorTemplateId = projectDefaultNotificationSettings.evaluatorYellowNotificationId;
                                                        stageItem.yellowAlarmManagerTemplateId = projectDefaultNotificationSettings.managerYellowNotificationId;
                                                        stageItem.yellowAlarmTrainerTemplateId = projectDefaultNotificationSettings.trainerYellowNotificationId;
                                                        stageItem.yellowAlarmProjectManagerTemplateId = projectDefaultNotificationSettings.projectManagersYellowNotificationId;
                                                        stageItem.yellowAlarmFinalScoreManagerTemplateId = projectDefaultNotificationSettings.finalScoreManagersYellowNotificationId;

                                                        stageItem.redAlarmParticipantTemplateId = projectDefaultNotificationSettings.participantRedNotificationId;
                                                        stageItem.redAlarmEvaluatorTemplateId = projectDefaultNotificationSettings.evaluatorRedNotificationId;
                                                        stageItem.redAlarmManagerTemplateId = projectDefaultNotificationSettings.managerRedNotificationId;
                                                        stageItem.redAlarmTrainerTemplateId = projectDefaultNotificationSettings.trainerRedNotificationId;
                                                        stageItem.redAlarmProjectManagerTemplateId = projectDefaultNotificationSettings.projectManagersRedNotificationId;
                                                        stageItem.redAlarmFinalScoreManagerTemplateId = projectDefaultNotificationSettings.finalScoreManagersRedNotificationId;
                                                    }
                                                    else {
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


                                                            stageItem.finalScoreManagerStartNotificationTemplateId = globalSetting.softProfileShortGoalFinalScoreManagerStartNotificationTemplateId;
                                                            stageItem.finalScoreManagerCompletedNotificationTemplateId = globalSetting.softProfileShortGoalFinalScoreManagerCompletedNotificationTemplateId;
                                                            stageItem.finalScoreManagerResultsNotificationTemplateId = globalSetting.softProfileShortGoalFinalScoreManagerResultsNotificationTemplateId;

                                                            stageItem.projectManagerStartNotificationTemplateId = globalSetting.softProfileShortGoalProjectManagerStartNotificationTemplateId;
                                                            stageItem.projectManagerCompletedNotificationTemplateId = globalSetting.softProfileShortGoalProjectManagerCompletedNotificationTemplateId;
                                                            stageItem.projectManagerResultsNotificationTemplateId = globalSetting.softProfileShortGoalProjectManagerResultsNotificationTemplateId;


                                                            stageItem.greenAlarmParticipantTemplateId = globalSetting.softProfileShortGoalGreenAlarmParticipantTemplateId;
                                                            stageItem.greenAlarmEvaluatorTemplateId = globalSetting.softProfileShortGoalGreenAlarmEvaluatorTemplateId;
                                                            stageItem.greenAlarmManagerTemplateId = globalSetting.softProfileShortGoalGreenAlarmManagerTemplateId;
                                                            stageItem.greenAlarmTrainerTemplateId = globalSetting.softProfileShortGoalGreenAlarmTrainerTemplateId;
                                                            stageItem.greenAlarmProjectManagerTemplateId = globalSetting.softProfileShortGoalGreenAlarmProjectManagerTemplateId;
                                                            stageItem.greenAlarmFinalScoreManagerTemplateId = globalSetting.softProfileShortGoalGreenAlarmFinalScoreManagerTemplateId;



                                                            stageItem.yellowAlarmParticipantTemplateId = globalSetting.softProfileShortGoalYellowAlarmParticipantTemplateId;
                                                            stageItem.yellowAlarmEvaluatorTemplateId = globalSetting.softProfileShortGoalYellowAlarmEvaluatorTemplateId;
                                                            stageItem.yellowAlarmManagerTemplateId = globalSetting.softProfileShortGoalYellowAlarmManagerTemplateId;
                                                            stageItem.yellowAlarmTrainerTemplateId = globalSetting.softProfileShortGoalYellowAlarmTrainerTemplateId;
                                                            stageItem.yellowAlarmProjectManagerTemplateId = globalSetting.softProfileShortGoalYellowAlarmProjectManagerTemplateId;
                                                            stageItem.yellowAlarmFinalScoreManagerTemplateId = globalSetting.softProfileShortGoalYellowAlarmFinalScoreManagerTemplateId;

                                                            stageItem.redAlarmParticipantTemplateId = globalSetting.softProfileShortGoalRedAlarmParticipantTemplateId;
                                                            stageItem.redAlarmEvaluatorTemplateId = globalSetting.softProfileShortGoalRedAlarmEvaluatorTemplateId;
                                                            stageItem.redAlarmManagerTemplateId = globalSetting.softProfileShortGoalRedAlarmManagerTemplateId;
                                                            stageItem.redAlarmTrainerTemplateId = globalSetting.softProfileShortGoalRedAlarmTrainerTemplateId;
                                                            stageItem.redAlarmProjectManagerTemplateId = globalSetting.softProfileShortGoalRedAlarmProjectManagerTemplateId;
                                                            stageItem.redAlarmFinalScoreManagerTemplateId = globalSetting.softProfileShortGoalRedAlarmFinalScoreManagerTemplateId;


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


                                                            stageItem.finalScoreManagerStartNotificationTemplateId = globalSetting.softProfileMidGoalFinalScoreManagerStartNotificationTemplateId;
                                                            stageItem.finalScoreManagerCompletedNotificationTemplateId = globalSetting.softProfileMidGoalFinalScoreManagerCompletedNotificationTemplateId;
                                                            stageItem.finalScoreManagerResultsNotificationTemplateId = globalSetting.softProfileMidGoalFinalScoreManagerResultsNotificationTemplateId;

                                                            stageItem.projectManagerStartNotificationTemplateId = globalSetting.softProfileMidGoalProjectManagerStartNotificationTemplateId;
                                                            stageItem.projectManagerCompletedNotificationTemplateId = globalSetting.softProfileMidGoalProjectManagerCompletedNotificationTemplateId;
                                                            stageItem.projectManagerResultsNotificationTemplateId = globalSetting.softProfileMidGoalProjectManagerResultsNotificationTemplateId;

                                                            stageItem.greenAlarmParticipantTemplateId = globalSetting.softProfileMidGoalGreenAlarmParticipantTemplateId;
                                                            stageItem.greenAlarmEvaluatorTemplateId = globalSetting.softProfileMidGoalGreenAlarmEvaluatorTemplateId;
                                                            stageItem.greenAlarmManagerTemplateId = globalSetting.softProfileMidGoalGreenAlarmManagerTemplateId;
                                                            stageItem.greenAlarmTrainerTemplateId = globalSetting.softProfileMidGoalGreenAlarmTrainerTemplateId;
                                                            stageItem.greenAlarmProjectManagerTemplateId = globalSetting.softProfileMidGoalGreenAlarmProjectManagerTemplateId;
                                                            stageItem.greenAlarmFinalScoreManagerTemplateId = globalSetting.softProfileMidGoalGreenAlarmFinalScoreManagerTemplateId;


                                                            stageItem.yellowAlarmParticipantTemplateId = globalSetting.softProfileMidGoalYellowAlarmParticipantTemplateId;
                                                            stageItem.yellowAlarmEvaluatorTemplateId = globalSetting.softProfileMidGoalYellowAlarmEvaluatorTemplateId;
                                                            stageItem.yellowAlarmManagerTemplateId = globalSetting.softProfileMidGoalYellowAlarmManagerTemplateId;
                                                            stageItem.yellowAlarmTrainerTemplateId = globalSetting.softProfileMidGoalYellowAlarmTrainerTemplateId;
                                                            stageItem.yellowAlarmProjectManagerTemplateId = globalSetting.softProfileMidGoalYellowAlarmProjectManagerTemplateId;
                                                            stageItem.yellowAlarmFinalScoreManagerTemplateId = globalSetting.softProfileMidGoalYellowAlarmFinalScoreManagerTemplateId;


                                                            stageItem.redAlarmParticipantTemplateId = globalSetting.softProfileMidGoalRedAlarmParticipantTemplateId;
                                                            stageItem.redAlarmEvaluatorTemplateId = globalSetting.softProfileMidGoalRedAlarmEvaluatorTemplateId;
                                                            stageItem.redAlarmManagerTemplateId = globalSetting.softProfileMidGoalRedAlarmManagerTemplateId;
                                                            stageItem.redAlarmTrainerTemplateId = globalSetting.softProfileMidGoalRedAlarmTrainerTemplateId;
                                                            stageItem.redAlarmProjectManagerTemplateId = globalSetting.softProfileMidGoalRedAlarmProjectManagerTemplateId;
                                                            stageItem.redAlarmFinalScoreManagerTemplateId = globalSetting.softProfileMidGoalRedAlarmFinalScoreManagerTemplateId;


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

                                                            stageItem.finalScoreManagerStartNotificationTemplateId = globalSetting.softProfileLongTermGoalFinalScoreManagerStartNotificationTemplateId;
                                                            stageItem.finalScoreManagerCompletedNotificationTemplateId = globalSetting.softProfileLongTermGoalFinalScoreManagerCompletedNotificationTemplateId;
                                                            stageItem.finalScoreManagerResultsNotificationTemplateId = globalSetting.softProfileLongTermGoalFinalScoreManagerResultsNotificationTemplateId;

                                                            stageItem.projectManagerStartNotificationTemplateId = globalSetting.softProfileLongTermGoalProjectManagerStartNotificationTemplateId;
                                                            stageItem.projectManagerCompletedNotificationTemplateId = globalSetting.softProfileLongTermGoalProjectManagerCompletedNotificationTemplateId;
                                                            stageItem.projectManagerResultsNotificationTemplateId = globalSetting.softProfileLongTermGoalProjectManagerResultsNotificationTemplateId;

                                                            stageItem.greenAlarmParticipantTemplateId = globalSetting.softProfileLongTermGoalGreenAlarmParticipantTemplateId;
                                                            stageItem.greenAlarmEvaluatorTemplateId = globalSetting.softProfileLongTermGoalGreenAlarmEvaluatorTemplateId;
                                                            stageItem.greenAlarmManagerTemplateId = globalSetting.softProfileLongTermGoalGreenAlarmManagerTemplateId;
                                                            stageItem.greenAlarmTrainerTemplateId = globalSetting.softProfileLongTermGoalGreenAlarmTrainerTemplateId;
                                                            stageItem.greenAlarmProjectManagerTemplateId = globalSetting.softProfileLongTermGoalGreenAlarmProjectManagerTemplateId;
                                                            stageItem.greenAlarmFinalScoreManagerTemplateId = globalSetting.softProfileLongTermGoalGreenAlarmFinalScoreManagerTemplateId;

                                                            stageItem.yellowAlarmParticipantTemplateId = globalSetting.softProfileLongTermGoalYellowAlarmParticipantTemplateId;
                                                            stageItem.yellowAlarmEvaluatorTemplateId = globalSetting.softProfileLongTermGoalYellowAlarmEvaluatorTemplateId;
                                                            stageItem.yellowAlarmManagerTemplateId = globalSetting.softProfileLongTermGoalYellowAlarmManagerTemplateId;
                                                            stageItem.yellowAlarmTrainerTemplateId = globalSetting.softProfileLongTermGoalYellowAlarmTrainerTemplateId;
                                                            stageItem.yellowAlarmProjectManagerTemplateId = globalSetting.softProfileLongTermGoalYellowAlarmProjectManagerTemplateId;
                                                            stageItem.yellowAlarmFinalScoreManagerTemplateId = globalSetting.softProfileLongTermGoalYellowAlarmFinalScoreManagerTemplateId;

                                                            stageItem.redAlarmParticipantTemplateId = globalSetting.softProfileLongTermGoalRedAlarmParticipantTemplateId;
                                                            stageItem.redAlarmEvaluatorTemplateId = globalSetting.softProfileLongTermGoalRedAlarmEvaluatorTemplateId;
                                                            stageItem.redAlarmManagerTemplateId = globalSetting.softProfileLongTermGoalRedAlarmManagerTemplateId;
                                                            stageItem.redAlarmTrainerTemplateId = globalSetting.softProfileLongTermGoalRedAlarmTrainerTemplateId;
                                                            stageItem.redAlarmProjectManagerTemplateId = globalSetting.softProfileLongTermGoalRedAlarmProjectManagerTemplateId;
                                                            stageItem.redAlarmFinalScoreManagerTemplateId = globalSetting.softProfileLongTermGoalRedAlarmFinalScoreManagerTemplateId;


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
                                                            stageItem.greenAlarmProjectManagerTemplateId = globalSetting.softProfileFinalGoalGreenAlarmProjectManagerTemplateId;
                                                            stageItem.greenAlarmFinalScoreManagerTemplateId = globalSetting.softProfileFinalGoalGreenAlarmFinalScoreManagerTemplateId;

                                                            stageItem.finalScoreManagerStartNotificationTemplateId = globalSetting.softProfileFinalGoalFinalScoreManagerStartNotificationTemplateId;
                                                            stageItem.finalScoreManagerCompletedNotificationTemplateId = globalSetting.softProfileFinalGoalFinalScoreManagerCompletedNotificationTemplateId;
                                                            stageItem.finalScoreManagerResultsNotificationTemplateId = globalSetting.softProfileFinalGoalFinalScoreManagerResultsNotificationTemplateId;

                                                            stageItem.projectManagerStartNotificationTemplateId = globalSetting.softProfileFinalGoalProjectManagerStartNotificationTemplateId;
                                                            stageItem.projectManagerCompletedNotificationTemplateId = globalSetting.softProfileFinalGoalProjectManagerCompletedNotificationTemplateId;
                                                            stageItem.projectManagerResultsNotificationTemplateId = globalSetting.softProfileFinalGoalProjectManagerResultsNotificationTemplateId;


                                                            stageItem.greenAlarmParticipantTemplateId = globalSetting.softProfileFinalGoalGreenAlarmParticipantTemplateId;
                                                            stageItem.greenAlarmEvaluatorTemplateId = globalSetting.softProfileFinalGoalGreenAlarmEvaluatorTemplateId;
                                                            stageItem.greenAlarmManagerTemplateId = globalSetting.softProfileFinalGoalGreenAlarmManagerTemplateId;
                                                            stageItem.greenAlarmTrainerTemplateId = globalSetting.softProfileFinalGoalGreenAlarmTrainerTemplateId;
                                                            stageItem.yellowAlarmParticipantTemplateId = globalSetting.softProfileFinalGoalYellowAlarmParticipantTemplateId;
                                                            stageItem.yellowAlarmEvaluatorTemplateId = globalSetting.softProfileFinalGoalYellowAlarmEvaluatorTemplateId;
                                                            stageItem.yellowAlarmManagerTemplateId = globalSetting.softProfileFinalGoalYellowAlarmManagerTemplateId;
                                                            stageItem.yellowAlarmTrainerTemplateId = globalSetting.softProfileFinalGoalYellowAlarmTrainerTemplateId;
                                                            stageItem.yellowAlarmProjectManagerTemplateId = globalSetting.softProfileFinalGoalYellowAlarmProjectManagerTemplateId;
                                                            stageItem.yellowAlarmFinalScoreManagerTemplateId = globalSetting.softProfileFinalGoalYellowAlarmFinalScoreManagerTemplateId;

                                                            stageItem.redAlarmParticipantTemplateId = globalSetting.softProfileFinalGoalRedAlarmParticipantTemplateId;
                                                            stageItem.redAlarmEvaluatorTemplateId = globalSetting.softProfileFinalGoalRedAlarmEvaluatorTemplateId;
                                                            stageItem.redAlarmManagerTemplateId = globalSetting.softProfileFinalGoalRedAlarmManagerTemplateId;
                                                            stageItem.redAlarmTrainerTemplateId = globalSetting.softProfileFinalGoalRedAlarmTrainerTemplateId;
                                                            stageItem.redAlarmProjectManagerTemplateId = globalSetting.softProfileFinalGoalRedAlarmProjectManagerTemplateId;
                                                            stageItem.redAlarmFinalScoreManagerTemplateId = globalSetting.softProfileFinalGoalRedAlarmFinalScoreManagerTemplateId;

                                                        }
                                                    }
                                                }
                                            }
                                            else {

                                                stageItem.evaluationStartDate = moment(kendo.parseDate(stageItem.evaluationStartDate)).format('L LT')
                                                stageItem.evaluationEndDate = moment(kendo.parseDate(stageItem.evaluationEndDate)).format('L LT')
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
                                        $scope.setDefaults($scope.stageGroup.id);
                                    }
                                },
                                    function (data) {

                                    });
                            }

                        }, function (data) {
                        });

                    }
                    else {
                        // Edit
                        stageGroupManager.isStageGroupInUse($scope.stageGroup.id).then(function (data) {
                            if (data == true) {
                                //dialogService.showNotification($translate.instant('MYPROJECTS_STAGE_GROUP_CANNOT_BE_UPDATE') + ' ' + $translate.instant('MYPROJECTS_THIS_STAGE_GROUP_IS_ALREADY_IN_USE'), 'warning');
                                var clonnedStageGroup = _.clone($scope.stageGroup);
                                clonnedStageGroup.startDate = kendo.parseDate(clonnedStageGroup.startDate);
                                clonnedStageGroup.endDate = kendo.parseDate(clonnedStageGroup.endDate);
                                stageGroupManager.updateStageGroupBasicInfo(clonnedStageGroup).then(function (data) {
                                    dialogService.showNotification($translate.instant('SOFTPROFILE_STAGE_GROUP_BASIC_INFO_UPDATE'), 'info');
                                })

                            } else {
                                dialogService.showYesNoDialog($translate.instant('COMMON_CONFIRM'), $translate.instant('MYPROJECTS_ARE_YOU_SURE_YOU_WANT_TO_UPDATE')).then(function () {
                                    var stageGroup = angular.copy($scope.stageGroup);
                                    stageGroup.stages = [];
                                    stageGroup.profiles = [];
                                    var profile = angular.copy($scope.profile);
                                    stageGroup["profiles"] = [profile];
                                    stageGroup.startDate = kendo.parseDate(stageGroup.startDate);
                                    stageGroup.endDate = kendo.parseDate(stageGroup.endDate);
                                    stageGroup.startStageStartDate = kendo.parseDate(stageGroup.startStageStartDate);
                                    stageGroup.startStageEndDate = kendo.parseDate(stageGroup.startStageEndDate);
                                    stageGroup.milestoneStartDate = kendo.parseDate(stageGroup.milestoneStartDate);
                                    stageGroup.milestoneEndDate = kendo.parseDate(stageGroup.milestoneEndDate);
                                    apiService.update('stageGroups', stageGroup).then(function (data) {
                                        if (data) {
                                            apiService.getById("profiles/getFullProfileById", $stateParams.profileId, "").then(function (profileDatail) {
                                                var profile = profileDatail;
                                                _.each(profile.performanceGroups, function (pgItem) {
                                                    _.each(pgItem.link_PerformanceGroupSkills, function (link_PerformanceGroupSkillItem) {
                                                        link_PerformanceGroupSkillItem.name = link_PerformanceGroupSkillItem.skill.name;
                                                        link_PerformanceGroupSkillItem.description = link_PerformanceGroupSkillItem.skill.description;
                                                        _.each(link_PerformanceGroupSkillItem.questions, function (questionsItem) {
                                                            questionsItem["skillId"] = link_PerformanceGroupSkillItem.id;
                                                        });
                                                    });
                                                });
                                                _.each(profile.stageGroups, function (sgItem) {
                                                    sgItem.startDate = moment(kendo.parseDate(sgItem.startDate)).format('L LT');
                                                    sgItem.endDate = moment(kendo.parseDate(sgItem.endDate)).format('L LT');
                                                    if (sgItem.startStageStartDate) {
                                                        sgItem.startStageStartDate = moment(kendo.parseDate(sgItem.startStageStartDate)).format('L LT');
                                                    }
                                                    if (sgItem.startStageEndDate) {
                                                        sgItem.startStageEndDate = moment(kendo.parseDate(sgItem.startStageEndDate)).format('L LT');
                                                    }
                                                    if (sgItem.milestoneStartDate) {
                                                        sgItem.milestoneStartDate = moment(kendo.parseDate(sgItem.milestoneStartDate)).format('L LT');
                                                    }
                                                    if (sgItem.milestoneEndDate) {
                                                        sgItem.milestoneEndDate = moment(kendo.parseDate(sgItem.milestoneEndDate)).format('L LT');
                                                    }
                                                    _.each(sgItem.stages, function (stageItem) {
                                                        stageItem.startDateTime = moment(kendo.parseDate(stageItem.startDateTime)).format('L LT');
                                                        stageItem.endDateTime = moment(kendo.parseDate(stageItem.endDateTime)).format('L LT');
                                                        stageItem.redAlarmTime = moment(kendo.parseDate(stageItem.redAlarmTime)).format('L LT');
                                                        stageItem.yellowAlarmTime = moment(kendo.parseDate(stageItem.yellowAlarmTime)).format('L LT');
                                                        stageItem.greenAlarmTime = moment(kendo.parseDate(stageItem.greenAlarmTime)).format('L LT');

                                                        if (stageItem.evaluationStartDate != null) {
                                                            stageItem.evaluationStartDate = moment(kendo.parseDate(stageItem.evaluationStartDate)).format('L LT');
                                                        }
                                                        if (stageItem.evaluationEndDate != null) {
                                                            stageItem.evaluationEndDate = moment(kendo.parseDate(stageItem.evaluationEndDate)).format('L LT');
                                                        }
                                                    });
                                                    var sortedStages = _.sortByOrder(sgItem.stages, function (o) { return new moment(kendo.parseDate(o.startDate)).format('L LT'); }, ['asc']);
                                                    sgItem.stages = sortedStages;
                                                });
                                                $scope.profile = profile;
                                                $scope.profileType = profile.profileTypeId;
                                                dialogService.showNotification($translate.instant('MYPROJECTS_PROJECTPROFILES_STAGE_GROUP_UPDATED_SUCCESSFULLY'), "success");
                                            }, function () {
                                            })
                                        }
                                        else {
                                            dialogService.showNotification($translate.instant('MYPROJECTS_PROJECTPROFILES_STAGE_GROUP_UPDATE_FAILED'), "warning");
                                        }
                                    }, function (error) {
                                        dialogService.showNotification(error, "warning")
                                    })
                                })


                            }
                        })
                    }
                    $("#stageGroupModal").modal("hide");
                }
            }
            $scope.isAdmin = false;
            function onUserAssignGridDataBound(e) {
                var grid = e.sender;
                if (grid.dataSource.total() == 0) {
                    var colCount = grid.columns.length;
                    $(e.sender.wrapper)
                        .find('tbody')
                        .append('<tr class="kendo-data-row"><td colspan="' + colCount + '" class="no-data">There is no data to show in the grid.</td></tr>');
                }
            };
            $scope.stagesAndAlarms = new kendo.data.ObservableArray([]);
            $scope.stagesAndAlarmsOptions = {
                dataBound: onUserAssignGridDataBound,
                dataSource: {
                    type: "json",
                    data: stageGroupManager.stagesAndAlarms,
                    pageSize: 10,
                    sort: [{ field: "userName", dir: "asc" }],
                },
                columnMenu: false,
                filterable: false,
                pageable: true,
                sortable: true,
                resizable: true,
                columns: [
                    { field: "userName", title: $translate.instant('COMMON_PARTICIPANT'), width: "25%" },
                    { field: "roleId", title: $translate.instant('COMMON_ROLE'), width: "10%", values: $scope.evaluationRoles },
                    { field: "isKPISetText", title: $translate.instant('SOFTPROFILE_SET_KPI'), width: "7%" },
                    { field: "evaluationStatusText", title: $translate.instant('COMMON_STATUS'), width: "10%" },
                    { field: "evaluateeName", title: $translate.instant('SOFTPROFILE_EVALUATEE'), width: "21%" },
                    {
                        field: "actions", title: $translate.instant('COMMON_ACTIONS'), width: "7%", filterable: false,
                        template: function (dataItem) {
                            var tmpl = "<div class='icon-groups'>";
                            if (dataItem.evaluationStatus) {
                                if (dataItem.evaluationStatus.endedAt) {
                                    if (!dataItem.evaluationStatus.isOpen && $scope.isAdmin && $scope.profile.profileTypeId == profileTypeEnum.Soft) {
                                        tmpl += "<a class='icon-groups icon-groups-item refresh-icon' data-placement='top' title='Reopen' ng-click='stageEdit.refreshParticipant(" + dataItem.participantId + ")' ></a>";
                                    }
                                    tmpl += "<a class='icon-groups icon-groups-item analyse-icon' data-placement='top' title='Analyse' ng-click='stageEdit.analyseAnswers(" + dataItem.participantId + "," + dataItem.evaluateeId + ")' ></a>";
                                }
                            }
                            tmpl += "</div>";
                            return tmpl;
                        },
                    },
                ],
            };

            $scope.stageChanged = function (stageGroupId, stagesAndAlarmsStageId) {
                var stagesAndAlarmsGridId = $("#stagesAndAlarmsGridId").data("kendoGrid");
                if (stagesAndAlarmsGridId) {
                    //kendo.ui.progress(stagesAndAlarmsGridId, true);
                }
                stageGroupManager.getStageParticipants(stageGroupId, stagesAndAlarmsStageId, $scope.profileType).then(function (data) {
                    if (stagesAndAlarmsGridId) {
                        //kendo.ui.progress(stagesAndAlarmsGridId, false);
                    }
                })
            }

        }])
    .controller('KnowledgeProfileHistoryCtrl', ['$scope', 'localStorageService', 'authService', 'apiService', 'dialogService', 'cssInjector', '$stateParams', 'profile', 'profileTypeEnum', 'projectInfo', 'notificationTemplates', 'profilesService', 'stageGroupManager', '$translate', 'globalVariables', 'templateTypeEnum', 'stageTypesEnum', 'evaluationRolesEnum',
        function ($scope, localStorageService, authService, apiService, dialogService, cssInjector, $stateParams, profile, profileTypeEnum, projectInfo, notificationTemplates, profilesService, stageGroupManager, $translate, globalVariables, templateTypeEnum, stageTypesEnum, evaluationRolesEnum) {
            cssInjector.add('views/profiles/new-soft-profile.css');
            var authData = localStorageService.get('authorizationData');
            $scope.currentUser = authData.user;
            $scope.authService = authService;
            $scope.profileId = $stateParams.profileId;
            $scope.profileUrlModifier = 'knowledge';
            $scope.profile = null;
            $scope.projectInfo = projectInfo;
            $scope.profileTypeEnum = profileTypeEnum;
            $scope.statusOfStages = [];
            $scope.stages = new kendo.data.ObservableArray([]);
            $scope.fpStatusOfStages = [];
            if (profile != null) {
                $scope.profile = profile;
                $scope.profileType = profile.profileTypeId;
                _.each($scope.profile.stageGroups, function (sgItem) {
                    _.each(sgItem.stages, function (sgItem) {
                        $scope.stages.push(sgItem);
                    })
                })
            }
            $scope.openNewSendOutModal = function () {

                $scope.stageGroup = {
                    id: 0,
                    name: null,
                    description: null,
                    startDate: null,
                    endDate: null,
                    parentStageGroupId: null,
                    parentParticipantId: null,
                    monthsSpan: 0,
                    weeksSpan: 6,
                    daysSpan: 0,
                    hoursSpan: 0,
                    minutesSpan: 0,
                    actualTimeSpan: 0,
                    totalMilestones: 5,
                    stages: [],
                    startStageStartDate: null,
                    startStageEndDate: null,
                    milestoneStartDate: null,
                    milestoneEndDate: null,
                }




                var globalSetting = null;
                if ($scope.projectInfo) {
                    $scope.stageGroup.name = $scope.projectInfo.name;
                    $scope.stageGroup.startDate = moment(kendo.parseDate($scope.projectInfo.expectedStartDate)).format('L LT');
                    $scope.stageGroup.endDate = moment(kendo.parseDate($scope.projectInfo.expectedEndDate)).format('L LT');
                    $scope.stageGroup.startStageStartDate = moment(kendo.parseDate($scope.projectInfo.expectedStartDate)).format('L LT');
                    $scope.stageGroup.startStageEndDate = moment(kendo.parseDate($scope.projectInfo.expectedStartDate)).add("days", 7).format('L LT');
                    $scope.stageGroup.milestoneStartDate = moment(kendo.parseDate($scope.projectInfo.expectedStartDate)).add("days", 7).format('L LT');
                    $scope.stageGroup.milestoneEndDate = moment(kendo.parseDate($scope.projectInfo.expectedEndDate)).format('L LT');
                    if ($scope.projectInfo.projectGlobalSettings.length > 0) {
                        globalSetting = $scope.projectInfo.projectGlobalSettings[0];
                    }
                }

                if ($scope.profile.profileTypeId == profileTypeEnum.Soft || $scope.profile.profileTypeId == profileTypeEnum.Hard) {
                    var diffTime = null;
                    var a = moment(kendo.parseDate($scope.stageGroup.milestoneEndDate));
                    var b = moment(kendo.parseDate($scope.stageGroup.milestoneStartDate));
                    diffTime = a.diff(b);
                    if ($scope.profile.profileTypeId == profileTypeEnum.Soft || $scope.profile.profileTypeId == profileTypeEnum.Hard) {
                        var duration = moment.duration(diffTime);
                        $scope.sendOutMilestoneDiffrence = {
                            months: duration.months(),
                            weeks: duration.weeks(),
                            days: duration.days(),
                            hours: duration.hours(),
                            minutes: duration.minutes(),
                        }
                        if (duration.years() > 0) {
                            $scope.sendOutMilestoneDiffrence.months = $scope.sendOutMilestoneDiffrence.months + (duration.years() * 12);
                        }
                        if ($scope.stageGroup.totalMilestones > 0) {
                            diffTime = a.diff(b) / $scope.stageGroup.totalMilestones; // 1
                        }
                        else {
                            diffTime = a.diff(b) / 5; // 1
                        }
                    }
                    duration = moment.duration(diffTime);
                    $scope.stageGroup.actualTimeSpan = diffTime,
                        $scope.stageGroup.monthsSpan = duration.months();
                    $scope.stageGroup.weeksSpan = duration.weeks();
                    $scope.stageGroup.daysSpan = duration.days();
                    if ($scope.stageGroup.weeksSpan > 0) {
                        $scope.stageGroup.daysSpan = $scope.stageGroup.daysSpan - ($scope.stageGroup.weeksSpan * 7);
                    }
                    $scope.stageGroup.hoursSpan = duration.hours();
                    $scope.stageGroup.minutesSpan = duration.minutes();
                }
                if (globalSetting) {
                    if ($scope.profile.profileTypeId == profileTypeEnum.Soft || $scope.profile.profileTypeId == profileTypeEnum.Hard) {

                    }
                    else {
                        $scope.stageGroup.actualTimeSpan = globalSetting.knowledgeProfileActualTimeSpan,
                            $scope.stageGroup.monthsSpan = globalSetting.knowledgeProfileMonthSpan;
                        $scope.stageGroup.weeksSpan = globalSetting.knowledgeProfileWeekSpan;
                        $scope.stageGroup.daysSpan = globalSetting.knowledgeProfileDaySpan;
                        $scope.stageGroup.hoursSpan = globalSetting.knowledgeProfileHourSpan;
                        $scope.stageGroup.minutesSpan = globalSetting.knowledgeProfileMinuteSpan;
                    }
                }
                else {
                    if ($scope.projectInfo) {
                        var diffTime = null;
                        var a = moment(kendo.parseDate($scope.projectInfo.expectedEndDate));
                        var b = moment(kendo.parseDate($scope.projectInfo.expectedStartDate));
                        diffTime = a.diff(b);
                        if ($scope.profile.profileTypeId == profileTypeEnum.Soft || $scope.profile.profileTypeId == profileTypeEnum.Hard) {
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
                            if ($scope.stageGroup.totalMilestones > 0) {
                                diffTime = a.diff(b) / $scope.stageGroup.totalMilestones; // 1
                            }
                            else {
                                diffTime = a.diff(b) / 5; // 1
                            }
                        }
                        duration = moment.duration(diffTime);
                        $scope.stageGroup.actualTimeSpan = diffTime,
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
                    actualTimeSpan: 0,
                    totalMilestones: 5,
                    stages: [],
                    startStageStartDate: moment(kendo.parseDate($scope.projectInfo.expectedStartDate)).format('L LT'),
                    startStageEndDate: moment(kendo.parseDate($scope.projectInfo.expectedStartDate)).add("days", 7).format('L LT'),
                    milestoneStartDate: moment(kendo.parseDate($scope.projectInfo.expectedStartDate)).add("days", 7).format('L LT'),
                    milestoneEndDate: moment(kendo.parseDate($scope.projectInfo.expectedEndDate)).format('L LT'),
                }
                var stageGroup = _.find($scope.profile.stageGroups, function (stageGroupItem) {
                    return stageGroupItem.id == stageGroupId;
                });
                if (stageGroup) {
                    $scope.stageGroup = angular.copy(stageGroup);

                    $scope.numberOfMilestoneChange();
                }
                $("#stageGroupModal").modal("show");

            }
            $scope.removeSendOut = function (stageGroupId) {

                stageGroupManager.isStageGroupInUse(stageGroupId).then(
                    function (data) {
                        if (data == true) {
                            dialogService.showNotification($translate.instant('MYPROJECTS_STAGE_GROUP_CANNOT_BE_REMOVED') + ' ' + $translate.instant('MYPROJECTS_THIS_STAGE_GROUP_IS_ALREADY_IN_USE'), 'warning');
                        } else {
                            dialogService.showYesNoDialog($translate.instant('COMMON_CONFIRM'), $translate.instant('COMMON_ARE_YOU_SURE_YOU_WANT_TO_DELETE')).then(
                                function () {
                                    stageGroupManager.removeStageGroup(stageGroupId).then(
                                        function (data) {
                                            var index = _.findIndex($scope.profile.stageGroups, function (stageGroupItem) {
                                                return stageGroupItem.id == stageGroupId;
                                            });
                                            if (index > -1) {
                                                $scope.profile.stageGroups.splice(index, 1);
                                                dialogService.showNotification($translate.instant('MYPROJECTS_SEND_OUT_REMOVED_SUCCESSFULLY'), "success");
                                            }
                                        },
                                        function (data) {
                                            console.log(data);
                                        }
                                    );
                                },
                                function () {
                                }
                            );
                        }
                    }
                );
            }
            $scope.StageGroupStartDateOpen = function (event) {
                var datepicker = $(event.sender.element).data("kendoDateTimePicker");
                datepicker.setOptions({
                    min: kendo.parseDate($scope.projectInfo.expectedStartDate)
                });
            };
            $scope.StageGroupStartDateChange = function (event) {
                if (!(kendo.parseDate($scope.stageGroup.startDate) > kendo.parseDate($scope.stageGroup.endDate))) {
                    $scope.stageGroup.endDate = "";
                }
                else {
                    var diffTime = null;
                    var a = moment(kendo.parseDate($scope.stageGroup.endDate));
                    var b = moment(kendo.parseDate($scope.stageGroup.startDate));
                    diffTime = a.diff(b);
                    if ($scope.profile.profileTypeId == profileTypeEnum.Soft || $scope.profile.profileTypeId == profileTypeEnum.Hard) {
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
                        if ($scope.stageGroup.totalMilestones > 0) {
                            diffTime = a.diff(b) / $scope.stageGroup.totalMilestones; // 1
                        }
                        else {
                            diffTime = a.diff(b) / 5; // 1
                        }
                    }

                    if ($scope.stageGroup.startStageStartDate == null) {
                        duration = moment.duration(diffTime);
                        $scope.stageGroup.actualTimeSpan = diffTime,
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
            };
            $scope.StageGroupEndDateOpen = function (event) {
                var datepicker = $(event.sender.element).data("kendoDateTimePicker")
                if ($scope.projectInfo.id > 0) {
                    datepicker.setOptions({
                        min: kendo.parseDate($scope.projectInfo.expectedStartDate),
                        max: kendo.parseDate($scope.projectInfo.expectedEndDate)
                    });
                }
                else {
                    datepicker.setOptions({
                        min: kendo.parseDate($scope.projectInfo.expectedStartDate),
                    });
                }
            };
            $scope.StageGroupEndDateChange = function (event) {
                var diffTime = null;
                var a = moment(kendo.parseDate(event.sender.value()));
                var b = moment(kendo.parseDate($scope.stageGroup.startDate));
                diffTime = a.diff(b);
                if ($scope.profile.profileTypeId == profileTypeEnum.Soft || $scope.profile.profileTypeId == profileTypeEnum.Hard) {
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
                    if ($scope.stageGroup.totalMilestones > 0) {
                        diffTime = a.diff(b) / $scope.stageGroup.totalMilestones; // 1
                    }
                    else {
                        diffTime = a.diff(b) / 5; // 1
                    }
                }

                if ($scope.stageGroup.startStageStartDate != null) {
                    duration = moment.duration(diffTime);
                    $scope.stageGroup.actualTimeSpan = diffTime;
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


            $scope.StageGroupStartStageStartDateOpen = function (event) {
                var datepicker = $(event.sender.element).data("kendoDateTimePicker");
                datepicker.setOptions({
                    min: kendo.parseDate($scope.projectInfo.expectedStartDate),
                    max: kendo.parseDate($scope.projectInfo.expectedEndDate)
                });
            }
            $scope.StageGroupStartStageStartDateChange = function (event) {

                if ((kendo.parseDate($scope.stageGroup.startStageStartDate) > kendo.parseDate($scope.stageGroup.startStageEndDate))) {
                    $scope.stageGroup.startStageEndDate = null;
                }
            };

            $scope.StageGroupStartStageEndDateOpen = function (event) {
                var datepicker = $(event.sender.element).data("kendoDateTimePicker")
                datepicker.setOptions({
                    min: kendo.parseDate($scope.stageGroup.startStageStartDate),
                    max: kendo.parseDate($scope.projectInfo.expectedEndDate)
                });
            };
            $scope.StageGroupStartStageEndDateChange = function (event) {
                $scope.stageGroup.milestoneStartDate = moment(kendo.parseDate(event.sender.value())).format('L LT');
            };


            $scope.StageGroupMilestoneStartDateOpen = function (event) {
                var datepicker = $(event.sender.element).data("kendoDateTimePicker");
                datepicker.setOptions({
                    min: kendo.parseDate($scope.stageGroup.startStageEndDate),
                    max: kendo.parseDate($scope.projectInfo.expectedEndDate)
                });
            }
            $scope.StageGroupMilestoneStartDateChange = function (event) {
                if ((kendo.parseDate(event.sender.value()) > kendo.parseDate($scope.stageGroup.milestoneEndDate))) {
                    $scope.stageGroup.milestoneEndDate = "";
                }
                else {
                    var diffTime = null;
                    var a = moment(kendo.parseDate($scope.stageGroup.milestoneEndDate));
                    var b = moment(kendo.parseDate(event.sender.value()));
                    diffTime = a.diff(b);
                    if ($scope.profile.profileTypeId == profileTypeEnum.Soft || $scope.profile.profileTypeId == profileTypeEnum.Hard) {
                        var duration = moment.duration(diffTime);
                        $scope.sendOutMilestoneDiffrence = {
                            months: duration.months(),
                            weeks: duration.weeks(),
                            days: duration.days(),
                            hours: duration.hours(),
                            minutes: duration.minutes(),
                        }
                        if (duration.years() > 0) {
                            $scope.sendOutMilestoneDiffrence.months = $scope.sendOutMilestoneDiffrence.months + (duration.years() * 12);
                        }
                        if ($scope.stageGroup.totalMilestones > 0) {
                            diffTime = a.diff(b) / $scope.stageGroup.totalMilestones; // 1
                        }
                        else {
                            diffTime = a.diff(b) / 5; // 1
                        }
                    }
                    duration = moment.duration(diffTime);
                    $scope.stageGroup.actualTimeSpan = diffTime,
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


            $scope.StageGroupMilestoneEndDateOpen = function (event) {
                var datepicker = $(event.sender.element).data("kendoDateTimePicker")
                datepicker.setOptions({
                    min: kendo.parseDate($scope.stageGroup.milestoneStartDate),
                    max: kendo.parseDate($scope.projectInfo.expectedEndDate)
                });
            };
            $scope.StageGroupMilestoneEndDateChange = function (event) {
                var diffTime = null;
                var a = moment(kendo.parseDate(event.sender.value()));
                var b = moment(kendo.parseDate($scope.stageGroup.milestoneStartDate));
                diffTime = a.diff(b);
                if ($scope.profile.profileTypeId == profileTypeEnum.Soft || $scope.profile.profileTypeId == profileTypeEnum.Hard) {
                    var duration = moment.duration(diffTime);
                    $scope.sendOutMilestoneDiffrence = {
                        months: duration.months(),
                        weeks: duration.weeks(),
                        days: duration.days(),
                        hours: duration.hours(),
                        minutes: duration.minutes(),
                    }
                    if (duration.weeks() > 0) {
                        $scope.sendOutMilestoneDiffrence.days = duration.days() - (duration.weeks() * 7);
                    }
                    if (duration.years() > 0) {
                        $scope.sendOutMilestoneDiffrence.months = $scope.sendOutMilestoneDiffrence.months + (duration.years() * 12);
                    }
                    if ($scope.stageGroup.totalMilestones > 0) {
                        diffTime = a.diff(b) / $scope.stageGroup.totalMilestones; // 1
                    }
                    else {
                        diffTime = a.diff(b) / 5; // 1
                    }
                }
                duration = moment.duration(diffTime);
                $scope.stageGroup.actualTimeSpan = diffTime,
                    $scope.stageGroup.monthsSpan = duration.months();
                $scope.stageGroup.weeksSpan = duration.weeks();
                $scope.stageGroup.daysSpan = duration.days();
                if ($scope.stageGroup.weeksSpan > 0) {
                    $scope.stageGroup.daysSpan = $scope.stageGroup.daysSpan - ($scope.stageGroup.weeksSpan * 7);
                }
                if (duration.years() > 0) {
                    $scope.sendOutMilestoneDiffrence.months = $scope.sendOutMilestoneDiffrence.months + (duration.years() * 12);
                }
                $scope.stageGroup.hoursSpan = duration.hours();
                $scope.stageGroup.minutesSpan = duration.minutes();
            };
            $scope.numberOfMilestoneChange = function () {
                var diffTime = null;
                if ($scope.stageGroup.milestoneStartDate && $scope.stageGroup.milestoneEndDate) {
                    var a = moment(kendo.parseDate($scope.stageGroup.milestoneEndDate));
                    var b = moment(kendo.parseDate($scope.stageGroup.milestoneStartDate));
                    diffTime = a.diff(b);
                    if ($scope.profile.profileTypeId == profileTypeEnum.Soft || $scope.profile.profileTypeId == profileTypeEnum.Hard) {
                        var duration = moment.duration(diffTime);
                        $scope.sendOutMilestoneDiffrence = {
                            months: duration.months(),
                            weeks: duration.weeks(),
                            days: duration.days(),
                            hours: duration.hours(),
                            minutes: duration.minutes(),
                        }
                        if (duration.years() > 0) {
                            $scope.sendOutMilestoneDiffrence.months = $scope.sendOutMilestoneDiffrence.months + (duration.years() * 12);
                        }
                        if ($scope.stageGroup.totalMilestones > 0) {
                            diffTime = a.diff(b) / $scope.stageGroup.totalMilestones; // 1
                        }
                        else {
                            diffTime = a.diff(b) / 5; // 1
                        }
                    }
                    duration = moment.duration(diffTime);
                    $scope.stageGroup.actualTimeSpan = diffTime,
                        $scope.stageGroup.monthsSpan = duration.months();
                    $scope.stageGroup.weeksSpan = duration.weeks();
                    $scope.stageGroup.daysSpan = duration.days();
                    if ($scope.stageGroup.weeksSpan > 0) {
                        $scope.stageGroup.daysSpan = $scope.stageGroup.daysSpan - ($scope.stageGroup.weeksSpan * 7);
                    }

                    $scope.stageGroup.hoursSpan = duration.hours();
                    $scope.stageGroup.minutesSpan = duration.minutes();
                }
                else {
                    var a = moment(kendo.parseDate($scope.stageGroup.endDate));
                    var b = moment(kendo.parseDate($scope.stageGroup.startDate));
                    diffTime = a.diff(b);
                    if ($scope.profile.profileTypeId == profileTypeEnum.Soft || $scope.profile.profileTypeId == profileTypeEnum.Hard) {
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
                        if ($scope.stageGroup.totalMilestones > 0) {
                            diffTime = a.diff(b) / $scope.stageGroup.totalMilestones; // 1
                        }
                        else {
                            diffTime = a.diff(b) / 5; // 1
                        }
                    }
                    duration = moment.duration(diffTime);
                    $scope.stageGroup.actualTimeSpan = diffTime,
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

            $scope.addNewStageGroup = function () {
                if ($scope.formStageGroup.$valid) {
                    if ($scope.stageGroup.id == 0) {
                        $scope.stageGroup.id = ($scope.profile.stageGroups.length + 1) * -1;
                        var profile = angular.copy($scope.profile);
                        profile.stageGroups = [];
                        $scope.isStartStage = true;
                        $scope.stageGroup["profiles"] = [profile];

                        var stageGroupCopy = _.clone($scope.stageGroup);
                        stageGroupCopy.startDate = kendo.parseDate(stageGroupCopy.startDate);
                        stageGroupCopy.endDate = kendo.parseDate(stageGroupCopy.endDate);
                        stageGroupCopy.startStageStartDate = kendo.parseDate(stageGroupCopy.startStageStartDate);
                        stageGroupCopy.startStageEndDate = kendo.parseDate(stageGroupCopy.startStageEndDate);
                        stageGroupCopy.milestoneStartDate = kendo.parseDate(stageGroupCopy.milestoneStartDate);
                        stageGroupCopy.milestoneEndDate = kendo.parseDate(stageGroupCopy.milestoneEndDate);
                        apiService.add('stageGroups', stageGroupCopy).then(function (data) {
                            if (data > 0) {
                                $scope.stageGroup.id = data;


                                dialogService.showNotification($translate.instant('MYPROJECTS_PROJECTPROFILES_SEND_OUT_SETTING_ADDED_SUCCESSFULLY'), "successs");

                                var globalSetting = null;
                                if ($scope.projectInfo.projectGlobalSettings.length > 0) {
                                    globalSetting = $scope.projectInfo.projectGlobalSettings[0]
                                }
                                apiService.getAll("stagegroups/" + $scope.stageGroup.id + "/allstages").then(function (stagesdata) {
                                    $scope.stageGroup["userRecurrentNotificationSettings"] = [];
                                    _.each(stagesdata, function (stageItem, index) {
                                        stageItem.startDateTime = moment(kendo.parseDate(stageItem.startDateTime)).format("L LT");
                                        stageItem.endDateTime = moment(kendo.parseDate(stageItem.endDateTime)).format("L LT");
                                        stageItem.evaluationStartDate = moment(kendo.parseDate(stageItem.evaluationStartDate)).format("L LT");
                                        stageItem.evaluationEndDate = moment(kendo.parseDate(stageItem.evaluationEndDate)).format("L LT");
                                        var recurrentNotificationSettings = {
                                            id: 0,
                                            stageGroupId: $scope.stageGroup.id,
                                            stageId: stageItem.id,
                                            userId: 0,
                                            emailNotification: true,
                                            smsNotification: false,
                                            greenAlarmParticipantTemplateId: null,
                                            greenAlarmEvaluatorTemplateId: null,
                                            greenAlarmManagerTemplateId: null,
                                            greenAlarmTrainerTemplateId: null,
                                            greenAlarmProjectManagerTemplateId: null,
                                            greenAlarmFinalScoreManagerTemplateId: null,
                                            greenAlarmTime: null,
                                            yellowAlarmParticipantTemplateId: null,
                                            yellowAlarmEvaluatorTemplateId: null,
                                            yellowAlarmManagerTemplateId: null,
                                            yellowAlarmTrainerTemplateId: null,
                                            yellowAlarmProjectManagerTemplateId: null,
                                            yellowAlarmFinalScoreManagerTemplateId: null,
                                            yellowAlarmTime: null,
                                            redAlarmParticipantTemplateId: null,
                                            redAlarmEvaluatorTemplateId: null,
                                            redAlarmManagerTemplateId: null,
                                            redAlarmTrainerTemplateId: null,
                                            redAlarmProjectManagerTemplateId: null,
                                            redAlarmFinalScoreManagerTemplateId: null,
                                            redAlarmTime: null,
                                            externalStartNotificationTemplateId: null,
                                            externalCompletedNotificationTemplateId: null,
                                            externalResultsNotificationTemplateId: null,
                                            evaluatorStartNotificationTemplateId: null,
                                            evaluatorCompletedNotificationTemplateId: null,
                                            evaluatorResultsNotificationTemplateId: null,
                                            trainerStartNotificationTemplateId: null,
                                            trainerCompletedNotificationTemplateId: null,
                                            trainerResultsNotificationTemplateId: null,
                                            managerStartNotificationTemplateId: null,
                                            managerCompletedNotificationTemplateId: null,
                                            managerResultsNotificationTemplateId: null,
                                            finalScoreManagerStartNotificationTemplateId: null,
                                            finalScoreManagerCompletedNotificationTemplateId: null,
                                            finalScoreManagerResultsNotificationTemplateId: null,
                                            projectManagerStartNotificationTemplateId: null,
                                            projectManagerCompletedNotificationTemplateId: null,
                                            projectManagerResultsNotificationTemplateId: null,
                                            howMany: null,
                                            metricId: null,
                                            howManySet: null,
                                            howManyActions: null,
                                        }
                                        var externalStartNotificationTemplate = _.filter(notificationTemplates, function (item) {
                                            return item.notificationTemplateTypeId == templateTypeEnum.RecurrentTrainingNotification && item.evaluationRoleId == evaluationRolesEnum.participant && item.isDefualt == true;
                                        });
                                        if (externalStartNotificationTemplate.length > 0) {
                                            recurrentNotificationSettings.externalStartNotificationTemplateId = externalStartNotificationTemplate[0].id;
                                        }
                                        var evaluatorStartNotificationTemplate = _.filter(notificationTemplates, function (item) {
                                            return item.notificationTemplateTypeId == templateTypeEnum.RecurrentTrainingNotification && item.evaluationRoleId == evaluationRolesEnum.evaluator && item.isDefualt == true;
                                        });
                                        if (evaluatorStartNotificationTemplate.length > 0) {
                                            recurrentNotificationSettings.evaluatorStartNotificationTemplateId = evaluatorStartNotificationTemplate[0].id;
                                            recurrentNotificationSettings.finalScoreManagerStartNotificationTemplateId = evaluatorStartNotificationTemplate[0].id;
                                        }
                                        var managerStartNotificationTemplate = _.filter(notificationTemplates, function (item) {
                                            return item.notificationTemplateTypeId == templateTypeEnum.RecurrentTrainingNotification && item.evaluationRoleId == evaluationRolesEnum.manager && item.isDefualt == true;
                                        });
                                        if (managerStartNotificationTemplate.length > 0) {
                                            recurrentNotificationSettings.managerStartNotificationTemplateId = managerStartNotificationTemplate[0].id;
                                            recurrentNotificationSettings.projectManagerStartNotificationTemplateId = managerStartNotificationTemplate[0].id;
                                        }
                                        var trainerStartNotificationTemplate = _.filter(notificationTemplates, function (item) {
                                            return item.notificationTemplateTypeId == templateTypeEnum.RecurrentTrainingNotification && item.evaluationRoleId == evaluationRolesEnum.trainer && item.isDefualt == true;
                                        });
                                        if (trainerStartNotificationTemplate.length > 0) {
                                            recurrentNotificationSettings.trainerStartNotificationTemplateId = trainerStartNotificationTemplate[0].id;
                                        }

                                        var globalSetting = null;
                                        if ($scope.projectInfo.projectGlobalSettings.length > 0) {
                                            globalSetting = $scope.projectInfo.projectGlobalSettings[0];
                                            recurrentNotificationSettings.howMany = globalSetting.softProfileHowMany;
                                            recurrentNotificationSettings.howManyActions = globalSetting.softProfileHowManyActions;
                                            recurrentNotificationSettings.howManySet = globalSetting.softProfileHowManySets;
                                            recurrentNotificationSettings.metricId = globalSetting.softProfileMetricId;
                                            recurrentNotificationSettings.recurrentTrainningFrequency = globalSetting.softProfileRecurrentTrainingTimeSpan;
                                            recurrentNotificationSettings.emailNotification = globalSetting.softProfileStartEmailNotification;
                                            recurrentNotificationSettings.sMSNotification = globalSetting.softProfileStartSmsNotification;

                                        }

                                        $scope.stageGroup.userRecurrentNotificationSettings.push(recurrentNotificationSettings);


                                        if ($scope.profile.profileTypeId == profileTypeEnum.Knowledge) {
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

                                                stageItem.finalScoreManagerStartNotificationTemplateId = globalSetting.knowledgeProfileFinalScoreManagerStartNotificationTemplateId;
                                                stageItem.finalScoreManagerCompletedNotificationTemplateId = globalSetting.knowledgeProfileFinalScoreManagerCompletedNotificationTemplateId;
                                                stageItem.finalScoreManagerResultsNotificationTemplateId = globalSetting.knowledgeProfileFinalScoreManagerResultsNotificationTemplateId;

                                                stageItem.projectManagerStartNotificationTemplateId = globalSetting.knowledgeProfileProjectManagerStartNotificationTemplateId;
                                                stageItem.projectManagerCompletedNotificationTemplateId = globalSetting.knowledgeProfileProjectManagerCompletedNotificationTemplateId;
                                                stageItem.projectManagerResultsNotificationTemplateId = globalSetting.knowledgeProfileProjectManagerResultsNotificationTemplateId;

                                            }
                                            else {
                                                stageItem.startDateTime = moment(kendo.parseDate(stageItem.startDateTime)).format('L LT')
                                                stageItem.endDateTime = moment(kendo.parseDate(stageItem.endDateTime)).format('L LT')
                                                stageItem.greenAlarmTime = moment(kendo.parseDate(stageItem.greenAlarmTime)).format('L LT')
                                                stageItem.yellowAlarmTime = moment(kendo.parseDate(stageItem.yellowAlarmTime)).format('L LT')
                                                stageItem.redAlarmTime = moment(kendo.parseDate(stageItem.redAlarmTime)).format('L LT')

                                            }
                                        }
                                        else if ($scope.profile.profileTypeId == profileTypeEnum.Soft || $scope.profile.profileTypeId == profileTypeEnum.Hard) {
                                            var globalSetting = null;
                                            if ($scope.projectInfo.projectGlobalSettings.length > 0) {
                                                globalSetting = $scope.projectInfo.projectGlobalSettings[0]
                                            }
                                            if (globalSetting) {
                                                stageItem.managerId = globalSetting.managerId;
                                                stageItem.trainerId = globalSetting.trainerId;
                                                stageItem.evaluationStartDate = moment(kendo.parseDate(stageItem.evaluationStartDate)).format('L LT')
                                                stageItem.evaluationEndDate = moment(kendo.parseDate(stageItem.evaluationEndDate)).format('L LT')
                                                if (index == 0) {
                                                    stageItem.emailNotification = globalSetting.softProfileStartEmailNotification;
                                                    stageItem.smsNotification = globalSetting.softProfileStartSmsNotification;

                                                    stageItem.startDateTime = moment(kendo.parseDate(stageItem.startDateTime)).format('L LT')
                                                    stageItem.endDateTime = moment(kendo.parseDate(stageItem.endDateTime)).format('L LT')
                                                    stageItem.greenAlarmTime = moment(kendo.parseDate(stageItem.greenAlarmTime)).format('L LT')
                                                    stageItem.yellowAlarmTime = moment(kendo.parseDate(stageItem.yellowAlarmTime)).format('L LT')
                                                    stageItem.redAlarmTime = moment(kendo.parseDate(stageItem.redAlarmTime)).format('L LT')


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

                                                    stageItem.finalScoreManagerStartNotificationTemplateId = globalSetting.softProfileStartFinalScoreManagerStartNotificationTemplateId;
                                                    stageItem.finalScoreManagerCompletedNotificationTemplateId = globalSetting.softProfileStartFinalScoreManagerCompletedNotificationTemplateId;
                                                    stageItem.finalScoreManagerResultsNotificationTemplateId = globalSetting.softProfileStartFinalScoreManagerResultsNotificationTemplateId;

                                                    stageItem.projectManagerStartNotificationTemplateId = globalSetting.softProfileStartProjectManagerStartNotificationTemplateId;
                                                    stageItem.projectManagerCompletedNotificationTemplateId = globalSetting.softProfileStartProjectManagerCompletedNotificationTemplateId;
                                                    stageItem.projectManagerResultsNotificationTemplateId = globalSetting.softProfileStartProjectManagerResultsNotificationTemplateId;


                                                    stageItem.greenAlarmParticipantTemplateId = globalSetting.softProfileStartGreenAlarmParticipantTemplateId;
                                                    stageItem.greenAlarmEvaluatorTemplateId = globalSetting.softProfileStartGreenAlarmEvaluatorTemplateId;
                                                    stageItem.greenAlarmManagerTemplateId = globalSetting.softProfileStartGreenAlarmManagerTemplateId;
                                                    stageItem.greenAlarmTrainerTemplateId = globalSetting.softProfileStartGreenAlarmTrainerTemplateId;
                                                    stageItem.greenAlarmProjectManagerTemplateId = globalSetting.softProfileStartGreenAlarmProjectManagerTemplateId;
                                                    stageItem.greenAlarmFinalScoreManagerTemplateId = globalSetting.softProfileStartGreenAlarmFinalScoreManagerTemplateId;

                                                    stageItem.yellowAlarmParticipantTemplateId = globalSetting.softProfileStartYellowAlarmParticipantTemplateId;
                                                    stageItem.yellowAlarmEvaluatorTemplateId = globalSetting.softProfileStartYellowAlarmEvaluatorTemplateId;
                                                    stageItem.yellowAlarmManagerTemplateId = globalSetting.softProfileStartYellowAlarmManagerTemplateId;
                                                    stageItem.yellowAlarmTrainerTemplateId = globalSetting.softProfileStartYellowAlarmTrainerTemplateId;
                                                    stageItem.yellowAlarmProjectManagerTemplateId = globalSetting.softProfileStartYellowAlarmProjectManagerTemplateId;
                                                    stageItem.yellowAlarmFinalScoreManagerTemplateId = globalSetting.softProfileStartYellowAlarmFinalScoreManagerTemplateId;

                                                    stageItem.redAlarmParticipantTemplateId = globalSetting.softProfileStartRedAlarmParticipantTemplateId;
                                                    stageItem.redAlarmEvaluatorTemplateId = globalSetting.softProfileStartRedAlarmEvaluatorTemplateId;
                                                    stageItem.redAlarmManagerTemplateId = globalSetting.softProfileStartRedAlarmManagerTemplateId;
                                                    stageItem.redAlarmTrainerTemplateId = globalSetting.softProfileStartRedAlarmTrainerTemplateId;
                                                    stageItem.redAlarmProjectManagerTemplateId = globalSetting.softProfileStartRedAlarmProjectManagerTemplateId;
                                                    stageItem.redAlarmFinalScoreManagerTemplateId = globalSetting.softProfileStartRedAlarmFinalScoreManagerTemplateId;


                                                }
                                                else {
                                                    if ($scope.projectInfo.projectDefaultNotificationSettings.length > 0) {

                                                        var projectDefaultNotificationSettings = $scope.projectInfo.projectDefaultNotificationSettings[0];

                                                        stageItem.emailNotification = projectDefaultNotificationSettings.emailNotification;
                                                        stageItem.smsNotification = projectDefaultNotificationSettings.smsNotification;

                                                        stageItem.startDateTime = moment(kendo.parseDate(stageItem.startDateTime)).format('L LT')
                                                        stageItem.endDateTime = moment(kendo.parseDate(stageItem.endDateTime)).format('L LT')
                                                        stageItem.greenAlarmTime = moment(kendo.parseDate(stageItem.greenAlarmTime)).format('L LT')
                                                        stageItem.yellowAlarmTime = moment(kendo.parseDate(stageItem.yellowAlarmTime)).format('L LT')
                                                        stageItem.redAlarmTime = moment(kendo.parseDate(stageItem.redAlarmTime)).format('L LT')

                                                        stageItem.externalStartNotificationTemplateId = projectDefaultNotificationSettings.participantsStartNotificationId;
                                                        stageItem.externalCompletedNotificationTemplateId = projectDefaultNotificationSettings.participantsCompletedNotificationId;
                                                        stageItem.externalResultsNotificationTemplateId = projectDefaultNotificationSettings.participantsResultNotificationId;
                                                        stageItem.evaluatorStartNotificationTemplateId = projectDefaultNotificationSettings.evaluatorsStartNotificationId;
                                                        stageItem.evaluatorCompletedNotificationTemplateId = projectDefaultNotificationSettings.evaluatorsCompletedNotificationId;
                                                        stageItem.evaluatorResultsNotificationTemplateId = projectDefaultNotificationSettings.evaluatorsResultNotificationId;
                                                        stageItem.trainerStartNotificationTemplateId = projectDefaultNotificationSettings.trainersStartNotificationId;
                                                        stageItem.trainerCompletedNotificationTemplateId = projectDefaultNotificationSettings.trainersCompletedNotificationId;
                                                        stageItem.trainerResultsNotificationTemplateId = projectDefaultNotificationSettings.trainersResultNotificationId;
                                                        stageItem.managerStartNotificationTemplateId = projectDefaultNotificationSettings.managersStartNotificationId;
                                                        stageItem.managerCompletedNotificationTemplateId = projectDefaultNotificationSettings.managersCompletedNotificationId;
                                                        stageItem.managerResultsNotificationTemplateId = projectDefaultNotificationSettings.managersResultNotificationId;


                                                        stageItem.finalScoreManagerStartNotificationTemplateId = projectDefaultNotificationSettings.finalScoreManagersStartNotificationId;
                                                        stageItem.finalScoreManagerCompletedNotificationTemplateId = projectDefaultNotificationSettings.finalScoreManagersCompletedNotificationId;
                                                        stageItem.finalScoreManagerResultsNotificationTemplateId = projectDefaultNotificationSettings.finalScoreManagersResultNotificationId;

                                                        stageItem.projectManagerStartNotificationTemplateId = projectDefaultNotificationSettings.projectManagersStartNotificationId;
                                                        stageItem.projectManagerCompletedNotificationTemplateId = projectDefaultNotificationSettings.projectManagersCompletedNotificationId;
                                                        stageItem.projectManagerResultsNotificationTemplateId = projectDefaultNotificationSettings.projectManagersResultNotificationId;


                                                        stageItem.greenAlarmParticipantTemplateId = projectDefaultNotificationSettings.participantGreenNotificationId;
                                                        stageItem.greenAlarmEvaluatorTemplateId = projectDefaultNotificationSettings.evaluatorGreenNotificationId;
                                                        stageItem.greenAlarmManagerTemplateId = projectDefaultNotificationSettings.managerGreenNotificationId;
                                                        stageItem.greenAlarmTrainerTemplateId = projectDefaultNotificationSettings.trainerGreenNotificationId;
                                                        stageItem.greenAlarmProjectManagerTemplateId = projectDefaultNotificationSettings.projectManagersGreenNotificationId;
                                                        stageItem.greenAlarmFinalScoreManagerTemplateId = projectDefaultNotificationSettings.finalScoreManagersGreenNotificationId;



                                                        stageItem.yellowAlarmParticipantTemplateId = projectDefaultNotificationSettings.participantYellowNotificationId;
                                                        stageItem.yellowAlarmEvaluatorTemplateId = projectDefaultNotificationSettings.evaluatorYellowNotificationId;
                                                        stageItem.yellowAlarmManagerTemplateId = projectDefaultNotificationSettings.managerYellowNotificationId;
                                                        stageItem.yellowAlarmTrainerTemplateId = projectDefaultNotificationSettings.trainerYellowNotificationId;
                                                        stageItem.yellowAlarmProjectManagerTemplateId = projectDefaultNotificationSettings.projectManagersYellowNotificationId;
                                                        stageItem.yellowAlarmFinalScoreManagerTemplateId = projectDefaultNotificationSettings.finalScoreManagersYellowNotificationId;

                                                        stageItem.redAlarmParticipantTemplateId = projectDefaultNotificationSettings.participantRedNotificationId;
                                                        stageItem.redAlarmEvaluatorTemplateId = projectDefaultNotificationSettings.evaluatorRedNotificationId;
                                                        stageItem.redAlarmManagerTemplateId = projectDefaultNotificationSettings.managerRedNotificationId;
                                                        stageItem.redAlarmTrainerTemplateId = projectDefaultNotificationSettings.trainerRedNotificationId;
                                                        stageItem.redAlarmProjectManagerTemplateId = projectDefaultNotificationSettings.projectManagersRedNotificationId;
                                                        stageItem.redAlarmFinalScoreManagerTemplateId = projectDefaultNotificationSettings.finalScoreManagersRedNotificationId;
                                                    }
                                                    else {
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


                                                            stageItem.finalScoreManagerStartNotificationTemplateId = globalSetting.softProfileShortGoalFinalScoreManagerStartNotificationTemplateId;
                                                            stageItem.finalScoreManagerCompletedNotificationTemplateId = globalSetting.softProfileShortGoalFinalScoreManagerCompletedNotificationTemplateId;
                                                            stageItem.finalScoreManagerResultsNotificationTemplateId = globalSetting.softProfileShortGoalFinalScoreManagerResultsNotificationTemplateId;

                                                            stageItem.projectManagerStartNotificationTemplateId = globalSetting.softProfileShortGoalProjectManagerStartNotificationTemplateId;
                                                            stageItem.projectManagerCompletedNotificationTemplateId = globalSetting.softProfileShortGoalProjectManagerCompletedNotificationTemplateId;
                                                            stageItem.projectManagerResultsNotificationTemplateId = globalSetting.softProfileShortGoalProjectManagerResultsNotificationTemplateId;


                                                            stageItem.greenAlarmParticipantTemplateId = globalSetting.softProfileShortGoalGreenAlarmParticipantTemplateId;
                                                            stageItem.greenAlarmEvaluatorTemplateId = globalSetting.softProfileShortGoalGreenAlarmEvaluatorTemplateId;
                                                            stageItem.greenAlarmManagerTemplateId = globalSetting.softProfileShortGoalGreenAlarmManagerTemplateId;
                                                            stageItem.greenAlarmTrainerTemplateId = globalSetting.softProfileShortGoalGreenAlarmTrainerTemplateId;
                                                            stageItem.greenAlarmProjectManagerTemplateId = globalSetting.softProfileShortGoalGreenAlarmProjectManagerTemplateId;
                                                            stageItem.greenAlarmFinalScoreManagerTemplateId = globalSetting.softProfileShortGoalGreenAlarmFinalScoreManagerTemplateId;



                                                            stageItem.yellowAlarmParticipantTemplateId = globalSetting.softProfileShortGoalYellowAlarmParticipantTemplateId;
                                                            stageItem.yellowAlarmEvaluatorTemplateId = globalSetting.softProfileShortGoalYellowAlarmEvaluatorTemplateId;
                                                            stageItem.yellowAlarmManagerTemplateId = globalSetting.softProfileShortGoalYellowAlarmManagerTemplateId;
                                                            stageItem.yellowAlarmTrainerTemplateId = globalSetting.softProfileShortGoalYellowAlarmTrainerTemplateId;
                                                            stageItem.yellowAlarmProjectManagerTemplateId = globalSetting.softProfileShortGoalYellowAlarmProjectManagerTemplateId;
                                                            stageItem.yellowAlarmFinalScoreManagerTemplateId = globalSetting.softProfileShortGoalYellowAlarmFinalScoreManagerTemplateId;

                                                            stageItem.redAlarmParticipantTemplateId = globalSetting.softProfileShortGoalRedAlarmParticipantTemplateId;
                                                            stageItem.redAlarmEvaluatorTemplateId = globalSetting.softProfileShortGoalRedAlarmEvaluatorTemplateId;
                                                            stageItem.redAlarmManagerTemplateId = globalSetting.softProfileShortGoalRedAlarmManagerTemplateId;
                                                            stageItem.redAlarmTrainerTemplateId = globalSetting.softProfileShortGoalRedAlarmTrainerTemplateId;
                                                            stageItem.redAlarmProjectManagerTemplateId = globalSetting.softProfileShortGoalRedAlarmProjectManagerTemplateId;
                                                            stageItem.redAlarmFinalScoreManagerTemplateId = globalSetting.softProfileShortGoalRedAlarmFinalScoreManagerTemplateId;


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


                                                            stageItem.finalScoreManagerStartNotificationTemplateId = globalSetting.softProfileMidGoalFinalScoreManagerStartNotificationTemplateId;
                                                            stageItem.finalScoreManagerCompletedNotificationTemplateId = globalSetting.softProfileMidGoalFinalScoreManagerCompletedNotificationTemplateId;
                                                            stageItem.finalScoreManagerResultsNotificationTemplateId = globalSetting.softProfileMidGoalFinalScoreManagerResultsNotificationTemplateId;

                                                            stageItem.projectManagerStartNotificationTemplateId = globalSetting.softProfileMidGoalProjectManagerStartNotificationTemplateId;
                                                            stageItem.projectManagerCompletedNotificationTemplateId = globalSetting.softProfileMidGoalProjectManagerCompletedNotificationTemplateId;
                                                            stageItem.projectManagerResultsNotificationTemplateId = globalSetting.softProfileMidGoalProjectManagerResultsNotificationTemplateId;

                                                            stageItem.greenAlarmParticipantTemplateId = globalSetting.softProfileMidGoalGreenAlarmParticipantTemplateId;
                                                            stageItem.greenAlarmEvaluatorTemplateId = globalSetting.softProfileMidGoalGreenAlarmEvaluatorTemplateId;
                                                            stageItem.greenAlarmManagerTemplateId = globalSetting.softProfileMidGoalGreenAlarmManagerTemplateId;
                                                            stageItem.greenAlarmTrainerTemplateId = globalSetting.softProfileMidGoalGreenAlarmTrainerTemplateId;
                                                            stageItem.greenAlarmProjectManagerTemplateId = globalSetting.softProfileMidGoalGreenAlarmProjectManagerTemplateId;
                                                            stageItem.greenAlarmFinalScoreManagerTemplateId = globalSetting.softProfileMidGoalGreenAlarmFinalScoreManagerTemplateId;


                                                            stageItem.yellowAlarmParticipantTemplateId = globalSetting.softProfileMidGoalYellowAlarmParticipantTemplateId;
                                                            stageItem.yellowAlarmEvaluatorTemplateId = globalSetting.softProfileMidGoalYellowAlarmEvaluatorTemplateId;
                                                            stageItem.yellowAlarmManagerTemplateId = globalSetting.softProfileMidGoalYellowAlarmManagerTemplateId;
                                                            stageItem.yellowAlarmTrainerTemplateId = globalSetting.softProfileMidGoalYellowAlarmTrainerTemplateId;
                                                            stageItem.yellowAlarmProjectManagerTemplateId = globalSetting.softProfileMidGoalYellowAlarmProjectManagerTemplateId;
                                                            stageItem.yellowAlarmFinalScoreManagerTemplateId = globalSetting.softProfileMidGoalYellowAlarmFinalScoreManagerTemplateId;


                                                            stageItem.redAlarmParticipantTemplateId = globalSetting.softProfileMidGoalRedAlarmParticipantTemplateId;
                                                            stageItem.redAlarmEvaluatorTemplateId = globalSetting.softProfileMidGoalRedAlarmEvaluatorTemplateId;
                                                            stageItem.redAlarmManagerTemplateId = globalSetting.softProfileMidGoalRedAlarmManagerTemplateId;
                                                            stageItem.redAlarmTrainerTemplateId = globalSetting.softProfileMidGoalRedAlarmTrainerTemplateId;
                                                            stageItem.redAlarmProjectManagerTemplateId = globalSetting.softProfileMidGoalRedAlarmProjectManagerTemplateId;
                                                            stageItem.redAlarmFinalScoreManagerTemplateId = globalSetting.softProfileMidGoalRedAlarmFinalScoreManagerTemplateId;


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

                                                            stageItem.finalScoreManagerStartNotificationTemplateId = globalSetting.softProfileLongTermGoalFinalScoreManagerStartNotificationTemplateId;
                                                            stageItem.finalScoreManagerCompletedNotificationTemplateId = globalSetting.softProfileLongTermGoalFinalScoreManagerCompletedNotificationTemplateId;
                                                            stageItem.finalScoreManagerResultsNotificationTemplateId = globalSetting.softProfileLongTermGoalFinalScoreManagerResultsNotificationTemplateId;

                                                            stageItem.projectManagerStartNotificationTemplateId = globalSetting.softProfileLongTermGoalProjectManagerStartNotificationTemplateId;
                                                            stageItem.projectManagerCompletedNotificationTemplateId = globalSetting.softProfileLongTermGoalProjectManagerCompletedNotificationTemplateId;
                                                            stageItem.projectManagerResultsNotificationTemplateId = globalSetting.softProfileLongTermGoalProjectManagerResultsNotificationTemplateId;

                                                            stageItem.greenAlarmParticipantTemplateId = globalSetting.softProfileLongTermGoalGreenAlarmParticipantTemplateId;
                                                            stageItem.greenAlarmEvaluatorTemplateId = globalSetting.softProfileLongTermGoalGreenAlarmEvaluatorTemplateId;
                                                            stageItem.greenAlarmManagerTemplateId = globalSetting.softProfileLongTermGoalGreenAlarmManagerTemplateId;
                                                            stageItem.greenAlarmTrainerTemplateId = globalSetting.softProfileLongTermGoalGreenAlarmTrainerTemplateId;
                                                            stageItem.greenAlarmProjectManagerTemplateId = globalSetting.softProfileLongTermGoalGreenAlarmProjectManagerTemplateId;
                                                            stageItem.greenAlarmFinalScoreManagerTemplateId = globalSetting.softProfileLongTermGoalGreenAlarmFinalScoreManagerTemplateId;

                                                            stageItem.yellowAlarmParticipantTemplateId = globalSetting.softProfileLongTermGoalYellowAlarmParticipantTemplateId;
                                                            stageItem.yellowAlarmEvaluatorTemplateId = globalSetting.softProfileLongTermGoalYellowAlarmEvaluatorTemplateId;
                                                            stageItem.yellowAlarmManagerTemplateId = globalSetting.softProfileLongTermGoalYellowAlarmManagerTemplateId;
                                                            stageItem.yellowAlarmTrainerTemplateId = globalSetting.softProfileLongTermGoalYellowAlarmTrainerTemplateId;
                                                            stageItem.yellowAlarmProjectManagerTemplateId = globalSetting.softProfileLongTermGoalYellowAlarmProjectManagerTemplateId;
                                                            stageItem.yellowAlarmFinalScoreManagerTemplateId = globalSetting.softProfileLongTermGoalYellowAlarmFinalScoreManagerTemplateId;

                                                            stageItem.redAlarmParticipantTemplateId = globalSetting.softProfileLongTermGoalRedAlarmParticipantTemplateId;
                                                            stageItem.redAlarmEvaluatorTemplateId = globalSetting.softProfileLongTermGoalRedAlarmEvaluatorTemplateId;
                                                            stageItem.redAlarmManagerTemplateId = globalSetting.softProfileLongTermGoalRedAlarmManagerTemplateId;
                                                            stageItem.redAlarmTrainerTemplateId = globalSetting.softProfileLongTermGoalRedAlarmTrainerTemplateId;
                                                            stageItem.redAlarmProjectManagerTemplateId = globalSetting.softProfileLongTermGoalRedAlarmProjectManagerTemplateId;
                                                            stageItem.redAlarmFinalScoreManagerTemplateId = globalSetting.softProfileLongTermGoalRedAlarmFinalScoreManagerTemplateId;


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
                                                            stageItem.greenAlarmProjectManagerTemplateId = globalSetting.softProfileFinalGoalGreenAlarmProjectManagerTemplateId;
                                                            stageItem.greenAlarmFinalScoreManagerTemplateId = globalSetting.softProfileFinalGoalGreenAlarmFinalScoreManagerTemplateId;

                                                            stageItem.finalScoreManagerStartNotificationTemplateId = globalSetting.softProfileFinalGoalFinalScoreManagerStartNotificationTemplateId;
                                                            stageItem.finalScoreManagerCompletedNotificationTemplateId = globalSetting.softProfileFinalGoalFinalScoreManagerCompletedNotificationTemplateId;
                                                            stageItem.finalScoreManagerResultsNotificationTemplateId = globalSetting.softProfileFinalGoalFinalScoreManagerResultsNotificationTemplateId;

                                                            stageItem.projectManagerStartNotificationTemplateId = globalSetting.softProfileFinalGoalProjectManagerStartNotificationTemplateId;
                                                            stageItem.projectManagerCompletedNotificationTemplateId = globalSetting.softProfileFinalGoalProjectManagerCompletedNotificationTemplateId;
                                                            stageItem.projectManagerResultsNotificationTemplateId = globalSetting.softProfileFinalGoalProjectManagerResultsNotificationTemplateId;


                                                            stageItem.greenAlarmParticipantTemplateId = globalSetting.softProfileFinalGoalGreenAlarmParticipantTemplateId;
                                                            stageItem.greenAlarmEvaluatorTemplateId = globalSetting.softProfileFinalGoalGreenAlarmEvaluatorTemplateId;
                                                            stageItem.greenAlarmManagerTemplateId = globalSetting.softProfileFinalGoalGreenAlarmManagerTemplateId;
                                                            stageItem.greenAlarmTrainerTemplateId = globalSetting.softProfileFinalGoalGreenAlarmTrainerTemplateId;
                                                            stageItem.yellowAlarmParticipantTemplateId = globalSetting.softProfileFinalGoalYellowAlarmParticipantTemplateId;
                                                            stageItem.yellowAlarmEvaluatorTemplateId = globalSetting.softProfileFinalGoalYellowAlarmEvaluatorTemplateId;
                                                            stageItem.yellowAlarmManagerTemplateId = globalSetting.softProfileFinalGoalYellowAlarmManagerTemplateId;
                                                            stageItem.yellowAlarmTrainerTemplateId = globalSetting.softProfileFinalGoalYellowAlarmTrainerTemplateId;
                                                            stageItem.yellowAlarmProjectManagerTemplateId = globalSetting.softProfileFinalGoalYellowAlarmProjectManagerTemplateId;
                                                            stageItem.yellowAlarmFinalScoreManagerTemplateId = globalSetting.softProfileFinalGoalYellowAlarmFinalScoreManagerTemplateId;

                                                            stageItem.redAlarmParticipantTemplateId = globalSetting.softProfileFinalGoalRedAlarmParticipantTemplateId;
                                                            stageItem.redAlarmEvaluatorTemplateId = globalSetting.softProfileFinalGoalRedAlarmEvaluatorTemplateId;
                                                            stageItem.redAlarmManagerTemplateId = globalSetting.softProfileFinalGoalRedAlarmManagerTemplateId;
                                                            stageItem.redAlarmTrainerTemplateId = globalSetting.softProfileFinalGoalRedAlarmTrainerTemplateId;
                                                            stageItem.redAlarmProjectManagerTemplateId = globalSetting.softProfileFinalGoalRedAlarmProjectManagerTemplateId;
                                                            stageItem.redAlarmFinalScoreManagerTemplateId = globalSetting.softProfileFinalGoalRedAlarmFinalScoreManagerTemplateId;

                                                        }
                                                    }
                                                }
                                            }
                                            else {

                                                stageItem.evaluationStartDate = moment(kendo.parseDate(stageItem.evaluationStartDate)).format('L LT')
                                                stageItem.evaluationEndDate = moment(kendo.parseDate(stageItem.evaluationEndDate)).format('L LT')
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
                                        $scope.setDefaults($scope.stageGroup.id);
                                    }
                                },
                                    function (data) {

                                    });
                            }

                        }, function (data) {
                        });

                    }
                    else {
                        // Edit
                        stageGroupManager.isStageGroupInUse($scope.stageGroup.id).then(function (data) {
                            if (data == true) {
                                //dialogService.showNotification($translate.instant('MYPROJECTS_STAGE_GROUP_CANNOT_BE_UPDATE') + ' ' + $translate.instant('MYPROJECTS_THIS_STAGE_GROUP_IS_ALREADY_IN_USE'), 'warning');
                                var clonnedStageGroup = _.clone($scope.stageGroup);
                                clonnedStageGroup.startDate = kendo.parseDate(clonnedStageGroup.startDate);
                                clonnedStageGroup.endDate = kendo.parseDate(clonnedStageGroup.endDate);
                                stageGroupManager.updateStageGroupBasicInfo(clonnedStageGroup).then(function (data) {
                                    dialogService.showNotification($translate.instant('SOFTPROFILE_STAGE_GROUP_BASIC_INFO_UPDATE'), 'info');
                                })

                            } else {
                                dialogService.showYesNoDialog($translate.instant('COMMON_CONFIRM'), $translate.instant('MYPROJECTS_ARE_YOU_SURE_YOU_WANT_TO_UPDATE')).then(function () {
                                    var stageGroup = angular.copy($scope.stageGroup);
                                    stageGroup.stages = [];
                                    stageGroup.profiles = [];
                                    var profile = angular.copy($scope.profile);
                                    stageGroup["profiles"] = [profile];
                                    stageGroup.startDate = kendo.parseDate(stageGroup.startDate);
                                    stageGroup.endDate = kendo.parseDate(stageGroup.endDate);
                                    stageGroup.startStageStartDate = kendo.parseDate(stageGroup.startStageStartDate);
                                    stageGroup.startStageEndDate = kendo.parseDate(stageGroup.startStageEndDate);
                                    stageGroup.milestoneStartDate = kendo.parseDate(stageGroup.milestoneStartDate);
                                    stageGroup.milestoneEndDate = kendo.parseDate(stageGroup.milestoneEndDate);
                                    apiService.update('stageGroups', stageGroup).then(function (data) {
                                        if (data) {
                                            apiService.getById("profiles/getFullProfileById", $stateParams.profileId, "").then(function (profileDatail) {
                                                var profile = profileDatail;
                                                _.each(profile.performanceGroups, function (pgItem) {
                                                    _.each(pgItem.link_PerformanceGroupSkills, function (link_PerformanceGroupSkillItem) {
                                                        link_PerformanceGroupSkillItem.name = link_PerformanceGroupSkillItem.skill.name;
                                                        link_PerformanceGroupSkillItem.description = link_PerformanceGroupSkillItem.skill.description;
                                                        _.each(link_PerformanceGroupSkillItem.questions, function (questionsItem) {
                                                            questionsItem["skillId"] = link_PerformanceGroupSkillItem.id;
                                                        });
                                                    });
                                                });
                                                _.each(profile.stageGroups, function (sgItem) {
                                                    sgItem.startDate = moment(kendo.parseDate(sgItem.startDate)).format('L LT');
                                                    sgItem.endDate = moment(kendo.parseDate(sgItem.endDate)).format('L LT');
                                                    if (sgItem.startStageStartDate) {
                                                        sgItem.startStageStartDate = moment(kendo.parseDate(sgItem.startStageStartDate)).format('L LT');
                                                    }
                                                    if (sgItem.startStageEndDate) {
                                                        sgItem.startStageEndDate = moment(kendo.parseDate(sgItem.startStageEndDate)).format('L LT');
                                                    }
                                                    if (sgItem.milestoneStartDate) {
                                                        sgItem.milestoneStartDate = moment(kendo.parseDate(sgItem.milestoneStartDate)).format('L LT');
                                                    }
                                                    if (sgItem.milestoneEndDate) {
                                                        sgItem.milestoneEndDate = moment(kendo.parseDate(sgItem.milestoneEndDate)).format('L LT');
                                                    }
                                                    _.each(sgItem.stages, function (stageItem) {
                                                        stageItem.startDateTime = moment(kendo.parseDate(stageItem.startDateTime)).format('L LT');
                                                        stageItem.endDateTime = moment(kendo.parseDate(stageItem.endDateTime)).format('L LT');
                                                        stageItem.redAlarmTime = moment(kendo.parseDate(stageItem.redAlarmTime)).format('L LT');
                                                        stageItem.yellowAlarmTime = moment(kendo.parseDate(stageItem.yellowAlarmTime)).format('L LT');
                                                        stageItem.greenAlarmTime = moment(kendo.parseDate(stageItem.greenAlarmTime)).format('L LT');

                                                        if (stageItem.evaluationStartDate != null) {
                                                            stageItem.evaluationStartDate = moment(kendo.parseDate(stageItem.evaluationStartDate)).format('L LT');
                                                        }
                                                        if (stageItem.evaluationEndDate != null) {
                                                            stageItem.evaluationEndDate = moment(kendo.parseDate(stageItem.evaluationEndDate)).format('L LT');
                                                        }
                                                    });
                                                    var sortedStages = _.sortByOrder(sgItem.stages, function (o) { return new moment(kendo.parseDate(o.startDate)).format('L LT'); }, ['asc']);
                                                    sgItem.stages = sortedStages;
                                                });
                                                $scope.profile = profile;
                                                $scope.profileType = profile.profileTypeId;
                                                dialogService.showNotification($translate.instant('MYPROJECTS_PROJECTPROFILES_STAGE_GROUP_UPDATED_SUCCESSFULLY'), "success");
                                            }, function () {
                                            })
                                        }
                                        else {
                                            dialogService.showNotification($translate.instant('MYPROJECTS_PROJECTPROFILES_STAGE_GROUP_UPDATE_FAILED'), "warning");
                                        }
                                    }, function (error) {
                                        dialogService.showNotification(error, "warning")
                                    })
                                })


                            }
                        })
                    }
                    $("#stageGroupModal").modal("hide");
                }
            }
            function onUserAssignGridDataBound(e) {
                var grid = e.sender;
                if (grid.dataSource.total() == 0) {
                    var colCount = grid.columns.length;
                    $(e.sender.wrapper)
                        .find('tbody')
                        .append('<tr class="kendo-data-row"><td colspan="' + colCount + '" class="no-data">There is no data to show in the grid.</td></tr>');
                }
            };
            $scope.historyOfSurveysOptions = {
                dataBound: onUserAssignGridDataBound,
                dataSource: {
                    type: "json",
                    data: $scope.stages,
                    pageSize: 10,
                    sort: {
                        field: "startDateTime",
                        dir: "asc"
                    },
                    filter: [{ field: "startDateTime", operator: "lt", value: moment().format('L LT') }],
                },
                columnMenu: false,
                filterable: false,
                pageable: true,
                sortable: true,
                columns: [
                    {
                        field: "name", title: $translate.instant('COMMON_NAME'), width: "10%", template: function (dataItem) {
                            return "<div>" + dataItem.name + "</div>"
                        }
                    },
                    {
                        field: "startDateTime", title: $translate.instant('COMMON_START_DATE'), width: "12%", template: function (dataItem) {
                            return moment(kendo.parseDate(dataItem.startDateTime)).format('L LT');
                        }
                    },
                    {
                        field: "endDateTime", title: $translate.instant('COMMON_DUE_DATE'), width: "12%", template: function (dataItem) {
                            return moment(kendo.parseDate(dataItem.endDateTime)).format('L LT');
                        }
                    },
                    { field: "name", title: $translate.instant('SOFTPROFILE_HISTORY_STEP'), width: "12%" },
                ],
            };
            $scope.tooltipOptions = {
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
            };

        }])
    ;