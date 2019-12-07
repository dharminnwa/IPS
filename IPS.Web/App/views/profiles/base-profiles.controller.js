'use strict';

angular.module('ips.profiles')
    .controller('ProfilesCtrl', ['$scope', '$location', 'authService', 'apiService', '$window', '$rootScope', 'cssInjector', 'profilesService', 'localStorageService',
        '$stateParams', '$state', 'organizations', 'industries', 'dialogService', 'levels', 'performanceGroups', 'pageName', '$translate',
        function ($scope, $location, authService, apiService, $window, $rootScope, cssInjector, profilesService, localStorageService,
            $stateParams, $state, organizations, industries, dialogService, levels, performanceGroups, pageName, $translate) {
            cssInjector.removeAll();
            cssInjector.add('views/profiles/profiles.css');

            $scope.organizations = organizations;
            $scope.industries = industries;
            $scope.levels = levels;
            $scope.performanceGroups = performanceGroups;
            $scope.pageName = pageName;

            $scope.defaultProjectId = null;
            $scope.projectInfo = null;
            if (localStorageService.get("projectId")) {
                $scope.defaultProjectId = localStorageService.get("projectId");
                profilesService.getProjectById($scope.defaultProjectId).then(function (data) {
                    $scope.projectInfo = data;
                });

            }

            $scope.questionDisplayRule = [
                {
                    id: 1,
                    name: $translate.instant('SOFTPROFILE_PERFORMANCE_GROUP_PER_STEP')
                },
                {
                    id: 2,
                    name: $translate.instant('SOFTPROFILE_QUESTION_PER_STEP')
                },
                {
                    id: 3,
                    name: $translate.instant('SOFTPROFILE_ALL_QUESTIONS_ON_THE_SINGLE_PAGE')
                }
            ];

            $scope.filter = {
                organizations: {},
                organization: {},
                isShowActive: false,
                isTemplate: false,
                levelId: null,
                performanceGroupName: 'Select Performance Group...',
                organizationId: null,
                industryId: null
            };

            $scope.editProfile = function (id, index) {
                $location.path($location.path() + '/edit/' + id);
            };
            $scope.isAllowEdit = function () {
                return authService.hasPermition(authService.authentication.user.organizationId, 'Profiles', "IsUpdate");
            };
            $scope.isAllowDelete = function () {
                return authService.hasPermition(authService.authentication.user.organizationId, 'Profiles', "IsDelete");
            };

            $scope.viewProfile = function (id, index) {
                $location.path($location.path() + '/view/' + id);
            };
            $scope.deleteItemData = function (id, index) {
                profilesService.isProfileInUse(id).then(function (result) {
                    if (result == true) {
                        dialogService.showNotification($translate.instant('SOFTPROFILE_PROFILE_CANNOT_BE_REMOVED') + ' ' + $translate.instant('SOFTPROFILE_THIS_PROFILE_IS_IN_USE'), 'warning');
                    }
                    else {
                        dialogService.showYesNoDialog($translate.instant('COMMON_CONFIRM'), $translate.instant('COMMON_ARE_YOU_SURE_YOU_WANT_TO_DELETE')).then(
                            function () {
                                profilesService.remove(id, index);
                                dialogService.showNotification($translate.instant('SOFTPROFILE_PROFILE_REMOVED_SUCCESFULLY'), 'info');
                            },
                            function () {
                            });
                    }
                });
            };

            $scope.deleteProfile = function () {
                profilesService.remove($scope.deleteItem.id, $scope.deleteItem.index);
            };

            $scope.add = function () {
                $location.path($location.path() + '/edit/0');
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

            $scope.gridOptions = {
                dataSource: profilesService.dataSource(),
                dataBound: $scope.onUserAssignGridDataBound,
                columns: [
                    { field: "name", title: $translate.instant('COMMON_NAME'), width: "150px" },
                    { field: "description", title: $translate.instant('COMMON_DESCRIPTION'), width: "200px" },
                    {
                        field: "organizationName", title: $translate.instant('COMMON_ORGANIZATION'), width: "200px", template: function (dataItem) {
                            dataItem.organizationName = "";
                            if (dataItem.organization) {
                                dataItem.organizationName = dataItem.organization.name;
                            }
                            return "<div>" + dataItem.organizationName + "</div>";
                        },
                    },
                    { field: "industryId", title: $translate.instant('COMMON_INDUSTRY'), width: "150px", values: $scope.industries },
                    {
                        field: "jobPositions", title: $translate.instant('SOFTPROFILE_TARGET_AUDIENCE'), width: "200px",
                        template: function (dataItem) {
                            return "<div ng-repeat='ta in dataItem.jobPositions'>{{ta.jobPosition1}}</div>";
                        },
                    },
                    {
                        field: "isActive", title: $translate.instant('COMMON_IS_ACTIVE'), width: '150px', sortable: {
                            compare: function (a, b) {
                                var a1 = a.isSurveyPassed ? 1 : 0;
                                var b1 = b.isSurveyPassed ? 1 : 0;
                                return a1 > b1 ? 1 : (a1 < b1 ? -1 : 0);
                            }
                        }, template: "<input type='checkbox' #= isActive ? checked='checked' : '' # disabled='disabled' />"
                    },
                    {
                        field: "isTemplate",
                        title: $translate.instant('COMMON_IS_TEMPLATE'),
                        width: '150px',
                        sortable: {
                            compare: function (a, b) {
                                var a1 = a.isSurveyPassed ? 1 : 0;
                                var b1 = b.isSurveyPassed ? 1 : 0;
                                return a1 > b1 ? 1 : (a1 < b1 ? -1 : 0);
                            }
                        },
                        template: "<input type='checkbox' #= isTemplate ? checked='checked' : '' # disabled='disabled' />"
                    },
                    {
                        field: "actions", title: $translate.instant('COMMON_ACTIONS'), width: "160px", filterable: false, sortable: false,
                        template: function (dataItem) {
                            return "<div class='icon-groups'>" +
                                "<a title='Edit Profile' class='fa fa-lg fa-edit' ng-show='isAllowEdit()' ng-click='editProfile(" + dataItem.id + ", " + profilesService.list().indexOf(dataItem) + ")'></a>" +
                                "<a title='View Profile' class='fa fa-lg fa-eye' ng-click='viewProfile(" + dataItem.id + ", " + profilesService.list().indexOf(dataItem) + ")'></a>" +
                                "<a title='Clone Profile' class='fa fa-lg fa-copy' ng-click='cloneProfile(" + dataItem.id + ", " + profilesService.list().indexOf(dataItem) + ")'></a> " +
                                "<a title='Delete Profile' class='fa fa-lg fa-trash' ng-show='isAllowDelete()' ng-click='deleteItemData(" + dataItem.id + ", " + profilesService.list().indexOf(dataItem) + "); removal.open().center();'></a></div>";
                        }
                    }
                ],
                sortable: true,
                resizable: true,
                columnMenu: false,
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

            $scope.cloneProfile = function (id, index) {
                if ($scope.defaultProjectId > 0) {
                    dialogService.showYesNoDialog($translate.instant('COMMON_CONFIRM'), $translate.instant('SOFTPROFILE_IT_WILL_BE_CLONED_UNDER_YOUR_PROJECT') + " " + $scope.projectInfo.name + "', " + $translate.instant('SOFTPROFILE_ARE_YOU_SURE_WANT_TO_CLONE')).then(function () {
                        apiService.add("profiles/clone/" + id + "/" + $scope.defaultProjectId, null).then(function (data) {
                            //$scope.doFilter();
                            dialogService.showNotification($translate.instant('SOFTPROFILE_PROFILE_CLONED_SUCCESSFULLY'), 'info');
                            if ($scope.defaultProjectId > 0) {
                                localStorageService.set("projectId", null);
                                $location.path("/projectprofiles/" + $scope.defaultProjectId);
                            }
                        }, function (message) {
                            dialogService.showNotification(message, 'warning');
                        });
                    })
                } else {
                    apiService.add("profiles/clone/" + id + "/" + $scope.defaultProjectId, null).then(function (data) {
                        $scope.doFilter();
                        dialogService.showNotification($translate.instant('SOFTPROFILE_PROFILE_CLONED_SUCCESSFULLY'), 'info');

                    }, function (message) {
                        dialogService.showNotification(message, 'warning');
                    });
                }
            }

            $scope.doFilter = function () {

                var query = "";

                if ($scope.filter.organizationId > 0) {
                    query += "and(OrganizationId eq " + $scope.filter.organizationId + ")";
                }

                if ($scope.filter.industryId) {
                    query += "and(IndustryId eq " + $scope.filter.industryId + ")";
                }

                if ($scope.filter.levelId > 0) {
                    query += "and(LevelId eq " + $scope.filter.levelId + ")";
                }

                if ($scope.filter.isTemplate) {
                    query += "and(IsTemplate eq " + $scope.filter.isTemplate + ")";
                }

                if ($scope.filter.isShowActive) {
                    query += "and(IsActive eq " + $scope.filter.isShowActive + ")";
                }

                if ($scope.filter.performanceGroupName != 'Select Performance Group...') {
                    query += "and(PerformanceGroups/any(j:j/Name eq '" + $scope.filter.performanceGroupName + "'))";
                }

                profilesService.reload($scope.profileTypeId, query);
            };

            profilesService.reload($scope.profileTypeId, "");

            $scope.doSearch = function (searchText) {
                if (!$scope.gridInstance) {
                    $scope.gridInstance = $("#profilesGrid").data("kendoGrid");
                }
                $scope.gridInstance.dataSource.filter([
                    {
                        logic: "or",
                        filters: [
                            {
                                field: "name",
                                operator: "contains",
                                value: searchText
                            },
                            {
                                field: "description",
                                operator: "contains",
                                value: searchText
                            }
                            ,
                            {
                                field: "organizationName",
                                operator: "contains",
                                value: searchText
                            },
                            {
                                field: "industryName",
                                operator: "contains",
                                value: searchText
                            }
                        ]
                    }]);
            };

            $scope.$on("kendoRendered", function (event) {
                if (event.targetScope.profilesGrid) {
                    $scope.gridInstance = event.targetScope.profilesGrid;
                }
                $(".popovers").popover();
            });

        }]);