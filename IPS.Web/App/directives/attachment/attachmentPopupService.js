(function () {
    'use strict';

    angular
        .module('ips')
        .factory('attachmentService', attachmentService);

    attachmentService.$inject = ['$q', 'apiService'];

    function attachmentService($q, apiService) {
        var self = {
            GetUsersList: function () {
                return $q.when(GetUsersList());
            },
            Save: function (ipsAttachment) {
                return $q.when(save(ipsAttachment));
            }
        };

        return self;

        function GetUsersList() {
            var deferred = $q.defer();
            var apiName = 'User/GetUsersList';
            apiService.getAll(apiName).then(function (data) {
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }

        function save(ipsAttachment) {
            var deferred = $q.defer();
            var apiName = 'attachment/save';
            apiService.add(apiName, ipsAttachment).then(function (data) {
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }

    }

})();