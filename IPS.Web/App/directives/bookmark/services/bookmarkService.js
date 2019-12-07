(function () {
    'use strict';

    angular
        .module('ips')
        .factory('bookmarkService', bookmarkService);

    bookmarkService.$inject = ['$q', 'apiService'];

    function bookmarkService($q, apiService) {
        var self = {
            getBookmarks: function (query) {
                return $q.when(getBookmarks(query));
            },

            getBookmarkById: function (id, query) {
                return $q.when(getBookmarkById(id, query));
            },

            newBookmark: function (bookmark) {
                return $q.when(newBookmark(bookmark));
            },

            updateBookmark: function (bookmark) {
                return $q.when(updateBookmark(bookmark));
            },

            removeBookmark: function (id){
                return $q.when(removeBookmark(id));
        }
        };

        return self;

        function getBookmarks(query) {
            var deferred = $q.defer();
            var apiName = 'bookmarks';
            (!query) ? query = '' : '';
            apiService.getAll(apiName, query).then(function (data) {
                deferred.resolve(data);
            },
            function (data) {
                deferred.reject(data);
            });
            return deferred.promise;
        }

        function getBookmarkById(id, query) {
            var deferred = $q.defer();
            var apiName = 'bookmarks';
            (!query) ? query = '' : '';
            apiService.getById(apiName, id, query).then(function (data) {
                deferred.resolve(data);
            },
            function (data) {
                deferred.reject(data);
            });
            return deferred.promise;
        }

        function updateBookmark(bookmark) {
            var deferred = $q.defer();
            var apiName = 'bookmarks';
            apiService.update(apiName, bookmark).then(function (data) {
                deferred.resolve(data);
            },
            function (data) {
                deferred.reject(data);
            });
            return deferred.promise;
        }

        function newBookmark(bookmark) {
            var deferred = $q.defer();
            var apiName = 'bookmarks';
            apiService.add(apiName, bookmark).then(function (data) {
                deferred.resolve(data);
            },
            function (data) {
                deferred.reject(data);
            });
            return deferred.promise;
        }

        function removeBookmark(id) {
            var deferred = $q.defer();
            var apiName = 'bookmarks';
            apiService.remove(apiName, id).then(function (data) {
                deferred.resolve(data);
            },
            function (data) {
                deferred.reject(data);
            });
            return deferred.promise;
        }
    }

})();