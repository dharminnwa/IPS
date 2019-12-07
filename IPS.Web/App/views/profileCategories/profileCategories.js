'use strict';

angular.module('ips.profileCategories', ['ui.router', 'kendo.directives'])

    .config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
        var baseCmsPageResolve = {
            profileCategory: function ($translate) {
                return $translate.instant('PROFILE_CAT_PROFILE_CATEGORIES');
            }
        };
        $stateProvider
            .state('home.settings.profileCategories', {
                url: "/profileCategories",
                templateUrl: "views/profileCategories/profileCategories.html",
                controller: "ProfileCategoriesCtrl",
                resolve: baseCmsPageResolve,
            data: {
                displayName: '{{profileCategory}}',  //  'Profile Categories',
                paneLimit: 1,
                depth: 2
            }
        });
}])

    .controller('ProfileCategoriesCtrl', ['$scope', '$location', 'apiService', '$window', '$rootScope', 'cssInjector', 'dialogService', '$translate', function ($scope, $location, apiService, $window, $rootScope, cssInjector, dialogService, $translate) {
    cssInjector.removeAll();
    cssInjector.add('views/profileCategories/profileCategories.css');
    
    $scope.add = function () {
        var grid = $("#profileCategoriesGrid").data("kendoGrid");
        grid.addRow();
    }

    $scope.notification = function (message, type, callback) {

        dialogService.notification(message, type);

        if (callback)
        {
            callback();
        }
    }

    $scope.gridOptions = {
        dataSource: {
            type: "json",
            transport: {
                read: function (options) {
                    apiService.getAll("ProfileCategory?$orderby=Name").then(function (data) {
                        options.success(data);
                    })
                },
                update: function (options) {
                    var item = { id: options.data.id, name: options.data.name, description: options.data.description, parentId: options.data.parentId };
                    apiService.update("ProfileCategory", item).then(function (data) {
                        options.success();
                    })
                },
                destroy: function (options) {
                    dialogService.showYesNoDialog($translate.instant('ORGANIZATIONS_CONFIRM_DELETE'), $translate.instant('COMMON_ARE_YOU_SURE_YOU_WANT_TO_DELETE')).then(
                        function () {
                            apiService.remove("ProfileCategory", options.data.id).then(function (data) {
                                options.success();
                            })
                        },
                        function () {
                            options.error({}, 500, "destroyCanceled");
                        })
                },
                create: function (options) {
                    var item = { id: options.data.id, name: options.data.name, description: options.data.description, parentId: null };

                    apiService.getAll("ProfileCategory?$filter=Name eq '" + item.name + "'").then(function (data) {
                        if(data.length > 0)
                        {
                            $scope.notification($translate.instant('PROFILE_CAT_PROFILE_CATEGORY_NAME_SHOULD_BE_UNIQUE'), 'warning');
                        }
                        else
                        {
                            apiService.add("ProfileCategory", item).then(function (data) {
                                options.data.id = data;
                                options.data.parentId = null;
                                $scope.notification($translate.instant('MYPROJECTS_PROJECTPROFILES_PROFILE_CATEGORY_SAVED_SUCCESFULLY'), 'info');
                                options.success(options.data);
                            })
                        }
                    })
                },
            },
            pageSize: 10,
            schema: {
                model: {
                    id: "id",
                    fields: {
                        id: { type: 'number', },
                        name: { type: 'string' },
                        //description: { type: 'string' },
                        //ParentId: { type: 'number' },
                    }
                }
            },
            error: function (err) {
                this.cancelChanges();
            },
        },
        sortable: true,
        pageable: true,
        editable: {
            mode: "inline",
            confirmation: false
        },
        columns: [
            { field: "name", title: $translate.instant('COMMON_NAME'), width: 300 },
            //{ field: "description", title: "Description", width: 350 },
            { command: [{ name: "edit", text: "", width: 30 }, { name: "destroy", text: "", width: 30 }], title: $translate.instant('COMMON_ACTIONS'), width: "100px" },
        ],
    };
}]);