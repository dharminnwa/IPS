'use strict';

angular.module('ips.personalnfo', ['ui.router', 'flow', 'LocalStorageModule'])

    .config(['$stateProvider', '$urlRouterProvider', 'flowFactoryProvider', function ($stateProvider, $urlRouterProvider, flowFactoryProvider) {
        $stateProvider
            .state('home.personalnfo', {
                url: '/personalnfo',
                templateUrl: 'views/personalnfo/personalnfo.html',
                controller: "PersonalnfoCtrl",
                resolve: {
                    pageName: function ($translate) {
                        return $translate.instant('LEFTMENU_PERSONAL_INFO');
                    },
                    user: function ($stateParams, userService, authService) {
                        var user = undefined;
                        return authService.getCurrentUser().then(function (response) {
                            if (response && response.data) {
                                user = response.data;
                            }
                            return user;
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
                    displayName: '{{pageName}}',//'Personal Info',
                    paneLimit: 1,
                    depth: 2
                }
            });

        flowFactoryProvider.defaults = {
            target: webConfig.serviceBase + 'api/Picture/Upload',
            permanentErrors: [404, 500, 501],
            maxChunkRetries: 1,
            chunkRetryInterval: 5000,
            simultaneousUploads: 4,
            singleFile: true
        };
        flowFactoryProvider.on('catchAll', function (event) {
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
    .controller('PersonalnfoCtrl', ['$scope', '$location', '$window', 'authService', 'apiService', 'cssInjector', '$q', 'user', 'roles', 'organizations', 'localStorageService', '$translate','globalVariables', function ($scope, $location, $window, authService, apiService, cssInjector, $q, user, roles, organizations, localStorageService, $translate, globalVariables) {
        cssInjector.add('views/personalnfo/personalnfo.css');
        moment.locale(globalVariables.lang.currentUICulture);
        $scope.user = user;
        $scope.files = [];
        $scope.allOrganizations = organizations;
        $scope.allRoles = roles;
        $scope.newRole = [];
        $scope.gridoptions = [];
        $scope.userOrganization;
        $scope.gridoptions['data'] = new kendo.data.ObservableArray([]);
        $scope.canEditRoles = canEditRoles();


        $scope.fileUploadSuccess = function (message) {
            $scope.files.push(JSON.parse(message));
            $scope.user.imageUrl = 'images/Upload/Profile//' + JSON.parse(message);
        };

        $scope.fileUploadProgress = function (progress) {
            $scope.fileProgress = Math.round(progress * 100);
        };

        $scope.uploadError = function (message) {
            var jsonResponse = JSON.parse(message);
            var modelState = jsonResponse.modelState;
            $scope.modelState = modelState;
        };

        $scope.validateFile = function ($file) {
            $scope.modelState = undefined;
            var allowedExtensions = ['jpeg', 'jpg', 'bmp', 'png'];
            var isValidType = allowedExtensions.indexOf($file.getExtension()) >= 0;
            if (!isValidType) $scope.modelState = { file: ['type'] };
            return isValidType;
        };

        $scope.getSecurityHeaders = function () {
            var authData = localStorageService.get('authorizationData');
            return { Authorization: 'Bearer ' + authData.token };
        };

        $scope.dateOptions = {
            //format: "yyyy-MM-dd"
        }

        if ($scope.user == undefined) {
            $scope.user = authService.getCurrentUser().then(function (response) {
                $scope.user = response.data;
                if (moment($scope.user.user.birthDate, "L").isValid())
                    $scope.user.user.birthDate = moment($scope.user.user.birthDate, "L");
                /*authService.getAllRoles().then(function (response) {
                    $scope.roles = response.data;
                }, ifError);*/
            }, ifError);
        }

        $scope.message = "";
        $scope.messageFirstName = "";
        $scope.messageLastName = "";
        $scope.messageEmail = "";

        $scope.messageClean = function () {
            $scope.message = "";
            $scope.messageFirstName = "";
            $scope.messageLastName = "";
            $scope.messageEmail = "";
        }

        $scope.saveUser = function () {
            $scope.message = "";

            $scope.messageFirstName = "";
            $scope.messageLastName = "";
            $scope.messageEmail = "";

            if ($scope.user.firstName == null) {
                $scope.messageFirstName = $translate.instant('ORGANIZATIONS_FIRST_NAME_CANT_BE_EMPTY') + "\n";
            }
            else if ($scope.user.firstName.length > 256) {
                $scope.messageFirstName = $translate.instant('ORGANIZATIONS_FIRST_NAME_SHOULD_BE_LIMITED') + "\n";

            }

            if ($scope.user.lastName == null) {
                $scope.messageLastName = $translate.instant('ORGANIZATIONS_LAST_NAME_CANT_BE_EMPTY') + "\n";
            }
            else if ($scope.user.lastName.length > 256) {
                $scope.messageLastName = $translate.instant('ORGANIZATIONS_LAST_NAME_SHOULD_BE_LIMITED') + "\n";

            }

            var filter = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
            if (!filter.test($scope.user.email) || $scope.message.length > 0) {
                $scope.messageEmail = $translate.instant('ORGANIZATIONS_EMAIL_ADDRESS') + " " + $scope.user.email + " " + $translate.instant('ORGANIZATIONS_CAN_ONLY_CONTAIN_LETTERS_OR_DIGITS') + "\n";
            }

            if (!moment($scope.user.user.birthDate, "L").isValid())
                $scope.user.user.birthDate = null;
            // Added for  Update UserRoles 
            var ipsUser = {
                id: $scope.user.user.userKey,
                email: $scope.user.user.workEmail,
                firstName: $scope.user.user.firstName,
                lastName: $scope.user.user.lastName,
                imageUrl: $scope.user.user.imagePath,

                roles: $scope.user.roles,
                isActive: $scope.user.isActive,
                userName: $scope.user.userName
            };
            //
            if ($scope.messageFirstName == "" && $scope.messageLastName == "" && $scope.messageEmail == "") {
                var user = _.clone($scope.user);
                user.birthDate = kendo.parseDate(user.birthDate);
                authService.updateUser(user).then(function (response) {
                    // Added for  Update UserRoles 
                    if (response) {
                        apiService.update('IpsUser', ipsUser).then(function (data) {
                            authService.getUserPermissions();
                            $scope.notificationSavedSuccess.show($translate.instant('ORGANIZATIONS_USER_PROFILE_SAVED_SUCCESSFULLY'), "info");
                        }, function (err) {
                            if (err.error_description != undefined) {
                                $scope.message = err.error_description;
                            }
                            else {
                                $scope.message = err;
                            }
                            $scope.$apply();
                        });
                    } else {
                        $scope.notificationSavedSuccess.show($translate.instant('ORGANIZATIONS_USER_PROFILE_SAVED_SUCCESSFULLY'), "info");
                        //$window.history.back();
                    }
                    //
                }, function (err) {
                    if (err.error_description != undefined) {
                        $scope.message = err.error_description;
                    }
                    else {
                        $scope.message = err;
                    }
                    $scope.$apply();
                });
            };
        };

        $scope.onSelect = function (e) {
            authService.upload(e.files).then(function (response) {

            }, ifError(err));
        };

        $scope.cancel = function () {
            $window.history.back();
        };

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
                { field: "role.name", title: $translate.instant('COMMON_ROLE') },
                { field: "", title: "", width: 100, filterable: false, template: "<div class='icon-groups'><a class='icon-groups icon-groups-item remove-icon' ng-click='removeUserRole(dataItem.role.id,dataItem.organization.id)' ng-show='canEditRoles' ></a></div>" },
            ],
        }
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
        $scope.addUserRole = addUserRole;
        $scope.removeUserRole = removeUserRole;

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
        function setDefaultRoleOrganization() {
            var organizationId = $scope.user.roles[0].organizationId;
            $scope.newRole.organization = getObjectById(organizationId, $scope.allOrganizations);
        }
        function addUserRole() {
            $scope.gridoptions['data'].push($scope.newRole);
            $scope.user.roles.push({
                roleId: $scope.newRole.role.id,
                organizationId: $scope.newRole.organization.id,
                userId: $scope.user.id
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

        function ifError(err) {
            if (err.error_description != undefined) {
                $scope.message = err.error_description;
            }
            else {
                $scope.message = err;
            }

            $scope.$apply();
        }

        function getObjectById(id, searchArray) {
            return searchArray.filter(function (obj) {
                if (obj.id == id) {
                    return obj
                }
            })[0];
        }

        function canEditRoles() {
            return authService.canExecuteActionOnUser($scope.user.id, $scope.user.user.organizationId, authService.actions.Update);
        }

    }]);