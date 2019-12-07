'use strict';

angular.module('ips.bscGoals', ['ui.router', 'kendo.directives'])

    .config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
        $stateProvider
            .state('home.bsc.bscGoals', {
                url: "/bscGoals",
                templateUrl: "views/bscGoals/bscGoals.html",
                controller: "BscGoalsCtrl",
                resolve: {
                    pageName: function ($translate) {
                        return $translate.instant('LEFTMENU_BSC_GOALS');
                    },
                    organizations: function ($stateParams, bscGoalsService) {
                        return bscGoalsService.getOrganizations();
                    },
                },
                data: {
                    displayName: '{{pageName}}',//'BSC Goals',
                    paneLimit: 1,
                    depth: 2
                }
            });
    }])

    .service('bscGoalsService', ['apiService', '$translate', function (apiService, $translate) {
        this.getOrganizations = function () {
            return apiService.getAll("organization?$select=Id,Name&$orderby=Name").then(function (data) {
                data.unshift({ id: null, name: $translate.instant('BSCGOALS_SELECT_ORGANIZATION') });
                return data;
            });
        }
    }])

    .controller('BscGoalsCtrl', ['$scope', '$location', 'apiService', '$window', '$rootScope', 'cssInjector', 'dialogService', 'organizations', '$translate', function ($scope, $location, apiService, $window, $rootScope, cssInjector, dialogService, organizations, $translate) {
        cssInjector.removeAll();
        cssInjector.add('views/bscGoals/bscGoals.css');

        $scope.organizations = [];
        angular.forEach(organizations, function (key, value) {
            this.push({ value: key.id, text: key.name });
        }, $scope.organizations);

        $scope.add = function () {
            var grid = $("#bscGoalsGrid").data("kendoGrid");
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
                        apiService.getAll("Objectives?$orderby=Title").then(function (data) {
                            options.success(data);
                        })
                    },
                    update: function (options) {
                        var item = { id: options.data.id, title: options.data.title, organizationId: options.data.organizationId, isActive: options.data.isActive, description: options.data.description };
                        apiService.update("Objectives", item).then(function (data) {
                            options.success();
                        })
                    },
                    create: function (options) {
                        var item = { id: options.data.id, title: options.data.title, organizationId: options.data.organizationId, isActive: options.data.isActive, description: options.data.description };

                        apiService.add("Objectives", item).then(function (data) {
                            options.data.id = data;
                            options.data.parentId = null;
                            options.success(options.data);
                            $scope.notification($translate.instant('BSCGOALS_GOAL_SAVED_SUCCESFULLY'), "info");
                        })
                    },
                },
                pageSize: 10,
                schema: {
                    model: {
                        id: "id",
                        fields: {
                            id: { type: 'number', },
                            title: {
                                type: 'string',
                                validation: {
                                    titlevalidation: function (input) {
                                        if (input.is("[name='title']")) {
                                            if (input.val() != "") {
                                                var data = $("#bscGoalsGrid").data("kendoGrid");
                                                var len = data.dataSource.total();
                                                var row = input.closest('tr')[0];
                                                var uid = $(row).attr('data-uid');
                                                var dataitem = data.dataSource.getByUid(uid);
                                                for (var i = 0; i < len - 1; i++) {
                                                    var item = data.dataSource.at(i);
                                                    if (item.id != dataitem.id) {
                                                        if (input.val().toLowerCase() == item.title.toLowerCase() && (item.organizationId == null ? 0 : item.organizationId) == (dataitem.organizationId == null ? 0 : dataitem.organizationId)) {
                                                            input.attr("data-titlevalidation-msg", $translate.instant('BSCGOALS_DEFINED_GOAL_ALREADY_EXIST'));
                                                            return false;
                                                        }
                                                    }
                                                }
                                                dataitem.title = input.val();
                                            } else {
                                                input.attr("data-titlevalidation-msg", $translate.instant('BSCGOALS_NAME_IS_REQUIRED'));
                                                return false;
                                            }
                                        }
                                        return true;
                                    }
                                }
                            },
                            description: { type: 'string' },
                            organizationId: {
                                type: 'number',
                                validation: {
                                    orgvalidation: function (input) {
                                        if (input.is("[name='organizationId']")) {
                                            if (input.val() == null || input.val() == "" || input.val() == 0) {
                                                input.attr("data-orgvalidation-msg", $translate.instant('BSCGOALS_ORGANIZATION_IS_REQUIRED'));
                                                return true;
                                            }
                                        }
                                        return true;
                                    }
                                }
                            },
                            isActive: { type: 'boolean' },
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
                { field: "title", title: $translate.instant('COMMON_NAME'), width: 300 },
                { field: "description", title: $translate.instant('COMMON_DESCRIPTION'), width: 300 },
                { field: "organizationId", title: $translate.instant('COMMON_ORGANIZATION'), width: 150, values: $scope.organizations, defaultValue: null },
                { field: "isActive", title: $translate.instant('COMMON_IS_ACTIVE'), width: 150, template: '<input type="checkbox" #= isActive ? checked="checked" : "" # disabled="disabled" />' },
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
                                    apiService.remove("Objectives", dataItem.id).then(function (data) {
                                        var grid = $("#bscGoalsGrid").data("kendoGrid");
                                        grid.dataSource.remove(dataItem);
                                    }, function (data) {
                                        dialogService.showNotification($translate.instant('BSCGOALS_GOAL_IS_IN_USE') + " " + $translate.instant('BSCGOALS_GOAL_CANNOT_BE_REMOVED'), "error");
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