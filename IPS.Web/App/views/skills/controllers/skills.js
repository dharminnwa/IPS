'use strict';

angular.module('ips.skills')

    .config(['$stateProvider', '$urlRouterProvider', 'profilesTypesEnum', function ($stateProvider, $urlRouterProvider, profilesTypesEnum) {
        var baseResolve = {
            pageName: function ($translate) {
                return $translate.instant('SOFTPROFILE_SKILLS');
            },
            profileTypeId: function () {
                return profilesTypesEnum.soft;
            },
            skills: function ($stateParams, skillsService) {
                return skillsService.getSkillsWithTrainings("&$filter=(IsTemplate eq true)and(ProfileTypeId eq " + profilesTypesEnum.soft + ")");
            },
            organizations: function ($stateParams, skillsService) {
                return skillsService.getOrganizations();
            },
            industries: function ($stateParams, skillsService) {
                return skillsService.getIndustries();
            },
            levels: function ($stateParams, skillsService) {
                return skillsService.getProfileLevels();
            },
            performanceGroups: function ($stateParams, skillsService) {
                return skillsService.getPerformanceGroups("&$filter=(Profile/ProfileTypeId eq " + profilesTypesEnum.soft + ")");
            }
        };

        var softResolve = _.clone(baseResolve);

        var ktResolve = _.clone(baseResolve);
        ktResolve.profileTypeId = function () {
            return profilesTypesEnum.knowledgetest;
        };
        ktResolve.skills = function ($stateParams, skillsService) {
            return skillsService.getSkillsWithTrainings("&$filter=(IsTemplate eq true)and(ProfileTypeId eq " + profilesTypesEnum.knowledgetest + ")");
        };
        ktResolve.performanceGroups = function ($stateParams, skillsService) {
            return skillsService.getPerformanceGroups("&$filter=(Profile/ProfileTypeId eq " + profilesTypesEnum.knowledgetest + ")");
        };

        $stateProvider
            .state('home.profiles.soft.skills', {
                url: "/skills",
                templateUrl: "views/skills/skills.html",
                controller: "SkillsCtrl",
                resolve: softResolve,
                data: {
                    displayName: '{{pageName}}',//'Skills',
                    paneLimit: 1,
                    depth: 3,
                    resource: "Profiles"
                }
            })
            .state('home.profiles.knowledgetest.skills', {
                url: "/skills",
                templateUrl: "views/skills/skills.html",
                controller: "SkillsCtrl",
                resolve: ktResolve,
                data: {
                    displayName: '{{pageName}}',//'Skills',
                    paneLimit: 1,
                    depth: 3,
                    resource: "Profiles"
                }
            });
    }])

    .controller('SkillsCtrl', ['$scope', '$location', 'profilesService', 'apiService', '$window', '$rootScope', 'cssInjector', 'dialogService', 'skillsService',
        'organizations', 'industries', 'levels', 'performanceGroups', 'skills', 'authService', 'profileTypeId', '$translate',
        function ($scope, $location, profilesService, apiService, $window, $rootScope, cssInjector, dialogService, skillsService, organizations,
            industries, levels, performanceGroups, skills, authService, profileTypeId, $translate) {
            cssInjector.removeAll();
            cssInjector.add('views/skills/skills.css');
            cssInjector.add('/Content/select2/css/select2.min.css');
            _.each(skills, function (skilItem) {
                var org = _.find(organizations, function (item) {
                    if (skilItem.performanceGroups.length > 0) {
                        return item.id == skilItem.performanceGroups[0].organizationId;
                    }
                });
                if (org) {
                    if (org.name !== "Select Organization...") {
                        skilItem.organizationId = org.id;
                        skilItem.organizationName = org.name;
                    }
                }
            })
            $scope.organizations = organizations;
            $scope.industries = industries;
            $scope.levels = levels;
            $scope.performanceGroups = performanceGroups;
            $scope.skills = skills;

            $scope.pgInit = function () {
                $('[id=ddlTargetGroup]').select2();
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

            function isDisabled(organizationId, action) {
                if ($scope['Skills' + organizationId + action] == undefined) {
                    $scope['Skills' + organizationId + action] = !authService.hasPermition(organizationId, 'Skills', action);
                }
                return $scope['Skills' + organizationId + action];
            }

            $scope.authService = authService;
            $scope.isDisabled = isDisabled;

            $scope.edit = function (id) {
                $location.path($location.path() + '/edit/' + id);
            };

            $scope.remove = function (id) {
                dialogService.showYesNoDialog($translate.instant('COMMON_CONFIRM'), $translate.instant('COMMON_ARE_YOU_SURE_YOU_WANT_TO_DELETE')).then(
                    function () {
                        apiService.remove("skills", id).then(function (data) {
                            if (data) {
                                $scope.doFilter();
                            }
                        }, function (message) {
                            dialogService.showNotification(message, 'warning');
                        });
                    },
                    function () {
                        options.error({}, 500, "destroyCanceled");
                    })
            };

            $scope.add = function () {
                $location.path($location.path() + '/edit/0');
            }

            $scope.clone = function (id) {
                apiService.add("skills/clone/" + id, null).then(function (data) {
                    $scope.doFilter();
                }, function (message) {
                    dialogService.showNotification(message, 'warning');
                });
            }

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
                }
            }

            $scope.filter = {
                organizationId: null,
                industryId: null,
                performanceGroupId: null,
                skillId: null,
                levelId: null,
                jobPositions: [],
                isShowActive: false,
                isShowInactive: false,
                isTemplate: false,
            };

            $scope.$watch('filter.jobPositions', function () {
                $scope.doFilter();
            });

            $scope.doFilter = function () {

                var query = "";

                query += "(ProfileTypeId eq " + profileTypeId + ")";

                if ($scope.filter.skillId > 0) {
                    if (query) {
                        query += "and";
                    }
                    query += "((Link_PerformanceGroupSkills/any(j:j/SkillId eq " + $scope.filter.skillId + "))or(Link_PerformanceGroupSkills/any(j:j/SubSkillId eq " + $scope.filter.skillId + ")))";
                }

                //if ($scope.filter.organizationId > 0) {
                //    if (query) {
                //        query += "and";
                //    }
                //    query += "(OrganizationId eq " + $scope.filter.organizationId + ")";
                //}

                if ($scope.filter.industryId > 0) {
                    if (query) {
                        query += "and";
                    }
                    query += "(Industries/any(j:j/Id eq " + $scope.filter.industryId + "))";
                }

                if ($scope.filter.levelId > 0) {
                    if (query) {
                        query += "and";
                    }
                    query += "(StructureLevelId eq " + $scope.filter.levelId + ")";
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

                if ($scope.filter.performanceGroupId > 0) {
                    if (query) {
                        query += "and";
                    }
                    query += "((Link_PerformanceGroupSkills/any(j:j/PerformanceGroupId eq " + $scope.filter.performanceGroupId + "))or(Link_PerformanceGroupSkills1/any(j:j/PerformanceGroupId eq " + $scope.filter.performanceGroupId + ")))";
                }

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

                if (query) {
                    query = "&$filter=" + query;
                } else {
                    query = "";
                }


                skillsService.getSkillsWithTrainings(query).then(function (data) {

                    _.each(data, function (skilItem) {
                        var org = _.find(organizations, function (item) {
                            if (skilItem.performanceGroups.length > 0) {
                                return item.id == skilItem.performanceGroups[0].organizationId;
                            }
                        });
                        if (org) {
                            if (org.name !== "Select Organization...") {
                                skilItem.organizationId = org.id;
                                skilItem.organizationName = org.name;
                            }
                        }

                        
                    })
                    if ($scope.filter.organizationId > 0) {
                        data = _.filter(data, function (dataItem) {
                            return dataItem.organizationId == $scope.filter.organizationId;
                        })
                    }
                    var dataSource = $scope.dataSource(data);
                    if ($scope.gridInstance) {
                        $scope.gridInstance.setDataSource(dataSource);
                    }
                });

            }

            $scope.dataSource = function (skills) {

                var ds = skills;
                _.forEach(skills, function (item) {
                    if (item.parentId > 0) {
                        var skillItem = _.find(ds, function (o) { return o.id == item.parentId; })
                        item.skillName = skillItem.name;
                    }
                })
                return new kendo.data.DataSource({
                    data: skills,
                    schema: {
                        model: {
                            id: "id",
                            fields: {
                                parentId: { type: "number", nullable: true },
                                id: { type: "number" }
                            },
                            expanded: true
                        }
                    }
                });

            }

            $scope.treelistOptions = {
                dataSource: $scope.dataSource(skills),
                loadOnDemand: false,
                sortable: true,
                filterable: {
                    mode: "row"
                },
                columnMenu: false,
                detailInit: detailInit,
                columns: [
                    { field: "skillName", title: $translate.instant('SOFTPROFILE_SKILL_NAME'), width: "150px" },
                    { field: "subSkillName", title: $translate.instant('SOFTPROFILE_SUB_SKILL_NAME'), width: "170px" },
                    {
                        field: "description", title: $translate.instant('COMMON_DESCRIPTION'), width: "200px", template: function (dataItem) {
                            return "<div>{{dataItem.description}}</div>";
                        }
                    },
                    { field: "organizationName", title: $translate.instant('COMMON_ORGANIZATION'), width: "150px" },
                    {
                        field: "performanceGroupsView",
                        title: $translate.instant('COMMON_PERFORMANCE_GROUPS'), width: "230px", template: function (dataItem) {
                            return dataItem.performanceGroupsView;
                        }
                    },
                    {
                        field: "industryName", title: $translate.instant('COMMON_INDUSTRY'), width: "150px", template: function (dataItem) {

                            if (dataItem.performanceGroups.length > 0) {
                                var data = _.filter(industries, function (industryData) {
                                    return industryData.id == dataItem.performanceGroups[0].industryId;
                                });

                                if (data.length > 0)
                                    return data[0].name;
                            }
                            
                            return "";
                        }
                    },
                    {
                        field: "levelName", title: $translate.instant('COMMON_LEVEL'), width: "150px", template: function (dataItem) {

                            if (dataItem.structureLevelId > 0) {
                                var data = _.filter(levels, function (levelData) {
                                    return levelData.id == dataItem.structureLevelId;
                                });

                                if (data.length > 0)
                                    return data[0].name;
                            }

                            return "";
                        }
                    },
                    {
                        field: "actions",
                        title: $translate.instant('COMMON_ACTIONS'), width: "120px",
                        sortable: false, searchable: false, filterable: false,
                        template: function (dataItem) {
                            var res = "<div class='icon-groups'><a class='fa fa-pencil fa-lg' ng-click='edit(" + dataItem.id + ")' ></a>";
                            if (!isDisabled(dataItem.organizationId, authService.actions.Create)) {
                                res += "<a class='fa fa-copy fa-lg' ng-click='clone(" + dataItem.id + ")'></a>";
                            }
                            if (!isDisabled(dataItem.organizationId, authService.actions.Delete)) {
                                res += "<a class='fa fa-trash fa-lg' ng-click='remove(" + dataItem.id + ")'></a>"
                            }
                            res += "</div>";

                            return res;
                        }
                    }
                ]
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

            function detailInit(e) {
                $("<h3>Trainings of " + e.data.name + "</h3>").appendTo(e.detailCell)
                $("<div/>").appendTo(e.detailCell).kendoGrid({
                    dataSource: e.data.trainings,
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

            $scope.doSearch = function (searchText) {
                $scope.gridInstance.dataSource.filter([
                    {
                        logic: "or",
                        filters: [
                            {
                                field: "skillName",
                                operator: "contains",
                                value: searchText
                            },
                            {
                                field: "subSkillName",
                                operator: "contains",
                                value: searchText
                            },
                            {
                                field: "description",
                                operator: "contains",
                                value: searchText
                            },
                            {
                                field: "organizationName",
                                operator: "contains",
                                value: searchText
                            },
                            {
                                field: "performanceGroupsView",
                                operator: "contains",
                                value: searchText
                            }
                        ]
                    }]);
            }

            $scope.$on("kendoRendered", function (event) {
                if (event.targetScope.ipsTreeList) {
                    $scope.gridInstance = event.targetScope.ipsTreeList;
                }
            });

        }]);