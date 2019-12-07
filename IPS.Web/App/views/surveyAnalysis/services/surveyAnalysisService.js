(function () {
    'use strict';

    angular
        .module('ips.surveyAnalysis', ['ui.router'])
        .factory('surveyAnalysisService', surveyAnalysisService);

    surveyAnalysisService.$inject = ['$q', 'apiService', '$translate'];

    function surveyAnalysisService($q, apiService, $translate) {

        var self = {

            getAnswers: function (scorecardData, query, participantId, stageId) {
                return $q.when(getAnswers(scorecardData, query, participantId, stageId));
            },

            getPreviousAnswers: function (scorecardData, stageId, participantId, query) {
                return $q.when(getPreviousAnswers(scorecardData, stageId, participantId, query));
            },

            getTableHeaders: getTableHeaders,

            joinAnswers: function (perviousAnswers, currentAnswers) {
                return $q.when(joinAnswers(perviousAnswers, currentAnswers));
            },

            getScorecard: function (stageId, participantId, query) {
                return $q.when(getScorecard(stageId, participantId, query));
            },

            getStageName: function (stageId) {
                return $q.when(getStageName(stageId));
            },

            getKTAnalysisInfo: function (profileId, stageId, participantId, stageEvolutionId) {
                return $q.when(getKTAnalysisInfo(profileId, stageId, participantId, stageEvolutionId));
            },

            getDevContractDetail: function (stageId, participantId) {
                return $q.when(getDevContractDetail(stageId, participantId));
            }
        };

        return self;

        function getAnswers(scorecardData, query, participantId, stageId) {
            return getSurveyInfo(participantId, stageId, scorecardData);
        }

        function getStageName(stageId) {
            var deferred = $q.defer();
            var apiName = 'stages';
            var query = '?$filter=Id eq ' + stageId;
            apiService.getAll(apiName, query).then(function (data) {
                var result = '';
                if (data && data.length == 1) {
                    result = data[0].name;
                }
                deferred.resolve(result);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }

        function getSurveyInfo(participantId, stageId, scorecardData) {
            var deferred = $q.defer();
            var apiName = 'stages/survey_info/' + stageId + "/" + participantId;
            apiService.getAll(apiName).then(function (data) {
                var answers = null;
                if (data) {
                    if (data.surveyAnswers) {
                        var kpiOnly = !(data.isFirstStage || data.isFinalStage);
                        if (kpiOnly) {
                            answers = [];
                            for (var i = 0; i < data.surveyAnswers.length; i++) {
                                var kpiValue = getKPI(data.surveyAnswers[i].questionId, data.agreements);
                                if (kpiValue > 0) {
                                    data.surveyAnswers[i].kpiType = kpiValue;
                                    answers.push(data.surveyAnswers[i]);
                                }
                            }
                        } else {
                            answers = data.surveyAnswers;
                        }
                        for (var i = 0, len = answers.length; i < len; i++) {
                            var obj = { final: {} };
                            answers[i]['questionNo'] = i + 1;
                            answers[i]['evaluator'] = obj;
                            if (scorecardData) {
                                setAdditionalFields(answers[i], scorecardData);
                            }
                        }
                    }
                }
                deferred.resolve(answers);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }

        function isKPI(questionId, agreements) {
            if (agreements) {
                for (var i = 0, len = agreements.length; i < len; i++) {
                    if (questionId == agreements[i].questionId) {
                        return agreements[i].kpiType > 0;
                    }
                }
            }
            return false;
        }

        function getKPI(questionId, agreements) {
            if (agreements) {
                for (var i = 0, len = agreements.length; i < len; i++) {
                    if (questionId == agreements[i].questionId) {
                        return (agreements[i].kpiType == null) ? 0 : agreements[i].kpiType;
                    }
                }
            }
            return 0;
        }

        function getPreviousAnswers(scorecardData, stageId, participantId, query) {
            var deferred = $q.defer();
            var apiName = 'performance/previousStageAnswers/' + stageId + "/" + participantId;
            (query) ? '' : query = '';
            apiService.getAll(apiName, query).then(function (data) {
                if (data) {
                    for (var i = 0, len = data.length; i < len; i++) {
                        var obj = { final: {} };
                        data[i]['evaluator'] = obj;
                        if (scorecardData) {
                            setAdditionalFields(data[i], scorecardData);
                        }
                    }
                }
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }

        function setAdditionalFields(answer, scorecardData) {
            var data = getByNestedId(answer.questionId, scorecardData, 'question.id');
            if (data) {
                (data.performanceGroup && data.performanceGroup.name) ? answer['performanceGroupName'] = data.performanceGroup.name : '';
                (data.skill && data.skill.name) ? answer['skillName'] = data.skill.name : '';
            }
        }

        function index(obj, is, value) {
            if (typeof is == 'string')
                return index(obj, is.split('.'), value);
            else if (is.length == 1 && value !== undefined)
                return obj[is[0]] = value;
            else if (is.length == 0)
                return obj;
            else if (obj[is[0]]) {
                return index(obj[is[0]], is.slice(1), value);
            }
        }

        function getScorecard(stageId, participantId, query) {
            var deferred = $q.defer();
            var apiName = 'performance/profilescorecard/' + stageId + "/" + participantId;
            (query) ? '' : query = '';
            apiService.getAll(apiName, query).then(function (data) {
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }

        function getTableHeaders(isAnalysis, isFirstStage, goalName, prevGoalName) {
            var tableHead;
            if (!isAnalysis) {
                tableHead = [
                    {
                        name: '#',
                        isSort: true,
                        sortBy: 'questionNo',
                        currentSort: true,
                        isHidable: false
                    },
                    {
                        name: $translate.instant('COMMON_SKILL'),
                        isSort: true,
                        sortBy: 'skillName',
                        currentSort: false,
                        isHidable: false
                    },
                    {
                        name: $translate.instant('COMMON_PERFORMANCE_GROUP'),
                        isSort: true,
                        sortBy: 'performanceGroupName',
                        currentSort: false,
                        isHidable: false
                    },
                    {
                        name: $translate.instant('MYPROFILES_QUESTION'),
                        isSort: true,
                        sortBy: 'question.questionText',
                        currentSort: false
                    },
                    {
                        name: $translate.instant('COMMON_SCORE'),
                        isSort: true,
                        sortBy: 'answer1',
                        currentSort: false,
                        centered: true
                    },
                    {
                        name: $translate.instant('COMMON_KPI'),
                        isSort: true,
                        sortBy: 'kpiType',
                        currentSort: false,
                        centered: true
                    },
                    {
                        name: $translate.instant('MYPROFILES_COMMENT'),
                        isSort: false,
                        currentSort: false
                    }
                ]
            } else {
                tableHead = [];
                tableHead.push({
                    name: '#',
                    isSort: true,
                    sortBy: 'questionNo',
                    currentSort: true,
                    isHidable: false
                });
                tableHead.push({
                    name: $translate.instant('COMMON_SKILL'),
                    isSort: true,
                    sortBy: 'skillName',
                    currentSort: true,
                    isHidable: false
                });
                tableHead.push({
                    name: $translate.instant('COMMON_PERFORMANCE_GROUP'),
                    isSort: true,
                    sortBy: 'performanceGroupName',
                    currentSort: false,
                    isHidable: false
                });
                tableHead.push({
                    name: $translate.instant('MYPROFILES_QUESTION'),
                    isSort: true,
                    sortBy: 'question.questionText',
                    currentSort: false
                });
                if (!isFirstStage) {
                    tableHead.push({
                        name: prevGoalName + ' ' + $translate.instant('COMMON_SCORE'),
                        isSort: true,
                        sortBy: 'perviousAnswer.answer1',
                        currentSort: false,
                        isHidable: false,
                        centered: true
                    });
                }
                tableHead.push({
                    name: goalName + ' ' + $translate.instant('COMMON_SCORE'),
                    isSort: true,
                    sortBy: 'answer1',
                    currentSort: false,
                    centered: true
                });
                if (!isFirstStage) {
                    tableHead.push({
                        name: $translate.instant('COMMON_PROGRESS'),
                        isSort: true,
                        sortBy: 'progress',
                        currentSort: false,
                        isHidable: false,
                        centered: true
                    });
                }
                tableHead.push({
                    name: $translate.instant('COMMON_KPI'),
                    isSort: true,
                    sortBy: 'kpiType',
                    currentSort: false,
                    centered: true
                });
                tableHead.push({
                    name: $translate.instant('MYPROFILES_COMMENT'),
                    isSort: false,
                    currentSort: false
                });
            }

            if (!isFirstStage) {
                var colPosition = 5;
                //if (isAnalysis) {
                //    colPosition = 7;
                //}

                tableHead.splice(colPosition, 0, {
                    name: goalName + ' ' + $translate.instant('COMMON_GOAL'),
                    isSort: true,
                    sortBy: 'goalValue',
                    currentSort: false,
                    isHidable: false,
                    centered: true
                });
            }

            return tableHead;
        }

        function joinAnswers(perviousAnswers, currentAnswers) {
            if (perviousAnswers) {
                for (var i = 0, len = currentAnswers.length; i < len; i++) {
                    var perviousAnswer = getById(currentAnswers[i].questionId, perviousAnswers, 'questionId');
                    currentAnswers[i]['perviousAnswer'] = perviousAnswer;
                    if (perviousAnswer) {
                        currentAnswers[i]['trend'] = perviousAnswer.answer1 > currentAnswers[i].answer1 ? -1 : (perviousAnswer.answer1 < currentAnswers[i].answer1 ? 1 : 0);
                    } else {
                        currentAnswers[i]['trend'] = 0;
                    }
                }
            }
            return currentAnswers;
        }

        function getById(id, myArray, searchParam) {
            (!searchParam) ? searchParam = 'id' : '';
            return myArray.filter(function (obj) {
                if (obj[searchParam] == id) {
                    return obj
                }
            })[0]
        }

        function getByNestedId(id, myArray, searchParam) {
            (!searchParam) ? searchParam = 'id' : '';
            return myArray.filter(function (obj) {
                if (obj) {
                    var founded = index(obj, searchParam);
                    if (founded == id) {
                        return obj
                    }
                }
            })[0]
        }

        function getKTAnalysisInfo(profileId, stageId, participantId, stageEvolutionId) {
            var deferred = $q.defer();
            var apiName = 'survey/kt/analysis/' + profileId + "?participantId=" + participantId;
            if (stageId) {
                apiName += '&stageId=' + stageId;
            }
            if (stageEvolutionId) {
                apiName += '&stageEvolutionId=' + stageEvolutionId;
            }
            apiService.getAll(apiName).then(function (data) {
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }


        function getDevContractDetail(stageId, participantId) {
            var deferred = $q.defer();
            var apiName = 'performance/GetDevContractDetail/' + stageId + "/" + participantId;
            apiService.getAll(apiName, null).then(function (data) {
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }
    }

})();