(function () {
    'use strict';

    angular
        .module('ips.user', ['ui.router', 'kendo.directives', 'growing-panes'])
        .factory('userManager', userManager);

    userManager.$inject = ['$q', 'apiService'];

    function userManager($q, apiService) {
        var self = {
            getUsers: function (query) {
                return $q.when(getUsers(query));
            },

            getUserById: function (id, query) {
                return $q.when(getUserById(id, query));
            },

            saveUser: function (userInfo) {
                return $q.when(saveUser(userInfo));
            },

            updateUser: function (userInfo) {
                return $q.when(updateUser(userInfo));
            },

            updateUserProfileImage: function (userId, imagePath) {
                return updateUserProfileImage(userId, imagePath);
            },
            isEmailExist: function (email) {
                return isEmailExist(email);
            }
        };

        return self;

        function getUsers(query) {
            var deferred = $q.defer();
            var apiName = 'user';
            (!query) ? query = '' : '';
            apiService.getAll(apiName, query).then(function (data) {
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }

        function getUserById(id, query) {
            var deferred = $q.defer();
            var apiName = 'user';
            (!query) ? query = '' : '';
            apiService.getById(apiName, id, query).then(function (data) {
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }

        function isEmailExist(email) {
            var deferred = $q.defer();
            var apiName = 'User/IsEmailExist';
            apiService.getById(apiName, email).then(function (data) {
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }

        function saveUser(userInfo) {
            var deferred = $q.defer();
            var apiName = 'user';
            apiService.add(apiName, userInfo).then(function (data) {
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }

        function updateUser(userInfo) {
            var deferred = $q.defer();
            var apiName = 'user';
            apiService.update(apiName, userInfo).then(function (data) {
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }

        function updateUserProfileImage(userId, imagePath) {
            return apiService.ajax('User/UpdateUserProfileImage', 'post', { userId: userId, imagePath: imagePath });
        }

    }

})();