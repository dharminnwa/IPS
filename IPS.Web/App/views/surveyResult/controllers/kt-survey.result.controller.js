'use strict';
angular
    .module('ips.survey')
    .constant("medalTypesEnum", {
        gold: "gold",
        silver: "silver",
        bronze: "bronze",
        none: "none"
    })
    .config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
        var baseKtSurveyResultResolve = {
            pageName: function ($translate) {
                return $translate.instant('MYPROFILES_SURVEY_RESULT');
            },
            surveyResult: function ($stateParams, surveyService) {
                return surveyService.getKTSurveyResult($stateParams.profileId, $stateParams.stageId,
                    $stateParams.participantId, $stateParams.stageEvolutionId);
            }
        };
        $stateProvider
            .state('home.knowledgetest_result', {
                url: "/knowledgetest_result/:profileId/:stageId/:participantId/:stageEvolutionId",
                templateUrl: "views/surveyResult/views/kt-survey.result.html",
                controller: "ktSurveyResultCtrl as surveyResult",
                authenticate: true,
                resolve: baseKtSurveyResultResolve,
                data: {
                    displayName: '{{pageName}}',//'Survey Result',
                    paneLimit: 1,
                    depth: 2
                }
            });
    }])

    .controller('ktSurveyResultCtrl', ['$scope', 'surveyResult',
        'cssInjector', 'surveyService', 'medalTypesEnum', '$stateParams', '$location', '$translate',
        function ($scope, surveyResult, cssInjector, surveyService, medalTypesEnum, $stateParams, $location, $translate) {
            cssInjector.removeAll();
            cssInjector.add('views/survey/kt-survey.css');
            cssInjector.add('views/surveyResult/kt-survey.result.css');
            $scope.answers = surveyResult.answers;
            $scope.medalRules = surveyResult.medalRules;
            $scope.medalTypes = medalTypesEnum;
            $scope.isPassed = surveyResult.isPassed;
            $scope.isCurrentViewResultByStage = true;
            $scope.totalMaxPoints = 0;
            $scope.correctAnswersScore = 0;
            $scope.surveyStage;
            $scope.mainStage;
            $scope.viewStage;
            $scope.mainStageTotalMaxPoints = 0;
            $scope.mainStageCorrectAnswersScore = 0;
            var initStageData = function (stage) {
                _.forEach(stage.answers, function (answer) {
                    if (typeof (answer.skillNames) == "string") {
                        answer.skillNames = answer.skillNames;
                    }
                    else {
                        answer.skillNames = answer.skillNames.join(', ');
                    }
                });
                stage.correctAnswersCount = countCorrectAnswersCount(stage.answers);
                stage.questionsCount = stage.answers.length;
                stage.correctAnswersPercent = Math.round($scope.correctAnswersScore * 100 / $scope.totalMaxPoints);
                stage.medal = getMedal(stage.correctAnswersPercent);
            }

            var initMainStageData = function (mainstage) {
                _.forEach(mainstage.answers, function (answer) {
                    if (typeof (answer.skillNames) == "string") {
                        answer.skillNames = answer.skillNames;
                    }
                    else {
                        answer.skillNames = answer.skillNames.join(', ');
                    }
                });
                mainstage.correctAnswersCount = countMainStageCorrectAnswersCount(mainstage.answers);
                mainstage.questionsCount = mainstage.answers.length;
                mainstage.correctAnswersPercent = Math.round($scope.mainStageCorrectAnswersScore * 100 / $scope.mainStageTotalMaxPoints);
                mainstage.medal = getMedal(mainstage.correctAnswersPercent);
            }

            $scope.hasMedalRules = function () {
                if ($scope.medalRules) {
                    return true;
                }
                return false;
            };

            $scope.hasMedal = function () {
                return $scope.viewStage.medal != medalTypesEnum.none;
            };

            var getMedal = function (correctAnswersPercent) {
                if ($scope.hasMedalRules()) {
                    if (correctAnswersPercent > $scope.medalRules.goldMedalMinScore) {
                        return medalTypesEnum.gold;
                    }
                    else if (correctAnswersPercent > $scope.medalRules.silverMedalMinScore) {
                        return medalTypesEnum.silver;
                    }
                    else if (correctAnswersPercent >= $scope.medalRules.bronzeMedalMinScore) {
                        return medalTypesEnum.bronze;
                    }
                    else {
                        return medalTypesEnum.none;
                    }
                }
                else {
                    return medalTypesEnum.none;
                }
            };

            var countCorrectAnswersCount = function (answers) {
                var count = 0;
                $scope.totalMaxPoints = 0;
                $scope.correctAnswersScore = 0;
                _.forEach(answers, function (answer) {
                    $scope.totalMaxPoints += answer.scorePoint;
                    if (answer.isCorrect) {
                        $scope.correctAnswersScore += answer.points;
                        count++;
                    }
                });
                return count;
            };

            var countMainStageCorrectAnswersCount = function (answers) {
                var count = 0;
                $scope.mainStageTotalMaxPoints = 0;
                $scope.mainStageCorrectAnswersScore = 0;
                _.forEach(answers, function (answer) {
                    $scope.mainStageTotalMaxPoints += answer.scorePoint;
                    if (answer.isCorrect) {
                        $scope.mainStageCorrectAnswersScore += answer.points;
                        count++;
                    }
                });
                return count;
            };

            $scope.init = function () {
                $scope.surveyStage = surveyResult;
                initStageData($scope.surveyStage);

                if ($scope.mainStage) {
                    initMainStageData($scope.mainStage);
                }
                else {
                    surveyService.getKTAggregatedSurveyResult($stateParams.profileId, $stateParams.stageId,
                        $stateParams.participantId, $stateParams.stageEvolutionId).then(function (data) {
                            $scope.mainStage = data;
                            initMainStageData($scope.mainStage);
                        });
                }

                $scope.viewStage = $scope.surveyStage;

            };


            $scope.initGrid = function () {

                $("#scoreCardDetailsGrid").html("");
                $("#scoreCardDetailsGrid").kendoGrid({
                    dataSource: {
                        data: $scope.viewStage.answers,
                        schema: {
                            model: {
                                fields: {
                                    skillNames: { type: "string" },
                                    performanceGroupName: { type: "string" },
                                    questionText: { type: "string" },
                                    scorePoint: { type: "number" },
                                    points: { type: "number" }
                                }
                            }
                        },
                        pageSize: 20,
                        aggregate: [
                            { field: "points", aggregate: "sum" },
                            { field: "scorePoint", aggregate: "sum" },
                        ]
                    },

                    scrollable: true,
                    sortable: true,
                    filterable: false,
                    pageable: {
                        input: true,
                        numeric: false
                    },
                    columns: [
                        { field: "skillNames", title: $translate.instant('COMMON_SKILL') },
                        { field: "performanceGroupName", title: $translate.instant('COMMON_PERFORMANCE_GROUP') },
                        { field: "questionText", title: $translate.instant('MYPROFILES_QUESTION') },
                        { field: "scorePoint", title: $translate.instant('MYPROFILES_MAX_POINTS'), aggregates: ["sum"], footerTemplate: "Total max points: #=sum#" },
                        { field: "points", title: $translate.instant('MYPROFILES_POINTS'), aggregates: ["sum"], footerTemplate: "Total earning points: #=sum#" },
                        { field: "points", title: $translate.instant('MYPROFILES_RANK'), template: "<div class='answer-mark #=isCorrect?'correct':'wrong'#'></div>" },
                    ]
                });
                $("#scoreCardDetailsGrid").kendoTooltip({
                    filter: "th.k-header",
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
                }).data("tooltiptext");
            };
            function dataSource(scorecardData) {

                return new kendo.data.DataSource({
                    type: "json",
                    data: scorecardData,
                    pageSize: 50,
                    schema: {
                        model: {
                            fields: {
                                skillNames: { type: 'string' },
                                performanceGroupName: { type: 'string' },
                                questionText: { type: 'string' },
                                scorePoint: { type: 'number' },
                                points: { type: 'number' },
                            }
                        }
                    }
                });

            }
            $scope.notification = function (message) {
                $scope.notificationSavedSuccess.show(message, "info");
            };

            $scope.complete = function () {
                $location.path("/home/kt_final_kpi/" + $stateParams.profileId + "/" + $stateParams.stageId + "/" + $stateParams.participantId + '/' + $stateParams.stageEvolutionId);
            }

            $scope.isEvolutionStage = function () {
                if (parseInt($stateParams.stageEvolutionId)) {
                    return true;
                }
                else {
                    return false;
                }
            }

            $scope.switchCurrentViewResult = function () {
                $scope.isCurrentViewResultByStage = !$scope.isCurrentViewResultByStage;
                if ($scope.isCurrentViewResultByStage) {
                    $scope.viewStage = $scope.surveyStage;
                    initStageData($scope.viewStage);
                }
                else {
                    if ($scope.mainStage) {
                        $scope.viewStage = $scope.mainStage;
                        initStageData($scope.viewStage);
                    }
                    else {
                        surveyService.getKTAggregatedSurveyResult($stateParams.profileId, $stateParams.stageId,
                            $stateParams.participantId, $stateParams.stageEvolutionId).then(function (data) {
                                $scope.mainStage = data;
                                initStageData($scope.mainStage);
                                $scope.viewStage = $scope.mainStage;
                            });
                    }
                }
                $scope.initGrid();

            }
        }]);




