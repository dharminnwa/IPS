(function () {
    'use strict';

    angular.module('ips.attachments', ['ui.router', 'kendo.directives', 'growing-panes'])
        .factory('ipsAttachmentsManager', ipsAttachmentsManager);

    ipsAttachmentsManager.$inject = ['$q', 'apiService'];
    function ipsAttachmentsManager($q, apiService) {
        var self = {
            getUserAttachments: function () {
                return $q.when(getUserAttachments());
            },
            getAttachmentById: function (id) {
                return $q.when(getAttachmentById(id));
            }
        }
        return self;
        function getUserAttachments() {
            var deferred = $q.defer();
            var apiName = 'attachment/getUserAttachments';
            apiService.getAll(apiName).then(function (data) {
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }

        function getAttachmentById(id) {
            var deferred = $q.defer();
            var apiName = 'attachment/getAttachmentById';
            apiService.getById(apiName,id,"").then(function (data) {
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }

    }

})();