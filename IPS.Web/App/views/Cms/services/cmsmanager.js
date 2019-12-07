(function () {
    'use strict';

    angular
        .module('ips.cms')
        .factory('cmsManager', cmsManager)
        .service('languageCMSService',languageService);
    cmsManager.$inject = ['$q', 'apiService'];
    languageService.$inject=['$q','apiService'];
    function cmsManager($q, apiService) {
        var self = {

            getPages: function (query) {
                return $q.when(getPages(query));
            },

            getPageById: function (id, query) {
                return $q.when(getPageById(id, query));
            },
        };

        return self;

        function getPages(query) {
            var deferred = $q.defer();
            var apiName = 'cmspages/getpages/all';
            (!query) ? query = '' : '';
            apiService.getAll(apiName, query).then(function (data) {
                    deferred.resolve(data);
                },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }

        function getPageById(id, query) {
            var deferred = $q.defer();
            var apiName = 'cmspages/getpage';
            (!query) ? query = '' : '';
            apiService.getById(apiName, id, query).then(function (data) {
                    deferred.resolve(data);
                },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }
    }
    function languageService($q,$api)
    {
        var defer=$q.defer();
        var self={
            getAllLanguage:function(){

                return $q.when(getAllLanguage());
            },
            getLanguageById:function($id){
                return $q.when(getLanguageById($id));
            }
        }
        return self;
        function getAllLanguage()
        {
            console.log("aa");
            $api.getAll('cmspages/getlanguages').then(function(data){
                defer.resolve(data)
            },function(data){
                defer.reject(data);
            });
            return defer.promise;
        }
        function getLanguageBYId($id)
        {
            $api.getById('cmspages/getlanguagebyid',$id).then(function(data){
                defer.resolve(data);
            },function(data){
                defer.reject(data);
            });
            return defer.promise;
        }
    }

})();