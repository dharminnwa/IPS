'use strict';

angular.module('ips.user')
    .config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
        $stateProvider
            .state('home.organizations.organizations.details.users', {
                url: "/users",
                abstract: true,
                templateUrl: "views/organization/user/users.html",
            })
            .state('home.organizations.organizations.details.department.edit.users', {
                url: "/users",
                abstract: true,
                templateUrl: "views/organization/user/users.html",
            })
            .state('home.organizations.organizations.details.teams.edit.users', {
                url: "/users",
                abstract: true,
                templateUrl: "views/organization/user/users.html",
            })
            .state('home.organizations.organizations.details.department.edit.teams.edit.users', {
                url: "/users",
                abstract: true,
                templateUrl: "views/organization/user/users.html",
            })
            .state('home.organizations.organizations.details.users.preview', {
                url: "/preview/:userKey",
                templateUrl: "views/organization/user/user.preview.html",
                controller: "UserPreviewCtrl",
                resolve: {
                    user: function ($stateParams, userService, authService) {
                        return userService.getById($stateParams.userKey).then(function (user) {
                            return authService.getUserById(user.userKey).then(function (response) {
                                return authService.tryGetPassword(user.userKey, $stateParams.organizationId).then(function (pass) {
                                    if (response && response.data) {
                                        user['userName'] = response.data.userName;
                                        user['roles'] = response.data.roles;
                                    }
                                    if (pass && pass.data) {
                                        user['password'] = pass.data;
                                        user['confirmPassword'] = pass.data;
                                        user['oldPassword'] = pass.data;
                                    }
                                    return user;
                                });
                            });
                        });
                    },
                    roles: function ($stateParams, rolesManager) {
                        return rolesManager.getRoles();
                    },
                    organizations: function (organizationManager) {
                        var query = '?$select=Id,Name';
                        return organizationManager.getOrganizations(query);
                    },
                },
                data: {
                    displayName: '{{user.firstName}} {{user.lastName}}',
                    paneLimit: 1,
                    depth: 4,
                    resouce: "Users",
                }
            })
            .state('home.organizations.organizations.details.department.edit.users.preview', {
                url: "/preview/:userKey",
                templateUrl: "views/organization/user/user.preview.html",
                controller: "UserPreviewCtrl",
                resolve: {
                    user: function ($stateParams, userService, authService) {
                        return userService.getById($stateParams.userKey).then(function (user) {
                            return authService.getUserById(user.userKey).then(function (response) {
                                if (response && response.data) {
                                    user['userName'] = response.data.userName;
                                    user['roles'] = response.data.roles;
                                }
                                return user;
                            })
                        });
                    },
                    roles: function ($stateParams, rolesManager) {
                        return rolesManager.getRoles();
                    },
                    organizations: function (organizationManager) {
                        var query = '?$select=Id,Name';
                        return organizationManager.getOrganizations(query);
                    }
                },
                data: {
                    displayName: '{{user.firstName}} {{user.lastName}}',
                    paneLimit: 1,
                    depth: 5
                }
            })
            .state('home.organizations.organizations.details.department.edit.teams.edit.users.preview', {
                url: "/preview/:userKey",
                templateUrl: "views/organization/user/user.preview.html",
                controller: "UserPreviewCtrl",
                resolve: {
                    user: function ($stateParams, userService, authService) {
                        return userService.getById($stateParams.userKey).then(function (user) {
                            return authService.getUserById(user.userKey).then(function (response) {
                                if (response && response.data) {
                                    user['userName'] = response.data.userName;
                                    user['roles'] = response.data.roles;
                                }
                                return user;
                            });
                        });
                    },
                    roles: function ($stateParams, rolesManager) {
                        return rolesManager.getRoles();
                    },
                    organizations: function (organizationManager) {
                        var query = '?$select=Id,Name';
                        return organizationManager.getOrganizations(query);
                    }
                },
                data: {
                    displayName: '{{user.firstName}} {{user.lastName}}',
                    paneLimit: 1,
                    depth: 6
                }
            })
            .state('home.organizations.organizations.details.teams.edit.users.preview', {
                url: "/preview/:userKey",
                templateUrl: "views/organization/user/user.preview.html",
                controller: "UserPreviewCtrl",
                resolve: {
                    user: function ($stateParams, userService, authService) {
                        return userService.getById($stateParams.userKey).then(function (user) {
                            return authService.getUserById(user.userKey).then(function (response) {
                                if (response && response.data) {
                                    user['userName'] = response.data.userName;
                                    user['roles'] = response.data.roles;
                                }
                                return user;
                            });
                        });
                    },
                    roles: function ($stateParams, rolesManager) {
                        return rolesManager.getRoles();
                    },
                    organizations: function (organizationManager) {
                        var query = '?$select=Id,Name';
                        return organizationManager.getOrganizations(query);
                    }
                },
                data: {
                    displayName: '{{user.firstName}} {{user.lastName}}',
                    paneLimit: 1,
                    depth: 5
                }
            });
    }])

    .service('userService', ['userManager', function (userManager) {
        this.getById = function (id) {
            var apiName = 'user';
            var query = '$expand=Departments1,Link_TeamUsers($expand=Team),UserType,JobPositions';
            return userManager.getUserById(id, query).then(function (data) {
                return data;
            });
        };
    }])

    .filter('organizationRoles', function () {
        return function (items, organizationId) {
            var filtered = [];
            for (var i = 0, len = items.length; i < len; i++) {
                if (items[i].organizationId == organizationId || items[i].organizationId == 0) {
                    filtered.push(items[i]);
                }
            }
            return filtered;
        }
    })

    .filter('isNotUserRole', function () {
        return function (items, organizationId, roles) {
            var filtered = [];
            if (items && (typeof organizationId != 'undefined') && roles) {
                for (var i = 0, len = items.length; i < len; i++) {
                    if (!hasRole(roles, organizationId, items[i].id))
                        filtered.push(items[i]);
                }
                return filtered;
            }
        }
        function hasRole(roles, organizationId, roleId) {
            var role = roles.filter(function (obj) {
                if (obj.organizationId == organizationId && obj.roleId == roleId) {
                    return obj;
                }
            })[0];
            return (role) ? true : false;
        }
    })

    .controller('UserPreviewCtrl', ['$scope', '$location', 'apiService', 'authService', '$stateParams', 'cssInjector', '$q', 'localStorageService', 'user', '$state', 'organizationManager', 'userManager', 'roles', 'organizations', 'Upload', '$translate', function ($scope, $location, apiService, authService, $stateParams, cssInjector, $q, localStorageService, user, $state, organizationManager, userManager, roles, organizations, Upload, $translate) {
        $scope.user = user;
        $scope.user["oldWorkEmail"] = user.workEmail;
        $scope.upload = [];
        $scope.isEdit = false;
        $scope.isAdmin = isAdmin();
        $scope.canEdit = canEdit();
        $scope.userKey = $stateParams.userKey;
        $scope.allOrganizations = organizations;
        $scope.allRoles = roles;
        $scope.userTeams = [];
        $scope.userOrganization;
        $scope.userTypes;
        $scope.userCultures;
        $scope.newRole = [];
        $scope.gridoptions = [];
        $scope.gridoptions['data'] = new kendo.data.ObservableArray([]);
        /*if ($scope.isAdmin)
            $scope.allOrganizations.push({
                name: 'All Organizations',
                id: 0
            });*/
        $scope.inputTypes = ['password', 'password'];

        getUser();
        getUserTypes();
        getUserCultures();

        $scope.test = function () {
            console.log($scope.userTeams);
        };

        $scope.onFileSelect = function ($files) {
            for (var i = 0; i < $files.length; i++) {
                var $file = $files[i];
                (function (index) {
                    $scope.upload[index] = Upload.upload({
                        url: "../api/api/upload",
                        method: "POST",
                        file: $file
                    }).progress(function (evt) {

                    }).success(function (data) {
                        (data) ? $scope.user.imagePath = '/api/api/download/' + data : '';
                        userManager.updateUserProfileImage($scope.user.id, $scope.user.imagePath);
                    }).error(function (data) {
                        $scope.notificationSavedSuccess.show(data, "warning");
                    });
                })(i);
            }
        }

        $scope.onFileDelete = function () {
            var apiName = 'download';
            var imgId = $scope.user.imagePath.replace('/api/api/download/', '');
            apiService.remove(apiName, imgId).then(
                function (data) {
                    $scope.user.imagePath = null;

                    angular.forEach(
                        angular.element("input[type='file']"),
                        function (inputElem) {
                            angular.element(inputElem).val(null);
                        }
                    );

                    userManager.updateUserProfileImage($scope.user.id, '');
                },
                function (data) {
                    $scope.notificationSavedSuccess.show(data, "warning");
                });
        }

        $scope.hideShowPassword = function () {
            changeinputType($scope.inputTypes, 0);
        };

        $scope.hideShowConfirm = function () {
            changeinputType($scope.inputTypes, 1);
        };

        $scope.isEmailExst = false;
        $scope.checkEmailExist = function (workEmail) {
            $scope.isEmailExst = false;
            if ($scope.user.id > 0 && workEmail) {
                if (workEmail != $scope.user.oldWorkEmail) {
                    userManager.isEmailExist(workEmail).then(function (data) {
                        $scope.isEmailExst = data;
                    });
                }
            }
        }


        function changeinputType(inputTypes, index) {
            if (inputTypes[index] == 'password')
                inputTypes[index] = 'text';
            else
                inputTypes[index] = 'password';
        }

        function getUserTypes() {
            return apiService.getAll('usertype', '?$select=Id,UserType1').then(function (data) {
                $scope.userTypes = data;
                $scope.user.userType = getObjectById($scope.user.userType.id, $scope.userTypes);
            });
        }

        function getUserCultures() {
            apiService.getAll('culture', '?$select=Id,CultureName').then(function (data) {
                $scope.userCultures = data;
                $scope.user.culture = getObjectById($scope.user.cultureId, $scope.userCultures);
            });
        }

        function getObjectById(id, searchArray) {
            return searchArray.filter(function (obj) {
                if (obj.id == id) {
                    return obj
                }
            })[0];
        }

        function getUser() {
            ($scope.user.birthDate) ? $scope.user.birthDate = moment($scope.user.birthDate).format("l") : '';
            getUserTeams($scope.user.link_TeamUsers);
            setSelectableParams();
        }

        function getUserTeams(users) {
            $scope.userTeams.teams = [];
            for (var i = 0, len = users.length; i < len; i++) {
                $scope.userTeams.teams.push(users[i].team);
            }
        }

        function setSelectableParams() {
            setUserOrganization();
        }

        function updateUser() {
            var apiAccount = 'account/Register';
            updateTeamUsers();
            if (!$scope.user.organizationId) {
                if ($scope.userOrganization) {
                    $scope.user['organizationId'] = $scope.userOrganization.id;
                }
            }

            ($scope.user.userType) ? $scope.user['userTypeId'] = $scope.user.userType.id : '';
            ($scope.user.culture) ? $scope.user['cultureId'] = $scope.user.culture.id : '';

            var ipsUser = {
                id: $scope.user.userKey,
                roles: $scope.user.roles,
                isActive: $scope.user.isActive,
                email: $scope.user.workEmail,
                userName: $scope.user.userName,
                firstName: $scope.user.firstName,
                lastName: $scope.user.lastName,
                imageUrl: $scope.user.imagePath
            };

            apiService.update('IpsUser', ipsUser).then(function (data) {
                if (ipsUser.id == $scope.authentication.user.id) {
                    authService.getUserPermissions();
                }

                //$scope.notificationSavedSuccess.show($translate.instant('ORGANIZATIONS_USER_ROLES_SAVED_SUCCESSFULLY'), "info");

                if (isAdmin()) {
                    var passwordInfo = {
                        newPassword: $scope.user.password,
                        confirmNewPassword: $scope.user.confirmPassword,
                        currentPassword: $scope.user.oldPassword,
                        userId: $scope.user.userKey,
                    };

                    authService.changePassword(passwordInfo).then(function (response) {
                        $scope.user.oldPassword = $scope.user.confirmPassword;
                    }, function (error) {
                        $scope.notificationSavedSuccess.show($translate.instant('ORGANIZATIONS_PASSWORD_IS_INVALID_AND_NOT_UPDATED'), "error");
                        $scope.user.password = $scope.user.oldPassword;
                        $scope.user.confirmPassword = $scope.user.oldPassword;
                    });


                    userManager.updateUser($scope.user).then(function (secResponse) {
                        (secResponse) ? notification($translate.instant('ORGANIZATIONS_USER_SAVED_SUCCESSFULLY'), refreshOrganization) : notification($translate.instant('ORGANIZATIONS_SAVE_FAILED'));
                    }, function (secError) {
                        $scope.notificationSavedSuccess.show(secError.data.message, "error");
                    });

                } else {
                    userManager.updateUser($scope.user).then(function (data) {
                        (data) ? notification($translate.instant('ORGANIZATIONS_USER_SAVED_SUCCESSFULLY'), refreshOrganization) : notification($translate.instant('ORGANIZATIONS_SAVE_FAILED'));
                    }, function (error) {
                        $scope.notificationSavedSuccess.show(error, "warning");
                    });
                }
            });
        }

        function notification(message, callback) {
            $scope.notificationSavedSuccess.show(message, "info");
            (callback) ? callback() : '';
        }

        function refreshOrganization() {
            $state.go("home.organizations.organizations.details.users.preview", { userKey: $scope.user.id });
            cancelEdit();
            // Comment By Anand Agarwal to fix Redirection Issue - IPS2018-22 - 2. after saving, stay on user edit page(readonly mode).
            //$state.go($state.$current.parent.parent.name, $stateParams, {
            //    reload: true
            //});
        }

        function updateTeamUsers() {
            $scope.user.link_TeamUsers = [];
            if ($scope.userTeams.teams.length) {
                for (var i = 0, len = $scope.userTeams.teams.length; i < len; i++) {
                    $scope.user.link_TeamUsers.push(
                        {
                            teamId: $scope.userTeams.teams[i].id,
                            userId: $scope.user.id
                        }
                    )
                }
            }
        }

        function setUserOrganization() {
            $scope.userOrganization = getObjectById($scope.user.organizationId, $scope.allOrganizations)
        }

        function getObjectById(id, searchArray) {
            return searchArray.filter(function (obj) {
                if (obj.id == id) {
                    return obj
                }
            })[0];
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

        function goBack() {
            history.back();
        }

        function editUser() {
            $scope.isEdit = true;
        }

        function cancelEdit() {
            $scope.isEdit = false;
        }

        function canEdit() {
            if ($scope.user.id == $scope.authentication.user.userId) {
                return true;
            }
            else {
                var result = authService.canExecuteActionOnUser($scope.user.id, $scope.user.organizationId, authService.actions.Update);
                return result;
            }
        }

        function isAdmin() {
            var result = false;

            if ($scope.user['password'] && $scope.user['password'] != "") {
                result = true;
            }

            return result;
        };

        function setRolesInfo() {
            var deferred = $q.defer();
            var roles = [];
            if ($scope.user.roles) {
                for (var i = 0, len = $scope.user.roles.length; i < len; i++) {
                    var organizationId = $scope.user.roles[i].organizationId;
                    roles[i] = {
                        organization: (organizationId) ? getObjectById(organizationId, $scope.allOrganizations) : { id: 0, name: 'All Organizations' },
                        role: getObjectById($scope.user.roles[i].roleId, $scope.allRoles),
                    }
                }
            }
            deferred.resolve(roles);
            return deferred.promise;
        }

        function initializeUserRoles() {
            return $q.when(setRolesInfo());
        }

        function addUserRole() {
            $scope.gridoptions['data'].push($scope.newRole);
            $scope.user.roles.push({
                roleId: $scope.newRole.role.id,
                organizationId: $scope.newRole.organization.id,
                userId: $scope.user.userKey
            });
            $scope.newRole = [];
            setDefaultRoleOrganization();
        }

        function removeUserRole(roleId, organizationId) {
            var items = $scope.gridoptions['data'];
            for (var i = 0, len = items.length; i < len; i++) {
                if (items[i].role.id == roleId && items[i].organization.id == organizationId) {
                    items.splice(i, 1);
                    break;
                }
            }
            for (var i = 0, len = $scope.user.roles.length; i < len; i++) {
                if ($scope.user.roles[i].roleId == roleId && $scope.user.roles[i].organizationId == organizationId) {
                    $scope.user.roles.splice(i, 1);
                    break;
                }
            }
        }

        function setDefaultRoleOrganization() {
            $scope.newRole.organization = getObjectById($scope.user.organizationId, $scope.allOrganizations);
        }

        function canEditRoles() {
            return authService.hasPermition($scope.user.organizationId, 'Roles', authService.actions.Update);
        }

        $scope.teamOptions = {
            placeholder: $translate.instant('ORGANIZATIONS_USER_TEAMS'),
            dataTextField: "name",
            dataValueField: "id",
            valuePrimitive: false,
            autoBind: false,
            dataSource: {
                type: "json",
                transport: {
                    read: function (options) {
                        apiService.getAll('team', '?$select=Id,Name&$filter=OrganizationId eq ' + $scope.user.organizationId).then(function (data) {
                            options.success(data);
                        });
                    }
                }
            }
        }

        $scope.departmentOptions = {
            placeholder: $translate.instant('ORGANIZATIONS_USER_DEPARTMENTS'),
            dataTextField: "name",
            dataValueField: "id",
            valuePrimitive: false,
            autoBind: false,
            dataSource: {
                type: "json",
                transport: {
                    read: function (options) {
                        apiService.getAll('departments/getDepartments', '?$select=Id,Name&$filter=OrganizationId eq ' + $scope.user.organizationId).then(function (data) {
                            options.success(data);
                        });
                    }
                }
            }
        }

        $scope.rolesOptions = {
            dataSource: {
                type: "json",
                transport: {
                    read: function (options) {
                        initializeUserRoles().then(function (roles) {
                            $scope.gridoptions['data'].splice(0, $scope.gridoptions['data'].length);
                            $scope.gridoptions['data'].push.apply($scope.gridoptions['data'], roles);
                            options.success($scope.gridoptions);
                            setDefaultRoleOrganization()
                        });
                    }
                },
                sort: {
                    field: "name",
                    dir: "asc"
                },
                pageSize: 10,
                schema: {
                    data: 'data',
                    total: 'data.length'
                }
            },
            pageable: true,
            selectable: false,
            sortable: true,
            filterable: {
                mode: 'row'
            },
            columns: [
                { field: "organization.name", title: $translate.instant('COMMON_ORGANIZATION') },
                { field: "role.name", title: $translate.instant('COMMON_ROLE'), },
                { field: "", title: "", width: 100, filterable: false, template: "<div class='icon-groups'><a class='icon-groups icon-groups-item remove-icon' ng-click='removeUserRole(dataItem.role.id,dataItem.organization.id)' ng-show='isEdit && canEditRoles' ></a></div>" },
            ],
        }

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

        $scope.updateUser = updateUser;
        $scope.cancelEdit = cancelEdit;
        $scope.goBack = goBack;
        $scope.editUser = editUser;
        $scope.addUserRole = addUserRole;
        $scope.removeUserRole = removeUserRole;
        $scope.canEditRoles = canEditRoles();
    }]);