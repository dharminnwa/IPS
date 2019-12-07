app.directive('ngParticipants', ['apiService', function (apiService, $compile) {
    return {
        restrict: 'EA',
        templateUrl: 'views/profiles/stageGroups/directives/ngParticipants/ngParticipants.html',
        scope: {
            ngParticipantUsers: '=',
            ngEvaluatorUsers: '=',
            ngUsers: '=',
            ngEvaluationRoles: '=',
            ngJobPositions: '=',
            ngStages: '=',
            ngStatusOfStages: '=',
            ngSelectedStageId: '=',
            ngRemoveParticipant: '&',
            ngRefreshParticipant: '&',
            ngAddParticipant: '&',
            ngRenoveAllParticipants: '&',
            ngSelfEvaluationUpdate: '&',
            ngSendStartNotification: '&',
            ngSendStartNotificationForParticipant: '&',
            ngLockUpdate: '&',
            ngScoreManagerUpdate: '&',
            ngProfileTypeId: '='
        },
        replace: true,
        controller: ['$scope', 'apiService', 'authService', 'stageGroupManager', 'dialogService', 'reminderManager', '$stateParams', '$element', '$location', '$state', 'profilesTypesEnum', '$translate', function ($scope, apiService, authService, stageGroupManager, dialogService, reminderManager, $stateParams, $element, $location, $state, profilesTypesEnum, $translate) {
            $scope.users = $scope.ngUsers;
            $scope.participants = new kendo.data.ObservableArray($scope.ngParticipantUsers);
            $scope.evaluators = new kendo.data.ObservableArray($scope.ngEvaluatorUsers);
            $scope.userCurrentPage = 0;
            $scope.userSearch = "";
            $scope.participantsGridInstance = null;
            $scope.evaluationRoles = $scope.ngEvaluationRoles;
            $scope.jobPositions = $scope.ngJobPositions;
            $scope.selectedParticipant = null;
            $scope.selectedParticipantName = "";
            $scope.selectedStageId = $scope.ngSelectedStageId;
            $scope.stages = $scope.ngStages;
            $scope.statusOfStages = $scope.ngStatusOfStages;
            $scope.isAdmin = isAdmin();

            var unlockedStages = [];
            var isSelectedStageActive = false;
            for (var i = 0; i < $scope.stages.length; i++) {
                var isStageUnlocked = true;
                for (var j = 0; j < $scope.statusOfStages.length; j++) {
                    if ($scope.stages[i].id == $scope.statusOfStages[j].stageId) {
                        isStageUnlocked = !$scope.statusOfStages[j].isLocked;
                        break;
                    }
                }
                if (isStageUnlocked) {
                    if ($scope.selectedStageId == $scope.stages[i].id) {
                        isSelectedStageActive = true;
                    }
                    unlockedStages.push($scope.stages[i]);
                }
            }
            $scope.unlockedStages = unlockedStages;
            if (!isSelectedStageActive) {
                if (unlockedStages.length > 0) {
                    $scope.selectedStageId = unlockedStages[0].id;
                }
            }

            $scope.dialogMode = 2;

            $scope.init = function (value) {

            }

            $scope.userPageFrom = function (defaultSize) {
                var startFrom = 0;
                if ($scope.userSearch == "") {
                    startFrom = $scope.userCurrentPage * defaultSize;
                }
                return startFrom;
            }

            $scope.userPageSize = function (currentPage, defaultSize) {
                (!defaultSize) ? defaultSize = 24 : '';
                ($scope.userSearch) ? currentPage = 0 : '';
                return ($scope.userSearch) ? $scope.users.length : defaultSize;
            }

            $scope.numberOfUserPages = function (countObj) {
                if (countObj && countObj.length) {
                    var counter = countObj.length / $scope.userPageSize();
                    isNextPage(counter) ? counter += 1 : '';
                    return Math.ceil(counter)
                }
            }

            function isNextPage(number) {
                return (number >= 1.7);
            }


            function isAdmin() {
                var result = false;
                angular.forEach($scope.participants, function (participant) {
                    if (participant.password) {
                        result = true;
                    }
                });
                return result;
            }

            $scope.isSelectedUser = function (id) {
                var isSelected = $scope.participants.filter(function (obj) {
                    if (obj.user.id == id) {
                        return obj;
                    }
                })[0];

                return isSelected;
            }

            $scope.isSelectedEvaluatorUser = function (id) {
                var isSelected = $scope.evaluators.filter(function (obj) {
                    if ((obj.user.id == id) && ($scope.selectedParticipant) && (obj.evaluateeId == $scope.selectedParticipant.participantId)) {
                        return obj;
                    }
                })[0];

                return isSelected;
            }

            $scope.resendNotification = function (participantId, userType) {
                var yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                var date = moment(yesterday).format('YYYY-MM-DD');
                var message = $translate.instant('SOFTPROFILE_DO_YOU_REALLY_WANT_TO_SEND_START_INVITATION_TO_USER_AGAIN');

                var sourceArray = [];
                if (userType && userType == 2) {
                    sourceArray = $scope.evaluators;
                } else {
                    sourceArray = $scope.participants;
                }

                angular.forEach(sourceArray, function (user) {
                    if (user.participantId == participantId) {

                        var id = "User_" + user.participantId + "_" + $scope.selectedStageId;

                        angular.forEach($scope.stages, function (stage) {
                            if ($scope.selectedStageId == stage.id) {
                                if ((!stage.emailNotification) && (!stage.smsNotification)) {
                                    dialogService.showNotification($translate.instant('SOFTPROFILE_DELIVERY_METHOD_IS_NOT_SELECTED_EMAIL_OR_SMS'), 'warning');
                                    return;
                                }
                                // if (userType == 1 && !stage.externalStartNotificationTemplateId) {
                                //     dialogService.showNotification("User start notification template is not selected", 'warning');
                                //     return;
                                // }
                                // if (userType == 2 && !stage.evaluatorStartNotificationTemplateId) {
                                //     dialogService.showNotification("User start notification template is not selected", 'warning');
                                //     return;
                                // }
                                if ((!stage.managerId) && (!stage.trainerId)) {
                                    message += "\n Note! Manager and Trainer is not defined!";
                                } else if (!stage.managerId) {
                                    message += "\n Note! Manager is not defined!";
                                } else if (!stage.managerId) {
                                    message += "\n Note! Trainer is not defined!";
                                }

                                var templateId = -1;
                                if (userType == 2) {
                                    templateId = stage.externalStartNotificationTemplateId;
                                } else {
                                    templateId = stage.evaluatorStartNotificationTemplateId;
                                }

                                dialogService.showYesNoDialog($translate.instant('COMMON_CONFIRM'), message).then(
                                    function () {
                                        stageGroupManager.sendStartNotificationForParticipant(participantId, $scope.selectedStageId, templateId).then(
                                            function (data) {
                                                reminderManager.changeReminderDate(id, date).then(
                                                    function () {
                                                        dialogService.showNotification($translate.instant('SOFTPROFILE_NOTIFICATION_WAS_SENT_SUCCESFULLY'), 'info');
                                                    },
                                                    function (error_data) {
                                                        dialogService.showNotification(message, 'warning');
                                                    });
                                            },
                                            function (message) {
                                                dialogService.showNotification(message, 'warning');
                                            });
                                        return;
                                    },
                                    function () {
                                        return;
                                    });
                            }
                        });
                    }
                });
            };

            $scope.addUserToParticipant = function (user) {
                var participant = {
                    user: user,
                    evaluateeId: null,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    isSelfEvaluation: $scope.ngProfileTypeId == profilesTypesEnum.knowledgetest,
                    organizationName: user.organization.name,
                    participantId: -1,
                    roleId: 2,
                    evaluationRoleId: 2,
                    userId: user.id,
                    isLocked: false,
                    isScoreManager: false
                };
                if (isAdmin()) {
                    authService.tryGetPassword(user.userKey, user.organizationId).then(function (response) {
                        participant.password = response.data;
                        $scope.ngAddParticipant({ participant: participant }).then(function (id) {
                            participant.participantId = id;
                            $scope.participants.push(participant);
                        });
                    });
                } else {
                    $scope.ngAddParticipant({ participant: participant }).then(function (id) {
                        participant.participantId = id;
                        $scope.participants.push(participant);
                    });
                }
            }

            $scope.addUserToEvaluator = function (user) {
                var participant = {
                    user: user,
                    evaluateeId: $scope.selectedParticipant.participantId,
                    evaluatee: $scope.selectedParticipant.user,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    isSelfEvaluation: false,
                    organizationName: user.organization.name,
                    participantId: -1,
                    roleId: 1,
                    evaluationRoleId: 1,
                    userId: user.id,
                    isLocked: false,
                    isScoreManager: false,
                };
                if (isAdmin()) {
                    authService.tryGetPassword(user.userKey, user.organizationId).then(function (response) {
                        participant.password = response.data;
                        $scope.ngAddParticipant({ participant: participant }).then(function (id) {
                            participant.participantId = id;
                            $scope.evaluators.push(participant);
                            $scope.$apply();
                        });
                    });
                } else {
                    $scope.ngAddParticipant({ participant: participant }).then(function (id) {
                        participant.participantId = id;
                        $scope.evaluators.push(participant);
                        $scope.$apply();
                    });
                }
            }

            $scope.cleanParticipantsList = function () {
                dialogService.showYesNoDialog($translate.instant('COMMON_CONFIRM'), $translate.instant('SOFTPROFILE_ARE_YOU_SURE_YOU_WANT_TO_REMOVE_ALL_PARTICIPANTS_AND_EAVLUATORS')).then(
                    function () {
                        $scope.ngRenoveAllParticipants({ roleId: 2 }).then(function (data) {
                            $scope.participants.splice(0, $scope.participants.length);
                            $scope.evaluators.splice(0, $scope.evaluators.length);
                        });

                    },
                    function () {
                        //alert('No clicked');
                    });
            }

            $scope.cleanEvaluatorsList = function () {
                dialogService.showYesNoDialog($translate.instant('COMMON_CONFIRM'), $translate.instant('SOFTPROFILE_ARE_YOU_SURE_YOU_WANT_TO_REMOVE_ALL_EVALUATORS')).then(
                    function () {
                        $scope.ngRenoveAllParticipants({ roleId: 1 }).then(function (data) {
                            $scope.evaluators.splice(0, $scope.evaluators.length);
                        });

                    },
                    function () {
                        //alert('No clicked');
                    });
            }

            $scope.removeParticipant = function (participantId) {
                dialogService.showYesNoDialog($translate.instant('COMMON_CONFIRM'), $translate.instant('SOFTPROFILE_ALL_EVALUATORS_AND_SURVEY_ANSWERS_FOR_SELECTED_PARTICIPANT_WILL_BE_REMOVED') + " " + $translate.instant('SOFTPROFILE_ARE_YOU_SURE_YOU_WANT_TO_PROCEED')).then(
                    function () {
                        angular.forEach($scope.participants, function (participant, participantIndex) {
                            if (participant.participantId == participantId) {
                                $scope.ngRemoveParticipant({ participantId: participant.participantId }).then(function (data) {
                                    $scope.participants.splice(participantIndex, 1);

                                    angular.forEach(angular.copy($scope.evaluators), function (evaluator, evaluatorIndex) {
                                        if (evaluator.evaluateeId == participant.participantId) {
                                            $scope.evaluators.splice(evaluatorIndex, 1);
                                        }
                                    });
                                });
                            }
                        });
                    },
                    function () {
                        //alert('No clicked');
                    });
            }

            $scope.removeEvaluator = function (participantId) {
                dialogService.showYesNoDialog($translate.instant('COMMON_CONFIRM'), $translate.instant('SOFTPROFILE_ALL_SURVEY_ANSWERS_FOR_SELECTED_EVALUATOR_WILL_BE_REMOVED') + " " + $translate.instant('SOFTPROFILE_ARE_YOU_SURE_YOU_WANT_TO_PROCEED')).then(
                    function () {
                        angular.forEach($scope.evaluators, function (item, index) {
                            if (item.participantId == participantId) {
                                $scope.ngRemoveParticipant({ participantId: item.participantId }).then(function (data) {
                                    $scope.evaluators.splice(index, 1);
                                });
                            }
                        });
                    },
                    function () {
                        //alert('No clicked');
                    });
            }

            $scope.refreshParticipant = function (userId) {
                dialogService.showYesNoDialog($translate.instant('COMMON_CONFIRM'), $translate.instant('SOFTPROFILE_ALL_SURVEY_ANSWERS_FOR_SELECTED_PARTICIPANT_WILL_BE_REMOVED') + " " + $translate.instant('SOFTPROFILE_ARE_YOU_SURE_YOU_WANT_TO_PROCEED')).then(
                   function () {
                       angular.forEach($scope.participants, function (item, index) {
                           if (item.userId == userId) {
                               $scope.ngRefreshParticipant({ participantId: item.participantId }).then(function (data) {

                               });
                           }
                       });
                   },
                   function () {
                       //alert('No clicked');
                   });

            }

            $scope.refreshEvaluator = function (participantId) {
                dialogService.showYesNoDialog($translate.instant('COMMON_CONFIRM'), $translate.instant('SOFTPROFILE_ALL_SURVEY_ANSWERS_FOR_SELECTED_EVALUATOR_WILL_BE_REMOVED') + " " + $translate.instant('SOFTPROFILE_ARE_YOU_SURE_YOU_WANT_TO_PROCEED')).then(
                    function () {
                        angular.forEach($scope.evaluators, function (item, index) {
                            if (item.participantId == participantId) {
                                $scope.ngRefreshParticipant({ participantId: item.participantId }).then(function (data) {

                                });
                            }
                        });
                    },
                    function () {
                        //alert('No clicked');
                    });
            }

            $scope.selfEvaluationUpdate = function (participantId, $event) {
                angular.forEach($scope.participants, function (item, index) {
                    if (item.participantId == participantId) {

                        var evaluators = $scope.evaluators.filter(function (obj) {
                            if (obj.evaluateeId == participantId) {
                                return obj;
                            }
                        });

                        if (evaluators.length > 0 && !item.isSelfEvaluation) {
                            dialogService.showNotification($translate.instant('SOFTPROFILE_THE_PARTICIPANT_HAS_EVALUATORS') + $translate.instant('SOFTPROFILE_IF_YOU_WANT_TO_SET_IT_AS_SELF_EVALUATED_PARTICIPANT') + ' ' + $translate.instant('SOFTPROFILE_PLEASE_REMOVE_ALL_ITS_EVALUATORS_FIRSTLY'), 'warning');
                            item.isSelfEvaluation = false;
                            $($event.target).attr('checked', false);
                        }
                        else {
                            item.isSelfEvaluation = !item.isSelfEvaluation;
                            $scope.ngSelfEvaluationUpdate({ participantId: item.participantId, isSelfEvaluation: item.isSelfEvaluation }).then(function (data) {

                            });
                        }
                    }
                });
            }

            $scope.participantlockUpdate = function (participantId) {
                angular.forEach($scope.participants, function (item, index) {
                    if (item.participantId == participantId) {
                        item.isLocked = !item.isLocked;
                        $scope.ngLockUpdate({ participantId: item.participantId, isLocked: item.isLocked }).then(function (data) {

                        });
                    }
                });
            }

            $scope.evaluatorlockUpdate = function (participantId) {
                angular.forEach($scope.evaluators, function (item, index) {
                    if (item.participantId == participantId) {
                        item.isLocked = !item.isLocked;
                        $scope.ngLockUpdate({ participantId: item.participantId, isLocked: item.isLocked }).then(function (data) {
                        });
                    }
                });
            }

            $scope.evaluatorScoreManagerUpdate = function (participantId) {
                angular.forEach($scope.evaluators, function (item, index) {
                    if (item.participantId == participantId) {
                        item.isScoreManager = !item.isScoreManager;
                        $scope.ngScoreManagerUpdate({ participantId: item.participantId, isScoreManager: item.isScoreManager }).then(function (data) {

                        });
                    }
                });
            }

            $scope.$on("kendoRendered", function (event) {
                if (event.targetScope.participantsGrid) {
                    $scope.participantsGridInstance = event.targetScope.participantsGrid;
                }
            });

            function onUserAssignGridDataBound(e) {
                var grid = e.sender;
                if (grid.dataSource.total() == 0) {
                    var colCount = grid.columns.length;
                    $(e.sender.wrapper)
                        .find('tbody')
                        .append('<tr class="kendo-data-row"><td colspan="' + colCount + '" class="no-data">There is no data to show in the grid.</td></tr>');
                }
            };


            function getParticipantOptions() {
                var participantsOptions = {
                    dataBound: onUserAssignGridDataBound,
                    change: function (arg) {
                        var grid = arg.sender;
                        var selectedData = grid.dataItem(grid.select());
                        $scope.selectedParticipant = selectedData;
                        $scope.selectedParticipantName = $scope.selectedParticipant.user.firstName + " " + $scope.selectedParticipant.user.lastName;
                        $scope.$apply();
                    },
                    dataSource: {
                        type: "json",
                        data: $scope.participants,
                        schema: {
                            model: {
                                id: "participantId",
                                fields: {
                                    participantId: {
                                        type: 'number',
                                    },
                                    roleId: {
                                        type: 'number'
                                    },
                                    isSelfEvaluation: {
                                        type: 'boolean'
                                    }
                                }
                            }
                        },
                        pageSize: 10,
                    },
                    columnMenu: true,
                    filterable: true,
                    pageable: true,
                    sortable: true,
                    selectable: "row",
                    columns: [
                        {
                            field: "organizationName",
                            title: $translate.instant('COMMON_ORGANIZATION'),
                            width: "10%"
                        },
                        {
                            field: "name",
                            title: $translate.instant('COMMON_NAME'),
                            width: "15%",
                            template: function (dataItem) {
                                dataItem.name = dataItem.firstName + " " + dataItem.lastName;
                                return "<div>" + dataItem.firstName + " " + dataItem.lastName + "</div>"
                            }
                        },
                        {
                            field: "roles",
                            title: $translate.instant('COMMON_TITLE'),
                            width: "15%",
                            template: function (dataItem) {
                                dataItem.roles = "";
                                var cellData = "<div>";
                                angular.forEach(dataItem.user.jobPositions, function (item, index) {
                                    if (index > 0) {
                                        cellData += ", ";
                                        dataItem.roles += ", ";
                                    }
                                    cellData += "<span>" + item.jobPosition1 + " </span>";
                                    dataItem.roles += item.jobPosition1;
                                });
                                cellData += "</div>";
                                return cellData;
                            }
                        },
                        {
                            field: "isSelfEvaluation",
                            title: $translate.instant('SOFTPROFILE_SELF_EVALUATION'),
                            width: "10%",
                            template: "<input name='fullyPaid'  class='ob-paid' type='checkbox' ng-click='selfEvaluationUpdate(#= participantId #, $event)' ng-disabled='!selectedParticipant || selectedParticipant.id != {{dataItem.id}}' data-bind='checked: isSelfEvaluation' #= isSelfEvaluation ? checked='checked' : '' #/>"
                        },
                        {
                            field: "isLocked",
                            title: $translate.instant('SOFTPROFILE_LOCKED'),
                            width: "10%",
                            template: "<input name='fullyPaid' class='ob-paid' type='checkbox' ng-click='participantlockUpdate(#= participantId #)' data-bind='checked: isLocked' #= isLocked ? checked='checked' : '' #/>"
                        },
                        {
                            field: "user.workEmail",
                            title: $translate.instant('COMMON_EMAIL'),
                            width: "15%"
                        },
                        {
                            field: "actions",
                            title: $translate.instant('COMMON_ACTIONS'),
                            width: "10%",
                            filterable: false,
                            template: function (dataItem) {
                                return "<div class='icon-groups'><a data-placement='top' title='Delete' class='icon-groups icon-groups-item delete-icon' ng-click='removeParticipant(" + dataItem.participantId + ");'></a>" +
                                       "<a data-placement='top' title='Resend' class='icon-groups icon-groups-item refresh-icon' ng-click='resendNotification(" + dataItem.participantId + ", 1);'></a></div>";
                            },
                        }
                    ],
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

                if (isAdmin()) {
                    participantsOptions.columns.splice(6, 0,
                        {
                            field: "password",
                            title: $translate.instant('SOFTPROFILE_PASSWORD'),
                            width: "10%",
                            template: function (dataItem) {
                                var value = "---";
                                if (dataItem && dataItem.password) {
                                    value = dataItem.password;
                                }
                                var result = "<div class='input-group' ng-show='isAdmin'>" +
                                            "<input type='text' class='form-control' disabled value='" + value + "'/>" +
                                            "</div>";
                                return result;
                            }
                        }
                    );
                }
                return participantsOptions;
            }

            function getEvaluatorsOptions() {
                var evaluatorsOptions = {
                    dataBound: onUserAssignGridDataBound,
                    change: function (arg) {
                        var grid = arg.sender;
                        var selectedData = grid.dataItem(grid.select());
                        $scope.selectedParticipant = selectedData;
                        $scope.selectedParticipantName = $scope.selectedParticipant.user.firstName + " " + $scope.selectedParticipant.user.lastName;
                        $scope.$apply();
                    },
                    dataSource: {
                        type: "json",
                        data: $scope.evaluators,
                        pageSize: 10,
                    },
                    columnMenu: true,
                    filterable: true,
                    pageable: true,
                    sortable: true,
                    columns: [
                        {
                            field: "organizationName",
                            title: $translate.instant('COMMON_ORGANIZATION'),
                            width: "12%"
                        },
                        {
                            field: "name",
                            title: $translate.instant('COMMON_NAME'),
                            width: "10%",
                            template: function (dataItem) {
                                dataItem.name = dataItem.firstName + " " + dataItem.lastName;
                                return "<div>" + dataItem.firstName + " " + dataItem.lastName + "</div>"
                            }
                        },
                        {
                            field: "roles",
                            title: $translate.instant('COMMON_TITLE'),
                            width: "18%",
                            template: function (dataItem) {
                                dataItem.roles = "";
                                var cellData = "<div>";
                                angular.forEach(dataItem.user.jobPositions, function (item, index) {
                                    if (index > 0) {
                                        cellData += ", ";
                                        dataItem.roles += ", ";
                                    }
                                    cellData += "<span>" + item.jobPosition1 + " </span>";
                                    dataItem.roles += item.jobPosition1;
                                });
                                cellData += "</div>";
                                return cellData;
                            }
                        },
                        {
                            field: "isLocked",
                            title: $translate.instant('SOFTPROFILE_LOCKED'),
                            width: "15%",
                            template: "<input name='fullyPaid' class='ob-paid' type='checkbox' ng-click='evaluatorlockUpdate(#= participantId #)' data-bind='checked: isLocked' #= isLocked ? checked='checked' : '' #/>"
                        },
                        {
                            field: "isScoreManager",
                            title: $translate.instant('SOFTPROFILE_FINAL_SCORE_MANAGER'),
                            width: "15%",
                            template: "<input name='fullyPaid' class='ob-paid' type='checkbox' ng-click='evaluatorScoreManagerUpdate(#= participantId #)' data-bind='checked: isScoreManager' #= isScoreManager ? checked='checked' : '' #/>"
                        },
                        {
                            field: "user.workEmail",
                            title: $translate.instant('COMMON_EMAIL'),
                            width: "15%"
                        },
                        {
                            field: "evaluateeName",
                            title: $translate.instant('SOFTPROFILE_EVALUATEE_NAME'),
                            width: "15%",
                            template: function (dataItem) {
                                dataItem.evaluateeName = dataItem.evaluatee.firstName + " " + dataItem.evaluatee.lastName;
                                return "<div>" + dataItem.evaluatee.firstName + " " + dataItem.evaluatee.lastName + "</div>"
                            }
                        },
                        {
                            field: "evaluatee.workEmail",
                            title: $translate.instant('SOFTPROFILE_EVALUATEE_EMAIL'),
                            width: "15%"
                        },
                        {
                            field: "actions",
                            title: $translate.instant('COMMON_ACTIONS'),
                            width: "10%",
                            filterable: false,
                            template: function (dataItem) {
                                return "<div class='icon-groups'><a data-placement='top' title='Delete' class='icon-groups icon-groups-item delete-icon' ng-click='removeEvaluator(" + dataItem.participantId + ");'></a>" +
                                       "<a data-placement='top' title='Resend' class='icon-groups icon-groups-item refresh-icon' ng-click='resendNotification(" + dataItem.participantId + ", 2);'></a></div>";
                            },
                        },
                    ],
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

                if (isAdmin()) {
                    evaluatorsOptions.columns.splice(8, 0,
                        {
                            field: "password",
                            title: $translate.instant('SOFTPROFILE_PASSWORD'),
                            width: "10%",
                            template: function (dataItem) {
                                var value = "---";
                                if (dataItem && dataItem.password) {
                                    value = dataItem.password;
                                }
                                var result = "<div class='input-group' ng-show='isAdmin'>" +
                                    "<input type='text' class='form-control' disabled value='" + value + "'/>" +
                                    "</div>";
                                return result;
                            }
                        }
                    );
                }
                return evaluatorsOptions;
            }

            $scope.participantsOptions = getParticipantOptions();
            $scope.evaluationOptions = getEvaluatorsOptions();

            $scope.sendStartStageNotification = function () {
                if ($scope.participants.length == 0) {
                    dialogService.showNotification($translate.instant('SOFTPROFILE_PLEASE_ADD_PARTICIPANTS_TO_STAGE_GROUP'), 'warning');
                    return;
                } else {
                    angular.forEach($scope.participants, function (participant, index) {
                        if ((!participant.isSelfEvaluation) && ($scope.evaluators.length == 0)) {
                            dialogService.showNotification($translate.instant('SOFTPROFILE_PLEASE_ADD_EVALUATORS_TO_STAGE_GROUP'), 'warning');
                            return;
                        }
                    })
                }
    console.log($scope.participants);
                angular.forEach($scope.stages, function (stage, index) {
                    if ($scope.selectedStageId == stage.id) {

                        if ((!stage.emailNotification) && (!stage.smsNotification)) {
                            dialogService.showNotification($translate.instant('SOFTPROFILE_DELIVERY_METHOD_IS_NOT_SELECTED_EMAIL_OR_SMS'), 'warning');
                            return;
                        }

                        // if (!stage.externalStartNotificationTemplateId) {
                        //     dialogService.showNotification("Participant start notification template is not selected", 'warning');
                        //     return;
                        // }//}

                        // if (!stage.evaluatorStartNotificationTemplateId) {
                        //     dialogService.showNotification("Evaluator start notification template is not selected", 'warning');
                        //     return;
                        // }

                        if (stage.invitedAt) {
                            dialogService.showYesNoDialog($translate.instant('COMMON_CONFIRM'), $translate.instant('SOFTPROFILE_START_INVITATION_HAS_BEEN_ALREADY_SENT') + " " + $translate.instant('SOFTPROFILE_DO_YOU_WANT_TO_SEND_INVITATION_ONE_MORE_TIME')).then(function () {
                                $scope.ngSendStartNotification({ stageId: $scope.selectedStageId }).then(function (data) {
                                    dialogService.showNotification($translate.instant('SOFTPROFILE_NOTIFICATIONS_WERE_SENT_SUCCESFULLY'), 'info');
                                },
                                function (message) {
                                    dialogService.showNotification(message, 'warning');
                                });
                                return;
                            },
                            function () {
                                return;
                            });
                        } else {

                            var message = $translate.instant('SOFTPROFILE_DO_YOU_REALLY_WANT_TO_SEND_START_INVITATION_TO_ALL_PARTICIPANTS_EVALUATORS_TRAINERS_AND_MANAGERS');
                            if ((!stage.managerId) && (!stage.trainerId)) {
                                message += "\n Note! Manager and Trainer is not defined!";
                            } else if (!stage.managerId) {
                                message += "\n Note! Manager is not defined!";
                            } else if (!stage.managerId) {
                                message += "\n Note! Trainer is not defined!";
                            }

                            dialogService.showYesNoDialog("Confirm", message).then(function () {
                                $scope.ngSendStartNotification({ stageId: $scope.selectedStageId }).then(function (data) {
                                    dialogService.showNotification($translate.instant('SOFTPROFILE_NOTIFICATIONS_WERE_SENT_SUCCESFULLY'), 'info');
                                    stage.invitedAt = moment();
                                },
                                function (message) {
                                    dialogService.showNotification(message, 'warning');
                                });
                                return;
                            },
                           function () {
                               return;
                           });
                        }
                    }
                });
            }

        }],
        link: function ($scope, element, attrs) {
            $scope.$watch('ngModel', function (newValue, oldValue) {
                if (newValue) {
                    $scope.init(newValue);
                }
            }, false);
        }
    }
}]);