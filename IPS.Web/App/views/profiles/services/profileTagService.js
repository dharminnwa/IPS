(function () {
    'use strict';

    angular
        .module('ips.profiles')
        .factory('profileTagService', profileTagService);

    profileTagService.$inject = ['$q', 'apiService'];

    function profileTagService($q, apiService) {
        var self = {
            getProfileTags: function (query) {
                return $q.when(getProfileTags(query));
            },
            newProfileTag: function (profileTagObject) {
                return $q.when(newProfileTag(profileTagObject));
            }
        };

        return self;

        function getProfileTags(query) {
            var deferred = $q.defer();
            (query) ? '' : query = '';
            var apiName = 'ProfileTags';
            apiService.getAll(apiName, query).then(function (data) {
                deferred.resolve(data);
            },
            function (data) {
                deferred.reject(data);
            });
            return deferred.promise;
        }

        function newProfileTag(profileTagObject) {
            var deferred = $q.defer();
            var apiName = 'ProfileTags';
            apiService.add(apiName, profileTagObject).then(function (data) {
                deferred.resolve(data);
            },
            function (data) {
                deferred.reject(data);
            });
            return deferred.promise;
        }
    }

})();