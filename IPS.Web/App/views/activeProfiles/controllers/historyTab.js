(function () {
    'use strict';

    angular
        .module('ips.activeProfiles')
        .controller('historyTabCtrl', historyTabCtrl);

    historyTabCtrl.$inject = ['$scope', 'cssInjector', 'activeProfilesService', '$location', 'profilesTypesEnum', 'stageGroupManager', 'dialogService', '$translate','globalVariables'];

    function historyTabCtrl($scope, cssInjector, activeProfilesService, $location, profilesTypesEnum, stageGroupManager, dialogService, $translate, globalVariables) {
        cssInjector.removeAll();
        cssInjector.add('views/activeProfiles/activeProfiles.css');
        moment.locale(globalVariables.lang.currentUICulture);
        var vm = this;

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

        function showAnalysis(profileId, stageId, participantId, evaluateeId) {
            evaluateeId = (evaluateeId) ? evaluateeId : participantId;
            $location.path("/home/surveyAnalysis/" + profileId + "/" + stageId + "/" + participantId + "/" + evaluateeId);
        }

        function viewFinalKPI(profileId, stageId, participantId, evaluateeId) {
            $location.path("/home/previewFinalKPI/" + profileId + "/" + stageId + "/" + participantId + "/" + evaluateeId);
        }

        function editFinalKPI(profileId, stageId, participantId, evaluateeId) {
            $location.path("/home/editFinalKPI/" + profileId + "/" + stageId + "/" + participantId + "/" + evaluateeId + "/" + true);
        }

        function goToDevContract(profileId, stageId, participantId, evaluateeId) {
            $location.path("/home/previewFinalKPI/" + profileId + "/" + stageId + "/" + participantId + "/" + evaluateeId + "/devContract");
        }

        function goToRCTContract(profileId, stageId, participantId, evaluateeId) {
            $location.path("/home/previewFinalKPI/" + profileId + "/" + stageId + "/" + participantId + "/" + evaluateeId + "/rctContract");
        }
        function previewDevContract(profileId, stageId, participantId, evaluateeId) {
            $location.path("/homes/previewDevContract/" + profileId + "/" + stageId + "/" + participantId + "/" + evaluateeId);
        }

        function getProfileTypeName(profilesTypeId) {
            if (profilesTypeId == profilesTypesEnum.soft) {
                return "Soft Profile";
            }
            else if (profilesTypeId == profilesTypesEnum.knowledgetest) {
                return "Knowledge Profile";
            }
            else {
                return "";
            }
        }


        function StageGroupStartStageStartDateOpen(event) {
            var datepicker = $(event.sender.element).data("kendoDateTimePicker");
            datepicker.setOptions({
                min: kendo.parseDate(vm.stageRestart.startDate),
                max: kendo.parseDate(vm.stageRestart.endDate)
            });
        }
        function StageGroupStartStageStartDateChange(event) {

            if ((kendo.parseDate(vm.stageRestart.startStageStartDate) > kendo.parseDate(vm.stageRestart.startStageEndDate))) {
                vm.stageRestart.startStageEndDate = null;
            }
        };

        function StageGroupStartStageEndDateOpen(event) {
            var datepicker = $(event.sender.element).data("kendoDateTimePicker")
            datepicker.setOptions({
                min: kendo.parseDate(vm.stageRestart.startStageStartDate),
                max: kendo.parseDate(vm.stageRestart.endDate)
            });
        };
        function StageGroupStartStageEndDateChange(event) {
            vm.stageRestart.milestoneStartDate = moment(kendo.parseDate(event.sender.value())).format('L LT');
        };

        function StageGroupMilestoneStartDateOpen(event) {
            var datepicker = $(event.sender.element).data("kendoDateTimePicker");
            datepicker.setOptions({
                min: kendo.parseDate(vm.stageRestart.startStageEndDate),
                max: kendo.parseDate(vm.stageRestart.endDate)
            });
        }
        function StageGroupMilestoneStartDateChange(event) {
            if ((kendo.parseDate(event.sender.value()) > kendo.parseDate(vm.stageRestart.milestoneEndDate))) {
                vm.stageRestart.milestoneEndDate = "";
            }
            else {
                var diffTime = null;
                var a = moment(kendo.parseDate(vm.stageRestart.milestoneEndDate));
                var b = moment(kendo.parseDate(event.sender.value()));
                diffTime = a.diff(b);
                if (vm.profileTypeId == profilesTypesEnum.soft) {
                    var duration = moment.duration(diffTime);
                    vm.sendOutMilestoneDiffrence = {
                        months: duration.months(),
                        weeks: duration.weeks(),
                        days: duration.days(),
                        hours: duration.hours(),
                        minutes: duration.minutes(),
                    }
                    if (duration.weeks() > 0) {
                        vm.sendOutMilestoneDiffrence.days = vm.sendOutMilestoneDiffrence.days - (duration.weeks() * 7);
                    }
                    if (duration.years() > 0) {
                        vm.sendOutMilestoneDiffrence.months = vm.sendOutMilestoneDiffrence.months + (duration.years() * 12);
                    }
                    if (vm.stageRestart.totalMilestones > 0) {
                        diffTime = a.diff(b) / vm.stageRestart.totalMilestones; // 1
                    }
                    else {
                        diffTime = a.diff(b) / 5; // 1
                    }
                }
                duration = moment.duration(diffTime);
                vm.stageRestart.actualTimeSpan = diffTime,
                    vm.stageRestart.monthsSpan = duration.months();
                if (duration.years() > 0) {
                    vm.stageRestart.monthsSpan = vm.stageRestart.monthsSpan + (duration.years() * 12);
                }
                vm.stageRestart.weeksSpan = duration.weeks();
                vm.stageRestart.daysSpan = duration.days();
                if (vm.stageRestart.weeksSpan > 0) {
                    vm.stageRestart.daysSpan = vm.stageRestart.daysSpan - (vm.stageRestart.weeksSpan * 7);
                }
                vm.stageRestart.hoursSpan = duration.hours();
                vm.stageRestart.minutesSpan = duration.minutes();
            }

        };

        function StageGroupMilestoneEndDateOpen(event) {
            var datepicker = $(event.sender.element).data("kendoDateTimePicker")
            datepicker.setOptions({
                min: kendo.parseDate(vm.stageRestart.milestoneStartDate),
                max: kendo.parseDate(vm.stageRestart.endDate)
            });
        };
        function StageGroupMilestoneEndDateChange(event) {
            var diffTime = null;
            var a = moment(kendo.parseDate(event.sender.value()));
            var b = moment(kendo.parseDate(vm.stageRestart.milestoneStartDate));
            diffTime = a.diff(b);
            if (vm.profileTypeId == profilesTypesEnum.soft) {
                var duration = moment.duration(diffTime);
                vm.sendOutMilestoneDiffrence = {
                    months: duration.months(),
                    weeks: duration.weeks(),
                    days: duration.days(),
                    hours: duration.hours(),
                    minutes: duration.minutes(),
                }
                if (duration.weeks() > 0) {
                    vm.sendOutMilestoneDiffrence.days = vm.sendOutMilestoneDiffrence.days - (duration.weeks() * 7);
                }
                if (duration.years() > 0) {
                    vm.sendOutMilestoneDiffrence.months = vm.sendOutMilestoneDiffrence.months + (duration.years() * 12);
                }
                if (vm.stageRestart.totalMilestones > 0) {
                    diffTime = a.diff(b) / vm.stageRestart.totalMilestones; // 1
                }
                else {
                    diffTime = a.diff(b) / 5; // 1
                }
            }
            duration = moment.duration(diffTime);
            vm.stageRestart.actualTimeSpan = diffTime,
                vm.stageRestart.monthsSpan = duration.months();
            if (duration.years() > 0) {
                vm.stageRestart.monthsSpan = vm.stageRestart.monthsSpan + (duration.years() * 12);
            }
            vm.stageRestart.weeksSpan = duration.weeks();
            vm.stageRestart.daysSpan = duration.days();
            if (vm.stageRestart.weeksSpan > 0) {
                vm.stageRestart.daysSpan = vm.stageRestart.daysSpan - (vm.stageRestart.weeksSpan * 7);
            }
            vm.stageRestart.hoursSpan = duration.hours();
            vm.stageRestart.minutesSpan = duration.minutes();
        };

        function numberOfMilestoneChange() {
            var diffTime = null;
            if (vm.stageRestart.milestoneStartDate && vm.stageRestart.milestoneEndDate) {
                var a = moment(kendo.parseDate(vm.stageRestart.milestoneEndDate));
                var b = moment(kendo.parseDate(vm.stageRestart.milestoneStartDate));
                diffTime = a.diff(b);
                if (vm.profileTypeId == profilesTypesEnum.soft) {
                    var duration = moment.duration(diffTime);
                    vm.sendOutMilestoneDiffrence = {
                        months: duration.months(),
                        weeks: duration.weeks(),
                        days: duration.days(),
                        hours: duration.hours(),
                        minutes: duration.minutes(),
                    }
                    if (duration.weeks() > 0) {
                        vm.sendOutMilestoneDiffrence.days = vm.sendOutMilestoneDiffrence.days - (duration.weeks() * 7);
                    }
                    if (duration.years() > 0) {
                        vm.sendOutMilestoneDiffrence.months = vm.sendOutMilestoneDiffrence.months + (duration.years() * 12);
                    }
                    if (vm.stageRestart.totalMilestones > 0) {
                        diffTime = a.diff(b) / vm.stageRestart.totalMilestones; // 1
                    }
                    else {
                        diffTime = a.diff(b) / 5; // 1
                    }
                }
                duration = moment.duration(diffTime);
                vm.stageRestart.actualTimeSpan = diffTime,
                    vm.stageRestart.monthsSpan = duration.months();
                if (duration.years() > 0) {
                    vm.stageRestart.monthsSpan = vm.stageRestart.monthsSpan + (duration.years() * 12);
                }
                vm.stageRestart.weeksSpan = duration.weeks();
                vm.stageRestart.daysSpan = duration.days();
                if (vm.stageRestart.weeksSpan > 0) {
                    vm.stageRestart.daysSpan = vm.stageRestart.daysSpan - (vm.stageRestart.weeksSpan * 7);
                }
                vm.stageRestart.hoursSpan = duration.hours();
                vm.stageRestart.minutesSpan = duration.minutes();
            }
            else {
                var a = moment(kendo.parseDate(vm.stageRestart.endDate));
                var b = moment(kendo.parseDate(vm.stageRestart.startDate));
                diffTime = a.diff(b);
                if (vm.profileTypeId == profilesTypesEnum.Soft) {
                    var duration = moment.duration(diffTime);
                    vm.sendOutTotalDiffrence = {
                        months: duration.months(),
                        weeks: duration.weeks(),
                        days: duration.days(),
                        hours: duration.hours(),
                        minutes: duration.minutes(),
                    }
                    if (duration.weeks() > 0) {
                        vm.sendOutTotalDiffrence.days = vm.sendOutTotalDiffrence.days - (vm.stageRestart.weeksSpan * 7);
                    }
                    if (duration.years() > 0) {
                        vm.sendOutTotalDiffrence.months = vm.sendOutTotalDiffrence.months + (duration.years() * 12);
                    }
                    if (vm.stageRestart.totalMilestones > 0) {
                        diffTime = a.diff(b) / vm.stageRestart.totalMilestones; // 1
                    }
                    else {
                        diffTime = a.diff(b) / 5; // 1
                    }
                }
                duration = moment.duration(diffTime);
                vm.stageRestart.actualTimeSpan = diffTime,
                    vm.stageRestart.monthsSpan = duration.months();
                if (duration.years() > 0) {
                    vm.stageRestart.monthsSpan = vm.stageRestart.monthsSpan + (duration.years() * 12);
                }
                vm.stageRestart.weeksSpan = duration.weeks();
                vm.stageRestart.daysSpan = duration.days();
                if (vm.stageRestart.weeksSpan > 0) {
                    vm.stageRestart.daysSpan = vm.stageRestart.daysSpan - (vm.stageRestart.weeksSpan * 7);
                }
                vm.stageRestart.hoursSpan = duration.hours();
                vm.stageRestart.minutesSpan = duration.minutes();
            }
        }

        vm.stageRestart = {
            stageGroupId: 0,
            name: "Send out setting",
            startDate: moment(new Date()).add('days', 1).format('L LT'),
            endDate: moment(new Date()).add('month', 3).format('L LT'),
            description: "",
            monthsSpan: 0,
            weeksSpan: 6,
            daysSpan: 0,
            hoursSpan: 0,
            minutesSpan: 0,
            participantId: 0,
            startStageStartDate: null,
            startStageEndDate: null,
            milestoneStartDate: null,
            milestoneEndDate: null,
            totalMilestones: 5
        }

        vm.confirmRestartProfile = function (stageGroupId, participantId, endDateTime, profileTypeId) {
            vm.stageRestart.stageGroupId = stageGroupId;
            stageGroupManager.getAllStageByStageGroupId(stageGroupId).then(function (data) {
                vm.stageRestart.startDate = moment(kendo.parseDate(endDateTime)).isAfter(moment(new Date()), "day") ? moment(kendo.parseDate(endDateTime)).add('days', 1).format('L LT') : moment(new Date()).add('days', 1).format('L LT');
                vm.stageRestart.endDate = moment(kendo.parseDate(endDateTime)).isAfter(moment(new Date()), "day") ? moment(kendo.parseDate(endDateTime)).add('months', 1).format('L LT') : moment(new Date()).add('months', 3).format('L LT');
                vm.stageRestart.participantId = participantId;
                vm.stageRestart.totalMilestones = data.length;
                vm.stageRestart.startStageStartDate = vm.stageRestart.startDate;
                vm.profileTypeId = profileTypeId;
                $(".bs-example-modal-lg").modal('show');
            })

        }
        vm.cancelRestartProfile = function () {
            $(".bs-example-modal-lg").modal('hide');
        }
        vm.restartProfile = function (stageGroupId, participantId, endDateTime) {
            if ($scope.nextPhaseForm.$valid) {
                if (vm.stageRestart.stageGroupId && vm.stageRestart.participantId) {
                    stageGroupManager.restartSoftProfile(vm.stageRestart.stageGroupId, vm.stageRestart, vm.stageRestart.participantId).then(function (data) {
                        if (data) {
                            //submit(evaluationAgreements, true);
                            $(".bs-example-modal-lg").modal('hide');
                            dialogService.showNotification($translate.instant('MYPROFILES_NEW_PHASE_CREATED_SUCCESSFULLY'), 'info');
                            $location.path("/home/profiles/profiles/" + data.profileTypeName.toLowerCase() + "/edit/" + data.profileId + "/stageGroups/active/edit/" + data.stageGroupId)
                        }
                    });
                }
            }
        }
        vm.goToScorecard = function (profileId, stageId, participantId, evaluateeId, stageEvolutionId) {
            evaluateeId = (evaluateeId) ? evaluateeId : participantId;
            $location.path("/home/knowledgetest_result/" + profileId + "/" + stageId + "/" + evaluateeId + '/' + stageEvolutionId);
        };

        vm.isKnowledge = function (profileTypeId) {
            return (profileTypeId == profilesTypesEnum.knowledgetest);
        };

        vm.beginAnalysis = function (profileId, stageId, participantId, evaluateeId, profileTypeId, stageEvolutionId) {
            if (profileTypeId == profilesTypesEnum.knowledgetest) {
                evaluateeId = (evaluateeId) ? evaluateeId : participantId;
                $location.path("/home/knowledgetest_analysis/" + profileId + "/" + stageId + "/" + evaluateeId + '/' + stageEvolutionId);
            }
        };

        vm.goToAgreements = function (profileId, stageId, participantId, evaluateeId, stageEvolutionId) {
            evaluateeId = (evaluateeId) ? evaluateeId : participantId;
            $location.path("/home/kt_final_kpi_preview/" + profileId + "/" + stageId + "/" + evaluateeId + '/' + stageEvolutionId);
        };

        vm.getEvaluationRole = getEvaluationRole;
        vm.showAnalysis = showAnalysis;
        vm.viewFinalKPI = viewFinalKPI;
        vm.editFinalKPI = editFinalKPI;
        vm.goToDevContract = goToDevContract;
        vm.goToRCTContract = goToRCTContract;
        vm.previewDevContract = previewDevContract;
        vm.getProfileTypeName = getProfileTypeName;
        vm.historyOptions = {
            dataSource: {
                type: "json",
                transport: {
                    read: function (options) {
                        activeProfilesService.getHistoryProfiles().then(function (data) {
                            for (var j = 0; j < data.length; j++) {
                                if (!data[j].profile.project) {
                                    data[j].profile.project = {
                                        name: "",
                                    }
                                }
                            }
                            options.success(data);
                        })
                    }
                },
                group: {
                    field: "profile.project.name",
                    dir: "asc"
                }
            },
            selectable: false,
            sortable: {
                mode: "single",
                allowUnsort: true
            },
            resizable: true,
            columns: [
                {
                    field: "profile.project.name", title: $translate.instant('COMMON_PROJECT'), width: '150px', sortable: {
                        compare: function (a, b) {
                            return a == "" && b == "" ? a > b ? 1 : (a < b ? -1 : 0) : 1;
                        }
                    }, template: function (dataItem, value) {
                        if (dataItem.profile.project) {
                            return dataItem.profile.project.name;
                        }
                        else {
                            return "";
                        }
                    }
                },
                {
                    field: "profile", title: $translate.instant('COMMON_PROFILE'), width: '120px',
                    sortable: {
                        compare: function (a, b) {
                            return a.profile.name > b.profile.name ? 1 : (a.profile.name < b.profile.name ? -1 : 0);
                        }
                    },
                    template: "<div>{{dataItem.profile.name}}</div>"
                },
                {
                    field: "profile", title: $translate.instant('COMMON_PROFILE_TYPE'), width: '150px', sortable: {
                        compare: function (a, b) {
                            return a.profile.profileTypeName > b.profile.profileTypeName ? 1 : (a.profile.profileTypeName < b.profile.profileTypeName ? -1 : 0);
                        }
                    }, template: "<div>{{history.getProfileTypeName(dataItem.profile.profileTypeId)}}</div>"
                },
                {
                    field: "stage", title: $translate.instant('COMMON_STAGE'), width: '100px',
                    sortable: {
                        compare: function (a, b) {
                            return a.stage.name > b.stage.name ? 1 : (a.stage.name < b.stage.name ? -1 : 0);
                        }
                    }, template: "<div>{{dataItem.stage.name}}</div>"
                },
                {
                    field: "role", title: $translate.instant('COMMON_ROLE'), width: '100px',
                    sortable: {
                        compare: function (a, b) {
                            var a1 = getEvaluationRole(a.participant.evaluationRoleId);
                            var b1 = getEvaluationRole(b.participant.evaluationRoleId);
                            return a1 > b1 ? 1 : (a1 < b1 ? -1 : 0);
                        }
                    },
                    template: "<div>{{history.getEvaluationRole(dataItem.participant.evaluationRoleId)}}</div>"
                },
                {
                    field: "evaluatee", title: $translate.instant('COMMON_PARTICIPANT'), width: '120px',
                    sortable: {
                        compare: function (a, b) {
                            var a1 = (a.evaluatee == null) ? "" : (a.evaluatee.firstName + " " + a.evaluatee.lastName);
                            var b1 = (b.evaluatee == null) ? "" : (b.evaluatee.firstName + " " + b.evaluatee.lastName);
                            return a1 > b1 ? 1 : (a1 < b1 ? -1 : 0);
                        }
                    }, template: "<div>{{dataItem.evaluatee.firstName}} {{dataItem.evaluatee.lastName}}</div>"
                },
                {
                    field: "stage", title: $translate.instant('COMMON_DUE_DATE'), width: '150px', sortable: {
                        compare: function (a, b) {
                            var a1 = moment(kendo.parseDate(a.stage.endDateTime));
                            var b1 = moment(kendo.parseDate(b.stage.endDateTime));
                            return a1.isAfter(b1) ? 1 : (b1.isAfter(a1) ? -1 : 0);
                        }
                    },
                    template: function (dataItem) {
                        if (dataItem.stage) {
                            if (dataItem.stage.endDateTime) {
                                return moment(kendo.parseDate(dataItem.stage.endDateTime)).format("L LT")
                            }
                            else {
                                return "";
                            }
                        }
                        else {
                            return "";
                        }
                    }
                    //template: "<div>{{dataItem.stage.endDateTime | date:'short'}} </div>"
                },
                {
                    field: "submited",
                    title: $translate.instant('MYPROFILES_SUBMITTED'),
                    width: '120px',
                    sortable: {
                        compare: function (a, b) {
                            var a1 = a.isSurveyPassed ? 1 : 0;
                            var b1 = b.isSurveyPassed ? 1 : 0;
                            return a1 > b1 ? 1 : (a1 < b1 ? -1 : 0);
                        }
                    },
                    template: "<input type='checkbox' #= isSurveyPassed ? checked='checked' : '' # disabled='disabled' />"
                },
                {
                    field: "ended", title: $translate.instant('MYPROFILES_SUBMITTED_AT'), width: '150px', sortable: {
                        compare: function (a, b) {
                            var a1 = (a.status == null || a.status.endedAt == null) ? null : moment(kendo.parseDate(a.status.endedAt));
                            var b1 = (b.status == null || b.status.endedAt == null) ? null : moment(kendo.parseDate(b.status.endedAt));
                            return a1 == null ? -1 : (b1 == null ? 1 : (a1.isAfter(b1) ? 1 : (b1.isAfter(a1) ? -1 : 0)));
                        }
                    },
                    template: function (dataItem) {
                        if (dataItem.status) {
                            if (dataItem.status.endedAt) {
                                return moment(kendo.parseDate(dataItem.status.endedAt)).format("L LT")
                            }
                            else {
                                return "";
                            }
                        }
                        else {
                            return "";
                        }
                    }
                    //template: "<div>{{dataItem.status.endedAt | date:'short'}}</div>"
                },
                {
                    field: "kpiSet", title: $translate.instant('MYPROFILES_KPI_SET'), width: '150px', sortable: {
                        compare: function (a, b) {
                            var a1 = a.iskpiSet ? 1 : 0;
                            var b1 = b.iskpiSet ? 1 : 0;
                            return a1 > b1 ? 1 : (a1 < b1 ? -1 : 0);
                        }
                    }, template: "<input type='checkbox' #= iskpiSet ? checked='checked' : '' # disabled='disabled' />"
                },
                {
                    field: "action", title: $translate.instant('COMMON_ACTION'), width: '150px', template: "<div class='icon-groups'>" +
                        "<a class='fa fa-eye fa-lg' ng-attr-title='{{dataItem.previousStage ? \"View Progress\" : \"View Initial Profile\" }}' ng-show='!history.isKnowledge(dataItem.profile.profileTypeId)' ng-click='history.showAnalysis(dataItem.profile.id, dataItem.stage.id, dataItem.participant.id, dataItem.participant.evaluateeId)' >" +
                        "</a>" +
                        "<a class='fa fa-photo fa-lg' ng-attr-title='{{dataItem.previousStage ? \"View Trainings for this Performance Evaluation\" : \"View Final KPIs, Goals and Trainings\"}}' ng-show='!history.isKnowledge(dataItem.profile.profileTypeId) && dataItem.isFinalKPISet' ng-click='history.viewFinalKPI(dataItem.profile.id, dataItem.stage.id, dataItem.participant.id, dataItem.participant.evaluateeId)' >" +
                        "</a>" +
                        "<a class='fa fa-pencil fa-lg' title='Edit Final KPIs, Goals and Trainings' ng-show='!history.isKnowledge(dataItem.profile.profileTypeId) && (dataItem.participant.isScoreManager || dataItem.participant.isSelfEvaluation)' ng-click='history.editFinalKPI(dataItem.profile.id, dataItem.stage.id, dataItem.participant.id, dataItem.participant.evaluateeId)' >" +
                        "</a>" +
                        "<a class='fa fa-newspaper-o fa-lg' title='View Development contract' ng-show='((!history.isKnowledge(dataItem.profile.profileTypeId)) && (!dataItem.previousStage))' ng-click='history.goToDevContract(dataItem.profile.id, dataItem.stage.id, dataItem.participant.id, dataItem.participant.evaluateeId)' >" +
                        "</a>" +
                        "<a class='fa fa-file-text fa-lg' title='View RCT contract' ng-show='!history.isKnowledge(dataItem.profile.profileTypeId) && dataItem.previousStage' ng-click='history.goToRCTContract(dataItem.profile.id, dataItem.stage.id, dataItem.participant.id, dataItem.participant.evaluateeId)' >" +
                        "</a>" +

                        "<a class='fa fa-file fa-lg' title='Agreements' ng-show='history.isKnowledge(dataItem.profile.profileTypeId)' ng-disabled='dataItem.isExpired' ng-click='history.goToAgreements(dataItem.profile.id, dataItem.stage.id, dataItem.participant.id, dataItem.participant.evaluateeId,dataItem.stage.stageEvolutionId)' >" +
                        "</a>" +
                        "<a class='fa fa-line-chart fa-lg' title='Run Analysis'" +
                        "ng-show='history.isKnowledge(dataItem.profile.profileTypeId)' ng-click='history.beginAnalysis(dataItem.profile.id, dataItem.stage.id, dataItem.participant.id, dataItem.participant.evaluateeId, dataItem.profile.profileTypeId,dataItem.stage.stageEvolutionId)' >" +
                        "</a>" +
                        "<a class='fa fa-list fa-lg' title='Scorecard' ng-show='history.isKnowledge(dataItem.profile.profileTypeId)' ng-disabled='dataItem.isExpired' ng-click='history.goToScorecard(dataItem.profile.id, dataItem.stage.id, dataItem.participant.id, dataItem.participant.evaluateeId,dataItem.stage.stageEvolutionId)' >" +
                        "</a>" +
                        "<a class='fa fa-arrow-circle-right fa-lg' title='Next phase' ng-show='dataItem.isLastEvaluatedStage && dataItem.isLastStage  && (dataItem.participant.isScoreManager || dataItem.participant.isSelfEvaluation)' ng-enable='dataItem.isExpired' ng-click='history.confirmRestartProfile(dataItem.stage.stageGroupId,dataItem.participant.id,dataItem.stage.endDateTime,dataItem.profile.profileTypeId)' >" +
                        "</a>" +
                        "</div>"
                },
            ]
        }
        vm.tooltipOptions = $(".profiles-history-grid").kendoTooltip({
            filter: "th.k-header",
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
        }).data("tooltiptext");

        vm.StageGroupStartStageStartDateOpen = StageGroupStartStageStartDateOpen;
        vm.StageGroupStartStageStartDateChange = StageGroupStartStageStartDateChange;

        vm.StageGroupStartStageEndDateOpen = StageGroupStartStageEndDateOpen;
        vm.StageGroupStartStageEndDateChange = StageGroupStartStageEndDateChange;

        vm.StageGroupMilestoneStartDateOpen = StageGroupMilestoneStartDateOpen;
        vm.StageGroupMilestoneStartDateChange = StageGroupMilestoneStartDateChange;
        vm.StageGroupMilestoneEndDateOpen = StageGroupMilestoneEndDateOpen;
        vm.StageGroupMilestoneEndDateChange = StageGroupMilestoneEndDateChange;
        vm.numberOfMilestoneChange = numberOfMilestoneChange;
    }
})();