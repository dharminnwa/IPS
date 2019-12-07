(function () {
    'use strict';

    angular
        .module('ips.user')
        .factory('rolesManager', rolesManager);

    rolesManager.$inject = ['$q', 'apiService'];

    function rolesManager($q, apiService) {
        var self = {
            getRoles: function (query) {
                return $q.when(getRoles(query));
            },
            getRolesByOrganizationId: function (organizationId) {
                return $q.when(getRolesByOrganizationId(organizationId));
            }
        };

        return self;

        function getRoles(query) {
            var deferred = $q.defer();
            var apiName = 'role';
            (!query) ? query = '' : '';
            apiService.getAll(apiName, query).then(function (data) {
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }
        function getRolesByOrganizationId(organizationId) {
            var deferred = $q.defer();
            var apiName = 'role/getRolesByOrganizationId';
            apiService.getById(apiName, organizationId).then(function (data) {
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }

    }

})();