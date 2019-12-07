'use strict';
app.factory('authService', ['$http', '$q', 'localStorageService', 'ngAuthSettings', '$timeout', function ($http, $q, localStorageService, ngAuthSettings, $timeout) {



    var serviceBase = ngAuthSettings.apiServiceBaseUri;
    var authServiceFactory = {};
    var _userById = {};
    var _isStandaloneMode = false;
    var _authentication = {
        isAuth: false,
        userName: "",
        useRefreshTokens: false,
        user: {
            id: "",
            username: "",
            firstName: "",
            lastName: "",
            email: "",
            isActive: "",
            isAdmin: false,
            imageUrl: "",
            permitions: null,
            organizationId: null,
            userId: null,
            isSuperAdmin: false,
        }
    };

    //values should correspond to user permission names
    var actions = {
        Create: "IsCreate",
        Read: "IsRead",
        Update: "IsUpdate",
        Delete: "IsDelete",

        None: "None",
        Execute: "Execute",
        All: "All"
    }

    var _hasPermition = function (organizationId, permissionName, action) {
        if (organizationId == null) { organizationId = 0 };
        return isAccessAllowed(permissionName, action, "own", organizationId);
    }

    function isAccessAllowed(requestedResource, requestedAction, resourceScope, resourceOrganizationId, resourceId) {
        if (_authentication.user) {
            if (_authentication.user.permitions) {
                var userRoles = _authentication.user.permitions;
                var result = false;

                for (var i = 0; i < userRoles.length; i++) {
                    if (userRoles[i].OrganizationId == resourceOrganizationId || userRoles[i].OrganizationId == 0 || resourceOrganizationId == 0) {
                        var permissions;

                        if (resourceScope == "own") {
                            permissions = userRoles[i].RolePermissionsOwnResources;
                        } else {
                            permissions = userRoles[i].RolePermissionsAllResources;
                        }

                        for (var j = 0; j < permissions.length; j++) {
                            if (permissions[j].ResourseName.toLowerCase() == requestedResource.toLowerCase()) {
                                result = permissions[j][requestedAction];
                                break;
                            }
                        }
                        if (userRoles[i].OrganizationId == 0 && resourceId && resourceScope == "own") {
                            result = true;
                        }
                        else if (resourceId && resourceScope == "own") {
                            if (requestedResource == "Users" && resourceId == _authentication.user.userId) {
                                result = true;
                            }
                            else {
                                result = false;
                            }
                        }

                        if (result) {
                            break;
                        }
                    }
                }

                return result;
            }
        }

        return false;
    }

    var _canExecuteActionOnUser = function (userId, organizationId, requestedAction) {
        if (_authentication.user) {
            //if (_authentication.user.userId == userId) {
            //    if (requestedAction == actions.Delete)
            //        return false;
            //    return isAccessAllowed("Users", requestedAction, "own", _authentication.user.organizationId);
            //} else {
            //    return isAccessAllowed("Users", requestedAction, "other", organizationId);
            //}


            if (_authentication.user.userId == userId && requestedAction == actions.Delete) {
                return false;
            }
            else {
                return isAccessAllowed("Users", requestedAction, "own", organizationId, userId);
            }
        }

        return false;
    }

    var _externalAuthData = {
        provider: "",
        userName: "",
        externalAccessToken: ""
    };

    var _updateUser = function (user) {
        var deferred = $q.defer();
        return $http.post(serviceBase + 'api/account/UpdateUser', user).success(function (response) {
            if (user.id == _authentication.user.id) {
                _authentication.user.email = user.email;
                _authentication.user.firstName = user.firstName;
                _authentication.user.lastName = user.lastName;
                _authentication.user.imageUrl = user.imageUrl;
            }

            deferred.resolve(response);
        }).error(function (err, status) {
            deferred.reject(err);
        });

        return deferred.promise;
    };

    var _saveUserRoles = function (userId, roles) {
        var deferred = $q.defer();
        userRoles = {
            userId: userId,
            userRoles: roles
        }

        return $http.post(serviceBase + 'api/account/SaveUserRoles', userRoles).success(function (response) {
            if (user.id == _authentication.user.id) {
                var authData = localStorageService.get('authorizationData');
                localStorageService.set('authorizationData', { token: authData.token, user: _authentication.user, refreshToken: authData.refresh_token, useRefreshTokens: false });
                _authentication.user = angular.copy(user);
            }
            deferred.resolve(response);
        }).error(function (err, status) {
            deferred.reject(err);
        });

        return deferred.promise;
    };


    var _deleteUser = function (userId) {
        var deferred = $q.defer();
        return $http.delete(serviceBase + 'api/account/' + userId).success(function (response) {
            deferred.resolve(response);
        }).error(function (err, status) {
            deferred.reject(err);
        });

        return deferred.promise;
    };

    var _getCurrentUser = function () {
        console.log("Called _getCurrentUser");
        var deferred = $q.defer();
        return $http.get(serviceBase + 'api/account/getCurrentUser/id').success(function (response) {
            deferred.resolve(response);
        }).error(function (err, status) {
            deferred.reject(err);
        });

        return deferred.promise;
    };

    var _getCurrentUserRoles = function () {
        var deferred = $q.defer();
        return $http.get(serviceBase + 'api/account/GetCurrentUserRoles/id').success(function (response) {
            deferred.resolve(response);
        }).error(function (err, status) {
            deferred.reject(err);
        });

        return deferred.promise;
    };

    var _getCurrentUserPermissions = function () {
        var deferred = $q.defer();
        return $http.get(serviceBase + 'api/account/GetCurrentUserPermissions').success(function (response) {
            deferred.resolve(response);
        }).error(function (err, status) {
            deferred.reject(err);
        });

        return deferred.promise;
    };

    var _tryGetPassword = function (userId, organizationId) {
        return $http.get(serviceBase + 'api/account/tryGetPassword/' + userId + "/" + organizationId).then(function (response) {
            return response;
        });
    };

    var _getUserById = function (userId) {
        var deferred = $q.defer();
        return $http.get(serviceBase + 'api/account/GetUserById/' + userId).success(function (response) {
            deferred.resolve(response);
        }).error(function (err, status) {
            deferred.reject(err);
        });

        return deferred.promise;
    };

    var _getRoles = function () {
        var deferred = $q.defer();
        return $http.get(serviceBase + 'api/account/GetRoles/id').success(function (response) {
            deferred.resolve(response);
        }).error(function (err, status) {
            deferred.reject(err);
        });

        return deferred.promise;
    };

    var _getUsers = function () {
        var deferred = $q.defer();
        return $http.get(serviceBase + 'api/account/GetUsers/id').success(function (response) {
            deferred.resolve(response);
        }).error(function (err, status) {
            deferred.reject(err);
        });

        return deferred.promise;
    };

    var _getUsersRoles = function () {
        return $http.get(serviceBase + 'api/account/GetUsersRoles/').then(function (response) {
            return response;
        });
    };
    var _getUnreadMessages = function () {
        var deferred = $q.defer();
        return $http.get(serviceBase + 'api/emails/getUnreadMessages').success(function (response) {
            deferred.resolve(response);
        }).error(function (err, status) {
            deferred.reject(err);
        });
        return deferred.promise;
    }


    var _saveRegistration = function (registration) {

        _logOut();

        return $http.post(serviceBase + 'api/account/register', registration).then(function (response) {
            return response;
        });
    };

    var _forgotPassword = function (userName) {
        return $http.get(serviceBase + 'api/account/forgotPassword/' + userName).then(function (response) {
            return response;
        });
    };

    var _changePassword = function (passwordInfo) {
        //passwordInfo.userId = _authentication.user.id;
        return $http.post(serviceBase + 'api/account/changePassword', passwordInfo).then(function (response) {
            return response;
        });
    };

    var _resetPassword = function (passwordInfo) {
        return $http.post(serviceBase + 'api/account/resetPassword', passwordInfo).then(function (response) {
            return response;
        });
    };

    var _login = function (loginData) {

        var data = "grant_type=password&username=" + loginData.userName + "&password=" + loginData.password;

        if (_authentication.useRefreshTokens) {
            data = data + "&client_id=" + ngAuthSettings.clientId;
        }

        var deferred = $q.defer();
        $http.post(serviceBase + 'token', data, { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }).success(function (response) {
            localStorageService.remove("selectedMenuItem");
            _fillAuthData(response);
            if (response.useRefreshTokens) {
                localStorageService.set('authorizationData', { token: response.access_token, user: _authentication.user, refreshToken: response.refresh_token, useRefreshTokens: true });
            }
            else {
                localStorageService.set('authorizationData', { token: response.access_token, user: _authentication.user, refreshToken: response.refresh_token, useRefreshTokens: false });
            }


            _authentication.useRefreshTokens = response.useRefreshTokens;

            deferred.resolve(response);

        }).error(function (err, status) {
            _logOut();
            deferred.reject(err);
        });

        return deferred.promise;

    };

    var _logOut = function () {

        localStorageService.remove('authorizationData');
        localStorageService.remove('selectedMenuItem');
        _authentication.isAuth = false;
        _authentication.userName = "";
        _authentication.useRefreshTokens = false;
        _authentication.user.id = "";
        _authentication.user.username = "";
        _authentication.user.email = "";
        _authentication.user.firstName = "";
        _authentication.user.lastName = "";
        _authentication.user.isActive = "";
        _authentication.user.isAdmin = false;
        _authentication.user.isSuperAdmin = false;
        _authentication.user.imageUrl = "";
        _authentication.user.permitions = null;
        _authentication.user.organizationId = null;
        _authentication.user.userId = null;
        _authentication.user.subOrganizationIds = [];
        _authentication.user.roleLevelAdvancePermission = null;
        _authentication.user.accessibleUserIds = [];


    };

    var _fillAuthData = function (loginData) {
        var authData;

        if (loginData) {
            authData = loginData;
            _authentication.useRefreshTokens = authData.useRefreshTokens;
        }
        else {
            authData = localStorageService.get('authorizationData');
            if (authData == null) {
                return;
            }
            _authentication.useRefreshTokens = authData.useRefreshTokens;
            authData = authData.user;
        }

        if (authData) {
            _authentication.isAuth = true;
            _authentication.userName = authData.username;
            _authentication.user.username = authData.username;
            _authentication.user.id = authData.id;
            _authentication.user.email = authData.email;
            _authentication.user.firstName = authData.firstName;
            _authentication.user.lastName = authData.lastName;
            _authentication.user.isActive = String(authData.isActive) == 'true';
            _authentication.user.isAdmin = String(authData.isAdmin) == 'true';
            _authentication.user.isSuperAdmin = authData.roles ? (authData.roles.split(',').indexOf('Super Admin') > -1 ? true : false) : (authData.isSuperAdmin ? true : false);
            _authentication.user.imageUrl = authData.imageUrl;
            _authentication.user.permitions = angular.fromJson(authData.permitions);
            _authentication.user.organizationId = authData.organizationId;
            _authentication.user.userId = authData.userId;
            _authentication.user.subOrganizationIds = typeof (authData.subOrganizationIds) == "object" ? authData.subOrganizationIds : JSON.parse(authData.subOrganizationIds);
            _authentication.user.accessibleUserIds = typeof (authData.accessibleUserIds) == "object" ? authData.accessibleUserIds : JSON.parse(authData.accessibleUserIds);
            _authentication.user.roleLevelAdvancePermission = angular.fromJson(authData.roleLevelAdvancePermission);
        }
    };


    var _refreshToken = function () {
        var deferred = $q.defer();

        var authData = localStorageService.get('authorizationData');

        if (authData) {

            if (authData.useRefreshTokens) {

                var data = "grant_type=refresh_token&refresh_token=" + authData.refreshToken + "&client_id=" + ngAuthSettings.clientId;

                localStorageService.remove('authorizationData');

                $http.post(serviceBase + 'token', data, { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }).success(function (response) {

                    _fillAuthData(response);

                    localStorageService.set('authorizationData', { token: response.access_token, user: _authentication.user, refreshToken: response.refresh_token, useRefreshTokens: true });

                    deferred.resolve(response);

                }).error(function (err, status) {
                    _logOut();
                    deferred.reject(err);
                });
            }
        }

        return deferred.promise;
    };

    var _obtainAccessToken = function (externalData) {

        var deferred = $q.defer();

        $http.get(serviceBase + 'api/account/ObtainLocalAccessToken', { params: { provider: externalData.provider, externalAccessToken: externalData.externalAccessToken } }).success(function (response) {

            _fillAuthData(response);

            localStorageService.set('authorizationData', { token: response.access_token, user: _authentication.user, refreshToken: response.refresh_token, useRefreshTokens: false });

            _authentication.useRefreshTokens = false;

            deferred.resolve(response);

        }).error(function (err, status) {
            _logOut();
            deferred.reject(err);
        });

        return deferred.promise;

    };

    var _registerExternal = function (registerExternalData) {

        var deferred = $q.defer();

        $http.post(serviceBase + 'api/account/registerexternal', registerExternalData).success(function (response) {

            _fillAuthData(response);
            localStorageService.set('authorizationData', { token: response.access_token, user: _authentication.user, refreshToken: response.refresh_token, useRefreshTokens: false });
            _authentication.useRefreshTokens = false;
            deferred.resolve(response);

        }).error(function (err, status) {
            _logOut();
            deferred.reject(err);
        });

        return deferred.promise;

    };

    var _upload = function (files) {
        var deferred = $q.defer();

        $http.post(serviceBase + 'api/account/ProfileImagePost', files[0].name,
            {
                headers: { 'Content-Type': undefined },
                transformRequest: function (tdata) {
                    var form = new FormData;
                    form.append("file", files[0])
                    return form;
                }
            }
        ).success(function (response) {

            deferred.resolve(response);

        }).error(function (err, status) {
            deferred.reject(err);
        });

        return deferred.promise;
    };

    var _getUserPermissions = function () {
        return $http.get(serviceBase + 'api/account/GetUserPermitions/id').success(
            function (result) {
                _authentication.user.permitions = angular.fromJson(result);

                var authData = localStorageService.get('authorizationData');
                localStorageService.set('authorizationData', { token: authData.token, user: _authentication.user, refreshToken: authData.refresh_token, useRefreshTokens: false });
            });
    };

    authServiceFactory.saveRegistration = _saveRegistration;
    authServiceFactory.login = _login;
    authServiceFactory.forgotPassword = _forgotPassword;
    authServiceFactory.logOut = _logOut;
    authServiceFactory.changePassword = _changePassword;
    authServiceFactory.resetPassword = _resetPassword;
    authServiceFactory.fillAuthData = _fillAuthData;

    authServiceFactory.getUnreadMessages = _getUnreadMessages;

    authServiceFactory.authentication = _authentication;
    authServiceFactory.refreshToken = _refreshToken;
    authServiceFactory.getUserById = _getUserById;
    authServiceFactory.updateUser = _updateUser;
    authServiceFactory.userById = _userById;
    authServiceFactory.getCurrentUser = _getCurrentUser;
    authServiceFactory.getCurrentUserRoles = _getCurrentUserRoles;
    authServiceFactory.getCurrentUserPermissions = _getCurrentUserPermissions;
    authServiceFactory.getUsers = _getUsers;
    authServiceFactory.getRoles = _getRoles;
    authServiceFactory.deleteUser = _deleteUser;
    authServiceFactory.saveUserRoles = _saveUserRoles;
    authServiceFactory.upload = _upload;
    authServiceFactory.isStandaloneMode = _isStandaloneMode;
    authServiceFactory.getUsersRoles = _getUsersRoles;
    authServiceFactory.hasPermition = _hasPermition;
    authServiceFactory.canExecuteActionOnUser = _canExecuteActionOnUser;
    authServiceFactory.tryGetPassword = _tryGetPassword;

    authServiceFactory.obtainAccessToken = _obtainAccessToken;
    authServiceFactory.externalAuthData = _externalAuthData;
    authServiceFactory.registerExternal = _registerExternal;
    authServiceFactory.actions = actions;

    authServiceFactory.getUserPermissions = _getUserPermissions;

    return authServiceFactory;
}]);