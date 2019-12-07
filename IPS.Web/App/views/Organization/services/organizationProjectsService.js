(function () {
    'use strict';

    angular
        .module('ips.organization')
        .factory('organizationProjectsService', organizationProjectsService);
    organizationProjectsService.$inject = ['$q', 'apiService', '$state'];
    function organizationProjectsService($q, apiService, $state) {

        var projects = {};

        var self = {

            projects: projects,
            setProjects: function (data) {
                return $q.when(setProjects(data));
            },
            getActiveProjects: function () {
                return $q.when(getActiveProjects());
            },
            getExpiredProjects: function () {
                return $q.when(getExpiredProjects());
            },
            getCompletedProjects: function () {
                return $q.when(getCompletedProjects());
            },
            getPendingProjects: function () {
                return $q.when(getPendingProjects());
            },
            getHistoryProjects: function () {
                return $q.when(getHistoryProjects());
            },
            isProjectInUse: function (projectId) {
                return $q.when(isProjectInUse(projectId));
            },
            removeProject: function (projectId) {
                return $q.when(removeProject(projectId));
            },
            returnToPerviousPage: returnToPerviousPage,

        };

        return self;

        function setProjects(data) {
            var deferred = $q.defer();
            var apiName = 'projects/GetUserProjects';
            projects = {};
            projects = data;
            deferred.resolve('success');
            return deferred.promise;
        }

        function getActiveProjects() {
            var deferred = $q.defer();
            var activeProjects = new kendo.data.ObservableArray([]);
            if (projects) {
                activeProjects.push.apply(activeProjects, projects.activeProjects);
            }

            deferred.resolve(activeProjects);

            return deferred.promise;
        }

        function getExpiredProjects() {
            var deferred = $q.defer();
            var expiredProjects = new kendo.data.ObservableArray([]);
            if (projects) {
                expiredProjects.push.apply(expiredProjects, projects.expiredProjects);
            }

            deferred.resolve(expiredProjects);

            return deferred.promise;
        }

        function getCompletedProjects() {
            var deferred = $q.defer();
            var completedProjects = new kendo.data.ObservableArray([]);;
            if (projects) {
                completedProjects.push.apply(completedProjects, projects.completedProjects);
            }

            deferred.resolve(completedProjects);

            return deferred.promise;
        }

        function getPendingProjects() {
            var deferred = $q.defer();
            var pendingProjects = new kendo.data.ObservableArray([]);;
            if (projects) {
                pendingProjects.push.apply(pendingProjects, projects.pendingProjects);
            }

            deferred.resolve(pendingProjects);

            return deferred.promise;
        }



        function getHistoryProjects() {
            var deferred = $q.defer();
            var historyProjects = new kendo.data.ObservableArray([]);;
            if (projects) {
                historyProjects.push.apply(historyProjects, projects.historyProjects);
            }

            deferred.resolve(historyProjects);

            return deferred.promise;
        }


        function returnToPerviousPage() {
            $state.go(
                $state.$current.parent.self.name,
                null,
                { reload: true }
                );
        }
        function isProjectInUse(projectId) {
            var deferred = $q.defer();
            apiService.getById("projects/is_in_use", projectId, "").then(function (data) {
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }

        function removeProject(projectId) {
            var deferred = $q.defer();
            apiService.remove("project", projectId, "").then(function (data) {
                var index = _.findIndex(projects.pendingProjects, function (projectItem) {
                    return projectItem.id == projectId;
                })
                if (index > -1) {
                    projects.pendingProjects.splice(index, 1);
                }
                deferred.resolve(data);

            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }


    }

})();