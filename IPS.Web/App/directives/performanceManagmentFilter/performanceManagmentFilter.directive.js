'use strict';

angular
    .module('ips')
    .constant('softProfileTypesEnum', {
        startProfile: { id: 1, label: "Start Profile" },
        finalProfile: { id: 2, label: "Agreed Final Profile" },
        initialKPI: { id: 3, label: "Initial KPI" },
        finalKpi: { id: 4, label: "Agreed Final KPI" },
        initialKPIScores: { id: 3, label: "Initial KPI Scores" },
        finalKPIResults: { id: 4, label: "Agreed Final KPI Results" }
    })
    .constant('dataTypesEnum', {
        main: 1,
        compare: 2
    })
    .constant('profileStatusEnum', {
        Active: true,
        Inactive: false
    })
    .controller('performanceManagmentFilterCtrl', ['$scope', 'performanceManagmentFilterService', 'profilesTypesEnum', 'softProfileTypesEnum',
        'ktProfileTypesEnum', 'dataTypesEnum', 'profileStatusEnum', '$location', 'dialogService', 'localStorageService', '$translate',
        function ($scope, performanceManagmentFilterService, profilesTypesEnum, softProfileTypesEnum,
            ktProfileTypesEnum, dataTypesEnum, profileStatusEnum, $location, dialogService, localStorageService, $translate) {

            function getMultiSelectOptions(data) {
                var options = [];
                _.forEach(data, function (item, index) {
                    if (item.isSelfEvaluation) {
                        options.push({ id: item.id, label: item.name, isSelfEvaluation: item.isSelfEvaluation });
                    }
                    else {
                        options.push({ id: item.id, label: item.name });
                    }
                });
                return options;
            }

            $scope.profilesTypesEnum = profilesTypesEnum;

            $scope.ktProfileTypes = {
                start: { id: 1, label: $translate.instant('COMMON_START_STAGE') },
                final: { id: 2, label: $translate.instant('COMMON_FINAL_STAGE') }
            };

            var clearProfiles = function () {
                $scope.profiles = [];
                $scope.filter.profileId = null;
            };

            var clearStageGroups = function () {
                $scope.filter.profileStageGroups = [];
            }
            var clearParticipants = function () {
                $scope.participants = [];
                $scope.filter.mainParticipantsOptions = [];
                $scope.filter.mainParticipantsModel = [];
                $scope.filter.participantsOptions = [];
                $scope.filter.participantsModel = [];

                $scope.mainEvolutionStageModel = [];
                $scope.evolutionStageModel = [];
            };
            var clearEvaluators = function () {
                $scope.filter.mainEvaluatorsModel = [];
                $scope.filter.evaluatorsModel = [];
                $scope.filter.mainEvaluatorsOptions = [];
                $scope.filter.evaluatorsOptions = [];
            };
            var clearStages = function () {
                $scope.filter.mainStageId = '';
                $scope.filter.stageId = '';
                $scope.mainStages = [];
                $scope.stages = [];

                $scope.filter.mainEvolutionStageId = 0;
                $scope.filter.evolutionStageId = 0;
                $scope.mainEvolutionStages = [{ id: 0, name: $translate.instant('DASHBOARD_SELECT_EVOLUTION_STAGE') }];
                $scope.evolutionStages = [{ id: 0, name: $translate.instant('DASHBOARD_SELECT_EVOLUTION_STAGE') }];
            };
            var clearProfileSteps = function () {
                $scope.filter.mainProfileStepId = null;
                $scope.filter.profileStepId = null;
                $scope.filter.mainStepsOfProfile = [];
                $scope.filter.stepsOfProfile = [];
            };

            var updateStages = function (stages) {
                $scope.mainStages = [];
                $scope.stages = [];

                $scope.mainStagesRaw = [];
                $scope.stagesRaw = [];

                _.forEach(stages, function (item, index) {
                    if (index == 0) {
                        $scope.firstStageId = item.id;
                    }
                    $scope.mainStages.push({ id: item.id, name: item.name + " (" + item.statusText + ")" });
                    $scope.stages.push({ id: item.id, name: item.name + " (" + item.statusText + ")" });

                    $scope.mainStagesRaw.push({ id: item.id, name: item.name });
                    $scope.stagesRaw.push({ id: item.id, name: item.name });
                });

                if ($scope.mainStages.length > 0) {
                    $scope.filter.mainStageId = $scope.mainStages[0].id;
                    $scope.filter.mainStageName = $scope.mainStagesRaw[0].name;
                    getProfileTypes(dataTypesEnum.main, $scope.filter.mainStageId, $scope.mainStages);
                } else {
                    $scope.filter.mainStageId = null;
                    $scope.filter.mainStageName = '';
                }
                if ($scope.stages.length > 0) {
                    $scope.filter.stageId = $scope.stages[0].id;
                    $scope.filter.stageName = $scope.stagesRaw[0].name;
                    getProfileTypes(dataTypesEnum.compare, $scope.filter.stageId, $scope.stages);
                } else {
                    $scope.filter.stageId = null;
                    $scope.filter.stageName = '';
                }
            }
            var getFilteredData = function () {
                if ($scope.filter.mainParticipantsModel && $scope.filter.mainParticipantsModel.length > 0) {
                    $scope.filter.isLoadReport = true;
                }
                $scope.$emit('filterChanged', 'true');
            };
            function getFilteredComparisonData() {
                if ($scope.filter.participantsModel && $scope.filter.participantsModel.length > 0) {
                    $scope.filter.isLoadCompareReport = true;
                }
                $scope.$emit('filterChanged', 'true');
            };
            function getKendoMultiSelectAllModel(options) {
                var model = [];
                _.forEach(options, function (option) {
                    model.push({ id: option.id });
                });
                return model
            }
            if ($scope.filter.profileTypeId > 0) {

                _.forEach(_.keys(profilesTypesEnum), function (item) {
                    if (profilesTypesEnum[item] == $scope.filter.profileTypeId) {
                        var ProfileTypeName = item;
                        if (item == "soft") {
                            ProfileTypeName = $translate.instant('COMMON_SOFT_PROFILE') //"Soft Profile"
                        }
                        else if (item == "knowledgetest") {
                            ProfileTypeName = $translate.instant('LEFTMENU_KNOWLEDGE_PROFILE') //"Knowledge Profile"
                        }

                        $scope.profileTypes = [{ id: profilesTypesEnum[item], name: ProfileTypeName }];
                    }
                })

            }
            else {
                $scope.profileTypes = [{ id: 0, name: $translate.instant('COMMON_ALL') }];
                _.forEach(_.keys(profilesTypesEnum), function (item) {
                    var ProfileTypeName = item;
                    if (item == "soft") {
                        ProfileTypeName = $translate.instant('COMMON_SOFT_PROFILE') //"Soft Profile"
                    }
                    else if (item == "knowledgetest") {
                        ProfileTypeName = $translate.instant('LEFTMENU_KNOWLEDGE_PROFILE') //"Knowledge Profile"
                    }
                    $scope.profileTypes.push({ id: profilesTypesEnum[item], name: ProfileTypeName });
                })
            }


            $scope.profileStatusOptions = [{ id: '', name: $translate.instant('DASHBOARD_ANY') }]
            _.forEach(_.keys(profileStatusEnum), function (item) {
                var ProfileTypeName = item;
                if (item == "Active") {
                    ProfileTypeName = $translate.instant('DASHBOARD_ACTIVE_PROFILE') //"Active Profile"
                }
                else if (item == "Inactive") {
                    ProfileTypeName = $translate.instant('DASHBOARD_INACTIVE_PROFILE') //"Inactive Profile"
                }
                $scope.profileStatusOptions.push({ id: profileStatusEnum[item], name: ProfileTypeName });
            })
            //$scope.filter.profileTypeId = 0;
            $scope.profileTypeChanged = function () {
                clearProfiles();
                clearParticipants();
                clearStageGroups();
                clearStages();
                clearProfileSteps()
                if ($scope.filter.profileTypeId == profilesTypesEnum.soft) {
                    clearEvaluators();
                }
                if ($scope.filter.projectsModel.length > 0) {
                    performanceManagmentFilterService.getProjectProfiles($scope.filter.projectsModel, $scope.filter.profileStatus).then(function (data) {
                        $scope.profiles = _.filter(data, function (item) {
                            if ($scope.filter.profileTypeId > 0) {
                                return item.profileTypeId == $scope.filter.profileTypeId
                            }
                            else {
                                return item;
                            }
                        });
                    });
                }
                else if ($scope.filter.organizationId) {
                    performanceManagmentFilterService.getProfiles($scope.filter.organizationId, "", $scope.filter.profileStatus).then(function (data) {
                        if (data) {
                            $scope.profiles = _.filter(data, function (item) {
                                if ($scope.filter.profileTypeId > 0) {
                                    return item.profileTypeId == $scope.filter.profileTypeId
                                }
                                else {
                                    return item;
                                }
                            });
                            console.log($scope.profiles.length);


                        }
                        else {
                            $scope.profiles = [];
                        }
                    });
                    performanceManagmentFilterService.getDepartments($scope.filter.organizationId).then(function (data) {
                        if (data) {
                            $scope.departments = data;
                            $scope.departmentsOptions = getMultiSelectOptions($scope.departments);
                        }
                    });
                    performanceManagmentFilterService.getTeams($scope.filter.organizationId, $scope.filter.departmentsModel).then(function (data) {
                        if (data) {
                            $scope.teams = data;
                            $scope.teamsOptions = getMultiSelectOptions($scope.teams);
                        }
                    });
                }
                $scope.filter.isLoadReport = false;
                $scope.filter.isLoadCompareReport = false;
                $scope.$emit('filterChanged', 'false');
            };

            $scope.filter.profileStatus = '';
            $scope.profileStatusChanged = function () {
                //clearProfiles();
                clearParticipants();
                clearStageGroups();
                clearStages();
                clearProfileSteps()
                if ($scope.filter.profileTypeId == profilesTypesEnum.soft) {
                    clearEvaluators();
                }

                if ($scope.filter.projectsModel.length > 0) {
                    performanceManagmentFilterService.getProjectProfiles($scope.filter.projectsModel, $scope.filter.profileStatus).then(function (data) {
                        $scope.profiles = _.filter(data, function (item) {
                            if ($scope.filter.profileTypeId > 0) {
                                return item.profileTypeId == $scope.filter.profileTypeId
                            }
                            else {
                                return item;
                            }
                        });
                    });
                }
                else if ($scope.filter.organizationId) {
                    performanceManagmentFilterService.getProfiles($scope.filter.organizationId, "", $scope.filter.profileStatus).then(function (data) {
                        if (data) {
                            $scope.profiles = _.filter(data, function (item) {
                                if ($scope.filter.profileTypeId > 0) {
                                    return item.profileTypeId == $scope.filter.profileTypeId
                                }
                                else {
                                    return item;
                                }
                            });

                            //$scope.profiles = _.filter($scope.profiles, function (item) {
                            //    if ($scope.filter.profileStatus != '') {
                            //        return item.isActive == $scope.filter.profileStatus
                            //    }
                            //    else {
                            //        return item;
                            //    }
                            //});
                        }
                        else {
                            $scope.profiles = [];
                        }
                    });
                }
                else {
                    $scope.profiles = [];
                }
                console.log($scope.profiles.length);
                $scope.filter.isLoadReport = false;
                $scope.filter.isLoadCompareReport = false;
                $scope.$emit('filterChanged', 'false');
            };

            $scope.organizations = [];
            $scope.organizationChanged = function () {
                clearProjects();
                clearProfiles();
                clearParticipants();
                clearStageGroups();
                clearStages();
                clearProfileSteps()
                if ($scope.filter.profileType == profilesTypesEnum.soft) {
                    clearEvaluators();
                }

                $scope.filter.isLoadReport = false;
                $scope.filter.isLoadCompareReport = false;
                $scope.$emit('filterChanged', 'false');

                if ($scope.filter.organizationId) {

                    performanceManagmentFilterService.getProjects().then(function (data) {
                        $scope.projects = _.filter(data, function (projectItem) {
                            return projectItem.organizationId == $scope.filter.organizationId;
                        });
                        _.forEach($scope.projects, function (item) {
                            $scope.projectsOptions.push({ id: item.id, label: item.name });
                        });
                    });
                    performanceManagmentFilterService.getProfiles($scope.filter.organizationId, "", $scope.filter.profileStatus).then(function (data) {
                        if (data) {
                            $scope.profiles = _.filter(data, function (item) {
                                if ($scope.filter.profileTypeId > 0) {
                                    return item.profileTypeId == $scope.filter.profileTypeId
                                }
                                else {
                                    return item;
                                }
                            });
                        }
                        else {
                            $scope.profiles = [];
                        }
                    });
                    performanceManagmentFilterService.getDepartments($scope.filter.organizationId).then(function (data) {
                        if (data) {
                            $scope.departments = data;
                            $scope.departmentsOptions = getMultiSelectOptions($scope.departments);
                        }
                    });
                    performanceManagmentFilterService.getTeams($scope.filter.organizationId, $scope.filter.departmentsModel).then(function (data) {
                        if (data) {
                            $scope.teams = data;
                            $scope.teamsOptions = getMultiSelectOptions($scope.teams);
                        }
                    });
                }
                else {
                    performanceManagmentFilterService.getProjects().then(function (data) {
                        $scope.projects = data;
                        _.forEach(data, function (item) {
                            $scope.projectsOptions.push({ id: item.id, label: item.name });
                        });
                    });
                }
            };

            var clearProjects = function () {
                $scope.projects = [];
                $scope.projectsOptions = [];
                $scope.filter.projectsModel = [];
            }
            $scope.clearProjects = function () {
                $scope.projects = [];
                $scope.projectsOptions = [];
                $scope.filter.projectsModel = [];
            }
            $scope.projects = [];
            $scope.projectsOptions = [];
            $scope.projectsCustomTexts = { buttonDefaultText: $translate.instant('DASHBOARD_SELECT_PROJECTS') };
            $scope.projectsEvents = {
                onItemSelect: function (item) {
                    projectChanged();
                },
                onItemDeselect: function (item) {
                    projectChanged();
                },
                onSelectAll: function () {
                    $scope.filter.projectsModel = getKendoMultiSelectAllModel($scope.projectsOptions);
                    projectChanged();
                },
                onDeselectAll: function () {
                    $scope.filter.projectsModel = [];
                    projectChanged();
                }
            };
            var projectChanged = function () {
                clearProfiles();
                clearParticipants();
                clearStageGroups();
                clearStages();
                clearProfileSteps()

                $scope.filter.isLoadReport = false;
                $scope.filter.isLoadCompareReport = false;
                $scope.$emit('filterChanged', 'false');
                if ($scope.filter.projectsModel.length > 0) {
                    performanceManagmentFilterService.getProjectProfiles($scope.filter.projectsModel, $scope.filter.profileStatus).then(function (data) {
                        $scope.profiles = data;
                    });
                }
                else if ($scope.filter.organizationId) {
                    performanceManagmentFilterService.getProfiles($scope.filter.organizationId, "", $scope.filter.profileStatus).then(function (data) {
                        if (data) {
                            if ($scope.filter.projectsModel.length > 0) {
                                $scope.profiles = _.filter(data, function (item) {
                                    var isFiltered = _.filter($scope.filter.projectsModel, function (projectItem) {
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
                        }
                        else {
                            $scope.profiles = [];
                        }
                    });
                } else {
                    $scope.profiles = [];
                }
                //if ($scope.filter.profileId != null) {
                //    getParticipants();
                //}
            };


            $scope.departments = [];
            $scope.departmentsOptions;
            $scope.departmentsEvents = {
                onItemSelect: function (item) {
                    departmentChanged(item);
                },
                onItemDeselect: function (item) {
                    departmentChanged(item);
                },
                onSelectAll: function () {
                    $scope.filter.departmentsModel = getKendoMultiSelectAllModel($scope.departmentsOptions);
                    departmentChanged();
                },
                onDeselectAll: function () {
                    $scope.filter.departmentsModel = [];
                    departmentChanged();
                }
            };
            $scope.departmentsCustomTexts = { buttonDefaultText: $translate.instant('TASKPROSPECTING_SELECT_DEPARTMENT') };
            var departmentChanged = function () {
                if ($scope.filter.organizationId) {
                    performanceManagmentFilterService.getTeams($scope.filter.organizationId, $scope.filter.departmentsModel).then(function (data) {
                        if (data) {
                            $scope.teams = data;
                            $scope.teamsOptions = getMultiSelectOptions($scope.teams);
                        }
                    });
                    if ($scope.filter.profileId) {
                        getParticipants();
                    }
                }
            };


            $scope.teams = [];
            $scope.teamsOptions;
            $scope.teamsEvents = {
                onItemSelect: function (item) {
                    teamChanged();
                },
                onItemDeselect: function (item) {
                    teamChanged();
                },
                onSelectAll: function () {
                    $scope.filter.teamsModel = getKendoMultiSelectAllModel($scope.teamsOptions);
                    teamChanged();
                },
                onDeselectAll: function () {
                    $scope.filter.teamsModel = [];
                    teamChanged();
                }
            };
            $scope.teamsCustomTexts = { buttonDefaultText: $translate.instant('TASKPROSPECTING_SELECT_TEAM') };
            var teamChanged = function () {
                if ($scope.filter.profileId != null) {
                    getParticipants();
                }
            };


            $scope.profiles = [];
            $scope.profileChanged = function () {
                clearParticipants();
                clearStageGroups();
                clearStages();
                clearProfileSteps()
                if ($scope.filter.profileType == profilesTypesEnum.soft) {
                    clearEvaluators();
                }
                performanceManagmentFilterService.getProfileType($scope.filter.profileId).then(function (data) {
                    $scope.filter.profileType = data;
                });
                performanceManagmentFilterService.getProfileStageGroups($scope.filter.profileId).then(function (data) {
                    $scope.filter.profileStageGroups = data;
                    if (data.length > 0) {
                        $scope.filter.profileStageGroupId = data[0].id;
                        getParticipants();
                    }
                });
                $scope.filter.profile = _.find($scope.profiles, function (item) {
                    return item.id == $scope.filter.profileId;
                })
                $scope.filter.isLoadReport = false;
                $scope.filter.isLoadCompareReport = false;
                $scope.$emit('filterChanged', 'false');
            };
            $scope.profileStageGroupChanged = function () {
                $scope.participants = [];
                getParticipants();
            }

            $scope.participants = [];
            function getParticipants() {
                performanceManagmentFilterService.getProfileStages($scope.filter.profileId, null, false, $scope.filter.profileStageGroupId).then(function (data) {
                    updateStages(data);

                    performanceManagmentFilterService.getParticipantsBy($scope.filter.profileId, $scope.filter.stageId, $scope.filter.projectsModel,
                        $scope.filter.departmentsModel, $scope.filter.teamsModel, $scope.filter.profileStageGroupId).then(function (data) {
                            $scope.participants = [];
                            $scope.filter.mainParticipantsModel = [];
                            $scope.filter.participantsModel = [];

                            //$scope.evaluators = [];
                            //$scope.evaluatorsOptions = [];
                            //$scope.filter.mainEvaluatorsModel = [];
                            //$scope.filter.evaluatorsModel = [];

                            //$scope.isEvaluatorsEnabled = false;

                            _.forEach(data, function (item) {
                                $scope.participants.push({ id: item.participantId, name: item.firstName + " " + item.lastName, isSelfEvaluation: item.isSelfEvaluation });
                            });

                            if ($scope.participants.length > 0) {
                                $scope.participants.splice(0, 0);
                                $scope.filter.mainParticipantsOptions = getMultiSelectOptions($scope.participants);
                                $scope.participants.splice(0, 0, { id: -1, name: $translate.instant('SCORECARD_BENCHMARK') });
                                $scope.filter.participantsOptions = getMultiSelectOptions($scope.participants);
                            }
                        });
                });
            }
            function getEvaluatorsOfParticipant(type) {
                var usersSource;

                if (type === dataTypesEnum.main) {
                    usersSource = $scope.filter.mainParticipantsModel;
                } else {
                    usersSource = $scope.filter.participantsModel;
                }

                //more than 1 main Participant - compare participant selected - SWITCH OFF evaluators
                if (usersSource.length > 1) {
                    //$scope.filter.isMainEvaluatorsEnabled = false;

                    var participant = [usersSource[0]]
                    performanceManagmentFilterService.getEvaluatorsForParticipant($scope.filter.profileId, participant).then(function (data) {

                        _.forEach(data, function (evaluator) {
                            if (type === dataTypesEnum.main) {
                                $scope.mainEvaluators.push({ id: evaluator.participantId, name: evaluator.firstName + " " + evaluator.lastName, isSelfEvaluation: evaluator.isSelfEvaluation, IsScoreManager: evaluator.isScoreManager });
                            } else {
                                $scope.evaluators.push({ id: evaluator.participantId, name: evaluator.firstName + " " + evaluator.lastName, isSelfEvaluation: evaluator.isSelfEvaluation, IsScoreManager: evaluator.isScoreManager });
                                $scope.filter.evaluatorsOptions = getMultiSelectOptions($scope.evaluators);
                            }
                        });
                        if (type === dataTypesEnum.main) {
                            if ($scope.mainEvaluators.length > 0) {
                                $scope.isMainEvaluatorsEnabled = true;
                                //if ($scope.filter.mainProfileStepId == softProfileTypesEnum.finalProfile.id || $scope.filter.mainProfileStepId == softProfileTypesEnum.finalKpi.id) {
                                //$scope.isMainEvaluatorsEnabled = false;
                                var finalScoremanger = _.find($scope.mainEvaluators, function (evaluatorItem) {
                                    return evaluatorItem.IsScoreManager == true;
                                });
                                if (finalScoremanger) {
                                    $scope.filter.finalScoremanger = finalScoremanger.id;
                                }
                                //}
                            }

                        }
                        if (type === dataTypesEnum.main) {
                            $scope.mainEvaluators = [];
                            $scope.filter.mainEvaluatorsOptions = [];
                            $scope.filter.mainEvaluatorsModel = [];
                        }

                    });

                    if (type === dataTypesEnum.main) {
                        $scope.filter.isMainEvaluatorsEnabled = false;
                        $scope.filter.mainEvaluatorsModel = [];
                        $scope.filter.mainEvaluators = [];
                        $scope.mainEvaluators = [];

                        if ($scope.filter.mainProfileStepId && $scope.filter.mainProfileStepId > 0) {
                            getFilteredData();
                        }
                    }
                    else {
                        $scope.filter.isEvaluatorsEnabled = false;
                        $scope.filter.evaluatorsModel = [];
                        $scope.evaluators = [];

                        if ($scope.filter.profileStepId && $scope.filter.profileStepId > 0) {
                            getFilteredData();
                        }
                    }
                } else {
                    performanceManagmentFilterService.getEvaluatorsForParticipant($scope.filter.profileId, usersSource).then(function (data) {
                        if (type === dataTypesEnum.main) {
                            $scope.mainEvaluators = [];
                            $scope.filter.mainEvaluatorsOptions = [];
                            $scope.filter.mainEvaluatorsModel = [];
                        } else {
                            $scope.evaluators = [];
                            $scope.filter.evaluatorsOptions = [];
                            $scope.filter.evaluatorsModel = [];
                        }
                        _.forEach(data, function (evaluator) {
                            if (type === dataTypesEnum.main) {
                                $scope.mainEvaluators.push({ id: evaluator.participantId, name: evaluator.firstName + " " + evaluator.lastName, isSelfEvaluation: evaluator.isSelfEvaluation, IsScoreManager: evaluator.isScoreManager });
                                $scope.filter.mainEvaluatorsOptions = getMultiSelectOptions($scope.mainEvaluators);
                            } else {
                                $scope.evaluators.push({ id: evaluator.participantId, name: evaluator.firstName + " " + evaluator.lastName, isSelfEvaluation: evaluator.isSelfEvaluation, IsScoreManager: evaluator.isScoreManager });
                                $scope.filter.evaluatorsOptions = getMultiSelectOptions($scope.evaluators);
                            }
                        });
                        if (type === dataTypesEnum.main) {
                            if ($scope.mainEvaluators.length > 0) {
                                $scope.isMainEvaluatorsEnabled = true;
                                //if ($scope.filter.mainProfileStepId == softProfileTypesEnum.finalProfile.id || $scope.filter.mainProfileStepId == softProfileTypesEnum.finalKpi.id) {
                                //$scope.isMainEvaluatorsEnabled = false;
                                var finalScoremanger = _.find($scope.mainEvaluators, function (evaluatorItem) {
                                    return evaluatorItem.IsScoreManager == true;
                                })
                                if (finalScoremanger) {
                                    $scope.filter.mainEvaluatorsModel = [{ id: finalScoremanger.id }];
                                    $scope.filter.finalScoremanger = finalScoremanger.id;
                                }
                                //}
                            }
                            if ($scope.filter.mainProfileStepId && $scope.filter.mainProfileStepId > 0) {
                                getFilteredData();
                            }
                        }
                        else {
                            if ($scope.evaluators.length > 0) {
                                $scope.isEvaluatorsEnabled = true;
                                //if ($scope.filter.profileStepId == softProfileTypesEnum.finalProfile.id || $scope.filter.profileStepId == softProfileTypesEnum.finalKpi.id) {
                                //$scope.isEvaluatorsEnabled = false;
                                var finalScoremanger = _.find($scope.evaluators, function (evaluatorItem) {
                                    return evaluatorItem.IsScoreManager == true;
                                })
                                if (finalScoremanger) {
                                    $scope.filter.evaluatorsModel = [{ id: finalScoremanger.id }];

                                }
                                //}
                            }
                            if ($scope.filter.profileStepId && $scope.filter.profileStepId > 0) {
                                getFilteredData();
                            }
                        }
                    });
                }
            };


            $scope.mainParticipantsCustomTexts = { buttonDefaultText: $translate.instant('DASHBOARD_SELECT_MAIN_PARTICIPANTS') };
            $scope.filter.mainParticipantsOptions = [];
            $scope.mainParticipantsEvents = {
                onItemSelect: function (item) {
                    mainParticipantsChanged();
                },
                onItemDeselect: function (item) {
                    mainParticipantsChanged();
                },
                onSelectAll: function () {
                    $scope.filter.mainParticipantsModel = getKendoMultiSelectAllModel($scope.filter.mainParticipantsOptions);
                    mainParticipantsChanged();
                },
                onDeselectAll: function () {
                    $scope.filter.mainParticipantsModel = [];
                    $scope.filter.participantsModel = [];
                    $scope.filter.mainEvaluatorsOptions = [];
                    $scope.filter.mainEvaluatorsModel = [];
                    $scope.isMainEvaluatorsEnabled = false;
                    mainParticipantsChanged();
                }
            };
            var mainParticipantsChanged = function () {
                if (!$scope.filter.mainParticipantsModel || $scope.filter.mainParticipantsModel.length == 0) {
                    $scope.filter.participantsModel = [];
                    $scope.mainEvolutionStages = [{ id: 0, name: $translate.instant('DASHBOARD_SELECT_EVOLUTION_STAGE') }];
                    $scope.filter.mainEvaluatorsOptions = [];
                    $scope.isMainEvaluatorsEnabled = false;
                    $scope.filter.mainEvolutionStageId = 0;
                    $scope.filter.isLoadReport = false;
                    $scope.filter.isLoadCompareReport = false;
                    $scope.$emit('filterChanged', 'false');
                    return;
                }
                else {
                    if ($scope.filter.profileType == profilesTypesEnum.soft) {
                        return getEvaluatorsOfParticipant(dataTypesEnum.main);
                    }
                    else {
                        getEvolutionStages($scope.filter.mainStageId, $scope.filter.mainParticipantsModel[0].id, dataTypesEnum.main);
                    }
                    getFilteredData();
                }
            };


            //$scope.filter.mainEvaluatorsOptions = [];
            //$scope.isMainEvaluatorsEnabled = false;
            $scope.mainEvaluatorsCustomTexts = { buttonDefaultText: $translate.instant('DASHBOARD_SELECT_MAIN_EVALUATORS') };
            $scope.mainEvaluatorsEvents = {
                onItemSelect: function (item) {
                    mainEvaluatorsChanged();
                },
                onItemDeselect: function (item) {
                    mainEvaluatorsChanged();
                },
                onSelectAll: function () {
                    $scope.filter.mainEvaluatorsModel = getKendoMultiSelectAllModel($scope.filter.mainEvaluatorsOptions);
                    mainEvaluatorsChanged();
                },
                onDeselectAll: function () {
                    $scope.filter.mainEvaluatorsModel = [];
                    mainEvaluatorsChanged();
                }
            };
            var mainEvaluatorsChanged = function () {
                if ($scope.filter.mainProfileStepId && $scope.filter.mainProfileStepId > 0) {
                    getFilteredData();
                }
            };


            $scope.mainStages = [];
            $scope.mainStageChanged = function () {
                $scope.filter.mainStageName = _.find($scope.mainStagesRaw, function (stageRaw) { return stageRaw.id == $scope.filter.mainStageId; }).name;
                getProfileTypes(dataTypesEnum.main, $scope.filter.mainStageId, $scope.mainStages);
                if ($scope.filter.mainParticipantsModel.length > 0) {
                    if ($scope.filter.profileType == profilesTypesEnum.knowledgetest) {
                        getEvolutionStages($scope.filter.mainStageId, $scope.filter.mainParticipantsModel[0].id);
                    }
                }
            };
            $scope.mainEvolutionStagesChanged = function () {
                getFilteredData();
            }

            $scope.filter.mainStepsOfProfile = [];
            function getDefaultSoftProfileTypes() {
                var types = [];
                var sp = softProfileTypesEnum.startProfile;
                sp.label = $translate.instant('DASHBOARD_START_PROFILE');
                var fp = softProfileTypesEnum.finalProfile;
                fp.label = $translate.instant('MYPROJECTS_FINAL_PROFILE');
                var iKPI = softProfileTypesEnum.initialKPI;
                iKPI.label = $translate.instant('DASHBOARD_INITIAL_KPI');
                var fKPI = softProfileTypesEnum.finalKpi;
                fKPI.label = $translate.instant('MYPROFILES_FINAL_KPI');
                types.push(sp);
                types.push(fp);
                types.push(iKPI);
                types.push(fKPI);
                return types;
            };
            function getDefaultKTProfileTypes() {
                var types = [];
                types.push($scope.ktProfileTypes.start);
                types.push($scope.ktProfileTypes.final);
                return types;
            }
            $scope.mainProfileStepChanged = function () {
                $scope.filter.mainEvaluatorsModel = [];
                //if ($scope.filter.mainProfileStepId == softProfileTypesEnum.finalProfile.id || $scope.filter.mainProfileStepId == softProfileTypesEnum.finalKpi.id) {
                if ($scope.filter.mainEvaluatorsOptions.length > 0) {
                    //$scope.filter.mainEvaluatorsModel = [{ id: $scope.filter.mainEvaluatorsOptions[0].id }];
                    var finalScoremanger = _.find($scope.mainEvaluators, function (evaluatorItem) {
                        return evaluatorItem.IsScoreManager == true;
                    });
                    if (finalScoremanger) {
                        $scope.filter.mainEvaluatorsModel = [{ id: finalScoremanger.id }];
                        $scope.filter.finalScoremanger = finalScoremanger.id;
                    }
                }
                //$scope.filter.mainEvaluatorsModel = [];
                //$scope.isMainEvaluatorsEnabled = false;
                //}
                //else {
                //    $scope.isMainEvaluatorsEnabled = true;
                //}
                $scope.isMainEvaluatorsEnabled = true;
                getFilteredData();
            };


            $scope.filter.participantsOptions = [];
            $scope.participantsCustomTexts = { buttonDefaultText: $translate.instant('DASHBOARD_SELECT_PARTICIPANTS') };
            $scope.participantsEvents = {
                onItemSelect: function (item) {
                    participantChanged(item);
                },
                onItemDeselect: function (item) {
                    participantChanged(item);
                },
                onSelectAll: function () {
                    $scope.filter.participantsModel = getKendoMultiSelectAllModel($scope.filter.participantsOptions);
                    participantChanged();
                },
                onDeselectAll: function () {
                    $scope.filter.participantsModel = [];
                    $scope.filter.evaluatorsOptions = [];
                    $scope.filter.evaluatorsModel = [];
                    $scope.isEvaluatorsEnabled = false;
                    $scope.filter.isLoadCompareReport = false;
                    $scope.$emit('filterChanged', 'false');
                }
            };
            var participantChanged = function () {
                if (!$scope.filter.participantsModel || $scope.filter.participantsModel.length == 0) {
                    $scope.filter.isLoadCompareReport = true;
                    $scope.filter.evaluatorsOptions = [];
                    $scope.filter.evaluatorsModel = [];
                    $scope.isEvaluatorsEnabled = false;
                    $scope.evolutionStages = [{ id: 0, name: $translate.instant('DASHBOARD_SELECT_EVOLUTION_STAGE') }];
                    $scope.filter.evolutionStageId = 0;
                    $scope.$emit('filterChanged', 'false');

                    return;
                }
                else if ($scope.filter.profileType == profilesTypesEnum.soft) {
                    getEvaluatorsOfParticipant(dataTypesEnum.compare);
                    //$scope.filter.evolutionStageId = $scope.filter.mainEvolutionStageId;
                    //$scope.filter.profileStepId = $scope.filter.mainProfileStepId;

                }
                else if ($scope.filter.participantsModel && $scope.filter.participantsModel.length != 0) {
                    getFilteredComparisonData();
                    getEvolutionStages($scope.filter.stageId, $scope.filter.participantsModel[0].id, dataTypesEnum.compare);
                    //$scope.filter.evolutionStageId = $scope.filter.mainEvolutionStageId;
                    //$scope.filter.profileStepId = $scope.filter.mainProfileStepId;
                }
            };


            $scope.filter.evaluatorsOptions = [];
            $scope.evaluatorsCustomTexts = { buttonDefaultText: $translate.instant('MYPROFILES_SELECT_EVALUATORS') };
            $scope.evaluatorsEvents = {
                onItemSelect: function (item) {
                    evaluatorsChanged();
                },
                onItemDeselect: function (item) {
                    evaluatorsChanged();
                },
                onSelectAll: function () {
                    $scope.filter.evaluatorsModel = getKendoMultiSelectAllModel($scope.filter.evaluatorsOptions);
                    evaluatorsChanged();
                },
                onDeselectAll: function () {
                    $scope.filter.evaluatorsModel = [];
                    evaluatorsChanged();
                }
            };
            var evaluatorsChanged = function () {
                if ($scope.filter.profileStepId > 0) {
                    getFilteredData();
                }
            };


            $scope.stages = [];
            $scope.stageChanged = function () {
                $scope.filter.stageName = _.find($scope.stagesRaw, function (stageRaw) { return stageRaw.id == $scope.filter.stageId; }).name;
                getProfileTypes(dataTypesEnum.compare, $scope.filter.stageId, $scope.stages);
                if ($scope.filter.participantsModel.length > 0) {

                    if ($scope.filter.profileType == profilesTypesEnum.knowledgetest) {
                        getEvolutionStages($scope.filter.stageId, $scope.filter.participantsModel[0].id, dataTypesEnum.compare);
                    }
                }


            }

            var evolutionStagesChanged =
                $scope.evolutionStagesChanged = function () {
                    getFilteredData();
                };

            $scope.filter.stepsOfProfile = [];
            $scope.profileStepChanged = function () {
                $scope.filter.evaluatorsModel = [];
                //if ($scope.filter.mainProfileStepId == softProfileTypesEnum.finalProfile.id || $scope.filter.mainProfileStepId == softProfileTypesEnum.finalKpi.id) {
                if ($scope.filter.evaluatorsOptions.length > 0) {
                    //$scope.filter.evaluatorsModel = [{ id: $scope.filter.evaluatorsModel[0].id }];
                    var finalScoremanger = _.find($scope.evaluators, function (evaluatorItem) {
                        return evaluatorItem.IsScoreManager == true;
                    })
                    if (finalScoremanger) {
                        $scope.filter.evaluatorsModel = [{ id: finalScoremanger.id }];
                    }
                }
                //$scope.filter.mainEvaluatorsModel = [];
                //$scope.isMainEvaluatorsEnabled = false;
                //}

                if ($scope.filter.profileStepId == softProfileTypesEnum.finalProfile.id || $scope.filter.profileStepId == softProfileTypesEnum.finalKpi.id) {
                    //$scope.filter.evaluatorsModel = [];
                    //$scope.isEvaluatorsEnabled = false;
                }
                if ($scope.filter.profileType == profilesTypesEnum.knowledgetest) {
                    getFilteredComparisonData();
                }
                else {
                    getFilteredData();
                }
            };

            var getProfileTypes = function (type, selectedStageId, optionsSource) {
                if ($scope.filter.profileType == $scope.profilesTypesEnum.soft) {
                    var source = [];
                    if (selectedStageId === $scope.firstStageId) {
                        source = getDefaultSoftProfileTypes();
                        if (type === dataTypesEnum.main) {
                            $scope.filter.mainProfileStepId = softProfileTypesEnum.finalKpi.id;
                        }
                        else {
                            $scope.filter.profileStepId = softProfileTypesEnum.finalKpi.id;
                        }
                    }
                    else {
                        source.push(softProfileTypesEnum.initialKPIScores);
                        source.push(softProfileTypesEnum.finalKPIResults);
                    }
                    if (type === dataTypesEnum.main) {
                        $scope.filter.mainStepsOfProfile = source;
                        $scope.filter.mainProfileStepId = softProfileTypesEnum.finalKpi.id;
                    }
                    else {
                        $scope.filter.stepsOfProfile = source;
                        $scope.filter.profileStepId = softProfileTypesEnum.finalKpi.id;
                    }
                }
                else {
                    if (type === dataTypesEnum.main) {
                        $scope.filter.mainStepsOfProfile = getDefaultKTProfileTypes();
                        $scope.filter.mainProfileStepId = $scope.ktProfileTypes.start.id;
                    }
                    else {
                        $scope.filter.stepsOfProfile = getDefaultKTProfileTypes();
                        $scope.filter.profileStepId = $scope.ktProfileTypes.start.id;
                    }
                }
                if (type === dataTypesEnum.main) {
                    $scope.mainProfileStepChanged();
                }
                else {
                    $scope.profileStepChanged();
                }
            }

            $scope.mainEvolutionStages = [{ id: 0, name: $translate.instant('DASHBOARD_SELECT_EVOLUTION_STAGE') }];
            $scope.evolutionStages = [{ id: 0, name: $translate.instant('DASHBOARD_SELECT_EVOLUTION_STAGE') }];
            function getEvolutionStages(originalStageId, participantId, type) {
                if (!(participantId)) {
                    participantId = 0;
                }
                if (type == dataTypesEnum.main) {
                    $scope.mainEvolutionStages = [{ id: 0, name: $translate.instant('DASHBOARD_SELECT_EVOLUTION_STAGE') }];
                }
                else if (type == dataTypesEnum.compare) {
                    $scope.evolutionStages = [{ id: 0, name: $translate.instant('DASHBOARD_SELECT_EVOLUTION_STAGE') }];
                }

                performanceManagmentFilterService.getEvolutionStages(originalStageId, participantId).then(function (data) {
                    _.forEach(data, function (item, index) {
                        if (type == dataTypesEnum.main) {
                            $scope.mainEvolutionStages.push({ id: item.stageEvolutionId, name: item.name });
                        }
                        else if (type == dataTypesEnum.compare) {
                            $scope.evolutionStages.push({ id: item.stageEvolutionId, name: item.name });
                        }
                    });

                });
            }


            function goToDevContract(participantModel, evaluatorModel, isStartStage, stageId) {
                var participantId = 0;
                if (participantModel) {
                    participantId = participantModel.id;
                }
                var evalId = 0;
                if (evaluatorModel) {
                    evalId = evaluatorModel.id;
                }
                if ($scope.filter.profileType == profilesTypesEnum.soft) {

                    localStorageService.set('perfomanceManagementFilterData', $scope.filter);
                    $location.path('home/previewFinalKPI/' + $scope.filter.profileId + '/' + stageId +
                        '/' + evalId + '/' + participantId + '/devContract');
                }
                else {
                    if (!isStartStage) {
                        performanceManagmentFilterService.getKTLastStageEvolutionId($scope.filter.profileId, participantId, stageId).then(function (stageEvolutionId) {
                            stageId = stageEvolutionId ? null : stageId;
                            performanceManagmentFilterService.kTStageHasDevContaract($scope.filter.profileId, stageId, stageEvolutionId, participantId).then(function (hasDevContract) {
                                if (hasDevContract) {
                                    localStorageService.set('perfomanceManagementFilterData', $scope.filter);
                                    $location.path('home/kt_final_kpi/' + $scope.filter.profileId + '/' + stageId +
                                        '/' + participantId + '/' + stageEvolutionId + '/devContract');
                                }
                                else {
                                    dialogService.showNotification($translate.instant('DASHBOARD_STAGE_DOES_NOT_HAVE_DEVELOPMENT_CONTRACT'), $translate.instant('COMMON_WARNING'));
                                }
                            });
                        });
                    }
                    else {
                        performanceManagmentFilterService.kTStageHasDevContaract($scope.filter.profileId, stageId, null, participantId).then(function (hasDevContract) {
                            if (hasDevContract) {
                                localStorageService.set('perfomanceManagementFilterData', $scope.filter);
                                $location.path('home/kt_final_kpi/' + $scope.filter.profileId + '/' + stageId +
                                    '/' + participantId + '/null/devContract');
                            }
                            else {
                                dialogService.showNotification($translate.instant('DASHBOARD_STAGE_DOES_NOT_HAVE_DEVELOPMENT_CONTRACT'), $translate.instant('COMMON_WARNING'));
                            }
                        });
                    }
                }
            }

            $scope.goToDevContractForMain = function () {
                goToDevContract($scope.filter.mainParticipantsModel[0], $scope.filter.mainEvaluatorsModel[0],
                    $scope.filter.mainProfileStepId == $scope.ktProfileTypes.start.id, $scope.filter.mainStageId);
            }

            $scope.goToDevContractForCompare = function () {
                goToDevContract($scope.filter.participantsModel[0], $scope.filter.evaluatorsModel[0],
                    $scope.filter.profileStepId == $scope.ktProfileTypes.start.id, $scope.filter.stageId);
            }

            $scope.isShowDevContract = function (participantsModel, evaluatorsModel, stageid, profileStepId) {
                var isShow = false;
                //Rule 1  : Self Evalution
                var stageObj = _.find($scope.mainStages, function (item) {
                    return item.id == stageid;
                });
                if (stageObj) {

                    if (stageObj.name.toLowerCase().indexOf("start") > -1) {

                        if ((participantsModel && participantsModel.length == 1 && participantsModel[0].id != -1) && (!(evaluatorsModel && evaluatorsModel.length >= 1)) && (profileStepId == softProfileTypesEnum.finalProfile.id || profileStepId == softProfileTypesEnum.finalKpi.id)) {
                            var participantObj = _.find($scope.filter.mainParticipantsOptions, function (item) {
                                return item.id == participantsModel[0].id && item.isSelfEvaluation == true;
                            });
                            if (participantObj) {
                                isShow = true;
                            }
                            else {
                                isShow = false;
                            }

                        }
                        else if (((participantsModel && participantsModel.length == 1 && participantsModel[0].id != -1) || (evaluatorsModel && evaluatorsModel.length == 1)) && (profileStepId == softProfileTypesEnum.finalProfile.id || profileStepId == softProfileTypesEnum.finalKpi.id)) {
                            isShow = true;
                        }
                    }
                    else {
                        if ((participantsModel && participantsModel.length == 1 && participantsModel[0].id != -1) && (!(evaluatorsModel && evaluatorsModel.length >= 1)) && (profileStepId == softProfileTypesEnum.finalProfile.id || profileStepId == softProfileTypesEnum.finalKpi.id)) {
                            var participantObj = _.find($scope.filter.mainParticipantsOptions, function (item) {
                                return item.id == participantsModel[0].id && item.isSelfEvaluation == true;
                            });
                            if (participantObj) {
                                isShow = true;
                            }
                            else {
                                isShow = false;
                            }
                        }
                        else if (((participantsModel && participantsModel.length == 1 && participantsModel[0].id != -1) || (evaluatorsModel && evaluatorsModel.length == 1)) && (profileStepId == softProfileTypesEnum.finalProfile.id || profileStepId == softProfileTypesEnum.finalKpi.id)) {
                            isShow = true;
                        }
                    }
                }



                return isShow;
            }


            $scope.init = function () {

                $scope.filter.isLoadReport = false;
                $scope.filter.isLoadCompareReport = false;

                performanceManagmentFilterService.getOrganizations('&$orderby=Name').then(function (data) {
                    $scope.organizations = data;
                });

                performanceManagmentFilterService.getProjects().then(function (data) {
                    $scope.projects = data;
                    _.forEach(data, function (item) {
                        $scope.projectsOptions.push({ id: item.id, label: item.name });
                    });

                    if ($scope.filter.projectsModel.length > 0) {
                        performanceManagmentFilterService.getProjectProfiles($scope.filter.projectsModel, $scope.filter.profileStatus).then(function (data) {
                            $scope.profiles = _.filter(data, function (item) {
                                if ($scope.filter.profileTypeId > 0) {
                                    return item.profileTypeId == $scope.filter.profileTypeId
                                }
                                else {
                                    return item;
                                }
                            });
                        });
                    }

                });

                // set preselected values:
                if ($scope.filter.departmentsModel.length) {
                    performanceManagmentFilterService.getDepartments($scope.filter.organizationId).then(function (data) {
                        if (data) {
                            $scope.departments = data;
                            $scope.departmentsOptions = getMultiSelectOptions($scope.departments);
                        }
                    });
                }
                if ($scope.filter.teamsModel.length) {
                    performanceManagmentFilterService.getTeams($scope.filter.organizationId, $scope.filter.departmentsModel).then(function (data) {
                        if (data) {
                            $scope.teams = data;
                            $scope.teamsOptions = getMultiSelectOptions($scope.teams);
                        }
                    });
                }
                if ($scope.filter.profileId) {
                    performanceManagmentFilterService.getProfileType($scope.filter.profileId).then(function (data) {
                        $scope.filter.profileType = data;
                        performanceManagmentFilterService.getProfileStageGroups($scope.filter.profileId).then(function (StageGroupsdata) {

                            $scope.filter.profileStageGroups = StageGroupsdata;
                            if (StageGroupsdata.length > 0 && $scope.filter.profileStageGroupId) {
                                var selectedStageGroup = _.filter(StageGroupsdata, function (item) {
                                    return item.id == $scope.filter.profileStageGroupId;
                                })
                                if ((selectedStageGroup.length > 0)) {
                                    $scope.filter.profileStageGroupId = selectedStageGroup[0].id;
                                }
                                else {
                                    $scope.filter.profileStageGroupId = StageGroupsdata[0].id;
                                }
                            }
                            performanceManagmentFilterService.getProfiles($scope.filter.organizationId, "", $scope.filter.profileStatus).then(function (data) {
                                if (data) {
                                    $scope.profiles = data;
                                }
                                else {
                                    $scope.profiles = [];
                                }
                            });
                            performanceManagmentFilterService.getProfileStages($scope.filter.profileId, null, false, $scope.filter.profileStageGroupId).then(function (stages) {
                                $scope.mainStages = [];
                                $scope.stages = [];

                                $scope.mainStagesRaw = [];
                                $scope.stagesRaw = [];

                                _.forEach(stages, function (item, index) {
                                    if (index == 0) {
                                        $scope.firstStageId = item.id;
                                    }
                                    $scope.mainStages.push({ id: item.id, name: item.name + " (" + item.statusText + ")" });
                                    $scope.stages.push({ id: item.id, name: item.name + " (" + item.statusText + ")" });

                                    $scope.mainStagesRaw.push({ id: item.id, name: item.name });
                                    $scope.stagesRaw.push({ id: item.id, name: item.name });
                                    if ($scope.filter.mainStageId == item.id) {
                                        $scope.filter.mainStageName = item.name;
                                    }
                                    if ($scope.filter.stageId == item.id) {
                                        $scope.filter.stageName = item.name;
                                    }
                                });
                                if ($scope.filter.profileType == $scope.profilesTypesEnum.soft) {
                                    var source = [];
                                    if ($scope.filter.mainStageId === $scope.firstStageId) {
                                        $scope.filter.mainStepsOfProfile = getDefaultSoftProfileTypes();
                                    }
                                    else {
                                        $scope.filter.mainStepsOfProfile.push(softProfileTypesEnum.initialKPIScores);
                                        $scope.filter.mainStepsOfProfile.push(softProfileTypesEnum.finalKPIResults);
                                    }

                                    if ($scope.filter.stageId === $scope.firstStageId) {
                                        $scope.filter.stepsOfProfile = getDefaultSoftProfileTypes();
                                    }
                                    else {

                                        $scope.filter.stepsOfProfile.push(softProfileTypesEnum.initialKPIScores);
                                        $scope.filter.stepsOfProfile.push(softProfileTypesEnum.finalKPIResults);
                                    }
                                }
                                else {
                                    $scope.filter.mainStepsOfProfile = getDefaultKTProfileTypes();
                                    $scope.filter.stepsOfProfile = getDefaultKTProfileTypes();
                                }
                                if ($scope.filter.mainParticipantsModel.length) {
                                    performanceManagmentFilterService.getParticipantsBy($scope.filter.profileId, $scope.filter.stageId, $scope.filter.projectsModel,
                                        $scope.filter.departmentsModel, $scope.filter.teamsModel, $scope.filter.profileStageGroupId).then(function (data) {
                                            $scope.participants = [];
                                            $scope.filter.participants = [];
                                            $scope.isEvaluatorsEnabled = false;

                                            _.forEach(data, function (item) {
                                                $scope.participants.push({ id: item.participantId, name: item.firstName + " " + item.lastName, isSelfEvaluation: item.isSelfEvaluation });
                                            });

                                            if ($scope.participants.length > 0) {
                                                $scope.participants.splice(0, 0,
                                                    { id: -1, name: $translate.instant('SCORECARD_BENCHMARK') }
                                                );
                                                $scope.filter.mainParticipantsOptions = getMultiSelectOptions($scope.participants);
                                                $scope.filter.participantsOptions = getMultiSelectOptions($scope.participants);
                                                $scope.filter.participants = $scope.participants;
                                            }
                                            if ($scope.filter.profileType == $scope.profilesTypesEnum.soft) {
                                                performanceManagmentFilterService.getEvaluatorsForParticipant($scope.filter.profileId, $scope.filter.mainParticipantsModel).then(function (data) {
                                                    $scope.mainEvaluators = [];
                                                    $scope.filter.mainEvaluatorsOptions = [];

                                                    _.forEach(data, function (evaluator) {
                                                        $scope.mainEvaluators.push({ id: evaluator.participantId, name: evaluator.firstName + " " + evaluator.lastName, isSelfEvaluation: evaluator.isSelfEvaluation, IsScoreManager: evaluator.isScoreManager });
                                                        $scope.filter.mainEvaluatorsOptions = getMultiSelectOptions($scope.mainEvaluators);
                                                    });
                                                    if ($scope.mainEvaluators.length > 0) {
                                                        $scope.isMainEvaluatorsEnabled = true;
                                                    }

                                                });
                                            }
                                            if ($scope.filter.participantsModel.length) {
                                                performanceManagmentFilterService.getEvaluatorsForParticipant($scope.filter.profileId, $scope.filter.participantsModel).then(function (data) {
                                                    $scope.evaluators = [];
                                                    $scope.filter.evaluatorsOptions = [];
                                                    _.forEach(data, function (evaluator) {
                                                        $scope.evaluators.push({ id: evaluator.participantId, name: evaluator.firstName + " " + evaluator.lastName, isSelfEvaluation: evaluator.isSelfEvaluation, IsScoreManager: evaluator.isScoreManager });
                                                        $scope.filter.evaluatorsOptions = getMultiSelectOptions($scope.evaluators);
                                                    });
                                                    if ($scope.evaluators.length > 0) {
                                                        $scope.isEvaluatorsEnabled = true;
                                                    }
                                                    $scope.filter.isLoadCompareReport = true;
                                                    getFilteredData();
                                                });
                                            }


                                            if (!$scope.filter.participantsModel.length) {
                                                getFilteredData();
                                            }
                                        });
                                }
                            });
                        });

                    });
                }

            };

            $scope.smartButtonSettings = {
                smartButtonMaxItems: 3,
                smartButtonTextConverter: function (itemText, originalItem) {
                    return itemText;
                },
                template: '<b>{{option.label}}</b>'
            };

            $scope.getBenchmark = function () {
                $scope.$emit('benchmarkChanged', 'true');
            };
        }])

    .directive('performanceManagmentFilter', [function () {
        return {
            restrict: 'E',
            templateUrl: 'directives/performanceManagmentFilter/performanceManagmentFilter.html',
            scope: {
                filter: '='
            },
            controller: 'performanceManagmentFilterCtrl'
        };
    }]);