(function () {
    'use strict';

    angular
        .module('ips.performance')
        .factory('scorecardsServiceNew', scorecardsService);

    scorecardsService.$inject = ['apiService', '$q'];

    function scorecardsService(apiService, $q) {
        var self = {

            getOrganizations: function (query) {
                return getOrganizations(query);
            },

            getProfiles: function (query) {
                return getProfiles(query);
            },
            getProfileById: function (id) {
                return getProfileById(id);
            },

            loadScorecardData: function (profileId, isBenchmarkNeeded, participantIds, evaluatorIds, stageId, typeOfProfile, statusOn, stageGroupId) {
                return $q.when(loadScorecardData(profileId, isBenchmarkNeeded, participantIds, evaluatorIds, stageId, typeOfProfile, statusOn, stageGroupId));
            },
            loadKTScorecardData: function (profileId, participantIds, stageId, isStartStage, evolutionStageId) {
                return $q.when(loadKTScorecardData(profileId, participantIds, stageId, isStartStage, evolutionStageId));
            }
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
            return apiService.getAll("organization?$select=Id,Name" + query);
        }

        function getProfiles(query) {
            (query) ? '' : query = '';
            return apiService.getAll("profiles?$select=Id,Name,OrganizationId&$expand=StageGroups($expand=EvaluationParticipants($expand=EvaluationRole))" +
                "&$filter=StageGroups/any(s:s/Id gt 0)" + query);
        }
        function getProfileById(id) {
         
            return apiService.getById("profiles", id, "").then(function (data) {
                return data;
            });
        }

        function loadScorecardData(profileId, isBenchmarkNeeded, participantIds, evaluatorIds, stageId, typeOfProfile, statusOn, stageGroupId) {
            var participantsStr = getParamsString(participantIds);
            var evaluatorsStr = getParamsString(evaluatorIds);
            return apiService.getAll("performance/profilescorecard/" + profileId + "/" + isBenchmarkNeeded + "/" + participantsStr + "/"
                + evaluatorsStr + "/" + stageId + "/" + typeOfProfile + "/" + statusOn + "/" + stageGroupId);
        }

        function loadKTScorecardData(profileId, participantIds, stageId, isStartStage, evolutionStageId) {
            var participantsStr = getParamsString(participantIds);
            return apiService.getAll("performance/ktscorecarddata/" + profileId + "/" + participantsStr + "/"
                + stageId + "/" + isStartStage + "/" + evolutionStageId);
        }
    }
})();