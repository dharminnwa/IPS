(function () {
    'use strict';
    angular
        .module('ips.stageGroups')
        .config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
            $stateProvider
                .state('home.profiles.soft.edit.stageGroups.basicEdit', {
                    url: "/basicEdit/:stageGroupId",
                    templateUrl: "views/profiles/stageGroups/views/stageGroupsBasicEdit.html",
                    controller: "stageGroupsBasicEditCtrl as stageEdit",
                    resolve: {
                        selectedStage: function (stageGroupManager, $stateParams, globalVariables) {
                            moment.locale(globalVariables.lang.currentUICulture);
                            return stageGroupManager.getStageById($stateParams.stageGroupId, $stateParams.profileId).then(function (data) {
                                (data.startDate) ? data.startDate = moment(kendo.parseDate(data.startDate)).format('L LT') : '';
                                (data.endDate) ? data.endDate = moment(kendo.parseDate(data.endDate)).format('L LT') : '';
                                if (data.startStageStartDate) {
                                    data.startStageStartDate = moment(kendo.parseDate(data.startStageStartDate)).format('L LT');
                                }
                                if (data.startStageEndDate) {
                                    data.startStageEndDate = moment(kendo.parseDate(data.startStageEndDate)).format('L LT');
                                }
                                if (data.milestoneStartDate) {
                                    data.milestoneStartDate = moment(kendo.parseDate(data.milestoneStartDate)).format('L LT');
                                }
                                if (data.milestoneEndDate) {
                                    data.milestoneEndDate = moment(kendo.parseDate(data.milestoneEndDate)).format('L LT');
                                }
                                return data;
                            });
                        },
                        profileTypeId: function (profilesTypesEnum) {
                            return profilesTypesEnum.soft;
                        },
                    },
                    data: {
                        displayName: '{{selectedStage.name}}',
                        paneLimit: 1,
                        depth: 5,
                        resource: "Profiles"
                    }
                })
                .state('home.profiles.knowledgetest.edit.stageGroups.basicEdit', {
                    url: "/basicEdit/:stageGroupId",
                    templateUrl: "views/profiles/stageGroups/views/stageGroupsBasicEdit.html",
                    controller: "stageGroupsBasicEditCtrl as stageEdit",
                    resolve: {
                        selectedStage: function (stageGroupManager, $stateParams, globalVariables) {
                            return stageGroupManager.getStageById($stateParams.stageGroupId, $stateParams.profileId).then(function (data) {
                                moment.locale(globalVariables.lang.currentUICulture);
                                (data.startDate) ? data.startDate = moment(kendo.parseDate(data.startDate)).format('L LT') : '';
                                (data.endDate) ? data.endDate = moment(kendo.parseDate(data.endDate)).format('L LT') : '';

                                if (data.startStageStartDate) {
                                    data.startStageStartDate = moment(kendo.parseDate(data.startStageStartDate)).format('L LT');
                                }
                                if (data.startStageEndDate) {
                                    data.startStageEndDate = moment(kendo.parseDate(data.startStageEndDate)).format('L LT');
                                }
                                if (data.milestoneStartDate) {
                                    data.milestoneStartDate = moment(kendo.parseDate(data.milestoneStartDate)).format('L LT');
                                }
                                if (data.milestoneEndDate) {
                                    data.milestoneEndDate = moment(kendo.parseDate(data.milestoneEndDate)).format('L LT');
                                }
                                return data;
                            });
                        },
                        profileTypeId: function (profilesTypesEnum) {
                            return profilesTypesEnum.knowledgetest;
                        }
                    },
                    data: {
                        displayName: '{{selectedStage.name}}',
                        paneLimit: 1,
                        depth: 5,
                        resource: "Profiles"
                    }
                });
        }])
        .controller('stageGroupsBasicEditCtrl', stageGroupsBasicEditCtrl);
    stageGroupsBasicEditCtrl.$inject = ['selectedStage', '$location', 'stageGroupManager', 'dialogService', '$stateParams', 'profilesService', 'profileTypeId', 'profilesTypesEnum', '$translate', 'globalVariables', 'localStorageService'];
    function stageGroupsBasicEditCtrl(selectedStage, $location, stageGroupManager, dialogService, $stateParams, profilesService, profileTypeId, profilesTypesEnum, $translate, globalVariables, localStorageService) {
        var vm = this;
        moment.locale(globalVariables.lang.currentUICulture);
        vm.stageInfo = selectedStage;
        if (profileTypeId == profilesTypesEnum.soft) {
            stageGroupManager.getProjectByProfileId($stateParams.profileId).then(function (data) {
                if (!isEdit()) {
                    if (data) {
                        vm.stageInfo.startDate = moment(kendo.parseDate(data.expectedStartDate)).format('L LT');
                        vm.stageInfo.endDate = moment(kendo.parseDate(data.expectedEndDate)).format("L LT");
                        vm.stageInfo.startStageStartDate = moment(kendo.parseDate(data.expectedStartDate)).format('L LT');
                        vm.stageInfo.startStageEndDate = moment(kendo.parseDate(data.expectedStartDate)).add("days", 7).format('L LT');
                        vm.stageInfo.milestoneStartDate = moment(kendo.parseDate(data.expectedStartDate)).add("days", 7).format('L LT');
                        vm.stageInfo.milestoneEndDate = moment(kendo.parseDate(data.expectedEndDate)).format("L LT");
                    }
                }
            })
        }
        vm.profileTypeId = profileTypeId;
        vm.profilesTypesEnum = profilesTypesEnum;
        vm.sendOutTotalDiffrence = {
            months: null,
            weeks: null,
            days: null,
            hours: null,
            minutes: null,
        }
        vm.sendOutMilestoneDiffrence = {
            months: null,
            weeks: null,
            days: null,
            hours: null,
            minutes: null,
        }

        function isEdit() {
            return (vm.stageInfo.id > 0);
        }
        function save() {
            (isEdit()) ? updateStage() : addNewStage();
        }
        function updateStage() {
            if (vm.stageInfo) {
                var stageinfo = _.clone(vm.stageInfo);
                stageinfo.startDate = kendo.parseDate(stageinfo.startDate);
                stageinfo.endDate = kendo.parseDate(stageinfo.endDate);
                stageinfo.startStageStartDate = kendo.parseDate(stageinfo.startStageStartDate);
                stageinfo.startStageEndDate = kendo.parseDate(stageinfo.startStageEndDate);
                stageinfo.milestoneStartDate = kendo.parseDate(stageinfo.milestoneStartDate);
                stageinfo.milestoneEndDate = kendo.parseDate(stageinfo.milestoneEndDate);
                stageGroupManager.updateStageGroup(vm.stageInfo).then(
                    function (data) {
                        stageGroupManager.returnToPerviousPage();
                    },
                    function (data) {
                        console.log(data);
                    }
                );
            }
        }
        function addNewStage() {
            if (vm.stageInfo) {
                var item = angular.copy(vm.stageInfo);
                item.stages = null;
                item.startDate = kendo.parseDate(item.startDate);
                item.endDate = kendo.parseDate(item.endDate);
                item.startStageStartDate = kendo.parseDate(item.startStageStartDate);
                item.startStageEndDate = kendo.parseDate(item.startStageEndDate);
                item.milestoneStartDate = kendo.parseDate(item.milestoneStartDate);
                item.milestoneEndDate = kendo.parseDate(item.milestoneEndDate);
                stageGroupManager.addNewStageGroup(item).then(
                    function (id) {
                        profilesService.updateTree();
                        var path = $location.path();
                        var newAddress = 'edit/' + id;
                        path = path.replace('basicEdit/0', newAddress);
                        localStorageService.set("isNewAdded", true);
                        $location.path(path);
                    },
                    function (message) {
                        dialogService.showNotification(message, 'warning');
                    }
                );
            }
        }
        function removeStageGroup() {
            dialogService.showYesNoDialog($translate.instant('COMMON_CONFIRM'), $translate.instant('COMMON_ARE_YOU_SURE_YOU_WANT_TO_DELETE')).then(
                function () {
                    stageGroupManager.removeStageGroup($stateParams.stageId).then(
                        function (data) {
                            profilesService.updateTree();
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
        function goBack() {
            history.back();
        }
        function stageTimespanChanged() {
        }
        function StageGroupStartStageStartDateOpen(event) {
            var datepicker = $(event.sender.element).data("kendoDateTimePicker");
            datepicker.setOptions({
                min: kendo.parseDate(vm.stageInfo.startDate),
                max: kendo.parseDate(vm.stageInfo.endDate)
            });
        }
        function StageGroupStartStageStartDateChange(event) {
            if ((kendo.parseDate(vm.stageInfo.startStageStartDate) > kendo.parseDate(vm.stageInfo.startStageEndDate))) {
                vm.stageInfo.startStageEndDate = null;
            }
        };
        function StageGroupStartStageEndDateOpen(event) {
            var datepicker = $(event.sender.element).data("kendoDateTimePicker")
            datepicker.setOptions({
                min: kendo.parseDate(vm.stageInfo.startStageStartDate),
                max: kendo.parseDate(vm.stageInfo.endDate)
            });
        };
        function StageGroupStartStageEndDateChange(event) {
            vm.stageInfo.milestoneStartDate = moment(kendo.parseDate(event.sender.value())).format('L LT');
        };
        function StageGroupMilestoneStartDateOpen(event) {
            var datepicker = $(event.sender.element).data("kendoDateTimePicker");
            datepicker.setOptions({
                min: kendo.parseDate(vm.stageInfo.startStageEndDate),
                max: kendo.parseDate(vm.stageInfo.endDate)
            });
        }
        function StageGroupMilestoneStartDateChange(event) {
            if ((kendo.parseDate(event.sender.value()) > kendo.parseDate(vm.stageInfo.milestoneEndDate))) {
                vm.stageInfo.milestoneEndDate = "";
            }
            else {
                var diffTime = null;
                var a = moment(kendo.parseDate(vm.stageInfo.milestoneEndDate));
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
                    if (vm.stageInfo.totalMilestones > 0) {
                        diffTime = a.diff(b) / vm.stageInfo.totalMilestones; // 1
                    }
                    else {
                        diffTime = a.diff(b) / 5; // 1
                    }
                }
                duration = moment.duration(diffTime);
                vm.stageInfo.actualTimeSpan = diffTime,
                    vm.stageInfo.monthsSpan = duration.months();
                if (duration.years() > 0) {
                    vm.stageInfo.monthsSpan = vm.stageInfo.monthsSpan + (duration.years() * 12);
                }
                vm.stageInfo.weeksSpan = duration.weeks();
                vm.stageInfo.daysSpan = duration.days();
                if (vm.stageInfo.weeksSpan > 0) {
                    vm.stageInfo.daysSpan = vm.stageInfo.daysSpan - (vm.stageInfo.weeksSpan * 7);
                }
                vm.stageInfo.hoursSpan = duration.hours();
                vm.stageInfo.minutesSpan = duration.minutes();
            }
        };
        function StageGroupMilestoneEndDateOpen(event) {
            var datepicker = $(event.sender.element).data("kendoDateTimePicker")
            datepicker.setOptions({
                min: kendo.parseDate(vm.stageInfo.milestoneStartDate),
                max: kendo.parseDate(vm.stageInfo.endDate)
            });
        };
        function StageGroupMilestoneEndDateChange(event) {
            var diffTime = null;
            var a = moment(kendo.parseDate(event.sender.value()));
            var b = moment(kendo.parseDate(vm.stageInfo.milestoneStartDate));
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
                if (vm.stageInfo.totalMilestones > 0) {
                    diffTime = a.diff(b) / vm.stageInfo.totalMilestones; // 1
                }
                else {
                    diffTime = a.diff(b) / 5; // 1
                }
            }
            duration = moment.duration(diffTime);
            vm.stageInfo.actualTimeSpan = diffTime,
                vm.stageInfo.monthsSpan = duration.months();
            if (duration.years() > 0) {
                vm.stageInfo.monthsSpan = vm.stageInfo.monthsSpan + (duration.years() * 12);
            }
            vm.stageInfo.weeksSpan = duration.weeks();
            vm.stageInfo.daysSpan = duration.days();
            if (vm.stageInfo.weeksSpan > 0) {
                vm.stageInfo.daysSpan = vm.stageInfo.daysSpan - (vm.stageInfo.weeksSpan * 7);
            }
            vm.stageInfo.hoursSpan = duration.hours();
            vm.stageInfo.minutesSpan = duration.minutes();
        };
        function numberOfMilestoneChange() {
            var diffTime = null;
            if (vm.stageInfo.milestoneStartDate && vm.stageInfo.milestoneEndDate) {
                var a = moment(kendo.parseDate(vm.stageInfo.milestoneEndDate));
                var b = moment(kendo.parseDate(vm.stageInfo.milestoneStartDate));
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
                    if (vm.stageInfo.totalMilestones > 0) {
                        diffTime = a.diff(b) / vm.stageInfo.totalMilestones; // 1
                    }
                    else {
                        diffTime = a.diff(b) / 5; // 1
                    }
                }
                duration = moment.duration(diffTime);
                vm.stageInfo.actualTimeSpan = diffTime,
                    vm.stageInfo.monthsSpan = duration.months();
                if (duration.years() > 0) {
                    vm.stageInfo.monthsSpan = vm.stageInfo.monthsSpan + (duration.years() * 12);
                }
                vm.stageInfo.weeksSpan = duration.weeks();
                vm.stageInfo.daysSpan = duration.days();
                if (vm.stageInfo.weeksSpan > 0) {
                    vm.stageInfo.daysSpan = vm.stageInfo.daysSpan - (vm.stageInfo.weeksSpan * 7);
                }
                vm.stageInfo.hoursSpan = duration.hours();
                vm.stageInfo.minutesSpan = duration.minutes();
            }
            else {
                var a = moment(kendo.parseDate(vm.stageInfo.endDate));
                var b = moment(kendo.parseDate(vm.stageInfo.startDate));
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
                        vm.sendOutTotalDiffrence.days = vm.sendOutTotalDiffrence.days - (vm.stageInfo.weeksSpan * 7);
                    }
                    if (duration.years() > 0) {
                        vm.sendOutTotalDiffrence.months = vm.sendOutTotalDiffrence.months + (duration.years() * 12);
                    }
                    if (vm.stageInfo.totalMilestones > 0) {
                        diffTime = a.diff(b) / vm.stageInfo.totalMilestones; // 1
                    }
                    else {
                        diffTime = a.diff(b) / 5; // 1
                    }
                }
                duration = moment.duration(diffTime);
                vm.stageInfo.actualTimeSpan = diffTime,
                    vm.stageInfo.monthsSpan = duration.months();
                if (duration.years() > 0) {
                    vm.stageInfo.monthsSpan = vm.stageInfo.monthsSpan + (duration.years() * 12);
                }
                vm.stageInfo.weeksSpan = duration.weeks();
                vm.stageInfo.daysSpan = duration.days();
                if (vm.stageInfo.weeksSpan > 0) {
                    vm.stageInfo.daysSpan = vm.stageInfo.daysSpan - (vm.stageInfo.weeksSpan * 7);
                }
                vm.stageInfo.hoursSpan = duration.hours();
                vm.stageInfo.minutesSpan = duration.minutes();
            }
        }
        vm.stageTimespanChanged = stageTimespanChanged;
        vm.removeStageGroup = removeStageGroup;
        vm.goBack = goBack;
        vm.save = save;
        vm.isEdit = isEdit;
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