app.directive('ngStage', ['apiService', function (apiService, $compile) {
    return {
        restrict: 'EA',
        require: '^ngModel',
        templateUrl: 'views/profiles/stageGroups/directives/ngStage/ngStage.html',
        scope: {
            ngModel: '=',
            ngNotificationTemplates: '=',
            ngUsers: '=',
            stageInfo: '=',
            currentStage: '=',
            statusOfStages: '=',
            profileTypeId: '=',
            isStartStage: '=?',
            stageGroupEvaluation: '=?',
        },
        replace: true,
        controller: ['$scope', 'apiService', 'dialogService', '$stateParams', '$element', 'dialogService', '$location', '$state',
            'notificationManager', '$parse', '$modal', 'datetimeCalculator', 'profilesTypesEnum', 'stageTypesEnum', 'evaluationRolesEnum', 'templateTypeEnum', '$translate',
            function ($scope, apiService, dialogService, $stateParams, $element, dialogService, $location, $state,
                notificationManager, $parse, $modal, datetimeCalculator, profilesTypesEnum, stageTypesEnum, evaluationRolesEnum, templateTypeEnum, $translate) {

                $scope.notificationTemplates = $scope.ngNotificationTemplates;
                $scope.notificationTemplates.splice(1, 0, {
                    id: -1,
                    name: "Choose From List",
                    culture: { cultureName: null }
                })
                $scope.profilesTypesEnum = profilesTypesEnum;
                $scope.users = $scope.ngUsers;
                $scope.selectedNotification;
                $scope.isStageLocked = function () {
                    var isStageLocked = false;
                    for (var i = 0; i < $scope.statusOfStages.length; i++) {
                        if ($scope.ngModel.id == $scope.statusOfStages[i].stageId) {
                            isStageLocked = $scope.statusOfStages[i].isLocked;
                            break;
                        }
                    }
                    return isStageLocked;
                }
                $scope.errors = [];
                $scope.isStageInUse = function () {
                    var isStageInUse = false;
                    for (var i = 0; i < $scope.statusOfStages.length; i++) {
                        if ($scope.ngModel.id == $scope.statusOfStages[i].stageId) {
                            isStageInUse = $scope.statusOfStages[i].isInUse;
                            break;
                        }
                    }
                    return isStageInUse;
                }
                $scope.notificationTemplatesOptions = {
                    dataSource: {
                        type: "json",
                        transport: {
                            read: function (options) {
                                notificationManager.getNotifications().then(function (data) {
                                    var object = [];
                                    var organization_obj = [data.length];
                                    for (var i = 0, len = data.length; i < len; i++) {
                                        organization_obj[i] = {
                                            id: data[i].id,
                                            name: data[i].name,
                                            culture: (data[i].culture) ? data[i].culture.cultureName : '',
                                            email: (data[i].emailBody) ? true : false,
                                            sms: (data[i].smsMessage) ? true : false,
                                            evaluationRoleId: data[i].evaluationRoleId,
                                        };
                                    }
                                    object['data'] = organization_obj;
                                    options.success(object);
                                })
                            }
                        },
                        sort: {
                            field: "name",
                            dir: "asc"
                        },
                        pageSize: 10,
                        schema: {
                            data: 'data',
                            total: 'data.length',
                            model: {
                                id: "id",
                                fields: {
                                    id: { type: "number" },
                                    name: { type: "string" },
                                    evaluationRoleId: { type: "number" },
                                }
                            }
                        }
                    },
                    pageable: true,
                    selectable: true,
                    sortable: true,
                    filterable: {
                        mode: 'row'
                    },
                    columns: [
                        { field: "name", width: 350, title: $translate.instant('COMMON_NAME') },
                        { field: "culture", width: 350, title: $translate.instant('COMMON_CULTURE') },
                        { field: "evaluationRoleId", width: 350, title: $translate.instant('COMMON_ROLE'), values: $scope.evaluationRoles },
                        { field: "email", title: $translate.instant('COMMON_EMAIL'), width: 100, filterable: false, template: '<input type="checkbox" #= email ? checked="checked" : "" # disabled="disabled" />' },
                        { field: "sms", title: $translate.instant('COMMON_SMS'), filterable: false, template: '<input type="checkbox" #= sms ? checked="checked" : "" # disabled="disabled" />' },
                    ]
                }

                $scope.private = {
                    getById: function (id, myArray) {
                        if (myArray.filter) {
                            return myArray.filter(function (obj) {
                                if (obj.id == id) {
                                    return obj
                                }
                            })[0]
                        }
                        return undefined;
                    },
                }

                $scope.back = function () {
                    $state.go('^');
                }

                $scope.init = function (value) {
                    if (value) {
                        if (value.isExtend) {

                        }
                        else {
                            value["isExtend"] = false;
                        }
                        $scope.stage = value;
                        checkMilestoneDatesAreValid();
                        if ($scope.stageInfo) {
                            var datepicker = $("#stageStartDateTime").data("kendoDateTimePicker");
                            if (datepicker) {
                                datepicker.setOptions({
                                    min: kendo.parseDate($scope.stageInfo.startDate),
                                });
                            }
                        }
                    }
                }

                $scope.goToNotificationTemplate = function (id) {
                    if (id) {
                        var template = _.find($scope.notificationTemplates, function (item) {
                            return item.id == id;
                        });
                        if (template) {
                            $location.path("/home/notificationTemplates/" + template.organizationId + "/edit/" + id);
                        }
                    }
                }

                $scope.checkChoseFromList = function (id, modelName, previous) {

                    if (id == -1) {
                        var previousItem = (previous) ? parseInt(previous) : null;
                        var modalInstance = $modal.open({
                            animation: $scope.animationsEnabled,
                            templateUrl: 'views/profiles/stageGroups/views/notificationModal.html',
                            controller: 'NotificationModalCtrl',
                            controllerAs: 'modal',
                            size: 'lg',
                            resolve: {
                                previousItem: function () {
                                    return previousItem;
                                }
                            }
                        });

                        modalInstance.result.then(function (selectedItem) {
                            setNotificationModel(modelName, selectedItem);
                        });
                    }
                }

                $scope.toggleAnimation = function () {
                    $scope.animationsEnabled = !$scope.animationsEnabled;
                };

                function setNotificationModel(modelName, newValue) {
                    switch (modelName) {
                        case 'stage.externalStartNotificationTemplateId':
                            $scope.stage.externalStartNotificationTemplateId = newValue;
                            break;
                        case 'stage.externalCompletedNotificationTemplateId':
                            $scope.stage.externalCompletedNotificationTemplateId = newValue;
                            break;
                        case 'stage.externalResultsNotificationTemplateId':
                            $scope.stage.externalResultsNotificationTemplateId = newValue;
                            break;
                        case 'stage.evaluatorStartNotificationTemplateId':
                            $scope.stage.evaluatorStartNotificationTemplateId = newValue;
                            break;
                        case 'stage.evaluatorCompletedNotificationTemplateId':
                            $scope.stage.evaluatorCompletedNotificationTemplateId = newValue;
                            break;
                        case 'stage.evaluatorResultsNotificationTemplateId':
                            $scope.stage.evaluatorResultsNotificationTemplateId = newValue;
                            break;
                        case 'stage.trainerStartNotificationTemplateId':
                            $scope.stage.trainerStartNotificationTemplateId = newValue;
                            break;
                        case 'stage.trainerCompletedNotificationTemplateId':
                            $scope.stage.trainerCompletedNotificationTemplateId = newValue;
                            break;
                        case 'stage.trainerResultsNotificationTemplateId':
                            $scope.stage.trainerResultsNotificationTemplateId = newValue;
                            break;
                        case 'stage.managerStartNotificationTemplateId':
                            $scope.stage.managerStartNotificationTemplateId = newValue;
                            break;
                        case 'stage.managerCompletedNotificationTemplateId':
                            $scope.stage.managerCompletedNotificationTemplateId = newValue;
                            break;
                        case 'stage.managerResultsNotificationTemplateId':
                            $scope.stage.managerResultsNotificationTemplateId = newValue;
                            break;
                        case 'stage.greenAlarmParticipantTemplateId':
                            $scope.stage.greenAlarmParticipantTemplateId = newValue;
                            break;
                        case 'stage.yellowAlarmParticipantTemplateId':
                            $scope.stage.yellowAlarmParticipantTemplateId = newValue;
                            break;
                        case 'stage.redAlarmParticipantTemplateId':
                            $scope.stage.redAlarmParticipantTemplateId = newValue;
                            break;
                        case 'stage.greenAlarmEvaluatorTemplateId':
                            $scope.stage.greenAlarmEvaluatorTemplateId = newValue;
                            break;
                        case 'stage.yellowAlarmEvaluatorTemplateId':
                            $scope.stage.yellowAlarmEvaluatorTemplateId = newValue;
                            break;
                        case 'stage.redAlarmEvaluatorTemplateId':
                            $scope.stage.redAlarmEvaluatorTemplateId = newValue;
                            break;
                        case 'stage.greenAlarmManagerTemplateId':
                            $scope.stage.greenAlarmManagerTemplateId = newValue;
                            break;
                        case 'stage.yellowAlarmManagerTemplateId':
                            $scope.stage.yellowAlarmManagerTemplateId = newValue;
                            break;
                        case 'stage.redAlarmManagerTemplateId':
                            $scope.stage.redAlarmManagerTemplateId = newValue;
                            break;
                        case 'stage.greenAlarmTrainerTemplateId':
                            $scope.stage.greenAlarmTrainerTemplateId = newValue;
                            break;
                        case 'stage.yellowAlarmTrainerTemplateId':
                            $scope.stage.yellowAlarmTrainerTemplateId = newValue;
                            break;
                        case 'stage.redAlarmTrainerTemplateId':
                            $scope.stage.redAlarmTrainerTemplateId = newValue;
                            break;
                    }
                }

                $scope.goToNotificationTemplatesBank = function () {
                    console.log("notificationBank calling");
                }

                $scope.init($scope.ngModel);


                function getPreviousStage() {
                    var prevStage = null;
                    if ($scope.$parent.stageGroupInfo) {
                        if ($scope.$parent.stageGroupInfo.stages) {
                            var currentStageIndex = null;
                            _.each($scope.$parent.stageGroupInfo.stages, function (stageItem, index) {
                                if (stageItem.id == $scope.stage.id) {
                                    currentStageIndex = index;
                                }
                                if (currentStageIndex > -1) {
                                    if ((currentStageIndex - 1) > -1) {
                                        prevStage = $scope.$parent.stageGroupInfo.stages[currentStageIndex - 1];
                                        return (false);
                                    }
                                }
                            });
                        }
                    }
                    else if ($scope.stageInfo) {
                        var currentStageIndex = null;
                        _.each($scope.stageInfo.stages, function (stageItem, index) {
                            if (stageItem.id == $scope.stage.id) {
                                currentStageIndex = index;
                            }
                            if (currentStageIndex > -1) {
                                if ((currentStageIndex - 1) > -1) {
                                    prevStage = $scope.stageInfo.stages[currentStageIndex - 1];
                                    return (false);
                                }
                            }
                        });
                    }
                    return prevStage;
                }

                function recalculateStartDates(newValue, oldValue) {

                    //if (!(moment(kendo.parseDate(newValue))._d < moment($scope.stage.endDateTime)._d)) {
                    //    newValue = oldValue;
                    //}

                    if ($scope.$parent.stageGroupInfo) {
                        _.each($scope.$parent.stageGroupInfo.stages, function (stageItem, index) {
                            if (stageItem.id == $scope.stage.id) {
                                stageItem.startDateTime = moment(kendo.parseDate(newValue)).format('L LT');
                                if (index == 0) {
                                    $scope.stage.evaluationStartDate = moment(kendo.parseDate(newValue)).format('L LT');
                                    stageItem.evaluationStartDate = moment(kendo.parseDate(newValue)).format('L LT');
                                    if (kendo.parseDate(newValue) > kendo.parseDate($scope.stage.endDateTime)) {
                                        $scope.stage.endDateTime = null;
                                        $scope.stage.evaluationEndDate = null;
                                        stageItem.endDateTime = null;
                                        stageItem.evaluationEndDate = null;

                                        stageItem.redAlarmTime = null;
                                        stageItem.yellowAlarmTime = null;
                                        stageItem.greenAlarmTime = null;

                                        $scope.stage.redAlarmTime = null;
                                        $scope.stage.yellowAlarmTime = null;
                                        $scope.stage.greenAlarmTime = null;
                                    }
                                    else {
                                        var startdatetime = kendo.parseDate(stageItem.evaluationStartDate);
                                        var enddatetime = kendo.parseDate(stageItem.evaluationEndDate);
                                        var TotalDiffrence = enddatetime.getTime() - startdatetime.getTime();
                                        var greenAlarmAt = parseInt(TotalDiffrence * 0.20);
                                        var yellowAlarmAt = parseInt(TotalDiffrence * 0.60);
                                        var redAlarmAt = parseInt(TotalDiffrence * 0.90);
                                        stageItem.redAlarmTime = moment(new Date(enddatetime.getTime())).add(1, 'minutes').format('L LT');
                                        stageItem.yellowAlarmTime = moment(new Date(startdatetime.getTime() + yellowAlarmAt)).format('L LT');
                                        stageItem.greenAlarmTime = moment(new Date(startdatetime.getTime() + greenAlarmAt)).format('L LT');
                                        $scope.stage.redAlarmTime = moment(new Date(enddatetime.getTime())).add(1, 'minutes').format('L LT');
                                        $scope.stage.yellowAlarmTime = moment(new Date(startdatetime.getTime() + yellowAlarmAt)).format('L LT')
                                        $scope.stage.greenAlarmTime = moment(new Date(startdatetime.getTime() + greenAlarmAt)).format('L LT');
                                    }
                                    return (false);
                                }
                                else {
                                    if (kendo.parseDate(newValue) > kendo.parseDate($scope.stage.endDateTime)) {
                                        $scope.stage.endDateTime = null;
                                        $scope.stage.evaluationEndDate = null;
                                        $scope.stage.evaluationStartDate = null;

                                        stageItem.endDateTime = null;
                                        stageItem.evaluationEndDate = null;
                                        stageItem.evaluationStartDate = null;

                                        stageItem.redAlarmTime = null;
                                        stageItem.yellowAlarmTime = null;
                                        stageItem.greenAlarmTime = null;

                                        $scope.stage.redAlarmTime = null;
                                        $scope.stage.yellowAlarmTime = null;
                                        $scope.stage.greenAlarmTime = null;
                                    }
                                    else if (kendo.parseDate(newValue) > kendo.parseDate($scope.stage.evaluationStartDate)) {
                                        $scope.stage.evaluationStartDate = moment(kendo.parseDate(newValue)).format('L LT');
                                        stageItem.evaluationStartDate = moment(kendo.parseDate(newValue)).format('L LT');

                                        var startdatetime = kendo.parseDate(stageItem.evaluationStartDate);
                                        var enddatetime = kendo.parseDate(stageItem.evaluationEndDate);
                                        var TotalDiffrence = enddatetime.getTime() - startdatetime.getTime();
                                        var greenAlarmAt = parseInt(TotalDiffrence * 0.20);
                                        var yellowAlarmAt = parseInt(TotalDiffrence * 0.60);
                                        var redAlarmAt = parseInt(TotalDiffrence * 0.90);
                                        stageItem.redAlarmTime = moment(new Date(enddatetime.getTime())).add(1, 'minutes').format('L LT');
                                        stageItem.yellowAlarmTime = moment(new Date(startdatetime.getTime() + yellowAlarmAt)).format('L LT');
                                        stageItem.greenAlarmTime = moment(new Date(startdatetime.getTime() + greenAlarmAt)).format('L LT');
                                        $scope.stage.redAlarmTime = moment(new Date(enddatetime.getTime())).add(1, 'minutes').format('L LT');
                                        $scope.stage.yellowAlarmTime = moment(new Date(startdatetime.getTime() + yellowAlarmAt)).format('L LT');
                                        $scope.stage.greenAlarmTime = moment(new Date(startdatetime.getTime() + greenAlarmAt)).format('L LT');
                                    }
                                }
                            }
                        });
                        checkMilestoneDatesAreValid();
                    }
                    else if ($scope.stageInfo) {
                        _.each($scope.stageInfo.stages, function (stageItem, index) {
                            if (stageItem.id == $scope.stage.id) {
                                stageItem.isChanged = true;
                                stageItem.startDateTime = moment(kendo.parseDate(newValue)).format('L LT');
                                if (index == 0) {
                                    $scope.stage.evaluationStartDate = moment(kendo.parseDate(newValue)).format('L LT');
                                    stageItem.evaluationStartDate = moment(kendo.parseDate(newValue)).format('L LT');
                                    if (kendo.parseDate(newValue) > kendo.parseDate($scope.stage.endDateTime)) {
                                        $scope.stage.endDateTime = null;
                                        $scope.stage.evaluationEndDate = null;
                                        stageItem.endDateTime = null;
                                        stageItem.evaluationEndDate = null;

                                        stageItem.redAlarmTime = null;
                                        stageItem.yellowAlarmTime = null;
                                        stageItem.greenAlarmTime = null;

                                        $scope.stage.redAlarmTime = null;
                                        $scope.stage.yellowAlarmTime = null;
                                        $scope.stage.greenAlarmTime = null;
                                    }
                                    else {
                                        var startdatetime = kendo.parseDate(stageItem.evaluationStartDate);
                                        var enddatetime = kendo.parseDate(stageItem.evaluationEndDate);
                                        var TotalDiffrence = enddatetime.getTime() - startdatetime.getTime();
                                        var greenAlarmAt = parseInt(TotalDiffrence * 0.20);
                                        var yellowAlarmAt = parseInt(TotalDiffrence * 0.60);
                                        var redAlarmAt = parseInt(TotalDiffrence * 0.90);
                                        stageItem.redAlarmTime = moment(new Date(enddatetime.getTime())).add(1, 'minutes').format('L LT');
                                        stageItem.yellowAlarmTime = moment(new Date(startdatetime.getTime() + yellowAlarmAt)).format('L LT')
                                        stageItem.greenAlarmTime = moment(new Date(startdatetime.getTime() + greenAlarmAt)).format('L LT');
                                        $scope.stage.redAlarmTime = moment(new Date(enddatetime.getTime())).add(1, 'minutes').format('L LT');
                                        $scope.stage.yellowAlarmTime = moment(new Date(startdatetime.getTime() + yellowAlarmAt)).format('L LT')
                                        $scope.stage.greenAlarmTime = moment(new Date(startdatetime.getTime() + greenAlarmAt)).format('L LT');
                                    }
                                    return (false);
                                }
                                else {
                                    if (kendo.parseDate(newValue) > kendo.parseDate($scope.stage.endDateTime)) {
                                        $scope.stage.endDateTime = null;
                                        $scope.stage.evaluationEndDate = null;
                                        $scope.stage.evaluationStartDate = null;

                                        stageItem.endDateTime = null;
                                        stageItem.evaluationEndDate = null;
                                        stageItem.evaluationStartDate = null;

                                        stageItem.redAlarmTime = null;
                                        stageItem.yellowAlarmTime = null;
                                        stageItem.greenAlarmTime = null;

                                        $scope.stage.redAlarmTime = null;
                                        $scope.stage.yellowAlarmTime = null;
                                        $scope.stage.greenAlarmTime = null;
                                    }
                                    else if (kendo.parseDate(newValue) > kendo.parseDate($scope.stage.evaluationStartDate)) {
                                        $scope.stage.evaluationStartDate = moment(kendo.parseDate(newValue)).format('L LT');
                                        stageItem.evaluationStartDate = moment(kendo.parseDate(newValue)).format('L LT');

                                        var startdatetime = kendo.parseDate(stageItem.evaluationStartDate);
                                        var enddatetime = kendo.parseDate(stageItem.evaluationEndDate);
                                        var TotalDiffrence = enddatetime.getTime() - startdatetime.getTime();
                                        var greenAlarmAt = parseInt(TotalDiffrence * 0.20);
                                        var yellowAlarmAt = parseInt(TotalDiffrence * 0.60);
                                        var redAlarmAt = parseInt(TotalDiffrence * 0.90);

                                        stageItem.redAlarmTime = moment(new Date(enddatetime.getTime())).add(1, 'minutes').format('L LT');
                                        stageItem.yellowAlarmTime = moment(new Date(startdatetime.getTime() + yellowAlarmAt)).format('L LT');
                                        stageItem.greenAlarmTime = moment(new Date(startdatetime.getTime() + greenAlarmAt)).format('L LT');
                                        $scope.stage.redAlarmTime = moment(new Date(enddatetime.getTime())).add(1, 'minutes').format('L LT');
                                        $scope.stage.yellowAlarmTime = moment(new Date(startdatetime.getTime() + yellowAlarmAt)).format('L LT')
                                        $scope.stage.greenAlarmTime = moment(new Date(startdatetime.getTime() + greenAlarmAt)).format('L LT');
                                    }
                                }
                            }
                        });
                        checkMilestoneDatesAreValid();
                    }
                    //var prevStage = getPreviousStage();
                    //if (prevStage) {
                    //    //_.each($scope.$parent.stageGroupInfo.stages, function (stageItem, index) {
                    //    //    if (stageItem.id == prevStage.id) {
                    //    //        stageItem.evaluationEndDate = moment(kendo.parseDate(newValue)).add('days', -1).format('L LT');
                    //    //    }
                    //    //    if (stageItem.id == $scope.stage.id) {
                    //    //        $scope.stage.evaluationStartDate = moment(kendo.parseDate(newValue)).format('L LT');
                    //    //    }
                    //    //});
                    //}
                    //else {
                    //    _.each($scope.$parent.stageGroupInfo.stages, function (stageItem, index) {
                    //        if (index == 0) {
                    //            $scope.stage.evaluationStartDate = moment(kendo.parseDate(newValue)).format('L LT');
                    //            stageItem.evaluationStartDate = moment(kendo.parseDate(newValue)).format('L LT');
                    //            return (false);
                    //        }
                    //    });
                    //}
                    //var stageIndex = $scope.$parent.stageGroupInfo.stages.indexOf($scope.currentStage);
                    //var difference = datetimeCalculator.getTimeDifference(newValue, oldValue);
                    //if (difference != 0) {
                    //    if (difference > 0) {
                    //        datetimeCalculator.shiftStageDates($scope.$parent.stageGroupInfo.stages, difference, null, stageIndex);
                    //        var lastStage = $scope.$parent.stageGroupInfo.stages[$scope.$parent.stageGroupInfo.stages.length - 1];
                    //        datetimeCalculator.checkEndLimit($scope.$parent.stageGroupInfo, lastStage);
                    //    }
                    //    else {
                    //        if ((stageIndex != 0) && !datetimeCalculator.isFirstDateEarlier($scope.$parent.stageGroupInfo.stages[stageIndex].endDateTime, newValue)) {
                    //            datetimeCalculator.shiftStageDates($scope.$parent.stageGroupInfo.stages, difference, null, stageIndex);
                    //        }
                    //        datetimeCalculator.shiftStageDatesReversed($scope.$parent.stageGroupInfo.stages, difference, null, stageIndex);
                    //        datetimeCalculator.checkStartLimit($scope.$parent.stageGroupInfo, $scope.$parent.stageGroupInfo.stages[0]);
                    //    }
                    //}
                }

                function recalculateDueDates(newValue, oldValue) {
                    //if (!(kendo.parseDate(newValue) > moment($scope.stage.startDateTime)._d)) {
                    //    newValue = oldValue;
                    //}

                    if ($scope.$parent.stageGroupInfo) {
                        _.each($scope.$parent.stageGroupInfo.stages, function (stageItem, index) {
                            if (stageItem.id == $scope.stage.id) {
                                $scope.stage.evaluationEndDate = moment(kendo.parseDate(newValue)).format('L LT');
                                stageItem.evaluationEndDate = moment(kendo.parseDate(newValue)).format('L LT');
                                stageItem.endDateTime = moment(kendo.parseDate(newValue)).format('L LT');
                                if (index == 0) {
                                    if (kendo.parseDate(stageItem.evaluationStartDate) > kendo.parseDate(stageItem.evaluationEndDate)) {
                                        $scope.stage.startDateTime = null;
                                        $scope.stage.evaluationStartDate = null;
                                        stageItem.startDateTime = null;
                                        stageItem.evaluationStartDate = null;

                                        stageItem.redAlarmTime = null;
                                        stageItem.yellowAlarmTime = null;
                                        stageItem.greenAlarmTime = null;

                                        $scope.stage.redAlarmTime = null;
                                        $scope.stage.yellowAlarmTime = null;
                                        $scope.stage.greenAlarmTime = null;
                                    }
                                    else {
                                        var startdatetime = kendo.parseDate(stageItem.evaluationStartDate);
                                        var enddatetime = kendo.parseDate(stageItem.evaluationEndDate);
                                        var TotalDiffrence = enddatetime.getTime() - startdatetime.getTime();
                                        var greenAlarmAt = parseInt(TotalDiffrence * 0.20);
                                        var yellowAlarmAt = parseInt(TotalDiffrence * 0.60);
                                        var redAlarmAt = parseInt(TotalDiffrence * 0.90);
                                        stageItem.redAlarmTime = moment(new Date(enddatetime.getTime())).add(1, 'minutes').format('L LT');
                                        stageItem.yellowAlarmTime = moment(new Date(startdatetime.getTime() + yellowAlarmAt)).format('L LT');
                                        stageItem.greenAlarmTime = moment(new Date(startdatetime.getTime() + greenAlarmAt)).format('L LT');
                                        $scope.stage.redAlarmTime = moment(new Date(enddatetime.getTime())).add(1, 'minutes').format('L LT');
                                        $scope.stage.yellowAlarmTime = moment(new Date(startdatetime.getTime() + yellowAlarmAt)).format('L LT');
                                        $scope.stage.greenAlarmTime = moment(new Date(startdatetime.getTime() + greenAlarmAt)).format('L LT');
                                    }
                                    return (false);
                                }
                                else {

                                    if (kendo.parseDate(stageItem.evaluationStartDate) > kendo.parseDate(stageItem.evaluationEndDate)) {
                                        var newevaluationStartDate = moment(kendo.parseDate(stageItem.evaluationEndDate)).add(-5, 'days').format('L LT');
                                        if (kendo.parseDate(newevaluationStartDate) >= kendo.parseDate(stageItem.startDateTime)) {
                                            $scope.stage.evaluationStartDate = moment(kendo.parseDate(newevaluationStartDate)).format('L LT');
                                            stageItem.evaluationStartDate = moment(kendo.parseDate(newevaluationStartDate)).format('L LT');
                                        }
                                        else {
                                            $scope.stage.evaluationStartDate = moment(kendo.parseDate(stageItem.startDateTime)).format('L LT');
                                            stageItem.evaluationStartDate = moment(kendo.parseDate(stageItem.startDateTime)).format('L LT');
                                        }
                                    }


                                    var startdatetime = kendo.parseDate(stageItem.evaluationStartDate);
                                    var enddatetime = kendo.parseDate(stageItem.evaluationEndDate);
                                    var TotalDiffrence = enddatetime.getTime() - startdatetime.getTime();
                                    var greenAlarmAt = parseInt(TotalDiffrence * 0.20);
                                    var yellowAlarmAt = parseInt(TotalDiffrence * 0.60);
                                    var redAlarmAt = parseInt(TotalDiffrence * 0.90);
                                    stageItem.redAlarmTime = moment(new Date(enddatetime.getTime())).add(1, 'minutes').format('L LT');
                                    stageItem.yellowAlarmTime = moment(new Date(startdatetime.getTime() + yellowAlarmAt)).format('L LT');
                                    stageItem.greenAlarmTime = moment(new Date(startdatetime.getTime() + greenAlarmAt)).format('L LT');
                                    $scope.stage.redAlarmTime = moment(new Date(enddatetime.getTime())).add(1, 'minutes').format('L LT');
                                    $scope.stage.yellowAlarmTime = moment(new Date(startdatetime.getTime() + yellowAlarmAt)).format('L LT');
                                    $scope.stage.greenAlarmTime = moment(new Date(startdatetime.getTime() + greenAlarmAt)).format('L LT');
                                }
                            }
                        });
                        checkMilestoneDatesAreValid();
                    }

                    else if ($scope.stageInfo) {
                        _.each($scope.stageInfo.stages, function (stageItem, index) {
                            if (stageItem.id == $scope.stage.id) {
                                stageItem.isChanged = true;
                                $scope.stage.evaluationEndDate = moment(kendo.parseDate(newValue)).format('L LT');
                                stageItem.evaluationEndDate = moment(kendo.parseDate(newValue)).format('L LT');
                                stageItem.endDateTime = moment(kendo.parseDate(newValue)).format('L LT');
                                if (index == 0) {
                                    if (kendo.parseDate(stageItem.evaluationStartDate) > kendo.parseDate(stageItem.evaluationEndDate)) {
                                        $scope.stage.evaluationStartDate = null;
                                        stageItem.evaluationStartDate = null;

                                        stageItem.redAlarmTime = null;
                                        stageItem.yellowAlarmTime = null;
                                        stageItem.greenAlarmTime = null;

                                        $scope.stage.redAlarmTime = null;
                                        $scope.stage.yellowAlarmTime = null;
                                        $scope.stage.greenAlarmTime = null;
                                    }
                                    else {
                                        var startdatetime = kendo.parseDate(stageItem.evaluationStartDate);
                                        var enddatetime = kendo.parseDate(stageItem.evaluationEndDate);
                                        var TotalDiffrence = enddatetime.getTime() - startdatetime.getTime();
                                        var greenAlarmAt = parseInt(TotalDiffrence * 0.20);
                                        var yellowAlarmAt = parseInt(TotalDiffrence * 0.60);
                                        var redAlarmAt = parseInt(TotalDiffrence * 0.90);
                                        stageItem.redAlarmTime = moment(new Date(enddatetime.getTime())).add(1, 'minutes').format('L LT');
                                        stageItem.yellowAlarmTime = moment(new Date(startdatetime.getTime() + yellowAlarmAt)).format('L LT');
                                        stageItem.greenAlarmTime = moment(new Date(startdatetime.getTime() + greenAlarmAt)).format('L LT');
                                        $scope.stage.redAlarmTime = moment(new Date(enddatetime.getTime())).add(1, 'minutes').format('L LT');
                                        $scope.stage.yellowAlarmTime = moment(new Date(startdatetime.getTime() + yellowAlarmAt)).format('L LT');
                                        $scope.stage.greenAlarmTime = moment(new Date(startdatetime.getTime() + greenAlarmAt)).format('L LT');
                                    }
                                    return (false);
                                }
                                else {
                                    if (stageItem.evaluationStartDate == null) {

                                        var newevaluationStartDate = moment(kendo.parseDate(stageItem.evaluationEndDate)).add(-5, 'days').format('L LT');
                                        if (kendo.parseDate(newevaluationStartDate) >= kendo.parseDate(stageItem.startDateTime)) {
                                            $scope.stage.evaluationStartDate = moment(kendo.parseDate(newevaluationStartDate)).format('L LT');
                                            stageItem.evaluationStartDate = moment(kendo.parseDate(newevaluationStartDate)).format('L LT');
                                        }
                                        else {
                                            $scope.stage.evaluationStartDate = moment(kendo.parseDate(stageItem.startDateTime)).format('L LT');
                                            stageItem.evaluationStartDate = moment(kendo.parseDate(stageItem.startDateTime)).format('L LT');
                                        }
                                    }
                                    if (kendo.parseDate(stageItem.evaluationStartDate) > kendo.parseDate(stageItem.evaluationEndDate)) {
                                        var newevaluationStartDate = moment(kendo.parseDate(stageItem.evaluationEndDate)).add(-5, 'days').format('L LT');
                                        if (kendo.parseDate(newevaluationStartDate) >= kendo.parseDate(stageItem.startDateTime)) {
                                            $scope.stage.evaluationStartDate = moment(kendo.parseDate(newevaluationStartDate)).format('L LT');
                                            stageItem.evaluationStartDate = moment(kendo.parseDate(newevaluationStartDate)).format('L LT');
                                        }
                                        else {
                                            $scope.stage.evaluationStartDate = moment(kendo.parseDate(stageItem.startDateTime)).format('L LT');
                                            stageItem.evaluationStartDate = moment(kendo.parseDate(stageItem.startDateTime)).format('L LT');
                                        }
                                    }


                                    var startdatetime = kendo.parseDate(stageItem.evaluationStartDate);
                                    var enddatetime = kendo.parseDate(stageItem.evaluationEndDate);
                                    var TotalDiffrence = enddatetime.getTime() - startdatetime.getTime();
                                    var greenAlarmAt = parseInt(TotalDiffrence * 0.20);
                                    var yellowAlarmAt = parseInt(TotalDiffrence * 0.60);
                                    var redAlarmAt = parseInt(TotalDiffrence * 0.90);
                                    stageItem.redAlarmTime = moment(new Date(enddatetime.getTime())).add(1, 'minutes').format('L LT');
                                    stageItem.yellowAlarmTime = moment(new Date(startdatetime.getTime() + yellowAlarmAt)).format('L LT');
                                    stageItem.greenAlarmTime = moment(new Date(startdatetime.getTime() + greenAlarmAt)).format('L LT');
                                    $scope.stage.redAlarmTime = moment(new Date(enddatetime.getTime())).add(1, 'minutes').format('L LT');
                                    $scope.stage.yellowAlarmTime = moment(new Date(startdatetime.getTime() + yellowAlarmAt)).format('L LT');
                                    $scope.stage.greenAlarmTime = moment(new Date(startdatetime.getTime() + greenAlarmAt)).format('L LT');

                                }
                            }
                        });
                        checkMilestoneDatesAreValid();

                        if ($scope.stage.isExtend) {
                            var currentStageIndex = _.findIndex($scope.stageInfo.stages, function (item) {
                                return item.id == $scope.stage.id;
                            });
                            var currentStage = _.findIndex($scope.stageInfo.stages, function (item) {
                                return item.id == $scope.stage.id;
                            });

                            _.each($scope.stageInfo.stages, function (item, index) {
                                if ((index - 1) == currentStageIndex) {
                                    var diff = moment(kendo.parseDate(item.endDateTime)).diff(moment(kendo.parseDate(item.startDateTime)));
                                    item.startDateTime = moment(newValue).format("L LT");
                                    item.endDateTime = moment(kendo.parseDate(newValue)).add(diff).format('L LT');

                                    var evaluationDiff = moment(kendo.parseDate(item.evaluationStartDate)).diff(moment(kendo.parseDate(item.evaluationEndDate)));
                                    item.evaluationEndDate = moment(item.endDateTime).format("L LT");
                                    item.evaluationStartDate = moment(kendo.parseDate(item.evaluationEndDate)).add(evaluationDiff).format('L LT');
                                    if (moment(kendo.parseDate(item.evaluationStartDate)).isBefore(moment(kendo.parseDate(currentStage.evaluationStartDate)))) {
                                        item.evaluationStartDate = moment(item.startDateTime).format("L LT");
                                    }
                                    var TotalDiffrence = moment(kendo.parseDate(item.evaluationEndDate)).diff(moment(kendo.parseDate(item.evaluationStartDate)));
                                    var greenAlarmAt = parseInt(TotalDiffrence * 0.20);
                                    var yellowAlarmAt = parseInt(TotalDiffrence * 0.60);
                                    item.redAlarmTime = moment(kendo.parseDate(item.evaluationEndDate)).add(1, 'minutes').format('L LT');
                                    item.yellowAlarmTime = moment(kendo.parseDate(item.evaluationStartDate)).add(yellowAlarmAt).format('L LT');
                                    item.greenAlarmTime = moment(kendo.parseDate(item.evaluationStartDate)).add(greenAlarmAt).format('L LT');
                                    item.isChanged = true;
                                }
                                else if (index > currentStageIndex) {
                                    var diff = moment(kendo.parseDate(item.endDateTime)).diff(moment(kendo.parseDate(item.startDateTime)));
                                    item.startDateTime = moment($scope.stageInfo.stages[index - 1].endDateTime).format("L LT");
                                    item.endDateTime = moment(kendo.parseDate(item.startDateTime)).add(diff).format('L LT');

                                    var evaluationDiff = moment(kendo.parseDate(item.evaluationStartDate)).diff(moment(kendo.parseDate(item.evaluationEndDate)));
                                    item.evaluationEndDate = moment(item.endDateTime).format("L LT");
                                    item.evaluationStartDate = moment(kendo.parseDate(item.evaluationEndDate)).add(evaluationDiff).format('L LT');
                                    if (moment(kendo.parseDate(item.evaluationStartDate)).isBefore(moment(kendo.parseDate($scope.stageInfo.stages[index - 1].evaluationStartDate)))) {
                                        item.evaluationStartDate = moment(item.startDateTime).format("L LT");
                                    }
                                    var TotalDiffrence = moment(kendo.parseDate(item.evaluationEndDate)).diff(moment(kendo.parseDate(item.evaluationStartDate)));
                                    var greenAlarmAt = parseInt(TotalDiffrence * 0.20);
                                    var yellowAlarmAt = parseInt(TotalDiffrence * 0.60);
                                    item.redAlarmTime = moment(kendo.parseDate(item.evaluationEndDate)).add(1, 'minutes').format('L LT');
                                    item.yellowAlarmTime = moment(kendo.parseDate(item.evaluationStartDate)).add(yellowAlarmAt).format('L LT');
                                    item.greenAlarmTime = moment(kendo.parseDate(item.evaluationStartDate)).add(greenAlarmAt).format('L LT');
                                    item.isChanged = true;

                                }

                                if (index == ($scope.stageInfo.stages.length - 1)) {
                                    if (!(moment(kendo.parseDate(item.evaluationEndDate)).isBefore(moment(kendo.parseDate($scope.stageInfo.endDate))))) {
                                        $scope.stageInfo.endDate = moment(kendo.parseDate(item.evaluationEndDate)).format("L LT");
                                        dialogService.showNotification("Stage Group date is also update as per it extended milestone dates", 'warning');
                                    }

                                }
                            })
                        }
                    }


                    //var stageIndex = $scope.stageInfo.stages.indexOf($scope.currentStage);
                    //var difference = datetimeCalculator.getTimeDifference(newValue, oldValue);
                    //if (difference != 0) {
                    //    if (difference > 0) {
                    //        if ((stageIndex != ($scope.stageInfo.stages.length + 1))) {
                    //            if (!datetimeCalculator.isFirstDateEarlier(newValue, $scope.stageInfo.stages[stageIndex].startDateTime)) {
                    //                datetimeCalculator.shiftStageDates($scope.stageInfo.stages, difference, null, stageIndex);
                    //            }
                    //        } else {
                    //            datetimeCalculator.shiftStageDates($scope.stageInfo.stages, difference, null, stageIndex);
                    //        }
                    //        var lastStage = $scope.stageInfo.stages[$scope.stageInfo.stages.length - 1];
                    //        datetimeCalculator.checkEndLimit($scope.stageInfo, lastStage);

                    //    } else {
                    //        datetimeCalculator.shiftStageDatesReversed($scope.stageInfo.stages, difference, null, stageIndex);
                    //        datetimeCalculator.checkStartLimit($scope.stageInfo, $scope.stageInfo.stages[0]);
                    //    }
                    //}
                }

                function evaluationStartDateChange(newValue, oldValue) {
                    if (!(kendo.parseDate(newValue) < kendo.parseDate($scope.stage.endDateTime))) {
                        newValue = oldValue;
                    }

                    if ($scope.$parent.stageGroupInfo) {
                        _.each($scope.$parent.stageGroupInfo.stages, function (stageItem, index) {
                            if (stageItem.id == $scope.stage.id) {
                                if (index == 0) {
                                    $scope.stage.evaluationStartDate = moment(kendo.parseDate(newValue)).format('L LT');
                                    stageItem.evaluationStartDate = moment(kendo.parseDate(newValue)).format('L LT');
                                    if (kendo.parseDate(newValue) > kendo.parseDate($scope.stage.endDateTime)) {
                                        $scope.stage.endDateTime = null;
                                        $scope.stage.evaluationEndDate = null;
                                        stageItem.endDateTime = null;
                                        stageItem.evaluationEndDate = null;

                                        stageItem.redAlarmTime = null;
                                        stageItem.yellowAlarmTime = null;
                                        stageItem.greenAlarmTime = null;
                                        $scope.stage.redAlarmTime = null;
                                        $scope.stage.yellowAlarmTime = null;
                                        $scope.stage.greenAlarmTime = null;
                                    }
                                    else {
                                        var startdatetime = kendo.parseDate(newValue);
                                        var enddatetime = kendo.parseDate(stageItem.evaluationEndDate);
                                        var TotalDiffrence = enddatetime.getTime() - startdatetime.getTime();
                                        var greenAlarmAt = parseInt(TotalDiffrence * 0.20);
                                        var yellowAlarmAt = parseInt(TotalDiffrence * 0.60);
                                        var redAlarmAt = parseInt(TotalDiffrence * 0.90);
                                        stageItem.redAlarmTime = moment(new Date(enddatetime.getTime())).add(1, 'minutes').format('L LT');
                                        stageItem.yellowAlarmTime = moment(new Date(startdatetime.getTime() + yellowAlarmAt)).format('L LT');
                                        stageItem.greenAlarmTime = moment(new Date(startdatetime.getTime() + greenAlarmAt)).format('L LT');
                                        $scope.stage.redAlarmTime = moment(new Date(enddatetime.getTime())).add(1, 'minutes').format('L LT');
                                        $scope.stage.yellowAlarmTime = moment(new Date(startdatetime.getTime() + yellowAlarmAt)).format('L LT');
                                        $scope.stage.greenAlarmTime = moment(new Date(startdatetime.getTime() + greenAlarmAt)).format('L LT');
                                    }
                                    return (false);
                                }
                                else {
                                    if (kendo.parseDate(newValue) > kendo.parseDate($scope.stage.endDateTime)) {
                                        $scope.stage.endDateTime = null;
                                        $scope.stage.evaluationEndDate = null;
                                        $scope.stage.evaluationStartDate = null;

                                        stageItem.endDateTime = null;
                                        stageItem.evaluationEndDate = null;
                                        stageItem.evaluationStartDate = null;

                                        stageItem.redAlarmTime = null;
                                        stageItem.yellowAlarmTime = null;
                                        stageItem.greenAlarmTime = null;

                                        $scope.stage.redAlarmTime = null;
                                        $scope.stage.yellowAlarmTime = null;
                                        $scope.stage.greenAlarmTime = null;
                                    }
                                    else {
                                        var startdatetime = kendo.parseDate(stageItem.evaluationStartDate);
                                        var enddatetime = kendo.parseDate(stageItem.evaluationEndDate);
                                        var TotalDiffrence = enddatetime.getTime() - startdatetime.getTime();
                                        var greenAlarmAt = parseInt(TotalDiffrence * 0.20);
                                        var yellowAlarmAt = parseInt(TotalDiffrence * 0.60);
                                        var redAlarmAt = parseInt(TotalDiffrence * 0.90);
                                        stageItem.redAlarmTime = moment(new Date(enddatetime.getTime())).add(1, 'minutes').format('L LT');
                                        stageItem.yellowAlarmTime = moment(new Date(startdatetime.getTime() + yellowAlarmAt)).format('L LT');
                                        stageItem.greenAlarmTime = moment(new Date(startdatetime.getTime() + greenAlarmAt)).format('L LT');
                                        $scope.stage.redAlarmTime = moment(new Date(enddatetime.getTime())).add(1, 'minutes').format('L LT');
                                        $scope.stage.yellowAlarmTime = moment(new Date(startdatetime.getTime() + yellowAlarmAt)).format('L LT');
                                        $scope.stage.greenAlarmTime = moment(new Date(startdatetime.getTime() + greenAlarmAt)).format('L LT');
                                    }
                                }
                            }
                        });
                        checkMilestoneDatesAreValid();
                    }
                    else if ($scope.stageInfo) {
                        _.each($scope.stageInfo.stages, function (stageItem, index) {
                            if (stageItem.id == $scope.stage.id) {
                                stageItem.evaluationStartDate = moment(kendo.parseDate(newValue)).format('L LT');
                                stageItem.isChanged = true;
                                if (index == 0) {
                                    $scope.stage.evaluationStartDate = moment(kendo.parseDate(newValue)).format('L LT');
                                    stageItem.evaluationStartDate = moment(kendo.parseDate(newValue)).format('L LT');
                                    if (kendo.parseDate(newValue) > kendo.parseDate($scope.stage.endDateTime)) {
                                        $scope.stage.endDateTime = null;
                                        $scope.stage.evaluationEndDate = null;
                                        stageItem.endDateTime = null;
                                        stageItem.evaluationEndDate = null;

                                        stageItem.redAlarmTime = null;
                                        stageItem.yellowAlarmTime = null;
                                        stageItem.greenAlarmTime = null;

                                        $scope.stage.redAlarmTime = null;
                                        $scope.stage.yellowAlarmTime = null;
                                        $scope.stage.greenAlarmTime = null;
                                    }
                                    else {
                                        var startdatetime = kendo.parseDate(stageItem.evaluationStartDate);
                                        var enddatetime = kendo.parseDate(stageItem.evaluationEndDate);
                                        var TotalDiffrence = enddatetime.getTime() - startdatetime.getTime();
                                        var greenAlarmAt = parseInt(TotalDiffrence * 0.20);
                                        var yellowAlarmAt = parseInt(TotalDiffrence * 0.60);
                                        var redAlarmAt = parseInt(TotalDiffrence * 0.90);
                                        stageItem.redAlarmTime = moment(new Date(enddatetime.getTime())).add(1, 'minutes').format('L LT');
                                        stageItem.yellowAlarmTime = moment(new Date(startdatetime.getTime() + yellowAlarmAt)).format('L LT');
                                        stageItem.greenAlarmTime = moment(new Date(startdatetime.getTime() + greenAlarmAt)).format('L LT');
                                        $scope.stage.redAlarmTime = moment(new Date(enddatetime.getTime())).add(1, 'minutes').format('L LT');
                                        $scope.stage.yellowAlarmTime = moment(new Date(startdatetime.getTime() + yellowAlarmAt)).format('L LT');
                                        $scope.stage.greenAlarmTime = moment(new Date(startdatetime.getTime() + greenAlarmAt)).format('L LT');
                                    }
                                    return (false);
                                }
                                else {
                                    if (kendo.parseDate(newValue) > kendo.parseDate($scope.stage.endDateTime)) {
                                        $scope.stage.endDateTime = null;
                                        $scope.stage.evaluationEndDate = null;
                                        $scope.stage.evaluationStartDate = null;

                                        stageItem.endDateTime = null;
                                        stageItem.evaluationEndDate = null;
                                        stageItem.evaluationStartDate = null;

                                        stageItem.redAlarmTime = null;
                                        stageItem.yellowAlarmTime = null;
                                        stageItem.greenAlarmTime = null;

                                        $scope.stage.redAlarmTime = null;
                                        $scope.stage.yellowAlarmTime = null;
                                        $scope.stage.greenAlarmTime = null;
                                    }
                                    else if (kendo.parseDate(newValue) > kendo.parseDate($scope.stage.evaluationStartDate)) {
                                        $scope.stage.evaluationStartDate = moment(kendo.parseDate(newValue)).format('L LT');
                                        stageItem.evaluationStartDate = moment(kendo.parseDate(newValue)).format('L LT');

                                        var startdatetime = kendo.parseDate(stageItem.evaluationStartDate);
                                        var enddatetime = kendo.parseDate(stageItem.evaluationEndDate);
                                        var TotalDiffrence = enddatetime.getTime() - startdatetime.getTime();
                                        var greenAlarmAt = parseInt(TotalDiffrence * 0.20);
                                        var yellowAlarmAt = parseInt(TotalDiffrence * 0.60);
                                        var redAlarmAt = parseInt(TotalDiffrence * 0.90);
                                        stageItem.redAlarmTime = moment(new Date(enddatetime.getTime())).add(1, 'minutes').format('L LT');
                                        stageItem.yellowAlarmTime = moment(new Date(startdatetime.getTime() + yellowAlarmAt)).format('L LT');
                                        stageItem.greenAlarmTime = moment(new Date(startdatetime.getTime() + greenAlarmAt)).format('L LT');
                                        $scope.stage.redAlarmTime = moment(new Date(enddatetime.getTime())).add(1, 'minutes').format('L LT');
                                        $scope.stage.yellowAlarmTime = moment(new Date(startdatetime.getTime() + yellowAlarmAt)).format('L LT');
                                        $scope.stage.greenAlarmTime = moment(new Date(startdatetime.getTime() + greenAlarmAt)).format('L LT');
                                    }
                                }
                            }
                        });
                        checkMilestoneDatesAreValid();
                    }
                }

                function evaluationEndDateChange(newValue, oldValue) {
                    if ($scope.$parent.stageGroupInfo) {
                        _.each($scope.$parent.stageGroupInfo.stages, function (stageItem, index) {
                            if (stageItem.id == $scope.stage.id) {
                                $scope.stage.evaluationEndDate = moment(kendo.parseDate(newValue)).format('L LT');
                                stageItem.evaluationEndDate = moment(kendo.parseDate(newValue)).format('L LT');
                                $scope.stage.endDateTime = moment(kendo.parseDate(newValue)).format('L LT');
                                stageItem.endDateTime = moment(kendo.parseDate(newValue)).format('L LT');

                                if (index == 0) {
                                    if (kendo.parseDate(stageItem.evaluationStartDate) > kendo.parseDate(stageItem.evaluationEndDate)) {
                                        $scope.stage.startDateTime = null;
                                        $scope.stage.evaluationStartDate = null;
                                        stageItem.startDateTime = null;
                                        stageItem.evaluationStartDate = null;

                                        stageItem.redAlarmTime = null;
                                        stageItem.yellowAlarmTime = null;
                                        stageItem.greenAlarmTime = null;

                                        $scope.stage.redAlarmTime = null;
                                        $scope.stage.yellowAlarmTime = null;
                                        $scope.stage.greenAlarmTime = null;
                                    }
                                    else {
                                        var startdatetime = kendo.parseDate(stageItem.evaluationStartDate);
                                        var enddatetime = kendo.parseDate(stageItem.evaluationEndDate);
                                        var TotalDiffrence = enddatetime.getTime() - startdatetime.getTime();
                                        var greenAlarmAt = parseInt(TotalDiffrence * 0.20);
                                        var yellowAlarmAt = parseInt(TotalDiffrence * 0.60);
                                        var redAlarmAt = parseInt(TotalDiffrence * 0.90);
                                        stageItem.redAlarmTime = moment(new Date(enddatetime.getTime())).add(1, 'minutes').format('L LT');
                                        stageItem.yellowAlarmTime = moment(new Date(startdatetime.getTime() + yellowAlarmAt)).format('L LT');
                                        stageItem.greenAlarmTime = moment(new Date(startdatetime.getTime() + greenAlarmAt)).format('L LT');
                                        $scope.stage.redAlarmTime = moment(new Date(enddatetime.getTime())).add(1, 'minutes').format('L LT');
                                        $scope.stage.yellowAlarmTime = moment(new Date(startdatetime.getTime() + yellowAlarmAt)).format('L LT');
                                        $scope.stage.greenAlarmTime = moment(new Date(startdatetime.getTime() + greenAlarmAt)).format('L LT');
                                    }
                                    return (false);
                                }
                            }
                        });
                        checkMilestoneDatesAreValid();
                    }
                    else if ($scope.stageInfo) {
                        _.each($scope.stageInfo.stages, function (stageItem, index) {
                            if (stageItem.id == $scope.stage.id) {
                                $scope.stage.evaluationEndDate = moment(kendo.parseDate(newValue)).format('L LT');
                                stageItem.evaluationEndDate = moment(kendo.parseDate(newValue)).format('L LT');
                                stageItem.endDateTime = moment(kendo.parseDate(newValue)).format('L LT');
                                $scope.stage.endDateTime = moment(kendo.parseDate(newValue)).format('L LT');
                                stageItem.endDateTime = moment(kendo.parseDate(newValue)).format('L LT');
                                stageItem.isChanged = true;
                                if (index == 0) {
                                    if (kendo.parseDate(stageItem.evaluationStartDate) > kendo.parseDate(stageItem.evaluationEndDate)) {
                                        $scope.stage.evaluationStartDate = null;
                                        stageItem.evaluationStartDate = null;

                                        stageItem.redAlarmTime = null;
                                        stageItem.yellowAlarmTime = null;
                                        stageItem.greenAlarmTime = null;

                                        $scope.stage.redAlarmTime = null;
                                        $scope.stage.yellowAlarmTime = null;
                                        $scope.stage.greenAlarmTime = null;
                                    }
                                    else {
                                        var startdatetime = kendo.parseDate(stageItem.evaluationStartDate);
                                        var enddatetime = kendo.parseDate(stageItem.evaluationEndDate);
                                        var TotalDiffrence = enddatetime.getTime() - startdatetime.getTime();
                                        var greenAlarmAt = parseInt(TotalDiffrence * 0.20);
                                        var yellowAlarmAt = parseInt(TotalDiffrence * 0.60);
                                        var redAlarmAt = parseInt(TotalDiffrence * 0.90);
                                        stageItem.redAlarmTime = moment(new Date(enddatetime.getTime())).add(1, 'minutes').format('L LT');
                                        stageItem.yellowAlarmTime = moment(new Date(startdatetime.getTime() + yellowAlarmAt)).format('L LT');
                                        stageItem.greenAlarmTime = moment(new Date(startdatetime.getTime() + greenAlarmAt)).format('L LT');
                                        $scope.stage.redAlarmTime = moment(new Date(enddatetime.getTime())).add(1, 'minutes').format('L LT');
                                        $scope.stage.yellowAlarmTime = moment(new Date(startdatetime.getTime() + yellowAlarmAt)).format('L LT');
                                        $scope.stage.greenAlarmTime = moment(new Date(startdatetime.getTime() + greenAlarmAt)).format('L LT');
                                    }
                                    return (false);
                                }
                            }
                        });
                        checkMilestoneDatesAreValid();

                        if ($scope.stage.isExtend) {
                            var currentStageIndex = _.findIndex($scope.stageInfo.stages, function (item) {
                                return item.id == $scope.stage.id;
                            });
                            var currentStage = _.findIndex($scope.stageInfo.stages, function (item) {
                                return item.id == $scope.stage.id;
                            });

                            _.each($scope.stageInfo.stages, function (item, index) {
                                if ((index - 1) == currentStageIndex) {
                                    var diff = moment(kendo.parseDate(item.endDateTime)).diff(moment(kendo.parseDate(item.startDateTime)));
                                    item.startDateTime = moment(newValue).format("L LT");
                                    item.endDateTime = moment(kendo.parseDate(newValue)).add(diff).format('L LT');

                                    var evaluationDiff = moment(kendo.parseDate(item.evaluationStartDate)).diff(moment(kendo.parseDate(item.evaluationEndDate)));
                                    item.evaluationEndDate = moment(item.endDateTime).format("L LT");
                                    item.evaluationStartDate = moment(kendo.parseDate(item.evaluationEndDate)).add(evaluationDiff).format('L LT');
                                    if (moment(kendo.parseDate(item.evaluationStartDate)).isBefore(moment(kendo.parseDate(currentStage.evaluationStartDate)))) {
                                        item.evaluationStartDate = moment(item.startDateTime).format("L LT");
                                    }
                                    var TotalDiffrence = moment(kendo.parseDate(item.evaluationEndDate)).diff(moment(kendo.parseDate(item.evaluationStartDate)));
                                    var greenAlarmAt = parseInt(TotalDiffrence * 0.20);
                                    var yellowAlarmAt = parseInt(TotalDiffrence * 0.60);
                                    item.redAlarmTime = moment(kendo.parseDate(item.evaluationEndDate)).add(1, 'minutes').format('L LT');
                                    item.yellowAlarmTime = moment(kendo.parseDate(item.evaluationStartDate)).add(yellowAlarmAt).format('L LT');
                                    item.greenAlarmTime = moment(kendo.parseDate(item.evaluationStartDate)).add(greenAlarmAt).format('L LT');
                                    item.isChanged = true;
                                }
                                else if (index > currentStageIndex) {
                                    var diff = moment(kendo.parseDate(item.endDateTime)).diff(moment(kendo.parseDate(item.startDateTime)));
                                    item.startDateTime = moment($scope.stageInfo.stages[index - 1].endDateTime).format("L LT");
                                    item.endDateTime = moment(kendo.parseDate(item.startDateTime)).add(diff).format('L LT');

                                    var evaluationDiff = moment(kendo.parseDate(item.evaluationStartDate)).diff(moment(kendo.parseDate(item.evaluationEndDate)));
                                    item.evaluationEndDate = moment(item.endDateTime).format("L LT");
                                    item.evaluationStartDate = moment(kendo.parseDate(item.evaluationEndDate)).add(evaluationDiff).format('L LT');
                                    if (moment(kendo.parseDate(item.evaluationStartDate)).isBefore(moment(kendo.parseDate($scope.stageInfo.stages[index - 1].evaluationStartDate)))) {
                                        item.evaluationStartDate = moment(item.startDateTime).format("L LT");
                                    }

                                    var TotalDiffrence = moment(kendo.parseDate(item.evaluationEndDate)).diff(moment(kendo.parseDate(item.evaluationStartDate)));
                                    var greenAlarmAt = parseInt(TotalDiffrence * 0.20);
                                    var yellowAlarmAt = parseInt(TotalDiffrence * 0.60);
                                    item.redAlarmTime = moment(kendo.parseDate(item.evaluationEndDate)).add(1, 'minutes').format('L LT');
                                    item.yellowAlarmTime = moment(kendo.parseDate(item.evaluationStartDate)).add(yellowAlarmAt).format('L LT');
                                    item.greenAlarmTime = moment(kendo.parseDate(item.evaluationStartDate)).add(greenAlarmAt).format('L LT');
                                    item.isChanged = true;


                                }


                                if (index == ($scope.stageInfo.stages.length - 1)) {
                                    if (!(moment(kendo.parseDate(item.evaluationEndDate)).isBefore(moment(kendo.parseDate($scope.stageInfo.endDate))))) {
                                        $scope.stageInfo.endDate = moment(kendo.parseDate(item.evaluationEndDate)).format("L LT");
                                        dialogService.showNotification("Stage Group date is also update as per it extended milestone dates", 'warning');
                                    }
                                }
                            })
                        }
                    }
                }

                //function checkMilestoneDatesAreValid() {
                //    var result = true;
                //    $scope.errors = [];
                //    if ($scope.stage) {
                //        var stageIndex = _.findIndex($scope.$parent.stageGroupInfo.stages, function (item) {
                //            return item.id == $scope.stage.id;
                //        });
                //        if ($scope.stage.endDateTime == null) {
                //            $scope.errors.push("Invalid Due Date of " + $scope.stage.name);
                //        }
                //        else {
                //            _.each($scope.$parent.stageGroupInfo.stages, function (item, index) {
                //                if (index == (stageIndex + 1)) {
                //                    if (moment($scope.stage.endDateTime)._d > kendo.parseDate(item.startDateTime)) {
                //                        $scope.errors.push(item.name + " start  before " + $scope.stage.name + " due");
                //                    }
                //                }
                //                if (index == (stageIndex - 1)) {
                //                    if (moment($scope.stage.startDateTime)._d < kendo.parseDate(item.endDateTime)) {
                //                        $scope.errors.push($scope.stage.name + " start  before  " + item.name + " due");
                //                    }
                //                }
                //            });
                //        }
                //    }
                //    if ($scope.errors.length > 0) {
                //        result = false;
                //    }
                //    return result;
                //}


                function checkMilestoneDatesAreValid() {
                    var result = true;
                    $scope.errors = [];
                    if ($scope.$parent.stageGroupInfo) {
                        _.each($scope.$parent.stageGroupInfo.stages, function (stageItem) {
                            //
                            if (stageItem && $scope.$parent.stageGroupInfo) {
                                var stageIndex = _.findIndex($scope.$parent.stageGroupInfo.stages, function (item) {
                                    return item.id == stageItem.id;
                                });

                                if (stageItem.evaluationStartDate == null) {
                                    $scope.errors.push($translate.instant('SOFTPROFILE_INVALID_EVALUATION_START_DATE') + " " + stageItem.name);
                                }
                                if (kendo.parseDate(stageItem.evaluationStartDate) < kendo.parseDate(stageItem.startDateTime)) {
                                    $scope.errors.push($translate.instant('SOFTPROFILE_INVALID_EVALUATION_START_DATE_BEFORE_RCT_OPEN') + " " + stageItem.name);
                                }
                                if (kendo.parseDate(stageItem.endDateTime) < kendo.parseDate(stageItem.startDateTime)) {
                                    $scope.errors.push($translate.instant('SOFTPROFILE_RCT_DUE_DATE_BEFORE_RCT_START_DATE') + " " + stageItem.name);
                                }
                                if (stageItem.endDateTime == null) {
                                    $scope.errors.push($translate.instant('SOFTPROFILE_INVALID_DUE_DATE_OF') + " " + stageItem.name);
                                }
                                if (stageItem.endDateTime != null) {
                                    _.each($scope.$parent.stageGroupInfo.stages, function (item, index) {
                                        if (index == (stageIndex + 1)) {
                                            if (kendo.parseDate(stageItem.endDateTime) > kendo.parseDate(item.startDateTime)) {
                                                $scope.errors.push(item.name + " " + $translate.instant('SOFTPROFILE_START_BEFORE') + " " + stageItem.name + " " + $translate.instant('SOFTPROFILE_DUE'));
                                            }
                                        }
                                        if (index == (stageIndex - 1)) {
                                            if (kendo.parseDate(stageItem.startDateTime) < kendo.parseDate(item.endDateTime)) {
                                                $scope.errors.push(stageItem.name + " " + $translate.instant('SOFTPROFILE_START_BEFORE') + " " + item.name + " " + $translate.instant('SOFTPROFILE_DUE'));
                                            }
                                        }
                                    });
                                }
                            }
                            //
                        })
                        if ($scope.errors.length > 0) {
                            $scope.errors = _.unique($scope.errors);
                            result = false;
                        }
                    }
                    return result;
                }

                $scope.recalculateStartDates = recalculateStartDates;
                $scope.recalculateDueDates = recalculateDueDates;
                $scope.evaluationStartDateChange = evaluationStartDateChange;
                $scope.evaluationEndDateChange = evaluationEndDateChange;
                $scope.isDateTimeValid = function (date, isRequered) {
                    if (isRequered) {
                        return datetimeCalculator.isValidDatePatern(date, 'L LT');
                    } else {
                        return !date || datetimeCalculator.isValidDatePatern(date, 'L LT');
                    }
                };

                $scope.stageStartDateTimeOpen = function (event) {
                    var datepicker = $(event.sender.element).data("kendoDateTimePicker");

                    var prevStage = getPreviousStage();
                    if (prevStage) {
                        datepicker.setOptions({
                            min: kendo.parseDate(prevStage.endDateTime),
                        });
                    }
                }

                $scope.EvaluatorStartStageStartTemplates = function (item) {
                    if (item.id == null) {
                        return true;
                    }
                    if (item.stageTypeId == stageTypesEnum.StartProfile && item.notificationTemplateTypeId == templateTypeEnum.MilestoneStartNotification && item.evaluationRoleId == evaluationRolesEnum.evaluator && item.profileTypeId == $scope.profileTypeId) {
                        return true;
                    }
                    else {
                        return false;
                    }
                }
                $scope.ParticipantStartStageStartTemplates = function (item) {
                    if (item.id == null) {
                        return true;
                    }
                    if (item.stageTypeId == stageTypesEnum.StartProfile && item.notificationTemplateTypeId == templateTypeEnum.MilestoneStartNotification && item.evaluationRoleId == evaluationRolesEnum.participant && item.profileTypeId == $scope.profileTypeId) {
                        return true;
                    }
                    else {
                        return false;
                    }
                }
                $scope.FinalScoreManagerStartStageStartTemplates = function (item) {
                    if (item.id == null) {
                        return true;
                    }
                    if (item.stageTypeId == stageTypesEnum.StartProfile && item.notificationTemplateTypeId == templateTypeEnum.MilestoneStartNotification && item.evaluationRoleId == evaluationRolesEnum.evaluator && item.profileTypeId == $scope.profileTypeId) {
                        return true;
                    }
                    else {
                        return false;
                    }
                }
                $scope.ManagerStartStageStartTemplates = function (item) {
                    if (item.id == null) {
                        return true;
                    }
                    if (item.stageTypeId == stageTypesEnum.StartProfile && item.notificationTemplateTypeId == templateTypeEnum.MilestoneStartNotification && item.evaluationRoleId == evaluationRolesEnum.manager && item.profileTypeId == $scope.profileTypeId) {
                        return true;
                    }
                    else {
                        return false;
                    }
                }
                $scope.TrainerStartStageStartTemplates = function (item) {
                    if (item.id == null) {
                        return true;
                    }
                    if (item.stageTypeId == stageTypesEnum.StartProfile && item.notificationTemplateTypeId == templateTypeEnum.MilestoneStartNotification && item.evaluationRoleId == evaluationRolesEnum.trainer && item.profileTypeId == $scope.profileTypeId) {
                        return true;
                    }
                    else {
                        return false;
                    }
                }
                $scope.ProjectManagerStartStageStartTemplates = function (item) {
                    if (item.id == null) {
                        return true;
                    }
                    if (item.stageTypeId == stageTypesEnum.StartProfile && item.notificationTemplateTypeId == templateTypeEnum.MilestoneStartNotification && item.evaluationRoleId == evaluationRolesEnum.manager && item.profileTypeId == $scope.profileTypeId) {
                        return true;
                    }
                    else {
                        return false;
                    }
                }

                $scope.EvaluatorStartStageCompleteTemplates = function (item) {
                    if (item.id == null) {
                        return true;
                    }
                    if (item.stageTypeId == stageTypesEnum.StartProfile && item.notificationTemplateTypeId == templateTypeEnum.MilestoneCompleteNotification && item.evaluationRoleId == evaluationRolesEnum.evaluator) {
                        return true;
                    }
                    else {
                        return false;
                    }
                }
                $scope.ParticipantStartStageCompleteTemplates = function (item) {
                    if (item.id == null) {
                        return true;
                    }
                    if (item.stageTypeId == stageTypesEnum.StartProfile && item.notificationTemplateTypeId == templateTypeEnum.MilestoneCompleteNotification && item.evaluationRoleId == evaluationRolesEnum.participant) {
                        return true;
                    }
                    else {
                        return false;
                    }
                }
                $scope.FinalScoreManagerStartStageCompleteTemplates = function (item) {
                    if (item.id == null) {
                        return true;
                    }
                    if (item.stageTypeId == stageTypesEnum.StartProfile && item.notificationTemplateTypeId == templateTypeEnum.MilestoneCompleteNotification && item.evaluationRoleId == evaluationRolesEnum.evaluator) {
                        return true;
                    }
                    else {
                        return false;
                    }
                }
                $scope.ManagerStartStageCompleteTemplates = function (item) {
                    if (item.id == null) {
                        return true;
                    }
                    if (item.stageTypeId == stageTypesEnum.StartProfile && item.notificationTemplateTypeId == templateTypeEnum.MilestoneCompleteNotification && item.evaluationRoleId == evaluationRolesEnum.manager) {
                        return true;
                    }
                    else {
                        return false;
                    }
                }
                $scope.TrainerStartStageCompleteTemplates = function (item) {
                    if (item.id == null) {
                        return true;
                    }
                    if (item.stageTypeId == stageTypesEnum.StartProfile && item.notificationTemplateTypeId == templateTypeEnum.MilestoneCompleteNotification && item.evaluationRoleId == evaluationRolesEnum.trainer) {
                        return true;
                    }
                    else {
                        return false;
                    }
                }
                $scope.ProjectManagerStartStageCompleteTemplates = function (item) {
                    if (item.id == null) {
                        return true;
                    }
                    if (item.stageTypeId == stageTypesEnum.StartProfile && item.notificationTemplateTypeId == templateTypeEnum.MilestoneCompleteNotification && item.evaluationRoleId == evaluationRolesEnum.manager) {
                        return true;
                    }
                    else {
                        return false;
                    }
                }

                $scope.EvaluatorStartStageResultTemplates = function (item) {
                    if (item.id == null) {
                        return true;
                    }
                    if (item.stageTypeId == stageTypesEnum.StartProfile && item.notificationTemplateTypeId == templateTypeEnum.MilestoneResultNotification && item.evaluationRoleId == evaluationRolesEnum.evaluator) {
                        return true;
                    }
                    else {
                        return false;
                    }
                }
                $scope.ParticipantStartStageResultTemplates = function (item) {
                    if (item.id == null) {
                        return true;
                    }
                    if (item.stageTypeId == stageTypesEnum.StartProfile && item.notificationTemplateTypeId == templateTypeEnum.MilestoneResultNotification && item.evaluationRoleId == evaluationRolesEnum.participant) {
                        return true;
                    }
                    else {
                        return false;
                    }
                }
                $scope.FinalScoreManagerStartStageResultTemplates = function (item) {
                    if (item.id == null) {
                        return true;
                    }
                    if (item.stageTypeId == stageTypesEnum.StartProfile && item.notificationTemplateTypeId == templateTypeEnum.MilestoneResultNotification && item.evaluationRoleId == evaluationRolesEnum.evaluator) {
                        return true;
                    }
                    else {
                        return false;
                    }
                }
                $scope.ManagerStartStageResultTemplates = function (item) {
                    if (item.id == null) {
                        return true;
                    }
                    if (item.stageTypeId == stageTypesEnum.StartProfile && item.notificationTemplateTypeId == templateTypeEnum.MilestoneResultNotification && item.evaluationRoleId == evaluationRolesEnum.manager) {
                        return true;
                    }
                    else {
                        return false;
                    }
                }
                $scope.TrainerStartStageResultTemplates = function (item) {
                    if (item.id == null) {
                        return true;
                    }
                    if (item.stageTypeId == stageTypesEnum.StartProfile && item.notificationTemplateTypeId == templateTypeEnum.MilestoneResultNotification && item.evaluationRoleId == evaluationRolesEnum.trainer) {
                        return true;
                    }
                    else {
                        return false;
                    }
                }
                $scope.ProjectManagerStartStageResultTemplates = function (item) {
                    if (item.id == null) {
                        return true;
                    }
                    if (item.stageTypeId == stageTypesEnum.StartProfile && item.notificationTemplateTypeId == templateTypeEnum.MilestoneResultNotification && item.evaluationRoleId == evaluationRolesEnum.manager) {
                        return true;
                    }
                    else {
                        return false;
                    }
                }


                $scope.StartStageGreenAlarmEvaluatorTemplates = function (item) {
                    if (item.id == null) {
                        return true;
                    }
                    if (item.stageTypeId == stageTypesEnum.StartProfile && item.notificationTemplateTypeId == templateTypeEnum.GreenMilestoneAlarm && item.evaluationRoleId == evaluationRolesEnum.evaluator) {
                        return true;
                    }
                    else {
                        return false;
                    }
                }
                $scope.StartStageGreenAlarmParticipantTemplates = function (item) {
                    if (item.id == null) {
                        return true;
                    }
                    if (item.stageTypeId == stageTypesEnum.StartProfile && item.notificationTemplateTypeId == templateTypeEnum.GreenMilestoneAlarm && item.evaluationRoleId == evaluationRolesEnum.participant) {
                        return true;
                    }
                    else {
                        return false;
                    }
                }
                $scope.StartStageGreenAlarmFinalScoreManagerTemplates = function (item) {
                    if (item.id == null) {
                        return true;
                    }
                    if (item.stageTypeId == stageTypesEnum.StartProfile && item.notificationTemplateTypeId == templateTypeEnum.GreenMilestoneAlarm && item.evaluationRoleId == evaluationRolesEnum.evaluator) {
                        return true;
                    }
                    else {
                        return false;
                    }
                }
                $scope.StartStageGreenAlarmManagerTemplates = function (item) {
                    if (item.id == null) {
                        return true;
                    }
                    if (item.stageTypeId == stageTypesEnum.StartProfile && item.notificationTemplateTypeId == templateTypeEnum.GreenMilestoneAlarm && item.evaluationRoleId == evaluationRolesEnum.manager) {
                        return true;
                    }
                    else {
                        return false;
                    }
                }
                $scope.StartStageGreenAlarmTrainerTemplates = function (item) {
                    if (item.id == null) {
                        return true;
                    }
                    if (item.stageTypeId == stageTypesEnum.StartProfile && item.notificationTemplateTypeId == templateTypeEnum.GreenMilestoneAlarm && item.evaluationRoleId == evaluationRolesEnum.trainer) {
                        return true;
                    }
                    else {
                        return false;
                    }
                }
                $scope.StartStageGreenAlarmProjectManagerTemplates = function (item) {
                    if (item.id == null) {
                        return true;
                    }
                    if (item.stageTypeId == stageTypesEnum.StartProfile && item.notificationTemplateTypeId == templateTypeEnum.GreenMilestoneAlarm && item.evaluationRoleId == evaluationRolesEnum.manager) {
                        return true;
                    }
                    else {
                        return false;
                    }
                }


                $scope.StartStageYellowAlarmEvaluatorTemplates = function (item) {
                    if (item.id == null) {
                        return true;
                    }
                    if (item.stageTypeId == stageTypesEnum.StartProfile && item.notificationTemplateTypeId == templateTypeEnum.YellowMilestoneAlarm && item.evaluationRoleId == evaluationRolesEnum.evaluator) {
                        return true;
                    }
                    else {
                        return false;
                    }
                }
                $scope.StartStageYellowAlarmParticipantTemplates = function (item) {
                    if (item.id == null) {
                        return true;
                    }
                    if (item.stageTypeId == stageTypesEnum.StartProfile && item.notificationTemplateTypeId == templateTypeEnum.YellowMilestoneAlarm && item.evaluationRoleId == evaluationRolesEnum.participant) {
                        return true;
                    }
                    else {
                        return false;
                    }
                }
                $scope.StartStageYellowAlarmManagerTemplates = function (item) {
                    if (item.id == null) {
                        return true;
                    }
                    if (item.stageTypeId == stageTypesEnum.StartProfile && item.notificationTemplateTypeId == templateTypeEnum.YellowMilestoneAlarm && item.evaluationRoleId == evaluationRolesEnum.manager) {
                        return true;
                    }
                    else {
                        return false;
                    }
                }
                $scope.StartStageYellowAlarmFinalScoreManagerTemplates = function (item) {
                    if (item.id == null) {
                        return true;
                    }
                    if (item.stageTypeId == stageTypesEnum.StartProfile && item.notificationTemplateTypeId == templateTypeEnum.YellowMilestoneAlarm && item.evaluationRoleId == evaluationRolesEnum.evaluator) {
                        return true;
                    }
                    else {
                        return false;
                    }
                }
                $scope.StartStageYellowAlarmTrainerTemplates = function (item) {
                    if (item.id == null) {
                        return true;
                    }
                    if (item.stageTypeId == stageTypesEnum.StartProfile && item.notificationTemplateTypeId == templateTypeEnum.YellowMilestoneAlarm && item.evaluationRoleId == evaluationRolesEnum.trainer) {
                        return true;
                    }
                    else {
                        return false;
                    }
                }
                $scope.StartStageYellowAlarmProjectManagerTemplates = function (item) {
                    if (item.id == null) {
                        return true;
                    }
                    if (item.stageTypeId == stageTypesEnum.StartProfile && item.notificationTemplateTypeId == templateTypeEnum.YellowMilestoneAlarm && item.evaluationRoleId == evaluationRolesEnum.manager) {
                        return true;
                    }
                    else {
                        return false;
                    }
                }


                $scope.StartStageRedAlarmEvaluatorTemplates = function (item) {
                    if (item.id == null) {
                        return true;
                    }
                    if (item.stageTypeId == stageTypesEnum.StartProfile && item.notificationTemplateTypeId == templateTypeEnum.RedMilestoneAlarm && item.evaluationRoleId == evaluationRolesEnum.evaluator) {
                        return true;
                    }
                    else {
                        return false;
                    }
                }
                $scope.StartStageRedAlarmParticipantTemplates = function (item) {
                    if (item.id == null) {
                        return true;
                    }
                    if (item.stageTypeId == stageTypesEnum.StartProfile && item.notificationTemplateTypeId == templateTypeEnum.RedMilestoneAlarm && item.evaluationRoleId == evaluationRolesEnum.participant) {
                        return true;
                    }
                    else {
                        return false;
                    }
                }
                $scope.StartStageRedAlarmManagerTemplates = function (item) {
                    if (item.id == null) {
                        return true;
                    }
                    if (item.stageTypeId == stageTypesEnum.StartProfile && item.notificationTemplateTypeId == templateTypeEnum.RedMilestoneAlarm && item.evaluationRoleId == evaluationRolesEnum.manager) {
                        return true;
                    }
                    else {
                        return false;
                    }
                }
                $scope.StartStageRedAlarmFinalScoreManagerTemplates = function (item) {
                    if (item.id == null) {
                        return true;
                    }
                    if (item.stageTypeId == stageTypesEnum.StartProfile && item.notificationTemplateTypeId == templateTypeEnum.RedMilestoneAlarm && item.evaluationRoleId == evaluationRolesEnum.evaluator) {
                        return true;
                    }
                    else {
                        return false;
                    }
                }
                $scope.StartStageRedAlarmTrainerTemplates = function (item) {
                    if (item.id == null) {
                        return true;
                    }
                    if (item.stageTypeId == stageTypesEnum.StartProfile && item.notificationTemplateTypeId == templateTypeEnum.RedMilestoneAlarm && item.evaluationRoleId == evaluationRolesEnum.trainer) {
                        return true;
                    }
                    else {
                        return false;
                    }
                }
                $scope.StartStageRedAlarmProjectManagerTemplates = function (item) {
                    if (item.id == null) {
                        return true;
                    }
                    if (item.stageTypeId == stageTypesEnum.StartProfile && item.notificationTemplateTypeId == templateTypeEnum.RedMilestoneAlarm && item.evaluationRoleId == evaluationRolesEnum.manager) {
                        return true;
                    }
                    else {
                        return false;
                    }
                }


                $scope.EvaluatorMilestoneStartTemplates = function (item) {
                    if (item.id == null) {
                        return true;
                    }
                    if (item.stageTypeId == stageTypesEnum.Milestone && item.notificationTemplateTypeId == templateTypeEnum.MilestoneStartNotification && item.evaluationRoleId == evaluationRolesEnum.evaluator) {
                        return true;
                    }
                    else {
                        return false;
                    }
                }
                $scope.ParticipantMilestoneStartTemplates = function (item) {
                    if (item.id == null) {
                        return true;
                    }
                    if (item.stageTypeId == stageTypesEnum.Milestone && item.notificationTemplateTypeId == templateTypeEnum.MilestoneStartNotification && item.evaluationRoleId == evaluationRolesEnum.participant) {
                        return true;
                    }
                    else {
                        return false;
                    }
                }
                $scope.FinalScoreManagerMilestoneStartTemplates = function (item) {
                    if (item.id == null) {
                        return true;
                    }
                    if (item.stageTypeId == stageTypesEnum.Milestone && item.notificationTemplateTypeId == templateTypeEnum.MilestoneStartNotification && item.evaluationRoleId == evaluationRolesEnum.evaluator) {
                        return true;
                    }
                    else {
                        return false;
                    }
                }
                $scope.ManagerMilestoneStartTemplates = function (item) {
                    if (item.id == null) {
                        return true;
                    }
                    if (item.stageTypeId == stageTypesEnum.Milestone && item.notificationTemplateTypeId == templateTypeEnum.MilestoneStartNotification && item.evaluationRoleId == evaluationRolesEnum.manager) {
                        return true;
                    }
                    else {
                        return false;
                    }
                }
                $scope.TrainerMilestoneStartTemplates = function (item) {
                    if (item.id == null) {
                        return true;
                    }
                    if (item.stageTypeId == stageTypesEnum.Milestone && item.notificationTemplateTypeId == templateTypeEnum.MilestoneStartNotification && item.evaluationRoleId == evaluationRolesEnum.trainer) {
                        return true;
                    }
                    else {
                        return false;
                    }
                }
                $scope.ProjectManagerMilestoneStartTemplates = function (item) {
                    if (item.id == null) {
                        return true;
                    }
                    if (item.stageTypeId == stageTypesEnum.Milestone && item.notificationTemplateTypeId == templateTypeEnum.MilestoneStartNotification && item.evaluationRoleId == evaluationRolesEnum.manager) {
                        return true;
                    }
                    else {
                        return false;
                    }
                }

                $scope.EvaluatorMilestoneCompleteTemplates = function (item) {
                    if (item.id == null) {
                        return true;
                    }
                    if (item.stageTypeId == stageTypesEnum.Milestone && item.notificationTemplateTypeId == templateTypeEnum.MilestoneCompleteNotification && item.evaluationRoleId == evaluationRolesEnum.evaluator) {
                        return true;
                    }
                    else {
                        return false;
                    }
                }
                $scope.ParticipantMilestoneCompleteTemplates = function (item) {
                    if (item.id == null) {
                        return true;
                    }
                    if (item.stageTypeId == stageTypesEnum.Milestone && item.notificationTemplateTypeId == templateTypeEnum.MilestoneCompleteNotification && item.evaluationRoleId == evaluationRolesEnum.participant) {
                        return true;
                    }
                    else {
                        return false;
                    }
                }
                $scope.FinalScoreManagerMilestoneCompleteTemplates = function (item) {
                    if (item.id == null) {
                        return true;
                    }
                    if (item.stageTypeId == stageTypesEnum.Milestone && item.notificationTemplateTypeId == templateTypeEnum.MilestoneCompleteNotification && item.evaluationRoleId == evaluationRolesEnum.evaluator) {
                        return true;
                    }
                    else {
                        return false;
                    }
                }
                $scope.ManagerMilestoneCompleteTemplates = function (item) {
                    if (item.id == null) {
                        return true;
                    }
                    if (item.stageTypeId == stageTypesEnum.Milestone && item.notificationTemplateTypeId == templateTypeEnum.MilestoneCompleteNotification && item.evaluationRoleId == evaluationRolesEnum.manager) {
                        return true;
                    }
                    else {
                        return false;
                    }
                }
                $scope.TrainerMilestoneCompleteTemplates = function (item) {
                    if (item.id == null) {
                        return true;
                    }
                    if (item.stageTypeId == stageTypesEnum.Milestone && item.notificationTemplateTypeId == templateTypeEnum.MilestoneCompleteNotification && item.evaluationRoleId == evaluationRolesEnum.trainer) {
                        return true;
                    }
                    else {
                        return false;
                    }
                }
                $scope.ProjectManagerMilestoneCompleteTemplates = function (item) {
                    if (item.id == null) {
                        return true;
                    }
                    if (item.stageTypeId == stageTypesEnum.Milestone && item.notificationTemplateTypeId == templateTypeEnum.MilestoneCompleteNotification && item.evaluationRoleId == evaluationRolesEnum.manager) {
                        return true;
                    }
                    else {
                        return false;
                    }
                }

                $scope.EvaluatorMilestoneResultTemplates = function (item) {
                    if (item.id == null) {
                        return true;
                    }
                    if (item.stageTypeId == stageTypesEnum.Milestone && item.notificationTemplateTypeId == templateTypeEnum.MilestoneResultNotification && item.evaluationRoleId == evaluationRolesEnum.evaluator) {
                        return true;
                    }
                    else {
                        return false;
                    }
                }
                $scope.ParticipantMilestoneResultTemplates = function (item) {
                    if (item.id == null) {
                        return true;
                    }
                    if (item.stageTypeId == stageTypesEnum.Milestone && item.notificationTemplateTypeId == templateTypeEnum.MilestoneResultNotification && item.evaluationRoleId == evaluationRolesEnum.participant) {
                        return true;
                    }
                    else {
                        return false;
                    }
                }
                $scope.FinalScoreManagerMilestoneResultTemplates = function (item) {
                    if (item.id == null) {
                        return true;
                    }
                    if (item.stageTypeId == stageTypesEnum.Milestone && item.notificationTemplateTypeId == templateTypeEnum.MilestoneResultNotification && item.evaluationRoleId == evaluationRolesEnum.evaluator) {
                        return true;
                    }
                    else {
                        return false;
                    }
                }
                $scope.ManagerMilestoneResultTemplates = function (item) {
                    if (item.id == null) {
                        return true;
                    }
                    if (item.stageTypeId == stageTypesEnum.Milestone && item.notificationTemplateTypeId == templateTypeEnum.MilestoneResultNotification && item.evaluationRoleId == evaluationRolesEnum.manager) {
                        return true;
                    }
                    else {
                        return false;
                    }
                }
                $scope.TrainerMilestoneResultTemplates = function (item) {
                    if (item.id == null) {
                        return true;
                    }
                    if (item.stageTypeId == stageTypesEnum.Milestone && item.notificationTemplateTypeId == templateTypeEnum.MilestoneResultNotification && item.evaluationRoleId == evaluationRolesEnum.trainer) {
                        return true;
                    }
                    else {
                        return false;
                    }
                }
                $scope.ProjectManagerMilestoneResultTemplates = function (item) {
                    if (item.id == null) {
                        return true;
                    }
                    if (item.stageTypeId == stageTypesEnum.Milestone && item.notificationTemplateTypeId == templateTypeEnum.MilestoneResultNotification && item.evaluationRoleId == evaluationRolesEnum.manager) {
                        return true;
                    }
                    else {
                        return false;
                    }
                }

                $scope.MilestoneGreenAlarmEvaluatorTemplates = function (item) {
                    if (item.id == null) {
                        return true;
                    }
                    if (item.stageTypeId == stageTypesEnum.Milestone && item.notificationTemplateTypeId == templateTypeEnum.GreenMilestoneAlarm && item.evaluationRoleId == evaluationRolesEnum.evaluator) {
                        return true;
                    }
                    else {
                        return false;
                    }
                }
                $scope.MilestoneGreenAlarmParticipantTemplates = function (item) {
                    if (item.id == null) {
                        return true;
                    }
                    if (item.stageTypeId == stageTypesEnum.Milestone && item.notificationTemplateTypeId == templateTypeEnum.GreenMilestoneAlarm && item.evaluationRoleId == evaluationRolesEnum.participant) {
                        return true;
                    }
                    else {
                        return false;
                    }
                }
                $scope.MilestoneGreenAlarmFinalScoreManagerTemplates = function (item) {
                    if (item.id == null) {
                        return true;
                    }
                    if (item.stageTypeId == stageTypesEnum.Milestone && item.notificationTemplateTypeId == templateTypeEnum.GreenMilestoneAlarm && item.evaluationRoleId == evaluationRolesEnum.evaluator) {
                        return true;
                    }
                    else {
                        return false;
                    }
                }
                $scope.MilestoneGreenAlarmManagerTemplates = function (item) {
                    if (item.id == null) {
                        return true;
                    }
                    if (item.stageTypeId == stageTypesEnum.Milestone && item.notificationTemplateTypeId == templateTypeEnum.GreenMilestoneAlarm && item.evaluationRoleId == evaluationRolesEnum.manager) {
                        return true;
                    }
                    else {
                        return false;
                    }
                }
                $scope.MilestoneGreenAlarmTrainerTemplates = function (item) {
                    if (item.id == null) {
                        return true;
                    }
                    if (item.stageTypeId == stageTypesEnum.Milestone && item.notificationTemplateTypeId == templateTypeEnum.GreenMilestoneAlarm && item.evaluationRoleId == evaluationRolesEnum.trainer) {
                        return true;
                    }
                    else {
                        return false;
                    }
                }
                $scope.MilestoneGreenAlarmProjectManagerTemplates = function (item) {
                    if (item.id == null) {
                        return true;
                    }
                    if (item.stageTypeId == stageTypesEnum.Milestone && item.notificationTemplateTypeId == templateTypeEnum.GreenMilestoneAlarm && item.evaluationRoleId == evaluationRolesEnum.manager) {
                        return true;
                    }
                    else {
                        return false;
                    }
                }


                $scope.MilestoneYellowAlarmEvaluatorTemplates = function (item) {
                    if (item.id == null) {
                        return true;
                    }
                    if (item.stageTypeId == stageTypesEnum.Milestone && item.notificationTemplateTypeId == templateTypeEnum.YellowMilestoneAlarm && item.evaluationRoleId == evaluationRolesEnum.evaluator) {
                        return true;
                    }
                    else {
                        return false;
                    }
                }
                $scope.MilestoneYellowAlarmParticipantTemplates = function (item) {
                    if (item.id == null) {
                        return true;
                    }
                    if (item.stageTypeId == stageTypesEnum.Milestone && item.notificationTemplateTypeId == templateTypeEnum.YellowMilestoneAlarm && item.evaluationRoleId == evaluationRolesEnum.participant) {
                        return true;
                    }
                    else {
                        return false;
                    }
                }
                $scope.MilestoneYellowAlarmManagerTemplates = function (item) {
                    if (item.id == null) {
                        return true;
                    }
                    if (item.stageTypeId == stageTypesEnum.Milestone && item.notificationTemplateTypeId == templateTypeEnum.YellowMilestoneAlarm && item.evaluationRoleId == evaluationRolesEnum.manager) {
                        return true;
                    }
                    else {
                        return false;
                    }
                }
                $scope.MilestoneYellowAlarmFinalScoreManagerTemplates = function (item) {
                    if (item.id == null) {
                        return true;
                    }
                    if (item.stageTypeId == stageTypesEnum.Milestone && item.notificationTemplateTypeId == templateTypeEnum.YellowMilestoneAlarm && item.evaluationRoleId == evaluationRolesEnum.evaluator) {
                        return true;
                    }
                    else {
                        return false;
                    }
                }
                $scope.MilestoneYellowAlarmTrainerTemplates = function (item) {
                    if (item.id == null) {
                        return true;
                    }
                    if (item.stageTypeId == stageTypesEnum.Milestone && item.notificationTemplateTypeId == templateTypeEnum.YellowMilestoneAlarm && item.evaluationRoleId == evaluationRolesEnum.trainer) {
                        return true;
                    }
                    else {
                        return false;
                    }
                }
                $scope.MilestoneYellowAlarmProjectManagerTemplates = function (item) {
                    if (item.id == null) {
                        return true;
                    }
                    if (item.stageTypeId == stageTypesEnum.Milestone && item.notificationTemplateTypeId == templateTypeEnum.YellowMilestoneAlarm && item.evaluationRoleId == evaluationRolesEnum.manager) {
                        return true;
                    }
                    else {
                        return false;
                    }
                }

                $scope.MilestoneRedAlarmEvaluatorTemplates = function (item) {
                    if (item.id == null) {
                        return true;
                    }
                    if (item.stageTypeId == stageTypesEnum.Milestone && item.notificationTemplateTypeId == templateTypeEnum.RedMilestoneAlarm && item.evaluationRoleId == evaluationRolesEnum.evaluator) {
                        return true;
                    }
                    else {
                        return false;
                    }
                }
                $scope.MilestoneRedAlarmParticipantTemplates = function (item) {
                    if (item.id == null) {
                        return true;
                    }
                    if (item.stageTypeId == stageTypesEnum.Milestone && item.notificationTemplateTypeId == templateTypeEnum.RedMilestoneAlarm && item.evaluationRoleId == evaluationRolesEnum.participant) {
                        return true;
                    }
                    else {
                        return false;
                    }
                }
                $scope.MilestoneRedAlarmManagerTemplates = function (item) {
                    if (item.id == null) {
                        return true;
                    }
                    if (item.stageTypeId == stageTypesEnum.Milestone && item.notificationTemplateTypeId == templateTypeEnum.RedMilestoneAlarm && item.evaluationRoleId == evaluationRolesEnum.manager) {
                        return true;
                    }
                    else {
                        return false;
                    }
                }
                $scope.MilestoneRedAlarmFinalScoreManagerTemplates = function (item) {
                    if (item.id == null) {
                        return true;
                    }
                    if (item.stageTypeId == stageTypesEnum.Milestone && item.notificationTemplateTypeId == templateTypeEnum.RedMilestoneAlarm && item.evaluationRoleId == evaluationRolesEnum.evaluator) {
                        return true;
                    }
                    else {
                        return false;
                    }
                }
                $scope.MilestoneRedAlarmTrainerTemplates = function (item) {
                    if (item.id == null) {
                        return true;
                    }
                    if (item.stageTypeId == stageTypesEnum.Milestone && item.notificationTemplateTypeId == templateTypeEnum.RedMilestoneAlarm && item.evaluationRoleId == evaluationRolesEnum.trainer) {
                        return true;
                    }
                    else {
                        return false;
                    }
                }
                $scope.MilestoneRedAlarmProjectManagerTemplates = function (item) {
                    if (item.id == null) {
                        return true;
                    }
                    if (item.stageTypeId == stageTypesEnum.Milestone && item.notificationTemplateTypeId == templateTypeEnum.RedMilestoneAlarm && item.evaluationRoleId == evaluationRolesEnum.manager) {
                        return true;
                    }
                    else {
                        return false;
                    }
                }

                $scope.isAllowToPause = function () {
                    var result = true;
                    if ($scope.isStageLocked() || $scope.ngModel.isStopped) {
                        result = false;
                    }
                    else if ($scope.isStageInUse()) {
                        if ($scope.stageGroupEvaluation) {
                            var stageEvaluation = _.find($scope.stageGroupEvaluation, function (item) {
                                return item.stageId == $scope.ngModel.id;
                            });
                            if (stageEvaluation) {
                                if (stageEvaluation.iskpiSet || stageEvaluation.isrctAdded) {
                                    result = false;
                                }
                            }
                        }
                    }
                    else {
                        if ($scope.stageGroupEvaluation) {
                            var stageEvaluation = _.find($scope.stageGroupEvaluation, function (item) {
                                return item.stageId == $scope.ngModel.id;
                            });
                            if (stageEvaluation) {
                                if (stageEvaluation.iskpiSet || stageEvaluation.isrctAdded) {
                                    result = false;
                                }
                            }
                        }
                    }
                    return result;
                }
                $scope.isAllowToStop = function () {
                    var result = true;
                    if ($scope.isStageLocked() || $scope.ngModel.isPaused) {
                        result = false;
                    }
                    else if ($scope.isStageInUse()) {
                        if ($scope.stageGroupEvaluation) {
                            var stageEvaluation = _.find($scope.stageGroupEvaluation, function (item) {
                                return item.stageId == $scope.ngModel.id;
                            });
                            if (stageEvaluation) {
                                if (stageEvaluation.iskpiSet || stageEvaluation.isrctAdded) {
                                    result = false;
                                }
                            }
                        }
                    }
                    else {
                        if ($scope.stageGroupEvaluation) {
                            var stageEvaluation = _.find($scope.stageGroupEvaluation, function (item) {
                                return item.stageId == $scope.ngModel.id;
                            });
                            if (stageEvaluation) {
                                if (stageEvaluation.iskpiSet || stageEvaluation.isrctAdded) {
                                    result = false;
                                }
                            }
                        }
                    }
                    return result;
                }
                $scope.isAllowToExtend = function () {
                    var result = true;
                    if ($scope.isStageLocked() || $scope.ngModel.isPaused || $scope.ngModel.isStopped) {
                        result = false;
                    }
                    else if ($scope.isStageInUse()) {
                        if ($scope.stageGroupEvaluation) {
                            var stageEvaluation = _.find($scope.stageGroupEvaluation, function (item) {
                                return item.stageId == $scope.ngModel.id;
                            });
                            if (stageEvaluation) {
                                if (stageEvaluation.iskpiSet) {
                                    result = false;
                                }
                            }
                        }
                    }
                    else {
                        if ($scope.stageGroupEvaluation) {
                            var stageEvaluation = _.find($scope.stageGroupEvaluation, function (item) {
                                return item.stageId == $scope.ngModel.id;
                            });
                            if (stageEvaluation) {
                                if (stageEvaluation.iskpiSet) {
                                    result = false;
                                }
                            }
                        }
                    }
                    return result;
                }

                $scope.$watch('stage', function (newValue, oldValue) {
                    if (oldValue && newValue) {
                        if (oldValue.id == newValue.id) {
                            if (oldValue != newValue) {
                                if (!(newValue.isChanged == false && oldValue.isChanged == true)) {
                                    $scope.stage.isChanged = true;
                                }
                            }
                        }
                    }
                }, true);

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

app.directive('ngStageNew', ['apiService', function (apiService, $compile) {
    return {
        restrict: 'EA',
        require: '^ngModel',
        templateUrl: 'views/profiles/stageGroups/directives/ngStage/ngStageNew.html',
        scope: {
            ngModel: '=',
            ngNotificationTemplates: '=',
            ngUsers: '=',
            stageInfo: '=',
            currentStage: '=',
            statusOfStages: '=',
            profileTypeId: '='
        },
        replace: true,
        controller: ['$scope', 'apiService', 'dialogService', '$stateParams', '$element', 'dialogService', '$location', '$state',
            'notificationManager', '$parse', '$modal', 'datetimeCalculator', 'profilesTypesEnum', '$translate',
            function ($scope, apiService, dialogService, $stateParams, $element, dialogService, $location, $state,
                notificationManager, $parse, $modal, datetimeCalculator, profilesTypesEnum, $translate) {

                $scope.notificationTemplates = $scope.ngNotificationTemplates;
                $scope.notificationTemplates.splice(1, 0, {
                    id: -1,
                    name: "Choose From List",
                    culture: { cultureName: null }
                })
                $scope.profilesTypesEnum = profilesTypesEnum;
                $scope.users = $scope.ngUsers;
                $scope.selectedNotification;
                $scope.isStageLocked = function () {
                    var isStageLocked = false;
                    for (var i = 0; i < $scope.statusOfStages.length; i++) {
                        if ($scope.ngModel.id == $scope.statusOfStages[i].stageId) {
                            isStageLocked = $scope.statusOfStages[i].isLocked;
                            break;
                        }
                    }
                    return isStageLocked;
                }

                $scope.isStageInUse = function () {
                    var isStageInUse = false;
                    for (var i = 0; i < $scope.statusOfStages.length; i++) {
                        if ($scope.ngModel.id == $scope.statusOfStages[i].stageId) {
                            isStageInUse = $scope.statusOfStages[i].isInUse;
                            break;
                        }
                    }
                    return isStageInUse;
                }

                $scope.notificationTemplatesOptions = {
                    dataSource: {
                        type: "json",
                        transport: {
                            read: function (options) {
                                notificationManager.getNotifications().then(function (data) {
                                    var object = [];
                                    var organization_obj = [data.length];
                                    for (var i = 0, len = data.length; i < len; i++) {
                                        organization_obj[i] = {
                                            id: data[i].id,
                                            name: data[i].name,
                                            culture: (data[i].culture) ? data[i].culture.cultureName : '',
                                            email: (data[i].emailBody) ? true : false,
                                            sms: (data[i].smsMessage) ? true : false,
                                            evaluationRoleId: data[i].evaluationRoleId,
                                        };
                                    }
                                    object['data'] = organization_obj;
                                    options.success(object);
                                })
                            }
                        },
                        sort: {
                            field: "name",
                            dir: "asc"
                        },
                        pageSize: 10,
                        schema: {
                            data: 'data',
                            total: 'data.length',
                            model: {
                                id: "id",
                                fields: {
                                    id: { type: "number" },
                                    name: { type: "string" },
                                    evaluationRoleId: { type: "number" },
                                }
                            }
                        }
                    },
                    pageable: true,
                    selectable: true,
                    sortable: true,
                    filterable: {
                        mode: 'row'
                    },
                    columns: [
                        { field: "name", width: 350, title: $translate.instant('COMMON_NAME') },
                        { field: "culture", width: 350, title: $translate.instant('COMMON_CULTURE') },
                        { field: "evaluationRoleId", width: 350, title: $translate.instant('COMMON_ROLE'), values: $scope.evaluationRoles },
                        { field: "email", title: $translate.instant('COMMON_EMAIL'), width: 100, filterable: false, template: '<input type="checkbox" #= email ? checked="checked" : "" # disabled="disabled" />' },
                        { field: "sms", title: $translate.instant('COMMON_SMS'), filterable: false, template: '<input type="checkbox" #= sms ? checked="checked" : "" # disabled="disabled" />' },
                    ]
                }

                $scope.private = {
                    getById: function (id, myArray) {
                        if (myArray.filter) {
                            return myArray.filter(function (obj) {
                                if (obj.id == id) {
                                    return obj
                                }
                            })[0]
                        }
                        return undefined;
                    },
                }

                $scope.back = function () {
                    $state.go('^');
                }

                $scope.init = function (value) {
                    value.startDateTime = moment(kendo.parseDate(value.startDateTime)).format("L LT");
                    value.endDateTime = moment(kendo.parseDate(value.endDateTime)).format("L LT");
                    value.evaluationStartDate = moment(kendo.parseDate(value.evaluationStartDate)).format("L LT");
                    value.evaluationEndDate = moment(kendo.parseDate(value.evaluationEndDate)).format("L LT");
                    $scope.stage = value;
                }

                $scope.goToNotificationTemplate = function (id) {
                    if (id) {
                        var template = _.find($scope.notificationTemplates, function (item) {
                            return item.id == id;
                        });
                        if (template) {
                            $location.path("/home/notificationTemplates/" + template.organizationId + "/edit/" + id);
                        }
                    }
                }

                $scope.checkChoseFromList = function (id, modelName, previous) {

                    if (id == -1) {
                        var previousItem = (previous) ? parseInt(previous) : null;
                        var modalInstance = $modal.open({
                            animation: $scope.animationsEnabled,
                            templateUrl: 'views/profiles/stageGroups/views/notificationModal.html',
                            controller: 'NotificationModalCtrl',
                            controllerAs: 'modal',
                            size: 'lg',
                            resolve: {
                                previousItem: function () {
                                    return previousItem;
                                }
                            }
                        });

                        modalInstance.result.then(function (selectedItem) {
                            setNotificationModel(modelName, selectedItem);
                        });
                    }
                }

                $scope.toggleAnimation = function () {
                    $scope.animationsEnabled = !$scope.animationsEnabled;
                };

                function setNotificationModel(modelName, newValue) {
                    switch (modelName) {
                        case 'stage.externalStartNotificationTemplateId':
                            $scope.stage.externalStartNotificationTemplateId = newValue;
                            break;
                        case 'stage.externalCompletedNotificationTemplateId':
                            $scope.stage.externalCompletedNotificationTemplateId = newValue;
                            break;
                        case 'stage.externalResultsNotificationTemplateId':
                            $scope.stage.externalResultsNotificationTemplateId = newValue;
                            break;
                        case 'stage.evaluatorStartNotificationTemplateId':
                            $scope.stage.evaluatorStartNotificationTemplateId = newValue;
                            break;
                        case 'stage.evaluatorCompletedNotificationTemplateId':
                            $scope.stage.evaluatorCompletedNotificationTemplateId = newValue;
                            break;
                        case 'stage.evaluatorResultsNotificationTemplateId':
                            $scope.stage.evaluatorResultsNotificationTemplateId = newValue;
                            break;
                        case 'stage.trainerStartNotificationTemplateId':
                            $scope.stage.trainerStartNotificationTemplateId = newValue;
                            break;
                        case 'stage.trainerCompletedNotificationTemplateId':
                            $scope.stage.trainerCompletedNotificationTemplateId = newValue;
                            break;
                        case 'stage.trainerResultsNotificationTemplateId':
                            $scope.stage.trainerResultsNotificationTemplateId = newValue;
                            break;
                        case 'stage.managerStartNotificationTemplateId':
                            $scope.stage.managerStartNotificationTemplateId = newValue;
                            break;
                        case 'stage.managerCompletedNotificationTemplateId':
                            $scope.stage.managerCompletedNotificationTemplateId = newValue;
                            break;
                        case 'stage.managerResultsNotificationTemplateId':
                            $scope.stage.managerResultsNotificationTemplateId = newValue;
                            break;
                        case 'stage.greenAlarmParticipantTemplateId':
                            $scope.stage.greenAlarmParticipantTemplateId = newValue;
                            break;
                        case 'stage.yellowAlarmParticipantTemplateId':
                            $scope.stage.yellowAlarmParticipantTemplateId = newValue;
                            break;
                        case 'stage.redAlarmParticipantTemplateId':
                            $scope.stage.redAlarmParticipantTemplateId = newValue;
                            break;
                        case 'stage.greenAlarmEvaluatorTemplateId':
                            $scope.stage.greenAlarmEvaluatorTemplateId = newValue;
                            break;
                        case 'stage.yellowAlarmEvaluatorTemplateId':
                            $scope.stage.yellowAlarmEvaluatorTemplateId = newValue;
                            break;
                        case 'stage.redAlarmEvaluatorTemplateId':
                            $scope.stage.redAlarmEvaluatorTemplateId = newValue;
                            break;
                        case 'stage.greenAlarmManagerTemplateId':
                            $scope.stage.greenAlarmManagerTemplateId = newValue;
                            break;
                        case 'stage.yellowAlarmManagerTemplateId':
                            $scope.stage.yellowAlarmManagerTemplateId = newValue;
                            break;
                        case 'stage.redAlarmManagerTemplateId':
                            $scope.stage.redAlarmManagerTemplateId = newValue;
                            break;
                        case 'stage.greenAlarmTrainerTemplateId':
                            $scope.stage.greenAlarmTrainerTemplateId = newValue;
                            break;
                        case 'stage.yellowAlarmTrainerTemplateId':
                            $scope.stage.yellowAlarmTrainerTemplateId = newValue;
                            break;
                        case 'stage.redAlarmTrainerTemplateId':
                            $scope.stage.redAlarmTrainerTemplateId = newValue;
                            break;
                    }
                }

                $scope.goToNotificationTemplatesBank = function () {
                    console.log("notificationBank calling");
                }

                $scope.init($scope.ngModel);

                function recalculateStartDates(newValue, oldValue) {

                    //var stageIndex = $scope.stageInfo.stages.indexOf($scope.currentStage);
                    //var difference = datetimeCalculator.getTimeDifference(newValue, oldValue);
                    //if (difference != 0) {
                    //    if (difference > 0) {
                    //        datetimeCalculator.shiftStageDates($scope.stageInfo.stages, difference, null, stageIndex);
                    //        var lastStage = $scope.stageInfo.stages[$scope.stageInfo.stages.length - 1];
                    //        datetimeCalculator.checkEndLimit($scope.stageInfo, lastStage);

                    //    } else {
                    //        if ((stageIndex != 0) && !datetimeCalculator.isFirstDateEarlier($scope.stageInfo.stages[stageIndex].endDateTime, newValue)) {
                    //            datetimeCalculator.shiftStageDates($scope.stageInfo.stages, difference, null, stageIndex);
                    //        }
                    //        datetimeCalculator.shiftStageDatesReversed($scope.stageInfo.stages, difference, null, stageIndex);
                    //        datetimeCalculator.checkStartLimit($scope.stageInfo, $scope.stageInfo.stages[0]);
                    //    }
                    //}
                }

                //function recalculateDueDates(newValue, oldValue) {
                //    console.log($scope.currentStage);
                //    //var alarm = moment(kendo.parseDate(newValue));
                //    //alarm.add(-60, 'minutes');
                //    $scope.stage.redAlarmTime = moment(kendo.parseDate(newValue)).add(1, 'minutes').format('L LT');

                //    //alarm.add(-120, 'minutes');
                //    $scope.stage.yellowAlarmTime = moment(kendo.parseDate(newValue)).add(-180, 'minutes').format('L LT');

                //    //alarm.add(-1260, 'minutes');
                //    $scope.stage.greenAlarmTime = moment(kendo.parseDate(newValue)).add(-1440, 'minutes').format('L LT');

                //    //datetimeCalculator.adjustStageTime($scope.currentStage, )


                //    //var stageIndex = $scope.stageInfo.stages.indexOf($scope.currentStage);
                //    //var difference = datetimeCalculator.getTimeDifference(newValue, oldValue);
                //    //if (difference != 0) {
                //    //    if (difference > 0) {
                //    //        if ((stageIndex != ($scope.stageInfo.stages.length + 1))) {
                //    //            if (!datetimeCalculator.isFirstDateEarlier(newValue, $scope.stageInfo.stages[stageIndex].startDateTime)) {
                //    //                datetimeCalculator.shiftStageDates($scope.stageInfo.stages, difference, null, stageIndex);
                //    //            }
                //    //        } else {
                //    //            datetimeCalculator.shiftStageDates($scope.stageInfo.stages, difference, null, stageIndex);
                //    //        }
                //    //        var lastStage = $scope.stageInfo.stages[$scope.stageInfo.stages.length - 1];
                //    //        datetimeCalculator.checkEndLimit($scope.stageInfo, lastStage);

                //    //    } else {
                //    //        datetimeCalculator.shiftStageDatesReversed($scope.stageInfo.stages, difference, null, stageIndex);
                //    //        datetimeCalculator.checkStartLimit($scope.stageInfo, $scope.stageInfo.stages[0]);
                //    //    }
                //    //}
                //}

                $scope.recalculateStartDates = recalculateStartDates;
                $scope.recalculateDueDates = recalculateDueDates;

                $scope.isDateTimeValid = function (date, isRequered) {
                    if (isRequered) {
                        return datetimeCalculator.isValidDatePatern(date, 'L LT');
                    } else {
                        return !date || datetimeCalculator.isValidDatePatern(date, 'L LT');
                    }
                };


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

