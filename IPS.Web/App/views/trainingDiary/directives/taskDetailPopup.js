angular.module('ips.trainingdiary')
    .directive('taskDetailPopup', [function () {
        return {
            restrict: 'E',
            templateUrl: 'views/trainingDiary/directives/taskDetailPopup.html',
            scope: {
                taskDetail: '=',
                taskCategories: "=",
                taskStatuses: "=",
                taskPriorities: "=",
                notificationTemplates: '=',
                openTaskDetailPopupMode: '=',
            },
            controller: 'taskDetailPopupCtrl'
        };
    }])

    .controller('taskDetailPopupCtrl', ['$scope', 'trainingsDiaryService', 'dialogService', 'apiService', 'authService', 'tasksSettingsService', 'trainingdiaryManager', 'progressBar', 'reminderEnum', '$translate', 'stageTypesEnum', 'globalVariables',
        function ($scope, trainingsDiaryService, dialogService, apiService, authService, tasksSettingsService, trainingdiaryManager, progressBar, reminderEnum, $translate, stageTypesEnum, globalVariables) {

            $scope.taskDetailWindow;

            $scope.taskDetailInfo = {
                title: "",
                viewName: $translate.instant('TASKPROSPECTING_NEW_TASK'),
                description: "",
                taskListId: 0,
                profileId: 0,
                stageId: 0,
                isCompleted: false,
                completedDate: "",
                createdById: 0,
                createdByName: authService.authentication.user.firstName + " " + authService.authentication.user.lastName,
                createdDate: moment().format('L LT'),
                dueDate: "",
                parentTaskId: null,
                startDate: moment().format('L LT'),
                statusId: null,
                priorityId: null,
                timeEstimateMinutes: moment.duration(0, "minutes").format("hh:mm"),
                timeSpentMinutes: 0,
                assignedToId: null,
                categoryId: null,
                recurrenceRule: "",
                trainingId: "",
                issmsNotification: false,
                notificationTemplateId: null,
                isEmailNotification: false,
                emailBefore: "",
                smsBefore: "",
            }
            $scope.init = function () {
            }
            $scope.showNotificationTemplate = function () {
            }
            $scope.reminders = [
                { value: -1440, text: $translate.instant('COMMON_BEFORE_1_DAY') },
                { value: -60, text: $translate.instant('COMMON_BEFORE_1_HOUR') },
                { value: -30, text: $translate.instant('COMMON_BEFORE_30_MIN') },
                { value: -15, text: $translate.instant('COMMON_BEFORE_15_MIN') },
                { value: -5, text: $translate.instant('COMMON_BEFORE_5_MIN') }];
            $scope.initOnPopupOpen = function () {
                if ($scope.taskDetail) {
                    $scope.taskDetailInfo = $scope.taskDetail;
                }
            };
            $scope.$on("kendoRendered", function (event) {
                if (event.targetScope.taskDetailWindow) {
                    $scope.taskDetailWindow = event.targetScope.taskDetailWindow;
                }
            })
            $scope.closeTaskDetailPopup = function () {
                $scope.openTaskDetailPopupMode.isPopupOpen = false;
                var dialog = $scope.taskDetailWindow.data("kendoWindow");
                if (dialog) {
                    dialog.close();
                    dialog.destroy();
                }
            }
            $scope.$watch('openTaskDetailPopupMode.isPopupOpen', function (newValue, oldValue) {
                $scope.taskDetailWindow = $("#taskDetailWindow");
                if ($scope.taskDetailWindow) {
                    if ($scope.openTaskDetailPopupMode.isPopupOpen) {
                        $scope.initOnPopupOpen();
                        if (!($scope.taskDetailWindow.data("kendoWindow"))) {
                            $scope.taskDetailWindow.kendoWindow({
                                width: "55%",
                                title: $translate.instant('TASKPROSPECTING_TASK_DETAIL'),
                                modal: true,
                                visible: false,
                                close: function () { this.destroy(); },
                                actions: ['Maximize', 'Close']
                            });
                            var dialog = $scope.taskDetailWindow.data("kendoWindow");
                            dialog.open().center();
                        }
                    }
                    else {
                        var dialog = $scope.taskDetailWindow.data("kendoWindow");
                        if (dialog) {
                            dialog.close();
                            dialog.destroy();
                        }
                        $scope.openTaskDetailPopupMode.isPopupOpen = false;
                        //$scope.editingTraining = null;
                        //$scope.taskDetailWindow.close();
                    }
                }
            });
            $scope.filterTaskReminderNotifications = function (item) {
                if (item.id != null) {
                    if ($scope.taskDetailInfo.id > 0) {
                        if ((item.stageTypeId == stageTypesEnum.TaskReminder && item.culture.cultureName == globalVariables.lang.currentUICulture) || item.id == $scope.taskDetailInfo.notificationTemplateId) {
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
                    if ($scope.taskDetailInfo.id > 0) {
                        if ((item.stageTypeId == stageTypesEnum.MeetingSchedule && item.culture.cultureName == globalVariables.lang.currentUICulture) || item.id == $scope.taskDetailInfo.meetingNotificationTemplateId) {
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
                    if ($scope.taskDetailInfo.id > 0) {
                        if ((item.stageTypeId == stageTypesEnum.FollowupSchedule && item.culture.cultureName == globalVariables.lang.currentUICulture) || item.id == $scope.taskDetailInfo.followUpNotificationTemplateId) {
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
                    if ($scope.taskDetailInfo.id > 0) {
                        if ((item.stageTypeId == stageTypesEnum.SalesAgreed && item.culture.cultureName == globalVariables.lang.currentUICulture) || item.id == $scope.taskDetailInfo.followUpNotificationTemplateId) {
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
                if ($scope.taskDetailInfo.categoryId > 0) {
                    var category = _.find($scope.taskCategories, function (item) {
                        return item.id == $scope.taskDetailInfo.categoryId;
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
            function showNotificationTemplate(id) {
                trainingdiaryManager.getNotificationTemplateById(id).then(function (data) {
                    $scope.templateInfo = data;
                    $("#emailBody").html("");
                    $("#emailBody").html(data.emailBody);
                    $("#notificationTemplateModal").modal("show");
                });
            }

        }])