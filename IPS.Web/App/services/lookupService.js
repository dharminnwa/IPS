(function () {
    'use strict';

    angular
        .module('ips')
        .factory('lookupService', lookupService);

    lookupService.$inject = ['$q', 'apiService'];

    function lookupService($q, apiService) {
        var self = {
            getLookups: function (lookUpItemType) {
                return $q.when(getLookups(lookUpItemType));
            },
            newLookup: function (lookupObject) {
                return $q.when(newLookup(lookupObject));
            }
        };

        return self;

        function getLookups(lookUpItemType) {
            var deferred = $q.defer();
            var apiName = 'lookupitems/' + lookUpItemType;
            apiService.getAll(apiName).then(function (data) {
                deferred.resolve(data);
            },
            function (data) {
                deferred.reject(data);
            });
            return deferred.promise;
        }

        function newLookup(lookupObject) {
            var deferred = $q.defer();
            var apiName = 'lookupitems';
            apiService.add(apiName, lookupObject).then(function (data) {
                deferred.resolve(data);
            },
            function (data) {
                deferred.reject(data);
            });
            return deferred.promise;
        }
    }

})();