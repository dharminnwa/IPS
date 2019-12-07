(function () {
    'use strict';

    angular
        .module('ips.finalKPI', ['ui.router'])
        .factory('finalKPIService', finalKPIService);

    finalKPIService.$inject = ['$q', 'apiService','$translate','globalVariables'];

    function finalKPIService($q, apiService,$translate, globalVariables) {
        moment.locale(globalVariables.lang.currentUICulture);
        var self = {

            getAnswers: function (query) {
                return $q.when(getAnswers(query));
            },

            getEvaluators: function (stageId, participantId, query) {
                return $q.when(getEvaluators(stageId, participantId, query));
            },

            submitFinalKPI: function (answers) {
                return $q.when(submitFinalKPI(answers));
            },

            updateFinalKPI: function (answers) {
                return $q.when(updateFinalKPI(answers));
            },

            sendResultsNotification: function (evaluateeId, stageId) {
                sendResultsNotification(evaluateeId, stageId);
            },

            getTableHeaders: function (participantName, evaluatorName, stagesInfo, isFirstStage) {
                return getTableHeaders(participantName, evaluatorName, stagesInfo, isFirstStage);
            },
            isRCTAdded: function (profileId, stageId, participantId, profileTypeId) {
                return isRCTAdded(profileId, stageId, participantId, profileTypeId);
            },
            addPreviousStageRCT: function (profileId, stageId, participantId, evaluateeId) {
                return $q.when(addPreviousStageRCT(profileId, stageId, participantId, evaluateeId));
            },
        };

        return self;

        function getAnswers(query) {
            var deferred = $q.defer();
            var apiName = 'answers';
            (query) ? '' : query = '';
            apiService.getAll(apiName, query).then(function (data) {
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

        function getEvaluators(stageId, participantId, query) {
            var deferred = $q.defer();
            var apiName = 'performance/participantevaluators/' + stageId + "/" + participantId;
            (query) ? '' : query = '';
            apiService.getById(apiName, query).then(function (data) {
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }

        function getStageDates(stagesInfo) {
            var result = [];
            var isFiveStages = stagesInfo && stagesInfo.length > 1;

            if (isFiveStages) {
                for (var i = 0; i < stagesInfo.length; i++) {
                    result.push({ "from": isFiveStages ? (stagesInfo[i].evaluationStartDate ? formatDate(stagesInfo[i].evaluationStartDate) : formatDate(stagesInfo[i].startDateTime)) : '', "to": isFiveStages ? (stagesInfo[i].evaluationEndDate ? formatDate(stagesInfo[i].evaluationEndDate) : formatDate(stagesInfo[i].endDateTime)) : '' });
                }
            }
            return result;
        }

        function formatDate(dt) {
            return moment(kendo.parseDate(dt)).format('L LT');
        }

        function getTableHeaders(participantName, stagesInfo, isFirstStage, evaluators) {
            var dates = getStageDates(stagesInfo);
            var tableHead = [
                {
                    name: '#',
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
                    name: participantName + '\'s KPI',
                    isSort: true,
                    sortBy: 'participantAnswer.kpiType',
                    currentSort: false,
                    isParticipantColumn: true
                });

            tableHead.push(
                {
                    name: participantName + '\'s Score',
                    isSort: true,
                    sortBy: 'participantAnswer.answer1',
                    currentSort: false,
                    isParticipantColumn: true
                },
                {
                    name: participantName + '\'s Comment',
                    isSort: false,
                    currentSort: false,
                    isParticipantColumn: true
                });

            angular.forEach(evaluators, function (item, index) {
                if (isFirstStage)
                    tableHead.push(
                        {
                            name: 'Evaluator ' + item + '\'s KPI',
                            isSort: true,
                            sortBy: 'evaluatorAnswer.kpiType',
                            currentSort: false
                        });

                tableHead.push(
                    {
                        name: 'Evaluator ' + item + '\'s Score',
                        isSort: true,
                        sortBy: 'evaluatorAnswer.answer1',
                        currentSort: false
                    },
                    {
                        name: 'Evaluator ' + item + '\'s Comment',
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
                    infoIndex: 1
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
                    name: 'KPI',
                    isSort: true,
                    sortBy: 'agreement.kpiType',
                    currentSort: false,
                    infoIndex: 8
                });
            for (var i = 1; i < stagesInfo.length; i++) {
                tableHead.push({
                    name: stagesInfo[i].name, //'Short Goal',
                    isSort: false,
                    currentSort: false,
                    from: dates[i].from,
                    to: dates[i].to,
                    cssClass: 'stage',
                    stageId: stagesInfo[i].id
                });
            }
            tableHead.push({
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
                })

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

        function isRCTAdded(profileId, stageId, participantId, profileTypeId) {
            var deferred = $q.defer();
            var apiName = 'performance/isRCTAdded/' + profileId + '/' + stageId + '/' + participantId + '/' + profileTypeId;
            apiService.getAll(apiName).then(function (data) {
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }

        function addPreviousStageRCT(profileId, stageId, participantId, evaluateeId) {
            if (!evaluateeId) {
                evaluateeId = 0;
            }
            var deferred = $q.defer();
            var apiName = 'performance/AddPreviousStageRCT/' + profileId + '/' + stageId + '/' + participantId + '/' + evaluateeId;
            apiService.getAll(apiName).then(function (data) {
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }
    }
})();