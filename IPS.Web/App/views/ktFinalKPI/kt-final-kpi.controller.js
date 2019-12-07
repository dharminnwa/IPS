'use strict';
angular
    .module('ips.survey')
    .config(['$stateProvider', function ($stateProvider) {
        var baseKtFinalKpiResolve = {
            pageNameKpi: function ($translate) {
                return $translate.instant('MYPROFILES_FINAL_KPI');
            },
            pageNameAgreements: function ($translate) {
                return $translate.instant('MYPROFILES_FINAL_AGREEMENTS');
            }
        };
        $stateProvider
            .state('home.ktFinalKPI', {
                url: "/kt_final_kpi/:profileId/:stageId/:participantId/:stageEvolutionId",
                templateUrl: "views/ktFinalKPI/kt-final-kpi.html",
                controller: "ktFinalAgreementsCtrl",
                authenticate: true,
                resolve: baseKtFinalKpiResolve,
                data: {
                    displayName: '{{pageNameKpi}}',//'Final KPI',
                    paneLimit: 1,
                    depth: 2
                }
            })
            .state('home.ktFinalKPIReview', {
                url: "/kt_final_kpi_preview/:profileId/:stageId/:participantId/:stageEvolutionId",
                templateUrl: "views/ktFinalKPI/kt-final-kpi.preview.html",
                controller: "ktFinalAgreementsCtrl",
                authenticate: true,
                resolve: baseKtFinalKpiResolve,
                data: {
                    displayName: '{{pageNameAgreements}}',//'Final Agreements',
                    paneLimit: 1,
                    depth: 2
                }
            });
    }])
    .controller('ktFinalAgreementsCtrl', ['$scope', 'cssInjector', 'surveyService', '$stateParams'
        , 'answerTypesEnum', 'dialogService', 'trainingsService', 'trainingSaveModeEnum', '$state', '$location', 'progressBar', '$translate',
        function ($scope, cssInjector, surveyService, $stateParams
            , answerTypesEnum, dialogService, trainingsService, trainingSaveModeEnum, $state, $location, progressBar, $translate) {

            cssInjector.removeAll();
            cssInjector.add('views/finalkpi/finalkpi.css');
            cssInjector.add('views/survey/kt-survey.css');
            cssInjector.add('views/ktFinalKPI/kt-final-kpi.css');
            $scope.finalKPIData = [];
            var finalKPIPreviousResults;
            var finalKPICurrentResult = [];
            $scope.isShowPreviousResults = false;
            $scope.durationMetrics;
            $scope.organizationId = $stateParams.organizationId;
            $scope.openTrainingPopupMode = {
                isOpenNewTrainingPopup: false,
                isOpenAddExistingTrainingPopup: false
            };
            $scope.hasDevContract = false;
            $scope.init = function () {
                progressBar.startProgress();
                surveyService.getKTFinalKPI($stateParams.profileId, $stateParams.stageId, $stateParams.participantId, $stateParams.stageEvolutionId)
                    .then(function (data) {
                        progressBar.stopProgress();
                        finalKPICurrentResult = data.questions;
                        $scope.hasDevContract = data.hasDevContract;
                        _.forEach(finalKPICurrentResult, function (item) {
                            item.skillNames = item.skillNames.join(', ');
                            if (item.answer && item.answerTypeId != answerTypesEnum.text) {
                                item.answer = JSON.parse(item.answer);
                            }
                            if (!item.trainings) {
                                item.trainings = [];
                            }
                            item.isCurrentStage = true;
                        });
                        $scope.finalKPIData = finalKPICurrentResult;
                    });
                trainingsService.getDurationMetrics().then(function (data) {
                    $scope.durationMetrics = data;
                });
            };
            $scope.finalKPIData = finalKPICurrentResult;
            $scope.isAnswerCellAvailable = function (item) {
                var isAvailable = false;
                if (item.answer) {
                    if (_.isArray(item.answer)) {
                        isAvailable = item.answer.length > 0;
                    }
                    else {
                        isAvailable = true;
                    }
                }
                else if (item.answer === 0) {
                    isAvailable = true;
                }
                return isAvailable;
            };

            $scope.submit = function () {
                var nextStageQuestionsId = _.pluck(_.where($scope.finalKPIData, { 'selectForNextStage': true }), 'questionId');
                var surveyAnswerAgreements = _.map($scope.finalKPIData, function (item) {
                    var result = {
                        answerId: item.answerId,
                        inDevContract: item.inDevContract,
                        comment: item.comment
                    };
                    if (item.agreement && item.agreement.trainings) {
                        result.trainingsId = _.pluck(item.agreement.trainings, 'id');
                    }
                    return result;
                });
                surveyService.saveKTFinalKPI(
                    $stateParams.stageId,
                    $stateParams.stageEvolutionId,
                    $stateParams.participantId,
                    nextStageQuestionsId,
                    surveyAnswerAgreements)
                    .then(function () {
                        $state.go(
                            $state.$current.parent.self.name,
                            null,
                            { reload: true }
                        );
                    });
            };

            $scope.openNewTrainingDialog = function (index) {
                $scope.scorecardAnswer = $scope.finalKPIData[index];
                $scope.saveMode = trainingSaveModeEnum.create;
                $scope.openTrainingPopupMode.isOpenNewTrainingPopup = true;
            };

            $scope.openSearchWindow = function (index) {
                $scope.scorecardAnswer = $scope.finalKPIData[index];
                $scope.saveMode = trainingSaveModeEnum.edit;
                $scope.openTrainingPopupMode.isOpenAddExistingTrainingPopup = true;
            };

            $scope.setTrainings = function (trainings, evaluationAgreement) {
                if (!evaluationAgreement.agreement) {
                    evaluationAgreement.agreement = {
                        trainings: []
                    }
                }
                if (evaluationAgreement.agreement && !evaluationAgreement.agreement.trainings) {
                    evaluationAgreement.agreement['trainings'] = [];
                }

                var columns = [
                    { field: "name", title: $translate.instant('COMMON_TITLE') },
                    { field: "startDateText", title: $translate.instant('COMMON_START_DATE') },
                    { field: "endDateText", title: $translate.instant('COMMON_END_DATE') }
                ];

                dialogService.showSelectableGridDialogForDatasource($translate.instant('MYPROFILES_SELECT_TRAINING'), columns, trainings).then(
                    function (data) {
                        for (var i = 0, len = data.length; i < len; i++) {
                            evaluationAgreement.agreement.trainings.push(data[i]);
                        }
                    });
            };

            $scope.getDate = function (dt) {
                return moment(kendo.parseDate(dt)).isValid() ? moment(kendo.parseDate(dt)).format('L LT') : null;
            };

            $scope.getTrainingDuration = function (training) {
                if (training.duration && training.durationMetricId) {
                    var res = $.grep($scope.durationMetrics, function (e) {
                        return e.id == training.durationMetricId;
                    });
                    if (res && res.length == 1)
                        return training.duration + " " + res[0].name.toLowerCase();
                }
                return null;
            };

            $scope.getById = function (id, myArray) {
                if (myArray.filter) {
                    return myArray.filter(function (obj) {
                        if (obj.id == id) {
                            return obj;
                        }
                    })[0];
                }
                return undefined;
            };

            $scope.removeTraining = function (trainingId, trainings) {
                var element = $scope.getById(trainingId, trainings);
                var index = trainings.indexOf(element);
                trainings.splice(index, 1);
            };

            $scope.editTraining = function (training, scorecardAnswer, trainingIndex) {
                $scope.scorecardAnswer = scorecardAnswer;
                $scope.saveMode = trainingIndex >= 0 ? trainingSaveModeEnum.edit : trainingSaveModeEnum.view;
                $scope.editingTrainingIndex = trainingIndex;
                $scope.openTrainingPopupMode.isOpenNewTrainingPopup = true;
            };

            $scope.hasPreviousResults = function () {
                if (JSON.parse($stateParams.stageEvolutionId)) {
                    return true;
                }
                return false;
            };

            $scope.showPreviousResults = function () {
                $scope.isShowPreviousResults = !$scope.isShowPreviousResults;
                if ($scope.isShowPreviousResults) {
                    if (!finalKPIPreviousResults) {
                        surveyService.getKTFinalKPIPreviousResults($stateParams.profileId, $stateParams.participantId, $stateParams.stageEvolutionId)
                            .then(function (data) {
                                finalKPIPreviousResults = data;
                                _.forEach(finalKPIPreviousResults, function (item) {
                                    item.skillNames = item.skillNames.join(', ');
                                    if (item.answer && item.answerTypeId != answerTypesEnum.text) {
                                        item.answer = JSON.parse(item.answer);
                                    }
                                    item.isCurrentStage = false;
                                });
                                $scope.finalKPIData = $scope.finalKPIData.concat(finalKPIPreviousResults);
                            });
                    }
                    else {
                        $scope.finalKPIData = $scope.finalKPIData.concat(finalKPIPreviousResults);
                    }
                }
                else {
                    $scope.finalKPIData = finalKPICurrentResult;
                }
            };

            $scope.goToDevContract = function () {
                $location.path("/home/kt_final_kpi/"
                    + $stateParams.profileId + "/"
                    + $stateParams.stageId + "/"
                    + $stateParams.participantId + "/"
                    + $stateParams.stageEvolutionId + "/devContract");
            };

            $scope.goToTrainingDiary = function () {
                $location.path("/home/kt_final_kpi/"
                    + $stateParams.profileId + "/"
                    + $stateParams.stageId + "/"
                    + $stateParams.participantId + "/"
                    + $stateParams.stageEvolutionId + "/trainingDiary");
            }
            $scope.rankSortingOrder = false;
            $scope.changeRankSorting = function () {
                $scope.rankSortingOrder = (!$scope.rankSortingOrder)
                if ($scope.rankSortingOrder) {
                    $scope.finalKPIData = _.sortBy($scope.finalKPIData, function (o) { return o.isCorrect }).reverse();;
                }
                else {
                    $scope.finalKPIData = _.sortBy($scope.finalKPIData, function (o) { return o.isCorrect });
                }
            }
        }]);