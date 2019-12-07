(function () {
    'use strict';

    angular
        .module('ips')
        .factory('userDashboardManager', userDashboardManager);

    userDashboardManager.$inject = ['$q', 'apiService'];

    function userDashboardManager($q, apiService) {

        var self = {
            getUserProjects: function () {
                return $q.when(getUserProjects());
            },
            getProfiles: function (id, query) {
                return $q.when(getProfiles(id, query));
            },
            getUserPersonalTrainingsForToday: function (userId) {
                return $q.when(getUserPersonalTrainingsForToday(userId));
            },
            getUserProfileTrainingsForToday: function (userId) {
                return $q.when(getUserProfileTrainingsForToday(userId));
            },
            getTrainingDetailById: function (id) {
                return $q.when(getTrainingDetailById(id));
            },
            getProfileStages: function (profileId, participantId, stageGroupId) {
                return $q.when(getProfileStages(profileId, participantId, stageGroupId));
            },
            getKTProfileStagesResult: function (profileId, participantId, isStartStage) {
                return $q.when(getKTProfileStagesResult(profileId, participantId, isStartStage));
            },
            getSoftProfileDashboardData: function (profileId, participantIds, stageId, profileType) {
                return $q.when(getSoftProfileDashboardData(profileId, false, participantIds, null, stageId, profileType, null));
            },
            getParticipantsBy: function (profileId, stageId) {
                return $q.when(getParticipantsByStageId(profileId, stageId));
            },

            addProspectingGoal: function (prospectingGoal) {
                return $q.when(addProspectingGoal(prospectingGoal));
            },
            getProspectingGoals: function () {
                return $q.when(getProspectingGoals());
            },
            updateProspectingGoal: function (prospectingGoal) {
                return $q.when(updateProspectingGoal(prospectingGoal));

            },

            addProspectingCustomer: function (prospectingCustomer) {
                return $q.when(addProspectingCustomer(prospectingCustomer));
            },
            getProspectingCustomers: function () {
                return $q.when(getProspectingCustomers());
            },
            updateProspectingCustomer: function (prospectingCustomer) {
                return $q.when(updateProspectingCustomer(prospectingCustomer));

            },

            getProsepectingActvitiyPerformnaceData: function (profileId, stageId, participantId) {
                return $q.when(getProsepectingActvitiyPerformnaceData(profileId, stageId, participantId));
            },
            getScaleRanges: function (profileId) {
                return $q.when(getScaleRanges(profileId));
            },

            getSkillsByProfileId: function (profileId) {
                return $q.when(getSkillsByProfileId(profileId));
            },
            addProspectingGoalActivityInfo: function (activityInfo) {
                return $q.when(addProspectingGoalActivityInfo(activityInfo));
            },
            updateProspectingGoalActivityInfo: function (activityInfo) {
                return $q.when(updateProspectingGoalActivityInfo(activityInfo));
            },
            getprospectingGoalActivityInfoes: function () {
                return $q.when(getprospectingGoalActivityInfoes());
            },
            saveCustomerActivityResult: function (prospectingActivityCustomerResult) {
                return $q.when(saveCustomerActivityResult(prospectingActivityCustomerResult));
            },
            getProspectingCustomerResults: function () {
                return $q.when(getProspectingCustomerResults());
            },
            saveActivityLog: function (prospectingActivityLoginfo) {
                return $q.when(saveActivityLog(prospectingActivityLoginfo));
            },
            updateProspectingActivity: function (prospectingActivity) {
                return $q.when(updateProspectingActivity(prospectingActivity));
            },

            uncheckCustomerActivityResult: function (prospectingActivityCustomerResult) {
                return $q.when(uncheckCustomerActivityResult(prospectingActivityCustomerResult));
            },
            GetUserCustomersByOrganization: function (organizationId) {
                return $q.when(GetUserCustomersByOrganization(organizationId));
            },

            getSkillsByProspectingGoalId: function (prospectingGoalId) {
                return $q.when(getSkillsByProspectingGoalId(prospectingGoalId));
            },
            getTaskProspectingGoals: function (taskId) {
                return $q.when(getTaskProspectingGoals(taskId));
            },
            getTaskProspectingActivities: function (goalId) {
                return $q.when(getTaskProspectingActivities(goalId));
            },

            getTaskProsepectingActvitiyPerformnaceData: function (goalId, activityId, userId) {
                return $q.when(getTaskProsepectingActvitiyPerformnaceData(goalId, activityId, userId));
            },
            getProspectingScaleRangesByGoalId: function (goalId) {
                return $q.when(getProspectingScaleRangesByGoalId(goalId));
            },
            GetUserCustomersForGoalId: function (goalId) {
                return $q.when(GetUserCustomersForGoalId(goalId));
            },

            AddNewCustomer: function (customer) {
                return $q.when(AddNewCustomer(customer));
            },
            checkCustomerExist: function (mobile) {
                return $q.when(checkCustomerExist(mobile));
            },
            saveProspectingActivityFeedback: function (prospectingActivityFeedback) {
                return $q.when(saveProspectingActivityFeedback(prospectingActivityFeedback));
            },
            getProspectingActivityFeedbackByActivityId: function (prospectingActivityId) {
                return $q.when(getProspectingActivityFeedbackByActivityId(prospectingActivityId));
            },
            restartProspectingActivity: function (prospectingActivityId) {
                return $q.when(restartProspectingActivity(prospectingActivityId));
            },
            deleteProspectingActivity: function (prospectingActivityId) {
                return $q.when(deleteProspectingActivity(prospectingActivityId));
            },
            SaveActivityReason: function (expiredProspectingActivityReason) {
                return $q.when(SaveActivityReason(expiredProspectingActivityReason));
            },
            GetProspectingGoalResultSummary: function () {
                return $q.when(GetProspectingGoalResultSummary());
            },
            GetProspectingGoalResultSummaryByGoalId: function (goalId) {
                return $q.when(GetProspectingGoalResultSummaryByGoalId(goalId));
            },
            getProsepectingActivityResultData: function (prospectingActivityId) {
                return $q.when(getProsepectingActivityResultData(prospectingActivityId));
            },
            getUsersBySearchText: function (searchText) {
                return $q.when(getUsersBySearchText(searchText));
            },
            getDashboardData: function (profileId, isBenchmarkNeeded, participantIds, evaluatorIds, stageIds, profileType, statusOn, stageGroupId) {
                return getDashboardData(profileId, isBenchmarkNeeded, participantIds, evaluatorIds, stageIds, profileType, statusOn, stageGroupId);
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
            getProjectProfiles: function (projectIds, profileStatus) {
                return getProjectProfiles(projectIds, profileStatus);
            },
            getUserProfileStageTrainings: function (userId, profileId) {
                return $q.when(GetUserProfileStageTrainings(userId, profileId))
            }
        };

        return self;

        function getUserProjects() {
            var deferred = $q.defer();
            var apiName = 'projects/GetUserProjects';
            apiService.getAll(apiName).then(function (data) {
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }

        function getProfiles(id, query) {
            var deferred = $q.defer();
            var apiName = 'performance';
            (query) ? '' : query = '';
            apiService.getById(apiName, id, query).then(function (data) {

                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }

        function getUserPersonalTrainingsForToday(userId) {
            var deferred = $q.defer();
            var apiName = 'trainingdiary/GetUserPersonalTrainingsForToday';
            apiService.getById(apiName, userId, null).then(function (data) {
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }


        function getUserProfileTrainingsForToday(userId) {
            var deferred = $q.defer();
            var apiName = 'trainingdiary/GetUserProfileTrainingsForToday';
            apiService.getById(apiName, userId, null).then(function (data) {
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }

        function getTrainingDetailById(id) {
            if (id > 0) {
                return apiService.getById("trainings/GetTrainingDetailById", id, "").then(function (data) {
                    data.viewName = data.name;
                    (data.startDate) ? data.startDate = moment(kendo.parseDate(data.startDate)).format('L LT') : '';
                    (data.endDate) ? data.endDate = moment(kendo.parseDate(data.endDate)).format('L LT') : '';
                    (data.frequency) ? '' : data.frequency = "";
                    return data;
                });
            }
            else {
                return {
                    id: 0,
                    name: "",
                    viewName: "New Training",
                    why: "",
                    how: "",
                    what: "",
                    additionalInfo: "",
                    organizationId: null,
                    skillId: null,
                    typeId: null,
                    levelId: null,
                    isTemplate: true,
                    isActive: true,
                    skills: [],
                    trainingMaterials: [],
                    isNotificationByEmail: true,
                    emailNotificationIntervalId: null,
                    isNotificationBySMS: false,
                    smsNotificationIntervalId: null
                };
            }

        }


        function getProfileStages(profileId, participantId, stageGroupId) {
            return apiService.getAll("performance/profileevaluationstages/" + profileId + "/" + participantId + "/" + stageGroupId);
        }

        function getKTProfileStagesResult(profileId, participantIds, isStartStage) {
            var participantsStr = getParamsString(participantIds);
            return apiService.getAll("performance/profileallstagesresult/" + profileId + "/" + participantsStr + "/" + isStartStage);
        }

        function getSoftProfileDashboardData(profileId, isBenchmarkNeeded, participantIds, evaluatorIds, stageId, profileType, statusOn) {
            var participantsStr = getParamsString(participantIds);
            var evaluatorsStr = getParamsString(evaluatorIds);
            return apiService.getAll("performance/profilescorecard/" + profileId + "/" + isBenchmarkNeeded + "/" + participantsStr + "/" + evaluatorsStr + "/" + stageId + "/" + profileType + "/" + statusOn);
        }
        function getParticipantsByStageId(profileId, stageId) {
            return apiService.getAll("performance/profileparticipantsbystageid/" + profileId + "/" + stageId + "/null/null/null/null");
        }

        function addProspectingGoal(prospectingGoal) {
            var deferred = $q.defer();
            var apiName = 'profiles/addProspectingGoal';
            apiService.add(apiName, prospectingGoal).then(function (data) {
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }
        function updateProspectingGoal(prospectingGoal) {
            var deferred = $q.defer();
            var apiName = 'profiles/upadateProspectingGoal';
            apiService.add(apiName, prospectingGoal).then(function (data) {
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }
        function getProspectingGoals(prospectingGoal) {
            var deferred = $q.defer();
            var apiName = 'profiles/getProspectingGoals';
            apiService.getAll(apiName).then(function (data) {
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }



        function addProspectingCustomer(prospectingCustomer) {
            var deferred = $q.defer();
            var apiName = 'profiles/addProspectingCustomer';
            apiService.add(apiName, prospectingCustomer).then(function (data) {
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }
        function updateProspectingCustomer(prospectingCustomer) {
            var deferred = $q.defer();
            var apiName = 'profiles/upadateProspectingCustomer';
            apiService.add(apiName, prospectingCustomer).then(function (data) {
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }
        function getProspectingCustomers() {
            var deferred = $q.defer();
            var apiName = 'profiles/getProspectingCustomers';
            apiService.getAll(apiName).then(function (data) {
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }

        function GetUserCustomersByOrganization(organizationId) {
            var deferred = $q.defer();
            var apiName = 'organizations/GetUserCustomersByOrganization/' + organizationId;
            apiService.getAll(apiName).then(function (data) {
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }


        function GetUserCustomersForGoalId(goalId) {
            var deferred = $q.defer();
            var apiName = 'organizations/GetUserCustomersForGoalId/' + goalId;
            apiService.getAll(apiName).then(function (data) {
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }

        function getProsepectingActvitiyPerformnaceData(profileId, stageId, participantId) {
            return apiService.getAll("performance/getProsepectingActvitiyPerformanceData/" + profileId + "/" + stageId + "/" + participantId);
        }


        function getTaskProsepectingActvitiyPerformnaceData(goalId, activityId, userId) {
            var deferred = $q.defer();
            var apiName = "performance/getTaskProsepectingActvitiyPerformnaceData/" + goalId + "/" + activityId + "/" + userId;
            apiService.getAll(apiName).then(function (data) {
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }



        function getScaleRanges(profileId) {
            var deferred = $q.defer();
            var apiName = 'profiles/getScaleRanges/' + profileId;
            apiService.getAll(apiName).then(function (data) {
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }

        function getParamsString(idsArray) {
            var idsStr = null;
            if (idsArray && idsArray.length > 0) {
                idsStr = "";
                angular.forEach(idsArray, function (item) {
                    idsStr += item + ";";
                });
            }
            return idsStr;
        }


        function getSkillsByProfileId(profileId) {
            var deferred = $q.defer();
            var apiName = 'skills/getSkillsByProfileId/' + profileId;
            apiService.getAll(apiName).then(function (data) {
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }

        function addProspectingGoalActivityInfo(activityInfo) {
            var deferred = $q.defer();
            var apiName = 'profiles/addProspectingGoalActivityInfo';
            apiService.add(apiName, activityInfo).then(function (data) {
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }

        function updateProspectingGoalActivityInfo(activityInfo) {
            var deferred = $q.defer();
            var apiName = 'profiles/updateProspectingGoalActivityInfo';
            apiService.add(apiName, activityInfo).then(function (data) {
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }

        function getprospectingGoalActivityInfoes() {
            var deferred = $q.defer();
            var apiName = 'profiles/GetProspectingGoalActivityInfoes';
            apiService.getAll(apiName).then(function (data) {
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }

        function saveCustomerActivityResult(prospectingActivityCustomerResult) {
            var deferred = $q.defer();
            var apiName = 'profiles/saveCustomerActivityResult';
            apiService.add(apiName, prospectingActivityCustomerResult).then(function (data) {
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }

        function uncheckCustomerActivityResult(prospectingActivityCustomerResult) {
            var deferred = $q.defer();
            var apiName = 'profiles/uncheckCustomerActivityResult';
            apiService.add(apiName, prospectingActivityCustomerResult).then(function (data) {
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }

        function getProspectingCustomerResults() {
            var deferred = $q.defer();
            var apiName = 'profiles/getProspectingCustomerResults';
            apiService.getAll(apiName).then(function (data) {
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }

        function saveActivityLog(prospectingActivityLoginfo) {
            var deferred = $q.defer();
            var apiName = 'profiles/saveActivityLog';
            apiService.add(apiName, prospectingActivityLoginfo).then(function (data) {
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }

        function updateProspectingActivity(prospectingActivity) {
            var deferred = $q.defer();
            var apiName = 'profiles/updateProspectingActivity';
            apiService.add(apiName, prospectingActivity).then(function (data) {
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }

        function restartProspectingActivity(prospectingActivityId) {
            var deferred = $q.defer();
            var apiName = 'profiles/restartProspectingActivity/' + prospectingActivityId;
            apiService.getAll(apiName).then(function (data) {
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }

        function deleteProspectingActivity(prospectingActivityId) {
            var deferred = $q.defer();
            var apiName = 'profiles/deleteProspectingActivity/' + prospectingActivityId;
            apiService.getAll(apiName).then(function (data) {
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }


        function getSkillsByProspectingGoalId(prospectingGoalId) {
            var deferred = $q.defer();
            var apiName = 'skills/getSkillsByProspectingGoalId/' + prospectingGoalId;
            apiService.getAll(apiName).then(function (data) {
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }


        function getTaskProspectingGoals(taskId) {
            var deferred = $q.defer();
            var apiName = 'profiles/getTaskProspectingGoals/' + taskId;
            apiService.getAll(apiName).then(function (data) {
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }

        function getTaskProspectingActivities(goalId) {
            var deferred = $q.defer();
            var apiName = 'profiles/getTaskProspectingActivities/' + goalId;
            apiService.getAll(apiName).then(function (data) {
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }

        function getProspectingScaleRangesByGoalId(goalId) {

            var deferred = $q.defer();
            var apiName = 'profiles/getProspectingScaleRangesByGoalId/' + goalId;
            apiService.getAll(apiName).then(function (data) {
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }

        function AddNewCustomer(customer) {
            var deferred = $q.defer();
            var apiName = 'organizations/AddNewCustomer';
            apiService.add(apiName, customer).then(function (data) {
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }

        function checkCustomerExist(mobile) {
            var deferred = $q.defer();
            var apiName = 'organizations/checkCustomerExist/' + mobile;
            apiService.getAll(apiName).then(function (data) {
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }

        function saveProspectingActivityFeedback(prospectingActivityFeedback) {
            var deferred = $q.defer();
            var apiName = 'profiles/saveProspectingActivityFeedback';
            apiService.add(apiName, prospectingActivityFeedback).then(function (data) {
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }

        function getProspectingActivityFeedbackByActivityId(prospectingActivityId) {
            var deferred = $q.defer();
            var apiName = 'profiles/getProspectingActivityFeedbackByActivityId/' + prospectingActivityId;
            apiService.getAll(apiName).then(function (data) {
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }

        function SaveActivityReason(expiredProspectingActivityReason) {
            var deferred = $q.defer();
            var apiName = 'profiles/SaveActivityReason';
            apiService.add(apiName, expiredProspectingActivityReason).then(function (data) {
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }

        function GetProspectingGoalResultSummary() {
            var deferred = $q.defer();
            var apiName = 'performance/GetProspectingGoalResultSummary';
            apiService.getAll(apiName).then(function (data) {
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }

        function GetProspectingGoalResultSummaryByGoalId(goalId) {
            var deferred = $q.defer();
            var apiName = 'performance/GetProspectingGoalResultSummaryByGoalId/' + goalId;
            apiService.getAll(apiName).then(function (data) {
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }

        function getProsepectingActivityResultData(activityId) {
            var deferred = $q.defer();
            var apiName = 'performance/getProsepectingActivityResultData/' + activityId;
            apiService.getAll(apiName).then(function (data) {
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }


        function getUsersBySearchText(searchText) {
            var deferred = $q.defer();
            var apiName = 'User/getUsersBySearchText/' + searchText;
            apiService.getAll(apiName).then(function (data) {
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }

        function getDashboardData(profileId, isBenchmarkNeeded, participantIds, evaluatorIds, stageId, profileType, statusOn, stageGroupId) {
            var participantsStr = getParamsString(participantIds);
            var evaluatorsStr = getParamsString(evaluatorIds);
            return apiService.getAll("performance/profilescorecard/" + profileId + "/" + isBenchmarkNeeded + "/" + participantsStr + "/" + evaluatorsStr + "/" + stageId + "/" + profileType + "/" + statusOn + "/" + stageGroupId);
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

        function getProjectProfiles(projectIds, profileStatus) {
            var projectIdsStr = getParamsString(projectIds);
            if (profileStatus.toString() == "") {
                profileStatus = null;
            }
            return apiService.getAll("performance/GetProjectEvaluatedProfiles/" + projectIdsStr + "/" + profileStatus);
        }

        function GetUserProfileStageTrainings(userId, profileId) {
            var deferred = $q.defer();
            var apiName = 'trainingdiary/GetUserProfileStageTrainings/' + userId + "/" + profileId;
            apiService.getAll(apiName, "").then(function (data) {
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }

    }

})();