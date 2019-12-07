(function () {
    'use strict';

    angular
        .module('ips.profiles')
        .factory('profileLevelService', profileLevelService);

    profileLevelService.$inject = ['$q', 'apiService'];

    function profileLevelService($q, apiService) {
        var self = {
            getProfileLevels: function (query) {
                return $q.when(getProfileLevels(query));
            },
            newProfileLevel: function (profileLevelObject) {
                return $q.when(newProfileLevel(profileLevelObject));
            }
        };

        return self;

        function getProfileLevels(query) {
            var deferred = $q.defer();
            (query) ? '' : query = '';
            var apiName = 'profile_levels';
            apiService.getAll(apiName, query).then(function (data) {
                deferred.resolve(data);
            },
            function (data) {
                deferred.reject(data);
            });
            return deferred.promise;
        }

        function newProfileLevel(profileLevelObject) {
            var deferred = $q.defer();
            var apiName = 'profile_levels';
            apiService.add(apiName, profileLevelObject).then(function (data) {
                deferred.resolve(data);
            },
            function (data) {
                deferred.reject(data);
            });
            return deferred.promise;
        }
    }

})();