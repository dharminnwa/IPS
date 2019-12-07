angular.module('ips.serviceProspecting')
    .config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {

        var baseNewServiceProspectingResolve = {
            pageName: function ($translate) {
                return $translate.instant('LEFTMENU_SERVICE_PROSPECTING');//'Task Prospecting';
            },
            scaleCategories: function (apiService) {
                return apiService.getAll("Scale_Categories?$select=Id,Name&$orderby=Name").then(function (data) {
                    return data;
                });
            },
            scaleMeasureUnits: function (apiService) {
                return apiService.getAll("MeasureUnit?$select=Id,Name&$orderby=Name").then(function (data) {
                    return data;
                });
            }

        };
        $stateProvider
            .state('newServiceProspecting', {
                url: "/newServiceProspecting",
                templateUrl: "views/serviceProspecting/views/newServiceProspecting.html",
                controller: "NewServiceProspectingCtrl",
                resolve: baseNewServiceProspectingResolve,
                data: {
                    displayName: '{{pageName}}',
                    resource: "Service Prospecting",
                }
            })
    }])
    .controller("NewServiceProspectingCtrl", ['$scope', 'cssInjector', '$stateParams', '$location', 'todoManager', 'todosManager', 'serviceProspectingManager', 'dialogService', 'progressBar', 'localStorageService', '$compile', 'projectRolesEnum', 'prospectingTypesEnum', 'globalVariables', '$translate', 'scaleCategories', 'scaleMeasureUnits',
        function ($scope, cssInjector, $stateParams, $location, todoManager, todosManager, serviceProspectingManager, dialogService, progressBar, localStorageService, $compile, projectRolesEnum, prospectingTypesEnum, globalVariables, $translate, scaleCategories, scaleMeasureUnits) {
            cssInjector.removeAll();
            cssInjector.add('views/serviceProspecting/service-prospective.css');
            cssInjector.add('views/serviceProspecting/newServicePropsecting.css');
            var authData = localStorageService.get('authorizationData');
            $scope.defaultTaskProspecting = localStorageService.get("prospectingTask");
            localStorageService.set("prospectingTask", null);
            $scope.currentUser = authData.user;
            $scope.today = new Date().setHours(0, 0, 0, 0);
            moment.locale(globalVariables.lang.currentUICulture);
            var endDay = moment();
            $scope.endOfDay = endDay.endOf('day')._d;
            $scope.prospectingType = prospectingTypesEnum.Service;
            $scope.goalStatusEnum = {
                Active: 1,
                Upcoming: 2,
                Expired: 3,
            }
            $scope.prospectingGoals = [];
            $scope.init = function () {
                progressBar.startProgress();
                moment.locale(globalVariables.lang.currentUICulture);
                todoManager.getTodosByUserId($scope.currentUser.userId).then(function (data) {
                    progressBar.stopProgress();
                    $scope.taskTodos = [];
                    $scope.prospectingTaskTodos = [];
                    var start = moment().startOf('day'); // set to 12:00 am today
                    var end = moment().endOf('day');
                    var today = new Date();
                    today = today.setHours(0, 0, 0, 0);
                    moment.locale(globalVariables.lang.currentUICulture);
                    angular.forEach(data, function (item, index) {
                        if (item.taskCategoryListItem.name.toLowerCase() == 'service prospecting') {
                            item.start = moment(kendo.parseDate(item.startDate)).toDate();
                            item.taskId = item.id;
                            item.end = moment(kendo.parseDate(item.dueDate)).toDate();
                            if (moment(item.end).isAfter(moment(today))) {
                                $scope.prospectingTaskTodos.push(item);
                            }
                        }
                    });

                    App.initSlimScroll(".scroller");
                });
                serviceProspectingManager.getProjectServiceProspectingGoalsByUserId($scope.currentUser.userId, 0).then(function (data) {
                    progressBar.stopProgress();
                    moment.locale(globalVariables.lang.currentUICulture);
                    $scope.prospectingGoalItems = [];
                    _.each(data, function (item) {
                        $scope.prospectingGoalItems.push({ id: item.id, name: item.name, seq: 0, goalStartDate: moment(kendo.parseDate(item.goalStartDate))._d, goalEndDate: moment(kendo.parseDate(item.goalEndDate))._d });
                    });
                    //$scope.prospectingGoalOptions = getProspectingGoalMultiSelectOptions($scope.prospectingGoalItems);
                    $scope.prospectingGoalItems.unshift({ id: 0, name: $translate.instant('COMMON_ALL') });
                    //$scope.topBoxFilterOption.prospectingGoalIds = [];
                    var allGoalStartDates = [];
                    var allGoalEndDates = [];
                    _.each(data, function (item) {
                        if (item.taskId) {
                            item.goalStartDate = moment(kendo.parseDate(item.goalStartDate))._d;
                            item.goalEndDate = moment(kendo.parseDate(item.goalEndDate))._d;
                            allGoalStartDates.push(moment(kendo.parseDate(item.goalStartDate))._d);
                            allGoalEndDates.push(moment(kendo.parseDate(item.goalEndDate))._d);
                            if (moment(kendo.parseDate(item.goalEndDate)).isBefore(moment($scope.endOfDay))) {
                                item["status"] = $scope.goalStatusEnum.Expired;
                            }
                            else if (moment(kendo.parseDate(item.goalStartDate)).isAfter(moment($scope.endOfDay))) {
                                item["status"] = $scope.goalStatusEnum.Upcoming;
                            }
                            else if (moment(kendo.parseDate(item.goalStartDate)).isBefore(moment($scope.endOfDay))) {
                                item["status"] = $scope.goalStatusEnum.Active;
                            }
                            $scope.prospectingGoals.push(item);
                        }
                        App.initSlimScroll(".scroller");
                    });

                });

            }
            $scope.ProspectingGoalTypes = [
               
                {
                    id: 3, name: "Task"
                }
            ];
            var scaleCategoryId = null;
            if (scaleCategories.length > 0) {
                scaleCategoryId = scaleCategories[scaleCategories.length - 1].id
            }
            var measureId = null;
            if (scaleMeasureUnits.length > 0) {
                var measure = _.find(scaleMeasureUnits, function (item) {
                    return item.name.indexOf("Number") > -1;
                });
                if (measure) {
                    measureId = measure.id;
                }
            }
            $scope.prospectingGoalInfo = {
                id: 0,
                name: null,
                goalStartDate: null,
                goalEndDate: null,
                prospectingSkillGoals: [],
                taskId: null,
                recurrenceRule: null,
                userId: null,

                prospectingGoalScale: {
                    name: null,
                    description: null,
                    scaleCategoryId: scaleCategoryId,
                    measureUnitId: measureId,
                    includeNotRelevant: false,
                    isTemplate: false,
                    scaleStart: 1,
                    scaleEnd: 100,
                    scaleInterval: 3,
                },
                prospectingType: prospectingTypesEnum.Service,
            };
            $scope.openProspectingGoalPopup = function () {
                if (!$scope.prospectingGoalInfo.id > 0) {
                    $scope.prospectingGoalInfo = {
                        id: 0,
                        name: null,
                        goalStartDate: null,
                        goalEndDate: null,
                        prospectingSkillGoals: [],
                        taskId: null,
                        recurrenceRule: null,
                        userId: null,

                        prospectingGoalScale: {
                            name: null,
                            description: null,
                            scaleCategoryId: scaleCategoryId,
                            measureUnitId: measureId,
                            includeNotRelevant: false,
                            isTemplate: false,
                            scaleStart: 1,
                            scaleEnd: 100,
                            scaleInterval: 3,
                        },
                        prospectingType: prospectingTypesEnum.Service,
                    };
                    $scope.isProspectingGoalViewOnly = false;
                }
                $("#tab2").removeClass("active");
                $("li[data-target='#tab2']").removeClass("active");
                $("#tab2").hide();
                $("li[data-target='#tab1']").addClass("active");
                $("#tab1").addClass("active");
                $("#tab1").show();
            }
            $scope.changeProspectingGoalType = function () {
                $scope.prospectingGoalInfo.userid = null;
                $scope.prospectingGoalInfo.name = null;
                $scope.prospectingGoalInfo.recurrenceRule = null;
                $scope.prospectingGoalInfo.goalStartDate = null;
                $scope.prospectingGoalInfo.goalEndDate = null;
            }
            $scope.isAllowEditProspectingGoal = function (participantId, createdBy) {
                return true;
            }
            $scope.goalStartDateOpen = function (event) {
                var datepicker = $(event.sender.element).data("kendoDateTimePicker");
                if (!($scope.prospectingGoalInfo.id > 0)) {
                    datepicker.setOptions({
                        min: new Date(),
                    });
                }
            }
            $scope.goalStartDateChange = function () {
                if ((moment(kendo.parseDate($scope.prospectingGoalInfo.goalStartDate)).isAfter(moment(kendo.parseDate($scope.prospectingGoalInfo.goalEndDate))))) {
                    $scope.prospectingGoalInfo.goalEndDate = null;
                }
                else {
                    _.each($scope.prospectingGoalInfo.prospectingSkillGoals, function (item) {
                        $scope.calculateProspectingSkillGoalByTotalGoal(item);
                    });
                }
            }
            $scope.goalEndDateOpen = function (event) {
                var datepicker = $(event.sender.element).data("kendoDateTimePicker");
                datepicker.setOptions({
                    min: kendo.parseDate($scope.prospectingGoalInfo.goalStartDate),
                });
            }
            $scope.goalEndDateChange = function (event) {
                $scope.prospectingGoalInfo.goalEndDate = moment(event.sender.value()).format("L LT");
                _.each($scope.prospectingGoalInfo.prospectingSkillGoals, function (item) {
                    $scope.calculateProspectingSkillGoalByTotalGoal(item);
                });
            }
            $scope.changeProspectingGoalTask = function () {
                if ($scope.prospectingGoalInfo.taskId) {
                    $scope.prospectingGoalInfo.userid = null;
                    $scope.prospectingGoalInfo.name = null;
                    $scope.prospectingGoalInfo.recurrenceRule = null;
                    $scope.prospectingGoalInfo.goalStartDate = null;
                    $scope.prospectingGoalInfo.goalEndDate = null;

                    $scope.profileSkills = [];
                    $scope.prospectingGoalSkills = [];
                    var isExist = _.any($scope.prospectingGoals, function (item) {
                        return item.taskId == $scope.prospectingGoalInfo.taskId && item.userId == $scope.currentUser.userId;
                    });

                    if (!isExist) {
                        var taskdata = _.find($scope.prospectingTaskTodos, function (item) {
                            return item.id == $scope.prospectingGoalInfo.taskId;
                        });
                        if (taskdata) {

                            //check has previous Goal for this task
                            serviceProspectingManager.getTaskProspectingGoals(taskdata.id).then(function (dataItem) {
                                if (dataItem.length > 0) {
                                    serviceProspectingManager.getSkillsByProspectingGoalId(dataItem[0].id).then(function (skillDatas) {
                                        if (skillDatas.length > 0) {
                                            skillDatas = _.sortBy(skillDatas, 'seqNo');
                                            $scope.profileSkills = skillDatas;
                                            $scope.prospectingGoalSkills = [];
                                            _.each(skillDatas, function (dataItem) {
                                                $scope.prospectingGoalSkills.push({
                                                    id: 0,
                                                    skillId: dataItem.id,
                                                    skillName: dataItem.name,
                                                    skill: {
                                                        id: dataItem.id,
                                                        name: dataItem.name,
                                                    },
                                                    goal: 0,
                                                    prospectingGoalId: 0,
                                                    seqNo: dataItem.seqNo,
                                                });
                                            })
                                        }
                                        else {
                                            $scope.prospectingGoalSkills = [{
                                                id: 0,
                                                prospectingGoalId: 0,
                                                skillId: 0,
                                                goal: "",
                                                skill: {
                                                    id: 0,
                                                    name: $translate.instant('TASKPROSPECTING_CALLS'),
                                                    seqNo: 1,
                                                },

                                            }, {
                                                id: 0,
                                                prospectingGoalId: 0,
                                                skillId: 0,
                                                goal: "",
                                                skill: {
                                                    id: 0,
                                                    name: $translate.instant('TASKPROSPECTING_TALKS'),
                                                    seqNo: 2,
                                                },
                                            }, {
                                                id: 0,
                                                prospectingGoalId: 0,
                                                skillId: 0,
                                                goal: "",
                                                skill: {
                                                    id: 0,
                                                    name: $translate.instant('TASKPROSPECTING_MEETING'),
                                                    seqNo: 3,
                                                }
                                            }];
                                        }
                                    })
                                }
                                else {
                                    $scope.prospectingGoalSkills = [{
                                        id: 0,
                                        prospectingGoalId: 0,
                                        skillId: 0,
                                        goal: "",
                                        skill: {
                                            id: 0,
                                            name: $translate.instant('TASKPROSPECTING_CALLS'),
                                            seqNo: 1,
                                        },

                                    }, {
                                        id: 0,
                                        prospectingGoalId: 0,
                                        skillId: 0,
                                        goal: "",
                                        skill: {
                                            id: 0,
                                            name: $translate.instant('TASKPROSPECTING_TALKS'),
                                            seqNo: 2,
                                        },
                                    }, {
                                        id: 0,
                                        prospectingGoalId: 0,
                                        skillId: 0,
                                        goal: "",
                                        skill: {
                                            id: 0,
                                            name: $translate.instant('TASKPROSPECTING_MEETING'),
                                            seqNo: 3,
                                        }
                                    }];
                                }
                            });

                            $scope.prospectingGoalInfo.participantId = null;
                            $scope.prospectingGoalInfo.name = taskdata.title;
                            $scope.prospectingGoalInfo.userid = taskdata.assignedToId;
                            $scope.prospectingGoalInfo.recurrenceRule = taskdata.recurrenceRule;
                            $scope.prospectingGoalInfo.goalStartDate = moment(taskdata.startDate).format("L LT");
                            $scope.prospectingGoalInfo.goalEndDate = moment(taskdata.dueDate).format("L LT");
                        }
                    }
                    else {
                        $scope.prospectingGoalInfo.taskId = null;
                        dialogService.showNotification($translate.instant('TASKPROSPECTING_YOU_HAVE_ALREADY_ADDED_GOALS_FOR_THIS_SELECTED_TASK'), 'warning');
                    }
                }
            }
            $scope.calculateProspectingSkillGoalByTotalGoal = function (prospectingGoalSkill) {
                var taskdata = _.find($scope.prospectingTaskTodos, function (item) {
                    return item.id == $scope.prospectingGoalInfo.taskId;
                });
                if (taskdata) {
                    $scope.prospectingGoalInfo.taskRecurrenceRule = taskdata.recurrenceRule;
                    var event = new kendo.data.SchedulerEvent({
                        id: $scope.prospectingGoalInfo.id,
                        start: kendo.parseDate($scope.prospectingGoalInfo.goalStartDate),
                        end: kendo.parseDate($scope.prospectingGoalInfo.goalEndDate),
                        recurrenceRule: taskdata.recurrenceRule,
                    });
                    var occurrences = event.expand(kendo.parseDate($scope.prospectingGoalInfo.goalStartDate), kendo.parseDate($scope.prospectingGoalInfo.goalEndDate));

                    if (prospectingGoalSkill) {
                        // Per Day
                        $scope.prospectingGoalInfo.totalDays = occurrences.length;
                        if (!isNaN(prospectingGoalSkill.goal / occurrences.length)) {
                            prospectingGoalSkill.goalPerDay = parseFloat(parseFloat(prospectingGoalSkill.goal / occurrences.length).toFixed(2));
                        }
                        // Per Week
                        var allDates = [];
                        _.each(occurrences, function (item) {
                            allDates.push(item.start)
                        });
                        var firstWeekStart = moment(_.min(allDates)).startOf("week")._d;
                        var lastWeekEnd = moment(_.max(allDates)).endOf("week").add("minute", 1)._d;
                        var weeks = moment(lastWeekEnd).diff(moment(firstWeekStart), "week");
                        if (weeks == 0) {
                            weeks = 1;
                        };
                        $scope.prospectingGoalInfo.totalWeeks = weeks;
                        if (!isNaN(prospectingGoalSkill.goal / weeks)) {
                            prospectingGoalSkill.goalPerWeek = parseFloat(parseFloat(prospectingGoalSkill.goal / weeks).toFixed(2));
                        }

                        // Per Month
                        var firstMonthStart = moment(_.min(allDates)).startOf("month")._d;
                        var lastMonthEnd = moment(_.max(allDates)).endOf("month").add("minute", 1)._d;
                        var months = moment(lastMonthEnd).diff(moment(firstMonthStart), "month");
                        $scope.prospectingGoalInfo.totalMonths = months;
                        if (!isNaN(prospectingGoalSkill.goal / months)) {
                            prospectingGoalSkill.goalPerMonth = parseFloat(parseFloat(prospectingGoalSkill.goal / months).toFixed(2));
                        }
                    }

                }
            }
            $scope.calculateProspectingSkillGoalByPerDayGoal = function (prospectingGoalSkill) {
                var taskdata = _.find($scope.prospectingTaskTodos, function (item) {
                    return item.id == $scope.prospectingGoalInfo.taskId;
                });
                if (taskdata) {
                    $scope.prospectingGoalInfo.taskRecurrenceRule = taskdata.recurrenceRule;
                    var event = new kendo.data.SchedulerEvent({
                        id: $scope.prospectingGoalInfo.id,
                        start: kendo.parseDate($scope.prospectingGoalInfo.goalStartDate),
                        end: kendo.parseDate($scope.prospectingGoalInfo.goalEndDate),
                        recurrenceRule: taskdata.recurrenceRule,
                    });
                    var occurrences = event.expand(kendo.parseDate($scope.prospectingGoalInfo.goalStartDate), kendo.parseDate($scope.prospectingGoalInfo.goalEndDate));
                    var allDates = [];
                    _.each(occurrences, function (item) {
                        allDates.push(item.start)
                    });
                    if (prospectingGoalSkill) {
                        // Total 
                        $scope.prospectingGoalInfo.totalDays = occurrences.length;

                        prospectingGoalSkill.goal = parseFloat(parseFloat(prospectingGoalSkill.goalPerDay * occurrences.length).toFixed(2));
                        // Per Week
                        var allDates = [];
                        _.each(occurrences, function (item) {
                            allDates.push(item.start)
                        });
                        var firstWeekStart = moment(_.min(allDates)).startOf("week")._d;
                        var lastWeekEnd = moment(_.max(allDates)).endOf("week").add("minute", 1)._d;
                        var weeks = moment(lastWeekEnd).diff(moment(firstWeekStart), "week");
                        if (weeks == 0) {
                            weeks = 1;
                        };
                        $scope.prospectingGoalInfo.totalWeeks = weeks;
                        if (!isNaN(prospectingGoalSkill.goal / weeks)) {
                            prospectingGoalSkill.goalPerWeek = parseFloat(parseFloat(prospectingGoalSkill.goal / weeks).toFixed(2));
                        }

                        // Per Month
                        var firstMonthStart = moment(_.min(allDates)).startOf("month")._d;
                        var lastMonthEnd = moment(_.max(allDates)).endOf("month").add("minute", 1)._d;
                        var months = moment(lastMonthEnd).diff(moment(firstMonthStart), "month");
                        $scope.prospectingGoalInfo.totalMonths = months;
                        if (!isNaN(prospectingGoalSkill.goal / months)) {
                            prospectingGoalSkill.goalPerMonth = parseFloat(parseFloat(prospectingGoalSkill.goal / months).toFixed(2));
                        }
                    }

                }
            }
            $scope.calculateProspectingSkillGoalByPerWeekGoal = function (prospectingGoalSkill) {
                var taskdata = _.find($scope.prospectingTaskTodos, function (item) {
                    return item.id == $scope.prospectingGoalInfo.taskId;
                });
                if (taskdata) {
                    $scope.prospectingGoalInfo.taskRecurrenceRule = taskdata.recurrenceRule;
                    var event = new kendo.data.SchedulerEvent({
                        id: $scope.prospectingGoalInfo.id,
                        start: kendo.parseDate($scope.prospectingGoalInfo.goalStartDate),
                        end: kendo.parseDate($scope.prospectingGoalInfo.goalEndDate),
                        recurrenceRule: taskdata.recurrenceRule,
                    });
                    var occurrences = event.expand(kendo.parseDate($scope.prospectingGoalInfo.goalStartDate), kendo.parseDate($scope.prospectingGoalInfo.goalEndDate));
                    var allDates = [];
                    _.each(occurrences, function (item) {
                        allDates.push(item.start)
                    });
                    if (prospectingGoalSkill) {
                        // Total 
                        var firstWeekStart = moment(_.min(allDates)).startOf("week")._d;
                        var lastWeekEnd = moment(_.max(allDates)).endOf("week").add("minute", 1)._d;
                        var weeks = moment(lastWeekEnd).diff(moment(firstWeekStart), "week");
                        if (weeks == 0) {
                            weeks = 1;
                        };
                        $scope.prospectingGoalInfo.totalDays = occurrences.length;
                        prospectingGoalSkill.goal = parseFloat(parseFloat(prospectingGoalSkill.goalPerWeek * weeks).toFixed(2));

                        // Per Day
                        if (!isNaN(prospectingGoalSkill.goal / occurrences.length)) {
                            prospectingGoalSkill.goalPerDay = parseFloat(parseFloat(prospectingGoalSkill.goal / occurrences.length).toFixed(2));
                        }

                        // Per Month
                        var firstMonthStart = moment(_.min(allDates)).startOf("month")._d;
                        var lastMonthEnd = moment(_.max(allDates)).endOf("month").add("minute", 1)._d;
                        var months = moment(lastMonthEnd).diff(moment(firstMonthStart), "month");
                        $scope.prospectingGoalInfo.totalMonths = months;
                        if (!isNaN(prospectingGoalSkill.goal / months)) {
                            prospectingGoalSkill.goalPerMonth = parseFloat(parseFloat(prospectingGoalSkill.goal / months).toFixed(2));
                        }
                    }

                }
            }
            $scope.calculateProspectingSkillGoalByPerMonthGoal = function (prospectingGoalSkill) {
                var taskdata = _.find($scope.prospectingTaskTodos, function (item) {
                    return item.id == $scope.prospectingGoalInfo.taskId;
                });
                if (taskdata) {
                    $scope.prospectingGoalInfo.taskRecurrenceRule = taskdata.recurrenceRule;
                    var event = new kendo.data.SchedulerEvent({
                        id: $scope.prospectingGoalInfo.id,
                        start: kendo.parseDate($scope.prospectingGoalInfo.goalStartDate),
                        end: kendo.parseDate($scope.prospectingGoalInfo.goalEndDate),
                        recurrenceRule: taskdata.recurrenceRule,
                    });
                    var occurrences = event.expand(kendo.parseDate($scope.prospectingGoalInfo.goalStartDate), kendo.parseDate($scope.prospectingGoalInfo.goalEndDate));
                    var allDates = []
                    _.each(occurrences, function (item) {
                        allDates.push(item.start)
                    });
                    if (prospectingGoalSkill) {
                        // Total 
                        var firstMonthStart = moment(_.min(allDates)).startOf("month")._d;
                        var lastMonthEnd = moment(_.max(allDates)).endOf("month").add("minute", 1)._d;
                        var months = moment(lastMonthEnd).diff(moment(firstMonthStart), "month");
                        $scope.prospectingGoalInfo.totalMonths = months;
                        $scope.prospectingGoalInfo.totalDays = occurrences.length;
                        prospectingGoalSkill.goal = parseFloat(parseFloat(prospectingGoalSkill.goalPerMonth * months).toFixed(2));

                        // Per Day
                        if (!isNaN(prospectingGoalSkill.goal / occurrences.length)) {
                            prospectingGoalSkill.goalPerDay = parseFloat(parseFloat(prospectingGoalSkill.goal / occurrences.length).toFixed(2));
                        }

                        // Per Week
                        var allDates = [];
                        _.each(occurrences, function (item) {
                            allDates.push(item.start)
                        });
                        var firstWeekStart = moment(_.min(allDates)).startOf("week")._d;
                        var lastWeekEnd = moment(_.max(allDates)).endOf("week").add("minute", 1)._d;
                        var weeks = moment(lastWeekEnd).diff(moment(firstWeekStart), "week");
                        if (weeks == 0) {
                            weeks = 1;
                        };
                        $scope.prospectingGoalInfo.totalWeeks = weeks;
                        if (!isNaN(prospectingGoalSkill.goal / weeks)) {
                            prospectingGoalSkill.goalPerWeek = parseFloat(parseFloat(prospectingGoalSkill.goal / weeks).toFixed(2));
                        }
                    }

                }
            }
            $scope.saveProspectingGoal = function () {
                if ($scope.prospectingGoalInfo.id == 0) {
                    $scope.prospectingGoalInfo.prospectingType = prospectingTypesEnum.Service;
                    var isExist = false;
                    if ($scope.prospectingGoalInfo.taskId) {
                        isExist = _.any($scope.prospectingGoals, function (item) {
                            return item.taskId == $scope.prospectingGoalInfo.taskId && item.userId == $scope.currentUser.userId;
                        });
                    }
                    if (!isExist) {
                        $scope.prospectingGoalInfo.id = ($scope.prospectingGoals.length + 1) * -1;
                        if ($scope.prospectingGoalSkills) {
                            if ($scope.prospectingGoalSkills.length > 0) {
                                $scope.prospectingGoalInfo.prospectingSkillGoals = $scope.prospectingGoalSkills;
                            }
                        }
                        //$scope.prospectingGoals.push($scope.prospectingGoal);
                        serviceProspectingManager.addProspectingGoal($scope.prospectingGoalInfo).then(function (data) {
                            $scope.prospectingGoalInfo.id = data.id;
                            serviceProspectingManager.getSkillsByProspectingGoalId($scope.prospectingGoalInfo.id).then(function (skillDatas) {
                                skillDatas = _.sortBy(skillDatas, 'seqNo');
                                $scope.profileSkills = skillDatas;
                                _.each($scope.prospectingGoalInfo.prospectingSkillGoals, function (dataItem) {
                                    var skillinfo = _.find($scope.profileSkills, function (skillItem) {
                                        return skillItem.id == dataItem.skillId;
                                    });
                                    if (skillinfo) {
                                        dataItem.skillName = skillinfo.name;
                                        var skillResult = _.filter($scope.prospectingActivityCustomerResults, function (resultItem) {
                                            return resultItem.skillId == skillinfo.id && resultItem.prospectingCustomer.prospectingGoalId == dataItem.prospectingGoalId;
                                        });
                                        dataItem["result"] = skillResult.length;
                                        dataItem["seqNo"] = skillinfo.seqNo;
                                    }
                                });
                                $scope.prospectingGoalInfo.calculatedProspectingGoals = [];
                                $scope.prospectingGoalInfo.adjustedGoals = [];
                                $scope.prospectingGoalInfo.currentPerformanceGoals = [];
                                $scope.prospectingGoalInfo.goalStartDate = moment(kendo.parseDate($scope.prospectingGoalInfo.goalStartDate)).format("L LT");
                                $scope.prospectingGoalInfo.goalEndDate = moment(kendo.parseDate($scope.prospectingGoalInfo.goalEndDate)).format("L LT");
                                if (moment(kendo.parseDate($scope.prospectingGoalInfo.goalEndDate)).isBefore(moment($scope.endOfDay))) {
                                    $scope.prospectingGoalInfo["status"] = $scope.goalStatusEnum.Expired;
                                }
                                else if (moment(kendo.parseDate($scope.prospectingGoalInfo.goalStartDate)).isAfter(moment($scope.endOfDay))) {
                                    $scope.prospectingGoalInfo["status"] = $scope.goalStatusEnum.Upcoming;
                                }
                                else if (moment(kendo.parseDate($scope.prospectingGoalInfo.goalStartDate)).isBefore(moment($scope.endOfDay))) {
                                    $scope.prospectingGoalInfo["status"] = $scope.goalStatusEnum.Active;
                                }
                                $scope.prospectingGoals.push($scope.prospectingGoalInfo);
                                dialogService.showNotification("Goal Saved!", "info");

                                $scope.openAddActivity(data.id)
                            })
                            //$("#addProspectingGoalModal").modal("hide");
                        });
                    }
                    else {
                        dialogService.showNotification($translate.instant('TASKPROSPECTING_YOU_HAVE_ALREADY_ADDED_GOALS_FOR_THIS_SELECTED_TASK'), 'warning');
                    }
                }
                else if ($scope.prospectingGoalInfo.id > 0) {
                    $scope.prospectingGoalInfo.prospectingType = prospectingTypesEnum.Service;
                    serviceProspectingManager.updateProspectingGoal($scope.prospectingGoalInfo).then(function (data) {
                        _.each($scope.prospectingGoals, function (item) {
                            if (item.id == $scope.prospectingGoalInfo.id) {
                                item.goalStartDate = moment(kendo.parseDate($scope.prospectingGoalInfo.goalStartDate)).format("L LT");
                                item.goalEndDate = moment(kendo.parseDate($scope.prospectingGoalInfo.goalEndDate)).format("L LT");
                                _.each(item.prospectingSkillGoals, function (skillGoalItem) {
                                    skillGoalItem.skillName = skillGoalItem.skill ? skillGoalItem.skill.name : skillGoalItem.skillName;
                                });
                            }
                        });
                        $("#addProspectingGoalModal").modal("hide");
                        dialogService.showNotification($translate.instant('TASKPROSPECTING_PROSPECTING_GOAL_DETAILS_UPDATED_SUCCESSFULLY'), 'info');
                    });
                }
            }


            //Activity
            $scope.activityCalculationTypeEnum = {
                OneTime: 1,
                RecurrentAndMultiple: 2
            }
            $scope.ActivityCalculationTypeOptions = [{
                value: 1, text: $translate.instant('TASKPROSPECTING_ONE_TIME_ACTIVITY')
            },
            {
                value: 2, text: $translate.instant('TASKPROSPECTING_RECURRENT_AND_MULTIPLE_ACTIVITIES')
            }];
            $scope.prospectingGoalActivityInfoes = [];
            $scope.openAddActivity = function (id) {
                $scope.prospectingGoalActivityInfo = {
                    id: 0,
                    taskId: 0,
                    prospectingGoalId: 0,
                    activityTime: 0,
                    breakTime: 0,
                    totalActivities: 0,
                    activityStartTime: moment(new Date()).format("L LT"),
                    activitiyEndTime: null,
                    userId: 0,
                    frequency: null,
                    activityCalculationType: null,
                }
                $scope.prospectingActivities = [];
                $scope.calculateActivities();
                $scope.calculateRecurrenceActivity();


                $scope.prospectingGoalNames = [];
                _.each($scope.prospectingGoals, function (goalsItem) {
                    $scope.prospectingGoalNames.push({ id: goalsItem.id, name: goalsItem.name });
                });
                //handler popover close
                $('[data-toggle="m-popover"]').popover({
                    placement: 'bottom',
                    html: 'true',
                    title: '<span class="text-info"><strong>Info</strong></span> <i class="fa fa-close pull-right"></i>',
                    content: 'test'
                })
                $(document).on("click", ".popover .fa-close", function () {
                    $(this).parents(".popover").popover('hide');
                });
                $("#tab1").removeClass("active");
                $("li[data-target='#tab1']").removeClass("active");
                $("#tab1").hide();
                $("li[data-target='#tab2']").addClass("active");
                $("#tab2").addClass("active");
                $("#tab2").show();
                if (id > 0) {
                    $scope.prospectingGoalActivityInfo.prospectingGoalId = id;
                    $scope.changeProspectingGoal();
                }
            }
            $scope.changeProspectingGoal = function () {
                var info = _.find($scope.prospectingGoals, function (item) {
                    return item.id == $scope.prospectingGoalActivityInfo.prospectingGoalId;
                });
                if (info) {
                    $scope.prospectingGoalActivityInfo.taskId = info.taskId;
                    $scope.prospectingGoalActivityInfo.frequency = info.recurrenceRule;
                    $scope.prospectingGoalActivityInfo.activityStartTime = moment(kendo.parseDate(info.goalStartDate)).format('L LT');
                    $scope.prospectingGoalActivityInfo.activityEndTime = moment(kendo.parseDate(info.goalEndDate)).format('L LT');

                    var start = moment(kendo.parseDate($scope.prospectingGoalActivityInfo.activityStartTime))
                    var end = moment(kendo.parseDate($scope.prospectingGoalActivityInfo.activityEndTime))
                    var startHour = start.hour();
                    var startminute = start.minute();
                    var endHour = end.hour();
                    var endminute = end.minute();
                    var newStartDate = moment().set({ 'hour': startHour, 'minute': startminute, 'second': 0, 'millisecond': 0 });
                    var newEndDate = moment().set({ 'hour': endHour, 'minute': endminute, 'second': 0, 'millisecond': 0 });
                    var diff = moment.duration(newEndDate.diff(newStartDate))
                    var totalMinutes = diff.minutes();
                    if (diff.hours() > 0) {
                        totalMinutes += (diff.hours() * 60);
                    }
                    if (!(totalMinutes > 0)) {
                        totalMinutes = (24 * 60) - 1;
                    }
                    $scope.prospectingGoalActivityInfo.activityTime = totalMinutes;

                    if ($("#activityRecurrenceEditor").find("#recurrenceEditor").data("kendoRecurrenceEditor")) {
                        $("#activityRecurrenceEditor").find("#recurrenceEditor").data("kendoRecurrenceEditor").value($scope.prospectingGoalActivityInfo.frequency)
                    }
                }
                $scope.SplitSkillGoals = [];
            }
            $scope.changeActivityCalculationType = function () {
                //$scope.prospectingGoalActivityInfo.activityTime = 0;
                $scope.prospectingGoalActivityInfo.breakTime = 0;
                $scope.prospectingGoalActivityInfo.totalActivities = 0;
                //$scope.prospectingGoalActivityInfo.frequency = null;
                $scope.prospectingActivities = [];
                $scope.SplitSkillGoals = [];
                if ($scope.prospectingGoalActivityInfo.activityCalculationType == $scope.activityCalculationTypeEnum.OneTime) {
                    var start = moment(kendo.parseDate($scope.prospectingGoalActivityInfo.activityStartTime))
                    var end = moment(kendo.parseDate($scope.prospectingGoalActivityInfo.activityEndTime))
                    var startHour = start.hour();
                    var startminute = start.minute();
                    var endHour = end.hour();
                    var endminute = end.minute();
                    var newStartDate = moment().set({ 'hour': startHour, 'minute': startminute, 'second': 0, 'millisecond': 0 });
                    var newEndDate = moment().set({ 'hour': endHour, 'minute': endminute, 'second': 0, 'millisecond': 0 });
                    var diff = moment.duration(newEndDate.diff(newStartDate))
                    var totalMinutes = diff.minutes();
                    if (diff.hours() > 0) {
                        totalMinutes += (diff.hours() * 60);
                    }
                    if (!(totalMinutes > 0)) {
                        totalMinutes = (24 * 60) - 1;
                    }
                    $scope.prospectingGoalActivityInfo.activityTime = totalMinutes;
                    $scope.calculateRecurrenceActivity();
                }
                else if ($scope.prospectingGoalActivityInfo.activityCalculationType == $scope.activityCalculationTypeEnum.RecurrentAndMultiple) {
                    $scope.prospectingGoalActivityInfo.totalActivities = 1;
                    $scope.prospectingGoalActivityInfo.breakTime = 15;
                    $scope.calculateActivities();
                }

                if ($scope.prospectingGoalActivityInfo.taskId) {
                    if ($("#activityRecurrenceEditor").find("#recurrenceEditor").data("kendoRecurrenceEditor")) {
                        $("#activityRecurrenceEditor").find("#recurrenceEditor").data("kendoRecurrenceEditor").value($scope.prospectingGoalActivityInfo.frequency)
                    }
                }
                else {
                    if ($scope.prospectingGoalActivityInfo.activityCalculationType == 1) {
                        $scope.prospectingGoalActivityInfo.frequency = 'FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR';
                        if ($("#activityRecurrenceEditor").find("#recurrenceEditor").data("kendoRecurrenceEditor")) {
                            $("#activityRecurrenceEditor").find("#recurrenceEditor").data("kendoRecurrenceEditor").value($scope.prospectingGoalActivityInfo.frequency)
                        }
                    }
                }
            }
            $scope.saveProspectingGoalActivityInfo = function () {
                if (!($scope.prospectingGoalActivityInfo.id > 0)) {
                    serviceProspectingManager.addProspectingGoalActivityInfo($scope.prospectingGoalActivityInfo).then(function (data) {
                        if (data) {
                            data.activityStartTime = moment(kendo.parseDate(data.activityStartTime)).format("L LT");
                            data.activityEndTime = moment(kendo.parseDate(data.activityEndTime)).format("L LT");
                            _.each(data.prospectingActivities, function (activityItem) {
                                activityItem.activityStart = moment(kendo.parseDate(activityItem.activityStart)).format("L LT");
                                activityItem.activityEnd = moment(kendo.parseDate(activityItem.activityEnd)).format("L LT");
                            });
                            $scope.prospectingGoalActivityInfoes.push(data);
                            dialogService.showNotification("Actvitiy plan saved successfully", "success");
                        }
                    })
                }
                else {
                    serviceProspectingManager.updateProspectingGoalActivityInfo($scope.prospectingGoalActivityInfo).then(function (data) {
                        dialogService.showNotification("Actvitiy Plan updated successfully", "success");
                    })
                }
            }
            $scope.calculateActivities = function () {
                moment.locale(globalVariables.lang.currentUICulture);
                if (!($scope.prospectingGoalActivityInfo.prospectingActivities)) {
                    $scope.prospectingGoalActivityInfo["prospectingActivities"] = [];
                }
                if (!($scope.prospectingGoalActivityInfo.prospectingActivities.length > 0 && $scope.prospectingGoalActivityInfo.id > 0)) {
                    $scope.prospectingActivities = [];

                    if ($scope.prospectingGoalActivityInfo.totalActivities > 0 && $scope.prospectingGoalActivityInfo.activityTime > 0 && $scope.prospectingGoalActivityInfo.activityStartTime != null) {
                        var start = moment(kendo.parseDate($scope.prospectingGoalActivityInfo.activityStartTime))
                        var end = moment(kendo.parseDate($scope.prospectingGoalActivityInfo.activityEndTime))
                        var startHour = start.hour();
                        var startminute = start.minute();
                        var endHour = end.hour();
                        var endminute = end.minute();
                        var newStartDate = moment().set({ 'hour': startHour, 'minute': startminute, 'second': 0, 'millisecond': 0 });
                        var newEndDate = moment().set({ 'hour': endHour, 'minute': endminute, 'second': 0, 'millisecond': 0 });
                        var diff = moment.duration(newEndDate.diff(newStartDate))
                        var totalMinutes = diff.minutes();
                        if (diff.hours() > 0) {
                            totalMinutes += (diff.hours() * 60);
                        }
                        if (!(totalMinutes > 0)) {
                            totalMinutes = (24 * 60) - 1;
                        }
                        var maxActivityTime = parseInt(totalMinutes / $scope.prospectingGoalActivityInfo.totalActivities) - ($scope.prospectingGoalActivityInfo.breakTime * ($scope.prospectingGoalActivityInfo.totalActivities - 1));
                        if ($scope.prospectingGoalActivityInfo.activityTime > maxActivityTime) {
                            $scope.prospectingGoalActivityInfo.activityTime = maxActivityTime;
                            dialogService.showNotification($translate.instant('TASKPROSPECTING_MAXIMUM') + " " + maxActivityTime + " minutes can be set for actvity time");
                        }
                        var event = new kendo.data.SchedulerEvent({
                            id: $scope.prospectingGoalActivityInfo.id,
                            start: kendo.parseDate($scope.prospectingGoalActivityInfo.activityStartTime),
                            end: kendo.parseDate($scope.prospectingGoalActivityInfo.activityEndTime),
                            recurrenceRule: $scope.prospectingGoalActivityInfo.frequency,
                        });

                        var occurrences = event.expand(kendo.parseDate($scope.prospectingGoalActivityInfo.activityStartTime), kendo.parseDate($scope.prospectingGoalActivityInfo.activityEndTime));
                        _.each(occurrences, function (prospectingGoalActivityItem) {

                            var goalName = $translate.instant('TASKPROSPECTING_ACTIVITY');
                            for (var i = 0; i < $scope.prospectingGoalActivityInfo.totalActivities; i++) {
                                if (i == 0) {
                                    $scope.prospectingActivities.push({
                                        name: goalName + " - " + (i + 1),
                                        activityStart: moment(kendo.parseDate(prospectingGoalActivityItem.start))._d,
                                        activityEnd: moment(kendo.parseDate(prospectingGoalActivityItem.start)).add($scope.prospectingGoalActivityInfo.activityTime, "minutes")._d,
                                    })
                                }
                                else {
                                    var lastActivity = $scope.prospectingActivities[$scope.prospectingActivities.length - 1];
                                    if (!(kendo.parseDate(moment(kendo.parseDate(lastActivity.activityEnd)).add($scope.prospectingGoalActivityInfo.breakTime, "minutes").format("L LT")) >= kendo.parseDate($scope.prospectingGoalActivityInfo.activityEndTime))) {
                                        $scope.prospectingActivities.push({
                                            name: goalName + " - " + (i + 1),
                                            activityStart: moment(kendo.parseDate(lastActivity.activityEnd)).add($scope.prospectingGoalActivityInfo.breakTime, "minutes")._d,
                                            activityEnd: moment(kendo.parseDate(lastActivity.activityEnd)).add($scope.prospectingGoalActivityInfo.breakTime, "minutes").add($scope.prospectingGoalActivityInfo.activityTime, "minutes")._d,
                                        });
                                    }
                                }
                            }


                        })


                        var lastActivity = $scope.prospectingActivities[$scope.prospectingActivities.length - 1];
                        //$scope.prospectingGoalActivityInfo.activityEndTime = moment(lastActivity.activityEnd).format("L LT");
                        if ($scope.prospectingGoalActivityInfo.totalActivities > $scope.prospectingActivities.length) {
                            dialogService.showNotification($translate.instant('TASKPROSPECTING_MAXIMUM') + $scope.prospectingActivities.length + " " + $translate.instant('TASKPROSPECTING_ACTVIITIES_POSSIBLE_FOR_GIVEN_ACTVITY_MINUTE_AND_BREAK_TIME'), 'warning');
                            $scope.prospectingGoalActivityInfo.totalActivities = $scope.prospectingActivities.length;
                        }
                        //$scope.prospectingActivities.totalActivities = $scope.prospectingActivities.length;
                        $scope.prospectingGoalActivityInfo.prospectingActivities = $scope.prospectingActivities;

                        $scope.CalculatedSplitSkillGoals($scope.prospectingGoalActivityInfo.prospectingGoalId, $scope.prospectingGoalActivityInfo.prospectingActivities)
                    }

                    if ($("#goalActivities").data("kendoGrid")) {
                        $("#goalActivities").kendoGrid("destroy");
                        $("#goalActivities").html("");
                    }
                    _.each($scope.prospectingActivities, function (item) {
                        item.activityEnd = kendo.parseDate(item.activityEnd);
                        item.activityStart = kendo.parseDate(item.activityStart);
                    })
                    $scope.prospectingGoalActivityInfo.prospectingActivities = $scope.prospectingActivities;
                    $scope.CalculatedSplitSkillGoals($scope.prospectingGoalActivityInfo.prospectingGoalId, $scope.prospectingGoalActivityInfo.prospectingActivities)
                    $("#goalActivities").kendoGrid({
                        dataSource: {
                            type: "json",
                            data: $scope.prospectingActivities,
                            pageSize: 10,
                        },
                        groupable: false, // this will remove the group bar
                        columnMenu: false,
                        filterable: false,
                        pageable: true,
                        sortable: true,
                        columns: [
                            {
                                field: "name", title: $translate.instant('TASKPROSPECTING_ACTIVITY'),
                            },
                            {
                                field: "activityStart", title: $translate.instant('TASKPROSPECTING_START_TIME'), template: function (data, value) {
                                    return moment(kendo.parseDate(data.activityStart)).format('L LT');
                                }
                            },
                            {
                                field: "activityEnd", title: $translate.instant('TASKPROSPECTING_END_TIME'), template: function (data, value) {
                                    return moment(kendo.parseDate(data.activityEnd)).format('L LT');
                                }
                            },
                        ],
                    });
                }
            }
            $scope.CalculatedSplitSkillGoals = function (prospectingGoalId, activities) {
                var prospectingActivities = _.clone(activities);
                var prospectingGoal = _.find($scope.prospectingGoals, function (item) {
                    return item.id == prospectingGoalId;
                });
                var alldates = [];
                _.each(prospectingActivities, function (item, index) {
                    alldates.push(moment(kendo.parseDate(item.activityStart)).format("L"));
                });
                var uniqueDates = _.uniq(alldates);
                var weeks = [];
                var months = [];
                _.each(uniqueDates, function (item, index) {
                    var startOfWeek = null;
                    var endOfWeek = null;

                    var startOfMonth = null;
                    var endOfMonth = null;

                    if (index == 0) {
                        startOfWeek = moment(kendo.parseDate(item)).startOf('week')._d;
                        endOfWeek = moment(kendo.parseDate(item)).endOf('week')._d;
                        weeks.push({
                            start: startOfWeek,
                            end: endOfWeek,
                        });

                        startOfMonth = moment(kendo.parseDate(item)).startOf('month')._d;
                        endOfMonth = moment(kendo.parseDate(item)).endOf('month')._d;
                        months.push({
                            start: startOfMonth,
                            end: endOfMonth,
                        });
                    }
                    else {
                        if (!(kendo.parseDate(item) >= weeks[weeks.length - 1].start && kendo.parseDate(item) < weeks[weeks.length - 1].end)) {
                            startOfWeek = moment(kendo.parseDate(item)).startOf('week')._d;
                            endOfWeek = moment(kendo.parseDate(item)).endOf('week')._d;
                            weeks.push({
                                start: startOfWeek,
                                end: endOfWeek,
                            });
                        }
                        if (!(kendo.parseDate(item) >= months[months.length - 1].start && kendo.parseDate(item) < months[months.length - 1].end)) {
                            startOfMonth = moment(kendo.parseDate(item)).startOf('month')._d;
                            endOfMonth = moment(kendo.parseDate(item)).endOf('month')._d;
                            months.push({
                                start: startOfMonth,
                                end: endOfMonth,
                            });
                        }
                    }
                })
                $scope.SplitSkillGoals = [];
                if (prospectingGoal) {
                    _.each(prospectingGoal.prospectingSkillGoals, function (item) {
                        if (!item.skillName) {
                            if (item.skill) {
                                item.skillName = item.skill.name;
                            }
                        }
                        var perActivity = Math.round(parseFloat(item.goal / prospectingActivities.length).toFixed(2) * 100) / 100;
                        var dailyGoal = Math.round(parseFloat(item.goal / uniqueDates.length).toFixed(2) * 100) / 100;

                        var actvityDaysInWeek = 0;
                        var weekDiff = weeks.length; //moment($scope.prospectingGoalActivityInfo.activityEndTime).diff(moment($scope.prospectingGoalActivityInfo.activityStartTime), 'week')
                        var monthDiff = months.length;  //moment($scope.prospectingGoalActivityInfo.activityEndTime).diff(moment($scope.prospectingGoalActivityInfo.activityStartTime), 'month')

                        var SplitSkillGoal = {
                            skillId: item.skillId,
                            skillName: item.skillName,
                            perActvity: perActivity,
                            daily: dailyGoal,
                            weekly: Math.round(parseFloat(item.goal / weekDiff).toFixed(2) * 100) / 100,
                            monthly: Math.round(parseFloat(item.goal / monthDiff).toFixed(2) * 100) / 100,
                            total: item.goal,
                        };
                        $scope.SplitSkillGoals.push(SplitSkillGoal)
                    })
                }

            }
            $scope.calculateRecurrenceActivity = function () {
                moment.locale(globalVariables.lang.currentUICulture);
                if (!($scope.prospectingGoalActivityInfo.prospectingActivities)) {
                    $scope.prospectingGoalActivityInfo["prospectingActivities"] = [];
                }
                if (!($scope.prospectingGoalActivityInfo.prospectingActivities.length > 0 && $scope.prospectingGoalActivityInfo.id > 0)) {
                    if ($scope.prospectingGoalActivityInfo.activityCalculationType == $scope.activityCalculationTypeEnum.OneTime) {
                        var start = moment(kendo.parseDate($scope.prospectingGoalActivityInfo.activityStartTime))
                        var end = moment(kendo.parseDate($scope.prospectingGoalActivityInfo.activityEndTime))
                        var startHour = start.hour();
                        var startminute = start.minute();
                        var endHour = end.hour();
                        var endminute = end.minute();
                        var newStartDate = moment().set({ 'hour': startHour, 'minute': startminute, 'second': 0, 'millisecond': 0 });
                        var newEndDate = moment().set({ 'hour': endHour, 'minute': endminute, 'second': 0, 'millisecond': 0 });
                        var diff = moment.duration(newEndDate.diff(newStartDate))
                        var totalMinutes = diff.minutes();
                        if (diff.hours() > 0) {
                            totalMinutes += (diff.hours() * 60);
                        }
                        if (!(totalMinutes > 0)) {
                            totalMinutes = (24 * 60) - 1;
                        }
                        if ($scope.prospectingGoalActivityInfo.activityTime > totalMinutes) {
                            $scope.prospectingGoalActivityInfo.activityTime = totalMinutes;
                            dialogService.showNotification($translate.instant('TASKPROSPECTING_MAXIMUM') + " " + totalMinutes + " minutes can be set for actvity time");
                        }
                    }
                    var event = new kendo.data.SchedulerEvent({
                        id: $scope.prospectingGoalActivityInfo.id,
                        start: kendo.parseDate($scope.prospectingGoalActivityInfo.activityStartTime),
                        end: kendo.parseDate($scope.prospectingGoalActivityInfo.activityEndTime),
                        recurrenceRule: $scope.prospectingGoalActivityInfo.frequency,
                        isAllDay: moment(kendo.parseDate($scope.prospectingGoalActivityInfo.activityStartTime)).format("HHmmss") == "000000",
                    });
                    var occurrences = event.expand(kendo.parseDate($scope.prospectingGoalActivityInfo.activityStartTime), kendo.parseDate($scope.prospectingGoalActivityInfo.activityEndTime));
                    $scope.prospectingActivities = [];



                    _.each(occurrences, function (item, i) {
                        var activityEnd = $scope.prospectingGoalActivityInfo.activityTime ? moment(item.start).add("minute", $scope.prospectingGoalActivityInfo.activityTime)._d : moment(item.start).endOf('day')._d;
                        $scope.prospectingActivities.push({
                            name: "Activity - " + (i + 1),
                            activityStart: moment(item.start)._d,
                            activityEnd: activityEnd,
                        });
                    })
                    $scope.prospectingGoalActivityInfo.totalActivities = 1;
                    $scope.prospectingGoalActivityInfo.prospectingActivities = $scope.prospectingActivities;
                    $scope.CalculatedSplitSkillGoals($scope.prospectingGoalActivityInfo.prospectingGoalId, $scope.prospectingGoalActivityInfo.prospectingActivities)
                    if ($("#goalRecurrenceActivities").data("kendoGrid")) {
                        $("#goalRecurrenceActivities").kendoGrid("destroy");
                        $("#goalRecurrenceActivities").html("");
                    }
                    _.each($scope.prospectingActivities, function (item) {
                        item.activityEnd = kendo.parseDate(item.activityEnd);
                        item.activityStart = kendo.parseDate(item.activityStart);
                    })
                    $("#goalRecurrenceActivities").kendoGrid({
                        dataSource: {
                            type: "json",
                            data: $scope.prospectingActivities,
                            pageSize: 10,
                        },
                        groupable: false, // this will remove the group bar
                        columnMenu: false,
                        filterable: false,
                        pageable: true,
                        sortable: true,
                        columns: [
                            {
                                field: "name", title: $translate.instant('TASKPROSPECTING_ACTIVITY'),
                            },
                            {
                                field: "activityStart", title: $translate.instant('TASKPROSPECTING_START_TIME'), template: function (data, value) {
                                    return moment(kendo.parseDate(data.activityStart)).format('L LT');
                                }
                            },
                            {
                                field: "activityEnd", title: $translate.instant('TASKPROSPECTING_END_TIME'), template: function (data, value) {
                                    return moment(kendo.parseDate(data.activityEnd)).format('L LT');
                                }
                            },
                        ],
                    });
                }
            }
            $scope.actvityStartDateOpen = function (event) {
                var datepicker = $(event.sender.element).data("kendoDateTimePicker");
                datepicker.setOptions({
                    min: kendo.parseDate(new Date($scope.today)),
                    max: kendo.parseDate($scope.prospectingGoalActivityInfo.activityEndTime),
                });
            }
            $scope.actvityStartDateChange = function (event) {
                $scope.prospectingGoalActivityInfo.activityStartTime = moment(event.sender.value()).format("L LT");
                if ($scope.prospectingGoalActivityInfo.activityCalculationType == $scope.activityCalculationTypeEnum.OneTime) {
                    var start = moment(kendo.parseDate($scope.prospectingGoalActivityInfo.activityStartTime))
                    var end = moment(kendo.parseDate($scope.prospectingGoalActivityInfo.activityEndTime))
                    var startHour = start.hour();
                    var startminute = start.minute();
                    var endHour = end.hour();
                    var endminute = end.minute();
                    var newStartDate = moment().set({ 'hour': startHour, 'minute': startminute, 'second': 0, 'millisecond': 0 });
                    var newEndDate = moment().set({ 'hour': endHour, 'minute': endminute, 'second': 0, 'millisecond': 0 });
                    var diff = moment.duration(newEndDate.diff(newStartDate))
                    var totalMinutes = diff.minutes();
                    if (diff.hours() > 0) {
                        totalMinutes += (diff.hours() * 60);
                    }
                    if (!(totalMinutes > 0)) {
                        totalMinutes = (24 * 60) - 1;
                    }
                    $scope.prospectingGoalActivityInfo.activityTime = totalMinutes;
                    $scope.calculateRecurrenceActivity();
                }
                else if ($scope.prospectingGoalActivityInfo.activityCalculationType == $scope.activityCalculationTypeEnum.RecurrentAndMultiple) {
                    $scope.prospectingGoalActivityInfo.totalActivities = 1;
                    $scope.calculateActivities();
                }
            }
        }
    ])