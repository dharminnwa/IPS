﻿angular.module('ips.serviceProspecting')
    .config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
        var baseServiceProspectingResolve = {
            pageName: function ($translate) {
                return $translate.instant('LEFTMENU_SERVICE_PROSPECTING'); //'Service Prospecting';
            },
        };
        $stateProvider
            .state('serviceProspecting', {
                url: "/serviceProspecting",
                templateUrl: "views/serviceProspecting/views/serviceProspecting.html",
                controller: "ServiceProspectingCtrl as serviceProspecting",
                resolve: baseServiceProspectingResolve,
                data: {
                    displayName: '{{pageName}}',
                    resource: "Service Prospecting",
                }
            })
    }])
    .controller("ServiceProspectingCtrl",['$scope', 'cssInjector', '$stateParams', '$location', 'todoManager', 'todosManager', 'serviceProspectingManager', 'dialogService', 'progressBar', 'localStorageService', '$compile', 'projectRolesEnum', 'prospectingTypesEnum', 'globalVariables', '$translate',
            function ($scope, cssInjector, $stateParams, $location, todoManager, todosManager, serviceProspectingManager, dialogService, progressBar, localStorageService, $compile, projectRolesEnum, prospectingTypesEnum, globalVariables, $translate) {
                cssInjector.removeAll();
                cssInjector.add('views/serviceProspecting/serviceProspecting.css');
                var authData = localStorageService.get('authorizationData');
                $scope.defaultTaskProspecting = localStorageService.get("prospectingTask");
                localStorageService.set("prospectingTask", null);
                $scope.currentUser = authData.user;
                $scope.today = new Date().setHours(0, 0, 0, 0);
                moment.locale(globalVariables.lang.currentUICulture);
                var endDay = moment();
                $scope.endOfDay = endDay.endOf('day')._d;
                $scope.prospectingType = prospectingTypesEnum.Service;
                var startWeek = moment();
                $scope.weekStartDate = startWeek.startOf("isoWeek")._d;
                $scope.weekEndDate = moment($scope.weekStartDate).isoWeekday(7)._d;
                $scope.previousWeekStartDate = moment($scope.weekStartDate).subtract("day", 1).startOf("isoWeek")._d;;
                $scope.previousWeekEndDate = moment($scope.previousWeekStartDate).isoWeekday(7)._d;
                $scope.monthStartDate = moment().startOf("month")._d;
                $scope.monthEndDate = moment().endOf('month')._d;
                $scope.resultFilterOptionEnums = {
                    Monthly: 1,
                    Weekly: 2,
                    Total: 3,
                    Today: 4,
                };
                $scope.resultFilterOptions = [
                    { id: 1, name: $translate.instant('TASKPROSPECTING_MONTHLY') },
                    { id: 2, name: $translate.instant('TASKPROSPECTING_WEEKLY') },
                    { id: 3, name: $translate.instant('MYPROJECTS_PROJECTSTATUS_TOTAL') },
                    { id: 4, name: $translate.instant('COMMON_TODAY') }
                ];
                $scope.topboxResultTypeEnum = {
                    Percentage: 1,
                    Counts: 2,
                    RemainCounts: 3,
                    CurrentPerformanceResult: 4,
                    CurrentPerformancePercentage: 5,
                };
                $scope.topBoxFilterOption = {
                    projectId: 0,
                    prospectingGoalId: 0,
                    prospectingGoalIds: [],
                    userId: 0,
                    userName: $translate.instant('TASKPROSPECTING_ALL_MEMBERS'),
                    calls: true,
                    talks: true,
                    service: true,
                    topboxResultOptionId: $scope.resultFilterOptionEnums.Total,
                    topboxResultTypeId: $scope.topboxResultTypeEnum.Percentage,
                    aggregteDashboard: true,
                    taskDashboard: false,
                    chartResult: false,
                    todaysTask: false,
                    goalsAndPerformance: false,
                    activityResult: false,

                };
                $scope.topboxResultTypes = [
                    { id: 1, name: $translate.instant('TASKPROSPECTING_PERCENTAGE') },
                    { id: 2, name: $translate.instant('HOME_RESULT_VS_GOAL') },
                    { id: 3, name: $translate.instant('TASKPROSPECTING_REMAINING_GOAL') },
                    { id: 4, name: $translate.instant('TASKPROSPECTING_CURRENT_PERFORMANCE_RESULT') },
                    { id: 5, name: $translate.instant('TASKPROSPECTING_CURRENT_PERFORMANCE_PERCENTAGE') },
                ];

                $scope.projects = [];
                $scope.TotalGoalData = [0, 0, 0];
                $scope.TotalResultData = [0, 0, 0];
                $scope.TotalPercetageData = [0, 0, 0];
                $scope.scaleColors = ['', '', '', '', ''];
                $scope.prospectingGoals = [];
                $scope.prospectingGoalItems = [];
                $scope.prosoectingGoalCustomTexts = { buttonDefaultText: '--' + $translate.instant('TASKPROSPECTING_SELECT_PROSPECTING') + '--' };
                $scope.prospectingGoalButtonSettings = {
                    smartButtonMaxItems: 3,
                    smartButtonTextConverter: function (itemText, originalItem) {
                        return itemText;
                    },
                    template: '<b>{{option.label}}</b>'
                };
                $scope.prospectingGoalOptions = null;
                $scope.prosoectingGoalSelectionEvents = {
                    onItemSelect: function (item) {
                        $scope.filterProspectingGoalChanged();
                    },
                    onItemDeselect: function (item) {
                        $scope.filterProspectingGoalChanged();
                    },
                    onSelectAll: function () {
                        $scope.topBoxFilterOption.prospectingGoalIds = [];
                        _.each($scope.prospectingGoalItems, function (item) {
                            if (item.id > 0) {
                                $scope.topBoxFilterOption.prospectingGoalIds.push({ id: item.id });
                            }
                        })
                        $scope.filterProspectingGoalChanged();
                    },
                    onDeselectAll: function () {
                        if ($scope.topBoxFilterOption.prospectingGoalIds.length > 0) {
                            $scope.topBoxFilterOption.prospectingGoalIds = [];
                            $scope.filterProspectingGoalChanged();
                        }
                    }
                };
                $scope.ProspectingGoalTypes = [{
                    id: 3, name: "Task"
                }];
                $scope.prospectingCustomers = [];
                $scope.prospectingGoalActivityInfoes = [];
                $scope.prospectingActivityCustomers = [];
                $scope.prospectingActivityCustomerResults = [];
                $scope.prospectingGoalVisualizationFilterOption = {
                    total: false,
                    today: true,
                    weekly: true,
                    monthly: false,
                    isShowActualGoal: false,
                }
                $scope.selectedProjectMembers = [];
                $scope.projectMembersOptions = null;
                $scope.projectMembersTexts = { buttonDefaultText: '--' + $translate.instant('TASKPROSPECTING_SELECT_MEMEBER') + '--' };
                $scope.prospectingGoalOptionTexts = { buttonDefaultText: '--' + $translate.instant('COMMON_SELECT') + '--' };
                $scope.projectMembersButtonSettings = {
                    smartButtonMaxItems: 3,
                    smartButtonTextConverter: function (itemText, originalItem) {
                        return itemText;
                    },
                    template: '<b>{{option.label}}</b>'
                };
                $scope.projectMembers = [];
                $scope.activityProspectingGoalFilterText = "All";
                $scope.FilterActivityProspectingGoalId = null;
                $scope.isActivityEditEnable = false;
                $scope.goalStatusEnum = {
                    Active: 1,
                    Upcoming: 2,
                    Expired: 3,
                }
                $scope.prospectingScaleRanges = [
                    {
                        color: "#f00",
                        from: 0,
                        max: 5,
                        maxPercentage: 50,
                        min: 0,
                        minPercentage: 0,
                        to: 50
                    },
                    {
                        color: "#ff0   ",
                        from: 50,
                        max: 7,
                        maxPercentage: 70,
                        min: 5,
                        minPercentage: 50,
                        to: 70,
                    },
                    {
                        color: "#0f0   ",
                        from: 70,
                        max: 10,
                        maxPercentage: 100,
                        min: 7,
                        minPercentage: 70,
                        to: 100,
                    }
                ];
                $scope.init = function () {
                    progressBar.startProgress();
                    moment.locale(globalVariables.lang.currentUICulture);
                    serviceProspectingManager.getServiceProspectingProjects().then(function (data) {
                        progressBar.stopProgress();
                        moment.locale(globalVariables.lang.currentUICulture);
                        $scope.projects = [];
                        _.each(data.activeProjects, function (item) {
                            $scope.projects.push(item);
                        });
                        _.each(data.completedProjects, function (item) {
                            $scope.projects.push(item);
                        });
                        if ($scope.projects.length > 0) {
                            if ($scope.defaultTaskProspecting) {
                                $scope.topBoxFilterOption.projectId = $scope.defaultTaskProspecting.projectId;
                                var selectedTaskProject = _.find($scope.projects, function (item) {
                                    return item.id == $scope.topBoxFilterOption.projectId;
                                });
                                if (selectedTaskProject) {
                                    $scope.totalStartDate = moment(kendo.parseDate(selectedTaskProject.expectedStartDate))._d;
                                    $scope.totalEndDate = moment(kendo.parseDate(selectedTaskProject.expectedEndDate))._d;
                                }
                            }
                            else {
                                var sortedProjects = _.sortBy($scope.projects, function (item) {
                                    return item.id;
                                }).reverse();
                                $scope.topBoxFilterOption.projectId = sortedProjects[0].id;
                                $scope.totalStartDate = moment(kendo.parseDate(sortedProjects[0].expectedStartDate))._d;
                                $scope.totalEndDate = moment(kendo.parseDate(sortedProjects[0].expectedEndDate))._d;
                            }
                            $scope.projects.unshift({ id: 0, name: $translate.instant('SERVICE_PROSPECTING_TASKS_WITHOUT_PROJECT') });
                        }
                        else {
                            $scope.projects.push({ id: 0, name: $translate.instant('SERVICE_PROSPECTING_TASKS_WITHOUT_PROJECT') });
                            $scope.topBoxFilterOption.projectId = 0;
                        }
                        $scope.fiterProjectChanged();
                    })
                    $('[data-toggle="m-popover"]').popover({
                        placement: 'bottom',
                        html: 'true',
                        title: '<span class="text-info"><strong>Info</strong></span> <i class="fa fa-close pull-right"></i>',
                        content: 'test'
                    })
                    $(document).on("click", ".popover .fa-close", function () {
                        $(this).parents(".popover").popover('hide');
                    });
                }
                $scope.projectMembersSelectionEvents = {
                    onItemSelect: function (item) {
                        memberChanged();
                    },
                    onItemDeselect: function (item) {
                        memberChanged();
                    },
                    onSelectAll: function () {
                        $scope.selectedProjectMembers = [];
                        _.each($scope.projectMembers, function (item) {
                            $scope.selectedProjectMembers.push({ id: item.id });
                        });
                        memberChanged();
                    },
                    onDeselectAll: function () {
                        if ($scope.selectedProjectMembers.length > 0) {
                            $scope.selectedProjectMembers = [];
                            memberChanged();
                        }
                    }
                };
                $scope.fiterProjectChanged = function () {
                    $scope.projectMembers = [];
                    $scope.topBoxFilterOption.userId = null;
                    $scope.topBoxFilterOption.userName = $translate.instant('TASKPROSPECTING_ALL_MEMBERS');
                    var selectedUserIds = [];
                    if ($scope.selectedProjectMembers.length > 0) {
                        _.each($scope.selectedProjectMembers, function (item) {
                            selectedUserIds.push(item.id);
                        });
                        var memberNames = [];
                        _.each(selectedUserIds, function (value) {
                            var member = _.find($scope.projectMembers, function (item) {
                                return item.id == value;
                            });
                            if (member) {
                                if (!($("#tab_" + value).hasClass("active"))) {
                                    $("#tab_" + value).addClass("active");
                                }
                                memberNames.push(member.firstName + " " + member.lastName);
                            }
                        });
                        if (memberNames.length > 0) {
                            $scope.topBoxFilterOption.userName = memberNames.join(',');
                        }
                    }
                    else {
                        $(".usertab").removeClass("active");
                    }
                    $scope.topBoxFilterOption.prospectingGoalIds = [];
                    if ($scope.topBoxFilterOption.projectId > 0) {
                        $scope.taskProspectingProjectMembers = [];
                        $scope.prospectingGoalUsers = [];
                        todosManager.getServiceProspectingProjectMembers($scope.topBoxFilterOption.projectId).then(function (taskProspectingProjectMembers) {
                            $scope.taskProspectingProjectMembers = taskProspectingProjectMembers;
                            todosManager.getProjectMembers($scope.topBoxFilterOption.projectId).then(function (data) {
                                if (data.length > 0) {
                                    $scope.allMembers = data;
                                    _.each(data, function (item) {
                                        if ($scope.isAllowedToShow(item.user.id)) {
                                            var isExist = _.any($scope.taskProspectingProjectMembers, function (dataItem) {
                                                return dataItem.userId == item.user.id;
                                            });
                                            if (isExist) {
                                                $scope.projectMembers.push(item.user);
                                                $scope.prospectingGoalUsers.push({ text: item.user.firstName + " " + item.user.lastName, value: item.user.id });
                                            }
                                        }
                                    });
                                    $scope.selectedProjectMembers = [];
                                    $scope.projectMembersOptions = getMultiSelectOptions($scope.projectMembers);

                                    if ($scope.isAllowedToManager()) {
                                        $scope.userTabChanged(0);
                                    }
                                    else {
                                        if ($scope.projectMembers.length > 0) {
                                            $scope.userTabChanged($scope.projectMembers[0].id);
                                        }
                                    }
                                }
                            });
                        })
                    }
                    else {

                        $scope.projectMembers = [];
                        $scope.projectMembers.push({ id: $scope.currentUser.userId, firstName: $scope.currentUser.firstName, lastName: $scope.currentUser.lastName });
                        $scope.selectedProjectMembers = [];
                        $scope.projectMembersOptions = getMultiSelectOptions($scope.projectMembers);

                        if ($scope.projectMembers.length > 0) {
                            $scope.userTabChanged($scope.projectMembers[0].id);
                        }
                    }
                }

                $scope.userTabChanged = function (userId) {
                    if (userId == 0) {
                        ResetAll();
                        var selectedUserIds = [];
                        if ($scope.selectedProjectMembers.length > 0) {
                            _.each($scope.selectedProjectMembers, function (item) {
                                selectedUserIds.push(item.id);
                            });
                            var memberNames = [];
                            _.each(selectedUserIds, function (value) {
                                var member = _.find($scope.projectMembers, function (item) {
                                    return item.id == value;
                                });
                                if (member) {
                                    if (!($("#tab_" + value).hasClass("active"))) {
                                        $("#tab_" + value).addClass("active");
                                    }
                                    memberNames.push(member.firstName + " " + member.lastName);
                                }
                            });
                            if (memberNames.length > 0) {
                                $scope.topBoxFilterOption.userName = memberNames.join(',');
                            }
                        }
                        else {
                            $(".usertab").removeClass("active");
                        }
                        var userIds = [];
                        _.each($scope.projectMembers, function (item) {
                            userIds.push(item.id);
                        });
                        progressBar.startProgress();
                        todoManager.getTodosByUserIds(userIds).then(function (data) {
                            progressBar.stopProgress();
                            moment.locale(globalVariables.lang.currentUICulture);
                            $scope.taskTodos = [];
                            $scope.prospectingTaskTodos = [];
                            var start = moment().startOf('day'); // set to 12:00 am today
                            var end = moment().endOf('day');
                            var today = new Date();
                            today = today.setHours(0, 0, 0, 0);
                            angular.forEach(data, function (item, index) {
                                if ($scope.topBoxFilterOption.projectId > 0) {
                                    if (item.projectId == $scope.topBoxFilterOption.projectId) {
                                        if (item.taskCategoryListItem.name.toLowerCase() == 'service prospecting') {
                                            item.start = moment(kendo.parseDate(item.startDate)).toDate();
                                            item.taskId = item.id;
                                            item.end = moment(kendo.parseDate(item.dueDate)).toDate();
                                            $scope.prospectingTaskTodos.push(item);
                                            var event = new kendo.data.SchedulerEvent({
                                                id: item.id,
                                                title: item.title,
                                                start: kendo.parseDate(item.startDate),
                                                end: kendo.parseDate(item.dueDate),
                                                recurrenceRule: item.recurrenceRule,
                                                taskCategoryListItem: item.taskCategoryListItem,
                                                training: item.training,
                                                trainingId: item.trainingId,
                                                isAllDay: moment(kendo.parseDate(item.startDate)).format("HHmmss") == "000000",
                                                textColor: (item.taskCategoryListItem ? item.taskCategoryListItem.textColor : "#FFFFFF"),
                                                color: (item.taskCategoryListItem ? item.taskCategoryListItem.color : "#000000"),
                                            });

                                            var occurrences = event.expand(kendo.parseDate(item.startDate), kendo.parseDate(item.dueDate));
                                            _.each(occurrences, function (todoItem) {
                                                if (kendo.parseDate(todoItem.start).setHours(0, 0, 0, 0) == today) {
                                                    var x = {
                                                        assignedToId: item.assignedToId,
                                                        categoryId: item.categoryId,
                                                        title: item.title,
                                                        description: item.description,
                                                        startDate: moment(todoItem.start).format('L LT'),
                                                        dueDate: moment(todoItem.start).endOf('day').format('L LT'),
                                                        id: item.id,
                                                        isCompleted: false,
                                                        recurrenceRule: item.recurrenceRule,
                                                        taskId: item.id,
                                                        taskActualStartDate: moment(kendo.parseDate(item.startDate)).format('L LT'),
                                                        taskActualDueDate: moment(kendo.parseDate(item.dueDate)).format('L LT')
                                                    }
                                                    $scope.taskTodos.push(x);
                                                }
                                            });
                                        }
                                    }
                                }
                                else {
                                    if (item.taskCategoryListItem.name.toLowerCase() == 'service prospecting') {
                                        item.start = moment(kendo.parseDate(item.startDate)).toDate();
                                        item.taskId = item.id;
                                        item.end = moment(kendo.parseDate(item.dueDate)).toDate();
                                        $scope.prospectingTaskTodos.push(item);
                                        var event = new kendo.data.SchedulerEvent({
                                            id: item.id,
                                            title: item.title,
                                            start: kendo.parseDate(item.startDate),
                                            end: kendo.parseDate(item.dueDate),
                                            recurrenceRule: item.recurrenceRule,
                                            taskCategoryListItem: item.taskCategoryListItem,
                                            training: item.training,
                                            trainingId: item.trainingId,
                                            isAllDay: moment(kendo.parseDate(item.startDate)).format("HHmmss") == "000000",
                                            textColor: (item.taskCategoryListItem ? item.taskCategoryListItem.textColor : "#FFFFFF"),
                                            color: (item.taskCategoryListItem ? item.taskCategoryListItem.color : "#000000"),
                                        });

                                        var occurrences = event.expand(kendo.parseDate(item.startDate), kendo.parseDate(item.dueDate));
                                        _.each(occurrences, function (todoItem) {
                                            if (kendo.parseDate(todoItem.start).setHours(0, 0, 0, 0) == today) {
                                                var x = {
                                                    assignedToId: item.assignedToId,
                                                    categoryId: item.categoryId,
                                                    title: item.title,
                                                    description: item.description,
                                                    startDate: moment(todoItem.start).format('L LT'),
                                                    dueDate: moment(todoItem.start).endOf('day').format('L LT'),
                                                    id: item.id,
                                                    isCompleted: false,
                                                    recurrenceRule: item.recurrenceRule,
                                                    taskId: item.id,
                                                    taskActualStartDate: moment(kendo.parseDate(item.startDate)).format('L LT'),
                                                    taskActualDueDate: moment(kendo.parseDate(item.dueDate)).format('L LT')
                                                }
                                                $scope.taskTodos.push(x);
                                            }
                                        });
                                    }
                                }
                            });
                            if ($scope.prospectingTaskTodos.length > 0) {
                                $scope.performanceDashboardTaskChanged($scope.prospectingTaskTodos[$scope.prospectingTaskTodos.length - 1].id);
                            }
                            App.initSlimScroll(".scroller");
                        });
                        serviceProspectingManager.getServiceProspectingCustomerResultsByUserIds(userIds).then(function (data) {
                            $scope.prospectingActivityCustomerResults = data;
                            _.each($scope.prospectingActivityCustomerResults, function (resultItem) {
                                resultItem.createdOn = kendo.parseDate(resultItem.createdOn);
                            });
                            var sortedCustomerResults = _.sortBy($scope.prospectingActivityCustomerResults, function (resultItem) {
                                return resultItem.createdOn;
                            }).reverse();
                            var sortedGoals = [];
                            if (sortedCustomerResults.length > 0) {
                                sortedGoals = _.map(sortedCustomerResults, function (item) {
                                    return item.prospectingCustomer.prospectingGoalId;
                                });
                                sortedGoals = _.uniq(sortedGoals);
                            }
                            progressBar.startProgress();
                            serviceProspectingManager.getProjectServiceProspectingGoalsByUserId(userId, $scope.topBoxFilterOption.projectId).then(function (data) {
                                progressBar.stopProgress();
                                moment.locale(globalVariables.lang.currentUICulture);
                                $scope.prospectingGoalItems = [];
                                _.each(data, function (item) {
                                    var sortedIndexOfGoal = _.findIndex(sortedGoals, function (sortedGoalItem) {
                                        return sortedGoalItem == item.id;
                                    });
                                    if (!(sortedIndexOfGoal > -1)) {
                                        sortedIndexOfGoal = null;
                                    }
                                    $scope.prospectingGoalItems.push({ id: item.id, name: item.name, seq: sortedIndexOfGoal, goalStartDate: moment(kendo.parseDate(item.goalStartDate))._d, goalEndDate: moment(kendo.parseDate(item.goalEndDate))._d });
                                });
                                $scope.prospectingGoalOptions = getProspectingGoalMultiSelectOptions($scope.prospectingGoalItems);
                                $scope.prospectingGoalItems.unshift({ id: 0, name: $translate.instant('COMMON_ALL') });
                                $scope.topBoxFilterOption.prospectingGoalIds = [];
                                var allGoalStartDates = [];
                                var allGoalEndDates = [];
                                _.each(data, function (item) {
                                    if (item.taskId) {

                                        item.goalStartDate = moment(kendo.parseDate(item.goalStartDate))._d;
                                        item.goalEndDate = moment(kendo.parseDate(item.goalEndDate))._d;
                                        allGoalStartDates.push(moment(kendo.parseDate(item.goalStartDate))._d);
                                        allGoalEndDates.push(moment(kendo.parseDate(item.goalEndDate))._d);
                                        serviceProspectingManager.getSkillsByProspectingGoalId(item.id).then(function (data) {
                                            data = _.sortBy(data, 'seqNo');
                                            $scope.profileSkills = data;
                                            _.each(item.prospectingSkillGoals, function (dataItem) {
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
                                            item.calculatedProspectingGoals = [];

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
                                        })
                                    }
                                    App.initSlimScroll(".scroller");
                                });
                                if (allGoalStartDates.length > 0 && allGoalEndDates.length > 0) {
                                    allGoalStartDates = _.sortBy(allGoalStartDates, function (value) {
                                        return value;
                                    });
                                    allGoalEndDates = _.sortBy(allGoalEndDates, function (value) {
                                        return value;
                                    });
                                    moment.locale(globalVariables.lang.currentUICulture);
                                    $scope.totalStartDate = moment(allGoalStartDates[0])._d;
                                    $scope.totalEndDate = moment(allGoalEndDates[allGoalEndDates.length - 1])._d;
                                }
                                serviceProspectingManager.getServiceProspectingCustomersByUserIds(userIds).then(function (data) {
                                    _.each(data, function (item) {
                                        if (kendo.parseDate(item.scheduleDate) >= new Date().setHours(0, 0, 0, 0) && kendo.parseDate(item.scheduleDate) <= new Date().setHours(11, 59, 0, 0)) {
                                            moment.locale(globalVariables.lang.currentUICulture);
                                            item.scheduleDate = moment(kendo.parseDate(item.scheduleDate)).format('L LT');
                                            item.skills = [];
                                            if (item.prospectingGoalId) {
                                                serviceProspectingManager.getSkillsByProspectingGoalId(item.prospectingGoalId).then(function (skillDatas) {
                                                    skillDatas = _.sortBy(skillDatas, 'seqNo');
                                                    _.each(skillDatas, function (skillDataItem) {
                                                        item.skills.push({ skillId: skillDataItem.id, skillName: skillDataItem.name });
                                                    });
                                                    $scope.prospectingCustomers.push(item);
                                                })
                                            }
                                        }
                                    });
                                });
                                serviceProspectingManager.getServiceProspectingGoalActivityInfoesByUserIds(userIds).then(function (data) {
                                    var prospectingGoalIds = [];
                                    _.each(data, function (item, index) {
                                        if (item) {
                                            prospectingGoalIds.push(item.prospectingGoalId);
                                            moment.locale(globalVariables.lang.currentUICulture);
                                            item.activityStartTime = moment(kendo.parseDate(item.activityStartTime)).format("L LT");
                                            item.activityEndTime = moment(kendo.parseDate(item.activityEndTime)).format("L LT");
                                            _.each(item.prospectingActivities, function (activityItem) {
                                                activityItem.activityStart = moment(kendo.parseDate(activityItem.activityStart)).format("L LT");
                                                activityItem.activityEnd = moment(kendo.parseDate(activityItem.activityEnd)).format("L LT");
                                            });
                                            $scope.prospectingGoalActivityInfoes.push(item);
                                        }
                                    });
                                    var prospectingGoalIds = _.uniq(prospectingGoalIds);
                                    _.each(prospectingGoalIds, function (goalId) {
                                        $scope.CalculateGoalByGoalId(goalId);
                                        $scope.CalculateAdjustedGoalByGoalId(goalId);
                                        $scope.CalculateCurrentPerformanceGoalByGoalId(goalId);
                                    });
                                    $scope.calculatingProspectingGoalResultSummaryByUserId = true;
                                    serviceProspectingManager.getProjectServiceProspectingGoalResultSummaryByUserId(userId, $scope.topBoxFilterOption.projectId).then(function (summaryData) {
                                        _.each(summaryData, function (resultItem) {
                                            var prospectingGoal = _.find($scope.prospectingGoals, function (item) {
                                                return item.id == resultItem.prospectingGoalId;
                                            });
                                            if (prospectingGoal) {
                                                if (prospectingGoal.calculatedProspectingGoals) {
                                                    _.each(prospectingGoal.calculatedProspectingGoals, function (goalitem) {
                                                        // weeklyResult
                                                        var weeklyResult = _.find(resultItem.weeklyResult[0].prospectingSkillGoalResults, function (item) {
                                                            return item.skillId == goalitem.skillId;
                                                        });
                                                        if (weeklyResult) {
                                                            goalitem.weeklyResult = weeklyResult.count;
                                                        }
                                                        // monthlyResult
                                                        var monthlyResult = _.find(resultItem.monthlyResult[0].prospectingSkillGoalResults, function (item) {
                                                            return item.skillId == goalitem.skillId;
                                                        });
                                                        if (monthlyResult) {
                                                            goalitem.monthlyResult = monthlyResult.count;
                                                        }
                                                        // todayResult
                                                        var todayResult = _.find(resultItem.todayResult[0].prospectingSkillGoalResults, function (item) {
                                                            return item.skillId == goalitem.skillId;
                                                        });
                                                        if (todayResult) {
                                                            goalitem.dailyResult = todayResult.count;
                                                        }
                                                    })
                                                }

                                                if (prospectingGoal.adjustedGoals) {
                                                    _.each(prospectingGoal.adjustedGoals, function (goalitem) {
                                                        // weeklyResult
                                                        var weeklyResult = _.find(resultItem.weeklyResult[0].prospectingSkillGoalResults, function (item) {
                                                            return item.skillId == goalitem.skillId;
                                                        });
                                                        if (weeklyResult) {
                                                            goalitem.weeklyResult = weeklyResult.count;
                                                        }
                                                        // monthlyResult
                                                        var monthlyResult = _.find(resultItem.monthlyResult[0].prospectingSkillGoalResults, function (item) {
                                                            return item.skillId == goalitem.skillId;
                                                        });
                                                        if (monthlyResult) {
                                                            goalitem.monthlyResult = monthlyResult.count;
                                                        }
                                                        // todayResult
                                                        var todayResult = _.find(resultItem.todayResult[0].prospectingSkillGoalResults, function (item) {
                                                            return item.skillId == goalitem.skillId;
                                                        });
                                                        if (todayResult) {
                                                            goalitem.dailyResult = todayResult.count;
                                                        }
                                                    })
                                                }

                                                if (prospectingGoal.currentPerformanceGoals) {
                                                    _.each(prospectingGoal.currentPerformanceGoals, function (goalitem) {
                                                        // weeklyResult
                                                        var weeklyResult = _.find(resultItem.weeklyResult[0].prospectingSkillGoalResults, function (item) {
                                                            return item.skillId == goalitem.skillId;
                                                        });
                                                        if (weeklyResult) {
                                                            goalitem.weeklyResult = weeklyResult.count;
                                                        }
                                                        // monthlyResult
                                                        var monthlyResult = _.find(resultItem.monthlyResult[0].prospectingSkillGoalResults, function (item) {
                                                            return item.skillId == goalitem.skillId;
                                                        });
                                                        if (monthlyResult) {
                                                            goalitem.monthlyResult = monthlyResult.count;
                                                        }
                                                        // todayResult
                                                        var todayResult = _.find(resultItem.todayResult[0].prospectingSkillGoalResults, function (item) {
                                                            return item.skillId == goalitem.skillId;
                                                        });
                                                        if (todayResult) {
                                                            goalitem.dailyResult = todayResult.count;
                                                        }
                                                    })
                                                }
                                                $scope.caculateTotalResult();

                                            }
                                        });
                                        $scope.calculatingProspectingGoalResultSummaryByUserId = false;
                                    });
                                    $scope.GetProjectProspectingGoalResultSummaryByUserId(userId, $scope.topBoxFilterOption.projectId);
                                });
                            });
                        });

                    }
                    else {
                        if (!($scope.topBoxFilterOption.userId == userId)) {
                            ResetAll();
                            $scope.calculatingGoalResultSummary = true;
                            $scope.topBoxFilterOption.userId = userId;
                            $scope.selectedProjectMembers = [];
                            var user = _.find($scope.projectMembers, function (memberItem) {
                                return memberItem.id == userId;
                            });
                            $scope.topBoxFilterOption.userName = user.firstName + " " + user.lastName;
                            progressBar.startProgress();
                            todoManager.getTodosByUserId(userId).then(function (data) {
                                progressBar.stopProgress();
                                $scope.taskTodos = [];
                                $scope.prospectingTaskTodos = [];
                                var start = moment().startOf('day'); // set to 12:00 am today
                                var end = moment().endOf('day');

                                var today = new Date();
                                today = today.setHours(0, 0, 0, 0);
                                moment.locale(globalVariables.lang.currentUICulture);
                                angular.forEach(data, function (item, index) {
                                    if ($scope.topBoxFilterOption.projectId > 0) {
                                        if (item.projectId == $scope.topBoxFilterOption.projectId) {
                                            if (item.taskCategoryListItem.name.toLowerCase() == 'service prospecting') {
                                                item.start = moment(kendo.parseDate(item.startDate)).toDate();
                                                item.taskId = item.id;
                                                item.end = moment(kendo.parseDate(item.dueDate)).toDate();
                                                $scope.prospectingTaskTodos.push(item);

                                                var event = new kendo.data.SchedulerEvent({
                                                    id: item.id,
                                                    title: item.title,
                                                    start: kendo.parseDate(item.startDate),
                                                    end: kendo.parseDate(item.dueDate),
                                                    recurrenceRule: item.recurrenceRule,
                                                    taskCategoryListItem: item.taskCategoryListItem,
                                                    training: item.training,
                                                    trainingId: item.trainingId,
                                                    isAllDay: moment(kendo.parseDate(item.startDate)).format("HHmmss") == "000000",
                                                    textColor: (item.taskCategoryListItem ? item.taskCategoryListItem.textColor : "#FFFFFF"),
                                                    color: (item.taskCategoryListItem ? item.taskCategoryListItem.color : "#000000"),
                                                });

                                                var occurrences = event.expand(kendo.parseDate(item.startDate), kendo.parseDate(item.dueDate));
                                                _.each(occurrences, function (todoItem) {
                                                    if (kendo.parseDate(todoItem.start).setHours(0, 0, 0, 0) == today) {
                                                        var x = {
                                                            assignedToId: item.assignedToId,
                                                            categoryId: item.categoryId,
                                                            title: item.title,
                                                            description: item.description,
                                                            startDate: moment(todoItem.start).format('L LT'),
                                                            dueDate: moment(todoItem.start).endOf('day').format('L LT'),
                                                            id: item.id,
                                                            isCompleted: false,
                                                            recurrenceRule: item.recurrenceRule,
                                                            taskId: item.id,
                                                            taskActualStartDate: moment(kendo.parseDate(item.startDate)).format('L LT'),
                                                            taskActualDueDate: moment(kendo.parseDate(item.dueDate)).format('L LT')
                                                        }
                                                        $scope.taskTodos.push(x);
                                                    }
                                                });
                                            }
                                        }
                                    }
                                    else {
                                        if (item.taskCategoryListItem.name.toLowerCase() == 'service prospecting') {
                                            item.start = moment(kendo.parseDate(item.startDate)).toDate();
                                            item.taskId = item.id;
                                            item.end = moment(kendo.parseDate(item.dueDate)).toDate();
                                            $scope.prospectingTaskTodos.push(item);

                                            var event = new kendo.data.SchedulerEvent({
                                                id: item.id,
                                                title: item.title,
                                                start: kendo.parseDate(item.startDate),
                                                end: kendo.parseDate(item.dueDate),
                                                recurrenceRule: item.recurrenceRule,
                                                taskCategoryListItem: item.taskCategoryListItem,
                                                training: item.training,
                                                trainingId: item.trainingId,
                                                isAllDay: moment(kendo.parseDate(item.startDate)).format("HHmmss") == "000000",
                                                textColor: (item.taskCategoryListItem ? item.taskCategoryListItem.textColor : "#FFFFFF"),
                                                color: (item.taskCategoryListItem ? item.taskCategoryListItem.color : "#000000"),
                                            });

                                            var occurrences = event.expand(kendo.parseDate(item.startDate), kendo.parseDate(item.dueDate));
                                            _.each(occurrences, function (todoItem) {
                                                if (kendo.parseDate(todoItem.start).setHours(0, 0, 0, 0) == today) {
                                                    var x = {
                                                        assignedToId: item.assignedToId,
                                                        categoryId: item.categoryId,
                                                        title: item.title,
                                                        description: item.description,
                                                        startDate: moment(todoItem.start).format('L LT'),
                                                        dueDate: moment(todoItem.start).endOf('day').format('L LT'),
                                                        id: item.id,
                                                        isCompleted: false,
                                                        recurrenceRule: item.recurrenceRule,
                                                        taskId: item.id,
                                                        taskActualStartDate: moment(kendo.parseDate(item.startDate)).format('L LT'),
                                                        taskActualDueDate: moment(kendo.parseDate(item.dueDate)).format('L LT')
                                                    }
                                                    $scope.taskTodos.push(x);
                                                }
                                            });
                                        }
                                    }
                                });
                                if ($scope.prospectingTaskTodos.length > 0) {
                                    $scope.performanceDashboardTaskChanged($scope.prospectingTaskTodos[$scope.prospectingTaskTodos.length - 1].id);
                                }
                                App.initSlimScroll(".scroller");
                            });
                            serviceProspectingManager.getServiceProspectingCustomerResultsByUserId(userId).then(function (data) {
                                $scope.prospectingActivityCustomerResults = data;

                                _.each($scope.prospectingActivityCustomerResults, function (resultItem) {
                                    resultItem.createdOn = kendo.parseDate(resultItem.createdOn);
                                });
                                var sortedCustomerResults = _.sortBy($scope.prospectingActivityCustomerResults, function (resultItem) {
                                    return resultItem.createdOn;
                                }).reverse();
                                var sortedGoals = [];
                                if (sortedCustomerResults.length > 0) {
                                    sortedGoals = _.map(sortedCustomerResults, function (item) {
                                        return item.prospectingCustomer.prospectingGoalId;
                                    });
                                    sortedGoals = _.uniq(sortedGoals);
                                }

                                progressBar.startProgress();
                                serviceProspectingManager.getProjectServiceProspectingGoalsByUserId(userId, $scope.topBoxFilterOption.projectId).then(function (data) {
                                    progressBar.stopProgress();
                                    moment.locale(globalVariables.lang.currentUICulture);
                                    $scope.prospectingGoalItems = [];
                                    _.each(data, function (item) {
                                        var sortedIndexOfGoal = _.findIndex(sortedGoals, function (sortedGoalItem) {
                                            return sortedGoalItem == item.id;
                                        });
                                        if (!(sortedIndexOfGoal > -1)) {
                                            sortedIndexOfGoal = null;
                                        }
                                        $scope.prospectingGoalItems.push({ id: item.id, name: item.name, seq: sortedIndexOfGoal, goalStartDate: moment(kendo.parseDate(item.goalStartDate))._d, goalEndDate: moment(kendo.parseDate(item.goalEndDate))._d });
                                    });
                                    $scope.prospectingGoalOptions = getProspectingGoalMultiSelectOptions($scope.prospectingGoalItems);
                                    $scope.prospectingGoalItems.unshift({ id: 0, name: $translate.instant('COMMON_ALL') });
                                    if ($scope.prospectingGoalItems.length > 0) {
                                        var hasSeq = _.any($scope.prospectingGoalItems, function (prospectingGoalOptionItem) {
                                            return parseInt(prospectingGoalOptionItem.seq) > -1;
                                        });
                                        if (hasSeq) {
                                            if ($scope.defaultTaskProspecting) {
                                                var defaultProspectingGoalOptions = _.find($scope.prospectingGoalItems, function (prospectingGoalOptionItem) {
                                                    return prospectingGoalOptionItem.taskId == $scope.defaultTaskProspecting.taskId;
                                                });
                                                if (defaultProspectingGoalOptions) {
                                                    $scope.topBoxFilterOption.prospectingGoalIds = [{ id: defaultProspectingGoalOptions.id }];
                                                    $scope.totalStartDate = moment(kendo.parseDate(defaultProspectingGoalOptions.goalStartDate))._d;
                                                    $scope.totalEndDate = moment(kendo.parseDate(defaultProspectingGoalOptions.goalEndDate))._d;
                                                }
                                            }
                                            else {
                                                var sortedProspectingGoalOptions = _.sortBy($scope.prospectingGoalItems, function (prospectingGoalOptionItem) {
                                                    return prospectingGoalOptionItem.seq;
                                                });
                                                $scope.topBoxFilterOption.prospectingGoalIds = [{ id: sortedProspectingGoalOptions[0].id }];
                                                $scope.totalStartDate = moment(kendo.parseDate(sortedProspectingGoalOptions[0].goalStartDate))._d;
                                                $scope.totalEndDate = moment(kendo.parseDate(sortedProspectingGoalOptions[0].goalEndDate))._d;
                                            }
                                        }
                                        else {
                                            if ($scope.defaultTaskProspecting) {
                                                var defaultProspectingGoalOptions = _.find($scope.prospectingGoalItems, function (prospectingGoalOptionItem) {
                                                    return prospectingGoalOptionItem.taskId == $scope.defaultTaskProspecting.taskId;
                                                });
                                                if (defaultProspectingGoalOptions) {
                                                    $scope.topBoxFilterOption.prospectingGoalIds = [{ id: defaultProspectingGoalOptions.id }];
                                                    $scope.totalStartDate = moment(kendo.parseDate(defaultProspectingGoalOptions.goalStartDate))._d;
                                                    $scope.totalEndDate = moment(kendo.parseDate(defaultProspectingGoalOptions.goalEndDate))._d;
                                                }
                                            }
                                            else {
                                                var sortedProspectingGoalOptions = _.sortBy($scope.prospectingGoalItems, function (prospectingGoalOptionItem) {
                                                    return prospectingGoalOptionItem.id;
                                                }).reverse();
                                                $scope.topBoxFilterOption.prospectingGoalIds = [{ id: sortedProspectingGoalOptions[0].id }];
                                                $scope.totalStartDate = moment(kendo.parseDate(sortedProspectingGoalOptions[0].goalStartDate))._d;
                                                $scope.totalEndDate = moment(kendo.parseDate(sortedProspectingGoalOptions[0].goalEndDate))._d;
                                            }
                                        }

                                        ////// set Default TaskId for gauge
                                        var prospectingGoal = _.find(data, function (goalItem) {
                                            var isExist = _.any($scope.topBoxFilterOption.prospectingGoalIds, function (selectedProspectingGoalItem) {
                                                return selectedProspectingGoalItem.id == goalItem.id;
                                            });
                                            return isExist;
                                        });
                                        if (prospectingGoal) {
                                            var filterTodos = _.filter($scope.prospectingTaskTodos, function (item) {
                                                return item.id == prospectingGoal.taskId;
                                            });
                                            if (filterTodos.length > 0) {
                                                $scope.performanceDashboardTaskChanged(filterTodos[0].id);
                                            }
                                        }
                                    }

                                    _.each(data, function (item) {
                                        if (item.taskId) {
                                            item.goalStartDate = moment(kendo.parseDate(item.goalStartDate))._d;
                                            item.goalEndDate = moment(kendo.parseDate(item.goalEndDate))._d;
                                            serviceProspectingManager.getSkillsByProspectingGoalId(item.id).then(function (data) {
                                                data = _.sortBy(data, 'seqNo');
                                                $scope.profileSkills = data;
                                                _.each(item.prospectingSkillGoals, function (dataItem) {
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
                                                item.calculatedProspectingGoals = [];
                                                item.adjustedGoals = [];
                                                item.currentPerformanceGoals = [];
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
                                            })
                                        }
                                        App.initSlimScroll(".scroller");
                                    });

                                    serviceProspectingManager.getServiceProspectingCustomersByUserId(userId).then(function (data) {
                                        _.each(data, function (item) {
                                            if (kendo.parseDate(item.scheduleDate) >= new Date().setHours(0, 0, 0, 0) && kendo.parseDate(item.scheduleDate) <= new Date().setHours(11, 59, 0, 0)) {
                                                moment.locale(globalVariables.lang.currentUICulture);
                                                item.scheduleDate = moment(kendo.parseDate(item.scheduleDate)).format('L LT');
                                                item.skills = [];
                                                if (item.prospectingGoalId) {
                                                    serviceProspectingManager.getSkillsByProspectingGoalId(item.prospectingGoalId).then(function (skillDatas) {
                                                        skillDatas = _.sortBy(skillDatas, 'seqNo');
                                                        _.each(skillDatas, function (skillDataItem) {
                                                            item.skills.push({ skillId: skillDataItem.id, skillName: skillDataItem.name });
                                                        });
                                                        $scope.prospectingCustomers.push(item);
                                                    })
                                                }
                                                //item.profileName = item.profile ? item.profile.name : "",
                                            }
                                        });
                                    });
                                    serviceProspectingManager.getServiceProspectingGoalActivityInfoesByUserId(userId).then(function (data) {
                                        var prospectingGoalIds = [];
                                        _.each(data, function (item, index) {
                                            if (item) {
                                                prospectingGoalIds.push(item.prospectingGoalId);
                                                item.activityStartTime = moment(kendo.parseDate(item.activityStartTime)).format("L LT");
                                                item.activityEndTime = moment(kendo.parseDate(item.activityEndTime)).format("L LT");
                                                _.each(item.prospectingActivities, function (activityItem) {
                                                    activityItem.activityStart = moment(kendo.parseDate(activityItem.activityStart)).format("L LT");
                                                    activityItem.activityEnd = moment(kendo.parseDate(activityItem.activityEnd)).format("L LT");
                                                });
                                                $scope.prospectingGoalActivityInfoes.push(item);
                                                //if (kendo.parseDate(item.activityStartTime) >= $scope.today && kendo.parseDate(item.activityEndTime) <= $scope.endOfDay) {
                                                //    $scope.prospectingGoalActivityInfoes.push(item);
                                                //}
                                                //else if (kendo.parseDate(item.activityStartTime) <= $scope.today && kendo.parseDate(item.activityEndTime) >= $scope.endOfDay) {
                                                //    $scope.prospectingGoalActivityInfoes.push(item);
                                                //}
                                                //else if (kendo.parseDate(item.activityStartTime) >= $scope.today && kendo.parseDate(item.activityStartTime) <= $scope.endOfDay) {
                                                //    $scope.prospectingGoalActivityInfoes.push(item);
                                                //}

                                            }
                                        });
                                        var prospectingGoalIds = _.uniq(prospectingGoalIds);
                                        _.each(prospectingGoalIds, function (goalId) {
                                            $scope.CalculateGoalByGoalId(goalId);
                                            $scope.CalculateAdjustedGoalByGoalId(goalId);
                                            $scope.CalculateCurrentPerformanceGoalByGoalId(goalId);
                                        });
                                        $scope.calculatingProspectingGoalResultSummaryByUserId = true;
                                        serviceProspectingManager.getServiceProspectingGoalResultSummaryByUserId(userId).then(function (summaryData) {
                                            _.each(summaryData, function (resultItem) {
                                                var prospectingGoal = _.find($scope.prospectingGoals, function (item) {
                                                    return item.id == resultItem.prospectingGoalId;
                                                });
                                                if (prospectingGoal) {
                                                    if (prospectingGoal.calculatedProspectingGoals) {
                                                        _.each(prospectingGoal.calculatedProspectingGoals, function (goalitem) {
                                                            // weeklyResult
                                                            var weeklyResult = _.find(resultItem.weeklyResult[0].prospectingSkillGoalResults, function (item) {
                                                                return item.skillId == goalitem.skillId;
                                                            });
                                                            if (weeklyResult) {
                                                                goalitem.weeklyResult = weeklyResult.count;
                                                            }
                                                            // monthlyResult
                                                            var monthlyResult = _.find(resultItem.monthlyResult[0].prospectingSkillGoalResults, function (item) {
                                                                return item.skillId == goalitem.skillId;
                                                            });
                                                            if (monthlyResult) {
                                                                goalitem.monthlyResult = monthlyResult.count;
                                                            }
                                                            // todayResult
                                                            var todayResult = _.find(resultItem.todayResult[0].prospectingSkillGoalResults, function (item) {
                                                                return item.skillId == goalitem.skillId;
                                                            });
                                                            if (todayResult) {
                                                                goalitem.dailyResult = todayResult.count;
                                                            }
                                                        })
                                                        //var CalculatedProspectingGoal = _.find(prospectingGoal.calculatedProspectingGoals)
                                                    }
                                                    if (prospectingGoal.adjustedGoals) {
                                                        _.each(prospectingGoal.adjustedGoals, function (goalitem) {
                                                            // weeklyResult
                                                            var weeklyResult = _.find(resultItem.weeklyResult[0].prospectingSkillGoalResults, function (item) {
                                                                return item.skillId == goalitem.skillId;
                                                            });
                                                            if (weeklyResult) {
                                                                goalitem.weeklyResult = weeklyResult.count;
                                                            }
                                                            // monthlyResult
                                                            var monthlyResult = _.find(resultItem.monthlyResult[0].prospectingSkillGoalResults, function (item) {
                                                                return item.skillId == goalitem.skillId;
                                                            });
                                                            if (monthlyResult) {
                                                                goalitem.monthlyResult = monthlyResult.count;
                                                            }
                                                            // todayResult
                                                            var todayResult = _.find(resultItem.todayResult[0].prospectingSkillGoalResults, function (item) {
                                                                return item.skillId == goalitem.skillId;
                                                            });
                                                            if (todayResult) {
                                                                goalitem.dailyResult = todayResult.count;
                                                            }
                                                        })
                                                        //var CalculatedProspectingGoal = _.find(prospectingGoal.calculatedProspectingGoals)

                                                    }

                                                    if (prospectingGoal.currentPerformanceGoals) {
                                                        _.each(prospectingGoal.currentPerformanceGoals, function (goalitem) {
                                                            // weeklyResult
                                                            var weeklyResult = _.find(resultItem.weeklyResult[0].prospectingSkillGoalResults, function (item) {
                                                                return item.skillId == goalitem.skillId;
                                                            });
                                                            if (weeklyResult) {
                                                                goalitem.weeklyResult = weeklyResult.count;
                                                            }
                                                            // monthlyResult
                                                            var monthlyResult = _.find(resultItem.monthlyResult[0].prospectingSkillGoalResults, function (item) {
                                                                return item.skillId == goalitem.skillId;
                                                            });
                                                            if (monthlyResult) {
                                                                goalitem.monthlyResult = monthlyResult.count;
                                                            }
                                                            // todayResult
                                                            var todayResult = _.find(resultItem.todayResult[0].prospectingSkillGoalResults, function (item) {
                                                                return item.skillId == goalitem.skillId;
                                                            });
                                                            if (todayResult) {
                                                                goalitem.dailyResult = todayResult.count;
                                                            }
                                                        })
                                                        //var CalculatedProspectingGoal = _.find(prospectingGoal.calculatedProspectingGoals)

                                                    }
                                                    $scope.caculateTotalResult();
                                                }
                                            });
                                            $scope.calculatingProspectingGoalResultSummaryByUserId = false;
                                        });
                                        $scope.GetProjectProspectingGoalResultSummaryByUserId(userId, $scope.topBoxFilterOption.projectId);
                                    });
                                });
                            });
                        }
                    }
                }
                $scope.resultFilterOptionChanged = function () {
                    if ($scope.topBoxFilterOption.topboxResultOptionId == $scope.resultFilterOptionEnums.Today && ($scope.topBoxFilterOption.topboxResultTypeId == $scope.topboxResultTypeEnum.CurrentPerformanceResult || $scope.topBoxFilterOption.topboxResultTypeId == $scope.topboxResultTypeEnum.CurrentPerformancePercentage)) {
                        $scope.topBoxFilterOption.topboxResultTypeId = $scope.topboxResultTypeEnum.Percentage;
                    }
                    $scope.caculateTotalResult();
                    $scope.filterUserResult($scope.topBoxFilterOption.topboxResultOptionId)
                }
                $scope.userSummaryResultData = null;
                // Task Performance Dashboard
                $scope.performanceDashboardTaskChanged = function (taskId) {
                    $scope.taskProspectingGoals = [];
                    $scope.selectProspectingGoal(null);
                    $scope.selectProspectingActivity(null);
                    $scope.selectedperformanceDashboardTask = _.find($scope.prospectingTaskTodos, function (item) {
                        return item.id == taskId;

                    });
                    if ($scope.selectedperformanceDashboardTask) {
                        serviceProspectingManager.getTaskProspectingGoals(taskId).then(function (data) {
                            $scope.taskProspectingGoals = _.clone(data);
                            $scope.taskProspectingGoals.unshift({
                                id: null, name: $translate.instant('TASKPROSPECTING_SELECT')
                            });
                            if (data.length > 0) {
                                $scope.selectProspectingGoal(data[0].id)
                            }
                        });
                    }
                }
                $scope.selectProspectingGoal = function (goalId) {
                    // Get Prospecting Activities of Prospecting Goal
                    if ($scope.selectedProspectingGoal) {
                        if ($scope.selectedProspectingGoal.id != goalId) {
                            $scope.taskActivityData = null;
                            $scope.taskCompareActivityData = null;
                            $scope.selectedprospectingActivity = null;

                            $scope.selectedCompareProspectingGoal = null;
                            $scope.selectedCompareProspectingActivity = null;
                            $scope.taskCompareProspectingActivities = [];
                        }
                    }
                    $scope.selectedProspectingGoal = null;
                    $scope.taskProspectingActivities = [];
                    if (goalId != null) {
                        $scope.selectedProspectingGoal = _.find($scope.taskProspectingGoals, function (item) {
                            return item.id == goalId;
                        });
                        if ($scope.selectedProspectingGoal) {
                            serviceProspectingManager.getTaskProspectingActivities($scope.selectedProspectingGoal.id).then(function (data) {
                                $scope.taskProspectingActivities = _.clone(data);
                                var previousActivities = _.filter(data, function (item) {
                                    return item.activityEnd < $scope.today;
                                })
                                $scope.taskProspectingActivities.unshift({ id: 0, name: $translate.instant('COMMON_ALL') });
                                $scope.taskProspectingActivities.unshift({
                                    id: null, name: "--" + $translate.instant('COMMON_SELECT') + "--"
                                });
                                if (data.length > 0) {
                                    $scope.selectProspectingActivity(0);
                                }
                            });
                            serviceProspectingManager.getProspectingScaleRangesByGoalId($scope.selectedProspectingGoal.id).then(function (data) {
                                $scope.taskProspectingScaleRanges = [];
                                console.log("selectProspectingGoal");
                                _.each(data, function (dataItem) {
                                    $scope.taskProspectingScaleRanges.push({
                                        min: dataItem.min,
                                        max: dataItem.max,
                                        from: dataItem.min,
                                        to: dataItem.max,
                                        color: dataItem.color,
                                        minPercentage: dataItem.min,
                                        maxPercentage: dataItem.max,
                                        prospectingGoalId: $scope.selectedProspectingGoal.id,
                                    });
                                })
                            });
                        }
                    }
                    else {

                        $scope.taskActivityData = null;
                        $scope.taskCompareActivityData = null;
                        $scope.selectedprospectingActivity = null;

                        $scope.selectedCompareProspectingGoal = null;
                        $scope.selectedCompareProspectingActivity = null;
                        $scope.taskCompareProspectingActivities = [];
                    }
                }
                $scope.selectProspectingActivity = function (activityId) {
                    $scope.selectedprospectingActivity = null;
                    if (activityId != null) {
                        $scope.selectedprospectingActivity = _.find($scope.taskProspectingActivities, function (item) {
                            return item.id == activityId;
                        });
                        if ($scope.selectedprospectingActivity) {
                            getTaskProsepectingActvitiyPerformnaceData($scope.selectedProspectingGoal.id, $scope.selectedprospectingActivity.id, $scope.selectedProspectingGoal.userId);
                        }
                    }
                    else {
                        $scope.taskActivityData = null;
                        $scope.taskCompareActivityData = null;
                        $scope.selectedCompareProspectingGoal = null;
                        $scope.selectedCompareProspectingActivity = null;
                        $scope.taskCompareProspectingActivities = [];
                    }
                }
                $scope.selectCompareProspectingGoal = function (goalId) {
                    if ($scope.selectedCompareProspectingGoal) {
                        if ($scope.selectedCompareProspectingGoal.id != goalId) {
                            $scope.selectedCompareProspectingActivity = null;
                            $scope.taskCompareProspectingActivities = [];
                            $scope.taskCompareActivityData = null;
                            drawGauge();
                        }
                    }
                    $scope.selectedCompareProspectingGoal = null;
                    if (goalId != null) {
                        // Get Prospecting Activities of Prospecting Goal
                        $scope.taskCompareProspectingActivities = [];
                        $scope.selectedCompareProspectingGoal = _.find($scope.taskProspectingGoals, function (item) {
                            return item.id == goalId;
                        });
                        if ($scope.selectedCompareProspectingGoal) {
                            serviceProspectingManager.getTaskProspectingActivities($scope.selectedCompareProspectingGoal.id).then(function (data) {
                                $scope.taskCompareProspectingActivities = data;
                                $scope.taskCompareProspectingActivities.unshift({ id: 0, name: $translate.instant('COMMON_ALL') });
                                $scope.taskCompareProspectingActivities.unshift({ id: null, name: "--" + $translate.instant('COMMON_SELECT') + "--" });

                            });
                            serviceProspectingManager.getProspectingScaleRangesByGoalId($scope.selectedCompareProspectingGoal.id).then(function (data) {
                                $scope.taskCompareProspectingScaleRanges = [];
                                _.each(data, function (dataItem) {
                                    $scope.taskCompareProspectingScaleRanges.push({
                                        min: dataItem.min,
                                        max: dataItem.max,
                                        from: dataItem.min,
                                        to: dataItem.max,
                                        color: dataItem.color,
                                        minPercentage: dataItem.min,
                                        maxPercentage: dataItem.max,
                                    });
                                })

                            });
                        }
                    }
                    else {
                        $scope.selectedCompareProspectingActivity = null;
                        $scope.taskCompareProspectingActivities = [];
                        $scope.taskCompareActivityData = null;
                        drawGauge();
                    }
                }
                $scope.selectCompareProspectingActivity = function (activityId) {
                    $scope.selectedCompareProspectingActivity = null;
                    if (activityId != null) {
                        $scope.selectedCompareProspectingActivity = _.find($scope.taskCompareProspectingActivities, function (item) {
                            return item.id == activityId;
                        });
                        if ($scope.selectedCompareProspectingActivity) {
                            getCompareTaskProsepectingActvitiyPerformnaceData($scope.selectedCompareProspectingGoal.id, $scope.selectedCompareProspectingActivity.id, $scope.selectedCompareProspectingGoal.userId);
                        }
                    }
                    else {

                        $scope.taskCompareActivityData = null;
                        drawGauge();
                    }
                }


                function getCompareTaskProsepectingActvitiyPerformnaceData(goalId, activityId, userid) {
                    serviceProspectingManager.getTaskProsepectingActvitiyPerformnaceData(goalId, activityId, userid).then(function (data) {
                        if (data) {
                            $scope.taskCompareActivityData = data;
                            setTimeout(function () {
                                drawGauge();
                            }, 100)
                            //$scope.CallsvsTalksGauge();
                        }
                    });
                }
                function drawGauge() {
                    $scope.compareData = [];
                    $scope.taskScaleRanges = [{
                        color: "#f00",
                        from: 0,
                        max: 5,
                        maxPercentage: 50,
                        min: 0,
                        minPercentage: 0,
                        to: 50
                    },
                    {
                        color: "#ff0   ",
                        from: 50,
                        max: 7,
                        maxPercentage: 70,
                        min: 5,
                        minPercentage: 50,
                        to: 70,
                    },
                    {
                        color: "#0f0   ",
                        from: 70,
                        max: 10,
                        maxPercentage: 100,
                        min: 7,
                        minPercentage: 70,
                        to: 100,
                    }];

                    if ($scope.taskActivityData && (!$scope.taskCompareActivityData)) {
                        if ($scope.taskProspectingScaleRanges.length > 0) {
                            $scope.taskScaleRanges = _.clone($scope.taskProspectingScaleRanges);
                        }
                        _.each($scope.taskActivityData.prospectingSkillGoalResults, function (dataItem) {
                            var calculateResult = 0;
                            if (dataItem.count > 0) {
                                calculateResult = parseInt((dataItem.count / dataItem.goal) * 100);
                            }
                            if (calculateResult > 100) {
                                $scope.scaleRanges = _.clone($scope.taskScaleRanges);
                                $scope.scaleRanges.push({
                                    min: $scope.taskScaleRanges[0].min,
                                    max: $scope.taskScaleRanges[$scope.taskScaleRanges.length - 1].max,
                                    from: 100,
                                    to: calculateResult,
                                    color: $scope.taskScaleRanges[$scope.taskScaleRanges.length - 1].color, //"#ff6e19",
                                    minPercentage: 0,
                                    maxPercentage: calculateResult,
                                });
                                $("#home_serviceprospectingactivity_" + dataItem.skillName + "_gauge").kendoRadialGauge({
                                    pointer: [{
                                        value: calculateResult,
                                        color: "#3598dc",
                                    }],
                                    scale: {
                                        min: 0,
                                        minorUnit: 5,
                                        startAngle: -30,
                                        endAngle: 210,
                                        max: calculateResult > 100 ? calculateResult : 100,
                                        ranges: $scope.scaleRanges,
                                    }
                                });

                            }
                            else {
                                $("#home_serviceprospectingactivity_" + dataItem.skillName + "_gauge").kendoRadialGauge({
                                    pointer: [{
                                        value: calculateResult,
                                        color: "#3598dc",
                                    }],
                                    scale: {
                                        min: $scope.taskScaleRanges[0].minPercentage,
                                        minorUnit: 5,
                                        startAngle: -30,
                                        endAngle: 210,
                                        max: calculateResult > 100 ? calculateResult : 100,
                                        ranges: $scope.taskScaleRanges,
                                    }
                                });
                            }
                        })

                        //default selection
                        var lastSkill = _.last($scope.taskActivityData.prospectingSkillGoalResults);
                        if (lastSkill) {
                            $scope.selectTaskMainFilterGauge(lastSkill.skillId);

                            var secondLastSKill = null;
                            var filteredSkills = _.filter($scope.taskActivityData.prospectingSkillGoalResults, function (dataItem) {
                                return dataItem.skillId != lastSkill.skillId;
                            });
                            secondLastSKill = _.last(filteredSkills);
                            if (secondLastSKill) {
                                $scope.selectTaskCompareFilterGauge(secondLastSKill.skillId);
                            }
                        }
                    }
                    else if ($scope.taskActivityData && $scope.taskCompareActivityData) {
                        if ($scope.taskCompareProspectingScaleRanges.length > 0) {
                            $scope.taskScaleRanges = _.clone($scope.taskCompareProspectingScaleRanges);
                        }
                        else if ($scope.taskProspectingScaleRanges.length > 0) {
                            $scope.taskScaleRanges = _.clone($scope.taskProspectingScaleRanges);
                        }
                        _.each($scope.taskActivityData.prospectingSkillGoalResults, function (dataItem) {
                            var calculateResult = 0;
                            if (dataItem.count > 0) {
                                calculateResult = parseInt((dataItem.count / dataItem.goal) * 100);
                            }
                            $scope.compareData.push({
                                skillId: dataItem.skillId, skillName: dataItem.skillName, value1: calculateResult, value2: 0
                            })
                            if (calculateResult > 100) {
                                $scope.scaleRanges = _.clone($scope.taskScaleRanges);
                                $scope.scaleRanges.push({
                                    min: $scope.taskScaleRanges[0].min,
                                    max: $scope.taskScaleRanges[$scope.taskScaleRanges.length - 1].max,
                                    from: 100,
                                    to: calculateResult,
                                    color: $scope.taskScaleRanges[$scope.taskScaleRanges.length - 1].color,// "#ff6e19",
                                    minPercentage: 0,
                                    maxPercentage: calculateResult,
                                });

                            }
                            else {

                            }
                        })
                        _.each($scope.taskCompareActivityData.prospectingSkillGoalResults, function (dataItem) {
                            var calculateResult = 0;
                            if (dataItem.count > 0) {
                                calculateResult = parseInt((dataItem.count / dataItem.goal) * 100);
                            }
                            _.each($scope.compareData, function (compareDataItem) {
                                if (compareDataItem.skillId == dataItem.skillId && compareDataItem.skillName == dataItem.skillName) {
                                    compareDataItem.value2 = calculateResult;
                                }
                            })
                            if (calculateResult > 100) {
                                $scope.scaleRanges = _.clone($scope.taskScaleRanges);
                                $scope.scaleRanges.push({
                                    min: $scope.taskScaleRanges[0].min,
                                    max: $scope.taskScaleRanges[$scope.taskScaleRanges.length - 1].max,
                                    from: 100,
                                    to: calculateResult,
                                    color: $scope.taskScaleRanges[$scope.taskScaleRanges.length - 1].color,// "#ff6e19",
                                    minPercentage: 0,
                                    maxPercentage: calculateResult,
                                });

                            }
                            else {

                            }
                        })
                        _.each($scope.compareData, function (compareItem) {
                            if (compareItem.value1 > 100 || compareItem.value2 > 100) {
                                var maxResult = _.max([compareItem.value1, compareItem.value2]);
                                $scope.scaleRanges = _.clone($scope.taskScaleRanges);
                                $scope.scaleRanges.push({
                                    min: $scope.taskScaleRanges[0].min,
                                    max: $scope.taskScaleRanges[$scope.taskScaleRanges.length - 1].max,
                                    from: 100,
                                    to: maxResult,
                                    color: $scope.taskScaleRanges[$scope.taskScaleRanges.length - 1].color, // "#ff6e19",
                                    minPercentage: 0,
                                    maxPercentage: maxResult,
                                });

                                $("#home_serviceprospectingactivity_" + compareItem.skillName + "_gauge").kendoRadialGauge({
                                    pointer: [{
                                        value: compareItem.value1,
                                        color: "#3598dc",
                                    },
                                    {
                                        value: compareItem.value2,
                                        color: "#8E44AD",
                                    }],
                                    scale: {
                                        min: 0,
                                        minorUnit: 5,
                                        startAngle: -30,
                                        endAngle: 210,
                                        max: maxResult > 100 ? maxResult : 100,
                                        ranges: $scope.scaleRanges,
                                    }
                                });

                            }
                            else {
                                var maxResult = _.max([compareItem.value1, compareItem.value2]);
                                $("#home_serviceprospectingactivity_" + compareItem.skillName + "_gauge").kendoRadialGauge({
                                    pointer: [{
                                        value: compareItem.value1,
                                        color: "#3598dc",
                                    },
                                    {
                                        value: compareItem.value2,
                                        color: "#8E44AD",
                                    }],
                                    scale: {
                                        min: $scope.taskScaleRanges[0].minPercentage,
                                        minorUnit: 5,
                                        startAngle: -30,
                                        endAngle: 210,
                                        max: maxResult > 100 ? maxResult : 100,
                                        ranges: $scope.taskScaleRanges,
                                    }
                                });
                            }

                        });

                    }
                }
                function drawPerformanceGauge() {
                    $scope.taskScaleRanges = [{
                        color: "#f00",
                        from: 0,
                        max: 5,
                        maxPercentage: 50,
                        min: 0,
                        minPercentage: 0,
                        to: 50
                    },
                    {
                        color: "#ff0   ",
                        from: 50,
                        max: 7,
                        maxPercentage: 70,
                        min: 5,
                        minPercentage: 50,
                        to: 70,
                    },
                    {
                        color: "#0f0   ",
                        from: 70,
                        max: 10,
                        maxPercentage: 100,
                        min: 7,
                        minPercentage: 70,
                        to: 100,
                    }];

                    if ($scope.taskProspectingScaleRanges.length > 0) {
                        $scope.taskScaleRanges = _.clone($scope.taskProspectingScaleRanges);
                    }
                    $scope.taskPerformanceGagueInfo = null;
                    $scope.taskPerformanceGagueInfo = {
                        lable1: $scope.mainTaskFilterGaugeText,
                        lable2: $scope.compareTaskFilterGaugeText,
                        value1: $scope.mainTaskFilterGaugeData.count,
                        value2: $scope.compareTaskFilterGaugeData.count,
                        avg: parseInt($scope.mainTaskFilterGaugeData.count / $scope.compareTaskFilterGaugeData.count * 100),
                    };
                    var maxRange = 100;
                    var avg = parseInt($scope.mainTaskFilterGaugeData.count / $scope.compareTaskFilterGaugeData.count * 100);
                    if (isNaN(avg)) {
                        avg = 0;
                        $scope.taskPerformanceGagueInfo.avg = 0;
                    }
                    if (avg > 100) {
                        maxRange = avg;
                        $scope.taskScaleRanges = _.clone($scope.taskScaleRanges);
                        $scope.taskScaleRanges.push({
                            min: $scope.taskScaleRanges[0].min,
                            max: maxRange,
                            from: 100,
                            to: maxRange,
                            color: "#ff6e19",
                            minPercentage: 0,
                            maxPercentage: maxRange,
                        });

                        $("#home_serviceprospectingactivity_performance_gauge").kendoRadialGauge({
                            pointer: [{
                                value: avg,
                                color: "#ff6e19",
                            }],
                            scale: {
                                min: $scope.taskScaleRanges[0].minPercentage,
                                minorUnit: 5,
                                startAngle: -30,
                                endAngle: 210,
                                max: maxRange,
                                ranges: $scope.taskScaleRanges,
                            }
                        });
                    }
                    else {
                        $("#home_serviceprospectingactivity_performance_gauge").kendoRadialGauge({
                            pointer: [{
                                value: avg,
                                color: "#3598dc",
                            },
                            ],
                            scale: {
                                min: $scope.taskScaleRanges[0].minPercentage,
                                minorUnit: 5,
                                startAngle: -30,
                                endAngle: 210,
                                max: maxRange,
                                ranges: $scope.taskScaleRanges,
                            }
                        });
                    }
                }

                $scope.CalculateGoalByGoalId = function (prospectingGoalId) {
                    var prospectingGoal = _.find($scope.prospectingGoals, function (item) {
                        return item.id == prospectingGoalId;
                    });
                    var prospectingGoalActivityInfoes = _.filter($scope.prospectingGoalActivityInfoes, function (item) {
                        return item.prospectingGoalId == prospectingGoalId;
                    });
                    var activities = [];
                    _.each(prospectingGoalActivityInfoes, function (item) {
                        _.each(item.prospectingActivities, function (prospectingActivity) {
                            activities.push(prospectingActivity);
                        })
                    });
                    var allStartDates = [];
                    var allEndDates = [];
                    _.each(activities, function (item) {
                        allStartDates.push(moment(kendo.parseDate(item.activityStart)).format("L"))
                        allEndDates.push(moment(kendo.parseDate(item.activityEnd)).format("L LT"))
                    });
                    var todayActivities = _.filter(activities, function (activityItem) {
                        return kendo.parseDate(activityItem.activityStart) >= $scope.today && kendo.parseDate(activityItem.activityEnd) <= $scope.endOfDay
                    });
                    var weeklyActivities = _.filter(activities, function (activityItem) {
                        return kendo.parseDate(activityItem.activityStart) >= $scope.weekStartDate && kendo.parseDate(activityItem.activityEnd) <= $scope.weekEndDate
                    });
                    var monthlyActivities = _.filter(activities, function (activityItem) {
                        return kendo.parseDate(activityItem.activityStart) >= $scope.monthStartDate && kendo.parseDate(activityItem.activityEnd) <= $scope.monthEndDate
                    });
                    var uniqueDates = _.uniq(allStartDates);
                    var CalculatedProspectingGoals = [];
                    if (prospectingGoal) {
                        _.each(prospectingGoal.prospectingSkillGoals, function (item, index) {
                            var perActivity = Math.round(parseFloat(item.goal / activities.length).toFixed(2) * 100) / 100;
                            var dailyGoal = Math.round(parseFloat(perActivity * todayActivities.length).toFixed(2) * 100) / 100;  //Math.round(parseFloat(item.goal / uniqueDates.length).toFixed(2) * 100) / 100;
                            var weekGoal = Math.round(parseFloat(perActivity * weeklyActivities.length).toFixed(2) * 100) / 100; //moment(prospectingGoalActivityInfo.activityEndTime).diff(moment(prospectingGoalActivityInfo.activityStartTime), 'week')
                            var monthGoal = Math.round(parseFloat(perActivity * monthlyActivities.length).toFixed(2) * 100) / 100; //moment(prospectingGoalActivityInfo.activityEndTime).diff(moment(prospectingGoalActivityInfo.activityStartTime), 'month')
                            if (dailyGoal > (item.goal)) {
                                dailyGoal = (item.goal);
                            }
                            if (weekGoal > (item.goal)) {
                                weekGoal = (item.goal);
                            }
                            if (monthGoal > (item.goal)) {
                                monthGoal = (item.goal);
                            }
                            var SplitSkillGoal = {
                                skillId: item.skillId,
                                skillName: item.skillName,
                                perActvity: perActivity,
                                daily: dailyGoal,
                                weekly: weekGoal,
                                monthly: monthGoal,
                                total: item.goal,
                                dailyResult: 0,
                                weeklyResult: 0,
                                monthlyResult: 0,
                                totalResult: item.result,
                            };
                            CalculatedProspectingGoals.push(SplitSkillGoal)
                        })
                        prospectingGoal["calculatedProspectingGoals"] = CalculatedProspectingGoals;
                    }
                    return CalculatedProspectingGoals;
                }
                $scope.CalculateAdjustedGoalByGoalId = function (prospectingGoalId) {
                    var prospectingGoal = _.find($scope.prospectingGoals, function (item) {
                        return item.id == prospectingGoalId;
                    });
                    var prospectingGoalActivityInfoes = _.filter($scope.prospectingGoalActivityInfoes, function (item) {
                        return item.prospectingGoalId == prospectingGoalId;
                    });
                    var activities = [];
                    _.each(prospectingGoalActivityInfoes, function (item) {
                        _.each(item.prospectingActivities, function (prospectingActivity) {
                            activities.push(prospectingActivity);
                        })
                    });
                    var allStartDates = [];
                    var allEndDates = [];
                    _.each(activities, function (item) {
                        allStartDates.push(moment(kendo.parseDate(item.activityStart)).format("L"))
                        allEndDates.push(moment(kendo.parseDate(item.activityEnd)).format("L LT"))
                    });
                    var remainingActivities = _.filter(activities, function (activityItem) {
                        return kendo.parseDate(activityItem.activityStart) >= $scope.today;
                    });
                    var todayActivities = _.filter(activities, function (activityItem) {
                        return kendo.parseDate(activityItem.activityStart) >= $scope.today && kendo.parseDate(activityItem.activityEnd) <= $scope.endOfDay
                    });
                    var weeklyActivities = _.filter(activities, function (activityItem) {
                        return kendo.parseDate(activityItem.activityStart) >= $scope.weekStartDate && kendo.parseDate(activityItem.activityEnd) <= $scope.weekEndDate
                    });
                    var monthlyActivities = _.filter(activities, function (activityItem) {
                        return kendo.parseDate(activityItem.activityStart) >= $scope.monthStartDate && kendo.parseDate(activityItem.activityEnd) <= $scope.monthEndDate
                    });
                    var uniqueDates = _.uniq(allStartDates);
                    var AdjustedGoals = [];
                    if (prospectingGoal) {
                        _.each(prospectingGoal.prospectingSkillGoals, function (item, index) {
                            var perActivity = 0;
                            if (remainingActivities.length > 0) {
                                if ((item.goal - item.result) > 0) {
                                    perActivity = Math.round(parseFloat((item.goal - item.result) / remainingActivities.length).toFixed(2) * 100) / 100;
                                }
                            }
                            var dailyGoal = Math.round(parseFloat(perActivity * todayActivities.length).toFixed(2) * 100) / 100;  //Math.round(parseFloat(item.goal / uniqueDates.length).toFixed(2) * 100) / 100;
                            var weekGoal = Math.round(parseFloat(perActivity * weeklyActivities.length).toFixed(2) * 100) / 100; //moment(prospectingGoalActivityInfo.activityEndTime).diff(moment(prospectingGoalActivityInfo.activityStartTime), 'week')
                            var monthGoal = Math.round(parseFloat(perActivity * monthlyActivities.length).toFixed(2) * 100) / 100; //moment(prospectingGoalActivityInfo.activityEndTime).diff(moment(prospectingGoalActivityInfo.activityStartTime), 'month')
                            if (dailyGoal > (item.goal - item.result)) {
                                if ((item.goal - item.result) > 0) {
                                    dailyGoal = (item.goal - item.result);
                                }
                            }
                            if (weekGoal > (item.goal - item.result)) {
                                if ((item.goal - item.result) > 0) {
                                    weekGoal = (item.goal - item.result);
                                }
                            }
                            if (monthGoal > (item.goal - item.result)) {
                                if ((item.goal - item.result) > 0) {
                                    monthGoal = (item.goal - item.result);
                                }
                            }
                            var SplitSkillGoal = {
                                skillId: item.skillId,
                                skillName: item.skillName,
                                perActvity: perActivity,
                                daily: dailyGoal,
                                weekly: weekGoal,
                                monthly: monthGoal,
                                total: (item.goal - item.result) > 0 ? (item.goal - item.result) : 0,
                                dailyResult: 0,
                                weeklyResult: 0,
                                monthlyResult: 0,
                                totalResult: item.result,
                            };
                            AdjustedGoals.push(SplitSkillGoal)
                        })
                        prospectingGoal["adjustedGoals"] = AdjustedGoals;
                    }
                    return AdjustedGoals;
                }
                $scope.CalculateCurrentPerformanceGoalByGoalId = function (prospectingGoalId) {
                    var prospectingGoal = _.find($scope.prospectingGoals, function (item) {
                        return item.id == prospectingGoalId;
                    });
                    var prospectingGoalActivityInfoes = _.filter($scope.prospectingGoalActivityInfoes, function (item) {
                        return item.prospectingGoalId == prospectingGoalId;
                    });
                    var activities = [];
                    _.each(prospectingGoalActivityInfoes, function (item) {
                        _.each(item.prospectingActivities, function (prospectingActivity) {
                            activities.push(prospectingActivity);
                        })
                    });
                    var allStartDates = [];
                    var allEndDates = [];
                    _.each(activities, function (item) {
                        allStartDates.push(moment(kendo.parseDate(item.activityStart)).format("L"))
                        allEndDates.push(moment(kendo.parseDate(item.activityEnd)).format("L LT"))
                    });
                    var allActivities = activities;
                    activities = _.filter(activities, function (item) {
                        return ((kendo.parseDate(item.activityStart) < $scope.today) || (kendo.parseDate(item.activityStart) >= $scope.today && kendo.parseDate(item.activityEnd) <= $scope.endOfDay));
                    });
                    var todayActivities = _.filter(activities, function (activityItem) {
                        return kendo.parseDate(activityItem.activityStart) >= $scope.today && kendo.parseDate(activityItem.activityEnd) <= $scope.endOfDay
                    });
                    var weeklyActivities = _.filter(activities, function (activityItem) {
                        return kendo.parseDate(activityItem.activityStart) >= $scope.weekStartDate && kendo.parseDate(activityItem.activityEnd) <= $scope.weekEndDate
                    });
                    var monthlyActivities = _.filter(activities, function (activityItem) {
                        return kendo.parseDate(activityItem.activityStart) >= $scope.monthStartDate && kendo.parseDate(activityItem.activityEnd) <= $scope.monthEndDate
                    });
                    var uniqueDates = _.uniq(allStartDates);
                    var CurrentPerformanceGoals = [];
                    if (prospectingGoal) {
                        _.each(prospectingGoal.prospectingSkillGoals, function (item, index) {
                            var perActivity = 0;
                            if (allActivities.length > 0) {
                                perActivity = Math.round(parseFloat((item.goal) / allActivities.length).toFixed(2) * 100) / 100;
                            }
                            var dailyGoal = Math.round(parseFloat(perActivity * todayActivities.length).toFixed(2) * 100) / 100;  //Math.round(parseFloat(item.goal / uniqueDates.length).toFixed(2) * 100) / 100;
                            var weekGoal = Math.round(parseFloat(perActivity * weeklyActivities.length).toFixed(2) * 100) / 100; //moment(prospectingGoalActivityInfo.activityEndTime).diff(moment(prospectingGoalActivityInfo.activityStartTime), 'week')
                            var monthGoal = Math.round(parseFloat(perActivity * monthlyActivities.length).toFixed(2) * 100) / 100; //moment(prospectingGoalActivityInfo.activityEndTime).diff(moment(prospectingGoalActivityInfo.activityStartTime), 'month')
                            var SplitSkillGoal = {
                                skillId: item.skillId,
                                skillName: item.skillName,
                                perActvity: perActivity,
                                daily: dailyGoal,
                                weekly: weekGoal,
                                monthly: monthGoal,
                                total: (perActivity * activities.length),
                                dailyResult: 0,
                                weeklyResult: 0,
                                monthlyResult: 0,
                                totalResult: item.result,
                            };
                            CurrentPerformanceGoals.push(SplitSkillGoal)
                        })
                        prospectingGoal["currentPerformanceGoals"] = CurrentPerformanceGoals;
                    }
                    return CurrentPerformanceGoals;
                }
                $scope.GetProjectProspectingGoalResultSummaryByUserId = function (userId, projectId) {
                    $scope.userSummaryResultData = null;
                    $scope.topBoxFilterOption.projectId = projectId;
                    $scope.topBoxFilterOption.userId = userId;
                    if (userId != 0) {
                        var user = _.find($scope.projectMembers, function (memberItem) {
                            return memberItem.id == userId;
                        });
                        $scope.topBoxFilterOption.userName = user.firstName + " " + user.lastName;
                    }
                    else {
                        $scope.topBoxFilterOption.userName = $translate.instant('TASKPROSPECTING_ALL_MEMBERS');
                        var selectedUserIds = [];
                        if ($scope.selectedProjectMembers.length > 0) {
                            _.each($scope.selectedProjectMembers, function (item) {
                                selectedUserIds.push(item.id);
                            });
                            var memberNames = [];
                            _.each(selectedUserIds, function (value) {
                                var member = _.find($scope.projectMembers, function (item) {
                                    return item.id == value;
                                });
                                if (member) {
                                    if (!($("#tab_" + value).hasClass("active"))) {
                                        $("#tab_" + value).addClass("active");
                                    }
                                    memberNames.push(member.firstName + " " + member.lastName);
                                }
                            });
                            if (memberNames.length > 0) {
                                $scope.topBoxFilterOption.userName = memberNames.join(',');
                            }
                        }
                        else {
                            $(".usertab").removeClass("active");
                        }
                    }

                    if ($("#userResultDataGrid").data("kendoGrid")) {
                        $("#userResultDataGrid").kendoGrid("destroy");
                        $("#userResultDataGrid").html("");
                    }
                    progressBar.startProgress();
                    serviceProspectingManager.getProjectServiceProspectingGoalResultSummaryByUserId(userId, projectId).then(function (data) {
                        if ($scope.projectMembers.length > 0 && $scope.topBoxFilterOption.userId == 0) {
                            var userIds = _.map($scope.projectMembers, function (item) {
                                return item.id;
                            });
                            data = _.filter(data, function (item) {
                                return userIds.indexOf(item.userId) > -1;
                            });
                        }
                        if ($scope.selectedProjectMembers.length > 0 && $scope.topBoxFilterOption.userId == 0) {
                            var userIds = _.map($scope.selectedProjectMembers, function (item) {
                                return item.id;
                            });
                            data = _.filter(data, function (item) {
                                return userIds.indexOf(item.userId) > -1;
                            });
                        }
                        $scope.userSummaryResultData = data;
                        $scope.calculatingGoalResultSummary = false;
                        progressBar.stopProgress();
                        $scope.caculateTotalResult();
                        $scope.filterUserResult($scope.topBoxFilterOption.topboxResultOptionId)
                    })
                };
                $scope.filterUserResult = function (filterValue) {
                    var filterOption = _.find($scope.resultFilterOptions, function (item) {
                        return item.id == filterValue;
                    });
                    if (filterOption) {
                        $scope.filterUserResultText = filterOption.name;
                    }
                    else {
                        $scope.filterUserResultText = null;
                    }
                    var data = $scope.userSummaryResultData;
                    var columns = [];
                    var aggregates = [];
                    var gridData = [];
                    $scope.skillsForAll = [];
                    $scope.aggregateProspectingData = [];

                    if (filterValue == $scope.resultFilterOptionEnums.Weekly) {
                        if (data.length > 0) {
                            columns.push({ field: "userName", title: $translate.instant('COMMON_SELLER'), hidden: ($scope.topBoxFilterOption.userId != 0) });
                            columns.push({ field: "projectName", title: $translate.instant('TASKPROSPECTING_PROJECT_NAME') });
                            columns.push({ field: "prospectingName", title: $translate.instant('TASKPROSPECTING_PROSPECTING_NAME'), footerTemplate: "Total" });
                            if (data[0].weeklyResult.length > 0) {
                                if (data[0].weeklyResult[0].prospectingSkillGoalResults.length > 0) {
                                    _.each(data[0].weeklyResult[0].prospectingSkillGoalResults, function (skillGoalItem) {
                                        columns.push({
                                            field: skillGoalItem.skillName + "_Goal", title: skillGoalItem.skillName + ' ' + $translate.instant('COMMON_GOAL'), aggregates: ["sum"],
                                            footerTemplate: function (data) {
                                                var resultSum = Math.round(data[skillGoalItem.skillName + "_Goal"].sum * 100) / 100;
                                                return "<div class='text-center'> " + resultSum + " </div>";
                                            },
                                            attributes: {
                                                "class": "text-center"
                                            }
                                        })
                                        columns.push({
                                            field: skillGoalItem.skillName + "_Count", title: skillGoalItem.skillName + ' ' + $translate.instant('TASKPROSPECTING_COUNT'), aggregates: ["sum"],
                                            footerTemplate: function (data) {
                                                var resultSum = Math.round(data[skillGoalItem.skillName + "_Count"].sum * 100) / 100;
                                                return "<div class='text-center'> " + resultSum + " </div>";
                                            },
                                            attributes: {
                                                "class": "text-center"
                                            }, template: function (data, value) {
                                                return data[skillGoalItem.skillName + "_Count"] + " <i class='fa fa-eye' ng-click='viewProspectingResults(" + data.prospectingGoalId + "," + data.skillId + "," + skillGoalItem.seqNo + ")'></i>"
                                            }
                                        })
                                        columns.push({
                                            field: skillGoalItem.skillName + "_Result", title: skillGoalItem.skillName + ' ' + $translate.instant('TASKPROSPECTING_RESULT'), attributes: {
                                                "class": "text-center"
                                            },
                                            template: "<span>#=" + skillGoalItem.skillName + "_Result" + "#%<\span>",
                                            footerTemplate: function (data) {
                                                var avgResult = ((data[skillGoalItem.skillName + "_Count"].sum / data[skillGoalItem.skillName + "_Goal"].sum) * 100);
                                                if (isNaN(avgResult)) {
                                                    avgResult = 0;
                                                }
                                                var resultAvg = Math.round(avgResult * 100) / 100;
                                                return "<div class='text-center'>" + resultAvg + "%</div>"
                                            },
                                        })

                                        aggregates.push({
                                            field: skillGoalItem.skillName + "_Goal", aggregate: "sum"
                                        })
                                        aggregates.push({
                                            field: skillGoalItem.skillName + "_Count", aggregate: "sum"
                                        })
                                    });
                                }
                            }
                        }
                        _.each(data, function (item, index) {
                            var rowdata = {
                                userName: item.userName,
                                projectName: item.projectName,
                                prospectingName: item.prospectingGoalName,
                                prospectingGoalId: item.prospectingGoalId,
                            };
                            _.each(item.weeklyResult, function (resultItem) {
                                _.each(resultItem.prospectingSkillGoalResults, function (skillGoalItem) {
                                    if (index == 0) {
                                        $scope.skillsForAll.push(skillGoalItem);
                                        rowdata.prospectingGoalId = skillGoalItem.prospectingGoalId;

                                        var prospectingGoal = _.find($scope.prospectingGoals, function (item) {
                                            return item.id == skillGoalItem.prospectingGoalId;
                                        });
                                        if (prospectingGoal) {
                                            if (prospectingGoal.calculatedProspectingGoals) {
                                                var skillCalculatedGoal = _.find(prospectingGoal.calculatedProspectingGoals, function (calculatedProspectingGoalItem) {
                                                    return calculatedProspectingGoalItem.skillId == skillGoalItem.skillId;
                                                });
                                                if (skillCalculatedGoal) {
                                                    rowdata["skillId"] = skillGoalItem.skillId;
                                                    rowdata[skillGoalItem.skillName + "_Goal"] = skillCalculatedGoal.weekly;
                                                    rowdata[skillGoalItem.skillName + "_Count"] = skillCalculatedGoal.weeklyResult;
                                                    var resultAvg = 0;
                                                    if (!isNaN((skillCalculatedGoal.weeklyResult / skillCalculatedGoal.weekly))) {
                                                        resultAvg = parseFloat((skillCalculatedGoal.weeklyResult / skillCalculatedGoal.weekly) * 100).toFixed(2);
                                                    }
                                                    rowdata[skillGoalItem.skillName + "_Result"] = resultAvg;
                                                }
                                                else {
                                                    rowdata["skillId"] = skillGoalItem.skillId;
                                                    rowdata[skillGoalItem.skillName + "_Goal"] = skillGoalItem.goal;
                                                    rowdata[skillGoalItem.skillName + "_Count"] = skillGoalItem.count;
                                                    rowdata[skillGoalItem.skillName + "_Result"] = skillGoalItem.result;
                                                }
                                            }
                                            else {
                                                rowdata["skillId"] = skillGoalItem.skillId;
                                                rowdata[skillGoalItem.skillName + "_Goal"] = skillGoalItem.goal;
                                                rowdata[skillGoalItem.skillName + "_Count"] = skillGoalItem.count;
                                                rowdata[skillGoalItem.skillName + "_Result"] = skillGoalItem.result;
                                            }
                                        }
                                        else {
                                            rowdata["skillId"] = skillGoalItem.skillId;
                                            rowdata[skillGoalItem.skillName + "_Goal"] = skillGoalItem.goal;
                                            rowdata[skillGoalItem.skillName + "_Count"] = skillGoalItem.count;
                                            rowdata[skillGoalItem.skillName + "_Result"] = skillGoalItem.result;
                                        }
                                    }
                                    else {
                                        var skill = _.find($scope.skillsForAll, function (item) {
                                            return item.seqNo == skillGoalItem.seqNo;
                                        });
                                        rowdata.prospectingGoalId = skillGoalItem.prospectingGoalId;
                                        var prospectingGoal = _.find($scope.prospectingGoals, function (item) {
                                            return item.id == skillGoalItem.prospectingGoalId;
                                        });
                                        if (prospectingGoal) {
                                            if (prospectingGoal.calculatedProspectingGoals) {
                                                var skillCalculatedGoal = _.find(prospectingGoal.calculatedProspectingGoals, function (calculatedProspectingGoalItem) {
                                                    return calculatedProspectingGoalItem.skillId == skillGoalItem.skillId;
                                                });
                                                if (skillCalculatedGoal) {
                                                    rowdata["skillId"] = skillGoalItem.skillId;
                                                    rowdata[skill.skillName + "_Goal"] = skillCalculatedGoal.weekly;
                                                    rowdata[skill.skillName + "_Count"] = skillCalculatedGoal.weeklyResult;
                                                    var resultAvg = 0;
                                                    if (!isNaN((skillCalculatedGoal.weeklyResult / skillCalculatedGoal.weekly))) {
                                                        resultAvg = parseFloat((skillCalculatedGoal.weeklyResult / skillCalculatedGoal.weekly) * 100).toFixed(2);
                                                    }
                                                    rowdata[skill.skillName + "_Result"] = resultAvg;
                                                }
                                                else {
                                                    rowdata["skillId"] = skillGoalItem.skillId;
                                                    rowdata[skill.skillName + "_Goal"] = skillGoalItem.goal;
                                                    rowdata[skill.skillName + "_Count"] = skillGoalItem.count;
                                                    rowdata[skill.skillName + "_Result"] = skillGoalItem.result;
                                                }
                                            }
                                            else {
                                                rowdata["skillId"] = skillGoalItem.skillId;
                                                rowdata[skillGoalItem.skillName + "_Goal"] = skillGoalItem.goal;
                                                rowdata[skillGoalItem.skillName + "_Count"] = skillGoalItem.count;
                                                rowdata[skillGoalItem.skillName + "_Result"] = skillGoalItem.result;
                                            }
                                        }
                                        else {
                                            rowdata["skillId"] = skillGoalItem.skillId;
                                            rowdata[skillGoalItem.skillName + "_Goal"] = skillGoalItem.goal;
                                            rowdata[skillGoalItem.skillName + "_Count"] = skillGoalItem.count;
                                            rowdata[skillGoalItem.skillName + "_Result"] = skillGoalItem.result;
                                        }
                                    }
                                });
                                gridData.push(rowdata);
                            });
                        })
                    }
                    else if (filterValue == $scope.resultFilterOptionEnums.Monthly) {

                        if (data.length > 0) {
                            columns.push({
                                field: "prospectingName", title: $translate.instant('TASKPROSPECTING_PROSPECTING_NAME'),

                                footerTemplate: "Total"
                            });
                            if (data[0].monthlyResult.length > 0) {
                                if (data[0].monthlyResult[0].prospectingSkillGoalResults.length > 0) {
                                    _.each(data[0].monthlyResult[0].prospectingSkillGoalResults, function (skillGoalItem) {
                                        columns.push({
                                            field: skillGoalItem.skillName + "_Goal", title: skillGoalItem.skillName + ' ' + $translate.instant('COMMON_GOAL'), aggregates: ["sum"],
                                            footerTemplate: function (data) {
                                                var resultSum = Math.round(data[skillGoalItem.skillName + "_Goal"].sum * 100) / 100;
                                                return "<div class='text-center'> " + resultSum + " </div>";
                                            },
                                            attributes: {
                                                "class": "text-center"
                                            }
                                        })
                                        columns.push({
                                            field: skillGoalItem.skillName + "_Count", title: skillGoalItem.skillName + ' ' + $translate.instant('TASKPROSPECTING_COUNT'), aggregates: ["sum"],
                                            footerTemplate: function (data) {
                                                var resultSum = Math.round(data[skillGoalItem.skillName + "_Count"].sum * 100) / 100;
                                                return "<div class='text-center'> " + resultSum + " </div>";
                                            },
                                            attributes: {
                                                "class": "text-center"
                                            }, template: function (data, value) {
                                                return data[skillGoalItem.skillName + "_Count"] + " <i class='fa fa-eye' ng-click='viewProspectingResults(" + data.prospectingGoalId + "," + data.skillId + "," + skillGoalItem.seqNo + ")'></i>"
                                            }
                                        })
                                        columns.push({
                                            field: skillGoalItem.skillName + "_Result", title: skillGoalItem.skillName + ' ' + $translate.instant('TASKPROSPECTING_RESULT'), attributes: {
                                                "class": "text-center"
                                            },
                                            template: "<span>#=" + skillGoalItem.skillName + "_Result" + "#%<\span>",
                                            footerTemplate: function (data) {
                                                var avgResult = ((data[skillGoalItem.skillName + "_Count"].sum / data[skillGoalItem.skillName + "_Goal"].sum) * 100)
                                                if (isNaN(avgResult)) {
                                                    avgResult = 0;
                                                }
                                                var resultAvg = Math.round(avgResult * 100) / 100;
                                                return "<div class='text-center'>" + resultAvg + "%</div>"
                                            },
                                        })

                                        aggregates.push({
                                            field: skillGoalItem.skillName + "_Goal", aggregate: "sum"
                                        })
                                        aggregates.push({
                                            field: skillGoalItem.skillName + "_Count", aggregate: "sum"
                                        })
                                    });
                                }
                            }
                        }
                        _.each(data, function (item, index) {
                            var rowdata = {
                                userName: item.userName,
                                projectName: item.projectName,
                                prospectingName: item.prospectingGoalName,
                                prospectingGoalId: item.prospectingGoalId,
                            };
                            _.each(item.monthlyResult, function (resultItem) {
                                _.each(resultItem.prospectingSkillGoalResults, function (skillGoalItem) {
                                    if (index == 0) {
                                        $scope.skillsForAll.push(skillGoalItem);
                                        rowdata.prospectingGoalId = skillGoalItem.prospectingGoalId;

                                        var prospectingGoal = _.find($scope.prospectingGoals, function (item) {
                                            return item.id == skillGoalItem.prospectingGoalId;
                                        });
                                        if (prospectingGoal) {
                                            if (prospectingGoal.calculatedProspectingGoals) {
                                                var skillCalculatedGoal = _.find(prospectingGoal.calculatedProspectingGoals, function (calculatedProspectingGoalItem) {
                                                    return calculatedProspectingGoalItem.skillId == skillGoalItem.skillId;
                                                });
                                                if (skillCalculatedGoal) {
                                                    rowdata["skillId"] = skillGoalItem.skillId;
                                                    rowdata[skillGoalItem.skillName + "_Goal"] = skillCalculatedGoal.monthly;
                                                    rowdata[skillGoalItem.skillName + "_Count"] = skillCalculatedGoal.monthlyResult;
                                                    var resultAvg = 0;
                                                    if (!isNaN((skillCalculatedGoal.monthlyResult / skillCalculatedGoal.monthly))) {
                                                        resultAvg = parseFloat((skillCalculatedGoal.monthlyResult / skillCalculatedGoal.monthly) * 100).toFixed(2);
                                                    }
                                                    rowdata[skillGoalItem.skillName + "_Result"] = resultAvg;
                                                }
                                                else {
                                                    rowdata["skillId"] = skillGoalItem.skillId;
                                                    rowdata[skillGoalItem.skillName + "_Goal"] = skillGoalItem.goal;
                                                    rowdata[skillGoalItem.skillName + "_Count"] = skillGoalItem.count;
                                                    rowdata[skillGoalItem.skillName + "_Result"] = skillGoalItem.result;
                                                }
                                            }
                                            else {
                                                rowdata["skillId"] = skillGoalItem.skillId;
                                                rowdata[skillGoalItem.skillName + "_Goal"] = skillGoalItem.goal;
                                                rowdata[skillGoalItem.skillName + "_Count"] = skillGoalItem.count;
                                                rowdata[skillGoalItem.skillName + "_Result"] = skillGoalItem.result;
                                            }
                                        }
                                        else {
                                            rowdata["skillId"] = skillGoalItem.skillId;
                                            rowdata[skillGoalItem.skillName + "_Goal"] = skillGoalItem.goal;
                                            rowdata[skillGoalItem.skillName + "_Count"] = skillGoalItem.count;
                                            rowdata[skillGoalItem.skillName + "_Result"] = skillGoalItem.result;
                                        }
                                    }
                                    else {
                                        var skill = _.find($scope.skillsForAll, function (item) {
                                            return item.seqNo == skillGoalItem.seqNo;
                                        });
                                        rowdata.prospectingGoalId = skillGoalItem.prospectingGoalId;
                                        var prospectingGoal = _.find($scope.prospectingGoals, function (item) {
                                            return item.id == skillGoalItem.prospectingGoalId;
                                        });
                                        if (prospectingGoal) {
                                            if (prospectingGoal.calculatedProspectingGoals) {
                                                var skillCalculatedGoal = _.find(prospectingGoal.calculatedProspectingGoals, function (calculatedProspectingGoalItem) {
                                                    return calculatedProspectingGoalItem.skillId == skillGoalItem.skillId;
                                                });
                                                if (skillCalculatedGoal) {
                                                    rowdata["skillId"] = skillGoalItem.skillId;
                                                    rowdata[skill.skillName + "_Goal"] = skillCalculatedGoal.monthly;
                                                    rowdata[skill.skillName + "_Count"] = skillCalculatedGoal.monthlyResult;
                                                    var resultAvg = 0;
                                                    if (!isNaN((skillCalculatedGoal.monthlyResult / skillCalculatedGoal.monthly))) {
                                                        resultAvg = parseFloat((skillCalculatedGoal.monthlyResult / skillCalculatedGoal.monthly) * 100).toFixed(2);
                                                    }
                                                    rowdata[skill.skillName + "_Result"] = resultAvg;
                                                }
                                                else {
                                                    rowdata["skillId"] = skillGoalItem.skillId;
                                                    rowdata[skill.skillName + "_Goal"] = skillGoalItem.goal;
                                                    rowdata[skill.skillName + "_Count"] = skillGoalItem.count;
                                                    rowdata[skill.skillName + "_Result"] = skillGoalItem.result;
                                                }
                                            }
                                            else {
                                                rowdata["skillId"] = skillGoalItem.skillId;
                                                rowdata[skillGoalItem.skillName + "_Goal"] = skillGoalItem.goal;
                                                rowdata[skillGoalItem.skillName + "_Count"] = skillGoalItem.count;
                                                rowdata[skillGoalItem.skillName + "_Result"] = skillGoalItem.result;
                                            }
                                        }
                                        else {
                                            rowdata["skillId"] = skillGoalItem.skillId;
                                            rowdata[skillGoalItem.skillName + "_Goal"] = skillGoalItem.goal;
                                            rowdata[skillGoalItem.skillName + "_Count"] = skillGoalItem.count;
                                            rowdata[skillGoalItem.skillName + "_Result"] = skillGoalItem.result;
                                        }
                                    }
                                });
                                gridData.push(rowdata);
                            });
                        })

                    }
                    else if (filterValue == $scope.resultFilterOptionEnums.Total) {

                        if (data.length > 0) {
                            columns.push({ field: "userName", title: $translate.instant('COMMON_SELLER'), hidden: ($scope.topBoxFilterOption.userId != 0) });
                            columns.push({ field: "projectName", title: $translate.instant('TASKPROSPECTING_PROJECT_NAME') });
                            columns.push({ field: "prospectingName", title: $translate.instant('TASKPROSPECTING_PROSPECTING_NAME'), footerTemplate: "Total" });
                            if (data[0].totalResult.length > 0) {
                                if (data[0].totalResult[0].prospectingSkillGoalResults.length > 0) {
                                    _.each(data[0].totalResult[0].prospectingSkillGoalResults, function (skillGoalItem) {
                                        columns.push({
                                            field: skillGoalItem.skillName + "_Goal", title: skillGoalItem.skillName + ' ' + $translate.instant('COMMON_GOAL'), aggregates: ["sum"],
                                            footerTemplate: function (data) {
                                                var resultSum = Math.round(data[skillGoalItem.skillName + "_Goal"].sum * 100) / 100;
                                                return "<div class='text-center'> " + resultSum + " </div>";
                                            },
                                            attributes: {
                                                "class": "text-center"
                                            }
                                        })
                                        columns.push({
                                            field: skillGoalItem.skillName + "_Count", title: skillGoalItem.skillName + ' ' + $translate.instant('TASKPROSPECTING_COUNT'), aggregates: ["sum"],
                                            footerTemplate: function (data) {
                                                var resultSum = Math.round(data[skillGoalItem.skillName + "_Count"].sum * 100) / 100;
                                                return "<div class='text-center'> " + resultSum + " </div>";
                                            },
                                            attributes: {
                                                "class": "text-center"
                                            }, template: function (data, value) {
                                                return data[skillGoalItem.skillName + "_Count"] + " <i class='fa fa-eye' ng-click='viewProspectingResults(" + data.prospectingGoalId + "," + data.skillId + "," + skillGoalItem.seqNo + ")'></i>"
                                            }
                                        })
                                        columns.push({
                                            field: skillGoalItem.skillName + "_Result", title: skillGoalItem.skillName + ' ' + $translate.instant('TRAININGDAIRY_RESULT'), attributes: {
                                                "class": "text-center"
                                            },
                                            template: "<span>#=" + skillGoalItem.skillName + "_Result" + "#%<\span>",
                                            format: "{0:##,#}",
                                            footerTemplate: function (data) {
                                                var avgResult = ((data[skillGoalItem.skillName + "_Count"].sum / data[skillGoalItem.skillName + "_Goal"].sum) * 100);
                                                if (isNaN(avgResult)) {
                                                    avgResult = 0;
                                                }
                                                var resultAvg = Math.round(avgResult * 100) / 100;
                                                return "<div class='text-center'>" + resultAvg + "%</div>"
                                            },
                                        })

                                        aggregates.push({
                                            field: skillGoalItem.skillName + "_Goal", aggregate: "sum"
                                        })
                                        aggregates.push({
                                            field: skillGoalItem.skillName + "_Count", aggregate: "sum"
                                        })
                                    });
                                }
                            }
                        }
                        _.each(data, function (item, index) {
                            var rowdata = {
                                userName: item.userName,
                                projectName: item.projectName,
                                prospectingName: item.prospectingGoalName,
                                prospectingGoalId: item.prospectingGoalId,
                            };
                            _.each(item.totalResult, function (resultItem) {
                                _.each(resultItem.prospectingSkillGoalResults, function (skillGoalItem) {
                                    if (index == 0) {
                                        $scope.skillsForAll.push(skillGoalItem);
                                        rowdata.prospectingGoalId = skillGoalItem.prospectingGoalId;
                                        rowdata["skillId"] = skillGoalItem.skillId;
                                        rowdata[skillGoalItem.skillName + "_Goal"] = skillGoalItem.goal;
                                        rowdata[skillGoalItem.skillName + "_Count"] = skillGoalItem.count;
                                        rowdata[skillGoalItem.skillName + "_Result"] = skillGoalItem.result;
                                    }
                                    else {
                                        var skill = _.find($scope.skillsForAll, function (item) {
                                            return item.seqNo == skillGoalItem.seqNo;
                                        });
                                        rowdata.prospectingGoalId = skillGoalItem.prospectingGoalId;
                                        rowdata["skillId"] = skillGoalItem.skillId;
                                        if (skill) {
                                            rowdata[skill.skillName + "_Goal"] = skillGoalItem.goal;
                                            rowdata[skill.skillName + "_Count"] = skillGoalItem.count;
                                            rowdata[skill.skillName + "_Result"] = skillGoalItem.result;
                                        }
                                        else {
                                            rowdata[skillGoalItem.skillName + "_Goal"] = skillGoalItem.goal;
                                            rowdata[skillGoalItem.skillName + "_Count"] = skillGoalItem.count;
                                            rowdata[skillGoalItem.skillName + "_Result"] = skillGoalItem.result;
                                        }
                                    }

                                });
                                gridData.push(rowdata);
                            });
                        })


                    }
                    else if (filterValue == $scope.resultFilterOptionEnums.Today) {

                        if (data.length > 0) {
                            columns.push({ field: "userName", title: $translate.instant('COMMON_SELLER'), hidden: ($scope.topBoxFilterOption.userId != 0) });
                            columns.push({ field: "projectName", title: $translate.instant('TASKPROSPECTING_PROJECT_NAME') });
                            columns.push({ field: "prospectingName", title: $translate.instant('TASKPROSPECTING_PROSPECTING_NAME'), footerTemplate: "Total", width: '200px' });
                            if (data[0].todayResult.length > 0) {
                                if (data[0].todayResult[0].prospectingSkillGoalResults.length > 0) {
                                    _.each(data[0].todayResult[0].prospectingSkillGoalResults, function (skillGoalItem) {
                                        columns.push({
                                            field: skillGoalItem.skillName + "_Goal", title: skillGoalItem.skillName + ' ' + $translate.instant('COMMON_GOAL'), aggregates: ["sum"],
                                            attributes: {
                                                "class": "text-center"
                                            },
                                            footerTemplate: function (data) {
                                                var resultSum = Math.round(data[skillGoalItem.skillName + "_Goal"].sum * 100) / 100;
                                                return "<div class='text-center'> " + resultSum + " </div>";
                                            }
                                        })
                                        columns.push({
                                            field: skillGoalItem.skillName + "_Count", title: skillGoalItem.skillName + ' ' + $translate.instant('TASKPROSPECTING_COUNT'), aggregates: ["sum"],
                                            footerTemplate: function (data) {
                                                var resultSum = Math.round(data[skillGoalItem.skillName + "_Count"].sum * 100) / 100;
                                                return "<div class='text-center'> " + resultSum + " </div>";
                                            }, attributes: {
                                                "class": "text-center"
                                            }, template: function (data, value) {

                                                return data[skillGoalItem.skillName + "_Count"] + " <i class='fa fa-eye' ng-click='viewProspectingResults(" + data.prospectingGoalId + "," + data.skillId + "," + skillGoalItem.seqNo + ")'></i>"
                                            }
                                        })
                                        columns.push({
                                            field: skillGoalItem.skillName + "_Result", title: skillGoalItem.skillName + ' ' + $translate.instant('TRAININGDAIRY_RESULT'), attributes: {
                                                "class": "text-center"
                                            },
                                            template: "<span>#=" + skillGoalItem.skillName + "_Result" + "#%<\span>",
                                            footerTemplate: function (data) {
                                                var avgResult = ((data[skillGoalItem.skillName + "_Count"].sum / data[skillGoalItem.skillName + "_Goal"].sum) * 100);
                                                if (isNaN(avgResult)) {
                                                    avgResult = 0;
                                                }
                                                var resultAvg = Math.round(avgResult * 100) / 100;
                                                return "<div class='text-center'>" + resultAvg + "%</div>"
                                            },
                                        })

                                        aggregates.push({
                                            field: skillGoalItem.skillName + "_Goal", aggregate: "sum"
                                        })
                                        aggregates.push({
                                            field: skillGoalItem.skillName + "_Count", aggregate: "sum"
                                        })
                                    });
                                }
                            }
                        }
                        _.each(data, function (item, index) {
                            var rowdata = {
                                userName: item.userName,
                                projectName: item.projectName,
                                prospectingName: item.prospectingGoalName,
                                prospectingGoalId: item.prospectingGoalId,
                            };
                            _.each(item.todayResult, function (resultItem) {
                                _.each(resultItem.prospectingSkillGoalResults, function (skillGoalItem) {
                                    if (index == 0) {
                                        $scope.skillsForAll.push(skillGoalItem);
                                        rowdata.prospectingGoalId = skillGoalItem.prospectingGoalId;

                                        var prospectingGoal = _.find($scope.prospectingGoals, function (item) {
                                            return item.id == skillGoalItem.prospectingGoalId;
                                        });
                                        if (prospectingGoal) {
                                            if (prospectingGoal.calculatedProspectingGoals) {
                                                var skillCalculatedGoal = _.find(prospectingGoal.calculatedProspectingGoals, function (calculatedProspectingGoalItem) {
                                                    return calculatedProspectingGoalItem.skillId == skillGoalItem.skillId;
                                                });
                                                if (skillCalculatedGoal) {
                                                    rowdata["skillId"] = skillGoalItem.skillId;
                                                    rowdata[skillGoalItem.skillName + "_Goal"] = skillCalculatedGoal.daily;
                                                    rowdata[skillGoalItem.skillName + "_Count"] = skillCalculatedGoal.dailyResult;
                                                    var resultAvg = 0;
                                                    if (!isNaN((skillCalculatedGoal.dailyResult / skillCalculatedGoal.daily))) {
                                                        resultAvg = parseFloat((skillCalculatedGoal.dailyResult / skillCalculatedGoal.daily) * 100).toFixed(2);
                                                    }
                                                    rowdata[skillGoalItem.skillName + "_Result"] = resultAvg;
                                                }
                                                else {
                                                    rowdata["skillId"] = skillGoalItem.skillId;
                                                    rowdata[skillGoalItem.skillName + "_Goal"] = skillGoalItem.goal;
                                                    rowdata[skillGoalItem.skillName + "_Count"] = skillGoalItem.count;
                                                    rowdata[skillGoalItem.skillName + "_Result"] = skillGoalItem.result;
                                                }
                                            }
                                            else {
                                                rowdata["skillId"] = skillGoalItem.skillId;
                                                rowdata[skillGoalItem.skillName + "_Goal"] = skillGoalItem.goal;
                                                rowdata[skillGoalItem.skillName + "_Count"] = skillGoalItem.count;
                                                rowdata[skillGoalItem.skillName + "_Result"] = skillGoalItem.result;
                                            }
                                        }
                                        else {
                                            rowdata["skillId"] = skillGoalItem.skillId;
                                            rowdata[skillGoalItem.skillName + "_Goal"] = skillGoalItem.goal;
                                            rowdata[skillGoalItem.skillName + "_Count"] = skillGoalItem.count;
                                            rowdata[skillGoalItem.skillName + "_Result"] = skillGoalItem.result;
                                        }
                                    }
                                    else {
                                        var skill = _.find($scope.skillsForAll, function (item) {
                                            return item.seqNo == skillGoalItem.seqNo;
                                        });
                                        rowdata.prospectingGoalId = skillGoalItem.prospectingGoalId;
                                        var prospectingGoal = _.find($scope.prospectingGoals, function (item) {
                                            return item.id == skillGoalItem.prospectingGoalId;
                                        });
                                        if (prospectingGoal) {
                                            if (prospectingGoal.calculatedProspectingGoals) {
                                                var skillCalculatedGoal = _.find(prospectingGoal.calculatedProspectingGoals, function (calculatedProspectingGoalItem) {
                                                    return calculatedProspectingGoalItem.skillId == skillGoalItem.skillId;
                                                });
                                                if (skillCalculatedGoal) {
                                                    rowdata["skillId"] = skillGoalItem.skillId;
                                                    rowdata[skill.skillName + "_Goal"] = skillCalculatedGoal.daily;
                                                    rowdata[skill.skillName + "_Count"] = skillCalculatedGoal.dailyResult;
                                                    var resultAvg = 0;
                                                    if (!isNaN((skillCalculatedGoal.dailyResult / skillCalculatedGoal.daily))) {
                                                        resultAvg = parseFloat((skillCalculatedGoal.dailyResult / skillCalculatedGoal.daily) * 100).toFixed(2);
                                                    }
                                                    rowdata[skill.skillName + "_Result"] = resultAvg;
                                                }
                                                else {
                                                    rowdata["skillId"] = skillGoalItem.skillId;
                                                    rowdata[skill.skillName + "_Goal"] = skillGoalItem.goal;
                                                    rowdata[skill.skillName + "_Count"] = skillGoalItem.count;
                                                    rowdata[skill.skillName + "_Result"] = skillGoalItem.result;
                                                }
                                            }
                                            else {
                                                rowdata["skillId"] = skillGoalItem.skillId;
                                                rowdata[skillGoalItem.skillName + "_Goal"] = skillGoalItem.goal;
                                                rowdata[skillGoalItem.skillName + "_Count"] = skillGoalItem.count;
                                                rowdata[skillGoalItem.skillName + "_Result"] = skillGoalItem.result;
                                            }
                                        }
                                        else {
                                            rowdata["skillId"] = skillGoalItem.skillId;
                                            rowdata[skillGoalItem.skillName + "_Goal"] = skillGoalItem.goal;
                                            rowdata[skillGoalItem.skillName + "_Count"] = skillGoalItem.count;
                                            rowdata[skillGoalItem.skillName + "_Result"] = skillGoalItem.result;
                                        }
                                    }

                                });
                                gridData.push(rowdata);
                            });
                        })


                    }
                    if ($scope.topBoxFilterOption.prospectingGoalIds.length > 0) {
                        gridData = _.filter(gridData, function (gridItem) {
                            var isExist = _.any($scope.topBoxFilterOption.prospectingGoalIds, function (selectedProspectingGoalItem) {
                                return selectedProspectingGoalItem.id == gridItem.prospectingGoalId;
                            });
                            return isExist;
                        });
                    }
                    if ($("#userResultDataGrid").data("kendoGrid")) {
                        $("#userResultDataGrid").kendoGrid("destroy");
                        $("#userResultDataGrid").html("");
                    }

                    var skillsList = [];
                    _.each(Object.keys(gridData[0]), function (objectKey) {
                        var splitedKey = objectKey.split('_');
                        if (splitedKey.length == 2) {
                            if (splitedKey[0] != "") {
                                if (!(skillsList.indexOf(splitedKey[0]) > -1)) {
                                    skillsList.push(splitedKey[0])
                                }
                            }
                        }
                    })
                    _.each(skillsList, function (skillText) {
                        var obj = {
                            skillName: skillText,
                            goal: 0,
                            count: 0,
                            result: 0,
                        };
                        _.each(gridData, function (gridItem) {
                            obj.count += gridItem[skillText + "_Count"];
                            obj.goal += gridItem[skillText + "_Goal"];
                        });
                        obj.result = parseInt(obj.count / obj.goal * 100);
                        $scope.aggregateProspectingData.push(obj);
                    })

                    $("#userResultDataGrid").kendoGrid({
                        //dataBound: $scope.onUserAssignGridDataBound,
                        dataSource: {
                            type: "json",
                            data: gridData,
                            pageSize: 10,
                            aggregate: aggregates,
                        },
                        groupable: false, // this will remove the group bar
                        columnMenu: false,
                        filterable: false,
                        pageable: true,
                        sortable: true,
                        columns: columns,
                    });
                    $("#userResultDataGrid").kendoTooltip({
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
                    var linkFn = $compile($("#userResultDataGrid"));
                    linkFn($scope);
                }
                $scope.viewProspectingResults = function (prospectingGoalId, skillId, seqNo) {
                    progressBar.startProgress();

                    var prospectingGoalINfo = _.find($scope.prospectingGoals, function (item) {
                        return item.id == prospectingGoalId;
                    });
                    if (prospectingGoalINfo.prospectingSkillGoals) {
                        _.each(prospectingGoalINfo.prospectingSkillGoals, function (item) {
                            if (item.seqNo == seqNo) {
                                skillId = item.skillId;
                            }
                        });
                    }
                    $scope.prospectingGoals[0].prospectingSkillGoals[0]

                    serviceProspectingManager.getProspectingSkillResultByGoalId(prospectingGoalId, skillId).then(function (data) {
                        progressBar.stopProgress();
                        _.each($scope.skillsForAll, function (item) {
                            if (item.seqNo == seqNo) {
                                $scope.prospectingResultFor = item.skillName;
                            }
                        })

                        $("#prospectingResultModel").modal("show");
                        var columns = [];
                        var aggregates = [];
                        if (data.length > 0) {


                            columns.push({
                                field: "customerName", title: $translate.instant('COMMON_NAME'),
                            });
                            columns.push({
                                field: "mobile", title: $translate.instant('COMMON_MOBILE'), attributes: {
                                    "class": "text-center"
                                },
                                headerAttributes: {
                                    "class": "text-center",
                                }
                            });
                            if (seqNo == 2) {
                                columns.push({
                                    field: "duration", title: $translate.instant('COMMON_DURATION'),
                                    template: function (data) {
                                        if (data.duration) {
                                            return "<span class='text-center'>" + data.duration + " Min<\span>";
                                        }
                                        else {
                                            return "";
                                        }
                                    },
                                    headerAttributes: {
                                        "class": "text-center",
                                    },
                                    attributes: {
                                        "class": "text-center"
                                    }
                                });

                                columns.push({
                                    field: "customerInterestRate", title: $translate.instant('TASKPROSPECTING_CUSTOMER_INTEREST_RATE'),
                                    template: function (data) {
                                        if (data.customerInterestRate) {
                                            return "<span class='text-center'>" + data.customerInterestRate + "%<\span>";
                                        }
                                        else {
                                            return "";
                                        }
                                    },
                                    headerAttributes: {
                                        "class": "text-center",
                                    },
                                    attributes: {
                                        "class": "text-center"
                                    }
                                });
                                columns.push({
                                    field: "reason", title: $translate.instant('TASKPROSPECTING_REASON'),
                                    headerAttributes: {
                                        "class": "text-center",
                                    },
                                    attributes: {
                                        "class": "text-center"
                                    }

                                });
                            }

                            columns.push({
                                field: "result", title: $translate.instant('COMMON_RESULT'),
                                template: function (data) {
                                    if (data.scheduleTime) {
                                        return "<span class='text-center' title='" + data.description + "'>" + data.result + " at " + moment(kendo.parseDate(data.scheduleTime)).format('L LT') + "<\span>"
                                    }
                                    else {
                                        return "<span class='text-center' title='" + data.description + "'>" + data.result + "<\span>"
                                    }

                                },
                                headerAttributes: {
                                    "class": "text-center",
                                },
                                attributes: {
                                    "class": "text-center"
                                }
                            });

                            var gridData = [];
                            _.each(data, function (datItem) {
                                if (seqNo == 3) {
                                    datItem.isMeeting = true;
                                    datItem.isFollowUp = false;
                                    datItem.isNoMeeting = false;
                                }
                                var rowdata = {
                                    customerName: datItem.prospectingCustomer.name,
                                    prospectingActivityId: datItem.prospectingActivityId,
                                    mobile: datItem.prospectingCustomer.phone,
                                    duration: datItem.duration,
                                    isNoMeeting: datItem.isNoMeeting,
                                    isFollowUp: datItem.isFollowUp,
                                    isMeeting: datItem.isMeeting,
                                    customerInterestRate: datItem.customerInterestRate,
                                    reason: datItem.reason,
                                    result: datItem.isMeeting ? 'Meeting Scheduled' : (datItem.isFollowUp ? $translate.instant('SERVICE_PROSPECTING_FOLLOW_UP_SCHEDULED') : $translate.instant('TASKPROSPECTING_NOT_INTERESTED')),
                                    description: datItem.description,
                                    scheduleTime: datItem.scheduleTime,
                                }
                                if (seqNo == 1) {
                                    rowdata.result = $translate.instant('SERVICE_PROSPECTING_CALLED');
                                }


                                gridData.push(rowdata);
                            })

                        }


                        var prospectingGoalActivityInfoes = _.filter($scope.prospectingGoalActivityInfoes, function (item) {
                            return item.prospectingGoalId == prospectingGoalId;
                        });
                        var activities = [];
                        _.each(prospectingGoalActivityInfoes, function (item) {
                            _.each(item.prospectingActivities, function (prospectingActivity) {
                                activities.push(prospectingActivity);
                            })
                        });

                        var allStartDates = [];
                        var allEndDates = [];



                        _.each(activities, function (item) {
                            allStartDates.push(moment(kendo.parseDate(item.activityStart)).format("L"))
                            allEndDates.push(moment(kendo.parseDate(item.activityEnd)).format("L LT"))
                        });

                        if ($scope.resultFilterOptionEnums.Total == $scope.topBoxFilterOption.topboxResultOptionId) {

                        }
                        else if ($scope.resultFilterOptionEnums.Today == $scope.topBoxFilterOption.topboxResultOptionId) {
                            var todayActivities = _.filter(activities, function (activityItem) {
                                return kendo.parseDate(activityItem.activityStart) >= $scope.todayStartDate && kendo.parseDate(activityItem.activityEnd) <= $scope.todayEndDate
                            });

                            gridData = _.filter(gridData, function (item) {
                                var isItemExist = _.any(todayActivities, function (todayItem) {
                                    return todayItem.id == item.prospectingActivityId;
                                });

                                return isItemExist;
                            })

                        }
                        else if ($scope.resultFilterOptionEnums.Weekly == $scope.topBoxFilterOption.topboxResultOptionId) {
                            var weeklyActivities = _.filter(activities, function (activityItem) {
                                return kendo.parseDate(activityItem.activityStart) >= $scope.weekStartDate && kendo.parseDate(activityItem.activityEnd) <= $scope.weekEndDate
                            });
                            gridData = _.filter(gridData, function (item) {
                                var isItemExist = _.any(weeklyActivities, function (weeklyItem) {
                                    return weeklyItem.id == item.prospectingActivityId;
                                });

                                return isItemExist;
                            })
                        }
                        else if ($scope.resultFilterOptionEnums.Monthly == $scope.topBoxFilterOption.topboxResultOptionId) {
                            var monthlyActivities = _.filter(activities, function (activityItem) {
                                return kendo.parseDate(activityItem.activityStart) >= $scope.monthStartDate && kendo.parseDate(activityItem.activityEnd) <= $scope.monthEndDate
                            });
                            gridData = _.filter(gridData, function (item) {
                                var isItemExist = _.any(monthlyActivities, function (monthlyItem) {
                                    return monthlyItem.id == item.prospectingActivityId;
                                });

                                return isItemExist;
                            })
                        }
                        if ($("#prospectingResultGrid").data("kendoGrid")) {
                            $("#prospectingResultGrid").kendoGrid("destroy");
                            $("#prospectingResultGrid").html("");
                        }
                        $("#prospectingResultGrid").kendoGrid({
                            dataSource: {
                                type: "json",
                                data: gridData,
                                //group: { field: "profileid", field: "skill" },
                                pageSize: 10,
                            },
                            groupable: false, // this will remove the group bar
                            columnMenu: false,
                            filterable: false,
                            pageable: true,
                            sortable: true,
                            columns: columns,
                        });
                        $("#prospectingResultGrid").kendoTooltip({
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
                    })
                }
                $scope.caculateTotalResult = function () {
                    $scope.TotalGoalData = [0, 0, 0];
                    $scope.TotalResultData = [0, 0, 0];
                    $scope.TotalPercetageData = [0, 0, 0];
                    $scope.RemainingTotalGoalData = [0, 0, 0];
                    $scope.AdgustedPercetageData = [0, 0, 0];
                    $scope.CurrentPerformanceTotalGoalData = [0, 0, 0];
                    $scope.CurrentPerformancePercetageData = [0, 0, 0];
                    $scope.scaleColors = ['', '', ''];
                    var filteredProspectingGoals = [];
                    if ($scope.topBoxFilterOption.prospectingGoalIds.length > 0) {
                        filteredProspectingGoals = _.filter($scope.prospectingGoals, function (goalItem) {
                            var isExist = _.any($scope.topBoxFilterOption.prospectingGoalIds, function (item) {
                                return item.id == goalItem.id;
                            })
                            return isExist;
                        });
                    }
                    if ($scope.resultFilterOptionEnums.Total == $scope.topBoxFilterOption.topboxResultOptionId) {
                        _.each(filteredProspectingGoals, function (item, goalIndex) {
                            _.each(item.calculatedProspectingGoals, function (goalItem, index) {
                                if ($scope.TotalGoalData[index] != undefined) {
                                    $scope.TotalGoalData[index] += goalItem.total;
                                    $scope.RemainingTotalGoalData[index] += (goalItem.total - goalItem.totalResult);

                                }
                                else {
                                    $scope.TotalGoalData.push(goalItem.total);
                                }

                                if ($scope.TotalResultData[index] != undefined) {
                                    $scope.TotalResultData[index] += goalItem.totalResult;
                                }
                                else {
                                    $scope.TotalResultData.push(goalItem.totalResult);
                                }
                            });
                            _.each(item.currentPerformanceGoals, function (goalItem, index) {
                                if ($scope.CurrentPerformanceTotalGoalData[index] != undefined) {
                                    $scope.CurrentPerformanceTotalGoalData[index] += goalItem.total;
                                }
                                else {
                                    $scope.CurrentPerformanceTotalGoalData.push(goalItem.total);
                                }
                            });
                        });
                    }
                    else if ($scope.resultFilterOptionEnums.Monthly == $scope.topBoxFilterOption.topboxResultOptionId) {
                        _.each(filteredProspectingGoals, function (item, goalIndex) {
                            _.each(item.adjustedGoals, function (goalItem, index) {
                                if ($scope.TotalGoalData[index] != undefined) {
                                    $scope.TotalGoalData[index] += goalItem.monthly;
                                    $scope.RemainingTotalGoalData[index] += (goalItem.monthly - goalItem.monthlyResult);
                                }
                                else {
                                    $scope.TotalGoalData.push(goalItem.monthly);
                                    $scope.RemainingTotalGoalData.push(goalItem.monthly - goalItem.monthlyResult);
                                }

                                if ($scope.TotalResultData[index] != undefined) {
                                    $scope.TotalResultData[index] += goalItem.monthlyResult;
                                }
                                else {
                                    $scope.TotalResultData.push(goalItem.monthlyResult);
                                }
                            });

                            _.each(item.currentPerformanceGoals, function (goalItem, index) {
                                if ($scope.CurrentPerformanceTotalGoalData[index] != undefined) {
                                    $scope.CurrentPerformanceTotalGoalData[index] += goalItem.monthly;
                                }
                                else {
                                    $scope.CurrentPerformanceTotalGoalData.push(goalItem.monthly);
                                }
                            });
                        });
                    }
                    else if ($scope.resultFilterOptionEnums.Weekly == $scope.topBoxFilterOption.topboxResultOptionId) {
                        _.each(filteredProspectingGoals, function (item, goalIndex) {
                            _.each(item.adjustedGoals, function (goalItem, index) {
                                if ($scope.TotalGoalData[index] != undefined) {
                                    $scope.TotalGoalData[index] += goalItem.weekly;
                                    $scope.RemainingTotalGoalData[index] += (goalItem.weekly - goalItem.weeklyResult);
                                }
                                else {
                                    $scope.TotalGoalData.push(goalItem.weekly);
                                    $scope.RemainingTotalGoalData.push(goalItem.weekly - goalItem.weeklyResult);
                                }

                                if ($scope.TotalResultData[index] != undefined) {
                                    $scope.TotalResultData[index] += goalItem.weeklyResult;
                                }
                                else {
                                    $scope.TotalResultData.push(goalItem.weeklyResult);
                                }
                            });

                            _.each(item.currentPerformanceGoals, function (goalItem, index) {
                                if ($scope.CurrentPerformanceTotalGoalData[index] != undefined) {
                                    $scope.CurrentPerformanceTotalGoalData[index] += goalItem.weekly;
                                }
                                else {
                                    $scope.CurrentPerformanceTotalGoalData.push(goalItem.weekly);
                                }
                            })

                        });
                    }
                    else if ($scope.resultFilterOptionEnums.Today == $scope.topBoxFilterOption.topboxResultOptionId) {
                        _.each(filteredProspectingGoals, function (item, goalIndex) {
                            _.each(item.adjustedGoals, function (goalItem, index) {
                                if ($scope.TotalGoalData[index] != undefined) {
                                    $scope.TotalGoalData[index] += goalItem.daily;
                                    $scope.RemainingTotalGoalData[index] += (goalItem.daily - goalItem.dailyResult);
                                }
                                else {
                                    $scope.TotalGoalData.push(goalItem.daily);
                                    $scope.RemainingTotalGoalData.push(goalItem.daily - goalItem.dailyResult);
                                }

                                if ($scope.TotalResultData[index] != undefined) {
                                    $scope.TotalResultData[index] += goalItem.dailyResult;
                                }
                                else {
                                    $scope.TotalResultData.push(goalItem.dailyResult);
                                }
                            })

                            _.each(item.currentPerformanceGoals, function (goalItem, index) {
                                if ($scope.CurrentPerformanceTotalGoalData[index] != undefined) {
                                    $scope.CurrentPerformanceTotalGoalData[index] += goalItem.daily;
                                }
                                else {
                                    $scope.CurrentPerformanceTotalGoalData.push(goalItem.daily);
                                }
                            })
                        });
                    }
                    for (i = 0; i < $scope.TotalGoalData.length; i++) {
                        var avg = 0
                        if ($scope.TotalResultData[i] != undefined) {
                            $scope.TotalResultData[i] = Math.round(parseFloat($scope.TotalResultData[i]).toFixed(2) * 100) / 100;
                        }
                        if ($scope.TotalGoalData[i] != undefined) {
                            $scope.TotalGoalData[i] = Math.round(parseFloat($scope.TotalGoalData[i]).toFixed(2) * 100) / 100;
                        }

                        if (!isNaN($scope.TotalResultData[i] / $scope.TotalGoalData[i])) {
                            avg = parseFloat(($scope.TotalResultData[i] / $scope.TotalGoalData[i]) * 100).toFixed(2)
                        }
                        avg = Math.round(avg * 100) / 100;
                        if ($scope.TotalPercetageData[i] != undefined) {
                            $scope.TotalPercetageData[i] = avg;
                        }
                        else {
                            $scope.TotalPercetageData.push(avg);
                        }
                    }
                    for (i = 0; i < $scope.TotalGoalData.length; i++) {
                        var avg = 0
                        if ($scope.TotalResultData[i] != undefined) {
                            $scope.TotalResultData[i] = Math.round(parseFloat($scope.TotalResultData[i]).toFixed(2) * 100) / 100;
                        }
                        if ($scope.RemainingTotalGoalData[i] != undefined) {
                            $scope.RemainingTotalGoalData[i] = Math.round(parseFloat($scope.RemainingTotalGoalData[i]).toFixed(2) * 100) / 100;
                        }

                        if (!isNaN($scope.TotalResultData[i] / $scope.RemainingTotalGoalData[i])) {
                            avg = parseFloat(($scope.TotalResultData[i] / $scope.RemainingTotalGoalData[i]) * 100).toFixed(2)
                        }
                        avg = Math.round(avg * 100) / 100;
                        if ($scope.AdgustedPercetageData[i] != undefined) {
                            $scope.AdgustedPercetageData[i] = avg;
                        }
                        else {
                            $scope.AdgustedPercetageData.push(avg);
                        }
                    }
                    for (i = 0; i < $scope.TotalGoalData.length; i++) {
                        var avg = 0
                        if ($scope.TotalResultData[i] != undefined) {
                            $scope.TotalResultData[i] = Math.round(parseFloat($scope.TotalResultData[i]).toFixed(2) * 100) / 100;
                        }
                        if ($scope.CurrentPerformanceTotalGoalData[i] != undefined) {
                            $scope.CurrentPerformanceTotalGoalData[i] = Math.round(parseFloat($scope.CurrentPerformanceTotalGoalData[i]).toFixed(2) * 100) / 100;
                        }

                        if (!isNaN($scope.TotalResultData[i] / $scope.CurrentPerformanceTotalGoalData[i])) {
                            avg = parseFloat(($scope.TotalResultData[i] / $scope.CurrentPerformanceTotalGoalData[i]) * 100).toFixed(2)
                        }
                        avg = Math.round(avg * 100) / 100;
                        if ($scope.CurrentPerformancePercetageData[i] != undefined) {
                            $scope.CurrentPerformancePercetageData[i] = avg;
                        }
                        else {
                            $scope.CurrentPerformancePercetageData.push(avg);
                        }
                    }
                }

                $scope.prospectingGoalFilterChanged = function (goalId) {
                    $scope.prospectingGoalActivities = [];
                    $scope.prospectingGoalFilterText = null;
                    var prospectingGoalInfo = _.find($scope.prospectingGoals, function (item) {
                        return item.id == goalId;
                    });
                    if (prospectingGoalInfo) {
                        $scope.prospectingGoalFilterText = prospectingGoalInfo.name;
                        $scope.prospectingGoalActivities = [];
                        _.each($scope.prospectingGoalActivityInfoes, function (goalActivityInfoItem) {
                            if (goalActivityInfoItem.prospectingGoalId == prospectingGoalInfo.id) {
                                _.each(goalActivityInfoItem.prospectingActivities, function (item) {
                                    item["status"] = null;
                                    if (item.stopTime) {
                                        item.status = $translate.instant('COMMON_COMPLETED');
                                    }
                                    else {
                                        if (kendo.parseDate(item.activityEnd) < $scope.today) {
                                            item.status = $translate.instant('COMMON_EXPIRED');
                                        }
                                        else if (kendo.parseDate(item.activityStart) >= $scope.endOfDay) {
                                            item.status = $translate.instant('COMMON_UPCOMING');
                                        }
                                        else {
                                            item.status = $translate.instant('CMS_ACTIVE');
                                        }
                                    }
                                    $scope.prospectingGoalActivities.push(item)
                                })
                            }
                        })
                    }
                }
                $scope.prospectingActivityFilterChanged = function (prospectingActivityId) {
                    var prospectingActivity = null;
                    _.each($scope.prospectingGoalActivityInfoes, function (goalActivityInfoItem) {
                        if (goalActivityInfoItem) {
                            _.each(goalActivityInfoItem.prospectingActivities, function (item) {
                                if (item.id == prospectingActivityId) {
                                    prospectingActivity = item;
                                }
                            });
                        }
                    })
                    if (prospectingActivity) {
                        $scope.prospectingActivityFilterForResult = prospectingActivity;
                        $scope.prospectingActivityFilterText = prospectingActivity.name;
                        $scope.prospectingActivityFilterStartDate = prospectingActivity.activityStart;
                        $scope.prospectingActivityFilterEndDate = prospectingActivity.activityEnd;
                        $scope.isViewActivityDetail = true;
                        $scope.viewProspectingActivityResultData = [];
                        serviceProspectingManager.getProsepectingActivityResultData(prospectingActivityId).then(function (data) {
                            $scope.viewProspectingActivityResultData = data;
                        })
                    }
                }
                $scope.ActivityProspectingGoalFilterChanged = function (id) {
                    if (!$scope.isActivityStart) {
                        $scope.activityProspectingGoalFilterText = $translate.instant('COMMON_ALL');
                        $scope.FilterActivityProspectingGoalId = null;
                        var prospectingGoal = _.find($scope.prospectingGoals, function (data) {
                            return data.id == id;
                        });
                        if (prospectingGoal) {
                            $scope.activityProspectingGoalFilterText = prospectingGoal.name;
                            $scope.FilterActivityProspectingGoalId = id;
                        }
                    }
                    else {
                        dialogService.showNotification($translate.instant('TASKPROSPECTING_YOU_CANT_FILTER_AT_THIS_MOMENT_BECAUSE_YOU_HAVE_STARTED_ACTIVITY'), 'warning');
                    }
                }
                $scope.ActivityFilterOptionsEnum = {
                    Today: 1,
                    UpComing: 2,
                    Expired: 3,
                    Weekly: 4,
                    Monthly: 5,
                };
                $scope.ActivityFilterOptions = [{
                    value: 1,
                    name: $translate.instant('COMMON_TODAY')
                },
                {
                    value: 2,
                    name: $translate.instant('COMMON_UP_COMING')
                },
                {
                    value: 3,
                    name: $translate.instant('COMMON_EXPIRED')
                },
                {
                    value: 4,
                    name: $translate.instant('COMMON_THIS_WEEK')
                },
                {
                    value: 5,
                    name: $translate.instant('COMMON_THIS_MONTH')
                }]
                $scope.activityFilterText = $translate.instant('COMMON_TODAY');
                $scope.activityFilterValue = $scope.ActivityFilterOptionsEnum.Today;
                $scope.ActivityFilterChanged = function (value) {
                    if (!$scope.isActivityStart) {
                        $scope.activityFilterText = $translate.instant('COMMON_ALL');
                        $scope.activityFilterValue = value;
                        if (value == $scope.ActivityFilterOptionsEnum.Today) {
                            $scope.activityFilterText = $translate.instant('COMMON_TODAY');
                        }
                        if (value == $scope.ActivityFilterOptionsEnum.UpComing) {
                            $scope.activityFilterText = $translate.instant('COMMON_UP_COMING');
                        }
                        if (value == $scope.ActivityFilterOptionsEnum.Expired) {
                            $scope.activityFilterText = $translate.instant('COMMON_EXPIRED');
                        }
                        if (value == $scope.ActivityFilterOptionsEnum.Weekly) {
                            $scope.activityFilterText = $translate.instant('COMMON_THIS_WEEK');
                        }
                        if (value == $scope.ActivityFilterOptionsEnum.Monthly) {
                            $scope.activityFilterText = $translate.instant('COMMON_THIS_MONTH');
                        }
                    }
                    else {
                        dialogService.showNotification($translate.instant('TASKPROSPECTING_YOU_CANT_FILTER_AT_THIS_MOMENT_BECAUSE_YOU_HAVE_STARTED_ACTIVITY'), 'warning');
                    }
                }

                $scope.showFilteredProspectingGoals = function (item) {
                    if ($scope.topBoxFilterOption.prospectingGoalIds.length > 0) {
                        var isExist = _.any($scope.topBoxFilterOption.prospectingGoalIds, function (selectedProspectingGoalItem) {
                            return selectedProspectingGoalItem.id == item.id;
                        })
                        if (isExist) {
                            if ($scope.selectedProjectMembers.length > 0 && $scope.topBoxFilterOption.userId == 0) {
                                var userIds = _.map($scope.selectedProjectMembers, function (item) {
                                    return item.id;
                                });
                                if (userIds.indexOf(item.userId) > -1) {
                                    return true;
                                }
                                else {
                                    return false;
                                }
                            }
                            else {
                                return true;
                            }
                        }
                        else {
                            return false;
                        }
                    }
                    else {
                        if ($scope.selectedProjectMembers.length > 0 && $scope.topBoxFilterOption.userId == 0) {
                            var userIds = _.map($scope.selectedProjectMembers, function (item) {
                                return item.id;
                            });
                            if (userIds.indexOf(item.userId) > -1) {
                                return true;
                            }
                            else {
                                return false;
                            }
                        }
                        else {
                            return true;
                        }
                    }
                }
                $scope.showFilteredTodos = function (item) {
                    if ($scope.topBoxFilterOption.prospectingGoalIds.length == 0) {
                        return true;
                    }
                    else {
                        var filteredProspectingGoalTaskIds = [];
                        _.each($scope.prospectingGoals, function (goalItem) {
                            var isExist = _.any($scope.topBoxFilterOption.prospectingGoalIds, function (selectedGoalItem) {
                                return selectedGoalItem.id == goalItem.id;
                            });
                            if (isExist) {
                                filteredProspectingGoalTaskIds.push(goalItem.taskId);
                            }
                        });
                        if (filteredProspectingGoalTaskIds.indexOf(item.id) > -1) {
                            return true;
                        }
                        else {
                            return false;
                        }
                    }
                }
                $scope.showFilteredPostTodos = function (item) {
                    if ($scope.topBoxFilterOption.prospectingGoalIds.length == 0) {
                        return true;
                    }
                    else {
                        var filteredProspectingGoalTaskIds = [];
                        _.each($scope.prospectingGoals, function (goalItem) {
                            var isExist = _.any($scope.topBoxFilterOption.prospectingGoalIds, function (selectedGoalItem) {
                                return selectedGoalItem.id == goalItem.id;
                            });
                            if (isExist) {
                                filteredProspectingGoalTaskIds.push(goalItem.taskId);
                            }
                        });
                        if (filteredProspectingGoalTaskIds.indexOf(item.id) > -1) {
                            if (moment(kendo.parseDate(item.dueDate)).isBefore(moment($scope.today))) {
                                return true;
                            }
                        }
                        else {
                            return false;
                        }
                    }
                }
                $scope.showFilteredResultTypes = function (item) {
                    var result = true;
                    if ($scope.topBoxFilterOption.topboxResultOptionId == $scope.resultFilterOptionEnums.Today) {
                        if (item.id == $scope.topboxResultTypeEnum.CurrentPerformanceResult || item.id == $scope.topboxResultTypeEnum.CurrentPerformancePercentage) {
                            result = false;
                        }
                    }
                    return result;
                }
                $scope.showFilteredProspectingCustomers = function (item) {
                    if ($scope.topBoxFilterOption.prospectingGoalIds.length == 0) {
                        return true;
                    }
                    else {
                        var isExist = _.any($scope.topBoxFilterOption.prospectingGoalIds, function (selectedProspectingGoalItem) {
                            return selectedProspectingGoalItem.id == item.prospectingGoalId;
                        });
                        if (isExist) {
                            return true;
                        }
                        else {
                            return false;
                        }
                    }
                }
                $scope.showFilteredProspectingGoalActivityInfoes = function (item) {
                    if ($scope.topBoxFilterOption.prospectingGoalIds.length > 0) {
                        var isExist = _.any($scope.topBoxFilterOption.prospectingGoalIds, function (selectedProspectingGoalItem) {
                            return selectedProspectingGoalItem.id == item.prospectingGoalId;
                        });
                        if (isExist) {
                            return true;
                        }
                        else {
                            return false;
                        }
                    }
                    else if ($scope.FilterActivityProspectingGoalId) {
                        if (item.prospectingGoalId == $scope.FilterActivityProspectingGoalId) {
                            return true;
                        }
                        else {
                            return false;
                        }
                    }
                    else {
                        var isProspectingExist = _.any($scope.prospectingGoals, function (dataItem) {
                            return dataItem.id == item.prospectingGoalId;
                        })
                        return isProspectingExist;
                    }
                }
                $scope.showFilteredProspectingGoalActivities = function (item) {

                    if ($scope.activityFilterValue) {
                        if ($scope.activityFilterValue == $scope.ActivityFilterOptionsEnum.Today) {
                            if (kendo.parseDate(item.activityStart) >= $scope.today && kendo.parseDate(item.activityStart) < $scope.endOfDay) {
                                return true;
                            }
                            else {
                                return false;
                            }
                        }
                        else if ($scope.activityFilterValue == $scope.ActivityFilterOptionsEnum.UpComing) {
                            if (kendo.parseDate(item.activityStart) > $scope.endOfDay) {
                                return true;
                            }
                            else {
                                return false;
                            }
                        }
                        else if ($scope.activityFilterValue == $scope.ActivityFilterOptionsEnum.Expired) {
                            if (kendo.parseDate(item.activityEnd) <= $scope.today) {
                                return true;
                            }
                            else {
                                return false;
                            }
                        }
                        else if ($scope.activityFilterValue == $scope.ActivityFilterOptionsEnum.Weekly) {
                            if (kendo.parseDate(item.activityStart) >= kendo.parseDate($scope.weekStartDate) && kendo.parseDate(item.activityEnd) <= kendo.parseDate($scope.weekEndDate)) {
                                return true;
                            }
                            else {
                                return false;
                            }
                        }
                        else if ($scope.activityFilterValue == $scope.ActivityFilterOptionsEnum.Monthly) {
                            if (kendo.parseDate(item.activityStart) >= kendo.parseDate($scope.monthStartDate) && kendo.parseDate(item.activityEnd) <= kendo.parseDate($scope.monthEndDate)) {
                                return true;
                            }
                            else {
                                return false;
                            }
                        }
                        else {
                            return true;
                        }
                    }
                    else {
                        return true;
                    }
                }

                $scope.isAllowedToShow = function (userId) {
                    if ($scope.currentUser.userId == userId) {
                        return true;
                    }
                    else {
                        var currentUserInProject = _.find($scope.allMembers, function (item) {
                            return item.user.id == $scope.currentUser.userId;
                        });
                        if (currentUserInProject) {
                            if (currentUserInProject.roleId == projectRolesEnum.projectManager) {
                                return true;
                            }
                            else {
                                return false;
                            }
                        }
                        else {
                            return false;
                        }
                    }
                }
                $scope.isForCurrentUserOnly = function () {
                    if ($scope.currentUser.userId == $scope.topBoxFilterOption.userId) {
                        return true;
                    }
                    else {
                        return false;
                    }
                }
                $scope.isAllowedToManager = function () {
                    var currentUserInProject = _.find($scope.allMembers, function (item) {
                        return item.user.id == $scope.currentUser.userId;
                    });
                    if (currentUserInProject) {
                        if (currentUserInProject.roleId == projectRolesEnum.projectManager) {
                            return true;
                        }
                        else {
                            return false;
                        }
                    }
                    else {
                        return false;
                    }
                }

                $scope.viewActivityDetail = function (goalId, activityId) {
                    $scope.isViewActivityDetail = true;
                    if (goalId && activityId) {
                        $scope.prospectingGoalFilterChanged(goalId);
                        $scope.prospectingActivityFilterChanged(activityId);
                    }
                }
                $scope.restartActivityDetail = function (goalId, activityId) {
                    dialogService.showYesNoDialog($translate.instant('MYPROJECTS_CONFIRM'), $translate.instant('TASKPROSPECTING_ARE_YOU_SURE_YOU_WANT_TO_RESTART_THIS_ACTIVITY')).then(function () {
                        var currentTime = new Date();
                        var activityLogInfo = {
                            prospectingActivityId: activityId,
                            event: "ReStart",
                            eventTime: currentTime,
                        };
                        serviceProspectingManager.saveActivityLog(activityLogInfo).then(function () {

                        });
                        serviceProspectingManager.restartProspectingActivity(activityId).then(function (data) {
                            if (data) {
                                var prospectingGoalActivityInfo = _.find($scope.prospectingGoalActivityInfoes, function (dataItem) {
                                    return dataItem.prospectingGoalId == goalId;
                                });
                                if (prospectingGoalActivityInfo) {
                                    var activityInfo = _.find(prospectingGoalActivityInfo.prospectingActivities, function (dataItem) {
                                        return dataItem.id == activityId;
                                    });
                                    if (activityInfo) {
                                        activityInfo["stopTime"] = null;
                                    }
                                }
                            }
                        })
                    }, function () {
                    });
                }
                $scope.calculateActivities = function () {
                    moment.locale(globalVariables.lang.currentUICulture);
                    if (!($scope.prospectingGoalActivityInfo.prospectingActivities)) {
                        $scope.prospectingGoalActivityInfo["prospectingActivities"] = [];
                    }
                    if (!($scope.prospectingGoalActivityInfo.prospectingActivities.length > 0 && $scope.prospectingGoalActivityInfo.id > 0)) {
                        $scope.prospectingActivities = [];

                        if ($scope.prospectingGoalActivityInfo.totalActivities > 0 && $scope.prospectingGoalActivityInfo.activityTime > 0 && $scope.prospectingGoalActivityInfo.activityStartTime != null) {

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
                $scope.calculateRecurrenceActivity = function () {
                    moment.locale(globalVariables.lang.currentUICulture);
                    if (!($scope.prospectingGoalActivityInfo.prospectingActivities)) {
                        $scope.prospectingGoalActivityInfo["prospectingActivities"] = [];
                    }
                    if (!($scope.prospectingGoalActivityInfo.prospectingActivities.length > 0 && $scope.prospectingGoalActivityInfo.id > 0)) {
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
                        $scope.prospectingGoalActivityInfo.totalActivities = occurrences.length;
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
                $scope.calculateActivityResult = function () {
                    _.each($scope.prospectingGoals, function (goalItem) {
                        serviceProspectingManager.getSkillsByProspectingGoalId(goalItem.id).then(function (data) {
                            data = _.sortBy(data, 'seqNo');
                            var profileSkills = data;
                            _.each(goalItem.prospectingSkillGoals, function (dataItem) {
                                var skillinfo = _.find(profileSkills, function (skillItem) {
                                    return skillItem.id == dataItem.skillId;
                                });
                                if (skillinfo) {
                                    var skillResult = _.filter($scope.prospectingActivityCustomerResults, function (resultItem) {
                                        return resultItem.skillId == skillinfo.id && resultItem.prospectingCustomer.prospectingGoalId == dataItem.prospectingGoalId;
                                    });
                                    dataItem["result"] = skillResult.length;
                                    dataItem["seqNo"] = skillinfo.seqNo;
                                }
                            });

                        });

                        var prospectingGoalActivities = [];

                        _.each($scope.prospectingGoalActivityInfoes, function (goalActivityInfoItem) {
                            if (goalActivityInfoItem.prospectingGoalId == goalItem.id) {
                                _.each(goalActivityInfoItem.prospectingActivities, function (item) {
                                    prospectingGoalActivities.push(item)
                                });
                            }
                        });
                        $scope.CalculateGoalByGoalId(goalItem.id);
                        $scope.CalculateAdjustedGoalByGoalId(goalItem.id);
                        $scope.CalculateCurrentPerformanceGoalByGoalId(goalItem.id);
                        $scope.calculatingGoalResultSummary = true;
                        serviceProspectingManager.GetProspectingGoalResultSummaryByGoalId(goalItem.id).then(function (summaryData) {
                            if (summaryData) {
                                var prospectingGoal = _.find($scope.prospectingGoals, function (item) {
                                    return item.id == summaryData.prospectingGoalId;
                                });
                                if (prospectingGoal) {
                                    if (prospectingGoal.calculatedProspectingGoals) {
                                        _.each(prospectingGoal.calculatedProspectingGoals, function (goalitem) {
                                            // weeklyResult
                                            var weeklyResult = _.find(summaryData.weeklyResult[0].prospectingSkillGoalResults, function (item) {
                                                return item.skillId == goalitem.skillId;
                                            });
                                            if (weeklyResult) {
                                                goalitem.weeklyResult = weeklyResult.count;
                                            }
                                            // monthlyResult
                                            var monthlyResult = _.find(summaryData.monthlyResult[0].prospectingSkillGoalResults, function (item) {
                                                return item.skillId == goalitem.skillId;
                                            });
                                            if (monthlyResult) {
                                                goalitem.monthlyResult = monthlyResult.count;
                                            }
                                            // todayResult
                                            var todayResult = _.find(summaryData.todayResult[0].prospectingSkillGoalResults, function (item) {
                                                return item.skillId == goalitem.skillId;
                                            });
                                            if (todayResult) {
                                                goalitem.dailyResult = todayResult.count;
                                            }
                                        })
                                    }
                                    if (prospectingGoal.adjustedGoals) {
                                        _.each(prospectingGoal.adjustedGoals, function (goalitem) {
                                            // weeklyResult
                                            var weeklyResult = _.find(summaryData.weeklyResult[0].prospectingSkillGoalResults, function (item) {
                                                return item.skillId == goalitem.skillId;
                                            });
                                            if (weeklyResult) {
                                                goalitem.weeklyResult = weeklyResult.count;
                                            }
                                            // monthlyResult
                                            var monthlyResult = _.find(summaryData.monthlyResult[0].prospectingSkillGoalResults, function (item) {
                                                return item.skillId == goalitem.skillId;
                                            });
                                            if (monthlyResult) {
                                                goalitem.monthlyResult = monthlyResult.count;
                                            }
                                            // todayResult
                                            var todayResult = _.find(summaryData.todayResult[0].prospectingSkillGoalResults, function (item) {
                                                return item.skillId == goalitem.skillId;
                                            });
                                            if (todayResult) {
                                                goalitem.dailyResult = todayResult.count;
                                            }
                                        })
                                    }
                                    if (prospectingGoal.currentPerformanceGoals) {
                                        _.each(prospectingGoal.currentPerformanceGoals, function (goalitem) {
                                            // weeklyResult
                                            var weeklyResult = _.find(summaryData.weeklyResult[0].prospectingSkillGoalResults, function (item) {
                                                return item.skillId == goalitem.skillId;
                                            });
                                            if (weeklyResult) {
                                                goalitem.weeklyResult = weeklyResult.count;
                                            }
                                            // monthlyResult
                                            var monthlyResult = _.find(summaryData.monthlyResult[0].prospectingSkillGoalResults, function (item) {
                                                return item.skillId == goalitem.skillId;
                                            });
                                            if (monthlyResult) {
                                                goalitem.monthlyResult = monthlyResult.count;
                                            }
                                            // todayResult
                                            var todayResult = _.find(summaryData.todayResult[0].prospectingSkillGoalResults, function (item) {
                                                return item.skillId == goalitem.skillId;
                                            });
                                            if (todayResult) {
                                                goalitem.dailyResult = todayResult.count;
                                            }
                                        })
                                    }
                                }
                            }
                            $scope.calculatingGoalResultSummary = false;
                        });
                        if ($scope.selectedprospectingActivity) {
                            $scope.selectProspectingActivity($scope.selectedprospectingActivity.id);
                        }
                        else {
                            $scope.selectProspectingActivity(null)
                        }


                    })
                }
                // Popups
                //Tasks
                $scope.taskFeedback = {
                    trainingId: 0,
                    rating: 0,
                    workedWell: "",
                    workedNotWell: "",
                    ratingDescription: "",
                    whatNextDescription: "",
                    taskId: 0,
                    timeSpentMinutes: 0,
                    recurrencesStartTime: null,
                    recurrencesEndTime: null,
                };
                $scope.openTaskDetailPopupMode = {
                    isPopupOpen: false
                }

                $scope.openTaskDetail = function (Id) {

                    if (Id > 0) {
                        var html = '<div><task-detail-popup task-detail="taskDetail"' +
                            'task-categories="taskCategories"' +
                            'task-statuses="taskStatuses"' +
                            'task-priorities="taskPriorities"' +
                            'notification-templates="notificationTemplates"' +
                            'open-task-detail-popup-mode="openTaskDetailPopupMode">' +
                            '</task-detail-popup></div>';

                        var linkFn = $compile(html);
                        var content = linkFn($scope);
                        $("#home-task-detail-popup-div").html(content);
                        todosManager.getTaskById(Id).then(function (data) {
                            todosManager.getTaskListById(data.taskListId).then(function (taskListData) {
                                $scope.taskCategories = [];
                                $scope.taskStatuses = [];
                                $scope.taskPriorities = [];
                                if (taskListData) {
                                    todosManager.getTaskCategoriesById(taskListData.taskCategoryListsId).then(function (result) {
                                        if (result) {
                                            if (result.taskCategoryListItems) {
                                                $scope.taskCategories = result.taskCategoryListItems;
                                            }
                                        }
                                    });

                                    todosManager.getTaskStatusesById(taskListData.taskStatusListId).then(function (result) {
                                        if (result) {
                                            if (result.taskStatusListItems) {
                                                $scope.taskStatuses = result.taskStatusListItems;
                                            }
                                        }
                                    });

                                    todosManager.getTaskPrioritiesById(taskListData.taskPriorityListId).then(function (result) {
                                        if (result) {
                                            if (result.taskPriorityListItems) {
                                                $scope.taskPriorities = result.taskPriorityListItems;
                                            }
                                        }
                                    })
                                }

                            });
                            todosManager.getNotificationTemplates().then(function (data) {
                                data.unshift({ id: null, name: $translate.instant('TASKPROSPECTING_SELECT_TEMPLATE') });
                                $scope.notificationTemplates = data;
                            });
                            data.viewName = data.title;
                            moment.locale(globalVariables.lang.currentUICulture);
                            data.startDate = data.startDate ? moment(kendo.parseDate(data.startDate)).format("L LT") : "";
                            data.dueDate = data.dueDate ? moment(kendo.parseDate(data.dueDate)).format("L LT") : "";
                            //data.startDate = data.startDate;
                            //data.dueDate = data.dueDate;
                            $scope.taskDetail = data;
                            $scope.taskDetail.timeEstimateMinutes = $scope.taskDetail.timeEstimateMinutes == null ? 0 : $scope.taskDetail.timeEstimateMinutes;
                            $scope.taskDetail.timeSpentMinutes = $scope.taskDetail.timeSpentMinutes == null ? 0 : $scope.taskDetail.timeSpentMinutes;
                            $scope.openTaskDetailPopupMode.isPopupOpen = true;
                        });

                    }
                }
                $scope.completeTask = function (id) {
                    var filteritem = _.filter($scope.taskTodos, function (todoItem) {
                        return todoItem.id == id;
                    });
                    var item = null;
                    if (filteritem.length > 0) {
                        item = filteritem[0];
                    }
                    if (item) {
                        if (!(item.frequency)) {
                            if (item.recurrenceRule) {
                                item.frequency = item.recurrenceRule;
                            }
                        }
                        if (item.frequency.indexOf("FREQ") == 0) {
                            if (item.id == id) {
                                item.isCompleted = true;
                                todosManager.isCompleted(id, item.isCompleted).then(function (data) {
                                    if (item.isCompleted) {
                                        $scope.taskFeedback.trainingId = item.trainingId;
                                        $scope.taskFeedback.taskId = id;
                                        $scope.taskFeedback.workedWell = $translate.instant('SERVICE_PROSPECTING_TASK_COMPLETED')
                                        $scope.taskFeedback.recurrencesStartTime = item.startDate;
                                        $scope.taskFeedback.recurrencesEndTime = item.dueDate;
                                        $scope.taskFeedback.recurrencesRule = item.recurrenceRule;
                                        todoManager.getTaskScaleRatingByUserId(item.assignedToId).then(function (data) {
                                            $scope.ratings = [];
                                            if (data.length > 0) {
                                                _.forEach(data, function (item) {
                                                    if (item.min == item.max) {
                                                        $scope.ratings.push({ value: item.min, background: item.color })
                                                    }
                                                    else {
                                                        for (var i = item.min; i <= item.max; i++) {
                                                            $scope.ratings.push({ value: i, background: item.color })
                                                        }
                                                    }
                                                });
                                            }
                                            else {
                                                $scope.ratings.push({ value: 1, background: "#f00" });
                                                $scope.ratings.push({ value: 2, background: "#ff0" });
                                                $scope.ratings.push({ value: 3, background: "#0f3" });
                                                $scope.ratings.push({ value: 4, background: "#06f" });
                                                $scope.ratings.push({ value: 5, background: "#f99" });
                                            }
                                            $("#taskFeedbackModal").modal("show");
                                            //vm.taskScale.taskScaleRanges = data.taskScaleRanges;
                                        }, function () {
                                            $scope.ratings = [];
                                            $scope.ratings.push({ value: 1, background: "#f00" });
                                            $scope.ratings.push({ value: 2, background: "#ff0" });
                                            $scope.ratings.push({ value: 3, background: "#0f3" });
                                            $scope.ratings.push({ value: 4, background: "#06f" });
                                            $scope.ratings.push({ value: 5, background: "#f99" });
                                            $("#taskFeedbackModal").modal("show");
                                        });
                                    }
                                });
                            }
                        }
                        else {
                            todosManager.isCompleted(id, true).then(function (data) {
                                if (data) {
                                    item.isCompleted = true;
                                }
                            });
                        }
                    }
                }
                $scope.starMouseHover = function (el) {
                    var onStar = parseInt($(el.target).data('value'), 10); // The star currently mouse on
                    // Now highlight all the stars that's not after the current hovered star
                    $(el.target).parents("#taskRatingStars").children('li.star').each(function (e) {
                        if (e < onStar) {
                            $(this).addClass('hover');
                        }
                        else {
                            $(this).removeClass('hover');
                        }
                    });

                }
                $scope.starMouseOut = function (el) {
                    $(el.target).parents("#taskRatingStars").children('li.star').each(function (e) {
                        $(this).removeClass('hover');
                    });
                }
                $scope.ratingCSS = function (starValue, ratingValue) {
                    if (starValue <= ratingValue) {
                        return "selected";
                    }
                }
                /* 2. Action to perform on click */
                $scope.starClick = function (el) {
                    var onStar = parseInt($(el.target).data('value'), 10); // The star currently selected
                    var stars = $(el.target).parents("#taskRatingStars").children('li.star');
                    for (var i = 0; i < stars.length; i++) {
                        $(stars[i]).removeClass('selected');
                    }
                    for (var i = 0; i < onStar; i++) {
                        $(stars[i]).addClass('selected');
                    }
                    var ratingValue = parseInt($('#taskRatingStars li.selected label').last().data('value'), 10);
                    if (ratingValue > 1) {
                        $scope.taskFeedback.rating = ratingValue;;
                    }
                    else {
                        $scope.taskFeedback.rating = 0;
                    }
                };
                $scope.saveTaskFeedback = saveTaskFeedback;
                $scope.cancelTaskFeedback = cancelTaskFeedback;
                function saveTaskFeedback() {
                    if ($scope.taskFeedback.trainingId == 0) {
                        $scope.taskFeedback.trainingId = null;
                    }
                    todosManager.saveTraningFeedback($scope.taskFeedback).then(function (data) {
                        if (data.id > 0) {
                            $("#taskFeedbackModal").modal('hide');
                            dialogService.showNotification($translate.instant('TASKPROSPECTING_PROSPECTING_ACTIVITY_FEEDBACK_SAVED_SUCCESSFULLY'), 'info');
                        }
                        else {
                            dialogService.showNotification($translate.instant('TASKPROSPECTING_FEEDBACK_NOT_SAVED'), 'warning');
                        }
                    });
                }
                function cancelTaskFeedback() {
                    if ($scope.taskFeedback.taskId) {
                        $("#taskFeedbackModal").modal('hide');
                        var item = _.find($scope.taskTodos, function (todoItem) {
                            return todoItem.id == $scope.taskFeedback.taskId;
                        })
                        if (item) {
                            item.isCompleted = false;
                        }
                    }
                }
                $scope.openProspectingGoalPopup = function () {
                    $scope.prospectingGoalInfo = {
                        id: 0,
                        name: null,
                        goalStartDate: null,
                        goalEndDate: null,
                        profileId: null,
                        profileName: "",
                        prospectingSkillGoals: [],
                        taskId: null,
                        recurrenceRule: null,
                        userId: null,
                        prospectingGoalScale: {
                            name: null,
                            description: null,
                            scaleCategoryId: null,
                            measureUnitId: null,
                            includeNotRelevant: false,
                            isTemplate: false,
                        },
                        prospectingType: prospectingTypesEnum.Service,
                    };
                    $scope.isProspectingGoalViewOnly = false;
                    $("#addProspectingGoalModal").modal("show");
                }
                $scope.changeProspectingGoalType = function () {
                    $scope.prospectingGoalInfo.profileName = null;
                    $scope.prospectingGoalInfo.projectName = null;
                    $scope.prospectingGoalInfo.projectId = null;
                    $scope.prospectingGoalInfo.userid = null;
                    $scope.prospectingGoalInfo.name = null;
                    $scope.prospectingGoalInfo.recurrenceRule = null;
                    $scope.prospectingGoalInfo.goalStartDate = null;
                    $scope.prospectingGoalInfo.goalEndDate = null;
                }
                $scope.ViewProspectingGoal = function (id) {
                    var prospectingGoalInfo = _.find($scope.prospectingGoals, function (item) {
                        return item.id == id;
                    });
                    if (prospectingGoalInfo) {
                        $scope.prospectingGoalInfo = _.clone(prospectingGoalInfo);
                        $scope.prospectingGoalInfo.goalStartDate = moment(kendo.parseDate($scope.prospectingGoalInfo.goalStartDate)).format('L LT');
                        $scope.prospectingGoalInfo.goalEndDate = moment(kendo.parseDate($scope.prospectingGoalInfo.goalEndDate)).format('L LT');
                        $scope.prospectingGoalInfo.prospectingSkillGoals = _.sortBy($scope.prospectingGoalInfo.prospectingSkillGoals, 'seqNo');
                        $scope.prospectingGoalSkills = $scope.prospectingGoalInfo.prospectingSkillGoals;
                        _.each($scope.prospectingGoalSkills, function (item) {
                            item.skill = {
                                id: item.skillId,
                                name: item.skillName
                            }
                            $scope.calculateProspectingSkillGoalByTotalGoal(item);
                        });

                        if ($scope.prospectingGoalInfo.profileId) {
                            $scope.prospectingGoalInfo.prospectingGoalTypeId = 1
                        }
                        else if ($scope.prospectingGoalInfo.taskId) {
                            $scope.prospectingGoalInfo.prospectingGoalTypeId = 3
                        }
                    }
                    $scope.isProspectingGoalViewOnly = true;
                    $("#addProspectingGoalModal").modal("show");
                }
                $scope.EditProspectingGoal = function (id) {
                    var prospectingGoalInfo = _.find($scope.prospectingGoals, function (item) {
                        return item.id == id;
                    });
                    $scope.isProspectingGoalViewOnly = false;
                    if (prospectingGoalInfo) {
                        $scope.prospectingGoalInfo = _.clone(prospectingGoalInfo);
                        $scope.prospectingGoalInfo.goalStartDate = moment(kendo.parseDate($scope.prospectingGoalInfo.goalStartDate)).format('L LT');
                        $scope.prospectingGoalInfo.goalEndDate = moment(kendo.parseDate($scope.prospectingGoalInfo.goalEndDate)).format('L LT');
                        $scope.prospectingGoalInfo.prospectingSkillGoals = _.sortBy($scope.prospectingGoalInfo.prospectingSkillGoals, 'seqNo');
                        if ($scope.prospectingGoalInfo.profileId) {
                            $scope.prospectingGoalInfo.prospectingGoalTypeId = 1
                        }
                        else if ($scope.prospectingGoalInfo.taskId) {
                            $scope.prospectingGoalInfo.prospectingGoalTypeId = 3
                            $scope.prospectingGoalInfo.prospectingSkillGoals = _.sortBy($scope.prospectingGoalInfo.prospectingSkillGoals, 'seqNo');
                            $scope.prospectingGoalSkills = $scope.prospectingGoalInfo.prospectingSkillGoals;
                            _.each($scope.prospectingGoalSkills, function (item) {
                                item.skill = {
                                    id: item.skillId,
                                    name: item.skillName
                                }
                                $scope.calculateProspectingSkillGoalByTotalGoal(item);
                            });
                        }
                    }
                    $("#addProspectingGoalModal").modal("show");
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
                        $scope.prospectingGoalInfo.profileName = null;
                        $scope.prospectingGoalInfo.projectName = null;
                        $scope.prospectingGoalInfo.projectId = null;
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
                                $scope.prospectingGoalInfo.profileName = null;

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
                                })
                                $("#addProspectingGoalModal").modal("hide");
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
                                    item.profileId = $scope.prospectingGoalInfo.profileId;
                                    item.profileName = $scope.prospectingGoalInfo.profileName;
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
                $scope.canceladdProspectingGoal = function () {
                    $("#addProspectingGoalModal").modal("hide");
                }
                $scope.isSkillGoalsInValid = function () {
                    var result = false;
                    $scope.goalErrors = [];
                    if ($scope.prospectingGoalInfo) {
                        for (var i = 0; i < $scope.prospectingGoalInfo.prospectingSkillGoals.length; i++) {
                            if ($scope.prospectingGoalInfo.prospectingSkillGoals[i] && $scope.prospectingGoalInfo.prospectingSkillGoals[i + 1]) {
                                if (!($scope.prospectingGoalInfo.prospectingSkillGoals[i].goal > $scope.prospectingGoalInfo.prospectingSkillGoals[i + 1].goal)) {
                                    $scope.goalErrors.push("'# of " + $scope.prospectingGoalInfo.prospectingSkillGoals[i + 1].skillName + "' not be more than '# of " + $scope.prospectingGoalInfo.prospectingSkillGoals[i].skillName + "'");
                                }
                            }
                        }
                    }
                    if ($scope.goalErrors.length > 0) {
                        result = true;
                    }
                    return result;
                }

                // 
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
                $scope.openAddActivity = function () {
                    $scope.prospectingGoalActivityInfo = {
                        id: 0,
                        profileId: 0,
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
                    $scope.prospectingGoalProfiles = [];
                    _.each($scope.prospectingGoals, function (goalsItem) {
                        $scope.prospectingGoalProfiles.push({ id: goalsItem.profileId, name: goalsItem.profileName, goalId: goalsItem.id });
                    });

                    $scope.prospectingGoalNames = [];
                    _.each($scope.prospectingGoals, function (goalsItem) {
                        $scope.prospectingGoalNames.push({ id: goalsItem.id, name: goalsItem.name });
                    });
                    $("#addActivityModal").modal("show");

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
                }
                $scope.actvityStartDateOpen = function (event) {
                    var datepicker = $(event.sender.element).data("kendoDateTimePicker");
                    datepicker.setOptions({
                        min: $scope.today,
                        max: kendo.parseDate($scope.prospectingGoalActivityInfo.activityEndTime),
                    });
                }
                $scope.actvityStartDateChange = function (event) {
                    $scope.prospectingGoalActivityInfo.activityStartTime = moment(event.sender.value()).format("L LT");
                    $scope.calculateActivities();
                }
                $scope.editActivity = function (goalActivityId, activityId) {
                    $scope.isActivityReadOnly = false;
                    $scope.prospectingActivity = null;
                    $scope.prospectingGoalActivityInfo = _.find($scope.prospectingGoalActivityInfoes, function (item) {
                        return item.id == goalActivityId;
                    });
                    if ($scope.prospectingGoalActivityInfo) {
                        $scope.prospectingGoalActivityInfo.activityStartTime = moment(kendo.parseDate($scope.prospectingGoalActivityInfo.activityStartTime)).format("L LT");
                        $scope.prospectingGoalActivityInfo.activityEndTime = moment(kendo.parseDate($scope.prospectingGoalActivityInfo.activityEndTime)).format("L LT");
                        var prospectingActivity = _.find($scope.prospectingGoalActivityInfo.prospectingActivities, function (item) {
                            return item.id == activityId;
                        });
                        if (prospectingActivity) {
                            $scope.prospectingActivity = _.clone(prospectingActivity);
                            $scope.prospectingActivity.activityStart = moment(kendo.parseDate($scope.prospectingActivity.activityStart)).format("L LT");
                            $scope.prospectingActivity.activityEnd = moment(kendo.parseDate($scope.prospectingActivity.activityEnd)).format("L LT");
                            $("#editActivityModal").modal("show");
                        }
                        else {
                            dialogService.showNotification($translate.instant('TASKPROSPECTING_ACTIVITY_NOT_FOUND'), 'warning');
                        }
                    }
                }
                $scope.viewActivity = function (goalActivityId, activityId) {
                    $scope.isActivityReadOnly = true;
                    $scope.prospectingActivity = null;
                    $scope.prospectingGoalActivityInfo = _.find($scope.prospectingGoalActivityInfoes, function (item) {
                        return item.id == goalActivityId;
                    });
                    if ($scope.prospectingGoalActivityInfo) {
                        $scope.prospectingGoalActivityInfo.activityStartTime = moment(kendo.parseDate($scope.prospectingGoalActivityInfo.activityStartTime)).format("L LT");
                        $scope.prospectingGoalActivityInfo.activityEndTime = moment(kendo.parseDate($scope.prospectingGoalActivityInfo.activityEndTime)).format("L LT");
                        $scope.prospectingActivity = _.find($scope.prospectingGoalActivityInfo.prospectingActivities, function (item) {
                            return item.id == activityId;
                        });
                        if ($scope.prospectingActivity) {
                            $scope.prospectingActivity.activityStart = moment(kendo.parseDate($scope.prospectingActivity.activityStart)).format("L LT");
                            $scope.prospectingActivity.activityEnd = moment(kendo.parseDate($scope.prospectingActivity.activityEnd)).format("L LT");
                            $("#editActivityModal").modal("show");
                        }
                        else {
                            dialogService.showNotification($translate.instant('TASKPROSPECTING_ACTIVITY_NOT_FOUND'), 'warning');
                        }
                    }
                }
                $scope.deleteActivity = function (goalActivityId, activityId) {
                    $scope.isActivityReadOnly = true;
                    $scope.prospectingActivity = null;
                    $scope.prospectingGoalActivityInfo = _.find($scope.prospectingGoalActivityInfoes, function (item) {
                        return item.id == goalActivityId;
                    });
                    if ($scope.prospectingGoalActivityInfo) {
                        $scope.prospectingActivity = _.find($scope.prospectingGoalActivityInfo.prospectingActivities, function (item) {
                            return item.id == activityId;
                        });
                        if ($scope.prospectingActivity) {
                            if (($scope.prospectingActivity.stopTime == null)) {
                                dialogService.showYesNoDialog($translate.instant('MYPROJECTS_CONFIRM'), $translate.instant('TASKPROSPECTING_ARE_YOU_SURE_WANT_TO_DELETE_THIS_ACTIVITY')).then(function () {
                                    serviceProspectingManager.deleteProspectingActivity(activityId).then(function (dataResult) {
                                        if (dataResult) {
                                            var index = _.findIndex($scope.prospectingGoalActivityInfo.prospectingActivities, function (activityItem) {
                                                return activityItem.id == activityId;
                                            });
                                            $scope.prospectingGoalActivityInfo.prospectingActivities.splice(index, 1);
                                            $scope.CalculatedSplitSkillGoals($scope.prospectingGoalActivityInfo.prospectingGoalId, $scope.prospectingGoalActivityInfo.prospectingActivities)
                                            $scope.calculateActivityResult();
                                            if ($scope.prospectingGoalActivityInfo.activityCalculationType == $scope.activityCalculationTypeEnum.RecurrentAndMultiple) {
                                                if ($("#goalProspectingActivities").data("kendoGrid")) {
                                                    $("#goalProspectingActivities").kendoGrid("destroy");
                                                    $("#goalProspectingActivities").html("");
                                                }
                                                _.each($scope.prospectingActivities, function (item) {
                                                    item.activityEnd = kendo.parseDate(item.activityEnd);
                                                    item.activityStart = kendo.parseDate(item.activityStart);
                                                })
                                                $("#goalProspectingActivities").kendoGrid({
                                                    dataSource: {
                                                        type: "json",
                                                        data: $scope.prospectingActivities,
                                                        pageSize: 10,
                                                    },
                                                    dataBound: function (e) {
                                                        var linkFn = $compile($("#goalProspectingActivities"));
                                                        linkFn($scope);
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
                                                        {
                                                            field: "id", title: $translate.instant('COMMON_ACTION'), template: function (dataItem) {
                                                                return "<div class='icon-groups'>" +
                                                                    "<a class='fa fa-eye' title='View Activity' ng-click='viewActivity(" + dataItem.prospectingGoalActivityId + "," + dataItem.id + ")'></a>" +
                                                                    "<a class='fa fa-pencil' title='Edit Activity' ng-show='isForCurrentUserOnly()' ng-click='editActivity(" + dataItem.prospectingGoalActivityId + "," + dataItem.id + ")'></a>" +
                                                                    "<a class='fa fa-trash' title='Delete Activity' ng-show='isForCurrentUserOnly() && " + (dataItem.stopTime == null) + " ' ng-click='deleteActivity(" + dataItem.prospectingGoalActivityId + "," + dataItem.id + ")'></a>" +
                                                                    "</div>";
                                                            }
                                                        },
                                                    ],
                                                });
                                                var linkFn = $compile($("#goalProspectingActivities"));
                                                linkFn($scope);
                                            }
                                            else {
                                                if ($("#goalActivityRecurrenceActivities").data("kendoGrid")) {
                                                    $("#goalActivityRecurrenceActivities").kendoGrid("destroy");
                                                    $("#goalActivityRecurrenceActivities").html("");
                                                }
                                                _.each($scope.prospectingActivities, function (item) {
                                                    item.activityEnd = kendo.parseDate(item.activityEnd);
                                                    item.activityStart = kendo.parseDate(item.activityStart);
                                                })
                                                $("#goalActivityRecurrenceActivities").kendoGrid({
                                                    dataSource: {
                                                        type: "json",
                                                        data: $scope.prospectingActivities,
                                                        pageSize: 10,
                                                    },
                                                    dataBound: function (e) {
                                                        var linkFn = $compile($("#goalActivityRecurrenceActivities"));
                                                        linkFn($scope);
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

                                                        {
                                                            field: "id", title: $translate.instant('COMMON_ACTION'), template: function (dataItem) {
                                                                return "<div class='icon-groups'>" +
                                                                    "<a class='fa fa-eye' title='View Activity' ng-click='viewActivity(" + dataItem.prospectingGoalActivityId + "," + dataItem.id + ")'></a>" +
                                                                    "<a class='fa fa-pencil' title='Edit Activity' ng-show='isForCurrentUserOnly()' ng-click='editActivity(" + dataItem.prospectingGoalActivityId + "," + dataItem.id + ")'></a>" +
                                                                    "<a class='fa fa-trash' title='Delete Activity' ng-show='isForCurrentUserOnly() && " + (dataItem.stopTime == null) + " ' ng-click='deleteActivity(" + dataItem.prospectingGoalActivityId + "," + dataItem.id + ")'></a>" +
                                                                    "</div>";
                                                            }
                                                        },
                                                    ],
                                                });
                                            }
                                            dialogService.showNotification($translate.instant('TASKPROSPECTING_ACTIVITY_DELETED_SUCCESSFULLY'), 'success');
                                        }
                                    })
                                });
                            }
                            else {
                                dialogService.showNotification($translate.instant('TASKPROSPECTING_YOU_ALREADY_FINISHED_THIS_ACTVITY_SO_CAN_NOT_DELETE_THIS_ACTVITY'), 'warning');
                            }
                        }
                        else {
                            dialogService.showNotification($translate.instant('TASKPROSPECTING_ACTIVITY_NOT_FOUND'), 'warning');
                        }
                    }
                }

                $scope.changeProspectingGoal = function () {
                    var info = _.find($scope.prospectingGoals, function (item) {
                        return item.id == $scope.prospectingGoalActivityInfo.prospectingGoalId;
                    });
                    if (info) {
                        $scope.prospectingGoalActivityInfo.profileId = info.profileId;
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
                        if ($scope.prospectingGoalActivityInfo.profileId) {
                            $scope.prospectingGoalActivityInfo.frequency = 'FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR';
                        }
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
                    $scope.calculateActivities();
                    $scope.calculateRecurrenceActivity();
                    $scope.prospectingGoalActivityInfo.totalActivities = 0;
                    $scope.SplitSkillGoals = [];
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
                                $scope.CalculatedSplitSkillGoals($scope.prospectingGoalActivityInfo.prospectingGoalId, $scope.prospectingGoalActivityInfo.prospectingActivities)
                                $scope.calculateActivityResult();
                            }
                        })
                    }
                    else {
                        serviceProspectingManager.updateProspectingGoalActivityInfo($scope.prospectingGoalActivityInfo).then(function (data) {

                        })
                    }
                }

                // Customers
                $scope.openAddCustomerPopupMode = {
                    isPopupOpen: false
                }
                $scope.openProspectingCustomer = function () {
                    $scope.prospectingCustomer = {
                        id: 0,
                        name: "",
                        phone: "",
                        detail: "",
                        prospectingGoalId: null,
                        prospectingCustomerTypeId: null,
                        scheduleDate: moment(new Date().setHours(0, 0, 0, 0)).add(2, "day").format("L LT"),
                    }

                    $scope.prospectingGoalNames = [];
                    _.each($scope.prospectingGoals, function (goalsItem) {
                        $scope.prospectingGoalNames.push({ id: goalsItem.id, name: goalsItem.name });
                    });
                    var html = '<div><add-customers-popup prospecting-customer="prospectingCustomer"' +
                        'prospecting-goal-names="prospectingGoalNames"' +
                        'prospecting-goal-activity-infoes="prospectingGoalActivityInfoes"' +
                        'prospecting-customer-goal-activities="prospectingCustomerGoalActivities"' +
                        'open-add-customer-popup-mode="openAddCustomerPopupMode"' +
                        '</add-customers-popup></div>';

                    var linkFn = $compile(html);
                    var content = linkFn($scope);
                    $("#home-add-customer-popup-div").html(content);
                    $scope.openAddCustomerPopupMode.isPopupOpen = true;
                }

                //Actvity
                $scope.isActivtyOpen = function (prospectingGoalActivityInfoId, activityId) {
                    var result = false;
                    var goalActivityInfo = _.find($scope.prospectingGoalActivityInfoes, function (dataItem) {
                        return dataItem.id == prospectingGoalActivityInfoId;
                    });
                    if (goalActivityInfo) {
                        var actvityInfo = _.find(goalActivityInfo.prospectingActivities, function (dataItem) {
                            return dataItem.id == activityId;
                        });
                        if (actvityInfo) {
                            var currentTime = new Date();
                            if (actvityInfo.stopTime == null) {
                                if (currentTime >= kendo.parseDate(actvityInfo.activityStart) && currentTime <= kendo.parseDate(actvityInfo.activityEnd)) {
                                    result = true;
                                }
                            }
                        }
                    }
                    return result;

                }
                $scope.isActivtyActive = function (prospectingGoalActivityInfoId, activityId) {
                    var result = false;
                    var goalActivityInfo = _.find($scope.prospectingGoalActivityInfoes, function (dataItem) {
                        return dataItem.id == prospectingGoalActivityInfoId;
                    });
                    if (goalActivityInfo) {
                        var actvityInfo = _.find(goalActivityInfo.prospectingActivities, function (dataItem) {
                            return dataItem.id == activityId;
                        });
                        if (actvityInfo) {
                            var currentTime = new Date();
                            if (currentTime >= kendo.parseDate(actvityInfo.activityStart) && currentTime <= kendo.parseDate(actvityInfo.activityEnd)) {
                                result = true;
                            }
                        }
                    }
                    return result;

                }
                $scope.checkAcvitityStarted = function (activityId) {
                    var result = false;
                    if ($scope.isActivityStart) {
                        if ($scope.activityStartedFor == activityId) {
                            result = true;
                        }
                    }
                    else {
                        result = true;
                    }
                    return result;
                }
                $scope.startActvity = function (activityId, prospectingGoalActivityId, prospectingGoalId) {
                    $scope.StartedActivityDetails = {
                        activityId: activityId,
                        prospectingGoalActivityId: prospectingGoalActivityId,
                        prospectingGoalId: prospectingGoalId
                    }
                    $scope.ActivityProspectingGoalFilterChanged(prospectingGoalId);
                    $scope.ActivityFilterChanged($scope.ActivityFilterOptionsEnum.Today);
                    var prospectingGoal = _.find($scope.prospectingGoals, function (item) {
                        return item.id == prospectingGoalId;
                    });
                    if (prospectingGoal.taskId) {
                        $scope.performanceDashboardTaskChanged(prospectingGoal.taskId);
                        setTimeout(function () {
                            $scope.selectProspectingGoal(prospectingGoal.id);
                            setTimeout(function () {
                                $scope.selectProspectingActivity(activityId);
                            }, 500)
                        }, 600);
                        setTimeout(function () {
                            $scope.selectCompareProspectingGoal(prospectingGoal.id);
                            setTimeout(function () {
                                var filtered = _.filter($scope.taskCompareProspectingActivities, function (item) {
                                    return item.id > 0;
                                })
                                var currentActivityIndex = _.findIndex(filtered, function (item) {
                                    return item.id == activityId;
                                });
                                if (currentActivityIndex >= 1) {
                                    if (filtered[currentActivityIndex - 1].id < activityId) {
                                        $scope.selectCompareProspectingActivity(filtered[currentActivityIndex - 1].id);
                                    }
                                }
                            }, 500);
                        }, 600);
                    }
                    $scope.prospectingActivityCustomers = _.filter($scope.prospectingCustomers, function (item) {
                        return item.prospectingGoalId == prospectingGoalId;
                    });
                    if ($scope.prospectingActivityCustomers.length > 0) {
                        $scope.startActivityTimer(activityId, prospectingGoalActivityId, prospectingGoalId);
                        var currentTime = new Date();
                        var activityLogInfo = {
                            prospectingActivityId: activityId,
                            event: "Start",
                            eventTime: currentTime,
                        }
                        serviceProspectingManager.saveActivityLog(activityLogInfo).then(function () {

                        });
                        prospectingGoalActivityStarted(activityId, prospectingGoalActivityId, currentTime);
                    }
                    else {
                        dialogService.showNotification($translate.instant('TASKPROSPECTING_NO_CUSTOMERS_TO_START_ACTIVITY_PLEASE_ADD_CUSTOMERS'), 'warning');
                    }
                };
                $scope.startActivityTimer = function (id, prospectingGoalActivityId, prospectingGoalId) {
                    $scope.activityStartedFor = id;
                    $scope.activityStartedProspectingGoalId = prospectingGoalId;
                    $scope.stoppedActivityGoalResult = [];
                    $scope.isActivityStart = true;
                    $scope.isViewActivityDetail = false;
                    localStorageService.set("isActivityStart", $scope.isActivityStart);

                    $scope.$broadcast('timer-start');
                };
                $scope.pauseActivityTimer = function (id) {
                    if ($scope.StartedActivityDetails.activityId) {
                        $scope.isActivityStart = true;
                        $scope.isActivityPause = true;
                        localStorageService.set("isActivityStart", $scope.isActivityStart);
                        //$("#activityPauseModal").modal("show");
                        $scope.$broadcast('timer-stop');
                        var activityLogInfo = {
                            prospectingActivityId: $scope.StartedActivityDetails.activityId,
                            event: "Pause",
                            eventTime: new Date(),
                        }
                        serviceProspectingManager.saveActivityLog(activityLogInfo).then(function () { });
                    }
                };
                $scope.stopActivityTimer = function (id, prospectingGoalActivityId, prospectingGoalId) {
                    if ($scope.StartedActivityDetails) {
                        dialogService.showYesNoDialog($translate.instant('MYPROJECTS_CONFIRM'), $translate.instant('TASKPROSPECTING_ARE_YOU_SURE_YOU_HAVE_COMPLETED_THIS_ACTIVITY')).then(function () {
                            $scope.isActivityStart = false;
                            $scope.isActivityPause = false;
                            $scope.activityStartedFor = null;
                            localStorageService.set("isActivityStart", $scope.isActivityStart);
                            $scope.stoppedActivityGoalResult = [];
                            var prospectingGoal = _.find($scope.prospectingGoals, function (item) {
                                return item.id == $scope.StartedActivityDetails.prospectingGoalId;
                            });
                            if (prospectingGoal) {
                                $scope.stoppedActivityGoalResult = prospectingGoal.adjustedGoals;
                            }
                            $scope.$broadcast('timer-stop');
                            var currentTime = new Date();
                            var activityLogInfo = {
                                prospectingActivityId: $scope.StartedActivityDetails.activityId,
                                event: "Stop",
                                eventTime: currentTime,
                            }
                            serviceProspectingManager.saveActivityLog(activityLogInfo).then(function () { });
                            prospectingGoalActivityStopped($scope.StartedActivityDetails.activityId, $scope.StartedActivityDetails.prospectingGoalActivityId, currentTime)
                        })
                    }
                };
                $scope.resumeActivityTimer = function (id) {
                    if ($scope.StartedActivityDetails.activityId) {
                        $scope.isActivityPause = false;
                        $scope.isActivityStart = true;
                        localStorageService.set("isActivityStart", $scope.isActivityStart);
                        $scope.$broadcast('timer-resume');
                        var activityLogInfo = {
                            prospectingActivityId: $scope.StartedActivityDetails.activityId,
                            event: "Resume",
                            eventTime: new Date(),
                        }
                        serviceProspectingManager.saveActivityLog(activityLogInfo).then(function () {
                        });
                    }
                }
                $scope.checkCustomerActvityIsDone = function (skillId, prospectingCustomerId) {
                    var result = false;
                    var filteredResult = _.filter($scope.prospectingActivityCustomerResults, function (item) {
                        return item.skillId == skillId && item.prospectingCustomerId == prospectingCustomerId;
                    });
                    if (filteredResult.length > 0) {
                        result = filteredResult[0].isDone;
                    }
                    return result;
                }
                $scope.checkActvityResultIsDone = function (skillId, prospectingCustomerId, prospectingActivityCustomerResults) {
                    var result = false;
                    var filteredResult = _.filter(prospectingActivityCustomerResults, function (item) {
                        return item.skillId == skillId && item.prospectingCustomerId == prospectingCustomerId;
                    });
                    if (filteredResult.length > 0) {
                        result = filteredResult[0].isDone;
                    }
                    return result;
                }
                $scope.checkPreviousActvityIsDone = function (skills, skillId, prospectingCustomerId) {
                    var result = false;
                    var skillIndex = _.findIndex(skills, function (skillItem) {
                        return skillItem.skillId == skillId;
                    });
                    if (skillIndex > 0) {
                        var filteredResult = _.filter($scope.prospectingActivityCustomerResults, function (item) {
                            return item.skillId == skills[skillIndex - 1].skillId && item.prospectingCustomerId == prospectingCustomerId;
                        });
                        if (skillIndex == (skills.length - 1)) {
                            // is Last Skill Meeting 
                            if (filteredResult.length > 0) {
                                if (filteredResult[0].isDone && (!filteredResult[0].isFollowUp) && (!filteredResult[0].isNoMeeting)) {
                                    result = filteredResult[0].isDone;
                                }
                            }
                        }
                        else {
                            if (filteredResult.length > 0) {
                                result = filteredResult[0].isDone;
                            }
                        }
                    }
                    else {
                        result = true;
                    }
                    return result;
                }
                $scope.isActvityPasued = function () {
                    return $scope.isActivityPause;
                }
                $scope.triggerActivity = function (skills, checkStatus, activityIndex, skillId, prospectingCustomerId, $event) {
                    if ($scope.isActivityStart && (!$scope.isActivityPause)) {
                        if (activityIndex == 0) {
                            var isExist = _.any($scope.prospectingActivityCustomerResults, function (resultItem) {
                                return resultItem.prospectingCustomerId == prospectingCustomerId && resultItem.skillId == skillId && resultItem.prospectingActivityId == $scope.activityStartedFor;
                            })
                            if (isExist) {
                                dialogService.showYesNoDialog($translate.instant('MYPROJECTS_CONFIRM'), $translate.instant('TASKPROSPECTING_IT_WILL_CLEAR_ALL_TALKED_DETAILSARE_YOU_SURE_TO_CONTINUE')).then(function () {
                                    var resultItem = _.filter($scope.prospectingActivityCustomerResults, function (resultItem) {
                                        return resultItem.prospectingCustomerId == prospectingCustomerId && resultItem.skillId == skillId && resultItem.prospectingActivityId == $scope.activityStartedFor;
                                    });
                                    if (resultItem.length > 0) {
                                        serviceProspectingManager.uncheckCustomerActivityResult(resultItem[0]).then(function (data) {
                                            if (data) {
                                                _.each(data, function (dataItem) {
                                                    var index = _.findIndex($scope.prospectingActivityCustomerResults, function (item) {
                                                        return item.id == dataItem
                                                    });
                                                    if (index > -1) {
                                                        $scope.prospectingActivityCustomerResults.splice(index, 1);
                                                    }
                                                });
                                                $scope.calculateActivityResult();
                                            }
                                        });
                                    }
                                }, function () {
                                    if (!checkStatus) {
                                        _.each($scope.prospectingActivityCustomerResults, function (resultItem) {
                                            if (resultItem.prospectingCustomerId == prospectingCustomerId && resultItem.skillId == skillId && resultItem.prospectingActivityId == $scope.activityStartedFor) {
                                                resultItem.isDone = true;
                                            }
                                        });
                                        var chkid = skillId + "_" + prospectingCustomerId
                                        $("#chkIs" + chkid).prop("checked", true);
                                    }
                                    checkStatus = !checkStatus;
                                });

                            }
                            else {
                                if (checkStatus) {
                                    dialogService.showYesNoDialog($translate.instant('MYPROJECTS_CONFIRM'), $translate.instant('TASKPROSPECTING_ARE_YOU_SURE_YOU_HAVE_CALLED_WITH_THIS_CUSTOMER')).then(function () {
                                        $scope.prospectingActivityCustomerResult = {
                                            id: 0,
                                            prospectingCustomerId: prospectingCustomerId,
                                            prospectingActivityId: $scope.activityStartedFor,
                                            skillId: skillId,
                                            isDone: checkStatus,
                                            reason: null,
                                            prospectingType: $scope.prospectingType
                                        };
                                        $scope.prospectingSchedule = null;
                                        $scope.saveCustomerActivityResult()
                                    }, function () {
                                        checkStatus = false;
                                        var chkid = skillId + "_" + prospectingCustomerId
                                        $("#chkIs" + chkid).prop("checked", false);
                                    })
                                }
                            }
                        }
                        else if (activityIndex == 1) {
                            var isExist = _.any($scope.prospectingActivityCustomerResults, function (resultItem) {
                                return resultItem.prospectingCustomerId == prospectingCustomerId && resultItem.skillId == skillId && resultItem.prospectingActivityId == $scope.activityStartedFor;
                            })
                            if (isExist) {
                                dialogService.showYesNoDialog($translate.instant('MYPROJECTS_CONFIRM'), $translate.instant('TASKPROSPECTING_IT_WILL_CLEAR_ALL_TALKED_DETAILSARE_YOU_SURE_TO_CONTINUE')).then(function () {
                                    var resultItem = _.filter($scope.prospectingActivityCustomerResults, function (resultItem) {
                                        return resultItem.prospectingCustomerId == prospectingCustomerId && resultItem.skillId == skillId && resultItem.prospectingActivityId == $scope.activityStartedFor;
                                    });
                                    if (resultItem.length > 0) {
                                        serviceProspectingManager.uncheckCustomerActivityResult(resultItem[0]).then(function (data) {
                                            if (data) {
                                                _.each(data, function (dataItem) {
                                                    var index = _.findIndex($scope.prospectingActivityCustomerResults, function (item) {
                                                        return item.id == dataItem
                                                    });
                                                    if (index > -1) {
                                                        $scope.prospectingActivityCustomerResults.splice(index, 1);
                                                    }
                                                });
                                                $scope.calculateActivityResult();
                                            }
                                        });
                                    }
                                }, function () {
                                    _.each($scope.prospectingActivityCustomerResults, function (resultItem) {
                                        if (resultItem.prospectingCustomerId == prospectingCustomerId && resultItem.skillId == skillId && resultItem.prospectingActivityId == $scope.activityStartedFor) {
                                            resultItem.isDone = (!checkStatus);
                                        }
                                    })
                                });
                            }
                            else {
                                if (checkStatus) {
                                    $scope.prospectingActivityCustomerResult = {
                                        id: 0,
                                        prospectingCustomerId: prospectingCustomerId,
                                        prospectingActivityId: $scope.activityStartedFor,
                                        skillId: skillId,
                                        isDone: checkStatus,
                                        reason: null,
                                        description: null,
                                        duration: null,
                                        customerInterestRate: null,
                                        isFollowUp: false,
                                        isNoMeeting: false,
                                        isServiceAgreed: false,
                                        nextSkillId: skills[activityIndex + 1] != null ? skills[activityIndex + 1].skillId : null,
                                        prospectingSchedules: [],
                                        prospectingType: $scope.prospectingType
                                    };
                                    $scope.prospectingSchedule = {
                                        prospectingCustomerId: prospectingCustomerId,
                                        prospectingActivityId: $scope.activityStartedFor,
                                        prospectingCustomerResultId: 0,
                                        isServiceAgreed: $scope.prospectingActivityCustomerResult.isServiceAgreed,
                                        isFollowUp: $scope.prospectingActivityCustomerResult.isFollowUp,
                                        scheduleDate: moment(new Date()).add(1, "days").format("L LT"),
                                        agenda: null,
                                        prospectingType: $scope.prospectingType
                                    }
                                    $("#addTalkedActvityModal").modal("show");
                                }
                            }
                        }
                        else if (activityIndex == 2) {
                            var isExist = _.any($scope.prospectingActivityCustomerResults, function (resultItem) {
                                return resultItem.prospectingCustomerId == prospectingCustomerId && resultItem.skillId == skillId && resultItem.prospectingActivityId == $scope.activityStartedFor;
                            })
                            if (isExist) {
                                dialogService.showYesNoDialog($translate.instant('MYPROJECTS_CONFIRM'), $translate.instant('TASKPROSPECTING_IT_WILL_CLEAR_ALL_MEETING_DETAILS_ARE_YOU_SURE_TO_CONTINUE')).then(function () {
                                    var resultItem = _.filter($scope.prospectingActivityCustomerResults, function (resultItem) {
                                        return resultItem.prospectingCustomerId == prospectingCustomerId && resultItem.skillId == skillId && resultItem.prospectingActivityId == $scope.activityStartedFor;
                                    });
                                    if (resultItem.length > 0) {
                                        serviceProspectingManager.uncheckCustomerActivityResult(resultItem[0]).then(function (data) {
                                            if (data) {
                                                _.each(data, function (dataItem) {
                                                    var index = _.findIndex($scope.prospectingActivityCustomerResults, function (item) {
                                                        return item.id == dataItem
                                                    });
                                                    if (index > -1) {
                                                        $scope.prospectingActivityCustomerResults.splice(index, 1);
                                                    }
                                                });
                                            }
                                        });
                                    }
                                }, function () {
                                    _.each($scope.prospectingActivityCustomerResults, function (resultItem) {
                                        if (resultItem.prospectingCustomerId == prospectingCustomerId && resultItem.skillId == skillId && resultItem.prospectingActivityId == $scope.activityStartedFor) {
                                            resultItem.isDone = (!checkStatus);

                                        }
                                    })

                                })


                            }
                            else {
                                if (checkStatus) {
                                    $scope.prospectingActivityCustomerResult = {
                                        id: 0,
                                        prospectingCustomerId: prospectingCustomerId,
                                        prospectingActivityId: $scope.activityStartedFor,
                                        skillId: skillId,
                                        isDone: checkStatus,
                                        reason: null,
                                        description: null,
                                        duration: null,
                                        customerInterestRate: null,
                                        isFollowUp: false,
                                        isNoMeeting: false,
                                        isServiceAgreed: true,
                                        prospectingSchedules: [],
                                        prospectingType: $scope.prospectingType
                                    };
                                    $scope.prospectingSchedule = {
                                        prospectingCustomerId: prospectingCustomerId,
                                        prospectingActivityId: $scope.activityStartedFor,
                                        prospectingCustomerResultId: 0,
                                        isServiceAgreed: true,
                                        isFollowUp: false,
                                        scheduleDate: moment(new Date()).format("L LT"),
                                        agenda: null,
                                        prospectingType: $scope.prospectingType
                                    }
                                    $("#scheduleModal").modal("show");
                                }
                            }
                        }
                    }
                    else {
                        if ($scope.isActivityPause) {
                            dialogService.showNotification($translate.instant('TASKPROSPECTING_PLEASE_RESUME_ACTVITY_TO_START_TRACK_YOU_RESULTS'), 'warning');
                        }
                    }
                };
                $scope.enalbeActivityResultToEdit = function () {
                    $scope.isActivityEditEnable = !$scope.isActivityEditEnable;
                }
                $scope.saveCustomerActivityResult = function () {
                    var isExist = _.any($scope.prospectingActivityCustomerResults, function (resultItem) {
                        return resultItem.prospectingCustomerId == $scope.prospectingActivityCustomerResult.prospectingCustomerId && resultItem.skillId == $scope.prospectingActivityCustomerResult.skillId && resultItem.prospectingActivityId == $scope.activityStartedFor;
                    })
                    if (isExist) {
                        _.each($scope.prospectingActivityCustomerResults, function (resultItem) {
                            if (resultItem.prospectingCustomerId == prospectingCustomerId && resultItem.skillId == skillId && resultItem.prospectingActivityId == $scope.activityStartedFor) {
                                resultItem.isDone = $scope.prospectingActivityCustomerResult.isDone;
                            }
                        })
                    }
                    else {
                        //Add New 
                        $scope.prospectingActivityCustomerResult.prospectingSchedules = [];
                        $scope.meetingAggredProspectingActivityCustomerResult = null;
                        if ($scope.prospectingActivityCustomerResult.isServiceAgreed) {
                            if ($scope.prospectingActivityCustomerResult.nextSkillId) {
                                $scope.meetingAggredProspectingActivityCustomerResult = {
                                    id: 0,
                                    prospectingCustomerId: $scope.prospectingActivityCustomerResult.prospectingCustomerId,
                                    prospectingActivityId: $scope.activityStartedFor,
                                    skillId: $scope.prospectingActivityCustomerResult.nextSkillId,
                                    isDone: true,
                                    reason: $scope.prospectingActivityCustomerResult.reason,
                                    description: null,
                                    duration: null,
                                    customerInterestRate: null,
                                    isFollowUp: false,
                                    isNoMeeting: false,
                                    isServiceAgreed: true,
                                    prospectingSchedules: [],
                                    prospectingType: $scope.prospectingType
                                };
                                if ($scope.prospectingSchedule) {
                                    $scope.prospectingSchedule.isFollowUp = false;
                                    $scope.prospectingSchedule.isServiceAgreed = true;
                                    $scope.prospectingSchedule.prospectingType = $scope.prospectingType;
                                    $scope.meetingAggredProspectingActivityCustomerResult.prospectingSchedules.push($scope.prospectingSchedule);
                                }
                            }
                        }

                        if ($scope.meetingAggredProspectingActivityCustomerResult) {
                            //First Save as Talked and then after Svale Meeting with Schedule
                            serviceProspectingManager.saveCustomerActivityResult($scope.prospectingActivityCustomerResult).then(function (data) {
                                if (data) {
                                    $scope.prospectingActivityCustomerResults.push(data);
                                    serviceProspectingManager.saveCustomerActivityResult($scope.meetingAggredProspectingActivityCustomerResult).then(function (data) {
                                        if (data) {
                                            dialogService.showNotification($translate.instant('TASKPROSPECTING_ACTVITY_RESULT_STORED_SUCCESSFULLY'), 'info');
                                            $scope.prospectingActivityCustomerResults.push(data);
                                            $scope.calculateActivityResult();

                                        }
                                    })
                                }
                            })
                        }
                        else {
                            if ($scope.prospectingSchedule && $scope.prospectingActivityCustomerResult.isFollowUp) {
                                $scope.prospectingSchedule.isFollowUp = true;
                                $scope.prospectingSchedule.isServiceAgreed = false;
                                $scope.prospectingSchedule.prospectingType = $scope.prospectingType;
                                $scope.prospectingActivityCustomerResult.prospectingSchedules.push($scope.prospectingSchedule);
                            }
                            serviceProspectingManager.saveCustomerActivityResult($scope.prospectingActivityCustomerResult).then(function (data) {
                                if (data) {
                                    dialogService.showNotification($translate.instant('TASKPROSPECTING_ACTVITY_RESULT_STORED_SUCCESSFULLY'), 'info');
                                    $scope.prospectingActivityCustomerResults.push(data);
                                    $scope.calculateActivityResult();
                                }
                            })
                        }
                    }
                }
                $scope.viewActivityResult = function (activityId, customerId) {
                    $scope.customerActivityResults = [];
                    serviceProspectingManager.getCustomerActivityResult(activityId, customerId).then(function (data) {
                        _.each(data, function (item) {
                            if (item.prospectingSchedules) {
                                _.each(item.prospectingSchedules, function (prospectingScheduleItem) {
                                    prospectingScheduleItem.scheduleDate = moment(kendo.parseDate(prospectingScheduleItem.scheduleDate)).format('L LT');
                                });
                            }
                        })
                        if (data.length > 2) {
                            data[1].prospectingSchedules = data[2].prospectingSchedules;
                            data.splice(2, 1);
                        }
                        $scope.customerActivityResults = data;
                        $("#customerActivityResultModel").modal("show");
                    })
                }
                $scope.editCustomerResult = function (activityId, prospectingCustomerId, skillId) {
                    var prospectingCustomerResults = [];
                    serviceProspectingManager.getCustomerActivityResult(activityId, prospectingCustomerId).then(function (data) {
                        var resultData = _.find(data, function (item) {
                            return item.skillId == skillId;
                        });
                        if (resultData) {
                            if (resultData.isServiceAgreed) {

                                if (resultData.skill.seqNo == 2) {
                                    data = _.sortBy(data, function (item) {
                                        return item.skill.seqNo;
                                    });

                                    var skillIndex = _.findIndex(data, function (item) {
                                        return item.skillId == skillId;
                                    });
                                    if (skillIndex > -1) {
                                        if (data[skillIndex + 1] != null) {
                                            resultData.nextSkillId = data[skillIndex + 1] != null ? data[skillIndex + 1].skillId : null;
                                            resultData.prospectingSchedules = data[skillIndex + 1].prospectingSchedules;
                                        }
                                    }
                                }
                                else if (resultData.skill.seqNo == 3) {
                                    data = _.sortBy(data, function (item) {
                                        return item.skill.seqNo;
                                    });
                                    var skillIndex = _.findIndex(data, function (item) {
                                        return item.skillId == skillId;
                                    });
                                    if (skillIndex > -1) {
                                        if (data[skillIndex - 1] != null) {
                                            resultData.description = data[skillIndex - 1].description;
                                            resultData.duration = data[skillIndex - 1].duration;
                                            resultData.customerInterestRate = data[skillIndex - 1].customerInterestRate;
                                            resultData.reason = data[skillIndex - 1].reason;
                                        }
                                    }
                                }
                            }
                        }
                        _.each($scope.viewProspectingActivityResultData, function (viewItem) {
                            _.each(viewItem.prospectingCustomerResults, function (item) {
                                prospectingCustomerResults.push(item);
                            })
                        });
                        var resultItem = _.find(prospectingCustomerResults, function (resultItem) {
                            return resultItem.prospectingCustomerId == prospectingCustomerId && resultItem.skillId == skillId && resultItem.prospectingActivityId == activityId;
                        });

                        if (resultData) {
                            $scope.prospectingActivityCustomerResult = resultData;
                            if (resultData.prospectingSchedules.length > 0) {
                                $scope.prospectingSchedule = resultData.prospectingSchedules[0];
                                $scope.prospectingSchedule.scheduleDate = moment(kendo.parseDate($scope.prospectingSchedule.scheduleDate)).format("L LT");
                            }
                            else {
                                $scope.prospectingSchedule = {
                                    prospectingCustomerId: prospectingCustomerId,
                                    prospectingActivityId: $scope.prospectingActivityFilterForResult.id,
                                    prospectingCustomerResultId: 0,
                                    isServiceAgreed: true,
                                    isFollowUp: false,
                                    scheduleDate: moment(new Date()).format("L LT"),
                                    agenda: null,
                                    prospectingType: $scope.prospectingType
                                }
                            }
                            $("#updateResultTalkedActvityModal").modal("show");
                        }
                    })
                }
                $scope.updateCustomerActivityResult = function () {
                    var isExist = _.any($scope.prospectingActivityCustomerResults, function (resultItem) {
                        return resultItem.prospectingCustomerId == $scope.prospectingActivityCustomerResult.prospectingCustomerId && resultItem.skillId == $scope.prospectingActivityCustomerResult.skillId && resultItem.prospectingActivityId == $scope.prospectingActivityFilterForResult.id;
                    })
                    if (isExist) {
                        _.each($scope.prospectingActivityCustomerResults, function (resultItem) {
                            if (resultItem.prospectingCustomerId == $scope.prospectingActivityCustomerResult.prospectingCustomerId && resultItem.skillId == $scope.prospectingActivityCustomerResult.skillId && resultItem.prospectingActivityId == $scope.prospectingActivityFilterForResult.id) {
                                resultItem.isDone = $scope.prospectingActivityCustomerResult.isDone;
                                $scope.prospectingSchedule.prospectingType = $scope.prospectingType;
                                $scope.prospectingSchedule.prospectingCustomerResultId = resultItem.id;
                                $scope.prospectingActivityCustomerResult.prospectingSchedules = [$scope.prospectingSchedule];
                                $scope.meetingAggredProspectingActivityCustomerResult = null;
                                if ($scope.prospectingActivityCustomerResult.isServiceAgreed) {
                                    if ($scope.prospectingActivityCustomerResult.nextSkillId == undefined) {
                                        _.each($scope.prospectingGoals, function (goalItem) {
                                            var skillIndex = _.findIndex(goalItem.prospectingSkillGoals, function (skillItem) {
                                                return skillItem.skillId == $scope.prospectingActivityCustomerResult.skillId;
                                            });
                                            if (skillIndex > -1) {
                                                $scope.prospectingActivityCustomerResult.nextSkillId = goalItem.prospectingSkillGoals[skillIndex + 1] != null ? goalItem.prospectingSkillGoals[skillIndex + 1].skillId : null;
                                            }
                                        });
                                    }
                                    if ($scope.prospectingActivityCustomerResult.nextSkillId) {
                                        $scope.meetingAggredProspectingActivityCustomerResult = {
                                            id: 0,
                                            prospectingCustomerId: $scope.prospectingActivityCustomerResult.prospectingCustomerId,
                                            prospectingActivityId: $scope.prospectingActivityCustomerResult.prospectingActivityId,
                                            skillId: $scope.prospectingActivityCustomerResult.nextSkillId,
                                            isDone: true,
                                            reason: $scope.prospectingActivityCustomerResult.reason,
                                            description: $scope.prospectingActivityCustomerResult.description,
                                            duration: $scope.prospectingActivityCustomerResult.duration,
                                            customerInterestRate: $scope.prospectingActivityCustomerResult.customerInterestRate,
                                            isFollowUp: false,
                                            isNoMeeting: false,
                                            isServiceAgreed: true,
                                            prospectingSchedules: [],
                                            prospectingType: $scope.prospectingType
                                        };
                                        if ($scope.prospectingSchedule) {
                                            $scope.prospectingSchedule.isFollowUp = false;
                                            $scope.prospectingSchedule.isServiceAgreed = true;
                                            $scope.prospectingSchedule.prospectingType = $scope.prospectingType;
                                            $scope.meetingAggredProspectingActivityCustomerResult.prospectingSchedules.push($scope.prospectingSchedule);
                                        }
                                    }
                                }

                                if ($scope.meetingAggredProspectingActivityCustomerResult) {
                                    //First Save as Talked and then after Svale Meeting with Schedule
                                    serviceProspectingManager.saveCustomerActivityResult($scope.prospectingActivityCustomerResult).then(function (data) {
                                        if (data) {
                                            $scope.prospectingActivityCustomerResults.push(data);
                                            _.each($scope.viewProspectingActivityResultData, function (viewItem) {
                                                if (viewItem.activityId == $scope.prospectingActivityFilterForResult.id && viewItem.prospectingCustomer.id == data.prospectingCustomerId) {
                                                    viewItem.prospectingCustomerResults.push(data);
                                                }
                                            });
                                            serviceProspectingManager.saveCustomerActivityResult($scope.meetingAggredProspectingActivityCustomerResult).then(function (data) {
                                                if (data) {
                                                    dialogService.showNotification($translate.instant('TASKPROSPECTING_ACTVITY_RESULT_STORED_SUCCESSFULLY'), 'info');
                                                    $scope.prospectingActivityCustomerResults.push(data);
                                                    _.each($scope.viewProspectingActivityResultData, function (viewItem) {
                                                        if (viewItem.activityId == $scope.prospectingActivityFilterForResult.id && viewItem.prospectingCustomer.id == data.prospectingCustomerId) {
                                                            viewItem.prospectingCustomerResults.push(data);
                                                        }
                                                    });
                                                    $scope.GetProjectProspectingGoalResultSummaryByUserId($scope.topBoxFilterOption.userId, $scope.topBoxFilterOption.projectId);
                                                    $scope.calculateActivityResult();
                                                    $scope.resultFilterOptionChanged();
                                                }
                                            })
                                        }
                                    })
                                }
                                else {
                                    serviceProspectingManager.saveCustomerActivityResult($scope.prospectingActivityCustomerResult).then(function (data) {
                                        if (data) {
                                            resultItem = data;
                                            _.each($scope.viewProspectingActivityResultData, function (viewItem) {
                                                if (viewItem.activityId == $scope.prospectingActivityFilterForResult.id && viewItem.prospectingCustomer.id == data.prospectingCustomerId) {
                                                    viewItem.prospectingCustomerResults.push(data);
                                                    $scope.GetProjectProspectingGoalResultSummaryByUserId($scope.topBoxFilterOption.userId, $scope.topBoxFilterOption.projectId);
                                                    $scope.calculateActivityResult();
                                                    $scope.resultFilterOptionChanged();
                                                }
                                            });
                                        }
                                    });
                                }
                            }
                        })
                    }
                    else {
                        //Add New 
                        $scope.prospectingActivityCustomerResult.prospectingSchedules = [];
                        $scope.meetingAggredProspectingActivityCustomerResult = null;
                        if ($scope.prospectingActivityCustomerResult.isServiceAgreed) {
                            if ($scope.prospectingActivityCustomerResult.nextSkillId == undefined) {
                                _.each($scope.prospectingGoals, function (goalItem) {
                                    var skillIndex = _.findIndex(goalItem.prospectingSkillGoals, function (skillItem) {
                                        return skillItem.skillId == $scope.prospectingActivityCustomerResult.skillId;
                                    });
                                    if (skillIndex > -1) {
                                        $scope.prospectingActivityCustomerResult.nextSkillId = goalItem.prospectingSkillGoals[skillIndex + 1] != null ? goalItem.prospectingSkillGoals[skillIndex + 1].skillId : null;
                                    }
                                });
                            }
                            if ($scope.prospectingActivityCustomerResult.nextSkillId) {
                                $scope.meetingAggredProspectingActivityCustomerResult = {
                                    id: 0,
                                    prospectingCustomerId: $scope.prospectingActivityCustomerResult.prospectingCustomerId,
                                    prospectingActivityId: $scope.prospectingActivityCustomerResult.prospectingActivityId,
                                    skillId: $scope.prospectingActivityCustomerResult.nextSkillId,
                                    isDone: true,
                                    reason: $scope.prospectingActivityCustomerResult.reason,
                                    description: null,
                                    duration: null,
                                    customerInterestRate: null,
                                    isFollowUp: false,
                                    isNoMeeting: false,
                                    isServiceAgreed: true,
                                    prospectingSchedules: [],
                                    prospectingType: $scope.prospectingType
                                };
                                if ($scope.prospectingSchedule) {
                                    $scope.prospectingSchedule.isFollowUp = false;
                                    $scope.prospectingSchedule.isServiceAgreed = true;
                                    $scope.prospectingSchedule.prospectingType = $scope.prospectingType;
                                    $scope.meetingAggredProspectingActivityCustomerResult.prospectingSchedules.push($scope.prospectingSchedule);
                                }
                            }
                        }

                        if ($scope.meetingAggredProspectingActivityCustomerResult) {
                            //First Save as Talked and then after Svale Meeting with Schedule
                            serviceProspectingManager.saveCustomerActivityResult($scope.prospectingActivityCustomerResult).then(function (data) {
                                if (data) {
                                    $scope.prospectingActivityCustomerResults.push(data);
                                    _.each($scope.viewProspectingActivityResultData, function (viewItem) {
                                        if (viewItem.activityId == $scope.prospectingActivityFilterForResult.id && viewItem.prospectingCustomer.id == data.prospectingCustomerId) {
                                            viewItem.prospectingCustomerResults.push(data);
                                        }
                                    });
                                    serviceProspectingManager.saveCustomerActivityResult($scope.meetingAggredProspectingActivityCustomerResult).then(function (data) {
                                        if (data) {
                                            dialogService.showNotification($translate.instant('TASKPROSPECTING_ACTVITY_RESULT_STORED_SUCCESSFULLY'), 'info');
                                            $scope.prospectingActivityCustomerResults.push(data);
                                            _.each($scope.viewProspectingActivityResultData, function (viewItem) {
                                                if (viewItem.activityId == $scope.prospectingActivityFilterForResult.id && viewItem.prospectingCustomer.id == data.prospectingCustomerId) {
                                                    viewItem.prospectingCustomerResults.push(data);
                                                }
                                            });
                                            $scope.GetProjectProspectingGoalResultSummaryByUserId($scope.topBoxFilterOption.userId, $scope.topBoxFilterOption.projectId);
                                            $scope.calculateActivityResult();
                                            $scope.resultFilterOptionChanged();
                                        }
                                    })
                                }
                            })
                        }
                        else {
                            if ($scope.prospectingSchedule && $scope.prospectingActivityCustomerResult.isFollowUp) {
                                $scope.prospectingSchedule.isFollowUp = true;
                                $scope.prospectingSchedule.isServiceAgreed = false;
                                $scope.prospectingSchedule.prospectingType = $scope.prospectingType;
                                $scope.prospectingActivityCustomerResult.prospectingSchedules.push($scope.prospectingSchedule);
                            }
                            serviceProspectingManager.saveCustomerActivityResult($scope.prospectingActivityCustomerResult).then(function (data) {
                                if (data) {
                                    dialogService.showNotification($translate.instant('TASKPROSPECTING_ACTVITY_RESULT_STORED_SUCCESSFULLY'), 'info');
                                    $scope.prospectingActivityCustomerResults.push(data);
                                    _.each($scope.viewProspectingActivityResultData, function (viewItem) {
                                        if (viewItem.activityId == $scope.prospectingActivityFilterForResult.id && viewItem.prospectingCustomer.id == data.prospectingCustomerId) {
                                            viewItem.prospectingCustomerResults.push(data);
                                        }
                                    });
                                    $scope.GetProjectProspectingGoalResultSummaryByUserId($scope.topBoxFilterOption.userId, $scope.topBoxFilterOption.projectId);
                                    $scope.calculateActivityResult();
                                    $scope.resultFilterOptionChanged();
                                }
                            })
                        }
                    }
                }
                $scope.cancelActivityResult = function () {
                    $("#customerActivityResultModel").modal("hide");
                }


                $scope.$on('timer-stopped', function (event, data) {
                    if (!$scope.isActivityStart) {
                        if (localStorageService.get("ActivityStartedFor") > 0 && localStorageService.get("ActivityStartTime")) {
                            $scope.activityFeedbackViewOnly = false;
                            $scope.activityFeedback = {
                                prospectingActivityId: localStorageService.get("ActivityStartedFor"),
                                rating: 0,
                                workedWell: "",
                                workedNotWell: "",
                                whatNextDescription: "",
                                timeSpentMinutes: 0,
                                startedAt: moment(kendo.parseDate(localStorageService.get("ActivityStartTime"))).format("L LT"),
                            }
                            $scope.activityFeedback.timeSpentMinutes = data.minutes;
                            $scope.activityFeedback.timeSpentMinutes += data.hours * 60;
                            serviceProspectingManager.getProspectingActivityFeedbackByActivityId(localStorageService.get("ActivityStartedFor")).then(function (data) {
                                if (data) {
                                    if (data.id > 0) {
                                        $scope.activityFeedback.id = data.id;
                                        $scope.activityFeedback.workedWell = data.workedWell;
                                        $scope.activityFeedback.workedNotWell = data.workedNotWell;
                                        $scope.activityFeedback.whatNextDescription = data.whatNextDescription;
                                        $scope.activityFeedback.rating = data.rating;
                                        $scope.activityFeedback.timeSpentMinutes += data.timeSpentMinutes;
                                    }
                                }
                                $scope.ratings = [];
                                $scope.ratings.push({ value: 1, background: "#f00" });
                                $scope.ratings.push({ value: 2, background: "#ff0" });
                                $scope.ratings.push({ value: 3, background: "#0f3" });
                                $scope.ratings.push({ value: 4, background: "#06f" });
                                $scope.ratings.push({ value: 5, background: "#f99" });
                                $("#actvityFeedbackModal").modal("show");

                            })

                        }
                    }
                });
                $scope.activityFeedback = {
                    prospectingActivityId: localStorageService.get("ActivityStartedFor"),
                    rating: 0,
                    workedWell: "",
                    workedNotWell: "",
                    whatNextDescription: "",
                    timeSpentMinutes: 0,
                    startedAt: moment(kendo.parseDate(localStorageService.get("ActivityStartTime"))).format("L LT"),
                };
                $scope.viewActivityFeedback = function () {
                    if ($scope.prospectingActivityFilterForResult.id) {
                        serviceProspectingManager.getProspectingActivityFeedbackByActivityId($scope.prospectingActivityFilterForResult.id).then(function (data) {
                            $scope.activityFeedbackViewOnly = true;
                            $scope.activityFeedback = data;
                            $scope.ratings = [];
                            $scope.ratings.push({
                                value: 1, background: "#f00"
                            });
                            $scope.ratings.push({
                                value: 2, background: "#ff0"
                            });
                            $scope.ratings.push({
                                value: 3, background: "#0f3"
                            });
                            $scope.ratings.push({
                                value: 4, background: "#06f"
                            });
                            $scope.ratings.push({
                                value: 5, background: "#f99"
                            });
                            $("#actvityFeedbackModal").modal("show");
                        })
                    }
                }
                $scope.saveActivityFeedback = function () {
                    serviceProspectingManager.saveProspectingActivityFeedback($scope.activityFeedback).then(function (data) {
                        if (data.id > 0) {
                            dialogService.showNotification($translate.instant('TASKPROSPECTING_PROSPECTING_ACTIVITY_FEEDBACK_SAVED_SUCCESSFULLY'), 'info');
                            $scope.cancelActivityFeedback();
                        }
                    });
                }
                $scope.cancelActivityFeedback = function () {
                    $scope.activityFeedback = {
                        prospectingActivityId: localStorageService.get("ActivityStartedFor"),
                        rating: 0,
                        workedWell: "",
                        workedNotWell: "",
                        whatNextDescription: "",
                        timeSpentMinutes: 0,
                        startedAt: moment(kendo.parseDate(localStorageService.get("ActivityStartTime"))).format("L LT"),
                    };
                    $("#actvityFeedbackModal").modal("hide");
                }
                $scope.actvityRatingStarMouseHover = function (el) {
                    var onStar = parseInt($(el.target).data('value'), 10); // The star currently mouse on
                    // Now highlight all the stars that's not after the current hovered star
                    $(el.target).parents("#taskRatingStars").children('li.star').each(function (e) {
                        if (e < onStar) {
                            $(this).addClass('hover');
                        }
                        else {
                            $(this).removeClass('hover');
                        }
                    });
                }
                $scope.actvityRatingStarMouseOut = function (el) {
                    $(el.target).parents("#taskRatingStars").children('li.star').each(function (e) {
                        $(this).removeClass('hover');
                    });
                }
                $scope.actvityRatingStarRatingCSS = function (starValue, ratingValue) {
                    if (starValue <= ratingValue) {
                        return "selected";
                    }
                }
                $scope.actvityRatingStarsClick = function (el) {
                    var onStar = parseInt($(el.target).data('value'), 10); // The star currently selected
                    var stars = $(el.target).parents("#actvityRatingStars").children('li.star');
                    for (var i = 0; i < stars.length; i++) {
                        $(stars[i]).removeClass('selected');
                    }
                    for (var i = 0; i < onStar; i++) {
                        $(stars[i]).addClass('selected');
                    }
                    var ratingValue = parseInt($('#actvityRatingStars li.selected label').last().data('value'), 10);
                    if (ratingValue > 1) {
                        $scope.activityFeedback.rating = ratingValue;;
                    }
                    else {
                        $scope.activityFeedback.rating = 0;
                    }
                };

                $scope.isStartedActvityExist = false;
                $scope.viewProspectingGoalActivityInfoes = function (id) {
                    $scope.isStartedActvityExist = false;
                    $scope.prospectingGoalActivityInfo = _.find($scope.prospectingGoalActivityInfoes, function (item) {
                        return item.id == id;
                    });
                    $scope.prospectingActivities = [];
                    if ($scope.prospectingGoalActivityInfo) {
                        var prospectingActivities = _.clone($scope.prospectingGoalActivityInfo.prospectingActivities);
                        $scope.prospectingGoalActivityInfo.activityCalculationType = 1;
                        $scope.CalculatedSplitSkillGoals($scope.prospectingGoalActivityInfo.prospectingGoalId, prospectingActivities);

                        $scope.prospectingGoalNames = [];
                        _.each($scope.prospectingGoals, function (goalsItem) {
                            if (goalsItem.id == $scope.prospectingGoalActivityInfo.prospectingGoalId) {
                                $scope.prospectingGoalNames.push({ id: goalsItem.id, name: goalsItem.name });
                            }
                        });
                        if ($scope.prospectingGoalActivityInfo.activityCalculationType == $scope.activityCalculationTypeEnum.RecurrentAndMultiple) {
                            if ($("#goalProspectingActivities").data("kendoGrid")) {
                                $("#goalProspectingActivities").kendoGrid("destroy");
                                $("#goalProspectingActivities").html("");
                            }
                            $scope.prospectingActivities = [];
                            _.each(prospectingActivities, function (item) {
                                var activity = _.clone(item);
                                activity.activityEnd = kendo.parseDate(item.activityEnd);
                                activity.activityStart = kendo.parseDate(item.activityStart);
                                $scope.prospectingActivities.push(activity);
                            })
                            $("#goalProspectingActivities").kendoGrid({
                                dataSource: {
                                    type: "json",
                                    data: $scope.prospectingActivities,
                                    pageSize: 10,
                                },
                                dataBound: function (e) {
                                    var linkFn = $compile($("#goalProspectingActivities"));
                                    linkFn($scope);
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
                                    {
                                        field: "id", title: $translate.instant('COMMON_ACTION'), template: function (dataItem) {
                                            return "<div class='icon-groups'>" +
                                                "<a class='fa fa-eye' title='View Activity' ng-click='viewActivity(" + dataItem.prospectingGoalActivityId + "," + dataItem.id + ")'></a>" +
                                                "<a class='fa fa-pencil' title='Edit Activity' ng-show='isForCurrentUserOnly()' ng-click='editActivity(" + dataItem.prospectingGoalActivityId + "," + dataItem.id + ")'></a>" +
                                                "<a class='fa fa-trash' title='Delete Activity' ng-show='isForCurrentUserOnly() && " + (dataItem.stopTime == null) + " ' ng-click='deleteActivity(" + dataItem.prospectingGoalActivityId + "," + dataItem.id + ")'></a>" +
                                                "</div>";

                                        }
                                    },
                                ],
                            });
                            var linkFn = $compile($("#goalProspectingActivities"));
                            linkFn($scope);
                        }
                        else {
                            if ($("#goalActivityRecurrenceActivities").data("kendoGrid")) {
                                $("#goalActivityRecurrenceActivities").kendoGrid("destroy");
                                $("#goalActivityRecurrenceActivities").html("");
                            }
                            $scope.prospectingActivities = [];
                            _.each(prospectingActivities, function (item) {
                                var activity = _.clone(item);
                                activity.activityEnd = kendo.parseDate(item.activityEnd);
                                activity.activityStart = kendo.parseDate(item.activityStart);
                                $scope.prospectingActivities.push(activity);
                            })
                            $("#goalActivityRecurrenceActivities").kendoGrid({
                                dataSource: {
                                    type: "json",
                                    data: $scope.prospectingActivities,
                                    pageSize: 10,
                                },
                                dataBound: function (e) {
                                    var linkFn = $compile($("#goalActivityRecurrenceActivities"));
                                    linkFn($scope);
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

                                    {
                                        field: "id", title: $translate.instant('COMMON_ACTION'), template: function (dataItem) {
                                            return "<div class='icon-groups'>" +
                                                "<a class='fa fa-eye' title='View Activity' ng-click='viewActivity(" + dataItem.prospectingGoalActivityId + "," + dataItem.id + ")'></a>" +
                                                "<a class='fa fa-pencil' title='Edit Activity' ng-show='isForCurrentUserOnly()' ng-click='editActivity(" + dataItem.prospectingGoalActivityId + "," + dataItem.id + ")'></a>" +
                                                "<a class='fa fa-trash' title='Delete Activity' ng-show='isForCurrentUserOnly() && " + (dataItem.stopTime == null) + " ' ng-click='deleteActivity(" + dataItem.prospectingGoalActivityId + "," + dataItem.id + ")'></a>" +
                                                "</div>";

                                        }
                                    },
                                ],
                            });
                        }
                        var isAnyStarted = _.any($scope.prospectingGoalActivityInfo.prospectingActivities, function (activityItem) {
                            return activityItem.startTime != null;
                        });
                        if (isAnyStarted) {
                            $scope.isStartedActvityExist = isAnyStarted;
                        }
                        $("#editProspectingActivityGoalModal").modal("show");
                    }
                }
                $scope.addProspectingActivity = function (goalActivityId) {
                    $scope.isActivityReadOnly = false;
                    $scope.prospectingActivity = null;
                    $scope.prospectingGoalActivityInfo = _.find($scope.prospectingGoalActivityInfoes, function (item) {
                        return item.id == goalActivityId;
                    });
                    if ($scope.prospectingGoalActivityInfo) {
                        $scope.prospectingActivity = {
                            id: 0,
                            prospectingGoalActivityId: goalActivityId,
                            name: "Extra Activity",
                            activityStart: new Date(),
                            activityEnd: null,
                        }
                        $("#AddProspectingActivityModal").modal("show");
                    }
                }
                $scope.activityEndOpen = function (event) {
                    var datepicker = $(event.sender.element).data("kendoDateTimePicker");
                    if ($scope.prospectingActivity.startTime) {
                        datepicker.setOptions({
                            min: kendo.parseDate($scope.prospectingActivity.startTime),
                        });
                    }
                    else {
                        datepicker.setOptions({
                            min: kendo.parseDate($scope.prospectingActivity.activityStart),
                        });
                    }
                }

                $scope.saveProspectingActivity = function () {
                    if ($scope.prospectingActivity.id > 0) {
                        serviceProspectingManager.updateProspectingActivity($scope.prospectingActivity).then(function (data) {
                            if (data) {
                                var prospectingGoalActivityInfo = _.find($scope.prospectingGoalActivityInfoes, function (item) {
                                    return item.id == $scope.prospectingActivity.prospectingGoalActivityId;
                                });
                                if (prospectingGoalActivityInfo) {
                                    _.each(prospectingGoalActivityInfo.prospectingActivities, function (item) {
                                        if (item.id == $scope.prospectingActivity.id) {
                                            item.name = $scope.prospectingActivity.name;
                                            item.activityStart = $scope.prospectingActivity.activityStart;
                                            item.activityEnd = $scope.prospectingActivity.activityEnd;
                                        }
                                    });
                                    if ($scope.prospectingActivities) {
                                        if ($scope.prospectingActivities.length > 0) {
                                            _.each($scope.prospectingActivities, function (item) {
                                                if (item.id == $scope.prospectingActivity.id) {
                                                    item.name = $scope.prospectingActivity.name;
                                                    item.activityStart = $scope.prospectingActivity.activityStart;
                                                    item.activityEnd = $scope.prospectingActivity.activityEnd;
                                                }
                                            });
                                        }
                                    }
                                    if (prospectingGoalActivityInfo.activityCalculationType == $scope.activityCalculationTypeEnum.RecurrentAndMultiple) {
                                        if ($("#goalProspectingActivities").data("kendoGrid")) {
                                            $("#goalProspectingActivities").kendoGrid("destroy");
                                            $("#goalProspectingActivities").html("");
                                        }
                                        _.each($scope.prospectingActivities, function (item) {
                                            item.activityEnd = kendo.parseDate(item.activityEnd);
                                            item.activityStart = kendo.parseDate(item.activityStart);
                                        })
                                        $("#goalProspectingActivities").kendoGrid({
                                            dataSource: {
                                                type: "json",
                                                data: $scope.prospectingActivities,
                                                pageSize: 10,
                                            },
                                            dataBound: function (e) {
                                                var linkFn = $compile($("#goalProspectingActivities"));
                                                linkFn($scope);
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
                                                {
                                                    field: "id", title: $translate.instant('COMMON_ACTION'), template: function (dataItem) {
                                                        return "<div class='icon-groups'>" +
                                                            "<a class='fa fa-eye' title='View Activity' ng-click='viewActivity(" + dataItem.prospectingGoalActivityId + "," + dataItem.id + ")'></a>" +
                                                            "<a class='fa fa-pencil' title='Edit Activity' ng-show='isForCurrentUserOnly()' ng-click='editActivity(" + dataItem.prospectingGoalActivityId + "," + dataItem.id + ")'></a>" +
                                                            "<a class='fa fa-trash' title='Delete Activity' ng-show='isForCurrentUserOnly() && " + (dataItem.stopTime == null) + " ' ng-click='deleteActivity(" + dataItem.prospectingGoalActivityId + "," + dataItem.id + ")'></a>" +
                                                            "</div>";
                                                    }
                                                },
                                            ],
                                        });

                                        var linkFn = $compile($("#goalProspectingActivities"));
                                        linkFn($scope);
                                    }
                                    else {
                                        if ($("#goalActivityRecurrenceActivities").data("kendoGrid")) {
                                            $("#goalActivityRecurrenceActivities").kendoGrid("destroy");
                                            $("#goalActivityRecurrenceActivities").html("");
                                        }
                                        _.each($scope.prospectingActivities, function (item) {
                                            item.activityEnd = kendo.parseDate(item.activityEnd);
                                            item.activityStart = kendo.parseDate(item.activityStart);
                                        })
                                        $("#goalActivityRecurrenceActivities").kendoGrid({
                                            dataSource: {
                                                type: "json",
                                                data: $scope.prospectingActivities,
                                                pageSize: 10,
                                            },
                                            dataBound: function (e) {
                                                var linkFn = $compile($("#goalActivityRecurrenceActivities"));
                                                linkFn($scope);
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

                                                {
                                                    field: "id", title: $translate.instant('COMMON_ACTION'), template: function (dataItem) {
                                                        return "<div class='icon-groups'>" +
                                                            "<a class='fa fa-eye' title='View Activity' ng-click='viewActivity(" + dataItem.prospectingGoalActivityId + "," + dataItem.id + ")'></a>" +
                                                            "<a class='fa fa-pencil' title='Edit Activity' ng-show='isForCurrentUserOnly()' ng-click='editActivity(" + dataItem.prospectingGoalActivityId + "," + dataItem.id + ")'></a>" +
                                                            "<a class='fa fa-trash' title='Delete Activity' ng-show='isForCurrentUserOnly() && " + (dataItem.stopTime == null) + " ' ng-click='deleteActivity(" + dataItem.prospectingGoalActivityId + "," + dataItem.id + ")'></a>" +
                                                            "</div>";
                                                    }
                                                },
                                            ],
                                        });

                                    }
                                }
                                dialogService.showNotification($translate.instant('TASKPROSPECTING_ACTIVITY_DETAIL_UPDATED_SUCCESSFULLY'), 'info');
                            }
                        });
                    }
                    else {
                        serviceProspectingManager.saveProspectingActivity($scope.prospectingActivity).then(function (data) {
                            if (data) {
                                data.activityStart = moment(kendo.parseDate(data.activityStart)).format("L LT");
                                data.activityEnd = moment(kendo.parseDate(data.activityEnd)).format("L LT");
                                var prospectingGoalActivityInfo = _.find($scope.prospectingGoalActivityInfoes, function (item) {
                                    return item.id == $scope.prospectingActivity.prospectingGoalActivityId;
                                });
                                if (prospectingGoalActivityInfo) {
                                    prospectingGoalActivityInfo.prospectingActivities.push(data);
                                    $scope.CalculatedSplitSkillGoals(prospectingGoalActivityInfo.prospectingGoalId, prospectingGoalActivityInfo.prospectingActivities)
                                    $scope.calculateActivityResult();

                                    if (prospectingGoalActivityInfo.activityCalculationType == $scope.activityCalculationTypeEnum.RecurrentAndMultiple) {
                                        if ($("#goalProspectingActivities").data("kendoGrid")) {
                                            $("#goalProspectingActivities").kendoGrid("destroy");
                                            $("#goalProspectingActivities").html("");
                                        }
                                        _.each($scope.prospectingActivities, function (item) {
                                            item.activityEnd = kendo.parseDate(item.activityEnd);
                                            item.activityStart = kendo.parseDate(item.activityStart);
                                        })
                                        $("#goalProspectingActivities").kendoGrid({
                                            dataSource: {
                                                type: "json",
                                                data: $scope.prospectingActivities,
                                                pageSize: 10,
                                            },
                                            dataBound: function (e) {
                                                var linkFn = $compile($("#goalProspectingActivities"));
                                                linkFn($scope);
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
                                                {
                                                    field: "id", title: $translate.instant('COMMON_ACTION'), template: function (dataItem) {
                                                        return "<div class='icon-groups'>" +
                                                            "<a class='fa fa-eye' title='View Activity' ng-click='viewActivity(" + dataItem.prospectingGoalActivityId + "," + dataItem.id + ")'></a>" +
                                                            "<a class='fa fa-pencil' title='Edit Activity' ng-show='isForCurrentUserOnly()' ng-click='editActivity(" + dataItem.prospectingGoalActivityId + "," + dataItem.id + ")'></a>" +
                                                            "<a class='fa fa-trash' title='Delete Activity' ng-show='isForCurrentUserOnly() && " + (dataItem.stopTime == null) + " ' ng-click='deleteActivity(" + dataItem.prospectingGoalActivityId + "," + dataItem.id + ")'></a>" +
                                                            "</div>";
                                                    }
                                                },
                                            ],
                                        });

                                        var linkFn = $compile($("#goalProspectingActivities"));
                                        linkFn($scope);
                                    }
                                    else {
                                        if ($("#goalActivityRecurrenceActivities").data("kendoGrid")) {
                                            $("#goalActivityRecurrenceActivities").kendoGrid("destroy");
                                            $("#goalActivityRecurrenceActivities").html("");
                                        }
                                        _.each($scope.prospectingActivities, function (item) {
                                            item.activityEnd = kendo.parseDate(item.activityEnd);
                                            item.activityStart = kendo.parseDate(item.activityStart);
                                        })
                                        $("#goalActivityRecurrenceActivities").kendoGrid({
                                            dataSource: {
                                                type: "json",
                                                data: $scope.prospectingActivities,
                                                pageSize: 10,
                                            },
                                            dataBound: function (e) {
                                                var linkFn = $compile($("#goalActivityRecurrenceActivities"));
                                                linkFn($scope);
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
                                                {
                                                    field: "id", title: $translate.instant('COMMON_ACTION'), template: function (dataItem) {
                                                        return "<div class='icon-groups'>" +
                                                            "<a class='fa fa-eye' title='View Activity' ng-click='viewActivity(" + dataItem.prospectingGoalActivityId + "," + dataItem.id + ")'></a>" +
                                                            "<a class='fa fa-pencil' title='Edit Activity' ng-show='isForCurrentUserOnly()' ng-click='editActivity(" + dataItem.prospectingGoalActivityId + "," + dataItem.id + ")'></a>" +
                                                            "<a class='fa fa-trash' title='Delete Activity' ng-show='isForCurrentUserOnly() && " + (dataItem.stopTime == null) + " ' ng-click='deleteActivity(" + dataItem.prospectingGoalActivityId + "," + dataItem.id + ")'></a>" +
                                                            "</div>";
                                                    }
                                                },
                                            ],
                                        });
                                    }
                                }
                                dialogService.showNotification($translate.instant('TASKPROSPECTING_ACTIVITY_ADDED_SUCCESSFULLY'), 'info');
                            }
                        });
                    }
                }




                function prospectingGoalActivityStarted(activityId, prospectingGoalActivityId, currentTime) {
                    var prospectingGoalActivityInfo = _.find($scope.prospectingGoalActivityInfoes, function (dataItem) {
                        return dataItem.id == prospectingGoalActivityId;
                    });
                    if (prospectingGoalActivityInfo) {
                        var activityInfo = _.find(prospectingGoalActivityInfo.prospectingActivities, function (dataItem) {
                            return dataItem.id == activityId;
                        })
                        if (activityInfo) {
                            activityInfo["startTime"] = currentTime;
                            localStorageService.set("ActivityStartTime", moment(currentTime).format("L LT"));
                            localStorageService.set("ActivityStartedFor", activityId);
                            serviceProspectingManager.updateProspectingActivity(activityInfo).then(function () {
                            });
                        }
                    }

                }
                function prospectingGoalActivityStopped(id, prospectingGoalActivityId, currentTime) {
                    var prospectingGoalActivityInfo = _.find($scope.prospectingGoalActivityInfoes, function (dataItem) {
                        return dataItem.id == prospectingGoalActivityId;
                    });
                    if (prospectingGoalActivityInfo) {

                        var activityInfo = _.find(prospectingGoalActivityInfo.prospectingActivities, function (dataItem) {
                            return dataItem.id == id;
                        })
                        if (activityInfo) {
                            activityInfo["stopTime"] = currentTime;
                            serviceProspectingManager.updateProspectingActivity(activityInfo).then(function () {
                            });

                        }
                    }
                }
                $scope.filterProspectingGoalChanged = function () {
                    $scope.resultFilterOptionChanged();
                    var prospectingGoalId = 0;
                    if ($scope.topBoxFilterOption.prospectingGoalIds.length > 0) {
                        prospectingGoalId = $scope.topBoxFilterOption.prospectingGoalIds[0].id;
                    }
                    $scope.ActivityProspectingGoalFilterChanged(prospectingGoalId);
                    var filteredTodos = $scope.prospectingTaskTodos;
                    if ($scope.topBoxFilterOption.prospectingGoalIds.length > 0) {
                        var allGoalStartDates = [];
                        var allGoalEndDates = [];
                        var filteredProspectingGoalTaskIds = [];
                        _.each($scope.prospectingGoals, function (goalItem) {
                            var isExist = _.any($scope.topBoxFilterOption.prospectingGoalIds, function (selectedGoalItem) {
                                return selectedGoalItem.id == goalItem.id;
                            });
                            if (isExist) {
                                filteredProspectingGoalTaskIds.push(goalItem.taskId);
                                allGoalStartDates.push(moment(kendo.parseDate(goalItem.goalStartDate))._d);
                                allGoalEndDates.push(moment(kendo.parseDate(goalItem.goalEndDate))._d);
                            }
                        });
                        if (allGoalStartDates.length > 0 && allGoalEndDates.length > 0) {
                            allGoalStartDates = _.sortBy(allGoalStartDates, function (value) {
                                return value;
                            });
                            allGoalEndDates = _.sortBy(allGoalEndDates, function (value) {
                                return value;
                            });
                            moment.locale(globalVariables.lang.currentUICulture);
                            $scope.totalStartDate = moment(allGoalStartDates[0])._d;
                            $scope.totalEndDate = moment(allGoalEndDates[allGoalEndDates.length - 1])._d;
                        }
                        filteredTodos = _.filter(filteredTodos, function (todoItem) {
                            return filteredProspectingGoalTaskIds.indexOf(todoItem.id) > -1;
                        });
                        var gridObj = $("#meetingCustomers").data("kendoGrid");
                        if (gridObj) {
                            var filterOption = [{
                                logic: "or",
                                filters: []
                            }];
                            if (gridObj) {
                                if ($scope.topBoxFilterOption.prospectingGoalIds.length > 0) {
                                    _.each($scope.topBoxFilterOption.prospectingGoalIds, function (selectedProspectingGoal) {
                                        filterOption[0].filters.push({
                                            field: 'prospectingGoalId',
                                            operator: 'eq',
                                            value: selectedProspectingGoal.id
                                        });
                                    })
                                }
                            }
                            _.each($scope.selectedProjectMembers, function (item) {
                                filterOption[0].filters.push({
                                    field: 'prospectingGoalUserId',
                                    operator: 'eq',
                                    value: item.id
                                });
                            });
                            if (filterOption[0].filters.length > 0) {
                                gridObj.dataSource.filter(filterOption);
                            }
                            else {
                                gridObj.dataSource.filter([]);
                            }
                        }
                    }
                    else {
                        var allGoalStartDates = [];
                        var allGoalEndDates = [];
                        _.each($scope.prospectingGoals, function (item) {
                            if (item.taskId) {
                                allGoalStartDates.push(moment(kendo.parseDate(item.goalStartDate))._d);
                                allGoalEndDates.push(moment(kendo.parseDate(item.goalEndDate))._d);
                            }
                        });
                        if (allGoalStartDates.length > 0 && allGoalEndDates.length > 0) {
                            allGoalStartDates = _.sortBy(allGoalStartDates, function (value) {
                                return value;
                            });
                            allGoalEndDates = _.sortBy(allGoalEndDates, function (value) {
                                return value;
                            });
                            moment.locale(globalVariables.lang.currentUICulture);
                            $scope.totalStartDate = moment(allGoalStartDates[0])._d;
                            $scope.totalEndDate = moment(allGoalEndDates[allGoalEndDates.length - 1])._d;
                        }
                    }
                    if (filteredTodos.length > 0) {
                        $scope.performanceDashboardTaskChanged(filteredTodos[filteredTodos.length - 1].id);
                    }
                    else {
                        $scope.performanceDashboardTaskChanged(null);
                    }
                    serviceProspectingManager.getProspectingScaleRangesByGoalId(prospectingGoalId).then(function (data) {
                        if (data.length > 0) {
                            $scope.prospectingScaleRanges = [];
                            console.log("filterProspectingGoalChanged");
                            _.each(data, function (dataItem) {
                                $scope.prospectingScaleRanges.push({
                                    min: dataItem.min,
                                    max: dataItem.max,
                                    from: dataItem.min,
                                    to: dataItem.max,
                                    color: dataItem.color,
                                    minPercentage: dataItem.min,
                                    maxPercentage: dataItem.max,
                                    prospectingGoalId: prospectingGoalId,
                                });
                            });
                        }
                        else {
                            $scope.prospectingScaleRanges = [
                                {
                                    color: "#f00",
                                    from: 0,
                                    max: 5,
                                    maxPercentage: 50,
                                    min: 0,
                                    minPercentage: 0,
                                    to: 50
                                },
                                {
                                    color: "#ff0   ",
                                    from: 50,
                                    max: 7,
                                    maxPercentage: 70,
                                    min: 5,
                                    minPercentage: 50,
                                    to: 70,
                                },
                                {
                                    color: "#0f0   ",
                                    from: 70,
                                    max: 10,
                                    maxPercentage: 100,
                                    min: 7,
                                    minPercentage: 70,
                                    to: 100,
                                }
                            ];
                        }
                    });
                }
                function getProspectingGoalMultiSelectOptions(data) {
                    var options = [];
                    _.forEach(data, function (item, index) {
                        options.push({ id: item.id, label: item.name });
                    });
                    return options;
                }
                function getMultiSelectOptions(data) {
                    var options = [];
                    _.forEach(data, function (item, index) {
                        options.push({ id: item.id, label: item.firstName + " " + item.lastName });
                    });
                    return options;
                }
                function getTaskProsepectingActvitiyPerformnaceData(goalId, activityId, userid) {
                    serviceProspectingManager.getTaskProsepectingActvitiyPerformnaceData(goalId, activityId, userid).then(function (data) {
                        if (data) {
                            $scope.taskActivityData = data;
                            setTimeout(function () {
                                drawGauge();
                            }, 100)
                        }
                    });
                    $scope.activityResultFilterOptionModel = {
                        taskId: $scope.selectedperformanceDashboardTask.id,
                        userId: userid, //$scope.topBoxFilterOption.userId,
                        startDate: null,
                        endDate: null
                    }
                    serviceProspectingManager.getUserTaskServiceActivityData($scope.activityResultFilterOptionModel).then(function (data) {
                        var series = [];
                        var categories = [];
                        var colors = ["#FF6800", "#A0A700", "#4163B9"];
                        _.each(data, function (item) {
                            if (moment(kendo.parseDate(item.actvitiyStart)).isBefore(moment($scope.endOfDay)) && moment(kendo.parseDate(item.actvitiyEnd)).isBefore(moment($scope.endOfDay))) {
                                categories.push(item.actvitiyName + "_" + moment(kendo.parseDate(item.actvitiyStart)).format("L"));
                                var cindex = 0;
                                _.each(item.prospectingSkillGoalResults, function (resultItem) {
                                    if (series[cindex]) {
                                        series[cindex].data.push(resultItem.count);
                                    }
                                    else {
                                        series.push({
                                            name: resultItem.skillName,
                                            data: [resultItem.count],
                                            color: colors[cindex],
                                        });
                                    }
                                    cindex = cindex + 1;
                                });
                            }
                        });

                        // Draw Chart
                        var floatChart = $("#taskprospectingfloatchart").kendoChart({
                            legend: {
                                position: "top",
                                visible: false
                            },
                            seriesDefaults: {
                                type: "line",
                                style: "smooth"
                            },
                            series: series,
                            valueAxis: {
                                majorUnit: 1,
                                min: 0,
                                //max: reportModel.scale.scaleRanges[reportModel.scale.scaleRanges.length - 1].max,
                                labels: {
                                    format: "{0}"
                                },
                                line: {
                                    visible: true
                                },
                                axisCrossingValue: 0
                            },
                            categoryAxis: {
                                categories: categories,
                                line: {
                                    visible: false
                                },
                                labels: {
                                    padding: { top: 0 },
                                    template: labelTemplate,
                                    rotation: categories.length > 13 ? -90 : 0,
                                },
                                majorGridLines: {
                                    visible: false
                                },
                            },
                            legend: {
                                visible: true,
                                position: "bottom"
                            },
                            tooltip: {
                                visible: true,
                                background: "white",
                                format: "{0}",
                                template: "#= series.name #: #= value#"
                            }
                        });
                        function labelTemplate(e) {
                            return e.value.split("_").join("\n");
                        }
                    })
                }
                $scope.showMoreToDos = function () {
                    $location.path("/home/todos/todos");
                }
                function memberChanged() {
                    if ($scope.selectedProjectMembers.length > 0 && $scope.topBoxFilterOption.userId == 0) {
                        $("#tabAll").removeClass("active");
                        $scope.prospectingGoals = [];
                        $scope.prospectingGoalActivityInfoes = [];
                        $scope.prospectingActivityCustomers = [];
                        $scope.prospectingCustomers = [];
                        $scope.prospectingActivityCustomerResults = [];
                        $scope.TotalGoalData = [0, 0, 0];
                        $scope.TotalResultData = [0, 0, 0];
                        $scope.TotalPercetageData = [0, 0, 0];
                        $scope.RemainingTotalGoalData = [0, 0, 0];
                        $scope.AdgustedPercetageData = [0, 0, 0];
                        $scope.CurrentPerformanceTotalGoalData = [0, 0, 0];
                        $scope.CurrentPerformancePercetageData = [0, 0, 0];
                        $scope.scaleColors = ['', '', ''];
                        $scope.calculatingGoalResultSummary = true;
                        $scope.topBoxFilterOption.userId = 0;
                        var userIds = [];
                        $scope.topBoxFilterOption.prospectingGoalIds = [];
                        // Members
                        var memberNames = [];
                        _.each(userIds, function (value) {
                            var member = _.find($scope.projectMembers, function (item) {
                                return item.id == value;
                            });
                            if (member) {
                                if (!($("#tab_" + value).hasClass("active"))) {
                                    $("#tab_" + value).addClass("active");
                                }
                                memberNames.push(member.firstName + " " + member.lastName);
                            }
                        });
                        if (memberNames.length > 0) {
                            $scope.topBoxFilterOption.userName = memberNames.join(',');
                        }
                        todoManager.getTodosByUserIds(userIds).then(function (data) {
                            progressBar.stopProgress();
                            $scope.taskTodos = [];
                            $scope.prospectingTaskTodos = [];
                            var start = moment().startOf('day'); // set to 12:00 am today
                            var end = moment().endOf('day');

                            var today = new Date();
                            today = today.setHours(0, 0, 0, 0);
                            moment.locale(globalVariables.lang.currentUICulture);
                            angular.forEach(data, function (item, index) {
                                if ($scope.topBoxFilterOption.projectId > 0) {
                                    if (item.projectId == $scope.topBoxFilterOption.projectId) {
                                        if (item.taskCategoryListItem.name.toLowerCase() == 'prospecting' || item.taskCategoryListItem.name.toLowerCase() == 'sales prospecting') {

                                            item.start = moment(kendo.parseDate(item.startDate)).toDate();
                                            item.taskId = item.id;
                                            item.end = moment(kendo.parseDate(item.dueDate)).toDate();
                                            $scope.prospectingTaskTodos.push(item);
                                            var event = new kendo.data.SchedulerEvent({
                                                id: item.id,
                                                title: item.title,
                                                start: kendo.parseDate(item.startDate),
                                                end: kendo.parseDate(item.dueDate),
                                                recurrenceRule: item.recurrenceRule,
                                                taskCategoryListItem: item.taskCategoryListItem,
                                                training: item.training,
                                                trainingId: item.trainingId,
                                                isAllDay: moment(kendo.parseDate(item.startDate)).format("HHmmss") == "000000",
                                                textColor: (item.taskCategoryListItem ? item.taskCategoryListItem.textColor : "#FFFFFF"),
                                                color: (item.taskCategoryListItem ? item.taskCategoryListItem.color : "#000000"),
                                            });

                                            var occurrences = event.expand(kendo.parseDate(item.startDate), kendo.parseDate(item.dueDate));
                                            _.each(occurrences, function (todoItem) {
                                                if (kendo.parseDate(todoItem.start).setHours(0, 0, 0, 0) == today) {
                                                    var x = {
                                                        assignedToId: item.assignedToId,
                                                        categoryId: item.categoryId,
                                                        title: item.title,
                                                        description: item.description,
                                                        startDate: moment(todoItem.start).format('L LT'),
                                                        dueDate: moment(todoItem.start).endOf('day').format('L LT'),
                                                        id: item.id,
                                                        isCompleted: false,
                                                        recurrenceRule: item.recurrenceRule,
                                                        taskId: item.id,
                                                        taskActualStartDate: moment(kendo.parseDate(item.startDate)).format('L LT'),
                                                        taskActualDueDate: moment(kendo.parseDate(item.dueDate)).format('L LT')
                                                    }
                                                    $scope.taskTodos.push(x);
                                                }
                                            });
                                        }
                                    }
                                }
                                else {
                                    if (item.taskCategoryListItem.name.toLowerCase() == 'prospecting' || item.taskCategoryListItem.name.toLowerCase() == 'sales prospecting') {
                                        item.start = moment(kendo.parseDate(item.startDate)).toDate();
                                        item.taskId = item.id;
                                        item.end = moment(kendo.parseDate(item.dueDate)).toDate();
                                        $scope.prospectingTaskTodos.push(item);
                                        var event = new kendo.data.SchedulerEvent({
                                            id: item.id,
                                            title: item.title,
                                            start: kendo.parseDate(item.startDate),
                                            end: kendo.parseDate(item.dueDate),
                                            recurrenceRule: item.recurrenceRule,
                                            taskCategoryListItem: item.taskCategoryListItem,
                                            training: item.training,
                                            trainingId: item.trainingId,
                                            isAllDay: moment(kendo.parseDate(item.startDate)).format("HHmmss") == "000000",
                                            textColor: (item.taskCategoryListItem ? item.taskCategoryListItem.textColor : "#FFFFFF"),
                                            color: (item.taskCategoryListItem ? item.taskCategoryListItem.color : "#000000"),
                                        });

                                        var occurrences = event.expand(kendo.parseDate(item.startDate), kendo.parseDate(item.dueDate));
                                        _.each(occurrences, function (todoItem) {
                                            if (kendo.parseDate(todoItem.start).setHours(0, 0, 0, 0) == today) {
                                                var x = {
                                                    assignedToId: item.assignedToId,
                                                    categoryId: item.categoryId,
                                                    title: item.title,
                                                    description: item.description,
                                                    startDate: moment(todoItem.start).format('L LT'),
                                                    dueDate: moment(todoItem.start).endOf('day').format('L LT'),
                                                    id: item.id,
                                                    isCompleted: false,
                                                    recurrenceRule: item.recurrenceRule,
                                                    taskId: item.id,
                                                    taskActualStartDate: moment(kendo.parseDate(item.startDate)).format('L LT'),
                                                    taskActualDueDate: moment(kendo.parseDate(item.dueDate)).format('L LT')
                                                }
                                                $scope.taskTodos.push(x);
                                            }
                                        });
                                    }
                                }
                            });
                            if ($scope.prospectingTaskTodos.length > 0) {
                                $scope.performanceDashboardTaskChanged($scope.prospectingTaskTodos[$scope.prospectingTaskTodos.length - 1].id);
                            }
                            App.initSlimScroll(".scroller");
                        });
                        serviceProspectingManager.getServiceProspectingCustomerResultsByUserIds(userIds).then(function (data) {
                            $scope.prospectingActivityCustomerResults = data;
                            _.each($scope.prospectingActivityCustomerResults, function (resultItem) {
                                resultItem.createdOn = kendo.parseDate(resultItem.createdOn);
                            });
                            var sortedCustomerResults = _.sortBy($scope.prospectingActivityCustomerResults, function (resultItem) {
                                return resultItem.createdOn;
                            }).reverse();
                            var sortedGoals = [];
                            if (sortedCustomerResults.length > 0) {
                                sortedGoals = _.map(sortedCustomerResults, function (item) {
                                    return item.prospectingCustomer.prospectingGoalId;
                                });
                                sortedGoals = _.uniq(sortedGoals);
                            }
                            progressBar.startProgress();
                            serviceProspectingManager.getProjectServiceProspectingGoalsByUserId($scope.topBoxFilterOption.userId, $scope.topBoxFilterOption.projectId).then(function (data) {
                                progressBar.stopProgress();
                                $scope.prospectingGoalItems = [];

                                if (userIds.length > 0 && $scope.topBoxFilterOption.userId == 0) {
                                    data = _.filter(data, function (dataItem) {
                                        return userIds.indexOf(dataItem.userId) > -1;
                                    });
                                }

                                _.each(data, function (item) {
                                    var sortedIndexOfGoal = _.findIndex(sortedGoals, function (sortedGoalItem) {
                                        return sortedGoalItem == item.id;
                                    });
                                    if (!(sortedIndexOfGoal > -1)) {
                                        sortedIndexOfGoal = null;
                                    }
                                    $scope.prospectingGoalItems.push({ id: item.id, name: item.name, seq: sortedIndexOfGoal, goalStartDate: moment(kendo.parseDate(item.goalStartDate))._d, goalEndDate: moment(kendo.parseDate(item.goalEndDate))._d });
                                });
                                $scope.prospectingGoalOptions = getProspectingGoalMultiSelectOptions($scope.prospectingGoalItems);
                                $scope.prospectingGoalItems.unshift({ id: 0, name: $translate.instant('COMMON_ALL') });
                                $scope.topBoxFilterOption.prospectingGoalIds = [];

                                _.each(data, function (item) {
                                    if (item.taskId) {
                                        moment.locale(globalVariables.lang.currentUICulture);
                                        item.goalStartDate = moment(kendo.parseDate(item.goalStartDate)).format('L LT');
                                        item.goalEndDate = moment(kendo.parseDate(item.goalEndDate)).format('L LT');
                                        if (item.taskId) {
                                            serviceProspectingManager.getSkillsByProspectingGoalId(item.id).then(function (data) {
                                                data = _.sortBy(data, 'seqNo');
                                                $scope.profileSkills = data;
                                                _.each(item.prospectingSkillGoals, function (dataItem) {
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
                                                item.calculatedProspectingGoals = [];
                                                item.adjustedGoals = [];
                                                item.currentPerformanceGoals = [];

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
                                            })
                                        }
                                    }
                                    App.initSlimScroll(".scroller");
                                });
                                serviceProspectingManager.getServiceProspectingCustomersByUserIds(userIds).then(function (data) {
                                    //$scope.$broadcast('timer-stop');
                                    _.each(data, function (item) {
                                        if (kendo.parseDate(item.scheduleDate) >= new Date().setHours(0, 0, 0, 0) && kendo.parseDate(item.scheduleDate) <= new Date().setHours(11, 59, 0, 0)) {
                                            moment.locale(globalVariables.lang.currentUICulture);
                                            item.scheduleDate = moment(kendo.parseDate(item.scheduleDate)).format('L LT');
                                            item.skills = [];
                                            if (item.prospectingGoalId) {
                                                serviceProspectingManager.getSkillsByProspectingGoalId(item.prospectingGoalId).then(function (skillDatas) {
                                                    skillDatas = _.sortBy(skillDatas, 'seqNo');
                                                    _.each(skillDatas, function (skillDataItem) {
                                                        item.skills.push({ skillId: skillDataItem.id, skillName: skillDataItem.name });
                                                    });
                                                    $scope.prospectingCustomers.push(item);
                                                })
                                            }
                                        }
                                    });
                                });
                                serviceProspectingManager.getServiceProspectingGoalActivityInfoesByUserIds(userIds).then(function (data) {
                                    var prospectingGoalIds = [];
                                    _.each(data, function (item, index) {
                                        if (item) {
                                            prospectingGoalIds.push(item.prospectingGoalId);
                                            moment.locale(globalVariables.lang.currentUICulture);
                                            item.activityStartTime = moment(kendo.parseDate(item.activityStartTime)).format("L LT");
                                            item.activityEndTime = moment(kendo.parseDate(item.activityEndTime)).format("L LT");
                                            _.each(item.prospectingActivities, function (activityItem) {
                                                activityItem.activityStart = moment(kendo.parseDate(activityItem.activityStart)).format("L LT");
                                                activityItem.activityEnd = moment(kendo.parseDate(activityItem.activityEnd)).format("L LT");
                                            });
                                            $scope.prospectingGoalActivityInfoes.push(item);
                                        }
                                    });
                                    var prospectingGoalIds = _.uniq(prospectingGoalIds);
                                    _.each(prospectingGoalIds, function (goalId) {
                                        $scope.CalculateGoalByGoalId(goalId);
                                        $scope.CalculateAdjustedGoalByGoalId(goalId);
                                        $scope.CalculateCurrentPerformanceGoalByGoalId(goalId);
                                    });
                                    $scope.calculatingProspectingGoalResultSummaryByUserId = true;
                                    serviceProspectingManager.getProjectServiceProspectingGoalResultSummaryByUserId($scope.topBoxFilterOption.userId, $scope.topBoxFilterOption.projectId).then(function (summaryData) {
                                        if (userIds.length > 0 && $scope.topBoxFilterOption.userId == 0) {
                                            summaryData = _.filter(summaryData, function (filterItem) {
                                                return userIds.indexOf(filterItem.userId) > -1;
                                            });
                                        }
                                        _.each(summaryData, function (resultItem) {
                                            var prospectingGoal = _.find($scope.prospectingGoals, function (item) {
                                                return item.id == resultItem.prospectingGoalId;
                                            });
                                            if (prospectingGoal) {
                                                if (prospectingGoal.calculatedProspectingGoals) {
                                                    _.each(prospectingGoal.calculatedProspectingGoals, function (goalitem) {
                                                        // weeklyResult
                                                        var weeklyResult = _.find(resultItem.weeklyResult[0].prospectingSkillGoalResults, function (item) {
                                                            return item.skillId == goalitem.skillId;
                                                        });
                                                        if (weeklyResult) {
                                                            goalitem.weeklyResult = weeklyResult.count;
                                                        }
                                                        // monthlyResult
                                                        var monthlyResult = _.find(resultItem.monthlyResult[0].prospectingSkillGoalResults, function (item) {
                                                            return item.skillId == goalitem.skillId;
                                                        });
                                                        if (monthlyResult) {
                                                            goalitem.monthlyResult = monthlyResult.count;
                                                        }
                                                        // todayResult
                                                        var todayResult = _.find(resultItem.todayResult[0].prospectingSkillGoalResults, function (item) {
                                                            return item.skillId == goalitem.skillId;
                                                        });
                                                        if (todayResult) {
                                                            goalitem.dailyResult = todayResult.count;
                                                        }
                                                    })
                                                    //var CalculatedProspectingGoal = _.find(prospectingGoal.calculatedProspectingGoals)
                                                }
                                                if (prospectingGoal.adjustedGoals) {
                                                    _.each(prospectingGoal.adjustedGoals, function (goalitem) {
                                                        // weeklyResult
                                                        var weeklyResult = _.find(resultItem.weeklyResult[0].prospectingSkillGoalResults, function (item) {
                                                            return item.skillId == goalitem.skillId;
                                                        });
                                                        if (weeklyResult) {
                                                            goalitem.weeklyResult = weeklyResult.count;
                                                        }
                                                        // monthlyResult
                                                        var monthlyResult = _.find(resultItem.monthlyResult[0].prospectingSkillGoalResults, function (item) {
                                                            return item.skillId == goalitem.skillId;
                                                        });
                                                        if (monthlyResult) {
                                                            goalitem.monthlyResult = monthlyResult.count;
                                                        }
                                                        // todayResult
                                                        var todayResult = _.find(resultItem.todayResult[0].prospectingSkillGoalResults, function (item) {
                                                            return item.skillId == goalitem.skillId;
                                                        });
                                                        if (todayResult) {
                                                            goalitem.dailyResult = todayResult.count;
                                                        }
                                                    })
                                                }

                                                if (prospectingGoal.currentPerformanceGoals) {
                                                    _.each(prospectingGoal.currentPerformanceGoals, function (goalitem) {
                                                        // weeklyResult
                                                        var weeklyResult = _.find(resultItem.weeklyResult[0].prospectingSkillGoalResults, function (item) {
                                                            return item.skillId == goalitem.skillId;
                                                        });
                                                        if (weeklyResult) {
                                                            goalitem.weeklyResult = weeklyResult.count;
                                                        }
                                                        // monthlyResult
                                                        var monthlyResult = _.find(resultItem.monthlyResult[0].prospectingSkillGoalResults, function (item) {
                                                            return item.skillId == goalitem.skillId;
                                                        });
                                                        if (monthlyResult) {
                                                            goalitem.monthlyResult = monthlyResult.count;
                                                        }
                                                        // todayResult
                                                        var todayResult = _.find(resultItem.todayResult[0].prospectingSkillGoalResults, function (item) {
                                                            return item.skillId == goalitem.skillId;
                                                        });
                                                        if (todayResult) {
                                                            goalitem.dailyResult = todayResult.count;
                                                        }
                                                    })
                                                }
                                                $scope.caculateTotalResult();
                                            }
                                        });
                                        $scope.calculatingProspectingGoalResultSummaryByUserId = false;
                                    });
                                    $scope.GetProjectProspectingGoalResultSummaryByUserId($scope.topBoxFilterOption.userId, $scope.topBoxFilterOption.projectId);
                                });
                            });
                        });
                    }
                    else {
                        $("#tabAll").addClass("active");
                        $(".usertab").removeClass("active");
                        $scope.userTabChanged(0);
                    }
                }
                //Start Task Performance Gauge
                $scope.selectTaskMainFilterGauge = function (skillId) {
                    $scope.mainTaskFilterGaugeText = null;
                    $scope.mainTaskFilterGaugeData = null;
                    if ($scope.taskActivityData) {
                        var selectedSkill = _.find($scope.taskActivityData.prospectingSkillGoalResults, function (item) {
                            return item.skillId == skillId;
                        });
                        if (selectedSkill) {
                            $scope.mainTaskFilterGaugeText = selectedSkill.skillName;
                            $scope.mainTaskFilterGaugeData = selectedSkill;
                            if ($scope.mainTaskFilterGaugeData && $scope.compareTaskFilterGaugeData) {
                                drawPerformanceGauge();
                            }
                        }
                    }
                }
                $scope.selectTaskCompareFilterGauge = function (skillId) {
                    $scope.compareTaskFilterGaugeText = null;
                    $scope.compareTaskFilterGaugeData = null;
                    if ($scope.taskActivityData) {
                        var selectedSkill = _.find($scope.taskActivityData.prospectingSkillGoalResults, function (item) {
                            return item.skillId == skillId;
                        });
                        if (selectedSkill) {
                            $scope.compareTaskFilterGaugeText = selectedSkill.skillName;
                            $scope.compareTaskFilterGaugeData = selectedSkill;
                            if ($scope.mainTaskFilterGaugeData && $scope.compareTaskFilterGaugeData) {
                                drawPerformanceGauge()
                            }
                        }
                    }
                }
                $scope.showTaskMainFilterSkills = function (skill) {
                    if (skill.seqNo) {
                        if (skill.seqNo > 1) {
                            return true;
                        }
                    }
                }
                $scope.showTaskCompareFilterSkills = function (skill) {
                    if ($scope.mainTaskFilterGaugeData) {
                        if (skill.seqNo) {
                            if (skill.seqNo < $scope.mainTaskFilterGaugeData.seqNo) {
                                return true;
                            }
                        }
                        else {
                            if (skill.skillId < $scope.mainTaskFilterGaugeData.skillId) {
                                return true;
                            }
                        }
                    }
                    else {
                        if (skill.seqNo) {
                            if (skill.seqNo < 1) {
                                return true;
                            }
                        }
                    }
                }

                //Start Expired Reason
                $scope.expiredReasonOptions = [
                    {
                        id: 1, name: $translate.instant('TASKPROSPECTING_WAS_BUZY_ALL_DAY_WITH_CUSTOMERS')
                    },
                    {
                        id: 2, name: $translate.instant('TASKPROSPECTING_WAS_NOT_MOTIVATED')
                    },
                    {
                        id: 3, name: $translate.instant('TASKPROSPECTING_HAD_SOME_TECHNICAL_PROBLEMS')
                    },
                    {
                        id: 4, name: $translate.instant('TASKPROSPECTING_NEED_TO_MODIFY_MY_ACTIVITY_GOALS')
                    },
                    {
                        id: 5, name: $translate.instant('TASKPROSPECTING_OTHER')
                    }
                ]
                $scope.openAddActivityReason = function (goalId, activityId) {
                    $scope.ActivityReasonViewOnly = false;
                    $scope.expiredProspectingActivityReason = {
                        reason: "",
                        prospectingActivityId: activityId,
                        reasonId: null,
                    };
                    $("#expiredActivityReasonModal").modal("show");
                };
                $scope.SaveActivityReason = function () {
                    if ($scope.expiredProspectingActivityReason.reasonId) {
                        var expiredReason = _.find($scope.expiredReasonOptions, function (item) {
                            return item.id == $scope.expiredProspectingActivityReason.reasonId;
                        });
                        if (expiredReason) {
                            if (expiredReason.id != 5) {
                                $scope.expiredProspectingActivityReason.reason = expiredReason.name;
                            }
                        }
                    }
                    serviceProspectingManager.SaveActivityReason($scope.expiredProspectingActivityReason).then(function (data) {
                        if (data.id > 0) {
                            dialogService.showNotification($translate.instant('TASKPROSPECTING_REASON_ADDED_SUCCESSFULLY'), 'info');
                            $("#expiredActivityReasonModal").modal("hide");
                            _.each($scope.prospectingGoalActivityInfoes, function (goalActivityInfo) {
                                _.each(goalActivityInfo.prospectingActivities, function (dataItem) {
                                    if (dataItem.id == data.prospectingActivityId) {
                                        dataItem.expiredProspectingActivityReasons.push(data);
                                    };
                                });
                            });
                        }
                        else {
                            dialogService.showNotification($translate.instant('TASKPROSPECTING_REASON_SUBMIT_FAILED'), 'warning');
                        }
                    })
                };
                $scope.CancelActivityReason = function () {
                    $("#expiredActivityReasonModal").modal("hide");
                };
                $scope.openViewActivityReason = function (goalId, activityId) {
                    $scope.ActivityReasonViewOnly = true;
                    var goalActivityInfo = _.find($scope.prospectingGoalActivityInfoes, function (dataItem) {
                        return dataItem.id == goalId;
                    });
                    if (goalActivityInfo) {
                        var actvityInfo = _.find(goalActivityInfo.prospectingActivities, function (dataItem) {
                            return dataItem.id == activityId;
                        });
                        if (actvityInfo) {
                            if (actvityInfo.expiredProspectingActivityReasons.length > 0) {
                                var expiredReason = _.find($scope.expiredReasonOptions, function (item) {
                                    return item.name == actvityInfo.expiredProspectingActivityReasons[0].reason;
                                });
                                $scope.expiredProspectingActivityReason = {
                                    reason: actvityInfo.expiredProspectingActivityReasons[0].reason,
                                    prospectingActivityId: actvityInfo.expiredProspectingActivityReasons[0].prospectingActivityId,
                                    reasonId: 0,
                                }
                                if (expiredReason) {
                                    $scope.expiredProspectingActivityReason.reasonId = expiredReason.id;
                                }
                            }
                        }
                    }
                    $("#expiredActivityReasonModal").modal("show");
                };
                //End Expired Reason
                //Top Box Result
                $scope.checkAndSetScaleColor = function (value, index) {
                    var minPercentage = Math.min.apply(Math, $scope.prospectingScaleRanges.map(function (o) { return o.minPercentage; }));
                    var maxPercentage = Math.max.apply(Math, $scope.prospectingScaleRanges.map(function (o) { return o.maxPercentage; }));
                    if (value < minPercentage) {
                        value = minPercentage;
                    }
                    else if (value > maxPercentage) {
                        value = maxPercentage;
                    }
                    _.each($scope.prospectingScaleRanges, function (scaleItem) {
                        if (value >= scaleItem.minPercentage && value <= scaleItem.maxPercentage) {
                            $scope.scaleColors[index] = scaleItem.color;
                        }
                        else if (value > 100) {
                        }
                    });
                }
                // End Top Box Result


                function ResetAll() {
                    $scope.prospectingGoals = [];
                    $scope.prospectingGoalActivityInfoes = [];
                    $scope.prospectingActivityCustomers = [];
                    $scope.prospectingCustomers = [];
                    $scope.prospectingActivityCustomerResults = [];
                    $scope.scaleColors = ['', '', ''];
                    $scope.topBoxFilterOption.prospectingGoalId = 0;
                    $scope.topBoxFilterOption.userId = 0;
                    $scope.topBoxFilterOption.userName = $translate.instant('TASKPROSPECTING_ALL_MEMBERS');

                    $scope.TotalGoalData = [0, 0, 0];
                    $scope.TotalResultData = [0, 0, 0];

                    $scope.TotalPercetageData = [0, 0, 0];
                    $scope.RemainingTotalGoalData = [0, 0, 0];
                    $scope.AdgustedPercetageData = [0, 0, 0];
                    $scope.CurrentPerformanceTotalGoalData = [0, 0, 0];
                    $scope.CurrentPerformancePercetageData = [0, 0, 0];

                    $scope.topBoxFilterOption.prospectingGoalIds = [];
                }
                $scope.fiterProspectingGoalChanged = function () {
                    $scope.resultFilterOptionChanged();
                    $scope.ActivityProspectingGoalFilterChanged($scope.topBoxFilterOption.prospectingGoalId);
                    var filteredTodos = $scope.prospectingTaskTodos;
                    if ($scope.topBoxFilterOption.prospectingGoalId > 0) {
                        var prospectingGoal = _.find($scope.prospectingGoals, function (goalItem) {
                            return goalItem.id == $scope.topBoxFilterOption.prospectingGoalId;
                        });
                        if (prospectingGoal) {
                            filteredTodos = _.filter(filteredTodos, function (todoItem) {
                                return todoItem.id == prospectingGoal.taskId;
                            });
                            moment.locale(globalVariables.lang.currentUICulture);
                            $scope.totalStartDate = moment(kendo.parseDate(prospectingGoal.goalStartDate))._d;
                            $scope.totalEndDate = moment(kendo.parseDate(prospectingGoal.goalEndDate))._d;
                        }
                        var gridObj = $("#meetingCustomers").data("kendoGrid");
                        if (gridObj) {
                            var filterOption = [{
                                logic: "or",
                                filters: []
                            }];
                            if (gridObj) {
                                if ($scope.topBoxFilterOption.prospectingGoalId > 0) {
                                    filterOption[0].filters.push({
                                        field: 'prospectingGoalId',
                                        operator: 'eq',
                                        value: $scope.topBoxFilterOption.prospectingGoalId,
                                    });
                                }
                            }

                            _.each($scope.selectedProjectMembers, function (item) {
                                filterOption[0].filters.push({
                                    field: 'prospectingGoalUserId',
                                    operator: 'eq',
                                    value: item.id
                                });
                            });

                            if (filterOption[0].filters.length > 0) {
                                gridObj.dataSource.filter(filterOption);
                            }
                            else {
                                gridObj.dataSource.filter([]);
                            }
                        }

                    }
                    else {
                        var allGoalStartDates = [];
                        var allGoalEndDates = [];
                        _.each($scope.prospectingGoals, function (item) {
                            if (item.taskId) {
                                allGoalStartDates.push(moment(kendo.parseDate(item.goalStartDate))._d);
                                allGoalEndDates.push(moment(kendo.parseDate(item.goalEndDate))._d);
                            }
                        });

                        if (allGoalStartDates.length > 0 && allGoalEndDates.length > 0) {

                            allGoalStartDates = _.sortBy(allGoalStartDates, function (value) {
                                return value;
                            });
                            allGoalEndDates = _.sortBy(allGoalEndDates, function (value) {
                                return value;
                            });
                            moment.locale(globalVariables.lang.currentUICulture);
                            $scope.totalStartDate = moment(allGoalStartDates[0])._d;
                            $scope.totalEndDate = moment(allGoalEndDates[allGoalEndDates.length - 1])._d;
                        }
                    }
                    if (filteredTodos.length > 0) {
                        $scope.performanceDashboardTaskChanged(filteredTodos[filteredTodos.length - 1].id);
                    }
                    else {
                        $scope.performanceDashboardTaskChanged(null);
                    }
                    serviceProspectingManager.getProspectingScaleRangesByGoalId($scope.topBoxFilterOption.prospectingGoalId).then(function (data) {
                        if (data.length > 0) {
                            $scope.prospectingScaleRanges = [];
                            console.log("fiterProspectingGoalChanged");
                            _.each(data, function (dataItem) {
                                $scope.prospectingScaleRanges.push({
                                    min: dataItem.min,
                                    max: dataItem.max,
                                    from: dataItem.min,
                                    to: dataItem.max,
                                    color: dataItem.color,
                                    minPercentage: dataItem.min,
                                    maxPercentage: dataItem.max,
                                    prospectingGoalId: $scope.topBoxFilterOption.prospectingGoalId,
                                });
                            });
                        }
                        else {
                            $scope.prospectingScaleRanges = [
                                {
                                    color: "#f00",
                                    from: 0,
                                    max: 5,
                                    maxPercentage: 50,
                                    min: 0,
                                    minPercentage: 0,
                                    to: 50
                                },
                                {
                                    color: "#ff0   ",
                                    from: 50,
                                    max: 7,
                                    maxPercentage: 70,
                                    min: 5,
                                    minPercentage: 50,
                                    to: 70,
                                },
                                {
                                    color: "#0f0   ",
                                    from: 70,
                                    max: 10,
                                    maxPercentage: 100,
                                    min: 7,
                                    minPercentage: 70,
                                    to: 100,
                                }
                            ];
                        }
                    });

                }
            }
        ])