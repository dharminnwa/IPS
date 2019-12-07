'use strict';
angular.module('ips.homeland', ['ui.router', 'kendo.directives', 'growing-panes'])

    .config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
        var baseSecurityPageResolve = {
            Security: function ($translate) {
                return $translate.instant('LEFTMENU_SECURITY');
            }
        };
        $stateProvider
            .state('home.homeland.security', {
                url: "/security",
                templateUrl: "views/homeland/security.html",

                controller: "securityCtrl",
                resolve: baseSecurityPageResolve,
                data: {
                    displayName: '{{Security}}', //'Security',
                    paneLimit: 1,
                    depth: 2
                }
            })


    }]).filter('getOrganization', function () {
        return function (id, organizations) {
            var organizationName;
            angular.forEach(organizations, function (val, key) {
                if (val.id == id) {
                    organizationName = val.name;
                }
            })
            return organizationName;
        }
    }).filter('filterOrganization', function () {
        return function (roles, organization) {
            var resultOrganization = [];
            if (organization) {
                angular.forEach(roles, function (val, key) {
                    if (val.organizationId == organization) {
                        if (resultOrganization.indexOf(val) == -1) {
                            resultOrganization.push(val);
                        }
                    }
                })
                return resultOrganization;
            }
            return roles;
        }

    }).directive('tdHref', ['apiService', '$compile', function (apiService, $compile) {
        return {
            restrict: 'EA',
            scope: {
                roleId: '=tdHref'
            },
            link: function (scope, elem) {

                elem.css('cursor', 'pointer');
                elem.on('click', function () {
                    $("tr").removeClass("k-state-selected");
                    elem.addClass("k-state-selected");
                    scope.$parent.$parent.getPermittions(scope.roleId);
                })
            }
        }
    }])
    .controller('securityCtrl', ['$scope', '$location', 'authService', 'apiService', '$window', '$rootScope', 'cssInjector', '$compile', '$filter', 'organizations', '$translate', function ($scope, $location, authService, apiService, $window, $rootScope, cssInjector, $compile, $filter, organizations, $translate) {
        cssInjector.removeAll();
        cssInjector.add('views/homeland/custom.css');
        cssInjector.add('views/homeland/select2.css');
        $scope.apiName = 'RolePermission';
        $scope.users = [];
        $scope.selectedUser = { id: -1, userOrganizations: [] };
        $scope.RolePermitions = [];
        $scope.roles = [];
        organizations.then(function (data) {
            $scope.organizations = data;
        })

        $scope.userOrganization = -1;
        $scope.selectedUserOrganization = -1;
        $scope.userTypes = [];
        $scope.role = {
            name: "",
            organization: { value: 0, text: $translate.instant('SECURITY_ALL_ORGANIZATIONS') }
        };

        $('[multiple]').select2();
        //#region Users Tab
        $scope.getPermittions = function (id) {
            apiService.getById('RolePermission', id).then(function (data) {
                $scope.RolePermitions = data;
                console.log($scope);

            });
        }
        $scope.allRoles = [];


        $scope.filterRolesOrganization = function (roleItem) {
            if (roleItem.organizationId == $scope.selectedUserOrganization) {
                return true;
            } else {
                return false;
            }
        };
        $scope.$watch('permission.organization', function () {
            apiService.getById('departments/getDepartmentsByOrgId', $scope.permission.organization).then(function (data) {

                $scope.departments = data;
            })
        })
        $scope.$watch('permission.department', function () {
            apiService.getById('teams/getTeamsByDepartmentId/' + $scope.permission.organization, $scope.permission.department).then(function (data) {
                $scope.teams = data;
            })
        })
        console.log($scope);
        $scope.filterRolesFn = function (roleItem) {
            // Do some tests
            var res = true;

            res = $scope.filterRolesOrganization(roleItem);

            if (roleItem.organizationId == 0) {
                res = true;
            }

            angular.forEach($scope.selectedUser.roles, function (obj) {
                if ((roleItem.id == obj.roleId) && (obj.organizationId == $scope.selectedUserOrganization)) {
                    res = false;
                }
            });
            return res;
        };

        $scope.addRoleToUser = function (role) {
            $scope.selectedUser.roles.push({
                name: role.name,
                organizationId: $scope.selectedUserOrganization,
                roleId: role.id,
                userId: $scope.selectedUser.id
            });
        }

        $scope.removeRoleFromUser = function (role) {
            var index = $scope.selectedUser.roles.indexOf(role);
            $scope.selectedUser.roles.splice(index, 1);
        }



        apiService.getAll("userType?$select=Id,UserType1&$orderby=UserType1").then(function (data) {
            angular.forEach(data, function (obj) {
                $scope.userTypes.push({
                    text: obj.userType1,
                    value: obj.id
                })
            });

            console.log("Found userTypes: " + $scope.userTypes.length);

            var rowColumns = [];
            rowColumns.push({ field: "remarks", title: $translate.instant('SECURITY_LOGIN'), width: "250px" })
            rowColumns.push({ field: "name", title: $translate.instant('COMMON_NAME'), width: "250px" })
            rowColumns.push({ field: "userTypeId", title: $translate.instant('SECURITY_USER_TYPE'), width: "250px", values: $scope.userTypes })
            rowColumns.push({ field: "organizationId", title: $translate.instant('COMMON_ORGANIZATION'), width: "250px", values: $scope.organizations })

            var gridUsersOptions = {
                dataSource: {
                    type: "json",
                    transport: {
                        read: function (options) {
                            kendo.ui.progress($(".ips-security-content"), true);

                            apiService.getAll("user?$orderby=Remarks").then(function (data) {
                                angular.forEach(data, function (obj) {
                                    obj.name = obj.firstName + ' ' + obj.lastName;
                                });
                                $scope.users = new kendo.data.ObservableArray(data);
                                options.success($scope.users);
                                kendo.ui.progress($(".ips-security-content"), false);
                                console.log("Found users: " + $scope.users.length);
                            });
                        }
                    },
                    pageSize: 10,
                    schema: {
                        model: {
                            id: "id",
                            fields: {
                                id: { field: "id", type: "number" },
                                remarks: { field: "remarks", type: "string" },
                                name: { field: "name", type: "string" },
                                userTypeId: { field: "userTypeId", type: "number", defaultValue: 0 },
                                organizationId: { field: "organizationId", type: "number", defaultValue: 0 },
                            }
                        }
                    }
                },
                sortable: true,
                pageable: true,
                groupable: true,
                change: function onRolesRowSelected(arg) {
                    var grid = arg.sender;
                    var selectedData = grid.dataItem(grid.select());
                    $scope.onUserRowSelected(selectedData.userKey);
                },
                filterable: {
                    mode: "row"
                },
                selectable: "row",
                dataBound: function () {

                },
                columns: rowColumns
            };

            $("#usersGrid").kendoGrid(gridUsersOptions);
        });

        $scope.onUserRowSelected = function (userId) {
            apiService.getAll("IpsUser?$filter=Id eq '" + userId + "'").then(function (data) {
                $scope.selectedUser = data[0];
                $scope.selectedUser.userOrganizations = $filter('unique')($scope.selectedUser.roles, "organizationId");
                $scope.showUserRoles();
            });
        };

        $scope.addNewOrganization = function (id) {
            if ($scope.selectedUser.userOrganizations.indexOf(id) == -1) {
                $scope.selectedUser.userOrganizations.push(id);
                $scope.showUserRoles();
            }
        }

        $scope.showUserRoles = function () {
            if ($scope.selectedUser) {

                $scope.organizationsTabs = [];

                angular.forEach($scope.selectedUser.userOrganizations, function (orgId) {
                    var org = $scope.organizations.filter(function (item) {
                        if (item.value == orgId) {
                            return item
                        }
                    })[0];

                    $scope.organizationsTabs.push({ title: org.text, contentUrl: "../app/views/security/security.user.roles.html?id=" + org.value, content: "<ng-include src='security.user.roles.html' ></ng-include>", id: org.value });
                });

                angular.forEach($scope.selectedUser.roles, function (obj) {
                    var org = $scope.allRoles.filter(function (item) {
                        if (item.id == obj.roleId) {
                            obj.name = item.name;
                        }
                    })[0];
                });

                var tabstrip = $("#organizationsTabs").kendoTabStrip({
                    select: function (arg) {
                        var x = arg.item;
                        var index = $(arg.item).index();
                        $scope.selectedUserOrganization = $scope.selectedUser.userOrganizations[index];
                        if (!$scope.$$phase) $scope.$apply();
                    },
                    contentLoad: function (arg) {
                        $compile(arg.contentElement)($scope);
                        $scope.$apply();
                    },
                    tabPosition: "left",
                    dataTextField: "title",
                    dataContentUrlField: "contentUrl",
                    //dataContentField: "content",
                    dataSource: $scope.organizationsTabs,
                    animation: { open: { effects: "fadeIn" } }
                }).data('kendoTabStrip');

                tabstrip.select(0);
            }
        }

        function getById(id, myArray) {
            return myArray.filter(function (obj) {
                if (obj.id == id) {
                    return obj
                }
            })[0]
        }

        $scope.saveUserRoles = function () {
            return apiService.update('IpsUser', $scope.selectedUser).then(function (data) {
                $scope.notificationSavedSuccess.show($translate.instant('SECURITY_USER_ROLES_SAVED_SUCCESSFULLY'), "info");
            });
        }

        //#endregion Users Tab

        $scope.getRoles = function () {
            apiService.getAll("role?$orderby=Name").then(function (data) {
                $scope.roles = data;

                console.log($scope.roles);
            });
        }
        //#region Role Tab

        $scope.gridRolesOptions = {
            dataSource: {
                type: "json",
                transport: {
                    read: function (options) {
                        kendo.ui.progress($("#grid"), true);
                        apiService.getAll("role?$orderby=Name").then(function (data) {
                            $scope.roles = new kendo.data.ObservableArray(data);
                            options.success($scope.roles);
                            kendo.ui.progress($("#grid"), false);
                        });
                    }
                },
                pageSize: 10,
                schema: {
                    model: {
                        id: "id",
                        fields: {
                            id: { editable: false, nullable: false },
                            name: { validation: { required: true } },
                            organizationId: { field: "organizationId", type: "number", defaultValue: 0 }
                        }
                    }
                }
            },
            filterable: {
                mode: "row"
            },
            change: function onRolesRowSelected(arg) {
                var grid = arg.sender;
                var selectedData = grid.dataItem(grid.select());
                $scope.onRolesRowSelected(selectedData.id);
            },
            sortable: true,
            pageable: true,
            selectable: "row",
            columns: [
                { field: "name", title: $translate.instant('COMMON_ROLE'), width: "120px" },
                { field: "organizationId", title: $translate.instant('COMMON_ORGANIZATION'), width: "120px", values: $scope.organizations }],
            //rowTemplate: "<tr class='roles-row' ng-click='onRolesRowSelected(dataItem.id)' data-uid='#: uid #'>" +
            //     "<td>{{dataItem.name}}</td>" +
            //     "<td>{{dataItem.organizationId}}</td>" +
            //"</tr>"
        };

        $scope.addRole = function () {
            var role = { id: -1, name: $scope.role.name, organizationId: $scope.role.organization.value }
            apiService.add("role", role).then(function (data) {
                role.id = data;
                $scope.notificationSavedSuccess.show($translate.instant('SECURITY_ROLE_ADDED_SUCCESFULLY'), "info");
                $scope.roles.push(role);

                $scope.role.id = -1;
                $scope.role.name = "";
                $scope.role.organization = $scope.organizations[0];
            });

        }

        $scope.onRolesRowSelected = function (roleId) {

            $(".ips-rolePermitions").show();
            kendo.ui.progress($("#tabData"), true);
            $scope.RolePermitions = [];
            apiService.getById($scope.apiName, roleId).then(function (data) {
                $scope.RolePermitions = data;
                kendo.ui.progress($("#tabData"), false);
            });
        }

        $scope.saveRolePermitions = function () {
            apiService.update($scope.apiName, $scope.RolePermitions).then(function (data) {
                $scope.notificationSavedSuccess.show($translate.instant('SECURITY_ROLE_PERMITIONS_SAVED_SUCCESSFULLY'), "info");
            });
        }

        $scope.changedCRUD = function (permition) {
            permition.isCreate = permition.CRUD;
            permition.isRead = permition.CRUD;
            permition.isUpdate = permition.CRUD;
            permition.isDelete = permition.CRUD;
        }

        //#endregion  Role Tab

        $scope.notificationOptions = {
            position: {
                top: 30,
                right: 30
            }
        }

        function ifError(err) {
            if (err.error_description != undefined) {
                $scope.message = err.error_description;
            }
            else {
                $scope.message = err;
            }

            $scope.$apply();
        }

    }]);