(function () {
    'use strict';

    angular
        .module('ips.finalKPI')
        .config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
            $stateProvider
                .state('home.finalKPI', {
                    url: "/finalKPI/:profileId/:stageId/:evaluatorId/:evaluateeId",
                    templateUrl: "views/finalKPI/views/finalKPI.html",
                    controller: "finalKPICtrl as kpi",
                    resolve: {
                        pageName: function ($translate) {
                            return $translate.instant('MYPROFILES_FINAL_KPI');
                        },
                        scorecardData: function ($stateParams, surveyAnalysisService) {
                            if ($stateParams.evaluatorId == null || $stateParams.evaluatorId == 0) {
                                return surveyAnalysisService.getScorecard($stateParams.stageId, $stateParams.evaluateeId).then(function (data) {
                                    return data;
                                });
                            }
                            else {
                                return surveyAnalysisService.getScorecard($stateParams.stageId, $stateParams.evaluatorId).then(function (data) {
                                    return data;
                                });
                            }
                            //return surveyAnalysisService.getScorecard($stateParams.stageId, $stateParams.evaluatorId).then(function (data) {
                            //    return data;
                            //});
                        },
                        answers: function (finalKPIService, $stateParams) {
                            var query = '?$expand=Question&$filter=ParticipantId eq ' + $stateParams.evaluatorId + ' and StageId eq ' + $stateParams.stageId;
                            return finalKPIService.getAnswers(query);
                        },
                        profile: function ($stateParams, profilesService) {
                            return profilesService.getById($stateParams.profileId);
                        },
                        evaluators: function ($stateParams, finalKPIService) {
                            return finalKPIService.getEvaluators($stateParams.stageId, $stateParams.evaluatorId);
                        },
                        stagesInfo: function (stageGroupManager, $stateParams) {
                            return stageGroupManager.getAllStagesInGroup($stateParams.stageId);
                        },
                        durationMetrics: function (trainingsService) {
                            return trainingsService.getDurationMetrics();
                        },
                        organizations: function ($stateParams, trainingsService) {
                            return trainingsService.getOrganizations();
                        },
                        pageMode: function () {
                            return 1;
                        },
                        notificationTemplates: function (todosManager) {
                            return todosManager.getNotificationTemplates().then(function (data) {
                                data.unshift({ id: null, name: "Select Template..." });
                                return data;
                            });
                        },
                    },
                    data: {
                        displayName: '{{pageName}}',//'Final KPI',
                        paneLimit: 1,
                        depth: 2
                    }
                })
                .state('home.editFinalKPI', {
                    url: "/editFinalKPI/:profileId/:stageId/:evaluatorId/:evaluateeId/:isEdit",
                    templateUrl: "views/finalKPI/views/finalKPI.html",
                    controller: "finalKPICtrl as kpi",
                    resolve: {
                        pageName: function ($translate) {
                            return $translate.instant('MYPROFILES_FINAL_KPI');
                        },
                        scorecardData: function ($stateParams, surveyAnalysisService) {
                            if ($stateParams.evaluatorId == null || $stateParams.evaluatorId == 0) {
                                return surveyAnalysisService.getScorecard($stateParams.stageId, $stateParams.evaluateeId).then(function (data) {
                                    return data;
                                });
                            }
                            else {
                                return surveyAnalysisService.getScorecard($stateParams.stageId, $stateParams.evaluatorId).then(function (data) {
                                    return data;
                                });
                            }
                        },
                        answers: function (finalKPIService, $stateParams) {
                            var query = '?$expand=Question&$filter=ParticipantId eq ' + $stateParams.evaluatorId + ' and StageId eq ' + $stateParams.stageId;
                            return finalKPIService.getAnswers(query);
                        },
                        profile: function ($stateParams, profilesService) {
                            return profilesService.getById($stateParams.profileId);
                        },
                        evaluators: function ($stateParams, finalKPIService) {
                            return finalKPIService.getEvaluators($stateParams.stageId, $stateParams.evaluatorId);
                        },
                        stagesInfo: function (stageGroupManager, $stateParams) {
                            return stageGroupManager.getAllStagesInGroup($stateParams.stageId);
                        },
                        durationMetrics: function (trainingsService) {
                            return trainingsService.getDurationMetrics();
                        },
                        organizations: function ($stateParams, trainingsService) {
                            return trainingsService.getOrganizations();
                        },
                        pageMode: function () {
                            return 2;
                        },
                        notificationTemplates: function (todosManager) {
                            return todosManager.getNotificationTemplates().then(function (data) {
                                data.unshift({ id: null, name: "Select Template..." });
                                return data;
                            });
                        },
                    },
                    data: {
                        displayName: '{{ pageName }}',//'Final KPI',
                        paneLimit: 1,
                        depth: 2
                    }
                })
                .state('home.previewFinalKPI', {
                    url: "/previewFinalKPI/:profileId/:stageId/:evaluatorId/:evaluateeId",
                    templateUrl: "views/finalKPI/views/previewFinalKPI.html",
                    controller: "finalKPICtrl as kpi",
                    resolve: {
                        pageName: function ($translate) {
                            return $translate.instant('MYPROFILES_FINAL_KPI');
                        },
                        scorecardData: function ($stateParams, surveyAnalysisService) {
                            if ($stateParams.evaluatorId == null || $stateParams.evaluatorId == 0) {
                                return surveyAnalysisService.getScorecard($stateParams.stageId, $stateParams.evaluateeId).then(function (data) {
                                    return data;
                                });
                            }
                            else {
                                return surveyAnalysisService.getScorecard($stateParams.stageId, $stateParams.evaluatorId).then(function (data) {
                                    return data;
                                });
                            }
                        },
                        answers: function (finalKPIService, $stateParams) {
                            var query = '?$expand=Question&$filter=ParticipantId eq ' + $stateParams.evaluatorId + ' and StageId eq ' + $stateParams.stageId;
                            return finalKPIService.getAnswers(query);
                        },
                        profile: function ($stateParams, profilesService) {
                            return profilesService.getById($stateParams.profileId);
                        },
                        evaluators: function ($stateParams, finalKPIService) {
                            return finalKPIService.getEvaluators($stateParams.stageId, $stateParams.evaluatorId);
                        },
                        stagesInfo: function (stageGroupManager, $stateParams) {
                            return stageGroupManager.getAllStagesInGroup($stateParams.stageId);
                        },
                        durationMetrics: function () { return []; },
                        organizations: function () { return []; },
                        pageMode: function () {
                            return 0;
                        },
                        notificationTemplates: function (todosManager) {
                            return todosManager.getNotificationTemplates().then(function (data) {
                                data.unshift({ id: null, name: "Select Template..." });
                                return data;
                            });
                        }
                    },
                    data: {
                        displayName: '{{ pageName }}',//'Final KPI',
                        paneLimit: 1,
                        depth: 2
                    }
                })
                .state('home.previewDevContract', {
                    url: "/previewDevContract/:profileId/:stageId/:evaluatorId/:evaluateeId",
                    templateUrl: "views/devContract/views/viewDevContract.html",
                    controller: "finalKPICtrl as kpi",
                    resolve: {
                        pageName: function ($translate) {
                            return $translate.instant('COMMON_DEVELOPMENT_CONTRACT');
                        },
                        scorecardData: function ($stateParams, surveyAnalysisService) {
                            if ($stateParams.evaluatorId == null || $stateParams.evaluatorId == 0) {
                                return surveyAnalysisService.getScorecard($stateParams.stageId, $stateParams.evaluateeId).then(function (data) {
                                    return data;
                                });
                            }
                            else {
                                return surveyAnalysisService.getScorecard($stateParams.stageId, $stateParams.evaluatorId).then(function (data) {
                                    return data;
                                });
                            }
                        },
                        answers: function (finalKPIService, $stateParams) {
                            var query = '?$expand=Question&$filter=ParticipantId eq ' + $stateParams.evaluatorId + ' and StageId eq ' + $stateParams.stageId;
                            return finalKPIService.getAnswers(query);
                        },
                        profile: function ($stateParams, profilesService) {
                            return profilesService.getById($stateParams.profileId);
                        },
                        evaluators: function ($stateParams, finalKPIService) {
                            return finalKPIService.getEvaluators($stateParams.stageId, $stateParams.evaluatorId);
                        },
                        stagesInfo: function (stageGroupManager, $stateParams) {
                            return stageGroupManager.getAllStagesInGroup($stateParams.stageId);
                        },
                        durationMetrics: function () { return []; },
                        organizations: function () { return []; },
                        pageMode: function () {
                            return 0;
                        },
                        notificationTemplates: function (todosManager) {
                            return todosManager.getNotificationTemplates().then(function (data) {
                                data.unshift({ id: null, name: "Select Template..." });
                                return data;
                            });
                        },
                    },
                    data: {
                        displayName: '{{pageName}}',//'Development Contract',
                        paneLimit: 1,
                        depth: 2
                    }
                });
        }])

        .controller('finalKPICtrl', finalKPICtrl);

    finalKPICtrl.$inject = ['cssInjector', '$stateParams', 'answers', 'finalKPIService', 'apiService', '$filter', '$location'
        , 'profile', 'evaluators', 'scorecardData', '$state', 'dialogService', 'surveyAnalysisService', 'stagesInfo'
        , 'durationMetrics', '$scope', 'trainingsService', /*'trainings',*/ 'organizations', 'pageMode', 'trainingSaveModeEnum', 'stageGroupManager', 'notificationTemplates', 'reminderEnum', 'localStorageService', 'templateTypeEnum', '$translate', 'globalVariables'];

    function finalKPICtrl(cssInjector, $stateParams, answers, finalKPIService, apiService, $filter, $location
        , profile, evaluators, scorecardData, $state, dialogService, surveyAnalysisService, stagesInfo
        , durationMetrics, $scope, trainingsService, /*trainings,*/ organizations, pageMode, trainingSaveModeEnum, stageGroupManager, notificationTemplates, reminderEnum, localStorageService, templateTypeEnum, $translate, globalVariables) {
        cssInjector.add('views/finalkpi/finalkpi.css');
        moment.locale(globalVariables.lang.currentUICulture);
        localStorageService.set("strongKPIs", null);
        localStorageService.set("weakKPIs", null);
        localStorageService.set("mainParticipantsModel", null);
        localStorageService.set("stageId", null);
        var vm = this;
        var InfoArray = [
            { index: 1, title: $translate.instant('MYPROFILES_AVERAGE'), description: $translate.instant('MYPROFILES_AVERAGE_SCORE_IS_THE_AVERAGE_SCORE_OF_MAIN_PARTICIPANT_SCORE__EVALUATORS_SCORE') },
            { index: 2, title: ">", description: $translate.instant('MYPROFILES_WHEN_YOU_CLICK_AVERAGE_SCORE_WILL_BE_ADDED_FINAL_SCORE_MID_GOAL_COLUMN') },
            { index: 3, title: $translate.instant('MYPROFILES_FINAL_SCORE'), description: $translate.instant('MYPROFILES_FINAL_SCORE_IS_CURRENT_PERFORMANCE_VERSUS_YOUR_GOAL_FOR_THIS_STAGE') },
            { index: 4, title: $translate.instant('MYPROFILES_FREETEXT_TRAINING'), description: $translate.instant('MYPROFILES_HERE_YOU_MAY_ADD_TRAININGS_TOWARDS_NEXT_PERFORMANCE_EVALUATION_BY_ADDING_TEXT') },
            { index: 5, title: $translate.instant('MYPROFILES_PRESET_TRAININGS'), description: $translate.instant('MYPROFILES_PRESET_TRAININGS_ARE_TRAININGS_ADDED_BY_ADMIN_TO_FIT_OR_SUGGEST_TRAININGS_TOWARDS_THE_SKILL') + ' ' + $translate.instant('MYPROFILES_ONCE_YOU_SELECT_THE_TRAININGS_YOU_WILL_PROCEED_TO_A_DETAIL_PAGE_TELLING_MORE_ABOUT_THE_TRAINING') },
            { index: 6, title: $translate.instant('COMMON_ADD_NEW_TRAINING'), description: $translate.instant('MYPROFILES_HERE_YOU_MAY_ADD_A_NEW_TRAININHG_THAT_SUITS_YOUR_NEEDS') + ' ' + $translate.instant('MYPROFILES_IT_WILL_BECOME_YOUR_INDEPENDENT_AND_EXCLUSICE_TRAINING') + ' ' + $translate.instant('MYPROFILES_YOU_MAY_KEEP_IT_FOR_YOUR_SELF_OR_MAKE_IT_PUBLIC_SO_OTHER_USERS_MAY_USE_IT') },
            { index: 7, title: $translate.instant('MYPROFILES_SEARCH_FOR_TRAINING'), description: $translate.instant('MYPROFILES_HERE_YOU_CAN_SEARCH_FOR_OTHER_TRAININGS_INSIDE_IMPROVE_SYSTEMS_AND_ADD_IT_ON_YOUR_DEVELOPMENT_CONTRACT_TOWARDS_NEXT_PERFORMANCE_EVALUATION') },
            { index: 8, title: $translate.instant('COMMON_KPI'), description: $translate.instant('MYPROFILES_KPIS_ARE_SELECTED_FOCUS_AREAS_STRONG_AND_WEAK_AREAS') },
            { index: 9, title: $translate.instant('COMMON_EVALUATORS'), description: $translate.instant('MYPROFILES_HERE_EVALUATORS_ARE_ADDED') + ' ' + $translate.instant('MYPROFILES_YOU_MAY_SELECT_ONE_OR_MORE_AND_THEIR_SCORES_WILL_APPEAR_IN_THE_LIST_BELOW') },
            { index: 10, title: $translate.instant('MYPROFILES_FINAL_KPI_MANAGER'), description: $translate.instant('MYPROFILES_PERSON_WITH_FINAL_SCORE_RIGHTS_MEANING_HE_SHE_IS_THE_ONE_IN_CHARGE_FOR_THE_PROJECT') },
            { index: 11, title: $translate.instant('MYPROFILES_PREVIOUS_PERFORMANCE_EVALUATION_STAGES'), description: $translate.instant('MYPROFILES_PREVIOUS_PERFORMANCE_EVALUATION_STAGES') + ' - ' + $translate.instant('MYPROFILES_IT_GIVES_A_OPTION_TO_USER_TO_SHOW_OR_HIDE_PREVIOUS_PERFORMANCE_EVALUATION_GOALS') }
        ]
        vm.evaluators = evaluators;
        vm.defaultEvaluator = parseInt($stateParams.evaluatorId);
        vm.participantUser = (scorecardData && scorecardData.length > 0) ? scorecardData[0].participantUser : {};
        vm.participantId = (scorecardData && scorecardData.length > 0) ? scorecardData[0].participant.id : null;
        $scope.notificationTemplates = notificationTemplates;
        vm.sortCondition = {
            column: '1',
            descending: false
        };
        vm.answers = answers;
        vm.scorecardData = [];
        $scope.IsCopyAllScoresTriggered = false;
        if ($state.current.name == 'home.finalKPI') {
            if (!isFirstStage()) {
                vm.scorecardData = _.filter(scorecardData, function (item) {
                    return item.agreement != null && item.agreement.kpiType > 0;
                });
            }
            else {
                for (var i = 0, len = scorecardData.length; i < len; i++) {
                    if (scorecardData[i].agreement) {
                        if (!scorecardData[i].agreement.milestoneAgreementGoals.length > 0) {
                            _.each(stagesInfo, function (milestoneItem, index) {
                                if (index == 1) {
                                    scorecardData[i].agreement.milestoneAgreementGoals.push({
                                        stageId: milestoneItem.id,
                                        goal: scorecardData[i].agreement.shortGoal,
                                        participantId: scorecardData[i].participant.id,
                                    });
                                }
                                if (index == 2) {
                                    scorecardData[i].agreement.milestoneAgreementGoals.push({
                                        stageId: milestoneItem.id,
                                        goal: scorecardData[i].agreement.midGoal,
                                        participantId: scorecardData[i].participant.id,
                                    });
                                }
                                if (index == 3) {
                                    scorecardData[i].agreement.milestoneAgreementGoals.push({
                                        stageId: milestoneItem.id,
                                        goal: scorecardData[i].agreement.longGoal,
                                        participantId: scorecardData[i].participant.id,
                                    });
                                }
                                if (index == 4) {
                                    scorecardData[i].agreement.milestoneAgreementGoals.push({
                                        stageId: milestoneItem.id,
                                        goal: scorecardData[i].agreement.finalGoal,
                                        participantId: scorecardData[i].participant.id,
                                    });
                                }
                            })
                        }
                    }
                }
                vm.scorecardData = scorecardData;
            }
        }
        else {
            vm.scorecardData = scorecardData;
        }
        if ($state.current.name == 'home.previewDevContract') {
            var participantId = ($stateParams.evaluateeId == "null" ? $stateParams.evaluatorId : $stateParams.evaluateeId)
            surveyAnalysisService.getDevContractDetail($stateParams.stageId, participantId).then(function (data) {
                vm.devContractInfo = data;
            });
        }
        vm.profile = profile;
        vm.isFirstStage = isFirstStage();
        vm.evaluatorsModel = vm.participantId == vm.defaultEvaluator ? [] : [{ id: vm.defaultEvaluator }];
        vm.evaluatorsOptions = getMultiSelectOptions();
        updateScorecardMulti();
        vm.totalWeakKPI = 0;
        vm.totalStrongKPI = 0;
        vm.maxScoreValue = getMaxScoreValue();
        vm.stages = stagesInfo;
        vm.milestones = _.filter(stagesInfo, function (milestoneItem, i) {
            return i != 0;
        });
        vm.showAllStage = false;
        vm.currentStageName = getCurrentStageName();
        var stageRestart = {
            stageGroupId: stagesInfo[stagesInfo.length - 1].stageGroup.id,
            name: stagesInfo[stagesInfo.length - 1].stageGroup.name,
            startDate: moment(kendo.parseDate(stagesInfo[stagesInfo.length - 1].endDateTime)).isAfter(moment(new Date()), "day") ? moment(kendo.parseDate(stagesInfo[stagesInfo.length - 1].endDateTime)).add('days', 1).format('L LT') : moment(new Date()).add('days', 1).format('L LT'),
            //endDate: moment(stagesInfo[stagesInfo.length - 1].endDate).isAfter(moment(new Date()), "day") ? moment(stagesInfo[stagesInfo.length - 1].endDate).add('days', moment.duration(moment(stagesInfo[stagesInfo.length - 1].endDate).diff(moment(stagesInfo[stagesInfo.length - 1].startDate))).asDays() + 1).format('L LT') : moment(new Date()).add('days', moment.duration(moment(stagesInfo[stagesInfo.length - 1].endDate).diff(moment(stagesInfo[stagesInfo.length - 1].startDate))).asDays() + 1).format('L LT'),
            description: "",
            monthsSpan: 0,
            weeksSpan: 6,
            daysSpan: 0,
            hoursSpan: 0,
            minutesSpan: 0,
        };
        vm.stageRestart = stageRestart;
        vm.restartStage = restartStage;
        vm.cancelRestartStage = cancelRestartStage;
        vm.showInfoPopup = showInfoPopup;
        vm.openInfoPopup = openInfoPopup;
        $scope.editingTrainingIndex = -1;
        activate();
        setDefaults();
        vm.getCurrentStage = getCurrentStage;
        function activate() {
            if ($stateParams.isEdit || (vm.scorecardData && vm.scorecardData.length > 0 && vm.scorecardData[0].agreement)) {
                vm.totalWeakKPI = vm.profile.kpiWeak;
                vm.totalStrongKPI = vm.profile.kpiStrong;
            }
        }
        function setDefaults() {
            var newsd = new kendo.data.ObservableArray([]);
            for (var i = 0, len = vm.scorecardData.length; i < len; i++) {
                if (vm.scorecardData[i].agreement && vm.scorecardData[i].agreement.kpiType && vm.scorecardData[i].agreement.kpiType > 0) {
                    vm.scorecardData[i].newFormIsVisible = false;
                    if (pageMode == 1) { //set
                        vm.scorecardData[i].agreement.trainings = [];
                        vm.scorecardData[i].agreement.finalScore = '';
                        vm.scorecardData[i].agreement.comment = '';
                    }
                    else {
                        if (!vm.scorecardData[i].agreement.milestoneAgreementGoals.length > 0) {
                            _.each(stagesInfo, function (milestoneItem, index) {
                                if (index == 1) {
                                    vm.scorecardData[i].agreement.milestoneAgreementGoals.push({
                                        stageId: milestoneItem.id,
                                        goal: vm.scorecardData[i].agreement.shortGoal,
                                        participantId: vm.scorecardData[i].participant.id,
                                    });
                                }
                                if (index == 2) {
                                    vm.scorecardData[i].agreement.milestoneAgreementGoals.push({
                                        stageId: milestoneItem.id,
                                        goal: vm.scorecardData[i].agreement.midGoal,
                                        participantId: vm.scorecardData[i].participant.id,
                                    });
                                }
                                if (index == 3) {
                                    vm.scorecardData[i].agreement.milestoneAgreementGoals.push({
                                        stageId: milestoneItem.id,
                                        goal: vm.scorecardData[i].agreement.longGoal,
                                        participantId: vm.scorecardData[i].participant.id,
                                    });
                                }
                                if (index == 4) {
                                    vm.scorecardData[i].agreement.milestoneAgreementGoals.push({
                                        stageId: milestoneItem.id,
                                        goal: vm.scorecardData[i].agreement.finalGoal,
                                        participantId: vm.scorecardData[i].participant.id,
                                    });
                                }
                            })
                        }
                    }
                    newsd.push(scorecardData[i]);
                }
            }
            if (newsd.length > 0) {
                vm.scorecardData = newsd;
            }
        }
        function isFirstStage() {
            if (!stagesInfo || stagesInfo.length < 1)
                return true;
            return stagesInfo[0].id.toString() === $stateParams.stageId;
        }
        function getCurrentStage() {
            if (!stagesInfo || stagesInfo.length < 1)
                return "";
            var currentStage = "";
            angular.forEach(stagesInfo, function (item) {
                if (item.id.toString() === $stateParams.stageId) {
                    currentStage = item;
                    return (false);
                }
            });
            return currentStage;
        }
        function getUpcomingStage() {
            if (!stagesInfo || stagesInfo.length < 1)
                return "";
            var nextStage = null;
            var currentStageIndex = null;
            angular.forEach(stagesInfo, function (item, index) {
                if (item.id.toString() === $stateParams.stageId) {
                    currentStageIndex = index;
                }
                if (currentStageIndex > -1) {
                    nextStage = stagesInfo[currentStageIndex + 1];
                    return (false)
                }
            });
            return nextStage;
        }
        function getCurrentStageName() {
            if (!stagesInfo || stagesInfo.length < 1)
                return "";
            var name = "";
            angular.forEach(stagesInfo, function (item) {
                if (item.id.toString() === $stateParams.stageId) {
                    name = item.name;
                    return;
                }
            });
            return "Stage: " + name + ".";
        }
        function getMaxScoreValue() {
            if (vm.profile && vm.profile.scale && vm.profile.scale.scaleRanges) {
                return vm.profile.scale.scaleRanges[vm.profile.scale.scaleRanges.length - 1].max;
            }
        }
        function addSortingClass(columnIndex, column) {
            var elClass = '';
            if (column.isSort) {
                elClass += 'sortable ';
            }
            if (columnIndex == vm.sortCondition.column) {
                elClass += 'sort-' + vm.sortCondition.descending;
                column.currentSort = true;
            } else {
                column.currentSort = false;
            }
            return elClass;
        }
        function addClickableClass(isClickable) {
            var elClass = '';
            (isClickable) ? elClass += 'clickable ' : '';
            return elClass;
        }
        function changeSorting(columnIndex, column) {
            if (column.isSort) {
                if (vm.sortCondition.column == columnIndex) {
                    vm.sortCondition.descending = !vm.sortCondition.descending;
                    order(column.sortBy, vm.sortCondition.descending)
                } else {
                    vm.sortCondition.column = columnIndex;
                    vm.sortCondition.descending = false;
                    order(column.sortBy, vm.sortCondition.descending)
                }
            }
        }
        function order(predicate, reverse) {
            if (predicate) {
                var orderBy = $filter('orderBy');
                if (Number(predicate) === predicate && predicate % 1 === 0) {
                    predicate = valueParser;
                }
                vm.scorecardData = orderBy(vm.scorecardData, predicate, reverse);
            }
        }
        function valueParser(value) {
            return parseInt(value);
        }
        function increaseKPI(answer, fromLimit) {
            //if (!vm.isFirstStage || !answer) return;
            var kpiWeak = 1;
            var kpiStrong = 2;
            (!answer.kpiType) ? answer.kpiType = 0 : '';
            (!fromLimit) ? fromLimit = false : '';
            if (!isNotKPILimit(kpiWeak) && !fromLimit && answer.kpiType == kpiWeak) {
                vm.totalWeakKPI--;
                fromLimit = true;
            }

            switch (answer.kpiType) {
                case kpiWeak:
                    answer.kpiType = kpiStrong;
                    if (isNotKPILimit(kpiStrong)) {
                        (fromLimit) ? '' : vm.totalWeakKPI--;
                        vm.totalStrongKPI++;
                    } else {
                        (!fromLimit) ? vm.totalWeakKPI-- : '';
                        increaseKPI(answer, true);
                    }
                    break;
                case kpiStrong:
                    answer.kpiType = null;
                    (fromLimit) ? '' : vm.totalStrongKPI--;
                    break;
                default:
                    answer.kpiType = kpiWeak;
                    if (isNotKPILimit(kpiWeak)) {
                        vm.totalWeakKPI++;
                    } else {
                        increaseKPI(answer, true);
                    }
                    break;
            }
        }
        function isNotKPILimit(kpiType) {
            var kpiWeak = 1;
            var kpiStrong = 2;
            switch (kpiType) {
                case kpiWeak:
                    return (vm.totalWeakKPI < vm.profile.kpiWeak);
                    break;
                case kpiStrong:
                    return (vm.totalStrongKPI < vm.profile.kpiStrong);
                    break;
            }
        }
        function submitFinalKPI() {
            var evaluationAgreements = [];
            for (var i = 0, len = vm.scorecardData.length; i < len; i++) {
                if (vm.scorecardData[i].agreement) {
                    vm.scorecardData[i].agreement['stageId'] = $stateParams.stageId;
                    vm.scorecardData[i].agreement['participantId'] = vm.scorecardData[i].participant.id;
                    vm.scorecardData[i].agreement['questionId'] = vm.scorecardData[i].question.id;
                    if (vm.scorecardData[i].agreement.kpiType == 0 || vm.scorecardData[i].agreement.kpiType == null) {
                        vm.scorecardData[i].agreement.kpiType = 0;
                        vm.scorecardData[i].agreement.trainings = [];
                    }
                    evaluationAgreements.push(vm.scorecardData[i].agreement);
                }
            }
            if (stagesInfo) {
                var sIndex = _.findIndex(stagesInfo, function (item) {
                    return item.id == $stateParams.stageId;
                })
                if (sIndex == (stagesInfo.length - 1)) {
                    dialogService.showRestartEvalutionDialog($translate.instant('MYPROFILES_DO_YOU_WANT_TO_CONTINUE_TO_NEW_PHASE')).then(
                        function (data) {
                            if (data) {
                                // restart logic
                                $("#restartStageModal").modal('show');
                                //notification("Thank you for participating in this improvement process; Final Milestone is now completed and we hope you are satisfied with the end results. Have a nice day!");
                            }
                            else {
                                notification($translate.instant('MYPROFILES_THANK_YOU_FOR_PARTICIPATING_IN_THIS_IMPROVEMENT_PROCESS') + " " + $translate.instant('MYPROFILES_FINAL_MILESTONE_IS_NOW_COMPLETED_AND_WE_HOPE_YOU_ARE_SATISFIED_WITH_THE_END_RESULTS') + " " + $translate.instant('MYPROFILES_HAVE_A_NICE_DAY'));
                                submit(evaluationAgreements);
                            }
                        });
                }
                else {
                    submit(evaluationAgreements);
                }
            }
            else {
                submit(evaluationAgreements);
            }
        }
        function restartStage() {
            var evaluationAgreements = [];
            for (var i = 0, len = vm.scorecardData.length; i < len; i++) {
                vm.scorecardData[i].agreement['stageId'] = $stateParams.stageId;
                vm.scorecardData[i].agreement['participantId'] = vm.scorecardData[i].participant.id;
                vm.scorecardData[i].agreement['questionId'] = vm.scorecardData[i].question.id;
                if (vm.scorecardData[i].agreement.kpiType == 0)
                    vm.scorecardData[i].agreement.trainings = [];
                evaluationAgreements.push(vm.scorecardData[i].agreement);
            }
            var participantId = ($stateParams.evaluateeId == "null" ? $stateParams.evaluatorId : $stateParams.evaluateeId)
            stageGroupManager.restartSoftProfile(vm.stageRestart.stageGroupId, vm.stageRestart, participantId).then(function (data) {
                if (data) {
                    submit(evaluationAgreements, true);
                    dialogService.showNotification($translate.instant('MYPROFILES_NEW_PHASE_CREATED_SUCCESSFULLY'), 'info');
                    $location.path("/home/profiles/profiles/" + data.profileTypeName.toLowerCase() + "/edit/" + data.profileId + "/stageGroups/active/edit/" + data.stageGroupId)
                }
                else {
                    dialogService.showNotification($translate.instant('MYPROFILES_NEW_PHASE_NOT_CREATED'), 'warning');
                }
            });
        }
        function cancelRestartStage() {
            $("#restartStageModal").modal('hide');
            submitFinalKPI();
        }
        function submit(evaluationAgreements, isRestartPhase) {
            if (!$stateParams.isEdit) {
                finalKPIService.submitFinalKPI(evaluationAgreements).then(function () {
                    var participantId = ($stateParams.evaluateeId == "null" ? $stateParams.evaluatorId : $stateParams.evaluateeId)
                    finalKPIService.sendResultsNotification(participantId, $stateParams.stageId);
                    notification($translate.instant('MYPROFILES_FINAL_KPI_SET_SUCCESSFULLY'));
                    if (!isRestartPhase) {
                        addRCTForNextMilestone($stateParams.profileId, $stateParams.stageId, participantId, profile.profileTypeId)
                        //$state.go(
                        //    $state.$current.parent.self.name,
                        //    null,
                        //    { reload: true }
                        //);
                    }
                },
                    function (data) {
                        notification($translate.instant('MYPROFILES_FINAL_KPI_SET_FAILED'));
                    })
            } else {
                finalKPIService.updateFinalKPI(evaluationAgreements).then(function () {
                    var participantId = ($stateParams.evaluateeId == "null" ? $stateParams.evaluatorId : $stateParams.evaluateeId)
                    finalKPIService.sendResultsNotification(participantId, $stateParams.stageId);
                    notification($translate.instant('MYPROFILES_FINAL_KPI_UPDATED_SUCCESSFULLY'));
                    if (!isRestartPhase) {
                        addRCTForNextMilestone($stateParams.profileId, $stateParams.stageId, participantId, profile.profileTypeId)
                        //$state.go(
                        //    $state.$current.parent.self.name,
                        //    null,
                        //    { reload: true }
                        //);
                    }
                },
                    function (data) {
                        notification($translate.instant('MYPROFILES_FINAL_KPI_UPDATED_FAILED'));
                    })
            }
        }
        function addRCTForNextMilestone(profileId, stageId, participantId, profileTypeId) {
            var nextStage = null;
            var currentStageIndex = _.findIndex(stagesInfo, function (item) {
                return item.id == stageId;
            })
            var currentStage = stagesInfo[currentStageIndex];
            var today = new Date();
            var ans = vm.answers;
            if (answers.length > 0) {
                if (moment(kendo.parseDate(currentStage.evaluationStartDate)).isBefore(moment(today)) && moment(kendo.parseDate(currentStage.evaluationEndDate)).isAfter(moment(today))) {
                    if (currentStageIndex > -1) {
                        if (stagesInfo[currentStageIndex + 1]) {
                            nextStage = stagesInfo[currentStageIndex + 1];
                        }
                    }
                }
            }
            if (nextStage) {
                // check RCT is Added?
                finalKPIService.isRCTAdded(profileId, nextStage.id, participantId, profileTypeId).then(function (isRCTAdded) {
                    if (!isRCTAdded) {
                        dialogService.showYesNoDialog($translate.instant('COMMON_CONFIRM'), $translate.instant("COMMON_CONFIRM_ADD_RCT")).then(
                            function () {
                                finalKPIService.addPreviousStageRCT(profileId, nextStage.id, $stateParams.evaluatorId, $stateParams.evaluateeId).then(function (data) {
                                    if (data) {
                                        dialogService.showYesNoDialog($translate.instant('COMMON_CONFIRM'), $translate.instant("COMMON_CONFIRM_EDIT_RCT")).then(
                                            function () {
                                                //redirect EDit RCT page
                                                editRCT(profileId, nextStage.id, $stateParams.evaluatorId, $stateParams.evaluateeId)
                                            },
                                            function () {
                                                dialogService.showNotification($translate.instant("COMMON_COFIRM_EDIT_RCT_NO") + " " + nextStage.name);
                                            }
                                        )
                                    }
                                });
                            },
                            function () {
                                dialogService.showNotification($translate.instant("COMMON_CONFIRM_ADD_RCT_NO") + " " + nextStage.name);
                            })
                    }
                    else {
                        $state.go(
                            $state.$current.parent.self.name,
                            null,
                            { reload: true }
                        );
                    }
                })
            }
            else {
                $state.go(
                    $state.$current.parent.self.name,
                    null,
                    { reload: true }
                );
            }
        }
        function editRCT(profileId, stageId, participantId, evaluateeId) {
            $location.path("/home/editFinalKPI/" + profileId + "/" + stageId + "/" + participantId + "/" + evaluateeId + "/" + true);
        }
        function notification(message) {
            vm.notificationSavedSuccess.show(message, "info");
        }
        function setTrainings(trainings, evaluationAgreement) {
            if (!evaluationAgreement.agreement) {
                evaluationAgreement.agreement = {
                    trainings: []
                }
            }
            if (evaluationAgreement.agreement && !evaluationAgreement.agreement.trainings) {
                evaluationAgreement.agreement['trainings'] = [];
            }
            var currentStage = getCurrentStage();
            var upcomingStage = getUpcomingStage();
            if (currentStage) {
                _.forEach(trainings, function (item) {
                    item.startDate = kendo.parseDate(currentStage.startDateTime);
                    item.endDate = kendo.parseDate(currentStage.endDateTime);
                    //if (currentStage.evaluationStartDate != null) {
                    //    item.endDate = moment(currentStage.evaluationStartDate).format("L LT");
                    //}
                });
            }
            //if (upcomingStage) {
            //    _.forEach(trainings, function (item) {
            //        if (currentStage.evaluationEndDate == null) {
            //            item.endDate = new Date(moment(upcomingStage.endDateTime).add('days', -1));
            //        }
            //    });
            //}
            var columns = [{ field: "name", title: $translate.instant('COMMON_TITLE') }, { field: "startDateText", title: $translate.instant('COMMON_START_DATE') }, { field: "endDateText", title: $translate.instant('COMMON_END_DATE') }];
            dialogService.showSelectableGridDialogForDatasource($translate.instant('MYPROFILES_SELECT_TRAINING'), columns, trainings).then(
                function (data) {
                    for (var i = 0, len = data.length; i < len; i++) {
                        data[i].organizationId = evaluationAgreement.participantUser.organizationId;
                        data[i].id = 0;
                        data[i].isTemplate = false;
                        if (data[i].trainingMaterials.length > 0) {
                            _.forEach(data[i].trainingMaterials, function (tmItem) {
                                tmItem.id = 0;
                                tmItem.trainingId = 0;
                            })
                        }
                        vm.saveTraining(data[i], evaluationAgreement);
                    }
                });
        }
        function isRequired() {
            return !(vm.totalWeakKPI == vm.profile.kpiWeak && vm.totalStrongKPI == vm.profile.kpiStrong);
        }
        function goToDevContract() {
            $location.path($location.path() + '/devContract');
        }
        var getById = function (id, myArray) {
            if (myArray.filter) {
                return myArray.filter(function (obj) {
                    if (obj.id == id) {
                        return obj;
                    }
                })[0];
            }
            return undefined;
        }
        function parseLocalNum(num) {
            return num.replace(",", ".");
        }
        function copyScore(score) {
            if (score.avgAnswer && score.avgAnswer.answer1) {
                if (!score.agreement) {
                    score['agreement'] = {
                        finalScore: parseFloat(score.avgAnswer.answer1),
                        isFinalScoreCopied: true,
                    }
                } else {
                    if ($scope.IsCopyAllScoresTriggered) {
                        if (!(score.agreement['isFinalScoreCopied'])) {
                            score.agreement['finalScore'] = parseFloat(score.avgAnswer.answer1);
                            score.agreement['isFinalScoreCopied'] = true;
                        }
                    } else {
                        score.agreement['finalScore'] = parseFloat(score.avgAnswer.answer1);
                    }
                }
            }
        }
        function copyAllScores(scores) {
            $scope.IsCopyAllScoresTriggered = true;
            for (var i = 0, len = scores.length; i < len; i++) {
                copyScore(scores[i]);
            }
            $scope.IsCopyAllScoresTriggered = false;
            dialogService.showNotification($translate.instant('MYPROFILES_FINAL_KPI_AVG_SCORE_HAS_BEEN_UPDATED'), 'info');
        }
        function removeTraining(trainingId, trainings) {
            var element = getById(trainingId, trainings);
            var index = trainings.indexOf(element);
            trainings.splice(index, 1);
        }
        function getTrainingsLink(trainingId) {
            $location.path('/home/profiles/profiles/soft/trainings/edit/' + trainingId);
        }
        function isHide(participantAnswer, th) {
            if (participantAnswer === null && th.isParticipantColumn) {
                return true;
            }
            return false;
        }
        function isdisabled(agreement) {
            if (vm.scorecardData) {
                var totalKPI = _.filter(vm.scorecardData, function (item) {
                    // data.agreement.kpiType
                    if (item.agreement) {
                        return item.agreement.kpiType > 0
                    }
                });
                if (totalKPI.length < (vm.profile.kpiWeak + vm.profile.kpiStrong)) {
                    if (agreement) {
                        if (agreement.kpiType > 0) {
                            return false;
                        }
                    }
                    return true;
                }
                else {
                    if (agreement) {
                        if (agreement.kpiType > 0) {
                            return false;
                        }
                    }
                    return true;
                }
            }
        }
        function isActiveStage(th, isshowAllStage) {
            var current = getCurrentStage();
            if (th.stageId < current.id && isshowAllStage == false) {
                return "hide";
            }
            if (th.cssClass == "stage" && th.stageId == current.id) {
                return 'current';
            }
        }
        function isCurrentStage(stageObj, isshowAllStage) {
            var current = getCurrentStage();
            if (stageObj.stageId) {
                if (stageObj.stageId < current.id && isshowAllStage == false) {
                    return "hide";
                }
                if (stageObj.stageId == current.id) {
                    return 'current';
                }
            }
            else {
                if (stageObj.id < current.id && isshowAllStage == false) {
                    return "hide";
                }
                if (stageObj.id == current.id) {
                    return 'current';
                }
            }
        }
        function showInfoPopup() {
            $("#showKPIInfoModal").modal("show");
        }
        function isEditMode() {
            if ($stateParams.isEdit) {
                return true;
            }
        }
        function openInfoPopup(index) {
            if ($(event.target).is("i")) {
                event.preventDefault();
            }
            if (index > 0) {
                vm.infoModal = _.find(InfoArray, function (item) {
                    return item.index == index;
                });
                if (vm.infoModal) {
                    $("#InfoModal").modal("show");
                }
            }
        }
        vm.goToDevContract = goToDevContract;
        vm.setTrainings = setTrainings;
        vm.submitFinalKPI = submitFinalKPI;
        vm.isRequired = isRequired;
        vm.addSortingClass = addSortingClass;
        vm.addClickableClass = addClickableClass;
        vm.changeSorting = changeSorting;
        vm.increaseKPI = increaseKPI;
        vm.getTrainingsLink = getTrainingsLink;
        vm.copyScore = copyScore;
        vm.copyAllScores = copyAllScores;
        vm.removeTraining = removeTraining;
        vm.isHide = isHide;
        vm.isdisabled = isdisabled;
        vm.isActiveStage = isActiveStage;
        vm.isCurrentStage = isCurrentStage;
        vm.isEditMode = isEditMode();
        $scope.openTrainingPopupMode = {
            isOpenNewTrainingPopup: false,
            isOpenAddExistingTrainingPopup: false
        }
        //trainings
        vm.durationMetrics = durationMetrics;
        vm.trainingMaterials = new kendo.data.ObservableArray([]);
        vm.currentScorecardIndex = null;
        vm.openNewTrainingDialog = function (index) {
            $scope.scorecardAnswer = vm.scorecardData[index];
            $scope.saveMode = trainingSaveModeEnum.create;
            $scope.openTrainingPopupMode.isOpenNewTrainingPopup = true;
        };
        vm.editTraining = function (training, index, questionId) {
            $scope.editingTrainingIndex = index;
            $scope.scorecardAnswer = _.find(vm.scorecardData, function (dataItem) {
                return dataItem.questionNo == questionId;
            });
            $scope.saveMode = index >= 0 ? trainingSaveModeEnum.edit : trainingSaveModeEnum.view;
            $scope.editingTraining = training;
            $scope.editingTraining.skills = [$scope.scorecardAnswer.skill];
            $scope.editingTraining.skillId = $scope.scorecardAnswer.skill.id;
            $scope.openTrainingPopupMode.isOpenNewTrainingPopup = true;
        };
        vm.saveTraining = function (newTraining, evaluationAgreement) {
            var evaluationScoreData = _.find(vm.scorecardData, function (item) {
                return item.questionNo == evaluationAgreement.questionNo;
            });
            var item = _.clone(newTraining);
            var skill;
            var skills;
            if (evaluationScoreData) {
                skill = evaluationScoreData.skill;
                skills = evaluationScoreData.skills;
            }
            else {
                skill = evaluationAgreement.skill;
                skills = evaluationAgreement.skills;
            }
            item.startDate = kendo.parseDate(item.startDate);
            item.endDate = kendo.parseDate(item.endDate);
            if (item.id > 0) {
                apiService.update("trainings", item).then(function (data) {
                    if (data) {
                        $scope.newTraining = data;
                        $scope.newTraining.startDate = moment(kendo.parseDate($scope.newTraining.startDate)).format("L LT");
                        $scope.newTraining.endDate = moment(kendo.parseDate($scope.newTraining.endDate)).format("L LT");
                        dialogService.showNotification($translate.instant('MYPROFILES_TRAINING_SAVED_SUCCESSFULLY'), 'info');
                        evaluationAgreement.agreement.trainings.splice($scope.currentTrainingIndex, 1, $scope.newTraining);
                        //updateOldTraining(item, oldTraining);       
                        //$scope.openTrainingPopupMode.isOpenNewTrainingPopup = false;
                    }
                    else {
                        dialogService.showNotification($translate.instant('MYPROFILES_SAVE_FAILED'), 'warning');
                    }
                }, function (error) {
                    dialogService.showNotification(error, "warning");
                });
            }
            else {
                if (skill) {
                    if (skill.skill1) {
                        item.skills = [skill.skill1];
                        item.skill = skill.skill1;
                        item.skillId = skill.skill1.id;
                        item.skillName = skill.skill1.name;
                    } else if (skill.subSkill) {
                        item.skills = [skill.subSkill];
                        item.skill = skill.subSkill;
                        item.skillId = skill.subSkill.id;
                        item.skillName = skill.subSkill.name;
                    } else {
                        item.skills = [skill];
                        item.skill = skill;
                        item.skillId = skill.id;
                        item.skillName = skill.name;
                    }
                }
                else if (skills) {
                    item.skills = skills;
                }
                item.link_PerformanceGroupSkills = [];
                var currentStage = getCurrentStage();
                item.startDate = moment(kendo.parseDate(currentStage.startDateTime)).format("L LT");
                item.endDate = moment(kendo.parseDate(currentStage.endDateTime)).format("L LT");
                //if (currentStage.evaluationStartDate != null) {
                //    item.endDate = moment(currentStage.evaluationStartDate).format("L LT");
                //}
                //else {
                //    //var upcomingStage = getUpcomingStage();
                //    //if (upcomingStage) {
                //    //    item.startDate = moment(currentStage.startDateTime).format("L LT");
                //    //    item.endDate = moment(upcomingStage.endDateTime).add('days', -1).format("L LT");
                //    //}
                //}
                item.isNotificationByEmail = true;
                var notificationTemplateId = null;
                var notificationTemplate = _.filter($scope.notificationTemplates, function (item) {
                    return item.notificationTemplateTypeId == templateTypeEnum.ProfileTrainingNotification && item.isDefualt == true;
                });
                if (notificationTemplate.length > 0) {
                    notificationTemplateId = notificationTemplate[0].id;
                }
                item.notificationTemplateId = notificationTemplateId;
                item.emailBefore = reminderEnum[0].value;
                item.frequency = (item.frequency == null ? "FREQ=WEEKLY;BYDAY=WE" : item.frequency);
                item.howMany = (item.howMany == null ? 1 : item.howMany);
                item.howManySets = (item.howManySets == null ? 1 : item.howManySets);
                item.howManyActions = (item.howManyActions == null ? 1 : item.howManyActions);
                item.duration = (item.duration == null ? 30 : item.duration);
                var durationMetricId = null;
                var durationMetric = _.filter(vm.durationMetrics, function (item) {
                    return item.name.indexOf("Minute") > -1
                })
                if (durationMetric.length > 0) {
                    durationMetricId = durationMetric[0].id;
                }
                item.durationMetricId = durationMetricId;
                item.startDate = kendo.parseDate(item.startDate);
                item.endDate = kendo.parseDate(item.endDate);
                apiService.add("trainings", item).then(function (data) {
                    $scope.newTraining = data;
                    $scope.newTraining.pgSkillId = null;
                    if ($scope.newTraining.id > 0) {
                        dialogService.showNotification($translate.instant('MYPROFILES_TRAINING_SAVED_SUCCESSFULLY'), 'info');
                        evaluationAgreement.agreement.trainings.push($scope.newTraining);
                        //evaluationAgreement.agreement.trainings.push(data[i]);
                        //$scope.openTrainingPopupMode.isOpenNewTrainingPopup = false;
                    } else {
                        dialogService.showNotification($translate.instant('MYPROFILES_SAVE_FAILED'), 'warning');
                    }
                }, function (error) {
                    dialogService.showNotification(error, "warning");
                });
            }
        }
        vm.openLink = function (link) {
            var win = window.open(link);
            win.focus();
        };
        vm.getDate = function (dt) {
            return moment(kendo.parseDate(dt)).isValid() ? moment(kendo.parseDate(dt)).format('L') : null;
        };
        vm.getDateTime = function (dt) {
            return moment(kendo.parseDate(dt)).isValid() ? moment(kendo.parseDate(dt)).format('L LT') : null;
        };
        vm.getTrainingDuration = function (training) {
            if (training.duration && training.durationMetricId) {
                var res = $.grep(vm.durationMetrics, function (e) { return e.id == training.durationMetricId; });
                if (res && res.length == 1)
                    return training.duration + " " + res[0].name.toLowerCase();
            }
            return null;
        };
        //search
        vm.organizations = organizations;
        vm.openSearchWindow = function (index) {
            $scope.openTrainingPopupMode.isOpenAddExistingTrainingPopup = false;
            $scope.scorecardAnswer = vm.scorecardData[index];
            $scope.saveMode = trainingSaveModeEnum.edit;
            $scope.openTrainingPopupMode.isOpenAddExistingTrainingPopup = true;
        };
        //multiple evaluators
        vm.evaluatorsCustomTexts = { buttonDefaultText: 'Select Evaluators...' };
        vm.evaluatorsEvents = {
            onItemSelect: function () {
                updateScorecardMulti();
            },
            onItemDeselect: function () {
                updateScorecardMulti();
            },
            onSelectAll: function () {
                vm.evaluatorsModel = [];
                angular.forEach(vm.evaluatorsOptions, function (item, index) {
                    vm.evaluatorsModel.push({ id: item.id });
                });
                updateScorecardMulti();
            },
            onDeselectAll: function () {
                vm.evaluatorsModel = [];
                updateScorecardMulti();
            }
        };
        function getMultiSelectOptions() {
            var options = [];
            angular.forEach(vm.evaluators, function (item, index) {
                if (item.participant.id != vm.participantId)
                    options.push({ id: item.participant.id, label: item.participantUser.firstName + " " + item.participantUser.lastName });
            });
            return options;
        }
        function updateScorecardMulti() {
            var checkedEvaluators = "";
            angular.forEach(vm.evaluatorsModel, function (item, index) {
                if (item.id != 0) {
                    checkedEvaluators = checkedEvaluators + item.id + ";";
                }
            });
            if (checkedEvaluators == "") {
                if (vm.defaultEvaluator == 0 || vm.defaultEvaluator == null) {
                    checkedEvaluators = $stateParams.evaluateeId;
                }
                else {
                    checkedEvaluators = vm.defaultEvaluator.toString();
                }
            }
            surveyAnalysisService.getScorecard($stateParams.stageId, checkedEvaluators).then(function (data) {
                if (data) {
                    if (!vm.evaluatorsModel || vm.evaluatorsModel.length < 1) {
                        angular.forEach(data, function (item, index) {
                            var avg = 0;
                            if (item.participantAnswer) {
                                if (item.participantAnswer.answer1) {
                                    avg = parseFloat(item.participantAnswer.answer1);
                                }
                                else {
                                    avg = parseFloat(0);
                                }
                            }
                            if (avg % 1 == 0) {
                                if (item.avgAnswer) {
                                    item.avgAnswer.answer1 = parseInt(avg);
                                }
                            }
                            else {
                                item.avgAnswer.answer1 = avg.toFixed(2);
                            }
                            if (item.agreement != null) {
                                if (!(item.agreement.kpiType > 0)) {
                                    item.agreement.kpiType = null;
                                }
                                if (!item.agreement.milestoneAgreementGoals.length > 0) {
                                    _.each(stagesInfo, function (milestoneItem, index) {
                                        if (index == 1) {
                                            item.agreement.milestoneAgreementGoals.push({
                                                stageId: milestoneItem.id,
                                                goal: item.agreement.shortGoal,
                                                participantId: item.participant.id,
                                            });
                                        }
                                        if (index == 2) {
                                            item.agreement.milestoneAgreementGoals.push({
                                                stageId: milestoneItem.id,
                                                goal: item.agreement.midGoal,
                                                participantId: item.participant.id,
                                            });
                                        }
                                        if (index == 3) {
                                            item.agreement.milestoneAgreementGoals.push({
                                                stageId: milestoneItem.id,
                                                goal: item.agreement.longGoal,
                                                participantId: item.participant.id,
                                            });
                                        }
                                        if (index == 4) {
                                            item.agreement.milestoneAgreementGoals.push({
                                                stageId: milestoneItem.id,
                                                goal: item.agreement.finalGoal,
                                                participantId: item.participant.id,
                                            });
                                        }
                                    })
                                }
                            }
                            else {
                                item.agreement = {
                                    kpiType: null,
                                    milestoneAgreementGoals: []
                                };
                                _.each(stagesInfo, function (milestoneItem, index) {
                                    if (index != 0) {
                                        item.agreement.milestoneAgreementGoals.push({
                                            stageId: milestoneItem.id,
                                            goal: 0,
                                            participantId: item.participant.id,
                                        });
                                    }
                                })
                                var strongKpis = localStorageService.get("strongKPIs");
                                if (strongKpis) {
                                    if (strongKpis.indexOf(item.question.id) > -1) {
                                        item.agreement.kpiType = 2
                                        vm.totalStrongKPI++;
                                    }
                                }
                                var weakKPIs = localStorageService.get("weakKPIs");
                                if (weakKPIs) {
                                    if (weakKPIs.indexOf(item.question.id) > -1) {
                                        item.agreement.kpiType = 1
                                        vm.totalWeakKPI++;
                                    }
                                }
                            }
                            item.evaluatorAnswers = [];
                        });
                    }
                    else {
                        angular.forEach(data, function (item, index) {
                            if (item.agreement != null) {
                                if (!(item.agreement.kpiType > 0)) {
                                    item.agreement.kpiType = null;
                                }
                                if (!item.agreement.milestoneAgreementGoals.length > 0) {
                                    _.each(stagesInfo, function (milestoneItem, index) {
                                        if (index == 1) {
                                            item.agreement.milestoneAgreementGoals.push({
                                                stageId: milestoneItem.id,
                                                goal: item.agreement.shortGoal,
                                                participantId: item.participant.id,
                                            });
                                        }
                                        if (index == 2) {
                                            item.agreement.milestoneAgreementGoals.push({
                                                stageId: milestoneItem.id,
                                                goal: item.agreement.midGoal,
                                                participantId: item.participant.id,
                                            });
                                        }
                                        if (index == 3) {
                                            item.agreement.milestoneAgreementGoals.push({
                                                stageId: milestoneItem.id,
                                                goal: item.agreement.longGoal,
                                                participantId: item.participant.id,
                                            });
                                        }
                                        if (index == 4) {
                                            item.agreement.milestoneAgreementGoals.push({
                                                stageId: milestoneItem.id,
                                                goal: item.agreement.finalGoal,
                                                participantId: item.participant.id,
                                            });
                                        }
                                    })
                                }
                            }
                            else {
                                item.agreement = {
                                    kpiType: null,
                                    milestoneAgreementGoals: []
                                };
                                _.each(stagesInfo, function (milestoneItem, index) {
                                    if (index != 0) {
                                        item.agreement.milestoneAgreementGoals.push({
                                            stageId: milestoneItem.id,
                                            goal: 0,
                                            participantId: item.participant.id,
                                        });
                                    }
                                })
                                var strongKpis = localStorageService.get("strongKPIs");
                                if (strongKpis) {
                                    if (strongKpis.indexOf(item.question.id) > -1) {
                                        item.agreement.kpiType = 2
                                        vm.totalStrongKPI++;
                                    }
                                }
                                var weakKPIs = localStorageService.get("weakKPIs");
                                if (weakKPIs) {
                                    if (weakKPIs.indexOf(item.question.id) > -1) {
                                        item.agreement.kpiType = 1
                                        vm.totalWeakKPI++;
                                    }
                                }
                            }
                            var avg = 0;
                            if (item.participantAnswer) {
                                if (item.participantAnswer.answer1) {
                                    avg = parseFloat(item.participantAnswer.answer1);
                                }
                                else {
                                    avg = parseFloat(0);
                                }
                            }
                            var counter = 1;
                            angular.forEach(item.evaluatorAnswers, function (answer, index) {
                                if (answer) {
                                    avg = avg + parseFloat(answer.answer1);
                                    counter++;
                                }
                            });
                            var avgScore = avg / counter;
                            if (avgScore % 1 == 0) {
                                if (item.avgAnswer) {
                                    item.avgAnswer.answer1 = parseInt(avgScore);
                                }
                            }
                            else {
                                item.avgAnswer.answer1 = avgScore.toFixed(2);
                            }
                        });
                    }
                    if ($state.current.name == 'home.finalKPI') {
                        if (!isFirstStage()) {
                            vm.scorecardData = _.filter(data, function (item) {
                                return item.agreement != null && item.agreement.kpiType > 0;
                            });
                        }
                        else {
                            vm.scorecardData = data;
                        }
                    }
                    else {
                        vm.scorecardData = data;
                    }
                    var defaultSortColumn = { "name": "KPI", "isSort": true, "sortBy": "agreement.kpiType", "currentSort": false };
                    var defaultSortColumnIndex = _.findIndex(vm.tableHead, function (item) { return item.name == "KPI" });
                    if (vm.isFirstStage && $state.current.name == 'home.finalKPI') {
                        _.each(vm.tableHead, function (item, i) {
                            if (item.name.indexOf("KPI") > -1) {
                                defaultSortColumnIndex = i;
                                defaultSortColumn = item;
                                return (false);
                            }
                        });
                    }
                    changeSorting(defaultSortColumnIndex, defaultSortColumn);
                    if ($state.current.name.indexOf('Contract') < 0) {
                        if (vm.answers.length > 0) {
                            copyAllScores(vm.scorecardData);
                        }
                    }
                    //
                    //vm.scorecardData = data;
                }
            });
            vm.tableHead = finalKPIService.getTableHeaders(vm.participantUser.firstName + ' ' + vm.participantUser.lastName,
                stagesInfo, vm.isFirstStage, getEvaluatorHeaders());
            _.each(vm.tableHead, function (item, i) {
                if (item.name == "Final Score") {
                    var current = getCurrentStage();
                    item.name = "Final Score For " + current.name + " Performance";
                    return (false);
                }
            });
        }
        vm.smartButtonSettings = {
            smartButtonMaxItems: 3,
            smartButtonTextConverter: function (itemText, originalItem) {
                return itemText;
            }
        };
        function getEvaluatorHeaders() {
            var res = [];
            angular.forEach(vm.evaluatorsModel, function (item, index) {
                angular.forEach(vm.evaluators, function (item2, index) {
                    if (item.id == item2.participant.id)
                        res.push(item2.participantUser.firstName + " " + item2.participantUser.lastName);
                });
            });
            return res;
        }
        vm.defaultEvaluatorName = getDefaultEvaluatorName();
        function getDefaultEvaluatorName() {
            var name = "";
            angular.forEach(vm.evaluators, function (item, index) {
                if (item.participant.id == vm.defaultEvaluator) {
                    name = item.participantUser.firstName + " " + item.participantUser.lastName;
                    return;
                }
            });
            return name;
        }
        $scope.showStrongKPIFn = function (kpi) {
            if (kpi.agreement.kpiType == 2) {
                return true;
            }
        }
        $scope.showWeakKPIFn = function (kpi) {
            if (kpi.agreement.kpiType == 1) {
                return true;
            }
        }
        $scope.makePDF = function () {
            $(".exportoptions").hide();
            testpdf();
        }
        function calculatePDF_height_width(selector, index) {
            var page_section = $(selector).eq(index);
            $scope.HTML_Width = page_section.width();
            $scope.HTML_Height = page_section.height();
            $scope.top_left_margin = 15;
            $scope.PDF_Width = $scope.HTML_Width + ($scope.top_left_margin * 2);
            $scope.PDF_Height = ($scope.PDF_Width * 1.2) + ($scope.top_left_margin * 2);
            $scope.canvas_image_width = $scope.HTML_Width;
            $scope.canvas_image_height = $scope.HTML_Height;
        }
        function generatePDF() {
            var pdf = "";
            const doc = jsPDF('', 'pt', 'A4');
            doc.addHTML(document.getElementByClass('devcontractpage'), 10, 10, { pagesplit: true, margin: { top: 10, right: 10, bottom: 10, left: 10, useFor: 'page' } }, function () { doc.save("test.pdf") })
            //html2canvas($(".devcontractpage")[0], { allowTaint: true }).then(function (canvas) {
            //    calculatePDF_height_width(".devcontractpage", 0);
            //    var imgData = canvas.toDataURL("image/png", 1.0);
            //    pdf = new jsPDF('p', 'pt', 'a4');
            //    pdf.addImage(imgData, 'JPG', $scope.top_left_margin, $scope.top_left_margin, $scope.HTML_Width, $scope.HTML_Height);
            //    //console.log((page_section.length-1)+"==="+index);
            //    setTimeout(function () {
            //        //Save PDF Doc	
            //        pdf.save("HTML-Document.pdf");
            //        //Generate BLOB object
            //        var blob = pdf.output("blob");
            //        //Getting URL of blob object
            //        var blobURL = URL.createObjectURL(blob);
            //        window.open(blobURL, '_blank');
            //    }, 0);
            //});
        };
        //
        function testpdf() {
            var table = $('.devcontractpage').get(0);
            console.log(table);
            html2canvas(table, {
                onrendered: function (canvas) {
                    //$('body').append(canvas);
                    var contentWidth = canvas.width;
                    var contentHeight = canvas.height;
                    // pdf Page offset
                    var position = 20,
                        x = 20,
                        y = 0;
                    // 一Page pdf shows the height of the canvas generated by the html page;
                    var pageHeight = (contentWidth / 595.28 * 841.89);
                    // The html page height of the pdf is not generated, used to calculate the paging
                    var restHeight = contentHeight;
                    // The text that is ultimately used for display
                    //The size of the a4 paper [595.28, 841.89], the width and height of the image generated by the html page in the pdf
                    var imgWidth = 595.28 - position * 2;  // 595.28 - 20 -20 
                    var imgHeight = imgWidth / contentWidth * contentHeight - position * 2; // Scale up
                    // var imgHeight = 841.89 - position * 2
                    var pageData = canvas.toDataURL('image/jpeg', 1.0);
                    // The first parameter is the direction, the second parameter is the unit, and the third parameter is the paper type.
                    var pdf = new jsPDF('', 'pt', 'a4');
                    //There are two heights to distinguish, one is the actual height of the html page, and the height of the page that generated the pdf (841.89)
                    //When the content does not exceed the range displayed on the pdf page, no paging is required.
                    if (restHeight < pageHeight) { // Only one page
                        pdf.addImage(pageData, 'JPEG', x, position, imgWidth, imgHeight);
                    } else { // More than 2 pages
                        while (restHeight > 0) {
                            pdf.addImage(pageData, 'JPEG', x, position + y, imgWidth, imgHeight);
                            restHeight -= pageHeight;
                            y -= 841.89;
                            // Avoid adding blank pages
                            if (restHeight > 0) {
                                pdf.addPage();
                            }
                        }
                    }
                    pdf.save('content.pdf');
                    $(".exportoptions").show();
                }
            });
        };
        //
    }
})();