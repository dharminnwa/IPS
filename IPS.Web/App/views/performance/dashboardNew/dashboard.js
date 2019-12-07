'use strict';

angular
    .module('ips.performance')
    .config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
        $stateProvider
            .state('home.dashboard', {
                url: "/:profileType/dashboard",
                templateUrl: "views/performance/dashboardNew/dashboard.html",
                controller: "dashboardNewCtrl as dashboard",
                resolve: {
                    pageName: function ($translate) {
                        return $translate.instant('LEFTMENU_DASHBOARD');
                    }
                },
                data: {
                    displayName: '{{pageName}}',//'Dashboard',
                    paneLimit: 1,
                    depth: 2
                },
            })
            .state('home.performance.dashboard', {
                url: "/dashboard",
                templateUrl: "views/performance/dashboardNew/dashboard.html",
                controller: "dashboardNewCtrl as dashboard",
                resolve: {
                    pageName: function ($translate) {
                        return $translate.instant('LEFTMENU_DASHBOARD');
                    }
                },
                data: {
                    displayName: '{{pageName}}',//'Dashboard',
                    paneLimit: 1,
                    depth: 2
                },
            });
    }])

    .controller('dashboardNewCtrl', ['$scope', '$rootScope', '$state', '$stateParams', '$location', '$q', 'dashboardsServiceNew', 'cssInjector',
        'profilesTypesEnum', 'ktProfileTypesEnum', 'softProfileTypesEnum', 'localStorageService', '$translate',
        function ($scope, $rootScope, $state, $stateParams, $location, $q, dashboardsServiceNew, cssInjector,
            profilesTypesEnum, ktProfileTypesEnum, softProfileTypesEnum, localStorageService, $translate) {
            var dashboardsService = dashboardsServiceNew;
            cssInjector.removeAll();
            cssInjector.add('views/performance/dashboardNew/dashboard.css');
            $scope.dashboard = this;
            $scope.filteredResult = {
                isShowReport: false,
                isShowCompareReport: false,
                showGraph: true,
                showGauge: false,
                showKpiBar: false,
                showCompareKpi: false,
                showCompareGauge: false,
            };
            $scope.ktProfileTypes = {
                start: { id: 1, label: $translate.instant('COMMON_START_STAGE') },
                final: { id: 2, label: $translate.instant('COMMON_FINAL_STAGE') }
            };

            if ($stateParams.profileType) {
                if ($stateParams.profileType == "soft") {
                    $scope.profileType = profilesTypesEnum.soft;
                }
                else if ($stateParams.profileType == "knowledge") {
                    $scope.profileType = profilesTypesEnum.knowledgetest;
                }
            }
            $scope.filter = {
                profileTypeId: $scope.profileType,
                isShowBenchmark: false,
                isLoadReport: false,
                isLoadCompareReport: false,
                organizationId: null,
                projectsModel: [],
                departmentsModel: [],
                teamsModel: [],
                profileId: null,
                mainParticipantsModel: [],
                mainParticipantsOptions: [],
                mainEvaluatorsModel: [],
                mainEvaluatorsOptions: [],
                mainStageId: null,
                mainProfileStepId: null,
                mainStepsOfProfile: [],
                participantsModel: [],
                participantsOptions: [],
                evaluatorsModel: [],
                stageId: null,
                profileStepId: null
            };
            
            var filterData = localStorageService.get('perfomanceManagementFilterData');
            if (filterData) {
                $scope.filter = filterData;
                localStorageService.remove('perfomanceManagementFilterData');
            }

            $scope.init = function () { }

            var getLabelTextFromOptions = function (text, profileTypeOptions, id) {
                _.forEach(profileTypeOptions, function (profileType, index) {
                    if (id == profileType.id) {
                        text += profileType.label;
                    }
                });
                return text;
            };

            var getLabelText = function (options, ids) {
                var text = "";
                var optionsCount = ids.length;
                _.forEach(options, function (option) {
                    if (_.any(ids, function (idObj) { return idObj.id == option.id })) {
                        text += option.label;
                        if (--optionsCount) {
                            text += ', ';
                        }
                    }
                });
                return text;
            };



            var setFilteredDataToReport = function () {
                $scope.filteredResult.reportData.participantsId = $scope.filter.mainParticipantsModel;
                $scope.filteredResult.reportData.projectsModel = $scope.filter.projectsModel;
                //$scope.filteredResult.reportData.evaluatorsProfileScorecards = $scope.filter.mainEvaluatorsModel;
                $scope.filteredResult.reportData.cParticipantIds = $scope.filter.participantsModel;
                //$scope.filteredResult.reportData.cEvaluatorsProfileScorecards = $scope.filter.evaluatorsModel;
                $scope.filteredResult.reportData.mainStageId = $scope.filter.mainStageId;
                $scope.filteredResult.reportData.mainProfileStepId = $scope.filter.mainProfileStepId;
                $scope.filteredResult.reportData.cStageId = $scope.filter.stageId;
                $scope.filteredResult.reportData.cProfileTypeId = $scope.filter.profileStepId;
                $scope.filteredResult.reportData.mainParticipantsRaw = getLabelText($scope.filter.mainParticipantsOptions, $scope.filter.mainParticipantsModel);
                $scope.filteredResult.reportData.participantsRaw = getLabelText($scope.filter.participantsOptions, $scope.filter.participantsModel);
                $scope.filteredResult.reportData.mainEvolutionStageId = $scope.filter.mainEvolutionStageId;
                $scope.filteredResult.reportData.evolutionStageId = $scope.filter.evolutionStageId;
                $scope.filteredResult.reportData.isShowBenchmark = $scope.filter.isShowBenchmark;

                $scope.filteredResult.reportData.mainParticipants = $scope.filter.mainParticipantsOptions;
                $scope.filteredResult.reportData.participants = $scope.filter.participantsOptions;
                $scope.filteredResult.reportData.profileStageGroupId = $scope.filter.profileStageGroupId;

            }

            var getFilteredData = function () {

                $scope.filteredResult.showGraph = false;
                $scope.filteredResult.showGauge = false;
                $scope.filteredResult.showKpiBar = false;
                $scope.filteredResult.showCompareGauge = false;
                $scope.filteredResult.showCompareKpi = false;
                if ($scope.filter.profileType == profilesTypesEnum.soft) {
                    var mainEvaluatorsModel = $scope.filter.mainEvaluatorsModel;
                    if ($scope.filter.mainProfileStepId == softProfileTypesEnum.finalProfile.id || $scope.filter.mainProfileStepId == softProfileTypesEnum.finalKpi.id || $scope.filter.mainProfileStepId == softProfileTypesEnum.finalKPIResults.id) {
                        mainEvaluatorsModel = [];
                    }
                    var evaluatorsModel = $scope.filter.evaluatorsModel;
                    if ($scope.filter.profileStepId == softProfileTypesEnum.finalProfile.id || $scope.filter.profileStepId == softProfileTypesEnum.finalKpi.id || $scope.filter.profileStepId == softProfileTypesEnum.finalKPIResults.id) {
                        evaluatorsModel = [];
                    }

                    var participantsModel = $scope.filter.participantsModel;

                    dashboardsService.getDashboardData($scope.filter.profileId, $scope.filter.isShowBenchmark, $scope.filter.mainParticipantsModel, mainEvaluatorsModel, $scope.filter.mainStageId, $scope.filter.mainProfileStepId, null, $scope.filter.profileStageGroupId).then(function (data) {
                        $scope.filteredResult.isShowReport = true;
                        if ($scope.filter.mainStageName == "Start Stage" || $scope.filter.mainStageName.indexOf("Uke 1") > -1) {
                            //Rule1 - Self Evalution
                            if ($scope.filter.mainParticipantsModel.length == 1) {
                                //Rule1 - Self Evalution
                                if ($scope.filter.mainParticipantsModel[0].id == -1) {
                                    $scope.filteredResult.showCompareGauge = false;
                                    $scope.filteredResult.showCompareKpi = false;
                                }
                                else {

                                    if ((!mainEvaluatorsModel.length > 0)) {
                                        $scope.filteredResult.showGauge = true;
                                        $scope.filteredResult.showGraph = true;
                                        $scope.filteredResult.showKpiBar = true;
                                        if ($scope.filter.mainProfileStepId == softProfileTypesEnum.finalProfile.id) {
                                            $scope.filteredResult.showKpiBar = true // as per 25 January Bug.pptx;
                                        }
                                        if ($scope.filter.mainProfileStepId == softProfileTypesEnum.initialKPI.id || $scope.filter.mainProfileStepId == softProfileTypesEnum.finalKpi.id) {
                                            $scope.filteredResult.showKpiBar = true;
                                        }
                                    }
                                    else if (mainEvaluatorsModel.length > 0) {
                                        //Rule2 - Me and MYBoss
                                        if ($scope.filter.mainProfileStepId == softProfileTypesEnum.startProfile.id || $scope.filter.mainProfileStepId == softProfileTypesEnum.finalProfile.id) {
                                            $scope.filteredResult.showGraph = true;
                                            $scope.filteredResult.showGauge = true;
                                            $scope.filteredResult.showKpiBar = false;
                                        }
                                        else if ($scope.filter.mainProfileStepId == softProfileTypesEnum.initialKPI.id) {
                                            $scope.filteredResult.showGauge = true;
                                            $scope.filteredResult.showGraph = true;
                                            $scope.filteredResult.showKpiBar = true;
                                        }
                                        else if ($scope.filter.mainProfileStepId == softProfileTypesEnum.finalKpi.id) {
                                            $scope.filteredResult.showGauge = true;
                                            $scope.filteredResult.showGraph = true;
                                            $scope.filteredResult.showKpiBar = false;
                                        }
                                    }
                                    // Rule 4 - ME and Compare to
                                    if (participantsModel.length == 1) {
                                        if (participantsModel[0].id == -1) {
                                            $scope.filteredResult.showCompareGauge = false;
                                            $scope.filteredResult.showCompareKpi = false;
                                        }
                                        else if ($scope.filter.mainProfileStepId == softProfileTypesEnum.finalKpi.id && $scope.filter.profileStepId == softProfileTypesEnum.finalKpi.id && participantsModel[0].id == $scope.filter.mainParticipantsModel[0].id) {
                                            $scope.filteredResult.showCompareKpi = false;
                                            $scope.filteredResult.showCompareGauge = false;
                                        }
                                        else {
                                            if ((!evaluatorsModel.length > 0)) {
                                                $scope.filteredResult.showCompareGauge = true;
                                                $scope.filteredResult.showCompareKpi = true;

                                                if ($scope.filter.profileStepId == softProfileTypesEnum.initialKPI.id || $scope.filter.profileStepId == softProfileTypesEnum.finalKpi.id) {
                                                    $scope.filteredResult.showCompareKpi = true;
                                                    $scope.filteredResult.showCompareGauge = true;
                                                }
                                            }
                                            else if (evaluatorsModel.length > 0) {
                                                $scope.filteredResult.showCompareGauge = true;
                                                $scope.filteredResult.showCompareKpi = false;
                                            }
                                        }
                                    }
                                    else if (participantsModel.length > 1) {
                                        $scope.filteredResult.showGauge = true;
                                        $scope.filteredResult.showGraph = true;
                                        $scope.filteredResult.showKpiBar = false;

                                        $scope.filteredResult.showCompareGauge = true;
                                        $scope.filteredResult.showCompareKpi = false;
                                    }
                                    else {
                                        $scope.filteredResult.showCompareGauge = false;
                                        $scope.filteredResult.showCompareKpi = false;
                                    }
                                }
                            }
                            else if ($scope.filter.mainParticipantsModel.length > 1) {

                                $scope.filteredResult.showGraph = true;
                                $scope.filteredResult.showGauge = true;
                                $scope.filteredResult.showKpiBar = false;

                                // Rule 4 - ME and Compare to
                                if (participantsModel.length == 1) {
                                    if ((!mainEvaluatorsModel.length > 0)) {

                                        $scope.filteredResult.showCompareGauge = true;
                                        $scope.filteredResult.showCompareKpi = false;

                                        if ($scope.filter.mainProfileStepId == softProfileTypesEnum.initialKPI.id || $scope.filter.mainProfileStepId == softProfileTypesEnum.finalKpi.id) {
                                            $scope.filteredResult.showKpiBar = true;
                                            $scope.filteredResult.showCompareKpi = true;
                                            $scope.filteredResult.showCompareGauge = true;
                                        }

                                    }

                                }
                                else if (participantsModel.length > 1) {
                                    $scope.filteredResult.showGauge = true;
                                    $scope.filteredResult.showGraph = true;
                                    $scope.filteredResult.showKpiBar = false;

                                    $scope.filteredResult.showCompareGauge = true;
                                    $scope.filteredResult.showCompareKpi = false;
                                }
                                else {
                                    $scope.filteredResult.showCompareGauge = false;
                                    $scope.filteredResult.showCompareKpi = false;
                                }
                            }
                            else {
                                $scope.filteredResult.showGraph = false;
                                $scope.filteredResult.showKpiBar = false;
                                $scope.filteredResult.showGauge = false;

                            }
                        }
                        else {
                            if ($scope.filter.mainParticipantsModel.length == 1) {
                                if (!(participantsModel.length > 0)) {
                                    if ((!mainEvaluatorsModel.length > 0)) {

                                        if ($scope.filter.mainProfileStepId == softProfileTypesEnum.initialKPIScores.id) {
                                            $scope.filteredResult.showGraph = true;
                                            $scope.filteredResult.showKpiBar = false;
                                            $scope.filteredResult.showGauge = true;

                                            $scope.filteredResult.showCompareGauge = false;
                                            $scope.filteredResult.showCompareKpi = false;
                                        }
                                        else if ($scope.filter.mainProfileStepId == softProfileTypesEnum.finalKPIResults.id) {
                                            $scope.filteredResult.showGraph = true;
                                            $scope.filteredResult.showKpiBar = true;
                                            $scope.filteredResult.showGauge = true;
                                            $scope.filteredResult.showCompareGauge = false;
                                            $scope.filteredResult.showCompareKpi = false;
                                        }
                                    }
                                    else if (mainEvaluatorsModel.length > 0) {
                                        $scope.filteredResult.showGraph = true;
                                        $scope.filteredResult.showKpiBar = true;
                                        $scope.filteredResult.showGauge = true;
                                        $scope.filteredResult.showCompareGauge = false;
                                        $scope.filteredResult.showCompareKpi = false;

                                    }
                                }
                                else {
                                    if (participantsModel.length == 1) {
                                        if (participantsModel[0].id == -1 || participantsModel[0].id == $scope.filter.mainParticipantsModel[0].id) {
                                            $scope.filteredResult.showGauge = true;
                                            $scope.filteredResult.showGraph = true;
                                            $scope.filteredResult.showKpiBar = true;
                                            $scope.filteredResult.showCompareGauge = false;
                                            $scope.filteredResult.showCompareKpi = false;
                                        }

                                        else {
                                            if ((!mainEvaluatorsModel.length > 0)) {
                                                $scope.filteredResult.showGauge = true;
                                                $scope.filteredResult.showGraph = true;
                                                $scope.filteredResult.showKpiBar = false;

                                                $scope.filteredResult.showCompareGauge = true;
                                                $scope.filteredResult.showCompareKpi = true;

                                                if ($scope.filter.mainProfileStepId == softProfileTypesEnum.initialKPIScores.id) {
                                                    $scope.filteredResult.showKpiBar = false;
                                                    $scope.filteredResult.showCompareKpi = true;
                                                    $scope.filteredResult.showCompareGauge = true;
                                                }

                                                if ($scope.filter.mainProfileStepId == softProfileTypesEnum.finalKPIResults.id) {
                                                    $scope.filteredResult.showKpiBar = false;
                                                    $scope.filteredResult.showCompareKpi = true;
                                                    $scope.filteredResult.showCompareGauge = true;
                                                }

                                            }
                                            else if (mainEvaluatorsModel.length > 0) {

                                                $scope.filteredResult.showGauge = true;
                                                $scope.filteredResult.showGraph = true;
                                                $scope.filteredResult.showKpiBar = false;


                                                $scope.filteredResult.showCompareGauge = true;
                                                $scope.filteredResult.showCompareKpi = false;

                                                if ($scope.filter.mainProfileStepId == softProfileTypesEnum.initialKPIScores.id) {
                                                    $scope.filteredResult.showKpiBar = true;
                                                    $scope.filteredResult.showCompareKpi = true;
                                                    $scope.filteredResult.showCompareGauge = true;
                                                }
                                                else if ($scope.filter.mainProfileStepId == softProfileTypesEnum.finalKPIResults.id) {
                                                    $scope.filteredResult.showKpiBar = true;
                                                    $scope.filteredResult.showCompareKpi = true;
                                                    $scope.filteredResult.showCompareGauge = true;

                                                }
                                            }
                                        }
                                    }
                                    else if (participantsModel.length > 1) {
                                        $scope.filteredResult.showGauge = true;
                                        $scope.filteredResult.showGraph = true;
                                        $scope.filteredResult.showKpiBar = false;

                                        $scope.filteredResult.showCompareGauge = true;
                                        $scope.filteredResult.showCompareKpi = false;
                                    }
                                    else {
                                        $scope.filteredResult.showCompareGauge = false;
                                        $scope.filteredResult.showCompareKpi = false;
                                    }
                                }
                            }

                            else if ($scope.filter.mainParticipantsModel.length > 1) {

                                $scope.filteredResult.showGraph = true;
                                $scope.filteredResult.showKpiBar = false;
                                $scope.filteredResult.showGauge = true;
                                $scope.filteredResult.showCompareGauge = true;
                                $scope.filteredResult.showCompareKpi = false;
                            }
                            else {

                                $scope.filteredResult.showGraph = false;
                                $scope.filteredResult.showKpiBar = false;
                                $scope.filteredResult.showGauge = false;
                                $scope.filteredResult.showCompareGauge = false;
                                $scope.filteredResult.showCompareKpi = false;
                            }
                        }

                        $scope.filteredResult.compareReportData = null;

                        if (!data) {
                            data = {};
                        }

                        data.isCompare = false;

                        data.label = "";
                        var profileTypeName = "";
                        data.profileTypeName = getLabelTextFromOptions(profileTypeName, $scope.filter.mainStepsOfProfile, $scope.filter.mainProfileStepId);

                        angular.forEach($scope.filter.mainParticipantsModel, function (mParticipantSelectedEntry) {
                            angular.forEach($scope.filter.mainParticipantsOptions, function (mainParticipant) {
                                if (mParticipantSelectedEntry.id === mainParticipant.id) {
                                    data.label += " " + mainParticipant.label;
                                }
                            });
                        });


                        if (data.evaluatorsProfileScorecards && data.evaluatorsProfileScorecards.length > 0) {
                            angular.forEach(data.evaluatorsProfileScorecards, function (evaluatorProfileScorecard) {
                                var label = "";
                                angular.forEach(evaluatorProfileScorecard.participantsId, function (sourceId) {
                                    angular.forEach($scope.filter.mainEvaluatorsOptions, function (option) {
                                        if (option.id === sourceId) {
                                            label += " " + option.label;
                                        }
                                    });
                                });
                                evaluatorProfileScorecard.label = label;
                            });
                        }

                        data.isShowWeakKpi = data.weakAreas != null ? true : false;
                        data.isShowStrongKpi = data.strongAreas != null ? true : false;

                        data.isShowBenchmark = $scope.filter.isShowBenchmark;
                        $scope.filteredResult.reportData = data;
                        if ($scope.filter.isShowBenchmark) {
                            angular.forEach(data.performanceGroups, function (pg, pgIndex) {
                                angular.forEach(pg.skills, function (pgs, pgsIndex) {
                                    data.performanceGroups[pgIndex].skills[pgsIndex].bScore = data.performanceGroups[pgIndex].skills[pgsIndex].benchmark;
                                });
                            });
                        }

                        //data.isShowGoal = $scope.filter.isShowGoal;
                        data.isShowGoal = false;
                        $scope.filteredResult.reportData = data;


                        if ((participantsModel.length > 0) || ($scope.filter.comparePeriodId != null)) {

                            if ($scope.filter.compareParticipantId == -2) {
                                $scope.filter.compareParticipantId = $scope.filter.participantId;
                            }

                            dashboardsService.getDashboardData($scope.filter.profileId, $scope.filter.isShowBenchmark, participantsModel, evaluatorsModel, $scope.filter.stageId, $scope.filter.profileStepId, $scope.filter.comparePeriodId).then(function (compareData) {

                                var compareReportData = angular.copy($scope.filteredResult.reportData);

                                var cProfileTypeName = "";
                                compareReportData.cProfileTypeName = getLabelTextFromOptions(cProfileTypeName, $scope.filter.stepsOfProfile, $scope.filter.profileStepId);

                                compareReportData.cLabel = "";
                                angular.forEach(participantsModel, function (participantSelectedEntry) {
                                    if ($scope.filter.participantsOptions) {
                                        angular.forEach($scope.filter.participantsOptions, function (participant) {
                                            if (participantSelectedEntry.id === participant.id) {
                                                compareReportData.cLabel += " " + participant.label;
                                            }
                                        });
                                    }
                                });

                                compareReportData.cAverageScore = compareData.averageScore;
                                compareReportData.cStrongAverageScore = compareData.strongAverageScore;
                                compareReportData.cWeakAverageScore = compareData.weakAverageScore;

                                angular.forEach(compareReportData.performanceGroups, function (pg, pgIndex) {
                                    compareReportData.performanceGroups[pgIndex].cScore = compareData.performanceGroups[pgIndex].score;
                                    //compareReportData.performanceGroups[pgIndex].cGoal = compareData.performanceGroups[pgIndex].goal;
                                    angular.forEach(pg.skills, function (pgs, pgsIndex) {
                                        compareReportData.performanceGroups[pgIndex].skills[pgsIndex].cScore = compareData.performanceGroups[pgIndex].skills[pgsIndex].score;
                                        compareReportData.performanceGroups[pgIndex].skills[pgsIndex].cComment = compareData.performanceGroups[pgIndex].skills[pgsIndex].comment;
                                        compareReportData.performanceGroups[pgIndex].skills[pgsIndex].cGoal = compareData.performanceGroups[pgIndex].skills[pgsIndex].goal;
                                    });
                                });


                                angular.forEach(compareReportData.strongAreas, function (item, index) {
                                    var compareDataStrong = 0;
                                    compareReportData.cStrongAreas = [];
                                    if (compareData.strongAreas)
                                        angular.forEach(compareData.strongAreas, function (sa) {
                                            compareReportData.cStrongAreas.push(sa);
                                            if (item.id == sa.id && sa.score) {
                                                compareDataStrong = sa.score;
                                                return;
                                            }
                                            else {

                                            }
                                        });

                                    compareReportData.strongAreas[index].cScore = compareDataStrong;
                                });

                                angular.forEach(compareReportData.weakAreas, function (item, index) {
                                    var compareDataWeak = 0;
                                    compareReportData.cWeakAreas = [];
                                    if (compareData.weakAreas)
                                        angular.forEach(compareData.weakAreas, function (sa) {
                                            compareReportData.cWeakAreas.push(sa);
                                            if (item.id == sa.id && sa.score) {
                                                compareDataWeak = sa.score;
                                                return;
                                            }
                                        });

                                    compareReportData.weakAreas[index].cScore = compareDataWeak;
                                });

                                compareReportData.isCompare = true;
                                if (compareData.evaluatorsProfileScorecards && compareData.evaluatorsProfileScorecards.length > 0) {
                                    angular.forEach(compareData.evaluatorsProfileScorecards, function (evaluatorProfileScorecard) {
                                        var label = "";
                                        angular.forEach(evaluatorProfileScorecard.participantsId, function (sourceId) {
                                            angular.forEach($scope.filter.evaluatorsOptions, function (option) {
                                                if (option.id === sourceId) {
                                                    label += " " + option.label;
                                                }
                                            });
                                        });
                                        evaluatorProfileScorecard.label = label;
                                    });
                                }

                                compareReportData.cEvaluatorsProfileScorecards = compareData.evaluatorsProfileScorecards;
                                compareReportData.cExtraProfileScorecards = compareData.extraProfileScorecards;
                                compareReportData.isShowCompareGoal = $scope.filter.isShowCompareGoal;

                                compareReportData.cParticipantIds = compareData.participantsId;
                                compareReportData.mainProfileStepId = $scope.filter.mainProfileStepId;
                                compareReportData.profileStepId = $scope.filter.profileStepId;
                                compareReportData.mainStageId = $scope.filter.mainStageId;
                                compareReportData.mainStageName = $scope.filter.mainStageName;
                                compareReportData.cProfileTypeId = $scope.filter.profileStepId;
                                compareReportData.cStageId = $scope.filter.stageId;
                                compareReportData.stageName = $scope.filter.stageName;
                                compareReportData.evolutionStageId = $scope.filter.evolutionStageId;
                                compareReportData.mainEvolutionStageId = $scope.filter.mainEvolutionStageId;
                                $scope.filteredResult.reportData = compareReportData;
                                setFilteredDataToReport();
                            });
                        }
                        else {
                            setFilteredDataToReport();
                        }

                        //if (($scope.filter.mainEvaluatorsModel.length > 0) || ($scope.filter.comparePeriodId != null)) {

                        //    if ($scope.filter.compareParticipantId == -2) {
                        //        $scope.filter.compareParticipantId = $scope.filter.participantId;
                        //    }

                        //    dashboardsService.getDashboardData($scope.filter.profileId, $scope.filter.isShowBenchmark, $scope.filter.participantsModel, $scope.filter.evaluatorsModel, $scope.filter.stageId, $scope.filter.profileStepId, $scope.filter.comparePeriodId).then(function (compareData) {

                        //        var compareReportData = angular.copy($scope.filteredResult.reportData);

                        //        var cProfileTypeName = "";
                        //        compareReportData.cProfileTypeName = getLabelTextFromOptions(cProfileTypeName, $scope.filter.stepsOfProfile, $scope.filter.profileStepId);

                        //        compareReportData.cLabel = "";
                        //        angular.forEach($scope.filter.participantsModel, function (participantSelectedEntry) {
                        //            if ($scope.filter.participantsOptions) {
                        //                angular.forEach($scope.filter.participantsOptions, function (participant) {
                        //                    if (participantSelectedEntry.id === participant.id) {
                        //                        compareReportData.cLabel += " " + participant.label;
                        //                    }
                        //                });
                        //            }
                        //        });

                        //        compareReportData.cAverageScore = compareData.averageScore;
                        //        compareReportData.cStrongAverageScore = compareData.strongAverageScore;
                        //        compareReportData.cWeakAverageScore = compareData.weakAverageScore;

                        //        angular.forEach(compareReportData.performanceGroups, function (pg, pgIndex) {
                        //            compareReportData.performanceGroups[pgIndex].cScore = compareData.performanceGroups[pgIndex].score;
                        //            //compareReportData.performanceGroups[pgIndex].cGoal = compareData.performanceGroups[pgIndex].goal;
                        //            angular.forEach(pg.skills, function (pgs, pgsIndex) {
                        //                compareReportData.performanceGroups[pgIndex].skills[pgsIndex].cScore = compareData.performanceGroups[pgIndex].skills[pgsIndex].score;
                        //                compareReportData.performanceGroups[pgIndex].skills[pgsIndex].cComment = compareData.performanceGroups[pgIndex].skills[pgsIndex].comment;
                        //                compareReportData.performanceGroups[pgIndex].skills[pgsIndex].cGoal = compareData.performanceGroups[pgIndex].skills[pgsIndex].goal;
                        //            });
                        //        });


                        //        angular.forEach(compareReportData.strongAreas, function (item, index) {
                        //            var compareDataStrong = 0;
                        //            if (compareData.strongAreas)
                        //                angular.forEach(compareData.strongAreas, function (sa) {
                        //                    if (item.id == sa.id && sa.score) {
                        //                        compareDataStrong = sa.score;
                        //                        return;
                        //                    }
                        //                });

                        //            compareReportData.strongAreas[index].cScore = compareDataStrong;
                        //        });

                        //        angular.forEach(compareReportData.weakAreas, function (item, index) {
                        //            var compareDataWeak = 0;
                        //            if (compareData.weakAreas)
                        //                angular.forEach(compareData.weakAreas, function (sa) {
                        //                    if (item.id == sa.id && sa.score) {
                        //                        compareDataWeak = sa.score;
                        //                        return;
                        //                    }
                        //                });

                        //            compareReportData.weakAreas[index].cScore = compareDataWeak;
                        //        });
                        //        compareReportData.isCompare = true;
                        //        if (compareData.evaluatorsProfileScorecards && compareData.evaluatorsProfileScorecards.length > 0) {
                        //            angular.forEach(compareData.evaluatorsProfileScorecards, function (evaluatorProfileScorecard) {
                        //                var label = "";
                        //                angular.forEach(evaluatorProfileScorecard.participantsId, function (sourceId) {
                        //                    angular.forEach($scope.filter.evaluatorsOptions, function (option) {
                        //                        if (option.id === sourceId) {
                        //                            label += " " + option.label;
                        //                        }
                        //                    });
                        //                });
                        //                evaluatorProfileScorecard.label = label;
                        //            });
                        //        }
                        //        compareReportData.cEvaluatorsProfileScorecards = compareData.evaluatorsProfileScorecards;
                        //        compareReportData.cExtraProfileScorecards = compareData.extraProfileScorecards;
                        //        compareReportData.isShowCompareGoal = $scope.filter.isShowCompareGoal;

                        //        compareReportData.cParticipantIds = compareData.participantsId;
                        //        compareReportData.mainProfileStepId = $scope.filter.mainProfileStepIds;
                        //        compareReportData.mainStageId = $scope.filter.mainStageId;
                        //        compareReportData.cProfileTypeId = $scope.filter.profileStepId;
                        //        compareReportData.cStageId = $scope.filter.stageId;
                        //        $scope.filteredResult.reportData = compareReportData;
                        //        setFilteredDataToReport();
                        //    });
                        //}
                    });
                }
                else {
                    dashboardsService.getKTProfileAllStagesResult($scope.filter.profileId, $scope.filter.mainParticipantsModel,
                        $scope.filter.mainProfileStepId == $scope.ktProfileTypes.start.id).then(function (stagesResult) {
                            $scope.filteredResult.ktStagesResults = stagesResult;

                            dashboardsService.getKTDashboardData($scope.filter.mainParticipantsModel, $scope.filter.profileId,
                                $scope.filter.mainStageId, $scope.filter.mainProfileStepId == $scope.ktProfileTypes.start.id).then(function (data) {

                                    $scope.data = data;

                                    if ($scope.filter.isShowBenchmark) {
                                        dashboardsService.getKTAllStagesBenchmarks($scope.filter.profileId).then(function (benchmarks) {
                                            $scope.benchmarksStages = benchmarks;
                                            dashboardsService.getKTBenchmark($scope.filter.profileId, $scope.filter.mainStageId).then(function (benchmark) {
                                                $scope.filteredResult.reportData = $scope.data;
                                                $scope.filteredResult.reportData.benchmark = benchmark;
                                                $scope.filteredResult.reportData.benchmarksStages = $scope.benchmarksStages;
                                                setFilteredDataToReport();
                                                $scope.filteredResult.reportData.isShowBenchmark = $scope.filter.isShowBenchmark;
                                                $scope.filteredResult.isShowReport = true;
                                            });
                                        });
                                    }
                                    else {
                                        $scope.filteredResult.reportData = $scope.data;
                                        setFilteredDataToReport();
                                        $scope.filteredResult.isShowReport = true;
                                    }

                                });
                        });
                }
            };

            function getFilteredComparisonData() {
                dashboardsService.getKTProfileAllStagesResult($scope.filter.profileId, $scope.filter.participantsModel,
                    $scope.filter.profileStepId == $scope.ktProfileTypes.start.id).then(function (stagesResult) {
                        $scope.filteredResult.ktCompareStagesResults = stagesResult;

                        dashboardsService.getKTDashboardData($scope.filter.participantsModel, $scope.filter.profileId,
                            $scope.filter.stageId, $scope.filter.profileStepId == $scope.ktProfileTypes.start.id).then(function (data) {
                                $scope.filteredResult.compareReportData = data;
                                $scope.filteredResult.isShowCompareReport = true;
                            });
                    });
            };

            function goBack() {
                history.back();
            }

            $scope.dashboard.goBack = goBack;

            $rootScope.dashboard = $scope.dashboard;

            $scope.$on('filterChanged', function (event, message) {
                $scope.filteredResult.showCompareKpi = false;
                $scope.filteredResult.showCompareGauge = false;
                $scope.filteredResult.showGraph = false;
                $scope.filteredResult.showKpiBar = false;
                $scope.filteredResult.showGauge = false;
                $scope.filteredResult.isShowReport = $scope.filter.isLoadReport;
                $scope.filteredResult.isShowCompareReport = $scope.filter.isLoadCompareReport;
                if ($scope.filter.isLoadReport) {
                    getFilteredData();
                }
                else {
                    $scope.filteredResult.isShowReport = false;
                }

                if ($scope.filter.isLoadCompareReport) {
                    getFilteredComparisonData();
                }
                else {
                    $scope.filteredResult.isShowCompareReport = false;
                }
            });
            $scope.$on('benchmarkChanged', function (event, message) {
                if ($scope.filter.isLoadReport) {
                    getFilteredData();
                }
                if ($scope.filter.isLoadCompareReport) {
                    getFilteredComparisonData();
                }
            });
        }]);