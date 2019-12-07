(function () {
    'use strict';

    angular
        .module('ips.performance')

        .controller('scorecardCtrl', scorecardCtrl);

    scorecardCtrl.$inject = ['cssInjector', '$scope', /*'$state',*/ '$stateParams', '$location', /*'$q', */'scorecardsService', 'organizations', 'dashboardsService', 'projects', 'profilesTypesEnum', 'softProfileTypesEnum', 'ktProfileTypesEnum', 'profileStatusEnum', 'passScoreIndicator', 'surveyService', '$translate'];

    function scorecardCtrl(cssInjector, $scope, /*$state,*/ $stateParams, $location, /*$q,*/ scorecardsService, organizations, dashboardsService, projects, profilesTypesEnum, softProfileTypesEnum, ktProfileTypesEnum, profileStatusEnum, passScoreIndicator, surveyService, $translate) {
        //Used on Organization > Scorecard
        cssInjector.removeAll();
        cssInjector.add('views/performance/scorecard/scorecard.css');

        $scope.scorecard = this;
        $scope.scorecard.profileTypeId = 0;
        $scope.scorecard.performanceGroups = [];
        $scope.scorecard.organizations = organizations;
        $scope.scorecard.projects = projects;
        $scope.scorecard.evolutionStageId = 0;
        $scope.scorecard.mainEvolutionStageId = 0;
        $scope.scorecard.departments = [];
        $scope.scorecard.teams = [];
        $scope.scorecard.profiles = [{ id: null, name: $translate.instant('COMMON_SELECT_PROFILE') + "..." }];
        $scope.scorecard.mainStepsOfProfile = [{ id: null, label: $translate.instant('DASHBOARD_SELECT_TYPE_OF_PROFILE') }, { id: 1, label: $translate.instant('DASHBOARD_START_PROFILE') }, { id: 2, label: $translate.instant('DASHBOARD_AGREED_FINAL_PROFILE') }, { id: 3, label: $translate.instant('DASHBOARD_INITIAL_KPI') }, { id: 4, label: $translate.instant('DASHBOARD_AGREED_FINAL_KPI') }];
        $scope.scorecard.stepsOfProfile = [{ id: null, label: $translate.instant('DASHBOARD_SELECT_TYPE_OF_PROFILE') }, { id: 1, label: $translate.instant('DASHBOARD_START_PROFILE') }, { id: 2, label: $translate.instant('DASHBOARD_AGREED_FINAL_PROFILE') }, { id: 3, label: $translate.instant('DASHBOARD_INITIAL_KPI') }, { id: 4, label: $translate.instant('DASHBOARD_AGREED_FINAL_KPI') }];
        $scope.scorecard.projectsOptions = [];
        $scope.scorecard.projectsModel = [];
        $scope.ktProfileTypes = {
            start: { id: 1, label: $translate.instant('COMMON_START_STAGE') },
            final: { id: 2, label: $translate.instant('COMMON_FINAL_STAGE') }
        };

        $scope.scorecard.projectId = null;

        $scope.scorecard.organizationId = $stateParams.organizationId && $stateParams.organizationId != "null" ? parseInt($stateParams.organizationId) : null;
        $scope.scorecard.departmentId = $stateParams.departmentId && $stateParams.departmentId != "null" ? parseInt($stateParams.departmentId) : null;
        $scope.scorecard.teamId = $stateParams.teamId && $stateParams.teamId != "null" ? parseInt($stateParams.teamId) : null;
        $scope.scorecard.profileId = $stateParams.profileId && $stateParams.profileId != "null" ? parseInt($stateParams.profileId) : null;

        $scope.scorecard.mainStageId = $stateParams.mainStageId && $stateParams.mainStageId != "null" ? parseInt($stateParams.mainStageId) : null;
        $scope.scorecard.stageId = $stateParams.stageId && $stateParams.stageId != "null" ? parseInt($stateParams.stageId) : null;
        $scope.scorecard.mainProfileStepId = $stateParams.mainProfileStepId && $stateParams.mainProfileStepId != "null" ? parseInt($stateParams.mainProfileStepId) : null;
        $scope.scorecard.profileStepId = $stateParams.profileStepId && $stateParams.profileStepId != "null" ? parseInt($stateParams.profileStepId) : null;

        $scope.scorecard.stages = [{
            id: null, name: $translate.instant('COMMON_SELECT_STAGE') + "..."
        }];
        $scope.scorecard.mainStages = [{
            id: null, name: $translate.instant('COMMON_SELECT_STAGE') + "..."
        }];

        $scope.scorecard.isShowReport = false;
        $scope.scorecard.reportData = [];
        $scope.scorecard.participants = [];
        $scope.scorecard.mainParticipants = [];
        $scope.scorecard.mainEvaluators = [];
        $scope.scorecard.evaluators = [];

        $scope.scorecard.isShowBenchmark = $stateParams.isShowBenchmark == "true" ? true : false;
        $scope.scorecard.isShowGoal = false;
        $scope.scorecard.isShowCompareGoal = false;

        $scope.scorecard.evaluatorId = null;
        $scope.scorecard.groupBy = [{ id: 0, name: $translate.instant('COMMON_PERFORMANCE_GROUP') }, {
            id: 1, name: "Perspective"
        }];
        $scope.scorecard.groupById = 0;
        $scope.scorecard.legends = [];

        $scope.scorecard.isMainEvaluatorsEnabled = false;
        $scope.scorecard.isEvaluatorsEnabled = false;

        $scope.scorecard.showMainIniKpi = false;
        $scope.scorecard.showMainFinalKpi = false;

        $scope.scorecard.showCompareToIniKpi = false;
        $scope.scorecard.showCompareToFinalKpi = false;

        $scope.scorecard.showGrid = false;

        //changed start
        $scope.scorecard.profileChanged = profileChanged;
        $scope.scorecard.stageChanged = stagesHandler;
        $scope.scorecard.departmentChanged = departmentChanged;


        $scope.scorecard.profileTypes = [{
            id: 0, name: "All"
        }];
        _.forEach(_.keys(profilesTypesEnum), function (item) {
            var ProfileTypeName = item;
            if (item == "soft") {
                ProfileTypeName = $translate.instant('COMMON_SOFT_PROFILE');
            }
            else if (item == "knowledgetest") {
                ProfileTypeName = $translate.instant('LEFTMENU_KNOWLEDGE_PROFILE');
            }
            $scope.scorecard.profileTypes.push({
                id: profilesTypesEnum[item], name: ProfileTypeName
            });
        })

        $scope.profileStatusOptions = [{
            id: '', name: "Any"
        }]
        _.forEach(_.keys(profileStatusEnum), function (item) {
            var ProfileTypeName = item;
            if (item == "Active") {
                ProfileTypeName = $translate.instant('DASHBOARD_ACTIVE_PROFILE') //"Active Profile"
            }
            else if (item == "Inactive") {
                ProfileTypeName = $translate.instant('DASHBOARD_INACTIVE_PROFILE')//"Inactive Profile"
            }
            $scope.profileStatusOptions.push({
                id: profileStatusEnum[item], name: ProfileTypeName
            });
        })
        $scope.scorecard.profileStatus = '';
        $scope.profileStatusChanged = function () {
            //clearProfiles();
            clearParticipants();
            clearStages();
            clearProfileSteps()
            if ($scope.filter.profileTypeId == profilesTypesEnum.soft) {
                clearEvaluators();
            }
            dashboardsService.getProfiles($scope.scorecard.organizationId, "", $scope.scorecard.profileStatus).then(function (data) {
                if (data) {
                    $scope.scorecard.profiles = _.filter(data, function (item) {
                        if ($scope.scorecard.profileTypeId > 0) {
                            return item.profileTypeId == $scope.scorecard.profileTypeId
                        }
                        else {
                            return item;
                        }
                    });
                    $scope.scorecard.profiles.unshift({
                        id: null, name: $translate.instant('COMMON_SELECT_PROFILE') + "..."
                    });
                }
                else {
                    $scope.scorecard.profiles = [{
                        id: null, name: $translate.instant('COMMON_SELECT_PROFILE') + "..."
                    }];
                }
            });
        };

        $scope.scorecard.profileTypeId = 0;
        $scope.scorecard.profileTypeChanged = function () {
            $scope.scorecard.profiles = [{
                id: null, name: $translate.instant('COMMON_SELECT_PROFILE') + "..."
            }];
            clearParticipants();
            clearStages();
            clearProfileSteps()
            if ($scope.scorecard.profileTypeId == profilesTypesEnum.soft) {
                clearEvaluators();
            }
            if ($scope.scorecard.organizationId) {
                dashboardsService.getProfiles($scope.scorecard.organizationId, "").then(function (data) {
                    if (data) {
                        $scope.scorecard.profiles = _.filter(data, function (item) {
                            if ($scope.scorecard.profileTypeId > 0) {
                                return item.profileTypeId == $scope.scorecard.profileTypeId
                            }
                            else {
                                return item;
                            }
                        });
                        $scope.scorecard.profiles.unshift({
                            id: null, name: $translate.instant('COMMON_SELECT_PROFILE') + "..."
                        });
                    }
                    else {
                        $scope.scorecard.profiles = [{
                            id: null, name: $translate.instant('COMMON_SELECT_PROFILE') + "..."
                        }];
                    }
                });
                dashboardsService.getDepartments($scope.scorecard.organizationId).then(function (data) {
                    if (data) {
                        $scope.scorecard.departments = data;
                        $scope.scorecard.departmentsOptions = getMultiSelectOptions($scope.scorecard.departments);
                    }
                });
                dashboardsService.getTeams($scope.scorecard.organizationId, $scope.departmentsModel).then(function (data) {
                    if (data) {
                        $scope.scorecard.teams = data;
                        $scope.scorecard.teamsOptions = getMultiSelectOptions($scope.scorecard.teams);
                    }
                });
            }
            else if ($scope.scorecard.projectsModel.length > 0) {
                dashboardsService.getProjectProfiles($scope.scorecard.projectsModel, $scope.scorecard.profileStatus).then(function (data) {
                    $scope.scorecard.profiles = _.filter(data, function (item) {
                        if ($scope.scorecard.profileTypeId > 0) {
                            return item.profileTypeId == $scope.scorecard.profileTypeId
                        }
                        else {
                            return item;
                        }
                    });
                    $scope.scorecard.profiles.unshift({
                        id: null, name: $translate.instant('COMMON_SELECT_PROFILE') + "..."
                    });
                });
            }

        };

        $scope.scorecard.organizationChanged = organizationChanged;
        $scope.scorecard.projectChanged = projectChanged;
        $scope.scorecard.mainParticipantChanged = getEvaluatorsOfParticipant(1);
        $scope.scorecard.participantChanged = getEvaluatorsOfParticipant(2);

        $scope.scorecard.mainEvaluatorsChanged = getScorecardData;
        $scope.scorecard.evaluatorsChanged = getScorecardData;
        $scope.scorecard.teamChanged = profileChanged;
        $scope.scorecard.profileStepChanged = getScorecardData;
        $scope.scorecard.mainProfileStepChanged = getScorecardData;
        //changed end

        $scope.scorecard.goBack = goBack;
        $scope.scorecard.getScorecardData = getScorecardData;
        $scope.scorecard.getBenchmark = getBenchmark;
        $scope.scorecard.goToDevContract = goToDevContract;

        $scope.scorecard.smartButtonSettings = {
            smartButtonMaxItems: 3,
            smartButtonTextConverter: function (itemText, originalItem) {
                return itemText;
            },
            template: '<b>{{option.label}}</b>'
        };
        $scope.scorecard.projectsCustomTexts = { buttonDefaultText: $translate.instant('DASHBOARD_SELECT_PROJECTS') };
        $scope.scorecard.projectsEvents = {
            onItemSelect: function () {
                projectChanged();
            },
            onItemDeselect: function () {
                projectChanged();
            },
            onSelectAll: function () {
                projectChanged();
            },
            onDeselectAll: function () {
                projectChanged();
            }
        };

        $scope.scorecard.departmentsOptions = [];
        $scope.scorecard.departmentsModel = [];
        $scope.scorecard.departmentsCustomTexts = { buttonDefaultText: $translate.instant('TASKPROSPECTING_SELECT_DEPARTMENT') };
        $scope.scorecard.departmentsEvents = {
            onItemSelect: function () {
                departmentChanged();
            },
            onItemDeselect: function () {
                departmentChanged();
            },
            onSelectAll: function () {
                departmentChanged();
            },
            onDeselectAll: function () {
                departmentChanged();
            }
        };

        $scope.scorecard.teamsOptions = [];
        $scope.scorecard.teamsModel = [];
        $scope.scorecard.teamsCustomTexts = { buttonDefaultText: $translate.instant('TASKPROSPECTING_SELECT_TEAM') };
        $scope.scorecard.teamsEvents = {
            onItemSelect: function () {
                getParticipants();
            },
            onItemDeselect: function () {
                getParticipants();
            },
            onSelectAll: function () {
                getParticipants();
            },
            onDeselectAll: function () {
                getParticipants();
            }
        };

        $scope.scorecard.firstStageId = null;

        $scope.scorecard.mainStagesOptions = [];
        $scope.scorecard.mainStagesModel = [];
        $scope.scorecard.mainStagesEvents = {
            onItemSelect: function () {
                stagesHandler(1);
            },
            onItemDeselect: function () {
                stagesHandler(1);
            },
            onSelectAll: function () {
                stagesHandler(1);
            },
            onDeselectAll: function () {
                stagesHandler(1);
            }
        };

        $scope.scorecard.stagesOptions = [];
        $scope.scorecard.stagesModel = [];
        $scope.scorecard.stagesCustomTexts = { buttonDefaultText: $translate.instant('DASHBOARD_SELECT_STAGE') };
        $scope.scorecard.stagesEvents = {
            onItemSelect: function () {
                stagesHandler(2);
            },
            onItemDeselect: function () {
                stagesHandler(2);
            },
            onSelectAll: function () {
                stagesHandler(2);
            },
            onDeselectAll: function () {
                stagesHandler(2);
            }
        };

        $scope.scorecard.mainParticipantsOptions = [];
        $scope.scorecard.mainParticipantsModel = [];
        $scope.scorecard.mainParticipantsCustomTexts = { buttonDefaultText: $translate.instant('DASHBOARD_SELECT_MAIN_PARTICIPANTS') };
        $scope.scorecard.mainParticipantsEvents = {
            onItemSelect: function () {
                console.log($scope.scorecard.mainParticipantsModel);
                getEvaluatorsOfParticipant(1);
            },
            onItemDeselect: function () {
                getEvaluatorsOfParticipant(1);
            },
            onSelectAll: function () {
                getEvaluatorsOfParticipant(1);
            },
            onDeselectAll: function () {
                $scope.scorecard.mainParticipantsModel = [];
                getEvaluatorsOfParticipant(1);
            }
        };

        $scope.scorecard.mainEvaluatorsOptions = [];
        $scope.scorecard.mainEvaluatorsModel = [];
        $scope.scorecard.mainEvaluatorsCustomTexts = { buttonDefaultText: $translate.instant('DASHBOARD_SELECT_MAIN_EVALUATORS') };
        $scope.scorecard.mainEvaluatorsEvents = {
            onItemSelect: function () {
                getScorecardData();
            },
            onItemDeselect: function () {
                getScorecardData();
            },
            onSelectAll: function () {
                getScorecardData();
            },
            onDeselectAll: function () {
                $scope.scorecard.mainEvaluatorsModel = [];
                getScorecardData();
            }
        };

        $scope.scorecard.participantsOptions = [];
        $scope.scorecard.participantsModel = [];
        $scope.scorecard.participantsCustomTexts = { buttonDefaultText: $translate.instant('DASHBOARD_SELECT_PARTICIPANTS') };
        $scope.scorecard.participantsEvents = {
            onItemSelect: function (item) {
                getEvaluatorsOfParticipant(2);
            },
            onItemDeselect: function (item) {
                getEvaluatorsOfParticipant(2);
            },
            onSelectAll: function () {
                getEvaluatorsOfParticipant(2);
            },
            onDeselectAll: function () {
                getEvaluatorsOfParticipant(2);
            }
        };

        $scope.scorecard.evaluatorsOptions = [];
        $scope.scorecard.evaluatorsModel = [];
        $scope.scorecard.evaluatorsCustomTexts = { buttonDefaultText: $translate.instant('MYPROFILES_SELECT_EVALUATORS') };
        $scope.scorecard.evaluatorsEvents = {
            onItemSelect: function () {
                getScorecardData();
            },
            onItemDeselect: function () {
                getScorecardData();
            },
            onSelectAll: function () {
                getScorecardData();
            },
            onDeselectAll: function () {
                getScorecardData();
            }
        };

        $scope.scorecard.profileTypesCustomTexts = { buttonDefaultText: $translate.instant('SOFTPROFILE_SCALES_SELECT_PROFILE_TYPE') };

        $scope.scorecard.mainProfileTypesOptions = [];
        $scope.scorecard.mainProfileTypesModel = [];
        $scope.scorecard.mainProfileTypesEvents = {
            onItemSelect: function () {
                if ($scope.scorecard.mainParticipantsModel.length > 0) {
                    getScorecardData();
                }
            },
            onItemDeselect: function () {
                if ($scope.scorecard.mainParticipantsModel.length > 0) {
                    getScorecardData();
                }
            },
            onSelectAll: function () {
                if ($scope.scorecard.mainParticipantsModel.length > 0) {
                    getScorecardData();
                }
            },
            onDeselectAll: function () {
                if ($scope.scorecard.mainParticipantsModel.length > 0) {
                    getScorecardData();
                }
            }
        };

        $scope.scorecard.profileTypesOptions = [];
        $scope.scorecard.profileTypesModel = [];
        $scope.scorecard.profileTypesEvents = {
            onItemSelect: function () {
                if ($scope.scorecard.participantsModel.length > 0) {
                    getScorecardData();
                }
            },
            onItemDeselect: function () {
                if ($scope.scorecard.participantsModel.length > 0) {
                    getScorecardData();
                }
            },
            onSelectAll: function () {
                if ($scope.scorecard.participantsModel.length > 0) {
                    getScorecardData();
                }
            },
            onDeselectAll: function () {
                if ($scope.scorecard.participantsModel.length > 0) {
                    getScorecardData();
                }
            }
        };

        $scope.scorecard.statusFilterDisabled = false;


        //fill controls with data if redirected from a dashboard
        if ($stateParams.organizationId && $stateParams.profileId) {
            organizationChanged();
            getParticipants();
        }
        if ($stateParams.projectId) {

            dashboardsService.getProjects().then(function (data) {
                $scope.scorecard.projectsOptions = [];
                $scope.scorecard.projects = data;
                _.forEach($scope.scorecard.projects, function (item) {
                    $scope.scorecard.projectsOptions.push({ id: item.id, label: item.name });
                });

                angular.forEach($stateParams.projectId.split(';'), function (id) {
                    if (parseInt(id)) {
                        $scope.scorecard.projectsModel.push({ id: parseInt(id) });
                    }
                });
            });
        }
        else {
            dashboardsService.getProjects().then(function (data) {
                $scope.scorecard.projectsOptions = [];
                $scope.scorecard.projects = data;
                _.forEach($scope.scorecard.projects, function (item) {
                    $scope.scorecard.projectsOptions.push({ id: item.id, label: item.name });
                });

            });
        }

        //changed functions start
        function organizationChanged() {
            if ($scope.scorecard.organizationId) {
                dashboardsService.getProjects().then(function (data) {
                    $scope.scorecard.projectsOptions = [];
                    $scope.scorecard.projects = _.filter(data, function (item) {
                        return item.organizationId == $scope.scorecard.organizationId;
                    });
                    _.forEach($scope.scorecard.projects, function (item) {
                        $scope.scorecard.projectsOptions.push({ id: item.id, label: item.name });
                    });

                    if ($stateParams.projectId) {
                        angular.forEach($stateParams.projectId.split(';'), function (id) {
                            if (parseInt(id)) {
                                $scope.scorecard.projectsModel.push({ id: parseInt(id) });
                            }
                        });
                    }

                    //$scope.scorecard.projects = data;
                    //$scope.scorecard.projectsOptions = data;
                    //var pm = [];
                    //angular.forEach(data, function (item) {
                    //    pm.push({ id: item.id, label: item.name });
                    //});
                    //return pm;
                });

                dashboardsService.getProfiles($scope.scorecard.organizationId, "").then(function (data) {
                    if (data) {
                        //$scope.scorecard.profiles = data;

                        if ($scope.scorecard.projectsModel.length > 0) {
                            $scope.profiles = _.filter(data, function (item) {
                                var isFiltered = _.filter($scope.scorecard.projectsModel, function (projectItem) {
                                    return projectItem.id == item.projectId;
                                })
                                if (isFiltered.length > 0) {
                                    return true;
                                }
                                else {
                                    return false;
                                }
                            });
                        }
                        else {
                            $scope.profiles = data;
                        }

                        $scope.scorecard.profiles = _.filter(data, function (item) {
                            if ($scope.scorecard.profileTypeId > 0) {
                                return item.profileTypeId == $scope.scorecard.profileTypeId
                            }
                            else {
                                return item;
                            }
                        });
                        data.unshift({
                            id: null, name: $translate.instant('COMMON_SELECT_PROFILE') + "..."
                        });
                    }
                    else {
                        $scope.scorecard.profiles = [{
                            id: null, name: $translate.instant('COMMON_SELECT_PROFILE') + "..."
                        }];
                    }
                });
                dashboardsService.getDepartments($scope.scorecard.organizationId).then(function (data) {
                    if (data) {
                        $scope.scorecard.departments = data;
                        $scope.scorecard.departmentsOptions = getMultiSelectOptions($scope.scorecard.departments);
                    }
                });
                dashboardsService.getTeams($scope.scorecard.organizationId, $scope.scorecard.departmentsModel).then(function (data) {
                    if (data) {
                        $scope.scorecard.teams = data;
                        $scope.scorecard.teamsOptions = getMultiSelectOptions($scope.scorecard.teams);
                    }
                });
            }
        }
        function profileChanged() {
            clearParticipants();
            clearStages();
            clearProfileSteps()
            $scope.scorecard.mainStepsOfProfile = [];
            $scope.scorecard.stepsOfProfile = [];
            $scope.scorecard.profileTypeId = 0;
            if ($scope.scorecard.profileId > 0) {
                var selectedProfile = _.find($scope.scorecard.profiles, function (profile) {
                    return profile.id == $scope.scorecard.profileId;
                });
                if (selectedProfile) {
                    $scope.scorecard.profileTypeId = selectedProfile.profileTypeId;
                    if (selectedProfile.profileTypeId == profilesTypesEnum.soft) {
                        clearEvaluators();

                        $scope.scorecard.mainProfileStepId = softProfileTypesEnum.finalKpi.id;
                        $scope.scorecard.profileStepId = softProfileTypesEnum.finalKpi.ids;
                        $scope.scorecard.mainStepsOfProfile = getDefaultSoftProfileTypes();
                        $scope.scorecard.stepsOfProfile = getDefaultSoftProfileTypes();
                    }
                    else if (selectedProfile.profileTypeId == profilesTypesEnum.knowledgetest) {
                        $scope.scorecard.mainProfileStepId = $scope.ktProfileTypes.start.id;
                        $scope.scorecard.profileStepId = $scope.ktProfileTypes.start.id;
                        $scope.scorecard.mainStepsOfProfile = getDefaultKTProfileTypes();
                        $scope.scorecard.stepsOfProfile = getDefaultKTProfileTypes();
                    }
                }
            }
            getParticipants();
        }

        function projectChanged() {
            clearParticipants();
            clearStages();
            clearProfileSteps()

            $scope.scorecard.profileId = null;
            $scope.scorecard.profiles = [];
            $scope.scorecard.isShowReport = false;
            $scope.scorecard.reportData = [];
            $scope.scorecard.legends = [];
            if ($scope.scorecard) {
                if ($scope.scorecard.projectsModel.length > 0) {
                    dashboardsService.getProjectProfiles($scope.scorecard.projectsModel, $scope.scorecard.profileStatus).then(function (data) {
                        $scope.scorecard.profiles = _.filter(data, function (item) {
                            if ($scope.scorecard.profileTypeId > 0) {
                                return item.profileTypeId == $scope.scorecard.profileTypeId
                            }
                            else {
                                return item;
                            }
                        });
                        $scope.scorecard.profiles.unshift({
                            id: null, name: $translate.instant('COMMON_SELECT_PROFILE') + "..."
                        });
                    });
                }
                else if ($scope.scorecard.organizationId != null) {
                    dashboardsService.getProfiles($scope.scorecard.organizationId, "").then(function (data) {
                        if (data) {
                            $scope.scorecard.profiles = _.filter(data, function (item) {
                                if ($scope.scorecard.profileTypeId > 0) {
                                    return item.profileTypeId == $scope.scorecard.profileTypeId
                                }
                                else {
                                    return item;
                                }
                            });

                            if ($scope.scorecard.projectsModel.length > 0) {
                                $scope.scorecard.profiles = _.filter($scope.scorecard.profiles, function (item) {
                                    var isFiltered = _.filter($scope.scorecard.projectsModel, function (projectItem) {
                                        return projectItem.id == item.projectId;
                                    })
                                    if (isFiltered.length > 0) {
                                        return true;
                                    }
                                    else {
                                        return false;
                                    }
                                });
                            }
                            $scope.scorecard.profiles.unshift({
                                id: null, name: $translate.instant('COMMON_SELECT_PROFILE') + "..."
                            });
                        }
                        else {
                            $scope.scorecard.profiles = [{
                                id: null, name: $translate.instant('COMMON_SELECT_PROFILE') + "..."
                            }];
                        }
                    });
                }
                else {
                    $scope.scorecard.profiles = [];
                }
            }
        }
        function departmentChanged() {
            if ($scope.scorecard.organizationId) {
                dashboardsService.getTeams($scope.scorecard.organizationId, $scope.scorecard.departmentsModel).then(function (data) {
                    if (data) {
                        $scope.scorecard.teams = data;
                        $scope.scorecard.departmentsOptions = getMultiSelectOptions($scope.scorecard.departments);
                    }
                });
                if ($scope.scorecard.profileId) {
                    getParticipants();
                }
            }
        };

        $scope.GroupByChanged = function () {
            var obj = $("#scorecardGrid").data("kendoGrid");
            if (obj) {
                if ($scope.scorecard.groupById == 0) {
                    obj.dataSource.group({ field: "pgName" });
                }
                else {
                    obj.dataSource.group([]);
                }
            }
        }
        //changed functions end

        //get functions start
        function getEvaluatorsOfParticipant(type) {
            var usersSource;

            if (type === 1) {
                usersSource = $scope.scorecard.mainParticipantsModel;
            } else {
                usersSource = $scope.scorecard.participantsModel;
            }
            console.log(usersSource);
            if (!usersSource) return;
            //more than 1 main Participant - compare participant selected - SWITCH OFF evaluators
            if (usersSource.length > 1) {
                if (type === 1) {
                    $scope.scorecard.isMainEvaluatorsEnabled = false;
                    $scope.mainEvaluatorsModel = [];
                    $scope.scorecard.mainEvaluators = [];
                    if ($scope.scorecard.mainProfileStepId && $scope.scorecard.mainProfileStepId > 0) {
                        if ($scope.scorecard.profileTypeId == profilesTypesEnum.soft) {
                            getScorecardData();
                        }
                        else if ($scope.scorecard.profileTypeId == profilesTypesEnum.knowledgetest) {
                            getKTScorecardData();
                        }
                    }
                } else {
                    $scope.scorecard.isEvaluatorsEnabled = false;
                    $scope.evaluatorsModel = [];
                    $scope.scorecard.evaluators = [];
                    if (!$scope.scorecard.profileStepId) {
                        $scope.scorecard.profileStepId = $scope.scorecard.mainProfileStepId;
                    }
                    if ($scope.scorecard.profileStepId && $scope.scorecard.profileStepId > 0) {
                        if ($scope.scorecard.profileTypeId == profilesTypesEnum.soft) {
                            getScorecardData();
                        }
                        else if ($scope.scorecard.profileTypeId == profilesTypesEnum.knowledgetest) {
                            getKTScorecardData();
                        }

                    }
                }
            } else {

                dashboardsService.getEvaluatorsForParticipant(($scope.scorecard.profileId == undefined) ? $scope.scorecard.profileId : $scope.scorecard.profileId, usersSource).then(function (data) {
                    if (type === 1) {
                        $scope.scorecard.mainEvaluators = [];
                        $scope.scorecard.mainEvaluatorsOptions = [];
                    } else {
                        $scope.scorecard.evaluators = [];
                        $scope.scorecard.evaluatorsOptions = [];
                    }
                    angular.forEach(data, function (evaluator) {
                        if (type === 1) {
                            $scope.scorecard.mainEvaluators.push({ id: evaluator.participantId, name: evaluator.firstName + " " + evaluator.lastName });
                            $scope.scorecard.mainEvaluatorsOptions = getMultiSelectOptions($scope.scorecard.mainEvaluators);
                        } else {
                            $scope.scorecard.evaluators.push({ id: evaluator.participantId, name: evaluator.firstName + " " + evaluator.lastName });
                            $scope.scorecard.evaluatorsOptions = getMultiSelectOptions($scope.scorecard.evaluators);
                        }
                    });

                    if (type === 1) {
                        if ($scope.scorecard.mainEvaluators.length > 0) {
                            $scope.scorecard.isMainEvaluatorsEnabled = true;
                        }
                        if ($scope.scorecard.mainProfileStepId && $scope.scorecard.mainProfileStepId > 0) {
                            if ($scope.scorecard.profileTypeId == profilesTypesEnum.soft) {
                                getScorecardData();
                            }
                            else if ($scope.scorecard.profileTypeId == profilesTypesEnum.knowledgetest) {
                                getKTScorecardData();
                            }
                        }
                    }
                    if (type === 2) {
                        if ($scope.scorecard.evaluators.length > 0) {
                            $scope.scorecard.isEvaluatorsEnabled = true;
                        }
                        if (!$scope.scorecard.profileStepId) {
                            $scope.scorecard.profileStepId = $scope.scorecard.mainProfileStepId;
                        }
                        if ($scope.scorecard.profileStepId && $scope.scorecard.profileStepId > 0) {
                            if ($scope.scorecard.profileTypeId == profilesTypesEnum.soft) {
                                getScorecardData();
                            }
                            else if ($scope.scorecard.profileTypeId == profilesTypesEnum.knowledgetest) {
                                getKTScorecardData();
                            }
                        }
                    }
                });
            }
        }



        function getParticipants() {
            dashboardsService.getProfileStages($scope.scorecard.profileId, null, null).then(function (data) {
                $scope.scorecard.mainStages = [{
                    id: null, name: $translate.instant('DASHBOARD_SELECT_STAGE')
                }];
                $scope.scorecard.stages = [{
                    id: null, name: $translate.instant('DASHBOARD_SELECT_STAGE')
                }];
                $scope.scorecard.mainStagesRaw = [];
                $scope.scorecard.stagesRaw = [];

                angular.forEach(data, function (item, index) {
                    if (index == 0) {
                        $scope.scorecard.firstStageId = item.id;
                    }
                    $scope.scorecard.mainStages.push({ id: item.id, name: item.name + " (" + item.statusText + ")" });
                    $scope.scorecard.stages.push({ id: item.id, name: item.name + " (" + item.statusText + ")" });
                    $scope.scorecard.mainStagesRaw.push({ id: item.id, name: item.name });
                    $scope.scorecard.stagesRaw.push({ id: item.id, name: item.name });
                });

                if ($scope.scorecard.mainStages.length > 1) {
                    $scope.scorecard.mainStageId = $stateParams.mainStageId && $stateParams.mainStageId != "null" ? parseInt($stateParams.mainStageId) : $scope.scorecard.mainStages[1].id;
                    $scope.scorecard.mainStageName = $scope.scorecard.mainStagesRaw[0].name;
                    getProfileTypes(1, $scope.scorecard.mainStageId, $scope.scorecard.mainStages);
                    //$scope.scorecard.mainProfileStecpId = softProfileTypesEnum.finalKpi;
                    //$scope.scorecard.mainProfileStepId = 4;//$stateParams.mainProfileStepId && $stateParams.mainProfileStepId != "null" ? parseInt($stateParams.mainProfileStepId) : 1;
                } else {
                    $scope.scorecard.mainStageId = null;
                    $scope.scorecard.mainStageName = '';
                }

                if ($scope.scorecard.stages.length > 1) {
                    $scope.scorecard.stageId = $stateParams.stageId && $stateParams.stageId != "null" ? parseInt($stateParams.stageId) : $scope.scorecard.stages[1].id;
                    $scope.scorecard.stageName = $scope.scorecard.stagesRaw[0].name;
                    getProfileTypes(2, $scope.scorecard.stageId, $scope.scorecard.stages);
                    //$scope.scorecard.profileStepId = softProfileTypesEnum.finalKpi;
                    //$scope.scorecard.profileStepId = 4;//$stateParams.profileTypeId && $stateParams.profileTypeId != "null" ? parseInt($stateParams.profileTypeId) : 1;
                } else {
                    $scope.scorecard.stageId = null;
                    $scope.scorecard.stageName = '';
                }
                dashboardsService.getParticipantsBy($scope.scorecard.profileId, $scope.scorecard.mainStageId, $scope.scorecard.projectsModel, $scope.scorecard.departmentsModel, $scope.scorecard.teamsModel, $scope.scorecard.teamsModel, $scope.scorecard.profileStageGroupId).then(function (data) {

                    $scope.scorecard.mainParticipants = [];
                    $scope.scorecard.mainParticipantsOptions = [];
                    $scope.scorecard.mainParticipantsModel = [];

                    //redirect from a dashboard
                    if ($stateParams.mainParticipantIds) {
                        var model = [];
                        angular.forEach($stateParams.mainParticipantIds.split(';'), function (id) {
                            if (parseInt(id))
                                model.push({ id: parseInt(id) });
                        });
                        $scope.scorecard.mainParticipantsModel = model;
                        if (model.length > 0) {
                            $scope.scorecard.isMainEvaluatorsEnabled = true;
                            getEvaluatorsOfParticipant(1);
                        }
                    }

                    $scope.scorecard.mainEvaluators = [];
                    $scope.scorecard.mainEvaluatorsOptions = [];
                    $scope.mainEvaluatorsModel = [];
                    $scope.scorecard.isMainEvaluatorsEnabled = false;

                    if ($stateParams.mainEvaluatorIds) {
                        var model = [];
                        angular.forEach($stateParams.mainEvaluatorIds.split(';'), function (id) {
                            if (parseInt(id))
                                model.push({ id: parseInt(id) });
                        });
                        $scope.mainEvaluatorsModel = model;
                    }

                    angular.forEach(data, function (item) {
                        $scope.scorecard.mainParticipants.push({ id: item.participantId, name: item.firstName + " " + item.lastName });
                    });

                    if ($scope.scorecard.mainParticipants.length > 0) {
                        $scope.scorecard.mainParticipants.splice(0, 0,
                            {
                                id: -1, name: $translate.instant('SCORECARD_BENCHMARK')
                            }
                        );
                        $scope.scorecard.mainParticipantsOptions = getMultiSelectOptions($scope.scorecard.mainParticipants);
                        $scope.scorecard.mainParticipantsOptions = $scope.scorecard.mainParticipantsOptions;
                    }
                    if ($scope.scorecard.mainEvaluators.length > 0)
                        $scope.scorecard.mainEvaluatorsOptions = getMultiSelectOptions($scope.scorecard.mainEvaluators);


                });
                dashboardsService.getParticipantsBy($scope.scorecard.profileId, $scope.scorecard.stageId, $scope.scorecard.projectsModel, $scope.scorecard.departmentsModel, $scope.scorecard.teamsModel, $scope.scorecard.profileStageGroupId).then(function (data) {
                    $scope.scorecard.participants = [];
                    $scope.scorecard.participantsOptions = [];
                    $scope.scorecard.participantsModel = [];

                    //redirect from a dashboard
                    if ($stateParams.participantIds) {
                        var model = [];
                        angular.forEach($stateParams.participantIds.split(';'), function (id) {
                            if (parseInt(id))
                                model.push({ id: parseInt(id) });
                        });
                        $scope.scorecard.participantsModel = model;
                        if (model.length > 0) {
                            $scope.scorecard.isEvaluatorsEnabled = true;
                            getEvaluatorsOfParticipant(2);
                        }

                    }

                    $scope.scorecard.evaluators = [];
                    $scope.scorecard.evaluatorsOptions = [];
                    $scope.evaluatorsModel = [];
                    $scope.scorecard.isEvaluatorsEnabled = false;

                    if ($stateParams.evaluatorIds) {
                        var model = [];
                        angular.forEach($stateParams.evaluatorIds.split(';'), function (id) {
                            if (parseInt(id))
                                model.push({ id: parseInt(id) });
                        });
                        $scope.evaluatorsModel = model;
                    }

                    angular.forEach(data, function (item) {
                        $scope.scorecard.participants.push({ id: item.participantId, name: item.firstName + " " + item.lastName });
                    });

                    if ($scope.scorecard.participants.length > 0) {
                        $scope.scorecard.participants.splice(0, 0,
                            {
                                id: -1, name: $translate.instant('SCORECARD_BENCHMARK')
                            }
                        );
                        $scope.scorecard.participantsOptions = getMultiSelectOptions($scope.scorecard.participants);
                    }
                    if ($scope.scorecard.evaluators.length > 0)
                        $scope.scorecard.evaluatorsOptions = getMultiSelectOptions($scope.scorecard.evaluators);
                });
            });
            console.log($scope);
        }
        function getDefaultSoftProfileTypes() {
            var types = [];
            types.push(softProfileTypesEnum.startProfile);
            types.push(softProfileTypesEnum.finalProfile);
            types.push(softProfileTypesEnum.initialKPI);
            types.push(softProfileTypesEnum.finalKpi);
            return types;
        };
        function getDefaultKTProfileTypes() {
            var types = [];
            types.push($scope.ktProfileTypes.start);
            types.push($scope.ktProfileTypes.final);
            return types;
        }


        var clearParticipants = function () {
            $scope.participants = [];
            $scope.scorecard.mainParticipantsOptions = [];
            $scope.scorecard.mainParticipantsModel = [];
            $scope.scorecard.participantsOptions = [];
            $scope.scorecard.participantsModel = [];
        };
        var clearEvaluators = function () {
            $scope.scorecard.mainEvaluatorsModel = [];
            $scope.scorecard.evaluatorsModel = [];
            $scope.scorecard.mainEvaluatorsOptions = [];
            $scope.scorecard.evaluatorsOptions = [];
        };
        var clearStages = function () {
            $scope.scorecard.mainStageId = '';
            $scope.scorecard.stageId = '';
            $scope.scorecard.mainStages = [];
            $scope.scorecard.stages = [];
        };
        var clearProfileSteps = function () {
            $scope.scorecard.mainProfileStepId = null;
            $scope.scorecard.profileStepId = null;
            $scope.scorecard.mainStepsOfProfile = [];
            $scope.scorecard.stepsOfProfile = [];
        };
        function getProfileTypes(type, selectedStageId, optionsSource) {
            var source;
            if (selectedStageId === $scope.firstStageId) {
                source = [{
                    id: null, label: $translate.instant('DASHBOARD_SELECT_TYPE_OF_PROFILE')
                }, { id: 1, label: $translate.instant('DASHBOARD_START_PROFILE') }, { id: 2, label: $translate.instant('DASHBOARD_AGREED_FINAL_PROFILE') }, { id: 3, label: $translate.instant('DASHBOARD_INITIAL_KPI') }, {
                    id: 4, label: $translate.instant('DASHBOARD_AGREED_FINAL_KPI')
                }];
                if (type === 1) {
                    $scope.scorecard.isShowGoal = false;
                }
                if (type === 2) {
                    $scope.scorecard.isShowCompareGoal = false;
                }
            } else {
                source = [{
                    id: null, label: $translate.instant('DASHBOARD_SELECT_TYPE_OF_PROFILE')
                }, { id: 3, label: $translate.instant('SCORECARD_INITIAL_KPI_SCORES') }, {
                    id: 4, label: $translate.instant('SCORECARD_AGREED_FINAL_KPI_RESULTS')
                }];;
                if (type === 1) {
                    $scope.scorecard.isShowGoal = true;
                }
                if (type === 2) {
                    $scope.scorecard.isShowCompareGoal = true;
                }
            }
            //if (type === 1) {
            //    $scope.scorecard.mainStepsOfProfile = source;
            //}
            //if (type === 2) {
            //    $scope.scorecard.stepsOfProfile = source;
            //}
        }

        function getBenchmark() {
            var treelist = $("#scorecardGrid").data("kendoGrid");
            var targetColName = "target";
            if ($scope.scorecard.isShowBenchmark)
                treelist.showColumn(targetColName);
            else
                treelist.hideColumn(targetColName);
        };

        function getScaleRange(scaleRanges) {
            var range = scaleRanges[0].min + '-' + scaleRanges[scaleRanges.length - 1].max;
            return range;
        }

        function getScaleColor(scaleRanges, score) {
            for (var i = 0, len = scaleRanges.length; i < len; i++) {
                var maxRange;
                ((i + 1) == len) ? maxRange = scaleRanges[i].max : maxRange = (scaleRanges[i].max + 1);
                if (score >= scaleRanges[i].min && score < maxRange) {
                    return scaleRanges[i].color;
                }
                if ((i + 1) == len && score >= scaleRanges[i].min && score == maxRange) {
                    return scaleRanges[i].color;
                }
            }
        }

        function getNameById(selectedStageId, optionsSource) {
            var result;
            angular.forEach(optionsSource, function (option, index) {
                if (option.id === selectedStageId) {
                    result = option.name;
                }
            });
            return result;
        }

        function getById(id, myArray, searchParam) {
            (!searchParam) ? searchParam = 'id' : '';
            return myArray.filter(function (obj) {
                if (obj[searchParam] == id) {
                    return obj;
                }
            })[0];
        }

        function getLegendNames(model, color, participants, postfix) {
            var name = "";
            angular.forEach(model, function (m, mIndex) {
                //name += getById(model[mIndex].id, participants).label + postfix;
                var participantObj = getById(model[mIndex].id, participants);
                if (participantObj.label) {
                    name += participantObj.label;
                }
                else if (participantObj.name) {
                    name += participantObj.name;
                }
                name += postfix;
                if (model.length > 1 && mIndex != model.length - 1)
                    name += ", ";
            });
            return {
                color: color, name: name
            };
        }

        function getLabelTextFromOptions(profileTypeOptions, id) {
            var text = "";
            angular.forEach(profileTypeOptions, function (profileType, index) {
                if (id == profileType.id) {
                    text += profileType.label;
                }
            });
            return text;
        }

        function getMultiSelectOptions(data) {
            var options = [];
            angular.forEach(data, function (item, index) {
                options.push({ id: item.id, label: item.name });
            });
            return options;
        }

        function getScorecardData() {
            console.log($scope.scorecard);
            console.log("**getScorecardData**");
            if ($scope.scorecard.profileId != null) {
                $scope.scorecard.reportData = [];
                if ($scope.scorecard.profileType = profilesTypesEnum.soft) {
                    scorecardsService.loadScorecardData($scope.scorecard.profileId, $scope.scorecard.isShowBenchmark, $scope.scorecard.mainParticipantsModel, $scope.scorecard.mainEvaluatorsModel, $scope.scorecard.mainStageId, $scope.scorecard.mainProfileStepId, null).then(function (data) {
                        if (data && data.performanceGroups) {
                            var scaleRanges = data.scale.scaleRanges;
                            var scale = getScaleRange(scaleRanges);

                            var colorMainPart = "RGB(0,0,0)";
                            var colorMainEval = "orange";
                            var colorPart = "RGB(100,150,250)";
                            var colorEval = "purple";
                            var columnCount = 0;

                            if ($scope.scorecard.mainParticipantsModel.length > 0)
                                columnCount++;
                            if ($scope.scorecard.mainEvaluatorsModel.length > 0)
                                columnCount++;
                            if ($scope.scorecard.participantsModel.length > 0)
                                columnCount++;
                            if ($scope.scorecard.evaluatorsModel.length > 0)
                                columnCount++;

                            var columnWidth = 10 / columnCount; //20% available for maximum 8 columns
                            var columnWidthText = columnWidth + "%";

                            scorecardsService.loadScorecardData($scope.scorecard.profileId, $scope.scorecard.isShowBenchmark, $scope.scorecard.participantsModel, $scope.scorecard.evaluatorsModel, $scope.scorecard.stageId, $scope.scorecard.profileStepId, null).then(function (compareData) {

                                angular.forEach(data.performanceGroups, function (pg, pgIndex) {
                                    data.performanceGroups[pgIndex].compareScore = compareData.performanceGroups[pgIndex].score;
                                    data.performanceGroups[pgIndex].comparePerformance = compareData.performanceGroups[pgIndex].performance;

                                    angular.forEach(pg.skills, function (pgs, pgsIndex) {
                                        data.performanceGroups[pgIndex].skills[pgsIndex].compareScore = compareData.performanceGroups[pgIndex].skills[pgsIndex].score;
                                        //if benchmark is chosen from a dropdown
                                        if (data.performanceGroups[pgIndex].skills[pgsIndex].score != 0 && data.performanceGroups[pgIndex].skills[pgsIndex].performance == "0%")
                                            data.performanceGroups[pgIndex].skills[pgsIndex].performance = data.performanceGroups[pgIndex].skills[pgsIndex].score * 10 + "%";

                                        if (compareData.performanceGroups[pgIndex].skills[pgsIndex].score != 0 && compareData.performanceGroups[pgIndex].skills[pgsIndex].performance == "0%")
                                            data.performanceGroups[pgIndex].skills[pgsIndex].comparePerformance = compareData.performanceGroups[pgIndex].skills[pgsIndex].score * 10 + "%";
                                        else
                                            data.performanceGroups[pgIndex].skills[pgsIndex].comparePerformance = compareData.performanceGroups[pgIndex].skills[pgsIndex].performance;
                                    });
                                });

                                if (compareData.evaluatorsProfileScorecards && compareData.evaluatorsProfileScorecards.length > 0) {
                                    angular.forEach(compareData.evaluatorsProfileScorecards, function (esc, escIndex) {
                                        angular.forEach(esc.performanceGroups, function (epg, epgIndex) {
                                            angular.forEach(epg.skills, function (epgs, epgsIndex) {
                                                data.performanceGroups[epgIndex].skills[epgsIndex].compareScoreEval = esc.performanceGroups[epgIndex].skills[epgsIndex].score;
                                                data.performanceGroups[epgIndex].skills[epgsIndex].comparePerformanceEval = esc.performanceGroups[epgIndex].skills[epgsIndex].performance;
                                            });
                                        });
                                    });
                                }

                                if (data.evaluatorsProfileScorecards && data.evaluatorsProfileScorecards.length > 0) {
                                    angular.forEach(data.evaluatorsProfileScorecards, function (esc, escIndex) {
                                        angular.forEach(esc.performanceGroups, function (epg, epgIndex) {
                                            angular.forEach(epg.skills, function (epgs, epgsIndex) {
                                                data.performanceGroups[epgIndex].skills[epgsIndex].scoreEval = esc.performanceGroups[epgIndex].skills[epgsIndex].score;
                                                data.performanceGroups[epgIndex].skills[epgsIndex].performanceEval = esc.performanceGroups[epgIndex].skills[epgsIndex].performance;
                                            });
                                        });
                                    });
                                }
                                if ($scope.scorecard.groupById == 0) {

                                    var perspectives = [];
                                    var perspectiveData = [];
                                    if ($scope.scorecard.groupById == 1) {
                                        angular.forEach(data.performanceGroups, function (pg, pgIndex) {
                                            if (perspectives.indexOf(pg.perspective) == -1) {
                                                perspectives.push(pg.perspective);
                                                perspectiveData.push(pg);
                                            } else {
                                                var index = perspectives.indexOf(pg.perspective);
                                                perspectiveData[index].skills = data.performanceGroups[index].skills.concat(pg.skills);
                                            }
                                        });

                                        data.performanceGroups = perspectiveData;
                                    }

                                    $scope.scorecard.reportData = [];
                                    $scope.scorecard.reportData.isCompare = true;

                                    angular.forEach(data.performanceGroups, function (pg, pgIndex) {
                                        var pgItem = angular.copy(pg);
                                        pgItem.skills = null;
                                        pgItem.id = pgIndex;
                                        pgItem.parentId = null;
                                        if ($scope.scorecard.groupById == 0) {
                                            pgItem.pgName = pg.name;
                                        } else {
                                            pgItem.pgName = pg.name;
                                        }
                                        pgItem.sName = "";
                                        pgItem.target = "";
                                        pgItem.score = null;
                                        pgItem.compareScore = null;
                                        pgItem.comparePerformance = pg.comparePerformance ? pg.comparePerformance : '';
                                        pgItem.comparePerformanceEval = null;
                                        pgItem.scale = '';
                                        pgItem.baseline = pg.baseline ? pg.baseline : '';
                                        pgItem.color = '';
                                        pgItem.compareColor = '';
                                        pgItem.scoreEval = pgItem.scoreEval ? pgItem.scoreEval : null;
                                        pgItem.compareScoreEval = pgItem.compareScoreEval ? pgItem.compareScoreEval : null;
                                        pgItem.performanceEval = pgItem.performanceEval ? pgItem.performanceEval : '';
                                        pgItem.comparePerformanceEval = pgItem.comparePerformanceEval ? pgItem.comparePerformanceEval : '';

                                        //$scope.scorecard.reportData.push(pgItem);
                                        var pgname = pgItem.pgName;
                                        angular.forEach(pg.skills, function (pgs, pgsIndex) {
                                            var pgsItem = angular.copy(pgs);
                                            pgsItem.questions = null;
                                            pgsItem.id = (1 + pgIndex) * 1000 + pgsIndex;
                                            pgsItem.parentId = pgIndex;
                                            pgsItem.pgName = pgname;
                                            pgsItem.scale = scale;
                                            pgsItem.comparePerformance = pgs.comparePerformance ? pgs.comparePerformance : "";
                                            pgsItem.color = getScaleColor(scaleRanges, pgsItem.score) ? getScaleColor(scaleRanges, pgsItem.score) : "";
                                            pgsItem.compareColor = getScaleColor(scaleRanges, pgsItem.compareScore) ? getScaleColor(scaleRanges, pgsItem.compareScore) : "";
                                            pgsItem.target = pgs.benchmark;
                                            pgsItem.sName = pgs.name;

                                            pgsItem.compareScore = pgsItem.compareScore ? pgsItem.compareScore : null;
                                            pgsItem.comparePerformance = pgsItem.comparePerformance ? pgsItem.comparePerformance : "";
                                            pgsItem.scoreEval = pgsItem.scoreEval ? pgsItem.scoreEval : null;
                                            pgsItem.compareScoreEval = pgsItem.compareScoreEval ? pgsItem.compareScoreEval : null;
                                            pgsItem.performanceEval = pgsItem.performanceEval ? pgsItem.performanceEval : "";
                                            pgsItem.comparePerformanceEval = pgsItem.comparePerformanceEval ? pgsItem.comparePerformanceEval : "";

                                            if (pgsItem.score && ((pgsItem.scoreEval && !pgsItem.compareScore) || (!pgsItem.scoreEval && pgsItem.compareScore && !pgsItem.compareScoreEval))) {
                                                var ev = null;
                                                if (pgsItem.scoreEval != null)
                                                    ev = pgsItem.scoreEval;
                                                else if (pgsItem.compareScore != null)
                                                    ev = pgsItem.compareScore;

                                                if (ev != null) {
                                                    if (pgsItem.score == ev) {
                                                        pgsItem.trend = "Equal";
                                                        pgsItem.progress = null;
                                                    }
                                                    else {
                                                        
                                                        pgsItem.trend = (ev - pgsItem.score) < 0 ? "Down" : "Up";
                                                        pgsItem.progress = Math.ceil((ev - pgsItem.score) * 100 / pgsItem.score);
                                                        if ($scope.scorecard.mainParticipantsModel.length == 1 && $scope.scorecard.participantsModel.length == 1) {
                                                            if ($scope.scorecard.mainParticipantsModel[0].id == $scope.scorecard.participantsModel[0].id) {
                                                                if ($scope.scorecard.mainStageId < $scope.scorecard.stageId) {
                                                                    pgsItem.trend = ev > pgsItem.score ? "Up" : "Down";
                                                                }
                                                                else if ($scope.scorecard.mainStageId > $scope.scorecard.stageId) {
                                                                    pgsItem.trend = pgsItem.score > ev ? "Up" : "Down";
                                                                    pgsItem.progress = Math.ceil((pgsItem.score - ev) * 100 / ev);
                                                                }

                                                            }
                                                            else if ($scope.scorecard.participantsModel.length == 1) {
                                                                if ($scope.scorecard.participantsModel[0].id == -1) {
                                                                    pgsItem.trend = (pgsItem.score - ev) < 0 ? "Down" : "Up";
                                                                    pgsItem.progress = Math.ceil((pgsItem.score - ev) * 100 / ev);
                                                                }
                                                            }
                                                        }
                                                        else if ($scope.scorecard.participantsModel.length == 1) {
                                                            if ($scope.scorecard.participantsModel[0].id == -1) {
                                                                pgsItem.trend = (pgsItem.score - ev) < 0 ? "Down" : "Up";
                                                                pgsItem.progress = Math.ceil((pgsItem.score - ev) * 100 / ev);
                                                            }
                                                        }
                                                    }
                                                }
                                            }

                                            if (!(($scope.scorecard.mainProfileStepId == 3 || $scope.scorecard.mainProfileStepId == 4) && pgsItem.color == ""))
                                                $scope.scorecard.reportData.push(pgsItem);
                                        })
                                    });
                                    if ($("#scorecardGrid").length > 0) {
                                        var mainParticipant = { label: "" }
                                        var mainParticipantRow = "";
                                        var mainEvaluator = { name: "" }
                                        var comparedParticipant = { name: "" }
                                        var compareParticipantRow = "";
                                        var comparedEvaluator = { name: "" }

                                        if ($scope.scorecard.mainParticipantsModel) {
                                            if ($scope.scorecard.mainParticipantsModel.length > 0) {
                                                _.forEach($scope.scorecard.mainParticipantsModel, function (item) {
                                                    mainParticipant = _.find($scope.scorecard.mainParticipantsOptions, function (p) {
                                                        return p.id == item.id;
                                                    });

                                                    if (mainParticipant) {
                                                        mainParticipantRow += (mainParticipant.label) ? mainParticipant.label : (mainParticipant.name ? mainParticipant.name : "Main Participant");
                                                        mainParticipantRow += ",";
                                                    }
                                                })
                                            }
                                        }

                                        if ($scope.scorecard.mainEvaluatorsModel.length > 0) {
                                            mainEvaluator = _.find($scope.scorecard.mainEvaluators, function (p) {
                                                return p.id == $scope.scorecard.mainEvaluatorsModel[0].id;
                                            })
                                        }

                                        if ($scope.scorecard.participantsModel) {
                                            if ($scope.scorecard.participantsModel.length > 0) {


                                                _.forEach($scope.scorecard.participantsModel, function (item) {

                                                    comparedParticipant = _.find($scope.scorecard.participants, function (p) {
                                                        return p.id == item.id;
                                                    })
                                                    if (comparedParticipant) {
                                                        compareParticipantRow += comparedParticipant.label ? comparedParticipant.label : (comparedParticipant.name ? comparedParticipant.name : "Compare Participant");
                                                        compareParticipantRow += ",";
                                                    }
                                                })


                                            }
                                        }
                                        if ($scope.scorecard.participantsModel.length > 0) {
                                            comparedParticipant = _.find($scope.scorecard.participants, function (p) {
                                                return p.id == $scope.scorecard.participantsModel[0].id;
                                            })
                                        }
                                        if ($scope.scorecard.evaluatorsModel.length > 0) {
                                            comparedEvaluator = _.find($scope.scorecard.evaluators, function (p) {
                                                return p.id == $scope.scorecard.evaluatorsModel[0].id;
                                            })
                                        }

                                        if (mainParticipantRow.lastIndexOf(',') == mainParticipantRow.length - 1) {
                                            mainParticipantRow = mainParticipantRow.substring(0, mainParticipantRow.length - 1)
                                        }
                                        if (compareParticipantRow.lastIndexOf(',') == compareParticipantRow.length - 1) {
                                            compareParticipantRow = compareParticipantRow.substring(0, compareParticipantRow.length - 1)
                                        }
                                        $("#scorecardGrid").empty();
                                        var grid = $("#scorecardGrid").kendoGrid({
                                            dataSource: $scope.scorecard.reportData,
                                            //loadOnDemand: false,
                                            sortable: true,
                                            //filterable: {
                                            //    mode: "row"
                                            //},
                                            //columnMenu: true,
                                            columns: [
                                                {
                                                    field: "pgName", title: $translate.instant('COMMON_PERFORMANCE_GROUP'), width: "11%"
                                                },
                                                {
                                                    field: "sName", title: $translate.instant('COMMON_SKILL'), width: "11%"
                                                },
                                                {
                                                    field: "scale", title: $translate.instant('SCORECARD_SCALE'), width: "7%", template: "<div class='number'>#= scale #</div>"
                                                },
                                                {
                                                    field: "baseline", title: $translate.instant('SCORECARD_BASELINE'), width: "6%", template: "<div class='number'>#= baseline #</div>"
                                                },
                                                //{ field: "", title: "Indicator", width: "5%", template: "<div class='scale-circle' style='background: #: color #'></div>" },
                                                {
                                                    field: "", title: mainParticipantRow + " " + $translate.instant('SCORECARD_INDICATOR'), width: "5%", template: "<div class='scale-circle' style='background: #: color #'></div>"
                                                },
                                                {
                                                    field: "", title: compareParticipantRow + " " + $translate.instant('SCORECARD_INDICATOR'), width: "5%", template: "<div class='scale-circle' style='background: #: compareColor #'></div>"
                                                },
                                                {
                                                    field: "score", title: mainParticipantRow + " " + $translate.instant('COMMON_PERFORMANCE'), width: columnWidthText, template: "<div class='number' style='color:" + colorMainPart + "'>#= (score == null) ? ' ' : score #</div>", hidden: true
                                                },
                                                {
                                                    field: "scoreEval", title: mainEvaluator.name + " " + $translate.instant('COMMON_PERFORMANCE'), width: columnWidthText, template: "<div class='number' style='color:" + colorMainEval + "'>#= (scoreEval == null) ? ' ' : scoreEval #</div>", hidden: true
                                                },
                                                {
                                                    field: "compareScore", title: compareParticipantRow + " " + $translate.instant('COMMON_PERFORMANCE'), width: columnWidthText, template: "<div class='number' style='color:" + colorPart + "'>#= (compareScore == null) ? ' ' : compareScore #</div>", hidden: true
                                                },
                                                {
                                                    field: "compareScoreEval", title: comparedEvaluator.name + " " + $translate.instant('COMMON_PERFORMANCE'), width: columnWidthText, template: "<div class='number' style='color:" + colorEval + "'>#= (compareScoreEval == null) ? ' ' : compareScoreEval #</div>", hidden: true
                                                },
                                                {
                                                    field: "performance", title: mainParticipantRow + " " + $translate.instant('COMMON_PERFORMANCE') + ", %", width: columnWidthText, template: "<div class='number' style='color:" + colorMainPart + "'>#= performance #</div>", hidden: true
                                                },
                                                {
                                                    field: "performanceEval", title: mainEvaluator.name + " " + $translate.instant('COMMON_PERFORMANCE') + ", %", width: columnWidthText, template: "<div class='number' style='color:" + colorMainEval + "'>#= performanceEval #</div>", hidden: true
                                                },
                                                {
                                                    field: "comparePerformance", title: compareParticipantRow + " " + $translate.instant('COMMON_PERFORMANCE') + ", %", width: columnWidthText, template: "<div class='number' style='color:" + colorPart + "'>#= comparePerformance #</div>", hidden: true
                                                },
                                                {
                                                    field: "comparePerformanceEval", title: comparedEvaluator.name + " " + $translate.instant('COMMON_PERFORMANCE') + ", %", width: columnWidthText, template: "<div class='number' style='color:" + colorEval + "'>#= comparePerformanceEval #</div>", hidden: true
                                                },
                                                {
                                                    field: "target", title: $translate.instant('SCORECARD_BENCHMARK'), width: "6%", template: "<div class='number'>#= (target == null) ? ' ' : target #</div>", hidden: !$scope.scorecard.isShowBenchmark
                                                },
                                                {
                                                    field: "trend", title: $translate.instant('SCORECARD_TREND'), width: "4%", template: "<div class='trend-#: trend #'></div>", hidden: true
                                                },
                                                {
                                                    field: "progress", title: $translate.instant('COMMON_PROGRESS'), width: "4%", template: "<div>#= (progress == null) ? '0 ' : progress #  % </div>", hidden: true
                                                },
                                                {
                                                    field: "weight", title: $translate.instant('SCORECARD_WEIGHT'), width: "6%", template: "<div class='number'>#= (weight == null) ? ' ' : weight #</div>"
                                                },
                                                {
                                                    field: "csf", title: "CSF", width: "12%", template: "#= (csf == null) ? ' ' : csf #"
                                                },
                                                {
                                                    field: "action", title: $translate.instant('COMMON_ACTION'), width: "12%", template: "#= (action == null) ? ' ' : action #"
                                                },
                                            ]
                                        });

                                        grid.data("kendoGrid").thead.kendoTooltip({
                                            filter: "th",
                                            content: function (e) {
                                                var target = e.target; // element for which the tooltip is shown
                                                return $(target).text();
                                            }
                                        });
                                        $scope.GroupByChanged();
                                    }

                                    $scope.scorecard.legends = [];
                                    var showReport;
                                    var treeGrid = $("#scorecardGrid");
                                    if (treeGrid.length > 0) {
                                        var treelist = treeGrid.data("kendoGrid"); //todo implement with angular
                                        var mainPostfix = " (" + $scope.scorecard.mainStageName + ", " + getById($scope.scorecard.mainProfileStepId, $scope.scorecard.mainStepsOfProfile).label + ")";
                                        var postfix = "";
                                        if ($scope.scorecard.profileStepId > 0 && $scope.scorecard.stepsOfProfile.length > 0) {
                                            postfix = " (" + $scope.scorecard.stageName + ", " + getById($scope.scorecard.profileStepId, $scope.scorecard.stepsOfProfile).label + ")";
                                        }
                                        if ($scope.scorecard.mainParticipantsModel.length > 0) {
                                            $scope.scorecard.legends.push(getLegendNames($scope.scorecard.mainParticipantsModel, colorMainPart, $scope.scorecard.mainParticipants, "Main Participant: " + mainPostfix));
                                            treelist.showColumn("score");
                                            treelist.showColumn("performance");

                                            showReport = true;
                                        }
                                        if ($scope.scorecard.mainEvaluatorsModel.length > 0) {
                                            var mainEvaluatorPostfix = " (" + $scope.scorecard.mainStageName + ", " + getById($scope.scorecard.mainProfileStepId, $scope.scorecard.mainStepsOfProfile).label + ")";
                                            if ($scope.scorecard.mainProfileStepId == softProfileTypesEnum.finalProfile.id || $scope.scorecard.mainProfileStepId == softProfileTypesEnum.finalKpi.id) {
                                                treelist.hideColumn("scoreEval");
                                                treelist.hideColumn("performanceEval");
                                            }
                                            else {
                                                $scope.scorecard.legends.push(getLegendNames($scope.scorecard.mainEvaluatorsModel, colorMainEval, $scope.scorecard.mainEvaluators, "Main Evaluator: " + mainEvaluatorPostfix));
                                                treelist.showColumn("scoreEval");
                                                treelist.showColumn("performanceEval");
                                                treelist.showColumn("trend");
                                                treelist.showColumn("progress");
                                            }
                                            showReport = true;
                                        }
                                        else {
                                            treelist.hideColumn("scoreEval");
                                            treelist.hideColumn("performanceEval");
                                        }
                                        if ($scope.scorecard.participantsModel.length > 0) {
                                            $scope.scorecard.legends.push(getLegendNames($scope.scorecard.participantsModel, colorPart, $scope.scorecard.participants, "Participant: " + postfix));
                                            treelist.showColumn("compareScore");
                                            treelist.showColumn("comparePerformance");
                                            treelist.showColumn("trend");
                                            treelist.showColumn("progress");
                                            showReport = true;
                                        }
                                        if ($scope.scorecard.evaluatorsModel.length > 0) {
                                            if ($scope.scorecard.profileStepId == softProfileTypesEnum.finalProfile.id || $scope.scorecard.profileStepId == softProfileTypesEnum.finalKpi.id) {
                                                treelist.hideColumn("compareScoreEval");
                                                treelist.hideColumn("comparePerformanceEval");
                                            }
                                            else {
                                                $scope.scorecard.legends.push(getLegendNames($scope.scorecard.evaluatorsModel, colorEval, $scope.scorecard.evaluators, "Evaluator: " + postfix));
                                                treelist.showColumn("compareScoreEval");
                                                treelist.showColumn("comparePerformanceEval");
                                                treelist.showColumn("trend");
                                                treelist.showColumn("progress");
                                            }
                                            showReport = true;
                                        }
                                        else {
                                            treelist.hideColumn("compareScoreEval");
                                            treelist.hideColumn("comparePerformanceEval");
                                        }
                                    }
                                    else
                                        showReport = false;

                                    $scope.scorecard.isShowReport = showReport;
                                    $stateParams = [];

                                }
                                else {
                                    var perspectives = [];
                                    var perspectiveData = [];
                                    if ($scope.scorecard.groupById == 1) {
                                        angular.forEach(data.performanceGroups, function (pg, pgIndex) {
                                            if (perspectives.indexOf(pg.perspective) == -1) {
                                                perspectives.push(pg.perspective);
                                                perspectiveData.push(pg);
                                            } else {
                                                var index = perspectives.indexOf(pg.perspective);
                                                perspectiveData[index].skills = data.performanceGroups[index].skills.concat(pg.skills);
                                            }
                                        });

                                        data.performanceGroups = perspectiveData;
                                    }

                                    angular.forEach(data.performanceGroups, function (pg, pgIndex) {
                                        var pgItem = angular.copy(pg);
                                        pgItem.skills = null;
                                        pgItem.id = pgIndex;
                                        pgItem.parentId = null;
                                        if ($scope.scorecard.groupById == 0) {
                                            pgItem.pgName = pg.name;
                                        } else {
                                            pgItem.pgName = pg.name;
                                        }
                                        pgItem.sName = "";
                                        pgItem.target = "";
                                        pgItem.score = null;
                                        pgItem.compareScore = null;
                                        pgItem.comparePerformance = pg.comparePerformance ? pg.comparePerformance : '';
                                        pgItem.comparePerformanceEval = null;
                                        pgItem.scale = '';
                                        pgItem.baseline = pg.baseline ? pg.baseline : '';
                                        pgItem.color = '';
                                        pgItem.compareColor = '';
                                        pgItem.scoreEval = pgItem.scoreEval ? pgItem.scoreEval : null;
                                        pgItem.compareScoreEval = pgItem.compareScoreEval ? pgItem.compareScoreEval : null;
                                        pgItem.performanceEval = pgItem.performanceEval ? pgItem.performanceEval : '';
                                        pgItem.comparePerformanceEval = pgItem.comparePerformanceEval ? pgItem.comparePerformanceEval : '';

                                        //$scope.scorecard.reportData.push(pgItem);
                                        var pgname = pgItem.pgName;
                                        angular.forEach(pg.skills, function (pgs, pgsIndex) {
                                            var pgsItem = angular.copy(pgs);
                                            pgsItem.questions = null;
                                            pgsItem.id = (1 + pgIndex) * 1000 + pgsIndex;
                                            pgsItem.parentId = pgIndex;
                                            pgsItem.pgName = pgname;
                                            pgsItem.scale = scale;
                                            pgsItem.color = getScaleColor(scaleRanges, pgsItem.score) ? getScaleColor(scaleRanges, pgsItem.score) : '';
                                            pgsItem.compareColor = getScaleColor(scaleRanges, pgsItem.compareScore) ? getScaleColor(scaleRanges, pgsItem.compareScore) : '';
                                            pgsItem.target = pgs.benchmark;
                                            pgsItem.sName = pgs.name;

                                            pgsItem.compareScore = pgsItem.compareScore ? pgsItem.compareScore : null;
                                            pgsItem.comparePerformance = pgsItem.comparePerformance ? pgsItem.comparePerformance : "";
                                            pgsItem.scoreEval = pgsItem.scoreEval ? pgsItem.scoreEval : null;
                                            pgsItem.compareScoreEval = pgsItem.compareScoreEval ? pgsItem.compareScoreEval : null;
                                            pgsItem.performanceEval = pgsItem.performanceEval ? pgsItem.performanceEval : "";
                                            pgsItem.comparePerformanceEval = pgsItem.comparePerformanceEval ? pgsItem.comparePerformanceEval : "";

                                            if (pgsItem.score && ((pgsItem.scoreEval && !pgsItem.compareScore) || (!pgsItem.scoreEval && pgsItem.compareScore && !pgsItem.compareScoreEval))) {
                                                var ev = null;
                                                if (pgsItem.scoreEval != null)
                                                    ev = pgsItem.scoreEval;
                                                else if (pgsItem.compareScore != null)
                                                    ev = pgsItem.compareScore;

                                                if (ev != null) {
                                                    if (pgsItem.score == ev) {
                                                        pgsItem.trend = "Equal";
                                                        pgsItem.progress = null;
                                                    }
                                                    else {
                                                        pgsItem.trend = (ev - pgsItem.score) < 0 ? "Down" : "Up";
                                                        pgsItem.progress = Math.ceil((ev - pgsItem.score) * 100 / pgsItem.score);
                                                        if ($scope.scorecard.mainParticipantsModel && $scope.scorecard.participantsModel) {
                                                            if ($scope.scorecard.mainParticipantsModel.length == 1 && $scope.scorecard.participantsModel.length == 1) {
                                                                if ($scope.scorecard.mainParticipantsModel[0].id == $scope.scorecard.participantsModel[0].id) {
                                                                    if ($scope.scorecard.mainStageId < $scope.scorecard.stageId) {
                                                                        pgsItem.trend = ev > pgsItem.score ? "Up" : "Down";
                                                                    }
                                                                    else if ($scope.scorecard.mainStageId > $scope.scorecard.stageId) {
                                                                        pgsItem.trend = pgsItem.score > ev ? "Up" : "Down";
                                                                        pgsItem.progress = Math.ceil((pgsItem.score - ev) * 100 / ev);
                                                                    }
                                                                }
                                                                else if ($scope.scorecard.participantsModel.length == 1) {
                                                                    if ($scope.scorecard.participantsModel[0].id == -1) {
                                                                        pgsItem.trend = (pgsItem.score - ev) < 0 ? "Down" : "Up";
                                                                        pgsItem.progress = Math.ceil((pgsItem.score - ev) * 100 / ev);
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    }

                                                }
                                            }

                                            if (!(($scope.scorecard.mainProfileStepId == 3 || $scope.scorecard.mainProfileStepId == 4) && pgsItem.color == ""))
                                                $scope.scorecard.reportData.push(pgsItem);
                                        })
                                    })

                                    var treeGrid = $("#scorecardGrid");
                                    var showReport = false;
                                    if (treeGrid.length > 0) {
                                        treeGrid.empty();

                                        var mainParticipant = { label: "" }
                                        var mainParticipantRow = "";
                                        var mainEvaluator = { name: "" }
                                        var comparedParticipant = { name: "" }
                                        var compareParticipantRow = "";
                                        var comparedEvaluator = { name: "" }

                                        if ($scope.scorecard.mainParticipantsModel) {
                                            if ($scope.scorecard.mainParticipantsModel.length > 0) {
                                                _.forEach($scope.scorecard.mainParticipantsModel, function (item) {
                                                    mainParticipant = _.find($scope.scorecard.mainParticipantsOptions, function (p) {
                                                        return p.id == item.id;
                                                    });

                                                    if (mainParticipant) {
                                                        mainParticipantRow += (mainParticipant.label) ? mainParticipant.label : (mainParticipant.name ? mainParticipant.name : "Main Participant");
                                                        mainParticipantRow += ",";
                                                    }
                                                })
                                            }
                                        }

                                        if ($scope.scorecard.mainEvaluatorsModel.length > 0) {
                                            mainEvaluator = _.find($scope.scorecard.mainEvaluators, function (p) {
                                                return p.id == $scope.scorecard.mainEvaluatorsModel[0].id;
                                            })
                                        }

                                        if ($scope.scorecard.participantsModel) {
                                            if ($scope.scorecard.participantsModel.length > 0) {


                                                _.forEach($scope.scorecard.participantsModel, function (item) {

                                                    comparedParticipant = _.find($scope.scorecard.participants, function (p) {
                                                        return p.id == item.id;
                                                    })
                                                    if (comparedParticipant) {
                                                        compareParticipantRow += comparedParticipant.label ? comparedParticipant.label : (comparedParticipant.name ? comparedParticipant.name : "Compare Participant");
                                                        compareParticipantRow += ",";
                                                    }
                                                })


                                            }
                                        }
                                        if ($scope.scorecard.participantsModel.length > 0) {
                                            comparedParticipant = _.find($scope.scorecard.participants, function (p) {
                                                return p.id == $scope.scorecard.participantsModel[0].id;
                                            })
                                        }
                                        if ($scope.scorecard.evaluatorsModel.length > 0) {
                                            comparedEvaluator = _.find($scope.scorecard.evaluators, function (p) {
                                                return p.id == $scope.scorecard.evaluatorsModel[0].id;
                                            })
                                        }

                                        if (mainParticipantRow.lastIndexOf(',') == mainParticipantRow.length - 1) {
                                            mainParticipantRow = mainParticipantRow.substring(0, mainParticipantRow.length - 1)
                                        }
                                        if (compareParticipantRow.lastIndexOf(',') == compareParticipantRow.length - 1) {
                                            compareParticipantRow = compareParticipantRow.substring(0, compareParticipantRow.length - 1)
                                        }
                                        var grid = treeGrid.kendoGrid({
                                            dataSource: $scope.scorecard.reportData,
                                            loadOnDemand: false,
                                            sortable: true,
                                            //filterable: {
                                            //    mode: "row"
                                            //},
                                            //columnMenu: true,
                                            columns: [
                                                {
                                                    field: "pgName", title: $translate.instant('COMMON_PERFORMANCE_GROUP'), width: "11%"
                                                },
                                                {
                                                    field: "sName", title: $translate.instant('COMMON_SKILL'), width: "11%"
                                                },
                                                {
                                                    field: "scale", title: $translate.instant('SCORECARD_SCALE'), width: "7%", template: "<div class='number'>#= scale #</div>"
                                                },
                                                {
                                                    field: "baseline", title: $translate.instant('SCORECARD_BASELINE'), width: "6%", template: "<div class='number'>#= baseline #</div>"
                                                },
                                                {
                                                    field: "", title: mainParticipantRow + " " + $translate.instant('SCORECARD_INDICATOR'), width: "5%", template: "<div class='scale-circle' style='background: #: color #'></div>"
                                                },
                                                {
                                                    field: "", title: compareParticipantRow + " " + $translate.instant('SCORECARD_INDICATOR'), width: "5%", template: "<div class='scale-circle' style='background: #: compareColor #'></div>"
                                                },
                                                {
                                                    field: "score", title: mainParticipantRow + " " + $translate.instant('COMMON_PERFORMANCE'), width: columnWidthText, template: "<div class='number' style='color:" + colorMainPart + "'>#= (score == null) ? ' ' : score #</div>", hidden: true
                                                },
                                                {
                                                    field: "scoreEval", title: mainEvaluator.name + " " + $translate.instant('COMMON_PERFORMANCE'), width: columnWidthText, template: "<div class='number' style='color:" + colorMainEval + "'>#= (scoreEval == null) ? ' ' : scoreEval #</div>", hidden: true
                                                },
                                                {
                                                    field: "compareScore", title: compareParticipantRow + " " + $translate.instant('COMMON_PERFORMANCE'), width: columnWidthText, template: "<div class='number' style='color:" + colorPart + "'>#= (compareScore == null) ? ' ' : compareScore #</div>", hidden: true
                                                },
                                                {
                                                    field: "compareScoreEval", title: comparedEvaluator.name + " " + $translate.instant('COMMON_PERFORMANCE'), width: columnWidthText, template: "<div class='number' style='color:" + colorEval + "'>#= (compareScoreEval == null) ? ' ' : compareScoreEval #</div>", hidden: true
                                                },
                                                {
                                                    field: "performance", title: mainParticipantRow + " " + $translate.instant('COMMON_PERFORMANCE') + ", %", width: columnWidthText, template: "<div class='number' style='color:" + colorMainPart + "'>#= performance #</div>", hidden: true
                                                },
                                                {
                                                    field: "performanceEval", title: mainEvaluator.name + " " + $translate.instant('COMMON_PERFORMANCE') + ", %", width: columnWidthText, template: "<div class='number' style='color:" + colorMainEval + "'>#= performanceEval #</div>", hidden: true
                                                },
                                                {
                                                    field: "comparePerformance", title: compareParticipantRow + " " + $translate.instant('COMMON_PERFORMANCE') + ", %", width: columnWidthText, template: "<div class='number' style='color:" + colorPart + "'>#= comparePerformance #</div>", hidden: true
                                                },
                                                {
                                                    field: "comparePerformanceEval", title: comparedEvaluator.name + " " + $translate.instant('COMMON_EVALUATOR') + " " + $translate.instant('COMMON_PERFORMANCE') + ", %", width: columnWidthText, template: "<div class='number' style='color:" + colorEval + "'>#= comparePerformanceEval #</div>", hidden: true
                                                },
                                                {
                                                    field: "target", title: $translate.instant('SCORECARD_BENCHMARK'), width: "6%", template: "<div class='number'>#= (target == null) ? ' ' : target #</div>", hidden: !$scope.scorecard.isShowBenchmark
                                                },
                                                {
                                                    field: "trend", title: $translate.instant('SCORECARD_TREND'), width: "4%", template: "<div class='trend-#: trend #'></div>", hidden: true
                                                },
                                                {
                                                    field: "progress", title: $translate.instant('COMMON_PROGRESS'), width: "4%", template: "<div>#= (progress == null) ? '0 ' : progress #  % </div>", hidden: true
                                                },
                                                {
                                                    field: "weight", title: $translate.instant('SCORECARD_WEIGHT'), width: "6%", template: "<div class='number'>#= (weight == null) ? ' ' : weight #</div>"
                                                },
                                                {
                                                    field: "csf", title: "CSF", width: "12%", template: "#= (csf == null) ? ' ' : csf #"
                                                },
                                                {
                                                    field: "action", title: $translate.instant('COMMON_ACTION'), width: "12%", template: "#= (action == null) ? ' ' : action #"
                                                },
                                            ]
                                        });

                                        $scope.scorecard.legends = [];
                                        var treelist = treeGrid.data("kendoGrid"); //todo implement with angular
                                        var mainPostfix = " (" + $scope.scorecard.mainStageName + ", " + getById($scope.scorecard.mainProfileStepId, $scope.scorecard.mainStepsOfProfile).label + ")";
                                        var postfix = "";
                                        if ($scope.scorecard.profileStepId > 0 && $scope.scorecard.stepsOfProfile.length > 0) {
                                            var postfix = " (" + $scope.scorecard.stageName + ", " + getById($scope.scorecard.profileStepId, $scope.scorecard.stepsOfProfile).label + ")";
                                        }
                                        //var postfix = " (" + $scope.scorecard.stageName + ", " + getById($scope.scorecard.profileStepId, $scope.scorecard.stepsOfProfile).label + ")";
                                        if ($scope.scorecard.mainParticipantsModel.length > 0) {
                                            $scope.scorecard.legends.push(getLegendNames($scope.scorecard.mainParticipantsModel, colorMainPart, $scope.scorecard.mainParticipants, $translate.instant('COMMON_MAIN_PARTICIPANT') + ": " + mainPostfix));
                                            treelist.showColumn("score");
                                            treelist.showColumn("performance");
                                            showReport = true;
                                        }
                                        if ($scope.scorecard.mainEvaluatorsModel.length > 0) {

                                            if ($scope.scorecard.mainProfileStepId == softProfileTypesEnum.finalProfile.id || $scope.scorecard.mainProfileStepId == softProfileTypesEnum.finalKpi.id) {
                                                treelist.hideColumn("scoreEval");
                                                treelist.hideColumn("performanceEval");
                                            }
                                            else {
                                                $scope.scorecard.legends.push(getLegendNames($scope.scorecard.mainEvaluatorsModel, colorMainEval, $scope.scorecard.mainEvaluators, $translate.instant('COMMON_MAIN_EVALUATOR') + ": " + mainPostfix));
                                                treelist.showColumn("scoreEval");
                                                treelist.showColumn("performanceEval");
                                                treelist.showColumn("trend");
                                                treelist.showColumn("progress");
                                            }
                                            showReport = true;
                                        }
                                        else {
                                            treelist.hideColumn("scoreEval");
                                            treelist.hideColumn("performanceEval");
                                        }
                                        if ($scope.scorecard.participantsModel.length > 0) {
                                            $scope.scorecard.legends.push(getLegendNames($scope.scorecard.participantsModel, colorPart, $scope.scorecard.participants, "Participant: " + postfix));
                                            treelist.showColumn("compareScore");
                                            treelist.showColumn("comparePerformance");
                                            treelist.showColumn("trend");
                                            treelist.showColumn("progress");
                                            showReport = true;
                                        }
                                        if ($scope.scorecard.evaluatorsModel.length > 0) {
                                            if ($scope.scorecard.profileStepId == softProfileTypesEnum.finalProfile.id || $scope.scorecard.profileStepId == softProfileTypesEnum.finalKpi.id) {
                                                treelist.hideColumn("compareScoreEval");
                                                treelist.hideColumn("comparePerformanceEval");
                                            }
                                            else {
                                                $scope.scorecard.legends.push(getLegendNames($scope.scorecard.evaluatorsModel, colorEval, $scope.scorecard.evaluators, "Evaluator: " + postfix));
                                                treelist.showColumn("compareScoreEval");
                                                treelist.showColumn("comparePerformanceEval");
                                                treelist.showColumn("trend");
                                                treelist.showColumn("progress");
                                            }
                                            showReport = true;
                                        } else {
                                            treelist.hideColumn("compareScoreEval");
                                            treelist.hideColumn("comparePerformanceEval");
                                        }

                                        grid.data("kendoGrid").thead.kendoTooltip({
                                            filter: "th",
                                            content: function (e) {
                                                var target = e.target; // element for which the tooltip is shown
                                                return $(target).text();
                                            }
                                        });
                                    }
                                    $scope.scorecard.isShowReport = showReport;
                                    $stateParams = [];
                                }
                            });
                        }
                    });
                }
                else {
                    getKTScorecardData();
                }
            }
        }
        //get functions end
        var getLabelText = function (options, ids) {
            var text = "";
            var optionsCount = ids.length;
            _.forEach(options, function (option) {
                if (_.any(ids, function (idObj) {
                    return idObj.id == option.id
                })) {
                    text += option.label;
                    if (--optionsCount) {
                        text += ', ';
                    }
                }
            });
            return text;
        };
        function getKTEmptySkillRes() {
            return {
                id: 0,
                pgName: '',
                skillName: '',
                indicator: '',
                pointsScore: '',
                comparePointsScore: '',
                percentScore: '',
                comparePercentScore: '',
                benchmark: '',
                weight: '',
                csf: '',
                action: '',
                trend: ''

            }
        }
        function setKTIndicatorColor(data) {
            if (data.passScore) {
                _.forEach(data.skillResults, function (dataItem) {
                    if (dataItem.id == -1) {
                        dataItem.indicator = dataItem.percentScore > data.passScore ? passScoreIndicator.passed : passScoreIndicator.failed;
                    }
                });
            }
            else {
                _.forEach(data.skillResults, function (dataItem) {
                    if (dataItem.id == -1) {
                        if (_.isNull(dataItem.correctAnswersCountScore) || _.isUndefined(dataItem.correctAnswersCountScore) || dataItem.correctAnswersCountScore == 0) {
                            dataItem.indicator = passScoreIndicator.failed;
                        }
                        else {
                            dataItem.indicator = passScoreIndicator.passed;
                        }
                    }
                });
            }
        }
        function setKTCIndicatorColor(data) {
            _.forEach(data.skillResults, function (dataItem) {
                if (_.isNull(dataItem.correctAnswersCountScore) || _.isUndefined(dataItem.correctAnswersCountScore) || dataItem.correctAnswersCountScore == 0) {
                    dataItem.cIndicator = passScoreIndicator.failed;
                }
                else {
                    dataItem.cIndicator = passScoreIndicator.passed;
                }
            });
        }
        function prepareKtSkillResultsFOrGrouping(skillResults) {
            var res = [];
            if ($scope.scorecard.groupById == 0) {
                skillResults = _.sortByOrder(skillResults, ['pgName', 'skillName'], ['asc', 'asc']);
                var pgIds = _.uniq(_.map(skillResults, 'pgId'));
                _.forEach(pgIds, function (pgId, index) {
                    var foundskillResuls = _.filter(skillResults, function (skillRes) {
                        return skillRes.pgId == pgId;
                    });
                    foundskillResuls = _.sortByOrder(foundskillResuls, ['skillName'], ['asc']);

                    var parentId = index;

                    var emptySkillRes = getKTEmptySkillRes();
                    emptySkillRes.id = parentId;
                    emptySkillRes.parentId = null;
                    emptySkillRes.pgName = foundskillResuls[0].pgName;
                    res.push(emptySkillRes);

                    _.forEach(foundskillResuls, function (item) {
                        var itemToAdd = _.clone(item);
                        itemToAdd.parentId = parentId;
                        itemToAdd.id = -1;
                        itemToAdd.pgName = '';
                        res.push(itemToAdd);
                    });
                });
            }
            else {
                var parentId = 0;

                var emptySkillRes = getKTEmptySkillRes();
                emptySkillRes.id = parentId;
                emptySkillRes.pgName = "Other";
                res.push(emptySkillRes);

                skillResults = _.sortByOrder(skillResults, ['skillName'], ['asc']);
                var skillIds = _.uniq(_.map(skillResults, 'skillId'));
                _.forEach(skillIds, function (skillId) {

                    var foundskillResuls = _.filter(skillResults, function (skillRes) {
                        return skillRes.skillId == skillId;
                    });

                    var skillRes = getKTEmptySkillRes();
                    skillRes.id = -1;
                    skillRes.parentId = parentId;
                    skillRes.skillName = foundskillResuls[0].skillName;
                    skillRes.indicator = foundskillResuls[0].indicator;
                    skillRes.benchmark = foundskillResuls[0].benchmark;
                    skillRes.weight = foundskillResuls[0].weight;
                    skillRes.csf = foundskillResuls[0].csf;
                    skillRes.action = foundskillResuls[0].action;

                    skillRes.correctAnswersCountScore = foundskillResuls[0].correctAnswersCountScore;
                    skillRes.pointsScore = _.sum(foundskillResuls, function (item) { return item.pointsScore }) / foundskillResuls.length;
                    skillRes.percentScore = _.sum(foundskillResuls, function (item) { return item.percentScore }) / foundskillResuls.length;;

                    res.push(skillRes);
                });
            }

            return res;
        }
        function getKTScorecardData() {


            scorecardsService.loadKTScorecardData($scope.scorecard.profileId, $scope.scorecard.mainParticipantsModel, $scope.scorecard.mainStageId, $scope.scorecard.mainProfileStepId == $scope.ktProfileTypes.start.id, $scope.scorecard.mainEvolutionStageId).then(function (data) {

                surveyService.getKTSurveyResult($scope.scorecard.profileId.toString(), $scope.scorecard.mainStageId.toString(), $scope.scorecard.mainParticipantsModel[0].id.toString(), "null").then(function (answerdata) {
                    var colorMainPart = "RGB(0,0,0)";//"RGB(175,233,112)";
                    var colorComparePart = "RGB(100,150,250)";
                    var columnWidth = 10;
                    var columnWidthText = columnWidth + "%";

                    _.forEach(data.skillResults, function (sRes) {
                        sRes.id = sRes.pgId;
                        sRes.percentScore = sRes.percentScore.toFixed(2);
                    });

                    data.skillResults = prepareKtSkillResultsFOrGrouping(data.skillResults, answerdata);
                    setKTIndicatorColor(data);

                    $scope.scorecard.reportData = data;
                    if ($("#scorecardGrid").length > 0) {
                        $("#scorecardGrid").empty();
                    }
                    var grid;

                    if (!($scope.scorecard.participantsModel.length > 0)) {

                        var mainParticipantsRaw = getLabelTextFromOptions($scope.scorecard.mainParticipantsOptions, $scope.scorecard.mainParticipantsModel[0].id);

                        var colorMainPart = "RGB(0,0,0)";
                        var colorComparePart = "RGB(100,150,250)";
                        var columnWidth = 10;
                        var columnWidthText = columnWidth + "%";
                        var columns = [
                            {
                                field: "pgName", title: $translate.instant('COMMON_PERFORMANCE_GROUP'), width: "11%"
                            },
                            {
                                field: "skillName", title: $translate.instant('COMMON_SKILL'), width: "11%"
                            },
                            {
                                field: "questionText", title: $translate.instant('MYPROFILES_QUESTION'), width: "11%"
                            },
                            {
                                field: "", title: $translate.instant('SCORECARD_INDICATOR'), width: "5%", template: "<div class='scale-circle' style='background: #: indicator #'></div>"
                            },
                            {
                                field: "pointsScore", title: mainParticipantsRaw + " " + $translate.instant('SCORECARD_POINTS_SCORE'), width: columnWidthText, template: "<div class='number' style='color:" + colorMainPart + "'>#= (pointsScore == null) ? ' ' : pointsScore #</div>"
                            },
                            {
                                field: "percentScore", title: mainParticipantsRaw + $translate.instant('COMMON_SCORE') + " , %", width: columnWidthText, template: "<div class='number' style='color:" + colorMainPart + "'>#= percentScore ? percentScore+'%' : '' #</div>"
                            },
                            {
                                field: "target", title: $translate.instant('SCORECARD_BENCHMARK'), width: "6%", template: "<div class='number'>#= (benchmark == null) ? ' ' : benchmark #</div>", hidden: !$scope.scorecard.isShowBenchmark
                            },
                            {
                                field: "weight", title: $translate.instant('SCORECARD_WEIGHT'), width: "6%", template: "<div class='number'>#= (weight == null) ? ' ' : weight #</div>"
                            },
                            {
                                field: "csf", title: "CSF", width: "12%", template: "#= (csf == null) ? ' ' : csf #"
                            },
                            {
                                field: "action", title: $translate.instant('COMMON_ACTION'), width: "12%", template: "#= (action == null) ? ' ' : action #"
                            },
                        ];

                        var grid = $("#scorecardGrid").kendoGrid({
                            dataSource: $scope.scorecard.reportData.skillResults,
                            loadOnDemand: false,
                            sortable: true,
                            //filterable: {
                            //    mode: "row"
                            //},
                            //columnMenu: true,
                            columns: columns
                        });
                        grid.data("kendoGrid").thead.kendoTooltip({
                            filter: "th",
                            content: function (e) {
                                var target = e.target; // element for which the tooltip is shown
                                return $(target).text();
                            }
                        });

                    }
                    else {
                        scorecardsService.loadKTScorecardData($scope.scorecard.profileId, $scope.scorecard.mainParticipantsModel, $scope.scorecard.stageId, $scope.scorecard.profileStepId == $scope.ktProfileTypes.start.id, $scope.scorecard.evolutionStageId).then(function (compData) {
                            var mainResult = _.filter($scope.scorecard.reportData.skillResults, function (skillRes) {
                                return skillRes.id == -1
                            });
                            var compareResult = compData.skillResults;
                            setKTCIndicatorColor(compData);
                            if (mainResult.length == compareResult.length) {
                                _.forEach($scope.scorecard.reportData.skillResults, function (skillRes) {
                                    skillRes.avgPointScore = null;
                                    skillRes.avgPercentScore = null;
                                    skillRes.cIndicator = null;
                                    if (skillRes.id == -1) {
                                        var compareRes = _.find(compData.skillResults, function (compSkillRes) {
                                            return compSkillRes.pgId == skillRes.pgId &&
                                                compSkillRes.skillId == skillRes.skillId;
                                        });
                                        if (compareRes) {
                                            skillRes.cIndicator = compareRes.cIndicator;
                                            skillRes.comparePointsScore = compareRes.pointsScore;
                                            skillRes.comparePercentScore = parseFloat(compareRes.percentScore).toFixed(2);
                                            skillRes.avgPointScore = parseFloat((skillRes.comparePointsScore + skillRes.pointsScore) / 2).toFixed(2);
                                            skillRes.avgPercentScore = parseFloat((parseFloat(skillRes.comparePercentScore) + parseFloat(skillRes.percentScore)) / 2).toFixed(2);
                                            if (skillRes.pointsScore == skillRes.comparePointsScore) {
                                                skillRes.trend = "Equal";
                                            }
                                            else {
                                                skillRes.trend = skillRes.pointsScore < skillRes.comparePointsScore ? "Down" : "Up";
                                            }
                                            skillRes.progress = Math.ceil((skillRes.comparePointsScore - skillRes.pointsScore) * 100 / skillRes.pointsScore)
                                        }
                                        else {
                                            skillRes.comparePointsScore = null;
                                            skillRes.comparePercentScore = null;
                                            skillRes.avgPointScore = null;
                                            skillRes.avgPercentScore = null;
                                            skillRes.trend = null;
                                            skillRes.progress = null;
                                        }
                                    }

                                });
                                var colorMainPart = "RGB(0,0,0)";
                                var colorComparePart = "RGB(100,150,250)";
                                var columnWidth = 10;
                                var columnWidthText = columnWidth + "%";

                                var mainParticipantsRaw = getLabelTextFromOptions($scope.scorecard.mainParticipantsOptions, $scope.scorecard.mainParticipantsModel[0].id);
                                var participantsRaw = getLabelTextFromOptions($scope.scorecard.participantsOptions, $scope.scorecard.participantsModel[0].id);
                                var columns = [
                                    {
                                        field: "pgName", title: $translate.instant('COMMON_PERFORMANCE_GROUP'), width: "10%"
                                    },
                                    {
                                        field: "skillName", title: $translate.instant('COMMON_SKILL'), width: "10%"
                                    },
                                    {
                                        field: "questionText", title: $translate.instant('MYPROFILES_QUESTION'), width: "10%"
                                    },
                                    {
                                        field: "", title: mainParticipantsRaw + $translate.instant('SCORECARD_INDICATOR'), width: "5%", template: "<div class='scale-circle' style='background: #: indicator #'></div>"
                                    },
                                    {
                                        field: "", title: participantsRaw + " " + $translate.instant('SCORECARD_INDICATOR'), width: "5%", template: "<div class='scale-circle' style='background: #: cIndicator #'></div>"
                                    },
                                    {
                                        field: "pointsScore", title: mainParticipantsRaw + " " + $translate.instant('SCORECARD_POINTS_SCORE'), width: columnWidthText, template: "<div class='number' style='color:" + colorMainPart + "'>#= (pointsScore == null) ? ' ' : pointsScore #</div>"
                                    },
                                    {
                                        field: "comparePointsScore", title: participantsRaw + " " + $translate.instant('SCORECARD_POINTS_SCORE'), width: columnWidthText, template: "<div class='number' style='color:" + colorComparePart + "'>#= (comparePointsScore == null) ? ' ' : comparePointsScore #</div>"
                                    },
                                    {
                                        field: "percentScore", title: mainParticipantsRaw + " " + $translate.instant('COMMON_SCORE') + " , %", width: columnWidthText, template: "<div class='number' style='color:" + colorMainPart + "'>#= percentScore ? percentScore+'%' : '' #</div>"
                                    },
                                    {
                                        field: "comparePercentScore", title: participantsRaw + " " + $translate.instant('COMMON_SCORE') + " , %", width: columnWidthText, template: "<div class='number' style='color:" + colorComparePart + "'>#= comparePercentScore ? comparePercentScore+'%' : '' #</div>"
                                    },
                                    {
                                        field: "target", title: $translate.instant('SCORECARD_BENCHMARK'), width: "6%", template: "<div class='number'>#= (benchmark == null) ? ' ' : benchmark #</div>", hidden: !$scope.scorecard.isShowBenchmark
                                    },
                                    {
                                        field: "trend", title: $translate.instant('SCORECARD_TREND'), width: "4%", template: "<div class='trend-#: trend #'></div>"
                                    },
                                    {
                                        field: "progress", title: $translate.instant('COMMON_PROGRESS'), width: "5%", template: "<div>#= (progress == null) ? '0 ' : progress #  % </div>"
                                    },
                                    {
                                        field: "weight", title: $translate.instant('SCORECARD_WEIGHT'), width: "6%", template: "<div class='number'>#= (weight == null) ? ' ' : weight #</div>"
                                    },
                                    {
                                        field: "csf", title: "CSF", width: "12%", template: "#= (csf == null) ? ' ' : csf #"
                                    },
                                    {
                                        field: "avgPointScore", title: $translate.instant('DASHBOARD_AVG_POINT_SCORE'), width: "12%", template: "#= (avgPointScore == null) ? ' ' : avgPointScore #"
                                    },
                                    {
                                        field: "avgPercentScore", title: $translate.instant('DASHBOARD_AVG_PERCENT_SCORE'), width: "12%", template: "<div class='number'>#= avgPercentScore ? avgPercentScore+'%' : '' #</div>"
                                    },
                                    {
                                        field: "action", title: $translate.instant('COMMON_ACTION'), width: "12%", template: "#= (action == null) ? ' ' : action #"
                                    }
                                ];

                                var grid = $("#scorecardGrid").kendoGrid({
                                    dataSource: $scope.scorecard.reportData.skillResults,
                                    loadOnDemand: false,
                                    sortable: true,
                                    //filterable: {
                                    //    mode: "row"
                                    //},
                                    //columnMenu: true,
                                    columns: columns
                                });
                                grid.data("kendoGrid").thead.kendoTooltip({
                                    filter: "th",
                                    content: function (e) {
                                        var target = e.target; // element for which the tooltip is shown
                                        return $(target).text();
                                    }
                                });
                            }
                            else {
                            }

                        });
                    }
                    $scope.scorecard.legends = [];
                    var showReport;
                    var treeGrid = $("#scorecardGrid");
                    if (treeGrid.length > 0) {
                        var treelist = treeGrid.data("kendoGrid"); //todo implement with angular
                        var mainPostfix = " (" + $scope.scorecard.mainStageName + ", " + getById($scope.scorecard.mainProfileStepId, $scope.scorecard.mainStepsOfProfile).label + ")";

                        if ($scope.scorecard.mainParticipantsModel.length > 0) {
                            $scope.scorecard.legends.push(getLegendNames($scope.scorecard.mainParticipantsModel, colorMainPart, $scope.scorecard.mainParticipantsOptions, "Main Participant: " + mainPostfix));
                            showReport = true;
                        }
                        if ($scope.scorecard.participantsModel.length > 0) {
                            var postfix = " (" + $scope.scorecard.stageName + ", " + getById($scope.scorecard.profileStepId, $scope.scorecard.stepsOfProfile).label + ")";
                            $scope.scorecard.legends.push(getLegendNames($scope.scorecard.participantsModel, colorComparePart, $scope.scorecard.participantsOptions, "Participant: " + postfix));
                            showReport = true;
                        }
                    }
                    else {
                        showReport = false;
                    }

                    $scope.scorecard.isShowReport = showReport;
                    $stateParams = [];
                });;


            });
        }
        function stagesHandler(type) {
            if (type === 1) {

                $scope.scorecard.mainStageName = '';
                angular.forEach($scope.scorecard.mainStagesRaw, function (s) {
                    if (s.id == $scope.scorecard.mainStageId) {
                        $scope.scorecard.mainStageName = s.name;
                        return;
                    }
                });

                //$scope.scorecard.mainProfileStepId = 4;
                //$scope.scorecard.mainProfileStepId = softProfileTypesEnum.;
                if ($scope.scorecard.mainParticipantsModel.length > 0) {
                    if ($scope.scorecard.profileType == profilesTypesEnum.soft) {
                        getScorecardData();
                    }
                    else if ($scope.scorecard.profileType == profilesTypesEnum.knowledgetest) {
                        getKTScorecardData();
                    }
                    //$scope.scorecard.getScorecardData();
                }
                getProfileTypes(type, $scope.scorecard.mainStageId, $scope.scorecard.mainStages);
            }
            if (type === 2) {

                $scope.scorecard.stageName = '';
                angular.forEach($scope.scorecard.stagesRaw, function (s) {
                    if (s.id == $scope.scorecard.stageId) {
                        $scope.scorecard.stageName = s.name;
                        return;
                    }
                });


                //$scope.scorecard.profileStepId = 4;
                if ($scope.scorecard.participantsModel.length > 0) {
                    if ($scope.scorecard.profileType == profilesTypesEnum.soft) {
                        getScorecardData();
                    }
                    else if ($scope.scorecard.profileType == profilesTypesEnum.knowledgetest) {
                        getKTScorecardData();
                    }
                    //$scope.scorecard.getScorecardData();
                }
                getProfileTypes(type, $scope.scorecard.stageId, $scope.scorecard.stages);
            }
        }

        function goBack() {
            history.back();
        }

        function dataSource(scorecardData) {
            return new kendo.data.TreeListDataSource({
                data: scorecardData,
                schema: {
                    model: {
                        id: "id",
                        fields: {
                            parentId: {
                                type: "number", nullable: true
                            },
                            id: {
                                type: "number"
                            }
                        },
                        expanded: true
                    }
                }
            });
        }

        function indexOfId(array, id) {
            for (var i = 0; i < array.length; i++) {
                if (array[i].id == id) return i;
            }
            return -1;
        }

        function goToDevContract(type) {
            if (type === 1) {
                var mainParticipantId = $scope.scorecard.mainParticipantsModel[0];
                var mainEvalId = $scope.scorecard.mainEvaluatorsModel[0];
                $location.path('home/previewFinalKPI/' + $scope.scorecard.profileId + '/' + $scope.scorecard.mainStageId + '/' + mainEvalId.id + '/' + mainParticipantId.id + '/devContract');
            }
            if (type === 2) {
                var participantId = $scope.scorecard.participantsModel[0];
                var evalId = $scope.evaluatorsModel[0];
                $location.path('home/previewFinalKPI/' + $scope.scorecard.profileId + '/ ' + $scope.scorecard.mainStageId + '/' + evalId.id + '/' + participantId.id + '/devContract');
            }
        }

    }
})();