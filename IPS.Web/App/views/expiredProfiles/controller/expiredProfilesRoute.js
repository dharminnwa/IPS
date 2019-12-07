'use strict';
angular
    .module('ips.activeProfiles')
    .config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
        var baseExpiredProfilesResolve = {
            pageName: function ($translate) {
                return $translate.instant('MYPROFILES_EXPIRED_PROFILES');
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
            .state('home.expiredProfiles', {
                url: "/:profileTypeId/expiredProfiles",
                templateUrl: "views/expiredProfiles/views/expiredProfiles.html",
                resolve: baseExpiredProfilesResolve,
                controller: 'expiredProfilesCtrl',
                data: {
                    displayName: '{{pageName}}',//'Active Profiles',
                    paneLimit: 1,
                    depth: 2,
                    resource: "Profiles"
                }
            });

    }])
    .controller('expiredProfilesCtrl', expiredProfilesCtrl);
expiredProfilesCtrl.$inject = ['cssInjector', '$scope', 'activeProfilesService', '$location', 'profilesTypesEnum', '$translate', 'globalVariables', '$stateParams'];

function expiredProfilesCtrl(cssInjector, $scope, activeProfilesService, $location, profilesTypesEnum, $translate, globalVariables, $stateParams) {
    cssInjector.removeAll();
    cssInjector.add('views/activeProfiles/activeProfiles.css');
    moment.locale(globalVariables.lang.currentUICulture);
    function isParticipant(evaluationRoleId) {
        return (evaluationRoleId == 2);
    }

    function beginSurvey(profileId, stageId, participantId) {
        var isStandAlone = false;
        $location.path("/home/survey/" + profileId + "/" + stageId + "/" + participantId + "/" + isStandAlone);
    }

    function setKPI(profileId, stageId, participantId) {
        $location.path("/home/ssKPI/" + profileId + "/" + stageId + "/" + participantId);
    }

    function setFinalKPI(profileId, stageId, participantId, evaluateeId) {
        $location.path("/home/finalKPI/" + profileId + "/" + stageId + "/" + participantId + "/" + evaluateeId);
    }

    function showAnalysis(profileId, stageId, participantId, evaluateeId) {
        evaluateeId = (evaluateeId) ? evaluateeId : participantId;
        $location.path("/home/surveyAnalysis/" + profileId + "/" + stageId + "/" + participantId + "/" + evaluateeId);
    }

    function getEvaluationRole(evaluationRoleId) {
        switch (evaluationRoleId) {
            case 1: return 'Evaluator';
                break;
            case 2: return 'Participant';
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
    $scope.profileTypeId = null;
    if ($stateParams.profileTypeId) {
        if ($stateParams.profileTypeId == "soft") {
            $scope.profileTypeId = profilesTypesEnum.soft
        }
        else if ($stateParams.profileTypeId == "knowledge") {
            $scope.profileTypeId = profilesTypesEnum.knowledgetest
        }
    }
    $scope.isParticipant = isParticipant;
    $scope.beginSurvey = beginSurvey;
    $scope.setKPI = setKPI;
    $scope.setFinalKPI = setFinalKPI;
    $scope.showAnalysis = showAnalysis;
    $scope.getEvaluationRole = getEvaluationRole;
    $scope.getProfileTypeName = getProfileTypeName;
    $scope.expiredProfilesOptions = {
        dataSource: {
            type: "json",
            transport: {
                read: function (options) {
                    activeProfilesService.getActiveProfiles().then(function (data) {
                        var newData = [];
                        for (var i = 0; i < data.length; i++) {
                            if ($scope.profileTypeId) {

                                if (data[i].profile.profileTypeId == $scope.profileTypeId) {
                                    if (data[i].isExpired) {
                                        if (!data[i].profile.project) {
                                            data[i].profile.project = {
                                                name: "",
                                            }
                                        }

                                        if (data[i].isBlocked) {
                                            data[i].hasPreviousUnfinishedStages = true;
                                        }
                                        newData.push(data[i]);
                                    }
                                    else {

                                        var hasPreviousUnfinishedStages = false;
                                        for (var j = 0; j < data.length; j++) {
                                            if (data[j].stage.id != data[i].stage.id &&
                                                data[j].stage.stageGroupId == data[i].stage.stageGroupId &&
                                                kendo.parseDate(data[j].stage.startDateTime) < kendo.parseDate(data[i].stage.startDateTime) &&
                                                !data[j].isFinalKPISet) {
                                                hasPreviousUnfinishedStages = true;
                                            }

                                        }

                                        if (hasPreviousUnfinishedStages) {
                                            data[i].hasPreviousUnfinishedStages = true;
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
                field: "profile.project.name", title: $translate.instant('COMMON_PROJECT'), width: '200px', sortable: {
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
                field: "status", title: $translate.instant('MYPROFILES_INVITED_AT'), width: '150px', sortable: {
                    compare: function (a, b) {
                        var a1 = (a.status == null || a.status.invitedAt == null) ? null : moment(kendo.parseDate(a.status.invitedAt));
                        var b1 = (b.status == null || b.status.invitedAt == null) ? null : moment(kendo.parseDate(b.status.invitedAt));
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
                //template: "<div> {{dataItem.status.invitedAt | date:'short'}} </div>"
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
                field: "submited", title: $translate.instant('MYPROFILES_SUBMITTED'), width: '150px', sortable: {
                    compare: function (a, b) {
                        var a1 = a.isSurveyPassed ? 1 : 0;
                        var b1 = b.isSurveyPassed ? 1 : 0;
                        return a1 > b1 ? 1 : (a1 < b1 ? -1 : 0);
                    }
                }, template: "<input type='checkbox' #= isSurveyPassed ? checked='checked' : '' # disabled='disabled' />"
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
                field: "kpiSet", title: $translate.instant('MYPROFILES_KPI_SET'), width: '120px', sortable: {
                    compare: function (a, b) {
                        var a1 = a.iskpiSet ? 1 : 0;
                        var b1 = b.iskpiSet ? 1 : 0;
                        return a1 > b1 ? 1 : (a1 < b1 ? -1 : 0);
                    }
                }, template: "<input type='checkbox' #= iskpiSet ? checked='checked' : '' # disabled='disabled' />"
            },
            {
                field: "action", title: $translate.instant('COMMON_ACTION'), width: '120px', template: "<div>{{dataItem.hasPreviousUnfinishedStages ? ('MYPROFILES_THIS_PROFILE_IS_DUE_BUT_IT_IS_NOT_OPEN' | translate) + ' ' + ('MYPROFILES_CONTACT_YOUR_ADMINISTRATOR' | translate) : ('MYPROFILES_CONTACT_YOUR_ADMINISTRATOR' | translate)}}</div>"
            }
        ]
    }
    $scope.tooltipOptions = $(".expired-profiles-grid").kendoTooltip({
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