(function () {
    'use strict';

    angular
        .module('ips.organization', ['ui.router', 'ips.performance'])
        .factory('organizationManager', organizationManager);

    organizationManager.$inject = ['$q', 'apiService'];

    function organizationManager($q, apiService) {
        var self = {

            getOrganizations: function (query) {
                return $q.when(getOrganizations(query));
            },

            getOrganizationById: function (id, query) {
                return $q.when(getOrganizationsById(id, query));
            },
            getOrganizationProjects: function (organzationId) {
                return $q.when(getOrganizationProjects(organzationId));
            },
            getOrganizationUsers: function (organzationId) {
                return $q.when(getOrganizationUsers(organzationId));
            },
            getOrganizationDepartments: function (organzationId) {
                return $q.when(getOrganizationDepartments(organzationId));
            },
            getOrganizationTeams: function (organzationId) {
                return $q.when(getOrganizationTeams(organzationId));
            },
            getDepartmentbyId: function (departmentId) {
                return $q.when(getDepartmentbyId(departmentId));
            },
            getTeambyId: function (teamId) {
                return $q.when(getTeambyId(teamId));
            },
            importOrganizationCSV: function (fileName, organizationId) {
                return $q.when(importOrganizationCSV(fileName, organizationId));
            },
        };

        return self;

        function getOrganizations(query) {
            var deferred = $q.defer();
            var apiName = 'organization';
            (!query) ? query = '' : '';
            apiService.getAll(apiName, query).then(function (data) {
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }
        function getOrganizationsById(id, query) {
            var deferred = $q.defer();
            var apiName = 'organization';
            (!query) ? query = '' : '';
            apiService.getById(apiName, id, query).then(function (data) {
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }
        function getOrganizationProjects(organzationId) {
            var deferred = $q.defer();
            var apiName = 'organization/users';
            apiService.getById(apiName, organzationId, null).then(function (data) {
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }
        function getOrganizationUsers(organzationId) {
            var deferred = $q.defer();
            var apiName = 'organizations/GetOrganizationUsersbyOrganizationId';
            apiService.getById(apiName, organzationId, null).then(function (data) {
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }

     


        function getOrganizationDepartments(organzationId) {
            var deferred = $q.defer();
            var apiName = 'departments/GetOrganizationDepartmentsByOrganizationId';
            apiService.getById(apiName, organzationId, null).then(function (data) {
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }
        function getDepartmentbyId(departmentId) {
            var deferred = $q.defer();
            var apiName = 'departments/GetDepartmentById';
            apiService.getById(apiName, departmentId, null).then(function (data) {
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }
        function getOrganizationTeams(organzationId) {
            var deferred = $q.defer();
            var apiName = 'teams/GetTeamsByOrganizationId';
            apiService.getById(apiName, organzationId, null).then(function (data) {
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }
        function getTeambyId(teamId) {
            var deferred = $q.defer();
            var apiName = 'teams/GetTeamById';
            apiService.getById(apiName, teamId, null).then(function (data) {
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }
        function importOrganizationCSV(fileName, organizationId) {
            var deferred = $q.defer();
            var apiName = 'organizations/importOrganizationCSV/' + fileName + "/" + organizationId ;
            apiService.add(apiName, null).then(function (data) {
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }
    }

})();