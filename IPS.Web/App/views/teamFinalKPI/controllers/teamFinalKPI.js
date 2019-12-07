(function () {
    'use strict';

    angular
        .module('ips.teamFinalKPI')

        .config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
            $stateProvider
                .state('home.teamFinalKPI', {
                    url: "/teamFinalKPI/:profileId/:stageId/:evaluatorId/:evaluateeId",
                    templateUrl: "views/teamFinalKPI/views/teamFinalKPI.html",
                    controller: "teamFinalKPICtrl as kpi",
                    resolve: {
                        pageName: function ($translate) {
                            return $translate.instant('MYPROFILES_FINAL_KPI');
                        },
                        scorecardData: function ($stateParams, surveyAnalysisService) {
                            return surveyAnalysisService.getScorecard($stateParams.stageId, $stateParams.evaluatorId).then(function (data) {
                                return data;
                            });
                        },
                        answers: function (teamFinalKPIService, $stateParams) {

                            //return teamFinalKPIService.getAnswersByParticipantIds($stateParams.evaluatorId, $stateParams.stageId);
                            var query = '?$expand=Question&$filter=ParticipantId eq ' + $stateParams.evaluatorId + ' and StageId eq ' + $stateParams.stageId;
                            return teamFinalKPIService.getAnswers(query);
                        },
                        profile: function ($stateParams, profilesService) {
                            return profilesService.getById($stateParams.profileId);
                        },
                        evaluators: function ($stateParams, teamFinalKPIService) {
                            return teamFinalKPIService.getEvaluators($stateParams.stageId, $stateParams.evaluatorId);
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
                        notificationTemplates: function (todosManager, $translate) {
                            return todosManager.getNotificationTemplates().then(function (data) {
                                data.unshift({ id: null, name: $translate.instant('MYPROFILES_SELECT_TEMPLATE') });
                                return data;
                            });
                        },
                    },
                    data: {
                        displayName: '{{pageName}}',//'Final KPI',
                        paneLimit: 1,
                        depth: 3
                    }
                })
        }])

        .controller('teamFinalKPICtrl', teamFinalKPICtrl);

    teamFinalKPICtrl.$inject = ['cssInjector', '$stateParams', 'answers', 'teamFinalKPIService', 'apiService', '$filter', '$location'
        , 'profile', 'evaluators', 'scorecardData', '$state', 'dialogService', 'surveyAnalysisService', 'stagesInfo'
        , 'durationMetrics', '$scope', 'trainingsService', /*'trainings',*/ 'organizations', 'pageMode', 'trainingSaveModeEnum', 'stageGroupManager', 'notificationTemplates', 'reminderEnum', 'localStorageService', '$translate', 'globalVariables'];

    function teamFinalKPICtrl(cssInjector, $stateParams, answers, teamFinalKPIService, apiService, $filter, $location
        , profile, evaluators, scorecardData, $state, dialogService, surveyAnalysisService, stagesInfo
        , durationMetrics, $scope, trainingsService, /*trainings,*/ organizations, pageMode, trainingSaveModeEnum, stageGroupManager, notificationTemplates, reminderEnum, localStorageService, $translate, globalVariables) {

        cssInjector.add('views/finalkpi/finalkpi.css');
        var vm = this;
        var InfoArray = [
            { index: 1, title: $translate.instant('MYPROFILES_AVERAGE'), description: $translate.instant('MYPROFILES_AVERAGE_SCORE_IS_THE_AVERAGE_SCORE_OF_MAIN_PARTICIPANT_SCORE__EVALUATORS_SCORE') },
            { index: 2, title: ">", description: $translate.instant('MYPROFILES_WHEN_YOU_CLICK_AVERAGE_SCORE_WILL_BE_ADDED_FINAL_SCORE_MID_GOAL_COLUMN') },
            { index: 3, title: $translate.instant('MYPROFILES_FINAL_SCORE'), description: $translate.instant('MYPROFILES_FINAL_SCORE_IS_CURRENT_PERFORMANCE_VERSUS_YOUR_GOAL_FOR_THIS_STAGE') },
            { index: 4, title: $translate.instant('MYPROFILES_FREETEXT_TRAINING'), description: $translate.instant('MYPROFILES_ADD_TRAININGS_TOWARDS_NEXT_MILESTONE') },
            {
                index: 5, title: $translate.instant('MYPROFILES_PRESET_TRAININGS'), description: $translate.instant('MYPROFILES_PRESET_TRAININGS_ARE_TRAININGS_ADDED_BY_ADMIN_TO_FIT_OR_SUGGEST_TRAININGS_TOWARDS_THE_SKILL') + ' ' + $translate.instant('MYPROFILES_ONCE_YOU_SELECT_THE_TRAININGS_YOU_WILL_PROCEED_TO_A_DETAIL_PAGE_TELLING_MORE_ABOUT_THE_TRAINING') },
            {
                index: 6, title: $translate.instant('COMMON_ADD_NEW_TRAINING'), description: $translate.instant('MYPROFILES_HERE_YOU_MAY_ADD_A_NEW_TRAININHG_THAT_SUITS_YOUR_NEEDS') + ' ' + $translate.instant('MYPROFILES_IT_WILL_BECOME_YOUR_INDEPENDENT_AND_EXCLUSICE_TRAINING') + ' ' + $translate.instant('MYPROFILES_YOU_MAY_KEEP_IT_FOR_YOUR_SELF_OR_MAKE_IT_PUBLIC_SO_OTHER_USERS_MAY_USE_IT') },
            { index: 7, title: $translate.instant('MYPROFILES_SEARCH_FOR_TRAINING'), description: $translate.instant('MYPROFILES_SEARCH_OTHER_TRAININGS_INSIDE_IMPROVE_SYSTEMS') },
            { index: 8, title: $translate.instant('COMMON_KPI'), description: $translate.instant('MYPROFILES_KPIS_ARE_SELECTED_FOCUS_AREAS_STRONG_AND_WEAK_AREAS') },
            { index: 9, title: $translate.instant('COMMON_EVALUATORS'), description: $translate.instant('MYPROFILES_HERE_EVALUATORS_ARE_ADDED') + ' ' + $translate.instant('MYPROFILES_YOU_MAY_SELECT_ONE_OR_MORE_AND_THEIR_SCORES_WILL_APPEAR_IN_THE_LIST_BELOW') },
            { index: 10, title: $translate.instant('MYPROFILES_FINAL_KPI_MANAGER'), description: $translate.instant('MYPROFILES_PERSON_WITH_FINAL_SCORE_RIGHTS_MEANING_HE_SHE_IS_THE_ONE_IN_CHARGE_FOR_THE_PROJECT') },
            { index: 11, title: $translate.instant('MYPROFILES_PREVIOUS_PERFORMANCE_EVALUATION_STAGES'), description: $translate.instant('MYPROFILES_PREVIOUS_PERFORMANCE_EVALUATION_STAGES') + ' - ' + $translate.instant('MYPROFILES_SHOW_HIDE_PREVIOUS_PERFORMANCE_EVALUATION_STAGE_GOALS') }
        ]
        vm.evaluators = evaluators;
        vm.participants = localStorageService.get("mainParticipants");
        vm.defaultParticipant = parseInt($stateParams.evaluateeId);
        vm.participantUser = (scorecardData && scorecardData.length > 0) ? scorecardData[0].participantUser : {};
        vm.participantId = (scorecardData && scorecardData.length > 0) ? scorecardData[0].participant.id : null;
        $scope.notificationTemplates = notificationTemplates;
        vm.sortCondition = {
            column: '1',
            descending: false
        };
        vm.answers = answers;
        vm.scorecardData = [];
        if ($state.current.name == 'home.teamFinalKPI') {
            if (!isFirstStage()) {
                vm.scorecardData = _.filter(scorecardData, function (item) {
                    return item.agreement != null && item.agreement.kpiType > 0;
                });
            }
            else {
                vm.scorecardData = scorecardData;
            }
        }
        else {
            vm.scorecardData = scorecardData;
        }
        vm.profile = profile;

        vm.isFirstStage = isFirstStage();

        vm.participantsModel = vm.participantId == vm.defaultParticipant ? [] : [{ id: vm.defaultParticipant }];
        vm.participantsOptions = getMultiSelectOptions();
        updateScorecardMulti();
        vm.totalWeakKPI = 0;
        vm.totalStrongKPI = 0;
        vm.maxScoreValue = getMaxScoreValue();
        vm.stages = stagesInfo;
        vm.showAllStage = false;
        vm.currentStageName = getCurrentStageName();

        var stageRestart = {
            stageGroupId: stagesInfo[stagesInfo.length - 1].stageGroup.id,
            name: stagesInfo[stagesInfo.length - 1].stageGroup.name,
            startDate: moment(kendo.parseDate(stagesInfo[stagesInfo.length - 1].endDateTime)).isAfter(moment(new Date()), "day") ? moment(kendo.parseDate(stagesInfo[stagesInfo.length - 1].endDateTime)).add('days', 1).format('L LT') : moment(new Date()).add('days', 1).format('L LT'),
            //endDate: moment(vm.stageInfo.endDate).isAfter(moment(new Date()), "day") ? moment(vm.stageInfo.endDate).add('days', moment.duration(moment(vm.stageInfo.endDate).diff(moment(vm.stageInfo.startDate))).asDays() + 1).format('MM/DD/YYYY') : moment(new Date()).add('days', moment.duration(moment(vm.stageInfo.endDate).diff(moment(vm.stageInfo.startDate))).asDays() + 1).format('MM/DD/YYYY'),
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

        function activate() {
            if ($stateParams.isEdit || (vm.scorecardData && vm.scorecardData.length > 0 && vm.scorecardData[0].agreement)) {
                vm.totalWeakKPI = vm.profile.kpiWeak;
                vm.totalStrongKPI = vm.profile.kpiStrong;
            }
            localStorageService.get("mainParticipants");
            localStorageService.get("stageId");
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
                        vm.scorecardData[i].agreement.kpiType = null;
                        var strongKpis = localStorageService.get("strongKPIs");

                        if (strongKpis) {
                            if (strongKpis.indexOf(vm.scorecardData[i].agreement.questionId) > -1) {
                                vm.scorecardData[i].agreement.kpiType = 2
                                vm.totalStrongKPI++;
                                if (vm.totalStrongKPI > vm.profile.kpiStrong) {
                                    vm.totalStrongKPI = vm.profile.kpiStrong;
                                }
                            }
                        }
                        var weakKPIs = localStorageService.get("weakKPIs");
                        if (weakKPIs) {
                            if (weakKPIs.indexOf(vm.scorecardData[i].agreement.questionId) > -1) {
                                vm.scorecardData[i].agreement.kpiType = 1
                                vm.totalWeakKPI++;
                                if (vm.totalWeakKPI > vm.profile.kpiWeak) {
                                    vm.totalWeakKPI = vm.profile.kpiWeak;
                                }
                            }
                        }
                    }
                    newsd.push(scorecardData[i]);
                }
            }

            if (newsd.length > 0)
                vm.scorecardData = newsd;
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
                var strongKPIs = localStorageService.get("strongKPIs");
                var weakKPIs = localStorageService.get("weakKPIs");
                _.each(vm.scorecardData, function (item) {
                    item.agreement.kpiType = null;
                    if (strongKPIs.indexOf(item.agreement.questionId) > -1) {
                        item.agreement.kpiType = 2;
                    }
                    else if (weakKPIs.indexOf(item.agreement.questionId) > -1) {
                        item.agreement.kpiType = 1;
                    }
                });
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
            var mainParticipantsModel = vm.participantsModel;
            if (mainParticipantsModel.length > 0) {
                _.forEach(mainParticipantsModel, function (item) {
                    teamFinalKPIService.getEvaluators($stateParams.stageId, item.id).then(function (evaluatorItem) {
                        var evaluatorDetail = evaluatorItem;
                        surveyAnalysisService.getScorecard($stateParams.stageId, evaluatorItem[0].participant.id).then(function (data) {
                            var evaluationAgreements = [];
                            var selectekpiTypeagreement = [];
                            _.each(vm.scorecardData, function (item) {
                                if (item.agreement.kpiType > 0) {
                                    selectekpiTypeagreement.push(item.agreement.questionId);
                                }
                            })
                            for (var i = 0, len = data.length; i < len; i++) {
                                if (selectekpiTypeagreement.indexOf(data[i].agreement.questionId) > -1) {

                                    var scorecardDataAgreement = _.find(vm.scorecardData, function (item) {
                                        return item.agreement.questionId == data[i].agreement.questionId;
                                    });

                                    if (scorecardDataAgreement) {
                                        data[i].agreement['stageId'] = $stateParams.stageId;
                                        data[i].agreement['participantId'] = evaluatorItem[0].participant.evaluateeId;
                                        data[i].agreement['questionId'] = scorecardDataAgreement.question.id;
                                        data[i].agreement.kpiType = scorecardDataAgreement.agreement.kpiType;
                                        data[i].agreement.comment = scorecardDataAgreement.agreement.comment;
                                        data[i].agreement.shortGoal = scorecardDataAgreement.agreement.shortGoal;
                                        data[i].agreement.midGoal = scorecardDataAgreement.agreement.midGoal;
                                        data[i].agreement.longGoal = scorecardDataAgreement.agreement.longGoal;
                                        data[i].agreement.finalGoal = scorecardDataAgreement.agreement.finalGoal;
                                        data[i].agreement.finalScore = scorecardDataAgreement.agreement.finalScore;
                                        data[i].agreement.trainings = scorecardDataAgreement.agreement.trainings;
                                        evaluationAgreements.push(data[i].agreement);
                                    }
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
                        });
                    });

                })
            }
            else {


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
                teamFinalKPIService.addTeamEvaluationAgreement(evaluationAgreements).then(function () {
                    teamFinalKPIService.sendResultsNotification($stateParams.evaluateeId, $stateParams.stageId);
                    notification($translate.instant('MYPROFILES_FINAL_KPI_SET_SUCCESSFULLY'));
                    if (!isRestartPhase) {
                        $state.go(
                            $state.$current.parent.self.name,
                            null,
                            { reload: true }
                        );
                    }
                },
                    function (data) {
                        notification($translate.instant('MYPROFILES_FINAL_KPI_SET_FAILED'));
                    })
            } else {
                teamFinalKPIService.updateFinalKPI(evaluationAgreements).then(function () {
                    teamFinalKPIService.sendResultsNotification($stateParams.evaluateeId, $stateParams.stageId);
                    notification($translate.instant('MYPROFILES_FINAL_KPI_UPDATED_SUCCESSFULLY'));
                    if (!isRestartPhase) {
                        $state.go(
                            $state.$current.parent.self.name,
                            null,
                            { reload: true }
                        );
                    }
                },
                    function (data) {
                        notification($translate.instant('MYPROFILES_FINAL_KPI_UPDATED_FAILED'));
                    })
            }
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
            if (currentStage) {
                _.forEach(trainings, function (item) {
                    item.startDate = kendo.parseDate(currentStage.startDateTime);
                    item.endDate = kendo.parseDate(currentStage.endDateTime);
                });
            }

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
                        finalScore: parseFloat(score.avgAnswer.answer1)
                    }
                } else {
                    score.agreement['finalScore'] = parseFloat(score.avgAnswer.answer1);
                }
            }
        }

        function copyAllScores(scores) {
            for (var i = 0, len = scores.length; i < len; i++) {
                copyScore(scores[i]);
            }
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
            if (stageObj.id < current.id && isshowAllStage == false) {
                return "hide";
            }
            if (stageObj.id == current.id) {
                return 'current';
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
                item.startDate = kendo.parseDate(currentStage.startDateTime);
                item.endDate = kendo.parseDate(currentStage.endDateTime);
                item.isNotificationByEmail = true;
                var notificationTemplateId = null;
                var notificationTemplate = _.filter($scope.notificationTemplates, function (item) {
                    return item.name.indexOf("Profile Training Reminder Notification") > -1
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
            $scope.scorecardAnswer = vm.scorecardData[index];
            $scope.saveMode = trainingSaveModeEnum.edit;
            $scope.openTrainingPopupMode.isOpenAddExistingTrainingPopup = true;
        };


        //multiple evaluators

        vm.participantsCustomTexts = { buttonDefaultText: $translate.instant('MYPROFILES_SELECT_PARTICIPANTS') };
        vm.participantsEvents = {
            onItemSelect: function () {
                updateScorecardMulti();
            },
            onItemDeselect: function () {
                updateScorecardMulti();
            },
            onSelectAll: function () {
                vm.participantsModel = [];
                angular.forEach(vm.participantsOptions, function (item, index) {
                    vm.participantsModel.push({ id: item.id });
                });
                updateScorecardMulti();
            },
            onDeselectAll: function () {
                vm.participantsModel = [];
                updateScorecardMulti();
            }
        };

        function getMultiSelectOptions() {
            var options = [];
            angular.forEach(vm.participants, function (item, index) {
                options.push({ id: item.id, label: item.label });
                vm.participantsModel.push({ id: item.id });
            });
            return options;
        }

        function updateScorecardMulti() {
            var checkedParticipants = "";
            var index = 0;
            var participantscoreCardData = [];
            _.each(vm.participantsModel, function (item) {

                teamFinalKPIService.getEvaluators($stateParams.stageId, item.id).then(function (evaluatorItem) {
                    checkedParticipants = checkedParticipants + evaluatorItem[0].participant.id + ";";
                    surveyAnalysisService.getScorecard($stateParams.stageId, evaluatorItem[0].participant.id).then(function (data) {
                        if (data) {
                            participantscoreCardData.push(data);



                            if (index == (vm.participantsModel.length - 1)) {
                                console.log("updateScorecardMulti Last")
                                if (participantscoreCardData.length > 0) {

                                    var participantData = participantscoreCardData[0];
                                    var newData = participantData;

                                    for (var i = 0; i < participantData.length ; i++) {
                                        for (var j = 0; j < participantscoreCardData.length; j++) {
                                            if (j == 0) {
                                                newData[i]["participantAnswers"] = [];
                                            }
                                            newData[i].participantAnswers.push(participantscoreCardData[j][i].participantAnswer);
                                            //var pAnswer = _.filter(participantscoreCardData[j], function (item) {
                                            //    return item.participantAnswer.QuestionId == newData[i].participantAnswer.QuestionId;
                                            //})
                                            //console.log(pAnswer);
                                            //if (pAnswer.length > 0) {
                                            //    newData[i].participantAnswers.push(participantscoreCardData[j][i].participantAnswer);
                                            //}
                                        }
                                    }
                                    data = newData;

                                    angular.forEach(data, function (item, index) {
                                        if (item.agreement != null) {
                                            if (!(item.agreement.kpiType > 0)) {
                                                item.agreement.kpiType = null;
                                            }
                                        }
                                        else {
                                            item.agreement = { kpiType: null };
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


                                        //if (item.evaluatorAnswer) {
                                        //    if (item.participantAnswer.answer1) {
                                        //        avg = parseFloat(item.participantAnswer.answer1);
                                        //    }
                                        //    else {
                                        //        avg = parseFloat(0);
                                        //    }
                                        //}
                                        var avg = 0;
                                        var counter = 1;
                                        angular.forEach(item.participantAnswers, function (answer, index) {
                                            if (answer) {

                                                avg = avg + parseFloat(answer.answer1);

                                                counter++;
                                            }
                                        });


                                        var avgScore = avg / item.participantAnswers.length;

                                        if (avgScore % 1 == 0) {
                                            if (item.avgAnswer) {
                                                item.avgAnswer.answer1 = parseInt(avgScore);
                                            }
                                        }
                                        else {
                                            item.avgAnswer.answer1 = avgScore.toFixed(2);
                                        }
                                    });

                                    vm.scorecardData = data;
                                    var strongKPIs = localStorageService.get("strongKPIs");
                                    var weakKPIs = localStorageService.get("weakKPIs");
                                    _.each(vm.scorecardData, function (item) {
                                        item.agreement.kpiType = null;
                                        if (strongKPIs.indexOf(item.agreement.questionId) > -1) {
                                            item.agreement.kpiType = 2;
                                        }
                                        else if (weakKPIs.indexOf(item.agreement.questionId) > -1) {
                                            item.agreement.kpiType = 1;
                                        }
                                    });


                                }
                                vm.tableHead = teamFinalKPIService.getTableHeaders(evaluatorItem[0].participantUser.firstName + ' ' + evaluatorItem[0].participantUser.lastName,
                               stagesInfo, vm.isFirstStage, getParticipantHeaders());
                                _.each(vm.tableHead, function (item, i) {
                                    if (item.name == "Final Score") {
                                        var current = getCurrentStage();
                                        item.name = "Final Score For " + current.name + " Performance";
                                        return (false);
                                    }
                                });

                                var defaultSortColumn = { "name": "KPI", "isSort": true, "sortBy": "agreement.kpiType", "currentSort": false };
                                var defaultSortColumnIndex = _.findIndex(vm.tableHead, function (item) { return item.name == "KPI" });
                                if (vm.isFirstStage && $state.current.name == 'home.teamFinalKPI') {
                                    _.each(vm.tableHead, function (item, i) {
                                        if (item.name.indexOf("KPI") > -1) {
                                            defaultSortColumnIndex = i;
                                            defaultSortColumn = item;
                                            return (false);
                                        }
                                    });
                                }
                            }
                            index++;

                            //changeSorting(defaultSortColumnIndex, defaultSortColumn);
                            //vm.scorecardData = data;
                        }



                    });
                });
            });
            console.log("updateScorecardMulti")
        }

        vm.smartButtonSettings = {
            smartButtonMaxItems: 3,
            smartButtonTextConverter: function (itemText, originalItem) {
                return itemText;
            }
        };

        function getParticipantHeaders() {
            var res = [];

            angular.forEach(vm.participantsModel, function (item, index) {
                angular.forEach(vm.participants, function (item2, index) {
                    if (item.id == item2.id) {
                        res.push(item2.label);
                    }
                })

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
    }
})();