
'use strict';

angular
    .module('ips.cms', [])

    .config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
        var baseCmsPageResolve = {
            pageNamePages: function ($translate) {
                return $translate.instant('CMS_PAGES');
            },
            pageNameAdd: function ($translate) {
                return $translate.instant('COMMON_ADD');
            },
            pageNameEdit: function ($translate) {
                return $translate.instant('COMMON_EDIT');
            }
        };
        $stateProvider
            .state('home.cms.pages', {
                url: "/list",
                templateUrl: "views/cms/cms.html",
                controller: "cmsCtrl",
                resolve: baseCmsPageResolve,
                data: {
                    displayName: '{{pageNamePages}}',//'Pages',
                    paneLimit: 1,
                    depth: 2
                }
            })
            .state('home.cms.add', {
                url: "/add",
                templateUrl: "views/cms/cmsAdd.html",
                controller: "cmsCtrl",
                resolve: baseCmsPageResolve,
                data: {
                    displayName: '{{pageNameAdd}}',//'ADD',
                    paneLimit: 1,
                    depth: 3
                }
            }).state('home.cms.edit', {
                url: "/:pageId",
                templateUrl: "views/cms/cmsAdd.html",
                controller: "cmsCtrl",
                resolve: baseCmsPageResolve,
                data: {
                    displayName: '{{pageNameEdit}}',//'Edit',
                    paneLimit: 1,
                    depth: 3
                }
            });

    }])
    .service("cmsServices", ['$q', 'apiService', 'cmsManager', function ($q, apiService, cmsManager) {
        var deferred = $q.defer();

        var pages = null;
        this.addPage = function ($apiName, $addData) {
            return apiService.add($apiName, $addData).then(function (data) {
                return data;
            })
        }
        this.updatePage = function ($apiName, $updateData) {
            return apiService.update($apiName, $updateData).then(function (data) {
                return data;
            })
        }
        this.deletePage = function ($apiName, $deleteId) {
            return cmsManager.deletePage($apiName, $deleteId).then(function (data) {
                return data;
            })
        }
        this.listAllPages = function ($query) {
            return cmsManager.getPages($query).then(function (data) {
                pages = data;
                return pages;

            });
        }
        this.getAccessByCode = function ($apiName, $accessCode, $languageid) {
            $query = '$accesscode=' + $accesscode + '$languageId=' + $languageId + '';
            apiService.getAll($apiName, $query).then(function (data) {
                deferred.resolve(data);

            });
            return deferred.promise;
        }
        this.getById = function ($id, $query) {
            $query = ($query) ? "$pageID=" + $query : '';
            return cmsManager.getPageById($id, $query).then(function (data) {
                pages = data;
                return pages;
            });

        }
        this.getData = function () {
            return pages;
        }

    }])
    .controller("cmsCtrl", ['$scope', '$rootScope', '$location', '$stateParams', 'cssInjector', 'apiService', 'cmsServices', 'languageCMSService', '$translate', function ($scope, $rootScope, $location, $stateParams, $cssInjector, $apiService, $cmsService, $language, $translate) {
        $cssInjector.removeAll();
        CKEDITOR.config.allowedContent = true;
        CKEDITOR.extraAllowedContent = '*(*)';
        $cssInjector.add("views/Cms/cms.css");
        $scope.editorOptions = {
            language: 'en',
            uiColor: 'white',
            skin: 'bootstrapck',
            allowedContent: true,
            extraAllowedContent: '*(*)',
            sharedSpaces: {
                top: "cke_editor_2",
                bottom: "cke_editor_2"
            },
            height: 150
        };
        var response = null;
        var status = null;
        $scope.addPageData = null;
        $scope.updatePageData = null;
        $scope.deletePageId = null;
        $scope.pages = null;
        $scope.pageId = ($stateParams.pageId) ? $stateParams.pageId : null;
        $scope.accessCode = null;
        $scope.languageId = null;


        function addPage() {
            if ($scope.updatePageData != null) {
                response = $cmsService.addPage('CmsPages/addpage', $scope.updatePageData);

                (verifyResponse(response) == 'success') ? location.href = "#/home/cms/list" : '';
            }
        }
        function removePage() {
            if ($scope.deletePageId != null) {
                response = $cmsService.deletePage('cmspages/removePage', $scope.deletePageId);
                verifyResponse(response);
            }
        }
        function getAllPages() {

            response = $cmsService.listAllPages().then(function (data) {
                verifyResponse(data) == 'success' ? $scope.pages = data : '';
            });

        }
        function updatePage() {
            if ($scope.updatePageData != null) {
                response = $cmsService.updatePage('cmspages/update', $scope.updatePageData);
                (verifyResponse(response) == 'success') ? location.href = "#/home/cms/list" : '';
            }
        }

        function getById() {
            console.log($scope.pageId);
            if ($scope.pageId != null) {
                response = $cmsService.getById($scope.pageId).then(function (data) {
                    verifyResponse(data) == 'success' ? $scope.updatePageData = data : '';
                    console.log($scope.updatePageData);
                });

            }
        }
        function getByAccessCode() {
            if ($scope.accessCode != null && $scope.languageId != null) {
                response = $cmsService.getByAccessCode('cmspages/GetByAccessCode', $scope.accessCode, $scope.languageId).then(function (data) {
                    ;
                    (verifyResponse(data) == 'success') ? this.updatePageData = data : '';
                });
            }
        }
        function verifyResponse(response) {
            status = (response) ? { status: 'success', message: $translate.instant('CMS_SAVED_SUCCESSFULLY') } : { status: 'warn', message: response };
            //$scope.showNotificationSavedSuccess.show(status.message,status.status);
            return status.status;
        }
        function getLanguages() {

            $language.getAllLanguage().then(function (data) {
                console.log(data);
                $scope.languages = data;
            })
        }
        function setResponse() {
            return $cmsService.getData();
        }
        function transferEdit(pageid) {
            console.log("#/home/cms/" + pageid);
            location.href = "#/home/cms/" + pageid;
        }
        $scope.getscopes = function () {
            console.log($scope);
            history.back();
        }
        $scope.transferEdit = transferEdit;
        $scope.addPage = addPage;
        $scope.removePage = removePage;
        $scope.getAllPages = getAllPages;
        $scope.updatePage = updatePage;
        $scope.getAccessByCode = getByAccessCode;
        $scope.editPage = getById;
        $scope.getLanguages = getLanguages;
    }])


