(function () {
    'use strict';

    angular
        .module('ips.profiles')
        .factory('profileCategoryService', profileCategoryService);

    profileCategoryService.$inject = ['$q', 'apiService'];

    function profileCategoryService($q, apiService) {
        var self = {
            getProfileCategories: function (query) {
                return $q.when(getProfileCategories(query));
            },
            newProfileCategory: function (profileCategoryObject) {
                return $q.when(newProfileCategory(profileCategoryObject));
            }
        };

        return self;

        function getProfileCategories(query) {
            var deferred = $q.defer();
            (query) ? '' : query = '';
            var apiName = 'profilecategory';
            apiService.getAll(apiName, query).then(function (data) {
                deferred.resolve(data);
            },
            function (data) {
                deferred.reject(data);
            });
            return deferred.promise;
        }

        function newProfileCategory(profileCategoryObject) {
            var deferred = $q.defer();
            var apiName = 'profilecategory';
            apiService.add(apiName, profileCategoryObject).then(function (data) {
                deferred.resolve(data);
            },
            function (data) {
                deferred.reject(data);
            });
            return deferred.promise;
        }
    }

})();