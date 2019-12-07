'use strict';
angular
    .module('ips.survey')
    .config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
        $stateProvider
            .state('home.knowledgetest_evaluation', {
                url: "/knowledgetest_evaluation/:profileId/:stageId/:participantId/:stageEvolutionId",
                templateUrl: "views/evaluation/views/kt-evaluation.html",
                controller: "ktEvaluationCtrl as evaluation",
                authenticate: true,
                resolve: {
                    pageName: function ($translate) {
                        return $translate.instant('MYPROFILES_EVALUATION');
                    },
                    participantId: function ($stateParams) {
                        return $stateParams.participantId;
                    },
                    stageId: function ($stateParams) {
                        return $stateParams.stageId;
                    },
                    evaluationInfo: function ($stateParams, evaluationService) {
                        return evaluationService.getKTEvaluationInfo($stateParams.profileId, $stateParams.stageId,
                            $stateParams.participantId, $stateParams.stageEvolutionId);
                    }
                },
                data: {
                    displayName: '{{pageName}}',//'Evaluation',
                    paneLimit: 1,
                    depth: 2
                }
            });
    }])

    .controller('ktEvaluationCtrl', ['$scope', '$location', 'evaluationInfo',
        'cssInjector', 'stageId', 'participantId', 'evaluationService', 'dialogService', '$state', '$translate',
        function ($scope, $location, evaluationInfo, cssInjector, stageId, participantId, evaluationService, dialogService, $state, $translate) {

            cssInjector.removeAll();
            cssInjector.add('views/evaluation/evaluation.css');

            var currentAnswerIndex = 0;
            $scope.profileName = evaluationInfo.profileName;
            $scope.currentStepAnswer;

            var setCurrentStepAnswer = function () {
                $scope.currentStepAnswer = evaluationInfo.answers[currentAnswerIndex];
            };

            $scope.isNotShowNextAnswer = function () {
                return currentAnswerIndex == evaluationInfo.answers.length - 1;
            };

            $scope.isNotShowPreviousAnswer = function () {
                return currentAnswerIndex == 0;
            };

            $scope.nextAnswer = function () {
                currentAnswerIndex++;
                setCurrentStepAnswer();
            };

            $scope.previousAnswer = function () {
                currentAnswerIndex--;
                setCurrentStepAnswer();
            };

            $scope.correctAnswer = function () {
                $scope.currentStepAnswer.isCorrect = true;
                if (!$scope.isNotShowNextAnswer()) {
                    $scope.nextAnswer()
                }
            };

            $scope.wrongAnswer = function () {
                $scope.currentStepAnswer.isCorrect = false;
                if (!$scope.isNotShowNextAnswer()) {
                    $scope.nextAnswer()
                }
            };

            $scope.isShowConfirmButton = function () {
                return $scope.isNotShowNextAnswer();
            };

            $scope.confirm = function () {
                var evaluationAnswers = _.map(evaluationInfo.answers, function (answer) {
                    return {
                        answerId: answer.id,
                        answerIsCorrect: answer.isCorrect,
                        comment: answer.comment
                    };
                });
                evaluationService.confirmKTEvaluation(evaluationAnswers).then(
                    function (data) {
                        dialogService.showNotification($translate.instant('MYPROFILES_SAVED_SUCCESFULLY'), 'info');
                        $state.go("home.activeProfiles", null, { reload: true });
                    },
                    function (data) {
                        dialogService.showNotification($translate.instant('MYPROFILES_CANT_SAVE'), 'error');
                    }
                );
            };

            $scope.init = function () {
                _.forEach(evaluationInfo.answers, function (answer) {
                    answer.skillNames = answer.skillNames.toString();
                });
                setCurrentStepAnswer();
            };
        }]);




