(function () {
    'use strict';

    angular
        .module('ips.portfolio')
        .factory('portfolioManager', portfolioManager)
        .service('languageService',languageService);
    portfolioManager.$inject = ['$q', 'apiService'];
    languageService.$inject=['$q','apiService'];
    function portfolioManager($q, apiService) {
        var self = {

            getAllPortfolio: function (query) {
                return $q.when(getAllPortfolio(query));
            },

            getPageById: function (id, query) {
                return $q.when(getPageById(id, query));
            },
        };

        return self;

        function getPages(query) {
            var deferred = $q.defer();
            var apiName = 'portfolio/getportfolioproject/';
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
            var apiName = 'portfoliopages/getpage';
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
            $api.getAll('portfolio/getlanguages').then(function(data){
                defer.resolve(data)
            },function(data){
                defer.reject(data);
            });
            return defer.promise;
        }
        function getLanguageBYId($id)
        {
            $api.getById('portfolio/getlanguagebyid',$id).then(function(data){
                defer.resolve(data);
            },function(data){
                defer.reject(data);
            });
            return defer.promise;
        }
    }

})();