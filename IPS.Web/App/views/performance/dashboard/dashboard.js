(function () {
    'use strict';

    angular
        .module('ips.performance')
        .service('organizations', ['dashboardsService', '$translate', function (dashboardsService, $translate) {
            return dashboardsService.getOrganizations('&$orderby=Name').then(function (data) {
                data.unshift({ id: null, name: $translate.instant('COMMON_SELECT_ORGANIZATION') });

                return data;
            });
        }])
        .service('projects', ['dashboardsService', function (dashboardsService) {
            return dashboardsService.getProjects().then(function (data) {
                var pm = [];
                angular.forEach(data, function (item) {
                    pm.push({ id: item.id, label: item.name });
                });
                return pm;
            });
        }])
        .service('dashboardsService', ['apiService', function (apiService) {
            var self = {
                getOrganizations: function (query) {
                    return getOrganizations(query);
                },

                getProjects: function (query) {
                    return getProjects(query);
                },

                getDepartments: function (orgId) {
                    return getDepartments(orgId);
                },

                getTeams: function (orgId, depId) {
                    return getTeams(orgId, depId);
                },

                getProfiles: function (organizationId, query, profileStatus) {
                    return getProfiles(organizationId, query, profileStatus);
                },
                getProjectProfiles: function (projectIds, profileStatus) {
                    return getProjectProfiles(projectIds, profileStatus);
                },
                getDashboardData: function (profileId, isBenchmarkNeeded, participantIds, evaluatorIds, stageIds, profileType, statusOn,stageGroupId) {
                    return getDashboardData(profileId, isBenchmarkNeeded, participantIds, evaluatorIds, stageIds, profileType, statusOn, stageGroupId);
                },

                getParticipants: function (profileId, statusOn) {
                    return getParticipants(profileId, statusOn);
                },

                getParticipantsBy: function (profileId, stageId, projectIds, departmentIds, teamIds) {
                    var scopeObj = [];
                    scopeObj.push(projectIds);
                    scopeObj.push(departmentIds);
                    scopeObj.push(teamIds);

                    return getParticipantsByStageId(profileId, stageId, scopeObj);
                },

                getEvaluators: function (profileId, statusOn) {
                    return getEvaluators(profileId, statusOn);
                },

                getEvaluatorsForParticipant: function (profileId, participantIds) {
                    console.log(profileId);
                    return getEvaluatorsForParticipant(profileId, participantIds);
                },

                getProfileStages: function (profileId, participantId, stageGroupId) {
                    return getProfileStages(profileId, participantId, stageGroupId);
                },

                getProfileEvaluationPeriods: function (profileId, participantId) {
                    return getProfileEvaluationPeriods(profileId, participantId);
                },

                getKTProfileAllStagesResult: function (profileId, participantIds, isStartStage) {
                    return getKTProfileAllStagesResult(profileId, participantIds, isStartStage);
                },
                getKTDashboardData: function (participantIds, profileId, stageId, isStartStage) {
                    return getKTDashboardData(participantIds, profileId, stageId, isStartStage);
                },
                getKTAllStagesBenchmarks: function (profileId) {
                    return getKTAllStagesBenchmarks(profileId);
                },
                getKTBenchmark: function (profileId, stageId) {
                    return getKTBenchmark(profileId, stageId);
                },
            };

            return self;

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

            function getOrganizations(query) {
                (query) ? '' : query = '';
                return apiService.getAll("organizations/getOrgsWithParticipants/?$select=Id,Name" + query);
            }

            function getProjects(query) {
                (query) ? '' : query = '';
                return apiService.getAll("projects/getProjects/");
            }

            function getProjectProfiles(projectIds, profileStatus) {
                var projectIdsStr = getParamsString(projectIds);
                if (profileStatus.toString() == "") {
                    profileStatus = null;
                }
                return apiService.getAll("performance/GetProjectEvaluatedProfiles/" + projectIdsStr + "/" + profileStatus);
            };

            function getDepartments(organizationId) {
                return apiService.getAll("departments/getDepartmentsByOrgId/" + organizationId);
            }

            function getTeams(organizationId, departmentIds) {
                var idsStr = getParamsString(departmentIds);
                return apiService.getAll("teams/getTeamsByDepartmentId/" + organizationId + "/" + idsStr);
            }

            function getProfiles(organizationId, query, profileStatus) {
                (query) ? '' : query = '';

                if (profileStatus == undefined) {
                    profileStatus = null;
                }
                else if (typeof (profileStatus) == "string") {
                    if (profileStatus.toString() == "") {
                        profileStatus = null;
                    }
                }
                return apiService.getAll("performance/GetEvaluatedProfiles/" + organizationId + "/" + profileStatus);
            }

            function getDashboardData(profileId, isBenchmarkNeeded, participantIds, evaluatorIds, stageId, profileType, statusOn, stageGroupId) {
                var participantsStr = getParamsString(participantIds);
                var evaluatorsStr = getParamsString(evaluatorIds);
                return apiService.getAll("performance/profilescorecard/" + profileId + "/" + isBenchmarkNeeded + "/" + participantsStr + "/" + evaluatorsStr + "/" + stageId + "/" + profileType + "/" + statusOn + "/" + stageGroupId);
            }

            function getParticipants(profileId, statusOn) {
                return apiService.getAll("performance/profileparticipants/" + profileId + "/" + statusOn);
            }

            function getParticipantsByStageId(profileId, stageId, scopeData) {
                var scopeStr = [];
                if (scopeData && scopeData.length > 0) {
                    angular.forEach(scopeData, function (ids) {
                        var stageIdsStr = getParamsString(ids);
                        scopeStr.push(stageIdsStr);
                    });
                }
                return apiService.getAll("performance/profileparticipantsbystageid/" + profileId + "/" + stageId + "/" + scopeStr[0] + "/" + scopeStr[1] + "/" + scopeStr[2] + "/null");
            }

            function getEvaluators(profileId, statusOn) {
                return apiService.getAll("performance/profileevaluators/" + profileId + "/" + statusOn);
            }

            function getEvaluatorsForParticipant(profileId, participantIds) {
                var participantsStr = null;
                if (participantIds.length > 0) {
                    participantsStr = "";
                    angular.forEach(participantIds, function (item) {
                        participantsStr += item.id + ";";
                    });
                }
                return apiService.getAll("performance/evaluatorsforparticipant/" + profileId + "/" + participantsStr);
            }

            function getProfileStages(profileId, participantId, stageGroupId) {
                return apiService.getAll("performance/profileevaluationstages/" + profileId + "/" + participantId + "/" + stageGroupId);
            }


            //function getProfileStages (profileId, participantId, isShowParticipantsSameStages, stageGroupId) {
            //     if (!isShowParticipantsSameStages) {
            //         return apiService.getAll("performance/profileevaluationstages/" + profileId + "/" + participantId + "/" + stageGroupId);
            //     }
            //     else {
            //         var participantsStr = getParamsString(participantId);
            //         return apiService.getAll("performance/profileevaluationparticipantssamestages/" + profileId + "/" + participantsStr);
            //     }
            // };

            function getProfileEvaluationPeriods(profileId, participantId) {
                return apiService.getAll("performance/profileevaluationperiods/" + profileId + "/" + participantId);
            }

            function getKTProfileAllStagesResult(profileId, participantIds, isStartStage) {
                var participantsStr = getParamsString(participantIds);
                return apiService.getAll("performance/profileallstagesresult/" + profileId + "/" + participantsStr + "/" + isStartStage);
            }

            function getKTDashboardData(participantIds, profileId, stageId, isStartStage) {
                var participantsStr = getParamsString(participantIds);
                return apiService.getAll("performance/ktprofilescorecard/" + participantsStr + "/" + profileId + "/" + stageId + "/" + isStartStage);
            }

            function getKTAllStagesBenchmarks(profileId) {
                return apiService.getAll("performance/ktprofileallstagesbenchmarks/" + profileId);
            }

            function getKTBenchmark(profileId, stageId) {
                return apiService.getAll("performance/ktprofilebenchmark/" + profileId + "/" + stageId);
            }
        }])
        .constant('profileStatusEnum', {
            Active: true,
            Inactive: false
        })
        .controller('dashboardCtrl', dashboardCtrl)
        .directive('dashboardManagmentFilter', [function () {
            return {
                restrict: 'E',
                templateUrl: 'directives/performanceManagmentFilter/performanceManagmentFilter.html',
                scope: {
                    filter: '='
                },
                controller: 'dashboardManagmentFilterCtrl'
            };
        }])
        .directive('ngDashboardFilter', ['$compile', function ($compile) {
            return {
                restrict: 'EA',
                templateUrl: 'directives/ngDashboard/ngDashboardFilter.html',
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
                    userid: '='
                },
                replace: true,
                controller: ['$scope', '$location', '$compile', 'apiService', 'dialogService', '$element', 'profilesTypesEnum', 'resulTypesEnum', 'medalTypesEnum',
                    'passScoreIndicator', 'ktDashboardColors', 'scorecardsServiceNew', 'ktProfileTypesEnum', 'presentationModesEnum', 'surveyService', 'cssInjector', 'surveyAnalysisService', '$state', 'gaugeSeriesColors', '$translate',
                    function ($scope, $location, $compile, apiService, dialogService, $element, profilesTypesEnum, resulTypesEnum, medalTypesEnum,
                        passScoreIndicator, ktDashboardColors, scorecardsServiceNew, ktProfileTypesEnum, presentationModesEnum, surveyService, cssInjector, surveyAnalysisService, $state, gaugeSeriesColors, $translate) {
                        var reportModel;
                        var profileCharts = [];
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
                        $scope.hasMedalRules = function () {
                            if ($scope.medalRules) {
                                return true;
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
                        $scope.resultTypes = [
                            { id: resulTypesEnum.score, label: $translate.instant('COMMON_SCORE') },
                            { id: resulTypesEnum.percent, label: "%" },
                            { id: resulTypesEnum.correctAnswers, label: $translate.instant('COMMON_CORRECT_ANSWERS') },
                            { id: resulTypesEnum.resultTime, label: $translate.instant('COMMON_RESULT_TIME') + "(" + $translate.instant('TASKPROSPECTING_MINUTES') + ")" },
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

                        $scope.presentationModes = [
                            { id: presentationModesEnum.Dashboard, label: $translate.instant('LEFTMENU_DASHBOARD') },
                            { id: presentationModesEnum.PerSkill, label: $translate.instant('COMMON_PER_SKILL') },
                            { id: presentationModesEnum.StagesResults, label: $translate.instant('COMMON_STAGES_RESULTS') },
                            { id: presentationModesEnum.Scorecard, label: $translate.instant('LEFTMENU_SCORECARD') },
                            { id: presentationModesEnum.PerPerfomanceGroup, label: "Per Perfomance Group" },
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
                                    var surveyResult = data;
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

                            var ktresulttypesHtml = '<div  id="ktScoreCardDetail" ng-if="ngDashboard.isShowKTScoreCardDetail"><div kt-score-card-detail profile-id="profileid" stage-id="ngReportData.stageid" participant-id="participantid" stage-evolution-id="stageEvolutionId"  viewStage="viewStage"></div></div>';
                            ktresulttypesHtml += '<div id="ktAnswerDetail" ng-if="ngDashboard.isShowKTAnswerDetail"><div kt-answer-detail profile-id="profileid" stage-id="ngReportData.stageid" participant-id="participantId" index="0"></div></div>';
                            ktresulttypesHtml += '<div id="ktDevelopmentContractDetail" ng-if="ngDashboard.isShowKTDevelopmentContractDetail"><div kt-development-contract profile-id="profileid" stage-id="stageid" participant-id="participantid" stage-evolution-id="stageevolutionid"></div></div>';
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
                                name: $translate.instant('DASHBOARD_MAIN') //'Main'
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
                                name: $translate.instant('SCORECARD_BENCHMARK') //'benchmark'
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
                                name: $translate.instant('DASHBOARD_COMPARE') //'Compare'
                            };
                            if ($scope.ngCompareReportData) {
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
                                    redrawChart(linearGraph);
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
                                    { field: "question", title: $translate.instant('LEFTMENU_QUESTIONS'), width: "300px" },
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
                                    var mainScoreText = (!$scope.mainStageName || $scope.mainStageName == '' ? '' : $scope.mainStageName + ', ') + reportModel.profileTypeName.trim() + $translate.instant('DASHBOARD_SCORE_PARTICIPANT') + reportModel.label.trim();
                                    dataSource = addFieldToDatasource(dataSource, scoreKey, "score", mainScoreText, sourcePerfomanceGroup.skills, "120px", true);
                                    var commentKey = "mainComment";
                                    var mainCommentText = (!$scope.mainStageName || $scope.mainStageName == '' ? '' : $scope.mainStageName + ', ') + reportModel.profileTypeName.trim() + $translate.instant('DASHBOARD_COMMENT_PARTICIPANT') + reportModel.label.trim();
                                    dataSource = addFieldToDatasource(dataSource, commentKey, "comment", mainCommentText, sourcePerfomanceGroup.skills, "300px", false);
                                }

                                var cScoreItems = sourcePerfomanceGroup.skills.filter(function (skill) {
                                    return skill.cScore && skill.cScore > 0;
                                });

                                if (cScoreItems.length > 0) {
                                    var cScoreKey = "compareScore";
                                    var cScoreText = (!$scope.stageName || $scope.stageName == '' ? '' : $scope.stageName + ', ') + reportModel.cProfileTypeName.trim() + $translate.instant('DASHBOARD_SCORE_PARTICIPANT') + reportModel.cLabel.trim();
                                    dataSource = addFieldToDatasource(dataSource, cScoreKey, "cScore", cScoreText, sourcePerfomanceGroup.skills, "120px", true);
                                    var cCommentKey = "compareComment";
                                    var cCommentText = (!$scope.stageName || $scope.stageName == '' ? '' : $scope.stageName + ', ') + reportModel.cProfileTypeName.trim() + $translate.instant('DASHBOARD_COMMENT_PARTICIPANT') + reportModel.cLabel.trim();
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
                                        var goalText = reportModel.label + " " + $translate.instant('ORGANIZATIONS_GOALS');
                                        dataSource = addFieldToDatasource(dataSource, goalKey, "goal", goalText, sourcePerfomanceGroup.skills, "120px", true);
                                    }
                                }

                                if (reportModel.isShowCompareGoal) {
                                    var cGoalSkills = sourcePerfomanceGroup.skills.filter(function (skill) {
                                        return skill.cGoal && skill.cGoal > 0;
                                    });
                                    if (cGoalSkills.length > 0) {
                                        var cGoalKey = "compareGoal";
                                        var cGoalText = reportModel.cLabel + " " + $translate.instant('ORGANIZATIONS_GOALS');
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

                                dialogService.showGridDialog($translate.instant('MYPROJECTS_PERFORMANCE_GROUP_DETAIL') + " - " + sourcePerfomanceGroup.name, dataSource.data, dataSource.columns);
                            }
                        };

                        $scope.swapGraphMode = function (id) {
                            angular.forEach($scope.pgModesModel, function (pgId) {
                                if (id === pgId.id) {
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
                                if (reportModel.scale) {
                                    reportModel.max = reportModel.scale.scaleRanges[reportModel.scale.scaleRanges.length - 1].max;
                                }
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
                                $scope.ktResultTypeChanged();
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
                            graphElemHtml += "<div class='legend-container' id='legend-container" + elementId.toString() + "' style='font-size: 12px; text-align: center;'></div>";
                            graphElemHtml += "<div style='display:block'>";
                            graphElemHtml += "<div id='floatChart" + elementId.toString() + "' class='floatChart'></div>";
                            graphElemHtml += "<div id='gaugeChart" + elementId.toString() + "' class='floatChart'></div>";
                            graphElemHtml += "<div id='linearChart" + elementId.toString() + "' class='floatChart'></div>";
                            graphElemHtml += "</div>";
                            graphElemHtml += "<div>";
                            graphElemHtml += "<table><tr><td><select class='form-control details-select' name='graphMode' ng-model='pgModesModel[" + elementId + "].value' ng-change='swapGraphMode(" + elementId + ")' ng-options='obj.id as obj.label for obj in chartModes'></select></td><td><button ng-click='getPgDetails(" + perfomanceGroup.id + ")' class='details-btn'>Details</button></td></tr></table>";
                            graphElemHtml += "</div>";
                            graphElemHtml += "</div>";
                            graphElemHtml += "<h3 class='pgName' ng-show='showGraph'>" + perfomanceGroup.name + "</h3>";
                            graphElemHtml += "<div class='GraphListTxt' ng-show='showGraph' >";
                            graphElemHtml += "<h4 class='pgDescription' style='height:50px;'>" + perfomanceGroup.description + "</h4>";
                            var mainLegendPostfix = " (" + (!$scope.mainStageName || $scope.mainStageName == '' ? '' : $scope.mainStageName + ', ') + reportModel.profileTypeName + ")";
                            graphElemHtml += "<h4 class=''>" + reportModel.label + mainLegendPostfix + "</h4>";
                            graphElemHtml += "<div class='GraphLiProc width80Perc FloatLeft'>";

                            graphElemHtml += "<div id='PG" + elementId.toString() + "' class='GraphLiProc FloatLeft'></div>";
                            graphElemHtml += "</div>";
                            graphElemHtml += "<div class='GraphLiProc width20Perc FloatLeft'>";
                            graphElemHtml += "<span class='mArLeft015'>" + avg + "</span>";
                            graphElemHtml += "</div>";


                            if (reportModel.isShowBenchmark) {
                                graphElemHtml += "<div class='GraphLiProc width80Perc FloatLeft' ng-show='showGraph'>";
                                graphElemHtml += "<div class=''>Bench Mark</div>";
                                graphElemHtml += "<div id='PGB" + elementId.toString() + "' class='GraphLiProc FloatLeft'></div>";
                                graphElemHtml += "</div>";
                                graphElemHtml += "<div class='GraphLiProc width20Perc FloatLeft' style='margin-top:0px;'>";
                                graphElemHtml += "<span style='float: left;' class='mArLeft015 benchmarkavg" + elementId.toString() + "' >" + benchmarkavg + "</span>";
                                graphElemHtml += "</div>";
                            }
                            if (perfomanceGroup.cScore && reportModel.cLabel != "") {
                                var compareLegendPostfix = " (" + (!$scope.stageName || $scope.stageName == '' ? '' : $scope.stageName + ', ') + reportModel.cProfileTypeName + ")";
                                graphElemHtml += "<h4 class=''>" + reportModel.cLabel + compareLegendPostfix + "</h4>";
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
                                        graphElemHtml += "<h4 class=''>" + reportModel.evaluatorsProfileScorecards[0].label + mainLegendPostfix + "</h4>";
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
                                        graphElemHtml += "<h4 class=''>" + reportModel.cEvaluatorsProfileScorecards[0].label + compareLegendPostfix + "</h4>";
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

                            for (var i = 1; i <= answersData.length; i++) {
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
                                    kendoPointers.push({ value: perfomanceGroup.score, color: scoreColor, label: "Main Participant: " + reportModel.label + mainLegendPostfix });
                                }
                                if (pointscores.length > 0) {
                                    var totalScores = _.sum(pointscores);
                                    avg = totalScores / pointscores.length;
                                    prc = percentage(reportModel.max, avg);
                                    if ($("#PG" + elementId).length > 0) {
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

                            }
                            else {
                                if ($("#PG" + elementId).length > 0) {
                                    var progressBar;
                                    progressBar = new ProgressBar("PG" + elementId.toString(), { 'width': '100%', 'height': '35px' });
                                    var progressBarItem = {};
                                    progressBarItem[ProgressBar.OPTION_NAME.ITEM_ID] = "item1";
                                    progressBarItem[ProgressBar.OPTION_NAME.COLOR_ID] = ProgressBar.OPTION_VALUE.COLOR_ID.CUSTOM;
                                    progressBarItem.color = getColor(0, reportModel.scale.scaleRanges);
                                    progressBar.createItem(progressBarItem);
                                    progressBar.setPercent(0);
                                }
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
                                    kendoPointers.push({ value: perfomanceGroup.cScore, color: cScoreColor, label: "Participant: " + reportModel.cLabel + compareLegendPostfix });
                                }
                                if (pointscores.length > 0) {
                                    var totalScores = _.sum(pointscores);
                                    avgc = totalScores / pointscores.length;
                                    prcc = percentage(reportModel.max, avgc);
                                    if ($("#PGC" + elementId).length > 0) {
                                        var progressBar;
                                        progressBar = new ProgressBar("PGC" + elementId.toString(), { 'width': '100%', 'height': '35px' });
                                        var progressBarItem = {};
                                        progressBarItem[ProgressBar.OPTION_NAME.ITEM_ID] = "item1";
                                        progressBarItem[ProgressBar.OPTION_NAME.COLOR_ID] = ProgressBar.OPTION_VALUE.COLOR_ID.CUSTOM;
                                        progressBarItem.color = getColor(avgc, reportModel.scale.scaleRanges);
                                        //progressBar.createItem(progressBarItem);
                                        progressBar.createItem(progressBarItem);
                                        progressBar.setPercent(prcc);
                                    }
                                    $(".avgc" + elementId).html(avgc);


                                    var diffPercentage = setDiffrencePercentage(avg, avgc, reportModel.max); //parseFloat((((avgc - avg) / reportModel.max) * 100)).toFixed(1);

                                    var graphElemHtml = "";
                                    if (avg > 0) {
                                        if (avgc > avg) {
                                            graphElemHtml += "<img  class='mArLeft015' src='images/dashboard/top-arrow-green.png' style='width:auto;height:30px;float:left;margin-left: 5px;'>";
                                        } else if (avg == avgc) {
                                            graphElemHtml += "<img class='mArLeft015' src='images/dashboard/min-icon-big.png' style='width:auto;height:30px;float:left;margin-left: 5px;'>";
                                        } else {
                                            graphElemHtml += "<img  class='mArLeft015' src='images/dashboard/botm-arrow-red.png' style='width:auto;height:30px;float:left;margin-left: 5px;'>";
                                        }
                                    }
                                    graphElemHtml += diffPercentage;
                                    $(".avgc" + elementId).after(graphElemHtml);
                                }
                                else {
                                    var progressBar = new ProgressBar("PGC" + elementId.toString(), { 'width': '100%', 'height': '35px' });
                                    var progressBarItem = {};
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
                                    var progressBar = new ProgressBar("PGC" + elementId.toString(), { 'width': '100%', 'height': '35px' });
                                    var progressBarItem = {};
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
                                    kendoPointers.push({ value: perfomanceGroup.benchmark, color: benchColor, label: "Benchmark" });
                                }

                                if (pointscores.length > 0) {
                                    var totalScores = _.sum(pointscores);
                                    benchmarkavg = totalScores / pointscores.length;
                                    benchmarkprc = percentage(reportModel.max, benchmarkavg);

                                    var progressBar = new ProgressBar("PGB" + elementId.toString(), { 'width': '100%', 'height': '35px' });
                                    var progressBarItem = {};
                                    progressBarItem[ProgressBar.OPTION_NAME.ITEM_ID] = "item1";
                                    progressBarItem[ProgressBar.OPTION_NAME.COLOR_ID] = ProgressBar.OPTION_VALUE.COLOR_ID.CUSTOM;
                                    progressBarItem.color = getColor(benchmarkavg, reportModel.scale.scaleRanges);
                                    //progressBar.createItem(progressBarItem);
                                    progressBar.createItem(progressBarItem);
                                    progressBar.setPercent(benchmarkprc);
                                    $(".benchmarkavg" + elementId).html(benchmarkavg);

                                    var graphElemHtml = "";
                                    if (avg > 0) {
                                        if (benchmarkavg > avg) {
                                            graphElemHtml += "<img  class='mArLeft015' src='images/dashboard/top-arrow-green.png' style='width:auto;height:30px;float:left;margin-left: 5px;'>";
                                        } else if (avg == benchmarkavg) {
                                            graphElemHtml += "<img  class='mArLeft015'src='images/dashboard/min-icon-big.png' style='width:auto;height:30px;float:left;margin-left: 5px;'>";
                                        } else {
                                            graphElemHtml += "<img  class='mArLeft015' src='images/dashboard/botm-arrow-red.png' style='width:auto;height:30px;float:left;margin-left: 5px;'>";
                                        }
                                    }
                                    var diffPercentage = setDiffrencePercentage(avg, benchmarkavg, reportModel.max);
                                    graphElemHtml += diffPercentage;
                                    $(".benchmarkavg" + elementId).after(graphElemHtml);
                                }
                                else {
                                    var progressBar = new ProgressBar("PGB" + elementId.toString(), { 'width': '100%', 'height': '35px' });
                                    var progressBarItem = {};
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
                                    kendoPointers.push({ value: perfomanceGroup.goal, color: goalColor, label: reportModel.label + " Goals" });
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
                                    kendoPointers.push({ value: perfomanceGroup.cGoal, color: cGoalColor, label: reportModel.cLabel + " Goals" });
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
                                        kendoPointers.push({ value: evaluatorDataForGraph.score, color: evaluatorColor, label: "Main Evaluator: " + evaluatorDataForGraph.label + mainLegendPostfix });
                                    }
                                });
                                if (pointscores.length > 0) {
                                    var totalScores = _.sum(pointscores);
                                    mainEvalutorAVG = totalScores / pointscores.length;
                                    mainEvalutorPRC = percentage(reportModel.max, mainEvalutorAVG);
                                    var progressBar = new ProgressBar("PGE" + elementId.toString(), { 'width': '100%', 'height': '35px' });
                                    var progressBarItem = {};
                                    progressBarItem[ProgressBar.OPTION_NAME.ITEM_ID] = "item1";
                                    progressBarItem[ProgressBar.OPTION_NAME.COLOR_ID] = ProgressBar.OPTION_VALUE.COLOR_ID.CUSTOM;
                                    progressBarItem.color = getColor(mainEvalutorAVG, reportModel.scale.scaleRanges);

                                    progressBar.createItem(progressBarItem);
                                    progressBar.setPercent(mainEvalutorPRC);
                                    $(".mainEvalutorAVG" + elementId).html(mainEvalutorAVG);



                                    var graphElemHtml = "";
                                    if (avg > 0) {
                                        if (mainEvalutorAVG > avg) {
                                            graphElemHtml += "<img  class='mArLeft015' src='images/dashboard/top-arrow-green.png' style='width:auto;height:30px;float:left;margin-left: 5px;'>";
                                        } else if (avg == mainEvalutorAVG) {
                                            graphElemHtml += "<img  class='mArLeft015' src='images/dashboard/min-icon-big.png' style='width:auto;height:30px;float:left;margin-left: 5px;'>";
                                        } else {
                                            graphElemHtml += "<img   class='mArLeft015' src='images/dashboard/botm-arrow-red.png' style='width:auto;height:30px;float:left;margin-left: 5px;'>";
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
                                        var progressBar = new ProgressBar("PGE" + elementId.toString(), { 'width': '100%', 'height': '35px' });
                                        var progressBarItem = {};
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
                                                graphElemHtml += "<img  class='mArLeft015' src='images/dashboard/top-arrow-green.png' style='width:auto;height:30px;float:left;margin-left: 5px;'>";
                                            } else if (avg == mainEvalutorAVG) {
                                                graphElemHtml += "<img  class='mArLeft015' src='images/dashboard/min-icon-big.png' style='width:auto;height:30px;float:left;margin-left: 5px;'>";
                                            } else {
                                                graphElemHtml += "<img   class='mArLeft015' src='images/dashboard/botm-arrow-red.png' style='width:auto;height:30px;float:left;margin-left: 5px;'>";
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
                                        kendoPointers.push({
                                            value: evaluatorDataForGraph.score, color: cEvaluatorColor, label: "Evaluator: " + evaluatorDataForGraph.label + compareLegendPostfix
                                        });
                                    }
                                });

                                if (pointscores.length > 0) {
                                    var totalScores = _.sum(pointscores);
                                    compareEvaluatorAVG = totalScores / pointscores.length;
                                    compareEvaluatorPRC = percentage(reportModel.max, compareEvaluatorAVG);
                                    var progressBar = new ProgressBar("PGCE" + elementId.toString(), { 'width': '100%', 'height': '35px' });
                                    var progressBarItem = {};
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
                                            graphElemHtml += "<img  class='mArLeft015' src='images/dashboard/top-arrow-green.png' style='width:auto;height:30px;float:left;margin-left: 5px;'>";
                                        } else if (avg == mainEvalutorAVG) {
                                            graphElemHtml += "<img  class='mArLeft015' src='images/dashboard/min-icon-big.png' style='width:auto;height:30px;float:left;margin-left: 5px;'>";
                                        } else {
                                            graphElemHtml += "<img   class='mArLeft015' src='images/dashboard/botm-arrow-red.png' style='width:auto;height:30px;float:left;margin-left: 5px;'>";
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
                                        var progressBar = new ProgressBar("PGCE" + elementId.toString(), { 'width': '100%', 'height': '35px' });
                                        var progressBarItem = {};
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
                                                graphElemHtml += "<img  class='mArLeft015' src='images/dashboard/top-arrow-green.png' style='width:auto;height:30px;float:left;margin-left: 5px;'>";
                                            } else if (avg == mainEvalutorAVG) {
                                                graphElemHtml += "<img  class='mArLeft015' src='images/dashboard/min-icon-big.png' style='width:auto;height:30px;float:left;margin-left: 5px;'>";
                                            } else {
                                                graphElemHtml += "<img   class='mArLeft015' src='images/dashboard/botm-arrow-red.png' style='width:auto;height:30px;float:left;margin-left: 5px;'>";
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
                                    var progressBar = new ProgressBar("PGCE" + elementId.toString(), { 'width': '100%', 'height': '35px' });
                                    var progressBarItem = {};
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
                            serie.name = "Compare Participants (" + $scope.ngReportData.participantsRaw + ")";
                            serie.data = []
                            angular.forEach($scope.ktCompareStagesResult, function (stage, index) {
                                if (stage) {
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
                                }
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
                                    text: "Stages result"
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

                        //



                        function getKPIImage(avg, avgc) {
                            var imageElemHtml = "";
                            if (avg > avgc) {
                                imageElemHtml += "<img src='images/dashboard/top-arrow-green.png' style='width:auto;height:30px;padding-left:5px;padding-top: 18px;padding-bottom: 5px'>";
                            } else if (avg == avgc) {
                                imageElemHtml += "<img src='images/dashboard/min-icon-big.png' style='width:auto;height:30px;padding-left:5px;padding-top: 18px;padding-bottom: 5px'>";
                            } else {
                                imageElemHtml += "<img src='images/dashboard/botm-arrow-red.png' style='width:auto;height:30px;padding-left:5px;padding-top: 18px;padding-bottom: 5px'>";
                            }
                            var diffPercentage = setDiffrencePercentage(avgc, avg, reportModel.max);
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

                        // KT 

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
                                    itemToAdd.pgName = '';
                                    res.push(itemToAdd);
                                });
                            });

                            return res;
                        }
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
                                            dialogService.showKTAnswerDetailDialog(participantName, $scope.profileId, $scope.ngReportData.stageId, participantID, index);
                                            var linkFn = $compile($("#ktAnswerDetailGridDialogWindow"));
                                            linkFn($scope);
                                        }
                                    });;
                            }
                        };
                        $scope.getKTDevelopmentContractDetail = function () {
                            dialogService.showKTDevelopmentContractDetailDialog("Final KPI of " + $scope.ngReportData.mainParticipantsRaw.split(",")[0], $scope.profileId, $scope.ngReportData.stageId, $scope.ngReportData.participantsId[0].id, $scope.stageEvolutionId);
                            var linkFn = $compile($("#ktDevelopmentContractDetailDialogWindow"));
                            linkFn($scope);
                        };

                        $scope.getKTScoreCardDetail = function () {

                            dialogService.showKTScoreCardDetailDialog($scope.profileId, $scope.ngReportData.stageId, $scope.ngReportData.participantsId[0].id, $scope.stageEvolutionId);
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
                                        dialogService.showKTAnswerDetailDialog($scope.ngReportData.mainParticipantsRaw.split(",")[0], $scope.profileId, $scope.ngReportData.stageId, $scope.ngReportData.participantsId[0].id, index);
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
                                    if ($scope.ngReportData.cParticipantIds.length > 0 && $scope.ngReportData.cEvaluatorsProfileScorecards.length > 0) {
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
                                    else if ($scope.ngReportData.cEvaluatorsProfileScorecards.length > 0) {
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

                                    surveyService.getKTSurveyResult($scope.profileId.toString(), $scope.ngReportData.stageId.toString(), $scope.ngReportData.participantsId[0].id.toString(), "null").then(function (answerdata) {

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

                                        $scope.reportData = data;
                                        if ($("#scorecardGrid").length > 0) {
                                            $("#scorecardGrid").empty();
                                        }
                                        var grid;
                                        if (!($scope.ngReportData.cParticipantIds.length > 0)) {

                                            var columns = [
                                                { field: "pgName", title: $translate.instant('COMMON_PERFORMANCE_GROUP'), width: "11%" },
                                                { field: "skillName", title: $translate.instant('COMMON_SKILL'), width: "11%" },
                                                { field: "questionText", title: $translate.instant('MYPROFILES_QUESTION'), width: "11%" },
                                                { field: "", title: $scope.ngReportData.mainParticipantsRaw.split(',')[0] + " " + $translate.instant('SCORECARD_INDICATOR'), width: "5%", template: "<div ng-click='getKTAnswerDetail(#= (questionId != null)? questionId : ''#,#= (questionId != null)? participantId : ''#)' class='scale-circle' style='background: #: indicator #'></div>" },
                                                { field: "pointsScore", title: $scope.ngReportData.mainParticipantsRaw.split(',')[0] + " " + $translate.instant('SCORECARD_POINTS_SCORE'), width: columnWidthText, template: "<div class='number' style='color:" + colorMainPart + "'>#= (pointsScore == null) ? ' ' : pointsScore #</div>" },
                                                { field: "percentScore", title: $scope.ngReportData.mainParticipantsRaw.split(',')[0] + " " + $translate.instant('COMMON_SCORE') + ", %", width: columnWidthText, template: "<div class='number' style='color:" + colorMainPart + "'>#= percentScore ? percentScore+'%' : '' #</div>" },
                                                { field: "target", title: $translate.instant('SOFTPROFILE_BENCHMARK'), width: "6%", template: "<div class='number'>#= (benchmark == null) ? ' ' : benchmark #</div>", hidden: !$scope.ngReportData.isShowBenchmark },
                                                { field: "weight", title: $translate.instant('SOFTPROFILE_WEIGHT'), width: "6%", template: "<div class='number'>#= (weight == null) ? ' ' : weight #</div>" },
                                                { field: "csf", title: "CSF", width: "12%", template: "#= (csf == null) ? ' ' : csf #" },
                                                { field: "action", title: $translate.instant('MYPROFILES_COMMENT'), width: "12%", template: "#= (action == null) ? ' ' : action #" },
                                            ];
                                            //dialogService.showKTGridDialog("Performance Group Details - ", dataSource($scope.reportData.skillResults), columns);
                                            //var linkFn = $compile($("#ktGridDialogWindow"));
                                            //linkFn($scope);

                                            var colorMainPart = "black";
                                            var colorComparePart = "blue";
                                            var columnWidth = 10;
                                            var columnWidthText = columnWidth + "%";
                                            var grid = $("#ktDetailsGrid").kendoTreeList({
                                                dataSource: dataSource($scope.reportData.skillResults),
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
                                                    var mainResult = _.filter($scope.reportData.skillResults, function (skillRes) { return skillRes.id == -1 });
                                                    var compareResult = compData.skillResults;
                                                    if (mainResult.length == compareResult.length) {
                                                        _.forEach($scope.reportData.skillResults, function (skillRes) {
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
                                                            { field: "questionText", title: $translate.instant('MYPROFILES_QUESTION'), width: "11%" },
                                                            { field: "", title: $scope.ngReportData.mainParticipantsRaw.split(',')[0] + " " + $translate.instant('SCORECARD_INDICATOR'), width: "5%", template: "<div ng-click='getKTAnswerDetail(#= (questionId != null)? questionId : ''#,#= (questionId != null)? participantId : ''#)' class='scale-circle' style='background: #: indicator #'></div>" },
                                                            { field: "", title: $scope.ngReportData.participantsRaw.split(',')[0] + " " + $translate.instant('SCORECARD_INDICATOR'), width: "5%", template: "<div ng-click='getKTAnswerDetail(#= (questionId != null)? questionId : ''#,#= (questionId != null)? cParticipantId : ''#)' class='scale-circle' style='background: #: cIndicator #'></div>" },
                                                            { field: "pointsScore", title: $scope.ngReportData.mainParticipantsRaw.split(',')[0] + " " + $translate.instant('SCORECARD_POINTS_SCORE'), width: columnWidthText, template: "<div class='number' style='color:" + colorMainPart + "'>#= (pointsScore == null) ? ' ' : pointsScore #</div>" },
                                                            { field: "comparePointsScore", title: $scope.ngReportData.participantsRaw.split(',')[0] + " " + $translate.instant('SCORECARD_POINTS_SCORE'), width: columnWidthText, template: "<div class='number' style='color:" + colorComparePart + "'>#= (comparePointsScore == null) ? ' ' : comparePointsScore #</div>" },
                                                            { field: "percentScore", title: $scope.ngReportData.mainParticipantsRaw.split(',')[0] + " " + $translate.instant('COMMON_SCORE') + ", %", width: columnWidthText, template: "<div class='number' style='color:" + colorMainPart + "'>#= percentScore ? percentScore+'%' : '' #</div>" },
                                                            { field: "comparePercentScore", title: $scope.ngReportData.participantsRaw.split(',')[0] + " " + $translate.instant('COMMON_SCORE') + ", %", width: columnWidthText, template: "<div class='number' style='color:" + colorComparePart + "'>#= comparePercentScore ? comparePercentScore+'%' : '' #</div>" },
                                                            { field: "target", title: $translate.instant('SOFTPROFILE_BENCHMARK'), width: "6%", template: "<div class='number'>#= (benchmark == null) ? ' ' : benchmark #</div>", hidden: !$scope.ngReportData.isShowBenchmark },
                                                            { field: "trend", title: $translate.instant('SCORECARD_TREND'), width: "4%", template: "<div class='trend-#: trend #'></div>" },
                                                            { field: "weight", title: $translate.instant('SOFTPROFILE_WEIGHT'), width: "6%", template: "<div class='number'>#= (weight == null) ? ' ' : weight #</div>" },
                                                            { field: "csf", title: "CSF", width: "12%", template: "#= (csf == null) ? ' ' : csf #" },
                                                            { field: "avgPointScore", title: $translate.instant('DASHBOARD_AVG_POINT_SCORE'), width: "12%", template: "#= (avgPointScore == null) ? ' ' : avgPointScore #" },
                                                            { field: "avgPercentScore", title: $translate.instant('DASHBOARD_AVG_PERCENT_SCORE'), width: "12%", template: "<div class='number'>#= avgPercentScore ? avgPercentScore+'%' : '' #</div>" },
                                                            { field: "action", title: $translate.instant('COMMON_ACTION'), width: "12%", template: "#= (action == null) ? ' ' : action #" }
                                                        ];
                                                        //dialogService.showKTGridDialog("Performance Group Details - ", dataSource($scope.reportData.skillResults), columns);
                                                        //var linkFn = $compile($("#ktGridDialogWindow"));
                                                        //linkFn($scope);
                                                        var colorMainPart = "black";
                                                        var colorComparePart = "blue";
                                                        var columnWidth = 10;
                                                        var columnWidthText = columnWidth + "%";
                                                        var grid = $("#ktDetailsGrid").kendoTreeList({
                                                            dataSource: dataSource($scope.reportData.skillResults),
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
                                                        dialogService.showNotification($translate.instant('DASHBOARD_SORRY_SELECTED_STAGE_IS_NOT_COMPARABLE'), $translate.instant('COMMON_WARNING'));
                                                    }

                                                });
                                        }

                                        $scope.ngReportData.legends = [];
                                        var showReport;
                                        var treeGrid = $("#scorecardGrid");
                                        if (treeGrid.length > 0) {
                                            var treelist = treeGrid.data("kendoTreeList"); //todo implement with angular
                                            var mainPostfix = " (" + $scope.ngReportData.mainStageName + ")";
                                            var postfix = " (" + $scope.ngReportData.stageName + ")";
                                            if ($scope.ngReportData.mainParticipantsModel.length > 0) {
                                                $scope.scorecard.legends.push(getLegendNames($scope.ngReportData.mainParticipantsModel, colorMainPart, $scope.ngReportData.mainParticipantsOptions, mainPostfix, "Main Participant: "));
                                                showReport = true;
                                            }
                                            if ($scope.ngReportData.participantsModel.length > 0) {
                                                $scope.scorecard.legends.push(getLegendNames($scope.ngReportData.participantsModel, colorComparePart, $scope.ngReportData.participantsOptions, postfix, "Participant: "));
                                                showReport = true;
                                            }
                                        }
                                        else {
                                            showReport = false;
                                        }

                                        $scope.ngReportData.isShowReport = showReport;
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

                                    var strongElemHtml = "<div class='GraphScoreBox row'>";
                                    strongElemHtml += "<h3 class='width80Perc'>" + value.name + "</h3>";
                                    strongElemHtml += "<h4 class='width80Perc'>" + value.description + "</h4>";
                                    var mainLegendPostfix = " (" + (!$scope.mainStageName || $scope.mainStageName == '' ? '' : $scope.mainStageName + ', ') + reportModel.profileTypeName + ")";
                                    strongElemHtml += "<h4 class='width80Perc'>" + reportModel.label + mainLegendPostfix + "</h4>";
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
                                        var progressBarItem = {};
                                        progressBarItem[ProgressBar.OPTION_NAME.ITEM_ID] = "item1";


                                        progressBarItem[ProgressBar.OPTION_NAME.COLOR_ID] = ProgressBar.OPTION_VALUE.COLOR_ID.CUSTOM;
                                        progressBarItem.color = getColor(value.score, reportModel.scale.scaleRanges);
                                        progressBar.createItem(progressBarItem);
                                        progressBar.setPercent(prc);
                                    }

                                });
                                if ((reportModel.isCompare) && (reportModel.cStrongAreas)) {
                                    var isStrongKPIgenerated = false;
                                    if (reportModel.cParticipantIds && reportModel.participantsId) {
                                        if (reportModel.cParticipantIds.length == 1 && reportModel.participantsId.length == 1) {
                                            if (reportModel.cParticipantIds[0].id == reportModel.participantsId[0].id && reportModel.mainProfileStepId == 4 && reportModel.profileStepId == 4) {
                                                var index = 0;
                                                reportModel.benchMarkStrongKpi = [];
                                                _.forEach($(".strongBox .GraphScoreBox h3"), function (strongItem) {
                                                    var strongKPI = $(strongItem).text();

                                                    var obj = _.find(reportModel.strongAreas, function (pgSkill) {
                                                        return pgSkill.name == strongKPI;
                                                    });
                                                    if (obj && $(".strongBox #PGS" + index).length > 0) {
                                                        console.log("benchmark Graph =" + obj.cScore + " reportModel.score = " + obj.score);
                                                        var comparestrongElemHtml = "";
                                                        //comparestrongElemHtml += "<h3 class='width80Perc'>" + obj.name + "</h3>";
                                                        var compareLegendPostfix = " (" + (!$scope.stageName || $scope.stageName == '' ? '' : $scope.stageName + ', ') + reportModel.cProfileTypeName + ")";
                                                        comparestrongElemHtml += "<h4 class=''>" + reportModel.cLabel + compareLegendPostfix + "</h4>";
                                                        comparestrongElemHtml += "<div class='compareGraphLiProc GraphLiProc width80Perc FloatLeft'>";

                                                        comparestrongElemHtml += "<div id='PGSC" + index.toString() + "' class='benchmarkGraphLiProc GraphLiProc FloatLeft'></div>";
                                                        comparestrongElemHtml += "</div>";
                                                        comparestrongElemHtml += "<div class='compareGraphLiProc GraphLiProc width20Perc FloatLeft' style='margin-top:0px;' >";
                                                        comparestrongElemHtml += "<span class='mArLeft015'>" + obj.cScore.toString() + "</span>";
                                                        //comparestrongElemHtml += "<div style='clear:both;'>";
                                                        //comparestrongElemHtml += getKPIImage(value.score, value.score);
                                                        comparestrongElemHtml += "</div>";
                                                        comparestrongElemHtml += "";
                                                        //$(".weakBox").append(comparestrongElemHtml);
                                                        $(".strongBox #PGS" + index).parents(".GraphScoreBox").append(comparestrongElemHtml);

                                                        var diffPercentage = setDiffrencePercentage(obj.score, obj.cScore, reportModel.max);
                                                        var graphElemHtml = "";
                                                        if (obj.score > 0) {
                                                            if (obj.cScore > obj.score) {
                                                                graphElemHtml += "<img  class='mArLeft015' src='images/dashboard/top-arrow-green.png' style='width:auto;height:30px;float:left;margin-left: 5px;'>";
                                                            } else if (obj.score == obj.cScore) {
                                                                graphElemHtml += "<img class='mArLeft015' src='images/dashboard/min-icon-big.png' style='width:auto;height:30px;float:left;margin-left: 5px;'>";
                                                            } else {
                                                                graphElemHtml += "<img  class='mArLeft015' src='images/dashboard/botm-arrow-red.png' style='width:auto;height:30px;float:left;margin-left: 5px;'>";
                                                            }
                                                        }
                                                        graphElemHtml += diffPercentage;
                                                        $(".strongBox #PGSC" + index).parents(".GraphScoreBox").find(".compareGraphLiProc.width20Perc").append(graphElemHtml);
                                                        if ((obj.cScore > 0)) {
                                                            reportModel.benchMarkStrongKpi.push(obj.cScore);
                                                            prcc = percentage(reportModel.max, obj.cScore);
                                                            if ($("#PGSC" + index).length > 0) {
                                                                var progressBar;
                                                                progressBar = new ProgressBar("PGSC" + index.toString(), { 'width': '100%', 'height': '30px' });
                                                                var progressBarItem = {};
                                                                progressBarItem[ProgressBar.OPTION_NAME.ITEM_ID] = "item1";
                                                                progressBarItem[ProgressBar.OPTION_NAME.COLOR_ID] = ProgressBar.OPTION_VALUE.COLOR_ID.CUSTOM;
                                                                progressBarItem.color = getColor(obj.cScore, reportModel.scale.scaleRanges);
                                                                progressBar.createItem(progressBarItem);
                                                                progressBar.setPercent(prcc);
                                                            }
                                                        }
                                                        index++;
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

                                            var comaprestrongElemHtml = "<div class='GraphScoreBox row'>";
                                            comaprestrongElemHtml += "<h3 class='width80Perc'>" + value.name + "</h3>";
                                            comaprestrongElemHtml += "<h4 class='width80Perc'>" + value.description + "</h4>";
                                            var compareLegendPostfix = " (" + (!$scope.stageName || $scope.stageName == '' ? '' : $scope.stageName + ', ') + reportModel.cProfileTypeName + ")";
                                            comaprestrongElemHtml += "<div class=''>" + reportModel.cLabel + compareLegendPostfix + "</div>";
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
                                                var progressBarItem = {};
                                                progressBarItem[ProgressBar.OPTION_NAME.ITEM_ID] = "item1";
                                                progressBarItem[ProgressBar.OPTION_NAME.COLOR_ID] = ProgressBar.OPTION_VALUE.COLOR_ID.CUSTOM;
                                                progressBarItem.color = getColor(value.score, reportModel.scale.scaleRanges);

                                                progressBar.createItem(progressBarItem);
                                                progressBar.setPercent(prcc);
                                            }
                                        });
                                    }
                                }
                            }
                            if (reportModel.cParticipantIds) {
                                if (reportModel.cParticipantIds.length == 1) {

                                    if (reportModel.cParticipantIds[0].id == -1) {
                                        reportModel.benchMarkStrongKpi = [];
                                        var index = 0;
                                        _.forEach($(".strongBox .GraphScoreBox h3"), function (strongItem) {
                                            var strongKPI = $(strongItem).text();
                                            _.forEach(reportModel.performanceGroups, function (performanceGroupItem) {
                                                var obj = _.find(performanceGroupItem.skills, function (pgSkill) {
                                                    return pgSkill.name == strongKPI;
                                                });
                                                if (obj && $(".strongBox #PGS" + index).length > 0) {
                                                    var diffPercentage = setDiffrencePercentage(obj.cScore, obj.score, reportModel.max);
                                                    var graphElemHtml = "";
                                                    if (obj.score > 0) {
                                                        if (obj.score > obj.cScore) {
                                                            graphElemHtml += "<img  class='mArLeft015' src='images/dashboard/top-arrow-green.png' style='width:auto;height:30px;float:left;margin-left: 5px;'>";
                                                        } else if (obj.score == obj.cScore) {
                                                            graphElemHtml += "<img class='mArLeft015' src='images/dashboard/min-icon-big.png' style='width:auto;height:30px;float:left;margin-left: 5px;'>";
                                                        } else {
                                                            graphElemHtml += "<img  class='mArLeft015' src='images/dashboard/botm-arrow-red.png' style='width:auto;height:30px;float:left;margin-left: 5px;'>";
                                                        }
                                                    }
                                                    graphElemHtml += diffPercentage;
                                                    $(".strongBox #PGS" + index).parents(".GraphScoreBox").find(".GraphLiProc.width20Perc").append(graphElemHtml);

                                                    console.log("benchmark Graph =" + obj.cScore + " reportModel.score = " + obj.score);
                                                    var comparestrongElemHtml = "";

                                                    var compareLegendPostfix = " (" + (!$scope.stageName || $scope.stageName == '' ? '' : $scope.stageName + ', ') + reportModel.cProfileTypeName + ")";
                                                    comparestrongElemHtml += "<h4 class=''>" + reportModel.cLabel + compareLegendPostfix + "</h4>";
                                                    comparestrongElemHtml += "<div class='benchmarkGraphLiProc GraphLiProc width80Perc FloatLeft'>";

                                                    comparestrongElemHtml += "<div id='PGSC" + index.toString() + "' class='benchmarkGraphLiProc GraphLiProc FloatLeft'></div>";
                                                    comparestrongElemHtml += "</div>";
                                                    comparestrongElemHtml += "<div class='benchmarkGraphLiProc GraphLiProc width20Perc FloatLeft' style='margin-top:0px;' >";
                                                    comparestrongElemHtml += "<span class='mArLeft015'>" + obj.cScore.toString() + "</span>";
                                                    comparestrongElemHtml += "<div style='clear:both;'>";
                                                    //comparestrongElemHtml += getKPIImage(value.score, value.score);
                                                    comparestrongElemHtml += "</div>";
                                                    comparestrongElemHtml += "";



                                                    $(".strongBox #PGS" + index).parents(".GraphScoreBox").append(comparestrongElemHtml);
                                                    if ((obj.cScore > 0)) {
                                                        reportModel.benchMarkStrongKpi.push(obj.cScore);
                                                        prcc = percentage(reportModel.max, obj.cScore);
                                                        if ($("#PGSC" + index).length > 0) {
                                                            var progressBar;
                                                            progressBar = new ProgressBar("PGSC" + index.toString(), { 'width': '100%', 'height': '30px' });
                                                            var progressBarItem = {};
                                                            progressBarItem[ProgressBar.OPTION_NAME.ITEM_ID] = "item1";
                                                            progressBarItem[ProgressBar.OPTION_NAME.COLOR_ID] = ProgressBar.OPTION_VALUE.COLOR_ID.CUSTOM;
                                                            progressBarItem.color = getColor(obj.cScore, reportModel.scale.scaleRanges);
                                                            progressBar.createItem(progressBarItem);
                                                            progressBar.setPercent(prcc);
                                                        }
                                                    }
                                                    index++;
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


                                    var strongElemHtml = "<div class='GraphScoreBox row'>";
                                    strongElemHtml += "<h3 class='width80Perc'>" + value.name + "</h3>";
                                    strongElemHtml += "<h4 class='width80Perc'>" + value.description + "</h4>";
                                    var mainLegendPostfix = " (" + (!$scope.mainStageName || $scope.mainStageName == '' ? '' : $scope.mainStageName + ', ') + reportModel.profileTypeName + ")";
                                    strongElemHtml += "<h4 class=''>" + reportModel.label + mainLegendPostfix + "</h4>";
                                    strongElemHtml += "<div class='GraphLiProc width80Perc FloatLeft'>";
                                    strongElemHtml += "<div id='PGF" + index.toString() + "' class='GraphLiProc FloatLeft'></div>";
                                    strongElemHtml += "</div>";
                                    strongElemHtml += "<div class='GraphLiProc width20Perc FloatLeft'>";
                                    strongElemHtml += "<span class='mArLeft015'>" + value.score.toString() + "</span>";
                                    //strongElemHtml += "<div style='clear:both;'>";
                                    strongElemHtml += "</div>";

                                    strongElemHtml += "</div>";


                                    $(".weakBox").append(strongElemHtml);
                                    if ($("#PGF" + index).length > 0) {
                                        var progressBar;
                                        progressBar = new ProgressBar("PGF" + index.toString(), { 'width': '100%', 'height': '30px' });
                                        var progressBarItem = {};
                                        progressBarItem[ProgressBar.OPTION_NAME.ITEM_ID] = "item1";
                                        progressBarItem[ProgressBar.OPTION_NAME.COLOR_ID] = ProgressBar.OPTION_VALUE.COLOR_ID.CUSTOM;
                                        progressBarItem.color = getColor(value.score, reportModel.scale.scaleRanges);
                                        progressBar.createItem(progressBarItem);
                                        progressBar.setPercent(prc);
                                    }

                                });

                                if ((reportModel.isCompare) && (reportModel.cWeakAreas)) {
                                    if (reportModel.cParticipantIds && reportModel.participantsId) {
                                        if (reportModel.cParticipantIds.length == 1 && reportModel.participantsId.length == 1) {
                                            if (reportModel.cParticipantIds[0].id == reportModel.participantsId[0].id && reportModel.mainProfileStepId == 4 && reportModel.profileStepId == 4) {
                                                var index = 0;
                                                reportModel.benchMarkWeakKpi = [];
                                                _.forEach($(".weakBox .GraphScoreBox h3"), function (weakItem) {
                                                    var weakKPI = $(weakItem).text();
                                                    var obj = _.find(reportModel.weakAreas, function (pgSkill) {
                                                        return pgSkill.name == weakKPI;
                                                    });
                                                    if (obj && $(".weakBox #PGF" + index).length > 0) {



                                                        console.log("benchmark Graph =" + obj.cScore + " reportModel.score = " + obj.score);
                                                        var comparestrongElemHtml = "";
                                                        //comparestrongElemHtml += "<h3 class='width80Perc'>" + obj.name + "</h3>";
                                                        var compareLegendPostfix = " (" + (!$scope.stageName || $scope.stageName == '' ? '' : $scope.stageName + ', ') + reportModel.cProfileTypeName + ")";

                                                        comparestrongElemHtml += "<h4 class='width80Perc'>" + reportModel.cLabel + compareLegendPostfix + "</h4>";
                                                        comparestrongElemHtml += "<div class='compareGraphLiProc GraphLiProc width80Perc FloatLeft'>";
                                                        comparestrongElemHtml += "<div id='PGFC" + index.toString() + "' class='benchmarkGraphLiProc GraphLiProc FloatLeft'></div>";
                                                        comparestrongElemHtml += "</div>";
                                                        comparestrongElemHtml += "<div class='compareGraphLiProc GraphLiProc width20Perc FloatLeft' style='margin-top:0px;' >";
                                                        comparestrongElemHtml += "<span class='mArLeft015'>" + obj.cScore.toString() + "</span>";
                                                        //comparestrongElemHtml += "<div style='clear:both;'>";
                                                        //comparestrongElemHtml += getKPIImage(value.score, value.score);
                                                        comparestrongElemHtml += "</div>";
                                                        comparestrongElemHtml += "";
                                                        //$(".weakBox").append(comparestrongElemHtml);
                                                        $(".weakBox #PGF" + index).parents(".GraphScoreBox").append(comparestrongElemHtml);

                                                        var diffPercentage = setDiffrencePercentage(obj.score, obj.cScore, reportModel.max);
                                                        var graphElemHtml = "";
                                                        if (obj.score > 0) {
                                                            if (obj.cScore > obj.score) {
                                                                graphElemHtml += "<img  class='mArLeft015' src='images/dashboard/top-arrow-green.png' style='width:auto;height:30px;float:left;margin-left: 5px;'>";
                                                            } else if (obj.score == obj.cScore) {
                                                                graphElemHtml += "<img class='mArLeft015' src='images/dashboard/min-icon-big.png' style='width:auto;height:30px;float:left;margin-left: 5px;'>";
                                                            } else {
                                                                graphElemHtml += "<img  class='mArLeft015' src='images/dashboard/botm-arrow-red.png' style='width:auto;height:30px;float:left;margin-left: 5px;'>";
                                                            }
                                                        }
                                                        graphElemHtml += diffPercentage;
                                                        $(".weakBox #PGFC" + index).parents(".GraphScoreBox").find(".compareGraphLiProc.width20Perc").append(graphElemHtml);
                                                        if ((obj.cScore > 0)) {
                                                            reportModel.benchMarkWeakKpi.push(obj.cScore);
                                                            prcc = percentage(reportModel.max, obj.cScore);
                                                            if ($("#PGFC" + index).length > 0) {
                                                                var progressBar;
                                                                progressBar = new ProgressBar("PGFC" + index.toString(), { 'width': '100%', 'height': '30px' });
                                                                var progressBarItem = {};
                                                                progressBarItem[ProgressBar.OPTION_NAME.ITEM_ID] = "item1";
                                                                progressBarItem[ProgressBar.OPTION_NAME.COLOR_ID] = ProgressBar.OPTION_VALUE.COLOR_ID.CUSTOM;
                                                                progressBarItem.color = getColor(obj.cScore, reportModel.scale.scaleRanges);
                                                                progressBar.createItem(progressBarItem);
                                                                progressBar.setPercent(prcc);
                                                            }
                                                        }
                                                        index++;
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
                                            var comparestrongElemHtml = "<div class='GraphScoreBox row'>";
                                            comparestrongElemHtml += "<h3 class='width80Perc'>" + value.name + "</h3>";
                                            comparestrongElemHtml += "<h4 class='width80Perc'>" + value.description + "</h4>";
                                            var compareLegendPostfix = " (" + (!$scope.stageName || $scope.stageName == '' ? '' : $scope.stageName + ', ') + reportModel.cProfileTypeName + ")";
                                            comparestrongElemHtml += "<h4 class='width80Perc'>" + reportModel.cLabel + compareLegendPostfix + "</h4>";
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
                                                if ($("#PGFC" + index).length > 0) {
                                                    var progressBar;
                                                    progressBar = new ProgressBar("PGFC" + index.toString(), { 'width': '100%', 'height': '30px' });
                                                    var progressBarItem = {};
                                                    progressBarItem[ProgressBar.OPTION_NAME.ITEM_ID] = "item1";
                                                    progressBarItem[ProgressBar.OPTION_NAME.COLOR_ID] = ProgressBar.OPTION_VALUE.COLOR_ID.CUSTOM;
                                                    progressBarItem.color = getColor(value.score, reportModel.scale.scaleRanges);
                                                    progressBar.createItem(progressBarItem);
                                                    progressBar.setPercent(prcc);
                                                }
                                            }
                                        });
                                    }
                                }
                            }
                            if (reportModel.cParticipantIds) {
                                if (reportModel.cParticipantIds.length == 1) {
                                    if (reportModel.cParticipantIds[0].id == -1) {
                                        var index = 0;
                                        reportModel.benchMarkWeakKpi = [];
                                        _.forEach($(".weakBox .GraphScoreBox h3"), function (weakItem) {
                                            var weakKPI = $(weakItem).text();
                                            _.forEach(reportModel.performanceGroups, function (performanceGroupItem) {
                                                var obj = _.find(performanceGroupItem.skills, function (pgSkill) {
                                                    return pgSkill.name == weakKPI;
                                                });
                                                if (obj && $(".weakBox #PGF" + index).length > 0) {
                                                    var diffPercentage = setDiffrencePercentage(obj.cScore, obj.score, reportModel.max);
                                                    var graphElemHtml = "";
                                                    if (obj.score > 0) {
                                                        if (obj.score > obj.cScore) {
                                                            graphElemHtml += "<img  class='mArLeft015' src='images/dashboard/top-arrow-green.png' style='width:auto;height:30px;float:left;margin-left: 5px;'>";
                                                        } else if (obj.score == obj.cScore) {
                                                            graphElemHtml += "<img class='mArLeft015' src='images/dashboard/min-icon-big.png' style='width:auto;height:30px;float:left;margin-left: 5px;'>";
                                                        } else {
                                                            graphElemHtml += "<img  class='mArLeft015' src='images/dashboard/botm-arrow-red.png' style='width:auto;height:30px;float:left;margin-left: 5px;'>";
                                                        }
                                                    }
                                                    graphElemHtml += diffPercentage;
                                                    $(".weakBox #PGF" + index).parents(".GraphScoreBox").find(".GraphLiProc.width20Perc").append(graphElemHtml);


                                                    console.log("benchmark Graph =" + obj.cScore + " reportModel.score = " + obj.score);
                                                    var comparestrongElemHtml = "";
                                                    //comparestrongElemHtml += "<h3 class='width80Perc'>" + obj.name + "</h3>";
                                                    var compareLegendPostfix = " (" + (!$scope.stageName || $scope.stageName == '' ? '' : $scope.stageName + ', ') + reportModel.cProfileTypeName + ")";
                                                    comparestrongElemHtml += "<h4 class='width80Perc'>" + reportModel.cLabel + compareLegendPostfix + "</h4>";
                                                    comparestrongElemHtml += "<div class='benchmarkGraphLiProc GraphLiProc width80Perc FloatLeft'>";
                                                    comparestrongElemHtml += "<div id='PGFC" + index.toString() + "' class='benchmarkGraphLiProc GraphLiProc FloatLeft'></div>";
                                                    comparestrongElemHtml += "</div>";
                                                    comparestrongElemHtml += "<div class='benchmarkGraphLiProc GraphLiProc width20Perc FloatLeft' style='margin-top:0px;' >";
                                                    comparestrongElemHtml += "<span class='mArLeft015'>" + obj.cScore.toString() + "</span>";
                                                    comparestrongElemHtml += "<div style='clear:both;'>";
                                                    //comparestrongElemHtml += getKPIImage(value.score, value.score);
                                                    comparestrongElemHtml += "</div>";
                                                    comparestrongElemHtml += "";
                                                    //$(".weakBox").append(comparestrongElemHtml);
                                                    $(".weakBox #PGF" + index).parents(".GraphScoreBox").append(comparestrongElemHtml);
                                                    if ((obj.cScore > 0)) {
                                                        reportModel.benchMarkWeakKpi.push(obj.cScore);
                                                        prcc = percentage(reportModel.max, obj.cScore);
                                                        if ($("#PGFC" + index).length > 0) {
                                                            var progressBar;
                                                            progressBar = new ProgressBar("PGFC" + index.toString(), { 'width': '100%', 'height': '30px' });
                                                            var progressBarItem = {};
                                                            progressBarItem[ProgressBar.OPTION_NAME.ITEM_ID] = "item1";
                                                            progressBarItem[ProgressBar.OPTION_NAME.COLOR_ID] = ProgressBar.OPTION_VALUE.COLOR_ID.CUSTOM;
                                                            progressBarItem.color = getColor(obj.cScore, reportModel.scale.scaleRanges);
                                                            progressBar.createItem(progressBarItem);
                                                            progressBar.setPercent(prcc);
                                                        }
                                                    }
                                                    index++;
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
                            }
                            else {
                                $($element).find("#gauge_total_weak").parents(".ScoreboxList").show();
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
                                        pointer: [
                                            {
                                                value: reportModel.strongAverageScore,
                                                color: gaugeSeriesColors.main,
                                            },
                                            {
                                                value: reportModel.benchmarkAvg,
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

                                        var totalScoreEl = '<span style="color: #000000; display: inline - block;"> VS  </span>';
                                        totalScoreEl += "<span style='color:" + gaugeSeriesColors.compare + "; display: inline-block;'>";
                                        totalScoreEl += parseFloat(benchMarkStrongKpiAvg).toFixed(1);
                                        totalScoreEl += '</span>';
                                        $($element).find("#gauge_total_strong_value").append(totalScoreEl);


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

                                        var imageElemHtml = getKPIImage(reportModel.cAverageScore, reportModel.averageScore)
                                        $("#kpiImageScore").html(imageElemHtml);

                                        if (reportModel.cStrongAverageScore != "NaN") {
                                            imageElemHtml = getKPIImage(reportModel.cStrongAverageScore, reportModel.strongAverageScore)
                                            $("#kpiImageStrong").html(imageElemHtml);
                                        }

                                        if (reportModel.cWeakAverageScore != "NaN") {
                                            imageElemHtml = getKPIImage(reportModel.cWeakAverageScore, reportModel.weakAverageScore)
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


                            if ($scope.ngReportData && $scope.ngReportData.projectsModel) {
                                angular.forEach($scope.ngReportData.projectsModel, function (project) {
                                    projectIds = projectIds + project.id + ';';
                                });
                            }

                            if ($scope.ngReportData && $scope.ngReportData.participantsId) {
                                angular.forEach($scope.ngReportData.participantsId, function (id) {
                                    mainParticipantIds = mainParticipantIds + id + ';';
                                });
                            }

                            if ($scope.ngReportData && $scope.ngReportData.evaluatorsProfileScorecards && $scope.ngReportData.evaluatorsProfileScorecards.length == 1) {
                                angular.forEach($scope.ngReportData.evaluatorsProfileScorecards[0].participantsId, function (id) {
                                    mainEvaluatorIds = mainEvaluatorIds + id + ';';
                                });
                            }
                            if ($scope.ngReportData && $scope.ngReportData.cParticipantIds) {
                                angular.forEach($scope.ngReportData.cParticipantIds, function (id) {
                                    participantIds = participantIds + id + ';';
                                });
                            }

                            if ($scope.ngReportData && $scope.ngReportData.cEvaluatorsProfileScorecards && $scope.ngReportData.cEvaluatorsProfileScorecards.length == 1) {
                                angular.forEach($scope.ngReportData.cEvaluatorsProfileScorecards[0].participantsId, function (id) {
                                    evaluatorIds = evaluatorIds + id + ';';
                                });
                            }

                            //organizationId: projectId: profileId: departmentId: teamId: mainParticipantIds: mainEvaluatorIds: mainStageId: mainProfileStepId: participantIds: evaluatorIds: stageId: profileTypeID: isShowBenchmark
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




                    }],
                link: function ($scope, element, attrs) {
                    $scope.$watch('ngReportData', function (newValue, oldValue) {
                        if (newValue) {
                            $scope.init(newValue);
                        }
                    }, false);
                }

            };
        }])
        .controller('dashboardManagmentFilterCtrl', ['$scope', 'performanceManagmentFilterService', 'profilesTypesEnum', 'softProfileTypesEnum',
            'ktProfileTypesEnum', 'dataTypesEnum', 'profileStatusEnum', '$location', 'dialogService', 'localStorageService', '$translate',
            function ($scope, performanceManagmentFilterService, profilesTypesEnum, softProfileTypesEnum,
                ktProfileTypesEnum, dataTypesEnum, profileStatusEnum, $location, dialogService, localStorageService, $translate) {

                function getMultiSelectOptions(data) {
                    var options = [];
                    _.forEach(data, function (item, index) {
                        if (item.isSelfEvaluation) {
                            options.push({ id: item.id, label: item.name, isSelfEvaluation: item.isSelfEvaluation });
                        }
                        else {
                            options.push({ id: item.id, label: item.name });
                        }
                    });
                    return options;
                }

                $scope.profilesTypesEnum = profilesTypesEnum;

                $scope.ktProfileTypes = {
                    start: { id: 1, label: $translate.instant('COMMON_START_STAGE') },
                    final: { id: 2, label: $translate.instant('COMMON_FINAL_STAGE') }
                };

                var clearProfiles = function () {
                    $scope.profiles = [];
                    $scope.filter.profileId = null;
                };

                var clearProjects = function () {
                    $scope.projects = [];
                    $scope.projectsOptions = [];
                    $scope.filter.projectsModel = [];
                }
                var clearParticipants = function () {
                    $scope.participants = [];
                    $scope.filter.mainParticipantsOptions = [];
                    $scope.filter.mainParticipantsModel = [];
                    $scope.filter.participantsOptions = [];
                    $scope.filter.participantsModel = [];

                    $scope.mainEvolutionStageModel = [];
                    $scope.evolutionStageModel = [];
                };
                var clearEvaluators = function () {
                    $scope.filter.mainEvaluatorsModel = [];
                    $scope.filter.evaluatorsModel = [];
                    $scope.filter.mainEvaluatorsOptions = [];
                    $scope.filter.evaluatorsOptions = [];
                };
                var clearStages = function () {
                    $scope.filter.mainStageId = '';
                    $scope.filter.stageId = '';
                    $scope.mainStages = [];
                    $scope.stages = [];

                    $scope.filter.mainEvolutionStageId = 0;
                    $scope.filter.evolutionStageId = 0;
                    $scope.mainEvolutionStages = [{ id: 0, name: $translate.instant('DASHBOARD_VELG_EVOLUSJON_STAGE') }];
                    $scope.evolutionStages = [{ id: 0, name: $translate.instant('DASHBOARD_VELG_EVOLUSJON_STAGE') }];
                };
                var clearStageGroups = function () {
                    $scope.filter.profileStageGroups = [];
                }
                var clearProfileSteps = function () {
                    $scope.filter.mainProfileStepId = null;
                    $scope.filter.profileStepId = null;
                    $scope.filter.mainStepsOfProfile = [];
                    $scope.filter.stepsOfProfile = [];
                };

                var updateStages = function (stages) {
                    $scope.mainStages = [];
                    $scope.stages = [];

                    $scope.mainStagesRaw = [];
                    $scope.stagesRaw = [];

                    _.forEach(stages, function (item, index) {
                        if (index == 0) {
                            $scope.firstStageId = item.id;
                        }
                        $scope.mainStages.push({ id: item.id, name: item.name + " (" + item.statusText + ")" });
                        $scope.stages.push({ id: item.id, name: item.name + " (" + item.statusText + ")" });

                        $scope.mainStagesRaw.push({ id: item.id, name: item.name });
                        $scope.stagesRaw.push({ id: item.id, name: item.name });
                    });

                    if ($scope.mainStages.length > 0) {
                        $scope.filter.mainStageId = $scope.mainStages[0].id;
                        $scope.filter.mainStageName = $scope.mainStagesRaw[0].name;
                        getProfileTypes(dataTypesEnum.main, $scope.filter.mainStageId, $scope.mainStages);
                    } else {
                        $scope.filter.mainStageId = null;
                        $scope.filter.mainStageName = '';
                    }
                    if ($scope.stages.length > 0) {
                        $scope.filter.stageId = $scope.stages[0].id;
                        $scope.filter.stageName = $scope.stagesRaw[0].name;
                        getProfileTypes(dataTypesEnum.compare, $scope.filter.stageId, $scope.stages);
                    } else {
                        $scope.filter.stageId = null;
                        $scope.filter.stageName = '';
                    }
                }
                var getFilteredData = function () {

                    if ($scope.filter.mainParticipantsModel && $scope.filter.mainParticipantsModel.length > 0) {
                        $scope.filter.isLoadReport = true;
                    }
                    $scope.$emit('filterChanged', 'true');
                };


                function getFilteredComparisonData() {
                    if ($scope.filter.participantsModel && $scope.filter.participantsModel.length > 0) {
                        $scope.filter.isLoadCompareReport = true;
                    }
                    $scope.$emit('filterChanged', 'true');
                };
                function getKendoMultiSelectAllModel(options) {
                    var model = [];
                    _.forEach(options, function (option) {
                        model.push({ id: option.id });
                    });
                    return model
                }

                $scope.profileTypes = [{ id: 0, name: "All" }];
                _.forEach(_.keys(profilesTypesEnum), function (item) {
                    var ProfileTypeName = item;
                    if (item == "soft") {
                        ProfileTypeName = $translate.instant('COMMON_SOFT_PROFILE')   // "Soft Profile"
                    }
                    else if (item == "knowledgetest") {
                        ProfileTypeName = $translate.instant('LEFTMENU_KNOWLEDGE_PROFILE') //"Knowledge Profile"
                    }
                    $scope.profileTypes.push({ id: profilesTypesEnum[item], name: ProfileTypeName });
                })

                $scope.profileStatusOptions = [{ id: '', name: "Any" }]
                _.forEach(_.keys(profileStatusEnum), function (item) {
                    var ProfileTypeName = item;
                    if (item == "Active") {
                        ProfileTypeName = $translate.instant('DASHBOARD_ACTIVE_PROFILE')
                    }
                    else if (item == "Inactive") {
                        ProfileTypeName = $translate.instant('DASHBOARD_INACTIVE_PROFILE')
                    }
                    $scope.profileStatusOptions.push({ id: profileStatusEnum[item], name: ProfileTypeName });
                })
                $scope.filter.profileTypeId = 0;
                $scope.profileTypeChanged = function () {
                    clearProfiles();
                    clearParticipants();
                    clearStageGroups();
                    clearStages();
                    clearProfileSteps()
                    if ($scope.filter.profileTypeId == profilesTypesEnum.soft) {
                        clearEvaluators();
                    }
                    if ($scope.filter.organizationId) {
                        performanceManagmentFilterService.getProfiles($scope.filter.organizationId, "", $scope.filter.profileStatus).then(function (data) {
                            if (data) {
                                $scope.profiles = _.filter(data, function (item) {
                                    if ($scope.filter.profileTypeId > 0) {
                                        return item.profileTypeId == $scope.filter.profileTypeId
                                    }
                                    else {
                                        return item;
                                    }
                                });
                                console.log($scope.profiles.length);


                            }
                            else {
                                $scope.profiles = [];
                            }
                        });
                        performanceManagmentFilterService.getDepartments($scope.filter.organizationId).then(function (data) {
                            if (data) {
                                $scope.departments = data;
                                $scope.departmentsOptions = getMultiSelectOptions($scope.departments);
                            }
                        });
                        performanceManagmentFilterService.getTeams($scope.filter.organizationId, $scope.filter.departmentsModel).then(function (data) {
                            if (data) {
                                $scope.teams = data;
                                $scope.teamsOptions = getMultiSelectOptions($scope.teams);
                            }
                        });
                    }
                    $scope.filter.isLoadReport = false;
                    $scope.filter.isLoadCompareReport = false;
                    $scope.$emit('filterChanged', 'false');
                };

                $scope.filter.profileStatus = '';
                $scope.profileStatusChanged = function () {
                    //clearProfiles();
                    clearParticipants();
                    clearStageGroups();
                    clearStages();
                    clearProfileSteps()
                    if ($scope.filter.profileTypeId == profilesTypesEnum.soft) {
                        clearEvaluators();
                    }


                    performanceManagmentFilterService.getProfiles($scope.filter.organizationId, "", $scope.filter.profileStatus).then(function (data) {
                        if (data) {

                            if ($scope.filter.projectsModel.length > 0) {
                                data = _.filter(data, function (item) {
                                    var isFiltered = _.filter($scope.filter.projectsModel, function (projectItem) {
                                        return projectItem.id == item.projectId;
                                    })
                                    if (isFiltered.length > 0) {
                                        return true;
                                    }
                                    else {
                                        return false;
                                    }
                                });
                            }
                            $scope.profiles = _.filter(data, function (item) {
                                if ($scope.filter.profileTypeId > 0) {
                                    return item.profileTypeId == $scope.filter.profileTypeId
                                }
                                else {
                                    return item;
                                }
                            });

                            //$scope.profiles = _.filter($scope.profiles, function (item) {
                            //    if ($scope.filter.profileStatus != '') {
                            //        return item.isActive == $scope.filter.profileStatus
                            //    }
                            //    else {
                            //        return item;
                            //    }
                            //});
                        }
                        else {
                            $scope.profiles = [];
                        }
                    });



                    console.log($scope.profiles.length);
                    $scope.filter.isLoadReport = false;
                    $scope.filter.isLoadCompareReport = false;
                    $scope.$emit('filterChanged', 'false');
                };

                $scope.organizations = [];
                $scope.organizationChanged = function () {
                    clearProjects();
                    clearProfiles();
                    clearParticipants();
                    clearStageGroups();
                    clearStages();
                    clearProfileSteps()
                    if ($scope.filter.profileType == profilesTypesEnum.soft) {
                        clearEvaluators();
                    }

                    $scope.filter.isLoadReport = false;
                    $scope.filter.isLoadCompareReport = false;
                    $scope.$emit('filterChanged', 'false');

                    if ($scope.filter.organizationId) {

                        performanceManagmentFilterService.getProjects().then(function (data) {
                            $scope.projects = _.filter(data, function (item) {
                                return item.organizationId == $scope.filter.organizationId;
                            });
                            _.forEach($scope.projects, function (item) {
                                $scope.projectsOptions.push({ id: item.id, label: item.name });
                            });
                        });

                        performanceManagmentFilterService.getProfiles($scope.filter.organizationId, "", $scope.filter.profileStatus).then(function (data) {
                            if (data) {
                                $scope.profiles = _.filter(data, function (item) {
                                    if ($scope.filter.profileTypeId > 0) {
                                        return item.profileTypeId == $scope.filter.profileTypeId
                                    }
                                    else {
                                        return item;
                                    }
                                });
                            }
                            else {
                                $scope.profiles = [];
                            }
                        });
                        performanceManagmentFilterService.getDepartments($scope.filter.organizationId).then(function (data) {
                            if (data) {
                                $scope.departments = data;
                                $scope.departmentsOptions = getMultiSelectOptions($scope.departments);
                            }
                        });
                        performanceManagmentFilterService.getTeams($scope.filter.organizationId, $scope.filter.departmentsModel).then(function (data) {
                            if (data) {
                                $scope.teams = data;
                                $scope.teamsOptions = getMultiSelectOptions($scope.teams);
                            }
                        });
                    }
                };


                $scope.projects = [];
                $scope.projectsOptions = [];
                $scope.projectsCustomTexts = { buttonDefaultText: $translate.instant('DASHBOARD_SELECT_PROJECTS') };
                $scope.projectsEvents = {
                    onItemSelect: function (item) {
                        projectChanged();
                    },
                    onItemDeselect: function (item) {
                        projectChanged();
                    },
                    onSelectAll: function () {
                        $scope.filter.projectsModel = getKendoMultiSelectAllModel($scope.projectsOptions);
                        projectChanged();
                    },
                    onDeselectAll: function () {
                        $scope.filter.projectsModel = [];
                        projectChanged();
                    }
                };
                var projectChanged = function () {
                    clearProfiles();
                    clearParticipants();
                    clearStageGroups();
                    clearStages();
                    clearProfileSteps()

                    $scope.filter.isLoadReport = false;
                    $scope.filter.isLoadCompareReport = false;
                    $scope.$emit('filterChanged', 'false');
                    if ($scope.filter.projectsModel.length > 0) {
                        performanceManagmentFilterService.getProjectProfiles($scope.filter.projectsModel, $scope.filter.profileStatus).then(function (data) {
                            $scope.profiles = data;
                        });
                    }
                    else if ($scope.filter.organizationId) {
                        performanceManagmentFilterService.getProfiles($scope.filter.organizationId, "", $scope.filter.profileStatus).then(function (data) {
                            if (data) {
                                //$scope.profiles = data;

                                $scope.profiles = _.filter(data, function (item) {
                                    var isFiltered = _.filter($scope.filter.projectsModel, function (projectItem) {
                                        return projectItem.id == item.projectId;
                                    })
                                    if (isFiltered.length > 0) {
                                        return true;
                                    }
                                    else {
                                        return false;
                                    }
                                });

                            }
                            else {
                                $scope.profiles = [];
                            }
                        });
                    }
                    else {
                        $scope.profiles = [];
                    }

                    //if ($scope.filter.profileId != null) {
                    //    if ($scope.filter.profileId)

                    //    //getParticipants();
                    //}
                };


                $scope.departments = [];
                $scope.departmentsOptions;
                $scope.departmentsEvents = {
                    onItemSelect: function (item) {
                        departmentChanged(item);
                    },
                    onItemDeselect: function (item) {
                        departmentChanged(item);
                    },
                    onSelectAll: function () {
                        $scope.filter.departmentsModel = getKendoMultiSelectAllModel($scope.departmentsOptions);
                        departmentChanged();
                    },
                    onDeselectAll: function () {
                        $scope.filter.departmentsModel = [];
                        departmentChanged();
                    }
                };
                $scope.departmentsCustomTexts = { buttonDefaultText: $translate.instant('TRAININGDAIRY_SELECT_DEPARTMENT') };
                var departmentChanged = function () {
                    if ($scope.filter.organizationId) {
                        performanceManagmentFilterService.getTeams($scope.filter.organizationId, $scope.filter.departmentsModel).then(function (data) {
                            if (data) {
                                $scope.teams = data;
                                $scope.teamsOptions = getMultiSelectOptions($scope.teams);
                            }
                        });
                        if ($scope.filter.profileId) {
                            getParticipants();
                        }
                    }
                };


                $scope.teams = [];
                $scope.teamsOptions;
                $scope.teamsEvents = {
                    onItemSelect: function (item) {
                        teamChanged();
                    },
                    onItemDeselect: function (item) {
                        teamChanged();
                    },
                    onSelectAll: function () {
                        $scope.filter.teamsModel = getKendoMultiSelectAllModel($scope.teamsOptions);
                        teamChanged();
                    },
                    onDeselectAll: function () {
                        $scope.filter.teamsModel = [];
                        teamChanged();
                    }
                };
                $scope.teamsCustomTexts = { buttonDefaultText: $translate.instant('TRAININGDAIRY_SELECT_TEAM') };
                var teamChanged = function () {
                    if ($scope.filter.profileId != null) {
                        getParticipants();
                    }
                };


                $scope.profiles = [];
                $scope.profileChanged = function () {
                    clearParticipants();
                    clearStages();
                    clearProfileSteps()
                    if ($scope.filter.profileType == profilesTypesEnum.soft) {
                        clearEvaluators();
                    }
                    performanceManagmentFilterService.getProfileType($scope.filter.profileId).then(function (data) {
                        $scope.filter.profileType = data;
                    });
                    performanceManagmentFilterService.getProfileStageGroups($scope.filter.profileId).then(function (data) {
                        $scope.filter.profileStageGroups = data;
                        if (data.length > 0) {
                            $scope.filter.profileStageGroupId = data[0].id;
                            getParticipants();
                        }
                    });

                    $scope.filter.isLoadReport = false;
                    $scope.filter.isLoadCompareReport = false;
                    $scope.$emit('filterChanged', 'false');
                };


                $scope.participants = [];
                function getParticipants() {
                    performanceManagmentFilterService.getProfileStages($scope.filter.profileId, null, false, $scope.filter.profileStageGroupId).then(function (data) {
                        updateStages(data);
                        performanceManagmentFilterService.getParticipantsBy($scope.filter.profileId, $scope.filter.stageId, $scope.filter.projectsModel,
                            $scope.filter.departmentsModel, $scope.filter.teamsModel, $scope.filter.profileStageGroupId).then(function (data) {

                                $scope.participants = [];
                                $scope.filter.mainParticipantsModel = [];
                                $scope.filter.participantsModel = [];

                                //$scope.evaluators = [];
                                //$scope.evaluatorsOptions = [];
                                //$scope.filter.mainEvaluatorsModel = [];
                                //$scope.filter.evaluatorsModel = [];

                                //$scope.isEvaluatorsEnabled = false;

                                _.forEach(data, function (item) {
                                    $scope.participants.push({ id: item.participantId, name: item.firstName + " " + item.lastName, isSelfEvaluation: item.isSelfEvaluation });
                                });

                                if ($scope.participants.length > 0) {
                                    $scope.participants.splice(0, 0, {
                                        id: -1, name: $translate.instant('SCORECARD_BENCHMARK')
                                    });
                                    $scope.filter.mainParticipantsOptions = getMultiSelectOptions($scope.participants);
                                    $scope.filter.participantsOptions = getMultiSelectOptions($scope.participants);
                                }
                            });
                    });
                }
                function getEvaluatorsOfParticipant(type) {
                    var usersSource;

                    if (type === dataTypesEnum.main) {
                        usersSource = $scope.filter.mainParticipantsModel;
                    } else {
                        usersSource = $scope.filter.participantsModel;
                    }

                    //more than 1 main Participant - compare participant selected - SWITCH OFF evaluators
                    if (usersSource.length > 1) {
                        //$scope.filter.isMainEvaluatorsEnabled = false;

                        if (type === dataTypesEnum.main) {
                            $scope.filter.isMainEvaluatorsEnabled = false;
                            $scope.filter.mainEvaluatorsModel = [];
                            $scope.filter.mainEvaluators = [];
                            $scope.mainEvaluators = [];

                            if ($scope.filter.mainProfileStepId && $scope.filter.mainProfileStepId > 0) {
                                getFilteredData();
                            }
                        }
                        else {
                            $scope.filter.isEvaluatorsEnabled = false;
                            $scope.filter.evaluatorsModel = [];
                            $scope.evaluators = [];

                            if ($scope.filter.profileStepId && $scope.filter.profileStepId > 0) {
                                getFilteredData();
                            }
                        }
                    } else {
                        performanceManagmentFilterService.getEvaluatorsForParticipant($scope.filter.profileId, usersSource).then(function (data) {
                            if (type === dataTypesEnum.main) {
                                $scope.mainEvaluators = [];
                                $scope.filter.mainEvaluatorsOptions = [];
                                $scope.filter.mainEvaluatorsModel = [];
                            } else {
                                $scope.evaluators = [];
                                $scope.filter.evaluatorsOptions = [];
                                $scope.filter.evaluatorsModel = [];
                            }
                            _.forEach(data, function (evaluator) {
                                if (type === dataTypesEnum.main) {
                                    $scope.mainEvaluators.push({ id: evaluator.participantId, name: evaluator.firstName + " " + evaluator.lastName, isSelfEvaluation: evaluator.isSelfEvaluation, IsScoreManager: evaluator.isScoreManager });
                                    $scope.filter.mainEvaluatorsOptions = getMultiSelectOptions($scope.mainEvaluators);
                                } else {
                                    $scope.evaluators.push({ id: evaluator.participantId, name: evaluator.firstName + " " + evaluator.lastName, isSelfEvaluation: evaluator.isSelfEvaluation, IsScoreManager: evaluator.isScoreManager });
                                    $scope.filter.evaluatorsOptions = getMultiSelectOptions($scope.evaluators);
                                }
                            });
                            if (type === dataTypesEnum.main) {
                                if ($scope.mainEvaluators.length > 0) {
                                    $scope.isMainEvaluatorsEnabled = true;
                                    //if ($scope.filter.mainProfileStepId == softProfileTypesEnum.finalProfile.id || $scope.filter.mainProfileStepId == softProfileTypesEnum.finalKpi.id) {
                                    //$scope.isMainEvaluatorsEnabled = false;
                                    var finalScoremanger = _.find($scope.mainEvaluators, function (evaluatorItem) {
                                        return evaluatorItem.IsScoreManager == true;
                                    })
                                    if (finalScoremanger) {
                                        $scope.filter.mainEvaluatorsModel = [{ id: finalScoremanger.id }];
                                    }
                                    //}
                                }
                                if ($scope.filter.mainProfileStepId && $scope.filter.mainProfileStepId > 0) {
                                    getFilteredData();
                                }
                            }
                            else {
                                if ($scope.evaluators.length > 0) {
                                    $scope.isEvaluatorsEnabled = true;
                                    //if ($scope.filter.profileStepId == softProfileTypesEnum.finalProfile.id || $scope.filter.profileStepId == softProfileTypesEnum.finalKpi.id) {
                                    //$scope.isEvaluatorsEnabled = false;
                                    var finalScoremanger = _.find($scope.evaluators, function (evaluatorItem) {
                                        return evaluatorItem.IsScoreManager == true;
                                    });
                                    if (finalScoremanger) {
                                        $scope.filter.evaluatorsModel = [{ id: finalScoremanger.id }];
                                    }
                                    //}
                                }
                                if ($scope.filter.profileStepId && $scope.filter.profileStepId > 0) {
                                    getFilteredData();
                                }
                            }
                        });
                    }
                };


                $scope.mainParticipantsCustomTexts = { buttonDefaultText: $translate.instant('DASHBOARD_SELECT_MAIN_PARTICIPANTS') };
                $scope.filter.mainParticipantsOptions = [];
                $scope.mainParticipantsEvents = {
                    onItemSelect: function (item) {
                        mainParticipantsChanged();
                    },
                    onItemDeselect: function (item) {
                        mainParticipantsChanged();
                    },
                    onSelectAll: function () {
                        $scope.filter.mainParticipantsModel = getKendoMultiSelectAllModel($scope.filter.mainParticipantsOptions);
                        mainParticipantsChanged();
                    },
                    onDeselectAll: function () {
                        $scope.filter.mainParticipantsModel = [];
                        $scope.filter.participantsModel = [];
                        $scope.filter.mainEvaluatorsOptions = [];
                        $scope.filter.mainEvaluatorsModel = [];
                        $scope.isMainEvaluatorsEnabled = false;
                        mainParticipantsChanged();
                    }
                };
                var mainParticipantsChanged = function () {
                    if (!$scope.filter.mainParticipantsModel || $scope.filter.mainParticipantsModel.length == 0) {
                        $scope.filter.participantsModel = [];
                        $scope.mainEvolutionStages = [{ id: 0, name: $translate.instant('DASHBOARD_SELECT_EVOLUTION_STAGE') }];
                        $scope.filter.mainEvaluatorsOptions = [];
                        $scope.isMainEvaluatorsEnabled = false;
                        $scope.filter.mainEvolutionStageId = 0;
                        $scope.filter.isLoadReport = false;
                        $scope.filter.isLoadCompareReport = false;
                        $scope.$emit('filterChanged', 'false');
                        return;
                    }
                    else {
                        if ($scope.filter.profileType == profilesTypesEnum.soft) {
                            return getEvaluatorsOfParticipant(dataTypesEnum.main);
                        }
                        else {
                            getEvolutionStages($scope.filter.mainStageId, $scope.filter.mainParticipantsModel[0].id, dataTypesEnum.main);
                        }
                        getFilteredData();
                    }
                };


                //$scope.filter.mainEvaluatorsOptions = [];
                //$scope.isMainEvaluatorsEnabled = false;
                $scope.mainEvaluatorsCustomTexts = { buttonDefaultText: $translate.instant('DASHBOARD_SELECT_MAIN_EVALUATORS') };
                $scope.mainEvaluatorsEvents = {
                    onItemSelect: function (item) {
                        mainEvaluatorsChanged();
                    },
                    onItemDeselect: function (item) {
                        mainEvaluatorsChanged();
                    },
                    onSelectAll: function () {
                        $scope.filter.mainEvaluatorsModel = getKendoMultiSelectAllModel($scope.filter.mainEvaluatorsOptions);
                        mainEvaluatorsChanged();
                    },
                    onDeselectAll: function () {
                        $scope.filter.mainEvaluatorsModel = [];
                        mainEvaluatorsChanged();
                    }
                };
                var mainEvaluatorsChanged = function () {
                    if ($scope.filter.mainProfileStepId && $scope.filter.mainProfileStepId > 0) {
                        getFilteredData();
                    }
                };


                $scope.mainStages = [];
                $scope.mainStageChanged = function () {
                    $scope.filter.mainStageName = _.find($scope.mainStagesRaw, function (stageRaw) { return stageRaw.id == $scope.filter.mainStageId; }).name;
                    getProfileTypes(dataTypesEnum.main, $scope.filter.mainStageId, $scope.mainStages);
                    if ($scope.filter.mainParticipantsModel.length > 0) {
                        if ($scope.filter.profileType == profilesTypesEnum.knowledgetest) {
                            getEvolutionStages($scope.filter.mainStageId, $scope.filter.mainParticipantsModel[0].id);
                        }
                    }
                };
                $scope.mainEvolutionStagesChanged = function () {
                    getFilteredData();
                }

                $scope.filter.mainStepsOfProfile = [];
                function getDefaultSoftProfileTypes() {
                    var types = [];
                    types.push(softProfileTypesEnum.startProfile);
                    types.push(softProfileTypesEnum.finalProfile);
                    types.push(softProfileTypesEnum.initialKPI);
                    types.push(softProfileTypesEnum.finalKpi);
                    return types;
                };
                function getDefaultKTProfileTypes() {
                    var types = [];
                    types.push($scope.ktProfileTypes.start);
                    types.push($scope.ktProfileTypes.final);
                    return types;
                }
                $scope.mainProfileStepChanged = function () {
                    $scope.filter.mainEvaluatorsModel = [];
                    //if ($scope.filter.mainProfileStepId == softProfileTypesEnum.finalProfile.id || $scope.filter.mainProfileStepId == softProfileTypesEnum.finalKpi.id) {
                    if ($scope.filter.mainEvaluatorsOptions.length > 0) {
                        //$scope.filter.mainEvaluatorsModel = [{ id: $scope.filter.mainEvaluatorsOptions[0].id }];
                        var finalScoremanger = _.find($scope.mainEvaluators, function (evaluatorItem) {
                            return evaluatorItem.IsScoreManager == true;
                        });
                        if (finalScoremanger) {
                            $scope.filter.mainEvaluatorsModel = [{ id: finalScoremanger.id }];
                        }
                    }
                    //$scope.filter.mainEvaluatorsModel = [];
                    //$scope.isMainEvaluatorsEnabled = false;
                    //}
                    //else {
                    //    $scope.isMainEvaluatorsEnabled = true;
                    //}
                    $scope.isMainEvaluatorsEnabled = true;
                    getFilteredData();
                };


                $scope.filter.participantsOptions = [];
                $scope.participantsCustomTexts = { buttonDefaultText: $translate.instant('DASHBOARD_SELECT_PARTICIPANTS') };
                $scope.participantsEvents = {
                    onItemSelect: function (item) {
                        participantChanged(item);
                    },
                    onItemDeselect: function (item) {
                        participantChanged(item);
                    },
                    onSelectAll: function () {
                        $scope.filter.participantsModel = getKendoMultiSelectAllModel($scope.filter.participantsOptions);
                        participantChanged();
                    },
                    onDeselectAll: function () {
                        $scope.filter.participantsModel = [];
                        $scope.filter.evaluatorsOptions = [];
                        $scope.filter.evaluatorsModel = [];
                        $scope.isEvaluatorsEnabled = false;
                        $scope.filter.isLoadCompareReport = false;
                        $scope.$emit('filterChanged', 'false');
                    }
                };
                var participantChanged = function () {
                    if (!$scope.filter.participantsModel || $scope.filter.participantsModel.length == 0) {
                        $scope.filter.isLoadCompareReport = true;
                        $scope.filter.evaluatorsOptions = [];
                        $scope.filter.evaluatorsModel = [];
                        $scope.isEvaluatorsEnabled = false;
                        $scope.evolutionStages = [{ id: 0, name: $translate.instant('DASHBOARD_SELECT_EVOLUTION_STAGE') }];
                        $scope.filter.evolutionStageId = 0;
                        $scope.$emit('filterChanged', 'false');

                        return;
                    }
                    else if ($scope.filter.profileType == profilesTypesEnum.soft) {
                        getEvaluatorsOfParticipant(dataTypesEnum.compare);
                    }
                    else if ($scope.filter.participantsModel && $scope.filter.participantsModel.length != 0) {
                        getFilteredComparisonData();
                        getEvolutionStages($scope.filter.stageId, $scope.filter.participantsModel[0].id, dataTypesEnum.compare);
                    }
                };


                $scope.filter.evaluatorsOptions = [];
                $scope.evaluatorsCustomTexts = { buttonDefaultText: $translate.instant('MYPROFILES_SELECT_EVALUATORS') };
                $scope.evaluatorsEvents = {
                    onItemSelect: function (item) {
                        evaluatorsChanged();
                    },
                    onItemDeselect: function (item) {
                        evaluatorsChanged();
                    },
                    onSelectAll: function () {
                        $scope.filter.evaluatorsModel = getKendoMultiSelectAllModel($scope.filter.evaluatorsOptions);
                        evaluatorsChanged();
                    },
                    onDeselectAll: function () {
                        $scope.filter.evaluatorsModel = [];
                        evaluatorsChanged();
                    }
                };
                var evaluatorsChanged = function () {
                    if ($scope.filter.profileStepId > 0) {
                        getFilteredData();
                    }
                };


                $scope.stages = [];
                $scope.stageChanged = function () {
                    $scope.filter.stageName = _.find($scope.stagesRaw, function (stageRaw) { return stageRaw.id == $scope.filter.stageId; }).name;
                    getProfileTypes(dataTypesEnum.compare, $scope.filter.stageId, $scope.stages);
                    if ($scope.filter.participantsModel.length > 0) {

                        if ($scope.filter.profileType == profilesTypesEnum.knowledgetest) {
                            getEvolutionStages($scope.filter.stageId, $scope.filter.participantsModel[0].id, dataTypesEnum.compare);
                        }
                    }


                }

                var evolutionStagesChanged =
                    $scope.evolutionStagesChanged = function () {
                        getFilteredData();
                    };

                $scope.filter.stepsOfProfile = [];
                $scope.profileStepChanged = function () {
                    $scope.filter.evaluatorsModel = [];
                    //if ($scope.filter.mainProfileStepId == softProfileTypesEnum.finalProfile.id || $scope.filter.mainProfileStepId == softProfileTypesEnum.finalKpi.id) {
                    if ($scope.filter.evaluatorsOptions.length > 0) {
                        //$scope.filter.evaluatorsModel = [{ id: $scope.filter.evaluatorsModel[0].id }];
                        var finalScoremanger = _.find($scope.evaluators, function (evaluatorItem) {
                            return evaluatorItem.IsScoreManager == true;
                        });
                        if (finalScoremanger) {
                            $scope.filter.evaluatorsModel = [{ id: finalScoremanger.id }];
                        }
                    }
                    //$scope.filter.mainEvaluatorsModel = [];
                    //$scope.isMainEvaluatorsEnabled = false;
                    //}

                    if ($scope.filter.profileStepId == softProfileTypesEnum.finalProfile.id || $scope.filter.profileStepId == softProfileTypesEnum.finalKpi.id) {
                        //$scope.filter.evaluatorsModel = [];
                        //$scope.isEvaluatorsEnabled = false;
                    }
                    if ($scope.filter.profileType == profilesTypesEnum.knowledgetest) {
                        getFilteredComparisonData();
                    }
                    else {
                        getFilteredData();
                    }
                };

                var getProfileTypes = function (type, selectedStageId, optionsSource) {
                    if ($scope.filter.profileType == $scope.profilesTypesEnum.soft) {
                        var source = [];
                        if (selectedStageId === $scope.firstStageId) {
                            source = getDefaultSoftProfileTypes();
                            if (type === dataTypesEnum.main) {
                                $scope.filter.mainProfileStepId = softProfileTypesEnum.finalKpi.id;
                            }
                            else {
                                $scope.filter.profileStepId = softProfileTypesEnum.finalKpi.id;
                            }
                        }
                        else {
                            source.push(softProfileTypesEnum.initialKPIScores);
                            source.push(softProfileTypesEnum.finalKPIResults);
                        }
                        if (type === dataTypesEnum.main) {
                            $scope.filter.mainStepsOfProfile = source;
                            $scope.filter.mainProfileStepId = softProfileTypesEnum.finalKpi.id;
                        }
                        else {
                            $scope.filter.stepsOfProfile = source;
                            $scope.filter.profileStepId = softProfileTypesEnum.finalKpi.id;
                        }
                    }
                    else {
                        if (type === dataTypesEnum.main) {
                            $scope.filter.mainStepsOfProfile = getDefaultKTProfileTypes();
                            $scope.filter.mainProfileStepId = $scope.ktProfileTypes.start.id;
                        }
                        else {
                            $scope.filter.stepsOfProfile = getDefaultKTProfileTypes();
                            $scope.filter.profileStepId = $scope.ktProfileTypes.start.id;
                        }
                    }
                    if (type === dataTypesEnum.main) {
                        $scope.mainProfileStepChanged();
                    }
                    else {
                        $scope.profileStepChanged();
                    }
                }

                $scope.mainEvolutionStages = [{ id: 0, name: $translate.instant('DASHBOARD_SELECT_EVOLUTION_STAGE') }];
                $scope.evolutionStages = [{ id: 0, name: $translate.instant('DASHBOARD_SELECT_EVOLUTION_STAGE') }];
                function getEvolutionStages(originalStageId, participantId, type) {
                    if (!(participantId)) {
                        participantId = 0;
                    }
                    if (type == dataTypesEnum.main) {
                        $scope.mainEvolutionStages = [{ id: 0, name: $translate.instant('DASHBOARD_SELECT_EVOLUTION_STAGE') }];
                    }
                    else if (type == dataTypesEnum.compare) {
                        $scope.evolutionStages = [{ id: 0, name: $translate.instant('DASHBOARD_SELECT_EVOLUTION_STAGE') }];
                    }

                    performanceManagmentFilterService.getEvolutionStages(originalStageId, participantId).then(function (data) {
                        _.forEach(data, function (item, index) {
                            if (type == dataTypesEnum.main) {
                                $scope.mainEvolutionStages.push({ id: item.stageEvolutionId, name: item.name });
                            }
                            else if (type == dataTypesEnum.compare) {
                                $scope.evolutionStages.push({ id: item.stageEvolutionId, name: item.name });
                            }
                        });

                    });
                }


                function goToDevContract(participantModel, evaluatorModel, isStartStage, stageId) {
                    var participantId = 0;
                    if (participantModel) {
                        participantId = participantModel.id;
                    }
                    var evalId = 0;
                    if (evaluatorModel) {
                        evalId = evaluatorModel.id;
                    }
                    if ($scope.filter.profileType == profilesTypesEnum.soft) {

                        localStorageService.set('perfomanceManagementFilterData', $scope.filter);
                        $location.path('home/previewFinalKPI/' + $scope.filter.profileId + '/' + stageId +
                            '/' + evalId + '/' + participantId + '/devContract');
                    }
                    else {
                        if (!isStartStage) {
                            performanceManagmentFilterService.getKTLastStageEvolutionId($scope.filter.profileId, participantId, stageId).then(function (stageEvolutionId) {
                                stageId = stageEvolutionId ? null : stageId;
                                performanceManagmentFilterService.kTStageHasDevContaract($scope.filter.profileId, stageId, stageEvolutionId, participantId).then(function (hasDevContract) {
                                    if (hasDevContract) {
                                        localStorageService.set('perfomanceManagementFilterData', $scope.filter);
                                        $location.path('home/kt_final_kpi/' + $scope.filter.profileId + '/' + stageId +
                                            '/' + participantId + '/' + stageEvolutionId + '/devContract');
                                    }
                                    else {
                                        dialogService.showNotification($translate.instant('DASHBOARD_STAGE_DOES_NOT_HAVE_DEVELOPMENT_CONTRACT'), $translate.instant('COMMON_WARNING'));
                                    }
                                });
                            });
                        }
                        else {
                            performanceManagmentFilterService.kTStageHasDevContaract($scope.filter.profileId, stageId, null, participantId).then(function (hasDevContract) {
                                if (hasDevContract) {
                                    localStorageService.set('perfomanceManagementFilterData', $scope.filter);
                                    $location.path('home/kt_final_kpi/' + $scope.filter.profileId + '/' + stageId +
                                        '/' + participantId + '/null/devContract');
                                }
                                else {
                                    dialogService.showNotification($translate.instant('DASHBOARD_STAGE_DOES_NOT_HAVE_DEVELOPMENT_CONTRACT'), $translate.instant('COMMON_WARNING'));
                                }
                            });
                        }
                    }
                }

                $scope.goToDevContractForMain = function () {
                    goToDevContract($scope.filter.mainParticipantsModel[0], $scope.filter.mainEvaluatorsModel[0],
                        $scope.filter.mainProfileStepId == $scope.ktProfileTypes.start.id, $scope.filter.mainStageId);
                }

                $scope.goToDevContractForCompare = function () {
                    goToDevContract($scope.filter.participantsModel[0], $scope.filter.evaluatorsModel[0],
                        $scope.filter.profileStepId == $scope.ktProfileTypes.start.id, $scope.filter.stageId);
                }

                $scope.isShowDevContract = function (participantsModel, evaluatorsModel, stageid, profileStepId) {
                    var isShow = false;
                    //Rule 1  : Self Evalution
                    var stageObj = _.find($scope.mainStages, function (item) {
                        return item.id == stageid;
                    });
                    if (stageObj) {

                        if (stageObj.name.toLowerCase().indexOf("start") > -1) {

                            if ((participantsModel && participantsModel.length == 1 && participantsModel[0].id != -1) && (!(evaluatorsModel && evaluatorsModel.length >= 1)) && (profileStepId == softProfileTypesEnum.finalProfile.id || profileStepId == softProfileTypesEnum.finalKpi.id)) {
                                var participantObj = _.find($scope.filter.mainParticipantsOptions, function (item) {
                                    return item.id == participantsModel[0].id && item.isSelfEvaluation == true;
                                });
                                if (participantObj) {
                                    isShow = true;
                                }
                                else {
                                    isShow = false;
                                }

                            }
                            else if (((participantsModel && participantsModel.length == 1 && participantsModel[0].id != -1) || (evaluatorsModel && evaluatorsModel.length == 1)) && (profileStepId == softProfileTypesEnum.finalProfile.id || profileStepId == softProfileTypesEnum.finalKpi.id)) {
                                isShow = true;
                            }
                        }
                        else {
                            if ((participantsModel && participantsModel.length == 1 && participantsModel[0].id != -1) && (!(evaluatorsModel && evaluatorsModel.length >= 1)) && (profileStepId == softProfileTypesEnum.finalProfile.id || profileStepId == softProfileTypesEnum.finalKpi.id)) {
                                var participantObj = _.find($scope.filter.mainParticipantsOptions, function (item) {
                                    return item.id == participantsModel[0].id && item.isSelfEvaluation == true;
                                });
                                if (participantObj) {
                                    isShow = true;
                                }
                                else {
                                    isShow = false;
                                }
                            }
                            else if (((participantsModel && participantsModel.length == 1 && participantsModel[0].id != -1) || (evaluatorsModel && evaluatorsModel.length == 1)) && (profileStepId == softProfileTypesEnum.finalProfile.id || profileStepId == softProfileTypesEnum.finalKpi.id)) {
                                isShow = true;
                            }
                        }
                    }



                    return isShow;
                }


                $scope.init = function () {

                    $scope.filter.isLoadReport = false;
                    $scope.filter.isLoadCompareReport = false;

                    performanceManagmentFilterService.getOrganizations('&$orderby=Name').then(function (data) {
                        $scope.organizations = data;
                    });
                    performanceManagmentFilterService.getProjects().then(function (data) {
                        if ($scope.filter.organizationId) {
                            $scope.projects = _.filter(data, function (item) {
                                return item.organizationId == $scope.filter.organizationId;
                            });
                            $scope.profileTypeChanged();
                        }
                        else {
                            $scope.projects = data;
                        }
                        _.forEach($scope.projects, function (item) {
                            $scope.projectsOptions.push({ id: item.id, label: item.name });
                        });
                    });

                    // set preselected values:
                    if ($scope.filter.departmentsModel.length) {
                        performanceManagmentFilterService.getDepartments($scope.filter.organizationId).then(function (data) {
                            if (data) {
                                $scope.departments = data;
                                $scope.departmentsOptions = getMultiSelectOptions($scope.departments);
                            }
                        });
                    }
                    if ($scope.filter.teamsModel.length) {
                        performanceManagmentFilterService.getTeams($scope.filter.organizationId, $scope.filter.departmentsModel).then(function (data) {
                            if (data) {
                                $scope.teams = data;
                                $scope.teamsOptions = getMultiSelectOptions($scope.teams);
                            }
                        });
                    }
                    if ($scope.filter.profileId) {
                        performanceManagmentFilterService.getProfileType($scope.filter.profileId).then(function (data) {
                            $scope.filter.profileType = data;
                            performanceManagmentFilterService.getProfiles($scope.filter.organizationId, "", $scope.filter.profileStatus).then(function (data) {
                                if (data) {
                                    $scope.profiles = data;
                                }
                                else {
                                    $scope.profiles = [];
                                }
                            });
                            performanceManagmentFilterService.getProfileStages($scope.filter.profileId, null, false).then(function (stages) {
                                $scope.mainStages = [];
                                $scope.stages = [];

                                $scope.mainStagesRaw = [];
                                $scope.stagesRaw = [];

                                _.forEach(stages, function (item, index) {
                                    if (index == 0) {
                                        $scope.firstStageId = item.id;
                                    }
                                    $scope.mainStages.push({ id: item.id, name: item.name + " (" + item.statusText + ")" });
                                    $scope.stages.push({ id: item.id, name: item.name + " (" + item.statusText + ")" });

                                    $scope.mainStagesRaw.push({ id: item.id, name: item.name });
                                    $scope.stagesRaw.push({ id: item.id, name: item.name });
                                    if ($scope.filter.mainStageId == item.id) {
                                        $scope.filter.mainStageName = item.name;
                                    }
                                    if ($scope.filter.stageId == item.id) {
                                        $scope.filter.stageName = item.name;
                                    }
                                });
                                if ($scope.filter.profileType == $scope.profilesTypesEnum.soft) {
                                    var source = [];
                                    if ($scope.filter.mainStageId === $scope.firstStageId) {
                                        $scope.filter.mainStepsOfProfile = getDefaultSoftProfileTypes();
                                    }
                                    else {
                                        $scope.filter.mainStepsOfProfile.push(softProfileTypesEnum.initialKPIScores);
                                        $scope.filter.mainStepsOfProfile.push(softProfileTypesEnum.finalKPIResults);
                                    }

                                    if ($scope.filter.stageId === $scope.firstStageId) {
                                        $scope.filter.stepsOfProfile = getDefaultSoftProfileTypes();
                                    }
                                    else {

                                        $scope.filter.stepsOfProfile.push(softProfileTypesEnum.initialKPIScores);
                                        $scope.filter.stepsOfProfile.push(softProfileTypesEnum.finalKPIResults);
                                    }
                                }
                                else {
                                    $scope.filter.mainStepsOfProfile = getDefaultKTProfileTypes();
                                    $scope.filter.stepsOfProfile = getDefaultKTProfileTypes();
                                }
                                if ($scope.filter.mainParticipantsModel.length) {
                                    performanceManagmentFilterService.getParticipantsBy($scope.filter.profileId, $scope.filter.stageId, $scope.filter.projectsModel,
                                        $scope.filter.departmentsModel, $scope.filter.teamsModel, $scope.filter.profileStageGroupId).then(function (data) {
                                            $scope.participants = [];
                                            $scope.filter.participants = [];
                                            $scope.isEvaluatorsEnabled = false;

                                            _.forEach(data, function (item) {
                                                $scope.participants.push({ id: item.participantId, name: item.firstName + " " + item.lastName, isSelfEvaluation: item.isSelfEvaluation });
                                            });

                                            if ($scope.participants.length > 0) {
                                                $scope.participants.splice(0, 0,
                                                    {
                                                        id: -1, name: $translate.instant('SCORECARD_BENCHMARK')
                                                    }
                                                );
                                                $scope.filter.mainParticipantsOptions = getMultiSelectOptions($scope.participants);
                                                $scope.filter.participantsOptions = getMultiSelectOptions($scope.participants);
                                                $scope.filter.participants = $scope.participants;
                                            }
                                            if ($scope.filter.profileType == $scope.profilesTypesEnum.soft) {
                                                performanceManagmentFilterService.getEvaluatorsForParticipant($scope.filter.profileId, $scope.filter.mainParticipantsModel).then(function (data) {
                                                    $scope.mainEvaluators = [];
                                                    $scope.filter.mainEvaluatorsOptions = [];

                                                    _.forEach(data, function (evaluator) {
                                                        $scope.mainEvaluators.push({ id: evaluator.participantId, name: evaluator.firstName + " " + evaluator.lastName, isSelfEvaluation: evaluator.isSelfEvaluation, IsScoreManager: evaluator.isScoreManager });
                                                        $scope.filter.mainEvaluatorsOptions = getMultiSelectOptions($scope.mainEvaluators);
                                                    });
                                                    if ($scope.mainEvaluators.length > 0) {
                                                        $scope.isMainEvaluatorsEnabled = true;
                                                    }

                                                });
                                            }
                                            if ($scope.filter.participantsModel.length) {
                                                performanceManagmentFilterService.getEvaluatorsForParticipant($scope.filter.profileId, $scope.filter.participantsModel).then(function (data) {
                                                    $scope.evaluators = [];
                                                    $scope.filter.evaluatorsOptions = [];
                                                    _.forEach(data, function (evaluator) {
                                                        $scope.evaluators.push({ id: evaluator.participantId, name: evaluator.firstName + " " + evaluator.lastName, isSelfEvaluation: evaluator.isSelfEvaluation, IsScoreManager: evaluator.isScoreManager });
                                                        $scope.filter.evaluatorsOptions = getMultiSelectOptions($scope.evaluators);
                                                    });
                                                    if ($scope.evaluators.length > 0) {
                                                        $scope.isEvaluatorsEnabled = true;
                                                    }
                                                    $scope.filter.isLoadCompareReport = true;
                                                    getFilteredData();
                                                });
                                            }


                                            if (!$scope.filter.participantsModel.length) {
                                                getFilteredData();
                                            }
                                        });
                                }
                            });
                        });
                    }

                };

                $scope.smartButtonSettings = {
                    smartButtonMaxItems: 3,
                    smartButtonTextConverter: function (itemText, originalItem) {
                        return itemText;
                    },
                    template: '<b>{{option.label}}</b>'
                };

                $scope.getBenchmark = function () {
                    $scope.$emit('benchmarkChanged', 'true');
                };
            }]);

    dashboardCtrl.$inject = ['$scope', '$rootScope', '$state', '$stateParams', '$location', '$q', 'dialogService', 'cssInjector', 'dashboardsService', 'organizations', 'projects', 'profilesTypesEnum', 'softProfileTypesEnum', 'ktProfileTypesEnum', 'profileStatusEnum', 'localStorageService', '$translate'];

    function dashboardCtrl($scope, $rootScope, $state, $stateParams, $location, $q, dialogService, cssInjector, dashboardsService, organizations, projects, profilesTypesEnum, softProfileTypesEnum, ktProfileTypesEnum, profileStatusEnum, localStorageService, $translate) {
        cssInjector.removeAll();
        cssInjector.add('views/performance/dashboard/dashboard.css');
        $scope.dashboard = this;
        $scope.dashboard.mainEvolutionStageId = 0;
        $scope.dashboard.evolutionStageId = 0;
        $scope.ktProfileTypes = {
            start: { id: 1, label: $translate.instant('COMMON_START_STAGE') },
            final: { id: 2, label: $translate.instant('COMMON_FINAL_STAGE') }
        };
        function goToDevContract(type) {
            if (type === 1) {
                var mainParticipantId = $scope.dashboard.mainParticipantsModel[0];
                var mainEvalId = $scope.dashboard.mainEvaluatorsModel[0];

                localStorageService.set('perfomanceManagementFilterData', $scope.dashboard);
                $location.path('home/previewFinalKPI/' + $scope.dashboard.profileId + '/' + $scope.dashboard.mainStageId + '/' + mainEvalId.id + '/' + mainParticipantId.id + '/devContract');
            }
            if (type === 2) {
                var participantId = $scope.dashboard.participantsModel[0];
                var evalId = $scope.dashboard.evaluatorsModel[0];
                $location.path('home/previewFinalKPI/' + $scope.dashboard.profileId + '/ ' + $scope.dashboard.mainStageId + '/' + evalId.id + '/' + participantId.id + '/devContract');
            }
        }
        function isShowDevContract(participantsModel, evaluatorsModel, stageid, profileStepId) {
            var isShow = false;
            //Rule 1  : Self Evalution
            var stageObj = _.find($scope.dashboard.mainStages, function (item) {
                return item.id == stageid;
            });
            if (stageObj) {

                if (stageObj.name.toLowerCase().indexOf("start") > -1) {

                    if ((participantsModel && participantsModel.length == 1 && participantsModel[0].id != -1) && (!(evaluatorsModel && evaluatorsModel.length >= 1)) && (profileStepId == softProfileTypesEnum.finalProfile.id || profileStepId == softProfileTypesEnum.finalKpi.id)) {
                        var participantObj = _.find($scope.dashboard.mainParticipantsOptions, function (item) {
                            return item.id == participantsModel[0].id && item.isSelfEvaluation == true;
                        });
                        if (participantObj) {
                            isShow = true;
                        }
                        else {
                            isShow = false;
                        }

                    }
                    else if (((participantsModel && participantsModel.length == 1 && participantsModel[0].id != -1) || (evaluatorsModel && evaluatorsModel.length == 1)) && (profileStepId == softProfileTypesEnum.finalProfile.id || profileStepId == softProfileTypesEnum.finalKpi.id)) {
                        isShow = true;
                    }
                }
                else {
                    if ((participantsModel && participantsModel.length == 1 && participantsModel[0].id != -1) && (!(evaluatorsModel && evaluatorsModel.length >= 1)) && (profileStepId == softProfileTypesEnum.finalProfile.id || profileStepId == softProfileTypesEnum.finalKpi.id)) {
                        var participantObj = _.find($scope.dashboard.mainParticipantsOptions, function (item) {
                            return item.id == participantsModel[0].id && item.isSelfEvaluation == true;
                        });
                        if (participantObj) {
                            isShow = true;
                        }
                        else {
                            isShow = false;
                        }
                    }
                    else if (((participantsModel && participantsModel.length == 1 && participantsModel[0].id != -1) || (evaluatorsModel && evaluatorsModel.length == 1)) && (profileStepId == softProfileTypesEnum.finalProfile.id || profileStepId == softProfileTypesEnum.finalKpi.id)) {
                        isShow = true;
                    }
                }
            }



            return isShow;
        }
        function indexOfId(array, id) {
            for (var i = 0; i < array.length; i++) {
                if (array[i].id == id) return i;
            }
            return -1;
        }
        $scope.filteredResult = {
            isShowReport: false,
            isShowCompareReport: false,
            showGraph: true,
            showGauge: false,
            showKpiBar: false,
            showCompareKpi: false,
            showCompareGauge: false,
        };

        $scope.filter = {
            profileType: null,
            isShowBenchmark: false,
            isLoadReport: false,
            isLoadCompareReport: false,
            organizationId: null,
            projectsModel: [],
            departmentsModel: [],
            teamsModel: [],
            profileId: null,
            mainParticipantsModel: [],
            mainParticipantsOptions: [],
            mainEvaluatorsModel: [],
            mainEvaluatorsOptions: [],
            mainStageId: null,
            mainProfileStepId: null,
            mainStepsOfProfile: [],
            participantsModel: [],
            participantsOptions: [],
            evaluatorsModel: [],
            stageId: null,
            profileStepId: null
        };
        var filterData = localStorageService.get('perfomanceManagementFilterData');
        if (filterData) {
            $scope.filter = filterData;
            localStorageService.remove('perfomanceManagementFilterData');
        }

        function getMultiSelectOptions(data) {
            var options = [];
            angular.forEach(data, function (item, index) {
                options.push({ id: item.id, label: item.name });
            });
            return options;
        }

        function projectChanged(item) {

            if ($scope.dashboard && $scope.dashboard.organizationId != null) {
                performanceManagmentFilterService.getProfiles($scope.dashboard.organizationId, "", $scope.dashboard.profileStatus).then(function (data) {
                    if (data) {
                        if ($scope.dashboard.projectsModel.length > 0) {
                            $scope.profiles = _.filter(data, function (item) {
                                var isFiltered = _.filter($scope.dashboard.projectsModel, function (projectItem) {
                                    return projectItem.id == item.projectId;
                                })
                                if (isFiltered.length > 0) {
                                    return true;
                                }
                                else {
                                    return false;
                                }
                            });
                        }
                        else {
                            $scope.profiles = data;
                        }
                    }
                    else {
                        $scope.profiles = [];
                    }
                });
            }

            //if ($scope.dashboard && $scope.dashboard.profileId != null) {
            //    //getParticipants();



            //}
        }



        $scope.dashboard.profileStatusOptions = [{ id: '', name: "Any" }]
        _.forEach(_.keys(profileStatusEnum), function (item) {
            var ProfileTypeName = item;
            if (item == "Active") {
                ProfileTypeName = $translate.instant('DASHBOARD_ACTIVE_PROFILE')
            }
            else if (item == "Inactive") {
                ProfileTypeName = $translate.instant('DASHBOARD_INACTIVE_PROFILE')
            }
            $scope.dashboard.profileStatusOptions.push({ id: profileStatusEnum[item], name: ProfileTypeName });
        })


        $scope.dashboard.profileStatus = '';
        $scope.dashboard.profileStatusChanged = function () {
            //clearProfiles();
            clearParticipants();
            clearStages();
            clearProfileSteps()
            if ($scope.dashboard.profileTypeId == profilesTypesEnum.soft) {
                clearEvaluators();
            }


            dashboardsService.getProfiles($scope.dashboard.organizationId, "", $scope.dashboard.profileStatus).then(function (data) {
                if (data) {
                    $scope.dashboard.profiles = _.filter(data, function (item) {
                        if ($scope.dashboard.profileTypeId > 0) {
                            return item.profileTypeId == $scope.dashboard.profileTypeId
                        }
                        else {
                            return item;
                        }
                    });
                    $scope.dashboard.profiles.unshift({ id: null, name: $translate.instant('COMMON_SELECT_PROFILE') + "..." });
                }
                else {
                    $scope.dashboard.profiles = [{ id: null, name: $translate.instant('COMMON_SELECT_PROFILE') + "..." }];
                    //$scope.dashboard.profiles.unshift({ id: null, name: "Select Profile..." });
                }
            });
            //$scope.dashboard.isLoadReport = false;
            //$scope.dashboard.isLoadCompareReport = false;
            //$scope.$emit('filterChanged', 'false');
        };


        $scope.dashboard.projectsCustomTexts = { buttonDefaultText: $translate.instant('DASHBOARD_SELECT_PROJECTS') };
        $scope.dashboard.smartButtonSettings = {
            smartButtonMaxItems: 3,
            smartButtonTextConverter: function (itemText, originalItem) {
                return itemText;
            },
            template: '<b>{{option.label}}</b>'
        };

        $scope.dashboard.projectsEvents = {
            onItemSelect: function (item) {
                projectChanged(item);
            },
            onItemDeselect: function (item) {
                projectChanged(item);
            },
            onSelectAll: function () {
                projectChanged();
            },
            onDeselectAll: function () {
                projectChanged();
            }
        };

        $scope.dashboard.departmentsOptions = [];
        $scope.dashboard.departmentsModel = [];

        $scope.dashboard.departmentsCustomTexts = { buttonDefaultText: $translate.instant('DASHBOARD_SELECT_DEPARTMENTS') };

        function departmentChanged() {
            if ($scope.dashboard) {
                $scope.dashboard.departmentChanged();
            }
        }

        $scope.dashboard.departmentsEvents = {
            onItemSelect: function (item) {
                departmentChanged(item);
            },
            onItemDeselect: function (item) {
                departmentChanged(item);
            },
            onSelectAll: function () {
                departmentChanged();
            },
            onDeselectAll: function () {
                departmentChanged();
            }
        };

        $scope.dashboard.teamsOptions = [];
        $scope.dashboard.teamsModel = [];

        $scope.dashboard.teamsCustomTexts = { buttonDefaultText: $translate.instant('DASHBOARD_SELECT_TEAMS') };

        $scope.dashboard.teamsEvents = {
            onItemSelect: function (item) {
                projectChanged(item);
            },
            onItemDeselect: function (item) {
                projectChanged(item);
            },
            onSelectAll: function () {
                projectChanged();
            },
            onDeselectAll: function () {
                projectChanged();
            }
        };

        function getNameById(selectedStageId, optionsSource) {
            var result;
            angular.forEach(optionsSource, function (option, index) {
                if (option.id === selectedStageId) {
                    result = option.name;
                }
            });
            return result;
        }

        $scope.dashboard.firstStageId = null;

        function getProfileSteps(type, selectedStageId, optionsSource) {
            var source;

            if ($scope.dashboard.profileId > 0) {
                var selectedProfile = _.find($scope.dashboard.profiles, function (profile) {
                    return profile.id == $scope.dashboard.profileId;
                });

                if (selectedProfile) {
                    $scope.dashboard.profileType = selectedProfile.profileTypeId;
                    if (selectedProfile.profileTypeId == profilesTypesEnum.soft) {
                        //clearEvaluators();
                        if (type == 1) {
                            if ($scope.dashboard.mainStageId === $scope.dashboard.firstStageId) {
                                $scope.dashboard.mainStepsOfProfile = getDefaultSoftProfileTypes();
                            }
                            else {
                                $scope.dashboard.mainStepsOfProfile = [];
                                $scope.dashboard.mainStepsOfProfile.push(softProfileTypesEnum.initialKPIScores);
                                $scope.dashboard.mainStepsOfProfile.push(softProfileTypesEnum.finalKPIResults);
                            }
                        }
                        if (type == 2) {

                            if ($scope.dashboard.stageId === $scope.dashboard.firstStageId) {
                                $scope.dashboard.stepsOfProfile = getDefaultSoftProfileTypes();
                            }
                            else {
                                $scope.dashboard.stepsOfProfile = [];
                                $scope.dashboard.stepsOfProfile.push(softProfileTypesEnum.initialKPIScores);
                                $scope.dashboard.stepsOfProfile.push(softProfileTypesEnum.finalKPIResults);
                            }
                        }
                        //$scope.dashboard.mainStepsOfProfile = getDefaultSoftProfileTypes();
                        //$scope.dashboard.mainProfileStepId = $scope.dashboard.mainStepsOfProfile[0].id;
                        //$scope.dashboard.stepsOfProfile = getDefaultSoftProfileTypes();
                        //$scope.dashboard.profileStepId = $scope.dashboard.stepsOfProfile[0].id;

                    }
                    else if (selectedProfile.profileTypeId == profilesTypesEnum.knowledgetest) {
                        $scope.dashboard.mainStepsOfProfile = getDefaultKTProfileTypes();
                        //$scope.dashboard.mainProfileStepId = $scope.dashboard.mainStepsOfProfile[0].id;
                        $scope.dashboard.stepsOfProfile = getDefaultKTProfileTypes();
                        //$scope.dashboard.profileStepId = $scope.dashboard.stepsOfProfile[0].id;

                    }
                }
            }



            //if (selectedStageId === $scope.dashboard.firstStageId) {
            //    source = [{ id: null, label: "Select Type of Profile..." }, { id: 1, label: "Start Profile" }, { id: 2, label: "Agreed Final Profile" }, { id: 3, label: "Initial KPI" }, { id: 4, label: "Agreed Final KPI" }];
            //    if (type === 1) {
            //        $scope.dashboard.isShowGoal = false;
            //    }
            //    if (type === 2) {
            //        $scope.dashboard.isShowCompareGoal = false;
            //    }
            //} else {
            //    source = [{ id: null, label: "Select Type of Profile..." }, { id: 3, label: "Initial KPI Scores" }, { id: 4, label: "Agreed Final KPI Results" }];;
            //    if (type === 1) {
            //        $scope.dashboard.isShowGoal = true;
            //    }
            //    if (type === 2) {
            //        $scope.dashboard.isShowCompareGoal = true;
            //    }
            //}
            //if (type === 1) {
            //    $scope.dashboard.mainStepsOfProfile = source;
            //}
            //if (type === 2) {
            //    $scope.dashboard.stepsOfProfile = source;
            //}
        }

        function stagesHandler(type) {
            if (type === 1) {

                $scope.dashboard.mainStageName = '';
                angular.forEach($scope.dashboard.mainStagesRaw, function (s) {
                    if (s.id == $scope.dashboard.mainStageId) {
                        $scope.dashboard.mainStageName = s.name;
                        return;
                    }
                });

                $scope.dashboard.mainProfileStepId = 4;
                if ($scope.dashboard.mainParticipantsModel.length > 0) {
                    $scope.dashboard.getDashboardData();
                }
                getProfileSteps(type, $scope.dashboard.mainStageId, $scope.dashboard.mainStages);
            }
            if (type === 2) {

                $scope.dashboard.stageName = '';
                angular.forEach($scope.dashboard.stagesRaw, function (s) {
                    if (s.id == $scope.dashboard.stageId) {
                        $scope.dashboard.stageName = s.name;
                        return;
                    }
                });

                $scope.dashboard.profileStepId = 4;
                if ($scope.dashboard.participantsModel.length > 0) {
                    $scope.dashboard.getDashboardData();
                }
                getProfileSteps(type, $scope.dashboard.stageId, $scope.dashboard.stages);
            }
        }

        $scope.dashboard.mainStagesOptions = [];
        $scope.dashboard.mainStagesModel = [];

        $scope.dashboard.mainStagesEvents = {
            onItemSelect: function (item) {
                stagesHandler(1);
            },
            onItemDeselect: function (item) {
                stagesHandler(1);
            },
            onSelectAll: function () {
                stagesHandler(1);
            },
            onDeselectAll: function () {
                stagesHandler(1);
            }
        };

        $scope.dashboard.stagesOptions = [];
        $scope.dashboard.stagesModel = [];

        $scope.dashboard.stagesCustomTexts = { buttonDefaultText: $translate.instant('DASHBOARD_SELECT_STAGES') };

        $scope.dashboard.stagesEvents = {
            onItemSelect: function (item) {
                dashboard.stagesHandler(2);
            },
            onItemDeselect: function (item) {
                dashboard.stagesHandler(2);
            },
            onSelectAll: function () {
                dashboard.stagesHandler(2);
            },
            onDeselectAll: function () {
                dashboard.stagesHandler(2);
            }
        };

        function mainParticipantChangedHandler(item) {
            if ($scope.dashboard) {
                $scope.dashboard.mainParticipantChanged(item);
            }
        }

        function mainEvaluatorsChangedHandler(item) {
            if ($scope.dashboard) {
                $scope.dashboard.mainEvaluatorsChanged(item);
            }
        }

        function evaluatorChangedHandler(item) {
            if ($scope.dashboard) {
                $scope.dashboard.evaluatorsChanged();
            }
        }

        $scope.dashboard.mainParticipantsOptions = [];
        $scope.dashboard.mainParticipantsModel = [];

        $scope.dashboard.mainParticipantsCustomTexts = { buttonDefaultText: $translate.instant('DASHBOARD_SELECT_MAIN_PARTICIPANTS') };

        $scope.dashboard.mainParticipantsEvents = {
            onItemSelect: function (item) {

                mainParticipantChangedHandler(item);
            },
            onItemDeselect: function (item) {
                mainParticipantChangedHandler(item);
            },
            onSelectAll: function () {
                mainParticipantChangedHandler();
            },
            onDeselectAll: function () {
                $scope.dashboard.mainParticipantsModel = [];
                $scope.dashboard.participantsModel = [];
                $scope.dashboard.mainEvaluatorsOptions = [];
                $scope.dashboard.mainEvaluatorsModel = [];
                $scope.dashboard.isMainEvaluatorsEnabled = false;

                mainParticipantChangedHandler();
            }
        };

        $scope.dashboard.mainEvaluatorsOptions = [];
        $scope.dashboard.mainEvaluatorsModel = [];

        $scope.dashboard.mainEvaluatorsCustomTexts = { buttonDefaultText: $translate.instant('DASHBOARD_SELECT_MAIN_EVALUATORS') };

        $scope.dashboard.mainEvaluatorsEvents = {
            onItemSelect: function (item) {
                mainEvaluatorsChangedHandler(item);
            },
            onItemDeselect: function (item) {
                mainEvaluatorsChangedHandler(item);
            },
            onSelectAll: function () {
                mainEvaluatorsChangedHandler();
            },
            onDeselectAll: function () {
                $scope.dashboard.mainEvaluatorsModel = [];
                mainEvaluatorsChangedHandler();
            }
        };

        function participantChangedHandler(item) {
            if ($scope.dashboard) {
                $scope.dashboard.participantChanged(item);
            }
        }

        $scope.dashboard.participantsOptions = [];
        $scope.dashboard.participantsModel = [];

        $scope.dashboard.participantsCustomTexts = { buttonDefaultText: $translate.instant('DASHBOARD_SELECT_PARTICIPANTS') };

        $scope.dashboard.participantsEvents = {
            onItemSelect: function (item) {
                participantChangedHandler(item);
            },
            onItemDeselect: function (item) {
                participantChangedHandler(item);
            },
            onSelectAll: function () {
                participantChangedHandler();
            },
            onDeselectAll: function () {
                participantChangedHandler();
            }
        };

        $scope.dashboard.evaluatorsOptions = [];
        $scope.dashboard.evaluatorsModel = [];

        $scope.dashboard.evaluatorsCustomTexts = { buttonDefaultText: $translate.instant('MYPROFILES_SELECT_EVALUATORS') };

        $scope.dashboard.evaluatorsEvents = {
            onItemSelect: function (item) {
                evaluatorChangedHandler(item);
            },
            onItemDeselect: function (item) {
                evaluatorChangedHandler(item);
            },
            onSelectAll: function () {
                evaluatorChangedHandler();
            },
            onDeselectAll: function () {
                evaluatorChangedHandler();
            }
        };

        $scope.dashboard.profileTypesCustomTexts = { buttonDefaultText: $translate.instant('SOFTPROFILE_SELECT_PROFILE_TYPES') };


        $scope.dashboard.mainProfileTypesOptions = [];
        $scope.dashboard.mainProfileTypesModel = [];
        $scope.dashboard.mainProfileTypesEvents = {
            onItemSelect: function (item) {
                if ($scope.dashboard.mainParticipantsModel.length > 0) {
                    getDashboardData();
                }
            },
            onItemDeselect: function (item) {
                if ($scope.dashboard.mainParticipantsModel.length > 0) {
                    getDashboardData();
                }
            },
            onSelectAll: function () {
                if ($scope.dashboard.mainParticipantsModel.length > 0) {
                    getDashboardData();
                }
            },
            onDeselectAll: function () {
                if ($scope.dashboard.mainParticipantsModel.length > 0) {
                    getDashboardData();
                }
            }
        };

        $scope.dashboard.profileTypesOptions = [];
        $scope.dashboard.profileTypesModel = [];
        $scope.dashboard.profileTypesEvents = {
            onItemSelect: function (item) {
                if ($scope.dashboard.participantsModel.length > 0) {
                    getDashboardData();
                }
            },
            onItemDeselect: function (item) {
                if ($scope.dashboard.participantsModel.length > 0) {
                    getDashboardData();
                }
            },
            onSelectAll: function () {
                if ($scope.dashboard.participantsModel.length > 0) {
                    getDashboardData();
                }
            },
            onDeselectAll: function () {
                if ($scope.dashboard.participantsModel.length > 0) {
                    getDashboardData();
                }
            }
        };

        $scope.dashboard.statusFilterDisabled = false;


        $scope.dashboard.performanceGroups = [];
        $scope.dashboard.organizations = organizations;
        $scope.dashboard.projects = projects;
        $scope.dashboard.projectId = null;

        $scope.dashboard.departments = [];
        $scope.dashboard.teams = [];
        $scope.dashboard.profiles = [{ id: null, name: "Select Profile..." }];
        $scope.dashboard.mainStepsOfProfile = [{ id: null, label: $translate.instant('COMMON_SELECT_PROFILE_STEPS') }, { id: 1, label: $translate.instant('DASHBOARD_START_PROFILE') }, { id: 2, label: $translate.instant('DASHBOARD_AGREED_FINAL_PROFILE') }, { id: 3, label: $translate.instant('DASHBOARD_INITIAL_KPI') }, { id: 4, label: $translate.instant('DASHBOARD_AGREED_FINAL_KPI') }];
        $scope.dashboard.stepsOfProfile = [{ id: null, label: $translate.instant('COMMON_SELECT_PROFILE_STEPS') }, { id: 1, label: $translate.instant('DASHBOARD_START_PROFILE') }, { id: 2, label: $translate.instant('DASHBOARD_AGREED_FINAL_PROFILE') }, { id: 3, label: $translate.instant('DASHBOARD_INITIAL_KPI') }, { id: 4, label: $translate.instant('DASHBOARD_AGREED_FINAL_KPI') }];
        $scope.dashboard.profileStepId = null;
        $scope.dashboard.compareProfileTypeId = null;
        $scope.dashboard.organizationId = null;

        $scope.dashboard.projectsOptions = projects;
        $scope.dashboard.projectsModel = [];

        $scope.dashboard.departmentId = null;
        $scope.dashboard.teamId = null;

        $scope.dashboard.profileId = null;


        $scope.dashboard.stages = [{ id: null, name: $translate.instant('DASHBOARD_SELECT_STAGE') }];;
        $scope.dashboard.stageId = null;
        $scope.dashboard.mainStages = [{ id: null, name: $translate.instant('DASHBOARD_SELECT_STAGE') }];;
        $scope.dashboard.mainStageId = null;
        $scope.dashboard.profileTypeId = 0;

        $scope.dashboard.compareStageId = null;
        $scope.dashboard.compareStages = [];
        $scope.dashboard.isShowReport = false;
        $scope.dashboard.reportData = null;
        $scope.dashboard.participants = [];
        $scope.dashboard.mainParticipants = [];
        $scope.dashboard.mainEvaluators = [];
        $scope.dashboard.evaluators = [];
        $scope.dashboard.compareEvaluators = [{ id: -2, name: $translate.instant('DASHBOARD_SELECT_DEALER') }, { id: null, name: $translate.instant('COMMON_ALL') }];
        $scope.dashboard.compareParticipants = [{ id: -2, name: $translate.instant('DASHBOARD_SELECT_PARTICIPANT') }, { id: null, name: $translate.instant('COMMON_ALL') }, { id: -1, name: $translate.instant('SCORECARD_BENCHMARK') }];
        $scope.dashboard.participantId = null;
        $scope.dashboard.evaluatorId = null;
        $scope.dashboard.compareEvaluatorId = null;
        $scope.dashboard.compareParticipantId = -2;
        $scope.dashboard.periods = [{ id: null, name: $translate.instant('DASHBOARD_SELECT_PERIOD') }];
        $scope.dashboard.periodId = null;
        $scope.dashboard.comparePeriods = [{ id: null, name: $translate.instant('DASHBOARD_SELECT_PERIOD') }];
        $scope.dashboard.comparePeriodId = null;
        $scope.dashboard.compareReportData = null;
        $scope.dashboard.isShowBenchmark = false;
        $scope.dashboard.isShowGoal = false;
        $scope.dashboard.isShowCompareGoal = false;

        $scope.dashboard.isMainEvaluatorsEnabled = false;
        $scope.dashboard.isEvaluatorsEnabled = false;

        $scope.dashboard.showMainIniKpi = false;
        $scope.dashboard.showMainFinalKpi = false;

        $scope.dashboard.showCompareToIniKpi = false;
        $scope.dashboard.showCompareToFinalKpi = false;

        $scope.dashboard.mainProfileStepId = null;
        $scope.dashboard.profileStepId = null;

        //var filterData = localStorageService.get('perfomanceManagementFilterData');
        //if (filterData) {
        //    $scope.dashboard = filterData;
        //    localStorageService.remove('perfomanceManagementFilterData');
        //    //$scope.dashboard.getDashboardData();
        //}
        function profileStepChanged(type) {
            if (type == "main") {
                $scope.dashboard.mainEvaluatorsModel = [];
                //if ($scope.dashboard.mainProfileStepId == softProfileTypesEnum.finalProfile.id || $scope.dashboard.mainProfileStepId == softProfileTypesEnum.finalKpi.id) {
                if ($scope.dashboard.mainEvaluatorsOptions.length > 0) {
                    var finalScoremanger = _.find($scope.dashboard.mainEvaluators, function (evaluatorItem) {
                        return evaluatorItem.IsScoreManager == true;
                    });
                    if (finalScoremanger) {
                        $scope.dashboard.mainEvaluatorsModel = [{ id: finalScoremanger.id }];
                    }
                }
                //$scope.filter.mainEvaluatorsModel = [];
                //$scope.isMainEvaluatorsEnabled = false;
                //}
                $scope.dashboard.isMainEvaluatorsEnabled = true;
                //getEvaluatorsOfParticipant($scope.dashboard.mainParticipantId, 1);
                //if ($scope.dashboard.mainProfileStepId == softProfileTypesEnum.finalProfile.id || $scope.dashboard.mainProfileStepId == softProfileTypesEnum.finalKpi.id) {
                //    //$scope.dashboard.mainEvaluatorsOptions = [];
                //    //$scope.dashboard.isMainEvaluatorsEnabled = false;
                //}
                //else {
                //    $scope.isMainEvaluatorsEnabled = true;
                //    getEvaluatorsOfParticipant($scope.dashboard.mainParticipantId, 1);
                //}
            }
            else if (type == "compare") {
                $scope.dashboard.evaluatorsModel = [];
                //if ($scope.dashboard.profileStepId == softProfileTypesEnum.finalProfile.id || $scope.dashboard.profileStepId == softProfileTypesEnum.finalKpi.id) {
                if ($scope.dashboard.evaluatorsOptions.length > 0) {
                    var finalScoremanger = _.find($scope.dashboard.evaluators, function (evaluatorItem) {
                        return evaluatorItem.IsScoreManager == true;
                    });
                    if (finalScoremanger) {
                        $scope.dashboard.evaluatorsModel = [{ id: finalScoremanger.id }];
                    }
                }
                //$scope.filter.mainEvaluatorsModel = [];
                //$scope.isMainEvaluatorsEnabled = false;
                //}
                $scope.isEvaluatorsEnabled = true;
                //getEvaluatorsOfParticipant($scope.dashboard.participantId, 2);
                //if ($scope.dashboard.profileStepId == softProfileTypesEnum.finalProfile.id || $scope.dashboard.profileStepId == softProfileTypesEnum.finalKpi.id) {
                //    $scope.dashboard.evaluatorsOptions = [];
                //    $scope.dashboard.isEvaluatorsEnabled = false;
                //}
                //else {
                //    $scope.isEvaluatorsEnabled = true;
                //    getEvaluatorsOfParticipant($scope.dashboard.participantId, 2);
                //}
            }

            getDashboardData();
        }


        function goBack() {
            history.back();
        }

        function getEvaluatorsOfParticipant(participantId, type) {
            var usersSource;

            if (type === 1) {
                usersSource = $scope.dashboard.mainParticipantsModel;
            } else {
                usersSource = $scope.dashboard.participantsModel;
            }

            //more than 1 main Participant - compare participant selected - SWITCH OFF evaluators
            if (usersSource.length > 1) {
                if (type === 1) {
                    $scope.dashboard.isMainEvaluatorsEnabled = false;
                    $scope.dashboard.mainEvaluatorsModel = [];
                    $scope.dashboard.mainEvaluators = [];
                    if ($scope.dashboard.mainProfileStepId && $scope.dashboard.mainProfileStepId > 0) {
                        getDashboardData();
                    }
                } else {
                    $scope.dashboard.isEvaluatorsEnabled = false;
                    $scope.dashboard.evaluatorsModel = [];
                    $scope.dashboard.evaluators = [];
                    if ($scope.dashboard.profileStepId && $scope.dashboard.profileStepId > 0) {
                        getDashboardData();
                    }
                }
            } else {
                dashboardsService.getEvaluatorsForParticipant($scope.dashboard.profileId, usersSource).then(function (data) {
                    if (type === 1) {
                        $scope.dashboard.mainEvaluators = [];
                        $scope.dashboard.mainEvaluatorsOptions = [];
                        $scope.dashboard.mainEvaluatorsModel = [];
                    } else {
                        $scope.dashboard.evaluators = [];
                        $scope.dashboard.evaluatorsOptions = [];
                        $scope.dashboard.evaluatorsModel = [];
                    }
                    angular.forEach(data, function (evaluator) {
                        if (type === 1) {
                            $scope.dashboard.mainEvaluators.push({ id: evaluator.participantId, name: evaluator.firstName + " " + evaluator.lastName, isSelfEvaluation: evaluator.isSelfEvaluation, IsScoreManager: evaluator.isScoreManager });
                            $scope.dashboard.mainEvaluatorsOptions = getMultiSelectOptions($scope.dashboard.mainEvaluators);
                            //if ($scope.dashboard.mainProfileStepId == softProfileTypesEnum.finalProfile.id || $scope.dashboard.mainProfileStepId == softProfileTypesEnum.finalKpi.id) {
                            //$scope.isMainEvaluatorsEnabled = false;

                            var finalScoremanger = _.find($scope.dashboard.mainEvaluators, function (evaluatorItem) {
                                return evaluatorItem.IsScoreManager == true;
                            })
                            if (finalScoremanger) {
                                $scope.dashboard.mainEvaluatorsModel = [{ id: finalScoremanger.id }];
                            }
                            //}
                        }
                        else {
                            $scope.dashboard.evaluators.push({ id: evaluator.participantId, name: evaluator.firstName + " " + evaluator.lastName, isSelfEvaluation: evaluator.isSelfEvaluation, IsScoreManager: evaluator.isScoreManager });
                            $scope.dashboard.evaluatorsOptions = getMultiSelectOptions($scope.dashboard.evaluators);

                            //if ($scope.dashboard.mainProfileStepId == softProfileTypesEnum.finalProfile.id || $scope.dashboard.mainProfileStepId == softProfileTypesEnum.finalKpi.id) {
                            //$scope.isMainEvaluatorsEnabled = false;
                            var finalScoremanger = _.find($scope.dashboard.evaluators, function (evaluatorItem) {
                                return evaluatorItem.IsScoreManager == true;
                            });
                            if (finalScoremanger) {
                                $scope.dashboard.evaluatorsModel = [{ id: finalScoremanger.id }];
                            }
                            //}
                        }
                    });
                    if (type === 1) {
                        if ($scope.dashboard.mainEvaluators.length > 0) {
                            $scope.dashboard.isMainEvaluatorsEnabled = true;
                        }
                        if ($scope.dashboard.mainProfileStepId && $scope.dashboard.mainProfileStepId > 0) {
                            getDashboardData();
                        }
                    }
                    if (type === 2) {
                        if ($scope.dashboard.evaluators.length > 0) {
                            $scope.dashboard.isEvaluatorsEnabled = true;
                        }
                        if ($scope.dashboard.profileStepId && $scope.dashboard.profileStepId > 0) {
                            getDashboardData();
                        }
                    }
                });
            }
        }

        function compareParticipantChanged(participantId) {
            $scope.dashboard.comparePeriods = [{ id: null, name: $translate.instant('DASHBOARD_SELECT_PERIOD') }];
            dashboardsService.getProfileEvaluationPeriods($scope.dashboard.profileId, participantId).then(function (data) {
                angular.forEach(data, function (item, index) {
                    $scope.dashboard.comparePeriods.push({ id: moment(kendo.parseDate(item.periodDate)).format('L'), name: item.periodTitle });
                });
                $scope.dashboard.comparePeriodId = null;
                getDashboardData();
            });
            dashboardsService.getProfileStages($scope.dashboard.profileId, participantId).then(function (data) {
                angular.forEach(data, function (item) {
                    $scope.dashboard.compareStages.push({ id: item.id, name: item.name });
                });
            });
        }

        function getParticipants() {
            dashboardsService.getProfileStages($scope.dashboard.profileId, null).then(function (data) {
                $scope.dashboard.mainStages = [{ id: null, name: $translate.instant('DASHBOARD_SELECT_STAGE') }];
                $scope.dashboard.stages = [{ id: null, name: $translate.instant('DASHBOARD_SELECT_STAGE') }];
                $scope.dashboard.mainStagesRaw = [];
                $scope.dashboard.stagesRaw = [];

                angular.forEach(data, function (item, index) {
                    if (index == 0) {
                        $scope.dashboard.firstStageId = item.id;
                    }
                    $scope.dashboard.mainStages.push({ id: item.id, name: item.name + " (" + item.statusText + ")" });
                    $scope.dashboard.stages.push({ id: item.id, name: item.name + " (" + item.statusText + ")" });
                    $scope.dashboard.mainStagesRaw.push({ id: item.id, name: item.name });
                    $scope.dashboard.stagesRaw.push({ id: item.id, name: item.name });
                });

                if ($scope.dashboard.mainStages.length > 1) {
                    $scope.dashboard.mainStageId = $scope.dashboard.mainStages[1].id;
                    $scope.dashboard.mainStageName = $scope.dashboard.mainStagesRaw[0].name;
                    getProfileSteps(1, $scope.dashboard.mainStageId, $scope.dashboard.mainStages);
                    $scope.dashboard.mainProfileStepId = 4;
                } else {
                    $scope.dashboard.mainStageId = null;
                    $scope.dashboard.mainStageName = '';
                }
                if ($scope.dashboard.stages.length > 1) {
                    $scope.dashboard.stageId = $scope.dashboard.stages[1].id;
                    $scope.dashboard.stageName = $scope.dashboard.stagesRaw[0].name;
                    getProfileSteps(2, $scope.dashboard.stageId, $scope.dashboard.stages);
                    $scope.dashboard.profileStepId = 4;
                } else {
                    $scope.dashboard.stageId = null;
                    $scope.dashboard.stageName = '';
                }
                dashboardsService.getParticipantsBy($scope.dashboard.profileId, $scope.dashboard.mainStageId, $scope.projectsModel, $scope.departmentsModel, $scope.teamsModel, $scope.dashboard.profileStageGroupId).then(function (data) {

                    $scope.dashboard.mainParticipants = [];
                    $scope.dashboard.mainParticipantsOptions = [];
                    $scope.dashboard.mainParticipantsModel = [];

                    $scope.dashboard.mainEvaluators = [];
                    $scope.dashboard.mainEvaluatorsOptions = [];
                    $scope.dashboard.mainEvaluatorsModel = [];
                    $scope.dashboard.isMainEvaluatorsEnabled = false;

                    angular.forEach(data, function (item) {
                        $scope.dashboard.mainParticipants.push({ id: item.participantId, name: item.firstName + " " + item.lastName });
                    });

                    if ($scope.dashboard.mainParticipants.length > 0) {
                        $scope.dashboard.mainParticipants.splice(0, 0,
                            {
                                id: -1, name: $translate.instant('SCORECARD_BENCHMARK')
                            }
                        );
                        $scope.dashboard.mainParticipantsOptions = getMultiSelectOptions($scope.dashboard.mainParticipants);
                    }

                });
                dashboardsService.getParticipantsBy($scope.dashboard.profileId, $scope.dashboard.stageId, $scope.projectsModel, $scope.departmentsModel, $scope.teamsModel, $scope.dashboard.profileStageGroupId).then(function (data) {

                    $scope.dashboard.participants = [];
                    $scope.dashboard.participantsOptions = [];
                    $scope.dashboard.participantsModel = [];

                    $scope.dashboard.evaluators = [];
                    $scope.dashboard.evaluatorsOptions = [];
                    $scope.dashboard.evaluatorsModel = [];
                    $scope.dashboard.isEvaluatorsEnabled = false;

                    angular.forEach(data, function (item) {
                        $scope.dashboard.mainParticipants.push({ id: item.participantId, name: item.firstName + " " + item.lastName });
                        $scope.dashboard.participants.push({ id: item.participantId, name: item.firstName + " " + item.lastName });
                    });

                    if ($scope.dashboard.participants.length > 0) {
                        $scope.dashboard.participants.splice(0, 0,
                            {
                                id: -1, name: $translate.instant('SCORECARD_BENCHMARK')
                            }
                        );
                        $scope.dashboard.participantsOptions = getMultiSelectOptions($scope.dashboard.participants);
                    }
                });
            });
        }

        function profileChanged() {
            clearParticipants();
            clearStages();
            clearProfileSteps()
            $scope.dashboard.mainStepsOfProfile = [{ id: null, label: $translate.instant('COMMON_SELECT_PROFILE_STEPS') }];
            $scope.dashboard.mainProfileStepId = $scope.dashboard.mainStepsOfProfile[0].id;
            $scope.dashboard.stepsOfProfile = [{ id: null, label: $translate.instant('COMMON_SELECT_PROFILE_STEPS') }];
            $scope.dashboard.profileStepId = $scope.dashboard.stepsOfProfile[0].id;
            $scope.dashboard.profileType = 0;
            if ($scope.dashboard.profileId > 0) {
                var selectedProfile = _.find($scope.dashboard.profiles, function (profile) {
                    return profile.id == $scope.dashboard.profileId;
                });

                if (selectedProfile) {
                    $scope.dashboard.profileType = selectedProfile.profileTypeId;
                    if (selectedProfile.profileTypeId == profilesTypesEnum.soft) {
                        clearEvaluators();

                        if ($scope.dashboard.mainStageId === $scope.dashboard.firstStageId) {
                            $scope.dashboard.mainStepsOfProfile = getDefaultSoftProfileTypes();
                        }
                        else {
                            $scope.dashboard.mainStepsOfProfile.push(softProfileTypesEnum.initialKPIScores);
                            $scope.dashboard.mainStepsOfProfile.push(softProfileTypesEnum.finalKPIResults);
                        }


                        if ($scope.dashboard.stageId === $scope.dashboard.firstStageId) {
                            $scope.dashboard.stepsOfProfile = getDefaultSoftProfileTypes();
                        }
                        else {
                            $scope.dashboard.stepsOfProfile.push(softProfileTypesEnum.initialKPIScores);
                            $scope.dashboard.stepsOfProfile.push(softProfileTypesEnum.finalKPIResults);
                        }

                        //$scope.dashboard.mainStepsOfProfile = getDefaultSoftProfileTypes();
                        //$scope.dashboard.mainProfileStepId = $scope.dashboard.mainStepsOfProfile[0].id;
                        //$scope.dashboard.stepsOfProfile = getDefaultSoftProfileTypes();
                        //$scope.dashboard.profileStepId = $scope.dashboard.stepsOfProfile[0].id;

                    }
                    else if (selectedProfile.profileTypeId == profilesTypesEnum.knowledgetest) {
                        $scope.dashboard.mainStepsOfProfile = getDefaultKTProfileTypes();
                        //$scope.dashboard.mainProfileStepId = $scope.dashboard.mainStepsOfProfile[0].id;
                        $scope.dashboard.stepsOfProfile = getDefaultKTProfileTypes();
                        //$scope.dashboard.profileStepId = $scope.dashboard.stepsOfProfile[0].id;

                    }
                }
            }
            getParticipants();
        }
        function getDefaultSoftProfileTypes() {
            var types = [{ id: null, label: $translate.instant('COMMON_SELECT_PROFILE_STEPS') }];
            types.push(softProfileTypesEnum.startProfile);
            types.push(softProfileTypesEnum.finalProfile);
            types.push(softProfileTypesEnum.initialKPI);
            types.push(softProfileTypesEnum.finalKpi);
            $scope.dashboard.mainProfileStepId = softProfileTypesEnum.startProfile.id;
            $scope.dashboard.profileStepId = softProfileTypesEnum.startProfile.id;
            return types;
        };
        function getDefaultKTProfileTypes() {
            var types = [{ id: null, label: $translate.instant('COMMON_SELECT_PROFILE_STEPS') }];
            types.push($scope.ktProfileTypes.start);
            types.push($scope.ktProfileTypes.final);

            $scope.dashboard.mainProfileStepId = $scope.ktProfileTypes.start.id;
            $scope.dashboard.profileStepId = $scope.ktProfileTypes.start.id;
            return types;
        };
        var clearParticipants = function () {
            $scope.participants = [];
            $scope.dashboard.mainParticipantsOptions = [];
            $scope.dashboard.mainParticipantsModel = [];
            $scope.dashboard.participantsOptions = [];
            $scope.dashboard.participantsModel = [];
        };
        var clearEvaluators = function () {
            $scope.dashboard.mainEvaluatorsModel = [];
            $scope.dashboard.evaluatorsModel = [];
            $scope.dashboard.mainEvaluatorsOptions = [];
            $scope.dashboard.evaluatorsOptions = [];
        };
        var clearStages = function () {
            $scope.dashboard.mainStageId = '';
            $scope.dashboard.stageId = '';
            $scope.dashboard.mainStages = [];
            $scope.dashboard.stages = [];
        };

        var clearProfileSteps = function () {
            $scope.dashboard.mainProfileStepId = null;
            $scope.dashboard.profileStepId = null;
            $scope.dashboard.mainStepsOfProfile = [{ id: null, label: $translate.instant('COMMON_SELECT_PROFILE_STEPS') }];
            $scope.dashboard.stepsOfProfile = [{ id: null, label: $translate.instant('COMMON_SELECT_PROFILE_STEPS') }];
        };
        function getLabelTextFromOptions(text, profileTypeOptions, id) {
            angular.forEach(profileTypeOptions, function (profileType, index) {
                if (id == profileType.id) {
                    text += profileType.label;
                }
            });
            return text;
        }

        var getLabelText = function (options, ids) {
            var text = "";
            var optionsCount = ids.length;
            _.forEach(options, function (option) {
                if (_.any(ids, function (idObj) {
                    return idObj.id == option.id
                })) {
                    text += option.label;
                    if (--optionsCount) {
                        text += ', ';
                    }
                }
            });
            return text;
        };

        function getDashboardData() {
            if ($scope.dashboard.profileType == profilesTypesEnum.soft) {

                var mainEvaluatorsModel = $scope.dashboard.mainEvaluatorsModel;
                if ($scope.dashboard.mainProfileStepId == softProfileTypesEnum.finalProfile.id || $scope.dashboard.mainProfileStepId == softProfileTypesEnum.finalKpi.id || $scope.dashboard.mainProfileStepId == softProfileTypesEnum.finalKPIResults.id) {
                    mainEvaluatorsModel = [];
                }
                var evaluatorsModel = $scope.dashboard.evaluatorsModel;
                if ($scope.dashboard.profileStepId == softProfileTypesEnum.finalProfile.id || $scope.dashboard.profileStepId == softProfileTypesEnum.finalKpi.id || $scope.dashboard.profileStepId == softProfileTypesEnum.finalKPIResults.id) {
                    evaluatorsModel = [];
                }

                dashboardsService.getDashboardData($scope.dashboard.profileId, $scope.dashboard.isShowBenchmark, $scope.dashboard.mainParticipantsModel, mainEvaluatorsModel, $scope.dashboard.mainStageId, $scope.dashboard.mainProfileStepId, $scope.dashboard.periodId).then(function (data) {
                    $scope.dashboard.isShowReport = true;
                    $scope.dashboard.compareReportData = null;
                    if (!data) {
                        data = {};
                    }
                    data.showGraph = false;
                    data.showKpiBar = false;
                    data.showGauge = false;
                    //var isStartStage = false;
                    //if ($scope.mainStages.length > 1) {
                    //    if ($scope.mainStages[0].id == $scope.dashboard.mainStageId) {
                    //        isStartStage = true;
                    //    }
                    //}
                    //else if ($scope.dashboard.mainStages.length > 1) {
                    //    if ($scope.dashboard.mainStages[0].id == $scope.dashboard.mainStageId) {
                    //        isStartStage = true;
                    //    }
                    //}
                    if ($scope.dashboard.mainStageName == "Start Stage" || $scope.dashboard.mainStageName.indexOf("Uke 1") > -1) {
                        //Rule1 - Self Evalution
                        if ($scope.dashboard.mainParticipantsModel.length > 0) {
                            //Rule1 - Self Evalution
                            if ((!evaluatorsModel.length > 0)) {
                                data.showGauge = true;
                                data.showGraph = true;
                                data.showKpiBar = true;

                                data.showCompareGauge = false;
                                data.showCompareKpi = false;

                                if ($scope.dashboard.mainProfileStepId == softProfileTypesEnum.finalProfile.id) {
                                    data.showKpiBar = true // as per 25 January Bug.pptx;;
                                }
                                if ($scope.dashboard.mainProfileStepId == softProfileTypesEnum.initialKPI.id || $scope.dashboard.mainProfileStepId == softProfileTypesEnum.finalKpi.id) {
                                    data.showKpiBar = true;
                                }
                            }
                            else if (evaluatorsModel.length > 0) {
                                //Rule2 - Me and MYBoss
                                if ($scope.dashboard.mainProfileStepId == softProfileTypesEnum.startProfile.id || $scope.dashboard.mainProfileStepId == softProfileTypesEnum.finalProfile.id) {
                                    data.showGraph = true;
                                    data.showGauge = true;
                                    data.showKpiBar = false;

                                    data.showCompareGauge = false;
                                    data.showCompareKpi = false;
                                }
                                else if ($scope.dashboard.mainProfileStepId == softProfileTypesEnum.initialKPI.id) {
                                    data.showGauge = true;
                                    data.showGraph = true;
                                    data.showKpiBar = true;
                                    data.showCompareGauge = false;
                                    data.showCompareKpi = false;
                                }
                                else if ($scope.dashboard.mainProfileStepId == softProfileTypesEnum.finalKpi.id) {
                                    data.showGauge = true;
                                    data.showGraph = true;
                                    data.showKpiBar = false;
                                    data.showCompareGauge = false;
                                    data.showCompareKpi = false;
                                }
                            }
                            // Rule 4 - ME and Compare to
                            // Rule 4 - ME and Compare to
                            if ($scope.dashboard.participantsModel.length == 1) {
                                if ($scope.dashboard.participantsModel[0].id == -1) {
                                    data.showCompareGauge = false;
                                    data.showCompareKpi = false;
                                }
                                else if ($scope.filter.mainProfileStepId == softProfileTypesEnum.finalKpi.id && $scope.filter.profileStepId == softProfileTypesEnum.finalKpi.id && participantsModel[0].id == $scope.filter.mainParticipantsModel[0].id) {
                                    data.showCompareKpi = false;
                                    data.showCompareGauge = false;
                                }
                                else {
                                    if ((!evaluatorsModel.length > 0)) {
                                        //$scope.filteredResult.showGauge = true;
                                        //$scope.filteredResult.showGraph = true;
                                        //$scope.filteredResult.showKpiBar = false;

                                        data.showCompareGauge = true;
                                        data.showCompareKpi = true;

                                        if ($scope.dashboard.profileStepId == softProfileTypesEnum.initialKPI.id || $scope.dashboard.profileStepId == softProfileTypesEnum.finalKpi.id) {

                                            data.showCompareKpi = true;
                                            data.showCompareGauge = true;
                                        }
                                    }
                                    else if (evaluatorsModel.length > 0) {
                                        data.showCompareGauge = true;
                                        data.showCompareKpi = false;
                                    }
                                }
                            }
                            else if ($scope.dashboard.participantsModel.length > 1) {
                                data.showGauge = true;
                                data.showGraph = true;
                                data.showKpiBar = false;

                                data.showCompareGauge = true;
                                data.showCompareKpi = false;
                            }
                            else {
                                data.showCompareGauge = false;
                                data.showCompareKpi = false;
                            }
                        }
                        else {
                            data.showGraph = false;
                            data.showKpiBar = false;
                            data.showGauge = false;
                            data.showCompareGauge = false;
                            data.showCompareKpi = false;
                        }
                    }


                    else {
                        if ($scope.dashboard.mainParticipantsModel.length == 1) {
                            if (!($scope.dashboard.participantsModel.length > 0)) {
                                if ((!evaluatorsModel.length > 0)) {

                                    if ($scope.dashboard.mainProfileStepId == softProfileTypesEnum.initialKPIScores.id) {
                                        data.showGraph = true;
                                        data.showKpiBar = false;
                                        data.showGauge = true;

                                        data.showCompareGauge = false;
                                        data.showCompareKpi = false;
                                    }
                                    else if ($scope.dashboard.mainProfileStepId == softProfileTypesEnum.finalKPIResults.id) {
                                        data.showGraph = true;
                                        data.showKpiBar = true;
                                        data.showGauge = true;
                                        data.showCompareGauge = false;
                                        data.showCompareKpi = false;
                                    }
                                }
                                else if (evaluatorsModel.length > 0) {
                                    data.showGraph = true;
                                    data.showKpiBar = true;
                                    data.showGauge = true;

                                    data.showCompareGauge = false;
                                    data.showCompareKpi = false;

                                }
                            }
                            else {

                                if ($scope.dashboard.participantsModel.length == 1) {
                                    if ($scope.dashboard.participantsModel[0].id == -1) {
                                        data.showGauge = true;
                                        data.showGraph = true;
                                        data.showKpiBar = false;
                                        data.showCompareGauge = false;
                                        data.showCompareKpi = false;
                                    }
                                    else {
                                        if ((!evaluatorsModel.length > 0)) {
                                            data.showGauge = true;
                                            data.showGraph = true;
                                            data.showKpiBar = false;

                                            data.showCompareGauge = true;
                                            data.showCompareKpi = true;

                                            if ($scope.dashboard.mainProfileStepId == softProfileTypesEnum.initialKPIScores.id) {
                                                data.showKpiBar = false;
                                                data.showCompareKpi = true;
                                                data.showCompareGauge = true;
                                            }

                                            if ($scope.dashboard.mainProfileStepId == softProfileTypesEnum.finalKPIResults.id) {
                                                data.showKpiBar = false;
                                                data.showCompareKpi = true;
                                                data.showCompareGauge = true;
                                            }

                                        }
                                        else if (evaluatorsModel.length > 0) {

                                            data.showGauge = true;
                                            data.showGraph = true;
                                            data.showKpiBar = false;


                                            data.showCompareGauge = true;
                                            data.showCompareKpi = false;

                                            if ($scope.dashboard.mainProfileStepId == softProfileTypesEnum.initialKPIScores.id) {
                                                data.showKpiBar = true;
                                                data.showCompareKpi = true;
                                                data.showCompareGauge = true;
                                            }
                                            else if ($scope.dashboard.mainProfileStepId == softProfileTypesEnum.finalKPIResults.id) {
                                                data.showKpiBar = true;
                                                data.showCompareKpi = true;
                                                data.showCompareGauge = true;

                                            }
                                        }
                                    }
                                }
                                else if ($scope.dashboard.participantsModel.length > 1) {
                                    data.showGauge = true;
                                    data.showGraph = true;
                                    data.showKpiBar = false;

                                    data.showCompareGauge = true;
                                    data.showCompareKpi = false;
                                }
                                else {
                                    data.showCompareGauge = false;
                                    data.showCompareKpi = false;
                                }




                            }
                        }

                        else if ($scope.dashboard.mainParticipantsModel.length > 1) {

                            data.showGraph = true;
                            data.showKpiBar = false;
                            data.showGauge = true;
                            data.showCompareGauge = true;
                            data.showCompareKpi = false;
                        }
                        else {

                            data.showGraph = false;
                            data.showKpiBar = false;
                            data.showGauge = false;
                            data.showCompareGauge = false;
                            data.showCompareKpi = false;
                        }



                    }


                    //else {
                    //    if ($scope.dashboard.mainParticipantsModel.length > 0) {
                    //        if (!($scope.dashboard.participantsModel.length > 0)) {
                    //            if ((!evaluatorsModel.length > 0)) {
                    //                if ($scope.dashboard.mainProfileStepId == softProfileTypesEnum.initialKPIScores.id) {
                    //                    data.showGraph = true;
                    //                    data.showKpiBar = false;
                    //                    data.showGauge = true;

                    //                    data.showCompareGauge = true;
                    //                    data.showCompareKpi = false;
                    //                }
                    //                else if ($scope.dashboard.mainProfileStepId == softProfileTypesEnum.finalKPIResults.id) {
                    //                    data.showGraph = false;
                    //                    data.showKpiBar = false;
                    //                    data.showGauge = false;
                    //                    data.showCompareGauge = false;
                    //                    data.showCompareKpi = false;
                    //                }
                    //            }
                    //            else if (evaluatorsModel.length > 0) {
                    //                data.showGraph = false;
                    //                data.showKpiBar = false;
                    //                data.showGauge = false;

                    //                data.showCompareGauge = false;
                    //                data.showCompareKpi = false;
                    //                //if ($scope.dashboard.mainProfileStepId == softProfileTypesEnum.initialKPIScores.id || $scope.dashboard.mainProfileStepId == softProfileTypesEnum.finalKPIResults.id) {
                    //                //    $scope.dashboard.showGraph = true;
                    //                //    $scope.dashboard.showKpiBar = true;
                    //                //    $scope.dashboard.showGauge = false;
                    //                //}
                    //            }
                    //        }
                    //        else {
                    //            if ($scope.dashboard.mainProfileStepId == softProfileTypesEnum.initialKPIScores.id || $scope.dashboard.mainProfileStepId == softProfileTypesEnum.finalKPIResults.id) {
                    //                data.showGraph = true;
                    //                data.showKpiBar = true;
                    //                data.showGauge = true;
                    //            }
                    //        }
                    //    }
                    //    else {
                    //        data.showGraph = false;
                    //        data.showKpiBar = false;
                    //        data.showGauge = false;
                    //        data.showCompareGauge = false;
                    //        data.showCompareKpi = false;
                    //    }


                    //}


                    data.isCompare = false;

                    data.label = "";
                    var profileTypeName = "";
                    data.profileTypeName = getLabelTextFromOptions(profileTypeName, $scope.dashboard.mainStepsOfProfile, $scope.dashboard.mainProfileStepId);

                    angular.forEach($scope.dashboard.mainParticipantsModel, function (mParticipantSelectedEntry) {
                        angular.forEach($scope.dashboard.mainParticipantsOptions, function (mainParticipant) {
                            if (mParticipantSelectedEntry.id === mainParticipant.id) {
                                data.label += " " + mainParticipant.label;
                            }
                        });
                    });


                    if (data.evaluatorsProfileScorecards && data.evaluatorsProfileScorecards.length > 0) {
                        angular.forEach(data.evaluatorsProfileScorecards, function (evaluatorProfileScorecard) {
                            var label = "";
                            angular.forEach(evaluatorProfileScorecard.participantsId, function (sourceId) {
                                angular.forEach($scope.dashboard.mainEvaluatorsOptions, function (option) {
                                    if (option.id === sourceId) {
                                        label += " " + option.label;
                                    }
                                });
                            });
                            evaluatorProfileScorecard.label = label;
                        });
                    }

                    data.isShowWeakKpi = data.weakAreas != null ? true : false;
                    data.isShowStrongKpi = data.strongAreas != null ? true : false;

                    data.isShowBenchmark = $scope.dashboard.isShowBenchmark;

                    if ($scope.dashboard.isShowBenchmark) {
                        angular.forEach(data.performanceGroups, function (pg, pgIndex) {
                            angular.forEach(pg.skills, function (pgs, pgsIndex) {
                                data.performanceGroups[pgIndex].skills[pgsIndex].bScore = data.performanceGroups[pgIndex].skills[pgsIndex].benchmark;
                            });
                        });
                    }

                    //data.isShowGoal = $scope.dashboard.isShowGoal;
                    data.isShowGoal = false;
                    $scope.dashboard.reportData = data;
                    //$scope.ngReportData = data;
                    $scope.dashboard.reportData.mainParticipantsRaw = getLabelText($scope.dashboard.mainParticipantsOptions, $scope.dashboard.mainParticipantsModel);


                    if (($scope.dashboard.participantsModel.length > 0) || ($scope.dashboard.comparePeriodId != null)) {

                        if ($scope.dashboard.compareParticipantId == -2) {
                            $scope.dashboard.compareParticipantId = $scope.dashboard.participantId;
                        }

                        dashboardsService.getDashboardData($scope.dashboard.profileId, $scope.dashboard.isShowBenchmark, $scope.dashboard.participantsModel, evaluatorsModel, $scope.dashboard.stageId, $scope.dashboard.profileStepId, $scope.dashboard.comparePeriodId).then(function (compareData) {

                            var compareReportData = angular.copy($scope.dashboard.reportData);

                            var cProfileTypeName = "";
                            compareReportData.cProfileTypeName = getLabelTextFromOptions(cProfileTypeName, $scope.dashboard.stepsOfProfile, $scope.dashboard.profileStepId);

                            compareReportData.cLabel = "";
                            angular.forEach($scope.dashboard.participantsModel, function (participantSelectedEntry) {
                                if ($scope.dashboard.mainParticipants) {
                                    angular.forEach($scope.dashboard.participants, function (participant) {
                                        if (participantSelectedEntry.id === participant.id) {
                                            compareReportData.cLabel += " " + participant.name;
                                        }
                                    });
                                }
                            });

                            compareReportData.cAverageScore = compareData.averageScore;
                            compareReportData.cStrongAverageScore = compareData.strongAverageScore;
                            compareReportData.cWeakAverageScore = compareData.weakAverageScore;

                            angular.forEach(compareReportData.performanceGroups, function (pg, pgIndex) {
                                compareReportData.performanceGroups[pgIndex].cScore = compareData.performanceGroups[pgIndex].score;
                                //compareReportData.performanceGroups[pgIndex].cGoal = compareData.performanceGroups[pgIndex].goal;
                                angular.forEach(pg.skills, function (pgs, pgsIndex) {
                                    compareReportData.performanceGroups[pgIndex].skills[pgsIndex].cScore = compareData.performanceGroups[pgIndex].skills[pgsIndex].score;
                                    compareReportData.performanceGroups[pgIndex].skills[pgsIndex].cComment = compareData.performanceGroups[pgIndex].skills[pgsIndex].comment;
                                    compareReportData.performanceGroups[pgIndex].skills[pgsIndex].cGoal = compareData.performanceGroups[pgIndex].skills[pgsIndex].goal;
                                });
                            });


                            angular.forEach(compareReportData.strongAreas, function (item, index) {
                                var compareDataStrong = 0;
                                compareReportData.cStrongAreas = [];
                                if (compareData.strongAreas)
                                    angular.forEach(compareData.strongAreas, function (sa) {
                                        compareReportData.cStrongAreas.push(sa);
                                        if (item.id == sa.id && sa.score) {
                                            compareDataStrong = sa.score;
                                            return;
                                        }
                                    });

                                compareReportData.strongAreas[index].cScore = compareDataStrong;
                            });

                            angular.forEach(compareReportData.weakAreas, function (item, index) {
                                var compareDataWeak = 0;
                                compareReportData.cWeakAreas = [];
                                if (compareData.weakAreas)
                                    angular.forEach(compareData.weakAreas, function (sa) {
                                        compareReportData.cWeakAreas.push(sa);
                                        if (item.id == sa.id && sa.score) {
                                            compareDataWeak = sa.score;
                                            return;
                                        }
                                    });

                                compareReportData.weakAreas[index].cScore = compareDataWeak;
                            });

                            compareReportData.isCompare = true;

                            if (compareData.evaluatorsProfileScorecards && compareData.evaluatorsProfileScorecards.length > 0) {
                                angular.forEach(compareData.evaluatorsProfileScorecards, function (evaluatorProfileScorecard) {
                                    var label = "";
                                    angular.forEach(evaluatorProfileScorecard.participantsId, function (sourceId) {
                                        angular.forEach($scope.dashboard.evaluatorsOptions, function (option) {
                                            if (option.id === sourceId) {
                                                label += " " + option.label;
                                            }
                                        });
                                    });
                                    evaluatorProfileScorecard.label = label;
                                });
                            }

                            compareReportData.cEvaluatorsProfileScorecards = compareData.evaluatorsProfileScorecards;
                            compareReportData.cExtraProfileScorecards = compareData.extraProfileScorecards;
                            compareReportData.isShowCompareGoal = $scope.dashboard.isShowCompareGoal;

                            compareReportData.cParticipantIds = compareData.participantsId;
                            compareReportData.mainProfileStepId = $scope.dashboard.mainProfileStepId;
                            compareReportData.mainStageId = $scope.dashboard.mainStageId;
                            compareReportData.cProfileTypeId = $scope.dashboard.profileStepId;
                            compareReportData.cStageId = $scope.dashboard.stageId;
                            $scope.dashboard.reportData = compareReportData;

                            $scope.dashboard.reportData.participantsRaw = getLabelText($scope.dashboard.participantsOptions, $scope.dashboard.participantsModel);
                        });
                    }
                });
            }
            else if ($scope.dashboard.profileType == profilesTypesEnum.knowledgetest) {
                dashboardsService.getKTProfileAllStagesResult($scope.dashboard.profileId, $scope.dashboard.mainParticipantsModel, $scope.dashboard.mainProfileStepId == $scope.ktProfileTypes.start.id).then(function (stagesResult) {
                    $scope.dashboard.ktStagesResults = stagesResult;

                    dashboardsService.getKTDashboardData($scope.dashboard.mainParticipantsModel, $scope.dashboard.profileId,
                        $scope.dashboard.mainStageId, $scope.dashboard.mainProfileStepId == $scope.ktProfileTypes.start.id).then(function (data) {

                            $scope.data = data;

                            if ($scope.dashboard.isShowBenchmark) {
                                dashboardsService.getKTAllStagesBenchmarks($scope.dashboard.profileId).then(function (benchmarks) {
                                    $scope.benchmarksStages = benchmarks;
                                    dashboardsService.getKTBenchmark($scope.dashboard.profileId, $scope.dashboard.mainStageId).then(function (benchmark) {
                                        $scope.dashboard.reportData = $scope.data;
                                        $scope.dashboard.reportData.benchmark = benchmark;
                                        $scope.dashboard.reportData.benchmarksStages = $scope.benchmarksStages;
                                        setFilteredDataToReport();
                                        $scope.dashboard.reportData.isShowBenchmark = $scope.dashboard.isShowBenchmark;
                                        $scope.dashboard.isShowReport = true;
                                    });
                                });
                            }
                            else {
                                $scope.dashboard.reportData = $scope.data;
                                setFilteredDataToReport();
                                $scope.dashboard.isShowReport = true;
                            }

                        });
                });
            }
        }

        var setFilteredDataToReport = function () {
            $scope.filteredResult.reportData.participantsId = $scope.dashboard.mainParticipantsModel;
            //$scope.filteredResult.reportData.evaluatorsProfileScorecards = $scope.dashboard.mainEvaluatorsModel;
            $scope.filteredResult.reportData.cParticipantIds = $scope.dashboard.participantsModel;
            //$scope.filteredResult.reportData.cEvaluatorsProfileScorecards = $scope.dashboard.evaluatorsModel;
            $scope.filteredResult.reportData.mainStageId = $scope.dashboard.mainStageId;
            $scope.filteredResult.reportData.mainProfileStepId = $scope.dashboard.mainProfileStepId;
            $scope.filteredResult.reportData.cStageId = $scope.dashboard.stageId;
            $scope.filteredResult.reportData.cProfileTypeId = $scope.dashboard.profileStepId;
            $scope.filteredResult.reportData.mainParticipantsRaw = getLabelText($scope.dashboard.mainParticipantsOptions, $scope.dashboard.mainParticipantsModel);
            $scope.filteredResult.reportData.participantsRaw = getLabelText($scope.dashboard.participantsOptions, $scope.dashboard.participantsModel);
            $scope.filteredResult.reportData.mainEvolutionStageId = $scope.dashboard.mainEvolutionStageId;
            $scope.filteredResult.reportData.evolutionStageId = $scope.dashboard.evolutionStageId;
            $scope.filteredResult.reportData.isShowBenchmark = $scope.dashboard.isShowBenchmark;

            $scope.filteredResult.reportData.mainParticipants = $scope.dashboard.mainParticipantsOptions;
            $scope.filteredResult.reportData.participants = $scope.dashboard.participantsOptions;
        }

        $scope.dashboard.compareParticipantChanged = compareParticipantChanged;
        $scope.dashboard.profileChanged = profileChanged;
        $scope.dashboard.stageChanged = stagesHandler;
        $scope.dashboard.getDashboardData = getDashboardData;
        $scope.dashboard.goBack = goBack;


        $scope.dashboard.profileTypes = [{ id: 0, name: "All" }];
        _.forEach(_.keys(profilesTypesEnum), function (item) {

            var ProfileTypeName = item;
            if (item == "soft") {
                ProfileTypeName = $translate.instant('COMMON_SOFT_PROFILE')
            }
            else if (item == "knowledgetest") {
                ProfileTypeName = $translate.instant('LEFTMENU_KNOWLEDGE_PROFILE')
            }
            $scope.dashboard.profileTypes.push({ id: profilesTypesEnum[item], name: ProfileTypeName });
        })
        $scope.dashboard.profileTypeId = 0;
        $scope.dashboard.profileTypeChanged = function () {
            $scope.dashboard.profiles = [{ id: null, name: $translate.instant('COMMON_SELECT_PROFILE') }];
            clearParticipants();
            clearStages();
            clearProfileSteps()

            if ($scope.dashboard.profileTypeId == profilesTypesEnum.soft) {
                clearEvaluators();


                if ($scope.dashboard.mainStageId === $scope.dashboard.firstStageId) {
                    $scope.dashboard.mainStepsOfProfile = getDefaultSoftProfileTypes();
                }
                else {
                    $scope.dashboard.mainStepsOfProfile.push(softProfileTypesEnum.initialKPIScores);
                    $scope.dashboard.mainStepsOfProfile.push(softProfileTypesEnum.finalKPIResults);
                }


                if ($scope.dashboard.stageId === $scope.dashboard.firstStageId) {
                    $scope.dashboard.stepsOfProfile = getDefaultSoftProfileTypes();
                }
                else {
                    $scope.dashboard.stepsOfProfile.push(softProfileTypesEnum.initialKPIScores);
                    $scope.dashboard.stepsOfProfile.push(softProfileTypesEnum.finalKPIResults);
                }


                //$scope.dashboard.mainStepsOfProfile = getDefaultSoftProfileTypes();
                $scope.dashboard.mainProfileStepId = $scope.dashboard.mainStepsOfProfile[0].id;
                //$scope.dashboard.stepsOfProfile = getDefaultSoftProfileTypes();
                $scope.dashboard.profileStepId = $scope.dashboard.mainStepsOfProfile[0].id;
            }
            else if ($scope.dashboard.profileTypeId == profilesTypesEnum.knowledgetest) {
                $scope.dashboard.mainStepsOfProfile = getDefaultKTProfileTypes();
                $scope.dashboard.mainProfileStepId = $scope.dashboard.mainStepsOfProfile[0].id;
                $scope.dashboard.stepsOfProfile = getDefaultKTProfileTypes();
                $scope.dashboard.profileStepId = $scope.dashboard.mainStepsOfProfile[0].id;
            }
            if ($scope.dashboard.organizationId) {
                dashboardsService.getProfiles($scope.dashboard.organizationId, "", $scope.dashboard.profileStatus).then(function (data) {
                    if (data) {
                        $scope.dashboard.profiles = _.filter(data, function (item) {
                            if ($scope.dashboard.profileTypeId > 0) {
                                return item.profileTypeId == $scope.dashboard.profileTypeId
                            }
                            else {
                                return item;
                            }
                        });
                        $scope.dashboard.profiles.unshift({ id: null, name: $translate.instant('COMMON_SELECT_PROFILE') });
                    }
                    else {
                        $scope.dashboard.profiles = [{ id: null, name: $translate.instant('COMMON_SELECT_PROFILE') }];
                    }
                });
                dashboardsService.getDepartments($scope.dashboard.organizationId).then(function (data) {
                    if (data) {
                        $scope.dashboard.departments = data;
                        $scope.dashboard.departmentsOptions = getMultiSelectOptions($scope.dashboard.departments);
                    }
                });
                dashboardsService.getTeams($scope.dashboard.organizationId, $scope.departmentsModel).then(function (data) {
                    if (data) {
                        $scope.dashboard.teams = data;
                        $scope.dashboard.teamsOptions = getMultiSelectOptions($scope.dashboard.teams);
                    }
                });
            }
        };

        $scope.dashboard.organizationChanged = function () {

            if ($scope.dashboard.organizationId) {
                $scope.dashboard.profileTypeId = 0;
                $scope.dashboard.profileId = null;
                dashboardsService.getProfiles($scope.dashboard.organizationId, "", $scope.dashboard.profileStatus).then(function (data) {


                    if (data) {
                        $scope.dashboard.profiles = _.filter(data, function (item) {
                            if ($scope.dashboard.profileTypeId > 0) {
                                return item.profileTypeId == $scope.dashboard.profileTypeId
                            }
                            else {
                                return item;
                            }
                        });
                        $scope.dashboard.profiles.unshift({ id: null, name: $translate.instant('COMMON_SELECT_PROFILE') });
                    }
                    else {
                        $scope.dashboard.profiles = [{ id: null, name: $translate.instant('COMMON_SELECT_PROFILE') }];
                    }
                });
                dashboardsService.getDepartments($scope.dashboard.organizationId).then(function (data) {
                    if (data) {
                        $scope.dashboard.departments = data;
                        $scope.dashboard.departmentsOptions = getMultiSelectOptions($scope.dashboard.departments);
                    }
                });
                dashboardsService.getTeams($scope.dashboard.organizationId, $scope.departmentsModel).then(function (data) {
                    if (data) {
                        $scope.dashboard.teams = data;
                        $scope.dashboard.teamsOptions = getMultiSelectOptions($scope.dashboard.teams);
                    }
                });
            }
        };
        $scope.dashboard.projectChanged = function () {
        };
        $scope.dashboard.departmentChanged = function () {
            if ($scope.dashboard.organizationId) {
                dashboardsService.getTeams($scope.dashboard.organizationId, $scope.dashboard.departmentsModel).then(function (data) {
                    if (data) {
                        $scope.dashboard.teams = data;
                        $scope.dashboard.departmentsOptions = getMultiSelectOptions($scope.dashboard.departments);
                    }
                });
                if ($scope.dashboard.profileId) {
                    getParticipants();
                }
            }
        };
        $scope.dashboard.teamChanged = function () {
            if ($scope.dashboard.organizationId && $scope.dashboard.profileId) {
                getParticipants();
            }
        };
        $scope.dashboard.mainParticipantChanged = function (participantId) {
            $scope.dashboard.participantId = participantId;
            $scope.dashboard.isMainEvaluatorsEnabled = true;
            getEvaluatorsOfParticipant($scope.dashboard.mainParticipantId, 1);

            //if ($scope.dashboard.mainProfileStepId == softProfileTypesEnum.finalProfile.id || $scope.dashboard.mainProfileStepId == softProfileTypesEnum.finalKpi.id) {
            //    $scope.dashboard.mainEvaluatorsOptions = [];
            //    $scope.dashboard.isMainEvaluatorsEnabled = false;
            //}
            //else {
            //    $scope.dashboard.isMainEvaluatorsEnabled = true;
            //    return getEvaluatorsOfParticipant($scope.dashboard.mainParticipantId, 1);
            //}
            if ($scope.dashboard.profileStepId && $scope.dashboard.profileStepId > 0) {
                getDashboardData();
            }

            //getEvaluatorsOfParticipant(participantId, 1);
        };

        $scope.dashboard.participantChanged = function (participantId) {

            $scope.dashboard.isMainEvaluatorsEnabled = true;
            getEvaluatorsOfParticipant($scope.dashboard.participantId, 2);

            //return getEvaluatorsOfParticipant(participantId, 2);
            //if ($scope.dashboard.profileStepId == softProfileTypesEnum.finalProfile.id || $scope.dashboard.profileStepId == softProfileTypesEnum.finalKpi.id) {
            //    $scope.dashboard.mainEvaluatorsOptions = [];
            //    $scope.dashboard.isMainEvaluatorsEnabled = false;
            //}
            //else {
            //    $scope.dashboard.isMainEvaluatorsEnabled = true;
            //    return getEvaluatorsOfParticipant($scope.dashboard.participantId, 2);
            //}
            if ($scope.dashboard.profileStepId && $scope.dashboard.profileStepId > 0) {
                getDashboardData();
            }
        };

        $scope.dashboard.mainEvaluatorsChanged = function (mainEvaluatorId) {
            if ($scope.dashboard.mainProfileStepId && $scope.dashboard.mainProfileStepId > 0) {
                getDashboardData();
            }

        };

        $scope.dashboard.evaluatorsChanged = function () {
            if ($scope.dashboard.profileStepId && $scope.dashboard.profileStepId > 0) {
                getDashboardData();
            }
        };

        $scope.dashboard.mainProfileStepChanged = function () {
            profileStepChanged("main");

        };

        $scope.dashboard.profileStepChanged = function () {
            profileStepChanged("compare");
        };


        $scope.dashboard.getBenchmark = function () {
            if (($scope.dashboard.mainProfileStepId && $scope.dashboard.mainProfileStepId > 0) || ($scope.dashboard.profileStepIds && $scope.dashboard.profileStepId > 0)) {
                getDashboardData();
            }
        };

        $scope.dashboard.goToDevContract = goToDevContract;
        $scope.dashboard.isShowDevContract = isShowDevContract;
        $rootScope.dashboard = $scope.dashboard;


        var getFilteredData = function () {

            $scope.filteredResult.showGraph = false;
            $scope.filteredResult.showGauge = false;
            $scope.filteredResult.showKpiBar = false;
            $scope.filteredResult.showCompareGauge = false;
            $scope.filteredResult.showCompareKpi = false;
            if ($scope.dashboard.profileType == profilesTypesEnum.soft) {
                var mainEvaluatorsModel = $scope.dashboard.mainEvaluatorsModel;
                if ($scope.dashboard.mainProfileStepId == softProfileTypesEnum.finalProfile.id || $scope.dashboard.mainProfileStepId == softProfileTypesEnum.finalKpi.id || $scope.dashboard.mainProfileStepId == softProfileTypesEnum.finalKPIResults.id) {
                    mainEvaluatorsModel = [];
                }
                var evaluatorsModel = $scope.dashboard.evaluatorsModel;
                if ($scope.dashboard.profileStepId == softProfileTypesEnum.finalProfile.id || $scope.dashboard.profileStepId == softProfileTypesEnum.finalKpi.id || $scope.dashboard.profileStepId == softProfileTypesEnum.finalKPIResults.id) {
                    evaluatorsModel = [];
                }

                var participantsModel = $scope.dashboard.participantsModel;
                dashboardsService.getDashboardData($scope.dashboard.profileId, $scope.dashboard.isShowBenchmark, $scope.dashboard.mainParticipantsModel, mainEvaluatorsModel, $scope.dashboard.mainStageId, $scope.dashboard.mainProfileStepId, null,$scope.dashboard.profileStageGroupId).then(function (data) {
                    $scope.filteredResult.isShowReport = true;
                    if ($scope.dashboard.mainStageName == "Start Stage" || $scope.dashboard.mainStageName.indexOf("Uke 1") > -1) {
                        //Rule1 - Self Evalution
                        if ($scope.dashboard.mainParticipantsModel.length == 1) {
                            //Rule1 - Self Evalution
                            if ($scope.dashboard.mainParticipantsModel[0].id == -1) {
                                $scope.filteredResult.showCompareGauge = false;
                                $scope.filteredResult.showCompareKpi = false;
                            }
                            else {

                                if ((!mainEvaluatorsModel.length > 0)) {
                                    $scope.filteredResult.showGauge = true;
                                    $scope.filteredResult.showGraph = true;
                                    $scope.filteredResult.showKpiBar = true;
                                    if ($scope.dashboard.mainProfileStepId == softProfileTypesEnum.finalProfile.id) {
                                        $scope.filteredResult.showKpiBar = true // as per 25 January Bug.pptx;
                                    }
                                    if ($scope.dashboard.mainProfileStepId == softProfileTypesEnum.initialKPI.id || $scope.dashboard.mainProfileStepId == softProfileTypesEnum.finalKpi.id) {
                                        $scope.filteredResult.showKpiBar = true;
                                    }
                                }
                                else if (mainEvaluatorsModel.length > 0) {
                                    //Rule2 - Me and MYBoss
                                    if ($scope.dashboard.mainProfileStepId == softProfileTypesEnum.startProfile.id || $scope.dashboard.mainProfileStepId == softProfileTypesEnum.finalProfile.id) {
                                        $scope.filteredResult.showGraph = true;
                                        $scope.filteredResult.showGauge = true;
                                        $scope.filteredResult.showKpiBar = false;
                                    }
                                    else if ($scope.dashboard.mainProfileStepId == softProfileTypesEnum.initialKPI.id) {
                                        $scope.filteredResult.showGauge = true;
                                        $scope.filteredResult.showGraph = true;
                                        $scope.filteredResult.showKpiBar = true;
                                    }
                                    else if ($scope.dashboard.mainProfileStepId == softProfileTypesEnum.finalKpi.id) {
                                        $scope.filteredResult.showGauge = true;
                                        $scope.filteredResult.showGraph = true;
                                        $scope.filteredResult.showKpiBar = false;
                                    }
                                }
                                // Rule 4 - ME and Compare to
                                if (participantsModel.length == 1) {
                                    if (participantsModel[0].id == -1) {
                                        $scope.filteredResult.showCompareGauge = false;
                                        $scope.filteredResult.showCompareKpi = false;
                                    }
                                    else if ($scope.dashboard.mainProfileStepId == softProfileTypesEnum.finalKpi.id && $scope.dashboard.profileStepId == softProfileTypesEnum.finalKpi.id && participantsModel[0].id == $scope.dashboard.mainParticipantsModel[0].id) {
                                        $scope.filteredResult.showCompareKpi = false;
                                        $scope.filteredResult.showCompareGauge = false;
                                    }
                                    else {
                                        if ((!evaluatorsModel.length > 0)) {
                                            $scope.filteredResult.showCompareGauge = true;
                                            $scope.filteredResult.showCompareKpi = true;

                                            if ($scope.dashboard.profileStepId == softProfileTypesEnum.initialKPI.id || $scope.dashboard.profileStepId == softProfileTypesEnum.finalKpi.id) {
                                                $scope.filteredResult.showCompareKpi = true;
                                                $scope.filteredResult.showCompareGauge = true;
                                            }
                                        }
                                        else if (evaluatorsModel.length > 0) {
                                            $scope.filteredResult.showCompareGauge = true;
                                            $scope.filteredResult.showCompareKpi = false;
                                        }
                                    }
                                }
                                else if (participantsModel.length > 1) {
                                    $scope.filteredResult.showGauge = true;
                                    $scope.filteredResult.showGraph = true;
                                    $scope.filteredResult.showKpiBar = false;

                                    $scope.filteredResult.showCompareGauge = true;
                                    $scope.filteredResult.showCompareKpi = false;
                                }
                                else {
                                    $scope.filteredResult.showCompareGauge = false;
                                    $scope.filteredResult.showCompareKpi = false;
                                }
                            }
                        }
                        else if ($scope.dashboard.mainParticipantsModel.length > 1) {

                            $scope.filteredResult.showGraph = true;
                            $scope.filteredResult.showGauge = true;
                            $scope.filteredResult.showKpiBar = false;

                            // Rule 4 - ME and Compare to
                            if (participantsModel.length == 1) {
                                if ((!mainEvaluatorsModel.length > 0)) {

                                    $scope.filteredResult.showCompareGauge = true;
                                    $scope.filteredResult.showCompareKpi = false;

                                    if ($scope.dashboard.mainProfileStepId == softProfileTypesEnum.initialKPI.id || $scope.dashboard.mainProfileStepId == softProfileTypesEnum.finalKpi.id) {
                                        $scope.filteredResult.showKpiBar = true;
                                        $scope.filteredResult.showCompareKpi = true;
                                        $scope.filteredResult.showCompareGauge = true;
                                    }

                                }

                            }
                            else if (participantsModel.length > 1) {
                                $scope.filteredResult.showGauge = true;
                                $scope.filteredResult.showGraph = true;
                                $scope.filteredResult.showKpiBar = false;

                                $scope.filteredResult.showCompareGauge = true;
                                $scope.filteredResult.showCompareKpi = false;
                            }
                            else {
                                $scope.filteredResult.showCompareGauge = false;
                                $scope.filteredResult.showCompareKpi = false;
                            }
                        }
                        else {
                            $scope.filteredResult.showGraph = false;
                            $scope.filteredResult.showKpiBar = false;
                            $scope.filteredResult.showGauge = false;

                        }
                    }
                    else {
                        if ($scope.dashboard.mainParticipantsModel.length == 1) {
                            if (!(participantsModel.length > 0)) {
                                if ((!mainEvaluatorsModel.length > 0)) {

                                    if ($scope.dashboard.mainProfileStepId == softProfileTypesEnum.initialKPIScores.id) {
                                        $scope.filteredResult.showGraph = true;
                                        $scope.filteredResult.showKpiBar = false;
                                        $scope.filteredResult.showGauge = true;

                                        $scope.filteredResult.showCompareGauge = false;
                                        $scope.filteredResult.showCompareKpi = false;
                                    }
                                    else if ($scope.dashboard.mainProfileStepId == softProfileTypesEnum.finalKPIResults.id) {
                                        $scope.filteredResult.showGraph = true;
                                        $scope.filteredResult.showKpiBar = true;
                                        $scope.filteredResult.showGauge = true;
                                        $scope.filteredResult.showCompareGauge = false;
                                        $scope.filteredResult.showCompareKpi = false;
                                    }
                                }
                                else if (mainEvaluatorsModel.length > 0) {
                                    $scope.filteredResult.showGraph = true;
                                    $scope.filteredResult.showKpiBar = true;
                                    $scope.filteredResult.showGauge = true;
                                    $scope.filteredResult.showCompareGauge = false;
                                    $scope.filteredResult.showCompareKpi = false;

                                }
                            }
                            else {
                                if (participantsModel.length == 1) {
                                    if (participantsModel[0].id == -1 || participantsModel[0].id == $scope.dashboard.mainParticipantsModel[0].id) {
                                        $scope.filteredResult.showGauge = true;
                                        $scope.filteredResult.showGraph = true;
                                        $scope.filteredResult.showKpiBar = true;
                                        $scope.filteredResult.showCompareGauge = false;
                                        $scope.filteredResult.showCompareKpi = false;
                                    }

                                    else {
                                        if ((!mainEvaluatorsModel.length > 0)) {
                                            $scope.filteredResult.showGauge = true;
                                            $scope.filteredResult.showGraph = true;
                                            $scope.filteredResult.showKpiBar = false;

                                            $scope.filteredResult.showCompareGauge = true;
                                            $scope.filteredResult.showCompareKpi = true;

                                            if ($scope.dashboard.mainProfileStepId == softProfileTypesEnum.initialKPIScores.id) {
                                                $scope.filteredResult.showKpiBar = false;
                                                $scope.filteredResult.showCompareKpi = true;
                                                $scope.filteredResult.showCompareGauge = true;
                                            }

                                            if ($scope.dashboard.mainProfileStepId == softProfileTypesEnum.finalKPIResults.id) {
                                                $scope.filteredResult.showKpiBar = false;
                                                $scope.filteredResult.showCompareKpi = true;
                                                $scope.filteredResult.showCompareGauge = true;
                                            }

                                        }
                                        else if (mainEvaluatorsModel.length > 0) {

                                            $scope.filteredResult.showGauge = true;
                                            $scope.filteredResult.showGraph = true;
                                            $scope.filteredResult.showKpiBar = false;


                                            $scope.filteredResult.showCompareGauge = true;
                                            $scope.filteredResult.showCompareKpi = false;

                                            if ($scope.dashboard.mainProfileStepId == softProfileTypesEnum.initialKPIScores.id) {
                                                $scope.filteredResult.showKpiBar = true;
                                                $scope.filteredResult.showCompareKpi = true;
                                                $scope.filteredResult.showCompareGauge = true;
                                            }
                                            else if ($scope.dashboard.mainProfileStepId == softProfileTypesEnum.finalKPIResults.id) {
                                                $scope.filteredResult.showKpiBar = true;
                                                $scope.filteredResult.showCompareKpi = true;
                                                $scope.filteredResult.showCompareGauge = true;

                                            }
                                        }
                                    }
                                }
                                else if (participantsModel.length > 1) {
                                    $scope.filteredResult.showGauge = true;
                                    $scope.filteredResult.showGraph = true;
                                    $scope.filteredResult.showKpiBar = false;

                                    $scope.filteredResult.showCompareGauge = true;
                                    $scope.filteredResult.showCompareKpi = false;
                                }
                                else {
                                    $scope.filteredResult.showCompareGauge = false;
                                    $scope.filteredResult.showCompareKpi = false;
                                }
                            }
                        }

                        else if ($scope.dashboard.mainParticipantsModel.length > 1) {

                            $scope.filteredResult.showGraph = true;
                            $scope.filteredResult.showKpiBar = false;
                            $scope.filteredResult.showGauge = true;
                            $scope.filteredResult.showCompareGauge = true;
                            $scope.filteredResult.showCompareKpi = false;
                        }
                        else {

                            $scope.filteredResult.showGraph = false;
                            $scope.filteredResult.showKpiBar = false;
                            $scope.filteredResult.showGauge = false;
                            $scope.filteredResult.showCompareGauge = false;
                            $scope.filteredResult.showCompareKpi = false;
                        }
                    }

                    $scope.filteredResult.compareReportData = null;

                    if (!data) {
                        data = {};
                    }

                    data.isCompare = false;

                    data.label = "";
                    var profileTypeName = "";
                    data.profileTypeName = getLabelTextFromOptions(profileTypeName, $scope.dashboard.mainStepsOfProfile, $scope.dashboard.mainProfileStepId);

                    angular.forEach($scope.dashboard.mainParticipantsModel, function (mParticipantSelectedEntry) {
                        angular.forEach($scope.dashboard.mainParticipantsOptions, function (mainParticipant) {
                            if (mParticipantSelectedEntry.id === mainParticipant.id) {
                                data.label += " " + mainParticipant.label;
                            }
                        });
                    });


                    if (data.evaluatorsProfileScorecards && data.evaluatorsProfileScorecards.length > 0) {
                        angular.forEach(data.evaluatorsProfileScorecards, function (evaluatorProfileScorecard) {
                            var label = "";
                            angular.forEach(evaluatorProfileScorecard.participantsId, function (sourceId) {
                                angular.forEach($scope.dashboard.mainEvaluatorsOptions, function (option) {
                                    if (option.id === sourceId) {
                                        label += " " + option.label;
                                    }
                                });
                            });
                            evaluatorProfileScorecard.label = label;
                        });
                    }

                    data.isShowWeakKpi = data.weakAreas != null ? true : false;
                    data.isShowStrongKpi = data.strongAreas != null ? true : false;

                    data.isShowBenchmark = $scope.dashboard.isShowBenchmark;
                    $scope.filteredResult.reportData = data;
                    if ($scope.dashboard.isShowBenchmark) {
                        angular.forEach(data.performanceGroups, function (pg, pgIndex) {
                            angular.forEach(pg.skills, function (pgs, pgsIndex) {
                                data.performanceGroups[pgIndex].skills[pgsIndex].bScore = data.performanceGroups[pgIndex].skills[pgsIndex].benchmark;
                            });
                        });
                    }

                    //data.isShowGoal = $scope.dashboard.isShowGoal;
                    data.isShowGoal = false;
                    $scope.filteredResult.reportData = data;


                    if ((participantsModel.length > 0) || ($scope.dashboard.comparePeriodId != null)) {

                        if ($scope.dashboard.compareParticipantId == -2) {
                            $scope.dashboard.compareParticipantId = $scope.dashboard.participantId;
                        }

                        dashboardsService.getDashboardData($scope.dashboard.profileId, $scope.dashboard.isShowBenchmark, participantsModel, evaluatorsModel, $scope.dashboard.stageId, $scope.dashboard.profileStepId, $scope.dashboard.comparePeriodId).then(function (compareData) {

                            var compareReportData = angular.copy($scope.filteredResult.reportData);

                            var cProfileTypeName = "";
                            compareReportData.cProfileTypeName = getLabelTextFromOptions(cProfileTypeName, $scope.dashboard.stepsOfProfile, $scope.dashboard.profileStepId);

                            compareReportData.cLabel = "";
                            angular.forEach(participantsModel, function (participantSelectedEntry) {
                                if ($scope.dashboard.participantsOptions) {
                                    angular.forEach($scope.dashboard.participantsOptions, function (participant) {
                                        if (participantSelectedEntry.id === participant.id) {
                                            compareReportData.cLabel += " " + participant.label;
                                        }
                                    });
                                }
                            });

                            compareReportData.cAverageScore = compareData.averageScore;
                            compareReportData.cStrongAverageScore = compareData.strongAverageScore;
                            compareReportData.cWeakAverageScore = compareData.weakAverageScore;

                            angular.forEach(compareReportData.performanceGroups, function (pg, pgIndex) {
                                compareReportData.performanceGroups[pgIndex].cScore = compareData.performanceGroups[pgIndex].score;
                                //compareReportData.performanceGroups[pgIndex].cGoal = compareData.performanceGroups[pgIndex].goal;
                                angular.forEach(pg.skills, function (pgs, pgsIndex) {
                                    compareReportData.performanceGroups[pgIndex].skills[pgsIndex].cScore = compareData.performanceGroups[pgIndex].skills[pgsIndex].score;
                                    compareReportData.performanceGroups[pgIndex].skills[pgsIndex].cComment = compareData.performanceGroups[pgIndex].skills[pgsIndex].comment;
                                    compareReportData.performanceGroups[pgIndex].skills[pgsIndex].cGoal = compareData.performanceGroups[pgIndex].skills[pgsIndex].goal;
                                });
                            });


                            angular.forEach(compareReportData.strongAreas, function (item, index) {
                                var compareDataStrong = 0;
                                compareReportData.cStrongAreas = [];
                                if (compareData.strongAreas)
                                    angular.forEach(compareData.strongAreas, function (sa) {
                                        compareReportData.cStrongAreas.push(sa);
                                        if (item.id == sa.id && sa.score) {
                                            compareDataStrong = sa.score;
                                            return;
                                        }
                                        else {

                                        }
                                    });

                                compareReportData.strongAreas[index].cScore = compareDataStrong;
                            });

                            angular.forEach(compareReportData.weakAreas, function (item, index) {
                                var compareDataWeak = 0;
                                compareReportData.cWeakAreas = [];
                                if (compareData.weakAreas)
                                    angular.forEach(compareData.weakAreas, function (sa) {
                                        compareReportData.cWeakAreas.push(sa);
                                        if (item.id == sa.id && sa.score) {
                                            compareDataWeak = sa.score;
                                            return;
                                        }
                                    });

                                compareReportData.weakAreas[index].cScore = compareDataWeak;
                            });

                            compareReportData.isCompare = true;
                            if (compareData.evaluatorsProfileScorecards && compareData.evaluatorsProfileScorecards.length > 0) {
                                angular.forEach(compareData.evaluatorsProfileScorecards, function (evaluatorProfileScorecard) {
                                    var label = "";
                                    angular.forEach(evaluatorProfileScorecard.participantsId, function (sourceId) {
                                        angular.forEach($scope.dashboard.evaluatorsOptions, function (option) {
                                            if (option.id === sourceId) {
                                                label += " " + option.label;
                                            }
                                        });
                                    });
                                    evaluatorProfileScorecard.label = label;
                                });
                            }

                            compareReportData.cEvaluatorsProfileScorecards = compareData.evaluatorsProfileScorecards;
                            compareReportData.cExtraProfileScorecards = compareData.extraProfileScorecards;
                            compareReportData.isShowCompareGoal = $scope.dashboard.isShowCompareGoal;

                            compareReportData.cParticipantIds = compareData.participantsId;
                            compareReportData.mainProfileStepId = $scope.dashboard.mainProfileStepId;
                            compareReportData.profileStepId = $scope.dashboard.profileStepId;
                            compareReportData.mainStageId = $scope.dashboard.mainStageId;
                            compareReportData.mainStageName = $scope.dashboard.mainStageName;
                            compareReportData.cProfileTypeId = $scope.dashboard.profileStepId;
                            compareReportData.cStageId = $scope.dashboard.stageId;
                            compareReportData.stageName = $scope.dashboard.stageName;
                            compareReportData.evolutionStageId = $scope.dashboard.evolutionStageId;
                            compareReportData.mainEvolutionStageId = $scope.dashboard.mainEvolutionStageId;
                            $scope.filteredResult.reportData = compareReportData;
                            setFilteredDataToReport();
                        });
                    }
                    else {
                        setFilteredDataToReport();
                    }

                    //if (($scope.dashboard.mainEvaluatorsModel.length > 0) || ($scope.dashboard.comparePeriodId != null)) {

                    //    if ($scope.dashboard.compareParticipantId == -2) {
                    //        $scope.dashboard.compareParticipantId = $scope.dashboard.participantId;
                    //    }

                    //    dashboardsService.getDashboardData($scope.dashboard.profileId, $scope.dashboard.isShowBenchmark, $scope.dashboard.participantsModel, $scope.dashboard.evaluatorsModel, $scope.dashboard.stageId, $scope.dashboard.profileStepId, $scope.dashboard.comparePeriodId).then(function (compareData) {

                    //        var compareReportData = angular.copy($scope.filteredResult.reportData);

                    //        var cProfileTypeName = "";
                    //        compareReportData.cProfileTypeName = getLabelTextFromOptions(cProfileTypeName, $scope.dashboard.stepsOfProfile, $scope.dashboard.profileStepId);

                    //        compareReportData.cLabel = "";
                    //        angular.forEach($scope.dashboard.participantsModel, function (participantSelectedEntry) {
                    //            if ($scope.dashboard.participantsOptions) {
                    //                angular.forEach($scope.dashboard.participantsOptions, function (participant) {
                    //                    if (participantSelectedEntry.id === participant.id) {
                    //                        compareReportData.cLabel += " " + participant.label;
                    //                    }
                    //                });
                    //            }
                    //        });

                    //        compareReportData.cAverageScore = compareData.averageScore;
                    //        compareReportData.cStrongAverageScore = compareData.strongAverageScore;
                    //        compareReportData.cWeakAverageScore = compareData.weakAverageScore;

                    //        angular.forEach(compareReportData.performanceGroups, function (pg, pgIndex) {
                    //            compareReportData.performanceGroups[pgIndex].cScore = compareData.performanceGroups[pgIndex].score;
                    //            //compareReportData.performanceGroups[pgIndex].cGoal = compareData.performanceGroups[pgIndex].goal;
                    //            angular.forEach(pg.skills, function (pgs, pgsIndex) {
                    //                compareReportData.performanceGroups[pgIndex].skills[pgsIndex].cScore = compareData.performanceGroups[pgIndex].skills[pgsIndex].score;
                    //                compareReportData.performanceGroups[pgIndex].skills[pgsIndex].cComment = compareData.performanceGroups[pgIndex].skills[pgsIndex].comment;
                    //                compareReportData.performanceGroups[pgIndex].skills[pgsIndex].cGoal = compareData.performanceGroups[pgIndex].skills[pgsIndex].goal;
                    //            });
                    //        });


                    //        angular.forEach(compareReportData.strongAreas, function (item, index) {
                    //            var compareDataStrong = 0;
                    //            if (compareData.strongAreas)
                    //                angular.forEach(compareData.strongAreas, function (sa) {
                    //                    if (item.id == sa.id && sa.score) {
                    //                        compareDataStrong = sa.score;
                    //                        return;
                    //                    }
                    //                });

                    //            compareReportData.strongAreas[index].cScore = compareDataStrong;
                    //        });

                    //        angular.forEach(compareReportData.weakAreas, function (item, index) {
                    //            var compareDataWeak = 0;
                    //            if (compareData.weakAreas)
                    //                angular.forEach(compareData.weakAreas, function (sa) {
                    //                    if (item.id == sa.id && sa.score) {
                    //                        compareDataWeak = sa.score;
                    //                        return;
                    //                    }
                    //                });

                    //            compareReportData.weakAreas[index].cScore = compareDataWeak;
                    //        });
                    //        compareReportData.isCompare = true;
                    //        if (compareData.evaluatorsProfileScorecards && compareData.evaluatorsProfileScorecards.length > 0) {
                    //            angular.forEach(compareData.evaluatorsProfileScorecards, function (evaluatorProfileScorecard) {
                    //                var label = "";
                    //                angular.forEach(evaluatorProfileScorecard.participantsId, function (sourceId) {
                    //                    angular.forEach($scope.dashboard.evaluatorsOptions, function (option) {
                    //                        if (option.id === sourceId) {
                    //                            label += " " + option.label;
                    //                        }
                    //                    });
                    //                });
                    //                evaluatorProfileScorecard.label = label;
                    //            });
                    //        }
                    //        compareReportData.cEvaluatorsProfileScorecards = compareData.evaluatorsProfileScorecards;
                    //        compareReportData.cExtraProfileScorecards = compareData.extraProfileScorecards;
                    //        compareReportData.isShowCompareGoal = $scope.dashboard.isShowCompareGoal;

                    //        compareReportData.cParticipantIds = compareData.participantsId;
                    //        compareReportData.mainProfileStepId = $scope.dashboard.mainProfileStepIds;
                    //        compareReportData.mainStageId = $scope.dashboard.mainStageId;
                    //        compareReportData.cProfileTypeId = $scope.dashboard.profileStepId;
                    //        compareReportData.cStageId = $scope.dashboard.stageId;
                    //        $scope.filteredResult.reportData = compareReportData;
                    //        setFilteredDataToReport();
                    //    });
                    //}
                });
            }
            else {
                dashboardsService.getKTProfileAllStagesResult($scope.dashboard.profileId, $scope.dashboard.mainParticipantsModel,
                    $scope.dashboard.mainProfileStepId == $scope.ktProfileTypes.start.id).then(function (stagesResult) {
                        $scope.filteredResult.ktStagesResults = stagesResult;

                        dashboardsService.getKTDashboardData($scope.dashboard.mainParticipantsModel, $scope.dashboard.profileId,
                            $scope.dashboard.mainStageId, $scope.dashboard.mainProfileStepId == $scope.ktProfileTypes.start.id).then(function (data) {

                                $scope.data = data;

                                if ($scope.dashboard.isShowBenchmark) {
                                    dashboardsService.getKTAllStagesBenchmarks($scope.dashboard.profileId).then(function (benchmarks) {
                                        $scope.benchmarksStages = benchmarks;
                                        dashboardsService.getKTBenchmark($scope.dashboard.profileId, $scope.dashboard.mainStageId).then(function (benchmark) {
                                            $scope.filteredResult.reportData = $scope.data;
                                            $scope.filteredResult.reportData.benchmark = benchmark;
                                            $scope.filteredResult.reportData.benchmarksStages = $scope.benchmarksStages;
                                            setFilteredDataToReport();
                                            $scope.filteredResult.reportData.isShowBenchmark = $scope.dashboard.isShowBenchmark;
                                            $scope.filteredResult.isShowReport = true;
                                        });
                                    });
                                }
                                else {
                                    $scope.filteredResult.reportData = $scope.data;
                                    setFilteredDataToReport();
                                    $scope.filteredResult.isShowReport = true;
                                }

                            });
                    });
            }
        };



        function getFilteredComparisonData() {
            dashboardsService.getKTProfileAllStagesResult($scope.dashboard.profileId, $scope.dashboard.participantsModel,
                $scope.dashboard.profileStepId == $scope.ktProfileTypes.start.id).then(function (stagesResult) {
                    $scope.filteredResult.ktCompareStagesResults = stagesResult;

                    dashboardsService.getKTDashboardData($scope.dashboard.participantsModel, $scope.dashboard.profileId,
                        $scope.dashboard.stageId, $scope.filter.profileStepId == $scope.ktProfileTypes.start.id).then(function (data) {
                            $scope.filteredResult.compareReportData = data;
                            $scope.filteredResult.isShowCompareReport = true;
                        });
                });
        }
        $scope.$on('filterChanged', function (event, message) {
            $scope.filteredResult.showCompareKpi = false;
            $scope.filteredResult.showCompareGauge = false;
            $scope.filteredResult.showGraph = false;
            $scope.filteredResult.showKpiBar = false;
            $scope.filteredResult.showGauge = false;
            $scope.filteredResult.isShowReport = $scope.dashboard.isLoadReport;
            $scope.filteredResult.isShowCompareReport = $scope.dashboard.isLoadCompareReport;
            if ($scope.dashboard.isLoadReport) {
                getFilteredData();
            }
            else {
                $scope.filteredResult.isShowReport = false;
            }

            if ($scope.dashboard.isLoadCompareReport) {
                getFilteredComparisonData();
            }
            else {
                $scope.filteredResult.isShowCompareReport = false;
            }
        });
        $scope.$on('benchmarkChanged', function (event, message) {
            if ($scope.dashboard.isLoadReport) {
                getFilteredData();
            }
            if ($scope.dashboard.isLoadCompareReport) {
                getFilteredComparisonData();
            }
        });

    }
})();