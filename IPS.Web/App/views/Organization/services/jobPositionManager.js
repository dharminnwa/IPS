(function () {
    'use strict';

    angular
        .module('ips.user')
        .factory('jobPositionManager', jobPositionManager);

    jobPositionManager.$inject = ['$q', 'apiService'];

    function jobPositionManager($q, apiService) {
        var self = {

            getJobPositions: function (query) {
                return $q.when(getJobPositions(query));
            },

            getJobPositionById: function(id, query) {
                return $q.when(getJobPositionById(id, query));
            },

            addJobPosition: function (newJobPosition) {
                return $q.when(addJobPosition(newJobPosition));
            }
        };

        return self;

        function getJobPositions(query) {
            var deferred = $q.defer();
            var apiName = 'jobtitles';
            (!query) ? query = '' : '';
            apiService.getAll(apiName, query).then(function (data) {
                deferred.resolve(data);
            },
            function (data) {
                deferred.reject(data);
            });
            return deferred.promise;
        }

        function getJobPositionById(id, query) {
            var deferred = $q.defer();
            var apiName = 'jobtitles';
            (!query) ? query = '' : '';
            apiService.getById(apiName, id, query).then(function (data) {
                deferred.resolve(data);
            },
            function (data) {
                deferred.reject(data);
            });
            return deferred.promise;
        }

        function addJobPosition(newJobPosition) {
            var deferred = $q.defer();
            var apiName = 'jobtitles';
            apiService.add(apiName, newJobPosition).then(function (data) {
                deferred.resolve(data);
            },
            function (data) {
                deferred.reject(data);
            });
            return deferred.promise;
        }
    }

})();