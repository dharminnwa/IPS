
angular.module('ips.profiles')

    .config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
        $stateProvider
            .state('profileSendOut', {
                url: "/profileSendOut/:profileId",
                templateUrl: "views/profileSendOut/views/profileSendOut.html",
                resolve: {
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
                            return null;
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
                },
                controller: 'profileSendOutCtrl',
                data: {
                    displayName: '{{pageName}}',
                    paneLimit: 1,
                    depth: 2
                }
            });

    }])

    .controller('profileSendOutCtrl', ['$scope', '$location', 'cssInjector', 'authService', 'profilesService', '$compile', 'apiService', 'stageGroupManager',
        '$stateParams', '$state', 'dialogService', 'projectPhasesEnum', 'phasesLevelEnum', 'profileTypeEnum', 'notificationTemplates', 'durationMetrics',
        'localStorageService', 'profile', 'projectInfo', 'templateTypeEnum', 'stageTypesEnum', 'evaluationRolesEnum', 'stateTypesEnum', 'globalVariables', '$translate',
        function ($scope, $location, cssInjector, authService, profilesService, $compile, apiService, stageGroupManager,
            $stateParams, $state, dialogService,
            projectPhasesEnum, phasesLevelEnum, profileTypeEnum, notificationTemplates, durationMetrics, localStorageService, profile, projectInfo, templateTypeEnum, stageTypesEnum, evaluationRolesEnum, stateTypesEnum, globalVariables, $translate) {
            cssInjector.removeAll();
            //cssInjector.add('css/components.min.css');
            //cssInjector.add('css/default.min.css');
            cssInjector.add('views/softprofilewizard/softprofilewizard.css');
            moment.locale(globalVariables.lang.currentUICulture);
            var authData = localStorageService.get('authorizationData');
            $scope.currentUser = authData.user;
            $scope.defaultProjectId = 0;
            $scope.projectPhasesEnum = projectPhasesEnum;
            $scope.phasesLevelEnum = phasesLevelEnum;
            $scope.notificationTemplates = notificationTemplates;
            $scope.durationMetrics = durationMetrics;
            //Profile Setup
            $scope.profile = null;
            $scope.projectInfo = projectInfo;
            if (profile != null) {
                $scope.profile = profile;
                $scope.profileType = profile.profileTypeId;
                $scope.defaultProjectId = profile.projectId;
                if ($scope.profile.scaleId > 0) {
                    profilesService.getScaleById($scope.profile.scaleId).then(function (scaledata) {
                        $scope.scale = scaledata;
                        $scope.profile.scale = scaledata;
                    }, function () { });
                    //$scope.scaleUpdate($scope.profile.scaleId)
                }

                profilesService.getProjectById($scope.profile.projectId).then(function (data) {
                    $scope.projectInfo = data;
                    //$scope.setprofiletype($scope.profile.profileTypeId);
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
                })




            }

            $scope.init = function () {
                $('#form_sendout_wizard').bootstrapWizard({
                    'nextSelector': '.button-next',
                    'previousSelector': '.button-previous',
                    onTabClick: function (tab, navigation, index, clickedIndex) {
                        if (index == 0) {
                            if (!($scope.profile.stageGroups.length > 0)) {
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
                        else if (index == 1) {
                            if ($scope.checkMilestoneDatesAreValid()) {
                                return true;
                            }
                            else {
                                dialogService.showNotification($translate.instant('MYPROJECTS_PERFORMANCE_EVALUATION_DATES_ARE_NOT_VALID') + " " + $translate.instant('MYPROJECTS_PLEASE_CORRECT_THEM'), "error");
                                return false;
                            }
                        }
                        else if (clickedIndex == 2) {

                        }
                        else {
                            //$scope.handleTitle(tab, navigation, index);
                        }
                    },
                    onNext: function (tab, navigation, index) {
                        if (index == 1) {
                            if (!($scope.profile.stageGroups.length > 0)) {
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
                        else if (index == 2) {
                            if ($scope.checkMilestoneDatesAreValid()) {
                                return true;
                            }
                            else {
                                dialogService.showNotification($translate.instant('MYPROJECTS_PERFORMANCE_EVALUATION_ARE_NOT_VALID') + " " + $translate.instant('MYPROJECTS_PLEASE_CORRECT_THEM'), "error");
                                return false;
                            }
                        }
                        else if (index == 3) {

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
                        $('#form_sendout_wizard').find('.progress-bar').css({
                            width: $percent + '%'
                        });
                        $(".popovers").popover();
                        $scope.setIndex(current);
                        if (current == 3) {
                            $scope.setDefaultsRecurrentTrainningSetting();
                        }
                    }
                });
            }

            $scope.getProfileTypeName = getProfileTypeName;
            function getProfileTypeName(profilesTypeId) {
                if (profilesTypeId == profileTypeEnum.Soft) {
                    return "Soft Profile";
                }
                else if (profilesTypeId == profileTypeEnum.knowledgetest) {
                    return "Knowledge Profile";
                }
                else if (profilesTypeId == profileTypeEnum.Hard) {
                    return "Hard Profile";
                }
                else {
                    return "";
                }
            }
            $scope.getEvaluationRole = getEvaluationRole;
            function getEvaluationRole(evaluationRoleId) {
                switch (evaluationRoleId) {
                    case 1:
                        return 'Evaluator';
                        break;
                    case 2:
                        return 'Participant';
                        break;
                    default:
                        return '';
                }
            }
            $scope.isSetFinalKPIAllowed = isSetFinalKPIAllowed;
            function isSetFinalKPIAllowed(isFinalKPISet, isSurveyPassed, iskpiSet, isScoreManager, isSelfEvaluation, isParticipantPassedSurvey, profileTypeId) {
                return (profileTypeId == profileTypeEnum.Soft || profileTypeId == profileTypeEnum.Hard) && !isFinalKPISet && isSurveyPassed && iskpiSet && (isScoreManager || isSelfEvaluation) && isParticipantPassedSurvey;
            }


            $scope.isKnowledge = function (profileTypeId) {
                return (profileTypeId == profileTypeEnum.knowledgetest);
            };

            $scope.goToDevContract = goToDevContract;
            function goToDevContract(profileId, stageId, participantId, evaluateeId) {
                $location.path("/home/previewFinalKPI/" + profileId + "/" + stageId + "/" + participantId + "/" + evaluateeId + "/devContract");
            }
            $scope.setIndex = function (current) {
                $scope.currentStepIndex = current;
                if (current == 1) {
                    $scope.currentStepIndex = 1;
                    $('#form_sendout_wizard').find('.button-previous').hide();
                } else {
                    $scope.currentStepIndex = current;
                    $('#form_sendout_wizard').find('.button-previous').show();
                }
                if (current >= 3) {
                    $('#form_sendout_wizard').find('.button-next').hide();
                    $('#form_sendout_wizard').find('.button-submit').show();
                } else {
                    $('#form_sendout_wizard').find('.button-next').show();
                    $('#form_sendout_wizard').find('.button-submit').hide();
                }
            }

            //send out

            $scope.sendOutTotalDiffrence = {
                months: 0,
                weeks: 0,
                days: 0,
                hours: 0,
                minutes: 0,
            }

            $scope.sendOutMilestoneDiffrence = {
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
                datepicker.setOptions({
                    min: kendo.parseDate($scope.projectInfo.expectedStartDate),
                    max: kendo.parseDate($scope.projectInfo.expectedEndDate)
                });
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
                    actualTimeSpan: 0,
                    totalMilestones: 5,
                    stages: [],
                    startStageStartDate: moment(kendo.parseDate($scope.projectInfo.expectedStartDate)).format('L LT'),
                    startStageEndDate: moment(kendo.parseDate($scope.projectInfo.expectedStartDate)).add("days", 7).format('L LT'),
                    milestoneStartDate: moment(kendo.parseDate($scope.projectInfo.expectedStartDate)).add("days", 7).format('L LT'),
                    milestoneEndDate: moment(kendo.parseDate($scope.projectInfo.expectedEndDate)).format('L LT'),
                }


                var globalSetting = null;
                if ($scope.projectInfo.projectGlobalSettings.length > 0) {
                    globalSetting = $scope.projectInfo.projectGlobalSettings[0];
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
                        //$scope.stageGroup.actualTimeSpan = globalSetting.softProfileActualTimeSpan,
                        //$scope.stageGroup.monthsSpan = globalSetting.softProfileMonthSpan;
                        //$scope.stageGroup.weeksSpan = globalSetting.softProfileWeekSpan;
                        //$scope.stageGroup.daysSpan = globalSetting.softProfileDaySpan;
                        //$scope.stageGroup.hoursSpan = globalSetting.softProfileHourSpan;
                        //$scope.stageGroup.minutesSpan = globalSetting.softProfileMinuteSpan;

                        //var duration = moment.duration(globalSetting.softProfileActualTimeSpan);
                        //$scope.sendOutMilestoneDiffrence = {
                        //    months: duration.months(),
                        //    weeks: duration.weeks(),
                        //    days: duration.days(),
                        //    hours: duration.hours(),
                        //    minutes: duration.minutes(),
                        //}
                        //if (duration.years() > 0) {
                        //    $scope.sendOutMilestoneDiffrence.months = $scope.sendOutMilestoneDiffrence.months + (duration.years() * 12);
                        //}
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
            $scope.statusOfStages = [];
            $scope.fpStatusOfStages = [];

            $scope.profileTypeEnum = profileTypeEnum;
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
            $scope.RCTNotificationStageId = 0;
            $scope.changeRCTNotificationStage = function (stageGroupId, stageId) {
                _.each($scope.profile.stageGroups, function (stageGroupItem) {
                    if (stageGroupItem.id == stageGroupId) {
                        _.each(stageGroupItem.stages, function (stageItem) {
                            if (stageItem.id == stageId) {
                                $scope.RCTNotificationStageId = stageId;


                            }
                        });
                        _.each(stageGroupItem.userRecurrentNotificationSettings, function (userRecurrentNotificationSettingItem) {
                            if (!userRecurrentNotificationSettingItem.id > 0) {
                                if (userRecurrentNotificationSettingItem.stageId == stageId) {
                                    if ($scope.projectInfo.projectGlobalSettings.length > 0) {
                                        globalSetting = $scope.projectInfo.projectGlobalSettings[0];

                                        if ($scope.profile.profileTypeId == profileTypeEnum.Knowledge) {
                                            userRecurrentNotificationSettingItem.howMany = globalSetting.knowledgeProfileHowMany;
                                            userRecurrentNotificationSettingItem.metricId = globalSetting.knowledgeProfileMetricId;
                                            userRecurrentNotificationSettingItem.howManySet = globalSetting.knowledgeProfileHowManySets;
                                            userRecurrentNotificationSettingItem.howManyActions = globalSetting.knowledgeProfileHowManyActions;
                                            userRecurrentNotificationSettingItem.recurrentTrainningFrequency = globalSetting.knowledgeProfileRecurrentTrainingTimeSpan;
                                            userRecurrentNotificationSettingItem.emailNotification = globalSetting.knowledgeProfileEmailNotification;
                                            userRecurrentNotificationSettingItem.smsNotification = globalSetting.knowledgeProfileSmsNotification;
                                        }
                                        else {
                                            if (userRecurrentNotificationSettingItem.howMany == null) {
                                                userRecurrentNotificationSettingItem.howMany = globalSetting.softProfileHowMany;
                                            }
                                            if (userRecurrentNotificationSettingItem.metricId == null) {
                                                userRecurrentNotificationSettingItem.metricId = globalSetting.softProfileMetricId;
                                            }
                                            if (userRecurrentNotificationSettingItem.howManySet == null) {
                                                userRecurrentNotificationSettingItem.howManySet = globalSetting.softProfileHowManySets;
                                            }
                                            if (userRecurrentNotificationSettingItem.howManyActions == null) {
                                                userRecurrentNotificationSettingItem.howManyActions = globalSetting.softProfileHowManyActions;
                                            }
                                            if (userRecurrentNotificationSettingItem.recurrentTrainningFrequency == null) {
                                                userRecurrentNotificationSettingItem.recurrentTrainningFrequency = globalSetting.softProfileRecurrentTrainingTimeSpan;
                                            }
                                            if (userRecurrentNotificationSettingItem.emailNotification == null) {
                                                userRecurrentNotificationSettingItem.emailNotification = globalSetting.softProfileStartEmailNotification;
                                            }
                                            if (userRecurrentNotificationSettingItem.smsNotification == null) {
                                                userRecurrentNotificationSettingItem.smsNotification = globalSetting.softProfileStartSmsNotification;
                                            }
                                        }

                                        $("#recurency_" + stageId).find("#recurrenceEditor").data("kendoRecurrenceEditor").value(userRecurrentNotificationSettingItem.recurrentTrainningFrequency);
                                    }
                                }


                            }
                        })


                    }
                });

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

                        $scope.stageGroup.stages[index].evaluationStartDate = moment(kendo.parseDate($scope.stageGroup.stages[index].startDateTime)).format('L LT');
                        $scope.stageGroup.stages[index].evaluationEndDate = moment(kendo.parseDate($scope.stageGroup.stages[index].endDateTime)).format('L LT');
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

                        $scope.stageGroup.stages[index].evaluationStartDate = moment(kendo.parseDate($scope.stageGroup.stages[index].endDateTime)).add('days', -5).format('L LT');
                        $scope.stageGroup.stages[index].evaluationEndDate = moment(kendo.parseDate($scope.stageGroup.stages[index].endDateTime)).format('L LT');


                        if (index == ($scope.stageGroup.stages.length - 1)) {
                            $scope.stageGroup.endDate = moment(kendo.parseDate($scope.stageGroup.stages[index].endDateTime)).format('L LT');
                        }
                    }
                });

            }
            $scope.goToNotificationTemplate = function (id) {
                if (id) {
                    var template = _.find(notificationTemplates, function (item) {
                        return item.id == id;
                    })
                    if (template) {
                        $location.path("/home/notificationTemplates/" + template.organizationId + "/edit/" + id);

                    }
                }
            }
            $scope.isDateTimeValid = function (date, isRequered) {
                if (isRequered) {
                    return datetimeCalculator.isValidDatePatern(date, 'L LT');
                } else {
                    return !date || datetimeCalculator.isValidDatePatern(date, 'L LT');
                }
            };

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
                var filterTemplate = _.find(notificationTemplates, function (item) {
                    return item.culture.cultureName == globalVariables.lang.currentUICulture && item.stageTypeId == stageTypesEnum.Milestone && item.notificationTemplateTypeId == templateTypeEnum.MilestoneResultNotification && item.evaluationRoleId == evaluationRolesEnum.manager && item.isDefualt == true;
                });
                if (filterTemplate) {
                    return filterTemplate.id;
                }
                else {
                    var filterTemplate = _.find(notificationTemplates, function (item) {
                        return item.stageTypeId == stageTypesEnum.Milestone && item.notificationTemplateTypeId == templateTypeEnum.MilestoneResultNotification && item.evaluationRoleId == evaluationRolesEnum.manager && item.isDefualt == true;
                    });
                    if (filterTemplate) {
                        return filterTemplate.id;
                    }
                }
            }
            $scope.setEvaluatorResultNotificationTemplates = function () {
                var filterTemplate = _.find(notificationTemplates, function (item) {
                    return item.culture.cultureName == globalVariables.lang.currentUICulture && item.stageTypeId == stageTypesEnum.Milestone && item.notificationTemplateTypeId == templateTypeEnum.MilestoneResultNotification && item.evaluationRoleId == evaluationRolesEnum.evaluator && item.isDefualt == true;
                });
                if (filterTemplate) {
                    return filterTemplate.id;
                }
                else {
                    var filterTemplate = _.find(notificationTemplates, function (item) {
                        return item.stageTypeId == stageTypesEnum.Milestone && item.notificationTemplateTypeId == templateTypeEnum.MilestoneResultNotification && item.evaluationRoleId == evaluationRolesEnum.evaluator && item.isDefualt == true;
                    });
                    if (filterTemplate) {
                        return filterTemplate.id;
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
            $scope.restoreDefault = function (stageGroupId) {
                dialogService.showYesNoDialog($translate.instant('COMMON_CONFIRM'), $translate.instant('MYPROJECTS_ARE_YOU_SURE_WANT_TO_RESTORE_NOTIFICATION_SETTINGS')).then(function () {
                    $scope.setDefaults(stageGroupId);
                });
            }
            //participants
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


            //Recurrent 
            $scope.newUserRecurrentNotificationSetting = {
                id: 0,
                stageGroupId: 0,
                stageId: 0,
                userId: 0,
                emailNotification: false,
                sMSNotification: false,
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
                recurrentTrainningFrequency: null,
                personalTrainingReminderNotificationTemplateId: null,
                profileTrainingReminderNotificationTemplateId: null,
                howMany: null,
                metricId: null,
                howManySet: null,
                howManyActions: null,
            }
            $scope.saveRecurrentSetting = function (stageGroupId) {
                if (stageGroupId > 0) {
                    var stageGroupsObj = _.find(profile.stageGroups, function (stageGroupItem) {
                        return stageGroupItem.id == stageGroupId;
                    })
                    if (stageGroupsObj.userRecurrentNotificationSettings.length > 0) {
                        var rctNotificationSetting = _.find(stageGroupsObj.userRecurrentNotificationSettings, function (item) {
                            return item.stageId == $scope.RCTNotificationStageId;
                        });
                        $scope.newUserRecurrentNotificationSetting = angular.copy(rctNotificationSetting);
                        $scope.newUserRecurrentNotificationSetting.stageGroupId = stageGroupId;
                    }
                    if ($scope.newUserRecurrentNotificationSetting.id > 0) {
                        $scope.updateRecurrentNotificationSetting();
                    }
                    else {
                        $scope.saveRecurrentNotificationSetting();
                    }
                }
                else {
                    if ($scope.formUserRecurrentNotificationSetting.$valid) {
                        if ($scope.formUserRecurrentNotificationSetting.$dirty) {
                            _.each(profile.stageGroups, function (stageGroup, index) {
                                if (stageGroup.userRecurrentNotificationSettings.length > 0) {
                                    $scope.newUserRecurrentNotificationSetting = angular.copy(stageGroup.userRecurrentNotificationSettings[0]);
                                    $scope.newUserRecurrentNotificationSetting.stageGroupId = stageGroup.id;
                                }
                                if ($scope.newUserRecurrentNotificationSetting.id > 0) {

                                    $scope.updateRecurrentNotificationSetting();
                                }
                                else {
                                    $scope.newUserRecurrentNotificationSetting = angular.copy(stageGroup.userRecurrentNotificationSettings[0]);
                                    $scope.newUserRecurrentNotificationSetting.stageGroupId = stageGroup.id;
                                    $scope.saveRecurrentNotificationSetting(stageGroup.id);
                                }

                            })
                        }
                        else {
                            if (!$scope.projectInfo.isActive) {
                                dialogService.showYesNoDialog($translate.instant('COMMON_CONFIRM'), $translate.instant('MYPROJECTS_DO_YOU_WANT_TO') + " " + $translate.instant('MYPROJECTS_START_THE_PROJECT_NOW') + "?</br>" + $translate.instant('MYPROJECTS_IT_WILL_SEND_OUT_INVITATIONS_TO_RUN_THE_PROFILES_TO_ALL_SELECTED_USERS') + " " + $translate.instant('MYPROJECTS_IF_NOT_YOU_MAY_AT_ANY_TIME_LOG_INTO') + " '" + $translate.instant('MYPROJECTS_MY_PROJECTS') + "' " + $translate.instant('MYPROJECTS_IN_THE_UPPER_RIGHT_CORNER_BELOW_YOUR_NAME_TO_MANAGE_YOUR_PROJECTS') + "</br>" + $translate.instant('MYPROJECTS_THANK_YOU')).then(function () {
                                    ///project/Start/

                                    return apiService.getById("project/Start", $scope.defaultProjectId, "").then(function (data) {

                                    })

                                });
                            }
                            else {
                                dialogService.showYesNoDialog($translate.instant('COMMON_CONFIRM'), $translate.instant('MYPROJECTS_YOU_HAVE_ALREADY_STARTED_THIS_PROJECT') + " " + $translate.instant('MYPROJECTS_DO_YOU_WANT_TO_MOVE_ON_MEASURE_THIS_PROJECT')).then(function () {

                                })
                            }
                        }
                    }
                    else {
                        dialogService.showNotification($translate.instant('MYPROJECTS_PLEASE_ENTER_REQUIRED_FIELDS'), "error");
                    }
                }
            }
            $scope.saveRecurrentNotificationSetting = function () {
                stageGroupManager.addRecurrentTrainingSetting($scope.newUserRecurrentNotificationSetting).then(function (data) {
                    if (data.id > 0) {
                        var stageGroupsObj = _.find(profile.stageGroups, function (stageGroupItem) {
                            return stageGroupItem.id == $scope.newUserRecurrentNotificationSetting.stageGroupId;
                        })
                        if (stageGroupsObj.userRecurrentNotificationSettings.length > 0) {
                            _.each(stageGroupsObj.userRecurrentNotificationSettings, function (item) {
                                if (item.stageId == data.stageId) {
                                    item.id = data.id;
                                }
                            });
                        }
                        dialogService.showNotification($translate.instant('MYPROJECTS_RECURRENT_TRAINING_SETTING_SAVED_SUCCESSFULLY'), "success");
                        if (!$scope.projectInfo.isActive) {
                            dialogService.showYesNoDialog($translate.instant('COMMON_CONFIRM'), $translate.instant('MYPROJECTS_DO_YOU_WANT_TO') + $translate.instant('MYPROJECTS_START_THE_PROJECT_NOW') + "?</br>" + $translate.instant('MYPROJECTS_IT_WILL_SEND_OUT_INVITATIONS_TO_RUN_THE_PROFILES_TO_ALL_SELECTED_USERS') + " " + $translate.instant('MYPROJECTS_IF_NOT_YOU_MAY_AT_ANY_TIME_LOG_INTO') + " '" + $translate.instant('MYPROJECTS_MY_PROJECTS') + "' " + $translate.instant('MYPROJECTS_IN_THE_UPPER_RIGHT_CORNER_BELOW_YOUR_NAME_TO_MANAGE_YOUR_PROJECTS') + $translate.instant('MYPROJECTS_THANK_YOU')).then(function () {
                                ///project/Start/

                                return apiService.getById("project/Start", $scope.defaultProjectId, "").then(function (data) {

                                })

                            });
                        }
                        else {
                            dialogService.showYesNoDialog($translate.instant('COMMON_CONFIRM'), $translate.instant('MYPROJECTS_YOU_HAVE_ALREADY_STARTED_THIS_PROJECT') + " " + $translate.instant('MYPROJECTS_DO_YOU_WANT_TO_MOVE_ON_MEASURE_THIS_PROJECT')).then(function () {

                            })
                        }

                    }
                    else {
                        dialogService.showNotification($translate.instant('MYPROJECTS_RECURRENT_TRAINING_SETTING_SAVE_FAILED'), "error");
                    }
                })
            }

            $scope.updateRecurrentNotificationSetting = function () {
                stageGroupManager.updateRecurrentTrainingSetting($scope.newUserRecurrentNotificationSetting).then(function (data) {
                    if (data > 0) {
                        dialogService.showNotification($translate.instant('MYPROJECTS_RECURRENT_TRAINING_SETTING_UPDATED_SUCCESSFULLY'), "success");
                        if (!$scope.projectInfo.isActive) {
                            dialogService.showYesNoDialog($translate.instant('COMMON_CONFIRM'), $translate.instant('MYPROJECTS_DO_YOU_WANT_TO') + " '" + $translate.instant('MYPROJECTS_START_THE_PROJECT_NOW') + "'?</br>" + $translate.instant('MYPROJECTS_IT_WILL_SEND_OUT_INVITATIONS_TO_RUN_THE_PROFILES_TO_ALL_SELECTED_USERS') + " " + $translate.instant('MYPROJECTS_IF_NOT_YOU_MAY_AT_ANY_TIME_LOG_INTO') + " '" + $translate.instant('MYPROJECTS_MY_PROJECTS') + "' " + $translate.instant('MYPROJECTS_IN_THE_UPPER_RIGHT_CORNER_BELOW_YOUR_NAME_TO_MANAGE_YOUR_PROJECTS') + " " + $translate.instant('MYPROJECTS_THANK_YOU')).then(function () {
                                return apiService.getById("project/Start", $scope.defaultProjectId, "").then(function (data) {
                                    dialogService.showNotification("Project has been started", "success");
                                })
                            });
                        }
                        else {
                            dialogService.showYesNoDialog($translate.instant('COMMON_CONFIRM'), $translate.instant('MYPROJECTS_YOU_HAVE_ALREADY_STARTED_THIS_PROJECT') + " " + $translate.instant('MYPROJECTS_DO_YOU_WANT_TO_MOVE_ON_MEASURE_THIS_PROJECT')).then(function () {

                            })
                        }

                    }
                    else {
                        dialogService.showNotification($translate.instant('MYPROJECTS_RECURRENT_TRAINING_SETTING_UPDATE_FAILED'), "error");
                    }
                })
            }



            //notificationTemplate Rules


            $scope.recurrentPersonalTrainingTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if (item.notificationTemplateTypeId == templateTypeEnum.PersonalTrainingNotification) {
                    return true;
                }
                else {
                    return false;
                }
            }


            $scope.recurrentProfileTrainingStartEvaluatorTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if (item.notificationTemplateTypeId == templateTypeEnum.RecurrentTrainingNotification && item.evaluationRoleId == evaluationRolesEnum.evaluator) {
                    return true;
                }
                else {
                    return false;
                }
            }
            $scope.recurrentProfileTrainingStartParticipantTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if (item.notificationTemplateTypeId == templateTypeEnum.RecurrentTrainingNotification && item.evaluationRoleId == evaluationRolesEnum.participant) {
                    return true;
                }
                else {
                    return false;
                }
            }
            $scope.recurrentProfileTrainingStartManagerTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if (item.notificationTemplateTypeId == templateTypeEnum.RecurrentTrainingNotification && item.evaluationRoleId == evaluationRolesEnum.manager) {
                    return true;
                }
                else {
                    return false;
                }
            }
            $scope.recurrentProfileTrainingStartTrainerTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if (item.notificationTemplateTypeId == templateTypeEnum.RecurrentTrainingNotification && item.evaluationRoleId == evaluationRolesEnum.trainer) {
                    return true;
                }
                else {
                    return false;
                }
            }
            $scope.recurrentProfileTrainingStartProjectManagerTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if (item.notificationTemplateTypeId == templateTypeEnum.RecurrentTrainingNotification && item.evaluationRoleId == evaluationRolesEnum.manager) {
                    return true;
                }
                else {
                    return false;
                }
            }


            $scope.recurrentProfileTrainingCompletedEvaluatorTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if (item.notificationTemplateTypeId == templateTypeEnum.RecurrentTrainingNotification && item.evaluationRoleId == evaluationRolesEnum.evaluator) {
                    return true;
                }
                else {
                    return false;
                }
            }
            $scope.recurrentProfileTrainingCompletedParticipantTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if (item.notificationTemplateTypeId == templateTypeEnum.RecurrentTrainingNotification && item.evaluationRoleId == evaluationRolesEnum.participant) {
                    return true;
                }
                else {
                    return false;
                }
            }
            $scope.recurrentProfileTrainingCompletedManagerTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if (item.notificationTemplateTypeId == templateTypeEnum.RecurrentTrainingNotification && item.evaluationRoleId == evaluationRolesEnum.manager) {
                    return true;
                }
                else {
                    return false;
                }
            }
            $scope.recurrentProfileTrainingCompletedTrainerTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if (item.notificationTemplateTypeId == templateTypeEnum.RecurrentTrainingNotification && item.evaluationRoleId == evaluationRolesEnum.trainer) {
                    return true;
                }
                else {
                    return false;
                }
            }
            $scope.recurrentProfileTrainingCompletedProjectManagerTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if (item.notificationTemplateTypeId == templateTypeEnum.RecurrentTrainingNotification && item.evaluationRoleId == evaluationRolesEnum.manager) {
                    return true;
                }
                else {
                    return false;
                }
            }


            $scope.recurrentProfileTrainingResultEvaluatorTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if (item.notificationTemplateTypeId == templateTypeEnum.RecurrentTrainingNotification && item.evaluationRoleId == evaluationRolesEnum.evaluator) {
                    return true;
                }
                else {
                    return false;
                }
            }
            $scope.recurrentProfileTrainingResultParticipantTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if (item.notificationTemplateTypeId == templateTypeEnum.RecurrentTrainingNotification && item.evaluationRoleId == evaluationRolesEnum.participant) {
                    return true;
                }
                else {
                    return false;
                }
            }
            $scope.recurrentProfileTrainingResultManagerTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if (item.notificationTemplateTypeId == templateTypeEnum.RecurrentTrainingNotification && item.evaluationRoleId == evaluationRolesEnum.manager) {
                    return true;
                }
                else {
                    return false;
                }
            }
            $scope.recurrentProfileTrainingResultTrainerTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if (item.notificationTemplateTypeId == templateTypeEnum.RecurrentTrainingNotification && item.evaluationRoleId == evaluationRolesEnum.trainer) {
                    return true;
                }
                else {
                    return false;
                }
            }
            $scope.recurrentProfileTrainingResultProjectManagerTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if (item.notificationTemplateTypeId == templateTypeEnum.RecurrentTrainingNotification && item.evaluationRoleId == evaluationRolesEnum.manager) {
                    return true;
                }
                else {
                    return false;
                }
            }


            $scope.recurrentProfileTrainingGreenAlarmEvaluatorTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if (item.notificationTemplateTypeId == templateTypeEnum.RecurrentTrainingNotification && item.evaluationRoleId == evaluationRolesEnum.evaluator) {
                    return true;
                }
                else {
                    return false;
                }
            }
            $scope.recurrentProfileTrainingGreenAlarmParticipantTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if (item.notificationTemplateTypeId == templateTypeEnum.RecurrentTrainingNotification && item.evaluationRoleId == evaluationRolesEnum.participant) {
                    return true;
                }
                else {
                    return false;
                }
            }
            $scope.recurrentProfileTrainingGreenAlarmManagerTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if (item.notificationTemplateTypeId == templateTypeEnum.RecurrentTrainingNotification && item.evaluationRoleId == evaluationRolesEnum.manager) {
                    return true;
                }
                else {
                    return false;
                }
            }
            $scope.recurrentProfileTrainingGreenAlarmTrainerTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if (item.notificationTemplateTypeId == templateTypeEnum.RecurrentTrainingNotification && item.evaluationRoleId == evaluationRolesEnum.trainer) {
                    return true;
                }
                else {
                    return false;
                }
            }
            $scope.recurrentProfileTrainingGreenAlarmProjectManagerTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if (item.notificationTemplateTypeId == templateTypeEnum.RecurrentTrainingNotification && item.evaluationRoleId == evaluationRolesEnum.manager) {
                    return true;
                }
                else {
                    return false;
                }
            }


            $scope.recurrentProfileTrainingYellowAlarmEvaluatorTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if (item.notificationTemplateTypeId == templateTypeEnum.RecurrentTrainingNotification && item.evaluationRoleId == evaluationRolesEnum.evaluator) {
                    return true;
                }
                else {
                    return false;
                }
            }
            $scope.recurrentProfileTrainingYellowAlarmParticipantTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if (item.notificationTemplateTypeId == templateTypeEnum.RecurrentTrainingNotification && item.evaluationRoleId == evaluationRolesEnum.participant) {
                    return true;
                }
                else {
                    return false;
                }
            }
            $scope.recurrentProfileTrainingYellowAlarmManagerTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if (item.notificationTemplateTypeId == templateTypeEnum.RecurrentTrainingNotification && item.evaluationRoleId == evaluationRolesEnum.manager) {
                    return true;
                }
                else {
                    return false;
                }
            }
            $scope.recurrentProfileTrainingYellowAlarmTrainerTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if (item.notificationTemplateTypeId == templateTypeEnum.RecurrentTrainingNotification && item.evaluationRoleId == evaluationRolesEnum.trainer) {
                    return true;
                }
                else {
                    return false;
                }
            }
            $scope.recurrentProfileTrainingYellowAlarmProjectManagerTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if (item.notificationTemplateTypeId == templateTypeEnum.RecurrentTrainingNotification && item.evaluationRoleId == evaluationRolesEnum.manager) {
                    return true;
                }
                else {
                    return false;
                }
            }


            $scope.recurrentProfileTrainingRedAlarmEvaluatorTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if (item.notificationTemplateTypeId == templateTypeEnum.RecurrentTrainingNotification && item.evaluationRoleId == evaluationRolesEnum.evaluator) {
                    return true;
                }
                else {
                    return false;
                }
            }
            $scope.recurrentProfileTrainingRedAlarmParticipantTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if (item.notificationTemplateTypeId == templateTypeEnum.RecurrentTrainingNotification && item.evaluationRoleId == evaluationRolesEnum.participant) {
                    return true;
                }
                else {
                    return false;
                }
            }
            $scope.recurrentProfileTrainingRedAlarmManagerTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if (item.notificationTemplateTypeId == templateTypeEnum.RecurrentTrainingNotification && item.evaluationRoleId == evaluationRolesEnum.manager) {
                    return true;
                }
                else {
                    return false;
                }
            }
            $scope.recurrentProfileTrainingRedAlarmTrainerTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if (item.notificationTemplateTypeId == templateTypeEnum.RecurrentTrainingNotification && item.evaluationRoleId == evaluationRolesEnum.trainer) {
                    return true;
                }
                else {
                    return false;
                }
            }
            $scope.recurrentProfileTrainingRedAlarmProjectManagerTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if (item.notificationTemplateTypeId == templateTypeEnum.RecurrentTrainingNotification && item.evaluationRoleId == evaluationRolesEnum.manager) {
                    return true;
                }
                else {
                    return false;
                }
            }

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

            $scope.setDefaultsRecurrentTrainningSetting = function () {
                _.each($scope.profile.stageGroups, function (stageGroupItem) {

                    _.each(stageGroupItem.userRecurrentNotificationSettings, function (userRecurrentNotificationSettingItem) {
                        if (!userRecurrentNotificationSettingItem.id > 0) {
                            if ($scope.projectInfo.projectGlobalSettings.length > 0) {
                                globalSetting = $scope.projectInfo.projectGlobalSettings[0];
                                if ($scope.profile.profileTypeId == profileTypeEnum.Knowledge) {
                                    userRecurrentNotificationSettingItem.howMany = globalSetting.knowledgeProfileHowMany;
                                    userRecurrentNotificationSettingItem.metricId = globalSetting.knowledgeProfileMetricId;
                                    userRecurrentNotificationSettingItem.howManySet = globalSetting.knowledgeProfileHowManySets;
                                    userRecurrentNotificationSettingItem.howManyActions = globalSetting.knowledgeProfileHowManyActions;
                                    userRecurrentNotificationSettingItem.recurrentTrainningFrequency = globalSetting.knowledgeProfileRecurrentTrainingTimeSpan;
                                    userRecurrentNotificationSettingItem.emailNotification = globalSetting.knowledgeProfileEmailNotification;
                                    userRecurrentNotificationSettingItem.smsNotification = globalSetting.knowledgeProfileSmsNotification;
                                }
                                else {
                                    if (userRecurrentNotificationSettingItem.howMany == null) {
                                        userRecurrentNotificationSettingItem.howMany = globalSetting.softProfileHowMany;
                                    }
                                    if (userRecurrentNotificationSettingItem.metricId == null) {
                                        userRecurrentNotificationSettingItem.metricId = globalSetting.softProfileMetricId;
                                    }
                                    if (userRecurrentNotificationSettingItem.howManySet == null) {
                                        userRecurrentNotificationSettingItem.howManySet = globalSetting.softProfileHowManySets;
                                    }
                                    if (userRecurrentNotificationSettingItem.howManyActions == null) {
                                        userRecurrentNotificationSettingItem.howManyActions = globalSetting.softProfileHowManyActions;
                                    }
                                    if (userRecurrentNotificationSettingItem.recurrentTrainningFrequency == null) {
                                        userRecurrentNotificationSettingItem.recurrentTrainningFrequency = globalSetting.softProfileRecurrentTrainingTimeSpan;
                                    }
                                    if (userRecurrentNotificationSettingItem.emailNotification == null) {
                                        userRecurrentNotificationSettingItem.emailNotification = globalSetting.softProfileStartEmailNotification;
                                    }
                                    if (userRecurrentNotificationSettingItem.smsNotification == null) {
                                        userRecurrentNotificationSettingItem.smsNotification = globalSetting.softProfileStartSmsNotification;
                                    }
                                }
                                $("#recurency_" + userRecurrentNotificationSettingItem.stageId).find("#recurrenceEditor").data("kendoRecurrenceEditor").value(userRecurrentNotificationSettingItem.recurrentTrainningFrequency);
                            }
                        }
                    })

                });
            }
        }]);