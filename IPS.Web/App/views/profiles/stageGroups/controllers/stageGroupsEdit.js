(function () {
    'use strict';
    angular
        .module('ips.stageGroups')
        .config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
            var baseResolve = {
                selectedStage: function (stageGroupManager, $stateParams, globalVariables) {
                    return stageGroupManager.getStageById($stateParams.stageGroupId, $stateParams.profileId, "&$expand=Stages,EvaluationParticipants").then(function (data) {
                        moment.locale(globalVariables.lang.currentUICulture);
                        (data.startDate) ? data.startDate = moment(kendo.parseDate(data.startDate)).format('L LT') : '';
                        (data.endDate) ? data.endDate = moment(kendo.parseDate(data.endDate)).format('L LT') : '';
                        if (data.startStageStartDate) {
                            data.startStageStartDate = moment(kendo.parseDate(data.startStageStartDate)).format('L LT');
                        }
                        else {
                            data.startStageStartDate = moment(kendo.parseDate(data.startDate)).format('L LT');
                        }
                        if (data.startStageEndDate) {
                            data.startStageEndDate = moment(kendo.parseDate(data.startStageEndDate)).format('L LT');
                        }
                        else {
                            data.startStageEndDate = moment(kendo.parseDate(data.startDate)).add("days", 7).format('L LT');
                        }
                        if (data.milestoneStartDate) {
                            data.milestoneStartDate = moment(kendo.parseDate(data.milestoneStartDate)).format('L LT');
                        }
                        else {
                            data.milestoneStartDate = moment(kendo.parseDate(data.startDate)).add("days", 7).format('L LT');
                        }
                        if (data.milestoneEndDate) {
                            data.milestoneEndDate = moment(kendo.parseDate(data.milestoneEndDate)).format('L LT');
                        }
                        else {
                            data.milestoneEndDate = moment(kendo.parseDate(data.endDate)).format('L LT');
                        }
                        angular.forEach(data.stages, function (stage, index) {
                            (stage.startDateTime) ? stage.startDateTime = moment(kendo.parseDate(stage.startDateTime)).format('L LT') : '';
                            (stage.endDateTime) ? stage.endDateTime = moment(kendo.parseDate(stage.endDateTime)).format('L LT') : '';
                            (stage.greenAlarmTime) ? stage.greenAlarmTime = moment(kendo.parseDate(stage.greenAlarmTime)).format('L LT') : '';
                            (stage.yellowAlarmTime) ? stage.yellowAlarmTime = moment(kendo.parseDate(stage.yellowAlarmTime)).format('L LT') : '';
                            (stage.redAlarmTime) ? stage.redAlarmTime = moment(kendo.parseDate(stage.redAlarmTime)).format('L LT') : '';
                            (stage.evaluationStartDate) ? stage.evaluationStartDate = moment(kendo.parseDate(stage.evaluationStartDate)).format('L LT') : '';
                            (stage.evaluationEndDate) ? stage.evaluationEndDate = moment(kendo.parseDate(stage.evaluationEndDate)).format('L LT') : '';
                        });
                        data.stages.sort(function (a, b) {
                            if (moment(kendo.parseDate(a.startDateTime)).isBefore(moment(kendo.parseDate(b.startDateTime)))) {
                                return -1;
                            }
                            ;
                            if (moment(kendo.parseDate(a.startDateTime)).isAfter(moment(kendo.parseDate(b.startDateTime)))) {
                                return 1;
                            }
                            ;
                            return 0;
                        });
                        return data;
                    });
                },
                projectInfo: function (stageGroupManager, $stateParams) {
                    return stageGroupManager.getProjectByProfileId($stateParams.profileId).then(function (data) {
                        if (data) {
                            data.expectedStartDate = moment(kendo.parseDate(data.expectedStartDate)).format("L LT");
                            data.expectedEndDate = moment(kendo.parseDate(data.expectedEndDate)).format("L LT");
                        }
                        return data;
                    });
                },
                statusOfStages: function (stageGroupManager, $stateParams) {
                    return stageGroupManager.getStagesStatus($stateParams.stageGroupId).then(function (data) {
                        return data;
                    });
                },
                notificationTemplates: function (stageGroupManager, $stateParams, $translate) {
                    return stageGroupManager.getNotificationTemplates().then(function (data) {
                        data.unshift({ id: null, name: $translate.instant('MYPROFILES_SELECT_TEMPLATE'), culture: { cultureName: "" } });
                        return data;
                    });
                },
                users: function (stageGroupManager, profile) {
                    return stageGroupManager.getUsers("?$expand=Organization&$orderby=FirstName,LastName"/*&$filter=OrganizationId eq " + profile.organizationId*/).then(function (data) {
                        return data;
                    });
                },
                participants: function (stageGroupManager, $stateParams) {
                    return stageGroupManager.getParticipants($stateParams.stageGroupId).then(function (data) {
                        return data;
                    });
                },
                stageGroupEvaluation: function (stageGroupManager, $stateParams) {
                    return stageGroupManager.getStageGroupEvaluation($stateParams.stageGroupId).then(function (data) {
                        return data;
                    });
                },
                evaluators: function (stageGroupManager, $stateParams) {
                    return stageGroupManager.getEvaluators($stateParams.stageGroupId).then(function (data) {
                        return data;
                    });
                },
                evaluationRoles: function (stageGroupManager) {
                    return stageGroupManager.getEvaluationRoles().then(function (data) {
                        return data;
                    });
                },
                jobPositions: function (stageGroupManager) {
                    return stageGroupManager.getJobPositions().then(function (data) {
                        return data;
                    });
                }
            };
            var softResolve = _.clone(baseResolve);
            softResolve.readonlySelfEvaluation = function () {
                return false;
            };
            softResolve.showStages = function () {
                return true;
            };
            softResolve.profileTypeId = function (profilesTypesEnum) {
                return profilesTypesEnum.soft;
            };
            var ktResolve = _.clone(baseResolve);
            ktResolve.readonlySelfEvaluation = function () {
                return true;
            };
            ktResolve.showStages = function () {
                return false;
            };
            ktResolve.profileTypeId = function (profilesTypesEnum) {
                return profilesTypesEnum.knowledgetest;
            };
            $stateProvider
                .state('home.profiles.soft.edit.stageGroups.edit', {
                    url: "/edit/:stageGroupId",
                    templateUrl: "views/profiles/stageGroups/views/stageGroupsEdit.html",
                    controller: "stageGroupsEditCtrl as stageEdit",
                    resolve: softResolve,
                    data: {
                        displayName: '{{selectedStage.name}}',
                        paneLimit: 1,
                        depth: 5,
                        resource: "Profiles"
                    }
                })
                .state('home.profiles.knowledgetest.edit.stageGroups.edit', {
                    url: "/edit/:stageGroupId",
                    templateUrl: "views/profiles/stageGroups/views/stageGroupsEdit.html",
                    controller: "stageGroupsEditCtrl as stageEdit",
                    resolve: ktResolve,
                    data: {
                        displayName: '{{selectedStage.name}}',
                        paneLimit: 1,
                        depth: 5,
                        resource: "Profiles"
                    }
                });
        }])
        .controller('stageGroupsEditCtrl', stageGroupsEditCtrl);
    stageGroupsEditCtrl.$inject = ['$scope', '$location', 'stageGroupManager', 'profilesService', 'dialogService',
        'selectedStage', 'statusOfStages', 'notificationTemplates', '$stateParams', 'users', 'participants', 'evaluators', 'stageGroupEvaluation',
        'evaluationRoles', 'jobPositions', 'datetimeCalculator', 'authService', 'readonlySelfEvaluation', 'profileTypeId', 'profilesTypesEnum', 'showStages', 'profileTypeEnum', 'stageTypesEnum', 'templateTypeEnum', 'evaluationRolesEnum', 'globalVariables', '$translate', 'projectInfo', 'localStorageService'];
    function stageGroupsEditCtrl($scope, $location, stageGroupManager, profilesService, dialogService, selectedStage,
        statusOfStages, notificationTemplates, $stateParams, users, participants, evaluators, stageGroupEvaluation,
        evaluationRoles, jobPositions, datetimeCalculator, authService, readonlySelfEvaluation, profileTypeId, profilesTypesEnum, showStages, profileTypeEnum, stageTypesEnum, templateTypeEnum, evaluationRolesEnum, globalVariables, $translate, projectInfo, localStorageService) {
        var vm = this;
        moment.locale(globalVariables.lang.currentUICulture);
        vm.showStages = showStages;
        vm.readonlySelfEvalution = readonlySelfEvaluation;
        vm.stageInfo = selectedStage;
        vm.statusOfStages = statusOfStages;
        var isInUse = false;
        for (var i = 0; i < statusOfStages.length; i++) {
            if (statusOfStages[i].isInUse) {
                isInUse = true;
                break;
            }
        }
        vm.isInUse = isInUse;
        vm.stage = vm.stageInfo.stages[0];
        vm.isStartStage = true;
        vm.notificationTemplates = notificationTemplates;
        vm.users = users;
        vm.evaluationRoles = evaluationRoles;
        vm.jobPositions = jobPositions;
        vm.participants = participants;
        vm.evaluators = evaluators;
        vm.stageGroupEvaluation = stageGroupEvaluation;
        vm.projectInfo = projectInfo;
        //vm.stagesAndAlarms = participants.concat(evaluators);
        vm.stagesAndAlarmsStageId = vm.stageInfo.stages[0].id;
        vm.profileTypeId = profileTypeId;
        vm.profilesTypesEnum = profilesTypesEnum;
        console.log("diff: " + moment.duration(moment(kendo.parseDate(vm.stageInfo.endDate)).diff(moment(kendo.parseDate(vm.stageInfo.startDate)))).asDays());
        var stageRestart = {
            name: vm.stageInfo.name,
            startDate: moment(kendo.parseDate(vm.stageInfo.endDate)).isAfter(moment(new Date()), "day") ? moment(kendo.parseDate(vm.stageInfo.endDate)).add('days', 1).format('L LT') : moment(new Date()).add('days', 1).format('L LT'),
            description: ""
        };
        vm.stageRestart = stageRestart;
        vm.stageTimespanChanged = stageTimespanChanged;
        angular.forEach(vm.evaluationRoles, function (item, index) {
            item.text = item.name;
            item.value = item.id;
        });
        setIsAdmin();
        function setIsAdmin() {
            vm.isAdmin = false;
            if (vm.participants.length > 0 && vm.participants[0].user)
                authService.tryGetPassword(vm.participants[0].user.userKey, vm.participants[0].user.organizationId).then(function (pass) {
                    if (pass && pass.data && pass.data != "")
                        vm.isAdmin = true;
                });
        }
        function isEdit() {
            return ($stateParams.stageGroupId > 0);
        }
        function IsStageLocked(stageId) {
            for (var i = 0; i < statusOfStages.length; i++) {
                if (statusOfStages[i].stageId == stageId) {
                    return statusOfStages[i].isLocked;
                }
            }
            return false;
        }
        function validateStage() {
            console.log(vm)
            if (vm.participants.length != 0) {
                var error = null;
                angular.forEach(vm.participants, function (val, key) {
                    if (val.isSelfEvaluation == false) {
                        if (vm.evaluators.length === 0) {
                            error = $translate.instant('SOFTPROFILE_EVALUATORS_IS_NOT_SELECTED') + " " + $translate.instant('SOFTPROFILE_SELECT_EVALUATOR');
                        }
                    }
                })
                if (error != null) {
                    return error;
                }
            }
            if (!validateDate(vm.stageInfo.startDate))
                return $translate.instant('SOFTPROFILE_STAGE_GROUP_START_DATE_IS_NOT_VALID');
            if (!validateDate(vm.stageInfo.endDate))
                return $translate.instant('SOFTPROFILE_STAGE_GROUP_END_DATE_IS_NOT_VALID');
            if (!moment(kendo.parseDate(vm.stageInfo.endDate)).isAfter(moment(kendo.parseDate(vm.stageInfo.startDate))))
                return $translate.instant('SOFTPROFILE_STAGE_GROUP_START_DATE_MUST_BE_BEFORE_END_DATE');
            var stagesCount = vm.stageInfo.stages.length;
            if (moment(kendo.parseDate(vm.stageInfo.startDate)).isAfter(moment(kendo.parseDate(vm.stageInfo.stages[0].startDateTime))))
                return $translate.instant('SOFTPROFILE_STAGE_GROUP_START_DATE_CANNOT_BE_AFTER_START_DATE_OF_THE_FIRST_STAGE');
            if (moment(kendo.parseDate(vm.stageInfo.endDate)).isBefore(moment(kendo.parseDate(vm.stageInfo.stages[stagesCount - 1].endDateTime))))
                return $translate.instant('SOFTPROFILE_STAGE_GROUP_END_DATE_CANNOT_BE_BEFORE_END_DATE_OF_THE_LAST_STAGE');
            for (var i = 0; i < stagesCount; i++) {
                if (!validateDateTime(vm.stageInfo.stages[i].startDateTime, true))
                    return $translate.instant('SOFTPROFILE_START_DATE_OF') + " " + vm.stageInfo.stages[i].name + " " + $translate.instant('SOFTPROFILE_STAGE_IS_NOT_VALID');
                if (!validateDateTime(vm.stageInfo.stages[i].endDateTime, true))
                    return $translate.instant('SOFTPROFILE_DUE_DATE_OF') + " " + vm.stageInfo.stages[i].name + " " + $translate.instant('SOFTPROFILE_STAGE_IS_NOT_VALID');
                if (!moment(kendo.parseDate(vm.stageInfo.stages[i].startDateTime)).isBefore(moment(kendo.parseDate(vm.stageInfo.stages[i].endDateTime))))
                    return $translate.instant('SOFTPROFILE_DUE_DATE_OF') + " " + vm.stageInfo.stages[i].name + " " + $translate.instant('SOFTPROFILE_STAGE_CANNOT_BE_AFTER_STAGE_START_DATE');
                if (i > 0) {
                    if (moment(kendo.parseDate(vm.stageInfo.stages[i].startDateTime)).isBefore(moment(kendo.parseDate(vm.stageInfo.stages[i - 1].endDateTime))))
                        return $translate.instant('SOFTPROFILE_DUE_DATE_OF') + " " + vm.stageInfo.stages[i - 1].name + " " + $translate.instant('SOFTPROFILE_STAGE_CANNOT_BE_AFTER_STAGE_START_DATE_OF') + " " + vm.stageInfo.stages[i].name + " " + $translate.instant('COMMON_STAGE');
                }
                if (!validateDateTime(vm.stageInfo.stages[i].redAlarmTime, false))
                    return $translate.instant('SOFTPROFILE_RED_ALARM_DATE_OF') + " " + vm.stageInfo.stages[i].name + " " + $translate.instant('SOFTPROFILE_STAGE_IS_NOT_VALID');
                if (!validateDateTime(vm.stageInfo.stages[i].yellowAlarmTime, false))
                    return $translate.instant('SOFTPROFILE_YELLOW_ALARM_DATE_OF') + " " + vm.stageInfo.stages[i].name + " " + $translate.instant('SOFTPROFILE_STAGE_IS_NOT_VALID');
                if (!validateDateTime(vm.stageInfo.stages[i].greenAlarmTime, false))
                    return $translate.instant('SOFTPROFILE_GREEN_ALARM_DATE_OF') + " " + vm.stageInfo.stages[i].name + " " + $translate.instant('SOFTPROFILE_STAGE_IS_NOT_VALID');
            }
            return null;
        }
        function save() {
            var validationErrorMsg = validateStage();
            if (validationErrorMsg == null) {
                (!isEdit()) ? addNewStageGroup() : updateStageGroup();
            } else {
                dialogService.showNotification($translate.instant('SOFTPROFILE_STAGE_GROUP_CANNOT_BE_SAVED') + validationErrorMsg, 'error');
            }
        }
        function selectStage(stage) {
            vm.stage = stage;
            vm.isStartStage = false;
            var index = _.findIndex(vm.stageInfo.stages, function (item) {
                return item.id == stage.id;
            });
            if (index == 0) {
                vm.isStartStage = true;
            }
        }
        function stageTimespanChanged() {
            var newDate = new Date();
            var mindate = moment(newDate).add({ days: 1, hours: 1 });
            var calculatedDate = moment(newDate).add({ months: vm.stageInfo.monthsSpan, weeks: vm.stageInfo.weeksSpan, days: vm.stageInfo.daysSpan, hours: vm.stageInfo.hoursSpan, minutes: vm.stageInfo.minutesSpan });
            //if ((calculatedDate._d.getTime() - mindate._d.getTime()) >= 0) {
            _.forEach(vm.stageInfo.stages, function (item, index) {
                if (index == 0) {
                    vm.stageInfo.stages[index].endDateTime = moment(kendo.parseDate(vm.stageInfo.stages[index].startDateTime)).add({ months: vm.stageInfo.monthsSpan, weeks: vm.stageInfo.weeksSpan, days: vm.stageInfo.daysSpan, hours: vm.stageInfo.hoursSpan, minutes: vm.stageInfo.minutesSpan }).format('L LT');
                    var startdatetime = kendo.parseDate(vm.stageInfo.stages[index].startDateTime);
                    var enddatetime = kendo.parseDate(vm.stageInfo.stages[index].endDateTime);
                    var TotalDiffrence = enddatetime.getTime() - startdatetime.getTime();
                    var greenAlarmAt = parseInt(TotalDiffrence * 0.20);
                    var yellowAlarmAt = parseInt(TotalDiffrence * 0.60);
                    var redAlarmAt = parseInt(TotalDiffrence * 0.90);
                    vm.stageInfo.stages[index].greenAlarmTime = moment(new Date(startdatetime.getTime() + greenAlarmAt)).format('L LT');
                    vm.stageInfo.stages[index].yellowAlarmTime = moment(new Date(startdatetime.getTime() + yellowAlarmAt)).format('L LT');
                    vm.stageInfo.stages[index].redAlarmTime = moment(new Date(enddatetime.getTime())).add(1, 'minutes').format('L LT');
                    vm.stageInfo.stages[index].evaluationStartDate = moment(kendo.parseDate(vm.stageInfo.stages[index].startDateTime)).format('L LT');
                    vm.stageInfo.stages[index].evaluationEndDate = moment(kendo.parseDate(vm.stageInfo.stages[index].endDateTime)).format('L LT');
                }
                else {
                    vm.stageInfo.stages[index].startDateTime = vm.stageInfo.stages[index - 1].endDateTime;
                    vm.stageInfo.stages[index].endDateTime = moment(kendo.parseDate(vm.stageInfo.stages[index].startDateTime)).add({ months: vm.stageInfo.monthsSpan, weeks: vm.stageInfo.weeksSpan, days: vm.stageInfo.daysSpan, hours: vm.stageInfo.hoursSpan, minutes: vm.stageInfo.minutesSpan }).format('L LT');
                    vm.stageInfo.endDate = moment(kendo.parseDate(vm.stageInfo.stages[index].endDateTime)).add('days', 1).format("L");
                    vm.stageInfo.stages[index].evaluationStartDate = moment(kendo.parseDate(vm.stageInfo.stages[index].endDateTime)).add('days', -5).format('L LT');
                    vm.stageInfo.stages[index].evaluationEndDate = moment(kendo.parseDate(vm.stageInfo.stages[index].endDateTime)).format('L LT');
                    var startdatetime = kendo.parseDate(vm.stageInfo.stages[index].evaluationStartDate);
                    var enddatetime = kendo.parseDate(vm.stageInfo.stages[index].evaluationEndDate);
                    var TotalDiffrence = enddatetime.getTime() - startdatetime.getTime();
                    var greenAlarmAt = parseInt(TotalDiffrence * 0.20);
                    var yellowAlarmAt = parseInt(TotalDiffrence * 0.60);
                    var redAlarmAt = parseInt(TotalDiffrence * 0.90);
                    vm.stageInfo.stages[index].greenAlarmTime = moment(new Date(startdatetime.getTime() + greenAlarmAt)).format('L LT');
                    vm.stageInfo.stages[index].yellowAlarmTime = moment(new Date(startdatetime.getTime() + yellowAlarmAt)).format('L LT');
                    vm.stageInfo.stages[index].redAlarmTime = moment(new Date(enddatetime.getTime())).add(1, 'minutes').format('L LT');
                }
            });
            //}
            //else {
            //    dialogService.showNotification('Too low time span, must be atleaset 1 Day : 1 Hour timespan', 'error');
            //}
        }
        function restartStage() {
            stageGroupManager.restartProfile($stateParams.stageGroupId, vm.stageRestart).then(function (data) {
                profilesService.updateTree();
            });
        }
        function isFinalGoal() {
            if (vm.stageInfo.stages) {
                if (vm.stageInfo.stages[vm.stageInfo.stages.length - 1].name == vm.stage.name) {
                    return true;
                }
                else {
                    return vm.stage.name == 'Final Goal';
                }
            }
            else {
                return vm.stage.name == 'Final Goal';
            }
        }
        function addNewStageGroup() {
            if (vm.stageInfo) {
                var clonnedStageInfo = _.clone(vm.stageInfo);
                clonnedStageInfo.startDate = kendo.parseDate(clonnedstageInfo.startDate);
                clonnedStageInfo.endDate = kendo.parseDate(clonnedstageInfo.endDate);
                stageGroupManager.addNewStageGroup(clonnedStageInfo).then(
                    function (data) {
                        stageGroupManager.returnToPerviousPage();
                    },
                    function (data) {
                        console.log(data);
                    }
                );
            }
        }
        function updateStageGroup() {
            if (vm.stageInfo) {
                stageGroupManager.isStageGroupInUse($stateParams.stageGroupId).then(function (data) {
                    if (data == true) {
                        var clonnedStageInfo = _.clone(vm.stageInfo);
                        clonnedStageInfo.startDate = kendo.parseDate(clonnedStageInfo.startDate);
                        clonnedStageInfo.endDate = kendo.parseDate(clonnedStageInfo.endDate);
                        stageGroupManager.updateStageGroupBasicInfo(clonnedStageInfo).then(function (data) {
                            dialogService.showNotification($translate.instant('SOFTPROFILE_STAGE_GROUP_BASIC_INFO_UPDATE'), 'info');

                        })
                        //dialogService.showNotification($translate.instant('SOFTPROFILE_STAGE_GROUP_CANNOT_BE_UPDATE') + ' ' + $translate.instant('SOFTPROFILE_THIS_STAGE_GROUP_IS_IN_ALREADY_IN_USE'), 'warning');
                    } else {
                        var clonnedStageInfo = _.clone(vm.stageInfo);
                        clonnedStageInfo.startDate = kendo.parseDate(clonnedStageInfo.startDate);
                        clonnedStageInfo.endDate = kendo.parseDate(clonnedStageInfo.endDate);
                        stageGroupManager.updateStageGroup(clonnedStageInfo).then(
                            function (data) {
                                stageGroupManager.getStageById($stateParams.stageGroupId, $stateParams.profileId, "&$expand=Stages,EvaluationParticipants").then(function (data) {
                                    if (clonnedStageInfo.totalMilestones == (vm.stageInfo.stages.length - 1)) {
                                        var OldStages = _.clone(vm.stageInfo.stages);
                                        //vm.stageInfo.stages = data.stages;
                                        data.stages.sort(function (a, b) {
                                            if (moment(kendo.parseDate(a.startDateTime)).isBefore(moment(kendo.parseDate(b.startDateTime)))) {
                                                return -1;
                                            }
                                            ;
                                            if (moment(kendo.parseDate(a.startDateTime)).isAfter(moment(kendo.parseDate(b.startDateTime)))) {
                                                return 1;
                                            }
                                            ;
                                            return 0;
                                        });
                                        angular.forEach(data.stages, function (stageItem, index) {
                                            vm.stageInfo.stages[index].id = stageItem.id;
                                            var stageItemCopy = _.clone(vm.stageInfo.stages[index]);
                                            stageItemCopy.startDateTime = kendo.parseDate(stageItemCopy.startDateTime);
                                            stageItemCopy.endDateTime = kendo.parseDate(stageItemCopy.endDateTime);
                                            stageItemCopy.greenAlarmTime = kendo.parseDate(stageItemCopy.greenAlarmTime);
                                            stageItemCopy.yellowAlarmTime = kendo.parseDate(stageItemCopy.yellowAlarmTime);
                                            stageItemCopy.redAlarmTime = kendo.parseDate(stageItemCopy.redAlarmTime);
                                            stageItemCopy.evaluationStartDate = kendo.parseDate(stageItemCopy.evaluationStartDate);
                                            stageItemCopy.evaluationEndDate = kendo.parseDate(stageItemCopy.evaluationEndDate);
                                            stageItemCopy.invitedAt = kendo.parseDate(stageItemCopy.invitedAt);
                                            stageGroupManager.updateStage(stageItemCopy).then(function (stageData) {

                                            })
                                        });
                                        selectStage(vm.stageInfo.stages[0]);
                                    }
                                    else {
                                        vm.stageInfo.stages = data.stages;
                                        angular.forEach(vm.stageInfo.stages, function (stage, index) {
                                            (stage.startDateTime) ? stage.startDateTime = moment(kendo.parseDate(stage.startDateTime)).format('L LT') : '';
                                            (stage.endDateTime) ? stage.endDateTime = moment(kendo.parseDate(stage.endDateTime)).format('L LT') : '';
                                            (stage.greenAlarmTime) ? stage.greenAlarmTime = moment(kendo.parseDate(stage.greenAlarmTime)).format('L LT') : '';
                                            (stage.yellowAlarmTime) ? stage.yellowAlarmTime = moment(kendo.parseDate(stage.yellowAlarmTime)).format('L LT') : '';
                                            (stage.redAlarmTime) ? stage.redAlarmTime = moment(kendo.parseDate(stage.redAlarmTime)).format('L LT') : '';
                                            (stage.evaluationStartDate) ? stage.evaluationStartDate = moment(kendo.parseDate(stage.evaluationStartDate)).format('L LT') : '';
                                            (stage.evaluationEndDate) ? stage.evaluationEndDate = moment(kendo.parseDate(stage.evaluationEndDate)).format('L LT') : '';
                                        });
                                        vm.stageInfo.stages.sort(function (a, b) {
                                            if (moment(kendo.parseDate(a.startDateTime)).isBefore(moment(kendo.parseDate(b.startDateTime)))) {
                                                return -1;
                                            }
                                            ;
                                            if (moment(kendo.parseDate(a.startDateTime)).isAfter(moment(kendo.parseDate(b.startDateTime)))) {
                                                return 1;
                                            }
                                            ;
                                            return 0;
                                        });
                                        setDefaults();
                                        selectStage(vm.stageInfo.stages[0]);
                                    }

                                });

                                //saveStage();
                                //stageGroupManager.returnToPerviousPage();
                                //stageGroupManager.getStages("?$filter=Profiles/any(s:s/Id eq " + $stateParams.profileId + ")").then(function (stagesData) {
                                //    debugger;
                                //});
                            },
                            function (data) {
                                console.log(data);
                            }
                        );
                    }
                });
            }
        }
        function addParticipant(participant) {
            participant.stageGroupId = vm.stageInfo.id;
            return stageGroupManager.addParticipant(participant);
        }
        function refreshParticipant(participantId) {
            dialogService.showYesNoDialog($translate.instant('COMMON_CONFIRM'), $translate.instant('SOFTPROFILE_DO_YOU_WANT_TO_RE_OPEN_PARTICIPANT_SURVEY')).then(
                function () {
                    stageGroupManager.refreshParticipant(vm.stagesAndAlarmsStageId, participantId).then(function (data) {
                        stageChanged();
                    });
                },
                function () {
                    //alert('No clicked');
                });
        }
        //function refreshParticipant(participantId) {
        //    return stageGroupManager.refreshParticipant(participantId);
        //}
        function analyseAnswers(participantId, evaluateeId) {
            // $location.path("/home/historyScorecard/" + $stateParams.profileId + "/" + vm.stagesAndAlarmsStageId + "/" + participantId);
            $location.path("/home/surveyAnalysis/" + $stateParams.prosfileId + "/" + vm.stagesAndAlarmsStageId + "/" + participantId + "/" + evaluateeId);
        }
        function removeParticipant(participantId) {
            return stageGroupManager.removeParticipant(participantId);
        }
        function removeAllParticipants(roleId) {
            return stageGroupManager.removeAllParticipants(vm.stageInfo.id, roleId);
        }
        function selfEvaluationUpdate(participantId, isSelfEvaluation) {
            angular.forEach(vm.participants, function (val, key) {
                if (val.participantId == participantId) {
                    val.isSelfEvaluation = isSelfEvaluation;
                }
            })
            return stageGroupManager.selfEvaluationUpdate(participantId, isSelfEvaluation);
        }
        function lockUpdate(participantId, isLocked) {
            return stageGroupManager.lockUpdate(participantId, isLocked);
        }
        function scoreManagerUpdate(participantId, isScoreManager) {
            return stageGroupManager.scoreManagerUpdate(participantId, isScoreManager);
        }
        function saveStage() {
            var item = angular.copy(vm.stage);
            item.startDateTime = kendo.parseDate(item.startDateTime);
            item.endDateTime = kendo.parseDate(item.endDateTime);
            item.evaluationStartDate = kendo.parseDate(item.evaluationStartDate);
            item.evaluationEndDate = kendo.parseDate(item.evaluationEndDate);
            if (item.id > 0) {
                stageGroupManager.updateStage(item).then(function (data) {
                    if (data) {
                        vm.stage.isChanged = false;
                        profilesService.updateTree();
                        dialogService.showNotification($translate.instant('SOFTPROFILE_STAGE_SAVED_SUCCESSFULLY'), 'info');
                    }
                    else {
                        dialogService.showNotification($translate.instant('SOFTPROFILE_SAVE_FAILED'), 'warning');
                    }
                }, function (error) {
                    dialogService.showNotification(error, "warning");
                });
            }
            else {
                stageGroupManager.addNewStage(id).then(function (data) {
                    vm.stage = id;
                    if (item.id > 0) {
                        profilesService.updateTree();
                        dialogService.showNotification($translate.instant('SOFTPROFILE_STAGE_SAVED_SUCCESSFULLY'), 'info');
                    } else {
                        dialogService.showNotification($translate.instant('SOFTPROFILE_SAVE_FAILED'), 'warning');
                    }
                }, function (error) {
                    dialogService.showNotification(error, "warning");
                });
            }
        }
        function saveAllStages() {
            if (vm.stageInfo.stages) {
                var changedStages = _.filter(vm.stageInfo.stages, function (item) {
                    return item.isChanged == true;
                });

                _.each(changedStages, function (stageItem) {
                    var item = angular.copy(stageItem);
                    item.startDateTime = kendo.parseDate(item.startDateTime);
                    item.endDateTime = kendo.parseDate(item.endDateTime);
                    item.evaluationStartDate = kendo.parseDate(item.evaluationStartDate);
                    item.evaluationEndDate = kendo.parseDate(item.evaluationEndDate);
                    if (item.id > 0) {
                        stageGroupManager.updateStage(item).then(function (data) {
                            if (data) {
                                stageItem.isChanged = false;
                                profilesService.updateTree();
                                dialogService.showNotification($translate.instant('SOFTPROFILE_STAGE_SAVED_SUCCESSFULLY'), 'info');
                            }
                            else {
                                dialogService.showNotification($translate.instant('SOFTPROFILE_SAVE_FAILED'), 'warning');
                            }
                        }, function (error) {
                            dialogService.showNotification(error, "warning");
                        });
                    }
                })
            }
        }
        function removeStage() {
            dialogService.showYesNoDialog($translate.instant('COMMON_CONFIRM'), $translate.instant('COMMON_ARE_YOU_SURE_YOU_WANT_TO_DELETE')).then(
                function () {
                    var index = vm.stageInfo.stages.indexOf(vm.stage);
                    if (vm.stage.id > 0) {
                        stageGroupManager.removeStage(vm.stage.id).then(function (data) {
                            if (data) {
                                vm.stageInfo.stages.splice(index, 1);
                                vm.stage = vm.stageInfo.stages[0];
                            }
                        });
                    } else {
                        vm.stageInfo.stages.splice(index, 1);
                        vm.stage = vm.stageInfo.stages[0];
                    }
                },
                function () {
                    //alert('No clicked');
                });
        }
        function removeStageGroup() {
            dialogService.showYesNoDialog($translate.instant('COMMON_CONFIRM'), $translate.instant('COMMON_ARE_YOU_SURE_YOU_WANT_TO_DELETE')).then(
                function () {
                    stageGroupManager.removeStageGroup($stateParams.stageId).then(
                        function (data) {
                            stageGroupManager.returnToPerviousPage();
                        },
                        function (data) {
                            console.log(data);
                        }
                    );
                },
                function () {
                });
        }
        function addStage() {
            var minId = -1;
            var maxDate = "";
            angular.forEach(vm.stageInfo.stages, function (stage, index) {
                if (minId > stage.id) {
                    minId = stage.id - 1;
                }
                if (maxDate < stage.endDateTime) {
                    maxDate = stage.endDateTime;
                }
            });
            var stage = {
                id: minId,
                name: "New Stage",
                stageGroupId: 0,
                startDateTime: maxDate,
                endDateTime: moment(maxDate).add('days', 42).format('L LT'),
                evaluationDurationMinutes: 120,
                emailNotification: false,
                sMSNotification: false,
                greenAlarmTemplateId: null,
                greenAlarmTime: null,
                yellowAlarmTemplateId: null,
                yellowAlarmTime: null,
                redAlarmTemplateId: null,
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
                managerResultsNotificationTemplateId: null
            };
            vm.stageInfo.stages.push(stage);
            vm.stage = stage;
        }
        function goBack() {
            history.back();
        }
        vm.isStagesTab = false;
        vm.tabStripConfigOptions = {
            select: function (e) {
                var text = $(e.item).children(".k-link").text();
                if (text == "Status & Progress") {
                    stageChanged();
                }
                //vm.isStagesTab = text == "Stages";
                //this approach is used as standard ng-show binding for this button works too slow
                text == "Stages" ? $(".set-defaults-button").show() : $(".set-defaults-button").hide();
            }
        }



        function setDefaults() {
            if (vm.stageInfo) {
                if (profileTypeId == profileTypeEnum.Knowledge) {
                    var globalSetting = null;
                    if (projectInfo) {
                        if (projectInfo.projectGlobalSettings.length > 0) {
                            globalSetting = projectInfo.projectGlobalSettings[0]
                        }
                    }
                    if (globalSetting) {

                        vm.stageInfo.stages[0].emailNotification = globalSetting.knowledgeProfileEmailNotification;
                        vm.stageInfo.stages[0].smsNotification = globalSetting.knowledgeProfileSmsNotification;

                        vm.stageInfo.stages[0].startDateTime = moment(kendo.parseDate(globalSetting.knowledgeProfileStartDate)).format('L LT')
                        vm.stageInfo.stages[0].endDateTime = moment(kendo.parseDate(globalSetting.knowledgeProfileEndDate)).format('L LT')
                        vm.stageInfo.stages[0].greenAlarmTime = moment(kendo.parseDate(globalSetting.knowledgeProfileGreenAlarmTime)).format('L LT')
                        vm.stageInfo.stages[0].yellowAlarmTime = moment(kendo.parseDate(globalSetting.knowledgeProfileYellowAlarmTime)).format('L LT')
                        vm.stageInfo.stages[0].redAlarmTime = moment(kendo.parseDate(globalSetting.knowledgeProfileRedAlarmTime)).format('L LT')
                        vm.stageInfo.stages[0].managerId = globalSetting.managerId;
                        vm.stageInfo.stages[0].trainerId = globalSetting.trainerId;

                        vm.stageInfo.stages[0].externalStartNotificationTemplateId = globalSetting.knowledgeProfileExternalStartNotificationTemplateId;
                        vm.stageInfo.stages[0].externalCompletedNotificationTemplateId = globalSetting.knowledgeProfileExternalCompletedNotificationTemplateId;
                        vm.stageInfo.stages[0].externalResultsNotificationTemplateId = globalSetting.knowledgeProfileExternalResultsNotificationTemplateId;
                        vm.stageInfo.stages[0].evaluatorStartNotificationTemplateId = globalSetting.knowledgeProfileEvaluatorStartNotificationTemplateId;
                        vm.stageInfo.stages[0].evaluatorCompletedNotificationTemplateId = globalSetting.knowledgeProfileEvaluatorCompletedNotificationTemplateId;
                        vm.stageInfo.stages[0].evaluatorResultsNotificationTemplateId = globalSetting.knowledgeProfileEvaluatorResultsNotificationTemplateId;
                        vm.stageInfo.stages[0].trainerStartNotificationTemplateId = globalSetting.knowledgeProfileTrainerStartNotificationTemplateId;
                        vm.stageInfo.stages[0].trainerCompletedNotificationTemplateId = globalSetting.knowledgeProfileTrainerCompletedNotificationTemplateId;
                        vm.stageInfo.stages[0].trainerResultsNotificationTemplateId = globalSetting.knowledgeProfileTrainerResultsNotificationTemplateId;
                        vm.stageInfo.stages[0].managerStartNotificationTemplateId = globalSetting.knowledgeProfileManagerStartNotificationTemplateId;
                        vm.stageInfo.stages[0].managerCompletedNotificationTemplateId = globalSetting.knowledgeProfileManagerCompletedNotificationTemplateId;
                        vm.stageInfo.stages[0].managerResultsNotificationTemplateId = globalSetting.knowledgeProfileManagerResultsNotificationTemplateId;

                        vm.stageInfo.stages[0].finalScoreManagerStartNotificationTemplateId = globalSetting.knowledgeProfileFinalScoreManagerStartNotificationTemplateId;
                        vm.stageInfo.stages[0].finalScoreManagerCompletedNotificationTemplateId = globalSetting.knowledgeProfileFinalScoreManagerCompletedNotificationTemplateId;
                        vm.stageInfo.stages[0].finalScoreManagerResultsNotificationTemplateId = globalSetting.knowledgeProfileFinalScoreManagerResultsNotificationTemplateId;

                        vm.stageInfo.stages[0].projectManagerStartNotificationTemplateId = globalSetting.knowledgeProfileProjectManagerStartNotificationTemplateId;
                        vm.stageInfo.stages[0].projectManagerCompletedNotificationTemplateId = globalSetting.knowledgeProfileProjectManagerCompletedNotificationTemplateId;
                        vm.stageInfo.stages[0].projectManagerResultsNotificationTemplateId = globalSetting.knowledgeProfileProjectManagerResultsNotificationTemplateId;

                        vm.stageInfo.stages[0].greenAlarmParticipantTemplateId = globalSetting.knowledgeProfileGreenAlarmParticipantTemplateId;
                        vm.stageInfo.stages[0].greenAlarmEvaluatorTemplateId = globalSetting.knowledgeProfileGreenAlarmEvaluatorTemplateId;
                        vm.stageInfo.stages[0].greenAlarmManagerTemplateId = globalSetting.knowledgeProfileGreenAlarmManagerTemplateId;
                        vm.stageInfo.stages[0].greenAlarmProjectManagerTemplateId = globalSetting.knowledgeProfileGreenAlarmProjectManagerTemplateId;
                        vm.stageInfo.stages[0].greenAlarmFinalScoreManagerTemplateId = globalSetting.knowledgeProfileGreenAlarmFinalScoreManagerTemplateId;
                        vm.stageInfo.stages[0].greenAlarmTrainerTemplateId = globalSetting.knowledgeProfileGreenAlarmTrainerTemplateId;
                        vm.stageInfo.stages[0].yellowAlarmParticipantTemplateId = globalSetting.knowledgeProfileYellowAlarmParticipantTemplateId;
                        vm.stageInfo.stages[0].yellowAlarmEvaluatorTemplateId = globalSetting.knowledgeProfileYellowAlarmEvaluatorTemplateId;
                        vm.stageInfo.stages[0].yellowAlarmManagerTemplateId = globalSetting.knowledgeProfileYellowAlarmManagerTemplateId;
                        vm.stageInfo.stages[0].yellowAlarmProjectManagerTemplateId = globalSetting.knowledgeProfileYellowAlarmProjectManagerTemplateId;
                        vm.stageInfo.stages[0].yellowAlarmFinalScoreManagerTemplateId = globalSetting.knowledgeProfileYellowAlarmFinalScoreManagerTemplateId;
                        vm.stageInfo.stages[0].yellowAlarmTrainerTemplateId = globalSetting.knowledgeProfileYellowAlarmTrainerTemplateId;
                        vm.stageInfo.stages[0].redAlarmParticipantTemplateId = globalSetting.knowledgeProfileRedAlarmParticipantTemplateId;
                        vm.stageInfo.stages[0].redAlarmEvaluatorTemplateId = globalSetting.knowledgeProfileRedAlarmEvaluatorTemplateId;
                        vm.stageInfo.stages[0].redAlarmManagerTemplateId = globalSetting.knowledgeProfileRedAlarmManagerTemplateId;
                        vm.stageInfo.stages[0].redAlarmProjectManagerTemplateId = globalSetting.knowledgeProfileRedAlarmProjectManagerTemplateId;
                        vm.stageInfo.stages[0].redAlarmFinalScoreManagerTemplateId = globalSetting.knowledgeProfileRedAlarmFinalScoreManagerTemplateId;
                        vm.stageInfo.stages[0].redAlarmTrainerTemplateId = globalSetting.knowledgeProfileRedAlarmTrainerTemplateId;
                    }
                    else {
                        vm.stageInfo.stages[0].emailNotification = true;
                        vm.stageInfo.stages[0].smsNotification = true;
                        vm.stageInfo.stages[0].externalStartNotificationTemplateId = vm.setParticipantStartNotificationTemplates();
                        vm.stageInfo.stages[0].evaluatorStartNotificationTemplateId = vm.setEvaluatorStartNotificationTemplates();
                        vm.stageInfo.stages[0].managerResultsNotificationTemplateId = vm.setManagerResultNotificationTemplates();
                        vm.stageInfo.stages[0].evaluatorResultsNotificationTemplateId = vm.setEvaluatorResultNotificationTemplates();
                        vm.stageInfo.stages[0].greenAlarmParticipantTemplateId = vm.setStartStageGreenAlarmParticipantTemplates();
                        vm.stageInfo.stages[0].greenAlarmEvaluatorTemplateId = vm.setStartStageGreenAlarmEvaluatorTemplates();
                        vm.stageInfo.stages[0].greenAlarmManagerTemplateId = vm.setStartStageGreenAlarmManagerTemplates();
                        vm.stageInfo.stages[0].greenAlarmTrainerTemplateId = vm.setStartStageGreenAlarmTrainerTemplates();
                        vm.stageInfo.stages[0].yellowAlarmParticipantTemplateId = vm.setStartStageYellowAlarmParticipantTemplates();
                        vm.stageInfo.stages[0].yellowAlarmEvaluatorTemplateId = vm.setStartStageYellowAlarmEvaluatorTemplates();
                        vm.stageInfo.stages[0].yellowAlarmManagerTemplateId = vm.setStartStageYellowAlarmManagerTemplates();
                        vm.stageInfo.stages[0].yellowAlarmTrainerTemplateId = vm.setStartStageYellowAlarmTrainerTemplates();
                        vm.stageInfo.stages[0].redAlarmParticipantTemplateId = vm.setStartStageRedAlarmParticipantTemplates();
                        vm.stageInfo.stages[0].redAlarmEvaluatorTemplateId = vm.setStartStageRedAlarmEvaluatorTemplates();
                        vm.stageInfo.stages[0].redAlarmManagerTemplateId = vm.setStartStageRedAlarmManagerTemplates();
                        vm.stageInfo.stages[0].redAlarmTrainerTemplateId = vm.setStartStageRedAlarmTrainerTemplates();
                    }
                }
                else if (profileTypeId == profileTypeEnum.Soft || profileTypeId == profileTypeEnum.Hard) {
                    var globalSetting = null;
                    if (projectInfo) {
                        if (projectInfo.projectGlobalSettings.length > 0) {
                            globalSetting = projectInfo.projectGlobalSettings[0]
                        }
                    }
                    if (globalSetting) {
                        _.each(vm.stageInfo.stages, function (stageItem, index) {
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
                                if (projectInfo.projectDefaultNotificationSettings.length > 0) {

                                    var projectDefaultNotificationSettings = projectInfo.projectDefaultNotificationSettings[0];

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

                        vm.stageInfo.stages[0].emailNotification = true;
                        vm.stageInfo.stages[0].smsNotification = true;
                        vm.stageInfo.stages[0].externalStartNotificationTemplateId = vm.setParticipantStartNotificationTemplates();
                        vm.stageInfo.stages[0].evaluatorStartNotificationTemplateId = vm.setEvaluatorStartNotificationTemplates();

                        vm.stageInfo.stages[0].managerResultsNotificationTemplateId = vm.setManagerResultNotificationTemplates();
                        vm.stageInfo.stages[0].evaluatorResultsNotificationTemplateId = vm.setEvaluatorResultNotificationTemplates();
                        vm.stageInfo.stages[0].greenAlarmParticipantTemplateId = vm.setStartStageGreenAlarmParticipantTemplates();
                        vm.stageInfo.stages[0].greenAlarmEvaluatorTemplateId = vm.setStartStageGreenAlarmEvaluatorTemplates();
                        vm.stageInfo.stages[0].greenAlarmManagerTemplateId = vm.setStartStageGreenAlarmManagerTemplates();
                        vm.stageInfo.stages[0].greenAlarmTrainerTemplateId = vm.setStartStageGreenAlarmTrainerTemplates();
                        vm.stageInfo.stages[0].yellowAlarmParticipantTemplateId = vm.setStartStageYellowAlarmParticipantTemplates();
                        vm.stageInfo.stages[0].yellowAlarmEvaluatorTemplateId = vm.setStartStageYellowAlarmEvaluatorTemplates();
                        vm.stageInfo.stages[0].yellowAlarmManagerTemplateId = vm.setStartStageYellowAlarmManagerTemplates();
                        vm.stageInfo.stages[0].yellowAlarmTrainerTemplateId = vm.setStartStageYellowAlarmTrainerTemplates();
                        vm.stageInfo.stages[0].redAlarmParticipantTemplateId = vm.setStartStageRedAlarmParticipantTemplates();
                        vm.stageInfo.stages[0].redAlarmEvaluatorTemplateId = vm.setStartStageRedAlarmEvaluatorTemplates();
                        vm.stageInfo.stages[0].redAlarmManagerTemplateId = vm.setStartStageRedAlarmManagerTemplates();
                        vm.stageInfo.stages[0].redAlarmTrainerTemplateId = vm.setStartStageRedAlarmTrainerTemplates();


                        vm.stageInfo.stages[0].redAlarmTime = moment(kendo.parseDate(vm.stageInfo.stages[0].endDateTime)).add(1, 'minutes').format('L LT');
                        vm.stageInfo.stages[0].yellowAlarmTime = moment(kendo.parseDate(vm.stageInfo.stages[0].endDateTime)).add(-180, 'minutes').format('L LT');
                        vm.stageInfo.stages[0].greenAlarmTime = moment(kendo.parseDate(vm.stageInfo.stages[0].endDateTime)).add(-1440, 'minutes').format('L LT');

                        if (vm.stageInfo.stages.length > 1) {
                            for (var i = 1; i < vm.stageInfo.stages.length; i++) {
                                vm.stageInfo.stages[i].emailNotification = true;
                                vm.stageInfo.stages[i].smsNotification = false;
                                vm.stageInfo.stages[i].externalStartNotificationTemplateId = vm.setParticipantMilestoneStartTemplates();
                                vm.stageInfo.stages[i].evaluatorStartNotificationTemplateId = vm.setEvaluatorMilestoneStartNotificationTemplates();

                                vm.stageInfo.stages[i].greenAlarmParticipantTemplateId = vm.setMilestoneGreenAlarmParticipantTemplates();
                                vm.stageInfo.stages[i].greenAlarmEvaluatorTemplateId = vm.setMilestoneGreenAlarmEvaluatorTemplates();
                                vm.stageInfo.stages[i].greenAlarmManagerTemplateId = vm.setMilestoneGreenAlarmManagerTemplates();
                                vm.stageInfo.stages[i].greenAlarmTrainerTemplateId = vm.setMilestoneGreenAlarmTrainerTemplates();
                                vm.stageInfo.stages[i].yellowAlarmParticipantTemplateId = vm.setMilestoneYellowAlarmParticipantTemplates();
                                vm.stageInfo.stages[i].yellowAlarmEvaluatorTemplateId = vm.setMilestoneYellowAlarmEvaluatorTemplates();
                                vm.stageInfo.stages[i].yellowAlarmManagerTemplateId = vm.setMilestoneYellowAlarmManagerTemplates();
                                vm.stageInfo.stages[i].yellowAlarmTrainerTemplateId = vm.setMilestoneYellowAlarmTrainerTemplates();
                                vm.stageInfo.stages[i].redAlarmParticipantTemplateId = vm.setMilestoneRedAlarmParticipantTemplates();
                                vm.stageInfo.stages[i].redAlarmEvaluatorTemplateId = vm.setMilestoneRedAlarmEvaluatorTemplates();
                                vm.stageInfo.stages[i].redAlarmManagerTemplateId = vm.setMilestoneRedAlarmManagerTemplates();
                                vm.stageInfo.stages[i].redAlarmTrainerTemplateId = vm.setMilestoneRedAlarmTrainerTemplates();

                                vm.stageInfo.stages[i].redAlarmTime = moment(kendo.parseDate(vm.stageInfo.stages[i].endDateTime)).add(1, 'minutes').format('L LT');
                                vm.stageInfo.stages[i].yellowAlarmTime = moment(kendo.parseDate(vm.stageInfo.stages[i].endDateTime)).add(-180, 'minutes').format('L LT');
                                vm.stageInfo.stages[i].greenAlarmTime = moment(kendo.parseDate(vm.stageInfo.stages[i].endDateTime)).add(-1440, 'minutes').format('L LT');
                            }
                        }

                    }
                }
                _.each(vm.stageInfo.stages, function (stageItem) {
                    var stageItemCopy = _.clone(stageItem);
                    stageItemCopy.startDateTime = kendo.parseDate(stageItemCopy.startDateTime);
                    stageItemCopy.endDateTime = kendo.parseDate(stageItemCopy.endDateTime);
                    stageItemCopy.greenAlarmTime = kendo.parseDate(stageItemCopy.greenAlarmTime);
                    stageItemCopy.yellowAlarmTime = kendo.parseDate(stageItemCopy.yellowAlarmTime);
                    stageItemCopy.redAlarmTime = kendo.parseDate(stageItemCopy.redAlarmTime);
                    stageItemCopy.evaluationStartDate = kendo.parseDate(stageItemCopy.evaluationStartDate);
                    stageItemCopy.evaluationEndDate = kendo.parseDate(stageItemCopy.evaluationEndDate);
                    stageItemCopy.invitedAt = kendo.parseDate(stageItemCopy.invitedAt);
                    stageGroupManager.updateStage(stageItemCopy).then(function (data) {
                    },
                        function (data) {
                        });
                })
            }
        }
        vm.ParticipantStartNotificationTemplates = function () {
            var filterTemplate = _.find(notificationTemplates, function (item) {
                return item.culture.cultureName == globalVariables.lang.currentUICulture && item.stageTypeId == stageTypesEnum.StartProfile && item.notificationTemplateTypeId == templateTypeEnum.MilestoneStartNotification && item.evaluationRoleId == evaluationRolesEnum.participant && item.isDefualt == true && vm.profileTypeId == item.profileTypeId;
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
        vm.ParticipantMilestoneStartTemplates = function () {
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
        vm.EvaluatorStartNotificationTemplates = function () {
            var filterTemplate = _.find(notificationTemplates, function (item) {
                return item.culture.cultureName == globalVariables.lang.currentUICulture && item.stageTypeId == stageTypesEnum.StartProfile && item.notificationTemplateTypeId == templateTypeEnum.MilestoneStartNotification && item.evaluationRoleId == evaluationRolesEnum.evaluator && item.isDefualt == true && vm.profileTypeId == item.profileTypeId;
            });
            if (filterTemplate) {
                return filterTemplate.id;
            }
            else {
                var filterTemplate = _.find(notificationTemplates, function (item) {
                    return item.stageTypeId == stageTypesEnum.StartProfile && item.notificationTemplateTypeId == templateTypeEnum.MilestoneStartNotification && item.evaluationRoleId == evaluationRolesEnum.evaluator && item.isDefualt == true && vm.profileTypeId == item.profileTypeId;
                });
                if (filterTemplate) {
                    return filterTemplate.id;
                }
            }
        }
        vm.EvaluatorMilestoneStartNotificationTemplates = function (item) {
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

        vm.StartStageGreenAlarmParticipantTemplates = function (item) {
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
        vm.StartStageGreenAlarmEvaluatorTemplates = function (item) {
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
        vm.StartStageGreenAlarmManagerTemplates = function (item) {
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
        vm.StartStageGreenAlarmTrainerTemplates = function (item) {
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
        vm.MilestoneGreenAlarmParticipantTemplates = function (item) {
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
        vm.MilestoneGreenAlarmEvaluatorTemplates = function (item) {
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
        vm.MilestoneGreenAlarmManagerTemplates = function (item) {
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
        vm.MilestoneGreenAlarmTrainerTemplates = function (item) {
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
        vm.StartStageYellowAlarmParticipantTemplates = function (item) {
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
        vm.StartStageYellowAlarmEvaluatorTemplates = function (item) {
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
        vm.StartStageYellowAlarmManagerTemplates = function (item) {
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
        vm.StartStageYellowAlarmTrainerTemplates = function (item) {
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
        vm.MilestoneYellowAlarmParticipantTemplates = function (item) {
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
        vm.MilestoneYellowAlarmEvaluatorTemplates = function (item) {
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
        vm.MilestoneYellowAlarmManagerTemplates = function (item) {
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
        vm.MilestoneYellowAlarmTrainerTemplates = function (item) {
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
        vm.StartStageRedAlarmParticipantTemplates = function (item) {
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
        vm.StartStageRedAlarmEvaluatorTemplates = function (item) {
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
        vm.StartStageRedAlarmManagerTemplates = function (item) {
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
        vm.StartStageRedAlarmTrainerTemplates = function (item) {
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
        vm.MilestoneRedAlarmParticipantTemplates = function (item) {
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
        vm.MilestoneRedAlarmEvaluatorTemplates = function (item) {
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
        vm.MilestoneRedAlarmManagerTemplates = function (item) {
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
        vm.MilestoneRedAlarmTrainerTemplates = function (item) {
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


        vm.setParticipantStartNotificationTemplates = function () {
            var filterTemplate = _.find(notificationTemplates, function (item) {
                return item.culture.cultureName == globalVariables.lang.currentUICulture && item.stageTypeId == stageTypesEnum.StartProfile && item.notificationTemplateTypeId == templateTypeEnum.MilestoneStartNotification && item.evaluationRoleId == evaluationRolesEnum.participant && item.isDefualt == true && vm.profileTypeId == item.profileTypeId;
            });
            if (filterTemplate) {
                return filterTemplate.id;
            }
            else {
                var filterTemplate = _.find(notificationTemplates, function (item) {
                    return item.stageTypeId == stageTypesEnum.StartProfile && item.notificationTemplateTypeId == templateTypeEnum.MilestoneStartNotification && item.evaluationRoleId == evaluationRolesEnum.participant && item.isDefualt == true && vm.profileTypeId == item.profileTypeId;
                });
                if (filterTemplate) {
                    return filterTemplate.id;
                }
            }
        }
        vm.setParticipantMilestoneStartTemplates = function () {
            var filterTemplate = _.find(notificationTemplates, function (item) {
                return item.culture.cultureName == globalVariables.lang.currentUICulture && item.stageTypeId == stageTypesEnum.Milestone && item.notificationTemplateTypeId == templateTypeEnum.MilestoneStartNotification && item.evaluationRoleId == evaluationRolesEnum.participant && item.isDefualt == true && vm.profileTypeId == item.profileTypeId;
            });
            if (filterTemplate) {
                return filterTemplate.id;
            }
            else {
                var filterTemplate = _.find(notificationTemplates, function (item) {
                    return item.stageTypeId == stageTypesEnum.Milestone && item.notificationTemplateTypeId == templateTypeEnum.MilestoneStartNotification && item.evaluationRoleId == evaluationRolesEnum.participant && item.isDefualt == true && vm.profileTypeId == item.profileTypeId;
                });
                if (filterTemplate) {
                    return filterTemplate.id;
                }
            }
        }
        vm.setEvaluatorStartNotificationTemplates = function () {
            var filterTemplate = _.find(notificationTemplates, function (item) {
                return item.culture.cultureName == globalVariables.lang.currentUICulture && item.stageTypeId == stageTypesEnum.StartProfile && item.notificationTemplateTypeId == templateTypeEnum.MilestoneStartNotification && item.evaluationRoleId == evaluationRolesEnum.evaluator && item.isDefualt == true && vm.profileTypeId == item.profileTypeId;
            });
            if (filterTemplate) {
                return filterTemplate.id;
            }
            else {
                var filterTemplate = _.find(notificationTemplates, function (item) {
                    return item.stageTypeId == stageTypesEnum.StartProfile && item.notificationTemplateTypeId == templateTypeEnum.MilestoneStartNotification && item.evaluationRoleId == evaluationRolesEnum.evaluator && item.isDefualt == true && vm.profileTypeId == item.profileTypeId;
                });
                if (filterTemplate) {
                    return filterTemplate.id;
                }
            }
        }


        vm.setManagerResultNotificationTemplates = function () {
            var filterTemplate = _.find(notificationTemplates, function (item) {
                return item.culture.cultureName == globalVariables.lang.currentUICulture && item.stageTypeId == stageTypesEnum.Milestone && item.notificationTemplateTypeId == templateTypeEnum.MilestoneResultNotification && item.evaluationRoleId == evaluationRolesEnum.manager && item.isDefualt == true && vm.profileTypeId == item.profileTypeId;
            });
            if (filterTemplate) {
                return filterTemplate.id;
            }
            else {
                var filterTemplate = _.find(notificationTemplates, function (item) {
                    return item.stageTypeId == stageTypesEnum.Milestone && item.notificationTemplateTypeId == templateTypeEnum.MilestoneResultNotification && item.evaluationRoleId == evaluationRolesEnum.manager && item.isDefualt == true && vm.profileTypeId == item.profileTypeId;
                });
                if (filterTemplate) {
                    return filterTemplate.id;
                }
            }
        }
        vm.setEvaluatorResultNotificationTemplates = function () {
            var filterTemplate = _.find(notificationTemplates, function (item) {
                return item.culture.cultureName == globalVariables.lang.currentUICulture && item.stageTypeId == stageTypesEnum.Milestone && item.notificationTemplateTypeId == templateTypeEnum.MilestoneResultNotification && item.evaluationRoleId == evaluationRolesEnum.evaluator && item.isDefualt == true && vm.profileTypeId == item.profileTypeId;
            });
            if (filterTemplate) {
                return filterTemplate.id;
            }
            else {
                var filterTemplate = _.find(notificationTemplates, function (item) {
                    return item.stageTypeId == stageTypesEnum.Milestone && item.notificationTemplateTypeId == templateTypeEnum.MilestoneResultNotification && item.evaluationRoleId == evaluationRolesEnum.evaluator && item.isDefualt == true && vm.profileTypeId == item.profileTypeId;
                });
                if (filterTemplate) {
                    return filterTemplate.id;
                }
            }
        }
        vm.setEvaluatorMilestoneStartNotificationTemplates = function () {
            var filterTemplate = _.find(notificationTemplates, function (item) {
                return item.culture.cultureName == globalVariables.lang.currentUICulture && item.stageTypeId == stageTypesEnum.Milestone && item.notificationTemplateTypeId == templateTypeEnum.MilestoneStartNotification && item.evaluationRoleId == evaluationRolesEnum.evaluator && item.isDefualt == true && vm.profileTypeId == item.profileTypeId;
            });
            if (filterTemplate) {
                return filterTemplate.id;
            }
            else {
                var filterTemplate = _.find(notificationTemplates, function (item) {
                    return item.stageTypeId == stageTypesEnum.Milestone && item.notificationTemplateTypeId == templateTypeEnum.MilestoneStartNotification && item.evaluationRoleId == evaluationRolesEnum.evaluator && item.isDefualt == true && vm.profileTypeId == item.profileTypeId;
                });
                if (filterTemplate) {
                    return filterTemplate.id;
                }
            }
        }

        vm.setStartStageGreenAlarmParticipantTemplates = function () {
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
        vm.setStartStageGreenAlarmEvaluatorTemplates = function () {
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
        vm.setStartStageGreenAlarmManagerTemplates = function () {
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
        vm.setStartStageGreenAlarmTrainerTemplates = function () {
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
        vm.setMilestoneGreenAlarmParticipantTemplates = function () {
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
        vm.setMilestoneGreenAlarmEvaluatorTemplates = function () {
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
        vm.setMilestoneGreenAlarmManagerTemplates = function () {
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
        vm.setMilestoneGreenAlarmTrainerTemplates = function () {
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

        vm.setStartStageYellowAlarmParticipantTemplates = function () {
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
        vm.setStartStageYellowAlarmEvaluatorTemplates = function () {
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
        vm.setStartStageYellowAlarmManagerTemplates = function () {
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
        vm.setStartStageYellowAlarmTrainerTemplates = function () {
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
        vm.setMilestoneYellowAlarmParticipantTemplates = function () {
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
        vm.setMilestoneYellowAlarmEvaluatorTemplates = function () {
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
        vm.setMilestoneYellowAlarmManagerTemplates = function () {
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
        vm.setMilestoneYellowAlarmTrainerTemplates = function () {
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

        vm.setStartStageRedAlarmParticipantTemplates = function () {
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
        vm.setStartStageRedAlarmEvaluatorTemplates = function () {
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
        vm.setStartStageRedAlarmManagerTemplates = function () {
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
        vm.setStartStageRedAlarmTrainerTemplates = function () {
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
        vm.setMilestoneRedAlarmParticipantTemplates = function () {
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
        vm.setMilestoneRedAlarmEvaluatorTemplates = function () {
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
        vm.setMilestoneRedAlarmManagerTemplates = function () {
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
        vm.setMilestoneRedAlarmTrainerTemplates = function () {
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

        function stageChanged() {
            var stagesAndAlarmsGridId = $("#stagesAndAlarmsGridId").data("kendoGrid");
            if (stagesAndAlarmsGridId) {
                //kendo.ui.progress(stagesAndAlarmsGridId, true);
            }
            stageGroupManager.getStageParticipants($stateParams.stageGroupId, vm.stagesAndAlarmsStageId, profileTypeId).then(function (data) {
                if (stagesAndAlarmsGridId) {
                    //kendo.ui.progress(stagesAndAlarmsGridId, false);
                }
            })
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
        function getById(id, myArray) {
            if (myArray.filter) {
                return myArray.filter(function (obj) {
                    if (obj.id == id) {
                        return obj;
                    }
                })[0];
            }
            return undefined;
        }
        vm.stagesAndAlarmsOptions = {
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
                { field: "roleId", title: $translate.instant('COMMON_ROLE'), width: "10%", values: vm.evaluationRoles },
                { field: "isKPISetText", title: $translate.instant('SOFTPROFILE_SET_KPI'), width: "7%" },
                { field: "evaluationStatusText", title: $translate.instant('COMMON_STATUS'), width: "10%" },
                { field: "evaluateeName", title: $translate.instant('SOFTPROFILE_EVALUATEE'), width: "21%" },
                {
                    field: "actions", title: $translate.instant('COMMON_ACTIONS'), width: "7%", filterable: false,
                    template: function (dataItem) {
                        var tmpl = "<div class='icon-groups'>";
                        if (dataItem.evaluationStatus) {
                            if (dataItem.evaluationStatus.endedAt) {
                                if (!dataItem.evaluationStatus.isOpen && vm.isAdmin && vm.profileTypeId == vm.profilesTypesEnum.soft) {
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
        vm.historyOfSurveysOptions = {
            dataBound: onUserAssignGridDataBound,
            dataSource: {
                type: "json",
                data: vm.stageInfo.stages,
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
        vm.tooltipOptions = {
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
        function sendStartNotification(stageId) {
            var item = angular.copy(vm.stage);
            if (item.id > 0) {
                return stageGroupManager.updateStage(item).then(function (data) {
                    return stageGroupManager.sendStartNotification(stageId);
                }, function (error) {
                    dialogService.showNotification(error, "warning");
                });
            }
        }
        function sendStartNotificationForParticipant(participantId, stageId, templateId) {
            var item = angular.copy(vm.stage);
            if (item.id > 0) {
                return stageGroupManager.sendStartNotificationForParticipant(participantId, stageId, templateId);
            }
        }
        function formatStartDateTime(item) {
            return moment(item.startDateTime).format('L LT');
        }
        function changeStartDate(newValue, oldValue) {
            if (datetimeCalculator.isValidDatePatern(newValue, 'L') && datetimeCalculator.isValidDatePatern(oldValue, 'L')) {
                var difference = datetimeCalculator.getTimeDifference(newValue, oldValue);
                var firstStage = vm.stageInfo.stages[0];
                var lastStage = vm.stageInfo.stages[vm.stageInfo.stages.length - 1]
                if (difference > 0 && !datetimeCalculator.isFirstDateEarlier(newValue, firstStage.startDateTime)) {
                    datetimeCalculator.shiftStageDates(vm.stageInfo.stages, difference);
                    datetimeCalculator.checkEndLimit(vm.stageInfo, lastStage);
                }
            }
        }
        function validateDate(date) {
            date = moment(kendo.parseDate(date)).format("L LT");
            return datetimeCalculator.isValidDatePatern(date, 'L') || datetimeCalculator.isValidDatePatern(date, 'L LT');
        }
        function validateDateTime(date, isRequered) {
            if (isRequered) {
                return datetimeCalculator.isValidDatePatern(date, 'L LT');
            } else {
                return !date || datetimeCalculator.isValidDatePatern(date, 'L LT');
            }
        };
        function changeEndDate(newValue, oldValue) {
            if (datetimeCalculator.isValidDatePatern(newValue, 'L') && datetimeCalculator.isValidDatePatern(oldValue, 'L')) {
                var difference = datetimeCalculator.getTimeDifference(newValue, oldValue);
                var firstStage = vm.stageInfo.stages[0];
                var lastStage = vm.stageInfo.stages[vm.stageInfo.stages.length - 1]
                if (difference < 0 && !datetimeCalculator.isFirstDateEarlier(lastStage.endDateTime, newValue)) {
                    datetimeCalculator.shiftStageDates(vm.stageInfo.stages, difference);
                    datetimeCalculator.checkStartLimit(vm.stageInfo, firstStage);
                }
            }
        }
        vm.sendStartNotification = sendStartNotification;
        vm.sendStartNotificationForParticipant = sendStartNotificationForParticipant;
        vm.formatStartDateTime = formatStartDateTime;
        vm.addParticipant = addParticipant;
        vm.refreshParticipant = refreshParticipant;
        vm.analyseAnswers = analyseAnswers;
        vm.removeParticipant = removeParticipant;
        vm.removeAllParticipants = removeAllParticipants;
        vm.selfEvaluationUpdate = selfEvaluationUpdate;
        vm.lockUpdate = lockUpdate;
        vm.scoreManagerUpdate = scoreManagerUpdate;
        vm.restartStage = restartStage;
        vm.changeStartDate = changeStartDate;
        vm.changeEndDate = changeEndDate;
        vm.isDateValid = validateDate;
        vm.stageChanged = stageChanged;
        vm.isFinalGoal = isFinalGoal;
        vm.save = save;
        vm.saveStage = saveStage;
        vm.saveAllStages = saveAllStages;
        vm.removeStage = removeStage;
        vm.removeStageGroup = removeStageGroup;
        vm.selectStage = selectStage;
        vm.addStage = addStage;
        vm.goBack = goBack;
        vm.isEdit = isEdit;
        vm.setDefaults = setDefaults;
        if (localStorageService.get("isNewAdded")) {
            if (localStorageService.get("isNewAdded") == "true") {
                setDefaults();
                localStorageService.remove('isNewAdded');
            }
        }

        vm.StageGroupStartDateOpen = function (event) {
            var datepicker = $(event.sender.element).data("kendoDatePicker");
            if (vm.projectInfo) {
                datepicker.setOptions({
                    min: kendo.parseDate(vm.projectInfo.expectedStartDate)
                });
            }
        }

        vm.StageGroupEndDateOpen = function (event) {
            var datepicker = $(event.sender.element).data("kendoDatePicker")
            if (vm.projectInfo) {
                datepicker.setOptions({
                    min: kendo.parseDate(vm.projectInfo.expectedStartDate),
                    max: kendo.parseDate(vm.projectInfo.expectedEndDate)
                });
            }
        };


    }
})();