'use strict';

angular.module('ips.myDashboard', ['ui.router', 'growing-panes'])
    .config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
        $stateProvider
            .state('myDashboard', {
                url: "/myDashboard",
                templateUrl: "views/myDashboard/myDashboard.html",
                controller: "myDashboardCtrl",
                authenticate: true,
                resolve: {
                    pageName: function ($translate) {
                        return $translate.instant('MY_DASHBOARD');
                    },
                    allcategories: function (todosManager, authService) {
                        if (authService.authentication.isAuth) {
                            return todosManager.getAllCategories().then(function (data) {
                                angular.forEach(data, function (item, value) {
                                    item.value = item.id;
                                });
                                return data;
                            });
                        } else {
                            return [];
                        }
                    },
                },
                data: {
                    displayName: '{{pageName}}',//'Home',
                }
            });
    }])
    .controller('myDashboardCtrl', ['$scope', '$location', 'authService', 'progressBar', '$rootScope', 'cssInjector', 'todoManager', 'todosManager', 'allcategories', 'userDashboardManager', 'dialogService', '$compile', 'trainingSaveModeEnum', 'profilesTypesEnum', 'softProfileTypesEnum', 'ktProfileTypesEnum', 'localStorageService', 'globalVariables', '$translate', 'projectRolesEnum',
        function ($scope, $location, authService, progressBar, $rootScope, cssInjector, todoManager, todosManager, allcategories, userDashboardManager, dialogService, $compile, trainingSaveModeEnum, profilesTypesEnum, softProfileTypesEnum, ktProfileTypesEnum, localStorageService, globalVariables, $translate, projectRolesEnum) {
            cssInjector.removeAll();
            cssInjector.add('views/home/home.css');
            cssInjector.add('css/calendar.css');
            $scope.scrollOptions = {
                position: 'right',
                height: 'auto !important',
                railVisible: true,
                alwaysVisible: true,
            };
            $scope.ktProfileTypes = {
                start: {
                    id: 1,
                    label: $translate.instant('COMMON_START_STAGE')
                },
                final: {
                    id: 2,
                    label: $translate.instant('COMMON_FINAL_STAGE')
                }
            };
            $scope.stages = [];
            $scope.userProjects = [];
            $scope.openProjectTrainingPopupMode = {
                isOpenNewTrainingPopup: false,
                isOpenAddExistingTrainingPopup: false
            }
            $scope.openTaskDetailPopupMode = {
                isPopupOpen: false
            }
            $scope.show_activity = true;
            $scope.today = new Date().setHours(0, 0, 0, 0);
            moment.locale(globalVariables.lang.currentUICulture);
            var endDay = moment();
            $scope.endOfDay = endDay.endOf('day')._d;
            $scope.projectdata = null;
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
            $scope.init = function () {
                userDashboardManager.getUserProjects().then(function (data) {
                    $scope.projectdata = data;
                    $scope.userProjects = [];
                    if ($scope.projectdata.activeProjects.length > 0) {
                        _.each($scope.projectdata.activeProjects, function (item) {
                            $scope.userProjects.push(item);
                        })

                    }
                    $scope.userProjects.unshift({
                        id: 0,
                        name: 'No Project'
                    });
                    if ($scope.userProjects.length > 1) {
                        $scope.selectProject($scope.userProjects[1].id);
                    } else {
                        $scope.selectProject($scope.userProjects[0].id);
                    }

                }, function () {
                    $scope.projectdata = {
                        activeProjects: [],
                        completedProjects: []
                    };
                })
                userDashboardManager.getProfiles(authService.authentication.user.id, null).then(function (data) {
                    $scope.profiledata = data;
                    $scope.profiledata.activeProfiles = _.filter(data.activeProfiles, function (profileItem) {
                        return profileItem.participant.evaluationRoleId == 2 && profileItem.isExpired == false && (!(profileItem.isPaused || profileItem.isStopped));
                    });
                    $scope.profiledata.completedProfiles = _.filter(data.completedProfiles, function (profileItem) {
                        return profileItem.participant.evaluationRoleId == 2 && profileItem.isExpired == false;
                    });

                    //if ($scope.profiledata.completedProfiles.length > 0) {
                    //    $scope.profileChanged($scope.profiledata.completedProfiles[0].profile.id);
                    //} else if ($scope.profiledata.activeProfiles.length > 0) {
                    //    $scope.profileChanged($scope.profiledata.activeProfiles[0].profile.id);
                    //}

                }, function () {
                    $scope.profiledata = {
                        activeProfiles: [],
                    }
                })
                todoManager.getTodosById().then(function (data) {
                    $scope.taskTodos = [];
                    var start = moment().startOf('day');
                    // set to 12:00 am today
                    var end = moment().endOf('day');
                    var today = new Date();
                    today = today.setHours(0, 0, 0, 0);
                    angular.forEach(data, function (item, index) {
                        item.start = moment(kendo.parseDate(item.startDate)).toDate();
                        item.taskId = item.id;
                        item.end = moment(kendo.parseDate(item.dueDate)).toDate();
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
                            projectId: item.projectId
                        });
                        var occurrences = event.expand(kendo.parseDate(item.startDate), kendo.parseDate(item.dueDate));
                        _.each(occurrences, function (todoItem) {
                            var todoItemStartDate = _.clone(todoItem.start);
                            if (kendo.parseDate(todoItemStartDate).setHours(0, 0, 0, 0) == today) {
                                var x = {
                                    assignedToId: item.assignedToId,
                                    categoryId: item.categoryId,
                                    title: item.title,
                                    description: item.description,
                                    startDate: moment(kendo.parseDate(todoItem.start)).format('L LT'),
                                    dueDate: moment(kendo.parseDate(todoItem.start)).endOf('day').format('L LT'),
                                    id: item.id,
                                    isCompleted: false,
                                    recurrenceRule: item.recurrenceRule,
                                    taskId: item.id,
                                    taskActualStartDate: moment(kendo.parseDate(item.startDate)).format('L LT'),
                                    taskActualDueDate: moment(kendo.parseDate(item.dueDate)).format('L LT'),
                                    taskCategoryListItem: item.taskCategoryListItem,
                                    projectId: item.projectId
                                }
                                $scope.taskTodos.push(x);
                            }
                        })

                    });
                    App.initSlimScroll(".scroller");
                    //$("#taskCalendar").kendoScheduler({
                    //    date: moment().toDate(),
                    //    views: [
                    //        "day",
                    //        { type: "workWeek", selected: true },
                    //        "week",
                    //        "month",
                    //    ],
                    //    height: 600,
                    //    timezone: "Etc/UTC",
                    //    resources: [
                    //        {
                    //            field: "categoryId",
                    //            dataSource: allcategories
                    //        }
                    //    ],
                    //    editable: false,
                    //    eventTemplate: $("#event-template").html(),
                    //    allDayEventTemplate: $("#event-template").html(),
                    //});

                    //var dataSource = getDataSource();
                    //if ($("#taskCalendar").length > 0) {
                    //    $("#taskCalendar").data("kendoScheduler").setDataSource(dataSource);
                    //}
                });
                userDashboardManager.getUserPersonalTrainingsForToday(authService.authentication.user.userId).then(function (data) {
                    $scope.personalTrainings = [];
                    $scope.allPersonalTrainings = data;
                    var today = new Date();
                    today = today.setHours(0, 0, 0, 0);
                    angular.forEach(data, function (item, index) {
                        var event = new kendo.data.SchedulerEvent({
                            id: item.id,
                            description: item.additionalInfo,
                            title: item.name,
                            start: kendo.parseDate(item.startDate),
                            //item1.start,
                            end: kendo.parseDate(item.endDate),
                            recurrenceRule: item.frequency,
                            isAllDay: moment(kendo.parseDate(item.startDate)).format("HHmmss") == "000000",
                            color: "#6CE26C",
                            taskListId: -1,
                            statusId: -1,
                            categoryId: -1,
                            priorityId: -1,
                            //textColor: "#FFFFFF"
                            isParticipant: item.isParticipant,
                            participantName: item.participantName,
                            isEvaluator: item.isEvaluator,
                            evaluatorName: item.evaluatorName,
                            isPaused: false,
                            hasEvaluatorFeedback: false,
                        });
                        var occurrences = event.expand(kendo.parseDate(item.startDate), kendo.parseDate(item.endDate));
                        var recurrence = -1;
                        angular.forEach(occurrences, function (item1, index1) {
                            var isRecurrenceDone = _.filter(item.trainingFeedbacks, function (itemfeedback) {
                                if (itemfeedback.recurrencesStartTime) {
                                    return itemfeedback.trainingId == item.id && kendo.parseDate(itemfeedback.recurrencesStartTime).getTime() == item1.start.getTime() && itemfeedback.isParticipantPaused == false;
                                }
                            });
                            if (!isRecurrenceDone.length > 0) {
                                var isRecurrencePaused = _.filter(item.trainingFeedbacks, function (itemfeedback) {
                                    if (itemfeedback.recurrencesStartTime) {
                                        return itemfeedback.trainingId == item.id && kendo.parseDate(itemfeedback.recurrencesStartTime).getTime() == item1.start.getTime() && itemfeedback.isParticipantPaused == true;
                                    }
                                });
                                if (isRecurrencePaused.length > 0) {
                                    item1.isPaused = true;
                                    _.each(isRecurrencePaused, function (pausedItem) {
                                        item1.timeSpentMinutes += pausedItem.timeSpentMinutes != null ? parseInt(pausedItem.timeSpentMinutes) : 0;
                                    });
                                }
                            }
                            var endTime = new Date(moment(kendo.parseDate(item1.start)).endOf("day"));
                            if (!occurrences[index1 + 1]) {
                                if (endTime.getTime() > kendo.parseDate(item.endDate).getTime()) {
                                    endTime = kendo.parseDate(item.endDate);
                                }
                                var itemStartDate = _.clone(item1.start);
                                if (kendo.parseDate(itemStartDate).setHours(0, 0, 0, 0) == today) {
                                    $scope.personalTrainings.push({
                                        "orginalId": item.id,
                                        "id": recurrence,
                                        "description": item1.description,
                                        "title": item1.title,
                                        "start": item1.start,
                                        //"/Date(1523511510858)/", //item1.start,
                                        "end": endTime,
                                        //"/Date(1523511510858)/"
                                        "isAllDay": false,
                                        "eventType": item1.eventType,
                                        "statusId": item.statusId,
                                        "categoryId": item.categoryId,
                                        "priorityId": item.priorityId,
                                        "recurrencesRule": item.recurrenceRule,
                                        "isDone": isRecurrenceDone.length > 0 ? true : false,
                                        "isPaused": item1.isPaused,
                                        "duration": item.duration ? item.duration : 0,
                                        "durationMetric": item.durationMetricId,
                                        //"textColor": "#FFFFFF"
                                    });
                                }
                            } else {
                                var itemStartDate = _.clone(item1.start);
                                if (kendo.parseDate(itemStartDate).setHours(0, 0, 0, 0) == today) {
                                    $scope.personalTrainings.push({
                                        "orginalId": item.id,
                                        "id": recurrence,
                                        "description": item1.description,
                                        "title": item1.title,
                                        "start": item1.start,
                                        //"/Date(1523511510858)/", //item1.start,
                                        "end": endTime,
                                        //"/Date(1523511510858)/"
                                        "isAllDay": false,
                                        "eventType": item1.eventType,
                                        "statusId": item.statusId,
                                        "categoryId": item.categoryId,
                                        "priorityId": item.priorityId,
                                        "recurrencesRule": item.recurrenceRule,
                                        "isDone": isRecurrenceDone.length > 0 ? true : false,
                                        "isPaused": item1.isPaused,
                                        "duration": item.duration ? item.duration : 0,
                                        "durationMetric": item.durationMetricId,
                                        //"textColor": "#FFFFFF"
                                    });
                                }
                            }

                            recurrence = recurrence - 1;
                        });
                    });
                });
                userDashboardManager.getUserProfileTrainingsForToday(authService.authentication.user.userId).then(function (data) {
                    $scope.profileTrainings = [];
                    $scope.allProfileTrainings = data;
                    var today = new Date();
                    today = today.setHours(0, 0, 0, 0);
                    angular.forEach(data, function (item, index) {
                        var event = new kendo.data.SchedulerEvent({
                            id: item.id,
                            description: item.additionalInfo,
                            title: item.name,
                            start: kendo.parseDate(item.startDate),
                            //item1.start,
                            end: kendo.parseDate(item.endDate),
                            recurrenceRule: item.frequency,
                            isAllDay: moment(kendo.parseDate(item.startDate)).format("HHmmss") == "000000",
                            color: "#6CE26C",
                            taskListId: -1,
                            statusId: -1,
                            categoryId: -1,
                            priorityId: -1,
                            //textColor: "#FFFFFF"
                            isParticipant: item.isParticipant,
                            participantName: item.participantName,
                            isEvaluator: item.isEvaluator,
                            evaluatorName: item.evaluatorName,
                            isPaused: false,
                            hasEvaluatorFeedback: false,
                        });
                        var occurrences = event.expand(kendo.parseDate(item.startDate), kendo.parseDate(item.endDate));
                        var recurrence = -1;
                        angular.forEach(occurrences, function (item1, index1) {
                            var isRecurrenceDone = _.filter(item.trainingFeedbacks, function (itemfeedback) {
                                if (itemfeedback.recurrencesStartTime) {
                                    return itemfeedback.trainingId == item.id && kendo.parseDate(itemfeedback.recurrencesStartTime).getTime() == item1.start.getTime() && itemfeedback.isParticipantPaused == false;
                                }
                            });
                            if (!isRecurrenceDone.length > 0) {
                                var isRecurrencePaused = _.filter(item.trainingFeedbacks, function (itemfeedback) {
                                    if (itemfeedback.recurrencesStartTime) {
                                        return itemfeedback.trainingId == item.id && kendo.parseDate(itemfeedback.recurrencesStartTime).getTime() == item1.start.getTime() && itemfeedback.isParticipantPaused == true;
                                    }
                                });
                                if (isRecurrencePaused.length > 0) {
                                    item1.isPaused = true;
                                    _.each(isRecurrencePaused, function (pausedItem) {
                                        item1.timeSpentMinutes += pausedItem.timeSpentMinutes != null ? parseInt(pausedItem.timeSpentMinutes) : 0;
                                    });
                                }
                            }
                            var endTime = new Date(moment(kendo.parseDate(item1.start)).endOf("day"));
                            if (!occurrences[index1 + 1]) {
                                if (endTime.getTime() > kendo.parseDate(item.endDate).getTime()) {
                                    endTime = kendo.parseDate(item.endDate);
                                }
                                var itemStartDate = _.clone(item1.start);
                                if (kendo.parseDate(itemStartDate).setHours(0, 0, 0, 0) == today) {
                                    $scope.profileTrainings.push({
                                        "orginalId": item.id,
                                        "id": recurrence,
                                        "description": item1.description,
                                        "title": item1.title,
                                        "start": item1.start,
                                        //"/Date(1523511510858)/", //item1.start,
                                        "end": endTime,
                                        //"/Date(1523511510858)/"
                                        "isAllDay": false,
                                        "eventType": item1.eventType,
                                        "statusId": item.statusId,
                                        "categoryId": item.categoryId,
                                        "priorityId": item.priorityId,
                                        "recurrencesRule": item.recurrenceRule,
                                        "isDone": isRecurrenceDone.length > 0 ? true : false,
                                        "isPaused": item1.isPaused,
                                        "duration": item.duration ? item.duration : 0,
                                        "durationMetric": item.durationMetricId,
                                        //"textColor": "#FFFFFF"
                                    });
                                }
                            } else {
                                var itemStartDate = _.clone(item1.start);
                                if (kendo.parseDate(itemStartDate).setHours(0, 0, 0, 0) == today) {
                                    $scope.profileTrainings.push({
                                        "orginalId": item.id,
                                        "id": recurrence,
                                        "description": item1.description,
                                        "title": item1.title,
                                        "start": item1.start,
                                        //"/Date(1523511510858)/", //item1.start,
                                        "end": endTime,
                                        //"/Date(1523511510858)/"
                                        "isAllDay": false,
                                        "eventType": item1.eventType,
                                        "statusId": item.statusId,
                                        "categoryId": item.categoryId,
                                        "priorityId": item.priorityId,
                                        "recurrencesRule": item.recurrenceRule,
                                        "isDone": isRecurrenceDone.length > 0 ? true : false,
                                        "isPaused": item1.isPaused,
                                        "duration": item.duration ? item.duration : 0,
                                        "durationMetric": item.durationMetricId,
                                        //"textColor": "#FFFFFF"
                                    });
                                }
                            }
                            recurrence = recurrence - 1;
                        });
                    });
                });
                //$scope.getActvityProfiles();
            }
            $scope.getTrainingSpentTime = function (training) {

                var spentTimes = 0;
                var trainingObj = _.find($scope.allPersonalTrainings, function (item) {
                    return item.id == training.orginalId;
                });
                if (!trainingObj) {
                    trainingObj = _.find($scope.allProfileTrainings, function (item) {
                        return item.id == training.orginalId;
                    });
                }
                if (trainingObj) {
                    _.each(trainingObj.trainingFeedbacks, function (trainingFeedbackItem) {
                        spentTimes += trainingFeedbackItem.timeSpentMinutes;
                    });
                }
                if (spentTimes > 60) {
                    return (spentTimes / 60).toFixed(2) + " Hours";
                } else {
                    return spentTimes + " Min";
                }
            }
            $scope.getTrainingPlannedTime = function (training) {

                var trainingObj = _.find($scope.allPersonalTrainings, function (item) {
                    return item.id == training.orginalId;
                });
                if (!trainingObj) {
                    trainingObj = _.find($scope.allProfileTrainings, function (item) {
                        return item.id == training.orginalId;
                    });
                }

                var plannedTime = 0;
                if (trainingObj) {
                    var event = new kendo.data.SchedulerEvent({
                        id: trainingObj.id,
                        start: kendo.parseDate(trainingObj.startDate),
                        //item1.start,
                        end: kendo.parseDate(trainingObj.endDate),
                        recurrenceRule: trainingObj.frequency,
                        isAllDay: moment(kendo.parseDate(trainingObj.startDate)).format("HHmmss") == "000000",
                    });
                    var occurrences = event.expand(kendo.parseDate(trainingObj.startDate), kendo.parseDate(trainingObj.endDate));
                    var recurrence = -1;
                    if (trainingObj.durationMetricId == 1) {
                        //Hour
                        plannedTime += (trainingObj.duration * 60);
                    }
                    if (trainingObj.durationMetricId == 3) {
                        //Minutes
                        plannedTime += (trainingObj.duration);
                    }
                    if (trainingObj.durationMetricId == 4) {
                        //Seconds
                        plannedTime += (trainingObj.duration / 60);
                    }
                    if (trainingObj.durationMetricId == 5) {
                        //Days
                        plannedTime += (trainingObj.duration * 1440);
                    }

                    plannedTime = (plannedTime * occurrences.length);
                }
                if (plannedTime > 60) {
                    return (plannedTime / 60).toFixed(2) + " Hours";
                } else {
                    return plannedTime + " Min";
                }
            }

            $scope.isTrainingDone = function (trainingId) {
                return false;
            }
            $scope.$on("$viewContentLoaded", function () { })
            $scope.signIn = function () {
                $location.url("/login?target=1");
            }
            $scope.showMoreToDos = function () {
                $location.path("/home/todos/todos");
            }
            $scope.addNewTask = function () {
                $location.path("/home/todos/todos/edit/0");
            }
            $scope.isProspectingTask = function (todoItem) {
                if (todoItem.taskCategoryListItem.name.toLowerCase().indexOf("prospecting") > -1) {
                    return true;
                }
            }
            $scope.gotoProspecting = function (todoItem) {
                localStorageService.set("prospectingTask", {
                    taskId: todoItem.id,
                    projectId: todoItem.projectId
                });
                if (todoItem.assignedToId == $scope.currentUser.userId) {
                    if (todoItem.taskCategoryListItem.name.toLowerCase() == "prospecting" || todoItem.taskCategoryListItem.name.toLowerCase() == "sales prospecting") {
                        $location.path("/home/salesProspecting/todaySalesProspecting");
                    } else if (todoItem.taskCategoryListItem.name.toLowerCase() == "service prospecting") {
                        $location.path("/home/serviceProspecting/todayServiceProspecting");
                    }
                }
                else {
                    if (todoItem.taskCategoryListItem.name.toLowerCase() == "prospecting" || todoItem.taskCategoryListItem.name.toLowerCase() == "sales prospecting") {
                        $location.path("/home/salesProspecting/measure");
                    } else if (todoItem.taskCategoryListItem.name.toLowerCase() == "service prospecting") {
                        $location.path("/home/serviceProspecting/measure");
                    }
                }
            }
            $scope.startPersonalTraining = function (id) {
                localStorageService.set("RecurrenceDetail", null);
                if (id > 0) {
                    var recurrenceObj = _.filter($scope.personalTrainings, function (item) {
                        return item.orginalId == id;
                    });
                    if (recurrenceObj.length > 0) {
                        localStorageService.set("RecurrenceDetail", recurrenceObj[0]);
                    }
                }
                if (id > 0) {
                    dialogService.showYesNoDialog($translate.instant('COMMON_CONFIRM'), $translate.instant('TRAININGDAIRY_REVIEW_TRAINING_NOTES_AND_FEEDBACK_TO_PERFORM_BETTER_TRAINING') + "</br>" + $translate.instant('TRAININGDAIRY_ARE_YOU_SURE_YOU_WANT_TO_START_TRAINING')).then(function () {
                        $location.path("/home/training/start/" + id);
                    }, function () {//alert('No clicked');
                    });
                }
            }
            $scope.startTraining = function (id) {
                localStorageService.set("RecurrenceDetail", null);
                if (id > 0) {
                    var recurrenceObj = _.filter($scope.profileTrainings, function (item) {
                        return item.orginalId == id;
                    });
                    if (recurrenceObj.length > 0) {
                        localStorageService.set("RecurrenceDetail", recurrenceObj[0]);
                    }
                }
                if (id > 0) {
                    dialogService.showYesNoDialog($translate.instant('COMMON_CONFIRM'), $translate.instant('TRAININGDAIRY_REVIEW_TRAINING_NOTES_AND_FEEDBACK_TO_PERFORM_BETTER_TRAINING') + "</br>" + $translate.instant('TRAININGDAIRY_ARE_YOU_SURE_YOU_WANT_TO_START_TRAINING')).then(function () {
                        $location.path("/home/training/start/" + id);
                    }, function () {//alert('No clicked');
                    });
                }
            }
            $scope.openTrainingDetail = function (Id) {
                if (Id > 0) {
                    var html = '<project-training-popup organization-id="currentUser.user.organizationId"' + 'user-id="currentUser.user.userId"' + 'open-project-training-popup-mode="openProjectTrainingPopupMode"' + 'save-mode="saveMode"' + 'editing-training="editingTraining"' + 'skill="activeSkill"' + 'evaluation-Agreement="evaluationAgreement"' + 'stage="activeStage">' + '</project-training-popup>';
                    var linkFn = $compile(html);
                    var content = linkFn($scope);
                    $("#home-project-training-popup-div").html(content);
                    userDashboardManager.getTrainingDetailById(Id).then(function (data) {
                        $scope.editingTraining = data;
                        if ($scope.editingTraining.skills) {
                            if ($scope.editingTraining.skills.length > 0) {
                                $scope.editingTraining["skillId"] = $scope.editingTraining.skills[0].id;
                            }
                        }
                        $scope.saveMode = trainingSaveModeEnum.view;
                        $scope.openProjectTrainingPopupMode.isOpenNewTrainingPopup = true;
                    }, function () {
                        $scope.openProjectTrainingPopupMode.isOpenNewTrainingPopup = false;
                        dialogService.showNotification("Something went worng!!", "error");
                    });
                }
            }
            $scope.openTaskDetail = function (Id) {
                if (Id > 0) {
                    var html = '<div><task-detail-popup task-detail="taskDetail"' + 'task-categories="taskCategories"' + 'task-statuses="taskStatuses"' + 'task-priorities="taskPriorities"' + 'notification-templates="notificationTemplates"' + 'open-task-detail-popup-mode="openTaskDetailPopupMode">' + '</task-detail-popup></div>';
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
                            data.unshift({
                                id: null,
                                name: "Select Template..."
                            });
                            $scope.notificationTemplates = data;
                        });
                        data.viewName = data.title;
                        data.startDate = data.startDate ? moment(kendo.parseDate(data.startDate)).format('L LT') : "";
                        data.dueDate = data.dueDate ? moment(kendo.parseDate(data.dueDate)).format('L LT') : "";
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
                                    $scope.taskFeedback.workedWell = "Task Completed"
                                    $scope.taskFeedback.recurrencesStartTime = item.startDate;
                                    $scope.taskFeedback.recurrencesEndTime = item.dueDate;
                                    $scope.taskFeedback.recurrencesRule = item.recurrenceRule;
                                    todoManager.getTaskScaleRatingByUserId(item.assignedToId).then(function (data) {
                                        $scope.ratings = [];
                                        if (data.length > 0) {
                                            _.forEach(data, function (item) {
                                                if (item.min == item.max) {
                                                    $scope.ratings.push({
                                                        value: item.min,
                                                        background: item.color
                                                    })
                                                } else {
                                                    for (var i = item.min; i <= item.max; i++) {
                                                        $scope.ratings.push({
                                                            value: i,
                                                            background: item.color
                                                        })
                                                    }
                                                }

                                            });
                                        } else {
                                            $scope.ratings.push({
                                                value: 1,
                                                background: "#f00"
                                            });
                                            $scope.ratings.push({
                                                value: 2,
                                                background: "#ff0"
                                            });
                                            $scope.ratings.push({
                                                value: 3,
                                                background: "#0f3"
                                            });
                                            $scope.ratings.push({
                                                value: 4,
                                                background: "#06f"
                                            });
                                            $scope.ratings.push({
                                                value: 5,
                                                background: "#f99"
                                            });
                                        }

                                        $("#taskFeedbackModal").modal("show");
                                        //vm.taskScale.taskScaleRanges = data.taskScaleRanges;
                                    }, function () {
                                        $scope.ratings = [];
                                        $scope.ratings.push({
                                            value: 1,
                                            background: "#f00"
                                        });
                                        $scope.ratings.push({
                                            value: 2,
                                            background: "#ff0"
                                        });
                                        $scope.ratings.push({
                                            value: 3,
                                            background: "#0f3"
                                        });
                                        $scope.ratings.push({
                                            value: 4,
                                            background: "#06f"
                                        });
                                        $scope.ratings.push({
                                            value: 5,
                                            background: "#f99"
                                        });
                                        $("#taskFeedbackModal").modal("show");
                                    });

                                }

                            });
                        }
                    } else {
                        todosManager.isCompleted(id, true).then(function (data) {
                            if (data) {
                                item.isCompleted = true;
                            }
                        });
                    }
                }
            }
            $scope.saveTraningFeedback = saveTraningFeedback;
            function saveTraningFeedback() {
                if ($scope.taskFeedback.trainingId == 0) {
                    $scope.taskFeedback.trainingId = null;
                }
                todosManager.saveTraningFeedback($scope.taskFeedback).then(function (data) {
                    if (data.id > 0) {
                        dialogService.showNotification("Feedback saved successfully", "info");
                    } else {
                        dialogService.showNotification("Feedback not saved", "warning");
                    }
                });
            }
            $scope.cancelTraningFeedback = cancelTraningFeedback;
            function cancelTraningFeedback() {
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
            function getDataSource() {

                var ds = [];
                angular.forEach($scope.taskTodos, function (item, index) {
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

                    angular.forEach(occurrences, function (item1, index1) {
                        ds.push(new kendo.data.SchedulerEvent({
                            id: item1.id == 0 ? item1.recurrenceId : item1.id,
                            title: item1.title,
                            start: item1.start,
                            end: new Date(moment(kendo.parseDate(item1.start)).add(30, 'minutes')),
                            taskCategoryListItem: item1.taskCategoryListItem,
                            training: item1.training,
                            trainingId: item1.trainingId,
                            StartTimezone: "Etc/UTC",
                            EndTimezone: "Etc/UTC",
                            isAllDay: item1.isAllDay,
                            textColor: item1.textColor,
                            color: item1.color
                        }));
                    });
                });

                var dataSource = new kendo.data.SchedulerDataSource({
                    //type: "json",
                    data: ds,
                    schema: {
                        model: {
                            id: "id",
                            fields: {
                                id: {
                                    from: "id",
                                    type: "number"
                                },
                                title: {
                                    from: "title",
                                    defaultValue: "No title",
                                    validation: {
                                        required: true
                                    }
                                },
                                start: {
                                    type: "date",
                                    from: "start"
                                },
                                end: {
                                    type: "date",
                                    from: "end"
                                },
                                startTimezone: {
                                    from: "StartTimezone"
                                },
                                endTimezone: {
                                    from: "EndTimezone"
                                },
                                //description: { from: "Description" },
                                //recurrenceId: { from: "RecurrenceID" },
                                //recurrenceRule: { from: "recurrenceRule" },
                                //recurrenceException: { from: "RecurrenceException" },
                                //ownerId: { from: "OwnerID", defaultValue: 1 },
                                isAllDay: {
                                    type: "boolean",
                                    from: "isAllDay"
                                },
                                textColor: {
                                    from: "textColor"
                                },
                                color: {
                                    from: "color"
                                },
                            }
                        }
                    },
                });

                dataSource.fetch();

                return dataSource;
            }
            $scope.profileChanged = function (profileId) {
                $scope.stages = [];
                //$scope.selectedProfileScaleRanges = [];
                $scope.filteredResult.showGraph = false;
                $scope.filteredResult.showGauge = false;
                $scope.filteredResult.showKpiBar = false;
                $scope.filteredResult.showCompareGauge = false;
                $scope.filteredResult.showCompareKpi = false;
                $scope.selectedStage = null;
                $scope.selectedStep = null;
                $scope.selectedCompareStage = null;
                $scope.selectedCompareStep = null;
                var profile = _.find($scope.profiledata.activeProfiles, function (item) {
                    return item.profile.id == profileId;
                })
                if (profile) {
                    $scope.selectedProfile = profile.profile;
                    $scope.selectedProfileparticipant = profile.participant;
                } else {
                    var profile = _.find($scope.profiledata.completedProfiles, function (item) {
                        return item.profile.id == profileId;
                    });
                    if (profile) {
                        $scope.selectedProfile = profile.profile;
                        $scope.selectedProfileparticipant = profile.participant;
                    }
                }
                if ($scope.selectedProfile) {
                    if ($scope.selectedProfile.profileTypeId == profilesTypesEnum.soft) {
                        $scope.profileSteps = getDefaultSoftProfileTypes();
                    } else {
                        $scope.profileSteps = getDefaultKTProfileTypes();
                    }
                    $scope.selectedStep = $scope.profileSteps[$scope.profileSteps.length - 1];
                }
                userDashboardManager.getProfileStages($scope.selectedProfile.id, null, null).then(function (data) {
                    angular.forEach(data, function (item, index) {
                        $scope.stages.push({
                            id: item.id,
                            name: item.name + " (" + item.statusText + ")",
                            stageGroupId: item.stageGroupId
                        });
                    });
                    if (data.length > 0) {
                        //$scope.selectStage(data[0].id);
                    }

                })
                userDashboardManager.getScaleRanges($scope.selectedProfile.id).then(function (data) {
                    $scope.selectedProfileScaleRanges = [];
                    _.each(data, function (dataItem) {
                        $scope.selectedProfileScaleRanges.push({
                            min: dataItem.min,
                            max: dataItem.max,
                            from: parseInt(dataItem.min) * 10,
                            to: parseInt(dataItem.max) * 10,
                            color: dataItem.color,
                            minPercentage: (dataItem.min * 10),
                            maxPercentage: (dataItem.max * 10),
                        });
                    })
                    //$scope.selectedProfileScaleRanges = data;
                })
            }
            $scope.selectStage = function (id) {
                $scope.selectedStages = [];
                $scope.selectedStage = _.find($scope.stages, function (stageItem) {
                    return stageItem.id == id;
                })
                if ($scope.selectedStage) {
                    $scope.selectedStages.push($scope.selectedStage.id);
                }
                //$("#home_stages .chkStage").each(function (el) {
                //    if ($(this).is(":checked")) {
                //        $scope.selectedStages.push($(this).data("value"));

                //    }
                //});
                $scope.dashboardResult = [];
                if ($scope.selectedProfileparticipant) {
                    getPerformnaceDashboardData($scope.selectedProfileparticipant.id, $scope.selectedStages);
                    getProsepectingActvitiyPerformnaceData($scope.selectedProfile.id, id, $scope.selectedProfileparticipant.id);
                }

            }
            $scope.profileStepChanged = function (stepId) {
                $scope.selectedStep = _.find($scope.profileSteps, function (item) {
                    return item.id == stepId;
                });
                if ($scope.selectedProfileparticipant && $scope.selectedStage) {
                    getPerformnaceDashboardData($scope.selectedProfileparticipant.id, $scope.selectedStages);
                }
            }
            $scope.isShowBenchmark = false;
            $scope.compareStageChanged = function (id) {
                $scope.selectedCompareStage = null;
                $scope.selectedCompareStep = null;
                $scope.dashboardResult = [];
                if (id > 0) {
                    $scope.selectedCompareStages = [];
                    $scope.selectedCompareStage = _.find($scope.stages, function (stageItem) {
                        return stageItem.id == id;
                    })
                    if ($scope.selectedCompareStage) {
                        $scope.selectedCompareStages.push($scope.selectedCompareStage.id);
                        if ($scope.profileSteps) {
                            if ($scope.profileSteps.length > 0) {
                                $scope.selectedCompareStep = $scope.profileSteps[$scope.profileSteps.length - 1];
                            }
                        }
                    }
                    $scope.dashboardResult = [];
                    if ($scope.selectedProfileparticipant) {
                        getPerformnaceDashboardData($scope.selectedProfileparticipant.id, $scope.selectedCompareStages);
                        getProsepectingActvitiyPerformnaceData($scope.selectedProfile.id, id, $scope.selectedProfileparticipant.id);
                    }
                } else {
                    if ($scope.selectedProfileparticipant) {
                        getPerformnaceDashboardData($scope.selectedProfileparticipant.id, $scope.selectedCompareStages);
                    }
                }

            }
            $scope.compareProfileStepChanged = function (stepId) {
                $scope.selectedCompareStep = _.find($scope.profileSteps, function (item) {
                    return item.id == stepId;
                });
                if ($scope.selectedProfileparticipant && $scope.selectedCompareStep) {
                    getPerformnaceDashboardData($scope.selectedProfileparticipant.id, $scope.selectedCompareStages);
                }
            }
            $scope.getBenchmark = function () {
                $scope.isShowBenchmark = !$scope.isShowBenchmark;
                getPerformnaceDashboardData($scope.selectedProfileparticipant.id, $scope.selectedStages);
            }
            $scope.starMouseHover = function (el) {
                var onStar = parseInt($(el.target).data('value'), 10);
                // The star currently mouse on

                // Now highlight all the stars that's not after the current hovered star
                $(el.target).parents("#taskRatingStars").children('li.star').each(function (e) {
                    if (e < onStar) {
                        $(this).addClass('hover');
                    } else {
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
                var onStar = parseInt($(el.target).data('value'), 10);
                // The star currently selected
                var stars = $(el.target).parents("#taskRatingStars").children('li.star');

                for (var i = 0; i < stars.length; i++) {
                    $(stars[i]).removeClass('selected');
                }

                for (var i = 0; i < onStar; i++) {
                    $(stars[i]).addClass('selected');
                }

                var ratingValue = parseInt($('#taskRatingStars li.selected label').last().data('value'), 10);

                if (ratingValue > 1) {
                    $scope.taskFeedback.rating = ratingValue;
                } else {
                    $scope.taskFeedback.rating = 0;
                }
            }
                ;

            function getPerformnaceDashboardData(participantId, stageids) {
                if ($scope.selectedProfile.profileTypeId == profilesTypesEnum.soft) {
                    getFilteredData();

                    //_.forEach(stageids, function (stageid) {
                    //    userDashboardManager.getSoftProfileDashboardData($scope.selectedProfile.id, [participantId], stageid, $scope.selectedStep.id).then(function (data) {
                    //        $scope.dashboardResult.push(data);
                    //        $scope.filteredResult.showGauge = true;
                    //        $scope.filteredResult.showGraph = true;
                    //        $scope.filteredResult.showKpiBar = true;
                    //        $scope.filteredResult.showCompareGauge = false;
                    //        $scope.filteredResult.showCompareKpi = false;
                    //        $scope.filteredResult.isShowReport = true;
                    //        $scope.filteredResult.compareReportData = null;
                    //        if (!data) {
                    //            data = {};
                    //        }
                    //        data.isCompare = false;
                    //        data.label = "";
                    //        var profileTypeName = "";
                    //        data.profileTypeName = $scope.selectedStep.label; // "profileTypeName";
                    //        data.label = authService.authentication.user.firstName + " " + authService.authentication.user.lastName;
                    //        if (data.evaluatorsProfileScorecards && data.evaluatorsProfileScorecards.length > 0) {
                    //            angular.forEach(data.evaluatorsProfileScorecards, function (evaluatorProfileScorecard) {
                    //                evaluatorProfileScorecard.label = "evaluatorProfileScorecardlabel";
                    //            });
                    //        }
                    //        data.isShowWeakKpi = data.weakAreas != null ? true : false;
                    //        data.isShowStrongKpi = data.strongAreas != null ? true : false;
                    //        data.isShowBenchmark = true;
                    //        $scope.filteredResult.reportData = data;
                    //        if (data.isShowBenchmark) {
                    //            angular.forEach(data.performanceGroups, function (pg, pgIndex) {
                    //                angular.forEach(pg.skills, function (pgs, pgsIndex) {
                    //                    data.performanceGroups[pgIndex].skills[pgsIndex].bScore = data.performanceGroups[pgIndex].skills[pgsIndex].benchmark;
                    //                });
                    //            });
                    //        }
                    //        //data.isShowGoal = $scope.dashboard.isShowGoal;
                    //        data.isShowGoal = false;
                    //        $scope.filteredResult.reportData = data;

                    //    })
                    //});
                } else {
                    getFilteredData();
                    //return userDashboardManager.getKTProfileStagesResult($scope.selectedProfile.id, [participantId], false).then(function (data) {
                    //    if (data) {
                    //        if (data.length > 0) {
                    //            $scope.dashboardResult = data[0];

                    //            $scope.filteredResult.showGauge = true;
                    //            $scope.filteredResult.showGraph = true;
                    //            $scope.filteredResult.showKpiBar = true;
                    //            $scope.filteredResult.showCompareGauge = false;
                    //            $scope.filteredResult.showCompareKpi = false;
                    //            $scope.filteredResult.isShowReport = true;
                    //            $scope.filteredResult.compareReportData = null;
                    //            $scope.filteredResult.reportData = $scope.dashboardResult;
                    //            setKTFilteredDataToReport();
                    //        }
                    //    }
                    //});
                }
            }
            function getDefaultSoftProfileTypes() {
                var types = [];
                types.push(softProfileTypesEnum.startProfile);
                types.push(softProfileTypesEnum.finalProfile);
                types.push(softProfileTypesEnum.initialKPI);
                types.push(softProfileTypesEnum.finalKpi);
                return types;
            }
            ; function getDefaultKTProfileTypes() {
                var types = [];
                types.push($scope.ktProfileTypes.start);
                types.push($scope.ktProfileTypes.final);
                return types;
            }
            var getLabelTextFromOptions = function (text, profileTypeOptions, id) {
                _.forEach(profileTypeOptions, function (profileType, index) {
                    if (id == profileType.id) {
                        text += profileType.label;
                    }
                });
                return text;
            };
            var getFilteredData = function () {

                $scope.filteredResult.showGraph = false;
                $scope.filteredResult.showGauge = false;
                $scope.filteredResult.showKpiBar = false;
                $scope.filteredResult.showCompareGauge = false;
                $scope.filteredResult.showCompareKpi = false;
                if ($scope.selectedProfile.profileTypeId == profilesTypesEnum.soft) {
                    //$scope.isShowBenchmark = true;
                    var mainEvaluatorsModel = [];
                    if ($scope.selectedStep.id == softProfileTypesEnum.finalProfile.id || $scope.selectedStep.id == softProfileTypesEnum.finalKpi.id || $scope.selectedStep.id == softProfileTypesEnum.finalKPIResults.id) {
                        mainEvaluatorsModel = [];
                    }
                    var evaluatorsModel = [];
                    if ($scope.selectedCompareStep) {
                        if ($scope.selectedCompareStep.id == softProfileTypesEnum.finalProfile.id || $scope.selectedCompareStep.id == softProfileTypesEnum.finalKpi.id || $scope.selectedCompareStep.id == softProfileTypesEnum.finalKPIResults.id) {
                            evaluatorsModel = [];
                        }
                    }

                    $scope.participantsModel = [$scope.selectedProfileparticipant.id];
                    progressBar.startProgress();
                    userDashboardManager.getDashboardData($scope.selectedProfile.id, $scope.isShowBenchmark, $scope.participantsModel, mainEvaluatorsModel, $scope.selectedStage.id, $scope.selectedStep.id, null, $scope.selectedStage.stageGroupId).then(function (data) {
                        progressBar.stopProgress();
                        $scope.filteredResult.isShowReport = true;
                        if ($scope.selectedStage.name.indexOf("Start Stage") > -1 || $scope.selectedStage.name.indexOf("Uke 1") > -1) {
                            //Rule1 - Self Evalution
                            if ($scope.participantsModel.length == 1) {
                                //Rule1 - Self Evalution
                                if ($scope.participantsModel[0] == -1) {
                                    $scope.filteredResult.showCompareGauge = false;
                                    $scope.filteredResult.showCompareKpi = false;
                                } else {

                                    if ((!mainEvaluatorsModel.length > 0)) {
                                        $scope.filteredResult.showGauge = true;
                                        $scope.filteredResult.showGraph = true;
                                        $scope.filteredResult.showKpiBar = true;
                                        if ($scope.selectedStep.id == softProfileTypesEnum.finalProfile.id) {
                                            $scope.filteredResult.showKpiBar = true
                                            // as per 25 January Bug.pptx;
                                        }
                                        if ($scope.selectedStep.id == softProfileTypesEnum.initialKPI.id || $scope.selectedStep.id == softProfileTypesEnum.finalKpi.id) {
                                            $scope.filteredResult.showKpiBar = true;
                                        }
                                    } else if (mainEvaluatorsModel.length > 0) {
                                        //Rule2 - Me and MYBoss
                                        if ($scope.selectedStep.id == softProfileTypesEnum.startProfile.id || $scope.selectedStep.id == softProfileTypesEnum.finalProfile.id) {
                                            $scope.filteredResult.showGraph = true;
                                            $scope.filteredResult.showGauge = true;
                                            $scope.filteredResult.showKpiBar = false;
                                        } else if ($scope.selectedStep.id == softProfileTypesEnum.initialKPI.id) {
                                            $scope.filteredResult.showGauge = true;
                                            $scope.filteredResult.showGraph = true;
                                            $scope.filteredResult.showKpiBar = true;
                                        } else if ($scope.selectedStep.id == softProfileTypesEnum.finalKpi.id) {
                                            $scope.filteredResult.showGauge = true;
                                            $scope.filteredResult.showGraph = true;
                                            $scope.filteredResult.showKpiBar = false;
                                        }
                                    }
                                    // Rule 4 - ME and Compare to
                                    if ($scope.participantsModel.length == 1) {
                                        if ($scope.participantsModel[0] == -1) {
                                            $scope.filteredResult.showCompareGauge = false;
                                            $scope.filteredResult.showCompareKpi = false;
                                        } else if ($scope.selectedStep.id == softProfileTypesEnum.finalKpi.id) {
                                            if ($scope.selectedCompareStep) {
                                                if ($scope.selectedCompareStep.id == softProfileTypesEnum.finalKpi.id) {
                                                    $scope.filteredResult.showCompareKpi = false;
                                                    $scope.filteredResult.showCompareGauge = false;
                                                }
                                            }
                                        } else {
                                            if (!(evaluatorsModel.length > 0)) {
                                                $scope.filteredResult.showCompareGauge = false;
                                                $scope.filteredResult.showCompareKpi = false;
                                                if ($scope.selectedCompareStep) {
                                                    if ($scope.selectedCompareStep.id == softProfileTypesEnum.initialKPI.id || $scope.selectedCompareStep.id == softProfileTypesEnum.finalKpi.id) {
                                                        $scope.filteredResult.showCompareKpi = true;
                                                        $scope.filteredResult.showCompareGauge = true;
                                                    }
                                                }
                                            } else if (evaluatorsModel.length > 0) {
                                                $scope.filteredResult.showCompareGauge = true;
                                                $scope.filteredResult.showCompareKpi = false;
                                            }
                                        }
                                    } else if ($scope.participantsModel.length > 1) {
                                        $scope.filteredResult.showGauge = true;
                                        $scope.filteredResult.showGraph = true;
                                        $scope.filteredResult.showKpiBar = false;

                                        $scope.filteredResult.showCompareGauge = true;
                                        $scope.filteredResult.showCompareKpi = false;
                                    } else {
                                        $scope.filteredResult.showCompareGauge = false;
                                        $scope.filteredResult.showCompareKpi = false;
                                    }
                                }
                            } else if ($scope.participantsModel.length > 1) {

                                $scope.filteredResult.showGraph = true;
                                $scope.filteredResult.showGauge = true;
                                $scope.filteredResult.showKpiBar = false;

                                // Rule 4 - ME and Compare to
                                if ($scope.participantsModel.length == 1) {
                                    if (!(mainEvaluatorsModel.length > 0)) {

                                        $scope.filteredResult.showCompareGauge = false;
                                        $scope.filteredResult.showCompareKpi = false;

                                        if ($scope.selectedStep.id == softProfileTypesEnum.initialKPI.id || $scope.selectedStep.id == softProfileTypesEnum.finalKpi.id) {
                                            $scope.filteredResult.showKpiBar = true;
                                            $scope.filteredResult.showCompareKpi = true;
                                            $scope.filteredResult.showCompareGauge = true;
                                        }

                                    }

                                } else if ($scope.participantsModel.length > 1) {
                                    $scope.filteredResult.showGauge = true;
                                    $scope.filteredResult.showGraph = true;
                                    $scope.filteredResult.showKpiBar = false;

                                    $scope.filteredResult.showCompareGauge = true;
                                    $scope.filteredResult.showCompareKpi = false;
                                } else {
                                    $scope.filteredResult.showCompareGauge = false;
                                    $scope.filteredResult.showCompareKpi = false;
                                }
                            } else {
                                $scope.filteredResult.showGraph = false;
                                $scope.filteredResult.showKpiBar = false;
                                $scope.filteredResult.showGauge = false;

                            }
                        } else {
                            if ($scope.participantsModel.length == 1) {
                                if (!($scope.participantsModel.length > 0)) {
                                    if (!(mainEvaluatorsModel.length > 0)) {

                                        if ($scope.selectedStep.id == softProfileTypesEnum.initialKPIScores.id) {
                                            $scope.filteredResult.showGraph = true;
                                            $scope.filteredResult.showKpiBar = false;
                                            $scope.filteredResult.showGauge = true;

                                            $scope.filteredResult.showCompareGauge = false;
                                            $scope.filteredResult.showCompareKpi = false;
                                        } else if ($scope.selectedStep.id == softProfileTypesEnum.finalKPIResults.id) {
                                            $scope.filteredResult.showGraph = true;
                                            $scope.filteredResult.showKpiBar = true;
                                            $scope.filteredResult.showGauge = true;
                                            $scope.filteredResult.showCompareGauge = false;
                                            $scope.filteredResult.showCompareKpi = false;
                                        }
                                    } else if (mainEvaluatorsModel.length > 0) {
                                        $scope.filteredResult.showGraph = true;
                                        $scope.filteredResult.showKpiBar = true;
                                        $scope.filteredResult.showGauge = true;
                                        $scope.filteredResult.showCompareGauge = false;
                                        $scope.filteredResult.showCompareKpi = false;

                                    }
                                } else {
                                    if ($scope.participantsModel.length == 1) {
                                        if ($scope.participantsModel[0] == -1) {
                                            $scope.filteredResult.showGauge = true;
                                            $scope.filteredResult.showGraph = true;
                                            $scope.filteredResult.showKpiBar = true;
                                            $scope.filteredResult.showCompareGauge = false;
                                            $scope.filteredResult.showCompareKpi = false;
                                        }
                                        else {
                                            if (!(mainEvaluatorsModel.length > 0)) {
                                                $scope.filteredResult.showGauge = true;
                                                $scope.filteredResult.showGraph = true;
                                                $scope.filteredResult.showKpiBar = false;

                                                $scope.filteredResult.showCompareGauge = false;
                                                $scope.filteredResult.showCompareKpi = false;

                                                if ($scope.selectedStep.id == softProfileTypesEnum.initialKPIScores.id) {
                                                    $scope.filteredResult.showKpiBar = false;
                                                    $scope.filteredResult.showCompareKpi = true;
                                                    $scope.filteredResult.showCompareGauge = true;
                                                }

                                                if ($scope.selectedStep.id == softProfileTypesEnum.finalKPIResults.id) {
                                                    $scope.filteredResult.showKpiBar = false;
                                                    $scope.filteredResult.showCompareKpi = true;
                                                    $scope.filteredResult.showCompareGauge = true;
                                                }

                                            } else if (mainEvaluatorsModel.length > 0) {

                                                $scope.filteredResult.showGauge = true;
                                                $scope.filteredResult.showGraph = true;
                                                $scope.filteredResult.showKpiBar = false;

                                                $scope.filteredResult.showCompareGauge = true;
                                                $scope.filteredResult.showCompareKpi = false;

                                                if ($scope.selectedStep.id == softProfileTypesEnum.initialKPIScores.id) {
                                                    $scope.filteredResult.showKpiBar = true;
                                                    $scope.filteredResult.showCompareKpi = true;
                                                    $scope.filteredResult.showCompareGauge = true;
                                                } else if ($scope.selectedStep.id == softProfileTypesEnum.finalKPIResults.id) {
                                                    $scope.filteredResult.showKpiBar = true;
                                                    $scope.filteredResult.showCompareKpi = true;
                                                    $scope.filteredResult.showCompareGauge = true;

                                                }
                                            }
                                        }
                                    } else if ($scope.participantsModel.length > 1) {
                                        $scope.filteredResult.showGauge = true;
                                        $scope.filteredResult.showGraph = true;
                                        $scope.filteredResult.showKpiBar = false;

                                        $scope.filteredResult.showCompareGauge = true;
                                        $scope.filteredResult.showCompareKpi = false;
                                    } else {
                                        $scope.filteredResult.showCompareGauge = false;
                                        $scope.filteredResult.showCompareKpi = false;
                                    }
                                }
                            }
                            else if ($scope.participantsModel.length > 1) {

                                $scope.filteredResult.showGraph = true;
                                $scope.filteredResult.showKpiBar = false;
                                $scope.filteredResult.showGauge = true;
                                $scope.filteredResult.showCompareGauge = true;
                                $scope.filteredResult.showCompareKpi = false;
                            } else {

                                $scope.filteredResult.showGraph = false;
                                $scope.filteredResult.showKpiBar = false;
                                $scope.filteredResult.showGauge = false;
                                $scope.filteredResult.showCompareGauge = false;
                                $scope.filteredResult.showCompareKpi = false;
                            }
                        }

                        $scope.filteredResult.compareReportData = null;

                        if (!data) {
                            data = {};
                        }

                        data.isCompare = false;

                        data.label = "";
                        var profileTypeName = "";
                        data.profileTypeName = getLabelTextFromOptions(profileTypeName, $scope.profileSteps, $scope.selectedStep.id);

                        data.label = authService.authentication.user.firstName + " " + authService.authentication.user.lastName;

                        if (data.evaluatorsProfileScorecards && data.evaluatorsProfileScorecards.length > 0) {
                            angular.forEach(data.evaluatorsProfileScorecards, function (evaluatorProfileScorecard) {
                                var label = "";
                                angular.forEach(evaluatorProfileScorecard.participantsId, function (sourceId) {
                                    angular.forEach(mainEvaluatorsModel, function (option) {
                                        if (option.id === sourceId) {
                                            label += " " + option.label;
                                        }
                                    });
                                });
                                evaluatorProfileScorecard.label = label;
                            });
                        }

                        data.isShowWeakKpi = data.weakAreas != null ? true : false;
                        data.isShowStrongKpi = data.strongAreas != null ? true : false;

                        data.isShowBenchmark = $scope.isShowBenchmark;
                        $scope.filteredResult.reportData = data;
                        if ($scope.isShowBenchmark) {
                            angular.forEach(data.performanceGroups, function (pg, pgIndex) {
                                angular.forEach(pg.skills, function (pgs, pgsIndex) {
                                    data.performanceGroups[pgIndex].skills[pgsIndex].bScore = data.performanceGroups[pgIndex].skills[pgsIndex].benchmark;
                                });
                            });
                        }

                        //data.isShowGoal = $scope.filter.isShowGoal;
                        data.isShowGoal = false;
                        $scope.filteredResult.reportData = data;

                        if ($scope.selectedCompareStage) {

                            if ($scope.compareParticipantId == -2) {
                                $scope.compareParticipantId = $scope.selectedProfileparticipant.id;
                            }
                            $scope.participantsModel = [$scope.selectedProfileparticipant.id];
                            progressBar.startProgress();
                            userDashboardManager.getDashboardData($scope.selectedProfile.id, $scope.isShowBenchmark, $scope.participantsModel, evaluatorsModel, $scope.selectedCompareStage.id, $scope.selectedCompareStep.id, null, $scope.selectedCompareStage.stageGroupId).then(function (compareData) {
                                progressBar.stopProgress();
                                var compareReportData = angular.copy($scope.filteredResult.reportData);

                                var cProfileTypeName = "";
                                compareReportData.cProfileTypeName = getLabelTextFromOptions(cProfileTypeName, $scope.profileSteps, $scope.selectedCompareStep.id);

                                compareReportData.cLabel = "";
                                compareReportData.cLabel = authService.authentication.user.firstName + " " + authService.authentication.user.lastName;

                                compareReportData.cAverageScore = compareData.averageScore;
                                compareReportData.cStrongAverageScore = compareData.strongAverageScore;
                                compareReportData.cWeakAverageScore = compareData.weakAverageScore;

                                angular.forEach(compareReportData.performanceGroups, function (pg, pgIndex) {
                                    compareReportData.performanceGroups[pgIndex].cScore = compareData.performanceGroups[pgIndex].score;
                                    //compareReportData.performanceGroups[pgIndex].cGoal = compareData.performanceGroups[pgIndex].goal;
                                    angular.forEach(pg.skills, function (pgs, pgsIndex) {
                                        compareReportData.performanceGroups[pgIndex].skills[pgsIndex].cScore = compareData.performanceGroups[pgIndex].skills[pgsIndex].score;
                                        compareReportData.performanceGroups[pgIndex].skills[pgsIndex].cComment = compareData.performanceGroups[pgIndex].skills[pgsIndex].comment;
                                        compareReportData.performanceGroups[pgIndex].skills[pgsIndex].cGoal = compareData.performanceGroups[pgIndex].skills[pgsIndex].goal;
                                    });
                                });

                                angular.forEach(compareReportData.strongAreas, function (item, index) {
                                    var compareDataStrong = 0;
                                    compareReportData.cStrongAreas = [];
                                    if (compareData.strongAreas)
                                        angular.forEach(compareData.strongAreas, function (sa) {
                                            compareReportData.cStrongAreas.push(sa);
                                            if (item.id == sa.id && sa.score) {
                                                compareDataStrong = sa.score;
                                                return;
                                            } else {
                                            }
                                        });

                                    compareReportData.strongAreas[index].cScore = compareDataStrong;
                                });

                                angular.forEach(compareReportData.weakAreas, function (item, index) {
                                    var compareDataWeak = 0;
                                    compareReportData.cWeakAreas = [];
                                    if (compareData.weakAreas)
                                        angular.forEach(compareData.weakAreas, function (sa) {
                                            compareReportData.cWeakAreas.push(sa);
                                            if (item.id == sa.id && sa.score) {
                                                compareDataWeak = sa.score;
                                                return;
                                            }
                                        });

                                    compareReportData.weakAreas[index].cScore = compareDataWeak;
                                });

                                compareReportData.isCompare = true;
                                if (compareData.evaluatorsProfileScorecards && compareData.evaluatorsProfileScorecards.length > 0) {
                                    angular.forEach(compareData.evaluatorsProfileScorecards, function (evaluatorProfileScorecard) {
                                        var label = "";
                                        angular.forEach(evaluatorProfileScorecard.participantsId, function (sourceId) {
                                            angular.forEach(evaluatorsModel, function (option) {
                                                if (option.id === sourceId) {
                                                    label += " " + option.label;
                                                }
                                            });
                                        });
                                        evaluatorProfileScorecard.label = label;
                                    });
                                }

                                compareReportData.cEvaluatorsProfileScorecards = compareData.evaluatorsProfileScorecards;
                                compareReportData.cExtraProfileScorecards = compareData.extraProfileScorecards;
                                compareReportData.isShowCompareGoal = $scope.isShowCompareGoal;

                                compareReportData.cParticipantIds = compareData.participantsId;
                                compareReportData.mainProfileStepId = $scope.selectedStep.id;
                                compareReportData.profileStepId = $scope.selectedCompareStep.id;
                                compareReportData.mainStageId = $scope.selectedStage.id;
                                compareReportData.mainStageName = $scope.selectedStage.name;
                                compareReportData.cProfileTypeId = $scope.selectedCompareStep.id;
                                compareReportData.cStageId = $scope.selectedCompareStage.id;
                                compareReportData.stageName = $scope.selectedCompareStage.name;
                                compareReportData.evolutionStageId = 0;
                                compareReportData.mainEvolutionStageId = 0;
                                $scope.filteredResult.reportData = compareReportData;
                                setFilteredDataToReport();
                            });
                        } else {
                            setFilteredDataToReport();
                        }
                    });
                } else {
                    //$scope.isShowBenchmark = true;
                    $scope.participantsModel = [$scope.selectedProfileparticipant.id];
                    progressBar.startProgress();
                    userDashboardManager.getKTProfileAllStagesResult($scope.selectedProfile.id, $scope.participantsModel, $scope.selectedStep.id == $scope.ktProfileTypes.start.id).then(function (stagesResult) {
                        progressBar.stopProgress();
                        $scope.filteredResult.ktStagesResults = stagesResult;
                        progressBar.startProgress();
                        userDashboardManager.getKTDashboardData($scope.participantsModel, $scope.selectedProfile.id, $scope.selectedStage.id, $scope.selectedStep.id == $scope.ktProfileTypes.start.id).then(function (data) {
                            progressBar.stopProgress();
                            $scope.data = data;

                            if ($scope.isShowBenchmark) {
                                userDashboardManager.getKTAllStagesBenchmarks($scope.selectedProfile.id).then(function (benchmarks) {
                                    $scope.benchmarksStages = benchmarks;
                                    userDashboardManager.getKTBenchmark($scope.selectedProfile.id, $scope.selectedStage.id).then(function (benchmark) {
                                        $scope.filteredResult.reportData = $scope.data;
                                        $scope.filteredResult.reportData.benchmark = benchmark;
                                        $scope.filteredResult.reportData.benchmarksStages = $scope.benchmarksStages;
                                        setKTFilteredDataToReport();
                                        $scope.filteredResult.reportData.isShowBenchmark = $scope.isShowBenchmark;
                                        $scope.filteredResult.isShowReport = true;
                                    });
                                });
                            } else {
                                $scope.filteredResult.reportData = $scope.data;
                                setKTFilteredDataToReport();
                                $scope.filteredResult.isShowReport = true;
                            }

                        });
                    });
                }
            };
            $scope.filteredResult = {
                reportData: null
            }
            var setFilteredDataToReport = function () {
                $scope.filteredResult.reportData.participantsId = $scope.selectedProfileparticipant;
                $scope.filteredResult.reportData.projectsModel = [];
                $scope.filteredResult.reportData.evaluatorsProfileScorecards = null;
                $scope.filteredResult.reportData.cParticipantIds = $scope.selectedProfileparticipant;
                $scope.filteredResult.reportData.cEvaluatorsProfileScorecards = null;
                $scope.filteredResult.reportData.mainStageId = $scope.selectedStage.id;
                $scope.filteredResult.reportData.mainProfileStepId = $scope.selectedStep.id;
                $scope.filteredResult.reportData.cStageId = $scope.selectedCompareStage ? $scope.selectedCompareStage.id : null;
                $scope.filteredResult.reportData.cProfileTypeId = $scope.selectedCompareStep ? $scope.selectedCompareStep.id : null;
                $scope.filteredResult.reportData.mainParticipantsRaw = authService.authentication.user.firstName + " " + authService.authentication.user.lastName;
                $scope.filteredResult.reportData.participantsRaw = authService.authentication.user.firstName + " " + authService.authentication.user.lastName;
                $scope.filteredResult.reportData.mainEvolutionStageId = null;
                $scope.filteredResult.reportData.evolutionStageId = null;
                $scope.filteredResult.reportData.isShowBenchmark = $scope.isShowBenchmark;

                $scope.filteredResult.reportData.mainParticipants = [$scope.selectedProfileparticipant];
                $scope.filteredResult.reportData.participants = [$scope.selectedProfileparticipant];
                $scope.filteredResult.reportData.profileStageGroupId = $scope.selectedStage.stageGroupId;

            }
            var setKTFilteredDataToReport = function () {
                $scope.filteredResult.reportData.participantsId = [$scope.selectedProfileparticipant];
                $scope.filteredResult.reportData.projectsModel = [];
                $scope.filteredResult.reportData.evaluatorsProfileScorecards = null;
                $scope.filteredResult.reportData.cParticipantIds = [$scope.selectedProfileparticipant];
                $scope.filteredResult.reportData.cEvaluatorsProfileScorecards = null;
                $scope.filteredResult.reportData.mainStageId = $scope.selectedStage.id;
                $scope.filteredResult.reportData.mainProfileStepId = $scope.selectedStep.id;
                $scope.filteredResult.reportData.cStageId = $scope.selectedCompareStage ? $scope.selectedCompareStage.id : null;
                $scope.filteredResult.reportData.cProfileTypeId = $scope.selectedCompareStep ? $scope.selectedCompareStep.id : null;
                $scope.filteredResult.reportData.mainParticipantsRaw = authService.authentication.user.firstName + " " + authService.authentication.user.lastName;
                $scope.filteredResult.reportData.participantsRaw = authService.authentication.user.firstName + " " + authService.authentication.user.lastName;
                $scope.filteredResult.reportData.mainEvolutionStageId = null;
                $scope.filteredResult.reportData.evolutionStageId = null;
                $scope.filteredResult.reportData.isShowBenchmark = $scope.isShowBenchmark;

                $scope.filteredResult.reportData.mainParticipants = [$scope.selectedProfileparticipant];
                $scope.filteredResult.reportData.participants = [$scope.selectedProfileparticipant];
                $scope.filteredResult.reportData.profileStageGroupId = $scope.selectedStage.stageGroupId;

                ///

                //////$scope.filteredResult.reportData.participantsId = [$scope.selectedProfileparticipant];
                //////$scope.filteredResult.reportData.evaluatorsProfileScorecards = null;
                //////$scope.filteredResult.reportData.cParticipantIds = [];
                //////$scope.filteredResult.reportData.cEvaluatorsProfileScorecards = [];
                //////$scope.filteredResult.reportData.mainStageId = $scope.selectedStages.length > 0 ? $scope.selectedStages[0] : null;
                //////$scope.filteredResult.reportData.mainProfileStepId = $scope.selectedStep.id;
                //////$scope.filteredResult.reportData.cStageId = $scope.selectedStages.length > 1 ? $scope.selectedStages[1] : null;
                //////$scope.filteredResult.reportData.cProfileTypeId = null;
                //////$scope.filteredResult.reportData.mainParticipantsRaw = authService.authentication.user.firstName + " " + authService.authentication.user.lastName;
                //////$scope.filteredResult.reportData.participantsRaw = null;
                //////$scope.filteredResult.reportData.mainEvolutionStageId = null;
                //////$scope.filteredResult.reportData.evolutionStageId = null;
                //////if ($scope.selectedProfile.profileTypeId == profilesTypesEnum.soft) {
                //////    $scope.filteredResult.reportData.isShowBenchmark = true;
                //////}
                //////else {
                //////    $scope.filteredResult.reportData.isShowBenchmark = false;
                //////}

                //////$scope.filteredResult.reportData.mainParticipants = null;
                //////$scope.filteredResult.reportData.participants = null;
                //var linkFn = $compile($("#dashboardData"));
                //var content = linkFn($scope);
            }
            $rootScope.$on('$stateChangeStart', function (event, toState, toParams) {
                if (toState.name == 'home') {
                    todoManager.getTodosById().then(function (data) {
                        $scope.taskTodos = [];

                        var start = moment().startOf('day');
                        // set to 12:00 am today
                        var end = moment().endOf('day');
                        var today = new Date();
                        today = today.setHours(0, 0, 0, 0);

                        angular.forEach(data, function (item, index) {
                            item.start = moment(kendo.parseDate(item.startDate)).toDate();
                            item.taskId = item.id;
                            item.end = moment(kendo.parseDate(item.dueDate)).toDate();

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
                                projectId: item.projectId
                            });

                            var occurrences = event.expand(kendo.parseDate(item.startDate), kendo.parseDate(item.dueDate));
                            _.each(occurrences, function (todoItem) {
                                var todoItemStartDate = _.clone(todoItem.start);
                                //if (newTodo.start.getTime() >= start._d.getTime() && newTodo.start.getTime() <= end._d.getTime()) {
                                if (kendo.parseDate(todoItemStartDate).setHours(0, 0, 0, 0) == today) {
                                    var x = {
                                        title: item.title,
                                        assignedToId: item.assignedToId,
                                        categoryId: item.categoryId,
                                        description: item.description,
                                        startDate: moment(kendo.parseDate(todoItem.start)).format('L LT'),
                                        dueDate: moment(kendo.parseDate(todoItem.start)).endOf('day').format('L LT'),
                                        id: item.id,
                                        isCompleted: false,
                                        frequency: item.recurrenceRule,
                                        taskId: item.id,
                                        taskActualStartDate: moment(kendo.parseDate(item.startDate)).format('L LT'),
                                        taskActualDueDate: moment(kendo.parseDate(item.dueDate)).format('L LT'),
                                        taskCategoryListItem: item.taskCategoryListItem,
                                        projectId: item.projectId
                                    }
                                    $scope.taskTodos.push(x);
                                }
                            })
                        });
                        var dataSource = getDataSource();
                        if (($("#taskCalendar").length > 0) && ($("#taskCalendar").data("kendoScheduler"))) {
                            $("#taskCalendar").data("kendoScheduler").setDataSource(dataSource);
                        }
                    });

                    todosManager.getAllCategories().then(function (data) {
                        angular.forEach(data, function (item, value) {
                            item.value = item.id;
                        });

                        $("#taskCalendar").empty();
                        $("#taskCalendar").kendoScheduler({
                            date: moment().toDate(),
                            views: ["day", {
                                type: "workWeek",
                                selected: true
                            }, "week", "month",],
                            height: 600,
                            timezone: "Etc/UTC",
                            resources: [{
                                field: "categoryId",
                                dataSource: data
                            }],
                            editable: false,
                            eventTemplate: $("#event-template").html(),
                            allDayEventTemplate: $("#event-template").html(),
                        });
                    });

                }
            });
            var authData = localStorageService.get('authorizationData');
            $scope.currentUser = authData.user;
            $scope.userCustomers = [];
            $scope.userCustomersEvents = {};
            $scope.smartButtonSettings = {};
            $scope.custmerGridOptions = {};
            $scope.customers = [];
            function getCustomerMultiSelectOptions(data) {
                var options = [];
                _.forEach(data, function (item, index) {
                    if (item.isSelfEvaluation) {
                        options.push({
                            id: item.id,
                            label: item.name
                        });
                    } else {
                        options.push({
                            id: item.id,
                            label: item.name
                        });
                    }
                });
                return options;
            }
            $scope.getActvityProfiles = function () {
                var result = [];
                _.each($scope.prospectingGoalActivityInfoes, function (data) {
                    result.push({
                        id: data.profileId,
                        name: data.profileName
                    });
                });
                $scope.prospectingGoalActivityProfiles = _.uniq(result, function (x) {
                    return x.id;
                });
                $scope.prospectingGoalActivityProfiles.unshift({
                    id: null,
                    name: "All"
                })
            }
            $scope.salesActivityData = null
            function getProsepectingActvitiyPerformnaceData(profileid, stageid, participantId) {
                userDashboardManager.getProsepectingActvitiyPerformnaceData($scope.selectedProfile.id, stageid, participantId).then(function (data) {
                    if (data) {
                        $scope.salesActivityData = data;
                        setTimeout(function () {
                            drawGauge();
                        }, 100)
                        //$scope.CallsvsTalksGauge();
                    }
                });
            }
            function drawGauge() {
                if ($scope.salesActivityData) {
                    _.each($scope.salesActivityData.prospectingSkillGoalResults, function (dataItem) {
                        var calculateResult = 0;
                        if (dataItem.count > 0) {
                            calculateResult = parseInt((dataItem.count / dataItem.goal) * 100);
                        }
                        if (calculateResult > 100) {
                            $scope.scaleRanges = _.clone($scope.selectedProfileScaleRanges);
                            $scope.scaleRanges.push({
                                min: $scope.selectedProfileScaleRanges[0].min,
                                max: $scope.selectedProfileScaleRanges[$scope.selectedProfileScaleRanges.length - 1].max,
                                from: 100,
                                to: calculateResult,
                                color: "#ff6e19",
                                minPercentage: 0,
                                maxPercentage: calculateResult,
                            });
                            $("#home_saelsactivity_" + dataItem.skillName + "_gauge").kendoRadialGauge({
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

                        } else {
                            $("#home_saelsactivity_" + dataItem.skillName + "_gauge").kendoRadialGauge({
                                pointer: [{
                                    value: calculateResult,
                                    color: "#3598dc",
                                }],
                                scale: {
                                    min: $scope.selectedProfileScaleRanges[0].minPercentage,
                                    minorUnit: 5,
                                    startAngle: -30,
                                    endAngle: 210,
                                    max: calculateResult > 100 ? calculateResult : 100,
                                    ranges: $scope.selectedProfileScaleRanges,
                                }
                            });
                        }
                    })

                    //default selection
                    var lastSkill = _.last($scope.salesActivityData.prospectingSkillGoalResults);
                    if (lastSkill) {
                        $scope.selectMainFilterGauge(lastSkill.skillId);

                        var secondLastSKill = null;
                        var filteredSkills = _.filter($scope.salesActivityData.prospectingSkillGoalResults, function (dataItem) {
                            return dataItem.skillId != lastSkill.skillId;
                        });
                        secondLastSKill = _.last(filteredSkills);
                        if (secondLastSKill) {
                            $scope.selectCompareFilterGauge(secondLastSKill.skillId);
                        }
                    }
                }
            }
            $scope.selectMainFilterGauge = function (skillId) {
                $scope.mainFilterGaugeText = null;
                $scope.mainFilterGaugeData = null;
                if ($scope.salesActivityData) {
                    var selectedSkill = _.find($scope.salesActivityData.prospectingSkillGoalResults, function (item) {
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
                if ($scope.salesActivityData) {
                    var selectedSkill = _.find($scope.salesActivityData.prospectingSkillGoalResults, function (item) {
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
                    } else {
                        if (skill.skillId < $scope.mainFilterGaugeData.skillId) {
                            return true;
                        }
                    }
                } else {
                    if (skill.seqNo) {
                        if (skill.seqNo < 1) {
                            return true;
                        }
                    }
                }
            }
            function drawPerformanceGauge() {
                $scope.performanceGagueInfo = null;
                $scope.performanceGagueInfo = {
                    lable1: $scope.mainFilterGaugeText,
                    lable2: $scope.compareFilterGaugeText,
                    value1: $scope.mainFilterGaugeData.count,
                    value2: $scope.compareFilterGaugeData.count,
                    avg: parseInt($scope.mainFilterGaugeData.count / $scope.compareFilterGaugeData.count * 100),
                };
                var maxRange = 100;
                var avg = parseInt($scope.mainFilterGaugeData.count / $scope.compareFilterGaugeData.count * 100);
                if (avg > 100) {
                    maxRange = avg;
                    $scope.performanceScaleRanges = _.clone($scope.selectedProfileScaleRanges);
                    $scope.performanceScaleRanges.push({
                        min: $scope.selectedProfileScaleRanges[0].min,
                        max: maxRange,
                        from: 100,
                        to: maxRange,
                        color: "#ff6e19",
                        minPercentage: 0,
                        maxPercentage: maxRange,
                    });

                    $("#home_saelsactivity_performance_gauge").kendoRadialGauge({
                        pointer: [{
                            value: avg,
                            color: "#ff6e19",
                        }],
                        scale: {
                            min: $scope.performanceScaleRanges[0].minPercentage,
                            minorUnit: 5,
                            startAngle: -30,
                            endAngle: 210,
                            max: maxRange,
                            ranges: $scope.performanceScaleRanges,
                        }
                    });

                } else {
                    $("#home_saelsactivity_performance_gauge").kendoRadialGauge({
                        pointer: [{
                            value: avg,
                            color: "#3598dc",
                        },],
                        scale: {
                            min: $scope.selectedProfileScaleRanges[0].minPercentage,
                            minorUnit: 5,
                            startAngle: -30,
                            endAngle: 210,
                            max: maxRange,
                            ranges: $scope.selectedProfileScaleRanges,
                        }
                    });
                }
            }

            //Time Summary
            $scope.gaugeColors = {
                main: "#32c5d2",
                compare: "#c49f47",
                filter: "#3598dc ",
            }
            $scope.isProgressView = false;
            $scope.summaryFor = "Profile";
            $scope.projectProfiles = [];
            $scope.strongKPIs = [];
            $scope.weakKPIs = [];
            $scope.selectedFromMonth = null;
            $scope.startOfMonth = null;
            $scope.endOfMonth = null;
            $scope.trainingMonths = [];
            var startDay = moment();
            $scope.dayStartDate = startDay.startOf("day")._d;
            var endDay = moment();
            $scope.dayEndDate = endDay.endOf('day')._d;
            var startWeek = moment();
            $scope.weekStartDate = startWeek.startOf("week")._d;
            var endWeek = moment();
            $scope.weekEndDate = endWeek.endOf('week')._d;
            $scope.isStartStageSelected = false;
            $scope.isAllStageSelected = false;
            $scope.progressViewTypeEnum = {
                StageScoreProgress: 2,
                OverallScoreProgress: 3,
                StageDifference: 4,
            };
            $scope.progressViewTypeOptions = [{
                id: 2,
                name: $translate.instant('COMMON_STAGE') + " " + $translate.instant('COMMON_SCORE')
            }, {
                id: 3,
                name: "Overall " + $translate.instant('COMMON_SCORE')
            }, {
                id: 4,
                name: $translate.instant('COMMON_STAGE') + " Difference"
            },];
            $scope.timeManagementViewTypeEnum = {
                Performance: 1,
                AggregatedPerformance: 2,
            };
            $scope.timeManagementViewTypeOptions = [{
                id: 1,
                name: $translate.instant('Performance')
            }, {
                id: 2,
                name: "Aggregated Performance"
            },];
            $scope.selectedProgressViewType = _.find($scope.progressViewTypeOptions, function (item) {
                return item.id == $scope.progressViewTypeEnum.StageScoreProgress;
            });
            $scope.selectProgressViewType = function (value) {
                if (value > 0) {
                    $scope.selectedProgressViewType = _.find($scope.progressViewTypeOptions, function (item) {
                        return item.id == value;
                    });
                    if ($scope.selectedProgressViewType) {
                        if ($scope.selectedProgressViewType.id == $scope.progressViewTypeEnum.StageScoreProgress) {
                            //
                            _.each($scope.weakKPIs, function (dataItem) {
                                var pointers = [];
                                var graphId = "#home_weakkpi_" + dataItem.skillId + "_stageprogress_gauge";
                                var weakKPIScaleRanges = angular.copy($scope.selectedProjectProfileScaleRanges);
                                if ($scope.isProgressView) {
                                    pointers.push({
                                        value: dataItem.stageProgress,
                                        color: $scope.gaugeColors.main
                                    })
                                } else {
                                    graphId = "#home_weakkpi_" + dataItem.skillId + "_stageperformance_gauge";
                                    pointers.push({
                                        value: dataItem.stagePerformance,
                                        color: $scope.gaugeColors.main
                                    })
                                }
                                var compareDataItem = _.find($scope.compareWeakKPIs, function (item) {
                                    return item.skillId == dataItem.skillId;
                                });
                                if (compareDataItem) {
                                    dataItem.compareStageProgress = compareDataItem.stageProgress;
                                    dataItem.compareStagePerformance = compareDataItem.stagePerformance;
                                    if ($scope.isProgressView) {
                                        pointers.push({
                                            value: compareDataItem.stageProgress,
                                            color: $scope.gaugeColors.compare,
                                        })
                                    } else {
                                        pointers.push({
                                            value: compareDataItem.stagePerformance,
                                            color: $scope.gaugeColors.compare,
                                        })
                                    }
                                }

                                var maxPointer = _.max(pointers, function (item) {
                                    return item.value;
                                });
                                if (maxPointer.value > 100) {
                                    weakKPIScaleRanges.push({
                                        min: weakKPIScaleRanges[0].min,
                                        max: weakKPIScaleRanges[weakKPIScaleRanges.length - 1].max,
                                        from: 100,
                                        to: maxPointer.value,
                                        color: "#ff6e19",
                                        minPercentage: 0,
                                        maxPercentage: maxPointer.value,
                                    });
                                    $(graphId).kendoRadialGauge({
                                        pointer: pointers,
                                        scale: {
                                            min: 0,
                                            minorUnit: 10,
                                            startAngle: -30,
                                            endAngle: 210,
                                            max: maxPointer.value,
                                            ranges: weakKPIScaleRanges,
                                        }
                                    });
                                } else {
                                    var minPointer = _.min(pointers, function (item) {
                                        return item.value;
                                    });
                                    if (minPointer.value < weakKPIScaleRanges[0].min) {
                                        weakKPIScaleRanges[0].minPercentage = minPointer.value;
                                        weakKPIScaleRanges[0].min = minPointer.value;
                                        weakKPIScaleRanges[0].from = minPointer.value;
                                    }
                                    $(graphId).kendoRadialGauge({
                                        pointer: pointers,
                                        scale: {
                                            min: weakKPIScaleRanges[0].minPercentage,
                                            minorUnit: 10,
                                            startAngle: -30,
                                            endAngle: 210,
                                            max: maxPointer.value > 100 ? maxPointer.value : 100,
                                            ranges: weakKPIScaleRanges,
                                        }
                                    });
                                }
                            })
                            _.each($scope.strongKPIs, function (dataItem) {
                                var pointers = [];
                                var graphId = "#home_strongkpi_" + dataItem.skillId + "_stageprogress_gauge";
                                var strongKPIScaleRanges = angular.copy($scope.selectedProjectProfileScaleRanges);
                                if ($scope.isProgressView) {
                                    pointers.push({
                                        value: dataItem.stageProgress,
                                        color: $scope.gaugeColors.main
                                    })
                                } else {
                                    graphId = "#home_strongkpi_" + dataItem.skillId + "_stageperformance_gauge";
                                    pointers.push({
                                        value: dataItem.stagePerformance,
                                        color: $scope.gaugeColors.main
                                    })
                                }
                                var compareDataItem = _.find($scope.compareStrongKPIs, function (item) {
                                    return item.skillId == dataItem.skillId;
                                });
                                if (compareDataItem) {
                                    dataItem.compareStageProgress = compareDataItem.stageProgress;
                                    dataItem.compareStageTimePerformance = compareDataItem.stageTimePerformance;
                                    dataItem.compareStagePerformance = compareDataItem.stagePerformance;
                                    if ($scope.isProgressView) {
                                        pointers.push({
                                            value: compareDataItem.stageProgress,
                                            color: $scope.gaugeColors.compare,
                                        })
                                    } else {
                                        pointers.push({
                                            value: compareDataItem.stagePerformance,
                                            color: $scope.gaugeColors.compare,
                                        })
                                    }
                                }

                                var maxPointer = _.max(pointers, function (item) {
                                    return item.value;
                                });
                                if (maxPointer.value > 100) {
                                    strongKPIScaleRanges.push({
                                        min: strongKPIScaleRanges[0].min,
                                        max: strongKPIScaleRanges[strongKPIScaleRanges.length - 1].max,
                                        from: 100,
                                        to: maxPointer.value,
                                        color: "#ff6e19",
                                        minPercentage: 0,
                                        maxPercentage: maxPointer.value,
                                    });
                                    $(graphId).kendoRadialGauge({
                                        pointer: pointers,
                                        scale: {
                                            min: 0,
                                            minorUnit: 10,
                                            startAngle: -30,
                                            endAngle: 210,
                                            max: maxPointer.value,
                                            ranges: strongKPIScaleRanges,
                                        }
                                    });
                                } else {
                                    var minPointer = _.min(pointers, function (item) {
                                        return item.value;
                                    });
                                    if (minPointer.value < strongKPIScaleRanges[0].min) {
                                        strongKPIScaleRanges[0].minPercentage = minPointer.value;
                                        strongKPIScaleRanges[0].min = minPointer.value;
                                        strongKPIScaleRanges[0].from = minPointer.value;
                                    }
                                    $(graphId).kendoRadialGauge({
                                        pointer: pointers,
                                        scale: {
                                            min: strongKPIScaleRanges[0].minPercentage,
                                            minorUnit: 10,
                                            startAngle: -30,
                                            endAngle: 210,
                                            max: maxPointer.value > 100 ? maxPointer.value : 100,
                                            ranges: strongKPIScaleRanges,
                                        }
                                    });
                                }
                            })
                            //
                            setTimeout(function () {
                                if ($scope.isProgressView) {
                                    $(".weakkpistageprogress").each(function (i, el) {
                                        if ($(el).data("kendoRadialGauge")) {
                                            $(el).data("kendoRadialGauge").redraw();
                                        }
                                    })
                                    $(".strongkpistageprogress").each(function (i, el) {
                                        if ($(el).data("kendoRadialGauge")) {
                                            $(el).data("kendoRadialGauge").redraw();
                                        }
                                    })
                                } else {
                                    $(".weakkpistageperformance").each(function (i, el) {
                                        if ($(el).data("kendoRadialGauge")) {
                                            $(el).data("kendoRadialGauge").redraw();
                                            { }
                                        }
                                    })
                                    $(".strongkpistageperformance").each(function (i, el) {
                                        if ($(el).data("kendoRadialGauge")) {
                                            $(el).data("kendoRadialGauge").redraw();
                                        }
                                    })
                                }
                            }, 50)
                        } else if ($scope.selectedProgressViewType.id == $scope.progressViewTypeEnum.OverallScoreProgress) {
                            //
                            _.each($scope.weakKPIs, function (dataItem) {
                                var pointers = [];
                                var graphId = "#home_weakkpi_" + dataItem.skillId + "_overallprogress_gauge";
                                var weakKPIScaleRanges = angular.copy($scope.selectedProjectProfileScaleRanges);
                                if ($scope.isProgressView) {
                                    pointers.push({
                                        value: dataItem.overallProgress,
                                        color: $scope.gaugeColors.main
                                    })
                                } else {
                                    graphId = "#home_weakkpi_" + dataItem.skillId + "_overallperformance_gauge";
                                    pointers.push({
                                        value: dataItem.overallPerformance,
                                        color: $scope.gaugeColors.main
                                    })
                                }
                                var compareDataItem = _.find($scope.compareWeakKPIs, function (item) {
                                    return item.skillId == dataItem.skillId;
                                });
                                if (compareDataItem) {
                                    dataItem.compareOverallProgress = compareDataItem.overallProgress;
                                    dataItem.compareOverallPerformance = compareDataItem.overallPerformance;
                                    if ($scope.isProgressView) {
                                        pointers.push({
                                            value: dataItem.compareOverallProgress,
                                            color: $scope.gaugeColors.compare,
                                        })
                                    } else {
                                        pointers.push({
                                            value: dataItem.compareOverallPerformance,
                                            color: $scope.gaugeColors.compare,
                                        })
                                    }
                                }

                                var maxPointer = _.max(pointers, function (item) {
                                    return item.value;
                                });
                                if (maxPointer.value > 100) {
                                    weakKPIScaleRanges.push({
                                        min: weakKPIScaleRanges[0].min,
                                        max: weakKPIScaleRanges[weakKPIScaleRanges.length - 1].max,
                                        from: 100,
                                        to: maxPointer.value,
                                        color: "#ff6e19",
                                        minPercentage: 0,
                                        maxPercentage: maxPointer.value,
                                    });
                                    $(graphId).kendoRadialGauge({
                                        pointer: pointers,
                                        scale: {
                                            min: 0,
                                            minorUnit: 10,
                                            startAngle: -30,
                                            endAngle: 210,
                                            max: maxPointer.value,
                                            ranges: weakKPIScaleRanges,
                                        }
                                    });
                                } else {
                                    var minPointer = _.min(pointers, function (item) {
                                        return item.value;
                                    });
                                    if (minPointer.value < weakKPIScaleRanges[0].min) {
                                        weakKPIScaleRanges[0].minPercentage = minPointer.value;
                                        weakKPIScaleRanges[0].min = minPointer.value;
                                        weakKPIScaleRanges[0].from = minPointer.value;
                                    }
                                    $(graphId).kendoRadialGauge({
                                        pointer: pointers,
                                        scale: {
                                            min: weakKPIScaleRanges[0].minPercentage,
                                            minorUnit: 10,
                                            startAngle: -30,
                                            endAngle: 210,
                                            max: maxPointer.value > 100 ? maxPointer.value : 100,
                                            ranges: weakKPIScaleRanges,
                                        }
                                    });
                                }
                            })
                            _.each($scope.strongKPIs, function (dataItem) {
                                var pointers = [];
                                var graphId = "#home_strongkpi_" + dataItem.skillId + "_overallprogress_gauge";
                                var strongKPIScaleRanges = angular.copy($scope.selectedProjectProfileScaleRanges);
                                if ($scope.isProgressView) {
                                    pointers.push({
                                        value: dataItem.overallProgress,
                                        color: $scope.gaugeColors.main
                                    })
                                } else {
                                    graphId = "#home_strongkpi_" + dataItem.skillId + "_overallperformance_gauge";
                                    pointers.push({
                                        value: dataItem.overallPerformance,
                                        color: $scope.gaugeColors.main
                                    })
                                }
                                var compareDataItem = _.find($scope.compareStrongKPIs, function (item) {
                                    return item.skillId == dataItem.skillId;
                                });
                                if (compareDataItem) {
                                    dataItem.compareOverallProgress = compareDataItem.overallProgress;
                                    dataItem.compareStageTimePerformance = compareDataItem.stageTimePerformance;

                                    if ($scope.isProgressView) {
                                        pointers.push({
                                            value: compareDataItem.overallProgress,
                                            color: $scope.gaugeColors.compare,
                                        })
                                    } else {
                                        pointers.push({
                                            value: compareDataItem.overallPerformance,
                                            color: $scope.gaugeColors.compare,
                                        })
                                    }
                                }

                                var maxPointer = _.max(pointers, function (item) {
                                    return item.value;
                                });
                                if (maxPointer.value > 100) {
                                    strongKPIScaleRanges.push({
                                        min: strongKPIScaleRanges[0].min,
                                        max: strongKPIScaleRanges[strongKPIScaleRanges.length - 1].max,
                                        from: 100,
                                        to: maxPointer.value,
                                        color: "#ff6e19",
                                        minPercentage: 0,
                                        maxPercentage: maxPointer.value,
                                    });
                                    $(graphId).kendoRadialGauge({
                                        pointer: pointers,
                                        scale: {
                                            min: 0,
                                            minorUnit: 10,
                                            startAngle: -30,
                                            endAngle: 210,
                                            max: maxPointer.value,
                                            ranges: strongKPIScaleRanges,
                                        }
                                    });
                                } else {
                                    var minPointer = _.min(pointers, function (item) {
                                        return item.value;
                                    });
                                    if (minPointer.value < strongKPIScaleRanges[0].min) {
                                        strongKPIScaleRanges[0].minPercentage = minPointer.value;
                                        strongKPIScaleRanges[0].min = minPointer.value;
                                        strongKPIScaleRanges[0].from = minPointer.value;
                                    }
                                    $(graphId).kendoRadialGauge({
                                        pointer: pointers,
                                        scale: {
                                            min: strongKPIScaleRanges[0].minPercentage,
                                            minorUnit: 10,
                                            startAngle: -30,
                                            endAngle: 210,
                                            max: maxPointer.value > 100 ? maxPointer.value : 100,
                                            ranges: strongKPIScaleRanges,
                                        }
                                    });
                                }

                            })
                            //
                            setTimeout(function () {
                                if ($scope.isProgressView) {
                                    $(".weakkpioverallprogress").each(function (i, el) {
                                        if ($(el).data("kendoRadialGauge")) {
                                            $(el).data("kendoRadialGauge").redraw();
                                        }
                                    })
                                    $(".strongkpioverallprogress").each(function (i, el) {
                                        if ($(el).data("kendoRadialGauge")) {
                                            $(el).data("kendoRadialGauge").redraw();
                                        }
                                    })
                                } else {
                                    $(".weakkpioverallperformance").each(function (i, el) {
                                        if ($(el).data("kendoRadialGauge")) {
                                            $(el).data("kendoRadialGauge").redraw();
                                        }
                                    })
                                    $(".strongkpioverallperformance").each(function (i, el) {
                                        if ($(el).data("kendoRadialGauge")) {
                                            $(el).data("kendoRadialGauge").redraw();
                                        }
                                    })
                                }
                            }, 50)
                        } else if ($scope.selectedProgressViewType.id == $scope.progressViewTypeEnum.StageDifference) {
                            {
                                var startDates = [];
                                var weakKPIs = [];
                                var strongKPIs = [];
                                $scope.trainingTimes = [];
                                if ($scope.selectedProfileStagesData) {
                                    _.forEach($scope.selectedProfileStagesData, function (stageItem) {
                                        var isAllowContinue = false;
                                        if ($scope.selectedCompareProfileStage) {
                                            if (stageItem.id >= $scope.selectedProfileStage.id && stageItem.id <= $scope.selectedCompareProfileStage.id) {
                                                isAllowContinue = true;
                                            }
                                        }
                                        if (isAllowContinue) {
                                            if (stageItem.evaluationAgreement) {
                                                _.forEach(stageItem.evaluationAgreement, function (evaluationAgreementItem) {
                                                    if (evaluationAgreementItem.question) {
                                                        var selectedMilestoneAgreementGoal = null;
                                                        if (evaluationAgreementItem.milestoneAgreementGoals) {
                                                            selectedMilestoneAgreementGoal = _.find(evaluationAgreementItem.milestoneAgreementGoals, function (milestoneAgreementGoalItem) {
                                                                return milestoneAgreementGoalItem.stageId == stageItem.id;
                                                            });
                                                        }

                                                        _.forEach(evaluationAgreementItem.question.skills, function (skillItem) {
                                                            if (evaluationAgreementItem.kpiType == 1) {
                                                                weakKPIs.push({
                                                                    skillName: skillItem.name,
                                                                    skillId: skillItem.id,
                                                                    totalPlanTime: 0,
                                                                    spentTime: 0,
                                                                    startScore: 0,
                                                                    totalAgreegatedPlanTime: 0,
                                                                    agreegatedSpentTime: 0,
                                                                    currentStageGoal: selectedMilestoneAgreementGoal ? selectedMilestoneAgreementGoal.goal : 0,
                                                                    currentStageScore: evaluationAgreementItem.finalScore,
                                                                    stageProgress: 0,
                                                                    overallProgress: 0,
                                                                    stageTimeProgress: 0,
                                                                    stagePerformance: 0,
                                                                    overallPerformance: 0,
                                                                    stageTimePerformance: 0,
                                                                    stageAgreegatedTimeProgress: 0,
                                                                    stageAgreegatedTimePerformance: 0,
                                                                    compareStageProgress: 0,
                                                                    compareOverallProgress: 0,
                                                                    compareStageTimeProgress: 0,
                                                                    compareStagePerformance: 0,
                                                                    compareOverallPerformance: 0,
                                                                    compareStageTimePerformance: 0,
                                                                    compareStageAgreegatedTimePerformance: 0,
                                                                    filteredStageTimeProgress: 0,
                                                                    filteredSpentTime: 0,
                                                                    filteredTotalPlanTime: 0
                                                                });
                                                            } else if (evaluationAgreementItem.kpiType == 2) {
                                                                strongKPIs.push({
                                                                    skillName: skillItem.name,
                                                                    skillId: skillItem.id,
                                                                    totalPlanTime: 0,
                                                                    spentTime: 0,
                                                                    startScore: 0,
                                                                    totalAgreegatedPlanTime: 0,
                                                                    agreegatedSpentTime: 0,
                                                                    currentStageGoal: selectedMilestoneAgreementGoal ? selectedMilestoneAgreementGoal.goal : 0,
                                                                    currentStageScore: evaluationAgreementItem.finalScore,
                                                                    stageProgress: 0,
                                                                    overallProgress: 0,
                                                                    stageTimeProgress: 0,
                                                                    stagePerformance: 0,
                                                                    overallPerformance: 0,
                                                                    stageTimePerformance: 0,
                                                                    stageAgreegatedTimeProgress: 0,
                                                                    stageAgreegatedTimePerformance: 0,
                                                                    compareStageProgress: 0,
                                                                    compareOverallProgress: 0,
                                                                    compareStageTimeProgress: 0,
                                                                    compareStagePerformance: 0,
                                                                    compareOverallPerformance: 0,
                                                                    compareStageTimePerformance: 0,
                                                                    compareStageAgreegatedTimePerformance: 0,
                                                                    filteredStageTimeProgress: 0,
                                                                    filteredSpentTime: 0,
                                                                    filteredTotalPlanTime: 0,
                                                                    filteredStageTimePerformance: 0,
                                                                });
                                                            }
                                                        })
                                                    }
                                                    if (evaluationAgreementItem.trainings) {
                                                        _.forEach(evaluationAgreementItem.trainings, function (trainingItem) {
                                                            if (trainingItem.id > 0) {
                                                                var event = new kendo.data.SchedulerEvent({
                                                                    id: trainingItem.id,
                                                                    description: trainingItem.additionalInfo,
                                                                    title: trainingItem.name,
                                                                    start: kendo.parseDate(trainingItem.startDate),
                                                                    //item1.start,
                                                                    isAllDay: moment(kendo.parseDate(trainingItem.startDate)).format("HHmmss") == "000000",
                                                                    end: kendo.parseDate(trainingItem.endDate),
                                                                    recurrenceRule: trainingItem.frequency,
                                                                });
                                                                var skillId = null;
                                                                if (trainingItem.skillId) {
                                                                    skillId = trainingItem.skillId;
                                                                } else if (trainingItem.skills.length > 0) {
                                                                    skillId = trainingItem.skills[0].id;
                                                                }
                                                                $scope.trainingTimes.push({
                                                                    id: trainingItem.id,
                                                                    skillId: skillId,
                                                                    totalTime: 0,
                                                                    spentTime: 0,
                                                                    filteredTotalPlanTime: 0,
                                                                    filteredSpentTime: 0
                                                                })
                                                                _.each(trainingItem.trainingFeedbacks, function (itemfeedback) {
                                                                    if (itemfeedback.evaluatorId == null) {
                                                                        var isTrainingFinished = true;
                                                                        if (itemfeedback.isParticipantPaused == true) {
                                                                            var finishedTraining = _.filter(trainingItem.trainingFeedbacks, function (feedbackItem) {
                                                                                return itemfeedback.recurrencesStartTime == feedbackItem.recurrencesStartTime && itemfeedback.recurrencesEndTime == feedbackItem.recurrencesEndTime && feedbackItem.isParticipantPaused == false;
                                                                            });
                                                                            if (finishedTraining.length > 0) {
                                                                                isTrainingFinished = true
                                                                            } else {
                                                                                isTrainingFinished = false;
                                                                            }
                                                                        }
                                                                        if (!(itemfeedback.isParticipantPaused == true && isTrainingFinished == true)) {
                                                                            if (trainingItem.userId == null) {
                                                                                $scope.trainingTimes[$scope.trainingTimes.length - 1].spentTime += itemfeedback.timeSpentMinutes;
                                                                                if (itemfeedback.recurrencesStartTime) {
                                                                                    if (kendo.parseDate(itemfeedback.recurrencesStartTime) >= $scope.dayStartDate && kendo.parseDate(itemfeedback.recurrencesStartTime) <= $scope.dayEndDate) {
                                                                                        $scope.totalProfileTrainingSpentHoursToday += (itemfeedback.timeSpentMinutes);
                                                                                    }
                                                                                    if (kendo.parseDate(itemfeedback.recurrencesStartTime) >= $scope.weekStartDate && kendo.parseDate(itemfeedback.recurrencesStartTime) <= $scope.weekEndDate) {
                                                                                        $scope.totalProfileTrainingSpentHoursWeek += itemfeedback.timeSpentMinutes;
                                                                                    }
                                                                                    if ($scope.selectedFromMonth) {
                                                                                        var startOfMonth = moment($scope.selectedFromMonth).startOf('month')._d;
                                                                                        var endOfMonth = moment($scope.selectedFromMonth).endOf('month')._d;
                                                                                        if (itemfeedback.recurrencesStartTime) {
                                                                                            if (kendo.parseDate(itemfeedback.recurrencesStartTime) >= startOfMonth && kendo.parseDate(itemfeedback.recurrencesStartTime) <= endOfMonth) {
                                                                                                $scope.totalFilteredProfileTrainingSpentHours += itemfeedback.timeSpentMinutes;
                                                                                                $scope.trainingTimes[$scope.trainingTimes.length - 1].filteredSpentTime += itemfeedback.timeSpentMinutes;
                                                                                            }
                                                                                        }
                                                                                    }
                                                                                }
                                                                                $scope.totalProfileTrainingSpentHours += itemfeedback.timeSpentMinutes;
                                                                            }

                                                                        }
                                                                    }
                                                                });
                                                                var occurrences = event.expand(kendo.parseDate(trainingItem.startDate), kendo.parseDate(trainingItem.endDate));
                                                                angular.forEach(occurrences, function (item1, index1) {
                                                                    if (trainingItem.durationMetricId == 1) {
                                                                        //Hour
                                                                        if ($scope.selectedFromMonth) {
                                                                            var startOfMonth = moment($scope.selectedFromMonth).startOf('month')._d;
                                                                            var endOfMonth = moment($scope.selectedFromMonth).endOf('month')._d;
                                                                            if (kendo.parseDate(item1.start) >= startOfMonth && kendo.parseDate(item1.start) <= endOfMonth) {
                                                                                if (trainingItem.userId == null) {
                                                                                    $scope.trainingTimes[$scope.trainingTimes.length - 1].filteredTotalPlanTime += (trainingItem.duration * 60);
                                                                                }
                                                                            }
                                                                        }
                                                                        $scope.trainingTimes[$scope.trainingTimes.length - 1].totalTime += (trainingItem.duration * 60);
                                                                        if (kendo.parseDate(item1.start) >= $scope.dayStartDate && kendo.parseDate(item1.start) <= $scope.dayEndDate) {
                                                                            if (trainingItem.userId == null) {
                                                                                $scope.trainingProfileHoursToday += (trainingItem.duration * 60);
                                                                            }

                                                                        }
                                                                        if (kendo.parseDate(item1.start) >= $scope.weekStartDate && kendo.parseDate(item1.start) <= $scope.weekEndDate) {
                                                                            if (trainingItem.userId == null) {
                                                                                $scope.trainingProfileHoursWeek += (trainingItem.duration * 60);
                                                                            }

                                                                        }
                                                                        if (trainingItem.userId == null) {
                                                                            $scope.totalProfileTrainingHours += (trainingItem.duration * 60);
                                                                            if ($scope.selectedFromMonth) {
                                                                                var startOfMonth = moment($scope.selectedFromMonth).startOf('month')._d;
                                                                                var endOfMonth = moment($scope.selectedFromMonth).endOf('month')._d;
                                                                                if (kendo.parseDate(item1.start) >= startOfMonth && kendo.parseDate(item1.start) <= endOfMonth) {
                                                                                    $scope.totalFilteredProfileTrainingHours += (trainingItem.duration * 60);
                                                                                }
                                                                            }
                                                                        }

                                                                    }
                                                                    if (trainingItem.durationMetricId == 3) {
                                                                        //Minutes
                                                                        if ($scope.selectedFromMonth) {
                                                                            var startOfMonth = moment($scope.selectedFromMonth).startOf('month')._d;
                                                                            var endOfMonth = moment($scope.selectedFromMonth).endOf('month')._d;
                                                                            if (kendo.parseDate(item1.start) >= startOfMonth && kendo.parseDate(item1.start) <= endOfMonth) {
                                                                                if (trainingItem.userId == null) {
                                                                                    $scope.trainingTimes[$scope.trainingTimes.length - 1].filteredTotalPlanTime += (trainingItem.duration);
                                                                                }
                                                                            }
                                                                        }
                                                                        $scope.trainingTimes[$scope.trainingTimes.length - 1].totalTime += (trainingItem.duration);
                                                                        if (kendo.parseDate(item1.start) >= $scope.dayStartDate && kendo.parseDate(item1.start) <= $scope.dayEndDate) {
                                                                            if (trainingItem.userId == null) {
                                                                                $scope.trainingProfileHoursToday += (trainingItem.duration);
                                                                            }

                                                                        }
                                                                        if (kendo.parseDate(item1.start) >= $scope.weekStartDate && kendo.parseDate(item1.start) <= $scope.weekEndDate) {
                                                                            if (trainingItem.userId == null) {
                                                                                $scope.trainingProfileHoursWeek += (trainingItem.duration);
                                                                            }

                                                                        }
                                                                        if (trainingItem.userId == null) {
                                                                            $scope.totalProfileTrainingHours += (trainingItem.duration);
                                                                            if ($scope.selectedFromMonth) {
                                                                                var startOfMonth = moment($scope.selectedFromMonth).startOf('month')._d;
                                                                                var endOfMonth = moment($scope.selectedFromMonth).endOf('month')._d;
                                                                                if (kendo.parseDate(item1.start) >= startOfMonth && kendo.parseDate(item1.start) <= endOfMonth) {
                                                                                    $scope.totalFilteredProfileTrainingHours += (trainingItem.duration);
                                                                                }
                                                                            }
                                                                        }

                                                                    }
                                                                    if (trainingItem.durationMetricId == 4) {
                                                                        //Seconds
                                                                        if ($scope.selectedFromMonth) {
                                                                            var startOfMonth = moment($scope.selectedFromMonth).startOf('month')._d;
                                                                            var endOfMonth = moment($scope.selectedFromMonth).endOf('month')._d;
                                                                            if (kendo.parseDate(item1.start) >= startOfMonth && kendo.parseDate(item1.start) <= endOfMonth) {
                                                                                if (trainingItem.userId == null) {
                                                                                    $scope.trainingTimes[$scope.trainingTimes.length - 1].filteredTotalPlanTime += (trainingItem.duration / 60);
                                                                                }
                                                                            }
                                                                        }
                                                                        $scope.trainingTimes[$scope.trainingTimes.length - 1].totalTime += (trainingItem.duration / 60);
                                                                        if (kendo.parseDate(item1.start) >= $scope.dayStartDate && kendo.parseDate(item1.start) <= $scope.dayEndDate) {
                                                                            if (trainingItem.userId == null) {
                                                                                $scope.trainingProfileHoursToday += (trainingItem.duration / 60);
                                                                            }

                                                                        }
                                                                        if (kendo.parseDate(item1.start) >= $scope.weekStartDate && kendo.parseDate(item1.start) <= $scope.weekEndDate) {
                                                                            if (trainingItem.userId == null) {
                                                                                $scope.trainingProfileHoursWeek += (trainingItem.duration / 60);
                                                                            }

                                                                        }
                                                                        if (trainingItem.userId == null) {
                                                                            $scope.totalProfileTrainingHours += (trainingItem.duration / 60);

                                                                            if ($scope.selectedFromMonth) {
                                                                                var startOfMonth = moment($scope.selectedFromMonth).startOf('month')._d;
                                                                                var endOfMonth = moment($scope.selectedFromMonth).endOf('month')._d;
                                                                                if (kendo.parseDate(item1.start) >= startOfMonth && kendo.parseDate(item1.start) <= endOfMonth) {
                                                                                    $scope.totalFilteredProfileTrainingHours += (trainingItem.duration / 60);
                                                                                }
                                                                            }
                                                                        }

                                                                    }
                                                                    if (trainingItem.durationMetricId == 5) {
                                                                        //Days
                                                                        if ($scope.selectedFromMonth) {
                                                                            var startOfMonth = moment($scope.selectedFromMonth).startOf('month')._d;
                                                                            var endOfMonth = moment($scope.selectedFromMonth).endOf('month')._d;
                                                                            if (kendo.parseDate(item1.start) >= startOfMonth && kendo.parseDate(item1.start) <= endOfMonth) {
                                                                                if (trainingItem.userId == null) {
                                                                                    $scope.trainingTimes[$scope.trainingTimes.length - 1].filteredTotalPlanTime += (trainingItem.duration * 1440);
                                                                                }
                                                                            }
                                                                        }
                                                                        $scope.trainingTimes[$scope.trainingTimes.length - 1].totalTime += (trainingItem.duration * 1440);
                                                                        if (kendo.parseDate(item1.start) >= $scope.dayStartDate && kendo.parseDate(item1.start) <= $scope.dayEndDate) {
                                                                            if (trainingItem.userId == null) {
                                                                                $scope.trainingProfileHoursToday += (trainingItem.duration * 1440);
                                                                            }

                                                                        }
                                                                        if (kendo.parseDate(item1.start) >= $scope.weekStartDate && kendo.parseDate(item1.start) <= $scope.weekEndDate) {
                                                                            if (trainingItem.userId == null) {
                                                                                $scope.trainingProfileHoursWeek += (trainingItem.duration * 1440);
                                                                            }

                                                                        }
                                                                        if (trainingItem.userId == null) {
                                                                            $scope.totalProfileTrainingHours += (trainingItem.duration * 1440);

                                                                            if ($scope.selectedFromMonth) {
                                                                                var startOfMonth = moment($scope.selectedFromMonth).startOf('month')._d;
                                                                                var endOfMonth = moment($scope.selectedFromMonth).endOf('month')._d;
                                                                                if (kendo.parseDate(item1.start) >= startOfMonth && kendo.parseDate(item1.start) <= endOfMonth) {
                                                                                    $scope.totalFilteredProfileTrainingHours += (trainingItem.duration * 1440);
                                                                                }
                                                                            }
                                                                        }

                                                                    }
                                                                    startDates.push(item1.start)
                                                                });
                                                                var sortedStartDate = _.sortBy(startDates, function (dateItem) {
                                                                    return -(kendo.parseDate(dateItem).getTime());
                                                                });

                                                                $scope.trainingStartDate = sortedStartDate[sortedStartDate.length - 1];
                                                                $scope.trainingEndDate = sortedStartDate[0];
                                                                $scope.trainingMonths = getMonthsBetweenDate($scope.trainingStartDate, $scope.trainingEndDate);
                                                                $scope.calculatedAt = new Date();
                                                                $scope.isTimeCalculated = true;
                                                                //$scope.totalOwnTrainingTodayResult = $scope.trainingHourResult($scope.totalOwnTrainingSpentHoursToday, $scope.trainingOwnHoursToday)
                                                                $scope.totalProfileTrainingTodayResult = $scope.trainingHourResult($scope.totalProfileTrainingSpentHoursToday, $scope.trainingProfileHoursToday)
                                                                //$scope.totalOwnTrainingWeekResult = $scope.trainingHourResult($scope.totalOwnTrainingSpentHoursWeek, $scope.trainingOwnHoursWeek)
                                                                $scope.totalProfileTrainingWeekResult = $scope.trainingHourResult($scope.totalProfileTrainingSpentHoursWeek, $scope.trainingProfileHoursWeek)
                                                                //$scope.totalOwnTrainingResult = $scope.trainingHourResult($scope.totalOwnTrainingSpentHours, $scope.totalOwnTrainingHours)
                                                                $scope.totalProfileTrainingResult = $scope.trainingHourResult($scope.totalProfileTrainingSpentHours, $scope.totalProfileTrainingHours)
                                                                $scope.totalFilteredProfileTrainingResult = $scope.trainingHourResult($scope.totalFilteredProfileTrainingSpentHours, $scope.totalFilteredProfileTrainingHours);
                                                            }
                                                        });
                                                    }
                                                });
                                            }
                                        }
                                    });
                                }

                                weakKPIs = _.unique(weakKPIs, function (item) {
                                    return item.skillId
                                });
                                strongKPIs = _.unique(strongKPIs, function (item) {
                                    return item.skillId
                                });
                                _.each($scope.weakKPIs, function (dataItem) {
                                    var weakKPITrainingTimes = _.filter($scope.trainingTimes, function (trainingTimeItem) {
                                        return trainingTimeItem.skillId == dataItem.skillId;
                                    });
                                    dataItem.totalPlanTime = 0;
                                    dataItem.spentTime = 0;

                                    _.each(weakKPITrainingTimes, function (weakKPITrainingTimeItem) {
                                        dataItem.totalPlanTime += weakKPITrainingTimeItem.totalTime;
                                        dataItem.spentTime += weakKPITrainingTimeItem.spentTime;
                                    })
                                    dataItem.totalAgreegatedPlanTime = 0;
                                    dataItem.agreegatedSpentTime = 0;
                                    // getAgreegatedSpentTime

                                    var pointers = [];
                                    var graphId = "#home_weakkpi_" + dataItem.skillId + "_stagediffrenceprogress_gauge";
                                    var weakKPIScaleRanges = angular.copy($scope.selectedProjectProfileScaleRanges);
                                    if ($scope.isProgressView) {//pointers.push({
                                        //    value: dataItem.overallProgress,
                                        //    color: $scope.gaugeColors.main
                                        //})
                                    } else {
                                        graphId = "#home_weakkpi_" + dataItem.skillId + "_stagediffrenceperformance_gauge";
                                        //pointers.push({
                                        //    value: dataItem.overallPerformance,
                                        //    color: $scope.gaugeColors.main
                                        //})
                                    }
                                    var compareDataItem = _.find($scope.compareWeakKPIs, function (item) {
                                        return item.skillId == dataItem.skillId;
                                    });
                                    if (compareDataItem) {
                                        dataItem.compareOverallProgress = $scope.overallScoreProgressPercentage(dataItem.currentStageScore, compareDataItem.currentStageScore);
                                        dataItem.compareOverallPerformance = $scope.overallScorePerformancePercentage(dataItem.currentStageScore, compareDataItem.currentStageScore);
                                        if ($scope.isProgressView) {
                                            pointers.push({
                                                value: dataItem.compareOverallProgress,
                                                color: $scope.gaugeColors.compare,
                                            })
                                        } else {
                                            pointers.push({
                                                value: dataItem.compareOverallPerformance,
                                                color: $scope.gaugeColors.compare,
                                            })
                                        }
                                    }

                                    var maxPointer = _.max(pointers, function (item) {
                                        return item.value;
                                    });
                                    if (maxPointer.value > 100) {
                                        weakKPIScaleRanges.push({
                                            min: weakKPIScaleRanges[0].min,
                                            max: weakKPIScaleRanges[weakKPIScaleRanges.length - 1].max,
                                            from: 100,
                                            to: maxPointer.value,
                                            color: "#ff6e19",
                                            minPercentage: 0,
                                            maxPercentage: maxPointer.value,
                                        });
                                        $(graphId).kendoRadialGauge({
                                            pointer: pointers,
                                            scale: {
                                                min: 0,
                                                minorUnit: 10,
                                                startAngle: -30,
                                                endAngle: 210,
                                                max: maxPointer.value,
                                                ranges: weakKPIScaleRanges,
                                            }
                                        });
                                    } else {
                                        var minPointer = _.min(pointers, function (item) {
                                            return item.value;
                                        });
                                        if (minPointer.value < weakKPIScaleRanges[0].min) {
                                            weakKPIScaleRanges[0].minPercentage = minPointer.value;
                                            weakKPIScaleRanges[0].min = minPointer.value;
                                            weakKPIScaleRanges[0].from = minPointer.value;
                                        }
                                        $(graphId).kendoRadialGauge({
                                            pointer: pointers,
                                            scale: {
                                                min: weakKPIScaleRanges[0].minPercentage,
                                                minorUnit: 10,
                                                startAngle: -30,
                                                endAngle: 210,
                                                max: maxPointer.value > 100 ? maxPointer.value : 100,
                                                ranges: weakKPIScaleRanges,
                                            }
                                        });
                                    }
                                })
                                _.each($scope.strongKPIs, function (dataItem) {

                                    var strongKPITrainingTimes = _.filter($scope.trainingTimes, function (trainingTimeItem) {
                                        return trainingTimeItem.skillId == dataItem.skillId;
                                    });
                                    dataItem.totalPlanTime = 0;
                                    dataItem.spentTime = 0;
                                    _.each(strongKPITrainingTimes, function (strongKPITrainingTimeItem) {
                                        dataItem.totalPlanTime += strongKPITrainingTimeItem.totalTime;
                                        dataItem.spentTime += strongKPITrainingTimeItem.spentTime;
                                    })

                                    var pointers = [];
                                    var graphId = "#home_strongkpi_" + dataItem.skillId + "_stagediffrenceprogress_gauge";
                                    var strongKPIScaleRanges = angular.copy($scope.selectedProjectProfileScaleRanges);
                                    if ($scope.isProgressView) {//pointers.push({
                                        //    value: dataItem.overallProgress,
                                        //    color: $scope.gaugeColors.main
                                        //})
                                    } else {
                                        graphId = "#home_strongkpi_" + dataItem.skillId + "_stagediffrenceperformance_gauge";
                                        //pointers.push({
                                        //    value: dataItem.overallPerformance,
                                        //    color: $scope.gaugeColors.main
                                        //})
                                    }
                                    var compareDataItem = _.find($scope.compareStrongKPIs, function (item) {
                                        return item.skillId == dataItem.skillId;
                                    });
                                    if (compareDataItem) {
                                        //dataItem.compareOverallProgress = compareDataItem.overallProgress;
                                        //dataItem.compareStageTimePerformance = compareDataItem.stageTimePerformance;
                                        dataItem.compareOverallProgress = $scope.overallScoreProgressPercentage(dataItem.currentStageScore, compareDataItem.currentStageScore);
                                        dataItem.compareOverallPerformance = $scope.overallScorePerformancePercentage(dataItem.currentStageScore, compareDataItem.currentStageScore);
                                        if ($scope.isProgressView) {
                                            pointers.push({
                                                value: dataItem.compareOverallProgress,
                                                color: $scope.gaugeColors.compare,
                                            })
                                        } else {
                                            pointers.push({
                                                value: dataItem.compareOverallPerformance,
                                                color: $scope.gaugeColors.compare,
                                            })
                                        }
                                    }

                                    var maxPointer = _.max(pointers, function (item) {
                                        return item.value;
                                    });
                                    if (maxPointer.value > 100) {
                                        strongKPIScaleRanges.push({
                                            min: strongKPIScaleRanges[0].min,
                                            max: strongKPIScaleRanges[strongKPIScaleRanges.length - 1].max,
                                            from: 100,
                                            to: maxPointer.value,
                                            color: "#ff6e19",
                                            minPercentage: 0,
                                            maxPercentage: maxPointer.value,
                                        });
                                        $(graphId).kendoRadialGauge({
                                            pointer: pointers,
                                            scale: {
                                                min: 0,
                                                minorUnit: 10,
                                                startAngle: -30,
                                                endAngle: 210,
                                                max: maxPointer.value,
                                                ranges: strongKPIScaleRanges,
                                            }
                                        });
                                    } else {
                                        var minPointer = _.min(pointers, function (item) {
                                            return item.value;
                                        });
                                        if (minPointer.value < strongKPIScaleRanges[0].min) {
                                            strongKPIScaleRanges[0].minPercentage = minPointer.value;
                                            strongKPIScaleRanges[0].min = minPointer.value;
                                            strongKPIScaleRanges[0].from = minPointer.value;
                                        }
                                        $(graphId).kendoRadialGauge({
                                            pointer: pointers,
                                            scale: {
                                                min: strongKPIScaleRanges[0].minPercentage,
                                                minorUnit: 10,
                                                startAngle: -30,
                                                endAngle: 210,
                                                max: maxPointer.value > 100 ? maxPointer.value : 100,
                                                ranges: strongKPIScaleRanges,
                                            }
                                        });
                                    }

                                })
                            }
                            setTimeout(function () {
                                if ($scope.isProgressView) {
                                    $(".weakkpistagediffrenceprogress").each(function (i, el) {
                                        if ($(el).data("kendoRadialGauge")) {
                                            $(el).data("kendoRadialGauge").redraw();
                                        }
                                    })
                                    $(".strongkpistagediffrenceprogress").each(function (i, el) {
                                        if ($(el).data("kendoRadialGauge")) {
                                            $(el).data("kendoRadialGauge").redraw();
                                        }
                                    })
                                } else {
                                    $(".weakkpistagediffrenceperformance").each(function (i, el) {
                                        if ($(el).data("kendoRadialGauge")) {
                                            $(el).data("kendoRadialGauge").redraw();
                                        }
                                    })
                                    $(".strongkpistagediffrenceperformance").each(function (i, el) {
                                        if ($(el).data("kendoRadialGauge")) {
                                            $(el).data("kendoRadialGauge").redraw();
                                        }
                                    })
                                }
                            }, 50)
                        }
                    }
                    //$scope.changeTimeManagementViewType($scope.selectedTimeManagementViewType.id);
                }
            }

            $scope.selectedTimeManagementViewType = _.find($scope.timeManagementViewTypeOptions, function (item) {
                return item.id == $scope.timeManagementViewTypeEnum.Performance;
            });
            $scope.changeTimeManagementViewType = function (value) {
                if (value > 0) {
                    $scope.selectedTimeManagementViewType = _.find($scope.timeManagementViewTypeOptions, function (item) {
                        return item.id == value;
                    });

                    if ($scope.selectedTimeManagementViewType) {
                        _.each($scope.weakKPIs, function (dataItem) {
                            var pointers = [];
                            var graphId = "#home_weakkpi_" + dataItem.skillId + "_timeperformance_gauge";
                            var weakKPIScaleRanges = angular.copy($scope.selectedProjectProfileScaleRanges);
                            if ($scope.selectedTimeManagementViewType.id == $scope.timeManagementViewTypeEnum.Performance) {
                                pointers.push({
                                    value: dataItem.stageTimePerformance,
                                    color: $scope.gaugeColors.main
                                });
                            } else if ($scope.selectedTimeManagementViewType.id == $scope.timeManagementViewTypeEnum.AggregatedPerformance) {
                                pointers.push({
                                    value: dataItem.stageAgreegatedTimePerformance,
                                    color: $scope.gaugeColors.main
                                });
                            }
                            var compareDataItem = _.find($scope.compareWeakKPIs, function (item) {
                                return item.skillId == dataItem.skillId;
                            });
                            if (compareDataItem) {
                                dataItem.compareStageTimeProgress = compareDataItem.stageTimeProgress;
                                dataItem.compareStageTimePerformance = compareDataItem.stageTimePerformance;
                                dataItem.compareStageAgreegatedTimePerformance = compareDataItem.stageAgreegatedTimePerformance;
                                if ($scope.selectedTimeManagementViewType.id == $scope.timeManagementViewTypeEnum.Performance) {
                                    pointers.push({
                                        value: compareDataItem.stageTimePerformance,
                                        color: $scope.gaugeColors.compare
                                    });
                                } else if ($scope.selectedTimeManagementViewType.id == $scope.timeManagementViewTypeEnum.AggregatedPerformance) {
                                    pointers.push({
                                        value: compareDataItem.stageAgreegatedTimePerformance,
                                        color: $scope.gaugeColors.compare
                                    });
                                }
                            }
                            if ($scope.selectedFromMonth) {
                                pointers.push({
                                    value: dataItem.filteredStageTimePerformance,
                                    color: $scope.gaugeColors.filter,
                                })
                            }
                            var maxPointer = _.max(pointers, function (item) {
                                return item.value;
                            });
                            if (maxPointer.value > 100) {
                                weakKPIScaleRanges.push({
                                    min: weakKPIScaleRanges[0].min,
                                    max: weakKPIScaleRanges[weakKPIScaleRanges.length - 1].max,
                                    from: 100,
                                    to: maxPointer.value,
                                    color: "#ff6e19",
                                    minPercentage: 0,
                                    maxPercentage: maxPointer.value,
                                });
                                $(graphId).kendoRadialGauge({
                                    pointer: pointers,
                                    scale: {
                                        min: 0,
                                        minorUnit: 10,
                                        startAngle: -30,
                                        endAngle: 210,
                                        max: maxPointer.value,
                                        ranges: weakKPIScaleRanges,
                                    }
                                });

                            } else {
                                var minPointer = _.min(pointers, function (item) {
                                    return item.value;
                                });
                                if (minPointer.value < weakKPIScaleRanges[0].min) {
                                    weakKPIScaleRanges[0].minPercentage = minPointer.value;
                                    weakKPIScaleRanges[0].min = minPointer.value;
                                    weakKPIScaleRanges[0].from = minPointer.value;
                                }
                                $(graphId).kendoRadialGauge({
                                    pointer: pointers,
                                    scale: {
                                        min: weakKPIScaleRanges[0].minPercentage,
                                        minorUnit: 10,
                                        startAngle: -30,
                                        endAngle: 210,
                                        max: maxPointer.value > 100 ? maxPointer.value : 100,
                                        ranges: weakKPIScaleRanges,
                                    }
                                });
                            }

                        });
                        _.each($scope.strongKPIs, function (dataItem) {
                            var pointers = [];
                            var graphId = "#home_strongkpi_" + dataItem.skillId + "_timeperformance_gauge";
                            var strongKPIScaleRanges = angular.copy($scope.selectedProjectProfileScaleRanges);
                            pointers.push({
                                value: dataItem.stageTimePerformance,
                                color: $scope.gaugeColors.main
                            })
                            var compareDataItem = _.find($scope.compareStrongKPIs, function (item) {
                                return item.skillId == dataItem.skillId;
                            });
                            if (compareDataItem) {
                                dataItem.compareStageTimeProgress = compareDataItem.stageTimeProgress;
                                dataItem.compareStageTimePerformance = compareDataItem.stageTimePerformance;
                                pointers.push({
                                    value: compareDataItem.stageTimePerformance,
                                    color: $scope.gaugeColors.compare,
                                })
                            }
                            if ($scope.selectedFromMonth) {
                                pointers.push({
                                    value: dataItem.filteredStageTimePerformance,
                                    color: $scope.gaugeColors.filter,
                                })
                            }
                            var maxPointer = _.max(pointers, function (item) {
                                return item.value;
                            });
                            if (maxPointer.value > 100) {
                                strongKPIScaleRanges.push({
                                    min: strongKPIScaleRanges[0].min,
                                    max: strongKPIScaleRanges[strongKPIScaleRanges.length - 1].max,
                                    from: 100,
                                    to: maxPointer.value,
                                    color: "#ff6e19",
                                    minPercentage: 0,
                                    maxPercentage: maxPointer.value,
                                });
                                $(graphId).kendoRadialGauge({
                                    pointer: pointers,
                                    scale: {
                                        min: 0,
                                        minorUnit: 10,
                                        startAngle: -30,
                                        endAngle: 210,
                                        max: maxPointer.value,
                                        ranges: strongKPIScaleRanges,
                                    }
                                });
                            } else {
                                var minPointer = _.min(pointers, function (item) {
                                    return item.value;
                                });
                                if (minPointer.value < strongKPIScaleRanges[0].min) {
                                    strongKPIScaleRanges[0].minPercentage = minPointer.value;
                                    strongKPIScaleRanges[0].min = minPointer.value;
                                    strongKPIScaleRanges[0].from = minPointer.value;
                                }
                                $(graphId).kendoRadialGauge({
                                    pointer: pointers,
                                    scale: {
                                        min: strongKPIScaleRanges[0].minPercentage,
                                        minorUnit: 10,
                                        startAngle: -30,
                                        endAngle: 210,
                                        max: maxPointer.value > 100 ? maxPointer.value : 100,
                                        ranges: strongKPIScaleRanges,
                                    }
                                });
                            }
                        });
                    }
                }
            }

            $scope.getAgreegatedSpentTime = function (kpitType) {
                _.eac($scope.selectedProfileStagesData, function () {
                })
            }
            $scope.selectProject = function (id) {
                progressBar.startProgress();
                $scope.selectedProject = null;
                $scope.selectedProjectProfile = null;
                $scope.selectedProfileStage = null;
                $scope.selectedCompareProfileStage = null;
                $scope.selectedFromMonth = null;
                $scope.startOfMonth = null;
                $scope.endOfMonth = null;
                $scope.trainingMonths = [];
                $scope.profilesStages = [];
                $scope.projectParticipants = [];
                $scope.selectedProject = _.find($scope.userProjects, function (item) {
                    return item.id == id;
                });
                if ($scope.selectedProject) {
                    userDashboardManager.getProjectProfiles([$scope.selectedProject.id], "").then(function (data) {
                        progressBar.stopProgress();
                        $scope.projectProfiles = _.filter(data, function (dataItem) {
                            return dataItem.profileTypeId == profilesTypesEnum.soft;
                        });
                        if ($scope.projectProfiles.length > 0) {
                            $scope.selectProjectProfile($scope.getMostRecentOrActiveProfile($scope.projectProfiles));
                        } else {
                            $scope.calculatedAt = new Date();
                            $scope.isTimeCalculated = true;
                            //dialogService.showNotification("No profiles found", "info");
                        }
                    });

                }

            }
            $scope.selectprojectParticipant = function (userId) {
                $scope.selectedProjectParticipantId = userId;
                $scope.selectedProjectParticipant = _.find($scope.projectParticipants, function (item) {
                    return item.userId == userId;
                })
                calculateTimeSummary();
            }
            $scope.getMostRecentOrActiveProfile = function (projectProfiles) {
                var allProfileStages = []
                if (projectProfiles) {
                    _.each(projectProfiles, function (projectProfile) {
                        _.forEach(projectProfile.stageGroups, function (stageGroup) {
                            _.forEach(stageGroup.stages, function (stage) {
                                allProfileStages.push({
                                    profileId: projectProfile.id,
                                    stageId: stage.id,
                                    stageStart: kendo.parseDate(stage.startDateTime),
                                    stageEnd: kendo.parseDate(stage.endDateTime),
                                })
                            });
                        })
                    });
                    var activeProfiles = _.filter(allProfileStages, function (data) {
                        return data.stageStart < $scope.dayStartDate && data.stageEnd > $scope.dayEndDate
                    });
                    if (activeProfiles.length > 0) {
                        var sortedActiveProfiles = _.sortBy(activeProfiles, function (data) {
                            return data.stageStart;
                        });
                        return sortedActiveProfiles[0].profileId;
                    } else {
                        return projectProfiles[0].id;
                    }

                }
            }
            $scope.selectProjectProfile = function (id) {

                $scope.selectedProjectProfile = null;
                $scope.selectedProfileStage = null;
                $scope.selectedCompareProfileStage = null;
                $scope.selectedFromMonth = null;
                $scope.startOfMonth = null;
                $scope.endOfMonth = null;
                $scope.trainingMonths = [];
                $scope.profilesStages = [];
                if (id > 0) {
                    $scope.selectedProjectProfile = _.find($scope.projectProfiles, function (item) {
                        return item.id == id;
                    });

                    userDashboardManager.getScaleRanges($scope.selectedProjectProfile.id).then(function (data) {
                        $scope.selectedProjectProfileScaleRanges = [];
                        _.each(data, function (dataItem, i) {
                            $scope.selectedProjectProfileScaleRanges.push({
                                min: dataItem.min,
                                max: dataItem.max,
                                from: parseInt(dataItem.min) * 10,
                                to: parseInt(dataItem.max) * 10,
                                color: dataItem.color,
                                minPercentage: (dataItem.min * 10),
                                maxPercentage: (dataItem.max * 10),
                            });
                        })
                        _.each($scope.selectedProjectProfileScaleRanges, function (scaleRange, i) {
                            if (i == 0) {
                                scaleRange.min = 0;
                                scaleRange.from = 0;
                                scaleRange.minPercentage = 0;
                            } else {
                                scaleRange.min = $scope.selectedProjectProfileScaleRanges[i - 1].max;
                                scaleRange.from = $scope.selectedProjectProfileScaleRanges[i - 1].to;
                                scaleRange.minPercentage = $scope.selectedProjectProfileScaleRanges[i - 1].maxPercentage;
                            }
                        })
                    })

                    userDashboardManager.getProfileStages($scope.selectedProjectProfile.id, null, null).then(function (data) {
                        var stagesData = [];
                        angular.forEach(data, function (item, index) {
                            stagesData.push({
                                id: item.id,
                                name: item.name,
                                statusText: item.statusText,
                                stageGroupId: item.stageGroupId
                            });
                        });
                        if (data.length > 0) {

                            if ($scope.selectedProjectProfile) {
                                if ($scope.selectedProjectProfile.stageGroups) {
                                    _.forEach($scope.selectedProjectProfile.stageGroups, function (stageGroup) {
                                        _.forEach(stageGroup.stages, function (stage) {
                                            var stageData = _.find(stagesData, function (stageItem) {
                                                return stageItem.id == stage.id;
                                            });
                                            if (stageData) {
                                                if (stageData.statusText == "Completed" || stageData.statusText == "Active") {
                                                    $scope.profilesStages.push({
                                                        id: stage.id,
                                                        name: stage.name,
                                                        stageGroup: stageGroup.name,
                                                        stageGroupId: stageGroup.id,
                                                        statusText: stageData ? stageData.statusText : null
                                                    })
                                                }
                                            }
                                        })
                                    })
                                }
                                if ($scope.profilesStages.length > 0) {
                                    $scope.selectProfileStage($scope.getMostRecentOrActiveProfileStage($scope.profilesStages));
                                } else {
                                    calculateTimeSummary();
                                }
                            }

                        }

                    })

                    if ($scope.selectedProject.id > 0) {
                        $scope.projectParticipants = [];
                        todosManager.getProjectMembers($scope.selectedProject.id).then(function (data) {
                            var isProjectManager = _.any(data, function (dataItem) {
                                return dataItem.roleId == projectRolesEnum.projectManager && dataItem.userId == authService.authentication.user.userId;
                            })
                            if (isProjectManager) {
                                var participants = _.filter(data, function (dataItem) {
                                    return dataItem.roleId == projectRolesEnum.participant;
                                });
                                _.each($scope.selectedProjectProfile.stageGroups, function (sgItem) {
                                    _.each(sgItem.evaluationParticipants, function (epItem) {
                                        var isExist = _.any(participants, function (participantItem) {
                                            return participantItem.userId == epItem.userId
                                        })
                                        if (isExist) {
                                            var projectParticipant = _.find(participants, function (participantItem) {
                                                return participantItem.userId == epItem.userId
                                            })
                                            if (projectParticipant) {
                                                $scope.projectParticipants.push(projectParticipant);
                                            }
                                        }
                                    })

                                })

                                //$scope.projectParticipants = _.filter(data, function (dataItem) {
                                //    return dataItem.roleId == projectRolesEnum.participant;
                                //});
                                if ($scope.projectParticipants.length > 0) {
                                    $scope.selectprojectParticipant($scope.projectParticipants[0].userId);
                                }
                            }

                        });
                    }

                }
            }

            $scope.getMostRecentOrActiveProfileStage = function (profilesStages) {
                var allProfileStages = []
                if (profilesStages) {
                    _.forEach(profilesStages, function (stage) {
                        if (stage.statusText == "Completed") {
                            allProfileStages.push({
                                stageId: stage.id,
                                stageStart: kendo.parseDate(stage.startDateTime),
                                stageEnd: kendo.parseDate(stage.endDateTime),
                            })
                        }
                    });

                    if (allProfileStages.length > 0) {
                        return allProfileStages[allProfileStages.length - 1].stageId;
                    } else {
                        return profilesStages[0].id;
                    }
                }
            }
            $scope.selectProfileStage = function (id) {
                $scope.selectedProfileStage = null;
                $scope.selectedCompareProfileStage = null;
                $scope.selectedFromMonth = null;
                $scope.startOfMonth = null;
                $scope.endOfMonth = null;
                $scope.trainingMonths = [];
                if ($scope.selectedProgressViewType.id == $scope.progressViewTypeEnum.StageDifference) {
                    $scope.selectedProgressViewType = _.find($scope.progressViewTypeOptions, function (item) {
                        return item.id == $scope.progressViewTypeEnum.StageScoreProgress;
                    });
                }
                if (id > 0) {
                    $scope.selectedProfileStage = _.find($scope.profilesStages, function (item) {
                        return item.id == id;
                    });
                    if ($scope.selectedProfileStage) {
                        calculateTimeSummary();
                    }
                } else if (id == 0) {
                    $scope.selectedProfileStage = {
                        id: 0,
                        name: $translate.instant('COMMON_ALL')
                    };
                    calculateTimeSummary();
                }

            }
            $scope.selectCompareProfileStage = function (id) {
                $scope.selectedCompareProfileStage = null;
                $scope.selectedFromMonth = null
                if ($scope.selectedProgressViewType.id == $scope.progressViewTypeEnum.StageDifference) {
                    $scope.selectedProgressViewType = _.find($scope.progressViewTypeOptions, function (item) {
                        return item.id == $scope.progressViewTypeEnum.StageScoreProgress;
                    });
                }
                if (id > 0) {
                    $scope.selectedCompareProfileStage = _.find($scope.profilesStages, function (item) {
                        return item.id == id;
                    });
                    if ($scope.selectedCompareProfileStage) {
                        calculateTimeSummary();
                    }
                } else {
                    calculateTimeSummary();
                }
            }
            $scope.trainingHourResult = function (spent, total) {
                if (total) {
                    if (total != 0) {
                        return Math.abs(spent - total);
                    } else {
                        return "0";
                    }
                } else {
                    return "0";
                }
            }
            $scope.trainingHourPerformance = function (spent, total) {
                if (total != 0) {
                    if (spent >= total) {
                        return "fa-smile-o"
                    } else {
                        return "fa-frown-o"
                    }
                } else {
                    return "fa-meh-o"
                }
            }
            $scope.trainingTimeProgressPercentage = function (spent, planned) {
                var diff = spent - planned;
                if (spent == 0) {
                    return 0;
                } else if (spent == planned) {
                    return 100;
                } else {
                    var avg = (diff / planned) * 100;
                    if (isNaN(avg)) {
                        avg = 0;
                    }
                    if (!isFinite(avg)) {
                        return 0;
                    }
                    var percentage = Math.round(avg * 100) / 100;
                    return percentage
                }
            }
            $scope.stageProgressPercentage = function (stageScore, previousScore) {
                var diff = stageScore - previousScore;
                var avg = (diff / previousScore) * 100;
                if (isNaN(avg)) {
                    avg = 0;
                }
                if (!isFinite(avg)) {
                    return 0;
                }
                var percentage = Math.round(avg * 100) / 100;
                return percentage
            }
            $scope.overallScoreProgressPercentage = function (startScore, currentScore) {
                var diff = currentScore - startScore;
                var avg = (diff / startScore) * 100;
                if (isNaN(avg)) {
                    avg = 0;
                }
                if (!isFinite(avg)) {
                    return 0;
                }
                var percentage = Math.round(avg * 100) / 100;
                return percentage

            }

            $scope.trainingTimePerformancePercentage = function (spent, planned) {
                var avg = (spent / planned) * 100;
                if (isNaN(avg)) {
                    avg = 0;
                }
                if (!isFinite(avg)) {
                    return 0;
                }
                var percentage = Math.round(avg * 100) / 100;
                return percentage
            }
            $scope.stagePerformancePercentage = function (stageScore, stageGoal) {
                var avg = (stageScore / stageGoal) * 100;
                if (isNaN(avg)) {
                    avg = 0;
                }
                if (!isFinite(avg)) {
                    return 0;
                }
                var percentage = Math.round(avg * 100) / 100;
                return percentage
            }
            $scope.overallScorePerformancePercentage = function (startScore, currentScore) {
                var avg = (currentScore / startScore) * 100;
                if (isNaN(avg)) {
                    avg = 0;
                }
                if (!isFinite(avg)) {
                    return 0;
                }
                var percentage = Math.round(avg * 100) / 100;
                return percentage

            }

            $scope.changeViewType = function (value) {
                $scope.isProgressView = value;
                $scope.selectProgressViewType($scope.selectedProgressViewType.id)
            }
            function calculateTimeSummary() {
                clearResultValues();
                var startDates = [];
                var userId = authService.authentication.user.userId;
                if ($scope.selectedProjectParticipantId) {
                    userId = $scope.selectedProjectParticipantId;
                }
                userDashboardManager.getUserProfileStageTrainings(userId, $scope.selectedProjectProfile.id).then(function (data) {
                    if (data.length > 0) {
                        clearResultValues();
                        var activeProfile = data[0];

                        if (activeProfile.ipsTrainingDiaryStages) {
                            $scope.selectedProfileStagesData = activeProfile.ipsTrainingDiaryStages;
                            _.forEach(activeProfile.ipsTrainingDiaryStages, function (stageItem, stageIndex) {
                                var previousStageItem = null;
                                if (stageIndex > 0) {
                                    previousStageItem = activeProfile.ipsTrainingDiaryStages[stageIndex - 1];
                                }
                                var isAllowContinue = false;
                                if ($scope.selectedProfileStage) {
                                    if (stageItem.id == $scope.selectedProfileStage.id) {
                                        isAllowContinue = true;
                                    } else if ($scope.selectedProfileStage.id == 0) {
                                        isAllowContinue = true;
                                    }
                                } else {
                                    isAllowContinue = true;
                                }
                                if (isAllowContinue) {
                                    if (stageItem.evaluationAgreement) {
                                        _.forEach(stageItem.evaluationAgreement, function (evaluationAgreementItem) {
                                            if (evaluationAgreementItem.question) {
                                                var selectedMilestoneAgreementGoal = null;
                                                if (evaluationAgreementItem.milestoneAgreementGoals) {
                                                    selectedMilestoneAgreementGoal = _.find(evaluationAgreementItem.milestoneAgreementGoals, function (milestoneAgreementGoalItem) {
                                                        return milestoneAgreementGoalItem.stageId == stageItem.id;
                                                    });
                                                }

                                                _.forEach(evaluationAgreementItem.question.skills, function (skillItem) {
                                                    if (evaluationAgreementItem.kpiType == 1) {
                                                        var previousStageScore = 0;
                                                        var previousStageName = "";
                                                        if (previousStageItem) {
                                                            _.forEach(previousStageItem.evaluationAgreement, function (previousEvaluationAgreementItem) {
                                                                if (previousEvaluationAgreementItem.kpiType == 1) {
                                                                    if (previousEvaluationAgreementItem.question) {
                                                                        _.forEach(previousEvaluationAgreementItem.question.skills, function (previousSkillItem) {
                                                                            if (previousSkillItem.id == skillItem.id) {
                                                                                previousStageScore = previousEvaluationAgreementItem.finalScore;
                                                                                previousStageName = previousStageItem.name;
                                                                                return (false);
                                                                            }
                                                                        })
                                                                    }
                                                                }

                                                            })

                                                        }

                                                        $scope.weakKPIs.push({
                                                            skillName: skillItem.name,
                                                            skillId: skillItem.id,
                                                            totalPlanTime: 0,
                                                            spentTime: 0,
                                                            totalAgreegatedPlanTime: 0,
                                                            agreegatedSpentTime: 0,
                                                            startScore: 0,
                                                            currentStageGoal: selectedMilestoneAgreementGoal ? selectedMilestoneAgreementGoal.goal : 0,
                                                            currentStageScore: evaluationAgreementItem.finalScore,
                                                            previousStageScore: previousStageScore,
                                                            previousStageName: previousStageName,
                                                            stageProgress: 0,
                                                            overallProgress: 0,
                                                            stageTimeProgress: 0,
                                                            stagePerformance: 0,
                                                            overallPerformance: 0,
                                                            stageTimePerformance: 0,
                                                            stageAgreegatedTimeProgress: 0,
                                                            stageAgreegatedTimePerformance: 0,
                                                            compareStageProgress: 0,
                                                            compareOverallProgress: 0,
                                                            compareStageTimeProgress: 0,
                                                            compareStagePerformance: 0,
                                                            compareOverallPerformance: 0,
                                                            compareStageTimePerformance: 0,
                                                            compareStageAgreegatedTimePerformance: 0,
                                                            filteredStageTimeProgress: 0,
                                                            filteredSpentTime: 0,
                                                            filteredTotalPlanTime: 0,
                                                            comparedSpentTime: 0,
                                                            comparedTotalPlanTime: 0
                                                        });
                                                    } else if (evaluationAgreementItem.kpiType == 2) {
                                                        var previousStageScore = 0;
                                                        var previousStageName = "";
                                                        if (previousStageItem) {
                                                            _.forEach(previousStageItem.evaluationAgreement, function (previousEvaluationAgreementItem) {
                                                                if (previousEvaluationAgreementItem.kpiType == 2) {
                                                                    if (previousEvaluationAgreementItem.question) {
                                                                        _.forEach(previousEvaluationAgreementItem.question.skills, function (previousSkillItem) {
                                                                            if (previousSkillItem.id == skillItem.id) {
                                                                                previousStageScore = previousEvaluationAgreementItem.finalScore;
                                                                                previousStageName = previousStageItem.name;
                                                                                return (false);
                                                                            }
                                                                        })
                                                                    }
                                                                }

                                                            })

                                                        }
                                                        $scope.strongKPIs.push({
                                                            skillName: skillItem.name,
                                                            skillId: skillItem.id,
                                                            totalPlanTime: 0,
                                                            spentTime: 0,
                                                            startScore: 0,
                                                            totalAgreegatedPlanTime: 0,
                                                            agreegatedSpentTime: 0,
                                                            currentStageGoal: selectedMilestoneAgreementGoal ? selectedMilestoneAgreementGoal.goal : 0,
                                                            currentStageScore: evaluationAgreementItem.finalScore,
                                                            previousStageScore: previousStageScore,
                                                            previousStageName: previousStageName,
                                                            stageProgress: 0,
                                                            overallProgress: 0,
                                                            stageTimeProgress: 0,
                                                            stagePerformance: 0,
                                                            overallPerformance: 0,
                                                            stageTimePerformance: 0,
                                                            stageAgreegatedTimeProgress: 0,
                                                            stageAgreegatedTimePerformance: 0,
                                                            compareStageProgress: 0,
                                                            compareOverallProgress: 0,
                                                            compareStageTimeProgress: 0,
                                                            compareStagePerformance: 0,
                                                            compareOverallPerformance: 0,
                                                            compareStageTimePerformance: 0,
                                                            compareStageAgreegatedTimePerformance: 0,
                                                            filteredStageTimeProgress: 0,
                                                            filteredSpentTime: 0,
                                                            filteredTotalPlanTime: 0,
                                                            filteredStageTimePerformance: 0,
                                                            comparedSpentTime: 0,
                                                            comparedTotalPlanTime: 0
                                                        });
                                                    }
                                                })
                                            }
                                            if (evaluationAgreementItem.trainings) {
                                                _.forEach(evaluationAgreementItem.trainings, function (trainingItem) {
                                                    if (trainingItem.id > 0) {
                                                        var event = new kendo.data.SchedulerEvent({
                                                            id: trainingItem.id,
                                                            description: trainingItem.additionalInfo,
                                                            title: trainingItem.name,
                                                            start: kendo.parseDate(trainingItem.startDate),
                                                            //item1.start,
                                                            isAllDay: moment(kendo.parseDate(trainingItem.startDate)).format("HHmmss") == "000000",
                                                            end: kendo.parseDate(trainingItem.endDate),
                                                            recurrenceRule: trainingItem.frequency,
                                                        });
                                                        var skillId = null;
                                                        if (trainingItem.skillId) {
                                                            skillId = trainingItem.skillId;
                                                        } else if (trainingItem.skills.length > 0) {
                                                            skillId = trainingItem.skills[0].id;
                                                        }
                                                        $scope.trainingTimes.push({
                                                            id: trainingItem.id,
                                                            skillId: skillId,
                                                            totalTime: 0,
                                                            spentTime: 0,
                                                            filteredTotalPlanTime: 0,
                                                            filteredSpentTime: 0
                                                        })
                                                        _.each(trainingItem.trainingFeedbacks, function (itemfeedback) {
                                                            if (itemfeedback.evaluatorId == null) {
                                                                var isTrainingFinished = true;
                                                                if (itemfeedback.isParticipantPaused == true) {
                                                                    var finishedTraining = _.filter(trainingItem.trainingFeedbacks, function (feedbackItem) {
                                                                        return itemfeedback.recurrencesStartTime == feedbackItem.recurrencesStartTime && itemfeedback.recurrencesEndTime == feedbackItem.recurrencesEndTime && feedbackItem.isParticipantPaused == false;
                                                                    });
                                                                    if (finishedTraining.length > 0) {
                                                                        isTrainingFinished = true
                                                                    } else {
                                                                        isTrainingFinished = false;
                                                                    }
                                                                }
                                                                if (!(itemfeedback.isParticipantPaused == true && isTrainingFinished == true)) {
                                                                    if (trainingItem.userId == null) {
                                                                        $scope.trainingTimes[$scope.trainingTimes.length - 1].spentTime += itemfeedback.timeSpentMinutes;
                                                                        if (itemfeedback.recurrencesStartTime) {
                                                                            if (kendo.parseDate(itemfeedback.recurrencesStartTime) >= $scope.dayStartDate && kendo.parseDate(itemfeedback.recurrencesStartTime) <= $scope.dayEndDate) {
                                                                                $scope.totalProfileTrainingSpentHoursToday += (itemfeedback.timeSpentMinutes);
                                                                            }
                                                                            if (kendo.parseDate(itemfeedback.recurrencesStartTime) >= $scope.weekStartDate && kendo.parseDate(itemfeedback.recurrencesStartTime) <= $scope.weekEndDate) {
                                                                                $scope.totalProfileTrainingSpentHoursWeek += itemfeedback.timeSpentMinutes;
                                                                            }
                                                                            if ($scope.selectedFromMonth) {
                                                                                var startOfMonth = moment($scope.selectedFromMonth).startOf('month')._d;
                                                                                var endOfMonth = moment($scope.selectedFromMonth).endOf('month')._d;
                                                                                if (kendo.parseDate(itemfeedback.recurrencesStartTime) >= startOfMonth && kendo.parseDate(itemfeedback.recurrencesStartTime) <= endOfMonth) {
                                                                                    $scope.totalFilteredProfileTrainingSpentHours += itemfeedback.timeSpentMinutes;
                                                                                    $scope.trainingTimes[$scope.trainingTimes.length - 1].filteredSpentTime += itemfeedback.timeSpentMinutes;
                                                                                }
                                                                            }
                                                                        }
                                                                        $scope.totalProfileTrainingSpentHours += itemfeedback.timeSpentMinutes;
                                                                    }

                                                                }
                                                            }
                                                        });
                                                        var occurrences = event.expand(kendo.parseDate(trainingItem.startDate), kendo.parseDate(trainingItem.endDate));
                                                        angular.forEach(occurrences, function (item1, index1) {
                                                            if (trainingItem.durationMetricId == 1) {
                                                                //Hour
                                                                if ($scope.selectedFromMonth) {
                                                                    var startOfMonth = moment($scope.selectedFromMonth).startOf('month')._d;
                                                                    var endOfMonth = moment($scope.selectedFromMonth).endOf('month')._d;
                                                                    if (kendo.parseDate(item1.start) >= startOfMonth && kendo.parseDate(item1.start) <= endOfMonth) {
                                                                        if (trainingItem.userId == null) {
                                                                            $scope.trainingTimes[$scope.trainingTimes.length - 1].filteredTotalPlanTime += (trainingItem.duration * 60);
                                                                        }
                                                                    }
                                                                }
                                                                $scope.trainingTimes[$scope.trainingTimes.length - 1].totalTime += (trainingItem.duration * 60);
                                                                if (kendo.parseDate(item1.start) >= $scope.dayStartDate && kendo.parseDate(item1.start) <= $scope.dayEndDate) {
                                                                    if (trainingItem.userId == null) {
                                                                        $scope.trainingProfileHoursToday += (trainingItem.duration * 60);
                                                                    }
                                                                }
                                                                if (kendo.parseDate(item1.start) >= $scope.weekStartDate && kendo.parseDate(item1.start) <= $scope.weekEndDate) {
                                                                    if (trainingItem.userId == null) {
                                                                        $scope.trainingProfileHoursWeek += (trainingItem.duration * 60);
                                                                    }
                                                                }
                                                                if (trainingItem.userId == null) {
                                                                    $scope.totalProfileTrainingHours += (trainingItem.duration * 60);
                                                                    if ($scope.selectedFromMonth) {
                                                                        var startOfMonth = moment($scope.selectedFromMonth).startOf('month')._d;
                                                                        var endOfMonth = moment($scope.selectedFromMonth).endOf('month')._d;
                                                                        if (kendo.parseDate(item1.start) >= startOfMonth && kendo.parseDate(item1.start) <= endOfMonth) {
                                                                            $scope.totalFilteredProfileTrainingHours += (trainingItem.duration * 60);
                                                                        }
                                                                    }
                                                                } else {
                                                                    $scope.totalOwnTrainingHours += (trainingItem.duration * 60);
                                                                }
                                                            }
                                                            if (trainingItem.durationMetricId == 3) {
                                                                //Minutes
                                                                if ($scope.selectedFromMonth) {
                                                                    var startOfMonth = moment($scope.selectedFromMonth).startOf('month')._d;
                                                                    var endOfMonth = moment($scope.selectedFromMonth).endOf('month')._d;
                                                                    if (kendo.parseDate(item1.start) >= startOfMonth && kendo.parseDate(item1.start) <= endOfMonth) {
                                                                        if (trainingItem.userId == null) {
                                                                            $scope.trainingTimes[$scope.trainingTimes.length - 1].filteredTotalPlanTime += (trainingItem.duration);
                                                                        }
                                                                    }
                                                                }
                                                                $scope.trainingTimes[$scope.trainingTimes.length - 1].totalTime += (trainingItem.duration);
                                                                if (kendo.parseDate(item1.start) >= $scope.dayStartDate && kendo.parseDate(item1.start) <= $scope.dayEndDate) {
                                                                    if (trainingItem.userId == null) {
                                                                        $scope.trainingProfileHoursToday += (trainingItem.duration);
                                                                    }

                                                                }
                                                                if (kendo.parseDate(item1.start) >= $scope.weekStartDate && kendo.parseDate(item1.start) <= $scope.weekEndDate) {
                                                                    if (trainingItem.userId == null) {
                                                                        $scope.trainingProfileHoursWeek += (trainingItem.duration);
                                                                    }
                                                                }
                                                                if (trainingItem.userId == null) {
                                                                    $scope.totalProfileTrainingHours += (trainingItem.duration);
                                                                    if ($scope.selectedFromMonth) {
                                                                        var startOfMonth = moment($scope.selectedFromMonth).startOf('month')._d;
                                                                        var endOfMonth = moment($scope.selectedFromMonth).endOf('month')._d;
                                                                        if (kendo.parseDate(item1.start) >= startOfMonth && kendo.parseDate(item1.start) <= endOfMonth) {
                                                                            $scope.totalFilteredProfileTrainingHours += (trainingItem.duration);
                                                                        }
                                                                    }
                                                                }
                                                            }
                                                            if (trainingItem.durationMetricId == 4) {
                                                                //Seconds
                                                                if ($scope.selectedFromMonth) {
                                                                    var startOfMonth = moment($scope.selectedFromMonth).startOf('month')._d;
                                                                    var endOfMonth = moment($scope.selectedFromMonth).endOf('month')._d;
                                                                    if (kendo.parseDate(item1.start) >= startOfMonth && kendo.parseDate(item1.start) <= endOfMonth) {
                                                                        if (trainingItem.userId == null) {
                                                                            $scope.trainingTimes[$scope.trainingTimes.length - 1].filteredTotalPlanTime += (trainingItem.duration / 60);
                                                                        }
                                                                    }
                                                                }
                                                                $scope.trainingTimes[$scope.trainingTimes.length - 1].totalTime += (trainingItem.duration / 60);
                                                                if (kendo.parseDate(item1.start) >= $scope.dayStartDate && kendo.parseDate(item1.start) <= $scope.dayEndDate) {
                                                                    if (trainingItem.userId == null) {
                                                                        $scope.trainingProfileHoursToday += (trainingItem.duration / 60);
                                                                    }
                                                                }
                                                                if (kendo.parseDate(item1.start) >= $scope.weekStartDate && kendo.parseDate(item1.start) <= $scope.weekEndDate) {
                                                                    if (trainingItem.userId == null) {
                                                                        $scope.trainingProfileHoursWeek += (trainingItem.duration / 60);
                                                                    }

                                                                }
                                                                if (trainingItem.userId == null) {
                                                                    $scope.totalProfileTrainingHours += (trainingItem.duration / 60);

                                                                    if ($scope.selectedFromMonth) {
                                                                        var startOfMonth = moment($scope.selectedFromMonth).startOf('month')._d;
                                                                        var endOfMonth = moment($scope.selectedFromMonth).endOf('month')._d;
                                                                        if (kendo.parseDate(item1.start) >= startOfMonth && kendo.parseDate(item1.start) <= endOfMonth) {
                                                                            $scope.totalFilteredProfileTrainingHours += (trainingItem.duration / 60);
                                                                        }
                                                                    }
                                                                }
                                                            }
                                                            if (trainingItem.durationMetricId == 5) {
                                                                //Days
                                                                if ($scope.selectedFromMonth) {
                                                                    var startOfMonth = moment($scope.selectedFromMonth).startOf('month')._d;
                                                                    var endOfMonth = moment($scope.selectedFromMonth).endOf('month')._d;
                                                                    if (kendo.parseDate(item1.start) >= startOfMonth && kendo.parseDate(item1.start) <= endOfMonth) {
                                                                        if (trainingItem.userId == null) {
                                                                            $scope.trainingTimes[$scope.trainingTimes.length - 1].filteredTotalPlanTime += (trainingItem.duration * 1440);
                                                                        }
                                                                    }
                                                                }
                                                                $scope.trainingTimes[$scope.trainingTimes.length - 1].totalTime += (trainingItem.duration * 1440);
                                                                if (kendo.parseDate(item1.start) >= $scope.dayStartDate && kendo.parseDate(item1.start) <= $scope.dayEndDate) {
                                                                    if (trainingItem.userId == null) {
                                                                        $scope.trainingProfileHoursToday += (trainingItem.duration * 1440);
                                                                    }
                                                                }
                                                                if (kendo.parseDate(item1.start) >= $scope.weekStartDate && kendo.parseDate(item1.start) <= $scope.weekEndDate) {
                                                                    if (trainingItem.userId == null) {
                                                                        $scope.trainingProfileHoursWeek += (trainingItem.duration * 1440);
                                                                    }
                                                                }
                                                                if (trainingItem.userId == null) {
                                                                    $scope.totalProfileTrainingHours += (trainingItem.duration * 1440);

                                                                    if ($scope.selectedFromMonth) {
                                                                        var startOfMonth = moment($scope.selectedFromMonth).startOf('month')._d;
                                                                        var endOfMonth = moment($scope.selectedFromMonth).endOf('month')._d;
                                                                        if (kendo.parseDate(item1.start) >= startOfMonth && kendo.parseDate(item1.start) <= endOfMonth) {
                                                                            $scope.totalFilteredProfileTrainingHours += (trainingItem.duration * 1440);
                                                                        }
                                                                    }
                                                                }
                                                            }
                                                            startDates.push(item1.start)
                                                        });
                                                        var sortedStartDate = _.sortBy(startDates, function (dateItem) {
                                                            return -(kendo.parseDate(dateItem).getTime());
                                                        });

                                                        $scope.trainingStartDate = sortedStartDate[sortedStartDate.length - 1];
                                                        $scope.trainingEndDate = sortedStartDate[0];
                                                        $scope.trainingMonths = getMonthsBetweenDate($scope.trainingStartDate, $scope.trainingEndDate);
                                                        $scope.calculatedAt = new Date();
                                                        $scope.isTimeCalculated = true;
                                                        //$scope.totalOwnTrainingTodayResult = $scope.trainingHourResult($scope.totalOwnTrainingSpentHoursToday, $scope.trainingOwnHoursToday)
                                                        $scope.totalProfileTrainingTodayResult = $scope.trainingHourResult($scope.totalProfileTrainingSpentHoursToday, $scope.trainingProfileHoursToday)
                                                        //$scope.totalOwnTrainingWeekResult = $scope.trainingHourResult($scope.totalOwnTrainingSpentHoursWeek, $scope.trainingOwnHoursWeek)
                                                        $scope.totalProfileTrainingWeekResult = $scope.trainingHourResult($scope.totalProfileTrainingSpentHoursWeek, $scope.trainingProfileHoursWeek)
                                                        //$scope.totalOwnTrainingResult = $scope.trainingHourResult($scope.totalOwnTrainingSpentHours, $scope.totalOwnTrainingHours)
                                                        $scope.totalProfileTrainingResult = $scope.trainingHourResult($scope.totalProfileTrainingSpentHours, $scope.totalProfileTrainingHours)
                                                        $scope.totalFilteredProfileTrainingResult = $scope.trainingHourResult($scope.totalFilteredProfileTrainingSpentHours, $scope.totalFilteredProfileTrainingHours);
                                                    }
                                                });
                                            }
                                        });
                                    }
                                }

                                var isCompareStageContinue = false;
                                var comparePreviousStageItem = null;

                                if ($scope.selectedCompareProfileStage) {
                                    if (stageItem.id == $scope.selectedCompareProfileStage.id) {
                                        isCompareStageContinue = true;
                                    }
                                }

                                if (isCompareStageContinue) {
                                    if (stageIndex > 0) {
                                        comparePreviousStageItem = activeProfile.ipsTrainingDiaryStages[stageIndex - 1];
                                    }
                                    if (stageItem.evaluationAgreement) {
                                        _.forEach(stageItem.evaluationAgreement, function (evaluationAgreementItem) {
                                            if (evaluationAgreementItem.question) {
                                                var selectedMilestoneAgreementGoal = null;
                                                if (evaluationAgreementItem.milestoneAgreementGoals) {
                                                    selectedMilestoneAgreementGoal = _.find(evaluationAgreementItem.milestoneAgreementGoals, function (milestoneAgreementGoalItem) {
                                                        return milestoneAgreementGoalItem.stageId == stageItem.id;
                                                    });
                                                }
                                                _.forEach(evaluationAgreementItem.question.skills, function (skillItem) {
                                                    if (evaluationAgreementItem.kpiType == 1) {

                                                        debugger; var previousStageScore = 0;
                                                        if (comparePreviousStageItem) {
                                                            _.forEach(comparePreviousStageItem.evaluationAgreement, function (previousEvaluationAgreementItem) {
                                                                if (previousEvaluationAgreementItem.kpiType == 1) {
                                                                    if (previousEvaluationAgreementItem.question) {
                                                                        _.forEach(previousEvaluationAgreementItem.question.skills, function (previousSkillItem) {
                                                                            if (previousSkillItem.id == skillItem.id) {
                                                                                previousStageScore = previousEvaluationAgreementItem.finalScore;
                                                                                return (false);
                                                                            }
                                                                        })
                                                                    }
                                                                }

                                                            })

                                                        }

                                                        $scope.compareWeakKPIs.push({
                                                            skillName: skillItem.name,
                                                            skillId: skillItem.id,
                                                            totalPlanTime: 0,
                                                            spentTime: 0,
                                                            totalAgreegatedPlanTime: 0,
                                                            agreegatedSpentTime: 0,
                                                            startScore: 0,
                                                            currentStageGoal: selectedMilestoneAgreementGoal ? selectedMilestoneAgreementGoal.goal : 0,
                                                            currentStageScore: evaluationAgreementItem.finalScore,
                                                            previousStageScore: previousStageScore,
                                                            stageProgress: 0,
                                                            overallProgress: 0,
                                                            stageTimeProgress: 0,
                                                            stagePerformance: 0,
                                                            overallPerformance: 0,
                                                            stageTimePerformance: 0,
                                                            stageAgreegatedTimeProgress: 0,
                                                            stageAgreegatedTimePerformance: 0,
                                                        });
                                                    } else if (evaluationAgreementItem.kpiType == 2) {

                                                        var previousStageScore = 0;
                                                        if (comparePreviousStageItem) {
                                                            _.forEach(comparePreviousStageItem.evaluationAgreement, function (previousEvaluationAgreementItem) {
                                                                if (previousEvaluationAgreementItem.kpiType == 2) {
                                                                    if (previousEvaluationAgreementItem.question) {
                                                                        _.forEach(previousEvaluationAgreementItem.question.skills, function (previousSkillItem) {
                                                                            if (previousSkillItem.id == skillItem.id) {
                                                                                previousStageScore = previousEvaluationAgreementItem.finalScore;
                                                                                return (false);
                                                                            }
                                                                        })
                                                                    }
                                                                }

                                                            })

                                                        }
                                                        $scope.compareStrongKPIs.push({
                                                            skillName: skillItem.name,
                                                            skillId: skillItem.id,
                                                            totalPlanTime: 0,
                                                            spentTime: 0,
                                                            totalAgreegatedPlanTime: 0,
                                                            agreegatedSpentTime: 0,
                                                            startScore: 0,
                                                            currentStageGoal: selectedMilestoneAgreementGoal ? selectedMilestoneAgreementGoal.goal : 0,
                                                            currentStageScore: evaluationAgreementItem.finalScore,
                                                            previousStageScore: previousStageScore,
                                                            stageProgress: 0,
                                                            overallProgress: 0,
                                                            stageTimeProgress: 0,
                                                            stagePerformance: 0,
                                                            overallPerformance: 0,
                                                            stageTimePerformance: 0,
                                                            stageAgreegatedTimeProgress: 0,
                                                            stageAgreegatedTimePerformance: 0,
                                                        });
                                                    }
                                                })
                                            }
                                            if (evaluationAgreementItem.trainings) {
                                                _.forEach(evaluationAgreementItem.trainings, function (trainingItem) {
                                                    if (trainingItem.id > 0) {
                                                        var event = new kendo.data.SchedulerEvent({
                                                            id: trainingItem.id,
                                                            description: trainingItem.additionalInfo,
                                                            title: trainingItem.name,
                                                            start: kendo.parseDate(trainingItem.startDate),
                                                            //item1.start,
                                                            isAllDay: moment(kendo.parseDate(trainingItem.startDate)).format("HHmmss") == "000000",
                                                            end: kendo.parseDate(trainingItem.endDate),
                                                            recurrenceRule: trainingItem.frequency,
                                                        });
                                                        var skillId = null;
                                                        if (trainingItem.skillId) {
                                                            skillId = trainingItem.skillId;
                                                        } else if (trainingItem.skills.length > 0) {
                                                            skillId = trainingItem.skills[0].id;
                                                        }
                                                        $scope.compareTrainingTimes.push({
                                                            id: trainingItem.id,
                                                            skillId: skillId,
                                                            totalTime: 0,
                                                            spentTime: 0
                                                        })
                                                        _.each(trainingItem.trainingFeedbacks, function (itemfeedback) {
                                                            if (itemfeedback.evaluatorId == null) {
                                                                var isTrainingFinished = true;
                                                                if (itemfeedback.isParticipantPaused == true) {
                                                                    var finishedTraining = _.filter(trainingItem.trainingFeedbacks, function (feedbackItem) {
                                                                        return itemfeedback.recurrencesStartTime == feedbackItem.recurrencesStartTime && itemfeedback.recurrencesEndTime == feedbackItem.recurrencesEndTime && feedbackItem.isParticipantPaused == false;
                                                                    });
                                                                    if (finishedTraining.length > 0) {
                                                                        isTrainingFinished = true
                                                                    } else {
                                                                        isTrainingFinished = false;
                                                                    }
                                                                }
                                                                if (!(itemfeedback.isParticipantPaused == true && isTrainingFinished == true)) {
                                                                    if (trainingItem.userId == null) {
                                                                        $scope.compareTrainingTimes[$scope.compareTrainingTimes.length - 1].spentTime += itemfeedback.timeSpentMinutes;
                                                                        if (itemfeedback.recurrencesStartTime) {
                                                                            if (kendo.parseDate(itemfeedback.recurrencesStartTime) >= $scope.dayStartDate && kendo.parseDate(itemfeedback.recurrencesStartTime) <= $scope.dayEndDate) {
                                                                                $scope.compareTotalProfileTrainingSpentHoursToday += (itemfeedback.timeSpentMinutes);
                                                                            }
                                                                            if (kendo.parseDate(itemfeedback.recurrencesStartTime) >= $scope.weekStartDate && kendo.parseDate(itemfeedback.recurrencesStartTime) <= $scope.weekEndDate) {
                                                                                $scope.compareTotalProfileTrainingSpentHoursWeek += itemfeedback.timeSpentMinutes;
                                                                            }
                                                                        }
                                                                        $scope.compareTotalProfileTrainingSpentHours += itemfeedback.timeSpentMinutes;
                                                                    } else {
                                                                        $scope.compareTrainingTimes[$scope.compareTrainingTimes.length - 1].spentTime += itemfeedback.timeSpentMinutes;
                                                                        if (itemfeedback.recurrencesStartTime) {
                                                                            if (kendo.parseDate(itemfeedback.recurrencesStartTime) >= $scope.dayStartDate && kendo.parseDate(itemfeedback.recurrencesStartTime) <= $scope.dayEndDate) {
                                                                                $scope.compareTotalOwnTrainingSpentHoursToday += (itemfeedback.timeSpentMinutes);
                                                                            }
                                                                            if (kendo.parseDate(itemfeedback.recurrencesStartTime) >= $scope.weekStartDate && kendo.parseDate(itemfeedback.recurrencesStartTime) <= $scope.weekEndDate) {
                                                                                $scope.compareTotalOwnTrainingSpentHoursWeek += itemfeedback.timeSpentMinutes;
                                                                            }
                                                                        }
                                                                        $scope.compareTotalOwnTrainingSpentHours += itemfeedback.timeSpentMinutes;
                                                                    }
                                                                }
                                                            }
                                                        });
                                                        var occurrences = event.expand(kendo.parseDate(trainingItem.startDate), kendo.parseDate(trainingItem.endDate));
                                                        angular.forEach(occurrences, function (item1, index1) {
                                                            if (trainingItem.durationMetricId == 1) {
                                                                //Hour
                                                                $scope.compareTrainingTimes[$scope.compareTrainingTimes.length - 1].totalTime += (trainingItem.duration * 60);
                                                                if (kendo.parseDate(item1.start) >= $scope.dayStartDate && kendo.parseDate(item1.start) <= $scope.dayEndDate) {
                                                                    if (trainingItem.userId == null) {
                                                                        $scope.trainingProfileHoursToday += (trainingItem.duration * 60);
                                                                    } else {
                                                                        $scope.trainingOwnHoursToday += (trainingItem.duration * 60);
                                                                    }
                                                                }
                                                                if (kendo.parseDate(item1.start) >= $scope.weekStartDate && kendo.parseDate(item1.start) <= $scope.weekEndDate) {
                                                                    if (trainingItem.userId == null) {
                                                                        $scope.trainingProfileHoursWeek += (trainingItem.duration * 60);
                                                                    } else {
                                                                        $scope.trainingOwnHoursWeek += (trainingItem.duration * 60);
                                                                    }
                                                                }
                                                                if (trainingItem.userId == null) {
                                                                    $scope.compareTotalProfileTrainingHours += (trainingItem.duration * 60);
                                                                } else {
                                                                    $scope.compareTotalOwnTrainingHours += (trainingItem.duration * 60);
                                                                }
                                                            }
                                                            if (trainingItem.durationMetricId == 3) {
                                                                //Minutes
                                                                $scope.compareTrainingTimes[$scope.compareTrainingTimes.length - 1].totalTime += (trainingItem.duration);
                                                                if (kendo.parseDate(item1.start) >= $scope.dayStartDate && kendo.parseDate(item1.start) <= $scope.dayEndDate) {
                                                                    if (trainingItem.userId == null) {
                                                                        $scope.trainingProfileHoursToday += (trainingItem.duration);
                                                                    }
                                                                }
                                                                if (kendo.parseDate(item1.start) >= $scope.weekStartDate && kendo.parseDate(item1.start) <= $scope.weekEndDate) {
                                                                    if (trainingItem.userId == null) {
                                                                        $scope.trainingProfileHoursWeek += (trainingItem.duration);
                                                                    }
                                                                }
                                                                if (trainingItem.userId == null) {
                                                                    $scope.compareTotalProfileTrainingHours += (trainingItem.duration);
                                                                }
                                                            }
                                                            if (trainingItem.durationMetricId == 4) {
                                                                //Seconds
                                                                $scope.trainingTimes[$scope.trainingTimes.length - 1].totalTime += (trainingItem.duration / 60);
                                                                if (kendo.parseDate(item1.start) >= $scope.dayStartDate && kendo.parseDate(item1.start) <= $scope.dayEndDate) {
                                                                    if (trainingItem.userId == null) {
                                                                        $scope.trainingProfileHoursToday += (trainingItem.duration / 60);
                                                                    }
                                                                }
                                                                if (kendo.parseDate(item1.start) >= $scope.weekStartDate && kendo.parseDate(item1.start) <= $scope.weekEndDate) {
                                                                    if (trainingItem.userId == null) {
                                                                        $scope.trainingProfileHoursWeek += (trainingItem.duration / 60);
                                                                    }
                                                                }
                                                                if (trainingItem.userId == null) {
                                                                    $scope.compareTotalProfileTrainingHours += (trainingItem.duration / 60);
                                                                }
                                                            }
                                                            if (trainingItem.durationMetricId == 5) {
                                                                //Days
                                                                $scope.trainingTimes[$scope.trainingTimes.length - 1].totalTime += (trainingItem.duration * 1440);
                                                                if (kendo.parseDate(item1.start) >= $scope.dayStartDate && kendo.parseDate(item1.start) <= $scope.dayEndDate) {
                                                                    if (trainingItem.userId == null) {
                                                                        $scope.trainingProfileHoursToday += (trainingItem.duration * 1440);
                                                                    }

                                                                }
                                                                if (kendo.parseDate(item1.start) >= $scope.weekStartDate && kendo.parseDate(item1.start) <= $scope.weekEndDate) {
                                                                    if (trainingItem.userId == null) {
                                                                        $scope.trainingProfileHoursWeek += (trainingItem.duration * 1440);
                                                                    }

                                                                }
                                                                if (trainingItem.userId == null) {
                                                                    $scope.compareTotalProfileTrainingHours += (trainingItem.duration * 1440);
                                                                }

                                                            }
                                                            startDates.push(item1.start)
                                                        });
                                                        var sortedStartDate = _.sortBy(startDates, function (dateItem) {
                                                            return -(kendo.parseDate(dateItem).getTime());
                                                        });
                                                        $scope.trainingStartDate = sortedStartDate[sortedStartDate.length - 1];
                                                        $scope.trainingEndDate = sortedStartDate[0];
                                                        $scope.calculatedAt = new Date();
                                                        $scope.isTimeCalculated = true;
                                                        $scope.compareTotalProfileTrainingTodayResult = $scope.trainingHourResult($scope.compareTotalProfileTrainingSpentHoursToday, $scope.trainingProfileHoursToday)
                                                        $scope.compareTotalProfileTrainingWeekResult = $scope.trainingHourResult($scope.compareTotalProfileTrainingSpentHoursWeek, $scope.trainingProfileHoursWeek)
                                                        $scope.compareTotalProfileTrainingResult = $scope.trainingHourResult($scope.compareTotalProfileTrainingSpentHours, $scope.compareTotalProfileTrainingHours)
                                                    }
                                                });
                                            }
                                        });
                                    }
                                }

                            });
                        }
                        $scope.isTimeCalculated = true;

                        var startStage = null;
                        _.each(activeProfile.ipsTrainingDiaryStages, function (stageItem) {
                            _.each(stageItem.evaluationAgreement, function (evaluationAgreementItem) {
                                var isStageGoalExist = _.any(evaluationAgreementItem.milestoneAgreementGoals, function (goalItem) {
                                    return goalItem.stageId == stageItem.id;
                                });
                                if (!isStageGoalExist) {
                                    startStage = stageItem;
                                    return (false);
                                }
                            });
                        })

                        $scope.isStartStageSelected = false;
                        if (startStage.id == $scope.selectedProfileStage.id) {
                            $scope.isStartStageSelected = true;
                            $scope.selectedProgressViewType = _.find($scope.progressViewTypeOptions, function (item) {
                                return item.id == $scope.progressViewTypeEnum.StageScoreProgress;
                            });
                        }
                        $scope.isAllStageSelected = false;
                        if ($scope.selectedProfileStage.id == 0) {
                            $scope.isAllStageSelected = true;
                            $scope.selectedProgressViewType = _.find($scope.progressViewTypeOptions, function (item) {
                                return item.id == $scope.progressViewTypeEnum.StageScoreProgress;
                            });
                            $scope.weakKPIs = _.unique($scope.weakKPIs, function (item) {
                                return item.skillId
                            });
                            $scope.strongKPIs = _.unique($scope.strongKPIs, function (item) {
                                return item.skillId
                            });
                        }
                        _.each($scope.strongKPIs, function (item) {
                            var strongKPITrainingTimes = _.filter($scope.trainingTimes, function (trainingTimeItem) {
                                return trainingTimeItem.skillId == item.skillId;
                            });
                            _.each(strongKPITrainingTimes, function (strongKPITrainingTimeItem) {
                                item.totalPlanTime += strongKPITrainingTimeItem.totalTime;
                                item.spentTime += strongKPITrainingTimeItem.spentTime;
                                item.filteredSpentTime += strongKPITrainingTimeItem.filteredSpentTime;
                                item.filteredTotalPlanTime += strongKPITrainingTimeItem.filteredTotalPlanTime;
                            })

                            _.each(startStage.evaluationAgreement, function (evaluationAgreementItem) {
                                if (evaluationAgreementItem.question) {
                                    _.forEach(evaluationAgreementItem.question.skills, function (skillItem) {
                                        if (skillItem.id == item.skillId) {
                                            item.startScore = evaluationAgreementItem.finalScore;
                                            return (false);
                                        }
                                    });
                                }
                            });

                            // Calculate  Agreegated Time
                            _.each(activeProfile.ipsTrainingDiaryStages, function (stageItem) {
                                if (stageItem.id <= $scope.selectedProfileStage.id) {
                                    _.each(stageItem.evaluationAgreement, function (evaluationAgreementItem) {
                                        if (evaluationAgreementItem.trainings) {

                                            _.forEach(evaluationAgreementItem.trainings, function (trainingItem) {
                                                if (trainingItem.id > 0) {
                                                    var skillId = null;
                                                    if (trainingItem.skillId) {
                                                        skillId = trainingItem.skillId;
                                                    } else if (trainingItem.skills.length > 0) {
                                                        skillId = trainingItem.skills[0].id;
                                                    }
                                                    if (item.skillId == skillId) {
                                                        var event = new kendo.data.SchedulerEvent({
                                                            id: trainingItem.id,
                                                            description: trainingItem.additionalInfo,
                                                            title: trainingItem.name,
                                                            start: kendo.parseDate(trainingItem.startDate),
                                                            //item1.start,
                                                            isAllDay: moment(kendo.parseDate(trainingItem.startDate)).format("HHmmss") == "000000",
                                                            end: kendo.parseDate(trainingItem.endDate),
                                                            recurrenceRule: trainingItem.frequency,
                                                        });

                                                        _.each(trainingItem.trainingFeedbacks, function (itemfeedback) {
                                                            if (itemfeedback.evaluatorId == null) {
                                                                var isTrainingFinished = true;
                                                                if (itemfeedback.isParticipantPaused == true) {
                                                                    var finishedTraining = _.filter(trainingItem.trainingFeedbacks, function (feedbackItem) {
                                                                        return itemfeedback.recurrencesStartTime == feedbackItem.recurrencesStartTime && itemfeedback.recurrencesEndTime == feedbackItem.recurrencesEndTime && feedbackItem.isParticipantPaused == false;
                                                                    });
                                                                    if (finishedTraining.length > 0) {
                                                                        isTrainingFinished = true
                                                                    } else {
                                                                        isTrainingFinished = false;
                                                                    }
                                                                }
                                                                if (!(itemfeedback.isParticipantPaused == true && isTrainingFinished == true)) {
                                                                    if (trainingItem.userId == null) {
                                                                        item.agreegatedSpentTime += itemfeedback.timeSpentMinutes;
                                                                    } else {
                                                                        item.agreegatedSpentTime += itemfeedback.timeSpentMinutes;
                                                                    }
                                                                }
                                                            }
                                                        });

                                                        var occurrences = event.expand(kendo.parseDate(trainingItem.startDate), kendo.parseDate(trainingItem.endDate));
                                                        angular.forEach(occurrences, function (item1, index1) {
                                                            if (trainingItem.durationMetricId == 1) {
                                                                //Hour
                                                                item.totalAgreegatedPlanTime += (trainingItem.duration * 60);
                                                            }
                                                            if (trainingItem.durationMetricId == 3) {
                                                                //Minutes
                                                                item.totalAgreegatedPlanTime += (trainingItem.duration);

                                                            }
                                                            if (trainingItem.durationMetricId == 4) {
                                                                //Seconds
                                                                item.totalAgreegatedPlanTime += (trainingItem.duration / 60);

                                                            }
                                                            if (trainingItem.durationMetricId == 5) {
                                                                //Days
                                                                item.totalAgreegatedPlanTime += (trainingItem.duration * 1440);
                                                            }
                                                        });
                                                        //item.totalAgreegatedPlanTime += 0
                                                    }

                                                }
                                            })

                                        }
                                    });
                                }
                            })

                            item.stageTimeProgress = $scope.trainingTimeProgressPercentage(item.spentTime, item.totalPlanTime);
                            item.filteredStageTimeProgress = $scope.trainingTimeProgressPercentage(item.filteredSpentTime, item.filteredTotalPlanTime);
                            item.stageProgress = $scope.stageProgressPercentage(item.currentStageScore, item.previousStageScore);
                            item.overallProgress = $scope.overallScoreProgressPercentage(item.startScore, item.currentStageScore);

                            item.stageAgreegatedTimePerformance = $scope.trainingTimePerformancePercentage(item.agreegatedSpentTime, item.totalAgreegatedPlanTime);
                            item.stageTimePerformance = $scope.trainingTimePerformancePercentage(item.spentTime, item.totalPlanTime);
                            item.filteredStageTimePerformance = $scope.trainingTimePerformancePercentage(item.filteredSpentTime, item.filteredTotalPlanTime);
                            item.stagePerformance = $scope.stagePerformancePercentage(item.currentStageScore, item.currentStageGoal);
                            item.overallPerformance = $scope.overallScorePerformancePercentage(item.startScore, item.currentStageScore);
                        });
                        _.each($scope.weakKPIs, function (item) {
                            var weakKPITrainingTimes = _.filter($scope.trainingTimes, function (trainingTimeItem) {
                                return trainingTimeItem.skillId == item.skillId;
                            });
                            _.each(weakKPITrainingTimes, function (weakKPITrainingTimeItem) {
                                item.totalPlanTime += weakKPITrainingTimeItem.totalTime;
                                item.spentTime += weakKPITrainingTimeItem.spentTime;
                                item.filteredSpentTime += weakKPITrainingTimeItem.filteredSpentTime;
                                item.filteredTotalPlanTime += weakKPITrainingTimeItem.filteredTotalPlanTime;
                            })
                            _.each(startStage.evaluationAgreement, function (evaluationAgreementItem) {
                                if (evaluationAgreementItem.question) {
                                    _.forEach(evaluationAgreementItem.question.skills, function (skillItem) {
                                        if (skillItem.id == item.skillId) {
                                            item.startScore = evaluationAgreementItem.finalScore;
                                            return (false);
                                        }
                                    });
                                }
                            });

                            // Calculate  Agreegated Time
                            _.each(activeProfile.ipsTrainingDiaryStages, function (stageItem) {
                                if (stageItem.id <= $scope.selectedProfileStage.id) {
                                    _.each(stageItem.evaluationAgreement, function (evaluationAgreementItem) {
                                        if (evaluationAgreementItem.trainings) {
                                            _.forEach(evaluationAgreementItem.trainings, function (trainingItem) {
                                                if (trainingItem.id > 0) {
                                                    var skillId = null;
                                                    if (trainingItem.skillId) {
                                                        skillId = trainingItem.skillId;
                                                    } else if (trainingItem.skills.length > 0) {
                                                        skillId = trainingItem.skills[0].id;
                                                    }
                                                    if (item.skillId == skillId) {
                                                        var event = new kendo.data.SchedulerEvent({
                                                            id: trainingItem.id,
                                                            description: trainingItem.additionalInfo,
                                                            title: trainingItem.name,
                                                            start: kendo.parseDate(trainingItem.startDate),
                                                            //item1.start,
                                                            isAllDay: moment(kendo.parseDate(trainingItem.startDate)).format("HHmmss") == "000000",
                                                            end: kendo.parseDate(trainingItem.endDate),
                                                            recurrenceRule: trainingItem.frequency,
                                                        });

                                                        _.each(trainingItem.trainingFeedbacks, function (itemfeedback) {
                                                            if (itemfeedback.evaluatorId == null) {
                                                                var isTrainingFinished = true;
                                                                if (itemfeedback.isParticipantPaused == true) {
                                                                    var finishedTraining = _.filter(trainingItem.trainingFeedbacks, function (feedbackItem) {
                                                                        return itemfeedback.recurrencesStartTime == feedbackItem.recurrencesStartTime && itemfeedback.recurrencesEndTime == feedbackItem.recurrencesEndTime && feedbackItem.isParticipantPaused == false;
                                                                    });
                                                                    if (finishedTraining.length > 0) {
                                                                        isTrainingFinished = true
                                                                    } else {
                                                                        isTrainingFinished = false;
                                                                    }
                                                                }
                                                                if (!(itemfeedback.isParticipantPaused == true && isTrainingFinished == true)) {
                                                                    if (trainingItem.userId == null) {
                                                                        item.agreegatedSpentTime += itemfeedback.timeSpentMinutes;
                                                                    } else {
                                                                        item.agreegatedSpentTime += itemfeedback.timeSpentMinutes;
                                                                    }
                                                                }
                                                            }
                                                        });

                                                        var occurrences = event.expand(kendo.parseDate(trainingItem.startDate), kendo.parseDate(trainingItem.endDate));
                                                        angular.forEach(occurrences, function (item1, index1) {
                                                            if (trainingItem.durationMetricId == 1) {
                                                                //Hour
                                                                item.totalAgreegatedPlanTime += (trainingItem.duration * 60);
                                                            }
                                                            if (trainingItem.durationMetricId == 3) {
                                                                //Minutes
                                                                item.totalAgreegatedPlanTime += (trainingItem.duration);

                                                            }
                                                            if (trainingItem.durationMetricId == 4) {
                                                                //Seconds
                                                                item.totalAgreegatedPlanTime += (trainingItem.duration / 60);

                                                            }
                                                            if (trainingItem.durationMetricId == 5) {
                                                                //Days
                                                                item.totalAgreegatedPlanTime += (trainingItem.duration * 1440);
                                                            }
                                                        });
                                                        //item.totalAgreegatedPlanTime += 0
                                                    }

                                                }
                                            })
                                        }
                                    });
                                }
                            })

                            item.stageTimeProgress = $scope.trainingTimeProgressPercentage(item.spentTime, item.totalPlanTime);
                            item.stageProgress = $scope.stageProgressPercentage(item.currentStageScore, item.previousStageScore);
                            item.overallProgress = $scope.overallScoreProgressPercentage(item.startScore, item.currentStageScore);
                            item.filteredStageTimeProgress = $scope.trainingTimeProgressPercentage(item.filteredSpentTime, item.filteredTotalPlanTime);
                            item.stageAgreegatedTimePerformance = $scope.trainingTimePerformancePercentage(item.agreegatedSpentTime, item.totalAgreegatedPlanTime);
                            item.stageTimePerformance = $scope.trainingTimePerformancePercentage(item.spentTime, item.totalPlanTime);
                            item.stagePerformance = $scope.stagePerformancePercentage(item.currentStageScore, item.currentStageGoal);
                            item.overallPerformance = $scope.overallScorePerformancePercentage(item.startScore, item.currentStageScore);
                            item.filteredStageTimePerformance = $scope.trainingTimePerformancePercentage(item.filteredSpentTime, item.filteredTotalPlanTime);
                        });

                        _.each($scope.compareStrongKPIs, function (item) {
                            var strongKPITrainingTimes = _.filter($scope.compareTrainingTimes, function (trainingTimeItem) {
                                return trainingTimeItem.skillId == item.skillId;
                            });
                            _.each(strongKPITrainingTimes, function (strongKPITrainingTimeItem) {
                                item.totalPlanTime += strongKPITrainingTimeItem.totalTime;
                                item.spentTime += strongKPITrainingTimeItem.spentTime;
                            })

                            _.each(startStage.evaluationAgreement, function (evaluationAgreementItem) {
                                if (evaluationAgreementItem.question) {
                                    _.forEach(evaluationAgreementItem.question.skills, function (skillItem) {
                                        if (skillItem.id == item.skillId) {
                                            item.startScore = evaluationAgreementItem.finalScore;
                                            return (false);
                                        }
                                    });
                                }
                            });

                            _.each(activeProfile.ipsTrainingDiaryStages, function (stageItem) {
                                if (stageItem.id <= $scope.selectedCompareProfileStage.id) {
                                    _.each(stageItem.evaluationAgreement, function (evaluationAgreementItem) {
                                        if (evaluationAgreementItem.trainings) {

                                            _.forEach(evaluationAgreementItem.trainings, function (trainingItem) {
                                                if (trainingItem.id > 0) {
                                                    var skillId = null;
                                                    if (trainingItem.skillId) {
                                                        skillId = trainingItem.skillId;
                                                    } else if (trainingItem.skills.length > 0) {
                                                        skillId = trainingItem.skills[0].id;
                                                    }
                                                    if (item.skillId == skillId) {
                                                        var event = new kendo.data.SchedulerEvent({
                                                            id: trainingItem.id,
                                                            description: trainingItem.additionalInfo,
                                                            title: trainingItem.name,
                                                            start: kendo.parseDate(trainingItem.startDate),
                                                            //item1.start,
                                                            isAllDay: moment(kendo.parseDate(trainingItem.startDate)).format("HHmmss") == "000000",
                                                            end: kendo.parseDate(trainingItem.endDate),
                                                            recurrenceRule: trainingItem.frequency,
                                                        });

                                                        _.each(trainingItem.trainingFeedbacks, function (itemfeedback) {
                                                            if (itemfeedback.evaluatorId == null) {
                                                                var isTrainingFinished = true;
                                                                if (itemfeedback.isParticipantPaused == true) {
                                                                    var finishedTraining = _.filter(trainingItem.trainingFeedbacks, function (feedbackItem) {
                                                                        return itemfeedback.recurrencesStartTime == feedbackItem.recurrencesStartTime && itemfeedback.recurrencesEndTime == feedbackItem.recurrencesEndTime && feedbackItem.isParticipantPaused == false;
                                                                    });
                                                                    if (finishedTraining.length > 0) {
                                                                        isTrainingFinished = true
                                                                    } else {
                                                                        isTrainingFinished = false;
                                                                    }
                                                                }
                                                                if (!(itemfeedback.isParticipantPaused == true && isTrainingFinished == true)) {
                                                                    if (trainingItem.userId == null) {
                                                                        item.agreegatedSpentTime += itemfeedback.timeSpentMinutes;
                                                                    } else {
                                                                        item.agreegatedSpentTime += itemfeedback.timeSpentMinutes;
                                                                    }
                                                                }
                                                            }
                                                        });

                                                        var occurrences = event.expand(kendo.parseDate(trainingItem.startDate), kendo.parseDate(trainingItem.endDate));
                                                        angular.forEach(occurrences, function (item1, index1) {
                                                            if (trainingItem.durationMetricId == 1) {
                                                                //Hour
                                                                item.totalAgreegatedPlanTime += (trainingItem.duration * 60);
                                                            }
                                                            if (trainingItem.durationMetricId == 3) {
                                                                //Minutes
                                                                item.totalAgreegatedPlanTime += (trainingItem.duration);

                                                            }
                                                            if (trainingItem.durationMetricId == 4) {
                                                                //Seconds
                                                                item.totalAgreegatedPlanTime += (trainingItem.duration / 60);

                                                            }
                                                            if (trainingItem.durationMetricId == 5) {
                                                                //Days
                                                                item.totalAgreegatedPlanTime += (trainingItem.duration * 1440);
                                                            }
                                                        });
                                                        //item.totalAgreegatedPlanTime += 0
                                                    }

                                                }
                                            })

                                        }
                                    });
                                }
                            })

                            item.stageTimeProgress = $scope.trainingTimeProgressPercentage(item.spentTime, item.totalPlanTime);
                            item.stageProgress = $scope.stageProgressPercentage(item.currentStageScore, item.previousStageScore);
                            item.overallProgress = $scope.overallScoreProgressPercentage(item.startScore, item.currentStageScore);

                            item.stageAgreegatedTimePerformance = $scope.trainingTimePerformancePercentage(item.agreegatedSpentTime, item.totalAgreegatedPlanTime);
                            item.stageTimePerformance = $scope.trainingTimePerformancePercentage(item.spentTime, item.totalPlanTime);
                            item.stagePerformance = $scope.stagePerformancePercentage(item.currentStageScore, item.currentStageGoal);
                            item.overallPerformance = $scope.overallScorePerformancePercentage(item.startScore, item.currentStageScore);
                        });
                        _.each($scope.compareWeakKPIs, function (item) {
                            var weakKPITrainingTimes = _.filter($scope.compareTrainingTimes, function (trainingTimeItem) {
                                return trainingTimeItem.skillId == item.skillId;
                            });
                            _.each(weakKPITrainingTimes, function (weakKPITrainingTimeItem) {
                                item.totalPlanTime += weakKPITrainingTimeItem.totalTime;
                                item.spentTime += weakKPITrainingTimeItem.spentTime;
                            })

                            _.each(startStage.evaluationAgreement, function (evaluationAgreementItem) {
                                if (evaluationAgreementItem.question) {
                                    _.forEach(evaluationAgreementItem.question.skills, function (skillItem) {
                                        if (skillItem.id == item.skillId) {
                                            item.startScore = evaluationAgreementItem.finalScore;
                                            return (false);
                                        }
                                    });
                                }
                            });

                            // Calculate  Agreegated Time 
                            _.each(activeProfile.ipsTrainingDiaryStages, function (stageItem) {
                                if (stageItem.id <= $scope.selectedCompareProfileStage.id) {
                                    _.each(stageItem.evaluationAgreement, function (evaluationAgreementItem) {
                                        if (evaluationAgreementItem.trainings) {

                                            _.forEach(evaluationAgreementItem.trainings, function (trainingItem) {
                                                if (trainingItem.id > 0) {
                                                    var skillId = null;
                                                    if (trainingItem.skillId) {
                                                        skillId = trainingItem.skillId;
                                                    } else if (trainingItem.skills.length > 0) {
                                                        skillId = trainingItem.skills[0].id;
                                                    }
                                                    if (item.skillId == skillId) {
                                                        var event = new kendo.data.SchedulerEvent({
                                                            id: trainingItem.id,
                                                            description: trainingItem.additionalInfo,
                                                            title: trainingItem.name,
                                                            start: kendo.parseDate(trainingItem.startDate),
                                                            //item1.start,
                                                            isAllDay: moment(kendo.parseDate(trainingItem.startDate)).format("HHmmss") == "000000",
                                                            end: kendo.parseDate(trainingItem.endDate),
                                                            recurrenceRule: trainingItem.frequency,
                                                        });

                                                        _.each(trainingItem.trainingFeedbacks, function (itemfeedback) {
                                                            if (itemfeedback.evaluatorId == null) {
                                                                var isTrainingFinished = true;
                                                                if (itemfeedback.isParticipantPaused == true) {
                                                                    var finishedTraining = _.filter(trainingItem.trainingFeedbacks, function (feedbackItem) {
                                                                        return itemfeedback.recurrencesStartTime == feedbackItem.recurrencesStartTime && itemfeedback.recurrencesEndTime == feedbackItem.recurrencesEndTime && feedbackItem.isParticipantPaused == false;
                                                                    });
                                                                    if (finishedTraining.length > 0) {
                                                                        isTrainingFinished = true
                                                                    } else {
                                                                        isTrainingFinished = false;
                                                                    }
                                                                }
                                                                if (!(itemfeedback.isParticipantPaused == true && isTrainingFinished == true)) {
                                                                    if (trainingItem.userId == null) {
                                                                        item.agreegatedSpentTime += itemfeedback.timeSpentMinutes;
                                                                    } else {
                                                                        item.agreegatedSpentTime += itemfeedback.timeSpentMinutes;
                                                                    }
                                                                }
                                                            }
                                                        });

                                                        var occurrences = event.expand(kendo.parseDate(trainingItem.startDate), kendo.parseDate(trainingItem.endDate));
                                                        angular.forEach(occurrences, function (item1, index1) {
                                                            if (trainingItem.durationMetricId == 1) {
                                                                //Hour
                                                                item.totalAgreegatedPlanTime += (trainingItem.duration * 60);
                                                            }
                                                            if (trainingItem.durationMetricId == 3) {
                                                                //Minutes
                                                                item.totalAgreegatedPlanTime += (trainingItem.duration);

                                                            }
                                                            if (trainingItem.durationMetricId == 4) {
                                                                //Seconds
                                                                item.totalAgreegatedPlanTime += (trainingItem.duration / 60);

                                                            }
                                                            if (trainingItem.durationMetricId == 5) {
                                                                //Days
                                                                item.totalAgreegatedPlanTime += (trainingItem.duration * 1440);
                                                            }
                                                        });
                                                        //item.totalAgreegatedPlanTime += 0
                                                    }

                                                }
                                            })

                                        }
                                    });
                                }
                            })

                            item.stageTimeProgress = $scope.trainingTimeProgressPercentage(item.spentTime, item.totalPlanTime);
                            item.stageProgress = $scope.stageProgressPercentage(item.currentStageScore, item.previousStageScore);
                            item.overallProgress = $scope.overallScoreProgressPercentage(item.startScore, item.currentStageScore);

                            item.stageAgreegatedTimePerformance = $scope.trainingTimePerformancePercentage(item.agreegatedSpentTime, item.totalAgreegatedPlanTime);
                            item.stageTimePerformance = $scope.trainingTimePerformancePercentage(item.spentTime, item.totalPlanTime);
                            item.stagePerformance = $scope.stagePerformancePercentage(item.currentStageScore, item.currentStageGoal);
                            item.overallPerformance = $scope.overallScorePerformancePercentage(item.startScore, item.currentStageScore);
                        });
                        setTimeout(function () {
                            $scope.selectProgressViewType($scope.selectedProgressViewType.id);
                            $scope.changeTimeManagementViewType($scope.selectedTimeManagementViewType.id)
                        }, 150)
                    } else {
                        $scope.calculatedAt = new Date();
                        $scope.isTimeCalculated = true;
                        //dialogService.showNotification("No data found", "info");
                    }
                })
            }
            function clearResultValues() {
                $scope.selectedProfileStagesData = null;
                $scope.isTimeCalculated = false;
                $scope.strongKPIs = [];
                $scope.weakKPIs = [];
                $scope.compareWeakKPIs = [];
                $scope.compareStrongKPIs = [];
                $scope.calculatedAt = null;
                $scope.trainingTimes = [];
                $scope.compareTrainingTimes = [];
                $scope.totalProfileTrainingSpentHoursToday = 0;
                $scope.totalProfileTrainingSpentHoursWeek = 0;
                $scope.totalProfileTrainingSpentHours = 0;
                $scope.totalFilteredProfileTrainingSpentHours = 0;
                $scope.totalOwnTrainingSpentHoursToday = 0;
                $scope.totalOwnTrainingSpentHoursWeek = 0;
                $scope.totalOwnTrainingSpentHours = 0;
                $scope.trainingProfileHoursToday = 0;
                $scope.trainingProfileHoursWeek = 0;
                $scope.totalProfileTrainingHours = 0;
                $scope.totalFilteredProfileTrainingHours = 0;
                $scope.trainingOwnHoursToday = 0;
                $scope.trainingOwnHoursWeek = 0;
                $scope.totalOwnTrainingHours = 0;
                $scope.totalOwnTrainingTodayResult = 0;
                $scope.totalProfileTrainingTodayResult = 0;
                $scope.totalOwnTrainingWeekResult = 0;
                $scope.totalProfileTrainingWeekResult = 0;
                $scope.totalOwnTrainingResult = 0;
                $scope.totalProfileTrainingResult = 0;
                $scope.totalFilteredProfileTrainingResult = 0;
            }
            $scope.showTrainingFeedbacks = function (kpiType) {
                $scope.feedbacks = [];
                userDashboardManager.getUserProfileStageTrainings(authService.authentication.user.userId, $scope.selectedProjectProfile.id).then(function (data) {
                    if (data.length > 0) {
                        var activeProfile = data[0];
                        if (activeProfile.ipsTrainingDiaryStages) {
                            _.forEach(activeProfile.ipsTrainingDiaryStages, function (stageItem) {
                                var isAllowContinue = false;
                                if ($scope.selectedProfileStage) {
                                    if (stageItem.id == $scope.selectedProfileStage.id) {
                                        isAllowContinue = true;
                                    }
                                }
                                if (isAllowContinue) {
                                    if (stageItem.evaluationAgreement) {
                                        _.forEach(stageItem.evaluationAgreement, function (evaluationAgreementItem) {
                                            if (evaluationAgreementItem.kpiType == kpiType) {
                                                if (evaluationAgreementItem.trainings) {
                                                    var skillName = null;
                                                    _.forEach(evaluationAgreementItem.question.skills, function (skillItem) {
                                                        if (skillItem.name) {
                                                            skillName = skillItem.name;
                                                        }
                                                    })
                                                    _.forEach(evaluationAgreementItem.trainings, function (trainingItem) {
                                                        if (trainingItem.id > 0) {
                                                            _.each(trainingItem.trainingFeedbacks, function (itemfeedback) {
                                                                if (itemfeedback.evaluatorId == null) {
                                                                    $scope.feedbacks.push({
                                                                        "orginalId": itemfeedback.trainingId,
                                                                        "id": itemfeedback.id,
                                                                        "skillName": skillName,
                                                                        "name": trainingItem.name,
                                                                        "start": itemfeedback.recurrencesStartTime ? kendo.parseDate(itemfeedback.recurrencesStartTime) : null,
                                                                        //"/Date(1523511510858)/", //item1.start,
                                                                        "end": kendo.parseDate(itemfeedback.recurrencesEndTime),
                                                                        //"/Date(1523511510858)/"
                                                                        "rating": itemfeedback.rating,
                                                                        "feedbackDateTime": kendo.parseDate(itemfeedback.feedbackDateTime),
                                                                        "workedWell": itemfeedback.workedWell,
                                                                        "workedNotWell": itemfeedback.workedNotWell,
                                                                        "whatNextDescription": itemfeedback.whatNextDescription,
                                                                        "timeSpentMinutes": itemfeedback.timeSpentMinutes,
                                                                        "startedAt": kendo.parseDate(itemfeedback.startedAt)
                                                                    })
                                                                }
                                                            });

                                                        }
                                                    });
                                                }
                                            }
                                        });
                                    }
                                }
                            });
                        }
                        if ($scope.feedbacks.length > 0) {
                            var columns = [{
                                field: "skillName",
                                title: $translate.instant('COMMON_SKILL'),
                                width: "130px"
                            }, {
                                field: "name",
                                title: $translate.instant('COMMON_NAME'),
                                width: "130px"
                            }, {
                                field: "start",
                                title: $translate.instant('COMMON_RECURRENCE_START_TIME'),
                                width: "240px",
                                template: function (dataItem) {
                                    if (dataItem.start) {
                                        return moment(kendo.parseDate(dataItem.start)).format('L LT');
                                    } else {
                                        return '';
                                    }
                                }
                            }, {
                                field: "end",
                                title: $translate.instant('COMMON_RECURRENCE_END_TIME'),
                                width: "240px",
                                template: function (dataItem) {
                                    if (dataItem.end) {
                                        return moment(kendo.parseDate(dataItem.end)).format('L LT');
                                    } else {
                                        return '';
                                    }
                                }
                            }, {
                                field: "startedAt",
                                title: $translate.instant('COMMON_TRAINING_STARTED'),
                                width: "200px",
                                template: function (dataItem) {
                                    if (dataItem.startedAt) {
                                        return moment(kendo.parseDate(dataItem.startedAt)).format('L LT');
                                    } else {
                                        return '';
                                    }
                                }
                            }, {
                                field: "feedbackDateTime",
                                title: $translate.instant('COMMON_TRAINING_ENDED'),
                                width: "180px",
                                template: function (dataItem) {
                                    if (dataItem.feedbackDateTime) {
                                        return moment(kendo.parseDate(dataItem.feedbackDateTime)).format('L LT');
                                    } else {
                                        return '';
                                    }
                                }
                            }, {
                                field: "workedWell",
                                title: $translate.instant('COMMON_WORKED_WELL'),
                                width: "160px",
                            }, {
                                field: "workedNotWell",
                                title: $translate.instant('COMMON_WORKED_NOT_WELL'),
                                width: "200px",
                            }, {
                                field: "whatNextDescription",
                                title: $translate.instant('COMMON_WHAT_NEXT'),
                                width: "180px",
                            }, {
                                field: "rating",
                                title: $translate.instant('COMMON_RATING'),
                                width: "130px",
                                template: function (data) {
                                    var template = "";
                                    for (var i = 0; i < data.rating; i++) {
                                        template += "<span><label class='fa fa-star fa-fw selected'></label></span>";
                                    }
                                    return template;
                                }
                            }, {
                                field: "timeSpentMinutes",
                                title: $translate.instant('COMMON_TIME_SPENT'),
                                width: "160px",
                            },];
                            dialogService.showGridDialog('Feedbacks', $scope.feedbacks, columns)
                        } else {
                            dialogService.showNotification("Training Feedbacks not found!", "info");
                        }
                    } else {
                        dialogService.showNotification("Training Feedbacks not found!", "info");
                    }

                })

            }

            function getMonthsBetweenDate(startDate, endDate) {
                var dateStart = moment(kendo.parseDate(startDate));
                var dateEnd = moment(kendo.parseDate(endDate));
                var timeValues = [];
                while (dateEnd > dateStart || dateStart.format('M') === dateEnd.format('M')) {
                    timeValues.push(dateStart.format('YYYY-MM'));
                    dateStart.add(1, 'month');
                }
                return timeValues;
            }
            $scope.selectFromMonth = function (fromMonth) {
                $scope.selectedFromMonth = fromMonth;
                if ($scope.selectedFromMonth) {
                    $scope.startOfMonth = moment($scope.selectedFromMonth).startOf('month')._d;
                    $scope.endOfMonth = moment($scope.selectedFromMonth).endOf('month')._d;
                }
                calculateTimeSummary();
            }
            $scope.selectToMonth = function (toMonth) {
                $scope.selectedToMonth = toMonth;
            }

            $scope.getCompareStageScore = function (skillId, valueOf, kpiType) {
                var result = 0;
                if (kpiType == 1) {
                    var filter = _.find($scope.compareWeakKPIs, function (item) {
                        return item.skillId == skillId;
                    })
                    if (filter) {
                        if (filter[valueOf] != undefined) {
                            result = filter[valueOf];
                        }
                    }
                } else if (kpiType == 2) {
                    var filter = _.find($scope.compareStrongKPIs, function (item) {
                        return item.skillId == skillId;
                    })
                    if (filter) {
                        if (filter[valueOf] != undefined) {
                            result = filter[valueOf];
                        }
                    }
                }
                return result;
            }

            $scope.getCompareStageTime = function (skillId, valueOf, kpiType) {
                var result = 0;
                if (kpiType == 1) {
                    var filter = _.find($scope.compareWeakKPIs, function (item) {
                        return item.skillId == skillId;
                    })
                    if (filter) {
                        if (filter[valueOf] != undefined) {
                            result = filter[valueOf];
                        }
                    }
                } else if (kpiType == 2) {
                    var filter = _.find($scope.compareStrongKPIs, function (item) {
                        return item.skillId == skillId;
                    })
                    if (filter) {
                        if (filter[valueOf] != undefined) {
                            result = filter[valueOf];
                        }
                    }
                }
                return result;
            }

            $scope.getInitials = function (fullText) {
                var result = "";
                if (fullText) {
                    var splitted = fullText.split(' ');
                    _.each(splitted, function (item, i) {
                        result += item.charAt(0).toUpperCase();
                    })
                }
                return result;
            }
            $scope.isTrainingTargetPending = function (spent, total) {
                if (total) {
                    if (spent >= total) {
                        return "fa-plus";
                    } else {
                        return "fa-minus";
                    }
                }
            }

            $scope.setPerformanceIcon = function (value) {
                if (value >= 100) {
                    return 'fa-arrow-circle-up font-green';
                } else
                    return 'fa-arrow-circle-down font-red';
            }

            $scope.setProgressIcon = function (value) {
                if (value > 0) {
                    return 'fa-arrow-circle-up font-green';
                } else if (value < 0) {
                    return 'fa-arrow-circle-down font-red';
                } else {
                    return 'fa-minus-circle font-grey-cascade';
                }
            }

            $scope.setCompareProgressIcon = function (mainValue, compareValue) {
                if (compareValue > mainValue) {
                    return 'fa-arrow-circle-up font-green';
                } else if (compareValue < mainValue) {
                    return 'fa-arrow-circle-down font-red';
                } else {
                    return 'fa-minus-circle font-grey-cascade';
                }
            }

        }
    ])