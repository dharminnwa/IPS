angular.module('ips.serviceProspecting')
    .config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
        var baseServiceProspectingResolve = {
            pageName: function ($translate) {
                return $translate.instant('LEFTMENU_SERVICE_PROSPECTING'); //'Service Prospecting';
            },
        };
        $stateProvider
            .state('home.serviceProspecting.todayServiceProspecting', {
                url: "/todayServiceProspecting",
                templateUrl: "views/serviceProspecting/views/todayServiceProspecting.html",
                controller: "TodayServiceProspectingCtrl",
                resolve: baseServiceProspectingResolve,
                data: {
                    displayName: '{{pageName}}',
                    paneLimit: 1,
                    depth: 2
                }
            })
    }])

    .controller("TodayServiceProspectingCtrl", ['$scope', 'cssInjector', '$stateParams', '$location', 'todoManager', 'todosManager', 'serviceProspectingManager', 'dialogService', 'progressBar', 'localStorageService', '$compile', 'projectRolesEnum', 'prospectingTypesEnum', 'globalVariables', '$translate',
        function ($scope, cssInjector, $stateParams, $location, todoManager, todosManager, serviceProspectingManager, dialogService, progressBar, localStorageService, $compile, projectRolesEnum, prospectingTypesEnum, globalVariables, $translate) {
            cssInjector.removeAll();
            cssInjector.add('views/serviceProspecting/service-prospective.css');
            cssInjector.add('views/taskProspecting/ips-run.css');
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

            }
            $scope.ProspectingGoalTypes = [{
                id: 3, name: "Task"
            }];

            $scope.prospectingGoalActivityInfoes = [];

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

            //Customers
            $scope.prospectingCustomers = [];
            $scope.prospectingActivityCustomers = [];
            $scope.openAddCustomerPopupMode = {
                isPopupOpen: false
            }
            $scope.CustomersProspectingGoalFilterChanged = function (id) {
                if (!$scope.isActivityStart) {
                    $scope.customersProspectingGoalFilterText = $translate.instant('COMMON_ALL');
                    $scope.FilterCustomersProspectingGoalId = null;
                    var prospectingGoal = _.find($scope.prospectingGoals, function (data) {
                        return data.id == id;
                    });
                    if (prospectingGoal) {
                        $scope.customersProspectingGoalFilterText = prospectingGoal.name;
                        $scope.FilterCustomersProspectingGoalId = id;
                    }
                }
                else {
                    dialogService.showNotification($translate.instant('TASKPROSPECTING_YOU_CANT_FILTER_AT_THIS_MOMENT_BECAUSE_YOU_HAVE_STARTED_ACTIVITY'), "warning");
                }
            }
            $scope.showFilteredProspectingCustomers = function (item) {
                if (!$scope.FilterCustomersProspectingGoalId) {
                    return true;
                }
                else {
                    if ($scope.FilterCustomersProspectingGoalId == item.prospectingGoalId) {
                        return true;
                    }
                    else {
                        return false;
                    }
                }
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
                    'prospecting-customer-goal-activities="prospectingGoalActivityInfo.prospectingActivities"' +
                    'open-add-customer-popup-mode="openAddCustomerPopupMode"' +
                    '</add-customers-popup></div>';

                var linkFn = $compile(html);
                var content = linkFn($scope);
                $("#home-add-customer-popup-div").html(content);
                $scope.openAddCustomerPopupMode.isPopupOpen = true;
            }
            //

            //Activities
            $scope.openTalkActivityPopupMode = {
                isPopupOpen: false
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
                                _.each($scope.prospectingActivities, function (item) {
                                    item.activityEnd = kendo.parseDate(item.activityEnd);
                                    item.activityStart = kendo.parseDate(item.activityStart);
                                })

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
                                _.each($scope.prospectingActivities, function (item) {
                                    item.activityEnd = kendo.parseDate(item.activityEnd);
                                    item.activityStart = kendo.parseDate(item.activityStart);
                                })

                            }
                            dialogService.showNotification($translate.instant('TASKPROSPECTING_ACTIVITY_ADDED_SUCCESSFULLY'), 'info');
                        }
                    });
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
            $scope.viewActivityDetail = function (goalId, activityId) {
                $scope.isViewActivityDetail = true;
                if (goalId && activityId) {
                    $scope.prospectingGoalFilterChanged(goalId);
                    $scope.prospectingActivityFilterChanged(activityId);
                    $("li[data-target='#tab4']").click();
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
                    $("li[data-target='#tab3']").click();
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
            //

            //Activity Results
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
            $scope.enalbeActivityResultToEdit = function () {
                $scope.isActivityEditEnable = !$scope.isActivityEditEnable;
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
            $scope.triggerUpdateActivityResult = function (skills, checkStatus, activityIndex, skillId, prospectingCustomerId, $event) {
                var prospectingCustomerResults = [];
                _.each($scope.viewProspectingActivityResultData, function (viewItem) {
                    _.each(viewItem.prospectingCustomerResults, function (item) {
                        prospectingCustomerResults.push(item);
                    })
                });
                if ($scope.isActivityEditEnable) {
                    if (activityIndex == 0) {
                        var isExist = _.any(prospectingCustomerResults, function (resultItem) {
                            return resultItem.prospectingCustomerId == prospectingCustomerId && resultItem.skillId == skillId && resultItem.prospectingActivityId == $scope.prospectingActivityFilterForResult.id;
                        })
                        if (isExist) {
                            dialogService.showYesNoDialog($translate.instant('COMMON_CONFIRM'), $translate.instant('TASKPROSPECTING_IT_WILL_CLEAR_ALL_TALKED_DETAILSARE_YOU_SURE_TO_CONTINUE')).then(function () {
                                var resultItem = _.filter(prospectingCustomerResults, function (resultItem) {
                                    return resultItem.prospectingCustomerId == prospectingCustomerId && resultItem.skillId == skillId && resultItem.prospectingActivityId == $scope.prospectingActivityFilterForResult.id;
                                });
                                if (resultItem.length > 0) {
                                    serviceProspectingManager.uncheckCustomerActivityResult(resultItem[0]).then(function (data) {
                                        if (data) {
                                            _.each(data, function (dataItem) {
                                                var index = _.findIndex(prospectingCustomerResults, function (item) {
                                                    return item.id == dataItem
                                                });
                                                if (index > -1) {
                                                    prospectingCustomerResults.splice(index, 1);
                                                }
                                                _.each($scope.viewProspectingActivityResultData, function (viewItem) {
                                                    var isExist = _.any(viewItem.prospectingCustomerResults, function (resultItem) {
                                                        return resultItem.id == dataItem;
                                                    });
                                                    if (isExist) {
                                                        var index = _.findIndex(viewItem.prospectingCustomerResults, function (item) {
                                                            return item.id == dataItem
                                                        });
                                                        viewItem.prospectingCustomerResults.splice(index, 1);
                                                    }
                                                });
                                            });
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
                                    _.each(prospectingCustomerResults, function (resultItem) {
                                        if (resultItem.prospectingCustomerId == prospectingCustomerId && resultItem.skillId == skillId && resultItem.prospectingActivityId == $scope.prospectingActivityFilterForResult.id) {
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
                                dialogService.showYesNoDialog($translate.instant('COMMON_CONFIRM'), $translate.instant('TASKPROSPECTING_ARE_YOU_SURE_YOU_HAVE_CALLED_THIS_CUSTOMER')).then(function () {
                                    $scope.prospectingActivityCustomerResult = {
                                        id: 0,
                                        prospectingCustomerId: prospectingCustomerId,
                                        prospectingActivityId: $scope.prospectingActivityFilterForResult.id,
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
                        var isExist = _.any(prospectingCustomerResults, function (resultItem) {
                            return resultItem.prospectingCustomerId == prospectingCustomerId && resultItem.skillId == skillId && resultItem.prospectingActivityId == $scope.prospectingActivityFilterForResult.id;
                        })
                        if (isExist) {
                            dialogService.showYesNoDialog($translate.instant('COMMON_CONFIRM'), $translate.instant('TASKPROSPECTING_IT_WILL_CLEAR_ALL_TALKED_DETAILSARE_YOU_SURE_TO_CONTINUE')).then(function () {
                                var resultItem = _.filter(prospectingCustomerResults, function (resultItem) {
                                    return resultItem.prospectingCustomerId == prospectingCustomerId && resultItem.skillId == skillId && resultItem.prospectingActivityId == $scope.prospectingActivityFilterForResult.id;
                                });
                                if (resultItem.length > 0) {
                                    serviceProspectingManager.uncheckCustomerActivityResult(resultItem[0]).then(function (data) {
                                        if (data) {
                                            _.each(data, function (dataItem) {
                                                var index = _.findIndex(prospectingCustomerResults, function (item) {
                                                    return item.id == dataItem
                                                });
                                                if (index > -1) {
                                                    prospectingCustomerResults.splice(index, 1);
                                                }
                                                _.each($scope.viewProspectingActivityResultData, function (viewItem) {
                                                    var isExist = _.any(viewItem.prospectingCustomerResults, function (resultItem) {
                                                        return resultItem.id == dataItem;
                                                    });
                                                    if (isExist) {
                                                        var index = _.findIndex(viewItem.prospectingCustomerResults, function (item) {
                                                            return item.id == dataItem
                                                        });
                                                        viewItem.prospectingCustomerResults.splice(index, 1);
                                                    }
                                                });
                                            });
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
                                _.each(prospectingCustomerResults, function (resultItem) {
                                    if (resultItem.prospectingCustomerId == prospectingCustomerId && resultItem.skillId == skillId && resultItem.prospectingActivityId == $scope.prospectingActivityFilterForResult.id) {
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
                                    prospectingActivityId: $scope.prospectingActivityFilterForResult.id,
                                    skillId: skillId,
                                    isDone: checkStatus,
                                    reason: null,
                                    description: null,
                                    duration: null,
                                    customerInterestRate: null,
                                    isFollowUp: false,
                                    isNoMeeting: false,
                                    isMeeting: false,
                                    nextSkillId: skills[activityIndex + 1] != null ? skills[activityIndex + 1].skillId : null,
                                    prospectingSchedules: [],
                                    prospectingType: $scope.prospectingType
                                };
                                $scope.prospectingSchedule = {
                                    prospectingCustomerId: prospectingCustomerId,
                                    prospectingActivityId: $scope.prospectingActivityFilterForResult.id,
                                    prospectingCustomerResultId: 0,
                                    isMeeting: $scope.prospectingActivityCustomerResult.isMeeting,
                                    isFollowUp: $scope.prospectingActivityCustomerResult.isFollowUp,
                                    scheduleDate: moment(new Date()).add(1, "days").format("L LT"),
                                    agenda: null,
                                    prospectingType: $scope.prospectingType,
                                    notification: null,
                                }

                                var html = '<div><talk-activity-popup prospecting-activity-customer-result="prospectingActivityCustomerResult"' +
                                    'prospecting-schedule="prospectingSchedule"' +
                                    'prospecting-activity-customer-results="prospectingActivityCustomerResults"' +
                                    'activity-started-for="prospectingActivityFilterForResult.id"' +
                                    'open-talk-activity-popup-mode="openTalkActivityPopupMode">' +
                                    '</talk-activity-popup></div>';
                                var linkFn = $compile(html);
                                var content = linkFn($scope);
                                $("#talk-activity-popup-div").html(content);
                                $scope.openTalkActivityPopupMode.isPopupOpen = true;
                                //$("#updateResultTalkedActvityModal").modal("show");
                            }
                        }
                    }
                    else if (activityIndex == 2) {
                        var isExist = _.any(prospectingCustomerResults, function (resultItem) {
                            return resultItem.prospectingCustomerId == prospectingCustomerId && resultItem.skillId == skillId && resultItem.prospectingActivityId == $scope.prospectingActivityFilterForResult.id;
                        })
                        if (isExist) {
                            dialogService.showYesNoDialog($translate.instant('COMMON_CONFIRM'), $translate.instant('TASKPROSPECTING_IT_WILL_CLEAR_ALL_MEETING_DETAILS_ARE_YOU_SURE_TO_CONTINUE')).then(function () {
                                var resultItem = _.filter(prospectingCustomerResults, function (resultItem) {
                                    return resultItem.prospectingCustomerId == prospectingCustomerId && resultItem.skillId == skillId && resultItem.prospectingActivityId == $scope.prospectingActivityFilterForResult.id;
                                });
                                if (resultItem.length > 0) {
                                    serviceProspectingManager.uncheckCustomerActivityResult(resultItem[0]).then(function (data) {
                                        if (data) {
                                            _.each(data, function (dataItem) {
                                                var index = _.findIndex(prospectingCustomerResults, function (item) {
                                                    return item.id == dataItem
                                                });
                                                if (index > -1) {
                                                    prospectingCustomerResults.splice(index, 1);
                                                }
                                                _.each($scope.viewProspectingActivityResultData, function (viewItem) {
                                                    var isExist = _.any(viewItem.prospectingCustomerResults, function (resultItem) {
                                                        return resultItem.id == dataItem;
                                                    });
                                                    if (isExist) {
                                                        var index = _.findIndex(viewItem.prospectingCustomerResults, function (item) {
                                                            return item.id == dataItem
                                                        });
                                                        viewItem.prospectingCustomerResults.splice(index, 1);
                                                    }
                                                });
                                            });
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
                                _.each(prospectingCustomerResults, function (resultItem) {
                                    if (resultItem.prospectingCustomerId == prospectingCustomerId && resultItem.skillId == skillId && resultItem.prospectingActivityId == $scope.prospectingActivityFilterForResult.id) {
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
                                    prospectingActivityId: $scope.prospectingActivityFilterForResult.id,
                                    skillId: skillId,
                                    isDone: checkStatus,
                                    reason: null,
                                    description: null,
                                    duration: null,
                                    customerInterestRate: null,
                                    isFollowUp: false,
                                    isNoMeeting: false,
                                    isMeeting: true,
                                    prospectingSchedules: [],
                                    prospectingType: $scope.prospectingType
                                };
                                $scope.prospectingSchedule = {
                                    prospectingCustomerId: prospectingCustomerId,
                                    prospectingActivityId: $scope.prospectingActivityFilterForResult.id,
                                    prospectingCustomerResultId: 0,
                                    isMeeting: true,
                                    isFollowUp: false,
                                    scheduleDate: moment(new Date()).format("L LT"),
                                    agenda: null,
                                    prospectingType: $scope.prospectingType,
                                    notification: null
                                }
                                $("#scheduleModal").modal("show");
                            }
                        }
                    }
                }
                else {
                    dialogService.showNotification($translate.instant('TASKPROSPECTING_PLEASE_ENABLE_ACTVITY_TO_EDIT_RESULT'), "warning");
                }
            };
            $scope.checkResultPreviousActvityIsDone = function (skills, skillId, prospectingCustomerId) {
                var result = false;
                if ($scope.isActivityEditEnable) {
                    var skillIndex = _.findIndex(skills, function (skillItem) {
                        return skillItem.id == skillId;
                    });
                    if (skillIndex > 0) {
                        var filteredResult = _.filter($scope.prospectingActivityCustomerResults, function (item) {
                            return item.skillId == skills[skillIndex - 1].id && item.prospectingCustomerId == prospectingCustomerId;
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
                }
                return result;
            }
            //

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
                                            //$scope.caculateTotalResult();

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
                                                //$scope.caculateTotalResult();
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
                        serviceProspectingManager.GetProjectProspectingGoalsByUserId($scope.topBoxFilterOption.userId, $scope.topBoxFilterOption.projectId).then(function (data) {
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
                                            //$scope.caculateTotalResult();
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

            $scope.prospectingGoalVisualizationFilterOption = {
                total: false,
                today: true,
                weekly: true,
                monthly: false,
                isShowActualGoal: false,
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
                    //$scope.caculateTotalResult();
                    //$scope.filterUserResult($scope.topBoxFilterOption.topboxResultOptionId)
                })
            };


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
            }];
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
            $scope.resultFilterOptionChanged = function () {
                if ($scope.topBoxFilterOption.topboxResultOptionId == $scope.resultFilterOptionEnums.Today && ($scope.topBoxFilterOption.topboxResultTypeId == $scope.topboxResultTypeEnum.CurrentPerformanceResult || $scope.topBoxFilterOption.topboxResultTypeId == $scope.topboxResultTypeEnum.CurrentPerformancePercentage)) {
                    $scope.topBoxFilterOption.topboxResultTypeId = $scope.topboxResultTypeEnum.Percentage;
                }
                //$scope.caculateTotalResult();
                //$scope.filterUserResult($scope.topBoxFilterOption.topboxResultOptionId)
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
                    
                })
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
            function ResetAll() {
                $scope.prospectingGoals = [];
                $scope.prospectingGoalActivityInfoes = [];
                $scope.prospectingActivityCustomers = [];
                $scope.prospectingCustomers = [];
                $scope.prospectingActivityCustomerResults = [];
                $scope.topBoxFilterOption.prospectingGoalId = 0;
                $scope.topBoxFilterOption.userId = 0;
                $scope.topBoxFilterOption.userName = $translate.instant('TASKPROSPECTING_ALL_MEMBERS');
                $scope.topBoxFilterOption.prospectingGoalIds = [];
            }
        }
    ])