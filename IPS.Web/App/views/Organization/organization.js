'use strict';

angular
    .module('ips.organization')
    .config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
        var baseOrganizationResolve = {
            pageName: function ($translate) {
                return $translate.instant('ORGANIZATIONS_ORGANIZATIONS');
            }
        };

        var baseImportOrganizationUserResolve = {
            pageName: function ($translate) {
                return 'Import Users';
            },
            organizations: function (organizationManager) {
                return organizationManager.getOrganizations().then(function (data) {
                    var organization_obj = [data.length];
                    for (var i = 0; i < data.length; i++) {
                        organization_obj[i] = {
                            id: data[i].id,
                            name: data[i].name,
                            logoLink: data[i].logoLink,
                            industryName: data[i].industry == null ? '' : data[i].industry.name,
                            countryImage: data[i].country == null ? '' : data[i].country.flagImage,
                            contactName: data[i].contactName
                        };
                    }
                    return organization_obj
                });
            }
        };
        var baseImportOrganizationResolve = {
            pageName: function ($translate) {
                return 'Import Organization';
            },
            organizations: function (organizationManager) {
                return organizationManager.getOrganizations().then(function (data) {
                    var organization_obj = [data.length];
                    for (var i = 0; i < data.length; i++) {
                        organization_obj[i] = {
                            id: data[i].id,
                            name: data[i].name,
                            logoLink: data[i].logoLink,
                            industryName: data[i].industry == null ? '' : data[i].industry.name,
                            countryImage: data[i].country == null ? '' : data[i].country.flagImage,
                            contactName: data[i].contactName
                        };
                    }
                    return organization_obj
                });
            }
        };

        var baseOrganizationUsersListResolve = {
            pageName: function ($translate) {
                return 'Users';
            },
            users: function ($stateParams, organizationManager, authService) {
                if ($stateParams.organizationId > 0) {
                    return organizationManager.getOrganizationUsers($stateParams.organizationId).then(function (data) {
                        if (data) {
                            return data;
                        }
                    });
                }
                else {
                    return organizationManager.getOrganizationUsers(authService.authentication.user.organizationId).then(function (data) {
                        if (data) {
                            return data;
                        }
                    });
                }
            },
            organizations: function (organizationManager) {
                return organizationManager.getOrganizations().then(function (data) {
                    var organization_obj = [data.length];
                    for (var i = 0; i < data.length; i++) {
                        organization_obj[i] = {
                            id: data[i].id,
                            name: data[i].name,
                            logoLink: data[i].logoLink,
                            industryName: data[i].industry == null ? '' : data[i].industry.name,
                            countryImage: data[i].country == null ? '' : data[i].country.flagImage,
                            contactName: data[i].contactName
                        };
                    }
                    return organization_obj
                });
            }
        };
        var baseOrganizationDepartmentsResolve = {
            pageName: function ($translate) {
                return 'Departments';
            },
            departments: function ($stateParams, organizationManager, authService) {
                if ($stateParams.organizationId > 0) {
                    return organizationManager.getOrganizationDepartments($stateParams.organizationId).then(function (data) {
                        if (data) {
                            return data;
                        }
                    });
                }
                else {
                    return organizationManager.getOrganizationDepartments(authService.authentication.user.organizationId).then(function (data) {
                        if (data) {
                            return data;
                        }
                    });
                }
            },
            organizations: function (organizationManager) {
                return organizationManager.getOrganizations().then(function (data) {
                    var organization_obj = [data.length];
                    for (var i = 0; i < data.length; i++) {
                        organization_obj[i] = {
                            id: data[i].id,
                            name: data[i].name,
                            logoLink: data[i].logoLink,
                            industryName: data[i].industry == null ? '' : data[i].industry.name,
                            countryImage: data[i].country == null ? '' : data[i].country.flagImage,
                            contactName: data[i].contactName
                        };
                    }
                    return organization_obj
                });
            }
        }

        var baseNewDepartmentResolve = {
            pageName: function ($translate) {
                return 'Departments';
            },
            organization: function ($stateParams, organizationManager, authService) {
                if ($stateParams.organizationId > 0) {
                    return organizationManager.getOrganizationById($stateParams.organizationId).then(function (data) {
                        return data
                    });
                }
                else if (authService.authentication) {
                    return organizationManager.getOrganizationById(authService.authentication.user.organizationId).then(function (data) {
                        return data
                    });
                }
            },
            organizationUsers: function ($stateParams, organizationManager, authService) {
                if ($stateParams.organizationId > 0) {
                    return organizationManager.getOrganizationUsers($stateParams.organizationId).then(function (data) {
                        if (data) {
                            return data;
                        }
                    });
                }
                else {
                    return organizationManager.getOrganizationUsers(authService.authentication.user.organizationId).then(function (data) {
                        if (data) {
                            return data;
                        }
                    });
                }
            },
            department: function ($stateParams, organizationManager) {
                if ($stateParams.departmentId) {
                    return organizationManager.getDepartmentbyId($stateParams.departmentId).then(function (data) {
                        return data;
                    });
                }
                else {
                    if ($stateParams.organizationId) {
                        return {
                            id: 0,
                            name: null,
                            description: null,
                            organizationId: $stateParams.organizationId,
                            managerId: null,
                            email: null,
                            phone: null,
                            users: [],
                            teams: [],
                            isActive: true,
                        }
                    }
                    else {
                        return {
                            id: 0,
                            name: null,
                            description: null,
                            organizationId: authService.authentication.user.organizationId,
                            managerId: null,
                            email: null,
                            phone: null,
                            users: [],
                            teams: [],
                            isActive: true,
                        }
                    }

                }
            }
        }

        var baseOrganizationTeamsResolve = {
            pageName: function ($translate) {
                return 'Teams';
            },
            organizations: function (organizationManager) {
                return organizationManager.getOrganizations().then(function (data) {
                    var organization_obj = [data.length];
                    for (var i = 0; i < data.length; i++) {
                        organization_obj[i] = {
                            id: data[i].id,
                            name: data[i].name,
                            logoLink: data[i].logoLink,
                            industryName: data[i].industry == null ? '' : data[i].industry.name,
                            countryImage: data[i].country == null ? '' : data[i].country.flagImage,
                            contactName: data[i].contactName
                        };
                    }
                    return organization_obj
                });
            },
            organizationUsers: function ($stateParams, organizationManager, authService) {
                if ($stateParams.organizationId > 0) {
                    return organizationManager.getOrganizationUsers($stateParams.organizationId).then(function (data) {
                        if (data) {
                            return data;
                        }
                    });
                }
                else {
                    return organizationManager.getOrganizationUsers(authService.authentication.user.organizationId).then(function (data) {
                        if (data) {
                            return data;
                        }
                    });
                }
            },
            organizationDepartments: function ($stateParams, organizationManager, authService) {
                if ($stateParams.organizationId > 0) {
                    return organizationManager.getOrganizationDepartments($stateParams.organizationId).then(function (data) {
                        if (data) {
                            return data;
                        }
                    });
                }
                else {
                    return organizationManager.getOrganizationDepartments(authService.authentication.user.organizationId).then(function (data) {
                        if (data) {
                            return data;
                        }
                    });
                }
            },
            organizationTeams: function ($stateParams, organizationManager, authService) {
                if ($stateParams.organizationId > 0) {
                    return organizationManager.getOrganizationTeams($stateParams.organizationId).then(function (data) {
                        if (data) {
                            return data;
                        }
                    });
                }
                else {
                    return organizationManager.getOrganizationTeams(authService.authentication.user.organizationId).then(function (data) {
                        if (data) {
                            return data;
                        }
                    });
                }
            },
        }

        var baseNewTeamResolve = {
            pageName: function ($translate) {
                return 'Teams';
            },
            organization: function ($stateParams, organizationManager, authService) {
                if ($stateParams.organizationId > 0) {
                    return organizationManager.getOrganizationById($stateParams.organizationId).then(function (data) {
                        return data
                    });
                }
                else if (authService.authentication) {
                    return organizationManager.getOrganizationById(authService.authentication.user.organizationId).then(function (data) {
                        return data
                    });
                }
            },
            organizationUsers: function ($stateParams, organizationManager, authService) {
                if ($stateParams.organizationId > 0) {
                    return organizationManager.getOrganizationUsers($stateParams.organizationId).then(function (data) {
                        if (data) {
                            return data;
                        }
                    });
                }
                else {
                    return organizationManager.getOrganizationUsers(authService.authentication.user.organizationId).then(function (data) {
                        if (data) {
                            return data;
                        }
                    });
                }
            },
            organizationDepartments: function ($stateParams, organizationManager, authService) {
                if ($stateParams.organizationId > 0) {
                    return organizationManager.getOrganizationDepartments($stateParams.organizationId).then(function (data) {
                        if (data) {
                            return data;
                        }
                    });
                }
                else {
                    return organizationManager.getOrganizationDepartments(authService.authentication.user.organizationId).then(function (data) {
                        if (data) {
                            return data;
                        }
                    });
                }
            },
            team: function ($stateParams, organizationManager, organization) {
                if ($stateParams.teamId) {
                    return organizationManager.getTeambyId($stateParams.teamId).then(function (data) {
                        return data;
                    })
                }
                else {
                    return {
                        name: null,
                        description: null,
                        organizationId: organization.id,
                        teamLeadId: null,
                        email: null,
                        departmentId: null,
                        phone: null,
                        link_TeamUsers: [],
                        isActive: true,
                    }
                }

            }
        }

        $stateProvider
            .state('home.organizations.organizations', {
                url: "/organizations",
                templateUrl: "views/organization/organizations.html",
                controller: "OrganizationCtrl",
                resolve: baseOrganizationResolve,
                data: {
                    displayName: '{{pageName}}',//'Organizations',
                    paneLimit: 1,
                    depth: 2,
                    resource: "Organizations"
                }
            })
            .state('home.organizations.import', {
                url: "/import/:organizationId",
                templateUrl: "views/organization/importOrganization.html",
                controller: "ImportOrganizationCtrl",
                resolve: baseImportOrganizationResolve,
                data: {
                    displayName: '{{pageName}}',//'Organizations',
                    paneLimit: 1,
                    depth: 2,
                    resource: "Organizations"
                }
            })
            .state('home.organizations.importusers', {
                url: "/importusers/:organizationId",
                templateUrl: "views/organization/importusers.html",
                controller: "ImportOrganizationUsersCtrl",
                resolve: baseImportOrganizationUserResolve,
                data: {
                    displayName: '{{pageName}}',//'Organizations',
                    paneLimit: 1,
                    depth: 2,
                    resource: "Organizations"
                }
            })
            .state('home.organizations.users', {
                url: "/users/:organizationId",
                templateUrl: "views/organization/user/userslist.html",
                controller: "OrganizationUsersCtrl",
                resolve: baseOrganizationUsersListResolve,
                data: {
                    displayName: '{{pageName}}',//'Organizations',
                    paneLimit: 1,
                    depth: 2,
                    resource: "Organizations"
                }
            })

            .state('home.organizations.users.preview', {
                url: "/preview/:userKey",
                templateUrl: "views/organization/user/user.preview.html",
                controller: "UserDetailPreviewCtrl",
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
            .state('home.organizations.newDepartment', {
                url: "/newDepartment/:organizationId",
                templateUrl: "views/organization/department/newDepartment.html",
                controller: "newDepartmentCtrl",
                resolve: baseNewDepartmentResolve,
                data: {
                    displayName: '{{pageName}}',//'Organizations',
                    paneLimit: 1,
                    depth: 2,
                    resource: "Organizations"
                }
            })
            .state('home.organizations.departmentDetail', {
                url: "/DepartmentDetail/:departmentId",
                templateUrl: "views/organization/department/newDepartment.html",
                controller: "newDepartmentCtrl",
                resolve: baseNewDepartmentResolve,
                data: {
                    displayName: '{{pageName}}',//'Organizations',
                    paneLimit: 1,
                    depth: 2,
                    resource: "Organizations"
                }
            })
            .state('home.organizations.departments', {
                url: "/departments/:organizationId",
                templateUrl: "views/organization/department/departmentlist.html",
                controller: "OrganizationDepartmentsCtrl",
                resolve: baseOrganizationDepartmentsResolve,
                data: {
                    displayName: '{{pageName}}',//'Organizations',
                    paneLimit: 1,
                    depth: 2,
                    resource: "Organizations"
                }
            })
            .state('home.organizations.teams', {
                url: "/teams/:organizationId",
                templateUrl: "views/organization/team/teamlist.html",
                controller: "OrganizationTeamsCtrl",
                resolve: baseOrganizationTeamsResolve,
                data: {
                    displayName: '{{pageName}}',//'Organizations',
                    paneLimit: 1,
                    depth: 2,
                    resource: "Organizations"
                }
            })
            .state('home.organizations.newTeam', {
                url: "/newTeam/:organizationId",
                templateUrl: "views/organization/team/newTeam.html",
                controller: "newTeamCtrl",
                resolve: baseNewTeamResolve,
                data: {
                    displayName: '{{pageName}}',//'Organizations',
                    paneLimit: 1,
                    depth: 2,
                    resource: "Organizations"
                }
            })
            .state('home.organizations.teamDetail', {
                url: "/TeamDetail/:teamId",
                templateUrl: "views/organization/team/newTeam.html",
                controller: "newTeamCtrl",
                resolve: baseNewTeamResolve,
                data: {
                    displayName: '{{pageName}}',//'Organizations',
                    paneLimit: 1,
                    depth: 2,
                    resource: "Organizations"
                }
            })


    }])
    .service('organizationService', ['organizationManager', function (organizationManager) {
        var selectedOrganizationDetailsTabL;
        var hrViewGroupBy;
        var selectedTab;
        this.getById = function (id) {
            return organizationManager.getOrganizationById(id, "$expand=Users($expand=JobPositions),Teams($expand=Link_TeamUsers($expand=User($expand=JobPositions))),Departments($expand=Users($expand=JobPositions),Teams)").then(function (data) {
                selectedOrganizationDetailsTabL = data;
                return selectedOrganizationDetailsTabL;
            });
        }
        this.getSelectedOrganization = function () {
            return selectedOrganizationDetailsTabL;
        }
    }])
    .controller('OrganizationCtrl', ['$scope', '$controller', '$rootScope', '$location', '$stateParams', 'authService', '$cacheFactory', 'cssInjector', 'organizationService', 'organizationManager', 'organizationProjectsService', '$translate', 'progressBar', function ($scope, $controller, $rootScope, $location, $stateParams, authService, $cacheFactory, cssInjector, organizationService, organizationManager, organizationProjectsService, $translate, progressBar) {
        cssInjector.removeAll();
        //angular.extend(this, $controller('dashboardCtrl as dashboard', {
        //    $scope: $scope
        //}));
        //angular.extend(this, $controller('scorecardCtrl as scorecard', {
        //    $scope: $scope
        //}));
        //angular.extend(this, $controller('organizationCustomersCtrl as organizationCustomers', {
        //    $scope: $scope
        //}));
        //angular.extend(this, $controller('organizationSalesCtrl as organizationSales', {
        //    $scope: $scope
        //}));
        $scope.getscopes = function () {
            history.back();
        }
        $scope.$watch("expand", function () {
            $('.k-content').css("width", "95%");
        })
        cssInjector.add('views/organization/organization.css');
        $scope.apiName = 'organization';
        $scope.isEdit = isEdit();
        $scope.allOrganizations = [];
        $scope.expandClick = function () {
            $scope.expand = !$scope.expand;
            setTimeout(function () {
                $(".k-chart").each(function (i, el) {
                    var dataStr = "kendoChart";
                    var chart = $(el);
                    if (chart && chart.data(dataStr)) {
                        chart.data(dataStr).redraw();
                    }
                    dataStr = "kendoRadialGauge";
                    if (chart && chart.data(dataStr)) {
                        chart.data(dataStr).redraw();
                    }
                })
            }, 20);
        }
        $scope.organizationPlaceholder = 'images/organization-placeholder.png';
        $scope.groupTab = {
            name: (organizationService.hrViewGroupBy) ? organizationService.hrViewGroupBy : 'departments'
        };
        $scope.userCurrentPage = 0;
        $scope.userPageSize = 24;
        $scope.selectedOrganizationDetailsTab;
        $scope.organizationIndustry;
        $scope.organizationCountry;
        $scope.organizationVisitingCountry;
        $scope.countries;
        $scope.organization;
        $scope.industries;
        $scope.Projects;
        $scope.authService = authService;
        $scope.Math = window.Math;
        //local permission values
        var vm = new Object();
        vm['departments' + $scope.authService.actions.Create] = null;
        vm['teams' + $scope.authService.actions.Create] = null;
        vm['users' + $scope.authService.actions.Create] = null;
        //filterUsers();
        createCacheFactory();
        activate();
        function filterUsers() {
            $scope.selectedOrganizationDetailsTab.users = getActive(organization.users);
            for (var i = 0; i < $scope.selectedOrganizationDetailsTab.departments.length; i++) {
                $scope.selectedOrganizationDetailsTab.departments[i].users = getActive($scope.selectedOrganizationDetailsTab.departments[i].users);
            }
            for (var i = 0; i < $scope.selectedOrganizationDetailsTab.teams.length; i++) {
                var tu = [];
                for (var j = 0; j < $scope.selectedOrganizationDetailsTab.teams[i].link_TeamUsers.length; j++) {
                    if ($scope.selectedOrganizationDetailsTab.teams[i].link_TeamUsers[j].user.isActive)
                        tu.push($scope.selectedOrganizationDetailsTab.teams[i].link_TeamUsers[j]);
                }
                $scope.selectedOrganizationDetailsTab.teams[i].link_TeamUsers = tu;
            }
        }
        function getActive(users) {
            var u = [];
            for (var i = 0; i < users.length; i++) {
                if (users[i].isActive)
                    u.push(users[i]);
            }
            return u;
        }
        function isDisabled(permissionName, action) {
            if (vm[permissionName.toLowerCase() + action] == null) {
                vm[permissionName.toLowerCase() + action] = !$scope.authService.hasPermition($scope.organizationId, permissionName, action);
            }
            return vm[permissionName.toLowerCase() + action];
        }
        function getById(id, myArray) {
            return myArray.filter(function (obj) {
                if (obj.id == id) {
                    return obj
                }
            })[0]
        }
        function isOrganizationTeams() {
            if ($scope.selectedOrganizationDetailsTab.teams) {
                var teams = $scope.selectedOrganizationDetailsTab.teams;
                for (var i = 0, len = teams.length; i < len; i++) {
                    if (!teams[i].departmentId) {
                        return true;
                    }
                }
                return false;
            } else {
                return false;
            }
        }
        function newTeam(organizationId) {
            var location = ($stateParams.organizationId) ? '' : '/details/' + organizationId;
            organizationService.hrViewGroupBy = $scope.groupTab.name;
            organizationService.selectedTab = $("#kendo-tab-strip").kendoTabStrip().data("kendoTabStrip").select().index();
            $location.path($location.path() + location + '/teams/edit/0');
        }
        function editTeam(teamId, departmentId) {
            var location = ($stateParams.organizationId) ? '' : '/details/' + $scope.selectedOrganizationDetailsTab.id;
            organizationService.hrViewGroupBy = $scope.groupTab.name;
            organizationService.selectedTab = $("#kendo-tab-strip").kendoTabStrip().data("kendoTabStrip").select().index();
            if (departmentId == null) {
                var location2 = $location.path() + location + '/department/edit/' + departmentId + '/teams/edit/' + teamId;
            }
            else {
                var location2 = $location.path() + location + '/teams/edit/' + teamId;
            }
            $location.path(location2);
        }
        function getAllProjects() {
            // (query) ? '' : query = '';
            //  apiService.getAll("projects/getProjects/").then(function (data) {
            organizationManager.getOrganizationProjects($rootScope.organization.organizationId).then(function (data) {
                organizationProjectsService.setProjects(data).then(function (data) {
                    $("#organization-project-tab-strip").kendoTabStrip({
                        show: setProjectSelectedTab(),
                        contentUrls: [
                            "../app/views/organization/templates/activeProjectsTab.html",
                            "../app/views/organization/templates/pendingProjectsTab.html",
                            "../app/views/organization/templates/expiredProjectsTab.html",
                            "../app/views/organization/templates/completedProjectsTab.html",
                            "../app/views/organization/templates/historyProjectsTab.html",
                        ],
                    });
                })
            })
            $scope.Projects = [];
            return false;
            // });                         
        }
        function newUser(organizationId) {
            var location = ($stateParams.organizationId) ? '' : '/details/' + organizationId;
            organizationService.hrViewGroupBy = $scope.groupTab.name;
            organizationService.selectedTab = $("#kendo-tab-strip").kendoTabStrip().data("kendoTabStrip").select().index();
            $location.path($location.path() + location + '/users/new');
        }
        function newDepartment(organizationId) {
            var location = ($stateParams.organizationId) ? '' : '/details/' + organizationId;
            organizationService.hrViewGroupBy = $scope.groupTab.name;
            organizationService.selectedTab = $("#kendo-tab-strip").kendoTabStrip().data("kendoTabStrip").select().index();
            $location.path($location.path() + location + '/department/edit/0');
        }
        function editDepartment(departmentId) {
            var location = ($stateParams.organizationId) ? '' : '/details/' + $scope.selectedOrganizationDetailsTab.id;
            organizationService.hrViewGroupBy = $scope.groupTab.name;
            organizationService.selectedTab = $("#kendo-tab-strip").kendoTabStrip().data("kendoTabStrip").select().index();
            $location.path($location.path() + location + '/department/edit/' + departmentId);
        }
        function expandUsers(departmentId) {
            var userListId = '#department-' + departmentId;
            $(userListId + ' li.hide').removeClass('hide');
            $('#expand-button-' + departmentId).addClass('hide');
            $('#collapse-button-' + departmentId).removeClass('hide');
        }
        function collapseUsers(departmentId) {
            var userListId = '#department-' + departmentId;
            var users = $(userListId + ' li');
            for (var i = 0; i < users.length; i++) {
                (i >= 6) ? users[i].className = users[i].className + ' hide' : '';
            }
            $('#expand-button-' + departmentId).removeClass('hide');
            $('#collapse-button-' + departmentId).addClass('hide');
        }
        function numberOfUserPages() {
            if (organizationService.selectedOrganization) {
                return Math.ceil(organizationService.selectedOrganization.users.length / $scope.userPageSize);
            }
        }
        function previewUser(userId) {
            $location.path($location.path() + '/details/' + $scope.selectedOrganizationDetailsTab.id + '/users/preview/' + userId);
        }
        $scope.ChoosenTab = "";
        $scope.previewUser = previewUser;
        $scope.numberOfUserPages = numberOfUserPages;
        $scope.newDepartment = newDepartment;
        $scope.isOrganizationTeams = isOrganizationTeams;
        $scope.newUser = newUser;
        $scope.setSelectedTab = setSelectedTab;
        $scope.setProjectSelectedTab = setProjectSelectedTab;
        $scope.editDepartment = editDepartment;
        $scope.newTeam = newTeam;
        $scope.editTeam = editTeam;
        $scope.expandUsers = expandUsers;
        $scope.collapseUsers = collapseUsers;
        $scope.isDisabled = isDisabled;
        $scope.selectScorecardTab = selectScorecardTab;
        function selectScorecardTab() {
            $scope.scorecard.profileId = $scope.dashboard.profileId;
            $scope.scorecard.mainParticipantsOptions = $scope.dashboard.mainParticipantsOptions
            $scope.scorecard.participantsOptions = $scope.dashboard.participantsOptions;
            $scope.scorecard.mainParticipantsModel = $scope.dashboard.mainParticipantsModel;
            $scope.scorecard.participantsModel = $scope.dashboard.participantsModel;
            $("#scorecard").click();
            $scope.scorecard.getScorecardData();
            $scope.scorecard.isShowReport = true;
        }
        function setSelectedTab() {
            var tabstrip = $("#kendo-tab-strip").kendoTabStrip().data("kendoTabStrip");
        }
        function setProjectSelectedTab(el) {
            var tabstrip = $("#organization-project-tab-strip").kendoTabStrip().data("kendoTabStrip");
            if (tabstrip) {
                if (tabstrip.tabGroup) {
                    $scope.choosenOrganizationProjectTab = tabstrip.tabGroup.children("li[aria-selected=true]").attr('aria-controls');
                    if ($("#" + $scope.choosenOrganizationProjectTab + " .k-grid").data("kendoGrid")) {
                        $("#" + $scope.choosenOrganizationProjectTab + " .k-grid").data("kendoGrid").dataSource.read();
                    }
                }
            }
        }
        function activate() {
            getAllOrganization();
        }
        function createCacheFactory() {
            if (!$cacheFactory.get('cacheId')) {
                $scope.cache = $cacheFactory('cacheId');
            } else {
                $scope.cache = $cacheFactory.get('cacheId')
            }
        }

        function sortByName(a, b) {
            var aName = a.name.toLowerCase();
            var bName = b.name.toLowerCase();
            return ((aName < bName) ? -1 : ((aName > bName) ? 1 : 0));
        }
        function getOrganizationDetails(organizationId) {
            $location.path($location.path() + '/details/' + organizationId);
        }
        function editOrganization(organizationId) {
            $location.path($location.path() + '/edit/' + organizationId);
        }
        function addNewOrganization() {
            $location.path($location.path() + '/new');
        }
        function notification(message, callback) {
            $scope.notificationSavedSuccess.show(message, "info");
            callback();
        }
        function isEdit() {
            return ($location.path().indexOf('edit') > -1);
        }
        function goBack() {
            history.back();
        }
        function getAllOrganization() {
            progressBar.startProgress();
            var apiName = 'organization';
            var query = '?$select=Id,Name';
            organizationManager.getOrganizations(query).then(function (data) {
                progressBar.stopProgress();
                $scope.allOrganizations = data;
            });
        }
        function getAllOrganizations() {
            progressBar.startProgress();
            $scope.allOrganization = organizationManager.getOrganizations().then(function (data) {
                progressBar.stopProgress();
                data.sort(sortByName);
                var organization_obj = [data.length];
                for (var i = 0; i < data.length; i++) {
                    organization_obj[i] = {
                        id: data[i].id,
                        name: data[i].name,
                        logoLink: data[i].logoLink,
                        industryName: data[i].industry == null ? '' : data[i].industry.name,
                        countryImage: data[i].country == null ? '' : data[i].country.flagImage,
                        contactName: data[i].contactName
                    };
                }
                return organization_obj
            });
            if ($stateParams.organizationId != undefined) {
                GetOrganizationDetailsTab($stateParams.organizationId);
            }
        }
        function GetOrganizationDetailsTab(organizationId) {
            var apiName = 'organization';
            //var query = '?$select=Id,Name';
            $scope.dashboard.organizationId = organizationId;
            $scope.dashboard.organizationChanged();
            $scope.scorecard.organizationId = organizationId;
            $scope.scorecard.organizationChanged();
            $scope.dashboard.profileTypeChanged();
            $scope.scorecard.profileTypeChanged();
            //organizationService.getDashboardData().getDashboardData($scope.profileID);
            $rootScope.organization = {};
            $rootScope.organizationUsers = [];
            $rootScope.organization.organizationId = organizationId;
            organizationManager.getOrganizationById(organizationId, "$expand=Users($expand=JobPositions),Teams($expand=Link_TeamUsers($expand=User($expand=JobPositions))),Departments($expand=Users($expand=JobPositions),Teams)").then(function (data) {
                $scope.selectedOrganizationDetailsTab = data;
                $rootScope.organizationUsers = _.clone($scope.selectedOrganizationDetailsTab.users);
                kendo.ui.progress($(".chart-loading"), false);
                var gridObj = $("#organization-customers-grid").data("kendoGrid");
                if (gridObj) {
                    gridObj.dataSource.filter([]);
                    gridObj.dataSource.read();
                    angular.element("#customerCsvUploadFile").val(null);
                }
                $scope.organizationSales.clearAll();
            });
            getAllProjects()
        }
        function setCurrentPage(index) {
            var pageIndex = (index / 10).toString().split(".");
            $scope.$$childHead.__default__currentPage = (pageIndex[1] > 0) ? parseInt(pageIndex[0]) + 1 : parseInt(pageIndex[0]);
        }
        $scope.setCurrentPage = setCurrentPage;
        $scope.GetOrganizationDetailsTab = GetOrganizationDetailsTab;
        function onSelectTab(e) {
            organizationService.selectedTab = $("#kendo-tab-strip").kendoTabStrip().data("kendoTabStrip").select().index();
        }
        function onChange(arg) {
            kendo.ui.progress($(".chart-loading"), true);
            var grid = arg.sender;
            var selectedItem = grid.dataItem(grid.select());
            //	selectedOrganizationDetailsTab=
            organizationProjectsService.setProjects({
                activeProjects: [],
                expiredProjects: [],
                completedProjects: [],
                historyProjects: [],
                pendingProjects: [],
            });
            GetOrganizationDetailsTab(selectedItem.id);
            $("#kendo-tab-strip").kendoTabStrip({
                select: onSelectTab,
                contentUrls: [
                    "../app/views/organization/templates/details.html",
                    "../app/views/organization/templates/hr.html",
                    "../app/views/organization/templates/dashboard.html",
                    "../app/views/organization/templates/customers.html",
                    "../app/views/organization/templates/scorecard.html"
                ],
            });
            //	$($('#kendo-tab-strip').find('a.k-link')[1]).data('contentUrl', 'http://www.hotmail.com');
        }
        $scope.getOrganizationDetails = getOrganizationDetails;
        $scope.editOrganization = editOrganization;
        $scope.notification = notification;
        $scope.goBack = goBack;
        $scope.put = function (key, value) {
            $scope.cache.put(key, value === undefined ? null : value);
        }
        $scope.addNewOrganization = addNewOrganization;
        $scope.getAllOrganizations = getAllOrganizations
        $scope.gridOptions = {
            dataBound: function enumerator() {
                var rows = this.items();
                $(rows).each(function () {
                    var index = $(this).index() + 1;
                    var rowLabel = $(this).find(".row-number");
                    $(rowLabel).html(index);
                });
            },
            dataSource: {
                type: "json",
                transport: {
                    read: function (options) {
                        organizationManager.getOrganizations().then(function (data) {
                            data.sort(sortByName);
                            var organization_obj = [data.length];
                            for (var i = 0; i < data.length; i++) {
                                organization_obj[i] = {
                                    id: data[i].id,
                                    name: data[i].name,
                                    logoLink: data[i].logoLink,
                                    industryName: data[i].industry == null ? '' : data[i].industry.name,
                                    countryImage: data[i].country == null ? '' : data[i].country.flagImage,
                                    contactName: data[i].contactName
                                };
                            }
                            var object = [];
                            object['data'] = organization_obj;
                            options.success(object);
                        });
                    }
                },
                pageSize: 10,
                schema: {
                    data: 'data',
                    total: 'data.length'
                }
            },
            pageable: true,
            selectable: true,
            change: onChange,
            sortable: false,
            columns: [
                { field: 'rowNumber', title: "#", template: "<span class='row-number'></span>", width: 35, filterable: false },
                { field: "logo", title: $translate.instant('ORGANIZATIONS_LOGO'), template: "<img src='#: logo#' /> ", width: 70, filterable: false },
                { field: "name", title: $translate.instant('COMMON_NAME') },
                { field: "industryName", title: $translate.instant('COMMON_INDUSTRY') },
                { field: "countryImage", title: $translate.instant('ORGANIZATIONS_COUNTRY'), width: 100, filterable: false },
                { field: "contactName", title: $translate.instant('ORGANIZATIONS_CONTACT_NAME') },
                //{ field: "", title: "", width: 100, filterable: false },
            ],
            rowTemplate:
                "<tr class='oraganization-row' data-uid='#: uid #'>" +
                "<td><span class='row-number'></span></td>" +
                "<td class='org-logo'><div style='width:60px;height:40px;'><img src='{{dataItem.logoLink && dataItem.logoLink || organizationPlaceholder }} ' width='100%', height='100%' /></div></td>" +
                "<td class='org-name'>{{dataItem.name}}</td>" +
                "<td>{{dataItem.industryName}}</td>" +
                "<td><img class='org-country' src='{{dataItem.countryImage}}' /> </td>" +
                "<td>{{dataItem.contactName}}</td>" +
                "<td>" +
                "<div class='icon-groups'><a class='icon-groups icon-groups-item view-icon' ng-click='getOrganizationDetails(dataItem.id)' ></a></div>" +
                "<div class='icon-groups'><a class='icon-groups icon-groups-item edit-icon' ng-click='editOrganization(dataItem.id)' ></a></div>" +
                "</td>" +
                "</tr>"
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
        $scope.$watch('$$childHead.dashboard', function (d) {
            $scope.dashboard = d;
            cssInjector.removeAll();
            cssInjector.add('views/organization/organization.css');
        });
        $scope.$watch('$$childHead.scorecard', function (d) {
            $scope.scorecard = d;
            cssInjector.removeAll();
            cssInjector.add('views/organization/organization.css');
        })
    }])
    .controller('OrganizationUsersCtrl', ['$scope', '$controller', '$rootScope', '$location', '$stateParams', 'authService', '$cacheFactory', 'cssInjector', 'organizationService', 'organizationManager', '$translate', 'users', 'organizations', function ($scope, $controller, $rootScope, $location, $stateParams, authService, $cacheFactory, cssInjector, organizationService, organizationManager, $translate, users, organizations) {
        cssInjector.removeAll();
        cssInjector.add('views/organization/user/userslist.css');
        $scope.authService = authService;
        $scope.users = users;
        $scope.organizations = organizations;
        $scope.selectedOrganization = null;
        if ($stateParams.organizationId > 0) {
            $scope.selectedOrganization = _.find(organizations, function (item) {
                return item.id == $stateParams.organizationId;
            })
        }
        $scope.changeOrganization = function (organizationId) {
            if (organizationId > 0) {
                $scope.selectedOrganization = _.find(organizations, function (item) {
                    return item.id == organizationId;
                })
                organizationManager.getOrganizationUsers(organizationId).then(function (data) {
                    if (data) {
                        $scope.users = data;
                    }
                });
            }
        }
        $scope.filterUsers = function (item) {
            var result = false;
            if ($scope.searchText) {
                if (item.firstName.toLowerCase().indexOf($scope.searchText.toLowerCase()) > -1 || item.lastName.toLowerCase().indexOf($scope.searchText.toLowerCase()) > -1) {
                    result = true;
                }
            }
            else {
                result = true;
            }
            return result;
        }

        $scope.newUser = function () {
            var location = "/home/organizations/NewUser/" + $scope.selectedOrganization.id
            $location.path(location);
        }
        $scope.editUser = function (userkey) {
            var location = '/home/organizations/userdetail/' + userkey;
            $location.path(location);
        }
        App.initSlimScroll(".scroller");

    }])
    .controller('UserDetailPreviewCtrl', ['$scope', '$location', 'apiService', 'authService', '$stateParams', 'cssInjector', '$q', 'localStorageService', 'user', '$state', 'organizationManager', 'userManager', 'roles', 'organizations', 'Upload', '$translate', function ($scope, $location, apiService, authService, $stateParams, cssInjector, $q, localStorageService, user, $state, organizationManager, userManager, roles, organizations, Upload, $translate) {
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
            $scope.user['organizationId'] = $scope.userOrganization.id;
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

                $scope.notificationSavedSuccess.show($translate.instant('ORGANIZATIONS_USER_ROLES_SAVED_SUCCESSFULLY'), "info");

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
    }])
    .controller('newDepartmentCtrl', ['$scope', '$location', 'apiService', 'authService', '$stateParams', 'cssInjector', '$q', 'dialogService', 'department', 'organizationUsers', 'organization', '$translate', function ($scope, $location, apiService, authService, $stateParams, cssInjector, $q, dialogService, department, organizationUsers, organization, $translate) {
        $scope.organization = organization;
        $scope.organizationUsers = organizationUsers;
        $scope.departmentUsers = {};
        $scope.departmentInfo = department;
        if (department.id > 0) {
            $scope.departmentInfo["manager"] = _.find(organizationUsers, function (item) {
                return item.id == $scope.departmentInfo.managerId;
            });
        }
        $scope.userSearch;
        $scope.createNewDepartment = function () {
            var apiName = 'department';
            if ($scope.departmentInfo) {
                var newEntity = {
                    name: ($scope.departmentInfo.name) ? $scope.departmentInfo.name : '',
                    description: ($scope.departmentInfo.description) ? $scope.departmentInfo.description : '',
                    organizationId: $scope.departmentInfo.organizationId ? $scope.departmentInfo.organizationId : authService.authentication.user.organizationId,
                    managerId: ($scope.departmentInfo.manager) ? $scope.departmentInfo.manager.id : '',
                    email: ($scope.departmentInfo.email) ? $scope.departmentInfo.email : '',
                    phone: ($scope.departmentInfo.phone) ? $scope.departmentInfo.phone : '',
                    users: ($scope.departmentInfo.users) ? $scope.departmentInfo.users : '',
                    isActive: $scope.departmentInfo.isActive,
                }
                apiService.add(apiName, newEntity).then(function (data) {
                    (data) ? dialogService.showNotification($translate.instant('ORGANIZATIONS_DEPARTMENT_SAVED_SUCCESSFULLY'), refreshOrganization) : dialogService.showNotification($translate.instant('ORGANIZATIONS_SAVE_FAILED'));
                });
            }
        };
        $scope.addDepartmentUser = function (user) {
            $scope.departmentUsers[user.id] = user;
        }
        $scope.removeDepartmentUser = function (userId) {
            delete $scope.departmentUsers[userId];
        }
        $scope.isDepartmentUser = function (userId) {
            if ($scope.departmentUsers[userId]) {
                return true;
            }
            return false;
        }
        $scope.addUsersToDepartment = function () {
            if ($scope.departmentUsers) {
                var users = [];
                for (var user in $scope.departmentUsers) {
                    users.push($scope.departmentUsers[user]);
                }
                $scope.departmentInfo['users'] = users;
            }
        }
        $scope.setDepartmentManagerInfo = function () {
            if ($scope.departmentInfo.manager) {
                (!$scope.departmentInfo.email) ? $scope.departmentInfo.email = $scope.departmentInfo.manager.workEmail : '';
                (!$scope.departmentInfo.phone) ? $scope.departmentInfo.phone = $scope.departmentInfo.manager.workPhoneNo : '';
            }
        }
        $scope.saveDepartment = function () {
            isEdit() ? updateDepartment() : createNewDepartment();
        }
        function isEdit() {
            return $stateParams.departmentId > 0; //($location.path().indexOf('department/edit') > -1);
        }
        function updateDepartment() {
            var apiName = 'department';
            if ($scope.departmentInfo) {
                var departmentEntity = {
                    name: ($scope.departmentInfo.name) ? $scope.departmentInfo.name : '',
                    description: ($scope.departmentInfo.description) ? $scope.departmentInfo.description : '',
                    organizationId: ($scope.departmentInfo.organizationId) ? $scope.departmentInfo.organizationId : '',
                    id: ($scope.departmentInfo) ? $scope.departmentInfo.id : '',
                    managerId: ($scope.departmentInfo.manager) ? $scope.departmentInfo.manager.id : '',
                    email: ($scope.departmentInfo.email) ? $scope.departmentInfo.email : '',
                    phone: ($scope.departmentInfo.phone) ? $scope.departmentInfo.phone : '',
                    users: ($scope.departmentInfo.users) ? $scope.departmentInfo.users : '',
                    isActive: $scope.departmentInfo.isActive,
                }
                apiService.update(apiName, departmentEntity).then(function (data) {
                    if (data) {
                        dialogService.showNotification($translate.instant('ORGANIZATIONS_DEPARTMENT_SAVED_SUCCESSFULLY'), "info");
                        var location = '/home/organizations/departments/' + $scope.departmentInfo.organizationId;
                        $location.path(location);
                    }
                    else {
                        dialogService.showNotification($translate.instant('ORGANIZATIONS_SAVE_FAILED'), "warning");
                    }
                });
            }
        }
        function createNewDepartment() {
            var apiName = 'department';
            if ($scope.departmentInfo) {
                var newEntity = {
                    name: ($scope.departmentInfo.name) ? $scope.departmentInfo.name : '',
                    description: ($scope.departmentInfo.description) ? $scope.departmentInfo.description : '',
                    organizationId: ($scope.departmentInfo.organizationId) ? $scope.departmentInfo.organizationId : '',
                    managerId: ($scope.departmentInfo.manager) ? $scope.departmentInfo.manager.id : '',
                    email: ($scope.departmentInfo.email) ? $scope.departmentInfo.email : '',
                    phone: ($scope.departmentInfo.phone) ? $scope.departmentInfo.phone : '',
                    users: ($scope.departmentInfo.users) ? $scope.departmentInfo.users : '',
                    isActive: $scope.departmentInfo.isActive,
                }
                _.each(newEntity.users, function (departmentUser) {
                    departmentUser.user = null;
                });
                apiService.add(apiName, newEntity).then(function (data) {
                    if (data) {
                        dialogService.showNotification($translate.instant('ORGANIZATIONS_DEPARTMENT_SAVED_SUCCESSFULLY'), "info");
                        var location = '/home/organizations/departments/' + $scope.departmentInfo.organizationId;
                        $location.path(location);
                    }
                    else {
                        dialogService.showNotification($translate.instant('ORGANIZATIONS_SAVE_FAILED'), "warning");
                    }
                });
            }
        }
    }])
    .controller('OrganizationDepartmentsCtrl', ['$scope', 'apiService', 'dialogService', '$location', '$stateParams', 'authService', '$cacheFactory', 'cssInjector', 'organizationService', 'organizationManager', '$translate', 'departments', 'organizations', function ($scope, apiService, dialogService, $location, $stateParams, authService, $cacheFactory, cssInjector, organizationService, organizationManager, $translate, departments, organizations) {
        cssInjector.removeAll();
        cssInjector.add('views/organization/department/departmentlist.css');
        $scope.authService = authService;
        $scope.departments = departments;
        $scope.organizations = organizations;
        $scope.selectedOrganization = null;
        if ($stateParams.organizationId > 0) {
            $scope.selectedOrganization = _.find(organizations, function (item) {
                return item.id == $stateParams.organizationId;
            })
        }
        $scope.changeOrganization = function (organizationId) {
            if (organizationId > 0) {
                $scope.selectedOrganization = _.find(organizations, function (item) {
                    return item.id == organizationId;
                })
                organizationManager.getOrganizationDepartments(organizationId).then(function (data) {
                    if (data) {
                        $scope.departments = data;
                    }
                });
            }
        }
        $scope.filterDepartments = function (item) {
            var result = false;
            if ($scope.searchText) {
                if (item.name.toLowerCase().indexOf($scope.searchText.toLowerCase()) > -1) {
                    result = true;
                }
            }
            else {
                result = true;
            }
            return result;
        }
        $scope.editDepartment = function (departmentId) {
            var location = '/home/organizations/DepartmentDetail/' + departmentId;
            $location.path(location);
        }
        $scope.removeDepartment = function (departmentId) {
            var apiName = 'department';
            if (departmentId) {
                dialogService.showYesNoDialog($translate.instant('COMMON_CONFIRM'), "Are you sure want to delete this Department").then(function (data) {
                    apiService.remove(apiName, departmentId).then(function (data) {
                        if (data) {
                            dialogService.showNotification($translate.instant('ORGANIZATIONS_DEPARTMENT_REMOVED_SUCCESSFULLY'), 'info')
                            var departmentList = _.filter($scope.departments, function (item) {
                                return item.id != departmentId;
                            });
                            $scope.departments = departmentList;
                        }
                        else {
                            dialogService.showNotification($translate.instant('ORGANIZATIONS_DEPARTMENT_REMOVED_FAILED'), 'info');
                        }

                    });
                })

            }
        }

        $scope.newDepartment = function () {
            var location = "/home/organizations/newDepartment/" + $scope.selectedOrganization.id
            $location.path(location);
        }
        App.initSlimScroll(".scroller");
    }])
    .controller('ImportOrganizationCtrl', ['$scope', 'progressBar', '$stateParams', 'authService', 'cssInjector', 'organizationService', 'organizationManager', '$translate', 'organizations', 'Upload', 'dialogService', '$location', function ($scope, progressBar, $stateParams, authService, cssInjector, organizationService, organizationManager, $translate, organizations, Upload, dialogService, $location) {
        cssInjector.removeAll();
        $scope.authService = authService;
        $scope.organizations = organizations;
        $scope.selectedOrganization = null;
        $scope.fileName = null; k
        if ($stateParams.organizationId > 0) {
            $scope.selectedOrganization = _.find(organizations, function (item) {
                return item.id == $stateParams.organizationId;
            })
        }
        $scope.changeOrganization = function (organizationId) {
            if (organizationId > 0) {
                $scope.selectedOrganization = _.find(organizations, function (item) {
                    return item.id == organizationId;
                })
            }
        }
        $scope.onFileSelect = function ($files) {
            for (var i = 0; i < $files.length; i++) {
                var $file = $files[i];
                var fileMimeTypeArr = ["text/comma-separated-values", "text/csv", "application/csv", "application/vnd.ms-excel"];
                if (fileMimeTypeArr.indexOf($file.type) > -1) {
                    (function (index) {
                        progressBar.startProgress();
                        Upload.upload({
                            url: "../api/api/upload/organizationCSV",
                            method: "POST",
                            file: $file
                        }).progress(function (evt) {
                            console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));
                        }).success(function (data) {
                            progressBar.stopProgress();
                            $scope.fileName = data;
                        }).error(function (data) {
                            dialogService.showNotification(data, 'warning');
                        });
                    })(i);
                }
                else {
                    angular.element("#customerCsvUploadFile").val(null)
                    dialogService.showNotification($translate.instant('ORGANIZATIONS_SELECT_VALID_CSV'), "warning")
                }
            }
        };

        $scope.saveOrganizations = function () {
            if ($scope.fileName && $scope.selectedOrganization) {
                progressBar.startProgress();
                organizationManager.importOrganizationCSV($scope.fileName, $scope.selectedOrganization.id).then(function (data) {
                    progressBar.stopProgress();
                    if (data) {
                        $scope.fileName = null;
                        angular.element("#organizationCsvUploadFile").val(null);
                        dialogService.showNotification("Organization Impoted success fully", "info");
                        var location = '/home/organizations/organizations';
                        $location.path(location);
                    }
                },
                    function (data) {
                        progressBar.stopProgress();
                        dialogService.showNotification($translate.instant('ORGANIZATIONS_CUSTOMER_IMPORT_FAILED'), "warning");
                    });
            }
        }

    }])

    .controller('ImportOrganizationUsersCtrl', ['$scope', 'progressBar', '$stateParams', 'authService', 'cssInjector', 'organizationService', 'organizationManager', '$translate', 'organizations', 'Upload', 'dialogService', '$location', function ($scope, progressBar, $stateParams, authService, cssInjector, organizationService, organizationManager, $translate, organizations, Upload, dialogService, $location) {
        cssInjector.removeAll();
        $scope.authService = authService;
        $scope.organizations = organizations;
        $scope.selectedOrganization = null;
        $scope.fileName = null; k
        if ($stateParams.organizationId > 0) {
            $scope.selectedOrganization = _.find(organizations, function (item) {
                return item.id == $stateParams.organizationId;
            })
        }
        $scope.changeOrganization = function (organizationId) {
            if (organizationId > 0) {
                $scope.selectedOrganization = _.find(organizations, function (item) {
                    return item.id == organizationId;
                })
            }
        }
        $scope.onFileSelect = function ($files) {
            for (var i = 0; i < $files.length; i++) {
                var $file = $files[i];
                var fileMimeTypeArr = ["text/comma-separated-values", "text/csv", "application/csv", "application/vnd.ms-excel"];
                if (fileMimeTypeArr.indexOf($file.type) > -1) {
                    (function (index) {
                        progressBar.startProgress();
                        Upload.upload({
                            url: "../api/api/upload/organizationCSV",
                            method: "POST",
                            file: $file
                        }).progress(function (evt) {
                            console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));
                        }).success(function (data) {
                            progressBar.stopProgress();
                            $scope.fileName = data;
                        }).error(function (data) {
                            dialogService.showNotification(data, 'warning');
                        });
                    })(i);
                }
                else {
                    angular.element("#customerCsvUploadFile").val(null)
                    dialogService.showNotification($translate.instant('ORGANIZATIONS_SELECT_VALID_CSV'), "warning")
                }
            }
        };

        $scope.saveOrganizations = function () {
            if ($scope.fileName && $scope.selectedOrganization) {
                progressBar.startProgress();
                organizationManager.importOrganizationCSV($scope.fileName, $scope.selectedOrganization.id).then(function (data) {
                    progressBar.stopProgress();
                    if (data) {
                        $scope.fileName = null;
                        angular.element("#organizationCsvUploadFile").val(null);
                        dialogService.showNotification("Organization Impoted success fully", "info");
                        var location = '/home/organizations/organizations';
                        $location.path(location);
                    }
                },
                    function (data) {
                        progressBar.stopProgress();
                        dialogService.showNotification($translate.instant('ORGANIZATIONS_CUSTOMER_IMPORT_FAILED'), "warning");
                    });
            }
        }

    }])

    .controller('OrganizationTeamsCtrl', ['$scope', 'apiService', 'dialogService', '$location', '$stateParams', 'authService', '$cacheFactory', 'cssInjector', 'organizationService', 'organizationManager', '$translate', 'organizationTeams', 'organizationDepartments', 'organizationUsers', 'organizations', function ($scope, apiService, dialogService, $location, $stateParams, authService, $cacheFactory, cssInjector, organizationService, organizationManager, $translate, organizationTeams, organizationDepartments, organizationUsers, organizations) {
        cssInjector.removeAll();
        cssInjector.add('views/organization/team/teamlist.css');
        $scope.authService = authService;
        $scope.teams = organizationTeams;
        $scope.departments = organizationDepartments;
        $scope.departments.unshift({ id: null, name: "--Select Department--" });
        $scope.organizations = organizations;
        $scope.organizationUsers = organizationUsers;

        _.each($scope.teams, function (teamItem) {
            if (teamItem.teamLeadId) {
                teamItem["teamLead"] = _.find(organizationUsers, function (orgUserItem) {
                    return orgUserItem.id == teamItem.teamLeadId;
                });
            }
            _.each(teamItem.link_TeamUsers, function (teamUserItem) {
                teamUserItem.user = _.find(organizationUsers, function (useritem) {
                    return useritem.id == teamUserItem.userId;
                });
            })
        })
        $scope.selectedOrganization = null;
        $scope.selectedDepartment = null;
        if ($stateParams.organizationId > 0) {
            $scope.selectedOrganization = _.find(organizations, function (item) {
                return item.id == $stateParams.organizationId;
            })
        }
        $scope.changeOrganization = function (organizationId) {
            $scope.selectedDepartment = null;
            if (organizationId > 0) {
                $scope.selectedOrganization = _.find(organizations, function (item) {
                    return item.id == organizationId;
                })
                organizationManager.getOrganizationDepartments(organizationId).then(function (data) {
                    if (data) {
                        organizationDepartments = data;
                        $scope.departments = data;
                        $scope.departments.unshift({ id: null, name: "--Select Department--" });
                    }
                });
                organizationManager.getOrganizationUsers(organizationId).then(function (usersData) {
                    organizationUsers = usersData;
                    $scope.organizationUsers = usersData;
                    organizationManager.getOrganizationTeams(organizationId).then(function (data) {
                        if (data) {
                            $scope.teams = data;
                            _.each($scope.teams, function (teamItem) {
                                _.each(teamItem.link_TeamUsers, function (teamUserItem) {
                                    teamUserItem.user = _.find(organizationUsers, function (useritem) {
                                        return useritem.id == teamUserItem.userId;
                                    });
                                })
                            })
                        }
                    })
                })
            }
        }
        $scope.changeDepartment = function (departmentId) {
            $scope.selectedDepartment = null;
            if (departmentId > 0) {
                $scope.selectedDepartment = _.find($scope.departments, function (item) {
                    return item.id == departmentId;
                })
            }
        }
        $scope.getDepartmentName = function (departmentId) {
            if (departmentId > 0) {
                var department = _.find($scope.departments, function (item) {
                    return item.id == departmentId;
                });
                if (department) {
                    return department.name;
                }
            }
        }

        $scope.filterTeamsByDepartment = function (item) {
            var result = false;
            if ($scope.selectedDepartment) {
                if ($scope.selectedDepartment.id == item.departmentId) {
                    result = true;
                }
            }
            else {
                result = true;
            }
            return result;
        }
        $scope.editTeam = function (teamId) {
            if (teamId) {
                var location = '/home/organizations/TeamDetail/' + teamId;
                $location.path(location);
            }
        }
        $scope.removeTeam = function (teamId, organizationId) {
            var apiName = 'team';
            if (teamId) {
                dialogService.showYesNoDialog($translate.instant('COMMON_CONFIRM'), "Are you sure want to delete this Team").then(function (data) {
                    apiService.remove(apiName, teamId).then(function (data) {
                        if (data) {
                            dialogService.showNotification($translate.instant('ORGANIZATIONS_TEAM_REMOVED_SUCCESSFULLY'), 'info')
                            organizationManager.getOrganizationUsers(organizationId).then(function (usersData) {
                                organizationUsers = usersData;
                                $scope.organizationUsers = usersData;
                                organizationManager.getOrganizationTeams(organizationId).then(function (data) {
                                    if (data) {
                                        $scope.teams = data;
                                        _.each($scope.teams, function (teamItem) {
                                            _.each(teamItem.link_TeamUsers, function (teamUserItem) {
                                                teamUserItem.user = _.find(organizationUsers, function (useritem) {
                                                    return useritem.id == teamUserItem.userId;
                                                });
                                            })
                                        })
                                    }
                                })
                            })
                        }
                        else {
                            dialogService.showNotification($translate.instant('ORGANIZATIONS_TEAM_REMOVED_FAILED'), 'info');
                        }
                    });
                })

            }
        }


        $scope.newDepartment = function () {
            var location = "/home/organizations/newDepartment/" + $scope.selectedOrganization.id
            $location.path(location);
        }
        App.initSlimScroll(".scroller");
    }])
    .controller('newTeamCtrl', ['$scope', '$location', 'apiService', 'dialogService', '$stateParams', 'cssInjector', '$q', 'localStorageService', 'team', 'organizationDepartments', 'organizationUsers', 'organization', '$translate', function ($scope, $location, apiService, dialogService, $stateParams, cssInjector, $q, localStorageService, team, organizationDepartments, organizationUsers, organization, $translate) {
        cssInjector.removeAll();
        cssInjector.add('views/organization/team/teamlist.css');
        $scope.organization = organization;
        $scope.organizationUsers = organizationUsers;
        $scope.organizationDepartments = organizationDepartments;
        $scope.teamUsers = {};
        $scope.teamInfo = team;
        $scope.userSearch = null;
        if (team.id > 0) {
            $scope.teamInfo["teamLead"] = _.find(organizationUsers, function (item) {
                return item.id == $scope.teamInfo.teamLeadId;
            });

            $scope.teamInfo["parentDepartment"] = _.find(organizationDepartments, function (item) {
                return item.id == $scope.teamInfo.departmentId;
            });
            _.each($scope.teamInfo.link_TeamUsers, function (teamUserItem) {
                $scope.teamUsers[teamUserItem.userId] = teamUserItem.user;
            });
        }
        $scope.filterUsersByDepartment = function (item) {
            var result = false;
            if ($scope.teamInfo.parentDepartment) {
                if ($scope.teamInfo.parentDepartment.id > 0) {
                    var isDepartmentUser = _.any($scope.teamInfo.parentDepartment.users, function (departmentUserItem) {
                        return departmentUserItem.id == item.id;
                    });
                    return isDepartmentUser;
                }
                else {
                    result = true;
                }
            }
            else {
                result = true;
            }
            return result;
        };
        $scope.filterTeamMemberUsers = function (item) {
            var result = false;
            if ($scope.teamInfo.parentDepartment) {
                if ($scope.teamInfo.parentDepartment.id > 0) {
                    var isDepartmentUser = _.any($scope.teamInfo.parentDepartment.users, function (departmentUserItem) {
                        return departmentUserItem.id == item.id;
                    });
                    result = isDepartmentUser;
                }
                else {
                    result = true;
                }
            }
            else {
                result = true;
            }

            if (result && $scope.userSearch) {
                if (item.firstName.toLowerCase().indexOf($scope.userSearch.toLowerCase()) > -1 || item.lastName.toLowerCase().indexOf($scope.userSearch.toLowerCase()) > -1) {
                    result = true;
                }
                else {
                    result = false;
                }
            }
            return result;
        }

        $scope.changeTeamDepartment = function () {
            $scope.teamInfo.teamLead = null;
            $scope.teamInfo['link_TeamUsers'] = [];
        }
        $scope.addTeamUser = function (user) {
            $scope.teamUsers[user.id] = user;
        }
        $scope.removeTeamUser = function (userId) {
            delete $scope.teamUsers[userId];
        }
        $scope.isTeamUser = function (userId) {
            if ($scope.teamUsers[userId]) {
                return true;
            }
            return false;
        }
        $scope.isTeamLeader = function (userId) {
            if ($scope.teamInfo.teamLead) {
                if (userId == $scope.teamInfo.teamLead.id) {
                    return true;
                }
            }
            return false;
        }
        $scope.addUsersToTeam = function () {
            $scope.teamInfo['link_TeamUsers'] = [];
            if ($scope.teamUsers) {
                var users = [];
                for (var user in $scope.teamUsers) {
                    users.push($scope.teamUsers[user]);
                    var linkTeamUser = {
                        teamId: $scope.teamInfo.id,
                        roleInTeam: null,
                        userid: user,
                        user: $scope.teamUsers[user]
                    };
                    $scope.teamInfo['link_TeamUsers'].push(linkTeamUser);
                }
            }
        }
        $scope.setTeamLeaderInfo = function () {
            if ($scope.teamInfo.teamLead) {
                (!$scope.teamInfo.email) ? $scope.teamInfo.email = $scope.teamInfo.teamLead.workEmail : '';
                (!$scope.teamInfo.phone) ? $scope.teamInfo.phone = $scope.teamInfo.teamLead.workPhoneNo : $scope.teamInfo.teamLead.mobileNo;
            }
        }
        $scope.saveTeam = function () {
            isEdit() ? updateTeam() : createNewTeam();
        }
        function isEdit() {
            return $stateParams.teamId > 0;
        }
        function updateTeam() {
            var apiName = 'team';
            if ($scope.teamInfo) {
                var teamEntity = {
                    name: $scope.teamInfo.name,
                    description: $scope.teamInfo.description,
                    organizationId: ($scope.teamInfo.organizationId) ? $scope.teamInfo.organizationId : '',
                    id: ($scope.teamInfo.id) ? $scope.teamInfo.id : '',
                    teamLeadId: ($scope.teamInfo.teamLead) ? $scope.teamInfo.teamLead.id : '',
                    departmentId: ($scope.teamInfo.parentDepartment) ? $scope.teamInfo.parentDepartment.id : '',
                    email: $scope.teamInfo.email,
                    phone: $scope.teamInfo.phone,
                    link_TeamUsers: $scope.teamInfo.link_TeamUsers,
                    isActive: $scope.teamInfo.isActive,
                }

                apiService.update(apiName, teamEntity).then(function (data) {
                    if (data) {
                        dialogService.showNotification($translate.instant('ORGANIZATIONS_TEAM_SAVED_SUCCESSFULLY'), "info");
                        var location = "/home/organizations/teams/" + $scope.teamInfo.organizationId
                        $location.path(location);
                    }
                    else {
                        dialogService.showNotification($translate.instant('ORGANIZATIONS_SAVE_FAILED'), "warning");
                    }
                });
            }
        }
        function createNewTeam() {
            var apiName = 'team';
            if ($scope.teamInfo) {
                var newEntity = {
                    name: $scope.teamInfo.name,
                    description: $scope.teamInfo.description,
                    organizationId: $scope.teamInfo.organizationId,
                    teamLeadId: ($scope.teamInfo.teamLead) ? $scope.teamInfo.teamLead.id : '',
                    email: $scope.teamInfo.email,
                    departmentId: ($scope.teamInfo.parentDepartment) ? $scope.teamInfo.parentDepartment.id : '',
                    phone: $scope.teamInfo.phone,
                    link_TeamUsers: $scope.teamInfo.link_TeamUsers,
                    isActive: $scope.teamInfo.isActive,
                }
                _.each(newEntity.link_TeamUsers, function (teamUser) {
                    teamUser.user = null;
                });
                apiService.add(apiName, newEntity).then(function (data) {
                    if (data) {
                        dialogService.showNotification($translate.instant('ORGANIZATIONS_TEAM_SAVED_SUCCESSFULLY'), "info");
                        var location = "/home/organizations/teams/" + $scope.teamInfo.organizationId
                        $location.path(location);

                    }
                    else {
                        dialogService.showNotification($translate.instant('ORGANIZATIONS_SAVE_FAILED'), "warning");
                    }
                });
            }
        }
    }])


    .controller('activeOrganizationProjectsTabCtrl', ['cssInjector', 'organizationProjectsService', '$location', 'projectRolesEnum', '$translate', 'globalVariables',
        function (cssInjector, organizationProjectsService, $location, projectRolesEnum, $translate, globalVariables) {
            //cssInjector.removeAll();
            //cssInjector.add('views/activeProjects/activeProjects.css');
            moment.locale(globalVariables.lang.currentUICulture);
            var vm = this; $location
            vm.activeProjectsOptions = {
                dataSource: {
                    type: "json",
                    transport: {
                        read: function (options) {
                            organizationProjectsService.getActiveProjects().then(function (data) {
                                //_.each(data, function (item) {
                                //    item.expectedStartDate = moment(kendo.parseDate(item.expectedStartDate)).format("L LT");
                                //    item.expectedEndDate = moment(kendo.parseDate(item.expectedEndDate)).format("L LT");
                                //})
                                options.success(data);
                            })
                        }
                    }
                },
                selectable: false,
                sortable: true,
                resizable: true,
                columns: [
                    { field: "name", title: $translate.instant('COMMON_NAME') },
                    { field: "projectRoleName", title: $translate.instant('COMMON_ROLE') },
                    {
                        field: "expectedStartDate",
                        title: $translate.instant('COMMON_START_DATE'),
                        filterable: false,
                        template: function (dataItem) {
                            return moment(kendo.parseDate(dataItem.expectedStartDate)).format("L LT");
                        }
                    },
                    {
                        field: "expectedEndDate",
                        title: $translate.instant('COMMON_END_DATE'),
                        filterable: false,
                        template: function (dataItem) {
                            return moment(kendo.parseDate(dataItem.expectedEndDate)).format("L LT");
                        }
                    },
                    {
                        field: "missionStatement", title: $translate.instant('ORGANIZATIONS_MISSION'),
                        attributes: {
                            "class": "missionStatement"
                        },
                        template: '<div class="statement-cell"> {{dataItem.missionStatement}}</div>'
                    },
                    {
                        field: "visionStatement", title: $translate.instant('ORGANIZATIONS_VISION'), attributes: {
                            "class": "visionStatement"
                        },
                        template: '<div class="statement-cell"> {{dataItem.visionStatement}}</div>'
                    },
                    {
                        field: "goalStatement", title: $translate.instant('ORGANIZATIONS_GOALS'),
                        attributes: {
                            "class": "goalStatement"
                        }, template: function (dataItem) {
                            if (dataItem.goalStatement) {
                                return '<div class="statement-cell">' + dataItem.goalStatement.join(",") + '</div>';
                            }
                        }
                    },
                    {
                        field: "stratagiesStatement", title: $translate.instant('ORGANIZATIONS_STRATEGIES'),
                        attributes: {
                            "class": "stratagiesStatement"
                        },
                        template: function (dataItem) {
                            if (dataItem.stratagiesStatement) {
                                return '<div class="statement-cell">' + dataItem.stratagiesStatement.join(",") + '</div>';
                            }
                        }
                    },
                    {
                        field: "totalActiveProfiles", title: "# " + $translate.instant('ORGANIZATIONS_ACTIVE_PROFILES'),
                    },
                    {
                        field: "totalExpiredProfiles", title: "# " + $translate.instant('ORGANIZATIONS_EXPIRED_PROFILES'),
                    },
                    {
                        field: "totalCompletedProfiles", title: "# " + $translate.instant('ORGANIZATIONS_COMPLETED_PROFILES'),
                    },
                    {
                        field: "", title: $translate.instant('COMMON_ACTIONS'), template: "<div class='icon-groups'>" +
                            "<a class='fa fa-lg fa-eye' title='View Project'  ng-click='activeProjects.viewproject(dataItem.id)'></a>" +
                            "<a class='fa fa-lg fa-pencil' title='Edit Project ' ng-show='activeProjects.isAllowEdit(dataItem.projectRoleId)' ng-click='activeProjects.editproject(dataItem.id)'></a>" +
                            "<a class='fa fa-lg fa-info' title='Project Status' ng-show='activeProjects.isAllowEdit(dataItem.projectRoleId)' ng-click='activeProjects.projectStatus(dataItem.id)'></a>" +
                            "<a class='fa fa-lg fa-list' title='View Project Profiles' ng-click='activeProjects.viewprojectprofiles(dataItem.id)'></a>" +
                            "</div>"
                    }
                    //{ field: "", title: "", width: 100, filterable: false },
                ]
            }
            vm.tooltipOptions = $(".active-projects-grid").kendoTooltip({
                filter: "th.k-header",
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
            }).data("tooltiptext");
            vm.newProject = function () {
                $location.path("/newproject");
            }
            vm.editproject = function (id) {
                $location.path("/editproject/" + id);
            }
            vm.projectStatus = function (id) {
                $location.path("/projectStatus/" + id);
            }
            vm.viewproject = function (id) {
                $location.path("/viewproject/" + id);
            }
            vm.viewprojectprofiles = function (projectId) {
                $location.path("/projectprofiles/" + projectId);
            }
            vm.isAllowEdit = function (projectRoleId) {
                if (projectRoleId == projectRolesEnum.projectManager) {
                    return true;
                }
                else {
                    return false;
                }
            }
        }])
    .controller('completedOrganizationProjectTabCtrl', ['cssInjector', 'organizationProjectsService', '$location', 'profilesTypesEnum', 'evaluationRolesEnum', '$translate', 'globalVariables',
        function (cssInjector, organizationProjectsService, $location, profilesTypesEnum, evaluationRolesEnum, $translate, globalVariables) {
            //cssInjector.removeAll();
            //cssInjector.add('views/activeProfiles/activeProfiles.css');
            moment.locale(globalVariables.lang.currentUICulture);
            var vm = this;
            vm.completedOptions = {
                dataSource: {
                    type: "json",
                    transport: {
                        read: function (options) {
                            organizationProjectsService.getCompletedProjects().then(function (data) {
                                //_.each(data, function (item) {
                                //    item.expectedStartDate = moment(kendo.parseDate(item.expectedStartDate)).format("L LT");
                                //    item.expectedEndDate = moment(kendo.parseDate(item.expectedEndDate)).format("L LT");
                                //})
                                options.success(data);
                            })
                        }
                    }
                },
                selectable: false,
                sortable: true,
                resizable: true,
                columns: [
                    { field: "name", title: $translate.instant('COMMON_NAME') },
                    { field: "projectRoleName", title: $translate.instant('COMMON_ROLE') },
                    {
                        field: "expectedStartDate",
                        title: $translate.instant('COMMON_START_DATE'),
                        filterable: false,
                        template: function (dataItem) {
                            return moment(kendo.parseDate(dataItem.expectedStartDate)).format("L LT");
                        }
                    },
                    {
                        field: "expectedEndDate",
                        title: $translate.instant('COMMON_END_DATE'),
                        filterable: false,
                        template: function (dataItem) {
                            return moment(kendo.parseDate(dataItem.expectedEndDate)).format("L LT");
                        }
                    },
                    {
                        field: "missionStatement", title: $translate.instant('ORGANIZATIONS_MISSION'),
                        attributes: {
                            "class": "missionStatement"
                        },
                        template: '<div class="statement-cell"> {{dataItem.missionStatement}}</div>'
                    },
                    {
                        field: "visionStatement", title: $translate.instant('ORGANIZATIONS_VISION'), attributes: {
                            "class": "visionStatement"
                        },
                        template: '<div class="statement-cell"> {{dataItem.visionStatement}}</div>'
                    },
                    {
                        field: "goalStatement", title: $translate.instant('ORGANIZATIONS_GOALS'),
                        attributes: {
                            "class": "goalStatement"
                        }, template: function (dataItem) {
                            if (dataItem.goalStatement) {
                                return '<div class="statement-cell">' + dataItem.goalStatement.join(",") + '</div>';
                            }
                        }
                    },
                    {
                        field: "stratagiesStatement", title: $translate.instant('ORGANIZATIONS_STRATEGIES'),
                        attributes: {
                            "class": "stratagiesStatement"
                        },
                        template: function (dataItem) {
                            if (dataItem.stratagiesStatement) {
                                return '<div class="statement-cell">' + dataItem.stratagiesStatement.join(",") + '</div>';
                            }
                        }
                    },
                    {
                        field: "totalActiveProfiles", title: "# " + $translate.instant('ORGANIZATIONS_ACTIVE_PROFILES'),
                    },
                    {
                        field: "totalExpiredProfiles", title: "# " + $translate.instant('ORGANIZATIONS_EXPIRED_PROFILES'),
                    },
                    {
                        field: "totalCompletedProfiles", title: "# " + $translate.instant('ORGANIZATIONS_COMPLETED_PROFILES'),
                    },
                    //{
                    //    field: "", title: "Actions", template: "<div class='icon-groups'>" +
                    //        "<a class='fa fa-pencil' title='Active Project Profiles' ng-click='goToActiveProjectProfile(dataItem.id)'></a>" +
                    //        //"<a class='fa fa-list' title='View Project Profiles' ng-click='viewprojectprofiles(dataItem.id)'></a>" +
                    //        //  "<a class='fa fa-trash' title='Delete Project Profiles' ng-click='deleteProject(dataItem.id)'></a>" +
                    //    "</div>"
                    //}
                    //{ field: "", title: "", width: 100, filterable: false },
                ]
            }
            vm.tooltipOptions = $(".completed-projects-grid").kendoTooltip({
                filter: "th.k-header",
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
            }).data("tooltiptext");
        }])
    .controller('expiredOrganizationProjectsTabCtrl', ['cssInjector', 'organizationProjectsService', '$location', 'profilesTypesEnum', '$translate', 'globalVariables', function (cssInjector, organizationProjectsService, $location, profilesTypesEnum, $translate, globalVariables) {
        //cssInjector.removeAll();
        //cssInjector.add('views/activeProjects/activeProjects.css');
        moment.locale(globalVariables.lang.currentUICulture);
        var vm = this;
        vm.expiredProjectsOptions = {
            dataSource: {
                type: "json",
                transport: {
                    read: function (options) {
                        organizationProjectsService.getExpiredProjects().then(function (data) {
                            //_.each(data, function (item) {
                            //    item.expectedStartDate = moment(kendo.parseDate(item.expectedStartDate)).format("L LT");
                            //    item.expectedEndDate = moment(kendo.parseDate(item.expectedEndDate)).format("L LT");
                            //})
                            options.success(data);
                        })
                    }
                }
            },
            selectable: false,
            sortable: true,
            resizable: true,
            columns: [
                { field: "name", title: $translate.instant('COMMON_NAME') },
                { field: "projectRoleName", title: $translate.instant('COMMON_ROLE') },
                {
                    field: "expectedStartDate",
                    title: $translate.instant('COMMON_START_DATE'),
                    filterable: false,
                    template: function (dataItem) {
                        return moment(kendo.parseDate(dataItem.expectedStartDate)).format("L LT");
                    }
                },
                {
                    field: "expectedEndDate",
                    title: $translate.instant('COMMON_END_DATE'),
                    filterable: false,
                    template: function (dataItem) {
                        return moment(kendo.parseDate(dataItem.expectedEndDate)).format("L LT");
                    }
                },
                {
                    field: "missionStatement", title: $translate.instant('ORGANIZATIONS_MISSION'),
                    attributes: {
                        "class": "missionStatement"
                    },
                    template: '<div class="statement-cell"> {{dataItem.missionStatement}}</div>'
                },
                {
                    field: "visionStatement", title: $translate.instant('ORGANIZATIONS_VISION'), attributes: {
                        "class": "visionStatement"
                    },
                    template: '<div class="statement-cell"> {{dataItem.visionStatement}}</div>'
                },
                {
                    field: "goalStatement", title: $translate.instant('ORGANIZATIONS_GOALS'),
                    attributes: {
                        "class": "goalStatement"
                    }, template: function (dataItem) {
                        if (dataItem.goalStatement) {
                            return '<div class="statement-cell">' + dataItem.goalStatement.join(",") + '</div>';
                        }
                    }
                },
                {
                    field: "stratagiesStatement", title: $translate.instant('ORGANIZATIONS_STRATEGIES'),
                    attributes: {
                        "class": "stratagiesStatement"
                    },
                    template: function (dataItem) {
                        if (dataItem.stratagiesStatement) {
                            return '<div class="statement-cell">' + dataItem.stratagiesStatement.join(",") + '</div>';
                        }
                    }
                },
                {
                    field: "totalActiveProfiles", title: "# " + $translate.instant('ORGANIZATIONS_ACTIVE_PROFILES'),
                },
                {
                    field: "totalExpiredProfiles", title: "# " + $translate.instant('ORGANIZATIONS_EXPIRED_PROFILES'),
                },
                {
                    field: "totalCompletedProfiles", title: "# " + $translate.instant('ORGANIZATIONS_COMPLETED_PROFILES'),
                },
                {
                    field: "", title: $translate.instant('COMMON_ACTIONS'), template: "<div class='icon-groups'>" +
                        //"<a class='fa fa-pencil' title='Active Project Profiles' ng-click='goToActiveProjectProfile(dataItem.id)'></a>" +
                        //"<a class='fa fa-list' title='View Project Profiles' ng-click='viewprojectprofiles(dataItem.id)'></a>" +
                        //  "<a class='fa fa-trash' title='Delete Project Profiles' ng-click='deleteProject(dataItem.id)'></a>" +
                        "</div>"
                }
                //{ field: "", title: "", width: 100, filterable: false },
            ]
        }
        vm.tooltipOptions = $(".expired-profiles-grid").kendoTooltip({
            filter: "th.k-header",
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
        }).data("tooltiptext");
    }])
    .controller('historyOrganizationProjectsTabCtrl', ['cssInjector', 'organizationProjectsService', '$location', 'dialogService', '$translate', 'globalVariables', function (cssInjector, organizationProjectsService, $location, dialogService, $translate, globalVariables) {

        //cssInjector.removeAll();
        //cssInjector.add('views/activeProjects/activeProjects.css');
        moment.locale(globalVariables.lang.currentUICulture);
        var vm = this;
        vm.historyOptions = {
            dataSource: {
                type: "json",
                transport: {
                    read: function (options) {
                        organizationProjectsService.getHistoryProjects().then(function (data) {
                            //_.each(data, function (item) {
                            //    item.expectedStartDate = moment(kendo.parseDate(item.expectedStartDate)).format("L LT");
                            //    item.expectedEndDate = moment(kendo.parseDate(item.expectedEndDate)).format("L LT");
                            //})
                            options.success(data);
                        })
                    }
                }
            },
            selectable: false,
            sortable: {
                mode: "single",
                allowUnsort: true
            },
            resizable: true,
            columns: [
                { field: "name", title: $translate.instant('COMMON_NAME') },
                { field: "projectRoleName", title: $translate.instant('COMMON_ROLE') },
                {
                    field: "expectedStartDate",
                    title: $translate.instant('COMMON_START_DATE'),
                    filterable: false,
                    template: function (dataItem) {
                        return moment(kendo.parseDate(dataItem.expectedStartDate)).format("L LT");
                    }
                },
                {
                    field: "expectedEndDate",
                    title: $translate.instant('COMMON_END_DATE'),
                    filterable: false,
                    template: function (dataItem) {
                        return moment(kendo.parseDate(dataItem.expectedEndDate)).format("L LT");
                    }
                },
                {
                    field: "missionStatement", title: $translate.instant('ORGANIZATIONS_MISSION'),
                    attributes: {
                        "class": "missionStatement"
                    },
                    template: '<div class="statement-cell"> {{dataItem.missionStatement}}</div>'
                },
                {
                    field: "visionStatement", title: $translate.instant('ORGANIZATIONS_VISION'), attributes: {
                        "class": "visionStatement"
                    },
                    template: '<div class="statement-cell"> {{dataItem.visionStatement}}</div>'
                },
                {
                    field: "goalStatement", title: $translate.instant('ORGANIZATIONS_GOALS'),
                    attributes: {
                        "class": "goalStatement"
                    }, template: function (dataItem) {
                        if (dataItem.goalStatement) {
                            return '<div class="statement-cell">' + dataItem.goalStatement.join(",") + '</div>';
                        }
                    }
                },
                {
                    field: "stratagiesStatement", title: $translate.instant('ORGANIZATIONS_STRATEGIES'),
                    attributes: {
                        "class": "stratagiesStatement"
                    },
                    template: function (dataItem) {
                        if (dataItem.stratagiesStatement) {
                            return '<div class="statement-cell">' + dataItem.stratagiesStatement.join(",") + '</div>';
                        }
                    }
                },
                {
                    field: "totalActiveProfiles", title: "# " + $translate.instant('ORGANIZATIONS_ACTIVE_PROFILES'),
                },
                {
                    field: "totalExpiredProfiles", title: "# " + $translate.instant('ORGANIZATIONS_EXPIRED_PROFILES'),
                },
                {
                    field: "totalCompletedProfiles", title: "# " + $translate.instant('ORGANIZATIONS_COMPLETED_PROFILES'),
                },
                //{
                //    field: "", title: "Actions", template: "<div class='icon-groups'>" +
                //        "<a class='fa fa-pencil' title='Edit Project' ng-click='editproject(dataItem.id)'></a>" +
                //        "<a class='fa fa-list' title='View Project Profiles' ng-click='viewprojectprofiles(dataItem.id)'></a>" +
                //          "<a class='fa fa-trash' title='Delete Project Profiles' ng-click='deleteProject(dataItem.id)'></a>" +
                //    "</div>"
                //}
                //{ field: "", title: "", width: 100, filterable: false },
            ]
        }
        vm.tooltipOptions = $(".project-history-grid").kendoTooltip({
            filter: "th.k-header",
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
        }).data("tooltiptext");
    }])
    .controller('pendingOrganizationProjectsTabCtrl', ['cssInjector', 'organizationProjectsService', '$location', 'dialogService', 'projectRolesEnum', '$translate', 'globalVariables',
        function (cssInjector, organizationProjectsService, $location, dialogService, projectRolesEnum, $translate, globalVariables) {
            //cssInjector.removeAll();
            //cssInjector.add('views/activeProjects/activeProjects.css');
            moment.locale(globalVariables.lang.currentUICulture);
            var vm = this;
            vm.pendingProjectsOptions = {
                dataSource: {
                    type: "json",
                    transport: {
                        read: function (options) {
                            organizationProjectsService.getPendingProjects().then(function (data) {
                                //_.each(data, function (item) {
                                //    item.expectedStartDate = moment(kendo.parseDate(item.expectedStartDate)).format("L LT");
                                //    item.expectedEndDate = moment(kendo.parseDate(item.expectedEndDate)).format("L LT");
                                //})
                                options.success(data);
                            })
                        }
                    }
                },
                selectable: false,
                sortable: true,
                resizable: true,
                columns: [
                    { field: "name", title: $translate.instant('COMMON_NAME') },
                    { field: "projectRoleName", title: $translate.instant('COMMON_ROLE') },
                    {
                        field: "expectedStartDate", title: $translate.instant('COMMON_START_DATE'),
                        filterable: false,
                        template: function (dataItem) {
                            return moment(kendo.parseDate(dataItem.expectedStartDate)).format("L LT");
                        }
                    },
                    {
                        field: "expectedEndDate",
                        title: $translate.instant('COMMON_END_DATE'),
                        filterable: false,
                        template: function (dataItem) {
                            return moment(kendo.parseDate(dataItem.expectedEndDate)).format("L LT");
                        }
                    },
                    {
                        field: "missionStatement", title: $translate.instant('ORGANIZATIONS_MISSION'),
                        attributes: {
                            "class": "missionStatement"
                        },
                        template: '<div class="statement-cell"> {{dataItem.missionStatement}}</div>'
                    },
                    {
                        field: "visionStatement", title: $translate.instant('ORGANIZATIONS_VISION'), attributes: {
                            "class": "visionStatement"
                        },
                        template: '<div class="statement-cell"> {{dataItem.visionStatement}}</div>'
                    },
                    {
                        field: "goalStatement", title: $translate.instant('ORGANIZATIONS_GOALS'),
                        attributes: {
                            "class": "goalStatement"
                        }, template: function (dataItem) {
                            if (dataItem.goalStatement) {
                                return '<div class="statement-cell">' + dataItem.goalStatement.join(",") + '</div>';
                            }
                        }
                    },
                    {
                        field: "stratagiesStatement", title: $translate.instant('ORGANIZATIONS_STRATEGIES'),
                        attributes: {
                            "class": "stratagiesStatement"
                        },
                        template: function (dataItem) {
                            if (dataItem.stratagiesStatement) {
                                return '<div class="statement-cell">' + dataItem.stratagiesStatement.join(",") + '</div>';
                            }
                        }
                    },
                    {
                        field: "", title: $translate.instant('COMMON_ACTIONS'), template: "<div class='icon-groups'>" +
                            "<a class='fa fa-eye' title='View Project'  ng-click='pendingProjects.viewproject(dataItem.id)'></a>" +
                            "<a class='fa fa-list' title='View Project Profiles' ng-click='pendingProjects.viewprojectprofiles(dataItem.id)'></a>" +
                            "</div>"
                    }
                ]
            }
            vm.tooltipOptions = $(".pending-projects-grid").kendoTooltip({
                filter: "th.k-header",
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
            }).data("tooltiptext");
            vm.viewproject = function (id) {
                $location.path("/viewproject/" + id);
            }
            vm.projectStatus = function (id) {
                $location.path("/projectStatus/" + id);
            }
            vm.editproject = function (id) {
                $location.path("/editproject/" + id);
            }
            vm.viewprojectprofiles = function (projectId) {
                $location.path("/projectprofiles/" + projectId);
            }
            vm.deleteProject = function (projectId) {
                organizationProjectsService.isProjectInUse(projectId).then(function (data) {
                    if (data) {
                        dialogService.showNotification($translate.instant('ORGANIZATIONS_YOU_CAN_NOT_DELETE_PROJECT') + " " + $translate.instant('ORGANIZATIONS_THIS_PROJECT_IS_IN_USE'), 'warning');
                    }
                    else {
                        dialogService.showYesNoDialog($translate.instant('COMMON_CONFIRM'), $translate.instant('ORGANIZATIONS_ARE_YOU_SURE_YOU_WANT_TO_DELETE_PROJECT')).then(
                            function () {
                                organizationProjectsService.removeProject(projectId).then(function (data) {
                                    if (data) {
                                        var grid = $(".pending-projects-grid").data("kendoGrid");
                                        if (grid) {
                                            grid.dataSource.read();
                                            grid.refresh();
                                        }
                                        dialogService.showNotification($translate.instant('ORGANIZATIONS_PROJECT_REMOVED_SUCCESFULLY'), 'info');
                                    }
                                });
                            },
                            function () {
                            });
                    }
                })
            }
            vm.newProject = function () {
                $location.path("/newproject");
            }
            vm.isAllowEdit = function (projectRoleId) {
                if (projectRoleId == projectRolesEnum.projectManager) {
                    return true;
                }
                else {
                    return false;
                }
            }
        }])
    .controller('organizationCustomersCtrl', ['cssInjector', '$rootScope', 'authService', 'organizationCustomerService', '$location', 'dialogService', 'Upload', 'progressBar', 'localStorageService', '$compile', '$translate', 'globalVariables',
        function (cssInjector, $rootScope, authService, organizationCustomerService, $location, dialogService, Upload, progressBar, localStorageService, $compile, $translate, globalVariables) {
            //cssInjector.removeAll();
            //cssInjector.add('views/activeProjects/activeProjects.css');
            moment.locale(globalVariables.lang.currentUICulture);
            var vm = this;
            vm.currentUser = authService.authentication.user;
            vm.selectedOrganizationId = null;
            if ($rootScope.organization) {
                if ($rootScope.organization.organizationId) {
                    vm.selectedOrganizationId = $rootScope.organization.organizationId;
                }
            }
            vm.fileName = null;
            vm.customers = [];
            vm.customerFilterEnum = {
                CallsOnly: 1,
                FollowupOnly: 2,
                MeetingsOnly: 3,
                NotAgreed: 4,
                OfferSent: 5,
                OfferClose: 6,
            };
            vm.customerFilterOptions = [
                { id: 0, name: "--" + $translate.instant('COMMON_SELECT') + "--" },
                { id: 1, name: $translate.instant('COMMON_CALLS_ONLY') },
                { id: 2, name: $translate.instant('COMMON_FOLLOWUP_ONLY') },
                { id: 3, name: $translate.instant('COMMON_MEETINGS_AGREED') },
                { id: 4, name: $translate.instant('COMMON_NOT_AGREED') },
                { id: 5, name: $translate.instant('COMMON_OFFER_SENT') },
                { id: 6, name: $translate.instant('COMMON_OFFER_CLOSE') },
            ];
            vm.customerFilterText = vm.customerFilterOptions[0].name;
            vm.changeCustomerFilter = function (value, text) {
                vm.customerFilterText = text;
                var filterSetting = [];
                if (vm.salesManId) {
                    filterSetting.push({
                        field: 'assignedUserId',
                        operator: 'eq',
                        value: vm.salesManId
                    })
                }
                if (value == vm.customerFilterEnum.CallsOnly) {
                    filterSetting.push({
                        field: 'isCalled',
                        operator: 'eq',
                        value: true
                    });
                    filterSetting.push({
                        field: 'isTalked',
                        operator: 'eq',
                        value: false
                    });
                }
                else if (value == vm.customerFilterEnum.FollowupOnly) {
                    filterSetting.push({
                        field: 'isFollowUp',
                        operator: 'eq',
                        value: true
                    });
                    filterSetting.push({
                        field: 'isOfferSent',
                        operator: 'eq',
                        value: false
                    });
                }
                else if (value == vm.customerFilterEnum.MeetingsOnly) {
                    filterSetting.push({
                        field: 'isMeeting',
                        operator: 'eq',
                        value: true
                    });
                    filterSetting.push({
                        field: 'isOfferSent',
                        operator: 'eq',
                        value: false
                    });
                }
                else if (value == vm.customerFilterEnum.NotAgreed) {
                    filterSetting.push({
                        field: 'isTalked',
                        operator: 'eq',
                        value: true
                    });
                    filterSetting.push({
                        field: 'isNotInterested',
                        operator: 'eq',
                        value: true
                    });
                }
                else if (value == vm.customerFilterEnum.OfferSent) {
                    filterSetting.push({
                        field: 'isOfferSent',
                        operator: 'eq',
                        value: true
                    });
                    filterSetting.push({
                        field: 'isOfferClosed',
                        operator: 'eq',
                        value: false
                    });
                }
                else if (value == vm.customerFilterEnum.OfferClose) {
                    filterSetting.push({
                        field: 'isOfferClosed',
                        operator: 'eq',
                        value: true
                    });
                }
                var gridObj = $("#organization-customers-grid").data("kendoGrid");
                if (gridObj) {
                    gridObj.dataSource.filter(filterSetting);
                }
            }
            var authheaders = {};

            var authData = localStorageService.get('authorizationData');
            if (authData) {
                authheaders.Authorization = 'Bearer ' + authData.token;
            }
            vm.loadOrganizationCustomerGrid = function () {
                vm.organizationCustomersOptions = {
                    dataSource: {
                        type: "json",
                        transport: {
                            read: function (options) {
                                var isFilterExist = false;
                                var gridObj = $("#organization-customers-grid").data("kendoGrid");
                                if (gridObj) {
                                    if (gridObj.dataSource._filter) {
                                        if (gridObj.dataSource._filter.filters.length > 0) {
                                            isFilterExist = true;
                                        }
                                    }
                                }
                                if (!isFilterExist) {
                                    if ($rootScope.organization) {
                                        if ($rootScope.organization.organizationId) {
                                            vm.selectedOrganizationId = $rootScope.organization.organizationId;
                                            progressBar.startProgress();
                                            organizationCustomerService.getCustomers($rootScope.organization.organizationId).then(function (data) {
                                                progressBar.stopProgress();
                                                _.each(data, function (item) {
                                                    item.uploadDate = kendo.parseDate(item.uploadDate);
                                                    item.date = kendo.parseDate(item.date);
                                                });
                                                vm.customers = data;
                                                vm.salesManId = null;
                                                vm.salesMans = [];
                                                if ($rootScope.organizationUsers) {
                                                    if (vm.currentUser.isAdmin) {
                                                        vm.salesMans = _.clone($rootScope.organizationUsers);
                                                        vm.salesMans.unshift({ id: null, firstName: "All" });
                                                    }
                                                    else {
                                                        _.each($rootScope.organizationUsers, function (item) {
                                                            if (vm.currentUser.userId == item.id) {
                                                                vm.salesMans.push(item);
                                                                vm.salesManId = item.id;
                                                            }
                                                        })
                                                    }
                                                    setTimeout(function () {
                                                        vm.salesmanChanged();
                                                    }, 100);
                                                }
                                                options.success(data);
                                            })
                                        }
                                        else {
                                            options.success([]);
                                        }
                                    }
                                    else {
                                        options.success([]);
                                    }
                                }
                                else {
                                    options.success(vm.customers);
                                }
                            }
                        },
                        pageSize: 100,
                    },
                    filterable: {
                        extra: false,
                        operators: {
                            string: {
                                eq: "Is equal to",
                                startswith: "Start With"
                            }
                        }
                    },
                    pageable: true,
                    selectable: false,
                    sortable: true,
                    resizable: true,
                    columns: [
                        {
                            field: "uploadDate", title: $translate.instant('ORGANIZATIONS_UPLOAD_DATE'),
                            template: function (dataItem) {
                                if (dataItem.uploadDate) {
                                    return moment(kendo.parseDate(dataItem.uploadDate)).format("L LT");
                                }
                                else {
                                    return "";
                                }
                            },
                            filterable: false,
                        },
                        {
                            field: "name", title: $translate.instant('COMMON_NAME'), filterable: {
                                ui: nameFilter,
                            },
                        },
                        { field: "email", title: $translate.instant('COMMON_EMAIL') },
                        { field: "mobile", title: $translate.instant('COMMON_MOBILE') },
                        {
                            field: "date", title: $translate.instant('COMMON_SALE_DATE'),
                            template: function (dataItem) {
                                if (dataItem.date) {
                                    return moment(kendo.parseDate(dataItem.date)).format("L LT");
                                }
                                else {
                                    return "";
                                }
                            },
                            filterable: false,
                        },
                        {
                            field: "model", title: $translate.instant('COMMON_MODEL'), filterable: {
                                ui: modelFilter,
                            }
                        },
                        {
                            field: "type", title: $translate.instant('COMMON_TYPE'), filterable: {
                                ui: typeFilter,
                            }
                        },
                        {
                            field: "postCode", title: $translate.instant('COMMON_ZIP'), filterable: {
                                ui: postCodeFilter,
                            }
                        },
                        {
                            field: "seller", title: $translate.instant('COMMON_SELLER'), filterable: {
                                ui: sellerFilter,
                            }
                        },
                        {
                            field: "isCalled", title: $translate.instant('COMMON_IS_CALLED'), editable: false, filterable: false, template: function (dataItem) {
                                if (dataItem.isCalled) {
                                    return "Yes";
                                }
                                else {
                                    return "No";
                                }
                            }
                        },
                        {
                            field: "isFollowUp", title: $translate.instant('COMMON_FOLLOW_UP'), editable: false, filterable: false, template: function (dataItem) {
                                if (dataItem.isFollowUp) {
                                    return "Yes";
                                }
                                else {
                                    return "No";
                                }
                            }
                        },
                        {
                            field: "isMeeting", title: $translate.instant('COMMON_IS_MEETING'), editable: false, filterable: false, template: function (dataItem) {
                                if (dataItem.isMeeting) {
                                    return "Yes";
                                }
                                else {
                                    return "No";
                                }
                            }
                        },
                        {
                            field: "isOfferSent", title: $translate.instant('COMMON_OFFER_SENT'), editable: false, filterable: false, template: function (dataItem) {
                                if (dataItem.isOfferSent) {
                                    return "Yes";
                                }
                                else {
                                    return "No";
                                }
                            }
                        },
                        {
                            field: "isOfferClosed", title: $translate.instant('COMMON_OFFER_CLOSED'), editable: false, filterable: false, template: function (dataItem) {
                                if (dataItem.isOfferClosed) {
                                    return "Yes";
                                }
                                else {
                                    return "No";
                                }
                            }
                        },
                        {
                            field: "", title: $translate.instant('COMMON_ACTIONS'), template: function (dataItem) {
                                return "<div class='icon-groups'>" +
                                    "<a class='fa fa-eye' title='View Customer' ng-click='organizationCustomers.viewCustomer(" + dataItem.customerId + ")'></a>" +
                                    "</div>";
                            }
                        },
                    ]
                }
                vm.tooltipOptions = $(".organization-customers-grid").kendoTooltip({
                    filter: "th.k-header",
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
                }).data("tooltiptext");
            }
            vm.loadOrganizationCustomerGrid();
            function nameFilter(element) {
                var names = [];
                _.each(vm.customers, function (item) {
                    if (item.name) {
                        names.push(item.name);
                    }
                })
                names = _.uniq(names);
                element.kendoAutoComplete({
                    dataSource: names,
                    placeholder: "--Enter Name--",
                    filtering: function (e) {
                        var filter = e.filter;
                        if (filter.operator == "startswith") {
                            if (e.sender.value() == "") {
                                e.sender.value("");
                            }
                        }
                    }
                });
            }
            function modelFilter(element) {
                var models = [];
                _.each(vm.customers, function (item) {
                    if (item.model) {
                        models.push(item.model);
                    }
                })
                models = _.uniq(models);
                element.kendoDropDownList({
                    dataSource: models,
                    optionLabel: "--Select Model--"
                });
            }
            function typeFilter(element) {
                var types = [];
                _.each(vm.customers, function (item) {
                    if (item.type) {
                        types.push(item.type);
                    }
                })
                types = _.uniq(types);
                element.kendoDropDownList({
                    dataSource: types,
                    optionLabel: "--Select Type--"
                });
            }
            function sellerFilter(element) {
                var types = [];
                _.each(vm.customers, function (item) {
                    if (item.seller) {
                        types.push(item.seller);
                    }
                })
                types = _.uniq(types);
                element.kendoDropDownList({
                    dataSource: types,
                    optionLabel: "--Select--"
                });
            }
            function postCodeFilter(element) {
                var types = [];
                _.each(vm.customers, function (item) {
                    if (item.postCode) {
                        types.push(item.postCode);
                    }
                })
                types = _.uniq(types);
                element.kendoDropDownList({
                    dataSource: types,
                    optionLabel: "--Select--"
                });
            }
            vm.onFileSelect = function ($files) {
                for (var i = 0; i < $files.length; i++) {
                    var $file = $files[i];
                    var fileMimeTypeArr = ["text/comma-separated-values", "text/csv", "application/csv", "application/vnd.ms-excel"];
                    if (fileMimeTypeArr.indexOf($file.type) > -1) {
                        (function (index) {
                            progressBar.startProgress();
                            Upload.upload({
                                url: "../api/api/upload/customerCSV",
                                method: "POST",
                                file: $file
                            }).progress(function (evt) {
                                console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));
                            }).success(function (data) {
                                progressBar.stopProgress();
                                vm.fileName = data;
                            }).error(function (data) {
                                dialogService.showNotification(data, 'warning');
                            });
                        })(i);
                    }
                    else {
                        angular.element("#customerCsvUploadFile").val(null)
                        dialogService.showNotification($translate.instant('ORGANIZATIONS_SELECT_VALID_CSV'), "warning")
                    }
                }
            };
            vm.salesMans = [];
            vm.salesManId = null;
            vm.salesmanChanged = function () {
                angular.element("#customerCsvUploadFile").val(null);
                vm.salesManFiles = [];
                if (vm.salesManId) {
                    var gridObj = $("#organization-customers-grid").data("kendoGrid");
                    if (gridObj) {
                        gridObj.dataSource.filter({
                            field: 'assignedUserId',
                            operator: 'eq',
                            value: vm.salesManId
                        });
                    }
                    vm.salesManFile = "All";
                    var grid = $("#organization-customers-grid").data("kendoGrid");
                    if (grid) {
                        var myData = new kendo.data.Query(grid.dataSource.data()).filter(grid.dataSource.filter()).data;
                        _.each(myData, function (item) {
                            if (item.csvFileName) {
                                vm.salesManFiles.push(item.csvFileName)
                            }
                        });
                        vm.salesManFiles = _.uniq(vm.salesManFiles);
                        vm.salesManFiles.unshift("All");
                    }
                }
                else {
                    var gridObj = $("#organization-customers-grid").data("kendoGrid");
                    if (gridObj) {
                        //gridObj.dataSource.filter([]);
                    }
                }
            }
            vm.salesmanChangedManually = function () {
                vm.salesManFiles = [];
                angular.element("#customerCsvUploadFile").val(null);
                if (vm.salesManId) {
                    var gridObj = $("#organization-customers-grid").data("kendoGrid");
                    if (gridObj) {
                        gridObj.dataSource.filter({
                            field: 'assignedUserId',
                            operator: 'eq',
                            value: vm.salesManId
                        });
                    }
                    vm.salesManFile = "All";
                    var grid = $("#organization-customers-grid").data("kendoGrid");
                    if (grid) {
                        var myData = new kendo.data.Query(grid.dataSource.data()).filter(grid.dataSource.filter()).data;
                        _.each(myData, function (item) {
                            if (item.csvFileName) {
                                vm.salesManFiles.push(item.csvFileName)
                            }
                        });
                        vm.salesManFiles = _.uniq(vm.salesManFiles);
                        vm.salesManFiles.unshift("All");
                    }
                }
                else {
                    var gridObj = $("#organization-customers-grid").data("kendoGrid");
                    if (gridObj) {
                        gridObj.dataSource.filter([]);
                    }
                }
            }
            vm.salesManFileChanged = function () {
                if (vm.salesManFile) {
                    if (vm.salesManFile != "All") {
                        var gridObj = $("#organization-customers-grid").data("kendoGrid");
                        if (gridObj) {
                            var filter = { logic: "and", filters: [] };
                            filter.filters.push({ field: "assignedUserId", operator: "eq", value: vm.salesManId });
                            filter.filters.push({ field: "csvFileName", operator: "eq", value: vm.salesManFile });
                            gridObj.dataSource.filter(filter);
                        }
                    }
                    else {
                        var gridObj = $("#organization-customers-grid").data("kendoGrid");
                        if (gridObj) {
                            var filter = { logic: "and", filters: [] };
                            filter.filters.push({ field: "assignedUserId", operator: "eq", value: vm.salesManId });
                            gridObj.dataSource.filter(filter);
                        }
                    }
                }
            }
            vm.saveCustomer = function () {
                if (vm.fileName && $rootScope.organization.organizationId && vm.salesManId) {
                    progressBar.startProgress();
                    organizationCustomerService.importCSV(vm.fileName, $rootScope.organization.organizationId, vm.salesManId).then(function (data) {
                        progressBar.stopProgress();
                        if (data) {
                            vm.fileName = null;
                            angular.element("#customerCsvUploadFile").val(null)
                            var gridObj = $("#organization-customers-grid").data("kendoGrid");
                            if (gridObj) {
                                gridObj.dataSource.filter([]);
                                gridObj.dataSource.read();
                                setTimeout(function () {
                                    vm.salesmanChanged();
                                    vm.salesManFile = vm.fileName;
                                    vm.salesManFileChanged();
                                }, 100)
                            }
                        }
                    },
                        function (data) {
                            progressBar.stopProgress();
                            dialogService.showNotification($translate.instant('ORGANIZATIONS_CUSTOMER_IMPORT_FAILED'), "warning");
                        });
                }
            }
            vm.viewCustomer = function (id) {
                $location.path($location.path() + '/customer/' + id);
                //$location.path("/organizations/customer/" + id);
            }
        }])
    .controller('organizationSalesCtrl', ['cssInjector', '$scope', '$rootScope', 'authService', 'organizationSalesService', '$location', 'dialogService', 'progressBar', '$compile', '$translate', 'globalVariables',
        function (cssInjector, $scope, $rootScope, authService, organizationSalesService, $location, dialogService, progressBar, $compile, $translate, globalVariables) {
            //cssInjector.removeAll();
            //cssInjector.add('views/activeProjects/activeProjects.css');
            //var vm = this;
            moment.locale(globalVariables.lang.currentUICulture);
            $scope.currentUser = authService.authentication.user;
            $scope.selectedOrganizationId = null;
            $scope.salesMans = [];
            $scope.salesManProjects = [];
            $scope.projectProfiles = [];
            $scope.users = [];
            $scope.selectedUser = null;
            $scope.salesManProspectingTasks = [];
            $scope.salesManProspectingTaskId = null;
            $scope.salesmanChangedManually = function () {
                if ($("#salesmanAggregatedSalesActivitiesGrid").data("kendoGrid")) {
                    $("#salesmanAggregatedSalesActivitiesGrid").kendoGrid("destroy");
                    $("#salesmanAggregatedSalesActivitiesGrid").html("");
                }
                if ($("#salesmanActivityGrid").data("kendoGrid")) {
                    $("#salesmanActivityGrid").kendoGrid("destroy");
                    $("#salesmanActivityGrid").html("");
                }
                $scope.salesManProjectId = null;
                $scope.salesManProjects = [];
                $scope.projectProfiles = [];
                $scope.salesManProfileId = null;
                $scope.salesManProspectingTasks = [];
                $scope.salesManProspectingTaskId = null;
                if ($("#salesmanTaskAggregatedSalesActivitiesGrid").data("kendoGrid")) {
                    $("#salesmanTaskAggregatedSalesActivitiesGrid").kendoGrid("destroy");
                    $("#salesmanTaskAggregatedSalesActivitiesGrid").html("");
                }
                if ($("#salesmanTaskActivityGrid").data("kendoGrid")) {
                    $("#salesmanTaskActivityGrid").kendoGrid("destroy");
                    $("#salesmanTaskActivityGrid").html("");
                }
                if ($scope.salesManId) {
                    progressBar.startProgress();
                    organizationSalesService.getProjectsbyUserId($scope.salesManId).then(function (data) {
                        progressBar.stopProgress();
                        if (data) {
                            _.each(data.activeProjects, function (item) {
                                $scope.salesManProjects.push(item);
                            })
                        }
                    })
                    organizationSalesService.getProspectingTasksbyUserId($scope.salesManId).then(function (data) {
                        progressBar.stopProgress();
                        if (data) {
                            _.each(data, function (item) {
                                $scope.salesManProspectingTasks.push(item);
                            })
                        }
                    })
                }
                else {
                    progressBar.startProgress();
                    organizationSalesService.getProjectsbyUserId($scope.currentUser.userId).then(function (data) {
                        progressBar.stopProgress();
                        if (data) {
                            _.each(data.activeProjects, function (item) {
                                $scope.salesManProjects.push(item);
                            })
                        }
                    })
                }
            }
            $scope.salesmanProjectChangedManually = function () {
                if ($("#salesmanAggregatedSalesActivitiesGrid").data("kendoGrid")) {
                    $("#salesmanAggregatedSalesActivitiesGrid").kendoGrid("destroy");
                    $("#salesmanAggregatedSalesActivitiesGrid").html("");
                }
                if ($("#salesmanActivityGrid").data("kendoGrid")) {
                    $("#salesmanActivityGrid").kendoGrid("destroy");
                    $("#salesmanActivityGrid").html("");
                }
                $scope.projectProfiles = [];
                $scope.salesManProfileId = null;
                if ($scope.salesManProjectId) {
                    organizationSalesService.getProjectProfiles($scope.salesManProjectId).then(function (data) {
                        if (data) {
                            _.each(data, function (item) {
                                $scope.projectProfiles.push(item);
                            })
                        }
                    })
                }
            }
            $scope.salesmanProfileChangedManually = function () {
                if ($("#salesmanAggregatedSalesActivitiesGrid").data("kendoGrid")) {
                    $("#salesmanAggregatedSalesActivitiesGrid").kendoGrid("destroy");
                    $("#salesmanAggregatedSalesActivitiesGrid").html("");
                }
                if ($("#salesmanActivityGrid").data("kendoGrid")) {
                    $("#salesmanActivityGrid").kendoGrid("destroy");
                    $("#salesmanActivityGrid").html("");
                }
                $scope.users = [];
                $scope.selectedUser = null;
                if ($scope.salesManProfileId) {
                    if ($scope.salesManId) {
                        progressBar.startProgress();
                        organizationSalesService.getUserAggregatedSalesActivityData($scope.salesManProfileId, $scope.salesManId).then(function (data) {
                            progressBar.stopProgress();
                            $scope.aggregatedSalesActivities = [];
                            var columns = [];
                            var aggregates = [];
                            if (data.length > 0) {
                                columns.push({ field: "userName", title: $translate.instant('ORGANIZATIONS_MEMBER'), footerTemplate: "Total" });
                                columns.push({ field: "goalStartDate", title: $translate.instant('COMMON_START_DATE') });
                                columns.push({ field: "goalEndDate", title: $translate.instant('COMMON_END_DATE') });
                                //columns.push({ field: "skillName", title: 'skill Name' })
                                if (data[0].prospectingSkillGoalResults.length > 0) {
                                    _.each(data[0].prospectingSkillGoalResults, function (skillGoalItem) {
                                        columns.push({
                                            field: skillGoalItem.skillName + "_Goal", title: skillGoalItem.skillName + ' ' + $translate.instant('COMMON_GOAL'), aggregates: ["sum"], footerTemplate: "<div class='text-center'> #= sum # </div>", attributes: {
                                                "class": "text-center"
                                            }
                                        })
                                        columns.push({
                                            field: skillGoalItem.skillName + "_Count", title: skillGoalItem.skillName + ' ' + $translate.instant('ORGANIZATIONS_COUNT'), aggregates: ["sum"], footerTemplate: "<div class='text-center'> #= sum # </div>", attributes: {
                                                "class": "text-center"
                                            },
                                            template: function (data, value) {
                                                return data[skillGoalItem.skillName + "_Count"] + " <i class='fa fa-eye fa-lg' ng-click='viewProspectingResults(" + data.prospectingGoalId + "," + skillGoalItem.skillId + "," + skillGoalItem.seqNo + ")'></i>"
                                            }
                                        })
                                        columns.push({
                                            field: skillGoalItem.skillName + "_Result", title: skillGoalItem.skillName + ' ' + $translate.instant('COMMON_RESULT'), attributes: {
                                                "class": "text-center"
                                            },
                                            template: "<span>#=" + skillGoalItem.skillName + "_Result" + "#%<\span>",
                                            footerTemplate: function (data) {
                                                var avgResult = ((data[skillGoalItem.skillName + "_Count"].sum / data[skillGoalItem.skillName + "_Goal"].sum) * 100)
                                                var resultAvg = Math.round(avgResult * 100) / 100;
                                                return "<div class='text-center'>" + resultAvg + "%</div>"
                                            },
                                        })
                                        aggregates.push({ field: skillGoalItem.skillName + "_Goal", aggregate: "sum" })
                                        aggregates.push({ field: skillGoalItem.skillName + "_Count", aggregate: "sum" })
                                    });
                                }
                            }
                            var gridData = [];
                            _.each(data, function (datItem) {
                                var userItem = _.find($rootScope.organizationUsers, function (memberItem) {
                                    return memberItem.id == datItem.userId;
                                });
                                var rowdata = {
                                    goalStartDate: moment(kendo.parseDate(datItem.goalStartDate)).format('L LT'),
                                    goalEndDate: moment(kendo.parseDate(datItem.goalEndDate)).format('L LT'),
                                    participantId: datItem.participantId,
                                    userName: userItem.firstName + " " + userItem.lastName,
                                    prospectingGoalId: 0
                                }
                                _.each(datItem.prospectingSkillGoalResults, function (skillGoalItem) {
                                    rowdata.prospectingGoalId = skillGoalItem.prospectingGoalId;
                                    rowdata[skillGoalItem.skillName + "_Goal"] = skillGoalItem.goal;
                                    rowdata[skillGoalItem.skillName + "_Count"] = skillGoalItem.count;
                                    rowdata[skillGoalItem.skillName + "_Result"] = skillGoalItem.result;
                                });
                                gridData.push(rowdata);
                            })
                            if ($("#salesmanAggregatedSalesActivitiesGrid").data("kendoGrid")) {
                                $("#salesmanAggregatedSalesActivitiesGrid").kendoGrid("destroy");
                                $("#salesmanAggregatedSalesActivitiesGrid").html("");
                            }
                            $("#salesmanAggregatedSalesActivitiesGrid").kendoGrid({
                                //dataBound: $scope.onUserAssignGridDataBound,
                                dataSource: {
                                    type: "json",
                                    data: gridData,
                                    pageSize: 10,
                                    aggregate: aggregates,
                                },
                                groupable: false, // this will remove the group bar
                                columnMenu: false,
                                filterable: false,
                                pageable: true,
                                sortable: true,
                                columns: columns,
                            });
                            App.initSlimScroll(".scroller");
                            var linkFn = $compile($("#salesmanAggregatedSalesActivitiesGrid"));
                            linkFn($scope);
                            progressBar.startProgress();
                            organizationSalesService.getUserSalesActivityData($scope.salesManProfileId, $scope.salesManId).then(function (data) {
                                progressBar.stopProgress();
                                var columns = [];
                                var aggregates = [];
                                if (data.length > 0) {
                                    columns.push({
                                        field: "prospectingGoalName", title: $translate.instant('ORGANIZATIONS_SALES_ACTIVITY'), hidden: true,
                                    });
                                    columns.push({ field: "goalStartDate", title: $translate.instant('COMMON_START_DATE'), hidden: true, });
                                    columns.push({ field: "goalEndDate", title: $translate.instant('COMMON_END_DATE'), hidden: true, });
                                    columns.push({ field: "actvitiyName", title: $translate.instant('ORGANIZATIONS_ACTIVITY_NAME'), footerTemplate: "Total" });
                                    columns.push({ field: "actvitiyStart", title: $translate.instant('ORGANIZATIONS_ACTIVITY_START') });
                                    columns.push({
                                        field: "actvitiyEnd", title: $translate.instant('ORGANIZATIONS_ACTIVITY_END')
                                    });
                                    if (data[0].prospectingSkillGoalResults.length > 0) {
                                        _.each(data[0].prospectingSkillGoalResults, function (skillGoalItem) {
                                            columns.push({
                                                field: skillGoalItem.skillName + "_Count", title: skillGoalItem.skillName + ' ' + $translate.instant('ORGANIZATIONS_COUNT'), aggregates: ["sum"], footerTemplate: "<div class='text-center'> #= sum # </div>", attributes: {
                                                    "class": "text-center"
                                                }
                                            });
                                            aggregates.push({ field: skillGoalItem.skillName + "_Count", aggregate: "sum" })
                                        });
                                    }
                                    columns.push({
                                        field: "activityStatus", title: $translate.instant('COMMON_STATUS'), template: function (data) {
                                            if (data.expiredActivityReason) {
                                                return data.activityStatus + " <i class='fa fa-info-circle popovers' data-placement='bottom'  title='" + data.expiredActivityReason + "'></i>";
                                            }
                                            else {
                                                return data.activityStatus;
                                            }
                                        }
                                    });
                                    var gridData = [];
                                    _.each(data, function (datItem) {
                                        var userItem = _.find($rootScope.organizationUsers, function (memberItem) {
                                            return memberItem.id == datItem.userId;
                                        });
                                        var rowdata = {
                                            actvitiyName: datItem.actvitiyName,
                                            prospectingGoalName: datItem.prospectingGoalName,
                                            goalStartDate: moment(kendo.parseDate(datItem.goalStartDate)).format('L LT'),
                                            goalEndDate: moment(kendo.parseDate(datItem.goalEndDate)).format('L LT'),
                                            actvitiyStart: moment(kendo.parseDate(datItem.actvitiyStart)).format('L LT'),
                                            actvitiyEnd: moment(kendo.parseDate(datItem.actvitiyEnd)).format('L LT'),
                                            activityStatus: datItem.activityStatus,
                                            expiredActivityReason: datItem.expiredActivityReason,
                                        }
                                        _.each(datItem.prospectingSkillGoalResults, function (skillGoalItem) {
                                            rowdata[skillGoalItem.skillName + "_Count"] = skillGoalItem.count;
                                        });
                                        gridData.push(rowdata);
                                    })
                                }
                                if ($("#salesmanActivityGrid").data("kendoGrid")) {
                                    $("#salesmanActivityGrid").kendoGrid("destroy");
                                    $("#salesmanActivityGrid").html("");
                                }
                                $("#salesmanActivityGrid").kendoGrid({
                                    dataSource: {
                                        type: "json",
                                        data: gridData,
                                        //group: { field: "profileid", field: "skill" },
                                        pageSize: 10,
                                        group: {
                                            field: "prospectingGoalName",
                                            dir: "asc",
                                        },
                                        aggregate: aggregates,
                                    },
                                    groupable: false, // this will remove the group bar
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
                                    sortable: true,
                                    columns: columns,
                                });
                                $(".popovers").popover();
                            })
                        });
                    }
                    else {
                        progressBar.startProgress();
                        organizationSalesService.getSalesActivityData($scope.salesManProfileId).then(function (data) {
                            progressBar.stopProgress();
                            $scope.aggregatedSalesActivities = [];
                            var columns = [];
                            var aggregates = [];
                            if (data.length > 0) {
                                columns.push({ field: "userName", title: $translate.instant('ORGANIZATIONS_MEMBER'), footerTemplate: "Total" });
                                columns.push({ field: "goalStartDate", title: $translate.instant('COMMON_START_DATE') });
                                columns.push({
                                    field: "goalEndDate", title: $translate.instant('COMMON_END_DATE')
                                });
                                //columns.push({ field: "skillName", title: 'skill Name' })
                                if (data[0].prospectingSkillGoalResults.length > 0) {
                                    _.each(data[0].prospectingSkillGoalResults, function (skillGoalItem) {
                                        columns.push({
                                            field: skillGoalItem.skillName + "_Goal", title: skillGoalItem.skillName + ' ' + $translate.instant('COMMON_GOAL'), aggregates: ["sum"], footerTemplate: "<div class='text-center'> #= sum # </div>", attributes: {
                                                "class": "text-center"
                                            }
                                        })
                                        columns.push({
                                            field: skillGoalItem.skillName + "_Count", title: skillGoalItem.skillName + ' ' + $translate.instant('ORGANIZATIONS_COUNT'), aggregates: ["sum"], footerTemplate: "<div class='text-center'> #= sum # </div>", attributes: {
                                                "class": "text-center"
                                            }
                                        })
                                        columns.push({
                                            field: skillGoalItem.skillName + "_Result", title: skillGoalItem.skillName + ' ' + $translate.instant('COMMON_RESULT'), attributes: {
                                                "class": "text-center"
                                            },
                                            template: "<span>#=" + skillGoalItem.skillName + "_Result" + "#%<\span>",
                                            footerTemplate: function (data) {
                                                var avgResult = ((data[skillGoalItem.skillName + "_Count"].sum / data[skillGoalItem.skillName + "_Goal"].sum) * 100)
                                                var resultAvg = Math.round(avgResult * 100) / 100;
                                                return "<div class='text-center'>" + resultAvg + "%</div>"
                                            },
                                        })
                                        aggregates.push({ field: skillGoalItem.skillName + "_Goal", aggregate: "sum" })
                                        aggregates.push({ field: skillGoalItem.skillName + "_Count", aggregate: "sum" })
                                    });
                                }
                            }
                            var gridData = [];
                            _.each(data, function (datItem) {
                                var userItem = _.find($rootScope.organizationUsers, function (memberItem) {
                                    return memberItem.id == datItem.userId;
                                });
                                $scope.users.push({
                                    id: datItem.userId,
                                    name: userItem.firstName + " " + userItem.lastName,
                                });
                                var rowdata = {
                                    goalStartDate: moment(kendo.parseDate(datItem.goalStartDate)).format('L LT'),
                                    goalEndDate: moment(kendo.parseDate(datItem.goalEndDate)).format('L LT'),
                                    participantId: datItem.participantId,
                                    userName: userItem.firstName + " " + userItem.lastName
                                }
                                _.each(datItem.prospectingSkillGoalResults, function (skillGoalItem) {
                                    rowdata[skillGoalItem.skillName + "_Goal"] = skillGoalItem.goal;
                                    rowdata[skillGoalItem.skillName + "_Count"] = skillGoalItem.count;
                                    rowdata[skillGoalItem.skillName + "_Result"] = skillGoalItem.result;
                                });
                                gridData.push(rowdata);
                            });
                            $scope.users = _.uniq($scope.users, function (item) {
                                return item.id;
                            });
                            if ($scope.users.length > 0) {
                                $scope.changeUser($scope.users[0].id);
                            }
                            if ($("#salesmanAggregatedSalesActivitiesGrid").data("kendoGrid")) {
                                $("#salesmanAggregatedSalesActivitiesGrid").kendoGrid("destroy");
                                $("#salesmanAggregatedSalesActivitiesGrid").html("");
                            }
                            $("#salesmanAggregatedSalesActivitiesGrid").kendoGrid({
                                //dataBound: $scope.onUserAssignGridDataBound,
                                dataSource: {
                                    type: "json",
                                    data: gridData,
                                    pageSize: 10,
                                    aggregate: aggregates,
                                },
                                groupable: false, // this will remove the group bar
                                columnMenu: false,
                                filterable: false,
                                pageable: true,
                                sortable: true,
                                columns: columns,
                            });
                            App.initSlimScroll(".scroller");
                        })
                    }
                }
            }
            $scope.changeUser = function (userId) {
                if (userId) {
                    $scope.selectedUser = _.find($scope.users, function (item) {
                        return item.id == userId;
                    })
                    progressBar.startProgress();
                    organizationSalesService.getUserSalesActivityData($scope.salesManProfileId, userId).then(function (data) {
                        progressBar.stopProgress();
                        var columns = [];
                        var aggregates = [];
                        if (data.length > 0) {
                            columns.push({
                                field: "prospectingGoalName", title: $translate.instant('ORGANIZATIONS_SALES_ACTIVITY'), hidden: true,
                            });
                            columns.push({ field: "goalStartDate", title: $translate.instant('COMMON_START_DATE'), hidden: true, });
                            columns.push({ field: "goalEndDate", title: $translate.instant('COMMON_END_DATE'), hidden: true, });
                            columns.push({ field: "actvitiyName", title: $translate.instant('ORGANIZATIONS_ACTIVITY_NAME'), footerTemplate: "Total" });
                            columns.push({ field: "actvitiyStart", title: $translate.instant('ORGANIZATIONS_ACTIVITY_START') });
                            columns.push({ field: "actvitiyEnd", title: $translate.instant('ORGANIZATIONS_ACTIVITY_END') });
                            if (data[0].prospectingSkillGoalResults.length > 0) {
                                _.each(data[0].prospectingSkillGoalResults, function (skillGoalItem) {
                                    columns.push({
                                        field: skillGoalItem.skillName + "_Count", title: skillGoalItem.skillName + ' ' + $translate.instant('ORGANIZATIONS_COUNT'), aggregates: ["sum"], footerTemplate: "<div class='text-center'> #= sum # </div>", attributes: {
                                            "class": "text-center"
                                        }
                                    });
                                    aggregates.push({ field: skillGoalItem.skillName + "_Count", aggregate: "sum" })
                                });
                            }
                            var gridData = [];
                            _.each(data, function (datItem) {
                                var userItem = _.find($rootScope.organizationUsers, function (memberItem) {
                                    return memberItem.id == datItem.userId;
                                });
                                var rowdata = {
                                    actvitiyName: datItem.actvitiyName,
                                    prospectingGoalName: datItem.prospectingGoalName,
                                    goalStartDate: moment(kendo.parseDate(datItem.goalStartDate)).format('L LT'),
                                    goalEndDate: moment(kendo.parseDate(datItem.goalEndDate)).format('L LT'),
                                    actvitiyStart: moment(kendo.parseDate(datItem.actvitiyStart)).format('L LT'),
                                    actvitiyEnd: moment(kendo.parseDate(datItem.actvitiyEnd)).format('L LT'),
                                }
                                _.each(datItem.prospectingSkillGoalResults, function (skillGoalItem) {
                                    rowdata[skillGoalItem.skillName + "_Count"] = skillGoalItem.count;
                                });
                                gridData.push(rowdata);
                            })
                        }
                        if ($("#salesmanActivityGrid").data("kendoGrid")) {
                            $("#salesmanActivityGrid").kendoGrid("destroy");
                            $("#salesmanActivityGrid").html("");
                        }
                        $("#salesmanActivityGrid").kendoGrid({
                            dataSource: {
                                type: "json",
                                data: gridData,
                                //group: { field: "profileid", field: "skill" },
                                pageSize: 10,
                                group: {
                                    field: "prospectingGoalName",
                                    dir: "asc",
                                },
                                aggregate: aggregates,
                            },
                            groupable: false, // this will remove the group bar
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
                            sortable: true,
                            columns: columns,
                        });
                    })
                }
            }
            $scope.salesManProspectingTaskChanged = function () {
                if ($("#salesmanTaskAggregatedSalesActivitiesGrid").data("kendoGrid")) {
                    $("#salesmanTaskAggregatedSalesActivitiesGrid").kendoGrid("destroy");
                    $("#salesmanTaskAggregatedSalesActivitiesGrid").html("");
                }
                if ($("#salesmanTaskActivityGrid").data("kendoGrid")) {
                    $("#salesmanTaskActivityGrid").kendoGrid("destroy");
                    $("#salesmanTaskActivityGrid").html("");
                }
                //$scope.salesManProjectId = null;
                //$scope.salesManProjects = [];
                //$scope.projectProfiles = [];
                //$scope.salesManProfileId = null;
                if ($scope.salesManProspectingTaskId) {
                    progressBar.startProgress();
                    $scope.activityResultFilterOptionModel = {
                        taskId: $scope.salesManProspectingTaskId,
                        userId: $scope.salesManId,
                        startDate: $scope.salesManProspectingTaskStartDate,
                        endDate: $scope.salesManProspectingTaskEndDate
                    }
                    organizationSalesService.getUserTaskAggregatedSalesActivityData($scope.activityResultFilterOptionModel).then(function (data) {
                        progressBar.stopProgress();
                        $scope.aggregatedSalesActivities = [];
                        var columns = [];
                        var aggregates = [];
                        if (data.length > 0) {
                            columns.push({ field: "prospectingName", title: $translate.instant('ORGANIZATIONS_PROSPECTING_NAME'), footerTemplate: "Total" });
                            //columns.push({ field: "userName", title: 'Member' });
                            columns.push({ field: "goalStartDate", title: $translate.instant('COMMON_START_DATE') });
                            columns.push({ field: "goalEndDate", title: $translate.instant('COMMON_END_DATE') });
                            //columns.push({ field: "skillName", title: 'skill Name' })
                            if (data[0].prospectingSkillGoalResults.length > 0) {
                                _.each(data[0].prospectingSkillGoalResults, function (skillGoalItem) {
                                    columns.push({
                                        field: skillGoalItem.skillName + "_Goal", title: skillGoalItem.skillName + ' ' + $translate.instant('COMMON_GOAL'), aggregates: ["sum"], footerTemplate: "<div class='text-center'> #= sum # </div>", attributes: {
                                            "class": "text-center"
                                        }
                                    })
                                    columns.push({
                                        field: skillGoalItem.skillName + "_Count", title: skillGoalItem.skillName + ' ' + $translate.instant('ORGANIZATIONS_COUNT'), aggregates: ["sum"], footerTemplate: "<div class='text-center'> #= sum # </div>", attributes: {
                                            "class": "text-center"
                                        }, template: function (data, value) {
                                            return data[skillGoalItem.skillName + "_Count"] + " <i class='fa fa-eye fa-lg' ng-click='viewProspectingResults(" + data.prospectingGoalId + "," + skillGoalItem.skillId + "," + skillGoalItem.seqNo + ")'></i>"
                                        }
                                    })
                                    columns.push({
                                        field: skillGoalItem.skillName + "_Result", title: skillGoalItem.skillName + ' ' + $translate.instant('COMMON_RESULT'), attributes: {
                                            "class": "text-center"
                                        },
                                        template: "<span>#=" + skillGoalItem.skillName + "_Result" + "#%<\span>",
                                        footerTemplate: function (data) {
                                            var avgResult = ((data[skillGoalItem.skillName + "_Count"].sum / data[skillGoalItem.skillName + "_Goal"].sum) * 100)
                                            var resultAvg = Math.round(avgResult * 100) / 100;
                                            return "<div class='text-center'>" + resultAvg + "%</div>"
                                        },
                                    })
                                    aggregates.push({
                                        field: skillGoalItem.skillName + "_Goal", aggregate: "sum"
                                    })
                                    aggregates.push({
                                        field: skillGoalItem.skillName + "_Count", aggregate: "sum"
                                    })
                                });
                            }
                        }
                        var gridData = [];
                        _.each(data, function (datItem) {
                            var userItem = _.find($rootScope.organizationUsers, function (memberItem) {
                                return memberItem.id == datItem.userId;
                            });
                            var rowdata = {
                                goalStartDate: moment(kendo.parseDate(datItem.goalStartDate)).format('L LT'),
                                goalEndDate: moment(kendo.parseDate(datItem.goalEndDate)).format('L LT'),
                                participantId: datItem.participantId,
                                //userName: userItem.firstName + " " + userItem.lastName
                                prospectingName: datItem.prospectingName,
                                prospectingGoalId: 0,
                            }
                            _.each(datItem.prospectingSkillGoalResults, function (skillGoalItem) {
                                rowdata.prospectingGoalId = skillGoalItem.prospectingGoalId;
                                rowdata[skillGoalItem.skillName + "_Goal"] = skillGoalItem.goal;
                                rowdata[skillGoalItem.skillName + "_Count"] = skillGoalItem.count;
                                rowdata[skillGoalItem.skillName + "_Result"] = skillGoalItem.result;
                            });
                            gridData.push(rowdata);
                        })
                        if ($("#salesmanTaskAggregatedSalesActivitiesGrid").data("kendoGrid")) {
                            $("#salesmanTaskAggregatedSalesActivitiesGrid").kendoGrid("destroy");
                            $("#salesmanTaskAggregatedSalesActivitiesGrid").html("");
                        }
                        $("#salesmanTaskAggregatedSalesActivitiesGrid").kendoGrid({
                            //dataBound: $scope.onUserAssignGridDataBound,
                            dataSource: {
                                type: "json",
                                data: gridData,
                                pageSize: 10,
                                aggregate: aggregates,
                            },
                            groupable: false, // this will remove the group bar
                            columnMenu: false,
                            filterable: false,
                            pageable: true,
                            sortable: true,
                            columns: columns,
                        });
                        var linkFn = $compile($("#salesmanTaskAggregatedSalesActivitiesGrid"));
                        linkFn($scope);
                        App.initSlimScroll(".scroller");
                        progressBar.startProgress();
                        organizationSalesService.getUserTaskSalesActivityData($scope.activityResultFilterOptionModel).then(function (data) {
                            progressBar.stopProgress();
                            var columns = [];
                            var aggregates = [];
                            if (data.length > 0) {
                                columns.push({
                                    field: "prospectingGoalName", title: $translate.instant('ORGANIZATIONS_SALES_ACTIVITY'), hidden: true,
                                });
                                columns.push({ field: "goalStartDate", title: $translate.instant('COMMON_START_DATE'), hidden: true, });
                                columns.push({ field: "goalEndDate", title: $translate.instant('COMMON_END_DATE'), hidden: true, });
                                columns.push({ field: "actvitiyName", title: $translate.instant('ORGANIZATIONS_ACTIVITY_NAME'), footerTemplate: "Total" });
                                columns.push({ field: "actvitiyStart", title: $translate.instant('ORGANIZATIONS_ACTIVITY_START') });
                                columns.push({ field: "actvitiyEnd", title: $translate.instant('ORGANIZATIONS_ACTIVITY_END') });
                                if (data[0].prospectingSkillGoalResults.length > 0) {
                                    _.each(data[0].prospectingSkillGoalResults, function (skillGoalItem) {
                                        columns.push({
                                            field: skillGoalItem.skillName + "_Count", title: skillGoalItem.skillName + ' ' + $translate.instant('ORGANIZATIONS_COUNT'), aggregates: ["sum"], footerTemplate: "<div class='text-center'> #= sum # </div>", attributes: {
                                                "class": "text-center"
                                            }
                                        });
                                        aggregates.push({
                                            field: skillGoalItem.skillName + "_Count", aggregate: "sum",
                                            footerTemplate: "<div class='text-center'> #= sum # </div>", attributes: {
                                                "class": "text-center"
                                            }
                                        })
                                    });
                                }
                                columns.push({
                                    field: "activityStatus", title: $translate.instant('COMMON_STATUS'), template: function (data) {
                                        if (data.expiredActivityReason) {
                                            return data.activityStatus + " <i class='fa fa-info-circle popovers' data-placement='bottom' title='" + data.expiredActivityReason + "'></i>";
                                        }
                                        else {
                                            return data.activityStatus;
                                        }
                                    }
                                });
                                var gridData = [];
                                _.each(data, function (datItem) {
                                    var userItem = _.find($rootScope.organizationUsers, function (memberItem) {
                                        return memberItem.id == datItem.userId;
                                    });
                                    var rowdata = {
                                        actvitiyName: datItem.actvitiyName,
                                        prospectingGoalName: datItem.prospectingGoalName,
                                        goalStartDate: moment(kendo.parseDate(datItem.goalStartDate)).format('L LT'),
                                        goalEndDate: moment(kendo.parseDate(datItem.goalEndDate)).format('L LT'),
                                        actvitiyStart: moment(kendo.parseDate(datItem.actvitiyStart)).format('L LT'),
                                        actvitiyEnd: moment(kendo.parseDate(datItem.actvitiyEnd)).format('L LT'),
                                        activityStatus: datItem.activityStatus,
                                        expiredActivityReason: datItem.expiredActivityReason,
                                    }
                                    _.each(datItem.prospectingSkillGoalResults, function (skillGoalItem) {
                                        rowdata[skillGoalItem.skillName + "_Count"] = skillGoalItem.count;
                                    });
                                    gridData.push(rowdata);
                                })
                            }
                            if ($("#salesmanTaskActivityGrid").data("kendoGrid")) {
                                $("#salesmanTaskActivityGrid").kendoGrid("destroy");
                                $("#salesmanTaskActivityGrid").html("");
                            }
                            $("#salesmanTaskActivityGrid").kendoGrid({
                                dataSource: {
                                    type: "json",
                                    data: gridData,
                                    //group: { field: "profileid", field: "skill" },
                                    pageSize: 10,
                                    group: {
                                        field: "prospectingGoalName",
                                        dir: "asc",
                                    },
                                    aggregate: aggregates,
                                },
                                groupable: false, // this will remove the group bar
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
                                sortable: true,
                                columns: columns,
                            });
                            $(".popovers").popover();
                        })
                    });
                }
            }
            $scope.salesManProspectingTaskChangedManually = function () {
                if ($("#salesmanTaskAggregatedSalesActivitiesGrid").data("kendoGrid")) {
                    $("#salesmanTaskAggregatedSalesActivitiesGrid").kendoGrid("destroy");
                    $("#salesmanTaskAggregatedSalesActivitiesGrid").html("");
                }
                if ($("#salesmanTaskActivityGrid").data("kendoGrid")) {
                    $("#salesmanTaskActivityGrid").kendoGrid("destroy");
                    $("#salesmanTaskActivityGrid").html("");
                }
                //$scope.salesManProjectId = null;
                //$scope.salesManProjects = [];
                //$scope.projectProfiles = [];
                //$scope.salesManProfileId = null;
                if ($scope.salesManProspectingTaskId) {
                    progressBar.startProgress();
                    $scope.salesManProspectingTaskStartDate = null;
                    $scope.salesManProspectingTaskEndDate = null;
                    $scope.activityResultFilterOptionModel = {
                        taskId: $scope.salesManProspectingTaskId,
                        userId: $scope.salesManId,
                        startDate: $scope.salesManProspectingTaskStartDate,
                        endDate: $scope.salesManProspectingTaskEndDate
                    }
                    organizationSalesService.getUserTaskAggregatedSalesActivityData($scope.activityResultFilterOptionModel).then(function (data) {
                        progressBar.stopProgress();
                        $scope.aggregatedSalesActivities = [];
                        var columns = [];
                        var aggregates = [];
                        if (data.length > 0) {
                            columns.push({ field: "prospectingName", title: $translate.instant('ORGANIZATIONS_PROSPECTING_NAME'), footerTemplate: "Total" });
                            //columns.push({ field: "userName", title: 'Member' });
                            columns.push({ field: "goalStartDate", title: $translate.instant('COMMON_START_DATE') });
                            columns.push({ field: "goalEndDate", title: $translate.instant('COMMON_END_DATE') });
                            //columns.push({ field: "skillName", title: 'skill Name' })
                            if (data[0].prospectingSkillGoalResults.length > 0) {
                                _.each(data[0].prospectingSkillGoalResults, function (skillGoalItem) {
                                    columns.push({
                                        field: skillGoalItem.skillName + "_Goal", title: skillGoalItem.skillName + ' ' + $translate.instant('COMMON_GOAL'), aggregates: ["sum"], footerTemplate: "<div class='text-center'> #= sum # </div>", attributes: {
                                            "class": "text-center"
                                        }
                                    })
                                    columns.push({
                                        field: skillGoalItem.skillName + "_Count", title: skillGoalItem.skillName + ' ' + $translate.instant('ORGANIZATIONS_COUNT'), aggregates: ["sum"], footerTemplate: "<div class='text-center'> #= sum # </div>", attributes: {
                                            "class": "text-center"
                                        }, template: function (data, value) {
                                            return data[skillGoalItem.skillName + "_Count"] + " <i class='fa fa-eye ga-lg' ng-click='viewProspectingResults(" + data.prospectingGoalId + "," + skillGoalItem.skillId + "," + skillGoalItem.seqNo + ")'></i>"
                                        }
                                    })
                                    columns.push({
                                        field: skillGoalItem.skillName + "_Result", title: skillGoalItem.skillName + ' ' + $translate.instant('COMMON_RESULT'), attributes: {
                                            "class": "text-center"
                                        },
                                        template: "<span>#=" + skillGoalItem.skillName + "_Result" + "#%<\span>",
                                        footerTemplate: function (data) {
                                            var avgResult = ((data[skillGoalItem.skillName + "_Count"].sum / data[skillGoalItem.skillName + "_Goal"].sum) * 100)
                                            var resultAvg = Math.round(avgResult * 100) / 100;
                                            return "<div class='text-center'>" + resultAvg + "%</div>"
                                        },
                                    })
                                    aggregates.push({
                                        field: skillGoalItem.skillName + "_Goal", aggregate: "sum"
                                    })
                                    aggregates.push({
                                        field: skillGoalItem.skillName + "_Count", aggregate: "sum"
                                    })
                                });
                            }
                        }
                        var gridData = [];
                        _.each(data, function (datItem) {
                            var userItem = _.find($rootScope.organizationUsers, function (memberItem) {
                                return memberItem.id == datItem.userId;
                            });
                            var rowdata = {
                                goalStartDate: moment(kendo.parseDate(datItem.goalStartDate)).format('L LT'),
                                goalEndDate: moment(kendo.parseDate(datItem.goalEndDate)).format('L LT'),
                                participantId: datItem.participantId,
                                //userName: userItem.firstName + " " + userItem.lastName
                                prospectingName: datItem.prospectingName,
                                prospectingGoalId: 0,
                            }
                            _.each(datItem.prospectingSkillGoalResults, function (skillGoalItem) {
                                rowdata.prospectingGoalId = skillGoalItem.prospectingGoalId;
                                rowdata[skillGoalItem.skillName + "_Goal"] = skillGoalItem.goal;
                                rowdata[skillGoalItem.skillName + "_Count"] = skillGoalItem.count;
                                rowdata[skillGoalItem.skillName + "_Result"] = skillGoalItem.result;
                            });
                            gridData.push(rowdata);
                        })
                        if ($("#salesmanTaskAggregatedSalesActivitiesGrid").data("kendoGrid")) {
                            $("#salesmanTaskAggregatedSalesActivitiesGrid").kendoGrid("destroy");
                            $("#salesmanTaskAggregatedSalesActivitiesGrid").html("");
                        }
                        $("#salesmanTaskAggregatedSalesActivitiesGrid").kendoGrid({
                            //dataBound: $scope.onUserAssignGridDataBound,
                            dataSource: {
                                type: "json",
                                data: gridData,
                                pageSize: 10,
                                aggregate: aggregates,
                            },
                            groupable: false, // this will remove the group bar
                            columnMenu: false,
                            filterable: false,
                            pageable: true,
                            sortable: true,
                            columns: columns,
                        });
                        var linkFn = $compile($("#salesmanTaskAggregatedSalesActivitiesGrid"));
                        linkFn($scope);
                        App.initSlimScroll(".scroller");
                        progressBar.startProgress();
                        organizationSalesService.getUserTaskSalesActivityData($scope.activityResultFilterOptionModel).then(function (data) {
                            progressBar.stopProgress();
                            var columns = [];
                            var aggregates = [];
                            if (data.length > 0) {
                                columns.push({
                                    field: "prospectingGoalName", title: $translate.instant('ORGANIZATIONS_SALES_ACTIVITY'), hidden: true,
                                });
                                columns.push({ field: "goalStartDate", title: $translate.instant('COMMON_START_DATE'), hidden: true, });
                                columns.push({ field: "goalEndDate", title: $translate.instant('COMMON_END_DATE'), hidden: true, });
                                columns.push({ field: "actvitiyName", title: $translate.instant('ORGANIZATIONS_ACTIVITY_NAME'), footerTemplate: "Total" });
                                columns.push({ field: "actvitiyStart", title: $translate.instant('ORGANIZATIONS_ACTIVITY_START') });
                                columns.push({ field: "actvitiyEnd", title: $translate.instant('ORGANIZATIONS_ACTIVITY_END') });
                                if (data[0].prospectingSkillGoalResults.length > 0) {
                                    _.each(data[0].prospectingSkillGoalResults, function (skillGoalItem) {
                                        columns.push({
                                            field: skillGoalItem.skillName + "_Count", title: skillGoalItem.skillName + ' ' + $translate.instant('ORGANIZATIONS_COUNT'), aggregates: ["sum"], footerTemplate: "<div class='text-center'> #= sum # </div>", attributes: {
                                                "class": "text-center"
                                            }
                                        });
                                        aggregates.push({
                                            field: skillGoalItem.skillName + "_Count", aggregate: "sum",
                                            footerTemplate: "<div class='text-center'> #= sum # </div>", attributes: {
                                                "class": "text-center"
                                            }
                                        })
                                    });
                                }
                                columns.push({
                                    field: "activityStatus", title: $translate.instant('COMMON_STATUS'), template: function (data) {
                                        if (data.expiredActivityReason) {
                                            return data.activityStatus + " <i class='fa fa-info-circle popovers' data-placement='bottom' title='" + data.expiredActivityReason + "'></i>";
                                        }
                                        else {
                                            return data.activityStatus;
                                        }
                                    }
                                });
                                var gridData = [];
                                _.each(data, function (datItem) {
                                    var userItem = _.find($rootScope.organizationUsers, function (memberItem) {
                                        return memberItem.id == datItem.userId;
                                    });
                                    var rowdata = {
                                        actvitiyName: datItem.actvitiyName,
                                        prospectingGoalName: datItem.prospectingGoalName,
                                        goalStartDate: moment(kendo.parseDate(datItem.goalStartDate)).format('L LT'),
                                        goalEndDate: moment(kendo.parseDate(datItem.goalEndDate)).format('L LT'),
                                        actvitiyStart: moment(kendo.parseDate(datItem.actvitiyStart)).format('L LT'),
                                        actvitiyEnd: moment(kendo.parseDate(datItem.actvitiyEnd)).format('L LT'),
                                        activityStatus: datItem.activityStatus,
                                        expiredActivityReason: datItem.expiredActivityReason,
                                    }
                                    _.each(datItem.prospectingSkillGoalResults, function (skillGoalItem) {
                                        rowdata[skillGoalItem.skillName + "_Count"] = skillGoalItem.count;
                                    });
                                    gridData.push(rowdata);
                                })
                            }
                            if ($("#salesmanTaskActivityGrid").data("kendoGrid")) {
                                $("#salesmanTaskActivityGrid").kendoGrid("destroy");
                                $("#salesmanTaskActivityGrid").html("");
                            }
                            $("#salesmanTaskActivityGrid").kendoGrid({
                                dataSource: {
                                    type: "json",
                                    data: gridData,
                                    //group: { field: "profileid", field: "skill" },
                                    pageSize: 10,
                                    group: {
                                        field: "prospectingGoalName",
                                        dir: "asc",
                                    },
                                    aggregate: aggregates,
                                },
                                groupable: false, // this will remove the group bar
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
                                sortable: true,
                                columns: columns,
                            });
                            $(".popovers").popover();
                        })
                    });
                }
            }
            $scope.salesManProspectingTaskStartDateOpen = function (event) {
                var datepickerElement = $(event.sender.element);
                if ($scope.salesManProspectingTaskEndDate) {
                    var datepicker = $(event.sender.element).data("kendoDateTimePicker");
                    datepicker.setOptions({
                        max: kendo.parseDate($scope.salesManProspectingTaskEndDate),
                    });
                }
            }
            $scope.salesManProspectingTaskStartDateChange = function (event) {
                $scope.salesManProspectingTaskStartDate = moment(kendo.parseDate(event.sender.value())).format('L LT');
                if (kendo.parseDate(event.sender.value()) > kendo.parseDate($scope.salesManProspectingTaskEndDate)) {
                    $scope.salesManProspectingTaskEndDate = null;
                }
                if ($scope.salesManProspectingTaskStartDate && $scope.salesManProspectingTaskEndDate) {
                    $scope.salesManProspectingTaskChanged();
                }
            }
            $scope.salesManProspectingTaskEndDateOpen = function (event) {
                var datepickerElement = $(event.sender.element);
                if ($scope.salesManProspectingTaskStartDate) {
                    var datepicker = $(event.sender.element).data("kendoDateTimePicker");
                    datepicker.setOptions({
                        min: kendo.parseDate($scope.salesManProspectingTaskStartDate),
                    });
                }
            }
            $scope.salesManProspectingTaskEndDateChange = function (event) {
                $scope.salesManProspectingTaskEndDate = moment(kendo.parseDate(event.sender.value())).format('L LT');
                if (kendo.parseDate(event.sender.value()) < kendo.parseDate($scope.salesManProspectingTaskStartDate)) {
                    $scope.salesManProspectingTaskStartDate = null;
                }
                if ($scope.salesManProspectingTaskStartDate && $scope.salesManProspectingTaskEndDate) {
                    $scope.salesManProspectingTaskChanged();
                }
            }
            $scope.viewProspectingResults = function (prospectingGoalId, skillId, seqNo) {
                progressBar.startProgress();
                organizationSalesService.getProspectingSkillResultByGoalId(prospectingGoalId, skillId).then(function (data) {
                    progressBar.stopProgress();
                    $("#prospectingResultModel").modal("show");
                    var columns = [];
                    var aggregates = [];
                    if (data.length > 0) {
                        columns.push({
                            field: "customerName", title: $translate.instant('COMMON_NAME'),
                        });
                        columns.push({
                            field: "mobile", title: $translate.instant('COMMON_MOBILE'), attributes: {
                                "class": "text-center"
                            },
                        });
                        if (seqNo == 2) {
                            columns.push({
                                field: "duration", title: $translate.instant('COMMON_DURATION'),
                                template: function (data) {
                                    if (data.duration) {
                                        return "<span class='text-center'>" + data.duration + " Min<\span>";
                                    }
                                    else {
                                        return "";
                                    }
                                },
                                attributes: {
                                    "class": "text-center"
                                }
                            });
                            columns.push({
                                field: "customerInterestRate", title: $translate.instant('ORGANIZATIONS_CUSTOMER_INTEREST_RATE'),
                                template: function (data) {
                                    if (data.customerInterestRate) {
                                        return "<span class='text-center'>" + data.customerInterestRate + "%<\span>";
                                    }
                                    else {
                                        return "";
                                    }
                                },
                                attributes: {
                                    "class": "text-center"
                                }
                            });
                            columns.push({
                                field: "reason", title: $translate.instant('ORGANIZATIONS_REASON'), attributes: {
                                    "class": "text-center"
                                }
                            });
                        }
                        columns.push({
                            field: "result", title: $translate.instant('COMMON_RESULT'),
                            template: function (data) {
                                if (data.scheduleTime) {
                                    return "<span class='text-center' title='" + data.description + "'>" + data.result + " at " + moment(kendo.parseDate(data.scheduleTime)).format('L LT') + "<\span>"
                                }
                                else {
                                    return "<span class='text-center' title='" + data.description + "'>" + data.result + "<\span>"
                                }
                            },
                            attributes: {
                                "class": "text-center"
                            }
                        });
                        var gridData = [];
                        _.each(data, function (datItem) {
                            var userItem = _.find($rootScope.organizationUsers, function (memberItem) {
                                return memberItem.id == datItem.userId;
                            });
                            if (seqNo == 3) {
                                datItem.isMeeting = true;
                                datItem.isFollowUp = false;
                                datItem.isNoMeeting = false;
                            }
                            var rowdata = {
                                customerName: datItem.prospectingCustomer.name,
                                mobile: datItem.prospectingCustomer.phone,
                                duration: datItem.duration,
                                isNoMeeting: datItem.isNoMeeting,
                                isFollowUp: datItem.isFollowUp,
                                isMeeting: datItem.isMeeting,
                                customerInterestRate: datItem.customerInterestRate,
                                reason: datItem.reason,
                                result: datItem.isMeeting ? 'Meeting Scheduled' : (datItem.isFollowUp ? 'Follow up Scheduled' : 'Not Interested'),
                                description: datItem.description,
                                scheduleTime: datItem.scheduleTime,
                            }
                            if (seqNo == 1) {
                                rowdata.result = "Called";
                            }
                            gridData.push(rowdata);
                        })
                    }
                    if ($("#prospectingResultGrid").data("kendoGrid")) {
                        $("#prospectingResultGrid").kendoGrid("destroy");
                        $("#prospectingResultGrid").html("");
                    }
                    $("#prospectingResultGrid").kendoGrid({
                        dataSource: {
                            type: "json",
                            data: gridData,
                            //group: { field: "profileid", field: "skill" },
                            pageSize: 10,
                        },
                        groupable: false, // this will remove the group bar
                        columnMenu: false,
                        filterable: false,
                        pageable: true,
                        sortable: true,
                        columns: columns,
                    });
                })
            }
            if ($rootScope.organization) {
                if ($rootScope.organization.organizationId) {
                    $scope.selectedOrganizationId = $rootScope.organization.organizationId;
                }
            }
            if ($rootScope.organizationUsers) {
                if ($scope.currentUser.isAdmin) {
                    $scope.salesMans = _.clone($rootScope.organizationUsers);
                    $scope.salesMans.unshift({ id: null, firstName: "All" });
                }
                else {
                    _.each($rootScope.organizationUsers, function (item) {
                        if ($scope.currentUser.userId == item.id) {
                            $scope.salesMans.push(item);
                            $scope.salesManId = item.id;
                            $scope.salesmanChangedManually();
                        }
                    })
                }
            }
            var vm = this;
            vm.clearAll = function () {
                $scope.salesMans = [];
                $scope.salesManProjects = [];
                $scope.projectProfiles = [];
                $scope.users = [];
                $scope.selectedUser = null;
                $scope.salesManProspectingTasks = [];
                $scope.salesManProspectingTaskId = null;
                if ($("#salesmanAggregatedSalesActivitiesGrid").data("kendoGrid")) {
                    $("#salesmanAggregatedSalesActivitiesGrid").kendoGrid("destroy");
                    $("#salesmanAggregatedSalesActivitiesGrid").html("");
                }
                if ($("#salesmanActivityGrid").data("kendoGrid")) {
                    $("#salesmanActivityGrid").kendoGrid("destroy");
                    $("#salesmanActivityGrid").html("");
                }
                if ($("#salesmanTaskAggregatedSalesActivitiesGrid").data("kendoGrid")) {
                    $("#salesmanTaskAggregatedSalesActivitiesGrid").kendoGrid("destroy");
                    $("#salesmanTaskAggregatedSalesActivitiesGrid").html("");
                }
                if ($("#salesmanTaskActivityGrid").data("kendoGrid")) {
                    $("#salesmanTaskActivityGrid").kendoGrid("destroy");
                    $("#salesmanTaskActivityGrid").html("");
                }
                if ($rootScope.organization) {
                    if ($rootScope.organization.organizationId) {
                        $scope.selectedOrganizationId = $rootScope.organization.organizationId;
                    }
                }
                if ($rootScope.organizationUsers) {
                    if ($scope.currentUser.isAdmin) {
                        $scope.salesMans = _.clone($rootScope.organizationUsers);
                        $scope.salesMans.unshift({ id: null, firstName: "All" });
                    }
                    else {
                        _.each($rootScope.organizationUsers, function (item) {
                            if ($scope.currentUser.userId == item.id) {
                                $scope.salesMans.push(item);
                                $scope.salesManId = item.id;
                                $scope.salesmanChangedManually();
                            }
                        })
                    }
                }
                //$("#organizationSales")
                var linkFn = $compile($("#organizationSales"));
                linkFn($scope);
            }
        }]);