
'use strict';

angular
    .module('ips.helpcategory', [])
    .factory('categoryManager', ['$q', 'apiService', function ($q, apiService) {
        var self = {

            getcategories: function (query) {
                return $q.when(getcategories(query));
            },

            getcategoryById: function (id, query) {
                return $q.when(getcategoryById(id, query));
            },
        };

        return self;

        function getcategories(query) {
            var deferred = $q.defer();
            var apiName = 'helpcategory/gethelpcategory';
            (!query) ? query = '' : '';
            apiService.getAll(apiName, query).then(function (data) {
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }

        function getcategoryById(id, query) {
            var deferred = $q.defer();
            var apiName = 'helpcategory/gethelpcategorybyid';
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
            .state('home.helpcategory.category', {
                url: "/list",
                templateUrl: "views/helpcontent/category.html",
                controller: "categoryCtrl",
                resolve: {
                    pageName: function ($translate) {
                        return $translate.instant('COMMON_CATEGORY');
                    }
                },
                data: {
                    displayName: '{{pageName}}',//'Category',
                    paneLimit: 1,
                    depth: 2
                }
            })
            .state('home.helpcategory.add', {
                url: "/add",
                templateUrl: "views/helpcontent/categoryAdd.html",
                controller: "categoryCtrl",
                resolve: {
                    pageName: function ($translate) {
                        return $translate.instant('COMMON_ADD');
                    }
                },
                data: {
                    displayName: '{{pageName}}',//'ADD',
                    paneLimit: 1,
                    depth: 3
                }
            }).state('home.helpcategory.edit', {
                url: "/:categoryId",
                templateUrl: "views/helpcontent/categoryAdd.html",
                controller: "categoryCtrl",
                resolve: {
                    pageName: function ($translate) {
                        return $translate.instant('COMMON_EDIT');
                    }
                },
                data: {
                    displayName: '{{pageName}}',//'EDIT',
                    paneLimit: 1,
                    depth: 3
                }
            });

    }])
    .service("helpCategoryServices", ['$q', 'apiService', 'categoryManager', function ($q, apiService, categoryManager) {
        var deferred = $q.defer();

        var categories = null;
        this.addcategory = function ($apiName, $addData) {
            return apiService.add($apiName, $addData).then(function (data) {
                return data;
            })
        }
        this.updatecategory = function ($apiName, $updateData) {
            return apiService.update($apiName, $updateData).then(function (data) {
                return data;
            })
        }
        this.deletecategory = function ($apiName, $deleteId) {
            return categoryManager.deletecategory($apiName, $deleteId).then(function (data) {
                return data;
            })
        }
        this.listAllcategories = function ($query) {
            return categoryManager.getcategories($query).then(function (data) {
                categories = data;
                return categories;

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
            $query = ($query) ? "$contentID=" + $query : '';
            return categoryManager.getcategoryById($id, $query).then(function (data) {
                categories = data;
                return categories;
            });

        }
        this.getData = function () {
            return categories;
        }
        return this;
    }])
    .controller("categoryCtrl", ['$scope', '$rootScope', '$location', '$stateParams', 'cssInjector', 'apiService', 'helpCategoryServices', 'languageService', function ($scope, $rootScope, $location, $stateParams, $cssInjector, $apiService, $categoryService, $language) {
        $cssInjector.removeAll();
        $cssInjector.add("views/helpcontent/category.css");
        console.log($categoryService)
        var response = null;
        var status = null;

        $scope.deletecategoryId = null;
        $scope.categories = null;
        $scope.categoryId = ($stateParams.categoryId) ? $stateParams.categoryId : null;
        $scope.accessCode = null;
        $scope.languageId = null;
        function addcategory() {
            if ($scope.categoryData != null) {
                $scope.categoryData.isParentCategory = ($scope.categoryData.parentCategoryID) ? false : true;
                response = $categoryService.addcategory('helpcategory/AddHelpCategory', $scope.categoryData);
                (verifyResponse(response) == 'success') ? location.href = "#/home/category/list" : '';
            }
        }
        function removecategory() {
            if ($scope.deletecategoryId != null) {
                response = $categoryService.deletecategory('helpcategory/removecategory', $scope.deletecategoryId);
                verifyResponse(response);
            }
        }
        function getAllcategories() {

            response = $categoryService.listAllcategories().then(function (data) {
                verifyResponse(data) == 'success' ? $scope.categories = data : '';
            });

        }
        function updatecategory() {
            if ($scope.categoryData != null) {
                $scope.categoryData.isParentCategory = ($scope.categoryData.parentCategoryID) ? false : true;
                response = $categoryService.updatecategory('helpcategory/updatehelpcategory', $scope.categoryData);
                (verifyResponse(response) == 'success') ? location.href = "#/home/category/list" : '';
            }
        }

        function getById() {

            if ($scope.categoryId != null) {
                response = $categoryService.getById($scope.categoryId).then(function (data) {
                    verifyResponse(data) == 'success' ? $scope.categoryData = data : '';
                    console.log($scope.categoryData);
                });

            }
        }
        function getByAccessCode() {
            if ($scope.accessCode != null && $scope.languageId != null) {
                response = $categoryService.getByAccessCode('category/GetByAccessCode', $scope.accessCode, $scope.languageId).then(function (data) {
                    ;
                    (verifyResponse(data) == 'success') ? this.updatecategoryData = data : '';
                });
            }
        }
        function verifyResponse(response) {
            status = (response) ? { status: 'success', message: "Saved Successfully" } : { status: 'warn', message: response };
            //$scope.showNotificationSavedSuccess.show(status.message,status.status);
            console.log(status);
            return status.status;
        }
        function getLanguages() {
            $language.getAllLanguage().then(function (data) {
                console.log(data);
                $scope.languages = data;
            })
        }
        function setResponse() {
            return $categoryService.getData();
        }
        function transferEdit(categoryid) {

            location.href = "#/home/category/" + categoryid;
        }
        $scope.getscopes = function () {
            console.log($scope);
            history.back();
        }
        $scope.transferEdit = transferEdit;
        $scope.addcategory = addcategory;
        $scope.removecategory = removecategory;
        $scope.getAllcategories = getAllcategories;
        $scope.updatecategory = updatecategory;
        $scope.getAccessByCode = getByAccessCode;
        $scope.editcategory = getById;
        $scope.getLanguages = getLanguages;
    }])


