(function () {
    'use strict';

    angular
        .module('ips.organization')
        .factory('organizationSalesService', organizationSalesService);
    organizationSalesService.$inject = ['$q', 'apiService', '$state'];
    function organizationSalesService($q, apiService, $state) {


        var self = {

            returnToPerviousPage: returnToPerviousPage,
            getProjectsbyUserId: function (userId) {
                return $q.when(getProjectsbyUserId(userId));
            },
            getProjectProfiles: function (projectId) {
                return $q.when(getProjectProfiles(projectId));
            },
            getUserSalesActivityData: function (profileId, userId) {
                return $q.when(getUserSalesActivityData(profileId, userId));
            },
            getUserAggregatedSalesActivityData: function (profileId, userId) {
                return $q.when(getUserAggregatedSalesActivityData(profileId, userId));
            },
            getSalesActivityData: function (profileId) {
                return $q.when(getSalesActivityData(profileId));
            },
            getProspectingTasksbyUserId: function (userId) {
                return $q.when(getProspectingTasksbyUserId(userId));
            },

            getUserTaskSalesActivityData: function (activityResultFilterOptionModel) {
                return $q.when(getUserTaskSalesActivityData(activityResultFilterOptionModel));
            },
            getUserTaskAggregatedSalesActivityData: function (activityResultFilterOptionModel) {
                return $q.when(getUserTaskAggregatedSalesActivityData(activityResultFilterOptionModel));
            },

            getProspectingSkillResultByGoalId: function (prospectingGoalId,skillId) {
                return $q.when(getProspectingSkillResultByGoalId(prospectingGoalId, skillId));
            }
        };

        return self;

        function getProjectsbyUserId(userId) {
            var deferred = $q.defer();
            var apiName = 'projects/GetProjectsbyUserId/' + userId;
            apiService.getAll(apiName, null).then(function (data) {
                deferred.resolve(data);
            },
            function (data) {
                deferred.reject(data);
            });
            return deferred.promise;
        }
        function getProjectProfiles(projectId) {
            var deferred = $q.defer();
            var apiName = 'profiles/GetProjectProfiles/' + projectId;
            apiService.getAll(apiName, null).then(function (data) {
                deferred.resolve(data);
            },
            function (data) {
                deferred.reject(data);
            });
            return deferred.promise;
        }

        function getUserSalesActivityData(profileId, userId) {
            var deferred = $q.defer();
            var apiName = 'project/getUserSalesActivityData/' + profileId + '/' + userId;
            apiService.getAll(apiName, "").then(function (data) {
                deferred.resolve(data);
            },
            function (data) {
                deferred.reject(data);
            });
            return deferred.promise;
        }

        function getUserAggregatedSalesActivityData(profileId, userId) {
            var deferred = $q.defer();
            var apiName = 'project/getUserAggregatedSalesActivityData/' + profileId + "/" + userId;
            apiService.getAll(apiName, "").then(function (data) {
                deferred.resolve(data);
            },
            function (data) {
                deferred.reject(data);
            });
            return deferred.promise;
        }


        function getSalesActivityData(profileId) {
            var deferred = $q.defer();
            var apiName = 'project/getSalesActivityData/' + profileId;
            apiService.getAll(apiName, "").then(function (data) {
                deferred.resolve(data);
            },
            function (data) {
                deferred.reject(data);
            });
            return deferred.promise;
        }


        function getProspectingTasksbyUserId(userId) {
            var deferred = $q.defer();
            var apiName = 'Tasks/getProspectingTasksbyUserId/' + userId;
            apiService.getAll(apiName, null).then(function (data) {
                deferred.resolve(data);
            },
            function (data) {
                deferred.reject(data);
            });
            return deferred.promise;
        }

        function getUserTaskSalesActivityData(activityResultFilterOptionModel) {
            var deferred = $q.defer();
            var apiName = 'tasks/getUserTaskSalesActivityData';
            apiService.add(apiName, activityResultFilterOptionModel).then(function (data) {
                deferred.resolve(data);
            },
            function (data) {
                deferred.reject(data);
            });
            return deferred.promise;
        }
        function getUserTaskAggregatedSalesActivityData(activityResultFilterOptionModel) {
            var deferred = $q.defer();
            var apiName = 'tasks/getUserTaskAggregatedSalesActivityData';
            apiService.add(apiName, activityResultFilterOptionModel).then(function (data) {
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
        

        function returnToPerviousPage() {
            $state.go(
                $state.$current.parent.self.name,
                null,
                { reload: true }
                );
        }
    }

})();