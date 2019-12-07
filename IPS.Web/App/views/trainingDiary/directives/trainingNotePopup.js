angular.module('ips.trainingdiary')
    .directive('trainingNoteWindow', [function () {
        return {
            restrict: 'E',
            templateUrl: 'views/trainingDiary/directives/trainingNotePopup.html',
            scope: {
                trainingId: '=',
                openTrainingNotePopupMode: '=',
            },
            controller: 'trainingNotePopupCtrl'
        };
    }])
    .controller('trainingNotePopupCtrl', ['$scope', 'trainingdiaryManager', 'dialogService', 'trainingdiaryManager', '$translate', 'globalVariables',
        function ($scope, trainingdiaryManager, dialogService, trainingdiaryManager, $translate, globalVariables) {
            $scope.newTrainingNoteWindow;
            $scope.trainingNote = {
                id: 0,
                trainingId: $scope.trainingId,
                goal: "",
                measureInfo: "",
                proceedInfo: "",
                otherInfo: "",
            };
            moment.locale(globalVariables.lang.currentUICulture);
            $scope.initOnPopupOpen = function () {
            }

            $scope.closeNewTrainingNote = function () {
                $scope.openTrainingNotePopupMode.isOpenNewTrainingNotePopup = false;
                var dialog = $scope.newTrainingNoteWindow.data("kendoWindow");
                if (dialog) {
                    dialog.close();
                    dialog.destroy();
                }
            }
            $scope.saveTraningNote = saveTraningNote;
            function saveTraningNote() {
                trainingdiaryManager.saveTraningNote($scope.trainingNote).then(function (data) {
                    if (data) {
                        dialogService.showNotification($translate.instant('TRAININGDAIRY_THANK_YOU_AND_GOOD_LUCK_ON_YOUR_TRAININGS'), "info");


                        _.forEach($scope.$parent.activeProfile.ipsTrainingDiaryStages, function (stageItem) {
                            if (stageItem.evaluationAgreement) {
                                _.forEach(stageItem.evaluationAgreement, function (evaluationAgreementItem) {
                                    if (evaluationAgreementItem.trainings) {
                                        var isTrainingExist = _.any(evaluationAgreementItem.trainings, function (evaluationTrainingItem) {
                                            return evaluationTrainingItem.id == $scope.trainingId;
                                        })
                                        if (isTrainingExist) {
                                            _.forEach(evaluationAgreementItem.trainings, function (trainingItem) {
                                                if (trainingItem.id == $scope.trainingId) {
                                                    if (trainingItem.ipsTrainingNotes) {
                                                        trainingItem.ipsTrainingNotes.push(data);
                                                    }
                                                }
                                            });
                                        }
                                    }
                                });
                            }
                        });

                        $scope.closeNewTrainingNote();
                    }
                    else {
                        dialogService.showNotification($translate.instant('TRAININGDAIRY_FAIL_TRAINING_NOTE_NOT_SAVED'), "warning");
                    }
                });
            }

            $scope.$on("kendoRendered", function (event) {
                if (event.targetScope.newTrainingNoteWindow) {
                    $scope.newTrainingNoteWindow = event.targetScope.newTrainingNoteWindow;
                }
            });
            $scope.$watch('openTrainingNotePopupMode.isOpenNewTrainingotePopup', function (newValue, oldValue) {
                $scope.newTrainingNoteWindow = $("#newTrainingNoteWindow");
                if ($scope.newTrainingNoteWindow) {
                    if ($scope.openTrainingNotePopupMode.isOpenNewTrainingNotePopup) {
                        $scope.initOnPopupOpen();
                        if (!($scope.newTrainingNoteWindow.data("kendoWindow"))) {
                            $scope.newTrainingNoteWindow.kendoWindow({
                                width: "55%",
                                height: "600px",
                                title: $translate.instant('TRAININGDAIRY_TRAINING_NOTE'),
                                modal: true,
                                visible: false,
                                close: function () {
                                    this.destroy();
                                    $scope.closeNewTrainingNote();
                                },
                                actions: ['Maximize', 'Close']
                            });
                            var dialog = $scope.newTrainingNoteWindow.data("kendoWindow");
                            dialog.open().center();
                        }
                    }
                    else {
                        var dialog = $scope.newTrainingNoteWindow.data("kendoWindow");
                        if (dialog) {
                            dialog.close();
                            dialog.destroy();
                        }
                        $scope.openTrainingNotePopupMode.isOpenNewTrainingNotePopup = false;
                    }
                }
            });
        }])