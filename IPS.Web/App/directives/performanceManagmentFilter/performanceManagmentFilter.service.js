'use strict';

angular
    .module('ips')
    .service('performanceManagmentFilterService', ['apiService', function (apiService) {
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

        this.getOrganizations = function (query) {
            (query) ? '' : query = '';
            return apiService.getAll("organizations/getOrgsWithParticipants/?$select=Id,Name" + query);
        };

        this.getProjects = function (query) {
            (query) ? '' : query = '';
            return apiService.getAll("projects/getProjects/");
        };

        this.getDepartments = function (organizationId) {
            return apiService.getAll("departments/getDepartmentsByOrgId/" + organizationId);
        };

        this.getTeams = function (organizationId, departmentIds) {
            var idsStr = getParamsString(departmentIds);
            return apiService.getAll("teams/getTeamsByDepartmentId/" + organizationId + "/" + idsStr);
        };

        this.getProfiles = function (organizationId, query, profileStatus) {

            (query) ? '' : query = '';

            if (profileStatus.toString() == "") {
                profileStatus = null;
            }

            return apiService.getAll("performance/GetEvaluatedProfiles/" + organizationId + "/" + profileStatus);
        };

        this.getProjectProfiles = function (projectIds, profileStatus) {
            var projectIdsStr = getParamsString(projectIds);
            if (profileStatus.toString() == "") {
                profileStatus = null;
            }
            return apiService.getAll("performance/GetProjectEvaluatedProfiles/" + projectIdsStr + "/" + profileStatus);
        };

        this.getParticipants = function (profileId, statusOn) {
            return apiService.getAll("performance/profileparticipants/" + profileId + "/" + statusOn);
        };

        this.getParticipantsBy = function (profileId, stageId, projectIds, departmentIds, teamIds, profileStageGroupId) {
            return apiService.getAll("performance/profileparticipantsbystageid/" + profileId + "/" + stageId + "/"
                + getParamsString(projectIds) + "/" + getParamsString(departmentIds) + "/" + getParamsString(teamIds) + "/" + profileStageGroupId);
        };

        this.getEvaluators = function (profileId, statusOn) {
            return apiService.getAll("performance/profileevaluators/" + profileId + "/" + statusOn);
        };

        this.getEvaluatorsForParticipant = function (profileId, participantIds) {
            var participantsStr = null;
            if (participantIds.length > 0) {
                participantsStr = "";
                angular.forEach(participantIds, function (item) {
                    participantsStr += item.id + ";";
                });
            }
            return apiService.getAll("performance/evaluatorsforparticipant/" + profileId + "/" + participantsStr);
        };

        this.getProfileStages = function (profileId, participantId, isShowParticipantsSameStages, stageGroupId) {
            if (!isShowParticipantsSameStages) {
                return apiService.getAll("performance/profileevaluationstages/" + profileId + "/" + participantId + "/" + stageGroupId);
            }
            else {
                var participantsStr = getParamsString(participantId);
                return apiService.getAll("performance/profileevaluationparticipantssamestages/" + profileId + "/" + participantsStr);
            }
        };

        this.getProfileEvaluationPeriods = function (profileId, participantId) {
            return apiService.getAll("performance/profileevaluationperiods/" + profileId + "/" + participantId);
        };

        this.getProfileType = function (profileId) {
            return apiService.getById("profiles/" + profileId + "/type", '');
        };
        this.getProfileStageGroups = function (profileId) {
            return apiService.getById("profiles/" + profileId + "/stagegroups", '');
        };

        this.getKTLastStageEvolutionId = function (profileId, participantId, stageId) {
            return apiService.getAll("performance/ktlaststageevolutionId/" + profileId + "/" + participantId + "/" + stageId);
        };

        this.kTStageHasDevContaract = function (profileId, stageId, stageEvolutionId, participantId) {
            return apiService.getAll("performance/ktstagehasdevcontract/" + profileId + "/" + stageId + "/" + stageEvolutionId + "/" + participantId);
        };

        this.getEvolutionStages = function (originalStageId, participantId) {
            return apiService.getAll("performance/evolutionstages/" + originalStageId + "/" + participantId);
        };
    }])