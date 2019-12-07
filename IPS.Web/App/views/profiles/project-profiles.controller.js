'use strict';

angular.module('ips.profiles')
    .config(['$stateProvider', '$urlRouterProvider', 'profilesTypesEnum', function ($stateProvider, $urlRouterProvider, profilesTypesEnum) {
        $stateProvider
            .state('projectprofiles', {
                url: "/projectprofiles/:projectId",
                templateUrl: "views/profiles/projectprofiles.html",
                resolve: {
                    project: function ($stateParams, profilesService) {
                        if ($stateParams.projectId > 0) {
                            return profilesService.getProjectById($stateParams.projectId).then(function (data) {
                                data.expectedEndDate = moment(kendo.parseDate(data.expectedEndDate)).format('L LT')
                                data.expectedStartDate = moment(kendo.parseDate(data.expectedStartDate)).format('L LT')
                                return data;
                            });
                        }
                        else {
                            var today = new Date(moment({ hour: 0, minute: 0, seconds: 0, milliseconds: 0 })._d)
                            return {
                                name: "",
                                summary: "",
                                expectedEndDate: moment(today).add("months", 3).format('L LT'),
                                expectedStartDate: moment(today).format('L LT'),
                                missionStatement: "",
                                visionStatement: "",
                                projectSteeringGroups: [],
                                goalStrategies: [],
                                projectGoals: [],
                                projectUsers: [],
                            }
                        }
                    },
                    profiles: function ($stateParams, profilesService) {
                        return profilesService.getProjectProfiles($stateParams.projectId).then(function (data) {
                            return data;
                        })
                    },
                    pageName: function (project, $translate) {
                        return project.name + ': ' + $translate.instant('MYPROJECTS_PROJECTPROFILES_PROJECT_PROFILES');
                    },
                    organizations: function ($stateParams, profilesService) {
                        return profilesService.getOrganizations();
                    },
                    industries: function ($stateParams, profilesService) {
                        return profilesService.getIndustries();
                    },
                    levels: function ($stateParams, profilesService) {
                        return profilesService.getProfileLevels();
                    },
                    measureUnits: function () {
                        return [];
                    }
                },
                controller: 'ProjectProfilesCtrl',
                data: {
                    displayName: '{{pageName}}',
                    paneLimit: 1,
                    depth: 2
                }
            });
    }])
    .controller('ProjectProfilesCtrl', ['$scope', '$location', 'authService', 'apiService', '$window', '$rootScope', 'cssInjector', 'profilesService',
        '$stateParams', '$state', 'dialogService', 'pageName', 'profiles', 'organizations', 'industries', 'levels', 'measureUnits', 'localStorageService', 'project', 'projectPhasesEnum', 'phasesLevelEnum', 'projectRolesEnum', '$translate',
        function ($scope, $location, authService, apiService, $window, $rootScope, cssInjector, profilesService,
            $stateParams, $state, dialogService, pageName, profiles, organizations, industries, levels, measureUnits, localStorageService, project, projectPhasesEnum, phasesLevelEnum, projectRolesEnum, $translate) {
            cssInjector.removeAll();
            //cssInjector.add('css/components.min.css');
            //cssInjector.add('css/default.min.css');
            cssInjector.add('views/softprofilewizard/softprofilewizard.css');
            $scope.organizations = organizations;
            $scope.industries = industries;
            $scope.levels = levels;
            $scope.projectId = $stateParams.projectId;
            $scope.projectPhasesEnum = projectPhasesEnum;
            $scope.phasesLevelEnum = phasesLevelEnum;
            $scope.gridOptions = {
                dataSource: profilesService.projectProfilesDataSource(),
                dataBound: $scope.onUserAssignGridDataBound,
                columns: [
                    { field: "name", title: $translate.instant('COMMON_NAME') },

                    {
                        field: "profileTypeId", title: $translate.instant('COMMON_TYPE'), filterable: false, template: function (dataItem) {
                            return dataItem.profileType.name;
                        }
                    },
                    { field: "description", title: $translate.instant('COMMON_DESCRIPTION') },

                    //{
                    //    field: "organizationName", title: "Organization", width: "10%", template: function (dataItem) {
                    //        dataItem.organizationName = "";
                    //        if (dataItem.organization) {
                    //            dataItem.organizationName = dataItem.organization.name;
                    //        }
                    //        return "<div>" + dataItem.organizationName + "</div>";
                    //    },
                    //},
                    { field: "industryId", title: $translate.instant('COMMON_INDUSTRY'), filterable: false, values: $scope.industries },
                    {
                        field: "jobPositions", title: $translate.instant('MYPROJECTS_TARGET_AUDIENCE'), filterable: false,
                        template: function (dataItem) {
                            return "<div ng-repeat='ta in dataItem.jobPositions'>{{ta.jobPosition1}}</div>";
                        },
                    },
                     {
                         field: "measureUnitId", title: $translate.instant('MYPROJECTS_MEASURE_UNIT'), filterable: false, template: function (dataItem) {
                             return dataItem.measureUnit ? dataItem.measureUnit.name : "";
                         },
                     },
                     {
                         field: "id", title: $translate.instant('COMMON_START_DATE'), filterable: false, template: function (dataItem) {
                             return moment(kendo.parseDate(dataItem.project.expectedStartDate)).format('L LT');
                         }
                     },
                       {
                           field: "id", title: $translate.instant('COMMON_END_DATE'), filterable: false, template: function (dataItem) {
                               return moment(kendo.parseDate(dataItem.project.expectedEndDate)).format('L LT');
                           }
                       },
                    {
                        field: "kpiWeak", title: "# " + $translate.instant('MYPROJECTS_WEAK_KPIS')
                    },
                    {
                        field: "kpiStrong", title: "# " + $translate.instant('MYPROJECTS_STRONG_KPIS')
                    },
                    {
                        field: "createdOn", title: $translate.instant('MYPROJECTS_CREATED_ON'), filterable: false, template: function (dataItem) {
                            if (dataItem.createdOn) {
                                return moment(kendo.parseDate(dataItem.createdOn)).format('L LT') + '<span class="label label-sm label-success label-mini"> ' + dataItem.createdByUser.firstName + ' ' + dataItem.createdByUser.lastName + ' </span>';
                            }
                            else {
                                return "";
                            }
                        }
                    },
                    {
                        field: "modifiedOn", title: $translate.instant('MYPROJECTS_MODIFIED_ON'), filterable: false, template: function (dataItem) {
                            if (dataItem.modifiedOn) {
                                return moment(kendo.parseDate(dataItem.modifiedOn)).format('L LT') + '<span class="label label-sm label-success label-mini"> ' + dataItem.modifiedByUser.firstName + ' ' + dataItem.modifiedByUser.lastName + ' </span>';
                            } else {
                                return "";
                            }
                        }
                    },
                    {
                        field: "isActive", title: $translate.instant('COMMON_STATUS'), filterable: false, template: function (dataItem) {
                            if (dataItem.isActive) {
                                return "Active"
                            }
                            else {
                                return "Inactive"
                            }
                        }
                    },
                    {
                        field: "id", title: $translate.instant('COMMON_ACTION'), filterable: false,
                        template: function (dataItem) {
                            return "<span title='View Profile' class='btn-xs fa fa-eye'  ng-click='viewProfile(" + dataItem.id + ")'></span> "+
                                   "<span title='Edit Profile' class='btn-xs fa fa-edit' ng-show='isAllowEdit()' ng-click='editProfile(" + dataItem.id + ")'></span>" +
                                   "<span title='Delete Profile' class='btn-xs fa fa-trash'  ng-show='isAllowEdit()' ng-click='deleteProfile(" + dataItem.id + ")'></span>" +
                                   "<span title='{{activeProfileTitle(" + dataItem.isActive + ")}}'  ng-show='isAllowEdit()' class='btn-xs fa ' ng-class='activeProfileClass(" + dataItem.isActive + ")' ng-click='changeProfileStatus(" + dataItem.id + ")'></span>";

                        },
                    },
                ],
                sortable: true,
                resizable: true,
                //columnMenu: true,
                filterable: true,
                pageable: true
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
            $scope.onUserAssignGridDataBound = function (e) {
                var grid = e.sender;
                if (grid.dataSource.total() == 0) {
                    var colCount = grid.columns.length;
                    $(e.sender.wrapper)
                        .find('tbody')
                        .append('<tr class="kendo-data-row"><td colspan="' + colCount + '" class="no-data">There is no data to show in the grid.</td></tr>');
                }
                //kendo.ui.progress($(".ips-profiles-content"), false);
            };
            $scope.activeProfileTitle = function (isActive) {
                if (isActive) {
                    return "Deactivate Profile";
                }
                else {
                    return "Activate Profile";
                }
            }
            $scope.activeProfileClass = function (isActive) {
                if (isActive) {
                    return "fa-unlock";
                }
                else {
                    return "fa-lock";

                }
            }
            $scope.changeProfileStatus = function (profileId) {

                profilesService.isProfileInUse(profileId).then(function (result) {
                    if (result == true) {
                        dialogService.showNotification($translate.instant('MYPROJECTS_PROJECTPROFILES_YOU_CAN_NOT_CHANGE_STATUS') + " " + $translate.instant('MYPROJECTS_PROJECTPROFILES_THIS_PROFILE_IS_IN_USE'), 'warning');
                    }
                    else {
                        dialogService.showYesNoDialog($translate.instant('COMMON_CONFIRM'), $translate.instant('MYPROJECTS_PROJECTPROFILES_ARE_YOU_SURE_YOU_WANT_TO_CHANGE_PROFILE_STATUS')).then(
                           function () {
                               profilesService.changeProfileStatus(profileId).then(function (data) {
                                   if (data) {
                                       profilesService.reloadProjectProfile($scope.projectId);
                                       dialogService.showNotification($translate.instant('MYPROJECTS_PROJECTPROFILES_PROFILE_STATUS_CHANGED_SUCCESFULLY'), 'info');
                                   }
                               });
                           },
                           function () {
                           });

                    }
                })





            }
            var authData = localStorageService.get('authorizationData');
            $scope.currentUser = authData.user;
            $scope.newProfile = function () {
                localStorageService.set("projectId", parseInt($stateParams.projectId));
                $location.path("/newprofile");

            }
            $scope.editProfile = function (id) {
                $location.path("/profile/" + id);
            }

            $scope.viewProfile = function (id) {
                $location.path("/viewprofile/" + id);
            }

            $scope.deleteProfile = function (id) {
                profilesService.isProfileInUse(id).then(function (result) {
                    if (result == true) {
                        dialogService.showNotification($translate.instant('MYPROJECTS_PROJECTPROFILES_PROFILE_CANNOT_BE_REMOVED') + " " + $translate.instant('MYPROJECTS_PROJECTPROFILES_THIS_PROFILE_IS_IN_USE'), 'warning');
                    }
                    else {
                        dialogService.showYesNoDialog($translate.instant('COMMON_CONFIRM'), $translate.instant('COMMON_ARE_YOU_SURE_YOU_WANT_TO_DELETE')).then(
                            function () {

                                var index = _.findIndex(profiles, {
                                    id: id
                                });
                                profilesService.removeProjectProfile(id, index);
                                dialogService.showNotification($translate.instant('MYPROJECTS_PROJECTPROFILES_PROFILE_REMOVED_SUCCESFULLY'), 'info');
                            },
                            function () {
                            });
                    }
                });
            };

            $scope.isAllowEdit = function () {
                var result = false;
                if ($scope.currentUser.userId) {
                    _.each(project.projectSteeringGroups, function (groupItem) {
                        if (groupItem.users.length > 0) {
                            _.each(groupItem.users, function (userItem) {
                                if(userItem.userId == $scope.currentUser.userId)
                                {
                                    if (userItem.roleId == projectRolesEnum.projectManager) {
                                        result = true;
                                        return (false)
                                    }
                                }
                            })
                          
                        }
                    })
                }
                return result;
            }
        }]);
