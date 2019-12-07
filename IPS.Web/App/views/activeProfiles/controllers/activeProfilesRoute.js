'use strict';
angular
    .module('ips.activeProfiles')

    .config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
        var baseActiveProfilesResolve = {
            pageName: function ($translate) {
                return $translate.instant('LEFTMENU_ACTIVE_PROFILES');
            },
            profiles: function (activeProfilesService, authService) {
                var query = '?$expand=EvaluationRole';
                if (!authService.authentication.isAuth) {
                    authService.getCurrentUser().then(function (response) {
                        return activeProfilesService.getProfiles(response.data.id, query);
                    }, function (e) {

                    });
                }
                else {
                    return activeProfilesService.getProfiles(authService.authentication.user.id, query);
                }
            }
        };
        $stateProvider
            .state('home.activeProfiles', {
                url: "/:profileTypeId/activeProfiles",
                templateUrl: "views/activeProfiles/views/activeProfiles.html",
                resolve: baseActiveProfilesResolve,
                controller: "activeProfilesCtrl",
                data: {
                    displayName: '{{pageName}}',//'Active Profiles',
                    paneLimit: 1,
                    depth: 2,
                    resource: "Profiles"
                }
            });

    }])

    .controller('activeProfilesCtrl', ['cssInjector', '$scope', 'activeProfilesService', '$location', 'profilesTypesEnum', 'evaluationRolesEnum', 'dialogService', '$translate', 'globalVariables', '$stateParams',
        function (cssInjector, $scope, activeProfilesService, $location, profilesTypesEnum, evaluationRolesEnum, dialogService, $translate, globalVariables, $stateParams) {
            cssInjector.removeAll();
            cssInjector.add('views/activeProfiles/activeProfiles.css');
            moment.locale(globalVariables.lang.currentUICulture);
            function isParticipant(evaluationRoleId) {
                return (evaluationRoleId == evaluationRolesEnum.participant);
            }

            function isRunParticipantEvaluationAllowed(isSurveyPassed, evaluationRoleId, profileTypeId) {
                return (profileTypeId == profilesTypesEnum.soft || profileTypeId == profilesTypesEnum.hard) && !isSurveyPassed && (!isParticipant(evaluationRoleId));
            }

            function isSetFinalKPIAllowed(isFinalKPISet, isSurveyPassed, iskpiSet, isScoreManager, isSelfEvaluation, isParticipantPassedSurvey, profileTypeId) {
                return (profileTypeId == profilesTypesEnum.soft || profileTypeId == profilesTypesEnum.hard) && !isFinalKPISet && isSurveyPassed && iskpiSet && (isScoreManager || isSelfEvaluation) && isParticipantPassedSurvey;
            }

            function isViewInitialProfileAllowed(isSurveyPassed, profileTypeId) {
                return (profileTypeId == profilesTypesEnum.soft || profileTypeId == profilesTypesEnum.hard) && isSurveyPassed;
            }

            function isRunAnalysisAllowed(isSurveyPassed, profileTypeId, needToEvaluateTextQuestions) {
                return (profileTypeId == profilesTypesEnum.knowledgetest) && isSurveyPassed && !needToEvaluateTextQuestions;
            }

            function isSetInitialKPIsAllowed(isSurveyPassed, iskpiSet, profileTypeId) {
                return (profileTypeId == profilesTypesEnum.soft || profileTypeId == profilesTypesEnum.hard) && isSurveyPassed && !iskpiSet;
            }

            function isScorecardAllowed(isSurveyPassed, profileTypeId) {
                return profileTypeId == profilesTypesEnum.knowledgetest && isSurveyPassed;
            }

            function beginSurvey(profileId, stageId, participantId, profileTypeId, stageEvolutionId) {
                var isStandAlone = false;
                switch (profileTypeId) {
                    case profilesTypesEnum.soft:
                        $location.path("/home/survey/" + profileId + "/" + stageId + "/" + participantId + "/" + isStandAlone);
                        break;
                    case profilesTypesEnum.hard:
                        $location.path("/home/survey/" + profileId + "/" + stageId + "/" + participantId + "/" + isStandAlone);
                        break;
                    case profilesTypesEnum.knowledgetest:
                        $location.path("/home/knowledgetest_survey/" + profileId + "/" + stageId + "/" + participantId + "/" + stageEvolutionId);
                        break;
                }
            }
            function addRCT(profileId, stageId, participantId, evaluateeId) {


                dialogService.showYesNoDialog($translate.instant('COMMON_CONFIRM'), $translate.instant('MYPROFILES_ARE_YOU_SURE_TO_WANT_PERFORM_PREVIOUS_RCT')).then(
                    function () {
                        activeProfilesService.addPreviousStageRCT(profileId, stageId, participantId, evaluateeId).then(function (data) {
                            dialogService.showNotification($translate.instant('MYPROFILES_RCT_ADDED_SUCCESSFULLY'), "success");
                        });
                    },
                    function () {
                        //alert('No clicked');
                    })


            }

            function beginTextEvaluation(profileId, stageId, participantId, profileTypeId, stageEvolutionId) {
                if (profileTypeId == profilesTypesEnum.knowledgetest) {
                    $location.path("/home/knowledgetest_evaluation/" + profileId + "/" + stageId + "/" + participantId + '/' + stageEvolutionId);
                }
            }

            function goToScorecard(profileId, stageId, participantId, evaluateeId, stageEvolutionId) {
                evaluateeId = (evaluateeId) ? evaluateeId : participantId;
                $location.path("/home/knowledgetest_result/" + profileId + "/" + stageId + "/" + evaluateeId + '/' + stageEvolutionId);
            }

            function beginAnalysis(profileId, stageId, participantId, evaluateeId, profileTypeId, stageEvolutionId) {
                if (profileTypeId == profilesTypesEnum.knowledgetest) {
                    evaluateeId = (evaluateeId) ? evaluateeId : participantId;
                    $location.path("/home/knowledgetest_analysis/" + profileId + "/" + stageId + "/" + evaluateeId + '/' + stageEvolutionId);
                }
            }

            function setKPI(profileId, stageId, participantId) {
                $location.path("/home/KPI/" + profileId + "/" + stageId + "/" + participantId);
            }

            function setFinalKPI(profileId, stageId, participantId, evaluateeId) {
                $location.path("/home/finalKPI/" + profileId + "/" + stageId + "/" + participantId + "/" + evaluateeId);
            }

            function showAnalysis(profileId, stageId, participantId, evaluateeId) {
                evaluateeId = (evaluateeId) ? evaluateeId : participantId;
                $location.path("/home/surveyAnalysis/" + profileId + "/" + stageId + "/" + participantId + "/" + evaluateeId);
            }

            $scope.getParticipantId = function (participant) {
                if (isParticipant(participant.evaluationRoleId)) {
                    return participant.id;
                }
                else {
                    return participant.evaluateeId;
                }
            };

            function getEvaluationRole(evaluationRoleId) {
                switch (evaluationRoleId) {
                    case 1:
                        return 'Evaluator';
                        break;
                    case 2:
                        return 'Participant';
                        break;
                    default:
                        return '';
                }
            }
            function getProfileTypeName(profilesTypeId) {
                if (profilesTypeId == profilesTypesEnum.soft) {
                    return "Soft Profile";
                }
                else if (profilesTypeId == profilesTypesEnum.knowledgetest) {
                    return "Knowledge Profile";
                }
                else if (profilesTypeId == profilesTypesEnum.hard) {
                    return "Hard Profile";
                }
                else {
                    return "";
                }
            }
            function goToRCTContract(profileId, stageId, participantId, evaluateeId) {
                $location.path("/home/previewFinalKPI/" + profileId + "/" + stageId + "/" + participantId + "/" + evaluateeId + "/rctContract");
            }
            function editRCT(profileId, stageId, participantId, evaluateeId) {
                $location.path("/home/editFinalKPI/" + profileId + "/" + stageId + "/" + participantId + "/" + evaluateeId + "/" + true);
            }
            function viewRCT(profileId, stageId, participantId, evaluateeId) {
                $location.path("/home/previewFinalKPI/" + profileId + "/" + stageId + "/" + participantId + "/" + evaluateeId);
            }
            $scope.profileTypeId = null;
            if ($stateParams.profileTypeId) {
                if ($stateParams.profileTypeId == "soft") {
                    $scope.profileTypeId = profilesTypesEnum.soft
                }
                else if ($stateParams.profileTypeId == "knowledge") {
                    $scope.profileTypeId = profilesTypesEnum.knowledgetest
                }
            }
            $scope.viewRCT = viewRCT;
            $scope.editRCT = editRCT;
            $scope.isParticipant = isParticipant;
            $scope.beginSurvey = beginSurvey;
            $scope.addRCT = addRCT;
            $scope.beginAnalysis = beginAnalysis;
            $scope.beginTextEvaluation = beginTextEvaluation;
            $scope.goToScorecard = goToScorecard;
            $scope.setKPI = setKPI;
            $scope.setFinalKPI = setFinalKPI;
            $scope.showAnalysis = showAnalysis;
            $scope.getEvaluationRole = getEvaluationRole;
            $scope.isRunParticipantEvaluationAllowed = isRunParticipantEvaluationAllowed;
            $scope.isRunAnalysisAllowed = isRunAnalysisAllowed;
            $scope.isSetInitialKPIsAllowed = isSetInitialKPIsAllowed;
            $scope.isViewInitialProfileAllowed = isViewInitialProfileAllowed;
            $scope.isSetFinalKPIAllowed = isSetFinalKPIAllowed;
            $scope.isScorecardAllowed = isScorecardAllowed;
            $scope.goToRCTContract = goToRCTContract;
            $scope.isEvaluatorWaiting = function (isSurveyPassed, evaluationRoleId, profileTypeId) {
                return profileTypeId == profilesTypesEnum.knowledgetest
                    && !isSurveyPassed
                    && !isParticipant(evaluationRoleId);
            };
            $scope.getProfileTypeName = getProfileTypeName;

            $scope.isOpenForEvaluation = function (obj, profileTypeId, iskpiSet) {
                if (obj.evaluationStartDate && obj.evaluationEndDate) {
                    var today = new Date();
                    if (profileTypeId == profilesTypesEnum.soft || profileTypeId == profilesTypesEnum.hard) {
                        if (kendo.parseDate(obj.evaluationStartDate).getTime() <= today.getTime() && today.getTime() <= kendo.parseDate(obj.evaluationEndDate).getTime()) {
                            return true;
                        }
                        else {
                            return false;
                        }
                    }
                    else {
                        return true;
                    }
                }
                else {
                    return true;
                }
            }

            $scope.isOpenForAddRCT = function (obj, profileTypeId, iskpiSet, previousStage, isRCTAdded, isScoreManager, isSelfEvaluation) {
                var result = false;
                if (isScoreManager || isSelfEvaluation) {
                    if ((profileTypeId == profilesTypesEnum.soft || profileTypeId == profilesTypesEnum.hard) && previousStage && (!isRCTAdded)) {
                        if (obj.evaluationStartDate && obj.evaluationEndDate) {
                            var today = new Date();
                            if (kendo.parseDate(obj.evaluationStartDate).getTime() < today.getTime() && today.getTime() < kendo.parseDate(obj.evaluationEndDate).getTime()) {
                                result = false;
                            }
                            else {
                                result = true;;
                            }
                        }
                    }
                }
                return result;
            }

            $scope.isSoftProfile = function (profileTypeId) {
                var result = false;
                if (profileTypeId == profilesTypesEnum.soft || profileTypeId == profilesTypesEnum.hard) {
                    result = true;
                }
                return result;
            }

            $scope.activeProfilesOptions = {
                dataSource: {
                    type: "json",
                    transport: {
                        read: function (options) {
                            activeProfilesService.getActiveProfiles().then(function (data) {
                                var newData = [];
                                for (var i = 0; i < data.length; i++) {
                                    if ($scope.profileTypeId) {
                                        if (data[i].profile.profileTypeId == $scope.profileTypeId) {
                                            if ((!data[i].isExpired) && (!(data[i].isPaused || data[i].isStopped))) {
                                                var hasPreviousUnfinishedStages = false;
                                                for (var j = 0; j < data.length; j++) {
                                                    if (data[j].stage.id != data[i].stage.id &&
                                                        data[j].stage.stageGroupId == data[i].stage.stageGroupId &&
                                                        kendo.parseDate(data[j].stage.startDateTime) < kendo.parseDate(data[i].stage.startDateTime) && !data[j].isFinalKPISet)
                                                        hasPreviousUnfinishedStages = true;
                                                }

                                                if (!hasPreviousUnfinishedStages) {
                                                    if (!data[i].profile.project) {
                                                        data[i].profile.project = {
                                                            name: "",
                                                        }
                                                    }
                                                    newData.push(data[i]);
                                                }
                                            }
                                        }
                                    }
                                };
                                options.success(newData);
                            })
                        }
                    },
                    group: {
                        field: "profile.project.name",
                        dir: "asc"
                    }
                },
                selectable: false,
                sortable: true,
                resizable: true,
                columns: [
                    {
                        field: "profile.project.name", title: $translate.instant('COMMON_PROJECT'), width: '100px', sortable: {
                            compare: function (a, b) {
                                return a == "" && b == "" ? a > b ? 1 : (a < b ? -1 : 0) : 1;
                            }
                        }, template: function (dataItem, value) {
                            if (dataItem.profile.project) {
                                return dataItem.profile.project.name;
                            }
                            else {
                                return "";
                            }
                        }
                    },

                    {
                        field: "profile", title: $translate.instant('COMMON_PROFILE'), width: '150px', sortable: {
                            compare: function (a, b) {
                                return a.profile.name > b.profile.name ? 1 : (a.profile.name < b.profile.name ? -1 : 0);
                            }
                        }, template: "<div>{{dataItem.profile.name}}</div>"
                    },
                    {
                        field: "profile", title: $translate.instant('COMMON_PROFILE_TYPE'), width: '150px', sortable: {
                            compare: function (a, b) {
                                return a.profile.profileTypeName > b.profile.profileTypeName ? 1 : (a.profile.profileTypeName < b.profile.profileTypeName ? -1 : 0);
                            }
                        }, template: "<div>{{getProfileTypeName(dataItem.profile.profileTypeId)}}</div>"
                    },
                    {
                        field: "stage", title: $translate.instant('COMMON_STAGE'), width: '80px', sortable: {
                            compare: function (a, b) {
                                return a.stage.name > b.stage.name ? 1 : (a.stage.name < b.stage.name ? -1 : 0);
                            }
                        }, template: "<div>{{dataItem.stage.name}}</div>"
                    },
                    {
                        field: "role",
                        title: $translate.instant('COMMON_ROLE'),
                        width: '80px',
                        sortable: {
                            compare: function (a, b) {
                                var a1 = getEvaluationRole(a.participant.evaluationRoleId);
                                var b1 = getEvaluationRole(b.participant.evaluationRoleId);
                                return a1 > b1 ? 1 : (a1 < b1 ? -1 : 0);
                            }
                        },
                        template: "<div>{{getEvaluationRole(dataItem.participant.evaluationRoleId)}}</div>"
                    },
                    {
                        field: "evaluatee", title: $translate.instant('COMMON_PARTICIPANT'), width: '150px', sortable: {
                            compare: function (a, b) {
                                var a1 = (a.evaluatee == null) ? "" : (a.evaluatee.firstName + " " + a.evaluatee.lastName);
                                var b1 = (b.evaluatee == null) ? "" : (b.evaluatee.firstName + " " + b.evaluatee.lastName);
                                return a1 > b1 ? 1 : (a1 < b1 ? -1 : 0);
                            }
                        }, template: "<div>{{dataItem.evaluatee.firstName}} {{dataItem.evaluatee.lastName}}</div>"
                    },
                    {
                        field: "status", title: $translate.instant('MYPROFILES_INVITED_AT'), width: '120px', sortable: {
                            compare: function (a, b) {
                                var a1 = (a.status == null || a.status.invitedAt == null) ? null : kendo.parseDate(a.status.invitedAt);
                                var b1 = (b.status == null || b.status.invitedAt == null) ? null : kendo.parseDate(b.status.invitedAt);
                                return a1 == null ? -1 : (b1 == null ? 1 : (a1.isAfter(b1) ? 1 : (b1.isAfter(a1) ? -1 : 0)));
                            }
                        },
                        template: function (dataItem) {
                            if (dataItem.status) {
                                if (dataItem.status.invitedAt) {
                                    return moment(kendo.parseDate(dataItem.status.invitedAt)).format("L LT")
                                }
                                else {
                                    return "";
                                }
                            }
                            else {
                                return "";
                            }
                        }
                    },
                    {
                        field: "stage", title: $translate.instant('COMMON_DUE_DATE'), width: '120px', sortable: {
                            compare: function (a, b) {
                                var a1 = moment(kendo.parseDate(a.stage.endDateTime));
                                var b1 = moment(kendo.parseDate(b.stage.endDateTime));
                                return a1.isAfter(b1) ? 1 : (b1.isAfter(a1) ? -1 : 0);
                            }
                        },
                        template: function (dataItem) {
                            if (dataItem.stage) {
                                if (dataItem.stage.endDateTime) {
                                    return moment(kendo.parseDate(dataItem.stage.endDateTime)).format("L LT")
                                }
                                else {
                                    return "";
                                }
                            }
                            else {
                                return "";
                            }
                        }
                        //template: "<div>{{dataItem.stage.endDateTime | date:'short'}} </div>"
                    },
                    {
                        field: "submited",
                        title: $translate.instant('MYPROFILES_SUBMITTED'),
                        width: '150px',
                        sortable: {
                            compare: function (a, b) {
                                var a1 = a.isSurveyPassed ? 1 : 0;
                                var b1 = b.isSurveyPassed ? 1 : 0;
                                return a1 > b1 ? 1 : (a1 < b1 ? -1 : 0);
                            }
                        },
                        template: "<input type='checkbox' #= isSurveyPassed ? checked='checked' : '' # disabled='disabled' />"
                    },
                    {
                        field: "ended", title: $translate.instant('MYPROFILES_SUBMITTED_AT'), width: '150px', sortable: {
                            compare: function (a, b) {
                                var a1 = (a.status == null || a.status.endedAt == null) ? null : moment(kendo.parseDate(a.status.endedAt));
                                var b1 = (b.status == null || b.status.endedAt == null) ? null : moment(kendo.parseDate(b.status.endedAt));
                                return a1 == null ? -1 : (b1 == null ? 1 : (a1.isAfter(b1) ? 1 : (b1.isAfter(a1) ? -1 : 0)));
                            }
                        },
                        template: function (dataItem) {
                            if (dataItem.status) {
                                if (dataItem.status.endedAt) {
                                    return moment(kendo.parseDate(dataItem.status.endedAt)).format("L LT")
                                }
                                else {
                                    return "";
                                }
                            }
                            else {
                                return "";
                            }
                        }
                        //template: "<div>{{dataItem.status.endedAt | date:'short'}}</div>"
                    },
                    {
                        field: "kpiSet",
                        title: $translate.instant('MYPROFILES_KPI_SET'),
                        width: '100px',
                        sortable: {
                            compare: function (a, b) {
                                var a1 = a.iskpiSet ? 1 : 0;
                                var b1 = b.iskpiSet ? 1 : 0;
                                return a1 > b1 ? 1 : (a1 < b1 ? -1 : 0);
                            }
                        },
                        template: "<input type='checkbox' #= iskpiSet ? checked='checked' : '' # disabled='disabled' />"
                    },
                    {
                        field: "action", title: $translate.instant('COMMON_ACTION'), width: '150px',
                        sortable: false, searchable: false, filterable: false,
                        template: "<div class='icon-groups'>" +
                            "<a class='fa fa-play fa-lg' title='Run Evaluation' ng-show='!dataItem.isSurveyPassed && isParticipant(dataItem.participant.evaluationRoleId) && isOpenForEvaluation(dataItem.stage,dataItem.profile.profileTypeId,dataItem.iskpiSet)' ng-disabled='dataItem.isExpired' ng-click='beginSurvey(dataItem.profile.id, dataItem.stage.id, dataItem.participant.id, dataItem.profile.profileTypeId, dataItem.stage.stageEvolutionId)' ></a>" +

                            "<a class='fa fa-plus-square' title='Add RCT'" +
                            "ng-show='isOpenForAddRCT(dataItem.stage,dataItem.profile.profileTypeId,dataItem.iskpiSet,dataItem.previousStage,dataItem.isrctAdded,dataItem.participant.isScoreManager,dataItem.participant.isSelfEvaluation)' ng-disabled='dataItem.isExpired' ng-click='addRCT(dataItem.profile.id, dataItem.stage.id, dataItem.participant.id, dataItem.participant.evaluateeId)' >" +
                            "</a>" +
                            //"<button class='btn btn-cstm cancel' " +
                            //"ng-show='isOpenForAddRCT(dataItem.stage,dataItem.profile.profileTypeId,dataItem.iskpiSet,dataItem.previousStage,dataItem.isrctAdded,dataItem.participant.isScoreManager,dataItem.participant.isSelfEvaluation)' ng-disabled='dataItem.isExpired' ng-click='addRCT(dataItem.profile.id, dataItem.stage.id, dataItem.participant.id, dataItem.participant.evaluateeId)' >" +
                            //"<span>Add RCT</span>" +
                            //"</button>" +

                            "<a class='fa fa-pencil fa-lg' title='Edit RCT'" +
                            "ng-show='dataItem.isrctAdded && (dataItem.participant.isScoreManager || dataItem.participant.isSelfEvaluation)' ng-disabled='dataItem.isExpired' ng-click='editRCT(dataItem.profile.id, dataItem.stage.id, dataItem.participant.id, dataItem.participant.evaluateeId)''></a>" +

                            "<a class='fa fa-photo fa-lg' title='View RCT'" +
                            "ng-show='dataItem.isrctAdded && (isParticipant(dataItem.participant.evaluationRoleId) || (dataItem.participant.isScoreManager || dataItem.participant.isSelfEvaluation))' ng-disabled='dataItem.isExpired' ng-click='viewRCT(dataItem.profile.id, dataItem.stage.id, dataItem.participant.id, dataItem.participant.evaluateeId)'' >" +
                            "</a>" +

                            "<a class='fa fa-file-text fa-lg' title='View RCT Contract'" +
                            "ng-show='dataItem.isrctAdded && (isParticipant(dataItem.participant.evaluationRoleId) || (dataItem.participant.isScoreManager || dataItem.participant.isSelfEvaluation))' ng-disabled='dataItem.isExpired' ng-click='goToRCTContract(dataItem.profile.id, dataItem.stage.id, dataItem.participant.id, dataItem.participant.evaluateeId)'' >" +
                            "</a>" +

                            "<span ng-show='isEvaluatorWaiting(dataItem.isSurveyPassed,dataItem.participant.evaluationRoleId,dataItem.profile.profileTypeId)'>Awaiting for survey results</span>" +
                            "<a class='fa fa-play fa-lg' title='Run evaluation of Participant' " +
                            "ng-show='isRunParticipantEvaluationAllowed(dataItem.isSurveyPassed,dataItem.participant.evaluationRoleId,dataItem.profile.profileTypeId) && isOpenForEvaluation(dataItem.stage,dataItem.profile.profileTypeId,dataItem.iskpiSet)' ng-disabled='dataItem.isExpired' ng-click='beginSurvey(dataItem.profile.id, dataItem.stage.id, dataItem.participant.id, dataItem.profile.profileTypeId)' >" +
                            "</a>" +
                            "<a class='fa fa-list fa-lg' title='Evaluation'" +
                            "ng-show='dataItem.needToEvaluateTextQuestions && (!isParticipant(dataItem.participant.evaluationRoleId) || dataItem.participant.isSelfEvaluation)' ng-disabled='dataItem.isExpired' ng-click='beginTextEvaluation(dataItem.profile.id, dataItem.stage.id, getParticipantId(dataItem.participant), dataItem.profile.profileTypeId,dataItem.stage.stageEvolutionId)' >" +
                            "</a>" +
                            "<a class='fa fa-play fa-lg' title='Run Analysis'" +
                            "ng-show='isRunAnalysisAllowed(dataItem.isSurveyPassed,dataItem.profile.profileTypeId,dataItem.needToEvaluateTextQuestions)' ng-click='beginAnalysis(dataItem.profile.id, dataItem.stage.id, dataItem.participant.id, dataItem.participant.evaluateeId, dataItem.profile.profileTypeId,dataItem.stage.stageEvolutionId)' >" +
                            "</a>" +
                            "<span ng-show='dataItem.needToEvaluateTextQuestions && isParticipant(dataItem.participant.evaluationRoleId) && !dataItem.participant.isSelfEvaluation'>Awaiting for survey evaluation</span>" +
                            "<a ng-attr-title='{{isParticipant(dataItem.participant.evaluationRoleId) ? \"Set initial KPIs\" : \"Set initial KPIs towards Participant\"}}' ng-show='isSetInitialKPIsAllowed(dataItem.isSurveyPassed,dataItem.iskpiSet,dataItem.profile.profileTypeId)' ng-disabled='dataItem.isExpired' ng-click='setKPI(dataItem.profile.id, dataItem.stage.id, dataItem.participant.id)' >" +
                            "<i class='fa fa-lg'>K</i></a>" +
                            "<a class='fa fa-eye fa-lg' ng-attr-title='{{dataItem.previousStage ? \"View Progress\" :  \"View Initial Profile\"}}' ng-show='isViewInitialProfileAllowed(dataItem.isSurveyPassed,dataItem.profile.profileTypeId)' ng-disabled='dataItem.isExpired' ng-click='showAnalysis(dataItem.profile.id, dataItem.stage.id, dataItem.participant.id, dataItem.participant.evaluateeId)' >" +
                            "</a>" +
                            "<a class='fa fa-tasks fa-lg' ng-attr-title ='{{dataItem.previousStage ? \"Set Trainings and Actions\" :  \"Set Final KPIs, Goals and Trainings\"}}' ng-show='isSetFinalKPIAllowed(dataItem.isFinalKPISet,dataItem.isSurveyPassed,dataItem.iskpiSet,dataItem.participant.isScoreManager,dataItem.participant.isSelfEvaluation,dataItem.isParticipantPassedSurvey,dataItem.profile.profileTypeId)' ng-disabled='dataItem.isExpired' ng-click='setFinalKPI(dataItem.profile.id, dataItem.stage.id, dataItem.participant.id, dataItem.participant.evaluateeId)' >" +
                            "</a>" +
                            "<a class='fa fa-list fa-lg' title='Scorecard' ng-show='isScorecardAllowed(dataItem.isParticipantPassedSurvey, dataItem.profile.profileTypeId)' ng-disabled='dataItem.isExpired' ng-click='goToScorecard(dataItem.profile.id, dataItem.stage.id, dataItem.participant.id, dataItem.participant.evaluateeId,dataItem.stage.stageEvolutionId)' >" +
                            "</a>" +
                            "</div>"
                    }
                ]
            }

            $scope.tooltipOptions = $(".active-profiles-grid").kendoTooltip({
                filter: "th.k-header",
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
            }).data("tooltiptext");
        }])
    ;