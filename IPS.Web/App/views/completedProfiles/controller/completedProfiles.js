'use strict';
angular
    .module('ips.activeProfiles')
    .config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
        var basecompletedProfilesResolve = {
            pageName: function ($translate) {
                return $translate.instant('LEFTMENU_COMPLETED_PROFILES');
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
            .state('home.completedProfiles', {
                url: "/:profileTypeId/completedProfiles",
                templateUrl: "views/completedProfiles/views/completedProfiles.html",
                resolve: basecompletedProfilesResolve,
                controller: 'completedProfilesCtrl',
                data: {
                    displayName: '{{pageName}}',//'Active Profiles',
                    paneLimit: 1,
                    depth: 2,
                    resource: "Profiles"
                }
            });

    }])
    .controller('completedProfilesCtrl', completedProfilesCtrl);
completedProfilesCtrl.$inject = ['cssInjector', '$scope', 'activeProfilesService', '$location', 'profilesTypesEnum', 'evaluationRolesEnum', '$translate', 'globalVariables', '$stateParams'];

function completedProfilesCtrl(cssInjector, $scope, activeProfilesService, $location, profilesTypesEnum, evaluationRolesEnum, $translate, globalVariables, $stateParams) {
    cssInjector.removeAll();
    cssInjector.add('views/activeProfiles/activeProfiles.css');
    moment.locale(globalVariables.lang.currentUICulture);
    $scope.profileTypeId = null;
    if ($stateParams.profileTypeId) {
        if ($stateParams.profileTypeId == "soft") {
            $scope.profileTypeId = profilesTypesEnum.soft
        }
        else if ($stateParams.profileTypeId == "knowledge") {
            $scope.profileTypeId = profilesTypesEnum.knowledgetest
        }
    }
    $scope.showAnalysis = showAnalysis;
    $scope.viewFinalKPI = viewFinalKPI;
    $scope.getEvaluationRole = getEvaluationRole;
    $scope.editFinalKPI = editFinalKPI;
    $scope.goToDevContract = goToDevContract;
    $scope.goToRCTContract = goToRCTContract;

    $scope.goToScorecard = function (profileId, stageId, participantId, evaluateeId, stageEvolutionId) {
        evaluateeId = (evaluateeId) ? evaluateeId : participantId;
        $location.path("/home/knowledgetest_result/" + profileId + "/" + stageId + "/" + evaluateeId + '/' + stageEvolutionId);
    };

    $scope.isKnowledge = function (profileTypeId) {
        return (profileTypeId == profilesTypesEnum.knowledgetest);
    };

    $scope.isSoft = function (profileTypeId) {
        return (profileTypeId == profilesTypesEnum.soft);
    };

    $scope.isParticipant = function (evaluationRoleId) {
        return (evaluationRoleId == evaluationRolesEnum.participant);
    };

    $scope.beginAnalysis = function (profileId, stageId, participantId, evaluateeId, profileTypeId, stageEvolutionId) {
        if (profileTypeId == profilesTypesEnum.knowledgetest) {
            evaluateeId = (evaluateeId) ? evaluateeId : participantId;
            $location.path("/home/knowledgetest_analysis/" + profileId + "/" + stageId + "/" + evaluateeId + '/' + stageEvolutionId);
        }
    };

    $scope.goToAgreements = function (profileId, stageId, participantId, evaluateeId, stageEvolutionId) {
        evaluateeId = (evaluateeId) ? evaluateeId : participantId;
        $location.path("/home/kt_final_kpi_preview/" + profileId + "/" + stageId + "/" + evaluateeId + '/' + stageEvolutionId);
    };

    $scope.goToFinalAgreements = function (profileId, stageId, participantId, evaluateeId, stageEvolutionId) {
        evaluateeId = (evaluateeId) ? evaluateeId : participantId;
        $location.path("/home/kt_final_kpi/" + profileId + "/" + stageId + "/" + evaluateeId + '/' + stageEvolutionId);
    };

    $scope.getProfileTypeName = getProfileTypeName;

    function viewFinalKPI(profileId, stageId, participantId, evaluateeId) {
        $location.path("/home/previewFinalKPI/" + profileId + "/" + stageId + "/" + participantId + "/" + evaluateeId);
    }

    function showAnalysis(profileId, stageId, participantId, evaluateeId) {
        evaluateeId = (evaluateeId) ? evaluateeId : participantId;
        $location.path("/home/surveyAnalysis/" + profileId + "/" + stageId + "/" + participantId + "/" + evaluateeId);
    }

    function editFinalKPI(profileId, stageId, participantId, evaluateeId) {
        $location.path("/home/editFinalKPI/" + profileId + "/" + stageId + "/" + participantId + "/" + evaluateeId + "/" + true);
    }

    function goToDevContract(profileId, stageId, participantId, evaluateeId) {
        $location.path("/home/previewFinalKPI/" + profileId + "/" + stageId + "/" + participantId + "/" + evaluateeId + "/devContract");
    }
    function goToRCTContract(profileId, stageId, participantId, evaluateeId) {
        $location.path("/home/previewFinalKPI/" + profileId + "/" + stageId + "/" + participantId + "/" + evaluateeId + "/rctContract");
    }

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
        else {
            return "";
        }
    }

    $scope.kpiOptions = {
        dataSource: {
            type: "json",
            transport: {
                read: function (options) {
                    activeProfilesService.getCompletedProfiles().then(function (data) {
                        var newData = [];
                        for (var j = 0; j < data.length; j++) {
                            if (!data[j].profile.project) {
                                data[j].profile.project = {
                                    name: "",
                                }
                            }
                            if (data[j].profile.profileTypeId == $scope.profileTypeId) {
                                newData.push(data[j]);
                            }
                        }
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
                field: "profile.project.name", title: $translate.instant('COMMON_PROJECT'), width: '20%', sortable: {
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
                field: "stage", title: $translate.instant('COMMON_STAGE'), width: '100px', sortable: {
                    compare: function (a, b) {
                        return a.stage.name > b.stage.name ? 1 : (a.stage.name < b.stage.name ? -1 : 0);
                    }
                }, template: "<div>{{dataItem.stage.name}}</div>"
            },
            {
                field: "role", title: $translate.instant('COMMON_ROLE'), width: '100px', sortable: {
                    compare: function (a, b) {
                        var a1 = getEvaluationRole(a.participant.evaluationRoleId);
                        var b1 = getEvaluationRole(b.participant.evaluationRoleId);
                        return a1 > b1 ? 1 : (a1 < b1 ? -1 : 0);
                    }
                }, template: "<div>{{getEvaluationRole(dataItem.participant.evaluationRoleId)}}</div>"
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
                field: "ended", title: $translate.instant('MYPROFILES_SUBMITTED_AT'), width: '150px', sortable: {
                    compare: function (a, b) {
                        var a1 = moment(kendo.parseDate(a.status.endedAt));
                        var b1 = moment(kendo.parseDate(b.status.endedAt));
                        return a1.isAfter(b1) ? 1 : (b1.isAfter(a1) ? -1 : 0);
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
                field: "due", title: $translate.instant('COMMON_DUE_DATE'), width: '150px', sortable: {
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
                //template: "<div>{{dataItem.stage.endDateTime | date:'short'}}</div>"
            },
            {
                field: "action", title: $translate.instant('COMMON_ACTION'), width: '200px', template: "<div class='icon-groups'>" +
                    "<a class='fa fa-eye fa-lg' ng-show='isSoft(dataItem.profile.profileTypeId)' ng-attr-title ='{{dataItem.previousStage ? \"View performance evaluation Performance\" :  \"View Initial Profile\"}}' ng-click='showAnalysis(dataItem.profile.id, dataItem.stage.id, dataItem.participant.id, dataItem.participant.evaluateeId)' >" +
                    "</a>" +
                    "<a class='fa fa-photo fa-lg' ng-show='isSoft(dataItem.profile.profileTypeId)' ng-attr-title ='{{dataItem.previousStage ? \"View Trainings for this performance evaluation\" :  \"View Final KPIs, Goals and Trainings\"}}' ng-click='viewFinalKPI(dataItem.profile.id, dataItem.stage.id, dataItem.participant.id, dataItem.participant.evaluateeId)' >" +
                    "</a>" +
                    "<a class='fa fa-tasks fa-lg' title='Edit Final KPIs, Goals and Trainings' ng-show='isSoft(dataItem.profile.profileTypeId) && (dataItem.participant.isScoreManager || dataItem.participant.isSelfEvaluation)' ng-click='editFinalKPI(dataItem.profile.id, dataItem.stage.id, dataItem.participant.id, dataItem.participant.evaluateeId)' >" +
                    "</a>" +
                    "<a class='fa fa-newspaper-o fa-lg' title='View Development contract' ng-show='isSoft(dataItem.profile.profileTypeId) && dataItem.isFinalKPISet && (!dataItem.previousStage)' ng-click='goToDevContract(dataItem.profile.id, dataItem.stage.id, dataItem.participant.id, dataItem.participant.evaluateeId)' >" +
                    "</a>" +
                    "<a class='fa fa-file-text fa-lg' title='View RCT contract' ng-show='isSoft(dataItem.profile.profileTypeId) && dataItem.previousStage' ng-click='goToRCTContract(dataItem.profile.id, dataItem.stage.id, dataItem.participant.id, dataItem.participant.evaluateeId)' >" +
                    "</a>" +
                    "<a class='fa fa-file fa-lg' title='Agreements' ng-show='isKnowledge(dataItem.profile.profileTypeId) && isParticipant(dataItem.participant.evaluationRoleId)' ng-disabled='dataItem.isExpired' ng-click='goToAgreements(dataItem.profile.id, dataItem.stage.id, dataItem.participant.id, dataItem.participant.evaluateeId,dataItem.stage.stageEvolutionId)' >" +
                    "</a>" +
                    "<a class='fa fa-pencil fa-lg' title='Update Agreements' ng-show='isKnowledge(dataItem.profile.profileTypeId) && (!isParticipant(dataItem.participant.evaluationRoleId) || dataItem.participant.isSelfEvaluation) ' ng-disabled='dataItem.isExpired' ng-click='goToFinalAgreements(dataItem.profile.id, dataItem.stage.id, dataItem.participant.id, dataItem.participant.evaluateeId,dataItem.stage.stageEvolutionId)' >" +
                    "</a>" +
                    "<a class='fa fa-line-chart fa-lg' title='Run Analysis'" +
                    "ng-show='isKnowledge(dataItem.profile.profileTypeId)' ng-click='beginAnalysis(dataItem.profile.id, dataItem.stage.id, dataItem.participant.id, dataItem.participant.evaluateeId, dataItem.profile.profileTypeId,dataItem.stage.stageEvolutionId)' >" +
                    "</a>" +
                    "<a class='fa fa-list fa-lg' title='Scorecard' ng-show='isKnowledge(dataItem.profile.profileTypeId)' ng-disabled='dataItem.isExpired' ng-click='goToScorecard(dataItem.profile.id, dataItem.stage.id, dataItem.participant.id, dataItem.participant.evaluateeId,dataItem.stage.stageEvolutionId)' >" +
                    "</a>" +
                    "</div>"
            }
        ]
    }

    $scope.tooltipOptions = $(".completed-kpi-profiles-grid").kendoTooltip({
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
}

