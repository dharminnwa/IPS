'use strict';

angular.module('ips.performanceGroups')

    .config(['$stateProvider', '$urlRouterProvider', 'profilesTypesEnum', function ($stateProvider, $urlRouterProvider, profilesTypesEnum) {
        var statePerformanceGroupsResolve = {
            pageName: function ($translate) {
                return $translate.instant('COMMON_PERFORMANCE_GROUPS');
            },
            profileTypeId: function () {
                return profilesTypesEnum.soft;
            },
            loadQuery: function () {
                return '&$filter=IsTemplate eq true';
            },
            performanceGroups: function ($stateParams, performanceGroupsService, profileTypeId) {
                return performanceGroupsService.load('&$filter=IsTemplate eq true', profileTypeId);
            },
            performanceGroupsFilter: function ($stateParams, performanceGroupsService, profileTypeId) {
                return performanceGroupsService.getAllPerformanceGroups('&$filter=IsTemplate eq true', profileTypeId);
            },
            isProfileInUse: function ($stateParams, profilesService) {
                return false;
            },
            organizations: function ($stateParams, performanceGroupsService) {
                return performanceGroupsService.getOrganizations();
            },
            industries: function ($stateParams, performanceGroupsService) {
                return performanceGroupsService.getIndustries();
            },
            skills: function ($stateParams, performanceGroupsService, profileTypeId) {
                return performanceGroupsService.getSkills(profileTypeId);
            },
            levels: function ($stateParams, performanceGroupsService) {
                return performanceGroupsService.getProfileLevels();
            },
            hideFilter: function () {
                return false;
            }
        };
        var stateEditPerformanceGroupResolve = {
            pageName: function ($translate) {
                return $translate.instant('COMMON_PERFORMANCE_GROUPS');
            },
            profileTypeId: function () {
                return profilesTypesEnum.soft;
            },
            loadQuery: function ($stateParams) {
                return "&$filter=ProfileId eq " + $stateParams.profileId;
            },
            performanceGroups: function ($stateParams, performanceGroupsService, profileTypeId) {
                return performanceGroupsService.load("&$filter=ProfileId eq " + $stateParams.profileId);
            },
            performanceGroupsFilter: function ($stateParams, performanceGroupsService, profileTypeId) {
                return performanceGroupsService.getAllPerformanceGroups("&$filter=ProfileId eq " + $stateParams.profileId);
            },
            isProfileInUse: function ($stateParams, profilesService) {
                return profilesService.isProfileInUse($stateParams.profileId);
            },
            organizations: function () {
                return [];
            },
            industries: function () {
                return [];
            },
            skills: function () {
                return [];
            },
            levels: function () {
                return [];
            },
            hideFilter: function () {
                return true;
            }
        };
        var stateKTPerformanceGroupsResolve = angular.copy(statePerformanceGroupsResolve);
        stateKTPerformanceGroupsResolve.profileTypeId = function () {
            return profilesTypesEnum.knowledgetest;
        };
        var stateKTEditPerformanceGroupsResolve = angular.copy(stateEditPerformanceGroupResolve);
        stateKTEditPerformanceGroupsResolve.profileTypeId = function () {
            return profilesTypesEnum.knowledgetest;
        };

        $stateProvider
            .state('home.profiles.soft.performanceGroups', {
                url: "/performanceGroups",
                templateUrl: "views/performanceGroups/performanceGroups.html",
                controller: "PerformanceGroupsCtrl",
                resolve: statePerformanceGroupsResolve,
                data: {
                    displayName: '{{pageName}}',//'Performance Groups',
                    paneLimit: 1,
                    depth: 3,
                    resource: "Profiles"
                }
            })
            .state('home.profiles.soft.edit.performanceGroups', {
                url: "/performanceGroups/:organizationId",
                templateUrl: "views/performanceGroups/performanceGroups.html",
                controller: "PerformanceGroupsCtrl",
                resolve: stateEditPerformanceGroupResolve,
                data: {
                    displayName: '{{pageName}}',//'Performance Groups',
                    paneLimit: 1,
                    depth: 4,
                    resource: "Profiles"
                }
            })
            .state('home.profiles.knowledgetest.performanceGroups', {
                url: "/performanceGroups",
                templateUrl: "views/performanceGroups/performanceGroups.html",
                controller: "PerformanceGroupsCtrl",
                resolve: stateKTPerformanceGroupsResolve,
                data: {
                    displayName: '{{pageName}}',//'Performance Groups',
                    paneLimit: 1,
                    depth: 3,
                    resource: "Profiles"
                }
            })
            .state('home.profiles.knowledgetest.edit.performanceGroups', {
                url: "/performanceGroups/:organizationId",
                templateUrl: "views/performanceGroups/performanceGroups.html",
                controller: "PerformanceGroupsCtrl",
                resolve: stateKTEditPerformanceGroupsResolve,
                data: {
                    displayName: '{{pageName}}',//'Performance Groups',
                    paneLimit: 1,
                    depth: 4,
                    resource: "Profiles"
                }
            })
    }])

    .controller('PerformanceGroupsCtrl', ['$scope', '$location', 'authService', 'profilesService', 'apiService', '$window',
        '$rootScope', 'cssInjector', 'performanceGroupsService', '$stateParams', '$state', 'dialogService',
        'performanceGroups', 'performanceGroupsFilter', 'isProfileInUse', 'loadQuery', 'organizations', 'industries', 'skills', 'levels', 'hideFilter', 'profileTypeId', '$translate',
        function ($scope, $location, authService, profilesService, apiService, $window, $rootScope, cssInjector,
            performanceGroupsService, $stateParams, $state, dialogService, performanceGroups, performanceGroupsFilter, isProfileInUse,
            loadQuery, organizations, industries, skills, levels, hideFilter, profileTypeId, $translate) {
            cssInjector.add('views/performanceGroups/performanceGroups.css');
            cssInjector.add('/Content/select2/css/select2.min.css');
            $scope.authService = authService;
            function isDisabled(organizationId, action) {
                if ($scope['Performance Groups' + organizationId + action] == undefined) {
                    $scope['Performance Groups' + organizationId + action] = !authService.hasPermition(organizationId, 'Performance Groups', action);
                }
                return $scope['Performance Groups' + organizationId + action];
            }

            $scope.isDisabled = isDisabled;

            $scope.private = {
                getById: function (id, myArray) {
                    if (myArray.filter) {
                        return myArray.filter(function (obj) {
                            if (obj.id == id) {
                                return obj
                            }
                        })[0]
                    }
                    return undefined;
                },
                processTable: function (data, idField, foreignKey, rootLevel) {
                    var hash = {};

                    for (var i = 0; i < data.length; i++) {
                        var item = data[i];
                        item.text = item.name;
                        var id = item[idField];
                        var parentId = item[foreignKey];

                        hash[id] = hash[id] || [];
                        hash[parentId] = hash[parentId] || [];

                        item.items = hash[id];
                        hash[parentId].push(item);
                    }
                    return hash[rootLevel];
                }
            }
            $scope.pgInit = function () {
                $('[id=ddlSkills]').select2();
                $('[id=ddlTargetGroup]').select2();
            }

            skills.push({ id: null, name: $translate.instant('SOFTPROFILE_SELECT_SKILL'), parentId: "0" });

            $scope.treeSkillsData = new kendo.data.HierarchicalDataSource({
                data: $scope.private.processTable(skills, "id", "parentId", 0)
            });

            $scope.skillsFlatList = profilesService.flattenSkillsList(skills);

            $scope.skillSelected = function (item) {
                $scope.filter.skillId = item.id;
                $scope.doFilter();
            }

            profilesService.jobPositionList().then(function (data) {
                $scope.selectJobPositionsOptions = data;
            });
            

            //$scope.selectJobPositionsOptions = {
            //    placeholder: "Select Target Audience...",
            //    dataTextField: "jobPosition1",
            //    dataValueField: "id",
            //    valuePrimitive: false,
            //    autoBind: false,
            //    dataSource: {
            //        type: "json",
            //        transport: {
            //            read: function (options) {
            //                apiService.getAll("JobTitles?$select=Id,JobPosition1&$orderby=JobPosition1").then(function (data) {
            //                    options.success(data);
            //                })
            //            }
            //        }
            //    }
            //};

            if (organizations) {
                $scope.organizations = organizations.sort(sortByName);
            } else {
                $scope.organizations = []
            }
            if (industries) {
                $scope.industries = industries;
            } else {
                $scope.industries = []
            }
            if (levels) {
                $scope.levels = levels;
            } else {
                $scope.levels = []
            }

            function sortByName(a, b) {
                var aName = a.name.toLowerCase();
                var bName = b.name.toLowerCase();
                return ((aName < bName) ? -1 : ((aName > bName) ? 1 : 0));
            }

            $scope.profileId = $stateParams.profileId;
            $scope.hideFilter = hideFilter;

            $scope.performanceGroups = performanceGroups;

            $scope.performanceGroupsFilter = performanceGroupsFilter;

            $scope.edit = function (id, index) {
                $location.path($location.path() + '/edit/' + id);
            };

            $scope.delete = function (id) {

                dialogService.showYesNoDialog($translate.instant('COMMON_CONFIRM'), $translate.instant('COMMON_ARE_YOU_SURE_YOU_WANT_TO_DELETE')).then(
                    function () {
                        var item = $scope.private.getById(id, $scope.performanceGroups);
                        var index = $scope.performanceGroups.indexOf(item);
                        apiService.remove("Performance_groups", id).then(function (data) {
                            if (data) {
                                performanceGroupsService.remove(index);
                                profilesService.updateTree();
                            }
                        }, function (message) {
                            dialogService.showNotification(message, 'warning');
                        });
                    },
                    function () {
                        //alert('No clicked');
                    });
            }

            $scope.add = function () {
                $location.path($location.path() + '/edit/0');
            };

            $scope.clone = function (id) {
                performanceGroupsService.clone(id).then(function (data) {
                    ($scope.hideFilter) ? performanceGroupsService.load("&$filter=ProfileId eq " + $stateParams.profileId) : $scope.doFilter();
                },
                    function (data) {
                        console.log(data);
                    })
            }

            $scope.onUserAssignGridDataBound = function (e) {
                var grid = e.sender;
                if (grid.dataSource.total() == 0) {
                    var colCount = grid.columns.length;
                    $(e.sender.wrapper)
                        .find('tbody')
                        .append('<tr class="kendo-data-row"><td colspan="' + colCount + '" class="no-data">There is no data to show in the grid.</td></tr>');
                }

            };

            function displayOrderUpdate(pgId) {
                var seqNo = $('.order' + pgId)[0].value;
                performanceGroupsService.updatePerformanceGroupOrder(pgId, seqNo);
                var item = $scope.private.getById(pgId, $scope.performanceGroups);
                item.seqNo = seqNo;
                //var grid = $("#pgGrid").data("kendoGrid");
                //grid.dataSource.sort({ field: "seqNo", dir: "asc" });
            }

            $scope.displayOrderUpdate = displayOrderUpdate;

            $scope.gridOptions = {
                dataSource: performanceGroupsService.dataSource(),
                dataBound: $scope.onUserAssignGridDataBound,
                detailInit: detailInit,
                columns: [
                    { field: "name", title: $translate.instant('COMMON_PERFORMANCE_GROUP'), width: "200px" },
                    { field: "description", title: $translate.instant('COMMON_DESCRIPTION'), width: "210px", template: "<div class='readmoreText' title='#= description #'>#= description # </div>" },
                    {
                        field: "skills",
                        title: $translate.instant('SOFTPROFILE_SKILLS'),
                        width: "210px",
                        filterable: false,
                        template: function (dataItem) {
                            return "<div ng-repeat='skill in dataItem.skills'>{{skill.name}}</div>";
                        },
                    },
                    {
                        field: "skillsDescription",
                        title: $translate.instant('SOFTPROFILE_SKILL_DESCRIPTION'),
                        width: "210px",
                        filterable: false,
                        template: function (dataItem) {
                            return "<div ng-repeat='skill in dataItem.skills'>{{skill.description}}</div>";
                        },
                    },
                    {
                        field: "seqNo",
                        title: $translate.instant('SOFTPROFILE_ORDER'),
                        width: "120px",
                        template: "<input style='width:100%'  class='order#= id #' type='number' onchange=\"angular.element(this).scope().displayOrderUpdate(#= id #)\" min='0'  value='#= seqNo ? seqNo : 0 #'/>"
                    },
                    {
                        field: "actions",
                        title: $translate.instant('COMMON_ACTIONS'),
                        width: "120px",
                        filterable: false,
                        sortable: false,
                        template: function (dataItem) {
                            var res = "<div class='icon-groups'><a class='fa fa-pencil fa-lg' ng-click='edit(" + dataItem.id + ", " + performanceGroupsService.list().indexOf(dataItem) + ")' ></a>";
                            if (!isProfileInUse && !isDisabled(dataItem.organizationId, authService.actions.Create)) {
                                res += "<a class='fa fa-copy fa-lg' ng-click='clone(" + dataItem.id + ")'></a>"
                            }

                            if (!isProfileInUse && !isDisabled(dataItem.organizationId, authService.actions.Delete)) {
                                res += "<a class='fa fa-trash fa-lg' ng-click='delete(" + dataItem.id + ")'></a>"
                            }
                            res += "</div>";

                            return res;
                        },
                    },
                ],
                sortable: true,
                columnMenu: false,
                filterable: true,
                pageable: true,
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

            function detailInit(e) {
                $("<h3>Trainings of " + e.data.name + "</h3>").appendTo(e.detailCell)
                $("<div/>").appendTo(e.detailCell).kendoGrid({
                    dataSource: performanceGroupsService.trainingDataSource(e.data.id),
                    scrollable: false,
                    sortable: true,
                    pageable: true,
                    columns: [
                        { field: "id", hidden: true },
                        { field: "name", title: $translate.instant('COMMON_NAME') },
                        { field: "what", title: $translate.instant('COMMON_WHAT') },
                        { field: "why", title: $translate.instant('COMMON_WHY') },
                        { field: "how", title: $translate.instant('COMMON_HOW') },
                        { field: "additionalInfo", title: $translate.instant('COMMON_ADDITIONAL_INFO') }
                    ]
                });
            }
            $scope.goBack = function back() {
                $state.go('^', null, { reload: true });
            }

            $scope.doSearch = function (searchText) {
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
                            },
                        ]
                    }]);
            }

            $scope.$on("kendoRendered", function (event) {
                if (event.targetScope.performanceGroupsGrid) {
                    $scope.gridInstance = event.targetScope.performanceGroupsGrid;
                }
            });

            $scope.addPerformanceGroupFromTemplate = function () {
                var parameters = [{ key: "IsTemplate", value: true }];
                var getQuery = "(IsTemplate eq true)";

                dialogService.showSelectableGridDialog("Select Performance Group", ["name", "description"], "Performance_groups", "Name", getQuery, parameters, true).then(
                    function (data) {
                        apiService.add("profiles/" + $stateParams.profileId + "/performance_groups/copy_from", data).then(function (data) {
                            ($scope.hideFilter) ? performanceGroupsService.load("&$filter=ProfileId eq " + $stateParams.profileId) : $scope.doFilter();
                            profilesService.updateTree();
                        }, function (message) {
                            dialogService.showNotification(message, 'warning');
                        });
                    });
            }

            $scope.filter = {
                performanceGroupId: null,
                organizationId: null,
                industryId: null,
                skillId: null,
                levelId: null,
                isShowActive: true,
                isTemplate: false,
                isShowInactive: false,
                jobPositions: null,
                subIndustryId: null,
            };

            $scope.$watch('filter.jobPositions', function () {
                ($scope.hideFilter) ? '' : $scope.doFilter();
            });

            $scope.doFilter = function () {

                var query = "";

                if ($scope.filter.performanceGroupId > 0) {
                    if (query) {
                        query += "and";
                    }
                    query += "((Link_PerformanceGroupSkills/any(j:j/PerformanceGroupId eq " + $scope.filter.performanceGroupId + "))or(Link_PerformanceGroupSkills/any(j:j/PerformanceGroupId eq " + $scope.filter.performanceGroupId + ")))";
                }

                if ($scope.filter.organizationId > 0) {
                    if (query) {
                        query += "and";
                    }
                    query += "(OrganizationId eq " + $scope.filter.organizationId + ")";
                }

                if ($scope.filter.industryId) {
                    if (query) {
                        query += "and";
                    }
                    query += "(IndustryId eq " + $scope.filter.industryId + ")";
                }

                if ($scope.filter.levelId > 0) {
                    if (query) {
                        query += "and";
                    }
                    query += "(LevelId eq " + $scope.filter.levelId + ")";
                }

                if ($scope.filter.skillId > 0) {
                    if (query) {
                        query += "and";
                    }
                    query += "((Link_PerformanceGroupSkills/any(j:j/SkillId eq " + $scope.filter.skillId + "))or(Link_PerformanceGroupSkills/any(j:j/SubSkillId eq " + $scope.filter.skillId + ")))";
                }

                if ($scope.filter.isTemplate) {
                    if (query) {
                        query += "and";
                    }
                    query += "(IsTemplate eq " + $scope.filter.isTemplate + ")";
                }

                if ($scope.filter.isShowActive) {
                    if ($scope.filter.isShowActive) {
                        if (query) {
                            query += "and";
                        }
                        query += "(IsActive eq " + $scope.filter.isShowActive + ")";
                    }
                }

                if ($scope.filter.jobPositions != null) {
                    if ($scope.filter.jobPositions.length > 0) {
                        if (query) {
                            query += "and";
                        }
                        query += "(";
                        angular.forEach($scope.filter.jobPositions, function (key, index) {
                            if (index != 0) {
                                query += "or";
                            }
                            query += "(JobPositions/any(j:j/Id eq " + key.id + "))";
                        });
                        query += ")";

                    }
                }

                if (query) {
                    query = "&$filter=" + query;
                } else {
                    query = "";
                }

                performanceGroupsService.load(query, profileTypeId);
            };
        }]);



