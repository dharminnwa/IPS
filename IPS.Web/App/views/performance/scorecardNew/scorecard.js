(function () {
    'use strict';

    angular
        .module('ips.performance')
        .constant('softProfileTypesEnum', {
            startProfile: { id: 1, label: "Start Profile" },
            finalProfile: { id: 2, label: "Agreed Final Profile" },
            initialKPI: { id: 3, label: "Initial KPI" },
            finalKpi: { id: 4, label: "Agreed Final KPI" },
            initialKPIScores: { id: 3, label: "Initial KPI Scores" },
            finalKPIResults: { id: 4, label: "Agreed Final KPI Results" }
        })
        .config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
            var baseScorecardResolve = {
                pageName: function ($translate) {
                    return $translate.instant('COMMON_SCORECARD');
                },
            };
            $stateProvider
                .state('home.scorecard', {
                    url: "/:profileType/scorecard",
                    templateUrl: "views/performance/scorecardNew/scorecard.html",
                    controller: "scorecardNewCtrl as scorecard",
                    resolve: baseScorecardResolve,
                    data: {
                        displayName: '{{pageName}}',//'Scorecard',
                        paneLimit: 1,
                        depth: 2
                    }
                })
                .state('home.performance.scorecard', {
                    url: "/scorecard",
                    templateUrl: "views/performance/scorecardNew/scorecard.html",
                    controller: "scorecardNewCtrl as scorecard",
                    resolve: baseScorecardResolve,
                    data: {
                        displayName: '{{pageName}}',//'Scorecard',
                        paneLimit: 1,
                        depth: 2
                    }
                })
                .state('home.performance.scorecard:organizationId:projectId:profileId:stageGroupId:departmentId:teamId:mainParticipantIds:mainEvaluatorIds:mainStageId:mainProfileStepId:participantIds:evaluatorIds:stageId:profileStepId:isShowBenchmark', {
                    url: "/scorecard/:organizationId/:projectId/:profileId/:stageGroupId/:departmentId/:teamId/:mainParticipantIds/:mainEvaluatorIds/:mainStageId/:mainProfileStepId/:participantIds/:evaluatorIds/:stageId/:profileStepId/:isShowBenchmark",
                    templateUrl: "views/performance/scorecardNew/scorecard.html",
                    controller: "scorecardNewCtrl as scorecard",
                    resolve: {
                    },
                    data: {
                        displayName: '{{pageName}}',//'Scorecard',
                        paneLimit: 1,
                        depth: 2
                    }
                });;
        }])

        .controller('scorecardNewCtrl', scorecardCtrl);

    scorecardCtrl.$inject = ['cssInjector', '$scope', '$stateParams', '$location', 'scorecardsServiceNew', 'profilesTypesEnum',
        'ktProfileTypesEnum', 'passScoreIndicator', 'softProfileTypesEnum', 'localStorageService', '$state', '$translate'];

    function scorecardCtrl(cssInjector, $scope, $stateParams, $location, scorecardsServiceNew, profilesTypesEnum,
        ktProfileTypesEnum, passScoreIndicator, softProfileTypesEnum, localStorageService, $state, $translate) {
        cssInjector.removeAll();
        cssInjector.add('views/performance/scorecardNew/scorecard.css');

        var scorecardsService = scorecardsServiceNew;

        var getObjectsFromStr = function (str) {
            if (str) {
                var strIds = str.split(';');
                var objects = [];
                _.forEach(strIds, function (srtId) {
                    var parsedId = parseInt(srtId);
                    if (parsedId) {
                        objects.push({ id: parsedId });
                    }
                });
                return objects;
            }
            else {
                return [];
            }
        }

        var getIdFromStr = function (str) {
            var id = parseInt(str);
            return id ? id : null;
        }

        $scope.filteredResult = {
            isShowReport: false,
            isShowCompareReport: false
        };

        $scope.ktProfileTypes = {
            start: { id: 1, label: $translate.instant('COMMON_START_STAGE') },
            final: { id: 2, label: $translate.instant('COMMON_FINAL_STAGE') }
        };
        $scope.profileType = null;
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
            isShowBenchmark: $stateParams.isShowBenchmark == "true",
            isLoadReport: false,
            isLoadCompareReport: false,
            organizationId: getIdFromStr($stateParams.organizationId),
            projectsModel: getObjectsFromStr($stateParams.projectId),
            departmentsModel: getObjectsFromStr($stateParams.departmentId),
            teamsModel: getObjectsFromStr($stateParams.teamId),
            profileId: getIdFromStr($stateParams.profileId),
            mainParticipantsModel: getObjectsFromStr($stateParams.mainParticipantIds),
            mainParticipantsOptions: [],
            mainEvaluatorsModel: getObjectsFromStr($stateParams.mainEvaluatorIds),
            mainEvaluatorsOptions: [],
            profileStageGroupId: $stateParams.stageGroupId,
            mainStageId: getIdFromStr($stateParams.mainStageId),
            mainProfileStepId: getIdFromStr($stateParams.mainProfileStepId),
            mainStepsOfProfile: [],
            participantsModel: getObjectsFromStr($stateParams.participantIds),
            participantsOptions: [],
            evaluatorsModel: getObjectsFromStr($stateParams.evaluatorIds),
            evaluatorsOptions: [],
            stageId: getIdFromStr($stateParams.stageId),
            profileStepId: getIdFromStr($stateParams.profileStepId),
            stepsOfProfile: []
        };
        if ($scope.filter.profileId > 0) {
            scorecardsServiceNew.getProfileById($scope.filter.profileId).then(function (data) {
                $scope.profile = data;
            })
        }
        

        $scope.scorecard = this;
        $scope.scorecard.performanceGroups = [];

        $scope.scorecard.isShowGoal = false;
        $scope.scorecard.isShowCompareGoal = false;

        $scope.scorecard.evaluatorId = null;
        $scope.scorecard.groupBy = [{ id: 0, name: $translate.instant('COMMON_PERFORMANCE_GROUP') }, { id: 1, name: $translate.instant('COMMON_PERSPECTIVE') }];
        $scope.scorecard.groupById = 0;
        $scope.scorecard.legends = [];

        $scope.scorecard.isMainEvaluatorsEnabled = false;
        $scope.scorecard.isEvaluatorsEnabled = false;

        $scope.scorecard.showMainIniKpi = false;
        $scope.scorecard.showMainFinalKpi = false;

        $scope.scorecard.showCompareToIniKpi = false;
        $scope.scorecard.showCompareToFinalKpi = false;

        $scope.scorecard.showGrid = false;


        $scope.scorecard.goBack = goBack;
        $scope.scorecard.getScorecardData = getScorecardData;
        $scope.scorecard.getBenchmark = getBenchmark;
        $scope.scorecard.SetKPI = SetKPI;

        $scope.scorecard.statusFilterDisabled = false;

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
        function getBenchmark() {
            var treelist = $("#scorecardGrid").data("kendoGrid");
            var targetColName = "target";
            if ($scope.filter.isShowBenchmark)
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

        function getLegendNames(model, color, participants, postfix, role) {
            var name = role + "";
            _.forEach(model, function (m, mIndex) {
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
            return { color: color, name: name };
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


        function getScorecardData() {
            if ($scope.filter.profileType == profilesTypesEnum.soft) {
                getSoftScorecardData();
            }
            else {
                getKTScorecardData();
            }
        }

        function setKTIndicatorColor(data) {
            if (data.passScore) {
                _.forEach(data.skillResults, function (dataItem) {
                    if (dataItem.id == -1) {
                        dataItem.indicator = dataItem.percentScore > data.passScore ? passScoreIndicator.passed : passScoreIndicator.failed;
                        dataItem.cIndicator = passScoreIndicator.failed;
                    }
                });
            }
            else {
                _.forEach(data.skillResults, function (dataItem) {
                    if (dataItem.id == -1) {
                        if (_.isNull(dataItem.correctAnswersCountScore) || _.isUndefined(dataItem.correctAnswersCountScore) || dataItem.correctAnswersCountScore == 0) {
                            dataItem.indicator = passScoreIndicator.failed;
                            dataItem.cIndicator = passScoreIndicator.failed;

                        }
                        else {
                            dataItem.indicator = passScoreIndicator.passed;
                            dataItem.cIndicator = passScoreIndicator.passed;

                        }
                    }
                });
            }
        }

        function getSoftScorecardData() {
            if ($scope.filter.profileId != null) {
                $scope.scorecard.reportData = [];
                scorecardsService.loadScorecardData($scope.filter.profileId, $scope.filter.isShowBenchmark, $scope.filter.mainParticipantsModel,
                    $scope.filter.mainEvaluatorsModel, $scope.filter.mainStageId, $scope.filter.mainProfileStepId, null, $scope.filter.profileStageGroupId).then(function (data) {
                        if (data && data.performanceGroups) {
                            var scaleRanges = data.scale.scaleRanges;
                            var scale = getScaleRange(scaleRanges);

                            var colorMainPart = "black";
                            var colorMainEval = "orange";
                            var colorPart = "blue";
                            var colorEval = "purple";
                            var columnCount = 0;

                            if ($scope.filter.mainParticipantsModel.length > 0)
                                columnCount++;
                            if ($scope.filter.mainEvaluatorsModel.length > 0)
                                columnCount++;
                            if ($scope.filter.participantsModel.length > 0)
                                columnCount++;
                            if ($scope.filter.evaluatorsModel.length > 0)
                                columnCount++;

                            var columnWidth = 10 / columnCount; //20% available for maximum 8 columns
                            var columnWidthText = columnWidth + "%";
                            scorecardsService.loadScorecardData($scope.filter.profileId, $scope.filter.isShowBenchmark, $scope.filter.participantsModel,
                                $scope.filter.evaluatorsModel, $scope.filter.stageId, $scope.filter.profileStepId, null, $scope.filter.profileStageGroupId).then(function (compareData) {

                                    _.forEach(data.performanceGroups, function (pg, pgIndex) {
                                        data.performanceGroups[pgIndex].compareScore = compareData.performanceGroups[pgIndex].score;
                                        data.performanceGroups[pgIndex].comparePerformance = compareData.performanceGroups[pgIndex].performance;

                                        _.forEach(pg.skills, function (pgs, pgsIndex) {
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
                                        _.forEach(compareData.evaluatorsProfileScorecards, function (esc, escIndex) {
                                            _.forEach(esc.performanceGroups, function (epg, epgIndex) {
                                                _.forEach(epg.skills, function (epgs, epgsIndex) {
                                                    data.performanceGroups[epgIndex].skills[epgsIndex].compareScoreEval = esc.performanceGroups[epgIndex].skills[epgsIndex].score;
                                                    data.performanceGroups[epgIndex].skills[epgsIndex].comparePerformanceEval = esc.performanceGroups[epgIndex].skills[epgsIndex].performance;
                                                });
                                            });
                                        });
                                    }

                                    if (data.evaluatorsProfileScorecards && data.evaluatorsProfileScorecards.length > 0) {
                                        _.forEach(data.evaluatorsProfileScorecards, function (esc, escIndex) {
                                            _.forEach(esc.performanceGroups, function (epg, epgIndex) {
                                                _.forEach(epg.skills, function (epgs, epgsIndex) {
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
                                            _.forEach(data.performanceGroups, function (pg, pgIndex) {
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

                                        _.forEach(data.performanceGroups, function (pg, pgIndex) {
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

                                            pgItem.scoreEval = pgItem.scoreEval ? pgItem.scoreEval : null;
                                            pgItem.compareScoreEval = pgItem.compareScoreEval ? pgItem.compareScoreEval : null;
                                            pgItem.performanceEval = pgItem.performanceEval ? pgItem.performanceEval : '';
                                            pgItem.comparePerformanceEval = pgItem.comparePerformanceEval ? pgItem.comparePerformanceEval : '';
                                            //Used on performance/scorecard
                                            //$scope.scorecard.reportData.push(pgItem);
                                            var pgname = pgItem.pgName;
                                            _.forEach(pg.skills, function (pgs, pgsIndex) {
                                                var pgsItem = angular.copy(pgs);
                                                pgsItem.questions = null;
                                                pgsItem.id = (1 + pgIndex) * 1000 + pgsIndex;
                                                pgsItem.parentId = pgIndex;
                                                pgsItem.pgName = pgname;
                                                pgsItem.scale = scale;
                                                pgsItem.comparePerformance = pgs.comparePerformance ? pgs.comparePerformance : "";
                                                pgsItem.color = getScaleColor(scaleRanges, pgsItem.score) ? getScaleColor(scaleRanges, pgsItem.score) : "";
                                                pgsItem.target = pgs.benchmark;
                                                pgsItem.sName = pgs.name;

                                                pgsItem.compareScore = pgsItem.compareScore ? pgsItem.compareScore : null;
                                                pgsItem.comparePerformance = pgsItem.comparePerformance ? pgsItem.comparePerformance : "";
                                                pgsItem.scoreEval = pgsItem.scoreEval ? pgsItem.scoreEval : null;
                                                pgsItem.compareScoreEval = pgsItem.compareScoreEval ? pgsItem.compareScoreEval : null;
                                                pgsItem.performanceEval = pgsItem.performanceEval ? pgsItem.performanceEval : "";
                                                pgsItem.comparePerformanceEval = pgsItem.comparePerformanceEval ? pgsItem.comparePerformanceEval : "";
                                                pgsItem.kpi = pgs.questions[0].id;
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
                                                            if ($scope.filter.mainParticipantsModel.length == 1 && $scope.filter.participantsModel.length == 1) {
                                                                if ($scope.filter.mainParticipantsModel[0].id == $scope.filter.participantsModel[0].id) {
                                                                    if ($scope.filter.mainStageId < $scope.filter.stageId) {
                                                                        pgsItem.trend = ev > pgsItem.score ? "Up" : "Down";
                                                                    }
                                                                    else if ($scope.filter.mainStageId > $scope.filter.stageId) {
                                                                        pgsItem.trend = pgsItem.score > ev ? "Up" : "Down";
                                                                        pgsItem.progress = Math.ceil((pgsItem.score - ev) * 100 / ev);
                                                                    }
                                                                }
                                                                else if ($scope.filter.participantsModel.length == 1) {
                                                                    if ($scope.filter.participantsModel[0].id == -1) {
                                                                        pgsItem.trend = (pgsItem.score - ev) < 0 ? "Down" : "Up";
                                                                        pgsItem.progress = Math.ceil((pgsItem.score - ev) * 100 / ev);
                                                                    }
                                                                }
                                                            }
                                                            else if ($scope.filter.participantsModel.length == 1) {
                                                                if ($scope.filter.participantsModel[0].id == -1) {
                                                                    pgsItem.trend = (pgsItem.score - ev) < 0 ? "Down" : "Up";
                                                                    pgsItem.progress = Math.ceil((pgsItem.score - ev) * 100 / ev);
                                                                }
                                                            }

                                                        }
                                                    }
                                                }

                                                if (!(($scope.filter.mainProfileStepId == 3 || $scope.filter.mainProfileStepId == 4) && pgsItem.color == ""))
                                                    $scope.scorecard.reportData.push(pgsItem);
                                            })
                                        });

                                        if ($("#scorecardGrid").length > 0) {
                                            $("#scorecardGrid").empty();

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
                                            else if ($scope.filter.mainParticipantsModel) {
                                                if ($scope.filter.mainParticipantsModel) {
                                                    if ($scope.filter.mainParticipantsModel.length > 0) {
                                                        _.forEach($scope.filter.mainParticipantsModel, function (item) {
                                                            mainParticipant = _.find($scope.filter.mainParticipantsOptions, function (p) {
                                                                return p.id == item.id;
                                                            });

                                                            if (mainParticipant) {
                                                                mainParticipantRow += (mainParticipant.label) ? mainParticipant.label : (mainParticipant.name ? mainParticipant.name : "Main Participant");
                                                                mainParticipantRow += ",";
                                                            }
                                                        })

                                                    }
                                                }
                                            }

                                            if ($scope.scorecard.mainEvaluatorsModel) {
                                                if ($scope.scorecard.mainEvaluatorsModel.length > 0) {
                                                    mainEvaluator = _.find($scope.scorecard.mainEvaluators, function (p) {
                                                        return p.id == $scope.scorecard.mainEvaluatorsModel[0].id;
                                                    })
                                                }
                                            }
                                            else if ($scope.filter.mainEvaluatorsModel) {
                                                if ($scope.filter.mainEvaluatorsModel.length > 0) {
                                                    mainEvaluator = _.find($scope.filter.mainEvaluatorsOptions, function (p) {
                                                        return p.id == $scope.filter.mainEvaluatorsModel[0].id;
                                                    })
                                                }
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
                                            else if ($scope.filter.participantsModel) {
                                                if ($scope.filter.participantsModel.length > 0) {
                                                    _.forEach($scope.filter.participantsModel, function (item) {

                                                        comparedParticipant = _.find($scope.filter.participantsOptions, function (p) {
                                                            return p.id == item.id;
                                                        })
                                                        if (comparedParticipant) {
                                                            compareParticipantRow += comparedParticipant.label ? comparedParticipant.label : (comparedParticipant.name ? comparedParticipant.name : "Compare Participant");
                                                            compareParticipantRow += ",";
                                                        }
                                                    })
                                                }
                                            }

                                            if ($scope.scorecard.mainParticipantsModel) {
                                                if ($scope.scorecard.evaluatorsModel.length > 0) {
                                                    comparedEvaluator = _.find($scope.scorecard.evaluators, function (p) {
                                                        return p.id == $scope.scorecard.evaluatorsModel[0].id;
                                                    })
                                                }
                                            }
                                            else if ($scope.filter.evaluatorsModel) {
                                                if ($scope.filter.evaluatorsModel.length > 0) {
                                                    comparedEvaluator = _.find($scope.filter.evaluatorsOptions, function (p) {
                                                        return p.id == $scope.filter.evaluatorsModel[0].id;
                                                    })
                                                }
                                            }

                                            //var mainParticipantRow = (mainParticipant.label) ? mainParticipant.label : (mainParticipant.name ? mainParticipant.name : "Main Participant");

                                            if (mainParticipantRow.lastIndexOf(',') == mainParticipantRow.length - 1) {
                                                mainParticipantRow = mainParticipantRow.substring(0, mainParticipantRow.length - 1)
                                            }
                                            if (compareParticipantRow.lastIndexOf(',') == compareParticipantRow.length - 1) {
                                                compareParticipantRow = compareParticipantRow.substring(0, compareParticipantRow.length - 1)
                                            }

                                            var mainEvalutorRow = "";
                                            if (mainEvaluator) {
                                                mainEvalutorRow = mainEvaluator.label ? mainEvaluator.label : (mainEvaluator.name ? mainEvaluator.name : "xMain Evaluator");
                                            }


                                            var compareEvalutorRow = "";
                                            if (comparedEvaluator) {
                                                compareEvalutorRow = comparedEvaluator.label ? comparedEvaluator.label : (comparedEvaluator.name ? comparedEvaluator.name : "Compare Evaluator");
                                            }

                                            var grid = $("#scorecardGrid").kendoGrid({
                                                dataSource: $scope.scorecard.reportData,
                                                //loadOnDemand: false,
                                                sortable: true,
                                                //filterable: {
                                                //    mode: "row"
                                                //},
                                                //columnMenu: true,
                                                columns: [

                                                    { field: "pgName", title: $translate.instant('COMMON_PERFORMANCE_GROUP'), width: "11%" },
                                                    { field: "sName", title: $translate.instant('COMMON_SKILL'), width: "11%" },
                                                    { field: "scale", title: $translate.instant('SCORECARD_SCALE'), width: "7%", template: "<div class='number'>#= scale #</div>" },
                                                    { field: "baseline", title: $translate.instant('SCORECARD_BASELINE'), width: "6%", template: "<div class='number'>#= baseline #</div>" },
                                                    { field: "indicator", title: $translate.instant('SCORECARD_INDICATOR'), width: "5%", template: "<div class='scale-circle' style='background: #: color #'></div>" },
                                                    { field: "score", title: mainParticipantRow + " " + $translate.instant('COMMON_PERFORMANCE'), width: columnWidthText, template: "<div class='number' style='color:" + colorMainPart + "'>#= (score == null) ? ' ' : score #</div>", hidden: true },
                                                    { field: "scoreEval", title: mainEvalutorRow + " " + $translate.instant('COMMON_PERFORMANCE'), width: columnWidthText, template: "<div class='number' style='color:" + colorMainEval + "'>#= (scoreEval == null) ? ' ' : scoreEval #</div>", hidden: false },
                                                    { field: "compareScore", title: compareParticipantRow + " " + $translate.instant('COMMON_PERFORMANCE'), width: columnWidthText, template: "<div class='number' style='color:" + colorPart + "'>#= (compareScore == null) ? ' ' : compareScore #</div>", hidden: true },
                                                    { field: "compareScoreEval", title: compareEvalutorRow + " " + $translate.instant('COMMON_PERFORMANCE'), width: columnWidthText, template: "<div class='number' style='color:" + colorEval + "'>#= (compareScoreEval == null) ? ' ' : compareScoreEval #</div>", hidden: false },
                                                    { field: "performance", title: mainParticipantRow + " " + $translate.instant('COMMON_PERFORMANCE') + ", %", width: columnWidthText, template: "<div class='number' style='color:" + colorMainPart + "'>#= performance #</div>", hidden: true },
                                                    { field: "performanceEval", title: mainEvalutorRow + " " + $translate.instant('COMMON_PERFORMANCE') + ", %", width: columnWidthText, template: "<div class='number' style='color:" + colorMainEval + "'>#= performanceEval #</div>", hidden: false },
                                                    { field: "comparePerformance", title: compareParticipantRow + " " + $translate.instant('COMMON_PERFORMANCE') + ", %", width: columnWidthText, template: "<div class='number' style='color:" + colorPart + "'>#= comparePerformance #</div>", hidden: true },
                                                    { field: "comparePerformanceEval", title: compareEvalutorRow + " " + $translate.instant('COMMON_PERFORMANCE') + ", %", width: columnWidthText, template: "<div class='number' style='color:" + colorEval + "'>#= comparePerformanceEval #</div>", hidden: false },
                                                    { field: "target", title: $translate.instant('SCORECARD_BENCHMARK'), width: "6%", template: "<div class='number'>#= (target == null) ? ' ' : target #</div>", hidden: !$scope.filter.isShowBenchmark },
                                                    { field: "trend", title: $translate.instant('SCORECARD_TREND'), width: "4%", template: "<div class='trend-#: trend #'></div>", hidden: true },
                                                    { field: "progress", title: $translate.instant('COMMON_PROGRESS'), width: "5%", template: "<div>#= (progress == null) ? '0 ' : progress #  % </div>", hidden: true },
                                                    { field: "weight", title: $translate.instant('SCORECARD_WEIGHT'), width: "6%", template: "<div class='number'>#= (weight == null) ? ' ' : weight #</div>" },
                                                    { field: "csf", title: $translate.instant('SCORECARD_CSF'), width: "12%", template: "#= (csf == null) ? ' ' : csf #" },
                                                    { field: "action", title: $translate.instant('COMMON_ACTION'), width: "12%", template: "#= (action == null) ? ' ' : action #" },
                                                    { field: "kpi", title: $translate.instant('COMMON_KPI'), width: "11%", template: "<div class='kpi-outer-circle' data-question='#:kpi#'><div class='kpi-inner-circle kpi-inner-circle-0'><div class='kpi-control'></div></div></div>", hidden: true },
                                                ],
                                                dataBound: function (e) {
                                                    //if ($('#scorecardGrid').data('kendoGrid').groupable.dataSource._group.length > 0) {
                                                    //    $('#scorecardGrid tbody .k-grouping-row').filter(function (index) {
                                                    //        return $(this).find("p")[0].innerText.slice(-1) === ":";
                                                    //    }).hide();
                                                    //    $('tr td:empty').parent().hide();
                                                    //} else {
                                                    //    $('tr td:empty').parent().show();
                                                    //}
                                                    totalStrongKPI = 0;
                                                    totalWeakKPI = 0;
                                                }

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

                                            var mainPostfix = " (" + $scope.filter.mainStageName + ", " + getById($scope.filter.mainProfileStepId, $scope.filter.mainStepsOfProfile).label + ")";
                                            var postfix = " (" + $scope.filter.stageName + ", " + getById($scope.filter.profileStepId, $scope.filter.stepsOfProfile).label + ")";
                                            if ($scope.filter.mainParticipantsModel.length > 0) {
                                                $scope.scorecard.legends.push(getLegendNames($scope.filter.mainParticipantsModel, colorMainPart, $scope.filter.mainParticipantsOptions, mainPostfix, $translate.instant('COMMON_PARTICIPANTS') + ": "));
                                                treelist.showColumn("score");
                                                treelist.showColumn("performance");

                                                showReport = true;
                                                if ($scope.filter.mainProfileStepId == softProfileTypesEnum.finalProfile.id) {
                                                    //treelist.showColumn("kpi");
                                                }
                                            }
                                            if ($scope.filter.mainEvaluatorsModel.length > 0) {

                                                if ($scope.filter.mainProfileStepId == softProfileTypesEnum.finalProfile.id || $scope.filter.mainProfileStepId == softProfileTypesEnum.finalKpi.id) {
                                                    treelist.hideColumn("scoreEval");
                                                    treelist.hideColumn("performanceEval");
                                                }
                                                else {
                                                    $scope.scorecard.legends.push(getLegendNames($scope.filter.mainEvaluatorsModel, colorMainEval, $scope.filter.mainEvaluatorsOptions, mainPostfix, "Main Evaluator: "));
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
                                            if ($scope.filter.participantsModel.length > 0) {
                                                $scope.scorecard.legends.push(getLegendNames($scope.filter.participantsModel, colorPart, $scope.filter.participantsOptions, postfix, "Participant: "));
                                                treelist.showColumn("compareScore");
                                                treelist.showColumn("comparePerformance");
                                                treelist.showColumn("trend");
                                                treelist.showColumn("progress");
                                                showReport = true;
                                            }
                                            if ($scope.filter.evaluatorsModel.length > 0) {
                                                if ($scope.filter.profileStepId == softProfileTypesEnum.finalProfile.id || $scope.filter.profileStepId == softProfileTypesEnum.finalKpi.id) {
                                                    treelist.hideColumn("compareScoreEval");
                                                    treelist.hideColumn("comparePerformanceEval");

                                                }
                                                else {
                                                    $scope.scorecard.legends.push(getLegendNames($scope.filter.evaluatorsModel, colorEval, $scope.filter.evaluatorsOptions, postfix, "Evaluator: "));
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

                                            pgItem.scoreEval = pgItem.scoreEval ? pgItem.scoreEval : null;
                                            pgItem.compareScoreEval = pgItem.compareScoreEval ? pgItem.compareScoreEval : null;
                                            pgItem.performanceEval = pgItem.performanceEval ? pgItem.performanceEval : '';
                                            pgItem.comparePerformanceEval = pgItem.comparePerformanceEval ? pgItem.comparePerformanceEval : '';

                                            //$scope.scorecard.reportData.push(pgItem);

                                            var pgname = pgItem.pgName;
                                            _.forEach(pg.skills, function (pgs, pgsIndex) {
                                                var pgsItem = angular.copy(pgs);
                                                pgsItem.questions = null;
                                                pgsItem.id = (1 + pgIndex) * 1000 + pgsIndex;
                                                pgsItem.parentId = pgIndex;
                                                pgsItem.pgName = pgname;
                                                pgsItem.scale = scale;
                                                pgsItem.color = getScaleColor(scaleRanges, pgsItem.score) ? getScaleColor(scaleRanges, pgsItem.score) : '';
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
                                                            if ($scope.filter.mainParticipantsModel[0].id == $scope.filter.participantsModel[0].id) {
                                                                if ($scope.filter.mainStageId < $scope.filter.stageId) {
                                                                    pgsItem.trend = ev > pgsItem.score ? "Up" : "Down";
                                                                }
                                                                else if ($scope.filter.mainStageId > $scope.filter.stageId) {
                                                                    pgsItem.trend = pgsItem.score > ev ? "Up" : "Down";
                                                                    pgsItem.progress = Math.ceil((pgsItem.score - ev) * 100 / ev);
                                                                }
                                                            }
                                                            else if ($scope.filter.participantsModel.length == 1) {
                                                                if ($scope.filter.participantsModel[0].id == -1) {
                                                                    pgsItem.trend = (pgsItem.score - ev) < 0 ? "Down" : "Up";
                                                                    pgsItem.progress = Math.ceil((pgsItem.score - ev) * 100 / ev);
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                                if (!(($scope.filter.mainProfileStepId == 3 || $scope.filter.mainProfileStepId == 4) && pgsItem.color == ""))
                                                    $scope.scorecard.reportData.push(pgsItem);
                                            })
                                        })

                                        var treeGrid = $("#scorecardGrid");
                                        var showReport = false;
                                        if (treeGrid.length > 0) {
                                            treeGrid.empty();
                                            var mainParticipant = {};
                                            if ($scope.filter.mainParticipantsModel) {
                                                if ($scope.filter.mainParticipantsModel.length > 0) {
                                                    mainParticipant = _.find($scope.filter.mainParticipantsOptions, function (p) {
                                                        return p.id == $scope.filter.mainParticipantsModel[0].id;
                                                    })
                                                }
                                            }
                                            else if ($scope.filter.mainParticipantsModel) {
                                                if ($scope.filter.mainParticipantsModel) {
                                                    if ($scope.filter.mainParticipantsModel.length > 0) {
                                                        mainParticipant = _.find($scope.filter.mainParticipantsOptions, function (p) {
                                                            return p.id == $scope.filter.mainParticipantsModel[0].id;
                                                        })
                                                    }
                                                }
                                            }
                                            var mainParticipantsRaw = "Main";
                                            if (mainParticipant) {
                                                mainParticipantsRaw = (mainParticipant.label) ? mainParticipant.label : (mainParticipant.name ? mainParticipant.name : "Main Participant");
                                            }
                                            //var mainParticipantsRaw = getLabelTextFromOptions($scope.filter.mainParticipantsOptions, $scope.filter.mainParticipantsModel[0].id);
                                            var participantsRaw = "";
                                            if ($scope.filter.participantsModel.length > 0) {
                                                var participantsRaw = getLabelTextFromOptions($scope.filter.participantsOptions, $scope.filter.participantsModel[0].id);
                                            }

                                            var mainEvalutorRow = "";
                                            if ($scope.filter.mainEvaluatorsModel && $scope.filter.mainEvaluatorsModel.length > 0) {
                                                mainEvalutorRow = getLabelTextFromOptions($scope.filter.mainEvaluatorsOptions, $scope.filter.mainEvaluatorsModel[0].id)
                                            }

                                            var compareEvalutorRow = "";
                                            if ($scope.filter.evaluatorsModel && $scope.filter.evaluatorsModel.length > 0) {
                                                compareEvalutorRow = getLabelTextFromOptions($scope.filter.evaluatorsOptions, $scope.filter.evaluatorsModel[0].id)
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

                                                    { field: "pgName", title: $translate.instant('COMMON_PERFORMANCE_GROUP'), width: "11%" },
                                                    { field: "sName", title: $translate.instant('COMMON_SKILL'), width: "11%" },
                                                    { field: "scale", title: $translate.instant('SCORECARD_SCALE'), width: "7%", template: "<div class='number'>#= scale #</div>" },
                                                    { field: "baseline", title: $translate.instant('SCORECARD_BASELINE'), width: "6%", template: "<div class='number'>#= baseline #</div>" },
                                                    { field: "indicator", title: $translate.instant('SCORECARD_INDICATOR'), width: "5%", template: "<div class='scale-circle' style='background: #: color #'></div>" },
                                                    { field: "score", title: mainParticipantsRaw + " " + $translate.instant('COMMON_PERFORMANCE'), width: columnWidthText, template: "<div class='number' style='color:" + colorMainPart + "'>#= (score == null) ? ' ' : score #</div>", hidden: true },
                                                    { field: "scoreEval", title: mainEvalutorRow + " " + $translate.instant('COMMON_PERFORMANCE'), width: columnWidthText, template: "<div class='number' style='color:" + colorMainEval + "'>#= (scoreEval == null) ? ' ' : scoreEval #</div>", hidden: (!($scope.filter.mainProfileStepId == 4 || $scope.filter.mainProfileStepId == 2)) },
                                                    { field: "compareScore", title: participantsRaw + " " + $translate.instant('COMMON_PERFORMANCE'), width: columnWidthText, template: "<div class='number' style='color:" + colorPart + "'>#= (compareScore == null) ? ' ' : compareScore #</div>", hidden: true },
                                                    { field: "compareScoreEval", title: compareEvalutorRow + " " + $translate.instant('COMMON_PERFORMANCE'), width: columnWidthText, template: "<div class='number' style='color:" + colorEval + "'>#= (compareScoreEval == null) ? ' ' : compareScoreEval #</div>", hidden: (!($scope.filter.profileStepId == 4 || $scope.filter.profileStepId == 2)) },
                                                    { field: "performance", title: mainParticipantsRaw + " " + $translate.instant('COMMON_PERFORMANCE') + ", %", width: columnWidthText, template: "<div class='number' style='color:" + colorMainPart + "'>#= performance #</div>", hidden: true },
                                                    { field: "performanceEval", title: mainEvalutorRow + " " + $translate.instant('COMMON_PERFORMANCE') + ", %", width: columnWidthText, template: "<div class='number' style='color:" + colorMainEval + "'>#= performanceEval #</div>", hidden: (!($scope.filter.mainProfileStepId == 4 || $scope.filter.mainProfileStepId == 2)) },
                                                    { field: "comparePerformance", title: participantsRaw + " " + $translate.instant('COMMON_PERFORMANCE') + ", %", width: columnWidthText, template: "<div class='number' style='color:" + colorPart + "'>#= comparePerformance #</div>", hidden: true },
                                                    { field: "comparePerformanceEval", title: compareEvalutorRow + " " + $translate.instant('COMMON_PERFORMANCE') + ", %", width: columnWidthText, template: "<div class='number' style='color:" + colorEval + "'>#= comparePerformanceEval #</div>", hidden: (!($scope.filter.profileStepId == 4 || $scope.filter.profileStepId == 2)) },
                                                    { field: "target", title: $translate.instant('SCORECARD_BENCHMARK'), width: "6%", template: "<div class='number'>#= (target == null) ? ' ' : target #</div>", hidden: !$scope.filter.isShowBenchmark },
                                                    { field: "trend", title: $translate.instant('SCORECARD_TREND'), width: "4%", template: "<div class='trend-#: trend #'></div>", hidden: true },
                                                    { field: "progress", title: $translate.instant('COMMON_PROGRESS'), width: "5%", template: "<div>#= (progress == null) ? '0 ' : progress #  % </div>", hidden: true },
                                                    { field: "weight", title: $translate.instant('SCORECARD_WEIGHT'), width: "6%", template: "<div class='number'>#= (weight == null) ? ' ' : weight #</div>" },
                                                    { field: "csf", title: $translate.instant('SCORECARD_CSF'), width: "12%", template: "#= (csf == null) ? ' ' : csf #" },
                                                    { field: "action", title: $translate.instant('COMMON_ACTION'), width: "12%", template: "#= (action == null) ? ' ' : action #" },
                                                ]
                                            });

                                            $scope.scorecard.legends = [];
                                            var treelist = treeGrid.data("kendoGrid"); //todo implement with angular
                                            var mainPostfix = " (" + $scope.filter.mainStageName + ", " + getById($scope.filter.mainProfileStepId, $scope.filter.mainStepsOfProfile).label + ")";
                                            var postfix = " (" + $scope.scorecard.stageName + ", " + getById($scope.filter.profileStepId, $scope.filter.stepsOfProfile).label + ")";
                                            if ($scope.filter.mainParticipantsModel.length > 0) {
                                                $scope.scorecard.legends.push(getLegendNames($scope.filter.mainParticipantsModel, colorMainPart, $scope.filter.mainParticipantsOptions, mainPostfix, $translate.instant('COMMON_PARTICIPANTS') + ": "));
                                                treelist.showColumn("score");
                                                treelist.showColumn("performance");
                                                showReport = true;
                                            }
                                            if ($scope.filter.mainEvaluatorsModel.length > 0) {

                                                if ($scope.filter.mainProfileStepId == softProfileTypesEnum.finalProfile.id || $scope.filter.mainProfileStepId == softProfileTypesEnum.finalKpi.id) {
                                                    treelist.hideColumn("scoreEval");
                                                    treelist.hideColumn("performanceEval");
                                                }
                                                else {
                                                    $scope.scorecard.legends.push(getLegendNames($scope.filter.mainEvaluatorsModel, colorMainEval, $scope.filter.mainEvaluatorsOptions, mainPostfix, "Main Evaluator: "));
                                                    treelist.showColumn("scoreEval");
                                                    treelist.showColumn("performanceEval");
                                                    treelist.showColumn("trend");
                                                    treelist.showColumn("progress");
                                                }
                                                //$scope.scorecard.legends.push(getLegendNames($scope.filter.mainEvaluatorsModel, colorMainEval, $scope.filter.mainEvaluatorsOptions, mainPostfix));
                                                //treelist.showColumn("scoreEval");
                                                //treelist.showColumn("performanceEval");
                                                showReport = true;
                                            }
                                            else {
                                                treelist.hideColumn("scoreEval");
                                                treelist.hideColumn("performanceEval");
                                            }

                                            if ($scope.filter.participantsModel.length > 0) {
                                                $scope.scorecard.legends.push(getLegendNames($scope.filter.participantsModel, colorPart, $scope.filter.participantsOptions, postfix, "Participant: "));
                                                treelist.showColumn("compareScore");
                                                treelist.showColumn("comparePerformance");
                                                treelist.showColumn("trend");
                                                treelist.showColumn("progress");
                                                showReport = true;
                                            }
                                            if ($scope.filter.evaluatorsModel.length > 0) {

                                                if ($scope.filter.profileStepId == softProfileTypesEnum.finalProfile.id || $scope.filter.profileStepId == softProfileTypesEnum.finalKpi.id) {
                                                    treelist.hideColumn("compareScoreEval");
                                                    treelist.hideColumn("comparePerformanceEval");
                                                }
                                                else {
                                                    $scope.scorecard.legends.push(getLegendNames($scope.filter.evaluatorsModel, colorEval, $scope.filter.evaluatorsOptions, postfix, "Evaluator: "));
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
        }

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
            scorecardsService.loadKTScorecardData($scope.filter.profileId, $scope.filter.mainParticipantsModel,
                $scope.filter.mainStageId, $scope.filter.mainProfileStepId == $scope.ktProfileTypes.start.id, $scope.filter.mainEvolutionStageId).then(function (data) {
                    var colorMainPart = "black";
                    var colorComparePart = "blue";
                    var columnWidth = 10;
                    var columnWidthText = columnWidth + "%";

                    _.forEach(data.skillResults, function (sRes) {
                        sRes.id = sRes.pgId;
                        sRes.percentScore = sRes.percentScore.toFixed(2);
                    });

                    data.skillResults = prepareKtSkillResultsFOrGrouping(data.skillResults);
                    setKTIndicatorColor(data);

                    $scope.scorecard.reportData = data;

                    if ($("#scorecardGrid").length > 0) {
                        $("#scorecardGrid").empty();
                    }
                    var grid;

                    if (!$scope.filter.isLoadCompareReport) {
                        var mainParticipant = {};
                        if ($scope.filter.mainParticipantsModel) {
                            if ($scope.filter.mainParticipantsModel.length > 0) {
                                mainParticipant = _.find($scope.filter.mainParticipantsOptions, function (p) {
                                    return p.id == $scope.filter.mainParticipantsModel[0].id;
                                })
                            }
                        }
                        else if ($scope.filter.mainParticipantsModel) {
                            if ($scope.filter.mainParticipantsModel) {
                                if ($scope.filter.mainParticipantsModel.length > 0) {
                                    mainParticipant = _.find($scope.filter.mainParticipantsOptions, function (p) {
                                        return p.id == $scope.filter.mainParticipantsModel[0].id;
                                    })
                                }
                            }
                        }
                        var mainParticipantsRaw = "";

                        if (mainParticipant) {
                            mainParticipantsRaw = (mainParticipant.label) ? mainParticipant.label : (mainParticipant.name ? mainParticipant.name : "Main Participant");
                        }
                        //var mainParticipantsRaw = getLabelTextFromOptions($scope.filter.mainParticipantsOptions, $scope.filter.mainParticipantsModel[0].id);
                        grid = $("#scorecardGrid").kendoGrid({
                            dataSource: $scope.scorecard.reportData.skillResults,
                            loadOnDemand: false,
                            sortable: true,
                            //filterable: {
                            //    mode: "row"
                            //},
                            //columnMenu: true,
                            columns: [
                                { field: "pgName", title: $translate.instant('COMMON_PERFORMANCE_GROUP'), width: "11%" },
                                { field: "skillName", title: $translate.instant('COMMON_SKILL'), width: "11%" },
                                { field: "indicator", title: $translate.instant('SCORECARD_INDICATOR'), width: "5%", template: "<div class='scale-circle' style='background: #: indicator #'></div>" },
                                { field: "pointsScore", title: mainParticipantsRaw + " " + $translate.instant('SCORECARD_POINTS_SCORE'), width: columnWidthText, template: "<div class='number' style='color:" + colorMainPart + "'>#= (pointsScore == null) ? ' ' : pointsScore #</div>" },
                                { field: "percentScore", title: mainParticipantsRaw + " " + $translate.instant('COMMON_SCORE') + ", %", width: columnWidthText, template: "<div class='number' style='color:" + colorMainPart + "'>#= percentScore ? percentScore+'%' : '' #</div>" },
                                { field: "target", title: $translate.instant('SCORECARD_BENCHMARK'), width: "6%", template: "<div class='number'>#= (benchmark == null) ? ' ' : benchmark #</div>", hidden: !$scope.filter.isShowBenchmark },
                                { field: "weight", title: $translate.instant('SCORECARD_WEIGHT'), width: "6%", template: "<div class='number'>#= (weight == null) ? ' ' : weight #</div>" },
                                { field: "csf", title: $translate.instant('SCORECARD_CSF'), width: "12%", template: "#= (csf == null) ? ' ' : csf #" },
                                { field: "action", title: $translate.instant('COMMON_ACTION'), width: "12%", template: "#= (action == null) ? ' ' : action #" },
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
                    else {
                        scorecardsService.loadKTScorecardData($scope.filter.profileId, $scope.filter.participantsModel,
                            $scope.filter.stageId, $scope.filter.profileStepId == $scope.ktProfileTypes.start.id, $scope.filter.evolutionStageId).then(function (compData) {

                                _.forEach($scope.scorecard.reportData.skillResults, function (skillRes) {
                                    skillRes.cIndicator = "";
                                    if (skillRes.id == -1) {

                                        if ($scope.scorecard.groupById == 0) {
                                            var compareRes = _.find(compData.skillResults, function (compSkillRes) {
                                                return compSkillRes.pgId == skillRes.pgId &&
                                                    compSkillRes.skillId == skillRes.skillId;
                                            });

                                            if (compareRes) {
                                                skillRes.cIndicator = setCKTIndicatorColor(compareRes.correctAnswersCountScore);
                                                skillRes.comparePointsScore = compareRes.pointsScore;
                                                skillRes.comparePercentScore = (compareRes.percentScore).toFixed(2);
                                                if (skillRes.pointsScore == skillRes.comparePointsScore) {
                                                    skillRes.trend = "Equal";
                                                    skillRes.progress = null;
                                                }
                                                else {
                                                    skillRes.trend = skillRes.pointsScore < skillRes.comparePointsScore ? "Down" : "Up";
                                                    skillRes.progress = Math.ceil((skillRes.comparePointsScore - skillRes.pointsScore) * 100 / skillRes.pointsScore);
                                                }
                                            }
                                        }
                                        else {
                                            var compareRes = _.find(compData.skillResults, function (compSkillRes) {
                                                return compSkillRes.skillId == skillRes.skillId;
                                            });
                                            if (compareRes) {
                                                skillRes.comparePointsScore = _.sum(compareRes, function (item) { return item.pointsScore });
                                                skillRes.comparePercentScore = (_.sum(compareRes, function (item) { return item.percentScore })).toFixed(2);;
                                                if (skillRes.pointsScore == skillRes.comparePointsScore) {
                                                    skillRes.trend = "Equal";
                                                    skillRes.progress = null;
                                                }
                                                else {
                                                    skillRes.trend = skillRes.pointsScore < skillRes.comparePointsScore ? "Down" : "Up";
                                                    skillRes.progress = Math.ceil((skillRes.comparePointsScore - skillRes.pointsScore) * 100 / skillRes.pointsScore);
                                                }
                                            }
                                        }
                                    }

                                });

                                var mainParticipant = { label: "" }
                                var mainParticipantRow = "";

                                var mainEvaluator = { name: "" }
                                var comparedParticipant = { name: "" }
                                var compareParticipantRow = "";
                                var comparedEvaluator = { name: "" }

                                if ($scope.filter.mainParticipantsModel) {
                                    if ($scope.filter.mainParticipantsModel) {
                                        if ($scope.filter.mainParticipantsModel.length > 0) {
                                            _.forEach($scope.filter.mainParticipantsModel, function (item) {
                                                mainParticipant = _.find($scope.filter.mainParticipantsOptions, function (p) {
                                                    return p.id == item.id;
                                                });

                                                if (mainParticipant) {
                                                    mainParticipantRow += (mainParticipant.label) ? mainParticipant.label : (mainParticipant.name ? mainParticipant.name : "Main Participant");
                                                    mainParticipantRow += ",";
                                                }
                                            })

                                        }
                                    }
                                }

                                if ($scope.filter.mainEvaluatorsModel) {
                                    if ($scope.filter.mainEvaluatorsModel.length > 0) {
                                        mainEvaluator = _.find($scope.filter.mainEvaluatorsOptions, function (p) {
                                            return p.id == $scope.filter.mainEvaluatorsModel[0].id;
                                        })
                                    }
                                }


                                if ($scope.filter.participantsModel) {
                                    if ($scope.filter.participantsModel.length > 0) {
                                        _.forEach($scope.filter.participantsModel, function (item) {

                                            comparedParticipant = _.find($scope.filter.participantsOptions, function (p) {
                                                return p.id == item.id;
                                            })
                                            if (comparedParticipant) {
                                                compareParticipantRow += comparedParticipant.label ? comparedParticipant.label : (comparedParticipant.name ? comparedParticipant.name : "Compare Participant");
                                                compareParticipantRow += ",";
                                            }
                                        })
                                    }
                                }

                                if ($scope.filter.evaluatorsModel) {
                                    if ($scope.filter.evaluatorsModel.length > 0) {
                                        comparedEvaluator = _.find($scope.filter.evaluatorsOptions, function (p) {
                                            return p.id == $scope.filter.evaluatorsModel[0].id;
                                        })
                                    }
                                }

                                //var mainParticipantRow = (mainParticipant.label) ? mainParticipant.label : (mainParticipant.name ? mainParticipant.name : "Main Participant");

                                if (mainParticipantRow.lastIndexOf(',') == mainParticipantRow.length - 1) {
                                    mainParticipantRow = mainParticipantRow.substring(0, mainParticipantRow.length - 1)
                                }
                                if (compareParticipantRow.lastIndexOf(',') == compareParticipantRow.length - 1) {
                                    compareParticipantRow = compareParticipantRow.substring(0, compareParticipantRow.length - 1)
                                }
                                grid = $("#scorecardGrid").kendoGrid({
                                    dataSource: $scope.scorecard.reportData.skillResults,
                                    loadOnDemand: false,
                                    sortable: true,
                                    //filterable: {
                                    //    mode: "row"
                                    //},
                                    //columnMenu: true,
                                    columns: [
                                        { field: "pgName", title: $translate.instant('COMMON_PERFORMANCE_GROUP'), width: "11%" },
                                        { field: "skillName", title: $translate.instant('COMMON_SKILL'), width: "11%" },
                                        { field: "mainIndicator", title: mainParticipantRow + " " + $translate.instant('SCORECARD_INDICATOR'), width: "5%", template: "<div class='scale-circle' style='background: #: indicator #'></div>" },
                                        { field: "compareIndicator", title: compareParticipantRow + " " + $translate.instant('SCORECARD_INDICATOR'), width: "5%", template: "<div class='scale-circle' style='background: #: cIndicator #'></div>" },
                                        { field: "pointsScore", title: mainParticipantRow + " " + $translate.instant('SCORECARD_POINTS_SCORE'), width: columnWidthText, template: "<div class='number' style='color:" + colorMainPart + "'>#= (pointsScore == null) ? ' ' : pointsScore #</div>" },
                                        { field: "comparePointsScore", title: compareParticipantRow + " " + $translate.instant('SCORECARD_POINTS_SCORE'), width: columnWidthText, template: "<div class='number' style='color:" + colorComparePart + "'>#= (comparePointsScore == null) ? ' ' : comparePointsScore #</div>" },
                                        { field: "percentScore", title: mainParticipantRow + " " + $translate.instant('COMMON_SCORE') + ", %", width: columnWidthText, template: "<div class='number' style='color:" + colorMainPart + "'>#= percentScore ? percentScore+'%' : '' #</div>" },
                                        { field: "comparePercentScore", title: compareParticipantRow + " " + $translate.instant('COMMON_SCORE') + ", %", width: columnWidthText, template: "<div class='number' style='color:" + colorComparePart + "'>#= comparePercentScore ? comparePercentScore+'%' : '' #</div>" },
                                        { field: "target", title: $translate.instant('SCORECARD_BENCHMARK'), width: "6%", template: "<div class='number'>#= (benchmark == null) ? ' ' : benchmark #</div>", hidden: !$scope.filter.isShowBenchmark },
                                        { field: "trend", title: $translate.instant('SCORECARD_TREND'), width: "4%", template: "<div class='trend-#: trend #'></div>" },
                                        { field: "progress", title: $translate.instant('COMMON_PROGRESS'), width: "5%", template: "<div>#= (progress == null) ? '0 ' : progress #  % </div>" },
                                        { field: "weight", title: $translate.instant('SCORECARD_WEIGHT'), width: "6%", template: "<div class='number'>#= (weight == null) ? ' ' : weight #</div>" },
                                        { field: "csf", title: $translate.instant('SCORECARD_CSF'), width: "12%", template: "#= (csf == null) ? ' ' : csf #" },
                                        { field: "action", title: $translate.instant('COMMON_ACTION'), width: "12%", template: "#= (action == null) ? ' ' : action #" }
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
                            });
                    }

                    $scope.scorecard.legends = [];
                    var showReport;
                    var treeGrid = $("#scorecardGrid");
                    if (treeGrid.length > 0) {
                        var treelist = treeGrid.data("kendoGrid"); //todo implement with angular
                        var mainPostfix = " (" + $scope.filter.mainStageName + ", " + getById($scope.filter.mainProfileStepId, $scope.filter.mainStepsOfProfile).label + ")";
                        var postfix = " (" + $scope.filter.stageName + ", " + getById($scope.filter.profileStepId, $scope.filter.stepsOfProfile).label + ")";
                        if ($scope.filter.mainParticipantsModel.length > 0) {
                            $scope.scorecard.legends.push(getLegendNames($scope.filter.mainParticipantsModel, colorMainPart, $scope.filter.mainParticipantsOptions, mainPostfix, $translate.instant('COMMON_PARTICIPANTS') + ": "));
                            showReport = true;
                        }
                        if ($scope.filter.participantsModel.length > 0) {
                            $scope.scorecard.legends.push(getLegendNames($scope.filter.participantsModel, colorComparePart, $scope.filter.participantsOptions, postfix, "Participant: "));
                            showReport = true;
                        }
                    }
                    else {
                        showReport = false;
                    }

                    $scope.scorecard.isShowReport = showReport;
                    $stateParams = [];
                });
        }

        function goBack() {
            history.back();
        }
        function SetKPI() {
            $scope.strongKPIs = [];
            $scope.weakKPIs = [];
            $("#scorecardGrid").find(".kpi-control.kpi-1").each(function (index, item) {
                $scope.weakKPIs.push($(item).parents(".kpi-outer-circle").data("question"))
            });
            $("#scorecardGrid").find(".kpi-control.kpi-2").each(function (index, item) {
                $scope.strongKPIs.push($(item).parents(".kpi-outer-circle").data("question"))
            });
            localStorageService.set("strongKPIs", $scope.strongKPIs);
            localStorageService.set("weakKPIs", $scope.weakKPIs);

            var selectedParticiapnts = [];
            _.forEach($scope.filter.mainParticipantsModel, function (item) {
                var mainParticipant = _.find($scope.filter.mainParticipantsOptions, function (p) {
                    return p.id == item.id;
                });

                if (mainParticipant) {
                    selectedParticiapnts.push(mainParticipant);
                }
            })

            localStorageService.set("mainParticipants", selectedParticiapnts);
            localStorageService.set("stageId", $scope.filter.stageId);

            $state.go("home.teamFinalKPI", { profileId: $scope.filter.profileId, stageId: $scope.filter.stageId, evaluatorId: $scope.filter.finalScoremanger, evaluateeId: $scope.filter.mainParticipantsModel[0].id });
            //$location.path("../../activeProfiles/finalKPI/" + $scope.filter.profileId + "/" + $scope.filter.stageId + "/ null /" + $scope.filter.mainParticipantsModel[0].id);
        }
        function setCKTIndicatorColor(correctAnswersCountScore) {
            var indicator = "";
            if (_.isNull(correctAnswersCountScore) || _.isUndefined(correctAnswersCountScore) || correctAnswersCountScore == 0) {
                indicator = passScoreIndicator.failed;
            }
            else {
                indicator = passScoreIndicator.passed;
            }
            return indicator;
        }
        function dataSource(scorecardData) {
            return new kendo.data.TreeListDataSource({
                data: scorecardData,
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

        function indexOfId(array, id) {
            for (var i = 0; i < array.length; i++) {
                if (array[i].id == id) return i;
            }
            return -1;
        }
        var totalWeakKPI = 0;
        var totalStrongKPI = 0;
        function increaseKPI(kpiType, fromLimit, element) {
            //if (!vm.isFirstStage || !answer) return;
            var kpiWeak = 1;
            var kpiStrong = 2;
            (!kpiType) ? kpiType = 0 : '';
            (!fromLimit) ? fromLimit = false : '';
            if (!isNotKPILimit(kpiWeak) && !fromLimit && kpiType == kpiWeak) {
                totalWeakKPI--;
                fromLimit = true;
            }

            switch (kpiType) {
                case kpiWeak:
                    kpiType = kpiStrong;
                    if (isNotKPILimit(kpiStrong)) {
                        (fromLimit) ? '' : totalWeakKPI--;
                        totalStrongKPI++;
                    } else {
                        (!fromLimit) ? totalWeakKPI-- : '';
                        return increaseKPI(kpiType, true);
                    }
                    break;
                case kpiStrong:
                    kpiType = null;
                    (fromLimit) ? '' : totalStrongKPI--;
                    break;
                default:
                    kpiType = kpiWeak;
                    if (isNotKPILimit(kpiWeak)) {
                        totalWeakKPI++;
                    } else {
                        return increaseKPI(kpiType, true);
                    }
                    break;
            }
            return kpiType;

        }

        function isNotKPILimit(kpiType) {
            var kpiWeak = 1;
            var kpiStrong = 2;
            if ($scope.profile) {
                switch (kpiType) {
                    case kpiWeak:
                        return (totalWeakKPI < $scope.profile.kpiWeak); //vm.profile.kpiWeak
                        break;
                    case kpiStrong:
                        return (totalStrongKPI < $scope.profile.kpiStrong); //vm.profile.kpiStrong
                        break;
                }
            }
        }


        $(document).on("click", ".kpi-outer-circle", function () {

            if ($(this).find(".kpi-control").hasClass("kpi-1")) {
                var kpi = increaseKPI(1, undefined, $(this).find(".kpi-control"));
                $(this).find(".kpi-control").removeClass("kpi-1");
                $(this).find(".kpi-control").removeClass("kpi-2");
                if (kpi > 0) {
                    $(this).find(".kpi-control").addClass("kpi-" + kpi);
                }
            }
            else if ($(this).find(".kpi-control").hasClass("kpi-2")) {
                var kpi = increaseKPI(2, undefined, $(this).find(".kpi-control"));
                $(this).find(".kpi-control").removeClass("kpi-1");
                $(this).find(".kpi-control").removeClass("kpi-2");
                if (kpi > 0) {
                    $(this).find(".kpi-control").addClass("kpi-" + kpi);
                }
            }
            else {
                var kpi = increaseKPI(0, undefined, $(this).find(".kpi-control"));
                $(this).find(".kpi-control").removeClass("kpi-1");
                $(this).find(".kpi-control").removeClass("kpi-2");
                if (kpi > 0) {
                    $(this).find(".kpi-control").addClass("kpi-" + kpi);
                }
            }
        });
        $scope.$on('filterChanged', function (event, message) {
            if ($scope.filter.isLoadReport) {
                if ($scope.filter.profileId > 0) {
                    scorecardsServiceNew.getProfileById($scope.filter.profileId).then(function (data) {
                        $scope.profile = data;
                    })
                }
                getScorecardData();
            }
            else {
                $scope.scorecard.isShowReport = false;
                $scope.scorecard.legends = [];
            }
        });

        $scope.$on('benchmarkChanged', function (event, message) {
            getBenchmark();
        });
    }
})();