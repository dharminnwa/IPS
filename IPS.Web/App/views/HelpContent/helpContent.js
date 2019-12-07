
'use strict';

angular
    .module('ips.helpcontent',[])
    .factory('contentManager',['$q','apiService',function ($q, apiService) {
        var self = {

            getcontents: function (query) {
                return $q.when(getContents(query));
            },

            getcontentById: function (id, query) {
                return $q.when(getContentById(id, query));
            },
        };

        return self;

        function getContents(query) {
            var deferred = $q.defer();
            var apiName = 'helpcontent/gethelpcontent';
            (!query) ? query = '' : '';
            apiService.getAll(apiName, query).then(function (data) {
                    deferred.resolve(data);
                },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }

        function getContentById(id,query) {
            var deferred = $q.defer();
            var apiName = 'helpcontent/GetHelpContentByID';
            (!query) ? query = '' : '';
            apiService.getById(apiName, id, query).then(function (data) {
                    deferred.resolve(data);
                },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }
    }])
    .config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
        $stateProvider
            .state('home.helpcontent.list', {
                url: "/list",
                templateUrl: "views/helpcontent/helpContentList.html",
                controller: "contentCtrl",
                resolve: {
                    pageName: function ($translate) {
                        return $translate.instant('TEMPLATE_CONTENT');
                    }
                },
                data: {
                    displayName: '{{pageName}}',//'contents',
                    paneLimit: 1,
                    depth: 2
                }
            })
            .state('home.helpcontent.add', {
                url: "/add",
                templateUrl: "views/helpcontent/helpContentAdd.html",
                controller: "contentCtrl",
                resolve: {
                    pageName: function ($translate) {
                        return $translate.instant('COMMON_ADD');
                    }
                },
                data: {
                    displayName: '{{pageName}}',//'ADD',
                    paneLimit: 1,
                    depth: 2
                }
            }).state('home.helpcontent.edit', {
            url: "/:contentId",
            templateUrl: "views/helpcontent/helpContentAdd.html",
            controller: "contentCtrl",
                resolve: {
                    pageName: function ($translate) {
                        return $translate.instant('COMMON_EDIT');
                    }
                },
            data: {
                displayName: '{{pageName}}',//'Edit',
                paneLimit: 1,
                depth: 2
            }
        });

    }])
    .service("contentServices",['$q','apiService','contentManager',function($q,apiService,contentManager){

        var deferred = $q.defer();

        var contents=null;
        this.addcontent=function($apiName,$addData){
            return apiService.add($apiName,$addData).then(function(data){
                return data;
            })}
        this.updatecontent=function($apiName,$updateData){
            return apiService.update($apiName,$updateData).then(function(data){
                return data;
            })}
        this.deletecontent=function($apiName,$deleteId){
            return contentManager.deletecontent($apiName,$deleteId).then(function(data){
                return data;
            })}
        this.listAllcontents=function($query){
            return contentManager.getcontents($query).then(function(data){
                contents=data;
                return contents;

            });

        }
        this.getAllCategories=function($api){
            return apiService.getAll($api).then(function(data){
                contents=data;
                return contents;
            })
        }
        this.getAccessByCode=function($apiName,$accessCode,$languageid){
            $query='$accesscode='+$accesscode+'$languageId='+$languageId+'';
            apiService.getAll($apiName,$query).then(function(data){
                deferred.resolve(data);

            });
            return deferred.promise;
        }
        this.getById=function($id,$query){
            $query=($query)?"$contentID="+$query:'';
            return contentManager.getcontentById($id,$query).then(function(data){
                contents=data;
                return contents;
            });

        }
        this.getData=function()
        {
            return contents;
        }

    }])
    .controller("contentCtrl",['$scope','$rootScope','$location','$stateParams','cssInjector','apiService','contentServices','languageService',function($scope,$rootScope,$location,$stateParams,$cssInjector,$apiService,$contentService,$language){
        $cssInjector.removeAll();
        $cssInjector.add("views/helpcontent/helpContent.css");
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
            }
        };
        var response=null;
        var status=null;
        $scope.contentData=null;
console.log($stateParams);
        $scope.deletecontentId=null;
        $scope.contents=null;
        $scope.contentId=($stateParams.contentId)?$stateParams.contentId:null;
        $scope.accessCode=null;
        $scope.languageId=null;
        function addcontent()
        {
            if($scope.contentData!=null){
                response=$contentService.addcontent('helpcontent/addhelpcontent',$scope.contentData);
                (verifyResponse(response)=='success')?location.href="#/home/content/list":'';
            }
        }
        function removecontent() {
            if($scope.deletecontentId!=null)
            {
                response=$contentService.deletecontent('helpcontent/addhelpcontent',$scope.deletecontentId);
                verifyResponse(response);
            }
        }
        function getAllcontents() {

            response=$contentService.listAllcontents().then(function(data){
                verifyResponse(data)=='success'?$scope.contents=data:'';
                console.log($scope.contents);
            });

        }
        function updatecontent(){
            if($scope.contentData!=null){
                response=$contentService.updatecontent('helpcontent/updatehelpcontent',$scope.contentData);
                (verifyResponse(response)=='success')?location.href="#/home/content/list":'';
            }
        }

        function getById()
        {
            console.log($scope.contentId);
            if($scope.contentId!=null)
            {

                response=$contentService.getById($scope.contentId).then(function(data){
                    verifyResponse(data)=='success'?$scope.contentData=data:'';
                    console.log($scope.contentData);
                });

            }
        }
        function getByAccessCode()
        {
            if($scope.accessCode!=null && $scope.languageId!=null)
            {
                response=$contentService.getByAccessCode('contentcontents/GetByAccessCode',$scope.accessCode,$scope.languageId).then(function(data){;
                    (verifyResponse(data)=='success')?this.contentData=data:'';});
            }
        }
        function getcategories()
        {
            $contentService.getAllCategories('helpcategory/gethelpcategory').then(function(data){
                verifyResponse(data)?$scope.categories=data:'';
            })
        }
        function verifyResponse(response)
        {
            status=(response)?{status:'success',message:"Saved Successfully"}:{status:'warn',message:response};
            //$scope.showNotificationSavedSuccess.show(status.message,status.status);
            return status.status;
        }
        function setResponse()
        {
            return $contentService.getData();
        }
        function transferEdit(contentid)
        {
            console.log("#/home/content/"+contentid);
            location.href="#/home/content/"+contentid;
        }
        function getLanguages()
        {
            $language.getAllLanguage().then(function(data){
                console.log(data);
                $scope.languages=data;
            })
        }
        $scope.getscopes=function()
        {
            console.log($scope);
        }
        $scope.transferEdit=transferEdit;
        $scope.addcontent=addcontent;
        $scope.removecontent=removecontent;
        $scope.getAllcontents=getAllcontents;
        $scope.updatecontent=updatecontent;
        $scope.getAccessByCode=getByAccessCode;
        $scope.editcontent=getById;
        $scope.getcategories=getcategories;
        $scope.getLanguages=getLanguages;
    }])


