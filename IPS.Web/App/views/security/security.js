'use strict';

angular.module('ips.organization.security', ['ui.router', 'kendo.directives', 'growing-panes'])

    .config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
        var baseSecurityResolve = {
            pageName: function ($translate) {
                return $translate.instant('LEFTMENU_SECURITY');
            },
            organizations: function (dashboardsService) {
                return dashboardsService.getOrganizations('&$orderby=Name').then(function (data) {
                    data.unshift({ id: 0, name: "-- No Organization --" });
                    var organization = [];
                    if (data) {
                        for (var i = 0, len = data.length; i < len; i++) {
                            organization.push({
                                text: data[i].name,
                                value: data[i].id
                            })
                        }
                    }
                    return organization;
                });
            },
            roleLevels: function (apiService) {
                return apiService.getAll('/rolelevels/all').then(function (data) {
                    var roleLevels = [];
                    if (data) {
                        for (var i = 0, len = data.length; i < len; i++) {
                            roleLevels.push({
                                text: data[i].name,
                                value: data[i].id
                            })
                        }
                    }
                    return roleLevels;
                });
            }
        };
        $stateProvider
            .state('home.administration.security', {
                url: "/security",
                templateUrl: "views/security/security.html",
                controller: "SecurityCtrl",
                resolve: baseSecurityResolve,
                data: {
                    displayName: '{{pageName}}',//'Security',
                    paneLimit: 1,
                    depth: 2,
                    resource: "Security"
                }
            });
    }])

    .controller('SecurityCtrl', ['$scope', '$location', 'authService', 'apiService', '$window', '$rootScope', 'cssInjector', '$compile', '$filter', 'organizations', 'roleLevels', '$translate', function ($scope, $location, authService, apiService, $window, $rootScope, cssInjector, $compile, $filter, organizations, roleLevels, $translate) {
        cssInjector.removeAll();
        cssInjector.add('views/security/security.css');
        $scope.authentication = authService.authentication;
        $scope.currentUser = $scope.authentication.user;

        $scope.apiName = 'RolePermission';
        $scope.users = [];
        $scope.selectedUser = { id: -1, userOrganizations: [] };
        $scope.RolePermitions = [];
        $scope.roles = [];
        $scope.organizations = organizations;
        $scope.allRoleLevels = roleLevels;
        $scope.userOrganization = -1;
        $scope.selectedUserOrganization = -1;
        $scope.userTypes = [];
        $scope.role = {
            name: "",
            organization: { value: 0, text: $translate.instant('SECURITY_ALL_ORGANIZATIONS') },
            roleLevelId: null,
        };


        //#region Users Tab

        $scope.allRoles = [];
        apiService.getAll("role?$orderby=Name").then(function (data) {
            $scope.allRoles = data;
        });

        $scope.filterRolesOrganization = function (roleItem) {
            if (roleItem.organizationId == $scope.selectedUserOrganization) {
                return true;
            } else {
                return false;
            }
        };

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

        $scope.role.organization = $scope.organizations[0];
        
        $scope.userOrganization = $scope.organizations[0].value;
        console.log("Found dorganizations: " + $scope.organizations.length);

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
        console.log($scope);
        $scope.saveUserRoles = function () {
            return apiService.update('IpsUser', $scope.selectedUser).then(function (data) {
                $scope.notificationSavedSuccess.show($translate.instant('SECURITY_USER_ROLES_SAVED_SUCCESSFULLY'), "info");
            });
        }

        //#endregion Users Tab

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
                            organizationId: { field: "organizationId", type: "number", defaultValue: 0 },
                            roleLevel: { field: "roleLevel", type: "number", defaultValue: 0 }
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
                { field: "organizationId", title: $translate.instant('COMMON_ORGANIZATION'), width: "120px", values: $scope.organizations },
                { field: "roleLevel", title: $translate.instant('ROLELEVEL_ROLE_LEVEL'), width: "120px", values: $scope.allRoleLevels }],
            //rowTemplate: "<tr class='roles-row' ng-click='onRolesRowSelected(dataItem.id)' data-uid='#: uid #'>" +
            //     "<td>{{dataItem.name}}</td>" +
            //     "<td>{{dataItem.organizationId}}</td>" +
            //"</tr>"
        };
        $scope.tooltipOptions = {
            filter: "th.k-header", // show tooltip only on these elements
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

        $scope.organizationChanged = function () {
            apiService.getById("rolelevel/getRoleLevelsByOrganizationId", $scope.role.organization.value, "").then(function (data) {
                $scope.roleLevels = data;
                $scope.roleLevels.unshift({ id: null, name: "Select Role Level" });
            });
        }
        $scope.addRole = function () {
            var role = { id: -1, name: $scope.role.name, organizationId: $scope.role.organization.value, roleLevel: $scope.role.roleLevelId }
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
        if ($scope.currentUser) {
            if ($scope.currentUser.isSuperAdmin) {
                $scope.organizations = organizations;
            }
            else {
                $scope.organizations = _.filter(organizations, function (item) {
                    return item.value != 0;
                });
            }
            var userOrg = _.find(organizations, function (item) {
                return item.value == $scope.currentUser.organizationId;
            })
            if (userOrg) {
                $scope.role.organization = userOrg;
            }
        }
        $scope.organizationChanged();
    }])