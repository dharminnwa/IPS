'use strict';

angular.module('ips.bscPerspectives', ['ui.router', 'kendo.directives'])

    .config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
        $stateProvider
            .state('home.bsc.bscPerspectives', {
                url: "/bscPerspectives",
                templateUrl: "views/bscPerspectives/bscPerspectives.html",
                controller: "BscPerspectivesCtrl",
                resolve: {
                    pageName: function ($translate) {
                        return $translate.instant('LEFTMENU_BSC_PERSPECTIVES');
                    },
                    organizations: function ($stateParams, bscPerspectivesService) {
                        return bscPerspectivesService.getOrganizations();
                    }
                },
                data: {
                    displayName: '{{pageName}}',//'BSC Perspectives',
                    paneLimit: 1,
                    depth: 2
                }
            });
    }])

    .service('bscPerspectivesService', ['apiService', '$translate', function (apiService, $translate) {
        this.getOrganizations = function () {
            return apiService.getAll("organization?$select=Id,Name&$orderby=Name").then(function (data) {
                data.unshift({ id: null, name: $translate.instant('BSCPERSPECTIVE_SELECT_ORGANIZATION') });
                return data;
            });
        }
    }])

    .controller('BscPerspectivesCtrl', ['$scope', '$location', 'apiService', '$window', '$rootScope', 'cssInjector', 'dialogService', 'organizations', '$translate', function ($scope, $location, apiService, $window, $rootScope, cssInjector, dialogService, organizations, $translate) {
        cssInjector.removeAll();
        cssInjector.add('views/bscPerspectives/bscPerspectives.css');

        $scope.organizations = [];
        angular.forEach(organizations, function (key, value) {
            this.push({ value: key.id, text: key.name });
        }, $scope.organizations);

        $scope.add = function () {
            var grid = $("#bscPerspectivesGrid").data("kendoGrid");
            grid.addRow();
        }

        $scope.notification = function (message, type, callback) {

            dialogService.showNotification(message, type);

            if (callback) {
                callback();
            }
        }

        $scope.gridOptions = {
            dataSource: {
                type: "json",
                transport: {
                    read: function (options) {
                        apiService.getAll("perspectives?$orderby=Name").then(function (data) {
                            options.success(data);
                        })
                    },
                    update: function (options) {
                        var item = { id: options.data.id, name: options.data.name, organizationId: options.data.organizationId };
                        apiService.update("perspectives", item).then(function (data) {
                            options.success();
                        })
                    },
                    create: function (options) {
                        var item = { id: options.data.id, name: options.data.name, organizationId: options.data.organizationId };
                        apiService.add("perspectives", item).then(function (data) {
                            options.data.id = data;
                            options.data.parentId = null;
                            options.success(options.data);
                            $scope.notification($translate.instant('BSCPERSPECTIVE_PERSPECTIVE_SAVED_SUCCESFULLY'), "info");
                        })
                    },
                },
                pageSize: 10,
                schema: {
                    model: {
                        id: "id",
                        fields: {
                            id: { type: 'number', },
                            name: {
                                type: 'string', validation: {
                                    namevalidation: function (input) {
                                        if (input.is("[name='name']")) {
                                            if (input.val() != "") {
                                                input.attr("data-namevalidation-msg", $translate.instant('BSCPERSPECTIVE_DEFINED_PERSPECTIVE_ALREADY_EXIST'));
                                                var data = $("#bscPerspectivesGrid").data("kendoGrid");
                                                var len = data.dataSource.total();
                                                var row = input.closest('tr')[0];
                                                var uid = $(row).attr('data-uid');
                                                var dataitem = data.dataSource.getByUid(uid);
                                                for (var i = 0; i < len - 1; i++) {
                                                    var item = data.dataSource.at(i);
                                                    if (item.id != dataitem.id) {
                                                        if (input.val().toLowerCase() == item.name.toLowerCase() && (item.organizationId == null ? 0 : item.organizationId) == (dataitem.organizationId == null ? 0 : dataitem.organizationId)) {
                                                            return false;
                                                        }
                                                    }
                                                }
                                                dataitem.name = input.val();
                                            } else {
                                                input.attr("data-namevalidation-msg", $translate.instant('BSCPERSPECTIVE_NAME_IS_REQUIRED'));
                                                return false;
                                            }
                                        }
                                        return true;
                                    }
                                }
                            },
                            organizationId: {
                                type: 'number'
                            },
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
                { field: "organizationId", title: $translate.instant('COMMON_ORGANIZATION'), width: 150, values: $scope.organizations, defaultValue: null },
                {
                    command: [{ name: "edit", text: "", width: '25%' },
                    {
                        name: "btnDelete", text: "", width: '25%',
                        className: "btn-delete",
                        click: function (e) {
                            e.preventDefault();
                            var tr = $(e.target).closest("tr");
                            var dataItem = this.dataItem(tr);
                            dialogService.showYesNoDialog($translate.instant('COMMON_CONFIRM'), $translate.instant('COMMON_ARE_YOU_SURE_YOU_WANT_TO_DELETE')).then(
                                function () {
                                    apiService.remove("perspectives", dataItem.id).then(function (data) {
                                        var grid = $("#bscPerspectivesGrid").data("kendoGrid");
                                        grid.dataSource.remove(dataItem);
                                    }, function (data) {
                                        dialogService.showNotification($translate.instant('BSCPERSPECTIVE_PERSPECTIVE_IS_IN_USE') + " " + $translate.instant('BSCPERSPECTIVE_PERSPECTIVE_CANNOT_BE_REMOVED'), "error");
                                    })
                                },
                                function (message) {
                                    dialogService.showNotification(message, "warning");
                                });
                        }
                    }], title: $translate.instant('COMMON_ACTIONS'), width: 60,
                    headerAttributes: {
                        "data-title": $translate.instant('COMMON_ACTIONS')
                    }
                },
            ],
        };

        $scope.tooltipOptions = {
            filter: "th", // show tooltip only on these elements
            position: "top",
            animation: {
                open: {
                    effects: "fade:in",
                    duration: 200
                },
                close: {
                    effects: "fade:out",
                    duration: 200
                }
            },
            // show tooltip only if the text of the target overflows with ellipsis
            show: function (e) {
                if (this.content.text() != "") {
                    $('[role="tooltip"]').css("visibility", "visible");
                }
            }
        };
    }]);