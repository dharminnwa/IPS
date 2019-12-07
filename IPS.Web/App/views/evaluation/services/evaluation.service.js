'use strict';

angular
    .module('ips.survey')
    .service('evaluationService', ['$q', 'apiService', function ($q, apiService) {

        this.confirmKTEvaluation = function (answers) {
            return $q.when(confirmKTEvaluation(answers));
        };

        this.getKTEvaluationInfo = function (profileId, stageId, participantId, stageEvolutionId) {
            return $q.when(getKTEvaluationInfo(profileId, stageId, participantId, stageEvolutionId));
        };


        function getKTEvaluationInfo(profileId,stageId, participantId , stageEvolutionId) {
            var deferred = $q.defer();
            var apiName = 'survey/kt/evaluate/' + profileId + "?participantId=" + participantId;
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

        function confirmKTEvaluation(answers) {
            var deferred = $q.defer();
            var apiName = 'survey/kt/evaluate/';
            apiService.update(apiName, answers).then(function (data) {
                    deferred.resolve(data);
                },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }
    }]);