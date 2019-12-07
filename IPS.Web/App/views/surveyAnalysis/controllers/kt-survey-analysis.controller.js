'use strict';
angular
    .module('ips.survey')
    .constant("answerTypesEnum", {
        numeric: 1,
        text: 2,
        singleChoice: 3,
        multipleChoice: 4,
        order: 6
    })
    .config(['$stateProvider', function ($stateProvider) {
        var baseKnowledgetestAnalysisResolve = {
            pageName: function ($translate) {
                return $translate.instant('COMMON_ANANLYSIS');
            },
            participantId: function ($stateParams) {
                return $stateParams.participantId;
            },
            stageId: function ($stateParams) {
                return $stateParams.stageId;
            },
            analysisInfo: function ($stateParams, surveyAnalysisService) {
                return surveyAnalysisService.getKTAnalysisInfo($stateParams.profileId, $stateParams.stageId,
                    $stateParams.participantId, $stateParams.stageEvolutionId);
            }
        };
        $stateProvider
            .state('home.knowledgetest_analysis', {
                url: "/knowledgetest_analysis/:profileId/:stageId/:participantId/:stageEvolutionId",
                templateUrl: "views/surveyAnalysis/views/kt-survey-analysis.html",
                controller: "ktSurveyAnalysisCtrl as analysis",
                authenticate: true,
                resolve: baseKnowledgetestAnalysisResolve,
                data: {
                    displayName: '{{pageName}}',//'Analysis',
                    paneLimit: 1,
                    depth: 2
                }
            });
    }])

    .controller('ktSurveyAnalysisCtrl', ['$scope', '$location', 'analysisInfo',
        'cssInjector', 'stageId', 'participantId', 'surveyAnalysisService', 'dialogService', 'answerTypesEnum',
        function ($scope, $location, analysisInfo, cssInjector, stageId, participantId, surveyAnalysisService, dialogService, answerTypesEnum) {

            cssInjector.removeAll();
            cssInjector.add('views/surveyAnalysis/analysis.css');

            $scope.currentAnswerIndex = 0;
            $scope.profileName = analysisInfo.profileName;
            $scope.currentStepAnswer;
            $scope.answers = analysisInfo.answers;

            $scope.answerTypesEnum = answerTypesEnum;

            var setCurrentStepAnswer = function () {
                $scope.currentStepAnswer = analysisInfo.answers[$scope.currentAnswerIndex];
                if (!$scope.$$phase) {
                    $scope.$apply();
                }
            };

            $scope.isNotShowNextAnswer = function () {
                return $scope.currentAnswerIndex == analysisInfo.answers.length - 1;
            }

            $scope.isNotShowPreviousAnswer = function () {
                return $scope.currentAnswerIndex == 0;
            }

            $scope.nextAnswer = function () {
                $scope.currentAnswerIndex++;
                setCurrentStepAnswer();
            }

            $scope.previousAnswer = function () {
                $scope.currentAnswerIndex--;
                setCurrentStepAnswer();
                if (!$scope.$$phase) {
                    $scope.$apply();
                }
            }

            $scope.init = function () {
                _.forEach(analysisInfo.answers, function (answer) {
                    answer.skillNames = answer.skillNames.toString();
                    if (answer.answerTypeId != answerTypesEnum.text) {
                        answer.correctAnswer = JSON.parse(answer.correctAnswer);
                    }
                    if (answer.userAnswer && answer.answerTypeId != answerTypesEnum.text) {
                        answer.userAnswer = JSON.parse(answer.userAnswer);
                    }
                });
                setCurrentStepAnswer();
            };

            $scope.changeAnswer = function (index) {
                $scope.currentAnswerIndex = index;
                setCurrentStepAnswer();
            }

            $scope.isCorrectAnswer = function (index) {
                return analysisInfo.answers[index].isCorrectAnswer;
            }
        }]);