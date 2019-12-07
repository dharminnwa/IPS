    'use strict';

    angular
    .module('ips.performance')
    .service('dashboardsServiceNew', ['apiService', function (apiService) {
        var self = {
            getOrganizations: function (query) {
                return getOrganizations(query);
            },

            getDashboardData: function (profileId, isBenchmarkNeeded, participantIds, evaluatorIds, stageIds, profileType, statusOn, profileStageGroupId) {
                return getDashboardData(profileId, isBenchmarkNeeded, participantIds, evaluatorIds, stageIds, profileType, statusOn, profileStageGroupId);
            },

            getKTDashboardData: function (participantIds, profileId, stageId, isStartStage) {
                return getKTDashboardData(participantIds, profileId, stageId, isStartStage);
            },

            getKTProfileAllStagesResult: function(profileId, participantIds, isStartStage){
                return getKTProfileAllStagesResult(profileId, participantIds, isStartStage);
            },

            getKTBenchmark: function (profileId, stageId) {
                return getKTBenchmark(profileId, stageId);
            },

            getKTAllStagesBenchmarks: function (profileId) {
                return getKTAllStagesBenchmarks(profileId);
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
            return apiService.getAll("organizations/getOrgsWithParticipants/?$select=Id,Name" + query);
        } 

        function getDashboardData(profileId, isBenchmarkNeeded, participantIds, evaluatorIds, stageId, profileType, statusOn, profileStageGroupId) {
            if (!(profileStageGroupId)) {
                profileStageGroupId = null;
            }
            var participantsStr = getParamsString(participantIds);
            var evaluatorsStr = getParamsString(evaluatorIds);
            return apiService.getAll("performance/profilescorecard/" + profileId + "/" + isBenchmarkNeeded + "/" + participantsStr + "/" + evaluatorsStr + "/" + stageId + "/" + profileType + "/" + statusOn + "/" + profileStageGroupId);
        }

        function getKTDashboardData(participantIds, profileId, stageId, isStartStage) {
            var participantsStr = getParamsString(participantIds);
            return apiService.getAll("performance/ktprofilescorecard/" + participantsStr + "/" + profileId + "/" + stageId + "/" + isStartStage);
        }

        function getKTProfileAllStagesResult(profileId, participantIds, isStartStage) {
            var participantsStr = getParamsString(participantIds);
            return apiService.getAll("performance/profileallstagesresult/" + profileId + "/" + participantsStr + "/" + isStartStage);
        }

        function getKTBenchmark(profileId, stageId) {
            return apiService.getAll("performance/ktprofilebenchmark/" + profileId + "/" + stageId);
        }

        function getKTAllStagesBenchmarks(profileId) {
            return apiService.getAll("performance/ktprofileallstagesbenchmarks/" + profileId);
        }

    }])