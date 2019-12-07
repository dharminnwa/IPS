(function () {
    'use strict';

    angular
        .module('ips')
        .factory('projectPhaseService', projectPhaseService);

    projectPhaseService.$inject = ['$q', 'apiService'];

    function projectPhaseService($q, apiService) {
        var self = {
            isphaseactive: function (query) {
                return $q.when(getBookmarks(query));
            }
        };

        return self;

        function isphaseactive(query) {
            var deferred = $q.defer();
            var apiName = 'projectPhases';
            (!query) ? query = '' : '';
            apiService.getAll(apiName, query).then(function (data) {
                deferred.resolve(data);
            },
            function (data) {
                deferred.reject(data);
            });
            return deferred.promise;
        }
    }

})();