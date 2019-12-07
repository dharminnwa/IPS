'use strict';

angular.module('ips.performanceGroups')

    .config(['$stateProvider', '$urlRouterProvider', 'profilesTypesEnum', function ($stateProvider, $urlRouterProvider, profilesTypesEnum) {
        var stateResolvePGEdit = {
            loadQuery: function () {
                return '&$filter=IsTemplate eq true';
            },
            performanceGroup: function ($stateParams, performanceGroupsService) {
                return performanceGroupsService.getById($stateParams.performanceGroupId, $stateParams.profileId);
            },
            profileTypeId: function () {
                return undefined;
            },
            isProfileInUse: function (performanceGroup, profilesService) {
                if (performanceGroup.profileId) {
                    return profilesService.isProfileInUse(performanceGroup.profileId);
                }
                return false;
            },
            organizations: function ($stateParams, performanceGroupsService) {
                return performanceGroupsService.getOrganizations();
            },
            industries: function ($stateParams, performanceGroupsService) {
                return performanceGroupsService.getIndustries();
            },
            profileLevels: function ($stateParams, performanceGroupsService) {
                return performanceGroupsService.getProfileLevels();
            },
            scales: function ($stateParams, performanceGroupsService) {
                return performanceGroupsService.getScales();
            },
            perspectives: function ($stateParams, performanceGroupsService, performanceGroup) {
                return performanceGroupsService.getPerspectives(performanceGroup.organizationId);
            },
            objectives: function ($stateParams, performanceGroupsService, performanceGroup) {
                return performanceGroupsService.getObjectives(performanceGroup.organizationId);
            },
            mainSkills: function ($stateParams, performanceGroupsService, performanceGroup) {
                return performanceGroupsService.getMainSkills(performanceGroup.organizationId);
            },
            isTemplateState: function () {
                return true;
            },
            questions: function (questionBankManager) {
                var query = "?$expand=Skills,ProfileType,Organization,Industry,StructureLevel&$filter=IsTemplate eq true";
                return questionBankManager.getQuestions(query).then(function (data) {
                    return data;
                });
            },
            trainingLevels: function ($stateParams, trainingsService) {
                return trainingsService.getTrainingLevels();
            },
            trainingTypes: function ($stateParams, trainingsService) {
                return trainingsService.getTrainingTypes();
            },
            duration: function (trainingsService) {
                return trainingsService.getDurationMetrics();
            },
            exMetrics: function (trainingsService) {
                return trainingsService.getExerciseMetrics();
            },
            notificationIntervals: function (trainingsService) {
                return trainingsService.getNotificationIntervals();
            },
            skills: function ($stateParams, trainingsService) {
                return trainingsService.getSkills();
            },
            inintQuestionTabService: function (questionTabService, performanceGroup) {
                return questionTabService.prepageQuestions(performanceGroup.link_PerformanceGroupSkills).then(function (data) {
                    return data;
                })
            }
        };
        var softStateResolvePGEdit = _.clone(stateResolvePGEdit);
        softStateResolvePGEdit.profileTypeId = function () {
            return profilesTypesEnum.soft;
        };
        var ktStateResolvePGEdit = _.clone(stateResolvePGEdit);
        ktStateResolvePGEdit.profileTypeId = function () {
            return profilesTypesEnum.knowledgetest;
        };

        var stateResolvePGEditFromProfile = {
            loadQuery: function ($stateParams) {
                return "&$filter=ProfileId eq " + $stateParams.profileId;
            },
            performanceGroup: function ($stateParams, performanceGroupsService) {
                return performanceGroupsService.getById($stateParams.performanceGroupId, $stateParams.profileId);
            },
            profileTypeId: function () {
                return undefined;
            },
            isProfileInUse: function (performanceGroup, profilesService) {
                if (performanceGroup.profileId) {
                    return profilesService.isProfileInUse(performanceGroup.profileId);
                }
                return false;
            },
            organizations: function ($stateParams, performanceGroupsService) {
                return performanceGroupsService.getOrganizations();
            },
            industries: function ($stateParams, performanceGroupsService) {
                return performanceGroupsService.getIndustries();
            },
            profileLevels: function ($stateParams, performanceGroupsService) {
                return performanceGroupsService.getProfileLevels();
            },
            scales: function ($stateParams, performanceGroupsService) {
                return performanceGroupsService.getScales();
            },
            perspectives: function ($stateParams, performanceGroupsService) {
                return performanceGroupsService.getPerspectives($stateParams.organizationId);
            },
            objectives: function ($stateParams, performanceGroupsService) {
                return performanceGroupsService.getObjectives($stateParams.organizationId);
            },
            mainSkills: function ($stateParams, performanceGroupsService) {
                return performanceGroupsService.getMainSkills($stateParams.organizationId);
            },
            isTemplateState: function () {
                return false;
            },
            questions: function (questionBankManager) {
                var query = "?$expand=Skills,ProfileType,Organization,Industry,StructureLevel&$filter=IsTemplate eq true";
                return questionBankManager.getQuestions(query).then(function (data) {
                    return data;
                });
            },
            trainingLevels: function ($stateParams, trainingsService) {
                return trainingsService.getTrainingLevels();
            },
            trainingTypes: function ($stateParams, trainingsService) {
                return trainingsService.getTrainingTypes();
            },
            duration: function (trainingsService) {
                return trainingsService.getDurationMetrics();
            },
            exMetrics: function (trainingsService) {
                return trainingsService.getExerciseMetrics();
            },
            notificationIntervals: function (trainingsService) {
                return trainingsService.getNotificationIntervals();
            },
            skills: function ($stateParams, trainingsService) {
                return trainingsService.getSkills();
            },
            inintQuestionTabService: function (questionTabService, performanceGroup) {
                return questionTabService.prepageQuestions(performanceGroup.link_PerformanceGroupSkills).then(function (data) {
                    return data;
                })
            }
        };
        var softStateResolvePGEditFromProfile = _.clone(stateResolvePGEditFromProfile);
        softStateResolvePGEditFromProfile.profileTypeId = function () {
            return profilesTypesEnum.soft;
        };
        var ktStateResolvePGEditFromProfile = _.clone(stateResolvePGEditFromProfile);
        ktStateResolvePGEditFromProfile.profileTypeId = function () {
            return profilesTypesEnum.knowledgetest;
        };

        $stateProvider
            .state('home.profiles.soft.performanceGroups.edit', {
                url: "/edit/:performanceGroupId",
                templateUrl: "views/performanceGroups/performanceGroups.edit.html",
                controller: "SoftPerformanceGroupEditCtrl",
                resolve: softStateResolvePGEdit,
                data: {
                    displayName: '{{ performanceGroup.viewName }}',
                    paneLimit: 1,
                    depth: 4,
                    resource: "Profiles"
                }
            })
            .state('home.profiles.soft.edit.performanceGroups.edit', {
                url: "/edit/:performanceGroupId",
                templateUrl: "views/performanceGroups/performanceGroups.edit.html",
                controller: "SoftPerformanceGroupEditCtrl",
                resolve: softStateResolvePGEditFromProfile,
                data: {
                    displayName: '{{ performanceGroup.viewName }}',
                    paneLimit: 1,
                    depth: 5,
                    resource: "Profiles"
                }
            })
            .state('home.profiles.knowledgetest.performanceGroups.edit', {
                url: "/edit/:performanceGroupId",
                templateUrl: "views/performanceGroups/performanceGroups.edit.html",
                controller: "KTPerformanceGroupEditCtrl",
                resolve: ktStateResolvePGEdit,
                data: {
                    displayName: '{{ performanceGroup.viewName }}',
                    paneLimit: 1,
                    depth: 4,
                    resource: "Profiles"
                }
            })
            .state('home.profiles.knowledgetest.edit.performanceGroups.edit', {
                url: "/edit/:performanceGroupId",
                templateUrl: "views/performanceGroups/performanceGroups.edit.html",
                controller: "KTPerformanceGroupEditCtrl",
                resolve: ktStateResolvePGEditFromProfile,
                data: {
                    displayName: '{{ performanceGroup.viewName }}',
                    paneLimit: 1,
                    depth: 5,
                    resource: "Profiles"
                }
            });
    }])

    .controller('BasePerformanceGroupEditCtrl', ['$scope', '$location', 'authService', 'apiService', '$stateParams',
        '$window', '$rootScope', 'cssInjector', 'profilesService', 'performanceGroupsService', '$state', 'dialogService',
        'performanceGroup', 'isProfileInUse', 'industries', 'profileLevels', 'scales', 'perspectives', 'objectives', 'mainSkills',
        'organizations', 'isTemplateState', 'loadQuery', 'questions', 'trainingLevels', 'trainingTypes', 'skills', 'duration', 'exMetrics', 'notificationIntervals', 'questionTabService',
        'profilesTypesEnum', 'profileTypeId', '$interval', '$translate',
        function ($scope, $location, authService, apiService, $stateParams, $window, $rootScope, cssInjector, profilesService,
                  performanceGroupsService, $state, dialogService, performanceGroup, isProfileInUse, industries, profileLevels, scales,
                  perspectives, objectives, mainSkills, organizations, isTemplateState, loadQuery, questions, trainingLevels,
            trainingTypes, skills, duration, exMetrics, notificationIntervals, questionTabService, profilesTypesEnum, profileTypeId, $interval, $translate) {
            $scope.performanceGroup = performanceGroup;
            $scope.questions = questions;
            $scope.isProfileInUse = isProfileInUse;
            $scope.authService = authService;
            if ($scope.performanceGroup.id == 0) {
                $scope.action = authService.actions.Create;
            } else {
                $scope.action = authService.actions.Update;
            }


            function isRemoveDisabled() {
                if ($scope['Performance Groups' + $scope.performanceGroup.organizationId] == undefined) {
                    $scope['Performance Groups' + $scope.performanceGroup.organizationId] = !authService.hasPermition($scope.performanceGroup.organizationId, 'Performance Groups', authService.actions.Delete);
                }
                return $scope['Performance Groups' + $scope.performanceGroup.organizationId];
            }

            function isDisabled() {
                if ($scope['Performance Groups' + $scope.performanceGroup.organizationId] == undefined) {
                    $scope['Performance Groups' + $scope.performanceGroup.organizationId] = !authService.hasPermition($scope.performanceGroup.organizationId, 'Performance Groups', $scope.action);
                }
                return $scope['Performance Groups' + $scope.performanceGroup.organizationId];
            }

            $scope.isDisabled = isDisabled;
            $scope.isRemoveDisabled = isRemoveDisabled;

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

            if ($scope.selectedProfile) {
                $scope.performanceGroup.organizationId = $scope.selectedProfile.organizationId;
            }

            if ($scope.selectedProfile) {
                $scope.performanceGroup.jobPositions = $scope.selectedProfile.jobPositions;
            }

            if ($scope.selectedProfile) {
                $scope.performanceGroup.profileTypes = [{ id: $scope.selectedProfile.profileTypeId, name: "Soft" }];
            }
            else {
                $scope.performanceGroup.profileTypes = [{
                    id: profileTypeId, name: _.findKey(profilesTypesEnum, function (prfType) {
                        return prfType == profileTypeId;
                    })
                }];
            }

            if ($scope.selectedProfile) {
                $scope.performanceGroup.industry = $scope.selectedProfile.industry;
                $scope.performanceGroup.industryId = $scope.selectedProfile.industryId;
            }

            $scope.industries = industries;
            $scope.industry = { id: -1, name: "" };
            $scope.structureLevels = profileLevels;
            $scope.scale = performanceGroup.scale;
            $scope.scales = scales;
            $scope.organizations = organizations;


            //$scope.performanceGroup.isTemplate = isTemplateState;
            $scope.isTemplateState = isTemplateState;

            $scope.skillPrototype = { id: 0, name: "", description: "", scale: null };
            $scope.pgSkill = {
                mainSkillId: null,
                mainSkill: angular.copy($scope.skillPrototype),
                subSkillId: null,
                subSkill: angular.copy($scope.skillPrototype)
            };

            $scope.mainSkillRadio = 0;
            $scope.newSkill = {};
            $scope.mainSkills = mainSkills;
            $scope.duration = duration;
            $scope.exMetrics = exMetrics;
            $scope.notificationIntervals = notificationIntervals;
            $scope.selectProfileTypesOptions = {
                placeholder: $translate.instant('SOFTPROFILE_SELECT_PROFILE_TYPES'),
                dataTextField: "name",
                dataValueField: "id",
                valuePrimitive: false,
                autoBind: false,
                dataSource: {
                    type: "json",
                    transport: {
                        read: function (options) {
                            apiService.getAll("ProfileType?$select=Id,Name&$orderby=Name").then(function (data) {
                                options.success(data);
                            })
                        }
                    }
                }
            };

            $scope.selectJobPositionsOptions = {
                placeholder: $translate.instant('SOFTPROFILE_SELECT_TARGET_AUDIENCE'),
                dataTextField: "jobPosition1",
                dataValueField: "id",
                valuePrimitive: false,
                autoBind: false,
                dataSource: {
                    type: "json",
                    transport: {
                        read: function (options) {
                            apiService.getAll("JobTitles?$select=Id,JobPosition1&$orderby=JobPosition1").then(function (data) {
                                options.success(data);
                            })
                        }
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
            };

            //#region Skills Tab
            $scope.pgSkills = [];

            angular.forEach($scope.performanceGroup.link_PerformanceGroupSkills, function (key, value) {

                if (key.skill) {
                    key.skillName = key.skill.name;
                    key.skillDescription = key.skill.description;
                    if ((key.skill.scale) && (key.skill.scale.scaleRanges)) {
                        key.ranges = key.skill.scale.scaleRanges
                    } else {
                        key.ranges = [];
                    }
                    key.skillId = key.skill.id;
                    key.name = key.skill.name;
                    key.code = "MS";
                    key["subSkillName"] = "";
                    key["subSkillDescription"] = "";
                }

                if (key.skill1) {
                    key.subSkill = key.skill1;
                    key.subSkillId - key.skill1.id;
                    key.subSkillName = key.skill1.name;
                    key.subSkillDescription = key.skill1.description;
                    if ((key.skill1.scale) && (key.skill1.scale.scaleRanges)) {
                        key.ranges = key.skill1.scale.scaleRanges
                    }
                    else {
                        key.ranges = [];
                    }
                    key.skill1Id = key.skill1.id;
                    key.name = key.skill1.name;
                    key.code = "SS";
                }

                key.id = key.skillId + "_" + key.skill1Id;

                this.push(key);
            }, $scope.pgSkills);

            $scope.skills = new kendo.data.ObservableArray($scope.pgSkills);

            $scope.skillsDataSource = new kendo.data.DataSource({
                type: "json",
                data: $scope.skills,
                pageSize: 10,
                schema: {
                    model: {
                        id: "id",
                        fields: {
                            id: { type: 'string', },
                            skillName: { type: 'string' },
                            subSkillName: { type: 'string' },
                            //skillDescription: { type: 'string' },
                            subSkillDescription: { type: 'string' },
                        }
                    }
                },
                sort: {
                    field: "skillName",
                    dir: "asc"
                },
                filter: { field: "name", operator: "neq", value: "Select Skill..." }
            });

            $scope.getSkillBenchmarkPoints = function (skillId) {
                var benchmark = _.find($scope.skills, function (value) {
                    return value.id === skillId;
                }).benchmark;
                var skillId = parseInt(skillId);
                var allPoints = _.sum(
                    _.filter(questionTabService.questions,
                        function (question) {
                            return question.skillId == skillId
                        }
                    ),
                    function (q) {
                        return q.points;
                    }
                );
                return "" + Math.ceil(allPoints * benchmark / 100) + " of " + allPoints;
            }

            $scope.updateBenchmark = function (skillId) {
                var gridBenchmark = $('.benchmark' + skillId)
                if (gridBenchmark[0]) {
                    var gridBenchmarkValue = gridBenchmark[0].value;
                    var dbSkill = _.find($scope.skills, function (value) {
                        return value.id === skillId;
                    });
                    if (dbSkill) {
                        var intBenchmark = parseInt(gridBenchmarkValue);
                        if (intBenchmark) {
                            dbSkill.benchmark = intBenchmark;
                        }
                        else {
                            dbSkill.benchmark = 0;
                        }
                    }
                    if ($scope.profileTypeId == profilesTypesEnum.knowledgetest) {
                        if ($('.benchmarkPoints' + skillId).length > 0) {
                            $('.benchmarkPoints' + skillId)[0].value = $scope.getSkillBenchmarkPoints(skillId);
                        }
                    }
                }
            }

            $scope.startListenBenchmark = function (skillId) {
                $scope.benchmarkSkillId = skillId;
                $scope.oldBenchmarkValue = $('.benchmark' + skillId)[0].value;
                $scope.benchmarkListener = $interval(function () {
                    var currentBenchmarkValue = $('.benchmark' + skillId)[0].value;
                    if ($scope.oldBenchmarkValue != currentBenchmarkValue) {
                        $scope.updateBenchmark($scope.benchmarkSkillId);
                        $scope.oldBenchmarkValue = currentBenchmarkValue;
                    }
                }, 500);
            }

            $scope.stopListenBenchmark = function () {
                $interval.cancel($scope.benchmarkListener);
                $scope.benchmarkListener = undefined;
                $scope.benchmarkSkillId = null;
            }


            if (($scope.performanceGroup.profile) && (($scope.performanceGroup.profile.scaleSettingsRuleId == 4) || ($scope.performanceGroup.profile.scaleSettingsRuleId == 5))) {
                $scope.skillsGridOptions = {
                    dataSource: $scope.skillsDataSource,
                    dataBound: $scope.onUserAssignGridDataBound,
                    columns: [
                        { field: "skillName", title: $translate.instant('COMMON_SKILL'), width: "100px" },
                        { field: "skillDescription", title: $translate.instant('SOFTPROFILE_SKILL_DESCRIPTION'), width: "170px", template: "<div class='readmoreText' title='#= skillDescription #'>#= skillDescription # </div>" },
                        { field: "subSkillName", title: $translate.instant('SOFTPROFILE_SUB_SKILL'), width: "110px" },
                        {
                            field: "subSkillDescription", title: $translate.instant('SOFTPROFILE_SUB_SKILL_DESCRIPTION'), width: "200px",
                            template: "<div class='readmoreText' title='#= subSkillDescription #'>#= subSkillDescription # </div>"
                        },
                        {
                            field: "benchmark",
                            title: $translate.instant('SOFTPROFILE_BENCHMARK'),
                            width: "120px",
                            template: function (dataItem) {
                                return "<input style='width:100%' " + (isDisabled() ? "disabled=\"disabled\"" : "") + " class='form-control tab-control benchmark" +
                                    dataItem.id + "' type='number' ng-focus=\"startListenBenchmark('"
                                    + dataItem.id + "')\" ng-blur=\"stopListenBenchmark()\" min='0'  value='" + dataItem.benchmark + "'/>";
                            }
                        },
                        {
                            field: "weight",
                            title: $translate.instant('SOFTPROFILE_WEIGHT'),
                            width: "90px",
                            template: function (dataItem) {
                                return "<input style='width:100%' " + (isDisabled() ? "disabled=\"disabled\"" : "") + " name='weight#= id #' class='form-control tab-control weight#= id #' type='text' ng-model='dataItem.weight' min='0'  value='#= weight ? weight : 0 #'/>"
                            }
                        },
                        {
                            field: "csf",
                            title: $translate.instant('SOFTPROFILE_CSF'),
                            width: "60px",
                            template: function (dataItem) {
                                return "<input style='width:100%' " + (isDisabled() ? "disabled=\"disabled\"" : "") + " name='csf#= id #' class='form-control tab-control csf#= id #' type='text' ng-model='dataItem.csf' min='0'  value='#= csf ? csf : '' #'/>"
                            }
                        },
                        {
                            field: "action",
                            title: $translate.instant('COMMON_ACTION'),
                            width: "110px",
                            template: "<input style='width:100%' " + (isDisabled() ? "disabled=\"disabled\"" : "") + " name='action#= id #' class='form-control tab-control action#= id #' type='text' ng-model='dataItem.action' min='0'  value='#= action ? action : '' #'/>"
                        },
                        {
                            field: "ranges", title: $translate.instant('SOFTPROFILE_SCALE_RANGES'), width: "150px",
                            template: function (dataItem) {
                                var ranges = "";

                                angular.forEach(dataItem.ranges, function (key, value) {
                                    ranges += "<div style='background-color:" + key.color + "'>&nbsp;</div>";
                                });

                                return "<div ng-repeat='ta in dataItem.ranges'> " + ranges + "</div>";
                            },
                        },
                        {
                            field: "actions", title: $translate.instant('COMMON_ACTIONS'), width: "100px", hidden: isDisabled(),
                            template: function (dataItem) {
                                var res = "<div class='icon-groups'>"

                                if (!isDisabled()) {
                                    res += "<a class='fa fa-pencil fa-lg' title='Edit Skill' ng-click=\"editSkill('" + dataItem.skillId + "')\"></a>"

                                    if (dataItem.subSkillId) {
                                        res += "<a class='fa fa-copy fa-lg' title='Edit Sub-Skill' ng-click=\"editSkill('" + dataItem.subSkillId + "')\"></a>"
                                    }

                                    res += "<a class='fa fa-trash fa-lg' ng-click=\"deleteSkill('" + dataItem.skillId + "',$index)\"></a>"
                                }

                                res += "</div>"
                                return res;
                            },
                        },
                    ],
                    sortable: true,
                    pageable: true,
                    filterable: true,
                };
            }
            else if (profileTypeId == profilesTypesEnum.knowledgetest) {

                $scope.skillsGridOptions = {
                    dataSource: $scope.skillsDataSource,
                    dataBound: $scope.onUserAssignGridDataBound,
                    columns: [
                        { field: "skillName", title: $translate.instant('COMMON_SKILL'), width: "100px" },
                        { field: "skillDescription", title: $translate.instant('SOFTPROFILE_SKILL_DESCRIPTION'), width: "170px", template: "<div class='readmoreText' title='#= skillDescription #'>#= skillDescription # </div>" },
                        { field: "subSkillName", title: $translate.instant('SOFTPROFILE_SUB_SKILL'), width: "110px" },
                        { field: "subSkillDescription", title: $translate.instant('SOFTPROFILE_SUB_SKILL_DESCRIPTION'), width: "200px", template: "<div class='readmoreText' title='#= subSkillDescription #'>#= subSkillDescription # </div>" },
                        {
                            field: "benchmark",
                            title: $translate.instant('SOFTPROFILE_BENCHMARK') + ", %",
                            width: "120px",
                            template: function (dataItem) {
                                return "<input style='width:100%' " + (isDisabled() ? "disabled=\"disabled\"" : "") + " class='form-control tab-control benchmark" +
                                    dataItem.id + "' type='number' ng-focus=\"startListenBenchmark('"
                                    + dataItem.id + "')\" ng-blur=\"stopListenBenchmark()\" min='0'  value='" + dataItem.benchmark + "'/>";
                            }
                        },
                        {
                            field: "benchmark",
                            title: $translate.instant('SOFTPROFILE_BENCHMARK_POINTS'),
                            width: "150px",
                            template: function (dataItem) {
                                return "<div style='text-align: center;' class='benchmarkPoints" + dataItem.id + "'>{{getSkillBenchmarkPoints('" + dataItem.id + "')}}</div>";
                            }
                        },
                        {
                            field: "weight",
                            title: $translate.instant('SOFTPROFILE_WEIGHT'),
                            width: "90px",
                            template: function (dataItem) {
                                return "<input style='width:100%' " + (isDisabled() ? "disabled=\"disabled\"" : "") + " name='weight#= id #' class='form-control tab-control weight#= id #' type='text' ng-model='dataItem.weight' min='0'  value='#= weight ? weight : 0 #'/>"
                            }
                        },
                        {
                            field: "csf",
                            title: $translate.instant('SOFTPROFILE_CSF'),
                            width: "70px",
                            template: function (dataItem) {
                                return "<input style='width:100%' " + (isDisabled() ? "disabled=\"disabled\"" : "") + " name='csf#= id #' class='form-control tab-control csf#= id #' type='text' ng-model='dataItem.csf' min='0'  value='#= csf ? csf : '' #'/>"
                            }
                        },
                        {
                            field: "action",
                            title: $translate.instant('COMMON_ACTION'),
                            width: "100px",
                            template: "<input style='width:100%' " + (isDisabled() ? "disabled=\"disabled\"" : "") + " name='action#= id #' class='form-control tab-control action#= id #' type='text' ng-model='dataItem.action' min='0'  value='#= action ? action : '' #'/>"
                        },
                        {
                            field: "actions", title: $translate.instant('COMMON_ACTIONS'), width: "100px", hidden: isDisabled(),
                            template: function (dataItem) {
                                var res = "<div class='icon-groups'>"

                                if (!isDisabled()) {
                                    res += "<a class='fa fa-pencil fa-lg' ng-click=\"editSkill('" + dataItem.skillId + "')\"></a>"

                                    if (dataItem.subSkillId) {
                                        res += "<a class='fa fa-copy fa-lg' title='Edit Sub-Skill' ng-click=\"editSkill('" + dataItem.subSkillId + "')\"></a>"
                                    }

                                    res += "<a class='fa fa-trash fa-lg' ng-click=\"deleteSkill('" + dataItem.skillId + "')\"></a>"
                                }

                                res += "</div>"
                                return res;
                            },
                        },
                    ],
                    sortable: true,
                    pageable: true,
                };
            }
            else {
                $scope.skillsGridOptions = {
                    dataSource: $scope.skillsDataSource,
                    dataBound: $scope.onUserAssignGridDataBound,
                    columns: [
                        { field: "skillName", title: $translate.instant('COMMON_SKILL'), width: "100px" },
                        { field: "skillDescription", title: $translate.instant('SOFTPROFILE_SKILL_DESCRIPTION'), width: "170px", template: "<div class='readmoreText' title='#= skillDescription #'>#= skillDescription # </div>" },
                        { field: "subSkillName", title: $translate.instant('SOFTPROFILE_SUB_SKILL'), width: "110px" },
                        { field: "subSkillDescription", title: $translate.instant('SOFTPROFILE_SUB_SKILL_DESCRIPTION'), width: "200px", template: "<div class='readmoreText' title='#= subSkillDescription #'>#= subSkillDescription # </div>" },
                        {
                            field: "benchmark",
                            title: $translate.instant('SOFTPROFILE_BENCHMARK'),
                            width: "120px",
                            template: function (dataItem) {
                                return "<input style='width:100%' " + (isDisabled() ? "disabled=\"disabled\"" : "") + " class='form-control tab-control benchmark" +
                                    dataItem.id + "' type='number' ng-focus=\"startListenBenchmark('"
                                    + dataItem.id + "')\" ng-blur=\"stopListenBenchmark()\" min='0'  value='" + dataItem.benchmark + "'/>";
                            }
                        },
                        {
                            field: "weight",
                            title: $translate.instant('SOFTPROFILE_WEIGHT'),
                            width: "90px",
                            template: function (dataItem) {
                                return "<input style='width:100%' " + (isDisabled() ? "disabled=\"disabled\"" : "") + " name='weight#= id #' class='form-control tab-control weight#= id #' type='text' ng-model='dataItem.weight' min='0'  value='#= weight ? weight : 0 #'/>"
                            }
                        },
                        {
                            field: "csf",
                            title: $translate.instant('SOFTPROFILE_CSF'),
                            width: "60px",
                            template: function (dataItem) {
                                return "<input style='width:100%' " + (isDisabled() ? "disabled=\"disabled\"" : "") + " name='csf#= id #' class='form-control tab-control csf#= id #' type='text' ng-model='dataItem.csf' min='0'  value='#= csf ? csf : '' #'/>"
                            }
                        },
                        {
                            field: "action",
                            title: $translate.instant('COMMON_ACTION'),
                            width: "100px",
                            template: "<input style='width:100%' " + (isDisabled() ? "disabled=\"disabled\"" : "") + " name='action#= id #' class='form-control tab-control action#= id #' type='text' ng-model='dataItem.action' min='0'  value='#= action ? action : '' #'/>"
                        },
                        {
                            field: "actions", title: $translate.instant('COMMON_ACTIONS'), width: "100px", hidden: isDisabled(),
                            template: function (dataItem) {
                                var res = "<div class='icon-groups'>"

                                if (!isDisabled()) {
                                    res += "<a class='fa fa-pencil fa-lg' ng-click=\"editSkill('" + dataItem.skillId + "')\"></a>"

                                    if (dataItem.subSkillId) {
                                        res += "<a class='fa fa-copy fa-lg' title='Edit Sub-Skill' ng-click=\"editSkill('" + dataItem.subSkillId + "')\"></a>"
                                    }

                                    res += "<a class='fa fa-trash fa-lg' ng-click=\"deleteSkill('" + dataItem.skillId + "')\"></a>"
                                }

                                res += "</div>"
                                return res;
                            },
                        },
                    ],
                    sortable: true,
                    pageable: true,
                };
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

            $scope.addSkillFromTemplate = function () {
                performanceGroupsService.addSkillFromTamplateDialog($scope.performanceGroup.organizationId, profileTypeId).then(function (pgSkill) {
                    var item = _.find($scope.skills, function (skill) {
                        return skill.skillId == pgSkill.skillId;
                    });

                    if (!item) {
                        pgSkill.action = "";
                        pgSkill.benchmark = 0;
                        pgSkill.weight = 0;
                        pgSkill.csf = "";
                        $scope.skills.push(pgSkill);
                        questionTabService.initializeSkills($scope.skills);
                    }
                },
                    function () {

                    });
            }

            $scope.mainSkillChanged = function (skillId) {
                var mainSkill = angular.copy($scope.private.getById(skillId, $scope.mainSkills));
                $scope.pgSkill.mainSkill.id = 0;
                $scope.pgSkill.mainSkill.name = mainSkill.name;
                $scope.pgSkill.mainSkill.description = mainSkill.description;
            }

            $scope.addSkill = function () {
                apiService.add("skills", $scope.pgSkill.mainSkill).then(function (id) {
                    $scope.pgSkill.mainSkill.id = id;
                    $scope.pgSkill.skillName = $scope.pgSkill.mainSkill.name;
                    $scope.pgSkill.name = $scope.pgSkill.mainSkill.name;
                    $scope.pgSkill.skillDescription = $scope.pgSkill.mainSkill.description;
                    $scope.pgSkill.skillId = $scope.pgSkill.mainSkill.id;
                    $scope.mainSkills.push($scope.pgSkill.mainSkill);

                    if ($scope.pgSkill.skillId > 0) {
                        $scope.addSubSkill();
                        dialogService.showNotification($translate.instant('SOFTPROFILE_MAIN_SKILL_SAVED_SUCCESSFULLY'), 'info');
                    } else {
                        dialogService.showNotification($translate.instant('SOFTPROFILE_SAVE_FAILED'), 'warning');
                    }
                }, function (error) {
                    dialogService.showNotification(error, "warning");
                });

            }

            $scope.addSubSkill = function () {
                $scope.pgSkill.action = "";
                $scope.pgSkill.benchmark = 0;
                $scope.pgSkill.weight = 0;
                $scope.pgSkill.csf = "";

                var subSkillName = $scope.pgSkill.subSkill.name;
                var subSkillDescription = $scope.pgSkill.subSkill.description;

                if ($scope.pgSkill.subSkill.name != "") {
                    $scope.pgSkill.subSkill.parentId = $scope.pgSkill.skillId;
                    apiService.add("skills", $scope.pgSkill.subSkill).then(function (id) {
                        $scope.pgSkill.subSkill.id = id;
                        $scope.pgSkill.subSkillId = id;
                        $scope.pgSkill.subSkillName = subSkillName;
                        $scope.pgSkill.subSkillDescription = subSkillDescription;

                        if ($scope.pgSkill.subSkillId > 0) {
                            $scope.pgSkill.id = $scope.pgSkill.skillId + "_" + $scope.pgSkill.subSkillId;
                            $scope.skills.push(angular.copy($scope.pgSkill));
                            dialogService.showNotification($translate.instant('SOFTPROFILE_SUB_SKILL_SAVED_SUCCESSFULLY'), 'info');
                        } else {
                            dialogService.showNotification($translate.instant('SOFTPROFILE_SAVE_FAILED'), 'warning');
                        }
                    }, function (error) {
                        dialogService.showNotification(error, "warning");
                    });
                } else {
                    $scope.pgSkill.subSkillName = "";
                    $scope.pgSkill.subSkillDescription = "";
                    $scope.pgSkill.subSkillId = 0;
                    $scope.pgSkill.id = $scope.pgSkill.skillId + "_";

                    $scope.skills.push(angular.copy($scope.pgSkill));
                }

                $scope.pgSkill.mainSkill = angular.copy($scope.skillPrototype);
                $scope.pgSkill.subSkill = angular.copy($scope.skillPrototype);
            }

            $scope.editSkill = function (id) {
                if (id) {
                    $location.path($location.path() + '/editSkill/' + id);
                }
            }

            $scope.deleteSkill = function (id) {
                dialogService.showYesNoDialog($translate.instant('COMMON_CONFIRM'), $translate.instant('COMMON_ARE_YOU_SURE_YOU_WANT_TO_DELETE')).then(
                    function () {

                        var item = _.find($scope.skills, function (skill) {
                            return skill.skillId == id;
                        });

                        if (item) {
                            var index = $scope.skills.indexOf(item);
                            var trainingitem = $scope.private.getById(id, $scope.trainings)
                            var TrainingIndex = $scope.skills.indexOf(trainingitem);


                            apiService.remove("RemoveSkillFromPerformanceGroup/" + $scope.performanceGroup.id, id).then(function (data) {
                                if (data == true) {

                                    performanceGroupsService.remove(index);
                                    $scope.trainings.splice(TrainingIndex, 1);
                                    $scope.skills.splice(index, 1);
                                    $scope.trainingsGridOptions.dataSource.sync();
                                    console.log($('#TrainingGrid').data('kendoGrid'));

                                    // $scope.trainingsGridOptions.dataSource.refresh();
                                    // $('#QuestionGrid').data('kendoGrid').dataSource.read();
                                    // $('#QuestionGrid').data('kendoGrid').refresh();
                                    // alert($('#QuestionGrid').data('kendoGrid'));
                                    //  $('#TrainingGrid').data('kendoGrid').dataSource.read();
                                    //   $('#TrainingGrid').data('kendoGrid').refresh();
                                    profilesService.updateTree();

                                }
                            }, function (message) {
                                dialogService.showNotification(message, 'warning');
                            });
                        }
                    },
                    function () {

                    });

            }

            $scope.mainSkillscaleUpdate = function (scaleId) {
                $scope.pgSkill.mainSkill.scale = $scope.private.getById(scaleId, $scope.scales);
            }
            //#endregion

            //#region Trainings Tab

            var trainingTemplate = {
                id: 0,
                name: "",
                why: "",
                how: "",
                what: "",
                additionalInfo: "",
                organizationId: null,
                skills: [],
                skillId: null,
                typeId: null,
                levelId: null,
                isTemplate: false,
                isActive: true,
                trainingMaterials: []
            };

            $scope.training = trainingTemplate;
            $scope.trainingLevels = trainingLevels;
            $scope.trainingTypes = trainingTypes;
            $scope.organizations = organizations;
            $scope.trainings = [];

            angular.forEach($scope.performanceGroup.link_PerformanceGroupSkills, function (key, value) {
                if (key.trainings.length > 0) {
                    angular.forEach(key.trainings, function (keyTraining, value) {
                        if (keyTraining.skills.length > 0) {
                            keyTraining.skillName = keyTraining.skills[0].name;
                            keyTraining.skill = keyTraining.skills[0];
                            keyTraining.skillId = keyTraining.skills[0].id;
                        }
                        $scope.trainings.push(keyTraining);
                    });
                }
            });

            $scope.trainings = new kendo.data.ObservableArray($scope.trainings);

            $scope.trainingsDataSource = new kendo.data.DataSource({
                type: "json",
                data: $scope.trainings,
                pageSize: 10,
                schema: {
                    model: {
                        id: "id",
                        fields: {
                            id: { type: 'number', nullable: true, editable: false },
                            name: { type: 'string', editable: false },
                            description: { type: 'string' },
                        }
                    }
                }
            });

            $scope.trainingsGridOptions = {
                dataSource: $scope.trainingsDataSource,
                dataBound: $scope.onUserAssignGridDataBound,
                columns: [
                    {
                        field: "code", title: "#", width: 30, template: function (dataItem) {
                            if (dataItem.skill) {
                                if (dataItem.skill.parentId) {
                                    return "<div>SS</div>";
                                }
                                else {
                                    return "<div>MS</div>";
                                }

                            }
                            else {
                                return "";
                            }
                        },
                    },
                    { field: "skillName", title: $translate.instant('COMMON_SKILL'), width: 150, values: $scope.skills, defaultValue: null },
                    { field: "name", title: $translate.instant('COMMON_TRAINING'), width: 150, },
                    {
                        field: "actions", title: $translate.instant('COMMON_ACTIONS'), width: 50,
                        template: function (dataItem) {
                            return "<div class='icon-groups'><a class='icon-groups icon-groups-item edit-icon' ng-click='editTraining(" + dataItem.id + ")' ></a><a class='icon-groups icon-groups-item delete-icon' ng-click='deleteTraining(" + dataItem.id + ")'></a></div>";
                        },
                    },
                ],
                sortable: true,
                pageable: true,
            };

            $scope.addTraining = function () {
                $location.path($location.path() + '/editTraining/0');
            }

            $scope.editTraining = function (id) {
                $location.path($location.path() + '/editTraining/' + id);
            }


            $scope.addTrainingFromTemplate = function () {
                var parameters = [{ key: "IsTemplate", value: true }];
                var getQuery = "";
                if ($scope.trainings) {
                    for (var i = 0; i < $scope.trainings.length; i++) {
                        getQuery += "(Id ne " + $scope.trainings[i].id + ")and";
                    }
                }
                getQuery += "(IsTemplate eq true)and(";
                angular.forEach($scope.skills, function (key, index) {
                    var skillId = key.skillId;
                    if (key.code == 'SS') {
                        skillId = key.skill1Id;
                    }
                    if (skillId) {
                        if (index <= 1) {
                            getQuery += "(Skills/any(s:s/Id eq " + skillId + "))"
                        } else {
                            getQuery += "or(Skills/any(s:s/Id eq " + skillId + "))"
                        }
                    }
                });
                getQuery += ")";

                getQuery += "&$expand=Skills";

                dialogService.showSelectableGridDialog($translate.instant('SOFTPROFILE_SELECT_TRAINING'), "name", "Trainings", "Name", getQuery, parameters, true).then(
                    function (data) {
                        angular.forEach(data, function (keyTraining, index) {
                            if (keyTraining.skills.length > 0) {
                                keyTraining.skillName = keyTraining.skills[0].name;
                                keyTraining.skill = keyTraining.skills[0];
                                keyTraining.skillId = keyTraining.skills[0].id;
                            }
                            $scope.trainings.push(keyTraining);
                        });
                    });
            }

            $scope.deleteTraining = function (id) {
                dialogService.showYesNoDialog($translate.instant('COMMON_CONFIRM'), $translate.instant('COMMON_ARE_YOU_SURE_YOU_WANT_TO_DELETE')).then(
                    function () {
                        var item = $scope.private.getById(id, $scope.trainings);
                        var index = $scope.trainings.indexOf(item);
                        $scope.trainings.splice(index, 1);
                    },
                    function () {
                        //alert('No clicked');
                    });
            }

            //#endregion

            //#region BSC Tab
            $scope.perspectives = perspectives;
            $scope.objectives = new kendo.data.ObservableArray(objectives);
            angular.forEach($scope.objectives, function (key, value) {
                var item = $scope.private.getById(key.id, $scope.performanceGroup.scorecardGoals);
                if (item) {
                    key.isSelected = true;
                } else {
                    key.isSelected = false;
                }

            });

            $scope.objectivesDataSource = new kendo.data.DataSource({
                type: "json",
                data: $scope.objectives,
                pageSize: 10,
                schema: {
                    model: {
                        id: "id",
                        fields: {
                            id: {
                                type: 'number',
                            },
                            title: {
                                type: 'string'
                            },
                            description: {
                                type: 'string'
                            },
                        }
                    }
                }
            });

            $scope.objectivesGridOptions = {
                dataSource: $scope.objectivesDataSource,
                dataBound: $scope.onUserAssignGridDataBound,
                columns: [
                    {
                        field: "isSelected", title: $translate.instant('COMMON_SELECT'), width: 50,
                        template: function (dataItem) {
                            return "<input type='checkbox' data-ng-model='dataItem.isSelected' ng-disabled=\"isDisabled()\">";
                        },
                    },
                    {
                        field: "title", title: $translate.instant('COMMON_TITLE'), width: 150
                    },
                    { field: "description", title: $translate.instant('COMMON_DESCRIPTION'), width: 150, template: "<div class='readmoreText' title='#= description #'>#= description # </div>" },
                ],
                sortable: true,
                pageable: true,
            };

            //#endregion

            $scope.bindIndustry = function () {
                if ($scope.performanceGroup.industry == null) {
                    $scope.performanceGroup.rootIndustryId = null;
                    $scope.performanceGroup.subIndustryId = null;
                }
                else if ($scope.performanceGroup.industry.parentId != null) {
                    $scope.industry = $scope.private.getById($scope.performanceGroup.industry.parentId, $scope.industries);
                    $scope.performanceGroup.rootIndustryId = $scope.performanceGroup.industry.parentId;
                    $scope.performanceGroup.subIndustryId = $scope.performanceGroup.industry.id;
                }
                else if ($scope.performanceGroup.industry.id > 0) {
                    $scope.performanceGroup.rootIndustryId = $scope.performanceGroup.industry.id;
                    $scope.performanceGroup.subIndustryId = null;
                }
                else {
                    $scope.performanceGroup.rootIndustryId = null;
                    $scope.performanceGroup.subIndustryId = null;
                }
            }

            $scope.industryUpdate = function (industryId) {
                $scope.industry = $scope.private.getById(industryId, $scope.industries);
                $scope.performanceGroup.industryId = industryId;
                $scope.performanceGroup.subIndustryId = null;
            }

            $scope.subIndustryUpdate = function (subIndustryId) {
                $scope.performanceGroup.industryId = subIndustryId;
            }

            $scope.scaleUpdate = function (scaleId) {
                $scope.scale = $scope.private.getById(scaleId, $scope.scales);
                $scope.performanceGroup.scale = $scope.scale;
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

            $scope.performanceGroupSave = function () {
                if (!questionTabService.validateQuestionsOrder()) {
                    return;
                }

                var item = angular.copy($scope.performanceGroup);

                item.industry = null;
                item.profile = null;
                item.link_PerformanceGroupSkills = null;
                item.trainings = null;
                item.goals = null;
                item.questions = null;
                if (($scope.performanceGroup.profile) && (($scope.performanceGroup.profile.scaleSettingsRuleId == 2) || ($scope.performanceGroup.profile.scaleSettingsRuleId == 5))) {
                    if (item.scaleId != null) {
                        item.scale.id = item.scaleId;
                    }
                }
                else {
                    item.scale = null;
                    item.scaleId = null;
                }

                item.scorecardGoals = []
                angular.forEach($scope.objectives, function (key, value) {
                    if (key.isSelected) {
                        item.scorecardGoals.push(key);
                    }
                });

                if (item.id > 0) {
                    apiService.update("Performance_groups", item).then(function (data) {
                        profilesService.updateTree();
                        var skillIds = [];
                        angular.forEach($scope.skills, function (key, value) {
                            this.push({
                                id: 0,
                                skillId: key.skillId,
                                subSkillId: key.subSkillId,
                                benchmark: key.benchmark,
                                weight: key.weight,
                                csf: key.csf,
                                action: key.action
                            });
                        }, skillIds);

                        apiService.update("Performance_groups/" + item.id + "/skills", skillIds).then(function (data) {
                            var trainingIds = [];
                            angular.forEach($scope.trainings, function (key, value) {
                                this.push({ trainingId: key.id, skillId: key.skillId });
                            }, trainingIds);

                            apiService.update("Performance_groups/" + item.id + "/trainings", trainingIds).then(function (data) {
                                apiService.update("Performance_groups/" + item.id + "/questions", questionTabService.questions).then(function (data) {
                                    $scope.performanceGroup.id = item.id;
                                    performanceGroupsService.load(loadQuery);
                                    dialogService.showNotification($translate.instant('SOFTPROFILE_PERFORMANCE_GROUP_SAVED_SUCCESSFULLY'), 'info');
                                }, $scope.showError);
                            }, $scope.showError);
                        }, $scope.showError);
                    }, $scope.showError);
                }
                else {
                    apiService.add("Performance_groups", item).then(function (id) {
                        profilesService.updateTree();
                        if (id > 0) {
                            item.id = id;
                            $scope.performanceGroup.id = id;
                            var skillIds = [];
                            angular.forEach($scope.skills, function (key, value) {
                                this.push({
                                    id: 0,
                                    skillId: key.skillId,
                                    subSkillId: key.subSkillId,
                                    benchmark: key.benchmark,
                                    weight: key.weight,
                                    csf: key.csf,
                                    action: key.action
                                });
                            }, skillIds);

                            apiService.update("Performance_groups/" + item.id + "/skills", skillIds).then(function (data) {
                                var trainingIds = [];
                                angular.forEach($scope.trainings, function (key, value) {
                                    this.push({ trainingId: key.id, skillId: key.skillId });
                                }, trainingIds);
                                apiService.update("Performance_groups/" + item.id + "/trainings", trainingIds).then(function (data) {
                                    apiService.update("Performance_groups/" + item.id + "/questions", questionTabService.questions).then(function (data) {
                                        $scope.performanceGroup.id = item.id;
                                        performanceGroupsService.load(loadQuery);
                                        dialogService.showNotification($translate.instant('SOFTPROFILE_PERFORMANCE_GROUP_SAVED_SUCCESSFULLY'), 'info');
                                        $location.path($location.path() + item.id);
                                    }, $scope.showError)
                                }, $scope.showError);
                            }, $scope.showError);
                        }
                        else {
                            $scope.showError($translate.instant('SOFTPROFILE_SAVE_FAILED'))
                        }
                    }, $scope.showError);
                }
            }

            $scope.removePerformanceGroup = function () {
                dialogService.showYesNoDialog($translate.instant('COMMON_CONFIRM'), $translate.instant('SOFTPROFILE_ARE_YOU_SURE_YOU_WANT_TO_DELETE_THIS_PERFORMANCE_GROUP_WITH_ALL_ITS_RELATED_SKILLS_QUESTIONS_TRAININGS_AND_BSC_PERSPECTIVES')).then(
                    function () {
                        var item = $scope.private.getById($scope.performanceGroup.id, performanceGroupsService.list());
                        var index = performanceGroupsService.list().indexOf(item);
                        //  apiService.remove("Performance_groups", id).then(function (data) {
                        console.log(profilesService.updateTree());
                        performanceGroupsService.update();
                        apiService.remove("Performance_groups", $scope.performanceGroup.id).then(function (data) {
                            if (data) {
                                performanceGroupsService.remove(index);
                                profilesService.updateTree();
                                $state.go('^', null, { reload: true });
                            }
                        });
                    },
                    function () {
                    });
            }

            $scope.showError = function (error) {
                dialogService.showNotification(error, "warning");
            }

            $scope.back = function () {
                $state.go('^', null, { reload: true });
            }

            $scope.bindIndustry();
        }]);