'use strict';

angular
    .module('ips.todos')

    .config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
        $stateProvider
            .state('home.todos.todos', {
                url: "/todos",
                templateUrl: "views/todos/views/todos.html",
                controller: "ToDoCtrl",
                resolve: {
                    pageName: function ($translate) {
                        return $translate.instant('TASKPROSPECTING_TO_DO');
                    },
                    todos: function ($stateParams, todosManager, todosService) {
                        return todosManager.getTaskListByUserId().then(function (data) {
                            todosService.taskListId = data.id;
                            var resultData = data;
                            return resultData;
                        });
                    },
                    tasks: function ($stateParams, todosService) {
                        todosService.showCompleated = false;
                        return todosService.load().then(function (data) {
                            return data;
                        });
                    },
                    allcategories: function ($stateParams, todosManager, todos) {
                        return todosManager.getAllCategories().then(function (data) {
                            angular.forEach(data, function (item, index) {
                                item.text = item.name;
                                item.value = item.id;
                            });
                            return data;
                        });
                    },
                    allpriorities: function ($stateParams, todosManager, todos) {
                        return todosManager.getAllPriorities().then(function (data) {
                            angular.forEach(data, function (item, index) {
                                item.text = item.name;
                                item.value = item.id;
                            });
                            return data;
                        });
                    },
                    allstatuses: function ($stateParams, todosManager, todos) {
                        return todosManager.getAllStatuses().then(function (data) {
                            angular.forEach(data, function (item, index) {
                                item.text = item.name;
                                item.value = item.id;
                            });
                            return data;
                        });
                    },
                    users: function ($stateParams, todosManager, todos) {
                        return todosManager.getUsers().then(function (data) {
                            angular.forEach(data, function (item, index) {
                                item.text = item.firstName + " " + item.lastName;
                                item.value = item.id;
                            });
                            return data;
                        });
                    }
                },
                data: {
                    displayName: '{{pageName}}',//'To Do',
                    paneLimit: 1,
                    depth: 2,
                    resource: "Task"
                }
            })
            .state('home.todos.todaytasks', {
                url: "/todayTasks",
                templateUrl: "views/todos/views/todayTasks.html",
                controller: "todayTasksCtrl",
                resolve: {
                    pageName: function ($translate) {
                        return $translate.instant('HOME_TODAYS_TASKS');
                    },
                },
                data: {
                    displayName: '{{pageName}}',
                    paneLimit: 1,
                    depth: 2,
                    resource: "Task"
                }
            })
            .state('home.todos.newTask', {
                url: "/new",
                templateUrl: "views/todos/views/todo.new.html",
                controller: "toDoNewCtrl",
                resolve: {
                    todos: function (todosManager, todosService) {
                        return todosManager.getTaskListByUserId().then(function (data) {
                            todosService.taskListId = data.id;
                            return data;
                        });
                    },
                    task: function (authService, todos) {
                        return {
                            id: 0,
                            title: "",
                            viewName: "New Task",
                            description: "",
                            taskListId: todos.id,
                            assignedToId: todos.userId,
                            profileId: 0,
                            stageId: 0,
                            isCompleted: false,
                            completedDate: "",
                            createdById: todos.userId,
                            createdByName: authService.authentication.user.firstName + " " + authService.authentication.user.lastName,
                            createdDate: new Date(),
                            dueDate: "",
                            parentTaskId: null,
                            startDate: moment().format('L LT'),
                            statusId: null,
                            priorityId: null,
                            timeEstimateMinutes: moment.duration(0, "minutes").format("LT"),
                            timeSpentMinutes: 0,
                            //assignedToId: null,
                            categoryId: null,
                            recurrenceRule: "",
                            trainingId: "",
                            issmsNotification: false,
                            notificationTemplateId: null,
                            meetingNotificationTemplateId: null,
                            followUpNotificationTemplateId: null,
                            salesNotificationTemplateId: null,
                            isEmailNotification: true,
                            emailBefore: -15,
                            smsBefore: "",
                            projectId: null,
                        }
                    },
                    taskList: function (todosManager, task) {
                        return todosManager.getTaskListById(task.taskListId).then(function (data) {
                            return data;
                        });
                    },
                    categories: function (todosManager, taskList) {
                        return todosManager.getTaskCategoriesById(taskList.taskCategoryListsId).then(function (data) {
                            angular.forEach(data.taskCategoryListItems, function (item, index) {
                                item.text = item.name;
                                item.value = item.id;
                            });
                            return data.taskCategoryListItems;
                        });
                    },
                    priorities: function (todosManager, taskList) {
                        return todosManager.getTaskPrioritiesById(taskList.taskPriorityListId).then(function (data) {
                            angular.forEach(data.taskPriorityListItems, function (item, index) {
                                item.text = item.name;
                                item.value = item.id;
                            });
                            return data.taskPriorityListItems;
                        });
                    },
                    statuses: function (todosManager, taskList) {
                        return todosManager.getTaskStatusesById(taskList.taskStatusListId).then(function (data) {
                            angular.forEach(data.taskStatusListItems, function (item, index) {
                                item.text = item.name;
                                item.value = item.id;
                            });
                            return data.taskStatusListItems;
                        });
                    },
                    notificationTemplates: function (todosManager, templateTypeEnum) {
                        return todosManager.getNotificationTemplates().then(function (data) {
                            var resultData = _.filter(data, function (item) {
                                return item.notificationTemplateTypeId == templateTypeEnum.Tasks;
                            });
                            resultData.unshift({ id: null, name: "Select Template..." });
                            return resultData;
                        });
                    },
                    projects: function (todosManager, task) {
                        return todosManager.getProjects().then(function (data) {
                            var resultData = data.activeProjects;
                            if (task.id > 0) {
                                if (task.projectId > 0) {
                                    var isExistInActiveProeject = _.find(data.activeProjects, function (item) {
                                        return item.id == task.projectId;
                                    });
                                    var isExistInExpiredProeject = _.find(data.expiredProjects, function (item) {
                                        return item.id == task.projectId;
                                    });
                                    var isExistInCompletedProeject = _.find(data.completedProjects, function (item) {
                                        return item.id == task.projectId;
                                    });
                                    var isExistInHistoryProeject = _.find(data.historyProjects, function (item) {
                                        return item.id == task.projectId;
                                    });
                                    if (!(isExistInActiveProeject)) {
                                        if (isExistInExpiredProeject) {
                                            resultData.push(isExistInExpiredProeject);
                                        }
                                        if (isExistInCompletedProeject) {
                                            resultData.push(isExistInCompletedProeject);
                                        }
                                        if (isExistInHistoryProeject) {
                                            resultData.push(isExistInHistoryProeject);
                                        }
                                    }
                                }
                            }
                            resultData.unshift({ id: 0, name: "--Select Project--" });
                            return resultData;
                        });
                    },
                    users: function (todosManager) {
                        return todosManager.getUsers().then(function (data) {
                            angular.forEach(data, function (item, index) {
                                item.text = item.firstName + " " + item.lastName;
                                item.value = item.id;
                            });
                            return data;
                        });
                    }
                },
                data: {
                    displayName: '{{task.viewName}}',
                    paneLimit: 1,
                    depth: 2,
                    resource: "Task"
                }
            })
            .state('home.todos.upcomingPersonalTasks', {
                url: "/upcomingPersonalTasks",
                templateUrl: "views/todos/views/upcomingPersonalTasks.html",
                controller: "upcomingPersonalTasksCtrl",
                resolve: {
                    pageName: function ($translate) {
                        return $translate.instant('HOME_UPCOMING_TASKS');
                    },
                },
                data: {
                    displayName: '{{pageName}}',
                    paneLimit: 1,
                    depth: 2,
                    resource: "Task"
                }
            })
            .state('home.todos.completedPersonalTasks', {
                url: "/completedPersonalTasks",
                templateUrl: "views/todos/views/completedPersonalTasks.html",
                controller: "completedPersonalTasksCtrl",
                resolve: {
                    pageName: function ($translate) {
                        return $translate.instant('HOME_COMPLETED_TASKS');
                    },
                },
                data: {
                    displayName: '{{pageName}}',
                    paneLimit: 1,
                    depth: 2,
                    resource: "Task"
                }
            })

            .state('home.todos.upcomingCorporateTasks', {
                url: "/upcomingCorporateTasks",
                templateUrl: "views/todos/views/upcomingCorporateTasks.html",
                controller: "upcomingCorporateTasksCtrl",
                resolve: {
                    pageName: function ($translate) {
                        return $translate.instant('HOME_UPCOMING_TASKS');
                    },
                },
                data: {
                    displayName: '{{pageName}}',
                    paneLimit: 1,
                    depth: 2,
                    resource: "Task"
                }
            })
            .state('home.todos.completedCorporateTasks', {
                url: "/completedCorporateTasks",
                templateUrl: "views/todos/views/completedCorporateTasks.html",
                controller: "completedCorporateTasksCtrl",
                resolve: {
                    pageName: function ($translate) {
                        return $translate.instant('HOME_COMPLETED_TASKS');
                    },
                },
                data: {
                    displayName: '{{pageName}}',
                    paneLimit: 1,
                    depth: 2,
                    resource: "Task"
                }
            })


            .state('home.todos.calender', {
                url: "/calender",
                templateUrl: "views/todos/views/calender.html",
                controller: "calanderCtrl",
                resolve: {
                    pageName: function ($translate) {
                        return $translate.instant('CALENDER_CALENDER');
                    },
                    todos: function ($stateParams, todosManager, todosService) {
                        return todosManager.getTaskListByUserId().then(function (data) {
                            todosService.taskListId = data.id;
                            return data;
                        });
                    },
                    tasks: function ($stateParams, todosService) {
                        todosService.showCompleated = false;
                        return todosService.load().then(function (data) {
                            return data;
                        });
                    },
                    allcategories: function ($stateParams, todosManager, todos) {
                        return todosManager.getAllCategories().then(function (data) {
                            angular.forEach(data, function (item, index) {
                                item.text = item.name;
                                item.value = item.id;
                            });
                            return data;
                        });
                    },
                    allpriorities: function ($stateParams, todosManager, todos) {
                        return todosManager.getAllPriorities().then(function (data) {
                            angular.forEach(data, function (item, index) {
                                item.text = item.name;
                                item.value = item.id;
                            });
                            return data;
                        });
                    },
                    allstatuses: function ($stateParams, todosManager, todos) {
                        return todosManager.getAllStatuses().then(function (data) {
                            angular.forEach(data, function (item, index) {
                                item.text = item.name;
                                item.value = item.id;
                            });
                            return data;
                        });
                    },
                    users: function ($stateParams, todosManager, todos) {
                        return todosManager.getUsers().then(function (data) {
                            angular.forEach(data, function (item, index) {
                                item.text = item.firstName + " " + item.lastName;
                                item.value = item.id;
                            });
                            return data;
                        });
                    }
                },
                data: {
                    displayName: '{{pageName}}',//'Calender',
                    paneLimit: 1,
                    depth: 2,
                    resource: "Task"
                }
            });
    }])
    .service('todosService', ['todosManager', function (todosManager) {

        var todos = new kendo.data.ObservableArray([]);

        var selectedTodo;

        this.showCompleated = false;
        this.delegatedTasks = true;
        this.taskListId = -1;

        this.load = function () {
            var query = "";
            if (!this.showCompleated) {
                query = "&$filter=(IsCompleted eq false)";
            }
            if ((!this.delegatedTasks) && (this.taskListId > 0)) {
                if (query == "") {
                    query = "&$filter=(TaskListId eq " + this.taskListId + ")";
                } else {
                    query += "and(TaskListId eq " + this.taskListId + ")";
                }

            }

            return todosManager.getTasksByUserId(query).then(function (data) {

                angular.forEach(data, function (item, index) {
                    item.startDate = item.startDate ? moment(kendo.parseDate(item.startDate)).format('L LT') : '';
                    item.dueDate = item.dueDate ? moment(kendo.parseDate(item.dueDate)).format('L LT') : '';
                    var totalRating = 0;
                    _.forEach(item.trainingFeedbacks, function (feedbackItem) {
                        totalRating += feedbackItem.rating;
                    });
                    var avgRating = 0;
                    if (totalRating > 0) {
                        avgRating = (totalRating / item.trainingFeedbacks.length).toFixed(1);
                    }
                    else {
                        avgRating = 0;
                    }
                    item["avgRating"] = avgRating;
                });

                todos.splice(0, todos.length);
                todos.push.apply(todos, data);
            });
        }

        this.add = function (item) {
            todos.push(item);
        };

        this.update = function (item, index) {
            todos.splice(index, 1, item);
        };

        this.getById = function (userId, id) {
            return todosManager.getToDosByUserId().then(function (data) {
                selectedTodo = data;
                return selectedTodo;
            });
        }

        this.getSelectedToDo = function () {
            return selectedTodo;
        }

        this.remove = function (index) {
            return todos.splice(index, 1);
        };

        this.get = function (index) {
            return todos[index];
        };

        this.list = function () {
            return todos;
        };

        this.dataSource = function () {
            //console.log(todos);
            return new kendo.data.DataSource({
                type: "json",
                data: todos,
                schema: {
                    model: {
                        id: "id",
                        fields: {
                            id: { type: 'number', },
                            title: { type: 'string' },
                            description: { type: 'string' },
                            taskListId: { type: 'number' },
                            isCompleted: { type: 'bool' },
                            completedDate: { name: { type: 'date' } },
                            createdById: { type: 'number' },
                            createdByName: { type: 'string' },
                            createdDate: { name: { type: 'datetime' } },
                            dueDate: { name: { type: 'datetime' } },
                            parentTaskID: { type: 'number' },
                            startDate: { name: { type: 'datetime' } },
                            statusId: { type: 'number' },
                            priorityId: { type: 'number' },
                            timeEstimateMinutes: { type: 'number' },
                            timeSpentMinutes: { type: 'number' },
                            assignedToId: { type: 'number' },
                            categoryId: { type: 'number' },
                            recurrenceRule: { type: 'number' }
                        }
                    }
                },
                pageSize: 10
            });
        }
        this.cloneTask = function (taskId) {
            return todosManager.cloneTask(taskId).then(function (data) {
                selectedTodo = data;
                return selectedTodo;
            });
        }
    }])

    .controller('toDoNewCtrl', ['$scope', 'cssInjector', '$stateParams', '$location', 'authService', 'todosManager', 'todosService', 'todoService', '$state', 'apiService', 'dialogService', 'reminderEnum', 'templateTypeEnum', 'task', 'categories', 'priorities', 'statuses', 'users', 'notificationTemplates', 'projects', '$translate', 'stageTypesEnum', 'globalVariables',
        function ($scope, cssInjector, $stateParams, $location, authService, todosManager, todosService, todoService, $state, apiService, dialogService, reminderEnum, templateTypeEnum, task, categories, priorities, statuses, users, notificationTemplates, projects, $translate, stageTypesEnum, globalVariables) {
            cssInjector.removeAll();
            cssInjector.add('views/todos/todo.css');
            moment.locale(globalVariables.lang.currentUICulture);
            $scope.task = task;
            $scope.cloneTask = _.clone(task);
            $scope.reminders = [
                { value: -1440, text: $translate.instant('COMMON_BEFORE_1_DAY') },
                { value: -60, text: $translate.instant('COMMON_BEFORE_1_HOUR') },
                { value: -30, text: $translate.instant('COMMON_BEFORE_30_MIN') },
                { value: -15, text: $translate.instant('COMMON_BEFORE_15_MIN') },
                { value: -5, text: $translate.instant('COMMON_BEFORE_5_MIN') }];
            $scope.categories = categories;
            $scope.priorities = priorities;
            $scope.statuses = statuses;
            $scope.allUsers = users;
            $scope.users = users;
            $scope.trainings = [];
            $scope.projects = projects;
            if (task.trainingId > 0) {
                var isTrainingExist = _.any($scope.trainings, function (item) {
                    return item.id == task.trainingId;
                });
                if (!isTrainingExist) {
                    todosManager.getTrainingById(task.trainingId).then(function (trainingData) {
                        $scope.trainings.push(trainingData);
                    })
                }
            }
            $scope.profiles = [];
            $scope.stages = [];
            $scope.saveAndNew = saveAndNew;
            $scope.categoryChange = categoryChange;
            $scope.profileChange = profileChange;
            $scope.stageChange = stageChange;
            $scope.assignedToChange = assignedToChange;
            //$scope.emailReminderChange = emailReminderChange;
            $scope.isKPITraining = false;
            $scope.isTraining = false;
            $scope.notifcations = notificationTemplates;
            $scope.checkisTraining = checkisTraining;
            $scope.showTraining = showTraining;
            $scope.showNotificationTemplate = showNotificationTemplate;
            $scope.startDateChnage = startDateChnage;
            $scope.dueDateOpen = dueDateOpen;
            $scope.startDateOpen = startDateOpen;
            $scope.trainingInfo = null;
            $scope.templateInfo = null;
            $scope.taskDueDateOptions = {
                min: kendo.parseDate($scope.task.startDate)
            };
            $scope.projectChange = projectChange;
            $scope.filterTaskReminderNotifications = function (item) {
                if (item.id != null) {
                    if ($scope.task.id > 0) {
                        if ((item.stageTypeId == stageTypesEnum.TaskReminder && item.culture.cultureName == globalVariables.lang.currentUICulture) || item.id == $scope.task.notificationTemplateId) {
                            return true;
                        }
                    }
                    else {
                        if (item.stageTypeId == stageTypesEnum.TaskReminder && item.culture.cultureName == globalVariables.lang.currentUICulture) {
                            return true;
                        }
                    }
                }
                else {
                    return true;
                }
            }
            $scope.filterMeetingScheduleNotifications = function (item) {
                if (item.id != null) {
                    if ($scope.task.id > 0) {
                        if ((item.stageTypeId == stageTypesEnum.MeetingSchedule && item.culture.cultureName == globalVariables.lang.currentUICulture) || item.id == $scope.cloneTask.meetingNotificationTemplateId) {
                            return true;
                        }
                    }
                    else {
                        if (item.stageTypeId == stageTypesEnum.MeetingSchedule && item.culture.cultureName == globalVariables.lang.currentUICulture) {
                            return true;
                        }
                    }
                }
                else {
                    return true;
                }
            }
            $scope.filterFollowupScheduleNotifications = function (item) {
                if (item.id != null) {
                    if ($scope.task.id > 0) {
                        if ((item.stageTypeId == stageTypesEnum.FollowupSchedule && item.culture.cultureName == globalVariables.lang.currentUICulture) || item.id == $scope.cloneTask.followUpNotificationTemplateId) {
                            return true;
                        }
                    }
                    else {
                        if (item.stageTypeId == stageTypesEnum.FollowupSchedule && item.culture.cultureName == globalVariables.lang.currentUICulture) {
                            return true;
                        }
                    }
                }
                else {
                    return true;
                }
            }
            $scope.filterSalesNotificationTemplates = function (item) {
                if (item.id != null) {
                    if ($scope.task.id > 0) {
                        if ((item.stageTypeId == stageTypesEnum.SalesAgreed && item.culture.cultureName == globalVariables.lang.currentUICulture) || item.id == $scope.cloneTask.salesNotificationTemplateId) {
                            return true;
                        }
                    }
                    else {
                        if (item.stageTypeId == stageTypesEnum.SalesAgreed && item.culture.cultureName == globalVariables.lang.currentUICulture) {
                            return true;
                        }
                    }
                }
                else {
                    return true;
                }
            }
            $scope.isProspectingCategory = function () {
                if ($scope.task.categoryId > 0) {
                    var category = _.find(categories, function (item) {
                        return item.value == $scope.task.categoryId;
                    })
                    if (category) {
                        if (category.name.toLowerCase().indexOf("prospecting") > -1) {
                            return true
                        }
                        else {
                            return false;
                        }
                    }
                    else {
                        return false;
                    }
                }
                else {
                    return false;
                }
            }
            $scope.hasDelegateTasksPermition = hasDelegateTasksPermition;
            $scope.save = save;
            $scope.remove = remove;
            $scope.back = back;
            if (task.stageId > 0) {
                profileChange()
            }

            setDefalutValues();

            function startDateChnage(event) {
                if (moment(kendo.parseDate(event.sender.value())).isAfter(moment(kendo.parseDate($scope.task.dueDate)))) {
                    $scope.task.dueDate = null;
                }
            }
            function startDateOpen(event) {
                if ($scope.task.projectId > 0) {
                    var selectedProject = _.find($scope.projects, function (item) {
                        return item.id == $scope.task.projectId;
                    });
                    if (selectedProject) {
                        var datepicker = $(event.sender.element).data("kendoDateTimePicker")
                        datepicker.setOptions({
                            min: kendo.parseDate(selectedProject.expectedStartDate),
                            max: kendo.parseDate(selectedProject.expectedEndDate)
                        });
                    }
                }
                else {
                    var datepicker = $(event.sender.element).data("kendoDateTimePicker")
                    datepicker.setOptions({
                        max: new Date(),
                    });
                }
            }
            function dueDateOpen(event) {
                if ($scope.task.projectId > 0) {
                    var selectedProject = _.find($scope.projects, function (item) {
                        return item.id == $scope.task.projectId;
                    });
                    if (selectedProject) {
                        var datepicker = $(event.sender.element).data("kendoDateTimePicker")
                        datepicker.setOptions({
                            min: kendo.parseDate($scope.task.startDate),
                            max: kendo.parseDate(selectedProject.expectedEndDate)
                        });
                    }
                }
                else {
                    var datepicker = $(event.sender.element).data("kendoDateTimePicker")
                    datepicker.setOptions({
                        min: kendo.parseDate($scope.task.startDate)
                    });
                }
            }
            function assignedToChange() {
                if ($scope.isKPITraining) {
                    if ($scope.trainings) {
                        var filteredTrainnings = _.filter($scope.trainings, function (item) {
                            return item.participantId == $scope.task.assignedToId;
                        });
                        $scope.trainings = filteredTrainnings;
                    }
                }
            }
            function categoryChange() {
                $scope.task.assignedToId = 0;
                $scope.task.trainingId = 0;
                $scope.trainings = [];
                $scope.users = [];
                var isKPITraining = _.filter($scope.categories, function (item) {
                    return item.name.toLowerCase().indexOf('kpi training') > -1 && item.id == $scope.task.categoryId;
                });
                if (isKPITraining.length > 0) {
                    $scope.isTraining = false;
                    $scope.isKPITraining = true;
                    $scope.trainings = [];
                }
                else {
                    $scope.isKPITraining = false;
                    var isTraining = _.filter($scope.categories, function (item) {
                        return item.name.toLowerCase() == "training" && item.id == $scope.task.categoryId;
                    });
                    if (isTraining.length > 0) {
                        $scope.isTraining = true;
                    }
                    else {
                        $scope.isTraining = false;
                    }
                    $scope.trainings = [];
                    $scope.users = users;
                }
                projectChange();
            }
            function checkisTraining() {
                var isKPITraining = _.filter($scope.categories, function (item) {
                    return item.name.toLowerCase().indexOf('kpi training') > -1 && item.id == $scope.task.categoryId;
                });
                if (isKPITraining.length > 0) {
                    $scope.isTraining = false;
                    $scope.isKPITraining = true;
                }
                else {
                    $scope.isKPITraining = false;
                    var isTraining = _.filter($scope.categories, function (item) {
                        return item.name.toLowerCase() == "training" && item.id == $scope.task.categoryId;
                    });
                    if (isTraining.length > 0) {
                        $scope.isTraining = true;
                    }
                    else {
                        $scope.isTraining = false;
                    }
                }
                if ($scope.isTraining || $scope.isKPITraining) {
                    return true;
                }
                else {
                    return false;
                }
            }
            function profileChange() {
                todosManager.getProfileStages($scope.task.profileId, 0).then(function (data) {
                    $scope.stages = [];
                    _.forEach(data, function (item, index) {
                        $scope.stages.push({ id: item.id, name: item.name + " (" + item.statusText + ")" });
                    });
                });
            }
            function stageChange() {
                getKPITraining();
            }
            function projectChange() {
                //$scope.task.assignedToId = 0;
                //$scope.task.dueDate = null;
                if ($scope.task.projectId > 0) {
                    todosManager.getProjectMembers($scope.task.projectId).then(function (data) {
                        var projectUserIds = [];
                        _.each(data, function (item) {
                            projectUserIds.push(item.userId);
                        })
                        var filterUsers = _.filter($scope.allUsers, function (item) {
                            return projectUserIds.indexOf(item.id) > -1;
                        });
                        $scope.users = filterUsers;
                        if ($scope.task.id > 0) {
                            var isCurrentUser = _.find($scope.users, function (item) {
                                return item.id == $scope.task.assignedToId;
                            })
                            if (isCurrentUser) {
                                $scope.task.assignedToId = parseInt(authService.authentication.user.userId)
                            }
                            else if ($scope.task.assignedToId > 0) {
                                var isExist = _.find($scope.users, function (item) {
                                    return item.id == parseInt($scope.task.assignedToId);
                                });
                                if (!isExist) {
                                    $scope.task.assignedToId = 0;
                                }
                            }
                            else {
                                $scope.task.assignedToId = 0;
                            }
                        }
                        else {
                            var isCurrentUser = _.find($scope.users, function (item) {
                                return item.id == parseInt(authService.authentication.user.userId);
                            })
                            if (isCurrentUser) {
                                $scope.task.assignedToId = parseInt(authService.authentication.user.userId)
                            }
                            else if ($scope.task.assignedToId > 0) {
                                var isExist = _.find($scope.users, function (item) {
                                    return item.id == parseInt($scope.task.assignedToId);
                                });
                                if (!isExist) {
                                    $scope.task.assignedToId = 0;
                                }
                            }
                        }
                    });
                }
                else {
                    $scope.users = $scope.allUsers;
                }
            }
            function getKPITraining() {
                if ($scope.isKPITraining) {
                    $scope.trainings = [];
                    todosManager.getKPITraining($scope.task.profileId, $scope.task.stageId).then(function (data) {
                        var users = [];
                        if (data.length > 0) {
                            _.forEach(data, function (questionItem) {
                                users.push(questionItem.participantUser)
                                questionItem.participantId = questionItem.participantUser.id;
                                _.forEach(questionItem.agreement.trainings, function (trainingItem) {
                                    trainingItem["participantId"] = questionItem.participantId;
                                    $scope.trainings.push(trainingItem);
                                })
                            });
                            $scope.users = _.uniq(users, function (user) {
                                return user.id;
                            });
                        }
                    });
                }
            }
            function showTraining(id) {
                todosManager.getKPITrainingById(id).then(function (data) {
                    data.startDate = data.startDate ? moment(kendo.parseDate(data.startDate)).format('L LT') : "";
                    data.endDate = data.endDate ? moment(kendo.parseDate(data.endDate)).format('L LT') : "";
                    $scope.trainingInfo = data;
                    $scope.trainingMaterialsdataSource = new kendo.data.DataSource({
                        type: "json",
                        data: data.trainingMaterials,
                        pageSize: 10,
                        schema: {
                            model: {
                                id: "id",
                                fields: {
                                    id: {
                                        type: 'number',
                                    },
                                    name: {
                                        type: 'string'
                                    },
                                    description: {
                                        type: 'string'
                                    }
                                }
                            }
                        }
                    });
                    $("#tmGrid").kendoGrid({
                        dataSource: $scope.trainingMaterialsdataSource,
                        scrollable: true,
                        sortable: true,
                        filterable: false,
                        columns: [
                            {
                                field: "title", title: $translate.instant('COMMON_TITLE'), width: "45%", template: function (dataItem) {
                                    if (dataItem.name) {
                                        return "<div><a class='' ng-click='downloadTrainingmaterial(\"" + webConfig.trainingMaterialsController + dataItem.name + "\", \"" + dataItem.title + "\");'>" + dataItem.title + "</a></div>";
                                    } else if (dataItem.link) {
                                        return "<div><a class='' ng-click='openLink(\"" + dataItem.link + "\");'>" + dataItem.title + "</a></div>";
                                    } else {
                                        return "<div>" + dataItem.title + "</div>";
                                    }
                                },
                            },
                            { field: "materialType", title: $translate.instant('COMMON_MATERIAL_TYPE'), width: "30%" },
                            {
                                field: "description", title: $translate.instant('COMMON_DESCRIPTION'), width: "30%"
                            },
                        ],
                    });
                    $("#tmGrid").kendoTooltip({
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
                    $("#trainingInfoModal").modal("show");
                });
            }
            function showNotificationTemplate(id) {
                todosManager.getNotificationTemplateById(id).then(function (data) {
                    $scope.templateInfo = data;
                    $("#emailBody").html("");
                    $("#emailBody").html(data.emailBody);
                    $("#notificationTemplateModal").modal("show");
                });
            }
            function hasDelegateTasksPermition() {
                return authService.hasPermition(authService.authentication.user.organizationId, 'Delegate Tasks', authService.actions.Update);
            }
            function save() {
                var taskCopy = _.clone(task);
                taskCopy.startDate = kendo.parseDate(taskCopy.startDate);
                taskCopy.dueDate = kendo.parseDate(taskCopy.dueDate);
                if (taskCopy.id == 0) {
                    todosManager.createTask(taskCopy).then(function (data) {
                        $location.path('home/todos/todos/edit/' + data);
                        dialogService.showNotification($translate.instant('TASKPROSPECTING_SAVED_SUCCESFULLY'), 'info');
                        todoService.load();
                    }, function (message) {
                        dialogService.showNotification(message, "warning");
                    });
                }
            }
            function saveAndNew() {
                var taskCopy = _.clone(task);
                taskCopy.startDate = kendo.parseDate(taskCopy.startDate);
                taskCopy.dueDate = kendo.parseDate(taskCopy.dueDate);
                if (taskCopy.id == 0) {
                    todosManager.createTask(taskCopy).then(function (data) {
                        $state.go($state.current, {
                        }, {
                                reload: true
                            });
                        dialogService.showNotification($translate.instant('TASKPROSPECTING_SAVED_SUCCESFULLY'), 'info');
                        todoService.load();
                        todosService.load().then(function (data) {

                        });
                    }, function (message) {
                        dialogService.showNotification(message, "warning");
                    });
                }
            }
            function remove() {
                dialogService.showYesNoDialog($translate.instant('COMMON_CONFIRM'), $translate.instant('COMMON_ARE_YOU_SURE_YOU_WANT_TO_DELETE')).then(function () {
                    todosManager.removeTask($scope.task.id).then(function (data) {
                        todoService.load();
                        todosService.load().then(function (data) {
                            $state.go('^');
                        });
                    }, function (message) {
                        dialogService.showNotification(message, "warning");
                    });
                },
                    function () {
                    });
            }
            function back() {
                $state.go('^');
            }
            function setDefalutValues() {
                $scope.task.assignedToId = parseInt(authService.authentication.user.userId);
                $scope.task.emailBefore = -15;
                var defaultTaskTemplate = _.find(notificationTemplates, function (item) {
                    return item.notificationTemplateTypeId == templateTypeEnum.Tasks && item.stageTypeId == stageTypesEnum.TaskReminder && item.isDefualt == true;
                })
                if (defaultTaskTemplate) {
                    $scope.task.notificationTemplateId = defaultTaskTemplate.id
                }
                var defaultMeetingTaskTemplate = _.find(notificationTemplates, function (item) {
                    return item.notificationTemplateTypeId == templateTypeEnum.Tasks && item.stageTypeId == stageTypesEnum.MeetingSchedule && item.culture.cultureName == globalVariables.lang.currentUICulture && item.organizationId == authService.authentication.user.organizationId && item.isDefualt == true;
                })
                if (defaultMeetingTaskTemplate) {
                    $scope.task.meetingNotificationTemplateId = defaultMeetingTaskTemplate.id
                }
                var defaultfollowUpTaskTemplate = _.find(notificationTemplates, function (item) {
                    return item.notificationTemplateTypeId == templateTypeEnum.Tasks && item.stageTypeId == stageTypesEnum.FollowupSchedule && item.culture.cultureName == globalVariables.lang.currentUICulture && item.organizationId == authService.authentication.user.organizationId && item.isDefualt == true;
                })
                if (defaultfollowUpTaskTemplate) {
                    $scope.task.followUpNotificationTemplateId = defaultfollowUpTaskTemplate.id
                }
                var defaultSalesAgreedTemplate = _.find(notificationTemplates, function (item) {
                    return item.notificationTemplateTypeId == templateTypeEnum.Tasks && item.stageTypeId == stageTypesEnum.SalesAgreed && item.culture.cultureName == globalVariables.lang.currentUICulture && item.organizationId == authService.authentication.user.organizationId && item.isDefualt == true;
                })
                if (defaultSalesAgreedTemplate) {
                    $scope.task.salesNotificationTemplateId = defaultSalesAgreedTemplate.id
                }
            }
        }
    ])
    .controller('ToDoCtrl', ['$scope', '$location', '$stateParams', 'authService', '$cacheFactory', 'cssInjector', 'todosService', 'todoService', 'todosManager', 'dialogService', 'apiService', 'todos', 'allcategories', 'allpriorities', 'allstatuses', 'users', 'tasksSettingsService', '$translate',
        function ($scope, $location, $stateParams, authService, $cacheFactory, cssInjector, todosService, todoService, todosManager, dialogService, apiService, todos, categories, priorities, statuses, users, tasksSettingsService, $translate) {

            cssInjector.removeAll();
            cssInjector.add('views/todos/todo.css');
            $scope.apiName = 'tasks';
            $scope.showCompleted;
            todosService.showCompleated = false;
            $scope.delegatedTasks = true;
            todosService.delegatedTasks = true;
            $scope.todos = todos;
            $scope.ratings = [{ value: 1, background: '#f00' },
            { value: 2, background: '#f00' },
            { value: 3, background: '#ff0' },
            { value: 4, background: '#ff0' },
            { value: 5, background: '#0f0' },
            ];
            $scope.training = {
                trainingId: 0,
                rating: 0,
                workedWell: "",
                workedNotWell: "",
                ratingDescription: "",
                whatNextDescription: "",
                taskId: 0,
                timeSpentMinutes: 0,
            };

            $scope.starMouseHover = function (el) {
                var onStar = parseInt($(el.target).data('value'), 10); // The star currently mouse on

                // Now highlight all the stars that's not after the current hovered star
                $(el.target).parents("#stars").children('li.star').each(function (e) {
                    if (e < onStar) {
                        $(this).addClass('hover');
                    }
                    else {
                        $(this).removeClass('hover');
                    }
                });

            }
            $scope.starMouseOut = function (el) {
                $(el.target).parents("#stars").children('li.star').each(function (e) {
                    $(this).removeClass('hover');
                });
            }

            /* 2. Action to perform on click */
            $scope.starClick = function (el) {
                var onStar = parseInt($(el.target).data('value'), 10); // The star currently selected
                var stars = $(el.target).parents("#stars").children('li.star');

                for (var i = 0; i < stars.length; i++) {
                    $(stars[i]).removeClass('selected');
                }

                for (var i = 0; i < onStar; i++) {
                    $(stars[i]).addClass('selected');
                }


                var ratingValue = parseInt($('#stars li.selected label').last().data('value'), 10);

                if (ratingValue > 1) {
                    $scope.training.rating = ratingValue;;
                }
                else {
                    $scope.training.rating = 0;
                }
            };

            function cancelTraningFeedback() {
                $("#trainingFeedbackModal").modal('hide');
                var taskItem = _.filter(todosService.list(), function (item) {
                    return item.id == $scope.training.trainingId;
                });
                if (taskItem.length > 0) {
                    taskItem[0].isCompleted = false;
                }

            }

            function saveTraningFeedback() {
                if ($scope.training.trainingId == 0) {
                    $scope.training.trainingId = null;
                }
                todosManager.saveTraningFeedback($scope.training).then(function (data) {
                    if (data.id > 0) {
                        dialogService.showNotification($translate.instant('TASKPROSPECTING_FEEDBACK_SAVED_SUCCESSFULLY'), "info");
                    }
                    else {
                        dialogService.showNotification($translate.instant('TASKPROSPECTING_FEEDBACK_NOT_SAVED'), "warning");
                    }
                    todoService.load();
                });
            }
            //todosService.addRange(todos);

            $scope.deleteItemData = function (id) {
                dialogService.showYesNoDialog($translate.instant('COMMON_CONFIRM'), $translate.instant('COMMON_ARE_YOU_SURE_YOU_WANT_TO_DELETE')).then(function () {
                    todosManager.removeTask(id).then(function (data) {
                        var items = todosService.list();
                        var index = -1;
                        var i = 0;
                        for (; i < items.length; i++) {
                            if (items[i].id == id) {
                                index = i;
                            }
                        }
                        todosService.remove(index);
                    }, function (message) {
                        dialogService.showNotification(message, "warning");
                    });
                },
                    function () {

                    });
            }

            $scope.showActivityLogItemData = function (id) {
                var data = $("#myTasksGrid").data("kendoGrid").dataSource.data();
                var taskData = _.find(data, function (item) {
                    return item.id == id;
                });
                $("#TrainingFeedbackGrid").html("");
                $("#TrainingFeedbackGrid").kendoGrid({
                    dataSource: {
                        type: "json",
                        data: taskData.trainingFeedbacks,
                        pageSize: 10,
                    },
                    columnMenu: false,
                    filterable: true,
                    pageable: true,
                    columns: [
                        {
                            field: "feedbackDateTime", title: $translate.instant('COMMON_DATE'), width: "150px", template: function (data, value) {
                                return moment(kendo.parseDate(data.feedbackDateTime)).format('L LT')
                            }
                        },
                        {
                            field: "rating", title: $translate.instant('COMMON_RATING'), width: "150px", template: function (data) {
                                var template = "";
                                for (var i = 0; i < data.rating; i++) {
                                    template += "<span><label class='fa fa-star fa-fw selected'></label></span>";
                                }
                                return template;

                            }
                        },
                        { field: "workedWell", title: $translate.instant('COMMON_WORKED_WELL'), width: "200px" },
                        { field: "workedNotWell", title: $translate.instant('COMMON_WORKED_NOT_WELL'), width: "200px" },
                        { field: "whatNextDescription", title: $translate.instant('COMMON_WHAT_NEXT'), width: "200px" },
                        { field: "timeSpentMinutes", title: $translate.instant('COMMON_TIME_SPENT') + " ( " + $translate.instant('COMMON_MINUTES') + " )", width: "200px" },
                    ],
                });
                $("#trainingFeedbackGrid").kendoTooltip({
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
                $("#trainingFeedbackListModal").modal("show");
            }

            function showCompleatedChanged() {
                todosService.showCompleated = !todosService.showCompleated;
                todosService.load().then(function (data) {

                });
            }

            function delegatedTasksChanged() {
                todosService.delegatedTasks = !todosService.delegatedTasks;
                todosService.load().then(function (data) {

                });
            }

            function editToDo(todoId) {
                $location.path($location.path() + '/edit/' + todoId);
            }
            function cloneTask(todoId) {
                dialogService.showYesNoDialog("Confirm", "Are you sure want to clone this task").then(function () {
                    todosService.cloneTask(todoId).then(function (data) {
                        if (data.id > 0) {
                            todosService.load().then(function (data) {

                            });
                        }
                    })
                })
            }

            function addNewToDo() {
                $location.path($location.path() + '/edit/0');
            }

            function goBack() {
                history.back();
            }

            function compleated(id) {
                //var taskItem = _.filter(todosService.list(), function (item) {
                //    return item.id == id;
                //});
                //if (taskItem.length > 0) {
                //    if (taskItem[0].trainingId > 0) {
                //        if (!taskItem[0].isCompleted) {
                //            $scope.training.trainingId = id;
                //            taskItem[0].isCompleted = true;
                //            $(".bs-example-modal-lg").modal("show");
                //        }
                //    }
                //    else {
                //        todosManager.isCompleted(id, !taskItem[0].isCompleted).then(function (data) {
                //            todoService.load();
                //        });
                //    }
                //}

                angular.forEach(todosService.list(), function (item, index) {
                    if (item.id == id) {
                        item.isCompleted = !item.isCompleted;
                        todosManager.isCompleted(id, item.isCompleted).then(function (data) {
                            if (item.isCompleted) {
                                $scope.training.trainingId = item.trainingId;
                                $scope.training.taskId = id;

                                tasksSettingsService.getTaskScaleRatingByUserId(item.assignedToId).then(function (data) {
                                    $scope.ratings = [];
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

                                    //vm.taskScale.taskScaleRanges = data.taskScaleRanges;

                                });

                                $("#trainingFeedbackModal").modal("show");
                            }
                            todoService.load();
                        });
                    }
                });
            }

            function doSearch(searchText) {
                $("#myTasksGrid").data("kendoGrid").dataSource.filter([
                    {
                        logic: "or",
                        filters: [
                            {
                                field: "title",
                                operator: "contains",
                                value: searchText
                            },
                            {
                                field: "description",
                                operator: "contains",
                                value: searchText
                            },
                            {
                                field: "createdByName",
                                operator: "contains",
                                value: searchText
                            },
                            {
                                field: "taskCategoryListItem.name",
                                operator: "contains",
                                value: searchText
                            },
                            {
                                field: "taskPriorityListItem.name",
                                operator: "contains",
                                value: searchText
                            },
                            {
                                field: "taskStatusListItem.name",
                                operator: "contains",
                                value: searchText
                            },
                        ]
                    }]);
            }

            $scope.saveTraningFeedback = saveTraningFeedback;

            $scope.cancelTraningFeedback = cancelTraningFeedback;

            $scope.doSearch = doSearch;

            $scope.compleated = compleated;
            $scope.delegatedTasksChanged = delegatedTasksChanged;
            $scope.showCompleatedChanged = showCompleatedChanged;
            $scope.editToDo = editToDo;
            $scope.cloneTask = cloneTask;
            $scope.goBack = goBack;

            $scope.put = function (key, value) {
                $scope.cache.put(key, value === undefined ? null : value);
            }

            $scope.addNewToDo = addNewToDo;

            $scope.gridOptions = {
                dataSource: todosService.dataSource(),
                pageable: true,
                sortable: true,
                columnMenu: false,
                filterable: true,
                columns: [
                    {
                        field: "categoryId", title: $translate.instant('COMMON_CATEGORY'), width: "150px", template: function (dataItem) {
                            var category = null;
                            angular.forEach(categories, function (item, index) {
                                if (item.id == dataItem.categoryId) {
                                    category = item;
                                }
                            })
                            if (category) {
                                return "<div style='text-align:center;height:24px;background-color:" + category.color + "; color: " + category.textColor + "'>" + category.name + "</div>";
                            }

                        }
                    },
                    {
                        field: "pic", title: $translate.instant('TASKMANAGEMENT_DELEGATED'), width: '150px', sortable: false, template: function (dataItem) {
                            var url = ((dataItem.assignedToId) && (todos.userId != dataItem.createdById)) ? 'images/delegatedTask.png' : '';
                            if (url) {
                                return "<div><img class='delegated-task' style='border:none' src='" + url + "' title='" + dataItem.createdByName + " assigned this task to you' ></div>";
                            }
                            else {
                                return "";
                            }

                        }
                    },
                    { field: "isCompleted", title: $translate.instant('COMMON_COMPLETED'), width: "150px", template: "<input type='checkbox' ng-click='compleated(#= id #)' data-bind='checked: isCompleted' #= isCompleted ? checked='checked' : '' #/>" },
                    { field: "title", title: $translate.instant('COMMON_TITLE'), width: "120px", },
                    { field: "description", title: $translate.instant('COMMON_DESCRIPTION'), hidden: true, width: "150px", },
                    { field: "taskListId", title: $translate.instant('TASKMANAGEMENT_TASK_LIST_ID'), hidden: true, width: "200px", },
                    { field: "completedDate", title: $translate.instant('TASKMANAGEMENT_COMPLETED_AT'), hidden: true, width: "200px", },
                    { field: "createdByName", title: $translate.instant('TASKMANAGEMENT_CREATED_BY'), width: "160px", },
                    { field: "createdDate", title: $translate.instant('TASKMANAGEMENT_CREATED_DATE'), hidden: true, width: "200px", },
                    { field: "startDate", title: $translate.instant('COMMON_START_DATE'), width: "200px", },
                    { field: "dueDate", title: $translate.instant('COMMON_DUE_DATE'), width: "140px", },
                    { field: "priorityId", title: $translate.instant('COMMON_PRIORITY'), values: priorities, width: "130px", },
                    { field: "statusId", title: $translate.instant('COMMON_STATUS'), values: statuses, width: "130px", },
                    { field: "timeEstimateMinutes", title: $translate.instant('TASKMANAGEMENT_TIME_ESTIMATE_MINUTES'), hidden: true, width: "250px", },
                    { field: "timeSpentMinutes", title: $translate.instant('TASKMANAGEMENT_TIME_SPENT_MINUTES'), hidden: true, width: "250px", },
                    { field: "assignedToId", title: $translate.instant('TASKMANAGEMENT_ASSIGNED_TO'), values: users, width: "150px", },
                    { field: "categoryId", title: $translate.instant('COMMON_CATEGORY'), hidden: true, values: categories, width: "150px", },
                    {
                        field: "avgRating", title: $translate.instant('TASKMANAGEMENT_STAR_RATING'), width: "170px", template: function (data) {
                            var template = "";
                            for (var i = 0; i < parseInt(data.avgRating); i++) {
                                template += "<span><label class='fa fa-star fa-fw selected'></label></span>";
                            }
                            return template;

                        }
                    },
                    {
                        field: "avgRating", title: $translate.instant('TASKMANAGEMENT_STAR_RATING'), width: "170px", hidden: true,
                    },
                    {
                        field: "action", title: $translate.instant('COMMON_ACTIONS'), width: "150px", filterable: false, sortable: false,
                        template: function (dataItem) {
                            return "<div class='icon-groups'><a class='fa fa-pencil fa-lg' ng-click='editToDo(" + dataItem.id + ")' ></a>" +
                                "<a class='fa fa-trash fa-lg' ng-click='deleteItemData(" + dataItem.id + ")'></a>" +
                                "<a class='fa fa-copy fa-lg' ng-click='cloneTask(" + dataItem.id + ")'></a>" +
                                "<a class='fa fa-info-circle' ng-click='showActivityLogItemData(" + dataItem.id + ")'></a></div>";
                        },
                    },
                ]
            };

            $scope.tooltipOptions = {
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
        }])
    .controller('todayTasksCtrl', ['$scope', 'cssInjector', 'todosManager', 'localStorageService', '$translate', 'globalVariables', '$compile', '$location',
        function ($scope, cssInjector, todosManager, localStorageService, $translate, globalVariables, $compile, $location) {
            cssInjector.removeAll();
            cssInjector.add('views/todos/today-tasks.css');
            moment.locale(globalVariables.lang.currentUICulture);
            $scope.openTaskDetailPopupMode = {
                isPopupOpen: false
            }
            $scope.init = function () {
                todosManager.getTodosById().then(function (data) {
                    $scope.taskTodos = [];

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
                            taskPriorityListItem: item.taskPriorityListItem,
                            taskStatusListItem: item.taskStatusListItem,
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
                                    taskPriorityListItem: item.taskPriorityListItem,
                                    taskStatusListItem: item.taskStatusListItem,
                                    projectId: item.projectId
                                }
                                $scope.taskTodos.push(x);
                            }
                        })

                    });
                });
            }
            $scope.isProspectingTask = function (todoItem) {
                if (todoItem.taskCategoryListItem.name.toLowerCase().indexOf("prospecting") > -1) {
                    return true;
                }
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
                            data.unshift({ id: null, name: "Select Template..." });
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
                                    todosManager.getTaskScaleRatingByUserId(item.assignedToId).then(function (data) {
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
            $scope.saveTraningFeedback = saveTraningFeedback;
            function saveTraningFeedback() {
                if ($scope.taskFeedback.trainingId == 0) {
                    $scope.taskFeedback.trainingId = null;
                }
                todosManager.saveTraningFeedback($scope.taskFeedback).then(function (data) {
                    if (data.id > 0) {
                        //dialogService.showNotification("Feedback saved successfully", "info");
                    }
                    else {
                        //dialogService.showNotification("Feedback not saved", "warning");
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

            $scope.gotoProspecting = function (todoItem) {
                localStorageService.set("prospectingTask", { taskId: todoItem.id, projectId: todoItem.projectId });
                if (todoItem.taskCategoryListItem.name.toLowerCase() == "prospecting" || todoItem.taskCategoryListItem.name.toLowerCase() == "sales prospecting") {
                    $location.path("/taskProspecting");
                }
                else if (todoItem.taskCategoryListItem.name.toLowerCase() == "service prospecting") {
                    $location.path("/serviceProspecting");
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

            $scope.editToDo = function (todoId) {
                $location.path('/home/todos/todos/edit/' + todoId);
            }

        }])
    .controller('upcomingPersonalTasksCtrl', ['$scope', 'cssInjector', 'todosManager', 'localStorageService', '$translate', 'globalVariables', '$compile', '$location',
        function ($scope, cssInjector, todosManager, localStorageService, $translate, globalVariables, $compile, $location) {
            cssInjector.removeAll();
            cssInjector.add('views/todos/today-tasks.css');
            moment.locale(globalVariables.lang.currentUICulture);
            $scope.openTaskDetailPopupMode = {
                isPopupOpen: false
            }
            $scope.init = function () {
                todosManager.getTodosById().then(function (data) {
                    $scope.upcomingTaskTodos = [];

                    var today = new Date();
                    today = today.setHours(0, 0, 0, 0);
                    angular.forEach(data, function (item, index) {
                        if (item.taskCategoryListItem.name == "Personal") {
                            item.start = moment(kendo.parseDate(item.startDate)).toDate();
                            item.taskId = item.id;
                            item.end = moment(kendo.parseDate(item.dueDate)).toDate();
                            if (kendo.parseDate(item.start).setHours(0, 0, 0, 0) > today) {
                                $scope.upcomingTaskTodos.push(item);
                                //var event = new kendo.data.SchedulerEvent({
                                //    id: item.id,
                                //    title: item.title,
                                //    start: kendo.parseDate(item.startDate),
                                //    end: kendo.parseDate(item.dueDate),
                                //    recurrenceRule: item.recurrenceRule,
                                //    taskCategoryListItem: item.taskCategoryListItem,
                                //    taskPriorityListItem: item.taskPriorityListItem,
                                //    taskStatusListItem: item.taskStatusListItem,
                                //    training: item.training,
                                //    trainingId: item.trainingId,
                                //    isAllDay: moment(kendo.parseDate(item.startDate)).format("HHmmss") == "000000",
                                //    textColor: (item.taskCategoryListItem ? item.taskCategoryListItem.textColor : "#FFFFFF"),
                                //    color: (item.taskCategoryListItem ? item.taskCategoryListItem.color : "#000000"),
                                //    projectId: item.projectId
                                //});
                                //var occurrences = event.expand(kendo.parseDate(item.startDate), kendo.parseDate(item.dueDate));
                                //_.each(occurrences, function (todoItem) {
                                //    var todoItemStartDate = _.clone(todoItem.start);
                                //    if (kendo.parseDate(todoItemStartDate).setHours(0, 0, 0, 0) == today) {
                                //        var x = {
                                //            assignedToId: item.assignedToId,
                                //            categoryId: item.categoryId,
                                //            title: item.title,
                                //            description: item.description,
                                //            startDate: moment(kendo.parseDate(todoItem.start)).format('L LT'),
                                //            dueDate: moment(kendo.parseDate(todoItem.start)).endOf('day').format('L LT'),
                                //            id: item.id,
                                //            isCompleted: false,
                                //            recurrenceRule: item.recurrenceRule,
                                //            taskId: item.id,
                                //            taskActualStartDate: moment(kendo.parseDate(item.startDate)).format('L LT'),
                                //            taskActualDueDate: moment(kendo.parseDate(item.dueDate)).format('L LT'),
                                //            taskCategoryListItem: item.taskCategoryListItem,
                                //            taskPriorityListItem: item.taskPriorityListItem,
                                //            taskStatusListItem: item.taskStatusListItem,
                                //            projectId: item.projectId
                                //        }
                                //        $scope.taskTodos.push(x);
                                //    }
                                //})
                            }
                        }
                    });
                });
            }
            $scope.isProspectingTask = function (todoItem) {
                if (todoItem.taskCategoryListItem.name.toLowerCase().indexOf("prospecting") > -1) {
                    return true;
                }
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
                            data.unshift({ id: null, name: "Select Template..." });
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
                                    todosManager.getTaskScaleRatingByUserId(item.assignedToId).then(function (data) {
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
            $scope.saveTraningFeedback = saveTraningFeedback;
            function saveTraningFeedback() {
                if ($scope.taskFeedback.trainingId == 0) {
                    $scope.taskFeedback.trainingId = null;
                }
                todosManager.saveTraningFeedback($scope.taskFeedback).then(function (data) {
                    if (data.id > 0) {
                        //dialogService.showNotification("Feedback saved successfully", "info");
                    }
                    else {
                        //dialogService.showNotification("Feedback not saved", "warning");
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

            $scope.gotoProspecting = function (todoItem) {
                localStorageService.set("prospectingTask", { taskId: todoItem.id, projectId: todoItem.projectId });
                if (todoItem.taskCategoryListItem.name.toLowerCase() == "prospecting" || todoItem.taskCategoryListItem.name.toLowerCase() == "sales prospecting") {
                    $location.path("/taskProspecting");
                }
                else if (todoItem.taskCategoryListItem.name.toLowerCase() == "service prospecting") {
                    $location.path("/serviceProspecting");
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

            $scope.editToDo = function (todoId) {
                $location.path('/home/todos/todos/edit/' + todoId);
            }

        }])
    .controller('completedPersonalTasksCtrl', ['$scope', 'cssInjector', 'todosManager', 'localStorageService', '$translate', 'globalVariables', '$compile', '$location',
        function ($scope, cssInjector, todosManager, localStorageService, $translate, globalVariables, $compile, $location) {
            cssInjector.removeAll();
            cssInjector.add('views/todos/today-tasks.css');
            moment.locale(globalVariables.lang.currentUICulture);
            $scope.openTaskDetailPopupMode = {
                isPopupOpen: false
            }
            $scope.init = function () {
                todosManager.getTodosById().then(function (data) {
                    $scope.completedTaskTodos = [];

                    var today = new Date();
                    today = today.setHours(0, 0, 0, 0);
                    angular.forEach(data, function (item, index) {
                        if (item.taskCategoryListItem.name == "Personal") {
                            item.start = moment(kendo.parseDate(item.startDate)).toDate();
                            item.taskId = item.id;
                            item.end = moment(kendo.parseDate(item.dueDate)).toDate();
                            if (kendo.parseDate(item.end).setHours(0, 0, 0, 0) < today) {
                                $scope.completedTaskTodos.push(item);
                                //var event = new kendo.data.SchedulerEvent({
                                //    id: item.id,
                                //    title: item.title,
                                //    start: kendo.parseDate(item.startDate),
                                //    end: kendo.parseDate(item.dueDate),
                                //    recurrenceRule: item.recurrenceRule,
                                //    taskCategoryListItem: item.taskCategoryListItem,
                                //    taskPriorityListItem: item.taskPriorityListItem,
                                //    taskStatusListItem: item.taskStatusListItem,
                                //    training: item.training,
                                //    trainingId: item.trainingId,
                                //    isAllDay: moment(kendo.parseDate(item.startDate)).format("HHmmss") == "000000",
                                //    textColor: (item.taskCategoryListItem ? item.taskCategoryListItem.textColor : "#FFFFFF"),
                                //    color: (item.taskCategoryListItem ? item.taskCategoryListItem.color : "#000000"),
                                //    projectId: item.projectId
                                //});
                                //var occurrences = event.expand(kendo.parseDate(item.startDate), kendo.parseDate(item.dueDate));
                                //_.each(occurrences, function (todoItem) {
                                //    var todoItemStartDate = _.clone(todoItem.start);
                                //    if (kendo.parseDate(todoItemStartDate).setHours(0, 0, 0, 0) == today) {
                                //        var x = {
                                //            assignedToId: item.assignedToId,
                                //            categoryId: item.categoryId,
                                //            title: item.title,
                                //            description: item.description,
                                //            startDate: moment(kendo.parseDate(todoItem.start)).format('L LT'),
                                //            dueDate: moment(kendo.parseDate(todoItem.start)).endOf('day').format('L LT'),
                                //            id: item.id,
                                //            isCompleted: false,
                                //            recurrenceRule: item.recurrenceRule,
                                //            taskId: item.id,
                                //            taskActualStartDate: moment(kendo.parseDate(item.startDate)).format('L LT'),
                                //            taskActualDueDate: moment(kendo.parseDate(item.dueDate)).format('L LT'),
                                //            taskCategoryListItem: item.taskCategoryListItem,
                                //            taskPriorityListItem: item.taskPriorityListItem,
                                //            taskStatusListItem: item.taskStatusListItem,
                                //            projectId: item.projectId
                                //        }
                                //        $scope.taskTodos.push(x);
                                //    }
                                //})
                            }
                        }
                    });
                });
            }
            $scope.isProspectingTask = function (todoItem) {
                if (todoItem.taskCategoryListItem.name.toLowerCase().indexOf("prospecting") > -1) {
                    return true;
                }
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
                            data.unshift({ id: null, name: "Select Template..." });
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
                                    todosManager.getTaskScaleRatingByUserId(item.assignedToId).then(function (data) {
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
            $scope.saveTraningFeedback = saveTraningFeedback;
            function saveTraningFeedback() {
                if ($scope.taskFeedback.trainingId == 0) {
                    $scope.taskFeedback.trainingId = null;
                }
                todosManager.saveTraningFeedback($scope.taskFeedback).then(function (data) {
                    if (data.id > 0) {
                        //dialogService.showNotification("Feedback saved successfully", "info");
                    }
                    else {
                        //dialogService.showNotification("Feedback not saved", "warning");
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

            $scope.gotoProspecting = function (todoItem) {
                localStorageService.set("prospectingTask", { taskId: todoItem.id, projectId: todoItem.projectId });
                if (todoItem.taskCategoryListItem.name.toLowerCase() == "prospecting" || todoItem.taskCategoryListItem.name.toLowerCase() == "sales prospecting") {
                    $location.path("/taskProspecting");
                }
                else if (todoItem.taskCategoryListItem.name.toLowerCase() == "service prospecting") {
                    $location.path("/serviceProspecting");
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

            $scope.editToDo = function (todoId) {
                $location.path('/home/todos/todos/edit/' + todoId);
            }

        }])

    .controller('upcomingCorporateTasksCtrl', ['$scope', 'cssInjector', 'todosManager', 'localStorageService', '$translate', 'globalVariables', '$compile', '$location',
        function ($scope, cssInjector, todosManager, localStorageService, $translate, globalVariables, $compile, $location) {
            cssInjector.removeAll();
            cssInjector.add('views/todos/today-tasks.css');
            moment.locale(globalVariables.lang.currentUICulture);
            $scope.openTaskDetailPopupMode = {
                isPopupOpen: false
            }
            $scope.init = function () {
                todosManager.getTodosById().then(function (data) {
                    $scope.upcomingTaskTodos = [];

                    var today = new Date();
                    today = today.setHours(0, 0, 0, 0);
                    angular.forEach(data, function (item, index) {
                        if (item.taskCategoryListItem.name != "Personal") {
                            item.start = moment(kendo.parseDate(item.startDate)).toDate();
                            item.taskId = item.id;
                            item.end = moment(kendo.parseDate(item.dueDate)).toDate();
                            if (kendo.parseDate(item.start).setHours(0, 0, 0, 0) > today) {
                                $scope.upcomingTaskTodos.push(item);
                                //var event = new kendo.data.SchedulerEvent({
                                //    id: item.id,
                                //    title: item.title,
                                //    start: kendo.parseDate(item.startDate),
                                //    end: kendo.parseDate(item.dueDate),
                                //    recurrenceRule: item.recurrenceRule,
                                //    taskCategoryListItem: item.taskCategoryListItem,
                                //    taskPriorityListItem: item.taskPriorityListItem,
                                //    taskStatusListItem: item.taskStatusListItem,
                                //    training: item.training,
                                //    trainingId: item.trainingId,
                                //    isAllDay: moment(kendo.parseDate(item.startDate)).format("HHmmss") == "000000",
                                //    textColor: (item.taskCategoryListItem ? item.taskCategoryListItem.textColor : "#FFFFFF"),
                                //    color: (item.taskCategoryListItem ? item.taskCategoryListItem.color : "#000000"),
                                //    projectId: item.projectId
                                //});
                                //var occurrences = event.expand(kendo.parseDate(item.startDate), kendo.parseDate(item.dueDate));
                                //_.each(occurrences, function (todoItem) {
                                //    var todoItemStartDate = _.clone(todoItem.start);
                                //    if (kendo.parseDate(todoItemStartDate).setHours(0, 0, 0, 0) == today) {
                                //        var x = {
                                //            assignedToId: item.assignedToId,
                                //            categoryId: item.categoryId,
                                //            title: item.title,
                                //            description: item.description,
                                //            startDate: moment(kendo.parseDate(todoItem.start)).format('L LT'),
                                //            dueDate: moment(kendo.parseDate(todoItem.start)).endOf('day').format('L LT'),
                                //            id: item.id,
                                //            isCompleted: false,
                                //            recurrenceRule: item.recurrenceRule,
                                //            taskId: item.id,
                                //            taskActualStartDate: moment(kendo.parseDate(item.startDate)).format('L LT'),
                                //            taskActualDueDate: moment(kendo.parseDate(item.dueDate)).format('L LT'),
                                //            taskCategoryListItem: item.taskCategoryListItem,
                                //            taskPriorityListItem: item.taskPriorityListItem,
                                //            taskStatusListItem: item.taskStatusListItem,
                                //            projectId: item.projectId
                                //        }
                                //        $scope.taskTodos.push(x);
                                //    }
                                //})
                            }
                        }
                    });
                });
            }
            $scope.isProspectingTask = function (todoItem) {
                if (todoItem.taskCategoryListItem.name.toLowerCase().indexOf("prospecting") > -1) {
                    return true;
                }
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
                            data.unshift({ id: null, name: "Select Template..." });
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
                                    todosManager.getTaskScaleRatingByUserId(item.assignedToId).then(function (data) {
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
            $scope.saveTraningFeedback = saveTraningFeedback;
            function saveTraningFeedback() {
                if ($scope.taskFeedback.trainingId == 0) {
                    $scope.taskFeedback.trainingId = null;
                }
                todosManager.saveTraningFeedback($scope.taskFeedback).then(function (data) {
                    if (data.id > 0) {
                        //dialogService.showNotification("Feedback saved successfully", "info");
                    }
                    else {
                        //dialogService.showNotification("Feedback not saved", "warning");
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

            $scope.gotoProspecting = function (todoItem) {
                localStorageService.set("prospectingTask", { taskId: todoItem.id, projectId: todoItem.projectId });
                if (todoItem.taskCategoryListItem.name.toLowerCase() == "prospecting" || todoItem.taskCategoryListItem.name.toLowerCase() == "sales prospecting") {
                    $location.path("/taskProspecting");
                }
                else if (todoItem.taskCategoryListItem.name.toLowerCase() == "service prospecting") {
                    $location.path("/serviceProspecting");
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

            $scope.editToDo = function (todoId) {
                $location.path('/home/todos/todos/edit/' + todoId);
            }

        }])
    .controller('completedCorporateTasksCtrl', ['$scope', 'cssInjector', 'todosManager', 'localStorageService', '$translate', 'globalVariables', '$compile', '$location',
        function ($scope, cssInjector, todosManager, localStorageService, $translate, globalVariables, $compile, $location) {
            cssInjector.removeAll();
            cssInjector.add('views/todos/today-tasks.css');
            moment.locale(globalVariables.lang.currentUICulture);
            $scope.openTaskDetailPopupMode = {
                isPopupOpen: false
            }
            $scope.init = function () {
                todosManager.getTodosById().then(function (data) {
                    $scope.completedTaskTodos = [];

                    var today = new Date();
                    today = today.setHours(0, 0, 0, 0);
                    angular.forEach(data, function (item, index) {
                        if (item.taskCategoryListItem.name != "Personal") {
                            item.start = moment(kendo.parseDate(item.startDate)).toDate();
                            item.taskId = item.id;
                            item.end = moment(kendo.parseDate(item.dueDate)).toDate();
                            if (kendo.parseDate(item.end).setHours(0, 0, 0, 0) < today) {
                                $scope.completedTaskTodos.push(item);
                                //var event = new kendo.data.SchedulerEvent({
                                //    id: item.id,
                                //    title: item.title,
                                //    start: kendo.parseDate(item.startDate),
                                //    end: kendo.parseDate(item.dueDate),
                                //    recurrenceRule: item.recurrenceRule,
                                //    taskCategoryListItem: item.taskCategoryListItem,
                                //    taskPriorityListItem: item.taskPriorityListItem,
                                //    taskStatusListItem: item.taskStatusListItem,
                                //    training: item.training,
                                //    trainingId: item.trainingId,
                                //    isAllDay: moment(kendo.parseDate(item.startDate)).format("HHmmss") == "000000",
                                //    textColor: (item.taskCategoryListItem ? item.taskCategoryListItem.textColor : "#FFFFFF"),
                                //    color: (item.taskCategoryListItem ? item.taskCategoryListItem.color : "#000000"),
                                //    projectId: item.projectId
                                //});
                                //var occurrences = event.expand(kendo.parseDate(item.startDate), kendo.parseDate(item.dueDate));
                                //_.each(occurrences, function (todoItem) {
                                //    var todoItemStartDate = _.clone(todoItem.start);
                                //    if (kendo.parseDate(todoItemStartDate).setHours(0, 0, 0, 0) == today) {
                                //        var x = {
                                //            assignedToId: item.assignedToId,
                                //            categoryId: item.categoryId,
                                //            title: item.title,
                                //            description: item.description,
                                //            startDate: moment(kendo.parseDate(todoItem.start)).format('L LT'),
                                //            dueDate: moment(kendo.parseDate(todoItem.start)).endOf('day').format('L LT'),
                                //            id: item.id,
                                //            isCompleted: false,
                                //            recurrenceRule: item.recurrenceRule,
                                //            taskId: item.id,
                                //            taskActualStartDate: moment(kendo.parseDate(item.startDate)).format('L LT'),
                                //            taskActualDueDate: moment(kendo.parseDate(item.dueDate)).format('L LT'),
                                //            taskCategoryListItem: item.taskCategoryListItem,
                                //            taskPriorityListItem: item.taskPriorityListItem,
                                //            taskStatusListItem: item.taskStatusListItem,
                                //            projectId: item.projectId
                                //        }
                                //        $scope.taskTodos.push(x);
                                //    }
                                //})
                            }
                        }
                    });
                });
            }
            $scope.isProspectingTask = function (todoItem) {
                if (todoItem.taskCategoryListItem.name.toLowerCase().indexOf("prospecting") > -1) {
                    return true;
                }
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
                            data.unshift({ id: null, name: "Select Template..." });
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
                                    todosManager.getTaskScaleRatingByUserId(item.assignedToId).then(function (data) {
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
            $scope.saveTraningFeedback = saveTraningFeedback;
            function saveTraningFeedback() {
                if ($scope.taskFeedback.trainingId == 0) {
                    $scope.taskFeedback.trainingId = null;
                }
                todosManager.saveTraningFeedback($scope.taskFeedback).then(function (data) {
                    if (data.id > 0) {
                        //dialogService.showNotification("Feedback saved successfully", "info");
                    }
                    else {
                        //dialogService.showNotification("Feedback not saved", "warning");
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

            $scope.gotoProspecting = function (todoItem) {
                localStorageService.set("prospectingTask", { taskId: todoItem.id, projectId: todoItem.projectId });
                if (todoItem.taskCategoryListItem.name.toLowerCase() == "prospecting" || todoItem.taskCategoryListItem.name.toLowerCase() == "sales prospecting") {
                    $location.path("/taskProspecting");
                }
                else if (todoItem.taskCategoryListItem.name.toLowerCase() == "service prospecting") {
                    $location.path("/serviceProspecting");
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

            $scope.editToDo = function (todoId) {
                $location.path('/home/todos/todos/edit/' + todoId);
            }

        }])


    .controller('calanderCtrl', ['$scope', '$location', '$stateParams', 'authService', '$cacheFactory', 'cssInjector', 'todosService', 'todoService', 'todosManager', 'dialogService', 'apiService', 'todos', 'allcategories', 'allpriorities', 'allstatuses', 'users', 'tasksSettingsService', 'todoManager', '$translate',
        function ($scope, $location, $stateParams, authService, $cacheFactory, cssInjector, todosService, todoService, todosManager, dialogService, apiService, todos, categories, priorities, statuses, users, tasksSettingsService, todoManager, $translate) {
            cssInjector.removeAll();
            cssInjector.add('../Scripts/kendo/2015.1.318_proffessional/styles/kendo.default.min.css');
            todoManager.getTodosById().then(function (data) {
                $scope.todos = [];
                angular.forEach(data, function (item, index) {
                    item.start = kendo.parseDate(item.startDate);
                    item.taskId = item.id;
                    item.end = kendo.parseDate(item.dueDate);
                    var event = new kendo.data.SchedulerEvent(item);
                    $scope.todos.push(item);
                });


                $("#taskCalendar").kendoScheduler({
                    date: moment().toDate(),
                    views: [
                        { type: "day", title: $translate.instant('COMMON_DAY') },
                        { type: "workWeek", selected: true, title: $translate.instant('COMMON_HISTORY') },
                        { type: "week", title: $translate.instant('COMMON_WEEK') },
                        { type: "month", title: $translate.instant('COMMON_MONTH') }
                    ],
                    height: 600,
                    //timezone: "Etc/UTC",
                    resources: [
                        {
                            field: "categoryId",
                            dataSource: categories
                        }
                    ],
                    editable: true,
                    eventTemplate: $("#event-template").html(),
                    allDayEventTemplate: $("#event-template").html(),
                });

                var dataSource = getDataSource();
                $("#taskCalendar").data("kendoScheduler").setDataSource(dataSource);
            });

            function getDataSource() {

                var ds = [];
                angular.forEach($scope.todos, function (item, index) {
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
                        //textColor: item.taskCategoryListItem.textColor,
                        color: (item.taskCategoryListItem ? item.taskCategoryListItem.colors : "#000000"), //item.taskCategoryListItem.color
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
                            //StartTimezone: "Etc/UTC",
                            //EndTimezone: "Etc/UTC",
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
                                id: { from: "id", type: "number" },
                                title: { from: "title", defaultValue: "No title", validation: { required: true } },
                                start: { type: "date", from: "start" },
                                end: { type: "date", from: "end" },
                                startTimezone: { from: "StartTimezone" },
                                endTimezone: { from: "EndTimezone" },
                                //description: { from: "Description" },
                                //recurrenceId: { from: "RecurrenceID" },
                                //recurrenceRule: { from: "recurrenceRule" },
                                //recurrenceException: { from: "RecurrenceException" },
                                //ownerId: { from: "OwnerID", defaultValue: 1 },
                                isAllDay: { type: "boolean", from: "isAllDay" },
                                textColor: { from: "textColor" },
                                color: { from: "color" },
                            }
                        }
                    },
                });

                dataSource.fetch();

                return dataSource;
            }

        }])