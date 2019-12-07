(function () {
    'use strict';

    angular
        .module('ips.performance')
        .factory('scorecardsService', scorecardsService);

    scorecardsService.$inject = ['apiService'];

    function scorecardsService(apiService) {
        var self = {

            getOrganizations: function (query) {
                return getOrganizations(query);
            },

            getProfiles: function (query) {
                return getProfiles(query);
            },
            
            loadScorecardData: function (profileId, isBenchmarkNeeded, participantIds, evaluatorIds, stageId, typeOfProfile, statusOn) {
                return loadScorecardData(profileId, isBenchmarkNeeded, participantIds, evaluatorIds, stageId, typeOfProfile, statusOn);
            },

            loadKTScorecardData: function (profileId, participantIds, stageId, isStartStage, evolutionStageId) {
                return loadKTScorecardData(profileId, participantIds, stageId, isStartStage, evolutionStageId);
            }
        };

        return self;

        function getOrganizations(query) {
            (query) ? '' : query = '';
            return apiService.getAll("organization?$select=Id,Name" + query);
        }

        function getProfiles(query) {
            (query) ? '' : query = '';
            return apiService.getAll("profiles?$select=Id,Name,OrganizationId&$expand=StageGroups($expand=EvaluationParticipants($expand=EvaluationRole))&$filter=StageGroups/any(s:s/Id gt 0)" + query);
        }

        function loadScorecardData(profileId, isBenchmarkNeeded, participantIds, evaluatorIds, stageId, typeOfProfile, statusOn) {
            var participantsStr = getParamsString(participantIds);
            var evaluatorsStr = getParamsString(evaluatorIds);
            return apiService.getAll("performance/profilescorecard/" + profileId + "/" + isBenchmarkNeeded + "/" + participantsStr + "/" + evaluatorsStr + "/" + stageId + "/" + typeOfProfile + "/" + statusOn);
            //return apiService.getAll("performance/profilescorecard/24/false/573;/585;/323/1/null");
        }

        function loadKTScorecardData(profileId, participantIds, stageId, isStartStage, evolutionStageId) {
            var participantsStr = getParamsString(participantIds);
            return apiService.getAll("performance/ktscorecarddata/" + profileId + "/" + participantsStr + "/"
                + stageId + "/" + isStartStage + "/" + evolutionStageId);
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
    }
})();