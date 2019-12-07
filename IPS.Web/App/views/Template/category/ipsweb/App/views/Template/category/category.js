angular.module('ips.template.category',[])
    .config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
        $stateProvider
            .state('home.template.catgeory.pages', {
                url: "list",
                templateUrl: "views/Template/category/category.html",

                controller: "catgeoryCtrl",
                data: {
                    displayName: 'Catgeory',
                    paneLimit: 1,
                    depth: 3
                }
            })
            .state('home.template.catgeory.add', {
                url: "category/add",
                templateUrl: "views/template/category/add.html",
                controller: "catgeoryCtrl",

                data: {
                    displayName: 'Catgeoy / ADD',
                    paneLimit: 1,
                    depth: 3
                }
            }).state('home.template.category.edit', {
            url: "category/:pageId",
            templateUrl: "views/template/add.html",
            controller: "catgeoryCtrl",

            data: {
                displayName: 'Catgeoy / Edit',
                paneLimit: 1,
                depth: 3
            }
        });

    }])


    .service("categoryServices",['$q','apiService','templateManager',function($q,apiService,cmsManager){
        var deferred = $q.defer();

        var pages=null;
        this.addPage=function($apiName,$addData){
            return apiService.add($apiName,$addData).then(function(data){
                return data;
            })}
        this.updatePage=function($apiName,$updateData){
            return apiService.update($apiName,$updateData).then(function(data){
                return data;
            })}
        this.deletePage=function($apiName,$deleteId){
            return cmsManager.deletePage($apiName,$deleteId).then(function(data){
                return data;
            })}
        this.listAllPages=function($query){
            console.log($query)
            return templateManager.getPages($query).then(function(data){
                pages=data;
                return pages;

            });
        }
        this.getAccessByCode=function($apiName,$accessCode,$languageid){
            $query='$accesscode='+$accesscode+'$languageId='+$languageId+'';
            apiService.getAll($apiName,$query).then(function(data){
                deferred.resolve(data);
            });
            return deferred.promise;
        }
        this.getById=function($id,$query){
            $query=($query)?"$pageID="+$query:'';
            return cmsManager.getPageById($id,$query).then(function(data){
                pages=data;
                return pages;
            });

        }
        this.getData=function()
        {
            return pages;
        }

    }])


    .controller("catgeoryCtrl",['$scope','$rootScope','$location','$stateParams','cssInjector','apiService','templateServices','languageService',function($scope,$rootScope,$location,$stateParams,$cssInjector,$apiService,$templateService,$language){
        $cssInjector.removeAll();
        CKEDITOR.config.allowedContent = true;
        CKEDITOR.extraAllowedContent = '*(*)';
        $cssInjector.add("views/Template/category/category.css");
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
        $scope.addPageData=null;
        $scope.updatePageData=null;
        $scope.deletePageId=null;
        $scope.pages=null;
        $scope.pageId=($stateParams.pageId)?$stateParams.pageId:null;
        $scope.accessCode=null;
        $scope.languageId=null;
        function addPage()
        {
            if($scope.addPageData!=null){
                response=$cmsService.addPage('TemplatePages/addpage',$scope.addpageData);
                (verifyResponse(response)=='success')?$location.href="#/home/cms/list":'';
            }
        }
        function removePage() {
            if($scope.deletePageId!=null)
            {
                response=$cmsService.deletePage('Templatepages/removePage',$scope.deletePageId);
                verifyResponse(response);
            }
        }
        function getAllPages() {

            response=$templateService.listAllPages().then(function(data){
                verifyResponse(data)=='success'?$scope.pages=data:'';
            });

        }
        function updatePage(){
            if($scope.updatePageData!=null){
                response=$cmsService.updatePage('Templatepages/update',$scope.updatePageData);
                (verifyResponse(response)=='success')?location.href="#/home/cms/list":'';
            }
        }

        function getById()
        {

            if($scope.pageId!=null)
            {
                response=$cmsService.getById($scope.pageId).then(function(data){
                    verifyResponse(data)=='success'?$scope.updatePageData=data:'';
                    console.log($scope.updatePageData);
                });

            }
        }
        function getByAccessCode()
        {
            if($scope.accessCode!=null && $scope.languageId!=null)
            {
                response=$cmsService.getByAccessCode('Templatepages/GetByAccessCode',$scope.accessCode,$scope.languageId).then(function(data){;
                    (verifyResponse(data)=='success')?this.updatePageData=data:'';});
            }
        }
        function verifyResponse(response)
        {
            status=(response)?{status:'success',message:"Saved Successfully"}:{status:'warn',message:response};
            //$scope.showNotificationSavedSuccess.show(status.message,status.status);
            return status.status;
        }
        function getLanguages()
        {
            $language.getAllLanguage().then(function(data){
                console.log(data);
                $scope.languages=data;
            })
        }
        function setResponse()
        {
            return $cmsService.getData();
        }
        function transferEdit(pageid)
        {
            console.log("#/home/template/"+pageid);
            location.href="#/home/template/"+pageid;
        }
        $scope.getscopes=function()
        {
            console.log($scope);
        }
        $scope.transferEdit=transferEdit;
        $scope.addPage=addPage;
        $scope.removePage=removePage;
        $scope.getAllPages=getAllPages;
        $scope.updatePage=updatePage;
        $scope.getAccessByCode=getByAccessCode;
        $scope.editPage=getById;
        $scope.getLanguages=getLanguages;
    }])