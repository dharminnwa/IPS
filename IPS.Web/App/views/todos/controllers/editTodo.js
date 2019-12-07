(function () {
    'use strict';
    angular
        .module('ips.todos')
        .config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
            $stateProvider
               
                .state('home.todos.todos.edit', {
                    url: "/edit/:taskId",
                    templateUrl: "views/todos/views/todo.edit.html",
                    controller: "toDoEditCtrl as todo",
                    resolve: {
                        task: function ($stateParams, todosManager, authService, todos) {
                            if ($stateParams.taskId == 0) {
                                return {
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
                            }
                            else {
                                return todosManager.getTaskById($stateParams.taskId).then(function (data) {
                                    data.viewName = data.title;
                                    data.startDate = data.startDate ? moment(kendo.parseDate(data.startDate)).format("L LT") : '';
                                    data.dueDate = data.dueDate ? moment(kendo.parseDate(data.dueDate)).format("L LT") : '';
                                    return data;
                                });
                            }
                        },
                        taskList: function ($stateParams, todosManager, task) {
                            return todosManager.getTaskListById(task.taskListId).then(function (data) {
                                return data;
                            });
                        },
                        categories: function ($stateParams, todosManager, taskList) {
                            return todosManager.getTaskCategoriesById(taskList.taskCategoryListsId).then(function (data) {
                                angular.forEach(data.taskCategoryListItems, function (item, index) {
                                    item.text = item.name;
                                    item.value = item.id;
                                });
                                return data.taskCategoryListItems;
                            });
                        },
                        priorities: function ($stateParams, todosManager, taskList) {
                            return todosManager.getTaskPrioritiesById(taskList.taskPriorityListId).then(function (data) {
                                angular.forEach(data.taskPriorityListItems, function (item, index) {
                                    item.text = item.name;
                                    item.value = item.id;
                                });
                                return data.taskPriorityListItems;
                            });
                        },
                        statuses: function ($stateParams, todosManager, taskList) {
                            return todosManager.getTaskStatusesById(taskList.taskStatusListId).then(function (data) {
                                angular.forEach(data.taskStatusListItems, function (item, index) {
                                    item.text = item.name;
                                    item.value = item.id;
                                });
                                return data.taskStatusListItems;
                            });
                        },
                        trainings: function ($stateParams, todosManager, authService, task) {
                            var query = "?$filter=(IsTemplate eq false) and (OrganizationId eq " + parseInt(authService.authentication.user.organizationId) + ")";
                            return todosManager.getTrainings(null).then(function (data) {
                                return data;
                            });
                        },
                        profiles: function ($stateParams, todosManager, authService) {
                            return todosManager.getProfiles(authService.authentication.user.organizationId, "", true).then(function (data) {
                                return data;
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
                        }
                    },
                    data: {
                        displayName: '{{task.viewName}}',
                        paneLimit: 1,
                        depth: 3,
                        resource: "Task"
                    }
                });
        }])
        .controller('toDoEditCtrl', toDoEditCtrl);
    
    toDoEditCtrl.$inject = ['cssInjector', '$stateParams', '$location', 'authService', 'todosManager', 'todosService', 'todoService', '$state', 'apiService', 'dialogService', 'task', 'categories', 'priorities', 'statuses', 'users', 'trainings', 'profiles', 'notificationTemplates', 'reminderEnum', 'templateTypeEnum', 'projects', '$translate', 'stageTypesEnum', 'globalVariables'];
    function toDoEditCtrl(cssInjector, $stateParams, $location, authService, todosManager, todosService, todoService, $state, apiService, dialogService, task, categories, priorities, statuses, users, trainings, profiles, notificationTemplates, reminderEnum, templateTypeEnum, projects, $translate, stageTypesEnum, globalVariables) {
        cssInjector.removeAll();
        cssInjector.add('views/todos/todo.css');
        moment.locale(globalVariables.lang.currentUICulture);
        var vm = this;
        vm.task = task;
        vm.cloneTask = _.clone(task);
        vm.reminders = [
            { value: -1440, text: $translate.instant('COMMON_BEFORE_1_DAY') },
            { value: -60, text: $translate.instant('COMMON_BEFORE_1_HOUR') },
            { value: -30, text: $translate.instant('COMMON_BEFORE_30_MIN') },
            { value: -15, text: $translate.instant('COMMON_BEFORE_15_MIN') },
            { value: -5, text: $translate.instant('COMMON_BEFORE_5_MIN') }];
        vm.categories = categories;
        vm.priorities = priorities;
        vm.statuses = statuses;
        vm.allUsers = users;
        vm.users = users;
        vm.trainings = trainings;
        vm.projects = projects;
        if (task.trainingId > 0) {
            var isTrainingExist = _.any(trainings, function (item) {
                return item.id == task.trainingId;
            });
            if (!isTrainingExist) {
                todosManager.getTrainingById(task.trainingId).then(function (trainingData) {
                    vm.trainings.push(trainingData);
                })
            }
        }
        vm.profiles = profiles;
        vm.stages = [];
        vm.saveAndNew = saveAndNew;
        vm.categoryChange = categoryChange;
        vm.profileChange = profileChange;
        vm.stageChange = stageChange;
        vm.assignedToChange = assignedToChange;
        //vm.emailReminderChange = emailReminderChange;
        vm.isKPITraining = false;
        vm.isTraining = false;
        vm.notifcations = notificationTemplates;
        vm.checkisTraining = checkisTraining;
        vm.showTraining = showTraining;
        vm.showNotificationTemplate = showNotificationTemplate;
        vm.startDateChnage = startDateChnage;
        vm.dueDateOpen = dueDateOpen;
        vm.startDateOpen = startDateOpen;
        vm.trainingInfo = null;
        vm.templateInfo = null;
        vm.taskDueDateOptions = {
            min: kendo.parseDate(vm.task.startDate)
        };
        vm.projectChange = projectChange;
        vm.filterTaskReminderNotifications = function (item) {
            if (item.id != null) {
                if (vm.task.id > 0) {
                    if ((item.stageTypeId == stageTypesEnum.TaskReminder && item.culture.cultureName == globalVariables.lang.currentUICulture) || item.id == vm.task.notificationTemplateId) {
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
        vm.filterMeetingScheduleNotifications = function (item) {
            if (item.id != null) {
                if (vm.task.id > 0) {
                    if ((item.stageTypeId == stageTypesEnum.MeetingSchedule && item.culture.cultureName == globalVariables.lang.currentUICulture) || item.id == vm.cloneTask.meetingNotificationTemplateId) {
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
        vm.filterFollowupScheduleNotifications = function (item) {
            if (item.id != null) {
                if (vm.task.id > 0) {
                    if ((item.stageTypeId == stageTypesEnum.FollowupSchedule && item.culture.cultureName == globalVariables.lang.currentUICulture) || item.id == vm.cloneTask.followUpNotificationTemplateId) {
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
        vm.filterSalesNotificationTemplates = function (item) {
            if (item.id != null) {
                if (vm.task.id > 0) {
                    if ((item.stageTypeId == stageTypesEnum.SalesAgreed && item.culture.cultureName == globalVariables.lang.currentUICulture) || item.id == vm.cloneTask.salesNotificationTemplateId) {
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
        vm.isProspectingCategory = function () {
            if (vm.task.categoryId > 0) {
                var category = _.find(categories, function (item) {
                    return item.value == vm.task.categoryId;
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
        vm.hasDelegateTasksPermition = hasDelegateTasksPermition;
        vm.save = save;
        vm.remove = remove;
        vm.back = back;
        if (task.stageId > 0) {
            profileChange()
        }
        if ($stateParams.taskId == 0) {
            setDefalutValues();
        }
        function startDateChnage(event) {
            if (moment(kendo.parseDate(event.sender.value())).isAfter(moment(kendo.parseDate(vm.task.dueDate)))) {
                vm.task.dueDate = null;
            }
        }
        function startDateOpen(event) {
            if (vm.task.projectId > 0) {
                var selectedProject = _.find(vm.projects, function (item) {
                    return item.id == vm.task.projectId;
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
            if (vm.task.projectId > 0) {
                var selectedProject = _.find(vm.projects, function (item) {
                    return item.id == vm.task.projectId;
                });
                if (selectedProject) {
                    var datepicker = $(event.sender.element).data("kendoDateTimePicker")
                    datepicker.setOptions({
                        min: kendo.parseDate(vm.task.startDate),
                        max: kendo.parseDate(selectedProject.expectedEndDate)
                    });
                }
            }
            else {
                var datepicker = $(event.sender.element).data("kendoDateTimePicker")
                datepicker.setOptions({
                    min: kendo.parseDate(vm.task.startDate)
                });
            }
        }
        function assignedToChange() {
            if (vm.isKPITraining) {
                if (vm.trainings) {
                    var filteredTrainnings = _.filter(vm.trainings, function (item) {
                        return item.participantId == vm.task.assignedToId;
                    });
                    vm.trainings = filteredTrainnings;
                }
            }
        }
        function categoryChange() {
            vm.task.assignedToId = 0;
            vm.task.trainingId = 0;
            vm.trainings = [];
            vm.users = [];
            var isKPITraining = _.filter(vm.categories, function (item) {
                return item.name.toLowerCase().indexOf('kpi training') > -1 && item.id == vm.task.categoryId;
            });
            if (isKPITraining.length > 0) {
                vm.isTraining = false;
                vm.isKPITraining = true;
                vm.trainings = [];
            }
            else {
                vm.isKPITraining = false;
                var isTraining = _.filter(vm.categories, function (item) {
                    return item.name.toLowerCase() == "training" && item.id == vm.task.categoryId;
                });
                if (isTraining.length > 0) {
                    vm.isTraining = true;
                }
                else {
                    vm.isTraining = false;
                }
                vm.trainings = trainings;
                vm.users = users;
            }
            projectChange();
        }
        function checkisTraining() {
            var isKPITraining = _.filter(vm.categories, function (item) {
                return item.name.toLowerCase().indexOf('kpi training') > -1 && item.id == vm.task.categoryId;
            });
            if (isKPITraining.length > 0) {
                vm.isTraining = false;
                vm.isKPITraining = true;
            }
            else {
                vm.isKPITraining = false;
                var isTraining = _.filter(vm.categories, function (item) {
                    return item.name.toLowerCase() == "training" && item.id == vm.task.categoryId;
                });
                if (isTraining.length > 0) {
                    vm.isTraining = true;
                }
                else {
                    vm.isTraining = false;
                }
            }
            if (vm.isTraining || vm.isKPITraining) {
                return true;
            }
            else {
                return false;
            }
        }
        function profileChange() {
            todosManager.getProfileStages(vm.task.profileId, 0).then(function (data) {
                vm.stages = [];
                _.forEach(data, function (item, index) {
                    vm.stages.push({ id: item.id, name: item.name + " (" + item.statusText + ")" });
                });
            });
        }
        function stageChange() {
            getKPITraining();
        }
        function projectChange() {
            //vm.task.assignedToId = 0;
            //vm.task.dueDate = null;
            if (vm.task.projectId > 0) {
                todosManager.getProjectMembers(vm.task.projectId).then(function (data) {
                    var projectUserIds = [];
                    _.each(data, function (item) {
                        projectUserIds.push(item.userId);
                    })
                    var filterUsers = _.filter(vm.allUsers, function (item) {
                        return projectUserIds.indexOf(item.id) > -1;
                    });
                    vm.users = filterUsers;
                    if (vm.task.id > 0) {
                        var isCurrentUser = _.find(vm.users, function (item) {
                            return item.id == vm.task.assignedToId;
                        })
                        if (isCurrentUser) {
                            vm.task.assignedToId = parseInt(authService.authentication.user.userId)
                        }
                        else if (vm.task.assignedToId > 0) {
                            var isExist = _.find(vm.users, function (item) {
                                return item.id == parseInt(vm.task.assignedToId);
                            });
                            if (!isExist) {
                                vm.task.assignedToId = 0;
                            }
                        }
                        else {
                            vm.task.assignedToId = 0;
                        }
                    }
                    else {
                        var isCurrentUser = _.find(vm.users, function (item) {
                            return item.id == parseInt(authService.authentication.user.userId);
                        })
                        if (isCurrentUser) {
                            vm.task.assignedToId = parseInt(authService.authentication.user.userId)
                        }
                        else if (vm.task.assignedToId > 0) {
                            var isExist = _.find(vm.users, function (item) {
                                return item.id == parseInt(vm.task.assignedToId);
                            });
                            if (!isExist) {
                                vm.task.assignedToId = 0;
                            }
                        }
                    }
                });
            }
            else {
                vm.users = vm.allUsers;
            }
        }
        function getKPITraining() {
            if (vm.isKPITraining) {
                vm.trainings = [];
                todosManager.getKPITraining(vm.task.profileId, vm.task.stageId).then(function (data) {
                    var users = [];
                    if (data.length > 0) {
                        _.forEach(data, function (questionItem) {
                            users.push(questionItem.participantUser)
                            questionItem.participantId = questionItem.participantUser.id;
                            _.forEach(questionItem.agreement.trainings, function (trainingItem) {
                                trainingItem["participantId"] = questionItem.participantId;
                                vm.trainings.push(trainingItem);
                            })
                        });
                        vm.users = _.uniq(users, function (user) {
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
                vm.trainingInfo = data;
                vm.trainingMaterialsdataSource = new kendo.data.DataSource({
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
                    dataSource: vm.trainingMaterialsdataSource,
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
                vm.templateInfo = data;
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
            if ($stateParams.taskId == 0) {
                todosManager.createTask(taskCopy).then(function (data) {
                    $location.path('home/todos/todos/edit/' + data);
                    dialogService.showNotification($translate.instant('TASKPROSPECTING_SAVED_SUCCESFULLY'), 'info');
                    todoService.load();
                }, function (message) {
                    dialogService.showNotification(message, "warning");
                });
            } else {
                todosManager.updateTask(taskCopy).then(function (data) {
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
            if ($stateParams.taskId == 0) {
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
            } else {
                todosManager.updateTask(taskCopy).then(function (data) {
                    dialogService.showNotification($translate.instant('TASKPROSPECTING_SAVED_SUCCESFULLY'), 'info');
                    $location.path('home/todos/todos/edit/0');
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
                todosManager.removeTask(vm.task.id).then(function (data) {
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
            vm.task.assignedToId = parseInt(authService.authentication.user.userId);
            vm.task.emailBefore = -15;
            var defaultTaskTemplate = _.find(notificationTemplates, function (item) {
                return item.notificationTemplateTypeId == templateTypeEnum.Tasks && item.stageTypeId == stageTypesEnum.TaskReminder && item.isDefualt == true;
            })
            if (defaultTaskTemplate) {
                vm.task.notificationTemplateId = defaultTaskTemplate.id
            }
            var defaultMeetingTaskTemplate = _.find(notificationTemplates, function (item) {
                return item.notificationTemplateTypeId == templateTypeEnum.Tasks && item.stageTypeId == stageTypesEnum.MeetingSchedule && item.culture.cultureName == globalVariables.lang.currentUICulture && item.organizationId == authService.authentication.user.organizationId && item.isDefualt == true;
            })
            if (defaultMeetingTaskTemplate) {
                vm.task.meetingNotificationTemplateId = defaultMeetingTaskTemplate.id
            }
            var defaultfollowUpTaskTemplate = _.find(notificationTemplates, function (item) {
                return item.notificationTemplateTypeId == templateTypeEnum.Tasks && item.stageTypeId == stageTypesEnum.FollowupSchedule && item.culture.cultureName == globalVariables.lang.currentUICulture && item.organizationId == authService.authentication.user.organizationId && item.isDefualt == true;
            })
            if (defaultfollowUpTaskTemplate) {
                vm.task.followUpNotificationTemplateId = defaultfollowUpTaskTemplate.id
            }
            var defaultSalesAgreedTemplate = _.find(notificationTemplates, function (item) {
                return item.notificationTemplateTypeId == templateTypeEnum.Tasks && item.stageTypeId == stageTypesEnum.SalesAgreed && item.culture.cultureName == globalVariables.lang.currentUICulture && item.organizationId == authService.authentication.user.organizationId && item.isDefualt == true;
            })
            if (defaultSalesAgreedTemplate) {
                vm.task.salesNotificationTemplateId = defaultSalesAgreedTemplate.id
            }
        }
        
    }
})();







