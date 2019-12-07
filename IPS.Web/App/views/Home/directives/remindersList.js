(function () {
    'use strict';

    angular
        .module('ips')
        .directive('remindersList', remindersList);

    remindersList.$inject = ['lookupService', 'reminderManager', '$location'];

    function remindersList(lookupService, reminderManager, $location) {

        return {
            restrict: 'E',
            replace: true,
            templateUrl: 'views/home/directives/reminders-list.html',
            controller: function ($scope) {


                $scope.$location = $location;

                $scope.$watch('$location.path()', function (newValue) {
                    if (newValue == '/home') {
                        getReminders();
                    }
                });

                $scope.selectedReminder;

                $scope.stageEndDate;

                $scope.minDate = setMinDate();

                function setMinDate() {
                    var tommorow = new Date();
                    tommorow.setDate(tommorow.getDate() + 1);
                    return tommorow;
                }

                function getReminders() {
                    if ($scope.authentication.user.id) {
                        reminderManager.getRemindersById($scope.authentication.user.id).then(function (data) {
                            var remindersList = createRemindersList(data);
                            $scope.reminders = remindersList;
                        });
                    }
                }

                function createRemindersList(remindersData) {
                    var result = [];
                    if (remindersData) {
                        for (var i = 0, len = remindersData.length; i < len; i++) {
                            var reminder = createReminder(remindersData[i]);
                            (reminder) ? result.push(reminder) : '';
                            if (result.length == 5) {
                                return result;
                            }
                        }
                    }

                    return result;
                }

                function createReminder(reminderData) {
                    if(moment(reminderData.dueDate) < moment()) 
                        return {
                            text: 'Survey for a ' + reminderData.stage.name + ' for profile ' + reminderData.profile.name + ' is expired. Please contact your administrator.',
                            dueDate: reminderData.dueDate,
                            id: reminderData.id,
                            stageEndDate: reminderData.stage.endDateTime,
                            isExpired: true
                        };

                    var evaluate = 1, setKPI = 2, setFinalKPI = 3;
                    switch (reminderData.reminderType) {
                        case evaluate: return checkEvaluate(reminderData);
                        case setKPI: return checkSetKPI(reminderData);
                        case setFinalKPI: return checkSetFinalKPI(reminderData);
                        default: return null;
                    }
                }

                function checkEvaluate(reminderData) {
                    var isStandAloneMode = false;
                    if (reminderData.isSelfEvaluation) {
                        if (reminderData && reminderData.profile) {
                            return {
                                text: 'Please, conduct ' + reminderData.profile.name + ' self-evaluation for a ' + reminderData.stage.name + '.',
                                link: '#/home/survey/' + reminderData.profile.id + '/' + reminderData.stage.id + '/' + reminderData.evaluator.id + '/' + isStandAloneMode + '',
                                dueDate: reminderData.dueDate,
                                id: reminderData.id,
                                stageEndDate: reminderData.stage.endDateTime
                            }
                        }
                    } else {
                        if (reminderData && reminderData.profile && reminderData.evaluatee) {
                            return {
                                text: 'Please, evaluate ' + reminderData.evaluatee.firstName + ' ' + reminderData.evaluatee.lastName + '. Profile: ' + reminderData.profile.name + '. Stage: ' + reminderData.stage.name + '.',
                                link: '#/home/survey/' + reminderData.profile.id + '/' + reminderData.stage.id + '/' + reminderData.evaluator.id + '/' + isStandAloneMode + '',
                                dueDate: reminderData.dueDate,
                                id: reminderData.id,
                                stageEndDate: reminderData.stage.endDateTime
                            }
                        }
                    }
                }

                function checkSetKPI(reminderData) {
                    if (reminderData.isSelfEvaluation) {
                            return {
                                text: 'Please, Set KPI for profile ' + reminderData.profile.name + ' (self-evaluation) for a ' + reminderData.stage.name + '.',
                                link: '#/home/KPI/' + reminderData.profile.id + '/' + reminderData.stage.id + '/' + reminderData.evaluator.id,
                                dueDate: reminderData.dueDate,
                                id: reminderData.id,
                                stageEndDate: reminderData.stage.endDateTime
                        }
                    } else {
                            return {
                                text: 'Please, Set KPI for ' + reminderData.evaluatee.firstName + ' ' + reminderData.evaluatee.lastName + '. Profile: ' + reminderData.profile.name + '. Stage: ' + reminderData.stage.name + '.',
                                link: '#/home/KPI/' + reminderData.profile.id + '/' + reminderData.stage.id + '/' + reminderData.evaluator.id,
                                dueDate: reminderData.dueDate,
                                id: reminderData.id,
                                stageEndDate: reminderData.stage.endDateTime
                        }
                    }
                }

                function checkSetFinalKPI(reminderData) {
                    if (!reminderData.isSelfEvaluation) {
                        return {
                            text: 'Please, Set Final KPI for ' + reminderData.evaluatee.firstName + ' ' + reminderData.evaluatee.lastName + '. Profile: ' + reminderData.profile.name + '. Stage: ' + reminderData.stage.name + '.',
                            link: '#/home/finalKPI/' + reminderData.profile.id + '/' + reminderData.stage.id + '/' + reminderData.evaluator.id + '/' + reminderData.evaluatee.id,
                            dueDate: reminderData.dueDate,
                            id: reminderData.id,
                            stageEndDate: reminderData.stage.endDateTime
                        }
                    } else {
                        return {
                            text: 'Please, Set Final KPI for profile ' + reminderData.profile.name + ' (self-evaluation) for a ' + reminderData.stage.name + '.',
                            link: '#/home/finalKPI/' + reminderData.profile.id + '/' + reminderData.stage.id + '/' + reminderData.evaluator.id + '/' + reminderData.evaluator.id,
                            dueDate: reminderData.dueDate,
                            id: reminderData.id,
                            stageEndDate: reminderData.stage.endDateTime
                        }
                    }
                }

                function setCurrentReminder(reminder) {
                    $scope.selectedReminder = reminder;
                    if (moment(reminder.stageEndDate) > moment())
                        $scope.stageEndDate = new Date(reminder.stageEndDate);
                    var tommorow = new Date();
                    tommorow.setDate(tommorow.getDate() + 1);
                    $scope.newDate = moment(tommorow).format("MM/DD/YYYY");
                }

                function setNewReminderDate() {
                    var date = moment($scope.newDate).format('YYYY-MM-DD');
                    reminderManager.changeReminderDate($scope.selectedReminder.id, date).then(function () {
                        reminderManager.getRemindersById($scope.authentication.user.id).then(function (data) {
                            var remindersList = createRemindersList(data);
                            $scope.reminders = remindersList;
                        });
                    });
                }

                $scope.setCurrentReminder = setCurrentReminder;

                $scope.setNewReminderDate = setNewReminderDate;
            }
        }
    }
})();
