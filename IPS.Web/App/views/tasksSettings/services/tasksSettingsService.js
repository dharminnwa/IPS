(function () {
    'use strict';

    angular
        .module('ips.tasksSettings', ['ui.router', 'kendo.directives', 'growing-panes'])
        .factory('tasksSettingsService', tasksSettingsService);

    tasksSettingsService.$inject = ['$q', 'apiService'];

    function tasksSettingsService($q, apiService) {
        var tasks = new kendo.data.ObservableArray([]);


        var self = {
            getOrganizations: function () {
                return $q.when(getOrganizations());
            },
            getDepartments: function (orgId) {
                return $q.when(getDepartments(orgId));
            },
            getTeams: function (orgId) {
                return $q.when(getTeams(orgId));
            },
            getUsers: function (orgId) {
                return $q.when(getUsers(orgId));
            },
            getTaskPriorities: function (orgId, depId, teamId, userId) {
                return $q.when(getTaskPriorities(orgId, depId, teamId, userId));
            },
            getTaskCategories: function (orgId, depId, teamId, userId) {
                return $q.when(getTaskCategories(orgId, depId, teamId, userId));
            },
            getTaskStatuses: function (orgId, depId, teamId, userId) {
                return $q.when(getTaskStatuses(orgId, depId, teamId, userId));
            },
            getTaskScale: function (orgId, depId, teamId, userId) {
                return $q.when(getTaskScale(orgId, depId, teamId, userId));
            },
            getTaskScaleRatingByUserId: function (userId) {
                return $q.when(getTaskScaleRatingByUserId(userId));
            }

        };

        return self;

        function getOrganizations() {
            var deferred = $q.defer();
            apiService.getAll("organization?$orderby=Name&$select=Name,Id").then(function (data) {
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        };

        function getDepartments(orgId) {
            var deferred = $q.defer();
            apiService.getAll("department?$orderby=Name&$select=Name,Id&$filter=OrganizationId eq " + orgId).then(function (data) {
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        };

        function getTeams(orgId) {
            var deferred = $q.defer();
            apiService.getAll("team?$orderby=Name&$filter=OrganizationId eq " + orgId).then(function (data) {
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        };

        function getUsers(orgId) {
            var deferred = $q.defer();
            apiService.getAll("user?$orderby=FirstName,LastName&$expand=Teams,Departments1,Departments&$filter=OrganizationId eq " + orgId).then(function (data) {
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        };

        function getTaskStatuses(orgId, depId, teamId, userId) {
            var deferred = $q.defer();
            apiService.getAll("taskStatuses/" + orgId + "/" + depId + "/" + teamId + "/" + userId).then(function (data) {
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        };

        function getTaskPriorities(orgId, depId, teamId, userId) {
            var deferred = $q.defer();
            apiService.getAll("taskPriorities/" + orgId + "/" + depId + "/" + teamId + "/" + userId).then(function (data) {
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        };

        function getTaskCategories(orgId, depId, teamId, userId) {
            var deferred = $q.defer();
            apiService.getAll("TaskCategories/" + orgId + "/" + depId + "/" + teamId + "/" + userId).then(function (data) {
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        };

        function getTaskScale(orgId, depId, teamId, userId) {
            var deferred = $q.defer();
            apiService.getAll("TaskScaleDetail/" + orgId + "/" + depId + "/" + teamId + "/" + userId + "?$expand=TaskScaleRanges").then(function (data) {
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        };

        function getTaskScaleRatingByUserId(userId) {
            var deferred = $q.defer();
            apiService.getAll("TaskScaleRatings/" + userId + "?$expand=TaskScaleRanges").then(function (data) {
                deferred.resolve(data.taskScaleRanges);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        };

    }

})();