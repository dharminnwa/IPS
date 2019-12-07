(function () {
    app
        .constant('resulTypesEnum', {
            score: 1,
            percent: 2,
            correctAnswers: 3,
            resultTime: 4,
            performancevsgoal: 5
        })
        .constant('ktDashboardColors', {
            main: '#ff7f27',
            compare: '#abb11e',
            benchmark: '#67afe9',
        })
        .constant('gaugeSeriesColors', {
            main: '#ff7f27',
            compare: '#abb11e',
            benchmark: '#67afe9',
            mainEvaluator: '',
            compareEvaluator: '',
        })
        .constant('presentationModesEnum', {
            Dashboard: 'Dashboard',
            PerSkill: 'Per Skill',
            StagesResults: 'Stages Results',
            Scorecard: 'Scorecard',
            PerPerfomanceGroup: 'Per Perfomance Group',
            Ananlysis: 'Ananlysis',
        })
        .directive('ngDashboardNew', ['$compile', function ($compile) {
            return {
                restrict: 'EA',
                templateUrl: 'directives/ngDashboardNew/ngDashboard.html',
                scope: {
                    ngReportData: '=',
                    ngCompareReportData: '=?',
                    profileId: '=',
                    organizationId: '=',
                    showReport: '=',
                    showGauge: '=',
                    showGraph: '=',
                    showKpiBar: '=',
                    showCompareKpi: "=",
                    showCompareGauge: "=",
                    showCompareReport: '=?',
                    graphsmode: '=',
                    mainStageName: '=',
                    stageName: '=',
                    profileType: '=',
                    ktStagesResults: '=?',
                    ktCompareStagesResult: '=?',

                },
                replace: true,
                controller: ['$scope', '$location', '$compile', 'apiService', 'dialogService', '$element', 'profilesTypesEnum', 'resulTypesEnum',
                    'passScoreIndicator', 'ktDashboardColors', 'scorecardsServiceNew', 'ktProfileTypesEnum', 'presentationModesEnum', 'surveyService', 'cssInjector', 'surveyAnalysisService', '$state', 'gaugeSeriesColors', 'localStorageService', '$translate', 'medalTypesEnum',
                    function ($scope, $location, $compile, apiService, dialogService, $element, profilesTypesEnum, resulTypesEnum,
                        passScoreIndicator, ktDashboardColors, scorecardsServiceNew, ktProfileTypesEnum, presentationModesEnum, surveyService, cssInjector, surveyAnalysisService, $state, gaugeSeriesColors, localStorageService, $translate, medalTypesEnum) {
                        //cssInjector.removeAll();
                        cssInjector.add('views/performance/scorecardNew/scorecard.css');
                        var reportModel;
                        var profileCharts = [];
                        $scope.scorecard = this;
                        $scope.scorecard.legends = [];
                        $scope.scorecard.reportData = [];
                        $scope.stageEvolutionId = "null";

                        var countCorrectAnswersCount = function (answers) {
                            var count = 0;
                            $scope.totalMaxPoints = 0;
                            _.forEach(answers, function (answer) {
                                $scope.totalMaxPoints += answer.scorePoint;
                                if (answer.isCorrect) {
                                    //count++;
                                    count += answer.scorePoint;
                                }
                            });
                            return count;
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
                        $scope.hasMedalRules = function () {
                            if ($scope.medalRules) {
                                return true;
                            }
                            return false;
                        };
                        var initStageData = function (stage) {
                            _.forEach(stage.answers, function (answer) {

                                if (typeof (answer.skillNames) == "string") {
                                    answer.skillNames = answer.skillNames;
                                }
                                else {
                                    answer.skillNames = answer.skillNames.join(', ');
                                }
                            });
                            stage["correctAnswersCount"] = countCorrectAnswersCount(stage.answers);
                            stage["questionsCount"] = $scope.totalMaxPoints; //stage.answers.length;
                            stage["correctAnswersPercent"] = Math.round(stage.correctAnswersCount * 100 / stage.questionsCount);
                            stage["medal"] = getMedal(stage.correctAnswersPercent);
                        }
                        $scope.ngDashboard = {
                            isShowReport: false,
                            isShowKTScoreCardDetail: false,
                            isShowKTDevelopmentContractDetail: false,
                            isShowKTAnswerDetail: false,
                            isShowKTDetailsGrid: false
                        };
                        $scope.ktProfileTypes = {
                            start: { id: 1, label: $translate.instant('COMMON_START_STAGE') },
                            final: { id: 2, label: $translate.instant('COMMON_FINAL_STAGE') }
                        };
                        $scope.participantId = 0;
                        $scope.profilesTypesEnum = profilesTypesEnum;
                        $scope.resultTypes = [
                            { id: resulTypesEnum.score, label: $translate.instant('COMMON_SCORE') },
                            { id: resulTypesEnum.percent, label: "%" },
                            { id: resulTypesEnum.correctAnswers, label: $translate.instant('COMMON_CORRECT_ANSWERS') },
                            { id: resulTypesEnum.resultTime, label: $translate.instant('COMMON_RESULT_TIME') + "( " + $translate.instant('COMMON_MINUTES') + " )" },
                            { id: resulTypesEnum.performancevsgoal, label: $translate.instant('COMMON_PERFORMANCE_VS_GOAL') }
                        ];
                        $scope.ktResultTypes = [
                            { id: 0, label: $translate.instant('COMMON_SELECT_RESULT') },
                            { id: 1, label: $translate.instant('COMMON_RESULT_PAGE') },
                            { id: 2, label: $translate.instant('COMMON_ANALYZE') },
                            { id: 3, label: $translate.instant('COMMON_DEVELOPMENT_CONTRACT') },
                            { id: 4, label: $translate.instant('COMMON_SCORECARD') }
                        ];
                        $scope.groupBy = [{ id: 0, name: $translate.instant('COMMON_PERFORMANCE_GROUP') }, { id: 1, name: $translate.instant('COMMON_PERSPECTIVE') }];

                        $scope.presentationModes = [
                            { id: presentationModesEnum.Dashboard, label: $translate.instant('COMMON_DASHBOARD') },
                            { id: presentationModesEnum.PerSkill, label: $translate.instant('COMMON_PER_SKILL') },
                            { id: presentationModesEnum.StagesResults, label: $translate.instant('COMMON_STAGES_RESULTS') },
                            { id: presentationModesEnum.Scorecard, label: $translate.instant('COMMON_SCORECARD') },
                            { id: presentationModesEnum.PerPerfomanceGroup, label: $translate.instant('COMMON_PER_PERFOMANCE_GROUP') },
                            { id: presentationModesEnum.Ananlysis, label: $translate.instant('COMMON_ANANLYSIS') },
                        ];

                        $scope.kt = {
                            resultType: 1,
                            ktResultType: 1,
                            chartMode: 1,
                            groupById: 0,
                            presentationMode: presentationModesEnum.PerPerfomanceGroup,
                            gaugeTotalScore: [],
                            compareGaugeTotalScore: 0,
                            maxGaugeValue: 0,
                            passScore: 0,
                            totalScoreDescription: ''
                        };

                        var chartmode = _.find($scope.chartModes, function (item, index) {
                            return index == 0;
                        })
                        if (chartmode) {
                            $scope.chartModeText = chartmode.label;
                        }
                        $scope.skillResults = [];
                        $scope.skillResultsParticipants = [];
                        $scope.skillResultsEvaluator = [];
                        $scope.skillResultsCompareParticipants = [];
                        $scope.ktGroupByChanged = function () {
                            var obj = $("#scoreCardDetailsGrid").data("kendoGrid");
                            if (obj) {
                                if ($scope.kt.groupById == $scope.groupBy[0].id) {
                                    obj.dataSource.group({ field: "performanceGroupName" });
                                }
                                else {
                                    obj.dataSource.group([]);
                                }
                            }

                        }

                        $scope.ktResultTypeChanged = function () {
                            $("#ktresulttypes").html("");
                            $scope.ngDashboard.isShowKTScoreCardDetail = false;
                            $scope.ngDashboard.isShowKTAnswerDetail = false;
                            $scope.ngDashboard.isShowKTDevelopmentContractDetail = false;
                            $scope.ngDashboard.isShowKTDetailsGrid = false;
                            if ($scope.kt.ktResultType == $scope.ktResultTypes[0].id) {
                                $scope.ngDashboard.isShowKTScoreCardDetail = false;
                                $scope.ngDashboard.isShowKTAnswerDetail = false;
                                $scope.ngDashboard.isShowKTDevelopmentContractDetail = false;
                                $scope.ngDashboard.isShowKTDetailsGrid = false;
                            }
                            else if ($scope.kt.ktResultType == $scope.ktResultTypes[1].id) {
                                $scope.ngDashboard.isShowKTScoreCardDetail = true;
                                $scope.ngDashboard.isShowKTAnswerDetail = false;
                                $scope.ngDashboard.isShowKTDevelopmentContractDetail = false;
                                $scope.ngDashboard.isShowKTDetailsGrid = false;
                            }
                            else if ($scope.kt.ktResultType == $scope.ktResultTypes[2].id) {
                                $scope.ngDashboard.isShowKTScoreCardDetail = false;
                                $scope.ngDashboard.isShowKTAnswerDetail = true;
                                $scope.ngDashboard.isShowKTDevelopmentContractDetail = false;
                                $scope.ngDashboard.isShowKTDetailsGrid = false;

                            }
                            else if ($scope.kt.ktResultType == $scope.ktResultTypes[3].id) {
                                $scope.ngDashboard.isShowKTScoreCardDetail = false;
                                $scope.ngDashboard.isShowKTAnswerDetail = false;
                                $scope.ngDashboard.isShowKTDevelopmentContractDetail = true;
                                $scope.ngDashboard.isShowKTDetailsGrid = false;
                            }
                            else if ($scope.kt.ktResultType == $scope.ktResultTypes[4].id) {
                                $scope.ngDashboard.isShowKTScoreCardDetail = false;
                                $scope.ngDashboard.isShowKTAnswerDetail = false;
                                $scope.ngDashboard.isShowKTDevelopmentContractDetail = false;
                                $scope.ngDashboard.isShowKTDetailsGrid = true;
                                getKTScorecardDialogDetail();
                            }

                            {

                                surveyService.getKTSurveyResult($scope.profileId, $scope.ngReportData.stageId, $scope.ngReportData.participantsId[0].id, $scope.stageEvolutionId).then(function (data) {
                                    surveyResult = data;
                                    surveyResult.mainParticipantName = $scope.ngReportData.mainParticipantsRaw.split(",")[0];
                                    $scope.answers = surveyResult.answers;
                                    $scope.medalRules = surveyResult.medalRules;
                                    $scope.medalTypes = medalTypesEnum;
                                    $scope.isPassed = surveyResult.isPassed;
                                    $scope.isCurrentViewResultByStage = true;


                                    if ($scope.ngReportData.cParticipantIds.length > 0) {

                                        surveyService.getKTSurveyResult($scope.profileId, $scope.ngReportData.cStageId, $scope.ngReportData.cParticipantIds[0].id, $scope.stageEvolutionId).then(function (data) {
                                            if (data) {
                                                surveyResult.compareParticipantAnswers = data.answers;
                                                _.forEach(surveyResult.answers, function (item) {
                                                    var obj = _.find(data.answers, function (resultobj) {
                                                        return (_.isEqual(resultobj.skillNames, item.skillNames) && resultobj.questionText == item.questionText)
                                                    });
                                                    if (obj) {
                                                        item.comparePoints = obj.points;
                                                        item.comapreAvailable = obj.isAvailable;
                                                        item.comapreIsCorrect = obj.isCorrect;

                                                    }
                                                });

                                                $scope.surveyStage = surveyResult;
                                                surveyResult.compareCorrectAnswersCount = countCorrectAnswersCount(data.answers);
                                                surveyResult.compareQuestionsCount = $scope.totalMaxPoints, // data.answers.length;
                                                    surveyResult.compareCorrectAnswersPercent = Math.round(surveyResult.compareCorrectAnswersCount * 100 / surveyResult.compareQuestionsCount);
                                                surveyResult.compareParticipantName = $scope.ngReportData.participantsRaw.split(",")[0];
                                                surveyResult.compareParticipantIsPassed = data.isPassed;
                                                surveyResult.compareMedal = getMedal(surveyResult.compareCorrectAnswersPercent);
                                                surveyResult.compareAvailable = true;
                                                initStageData($scope.surveyStage);
                                                $scope.viewStage = $scope.surveyStage;



                                            }
                                        });

                                    }
                                    else {

                                        $scope.surveyStage = surveyResult;
                                        initStageData($scope.surveyStage);
                                        $scope.viewStage = $scope.surveyStage;


                                    }
                                });
                            }


                            var ktresulttypesHtml = '<div  id="ktScoreCardDetail" ng-if="ngDashboard.isShowKTScoreCardDetail"><div kt-score-card-detail-new profile-id="profileid" stage-id="ngReportData.stageid" participant-id="participantid" stage-evolution-id="stageEvolutionId" viewStage="viewStage"></div></div>';
                            ktresulttypesHtml += '<div id="ktAnswerDetail" ng-if="ngDashboard.isShowKTAnswerDetail"><div kt-answer-detail-new profile-id="profileid" stage-id="ngReportData.stageid" participant-id="participantId" index="0"></div></div>';
                            ktresulttypesHtml += '<div id="ktDevelopmentContractDetail" ng-if="ngDashboard.isShowKTDevelopmentContractDetail"><div kt-development-contract-new profile-id="profileid" stage-id="stageid" participant-id="participantid" stage-evolution-id="stageevolutionid"></div></div>';
                            ktresulttypesHtml += '<div id="ktDetailsGridDiv"  ng-if="ngDashboard.isShowKTDetailsGrid"><div id="ktDetailsGrid"></div></div>';


                            if ($scope.kt.ktResultType == $scope.ktResultTypes[1].id || $scope.kt.ktResultType == $scope.ktResultTypes[2].id) {
                                var surveyAnalysis = surveyAnalysisService.getKTAnalysisInfo($scope.profileId, $scope.ngReportData.stageId,
                                    $scope.ngReportData.participantsId[0].id, $scope.stageEvolutionId).then(function (data) {
                                        var participantName = ""
                                        var userindex = _.findIndex($scope.ngReportData.participantsId, function (item) { return item.id == $scope.ngReportData.participantsId[0].id });
                                        if (userindex == 0) {
                                            participantName = $scope.ngReportData.mainParticipantsRaw.split(',')[0];
                                        }
                                        else {
                                            userindex = _.findIndex($scope.ngReportData.cParticipantIds, function (item) { return item.id == $scope.ngReportData.participantsId[0].id })
                                            if (userindex == 0) {
                                                participantName = $scope.ngReportData.participantsRaw.split(',')[0];
                                            }
                                        }
                                        $scope.ngReportData["answerDetail"] = data;
                                        $scope.ngReportData["index"] = 0;

                                        var linkFn = $compile(ktresulttypesHtml);
                                        var content = linkFn($scope);
                                        $("#ktresulttypes").html(content);
                                    });;
                            }
                            else {
                                var linkFn = $compile(ktresulttypesHtml);
                                var content = linkFn($scope);
                                $("#ktresulttypes").html(content);
                            }

                        }
                        $scope.spResultTypeChanged = function () {
                        }
                        $scope.resultTypeChanged = function () {
                            $scope.kt.gaugeTotalScore = [];
                            var totalScore = {
                                value: 0,
                                color: ktDashboardColors.main,
                                name: 'Main'
                            };

                            if ($scope.kt.resultType == resulTypesEnum.score) {
                                totalScore.value = $scope.ngReportData.score;
                                if ($scope.ngReportData.medalRule) {
                                    $scope.kt.bronzeScore = $scope.ngReportData.maxScore * $scope.ngReportData.medalRule.bronzeMedalMinScore / 100;
                                    $scope.kt.silverScore = $scope.ngReportData.maxScore * $scope.ngReportData.medalRule.silverMedalMinScore / 100;
                                    $scope.kt.goldScore = $scope.ngReportData.maxScore * $scope.ngReportData.medalRule.goldMedalMinScore / 100;
                                }
                                else {
                                    $scope.kt.passScore = $scope.ngReportData.maxScore * $scope.ngReportData.passScore / 100;
                                }
                                $scope.kt.maxGaugeValue = $scope.ngReportData.maxScore;
                            }
                            else if ($scope.kt.resultType == resulTypesEnum.percent) {
                                totalScore.value = Math.round($scope.ngReportData.score * 100 / $scope.ngReportData.maxScore);
                                if ($scope.ngReportData.medalRule) {
                                    $scope.kt.bronzeScore = $scope.ngReportData.medalRule.bronzeMedalMinScore;
                                    $scope.kt.silverScore = $scope.ngReportData.medalRule.silverMedalMinScore;
                                    $scope.kt.goldScore = $scope.ngReportData.medalRule.goldMedalMinScore;
                                }
                                else {
                                    $scope.kt.passScore = $scope.ngReportData.passScore;
                                }
                                $scope.kt.maxGaugeValue = 100;
                            }
                            else if ($scope.kt.resultType == resulTypesEnum.correctAnswers) {
                                totalScore.value = $scope.ngReportData.correctAnswersCount;
                                if ($scope.ngReportData.medalRule) {
                                    $scope.kt.bronzeScore = $scope.ngReportData.questionsCount * $scope.ngReportData.medalRule.bronzeMedalMinScore / 100;
                                    $scope.kt.silverScore = $scope.ngReportData.questionsCount * $scope.ngReportData.medalRule.silverMedalMinScore / 100;
                                    $scope.kt.goldScore = $scope.ngReportData.questionsCount * $scope.ngReportData.medalRule.goldMedalMinScore / 100;
                                }
                                else {
                                    $scope.kt.passScore = $scope.ngReportData.questionsCount * $scope.ngReportData.passScore / 100;
                                }
                                $scope.kt.maxGaugeValue = $scope.ngReportData.questionsCount;
                            }
                            else if ($scope.kt.resultType == resulTypesEnum.resultTime) {
                                totalScore.value = ($scope.ngReportData.timeSpent / 60).toFixed(2);
                                var allTimeMinutes = $scope.ngReportData.allTime / 60;
                                if ($scope.ngReportData.medalRule) {
                                    $scope.kt.bronzeScore = (allTimeMinutes * $scope.ngReportData.medalRule.bronzeMedalMinScore / 100).toFixed(2);
                                    $scope.kt.silverScore = (allTimeMinutes * $scope.ngReportData.medalRule.silverMedalMinScore / 100).toFixed(2);
                                    $scope.kt.goldScore = (allTimeMinutes * $scope.ngReportData.medalRule.goldMedalMinScore / 100).toFixed(2);
                                }
                                else {
                                    $scope.kt.passScore = (allTimeMinutes * $scope.ngReportData.passScore / 100).toFixed(2);
                                }
                                $scope.kt.maxGaugeValue = (allTimeMinutes).toFixed(2);
                            }

                            $scope.kt.gaugeTotalScore.push(totalScore);

                            if ($scope.ngReportData.medalRule) {
                                $scope.kt.scaleRanges = [
                                    { color: passScoreIndicator.failed, from: 0, to: $scope.kt.bronzeScore, min: 0, max: $scope.kt.bronzeScore, scaleId: 1, id: 1 },
                                    { color: passScoreIndicator.bronzeMedal, from: $scope.kt.bronzeScore, to: $scope.kt.silverScore, min: $scope.kt.bronzeScore, max: $scope.kt.silverScore, scaleId: 2, id: 2 },
                                    { color: passScoreIndicator.silverMedal, from: $scope.kt.silverScore, to: $scope.kt.goldScore, min: $scope.kt.silverScore, max: $scope.kt.goldScore, scaleId: 3, id: 3 },
                                    { color: passScoreIndicator.goldMedal, from: $scope.kt.goldScore, to: $scope.kt.maxGaugeValue, min: $scope.kt.goldScore, max: $scope.kt.maxGaugeValue, scaleId: 4, id: 4 }
                                ];
                            }
                            else {
                                $scope.kt.scaleRanges = [
                                    { color: passScoreIndicator.failed, from: 0, to: $scope.kt.passScore, min: 0, max: $scope.kt.passScore, scaleId: 1, id: 1 },
                                    { color: passScoreIndicator.passed, from: $scope.kt.passScore, to: $scope.kt.maxGaugeValue, min: $scope.kt.passScore, max: $scope.kt.maxGaugeValue, scaleId: 2, id: 2 }
                                ];
                            }

                            $($element).find("#kt-gauge_total_score_value").empty();
                            var totalScoreEl = "<div style='color:" + gaugeSeriesColors.main + "; display: inline-block;'>";
                            totalScoreEl += totalScore.value;
                            totalScoreEl += '</div>';
                            $($element).find("#kt-gauge_total_score_value").append(totalScoreEl);
                            if ($scope.ngReportData.isShowBenchmark) {
                                $scope.prepareBenchmarkGaugeData();
                            }

                            if ($scope.showCompareReport) {
                                $scope.compareResultTypeChanged();
                            }

                            drawKTGauge();
                            drawKTPerformanceGraph();
                            getKTScorecardData();
                        }

                        $scope.prepareBenchmarkGaugeData = function () {
                            var totalScore = {
                                value: 0,
                                color: ktDashboardColors.benchmark,
                                name: 'benchmark'
                            };
                            if ($scope.kt.resultType == resulTypesEnum.score) {
                                totalScore.value = $scope.ngReportData.benchmark.score;
                            }
                            else if ($scope.kt.resultType == resulTypesEnum.percent) {
                                totalScore.value = Math.round($scope.ngReportData.benchmark.score * 100 / $scope.ngReportData.benchmark.maxScore);
                            }
                            else if ($scope.kt.resultType == resulTypesEnum.correctAnswers) {
                                totalScore.value = $scope.ngReportData.benchmark.correctAnswersCount;
                            }
                            else if ($scope.kt.resultType == resulTypesEnum.resultTime) {
                                totalScore.value = ($scope.ngReportData.benchmark.timeSpent / 60).toFixed(2);
                            }

                            $scope.kt.gaugeTotalScore.push(totalScore);


                            var totalScoreEl = ' vs ';
                            totalScoreEl += "<div style='color:" + gaugeSeriesColors.benchmark + "; display: inline-block;'>";
                            totalScoreEl += totalScore.value;
                            totalScoreEl += '</div>';
                            $($element).find("#kt-gauge_total_score_value").append(totalScoreEl);

                        }

                        $scope.compareResultTypeChanged = function () {
                            var totalScore = {
                                value: 0,
                                color: ktDashboardColors.compare,
                                name: 'Compare'
                            };
                            if ($scope.kt.resultType == resulTypesEnum.score) {
                                totalScore.value = $scope.ngCompareReportData.score;
                            }
                            else if ($scope.kt.resultType == resulTypesEnum.percent) {
                                totalScore.value = Math.round($scope.ngCompareReportData.score * 100 / $scope.ngCompareReportData.maxScore);
                            }
                            else if ($scope.kt.resultType == resulTypesEnum.correctAnswers) {
                                totalScore.value = $scope.ngCompareReportData.correctAnswersCount;
                            }
                            else if ($scope.kt.resultType == resulTypesEnum.resultTime) {
                                totalScore.value = ($scope.ngCompareReportData.timeSpent / 60).toFixed(2);
                            }

                            $scope.kt.gaugeTotalScore.push(totalScore);

                            //$scope.kt.totalScoreDescription += ' vs ';
                            //$scope.kt.totalScoreDescription += totalScore.value;

                            var totalScoreEl = ' vs ';
                            totalScoreEl += "<div style='color: " + gaugeSeriesColors.compare + "; display: inline-block;'>";
                            totalScoreEl += totalScore.value;
                            totalScoreEl += '</div>';
                            $($element).find("#kt-gauge_total_score_value").append(totalScoreEl);
                        }

                        var questions = $scope.ngQuestions;

                        var percentage = function (max, val) {
                            return (val / max * 100).toFixed(1);
                        };

                        $scope.chartModes = [{ id: 1, label: $translate.instant('DASHBOARD_GRAPH') }, { id: 2, label: $translate.instant('DASHBOARD_GAUGE') }, { id: 3, label: $translate.instant('DASHBOARD_LINEAR') }];

                        $scope.pgModesModel = [];

                        function getSkillsFromScorecards(perfomanceGroupId, scorecards) {
                            var skillsData = [];
                            if (scorecards && scorecards.length > 0) {
                                angular.forEach(scorecards, function (scorecard) {
                                    angular.forEach(scorecard.performanceGroups, function (perfomanceGroup) {
                                        if (perfomanceGroupId === perfomanceGroup.id) {
                                            var separateGraphData = [];
                                            angular.forEach(perfomanceGroup.skills, function (skill) {
                                                separateGraphData.push([skill.index, skill.score]);
                                            });
                                            skillsData.push({ data: separateGraphData, label: scorecard.label, score: perfomanceGroup.score });
                                        }
                                    });
                                });
                            }
                            return skillsData;
                        }

                        function redrawChart(chart) {
                            var dataStr = "kendoChart";
                            if (chart && chart.data(dataStr)) {
                                chart.data(dataStr).redraw();
                            }
                            dataStr = "kendoRadialGauge";
                            if (chart && chart.data(dataStr)) {
                                chart.data(dataStr).redraw();
                            }
                        }

                        function swapGraph(id, value) {
                            var floatGraph = $("#floatChart" + id);
                            var gaugeGraph = $("#gaugeChart" + id);
                            var linearGraph = $("#linearChart" + id);
                            if (floatGraph && gaugeGraph && linearGraph) {
                                if (value === 1) {
                                    floatGraph.show();
                                    gaugeGraph.hide();
                                    linearGraph.hide();

                                    redrawChart(floatGraph);
                                }
                                if (value === 2) {
                                    floatGraph.hide();
                                    linearGraph.hide();
                                    gaugeGraph.show();
                                    redrawChart(gaugeGraph);
                                }
                                if (value === 3) {
                                    floatGraph.hide();
                                    gaugeGraph.hide();
                                    linearGraph.show();
                                    redrawChart(gaugeGraph);
                                }
                            }
                        }

                        function getKendoChartData(data) {
                            var result = [];
                            angular.forEach(data, function (item) {
                                result.push({ value: item[1], description: questions[item[0] - 1] });
                            });
                            return result;
                        }

                        function getColor(score, ranges) {
                            var color = '';
                            angular.forEach(ranges, function (item, index) {
                                if (item.from <= score) {
                                    if (score < item.to) {
                                        color = item.color;
                                    }
                                }
                            });

                            if (!color) {
                                if (ranges[ranges.length - 1].max <= score) {
                                    color = ranges[ranges.length - 1].color;
                                } else {
                                    color = ranges[0].color;
                                }
                            }

                            return color;
                        }

                        function findColors(plot) {
                            var c = [];
                            if (plot != null) {
                                var series = plot.getData();
                                for (var i = 0; i < series.length; i++) {
                                    var aSeries = series[i];
                                    c.push({ label: aSeries.label, color: aSeries.color, used: 0 });
                                }
                            }
                            return c;
                        }

                        function getRandomColor() {
                            var color = 'rgb(' + (Math.floor((220 - 79) * Math.random()) + 80) + ',' +
                                (Math.floor((220 - 79) * Math.random()) + 80) + ',' +
                                (Math.floor((220 - 79) * Math.random()) + 80) + ')';
                            return color;
                        }

                        function getColorSeries(rModel) {
                            var result = [];
                            result.push({ name: "score", value: getRandomColor() });
                            result.push({ name: "cScore", value: getRandomColor() });
                            result.push({ name: "bench", value: getRandomColor() });
                            result.push({ name: "goal", value: getRandomColor() });
                            result.push({ name: "cGoal", value: getRandomColor() });

                            if (rModel) {
                                if (rModel.evaluatorsProfileScorecards && rModel.evaluatorsProfileScorecards.length > 0) {
                                    for (var i = 0; i < rModel.evaluatorsProfileScorecards.length; i++) {
                                        result.push({ name: "evaluator " + i, value: getRandomColor() });
                                    }
                                }
                                if (rModel.cEvaluatorsProfileScorecards && rModel.cEvaluatorsProfileScorecards.length > 0) {
                                    for (var j = 0; j < rModel.cEvaluatorsProfileScorecards.length; j++) {
                                        result.push({ name: "cEvaluator " + j, value: getRandomColor() });
                                    }
                                }
                            }
                            return result;
                        }

                        function addColumnToMap(columns, key, title, width, center) {
                            var result = columns.filter(function (obj) {
                                return obj.field == key;
                            });

                            if (result.length == 0) {
                                if (center) {
                                    columns.push({ field: key, title: title, width: width, template: "<div style='text-align:center'>#= " + key + "#</div>" });
                                } else {
                                    columns.push({ field: key, title: title, width: width });
                                }
                            }
                            return columns;
                        }

                        function addFieldToDatasource(dataSource, key, sourceKey, text, skills, width, center) {
                            dataSource.columns = addColumnToMap(dataSource.columns, key, text, width, center);

                            angular.forEach(dataSource.data, function (arrayItem) {
                                angular.forEach(skills, function (skill) {
                                    if (arrayItem.id == skill.id) {
                                        if (skill.score && skill[sourceKey] != null) {
                                            arrayItem[key] = skill[sourceKey];
                                        } else {
                                            arrayItem[key] = "";
                                        }
                                    }
                                });
                            });
                            return dataSource;
                        }

                        $scope.getPgDetails = function (pgId) {
                            var dataSource = {
                                data: [],
                                columns: [
                                    { field: "index", title: $translate.instant('DASHBOARD_QUESTION_NUMBER'), width: "90px", template: "<div style='text-align:center'>#= index#</div>" },
                                    { field: "perfomanceGroup", title: $translate.instant('COMMON_PERFORMANCE_GROUP'), width: "150px" },
                                    { field: "skillName", title: $translate.instant('COMMON_SKILL'), width: "100px" },
                                    { field: "question", title: $translate.instant('DASHBOARD_QUESTIONS'), width: "300px" },
                                ]
                            };

                            var sourcePerfomanceGroup = null;

                            angular.forEach(reportModel.performanceGroups, function (pg) {
                                if (pg.id == pgId) {
                                    sourcePerfomanceGroup = pg;
                                }
                            });

                            if (sourcePerfomanceGroup) {

                                angular.forEach(sourcePerfomanceGroup.skills, function (skill) {
                                    var arrayItem = { id: skill.id, index: skill.index, perfomanceGroup: sourcePerfomanceGroup.name, skillName: skill.name, question: skill.questions[0].questionText };
                                    dataSource.data.push(arrayItem);
                                });

                                var scoreItems = sourcePerfomanceGroup.skills.filter(function (skill) {
                                    return skill.score && skill.score > 0;
                                });

                                if (scoreItems.length > 0) {
                                    var scoreKey = "mainScore";
                                    var mainScoreText = (!$scope.mainStageName || $scope.mainStageName == '' ? '' : $scope.mainStageName + ', ') + reportModel.profileTypeName.trim() + " Score Participant " + reportModel.label.trim();
                                    dataSource = addFieldToDatasource(dataSource, scoreKey, "score", mainScoreText, sourcePerfomanceGroup.skills, "120px", true);
                                    var commentKey = "mainComment";
                                    var mainCommentText = (!$scope.mainStageName || $scope.mainStageName == '' ? '' : $scope.mainStageName + ', ') + reportModel.profileTypeName.trim() + " Comment Participant " + reportModel.label.trim();
                                    dataSource = addFieldToDatasource(dataSource, commentKey, "comment", mainCommentText, sourcePerfomanceGroup.skills, "300px", false);
                                }

                                var cScoreItems = sourcePerfomanceGroup.skills.filter(function (skill) {
                                    return skill.cScore && skill.cScore > 0;
                                });

                                if (cScoreItems.length > 0) {
                                    var cScoreKey = "compareScore";
                                    var cScoreText = (!$scope.stageName || $scope.stageName == '' ? '' : $scope.stageName + ', ') + reportModel.cProfileTypeName.trim() + " Score Participant " + reportModel.cLabel.trim();
                                    dataSource = addFieldToDatasource(dataSource, cScoreKey, "cScore", cScoreText, sourcePerfomanceGroup.skills, "120px", true);
                                    var cCommentKey = "compareComment";
                                    var cCommentText = (!$scope.stageName || $scope.stageName == '' ? '' : $scope.stageName + ', ') + reportModel.cProfileTypeName.trim() + " Comment Participant " + reportModel.cLabel.trim();
                                    dataSource = addFieldToDatasource(dataSource, cCommentKey, "cComment", cCommentText, sourcePerfomanceGroup.skills, "300px", false);
                                }

                                if (reportModel.isShowBenchmark) {
                                    var benchSkills = sourcePerfomanceGroup.skills.filter(function (skill) {
                                        return skill.benchmark && skill.benchmark > 0;
                                    });
                                    if (benchSkills.length > 0) {
                                        dataSource = addFieldToDatasource(dataSource, "benchmark", "benchmark", "Benchmark", sourcePerfomanceGroup.skills, "100px", true);
                                    }
                                }

                                if (reportModel.isShowGoal) {
                                    var goalSkills = sourcePerfomanceGroup.skills.filter(function (skill) {
                                        return skill.goal && skill.goal > 0;
                                    });
                                    if (goalSkills.length > 0) {
                                        var goalKey = "mainGoal";
                                        var goalText = reportModel.label + " Goals";
                                        dataSource = addFieldToDatasource(dataSource, goalKey, "goal", goalText, sourcePerfomanceGroup.skills, "120px", true);
                                    }
                                }

                                if (reportModel.isShowCompareGoal) {
                                    var cGoalSkills = sourcePerfomanceGroup.skills.filter(function (skill) {
                                        return skill.cGoal && skill.cGoal > 0;
                                    });
                                    if (cGoalSkills.length > 0) {
                                        var cGoalKey = "compareGoal";
                                        var cGoalText = reportModel.cLabel + " Goals";
                                        dataSource = addFieldToDatasource(dataSource, cGoalKey, "cGoal", cGoalText, sourcePerfomanceGroup.skills, "120px", true);
                                    }
                                }

                                if (reportModel.evaluatorsProfileScorecards && reportModel.evaluatorsProfileScorecards.length > 0) {
                                    angular.forEach(reportModel.evaluatorsProfileScorecards, function (evaluatorProfileScorecard, evaluatorIndex) {
                                        angular.forEach(evaluatorProfileScorecard.performanceGroups, function (evaluatorPg) {
                                            if (evaluatorPg.id === pgId) {
                                                var eScoreItems = evaluatorPg.skills.filter(function (skill) {
                                                    return skill.score && skill.score > 0;
                                                });
                                                if (eScoreItems.length > 0) {
                                                    var evaluatorKey = "evaluator" + evaluatorIndex;
                                                    var mainEvaluatorScoreText = (!$scope.mainStageName || $scope.mainStageName == '' ? '' : $scope.mainStageName + ', ') + reportModel.profileTypeName.trim() + " Score Evaluator " + evaluatorProfileScorecard.label.trim();
                                                    dataSource = addFieldToDatasource(dataSource, evaluatorKey, "score", mainEvaluatorScoreText, evaluatorPg.skills, "120px", true);
                                                    var evaluatorCommentKey = "evaluatorComment" + evaluatorIndex;
                                                    var mainEvaluatorCommentText = (!$scope.mainStageName || $scope.mainStageName == '' ? '' : $scope.mainStageName + ', ') + reportModel.profileTypeName.trim() + " Comment Evaluator " + evaluatorProfileScorecard.label.trim();
                                                    dataSource = addFieldToDatasource(dataSource, evaluatorCommentKey, "comment", mainEvaluatorCommentText, evaluatorPg.skills, "300px", true);
                                                }
                                            }
                                        });
                                    });
                                }

                                if (reportModel.cEvaluatorsProfileScorecards && reportModel.cEvaluatorsProfileScorecards.length > 0) {
                                    angular.forEach(reportModel.cEvaluatorsProfileScorecards, function (evaluatorProfileScorecard, evaluatorIndex) {
                                        angular.forEach(evaluatorProfileScorecard.performanceGroups, function (evaluatorPg) {
                                            if (evaluatorPg.id === pgId) {
                                                var eScoreItems = evaluatorPg.skills.filter(function (skill) {
                                                    return skill.score && skill.score > 0;
                                                });
                                                if (eScoreItems.length > 0) {
                                                    var compareEvaluatorKey = "cEvaluator" + evaluatorIndex;
                                                    var compareEvaluatorScoreText = (!$scope.stageName || $scope.stageName == '' ? '' : $scope.stageName + ', ') + reportModel.cProfileTypeName.trim() + " Score Evaluator " + evaluatorProfileScorecard.label.trim();
                                                    dataSource = addFieldToDatasource(dataSource, compareEvaluatorKey, "score", compareEvaluatorScoreText, evaluatorPg.skills, "120px", true);
                                                    var compareEvaluatorCommentKey = "cEvaluatorComment" + evaluatorIndex;
                                                    var compareEvaluatorCommentText = (!$scope.stageName || $scope.stageName == '' ? '' : $scope.stageName + ', ') + reportModel.cProfileTypeName.trim() + " Comment Evaluator " + evaluatorProfileScorecard.label.trim();
                                                    dataSource = addFieldToDatasource(dataSource, compareEvaluatorCommentKey, "comment", compareEvaluatorCommentText, evaluatorPg.skills, "300px", true);
                                                }
                                            }
                                        });
                                    });
                                }

                                dialogService.showGridDialog($translate.instant('DASHBOARD_PERFORMANCE_GROUP_DETAILS') + " - " + sourcePerfomanceGroup.name, dataSource.data, dataSource.columns);
                            }
                        };

                        $scope.swapGraphMode = function (id, value) {
                            angular.forEach($scope.pgModesModel, function (pgId) {
                                if (id === pgId.id) {
                                    if (value) {
                                        $scope.pgModesModel[id].value = value;
                                    }
                                    swapGraph(id, $scope.pgModesModel[id].value);
                                }
                            });
                        };

                        $scope.spChartModeChanged = function (id) {
                            if (id > 0) {
                                $scope.kt.chartMode = id;
                                var chartmode = _.find($scope.chartModes, function (item) {
                                    return item.id == id;
                                })
                                if (chartmode) {
                                    $scope.chartModeText = chartmode.label;
                                }
                            }
                            angular.forEach($scope.pgModesModel, function (pgId, i) {
                                $scope.pgModesModel[i].value = $scope.kt.chartMode;
                                swapGraph(i, $scope.pgModesModel[i].value);
                            });
                        };

                        $scope.spPresentationModeChanged = function () {

                        }

                        $scope.init = function (rd) {
                            reportModel = rd;
                            if (reportModel && $scope.profileType == profilesTypesEnum.soft) {
                                if (reportModel.scale) {
                                    angular.forEach(reportModel.scale.scaleRanges, function (item, index) {
                                        item.from = item.min;
                                        item.to = item.max + 1;
                                    });
                                }
                                if ($scope.ngReportData.participantsId) {
                                    if ($scope.ngReportData.participantsId.length > 0) {
                                        $scope.participantId = $scope.ngReportData.participantsId[0].id;
                                    }
                                }

                                questions = [];
                                reportModel.max = reportModel.scale.scaleRanges[reportModel.scale.scaleRanges.length - 1].max;
                                if ((reportModel.strongAreas) && (reportModel.strongAreas.length > 3)) {
                                    reportModel.strongAreas = [reportModel.strongAreas[0], reportModel.strongAreas[1], reportModel.strongAreas[2]]
                                }
                                if ((reportModel.weakAreas) && (reportModel.weakAreas.length > 3)) {
                                    reportModel.weakAreas = [reportModel.weakAreas[0], reportModel.weakAreas[1], reportModel.weakAreas[2]]
                                }

                                var qIndex = 1;
                                angular.forEach(reportModel.performanceGroups, function (pg) {
                                    pg.answersData = [];
                                    pg.cAanswersData = [];
                                    pg.benchMarkData = [];
                                    pg.goalData = [];
                                    pg.cGoalData = [];
                                    pg.color = getColor(pg.score, reportModel.scale.scaleRanges);
                                    angular.forEach(pg.skills, function (pgs) {
                                        pgs.index = qIndex;
                                        qIndex++;
                                        //angular.forEach(pgs.questions, function (question) {
                                        //    questions.push([pgs.name + " - " + pgs.questions[0].description]);
                                        //});
                                        questions.push([pgs.name + " - " + pgs.questions[0].questionText]);
                                        pg.answersData.push([pgs.name + " - " + pgs.description, pgs.score, pgs.index]);
                                        pg.cAanswersData.push([pgs.name + " - " + pgs.description, pgs.cScore, pgs.index]);
                                        pg.benchMarkData.push([pgs.name + " - " + pgs.description, pgs.bScore, pgs.index]);
                                        pg.goalData.push([pgs.name + " - " + pgs.description, pgs.goal, pgs.index]);
                                        pg.cGoalData.push([pgs.name + " - " + pgs.description, pgs.cGoal, pgs.index]);
                                    });
                                    pg.questions = pg.skills;
                                });

                                var kpiItems = $scope.ngKpiItems;
                                var benchMarkResults = $scope.ngBenchMarkResults;
                                var users = $scope.ngUsers;

                                $scope.load();
                            }
                            else if (reportModel && $scope.profileType == profilesTypesEnum.knowledgetest) {
                                $scope.resultTypeChanged();
                            }
                        };

                        $scope.init($scope.ngReportData);



                        function drawPerfomanceGraph(container, elementId, perfomanceGroup, colorSeries, startHtml, endHtml, width, height) {
                            var avg = perfomanceGroup.score;
                            var prc = percentage(reportModel.max, avg);

                            var avgc = 0;
                            var prcc = 0;

                            var benchmarkavg = 0;
                            var benchmarkprc = 0;


                            var mainEvalutorAVG = 0;
                            var mainEvalutorPRC = 0;

                            var compareEvaluatorAVG = 0;
                            var compareEvaluatorPRC = 0;

                            var answersData = perfomanceGroup.answersData;
                            var benchMarkData = perfomanceGroup.benchMarkData;
                            var goalsData = perfomanceGroup.goalData;
                            var cGoalsData = perfomanceGroup.cGoalData;
                            var compareData = [];
                            if (reportModel.isCompare) {
                                avgc = perfomanceGroup.cScore;
                                prcc = percentage(reportModel.max, avgc);
                                compareData = perfomanceGroup.cAanswersData;
                            }

                            //compare gauges
                            if (reportModel.isCompare) {
                                $("#gauge_total_score_compare").show();
                                $("#gauge_total_strong_compare").show();
                                $("#gauge_total_weak_compare").show();
                            } else {
                                $("#gauge_total_score_compare").hide();
                                $("#gauge_total_strong_compare").hide();
                                $("#gauge_total_weak_compare").hide();
                            }

                            //layout 
                            var graphElemHtml = "";

                            if (startHtml) {
                                graphElemHtml += startHtml;
                            }
                            graphElemHtml += "<div class='GraphListImg' ng-show='showGraph'>";
                            //graphElemHtml += "<div class='legend-container' id='legend-container" + elementId.toString() + "' style='font-size: 12px; text-align: center;'></div>";
                            graphElemHtml += "<div style='display:block'>";
                            graphElemHtml += "<div id='floatChart" + elementId.toString() + "' class='floatChart'></div>";
                            graphElemHtml += "<div id='gaugeChart" + elementId.toString() + "' class='floatChart'></div>";
                            graphElemHtml += "<div id='linearChart" + elementId.toString() + "' class='floatChart'></div>";
                            graphElemHtml += "</div>";
                            graphElemHtml += "<div>";

                            graphElemHtml += "<div class='participants-charts text-center'>" +
                                "<div class='btn-group'>" +
                                //" <button class='btn dropdown-toggle  btn-cstm' type='button' data-toggle='dropdown' aria-expanded='true'>Graph" +
                                //"         <i class='fa fa-angle-down'></i>" +
                                //" </button>" +

                                //" <ul class='dropdown-menu' role='menu'>" +
                                //"     <li ng-click='swapGraphMode(" + elementId + ",{{obj.id}})' ng-repeat='obj in chartModes'>" +
                                //"         <a href='javascript:;'> {{obj.label}} </a>" +
                                //"      </li>" +
                                //" </ul>" +
                                "</div>" +

                                "<button ng-click='getPgDetails(" + perfomanceGroup.id + ")' class='btn dropdown-toggle btn-cstm' type = 'button' data-toggle='dropdown' aria-expanded='false'> " +
                                "Details" +
                                "</button > " +
                                "</div> "


                            //graphElemHtml += "<table><tr><td><select class='form-control details-select' name='graphMode' ng-model='pgModesModel[" + elementId + "].value' ng-change='swapGraphMode(" + elementId + ")' ng-options='obj.id as obj.label for obj in chartModes'></select></td><td><button ng-click='getPgDetails(" + perfomanceGroup.id + ")' class='details-btn'>" + $translate.instant('COMMON_DETAILS') + "</button></td></tr></table>";

                            graphElemHtml += "</div>";
                            graphElemHtml += "</div>";
                            var mainLegendPostfix = " (" + (!$scope.mainStageName || $scope.mainStageName == '' ? '' : $scope.mainStageName + ', ') + reportModel.profileTypeName + ")";
                            graphElemHtml += "<section class='portlet-light'><div class='row'><div class='col-lg-12 col-md-12 col-sm-12 col-xs-12'>" +
                                "<span class='caption-subject box-title'>" + perfomanceGroup.name + "</span> &nbsp;" +
                                "</div> <div class='col-lg-12'>" +
                                "<p class='ph-dark'>" + perfomanceGroup.description + "</p>" +
                                "</div>" +
                                "<div class='col-lg-12'>" +
                                "<h5 class='caption-subject font-dark bold uppercase heding-bg'> " + reportModel.label + mainLegendPostfix + "</h5>" +
                                "<span class='icon-success pull-right'>" + avg + "<i class='fa fa-arrow-circle-up hide' aria-hidden='true'> </i></span>" +
                                "</div>";
                            graphElemHtml += "<div class='col-lg-12'>" +
                                "<div id='PG" + elementId.toString() + "' class='progress mt-5'>" +
                                "<div class='progress-bar progress-bar-striped bg-warning progress-bar-animated' role='progressbar' aria-valuenow='76' aria-valuemin='0' aria-valuemax='100' style='width: 76%'>76%</div>" +
                                "</div>" +
                                "</div>";
                            if (reportModel.isShowBenchmark) {
                                graphElemHtml += "<div class='col-lg-12'>" +
                                    "<h5 class='caption-subject font-dark bold uppercase heding-bg'>" + $translate.instant('DASHBOARD_BENCH_MARK') + "</h5>" +
                                    " <span class='icon-success pull-right'>" + benchmarkavg + " <i class='fa fa-arrow-circle-down hide' aria-hidden='true'> </i></span>" +
                                    "</div>";
                                graphElemHtml += "<div class='col-lg-12'>" +
                                    "<div id='PGB" + elementId.toString() + "' class='progress mt-5'>" +
                                    "<div class='progress-bar progress-bar-striped bg-warning progress-bar-animated' role='progressbar' aria-valuenow='76' aria-valuemin='0' aria-valuemax='100' style='width: 76%'>76%</div>" +
                                    "</div>" +
                                    "</div>";

                            }
                            if (perfomanceGroup.cScore && reportModel.cLabel != "") {
                                var compareLegendPostfix = " (" + (!$scope.stageName || $scope.stageName == '' ? '' : $scope.stageName + ', ') + reportModel.cProfileTypeName + ")";
                                graphElemHtml += "<div class='col-lg-12'>" +
                                    "<h5 class='caption-subject font-dark bold uppercase heding-bg'>" + reportModel.cLabel + compareLegendPostfix + "</h5>" +
                                    "<span class='icon-success pull-right'>" + avgc + " <i class='fa fa-arrow-circle-down hide' aria-hidden='true'> </i></span>" +
                                    "</div>";
                                graphElemHtml += "<div class='col-lg-12'>" +
                                    "<div id='PGC" + elementId.toString() + "' class='progress mt-5'>" +
                                    "<div class='progress-bar progress-bar-striped bg-warning progress-bar-animated' role='progressbar' aria-valuenow='76' aria-valuemin='0' aria-valuemax='100' style='width: 76%'>76%</div>" +
                                    "</div>" +
                                    "</div >";
                            }
                            if (reportModel.evaluatorsProfileScorecards) {
                                if (reportModel.evaluatorsProfileScorecards.length > 0) {
                                    if (reportModel.evaluatorsProfileScorecards[0].label) {
                                        var mainLegendPostfix = " (" + (!$scope.mainStageName || $scope.mainStageName == '' ? '' : $scope.mainStageName + ', ') + reportModel.profileTypeName + ")";

                                        graphElemHtml += "<div class='col-lg-12'>" +
                                            "<h5 class='caption-subject font-dark bold uppercase heding-bg'>" + reportModel.evaluatorsProfileScorecards[0].label + mainLegendPostfix + "</h5>" +
                                            "<span class='icon-success pull-right'>" + mainEvalutorAVG + " <i class='fa fa-arrow-circle-down hide' aria-hidden='true'> </i></span>"+
                                            "</div>";

                                        graphElemHtml += "<div class='col-lg-12'>" +
                                            "<div id='PGE" + elementId.toString() + "' class='progress mt-5'>" +
                                            "<div class='progress-bar progress-bar-striped bg-warning progress-bar-animated' role='progressbar' aria-valuenow='76' aria-valuemin='0' aria-valuemax='100' style='width: 76%'>76%</div>" +
                                            "</div>" +
                                            "</div >";
                                    }
                                }
                            }
                            if (reportModel.cEvaluatorsProfileScorecards) {
                                if (reportModel.cEvaluatorsProfileScorecards.length > 0) {
                                    if (reportModel.cEvaluatorsProfileScorecards[0].label) {
                                        var compareLegendPostfix = " (" + (!$scope.stageName || $scope.stageName == '' ? '' : $scope.stageName + ', ') + reportModel.cProfileTypeName + ")";


                                        graphElemHtml += "<div class='col-lg-12'>" +
                                            "<h5 class='caption-subject font-dark bold uppercase heding-bg'>" + reportModel.cEvaluatorsProfileScorecards[0].label + compareLegendPostfix + " </h5>" +
                                            "</div>";

                                        graphElemHtml += "<div class='col-lg-12'>" +
                                            "<div id='PGCE" + elementId.toString() + "' class='progress mt-5'>" +
                                            "<div class='progress-bar progress-bar-striped bg-warning progress-bar-animated' role='progressbar' aria-valuenow='76' aria-valuemin='0' aria-valuemax='100' style='width: 76%'>76%</div>" +
                                            "</div>" +
                                            "</div >";

                                    }
                                }
                            }


                            //graphElemHtml += "<h3 class='pgName' ng-show='showGraph'>" + perfomanceGroup.name + "</h3>";
                            //graphElemHtml += "<div class='GraphListTxt' ng-show='showGraph' >";
                            //graphElemHtml += "<h4 class='pgDescription' style='height:50px;'>" + perfomanceGroup.description + "</h4>";
                            //var mainLegendPostfix = " (" + (!$scope.mainStageName || $scope.mainStageName == '' ? '' : $scope.mainStageName + ', ') + reportModel.profileTypeName + ")";
                            //graphElemHtml += "<h4 class=''>" + $translate.instant('COMMON_PARTICIPANTS') + ": " + reportModel.label + mainLegendPostfix + "</h4>";
                            //graphElemHtml += "<div class='GraphLiProc width80Perc FloatLeft'>";

                            //graphElemHtml += "<div id='PG" + elementId.toString() + "' class='GraphLiProc FloatLeft'></div>";
                            //graphElemHtml += "</div>";
                            //graphElemHtml += "<div class='GraphLiProc width20Perc FloatLeft'>";
                            //graphElemHtml += "<span class='mArLeft015'>" + avg + "</span>";
                            //graphElemHtml += "</div>";

                            //if (reportModel.isShowBenchmark) {
                            //    graphElemHtml += "<div class='GraphLiProc width80Perc FloatLeft' ng-show='showGraph'>";
                            //    graphElemHtml += "<div class=''>" + $translate.instant('DASHBOARD_BENCH_MARK') + "</div>";
                            //    graphElemHtml += "<div id='PGB" + elementId.toString() + "' class='GraphLiProc FloatLeft'></div>";
                            //    graphElemHtml += "</div>";
                            //    graphElemHtml += "<div class='GraphLiProc width20Perc FloatLeft' style='margin-top:0px;'>";
                            //    graphElemHtml += "<span style='float: left;' class='mArLeft015 benchmarkavg" + elementId.toString() + "' >" + benchmarkavg + "</span>";
                            //    graphElemHtml += "</div>";
                            //}
                            //if (perfomanceGroup.cScore && reportModel.cLabel != "") {
                            //    var compareLegendPostfix = " (" + (!$scope.stageName || $scope.stageName == '' ? '' : $scope.stageName + ', ') + reportModel.cProfileTypeName + ")";
                            //    graphElemHtml += "<h4 class=''>" + $translate.instant('COMMON_PARTICIPANT') + ": " + reportModel.cLabel + compareLegendPostfix + "</h4>";
                            //    graphElemHtml += "<div class='GraphLiProc width80Perc FloatLeft' ng-show='showGraph'>";

                            //    graphElemHtml += "<div id='PGC" + elementId.toString() + "' class='GraphLiProc FloatLeft'></div>";
                            //    graphElemHtml += "</div>";
                            //    graphElemHtml += "<div class='GraphLiProc width20Perc FloatLeft' style='margin-top:0px;'>";
                            //    graphElemHtml += "<span style='float: left;' class='mArLeft015 avgc" + elementId.toString() + "' >" + avgc + "</span>";
                            //    graphElemHtml += "</div>";
                            //}
                            //if (reportModel.evaluatorsProfileScorecards) {
                            //    if (reportModel.evaluatorsProfileScorecards.length > 0) {
                            //        if (reportModel.evaluatorsProfileScorecards[0].label) {
                            //            var mainLegendPostfix = " (" + (!$scope.mainStageName || $scope.mainStageName == '' ? '' : $scope.mainStageName + ', ') + reportModel.profileTypeName + ")";
                            //            graphElemHtml += "<h4 class=''>" + $translate.instant('COMMON_MAIN_EVALUATOR') + ": " + reportModel.evaluatorsProfileScorecards[0].label + mainLegendPostfix + "</h4>";
                            //            graphElemHtml += "<div class='GraphLiProc width80Perc FloatLeft' ng-show='showGraph'>";

                            //            graphElemHtml += "<div id='PGE" + elementId.toString() + "' class='GraphLiProc FloatLeft'></div>";
                            //            graphElemHtml += "</div>";
                            //            graphElemHtml += "<div class='GraphLiProc width20Perc FloatLeft' style='margin-top:0px;'>";
                            //            graphElemHtml += "<span class='mArLeft015 FloatLeft mainEvalutorAVG" + elementId.toString() + "' >" + mainEvalutorAVG + "</span>";
                            //            graphElemHtml += "</div>";
                            //        }
                            //    }
                            //}
                            //if (reportModel.cEvaluatorsProfileScorecards) {
                            //    if (reportModel.cEvaluatorsProfileScorecards.length > 0) {
                            //        if (reportModel.cEvaluatorsProfileScorecards[0].label) {
                            //            var compareLegendPostfix = " (" + (!$scope.stageName || $scope.stageName == '' ? '' : $scope.stageName + ', ') + reportModel.cProfileTypeName + ")";
                            //            graphElemHtml += "<h4 class=''>" + $translate.instant('COMMON_EVALUATOR') + ": " + reportModel.cEvaluatorsProfileScorecards[0].label + compareLegendPostfix + "</h4>";
                            //            graphElemHtml += "<div class='GraphLiProc width80Perc FloatLeft' ng-show='showGraph'>";

                            //            graphElemHtml += "<div id='PGCE" + elementId.toString() + "' class='GraphLiProc FloatLeft'></div>";
                            //            graphElemHtml += "</div>";
                            //            graphElemHtml += "<div class='GraphLiProc width20Perc FloatLeft' style='margin-top:0px;'>";
                            //            graphElemHtml += "<span class='mArLeft015 compareEvaluatorAVG" + elementId.toString() + "' ></span>";
                            //            graphElemHtml += "</div>";
                            //        }
                            //    }
                            //}
                            graphElemHtml += "</section ></div>";

                            if (endHtml) {
                                graphElemHtml += endHtml;
                            }

                            var linkFn = $compile(graphElemHtml);
                            var content = linkFn($scope);
                            container.append(content);

                            var progressBar;




                            //$("#resultLegendId").text(reportModel.label);

                            if (reportModel.isShowBenchmark) {
                                $(".benchmarkLegend").show();
                                $("#banchmarkLegendId").show();
                            } else {
                                $(".benchmarkLegend").hide();
                                $("#banchmarkLegendId").hide();
                            }

                            if (reportModel.isCompare) {
                                $("#compareLegendId").text(reportModel.cLabel);
                                $("#compareLegendId").show();
                                $("#compareLegendMarker").show();
                            } else {
                                $("#compareLegendId").hide();
                                $("#compareLegendMarker").hide();
                            }

                            var scores = [],
                                compare = [],
                                benchMark = [],
                                goals = [],
                                cGoals = [],
                                ticksData = [];

                            for (i = 1; i <= answersData.length; i++) {
                                scores.push([answersData[i - 1][2], answersData[i - 1][1]]);
                                if (reportModel.isCompare) {
                                    compare.push([compareData[i - 1][2], compareData[i - 1][1]]);
                                }
                                if (reportModel.isShowBenchmark) {
                                    benchMark.push([benchMarkData[i - 1][2], benchMarkData[i - 1][1]]);
                                }
                                if (reportModel.isShowGoal) {
                                    goals.push([goalsData[i - 1][2], goalsData[i - 1][1]]);
                                }
                                if (reportModel.isShowCompareGoal) {
                                    cGoals.push([cGoalsData[i - 1][2], cGoalsData[i - 1][1]]);
                                }
                                ticksData.push(answersData[i - 1][2]);
                            }

                            //Main Evaluators data for graphs 
                            var evaluatorsSkillsForPg = getSkillsFromScorecards(perfomanceGroup.id, reportModel.evaluatorsProfileScorecards);

                            //Type of Profiles (options) data for graphs
                            //var extraSkillsForPg = getSkillsFromScorecards(perfomanceGroup.id, reportModel.extraProfileScorecards);

                            //CompareTo Evaluators
                            var cEvaluatorsSkillsForPg = getSkillsFromScorecards(perfomanceGroup.id, reportModel.cEvaluatorsProfileScorecards);

                            //Type Of Profiles for Evaluators
                            //var cExtraSkillsForPg = getSkillsFromScorecards(perfomanceGroup.id, reportModel.cExtraProfileScorecards);

                            if (height && height > 0) {
                                $("#floatChart" + elementId.toString()).height(height);
                                $("#gaugeChart" + elementId.toString()).height(height);
                                $("#linearChart" + elementId.toString()).height(height);
                            }
                            if (width && width > 0) {
                                $("#floatChart" + elementId.toString()).width(width);
                                $("#gaugeChart" + elementId.toString()).width(width);
                                $("#linearChart" + elementId.toString()).width(width);
                            }

                            $("#legend-container td").remove();

                            var kendoSeries = [];
                            var kendoPointers = [];

                            var mainLegendPostfix = " (" + (!$scope.mainStageName || $scope.mainStageName == '' ? '' : $scope.mainStageName + ', ') + reportModel.profileTypeName + ")";
                            var compareLegendPostfix = " (" + (!$scope.stageName || $scope.stageName == '' ? '' : $scope.stageName + ', ') + reportModel.cProfileTypeName + ")";

                            //Scores of Main Participant\s
                            if (perfomanceGroup && perfomanceGroup.score) {
                                var pointscores = [];
                                var scoreColor = null;
                                angular.forEach(colorSeries, function (color) {
                                    if (color.name == "score") {
                                        scoreColor = color.value;
                                        gaugeSeriesColors.main = scoreColor;
                                    }
                                });
                                var graphScores = getKendoChartData(scores);
                                kendoSeries.push({ name: reportModel.label, data: graphScores, color: scoreColor });
                                if (perfomanceGroup.score && perfomanceGroup.score > 0) {
                                    pointscores.push(perfomanceGroup.score);
                                    kendoPointers.push({ value: perfomanceGroup.score, color: scoreColor, label: $translate.instant('COMMON_PARTICIPANTS') + ": " + reportModel.label + mainLegendPostfix });
                                }
                                if (pointscores.length > 0) {
                                    var totalScores = _.sum(pointscores);
                                    avg = totalScores / pointscores.length;
                                    prc = percentage(reportModel.max, avg);

                                    $("#PG" + elementId.toString() + ".progress").find(".progress-bar").width(prc + '%')
                                    $("#PG" + elementId.toString() + ".progress").find(".progress-bar").text(prc + '%')
                                    //var progressBar;
                                    //progressBar = new ProgressBar("PG" + elementId.toString(), { 'width': '100%', 'height': '35px' });
                                    //var progressBarItem = {};
                                    //progressBarItem[ProgressBar.OPTION_NAME.ITEM_ID] = "item1";
                                    //progressBarItem[ProgressBar.OPTION_NAME.COLOR_ID] = ProgressBar.OPTION_VALUE.COLOR_ID.CUSTOM;
                                    //progressBarItem.color = getColor(avg, reportModel.scale.scaleRanges);
                                    //progressBar.createItem(progressBarItem);
                                    //progressBar.setPercent(prc);
                                }

                            }
                            else {
                                var percentage0 = 0;
                                $("#PG" + elementId.toString() + ".progress").find(".progress-bar").width(percentage0 + '%')
                                $("#PG" + elementId.toString() + ".progress").find(".progress-bar").text(percentage0 + '%')
                                //var progressBar;
                                //progressBar = new ProgressBar("PG" + elementId.toString(), { 'width': '100%', 'height': '35px' });
                                //var progressBarItem = {};
                                //progressBarItem[ProgressBar.OPTION_NAME.ITEM_ID] = "item1";
                                //progressBarItem[ProgressBar.OPTION_NAME.COLOR_ID] = ProgressBar.OPTION_VALUE.COLOR_ID.CUSTOM;
                                //progressBarItem.color = getColor(0, reportModel.scale.scaleRanges);
                                //progressBar.createItem(progressBarItem);
                                //progressBar.setPercent(0);
                            }

                            //Scores of Compare To Participant\s
                            if (perfomanceGroup && perfomanceGroup.cScore && reportModel.cLabel != "") {
                                var pointscores = [];
                                var cScoreColor = null;
                                angular.forEach(colorSeries, function (color) {
                                    if (color.name == "cScore") {
                                        cScoreColor = color.value;
                                        gaugeSeriesColors.compare = cScoreColor;

                                    }
                                });
                                var graphCscores = getKendoChartData(compare);
                                kendoSeries.push({ name: reportModel.cLabel, data: graphCscores, color: cScoreColor });
                                if (perfomanceGroup.cScore && perfomanceGroup.cScore > 0) {
                                    pointscores.push(perfomanceGroup.cScore);
                                    kendoPointers.push({ value: perfomanceGroup.cScore, color: cScoreColor, label: $translate.instant('COMMON_PARTICIPANTS') + ": " + reportModel.cLabel + compareLegendPostfix });
                                }
                                if (pointscores.length > 0) {
                                    var totalScores = _.sum(pointscores);
                                    avgc = totalScores / pointscores.length;
                                    prcc = percentage(reportModel.max, avgc);


                                    $("#PGC" + elementId.toString() + ".progress").find(".progress-bar").width(prcc + '%')
                                    $("#PGC" + elementId.toString() + ".progress").find(".progress-bar").text(prcc + '%')

                                    //var progressBar;
                                    //progressBar = new ProgressBar("PGC" + elementId.toString(), { 'width': '100%', 'height': '35px' });
                                    //var progressBarItem = {};
                                    //progressBarItem[ProgressBar.OPTION_NAME.ITEM_ID] = "item1";
                                    //progressBarItem[ProgressBar.OPTION_NAME.COLOR_ID] = ProgressBar.OPTION_VALUE.COLOR_ID.CUSTOM;
                                    //progressBarItem.color = getColor(avgc, reportModel.scale.scaleRanges);
                                    ////progressBar.createItem(progressBarItem);
                                    //progressBar.createItem(progressBarItem);
                                    //progressBar.setPercent(prcc);
                                    $(".avgc" + elementId).html(avgc);


                                    var diffPercentage = setDiffrencePercentage(avg, avgc, reportModel.max); //parseFloat((((avgc - avg) / reportModel.max) * 100)).toFixed(1);

                                    var graphElemHtml = "";
                                    if (avg > 0) {
                                        if (avgc > avg) {
                                            graphElemHtml += "<img  class='mArLeft015' src='images/dashboard/top-arrow-green.png' style='width:auto;height:32px;float:left;margin-left: 5px;'>";
                                        } else if (avg == avgc) {
                                            graphElemHtml += "<img class='mArLeft015' src='images/dashboard/min-icon-big.png' style='width:auto;height:32px;float:left;margin-left: 5px;'>";
                                        } else {
                                            graphElemHtml += "<img  class='mArLeft015' src='images/dashboard/botm-arrow-red.png' style='width:auto;height:32px;float:left;margin-left: 5px;'>";
                                        }
                                    }
                                    graphElemHtml += diffPercentage;
                                    $(".avgc" + elementId).after(graphElemHtml);
                                }
                                else {

                                    var percentage0 = 0;
                                    $("#PGC" + elementId.toString() + ".progress").find(".progress-bar").width(percentage0 + '%')
                                    $("#PGC" + elementId.toString() + ".progress").find(".progress-bar").text(percentage0 + '%')
                                    //progressBar = new ProgressBar("PGC" + elementId.toString(), { 'width': '100%', 'height': '35px' });
                                    //progressBarItem = {};
                                    //progressBarItem[ProgressBar.OPTION_NAME.ITEM_ID] = "item1";
                                    //progressBarItem[ProgressBar.OPTION_NAME.COLOR_ID] = ProgressBar.OPTION_VALUE.COLOR_ID.CUSTOM;
                                    //progressBarItem.color = getColor(0, reportModel.scale.scaleRanges);
                                    ////progressBar.createItem(progressBarItem);
                                    //progressBar.createItem(progressBarItem);
                                    //progressBar.setPercent(0);
                                    //$(".avgc" + elementId).html("0");
                                }

                            }
                            else {
                                if ($("#PGC" + elementId).length > 0) {
                                    //progressBar = new ProgressBar("PGC" + elementId.toString(), { 'width': '100%', 'height': '35px' });
                                    //progressBarItem = {};
                                    //progressBarItem[ProgressBar.OPTION_NAME.ITEM_ID] = "item1";
                                    //progressBarItem[ProgressBar.OPTION_NAME.COLOR_ID] = ProgressBar.OPTION_VALUE.COLOR_ID.CUSTOM;
                                    //progressBarItem.color = getColor(0, reportModel.scale.scaleRanges);
                                    ////progressBar.createItem(progressBarItem);
                                    //progressBar.createItem(progressBarItem);
                                    //progressBar.setPercent(0);
                                    //$(".avgc" + elementId).html("0");

                                    var percentage0 = 0;
                                    $("#PGC" + elementId.toString() + ".progress").find(".progress-bar").width(percentage0 + '%')
                                    $("#PGC" + elementId.toString() + ".progress").find(".progress-bar").text(percentage0 + '%')

                                }
                            }

                            //Scores of Benchmark
                            if (reportModel.isShowBenchmark) {
                                var benchColor = null;
                                var pointscores = [];
                                angular.forEach(colorSeries, function (color) {
                                    if (color.name == "bench") {
                                        benchColor = color.value;
                                        gaugeSeriesColors.benchmark = benchColor;
                                    }
                                });
                                var benchScores = getKendoChartData(benchMark);
                                kendoSeries.push({ name: "Benchmark", data: benchScores, color: benchColor });
                                if (perfomanceGroup.benchmark && perfomanceGroup.benchmark > 0) {
                                    pointscores.push(perfomanceGroup.benchmark);
                                    kendoPointers.push({ value: perfomanceGroup.benchmark, color: benchColor, label: $translate.instant('DASHBOARD_BENCHMARK') });
                                }

                                if (pointscores.length > 0) {
                                    var totalScores = _.sum(pointscores);
                                    benchmarkavg = totalScores / pointscores.length;
                                    benchmarkprc = percentage(reportModel.max, benchmarkavg);

                                    $("#PGB" + elementId.toString() + ".progress").find(".progress-bar").width(benchmarkprc + '%')
                                    $("#PGB" + elementId.toString() + ".progress").find(".progress-bar").text(benchmarkprc + '%')


                                    //progressBar = new ProgressBar("PGB" + elementId.toString(), { 'width': '100%', 'height': '35px' });
                                    //progressBarItem = {};
                                    //progressBarItem[ProgressBar.OPTION_NAME.ITEM_ID] = "item1";
                                    //progressBarItem[ProgressBar.OPTION_NAME.COLOR_ID] = ProgressBar.OPTION_VALUE.COLOR_ID.CUSTOM;
                                    //progressBarItem.color = getColor(benchmarkavg, reportModel.scale.scaleRanges);
                                    ////progressBar.createItem(progressBarItem);
                                    //progressBar.createItem(progressBarItem);
                                    //progressBar.setPercent(benchmarkprc);
                                    //$(".benchmarkavg" + elementId).html(benchmarkavg);
                                    //var diffPercentage = parseFloat((((benchmarkavg - avg) / reportModel.max) * 100)).toFixed(1);

                                    var graphElemHtml = "";
                                    if (avg > 0) {
                                        if (benchmarkavg > avg) {
                                            graphElemHtml += "<img  class='mArLeft015' src='images/dashboard/top-arrow-green.png' style='width:auto;height:32px;float:left;margin-left: 5px;'>";
                                        } else if (avg == benchmarkavg) {
                                            graphElemHtml += "<img  class='mArLeft015'src='images/dashboard/min-icon-big.png' style='width:auto;height:32px;float:left;margin-left: 5px;'>";
                                        } else {
                                            graphElemHtml += "<img  class='mArLeft015' src='images/dashboard/botm-arrow-red.png' style='width:auto;height:32px;float:left;margin-left: 5px;'>";
                                        }
                                    }
                                    var diffPercentage = setDiffrencePercentage(avg, benchmarkavg, reportModel.max);
                                    graphElemHtml += diffPercentage;
                                    $(".benchmarkavg" + elementId).after(graphElemHtml);
                                }
                                else {
                                    var percentage0 = 0;
                                    $("#PGB" + elementId.toString() + ".progress").find(".progress-bar").width(percentage0 + '%')
                                    $("#PGB" + elementId.toString() + ".progress").find(".progress-bar").text(percentage0 + '%')

                                    //progressBar = new ProgressBar("PGB" + elementId.toString(), { 'width': '100%', 'height': '35px' });
                                    //progressBarItem = {};
                                    //progressBarItem[ProgressBar.OPTION_NAME.ITEM_ID] = "item1";
                                    //progressBarItem[ProgressBar.OPTION_NAME.COLOR_ID] = ProgressBar.OPTION_VALUE.COLOR_ID.CUSTOM;
                                    //progressBarItem.color = getColor(0, reportModel.scale.scaleRanges);
                                    ////progressBar.createItem(progressBarItem);
                                    //progressBar.createItem(progressBarItem);
                                    //progressBar.setPercent(0);
                                    //$(".benchmarkavg" + elementId).html("0");
                                }
                            }

                            //Scores of Goals for Main Participant\s
                            if (reportModel.isShowGoal) {
                                var goalColor = null;
                                angular.forEach(colorSeries, function (color) {
                                    if (color.name == "goal") {
                                        goalColor = color.value;
                                        gaugeSeriesColors.main = goalColor;
                                    }
                                });
                                var goalScores = getKendoChartData(goals);
                                kendoSeries.push({ name: reportModel.label + " Goals", data: goalScores, color: goalColor });
                                if (perfomanceGroup.goal && perfomanceGroup.goal > 0) {
                                    kendoPointers.push({
                                        value: perfomanceGroup.goal, color: goalColor, label: $translate.instant('COMMON_MAIN_PARTICIPANT') + ": " + reportModel.label + " " + $translate.instant('DASHBOARD_GOALS')
                                    });
                                }
                            }

                            //Scores of Goals for Compare To Participant\s
                            if (reportModel.isShowCompareGoal && perfomanceGroup.cGoal) {
                                var cGoalColor = null;
                                angular.forEach(colorSeries, function (color) {
                                    if (color.name == "cGoal") {
                                        cGoalColor = color.value;
                                        gaugeSeriesColors.compare = cGoalColor;
                                    }
                                });
                                var cGoalScores = getKendoChartData(cGoals);
                                kendoSeries.push({ name: reportModel.cLabel + " Goals", data: cGoalScores, color: cGoalColor });
                                if (perfomanceGroup.cGoal && perfomanceGroup.cGoal > 0) {
                                    kendoPointers.push({ value: perfomanceGroup.cGoal, color: cGoalColor, label: $translate.instant('COMMON_PARTICIPANT') + ": " + reportModel.cLabel + " " + $translate.instant('DASHBOARD_GOALS') });
                                }
                            }

                            //Scores for Evaluators of Main Participant\s
                            if (evaluatorsSkillsForPg && evaluatorsSkillsForPg.length > 0) {
                                var pointscores = [];
                                angular.forEach(evaluatorsSkillsForPg, function (evaluatorDataForGraph, index) {
                                    var evaluatorColor = null;
                                    angular.forEach(colorSeries, function (color) {
                                        if (color.name == "evaluator " + index) {
                                            evaluatorColor = color.value;
                                            gaugeSeriesColors.mainEvaluator = evaluatorColor;
                                        }
                                    });
                                    var evaluatorScores = getKendoChartData(evaluatorDataForGraph.data);
                                    kendoSeries.push({ name: evaluatorDataForGraph.label, data: evaluatorScores, color: evaluatorColor });
                                    if (evaluatorDataForGraph.score && evaluatorDataForGraph.score > 0) {
                                        pointscores.push(evaluatorDataForGraph.score);
                                        kendoPointers.push({ value: evaluatorDataForGraph.score, color: evaluatorColor, label: $translate.instant('COMMON_MAIN_EVALUATOR') + " :" + evaluatorDataForGraph.label + mainLegendPostfix });
                                    }
                                });
                                if (pointscores.length > 0) {
                                    var totalScores = _.sum(pointscores);
                                    mainEvalutorAVG = totalScores / pointscores.length;
                                    mainEvalutorPRC = percentage(reportModel.max, mainEvalutorAVG);
                                    $("#PGE" + elementId.toString() + ".progress").find(".progress-bar").width(mainEvalutorPRC + '%')
                                    $("#PGE" + elementId.toString() + ".progress").find(".progress-bar").text(mainEvalutorPRC + '%')


                                    //progressBar = new ProgressBar("PGE" + elementId.toString(), { 'width': '100%', 'height': '35px' });
                                    //progressBarItem = {};
                                    //progressBarItem[ProgressBar.OPTION_NAME.ITEM_ID] = "item1";
                                    //progressBarItem[ProgressBar.OPTION_NAME.COLOR_ID] = ProgressBar.OPTION_VALUE.COLOR_ID.CUSTOM;
                                    //progressBarItem.color = getColor(mainEvalutorAVG, reportModel.scale.scaleRanges);
                                    //progressBar.createItem(progressBarItem);
                                    //progressBar.setPercent(mainEvalutorPRC);
                                    //$(".mainEvalutorAVG" + elementId).html(mainEvalutorAVG);

                                    var graphElemHtml = "";
                                    if (avg > 0) {
                                        if (mainEvalutorAVG > avg) {
                                            graphElemHtml += "<img  class='mArLeft015' src='images/dashboard/top-arrow-green.png' style='width:auto;height:32px;float:left;margin-left: 5px;'>";
                                        } else if (avg == mainEvalutorAVG) {
                                            graphElemHtml += "<img  class='mArLeft015' src='images/dashboard/min-icon-big.png' style='width:auto;height:32px;float:left;margin-left: 5px;'>";
                                        } else {
                                            graphElemHtml += "<img   class='mArLeft015' src='images/dashboard/botm-arrow-red.png' style='width:auto;height:32px;float:left;margin-left: 5px;'>";
                                        }
                                    }
                                    var diffPercentage = setDiffrencePercentage(avg, mainEvalutorAVG, reportModel.max);
                                    graphElemHtml += diffPercentage;

                                    $(".mainEvalutorAVG" + elementId).after(graphElemHtml);
                                }
                                else {
                                    if (reportModel.profileTypeName == "Agreed Final KPI") {
                                        $("#PGE" + elementId).parent(".GraphLiProc").hide();
                                        $(".mainEvalutorAVG" + elementId).parent(".GraphLiProc").hide();
                                        $(".PGEIndicator" + elementId).hide();
                                    }
                                    else {
                                        $("#PGE" + elementId.toString() + ".progress").find(".progress-bar").width(mainEvalutorPRC + '%')
                                        $("#PGE" + elementId.toString() + ".progress").find(".progress-bar").text(mainEvalutorPRC + '%')
                                        //progressBar = new ProgressBar("PGE" + elementId.toString(), { 'width': '100%', 'height': '35px' });
                                        //progressBarItem = {};
                                        //progressBarItem[ProgressBar.OPTION_NAME.ITEM_ID] = "item1";
                                        //progressBarItem[ProgressBar.OPTION_NAME.COLOR_ID] = ProgressBar.OPTION_VALUE.COLOR_ID.CUSTOM;
                                        //progressBarItem.color = getColor(mainEvalutorAVG, reportModel.scale.scaleRanges);
                                        ////progressBar.createItem(progressBarItem);
                                        //progressBar.createItem(progressBarItem);
                                        //progressBar.setPercent(mainEvalutorPRC);
                                        //$(".mainEvalutorAVG" + elementId).html(mainEvalutorAVG);

                                        var graphElemHtml = "";
                                        if (avg > 0) {
                                            if (mainEvalutorAVG > avg) {
                                                graphElemHtml += "<img  class='mArLeft015' src='images/dashboard/top-arrow-green.png' style='width:auto;height:32px;float:left;margin-left: 5px;'>";
                                            } else if (avg == mainEvalutorAVG) {
                                                graphElemHtml += "<img  class='mArLeft015' src='images/dashboard/min-icon-big.png' style='width:auto;height:32px;float:left;margin-left: 5px;'>";
                                            } else {
                                                graphElemHtml += "<img   class='mArLeft015' src='images/dashboard/botm-arrow-red.png' style='width:auto;height:32px;float:left;margin-left: 5px;'>";
                                            }
                                        }
                                        var diffPercentage = setDiffrencePercentage(avg, mainEvalutorAVG, reportModel.max);
                                        graphElemHtml += diffPercentage;
                                        //graphElemHtml += "<span>" + diffPercentage + "%</span>";
                                        $(".mainEvalutorAVG" + elementId).after(graphElemHtml);
                                    }
                                }

                            }
                            else {
                                if ($("#PGE" + elementId).length > 0) {
                                    //var progressBar;
                                    //progressBar = new ProgressBar("PGE" + elementId.toString(), { 'width': '100%', 'height': '35px' });
                                    //var progressBarItem = {};
                                    //progressBarItem[ProgressBar.OPTION_NAME.ITEM_ID] = "item1";
                                    //progressBarItem[ProgressBar.OPTION_NAME.COLOR_ID] = ProgressBar.OPTION_VALUE.COLOR_ID.CUSTOM;
                                    //progressBarItem.color = getColor(0, reportModel.scale.scaleRanges);
                                    //progressBar.createItem(progressBarItem);
                                    //progressBar.setPercent(0);
                                    $("#PGE" + elementId.toString() + ".progress").find(".progress-bar").width(mainEvalutorPRC + '%')
                                    $("#PGE" + elementId.toString() + ".progress").find(".progress-bar").text(mainEvalutorPRC + '%')
                                }
                            }

                            //Scores for Comapre To Evaluators
                            if (cEvaluatorsSkillsForPg && cEvaluatorsSkillsForPg.length > 0) {
                                var pointscores = [];
                                angular.forEach(cEvaluatorsSkillsForPg, function (evaluatorDataForGraph, index) {
                                    var cEvaluatorColor = null;
                                    angular.forEach(colorSeries, function (color) {
                                        if (color.name == "cEvaluator " + index) {
                                            cEvaluatorColor = color.value;
                                            gaugeSeriesColors.compareEvaluator = cEvaluatorColor;
                                        }
                                    });
                                    var cEvaluatorScores = getKendoChartData(evaluatorDataForGraph.data);
                                    kendoSeries.push({ name: evaluatorDataForGraph.label, data: cEvaluatorScores, color: cEvaluatorColor });
                                    if (evaluatorDataForGraph.score && evaluatorDataForGraph.score > 0) {
                                        pointscores.push(evaluatorDataForGraph.score);
                                        kendoPointers.push({ value: evaluatorDataForGraph.score, color: cEvaluatorColor, label: $translate.instant('COMMON_EVALUATOR') + " :" + evaluatorDataForGraph.label + compareLegendPostfix });
                                    }
                                });

                                if (pointscores.length > 0) {
                                    var totalScores = _.sum(pointscores);
                                    compareEvaluatorAVG = totalScores / pointscores.length;
                                    compareEvaluatorPRC = percentage(reportModel.max, compareEvaluatorAVG);

                                    $("#PGCE" + elementId.toString() + ".progress").find(".progress-bar").width(compareEvaluatorPRC + '%')
                                    $("#PGCE" + elementId.toString() + ".progress").find(".progress-bar").text(compareEvaluatorPRC + '%')

                                    //progressBar = new ProgressBar("PGCE" + elementId.toString(), { 'width': '100%', 'height': '35px' });
                                    //progressBarItem = {};
                                    //progressBarItem[ProgressBar.OPTION_NAME.ITEM_ID] = "item1";
                                    //progressBarItem[ProgressBar.OPTION_NAME.COLOR_ID] = ProgressBar.OPTION_VALUE.COLOR_ID.CUSTOM;
                                    //progressBarItem.color = getColor(compareEvaluatorAVG, reportModel.scale.scaleRanges);
                                    ////progressBar.createItem(progressBarItem);
                                    //progressBar.createItem(progressBarItem);
                                    //progressBar.setPercent(compareEvaluatorPRC);
                                    //$(".compareEvaluatorAVG" + elementId).html(compareEvaluatorAVG);


                                    var graphElemHtml = "";
                                    if (avg > 0) {
                                        if (compareEvaluatorAVG > avg) {
                                            graphElemHtml += "<img  class='mArLeft015' src='images/dashboard/top-arrow-green.png' style='width:auto;height:32px;float:left;margin-left: 5px;'>";
                                        } else if (avg == mainEvalutorAVG) {
                                            graphElemHtml += "<img  class='mArLeft015' src='images/dashboard/min-icon-big.png' style='width:auto;height:32px;float:left;margin-left: 5px;'>";
                                        } else {
                                            graphElemHtml += "<img   class='mArLeft015' src='images/dashboard/botm-arrow-red.png' style='width:auto;height:32px;float:left;margin-left: 5px;'>";
                                        }
                                    }

                                    var diffPercentage = setDiffrencePercentage(avg, compareEvaluatorAVG, reportModel.max);
                                    graphElemHtml += diffPercentage;
                                    //graphElemHtml += "<span>" + diffPercentage + "%</span>";
                                    $(".compareEvaluatorAVG" + elementId).after(graphElemHtml);

                                }
                                else {
                                    if (reportModel.cProfileTypeName == "Agreed Final KPI") {
                                        $("#PGCE" + elementId).parent(".GraphLiProc").hide();
                                        $(".compareEvaluatorAVG" + elementId).parent(".GraphLiProc").hide();
                                        $(".PGCEIndicator" + elementId).hide();
                                    }
                                    else {


                                        $("#PGCE" + elementId.toString() + ".progress").find(".progress-bar").width(compareEvaluatorPRC + '%')
                                        $("#PGCE" + elementId.toString() + ".progress").find(".progress-bar").text(compareEvaluatorPRC + '%')


                                        //progressBar = new ProgressBar("PGCE" + elementId.toString(), { 'width': '100%', 'height': '35px' });
                                        //progressBarItem = {};
                                        //progressBarItem[ProgressBar.OPTION_NAME.ITEM_ID] = "item1";
                                        //progressBarItem[ProgressBar.OPTION_NAME.COLOR_ID] = ProgressBar.OPTION_VALUE.COLOR_ID.CUSTOM;
                                        //progressBarItem.color = getColor(compareEvaluatorAVG, reportModel.scale.scaleRanges);
                                        ////progressBar.createItem(progressBarItem);
                                        //progressBar.createItem(progressBarItem);
                                        //progressBar.setPercent(compareEvaluatorPRC);
                                        //$(".compareEvaluatorAVG" + elementId).html(compareEvaluatorAVG);


                                        var graphElemHtml = "";
                                        if (avg > 0) {
                                            if (compareEvaluatorAVG > avg) {
                                                graphElemHtml += "<img  class='mArLeft015' src='images/dashboard/top-arrow-green.png' style='width:auto;height:32px;float:left;margin-left: 5px;'>";
                                            } else if (avg == mainEvalutorAVG) {
                                                graphElemHtml += "<img  class='mArLeft015' src='images/dashboard/min-icon-big.png' style='width:auto;height:32px;float:left;margin-left: 5px;'>";
                                            } else {
                                                graphElemHtml += "<img   class='mArLeft015' src='images/dashboard/botm-arrow-red.png' style='width:auto;height:32px;float:left;margin-left: 5px;'>";
                                            }
                                        }
                                        var diffPercentage = setDiffrencePercentage(avg, compareEvaluatorAVG, reportModel.max);
                                        graphElemHtml += diffPercentage;
                                        $(".compareEvaluatorAVG" + elementId).after(graphElemHtml);
                                    }
                                }

                            }
                            else {
                                if ($("#PGCE" + elementId).length > 0) {
                                    var percentage0 = 0;
                                    $("#PGCE" + elementId.toString() + ".progress").find(".progress-bar").width(percentage0 + '%')
                                    $("#PGCE" + elementId.toString() + ".progress").find(".progress-bar").text(percentage0 + '%')


                                    //var progressBar;
                                    //progressBar = new ProgressBar("PGCE" + elementId.toString(), { 'width': '100%', 'height': '35px' });
                                    //progressBarItem = {};
                                    //progressBarItem[ProgressBar.OPTION_NAME.ITEM_ID] = "item1";
                                    //progressBarItem[ProgressBar.OPTION_NAME.COLOR_ID] = ProgressBar.OPTION_VALUE.COLOR_ID.CUSTOM;
                                    //progressBarItem.color = getColor(0, reportModel.scale.scaleRanges);
                                    ////progressBar.createItem(progressBarItem);
                                    //progressBar.createItem(progressBarItem);
                                    //progressBar.setPercent(0);
                                    //$(".compareEvaluatorAVG" + elementId).html("0");
                                }
                            }

                            angular.forEach(kendoPointers, function (poiner) {
                                if (poiner.value > 0) {
                                    $("<div  class='legend-container-block' style='display: inline-block;padding:0px 3px; vertical-align:middle;'>" +
                                        "<div style='width:4px;height:0;border:5px solid " + poiner.color + ";float:left;margin-top: 4px;'></div>" +
                                        "<div style='float:left; padding: 0px 2px';>" + poiner.label + "</div></div>")
                                        .appendTo('#legend-container' + elementId.toString());
                                }
                            });

                            var floatChart = $("#floatChart" + elementId.toString()).kendoChart({
                                legend: {
                                    position: "top",
                                    visible: false
                                },
                                seriesDefaults: {
                                    type: "column"
                                },
                                series: kendoSeries,
                                valueAxis: {
                                    majorUnit: 1,
                                    min: 0,
                                    max: reportModel.scale.scaleRanges[reportModel.scale.scaleRanges.length - 1].max,
                                    labels: {
                                        format: "{0}"
                                    },
                                    line: {
                                        visible: true
                                    },
                                    axisCrossingValue: 0
                                },
                                categoryAxis: {
                                    categories: ticksData,
                                    line: {
                                        visible: false
                                    },
                                    labels: {
                                        padding: { top: 0 }
                                    }
                                },
                                tooltip: {
                                    visible: true,
                                    background: "white",
                                    format: "{0}",
                                    template: "#= series.name #: #= value# #= dataItem.description #"
                                }
                            });


                            var linearGraph = $("#linearChart" + elementId.toString()).kendoChart({
                                legend: {
                                    position: "top",
                                    visible: false
                                },
                                seriesDefaults: {
                                    type: "line"
                                },
                                series: kendoSeries,
                                valueAxis: {
                                    majorUnit: 1,
                                    min: 0,
                                    max: reportModel.scale.scaleRanges[reportModel.scale.scaleRanges.length - 1].max,
                                    labels: {
                                        format: "{0}"
                                    },
                                    line: {
                                        visible: true
                                    },
                                    axisCrossingValue: 0
                                },
                                categoryAxis: {
                                    categories: ticksData,
                                    line: {
                                        visible: false
                                    },
                                    labels: {
                                        padding: { top: 0 }
                                    }
                                },
                                tooltip: {
                                    visible: true,
                                    background: "white",
                                    format: "{0}",
                                    template: "#= series.name #: #= value# #= dataItem.description #"
                                }
                            });
                            var gaugeGraph = $("#gaugeChart" + elementId.toString()).kendoRadialGauge({
                                pointer: kendoPointers,

                                scale: {
                                    min: 0,
                                    minorUnit: 1,
                                    startAngle: -30,
                                    endAngle: 210,
                                    max: reportModel.scale.scaleRanges[reportModel.scale.scaleRanges.length - 1].max,
                                    ranges: reportModel.scale.scaleRanges,
                                }
                            });

                            if ($scope.pgModesModel && $scope.pgModesModel.length > 0) {
                                $scope.swapGraphMode(elementId);
                            }

                            profileCharts.push(floatChart);
                            profileCharts.push(gaugeGraph);
                            profileCharts.push(linearGraph);
                            var legendHeights = []
                            $(".GraphList .GraphListImg").each(function () {
                                var height = 0;
                                $(this).find(".legend-container .legend-container-block").each(function () {
                                    height += $(this).height();
                                })
                                legendHeights.push(height);
                            });
                            if (legendHeights.length > 0) {
                                var max = _.max(legendHeights);
                                if (max > 45) {
                                    $(".GraphList .GraphListImg .legend-container").height(max);
                                }
                            }


                            var legendHeights = []
                            $(".GraphList .GraphListImg").each(function () {
                                var height = 0;
                                $(this).find(".legend-container .legend-container-block").each(function () {
                                    height += $(this).height();
                                })
                                legendHeights.push(height);
                            });
                            if (legendHeights.length > 0) {
                                var max = _.max(legendHeights);
                                if (max > 45) {
                                    $(".GraphList .GraphListImg .legend-container").height(max);
                                }
                            }

                            var pgNameHeights = []
                            $(".GraphList .pgName").each(function () {
                                var height = $(this).height();
                                pgNameHeights.push(height);
                            });
                            if (pgNameHeights.length > 0) {
                                var max = _.max(pgNameHeights);
                                if (max > 25) {
                                    $(".GraphList .pgName").height(max);
                                }
                            }

                            var heights = [];
                            $(".GraphList .col-md-3").each(function (i, el) {
                                heights.push($(el).height())
                            });
                            var maxHeight = _.max(heights);
                            $(".GraphList .col-md-3").each(function (i, el) {
                                $(el).height(maxHeight);
                            });
                        }

                        function prepareKtChartData() {
                            $scope.kt.series = [];
                            $scope.kt.seriesCategories = [];
                            var serie = {};
                            serie.color = ktDashboardColors.main;
                            serie.name = $translate.instant('COMMON_MAIN_PARTICIPANTS') + " (" + $scope.ngReportData.mainParticipantsRaw + ")";
                            serie.data = []
                            angular.forEach($scope.ktStagesResults, function (stage, index) {
                                var totalScore;
                                if ($scope.kt.resultType == resulTypesEnum.score) {
                                    totalScore = stage.score;
                                }
                                else if ($scope.kt.resultType == resulTypesEnum.percent) {
                                    totalScore = Math.round(stage.score / stage.maxScore * 100);
                                }
                                else if ($scope.kt.resultType == resulTypesEnum.correctAnswers) {
                                    totalScore = stage.correctAnswersCount;
                                }
                                else if ($scope.kt.resultType == resulTypesEnum.resultTime) {
                                    totalScore = (stage.timeSpent / 60).toFixed(2);
                                }
                                serie.data.push(totalScore);
                                $scope.kt.seriesCategories.push(stage.stageName);
                            });
                            $scope.kt.series.push(serie);

                            $scope.kt.chartValueLabelTempl = "{0}";

                            if ($scope.kt.resultType == resulTypesEnum.score) {
                                if ($scope.ktStagesResults) {
                                    if ($scope.ktStagesResults.length > 0) {
                                        $scope.kt.maxSeriesValue = $scope.ktStagesResults[0].maxScore;
                                    }
                                }
                            }
                            else if ($scope.kt.resultType == resulTypesEnum.percent) {
                                $scope.kt.maxSeriesValue = 100;
                                $scope.kt.chartValueLabelTempl = $scope.kt.chartValueLabelTempl + "%";
                            }
                            else if ($scope.kt.resultType == resulTypesEnum.correctAnswers) {
                                if ($scope.ktStagesResults) {
                                    if ($scope.ktStagesResults.length > 0) {
                                        $scope.kt.maxSeriesValue = $scope.ktStagesResults[0].questionsCount;
                                    }
                                }
                            }
                            else if ($scope.kt.resultType == resulTypesEnum.resultTime) {
                                if ($scope.ktStagesResults) {
                                    if ($scope.ktStagesResults.length > 0) {
                                        $scope.kt.maxSeriesValue = ($scope.ktStagesResults[0].allTime / 60).toFixed(2);
                                    }
                                }
                            }

                            $scope.kt.majorUnit = 5;

                            if ($scope.showCompareReport) {
                                prepareKtCompareChartData();
                            }

                            if ($scope.ngReportData.isShowBenchmark) {
                                prepareKtBenchmarkChartData();
                            }
                        }

                        function prepareKtCompareChartData() {
                            var serie = {};
                            serie.color = ktDashboardColors.compare;
                            serie.name = $translate.instant("DASHBOARD_COMPARE") + " " + $translate.instant("COMMON_PARTICIPANTS") + "  (" + $scope.ngReportData.participantsRaw + ")";
                            serie.data = []
                            angular.forEach($scope.ktCompareStagesResult, function (stage, index) {
                                var totalScore;
                                if ($scope.kt.resultType == resulTypesEnum.score) {
                                    totalScore = stage.score;
                                }
                                else if ($scope.kt.resultType == resulTypesEnum.percent) {
                                    totalScore = Math.round(stage.score / stage.maxScore * 100);
                                }
                                else if ($scope.kt.resultType == resulTypesEnum.correctAnswers) {
                                    totalScore = stage.correctAnswersCount;
                                }
                                else if ($scope.kt.resultType == resulTypesEnum.resultTime) {
                                    totalScore = (stage.timeSpent / 60).toFixed(2);
                                }
                                serie.data.push(totalScore);
                            });
                            $scope.kt.series.push(serie);
                        }

                        function prepareKtBenchmarkChartData() {
                            var serie = {};
                            serie.color = ktDashboardColors.benchmark;
                            serie.name = 'Benchmark';
                            serie.data = []
                            angular.forEach($scope.ngReportData.benchmarksStages, function (stage, index) {
                                var totalScore;
                                if ($scope.kt.resultType == resulTypesEnum.score) {
                                    totalScore = stage.score;
                                }
                                else if ($scope.kt.resultType == resulTypesEnum.percent) {
                                    totalScore = Math.round(stage.score / stage.maxScore * 100);
                                }
                                else if ($scope.kt.resultType == resulTypesEnum.correctAnswers) {
                                    totalScore = stage.correctAnswersCount;
                                }
                                else if ($scope.kt.resultType == resulTypesEnum.resultTime) {
                                    totalScore = (stage.timeSpent / 60).toFixed(2);
                                }
                                serie.data.push(totalScore);
                            });
                            $scope.kt.series.push(serie);
                        }

                        function drawKTPerformanceGraph() {
                            prepareKtChartData();

                            var KtChart = $("#KTChart").kendoChart({
                                title: {
                                    text: $translate.instant('DASHBOARD_STAGES_RESULT')
                                },
                                legend: {
                                    position: "top"
                                },
                                seriesDefaults: {
                                    type: "bar"
                                },
                                series: $scope.kt.series,
                                valueAxis: {
                                    min: 0,
                                    max: $scope.kt.maxSeriesValue,
                                    labels: {
                                        format: $scope.kt.chartValueLabelTempl
                                    },
                                    line: {
                                        visible: true
                                    },
                                    axisCrossingValue: 0
                                },
                                categoryAxis: {
                                    categories: $scope.kt.seriesCategories,
                                    line: {
                                        visible: false
                                    },
                                    labels: {
                                        padding: { top: 0 }
                                    }
                                },
                                tooltip: {
                                    visible: true,
                                    template: "#= value #"
                                }
                            });
                            profileCharts.push(KtChart);
                            redrawChart($("#KTChart"));
                        }

                        function drawKTGauge() {
                            $("#kt_gauge_total_score").kendoRadialGauge({
                                pointer: $scope.kt.gaugeTotalScore,
                                scale: {
                                    min: 0,
                                    startAngle: -30,
                                    endAngle: 210,
                                    max: $scope.kt.maxGaugeValue,
                                    ranges: $scope.kt.scaleRanges
                                }
                            });
                        }


                        function getKPIImage(avg, avgc) {


                            //var diffPercentage = parseFloat((((avg - avgc) / reportModel.max) * 100)).toFixed(1);
                            var imageElemHtml = "";
                            var diffPercentage = setDiffrencePercentage(avg, avgc, reportModel.max);
                            if (avgc > avg) {
                                imageElemHtml += "<img src='images/dashboard/top-arrow-green.png' style='width:auto;height:32px'>";
                            } else if (avg == avgc) {
                                imageElemHtml += "<img src='images/dashboard/min-icon-big.png' style='width:auto;height:32px'>";
                            } else {
                                imageElemHtml += "<img src='images/dashboard/botm-arrow-red.png' style='width:auto;height:32px'>";
                            }

                            imageElemHtml += "<span class='getKPIImage'>" + diffPercentage + " </span>";
                            return imageElemHtml;
                        }

                        function setDiffrencePercentage(mainAVG, compareAVG, max) {
                            var DiffrencePercentageresult = "";
                            var diffPercentage = 0;
                            if (max > 0) {
                                var diffvaue = compareAVG - mainAVG;
                                diffPercentage = Math.ceil(diffvaue * 100 / mainAVG);
                                //diffPercentage = parseFloat((((compareAVG - mainAVG) / max) * 100)).toFixed(1);
                                if (!isNaN(diffPercentage)) {
                                    if (isFinite(diffPercentage)) {

                                        if (diffPercentage > 0) {
                                            DiffrencePercentageresult = "<span class='diff-up'>" + diffPercentage + "% </span>";
                                        }
                                        else if (diffPercentage < 0) {
                                            DiffrencePercentageresult = "<span class='diff-down'>" + diffPercentage + "% </span>";
                                        }
                                    }
                                    else {
                                        DiffrencePercentageresult = "<span class='fa fa-info-circle text-red' title='User has not added any score so we cant show difference'></span>";
                                    }
                                }
                            }
                            return DiffrencePercentageresult;
                        }



                        function getKTEmptySkillRes() {
                            return {
                                id: 0,
                                participantId: 0,
                                pgName: '',
                                skillName: '',
                                indicator: '',
                                pointsScore: '',
                                comparePointsScore: '',
                                percentScore: '',
                                comparePercentScore: '',
                                benchmark: '',
                                weight: '',
                                csf: '',
                                action: '',
                                trend: '',
                                avgPointScore: '',
                                avgPercentScore: ''
                            }
                        }

                        function prepareKtSkillResultsFOrGrouping(skillResults, answerdata) {
                            var res = [];
                            skillResults = _.sortByOrder(skillResults, ['pgName', 'skillName'], ['asc', 'asc']);
                            var pgIds = _.uniq(_.map(skillResults, 'pgId'));
                            _.forEach(pgIds, function (pgId, index) {
                                var foundskillResuls = _.filter(skillResults, function (skillRes) {
                                    return skillRes.pgId == pgId;
                                });
                                foundskillResuls = _.sortByOrder(foundskillResuls, ['skillName'], ['asc']);

                                var parentId = index;

                                var emptySkillRes = getKTEmptySkillRes();
                                emptySkillRes.id = parentId;
                                emptySkillRes.participantId = $scope.ngReportData.participantsId[0].id;
                                emptySkillRes.parentId = null;
                                emptySkillRes.pgId = pgId;
                                emptySkillRes.pgName = foundskillResuls[0].pgName;
                                emptySkillRes.questionId = 0;
                                res.push(emptySkillRes);
                                var pgname = foundskillResuls[0].pgName;
                                _.forEach(foundskillResuls, function (item) {
                                    if (answerdata) {
                                        var answers = answerdata.answers.filter(function (answeritem) {
                                            if (answeritem.performanceGroupName == item.pgName && answeritem.skillNames.indexOf(item.skillName) > -1) {
                                                item.questionText = answeritem.questionText;
                                            }
                                        })
                                    }
                                    var itemToAdd = _.clone(item);
                                    itemToAdd.parentId = parentId;
                                    itemToAdd.id = -1;
                                    itemToAdd.participantId = $scope.ngReportData.participantsId[0].id;
                                    //itemToAdd.cParticipantId = $scope.ngReportData.cParticipantIds[0].id;
                                    itemToAdd.pgName = '';
                                    res.push(itemToAdd);
                                });
                            });

                            return res;
                        }
                        // IPS2018-18 - Togenerate charts and display Knowledge profile details 
                        $scope.getKTScorecardDialogDetail = getKTScorecardDialogDetail;
                        var questionid = 0;
                        $scope.getKTAnswerDetail = function (questionid, participantID) {
                            if (questionid) {
                                var surveyAnalysis = surveyAnalysisService.getKTAnalysisInfo($scope.profileId, $scope.ngReportData.stageId,
                                    participantID, $scope.stageEvolutionId).then(function (data) {
                                        var participantName = ""
                                        var userindex = _.findIndex($scope.ngReportData.participantsId, function (item) { return item.id == participantID });
                                        if (userindex == 0) {
                                            participantName = $scope.ngReportData.mainParticipantsRaw.split(',')[0];
                                        }
                                        else {
                                            userindex = _.findIndex($scope.ngReportData.cParticipantIds, function (item) { return item.id == participantID })
                                            if (userindex == 0) {
                                                participantName = $scope.ngReportData.participantsRaw.split(',')[0];
                                            }
                                        }
                                        var index = _.findIndex(data.answers, function (answer) {
                                            return answer.questionId == questionid;
                                        });
                                        if (index > -1) {
                                            $scope.ngReportData["answerDetail"] = data;
                                            $scope.ngReportData["index"] = index;
                                            dialogService.showKTAnswerDetailDialogNew(participantName, $scope.profileId, $scope.ngReportData.stageId, participantID, index);
                                            var linkFn = $compile($("#ktAnswerDetailGridDialogWindow"));
                                            linkFn($scope);
                                        }
                                    });;
                            }
                        };

                        $scope.getKTDevelopmentContractDetail = function () {
                            dialogService.showKTDevelopmentContractDetailDialogNew($translate.instant('DASHBOARD_FINAL_KPI_OF') + " " + $scope.ngReportData.mainParticipantsRaw.split(",")[0], $scope.profileId, $scope.ngReportData.stageId, $scope.ngReportData.participantsId[0].id, $scope.stageEvolutionId);
                            var linkFn = $compile($("#ktDevelopmentContractDetailDialogWindow"));
                            linkFn($scope);
                        };

                        $scope.getKTScoreCardDetail = function () {
                            dialogService.showKTScoreCardDetailDialogNew($scope.profileId, $scope.ngReportData.stageId, $scope.ngReportData.participantsId[0].id, $scope.stageEvolutionId);
                            var linkFn = $compile($("#ktScoreCardDetailDialogWindow"));
                            linkFn($scope);
                        }
                        $scope.getKTAllAnswers = function () {

                            var surveyAnalysis = surveyAnalysisService.getKTAnalysisInfo($scope.profileId, $scope.ngReportData.stageId,
                                $scope.ngReportData.participantsId[0].id, $scope.stageEvolutionId).then(function (data) {
                                    var index = 0;
                                    if (index > -1) {
                                        $scope.ngReportData["answerDetail"] = data;
                                        $scope.ngReportData["index"] = index;
                                        dialogService.showKTAnswerDetailDialogNew($scope.ngReportData.mainParticipantsRaw.split(",")[0], $scope.profileId, $scope.ngReportData.stageId, $scope.ngReportData.participantsId[0].id, index);
                                        var linkFn = $compile($("#ktAnswerDetailGridDialogWindow"));
                                        linkFn($scope);
                                    }
                                });
                        };

                        function getKTScorecardData() {

                            $scope.skillResultsParticipants = [];
                            $scope.skillResultsEvaluator = [];
                            $scope.skillResultsCompareParticipants = [];
                            $scope.skillResultsBenchmark = [];
                            scorecardsServiceNew.loadKTScorecardData($scope.profileId, $scope.ngReportData.participantsId,
                                $scope.ngReportData.stageId, $scope.ngReportData.mainProfileStepId == $scope.ktProfileTypes.start.id, $scope.ngReportData.mainEvolutionStageId).then(function (data) {

                                    $scope.skillResultsParticipants = prepareKtSkillResultsFOrGrouping(data.skillResults);
                                    $scope.skillResultsParticipants = setKTIndicatorColor(data.passScore, data.medalRule, $scope.skillResultsParticipants);
                                    if ($scope.ngReportData.cParticipantIds.length > 0 && $scope.ngReportData.cEvaluatorsProfileScorecards && $scope.ngReportData.cEvaluatorsProfileScorecards.length > 0) {
                                        if ($scope.ngReportData.cParticipantIds.length > 0) {
                                            scorecardsServiceNew.loadKTScorecardData($scope.profileId, $scope.ngReportData.cParticipantIds,
                                                $scope.ngReportData.stageId, $scope.ngReportData.mainProfileStepId == $scope.ktProfileTypes.start.id, $scope.ngReportData.evolutionStageId).then(function (data) {
                                                    $scope.skillResultsCompareParticipants = prepareKtSkillResultsFOrGrouping(data.skillResults);
                                                    $scope.skillResultsCompareParticipants = setKTIndicatorColor(data.passScore, data.medalRule, $scope.skillResultsCompareParticipants);

                                                    scorecardsServiceNew.loadKTScorecardData($scope.profileId, $scope.ngReportData.cEvaluatorsProfileScorecards,
                                                        $scope.ngReportData.stageId, $scope.ngReportData.mainProfileStepId == $scope.ktProfileTypes.start.id, $scope.ngReportData.evolutionStageId).then(function (data) {

                                                            $scope.skillResultsEvaluator = prepareKtSkillResultsFOrGrouping(data.skillResults);
                                                            $scope.skillResultsEvaluator = setKTIndicatorColor(data.passScore, data.medalRule, $scope.skillResultsEvaluator);

                                                            if ($scope.ngReportData.isShowBenchmark) {

                                                                scorecardsServiceNew.loadKTScorecardData($scope.profileId, [{ id: -1 }],
                                                                    $scope.ngReportData.stageId, $scope.ngReportData.mainProfileStepId == $scope.ktProfileTypes.start.id, 0).then(function (data) {
                                                                        $scope.skillResultsBenchmark = prepareKtSkillResultsFOrGrouping(data.skillResults);
                                                                        $scope.skillResultsBenchmark = setKTIndicatorColor(data.passScore, data.medalRule, $scope.skillResultsBenchmark);
                                                                        getKTFloatChartData();

                                                                    });
                                                            }
                                                            else {
                                                                getKTFloatChartData();
                                                            }
                                                        });

                                                });
                                        }

                                    }
                                    else if ($scope.ngReportData.cParticipantIds.length > 0) {
                                        scorecardsServiceNew.loadKTScorecardData($scope.profileId, $scope.ngReportData.cParticipantIds,
                                            $scope.ngReportData.stageId, $scope.ngReportData.mainProfileStepId == $scope.ktProfileTypes.start.id, $scope.ngReportData.evolutionStageId).then(function (data) {
                                                $scope.skillResultsCompareParticipants = prepareKtSkillResultsFOrGrouping(data.skillResults);
                                                $scope.skillResultsCompareParticipants = setKTIndicatorColor(data.passScore, data.medalRule, $scope.skillResultsCompareParticipants);

                                                if ($scope.ngReportData.isShowBenchmark) {

                                                    scorecardsServiceNew.loadKTScorecardData($scope.profileId, [{ id: -1 }],
                                                        $scope.ngReportData.stageId, $scope.ngReportData.mainProfileStepId == $scope.ktProfileTypes.start.id, 0).then(function (data) {
                                                            $scope.skillResultsBenchmark = prepareKtSkillResultsFOrGrouping(data.skillResults);
                                                            $scope.skillResultsBenchmark = setKTIndicatorColor(data.passScore, data.medalRule, $scope.skillResultsBenchmark);
                                                            getKTFloatChartData();

                                                        });
                                                }
                                                else {
                                                    getKTFloatChartData();
                                                }

                                            });
                                    }
                                    else if ($scope.ngReportData.cEvaluatorsProfileScorecards && $scope.ngReportData.cEvaluatorsProfileScorecards.length > 0) {
                                        scorecardsServiceNew.loadKTScorecardData($scope.profileId, $scope.ngReportData.cEvaluatorsProfileScorecards,
                                            $scope.ngReportData.stageId, $scope.ngReportData.mainProfileStepId == $scope.ktProfileTypes.start.id, $scope.ngReportData.evolutionStageId).then(function (data) {
                                                $scope.skillResultsEvaluator = prepareKtSkillResultsFOrGrouping(data.skillResults);
                                                $scope.skillResultsEvaluator = setKTIndicatorColor(data.passScore, data.medalRule, $scope.skillResultsEvaluator);

                                                if ($scope.ngReportData.isShowBenchmark) {

                                                    scorecardsServiceNew.loadKTScorecardData($scope.profileId, [{ id: -1 }],
                                                        $scope.ngReportData.stageId, $scope.ngReportData.mainProfileStepId == $scope.ktProfileTypes.start.id, 0).then(function (data) {
                                                            $scope.skillResultsBenchmark = prepareKtSkillResultsFOrGrouping(data.skillResults);
                                                            $scope.skillResultsBenchmark = setKTIndicatorColor(data.passScore, data.medalRule, $scope.skillResultsBenchmark);
                                                            getKTFloatChartData();

                                                        });
                                                }
                                                else {
                                                    getKTFloatChartData();
                                                }
                                            });
                                    }

                                    else {
                                        if ($scope.ngReportData.isShowBenchmark) {

                                            scorecardsServiceNew.loadKTScorecardData($scope.profileId, [{ id: -1 }],
                                                $scope.ngReportData.stageId, $scope.ngReportData.mainProfileStepId == $scope.ktProfileTypes.start.id, 0).then(function (data) {
                                                    $scope.skillResultsBenchmark = prepareKtSkillResultsFOrGrouping(data.skillResults);
                                                    $scope.skillResultsBenchmark = setKTIndicatorColor(data.passScore, data.medalRule, $scope.skillResultsBenchmark);
                                                    getKTFloatChartData();

                                                });
                                        }
                                        else {
                                            getKTFloatChartData();
                                        }
                                    }

                                });
                        }
                        function getKTScorecardDialogDetail() {

                            scorecardsServiceNew.loadKTScorecardData($scope.profileId, $scope.ngReportData.participantsId,
                                $scope.ngReportData.stageId, $scope.ngReportData.mainProfileStepId == $scope.ktProfileTypes.start.id, $scope.ngReportData.mainEvolutionStageId).then(function (data) {

                                    surveyService.getKTSurveyResult($scope.profileId.toString(), $scope.ngReportData.stageId.toString(),
                                        $scope.ngReportData.participantsId[0].id.toString(), "null").then(function (answerdata) {
                                            var colorMainPart = "black";
                                            var colorComparePart = "blue";
                                            var columnWidth = 10;
                                            var columnWidthText = columnWidth + "%";

                                            _.forEach(data.skillResults, function (sRes) {
                                                sRes.id = sRes.pgId;
                                                sRes.percentScore = sRes.percentScore.toFixed(2);
                                            });

                                            data.skillResults = prepareKtSkillResultsFOrGrouping(data.skillResults, answerdata);
                                            setKTDetailIndicatorColor(data);

                                            $scope.scorecard.reportData = data;
                                            if ($("#scorecardGrid").length > 0) {
                                                $("#scorecardGrid").empty();
                                            }
                                            var grid;
                                            if (!($scope.ngReportData.cParticipantIds.length > 0)) {

                                                var columns = [
                                                    { field: "pgName", title: $translate.instant('COMMON_PERFORMANCE_GROUP'), width: "11%" },
                                                    { field: "skillName", title: $translate.instant('COMMON_SKILL'), width: "11%" },
                                                    { field: "questionText", title: $translate.instant('DASHBOARD_QUESTION'), width: "11%" },
                                                    { field: "", title: $scope.ngReportData.mainParticipantsRaw.split(',')[0] + " " + $translate.instant('DASHBOARD_INDICATOR'), width: "5%", template: "<div ng-click='getKTAnswerDetail(#= (questionId != null)? questionId : ''#,#= (questionId != null)? participantId : ''#)' class='scale-circle' style='background: #: indicator #'></div>" },
                                                    { field: "pointsScore", title: $scope.ngReportData.mainParticipantsRaw.split(',')[0] + " " + $translate.instant('DASHBOARD_POINTS_SCORE'), width: columnWidthText, template: "<div class='number' style='color:" + colorMainPart + "'>#= (pointsScore == null) ? ' ' : pointsScore #</div>" },
                                                    { field: "percentScore", title: $scope.ngReportData.mainParticipantsRaw.split(',')[0] + " " + $translate.instant('COMMON_SCORE') + ", %", width: columnWidthText, template: "<div class='number' style='color:" + colorMainPart + "'>#= percentScore ? percentScore+'%' : '' #</div>" },
                                                    { field: "target", title: $translate.instant('DASHBOARD_BENCHMARK'), width: "6%", template: "<div class='number'>#= (benchmark == null) ? ' ' : benchmark #</div>", hidden: !$scope.ngReportData.isShowBenchmark },
                                                    { field: "weight", title: $translate.instant('DASHBOARD_WEIGHT'), width: "6%", template: "<div class='number'>#= (weight == null) ? ' ' : weight #</div>" },
                                                    { field: "csf", title: $translate.instant('DASHBOARD_CSF'), width: "12%", template: "#= (csf == null) ? ' ' : csf #" },
                                                    { field: "action", title: $translate.instant('DASHBOARD_COMMENT'), width: "12%", template: "#= (action == null) ? ' ' : action #" },
                                                ];
                                                //dialogService.showKTGridDialog("Performance Group Details  ", dataSource($scope.scorecard.reportData.skillResults), columns);
                                                //var linkFn = $compile($("#ktGridDialogWindow"));
                                                //linkFn($scope);
                                                var colorMainPart = "black";
                                                var colorComparePart = "blue";
                                                var columnWidth = 10;
                                                var columnWidthText = columnWidth + "%";
                                                var grid = $("#ktDetailsGrid").kendoTreeList({
                                                    dataSource: dataSource($scope.scorecard.reportData.skillResults),
                                                    loadOnDemand: false,
                                                    sortable: true,
                                                    filterable: {
                                                        mode: "row"
                                                    },
                                                    columnMenu: true,
                                                    columns: columns
                                                });
                                                grid.data("kendoTreeList").thead.kendoTooltip({
                                                    filter: "th",
                                                    content: function (e) {
                                                        var target = e.target; // element for which the tooltip is shown
                                                        return $(target).text();
                                                    }
                                                });


                                            }
                                            else {
                                                scorecardsServiceNew.loadKTScorecardData($scope.profileId, $scope.ngReportData.cParticipantIds,
                                                    $scope.ngReportData.stageId, $scope.ngReportData.mainProfileStepId == $scope.ktProfileTypes.start.id, $scope.ngReportData.evolutionStageId).then(function (compData) {
                                                        var mainResult = _.filter($scope.scorecard.reportData.skillResults, function (skillRes) { return skillRes.id == -1 });
                                                        var compareResult = compData.skillResults;
                                                        if (mainResult.length == compareResult.length) {
                                                            _.forEach($scope.scorecard.reportData.skillResults, function (skillRes) {
                                                                skillRes.cIndicator = "";
                                                                skillRes.cParticipantId = $scope.ngReportData.cParticipantIds[0].id;
                                                                if (skillRes.id == -1) {
                                                                    var compareRes = _.find(compData.skillResults, function (compSkillRes) {
                                                                        return compSkillRes.pgId == skillRes.pgId &&
                                                                            compSkillRes.skillId == skillRes.skillId;
                                                                    });
                                                                    if (compareRes) {
                                                                        skillRes.cIndicator = setCKTIndicatorColor(compareRes.correctAnswersCountScore);
                                                                        skillRes.comparePointsScore = compareRes.pointsScore;
                                                                        skillRes.comparePercentScore = parseFloat(compareRes.percentScore).toFixed(2);
                                                                        skillRes.avgPointScore = parseFloat((skillRes.comparePointsScore + skillRes.pointsScore) / 2).toFixed(2);
                                                                        skillRes.avgPercentScore = parseFloat((parseFloat(skillRes.comparePercentScore) + parseFloat(skillRes.percentScore)) / 2).toFixed(2);
                                                                        if (skillRes.pointsScore == skillRes.comparePointsScore) {
                                                                            skillRes.trend = "Equal";
                                                                        }
                                                                        else {
                                                                            skillRes.trend = skillRes.pointsScore < skillRes.comparePointsScore ? "Down" : "Up";
                                                                        }
                                                                    }
                                                                    else {
                                                                        skillRes.comparePointsScore = null;
                                                                        skillRes.comparePercentScore = null;
                                                                        skillRes.avgPointScore = null;
                                                                        skillRes.avgPercentScore = null;
                                                                        skillRes.trend = null;

                                                                    }
                                                                }

                                                            });

                                                            var columns = [
                                                                { field: "pgName", title: $translate.instant('COMMON_PERFORMANCE_GROUP'), width: "11%" },
                                                                { field: "skillName", title: $translate.instant('COMMON_SKILL'), width: "11%" },
                                                                { field: "questionText", title: $translate.instant('DASHBOARD_QUESTION'), width: "11%" },
                                                                { field: "", title: $scope.ngReportData.mainParticipantsRaw.split(',')[0] + " " + $translate.instant('DASHBOARD_INDICATOR'), width: "5%", template: "<div ng-click='getKTAnswerDetail(#= (questionId != null)? questionId : ''#,#= (questionId != null)? participantId : ''#)' class='scale-circle' style='background: #: indicator #'></div>" },
                                                                { field: "", title: $scope.ngReportData.participantsRaw.split(',')[0] + " " + $translate.instant('DASHBOARD_INDICATOR'), width: "5%", template: "<div ng-click='getKTAnswerDetail(#= (questionId != null)? questionId : ''#,#= (questionId != null)? cParticipantId : ''#)' class='scale-circle' style='background: #: cIndicator #'></div>" },
                                                                { field: "pointsScore", title: $scope.ngReportData.mainParticipantsRaw.split(',')[0] + " " + $translate.instant('DASHBOARD_POINTS_SCORE'), width: columnWidthText, template: "<div class='number' style='color:" + colorMainPart + "'>#= (pointsScore == null) ? ' ' : pointsScore #</div>" },
                                                                { field: "comparePointsScore", title: $scope.ngReportData.participantsRaw.split(',')[0] + " " + $translate.instant('DASHBOARD_POINTS_SCORE'), width: columnWidthText, template: "<div class='number' style='color:" + colorComparePart + "'>#= (comparePointsScore == null) ? ' ' : comparePointsScore #</div>" },
                                                                { field: "percentScore", title: $scope.ngReportData.mainParticipantsRaw.split(',')[0] + " " + $translate.instant('COMMON_SCORE') + ", %", width: columnWidthText, template: "<div class='number' style='color:" + colorMainPart + "'>#= percentScore ? percentScore+'%' : '' #</div>" },
                                                                { field: "comparePercentScore", title: $scope.ngReportData.participantsRaw.split(',')[0] + " " + $translate.instant('COMMON_SCORE') + ", %", width: columnWidthText, template: "<div class='number' style='color:" + colorComparePart + "'>#= comparePercentScore ? comparePercentScore+'%' : '' #</div>" },
                                                                { field: "target", title: $translate.instant('DASHBOARD_BENCHMARK'), width: "6%", template: "<div class='number'>#= (benchmark == null) ? ' ' : benchmark #</div>", hidden: !$scope.ngReportData.isShowBenchmark },
                                                                { field: "trend", title: $translate.instant('DASHBOARD_TREND'), width: "4%", template: "<div class='trend-#: trend #'></div>" },
                                                                { field: "weight", title: $translate.instant('DASHBOARD_WEIGHT'), width: "6%", template: "<div class='number'>#= (weight == null) ? ' ' : weight #</div>" },
                                                                { field: "csf", title: $translate.instant('DASHBOARD_CSF'), width: "12%", template: "#= (csf == null) ? ' ' : csf #" },
                                                                { field: "avgPointScore", title: $translate.instant('DASHBOARD_AVG_POINT_SCORE'), width: "12%", template: "#= (avgPointScore == null) ? ' ' : avgPointScore #" },
                                                                { field: "avgPercentScore", title: $translate.instant('DASHBOARD_AVG_PERCENT_SCORE'), width: "12%", template: "<div class='number'>#= avgPercentScore ? avgPercentScore+'%' : '' #</div>" },
                                                                { field: "action", title: $translate.instant('COMMON_ACTION'), width: "12%", template: "#= (action == null) ? ' ' : action #" }
                                                            ];
                                                            //dialogService.showKTGridDialog("Performance Group Details - ", dataSource($scope.scorecard.reportData.skillResults), columns);
                                                            //var linkFn = $compile($("#ktGridDialogWindow"));
                                                            //linkFn($scope);

                                                            var colorMainPart = "black";
                                                            var colorComparePart = "blue";
                                                            var columnWidth = 10;
                                                            var columnWidthText = columnWidth + "%";
                                                            var grid = $("#ktDetailsGrid").kendoTreeList({
                                                                dataSource: dataSource($scope.scorecard.reportData.skillResults),
                                                                loadOnDemand: false,
                                                                sortable: true,
                                                                filterable: {
                                                                    mode: "row"
                                                                },
                                                                columnMenu: true,
                                                                columns: columns
                                                            });
                                                            grid.data("kendoTreeList").thead.kendoTooltip({
                                                                filter: "th",
                                                                content: function (e) {
                                                                    var target = e.target; // element for which the tooltip is shown
                                                                    return $(target).text();
                                                                }
                                                            });
                                                        }
                                                        else {
                                                            dialogService.showNotification($translate.instant('DASHBOARD_SORRY_SELECTED_STAGE_IS_NOT_COMPARABLE'), "warning");
                                                        }

                                                    });
                                            }

                                            $scope.scorecard.legends = [];
                                            var showReport;
                                            var treeGrid = $("#scorecardGrid");
                                            if (treeGrid.length > 0) {
                                                var treelist = treeGrid.data("kendoTreeList"); //todo implement with angular
                                                var mainPostfix = " (" + $scope.filter.mainStageName + ", " + getById($scope.filter.mainProfileStepId, $scope.filter.mainStepsOfProfile).label + ")";
                                                var postfix = " (" + $scope.filter.stageName + ", " + getById($scope.filter.profileStepId, $scope.filter.stepsOfProfile).label + ")";
                                                if ($scope.filter.mainParticipantsModel.length > 0) {
                                                    $scope.scorecard.legends.push(getLegendNames($scope.filter.mainParticipantsModel, colorMainPart, $scope.filter.mainParticipantsOptions, mainPostfix));
                                                    showReport = true;
                                                }
                                                if ($scope.filter.participantsModel.length > 0) {
                                                    $scope.scorecard.legends.push(getLegendNames($scope.filter.participantsModel, colorComparePart, $scope.filter.participantsOptions, postfix));
                                                    showReport = true;
                                                }
                                            }
                                            else {
                                                showReport = false;
                                            }

                                            $scope.scorecard.isShowReport = showReport;
                                            $stateParams = [];
                                        });;


                                });
                        }
                        function getKTFloatChartData() {
                            var participantsPerfomanceGroups = [];
                            var compareParticipantsPerfomanceGroups = [];
                            var evaluatorParticipantsPerfomanceGroups = [];
                            var benchmarkPerfomanceGroups = [];
                            var index = 0;
                            _.forEach($scope.skillResultsParticipants, function (item, i) {
                                if (item.id > -1) {
                                    participantsPerfomanceGroups.push({ id: 0, name: item.pgName, series: [], categories: [] });
                                    index++;
                                }
                                else if (item.pgId > 0) {
                                    if (!participantsPerfomanceGroups[participantsPerfomanceGroups.length - 1].series.length > 0) {

                                        participantsPerfomanceGroups[participantsPerfomanceGroups.length - 1].series.push({ name: $scope.ngReportData.mainParticipantsRaw.split(',')[0], data: [], color: ktDashboardColors.main });
                                    }
                                    if (participantsPerfomanceGroups[participantsPerfomanceGroups.length - 1].id == 0) {
                                        participantsPerfomanceGroups[participantsPerfomanceGroups.length - 1].id = item.pgId;
                                    }
                                    participantsPerfomanceGroups[participantsPerfomanceGroups.length - 1].categories.push(item.skillName);
                                    participantsPerfomanceGroups[participantsPerfomanceGroups.length - 1].series[participantsPerfomanceGroups[participantsPerfomanceGroups.length - 1].series.length - 1].data.push(item.pointsScore);
                                }
                            });

                            _.forEach($scope.skillResultsCompareParticipants, function (item, i) {
                                if (item.id > -1) {
                                    compareParticipantsPerfomanceGroups.push({ id: 0, name: item.pgName, series: [], categories: [] });
                                    index++;
                                }
                                else if (item.pgId > 0) {
                                    if (!compareParticipantsPerfomanceGroups[compareParticipantsPerfomanceGroups.length - 1].series.length > 0) {
                                        compareParticipantsPerfomanceGroups[compareParticipantsPerfomanceGroups.length - 1].series.push({ name: $scope.ngReportData.participantsRaw.split(',')[0], data: [], color: ktDashboardColors.compare });
                                    }
                                    if (compareParticipantsPerfomanceGroups[compareParticipantsPerfomanceGroups.length - 1].id == 0) {
                                        compareParticipantsPerfomanceGroups[compareParticipantsPerfomanceGroups.length - 1].id = item.pgId;
                                    }
                                    compareParticipantsPerfomanceGroups[compareParticipantsPerfomanceGroups.length - 1].categories.push(item.skillName);
                                    compareParticipantsPerfomanceGroups[compareParticipantsPerfomanceGroups.length - 1].series[compareParticipantsPerfomanceGroups[compareParticipantsPerfomanceGroups.length - 1].series.length - 1].data.push(item.pointsScore);
                                }
                            });

                            _.forEach($scope.skillResultsEvaluator, function (item, i) {
                                if (item.id > -1) {
                                    evaluatorParticipantsPerfomanceGroups.push({ id: 0, name: item.pgName, series: [], categories: [] });
                                    index++;
                                }
                                else if (item.pgId > 0) {
                                    if (!evaluatorParticipantsPerfomanceGroups[evaluatorParticipantsPerfomanceGroups.length - 1].series.length > 0) {
                                        evaluatorParticipantsPerfomanceGroups[evaluatorParticipantsPerfomanceGroups.length - 1].series.push({ name: "Evaluator", data: [], color: evaluatorColor });
                                    }
                                    if (evaluatorParticipantsPerfomanceGroups[evaluatorParticipantsPerfomanceGroups.length - 1].id == 0) {
                                        evaluatorParticipantsPerfomanceGroups[evaluatorParticipantsPerfomanceGroups.length - 1].id = item.pgId;
                                    }
                                    evaluatorParticipantsPerfomanceGroups[evaluatorParticipantsPerfomanceGroups.length - 1].categories.push(item.skillName);
                                    evaluatorParticipantsPerfomanceGroups[evaluatorParticipantsPerfomanceGroups.length - 1].series[evaluatorParticipantsPerfomanceGroups[evaluatorParticipantsPerfomanceGroups.length - 1].series.length - 1].data.push(item.pointsScore);
                                }
                            });
                            _.forEach($scope.skillResultsBenchmark, function (item, i) {
                                if (item.id > -1) {
                                    benchmarkPerfomanceGroups.push({ id: 0, name: item.pgName, series: [], categories: [] });
                                    index++;
                                }
                                else if (item.pgId > 0) {
                                    if (!benchmarkPerfomanceGroups[benchmarkPerfomanceGroups.length - 1].series.length > 0) {
                                        benchmarkPerfomanceGroups[benchmarkPerfomanceGroups.length - 1].series.push({ name: "BenchMark", data: [], color: ktDashboardColors.benchmark });
                                    }
                                    if (benchmarkPerfomanceGroups[benchmarkPerfomanceGroups.length - 1].id == 0) {
                                        benchmarkPerfomanceGroups[benchmarkPerfomanceGroups.length - 1].id = item.pgId;
                                    }
                                    benchmarkPerfomanceGroups[benchmarkPerfomanceGroups.length - 1].categories.push(item.skillName);
                                    benchmarkPerfomanceGroups[benchmarkPerfomanceGroups.length - 1].series[benchmarkPerfomanceGroups[benchmarkPerfomanceGroups.length - 1].series.length - 1].data.push(item.pointsScore);
                                }
                            });
                            $scope.skillResults = [];
                            _.forEach(participantsPerfomanceGroups, function (dataItem, i) {
                                $scope.skillResults.push({ id: dataItem.id, name: dataItem.name, series: dataItem.series, categories: dataItem.categories });

                                var compareParticipantsSkillResult = compareParticipantsPerfomanceGroups.filter(function (item) {
                                    if (item.name == dataItem.name) {
                                        return item;
                                    }
                                })
                                if (compareParticipantsSkillResult.length > 0) {
                                    _.forEach(compareParticipantsSkillResult[0].series, function (series) {
                                        $scope.skillResults[$scope.skillResults.length - 1].series.push(series)
                                    });
                                    _.forEach(compareParticipantsSkillResult[0].categories, function (category) {
                                        $scope.skillResults[$scope.skillResults.length - 1].categories.push(category);
                                    });


                                }

                                var evaluatorSkillResult = evaluatorParticipantsPerfomanceGroups.filter(function (item) {
                                    if (item.name == dataItem.name) {
                                        return item;
                                    }
                                });
                                if (evaluatorSkillResult.length > 0) {
                                    _.forEach(evaluatorSkillResult[0].series, function (series) {
                                        $scope.skillResults[$scope.skillResults.length - 1].series.push(series)
                                    });
                                    _.forEach(evaluatorSkillResult[0].categories, function (category) {
                                        $scope.skillResults[$scope.skillResults.length - 1].categories.push(category);
                                    });
                                }
                                var benchmarkSkillResult = benchmarkPerfomanceGroups.filter(function (item) {
                                    if (item.name == dataItem.name) {
                                        return item;
                                    }
                                });
                                if (benchmarkSkillResult.length > 0) {
                                    _.forEach(benchmarkSkillResult[0].series, function (series) {
                                        $scope.skillResults[$scope.skillResults.length - 1].series.push(series)
                                    });
                                    _.forEach(benchmarkSkillResult[0].categories, function (category) {
                                        $scope.skillResults[$scope.skillResults.length - 1].categories.push(category);
                                    });
                                }
                            });
                            //var graphsContainer = $($element).find(".GraphList");
                            //graphsContainer.empty();
                            //_.forEach($scope.skillResults, function (pg, i) {

                            //    var graphElemHtml = "<div><div>" + pg.name + "</div><div id='floatchart_" + i + "'></div></div>";
                            //    if (i == $scope.skillResults.length - 1) {
                            //        graphElemHtml += "<div><table><tr><td><button ng-click='getKTScorecardDialogDetail()' class='details-btn'>Details</button></td></tr></table><div>";
                            //    }
                            //    var linkFn = $compile(graphElemHtml);
                            //    var content = linkFn($scope);
                            //    $(graphsContainer).append(content);
                            //    var floatChart = $("#floatchart_" + i).kendoChart({
                            //        legend: {
                            //            position: "top",
                            //            visible: false
                            //        },
                            //        seriesDefaults: {
                            //            type: "column"
                            //        },
                            //        series: pg.series,
                            //        valueAxis: {
                            //            majorUnit: 1,
                            //            min: 0,
                            //            //max: reportModel.scale.scaleRanges[reportModel.scale.scaleRanges.length - 1].max,
                            //            labels: {
                            //                format: "{0}"
                            //            },
                            //            line: {
                            //                visible: true
                            //            },
                            //            axisCrossingValue: 0
                            //        },
                            //        categoryAxis: {
                            //            categories: _.uniq(pg.categories),
                            //            line: {
                            //                visible: false
                            //            },
                            //            labels: {
                            //                padding: { top: 0 }
                            //            }
                            //        },
                            //        legend: {
                            //            visible: true,
                            //            position: "bottom"
                            //        },
                            //        tooltip: {
                            //            visible: true,
                            //            background: "white",
                            //            format: "{0}",
                            //            template: "#= series.name #: #= value#"
                            //        }
                            //    });
                            //})
                            $scope.ktResultTypeChanged();
                        }
                        function setKTIndicatorColor(passScore, medalRule, skillResult) {
                            _.forEach(skillResult, function (dataItem) {
                                if (dataItem.id == -1) {
                                    if (_.isNull(dataItem.correctAnswersCountScore) || _.isUndefined(dataItem.correctAnswersCountScore) || dataItem.correctAnswersCountScore == 0) {
                                        dataItem.indicator = passScoreIndicator.failed;
                                        dataItem.cIndicator = passScoreIndicator.failed;
                                    }
                                    else {
                                        dataItem.indicator = passScoreIndicator.passed;
                                        dataItem.cIndicator = passScoreIndicator.passed;
                                    }
                                }
                            });
                            return skillResult;
                        }

                        function setCKTIndicatorColor(correctAnswersCountScore) {
                            var indicator = "";
                            if (_.isNull(correctAnswersCountScore) || _.isUndefined(correctAnswersCountScore) || correctAnswersCountScore == 0) {
                                indicator = passScoreIndicator.failed;
                            }
                            else {
                                indicator = passScoreIndicator.passed;
                            }
                            return indicator;
                        }

                        function setKTDetailIndicatorColor(data) {

                            _.forEach(data.skillResults, function (dataItem) {
                                if (dataItem.id == -1 || dataItem.id == undefined) {
                                    if (_.isNull(dataItem.correctAnswersCountScore) || _.isUndefined(dataItem.correctAnswersCountScore) || dataItem.correctAnswersCountScore == 0) {
                                        dataItem.indicator = passScoreIndicator.failed;
                                    }
                                    else {
                                        dataItem.indicator = passScoreIndicator.passed;
                                    }
                                }
                            });

                        }
                        function dataSource(scorecardData) {
                            return new kendo.data.TreeListDataSource({
                                data: scorecardData,
                                schema: {
                                    model: {
                                        id: "id",
                                        fields: {
                                            parentId: { type: "number", nullable: true },
                                            id: { type: "number" }
                                        },
                                        expanded: true
                                    }
                                }
                            });
                        }

                        $(window).resize(function () {
                            if (profileCharts && profileCharts.length > 0) {
                                angular.forEach(profileCharts, function (chart) {
                                    redrawChart(chart);
                                });
                            }
                        });

                        $scope.load = function () {
                            if (!reportModel) return;
                            var mainGraph = $($element).find(".MainGraph").empty();

                            if ($scope.pgModesModel && $scope.pgModesModel.length > 0 && reportModel.performanceGroups.length === $scope.pgModesModel.length) {

                            } else {
                                $scope.pgModesModel = [];
                                angular.forEach(reportModel.performanceGroups, function (pg, index) {
                                    $scope.pgModesModel.push({ id: index, value: 1 });
                                });
                            }

                            var largest = 0;
                            var largestIndex = -1;
                            if (reportModel && reportModel.performanceGroups) {
                                for (var i = 0; i < reportModel.performanceGroups.length; i++) {
                                    if (reportModel.performanceGroups[i].skills.length > largest) {
                                        largest = reportModel.performanceGroups[i].skills.length;
                                        largestIndex = i;
                                    }
                                }
                            }
                            if (reportModel.performanceGroups) {
                                var colorSeries = getColorSeries(reportModel);
                                drawPerfomanceGraph(mainGraph, largestIndex, reportModel.performanceGroups[largestIndex], colorSeries, null, null, null, 500);

                                var graphsContainer = $($element).find(".GraphList");
                                graphsContainer.empty();

                                $.each(reportModel.performanceGroups, function (index, value) {
                                    if (index != largestIndex) {
                                        var startDecorHtml = "<div class='col-md-3'>";
                                        var endDecorHtml = "</div>";
                                        drawPerfomanceGraph(graphsContainer, index, value, colorSeries, startDecorHtml, endDecorHtml, null, 300);
                                    }
                                });
                            }

                            // strong 3 questions
                            if (reportModel.isShowStrongKpi) {
                                $(".strongBox").empty();
                                $.each(reportModel.strongAreas, function (index, value) {
                                    var prc = percentage(reportModel.max, value.score);
                                    //var strongElemHtml = "<div class='GraphScoreBox'>";
                                    //strongElemHtml += "<h3 class='width80Perc'>" + value.name + "</h3>";
                                    //strongElemHtml += "<h4 class='width80Perc'>" + value.description + "</h4>";
                                    //var mainLegendPostfix = " (" + (!$scope.mainStageName || $scope.mainStageName == '' ? '' : $scope.mainStageName + ', ') + reportModel.profileTypeName + ")";
                                    //strongElemHtml += "<h4 class='width80Perc'>" + reportModel.label + mainLegendPostfix + "</h4>";
                                    //strongElemHtml += "<div class='GraphLiProc width80Perc FloatLeft'>";

                                    //strongElemHtml += "<div id='PGS" + index.toString() + "' class='GraphLiProc FloatLeft'></div>";
                                    //strongElemHtml += "</div>";
                                    //strongElemHtml += "<div class='GraphLiProc width20Perc FloatLeft'>";
                                    //strongElemHtml += "<span class='mArLeft015'>" + value.score.toString() + "</span>";
                                    //strongElemHtml += "</div>";

                                    //strongElemHtml += "</div>";

                                    var mainLegendPostfix = " (" + (!$scope.mainStageName || $scope.mainStageName == '' ? '' : $scope.mainStageName + ', ') + reportModel.profileTypeName + ")";
                                    var strongElemHtml = " <div class='GraphScoreBox portlet-body heding-bg performance-status-section'>" +
                                        "<span class='caption-subject box-sub-title'> " + value.name + "</span>" +

                                        "<p class='performance-status ph-dark'>" + value.description + "</p> " +
                                        "<p>" + reportModel.label + mainLegendPostfix +
                                        "<span class='performance-number text-right'>" + value.score.toString() + "</span>" +
                                        "</p>" +
                                        "<div class=''>" +
                                        "<div id='PGS" + index.toString() + "' class='progress mt-5'>" +
                                        "<div class='progress-bar progress-bar-striped bg-warning progress-bar-animated' role='progressbar' aria-valuenow='76' aria-valuemin='0' aria-valuemax='100' style='width: 76%'>76%</div>" +
                                        "</div>" +
                                        "</div >" +
                                        "</div>";

                                    $(".strongBox").append(strongElemHtml);

                                    $("#PGS" + index.toString() + ".progress").find(".progress-bar").width(prc + '%')
                                    $("#PGS" + index.toString() + ".progress").find(".progress-bar").text(prc + '%')


                                    //var progressBar;
                                    //progressBar = new ProgressBar("PGS" + index.toString(), { 'width': '100%', 'height': '30px' });
                                    //progressBarItem = {};
                                    //progressBarItem[ProgressBar.OPTION_NAME.ITEM_ID] = "item1";


                                    //progressBarItem[ProgressBar.OPTION_NAME.COLOR_ID] = ProgressBar.OPTION_VALUE.COLOR_ID.CUSTOM;
                                    //progressBarItem.color = getColor(value.score, reportModel.scale.scaleRanges);
                                    //progressBar.createItem(progressBarItem);
                                    //progressBar.setPercent(prc);

                                });

                                if ((reportModel.isCompare) && (reportModel.cStrongAreas)) {
                                    var isStrongKPIgenerated = false;
                                    if (reportModel.cParticipantIds && reportModel.participantsId) {
                                        if (reportModel.cParticipantIds.length == 1 && reportModel.participantsId.length == 1) {
                                            if (reportModel.cParticipantIds[0].id == reportModel.participantsId[0].id && reportModel.mainProfileStepId == 4 && reportModel.profileStepId == 4) {
                                                var indexPGS = 0;
                                                reportModel.benchMarkStrongKpi = [];
                                                _.forEach($(".strongBox .GraphScoreBox .caption-subject"), function (strongItem) {
                                                    var strongKPI = $(strongItem).text();

                                                    var obj = _.find(reportModel.strongAreas, function (pgSkill) {
                                                        return pgSkill.name == strongKPI;
                                                    });
                                                    if (obj && $(".strongBox #PGS" + indexPGS).length > 0) {
                                                        console.log("benchmark Graph =" + obj.cScore + " reportModel.score = " + obj.score);
                                                        //var comparestrongElemHtml = "";
                                                        ////comparestrongElemHtml += "<h3 class='width80Perc'>" + obj.name + "</h3>";
                                                        //var compareLegendPostfix = " (" + (!$scope.stageName || $scope.stageName == '' ? '' : $scope.stageName + ', ') + reportModel.cProfileTypeName + ")";
                                                        //comparestrongElemHtml += "<h4 class=''>" + reportModel.cLabel + compareLegendPostfix + "</h4>";
                                                        //comparestrongElemHtml += "<div class='compareGraphLiProc GraphLiProc width80Perc FloatLeft'>";

                                                        //comparestrongElemHtml += "<div id='PGSC" + indexPGS.toString() + "' class='benchmarkGraphLiProc GraphLiProc FloatLeft'></div>";
                                                        //comparestrongElemHtml += "</div>";
                                                        //comparestrongElemHtml += "<div class='compareGraphLiProc GraphLiProc width20Perc FloatLeft' style='margin-top:0px;' >";
                                                        //comparestrongElemHtml += "<span class='mArLeft015'>" + obj.cScore.toString() + "</span>";
                                                        ////comparestrongElemHtml += "<div style='clear:both;'>";
                                                        ////comparestrongElemHtml += getKPIImage(value.score, value.score);
                                                        //comparestrongElemHtml += "</div>";
                                                        //comparestrongElemHtml += "";
                                                        //$(".weakBox").append(comparestrongElemHtml);

                                                        var compareLegendPostfix = " (" + (!$scope.stageName || $scope.stageName == '' ? '' : $scope.stageName + ', ') + reportModel.cProfileTypeName + ")";
                                                        var comparestrongElemHtml = " <div>" +
                                                            "<p>" + reportModel.cLabel + compareLegendPostfix +
                                                            "<span class='performance-number text-right'>" + obj.cScore.toString() + "</span>" +
                                                            "</p>" +
                                                            "<div class=''>" +
                                                            "<div id='PGSC" + indexPGS.toString() + "' class='progress mt-5'>" +
                                                            "<div class='progress-bar progress-bar-striped bg-warning progress-bar-animated' role='progressbar' aria-valuenow='76' aria-valuemin='0' aria-valuemax='100' style='width: 76%'>76%</div>" +
                                                            "</div>" +
                                                            "</div >" +
                                                            "</div>";

                                                        $(".strongBox #PGS" + indexPGS).parents(".GraphScoreBox").append(comparestrongElemHtml);

                                                        var diffPercentage = setDiffrencePercentage(obj.score, obj.cScore, reportModel.max);
                                                        var graphElemHtml = "";
                                                        if (obj.score > 0) {
                                                            if (obj.cScore > obj.score) {
                                                                graphElemHtml += "<img  class='mArLeft015' src='images/dashboard/top-arrow-green.png' style='width:auto;height:20px;float:left;margin-left: 5px;'>";
                                                            } else if (obj.score == obj.cScore) {
                                                                graphElemHtml += "<img class='mArLeft015' src='images/dashboard/min-icon-big.png' style='width:auto;height:20px;float:left;margin-left: 5px;'>";
                                                            } else {
                                                                graphElemHtml += "<img  class='mArLeft015' src='images/dashboard/botm-arrow-red.png' style='width:auto;height:20px;float:left;margin-left: 5px;'>";
                                                            }
                                                        }
                                                        graphElemHtml += diffPercentage;
                                                        $(".strongBox #PGSC" + indexPGS).parents(".GraphScoreBox").find(".compareGraphLiProc.width20Perc").append(graphElemHtml);
                                                        if ((obj.cScore > 0)) {
                                                            reportModel.benchMarkStrongKpi.push(obj.cScore);
                                                            prcc = percentage(reportModel.max, obj.cScore);
                                                            if ($("#PGSC" + indexPGS).length > 0) {
                                                                $("#PGSC" + indexPGS.toString() + ".progress").find(".progress-bar").width(prc + '%')
                                                                $("#PGSC" + indexPGS.toString() + ".progress").find(".progress-bar").text(prc + '%')
                                                                //var progressBar;
                                                                //progressBar = new ProgressBar("PGSC" + indexPGS.toString(), { 'width': '100%', 'height': '30px' });
                                                                //progressBarItem = {};
                                                                //progressBarItem[ProgressBar.OPTION_NAME.ITEM_ID] = "item1";
                                                                //progressBarItem[ProgressBar.OPTION_NAME.COLOR_ID] = ProgressBar.OPTION_VALUE.COLOR_ID.CUSTOM;
                                                                //progressBarItem.color = getColor(obj.cScore, reportModel.scale.scaleRanges);
                                                                //progressBar.createItem(progressBarItem);
                                                                //progressBar.setPercent(prcc);
                                                            }
                                                        }
                                                        indexPGS++;
                                                        isStrongKPIgenerated = true
                                                    }

                                                });
                                            }
                                        }
                                    }

                                    if (!isStrongKPIgenerated) {
                                        $(".comparestrongBox").empty();
                                        var prcc = 0;

                                        $.each(reportModel.cStrongAreas, function (index, value) {
                                            prcc = percentage(reportModel.max, value.score);

                                            //var comaprestrongElemHtml = "<div class='GraphScoreBox'>";
                                            //comaprestrongElemHtml += "<h3 class='width80Perc'>" + value.name + "</h3>";
                                            //comaprestrongElemHtml += "<h4 class='width80Perc'>" + value.description + "</h4>";
                                            //var compareLegendPostfix = " (" + (!$scope.stageName || $scope.stageName == '' ? '' : $scope.stageName + ', ') + reportModel.cProfileTypeName + ")";
                                            //comaprestrongElemHtml += "<div class=''>" + reportModel.cLabel + compareLegendPostfix + "</div>";
                                            //comaprestrongElemHtml += "<div class='GraphLiProc width80Perc FloatLeft'>";
                                            //comaprestrongElemHtml += "<div id='PGSC" + index.toString() + "' class='GraphLiProc FloatLeft'></div>";
                                            //comaprestrongElemHtml += "</div>";
                                            //comaprestrongElemHtml += "<div class='GraphLiProc width20Perc FloatLeft' style='margin-top:0px;' >";
                                            //comaprestrongElemHtml += "<span class='mArLeft015'>" + value.score.toString() + "</span>";
                                            //comaprestrongElemHtml += "<div style='clear:both;'>";
                                            ////comaprestrongElemHtml += getKPIImage(value.score, value.score);
                                            //comaprestrongElemHtml += "</div>";
                                            //comaprestrongElemHtml += "</div>";

                                            var compareLegendPostfix = " (" + (!$scope.stageName || $scope.stageName == '' ? '' : $scope.stageName + ', ') + reportModel.cProfileTypeName + ")";
                                            var comaprestrongElemHtml = "<div class='GraphScoreBox portlet-body heding-bg performance-status-section'>" +
                                                "<span class='caption-subject box-sub-title'> " + value.name + "</span>" +

                                                "<p class='performance-status ph-dark'>" + value.description + "</p> " +
                                                "<p>" + reportModel.cLabel + compareLegendPostfix +
                                                "<span class='performance-number text-right'>" + value.score.toString() + "</span>" +
                                                "</p>" +
                                                "<div class=''>" +
                                                "<div id='PGSC" + index.toString() + "' class='progress mt-5'>" +
                                                "<div class='progress-bar progress-bar-striped bg-warning progress-bar-animated' role='progressbar' aria-valuenow='76' aria-valuemin='0' aria-valuemax='100' style='width: 76%'>76%</div>" +
                                                "</div>" +
                                                "</div >" +
                                                "</div>";

                                            $(".comparestrongBox").append(comaprestrongElemHtml);
                                            $("#PGSC" + index.toString() + ".progress").find(".progress-bar").width(prcc + '%')
                                            $("#PGSC" + index.toString() + ".progress").find(".progress-bar").text(prcc + '%')

                                            //var progressBar;
                                            //progressBar = new ProgressBar("PGSC" + index.toString(), { 'width': '100%', 'height': '30px' });
                                            //progressBarItem = {};
                                            //progressBarItem[ProgressBar.OPTION_NAME.ITEM_ID] = "item1";
                                            //progressBarItem[ProgressBar.OPTION_NAME.COLOR_ID] = ProgressBar.OPTION_VALUE.COLOR_ID.CUSTOM;
                                            //progressBarItem.color = getColor(value.score, reportModel.scale.scaleRanges);

                                            //progressBar.createItem(progressBarItem);
                                            //progressBar.setPercent(prcc);
                                        });
                                    }
                                }
                            }
                            if (reportModel.cParticipantIds) {
                                if (reportModel.cParticipantIds.length == 1) {

                                    if (reportModel.cParticipantIds[0].id == -1) {
                                        reportModel.benchMarkStrongKpi = [];
                                        var indexPGS = 0;
                                        _.forEach($(".strongBox .GraphScoreBox .caption-subject"), function (strongItem) {
                                            var strongKPI = $(strongItem).text();
                                            _.forEach(reportModel.performanceGroups, function (performanceGroupItem) {
                                                var obj = _.find(performanceGroupItem.skills, function (pgSkill) {
                                                    return pgSkill.name == strongKPI;
                                                });
                                                if (obj) {
                                                    var diffPercentage = setDiffrencePercentage(obj.cScore, obj.score, reportModel.max);
                                                    var graphElemHtml = "";
                                                    if (obj.score > 0) {
                                                        if (obj.score > obj.cScore) {
                                                            graphElemHtml += "<img  class='mArLeft015' src='images/dashboard/top-arrow-green.png' style='width:auto;height:20px;float:left;margin-left: 5px;'>";
                                                        } else if (obj.score == obj.cScore) {
                                                            graphElemHtml += "<img class='mArLeft015' src='images/dashboard/min-icon-big.png' style='width:auto;height:20px;float:left;margin-left: 5px;'>";
                                                        } else {
                                                            graphElemHtml += "<img  class='mArLeft015' src='images/dashboard/botm-arrow-red.png' style='width:auto;height:20px;float:left;margin-left: 5px;'>";
                                                        }
                                                    }
                                                    graphElemHtml += diffPercentage;
                                                    $(".strongBox #PGS" + indexPGS).parents(".GraphScoreBox").find(".GraphLiProc.width20Perc").append(graphElemHtml);

                                                    console.log("benchmark Graph =" + obj.cScore + " reportModel.score = " + obj.score);
                                                    //var comparestrongElemHtml = "";

                                                    //var compareLegendPostfix = " (" + (!$scope.stageName || $scope.stageName == '' ? '' : $scope.stageName + ', ') + reportModel.cProfileTypeName + ")";
                                                    //comparestrongElemHtml += "<h4 class=''>" + reportModel.cLabel + compareLegendPostfix + "</h4>";
                                                    //comparestrongElemHtml += "<div class='benchmarkGraphLiProc GraphLiProc width80Perc FloatLeft'>";

                                                    //comparestrongElemHtml += "<div id='PGSC" + indexPGS.toString() + "' class='benchmarkGraphLiProc GraphLiProc FloatLeft'></div>";
                                                    //comparestrongElemHtml += "</div>";
                                                    //comparestrongElemHtml += "<div class='benchmarkGraphLiProc GraphLiProc width20Perc FloatLeft' style='margin-top:0px;' >";
                                                    //comparestrongElemHtml += "<span class='mArLeft015'>" + obj.cScore.toString() + "</span>";
                                                    //comparestrongElemHtml += "<div style='clear:both;'>";
                                                    ////comparestrongElemHtml += getKPIImage(value.score, value.score);
                                                    //comparestrongElemHtml += "</div>";
                                                    //comparestrongElemHtml += "";


                                                    var compareLegendPostfix = " (" + (!$scope.stageName || $scope.stageName == '' ? '' : $scope.stageName + ', ') + reportModel.cProfileTypeName + ")";
                                                    var comparestrongElemHtml = " <div>" +
                                                        "<p>" + reportModel.cLabel + compareLegendPostfix +
                                                        "<span class='performance-number text-right'>" + obj.cScore.toString() + "</span>" +
                                                        "</p>" +
                                                        "<div class=''>" +
                                                        "<div id='PGSC" + indexPGS.toString() + "' class='progress mt-5'>" +
                                                        "<div class='progress-bar progress-bar-striped bg-warning progress-bar-animated' role='progressbar' aria-valuenow='76' aria-valuemin='0' aria-valuemax='100' style='width: 76%'>76%</div>" +
                                                        "</div>" +
                                                        "</div >" +
                                                        "</div>";


                                                    $(".strongBox #PGS" + indexPGS).parents(".GraphScoreBox").append(comparestrongElemHtml);
                                                    if ((obj.cScore > 0)) {
                                                        reportModel.benchMarkStrongKpi.push(obj.cScore);
                                                        prcc = percentage(reportModel.max, obj.cScore);
                                                        if ($("#PGSC" + indexPGS).length > 0) {
                                                            var progressBar;
                                                            progressBar = new ProgressBar("PGSC" + indexPGS.toString(), { 'width': '100%', 'height': '30px' });
                                                            progressBarItem = {};
                                                            progressBarItem[ProgressBar.OPTION_NAME.ITEM_ID] = "item1";
                                                            progressBarItem[ProgressBar.OPTION_NAME.COLOR_ID] = ProgressBar.OPTION_VALUE.COLOR_ID.CUSTOM;
                                                            progressBarItem.color = getColor(obj.cScore, reportModel.scale.scaleRanges);
                                                            progressBar.createItem(progressBarItem);
                                                            progressBar.setPercent(prcc);
                                                        }
                                                    }
                                                    indexPGS++;
                                                }
                                            })
                                        });
                                    }
                                }
                            }


                            if (reportModel.isShowWeakKpi) {
                                var isweakKPIgenerated = false;
                                $(".weakBox").empty();



                                $.each(reportModel.weakAreas, function (index, value) {
                                    var prc = percentage(reportModel.max, value.score);

                                    //var strongElemHtml = "<div class='GraphScoreBox'>";
                                    //strongElemHtml += "<h3 class='width80Perc'>" + value.name + "</h3>";
                                    //strongElemHtml += "<h4 class='width80Perc'>" + value.description + "</h4>";
                                    //var mainLegendPostfix = " (" + (!$scope.mainStageName || $scope.mainStageName == '' ? '' : $scope.mainStageName + ', ') + reportModel.profileTypeName + ")";
                                    //strongElemHtml += "<h4 class=''>" + reportModel.label + mainLegendPostfix + "</h4>";
                                    //strongElemHtml += "<div class='GraphLiProc width80Perc FloatLeft'>";
                                    //strongElemHtml += "<div id='PGF" + index.toString() + "' class='GraphLiProc FloatLeft'></div>";
                                    //strongElemHtml += "</div>";
                                    //strongElemHtml += "<div class='GraphLiProc width20Perc FloatLeft'>";
                                    //strongElemHtml += "<span class='mArLeft015'>" + value.score.toString() + "</span>";
                                    ////strongElemHtml += "<div style='clear:both;'>";
                                    //strongElemHtml += "</div>";
                                    //strongElemHtml += "</div>";

                                    var mainLegendPostfix = " (" + (!$scope.mainStageName || $scope.mainStageName == '' ? '' : $scope.mainStageName + ', ') + reportModel.profileTypeName + ")";

                                    var weakElemHtml = " <div class='GraphScoreBox portlet-body heding-bg performance-status-section'>" +
                                        "<span class='caption-subject box-sub-title'> " + value.name + "</span>" +
                                        "<p class='performance-status ph-dark'>" + value.description + "</p> " +
                                        "<p>" + reportModel.label + mainLegendPostfix +
                                        "<span class='performance-number text-right'>" + value.score.toString() + "</span>" +
                                        "</p>" +
                                        "<div class=''>" +
                                        "<div id='PGF" + index.toString() + "' class='progress mt-5'>" +
                                        "<div class='progress-bar progress-bar-striped bg-warning progress-bar-animated' role='progressbar' aria-valuenow='76' aria-valuemin='0' aria-valuemax='100' style='width: 76%'>76%</div>" +
                                        "</div>" +
                                        "</div >" +
                                        "</div>";
                                    $(".weakBox").append(weakElemHtml);
                                    //var progressBar;
                                    //progressBar = new ProgressBar("PGF" + index.toString(), { 'width': '100%', 'height': '30px' });
                                    //progressBarItem = {};
                                    //progressBarItem[ProgressBar.OPTION_NAME.ITEM_ID] = "item1";
                                    //progressBarItem[ProgressBar.OPTION_NAME.COLOR_ID] = ProgressBar.OPTION_VALUE.COLOR_ID.CUSTOM;
                                    //progressBarItem.color = getColor(value.score, reportModel.scale.scaleRanges);
                                    //progressBar.createItem(progressBarItem);
                                    //progressBar.setPercent(prc);
                                    $("#PGF" + index.toString() + ".progress").find(".progress-bar").width(prc + '%')
                                    $("#PGF" + index.toString() + ".progress").find(".progress-bar").text(prc + '%')

                                });


                                if ((reportModel.isCompare) && (reportModel.cWeakAreas)) {
                                    if (reportModel.cParticipantIds && reportModel.participantsId) {
                                        if (reportModel.cParticipantIds.length == 1 && reportModel.participantsId.length == 1) {
                                            if (reportModel.cParticipantIds[0].id == reportModel.participantsId[0].id && reportModel.mainProfileStepId == 4 && reportModel.profileStepId == 4) {
                                                var indexPGFC = 0;
                                                reportModel.benchMarkWeakKpi = [];
                                                _.forEach($(".weakBox .GraphScoreBox .caption-subject"), function (weakItem) {
                                                    var weakKPI = $(weakItem).text();
                                                    var obj = _.find(reportModel.weakAreas, function (pgSkill) {
                                                        return pgSkill.name == weakKPI;
                                                    });
                                                    if (obj && $(".weakBox #PGF" + indexPGFC).length > 0) {
                                                        console.log("benchmark Graph =" + obj.cScore + " reportModel.score = " + obj.score);
                                                        //var compareWeakElemHtml = "";
                                                        ////compareWeakElemHtml += "<h3 class='width80Perc'>" + obj.name + "</h3>";
                                                        //var compareLegendPostfix = " (" + (!$scope.stageName || $scope.stageName == '' ? '' : $scope.stageName + ', ') + reportModel.cProfileTypeName + ")";

                                                        //compareWeakElemHtml += "<h4 class='width80Perc'>" + reportModel.cLabel + compareLegendPostfix + "</h4>";
                                                        //compareWeakElemHtml += "<div class='compareGraphLiProc GraphLiProc width80Perc FloatLeft'>";
                                                        //compareWeakElemHtml += "<div id='PGFC" + indexPGFC.toString() + "' class='benchmarkGraphLiProc GraphLiProc FloatLeft'></div>";
                                                        //compareWeakElemHtml += "</div>";
                                                        //compareWeakElemHtml += "<div class='compareGraphLiProc GraphLiProc width20Perc FloatLeft' style='margin-top:0px;' >";
                                                        //compareWeakElemHtml += "<span class='mArLeft015'>" + obj.cScore.toString() + "</span>";
                                                        ////comparestrongElemHtml += "<div style='clear:both;'>";
                                                        ////comparestrongElemHtml += getKPIImage(value.score, value.score);
                                                        //compareWeakElemHtml += "</div>";
                                                        //compareWeakElemHtml += "";
                                                        ////$(".weakBox").append(comparestrongElemHtml);
                                                        var compareLegendPostfix = " (" + (!$scope.stageName || $scope.stageName == '' ? '' : $scope.stageName + ', ') + reportModel.cProfileTypeName + ")";
                                                        var compareWeakElemHtml = " <div>" +
                                                            "<p>" + reportModel.cLabel + compareLegendPostfix +
                                                            "<span class='performance-number text-right'>" + obj.cScore.toString() + "</span>" +
                                                            "</p>" +
                                                            "<div class=''>" +
                                                            "<div id='PGFC" + indexPGFC.toString() + "' class='progress mt-5'>" +
                                                            "<div class='progress-bar progress-bar-striped bg-warning progress-bar-animated' role='progressbar' aria-valuenow='76' aria-valuemin='0' aria-valuemax='100' style='width: 76%'>76%</div>" +
                                                            "</div>" +
                                                            "</div >" +
                                                            "</div>";
                                                        $(".weakBox #PGF" + indexPGFC).parents(".GraphScoreBox").append(compareWeakElemHtml);

                                                        var diffPercentage = setDiffrencePercentage(obj.score, obj.cScore, reportModel.max);
                                                        var graphElemHtml = "";
                                                        if (obj.score > 0) {
                                                            if (obj.cScore > obj.score) {
                                                                graphElemHtml += "<img  class='mArLeft015' src='images/dashboard/top-arrow-green.png' style='width:auto;height:20px;float:left;margin-left: 5px;'>";
                                                            } else if (obj.score == obj.cScore) {
                                                                graphElemHtml += "<img class='mArLeft015' src='images/dashboard/min-icon-big.png' style='width:auto;height:20px;float:left;margin-left: 5px;'>";
                                                            } else {
                                                                graphElemHtml += "<img  class='mArLeft015' src='images/dashboard/botm-arrow-red.png' style='width:auto;height:20px;float:left;margin-left: 5px;'>";
                                                            }
                                                        }
                                                        graphElemHtml += diffPercentage;
                                                        $(".weakBox #PGFC" + indexPGFC).parents(".GraphScoreBox").find(".compareGraphLiProc.width20Perc").append(graphElemHtml);
                                                        if ((obj.cScore > 0)) {
                                                            reportModel.benchMarkWeakKpi.push(obj.cScore);
                                                            prcc = percentage(reportModel.max, obj.cScore);

                                                            if ($("#PGFC" + indexPGFC).length > 0) {
                                                                //var progressBar;
                                                                //progressBar = new ProgressBar("PGFC" + indexPGFC.toString(), { 'width': '100%', 'height': '30px' });
                                                                //progressBarItem = {};
                                                                //progressBarItem[ProgressBar.OPTION_NAME.ITEM_ID] = "item1";
                                                                //progressBarItem[ProgressBar.OPTION_NAME.COLOR_ID] = ProgressBar.OPTION_VALUE.COLOR_ID.CUSTOM;
                                                                //progressBarItem.color = getColor(obj.cScore, reportModel.scale.scaleRanges);
                                                                //progressBar.createItem(progressBarItem);
                                                                //progressBar.setPercent(prcc);
                                                                $("#PGFC" + indexPGFC.toString() + ".progress").find(".progress-bar").width(prcc + '%')
                                                                $("#PGFC" + indexPGFC.toString() + ".progress").find(".progress-bar").text(prcc + '%')
                                                            }
                                                        }
                                                        indexPGFC++;
                                                        isweakKPIgenerated = true
                                                    }

                                                });
                                            }
                                        }
                                    }


                                    if (!isweakKPIgenerated) {
                                        $(".compareweakBox").empty();
                                        var prcc = 0;
                                        $.each(reportModel.cWeakAreas, function (index, value) {
                                            //var compareWeakElemHtml = "<div class='GraphScoreBox'>";
                                            //compareWeakElemHtml += "<h3 class='width80Perc'>" + value.name + "</h3>";
                                            //compareWeakElemHtml += "<h4 class='width80Perc'>" + value.description + "</h4>";
                                            //var compareLegendPostfix = " (" + (!$scope.stageName || $scope.stageName == '' ? '' : $scope.stageName + ', ') + reportModel.cProfileTypeName + ")";
                                            //compareWeakElemHtml += "<h4 class='width80Perc'>" + reportModel.cLabel + compareLegendPostfix + "</h4>";
                                            //compareWeakElemHtml += "<div class='GraphLiProc width80Perc FloatLeft'>";
                                            //compareWeakElemHtml += "<div id='PGFC" + index.toString() + "' class='GraphLiProc FloatLeft'></div>";
                                            //compareWeakElemHtml += "</div>";
                                            //compareWeakElemHtml += "<div class='GraphLiProc width20Perc FloatLeft' style='margin-top:0px;' >";
                                            //compareWeakElemHtml += "<span class='mArLeft015'>" + value.score.toString() + "</span>";
                                            //compareWeakElemHtml += "<div style='clear:both;'>";
                                            ////comparestrongElemHtml += getKPIImage(value.score, value.score);
                                            //compareWeakElemHtml += "</div>";
                                            //compareWeakElemHtml += "</div>";
                                            var compareLegendPostfix = " (" + (!$scope.stageName || $scope.stageName == '' ? '' : $scope.stageName + ', ') + reportModel.cProfileTypeName + ")";
                                            var compareWeakElemHtml = " <div class='GraphScoreBox portlet-body heding-bg performance-status-section'>" +
                                                "<span class='caption-subject box-sub-title'> " + value.name + "</span>" +

                                                "<p class='performance-status ph-dark'>" + value.description + "</p> " +
                                                "<p>" + reportModel.cLabel + compareLegendPostfix +
                                                "<span class='performance-number text-right'>" + value.score.toString() + "</span>" +
                                                "</p>" +
                                                "<div class=''>" +
                                                "<div id='PGFC" + index.toString() + "' class='progress mt-5'>" +
                                                "<div class='progress-bar progress-bar-striped bg-warning progress-bar-animated' role='progressbar' aria-valuenow='76' aria-valuemin='0' aria-valuemax='100' style='width: 76%'>76%</div>" +
                                                "</div>" +
                                                "</div >" +
                                                "</div>";
                                            $(".compareweakBox").append(compareWeakElemHtml);

                                            if ((reportModel.isCompare) && (value.score > 0)) {
                                                prcc = percentage(reportModel.max, value.score);
                                                if ($("#PGFC" + index).length > 0) {
                                                    //var progressBar;
                                                    //progressBar = new ProgressBar("PGFC" + index.toString(), { 'width': '100%', 'height': '30px' });
                                                    //progressBarItem = {};
                                                    //progressBarItem[ProgressBar.OPTION_NAME.ITEM_ID] = "item1";
                                                    //progressBarItem[ProgressBar.OPTION_NAME.COLOR_ID] = ProgressBar.OPTION_VALUE.COLOR_ID.CUSTOM;
                                                    //progressBarItem.color = getColor(value.score, reportModel.scale.scaleRanges);
                                                    //progressBar.createItem(progressBarItem);
                                                    //progressBar.setPercent(prcc);
                                                    $("#PGFC" + index.toString() + ".progress").find(".progress-bar").width(prcc + '%')
                                                    $("#PGFC" + index.toString() + ".progress").find(".progress-bar").text(prcc + '%')
                                                }
                                            }
                                        });
                                    }
                                }
                            }
                            if (reportModel.cParticipantIds) {
                                if (reportModel.cParticipantIds.length == 1) {
                                    if (reportModel.cParticipantIds[0].id == -1) {
                                        var indexPGF = 0;
                                        reportModel.benchMarkWeakKpi = [];
                                        _.forEach($(".weakBox .GraphScoreBox .caption-subject"), function (weakItem) {
                                            var weakKPI = $(weakItem).text();
                                            _.forEach(reportModel.performanceGroups, function (performanceGroupItem) {
                                                var obj = _.find(performanceGroupItem.skills, function (pgSkill) {
                                                    return pgSkill.name == weakKPI;
                                                });
                                                if (obj && $(".weakBox #PGF" + indexPGF).length > 0) {
                                                    var diffPercentage = setDiffrencePercentage(obj.cScore, obj.score, reportModel.max);
                                                    var graphElemHtml = "";
                                                    if (obj.score > 0) {
                                                        if (obj.score > obj.cScore) {
                                                            graphElemHtml += "<img  class='mArLeft015' src='images/dashboard/top-arrow-green.png' style='width:auto;height:20px;float:left;margin-left: 5px;'>";
                                                        } else if (obj.score == obj.cScore) {
                                                            graphElemHtml += "<img class='mArLeft015' src='images/dashboard/min-icon-big.png' style='width:auto;height:20px;float:left;margin-left: 5px;'>";
                                                        } else {
                                                            graphElemHtml += "<img  class='mArLeft015' src='images/dashboard/botm-arrow-red.png' style='width:auto;height:20px;float:left;margin-left: 5px;'>";
                                                        }
                                                    }
                                                    graphElemHtml += diffPercentage;
                                                    $(".weakBox #PGF" + indexPGF).parents(".GraphScoreBox").find(".GraphLiProc.width20Perc").append(graphElemHtml);

                                                    console.log("benchmark Graph =" + obj.cScore + " reportModel.score = " + obj.score);
                                                    //var comparestrongElemHtml = "";
                                                    ////comparestrongElemHtml += "<h3 class='width80Perc'>" + obj.name + "</h3>";
                                                    //var compareLegendPostfix = " (" + (!$scope.stageName || $scope.stageName == '' ? '' : $scope.stageName + ', ') + reportModel.cProfileTypeName + ")";
                                                    //comparestrongElemHtml += "<h4 class='width80Perc'>" + reportModel.cLabel + compareLegendPostfix + "</h4>";
                                                    //comparestrongElemHtml += "<div class='benchmarkGraphLiProc GraphLiProc width80Perc FloatLeft'>";
                                                    //comparestrongElemHtml += "<div id='PGFC" + indexPGF.toString() + "' class='benchmarkGraphLiProc GraphLiProc FloatLeft'></div>";
                                                    //comparestrongElemHtml += "</div>";
                                                    //comparestrongElemHtml += "<div class='benchmarkGraphLiProc GraphLiProc width20Perc FloatLeft' style='margin-top:0px;' >";
                                                    //comparestrongElemHtml += "<span class='mArLeft015'>" + obj.cScore.toString() + "</span>";
                                                    //comparestrongElemHtml += "<div style='clear:both;'>";
                                                    ////comparestrongElemHtml += getKPIImage(value.score, value.score);
                                                    //comparestrongElemHtml += "</div>";
                                                    //comparestrongElemHtml += "";
                                                    ////$(".weakBox").append(comparestrongElemHtml);
                                                    var compareLegendPostfix = " (" + (!$scope.stageName || $scope.stageName == '' ? '' : $scope.stageName + ', ') + reportModel.cProfileTypeName + ")";
                                                    var compareWeakElemHtml = " <div>" +
                                                        "<p>" + reportModel.cLabel + compareLegendPostfix +
                                                        "<span class='performance-number text-right'>" + obj.cScore.toString() + "</span>" +
                                                        "</p>" +
                                                        "<div class=''>" +
                                                        "<div id='PGFC" + indexPGF.toString() + "' class='progress mt-5'>" +
                                                        "<div class='progress-bar progress-bar-striped bg-warning progress-bar-animated' role='progressbar' aria-valuenow='76' aria-valuemin='0' aria-valuemax='100' style='width: 76%'>76%</div>" +
                                                        "</div>" +
                                                        "</div >" +
                                                        "</div>";

                                                    $(".weakBox #PGF" + indexPGF).parents(".GraphScoreBox").append(compareWeakElemHtml);
                                                    if ((obj.cScore > 0)) {
                                                        reportModel.benchMarkWeakKpi.push(obj.cScore);
                                                        prcc = percentage(reportModel.max, obj.cScore);

                                                        if ($("#PGFC" + indexPGF).length > 0) {
                                                            //var progressBar;
                                                            //progressBar = new ProgressBar("PGFC" + indexPGF.toString(), { 'width': '100%', 'height': '30px' });
                                                            //progressBarItem = {};
                                                            //progressBarItem[ProgressBar.OPTION_NAME.ITEM_ID] = "item1";
                                                            //progressBarItem[ProgressBar.OPTION_NAME.COLOR_ID] = ProgressBar.OPTION_VALUE.COLOR_ID.CUSTOM;
                                                            //progressBarItem.color = getColor(obj.cScore, reportModel.scale.scaleRanges);
                                                            //progressBar.createItem(progressBarItem);
                                                            //progressBar.setPercent(prcc);
                                                            $("#PGFC" + indexPGF.toString() + ".progress").find(".progress-bar").width(prcc + '%')
                                                            $("#PGFC" + indexPGF.toString() + ".progress").find(".progress-bar").text(prcc + '%')
                                                        }
                                                    }
                                                    indexPGF++;
                                                }
                                            })
                                        });
                                    }
                                }
                            }

                            $("<div id='tooltip'></div>").css({
                                position: "absolute",
                                display: "none",
                                border: "1px solid #fdd",
                                padding: "2px",
                                "background-color": "#fee",
                                opacity: 0.80
                            }).appendTo("body");

                            $('#gauge_total_score_value').html("<span style='color:" + gaugeSeriesColors.main + "; display: inline-block;'>" + reportModel.averageScore + "</span>");



                            if (reportModel.evaluatorsProfileScorecards) {
                                if (reportModel.evaluatorsProfileScorecards.length > 0) {
                                    if (!isNaN(reportModel.evaluatorsProfileScorecards[0].averageScore)) {
                                        var totalScoreEl = '<span style="color: #000000; display: inline - block;"> vs </span>';
                                        totalScoreEl += "<span style='color:" + gaugeSeriesColors.mainEvaluator + "; display: inline-block;'>";
                                        totalScoreEl += parseFloat(reportModel.evaluatorsProfileScorecards[0].averageScore).toFixed(1);
                                        totalScoreEl += '</span>';
                                        $($element).find("#gauge_total_score_value").append(totalScoreEl);
                                        //$('#gauge_total_score_value').text(reportModel.averageScore);
                                        if ($scope.ngReportData.isShowBenchmark) {

                                            var totalScoreEl = '<span style="color: #000000; display: inline - block;"> vs </span>';
                                            totalScoreEl += "<span style='color:" + gaugeSeriesColors.benchmark + "; display: inline-block;'>";
                                            totalScoreEl += $scope.ngReportData.performanceGroups[0].benchmark
                                            totalScoreEl += '</span>';
                                            $($element).find("#gauge_total_score_value").append(totalScoreEl);

                                            $("#gauge_total_score").kendoRadialGauge({
                                                pointer: [{
                                                    value: reportModel.averageScore,
                                                    color: gaugeSeriesColors.main,
                                                    cap: { size: 0.1 }
                                                }, {

                                                    value: $scope.ngReportData.performanceGroups[0].benchmark,
                                                    color: gaugeSeriesColors.benchmark,

                                                }, {
                                                    value: reportModel.evaluatorsProfileScorecards[0].averageScore,
                                                    color: gaugeSeriesColors.mainEvaluator,
                                                }],
                                                scale: {
                                                    min: reportModel.scale.scaleRanges[0].min,
                                                    minorUnit: 1,
                                                    startAngle: -30,
                                                    endAngle: 210,
                                                    max: reportModel.scale.scaleRanges[reportModel.scale.scaleRanges.length - 1].max,
                                                    ranges: reportModel.scale.scaleRanges,
                                                }
                                            });
                                        }
                                        else {
                                            $("#gauge_total_score").kendoRadialGauge({

                                                pointer: [{
                                                    value: reportModel.averageScore,
                                                    color: gaugeSeriesColors.main,
                                                    cap: { size: 0.1 }
                                                }, {
                                                    value: reportModel.evaluatorsProfileScorecards[0].averageScore,
                                                    color: gaugeSeriesColors.mainEvaluator,
                                                }],
                                                scale: {
                                                    min: reportModel.scale.scaleRanges[0].min,
                                                    minorUnit: 1,
                                                    startAngle: -30,
                                                    endAngle: 210,
                                                    max: reportModel.scale.scaleRanges[reportModel.scale.scaleRanges.length - 1].max,
                                                    ranges: reportModel.scale.scaleRanges,
                                                }
                                            });
                                        }
                                    }
                                    else {
                                        if ($scope.ngReportData.isShowBenchmark) {

                                            var totalScoreEl = '<span style="color: #000000; display: inline - block;"> vs </span>';
                                            totalScoreEl += "<span style='color:" + gaugeSeriesColors.benchmark + "; display: inline-block;'>";
                                            totalScoreEl += $scope.ngReportData.performanceGroups[0].benchmark
                                            totalScoreEl += '</span>';
                                            $($element).find("#gauge_total_score_value").append(totalScoreEl);

                                            $("#gauge_total_score").kendoRadialGauge({
                                                pointer: [{
                                                    value: reportModel.averageScore,
                                                    color: gaugeSeriesColors.main,
                                                    cap: { size: 0.1 }
                                                }, {
                                                    value: $scope.ngReportData.performanceGroups[0].benchmark,
                                                    color: gaugeSeriesColors.benchmark,
                                                }],
                                                scale: {
                                                    min: reportModel.scale.scaleRanges[0].min,
                                                    minorUnit: 1,
                                                    startAngle: -30,
                                                    endAngle: 210,
                                                    max: reportModel.scale.scaleRanges[reportModel.scale.scaleRanges.length - 1].max,
                                                    ranges: reportModel.scale.scaleRanges,
                                                }
                                            });
                                        }
                                        else {
                                            $("#gauge_total_score").kendoRadialGauge({
                                                pointer: {
                                                    value: reportModel.averageScore,
                                                    color: gaugeSeriesColors.main,
                                                },
                                                scale: {
                                                    min: reportModel.scale.scaleRanges[0].min,
                                                    minorUnit: 1,
                                                    startAngle: -30,
                                                    endAngle: 210,
                                                    max: reportModel.scale.scaleRanges[reportModel.scale.scaleRanges.length - 1].max,
                                                    ranges: reportModel.scale.scaleRanges,
                                                }
                                            });
                                        }
                                    }
                                }
                                else {


                                    if ($scope.ngReportData.isShowBenchmark) {

                                        var totalScoreEl = '<span style="color: #000000; display: inline - block;"> vs </span>';
                                        totalScoreEl += "<span style='color:" + gaugeSeriesColors.benchmark + "; display: inline-block;'>";
                                        totalScoreEl += $scope.ngReportData.performanceGroups[0].benchmark
                                        totalScoreEl += '</span>';
                                        $($element).find("#gauge_total_score_value").append(totalScoreEl);

                                        $("#gauge_total_score").kendoRadialGauge({
                                            pointer: [{
                                                value: reportModel.averageScore,
                                                color: gaugeSeriesColors.main,
                                                cap: { size: 0.1 }
                                            }, {
                                                value: $scope.ngReportData.performanceGroups[0].benchmark,
                                                color: gaugeSeriesColors.benchmark,
                                            }],
                                            scale: {
                                                min: reportModel.scale.scaleRanges[0].min,
                                                minorUnit: 1,
                                                startAngle: -30,
                                                endAngle: 210,
                                                max: reportModel.scale.scaleRanges[reportModel.scale.scaleRanges.length - 1].max,
                                                ranges: reportModel.scale.scaleRanges,
                                            }
                                        });
                                    }
                                    else {
                                        $("#gauge_total_score").kendoRadialGauge({
                                            pointer: {
                                                value: reportModel.averageScore,
                                                color: gaugeSeriesColors.main,
                                            },
                                            scale: {
                                                min: reportModel.scale.scaleRanges[0].min,
                                                minorUnit: 1,
                                                startAngle: -30,
                                                endAngle: 210,
                                                max: reportModel.scale.scaleRanges[reportModel.scale.scaleRanges.length - 1].max,
                                                ranges: reportModel.scale.scaleRanges,
                                            }
                                        });
                                    }
                                }
                            }
                            else {
                                if ($scope.ngReportData.isShowBenchmark) {

                                    var totalScoreEl = '<span style="color: #000000; display: inline - block;"> vs </span>';
                                    totalScoreEl += "<span style='color:" + gaugeSeriesColors.benchmark + "; display: inline-block;'>";
                                    totalScoreEl += $scope.ngReportData.performanceGroups[0].benchmark
                                    totalScoreEl += '</span>';
                                    $($element).find("#gauge_total_score_value").append(totalScoreEl);

                                    $("#gauge_total_score").kendoRadialGauge({
                                        pointer: [{
                                            value: reportModel.averageScore,
                                            color: gaugeSeriesColors.main,
                                            cap: { size: 0.1 }
                                        }, {
                                            value: $scope.ngReportData.performanceGroups[0].benchmark,
                                            color: gaugeSeriesColors.benchmark,
                                        }],
                                        scale: {
                                            min: reportModel.scale.scaleRanges[0].min,
                                            minorUnit: 1,
                                            startAngle: -30,
                                            endAngle: 210,
                                            max: reportModel.scale.scaleRanges[reportModel.scale.scaleRanges.length - 1].max,
                                            ranges: reportModel.scale.scaleRanges,
                                        }
                                    });
                                }
                                else {
                                    $("#gauge_total_score").kendoRadialGauge({
                                        pointer: {
                                            value: reportModel.averageScore,
                                            color: gaugeSeriesColors.main,
                                        },
                                        scale: {
                                            min: reportModel.scale.scaleRanges[0].min,
                                            minorUnit: 1,
                                            startAngle: -30,
                                            endAngle: 210,
                                            max: reportModel.scale.scaleRanges[reportModel.scale.scaleRanges.length - 1].max,
                                            ranges: reportModel.scale.scaleRanges,
                                        }
                                    });
                                }
                            }

                            if (!isNaN(reportModel.weakAverageScore)) {
                                $($element).find("#gauge_total_weak").parents(".ScoreboxList").show();
                                $('#gauge_total_weak_value').html("<span style='color:" + gaugeSeriesColors.main + "; display: inline-block;'>" + reportModel.weakAverageScore + "</span>");
                                if ($scope.ngReportData.isShowBenchmark) {
                                    var benchmarkAvg = 0;
                                    var benchmarkTotal = 0;
                                    _.each(reportModel.performanceGroups, function (pgItem) {
                                        if (pgItem.benchmark) {
                                            benchmarkTotal += pgItem.benchmark;
                                        }
                                    });
                                    if (benchmarkTotal > 0) {
                                        benchmarkAvg = parseInt(benchmarkTotal / reportModel.performanceGroups.length);
                                    }


                                    var totalScoreEl = '<span style="color: #000000; display: inline - block;"> vs </span>';
                                    totalScoreEl += "<span style='color:" + gaugeSeriesColors.benchmark + "'; display: inline-block;'>";
                                    totalScoreEl += benchmarkAvg;
                                    totalScoreEl += '</span>';
                                    $($element).find("#gauge_total_weak_value").append(totalScoreEl);

                                    $("#gauge_total_weak").kendoRadialGauge({
                                        pointer: [{
                                            value: reportModel.weakAverageScore,
                                            color: gaugeSeriesColors.main,
                                        },
                                        {
                                            value: benchmarkAvg,
                                            color: gaugeSeriesColors.benchmark,
                                        }],
                                        scale: {
                                            min: reportModel.scale.scaleRanges[0].min,
                                            minorUnit: 1,
                                            startAngle: -30,
                                            endAngle: 210,
                                            max: reportModel.scale.scaleRanges[reportModel.scale.scaleRanges.length - 1].max,
                                            labels: {
                                                position: "inside"
                                            },
                                            ranges: reportModel.scale.scaleRanges,
                                        }
                                    });

                                }
                                else {
                                    $("#gauge_total_weak").kendoRadialGauge({
                                        pointer: {
                                            value: reportModel.weakAverageScore,
                                            color: gaugeSeriesColors.main,
                                        },
                                        scale: {
                                            min: reportModel.scale.scaleRanges[0].min,
                                            minorUnit: 1,
                                            startAngle: -30,
                                            endAngle: 210,
                                            max: reportModel.scale.scaleRanges[reportModel.scale.scaleRanges.length - 1].max,
                                            labels: {
                                                position: "inside"
                                            },
                                            ranges: reportModel.scale.scaleRanges,
                                        }
                                    });
                                }
                                if (reportModel.evaluatorsProfileScorecards) {
                                    if (reportModel.evaluatorsProfileScorecards.length > 0) {
                                        if (!isNaN(reportModel.evaluatorsProfileScorecards[0].weakAverageScore)) {
                                            var totalScoreEl = '<span style="color: #000000; display: inline - block;"> vs </span>';
                                            totalScoreEl += "<span style='color:" + gaugeSeriesColors.mainEvaluator + "'; display: inline-block;'>";
                                            totalScoreEl += parseFloat(reportModel.evaluatorsProfileScorecards[0].weakAverageScore).toFixed(1);
                                            totalScoreEl += '</span>';
                                            $($element).find("#gauge_total_weak_value").append(totalScoreEl);
                                            //$('#gauge_total_score_value').text(reportModel.averageScore);

                                            $("#gauge_total_weak").kendoRadialGauge({
                                                //pointer: {
                                                //    value: reportModel.weakAverageScore
                                                //},
                                                pointer: [{
                                                    value: reportModel.weakAverageScore,
                                                    cap: { size: 0.1 },
                                                    color: gaugeSeriesColors.main,
                                                }, {
                                                    value: reportModel.evaluatorsProfileScorecards[0].weakAverageScore,
                                                    //color: "#005aff",
                                                    color: gaugeSeriesColors.mainEvaluator,
                                                }],
                                                scale: {
                                                    min: reportModel.scale.scaleRanges[0].min,
                                                    minorUnit: 1,
                                                    startAngle: -30,
                                                    endAngle: 210,
                                                    max: reportModel.scale.scaleRanges[reportModel.scale.scaleRanges.length - 1].max,
                                                    labels: {
                                                        position: "inside"
                                                    },
                                                    ranges: reportModel.scale.scaleRanges,
                                                }
                                            });
                                        }
                                    }
                                }
                            }
                            else {
                                $($element).find("#gauge_total_weak").parents(".ScoreboxList").hide();
                            }

                            if (!isNaN(reportModel.strongAverageScore)) {
                                $($element).find("#gauge_total_strong").parents(".ScoreboxList").show();
                                $('#gauge_total_strong_value').html("<span style='color:" + gaugeSeriesColors.main + "; display: inline-block;'>" + reportModel.strongAverageScore + "</span>");

                                if ($scope.ngReportData.isShowBenchmark) {
                                    var benchmarkAvg = 0;
                                    var benchmarkTotal = 0;
                                    _.each(reportModel.performanceGroups, function (pgItem) {
                                        if (pgItem.benchmark) {
                                            benchmarkTotal += pgItem.benchmark;
                                        }
                                    });
                                    if (benchmarkTotal > 0) {
                                        benchmarkAvg = parseInt(benchmarkTotal / reportModel.performanceGroups.length);
                                    }

                                    var totalScoreEl = '<span style="color: #000000; display: inline - block;"> vs </span>';
                                    totalScoreEl += "<span style='color:" + gaugeSeriesColors.benchmark + "'; display: inline-block;'>";
                                    totalScoreEl += benchmarkAvg;
                                    totalScoreEl += '</span>';
                                    $($element).find("#gauge_total_strong_value").append(totalScoreEl);

                                    $("#gauge_total_strong").kendoRadialGauge({
                                        pointer: [{
                                            value: reportModel.strongAverageScore,
                                            color: gaugeSeriesColors.main,
                                        },
                                        {
                                            value: benchmarkAvg,
                                            color: gaugeSeriesColors.benchmark,
                                        }],
                                        scale: {
                                            min: reportModel.scale.scaleRanges[0].min,
                                            minorUnit: 1,
                                            startAngle: -30,
                                            endAngle: 210,
                                            max: reportModel.scale.scaleRanges[reportModel.scale.scaleRanges.length - 1].max,
                                            labels: {
                                                position: "inside"
                                            },
                                            ranges: reportModel.scale.scaleRanges,
                                        }
                                    });


                                }
                                else {
                                    $("#gauge_total_strong").kendoRadialGauge({
                                        pointer: {
                                            value: reportModel.strongAverageScore,
                                            color: gaugeSeriesColors.main,
                                        },
                                        scale: {
                                            min: reportModel.scale.scaleRanges[0].min,
                                            minorUnit: 1,
                                            startAngle: -30,
                                            endAngle: 210,
                                            max: reportModel.scale.scaleRanges[reportModel.scale.scaleRanges.length - 1].max,
                                            labels: {
                                                position: "inside"
                                            },
                                            ranges: reportModel.scale.scaleRanges,
                                        }
                                    });
                                }

                                $("#gauge_total_strong").kendoRadialGauge({
                                    pointer: {
                                        value: reportModel.strongAverageScore,
                                        color: gaugeSeriesColors.main,
                                    },
                                    scale: {
                                        min: reportModel.scale.scaleRanges[0].min,
                                        minorUnit: 1,
                                        startAngle: -30,
                                        endAngle: 210,
                                        max: reportModel.scale.scaleRanges[reportModel.scale.scaleRanges.length - 1].max,
                                        labels: {
                                            position: "inside"
                                        },
                                        ranges: reportModel.scale.scaleRanges,
                                    }
                                });
                            }
                            else {
                                $($element).find("#gauge_total_strong").parents(".ScoreboxList").hide();
                            }
                            if (reportModel.evaluatorsProfileScorecards) {
                                if (reportModel.evaluatorsProfileScorecards.length > 0) {
                                    if (!isNaN(reportModel.evaluatorsProfileScorecards[0].strongAverageScore)) {
                                        var totalScoreEl = '<span style="color: #000000; display: inline - block;"> vs </span>';
                                        totalScoreEl += "<span style='color:" + gaugeSeriesColors.mainEvaluator + "; display: inline-block;'>";
                                        totalScoreEl += parseFloat(reportModel.evaluatorsProfileScorecards[0].strongAverageScore).toFixed(1);
                                        totalScoreEl += '</span>';
                                        $($element).find("#gauge_total_strong_value").append(totalScoreEl);
                                        //$('#gauge_total_score_value').text(reportModel.averageScore);

                                        $("#gauge_total_strong").kendoRadialGauge({
                                            pointer: [{
                                                value: reportModel.strongAverageScore,
                                                color: gaugeSeriesColors.main,
                                                cap: { size: 0.1 }
                                            }, {
                                                value: reportModel.evaluatorsProfileScorecards[0].strongAverageScore,
                                                color: gaugeSeriesColors.mainEvaluator,
                                            }],
                                            scale: {
                                                min: reportModel.scale.scaleRanges[0].min,
                                                minorUnit: 1,
                                                startAngle: -30,
                                                endAngle: 210,
                                                max: reportModel.scale.scaleRanges[reportModel.scale.scaleRanges.length - 1].max,
                                                labels: {
                                                    position: "inside"
                                                },
                                                ranges: reportModel.scale.scaleRanges,
                                            }
                                        });
                                    }
                                }
                            }


                            $("#kpiImageScore").empty();
                            $("#kpiImageStrong").empty();
                            $("#kpiImageWeak").empty();
                            if (reportModel.cAverageScore) {
                                if ((reportModel.cParticipantIds.length == 1 && reportModel.cParticipantIds[0].id == -1) || (reportModel.cParticipantIds.length == 1 && reportModel.cParticipantIds[0].id == reportModel.participantsId[0].id && reportModel.profileStepId == 4 && reportModel.mainProfileStepId == 4)) {

                                    if (reportModel.cAverageScore) {
                                        var totalScoreEl = '<span style="color: #000000; display: inline - block;"> VS  </span>';
                                        totalScoreEl += "<span style='color:" + gaugeSeriesColors.compare + "; display: inline-block;'>";
                                        totalScoreEl += parseFloat(reportModel.cAverageScore).toFixed(1);
                                        totalScoreEl += '</span>';
                                        $($element).find("#gauge_total_score_value").append(totalScoreEl);
                                        //$('#gauge_total_score_value').text(reportModel.averageScore);

                                        var imageElemHtml = getKPIImage(reportModel.averageScore, reportModel.cAverageScore)
                                        $("#kpiImageScore").html(imageElemHtml);
                                    }

                                    var old = $("#gauge_total_score").data("kendoRadialGauge").options.pointer;
                                    if (old.length > 0) {
                                        $("#gauge_total_score").data("kendoRadialGauge").options.pointer.push({
                                            value: reportModel.cAverageScore,
                                            color: gaugeSeriesColors.compare,
                                        });
                                        $("#gauge_total_score").data("kendoRadialGauge").redraw();
                                    }
                                    else {
                                        $("#gauge_total_score").data("kendoRadialGauge").options.pointer = [];
                                        $("#gauge_total_score").data("kendoRadialGauge").options.pointer.push(old);
                                        $("#gauge_total_score").data("kendoRadialGauge").options.pointer.push({
                                            value: reportModel.cAverageScore,
                                            color: gaugeSeriesColors.compare,
                                        });
                                        $("#gauge_total_score").data("kendoRadialGauge").redraw();
                                    }

                                    if (reportModel.benchMarkStrongKpi) {
                                        var benchMarkStrongKpiAvg = 0
                                        var strongKpitotalScores = _.sum(reportModel.benchMarkStrongKpi);
                                        benchMarkStrongKpiAvg = (strongKpitotalScores / reportModel.benchMarkStrongKpi.length);

                                        if (!isNaN(benchMarkStrongKpiAvg)) {
                                            var totalScoreEl = '<span style="color: #000000; display: inline - block;"> VS  </span>';
                                            totalScoreEl += "<span style='color:" + gaugeSeriesColors.compare + "; display: inline-block;'>";
                                            totalScoreEl += parseFloat(benchMarkStrongKpiAvg).toFixed(1);
                                            totalScoreEl += '</span>';
                                            $($element).find("#gauge_total_strong_value").append(totalScoreEl);
                                        }

                                        var old = $("#gauge_total_strong").data("kendoRadialGauge").options.pointer;
                                        if (old.length > 0) {
                                            $("#gauge_total_strong").data("kendoRadialGauge").options.pointer.push({
                                                value: benchMarkStrongKpiAvg,
                                                color: gaugeSeriesColors.compare,
                                            });
                                            $("#gauge_total_strong").data("kendoRadialGauge").redraw();
                                        }
                                        else {
                                            $("#gauge_total_strong").data("kendoRadialGauge").options.pointer = [];
                                            $("#gauge_total_strong").data("kendoRadialGauge").options.pointer.push(old);
                                            $("#gauge_total_strong").data("kendoRadialGauge").options.pointer.push({
                                                value: benchMarkStrongKpiAvg,
                                                color: gaugeSeriesColors.compare,
                                            });
                                            $("#gauge_total_strong").data("kendoRadialGauge").redraw();
                                        }
                                        if (benchMarkStrongKpiAvg != "NaN") {
                                            imageElemHtml = getKPIImage(reportModel.strongAverageScore, benchMarkStrongKpiAvg)
                                            $("#kpiImageStrong").html(imageElemHtml);
                                        }
                                        //$('#gauge_total_score_value').text(reportModel.averageScore);
                                    }

                                    if (reportModel.benchMarkWeakKpi) {
                                        var benchMarkWeakKpiAvg = 0
                                        var weakKpitotalScores = _.sum(reportModel.benchMarkWeakKpi);
                                        benchMarkWeakKpiAvg = (weakKpitotalScores / reportModel.benchMarkWeakKpi.length);

                                        var totalScoreEl = '<span style="color: #000000; display: inline - block;"> VS  </span>';
                                        totalScoreEl += "<span style='color:" + gaugeSeriesColors.compare + "; display: inline-block;'>";
                                        totalScoreEl += parseFloat(benchMarkWeakKpiAvg).toFixed(1);
                                        totalScoreEl += '</span>';
                                        $($element).find("#gauge_total_weak_value").append(totalScoreEl);


                                        var old = $("#gauge_total_weak").data("kendoRadialGauge").options.pointer;
                                        if (old.length > 0) {
                                            $("#gauge_total_weak").data("kendoRadialGauge").options.pointer.push({
                                                value: benchMarkWeakKpiAvg,
                                                color: gaugeSeriesColors.compare,
                                            });
                                            $("#gauge_total_weak").data("kendoRadialGauge").redraw();
                                        }
                                        else {
                                            $("#gauge_total_weak").data("kendoRadialGauge").options.pointer = [];
                                            $("#gauge_total_weak").data("kendoRadialGauge").options.pointer.push(old);
                                            $("#gauge_total_weak").data("kendoRadialGauge").options.pointer.push({
                                                value: benchMarkWeakKpiAvg,
                                                color: gaugeSeriesColors.compare,
                                            });
                                            $("#gauge_total_weak").data("kendoRadialGauge").redraw();
                                        }

                                        if (benchMarkWeakKpiAvg != "NaN") {
                                            imageElemHtml = getKPIImage(reportModel.weakAverageScore, benchMarkWeakKpiAvg)
                                            $("#kpiImageWeak").html(imageElemHtml);
                                        }
                                        //$('#gauge_total_score_value').text(reportModel.averageScore);
                                    }


                                }
                                if (!(reportModel.cParticipantIds.length == 1 && reportModel.cParticipantIds[0].id == -1)) {
                                    if (reportModel.cAverageScore) {
                                        var totalScoreEl = '<span style="color: #000000; display: inline - block;">  </span>';
                                        totalScoreEl += "<span style='color:" + gaugeSeriesColors.compare + "; display: inline-block;'>";
                                        totalScoreEl += parseFloat(reportModel.cAverageScore).toFixed(1);
                                        totalScoreEl += '</span>';
                                        $($element).find("#compare_gauge_total_score_value").html(totalScoreEl);
                                        //$('#gauge_total_score_value').text(reportModel.averageScore);
                                    }
                                    $("#compare_gauge_total_score").kendoRadialGauge({
                                        pointer: [{
                                            value: reportModel.cAverageScore,
                                            color: gaugeSeriesColors.compare,
                                        }],
                                        scale: {
                                            min: reportModel.scale.scaleRanges[0].min,
                                            minorUnit: 1,
                                            startAngle: -30,
                                            endAngle: 210,
                                            max: reportModel.scale.scaleRanges[reportModel.scale.scaleRanges.length - 1].max,
                                            labels: {
                                                position: "inside"
                                            },
                                            ranges: reportModel.scale.scaleRanges,
                                        }
                                    });

                                    if (reportModel.cEvaluatorsProfileScorecards) {
                                        if (reportModel.cEvaluatorsProfileScorecards.length > 0) {

                                            if (!isNaN(reportModel.cEvaluatorsProfileScorecards[0].averageScore)) {
                                                var totalScoreEl = '<span style="color: #000000; display: inline - block;"> vs </span>';
                                                totalScoreEl += "<span style='color:" + gaugeSeriesColors.mainEvaluator + "; display: inline-block;'>";
                                                totalScoreEl += parseFloat(reportModel.cEvaluatorsProfileScorecards[0].averageScore).toFixed(1);
                                                totalScoreEl += '</span>';
                                                $($element).find("#compare_gauge_total_score_value").append(totalScoreEl);
                                                //$('#gauge_total_score_value').text(reportModel.averageScore);
                                                $("#compare_gauge_total_score").empty();
                                                $("#compare_gauge_total_score").kendoRadialGauge({

                                                    pointer: [{
                                                        value: reportModel.cAverageScore,
                                                        color: gaugeSeriesColors.compare,
                                                        cap: { size: 0.1 }
                                                    }, {
                                                        value: reportModel.cEvaluatorsProfileScorecards[0].averageScore,
                                                        color: gaugeSeriesColors.compareEvaluator,
                                                    }],
                                                    scale: {
                                                        min: reportModel.scale.scaleRanges[0].min,
                                                        minorUnit: 1,
                                                        startAngle: -30,
                                                        endAngle: 210,
                                                        max: reportModel.scale.scaleRanges[reportModel.scale.scaleRanges.length - 1].max,
                                                        ranges: reportModel.scale.scaleRanges,
                                                    }
                                                });
                                            }
                                            else {


                                                if ($scope.ngReportData.isShowBenchmark) {

                                                    var totalScoreEl = '<span style="color: #000000; display: inline - block;"> vs </span>';
                                                    totalScoreEl += "<span style='color:" + gaugeSeriesColors.benchmark + "; display: inline-block;'>";
                                                    totalScoreEl += $scope.ngReportData.performanceGroups[0].benchmark
                                                    totalScoreEl += '</span>';
                                                    $($element).find("#gauge_total_score_value").append(totalScoreEl);

                                                    $("#compare_gauge_total_score").kendoRadialGauge({
                                                        pointer: [{
                                                            value: reportModel.cAverageScore,
                                                            color: gaugeSeriesColors.compare,
                                                            cap: { size: 0.1 }
                                                        }, {
                                                            value: $scope.ngReportData.performanceGroups[0].benchmark,
                                                            color: gaugeSeriesColors.benchmark,
                                                        }],
                                                        scale: {
                                                            min: reportModel.scale.scaleRanges[0].min,
                                                            minorUnit: 1,
                                                            startAngle: -30,
                                                            endAngle: 210,
                                                            max: reportModel.scale.scaleRanges[reportModel.scale.scaleRanges.length - 1].max,
                                                            ranges: reportModel.scale.scaleRanges,
                                                        }
                                                    });
                                                }
                                                else {
                                                    $("#compare_gauge_total_score").kendoRadialGauge({
                                                        pointer: {
                                                            value: reportModel.cAverageScore,
                                                            color: gaugeSeriesColors.compare,
                                                        },
                                                        scale: {
                                                            min: reportModel.scale.scaleRanges[0].min,
                                                            minorUnit: 1,
                                                            startAngle: -30,
                                                            endAngle: 210,
                                                            max: reportModel.scale.scaleRanges[reportModel.scale.scaleRanges.length - 1].max,
                                                            ranges: reportModel.scale.scaleRanges,
                                                        }
                                                    });
                                                }




                                            }
                                        }
                                    }

                                    if (reportModel.cWeakAverageScore > 0) {
                                        var totalScoreEl = '<span style="color: #000000; display: inline - block;">  </span>';
                                        totalScoreEl += "<span style='color:" + gaugeSeriesColors.compare + "; display: inline-block;'>";
                                        totalScoreEl += parseFloat(reportModel.cWeakAverageScore).toFixed(1);
                                        totalScoreEl += '</span>';
                                        $($element).find("#compare_gauge_total_weak_value").html(totalScoreEl);
                                        //$('#gauge_total_score_value').text(reportModel.averageScore);
                                    }

                                    $("#compare_gauge_total_weak").kendoRadialGauge({
                                        pointer: [{
                                            value: reportModel.cWeakAverageScore,
                                            color: gaugeSeriesColors.compare,
                                            //color: "#005aff",
                                        }],
                                        scale: {
                                            min: reportModel.scale.scaleRanges[0].min,
                                            minorUnit: 1,
                                            startAngle: -30,
                                            endAngle: 210,
                                            max: reportModel.scale.scaleRanges[reportModel.scale.scaleRanges.length - 1].max,
                                            labels: {
                                                position: "inside"
                                            },
                                            ranges: reportModel.scale.scaleRanges,
                                        }
                                    });


                                    if (reportModel.cEvaluatorsProfileScorecards) {
                                        if (reportModel.cEvaluatorsProfileScorecards.length > 0) {

                                            if (!isNaN(reportModel.cEvaluatorsProfileScorecards[0].weakAverageScore)) {
                                                var totalScoreEl = '<span style="color: #000000; display: inline - block;"> vs </span>';
                                                totalScoreEl += "<span style='color:" + gaugeSeriesColors.compareEvaluator + "; display: inline-block;'>";
                                                totalScoreEl += parseFloat(reportModel.cEvaluatorsProfileScorecards[0].weakAverageScore).toFixed(1);
                                                totalScoreEl += '</span>';
                                                $($element).find("#compare_gauge_total_weak_value").append(totalScoreEl);
                                                //$('#gauge_total_score_value').text(reportModel.averageScore);
                                                $("#compare_gauge_total_weak").empty();
                                                $("#compare_gauge_total_weak").kendoRadialGauge({

                                                    pointer: [{
                                                        value: reportModel.cWeakAverageScore,
                                                        color: gaugeSeriesColors.compare,
                                                        cap: { size: 0.1 }
                                                    }, {
                                                        value: reportModel.cEvaluatorsProfileScorecards[0].weakAverageScore,
                                                        color: gaugeSeriesColors.compareEvaluator,
                                                    }],
                                                    scale: {
                                                        min: reportModel.scale.scaleRanges[0].min,
                                                        minorUnit: 1,
                                                        startAngle: -30,
                                                        endAngle: 210,
                                                        max: reportModel.scale.scaleRanges[reportModel.scale.scaleRanges.length - 1].max,
                                                        ranges: reportModel.scale.scaleRanges,
                                                    }
                                                });
                                            }
                                        }
                                    }

                                    if (reportModel.cStrongAverageScore > 0) {
                                        var totalScoreEl = '<span style="color: #000000; display: inline - block;">  </span>';
                                        totalScoreEl += "<span style='color:" + gaugeSeriesColors.compare + "; display: inline-block;'>";
                                        totalScoreEl += parseFloat(reportModel.cStrongAverageScore).toFixed(1);
                                        totalScoreEl += '</span>';
                                        $($element).find("#compare_gauge_total_strong_value").html(totalScoreEl);
                                        //$('#gauge_total_score_value').text(reportModel.averageScore);
                                    }

                                    $("#compare_gauge_total_strong").kendoRadialGauge({
                                        pointer: [{
                                            value: reportModel.cStrongAverageScore,
                                            color: gaugeSeriesColors.compare,
                                            //color: "#005aff",
                                        }],
                                        scale: {
                                            min: reportModel.scale.scaleRanges[0].min,
                                            minorUnit: 1,
                                            startAngle: -30,
                                            endAngle: 210,
                                            max: reportModel.scale.scaleRanges[reportModel.scale.scaleRanges.length - 1].max,
                                            labels: {
                                                position: "inside"
                                            },
                                            ranges: reportModel.scale.scaleRanges,
                                        }
                                    });

                                    if (reportModel.cEvaluatorsProfileScorecards) {
                                        if (reportModel.cEvaluatorsProfileScorecards.length > 0) {

                                            if (!isNaN(reportModel.cEvaluatorsProfileScorecards[0].strongAverageScore)) {
                                                var totalScoreEl = '<span style="color: #000000; display: inline - block;"> vs </span>';
                                                totalScoreEl += "<span style='color:" + gaugeSeriesColors.compareEvaluator + "; display: inline-block;'>";
                                                totalScoreEl += parseFloat(reportModel.cEvaluatorsProfileScorecards[0].strongAverageScore).toFixed(1);
                                                totalScoreEl += '</span>';
                                                $($element).find("#compare_gauge_total_strong_value").append(totalScoreEl);
                                                //$('#gauge_total_score_value').text(reportModel.averageScore);
                                                $("#compare_gauge_total_strong").empty();
                                                $("#compare_gauge_total_strong").kendoRadialGauge({

                                                    pointer: [{
                                                        value: reportModel.cStrongAverageScore,
                                                        color: gaugeSeriesColors.compare,
                                                        cap: { size: 0.1 }
                                                    }, {
                                                        value: reportModel.cEvaluatorsProfileScorecards[0].strongAverageScore,
                                                        color: gaugeSeriesColors.compareEvaluator,
                                                    }],
                                                    scale: {
                                                        min: reportModel.scale.scaleRanges[0].min,
                                                        minorUnit: 1,
                                                        startAngle: -30,
                                                        endAngle: 210,
                                                        max: reportModel.scale.scaleRanges[reportModel.scale.scaleRanges.length - 1].max,
                                                        ranges: reportModel.scale.scaleRanges,
                                                    }
                                                });
                                            }
                                        }
                                    }

                                    if ((reportModel.cParticipantIds.length == 1 && reportModel.cParticipantIds[0].id == reportModel.participantsId[0].id && reportModel.profileStepId == 4 && reportModel.mainProfileStepId == 4)) {

                                        var imageElemHtml = getKPIImage(reportModel.averageScore, reportModel.cAverageScore)
                                        $("#kpiImageScore").html(imageElemHtml);

                                        if (reportModel.cStrongAverageScore != "NaN") {
                                            imageElemHtml = getKPIImage(reportModel.strongAverageScore, reportModel.cStrongAverageScore)

                                            $("#kpiImageStrong").html(imageElemHtml);
                                        }

                                        if (reportModel.cWeakAverageScore != "NaN") {
                                            imageElemHtml = getKPIImage(reportModel.weakAverageScore, reportModel.cWeakAverageScore)
                                            $("#kpiImageWeak").html(imageElemHtml);
                                        }
                                    }
                                    else {
                                        var imageElemHtml = getKPIImage(reportModel.averageScore, reportModel.cAverageScore)
                                        $("#kpiImageScore").html(imageElemHtml);

                                        if (reportModel.cStrongAverageScore != "NaN") {
                                            imageElemHtml = getKPIImage(reportModel.strongAverageScore, reportModel.cStrongAverageScore)
                                            $("#kpiImageStrong").html(imageElemHtml);
                                        }

                                        if (reportModel.cWeakAverageScore != "NaN") {
                                            imageElemHtml = getKPIImage(reportModel.weakAverageScore, reportModel.cWeakAverageScore)
                                            $("#kpiImageWeak").html(imageElemHtml);
                                        }
                                    }
                                }

                                //if (!(reportModel.cParticipantIds[0].id == -1)) {
                                //    var imageElemHtml = getKPIImage(reportModel.cAverageScore, reportModel.averageScore)
                                //    $("#kpiImageScore").append(imageElemHtml);

                                //    if (reportModel.cStrongAverageScore != "NaN") {
                                //        imageElemHtml = getKPIImage(reportModel.cStrongAverageScore, reportModel.strongAverageScore)
                                //        $("#kpiImageStrong").append(imageElemHtml);
                                //    }

                                //    if (reportModel.cWeakAverageScore != "NaN") {
                                //        imageElemHtml = getKPIImage(reportModel.cWeakAverageScore, reportModel.weakAverageScore)
                                //        $("#kpiImageWeak").append(imageElemHtml);
                                //    }
                                //}



                            }
                        };

                        $scope.goToScorecard = function () {
                            var mainParticipantIds = null;
                            var mainEvaluatorIds = null;
                            var participantIds = null;
                            var evaluatorIds = null;

                            var projectIds = null;
                            var mainStageId = $scope.ngReportData.mainStageId ? $scope.ngReportData.mainStageId : null;
                            var mainStageGroupId = $scope.ngReportData.profileStageGroupId ? $scope.ngReportData.profileStageGroupId : null;
                            var mainProfileStepId = $scope.ngReportData.mainProfileStepId ? $scope.ngReportData.mainProfileStepId : null;
                            var cStageId = $scope.ngReportData.cStageId ? $scope.ngReportData.cStageId : null;
                            var cProfileTypeId = $scope.ngReportData.cProfileTypeId ? $scope.ngReportData.cProfileTypeId : null;

                            if ($scope.ngReportData && $scope.ngReportData.participantsId) {
                                angular.forEach($scope.ngReportData.participantsId, function (participant) {
                                    mainParticipantIds = mainParticipantIds + participant.id + ';';
                                });
                            }

                            if ($scope.ngReportData && $scope.ngReportData.evaluatorsProfileScorecards && $scope.ngReportData.evaluatorsProfileScorecards.length == 1) {
                                angular.forEach($scope.ngReportData.evaluatorsProfileScorecards, function (eval) {
                                    mainEvaluatorIds = mainEvaluatorIds + eval.id + ';';
                                });
                            }

                            if ($scope.ngReportData && $scope.ngReportData.projectsModel) {
                                angular.forEach($scope.ngReportData.projectsModel, function (project) {
                                    projectIds = projectIds + project.id + ';';
                                });
                            }


                            if ($scope.ngReportData && $scope.ngReportData.cParticipantIds) {
                                angular.forEach($scope.ngReportData.cParticipantIds, function (participant) {
                                    participantIds = participantIds + participant.id + ';';
                                });
                            }

                            if ($scope.ngReportData && $scope.ngReportData.cEvaluatorsProfileScorecards && $scope.ngReportData.cEvaluatorsProfileScorecards.length == 1) {
                                angular.forEach($scope.ngReportData.cEvaluatorsProfileScorecards, function (eval) {
                                    evaluatorIds = evaluatorIds + eval.id + ';';
                                });
                            }

                            if ($scope.$parent.filter) {
                                localStorageService.set('perfomanceManagementFilterData', $scope.$parent.filter);


                                if ($scope.$parent.filter.mainEvaluatorsModel) {
                                    angular.forEach($scope.$parent.filter.mainEvaluatorsModel, function (eval) {
                                        mainEvaluatorIds = mainEvaluatorIds + eval.id + ';';
                                    });
                                }

                                if ($scope.$parent.filter.evaluatorsModel) {
                                    angular.forEach($scope.$parent.filter.evaluatorsModel, function (eval) {
                                        evaluatorIds = evaluatorIds + eval.id + ';';
                                    });
                                }
                            }
                            //organizationId: projectId: profileId: departmentId: teamId: mainParticipantIds: mainEvaluatorIds: mainStageId: mainProfileTypeID: participantIds: evaluatorIds: stageId: profileTypeID: isShowBenchmark
                            console.log($scope);
                            if ($scope.$parent.paneDepth == 2) {
                                $location.path("/home/performance/scorecard/"
                                    + $scope.organizationId + "/"
                                    + projectIds + "/"
                                    + $scope.profileId + "/"
                                    + mainStageGroupId + "/"
                                    + /*$scope.departmentId*/null + "/"
                                    + /*$scope.teamId*/null + "/"
                                    + mainParticipantIds + "/"
                                    + mainEvaluatorIds + "/"
                                    + mainStageId + "/"
                                    + mainProfileStepId + "/"
                                    + participantIds + "/"
                                    + evaluatorIds + "/"
                                    + cStageId + "/"
                                    + cProfileTypeId + "/"
                                    + $scope.ngReportData.isShowBenchmark);
                            } else {
                                $scope.$parent.$parent.selectScorecardTab();
                            }
                        };

                        $scope.$watch('ngReportData', function (newValue, oldValue) {
                            console.log("ngReportData");
                            if (newValue) {
                                $scope.init(newValue);
                            }
                        }, false);
                        $scope.$watch('ngCompareReportData', function (newValue, oldValue) {
                            if (newValue) {
                                $scope.init($scope.ngReportData);
                            }
                        }, false);
                        $scope.$watch('showReport', function (newValue, oldValue) {
                            if (newValue == false) {
                                $($element).find("#KTChart").empty();
                            }
                            $scope.ngDashboard.isShowReport = newValue;
                        }, false);
                        $scope.$watch('showCompareReport', function (newValue, oldValue) {
                            if (!newValue && $scope.ngDashboard.isShowReport) {
                                $scope.init($scope.ngReportData);
                            }
                        }, false);

                    }]
            };
        }])
        .directive('ktScoreCardDetailNew', ['$compile', function ($compile) {
            return {
                restrict: 'EA',
                templateUrl: 'views/surveyResult/views/kt-survey.result-popup.html',
                replace: true,
                controller: ['$scope', 'cssInjector', 'surveyService', 'medalTypesEnum', '$location', '$translate',
                    function ($scope, cssInjector, surveyService, medalTypesEnum, $location, $translate) {
                        //cssInjector.removeAll();
                        cssInjector.add('views/survey/kt-survey.css');
                        cssInjector.add('views/surveyResult/kt-survey.result.css');
                        var surveyResult = $scope.viewStage;
                        $scope.surveyStage;
                        $scope.mainStage;
                        $scope.viewStage;
                        $scope.stageEvolutionId = "null";
                        $scope.totalMaxPoints = 0;
                        $scope.correctAnswersScore = 0;
                        $scope.CompareCorrectAnswersScore = 0;
                        $scope.scoreSummary = [];
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
                            stage.questionsCount = $scope.totalMaxPoints; //stage.answers.length;
                            stage.correctAnswersPercent = Math.round(stage.correctAnswersCount * 100 / stage.questionsCount);




                            stage.medal = getMedal(stage.correctAnswersPercent);
                        }

                        $scope.hasMedalRules = function () {
                            if ($scope.medalRules) {
                                return true;
                            }
                            return false;
                        };

                        $scope.hasMedal = function () {
                            if ($scope.viewStage) {
                                if ($scope.viewStage.medal) {
                                    return $scope.viewStage.medal != medalTypesEnum.none;
                                }
                            }
                            return false;
                        };
                        $scope.hasCompareMedal = function () {
                            if ($scope.viewStage.Comparemedal) {
                                return $scope.viewStage.Comparemedal != medalTypesEnum.none;
                            }
                            return false;
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

                        var checkIsPassed = function (correctAnswersPercent) {
                            if ($scope.hasMedalRules()) {
                                if (correctAnswersPercent > $scope.medalRules.goldMedalMinScore) {
                                    return true;
                                }
                                else if (correctAnswersPercent > $scope.medalRules.silverMedalMinScore) {
                                    return true;
                                }
                                else if (correctAnswersPercent >= $scope.medalRules.bronzeMedalMinScore) {
                                    return true;
                                }
                                else {
                                    return false;
                                }
                            }
                            else {
                                return false;
                            }
                        };

                        var countCorrectAnswersCount = function (answers) {
                            var count = 0;
                            $scope.totalMaxPoints = 0;
                            _.forEach(answers, function (answer) {
                                $scope.totalMaxPoints += answer.scorePoint;
                                if (answer.isCorrect) {
                                    //count++;
                                    count += answer.scorePoint;
                                }
                            });
                            return count;
                        };

                        $scope.init = function () {
                            if (surveyResult == null) {
                                $scope.scoreSummary = [];
                                var participantsId = getParamsString($scope.ngReportData.participantsId);
                                surveyService.getKTSurveyResult($scope.profileId, $scope.ngReportData.stageId, participantsId, $scope.stageEvolutionId).then(function (data) {

                                    var answers = [];
                                    var groupedData = _.groupBy(data.answers, 'participantId');
                                    if (groupedData) {
                                        var length = Object.keys(groupedData).length;
                                        var index = 0;
                                        _.forEach(groupedData, function (groupItem, groupItemKey) {
                                            var correctAnswerCount = countCorrectAnswersCount(groupItem);
                                            var correctAnswersPercent = Math.round(correctAnswerCount * 100 / $scope.totalMaxPoints);

                                            $scope.scoreSummary.push({ participantId: groupItemKey, name: "", isPassed: checkIsPassed(correctAnswersPercent), medal: getMedal(correctAnswersPercent), correctAnswersCount: correctAnswerCount, questionsCount: $scope.totalMaxPoints, correctAnswersPercent: correctAnswersPercent });
                                            if (index == 0) {
                                                var itemIndex = 0;
                                                _.forEach(groupItem, function (item) {
                                                    var answerObj = { "participantId": "", "skillNames": "", "performanceGroupName": "", "questionText": "", "bemchmark": 0, "scorePoint": 0 };
                                                    answerObj.skillNames = item.skillNames;
                                                    answerObj.performanceGroupName = item.performanceGroupName;
                                                    answerObj.questionText = item.questionText;
                                                    answerObj.bemchmark = item.bemchmark;
                                                    answerObj.scorePoint = item.scorePoint;
                                                    for (var j = 0; j < length; j++) {
                                                        var keyName = Object.keys(groupedData)[j];
                                                        answerObj["points_" + keyName] = groupedData[keyName][itemIndex].points;
                                                        answerObj["isCorrect_" + keyName] = groupedData[keyName][itemIndex].isCorrect;
                                                        answerObj["isAvailable_" + keyName] = groupedData[keyName][itemIndex].isAvailable;


                                                    }
                                                    answers.push(answerObj);
                                                    itemIndex++;
                                                });
                                            }
                                            index++;
                                        });
                                        data.answers = answers;
                                    }
                                    surveyResult = data;


                                    surveyResult.mainParticipantName = $scope.ngReportData.mainParticipantsRaw.split(",")[0];
                                    $scope.answers = surveyResult.answers;
                                    $scope.medalRules = surveyResult.medalRules;
                                    $scope.medalTypes = medalTypesEnum;
                                    $scope.isPassed = surveyResult.isPassed;
                                    $scope.isCurrentViewResultByStage = true;


                                    if ($scope.ngReportData.cParticipantIds.length > 0) {
                                        var cParticipantsId = getParamsString($scope.ngReportData.cParticipantIds);
                                        surveyService.getKTSurveyResult($scope.profileId, $scope.ngReportData.cStageId, cParticipantsId, $scope.stageEvolutionId).then(function (data) {
                                            if (data) {
                                                surveyResult.compareParticipantAnswers = data.answers;



                                                var answers = [];
                                                var groupedData = _.groupBy(data.answers, 'participantId');
                                                if (groupedData) {
                                                    var length = Object.keys(groupedData).length;
                                                    var index = 0;
                                                    _.forEach(groupedData, function (groupItem, groupItemKey) {

                                                        var correctAnswerCount = countCorrectAnswersCount(groupItem);
                                                        var correctAnswersPercent = Math.round(correctAnswerCount * 100 / $scope.totalMaxPoints);
                                                        $scope.scoreSummary.push({ participantId: groupItemKey, name: "", isPassed: checkIsPassed(correctAnswersPercent), medal: getMedal(correctAnswersPercent), correctAnswersCount: correctAnswerCount, questionsCount: $scope.totalMaxPoints, correctAnswersPercent: correctAnswersPercent });
                                                        if (index == 0) {
                                                            _.forEach(surveyResult.answers, function (item) {
                                                                var itemIndex = _.findIndex(groupItem, function (resultItem) {
                                                                    return (_.isEqual(resultItem.skillNames, item.skillNames) && resultItem.questionText == item.questionText)
                                                                });


                                                                for (var j = 0; j < length; j++) {
                                                                    var keyName = Object.keys(groupedData)[j];
                                                                    item["comparePoints_" + keyName] = groupedData[keyName][itemIndex].points;
                                                                    item["comapreIsCorrect_" + keyName] = groupedData[keyName][itemIndex].isCorrect;
                                                                    item["comapreAvailable_" + keyName] = groupedData[keyName][itemIndex].isAvailable;
                                                                }

                                                            });
                                                        }
                                                        index++;

                                                    });
                                                    //data.answers = answers;
                                                }


                                                //_.forEach(surveyResult.answers, function (item) {
                                                //    var obj = _.find(data.answers, function (resultobj) {
                                                //        return (_.isEqual(resultobj.skillNames, item.skillNames) && resultobj.questionText == item.questionText)
                                                //    });
                                                //    if (obj) {
                                                //        item.comparePoints = obj.points;
                                                //        item.comapreAvailable = obj.isAvailable;
                                                //        item.comapreIsCorrect = obj.isCorrect;

                                                //    }
                                                //});
                                                $scope.surveyStage = surveyResult;

                                                surveyResult.compareCorrectAnswersCount = countCorrectAnswersCount(data.answers);
                                                surveyResult.compareQuestionsCount = $scope.totalMaxPoints, // data.answers.length;
                                                    surveyResult.compareCorrectAnswersPercent = Math.round(surveyResult.compareCorrectAnswersCount * 100 / surveyResult.compareQuestionsCount);
                                                surveyResult.compareParticipantName = $scope.ngReportData.participantsRaw.split(",")[0];
                                                surveyResult.compareParticipantIsPassed = data.isPassed;
                                                surveyResult.compareMedal = getMedal(surveyResult.compareCorrectAnswersPercent);
                                                surveyResult.compareAvailable = true;
                                                initStageData($scope.surveyStage);
                                                $scope.viewStage = $scope.surveyStage;
                                                var newFields = {};
                                                var newColums = [
                                                    { field: "skillNames", title: $translate.instant('COMMON_SKILL') },
                                                    { field: "performanceGroupName", title: $translate.instant('COMMON_PERFORMANCE_GROUP') },
                                                    { field: "questionText", title: $translate.instant('DASHBOARD_QUESTION') },
                                                    { field: "scorePoint", title: $translate.instant('DASHBOARD_MAX_POINTS'), aggregates: ["sum"], footerTemplate: "<div class='textCenter'>Total max points: #=sum#</div>", attributes: { "class": "textCenter" }, headerAttributes: { "class": "textCenter" } },
                                                    {
                                                        field: "bemchmark", title: $translate.instant('DASHBOARD_BENCHMARK'), attributes: { "class": "textCenter" }, headerAttributes: { "class": "textCenter" }, hidden: !$scope.ngReportData.isShowBenchmark
                                                    },
                                                ];
                                                var newAggregates = [{ field: "scorePoint", aggregate: "sum" }];
                                                _.forEach(Object.keys($scope.viewStage.answers[0]), function (item) {
                                                    newFields[item] = { type: typeof ($scope.viewStage.answers[0][item]) };
                                                    if (item.toLowerCase().indexOf("points") > -1) {
                                                        var Title = "Points";
                                                        var fieldObj = item.split("_");

                                                        var participantObj = _.find($scope.ngReportData.mainParticipants, function (participantItem) {
                                                            return participantItem.id == fieldObj[1];
                                                        })



                                                        var participantName = "";
                                                        if (participantObj) {
                                                            participantName = participantObj.label;
                                                        }
                                                        var summaryIndex = _.findIndex($scope.scoreSummary, function (item) { return item.participantId == fieldObj[1] });
                                                        $scope.scoreSummary[summaryIndex].name = participantName;

                                                        var columnItem = { field: item, title: participantName + " " + Title, aggregates: ["sum"], footerTemplate: "<div class='textCenter'>" + participantName + " earning points: #=sum#</div>", attributes: { "class": "textCenter" }, headerAttributes: { "class": "textCenter" } };

                                                        newColums.push(columnItem);
                                                        newAggregates.push({ field: item, aggregate: "sum" })

                                                    }

                                                    if (item.toLowerCase().indexOf("iscorrect_") > -1) {
                                                        var Title = "Rank";
                                                        var fieldObj = item.split("_");

                                                        var participantObj = _.find($scope.ngReportData.mainParticipants, function (participantItem) {
                                                            return participantItem.id == fieldObj[1];
                                                        })
                                                        var participantName = "";
                                                        if (participantObj) {
                                                            participantName = participantObj.label;
                                                        }

                                                        var columnItem = { field: item, title: participantName + " " + Title, template: "<div class='textCenter answer-mark #=" + item + "?'correct':'wrong'#'></div>", attributes: { "class": "textCenter" }, headerAttributes: { "class": "textCenter" } };
                                                        newColums.push(columnItem);
                                                        newAggregates.push({ field: item, aggregate: "sum" });
                                                    }



                                                    console.log(item + " : " + typeof ($scope.viewStage.answers[0][item]))
                                                });
                                                $("#scoreCardDetailsGrid").html("");
                                                $("#scoreCardDetailsGrid").kendoGrid({
                                                    dataSource: {
                                                        data: $scope.viewStage.answers,
                                                        schema: {
                                                            model: {
                                                                fields: newFields
                                                            }
                                                        },
                                                        aggregate: newAggregates
                                                    },

                                                    scrollable: true,
                                                    sortable: true,
                                                    filterable: false,

                                                    columns: newColums,
                                                });

                                                $scope.ktGroupByChanged();
                                            }
                                        });

                                    }
                                    else {
                                        $scope.surveyStage = surveyResult;
                                        initStageData($scope.surveyStage);
                                        $scope.viewStage = $scope.surveyStage;


                                        var newFields = {};
                                        var newColums = [
                                            { field: "skillNames", title: $translate.instant('COMMON_SKILL') },
                                            { field: "performanceGroupName", title: $translate.instant('COMMON_PERFORMANCE_GROUP') },
                                            { field: "questionText", title: $translate.instant('DASHBOARD_QUESTION') },
                                            { field: "scorePoint", title: $translate.instant('DASHBOARD_MAX_POINTS'), aggregates: ["sum"], footerTemplate: "<div class='textCenter'>Total max points: #=sum#</div>", attributes: { "class": "textCenter" }, headerAttributes: { "class": "textCenter" } },
                                            {
                                                field: "bemchmark", title: $translate.instant('DASHBOARD_BENCHMARK'), attributes: { "class": "textCenter" }, headerAttributes: { "class": "textCenter" }, hidden: !$scope.ngReportData.isShowBenchmark
                                            },
                                        ];
                                        var newAggregates = [{ field: "scorePoint", aggregate: "sum" }];
                                        _.forEach(Object.keys($scope.viewStage.answers[0]), function (item) {
                                            newFields[item] = { type: typeof ($scope.viewStage.answers[0][item]) };
                                            if (item.toLowerCase().indexOf("points") > -1) {
                                                var Title = "Points";
                                                var fieldObj = item.split("_");

                                                var participantObj = _.find($scope.ngReportData.mainParticipants, function (participantItem) {
                                                    return participantItem.id == fieldObj[1];
                                                })
                                                var participantName = "";
                                                if (participantObj) {
                                                    participantName = participantObj.label;
                                                }

                                                var summaryIndex = _.findIndex($scope.scoreSummary, function (item) { return item.participantId == fieldObj[1] });
                                                $scope.scoreSummary[summaryIndex].name = participantName;

                                                var columnItem = { field: item, title: participantName + " " + Title, aggregates: ["sum"], footerTemplate: "<div class='textCenter'>" + participantName + " earning points: #=sum#</div>", attributes: { "class": "textCenter" }, headerAttributes: { "class": "textCenter" } };

                                                newColums.push(columnItem);
                                                newAggregates.push({ field: item, aggregate: "sum" })

                                            }

                                            if (item.toLowerCase().indexOf("iscorrect_") > -1) {
                                                var Title = "Rank";
                                                var fieldObj = item.split("_");

                                                var participantObj = _.find($scope.ngReportData.mainParticipants, function (participantItem) {
                                                    return participantItem.id == fieldObj[1];
                                                })
                                                var participantName = "";
                                                if (participantObj) {
                                                    participantName = participantObj.label;
                                                }

                                                var columnItem = { field: item, title: participantName + " " + Title, template: "<div class='textCenter answer-mark #=" + item + "?'correct':'wrong'#'></div>", attributes: { "class": "textCenter" }, headerAttributes: { "class": "textCenter" } };
                                                newColums.push(columnItem);
                                                newAggregates.push({ field: item, aggregate: "sum" });
                                            }



                                            console.log(item + " : " + typeof ($scope.viewStage.answers[0][item]))
                                        });

                                        $("#scoreCardDetailsGrid").html("");
                                        $("#scoreCardDetailsGrid").kendoGrid({
                                            dataSource: {
                                                data: $scope.viewStage.answers,
                                                schema: {
                                                    model: {
                                                        fields: newFields
                                                    }
                                                },

                                                aggregate: newAggregates
                                            },

                                            scrollable: true,
                                            sortable: true,
                                            filterable: false,

                                            columns: newColums,
                                        });

                                        $scope.ktGroupByChanged();
                                    }

                                });

                            }
                            else {
                                $scope.answers = surveyResult.answers;
                                $scope.medalRules = surveyResult.medalRules;
                                $scope.medalTypes = medalTypesEnum;
                                $scope.isPassed = surveyResult.isPassed;
                                $scope.isCurrentViewResultByStage = true;
                                $scope.surveyStage = surveyResult;
                                initStageData($scope.surveyStage);
                                $scope.viewStage = $scope.surveyStage;


                                var newFields = {};
                                var newColums = [
                                    { field: "skillNames", title: $translate.instant('COMMON_SKILL') },
                                    { field: "performanceGroupName", title: $translate.instant('COMMON_PERFORMANCE_GROUP') },
                                    { field: "questionText", title: $translate.instant('DASHBOARD_QUESTION') },
                                    { field: "scorePoint", title: $translate.instant('DASHBOARD_MAX_POINTS'), aggregates: ["sum"], footerTemplate: "<div class='textCenter'>Total max points: #=sum#</div>", attributes: { "class": "textCenter" }, headerAttributes: { "class": "textCenter" } },
                                    {
                                        field: "bemchmark", title: $translate.instant('DASHBOARD_BENCHMARK'), attributes: { "class": "textCenter" }, headerAttributes: { "class": "textCenter" }, hidden: !$scope.ngReportData.isShowBenchmark
                                    },
                                ];
                                var newAggregates = [{ field: "scorePoint", aggregate: "sum" }];
                                _.forEach(Object.keys($scope.viewStage.answers[0]), function (item) {
                                    newFields[item] = { type: typeof ($scope.viewStage.answers[0][item]) };
                                    if (item.toLowerCase().indexOf("points") > -1) {
                                        var Title = "Points";
                                        var fieldObj = item.split("_");

                                        var participantObj = _.find($scope.ngReportData.mainParticipants, function (participantItem) {
                                            return participantItem.id == fieldObj[1];
                                        })
                                        var participantName = "";
                                        if (participantObj) {
                                            participantName = participantObj.label;
                                        }

                                        var summaryIndex = _.findIndex($scope.scoreSummary, function (item) { return item.participantId == fieldObj[1] });
                                        if ($scope.scoreSummary && summaryIndex > -1) {
                                            $scope.scoreSummary[summaryIndex].name = participantName;
                                        }
                                        var columnItem = { field: item, title: participantName + " " + Title, aggregates: ["sum"], footerTemplate: "<div class='textCenter'>" + participantName + " earning points: #=sum#</div>", attributes: { "class": "textCenter" }, headerAttributes: { "class": "textCenter" } };

                                        newColums.push(columnItem);
                                        newAggregates.push({ field: item, aggregate: "sum" })

                                    }

                                    if (item.toLowerCase().indexOf("iscorrect_") > -1) {
                                        var Title = "Rank";
                                        var fieldObj = item.split("_");

                                        var participantObj = _.find($scope.ngReportData.mainParticipants, function (participantItem) {
                                            return participantItem.id == fieldObj[1];
                                        })
                                        var participantName = "";
                                        if (participantObj) {
                                            participantName = participantObj.label;
                                        }

                                        var columnItem = { field: item, title: participantName + " " + Title, template: "<div class='textCenter answer-mark #=" + item + "?'correct':'wrong'#'></div>", attributes: { "class": "textCenter" }, headerAttributes: { "class": "textCenter" } };
                                        newColums.push(columnItem);
                                        newAggregates.push({ field: item, aggregate: "sum" });
                                    }



                                    console.log(item + " : " + typeof ($scope.viewStage.answers[0][item]))
                                });

                                $("#scoreCardDetailsGrid").html("");
                                $("#scoreCardDetailsGrid").kendoGrid({
                                    dataSource: {
                                        data: $scope.viewStage.answers,
                                        schema: {
                                            model: {
                                                fields: newFields
                                            }
                                        },

                                        aggregate: newAggregates
                                    },

                                    scrollable: true,
                                    sortable: true,
                                    filterable: false,

                                    columns: newColums,
                                });

                                $scope.ktGroupByChanged();
                            }
                        };

                        $scope.notification = function (message) {
                            $scope.notificationSavedSuccess.show(message, "info");
                        };

                        $scope.complete = function () {
                            $location.path("/home/kt_final_kpi/" + $state.profileId + "/" + $state.ngReportData.stageId + "/" + $scope.ngReportData.participantsId[0].id + '/' + $scope.stageEvolutionId);
                        }

                        $scope.isEvolutionStage = function () {
                            if (parseInt($scope.stageEvolutionId)) {
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
                            }
                            else {
                                if ($scope.mainStage) {
                                    $scope.viewStage = $scope.mainStage;
                                }
                                else {
                                    surveyService.getKTAggregatedSurveyResult($scope.profileId, $scope.ngReportData.stageId,
                                        $scope.ngReportData.participantsId[0].id, $scope.stageEvolutionId).then(function (data) {
                                            $scope.mainStage = data;
                                            initStageData($scope.mainStage);
                                            $scope.viewStage = $scope.mainStage;
                                        });
                                }
                            }

                        }

                        function getParamsString(idsArray) {
                            var idsStr = null;
                            if (idsArray && idsArray.length > 0) {
                                idsStr = "";
                                angular.forEach(idsArray, function (item) {
                                    idsStr += item.id + ";";
                                });
                            }
                            return idsStr;
                        }
                    }]
            };
        }])
        .directive('ktAnswerDetailNew', ['$compile', function ($compile) {
            return {
                restrict: 'EA',
                templateUrl: 'views/surveyAnalysis/views/kt-survey-analysis-popup.html',
                replace: true,
                controller: ['$scope', '$location', 'cssInjector', 'surveyAnalysisService', 'dialogService', 'answerTypesEnum',
                    function ($scope, $location, cssInjector, surveyAnalysisService, dialogService, answerTypesEnum) {
                        var analysisInfo = $scope.ngReportData.answerDetail;
                        var stageId = $scope.ngReportData.stageId;
                        var participantId = $scope.ngReportData.participantsId[0].id;
                        //cssInjector.removeAll();
                        cssInjector.add('views/surveyAnalysis/analysis.css');

                        $scope.currentAnswerIndex = 0;
                        if ($scope.ngReportData.index > 0) {
                            $scope.currentAnswerIndex = $scope.ngReportData.index;
                        }
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


                    }]
            };
        }])
        .directive('ktDevelopmentContractNew', ['$compile', function ($compile) {
            return {
                restrict: 'EA',
                templateUrl: 'views/ktFinalKPI/kt-final-kpi-popup.html',
                replace: true,
                controller: ['$scope', 'cssInjector', 'surveyService', '$stateParams'
                    , 'answerTypesEnum', 'dialogService', 'trainingsService', 'trainingSaveModeEnum', '$state', '$location', '$translate',
                    function ($scope, cssInjector, surveyService, $stateParams
                        , answerTypesEnum, dialogService, trainingsService, trainingSaveModeEnum, $state, $location, $translate) {
                        //cssInjector.removeAll();
                        cssInjector.add('views/finalkpi/finalkpi.css');
                        cssInjector.add('views/survey/kt-survey.css');
                        cssInjector.add('views/ktFinalKPI/kt-final-kpi.css');
                        $scope.finalKPIData = [];
                        var finalKPIPreviousResults;
                        var finalKPICurrentResult = [];
                        $scope.isShowPreviousResults = false;
                        $scope.durationMetrics;
                        $scope.organizationId = $scope.ngReportData.organizationId;
                        $scope.openTrainingPopupMode = {
                            isOpenNewTrainingPopup: false,
                            isOpenAddExistingTrainingPopup: false
                        };
                        $scope.stageEvolutionId = "null";
                        $scope.hasDevContract = false;
                        $scope.init = function () {
                            surveyService.getKTFinalKPI($scope.profileId, $scope.ngReportData.stageId, $scope.ngReportData.participantsId[0].id, $scope.stageEvolutionId)
                                .then(function (data) {
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
                                $scope.ngReportData.stageId,
                                $scope.stageEvolutionId,
                                $scope.ngReportData.participantsId[0].id,
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

                            var columns = [{ field: "name", title: $translate.instant('COMMON_TITLE') }, {
                                field: "startDateText",
                                title: $translate.instant('COMMON_START_DATE')
                            }, { field: "endDateText", title: $translate.instant('COMMON_END_DATE') }];

                            dialogService.showSelectableGridDialogForDatasource($translate.instant('DASHBOARD_SELECT_TRAINING'), columns, trainings).then(
                                function (data) {
                                    for (var i = 0, len = data.length; i < len; i++) {
                                        evaluationAgreement.agreement.trainings.push(data[i]);
                                    }
                                });
                        };

                        $scope.getDate = function (dt) {
                            return moment(kendo.parseDate(dt)).isValid() ? moment(kendo.parseDate(dt)).format('L') : null;
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
                            if (JSON.parse($scope.stageEvolutionId)) {
                                return true;
                            }
                            return false;
                        };

                        $scope.showPreviousResults = function () {
                            $scope.isShowPreviousResults = !$scope.isShowPreviousResults;
                            if ($scope.isShowPreviousResults) {
                                if (!finalKPIPreviousResults) {
                                    surveyService.getKTFinalKPIPreviousResults($scope.profileId, $scope.ngReportData.participantsId[0].id, $scope.stageEvolutionId)
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
                                + $scope.profileId + "/"
                                + $scope.ngReportData.stageId + "/"
                                + $scope.ngReportData.participantsId[0].id + "/"
                                + $scope.stageEvolutionId + "/devContract");
                        };

                        $scope.goToTrainingDiary = function () {
                            $location.path("/home/kt_final_kpi/"
                                + $scope.profileId + "/"
                                + $scope.ngReportData.stageId + "/"
                                + $scope.ngReportData.participantsId[0].id + "/"
                                + $scope.stageEvolutionId + "/trainingDiary");
                        }
                    }]
            };
        }])
        .directive('ngDashboardHome', ['$compile', function ($compile) {
            return {
                restrict: 'EA',
                templateUrl: 'directives/ngDashboardNew/ngDashboardHome.html',
                scope: {
                    ngReportData: '=',
                    ngCompareReportData: '=?',
                    profileId: '=',
                    organizationId: '=',
                    showReport: '=',
                    showGauge: '=',
                    showGraph: '=',
                    showKpiBar: '=',
                    showCompareKpi: "=",
                    showCompareGauge: "=",
                    showCompareReport: '=?',
                    graphsmode: '=',
                    mainStageName: '=',
                    stageName: '=',
                    profileType: '=',
                    ktStagesResults: '=?',
                    ktCompareStagesResult: '=?',
                },
                replace: true,
                controller: ['$scope', '$location', '$compile', 'apiService', 'dialogService', '$element', 'profilesTypesEnum', 'resulTypesEnum',
                    'passScoreIndicator', 'ktDashboardColors', 'scorecardsServiceNew', 'ktProfileTypesEnum', 'presentationModesEnum', 'surveyService', 'cssInjector', 'surveyAnalysisService', '$state', 'gaugeSeriesColors', 'localStorageService', '$translate', 'medalTypesEnum',
                    function ($scope, $location, $compile, apiService, dialogService, $element, profilesTypesEnum, resulTypesEnum,
                        passScoreIndicator, ktDashboardColors, scorecardsServiceNew, ktProfileTypesEnum, presentationModesEnum, surveyService, cssInjector, surveyAnalysisService, $state, gaugeSeriesColors, localStorageService, $translate, medalTypesEnum) {
                        //cssInjector.removeAll();
                        cssInjector.add('views/performance/scorecardNew/scorecard.css');
                        var reportModel;
                        var profileCharts = [];
                        $scope.scorecard = this;
                        $scope.scorecard.legends = [];
                        $scope.scorecard.reportData = [];
                        $scope.stageEvolutionId = "null";
                        $scope.ngDashboard = {
                            isShowReport: false,
                            isShowKTScoreCardDetail: false,
                            isShowKTDevelopmentContractDetail: false,
                            isShowKTAnswerDetail: false,
                            isShowKTDetailsGrid: false
                        };
                        $scope.ktProfileTypes = {
                            start: { id: 1, label: $translate.instant('COMMON_START_STAGE') },
                            final: { id: 2, label: $translate.instant('COMMON_FINAL_STAGE') }
                        };
                        $scope.participantId = 0;
                        $scope.profilesTypesEnum = profilesTypesEnum;
                        $scope.resultTypes = [
                            { id: resulTypesEnum.score, label: $translate.instant('COMMON_SCORE') },
                            { id: resulTypesEnum.percent, label: "%" },
                            { id: resulTypesEnum.correctAnswers, label: $translate.instant('COMMON_CORRECT_ANSWERS') },
                            { id: resulTypesEnum.resultTime, label: $translate.instant('COMMON_RESULT_TIME') + "(" + $translate.instant('COMMON_MINUTES') + ")" },
                            { id: resulTypesEnum.performancevsgoal, label: $translate.instant('COMMON_PERFORMANCE_VS_GOAL') }
                        ];
                        $scope.ktResultTypes = [
                            { id: 0, label: $translate.instant('COMMON_SELECT_RESULT') },
                            { id: 1, label: $translate.instant('COMMON_RESULT_PAGE') },
                            { id: 2, label: $translate.instant('COMMON_ANALYZE') },
                            { id: 3, label: $translate.instant('COMMON_DEVELOPMENT_CONTRACT') },
                            { id: 4, label: $translate.instant('DASHBOARD_SCORE_CARD') }
                        ];
                        $scope.groupBy = [{ id: 0, name: $translate.instant('COMMON_PERFORMANCE_GROUP') }, { id: 1, name: $translate.instant('COMMON_PERSPECTIVE') }];
                        $scope.viewStage = null;
                        $scope.presentationModes = [
                            { id: presentationModesEnum.Dashboard, label: $translate.instant('COMMON_DASHBOARD') },
                            { id: presentationModesEnum.PerSkill, label: $translate.instant('COMMON_PER_SKILL') },
                            { id: presentationModesEnum.StagesResults, label: $translate.instant('COMMON_STAGES_RESULTS') },
                            { id: presentationModesEnum.Scorecard, label: $translate.instant('COMMON_SCORECARD') },
                            { id: presentationModesEnum.PerPerfomanceGroup, label: $translate.instant('DASHBOARD_PER_PERFOMANCE_GROUP') },
                            { id: presentationModesEnum.Ananlysis, label: $translate.instant('DASHBOARD_ANANLYSIS') },
                        ];

                        $scope.kt = {
                            resultType: 1,
                            ktResultType: 1,
                            chartMode: 1,
                            groupById: 0,
                            presentationMode: presentationModesEnum.PerPerfomanceGroup,
                            gaugeTotalScore: [],
                            compareGaugeTotalScore: 0,
                            maxGaugeValue: 0,
                            passScore: 0,
                            totalScoreDescription: ''
                        };

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
                            stage.questionsCount = $scope.totalMaxPoints; //stage.answers.length;
                            stage.correctAnswersPercent = Math.round(stage.correctAnswersCount * 100 / stage.questionsCount);
                            stage.medal = getMedal(stage.correctAnswersPercent);
                        }
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
                        $scope.hasMedalRules = function () {
                            if ($scope.medalRules) {
                                return true;
                            }
                            return false;
                        };

                        $scope.hasMedal = function () {
                            if ($scope.viewStage.medal) {
                                return $scope.viewStage.medal != medalTypesEnum.none;
                            }
                            return false;
                        };
                        $scope.hasCompareMedal = function () {
                            if ($scope.viewStage.Comparemedal) {
                                return $scope.viewStage.Comparemedal != medalTypesEnum.none;
                            }
                            return false;
                        };

                        var countCorrectAnswersCount = function (answers) {
                            var count = 0;
                            $scope.totalMaxPoints = 0;
                            _.forEach(answers, function (answer) {
                                $scope.totalMaxPoints += answer.scorePoint;
                                if (answer.isCorrect) {
                                    //count++;
                                    count += answer.scorePoint;
                                }
                            });
                            return count;
                        };
                        $scope.skillResults = [];
                        $scope.skillResultsParticipants = [];
                        $scope.skillResultsEvaluator = [];
                        $scope.skillResultsCompareParticipants = [];
                        $scope.ktGroupByChanged = function () {
                            var obj = $("#scoreCardDetailsGrid").data("kendoGrid");
                            if (obj) {
                                if ($scope.kt.groupById == $scope.groupBy[0].id) {
                                    obj.dataSource.group({ field: "performanceGroupName" });
                                }
                                else {
                                    obj.dataSource.group([]);
                                }
                            }

                        }

                        $scope.ktResultTypeChanged = function () {
                            $("#home_ktresulttypes").html("");
                            $scope.ngDashboard.isShowKTScoreCardDetail = false;
                            $scope.ngDashboard.isShowKTAnswerDetail = false;
                            $scope.ngDashboard.isShowKTDevelopmentContractDetail = false;
                            $scope.ngDashboard.isShowKTDetailsGrid = false;
                            if ($scope.kt.ktResultType == $scope.ktResultTypes[0].id) {
                                $scope.ngDashboard.isShowKTScoreCardDetail = false;
                                $scope.ngDashboard.isShowKTAnswerDetail = false;
                                $scope.ngDashboard.isShowKTDevelopmentContractDetail = false;
                                $scope.ngDashboard.isShowKTDetailsGrid = false;
                            }
                            else if ($scope.kt.ktResultType == $scope.ktResultTypes[1].id) {
                                $scope.ngDashboard.isShowKTScoreCardDetail = true;
                                $scope.ngDashboard.isShowKTAnswerDetail = false;
                                $scope.ngDashboard.isShowKTDevelopmentContractDetail = false;
                                $scope.ngDashboard.isShowKTDetailsGrid = false;
                            }
                            else if ($scope.kt.ktResultType == $scope.ktResultTypes[2].id) {
                                $scope.ngDashboard.isShowKTScoreCardDetail = false;
                                $scope.ngDashboard.isShowKTAnswerDetail = true;
                                $scope.ngDashboard.isShowKTDevelopmentContractDetail = false;
                                $scope.ngDashboard.isShowKTDetailsGrid = false;

                            }
                            else if ($scope.kt.ktResultType == $scope.ktResultTypes[3].id) {
                                $scope.ngDashboard.isShowKTScoreCardDetail = false;
                                $scope.ngDashboard.isShowKTAnswerDetail = false;
                                $scope.ngDashboard.isShowKTDevelopmentContractDetail = true;
                                $scope.ngDashboard.isShowKTDetailsGrid = false;
                            }
                            else if ($scope.kt.ktResultType == $scope.ktResultTypes[4].id) {
                                $scope.ngDashboard.isShowKTScoreCardDetail = false;
                                $scope.ngDashboard.isShowKTAnswerDetail = false;
                                $scope.ngDashboard.isShowKTDevelopmentContractDetail = false;
                                $scope.ngDashboard.isShowKTDetailsGrid = true;
                                getKTScorecardDialogDetail();
                            }

                            {

                                surveyService.getKTSurveyResult($scope.profileId, $scope.ngReportData.stageId, $scope.ngReportData.participantsId[0].id, $scope.stageEvolutionId).then(function (data) {
                                    surveyResult = data;
                                    surveyResult.mainParticipantName = $scope.ngReportData.mainParticipantsRaw.split(",")[0];
                                    $scope.answers = surveyResult.answers;
                                    $scope.medalRules = surveyResult.medalRules;
                                    $scope.medalTypes = medalTypesEnum;
                                    $scope.isPassed = surveyResult.isPassed;
                                    $scope.isCurrentViewResultByStage = true;


                                    if ($scope.ngReportData.cParticipantIds.length > 0) {

                                        surveyService.getKTSurveyResult($scope.profileId, $scope.ngReportData.cStageId, $scope.ngReportData.cParticipantIds[0].id, $scope.stageEvolutionId).then(function (data) {
                                            if (data) {
                                                surveyResult.compareParticipantAnswers = data.answers;
                                                _.forEach(surveyResult.answers, function (item) {
                                                    var obj = _.find(data.answers, function (resultobj) {
                                                        return (_.isEqual(resultobj.skillNames, item.skillNames) && resultobj.questionText == item.questionText)
                                                    });
                                                    if (obj) {
                                                        item.comparePoints = obj.points;
                                                        item.comapreAvailable = obj.isAvailable;
                                                        item.comapreIsCorrect = obj.isCorrect;

                                                    }
                                                });
                                                $scope.surveyStage = surveyResult;

                                                surveyResult.compareCorrectAnswersCount = countCorrectAnswersCount(data.answers);
                                                surveyResult.compareQuestionsCount = $scope.totalMaxPoints, // data.answers.length;
                                                    surveyResult.compareCorrectAnswersPercent = Math.round(surveyResult.compareCorrectAnswersCount * 100 / surveyResult.compareQuestionsCount);
                                                surveyResult.compareParticipantName = $scope.ngReportData.participantsRaw.split(",")[0];
                                                surveyResult.compareParticipantIsPassed = data.isPassed;
                                                surveyResult.compareMedal = getMedal(surveyResult.compareCorrectAnswersPercent);
                                                surveyResult.compareAvailable = true;
                                                initStageData($scope.surveyStage);
                                                $scope.viewStage = $scope.surveyStage;



                                            }
                                        });

                                    }
                                    else {
                                        $scope.surveyStage = surveyResult;
                                        initStageData($scope.surveyStage);
                                        $scope.viewStage = $scope.surveyStage;


                                    }

                                    var ktresulttypesHtml = '<div  id="ktScoreCardDetail" ng-if="ngDashboard.isShowKTScoreCardDetail"><div kt-score-card-detail-new profile-id="profileid" stage-id="ngReportData.stageid" participant-id="participantid" stage-evolution-id="stageEvolutionId" viewStage="viewStage"></div></div>';
                                    ktresulttypesHtml += '<div id="ktAnswerDetail" ng-if="ngDashboard.isShowKTAnswerDetail"><div kt-answer-detail-new profile-id="profileid" stage-id="ngReportData.stageid" participant-id="participantId" index="0"></div></div>';
                                    ktresulttypesHtml += '<div id="ktDevelopmentContractDetail" ng-if="ngDashboard.isShowKTDevelopmentContractDetail"><div kt-development-contract-new profile-id="profileid" stage-id="stageid" participant-id="participantid" stage-evolution-id="stageevolutionid"></div></div>';
                                    ktresulttypesHtml += '<div id="ktDetailsGridDiv"  ng-if="ngDashboard.isShowKTDetailsGrid"><div id="ktDetailsGrid"></div></div>';


                                    if ($scope.kt.ktResultType == $scope.ktResultTypes[1].id || $scope.kt.ktResultType == $scope.ktResultTypes[2].id) {
                                        var surveyAnalysis = surveyAnalysisService.getKTAnalysisInfo($scope.profileId, $scope.ngReportData.stageId,
                                            $scope.ngReportData.participantsId[0].id, $scope.stageEvolutionId).then(function (data) {
                                                var participantName = ""
                                                var userindex = _.findIndex($scope.ngReportData.participantsId, function (item) { return item.id == $scope.ngReportData.participantsId[0].id });
                                                if (userindex == 0) {
                                                    participantName = $scope.ngReportData.mainParticipantsRaw.split(',')[0];
                                                }
                                                else {
                                                    userindex = _.findIndex($scope.ngReportData.cParticipantIds, function (item) { return item.id == $scope.ngReportData.participantsId[0].id })
                                                    if (userindex == 0) {
                                                        participantName = $scope.ngReportData.participantsRaw.split(',')[0];
                                                    }
                                                }
                                                $scope.ngReportData["answerDetail"] = data;
                                                $scope.ngReportData["index"] = 0;

                                                var linkFn = $compile(ktresulttypesHtml);
                                                var content = linkFn($scope);
                                                $("#home_ktresulttypes").html(content);
                                            });;
                                    }
                                    else {
                                        var linkFn = $compile(ktresulttypesHtml);
                                        var content = linkFn($scope);
                                        $("#home_ktresulttypes").html(content);
                                    }
                                });
                            }

                        }
                        $scope.spResultTypeChanged = function () {
                        }
                        $scope.resultTypeChanged = function () {
                            $scope.kt.gaugeTotalScore = [];
                            var totalScore = {
                                value: 0,
                                color: ktDashboardColors.main,
                                name: 'Main'
                            };

                            if ($scope.kt.resultType == resulTypesEnum.score) {
                                totalScore.value = $scope.ngReportData.score;
                                if ($scope.ngReportData.medalRule) {
                                    $scope.kt.bronzeScore = $scope.ngReportData.maxScore * $scope.ngReportData.medalRule.bronzeMedalMinScore / 100;
                                    $scope.kt.silverScore = $scope.ngReportData.maxScore * $scope.ngReportData.medalRule.silverMedalMinScore / 100;
                                    $scope.kt.goldScore = $scope.ngReportData.maxScore * $scope.ngReportData.medalRule.goldMedalMinScore / 100;
                                }
                                else {
                                    $scope.kt.passScore = $scope.ngReportData.maxScore * $scope.ngReportData.passScore / 100;
                                }
                                $scope.kt.maxGaugeValue = $scope.ngReportData.maxScore;
                            }
                            else if ($scope.kt.resultType == resulTypesEnum.percent) {
                                totalScore.value = Math.round($scope.ngReportData.score * 100 / $scope.ngReportData.maxScore);
                                if ($scope.ngReportData.medalRule) {
                                    $scope.kt.bronzeScore = $scope.ngReportData.medalRule.bronzeMedalMinScore;
                                    $scope.kt.silverScore = $scope.ngReportData.medalRule.silverMedalMinScore;
                                    $scope.kt.goldScore = $scope.ngReportData.medalRule.goldMedalMinScore;
                                }
                                else {
                                    $scope.kt.passScore = $scope.ngReportData.passScore;
                                }
                                $scope.kt.maxGaugeValue = 100;
                            }
                            else if ($scope.kt.resultType == resulTypesEnum.correctAnswers) {
                                totalScore.value = $scope.ngReportData.correctAnswersCount;
                                if ($scope.ngReportData.medalRule) {
                                    $scope.kt.bronzeScore = $scope.ngReportData.questionsCount * $scope.ngReportData.medalRule.bronzeMedalMinScore / 100;
                                    $scope.kt.silverScore = $scope.ngReportData.questionsCount * $scope.ngReportData.medalRule.silverMedalMinScore / 100;
                                    $scope.kt.goldScore = $scope.ngReportData.questionsCount * $scope.ngReportData.medalRule.goldMedalMinScore / 100;
                                }
                                else {
                                    $scope.kt.passScore = $scope.ngReportData.questionsCount * $scope.ngReportData.passScore / 100;
                                }
                                $scope.kt.maxGaugeValue = $scope.ngReportData.questionsCount;
                            }
                            else if ($scope.kt.resultType == resulTypesEnum.resultTime) {
                                totalScore.value = ($scope.ngReportData.timeSpent / 60).toFixed(2);
                                var allTimeMinutes = $scope.ngReportData.allTime / 60;
                                if ($scope.ngReportData.medalRule) {
                                    $scope.kt.bronzeScore = (allTimeMinutes * $scope.ngReportData.medalRule.bronzeMedalMinScore / 100).toFixed(2);
                                    $scope.kt.silverScore = (allTimeMinutes * $scope.ngReportData.medalRule.silverMedalMinScore / 100).toFixed(2);
                                    $scope.kt.goldScore = (allTimeMinutes * $scope.ngReportData.medalRule.goldMedalMinScore / 100).toFixed(2);
                                }
                                else {
                                    $scope.kt.passScore = (allTimeMinutes * $scope.ngReportData.passScore / 100).toFixed(2);
                                }
                                $scope.kt.maxGaugeValue = (allTimeMinutes).toFixed(2);
                            }

                            $scope.kt.gaugeTotalScore.push(totalScore);

                            if ($scope.ngReportData.medalRule) {
                                $scope.kt.scaleRanges = [
                                    { color: passScoreIndicator.failed, from: 0, to: $scope.kt.bronzeScore, min: 0, max: $scope.kt.bronzeScore, scaleId: 1, id: 1 },
                                    { color: passScoreIndicator.bronzeMedal, from: $scope.kt.bronzeScore, to: $scope.kt.silverScore, min: $scope.kt.bronzeScore, max: $scope.kt.silverScore, scaleId: 2, id: 2 },
                                    { color: passScoreIndicator.silverMedal, from: $scope.kt.silverScore, to: $scope.kt.goldScore, min: $scope.kt.silverScore, max: $scope.kt.goldScore, scaleId: 3, id: 3 },
                                    { color: passScoreIndicator.goldMedal, from: $scope.kt.goldScore, to: $scope.kt.maxGaugeValue, min: $scope.kt.goldScore, max: $scope.kt.maxGaugeValue, scaleId: 4, id: 4 }
                                ];
                            }
                            else {
                                $scope.kt.scaleRanges = [
                                    { color: passScoreIndicator.failed, from: 0, to: $scope.kt.passScore, min: 0, max: $scope.kt.passScore, scaleId: 1, id: 1 },
                                    { color: passScoreIndicator.passed, from: $scope.kt.passScore, to: $scope.kt.maxGaugeValue, min: $scope.kt.passScore, max: $scope.kt.maxGaugeValue, scaleId: 2, id: 2 }
                                ];
                            }

                            $($element).find("#home_kt-gauge_total_score_value").empty();
                            var totalScoreEl = "<div style='color:" + gaugeSeriesColors.main + "; display: inline-block;'>";
                            totalScoreEl += totalScore.value;
                            totalScoreEl += '</div>';
                            $($element).find("#home_kt-gauge_total_score_value").append(totalScoreEl);
                            if ($scope.ngReportData.isShowBenchmark) {
                                $scope.prepareBenchmarkGaugeData();
                            }

                            if ($scope.showCompareReport) {
                                $scope.compareResultTypeChanged();
                            }

                            drawKTGauge();
                            drawKTPerformanceGraph();
                            getKTScorecardData();
                        }

                        $scope.prepareBenchmarkGaugeData = function () {
                            var totalScore = {
                                value: 0,
                                color: ktDashboardColors.benchmark,
                                name: 'benchmark'
                            };
                            if ($scope.kt.resultType == resulTypesEnum.score) {
                                totalScore.value = $scope.ngReportData.benchmark.score;
                            }
                            else if ($scope.kt.resultType == resulTypesEnum.percent) {
                                totalScore.value = Math.round($scope.ngReportData.benchmark.score * 100 / $scope.ngReportData.benchmark.maxScore);
                            }
                            else if ($scope.kt.resultType == resulTypesEnum.correctAnswers) {
                                totalScore.value = $scope.ngReportData.benchmark.correctAnswersCount;
                            }
                            else if ($scope.kt.resultType == resulTypesEnum.resultTime) {
                                totalScore.value = ($scope.ngReportData.benchmark.timeSpent / 60).toFixed(2);
                            }

                            $scope.kt.gaugeTotalScore.push(totalScore);


                            var totalScoreEl = ' vs ';
                            totalScoreEl += "<div style='color:" + gaugeSeriesColors.benchmark + "; display: inline-block;'>";
                            totalScoreEl += totalScore.value;
                            totalScoreEl += '</div>';
                            $($element).find("#home_kt-gauge_total_score_value").append(totalScoreEl);

                        }

                        $scope.compareResultTypeChanged = function () {
                            var totalScore = {
                                value: 0,
                                color: ktDashboardColors.compare,
                                name: 'Compare'
                            };
                            if ($scope.kt.resultType == resulTypesEnum.score) {
                                totalScore.value = $scope.ngCompareReportData.score;
                            }
                            else if ($scope.kt.resultType == resulTypesEnum.percent) {
                                totalScore.value = Math.round($scope.ngCompareReportData.score * 100 / $scope.ngCompareReportData.maxScore);
                            }
                            else if ($scope.kt.resultType == resulTypesEnum.correctAnswers) {
                                totalScore.value = $scope.ngCompareReportData.correctAnswersCount;
                            }
                            else if ($scope.kt.resultType == resulTypesEnum.resultTime) {
                                totalScore.value = ($scope.ngCompareReportData.timeSpent / 60).toFixed(2);
                            }

                            $scope.kt.gaugeTotalScore.push(totalScore);

                            //$scope.kt.totalScoreDescription += ' vs ';
                            //$scope.kt.totalScoreDescription += totalScore.value;

                            var totalScoreEl = ' vs ';
                            totalScoreEl += "<div style='color: " + gaugeSeriesColors.compare + "; display: inline-block;'>";
                            totalScoreEl += totalScore.value;
                            totalScoreEl += '</div>';
                            $($element).find("#home_kt-gauge_total_score_value").append(totalScoreEl);
                        }

                        var questions = $scope.ngQuestions;

                        var percentage = function (max, val) {
                            return (val / max * 100).toFixed(1);
                        };

                        $scope.chartModes = [{ id: 1, label: $translate.instant('DASHBOARD_GRAPH') }, { id: 2, label: $translate.instant('DASHBOARD_GAUGE') }, { id: 3, label: $translate.instant('DASHBOARD_LINEAR') }];

                        $scope.pgModesModel = [];

                        function getSkillsFromScorecards(perfomanceGroupId, scorecards) {
                            var skillsData = [];
                            if (scorecards && scorecards.length > 0) {
                                angular.forEach(scorecards, function (scorecard) {
                                    angular.forEach(scorecard.performanceGroups, function (perfomanceGroup) {
                                        if (perfomanceGroupId === perfomanceGroup.id) {
                                            var separateGraphData = [];
                                            angular.forEach(perfomanceGroup.skills, function (skill) {
                                                separateGraphData.push([skill.index, skill.score]);
                                            });
                                            skillsData.push({ data: separateGraphData, label: scorecard.label, score: perfomanceGroup.score });
                                        }
                                    });
                                });
                            }
                            return skillsData;
                        }

                        function redrawChart(chart) {
                            var dataStr = "kendoChart";
                            if (chart && chart.data(dataStr)) {
                                chart.data(dataStr).redraw();
                            }
                            dataStr = "kendoRadialGauge";
                            if (chart && chart.data(dataStr)) {
                                chart.data(dataStr).redraw();
                            }
                        }

                        function swapGraph(id, value) {
                            var floatGraph = $("#home_floatChart" + id);
                            var gaugeGraph = $("#home_gaugeChart" + id);
                            var linearGraph = $("#home_linearChart" + id);
                            if (floatGraph && gaugeGraph && linearGraph) {
                                if (value === 1) {
                                    floatGraph.show();
                                    gaugeGraph.hide();
                                    linearGraph.hide();

                                    redrawChart(floatGraph);
                                }
                                if (value === 2) {
                                    floatGraph.hide();
                                    linearGraph.hide();
                                    gaugeGraph.show();
                                    redrawChart(gaugeGraph);
                                }
                                if (value === 3) {
                                    floatGraph.hide();
                                    gaugeGraph.hide();
                                    linearGraph.show();
                                    redrawChart(gaugeGraph);
                                }
                            }
                        }

                        function getKendoChartData(data) {
                            var result = [];
                            angular.forEach(data, function (item) {
                                result.push({ value: item[1], description: questions[item[0] - 1] });
                            });
                            return result;
                        }

                        function getColor(score, ranges) {
                            var color = '';
                            angular.forEach(ranges, function (item, index) {
                                if (item.from <= score) {
                                    if (score < item.to) {
                                        color = item.color;
                                    }
                                }
                            });

                            if (!color) {
                                if (ranges[ranges.length - 1].max <= score) {
                                    color = ranges[ranges.length - 1].color;
                                } else {
                                    color = ranges[0].color;
                                }
                            }

                            return color;
                        }

                        function findColors(plot) {
                            var c = [];
                            if (plot != null) {
                                var series = plot.getData();
                                for (var i = 0; i < series.length; i++) {
                                    var aSeries = series[i];
                                    c.push({ label: aSeries.label, color: aSeries.color, used: 0 });
                                }
                            }
                            return c;
                        }

                        function getRandomColor() {
                            var color = 'rgb(' + (Math.floor((220 - 79) * Math.random()) + 80) + ',' +
                                (Math.floor((220 - 79) * Math.random()) + 80) + ',' +
                                (Math.floor((220 - 79) * Math.random()) + 80) + ')';
                            return color;
                        }

                        function getColorSeries(rModel) {
                            var result = [];
                            result.push({ name: "score", value: getRandomColor() });
                            result.push({ name: "cScore", value: getRandomColor() });
                            result.push({ name: "bench", value: getRandomColor() });
                            result.push({ name: "goal", value: getRandomColor() });
                            result.push({ name: "cGoal", value: getRandomColor() });

                            if (rModel) {
                                if (rModel.evaluatorsProfileScorecards && rModel.evaluatorsProfileScorecards.length > 0) {
                                    for (var i = 0; i < rModel.evaluatorsProfileScorecards.length; i++) {
                                        result.push({ name: "evaluator " + i, value: getRandomColor() });
                                    }
                                }
                                if (rModel.cEvaluatorsProfileScorecards && rModel.cEvaluatorsProfileScorecards.length > 0) {
                                    for (var j = 0; j < rModel.cEvaluatorsProfileScorecards.length; j++) {
                                        result.push({ name: "cEvaluator " + j, value: getRandomColor() });
                                    }
                                }
                            }
                            return result;
                        }

                        function addColumnToMap(columns, key, title, width, center) {
                            var result = columns.filter(function (obj) {
                                return obj.field == key;
                            });

                            if (result.length == 0) {
                                if (center) {
                                    columns.push({ field: key, title: title, width: width, template: "<div style='text-align:center'>#= " + key + "#</div>" });
                                } else {
                                    columns.push({ field: key, title: title, width: width });
                                }
                            }
                            return columns;
                        }

                        function addFieldToDatasource(dataSource, key, sourceKey, text, skills, width, center) {
                            dataSource.columns = addColumnToMap(dataSource.columns, key, text, width, center);

                            angular.forEach(dataSource.data, function (arrayItem) {
                                angular.forEach(skills, function (skill) {
                                    if (arrayItem.id == skill.id) {
                                        if (skill.score && skill[sourceKey] != null) {
                                            arrayItem[key] = skill[sourceKey];
                                        } else {
                                            arrayItem[key] = "";
                                        }
                                    }
                                });
                            });
                            return dataSource;
                        }

                        $scope.getPgDetails = function (pgId) {
                            var dataSource = {
                                data: [],
                                columns: [
                                    { field: "index", title: $translate.instant('DASHBOARD_QUESTION_NUMBER'), width: "90px", template: "<div style='text-align:center'>#= index#</div>" },
                                    { field: "perfomanceGroup", title: $translate.instant('COMMON_PERFORMANCE_GROUP'), width: "150px" },
                                    { field: "skillName", title: $translate.instant('COMMON_SKILL'), width: "100px" },
                                    { field: "question", title: $translate.instant('DASHBOARD_QUESTIONS'), width: "300px" },
                                ]
                            };

                            var sourcePerfomanceGroup = null;

                            angular.forEach(reportModel.performanceGroups, function (pg) {
                                if (pg.id == pgId) {
                                    sourcePerfomanceGroup = pg;
                                }
                            });

                            if (sourcePerfomanceGroup) {

                                angular.forEach(sourcePerfomanceGroup.skills, function (skill) {
                                    var arrayItem = { id: skill.id, index: skill.index, perfomanceGroup: sourcePerfomanceGroup.name, skillName: skill.name, question: skill.questions[0].questionText };
                                    dataSource.data.push(arrayItem);
                                });

                                var scoreItems = sourcePerfomanceGroup.skills.filter(function (skill) {
                                    return skill.score && skill.score > 0;
                                });

                                if (scoreItems.length > 0) {
                                    var scoreKey = "mainScore";
                                    var mainScoreText = (!$scope.mainStageName || $scope.mainStageName == '' ? '' : $scope.mainStageName + ', ') + reportModel.profileTypeName.trim() + " Score Participant " + reportModel.label.trim();
                                    dataSource = addFieldToDatasource(dataSource, scoreKey, "score", mainScoreText, sourcePerfomanceGroup.skills, "120px", true);
                                    var commentKey = "mainComment";
                                    var mainCommentText = (!$scope.mainStageName || $scope.mainStageName == '' ? '' : $scope.mainStageName + ', ') + reportModel.profileTypeName.trim() + " Comment Participant " + reportModel.label.trim();
                                    dataSource = addFieldToDatasource(dataSource, commentKey, "comment", mainCommentText, sourcePerfomanceGroup.skills, "300px", false);
                                }

                                var cScoreItems = sourcePerfomanceGroup.skills.filter(function (skill) {
                                    return skill.cScore && skill.cScore > 0;
                                });

                                if (cScoreItems.length > 0) {
                                    var cScoreKey = "compareScore";
                                    var cScoreText = (!$scope.stageName || $scope.stageName == '' ? '' : $scope.stageName + ', ') + reportModel.cProfileTypeName.trim() + " Score Participant " + reportModel.cLabel.trim();
                                    dataSource = addFieldToDatasource(dataSource, cScoreKey, "cScore", cScoreText, sourcePerfomanceGroup.skills, "120px", true);
                                    var cCommentKey = "compareComment";
                                    var cCommentText = (!$scope.stageName || $scope.stageName == '' ? '' : $scope.stageName + ', ') + reportModel.cProfileTypeName.trim() + " Comment Participant " + reportModel.cLabel.trim();
                                    dataSource = addFieldToDatasource(dataSource, cCommentKey, "cComment", cCommentText, sourcePerfomanceGroup.skills, "300px", false);
                                }

                                if (reportModel.isShowBenchmark) {
                                    var benchSkills = sourcePerfomanceGroup.skills.filter(function (skill) {
                                        return skill.benchmark && skill.benchmark > 0;
                                    });
                                    if (benchSkills.length > 0) {
                                        dataSource = addFieldToDatasource(dataSource, "benchmark", "benchmark", "Benchmark", sourcePerfomanceGroup.skills, "100px", true);
                                    }
                                }

                                if (reportModel.isShowGoal) {
                                    var goalSkills = sourcePerfomanceGroup.skills.filter(function (skill) {
                                        return skill.goal && skill.goal > 0;
                                    });
                                    if (goalSkills.length > 0) {
                                        var goalKey = "mainGoal";
                                        var goalText = reportModel.label + " Goals";
                                        dataSource = addFieldToDatasource(dataSource, goalKey, "goal", goalText, sourcePerfomanceGroup.skills, "120px", true);
                                    }
                                }

                                if (reportModel.isShowCompareGoal) {
                                    var cGoalSkills = sourcePerfomanceGroup.skills.filter(function (skill) {
                                        return skill.cGoal && skill.cGoal > 0;
                                    });
                                    if (cGoalSkills.length > 0) {
                                        var cGoalKey = "compareGoal";
                                        var cGoalText = reportModel.cLabel + " Goals";
                                        dataSource = addFieldToDatasource(dataSource, cGoalKey, "cGoal", cGoalText, sourcePerfomanceGroup.skills, "120px", true);
                                    }
                                }

                                if (reportModel.evaluatorsProfileScorecards && reportModel.evaluatorsProfileScorecards.length > 0) {
                                    angular.forEach(reportModel.evaluatorsProfileScorecards, function (evaluatorProfileScorecard, evaluatorIndex) {
                                        angular.forEach(evaluatorProfileScorecard.performanceGroups, function (evaluatorPg) {
                                            if (evaluatorPg.id === pgId) {
                                                var eScoreItems = evaluatorPg.skills.filter(function (skill) {
                                                    return skill.score && skill.score > 0;
                                                });
                                                if (eScoreItems.length > 0) {
                                                    var evaluatorKey = "evaluator" + evaluatorIndex;
                                                    var mainEvaluatorScoreText = (!$scope.mainStageName || $scope.mainStageName == '' ? '' : $scope.mainStageName + ', ') + reportModel.profileTypeName.trim() + " Score Evaluator " + evaluatorProfileScorecard.label.trim();
                                                    dataSource = addFieldToDatasource(dataSource, evaluatorKey, "score", mainEvaluatorScoreText, evaluatorPg.skills, "120px", true);
                                                    var evaluatorCommentKey = "evaluatorComment" + evaluatorIndex;
                                                    var mainEvaluatorCommentText = (!$scope.mainStageName || $scope.mainStageName == '' ? '' : $scope.mainStageName + ', ') + reportModel.profileTypeName.trim() + " Comment Evaluator " + evaluatorProfileScorecard.label.trim();
                                                    dataSource = addFieldToDatasource(dataSource, evaluatorCommentKey, "comment", mainEvaluatorCommentText, evaluatorPg.skills, "300px", true);
                                                }
                                            }
                                        });
                                    });
                                }

                                if (reportModel.cEvaluatorsProfileScorecards && reportModel.cEvaluatorsProfileScorecards.length > 0) {
                                    angular.forEach(reportModel.cEvaluatorsProfileScorecards, function (evaluatorProfileScorecard, evaluatorIndex) {
                                        angular.forEach(evaluatorProfileScorecard.performanceGroups, function (evaluatorPg) {
                                            if (evaluatorPg.id === pgId) {
                                                var eScoreItems = evaluatorPg.skills.filter(function (skill) {
                                                    return skill.score && skill.score > 0;
                                                });
                                                if (eScoreItems.length > 0) {
                                                    var compareEvaluatorKey = "cEvaluator" + evaluatorIndex;
                                                    var compareEvaluatorScoreText = (!$scope.stageName || $scope.stageName == '' ? '' : $scope.stageName + ', ') + reportModel.cProfileTypeName.trim() + " Score Evaluator " + evaluatorProfileScorecard.label.trim();
                                                    dataSource = addFieldToDatasource(dataSource, compareEvaluatorKey, "score", compareEvaluatorScoreText, evaluatorPg.skills, "120px", true);
                                                    var compareEvaluatorCommentKey = "cEvaluatorComment" + evaluatorIndex;
                                                    var compareEvaluatorCommentText = (!$scope.stageName || $scope.stageName == '' ? '' : $scope.stageName + ', ') + reportModel.cProfileTypeName.trim() + " Comment Evaluator " + evaluatorProfileScorecard.label.trim();
                                                    dataSource = addFieldToDatasource(dataSource, compareEvaluatorCommentKey, "comment", compareEvaluatorCommentText, evaluatorPg.skills, "300px", true);
                                                }
                                            }
                                        });
                                    });
                                }

                                dialogService.showGridDialog($translate.instant('DASHBOARD_PERFORMANCE_GROUP_DETAILS') + " - " + sourcePerfomanceGroup.name, dataSource.data, dataSource.columns);
                            }
                        };

                        $scope.swapGraphMode = function (id, value) {
                            angular.forEach($scope.pgModesModel, function (pgId) {
                                if (id === pgId.id) {
                                    if (value) {
                                        $scope.pgModesModel[id].value = value;
                                    }
                                    swapGraph(id, $scope.pgModesModel[id].value);
                                }
                            });
                        };

                        $scope.spChartModeChanged = function (id) {
                            angular.forEach($scope.pgModesModel, function (pgId, i) {
                                $scope.pgModesModel[i].value = $scope.kt.chartMode;
                                swapGraph(i, $scope.pgModesModel[i].value);
                            });
                        };

                        $scope.spPresentationModeChanged = function () {

                        }

                        $scope.init = function (rd) {
                            reportModel = rd;
                            if ($scope.$parent.selectedProfile) {
                                $scope.profileType = $scope.$parent.selectedProfile.profileTypeId;
                            }
                            if (reportModel && $scope.profileType == profilesTypesEnum.soft) {
                                if (reportModel.scale) {
                                    angular.forEach(reportModel.scale.scaleRanges, function (item, index) {
                                        item.from = item.min;
                                        item.to = item.max + 1;
                                    });
                                }
                                if ($scope.ngReportData.participantsId) {
                                    if ($scope.ngReportData.participantsId.length > 0) {
                                        $scope.participantId = $scope.ngReportData.participantsId[0].id;
                                    }
                                }

                                questions = [];
                                reportModel.max = reportModel.scale.scaleRanges[reportModel.scale.scaleRanges.length - 1].max;
                                if ((reportModel.strongAreas) && (reportModel.strongAreas.length > 3)) {
                                    reportModel.strongAreas = [reportModel.strongAreas[0], reportModel.strongAreas[1], reportModel.strongAreas[2]]
                                }
                                if ((reportModel.weakAreas) && (reportModel.weakAreas.length > 3)) {
                                    reportModel.weakAreas = [reportModel.weakAreas[0], reportModel.weakAreas[1], reportModel.weakAreas[2]]
                                }

                                var qIndex = 1;
                                angular.forEach(reportModel.performanceGroups, function (pg) {
                                    pg.answersData = [];
                                    pg.cAanswersData = [];
                                    pg.benchMarkData = [];
                                    pg.goalData = [];
                                    pg.cGoalData = [];
                                    pg.color = getColor(pg.score, reportModel.scale.scaleRanges);
                                    angular.forEach(pg.skills, function (pgs) {
                                        pgs.index = qIndex;
                                        qIndex++;
                                        //angular.forEach(pgs.questions, function (question) {
                                        //    questions.push([pgs.name + " - " + pgs.questions[0].description]);
                                        //});
                                        questions.push([pgs.name + " - " + pgs.questions[0].questionText]);
                                        pg.answersData.push([pgs.name + " - " + pgs.description, pgs.score, pgs.index]);
                                        pg.cAanswersData.push([pgs.name + " - " + pgs.description, pgs.cScore, pgs.index]);
                                        pg.benchMarkData.push([pgs.name + " - " + pgs.description, pgs.bScore, pgs.index]);
                                        pg.goalData.push([pgs.name + " - " + pgs.description, pgs.goal, pgs.index]);
                                        pg.cGoalData.push([pgs.name + " - " + pgs.description, pgs.cGoal, pgs.index]);
                                    });
                                    pg.questions = pg.skills;
                                });

                                var kpiItems = $scope.ngKpiItems;
                                var benchMarkResults = $scope.ngBenchMarkResults;
                                var users = $scope.ngUsers;

                                $scope.load();
                            }
                            else if (reportModel && $scope.profileType == profilesTypesEnum.knowledgetest) {
                                setTimeout(function () {
                                    $scope.resultTypeChanged();
                                }, 100)

                            }
                        };

                        $scope.init($scope.ngReportData);



                        function drawPerfomanceGraph(container, elementId, perfomanceGroup, colorSeries, startHtml, endHtml, width, height) {
                            var avg = perfomanceGroup.score;
                            var prc = percentage(reportModel.max, avg);

                            var avgc = 0;
                            var prcc = 0;

                            var benchmarkavg = 0;
                            var benchmarkprc = 0;


                            var mainEvalutorAVG = 0;
                            var mainEvalutorPRC = 0;

                            var compareEvaluatorAVG = 0;
                            var compareEvaluatorPRC = 0;

                            var answersData = perfomanceGroup.answersData;
                            var benchMarkData = perfomanceGroup.benchMarkData;
                            var goalsData = perfomanceGroup.goalData;
                            var cGoalsData = perfomanceGroup.cGoalData;
                            var compareData = [];
                            if (reportModel.isCompare) {
                                avgc = perfomanceGroup.cScore;
                                prcc = percentage(reportModel.max, avgc);
                                compareData = perfomanceGroup.cAanswersData;
                            }

                            //compare gauges
                            if (reportModel.isCompare) {
                                $("#home_gauge_total_score_compare").show();
                                $("#home_gauge_total_strong_compare").show();
                                $("#home_gauge_total_weak_compare").show();
                            } else {
                                $("#home_gauge_total_score_compare").hide();
                                $("#home_gauge_total_strong_compare").hide();
                                $("#home_gauge_total_weak_compare").hide();
                            }

                            //layout 
                            var graphElemHtml = "";

                            if (startHtml) {
                                graphElemHtml += startHtml;
                            }
                            graphElemHtml += "<div class='GraphListImg' ng-show='showGraph'>";
                            graphElemHtml += "<div class='legend-container' id='home_legend-container" + elementId.toString() + "' style='font-size: 12px; text-align: center;'></div>";
                            graphElemHtml += "<div style='display:block'>";
                            graphElemHtml += "<div id='home_floatChart" + elementId.toString() + "' class='floatChart'></div>";
                            graphElemHtml += "<div id='home_gaugeChart" + elementId.toString() + "' class='floatChart'></div>";
                            graphElemHtml += "<div id='home_linearChart" + elementId.toString() + "' class='floatChart'></div>";
                            graphElemHtml += "</div>";
                            graphElemHtml += "<div>";
                            graphElemHtml += "<table><tr><td><select class='form-control details-select' name='graphMode' ng-model='pgModesModel[" + elementId + "].value' ng-change='swapGraphMode(" + elementId + ")' ng-options='obj.id as obj.label for obj in chartModes'></select></td><td><button ng-click='getPgDetails(" + perfomanceGroup.id + ")' class='details-btn'>Details</button></td></tr></table>";
                            graphElemHtml += "</div>";
                            graphElemHtml += "</div>";
                            graphElemHtml += "<h3 class='pgName' ng-show='showGraph'>" + perfomanceGroup.name + "</h3>";
                            graphElemHtml += "<div class='GraphListTxt' ng-show='showGraph' >";
                            graphElemHtml += "<h4 class='pgDescription' style='height:50px;'>" + perfomanceGroup.description + "</h4>";
                            var mainLegendPostfix = " (" + (!$scope.mainStageName || $scope.mainStageName == '' ? '' : $scope.mainStageName + ', ') + reportModel.profileTypeName + ")";
                            graphElemHtml += "<h4 class=''>" + $translate.instant('COMMON_MAIN_PARTICIPANT') + ": " + reportModel.label + mainLegendPostfix + "</h4>";
                            graphElemHtml += "<div class='GraphLiProc width80Perc FloatLeft'>";

                            graphElemHtml += "<div id='PG" + elementId.toString() + "' class='GraphLiProc FloatLeft'></div>";
                            graphElemHtml += "</div>";
                            graphElemHtml += "<div class='GraphLiProc width20Perc FloatLeft'>";
                            graphElemHtml += "<span class='mArLeft015'>" + avg + "</span>";
                            graphElemHtml += "</div>";

                            if (reportModel.isShowBenchmark) {
                                graphElemHtml += "<div class='GraphLiProc width80Perc FloatLeft' ng-show='showGraph'>";
                                graphElemHtml += "<div class=''>" + $translate.instant('DASHBOARD_BENCH_MARK') + "</div>";
                                graphElemHtml += "<div id='PGB" + elementId.toString() + "' class='GraphLiProc FloatLeft'></div>";
                                graphElemHtml += "</div>";
                                graphElemHtml += "<div class='GraphLiProc width20Perc FloatLeft' style='margin-top:0px;'>";
                                graphElemHtml += "<span style='float: left;' class='mArLeft015 benchmarkavg" + elementId.toString() + "' >" + benchmarkavg + "</span>";
                                graphElemHtml += "</div>";
                            }
                            if (perfomanceGroup.cScore && reportModel.cLabel != "") {
                                var compareLegendPostfix = " (" + (!$scope.stageName || $scope.stageName == '' ? '' : $scope.stageName + ', ') + reportModel.cProfileTypeName + ")";
                                graphElemHtml += "<h4 class=''>" + $translate.instant('COMMON_PARTICIPANT') + ": " + reportModel.cLabel + compareLegendPostfix + "</h4>";
                                graphElemHtml += "<div class='GraphLiProc width80Perc FloatLeft' ng-show='showGraph'>";

                                graphElemHtml += "<div id='PGC" + elementId.toString() + "' class='GraphLiProc FloatLeft'></div>";
                                graphElemHtml += "</div>";
                                graphElemHtml += "<div class='GraphLiProc width20Perc FloatLeft' style='margin-top:0px;'>";
                                graphElemHtml += "<span style='float: left;' class='mArLeft015 avgc" + elementId.toString() + "' >" + avgc + "</span>";
                                graphElemHtml += "</div>";
                            }
                            if (reportModel.evaluatorsProfileScorecards) {
                                if (reportModel.evaluatorsProfileScorecards.length > 0) {
                                    if (reportModel.evaluatorsProfileScorecards[0].label) {
                                        var mainLegendPostfix = " (" + (!$scope.mainStageName || $scope.mainStageName == '' ? '' : $scope.mainStageName + ', ') + reportModel.profileTypeName + ")";
                                        graphElemHtml += "<h4 class=''>" + $translate.instant('COMMON_MAIN_EVALUATOR') + ": " + reportModel.evaluatorsProfileScorecards[0].label + mainLegendPostfix + "</h4>";
                                        graphElemHtml += "<div class='GraphLiProc width80Perc FloatLeft' ng-show='showGraph'>";

                                        graphElemHtml += "<div id='PGE" + elementId.toString() + "' class='GraphLiProc FloatLeft'></div>";
                                        graphElemHtml += "</div>";
                                        graphElemHtml += "<div class='GraphLiProc width20Perc FloatLeft' style='margin-top:0px;'>";
                                        graphElemHtml += "<span class='mArLeft015 FloatLeft mainEvalutorAVG" + elementId.toString() + "' >" + mainEvalutorAVG + "</span>";
                                        graphElemHtml += "</div>";
                                    }
                                }
                            }
                            if (reportModel.cEvaluatorsProfileScorecards) {
                                if (reportModel.cEvaluatorsProfileScorecards.length > 0) {
                                    if (reportModel.cEvaluatorsProfileScorecards[0].label) {
                                        var compareLegendPostfix = " (" + (!$scope.stageName || $scope.stageName == '' ? '' : $scope.stageName + ', ') + reportModel.cProfileTypeName + ")";
                                        graphElemHtml += "<h4 class=''>" + $translate.instant('COMMON_EVALUATOR') + ": " + reportModel.cEvaluatorsProfileScorecards[0].label + compareLegendPostfix + "</h4>";
                                        graphElemHtml += "<div class='GraphLiProc width80Perc FloatLeft' ng-show='showGraph'>";

                                        graphElemHtml += "<div id='PGCE" + elementId.toString() + "' class='GraphLiProc FloatLeft'></div>";
                                        graphElemHtml += "</div>";
                                        graphElemHtml += "<div class='GraphLiProc width20Perc FloatLeft' style='margin-top:0px;'>";
                                        graphElemHtml += "<span class='mArLeft015 compareEvaluatorAVG" + elementId.toString() + "' ></span>";
                                        graphElemHtml += "</div>";
                                    }
                                }
                            }
                            graphElemHtml += "</div>";

                            if (endHtml) {
                                graphElemHtml += endHtml;
                            }

                            var linkFn = $compile(graphElemHtml);
                            var content = linkFn($scope);
                            container.append(content);

                            var progressBar;




                            //$("#resultLegendId").text(reportModel.label);

                            if (reportModel.isShowBenchmark) {
                                $(".benchmarkLegend").show();
                                $("#banchmarkLegendId").show();
                            } else {
                                $(".benchmarkLegend").hide();
                                $("#banchmarkLegendId").hide();
                            }

                            if (reportModel.isCompare) {
                                $("#home_compareLegendId").text(reportModel.cLabel);
                                $("#home_compareLegendId").show();
                                $("#home_compareLegendMarker").show();
                            } else {
                                $("#home_compareLegendId").hide();
                                $("#home_compareLegendMarker").hide();
                            }

                            var scores = [],
                                compare = [],
                                benchMark = [],
                                goals = [],
                                cGoals = [],
                                ticksData = [];

                            for (i = 1; i <= answersData.length; i++) {
                                scores.push([answersData[i - 1][2], answersData[i - 1][1]]);
                                if (reportModel.isCompare) {
                                    compare.push([compareData[i - 1][2], compareData[i - 1][1]]);
                                }
                                if (reportModel.isShowBenchmark) {
                                    benchMark.push([benchMarkData[i - 1][2], benchMarkData[i - 1][1]]);
                                }
                                if (reportModel.isShowGoal) {
                                    goals.push([goalsData[i - 1][2], goalsData[i - 1][1]]);
                                }
                                if (reportModel.isShowCompareGoal) {
                                    cGoals.push([cGoalsData[i - 1][2], cGoalsData[i - 1][1]]);
                                }
                                ticksData.push(answersData[i - 1][2]);
                            }

                            //Main Evaluators data for graphs 
                            var evaluatorsSkillsForPg = getSkillsFromScorecards(perfomanceGroup.id, reportModel.evaluatorsProfileScorecards);

                            //Type of Profiles (options) data for graphs
                            //var extraSkillsForPg = getSkillsFromScorecards(perfomanceGroup.id, reportModel.extraProfileScorecards);

                            //CompareTo Evaluators
                            var cEvaluatorsSkillsForPg = getSkillsFromScorecards(perfomanceGroup.id, reportModel.cEvaluatorsProfileScorecards);

                            //Type Of Profiles for Evaluators
                            //var cExtraSkillsForPg = getSkillsFromScorecards(perfomanceGroup.id, reportModel.cExtraProfileScorecards);

                            if (height && height > 0) {
                                $("#home_floatChart" + elementId.toString()).height(height);
                                $("#home_gaugeChart" + elementId.toString()).height(height);
                                $("#home_linearChart" + elementId.toString()).height(height);
                            }
                            if (width && width > 0) {
                                $("#home_floatChart" + elementId.toString()).width(width);
                                $("#home_gaugeChart" + elementId.toString()).width(width);
                                $("#home_linearChart" + elementId.toString()).width(width);
                            }

                            $("#home_legend-container td").remove();

                            var kendoSeries = [];
                            var kendoPointers = [];

                            var mainLegendPostfix = " (" + (!$scope.mainStageName || $scope.mainStageName == '' ? '' : $scope.mainStageName + ', ') + reportModel.profileTypeName + ")";
                            var compareLegendPostfix = " (" + (!$scope.stageName || $scope.stageName == '' ? '' : $scope.stageName + ', ') + reportModel.cProfileTypeName + ")";

                            //Scores of Main Participant\s
                            if (perfomanceGroup && perfomanceGroup.score) {
                                var pointscores = [];
                                var scoreColor = null;
                                angular.forEach(colorSeries, function (color) {
                                    if (color.name == "score") {
                                        scoreColor = color.value;
                                        gaugeSeriesColors.main = scoreColor;
                                    }
                                });
                                var graphScores = getKendoChartData(scores);
                                kendoSeries.push({ name: reportModel.label, data: graphScores, color: scoreColor });
                                if (perfomanceGroup.score && perfomanceGroup.score > 0) {
                                    pointscores.push(perfomanceGroup.score);
                                    kendoPointers.push({ value: perfomanceGroup.score, color: scoreColor, label: $translate.instant('COMMON_MAIN_PARTICIPANT') + ": " + reportModel.label + mainLegendPostfix });
                                }
                                if (pointscores.length > 0) {
                                    var totalScores = _.sum(pointscores);
                                    avg = totalScores / pointscores.length;
                                    prc = percentage(reportModel.max, avg);

                                    var progressBar;
                                    progressBar = new ProgressBar("PG" + elementId.toString(), { 'width': '100%', 'height': '35px' });
                                    var progressBarItem = {};
                                    progressBarItem[ProgressBar.OPTION_NAME.ITEM_ID] = "item1";
                                    progressBarItem[ProgressBar.OPTION_NAME.COLOR_ID] = ProgressBar.OPTION_VALUE.COLOR_ID.CUSTOM;
                                    progressBarItem.color = getColor(avg, reportModel.scale.scaleRanges);
                                    progressBar.createItem(progressBarItem);
                                    progressBar.setPercent(prc);
                                }

                            }
                            else {
                                var progressBar;
                                progressBar = new ProgressBar("PG" + elementId.toString(), { 'width': '100%', 'height': '35px' });
                                var progressBarItem = {};
                                progressBarItem[ProgressBar.OPTION_NAME.ITEM_ID] = "item1";
                                progressBarItem[ProgressBar.OPTION_NAME.COLOR_ID] = ProgressBar.OPTION_VALUE.COLOR_ID.CUSTOM;
                                progressBarItem.color = getColor(0, reportModel.scale.scaleRanges);
                                progressBar.createItem(progressBarItem);
                                progressBar.setPercent(0);
                            }

                            //Scores of Compare To Participant\s
                            if (perfomanceGroup && perfomanceGroup.cScore && reportModel.cLabel != "") {
                                var pointscores = [];
                                var cScoreColor = null;
                                angular.forEach(colorSeries, function (color) {
                                    if (color.name == "cScore") {
                                        cScoreColor = color.value;
                                        gaugeSeriesColors.compare = cScoreColor;

                                    }
                                });
                                var graphCscores = getKendoChartData(compare);
                                kendoSeries.push({ name: reportModel.cLabel, data: graphCscores, color: cScoreColor });
                                if (perfomanceGroup.cScore && perfomanceGroup.cScore > 0) {
                                    pointscores.push(perfomanceGroup.cScore);
                                    kendoPointers.push({ value: perfomanceGroup.cScore, color: cScoreColor, label: $translate.instant('COMMON_PARTICIPANT') + ": " + reportModel.cLabel + compareLegendPostfix });
                                }
                                if (pointscores.length > 0) {
                                    var totalScores = _.sum(pointscores);
                                    avgc = totalScores / pointscores.length;
                                    prcc = percentage(reportModel.max, avgc);

                                    var progressBar;
                                    progressBar = new ProgressBar("PGC" + elementId.toString(), { 'width': '100%', 'height': '35px' });
                                    var progressBarItem = {};
                                    progressBarItem[ProgressBar.OPTION_NAME.ITEM_ID] = "item1";
                                    progressBarItem[ProgressBar.OPTION_NAME.COLOR_ID] = ProgressBar.OPTION_VALUE.COLOR_ID.CUSTOM;
                                    progressBarItem.color = getColor(avgc, reportModel.scale.scaleRanges);
                                    //progressBar.createItem(progressBarItem);
                                    progressBar.createItem(progressBarItem);
                                    progressBar.setPercent(prcc);
                                    $(".avgc" + elementId).html(avgc);


                                    var diffPercentage = setDiffrencePercentage(avg, avgc, reportModel.max); //parseFloat((((avgc - avg) / reportModel.max) * 100)).toFixed(1);

                                    var graphElemHtml = "";
                                    if (avg > 0) {
                                        if (avgc > avg) {
                                            graphElemHtml += "<img  class='mArLeft015' src='images/dashboard/top-arrow-green.png' style='width:auto;height:32px;float:left;margin-left: 5px;'>";
                                        } else if (avg == avgc) {
                                            graphElemHtml += "<img class='mArLeft015' src='images/dashboard/min-icon-big.png' style='width:auto;height:32px;float:left;margin-left: 5px;'>";
                                        } else {
                                            graphElemHtml += "<img  class='mArLeft015' src='images/dashboard/botm-arrow-red.png' style='width:auto;height:32px;float:left;margin-left: 5px;'>";
                                        }
                                    }
                                    graphElemHtml += diffPercentage;
                                    $(".avgc" + elementId).after(graphElemHtml);
                                }
                                else {
                                    progressBar = new ProgressBar("PGC" + elementId.toString(), { 'width': '100%', 'height': '35px' });
                                    progressBarItem = {};
                                    progressBarItem[ProgressBar.OPTION_NAME.ITEM_ID] = "item1";
                                    progressBarItem[ProgressBar.OPTION_NAME.COLOR_ID] = ProgressBar.OPTION_VALUE.COLOR_ID.CUSTOM;
                                    progressBarItem.color = getColor(0, reportModel.scale.scaleRanges);
                                    //progressBar.createItem(progressBarItem);
                                    progressBar.createItem(progressBarItem);
                                    progressBar.setPercent(0);
                                    $(".avgc" + elementId).html("0");
                                }

                            }
                            else {
                                if ($("#PGC" + elementId).length > 0) {
                                    progressBar = new ProgressBar("PGC" + elementId.toString(), { 'width': '100%', 'height': '35px' });
                                    progressBarItem = {};
                                    progressBarItem[ProgressBar.OPTION_NAME.ITEM_ID] = "item1";
                                    progressBarItem[ProgressBar.OPTION_NAME.COLOR_ID] = ProgressBar.OPTION_VALUE.COLOR_ID.CUSTOM;
                                    progressBarItem.color = getColor(0, reportModel.scale.scaleRanges);
                                    //progressBar.createItem(progressBarItem);
                                    progressBar.createItem(progressBarItem);
                                    progressBar.setPercent(0);
                                    $(".avgc" + elementId).html("0");
                                }
                            }

                            //Scores of Benchmark
                            if (reportModel.isShowBenchmark) {
                                var benchColor = null;
                                var pointscores = [];
                                angular.forEach(colorSeries, function (color) {
                                    if (color.name == "bench") {
                                        benchColor = color.value;
                                        gaugeSeriesColors.benchmark = benchColor;
                                    }
                                });
                                var benchScores = getKendoChartData(benchMark);
                                kendoSeries.push({ name: "Benchmark", data: benchScores, color: benchColor });
                                if (perfomanceGroup.benchmark && perfomanceGroup.benchmark > 0) {
                                    pointscores.push(perfomanceGroup.benchmark);
                                    kendoPointers.push({ value: perfomanceGroup.benchmark, color: benchColor, label: $translate.instant('DASHBOARD_BENCHMARK') });
                                }

                                if (pointscores.length > 0) {
                                    var totalScores = _.sum(pointscores);
                                    benchmarkavg = totalScores / pointscores.length;
                                    benchmarkprc = percentage(reportModel.max, benchmarkavg);

                                    progressBar = new ProgressBar("PGB" + elementId.toString(), { 'width': '100%', 'height': '35px' });
                                    progressBarItem = {};
                                    progressBarItem[ProgressBar.OPTION_NAME.ITEM_ID] = "item1";
                                    progressBarItem[ProgressBar.OPTION_NAME.COLOR_ID] = ProgressBar.OPTION_VALUE.COLOR_ID.CUSTOM;
                                    progressBarItem.color = getColor(benchmarkavg, reportModel.scale.scaleRanges);
                                    //progressBar.createItem(progressBarItem);
                                    progressBar.createItem(progressBarItem);
                                    progressBar.setPercent(benchmarkprc);
                                    $(".benchmarkavg" + elementId).html(benchmarkavg);
                                    //var diffPercentage = parseFloat((((benchmarkavg - avg) / reportModel.max) * 100)).toFixed(1);

                                    var graphElemHtml = "";
                                    if (avg > 0) {
                                        if (benchmarkavg > avg) {
                                            graphElemHtml += "<img  class='mArLeft015' src='images/dashboard/top-arrow-green.png' style='width:auto;height:32px;float:left;margin-left: 5px;'>";
                                        } else if (avg == benchmarkavg) {
                                            graphElemHtml += "<img  class='mArLeft015'src='images/dashboard/min-icon-big.png' style='width:auto;height:32px;float:left;margin-left: 5px;'>";
                                        } else {
                                            graphElemHtml += "<img  class='mArLeft015' src='images/dashboard/botm-arrow-red.png' style='width:auto;height:32px;float:left;margin-left: 5px;'>";
                                        }
                                    }
                                    var diffPercentage = setDiffrencePercentage(avg, benchmarkavg, reportModel.max);
                                    graphElemHtml += diffPercentage;
                                    $(".benchmarkavg" + elementId).after(graphElemHtml);
                                }
                                else {
                                    progressBar = new ProgressBar("PGB" + elementId.toString(), { 'width': '100%', 'height': '35px' });
                                    progressBarItem = {};
                                    progressBarItem[ProgressBar.OPTION_NAME.ITEM_ID] = "item1";
                                    progressBarItem[ProgressBar.OPTION_NAME.COLOR_ID] = ProgressBar.OPTION_VALUE.COLOR_ID.CUSTOM;
                                    progressBarItem.color = getColor(0, reportModel.scale.scaleRanges);
                                    //progressBar.createItem(progressBarItem);
                                    progressBar.createItem(progressBarItem);
                                    progressBar.setPercent(0);
                                    $(".benchmarkavg" + elementId).html("0");
                                }
                            }

                            //Scores of Goals for Main Participant\s
                            if (reportModel.isShowGoal) {
                                var goalColor = null;
                                angular.forEach(colorSeries, function (color) {
                                    if (color.name == "goal") {
                                        goalColor = color.value;
                                        gaugeSeriesColors.main = goalColor;
                                    }
                                });
                                var goalScores = getKendoChartData(goals);
                                kendoSeries.push({ name: reportModel.label + " Goals", data: goalScores, color: goalColor });
                                if (perfomanceGroup.goal && perfomanceGroup.goal > 0) {
                                    kendoPointers.push({ value: perfomanceGroup.goal, color: goalColor, label: $translate.instant('COMMON_MAIN_PARTICIPANT') + ": " + reportModel.label + " " + $translate.instant('DASHBOARD_GOALS') });
                                }
                            }

                            //Scores of Goals for Compare To Participant\s
                            if (reportModel.isShowCompareGoal && perfomanceGroup.cGoal) {
                                var cGoalColor = null;
                                angular.forEach(colorSeries, function (color) {
                                    if (color.name == "cGoal") {
                                        cGoalColor = color.value;
                                        gaugeSeriesColors.compare = cGoalColor;
                                    }
                                });
                                var cGoalScores = getKendoChartData(cGoals);
                                kendoSeries.push({ name: reportModel.cLabel + " Goals", data: cGoalScores, color: cGoalColor });
                                if (perfomanceGroup.cGoal && perfomanceGroup.cGoal > 0) {
                                    kendoPointers.push({ value: perfomanceGroup.cGoal, color: cGoalColor, label: $translate.instant('COMMON_PARTICIPANT') + ": " + reportModel.cLabel + " " + $translate.instant('DASHBOARD_GOALS') });
                                }
                            }

                            //Scores for Evaluators of Main Participant\s
                            if (evaluatorsSkillsForPg && evaluatorsSkillsForPg.length > 0) {
                                var pointscores = [];
                                angular.forEach(evaluatorsSkillsForPg, function (evaluatorDataForGraph, index) {
                                    var evaluatorColor = null;
                                    angular.forEach(colorSeries, function (color) {
                                        if (color.name == "evaluator " + index) {
                                            evaluatorColor = color.value;
                                            gaugeSeriesColors.mainEvaluator = evaluatorColor;
                                        }
                                    });
                                    var evaluatorScores = getKendoChartData(evaluatorDataForGraph.data);
                                    kendoSeries.push({ name: evaluatorDataForGraph.label, data: evaluatorScores, color: evaluatorColor });
                                    if (evaluatorDataForGraph.score && evaluatorDataForGraph.score > 0) {
                                        pointscores.push(evaluatorDataForGraph.score);
                                        kendoPointers.push({ value: evaluatorDataForGraph.score, color: evaluatorColor, label: $translate.instant('COMMON_MAIN_EVALUATOR') + " :" + evaluatorDataForGraph.label + mainLegendPostfix });
                                    }
                                });
                                if (pointscores.length > 0) {
                                    var totalScores = _.sum(pointscores);
                                    mainEvalutorAVG = totalScores / pointscores.length;
                                    mainEvalutorPRC = percentage(reportModel.max, mainEvalutorAVG);

                                    progressBar = new ProgressBar("PGE" + elementId.toString(), { 'width': '100%', 'height': '35px' });
                                    progressBarItem = {};
                                    progressBarItem[ProgressBar.OPTION_NAME.ITEM_ID] = "item1";
                                    progressBarItem[ProgressBar.OPTION_NAME.COLOR_ID] = ProgressBar.OPTION_VALUE.COLOR_ID.CUSTOM;
                                    progressBarItem.color = getColor(mainEvalutorAVG, reportModel.scale.scaleRanges);

                                    progressBar.createItem(progressBarItem);
                                    progressBar.setPercent(mainEvalutorPRC);
                                    $(".mainEvalutorAVG" + elementId).html(mainEvalutorAVG);



                                    var graphElemHtml = "";
                                    if (avg > 0) {
                                        if (mainEvalutorAVG > avg) {
                                            graphElemHtml += "<img  class='mArLeft015' src='images/dashboard/top-arrow-green.png' style='width:auto;height:32px;float:left;margin-left: 5px;'>";
                                        } else if (avg == mainEvalutorAVG) {
                                            graphElemHtml += "<img  class='mArLeft015' src='images/dashboard/min-icon-big.png' style='width:auto;height:32px;float:left;margin-left: 5px;'>";
                                        } else {
                                            graphElemHtml += "<img   class='mArLeft015' src='images/dashboard/botm-arrow-red.png' style='width:auto;height:32px;float:left;margin-left: 5px;'>";
                                        }
                                    }
                                    var diffPercentage = setDiffrencePercentage(avg, mainEvalutorAVG, reportModel.max);

                                    graphElemHtml += diffPercentage;

                                    $(".mainEvalutorAVG" + elementId).after(graphElemHtml);
                                }
                                else {
                                    if (reportModel.profileTypeName == "Agreed Final KPI") {
                                        $("#PGE" + elementId).parent(".GraphLiProc").hide();
                                        $(".mainEvalutorAVG" + elementId).parent(".GraphLiProc").hide();
                                        $(".PGEIndicator" + elementId).hide();
                                    }
                                    else {
                                        progressBar = new ProgressBar("PGE" + elementId.toString(), { 'width': '100%', 'height': '35px' });
                                        progressBarItem = {};
                                        progressBarItem[ProgressBar.OPTION_NAME.ITEM_ID] = "item1";
                                        progressBarItem[ProgressBar.OPTION_NAME.COLOR_ID] = ProgressBar.OPTION_VALUE.COLOR_ID.CUSTOM;
                                        progressBarItem.color = getColor(mainEvalutorAVG, reportModel.scale.scaleRanges);
                                        //progressBar.createItem(progressBarItem);
                                        progressBar.createItem(progressBarItem);
                                        progressBar.setPercent(mainEvalutorPRC);
                                        $(".mainEvalutorAVG" + elementId).html(mainEvalutorAVG);

                                        var graphElemHtml = "";
                                        if (avg > 0) {
                                            if (mainEvalutorAVG > avg) {
                                                graphElemHtml += "<img  class='mArLeft015' src='images/dashboard/top-arrow-green.png' style='width:auto;height:32px;float:left;margin-left: 5px;'>";
                                            } else if (avg == mainEvalutorAVG) {
                                                graphElemHtml += "<img  class='mArLeft015' src='images/dashboard/min-icon-big.png' style='width:auto;height:32px;float:left;margin-left: 5px;'>";
                                            } else {
                                                graphElemHtml += "<img   class='mArLeft015' src='images/dashboard/botm-arrow-red.png' style='width:auto;height:32px;float:left;margin-left: 5px;'>";
                                            }
                                        }
                                        var diffPercentage = setDiffrencePercentage(avg, mainEvalutorAVG, reportModel.max);

                                        graphElemHtml += diffPercentage;
                                        //graphElemHtml += "<span>" + diffPercentage + "%</span>";
                                        $(".mainEvalutorAVG" + elementId).after(graphElemHtml);
                                    }
                                }

                            }
                            else {
                                if ($("#PGE" + elementId).length > 0) {
                                    var progressBar;
                                    progressBar = new ProgressBar("PGE" + elementId.toString(), { 'width': '100%', 'height': '35px' });
                                    var progressBarItem = {};
                                    progressBarItem[ProgressBar.OPTION_NAME.ITEM_ID] = "item1";
                                    progressBarItem[ProgressBar.OPTION_NAME.COLOR_ID] = ProgressBar.OPTION_VALUE.COLOR_ID.CUSTOM;
                                    progressBarItem.color = getColor(0, reportModel.scale.scaleRanges);
                                    progressBar.createItem(progressBarItem);
                                    progressBar.setPercent(0);
                                }
                            }

                            //Scores for Comapre To Evaluators
                            if (cEvaluatorsSkillsForPg && cEvaluatorsSkillsForPg.length > 0) {
                                var pointscores = [];
                                angular.forEach(cEvaluatorsSkillsForPg, function (evaluatorDataForGraph, index) {
                                    var cEvaluatorColor = null;
                                    angular.forEach(colorSeries, function (color) {
                                        if (color.name == "cEvaluator " + index) {
                                            cEvaluatorColor = color.value;
                                            gaugeSeriesColors.compareEvaluator = cEvaluatorColor;
                                        }
                                    });
                                    var cEvaluatorScores = getKendoChartData(evaluatorDataForGraph.data);
                                    kendoSeries.push({ name: evaluatorDataForGraph.label, data: cEvaluatorScores, color: cEvaluatorColor });
                                    if (evaluatorDataForGraph.score && evaluatorDataForGraph.score > 0) {
                                        pointscores.push(evaluatorDataForGraph.score);
                                        kendoPointers.push({ value: evaluatorDataForGraph.score, color: cEvaluatorColor, label: $translate.instant('COMMON_EVALUATOR') + " :" + evaluatorDataForGraph.label + compareLegendPostfix });
                                    }
                                });

                                if (pointscores.length > 0) {
                                    var totalScores = _.sum(pointscores);
                                    compareEvaluatorAVG = totalScores / pointscores.length;
                                    compareEvaluatorPRC = percentage(reportModel.max, compareEvaluatorAVG);

                                    progressBar = new ProgressBar("PGCE" + elementId.toString(), { 'width': '100%', 'height': '35px' });
                                    progressBarItem = {};
                                    progressBarItem[ProgressBar.OPTION_NAME.ITEM_ID] = "item1";
                                    progressBarItem[ProgressBar.OPTION_NAME.COLOR_ID] = ProgressBar.OPTION_VALUE.COLOR_ID.CUSTOM;
                                    progressBarItem.color = getColor(compareEvaluatorAVG, reportModel.scale.scaleRanges);
                                    //progressBar.createItem(progressBarItem);
                                    progressBar.createItem(progressBarItem);
                                    progressBar.setPercent(compareEvaluatorPRC);
                                    $(".compareEvaluatorAVG" + elementId).html(compareEvaluatorAVG);


                                    var graphElemHtml = "";
                                    if (avg > 0) {
                                        if (compareEvaluatorAVG > avg) {
                                            graphElemHtml += "<img  class='mArLeft015' src='images/dashboard/top-arrow-green.png' style='width:auto;height:32px;float:left;margin-left: 5px;'>";
                                        } else if (avg == mainEvalutorAVG) {
                                            graphElemHtml += "<img  class='mArLeft015' src='images/dashboard/min-icon-big.png' style='width:auto;height:32px;float:left;margin-left: 5px;'>";
                                        } else {
                                            graphElemHtml += "<img   class='mArLeft015' src='images/dashboard/botm-arrow-red.png' style='width:auto;height:32px;float:left;margin-left: 5px;'>";
                                        }
                                    }
                                    var diffPercentage = setDiffrencePercentage(avg, compareEvaluatorAVG, reportModel.max);

                                    graphElemHtml += diffPercentage;
                                    //graphElemHtml += "<span>" + diffPercentage + "%</span>";
                                    $(".compareEvaluatorAVG" + elementId).after(graphElemHtml);

                                }
                                else {
                                    if (reportModel.cProfileTypeName == "Agreed Final KPI") {
                                        $("#PGCE" + elementId).parent(".GraphLiProc").hide();
                                        $(".compareEvaluatorAVG" + elementId).parent(".GraphLiProc").hide();
                                        $(".PGCEIndicator" + elementId).hide();
                                    }
                                    else {
                                        progressBar = new ProgressBar("PGCE" + elementId.toString(), { 'width': '100%', 'height': '35px' });
                                        progressBarItem = {};
                                        progressBarItem[ProgressBar.OPTION_NAME.ITEM_ID] = "item1";
                                        progressBarItem[ProgressBar.OPTION_NAME.COLOR_ID] = ProgressBar.OPTION_VALUE.COLOR_ID.CUSTOM;
                                        progressBarItem.color = getColor(compareEvaluatorAVG, reportModel.scale.scaleRanges);
                                        //progressBar.createItem(progressBarItem);
                                        progressBar.createItem(progressBarItem);
                                        progressBar.setPercent(compareEvaluatorPRC);
                                        $(".compareEvaluatorAVG" + elementId).html(compareEvaluatorAVG);


                                        var graphElemHtml = "";
                                        if (avg > 0) {
                                            if (compareEvaluatorAVG > avg) {
                                                graphElemHtml += "<img  class='mArLeft015' src='images/dashboard/top-arrow-green.png' style='width:auto;height:32px;float:left;margin-left: 5px;'>";
                                            } else if (avg == mainEvalutorAVG) {
                                                graphElemHtml += "<img  class='mArLeft015' src='images/dashboard/min-icon-big.png' style='width:auto;height:32px;float:left;margin-left: 5px;'>";
                                            } else {
                                                graphElemHtml += "<img   class='mArLeft015' src='images/dashboard/botm-arrow-red.png' style='width:auto;height:32px;float:left;margin-left: 5px;'>";
                                            }
                                        }
                                        var diffPercentage = setDiffrencePercentage(avg, compareEvaluatorAVG, reportModel.max);

                                        graphElemHtml += diffPercentage;
                                        $(".compareEvaluatorAVG" + elementId).after(graphElemHtml);
                                    }
                                }

                            }
                            else {
                                if ($("#PGCE" + elementId).length > 0) {
                                    var progressBar;
                                    progressBar = new ProgressBar("PGCE" + elementId.toString(), { 'width': '100%', 'height': '35px' });
                                    progressBarItem = {};
                                    progressBarItem[ProgressBar.OPTION_NAME.ITEM_ID] = "item1";
                                    progressBarItem[ProgressBar.OPTION_NAME.COLOR_ID] = ProgressBar.OPTION_VALUE.COLOR_ID.CUSTOM;
                                    progressBarItem.color = getColor(0, reportModel.scale.scaleRanges);
                                    //progressBar.createItem(progressBarItem);
                                    progressBar.createItem(progressBarItem);
                                    progressBar.setPercent(0);
                                    $(".compareEvaluatorAVG" + elementId).html("0");
                                }
                            }

                            angular.forEach(kendoPointers, function (poiner) {
                                if (poiner.value > 0) {
                                    $("<div  class='legend-container-block' style='display: inline-block;padding:0px 3px; vertical-align:middle;'>" +
                                        "<div style='width:4px;height:0;border:5px solid " + poiner.color + ";float:left;margin-top: 4px;'></div>" +
                                        "<div style='float:left; padding: 0px 2px';>" + poiner.label + "</div></div>")
                                        .appendTo('#home_legend-container' + elementId.toString());
                                }
                            });

                            var floatChart = $("#home_floatChart" + elementId.toString()).kendoChart({
                                legend: {
                                    position: "top",
                                    visible: false
                                },
                                seriesDefaults: {
                                    type: "column"
                                },
                                series: kendoSeries,
                                valueAxis: {
                                    majorUnit: 1,
                                    min: 0,
                                    max: reportModel.scale.scaleRanges[reportModel.scale.scaleRanges.length - 1].max,
                                    labels: {
                                        format: "{0}"
                                    },
                                    line: {
                                        visible: true
                                    },
                                    axisCrossingValue: 0
                                },
                                categoryAxis: {
                                    categories: ticksData,
                                    line: {
                                        visible: false
                                    },
                                    labels: {
                                        padding: { top: 0 }
                                    }
                                },
                                tooltip: {
                                    visible: true,
                                    background: "white",
                                    format: "{0}",
                                    template: "#= series.name #: #= value# #= dataItem.description #"
                                }
                            });


                            var linearGraph = $("#home_linearChart" + elementId.toString()).kendoChart({
                                legend: {
                                    position: "top",
                                    visible: false
                                },
                                seriesDefaults: {
                                    type: "line"
                                },
                                series: kendoSeries,
                                valueAxis: {
                                    majorUnit: 1,
                                    min: 0,
                                    max: reportModel.scale.scaleRanges[reportModel.scale.scaleRanges.length - 1].max,
                                    labels: {
                                        format: "{0}"
                                    },
                                    line: {
                                        visible: true
                                    },
                                    axisCrossingValue: 0
                                },
                                categoryAxis: {
                                    categories: ticksData,
                                    line: {
                                        visible: false
                                    },
                                    labels: {
                                        padding: { top: 0 }
                                    }
                                },
                                tooltip: {
                                    visible: true,
                                    background: "white",
                                    format: "{0}",
                                    template: "#= series.name #: #= value# #= dataItem.description #"
                                }
                            });
                            var gaugeGraph = $("#home_gaugeChart" + elementId.toString()).kendoRadialGauge({
                                pointer: kendoPointers,

                                scale: {
                                    min: 0,
                                    minorUnit: 1,
                                    startAngle: -30,
                                    endAngle: 210,
                                    max: reportModel.scale.scaleRanges[reportModel.scale.scaleRanges.length - 1].max,
                                    ranges: reportModel.scale.scaleRanges,
                                }
                            });

                            if ($scope.pgModesModel && $scope.pgModesModel.length > 0) {
                                $scope.swapGraphMode(elementId);
                            }

                            profileCharts.push(floatChart);
                            profileCharts.push(gaugeGraph);
                            profileCharts.push(linearGraph);
                            var legendHeights = []
                            $(".GraphList .GraphListImg").each(function () {
                                var height = 0;
                                $(this).find(".legend-container .legend-container-block").each(function () {
                                    height += $(this).height();
                                })
                                legendHeights.push(height);
                            });
                            if (legendHeights.length > 0) {
                                var max = _.max(legendHeights);
                                if (max > 45) {
                                    $(".GraphList .GraphListImg .legend-container").height(max);
                                }
                            }


                            var legendHeights = []
                            $(".GraphList .GraphListImg").each(function () {
                                var height = 0;
                                $(this).find(".legend-container .legend-container-block").each(function () {
                                    height += $(this).height();
                                })
                                legendHeights.push(height);
                            });
                            if (legendHeights.length > 0) {
                                var max = _.max(legendHeights);
                                if (max > 45) {
                                    $(".GraphList .GraphListImg .legend-container").height(max);
                                }
                            }

                            var pgNameHeights = []
                            $(".GraphList .pgName").each(function () {
                                var height = $(this).height();
                                pgNameHeights.push(height);
                            });
                            if (pgNameHeights.length > 0) {
                                var max = _.max(pgNameHeights);
                                if (max > 25) {
                                    $(".GraphList .pgName").height(max);
                                }
                            }
                            var heights = [];
                            $(".GraphList .col-md-3").each(function (i, el) {
                                heights.push($(el).height())
                            });
                            var maxHeight = _.max(heights);
                            $(".GraphList .col-md-3").each(function (i, el) {
                                $(el).height(maxHeight);
                            });
                        }

                        function prepareKtChartData() {
                            $scope.kt.series = [];
                            $scope.kt.seriesCategories = [];
                            var serie = {};
                            serie.color = ktDashboardColors.main;
                            serie.name = "Main Participants (" + $scope.ngReportData.mainParticipantsRaw + ")";
                            serie.data = []
                            angular.forEach($scope.ktStagesResults, function (stage, index) {
                                var totalScore;
                                if ($scope.kt.resultType == resulTypesEnum.score) {
                                    totalScore = stage.score;
                                }
                                else if ($scope.kt.resultType == resulTypesEnum.percent) {
                                    totalScore = Math.round(stage.score / stage.maxScore * 100);
                                }
                                else if ($scope.kt.resultType == resulTypesEnum.correctAnswers) {
                                    totalScore = stage.correctAnswersCount;
                                }
                                else if ($scope.kt.resultType == resulTypesEnum.resultTime) {
                                    totalScore = (stage.timeSpent / 60).toFixed(2);
                                }
                                serie.data.push(totalScore);
                                $scope.kt.seriesCategories.push(stage.stageName);
                            });
                            $scope.kt.series.push(serie);

                            $scope.kt.chartValueLabelTempl = "{0}";

                            if ($scope.kt.resultType == resulTypesEnum.score) {
                                if ($scope.ktStagesResults) {
                                    if ($scope.ktStagesResults.length > 0) {
                                        $scope.kt.maxSeriesValue = $scope.ktStagesResults[0].maxScore;
                                    }
                                }
                            }
                            else if ($scope.kt.resultType == resulTypesEnum.percent) {
                                $scope.kt.maxSeriesValue = 100;
                                $scope.kt.chartValueLabelTempl = $scope.kt.chartValueLabelTempl + "%";
                            }
                            else if ($scope.kt.resultType == resulTypesEnum.correctAnswers) {
                                if ($scope.ktStagesResults) {
                                    if ($scope.ktStagesResults.length > 0) {
                                        $scope.kt.maxSeriesValue = $scope.ktStagesResults[0].questionsCount;
                                    }
                                }
                            }
                            else if ($scope.kt.resultType == resulTypesEnum.resultTime) {
                                if ($scope.ktStagesResults) {
                                    if ($scope.ktStagesResults.length > 0) {
                                        $scope.kt.maxSeriesValue = ($scope.ktStagesResults[0].allTime / 60).toFixed(2);
                                    }
                                }
                            }

                            $scope.kt.majorUnit = 5;

                            if ($scope.showCompareReport) {
                                prepareKtCompareChartData();
                            }

                            if ($scope.ngReportData.isShowBenchmark) {
                                prepareKtBenchmarkChartData();
                            }
                        }

                        function prepareKtCompareChartData() {
                            var serie = {};
                            serie.color = ktDashboardColors.compare;
                            serie.name = $translate.instant("DASHBOARD_COMPARE") + " " + $translate.instant("COMMON_PARTICIPANTS") + " (" + $scope.ngReportData.participantsRaw + ")";
                            serie.data = []
                            angular.forEach($scope.ktCompareStagesResult, function (stage, index) {
                                var totalScore;
                                if ($scope.kt.resultType == resulTypesEnum.score) {
                                    totalScore = stage.score;
                                }
                                else if ($scope.kt.resultType == resulTypesEnum.percent) {
                                    totalScore = Math.round(stage.score / stage.maxScore * 100);
                                }
                                else if ($scope.kt.resultType == resulTypesEnum.correctAnswers) {
                                    totalScore = stage.correctAnswersCount;
                                }
                                else if ($scope.kt.resultType == resulTypesEnum.resultTime) {
                                    totalScore = (stage.timeSpent / 60).toFixed(2);
                                }
                                serie.data.push(totalScore);
                            });
                            $scope.kt.series.push(serie);
                        }

                        function prepareKtBenchmarkChartData() {
                            var serie = {};
                            serie.color = ktDashboardColors.benchmark;
                            serie.name = 'Benchmark';
                            serie.data = []
                            angular.forEach($scope.ngReportData.benchmarksStages, function (stage, index) {
                                var totalScore;
                                if ($scope.kt.resultType == resulTypesEnum.score) {
                                    totalScore = stage.score;
                                }
                                else if ($scope.kt.resultType == resulTypesEnum.percent) {
                                    totalScore = Math.round(stage.score / stage.maxScore * 100);
                                }
                                else if ($scope.kt.resultType == resulTypesEnum.correctAnswers) {
                                    totalScore = stage.correctAnswersCount;
                                }
                                else if ($scope.kt.resultType == resulTypesEnum.resultTime) {
                                    totalScore = (stage.timeSpent / 60).toFixed(2);
                                }
                                serie.data.push(totalScore);
                            });
                            $scope.kt.series.push(serie);
                        }

                        function drawKTPerformanceGraph() {
                            prepareKtChartData();

                            var KtChart = $("#KTChart").kendoChart({
                                title: {
                                    text: $translate.instant('DASHBOARD_STAGES_RESULT')
                                },
                                legend: {
                                    position: "top"
                                },
                                seriesDefaults: {
                                    type: "bar"
                                },
                                series: $scope.kt.series,
                                valueAxis: {
                                    min: 0,
                                    max: $scope.kt.maxSeriesValue,
                                    labels: {
                                        format: $scope.kt.chartValueLabelTempl
                                    },
                                    line: {
                                        visible: true
                                    },
                                    axisCrossingValue: 0
                                },
                                categoryAxis: {
                                    categories: $scope.kt.seriesCategories,
                                    line: {
                                        visible: false
                                    },
                                    labels: {
                                        padding: { top: 0 }
                                    }
                                },
                                tooltip: {
                                    visible: true,
                                    template: "#= value #"
                                }
                            });
                            profileCharts.push(KtChart);
                            redrawChart($("#KTChart"));
                        }

                        function drawKTGauge() {
                            $("#home_kt_gauge_total_score").kendoRadialGauge({
                                pointer: $scope.kt.gaugeTotalScore,
                                scale: {
                                    min: 0,
                                    startAngle: -30,
                                    endAngle: 210,
                                    max: $scope.kt.maxGaugeValue,
                                    ranges: $scope.kt.scaleRanges
                                }
                            });
                        }


                        function getKPIImage(avg, avgc) {


                            //var diffPercentage = parseFloat((((avg - avgc) / reportModel.max) * 100)).toFixed(1);
                            var imageElemHtml = "";
                            if (avg > avgc) {
                                imageElemHtml += "<img src='images/dashboard/top-arrow-green.png' style='width:auto;height:32px'>";
                            } else if (avg == avgc) {
                                imageElemHtml += "<img src='images/dashboard/min-icon-big.png' style='width:auto;height:32px'>";
                            } else {
                                imageElemHtml += "<img src='images/dashboard/botm-arrow-red.png' style='width:auto;height:32px'>";
                            }

                            var diffPercentage = setDiffrencePercentage(avg, avgc, reportModel.max);
                            imageElemHtml += "<span class='getKPIImage'>" + diffPercentage + " </span>";
                            return imageElemHtml;
                        }

                        function setDiffrencePercentage(mainAVG, compareAVG, max) {
                            var DiffrencePercentageresult = "";
                            var diffPercentage = 0;
                            if (max > 0) {

                                var diffvaue = compareAVG - mainAVG;
                                diffPercentage = Math.ceil(diffvaue * 100 / mainAVG);
                                //diffPercentage = parseFloat((((compareAVG - mainAVG) / max) * 100)).toFixed(1);
                                if (!isNaN(diffPercentage)) {
                                    if (isFinite(diffPercentage)) {
                                        if (diffPercentage > 0) {
                                            DiffrencePercentageresult = "<span class='diff-up'>" + diffPercentage + "% </span>";
                                        }
                                        else if (diffPercentage < 0) {
                                            DiffrencePercentageresult = "<span class='diff-down'>" + diffPercentage + "% </span>";
                                        }
                                    }
                                    else {
                                        DiffrencePercentageresult = "<span class='fa fa-info-circle text-red' title='User has not added any score so we cant show difference'></span>";
                                    }
                                }
                            }
                            return DiffrencePercentageresult;
                        }



                        function getKTEmptySkillRes() {
                            return {
                                id: 0,
                                participantId: 0,
                                pgName: '',
                                skillName: '',
                                indicator: '',
                                pointsScore: '',
                                comparePointsScore: '',
                                percentScore: '',
                                comparePercentScore: '',
                                benchmark: '',
                                weight: '',
                                csf: '',
                                action: '',
                                trend: '',
                                avgPointScore: '',
                                avgPercentScore: ''
                            }
                        }

                        function prepareKtSkillResultsFOrGrouping(skillResults, answerdata) {
                            var res = [];
                            skillResults = _.sortByOrder(skillResults, ['pgName', 'skillName'], ['asc', 'asc']);
                            var pgIds = _.uniq(_.map(skillResults, 'pgId'));
                            _.forEach(pgIds, function (pgId, index) {
                                var foundskillResuls = _.filter(skillResults, function (skillRes) {
                                    return skillRes.pgId == pgId;
                                });
                                foundskillResuls = _.sortByOrder(foundskillResuls, ['skillName'], ['asc']);

                                var parentId = index;

                                var emptySkillRes = getKTEmptySkillRes();
                                emptySkillRes.id = parentId;
                                emptySkillRes.participantId = $scope.ngReportData.participantsId[0].id;
                                emptySkillRes.parentId = null;
                                emptySkillRes.pgId = pgId;
                                emptySkillRes.pgName = foundskillResuls[0].pgName;
                                emptySkillRes.questionId = 0;
                                res.push(emptySkillRes);
                                var pgname = foundskillResuls[0].pgName;
                                _.forEach(foundskillResuls, function (item) {
                                    if (answerdata) {
                                        var answers = answerdata.answers.filter(function (answeritem) {
                                            if (answeritem.performanceGroupName == item.pgName && answeritem.skillNames.indexOf(item.skillName) > -1) {
                                                item.questionText = answeritem.questionText;
                                            }
                                        })
                                    }
                                    var itemToAdd = _.clone(item);
                                    itemToAdd.parentId = parentId;
                                    itemToAdd.id = -1;
                                    itemToAdd.participantId = $scope.ngReportData.participantsId[0].id;
                                    //itemToAdd.cParticipantId = $scope.ngReportData.cParticipantIds[0].id;
                                    itemToAdd.pgName = '';
                                    res.push(itemToAdd);
                                });
                            });

                            return res;
                        }
                        // IPS2018-18 - Togenerate charts and display Knowledge profile details 
                        $scope.getKTScorecardDialogDetail = getKTScorecardDialogDetail;
                        var questionid = 0;
                        $scope.getKTAnswerDetail = function (questionid, participantID) {
                            if (questionid) {
                                var surveyAnalysis = surveyAnalysisService.getKTAnalysisInfo($scope.profileId, $scope.ngReportData.stageId,
                                    participantID, $scope.stageEvolutionId).then(function (data) {
                                        var participantName = ""
                                        var userindex = _.findIndex($scope.ngReportData.participantsId, function (item) { return item.id == participantID });
                                        if (userindex == 0) {
                                            participantName = $scope.ngReportData.mainParticipantsRaw.split(',')[0];
                                        }
                                        else {
                                            userindex = _.findIndex($scope.ngReportData.cParticipantIds, function (item) { return item.id == participantID })
                                            if (userindex == 0) {
                                                participantName = $scope.ngReportData.participantsRaw.split(',')[0];
                                            }
                                        }
                                        var index = _.findIndex(data.answers, function (answer) {
                                            return answer.questionId == questionid;
                                        });
                                        if (index > -1) {
                                            $scope.ngReportData["answerDetail"] = data;
                                            $scope.ngReportData["index"] = index;
                                            dialogService.showKTAnswerDetailDialogNew(participantName, $scope.profileId, $scope.ngReportData.stageId, participantID, index);
                                            var linkFn = $compile($("#ktAnswerDetailGridDialogWindow"));
                                            linkFn($scope);
                                        }
                                    });;
                            }
                        };

                        $scope.getKTDevelopmentContractDetail = function () {
                            dialogService.showKTDevelopmentContractDetailDialogNew($translate.instant('DASHBOARD_FINAL_KPI_OF') + " " + $scope.ngReportData.mainParticipantsRaw.split(",")[0], $scope.profileId, $scope.ngReportData.stageId, $scope.ngReportData.participantsId[0].id, $scope.stageEvolutionId);
                            var linkFn = $compile($("#ktDevelopmentContractDetailDialogWindow"));
                            linkFn($scope);
                        };

                        $scope.getKTScoreCardDetail = function () {
                            dialogService.showKTScoreCardDetailDialogNew($scope.profileId, $scope.ngReportData.stageId, $scope.ngReportData.participantsId[0].id, $scope.stageEvolutionId);
                            var linkFn = $compile($("#ktScoreCardDetailDialogWindow"));
                            linkFn($scope);
                        }
                        $scope.getKTAllAnswers = function () {

                            var surveyAnalysis = surveyAnalysisService.getKTAnalysisInfo($scope.profileId, $scope.ngReportData.stageId,
                                $scope.ngReportData.participantsId[0].id, $scope.stageEvolutionId).then(function (data) {
                                    var index = 0;
                                    if (index > -1) {
                                        $scope.ngReportData["answerDetail"] = data;
                                        $scope.ngReportData["index"] = index;
                                        dialogService.showKTAnswerDetailDialogNew($scope.ngReportData.mainParticipantsRaw.split(",")[0], $scope.profileId, $scope.ngReportData.stageId, $scope.ngReportData.participantsId[0].id, index);
                                        var linkFn = $compile($("#ktAnswerDetailGridDialogWindow"));
                                        linkFn($scope);
                                    }
                                });
                        };

                        function getKTScorecardData() {

                            $scope.skillResultsParticipants = [];
                            $scope.skillResultsEvaluator = [];
                            $scope.skillResultsCompareParticipants = [];
                            $scope.skillResultsBenchmark = [];
                            scorecardsServiceNew.loadKTScorecardData($scope.profileId, $scope.ngReportData.participantsId,
                                $scope.ngReportData.stageId, $scope.ngReportData.mainProfileStepId == $scope.ktProfileTypes.start.id, $scope.ngReportData.mainEvolutionStageId == null ? 0 : $scope.ngReportData.mainEvolutionStageId).then(function (data) {

                                    $scope.skillResultsParticipants = prepareKtSkillResultsFOrGrouping(data.skillResults);
                                    $scope.skillResultsParticipants = setKTIndicatorColor(data.passScore, data.medalRule, $scope.skillResultsParticipants);
                                    if ($scope.ngReportData.cParticipantIds.length > 0 && $scope.ngReportData.cEvaluatorsProfileScorecards && $scope.ngReportData.cEvaluatorsProfileScorecards.length > 0) {
                                        if ($scope.ngReportData.cParticipantIds.length > 0) {
                                            scorecardsServiceNew.loadKTScorecardData($scope.profileId, $scope.ngReportData.cParticipantIds,
                                                $scope.ngReportData.stageId, $scope.ngReportData.mainProfileStepId == $scope.ktProfileTypes.start.id, $scope.ngReportData.evolutionStageId == null ? 0 : $scope.ngReportData.evolutionStageId).then(function (data) {
                                                    $scope.skillResultsCompareParticipants = prepareKtSkillResultsFOrGrouping(data.skillResults);
                                                    $scope.skillResultsCompareParticipants = setKTIndicatorColor(data.passScore, data.medalRule, $scope.skillResultsCompareParticipants);

                                                    scorecardsServiceNew.loadKTScorecardData($scope.profileId, $scope.ngReportData.cEvaluatorsProfileScorecards,
                                                        $scope.ngReportData.stageId, $scope.ngReportData.mainProfileStepId == $scope.ktProfileTypes.start.id, $scope.ngReportData.evolutionStageId == null ? 0 : $scope.ngReportData.evolutionStageId).then(function (data) {

                                                            $scope.skillResultsEvaluator = prepareKtSkillResultsFOrGrouping(data.skillResults);
                                                            $scope.skillResultsEvaluator = setKTIndicatorColor(data.passScore, data.medalRule, $scope.skillResultsEvaluator);

                                                            if ($scope.ngReportData.isShowBenchmark) {

                                                                scorecardsServiceNew.loadKTScorecardData($scope.profileId, [{ id: -1 }],
                                                                    $scope.ngReportData.stageId, $scope.ngReportData.mainProfileStepId == $scope.ktProfileTypes.start.id, 0).then(function (data) {
                                                                        $scope.skillResultsBenchmark = prepareKtSkillResultsFOrGrouping(data.skillResults);
                                                                        $scope.skillResultsBenchmark = setKTIndicatorColor(data.passScore, data.medalRule, $scope.skillResultsBenchmark);
                                                                        getKTFloatChartData();

                                                                    });
                                                            }
                                                            else {
                                                                getKTFloatChartData();
                                                            }
                                                        });

                                                });
                                        }

                                    }
                                    else if ($scope.ngReportData.cParticipantIds.length > 0) {
                                        scorecardsServiceNew.loadKTScorecardData($scope.profileId, $scope.ngReportData.cParticipantIds,
                                            $scope.ngReportData.stageId, $scope.ngReportData.mainProfileStepId == $scope.ktProfileTypes.start.id, $scope.ngReportData.evolutionStageId == null ? 0 : $scope.ngReportData.evolutionStageId).then(function (data) {
                                                $scope.skillResultsCompareParticipants = prepareKtSkillResultsFOrGrouping(data.skillResults);
                                                $scope.skillResultsCompareParticipants = setKTIndicatorColor(data.passScore, data.medalRule, $scope.skillResultsCompareParticipants);

                                                if ($scope.ngReportData.isShowBenchmark) {

                                                    scorecardsServiceNew.loadKTScorecardData($scope.profileId, [{ id: -1 }],
                                                        $scope.ngReportData.stageId, $scope.ngReportData.mainProfileStepId == $scope.ktProfileTypes.start.id, 0).then(function (data) {
                                                            $scope.skillResultsBenchmark = prepareKtSkillResultsFOrGrouping(data.skillResults);
                                                            $scope.skillResultsBenchmark = setKTIndicatorColor(data.passScore, data.medalRule, $scope.skillResultsBenchmark);
                                                            getKTFloatChartData();

                                                        });
                                                }
                                                else {
                                                    getKTFloatChartData();
                                                }

                                            });
                                    }
                                    else if ($scope.ngReportData.cEvaluatorsProfileScorecards && $scope.ngReportData.cEvaluatorsProfileScorecards.length > 0) {
                                        scorecardsServiceNew.loadKTScorecardData($scope.profileId, $scope.ngReportData.cEvaluatorsProfileScorecards,
                                            $scope.ngReportData.stageId, $scope.ngReportData.mainProfileStepId == $scope.ktProfileTypes.start.id, $scope.ngReportData.evolutionStageId == null ? 0 : $scope.ngReportData.evolutionStageId).then(function (data) {
                                                $scope.skillResultsEvaluator = prepareKtSkillResultsFOrGrouping(data.skillResults);
                                                $scope.skillResultsEvaluator = setKTIndicatorColor(data.passScore, data.medalRule, $scope.skillResultsEvaluator);

                                                if ($scope.ngReportData.isShowBenchmark) {

                                                    scorecardsServiceNew.loadKTScorecardData($scope.profileId, [{ id: -1 }],
                                                        $scope.ngReportData.stageId, $scope.ngReportData.mainProfileStepId == $scope.ktProfileTypes.start.id, 0).then(function (data) {
                                                            $scope.skillResultsBenchmark = prepareKtSkillResultsFOrGrouping(data.skillResults);
                                                            $scope.skillResultsBenchmark = setKTIndicatorColor(data.passScore, data.medalRule, $scope.skillResultsBenchmark);
                                                            getKTFloatChartData();

                                                        });
                                                }
                                                else {
                                                    getKTFloatChartData();
                                                }
                                            });
                                    }

                                    else {
                                        if ($scope.ngReportData.isShowBenchmark) {

                                            scorecardsServiceNew.loadKTScorecardData($scope.profileId, [{ id: -1 }],
                                                $scope.ngReportData.stageId, $scope.ngReportData.mainProfileStepId == $scope.ktProfileTypes.start.id, 0).then(function (data) {
                                                    $scope.skillResultsBenchmark = prepareKtSkillResultsFOrGrouping(data.skillResults);
                                                    $scope.skillResultsBenchmark = setKTIndicatorColor(data.passScore, data.medalRule, $scope.skillResultsBenchmark);
                                                    getKTFloatChartData();

                                                });
                                        }
                                        else {
                                            getKTFloatChartData();
                                        }
                                    }

                                });
                        }
                        function getKTScorecardDialogDetail() {

                            scorecardsServiceNew.loadKTScorecardData($scope.profileId, $scope.ngReportData.participantsId,
                                $scope.ngReportData.stageId, $scope.ngReportData.mainProfileStepId == $scope.ktProfileTypes.start.id, $scope.ngReportData.mainEvolutionStageId).then(function (data) {

                                    surveyService.getKTSurveyResult($scope.profileId.toString(), $scope.ngReportData.stageId.toString(),
                                        $scope.ngReportData.participantsId[0].id.toString(), "null").then(function (answerdata) {
                                            var colorMainPart = "black";
                                            var colorComparePart = "blue";
                                            var columnWidth = 10;
                                            var columnWidthText = columnWidth + "%";

                                            _.forEach(data.skillResults, function (sRes) {
                                                sRes.id = sRes.pgId;
                                                sRes.percentScore = sRes.percentScore.toFixed(2);
                                            });

                                            data.skillResults = prepareKtSkillResultsFOrGrouping(data.skillResults, answerdata);
                                            setKTDetailIndicatorColor(data);

                                            $scope.scorecard.reportData = data;
                                            if ($("#scorecardGrid").length > 0) {
                                                $("#scorecardGrid").empty();
                                            }
                                            var grid;
                                            if (!($scope.ngReportData.cParticipantIds.length > 0)) {

                                                var columns = [
                                                    { field: "pgName", title: $translate.instant('COMMON_PERFORMANCE_GROUP'), width: "11%" },
                                                    { field: "skillName", title: $translate.instant('COMMON_SKILL'), width: "11%" },
                                                    { field: "questionText", title: $translate.instant('DASHBOARD_QUESTION'), width: "11%" },
                                                    { field: "", title: $scope.ngReportData.mainParticipantsRaw.split(',')[0] + " " + $translate.instant('DASHBOARD_INDICATOR'), width: "5%", template: "<div ng-click='getKTAnswerDetail(#= (questionId != null)? questionId : ''#,#= (questionId != null)? participantId : ''#)' class='scale-circle' style='background: #: indicator #'></div>" },
                                                    { field: "pointsScore", title: $scope.ngReportData.mainParticipantsRaw.split(',')[0] + " " + $translate.instant('DASHBOARD_POINTS_SCORE'), width: columnWidthText, template: "<div class='number' style='color:" + colorMainPart + "'>#= (pointsScore == null) ? ' ' : pointsScore #</div>" },
                                                    { field: "percentScore", title: $scope.ngReportData.mainParticipantsRaw.split(',')[0] + " " + $translate.instant('COMMON_SCORE') + ", %", width: columnWidthText, template: "<div class='number' style='color:" + colorMainPart + "'>#= percentScore ? percentScore+'%' : '' #</div>" },
                                                    { field: "target", title: $translate.instant('DASHBOARD_BENCHMARK'), width: "6%", template: "<div class='number'>#= (benchmark == null) ? ' ' : benchmark #</div>", hidden: !$scope.ngReportData.isShowBenchmark },
                                                    { field: "weight", title: $translate.instant('DASHBOARD_WEIGHT'), width: "6%", template: "<div class='number'>#= (weight == null) ? ' ' : weight #</div>" },
                                                    { field: "csf", title: $translate.instant('DASHBOARD_CSF'), width: "12%", template: "#= (csf == null) ? ' ' : csf #" },
                                                    { field: "action", title: $translate.instant('DASHBOARD_COMMENT'), width: "12%", template: "#= (action == null) ? ' ' : action #" },
                                                ];
                                                //dialogService.showKTGridDialog("Performance Group Details  ", dataSource($scope.scorecard.reportData.skillResults), columns);
                                                //var linkFn = $compile($("#ktGridDialogWindow"));
                                                //linkFn($scope);
                                                var colorMainPart = "black";
                                                var colorComparePart = "blue";
                                                var columnWidth = 10;
                                                var columnWidthText = columnWidth + "%";
                                                var grid = $("#ktDetailsGrid").kendoTreeList({
                                                    dataSource: dataSource($scope.scorecard.reportData.skillResults),
                                                    loadOnDemand: false,
                                                    sortable: true,
                                                    filterable: {
                                                        mode: "row"
                                                    },
                                                    columnMenu: true,
                                                    columns: columns
                                                });
                                                grid.data("kendoTreeList").thead.kendoTooltip({
                                                    filter: "th",
                                                    content: function (e) {
                                                        var target = e.target; // element for which the tooltip is shown
                                                        return $(target).text();
                                                    }
                                                });


                                            }
                                            else {
                                                scorecardsServiceNew.loadKTScorecardData($scope.profileId, $scope.ngReportData.cParticipantIds,
                                                    $scope.ngReportData.stageId, $scope.ngReportData.mainProfileStepId == $scope.ktProfileTypes.start.id, $scope.ngReportData.evolutionStageId == null ? 0 : $scope.ngReportData.evolutionStageId).then(function (compData) {
                                                        var mainResult = _.filter($scope.scorecard.reportData.skillResults, function (skillRes) { return skillRes.id == -1 });
                                                        var compareResult = compData.skillResults;
                                                        if (mainResult.length == compareResult.length) {
                                                            _.forEach($scope.scorecard.reportData.skillResults, function (skillRes) {
                                                                skillRes.cIndicator = "";
                                                                skillRes.cParticipantId = $scope.ngReportData.cParticipantIds[0].id;
                                                                if (skillRes.id == -1) {
                                                                    var compareRes = _.find(compData.skillResults, function (compSkillRes) {
                                                                        return compSkillRes.pgId == skillRes.pgId &&
                                                                            compSkillRes.skillId == skillRes.skillId;
                                                                    });
                                                                    if (compareRes) {
                                                                        skillRes.cIndicator = setCKTIndicatorColor(compareRes.correctAnswersCountScore);
                                                                        skillRes.comparePointsScore = compareRes.pointsScore;
                                                                        skillRes.comparePercentScore = parseFloat(compareRes.percentScore).toFixed(2);
                                                                        skillRes.avgPointScore = parseFloat((skillRes.comparePointsScore + skillRes.pointsScore) / 2).toFixed(2);
                                                                        skillRes.avgPercentScore = parseFloat((parseFloat(skillRes.comparePercentScore) + parseFloat(skillRes.percentScore)) / 2).toFixed(2);
                                                                        if (skillRes.pointsScore == skillRes.comparePointsScore) {
                                                                            skillRes.trend = "Equal";
                                                                        }
                                                                        else {
                                                                            skillRes.trend = skillRes.pointsScore < skillRes.comparePointsScore ? "Down" : "Up";
                                                                        }
                                                                    }
                                                                    else {
                                                                        skillRes.comparePointsScore = null;
                                                                        skillRes.comparePercentScore = null;
                                                                        skillRes.avgPointScore = null;
                                                                        skillRes.avgPercentScore = null;
                                                                        skillRes.trend = null;

                                                                    }
                                                                }

                                                            });

                                                            var columns = [
                                                                { field: "pgName", title: $translate.instant('COMMON_PERFORMANCE_GROUP'), width: "11%" },
                                                                { field: "skillName", title: $translate.instant('COMMON_SKILL'), width: "11%" },
                                                                { field: "questionText", title: $translate.instant('DASHBOARD_QUESTION'), width: "11%" },
                                                                { field: "", title: $scope.ngReportData.mainParticipantsRaw.split(',')[0] + " " + $translate.instant('DASHBOARD_INDICATOR'), width: "5%", template: "<div ng-click='getKTAnswerDetail(#= (questionId != null)? questionId : ''#,#= (questionId != null)? participantId : ''#)' class='scale-circle' style='background: #: indicator #'></div>" },
                                                                { field: "", title: $scope.ngReportData.participantsRaw.split(',')[0] + " " + $translate.instant('DASHBOARD_INDICATOR'), width: "5%", template: "<div ng-click='getKTAnswerDetail(#= (questionId != null)? questionId : ''#,#= (questionId != null)? cParticipantId : ''#)' class='scale-circle' style='background: #: cIndicator #'></div>" },
                                                                { field: "pointsScore", title: $scope.ngReportData.mainParticipantsRaw.split(',')[0] + " " + $translate.instant('DASHBOARD_POINTS_SCORE'), width: columnWidthText, template: "<div class='number' style='color:" + colorMainPart + "'>#= (pointsScore == null) ? ' ' : pointsScore #</div>" },
                                                                { field: "comparePointsScore", title: $scope.ngReportData.participantsRaw.split(',')[0] + " " + $translate.instant('DASHBOARD_POINTS_SCORE'), width: columnWidthText, template: "<div class='number' style='color:" + colorComparePart + "'>#= (comparePointsScore == null) ? ' ' : comparePointsScore #</div>" },
                                                                { field: "percentScore", title: $scope.ngReportData.mainParticipantsRaw.split(',')[0] + " " + $translate.instant('COMMON_SCORE') + ", %", width: columnWidthText, template: "<div class='number' style='color:" + colorMainPart + "'>#= percentScore ? percentScore+'%' : '' #</div>" },
                                                                { field: "comparePercentScore", title: $scope.ngReportData.participantsRaw.split(',')[0] + " " + $translate.instant('COMMON_SCORE') + ", %", width: columnWidthText, template: "<div class='number' style='color:" + colorComparePart + "'>#= comparePercentScore ? comparePercentScore+'%' : '' #</div>" },
                                                                { field: "target", title: $translate.instant('DASHBOARD_BENCHMARK'), width: "6%", template: "<div class='number'>#= (benchmark == null) ? ' ' : benchmark #</div>", hidden: !$scope.ngReportData.isShowBenchmark },
                                                                { field: "trend", title: $translate.instant('DASHBOARD_TREND'), width: "4%", template: "<div class='trend-#: trend #'></div>" },
                                                                { field: "weight", title: $translate.instant('DASHBOARD_WEIGHT'), width: "6%", template: "<div class='number'>#= (weight == null) ? ' ' : weight #</div>" },
                                                                { field: "csf", title: $translate.instant('DASHBOARD_CSF'), width: "12%", template: "#= (csf == null) ? ' ' : csf #" },
                                                                { field: "avgPointScore", title: $translate.instant('DASHBOARD_AVG_POINT_SCORE'), width: "12%", template: "#= (avgPointScore == null) ? ' ' : avgPointScore #" },
                                                                { field: "avgPercentScore", title: $translate.instant('DASHBOARD_AVG_PERCENT_SCORE'), width: "12%", template: "<div class='number'>#= avgPercentScore ? avgPercentScore+'%' : '' #</div>" },
                                                                { field: "action", title: $translate.instant('COMMON_ACTION'), width: "12%", template: "#= (action == null) ? ' ' : action #" }
                                                            ];
                                                            //dialogService.showKTGridDialog("Performance Group Details - ", dataSource($scope.scorecard.reportData.skillResults), columns);
                                                            //var linkFn = $compile($("#ktGridDialogWindow"));
                                                            //linkFn($scope);

                                                            var colorMainPart = "black";
                                                            var colorComparePart = "blue";
                                                            var columnWidth = 10;
                                                            var columnWidthText = columnWidth + "%";
                                                            var grid = $("#ktDetailsGrid").kendoTreeList({
                                                                dataSource: dataSource($scope.scorecard.reportData.skillResults),
                                                                loadOnDemand: false,
                                                                sortable: true,
                                                                filterable: {
                                                                    mode: "row"
                                                                },
                                                                columnMenu: true,
                                                                columns: columns
                                                            });
                                                            grid.data("kendoTreeList").thead.kendoTooltip({
                                                                filter: "th",
                                                                content: function (e) {
                                                                    var target = e.target; // element for which the tooltip is shown
                                                                    return $(target).text();
                                                                }
                                                            });
                                                        }
                                                        else {
                                                            dialogService.showNotification($translate.instant('DASHBOARD_SORRY_SELECTED_STAGE_IS_NOT_COMPARABLE'), "warning");
                                                        }

                                                    });
                                            }

                                            $scope.scorecard.legends = [];
                                            var showReport;
                                            var treeGrid = $("#scorecardGrid");
                                            if (treeGrid.length > 0) {
                                                var treelist = treeGrid.data("kendoTreeList"); //todo implement with angular
                                                var mainPostfix = " (" + $scope.filter.mainStageName + ", " + getById($scope.filter.mainProfileStepId, $scope.filter.mainStepsOfProfile).label + ")";
                                                var postfix = " (" + $scope.filter.stageName + ", " + getById($scope.filter.profileStepId, $scope.filter.stepsOfProfile).label + ")";
                                                if ($scope.filter.mainParticipantsModel.length > 0) {
                                                    $scope.scorecard.legends.push(getLegendNames($scope.filter.mainParticipantsModel, colorMainPart, $scope.filter.mainParticipantsOptions, mainPostfix));
                                                    showReport = true;
                                                }
                                                if ($scope.filter.participantsModel.length > 0) {
                                                    $scope.scorecard.legends.push(getLegendNames($scope.filter.participantsModel, colorComparePart, $scope.filter.participantsOptions, postfix));
                                                    showReport = true;
                                                }
                                            }
                                            else {
                                                showReport = false;
                                            }

                                            $scope.scorecard.isShowReport = showReport;
                                            $stateParams = [];
                                        });;


                                });
                        }
                        function getKTFloatChartData() {
                            var participantsPerfomanceGroups = [];
                            var compareParticipantsPerfomanceGroups = [];
                            var evaluatorParticipantsPerfomanceGroups = [];
                            var benchmarkPerfomanceGroups = [];
                            var index = 0;
                            _.forEach($scope.skillResultsParticipants, function (item, i) {
                                if (item.id > -1) {
                                    participantsPerfomanceGroups.push({ id: 0, name: item.pgName, series: [], categories: [] });
                                    index++;
                                }
                                else if (item.pgId > 0) {
                                    if (!participantsPerfomanceGroups[participantsPerfomanceGroups.length - 1].series.length > 0) {

                                        participantsPerfomanceGroups[participantsPerfomanceGroups.length - 1].series.push({ name: $scope.ngReportData.mainParticipantsRaw.split(',')[0], data: [], color: ktDashboardColors.main });
                                    }
                                    if (participantsPerfomanceGroups[participantsPerfomanceGroups.length - 1].id == 0) {
                                        participantsPerfomanceGroups[participantsPerfomanceGroups.length - 1].id = item.pgId;
                                    }
                                    participantsPerfomanceGroups[participantsPerfomanceGroups.length - 1].categories.push(item.skillName);
                                    participantsPerfomanceGroups[participantsPerfomanceGroups.length - 1].series[participantsPerfomanceGroups[participantsPerfomanceGroups.length - 1].series.length - 1].data.push(item.pointsScore);
                                }
                            });

                            _.forEach($scope.skillResultsCompareParticipants, function (item, i) {
                                if (item.id > -1) {
                                    compareParticipantsPerfomanceGroups.push({ id: 0, name: item.pgName, series: [], categories: [] });
                                    index++;
                                }
                                else if (item.pgId > 0) {
                                    if (!compareParticipantsPerfomanceGroups[compareParticipantsPerfomanceGroups.length - 1].series.length > 0) {
                                        compareParticipantsPerfomanceGroups[compareParticipantsPerfomanceGroups.length - 1].series.push({ name: $scope.ngReportData.participantsRaw.split(',')[0], data: [], color: ktDashboardColors.compare });
                                    }
                                    if (compareParticipantsPerfomanceGroups[compareParticipantsPerfomanceGroups.length - 1].id == 0) {
                                        compareParticipantsPerfomanceGroups[compareParticipantsPerfomanceGroups.length - 1].id = item.pgId;
                                    }
                                    compareParticipantsPerfomanceGroups[compareParticipantsPerfomanceGroups.length - 1].categories.push(item.skillName);
                                    compareParticipantsPerfomanceGroups[compareParticipantsPerfomanceGroups.length - 1].series[compareParticipantsPerfomanceGroups[compareParticipantsPerfomanceGroups.length - 1].series.length - 1].data.push(item.pointsScore);
                                }
                            });

                            _.forEach($scope.skillResultsEvaluator, function (item, i) {
                                if (item.id > -1) {
                                    evaluatorParticipantsPerfomanceGroups.push({ id: 0, name: item.pgName, series: [], categories: [] });
                                    index++;
                                }
                                else if (item.pgId > 0) {
                                    if (!evaluatorParticipantsPerfomanceGroups[evaluatorParticipantsPerfomanceGroups.length - 1].series.length > 0) {
                                        evaluatorParticipantsPerfomanceGroups[evaluatorParticipantsPerfomanceGroups.length - 1].series.push({ name: "Evaluator", data: [], color: evaluatorColor });
                                    }
                                    if (evaluatorParticipantsPerfomanceGroups[evaluatorParticipantsPerfomanceGroups.length - 1].id == 0) {
                                        evaluatorParticipantsPerfomanceGroups[evaluatorParticipantsPerfomanceGroups.length - 1].id = item.pgId;
                                    }
                                    evaluatorParticipantsPerfomanceGroups[evaluatorParticipantsPerfomanceGroups.length - 1].categories.push(item.skillName);
                                    evaluatorParticipantsPerfomanceGroups[evaluatorParticipantsPerfomanceGroups.length - 1].series[evaluatorParticipantsPerfomanceGroups[evaluatorParticipantsPerfomanceGroups.length - 1].series.length - 1].data.push(item.pointsScore);
                                }
                            });
                            _.forEach($scope.skillResultsBenchmark, function (item, i) {
                                if (item.id > -1) {
                                    benchmarkPerfomanceGroups.push({ id: 0, name: item.pgName, series: [], categories: [] });
                                    index++;
                                }
                                else if (item.pgId > 0) {
                                    if (!benchmarkPerfomanceGroups[benchmarkPerfomanceGroups.length - 1].series.length > 0) {
                                        benchmarkPerfomanceGroups[benchmarkPerfomanceGroups.length - 1].series.push({ name: "BenchMark", data: [], color: ktDashboardColors.benchmark });
                                    }
                                    if (benchmarkPerfomanceGroups[benchmarkPerfomanceGroups.length - 1].id == 0) {
                                        benchmarkPerfomanceGroups[benchmarkPerfomanceGroups.length - 1].id = item.pgId;
                                    }
                                    benchmarkPerfomanceGroups[benchmarkPerfomanceGroups.length - 1].categories.push(item.skillName);
                                    benchmarkPerfomanceGroups[benchmarkPerfomanceGroups.length - 1].series[benchmarkPerfomanceGroups[benchmarkPerfomanceGroups.length - 1].series.length - 1].data.push(item.pointsScore);
                                }
                            });
                            $scope.skillResults = [];
                            _.forEach(participantsPerfomanceGroups, function (dataItem, i) {
                                $scope.skillResults.push({ id: dataItem.id, name: dataItem.name, series: dataItem.series, categories: dataItem.categories });

                                var compareParticipantsSkillResult = compareParticipantsPerfomanceGroups.filter(function (item) {
                                    if (item.name == dataItem.name) {
                                        return item;
                                    }
                                })
                                if (compareParticipantsSkillResult.length > 0) {
                                    _.forEach(compareParticipantsSkillResult[0].series, function (series) {
                                        $scope.skillResults[$scope.skillResults.length - 1].series.push(series)
                                    });
                                    _.forEach(compareParticipantsSkillResult[0].categories, function (category) {
                                        $scope.skillResults[$scope.skillResults.length - 1].categories.push(category);
                                    });


                                }

                                var evaluatorSkillResult = evaluatorParticipantsPerfomanceGroups.filter(function (item) {
                                    if (item.name == dataItem.name) {
                                        return item;
                                    }
                                });
                                if (evaluatorSkillResult.length > 0) {
                                    _.forEach(evaluatorSkillResult[0].series, function (series) {
                                        $scope.skillResults[$scope.skillResults.length - 1].series.push(series)
                                    });
                                    _.forEach(evaluatorSkillResult[0].categories, function (category) {
                                        $scope.skillResults[$scope.skillResults.length - 1].categories.push(category);
                                    });
                                }
                                var benchmarkSkillResult = benchmarkPerfomanceGroups.filter(function (item) {
                                    if (item.name == dataItem.name) {
                                        return item;
                                    }
                                });
                                if (benchmarkSkillResult.length > 0) {
                                    _.forEach(benchmarkSkillResult[0].series, function (series) {
                                        $scope.skillResults[$scope.skillResults.length - 1].series.push(series)
                                    });
                                    _.forEach(benchmarkSkillResult[0].categories, function (category) {
                                        $scope.skillResults[$scope.skillResults.length - 1].categories.push(category);
                                    });
                                }
                            });
                            //var graphsContainer = $($element).find(".GraphList");
                            //graphsContainer.empty();
                            //_.forEach($scope.skillResults, function (pg, i) {

                            //    var graphElemHtml = "<div><div>" + pg.name + "</div><div id='floatchart_" + i + "'></div></div>";
                            //    if (i == $scope.skillResults.length - 1) {
                            //        graphElemHtml += "<div><table><tr><td><button ng-click='getKTScorecardDialogDetail()' class='details-btn'>Details</button></td></tr></table><div>";
                            //    }
                            //    var linkFn = $compile(graphElemHtml);
                            //    var content = linkFn($scope);
                            //    $(graphsContainer).append(content);
                            //    var floatChart = $("#floatchart_" + i).kendoChart({
                            //        legend: {
                            //            position: "top",
                            //            visible: false
                            //        },
                            //        seriesDefaults: {
                            //            type: "column"
                            //        },
                            //        series: pg.series,
                            //        valueAxis: {
                            //            majorUnit: 1,
                            //            min: 0,
                            //            //max: reportModel.scale.scaleRanges[reportModel.scale.scaleRanges.length - 1].max,
                            //            labels: {
                            //                format: "{0}"
                            //            },
                            //            line: {
                            //                visible: true
                            //            },
                            //            axisCrossingValue: 0
                            //        },
                            //        categoryAxis: {
                            //            categories: _.uniq(pg.categories),
                            //            line: {
                            //                visible: false
                            //            },
                            //            labels: {
                            //                padding: { top: 0 }
                            //            }
                            //        },
                            //        legend: {
                            //            visible: true,
                            //            position: "bottom"
                            //        },
                            //        tooltip: {
                            //            visible: true,
                            //            background: "white",
                            //            format: "{0}",
                            //            template: "#= series.name #: #= value#"
                            //        }
                            //    });
                            //})
                            $scope.ktResultTypeChanged();
                        }
                        function setKTIndicatorColor(passScore, medalRule, skillResult) {
                            _.forEach(skillResult, function (dataItem) {
                                if (dataItem.id == -1) {
                                    if (_.isNull(dataItem.correctAnswersCountScore) || _.isUndefined(dataItem.correctAnswersCountScore) || dataItem.correctAnswersCountScore == 0) {
                                        dataItem.indicator = passScoreIndicator.failed;
                                        dataItem.cIndicator = passScoreIndicator.failed;
                                    }
                                    else {
                                        dataItem.indicator = passScoreIndicator.passed;
                                        dataItem.cIndicator = passScoreIndicator.passed;
                                    }
                                }
                            });
                            return skillResult;
                        }

                        function setCKTIndicatorColor(correctAnswersCountScore) {
                            var indicator = "";
                            if (_.isNull(correctAnswersCountScore) || _.isUndefined(correctAnswersCountScore) || correctAnswersCountScore == 0) {
                                indicator = passScoreIndicator.failed;
                            }
                            else {
                                indicator = passScoreIndicator.passed;
                            }
                            return indicator;
                        }

                        function setKTDetailIndicatorColor(data) {

                            _.forEach(data.skillResults, function (dataItem) {
                                if (dataItem.id == -1 || dataItem.id == undefined) {
                                    if (_.isNull(dataItem.correctAnswersCountScore) || _.isUndefined(dataItem.correctAnswersCountScore) || dataItem.correctAnswersCountScore == 0) {
                                        dataItem.indicator = passScoreIndicator.failed;
                                    }
                                    else {
                                        dataItem.indicator = passScoreIndicator.passed;
                                    }
                                }
                            });

                        }
                        function dataSource(scorecardData) {
                            return new kendo.data.TreeListDataSource({
                                data: scorecardData,
                                schema: {
                                    model: {
                                        id: "id",
                                        fields: {
                                            parentId: { type: "number", nullable: true },
                                            id: { type: "number" }
                                        },
                                        expanded: true
                                    }
                                }
                            });
                        }

                        $(window).resize(function () {
                            if (profileCharts && profileCharts.length > 0) {
                                angular.forEach(profileCharts, function (chart) {
                                    redrawChart(chart);
                                });
                            }
                        });

                        $scope.load = function () {
                            if (!reportModel) return;
                            var mainGraph = $($element).find(".MainGraph").empty();

                            if ($scope.pgModesModel && $scope.pgModesModel.length > 0 && reportModel.performanceGroups.length === $scope.pgModesModel.length) {

                            } else {
                                $scope.pgModesModel = [];
                                angular.forEach(reportModel.performanceGroups, function (pg, index) {
                                    $scope.pgModesModel.push({ id: index, value: 1 });
                                });
                            }

                            var largest = 0;
                            var largestIndex = -1;
                            if (reportModel && reportModel.performanceGroups) {
                                for (var i = 0; i < reportModel.performanceGroups.length; i++) {
                                    if (reportModel.performanceGroups[i].skills.length > largest) {
                                        largest = reportModel.performanceGroups[i].skills.length;
                                        largestIndex = i;
                                    }
                                }
                            }
                            if (reportModel.performanceGroups) {
                                var colorSeries = getColorSeries(reportModel);
                                drawPerfomanceGraph(mainGraph, largestIndex, reportModel.performanceGroups[largestIndex], colorSeries, null, null, null, 500);

                                var graphsContainer = $($element).find(".GraphList");
                                graphsContainer.empty();

                                $.each(reportModel.performanceGroups, function (index, value) {
                                    if (index != largestIndex) {
                                        var startDecorHtml = "<div class='col-md-3'>";
                                        var endDecorHtml = "</div>";
                                        drawPerfomanceGraph(graphsContainer, index, value, colorSeries, startDecorHtml, endDecorHtml, null, 300);
                                    }
                                });
                            }

                            // strong 3 questions
                            if (reportModel.isShowStrongKpi) {
                                $(".strongBox").empty();
                                $.each(reportModel.strongAreas, function (index, value) {
                                    var prc = percentage(reportModel.max, value.score);

                                    var strongElemHtml = "<div class='GraphScoreBox'>";
                                    strongElemHtml += "<h3 class='width80Perc'>" + value.name + "</h3>";
                                    strongElemHtml += "<h4 class='width80Perc'>" + value.description + "</h4>";
                                    strongElemHtml += "<div class='GraphLiProc width80Perc FloatLeft'>";
                                    strongElemHtml += "<div id='PGS" + index.toString() + "' class='GraphLiProc FloatLeft'></div>";
                                    strongElemHtml += "</div>";
                                    strongElemHtml += "<div class='GraphLiProc width20Perc FloatLeft'>";
                                    strongElemHtml += "<span class='mArLeft015'>" + value.score.toString() + "</span>";
                                    strongElemHtml += "</div>";

                                    strongElemHtml += "</div>";



                                    $(".strongBox").append(strongElemHtml);
                                    if ($("#PGS" + index).length > 0) {
                                        var progressBar;
                                        progressBar = new ProgressBar("PGS" + index.toString(), { 'width': '100%', 'height': '30px' });
                                        progressBarItem = {};
                                        progressBarItem[ProgressBar.OPTION_NAME.ITEM_ID] = "item1";


                                        progressBarItem[ProgressBar.OPTION_NAME.COLOR_ID] = ProgressBar.OPTION_VALUE.COLOR_ID.CUSTOM;
                                        progressBarItem.color = getColor(value.score, reportModel.scale.scaleRanges);
                                        progressBar.createItem(progressBarItem);
                                        progressBar.setPercent(prc);
                                    }

                                });
                                if ((reportModel.isCompare) && (reportModel.cStrongAreas)) {
                                    $(".comparestrongBox").empty();
                                    var prcc = 0;

                                    $.each(reportModel.cStrongAreas, function (index, value) {
                                        prcc = percentage(reportModel.max, value.score);

                                        var comaprestrongElemHtml = "<div class='GraphScoreBox'>";
                                        comaprestrongElemHtml += "<h3 class='width80Perc'>" + value.name + "</h3>";
                                        comaprestrongElemHtml += "<h4 class='width80Perc'>" + value.description + "</h4>";
                                        comaprestrongElemHtml += "<div class='GraphLiProc width80Perc FloatLeft'>";
                                        comaprestrongElemHtml += "<div id='PGSC" + index.toString() + "' class='GraphLiProc FloatLeft'></div>";
                                        comaprestrongElemHtml += "</div>";
                                        comaprestrongElemHtml += "<div class='GraphLiProc width20Perc FloatLeft' style='margin-top:0px;' >";
                                        comaprestrongElemHtml += "<span class='mArLeft015'>" + value.score.toString() + "</span>";
                                        comaprestrongElemHtml += "<div style='clear:both;'>";
                                        //comaprestrongElemHtml += getKPIImage(value.score, value.score);
                                        comaprestrongElemHtml += "</div>";
                                        comaprestrongElemHtml += "</div>";

                                        $(".comparestrongBox").append(comaprestrongElemHtml);

                                        if ($("#PGSC" + index).length > 0) {
                                            var progressBar;
                                            progressBar = new ProgressBar("PGSC" + index.toString(), { 'width': '100%', 'height': '30px' });
                                            progressBarItem = {};
                                            progressBarItem[ProgressBar.OPTION_NAME.ITEM_ID] = "item1";
                                            progressBarItem[ProgressBar.OPTION_NAME.COLOR_ID] = ProgressBar.OPTION_VALUE.COLOR_ID.CUSTOM;
                                            progressBarItem.color = getColor(value.score, reportModel.scale.scaleRanges);

                                            progressBar.createItem(progressBarItem);
                                            progressBar.setPercent(prcc);
                                        }
                                    });

                                }




                            }

                            if (reportModel.isShowWeakKpi) {
                                $(".weakBox").empty();
                                $.each(reportModel.weakAreas, function (index, value) {
                                    var prc = percentage(reportModel.max, value.score);


                                    var strongElemHtml = "<div class='GraphScoreBox'>";
                                    strongElemHtml += "<h3 class='width80Perc'>" + value.name + "</h3>";
                                    strongElemHtml += "<h4 class='width80Perc'>" + value.description + "</h4>";
                                    strongElemHtml += "<div class='GraphLiProc width80Perc FloatLeft'>";
                                    strongElemHtml += "<div id='PGF" + index.toString() + "' class='GraphLiProc FloatLeft'></div>";
                                    strongElemHtml += "</div>";
                                    strongElemHtml += "<div class='GraphLiProc width20Perc FloatLeft'>";
                                    strongElemHtml += "<span class='mArLeft015'>" + value.score.toString() + "</span>";
                                    strongElemHtml += "<div style='clear:both;'>";
                                    strongElemHtml += "</div>";

                                    strongElemHtml += "</div>";


                                    $(".weakBox").append(strongElemHtml);

                                    var progressBar;
                                    progressBar = new ProgressBar("PGF" + index.toString(), { 'width': '100%', 'height': '30px' });
                                    progressBarItem = {};
                                    progressBarItem[ProgressBar.OPTION_NAME.ITEM_ID] = "item1";
                                    progressBarItem[ProgressBar.OPTION_NAME.COLOR_ID] = ProgressBar.OPTION_VALUE.COLOR_ID.CUSTOM;
                                    progressBarItem.color = getColor(value.score, reportModel.scale.scaleRanges);
                                    progressBar.createItem(progressBarItem);
                                    progressBar.setPercent(prc);

                                });

                                if ((reportModel.isCompare) && (reportModel.cWeakAreas)) {
                                    $(".compareweakBox").empty();
                                    var prcc = 0;
                                    $.each(reportModel.cWeakAreas, function (index, value) {
                                        var comparestrongElemHtml = "<div class='GraphScoreBox'>";
                                        comparestrongElemHtml += "<h3 class='width80Perc'>" + value.name + "</h3>";
                                        comparestrongElemHtml += "<h4 class='width80Perc'>" + value.description + "</h4>";
                                        comparestrongElemHtml += "<div class='GraphLiProc width80Perc FloatLeft'>";
                                        comparestrongElemHtml += "<div id='PGFC" + index.toString() + "' class='GraphLiProc FloatLeft'></div>";
                                        comparestrongElemHtml += "</div>";
                                        comparestrongElemHtml += "<div class='GraphLiProc width20Perc FloatLeft' style='margin-top:0px;' >";
                                        comparestrongElemHtml += "<span class='mArLeft015'>" + value.score.toString() + "</span>";
                                        comparestrongElemHtml += "<div style='clear:both;'>";
                                        //comparestrongElemHtml += getKPIImage(value.score, value.score);
                                        comparestrongElemHtml += "</div>";
                                        comparestrongElemHtml += "</div>";

                                        $(".compareweakBox").append(comparestrongElemHtml);

                                        if ((reportModel.isCompare) && (value.score > 0)) {
                                            prcc = percentage(reportModel.max, value.score);

                                            var progressBar;
                                            progressBar = new ProgressBar("PGFC" + index.toString(), { 'width': '100%', 'height': '30px' });
                                            progressBarItem = {};
                                            progressBarItem[ProgressBar.OPTION_NAME.ITEM_ID] = "item1";
                                            progressBarItem[ProgressBar.OPTION_NAME.COLOR_ID] = ProgressBar.OPTION_VALUE.COLOR_ID.CUSTOM;
                                            progressBarItem.color = getColor(value.score, reportModel.scale.scaleRanges);
                                            progressBar.createItem(progressBarItem);
                                            progressBar.setPercent(prcc);
                                        }
                                    });

                                }

                            }


                            $("<div id='tooltip'></div>").css({
                                position: "absolute",
                                display: "none",
                                border: "1px solid #fdd",
                                padding: "2px",
                                "background-color": "#fee",
                                opacity: 0.80
                            }).appendTo("body");

                            $('#home_gauge_total_score_value').html("<span style='color:" + gaugeSeriesColors.main + "; display: inline-block;'>" + reportModel.averageScore + "</span>");



                            if (reportModel.evaluatorsProfileScorecards) {
                                if (reportModel.evaluatorsProfileScorecards.length > 0) {
                                    if (!isNaN(reportModel.evaluatorsProfileScorecards[0].averageScore)) {
                                        var totalScoreEl = '<span style="color: #000000; display: inline - block;"> vs </span>';
                                        totalScoreEl += "<span style='color:" + gaugeSeriesColors.mainEvaluator + "; display: inline-block;'>";
                                        totalScoreEl += parseFloat(reportModel.evaluatorsProfileScorecards[0].averageScore).toFixed(1);
                                        totalScoreEl += '</span>';
                                        $($element).find("#home_gauge_total_score_value").append(totalScoreEl);
                                        //$('#gauge_total_score_value').text(reportModel.averageScore);
                                        if ($scope.ngReportData.isShowBenchmark) {

                                            var totalScoreEl = '<span style="color: #000000; display: inline - block;"> vs </span>';
                                            totalScoreEl += "<span style='color:" + gaugeSeriesColors.benchmark + "; display: inline-block;'>";
                                            totalScoreEl += $scope.ngReportData.performanceGroups[0].benchmark
                                            totalScoreEl += '</span>';
                                            $($element).find("#home_gauge_total_score_value").append(totalScoreEl);

                                            $("#home_gauge_total_score").kendoRadialGauge({
                                                pointer: [{
                                                    value: reportModel.averageScore,
                                                    color: gaugeSeriesColors.main,
                                                    cap: { size: 0.1 }
                                                }, {

                                                    value: $scope.ngReportData.performanceGroups[0].benchmark,
                                                    color: gaugeSeriesColors.benchmark,

                                                }, {
                                                    value: reportModel.evaluatorsProfileScorecards[0].averageScore,
                                                    color: gaugeSeriesColors.mainEvaluator,
                                                }],
                                                scale: {
                                                    min: reportModel.scale.scaleRanges[0].min,
                                                    minorUnit: 1,
                                                    startAngle: -30,
                                                    endAngle: 210,
                                                    max: reportModel.scale.scaleRanges[reportModel.scale.scaleRanges.length - 1].max,
                                                    ranges: reportModel.scale.scaleRanges,
                                                }
                                            });
                                        }
                                        else {
                                            $("#home_gauge_total_score").kendoRadialGauge({

                                                pointer: [{
                                                    value: reportModel.averageScore,
                                                    color: gaugeSeriesColors.main,
                                                    cap: { size: 0.1 }
                                                }, {
                                                    value: reportModel.evaluatorsProfileScorecards[0].averageScore,
                                                    color: gaugeSeriesColors.mainEvaluator,
                                                }],
                                                scale: {
                                                    min: reportModel.scale.scaleRanges[0].min,
                                                    minorUnit: 1,
                                                    startAngle: -30,
                                                    endAngle: 210,
                                                    max: reportModel.scale.scaleRanges[reportModel.scale.scaleRanges.length - 1].max,
                                                    ranges: reportModel.scale.scaleRanges,
                                                }
                                            });
                                        }
                                    }
                                    else {
                                        if ($scope.ngReportData.isShowBenchmark) {

                                            var totalScoreEl = '<span style="color: #000000; display: inline - block;"> vs </span>';
                                            totalScoreEl += "<span style='color:" + gaugeSeriesColors.benchmark + "; display: inline-block;'>";
                                            totalScoreEl += $scope.ngReportData.performanceGroups[0].benchmark
                                            totalScoreEl += '</span>';
                                            $($element).find("#home_gauge_total_score_value").append(totalScoreEl);

                                            $("#home_gauge_total_score").kendoRadialGauge({
                                                pointer: [{
                                                    value: reportModel.averageScore,
                                                    color: gaugeSeriesColors.main,
                                                    cap: { size: 0.1 }
                                                }, {
                                                    value: $scope.ngReportData.performanceGroups[0].benchmark,
                                                    color: gaugeSeriesColors.benchmark,
                                                }],
                                                scale: {
                                                    min: reportModel.scale.scaleRanges[0].min,
                                                    minorUnit: 1,
                                                    startAngle: -30,
                                                    endAngle: 210,
                                                    max: reportModel.scale.scaleRanges[reportModel.scale.scaleRanges.length - 1].max,
                                                    ranges: reportModel.scale.scaleRanges,
                                                }
                                            });
                                        }
                                        else {
                                            $("#home_gauge_total_score").kendoRadialGauge({
                                                pointer: {
                                                    value: reportModel.averageScore,
                                                    color: gaugeSeriesColors.main,
                                                },
                                                scale: {
                                                    min: reportModel.scale.scaleRanges[0].min,
                                                    minorUnit: 1,
                                                    startAngle: -30,
                                                    endAngle: 210,
                                                    max: reportModel.scale.scaleRanges[reportModel.scale.scaleRanges.length - 1].max,
                                                    ranges: reportModel.scale.scaleRanges,
                                                }
                                            });
                                        }
                                    }
                                }
                                else {


                                    if ($scope.ngReportData.isShowBenchmark) {

                                        var totalScoreEl = '<span style="color: #000000; display: inline - block;"> vs </span>';
                                        totalScoreEl += "<span style='color:" + gaugeSeriesColors.benchmark + "; display: inline-block;'>";
                                        totalScoreEl += $scope.ngReportData.performanceGroups[0].benchmark
                                        totalScoreEl += '</span>';
                                        $($element).find("#home_gauge_total_score_value").append(totalScoreEl);

                                        $("#home_gauge_total_score").kendoRadialGauge({
                                            pointer: [{
                                                value: reportModel.averageScore,
                                                color: gaugeSeriesColors.main,
                                                cap: { size: 0.1 }
                                            }, {
                                                value: $scope.ngReportData.performanceGroups[0].benchmark,
                                                color: gaugeSeriesColors.benchmark,
                                            }],
                                            scale: {
                                                min: reportModel.scale.scaleRanges[0].min,
                                                minorUnit: 1,
                                                startAngle: -30,
                                                endAngle: 210,
                                                max: reportModel.scale.scaleRanges[reportModel.scale.scaleRanges.length - 1].max,
                                                ranges: reportModel.scale.scaleRanges,
                                            }
                                        });
                                    }
                                    else {
                                        $("#home_gauge_total_score").kendoRadialGauge({
                                            pointer: {
                                                value: reportModel.averageScore,
                                                color: gaugeSeriesColors.main,
                                            },
                                            scale: {
                                                min: reportModel.scale.scaleRanges[0].min,
                                                minorUnit: 1,
                                                startAngle: -30,
                                                endAngle: 210,
                                                max: reportModel.scale.scaleRanges[reportModel.scale.scaleRanges.length - 1].max,
                                                ranges: reportModel.scale.scaleRanges,
                                            }
                                        });
                                    }
                                }
                            }
                            else {
                                if ($scope.ngReportData.isShowBenchmark) {

                                    var totalScoreEl = '<span style="color: #000000; display: inline - block;"> vs </span>';
                                    totalScoreEl += "<span style='color:" + gaugeSeriesColors.benchmark + "; display: inline-block;'>";
                                    totalScoreEl += $scope.ngReportData.performanceGroups[0].benchmark
                                    totalScoreEl += '</span>';
                                    $($element).find("#home_gauge_total_score_value").append(totalScoreEl);

                                    $("#home_gauge_total_score").kendoRadialGauge({
                                        pointer: [{
                                            value: reportModel.averageScore,
                                            color: gaugeSeriesColors.main,
                                            cap: { size: 0.1 }
                                        }, {
                                            value: $scope.ngReportData.performanceGroups[0].benchmark,
                                            color: gaugeSeriesColors.benchmark,
                                        }],
                                        scale: {
                                            min: reportModel.scale.scaleRanges[0].min,
                                            minorUnit: 1,
                                            startAngle: -30,
                                            endAngle: 210,
                                            max: reportModel.scale.scaleRanges[reportModel.scale.scaleRanges.length - 1].max,
                                            ranges: reportModel.scale.scaleRanges,
                                        }
                                    });
                                }
                                else {
                                    $("#home_gauge_total_score").kendoRadialGauge({
                                        pointer: {
                                            value: reportModel.averageScore,
                                            color: gaugeSeriesColors.main,
                                        },
                                        scale: {
                                            min: reportModel.scale.scaleRanges[0].min,
                                            minorUnit: 1,
                                            startAngle: -30,
                                            endAngle: 210,
                                            max: reportModel.scale.scaleRanges[reportModel.scale.scaleRanges.length - 1].max,
                                            ranges: reportModel.scale.scaleRanges,
                                        }
                                    });
                                }
                            }

                            if (!isNaN(reportModel.weakAverageScore)) {
                                $('#home_gauge_total_weak_value').html("<span style='color:" + gaugeSeriesColors.main + "; display: inline-block;'>" + reportModel.weakAverageScore + "</span>");
                                if ($scope.ngReportData.isShowBenchmark) {
                                    var benchmarkAvg = 0;
                                    var benchmarkTotal = 0;
                                    _.each(reportModel.performanceGroups, function (pgItem) {
                                        if (pgItem.benchmark) {
                                            benchmarkTotal += pgItem.benchmark;
                                        }
                                    });
                                    if (benchmarkTotal > 0) {
                                        benchmarkAvg = parseInt(benchmarkTotal / reportModel.performanceGroups.length);
                                    }
                                    var totalScoreEl = '<span style="color: #000000; display: inline - block;"> vs </span>';
                                    totalScoreEl += "<span style='color:" + gaugeSeriesColors.benchmark + "'; display: inline-block;'>";
                                    totalScoreEl += benchmarkAvg;
                                    totalScoreEl += '</span>';
                                    $($element).find("#home_gauge_total_weak_value").append(totalScoreEl);


                                    $("#home_gauge_total_weak").kendoRadialGauge({
                                        pointer: [{
                                            value: reportModel.weakAverageScore,
                                            color: gaugeSeriesColors.main,
                                        },
                                        {
                                            value: benchmarkAvg,
                                            color: gaugeSeriesColors.benchmark,
                                        }],
                                        scale: {
                                            min: reportModel.scale.scaleRanges[0].min,
                                            minorUnit: 1,
                                            startAngle: -30,
                                            endAngle: 210,
                                            max: reportModel.scale.scaleRanges[reportModel.scale.scaleRanges.length - 1].max,
                                            labels: {
                                                position: "inside"
                                            },
                                            ranges: reportModel.scale.scaleRanges,
                                        }
                                    });
                                }
                                else {
                                    $("#home_gauge_total_weak").kendoRadialGauge({
                                        pointer: {
                                            value: reportModel.weakAverageScore,
                                            color: gaugeSeriesColors.main,
                                        },
                                        scale: {
                                            min: reportModel.scale.scaleRanges[0].min,
                                            minorUnit: 1,
                                            startAngle: -30,
                                            endAngle: 210,
                                            max: reportModel.scale.scaleRanges[reportModel.scale.scaleRanges.length - 1].max,
                                            labels: {
                                                position: "inside"
                                            },
                                            ranges: reportModel.scale.scaleRanges,
                                        }
                                    });
                                }
                            }
                            if (reportModel.evaluatorsProfileScorecards) {

                                if (reportModel.evaluatorsProfileScorecards.length > 0) {

                                    if (!isNaN(reportModel.evaluatorsProfileScorecards[0].weakAverageScore)) {
                                        var totalScoreEl = '<span style="color: #000000; display: inline - block;"> vs </span>';
                                        totalScoreEl += "<span style='color:" + gaugeSeriesColors.mainEvaluator + "'; display: inline-block;'>";
                                        totalScoreEl += parseFloat(reportModel.evaluatorsProfileScorecards[0].weakAverageScore).toFixed(1);
                                        totalScoreEl += '</span>';
                                        $($element).find("#home_gauge_total_weak_value").append(totalScoreEl);
                                        //$('#gauge_total_score_value').text(reportModel.averageScore);

                                        $("#home_gauge_total_weak").kendoRadialGauge({
                                            //pointer: {
                                            //    value: reportModel.weakAverageScore
                                            //},
                                            pointer: [{
                                                value: reportModel.weakAverageScore,
                                                cap: { size: 0.1 },
                                                color: gaugeSeriesColors.main,
                                            }, {
                                                value: reportModel.evaluatorsProfileScorecards[0].weakAverageScore,
                                                //color: "#005aff",
                                                color: gaugeSeriesColors.mainEvaluator,
                                            }],
                                            scale: {
                                                min: reportModel.scale.scaleRanges[0].min,
                                                minorUnit: 1,
                                                startAngle: -30,
                                                endAngle: 210,
                                                max: reportModel.scale.scaleRanges[reportModel.scale.scaleRanges.length - 1].max,
                                                labels: {
                                                    position: "inside"
                                                },
                                                ranges: reportModel.scale.scaleRanges,
                                            }
                                        });
                                    }
                                }
                            }

                            if (!isNaN(reportModel.strongAverageScore)) {
                                $('#home_gauge_total_strong_value').html("<span style='color:" + gaugeSeriesColors.main + "; display: inline-block;'>" + parseFloat(reportModel.strongAverageScore).toFixed(1) + "</span>");
                                if ($scope.ngReportData.isShowBenchmark) {
                                    var benchmarkAvg = 0;
                                    var benchmarkTotal = 0;
                                    _.each(reportModel.performanceGroups, function (pgItem) {
                                        if (pgItem.benchmark) {
                                            benchmarkTotal += pgItem.benchmark;
                                        }
                                    });
                                    if (benchmarkTotal > 0) {
                                        benchmarkAvg = parseInt(benchmarkTotal / reportModel.performanceGroups.length);
                                    }
                                    var totalScoreEl = '<span style="color: #000000; display: inline - block;"> vs </span>';
                                    totalScoreEl += "<span style='color:" + gaugeSeriesColors.benchmark + "'; display: inline-block;'>";
                                    totalScoreEl += benchmarkAvg;
                                    totalScoreEl += '</span>';
                                    $($element).find("#home_gauge_total_strong_value").append(totalScoreEl);

                                    $("#home_gauge_total_strong").kendoRadialGauge({
                                        pointer: [{
                                            value: reportModel.strongAverageScore,
                                            color: gaugeSeriesColors.main,
                                        }, {
                                            value: benchmarkAvg,
                                            color: gaugeSeriesColors.benchmark,
                                        }],
                                        scale: {
                                            min: reportModel.scale.scaleRanges[0].min,
                                            minorUnit: 1,
                                            startAngle: -30,
                                            endAngle: 210,
                                            max: reportModel.scale.scaleRanges[reportModel.scale.scaleRanges.length - 1].max,
                                            labels: {
                                                position: "inside"
                                            },
                                            ranges: reportModel.scale.scaleRanges,
                                        }
                                    });
                                }
                                else {
                                    $("#home_gauge_total_strong").kendoRadialGauge({
                                        pointer: {
                                            value: reportModel.strongAverageScore,
                                            color: gaugeSeriesColors.main,
                                        },
                                        scale: {
                                            min: reportModel.scale.scaleRanges[0].min,
                                            minorUnit: 1,
                                            startAngle: -30,
                                            endAngle: 210,
                                            max: reportModel.scale.scaleRanges[reportModel.scale.scaleRanges.length - 1].max,
                                            labels: {
                                                position: "inside"
                                            },
                                            ranges: reportModel.scale.scaleRanges,
                                        }
                                    });
                                }

                            }

                            if (reportModel.evaluatorsProfileScorecards) {
                                if (reportModel.evaluatorsProfileScorecards.length > 0) {
                                    if (!isNaN(reportModel.evaluatorsProfileScorecards[0].strongAverageScore)) {
                                        var totalScoreEl = '<span style="color: #000000; display: inline - block;"> vs </span>';
                                        totalScoreEl += "<span style='color:" + gaugeSeriesColors.mainEvaluator + "; display: inline-block;'>";
                                        totalScoreEl += parseFloat(reportModel.evaluatorsProfileScorecards[0].strongAverageScore).toFixed(1);
                                        totalScoreEl += '</span>';
                                        $($element).find("#home_gauge_total_strong_value").append(totalScoreEl);
                                        //$('#gauge_total_score_value').text(reportModel.averageScore);

                                        $("#home_gauge_total_strong").kendoRadialGauge({
                                            pointer: [{
                                                value: reportModel.strongAverageScore,
                                                color: gaugeSeriesColors.main,
                                                cap: { size: 0.1 }
                                            }, {
                                                value: reportModel.evaluatorsProfileScorecards[0].strongAverageScore,
                                                color: gaugeSeriesColors.mainEvaluator,
                                            }],
                                            scale: {
                                                min: reportModel.scale.scaleRanges[0].min,
                                                minorUnit: 1,
                                                startAngle: -30,
                                                endAngle: 210,
                                                max: reportModel.scale.scaleRanges[reportModel.scale.scaleRanges.length - 1].max,
                                                labels: {
                                                    position: "inside"
                                                },
                                                ranges: reportModel.scale.scaleRanges,
                                            }
                                        });
                                    }
                                }
                            }


                            $("#home_kpiImageScore").empty();
                            $("#home_kpiImageStrong").empty();
                            $("#home_kpiImageWeak").empty();
                            if (reportModel.cAverageScore) {

                                //$('#gauge_total_score_value').html("<span style='color: #ff6e19 ; display: inline-block;'>" + reportModel.averageScore + "</span>");

                                //$("#gauge_total_score").kendoRadialGauge({
                                //    pointer: [{
                                //        value: reportModel.averageScore,
                                //        color: gaugeSeriesColors.main,
                                //        cap: { size: 0.1 }
                                //    }],
                                //    scale: {
                                //        min: reportModel.scale.scaleRanges[0].min,
                                //        minorUnit: 1,
                                //        startAngle: -30,
                                //        endAngle: 210,
                                //        max: reportModel.scale.scaleRanges[reportModel.scale.scaleRanges.length - 1].max,
                                //        labels: {
                                //            position: "inside"
                                //        },
                                //        ranges: reportModel.scale.scaleRanges,
                                //    }
                                //});

                                if (reportModel.cAverageScore) {
                                    var totalScoreEl = '<span style="color: #000000; display: inline - block;">  </span>';
                                    totalScoreEl += "<span style='color:" + gaugeSeriesColors.compare + "; display: inline-block;'>";
                                    totalScoreEl += parseFloat(reportModel.cAverageScore).toFixed(1);
                                    totalScoreEl += '</span>';
                                    $($element).find("#home_compare_gauge_total_score_value").html(totalScoreEl);
                                    //$('#gauge_total_score_value').text(reportModel.averageScore);
                                }
                                $("#home_compare_gauge_total_score").kendoRadialGauge({
                                    pointer: [{
                                        value: reportModel.cAverageScore,
                                        color: gaugeSeriesColors.compare,
                                    }],
                                    scale: {
                                        min: reportModel.scale.scaleRanges[0].min,
                                        minorUnit: 1,
                                        startAngle: -30,
                                        endAngle: 210,
                                        max: reportModel.scale.scaleRanges[reportModel.scale.scaleRanges.length - 1].max,
                                        labels: {
                                            position: "inside"
                                        },
                                        ranges: reportModel.scale.scaleRanges,
                                    }
                                });


                                if (reportModel.cEvaluatorsProfileScorecards) {
                                    if (reportModel.cEvaluatorsProfileScorecards.length > 0) {
                                        if (!isNaN(reportModel.cEvaluatorsProfileScorecards[0].averageScore)) {
                                            var totalScoreEl = '<span style="color: #000000; display: inline - block;"> vs </span>';
                                            totalScoreEl += "<span style='color:" + gaugeSeriesColors.mainEvaluator + "; display: inline-block;'>";
                                            totalScoreEl += parseFloat(reportModel.cEvaluatorsProfileScorecards[0].averageScore).toFixed(1);
                                            totalScoreEl += '</span>';
                                            $($element).find("#home_compare_gauge_total_score_value").append(totalScoreEl);
                                            //$('#gauge_total_score_value').text(reportModel.averageScore);
                                            $("#home_compare_gauge_total_score").empty();
                                            $("#home_compare_gauge_total_score").kendoRadialGauge({

                                                pointer: [{
                                                    value: reportModel.cAverageScore,
                                                    color: gaugeSeriesColors.compare,
                                                    cap: { size: 0.1 }
                                                }, {
                                                    value: reportModel.cEvaluatorsProfileScorecards[0].averageScore,
                                                    color: gaugeSeriesColors.compareEvaluator,
                                                }],
                                                scale: {
                                                    min: reportModel.scale.scaleRanges[0].min,
                                                    minorUnit: 1,
                                                    startAngle: -30,
                                                    endAngle: 210,
                                                    max: reportModel.scale.scaleRanges[reportModel.scale.scaleRanges.length - 1].max,
                                                    ranges: reportModel.scale.scaleRanges,
                                                }
                                            });
                                        }
                                        else {


                                            if ($scope.ngReportData.isShowBenchmark) {

                                                var totalScoreEl = '<span style="color: #000000; display: inline - block;"> vs </span>';
                                                totalScoreEl += "<span style='color:" + gaugeSeriesColors.benchmark + "; display: inline-block;'>";
                                                totalScoreEl += $scope.ngReportData.performanceGroups[0].benchmark
                                                totalScoreEl += '</span>';
                                                $($element).find("#home_gauge_total_score_value").append(totalScoreEl);

                                                $("#home_compare_gauge_total_score").kendoRadialGauge({
                                                    pointer: [{
                                                        value: reportModel.cAverageScore,
                                                        color: gaugeSeriesColors.compare,
                                                        cap: { size: 0.1 }
                                                    }, {
                                                        value: $scope.ngReportData.performanceGroups[0].benchmark,
                                                        color: gaugeSeriesColors.benchmark,
                                                    }],
                                                    scale: {
                                                        min: reportModel.scale.scaleRanges[0].min,
                                                        minorUnit: 1,
                                                        startAngle: -30,
                                                        endAngle: 210,
                                                        max: reportModel.scale.scaleRanges[reportModel.scale.scaleRanges.length - 1].max,
                                                        ranges: reportModel.scale.scaleRanges,
                                                    }
                                                });
                                            }
                                            else {
                                                $("#home_compare_gauge_total_score").kendoRadialGauge({
                                                    pointer: {
                                                        value: reportModel.cAverageScore,
                                                        color: gaugeSeriesColors.compare,
                                                    },
                                                    scale: {
                                                        min: reportModel.scale.scaleRanges[0].min,
                                                        minorUnit: 1,
                                                        startAngle: -30,
                                                        endAngle: 210,
                                                        max: reportModel.scale.scaleRanges[reportModel.scale.scaleRanges.length - 1].max,
                                                        ranges: reportModel.scale.scaleRanges,
                                                    }
                                                });
                                            }




                                        }
                                    }
                                }




                                if (reportModel.cWeakAverageScore > 0) {
                                    var totalScoreEl = '<span style="color: #000000; display: inline - block;">  </span>';
                                    totalScoreEl += "<span style='color:" + gaugeSeriesColors.compare + "; display: inline-block;'>";
                                    totalScoreEl += parseFloat(reportModel.cWeakAverageScore).toFixed(1);
                                    totalScoreEl += '</span>';
                                    $($element).find("#home_compare_gauge_total_weak_value").html(totalScoreEl);
                                    //$('#gauge_total_score_value').text(reportModel.averageScore);
                                }
                                //$("#gauge_total_weak").kendoRadialGauge({
                                //    pointer: [{
                                //        value: reportModel.weakAverageScore,
                                //        color: gaugeSeriesColors.main,
                                //        cap: { size: 0.1 }
                                //    }],
                                //    scale: {
                                //        min: reportModel.scale.scaleRanges[0].min,
                                //        minorUnit: 1,
                                //        startAngle: -30,
                                //        endAngle: 210,
                                //        max: reportModel.scale.scaleRanges[reportModel.scale.scaleRanges.length - 1].max,
                                //        labels: {
                                //            position: "inside"
                                //        },
                                //        ranges: reportModel.scale.scaleRanges,
                                //    }
                                //});
                                $("#home_compare_gauge_total_weak").kendoRadialGauge({
                                    pointer: [{
                                        value: reportModel.cWeakAverageScore,
                                        color: gaugeSeriesColors.compare,
                                        //color: "#005aff",
                                    }],
                                    scale: {
                                        min: reportModel.scale.scaleRanges[0].min,
                                        minorUnit: 1,
                                        startAngle: -30,
                                        endAngle: 210,
                                        max: reportModel.scale.scaleRanges[reportModel.scale.scaleRanges.length - 1].max,
                                        labels: {
                                            position: "inside"
                                        },
                                        ranges: reportModel.scale.scaleRanges,
                                    }
                                });

                                if (reportModel.cEvaluatorsProfileScorecards) {
                                    if (reportModel.cEvaluatorsProfileScorecards.length > 0) {

                                        if (!isNaN(reportModel.cEvaluatorsProfileScorecards[0].weakAverageScore)) {
                                            var totalScoreEl = '<span style="color: #000000; display: inline - block;"> vs </span>';
                                            totalScoreEl += "<span style='color:" + gaugeSeriesColors.compareEvaluator + "; display: inline-block;'>";
                                            totalScoreEl += parseFloat(reportModel.cEvaluatorsProfileScorecards[0].weakAverageScore).toFixed(1);
                                            totalScoreEl += '</span>';
                                            $($element).find("#home_compare_gauge_total_weak_value").append(totalScoreEl);
                                            //$('#gauge_total_score_value').text(reportModel.averageScore);
                                            $("#home_compare_gauge_total_weak").empty();
                                            $("#home_compare_gauge_total_weak").kendoRadialGauge({

                                                pointer: [{
                                                    value: reportModel.cWeakAverageScore,
                                                    color: gaugeSeriesColors.compare,
                                                    cap: { size: 0.1 }
                                                }, {
                                                    value: reportModel.cEvaluatorsProfileScorecards[0].weakAverageScore,
                                                    color: gaugeSeriesColors.compareEvaluator,
                                                }],
                                                scale: {
                                                    min: reportModel.scale.scaleRanges[0].min,
                                                    minorUnit: 1,
                                                    startAngle: -30,
                                                    endAngle: 210,
                                                    max: reportModel.scale.scaleRanges[reportModel.scale.scaleRanges.length - 1].max,
                                                    ranges: reportModel.scale.scaleRanges,
                                                }
                                            });
                                        }
                                    }
                                }

                                if (reportModel.cStrongAverageScore > 0) {
                                    var totalScoreEl = '<span style="color: #000000; display: inline - block;">  </span>';
                                    totalScoreEl += "<span style='color:" + gaugeSeriesColors.compare + "; display: inline-block;'>";
                                    totalScoreEl += parseFloat(reportModel.cStrongAverageScore).toFixed(1);
                                    totalScoreEl += '</span>';
                                    $($element).find("#home_compare_gauge_total_strong_value").html(totalScoreEl);
                                    //$('#gauge_total_score_value').text(reportModel.averageScore);
                                }



                                //$("#gauge_total_strong").kendoRadialGauge({
                                //    pointer: [{
                                //        value: reportModel.strongAverageScore,
                                //        color: gaugeSeriesColors.main,
                                //        cap: { size: 0.1 }
                                //    }],
                                //    scale: {
                                //        min: reportModel.scale.scaleRanges[0].min,
                                //        minorUnit: 1,
                                //        startAngle: -30,
                                //        endAngle: 210,
                                //        max: reportModel.scale.scaleRanges[reportModel.scale.scaleRanges.length - 1].max,
                                //        labels: {
                                //            position: "inside"
                                //        },
                                //        ranges: reportModel.scale.scaleRanges,
                                //    }
                                //});

                                $("#home_compare_gauge_total_strong").kendoRadialGauge({
                                    pointer: [{
                                        value: reportModel.cStrongAverageScore,
                                        color: gaugeSeriesColors.compare,
                                        //color: "#005aff",
                                    }],
                                    scale: {
                                        min: reportModel.scale.scaleRanges[0].min,
                                        minorUnit: 1,
                                        startAngle: -30,
                                        endAngle: 210,
                                        max: reportModel.scale.scaleRanges[reportModel.scale.scaleRanges.length - 1].max,
                                        labels: {
                                            position: "inside"
                                        },
                                        ranges: reportModel.scale.scaleRanges,
                                    }
                                });

                                if (reportModel.cEvaluatorsProfileScorecards) {
                                    if (reportModel.cEvaluatorsProfileScorecards.length > 0) {

                                        if (!isNaN(reportModel.cEvaluatorsProfileScorecards[0].strongAverageScore)) {
                                            var totalScoreEl = '<span style="color: #000000; display: inline - block;"> vs </span>';
                                            totalScoreEl += "<span style='color:" + gaugeSeriesColors.compareEvaluator + "; display: inline-block;'>";
                                            totalScoreEl += parseFloat(reportModel.cEvaluatorsProfileScorecards[0].strongAverageScore).toFixed(1);
                                            totalScoreEl += '</span>';
                                            $($element).find("#home_compare_gauge_total_strong_value").append(totalScoreEl);
                                            //$('#gauge_total_score_value').text(reportModel.averageScore);
                                            $("#home_compare_gauge_total_strong").empty();
                                            $("#home_compare_gauge_total_strong").kendoRadialGauge({

                                                pointer: [{
                                                    value: reportModel.cStrongAverageScore,
                                                    color: gaugeSeriesColors.compare,
                                                    cap: { size: 0.1 }
                                                }, {
                                                    value: reportModel.cEvaluatorsProfileScorecards[0].strongAverageScore,
                                                    color: gaugeSeriesColors.compareEvaluator,
                                                }],
                                                scale: {
                                                    min: reportModel.scale.scaleRanges[0].min,
                                                    minorUnit: 1,
                                                    startAngle: -30,
                                                    endAngle: 210,
                                                    max: reportModel.scale.scaleRanges[reportModel.scale.scaleRanges.length - 1].max,
                                                    ranges: reportModel.scale.scaleRanges,
                                                }
                                            });
                                        }
                                    }
                                }

                                var imageElemHtml = getKPIImage(reportModel.averageScore, reportModel.cAverageScore)
                                $("#home_kpiImageScore").append(imageElemHtml);

                                if (reportModel.cStrongAverageScore != "NaN") {
                                    imageElemHtml = getKPIImage(reportModel.strongAverageScore, reportModel.cStrongAverageScore)
                                    $("#home_kpiImageStrong").append(imageElemHtml);
                                }

                                if (reportModel.cWeakAverageScore != "NaN") {
                                    imageElemHtml = getKPIImage(reportModel.weakAverageScore, reportModel.cWeakAverageScore)
                                    $("#home_kpiImageWeak").append(imageElemHtml);
                                }
                            }
                        };

                        ////$scope.load = function () {
                        ////    if (!reportModel) return;
                        ////    var mainGraph = $($element).find(".MainGraph").empty();

                        ////    if ($scope.pgModesModel && $scope.pgModesModel.length > 0 && reportModel.performanceGroups.length === $scope.pgModesModel.length) {

                        ////    } else {
                        ////        $scope.pgModesModel = [];
                        ////        angular.forEach(reportModel.performanceGroups, function (pg, index) {
                        ////            $scope.pgModesModel.push({ id: index, value: 1 });
                        ////        });
                        ////    }

                        ////    var largest = 0;
                        ////    var largestIndex = -1;
                        ////    if (reportModel && reportModel.performanceGroups) {
                        ////        for (var i = 0; i < reportModel.performanceGroups.length; i++) {
                        ////            if (reportModel.performanceGroups[i].skills.length > largest) {
                        ////                largest = reportModel.performanceGroups[i].skills.length;
                        ////                largestIndex = i;
                        ////            }
                        ////        }
                        ////    }
                        ////    if (reportModel.performanceGroups) {
                        ////        var colorSeries = getColorSeries(reportModel);
                        ////        drawPerfomanceGraph(mainGraph, largestIndex, reportModel.performanceGroups[largestIndex], colorSeries, null, null, null, 500);

                        ////        var graphsContainer = $($element).find(".GraphList");
                        ////        graphsContainer.empty();

                        ////        $.each(reportModel.performanceGroups, function (index, value) {
                        ////            if (index != largestIndex) {
                        ////                var startDecorHtml = "<div class='col-md-3'>";
                        ////                var endDecorHtml = "</div>";
                        ////                drawPerfomanceGraph(graphsContainer, index, value, colorSeries, startDecorHtml, endDecorHtml, null, 300);
                        ////            }
                        ////        });
                        ////    }

                        ////    // strong 3 questions
                        ////    if (reportModel.isShowStrongKpi) {
                        ////        $(".strongBox").empty();
                        ////        $.each(reportModel.strongAreas, function (index, value) {
                        ////            var prc = percentage(reportModel.max, value.score);

                        ////            var strongElemHtml = "<div class='GraphScoreBox'>";
                        ////            strongElemHtml += "<h3 class='width80Perc'>" + value.name + "</h3>";
                        ////            strongElemHtml += "<h4 class='width80Perc'>" + value.description + "</h4>";
                        ////            var mainLegendPostfix = " (" + (!$scope.mainStageName || $scope.mainStageName == '' ? '' : $scope.mainStageName + ', ') + reportModel.profileTypeName + ")";
                        ////            strongElemHtml += "<h4 class='width80Perc'>" + reportModel.label + mainLegendPostfix + "</h4>";
                        ////            strongElemHtml += "<div class='GraphLiProc width80Perc FloatLeft'>";

                        ////            strongElemHtml += "<div id='PGS" + index.toString() + "' class='GraphLiProc FloatLeft'></div>";
                        ////            strongElemHtml += "</div>";
                        ////            strongElemHtml += "<div class='GraphLiProc width20Perc FloatLeft'>";
                        ////            strongElemHtml += "<span class='mArLeft015'>" + value.score.toString() + "</span>";
                        ////            strongElemHtml += "</div>";

                        ////            strongElemHtml += "</div>";

                        ////            $(".strongBox").append(strongElemHtml);

                        ////            var progressBar;
                        ////            progressBar = new ProgressBar("PGS" + index.toString(), { 'width': '100%', 'height': '30px' });
                        ////            progressBarItem = {};
                        ////            progressBarItem[ProgressBar.OPTION_NAME.ITEM_ID] = "item1";


                        ////            progressBarItem[ProgressBar.OPTION_NAME.COLOR_ID] = ProgressBar.OPTION_VALUE.COLOR_ID.CUSTOM;
                        ////            progressBarItem.color = getColor(value.score, reportModel.scale.scaleRanges);
                        ////            progressBar.createItem(progressBarItem);
                        ////            progressBar.setPercent(prc);

                        ////        });

                        ////        if ((reportModel.isCompare) && (reportModel.cStrongAreas)) {
                        ////            var isStrongKPIgenerated = false;
                        ////            if (reportModel.cParticipantIds && reportModel.participantsId) {
                        ////                if (reportModel.cParticipantIds.length == 1 && reportModel.participantsId.length == 1) {
                        ////                    if (reportModel.cParticipantIds[0].id == reportModel.participantsId[0].id && reportModel.mainProfileStepId == 4 && reportModel.profileStepId == 4) {
                        ////                        var index = 0;
                        ////                        reportModel.benchMarkStrongKpi = [];
                        ////                        _.forEach($(".strongBox .GraphScoreBox h3"), function (strongItem) {
                        ////                            var strongKPI = $(strongItem).text();

                        ////                            var obj = _.find(reportModel.strongAreas, function (pgSkill) {
                        ////                                return pgSkill.name == strongKPI;
                        ////                            });
                        ////                            if (obj) {




                        ////                                console.log("benchmark Graph =" + obj.cScore + " reportModel.score = " + obj.score);
                        ////                                var comparestrongElemHtml = "";
                        ////                                //comparestrongElemHtml += "<h3 class='width80Perc'>" + obj.name + "</h3>";
                        ////                                var compareLegendPostfix = " (" + (!$scope.stageName || $scope.stageName == '' ? '' : $scope.stageName + ', ') + reportModel.cProfileTypeName + ")";
                        ////                                comparestrongElemHtml += "<h4 class=''>" + reportModel.cLabel + compareLegendPostfix + "</h4>";
                        ////                                comparestrongElemHtml += "<div class='compareGraphLiProc GraphLiProc width80Perc FloatLeft'>";

                        ////                                comparestrongElemHtml += "<div id='PGSC" + index.toString() + "' class='benchmarkGraphLiProc GraphLiProc FloatLeft'></div>";
                        ////                                comparestrongElemHtml += "</div>";
                        ////                                comparestrongElemHtml += "<div class='compareGraphLiProc GraphLiProc width20Perc FloatLeft' style='margin-top:0px;' >";
                        ////                                comparestrongElemHtml += "<span class='mArLeft015'>" + obj.cScore.toString() + "</span>";
                        ////                                //comparestrongElemHtml += "<div style='clear:both;'>";
                        ////                                //comparestrongElemHtml += getKPIImage(value.score, value.score);
                        ////                                comparestrongElemHtml += "</div>";
                        ////                                comparestrongElemHtml += "";
                        ////                                //$(".weakBox").append(comparestrongElemHtml);
                        ////                                $(".strongBox #PGS" + index).parents(".GraphScoreBox").append(comparestrongElemHtml);

                        ////                                var diffPercentage = setDiffrencePercentage(obj.score, obj.cScore, reportModel.max);
                        ////                                var graphElemHtml = "";
                        ////                                if (obj.score > 0) {
                        ////                                    if (obj.cScore > obj.score) {
                        ////                                        graphElemHtml += "<img  class='mArLeft015' src='images/dashboard/top-arrow-green.png' style='width:auto;height:20px;float:left;margin-left: 5px;'>";
                        ////                                    } else if (obj.score == obj.cScore) {
                        ////                                        graphElemHtml += "<img class='mArLeft015' src='images/dashboard/min-icon-big.png' style='width:auto;height:20px;float:left;margin-left: 5px;'>";
                        ////                                    } else {
                        ////                                        graphElemHtml += "<img  class='mArLeft015' src='images/dashboard/botm-arrow-red.png' style='width:auto;height:20px;float:left;margin-left: 5px;'>";
                        ////                                    }
                        ////                                }
                        ////                                graphElemHtml += diffPercentage;
                        ////                                $(".strongBox #PGSC" + index).parents(".GraphScoreBox").find(".compareGraphLiProc.width20Perc").append(graphElemHtml);
                        ////                                if ((obj.cScore > 0)) {
                        ////                                    reportModel.benchMarkStrongKpi.push(obj.cScore);
                        ////                                    prcc = percentage(reportModel.max, obj.cScore);

                        ////                                    var progressBar;
                        ////                                    progressBar = new ProgressBar("PGSC" + index.toString(), { 'width': '100%', 'height': '30px' });
                        ////                                    progressBarItem = {};
                        ////                                    progressBarItem[ProgressBar.OPTION_NAME.ITEM_ID] = "item1";
                        ////                                    progressBarItem[ProgressBar.OPTION_NAME.COLOR_ID] = ProgressBar.OPTION_VALUE.COLOR_ID.CUSTOM;
                        ////                                    progressBarItem.color = getColor(obj.cScore, reportModel.scale.scaleRanges);
                        ////                                    progressBar.createItem(progressBarItem);
                        ////                                    progressBar.setPercent(prcc);
                        ////                                }
                        ////                                index++;
                        ////                                isStrongKPIgenerated = true
                        ////                            }

                        ////                        });
                        ////                    }
                        ////                }
                        ////            }

                        ////            if (!isStrongKPIgenerated) {
                        ////                $(".comparestrongBox").empty();
                        ////                var prcc = 0;

                        ////                $.each(reportModel.cStrongAreas, function (index, value) {
                        ////                    prcc = percentage(reportModel.max, value.score);

                        ////                    var comaprestrongElemHtml = "<div class='GraphScoreBox'>";
                        ////                    comaprestrongElemHtml += "<h3 class='width80Perc'>" + value.name + "</h3>";
                        ////                    comaprestrongElemHtml += "<h4 class='width80Perc'>" + value.description + "</h4>";
                        ////                    var compareLegendPostfix = " (" + (!$scope.stageName || $scope.stageName == '' ? '' : $scope.stageName + ', ') + reportModel.cProfileTypeName + ")";
                        ////                    comaprestrongElemHtml += "<div class=''>" + reportModel.cLabel + compareLegendPostfix + "</div>";
                        ////                    comaprestrongElemHtml += "<div class='GraphLiProc width80Perc FloatLeft'>";

                        ////                    comaprestrongElemHtml += "<div id='PGSC" + index.toString() + "' class='GraphLiProc FloatLeft'></div>";
                        ////                    comaprestrongElemHtml += "</div>";
                        ////                    comaprestrongElemHtml += "<div class='GraphLiProc width20Perc FloatLeft' style='margin-top:0px;' >";
                        ////                    comaprestrongElemHtml += "<span class='mArLeft015'>" + value.score.toString() + "</span>";
                        ////                    comaprestrongElemHtml += "<div style='clear:both;'>";
                        ////                    //comaprestrongElemHtml += getKPIImage(value.score, value.score);
                        ////                    comaprestrongElemHtml += "</div>";
                        ////                    comaprestrongElemHtml += "</div>";

                        ////                    $(".comparestrongBox").append(comaprestrongElemHtml);


                        ////                    var progressBar;
                        ////                    progressBar = new ProgressBar("PGSC" + index.toString(), { 'width': '100%', 'height': '30px' });
                        ////                    progressBarItem = {};
                        ////                    progressBarItem[ProgressBar.OPTION_NAME.ITEM_ID] = "item1";
                        ////                    progressBarItem[ProgressBar.OPTION_NAME.COLOR_ID] = ProgressBar.OPTION_VALUE.COLOR_ID.CUSTOM;
                        ////                    progressBarItem.color = getColor(value.score, reportModel.scale.scaleRanges);

                        ////                    progressBar.createItem(progressBarItem);
                        ////                    progressBar.setPercent(prcc);
                        ////                });
                        ////            }
                        ////        }
                        ////    }
                        ////    if (reportModel.cParticipantIds) {
                        ////        if (reportModel.cParticipantIds.length == 1) {

                        ////            if (reportModel.cParticipantIds[0].id == -1) {
                        ////                reportModel.benchMarkStrongKpi = [];
                        ////                var index = 0;
                        ////                _.forEach($(".strongBox .GraphScoreBox h3"), function (strongItem) {
                        ////                    var strongKPI = $(strongItem).text();
                        ////                    _.forEach(reportModel.performanceGroups, function (performanceGroupItem) {
                        ////                        var obj = _.find(performanceGroupItem.skills, function (pgSkill) {
                        ////                            return pgSkill.name == strongKPI;
                        ////                        });
                        ////                        if (obj) {
                        ////                            var diffPercentage = setDiffrencePercentage(obj.cScore, obj.score, reportModel.max);
                        ////                            var graphElemHtml = "";
                        ////                            if (obj.score > 0) {
                        ////                                if (obj.score > obj.cScore) {
                        ////                                    graphElemHtml += "<img  class='mArLeft015' src='images/dashboard/top-arrow-green.png' style='width:auto;height:20px;float:left;margin-left: 5px;'>";
                        ////                                } else if (obj.score == obj.cScore) {
                        ////                                    graphElemHtml += "<img class='mArLeft015' src='images/dashboard/min-icon-big.png' style='width:auto;height:20px;float:left;margin-left: 5px;'>";
                        ////                                } else {
                        ////                                    graphElemHtml += "<img  class='mArLeft015' src='images/dashboard/botm-arrow-red.png' style='width:auto;height:20px;float:left;margin-left: 5px;'>";
                        ////                                }
                        ////                            }
                        ////                            graphElemHtml += diffPercentage;
                        ////                            $(".strongBox #PGS" + index).parents(".GraphScoreBox").find(".GraphLiProc.width20Perc").append(graphElemHtml);

                        ////                            console.log("benchmark Graph =" + obj.cScore + " reportModel.score = " + obj.score);
                        ////                            var comparestrongElemHtml = "";

                        ////                            var compareLegendPostfix = " (" + (!$scope.stageName || $scope.stageName == '' ? '' : $scope.stageName + ', ') + reportModel.cProfileTypeName + ")";
                        ////                            comparestrongElemHtml += "<h4 class=''>" + reportModel.cLabel + compareLegendPostfix + "</h4>";
                        ////                            comparestrongElemHtml += "<div class='benchmarkGraphLiProc GraphLiProc width80Perc FloatLeft'>";

                        ////                            comparestrongElemHtml += "<div id='PGSC" + index.toString() + "' class='benchmarkGraphLiProc GraphLiProc FloatLeft'></div>";
                        ////                            comparestrongElemHtml += "</div>";
                        ////                            comparestrongElemHtml += "<div class='benchmarkGraphLiProc GraphLiProc width20Perc FloatLeft' style='margin-top:0px;' >";
                        ////                            comparestrongElemHtml += "<span class='mArLeft015'>" + obj.cScore.toString() + "</span>";
                        ////                            comparestrongElemHtml += "<div style='clear:both;'>";
                        ////                            //comparestrongElemHtml += getKPIImage(value.score, value.score);
                        ////                            comparestrongElemHtml += "</div>";
                        ////                            comparestrongElemHtml += "";



                        ////                            $(".strongBox #PGS" + index).parents(".GraphScoreBox").append(comparestrongElemHtml);
                        ////                            if ((obj.cScore > 0)) {
                        ////                                reportModel.benchMarkStrongKpi.push(obj.cScore);
                        ////                                prcc = percentage(reportModel.max, obj.cScore);

                        ////                                var progressBar;
                        ////                                progressBar = new ProgressBar("PGSC" + index.toString(), { 'width': '100%', 'height': '30px' });
                        ////                                progressBarItem = {};
                        ////                                progressBarItem[ProgressBar.OPTION_NAME.ITEM_ID] = "item1";
                        ////                                progressBarItem[ProgressBar.OPTION_NAME.COLOR_ID] = ProgressBar.OPTION_VALUE.COLOR_ID.CUSTOM;
                        ////                                progressBarItem.color = getColor(obj.cScore, reportModel.scale.scaleRanges);
                        ////                                progressBar.createItem(progressBarItem);
                        ////                                progressBar.setPercent(prcc);
                        ////                            }
                        ////                            index++;
                        ////                        }
                        ////                    })
                        ////                });
                        ////            }
                        ////        }
                        ////    }


                        ////    if (reportModel.isShowWeakKpi) {
                        ////        var isweakKPIgenerated = false;
                        ////        $(".weakBox").empty();



                        ////        $.each(reportModel.weakAreas, function (index, value) {
                        ////            var prc = percentage(reportModel.max, value.score);


                        ////            var strongElemHtml = "<div class='GraphScoreBox'>";
                        ////            strongElemHtml += "<h3 class='width80Perc'>" + value.name + "</h3>";
                        ////            strongElemHtml += "<h4 class='width80Perc'>" + value.description + "</h4>";
                        ////            var mainLegendPostfix = " (" + (!$scope.mainStageName || $scope.mainStageName == '' ? '' : $scope.mainStageName + ', ') + reportModel.profileTypeName + ")";
                        ////            strongElemHtml += "<h4 class=''>" + reportModel.label + mainLegendPostfix + "</h4>";
                        ////            strongElemHtml += "<div class='GraphLiProc width80Perc FloatLeft'>";

                        ////            strongElemHtml += "<div id='PGF" + index.toString() + "' class='GraphLiProc FloatLeft'></div>";
                        ////            strongElemHtml += "</div>";
                        ////            strongElemHtml += "<div class='GraphLiProc width20Perc FloatLeft'>";
                        ////            strongElemHtml += "<span class='mArLeft015'>" + value.score.toString() + "</span>";
                        ////            //strongElemHtml += "<div style='clear:both;'>";
                        ////            strongElemHtml += "</div>";

                        ////            strongElemHtml += "</div>";


                        ////            $(".weakBox").append(strongElemHtml);
                        ////            var progressBar;
                        ////            progressBar = new ProgressBar("PGF" + index.toString(), { 'width': '100%', 'height': '30px' });
                        ////            progressBarItem = {};
                        ////            progressBarItem[ProgressBar.OPTION_NAME.ITEM_ID] = "item1";
                        ////            progressBarItem[ProgressBar.OPTION_NAME.COLOR_ID] = ProgressBar.OPTION_VALUE.COLOR_ID.CUSTOM;
                        ////            progressBarItem.color = getColor(value.score, reportModel.scale.scaleRanges);
                        ////            progressBar.createItem(progressBarItem);
                        ////            progressBar.setPercent(prc);

                        ////        });


                        ////        if ((reportModel.isCompare) && (reportModel.cWeakAreas)) {
                        ////            if (reportModel.cParticipantIds && reportModel.participantsId) {
                        ////                if (reportModel.cParticipantIds.length == 1 && reportModel.participantsId.length == 1) {
                        ////                    if (reportModel.cParticipantIds[0].id == reportModel.participantsId[0].id && reportModel.mainProfileStepId == 4 && reportModel.profileStepId == 4) {
                        ////                        var indexPGFC = 0;
                        ////                        reportModel.benchMarkWeakKpi = [];
                        ////                        _.forEach($(".weakBox .GraphScoreBox h3"), function (weakItem) {
                        ////                            var weakKPI = $(weakItem).text();
                        ////                            var obj = _.find(reportModel.weakAreas, function (pgSkill) {
                        ////                                return pgSkill.name == weakKPI;
                        ////                            });
                        ////                            if (obj) {



                        ////                                console.log("benchmark Graph =" + obj.cScore + " reportModel.score = " + obj.score);
                        ////                                var compareWeakElemHtml = "";
                        ////                                //comparestrongElemHtml += "<h3 class='width80Perc'>" + obj.name + "</h3>";
                        ////                                var compareLegendPostfix = " (" + (!$scope.stageName || $scope.stageName == '' ? '' : $scope.stageName + ', ') + reportModel.cProfileTypeName + ")";

                        ////                                compareWeakElemHtml += "<h4 class='width80Perc'>" + reportModel.cLabel + compareLegendPostfix + "</h4>";
                        ////                                compareWeakElemHtml += "<div class='compareGraphLiProc GraphLiProc width80Perc FloatLeft'>";
                        ////                                compareWeakElemHtml += "<div id='PGFC" + indexPGFC.toString() + "' class='benchmarkGraphLiProc GraphLiProc FloatLeft'></div>";
                        ////                                compareWeakElemHtml += "</div>";
                        ////                                compareWeakElemHtml += "<div class='compareGraphLiProc GraphLiProc width20Perc FloatLeft' style='margin-top:0px;' >";
                        ////                                compareWeakElemHtml += "<span class='mArLeft015'>" + obj.cScore.toString() + "</span>";
                        ////                                //comparestrongElemHtml += "<div style='clear:both;'>";
                        ////                                //comparestrongElemHtml += getKPIImage(value.score, value.score);
                        ////                                compareWeakElemHtml += "</div>";
                        ////                                compareWeakElemHtml += "";
                        ////                                //$(".weakBox").append(comparestrongElemHtml);
                        ////                                $(".weakBox #PGF" + indexPGFC).parents(".GraphScoreBox").append(compareWeakElemHtml);

                        ////                                var diffPercentage = setDiffrencePercentage(obj.score, obj.cScore, reportModel.max);
                        ////                                var graphElemHtml = "";
                        ////                                if (obj.cScore > obj.score) {
                        ////                                    graphElemHtml += "<img  class='mArLeft015' src='images/dashboard/top-arrow-green.png' style='width:auto;height:20px;float:left;margin-left: 5px;'>";
                        ////                                } else if (obj.score == obj.cScore) {
                        ////                                    graphElemHtml += "<img class='mArLeft015' src='images/dashboard/min-icon-big.png' style='width:auto;height:20px;float:left;margin-left: 5px;'>";
                        ////                                } else {
                        ////                                    graphElemHtml += "<img  class='mArLeft015' src='images/dashboard/botm-arrow-red.png' style='width:auto;height:20px;float:left;margin-left: 5px;'>";
                        ////                                }
                        ////                                graphElemHtml += diffPercentage;
                        ////                                $(".weakBox #PGFC" + indexPGFC).parents(".GraphScoreBox").find(".compareGraphLiProc.width20Perc").append(graphElemHtml);
                        ////                                if ((obj.cScore > 0)) {
                        ////                                    reportModel.benchMarkWeakKpi.push(obj.cScore);
                        ////                                    prcc = percentage(reportModel.max, obj.cScore);

                        ////                                    if ($("#PGFC" + indexPGFC).length > 0) {
                        ////                                        var progressBar;
                        ////                                        progressBar = new ProgressBar("PGFC" + indexPGFC.toString(), { 'width': '100%', 'height': '30px' });
                        ////                                        progressBarItem = {};
                        ////                                        progressBarItem[ProgressBar.OPTION_NAME.ITEM_ID] = "item1";
                        ////                                        progressBarItem[ProgressBar.OPTION_NAME.COLOR_ID] = ProgressBar.OPTION_VALUE.COLOR_ID.CUSTOM;
                        ////                                        progressBarItem.color = getColor(obj.cScore, reportModel.scale.scaleRanges);
                        ////                                        progressBar.createItem(progressBarItem);
                        ////                                        progressBar.setPercent(prcc);
                        ////                                    }
                        ////                                }
                        ////                                indexPGFC++;
                        ////                                isweakKPIgenerated = true
                        ////                            }

                        ////                        });
                        ////                    }
                        ////                }
                        ////            }


                        ////            if (!isweakKPIgenerated) {
                        ////                $(".compareweakBox").empty();
                        ////                var prcc = 0;
                        ////                $.each(reportModel.cWeakAreas, function (index, value) {
                        ////                    var comparestrongElemHtml = "<div class='GraphScoreBox'>";
                        ////                    comparestrongElemHtml += "<h3 class='width80Perc'>" + value.name + "</h3>";
                        ////                    comparestrongElemHtml += "<h4 class='width80Perc'>" + value.description + "</h4>";
                        ////                    var compareLegendPostfix = " (" + (!$scope.stageName || $scope.stageName == '' ? '' : $scope.stageName + ', ') + reportModel.cProfileTypeName + ")";
                        ////                    comparestrongElemHtml += "<h4 class='width80Perc'>" + reportModel.cLabel + compareLegendPostfix + "</h4>";
                        ////                    comparestrongElemHtml += "<div class='GraphLiProc width80Perc FloatLeft'>";
                        ////                    comparestrongElemHtml += "<div id='PGFC" + index.toString() + "' class='GraphLiProc FloatLeft'></div>";
                        ////                    comparestrongElemHtml += "</div>";
                        ////                    comparestrongElemHtml += "<div class='GraphLiProc width20Perc FloatLeft' style='margin-top:0px;' >";
                        ////                    comparestrongElemHtml += "<span class='mArLeft015'>" + value.score.toString() + "</span>";
                        ////                    comparestrongElemHtml += "<div style='clear:both;'>";
                        ////                    //comparestrongElemHtml += getKPIImage(value.score, value.score);
                        ////                    comparestrongElemHtml += "</div>";
                        ////                    comparestrongElemHtml += "</div>";
                        ////                    $(".compareweakBox").append(comparestrongElemHtml);

                        ////                    if ((reportModel.isCompare) && (value.score > 0)) {
                        ////                        prcc = percentage(reportModel.max, value.score);
                        ////                        if ($("#PGFC" + index).length > 0) {
                        ////                            var progressBar;
                        ////                            progressBar = new ProgressBar("PGFC" + index.toString(), { 'width': '100%', 'height': '30px' });
                        ////                            progressBarItem = {};
                        ////                            progressBarItem[ProgressBar.OPTION_NAME.ITEM_ID] = "item1";
                        ////                            progressBarItem[ProgressBar.OPTION_NAME.COLOR_ID] = ProgressBar.OPTION_VALUE.COLOR_ID.CUSTOM;
                        ////                            progressBarItem.color = getColor(value.score, reportModel.scale.scaleRanges);
                        ////                            progressBar.createItem(progressBarItem);
                        ////                            progressBar.setPercent(prcc);
                        ////                        }
                        ////                    }
                        ////                });
                        ////            }
                        ////        }
                        ////    }
                        ////    if (reportModel.cParticipantIds) {
                        ////        if (reportModel.cParticipantIds.length == 1) {
                        ////            if (reportModel.cParticipantIds[0].id == -1) {
                        ////                var index = 0;
                        ////                reportModel.benchMarkWeakKpi = [];
                        ////                _.forEach($(".weakBox .GraphScoreBox h3"), function (weakItem) {
                        ////                    var weakKPI = $(weakItem).text();
                        ////                    _.forEach(reportModel.performanceGroups, function (performanceGroupItem) {
                        ////                        var obj = _.find(performanceGroupItem.skills, function (pgSkill) {
                        ////                            return pgSkill.name == weakKPI;
                        ////                        });
                        ////                        if (obj) {
                        ////                            var diffPercentage = setDiffrencePercentage(obj.cScore, obj.score, reportModel.max);
                        ////                            var graphElemHtml = "";
                        ////                            if (obj.score > obj.cScore) {
                        ////                                graphElemHtml += "<img  class='mArLeft015' src='images/dashboard/top-arrow-green.png' style='width:auto;height:20px;float:left;margin-left: 5px;'>";
                        ////                            } else if (obj.score == obj.cScore) {
                        ////                                graphElemHtml += "<img class='mArLeft015' src='images/dashboard/min-icon-big.png' style='width:auto;height:20px;float:left;margin-left: 5px;'>";
                        ////                            } else {
                        ////                                graphElemHtml += "<img  class='mArLeft015' src='images/dashboard/botm-arrow-red.png' style='width:auto;height:20px;float:left;margin-left: 5px;'>";
                        ////                            }
                        ////                            graphElemHtml += diffPercentage;
                        ////                            $(".weakBox #PGF" + index).parents(".GraphScoreBox").find(".GraphLiProc.width20Perc").append(graphElemHtml);


                        ////                            console.log("benchmark Graph =" + obj.cScore + " reportModel.score = " + obj.score);
                        ////                            var comparestrongElemHtml = "";
                        ////                            //comparestrongElemHtml += "<h3 class='width80Perc'>" + obj.name + "</h3>";
                        ////                            var compareLegendPostfix = " (" + (!$scope.stageName || $scope.stageName == '' ? '' : $scope.stageName + ', ') + reportModel.cProfileTypeName + ")";
                        ////                            comparestrongElemHtml += "<h4 class='width80Perc'>" + reportModel.cLabel + compareLegendPostfix + "</h4>";
                        ////                            comparestrongElemHtml += "<div class='benchmarkGraphLiProc GraphLiProc width80Perc FloatLeft'>";
                        ////                            comparestrongElemHtml += "<div id='PGFC" + index.toString() + "' class='benchmarkGraphLiProc GraphLiProc FloatLeft'></div>";
                        ////                            comparestrongElemHtml += "</div>";
                        ////                            comparestrongElemHtml += "<div class='benchmarkGraphLiProc GraphLiProc width20Perc FloatLeft' style='margin-top:0px;' >";
                        ////                            comparestrongElemHtml += "<span class='mArLeft015'>" + obj.cScore.toString() + "</span>";
                        ////                            comparestrongElemHtml += "<div style='clear:both;'>";
                        ////                            //comparestrongElemHtml += getKPIImage(value.score, value.score);
                        ////                            comparestrongElemHtml += "</div>";
                        ////                            comparestrongElemHtml += "";
                        ////                            //$(".weakBox").append(comparestrongElemHtml);
                        ////                            $(".weakBox #PGF" + index).parents(".GraphScoreBox").append(comparestrongElemHtml);
                        ////                            if ((obj.cScore > 0)) {
                        ////                                reportModel.benchMarkWeakKpi.push(obj.cScore);
                        ////                                prcc = percentage(reportModel.max, obj.cScore);
                        ////                                if ($("#PGFC" + index).length > 0) {
                        ////                                    var progressBar;
                        ////                                    progressBar = new ProgressBar("PGFC" + index.toString(), { 'width': '100%', 'height': '30px' });
                        ////                                    progressBarItem = {};
                        ////                                    progressBarItem[ProgressBar.OPTION_NAME.ITEM_ID] = "item1";
                        ////                                    progressBarItem[ProgressBar.OPTION_NAME.COLOR_ID] = ProgressBar.OPTION_VALUE.COLOR_ID.CUSTOM;
                        ////                                    progressBarItem.color = getColor(obj.cScore, reportModel.scale.scaleRanges);
                        ////                                    progressBar.createItem(progressBarItem);
                        ////                                    progressBar.setPercent(prcc);
                        ////                                }
                        ////                            }
                        ////                            index++;
                        ////                        }
                        ////                    })
                        ////                });
                        ////            }
                        ////        }
                        ////    }

                        ////    $("<div id='tooltip'></div>").css({
                        ////        position: "absolute",
                        ////        display: "none",
                        ////        border: "1px solid #fdd",
                        ////        padding: "2px",
                        ////        "background-color": "#fee",
                        ////        opacity: 0.80
                        ////    }).appendTo("body");

                        ////    $('#home_gauge_total_score_value').html("<span style='color:" + gaugeSeriesColors.main + "; display: inline-block;'>" + reportModel.averageScore + "</span>");



                        ////    if (reportModel.evaluatorsProfileScorecards) {
                        ////        if (reportModel.evaluatorsProfileScorecards.length > 0) {
                        ////            if (!isNaN(reportModel.evaluatorsProfileScorecards[0].averageScore)) {
                        ////                var totalScoreEl = '<span style="color: #000000; display: inline - block;"> vs </span>';
                        ////                totalScoreEl += "<span style='color:" + gaugeSeriesColors.mainEvaluator + "; display: inline-block;'>";
                        ////                totalScoreEl += parseFloat(reportModel.evaluatorsProfileScorecards[0].averageScore).toFixed(1);
                        ////                totalScoreEl += '</span>';
                        ////                $($element).find("#home_gauge_total_score_value").append(totalScoreEl);
                        ////                //$('#home_gauge_total_score_value').text(reportModel.averageScore);
                        ////                if ($scope.ngReportData.isShowBenchmark) {

                        ////                    var totalScoreEl = '<span style="color: #000000; display: inline - block;"> vs </span>';
                        ////                    totalScoreEl += "<span style='color:" + gaugeSeriesColors.benchmark + "; display: inline-block;'>";
                        ////                    totalScoreEl += $scope.ngReportData.performanceGroups[0].benchmark
                        ////                    totalScoreEl += '</span>';
                        ////                    $($element).find("#home_gauge_total_score_value").append(totalScoreEl);

                        ////                    $("#home_gauge_total_score").kendoRadialGauge({
                        ////                        pointer: [{
                        ////                            value: reportModel.averageScore,
                        ////                            color: gaugeSeriesColors.main,
                        ////                            cap: { size: 0.1 }
                        ////                        }, {

                        ////                            value: $scope.ngReportData.performanceGroups[0].benchmark,
                        ////                            color: gaugeSeriesColors.benchmark,

                        ////                        }, {
                        ////                            value: reportModel.evaluatorsProfileScorecards[0].averageScore,
                        ////                            color: gaugeSeriesColors.mainEvaluator,
                        ////                        }],
                        ////                        scale: {
                        ////                            min: reportModel.scale.scaleRanges[0].min,
                        ////                            minorUnit: 1,
                        ////                            startAngle: -30,
                        ////                            endAngle: 210,
                        ////                            max: reportModel.scale.scaleRanges[reportModel.scale.scaleRanges.length - 1].max,
                        ////                            ranges: reportModel.scale.scaleRanges,
                        ////                        }
                        ////                    });
                        ////                }
                        ////                else {
                        ////                    $("#home_gauge_total_score").kendoRadialGauge({

                        ////                        pointer: [{
                        ////                            value: reportModel.averageScore,
                        ////                            color: gaugeSeriesColors.main,
                        ////                            cap: { size: 0.1 }
                        ////                        }, {
                        ////                            value: reportModel.evaluatorsProfileScorecards[0].averageScore,
                        ////                            color: gaugeSeriesColors.mainEvaluator,
                        ////                        }],
                        ////                        scale: {
                        ////                            min: reportModel.scale.scaleRanges[0].min,
                        ////                            minorUnit: 1,
                        ////                            startAngle: -30,
                        ////                            endAngle: 210,
                        ////                            max: reportModel.scale.scaleRanges[reportModel.scale.scaleRanges.length - 1].max,
                        ////                            ranges: reportModel.scale.scaleRanges,
                        ////                        }
                        ////                    });
                        ////                }
                        ////            }
                        ////            else {
                        ////                if ($scope.ngReportData.isShowBenchmark) {

                        ////                    var totalScoreEl = '<span style="color: #000000; display: inline - block;"> vs </span>';
                        ////                    totalScoreEl += "<span style='color:" + gaugeSeriesColors.benchmark + "; display: inline-block;'>";
                        ////                    totalScoreEl += $scope.ngReportData.performanceGroups[0].benchmark
                        ////                    totalScoreEl += '</span>';
                        ////                    $($element).find("#home_gauge_total_score_value").append(totalScoreEl);

                        ////                    $("#home_gauge_total_score").kendoRadialGauge({
                        ////                        pointer: [{
                        ////                            value: reportModel.averageScore,
                        ////                            color: gaugeSeriesColors.main,
                        ////                            cap: { size: 0.1 }
                        ////                        }, {
                        ////                            value: $scope.ngReportData.performanceGroups[0].benchmark,
                        ////                            color: gaugeSeriesColors.benchmark,
                        ////                        }],
                        ////                        scale: {
                        ////                            min: reportModel.scale.scaleRanges[0].min,
                        ////                            minorUnit: 1,
                        ////                            startAngle: -30,
                        ////                            endAngle: 210,
                        ////                            max: reportModel.scale.scaleRanges[reportModel.scale.scaleRanges.length - 1].max,
                        ////                            ranges: reportModel.scale.scaleRanges,
                        ////                        }
                        ////                    });
                        ////                }
                        ////                else {
                        ////                    $("#home_gauge_total_score").kendoRadialGauge({
                        ////                        pointer: {
                        ////                            value: reportModel.averageScore,
                        ////                            color: gaugeSeriesColors.main,
                        ////                        },
                        ////                        scale: {
                        ////                            min: reportModel.scale.scaleRanges[0].min,
                        ////                            minorUnit: 1,
                        ////                            startAngle: -30,
                        ////                            endAngle: 210,
                        ////                            max: reportModel.scale.scaleRanges[reportModel.scale.scaleRanges.length - 1].max,
                        ////                            ranges: reportModel.scale.scaleRanges,
                        ////                        }
                        ////                    });
                        ////                }
                        ////            }
                        ////        }
                        ////        else {


                        ////            if ($scope.ngReportData.isShowBenchmark) {

                        ////                var totalScoreEl = '<span style="color: #000000; display: inline - block;"> vs </span>';
                        ////                totalScoreEl += "<span style='color:" + gaugeSeriesColors.benchmark + "; display: inline-block;'>";
                        ////                totalScoreEl += $scope.ngReportData.performanceGroups[0].benchmark
                        ////                totalScoreEl += '</span>';
                        ////                $($element).find("#home_gauge_total_score_value").append(totalScoreEl);

                        ////                $("#home_gauge_total_score").kendoRadialGauge({
                        ////                    pointer: [{
                        ////                        value: reportModel.averageScore,
                        ////                        color: gaugeSeriesColors.main,
                        ////                        cap: { size: 0.1 }
                        ////                    }, {
                        ////                        value: $scope.ngReportData.performanceGroups[0].benchmark,
                        ////                        color: gaugeSeriesColors.benchmark,
                        ////                    }],
                        ////                    scale: {
                        ////                        min: reportModel.scale.scaleRanges[0].min,
                        ////                        minorUnit: 1,
                        ////                        startAngle: -30,
                        ////                        endAngle: 210,
                        ////                        max: reportModel.scale.scaleRanges[reportModel.scale.scaleRanges.length - 1].max,
                        ////                        ranges: reportModel.scale.scaleRanges,
                        ////                    }
                        ////                });
                        ////            }
                        ////            else {
                        ////                $("#home_gauge_total_score").kendoRadialGauge({
                        ////                    pointer: {
                        ////                        value: reportModel.averageScore,
                        ////                        color: gaugeSeriesColors.main,
                        ////                    },
                        ////                    scale: {
                        ////                        min: reportModel.scale.scaleRanges[0].min,
                        ////                        minorUnit: 1,
                        ////                        startAngle: -30,
                        ////                        endAngle: 210,
                        ////                        max: reportModel.scale.scaleRanges[reportModel.scale.scaleRanges.length - 1].max,
                        ////                        ranges: reportModel.scale.scaleRanges,
                        ////                    }
                        ////                });
                        ////            }
                        ////        }
                        ////    }
                        ////    else {
                        ////        if ($scope.ngReportData.isShowBenchmark) {

                        ////            var totalScoreEl = '<span style="color: #000000; display: inline - block;"> vs </span>';
                        ////            totalScoreEl += "<span style='color:" + gaugeSeriesColors.benchmark + "; display: inline-block;'>";
                        ////            totalScoreEl += $scope.ngReportData.performanceGroups[0].benchmark
                        ////            totalScoreEl += '</span>';
                        ////            $($element).find("#home_gauge_total_score_value").append(totalScoreEl);

                        ////            $("#home_gauge_total_score").kendoRadialGauge({
                        ////                pointer: [{
                        ////                    value: reportModel.averageScore,
                        ////                    color: gaugeSeriesColors.main,
                        ////                    cap: { size: 0.1 }
                        ////                }, {
                        ////                    value: $scope.ngReportData.performanceGroups[0].benchmark,
                        ////                    color: gaugeSeriesColors.benchmark,
                        ////                }],
                        ////                scale: {
                        ////                    min: reportModel.scale.scaleRanges[0].min,
                        ////                    minorUnit: 1,
                        ////                    startAngle: -30,
                        ////                    endAngle: 210,
                        ////                    max: reportModel.scale.scaleRanges[reportModel.scale.scaleRanges.length - 1].max,
                        ////                    ranges: reportModel.scale.scaleRanges,
                        ////                }
                        ////            });
                        ////        }
                        ////        else {
                        ////            $("#home_gauge_total_score").kendoRadialGauge({
                        ////                pointer: {
                        ////                    value: reportModel.averageScore,
                        ////                    color: gaugeSeriesColors.main,
                        ////                },
                        ////                scale: {
                        ////                    min: reportModel.scale.scaleRanges[0].min,
                        ////                    minorUnit: 1,
                        ////                    startAngle: -30,
                        ////                    endAngle: 210,
                        ////                    max: reportModel.scale.scaleRanges[reportModel.scale.scaleRanges.length - 1].max,
                        ////                    ranges: reportModel.scale.scaleRanges,
                        ////                }
                        ////            });
                        ////        }
                        ////    }

                        ////    if (!isNaN(reportModel.weakAverageScore)) {
                        ////        $('#home_gauge_total_weak_value').html("<span style='color:" + gaugeSeriesColors.main + "; display: inline-block;'>" + reportModel.weakAverageScore + "</span>");
                        ////        $("#home_gauge_total_weak").kendoRadialGauge({
                        ////            pointer: {
                        ////                value: reportModel.weakAverageScore,
                        ////                color: gaugeSeriesColors.main,
                        ////            },
                        ////            scale: {
                        ////                min: reportModel.scale.scaleRanges[0].min,
                        ////                minorUnit: 1,
                        ////                startAngle: -30,
                        ////                endAngle: 210,
                        ////                max: reportModel.scale.scaleRanges[reportModel.scale.scaleRanges.length - 1].max,
                        ////                labels: {
                        ////                    position: "inside"
                        ////                },
                        ////                ranges: reportModel.scale.scaleRanges,
                        ////            }
                        ////        });
                        ////        if (reportModel.evaluatorsProfileScorecards) {
                        ////            if (reportModel.evaluatorsProfileScorecards.length > 0) {
                        ////                if (!isNaN(reportModel.evaluatorsProfileScorecards[0].weakAverageScore)) {
                        ////                    var totalScoreEl = '<span style="color: #000000; display: inline - block;"> vs </span>';
                        ////                    totalScoreEl += "<span style='color:" + gaugeSeriesColors.mainEvaluator + "'; display: inline-block;'>";
                        ////                    totalScoreEl += parseFloat(reportModel.evaluatorsProfileScorecards[0].weakAverageScore).toFixed(1);
                        ////                    totalScoreEl += '</span>';
                        ////                    $($element).find("#home_gauge_total_weak_value").append(totalScoreEl);
                        ////                    //$('#home_gauge_total_score_value').text(reportModel.averageScore);

                        ////                    $("#home_gauge_total_weak").kendoRadialGauge({
                        ////                        //pointer: {
                        ////                        //    value: reportModel.weakAverageScore
                        ////                        //},
                        ////                        pointer: [{
                        ////                            value: reportModel.weakAverageScore,
                        ////                            cap: { size: 0.1 },
                        ////                            color: gaugeSeriesColors.main,
                        ////                        }, {
                        ////                            value: reportModel.evaluatorsProfileScorecards[0].weakAverageScore,
                        ////                            //color: "#005aff",
                        ////                            color: gaugeSeriesColors.mainEvaluator,
                        ////                        }],
                        ////                        scale: {
                        ////                            min: reportModel.scale.scaleRanges[0].min,
                        ////                            minorUnit: 1,
                        ////                            startAngle: -30,
                        ////                            endAngle: 210,
                        ////                            max: reportModel.scale.scaleRanges[reportModel.scale.scaleRanges.length - 1].max,
                        ////                            labels: {
                        ////                                position: "inside"
                        ////                            },
                        ////                            ranges: reportModel.scale.scaleRanges,
                        ////                        }
                        ////                    });
                        ////                }
                        ////            }
                        ////        }
                        ////    }


                        ////    if (!isNaN(reportModel.strongAverageScore)) {

                        ////        $('#home_gauge_total_strong_value').html("<span style='color:" + gaugeSeriesColors.main + "; display: inline-block;'>" + reportModel.strongAverageScore + "</span>");
                        ////        $("#home_gauge_total_strong").kendoRadialGauge({
                        ////            pointer: {
                        ////                value: reportModel.strongAverageScore,
                        ////                color: gaugeSeriesColors.main,
                        ////            },
                        ////            scale: {
                        ////                min: reportModel.scale.scaleRanges[0].min,
                        ////                minorUnit: 1,
                        ////                startAngle: -30,
                        ////                endAngle: 210,
                        ////                max: reportModel.scale.scaleRanges[reportModel.scale.scaleRanges.length - 1].max,
                        ////                labels: {
                        ////                    position: "inside"
                        ////                },
                        ////                ranges: reportModel.scale.scaleRanges,
                        ////            }
                        ////        });

                        ////        if (reportModel.evaluatorsProfileScorecards) {
                        ////            if (reportModel.evaluatorsProfileScorecards.length > 0) {
                        ////                if (!isNaN(reportModel.evaluatorsProfileScorecards[0].strongAverageScore)) {
                        ////                    var totalScoreEl = '<span style="color: #000000; display: inline - block;"> vs </span>';
                        ////                    totalScoreEl += "<span style='color:" + gaugeSeriesColors.mainEvaluator + "; display: inline-block;'>";
                        ////                    totalScoreEl += parseFloat(reportModel.evaluatorsProfileScorecards[0].strongAverageScore).toFixed(1);
                        ////                    totalScoreEl += '</span>';
                        ////                    $($element).find("#home_gauge_total_strong_value").append(totalScoreEl);
                        ////                    //$('#home_gauge_total_score_value').text(reportModel.averageScore);

                        ////                    $("#home_gauge_total_strong").kendoRadialGauge({
                        ////                        pointer: [{
                        ////                            value: reportModel.strongAverageScore,
                        ////                            color: gaugeSeriesColors.main,
                        ////                            cap: { size: 0.1 }
                        ////                        }, {
                        ////                            value: reportModel.evaluatorsProfileScorecards[0].strongAverageScore,
                        ////                            color: gaugeSeriesColors.mainEvaluator,
                        ////                        }],
                        ////                        scale: {
                        ////                            min: reportModel.scale.scaleRanges[0].min,
                        ////                            minorUnit: 1,
                        ////                            startAngle: -30,
                        ////                            endAngle: 210,
                        ////                            max: reportModel.scale.scaleRanges[reportModel.scale.scaleRanges.length - 1].max,
                        ////                            labels: {
                        ////                                position: "inside"
                        ////                            },
                        ////                            ranges: reportModel.scale.scaleRanges,
                        ////                        }
                        ////                    });
                        ////                }
                        ////            }
                        ////        }
                        ////    }

                        ////    $("#home_kpiImageScore").empty();
                        ////    $("#home_kpiImageStrong").empty();
                        ////    $("#kpiImageWeak").empty();
                        ////    if (reportModel.cAverageScore) {
                        ////        if ((reportModel.cParticipantIds.length == 1 && reportModel.cParticipantIds[0].id == -1) || (reportModel.cParticipantIds.length == 1 && reportModel.cParticipantIds[0].id == reportModel.participantsId[0].id && reportModel.profileStepId == 4 && reportModel.mainProfileStepId == 4)) {

                        ////            if (reportModel.cAverageScore) {
                        ////                var totalScoreEl = '<span style="color: #000000; display: inline - block;"> VS  </span>';
                        ////                totalScoreEl += "<span style='color:" + gaugeSeriesColors.compare + "; display: inline-block;'>";
                        ////                totalScoreEl += parseFloat(reportModel.cAverageScore).toFixed(1);
                        ////                totalScoreEl += '</span>';
                        ////                $($element).find("#home_gauge_total_score_value").append(totalScoreEl);
                        ////                //$('#home_gauge_total_score_value').text(reportModel.averageScore);

                        ////                var imageElemHtml = getKPIImage(reportModel.averageScore, reportModel.cAverageScore)
                        ////                $("#home_kpiImageScore").html(imageElemHtml);
                        ////            }

                        ////            var old = $("#home_gauge_total_score").data("kendoRadialGauge").options.pointer;
                        ////            if (old.length > 0) {
                        ////                $("#home_gauge_total_score").data("kendoRadialGauge").options.pointer.push({
                        ////                    value: reportModel.cAverageScore,
                        ////                    color: gaugeSeriesColors.compare,
                        ////                });
                        ////                $("#home_gauge_total_score").data("kendoRadialGauge").redraw();
                        ////            }
                        ////            else {
                        ////                $("#home_gauge_total_score").data("kendoRadialGauge").options.pointer = [];
                        ////                $("#home_gauge_total_score").data("kendoRadialGauge").options.pointer.push(old);
                        ////                $("#home_gauge_total_score").data("kendoRadialGauge").options.pointer.push({
                        ////                    value: reportModel.cAverageScore,
                        ////                    color: gaugeSeriesColors.compare,
                        ////                });
                        ////                $("#home_gauge_total_score").data("kendoRadialGauge").redraw();
                        ////            }

                        ////            if (reportModel.benchMarkStrongKpi) {
                        ////                var benchMarkStrongKpiAvg = 0
                        ////                var strongKpitotalScores = _.sum(reportModel.benchMarkStrongKpi);
                        ////                benchMarkStrongKpiAvg = (strongKpitotalScores / reportModel.benchMarkStrongKpi.length);

                        ////                var totalScoreEl = '<span style="color: #000000; display: inline - block;"> VS  </span>';
                        ////                totalScoreEl += "<span style='color:" + gaugeSeriesColors.compare + "; display: inline-block;'>";
                        ////                totalScoreEl += parseFloat(benchMarkStrongKpiAvg).toFixed(1);
                        ////                totalScoreEl += '</span>';
                        ////                $($element).find("#home_gauge_total_strong_value").append(totalScoreEl);


                        ////                var old = $("#home_gauge_total_strong").data("kendoRadialGauge").options.pointer;
                        ////                if (old.length > 0) {
                        ////                    $("#home_gauge_total_strong").data("kendoRadialGauge").options.pointer.push({
                        ////                        value: benchMarkStrongKpiAvg,
                        ////                        color: gaugeSeriesColors.compare,
                        ////                    });
                        ////                    $("#home_gauge_total_strong").data("kendoRadialGauge").redraw();
                        ////                }
                        ////                else {
                        ////                    $("#home_gauge_total_strong").data("kendoRadialGauge").options.pointer = [];
                        ////                    $("#home_gauge_total_strong").data("kendoRadialGauge").options.pointer.push(old);
                        ////                    $("#home_gauge_total_strong").data("kendoRadialGauge").options.pointer.push({
                        ////                        value: benchMarkStrongKpiAvg,
                        ////                        color: gaugeSeriesColors.compare,
                        ////                    });
                        ////                    $("#home_gauge_total_strong").data("kendoRadialGauge").redraw();
                        ////                }
                        ////                if (benchMarkStrongKpiAvg != "NaN") {
                        ////                    imageElemHtml = getKPIImage(reportModel.strongAverageScore, benchMarkStrongKpiAvg)
                        ////                    $("#home_kpiImageStrong").html(imageElemHtml);
                        ////                }
                        ////                //$('#home_gauge_total_score_value').text(reportModel.averageScore);
                        ////            }

                        ////            if (reportModel.benchMarkWeakKpi) {
                        ////                var benchMarkWeakKpiAvg = 0
                        ////                var weakKpitotalScores = _.sum(reportModel.benchMarkWeakKpi);
                        ////                benchMarkWeakKpiAvg = (weakKpitotalScores / reportModel.benchMarkWeakKpi.length);

                        ////                var totalScoreEl = '<span style="color: #000000; display: inline - block;"> VS  </span>';
                        ////                totalScoreEl += "<span style='color:" + gaugeSeriesColors.compare + "; display: inline-block;'>";
                        ////                totalScoreEl += parseFloat(benchMarkWeakKpiAvg).toFixed(1);
                        ////                totalScoreEl += '</span>';
                        ////                $($element).find("#home_gauge_total_weak_value").append(totalScoreEl);


                        ////                var old = $("#home_gauge_total_weak").data("kendoRadialGauge").options.pointer;
                        ////                if (old.length > 0) {
                        ////                    $("#home_gauge_total_weak").data("kendoRadialGauge").options.pointer.push({
                        ////                        value: benchMarkWeakKpiAvg,
                        ////                        color: gaugeSeriesColors.compare,
                        ////                    });
                        ////                    $("#home_gauge_total_weak").data("kendoRadialGauge").redraw();
                        ////                }
                        ////                else {
                        ////                    $("#home_gauge_total_weak").data("kendoRadialGauge").options.pointer = [];
                        ////                    $("#home_gauge_total_weak").data("kendoRadialGauge").options.pointer.push(old);
                        ////                    $("#home_gauge_total_weak").data("kendoRadialGauge").options.pointer.push({
                        ////                        value: benchMarkWeakKpiAvg,
                        ////                        color: gaugeSeriesColors.compare,
                        ////                    });
                        ////                    $("#home_gauge_total_weak").data("kendoRadialGauge").redraw();
                        ////                }

                        ////                if (benchMarkWeakKpiAvg != "NaN") {
                        ////                    imageElemHtml = getKPIImage(reportModel.weakAverageScore, benchMarkWeakKpiAvg)
                        ////                    $("#home_kpiImageWeak").html(imageElemHtml);
                        ////                }
                        ////                //$('#home_gauge_total_score_value').text(reportModel.averageScore);
                        ////            }

                        ////            if ($scope.ngReportData.isShowBenchmark) {

                        ////                var totalScoreEl = '<span style="color: #000000; display: inline - block;"> vs </span>';
                        ////                totalScoreEl += "<span style='color:" + gaugeSeriesColors.benchmark + "; display: inline-block;'>";
                        ////                totalScoreEl += $scope.ngReportData.performanceGroups[0].benchmark
                        ////                totalScoreEl += '</span>';
                        ////                $($element).find("#home_gauge_total_score_value").append(totalScoreEl);

                        ////                $("#home_compare_gauge_total_score").kendoRadialGauge({
                        ////                    pointer: [{
                        ////                        value: reportModel.averageScore,
                        ////                        color: gaugeSeriesColors.main,
                        ////                        cap: { size: 0.1 }
                        ////                    }, {
                        ////                        value: $scope.ngReportData.performanceGroups[0].benchmark,
                        ////                        color: gaugeSeriesColors.benchmark,
                        ////                    }],
                        ////                    scale: {
                        ////                        min: reportModel.scale.scaleRanges[0].min,
                        ////                        minorUnit: 1,
                        ////                        startAngle: -30,
                        ////                        endAngle: 210,
                        ////                        max: reportModel.scale.scaleRanges[reportModel.scale.scaleRanges.length - 1].max,
                        ////                        ranges: reportModel.scale.scaleRanges,
                        ////                    }
                        ////                });
                        ////            }
                        ////            else {
                        ////                $("#home_compare_gauge_total_score").kendoRadialGauge({
                        ////                    pointer: {
                        ////                        value: reportModel.averageScore,
                        ////                        color: gaugeSeriesColors.main,
                        ////                    },
                        ////                    scale: {
                        ////                        min: reportModel.scale.scaleRanges[0].min,
                        ////                        minorUnit: 1,
                        ////                        startAngle: -30,
                        ////                        endAngle: 210,
                        ////                        max: reportModel.scale.scaleRanges[reportModel.scale.scaleRanges.length - 1].max,
                        ////                        ranges: reportModel.scale.scaleRanges,
                        ////                    }
                        ////                });
                        ////            }

                        ////        }
                        ////        if (!(reportModel.cParticipantIds.length == 1 && reportModel.cParticipantIds[0].id == -1)) {
                        ////            if (reportModel.cAverageScore) {
                        ////                var totalScoreEl = '<span style="color: #000000; display: inline - block;">  </span>';
                        ////                totalScoreEl += "<span style='color:" + gaugeSeriesColors.compare + "; display: inline-block;'>";
                        ////                totalScoreEl += parseFloat(reportModel.cAverageScore).toFixed(1);
                        ////                totalScoreEl += '</span>';
                        ////                $($element).find("#home_compare_gauge_total_score_value").html(totalScoreEl);
                        ////                //$('#home_gauge_total_score_value').text(reportModel.averageScore);
                        ////            }
                        ////            $("#home_compare_gauge_total_score").kendoRadialGauge({
                        ////                pointer: [{
                        ////                    value: reportModel.cAverageScore,
                        ////                    color: gaugeSeriesColors.compare,
                        ////                }],
                        ////                scale: {
                        ////                    min: reportModel.scale.scaleRanges[0].min,
                        ////                    minorUnit: 1,
                        ////                    startAngle: -30,
                        ////                    endAngle: 210,
                        ////                    max: reportModel.scale.scaleRanges[reportModel.scale.scaleRanges.length - 1].max,
                        ////                    labels: {
                        ////                        position: "inside"
                        ////                    },
                        ////                    ranges: reportModel.scale.scaleRanges,
                        ////                }
                        ////            });

                        ////            if (reportModel.cEvaluatorsProfileScorecards) {
                        ////                if (reportModel.cEvaluatorsProfileScorecards.length > 0) {

                        ////                    if (!isNaN(reportModel.cEvaluatorsProfileScorecards[0].averageScore)) {
                        ////                        var totalScoreEl = '<span style="color: #000000; display: inline - block;"> vs </span>';
                        ////                        totalScoreEl += "<span style='color:" + gaugeSeriesColors.mainEvaluator + "; display: inline-block;'>";
                        ////                        totalScoreEl += parseFloat(reportModel.cEvaluatorsProfileScorecards[0].averageScore).toFixed(1);
                        ////                        totalScoreEl += '</span>';
                        ////                        $($element).find("#home_compare_gauge_total_score_value").append(totalScoreEl);
                        ////                        //$('#home_gauge_total_score_value').text(reportModel.averageScore);
                        ////                        $("#home_compare_gauge_total_score").empty();
                        ////                        $("#home_compare_gauge_total_score").kendoRadialGauge({

                        ////                            pointer: [{
                        ////                                value: reportModel.cAverageScore,
                        ////                                color: gaugeSeriesColors.compare,
                        ////                                cap: { size: 0.1 }
                        ////                            }, {
                        ////                                value: reportModel.cEvaluatorsProfileScorecards[0].averageScore,
                        ////                                color: gaugeSeriesColors.compareEvaluator,
                        ////                            }],
                        ////                            scale: {
                        ////                                min: reportModel.scale.scaleRanges[0].min,
                        ////                                minorUnit: 1,
                        ////                                startAngle: -30,
                        ////                                endAngle: 210,
                        ////                                max: reportModel.scale.scaleRanges[reportModel.scale.scaleRanges.length - 1].max,
                        ////                                ranges: reportModel.scale.scaleRanges,
                        ////                            }
                        ////                        });
                        ////                    }
                        ////                    else {
                        ////                        if ($scope.ngReportData.isShowBenchmark) {

                        ////                            var totalScoreEl = '<span style="color: #000000; display: inline - block;"> vs </span>';
                        ////                            totalScoreEl += "<span style='color:" + gaugeSeriesColors.benchmark + "; display: inline-block;'>";
                        ////                            totalScoreEl += $scope.ngReportData.performanceGroups[0].benchmark
                        ////                            totalScoreEl += '</span>';
                        ////                            $($element).find("#home_gauge_total_score_value").append(totalScoreEl);

                        ////                            $("#home_compare_gauge_total_score").kendoRadialGauge({
                        ////                                pointer: [{
                        ////                                    value: reportModel.cAverageScore,
                        ////                                    color: gaugeSeriesColors.compare,
                        ////                                    cap: { size: 0.1 }
                        ////                                }, {
                        ////                                    value: $scope.ngReportData.performanceGroups[0].benchmark,
                        ////                                    color: gaugeSeriesColors.benchmark,
                        ////                                }],
                        ////                                scale: {
                        ////                                    min: reportModel.scale.scaleRanges[0].min,
                        ////                                    minorUnit: 1,
                        ////                                    startAngle: -30,
                        ////                                    endAngle: 210,
                        ////                                    max: reportModel.scale.scaleRanges[reportModel.scale.scaleRanges.length - 1].max,
                        ////                                    ranges: reportModel.scale.scaleRanges,
                        ////                                }
                        ////                            });
                        ////                        }
                        ////                        else {
                        ////                            $("#home_compare_gauge_total_score").kendoRadialGauge({
                        ////                                pointer: {
                        ////                                    value: reportModel.cAverageScore,
                        ////                                    color: gaugeSeriesColors.compare,
                        ////                                },
                        ////                                scale: {
                        ////                                    min: reportModel.scale.scaleRanges[0].min,
                        ////                                    minorUnit: 1,
                        ////                                    startAngle: -30,
                        ////                                    endAngle: 210,
                        ////                                    max: reportModel.scale.scaleRanges[reportModel.scale.scaleRanges.length - 1].max,
                        ////                                    ranges: reportModel.scale.scaleRanges,
                        ////                                }
                        ////                            });
                        ////                        }
                        ////                    }
                        ////                }
                        ////            }

                        ////            if (reportModel.cWeakAverageScore > 0) {
                        ////                var totalScoreEl = '<span style="color: #000000; display: inline - block;">  </span>';
                        ////                totalScoreEl += "<span style='color:" + gaugeSeriesColors.compare + "; display: inline-block;'>";
                        ////                totalScoreEl += parseFloat(reportModel.cWeakAverageScore).toFixed(1);
                        ////                totalScoreEl += '</span>';
                        ////                $($element).find("#home_compare_gauge_total_weak_value").html(totalScoreEl);
                        ////                //$('#home_gauge_total_score_value').text(reportModel.averageScore);
                        ////            }

                        ////            $("#home_compare_gauge_total_weak").kendoRadialGauge({
                        ////                pointer: [{
                        ////                    value: reportModel.cWeakAverageScore,
                        ////                    color: gaugeSeriesColors.compare,
                        ////                    //color: "#005aff",
                        ////                }],
                        ////                scale: {
                        ////                    min: reportModel.scale.scaleRanges[0].min,
                        ////                    minorUnit: 1,
                        ////                    startAngle: -30,
                        ////                    endAngle: 210,
                        ////                    max: reportModel.scale.scaleRanges[reportModel.scale.scaleRanges.length - 1].max,
                        ////                    labels: {
                        ////                        position: "inside"
                        ////                    },
                        ////                    ranges: reportModel.scale.scaleRanges,
                        ////                }
                        ////            });


                        ////            if (reportModel.cEvaluatorsProfileScorecards) {
                        ////                if (reportModel.cEvaluatorsProfileScorecards.length > 0) {

                        ////                    if (!isNaN(reportModel.cEvaluatorsProfileScorecards[0].weakAverageScore)) {
                        ////                        var totalScoreEl = '<span style="color: #000000; display: inline - block;"> vs </span>';
                        ////                        totalScoreEl += "<span style='color:" + gaugeSeriesColors.compareEvaluator + "; display: inline-block;'>";
                        ////                        totalScoreEl += parseFloat(reportModel.cEvaluatorsProfileScorecards[0].weakAverageScore).toFixed(1);
                        ////                        totalScoreEl += '</span>';
                        ////                        $($element).find("#home_compare_gauge_total_weak_value").append(totalScoreEl);
                        ////                        //$('#home_gauge_total_score_value').text(reportModel.averageScore);
                        ////                        $("#home_compare_gauge_total_weak").empty();
                        ////                        $("#home_compare_gauge_total_weak").kendoRadialGauge({

                        ////                            pointer: [{
                        ////                                value: reportModel.cWeakAverageScore,
                        ////                                color: gaugeSeriesColors.compare,
                        ////                                cap: { size: 0.1 }
                        ////                            }, {
                        ////                                value: reportModel.cEvaluatorsProfileScorecards[0].weakAverageScore,
                        ////                                color: gaugeSeriesColors.compareEvaluator,
                        ////                            }],
                        ////                            scale: {
                        ////                                min: reportModel.scale.scaleRanges[0].min,
                        ////                                minorUnit: 1,
                        ////                                startAngle: -30,
                        ////                                endAngle: 210,
                        ////                                max: reportModel.scale.scaleRanges[reportModel.scale.scaleRanges.length - 1].max,
                        ////                                ranges: reportModel.scale.scaleRanges,
                        ////                            }
                        ////                        });
                        ////                    }
                        ////                }
                        ////            }

                        ////            if (reportModel.cStrongAverageScore > 0) {
                        ////                var totalScoreEl = '<span style="color: #000000; display: inline - block;">  </span>';
                        ////                totalScoreEl += "<span style='color:" + gaugeSeriesColors.compare + "; display: inline-block;'>";
                        ////                totalScoreEl += parseFloat(reportModel.cStrongAverageScore).toFixed(1);
                        ////                totalScoreEl += '</span>';
                        ////                $($element).find("#home_compare_gauge_total_strong_value").html(totalScoreEl);
                        ////                //$('#home_gauge_total_score_value').text(reportModel.averageScore);
                        ////            }

                        ////            $("#home_compare_gauge_total_strong").kendoRadialGauge({
                        ////                pointer: [{
                        ////                    value: reportModel.cStrongAverageScore,
                        ////                    color: gaugeSeriesColors.compare,
                        ////                    //color: "#005aff",
                        ////                }],
                        ////                scale: {
                        ////                    min: reportModel.scale.scaleRanges[0].min,
                        ////                    minorUnit: 1,
                        ////                    startAngle: -30,
                        ////                    endAngle: 210,
                        ////                    max: reportModel.scale.scaleRanges[reportModel.scale.scaleRanges.length - 1].max,
                        ////                    labels: {
                        ////                        position: "inside"
                        ////                    },
                        ////                    ranges: reportModel.scale.scaleRanges,
                        ////                }
                        ////            });

                        ////            if (reportModel.cEvaluatorsProfileScorecards) {
                        ////                if (reportModel.cEvaluatorsProfileScorecards.length > 0) {

                        ////                    if (!isNaN(reportModel.cEvaluatorsProfileScorecards[0].strongAverageScore)) {
                        ////                        var totalScoreEl = '<span style="color: #000000; display: inline - block;"> vs </span>';
                        ////                        totalScoreEl += "<span style='color:" + gaugeSeriesColors.compareEvaluator + "; display: inline-block;'>";
                        ////                        totalScoreEl += parseFloat(reportModel.cEvaluatorsProfileScorecards[0].strongAverageScore).toFixed(1);
                        ////                        totalScoreEl += '</span>';
                        ////                        $($element).find("#home_compare_gauge_total_strong_value").append(totalScoreEl);
                        ////                        //$('#home_gauge_total_score_value').text(reportModel.averageScore);
                        ////                        $("#home_compare_gauge_total_strong").empty();
                        ////                        $("#home_compare_gauge_total_strong").kendoRadialGauge({

                        ////                            pointer: [{
                        ////                                value: reportModel.cStrongAverageScore,
                        ////                                color: gaugeSeriesColors.compare,
                        ////                                cap: { size: 0.1 }
                        ////                            }, {
                        ////                                value: reportModel.cEvaluatorsProfileScorecards[0].strongAverageScore,
                        ////                                color: gaugeSeriesColors.compareEvaluator,
                        ////                            }],
                        ////                            scale: {
                        ////                                min: reportModel.scale.scaleRanges[0].min,
                        ////                                minorUnit: 1,
                        ////                                startAngle: -30,
                        ////                                endAngle: 210,
                        ////                                max: reportModel.scale.scaleRanges[reportModel.scale.scaleRanges.length - 1].max,
                        ////                                ranges: reportModel.scale.scaleRanges,
                        ////                            }
                        ////                        });
                        ////                    }
                        ////                }
                        ////            }

                        ////            if ((reportModel.cParticipantIds.length == 1 && reportModel.cParticipantIds[0].id == reportModel.participantsId[0].id && reportModel.profileStepId == 4 && reportModel.mainProfileStepId == 4)) {

                        ////                var imageElemHtml = getKPIImage(reportModel.averageScore, reportModel.cAverageScore)
                        ////                $("#home_kpiImageScore").html(imageElemHtml);

                        ////                if (reportModel.cStrongAverageScore != "NaN") {
                        ////                    imageElemHtml = getKPIImage(reportModel.strongAverageScore, reportModel.cStrongAverageScore)

                        ////                    $("#home_kpiImageStrong").html(imageElemHtml);
                        ////                }

                        ////                if (reportModel.cWeakAverageScore != "NaN") {
                        ////                    imageElemHtml = getKPIImage(reportModel.weakAverageScore, reportModel.cWeakAverageScore)
                        ////                    $("#home_kpiImageWeak").html(imageElemHtml);
                        ////                }
                        ////            }
                        ////            else {
                        ////                var imageElemHtml = getKPIImage(reportModel.averageScore, reportModel.cAverageScore)
                        ////                $("#home_kpiImageScore").html(imageElemHtml);

                        ////                if (reportModel.cStrongAverageScore != "NaN") {
                        ////                    imageElemHtml = getKPIImage(reportModel.strongAverageScore, reportModel.cStrongAverageScore)
                        ////                    $("#home_kpiImageStrong").html(imageElemHtml);
                        ////                }

                        ////                if (reportModel.cWeakAverageScore != "NaN") {
                        ////                    imageElemHtml = getKPIImage(reportModel.weakAverageScore, reportModel.cWeakAverageScore)
                        ////                    $("#home_kpiImageWeak").html(imageElemHtml);
                        ////                }
                        ////            }
                        ////        }

                        ////        //if (!(reportModel.cParticipantIds[0].id == -1)) {
                        ////        //    var imageElemHtml = getKPIImage(reportModel.cAverageScore, reportModel.averageScore)
                        ////        //    $("#home_kpiImageScore").append(imageElemHtml);

                        ////        //    if (reportModel.cStrongAverageScore != "NaN") {
                        ////        //        imageElemHtml = getKPIImage(reportModel.cStrongAverageScore, reportModel.strongAverageScore)
                        ////        //        $("#home_kpiImageStrong").append(imageElemHtml);
                        ////        //    }

                        ////        //    if (reportModel.cWeakAverageScore != "NaN") {
                        ////        //        imageElemHtml = getKPIImage(reportModel.cWeakAverageScore, reportModel.weakAverageScore)
                        ////        //        $("#kpiImageWeak").append(imageElemHtml);
                        ////        //    }
                        ////        //}



                        ////    }
                        ////};

                        $scope.goToScorecard = function () {
                            var mainParticipantIds = null;
                            var mainEvaluatorIds = null;
                            var participantIds = null;
                            var evaluatorIds = null;
                            var projectIds = null;
                            var mainStageId = $scope.ngReportData.mainStageId ? $scope.ngReportData.mainStageId : null;
                            var mainStageGroupId = $scope.ngReportData.profileStageGroupId ? $scope.ngReportData.profileStageGroupId : null;
                            var mainProfileStepId = $scope.ngReportData.mainProfileStepId ? $scope.ngReportData.mainProfileStepId : null;
                            var cStageId = $scope.ngReportData.cStageId ? $scope.ngReportData.cStageId : null;
                            var cProfileTypeId = $scope.ngReportData.cProfileTypeId ? $scope.ngReportData.cProfileTypeId : null;

                            if ($scope.ngReportData && $scope.ngReportData.participantsId) {
                                angular.forEach($scope.ngReportData.participantsId, function (participant) {
                                    mainParticipantIds = mainParticipantIds + participant.id + ';';
                                });
                            }

                            if ($scope.ngReportData && $scope.ngReportData.evaluatorsProfileScorecards && $scope.ngReportData.evaluatorsProfileScorecards.length == 1) {
                                angular.forEach($scope.ngReportData.evaluatorsProfileScorecards, function (eval) {
                                    mainEvaluatorIds = mainEvaluatorIds + eval.id + ';';
                                });
                            }

                            if ($scope.ngReportData && $scope.ngReportData.projectsModel) {
                                angular.forEach($scope.ngReportData.projectsModel, function (project) {
                                    projectIds = projectIds + project.id + ';';
                                });
                            }

                            if ($scope.ngReportData && $scope.ngReportData.cParticipantIds) {
                                angular.forEach($scope.ngReportData.cParticipantIds, function (participant) {
                                    participantIds = participantIds + participant.id + ';';
                                });
                            }

                            if ($scope.ngReportData && $scope.ngReportData.cEvaluatorsProfileScorecards && $scope.ngReportData.cEvaluatorsProfileScorecards.length == 1) {
                                angular.forEach($scope.ngReportData.cEvaluatorsProfileScorecards, function (eval) {
                                    evaluatorIds = evaluatorIds + eval.id + ';';
                                });
                            }

                            if ($scope.$parent.filter) {
                                localStorageService.set('perfomanceManagementFilterData', $scope.$parent.filter);


                                if ($scope.$parent.filter.mainEvaluatorsModel) {
                                    angular.forEach($scope.$parent.filter.mainEvaluatorsModel, function (eval) {
                                        mainEvaluatorIds = mainEvaluatorIds + eval.id + ';';
                                    });
                                }

                                if ($scope.$parent.filter.evaluatorsModel) {
                                    angular.forEach($scope.$parent.filter.evaluatorsModel, function (eval) {
                                        evaluatorIds = evaluatorIds + eval.id + ';';
                                    });
                                }
                            }
                            //organizationId: projectId: profileId: departmentId: teamId: mainParticipantIds: mainEvaluatorIds: mainStageId: mainProfileTypeID: participantIds: evaluatorIds: stageId: profileTypeID: isShowBenchmark
                            console.log($scope);
                            if ($scope.$parent.paneDepth == 2) {
                                $location.path("/home/performance/scorecard/"
                                    + $scope.organizationId + "/"
                                    + projectIds + "/"
                                    + $scope.profileId + "/"
                                    + mainStageGroupId + "/"
                                    + /*$scope.departmentId*/null + "/"
                                    + /*$scope.teamId*/null + "/"
                                    + mainParticipantIds + "/"
                                    + mainEvaluatorIds + "/"
                                    + mainStageId + "/"
                                    + mainProfileStepId + "/"
                                    + participantIds + "/"
                                    + evaluatorIds + "/"
                                    + cStageId + "/"
                                    + cProfileTypeId + "/"
                                    + $scope.ngReportData.isShowBenchmark);
                            } else {
                                $scope.$parent.$parent.selectScorecardTab();
                            }
                        };

                        $scope.$watch('ngReportData', function (newValue, oldValue) {
                            console.log("ngReportData");
                            if (newValue) {
                                $scope.init(newValue);
                            }
                        }, false);
                        $scope.$watch('ngCompareReportData', function (newValue, oldValue) {
                            if (newValue) {
                                $scope.init($scope.ngReportData);
                            }
                        }, false);
                        $scope.$watch('showReport', function (newValue, oldValue) {
                            if (newValue == false) {
                                $($element).find("#KTChart").empty();
                            }
                            $scope.ngDashboard.isShowReport = newValue;
                        }, false);
                        $scope.$watch('showCompareReport', function (newValue, oldValue) {
                            if (!newValue && $scope.ngDashboard.isShowReport) {
                                $scope.init($scope.ngReportData);
                            }
                        }, false);

                    }]
            };
        }]);
})();