
'use strict';

angular
    .module('ips.portfolio',['ips.portfolio.catgeory','fileUpload'])

    .config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
        $stateProvider
            .state('home.portfolio.list', {
                url: "/list/:categoryId",
                templateUrl: "views/portfolio/portfolio.html",
                controller: "portfolioCtrl",
                resolve: {
                    pageName: function ($translate) {
                        return $translate.instant('PORTFOLIO_PORTFOLIO');
                    }
                },
                data: {
                    displayName: '{{pageName}}',//'Portfolio',
                    paneLimit: 1,
                    depth: 2
                }
            })
            .state('home.portfolio.add', {
                url: "/add/:categoryId",
                templateUrl: "views/portfolio/Add.html",
                controller: "portfolioCtrl",
                resolve: {
                    pageName: function ($translate) {
                        return $translate.instant('PORTFOLIO_PORTFOLIO_ADD');
                    }
                },
                data: {
                    displayName: '{{pageName}}',//'PORTFOLIO / ADD',
                    paneLimit: 1,
                    depth: 2
                }
            })
            .state('home.portfolio.edit', {
                url: "/edit/:categoryId/:portfolioId",
                templateUrl: "views/portfolio/Add.html",
                controller: "portfolioCtrl",
                resolve: {
                    pageName: function ($translate) {
                        return $translate.instant('PORTFOLIO_PORTFOLIO_EDIT');
                    }
                },
                data: {
                    displayName: '{{pageName}}',//'PORTFOLIO / Edit',
                    paneLimit: 1,
                    depth: 2
                }
        });
    }])
    .service("portfolioServices",['$q','apiService','portfolioManager',function($q,apiService,portfolioManager){


            return  {
                getAllPortfolio:function(id)
                {
                    var deferred = $q.defer();
                    apiService.getById('Portfolio/GetPortfolioProjectByCategoryID/',id).then(function(data){
                        deferred.resolve(data);
                    })
                    return deferred.promise;
                },
                getPortfolioById:function(id){
                    var deferred = $q.defer();
                    apiService.getById('Portfolio/GetPortfolioProjectByID',id).then(function(data){
                        deferred.resolve(data);
                    })
                    return deferred.promise;
                },
                addPortfolio:function(addData){
                    var deferred = $q.defer();
                    apiService.add('PortfolioProject/AddPortfolioProject',addData).then(function(data){
                        deferred.resolve(data);
                    })
                    return deferred.promise;
                },
                updatePortfolio:function(updateData){
                    var deferred = $q.defer();
                    apiService.update('PortfolioProject/UpdatePortfolioProject',updateData).then(function(data){
                        deferred.resolve(data);
                    })
                    return deferred.promise;
                },
                getLanguages:function()
                {
                    var deferred = $q.defer();
                    apiService.getAll('portfolio/getlanguages','').then(function(data){
                        deferred.resolve(data);
                    })
                    return deferred.promise;
                },
                addImages:function(imageData){
                    var defer=$q.defer();
                    apiService.add('PortfolioImage/AddportfolioImage'.imageData).then(function(data){
                        defer.resolve(data);
                    })
                    return defer.promise;
                }
            }



    }])
    .controller("portfolioCtrl",['$scope','$rootScope','$location','$stateParams','cssInjector','apiService','portfolioServices','languageService',function($scope,$rootScope,$location,$stateParams,$cssInjector,$apiService,$portfolioService,$language){
        $cssInjector.removeAll();
        CKEDITOR.config.allowedContent = true;
        CKEDITOR.extraAllowedContent = '*(*)';
        $scope.editorOptions = {language: 'en',
            uiColor: 'white',
            skin:'bootstrapck',
            allowedContent : true,
            extraAllowedContent : '*(*)',
            sharedSpaces:{
                top:"cke_editor_2",
                bottom:"cke_editor_2"
            },
            height: 65
        };
        $scope.categoryId=$stateParams.categoryId;
        $scope.getPortfolios=function() {
            $portfolioService.getAllPortfolio($scope.categoryId).then(function (data) {
                $scope.portfolios= data;
            })
        }
        $scope.portfolioId=$stateParams.portfolioId;
        $scope.getPortfolio=getPortfolio;
        function getPortfolio() {
          $portfolioService.getPortfolioById($scope.portfolioId).then(function (data) {
               $scope.portfolio=data;
            })
        }
        $scope.addPortfolio=addPortfolio;
        $scope.updatePortfolio=updatePortfolio;
        $scope.getLanguages=getLanguages;
        function addPortfolio()
        {
            $scope.portfolio.portfolioCategoryID=$scope.categoryId;
            $portfolioService.addPortfolio($scope.portfolio).then(function(data){
                if($scope.portfolioImages)
                {
                    $scope.portfolioContentImages=[];
                    angular.forEach($scope.portfolioImages,function(val,key){
                        $scope.portfolioContentImages.push({
                            ProtfolioProjectImageID:'',
                            PortfolioProjectID:data,
                            ImagePath:'http://ips.omsoftware.co/ipsapi/uploads/portfolioimage/'+val.status.response.replace('"','').replace('"',''),
                            DisplayOnTop:($scope.portfolioContentImages.length==0)?true:false
                        });
                    })
                $portfolioService.addImages($scope.portfolioContentImages).then(function(data){

                })
                }
                location.href="#/home/portfolio/list/"+$scope.categoryId;
            })
        }
        function updatePortfolio()
        {

            $portfolioService.updatePortfolio($scope.portfolio).then(function(data){
                if($scope.portfolioImages)
                {
                    $scope.portfolioContentImages=[];
                    angular.forEach($scope.portfolioImages,function(val,key){
                        $scope.portfolioContentImages.push({
                            ProtfolioProjectImageID:'',
                            PortfolioProjectID:data,
                            ImagePath:'http://ips.omsoftware.co/ipsapi/upload/templateimage/'+val.status.response.replace('"','').replace('"',''),
                            DisplayOnTop:($scope.portfolioContentImages.length==0)?true:false
                        });
                    })
                    $portfolioService.addImages($scope.portfolioContentImages).then(function(data){

                    })

                }
                location.href="#/home/portfolio/list/"+$scope.categoryId;

            })
        }
        function getLanguages()
        {
            $portfolioService.getLanguages().then(function(data){
                $scope.languages=data;
            })
        }
    }])