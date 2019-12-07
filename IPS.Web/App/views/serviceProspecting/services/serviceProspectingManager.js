(function () {
    'use strict';

    angular
        .module('ips.serviceProspecting', ['ui.router', 'kendo.directives', 'growing-panes'])
        .factory('serviceProspectingManager', serviceProspectingManager);

    serviceProspectingManager.$inject = ['$q', 'apiService'];

    function serviceProspectingManager($q, apiService) {
        var self = {
            getServiceProspectingProjects: function () {
                return $q.when(getServiceProspectingProjects());
            },
            getServiceProspectingCustomerResultsByUserId: function (userId) {
                return $q.when(getServiceProspectingCustomerResultsByUserId(userId));
            },
            getServiceProspectingCustomerResultsByUserIds: function (userIds) {
                return $q.when(getServiceProspectingCustomerResultsByUserIds(userIds));
            },
            getProjectServiceProspectingGoalsByUserId: function (userId, projectId) {
                return $q.when(getProjectServiceProspectingGoalsByUserId(userId, projectId));
            },
            getServiceProspectingCustomersByUserIds: function (userIds) {
                return $q.when(getServiceProspectingCustomersByUserIds(userIds));
            },
            getServiceProspectingGoalsByUserId: function (userId) {
                return $q.when(getServiceProspectingGoalsByUserId(userId));
            },
            getProjectServiceProspectingGoalResultSummaryByUserId: function (userId, projectId) {
                return $q.when(getProjectServiceProspectingGoalResultSummaryByUserId(userId, projectId));
            },
            getServiceProspectingCustomersByUserId: function (userId) {
                return $q.when(getServiceProspectingCustomersByUserId(userId));
            },
            getServiceProspectingGoalActivityInfoesByUserId: function (userId) {
                return $q.when(getServiceProspectingGoalActivityInfoesByUserId(userId));
            },
            getServiceProspectingGoalActivityInfoesByUserIds: function (userIds) {
                return $q.when(getServiceProspectingGoalActivityInfoesByUserIds(userIds));
            },
            getServiceProspectingGoalResultSummaryByUserId: function (userId) {
                return $q.when(getServiceProspectingGoalResultSummaryByUserId(userId));
            },


            addProspectingGoal: function (prospectingGoal) {
                return $q.when(addProspectingGoal(prospectingGoal));
            },
            updateProspectingGoal: function (prospectingGoal) {
                return $q.when(updateProspectingGoal(prospectingGoal));

            },

            addProspectingCustomer: function (prospectingCustomer) {
                return $q.when(addProspectingCustomer(prospectingCustomer));
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
            getCustomerActivityResult: function (customerId, activityId) {
                return $q.when(getCustomerActivityResult(customerId, activityId));
            },

            saveCustomerActivityResult: function (prospectingActivityCustomerResult) {
                return $q.when(saveCustomerActivityResult(prospectingActivityCustomerResult));
            },


            saveActivityLog: function (prospectingActivityLoginfo) {
                return $q.when(saveActivityLog(prospectingActivityLoginfo));
            },
            updateProspectingActivity: function (prospectingActivity) {
                return $q.when(updateProspectingActivity(prospectingActivity));
            },
            saveProspectingActivity: function (prospectingActivity) {
                return $q.when(saveProspectingActivity(prospectingActivity));
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
            GetMeetingProspectingCustomersForGoalId: function (goalId) {
                return $q.when(GetMeetingProspectingCustomersForGoalId(goalId));
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

            GetProspectingGoalResultSummaryByUserIds: function (userIds) {
                return $q.when(GetProspectingGoalResultSummaryByUserIds(userIds));
            },


            GetProspectingGoalResultSummaryByGoalId: function (goalId) {
                return $q.when(GetProspectingGoalResultSummaryByGoalId(goalId));
            },
            getProsepectingActivityResultData: function (prospectingActivityId) {
                return $q.when(getProsepectingActivityResultData(prospectingActivityId));
            },
            getProspectingSkillResultByGoalId: function (prospectingGoalId, skillId) {
                return $q.when(getProspectingSkillResultByGoalId(prospectingGoalId, skillId));
            },
            getUserTaskServiceActivityData: function (activityResultFilterOptionModel) {
                return $q.when(getUserTaskServiceActivityData(activityResultFilterOptionModel));
            },
            getProjectCustomers: function (projectId) {
                return $q.when(getProjectCustomers(projectId));
            },
            assignUserToCustomer: function (customerId, userId) {
                return $q.when(assignUserToCustomer(customerId, userId));
            },
            saveCustomerOfferDetail: function (offerDetail) {
                return $q.when(saveCustomerOfferDetail(offerDetail));
            },
            getCustomerOfferDetails: function (prospectingCustomerId) {
                return $q.when(getCustomerOfferDetails(prospectingCustomerId));
            },
            saveOfferClosingDetail: function (offerClosingDetail) {
                return $q.when(saveOfferClosingDetail(offerClosingDetail));
            },
        };

        return self;


        function getServiceProspectingProjects() {
            var deferred = $q.defer();
            var apiName = 'projects/GetServiceProspectingProjects';
            apiService.getAll(apiName).then(function (data) {
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }
        function getServiceProspectingCustomersByUserIds(userIds) {
            var deferred = $q.defer();
            var apiName = 'profiles/getServiceProspectingCustomersByUserIds';
            apiService.add(apiName, userIds).then(function (data) {
                deferred.resolve(data);
            },
            function (data) {
                deferred.reject(data);
            });
            return deferred.promise;
        }
        function getServiceProspectingCustomerResultsByUserIds(userIds) {
            var deferred = $q.defer();
            var apiName = 'profiles/getServiceProspectingCustomerResultsByUserIds';
            apiService.add(apiName, userIds).then(function (data) {
                deferred.resolve(data);
            },
            function (data) {
                deferred.reject(data);
            });
            return deferred.promise;
        }
        function getServiceProspectingGoalsByUserId(userId) {
            var deferred = $q.defer();
            var apiName = 'profiles/getServiceProspectingGoalsByUserId/' + userId;
            apiService.getAll(apiName).then(function (data) {
                deferred.resolve(data);
            },
            function (data) {
                deferred.reject(data);
            });
            return deferred.promise;
        }
        function getProjectServiceProspectingGoalResultSummaryByUserId(userId, projectId) {
            var deferred = $q.defer();
            var apiName = 'performance/getProjectServiceProspectingGoalResultSummaryByUserId/' + userId + "/" + projectId;
            apiService.getAll(apiName).then(function (data) {
                deferred.resolve(data);
            },
            function (data) {
                deferred.reject(data);
            });
            return deferred.promise;
        }
        function getServiceProspectingCustomersByUserId(userId) {
            var deferred = $q.defer();
            var apiName = 'profiles/getServiceProspectingCustomersByUserId/' + userId;
            apiService.getAll(apiName).then(function (data) {
                deferred.resolve(data);
            },
            function (data) {
                deferred.reject(data);
            });
            return deferred.promise;
        }
        function getServiceProspectingGoalActivityInfoesByUserId(userId) {
            var deferred = $q.defer();
            var apiName = 'profiles/getServiceProspectingGoalActivityInfoesByUserId/' + userId;
            apiService.getAll(apiName).then(function (data) {
                deferred.resolve(data);
            },
            function (data) {
                deferred.reject(data);
            });
            return deferred.promise;
        }
        function getServiceProspectingGoalActivityInfoesByUserIds(userIds) {
            var deferred = $q.defer();
            var apiName = 'profiles/getServiceProspectingGoalActivityInfoesByUserIds';
            apiService.add(apiName, userIds).then(function (data) {
                deferred.resolve(data);
            },
            function (data) {
                deferred.reject(data);
            });
            return deferred.promise;
        }
        function getServiceProspectingGoalResultSummaryByUserId(userId) {
            var deferred = $q.defer();
            var apiName = 'performance/getServiceProspectingGoalResultSummaryByUserId/' + userId;
            apiService.getAll(apiName).then(function (data) {
                deferred.resolve(data);
            },
            function (data) {
                deferred.reject(data);
            });
            return deferred.promise;
        }
        function getServiceProspectingCustomerResultsByUserId(userId) {
            var deferred = $q.defer();
            var apiName = 'profiles/getServiceProspectingCustomerResultsByUserId/' + userId;
            apiService.getAll(apiName).then(function (data) {
                deferred.resolve(data);
            },
            function (data) {
                deferred.reject(data);
            });
            return deferred.promise;
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
        function GetMeetingProspectingCustomersForGoalId(goalId) {
            var deferred = $q.defer();
            var apiName = 'organizations/GetMeetingProspectingCustomersForGoalId/' + goalId;
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

        function getCustomerActivityResult(activityId, customerId) {
            var deferred = $q.defer();
            var apiName = 'profiles/getCustomerActivityResult/' + activityId + '/' + customerId;
            apiService.getAll(apiName).then(function (data) {
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

        function saveProspectingActivity(prospectingActivity) {
            var deferred = $q.defer();
            var apiName = 'profiles/saveProspectingActivity';
            apiService.add(apiName, prospectingActivity).then(function (data) {
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



        function GetProspectingGoalResultSummaryByUserIds(userIds) {
            var deferred = $q.defer();
            var apiName = 'performance/GetProspectingGoalResultSummaryByUserIds';
            apiService.add(apiName, userIds).then(function (data) {
                deferred.resolve(data);
            },
            function (data) {
                deferred.reject(data);
            });
            return deferred.promise;
        }



        function getProjectServiceProspectingGoalsByUserId(userId, projectId) {
            if (!(userId)) {
                userId = 0;
            }
            var deferred = $q.defer();
            var apiName = 'profiles/GetProjectServiceProspectingGoalsByUserId/' + userId + "/" + projectId;
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
        function getProspectingSkillResultByGoalId(prospectingGoalId, skillId) {
            var deferred = $q.defer();
            var apiName = 'project/getProspectingSkillResultByGoalId/' + prospectingGoalId + "/" + skillId;
            apiService.getAll(apiName, "").then(function (data) {
                deferred.resolve(data);
            },
            function (data) {
                deferred.reject(data);
            });
            return deferred.promise;
        }

        function getUserTaskServiceActivityData(activityResultFilterOptionModel) {
            var deferred = $q.defer();
            var apiName = 'tasks/getUserTaskServiceActivityData';
            apiService.add(apiName, activityResultFilterOptionModel).then(function (data) {
                deferred.resolve(data);
            },
            function (data) {
                deferred.reject(data);
            });
            return deferred.promise;
        }
        function getProjectCustomers(projectId) {
            var deferred = $q.defer();
            var apiName = 'project/getProjectCustomers/' + projectId;
            apiService.getAll(apiName, "").then(function (data) {
                deferred.resolve(data);
            },
            function (data) {
                deferred.reject(data);
            });
            return deferred.promise;
        }

        function assignUserToCustomer(customerId, userId) {
            var deferred = $q.defer();
            var apiName = 'project/AssignUserToCustomer/' + customerId + '/' + userId;
            apiService.getAll(apiName, null).then(function (data) {
                deferred.resolve(data);
            },
            function (data) {
                deferred.reject(data);
            });
            return deferred.promise;
        }

        function saveCustomerOfferDetail(offerDetail) {
            var deferred = $q.defer();
            var apiName = 'customer/saveCustomerOfferDetail';
            apiService.add(apiName, offerDetail).then(function (data) {
                deferred.resolve(data);
            },
            function (data) {
                deferred.reject(data);
            });
            return deferred.promise;

        }
        function getCustomerOfferDetails(prospectingCustmerId) {
            var deferred = $q.defer();
            var apiName = 'customer/getCustomerOfferDetails/' + prospectingCustmerId;
            apiService.getAll(apiName, null).then(function (data) {
                deferred.resolve(data);
            },
            function (data) {
                deferred.reject(data);
            });
            return deferred.promise;
        }


        function saveOfferClosingDetail(offerClosingDetail) {
            var deferred = $q.defer();
            var apiName = 'customer/saveOfferClosingDetail';
            apiService.add(apiName, offerClosingDetail).then(function (data) {
                deferred.resolve(data);
            },
            function (data) {
                deferred.reject(data);
            });
            return deferred.promise;

        }
    }

})();