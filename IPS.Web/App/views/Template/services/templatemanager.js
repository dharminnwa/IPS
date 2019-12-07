(function () {
    'use strict';

    angular
        .module('ips.template')
        .factory('templateManager', templateManager)
        .service('languageService',languageService);
    templateManager.$inject = ['$q', 'apiService'];
    languageService.$inject=['$q','apiService'];
    function templateManager($q, apiService) {
        var self = {

            getAllTemplates: function (id) {
                return $q.when(getTemplates(id));
            },

            getTemplateById: function (id, query) {
                return $q.when(getTemplateById(id, query));
            },
            addTemplate:function(templateData)
            {
                return $q.when(addTemplates(templateData));
            },
            updateTemplate:function(templateData)
            {
                return $q.when(updateTemplate(templateData));
            },
            uploadImages:function(imageData){
                return $q.when(uploadImages(imageData));
            },
            getAllLanguage:function(){
                return $q.when(getAllLanguage());
            },
            addImages:function(imageData){
                return $q.when(addImages(imageData))
            }
        };

        return self;
            function uploadImages(imageData)
            {
                var deferred=$q.defer();
                var apiName='Upload/UploadTemplateImages';
                apiService.add(apiName,imageData).then(function(data){
                    deferred.resolve(data);
                },function(error){
                    deferred.reject(error)
                })
                return deferred.promise;

            }
        function addImages(imageData)
        {
            var deferred=$q.defer();
            var apiName='TemplateImage/AddTemplateImage';
            apiService.add(apiName,imageData).then(function(data){
                deferred.resolve(data);
            },function(error){
                deferred.reject(error)
            })
            return deferred.promise;

        }
        function getTemplates(id) {
            var deferred = $q.defer();
            var apiName = 'Template/GetTemplateTemplateContentByCategoryID';

            apiService.getById(apiName, id).then(function (data) {
                    deferred.resolve(data);
                },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }

        function getTemplateById(id, query) {
            var deferred = $q.defer();
            var apiName = 'Template/GetTemplateTemplateContentByID';
            (!query) ? query = '' : '';
            apiService.getById(apiName, id, query).then(function (data) {
                    deferred.resolve(data);
                },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }
        function addTemplates(templateData)
        {
            var deferred=$q.defer();
            var apiName='templatecontent/AddTemplateContent';
            apiService.add(apiName,templateData).then(function(data){
                deferred.resolve(data);
            },function(error){
                deferred.reject(error)
            })
            return deferred.promise;
        }
        function updateTemplate(templateData)
        {
            var deferred=$q.defer();
            var apiName='templatecontent/UpdateTemplateContent';
            apiService.update(apiName,templateData).then(function(data){
                deferred.resolve(data);
            },function(error){
                deferred.reject(error)
            })
            return deferred.promise;
        }
        function getAllLanguage()
        {
            var defer=$q.defer();
            apiService.getAll('portfolio/getlanguages').then(function(data){
                defer.resolve(data)
            },function(data){
                defer.reject(data);
            });
            return defer.promise;
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

        }
        function getLanguageBYId($id)
        {
            $api.getById('portfolio/getlanguagesByid',$id).then(function(data){
                defer.resolve(data);
            },function(data){
                defer.reject(data);
            });
            return defer.promise;
        }
    }

})();