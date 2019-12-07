angular.module('ips.taskProspecting')
    .config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
        var completedSalesProspectingResolve = {
            pageName: function ($translate) {
                return $translate.instant('TASKPROSPECTING_TASKPROSPECTING_PAGE_NAME');//'Task Prospecting';
            },

        };
        $stateProvider
            .state('home.salesProspecting.completedSalesProspecting', {
                url: "/completedSalesProspecting",
                templateUrl: "views/taskProspecting/views/completedSalesProspecting.html",
                controller: "CompletedSalesProspectingCtrl",
                resolve: completedSalesProspectingResolve,
                data: {
                    displayName: '{{pageName}}',//'Training Diary',
                    paneLimit: 1,
                    depth: 2
                }
            })
    }])

    .controller("CompletedSalesProspectingCtrl", ['$scope', 'cssInjector', '$stateParams', '$location', 'todoManager', 'todosManager', 'taskProspectingManager', 'dialogService', 'progressBar', 'localStorageService', '$compile', 'projectRolesEnum', '$translate', 'prospectingTypesEnum', 'globalVariables',
        function ($scope, cssInjector, $stateParams, $location, todoManager, todosManager, taskProspectingManager, dialogService, progressBar, localStorageService, $compile, projectRolesEnum, $translate, prospectingTypesEnum, globalVariables) {
            cssInjector.removeAll();
            cssInjector.add('views/taskProspecting/sales-prospecting.css');
            cssInjector.add('views/taskProspecting/ips-run.css');
            var authData = localStorageService.get('authorizationData');
            $scope.currentUser = authData.user;
            moment.locale(globalVariables.lang.currentUICulture);
            var endDay = moment();
            $scope.endOfDay = endDay.endOf('day')._d;
            $scope.todayStartDate = moment().startOf("day")._d;
            $scope.prospectingType = prospectingTypesEnum.Sales;
            $scope.topBoxFilterOption = {
                projectId: 0,
                prospectingGoalId: 0,
                prospectingGoalIds: [],
                userId: 0,
                userName: $translate.instant('TASKPROSPECTING_ALL_MEMBERS'),//"All Members",
            };
            $scope.goalStatusEnum = {
                Active: 1,
                Upcoming: 2,
                Expired: 3,
            };
            $scope.projects = [];
            $scope.prospectingGoals = [];
            $scope.prospectingGoalVisualizationFilterOption = {
                total: true,
                today: false,
                weekly: false,
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
            $scope.projectMembers = [];
            $scope.activityProspectingGoalFilterText = $translate.instant('COMMON_ALL');
            $scope.FilterActivityProspectingGoalId = null;
            $scope.isActivityEditEnable = false;
            $scope.prosoectingGoalCustomTexts = { buttonDefaultText: '--' + $translate.instant('TASKPROSPECTING_SELECT_PROSPECTING') + '--' };
            $scope.prospectingGoalButtonSettings = {
                smartButtonMaxItems: 3,
                smartButtonTextConverter: function (itemText, originalItem) {
                    return itemText;
                },
                template: '<b>{{option.label}}</b>'
            };
            $scope.prospectingGoalOptions = null;
            $scope.init = function () {
                progressBar.startProgress();
                moment.locale(globalVariables.lang.currentUICulture);
                taskProspectingManager.GetTaskProspectingProjects().then(function (data) {
                    progressBar.stopProgress();
                    moment.locale(globalVariables.lang.currentUICulture);
                    $scope.projects = [];
                    _.each(data.completedProjects, function (item) {
                        $scope.projects.push(item);
                    });
                    _.each(data.expiredProjects, function (item) {
                        $scope.projects.push(item);
                    });

                    if ($scope.projects.length > 0) {
                        var sortedProjects = _.sortBy($scope.projects, function (item) {
                            return item.id;
                        }).reverse();
                        $scope.topBoxFilterOption.projectId = sortedProjects[0].id;
                        $scope.totalStartDate = moment(kendo.parseDate(sortedProjects[0].expectedStartDate))._d;
                        $scope.totalEndDate = moment(kendo.parseDate(sortedProjects[0].expectedEndDate))._d;
                        $scope.projects.unshift({ id: 0, name: "Tasks without project / Prospecting As Project" });
                    }
                    else {
                        $scope.projects.push({ id: 0, name: "Tasks without project / Prospecting As Project" });
                        $scope.topBoxFilterOption.projectId = 0;
                        //dialogService.showNotification("No Any Active Projects for you", "warning");
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
                                memberNames.push(member.firstName + " " + member.lastName);
                            }
                        });
                        if (memberNames.length > 0) {
                            $scope.topBoxFilterOption.userName = memberNames.join(',');
                        }
                    }
                    var userIds = [];
                    _.each($scope.projectMembers, function (item) {
                        userIds.push(item.id);
                    });
                    todoManager.getTodosByUserIds(userIds).then(function (data) {
                        progressBar.stopProgress();
                        moment.locale(globalVariables.lang.currentUICulture);
                        $scope.taskTodos = [];
                        $scope.prospectingTaskTodos = [];

                        angular.forEach(data, function (item, index) {
                            if ($scope.topBoxFilterOption.projectId > 0) {
                                if (item.projectId == $scope.topBoxFilterOption.projectId) {
                                    if (item.taskCategoryListItem.name.toLowerCase() == 'prospecting' || item.taskCategoryListItem.name.toLowerCase() == 'sales prospecting') {
                                        item.start = moment(kendo.parseDate(item.startDate)).toDate();
                                        item.taskId = item.id;
                                        item.end = moment(kendo.parseDate(item.dueDate)).toDate();
                                        $scope.prospectingTaskTodos.push(item);
                                    }
                                }
                            }
                            else {
                                if (item.taskCategoryListItem.name.toLowerCase() == 'prospecting' || item.taskCategoryListItem.name.toLowerCase() == 'sales prospecting') {
                                    item.start = moment(kendo.parseDate(item.startDate)).toDate();
                                    item.taskId = item.id;
                                    item.end = moment(kendo.parseDate(item.dueDate)).toDate();
                                    $scope.prospectingTaskTodos.push(item);
                                }
                            }
                        });

                        App.initSlimScroll(".scroller");
                    });
                    taskProspectingManager.getProspectingCustomerResultsByUserIds(userIds).then(function (data) {
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
                        taskProspectingManager.GetProjectProspectingGoalsByUserId(userId, $scope.topBoxFilterOption.projectId).then(function (data) {
                            progressBar.stopProgress();
                            moment.locale(globalVariables.lang.currentUICulture);
                            $scope.prospectingGoalItems = [];
                            _.each(data, function (item, index) {
                                if (moment(kendo.parseDate(item.goalEndDate)).isBefore(moment($scope.today))) {
                                    $scope.prospectingGoalItems.push({ id: item.id, name: item.name, seq: index, goalStartDate: moment(kendo.parseDate(item.goalStartDate))._d, goalEndDate: moment(kendo.parseDate(item.goalEndDate))._d });
                                }
                            });
                            $scope.prospectingGoalOptions = getProspectingGoalMultiSelectOptions($scope.prospectingGoalItems);
                            $scope.prospectingGoalItems.unshift({ id: 0, name: $translate.instant('COMMON_ALL') });
                            $scope.topBoxFilterOption.prospectingGoalIds = [];
                            var allGoalStartDates = [];
                            var allGoalEndDates = [];
                            _.each(data, function (item) {
                                if (item.userId) {
                                    item.goalStartDate = moment(kendo.parseDate(item.goalStartDate))._d;
                                    item.goalEndDate = moment(kendo.parseDate(item.goalEndDate))._d;
                                    allGoalStartDates.push(moment(kendo.parseDate(item.goalStartDate))._d);
                                    allGoalEndDates.push(moment(kendo.parseDate(item.goalEndDate))._d);
                                    taskProspectingManager.getSkillsByProspectingGoalId(item.id).then(function (data) {
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
                                        if (moment(kendo.parseDate(item.goalEndDate)).isBefore(moment($scope.today))) {
                                            item["status"] = $scope.goalStatusEnum.Expired;
                                            $scope.prospectingGoals.push(item);
                                        }
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

                            taskProspectingManager.GetProspectingGoalActivityInfoesByUserIds(userIds).then(function (data) {
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
                                });

                            });
                        });
                    })
                }
                else {
                    if (!($scope.topBoxFilterOption.userId == userId)) {
                        $scope.prospectingGoals = [];
                        $scope.prospectingGoalActivityInfoes = [];
                        $scope.topBoxFilterOption.prospectingGoalIds = [];
                        $scope.topBoxFilterOption.userId = userId;
                        $scope.selectedProjectMembers = [];
                        var user = _.find($scope.projectMembers, function (memberItem) {
                            return memberItem.id == userId;
                        });
                        if (user) {
                            $scope.topBoxFilterOption.userName = user.firstName + " " + user.lastName;
                        }

                        todoManager.getTodosByUserId(userId).then(function (data) {
                            progressBar.stopProgress();
                            $scope.taskTodos = [];
                            $scope.prospectingTaskTodos = [];
                            moment.locale(globalVariables.lang.currentUICulture);
                            angular.forEach(data, function (item, index) {
                                if ($scope.topBoxFilterOption.projectId > 0) {
                                    if (item.projectId == $scope.topBoxFilterOption.projectId) {
                                        if (item.taskCategoryListItem.name.toLowerCase() == 'prospecting' || item.taskCategoryListItem.name.toLowerCase() == 'sales prospecting') {
                                            item.start = moment(kendo.parseDate(item.startDate)).toDate();
                                            item.taskId = item.id;
                                            item.end = moment(kendo.parseDate(item.dueDate)).toDate();
                                            $scope.prospectingTaskTodos.push(item);
                                        }
                                    }
                                }
                                else {
                                    if (item.taskCategoryListItem.name.toLowerCase() == 'prospecting' || item.taskCategoryListItem.name.toLowerCase() == 'sales prospecting') {
                                        item.start = moment(kendo.parseDate(item.startDate)).toDate();
                                        item.taskId = item.id;
                                        item.end = moment(kendo.parseDate(item.dueDate)).toDate();
                                        $scope.prospectingTaskTodos.push(item);
                                    }
                                }
                            });

                            App.initSlimScroll(".scroller");
                        });

                        taskProspectingManager.getProspectingCustomerResultsByUserId(userId).then(function (data) {
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
                            taskProspectingManager.GetProjectProspectingGoalsByUserId(userId, $scope.topBoxFilterOption.projectId).then(function (data) {
                                progressBar.stopProgress();
                                moment.locale(globalVariables.lang.currentUICulture);
                                $scope.prospectingGoalItems = [];
                                _.each(data, function (item, index) {
                                    if (moment(kendo.parseDate(item.goalEndDate)).isBefore(moment($scope.today))) {
                                        $scope.prospectingGoalItems.push({ id: item.id, name: item.name, seq: index, goalStartDate: moment(kendo.parseDate(item.goalStartDate))._d, goalEndDate: moment(kendo.parseDate(item.goalEndDate))._d });
                                    }
                                });
                                $scope.prospectingGoalOptions = getProspectingGoalMultiSelectOptions($scope.prospectingGoalItems);
                                $scope.prospectingGoalItems.unshift({ id: 0, name: $translate.instant('COMMON_ALL') });
                                $scope.topBoxFilterOption.prospectingGoalIds = [];
                                var allGoalStartDates = [];
                                var allGoalEndDates = [];
                                _.each(data, function (item) {
                                    if (item.userId) {
                                        item.goalStartDate = moment(kendo.parseDate(item.goalStartDate))._d;
                                        item.goalEndDate = moment(kendo.parseDate(item.goalEndDate))._d;
                                        allGoalStartDates.push(moment(kendo.parseDate(item.goalStartDate))._d);
                                        allGoalEndDates.push(moment(kendo.parseDate(item.goalEndDate))._d);
                                        taskProspectingManager.getSkillsByProspectingGoalId(item.id).then(function (data) {
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
                                            if (moment(kendo.parseDate(item.goalEndDate)).isBefore(moment($scope.endOfDay))) {
                                                item["status"] = $scope.goalStatusEnum.Expired;
                                                $scope.prospectingGoals.push(item);
                                            }
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

                                taskProspectingManager.GetProspectingGoalActivityInfoesByUserId(userId).then(function (data) {
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
                                    });
                                });
                            });
                        })
                    }
                }
                $scope.isViewActivityDetail = false;
                $scope.viewProspectingActivityResultData = [];
                $("li[data-target='#tab0']").click();
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
                    return kendo.parseDate(activityItem.activityStart) >= $scope.todayStartDate && kendo.parseDate(activityItem.activityStart) <= $scope.endOfDay
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
                    return kendo.parseDate(activityItem.activityStart) >= $scope.todayStartDate && kendo.parseDate(activityItem.activityStart) <= $scope.endOfDay
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

                    $scope.prospectingGoalInfo.prospectingGoalTypeId = 1
                    if ($scope.prospectingGoalInfo.taskId) {
                        $scope.prospectingGoalInfo.prospectingGoalTypeId = 3
                    }
                }
                $scope.isProspectingGoalViewOnly = true;
                $("#addProspectingGoalModal").modal("show");
            }
            $scope.calculateProspectingSkillGoalByTotalGoal = function (prospectingGoalSkill) {
                var taskdata = _.find($scope.prospectingTaskTodos, function (item) {
                    return item.id == $scope.prospectingGoalInfo.taskId;
                });
                if (taskdata) {
                    $scope.prospectingGoalInfo.recurrenceRule = taskdata.recurrenceRule;
                }
                var event = new kendo.data.SchedulerEvent({
                    id: $scope.prospectingGoalInfo.id,
                    start: kendo.parseDate($scope.prospectingGoalInfo.goalStartDate),
                    end: kendo.parseDate($scope.prospectingGoalInfo.goalEndDate),
                    recurrenceRule: $scope.prospectingGoalInfo.recurrenceRule,
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

            $scope.filterProspectingGoalChanged = function () {
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
                value: $scope.ActivityFilterOptionsEnum.Today,
                name: $translate.instant('COMMON_TODAY')
            },
            {
                value: $scope.ActivityFilterOptionsEnum.UpComing,
                name: $translate.instant('COMMON_UP_COMING')
            },
            {
                value: $scope.ActivityFilterOptionsEnum.Expired,
                name: $translate.instant('COMMON_EXPIRED')
            },
            {
                value: $scope.ActivityFilterOptionsEnum.Weekly,
                name: $translate.instant('COMMON_THIS_WEEK')
            },
            {
                value: $scope.ActivityFilterOptionsEnum.Monthly,
                name: $translate.instant('COMMON_THIS_MONTH')
            }]
            $scope.activityFilterText = $translate.instant('COMMON_EXPIRED');
            $scope.activityFilterValue = $scope.ActivityFilterOptionsEnum.Expired;
            $scope.ActivityFilterChanged = function (value) {
                if (!$scope.isActivityStart) {
                    $scope.activityFilterText = $translate.instant('COMMON_ALL');
                    $scope.activityFilterValue = $scope.ActivityFilterOptionsEnum.UpComing;

                }
                else {
                    dialogService.showNotification($translate.instant('TASKPROSPECTING_YOU_CANT_FILTER_AT_THIS_MOMENT_BECAUSE_YOU_HAVE_STARTED_ACTIVITY'), "warning");
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
            $scope.viewProspectingGoalActivityInfoes = function (id) {
                $scope.isStartedActvityExist = false;
                $scope.prospectingGoalActivityInfo = _.find($scope.prospectingGoalActivityInfoes, function (item) {
                    return item.id == id;
                });
                $scope.prospectingActivities = [];
                if ($scope.prospectingGoalActivityInfo) {
                    var prospectingActivities = _.clone($scope.prospectingGoalActivityInfo.prospectingActivities);
                    $scope.prospectingGoalActivityInfo.activityCalculationType = 1;
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
                        $("#goalActivityRecurrenceActivities").kendoTooltip({
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
                        dialogService.showNotification($translate.instant('TASKPROSPECTING_ACTIVITY_NOT_FOUND'), "warning");
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
                        dialogService.showNotification($translate.instant('TASKPROSPECTING_ACTIVITY_NOT_FOUND'), "warning");
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
                taskProspectingManager.SaveActivityReason($scope.expiredProspectingActivityReason).then(function (data) {
                    if (data.id > 0) {
                        dialogService.showNotification($translate.instant('TASKPROSPECTING_REASON_ADDED_SUCCESSFULLY'), "info");
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
                        dialogService.showNotification($translate.instant('TASKPROSPECTING_REASON_SUBMIT_FAILED'), "warning");
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
                    taskProspectingManager.getProsepectingActivityResultData(prospectingActivityId).then(function (data) {
                        $scope.viewProspectingActivityResultData = data;
                    })
                }
            }
            $scope.viewActivityDetail = function (goalId, activityId) {
                $scope.isViewActivityDetail = true;
                if (goalId && activityId) {
                    $scope.prospectingGoalFilterChanged(goalId);
                    $scope.prospectingActivityFilterChanged(activityId);
                    $("li[data-target='#tab2']").click();
                }
            }
            $scope.saveProspectingActivity = function () {
                if ($scope.prospectingActivity.id > 0) {
                    taskProspectingManager.updateProspectingActivity($scope.prospectingActivity).then(function (data) {
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
                                    $("#goalActivityRecurrenceActivities").kendoTooltip({
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
                                }
                                dialogService.showNotification($translate.instant('TASKPROSPECTING_ACTIVITY_DETAIL_UPDATED_SUCCESSFULLY'), "info");
                            }
                        }
                    });
                }
                else {
                    taskProspectingManager.saveProspectingActivity($scope.prospectingActivity).then(function (data) {
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
                                    $("#goalActivityRecurrenceActivities").kendoTooltip({
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
                                }
                            }
                            dialogService.showNotification($translate.instant('TASKPROSPECTING_ACTIVITY_ADDED_SUCCESSFULLY'), "info");
                        }
                    });
                }
            }
            $scope.viewActivityFeedback = function () {
                if ($scope.prospectingActivityFilterForResult.id) {
                    taskProspectingManager.getProspectingActivityFeedbackByActivityId($scope.prospectingActivityFilterForResult.id).then(function (data) {
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
            function getMultiSelectOptions(data) {
                var options = [];
                _.forEach(data, function (item, index) {
                    options.push({ id: item.id, label: item.firstName + " " + item.lastName });
                });
                return options;
            }
            function getProspectingGoalMultiSelectOptions(data) {
                var options = [];
                _.forEach(data, function (item, index) {
                    options.push({ id: item.id, label: item.name });
                });
                return options;
            }
            function memberChanged() {
                if ($scope.selectedProjectMembers.length > 0 && $scope.topBoxFilterOption.userId == 0) {

                    $scope.prospectingGoals = [];
                    $scope.prospectingGoalActivityInfoes = [];
                    $scope.topBoxFilterOption.userId = 0;
                    var userIds = [];
                    $scope.topBoxFilterOption.prospectingGoalIds = [];

                    _.each($scope.selectedProjectMembers, function (item) {
                        userIds.push(item.id);
                    });
                    // Members
                    var memberNames = [];
                    _.each(userIds, function (value) {
                        var member = _.find($scope.projectMembers, function (item) {
                            return item.id == value;
                        });
                        if (member) {
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
                        moment.locale(globalVariables.lang.currentUICulture);
                        angular.forEach(data, function (item, index) {
                            if ($scope.topBoxFilterOption.projectId > 0) {
                                if (item.projectId == $scope.topBoxFilterOption.projectId) {
                                    if (item.taskCategoryListItem.name.toLowerCase() == 'prospecting' || item.taskCategoryListItem.name.toLowerCase() == 'sales prospecting') {
                                        item.start = moment(kendo.parseDate(item.startDate)).toDate();
                                        item.taskId = item.id;
                                        item.end = moment(kendo.parseDate(item.dueDate)).toDate();
                                        $scope.prospectingTaskTodos.push(item);
                                    }
                                }
                            }
                            else {
                                if (item.taskCategoryListItem.name.toLowerCase() == 'prospecting' || item.taskCategoryListItem.name.toLowerCase() == 'sales prospecting') {
                                    item.start = moment(kendo.parseDate(item.startDate)).toDate();
                                    item.taskId = item.id;
                                    item.end = moment(kendo.parseDate(item.dueDate)).toDate();
                                    $scope.prospectingTaskTodos.push(item);
                                }
                            }
                        });

                    });

                    taskProspectingManager.getProspectingCustomerResultsByUserIds(userIds).then(function (data) {
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
                        taskProspectingManager.GetProjectProspectingGoalsByUserId($scope.topBoxFilterOption.userId, $scope.topBoxFilterOption.projectId).then(function (data) {
                            progressBar.stopProgress();
                            $scope.prospectingGoalItems = [];
                            if (userIds.length > 0 && $scope.topBoxFilterOption.userId == 0) {
                                data = _.filter(data, function (dataItem) {
                                    return userIds.indexOf(dataItem.userId) > -1;
                                });
                            }
                            _.each(data, function (item, index) {
                                if (moment(kendo.parseDate(item.goalEndDate)).isBefore(moment($scope.today))) {
                                    $scope.prospectingGoalItems.push({ id: item.id, name: item.name, seq: index, goalStartDate: moment(kendo.parseDate(item.goalStartDate))._d, goalEndDate: moment(kendo.parseDate(item.goalEndDate))._d });
                                }
                            });
                            $scope.prospectingGoalOptions = getProspectingGoalMultiSelectOptions($scope.prospectingGoalItems);

                            $scope.prospectingGoalItems.unshift({ id: 0, name: $translate.instant("COMMON_ALL") });
                            $scope.topBoxFilterOption.prospectingGoalIds = [];
                            _.each(data, function (item) {
                                if (item.userId) {
                                    moment.locale(globalVariables.lang.currentUICulture);
                                    item.goalStartDate = moment(kendo.parseDate(item.goalStartDate)).format('L LT');
                                    item.goalEndDate = moment(kendo.parseDate(item.goalEndDate)).format('L LT');
                                    if (item.userId) {
                                        taskProspectingManager.getSkillsByProspectingGoalId(item.id).then(function (data) {
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

                                            if (moment(kendo.parseDate(item.goalEndDate)).isBefore(moment($scope.today))) {
                                                item["status"] = $scope.goalStatusEnum.Expired;
                                                $scope.prospectingGoals.push(item);
                                            }



                                        })
                                    }
                                }
                                App.initSlimScroll(".scroller");
                            });

                            taskProspectingManager.GetProspectingGoalActivityInfoesByUserIds(userIds).then(function (data) {
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
                                });
                            });
                        });
                    })


                }
                else {
                    $scope.userTabChanged(0);
                }
            }
        }])