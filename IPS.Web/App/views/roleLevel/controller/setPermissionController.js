angular.module('ips.roleLevel')
    .config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
        var baseRoleSetPermissionResolve = {
            pageName: function ($translate) {
                return $translate.instant('LEFTMENU_ROLE_LEVELS');
            },
            organizations: function (roleLevelService) {
                return roleLevelService.getOrganizations().then(function (data) {
                    return data;
                });
            },
            resources: function (roleLevelPermissionTemplateService) {
                return roleLevelPermissionTemplateService.getResources().then(function (data) {
                    return data;
                })
            },
            operations: function (roleLevelPermissionTemplateService) {
                return roleLevelPermissionTemplateService.getOperations().then(function (data) {
                    return data;
                })
            },
            permissionTemplates: function (roleLevelPermissionTemplateService, $translate) {
                return roleLevelPermissionTemplateService.getRoleLevelPermissionTemplates().then(function (data) {
                    data.unshift({ id: null, name: "-- " + $translate.instant('ROLELEVEL_SELECT_TEMPLATE') + " --" });
                    return data;
                })
            },
            permissionsLevels: function (roleLevelPermissionService) {
                return roleLevelPermissionService.getAllPermissionsLevels().then(function (data) {
                    return data;
                })
            },
            resourceDepedencies: function (roleLevelPermissionService) {
                return roleLevelPermissionService.getResourceDepedencies().then(function (data) {
                    return data;
                })
            }
        };
        $stateProvider
            .state('home.roleLevel.setPermission', {
                url: "/setPermission/:organizationId/:roleLevelId",
                templateUrl: "views/roleLevel/views/setPermission.html",
                controller: "setPermissionCtrl",
                resolve: baseRoleSetPermissionResolve,
                data: {
                    displayName: '{{pageName}}',//'Role Levels',
                    paneLimit: 1,
                    depth: 2,
                    resource: "Security"
                }
            });
    }])
    .controller('setPermissionCtrl', ['$scope', 'cssInjector', 'authService', 'dialogService', '$compile', '$stateParams', 'roleLevelService', 'roleLevelPermissionTemplateService', 'organizations', 'resources', 'operations', 'permissionTemplates', 'roleLevelPermissionService', 'permissionsLevels', 'resourceDepedencies', '$translate', function ($scope, cssInjector, authService, dialogService, $compile, $stateParams, roleLevelService, roleLevelPermissionTemplateService, organizations, resources, operations, permissionTemplates, roleLevelPermissionService, permissionsLevels, resourceDepedencies, $translate) {

        $scope.authentication = authService.authentication;
        $scope.currentUser = $scope.authentication.user;
            
        if ($scope.currentUser) {
            if ($scope.currentUser.isSuperAdmin) {
                $scope.organizations = organizations;
            }
            else {
                $scope.organizations = _.filter(organizations, function (item) {
                    return item.id != 0;
                });
            }
        }
        $scope.operations = _.filter(operations, function (item) {
            return item.isPageLevel == false;
        });
        $scope.pageOperations = _.filter(operations, function (item) {
            return item.isPageLevel == true;
        });
        $scope.resources = _.filter(resources, function (item) {
            return item.isPage == false;
        });
        $scope.pageResources = _.filter(resources, function (item) {
            return item.isPage == true;
        });
        $scope.permissionTemplates = permissionTemplates;
        $scope.permissionsLevels = permissionsLevels;
        $scope.roleLevel = {
            organizationId: 0,
            roleLevelId: 0
        }
        $scope.permissionTemplateId = null;
        $scope.roleLevels = [];

        if ($stateParams.organizationId > 0 && $stateParams.roleLevelId > 0) {
            $scope.roleLevel = {
                organizationId: parseInt($stateParams.organizationId),
                roleLevelId: parseInt($stateParams.roleLevelId)
            }
            roleLevelService.getRoleLevelsByOrganizationId($stateParams.organizationId).then(function (data) {
                $scope.roleLevels = data;
            });
        }

        $scope.permissionTemplatesChange = function () {
            $(".chkPermission").prop("checked", false);
            if ($scope.permissionTemplateId > 0) {
                roleLevelPermissionTemplateService.getRoleLevelPermissionTemplateById($scope.permissionTemplateId).then(function (data) {
                    _.each(data.resourcePermissions, function (item) {
                        if ($(".chkPermissionTD[data-resourceid='" + item.resourceId + "'][data-operationid='" + item.operationId + "']").find(".chkPermission").length > 0) {
                            $(".chkPermissionTD[data-resourceid='" + item.resourceId + "'][data-operationid='" + item.operationId + "']").find(".chkPermission").prop("checked", true);
                        }
                    });
                });
            }
        }
        $scope.organizationChanged = function () {
            if (!$scope.roleLevel.organizationId) {
                $scope.roleLevel.organizationId = 0;
            }
            roleLevelService.getRoleLevelsByOrganizationId($scope.roleLevel.organizationId).then(function (data) {
                $scope.roleLevels = data;
            });

            roleLevelService.getRolesByOrganizationId($scope.roleLevel.organizationId).then(function (data) {
                $scope.roles = data;
            })


        }
        $scope.roleLevelChanged = function () {
            //$scope.roleLevel.roleLevelId
            $scope.roles = [];
            $scope.permissionLevelId = null;
            $(".chkPermission").prop("checked", false);
            roleLevelService.getRolesByLevelId($scope.roleLevel.roleLevelId).then(function (data) {
                $scope.roles = data;
            });
            roleLevelPermissionService.getRoleLevelPermissionsByLevelId($scope.roleLevel.roleLevelId).then(function (data) {
                $scope.permissions = data;
                $(".chkPermission").prop("checked", false);
                _.each(data, function (item) {
                    $(".chkPermission[data-resourceid='" + item.resourceId + "'][data-operationid='" + item.operationId + "']").prop("checked", true);
                })
            });

            roleLevelPermissionService.getAdvancePermissionsByLevelId($scope.roleLevel.roleLevelId).then(function (data) {
                $scope.permissionLevelId = data.permissionLevelId;
            })
        }

        $scope.saveRoleLevelPermission = function () {
            $scope.permissions = [];
            $(".chkPermission:checked").each(function (i, element) {
                $scope.permissions.push({
                    levelId: $scope.roleLevel.roleLevelId,
                    operationId: $(element).data("operationid"),
                    resourceId: $(element).data("resourceid"),
                });
            });
            roleLevelPermissionService.saveRoleLevelPermission($scope.roleLevel.roleLevelId, $scope.permissions).then(function (data) {
                if (data) {
                    dialogService.showNotification($translate.instant('ROLELEVEL_ROLE_LEVEL') + " - " + $translate.instant('ROLELEVEL_RESOURCE_PERMISSION_SAVED_SUCCESSFULLY'), "success");
                }
                else {
                    dialogService.showNotification($translate.instant('ROLELEVEL_ROLE_LEVEL') + " - " + $translate.instant('ROLELEVEL_RESOURCE_PERMISSION_SAVE_FAILED'), "error");
                }
            })
        }

        $scope.saveAdvancePermission = function () {
            roleLevelPermissionService.saveAdvancePermission($scope.roleLevel.roleLevelId, $scope.permissionLevelId).then(function (data) {
                if (data) {
                    dialogService.showNotification($translate.instant('ROLELEVEL_ROLE_LEVEL') + " - " + $translate.instant('ROLELEVEL_ADVANCE_PERMISSION_SAVED_SUCCESSFULLY'), "success");
                }
                else {
                    dialogService.showNotification($translate.instant('ROLELEVEL_ROLE_LEVEL') + " - " + $translate.instant('ROLELEVEL_ADVANCE_PERMISSION_SAVE_FAILED'), "error");
                }
            });
        }
        $scope.setRoleLevelPermission = function (resourceId, operationId, $event) {
            var readOperation = _.find($scope.operations, function (item) {
                return item.name == "Read";
            });

            if (readOperation) {
                if (operationId != readOperation.id) {
                    if (!$(".chkPermission[data-operationid='" + readOperation.id + "'][data-resourceid='" + resourceId + "']").is(":checked")) {
                        $(".chkPermission[data-operationid='" + readOperation.id + "'][data-resourceid='" + resourceId + "']").prop("checked", true);
                    }
                }
                else {
                    if (!$(event.target).is(":checked")) {
                        $(".chkPermission[data-resourceid='" + resourceId + "']").each(function (index, el) {
                            if ($(el).data("operationid") != operationId) {
                                if ($(el).is(":checked")) {
                                    $(event.target).prop("checked", true);
                                    dialogService.showNotification("You can't uncheck read permission as it has other depedent permission given", "warning");
                                    return (false);
                                }
                            }
                        });
                    }
                }
            }
            if ($(event.target).is(":checked")) {
                var filterDependencies = _.filter(resourceDepedencies, function (item) {
                    return item.resourceId == resourceId;
                });
                if (filterDependencies.length > 0) {
                    _.each(filterDependencies, function (item) {
                        if (!$(".chkPermission[data-resourceid='" + item.dependentResourceId + "'][data-operationid='" + readOperation.id + "']").is(":checked")) {
                            $(".chkPermission[data-resourceid='" + item.dependentResourceId + "'][data-operationid='" + readOperation.id + "']").prop("checked", true);
                        }
                    })
                }
            }
            else {
                var filterDependencies = _.filter(resourceDepedencies, function (item) {
                    return item.dependentResourceId == resourceId;
                });
                var isDepedencyExist = false;
                if (filterDependencies.length > 0) {
                    _.each(filterDependencies, function (item) {
                        $(".chkPermission[data-resourceid='" + item.resourceId + "']").each(function (index, el) {
                            if ($(el).is(":checked")) {
                                $(event.target).prop("checked", true);
                                isDepedencyExist = true;
                                dialogService.showNotification("You can't uncheck read permission as it has other depedent permission given", "warning");
                                return (false);
                            }
                        });
                    });
                }
                if (!isDepedencyExist) {
                    var filterDependencies = _.filter(resourceDepedencies, function (item) {
                        return item.resourceId == resourceId;
                    });
                    if (filterDependencies.length > 0) {
                        _.each(filterDependencies, function (item) {
                            var otherDependentResoureces = _.filter(resourceDepedencies, function (dataItem) {
                                return dataItem.dependentResourceId == item.dependentResourceId && dataItem.resourceId != resourceId;
                            });
                            if (otherDependentResoureces.length > 0) {
                                var isOtherDependencyApplied = false;
                                _.each(otherDependentResoureces, function (dataItem) {
                                    $(".chkPermission[data-resourceid='" + dataItem.resourceId + "']").each(function (index, el) {
                                        if ($(el).data("operationid") != readOperation.id) {
                                            if ($(el).is(":checked")) {
                                                isOtherDependencyApplied = true;
                                                return (false);
                                            }
                                        }
                                    });
                                    if (isOtherDependencyApplied) {
                                        return (false);
                                    }
                                })
                                if (!isOtherDependencyApplied) {
                                    if ($(".chkPermission[data-resourceid='" + item.dependentResourceId + "'][data-operationid='" + item.operationId + "']").is(":checked")) {
                                        $(".chkPermission[data-resourceid='" + item.dependentResourceId + "'][data-operationid='" + item.operationId + "']").prop("checked", false);
                                        $(".chkPermission[data-resourceid='" + resourceId + "'][data-operationid='" + readOperation.id + "']").prop("checked", false)
                                    }
                                }
                            }
                            else {
                                var isOtherDependencyApplied = false;
                                $(".chkPermission[data-resourceid='" + item.dependentResourceId + "']").each(function (index, el) {
                                    if ($(el).data("operationid") != readOperation.id) {
                                        if ($(el).is(":checked")) {
                                            isOtherDependencyApplied = true;
                                            return (false);
                                        }
                                    }
                                });
                                if (!isOtherDependencyApplied) {
                                    if ($(".chkPermission[data-resourceid='" + item.dependentResourceId + "'][data-operationid='" + item.operationId + "']").is(":checked")) {
                                        $(".chkPermission[data-resourceid='" + item.dependentResourceId + "'][data-operationid='" + item.operationId + "']").prop("checked", false);
                                        $(".chkPermission[data-resourceid='" + resourceId + "'][data-operationid='" + readOperation.id + "']").prop("checked", false)
                                    }
                                }

                            }

                        })
                    }
                }
            }

        }

        function getResourceName(resourceId) {
            var resourceObj = _.find(resources, function (item) {
                return item.id == resourceId;
            });
            if (resourceObj) {
                return resourceObj.name;
            }
            else {
                return resourceId
            }
        }
        $scope.getResourceDependencyTree = function (resourceId) {

            var uniqueResources = _.uniq(_.map(resourceDepedencies, function (item) {
                return item.resourceId;
            }));

            var obj = [];
            _.each(uniqueResources, function (uniqueResourceItem) {
                var mainObj = {
                    resourceId: uniqueResourceItem,
                    resourceName: getResourceName(uniqueResourceItem),
                    depedencies: [],
                };
                var dependentResources = _.filter(resourceDepedencies, function (item) {
                    return item.resourceId == uniqueResourceItem;
                });
                _.each(dependentResources, function (item) {
                    var objdepedent = {
                        dependentResourceId: item.dependentResourceId,
                        dependentResourceName: getResourceName(item.dependentResourceId)
                    }
                    mainObj.depedencies.push(objdepedent)
                })
                obj.push(mainObj);
            })



            var inline = new kendo.data.HierarchicalDataSource({
                data: obj,
                schema: {
                    model: {
                        children: "depedencies"
                    }
                }
            });
            $("#permission-treeview").kendoTreeView({
                dataSource: inline,
                dataTextField: ["resourceName", "dependentResourceName"]
            });
        }
        $scope.checkkAll = function (operationId, event) {
            if ($(event.target).is(":checked")) {
                $(".chkPermission[data-operationid='" + operationId + "']").prop("checked", true);
            }
            else {
                $(".chkPermission[data-operationid='" + operationId + "']").prop("checked", false);
            }
        }
        $scope.getResourceDependencyTree(5);
    }]);