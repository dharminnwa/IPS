angular.module('ips.roleLevel')
    .config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
        var baseRoleLevelTemplateResolve = {
            pageName: function ($translate) {
                return $translate.instant('ROLELEVEL_ROLE_LEVEL_TEMPLATE');
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
                    data.unshift({ id: 0, name: "-- " + $translate.instant('ROLELEVEL_CREATE_NEW_TEMPLATE') + " --" })
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
            .state('home.roleLevel.roleLevelPermissionTemplate', {
                url: "/roleLevelPermissionTemplate",
                templateUrl: "views/roleLevel/views/roleLevelPermissionTemplate.html",
                controller: "roleLevelPermissionTemplateCtrl",
                resolve: baseRoleLevelTemplateResolve,
                data: {
                    displayName: '{{pageName}}',//'Role Level Template',
                    paneLimit: 1,
                    depth: 2,
                    resource: "Security"
                }
            });
    }])
    .controller('roleLevelPermissionTemplateCtrl', ['$scope', 'cssInjector', 'dialogService', 'roleLevelPermissionTemplateService', 'resources', 'operations', 'permissionTemplates', 'resourceDepedencies', '$translate', function ($scope, cssInjector, dialogService, roleLevelPermissionTemplateService, resources, operations, permissionTemplates, resourceDepedencies, $translate) {

        cssInjector.removeAll();
        //cssInjector.add('css/components.min.css');
        //cssInjector.add('css/default.min.css');
        $scope.roleLevelPermissionTemplate = {
            id: 0,
            name: "",
            resourcePermissions: []
        };
        $scope.resourcePermissions = [];
        $scope.resourcePermission = {
            Id: 0,
            ResourceId: 0,
            OperationId: 0,
            PermissionTemplateId: 0,
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
        $scope.setPermission = function (resourceId, operationId, event) {
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

                                        var isDependentResourcehasDependency = false;
                                        $(".chkPermission[data-resourceid='" + item.dependentResourceId + "']").each(function (index, el) {
                                            if ($(el).data("operationid") != readOperation.id) {
                                                if ($(el).is(":checked")) {
                                                    isDependentResourcehasDependency = true;
                                                    return (false);
                                                }
                                            }
                                        });
                                        if (!isDependentResourcehasDependency) {
                                            $(".chkPermission[data-resourceid='" + item.dependentResourceId + "'][data-operationid='" + item.operationId + "']").prop("checked", false);
                                            $(".chkPermission[data-resourceid='" + resourceId + "'][data-operationid='" + readOperation.id + "']").prop("checked", false)
                                        }
                                        
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
        $scope.checkkAll = function (operationId, event) {
            if ($(event.target).is(":checked")) {
                _.each($scope.resources, function (item) {
                    if ($(".chkPermissionTD[data-resourceid='" + item.id + "'][data-operationid='" + operationId + "']").find(".chkPermission").length > 0) {
                        if ($(".chkPermissionTD[data-resourceid='" + item.id + "'][data-operationid='" + operationId + "']").find(".chkPermission").is(":checked")) {
                            var index = _.findIndex($scope.resourcePermissions, function (resourcePermissionsItem) {
                                return resourcePermissionsItem.operationId == operationId && resourcePermissionsItem.resourceid == item.id;
                            });
                            if (!(index > -1)) {
                                $scope.resourcePermissions.push({
                                    resourceId: item.id,
                                    operationId: operationId,
                                });
                            }
                        }
                        else {
                            $(".chkPermissionTD[data-resourceid='" + item.id + "'][data-operationid='" + operationId + "']").find(".chkPermission").prop("checked", true);
                            $scope.resourcePermissions.push({
                                resourceId: item.id,
                                operationId: operationId,
                            });
                        }
                    }
                });

            }
            else {
                var filtered = _.filter($scope.resourcePermissions, function (item) {
                    return item.operationId == operationId;
                });
                if (filtered.length > 0) {
                    _.each(filtered, function (item) {
                        if ($(".chkPermissionTD[data-resourceid='" + item.resourceId + "'][data-operationid='" + item.operationId + "']").find(".chkPermission").length > 0) {
                            $(".chkPermissionTD[data-resourceid='" + item.resourceId + "'][data-operationid='" + item.operationId + "']").find(".chkPermission").prop("checked", false);
                        }
                    })
                    $scope.resourcePermissions = _.filter($scope.resourcePermissions, function (item) {
                        return item.operationId != operationId;
                    });;
                }
            }
        }
        $scope.permissionTemplateChanged = function () {
            $scope.roleLevelPermissionTemplate.name = "";
            $scope.resourcePermissions = [];
            $(".chkPermission").prop("checked", false);
            if ($scope.roleLevelPermissionTemplate.id > 0) {
                LoadTemplatePermissionsByTemplateId($scope.roleLevelPermissionTemplate.id)
            }
        }
        $scope.SaveRoleLevelPermissionTemplate = function () {
            if ($scope["formRoleLevelPermissionTemplate"].$valid) {
                $scope.permissions = [];
                $(".chkPermission:checked").each(function (i, element) {
                    $scope.permissions.push({
                        operationId: $(element).data("operationid"),
                        resourceId: $(element).data("resourceid"),
                    });
                });
                if ($scope.permissions.length > 0) {
                    $scope.roleLevelPermissionTemplate.resourcePermissions = $scope.permissions;
                    roleLevelPermissionTemplateService.saveRoleLevelPermissionTemplate($scope.roleLevelPermissionTemplate).then(function (data) {
                        if (data > 0) {
                            dialogService.showNotification($translate.instant('ROLELEVEL_PERMISSION_TEMPLATE_SAVED_SUCCESSFULLY'), "success");
                            reloadPermissionTemplates();
                        }
                        else {
                            dialogService.showNotification($translate.instant('ROLELEVEL_PERMISSION_TEMPLATE_SAVE_FAILED'), "error");
                        }
                    });
                }
                else {
                    dialogService.showNotification($translate.instant('ROLELEVEL_SET_ANY_RESOURCE_PERMISSION'), "error");
                }
            }
        };
        $scope.ClearRoleLevelPermissionTemplate = function () {
            $scope.roleLevelPermissionTemplate = {
                id: 0,
                name: "",
                resourcePermissions: []
            };
            $scope.resourcePermissions = [];
            $(".chkPermission").prop("checked", false);
        };

        function LoadTemplatePermissionsByTemplateId(templateId) {
            $scope.resourcePermissions = [];
            roleLevelPermissionTemplateService.getRoleLevelPermissionTemplateById(templateId).then(function (data) {
                //if()
                if (data) {
                    $scope.roleLevelPermissionTemplate = data;
                    $scope.resourcePermissions = data.resourcePermissions;
                }
                _.each(data.resourcePermissions, function (item) {
                    if ($(".chkPermissionTD[data-resourceid='" + item.resourceId + "'][data-operationid='" + item.operationId + "']").find(".chkPermission").length > 0) {
                        $(".chkPermissionTD[data-resourceid='" + item.resourceId + "'][data-operationid='" + item.operationId + "']").find(".chkPermission").prop("checked", true);
                    }
                });
            });
        }
        function reloadPermissionTemplates() {
            roleLevelPermissionTemplateService.getRoleLevelPermissionTemplates().then(function (data) {
                data.unshift({
                    id: 0, name: "-- " + $translate.instant('ROLELEVEL_CREATE_NEW_TEMPLATE') + " --"
                })
                $scope.permissionTemplates = data;
            })
        }
    }])