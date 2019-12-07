(function () {
    'use strict';

    angular
        .module('ips')
        .factory('todoManager', todoManager);

    todoManager.$inject = ['$q', 'apiService'];

    function todoManager($q, apiService) {

        var self = {
            getTodosById: function () {
                return $q.when(getTodosById());
            },
            getTodosByUserId : function(userId){
                return $q.when(getTodosByUserId(userId));
            },
            getTodosByUserIds : function(userIds){
                return $q.when(getTodosByUserIds(userIds));
            },
            isCompleted: function (taskId, isCompleted) {
                return $q.when(isTaskCompleted(taskId, isCompleted));
            },
            getTaskScaleRatingByUserId: function (userId) {
                return $q.when(getTaskScaleRatingByUserId(userId));
            }

        };

        return self;

        function getTodosById(query) {
            var deferred = $q.defer();
            var apiName = 'tasks/user?$expand=TaskCategoryListItem,Training';
            (!query) ? query = '' : '';
            apiService.getAll(apiName, query).then(function (data) {
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }
        function getTodosByUserId(userId) {
            var deferred = $q.defer();
            var apiName = 'tasks/GetTasksByUserId/' + userId;
            apiService.getAll(apiName, null).then(function (data) {
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }

        function getTodosByUserIds(userIds) {
            var deferred = $q.defer();
            var apiName = 'tasks/GetTasksByUserIds';
            apiService.add(apiName, userIds).then(function (data) {
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }



        function isTaskCompleted(taskId, isCompleted) {
            var deferred = $q.defer();
            var apiName = "tasks/" + taskId + "/IsCompleted/" + isCompleted;
            apiService.update(apiName).then(function (data) {
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }
        function getTaskScaleRatingByUserId(userId) {
            var deferred = $q.defer();
            apiService.getAll("TaskScaleRatings/" + userId + "?$expand=TaskScaleRanges").then(function (data) {
                deferred.resolve(data.taskScaleRanges);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        };
    }

})();