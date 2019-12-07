(function () {
    'use strict';

    angular
        .module('ips.teamFinalKPI', ['ui.router'])
        .factory('teamFinalKPIService', teamFinalKPIService);

    teamFinalKPIService.$inject = ['$q', 'apiService', 'globalVariables', '$translate'];

    function teamFinalKPIService($q, apiService, globalVariables, $translate) {
        moment.locale(globalVariables.lang.currentUICulture);
        var self = {
            getAnswers: function (query) {
                return $q.when(getAnswers(query));
            },
            getAnswersByParticipantIds: function (participantIds, stageId) {
                return $q.when(getAnswersByParticipantIds(participantIds,stageId));
            },
            getEvaluators: function (stageId, participantId, query) {
                return $q.when(getEvaluators(stageId, participantId, query));
            },
            submitFinalKPI: function (answers) {
                return $q.when(submitFinalKPI(answers));
            },
            addTeamEvaluationAgreement : function(answers){
                return $q.when(addTeamEvaluationAgreement(answers));
            },
            updateFinalKPI: function (answers) {
                return $q.when(updateFinalKPI(answers));
            },
            sendResultsNotification: function (evaluateeId, stageId) {
                sendResultsNotification(evaluateeId, stageId);
            },
            getTableHeaders: function (participantName, evaluatorName, stagesInfo, isFirstStage) {
                return getTableHeaders(participantName, evaluatorName, stagesInfo, isFirstStage);
            }
        };
        return self;

        function getAnswers(query) {
            var deferred = $q.defer();
            var apiName = 'answers';
            (query) ? '' : query = '';
            apiService.getAll(apiName, query).then(function (data) {
                if (data) {
                    for (var i = 0, len = data.length; i < len; i++) {
                        var obj = { final: {}};
                        data[i]['evaluator'] = obj;
                    }
                }
                deferred.resolve(data);
            },
            function (data) {
                deferred.reject(data);
            });
            return deferred.promise;
        }

        function getAnswersByParticipantIds(participantIds,stageId) {
            var deferred = $q.defer();
            var apiName = 'api/Answers/GetAnswersByParticipantIds/' + participantIds + '/' + stageId;
            apiService.getAll(apiName, '').then(function (data) {
                if (data) {
                    for (var i = 0, len = data.length; i < len; i++) {
                        var obj = { final: {} };
                        data[i]['evaluator'] = obj;
                    }
                }
                deferred.resolve(data);
            },
            function (data) {
                deferred.reject(data);
            });
            return deferred.promise;
        }

        //api / Answers / GetAnswersByParticipantIds / { participantIds }

        function getEvaluators(stageId, participantId, query) {
            var deferred = $q.defer();
            var apiName = 'performance/participantevaluators/' + stageId + "/" + participantId ;
            (query) ? '' : query = '';
            apiService.getById(apiName, query).then(function (data) {
                deferred.resolve(data);
            },
            function (data) {
                deferred.reject(data);
            });
            return deferred.promise;
        }

        function getStageDates(stagesInfo){
            var result = [];
            var isFiveStages = stagesInfo && stagesInfo.length == 5;

            for (var i = 0; i < 5; i++)
            {
                result.push({ "from": isFiveStages ? formatDate(stagesInfo[i].startDateTime) : '', "to": isFiveStages ? formatDate(stagesInfo[i].endDateTime) : '' });
            }

            return result;
        }

        function formatDate(dt) {
            return moment(kendo.parseDate(dt)).format('L LT');
        }

        function getTableHeaders(scoreManagerName, stagesInfo, isFirstStage, participants) {
            var dates = getStageDates(stagesInfo);
            var tableHead = [
                {
                    name:'#',
                    isSort: true,
                    sortBy: 'questionNo',
                    currentSort: true

                },
                {
                    name: $translate.instant('COMMON_SKILL'),
                    isSort: true,
                    sortBy: 'skill.name',
                    currentSort: false
                },
                {
                    name: $translate.instant('COMMON_PERFORMANCE_GROUP'),
                    isSort: true,
                    sortBy: 'performanceGroup.name',
                    currentSort: false
                },
                {
                    name: $translate.instant('MYPROFILES_QUESTION'),
                    isSort: true,
                    sortBy: 'question.questionText',
                    currentSort: false
                }];

                if (isFirstStage)
                    tableHead.push({
                        name: scoreManagerName + '\'s ' + $translate.instant('COMMON_KPI'),
                        isSort: true,
                        sortBy: 'evaluatorAnswer.kpiType',
                        currentSort: false,
                        isParticipantColumn: true
                    });

                tableHead.push(
                {
                        name: scoreManagerName + '\'s ' + $translate.instant('COMMON_SCORE'),
                    isSort: true,
                    sortBy: 'evaluatorAnswer.answer1',
                    currentSort: false,
                    isParticipantColumn: true
                },
                {
                    name: scoreManagerName + '\'s ' + $translate.instant('MYPROFILES_COMMENT'),
                    isSort: false,
                    currentSort: false,
                    isParticipantColumn: true
                });

                angular.forEach(participants, function (item, index) {
                    if (isFirstStage)
                        tableHead.push(
                        {
                                name: $translate.instant('COMMON_PARTICIPANT') + ' ' + item + '\'s ' + $translate.instant('COMMON_KPI'),
                            isSort: true,
                            sortBy: 'participantAnswer.kpiType',
                            currentSort: false
                        });

                    tableHead.push(
                    {
                            name: $translate.instant('COMMON_PARTICIPANT') + ' ' + item + '\'s ' + $translate.instant('COMMON_SCORE'),
                        isSort: true,
                        sortBy: 'participantAnswer.answer1',
                        currentSort: false
                    },
                    {
                        name: $translate.instant('COMMON_PARTICIPANT') + ' ' + item + '\'s ' + $translate.instant('MYPROFILES_COMMENT'),
                        isSort: false,
                        currentSort: false
                    });
                });

                tableHead.push(
                {
                    name: $translate.instant('MYPROFILES_AVERAGE'),
                    isSort: true,
                    sortBy: 'avgAnswer.answer1',
                    currentSort: false,
                    infoIndex : 1
                },
                {
                    name: '',
                    isSort: false,
                    currentSort: false,
                    isHiddable: true,
                    clickable: true,
                    actions: 'copyAll',
                    infoIndex: 2
                },
                {
                    name: $translate.instant('MYPROFILES_FINAL_SCORE'),
                    isSort: false,
                    sortBy: 'finalScore',
                    currentSort: false,
                    infoIndex: 3
                },
                {
                    name: $translate.instant('COMMON_KPI'),
                    isSort: true,
                    sortBy: 'agreement.kpiType',
                    currentSort: false,
                    infoIndex: 8
                },
                {
                    name: stagesInfo[1].name, //'Short Goal',
                    isSort: false,
                    currentSort: false,
                    from: dates[1].from,
                    to: dates[1].to,
                    cssClass: 'stage',
                    stageId : stagesInfo[1].id
                },
                {
                    name: stagesInfo[2].name, //'Mid Goal',
                    isSort: false,
                    currentSort: false,
                    from: dates[2].from,
                    to: dates[2].to,
                    cssClass: 'stage',
                    stageId: stagesInfo[2].id

                },
                {
                    name: stagesInfo[3].name, //'Long Term Goal',
                    isSort: false,
                    currentSort: false,
                    from: dates[3].from,
                    to: dates[3].to,
                    cssClass : 'stage',
                    stageId : stagesInfo[3].id
                },
                {
                    name: stagesInfo[4].name,  //'Final Goal',
                    isSort: false,
                    currentSort: false,
                    from: dates[4].from,
                    to: dates[4].to,
                    cssClass: 'stage',
                    stageId : stagesInfo[4].id

                },
                {
                    name: $translate.instant('MYPROFILES_ADD_FREETEXT_TRAININGS_AND_ACTIONS'),
                    isSort: false,
                    currentSort: false,
                    isHiddable: true,
                    infoIndex: 4
                },
                {
                    name: '',
                    isSort: false,
                    currentSort: false,
                });

            return tableHead;
        }

        function submitFinalKPI(answers) {
            var deferred = $q.defer();
            var apiName = 'evaluationagreements';
            apiService.add(apiName, answers).then(function (data) {
                deferred.resolve(data);
            },
            function (data) {
                deferred.reject(data);
            });
            return deferred.promise;
        }

        function addTeamEvaluationAgreement(answers) {
            var deferred = $q.defer();
            var apiName = 'EvaluationAgreements/AddTeamEvaluationAgreement';
            apiService.add(apiName, answers).then(function (data) {
                deferred.resolve(data);
            },
            function (data) {
                deferred.reject(data);
            });
            return deferred.promise;
        }

        function updateFinalKPI(answers) {
            var deferred = $q.defer();
            var apiName = 'evaluationagreements';
            apiService.update(apiName, answers).then(function (data) {
                deferred.resolve(data);
            },
            function (data) {
                deferred.reject(data);
            });
            return deferred.promise;
        }

        function sendResultsNotification(evaluateeId, stageId) {
            apiService.getAll("notification/sendResultsNotification/" + evaluateeId + "/" + stageId, "").then(function (data) {
            },
            function (data) {
                console.log(data);
            });
        }
    }
})();