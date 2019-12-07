angular.module('ips.roleLevel')
    .config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
        var baseRoleLevelResolve = {
            pageName: function ($translate) {
                return $translate.instant('LEFTMENU_ROLE_LEVELS');
            },
            organizations: function (roleLevelService) {
                return roleLevelService.getOrganizations().then(function (data) {
                    return data;
                });
            }
        };
        $stateProvider
            .state('home.roleLevel.roleLevels', {
                url: "/roleLevels",
                templateUrl: "views/roleLevel/views/roleLevels.html",
                controller: "roleLevelsCtrl",
                resolve: baseRoleLevelResolve,
                data: {
                    displayName: '{{pageName}}',//'Role Levels',
                    paneLimit: 1,
                    depth: 2,
                    resource: "Security"
                }
            });
    }])
    .controller('roleLevelsCtrl', ['$scope', 'cssInjector', '$location', 'dialogService', '$compile', 'roleLevelService', 'organizations', '$translate', 'authService', function ($scope, cssInjector, $location, dialogService, $compile, roleLevelService, organizations, $translate, authService) {
        cssInjector.removeAll();
        //cssInjector.add('css/components.min.css');
        //cssInjector.add('css/default.min.css');
        $scope.authentication = authService.authentication;
        $scope.currentUser = $scope.authentication.user;

        //$scope.organizations = organizations;
        $scope.roleLevel = {
            id: 0,
            name: '',
            organizationId: null,
            parentRoleLevelId: null,
        }
        $scope.roleLevels = [];
        $("#organizationRoleLevels").kendoGrid({
            dataBound: $scope.onGridDataBound,
            dataSource: {
                type: "json",
                data: [],
                pageSize: 10,
            },
            columnMenu: false,
            filterable: {
                extra: false,
                operators: {
                    string: {
                        startswith: "Starts with",
                        eq: "Is equal to",
                        neq: "Is not equal to"
                    }
                }
            },
            pageable: true,
            columns: [
                {
                    field: "Name", title: $translate.instant('COMMON_NAME'),
                },
                { field: "parentRoleLevelName", title: $translate.instant('ROLELEVEL_PARENT_ROLE_LEVEL') },
                {
                    field: "", title: $translate.instant('COMMON_ACTION'), width: '15%', filterable: false, template: function (dataItem) {
                        return "<span class='fa fa-pencil fa-lg' ng-click='EditRoleLevel(" + dataItem.id + ")'></span>"
                    }
                },
            ],
        });
        $("#organizationRoleLevels").kendoTooltip({
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
        });

        $scope.onGridDataBound = function (e) {
            var grid = e.sender;
            if (grid.dataSource.total() == 0) {
                var colCount = grid.columns.length;
                $(e.sender.wrapper)
                    .find('tbody')
                    .append('<tr class="kendo-data-row"><td colspan="' + colCount + '" class="no-data">There is no data to show in the grid.</td></tr>');
            }
            else {
                $compile(e.sender.element)($scope);
            }
        };
        $scope.organizationChanged = function () {
            $scope.roleLevel.name = "";
            $scope.roleLevel.parentRoleLevelId = null;
            roleLevelService.getRoleLevelsByOrganizationId($scope.roleLevel.organizationId).then(function (data) {
                $scope.roleLevels = data;
                $scope.parentRoleLevels = data;
                if ($("#organizationRoleLevels").data("kendoGrid")) {
                    $("#organizationRoleLevels").kendoGrid("destroy");
                    $("#organizationRoleLevels").html("");
                }
                $("#organizationRoleLevels").kendoGrid({
                    dataBound: $scope.onGridDataBound,
                    dataSource: {
                        type: "json",
                        data: $scope.roleLevels,
                        pageSize: 10,
                        //group: { field: "parentRoleLevelId", field: "parentRoleLevelName" },
                    },
                    columnMenu: false,
                    filterable: {
                        extra: false,
                        operators: {
                            string: {
                                startswith: "Starts with",
                                eq: "Is equal to",
                                neq: "Is not equal to"
                            }
                        }
                    },
                    pageable: true,
                    columns: [
                        {
                            field: "name", title: $translate.instant('COMMON_NAME'),
                        },
                        { field: "parentRoleLevelName", title: $translate.instant('ROLELEVEL_PARENT_ROLE_LEVEL') },
                        {
                            field: "action", title: $translate.instant('COMMON_ACTION'), width: '15%', filterable: false, template: function (dataItem) {
                                return "<span class='fa fa-pencil fa-lg' ng-click='EditRoleLevel(" + dataItem.id + ")'></span> <span class='fa fa-remove' ng-click='DeleteRoleLevel(" + dataItem.id + ")'></span> <span class='fa fa-gear' ng-click='SetPermission(" + dataItem.id + "," + dataItem.organizationId + ")'></span>"
                            }
                        },
                    ],
                });
                $("#organizationRoleLevels").kendoTooltip({
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
                });
            });
        };


        $scope.SaveOrganizationRoleLevel = function () {
            if ($scope["formRoleLevel"].$valid) {
                roleLevelService.saveRoleLevel($scope.roleLevel).then(function (data) {
                    if (data.id > 0) {
                        $scope.roleLevel.id = 0;
                        $scope.roleLevel.name = "";
                        $scope.roleLevel.parentRoleLevelId = null;
                        $scope.organizationChanged();
                        dialogService.showNotification($translate.instant('ROLELEVEL_ROLE_LEVEL_SAVED_SUCCESSFULLY'), "success");
                    }
                    else {
                        dialogService.showNotification($translate.instant('ROLELEVEL_ROLE_LEVEL_FAILED'), "error");

                    }
                });
            }
        }
        $scope.ClearOrganizationRoleLevel = function () {
            $scope.roleLevels = [];
            $scope.roleLevel = {
                id: 0,
                name: '',
                organizationId: null,
                parentRoleLevelId: null,
            }
            $scope.parentRoleLevels = [];
            if ($("#organizationRoleLevels").data("kendoGrid")) {
                $("#organizationRoleLevels").kendoGrid("destroy");
                $("#organizationRoleLevels").html("");
            }
            $("#organizationRoleLevels").kendoGrid({
                dataBound: $scope.onGridDataBound,
                dataSource: {
                    type: "json",
                    data: $scope.roleLevels,
                    pageSize: 10,
                    //group: { field: "parentRoleLevelId", field: "parentRoleLevelName" },
                },
                columnMenu: true,
                filterable: {
                    extra: false,
                    operators: {
                        string: {
                            startswith: "Starts with",
                            eq: "Is equal to",
                            neq: "Is not equal to"
                        }
                    }
                },
                pageable: true,
                columns: [
                    {
                        field: "name", title: $translate.instant('COMMON_NAME'),
                    },
                    { field: "parentRoleLevelName", title: $translate.instant('ROLELEVEL_PARENT_ROLE_LEVEL') },
                ],
            });
            $("#organizationRoleLevels").kendoTooltip({
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
            });
            $scope.formRoleLevel["roleLevel_name"].$dirty = false;
        }
        $scope.EditRoleLevel = function (roleLevelId) {
            $scope.roleLevel = _.find($scope.roleLevels, function (item) {
                return item.id == roleLevelId;
            });
            if ($scope.roleLevel.parentRoleLevelId > 0) {
                $scope.parentRoleLevels = $scope.roleLevels;
                var index = _.findIndex($scope.roleLevels, function (item) {
                    return item.id == roleLevelId;
                });
                if (index > -1) {
                    $scope.parentRoleLevels.splice(index, 1);
                }
            }
            else {
                $scope.parentRoleLevels = [];
            }
        }
        $scope.DeleteRoleLevel = function (roleLevelId) {
            if (roleLevelId > 0) {
                dialogService.showYesNoDialog($translate.instant('COMMON_CONFIRM'), $translate.instant('COMMON_ARE_YOU_SURE_YOU_WANT_TO_DELETE')).then(
                    function () {
                        roleLevelService.deleteRoleLevel(roleLevelId).then(function (data) {
                            if (data > 0) {
                                $scope.roleLevel.id = 0;
                                $scope.roleLevel.name = "";
                                $scope.roleLevel.parentRoleLevelId = null;
                                $scope.organizationChanged();
                                dialogService.showNotification($translate.instant('ROLELEVEL_ROLE_LEVEL_DELETED_SUCCESSFULLY'), "success");
                            }
                            else if (data < 0) {
                                dialogService.showNotification($translate.instant('ROLELEVEL_YOU_CAN_NOT_DELETE_ROLE_LEVEL_IS_ALREADY_IN_USE'), "error");
                            }
                            else {
                                dialogService.showNotification($translate.instant('ROLELEVEL_ROLE_LEVEL_DELETE_FAILED'), "error");
                            }
                        });
                    },
                    function () {
                        //alert('No clicked');
                    });
            }
        }
        $scope.checkRoleLevelName = function () {
            var index = 0;
            if ($scope.roleLevel.id > 0) {
                var index = _.findIndex($scope.roleLevels, function (item) {
                    return item.name.toLowerCase() == $scope.roleLevel.name.toLowerCase() && item.id != $scope.roleLevel.id;
                });
            }
            else {
                index = _.findIndex($scope.roleLevels, function (item) {
                    return item.name.toLowerCase() == $scope.roleLevel.name.toLowerCase();
                });
            }
            if (index > -1) {
                $scope.formRoleLevel["roleLevel_name"].$setValidity('validName', false);
            }
            else {
                $scope.formRoleLevel["roleLevel_name"].$setValidity('validName', true);
            }
        }
        $scope.SetPermission = function (roleLevelId, organizationId) {
            if (roleLevelId > 0 && organizationId > 0) {
                $location.path("/home/roleLevel/setPermission/" + organizationId + "/" + roleLevelId);
            }
        }

        if ($scope.currentUser) {
            $scope.roleLevel.organizationId = $scope.currentUser.organizationId;
            if ($scope.currentUser.isSuperAdmin) {
                $scope.organizations = organizations;
            }
            else {
                $scope.organizations = _.filter(organizations, function (item) {
                    return item.id != 0;
                });

                $scope.organizationChanged();
            }
        }
    }])