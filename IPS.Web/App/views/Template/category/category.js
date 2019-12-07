
'use strict';
angular.module('ips.template')
    .config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
        $stateProvider
            .state('home.template.category', {
                url: "/category/list",
                templateUrl: "views/Template/category/category.html",
                controller: "templatecatgeoryCtrl",
                resolve: {
                    pageName: function ($translate) {
                        return $translate.instant('COMMON_CATEGORY');
                    }
                },
                data: {
                    displayName: '{{pageName}}',//'Catgeory',
                    paneLimit: 1,
                    depth: 2
                }
            }).state('home.template.subcategory', {
                url: "/category/list/:categoryId",
                templateUrl: "views/Template/category/category.html",
                controller: "templatecatgeoryCtrl",
                resolve: {
                    pageName: function ($translate) {
                        return $translate.instant('TEMPLATE_SUB_CATGEORY');
                    }
                },
                data: {
                    displayName: '{{pageName}}',//'Sub Catgeory',
                    paneLimit: 1,
                    depth: 2
                }
            })
            .state('home.template.catgeoryadd', {
                url: "/category/add",
                templateUrl: "views/template/category/add.html",
                controller: "templatecatgeoryCtrl",
                resolve: {
                    pageName: function ($translate) {
                        return $translate.instant('TEMPLATE_CATGEORY_ADD');
                    }
                },
                data: {
                    displayName: '{{pageName}}',//'Catgeory / ADD',
                    paneLimit: 1,
                    depth: 2
                }
            }).state('home.template.catgeoryadd.sub', {
                url: "/sub",
                templateUrl: "views/template/category/add.html",
                controller: "templatecatgeoryCtrl",
                resolve: {
                    pageName: function ($translate) {
                        return $translate.instant('TEMPLATE_SUB');
                    }
                },
                data: {
                    displayName: '{{pageName}}',//'Sub',
                    paneLimit: 1,
                    depth: 3

                }
            })
            .state('home.template.categoryedit', {
            url: "/category/:categoryId",
            templateUrl: "views/template/category/add.html",
            controller: "templatecatgeoryCtrl",
                resolve: {
                    pageName: function ($translate) {
                        return $translate.instant('TEMPLATE_CATGEORY_EDIT');
                    }
                },
            data: {
                displayName: '{{pageName}}',//'Catgeory / Edit',
                paneLimit: 1,
                depth: 2
            }
        })
            .state('home.template.categoryedit.sub', {
            url: "/sub",
            templateUrl: "views/template/category/add.html",
            controller: "templatecatgeoryCtrl",
                resolve: {
                    pageName: function ($translate) {
                        return $translate.instant('TEMPLATE_CATGEORY_EDIT');
                    }
                },
            data: {
                displayName: '{{pageName}}',//'Catgeory / Edit',
                paneLimit: 1,
                depth: 2
            }
        });

    }])

.directive("categoryHref",function(){
    return {
        restrict:'A',
        scope:{
            link:'=categoryHref'
        },

        link:function(scope,element){
            element.css('cursor',"pointer");

            element.on("mouseover",function(){
                element.addClass('k-state-selected');

            })
            element.on('mouseout',function(){
                element.removeClass('k-state-selected')
            })
            element.on('click',function(){
                console.log(scope);
                if(scope.link.isParentCategory){
                    location.href="#/home/template/category/list/"+scope.link.templateCategoryID;
                }else{
                    location.href='#/home/template/list/'+scope.link.templateCategoryID;
                }

            })
        }
    }

})
    .service("categoryServices",['$q','apiService',function($q,apiService){
       return {
           getAllCategories:function()
           {
               var defer=$q.defer();
               apiService.getAll('Template/GetTemplateCategory','').then(function(data){
                   defer.resolve(data)
               })
               return defer.promise;
           },
           getCategory:function(id){
               var defer=$q.defer();
               apiService.getById('Template/GetTemplateCategoryByID',id).then(function(data){
                   defer.resolve(data);
               })
               return defer.promise;
           },
           addCategory:function(categoryData){
               var defer=$q.defer();
               apiService.add('Template/AddTemplateCategory',categoryData).then(function(data){
                   defer.resolve(data)
               })
               return defer.promise;

           },
           updateCategory:function(updateData)
           {
               var defer=$q.defer();
               apiService.update('Template/UpdateTemplateCategory',updateData).then(function(data){

                   defer.resolve(data);
               })
               return defer.promise;
           },
           getLanguages:function(){
               var defer=$q.defer();
               apiService.getAll('portfolio/getlanguages','').then(function(data){
                   defer.resolve(data);
               })
               return defer.promise;
           }
       }

    }])


    .controller("templatecatgeoryCtrl",['$scope','$rootScope','$location','$stateParams','cssInjector','apiService','categoryServices',function($scope,$rootScope,$location,$stateParams,$cssInjector,$apiService,$categoryService){
        $cssInjector.removeAll();
        $scope.getAllCategories=getAllCategories;
        $scope.categoryId=$stateParams.categoryId;
        var absUrl=$location.absUrl().split("/");
        $scope.isSub=(absUrl[absUrl.length-1]=="sub")?true:false;


        console.log($scope);
        $scope.getCategory=getCategory;
        $scope.addCategory=addCatgeory;
        $scope.updateCategory=updateCatgeory;
        $scope.getLanguages=getLanguages;
        function getAllCategories()
        {
            $categoryService.getAllCategories().then(function(data){
                $scope.categories=[];
                angular.forEach(data,function(val,key){
                    if(val.isParentCategory==true){
                        if($scope.categories.indexOf(val)==-1){
                        $scope.categories.push(val);
                        }
                    }
                })
                if($scope.categoryId)
                {
                    $scope.subCategories=[];
                    angular.forEach(data,function(val,key){
                        if(val.parentCategoryID==$scope.categoryId){
                            if($scope.subCategories.indexOf(val)==-1)
                            {
                                $scope.subCategories.push(val);
                            }
                        }
                    })
                }
            })
        }
        function getCategory(){
            $categoryService.getCategory($scope.categoryId).then(function(data){
                $scope.category=data;
            })
        }
        function addCatgeory(){
            $scope.category.isParentCategory=($scope.isSub)?false:true;
            console.log($scope.category);
            $categoryService.addCategory($scope.category).then(function(data){
                if(data)
                {
                    location.href="#/home/template/category/list"
                }
            })
        }
        function updateCatgeory()
        {
            $scope.category.isParentCategory=($scope.isSub)?false:true;
            $categoryService.updateCategory($scope.category).then(function(data){
                if(data)
                {
                    location.href="#/home/template/category/list"
                }
            })
        }
        function getLanguages()
        {
            $categoryService.getLanguages().then(function(data){
                $scope.languages=data;
            })
        }
    }])