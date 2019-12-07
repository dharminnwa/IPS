angular.module('ips.serviceProspecting')
    .config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {

        var measureServiceProspectingResolve = {
            pageName: function ($translate) {
                return $translate.instant('TASKPROSPECTING_TASKPROSPECTING_PAGE_NAME');//'Task Prospecting';
            },

        };
        $stateProvider
            .state('home.serviceProspecting.measure', {
                url: "/measure",
                templateUrl: "views/serviceProspecting/views/measure.html",
                controller: "MeasureServiceProspectingCtrl",
                resolve: measureServiceProspectingResolve,
                data: {
                    displayName: '{{pageName}}',//'Training Diary',
                    paneLimit: 1,
                    depth: 2
                }
            })

    }])
    .controller("MeasureServiceProspectingCtrl", ['$scope', 'cssInjector', '$stateParams', '$location', 'todoManager', 'todosManager', 'serviceProspectingManager', 'dialogService', 'progressBar', 'localStorageService', '$compile', 'projectRolesEnum', '$translate', 'prospectingTypesEnum', 'globalVariables',
        function ($scope, cssInjector, $stateParams, $location, todoManager, todosManager, serviceProspectingManager, dialogService, progressBar, localStorageService, $compile, projectRolesEnum, $translate, prospectingTypesEnum, globalVariables) {
            cssInjector.removeAll();
            cssInjector.add('views/taskProspecting/sales-prospecting-measure.css');
            cssInjector.add('views/taskProspecting/ips-run.css');
            var authData = localStorageService.get('authorizationData');
            $scope.defaultTaskProspecting = localStorageService.get("prospectingTask");
            localStorageService.set("prospectingTask", null);
            $scope.currentUser = authData.user;
            $scope.today = new Date().setHours(0, 0, 0, 0);
            moment.locale(globalVariables.lang.currentUICulture);
            var endDay = moment();
            $scope.endOfDay = endDay.endOf('day')._d;

            var startDay = moment();
            $scope.todayStartDate = moment().startOf("day")._d;
            var endDay = moment();
            $scope.todayEndDate = moment().endOf('day')._d;

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
                { id: 3, name: $translate.instant('TASKPROSPECTING_TOTAL') },
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
                userName: $translate.instant('TASKPROSPECTING_ALL_MEMBERS'),//"All Members",
                calls: true,
                talks: true,
                service: true,
                
                topboxResultOptionId: $scope.resultFilterOptionEnums.Total,
                topboxResultTypeId: $scope.topboxResultTypeEnum.Counts,
                aggregteDashboard: true,
                taskDashboard: false,
                chartResult: false,
                todaysTask: false,
                goalsAndPerformance: false,
                activityResult: false,
            };
            $scope.topboxResultTypes = [
                { id: 1, name: $translate.instant('TASKPROSPECTING_PERCENTAGE') },
                { id: 2, name: $translate.instant('TASKPROSPECTING_RESULT_VS_GOAL') },
                { id: 3, name: $translate.instant('TASKPROSPECTING_REMAINING_GOAL') },
                { id: 4, name: $translate.instant('TASKPROSPECTING_CURRENT_PERFORMANCE_RESULT') },
                { id: 5, name: $translate.instant('TASKPROSPECTING_CURRENT_PERFORMANCE_PERCENTAGE') }
            ];
            $scope.projects = [];
            $scope.TotalGoalData = [0, 0, 0, 0, 0];
            $scope.TotalResultData = [0, 0, 0, 0, 0];
            $scope.TotalPercetageData = [0, 0, 0, 0, 0];
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
            $scope.activityProspectingGoalFilterText = $translate.instant('COMMON_ALL');
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
            $scope.taskProspectingScaleRanges = [];
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
                        $scope.projects.unshift({ id: 0, name: "Tasks without project" });
                    }
                    else {
                        $scope.projects.push({ id: 0, name: "Tasks without project" });
                        $scope.topBoxFilterOption.projectId = 0;
                        //dialogService.showNotification("No Any Active Projects for you", "warning");
                    }
                    $scope.fiterProjectChanged();
                })
                $('[data-toggle="m-popover"]').popover({
                    placement: 'bottom',
                    html: 'true',
                    title: '<span class="text-info"><strong>Info</strong></span> <i class="fa fa-lg fa-close pull-right"></i>',
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
                $scope.topBoxFilterOption.userName = $translate.instant('TASKPROSPECTING_ALL_MEMBERS');//"All Members";
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
                    todosManager.getTaskProspectingProjectMembers($scope.topBoxFilterOption.projectId).then(function (taskProspectingProjectMembers) {
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

                    $scope.prospectingGoals = [];
                    $scope.prospectingGoalActivityInfoes = [];
                    $scope.prospectingActivityCustomers = [];
                    $scope.prospectingCustomers = [];
                    $scope.prospectingActivityCustomerResults = [];
                    $scope.TotalGoalData = [0, 0, 0, 0, 0];
                    $scope.TotalResultData = [0, 0, 0, 0, 0];
                    $scope.TotalPercetageData = [0, 0, 0, 0, 0];
                    $scope.RemainingTotalGoalData = [0, 0, 0, 0, 0];
                    $scope.AdgustedPercetageData = [0, 0, 0, 0, 0];
                    $scope.CurrentPerformanceTotalGoalData = [0, 0, 0, 0, 0];
                    $scope.CurrentPerformancePercetageData = [0, 0, 0, 0, 0];
                    $scope.scaleColors = ['', '', ''];
                    $scope.viewProspectingActivityResultData = [];
                    $scope.calculatingGoalResultSummary = true;
                    $scope.topBoxFilterOption.prospectingGoalIds = [];
                    $scope.topBoxFilterOption.userId = 0;
                    $scope.topBoxFilterOption.userName = $translate.instant('TASKPROSPECTING_ALL_MEMBERS');//"All Members";
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
                                        var occurrences = event.expand(kendo.parseDate(item.startDate), new Date(item.dueDate));
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
                    serviceProspectingManager.getProspectingCustomerResultsByUserIds(userIds).then(function (data) {
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
                                        $scope.prospectingSkills = data;
                                        _.each(item.prospectingSkillGoals, function (dataItem) {
                                            var skillinfo = _.find($scope.prospectingSkills, function (skillItem) {
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
                        $scope.prospectingGoals = [];
                        $scope.prospectingGoalActivityInfoes = [];
                        $scope.prospectingActivityCustomers = [];
                        $scope.prospectingCustomers = [];
                        $scope.prospectingActivityCustomerResults = [];
                        $scope.TotalGoalData = [0, 0, 0, 0, 0];
                        $scope.TotalResultData = [0, 0, 0, 0, 0];
                        $scope.TotalPercetageData = [0, 0, 0, 0, 0];
                        $scope.RemainingTotalGoalData = [0, 0, 0, 0, 0];
                        $scope.AdgustedPercetageData = [0, 0, 0, 0, 0];
                        $scope.CurrentPerformanceTotalGoalData = [0, 0, 0, 0, 0];
                        $scope.CurrentPerformancePercetageData = [0, 0, 0, 0, 0];
                        $scope.scaleColors = ['', '', ''];
                        $scope.calculatingGoalResultSummary = true;
                        $scope.topBoxFilterOption.prospectingGoalIds = [];
                        $scope.topBoxFilterOption.userId = userId;
                        $scope.viewProspectingActivityResultData = [];
                        $scope.selectedProjectMembers = [];
                        var user = _.find($scope.projectMembers, function (memberItem) {
                            return memberItem.id == userId;
                        });
                        if (user) {
                            $scope.topBoxFilterOption.userName = user.firstName + " " + user.lastName;
                        }
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
                                    return item.prospectingCustomer.prospectingGoalId
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
                                    $scope.prospectingGoalItems.push({ id: item.id, name: item.name, taskId: item.taskId, seq: sortedIndexOfGoal, goalStartDate: moment(kendo.parseDate(item.goalStartDate))._d, goalEndDate: moment(kendo.parseDate(item.goalEndDate))._d });
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
                                            $scope.prospectingSkills = data;
                                            _.each(item.prospectingSkillGoals, function (dataItem) {
                                                var skillinfo = _.find($scope.prospectingSkills, function (skillItem) {
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
            //$scope.resultFilterOptionChanged = function () { }
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
                            id: null, name: "--" + $translate.instant('COMMON_SELECT') + "--"
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
                                return item.activityEnd < $scope.todayStartDate;
                            })
                            $scope.taskProspectingActivities.unshift({ id: 0, name: $translate.instant('COMMON_ALL') });
                            $scope.taskProspectingActivities.unshift({ id: null, name: "--" + $translate.instant('COMMON_SELECT') + "--" });
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
                        if ($scope.selectedProspectingGoal) {
                            getTaskProsepectingActvitiyPerformnaceData($scope.selectedProspectingGoal.id, $scope.selectedprospectingActivity.id, $scope.selectedProspectingGoal.userId);
                        }
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
            $scope.selectMainFilterGauge = function (skillId) {
                $scope.mainFilterGaugeText = null;
                $scope.mainFilterGaugeData = null;
                if ($scope.taskActivityData) {
                    var selectedSkill = _.find($scope.taskActivityData.prospectingSkillGoalResults, function (item) {
                        return item.skillId == skillId;
                    });
                    if (selectedSkill) {
                        $scope.mainFilterGaugeText = selectedSkill.skillName;
                        $scope.mainFilterGaugeData = selectedSkill;
                        if ($scope.mainFilterGaugeData && $scope.compareFilterGaugeData) {
                            drawPerformanceGauge()
                        }
                    }
                }
            }
            $scope.selectCompareFilterGauge = function (skillId) {
                $scope.compareFilterGaugeText = null;
                $scope.compareFilterGaugeData = null;
                if ($scope.taskActivityData) {
                    var selectedSkill = _.find($scope.taskActivityData.prospectingSkillGoalResults, function (item) {
                        return item.skillId == skillId;
                    });
                    if (selectedSkill) {
                        $scope.compareFilterGaugeText = selectedSkill.skillName;
                        $scope.compareFilterGaugeData = selectedSkill;
                        if ($scope.mainFilterGaugeData && $scope.compareFilterGaugeData) {
                            drawPerformanceGauge()
                        }
                    }
                }
            }
            $scope.showMainFilterSkills = function (skill) {
                if (skill.seqNo) {
                    if (skill.seqNo > 1) {
                        return true;
                    }
                }
            }
            $scope.showCompareFilterSkills = function (skill) {
                if ($scope.mainFilterGaugeData) {
                    if (skill.seqNo) {
                        if (skill.seqNo < $scope.mainFilterGaugeData.seqNo) {
                            return true;
                        }
                    }
                    else {
                        if (skill.skillId < $scope.mainFilterGaugeData.skillId) {
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
            function getCompareTaskProsepectingActvitiyPerformnaceData(goalId, activityId, userid) {
                serviceProspectingManager.getTaskProsepectingActvitiyPerformnaceData(goalId, activityId, userid).then(function (data) {
                    if (data) {
                        $scope.taskCompareActivityData = data;
                        setTimeout(function () {
                            drawGauge();
                        }, 100)
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
            $scope.chartFilterOptionModel = {
                taskId: null,
                userId: $scope.topBoxFilterOption.userId, //$scope.topBoxFilterOption.userId,
                startDate: null,
                endDate: null,
                selectedOptionValue: null,
                selectedOptionText: null,
            }
            $scope.chartFilterOptionEnums = {
                Monthly: 1,
                Weekly: 2,
                Total: 3,
                DateRange: 4
            }
            $scope.chartFilterOptions = [
                { id: 1, name: $translate.instant('TASKPROSPECTING_MONTHLY') },
                { id: 2, name: $translate.instant('TASKPROSPECTING_WEEKLY') },
                { id: 3, name: $translate.instant('TASKPROSPECTING_TOTAL') },
                { id: 4, name: $translate.instant('COMMON_DATE_RANGE') }
            ];

            $scope.chartFilterOptionChanged = function (value) {
                var option = _.find($scope.chartFilterOptions, function (item) {
                    return item.id == value;
                });

                $scope.chartFilterOptionModel = {
                    taskId: $scope.selectedperformanceDashboardTask.id,
                    userId: $scope.selectedProspectingGoal.userId, //$scope.topBoxFilterOption.userId,
                    startDate: null,
                    endDate: null,
                    selectedOptionValue: value,
                    selectedOptionText: option.name,
                }
                

            }

            $scope.chartFilterStartDateOpen = function (event) {
                var datepicker = $(event.sender.element).data("kendoDateTimePicker");
                datepicker.setOptions({
                    max: kendo.parseDate($scope.todayStartDate),
                });
            }
            $scope.chartFilterStartDateChange = function (event) {
                $scope.chartFilterOptionModel.startDate = moment(event.sender.value()).format("L LT");
                if (moment(kendo.parseDate($scope.chartFilterOptionModel.startDate)).isAfter(moment(kendo.parseDate($scope.chartFilterOptionModel.endDate)))) {
                    $scope.chartFilterOptionModel.endDate = null;
                }
                if ($scope.chartFilterOptionModel.startDate && $scope.chartFilterOptionModel.endDate) {
                    FilterChart();
                }
            }
            $scope.chartFilterEndDateOpen = function (event) {
                var datepicker = $(event.sender.element).data("kendoDateTimePicker");
                datepicker.setOptions({
                    min: kendo.parseDate($scope.chartFilterOptionModel.startDate),
                    max: kendo.parseDate($scope.todayStartDate),
                });
            }
            $scope.chartFilterEndDateChange = function (event) {
                $scope.chartFilterOptionModel.endDate = moment(event.sender.value()).format("L LT");
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
                    return kendo.parseDate(activityItem.activityStart) >= $scope.todayStartDate && kendo.parseDate(activityItem.activityEnd) <= $scope.todayEndDate
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
                    return kendo.parseDate(activityItem.activityStart) >= $scope.todayStartDate;
                });
                var todayActivities = _.filter(activities, function (activityItem) {
                    return kendo.parseDate(activityItem.activityStart) >= $scope.todayStartDate && kendo.parseDate(activityItem.activityEnd) <= $scope.todayEndDate
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
                    return ((kendo.parseDate(item.activityStart) < $scope.todayStartDate) || (kendo.parseDate(item.activityStart) >= $scope.todayStartDate && kendo.parseDate(item.activityEnd) <= $scope.todayEndDate));
                });
                var todayActivities = _.filter(activities, function (activityItem) {
                    return kendo.parseDate(activityItem.activityStart) >= $scope.todayStartDate && kendo.parseDate(activityItem.activityEnd) <= $scope.todayEndDate
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
                    $scope.topBoxFilterOption.userName = $translate.instant('TASKPROSPECTING_ALL_MEMBERS');//"All Members";
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
                    if (data) {
                        if (data.length > 0) {
                            columns.push({ field: "userName", title: $translate.instant('TASKPROSPECTING_SELLER'), hidden: ($scope.topBoxFilterOption.userId != 0), width:"150px" });
                            columns.push({ field: "projectName", title: $translate.instant('TASKPROSPECTING_PROJECT_NAME'), width: "150px" });
                            columns.push({ field: "prospectingName", title: $translate.instant('TASKPROSPECTING_PROSPECTING_NAME'), footerTemplate: "Total", width: "250px" });
                            if (data[0].weeklyResult.length > 0) {
                                if (data[0].weeklyResult[0].prospectingSkillGoalResults.length > 0) {
                                    _.each(data[0].weeklyResult[0].prospectingSkillGoalResults, function (skillGoalItem) {
                                        columns.push({
                                            field: skillGoalItem.skillName + "_Goal", title: skillGoalItem.skillName + " " + $translate.instant('TASKPROSPECTING_GOAL'), aggregates: ["sum"],
                                            footerTemplate: function (data) {
                                                var resultSum = Math.round(data[skillGoalItem.skillName + "_Goal"].sum * 100) / 100;
                                                return "<div class='text-center'> " + resultSum + " </div>";
                                            },
                                            attributes: {
                                                "class": "text-center"
                                            },
                                            width: "150px"
                                        })
                                        columns.push({
                                            field: skillGoalItem.skillName + "_Count", title: skillGoalItem.skillName + " " + $translate.instant('TASKPROSPECTING_COUNT'), aggregates: ["sum"],
                                            footerTemplate: function (data) {
                                                var resultSum = Math.round(data[skillGoalItem.skillName + "_Count"].sum * 100) / 100;
                                                return "<div class='text-center'> " + resultSum + " </div>";
                                            },
                                            attributes: {
                                                "class": "text-center"
                                            }, template: function (data, value) {
                                                return data[skillGoalItem.skillName + "_Count"] + " <i class='fa fa-lg fa-eye' ng-click='viewProspectingResults(" + data.prospectingGoalId + "," + data.skillId + "," + skillGoalItem.seqNo + ")'></i>"
                                            },
                                            width: "150px"
                                        })
                                        columns.push({
                                            field: skillGoalItem.skillName + "_Result", title: skillGoalItem.skillName + " " + $translate.instant('TASKPROSPECTING_RESULT'), attributes: {
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
                                            width: "150px"
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

                                                    if (skill) {
                                                        rowdata[skill.skillName + "_Goal"] = skillCalculatedGoal.weekly;
                                                        rowdata[skill.skillName + "_Count"] = skillCalculatedGoal.weeklyResult;
                                                    }
                                                    else {
                                                        rowdata[skillGoalItem.skillName + "_Goal"] = skillCalculatedGoal.weekly;
                                                        rowdata[skillGoalItem.skillName + "_Count"] = skillCalculatedGoal.weeklyResult;
                                                    }

                                                    var resultAvg = 0;
                                                    if (!isNaN((skillCalculatedGoal.weeklyResult / skillCalculatedGoal.weekly))) {
                                                        resultAvg = parseFloat((skillCalculatedGoal.weeklyResult / skillCalculatedGoal.weekly) * 100).toFixed(2);
                                                    }
                                                    if (skill) {
                                                        rowdata[skill.skillName + "_Result"] = resultAvg;
                                                    }
                                                    else {
                                                        rowdata[skillGoalItem.skillName + "_Result"] = resultAvg;
                                                    }

                                                }
                                                else {
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
                }
                else if (filterValue == $scope.resultFilterOptionEnums.Monthly) {
                    if (data) {
                        if (data.length > 0) {
                            columns.push({
                                field: "prospectingName", title: $translate.instant('TASKPROSPECTING_PROSPECTING_NAME'),
                                footerTemplate: "Total",
                                width: "250px"

                            });
                            if (data[0].monthlyResult.length > 0) {
                                if (data[0].monthlyResult[0].prospectingSkillGoalResults.length > 0) {
                                    _.each(data[0].monthlyResult[0].prospectingSkillGoalResults, function (skillGoalItem) {
                                        columns.push({
                                            field: skillGoalItem.skillName + "_Goal", title: skillGoalItem.skillName + " " + $translate.instant('TASKPROSPECTING_GOAL'), aggregates: ["sum"],
                                            footerTemplate: function (data) {
                                                var resultSum = Math.round(data[skillGoalItem.skillName + "_Goal"].sum * 100) / 100;
                                                return "<div class='text-center'> " + resultSum + " </div>";
                                            },
                                            attributes: {
                                                "class": "text-center"
                                            },
                                            width: "150px"
                                        })
                                        columns.push({
                                            field: skillGoalItem.skillName + "_Count", title: skillGoalItem.skillName + " " + $translate.instant('TASKPROSPECTING_COUNT'), aggregates: ["sum"],
                                            footerTemplate: function (data) {
                                                var resultSum = Math.round(data[skillGoalItem.skillName + "_Count"].sum * 100) / 100;
                                                return "<div class='text-center'> " + resultSum + " </div>";
                                            },
                                            attributes: {
                                                "class": "text-center"
                                            }, template: function (data, value) {
                                                return data[skillGoalItem.skillName + "_Count"] + " <i class='fa fa-lg fa-eye' ng-click='viewProspectingResults(" + data.prospectingGoalId + "," + data.skillId + "," + skillGoalItem.seqNo + ")'></i>"
                                            },
                                            width: "150px"
                                        })
                                        columns.push({
                                            field: skillGoalItem.skillName + "_Result", title: skillGoalItem.skillName + " " + $translate.instant('TASKPROSPECTING_RESULT'), attributes: {
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
                                            width: "150px"
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
                                                    if (skill) {
                                                        rowdata[skill.skillName + "_Goal"] = skillCalculatedGoal.monthly;
                                                        rowdata[skill.skillName + "_Count"] = skillCalculatedGoal.monthlyResult;
                                                    }
                                                    else {
                                                        rowdata[skillGoalItem.skillName + "_Goal"] = skillCalculatedGoal.monthly;
                                                        rowdata[skillGoalItem.skillName + "_Count"] = skillCalculatedGoal.monthlyResult;
                                                    }

                                                    var resultAvg = 0;
                                                    if (!isNaN((skillCalculatedGoal.monthlyResult / skillCalculatedGoal.monthly))) {
                                                        resultAvg = parseFloat((skillCalculatedGoal.monthlyResult / skillCalculatedGoal.monthly) * 100).toFixed(2);
                                                    }
                                                    if (skill) {
                                                        rowdata[skill.skillName + "_Result"] = resultAvg;
                                                    }
                                                    else {
                                                        rowdata[skillGoalItem.skillName + "_Result"] = resultAvg;
                                                    }
                                                }
                                                else {
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
                }
                else if (filterValue == $scope.resultFilterOptionEnums.Total) {
                    if (data) {
                        if (data.length > 0) {
                            columns.push({ field: "userName", title: $translate.instant('TASKPROSPECTING_SELLER'), hidden: ($scope.topBoxFilterOption.userId != 0), width: "150px" });
                            columns.push({ field: "projectName", title: $translate.instant('TASKPROSPECTING_PROJECT_NAME'), width: "150px" });
                            columns.push({ field: "prospectingName", title: $translate.instant('TASKPROSPECTING_PROSPECTING_NAME'), footerTemplate: "Total", width: "250px" });
                            if (data[0].totalResult.length > 0) {
                                if (data[0].totalResult[0].prospectingSkillGoalResults.length > 0) {
                                    _.each(data[0].totalResult[0].prospectingSkillGoalResults, function (skillGoalItem) {
                                        columns.push({
                                            field: skillGoalItem.skillName + "_Goal", title: skillGoalItem.skillName + " " + $translate.instant('TASKPROSPECTING_GOAL'), aggregates: ["sum"],
                                            footerTemplate: function (data) {
                                                var resultSum = Math.round(data[skillGoalItem.skillName + "_Goal"].sum * 100) / 100;
                                                return "<div class='text-center'> " + resultSum + " </div>";
                                            },
                                            attributes: {
                                                "class": "text-center"
                                            },
                                            width: "150px"
                                        })
                                        columns.push({
                                            field: skillGoalItem.skillName + "_Count", title: skillGoalItem.skillName + " " + $translate.instant('TASKPROSPECTING_COUNT'), aggregates: ["sum"],
                                            footerTemplate: function (data) {
                                                var resultSum = Math.round(data[skillGoalItem.skillName + "_Count"].sum * 100) / 100;
                                                return "<div class='text-center'> " + resultSum + " </div>";
                                            },
                                            attributes: {
                                                "class": "text-center"
                                            }, template: function (data, value) {
                                                return data[skillGoalItem.skillName + "_Count"] + " <i class='fa fa-lg fa-eye' ng-click='viewProspectingResults(" + data.prospectingGoalId + "," + data.skillId + "," + skillGoalItem.seqNo + ")'></i>"
                                            },
                                            width: "150px"
                                        })
                                        columns.push({
                                            field: skillGoalItem.skillName + "_Result", title: skillGoalItem.skillName + " " + $translate.instant('TASKPROSPECTING_RESULT'), attributes: {
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
                                            width: "150px"
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
                }
                else if (filterValue == $scope.resultFilterOptionEnums.Today) {
                    if (data) {
                        if (data.length > 0) {
                            columns.push({ field: "userName", title: $translate.instant('TASKPROSPECTING_SELLER'), hidden: ($scope.topBoxFilterOption.userId != 0), width: '150px',},);
                            columns.push({ field: "projectName", title: $translate.instant('TASKPROSPECTING_PROJECT_NAME'), width: '150px' });
                            columns.push({ field: "prospectingName", title: $translate.instant('TASKPROSPECTING_PROSPECTING_NAME'), footerTemplate: "Total", width: '250px' });
                            if (data[0].todayResult.length > 0) {
                                if (data[0].todayResult[0].prospectingSkillGoalResults.length > 0) {
                                    _.each(data[0].todayResult[0].prospectingSkillGoalResults, function (skillGoalItem) {
                                        columns.push({
                                            field: skillGoalItem.skillName + "_Goal", title: skillGoalItem.skillName + " " + $translate.instant('TASKPROSPECTING_GOAL'), aggregates: ["sum"],
                                            attributes: {
                                                "class": "text-center"
                                            },
                                            footerTemplate: function (data) {
                                                var resultSum = Math.round(data[skillGoalItem.skillName + "_Goal"].sum * 100) / 100;
                                                return "<div class='text-center'> " + resultSum + " </div>";
                                            },
                                            width:'150px',
                                        })
                                        columns.push({
                                            field: skillGoalItem.skillName + "_Count", title: skillGoalItem.skillName + " " + $translate.instant('TASKPROSPECTING_COUNT'), aggregates: ["sum"],
                                            footerTemplate: function (data) {
                                                var resultSum = Math.round(data[skillGoalItem.skillName + "_Count"].sum * 100) / 100;
                                                return "<div class='text-center'> " + resultSum + " </div>";
                                            }, attributes: {
                                                "class": "text-center"
                                            }, template: function (data, value) {
                                                return data[skillGoalItem.skillName + "_Count"] + " <i class='fa fa-lg fa-eye' ng-click='viewProspectingResults(" + data.prospectingGoalId + "," + data.skillId + "," + skillGoalItem.seqNo + ")'></i>"
                                            },
                                            width: '150px',
                                        })
                                        columns.push({
                                            field: skillGoalItem.skillName + "_Result", title: skillGoalItem.skillName + " " + $translate.instant('TASKPROSPECTING_RESULT'), attributes: {
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
                                            width: '150px',
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
                                                    if (skill) {
                                                        rowdata[skill.skillName + "_Goal"] = skillCalculatedGoal.daily;
                                                        rowdata[skill.skillName + "_Count"] = skillCalculatedGoal.dailyResult;
                                                    }
                                                    else {
                                                        rowdata[skillGoalItem.skillName + "_Goal"] = skillCalculatedGoal.daily;
                                                        rowdata[skillGoalItem.skillName + "_Count"] = skillCalculatedGoal.dailyResult;
                                                    }
                                                    var resultAvg = 0;
                                                    if (!isNaN((skillCalculatedGoal.dailyResult / skillCalculatedGoal.daily))) {
                                                        resultAvg = parseFloat((skillCalculatedGoal.dailyResult / skillCalculatedGoal.daily) * 100).toFixed(2);
                                                    }
                                                    if (skill) {
                                                        rowdata[skill.skillName + "_Result"] = resultAvg;
                                                    }
                                                    else {
                                                        rowdata[skillGoalItem.skillName + "_Result"] = resultAvg;
                                                    }
                                                }
                                                else {
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
                if (gridData.length > 0) {
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
                }
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
                setTimeout(function () {
                    if (!$scope.taskProspectingScaleRanges.length > 0) {
                        $scope.taskProspectingScaleRanges = _.clone($scope.prospectingScaleRanges);
                    }
                    _.each(skillsList, function (skillDataItem) {
                        var calculatedAggregatedResultObj = _.find($scope.aggregateProspectingData, function (item) {
                            return item.skillName == skillDataItem;
                        })
                        if (calculatedAggregatedResultObj) {
                            if (calculatedAggregatedResultObj.result > 100) {
                                $("#home_serviceprospectingaggregated_" + skillDataItem + "_gauge").kendoRadialGauge({
                                    pointer: [{
                                        value: calculatedAggregatedResultObj.result,
                                        color: "#3598dc",
                                    }],
                                    scale: {
                                        min: 0,
                                        minorUnit: 5,
                                        startAngle: -30,
                                        endAngle: 210,
                                        max: calculatedAggregatedResultObj.result > 100 ? calculatedAggregatedResultObj.result : 100,
                                        ranges: $scope.scaleRanges,
                                    }
                                });
                            }
                            else {
                                $("#home_serviceprospectingaggregated_" + skillDataItem + "_gauge").kendoRadialGauge({
                                    pointer: [{
                                        value: calculatedAggregatedResultObj.result,
                                        color: "#3598dc",
                                    }],
                                    scale: {
                                        min: $scope.taskProspectingScaleRanges[0].minPercentage,
                                        minorUnit: 5,
                                        startAngle: -30,
                                        endAngle: 210,
                                        max: calculatedAggregatedResultObj.result > 100 ? calculatedAggregatedResultObj.result : 100,
                                        ranges: $scope.taskProspectingScaleRanges,
                                    }
                                });
                            }
                        }
                    })
                }, 500)

            }
            $scope.openProspectingResultPopupMode = {
                isPopupOpen: false
            }
            $scope.viewProspectingResults = function (prospectingGoalId, skillId, seqNo) {
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
                var html = '<div><prospecting-result-popup prospecting-goal-id="' + prospectingGoalId + '"' +
                    'skill-id="' + skillId + '"' +
                    'seq-no="' + seqNo + '"' +
                    'prospecting-goal-activity-infoes = "prospectingGoalActivityInfoes"' +
                    'skills-for-all="skillsForAll"' +
                    'top-box-filter-option = "topBoxFilterOption"' +
                    'open-prospecting-result-popup-mode="openProspectingResultPopupMode">' +
                    '</prospecting-result-popup></div>';
                var linkFn = $compile(html);
                var content = linkFn($scope);
                $("#prospecting-result-popup-div").html(content);
                $scope.openProspectingResultPopupMode.isPopupOpen = true;
            }
            $scope.caculateTotalResult = function () {
                $scope.TotalGoalData = [0, 0, 0, 0, 0];
                $scope.TotalResultData = [0, 0, 0, 0, 0];
                $scope.TotalPercetageData = [0, 0, 0, 0, 0];
                $scope.RemainingTotalGoalData = [0, 0, 0, 0, 0];
                $scope.AdgustedPercetageData = [0, 0, 0, 0, 0];
                $scope.CurrentPerformanceTotalGoalData = [0, 0, 0, 0, 0];
                $scope.CurrentPerformancePercetageData = [0, 0, 0, 0, 0];
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
                else {
                    filteredProspectingGoals = _.filter($scope.prospectingGoals, function (goalItem) {
                        return true;
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
                                    item.status = "Completed";
                                }
                                else {
                                    if (moment(kendo.parseDate(item.activityEnd)).isBefore(moment($scope.today))) {
                                        item.status = "Expired";
                                    }
                                    else if (moment(kendo.parseDate(item.activityStart)).isAfter(moment($scope.endOfDay))) {
                                        item.status = "Upcoming";
                                    }
                                    else {
                                        item.status = "Active";
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
                    dialogService.showNotification($translate.instant('TASKPROSPECTING_YOU_CANT_FILTER_AT_THIS_MOMENT_BECAUSE_YOU_HAVE_STARTED_ACTIVITY'), "warning");
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
                    dialogService.showNotification($translate.instant('TASKPROSPECTING_YOU_CANT_FILTER_AT_THIS_MOMENT_BECAUSE_YOU_HAVE_STARTED_ACTIVITY'), "warning");
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
                        if (moment(kendo.parseDate(item.activityStart)).isAfter(moment($scope.today)) && moment(kendo.parseDate(item.activityStart)).isBefore(moment($scope.endOfDay))) {
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
                        if (moment(kendo.parseDate(item.actvitiyStart)).isBefore(moment($scope.todayEndDate)) && moment(kendo.parseDate(item.actvitiyEnd)).isBefore(moment($scope.todayEndDate))) {
                            categories.push(item.actvitiyName + "_" + moment(kendo.parseDate(item.actvitiyStart)).format("MM.DD.YYYY"));
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
                    if (categories.length > 20) {
                        if (!($("#taskprospectingfloatchart").parent().width() > (categories.length * 35))) {
                            $("#taskprospectingfloatchart").width(categories.length * 35);
                        }
                    }
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
            function memberChanged() {
                if ($scope.selectedProjectMembers.length > 0 && $scope.topBoxFilterOption.userId == 0) {
                    $("#tabAll").removeClass("active");
                    $scope.prospectingGoals = [];
                    $scope.prospectingGoalActivityInfoes = [];
                    $scope.prospectingActivityCustomers = [];
                    $scope.prospectingCustomers = [];
                    $scope.prospectingActivityCustomerResults = [];
                    $scope.TotalGoalData = [0, 0, 0, 0, 0];
                    $scope.TotalResultData = [0, 0, 0, 0, 0];
                    $scope.TotalPercetageData = [0, 0, 0, 0, 0];
                    $scope.RemainingTotalGoalData = [0, 0, 0, 0, 0];
                    $scope.AdgustedPercetageData = [0, 0, 0, 0, 0];
                    $scope.CurrentPerformanceTotalGoalData = [0, 0, 0, 0, 0];
                    $scope.CurrentPerformancePercetageData = [0, 0, 0, 0, 0];
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
                    serviceProspectingManager.getProspectingCustomerResultsByUserIds(userIds).then(function (data) {
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
                            $scope.prospectingGoalItems.unshift({ id: 0, name: $translate.instant("COMMON_ALL") });
                            $scope.topBoxFilterOption.prospectingGoalIds = [];
                            _.each(data, function (item) {
                                if (item.taskId) {
                                    moment.locale(globalVariables.lang.currentUICulture);
                                    item.goalStartDate = moment(kendo.parseDate(item.goalStartDate)).format('L LT');
                                    item.goalEndDate = moment(kendo.parseDate(item.goalEndDate)).format('L LT');
                                    if (item.taskId) {
                                        serviceProspectingManager.getSkillsByProspectingGoalId(item.id).then(function (data) {
                                            data = _.sortBy(data, 'seqNo');
                                            $scope.prospectingSkills = data;
                                            _.each(item.prospectingSkillGoals, function (dataItem) {
                                                var skillinfo = _.find($scope.prospectingSkills, function (skillItem) {
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
            $scope.taskActivityData = null
            $scope.filterTaskCompareSkillGagueValue = function (compareDataItem, prospectingSkill) {
                if (compareDataItem.skillId == prospectingSkill.skillId) {
                    return true;
                }
            }
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
                            drawPerformanceGauge()
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
            $scope.checkAndSetScaleColor = function (value, index) {
                var minPercentage = Math.min.apply(Math, $scope.prospectingScaleRanges.map(function (o) { return o.minPercentage; }));
                var maxPercentage = Math.max.apply(Math, $scope.prospectingScaleRanges.map(function (o) { return o.maxPercentage; }));
                if ($scope.topBoxFilterOption.topboxResultTypeId == $scope.topboxResultTypeEnum.Counts || $scope.topBoxFilterOption.topboxResultTypeId == $scope.topboxResultTypeEnum.Percentage || $scope.topBoxFilterOption.topboxResultTypeId == $scope.topboxResultTypeEnum.RemainCounts) {
                    value = $scope.TotalPercetageData[index];
                }
                else if ($scope.topBoxFilterOption.topboxResultTypeId == $scope.topboxResultTypeEnum.CurrentPerformanceResult || $scope.topBoxFilterOption.topboxResultTypeId == $scope.topboxResultTypeEnum.CurrentPerformancePercentage) {
                    value = $scope.CurrentPerformancePercetageData[index];
                }
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
            $scope.filterShowHideTaskDashboard = function () {
                if ($scope.topBoxFilterOption.taskDashboard) {
                    setTimeout(function () {
                        $scope.resizeTaskGauge();
                    }, 100);
                }
            }
            $scope.resizeTaskGauge = function () {
                $("#taskDashboardSection").find(".gaugeDiv").each(function (index, el) {
                    var id = $(el).attr("id");
                    if (id) {
                        var chartObj = $("#" + id).data("kendoRadialGauge");
                        if (chartObj) {
                            chartObj.resize();
                        }
                    }
                })
            }

            $scope.chartFilterOptionChanged = function (value) {
                var option = _.find($scope.chartFilterOptions, function (item) {
                    return item.id == value;
                });

                $scope.chartFilterOptionModel = {
                    taskId: $scope.selectedperformanceDashboardTask.id,
                    userId: $scope.selectedProspectingGoal.userId, //$scope.topBoxFilterOption.userId,
                    startDate: null,
                    endDate: null,
                    selectedOptionValue: value,
                    selectedOptionText: option.name,
                }
                if ($scope.chartFilterOptionEnums.DateRange != $scope.chartFilterOptionModel.selectedOptionValue) {
                    FilterChart();
                }

            }
            function FilterChart() {
                var filterOptionModel = _.clone($scope.chartFilterOptionModel);
                if (filterOptionModel.startDate) {
                    filterOptionModel.startDate = kendo.parseDate(filterOptionModel.startDate);
                }
                if (filterOptionModel.endDate) {
                    filterOptionModel.endDate = kendo.parseDate(filterOptionModel.endDate);
                }
                serviceProspectingManager.getUserTaskServiceActivityData(filterOptionModel).then(function (data) {
                    var series = [];
                    var categories = [];
                    var colors = ["#FF6800", "#A0A700", "#4163B9"];
                    _.each(data, function (item) {
                        if ($scope.chartFilterOptionEnums.Total == filterOptionModel.selectedOptionValue) {
                            if (moment(kendo.parseDate(item.actvitiyStart)).isBefore(moment($scope.todayEndDate)) && moment(kendo.parseDate(item.actvitiyEnd)).isBefore(moment($scope.todayEndDate))) {
                                categories.push(item.actvitiyName + "_" + moment(kendo.parseDate(item.actvitiyStart)).format("MM.DD.YYYY"));
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
                        }
                        else if ($scope.chartFilterOptionEnums.Weekly == filterOptionModel.selectedOptionValue) {
                            if (moment(kendo.parseDate(item.actvitiyStart)).isAfter(moment($scope.weekStartDate)) && moment(kendo.parseDate(item.actvitiyEnd)).isBefore(moment($scope.weekEndDate))) {
                                categories.push(item.actvitiyName + "_" + moment(kendo.parseDate(item.actvitiyStart)).format("MM.DD.YYYY"));
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
                        }
                        else if ($scope.chartFilterOptionEnums.Monthly == filterOptionModel.selectedOptionValue) {
                            if (moment(kendo.parseDate(item.actvitiyStart)).isAfter(moment($scope.monthStartDate)) && moment(kendo.parseDate(item.actvitiyEnd)).isBefore(moment($scope.monthEndDate))) {
                                categories.push(item.actvitiyName + "_" + moment(kendo.parseDate(item.actvitiyStart)).format("MM.DD.YYYY"));
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
                        }
                        else if ($scope.chartFilterOptionEnums.DateRange == filterOptionModel.selectedOptionValue) {
                            if (moment(kendo.parseDate(item.actvitiyStart)).isAfter(moment(kendo.parseDate($scope.chartFilterOptionModel.startDate))) && moment(kendo.parseDate(item.actvitiyEnd)).isBefore(moment(kendo.parseDate($scope.chartFilterOptionModel.endDate)))) {
                                categories.push(item.actvitiyName + "_" + moment(kendo.parseDate(item.actvitiyStart)).format("MM.DD.YYYY"));
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
                        }
                    });
                    // Draw Chart
                    if (categories.length > 20) {
                        if (!($("#taskprospectingfloatchart").parent().width() > (categories.length * 35))) {
                            $("#taskprospectingfloatchart").width(categories.length * 35);
                        }
                    }
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


        }])