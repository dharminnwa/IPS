(function () {
    'use strict';

    angular
        .module('ips.organization')
        .factory('organizationCustomerService', organizationCustomerService);
    organizationCustomerService.$inject = ['$q', 'apiService', '$state'];
    function organizationCustomerService($q, apiService, $state) {

        var customers = {};

        var self = {
            getCustomerById: function (customerId) {
                return $q.when(getCustomerById(customerId));
            },
            getCustomerHistoryById: function (customerId) {
                return $q.when(getCustomerHistoryById(customerId));
            },
            getCustomers: function (organizationId) {
                return $q.when(getCustomers(organizationId));
            },
            importCSV: function (fileName, organizationId,salesManId) {
                return $q.when(importCSV(fileName, organizationId, salesManId));
            },
            getCustomerActivityResult: function (customerId, activityId) {
                return $q.when(getCustomerActivityResult(customerId, activityId));
            },
            returnToPerviousPage: returnToPerviousPage,
        };

        return self;
        function getCustomerById(customerId) {
            var deferred = $q.defer();
            var apiName = 'customer/GetCustomerById/' + customerId;
            apiService.getAll(apiName, null).then(function (data) {
                deferred.resolve(data);
            },
            function (data) {
                deferred.reject(data);
            });
            return deferred.promise;
        }

        function getCustomerHistoryById(customerId) {
            var deferred = $q.defer();
            var apiName = 'customer/GetCustomerHistoryById/' + customerId;
            apiService.getAll(apiName, null).then(function (data) {
                deferred.resolve(data);
            },
            function (data) {
                deferred.reject(data);
            });
            return deferred.promise;
        }

        function getCustomers(organizationId) {
            var deferred = $q.defer();
            var apiName = 'organizations/GetOrganizationCustomers/' + organizationId;
            apiService.getAll(apiName, null).then(function (data) {
                deferred.resolve(data);
            },
            function (data) {
                deferred.reject(data);
            });
            return deferred.promise;
        }

     

        function importCSV(fileName, organizationId, salesManId) {
            var deferred = $q.defer();
            var apiName = 'organizations/importCSV/' + fileName + "/" + organizationId + "/" + salesManId;
            apiService.add(apiName, null).then(function (data) {
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


        function returnToPerviousPage() {
            $state.go(
                $state.$current.parent.self.name,
                null,
                { reload: true }
                );
        }
    }

})();