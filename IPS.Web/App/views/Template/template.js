
'use strict';

angular
    .module('ips.template',['fileUpload'])

    .config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
        $stateProvider
            .state('home.template.pages', {
                url: "/list/:categoryId",
                templateUrl: "views/Template/template.html",
                controller: "templateCtrl",
                resolve: {
                    pageName: function ($translate) {
                        return $translate.instant('TEMPLATE_TEMPLATE');
                    }
                },
                data: {
                    displayName: '{{pageName}}',//'Template',
                    paneLimit: 1,
                    depth: 2
                }
            })
            .state('home.template.add', {
                url: "/add/:categoryId",
                templateUrl: "views/template/templateAdd.html",
                controller: "templateCtrl",
                resolve: {
                    pageName: function ($translate) {
                        return $translate.instant('TEMPLATE_TEMPLATE_ADD');
                    }
                },
                data: {
                    displayName: '{{pageName}}',//'TEMPLATE / ADD',
                    paneLimit: 1,
                    depth: 2
                }
            }).state('home.template.edit', {
            url: "/edit/:categoryId/:templateId",
            templateUrl: "views/template/templateAdd.html",
            controller: "templateCtrl",
                resolve: {
                    pageName: function ($translate) {
                        return $translate.instant('TEMPLATE_TEMPLATE_EDIT');
                    }
                },
            data: {
                displayName: '{{pageName}}',//'TEMPLATE / Edit',
                paneLimit: 1,
                depth: 2
            }
        });

    }]).
filter('limit',function() {
    return function (data) {

        if(data){
        return data.split(" ").slice(0, 10).join(" ") + ' ....';
        }
    }
})
    .directive('ngFileModel', ['$parse', function ($parse) {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            var model = $parse(attrs.ngFileModel);
            var isMultiple = attrs.multiple;
            var modelSetter = model.assign;
            element.bind('change', function () {
                var values = [];
                angular.forEach(element[0].files, function (item) {
                    var value = {
                        // File Name
                        name: item.name,
                        //File Size
                        size: item.size,
                        //File URL to view
                        url: URL.createObjectURL(item),
                        // File Input Value
                        _file: item
                    };
                    values.push(value);
                });
                scope.$apply(function () {
                    if (isMultiple) {
                        modelSetter(scope, values);
                    } else {
                        modelSetter(scope, values[0]);
                    }
                });
            });
        }
    };
}])
    .service("templateServices",['$q','apiService','templateManager',function($q,apiService,templateManager){
       return {
           getAllTemplates:function(id){
               return templateManager.getAllTemplates(id).then(function(data){
                   return data;
               })
           },
           getTemplate:function(id){
               return templateManager.getTemplateById(id).then(function(data){
                   return data;
               })
           },
           addTemplate:function(templateData){
               return templateManager.addTemplate(templateData).then(function(data){
                   return data;
               })
           },
           updateTemplate:function(templateData){
               return templateManager.updateTemplate(templateData).then(function(data){
                   return data;
               })
           },
           uploadImages:function(ImageData)
           {
               return templateManager.uploadImages(ImageData).then(function(data){
                   return data;
               })
           },
           getLanguages:function(){

               return templateManager.getAllLanguage().then(function(data){
                   return data;
               })
           },
           addImages:function($templateImages){
               return templateManager.addImages($templateImages).then(function(data){

               })
           }
       }

    }])
    .controller("templateCtrl",['$scope','$rootScope','$location','$stateParams','cssInjector','apiService','templateServices','languageService','$http',function($scope,$rootScope,$location,$stateParams,$cssInjector,$apiService,$templateService,$language,$http){

        $scope.categoryId=$stateParams.categoryId;
        $scope.templateId=$stateParams.templateId;

        $scope.template={};
        $scope.template.templateCategoryID=$scope.categoryId;
        $scope.getAllTemplates=getAllTemplates;
        $scope.getTemplate=getTemplate;
        $scope.addTemplate=addTemplate;
        $scope.updateTemplate=updateTemplate;
        $scope.getLanguages=getLanguages;
        function getAllTemplates()
        {
            $templateService.getAllTemplates($scope.categoryId).then(function(data){
                $scope.templates=data;
            })
        }
        function getTemplate(){
            $templateService.getTemplate($scope.templateId).then(function(data){
                $scope.template=data;
            })
        }
        function addTemplate(){


            console.log($scope);

                $templateService.addTemplate($scope.template).then(function(data){

                        if($scope.templateContentImages){
                        $scope.templateImage={};
                        $scope.templateImage.templateContentImages=[];
                        angular.forEach($scope.templateContentImages,function(val,key){
                            $scope.templateImage.templateContentImages.push({
                                TemplateImageID:'',
                                TemplateContentID:data,
                                ImagePath:'http://ips.omsoftware.co/ipsapi/upload/templateimage/'+val.status.response.replace('"','').replace('"',''),
                                IsPrimaryImage:($scope.templateImage.templateContentImages.length==0)?true:false
                            });
                        })
                            $templateService.addImages($scope.templateImage).then(function (data){

                            })
                    }
                    location.href="#/home/template/list/"+$scope.categoryId;



                })



        }
        function updateTemplate()
        {


            console.log($scope);
                $templateService.updateTemplate($scope.template).then(function (data) {
                    if($scope.templateContentImages){
                        $scope.templateImage={};
                        $scope.templateImage.templateContentImages=[];
                        angular.forEach($scope.templateContentImages,function(val,key){
                            $scope.templateImage.templateContentImages.push({
                                TemplateImageID:'',
                                TemplateContentID:data,
                                ImagePath:'http://ips.omsoftware.co/ipsapi/upload/templateimage/'+val.status.response.replace('"','').replace('"',''),
                                IsPrimaryImage:($scope.templateImage.templateContentImages.length==0)?true:false
                            });
                        })
                        $templateService.addImages($scope.templateImage).then(function (data){

                        })
                    }
                        location.href = "#/home/template/list/" + $scope.categoryId

                })

        }
        function getLanguages()
        {

            $templateService.getLanguages().then(function(data){
                $scope.languages=data;
                console.log($scope.languages);
            })
        }
    }])


