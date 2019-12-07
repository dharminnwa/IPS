(function () {
    'use strict';

    angular
        .module('ips.surveyAnalysis')

        .config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
            var baseSurveyAnalysisResolve = {
                pageName1: function ($translate) {
                    return $translate.instant('MYPROFILES_VIEW_INITIAL_PROFILE');
                },
                pageName2: function ($translate) {
                    return $translate.instant('MYPROFILES_VIEW_PROFILE_PROGRESS');
                },
                profile: function ($stateParams, profilesService) {
                    return profilesService.getById($stateParams.profileId);
                },
                scorecardData: function ($stateParams, surveyAnalysisService) {
                    return surveyAnalysisService.getScorecard($stateParams.stageId, $stateParams.participantId);
                },
                surveyInfo: function ($stateParams, surveyService) {
                    return surveyService.getSurveyInfo($stateParams.participantId, $stateParams.stageId);
                },
                answers: function (surveyAnalysisService, scorecardData, $stateParams) {
                    var idToPass = $stateParams.participantId;//($stateParams.evaluateeId) ? $stateParams.evaluateeId : $stateParams.participantId;
                    return surveyAnalysisService.getPreviousAnswers(scorecardData, $stateParams.stageId, idToPass).then(function (previousAnswers) {
                        var query = '?$expand=Question&$filter=ParticipantId eq ' + $stateParams.participantId + ' and StageId eq ' + $stateParams.stageId;
                        return surveyAnalysisService.getAnswers(scorecardData, query, $stateParams.participantId, $stateParams.stageId).then(function (data) {
                            var currentAnswers = data;
                            return surveyAnalysisService.joinAnswers(previousAnswers, currentAnswers).then(function (data) {
                                return data;
                            });
                        });
                    });
                },
                answerTypes: function (profile, surveyService) {
                    return surveyService.generateAnswers(profile.scale.scaleRanges)
                },
                stageName: function ($stateParams, surveyAnalysisService) {
                    return surveyAnalysisService.getStageName($stateParams.stageId);
                },
                isAnalysis: function () {
                    return true;
                }
            };
            $stateProvider
                .state('home.surveyAnalysis', {
                    url: "/surveyAnalysis/:profileId/:stageId/:participantId/:evaluateeId",
                    templateUrl: "views/surveyAnalysis/views/surveyAnalysis.html",
                    controller: "surveyAnalysisCtrl as analysis",
                    resolve: baseSurveyAnalysisResolve,
                    data: {
                        displayName: "{{analysis.isFirstStage? (pageName1) : (pageName2)}}",
                        paneLimit: 1,
                        depth: 2
                    }
                })
                .state('home.historyScorecard', {
                    url: "/historyScorecard/:profileId/:stageId/:participantId",
                    templateUrl: "views/surveyAnalysis/views/surveyAnalysis.html",
                    controller: "surveyAnalysisCtrl as analysis",
                    resolve: {
                        pageName: function ($translate) {
                            return $translate.instant('COMMON_SCORECARD');
                        },
                        profile: function ($stateParams, profilesService) {
                            return profilesService.getById($stateParams.profileId);
                        },
                        answerTypes: function (profile, surveyService) {
                            return surveyService.generateAnswers(profile.scale.scaleRanges)
                        },
                        surveyInfo: function ($stateParams, surveyService) {
                            return surveyService.getSurveyInfo($stateParams.participantId, $stateParams.stageId);
                        },
                        scorecardData: function ($stateParams, surveyAnalysisService) {
                            return surveyAnalysisService.getScorecard($stateParams.stageId, $stateParams.participantId);
                        },
                        answers: function (surveyAnalysisService, scorecardData, $stateParams) {
                            var query = '?$expand=Question&$filter=ParticipantId eq ' + $stateParams.participantId + ' and StageId eq ' + $stateParams.stageId;
                            return surveyAnalysisService.getAnswers(scorecardData, query, $stateParams.participantId, $stateParams.stageId).then(function (data) {
                                return data;
                            });
                        },
                        stageName: function ($stateParams, surveyAnalysisService) {
                            return surveyAnalysisService.getStage($stateParams.stageId);
                        },
                        isAnalysis: function () {
                            return false;
                        }
                    },
                    data: {
                        displayName: '{{pageName}}',//'Scorecard',
                        paneLimit: 1,
                        depth: 2
                    }
                });
        }])

        .controller('surveyAnalysisCtrl', surveyAnalysisCtrl);

    surveyAnalysisCtrl.$inject = ['cssInjector', 'answers', 'surveyAnalysisService', '$filter', 'answerTypes', 'surveyService', 'isAnalysis', 'profile', 'surveyInfo', 'scorecardData', 'stageName'];

    function surveyAnalysisCtrl(cssInjector, answers, surveyAnalysisService, $filter, answerTypes, surveyService, isAnalysis, profile, surveyInfo, scoreCardData, stageName) {
        var vm = this;

        vm.isAnalysis = isAnalysis;
        vm.isFirstStage = surveyInfo.isFirstStage;
        vm.profile = profile;
        vm.stageName = stageName;
        vm.participant = scoreCardData && scoreCardData.length > 0 ? scoreCardData[0].participantUser : {};
        vm.answerTypes = surveyService.getAnswers();
        vm.sortCondition = {
            column: null,
            descending: false
        }

        vm.answers = answers;
        vm.tableHead = surveyAnalysisService.getTableHeaders(vm.isAnalysis,
            surveyInfo.isFirstStage,
            surveyService.getCurrentStageTitle(surveyInfo),
            surveyService.getPrevStageTitle(surveyInfo));

        fixAnswers();
        hideTrendAndPreviousScoreOnStartEvaluateion();
        appendGoalValueToAnswers();

        function fixAnswers() {
            for (var i = 0; i < vm.answers.length; i++) {
                if (parseFloat(vm.answers[i].answer1) % 1 > 0) {
                    vm.answers[i].answer1 = parseFloat(vm.answers[i].answer1).toFixed(2);
                }
                else {
                    vm.answers[i].answer1 = parseInt(vm.answers[i].answer1);
                }
            }
        }

        function appendGoalValueToAnswers() {
            for (var key in answers) {
                var agreement = surveyService.getAgreement(answers[key].question.id, surveyInfo.agreements);
                answers[key].currentGoalValue = (agreement == null) ? 0 : surveyService.getCurrentStageGoal(surveyInfo, agreement);
            }
        };

        function hideTrendAndPreviousScoreOnStartEvaluateion() {
            if (vm.answers && vm.answers.length > 0 && !vm.answers[0].perviousAnswer) {
                for (var i = 0, len = vm.tableHead.length; i < len; i++) {
                    if (vm.tableHead[i].name == 'Trend' || vm.tableHead[i].name == 'Previous Score') {
                        vm.tableHead[i].isHidable = true;
                    }
                }
            }
        }

        function addSortingClass(columnIndex, column) {
            var elClass = '';
            if (column.isSort) {
                elClass += 'sortable ';
            }
            if (columnIndex == vm.sortCondition.column) {
                elClass += 'sort-' + vm.sortCondition.descending;
                column.currentSort = true;
            } else {
                column.currentSort = false;
            }
            return elClass;
        }

        function changeSorting(columnIndex, column) {
            if (column.isSort) {
                if (vm.sortCondition.column == columnIndex) {
                    vm.sortCondition.descending = !vm.sortCondition.descending;
                    order(column.sortBy, vm.sortCondition.descending)
                } else {
                    vm.sortCondition.column = columnIndex;
                    vm.sortCondition.descending = false;
                    order(column.sortBy, vm.sortCondition.descending)
                }
            }
        }

        function order(predicate, reverse) {
            if (predicate) {
                var orderBy = $filter('orderBy');
                if (Number(predicate) === predicate && predicate % 1 === 0) {
                    predicate = valueParser;
                }
                vm.answers = orderBy(vm.answers, predicate, reverse);
            }
        }

        function valueParser(value) {
            return parseInt(value);
        }

        function getAnswerColor(value) {
            var result = getById(Math.round(value), vm.answerTypes, 'value');
            if (result) {
                return result.color;
            }
        }

        function getById(id, myArray, searchParam) {
            (!searchParam) ? searchParam = 'id' : '';
            return myArray.filter(function (obj) {
                if (obj[searchParam] == id) {
                    return obj;
                }
            })[0];
        }

        function getTrendClass(score, previousScore) {
            var result = score - previousScore;
            if (result == 0) {
                return 'trend-Equal';
            }
            if (result < 0) {
                return 'trend-Down';
            }
            if (result > 0) {
                return 'trend-Up';
            }
        }

        function getProgressClass(score, goalScore) {
            var result = score - goalScore;
            if (result == 0) {
                return 'progress-reached';
            }
            if (result < 0) {
                return 'progress-notmet';
            }
            if (result > 0) {
                return 'progress-exceeded';
            }
        }

        function hideIfNoPreviousScore(columnIndex, column) {
            var elClass = '';

            if (column.isHidable) {
                if (!vm.profile.setKPIInSurvey) {
                    elClass += 'hide ';
                }
            }

            if (column.centered)
                elClass += 'text-align-center ';

            return elClass;
        }

        vm.addSortingClass = addSortingClass;
        vm.changeSorting = changeSorting;
        vm.getAnswerColor = getAnswerColor;
        vm.hideIfNoPreviousScore = hideIfNoPreviousScore;
        vm.getTrendClass = getTrendClass;
        vm.getProgressClass = getProgressClass;
    }

})();