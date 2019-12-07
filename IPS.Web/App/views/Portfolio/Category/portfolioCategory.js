'use strict';

angular
    .module('ips.portfolio.catgeory',['ips.portfolio.service'])

    .config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
        $stateProvider
            .state('home.portfolio.category', {
                url: "/category/list",
                templateUrl: "views/portfolio/Category/category.html",
                controller: "portfolioCategoryCtrl",
                resolve: {
                    pageName: function ($translate) {
                        return $translate.instant('PORTFOLIO_CATEGORY');
                    }
                },
                data: {
                    displayName: '{{pageName}}',//'Portfolio / Category',
                    paneLimit: 1,
                    depth: 2
                }
            })
            .state('home.portfolio.categoryadd', {
                url: "/category/add",
                templateUrl: "views/portfolio/category/Add.html",
                controller: "portfolioCategoryCtrl",
                resolve: {
                    pageName: function ($translate) {
                        return $translate.instant('PORTFOLIO_CATEGORY_ADD');
                    }
                },
                data: {
                    displayName: '{{pageName}}',//'PORTFOLIO / CATEGORY / ADD',
                    paneLimit: 1,
                    depth: 3
                }
            })

            .state('home.portfolio.categoryedit', {
                url: "/category/:categoryId",
                templateUrl: "views/portfolio/Category/Add.html",
                controller: "portfolioCategoryCtrl",
                resolve: {
                    pageName: function ($translate) {
                        return $translate.instant('PORTFOLIO_CATEGORY_EDIT');
                    }
                },
                data: {
                    displayName: '{{pageName}}',//'PORTFOLIO / CATEGORY / Edit',
                    paneLimit: 1,
                    depth: 3
                }
            });

    }])
    .service("portfoliocategoryServices",['$q','apiService','portfolioCategoryManager',function($q,apiService,$portfolioCategoryManager){

            return {
                getCategories:function(query){
                    var deferred = $q.defer();
                    $portfolioCategoryManager.getAllCategory().then(function(data){
                        deferred.resolve(data)
                    })
                    return deferred.promise;
                },
                getCategoryById:function(id){
                    var deferred = $q.defer();
                    id=id?id:'';
                    $portfolioCategoryManager.getCategory(id).then(function(data){
                        deferred.resolve(data)
                    })
                    return deferred.promise;
                },
                addCategory:function($addData){
                    var deferred = $q.defer();
                    $portfolioCategoryManager.addCategory($addData).then(function(data){
                        deferred.resolve(data);
                    })
                    return deferred.promise;
                },
                updateCategory:function($updateData){
                    var deferred = $q.defer();
                    $portfolioCategoryManager.updateCategory($updateData).then(function(data){
                        deferred.resolve(data);
                    })
                    return deferred.promise;
                },
                getLanguages:function(data)
                {
                    var deferred = $q.defer();
                    data=data?data:'';
                    $portfolioCategoryManager.getLanguages().then(function(data){
                        deferred.resolve(data);
                    })
                    return deferred.promise;
                }

            }


    }]).filter('limit',function(){
        return function(data){
            console.log(data);
            if (data)
                return data.split(" ").slice(0,10).join(" ")+' ....';
        }
}).directive('sendHref',[function(){
    return {
        restrict:'A',
            scope:{
            link:'=sendHref'
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
                 location.href='#/home/portfolio/list/'+scope.link.portfolioCategoryID;
            })
        }
    }
}])
    .controller("portfolioCategoryCtrl",['$scope','$rootScope','$location','$stateParams','cssInjector','apiService','portfoliocategoryServices','languageService',function($scope,$rootScope,$location,$stateParams,$cssInjector,$apiService,$cservice,$language){
        $cssInjector.removeAll();
        $scope.getCategories=function(){
            $cservice.getCategories().then(function(data){
            $scope.categories=data;
                console.log($scope.categories);
            })
        }

        $scope.getLanguages=function(){
            $cservice.getLanguages().then(function(ldata){
            $scope.languages=ldata;
                console.log(ldata);
            })
        }
        $scope.language=getLanguage;
        $scope.categoryId=$stateParams.categoryId?$stateParams.categoryId:null;
        $scope.getCategory=function(){
            $cservice.getCategoryById($scope.categoryId).then(function(data){

            $scope.category=data[0];
            })
        }
        console.log($stateParams)
        $scope.addCategory=addCategory;
        $scope.updateCategory=updateCategory;
        function addCategory()
        {
            $cservice.addCategory($scope.category).then(function(data){

                    location.href="#/home/portfolio/category/list";


            })
        }
        function updateCategory()
        {
            $cservice.updateCategory($scope.category).then(function(data){
               
                   location.href="#/home/portfolio/category/list";


            })
        }
        function getLanguage()
        {
          return  $cservice.getLanguageById($scope.category.languageId).then(function(data){
                return data;
            })
        }
    }])