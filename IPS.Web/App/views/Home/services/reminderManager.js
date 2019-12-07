(function () {
    'use strict';

    angular
        .module('ips')
        .factory('reminderManager', reminderManager);

    reminderManager.$inject = ['$q', 'apiService'];

    function reminderManager($q, apiService) {
        var self = {

            getRemindersById: function (id, query) {
                return $q.when(getRemindersByUserId(id, query));
            },

            changeReminderDate: function(id, newDate, query) {
                return $q.when(changeReminderDate(id, newDate, query));
            }
        };

        return self;

        function getRemindersByUserId(id, query) {
            var deferred = $q.defer();
            var apiName = 'reminder';
            (!query) ? query = '' : '';
            apiService.getById(apiName, id, query).then(function (data) {
                deferred.resolve(data);
            },
            function (data) {
                deferred.reject(data);
            });
            return deferred.promise;
        }

        function changeReminderDate(id, newDate, query) {
            var deferred = $q.defer();
            var apiName = 'reminder/SetRemindMeDate/' + id + '/' + newDate;
            (!query) ? query = '' : '';
            apiService.update(apiName, query).then(function (data) {
                deferred.resolve(data);
            },
            function (data) {
                deferred.reject(data);
            });

            return deferred.promise;
        }

    }

})();