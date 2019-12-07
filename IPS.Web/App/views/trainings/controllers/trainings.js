angular.module('ips.trainings')

    .config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
        var baseEditResolve = {
            allowRemoveAction: function () {
                return true;
            },
            training: function ($stateParams, trainingsService) {
                return trainingsService.getById($stateParams.trainingId);
            },
            trainingLevels: function ($stateParams, trainingsService) {
                return trainingsService.getTrainingLevels();
            },
            trainingTypes: function ($stateParams, trainingsService) {
                return trainingsService.getTrainingTypes();
            },
            skills: function ($stateParams, trainingsService) {
                return trainingsService.getSkills();
            },
            organizations: function ($stateParams, trainingsService) {
                return trainingsService.getOrganizations();
            },
            duration: function (trainingsService) {
                return trainingsService.getDurationMetrics();
            },
            exMetrics: function (trainingsService) {
                return trainingsService.getExerciseMetrics();
            },
            notificationIntervals: function (trainingsService) {
                return trainingsService.getNotificationIntervals();
            }
        };
        var ktEditResolve = _.clone(baseEditResolve);
        ktEditResolve.allowRemoveAction = function () {
            return false;
        };
        var baseListResolve = {
            pageNameTrainings: function ($translate) {
                return $translate.instant('LEFTMENU_TRAININGS');
            },
            trainings: function ($stateParams, trainingsService) {
                return trainingsService.getAllTemplates();
            },
            trainingLevels: function ($stateParams, trainingsService) {
                return trainingsService.getTrainingLevels();
            },
            trainingTypes: function ($stateParams, trainingsService) {
                return trainingsService.getTrainingTypes();
            },
            skills: function ($stateParams, trainingsService) {
                return trainingsService.getSkills();
            },
            organizations: function ($stateParams, trainingsService) {
                return trainingsService.getOrganizations();
            },
            performanceGroups: function ($stateParams, trainingsService) {
                return trainingsService.getPerformanceGroups();
            },
            duration: function (trainingsService) {
                return trainingsService.getDurationMetrics();
            },
            exMetrics: function (trainingsService) {
                return trainingsService.getExerciseMetrics();
            },
            notificationIntervals: function (trainingsService) {
                return trainingsService.getNotificationIntervals();
            }
        };
        var softListResolve = _.clone(baseListResolve);
        softListResolve.profileType = function () {
            return "soft";
        };

        var ktListResolve = _.clone(baseListResolve);
        ktListResolve.profileType = function () {
            return "knowledgetest";
        };
        var baseSettingsResolve = {
            pageNameTrainingSettings: function ($translate) {
                return $translate.instant('LEFTMENU_TRAINING_SETTING');
            },
            organizations: function ($stateParams, tasksSettingsService, $translate) {
                return tasksSettingsService.getOrganizations().then(function (data) {
                    data.unshift({ id: null, name: $translate.instant('TRAININGDAIRY_SELECT_ORGANIZATION') });
                    return data;
                });
            }
        };
        $stateProvider
            .state('home.profiles.soft.edit.performanceGroups.edit.editTraining', {
                url: "/editTraining/:trainingId",
                templateUrl: "views/trainings/views/trainings.edit.html",
                controller: "TrainingsEditCtrl",
                resolve: baseEditResolve,
                data: {
                    displayName: '{{training.viewName}}',
                    paneLimit: 1,
                    depth: 6,
                    resource: "Profiles"
                }
            })
            .state('home.profiles.soft.trainings', {
                url: "/trainings",
                templateUrl: "views/trainings/views/trainings.html",
                controller: "TrainingsCtrl",
                resolve: softListResolve,
                data: {
                    displayName: '{{pageNameTrainings}}',//'Trainings',
                    paneLimit: 1,
                    depth: 3,
                    resource: "Profiles"
                }
            })
            .state('home.profiles.soft.trainings.edit', {
                url: "/edit/:trainingId",
                templateUrl: "views/trainings/views/trainings.edit.html",
                controller: "TrainingsEditCtrl",
                resolve: baseEditResolve,
                data: {
                    displayName: '{{training.viewName}}',
                    paneLimit: 1,
                    depth: 4,
                    resource: "Profiles"
                }
            })
            .state('home.profiles.soft.performanceGroups.edit.editTraining', {
                url: "/editTraining/:trainingId",
                templateUrl: "views/trainings/views/trainings.edit.html",
                controller: "TrainingsEditCtrl",
                resolve: baseEditResolve,
                data: {
                    displayName: '{{training.viewName}}',
                    paneLimit: 1,
                    depth: 5,
                    resource: "Profiles"
                }
            })
            .state('home.profiles.soft.trainings.setting', {
                url: "/trainingSetting",
                templateUrl: "views/trainings/views/trainingsSetting.html",
                controller: "TrainingsSettingCtrl as trainingSettings",
                resolve: baseSettingsResolve,
                data: {
                    displayName: '{{pageNameTrainingSettings}}',//'Training setting',
                    paneLimit: 1,
                    depth: 4,
                    resource: "Training Setting"
                }
            })

            .state('home.training.setting', {
                url: "/trainingSetting",
                templateUrl: "views/trainings/views/trainingsSetting.html",
                controller: "TrainingsSettingCtrl as trainingSettings",
                resolve: baseSettingsResolve,
                data: {
                    displayName: '{{pageNameTrainingSettings}}',//'Training setting',
                    paneLimit: 1,
                    depth: 2,
                    resource: "Training Setting"
                }
            })
            .state('home.training.trainingTemplates', {
                url: "/trainingTemplates",
                templateUrl: "views/trainings/views/trainings.html",
                controller: "TrainingsCtrl",
                resolve: ktListResolve,
                data: {
                    displayName: '{{pageNameTrainings}}',//'Trainings',
                    paneLimit: 1,
                    depth: 2,
                    resource: "Profiles"
                }
            })
            .state('home.profiles.knowledgetest.edit.performanceGroups.edit.editTraining', {
                url: "/editTraining/:trainingId",
                templateUrl: "views/trainings/views/trainings.edit.html",
                controller: "TrainingsEditCtrl",
                resolve: ktEditResolve,
                data: {
                    displayName: '{{training.viewName}}',
                    paneLimit: 1,
                    depth: 6,
                    resource: "Profiles"
                }
            })
            .state('home.profiles.knowledgetest.trainings', {
                url: "/trainings",
                templateUrl: "views/trainings/views/trainings.html",
                controller: "TrainingsCtrl",
                resolve: ktListResolve,
                data: {
                    displayName: '{{pageNameTrainings}}',//'Trainings',
                    paneLimit: 1,
                    depth: 3,
                    resource: "Profiles"
                }
            })
            .state('home.profiles.knowledgetest.trainings.edit', {
                url: "/edit/:trainingId",
                templateUrl: "views/trainings/views/trainings.edit.html",
                controller: "TrainingsEditCtrl",
                resolve: ktEditResolve,
                data: {
                    displayName: '{{training.viewName}}',
                    paneLimit: 1,
                    depth: 4,
                    resource: "Profiles"
                }
            })
            .state('home.profiles.knowledgetest.performanceGroups.edit.editTraining', {
                url: "/editTraining/:trainingId",
                templateUrl: "views/trainings/views/trainings.edit.html",
                controller: "TrainingsEditCtrl",
                resolve: ktEditResolve,
                data: {
                    displayName: '{{training.viewName}}',
                    paneLimit: 1,
                    depth: 5,
                    resource: "Profiles"
                }
            })
            .state('home.profiles.knowledgetest.trainings.setting', {
                url: "/trainingSetting",
                templateUrl: "views/trainings/views/trainingsSetting.html",
                controller: "TrainingsSettingCtrl as trainingSettings",
                resolve: baseSettingsResolve,
                data: {
                    displayName: '{{pageNameTrainingSettings}}',//'Training setting',
                    paneLimit: 1,
                    depth: 4,
                    resource: "Profiles"
                }
            });
    }])

    .controller('TrainingsCtrl', ['$scope', '$state', '$location', 'apiService', '$window', '$rootScope', 'cssInjector', 'trainingsService',
        'dialogService', 'trainings', 'trainingLevels', 'trainingTypes', 'skills', 'organizations', 'authService', 'profilesService',
        'profileType', 'performanceGroups', 'progressBar', 'duration', 'exMetrics', 'notificationIntervals', '$translate',
        function ($scope, $state, $location, apiService, $window, $rootScope, cssInjector, trainingsService,
            dialogService, trainings, trainingLevels, trainingTypes, skills, organizations, authService, profilesService,
            profileType, performanceGroups, progressBar, duration, exMetrics, notificationIntervals, $translate) {
            cssInjector.removeAll();
            cssInjector.add('views/trainings/trainings.css');
            cssInjector.add('/Content/select2/css/select2.min.css');

            $scope.paramTrainingId = $state.params.trainingId ? parseInt($state.params.trainingId) : 0;

            $scope.pgInit = function () {
                $('[id=projectTrainingSubIndustry]').select2();
            }

            $scope.durationMetrics = duration;
            $scope.exerciseMetrics = exMetrics;
            $scope.notificationIntervals = notificationIntervals;
            $scope.private = {
                getById: function (id, myArray) {
                    if (myArray.filter) {
                        return myArray.filter(function (obj) {
                            if (obj.id == id) {
                                return obj
                            }
                        })[0];
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
            $scope.allSkills = skills;
            $scope.skillsFlatList = profilesService.flattenSkillsList(skills);
            $scope.trainingLevels = trainingLevels;
            $scope.trainingTypes = trainingTypes;
            $scope.organizations = organizations;
            $scope.AllPerformanceGroups = performanceGroups;
            $scope.treeSkillsData = new kendo.data.HierarchicalDataSource({
                data: $scope.private.processTable(skills, "id", "parentId", 0)
            });

            trainingsService.addRange(trainings);
            $scope.trainings = trainingsService.list();
            trainingsService.getProfileLevels().then(function (data) {
                $scope.profileLevels = data;
            });
            trainingsService.getProfileTargetGroups().then(function (data) {
                $scope.targetGroups = data;
            });

            trainingsService.getIndustries().then(function (data) {
                $scope.industries = data;
                $scope.mainIndustries = _.filter(data, function (i) {
                    return i.parentId == null;
                });
            });

            $scope.edit = function (id, index) {
                $scope.paramTrainingId = id;
                $state.go("home.profiles." + profileType + ".trainings.edit", { trainingId: id });
            };

            $scope.private = {
                getById: function (id, myArray) {
                    if (myArray.filter) {
                        return myArray.filter(function (obj) {
                            if (obj.id == id) {
                                return obj;
                            }
                        })[0];
                    }
                    return undefined;
                }
            }

            $scope.remove = function (id) {
                apiService.getById("trainings/checkinuse", id).then(
                    function () {
                        dialogService.showYesNoDialog($translate.instant('COMMON_CONFIRM'), $translate.instant('COMMON_ARE_YOU_SURE_YOU_WANT_TO_DELETE')).then(
                            function () {
                                var item = $scope.private.getById(id, trainingsService.list());
                                var index = trainingsService.list().indexOf(item);
                                apiService.remove("trainings", id).then(function (data) {
                                    if (data) {
                                        trainingsService.remove(index);
                                    }
                                }, function (message) {
                                    dialogService.showNotification($translate.instant('TRAININGDAIRY_TRAINING_CANNOT_BE_REMOVED') + message, 'error');
                                });
                            },
                            function () {
                                //alert('No clicked');
                            });
                    }, function (message) {
                        dialogService.showNotification($translate.instant('TRAININGDAIRY_TRAINING_CANNOT_BE_REMOVED') + message, 'error');
                    }
                );
            };

            $scope.create = function () {
                $scope.paramTrainingId = 0;
                $state.go("home.profiles." + profileType + ".trainings.edit", { trainingId: 0 });
            }

            $scope.clone = function (id) {
                apiService.add("trainings/clone/" + id, null).then(function (data) {
                    $scope.doFilter();
                }, function (message) {
                    dialogService.showNotification(message, 'warning');
                });
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

            $scope.authService = authService;
            function isDisabled(organizationId, action) {
                if ($scope['Trainings' + organizationId + action] == undefined) {
                    $scope['Trainings' + organizationId + action] = !authService.hasPermition(organizationId, 'Trainings', action);
                }
                return $scope['Trainings' + organizationId + action];
            }

            $scope.isDisabled = isDisabled;

            $scope.gridOptions = {
                dataBound: $scope.onUserAssignGridDataBound,
                dataSource: trainingsService.dataSource(),
                columnMenu: false,
                filterable: true,
                pageable: true,
                sortable: true,
                resizable: true,
                columns: [
                    { field: "name", title: $translate.instant('COMMON_NAME'), width: "120px" },
                    { field: "skillName", title: $translate.instant('COMMON_SKILL'), width: "120px" },
                    { field: "levelId", title: $translate.instant('COMMON_LEVEL'), width: "120px", values: trainingLevels },
                    { field: "typeId", title: $translate.instant('COMMON_TYPE'), width: "120px", values: trainingTypes },
                    { field: "why", title: $translate.instant('COMMON_WHY'), width: "100px", template: "<div class='readmoreText' title='#= why #'>#= why # </div>" },
                    { field: "what", title: $translate.instant('COMMON_WHAT'), width: "120px", template: "<div class='readmoreText' title='#= what #'>#= what # </div>" },
                    { field: "how", title: $translate.instant('COMMON_HOW'), width: "100px", template: "<div class='readmoreText' title='#= how #'>#= how # </div>" },
                    {
                        field: "performanceGroup",
                        title: $translate.instant('COMMON_PERFORMANCE_GROUP'),
                        width: "250px",
                        template: "<div ng-repeat='performanceGroup in dataItem.link_PerformanceGroupSkills | uniquePerformanceGroup'> {{performanceGroup}} </div>"
                    },
                    {
                        field: "trainingMaterials", title: $translate.instant('TRAININGDAIRY_LINK_TO_MATERIALS'), width: "200px",
                        template: function (dataItem) {
                            var res = "";
                            if (dataItem.trainingMaterials)
                                angular.forEach(dataItem.trainingMaterials, function (item, index) {
                                    if (item.link && item.link != "")
                                        res = res + "<div><a href='" + item.link + "'>" + item.title + "</a></div>";
                                });
                            return res;
                        },
                    },
                    {
                        field: "actions", title: $translate.instant('COMMON_ACTIONS'), width: "150px", filterable: false, sortable: false,
                        template: function (dataItem) {
                            var res = "<div class='icon-groups'><a class='fa fa-pencil fa-lg' ng-click='edit(" + dataItem.id + ")' ></a>";
                            if (!isDisabled(dataItem.organizationId, authService.actions.Create)) {
                                res += "<a class='fa fa-copy fa-lg' ng-click='clone(" + dataItem.id + ")'></a>";
                            }
                            if (!isDisabled(dataItem.organizationId, authService.actions.Delete)) {
                                res += "<a class='fa fa-trash fa-lg' ng-click='remove(" + dataItem.id + ");'></a>";
                            }
                            res += "</div>";
                            return res;
                        },
                    },
                ],
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

            $scope.filter = {
                organizationId: null,
                performanceGroupName: 'Select Performance Group...',
                //performanceGroupId: null,
                trainingLevelId: null,
                trainingTypeId: null,
                isShowActive: true,
                isShowInactive: null,
                isTemplate: true,
                skillId: null,
                profileLevelId: null,
                jobPositionId: null,
                industryId: null,
                subIndustryId: null,
                subIndustryIds: [],
            };


            $scope.searchText = "";

            $scope.doFilter = function () {
                progressBar.startProgress();
                var query = "";

                if ($scope.filter.organizationId > 0) {
                    query += "(OrganizationId eq " + $scope.filter.organizationId + ")";

                }
                else {
                    $scope.performanceGroups = $scope.AllPerformanceGroups;
                }

                if ($scope.filter.trainingLevelId > 0) {
                    if (query) { query += "and"; }
                    query += "(LevelId eq " + $scope.filter.trainingLevelId + ")";
                }

                if ($scope.filter.isTemplate) {
                    if (query) { query += "and"; }
                    query += "(IsTemplate eq " + $scope.filter.isTemplate + ")";
                }


                if ($scope.filter.trainingTypeId > 0) {
                    if (query) { query += "and"; }
                    query += "(TypeId eq " + $scope.filter.trainingTypeId + ")";
                }

                if ($scope.filter.isShowActive) {
                    if ($scope.filter.isShowActive) {
                        if (query) { query += "and"; }
                        query += "(IsActive eq " + $scope.filter.isShowActive + ")";
                    }
                }

                if ($scope.filter.performanceGroupId != null) {

                    if (query) {
                        query += "and";
                    }
                    query += ""
                    var pg = _.find($scope.AllPerformanceGroups, function (item) {
                        return item.id == $scope.filter.performanceGroupId;
                    })
                    query += "(Link_PerformanceGroupSkills/any(j:j/PerformanceGroup/Name eq '" + pg.name + "'))";
                }


                if ($scope.filter.skillId > 0) {
                    if (query) {
                        query += "and";
                    }
                    query += "(Skills/any(s:s/Id eq " + $scope.filter.skillId + "))";
                }



                //if ($scope.filter.performanceGroupName && $scope.filter.performanceGroupName != 'Select Performance Group...') {
                //    if (query) { query += "and"; }
                //    query += "(Link_PerformanceGroupSkills/any(j:j/PerformanceGroup/Name eq '" + $scope.filter.performanceGroupName + "'))";
                //    $scope.skills = [];
                //    $scope.allSkills.forEach(function (item, i) {
                //        if (item.link_PerformanceGroupSkills) {
                //            item.link_PerformanceGroupSkills.forEach(function (pgskill) {
                //                if (pgskill.performanceGroup.name == $scope.filter.performanceGroupName) {

                //                    $scope.skills.push(item);
                //                }
                //            })

                //        }
                //    });

                //}
                //else {
                //    $scope.skills = $scope.allSkills;
                //}

                if ($scope.filter.industryId > 0) {
                    $scope.subIndustries = _.filter($scope.industries, function (item) {
                        return item.parentId == $scope.filter.industryId;
                    });

                }
                else {
                    $scope.subIndustries = [];
                    $scope.filter.subIndustryId = null;
                }

                if (query) { query = "&$filter=" + query; }

                if (!query) { query = ""; }
                var result = apiService.add('trainings/FilterTraining', $scope.filter).then(function (data) {
                    angular.forEach(data, function (key, value) {
                        if (key.skills.length > 0) {
                            key.skillName = key.skills[0].name;
                        }
                        else {
                            key.skillName = "";
                        }
                    });
                    $scope.trainings.splice(0, $scope.trainings.length);
                    $scope.trainings.push.apply($scope.trainings, data);
                    progressBar.stopProgress();
                });

            };

            $scope.mainIndustryChange = function () {
                $scope.subIndustries = [];
                $scope.filter.subIndustryId = null;
                if ($scope.filter.industryId > 0) {
                    $scope.subIndustries = _.filter($scope.industries, function (item) {
                        return item.parentId == $scope.filter.industryId;
                    });
                }
                var dataSource = new kendo.data.DataSource({
                    data: $scope.subIndustries,
                });
                $scope.selectOptions = {
                    placeholder: $translate.instant('TRAININGDAIRY_SELECT_SUB_INDUSTRY'),
                    dataTextField: "name",
                    dataValueField: "id",
                    valuePrimitive: true,
                    autoBind: false,
                    dataSource: dataSource,
                    change: function (e) {
                        var value = this.value();
                        if (value.length > 0) {

                            $scope.filter.subIndustryId = value[0];
                        }
                        else {
                            $scope.filter.subIndustryId = null;
                        }
                        $scope.filter.subIndustryIds = value;
                        $scope.doFilter();
                    }
                };
                var projectTrainingSubIndustry = $("#projectTrainingSubIndustry").data("kendoMultiSelect");
                if (projectTrainingSubIndustry) {
                    projectTrainingSubIndustry.destroy();
                }
                $("#projectTrainingSubIndustry").kendoMultiSelect($scope.selectOptions);
                $scope.doFilter();
            }
            $scope.fiterOrganizationChanged = function () {
                $scope.filter.performanceGroupName = "Select Performance Group...";
                $scope.performanceGroups = _.filter($scope.AllPerformanceGroups, function (item) {
                    return item.organizationId == $scope.filter.organizationId;
                });
                var filterPG = _.find($scope.performanceGroups, function (pgItem) {
                    return pgItem.id == $scope.filter.performanceGroupId
                })
                if (!(filterPG)) {
                    $scope.filter.performanceGroupId = null;
                }
                //$scope.filter.performanceGroupId = null;
                $scope.filter.skillId = null;
                if ($scope.filter.organizationId > 0) {
                    $scope.skills = [];
                    var ipsSkillFiter = {
                        organizationId: $scope.filter.organizationId,
                        performanceGroupId: $scope.filter.performanceGroupId,
                    }
                    trainingsService.getSkillsByFilterOptions(ipsSkillFiter).then(function (data) {
                        $scope.skills = data;
                        $scope.skillsFlatList = profilesService.flattenSkillsList($scope.skills);
                    });
                }

                $scope.filter.industryId = null;
                $scope.filter.subIndustryId = null;
                $scope.doFilter();
            }

            $scope.performanceGroupChanged = function () {
                $scope.skills = [];
                var ipsSkillFiter = {
                    organizationId: $scope.filter.organizationId,
                    performanceGroupId: $scope.filter.performanceGroupId,
                }
                trainingsService.getSkillsByFilterOptions(ipsSkillFiter).then(function (data) {
                    $scope.skills = data;
                    $scope.skillsFlatList = profilesService.flattenSkillsList($scope.skills);
                });
                $scope.filter.skillId = 0;
                $scope.doFilter();
            }

            //$scope.doFilter();

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
                                field: "skillName",
                                operator: "contains",
                                value: searchText
                            }
                            ,
                            {
                                field: "why",
                                operator: "contains",
                                value: searchText
                            },
                            {
                                field: "what",
                                operator: "contains",
                                value: searchText
                            },
                            {
                                field: "how",
                                operator: "contains",
                                value: searchText
                            }
                        ]
                    }]);
            }

            $scope.$on("kendoRendered", function (event) {
                if (event.targetScope.trainingsGrid) {
                    $scope.gridInstance = event.targetScope.trainingsGrid;
                }
            });

            $scope.openLink = function (link) {
                var win = window.open(link);
                win.focus();
            }

            $scope.selectSubIndustryOptions = {
                placeholder: $translate.instant('TRAININGDAIRY_SELECT_SUB_INDUSTRY'),
                dataTextField: "name",
                dataValueField: "id",
                valuePrimitive: false,
                autoBind: false,
                dataSource: {
                    type: "json",
                    data: $scope.subIndustries,
                }
            };
        }])
    .controller('TrainingsEditCtrl', ['$scope', '$location', 'apiService', '$rootScope', 'cssInjector', '$stateParams', '$state', 'dialogService',
        'training', 'trainingLevels', 'trainingTypes', 'skills', 'organizations', 'duration', 'exMetrics', 'notificationIntervals', 'profilesService',
        'allowRemoveAction',
        function ($scope, $location, apiService, $rootScope, cssInjector, $stateParams, $state,
            dialogService, training, trainingLevels, trainingTypes, skills, organizations, duration, exMetrics,
            notificationIntervals, profilesService, allowRemoveAction) {
            $scope.training = training;
            $scope.trainingLevels = trainingLevels;
            $scope.trainingTypes = trainingTypes;
            $scope.organizations = organizations;
            $scope.skills = skills;
            $scope.skillsHash = profilesService.createSkillsHash(skills);
            $scope.skillsFlatList = profilesService.flattenSkillsList(skills);
            $scope.durationMetrics = duration;
            $scope.exerciseMetrics = exMetrics;
            $scope.notificationIntervals = notificationIntervals;
        }])
    .controller('TrainingsSettingCtrl', ['cssInjector', '$stateParams', '$location', 'tasksSettingsService', 'dialogService', 'apiService', '$state', 'organizations', '$translate',
        function (cssInjector, $stateParams, $location, tasksSettingsService, dialogService, apiService, $state, organizations, $translate) {

            cssInjector.removeAll();
            cssInjector.add('views/tasksSettings/tasksSettings.css');
            var vm = this;
            vm.organizations = organizations;
            vm.organizationId = null;
            vm.departments = [{ id: null, name: $translate.instant('TRAININGDAIRY_SELECT_DEPARTMENT') }];
            vm.departmentId = null;
            vm.teams = [{ id: null, name: $translate.instant('TRAININGDAIRY_SELECT_TEAM') }];
            vm.teamId = null;
            vm.users = [{ id: null, firstName: $translate.instant('TRAININGDAIRY_SELECT_USER'), lastName: "" }];
            vm.userId = null;
            vm.listId = null;
            vm.settingsTypeId = 0;
            vm.settingsTypes = [{ id: 0, name: $translate.instant('COMMON_CATEGORY') }, { id: 1, name: $translate.instant('COMMON_PRIORITY') }, { id: 2, name: $translate.instant('COMMON_STATUS') }, , { id: 3, name: $translate.instant('TRAININGDAIRY_SCALE_RATING') }];
            vm.IsGenerateAllowed = false;
            vm.taskScale = {
                id: -1,
                name: "5 star",
                description: "",
                scaleStart: 1,
                scaleEnd: 5,
                scaleInterval: 5,
                organizationId: 0,
                departmentId: 0,
                teamId: 0,
                userId: 0,
                taskScaleRanges: [{
                    color: "#f00",
                    description: "Low",
                    id: -1,
                    max: 3,
                    min: 1,
                    taskScaleId: -1,
                }, {
                    color: "#ff0",
                    description: "Medium",
                    id: -1,
                    max: 6,
                    min: 3,
                    taskScaleId: -1,
                }, {
                    color: "#0f0",
                    description: "High",
                    id: -1,
                    max: 10,
                    min: 7,
                    taskScaleId: -1
                }]
            };
            vm.categories = [];
            function getDataSource() {
                var dataSource = new kendo.data.DataSource({
                    type: "json",
                    transport: {
                        read: function (options) {
                            if ((vm.organizationId) && (vm.settingsTypeId == 0)) {
                                tasksSettingsService.getTaskCategories(vm.organizationId, vm.departmentId, vm.teamId, vm.userId).then(function (data) {
                                    if (data != 404) {
                                        vm.IsGenerateAllowed = false;
                                        vm.listId = data.id;
                                        options.success(data.taskCategoryListItems);
                                    } else {
                                        vm.IsGenerateAllowed = true;
                                        vm.listId = null;
                                        options.error(data);

                                    }
                                }, function (message) {
                                    dialogService.showNotification(message, "warning");
                                });
                            }

                            if ((vm.organizationId) && (vm.settingsTypeId == 1)) {
                                tasksSettingsService.getTaskPriorities(vm.organizationId, vm.departmentId, vm.teamId, vm.userId).then(function (data) {
                                    if (data != 404) {
                                        vm.IsGenerateAllowed = false;
                                        vm.listId = data.id;
                                        options.success(data.taskPriorityListItems);
                                    } else {
                                        vm.IsGenerateAllowed = true;
                                        vm.listId = null;
                                        options.error(data);
                                    }
                                }, function (message) {
                                    dialogService.showNotification(message, "warning");
                                });
                            }

                            if ((vm.organizationId) && (vm.settingsTypeId == 2)) {
                                tasksSettingsService.getTaskStatuses(vm.organizationId, vm.departmentId, vm.teamId, vm.userId).then(function (data) {
                                    if (data != 404) {
                                        vm.IsGenerateAllowed = false;
                                        vm.listId = data.id;
                                        options.success(data.taskStatusListItems);
                                    } else {
                                        vm.IsGenerateAllowed = true;
                                        vm.listId = null;
                                        options.error(data);
                                    }
                                }, function (message) {
                                    dialogService.showNotification(message, "warning");
                                });
                            }

                        },
                        update: function (options) {
                            if ((vm.organizationId) && (vm.settingsTypeId == 0)) {
                                var item = {
                                    id: options.data.id,
                                    name: options.data.name,
                                    description: options.data.description,
                                    categoryListId: options.data.categoryListId,
                                    color: options.data.color,
                                    textColor: options.data.textColor
                                };
                                apiService.update("TaskCategories/listItem", item).then(function (data) {
                                    options.success();
                                }, function (message) {
                                    dialogService.showNotification(message, "warning");
                                })
                            }

                            if ((vm.organizationId) && (vm.settingsTypeId == 1)) {
                                var item = {
                                    id: options.data.id,
                                    name: options.data.name,
                                    description: options.data.description,
                                    priorityListId: options.data.priorityListId
                                };
                                apiService.update("TaskPriorities/listItem", item).then(function (data) {
                                    options.success();
                                }, function (message) {
                                    dialogService.showNotification(message, "warning");
                                })
                            }


                            if ((vm.organizationId) && (vm.settingsTypeId == 2)) {
                                var item = {
                                    id: options.data.id,
                                    name: options.data.name,
                                    description: options.data.description,
                                    taskStatusListId: options.data.taskStatusListId
                                };
                                apiService.update("TaskStatuses/listItem", item).then(function (data) {
                                    options.success();
                                }, function (message) {
                                    dialogService.showNotification(message, "warning");
                                })
                            }

                        },
                        create: function (options) {
                            if ((vm.organizationId) && (vm.settingsTypeId == 0)) {
                                var item = {
                                    id: options.data.id,
                                    name: options.data.name,
                                    description: options.data.description,
                                    categoryListId: vm.listId,
                                    color: options.data.color,
                                    textColor: options.data.textColor
                                };

                                apiService.add("TaskCategories/listItem", item).then(function (data) {
                                    options.data.id = data;
                                    dialogService.showNotification($translate.instant('TRAININGDAIRY_SAVED_SUCCESFULLY'), "info");
                                    options.success(options.data);
                                }, function (message) {
                                    dialogService.showNotification(message, "warning");
                                })
                            }

                            if ((vm.organizationId) && (vm.settingsTypeId == 1)) {
                                var item = {
                                    id: options.data.id,
                                    name: options.data.name,
                                    description: options.data.description,
                                    priorityListId: vm.listId
                                };
                                apiService.add("TaskPriorities/listItem", item).then(function (data) {
                                    options.data.id = data;
                                    dialogService.showNotification($translate.instant('TRAININGDAIRY_SAVED_SUCCESFULLY'), "info");
                                    options.success(options.data);
                                }, function (message) {
                                    dialogService.showNotification(message, "warning");
                                })
                            }


                            if ((vm.organizationId) && (vm.settingsTypeId == 2)) {
                                var item = {
                                    id: options.data.id,
                                    name: options.data.name,
                                    description: options.data.description,
                                    taskStatusListId: vm.listId
                                };
                                apiService.add("TaskStatuses/listItem", item).then(function (data) {
                                    options.data.id = data;
                                    dialogService.showNotification($translate.instant('TRAININGDAIRY_SAVED_SUCCESFULLY'), "info");
                                    options.success(options.data);
                                }, function (message) {
                                    dialogService.showNotification(message, "warning");
                                })
                            }

                        },
                    },
                    pageSize: 10,
                    schema: {
                        model: {
                            id: "id",
                            fields: {
                                id: { type: 'number', },
                                name: { type: 'string' },
                                description: { type: 'string' },
                            }
                        }
                    },
                    error: function (err) {
                        this.cancelChanges();
                    },
                });

                return dataSource;
            }
            function getasksRatingScaleDataSource() {
                tasksSettingsService.getTaskScale(vm.organizationId, vm.departmentId, vm.teamId, vm.userId).then(function (data) {
                    vm.taskScale = data;
                    vm.fillGrid();
                });

            }

            function add() {
                if (vm.organizationId) {
                    var grid = null;
                    if (vm.settingsTypeId == 0) {
                        grid = $("#tasksCategoriesGrid").data("kendoGrid");
                    }
                    else {
                        grid = $("#taskSettingsGrid").data("kendoGrid");
                    }

                    grid.addRow();
                }
                else {
                    dialogService.showNotification($translate.instant('TRAININGDAIRY_ORGANIZATION_NOT_SELECTED'), 'warning');
                }

            }

            function createNewList() {
                if ((vm.organizationId) && (vm.settingsTypeId == 0)) {
                    apiService.add("TaskCategories/" + vm.organizationId + "/" + vm.departmentId + "/" + vm.teamId + "/" + vm.userId + "/list").then(function (data) {
                        reloadSelected();
                    }, function (message) {
                        dialogService.showNotification(message, "warning");
                    })
                }
                if ((vm.organizationId) && (vm.settingsTypeId == 1)) {
                    apiService.add("TaskPriorities/" + vm.organizationId + "/" + vm.departmentId + "/" + vm.teamId + "/" + vm.userId + "/list").then(function (data) {
                        reloadSelected();
                    }, function (message) {
                        dialogService.showNotification(message, "warning");
                    })
                }
                if ((vm.organizationId) && (vm.settingsTypeId == 2)) {
                    apiService.add("TaskStatuses/" + vm.organizationId + "/" + vm.departmentId + "/" + vm.teamId + "/" + vm.userId + "/list").then(function (data) {
                        reloadSelected();
                    }, function (message) {
                        dialogService.showNotification(message, "warning");
                    })
                }
            }

            function organizationChanged() {
                vm.IsGenerateAllowed = false;
                if (vm.organizationId) {

                    tasksSettingsService.getDepartments(vm.organizationId).then(function (data) {
                        data.unshift({ id: null, name: $translate.instant('TRAININGDAIRY_SELECT_DEPARTMENT') });
                        vm.departments = data;
                    });

                    tasksSettingsService.getTeams(vm.organizationId).then(function (data) {
                        data.unshift({ id: null, name: $translate.instant('TRAININGDAIRY_SELECT_TEAM') });
                        vm.teams = data;
                    });

                    tasksSettingsService.getUsers(vm.organizationId).then(function (data) {
                        data.unshift({ id: null, firstName: $translate.instant('TRAININGDAIRY_SELECT_USER'), lastName: "" });
                        vm.users = data;
                    });

                    reloadSelected();
                }
            }

            function reloadSelected() {
                vm.IsGenerateAllowed = false;
                if (vm.organizationId) {
                    if (vm.settingsTypeId == 3) {
                        getasksRatingScaleDataSource();
                    }
                    else {
                        var grid = $("#tasksCategoriesGrid").data("kendoGrid");
                        var dataSource = getDataSource();
                        grid.setDataSource(dataSource);
                        grid.refresh();

                        grid = $("#taskSettingsGrid").data("kendoGrid");
                        grid.setDataSource(dataSource);
                        grid.refresh();
                        vm.IsGenerateAllowed = true;
                    }




                }
            }

            function filterUsers(item) {
                if (item.id == null) {
                    return true;
                }

                if (vm.teamId) {
                    angular.forEach(item.teams, function (team, index) {
                        if (team.id == vm.teamId) {
                            fResult = true;
                        }
                    })

                    return fResult;
                }

                if (!vm.departmentId) {
                    return true;
                }

                var fResult = false;
                angular.forEach(item.departments, function (department, index) {
                    if (department.id == vm.departmentId) {
                        fResult = true;
                    }
                })

                angular.forEach(item.departments1, function (department, index) {
                    if (department.id == vm.departmentId) {
                        fResult = true;
                    }
                })


                return fResult;
            }

            vm.add = add;
            vm.filterUsers = filterUsers;
            vm.organizationChanged = organizationChanged;
            vm.reloadSelected = reloadSelected;
            vm.createNewList = createNewList;

            vm.fillGrid = function () {
                vm.taskScale.taskScaleRanges = new kendo.data.ObservableArray(vm.taskScale.taskScaleRanges);
                var ds = new kendo.data.DataSource({
                    data: vm.taskScale.taskScaleRanges,
                    pageSize: 10,
                    schema: {
                        model: {
                            id: "id",
                            fields: {
                                id: { type: 'number', },
                                min: { type: 'number' },
                                max: { type: 'number' },
                                description: { type: 'string' },
                                color: { type: 'string' },
                                taskScaleId: { type: 'number' }
                            }
                        }
                    }
                });

                vm.gridRnagesOptions = {
                    dataSource: ds,
                    pageable: true,
                    editable: true,
                    columns: [
                        { field: "min", title: $translate.instant('COMMON_START'), width: "120px" },
                        { field: "max", title: $translate.instant('COMMON_END'), width: "120px" },
                        { field: "description", title: $translate.instant('COMMON_DESCRIPTION'), width: "120px", template: "<div class='readmoreText' title='#= description #'>#= description # </div>" },
                        {
                            field: "color", title: $translate.instant('COMMON_COLOR'), width: "120px",
                            template: function (dataItem) {
                                return "<div style='background-color: " + dataItem.color + ";'>&nbsp;</div>";
                            },
                            editor: function (container, options) {
                                // create an input element
                                var input = $("<input/>");
                                // set its name to the field to which the column is bound ('name' in this case)
                                input.attr("name", options.field);
                                // append it to the container
                                input.appendTo(container);
                                // initialize a Kendo UI AutoComplete
                                input.kendoColorPicker({
                                    value: options.model.Color,
                                    buttons: false,
                                    palette: "basic",
                                });


                            }
                        }]
                };

                $("#gridRnages").kendoGrid(vm.gridRnagesOptions).data("kendoGrid");

            }
            vm.getColor = function (id) {
                var color = '#fff';
                switch (id) {
                    case 0:
                        color = '#f00'
                        break
                    case 1:
                        color = '#ff0'
                        break
                    case 2:
                        color = '#0f3'
                        break
                    case 3:
                        color = '#06f'
                        break
                    case 4:
                        color = '#f99'
                        break
                    case 5:
                        color = '#99f'
                        break
                    case 6:
                        color = '#990'
                        break
                    case 7:
                        color = '#096'
                        break
                    case 8:
                        color = '#c60'
                        break
                    case 9:
                        color = '#30c'
                        break
                    default:
                        color = '#fff'
                }
                return color;
            }
            vm.getRangesByKey = function (key) {
                if (key == "1_8_3") {
                    return [{
                        id: -1,
                        taskScaleId: vm.taskScale.id,
                        min: 1,
                        max: 3,
                        description: '',
                        color: vm.getColor(0),
                    },
                    {
                        id: -1,
                        taskScaleId: vm.taskScale.id,
                        min: 4,
                        max: 6,
                        description: '',
                        color: vm.getColor(1),
                    },
                    {
                        id: -1,
                        taskScaleId: vm.taskScale.id,
                        min: 7,
                        max: 8,
                        description: '',
                        color: vm.getColor(2),
                    }
                    ]
                }
                else if (key == "1_50_3") {
                    return [{
                        id: -1,
                        taskScaleId: vm.taskScale.id,
                        min: 1,
                        max: 30,
                        description: '',
                        color: vm.getColor(2),
                    },
                    {
                        id: -1,
                        taskScaleId: vm.taskScale.id,
                        min: 31,
                        max: 40,
                        description: '',
                        color: vm.getColor(1),
                    },
                    {
                        id: -1,
                        taskScaleId: vm.taskScale.id,
                        min: 41,
                        max: 50,
                        description: '',
                        color: vm.getColor(0),
                    }
                    ]
                }
                else if (key == "1_50_4") {
                    return [{
                        id: -1,
                        taskScaleId: vm.taskScale.id,
                        min: 1,
                        max: 30,
                        description: '',
                        color: vm.getColor(3),
                    }, {
                        id: -1,
                        taskScaleId: vm.taskScale.id,
                        min: 31,
                        max: 40,
                        description: '',
                        color: vm.getColor(2),
                    },
                    {
                        id: -1,
                        taskScaleId: vm.taskScale.id,
                        min: 41,
                        max: 45,
                        description: '',
                        color: vm.getColor(1),
                    },
                    {
                        id: -1,
                        taskScaleId: vm.taskScale.id,
                        min: 45,
                        max: 50,
                        description: '',
                        color: vm.getColor(0),
                    }
                    ]
                } else if (key == "1_50_5") {
                    return [{
                        id: -1,
                        taskScaleId: vm.taskScale.id,
                        min: 1,
                        max: 30,
                        description: '',
                        color: vm.getColor(4),
                    }, {
                        id: -1,
                        taskScaleId: vm.taskScale.id,
                        min: 31,
                        max: 35,
                        description: '',
                        color: vm.getColor(3),
                    }, {
                        id: -1,
                        taskScaleId: vm.taskScale.id,
                        min: 35,
                        max: 40,
                        description: '',
                        color: vm.getColor(2),
                    },
                    {
                        id: -1,
                        taskScaleId: vm.taskScale.id,
                        min: 41,
                        max: 45,
                        description: '',
                        color: vm.getColor(1),
                    },
                    {
                        id: -1,
                        taskScaleId: vm.taskScale.id,
                        min: 45,
                        max: 50,
                        description: '',
                        color: vm.getColor(0),
                    }
                    ]
                }
                return [];
            }
            vm.generateScales = function () {

                vm.taskScale.taskScaleRanges = [];

                vm.taskScale.taskScaleRanges = vm.getRangesByKey(vm.taskScale.scaleStart + "_" + vm.taskScale.scaleEnd + "_" + vm.taskScale.scaleInterval);

                if (vm.taskScale.taskScaleRanges.length == 0) {
                    var step = (vm.taskScale.scaleEnd - vm.taskScale.scaleStart + 1) / vm.taskScale.scaleInterval;
                    var stepTop = Math.ceil((vm.taskScale.scaleEnd - vm.taskScale.scaleStart + 1) / vm.taskScale.scaleInterval);
                    var stepFloor = Math.floor((vm.taskScale.scaleEnd - vm.taskScale.scaleStart + 1) / vm.taskScale.scaleInterval);

                    //if (stepTop == stepFloor) { stepFloor = stepFloor - 1;}
                    for (var i = 0; i < vm.taskScale.scaleInterval; i++) {
                        var color = vm.getColor(i);

                        var range = {
                            id: -1,
                            taskScaleId: vm.taskScale.id,
                            min: Math.floor(vm.taskScale.scaleStart + (step * i)),
                            max: Math.floor(vm.taskScale.scaleStart + step * i + step - 1),
                            description: '',
                            color: color,
                        };
                        if (i == vm.taskScale.scaleInterval - 1) {
                            range.max = vm.taskScale.scaleEnd;
                        }
                        vm.taskScale.taskScaleRanges.push(range)
                    }
                }

                vm.fillGrid();
            };
            vm.saveTaskScale = function () {

                var item = angular.copy(vm.taskScale);
                item.organizationId = vm.organizationId;
                item.departmentId = vm.departmentId;
                item.teamId = vm.teamId;
                item.userId = vm.userId;

                if (item.id > 0) {
                    apiService.update("TaskScale", item).then(function (data) {
                        (data) ? notification($translate.instant('TRAININGDAIRY_TASK_SCALE_SAVED_SUCCESSFULLY')) : notification($translate.instant('TRAININGDAIRY_SAVE_FAILED'));
                    });
                }
                else {
                    apiService.add("TaskScale", item).then(function (data) {
                        vm.taskScale.id = data;
                        (vm.taskScale.id > 0) ? notification($translate.instant('TRAININGDAIRY_TASK_SCALE_SAVED_SUCCESSFULLY')) : notification($translate.instant('TRAININGDAIRY_SAVE_FAILED'));
                    });
                }

            }

            function onGridEditing(arg) {
                arg.container.find("input[name='name']").attr('maxlength', '50');
                arg.container.find("input[name='description']").attr('maxlength', '500');
            }

            vm.tasksCategoriesGridOptions = {
                dataSource: getDataSource(),
                sortable: true,
                pageable: true,
                edit: onGridEditing,
                editable: {
                    mode: "inline",
                    confirmation: false
                },
                columns: [
                    { field: "name", title: $translate.instant('COMMON_NAME'), width: 300 },
                    { field: "description", title: $translate.instant('COMMON_DESCRIPTION'), width: 300, template: "<div class='readmoreText' title='#= description #'>#= description # </div>" },
                    {
                        field: "color", title: $translate.instant('TRAININGDAIRY_BACKGROUND_COLOR'), width: "120px",
                        template: function (dataItem) {
                            return "<div style='background-color: " + dataItem.color + ";'>&nbsp;</div>";
                        },
                        editor: function (container, options) {
                            // create an input element
                            var input = $("<input/>");
                            // set its name to the field to which the column is bound ('name' in this case)
                            input.attr("name", options.field);
                            // append it to the container
                            input.appendTo(container);
                            // initialize a Kendo UI AutoComplete
                            input.kendoColorPicker({
                                value: options.model.Color,
                                buttons: false,
                                palette: "basic",
                            });
                        }
                    },
                    {
                        field: "textColor", title: $translate.instant('TRAININGDAIRY_TEXT_COLOR'), width: "120px",
                        template: function (dataItem) {
                            return "<div style='background-color: " + dataItem.textColor + ";'>&nbsp;</div>";
                        },
                        editor: function (container, options) {
                            // create an input element
                            var input = $("<input/>");
                            // set its name to the field to which the column is bound ('name' in this case)
                            input.attr("name", options.field);
                            // append it to the container
                            input.appendTo(container);
                            // initialize a Kendo UI AutoComplete
                            input.kendoColorPicker({
                                value: options.model.Color,
                                buttons: false,
                                palette: "basic",
                            });
                        }
                    },
                    {
                        command: [{ name: "edit", text: "", width: 30 },
                        {
                            name: "btnDelete", text: "", width: 30,
                            className: "btn-delete",
                            //template: "<a class=\"k-button k-button-icontext " ><span class=\"k-icon k-delete\"></span></a>",
                            click: function (e) {
                                e.preventDefault();
                                var tr = $(e.target).closest("tr");
                                /* get the current table row (tr) */
                                var data = this.dataItem(tr);
                                dialogService.showYesNoDialog($translate.instant('COMMON_CONFIRM'), $translate.instant('COMMON_ARE_YOU_SURE_YOU_WANT_TO_DELETE')).then(
                                    function () {
                                        if ((vm.organizationId) && (vm.settingsTypeId == 0)) {

                                            apiService.remove("TaskCategories/listItem", data.id).then(function (data) {
                                                var grid = $("#tasksCategoriesGrid").data("kendoGrid");
                                                var dataSource = getDataSource();
                                                grid.setDataSource(dataSource);
                                                grid.refresh();
                                            })
                                        }

                                        if ((vm.organizationId) && (vm.settingsTypeId == 1)) {
                                            apiService.remove("TaskPriorities/listItem", data.id).then(function (data) {
                                                var grid = $("#tasksCategoriesGrid").data("kendoGrid");
                                                var dataSource = getDataSource();
                                                grid.setDataSource(dataSource);
                                                grid.refresh();
                                            })
                                        }

                                        if ((vm.organizationId) && (vm.settingsTypeId == 2)) {
                                            apiService.remove("TaskStatuses/listItem", data.id).then(function (data) {
                                                var grid = $("#tasksCategoriesGrid").data("kendoGrid");
                                                var dataSource = getDataSource();
                                                grid.setDataSource(dataSource);
                                                grid.refresh();
                                            })
                                        }
                                    },
                                    function () {

                                    });
                            }
                        }], field: "actions", title: $translate.instant('COMMON_ACTIONS'), width: "150px", filterable: false, sortable: false,
                    },
                ],
            };

            vm.tasksGridOptions = {
                dataSource: getDataSource(),
                sortable: true,
                pageable: true,
                edit: onGridEditing,
                editable: {
                    mode: "inline",
                    confirmation: false
                },
                columns: [
                    { field: "name", title: $translate.instant('COMMON_NAME'), width: 300 },
                    { field: "description", title: $translate.instant('COMMON_DESCRIPTION'), width: 300, template: "<div class='readmoreText' title='#= description #'>#= description # </div>" },
                    {
                        command: [{ name: "edit", text: "", width: 30 },
                        {
                            name: "btnDelete", text: "", width: 30,
                            className: "btn-delete",
                            //template: "<a class=\"k-button k-button-icontext " ><span class=\"k-icon k-delete\"></span></a>",
                            click: function (e) {
                                e.preventDefault();
                                var tr = $(e.target).closest("tr");
                                /* get the current table row (tr) */
                                var data = this.dataItem(tr);
                                dialogService.showYesNoDialog($translate.instant('COMMON_CONFIRM'), $translate.instant('COMMON_ARE_YOU_SURE_YOU_WANT_TO_DELETE')).then(
                                    function () {
                                        if ((vm.organizationId) && (vm.settingsTypeId == 0)) {

                                            apiService.remove("TaskCategories/listItem", data.id).then(function (data) {
                                                var grid = $("#tasksCategoriesGrid").data("kendoGrid");
                                                var dataSource = getDataSource();
                                                grid.setDataSource(dataSource);
                                                grid.refresh();
                                            })
                                        }

                                        if ((vm.organizationId) && (vm.settingsTypeId == 1)) {
                                            apiService.remove("TaskPriorities/listItem", data.id).then(function (data) {
                                                var grid = $("#tasksCategoriesGrid").data("kendoGrid");
                                                var dataSource = getDataSource();
                                                grid.setDataSource(dataSource);
                                                grid.refresh();
                                            })
                                        }

                                        if ((vm.organizationId) && (vm.settingsTypeId == 2)) {
                                            apiService.remove("TaskStatuses/listItem", data.id).then(function (data) {
                                                var grid = $("#tasksCategoriesGrid").data("kendoGrid");
                                                var dataSource = getDataSource();
                                                grid.setDataSource(dataSource);
                                                grid.refresh();
                                            })
                                        }
                                    },
                                    function () {

                                    });
                            }
                        }], title: $translate.instant('COMMON_ACTIONS'), width: 60
                    },
                ],
            };

            vm.tooltipOptions = {
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

            function notification(message) {
                vm.notificationSavedSuccess.show(message, "info");
            }
        }])