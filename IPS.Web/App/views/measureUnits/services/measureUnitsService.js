(function () {
    'use strict';

    angular
        .module('ips.measureUnits')
        .factory('measureUnitsService', measureUnitsService);

    measureUnitsService.$inject = ['apiService', '$q'];

    function measureUnitsService(apiService, $q) {
        var self = {

            get: function (query) {
                return $q.when(get(query));
            },

            add: function (measureUnit) {
                return $q.when(add(measureUnit));
            },

            update: function (measureUnit) {
                return $q.when(update(measureUnit))
            },

            remove: function (id) {
                return $q.when(remove(id))
            },
        };

        return self;

        function get(query) {
            var deferred = $q.defer();
            var apiName = 'measureUnit';
            (!query) ? query = '' : '';
            apiService.getAll(apiName, query).then(function (data) {
                deferred.resolve(data);
            },
            function (data) {
                deferred.reject(data);
            });
            return deferred.promise;
        }

        function add(measureUnit) {
            var deferred = $q.defer();
            var apiName = 'measureUnit';
            apiService.add(apiName, measureUnit).then(function (data) {
                deferred.resolve(data);
            },
            function (data) {
                deferred.reject(data);
            });
            return deferred.promise;
        }

        function update(measureUnit) {
            var deferred = $q.defer();
            var apiName = 'measureUnit';
            apiService.update(apiName, measureUnit).then(function (data) {
                deferred.resolve(data);
            },
            function (data) {
                deferred.reject(data);
            });
            return deferred.promise;
        }

        function remove(id) {
            var deferred = $q.defer();
            var apiName = 'measureUnit';
            apiService.remove(apiName, id).then(function (data) {
                deferred.resolve(data);
            },
            function (data) {
                deferred.reject(data);
            });
            return deferred.promise;
        }
    }

})();