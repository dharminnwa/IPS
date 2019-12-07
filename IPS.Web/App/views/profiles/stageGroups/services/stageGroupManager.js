(function () {
    'use strict';
    angular
        .module('ips.stageGroups')
        .constant('stageStatusEnum', {
            notInvited: 1,
            invited: 2,
            completed: 3,
            completedOpen: 4
        })
        .factory('stageGroupManager', stageGroupManager);
    stageGroupManager.$inject = ['$q', 'apiService', '$state', 'stageStatusEnum', 'globalVariables'];
    function stageGroupManager($q, apiService, $state, stageStatusEnum, globalVariables) {
        moment.locale(globalVariables.lang.currentUICulture);
        var allStages = new kendo.data.ObservableArray([]);
        var stagesAndAlarms = new kendo.data.ObservableArray([]);
        var self = {
            allStages: allStages,
            stagesAndAlarms: stagesAndAlarms,
            activeStages: function (query) {
                var stages = [];
                angular.forEach(allStages, function (item, index) {
                    if ((moment(kendo.parseDate(item.endDate)) >= moment())) {
                        stages.push(item);
                    }
                });
                return stages;
            },
            historyStages: function (query) {
                var stages = [];
                angular.forEach(allStages, function (item, index) {
                    if (moment(kendo.parseDate(item.endDate)) < moment()) {
                        stages.push(item);
                    }
                });
                return stages;
            },
            getStages: function (query) {
                return $q.when(getStages(query));
            },
            getStageById: function (id, profileId, query) {
                return $q.when(getStageById(id, profileId, query));
            },
            addNewStageGroup: function (stageGroup) {
                return $q.when(addNewStageGroup(stageGroup));
            },
            updateStageGroup: function (stageGroup) {
                return $q.when(updateStageGroup(stageGroup));
            },

            updateStageGroupBasicInfo: function (stageGroup) {
                return $q.when(updateStageGroupBasicInfo(stageGroup));
            },
            addNewStage: function (stage) {
                return $q.when(addNewStage(stage));
            },
            updateStage: function (stage) {
                return $q.when(updateStage(stage));
            },
            removeStageGroup: function (id) {
                return $q.when(removeStageGroup(id));
            },
            removeStage: function (id) {
                return $q.when(removeStage(id));
            },
            getNotificationTemplates: function () {
                return $q.when(getNotificationTemplates('?$orderby=Name'));
            },
            getUsers: function (query) {
                return $q.when(getUsers(query));
            },
            getParticipants: function (stageGroupId) {
                return getParticipants(stageGroupId);
            },
            getStageGroupEvaluation: function (stageGroupId) {
                return GetStageGroupEvaluation(stageGroupId);
            },
            getEvaluators: function (stageGroupId) {
                return getEvaluators(stageGroupId);
            },
            getEvaluationRoles: function () {
                return getEvaluationRoles();
            },
            getJobPositions: function () {
                return getJobPositions();
            },
            updateParticipants: function (stageGroupId, participants) {
                return updateParticipants(stageGroupId, participants);
            },
            addParticipant: function (participant) {
                return addParticipant(participant);
            },
            refreshParticipant: function (stageId, participantId) {
                return refreshParticipant(stageId, participantId);
            },
            removeParticipant: function (participantId) {
                return removeParticipant(participantId);
            },
            removeAllParticipants: function (stageGroupId, roleId) {
                return removeAllParticipants(stageGroupId, roleId);
            },
            selfEvaluationUpdate: function (participantId, isSelfEvaluation) {
                return selfEvaluationUpdate(participantId, isSelfEvaluation);
            },
            lockUpdate: function (participantId, islocked) {
                return lockUpdate(participantId, islocked);
            },
            scoreManagerUpdate: function (participantId, isScoreManager) {
                return scoreManagerUpdate(participantId, isScoreManager);
            },
            sendStartNotification: function (stageId) {
                return sendStartNotification(stageId);
            },
            sendStartNotificationForParticipant: function (participantId, stageId, templateId) {
                return sendStartNotificationForParticipant(participantId, stageId, templateId);
            },
            getStageParticipants: function (stageGroupId, stageId, profileTypeId) {
                return getStageParticipants(stageGroupId, stageId, profileTypeId);
            },
            restartProfile: function (stageGroupId, stageGroup) {
                return restartProfile(stageGroupId, stageGroup);
            },
            restartSoftProfile: function (stageGroupId, stageGroup, participantId) {
                return restartSoftProfile(stageGroupId, stageGroup, participantId);
            },
            isStageGroupInUse: function (stageGroupId) {
                return isStageGroupInUse(stageGroupId);
            },
            getStagesStatus: function (stageGroupId) {
                return getStagesStatus(stageGroupId);
            },
            getAllStagesInGroup: function (stageId) {
                return getAllStagesInGroup(stageId);
            },
            getAllStageByStageGroupId: function (stageGroupId) {
                return getAllStageByStageGroupId(stageGroupId);
            },
            returnToPerviousPage: returnToPerviousPage,
            addRecurrentTrainingSetting: function (recurrentTrainingSetting) {
                return $q.when(addRecurrentTrainingSetting(recurrentTrainingSetting));
            },
            updateRecurrentTrainingSetting: function (recurrentTrainingSetting) {
                return $q.when(updateRecurrentTrainingSetting(recurrentTrainingSetting));
            },
            getProjectByProfileId: function (profileId) {
                return $q.when(getProjectByProfileId(profileId));
            }
        };
        return self;
        function getStageParticipants(stageGroupId, stageId, profileTypeId) {
            var deferred = $q.defer();
            apiService.getAll("stagegroups/" + stageGroupId + "/StatusAndProgress/" + stageId + "?profileTypeId=" + profileTypeId).then(function (data) {

                angular.forEach(data, function (evaluator, index) {
                    evaluator.userName = evaluator.firstName + " " + evaluator.lastName;

                    angular.forEach(data, function (participant, index) {
                        if (evaluator.evaluateeId == participant.participantId) {
                            evaluator.evaluateeName = participant.firstName + " " + participant.lastName;
                        }
                    });

                    evaluator.isKPISetText = evaluator.isKPISet ? "Yes" : "No";
                    evaluator.evaluationStatusText = '';
                    switch (evaluator.status) {
                        case stageStatusEnum.invited:
                            evaluator.evaluationStatusText = "Invited";
                            break;
                        case stageStatusEnum.completedOpen:
                            evaluator.evaluationStatusText = "Completed/Open";
                            break;
                        case stageStatusEnum.completed:
                            evaluator.evaluationStatusText = "Completed";
                            break;
                        case stageStatusEnum.notInvited:
                            evaluator.evaluationStatusText = "Not Invited";
                            break;
                    }
                });

                stagesAndAlarms.splice(0, stagesAndAlarms.length);
                stagesAndAlarms.push.apply(stagesAndAlarms, data);
                deferred.resolve("success");
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }
        function sendStartNotification(stageId) {
            var deferred = $q.defer();
            apiService.getById("notification", stageId).then(function (data) {
                deferred.resolve('success');
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }
        function sendStartNotificationForParticipant(participantId, stageId, templateId) {
            apiService.getAll("notification/" + participantId + "/" + stageId + "/" + templateId);
        }
        function getStages(query) {
            var deferred = $q.defer();
            var apiName = 'stageGroups';
            (query) ? '' : query = '';
            apiService.getAll(apiName, query).then(function (data) {
                _.each(data, function (item) {
                    item.startDate = moment(kendo.parseDate(item.startDate)).format("L LT");
                    item.endDate = moment(kendo.parseDate(item.endDate)).format("L LT");
                    item.startStageStartDate = moment(kendo.parseDate(item.startStageStartDate)).format("L LT");
                    item.startStageEndDate = moment(kendo.parseDate(item.startStageEndDate)).format("L LT");
                    item.milestoneStartDate = moment(kendo.parseDate(item.milestoneStartDate)).format("L LT");
                    item.milestoneEndDate = moment(kendo.parseDate(item.milestoneEndDate)).format("L LT");
                })
                allStages.splice(0, allStages.length);
                allStages.push.apply(allStages, data);
                deferred.resolve('success');
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }
        function getStageById(id, profileId, query) {
            var deferred = $q.defer();
            var apiName = 'stageGroups';
            (query) ? '' : query = '';
            if (id > 0) {
                apiService.getById(apiName, id, query).then(function (data) {
                    deferred.resolve(data);
                },
                    function (data) {
                        deferred.reject(data);
                    });
            } else {
                var startDay = moment();
                startDay = startDay.startOf('day')._d;

                var stage = {
                    id: 0,
                    name: "Send Out Settings",
                    description: "",
                    monthsSpan: 0,
                    weeksSpan: 6,
                    daysSpan: 0,
                    hoursSpan: 0,
                    minutesSpan: 0,
                    totalMilestones: 5,
                    startDate: moment(startDay).format('L LT'),
                    endDate: moment(startDay).add(6, "months").format("L LT"),
                    startStageStartDate: moment(startDay).format('L LT'),
                    startStageEndDate: moment(kendo.parseDate(startDay)).add("days", 7).format('L LT'),
                    milestoneStartDate: moment(kendo.parseDate(startDay)).add("days", 7).format('L LT'),
                    milestoneEndDate: moment(startDay).add(6, "months").format("L LT"),
                    profiles: [{
                        id: profileId
                    },],
                    stages: [{
                        id: -1,
                        name: "Start Profile",
                        stageGroupId: 0,
                        startDateTime: moment().format('L LT'),
                        endDateTime: moment().add('days', 42).format('L LT'),
                        evaluationDurationMinutes: 120,
                        emailNotification: false,
                        sMSNotification: false,
                        greenAlarmTemplateId: null,
                        greenAlarmTime: null,
                        yellowAlarmTemplateId: null,
                        yellowAlarmTime: null,
                        redAlarmTemplateId: null,
                        redAlarmTime: null,
                        externalStartNotificationTemplateId: null,
                        externalCompletedNotificationTemplateId: null,
                        externalResultsNotificationTemplateId: null,
                        evaluatorStartNotificationTemplateId: null,
                        evaluatorCompletedNotificationTemplateId: null,
                        evaluatorResultsNotificationTemplateId: null,
                        trainerStartNotificationTemplateId: null,
                        trainerCompletedNotificationTemplateId: null,
                        trainerResultsNotificationTemplateId: null,
                        managerStartNotificationTemplateId: null,
                        managerCompletedNotificationTemplateId: null,
                        managerResultsNotificationTemplateId: null
                    },
                    {
                        id: -2,
                        name: "Short Goal",
                        stageGroupId: 0,
                        startDateTime: moment().add('days', 42).format('L LT'),
                        endDateTime: moment().add('days', 84).format('L LT'),
                        evaluationDurationMinutes: 120,
                        emailNotification: false,
                        sMSNotification: false,
                        greenAlarmTemplateId: null,
                        greenAlarmTime: null,
                        yellowAlarmTemplateId: null,
                        yellowAlarmTime: null,
                        redAlarmTemplateId: null,
                        redAlarmTime: null,
                        externalStartNotificationTemplateId: null,
                        externalCompletedNotificationTemplateId: null,
                        externalResultsNotificationTemplateId: null,
                        evaluatorStartNotificationTemplateId: null,
                        evaluatorCompletedNotificationTemplateId: null,
                        evaluatorResultsNotificationTemplateId: null,
                        trainerStartNotificationTemplateId: null,
                        trainerCompletedNotificationTemplateId: null,
                        trainerResultsNotificationTemplateId: null,
                        managerStartNotificationTemplateId: null,
                        managerCompletedNotificationTemplateId: null,
                        managerResultsNotificationTemplateId: null
                    },
                    {
                        id: -3,
                        name: "Mid Goal",
                        stageGroupId: 0,
                        startDateTime: moment().add('days', 84).format('L LT'),
                        endDateTime: moment().add('days', 126).format('L LT'),
                        evaluationDurationMinutes: 120,
                        emailNotification: false,
                        sMSNotification: false,
                        greenAlarmTemplateId: null,
                        greenAlarmTime: null,
                        yellowAlarmTemplateId: null,
                        yellowAlarmTime: null,
                        redAlarmTemplateId: null,
                        redAlarmTime: null,
                        externalStartNotificationTemplateId: null,
                        externalCompletedNotificationTemplateId: null,
                        externalResultsNotificationTemplateId: null,
                        evaluatorStartNotificationTemplateId: null,
                        evaluatorCompletedNotificationTemplateId: null,
                        evaluatorResultsNotificationTemplateId: null,
                        trainerStartNotificationTemplateId: null,
                        trainerCompletedNotificationTemplateId: null,
                        trainerResultsNotificationTemplateId: null,
                        managerStartNotificationTemplateId: null,
                        managerCompletedNotificationTemplateId: null,
                        managerResultsNotificationTemplateId: null
                    },
                    {
                        id: -4,
                        name: "Long Term Goal",
                        stageGroupId: 0,
                        startDateTime: moment().add('days', 126).format('L LT'),
                        endDateTime: moment().add('days', 168).format('L LT'),
                        evaluationDurationMinutes: 120,
                        emailNotification: false,
                        sMSNotification: false,
                        greenAlarmTemplateId: null,
                        greenAlarmTime: null,
                        yellowAlarmTemplateId: null,
                        yellowAlarmTime: null,
                        redAlarmTemplateId: null,
                        redAlarmTime: null,
                        externalStartNotificationTemplateId: null,
                        externalCompletedNotificationTemplateId: null,
                        externalResultsNotificationTemplateId: null,
                        evaluatorStartNotificationTemplateId: null,
                        evaluatorCompletedNotificationTemplateId: null,
                        evaluatorResultsNotificationTemplateId: null,
                        trainerStartNotificationTemplateId: null,
                        trainerCompletedNotificationTemplateId: null,
                        trainerResultsNotificationTemplateId: null,
                        managerStartNotificationTemplateId: null,
                        managerCompletedNotificationTemplateId: null,
                        managerResultsNotificationTemplateId: null
                    },
                    {
                        id: -5,
                        name: "Final Goal",
                        stageGroupId: 0,
                        startDateTime: moment().add('days', 168).format('L LT'),
                        endDateTime: moment().add('days', 210).format('L LT'),
                        evaluationDurationMinutes: 120,
                        emailNotification: false,
                        sMSNotification: false,
                        greenAlarmTemplateId: null,
                        greenAlarmTime: null,
                        yellowAlarmTemplateId: null,
                        yellowAlarmTime: null,
                        redAlarmTemplateId: null,
                        redAlarmTime: null,
                        externalStartNotificationTemplateId: null,
                        externalCompletedNotificationTemplateId: null,
                        externalResultsNotificationTemplateId: null,
                        evaluatorStartNotificationTemplateId: null,
                        evaluatorCompletedNotificationTemplateId: null,
                        evaluatorResultsNotificationTemplateId: null,
                        trainerStartNotificationTemplateId: null,
                        trainerCompletedNotificationTemplateId: null,
                        trainerResultsNotificationTemplateId: null,
                        managerStartNotificationTemplateId: null,
                        managerCompletedNotificationTemplateId: null,
                        managerResultsNotificationTemplateId: null
                    }]
                };
                console.log(stage);
                deferred.resolve(stage)
            }
            return deferred.promise;
        }
        function getUsers(query) {
            var deferred = $q.defer();
            var apiName = 'User';
            (query) ? '' : query = '';
            apiService.getAll(apiName, query).then(function (data) {
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }
        function getParticipants(stageGroupId) {
            return apiService.getAll("stagegroups/participants/" + stageGroupId);
        }
        function GetStageGroupEvaluation(stageGroupId) {
            return apiService.getAll("stagegroups/GetStageGroupEvaluation/" + stageGroupId);
        }
        function getEvaluators(stageGroupId) {
            return apiService.getAll("stagegroups/evaluators/" + stageGroupId);
        }
        function getEvaluationRoles() {
            return apiService.getAll("EvaluationRoles");
        }
        function getJobPositions() {
            return apiService.getAll("JobTitles");
        }
        function addNewStageGroup(stageGroup) {
            var deferred = $q.defer();
            var apiName = 'stageGroups';
            apiService.add(apiName, stageGroup).then(function (data) {
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }
        function addNewStage(stage) {
            var deferred = $q.defer();
            var apiName = 'stages';
            apiService.add(apiName, stage).then(function (data) {
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }
        function updateStageGroup(stageGroup) {
            var deferred = $q.defer();
            var apiName = 'stageGroups';
            apiService.update(apiName, stageGroup).then(function (data) {
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }
        function updateStageGroupBasicInfo(stageGroup) {
            var deferred = $q.defer();
            var apiName = 'stageGroups/updateStageGroupBasicInfo';
            apiService.update(apiName, stageGroup).then(function (data) {
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }
        function updateStage(stage) {
            var deferred = $q.defer();
            var apiName = 'stages';
            apiService.update(apiName, stage).then(function (data) {
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }
        function removeStageGroup(id) {
            var deferred = $q.defer();
            var apiName = 'stageGroups';
            apiService.remove(apiName, id).then(function (data) {
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }
        function removeStage(id) {
            var deferred = $q.defer();
            var apiName = 'stages';
            apiService.remove(apiName, id).then(function (data) {
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }
        function getNotificationTemplates(query) {
            var deferred = $q.defer();
            var apiName = 'NotificationTemplates';
            (query) ? '' : query = '';
            apiService.getAll(apiName, query).then(function (data) {
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }
        function updateParticipants(stageGroupId, participants) {
            var deferred = $q.defer();
            apiService.add("stageGroups/" + stageGroupId + "/participants", participants).then(function (data) {
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }
        function addParticipant(participant) {
            var deferred = $q.defer();
            apiService.add("EvaluationParticipants", participant).then(function (data) {
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }
        function refreshParticipant(stageId, participantId) {
            var deferred = $q.defer();
            apiService.remove("stageGroups/stage/" + stageId + "/participant/" + participantId, "answers").then(function (data) {
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }
        function removeParticipant(participantId) {
            var deferred = $q.defer();
            apiService.remove("stageGroups/participant", participantId).then(function (data) {
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }
        function removeAllParticipants(stageGroupId, roleId) {
            var deferred = $q.defer();
            apiService.remove("stageGroups/" + stageGroupId + "/Participants", roleId).then(function (data) {
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }
        function selfEvaluationUpdate(participantId, isSelfEvaluation) {
            var deferred = $q.defer();
            apiService.update("stageGroups/Participant/" + participantId + "/" + isSelfEvaluation, null).then(function (data) {
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }
        function lockUpdate(participantId, isLocked) {
            var deferred = $q.defer();
            apiService.update("stageGroups/Participant/" + participantId + "/lock/" + isLocked, null).then(function (data) {
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }
        function scoreManagerUpdate(participantId, isScoreManager) {
            var deferred = $q.defer();
            apiService.update("stageGroups/Participant/" + participantId + "/scoreManager/" + isScoreManager, null).then(function (data) {
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }
        function returnToPerviousPage() {
            $state.go(
                $state.$current.parent.self.name,
                null,
                { reload: true }
            );
        }
        function restartSoftProfile(stageGroupId, stageGroup, participantId) {
            var deferred = $q.defer();
            var apiName = 'stagegroups/restartsoftprofile/' + stageGroupId + '/' + participantId;
            apiService.update(apiName, stageGroup).then(function (data) {
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }
        function restartProfile(stageGroupId, stageGroup) {
            var deferred = $q.defer();
            var apiName = 'stagegroups/restartprofile/' + stageGroupId;
            apiService.update(apiName, stageGroup).then(function (data) {
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }
        function isStageGroupInUse(stageGroupId) {
            var deferred = $q.defer();
            apiService.getById("stagegroups/is_in_use", stageGroupId, "").then(function (data) {
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }
        function getStagesStatus(stageGroupId) {
            var deferred = $q.defer();
            apiService.getAll("stagegroups/" + stageGroupId + "/stagesstatus").then(function (data) {
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }
        function getAllStagesInGroup(stageId) {
            var deferred = $q.defer();
            apiService.getAll("stagegroups/" + stageId + "/stagesinfo").then(function (data) {
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }
        function getAllStageByStageGroupId(stageGroupId) {
            var deferred = $q.defer();
            apiService.getAll("stagegroups/" + stageGroupId + "/allstages").then(function (data) {
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }
        function addRecurrentTrainingSetting(recurrentTrainingSetting) {
            var deferred = $q.defer();
            apiService.add("StageGroups/AddRecurrentTrainingSetting", recurrentTrainingSetting).then(function (data) {
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }
        function updateRecurrentTrainingSetting(recurrentTrainingSetting) {
            var deferred = $q.defer();
            apiService.update("StageGroups/UpdateRecurrentTrainingSetting", recurrentTrainingSetting).then(function (data) {
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }

        function getProjectByProfileId(profileId) {
            var deferred = $q.defer();
            apiService.getAll("projects/GetProjectByProfileId/" + profileId).then(function (data) {
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }
    }
})();