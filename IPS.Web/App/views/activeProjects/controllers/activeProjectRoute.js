'use strict';
angular
    .module('ips.activeProjects')
    .config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
        var baseActiveProjectsResolve = {
            pageName: function ($translate) {
                return $translate.instant('MYPROJECTS_ACTIVE_PROJECTS');
            },
            projects: function (activeProjectsService, authService) {
                if (!authService.authentication.isAuth) {
                    authService.getCurrentUser().then(function (response) {
                        return activeProjectsService.getProjects(response.data.id, "");
                    }, function (e) {

                    });
                }
                else {
                    return activeProjectsService.getProjects(authService.authentication.user.id, "");
                }
            }
        };
        var basePendingProjectsResolve = {
            pageName: function ($translate) {
                return $translate.instant('MYPROJECTS_PENDING_PROJECTS');
            },
            projects: function (activeProjectsService, authService) {
                if (!authService.authentication.isAuth) {
                    authService.getCurrentUser().then(function (response) {
                        return activeProjectsService.getProjects(response.data.id, "");
                    }, function (e) {

                    });
                }
                else {
                    return activeProjectsService.getProjects(authService.authentication.user.id, "");
                }
            }
        };
        var baseExpiredProjectsResolve = {
            pageName: function ($translate) {
                return $translate.instant('MYPROJECTS_EXPIRED_PROJECTS');
            },
            projects: function (activeProjectsService, authService) {
                if (!authService.authentication.isAuth) {
                    authService.getCurrentUser().then(function (response) {
                        return activeProjectsService.getProjects(response.data.id, "");
                    }, function (e) {

                    });
                }
                else {
                    return activeProjectsService.getProjects(authService.authentication.user.id, "");
                }
            }
        };
        var baseCompletedProjectsResolve = {
            pageName: function ($translate) {
                return $translate.instant('MYPROJECTS_COMPLETED_PROJECTS');
            },
            projects: function (activeProjectsService, authService) {
                if (!authService.authentication.isAuth) {
                    authService.getCurrentUser().then(function (response) {
                        return activeProjectsService.getProjects(response.data.id, "");
                    }, function (e) {

                    });
                }
                else {
                    return activeProjectsService.getProjects(authService.authentication.user.id, "");
                }
            }
        };
        var baseHistoryProjectsResolve = {
            pageName: function ($translate) {
                return $translate.instant('COMMON_HISTORY');
            },
            projects: function (activeProjectsService, authService) {
                if (!authService.authentication.isAuth) {
                    authService.getCurrentUser().then(function (response) {
                        return activeProjectsService.getProjects(response.data.id, "");
                    }, function (e) {

                    });
                }
                else {
                    return activeProjectsService.getProjects(authService.authentication.user.id, "");
                }
            }
        };
        $stateProvider
            .state('home.activeProjects', {
                url: "/activeProjects",
                templateUrl: "views/activeProjects/views/activeProjects.html",
                resolve: baseActiveProjectsResolve,
                controller: "activeProjectsCtrl",
                data: {
                    displayName: '{{pageName}}',//'Active Projects',
                    paneLimit: 1,
                    depth: 2,
                    resource: "Projects"
                }
            })
            .state('home.pendingProjects', {
                url: "/pendingProjects",
                templateUrl: "views/activeProjects/views/pendingProjects.html",
                resolve: basePendingProjectsResolve,
                controller: "pendingProjectsCtrl",
                data: {
                    displayName: '{{pageName}}',//'Active Projects',
                    paneLimit: 1,
                    depth: 2,
                    resource: "Projects"
                }
            })
            .state('home.expiredProjects', {
                url: "/expiredProjects",
                templateUrl: "views/activeProjects/views/expiredProjects.html",
                resolve: baseExpiredProjectsResolve,
                controller: "expiredProjectsCtrl",
                data: {
                    displayName: '{{pageName}}',//'Active Projects',
                    paneLimit: 1,
                    depth: 2,
                    resource: "Projects"
                }
            })
            .state('home.completedProjects', {
                url: "/completedProjects",
                templateUrl: "views/activeProjects/views/completedProjects.html",
                resolve: baseCompletedProjectsResolve,
                controller: "completedProjectsCtrl",
                data: {
                    displayName: '{{pageName}}',//'Active Projects',
                    paneLimit: 1,
                    depth: 2,
                    resource: "Projects"
                }
            })
            .state('home.historyProjects', {
                url: "/historyProjects",
                templateUrl: "views/activeProjects/views/historyProjects.html",
                resolve: baseHistoryProjectsResolve,
                controller: "historyProjectsCtrl",
                data: {
                    displayName: '{{pageName}}',//'Active Projects',
                    paneLimit: 1,
                    depth: 2,
                    resource: "Projects"
                }
            });
    }])
    .controller('activeProjectsCtrl', ['cssInjector', '$scope', 'activeProjectsService', '$location', 'projectRolesEnum', '$translate', 'globalVariables',
        function (cssInjector, $scope, activeProjectsService, $location, projectRolesEnum, $translate, globalVariables) {
            cssInjector.removeAll();
            cssInjector.add('views/activeProjects/activeProjects.css');
            moment.locale(globalVariables.lang.currentUICulture);
            $scope.activeProjectsOptions = {
                dataSource: {
                    type: "json",
                    transport: {
                        read: function (options) {
                            activeProjectsService.getActiveProjects().then(function (data) {
                                moment.locale(globalVariables.lang.currentUICulture);
                                _.each(data, function (item) {
                                    item.expectedStartDate = moment(kendo.parseDate(item.expectedStartDate)).format("L LT");
                                    item.expectedEndDate = moment(kendo.parseDate(item.expectedEndDate)).format("L LT");
                                })
                                options.success(data);
                            })
                        }
                    }
                },
                selectable: false,
                sortable: true,
                resizable: true,
                columns: [
                    { field: "name", title: $translate.instant('COMMON_NAME'), width: '120px' },
                    { field: "projectRoleName", title: $translate.instant('COMMON_ROLE'), width: '150px' },
                    {
                        field: "expectedStartDate", title: $translate.instant('COMMON_START_DATE'), filterable: false, template: '<div>{{dataItem.expectedStartDate | date:"short"}}</div>',
                        width: '150px'
                    },
                    {
                        field: "expectedEndDate", title: $translate.instant('COMMON_END_DATE'), filterable: false, template: '<div>{{dataItem.expectedEndDate | date:"short"}}</div>',
                        width: '120px'
                    },
                    {
                        field: "missionStatement", title: $translate.instant('MYPROJECTS_MISSION'),
                        width: '120px',
                        attributes: {
                            "class": "missionStatement"
                        },
                        template: '<div class="statement-cell"> {{dataItem.missionStatement}}</div>'
                    },
                    {
                        field: "visionStatement", title: $translate.instant('MYPROJECTS_VISION'), attributes: {
                            "class": "visionStatement"
                        },
                        width: '150px',
                        template: '<div class="statement-cell"> {{dataItem.visionStatement}}</div>'
                    },
                    {
                        field: "goalStatement", title: $translate.instant('MYPROJECTS_GOALS'),
                        width: '120px',
                        attributes: {
                            "class": "goalStatement"
                        }, template: function (dataItem) {
                            if (dataItem.goalStatement) {
                                return '<div class="statement-cell">' + dataItem.goalStatement.join(",") + '</div>';
                            }
                        }
                    },
                    {
                        field: "stratagiesStatement", title: $translate.instant('MYPROJECTS_STRATEGIES'),
                        width: '120px',
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
                        field: "totalActiveProfiles", title: "# " + $translate.instant('MYPROJECTS_ACTIVE_PROFILES'), width: '200px',
                    },
                    {
                        field: "totalExpiredProfiles", title: "# " + $translate.instant('MYPROJECTS_EXPIRED_PROFILES'), width: '200px',
                    },
                    {
                        field: "totalCompletedProfiles", title: "# " + $translate.instant('MYPROJECTS_COMPLETED_PROFILES'), width: '150px',
                    },
                    {
                        field: "action", title: $translate.instant('COMMON_ACTIONS'), sortable: false, template: "<div class='icon-groups'>" +
                            "<a class='fa fa-lg fa-eye' title='View Project'  ng-click='viewproject(dataItem.id)'></a>" +
                            "<a class='fa fa-lg fa-pencil' title='Edit Project ' ng-show='isAllowEdit(dataItem.link_ProjectUsers, dataItem.projectRoleId)' ng-click='editproject(dataItem.id)'></a>" +
                            "<a class='fa fa-lg fa-info' title='Project Status' ng-show='isAllowEdit(dataItem.link_ProjectUsers, dataItem.projectRoleId)' ng-click='projectStatus(dataItem.id)'></a>" +
                            "<a class='fa fa-lg fa-list' title='View Project Profiles' ng-click='viewprojectprofiles(dataItem.id)'></a>" +
                            "</div>",
                        width: '180px',
                    }
                    //{ field: "", title: "", width: 100, filterable: false },
                ]
            }

            $scope.tooltipOptions = $(".active-projects-grid").kendoTooltip({
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

            $scope.newProject = function () {
                $location.path("/newproject");
            }

            $scope.editproject = function (id) {
                $location.path("/editproject/" + id);
            }
            $scope.projectStatus = function (id) {
                $location.path("/projectStatus/" + id);
            }
            $scope.viewproject = function (id) {
                $location.path("/viewproject/" + id);
            }

            $scope.viewprojectprofiles = function (projectId) {
                $location.path("/projectprofiles/" + projectId);
            }

            $scope.isAllowEdit = function (link_ProjectUsers, projectRoleId) {
                var isPMExist = _.any(link_ProjectUsers, function (item) {
                    return item.roleId == projectRolesEnum.projectManager;
                });
                if (isPMExist) {
                    if (projectRoleId == projectRolesEnum.projectManager) {
                        return true;
                    }
                    else {
                        return false;
                    }
                }
                else {
                    var isFSMExist = _.any(link_ProjectUsers, function (item) {
                        return item.roleId == projectRolesEnum.finalScoreManager;
                    });
                    if (isFSMExist) {
                        if (projectRoleId == projectRolesEnum.finalScoreManager) {
                            return true;
                        }
                        else {
                            return false;
                        }
                    }
                }
            }
        }])
    .controller('completedProjectsCtrl', ['cssInjector', '$scope', 'activeProjectsService', '$location', 'profilesTypesEnum', 'evaluationRolesEnum', 'projectRolesEnum', '$translate', 'globalVariables',
        function (cssInjector, $scope, activeProjectsService, $location, profilesTypesEnum, evaluationRolesEnum, projectRolesEnum, $translate, globalVariables) {
            cssInjector.removeAll();
            cssInjector.add('views/activeProjects/activeProjects.css');
            moment.locale(globalVariables.lang.currentUICulture);

            $scope.completedOptions = {
                dataSource: {
                    type: "json",
                    transport: {
                        read: function (options) {
                            activeProjectsService.getCompletedProjects().then(function (data) {
                                moment.locale(globalVariables.lang.currentUICulture);
                                _.each(data, function (item) {
                                    item.expectedStartDate = moment(kendo.parseDate(item.expectedStartDate)).format("L LT");
                                    item.expectedEndDate = moment(kendo.parseDate(item.expectedEndDate)).format("L LT");
                                })
                                options.success(data);
                            })
                        }
                    }
                },
                selectable: false,
                sortable: true,
                resizable: true,
                columns: [
                    { field: "name", title: $translate.instant('COMMON_NAME'), width: '150px' },

                    { field: "projectRoleName", title: $translate.instant('COMMON_ROLE'), width: '150px' },
                    {
                        field: "expectedStartDate", title: $translate.instant('COMMON_START_DATE'), filterable: false, template: '<div>{{dataItem.expectedStartDate | date:"short"}}</div>',
                        width: '150px'
                    },
                    {
                        field: "expectedEndDate", title: $translate.instant('COMMON_END_DATE'), filterable: false, template: '<div>{{dataItem.expectedEndDate | date:"short"}}</div>',
                        width: '150px'
                    },
                    {
                        field: "missionStatement", title: $translate.instant('MYPROJECTS_MISSION'),
                        attributes: {
                            "class": "missionStatement"
                        },
                        template: '<div class="statement-cell"> {{dataItem.missionStatement}}</div>',
                        width: '150px'
                    },
                    {
                        field: "visionStatement", title: $translate.instant('MYPROJECTS_VISION'), attributes: {
                            "class": "visionStatement"
                        },
                        template: '<div class="statement-cell"> {{dataItem.visionStatement}}</div>',
                        width: '150px'
                    },
                    {
                        field: "goalStatement", title: $translate.instant('MYPROJECTS_GOALS'),
                        attributes: {
                            "class": "goalStatement"
                        }, template: function (dataItem) {
                            if (dataItem.goalStatement) {
                                return '<div class="statement-cell">' + dataItem.goalStatement.join(",") + '</div>';
                            }
                        },
                        width: '150px'
                    },
                    {
                        field: "stratagiesStatement", title: $translate.instant('MYPROJECTS_STRATEGIES'),
                        attributes: {
                            "class": "stratagiesStatement"
                        },
                        template: function (dataItem) {
                            if (dataItem.stratagiesStatement) {
                                return '<div class="statement-cell">' + dataItem.stratagiesStatement.join(",") + '</div>';
                            }
                        },
                        width: '150px'
                    },
                    {
                        field: "totalActiveProfiles", title: "# " + $translate.instant('MYPROJECTS_ACTIVE_PROFILES'), width: '200px'
                    },
                    {
                        field: "totalExpiredProfiles", title: "# " + $translate.instant('MYPROJECTS_EXPIRED_PROFILES'), width: '200px'
                    },
                    {
                        field: "totalCompletedProfiles", title: "# " + $translate.instant('MYPROJECTS_COMPLETED_PROFILES'), width: '200px'
                    },
                    {
                        field: "action", title: $translate.instant('COMMON_ACTIONS'), sortable: false, template: "<div class='icon-groups'>" +
                            "<a class='fa fa-eye' title='View Project'  ng-click='viewproject(dataItem.id)'></a>" +
                            "<a class='fa fa-pencil' title='Edit Project ' ng-show='isAllowEdit(dataItem.projectRoleId)' ng-click='editproject(dataItem.id)'></a>" +
                            "<a class='fa fa-info' title='Project Status' ng-show='isAllowEdit(dataItem.projectRoleId)' ng-click='projectStatus(dataItem.id)'></a>" +
                            "<a class='fa fa-list' title='View Project Profiles' ng-click='viewprojectprofiles(dataItem.id)'></a>" +
                            "</div>",
                        width: '150px'
                    }
                ]
            };
            $scope.tooltipOptions = $(".completed-projects-grid").kendoTooltip({
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

            $scope.editproject = function (id) {
                $location.path("/editproject/" + id);
            }
            $scope.projectStatus = function (id) {
                $location.path("/projectStatus/" + id);
            }
            $scope.viewproject = function (id) {
                $location.path("/viewproject/" + id);
            }

            $scope.viewprojectprofiles = function (projectId) {
                $location.path("/projectprofiles/" + projectId);
            }

            $scope.isAllowEdit = function (projectRoleId) {
                if (projectRoleId == projectRolesEnum.projectManager) {
                    return true;
                }
                else {
                    return false;
                }
            }
        }])
    .controller('pendingProjectsCtrl', ['cssInjector', '$scope', 'activeProjectsService', '$location', 'dialogService', 'projectRolesEnum', '$translate', 'globalVariables',
        function (cssInjector, $scope, activeProjectsService, $location, dialogService, projectRolesEnum, $translate, globalVariables) {
            cssInjector.removeAll();
            cssInjector.add('views/activeProjects/activeProjects.css');
            moment.locale(globalVariables.lang.currentUICulture);

            $scope.pendingProjectsOptions = {
                dataSource: {
                    type: "json",
                    transport: {
                        read: function (options) {
                            activeProjectsService.getPendingProjects().then(function (data) {
                                moment.locale(globalVariables.lang.currentUICulture);
                                _.each(data, function (item) {
                                    item.expectedStartDate = moment(kendo.parseDate(item.expectedStartDate)).format("L LT");
                                    item.expectedEndDate = moment(kendo.parseDate(item.expectedEndDate)).format("L LT");
                                })
                                options.success(data);
                            })
                        }
                    }
                },
                selectable: false,
                sortable: true,
                resizable: true,
                columns: [
                    { field: "name", title: $translate.instant('COMMON_NAME'), width: "200px", },
                    { field: "projectRoleName", title: $translate.instant('COMMON_ROLE') },
                    {
                        field: "expectedStartDate", title: $translate.instant('COMMON_START_DATE'),
                        width: "150px",
                        filterable: false, template: '<div>{{dataItem.expectedStartDate | date:"short"}}</div>'
                    },
                    {
                        field: "expectedEndDate", title: $translate.instant('COMMON_END_DATE'),
                        width: "150px",
                        filterable: false, template: '<div>{{dataItem.expectedEndDate | date:"short"}}</div>'
                    },
                    {
                        field: "missionStatement", title: $translate.instant('MYPROJECTS_MISSION'),
                        attributes: {
                            "class": "missionStatement"
                        },
                        width: "170px",
                        template: '<div class="statement-cell"> {{dataItem.missionStatement}}</div>'
                    },
                    {
                        field: "visionStatement", title: $translate.instant('MYPROJECTS_VISION'), attributes: {
                            "class": "visionStatement"
                        },
                        width: "170px",
                        template: '<div class="statement-cell"> {{dataItem.visionStatement}}</div>'
                    },
                    {
                        field: "goalStatement", title: $translate.instant('MYPROJECTS_GOALS'),
                        width: "150px",
                        attributes: {
                            "class": "goalStatement"
                        }, template: function (dataItem) {
                            if (dataItem.goalStatement) {
                                return '<div class="statement-cell">' + dataItem.goalStatement.join(",") + '</div>';
                            }
                        }
                    },
                    {
                        field: "stratagiesStatement", title: $translate.instant('MYPROJECTS_STRATEGIES'),
                        attributes: {
                            "class": "stratagiesStatement"
                        },
                        width: "150px",
                        template: function (dataItem) {
                            if (dataItem.stratagiesStatement) {
                                return '<div class="statement-cell">' + dataItem.stratagiesStatement.join(",") + '</div>';
                            }
                        }
                    },

                    {
                        field: "", title: $translate.instant('COMMON_ACTIONS'), width: "180px", template: "<div class='icon-groups'>" +
                            "<a class='fa fa-lg fa-info' title='Project Status' ng-show='isAllowEdit(dataItem.projectRoleId)' ng-click='projectStatus(dataItem.id)'></a>" +
                            "<a class='fa fa-lg fa-eye' title='View Project'  ng-click='viewproject(dataItem.id)'></a>" +
                            "<a class='fa fa-lg fa-pencil' title='Edit Project' ng-show='isAllowEdit(dataItem.projectRoleId)' ng-click='editproject(dataItem.id)'></a>" +
                            "<a class='fa fa-lg fa-list' title='View Project Profiles' ng-click='viewprojectprofiles(dataItem.id)'></a>" +
                            "<a class='fa fa-lg fa-trash' title='Delete Project' ng-show='isAllowEdit(dataItem.projectRoleId)' ng-click='deleteProject(dataItem.id)'></a>" +
                            "</div>"
                    }
                ]
            }
            $scope.tooltipOptions = $(".pending-projects-grid").kendoTooltip({
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

            $scope.viewproject = function (id) {
                $location.path("/viewproject/" + id);
            }
            $scope.projectStatus = function (id) {
                $location.path("/projectStatus/" + id);
            }
            $scope.editproject = function (id) {
                $location.path("/editproject/" + id);
            }
            $scope.viewprojectprofiles = function (projectId) {
                $location.path("/projectprofiles/" + projectId);
            }

            $scope.deleteProject = function (projectId) {
                activeProjectsService.isProjectInUse(projectId).then(function (data) {
                    if (data) {
                        dialogService.showNotification($translate.instant('MYPROJECTS_YOU_CAN_NOT_DELETE_PROJECT') + " " + $translate.instant('MYPROJECTS_THIS_PROJECT_IS_IN_USE'), 'warning');
                    }
                    else {
                        dialogService.showYesNoDialog($translate.instant('COMMON_CONFIRM'), $translate.instant('MYPROJECTS_ARE_YOU_SURE_YOU_WANT_TO_DELETE_PROJECT')).then(
                            function () {
                                activeProjectsService.removeProject(projectId).then(function (data) {
                                    if (data) {
                                        var grid = $(".pending-projects-grid").data("kendoGrid");
                                        if (grid) {
                                            grid.dataSource.read();
                                            grid.refresh();
                                        }
                                        dialogService.showNotification($translate.instant('MYPROJECTS_PROJECT_REMOVED_SUCCESFULLY'), 'info');
                                    }
                                });
                            },
                            function () {
                            });
                    }
                })
            }

            $scope.newProject = function () {
                $location.path("/newproject");
            }

            $scope.isAllowEdit = function (projectRoleId) {
                if (projectRoleId == projectRolesEnum.projectManager) {
                    return true;
                }
                else {
                    return false;
                }
            }
        }])
    .controller('expiredProjectsCtrl', ['cssInjector', '$scope', 'activeProjectsService', '$location', 'profilesTypesEnum', 'projectRolesEnum', '$translate', 'globalVariables',
        function (cssInjector, $scope, activeProjectsService, $location, profilesTypesEnum, projectRolesEnum, $translate, globalVariables) {
            cssInjector.removeAll();
            cssInjector.add('views/activeProjects/activeProjects.css');
            moment.locale(globalVariables.lang.currentUICulture);
            $scope.expiredProjectsOptions = {
                dataSource: {
                    type: "json",
                    transport: {
                        read: function (options) {
                            activeProjectsService.getExpiredProjects().then(function (data) {
                                moment.locale(globalVariables.lang.currentUICulture);
                                _.each(data, function (item) {
                                    item.expectedStartDate = moment(kendo.parseDate(item.expectedStartDate)).format("L LT");
                                    item.expectedEndDate = moment(kendo.parseDate(item.expectedEndDate)).format("L LT");
                                })
                                options.success(data);
                            })
                        }
                    }
                },
                selectable: false,
                sortable: true,
                resizable: true,
                columns: [
                    { field: "name", title: $translate.instant('COMMON_NAME'), width: '200px' },

                    { field: "projectRoleName", title: $translate.instant('COMMON_ROLE'), width: '200px' },
                    {
                        field: "expectedStartDate", title: $translate.instant('COMMON_START_DATE'), filterable: false, template: '<div>{{dataItem.expectedStartDate | date:"short"}}</div>',
                        width: '150px'
                    },
                    {
                        field: "expectedEndDate", title: $translate.instant('COMMON_END_DATE'), filterable: false, template: '<div>{{dataItem.expectedEndDate | date:"short"}}</div>',
                        width: '150px'
                    },
                    {
                        field: "missionStatement", title: $translate.instant('MYPROJECTS_MISSION'),
                        attributes: {
                            "class": "missionStatement"
                        },
                        template: '<div class="statement-cell"> {{dataItem.missionStatement}}</div>',
                        width: '150px'
                    },
                    {
                        field: "visionStatement", title: $translate.instant('MYPROJECTS_VISION'), width: '200px', attributes: {
                            "class": "visionStatement"
                        },
                        template: '<div class="statement-cell"> {{dataItem.visionStatement}}</div>'
                    },
                    {
                        field: "goalStatement", title: $translate.instant('MYPROJECTS_GOALS'), width: '250px',
                        attributes: {
                            "class": "goalStatement"
                        }, template: function (dataItem) {
                            if (dataItem.goalStatement) {
                                return '<div class="statement-cell">' + dataItem.goalStatement.join(",") + '</div>';
                            }
                        }
                    },
                    {
                        field: "stratagiesStatement", title: $translate.instant('MYPROJECTS_STRATEGIES'),
                        attributes: {
                            "class": "stratagiesStatement"
                        },
                        template: function (dataItem) {
                            if (dataItem.stratagiesStatement) {
                                return '<div class="statement-cell">' + dataItem.stratagiesStatement.join(",") + '</div>';
                            }
                        },
                        width: '200px'
                    },
                    {
                        field: "totalActiveProfiles", title: "# " + $translate.instant('MYPROJECTS_ACTIVE_PROFILES'), width: '200px'
                    },
                    {
                        field: "totalExpiredProfiles", title: "# " + $translate.instant('MYPROJECTS_EXPIRED_PROFILES'), width: '200px'
                    },
                    {
                        field: "totalCompletedProfiles", title: "# " + $translate.instant('MYPROJECTS_COMPLETED_PROFILES'), width: '200px'
                    },
                    {
                        field: "actions", title: $translate.instant('COMMON_ACTIONS'), sortable: false, template: "<div class='icon-groups'>" +
                            "<a class='fa fa-eye' title='View Project'  ng-click='viewproject(dataItem.id)'></a>" +
                            "<a class='fa fa-info' title='Project Status' ng-show='isAllowEdit(dataItem.projectRoleId)' ng-click='projectStatus(dataItem.id)'></a>" +
                            "<a class='fa fa-list' title='View Project Profiles' ng-click='viewprojectprofiles(dataItem.id)'></a>" +
                            "</div>",
                        width: '130px'
                    }
                ]
            }
            $scope.tooltipOptions = $(".expired-profiles-grid").kendoTooltip({
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

            $scope.projectStatus = function (id) {
                $location.path("/projectStatus/" + id);
            }
            $scope.viewproject = function (id) {
                $location.path("/viewproject/" + id);
            }

            $scope.viewprojectprofiles = function (projectId) {
                $location.path("/projectprofiles/" + projectId);
            }

            $scope.isAllowEdit = function (projectRoleId) {
                if (projectRoleId == projectRolesEnum.projectManager) {
                    return true;
                }
                else {
                    return false;
                }
            }
        }])
    .controller('historyProjectsCtrl', ['cssInjector', '$scope', 'activeProjectsService', '$location', 'dialogService', '$translate', 'globalVariables',
        function (cssInjector, $scope, activeProjectsService, $location, dialogService, $translate, globalVariables) {
            cssInjector.removeAll();
            cssInjector.add('views/activeProjects/activeProjects.css');
            moment.locale(globalVariables.lang.currentUICulture);

            var vm = this;
            $scope.historyOptions = {
                dataSource: {
                    type: "json",
                    transport: {
                        read: function (options) {
                            activeProjectsService.getHistoryProjects().then(function (data) {
                                moment.locale(globalVariables.lang.currentUICulture);
                                _.each(data, function (item) {
                                    item.expectedStartDate = moment(kendo.parseDate(item.expectedStartDate)).format("L LT");
                                    item.expectedEndDate = moment(kendo.parseDate(item.expectedEndDate)).format("L LT");
                                })
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
                    { field: "name", title: $translate.instant('COMMON_NAME'), width: '120px' },

                    { field: "projectRoleName", title: $translate.instant('COMMON_ROLE'), width: '120px' },
                    {
                        field: "expectedStartDate", title: $translate.instant('COMMON_START_DATE'), filterable: false, template: '<div>{{dataItem.expectedStartDate | date:"short"}}</div>', width: '150px'
                    },
                    { field: "expectedEndDate", title: $translate.instant('COMMON_END_DATE'), filterable: false, template: '<div>{{dataItem.expectedEndDate | date:"short"}}</div>', width: '150px' },
                    {
                        field: "missionStatement", title: $translate.instant('MYPROJECTS_MISSION'),
                        attributes: {
                            "class": "missionStatement"
                        },
                        template: '<div class="statement-cell"> {{dataItem.missionStatement}}</div>',
                        width: '120px'
                    },
                    {
                        field: "visionStatement", title: $translate.instant('MYPROJECTS_VISION'), attributes: {
                            "class": "visionStatement"
                        },
                        template: '<div class="statement-cell"> {{dataItem.visionStatement}}</div>',
                        width: '120px'
                    },
                    {
                        field: "goalStatement", title: $translate.instant('MYPROJECTS_GOALS'),
                        attributes: {
                            "class": "goalStatement"
                        }, template: function (dataItem) {
                            if (dataItem.goalStatement) {
                                return '<div class="statement-cell">' + dataItem.goalStatement.join(",") + '</div>';
                            }
                        },
                        width: '120px'
                    },
                    {
                        field: "stratagiesStatement", title: $translate.instant('MYPROJECTS_STRATEGIES'),
                        attributes: {
                            "class": "stratagiesStatement"
                        },
                        template: function (dataItem) {
                            if (dataItem.stratagiesStatement) {
                                return '<div class="statement-cell">' + dataItem.stratagiesStatement.join(",") + '</div>';
                            }
                        },
                        width: '150px'
                    },
                    {
                        field: "totalActiveProfiles", title: "# " + $translate.instant('MYPROJECTS_ACTIVE_PROFILES'),
                        width: '200px'
                    },
                    {
                        field: "totalExpiredProfiles", title: "# " + $translate.instant('MYPROJECTS_EXPIRED_PROFILES'), width: '200px'
                    },
                    {
                        field: "totalCompletedProfiles", title: "# " + $translate.instant('MYPROJECTS_COMPLETED_PROFILES'), width: '200px'
                    },
                    {
                        field: "action", title: $translate.instant('COMMON_ACTIONS'), sortable: false, template: "<div class='icon-groups'>" +
                            "<a class='fa fa-eye' title='View Project'  ng-click='viewproject(dataItem.id)'></a>" +
                            "<a class='fa fa-info' title='Project Status' ng-show='isAllowEdit(dataItem.projectRoleId)' ng-click='projectStatus(dataItem.id)'></a>" +
                            "<a class='fa fa-list' title='View Project Profiles' ng-click='viewprojectprofiles(dataItem.id)'></a>" +
                            "</div>",
                        width: '150px'
                    }
                ]
            }
            $scope.tooltipOptions = $(".project-history-grid").kendoTooltip({
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

            $scope.projectStatus = function (id) {
                $location.path("/projectStatus/" + id);
            }
            $scope.viewproject = function (id) {
                $location.path("/viewproject/" + id);
            }

            $scope.viewprojectprofiles = function (projectId) {
                $location.path("/projectprofiles/" + projectId);
            }

            $scope.isAllowEdit = function (projectRoleId) {
                if (projectRoleId == projectRolesEnum.projectManager) {
                    return true;
                }
                else {
                    return false;
                }
            }


        }])
    ;