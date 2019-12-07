
angular.module('ips.profiles')

    .config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
        $stateProvider
            .state('ProfileTrainings', {
                url: "/profiletrainings/:profileId",
                templateUrl: "views/profileTraining/views/profileTrainings.html",
                resolve: {
                    profile: function ($stateParams, apiService) {
                        return apiService.getById("profiles/getFullProfileById", $stateParams.profileId, "").then(function (profileDatail) {
                            var profile = profileDatail;
                            _.each(profile.performanceGroups, function (pgItem) {
                                _.each(pgItem.link_PerformanceGroupSkills, function (link_PerformanceGroupSkillItem) {
                                    link_PerformanceGroupSkillItem.name = link_PerformanceGroupSkillItem.skill.name;
                                    link_PerformanceGroupSkillItem.description = link_PerformanceGroupSkillItem.skill.description;
                                    _.each(link_PerformanceGroupSkillItem.questions, function (questionsItem) {
                                        questionsItem["skillId"] = link_PerformanceGroupSkillItem.id;
                                    });
                                });
                            });
                            _.each(profile.stageGroups, function (sgItem) {
                                sgItem.startDate = moment(kendo.parseDate(sgItem.startDate)).format('L LT');
                                sgItem.endDate = moment(kendo.parseDate(sgItem.endDate)).format('L LT');
                                _.each(sgItem.stages, function (stageItem) {
                                    stageItem.startDateTime = moment(kendo.parseDate(stageItem.startDateTime)).format('L LT')
                                    stageItem.endDateTime = moment(kendo.parseDate(stageItem.endDateTime)).format('L LT')
                                    stageItem.redAlarmTime = moment(kendo.parseDate(stageItem.redAlarmTime)).format('L LT');
                                    stageItem.yellowAlarmTime = moment(kendo.parseDate(stageItem.yellowAlarmTime)).format('L LT');
                                    stageItem.greenAlarmTime = moment(kendo.parseDate(stageItem.greenAlarmTime)).format('L LT');
                                });
                            });
                            return profile;
                        }, function () {
                        })
                    },
                    projectInfo: function (profile, profilesService) {
                        if (profile.projectId > 0) {
                            return profilesService.getProjectById(profile.projectId).then(function (data) {
                                return data;
                            });
                        }
                        else {
                            return null;
                        }

                    },
                    pageName: function (profile, projectInfo, $translate) {
                        if (projectInfo) {
                            return projectInfo.name + ' > ' + profile.name + ' : ' + $translate.instant('MYPROJECTS_PROFILE_TRAININGS');
                        }
                        else {
                            return $translate.instant('MYPROJECTS_PROFILE_TRAININGS');
                        }
                    },
                    trainingLevels: function ($stateParams, profileTrainingManager) {
                        return profileTrainingManager.getTrainingLevels();
                    },
                    trainingTypes: function ($stateParams, profileTrainingManager) {
                        return profileTrainingManager.getTrainingTypes();
                    },
                    durationMetrics: function ($stateParams, profileTrainingManager) {
                        return profileTrainingManager.getDurationMetrics();
                    },
                    exerciseMetrics: function ($stateParams, profileTrainingManager) {
                        return profileTrainingManager.getExerciseMetrics();
                    }
                },
                controller: 'profileTrainingsCtrl',
                data: {
                    displayName: '{{pageName}}',
                    paneLimit: 1,
                    depth: 2
                }
            });

    }])

    .controller('profileTrainingsCtrl', ['$scope', '$location', 'cssInjector', 'authService', 'profilesService', 'profileTrainingManager', '$compile', 'apiService',
        '$stateParams', '$state', 'dialogService', 'projectPhasesEnum', 'phasesLevelEnum', 'materialTypeEnum', 'profilesTypesEnum',
        'localStorageService', 'Upload', 'profile', 'projectInfo', 'trainingLevels', 'trainingTypes', 'durationMetrics', 'exerciseMetrics', '$translate',
        function ($scope, $location, cssInjector, authService, profilesService, profileTrainingManager, $compile, apiService,
            $stateParams, $state, dialogService,
            projectPhasesEnum, phasesLevelEnum, materialTypeEnum, profilesTypesEnum, localStorageService, Upload, profile, projectInfo, trainingLevels, trainingTypes, durationMetrics, exerciseMetrics, $translate) {
            cssInjector.removeAll();
            //cssInjector.add('css/components.min.css');
            //cssInjector.add('css/default.min.css');
            cssInjector.add('views/softprofilewizard/softprofilewizard.css');
            cssInjector.add('views/profileTraining/training-material.css');

            var authData = localStorageService.get('authorizationData');
            $scope.currentUser = authData.user;
            $scope.defaultProjectId = 0;
            $scope.projectPhasesEnum = projectPhasesEnum;
            $scope.phasesLevelEnum = phasesLevelEnum;
            $scope.materialTypes = materialTypeEnum;
            $scope.trainingLevels = trainingLevels;
            $scope.trainingTypes = trainingTypes;
            $scope.durationMetrics = durationMetrics;
            $scope.exerciseMetrics = exerciseMetrics;
            $scope.defaultDurationMetric = _.find(durationMetrics, function (item) {
                return item.name == "Minutes";
            });
            //Profile Setup
            $scope.profile = null;
            $scope.projectInfo = projectInfo;
            if (profile != null) {
                $scope.profile = profile;
                $scope.defaultProjectId = profile.projectId;
                if ($scope.profile.scaleId > 0) {
                    profilesService.getScaleById($scope.profile.scaleId).then(function (scaledata) {
                        $scope.profile.scale = scaledata;
                    }, function () { });
                    //$scope.scaleUpdate($scope.profile.scaleId)
                }

            }
            else {
                dialogService.showNotification($translate.instant('MYPROJECTS_NO_PROFILE'), "error");
            }
            $scope.onFileSelect = function ($files) {
                for (var index = 0; index < $files.length; index++) {
                    var $file = $files[index];
                    $scope.optionModel.material.file = {};
                    Upload.upload({
                        url: webConfig.serviceBase + "api/upload/answerMaterials",
                        method: "POST",
                        file: $file
                    }).success(function (data) {
                        $scope.optionModel.material.file.id = data.id;
                        $scope.optionModel.material.file.name = data.name;
                    }).error(function (data) {
                        dialogService.showNotification(data, 'warning');
                    });
                }
            };

            $scope.init = function () {
                $('#form_trainingmanagement_wizard').bootstrapWizard({
                    'nextSelector': '.button-next',
                    'previousSelector': '.button-previous',
                    onTabClick: function (tab, navigation, index, clickedIndex) {
                        if (clickedIndex == 1) {
                            authService.getCurrentUser().then(function (response) {
                                profileTrainingManager.getProfiles(response.data.id, $scope.defaultProjectId, $scope.profile.id, "").then(function (data) {
                                    if ($("#activeProfileGrid").data("kendoGrid")) {
                                        $("#activeProfileGrid").data("kendoGrid").destroy();
                                    }
                                    $("#activeProfileGrid").html("");
                                    $scope.kpiProfiles = _.filter(data.activeProfiles, function (dataItem) {
                                        //if ($scope.defaultProjectId == dataItem.profile.projectId) {
                                        if (isSetFinalKPIAllowed(dataItem.isFinalKPISet, dataItem.isSurveyPassed, dataItem.iskpiSet, dataItem.participant.isScoreManager, dataItem.participant.isSelfEvaluation, dataItem.isParticipantPassedSurvey, dataItem.profile.profileTypeId)) {
                                            return dataItem;
                                        }
                                        //}
                                    });
                                    $scope.devlopmentContractProfiles = _.filter(data.history, function (dataItem) {
                                        //if ($scope.defaultProjectId == dataItem.profile.projectId) {
                                        if (!$scope.isKnowledge(dataItem.profile.profileTypeId)) {
                                            return dataItem;
                                        }
                                        //}
                                    });
                                    $scope.activeProfilesOptions = {
                                        dataSource: {
                                            type: "json",
                                            data: $scope.kpiProfiles,
                                        },
                                        selectable: false,
                                        sortable: true,
                                        resizable: true,
                                        columns: [

                                            {
                                                field: "profile", title: $translate.instant('COMMON_PROFILE'), width: '20%', sortable: {
                                                    compare: function (a, b) {
                                                        return a.profile.name > b.profile.name ? 1 : (a.profile.name < b.profile.name ? -1 : 0);
                                                    }
                                                }, template: "<div>{{dataItem.profile.name}}</div>"
                                            },
                                            {
                                                field: "profile", title: $translate.instant('COMMON_PROFILE_TYPE'), width: '15%', sortable: {
                                                    compare: function (a, b) {
                                                        return a.profile.profileTypeName > b.profile.profileTypeName ? 1 : (a.profile.profileTypeName < b.profile.profileTypeName ? -1 : 0);
                                                    }
                                                }, template: "<div>{{getProfileTypeName(dataItem.profile.profileTypeId)}}</div>"
                                            },
                                            {
                                                field: "stage", title: $translate.instant('COMMON_STAGE'), width: '8%', sortable: {
                                                    compare: function (a, b) {
                                                        return a.stage.name > b.stage.name ? 1 : (a.stage.name < b.stage.name ? -1 : 0);
                                                    }
                                                }, template: "<div>{{dataItem.stage.name}}</div>"
                                            },
                                            {
                                                field: "role",
                                                title: $translate.instant('COMMON_ROLE'),
                                                width: '8%',
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
                                                field: "evaluatee", title: $translate.instant('COMMON_PARTICIPANT'), width: '10%', sortable: {
                                                    compare: function (a, b) {
                                                        var a1 = (a.evaluatee == null) ? "" : (a.evaluatee.firstName + " " + a.evaluatee.lastName);
                                                        var b1 = (b.evaluatee == null) ? "" : (b.evaluatee.firstName + " " + b.evaluatee.lastName);
                                                        return a1 > b1 ? 1 : (a1 < b1 ? -1 : 0);
                                                    }
                                                }, template: "<div>{{dataItem.evaluatee.firstName}} {{dataItem.evaluatee.lastName}}</div>"
                                            },
                                            {
                                                field: "status", title: $translate.instant('MYPROJECTS_INVITED_AT'), width: '8%', sortable: {
                                                    compare: function (a, b) {
                                                        var a1 = (a.status == null || a.status.invitedAt == null) ? null : moment(kendo.parseDate(a.status.invitedAt));
                                                        var b1 = (b.status == null || b.status.invitedAt == null) ? null : moment(kendo.parseDate(b.status.invitedAt));
                                                        return a1 == null ? -1 : (b1 == null ? 1 : (a1.isAfter(b1) ? 1 : (b1.isAfter(a1) ? -1 : 0)));
                                                    }
                                                },
                                                template: function (dataItem) {
                                                    return moment(kendo.parseDate(dataItem.status.invitedAt)).format("L LT"); //"<div> {{dataItem.status.invitedAt | date:'yyyy-MM-dd HH:mm'}} </div>"
                                                }
                                            },
                                            {
                                                field: "stage", title: $translate.instant('COMMON_DUE_DATE'), width: '8%', sortable: {
                                                    compare: function (a, b) {
                                                        var a1 = moment(kendo.parseDate(a.stage.endDateTime));
                                                        var b1 = moment(kendo.parseDate(b.stage.endDateTime));
                                                        return a1.isAfter(b1) ? 1 : (b1.isAfter(a1) ? -1 : 0);
                                                    }
                                                },
                                                template: function (dataItem) {
                                                    return moment(kendo.parseDate(dataItem.stage.endDateTime)).format("L LT"); //"<div>{{dataItem.stage.endDateTime | date:'yyyy-MM-dd HH:mm'}} </div>"
                                                }
                                            },
                                            {
                                                field: "submited",
                                                title: $translate.instant('MYPROJECTS_SUBMITTED'),
                                                width: '5%',
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
                                                field: "ended", title: $translate.instant('MYPROJECTS_SUBMITTED_AT'), width: '8%', sortable: {
                                                    compare: function (a, b) {
                                                        var a1 = (a.status == null || a.status.endedAt == null) ? null : moment(kendo.parseDate(a.status.endedAt));
                                                        var b1 = (b.status == null || b.status.endedAt == null) ? null : moment(kendo.parseDate(b.status.endedAt));
                                                        return a1 == null ? -1 : (b1 == null ? 1 : (a1.isAfter(b1) ? 1 : (b1.isAfter(a1) ? -1 : 0)));
                                                    }
                                                },
                                                template: function (dataItem) {
                                                    return moment(kendo.parseDate(dataItem.status.endedAt)).format("L LT"); //"<div>{{dataItem.status.endedAt | date:'yyyy-MM-dd HH:mm'}} </div>"
                                                }
                                            },
                                            {
                                                field: "kpiSet",
                                                title: $translate.instant('MYPROJECTS_KPI_SET'),
                                                width: '5%',
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
                                                field: "action", title: $translate.instant('COMMON_ACTION'), width: '20%',
                                                template: function () {
                                                    return "<div class='icon-groups'>" +
                                                        "<button class='btn btn-cstm cancel' ng-disabled='dataItem.isExpired' ng-click='setFinalKPI(dataItem.profile.id, dataItem.stage.id, dataItem.participant.id, dataItem.participant.evaluateeId)' >" +
                                                        "<span>{{dataItem.previousStage ? 'Set Trainings and Actions' : 'Set Final KPIs, Goals and Trainings'}}</span>" +
                                                        "</button>" +

                                                        "</div>"

                                                }

                                            }
                                        ]
                                    };

                                    var linkFn = $compile($("#activeProfileGrid"));
                                    linkFn($scope);
                                });
                            })
                        }
                        else if (clickedIndex == 2) {
                            if ($("#developmentContractGrid").data("kendoGrid")) {
                                $("#developmentContractGrid").data("kendoGrid").destroy();
                            }
                            $("#developmentContractGrid").html("");
                            //$scope.devlopmentContractProfiles = _.filter(data.history, function (dataItem) {
                            //    //if ($scope.defaultProjectId == dataItem.profile.projectId) {
                            //    if (!$scope.isKnowledge(dataItem.profile.profileTypeId)) {
                            //        return dataItem;
                            //    }
                            //    //}
                            //});

                            $scope.developmentContractGridOptions = {
                                dataSource: {
                                    type: "json",
                                    data: $scope.devlopmentContractProfiles,
                                },
                                selectable: false,
                                sortable: {
                                    mode: "single",
                                    allowUnsort: true
                                },
                                resizable: true,
                                columns: [
                                    {
                                        field: "profile", title: $translate.instant('COMMON_PROFILE'), width: '10%',
                                        sortable: {
                                            compare: function (a, b) {
                                                return a.profile.name > b.profile.name ? 1 : (a.profile.name < b.profile.name ? -1 : 0);
                                            }
                                        },
                                        template: "<div>{{dataItem.profile.name}}</div>"
                                    },
                                    {
                                        field: "profile", title: $translate.instant('COMMON_PROFILE_TYPE'), width: '15%', sortable: {
                                            compare: function (a, b) {
                                                return a.profile.profileTypeName > b.profile.profileTypeName ? 1 : (a.profile.profileTypeName < b.profile.profileTypeName ? -1 : 0);
                                            }
                                        }, template: "<div>{{history.getProfileTypeName(dataItem.profile.profileTypeId)}}</div>"
                                    },
                                    {
                                        field: "stage", title: $translate.instant('COMMON_STAGE'), width: '10%',
                                        sortable: {
                                            compare: function (a, b) {
                                                return a.stage.name > b.stage.name ? 1 : (a.stage.name < b.stage.name ? -1 : 0);
                                            }
                                        }, template: "<div>{{dataItem.stage.name}}</div>"
                                    },
                                    {
                                        field: "role", title: $translate.instant('COMMON_ROLE'), width: '10%',
                                        sortable: {
                                            compare: function (a, b) {
                                                var a1 = getEvaluationRole(a.participant.evaluationRoleId);
                                                var b1 = getEvaluationRole(b.participant.evaluationRoleId);
                                                return a1 > b1 ? 1 : (a1 < b1 ? -1 : 0);
                                            }
                                        },
                                        template: "<div>{{history.getEvaluationRole(dataItem.participant.evaluationRoleId)}}</div>"
                                    },
                                    {
                                        field: "evaluatee", title: $translate.instant('COMMON_PARTICIPANT'), width: '10%',
                                        sortable: {
                                            compare: function (a, b) {
                                                var a1 = (a.evaluatee == null) ? "" : (a.evaluatee.firstName + " " + a.evaluatee.lastName);
                                                var b1 = (b.evaluatee == null) ? "" : (b.evaluatee.firstName + " " + b.evaluatee.lastName);
                                                return a1 > b1 ? 1 : (a1 < b1 ? -1 : 0);
                                            }
                                        }, template: "<div>{{dataItem.evaluatee.firstName}} {{dataItem.evaluatee.lastName}}</div>"
                                    },
                                    {
                                        field: "stage", title: $translate.instant('COMMON_DUE_DATE'), width: '10%', sortable: {
                                            compare: function (a, b) {
                                                var a1 = moment(kendo.parseDate(a.stage.endDateTime));
                                                var b1 = moment(kendo.parseDate(b.stage.endDateTime));
                                                return a1.isAfter(b1) ? 1 : (b1.isAfter(a1) ? -1 : 0);
                                            }
                                        },
                                        template: function (dataItem) {
                                            return moment(kendo.parseDate(dataItem.stage.endDateTime)).format("L LT");
                                        }
                                        //template: "<div>{{dataItem.stage.endDateTime | date:'yyyy-MM-dd HH:mm'}} </div>"
                                    },
                                    {
                                        field: "submited",
                                        title: $translate.instant('MYPROJECTS_SUBMITTED'),
                                        width: '10%',
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
                                        field: "ended", title: $translate.instant('MYPROJECTS_SUBMITTED_AT'), width: '10%', sortable: {
                                            compare: function (a, b) {
                                                var a1 = (a.status == null || a.status.endedAt == null) ? null : moment(kendo.parseDate(a.status.endedAt));
                                                var b1 = (b.status == null || b.status.endedAt == null) ? null : moment(kendo.parseDate(b.status.endedAt));
                                                return a1 == null ? -1 : (b1 == null ? 1 : (a1.isAfter(b1) ? 1 : (b1.isAfter(a1) ? -1 : 0)));
                                            }
                                        }, template: "<div>{{dataItem.status.endedAt | date:'yyyy-MM-dd HH:mm'}}</div>"
                                    },
                                    {
                                        field: "kpiSet", title: $translate.instant('MYPROJECTS_KPI_SET'), width: '5%', sortable: {
                                            compare: function (a, b) {
                                                var a1 = a.iskpiSet ? 1 : 0;
                                                var b1 = b.iskpiSet ? 1 : 0;
                                                return a1 > b1 ? 1 : (a1 < b1 ? -1 : 0);
                                            }
                                        }, template: "<input type='checkbox' #= iskpiSet ? checked='checked' : '' # disabled='disabled' />"
                                    },
                                    {
                                        field: "", title: $translate.instant('COMMON_ACTION'), width: '20%', template: "<div class='icon-groups'>" +

                                            "<button class='btn btn-cstm cancel' ng-show='!isKnowledge(dataItem.profile.profileTypeId)' ng-click='goToDevContract(dataItem.profile.id, dataItem.stage.id, dataItem.participant.id, dataItem.participant.evaluateeId)' >" +
                                            "<span>View Development contract</span>" +
                                            "</button>" +
                                            "</div>"
                                    },
                                ]
                            }
                            var linkFn = $compile($("#developmentContractGrid"));
                            linkFn($scope);
                            //authService.getCurrentUser().then(function (response) {
                            //    profileTrainingManager.getProfiles(response.data.id, $scope.defaultProjectId, $scope.profile.id, "").then(function (data) {

                            //    });
                            //})
                        }
                        else if (clickedIndex == 3) {

                        }
                        else {
                            $scope.handleTitle(tab, navigation, index);
                        }
                    },
                    onNext: function (tab, navigation, index) {
                        if (index == 1) {
                            authService.getCurrentUser().then(function (response) {
                                profileTrainingManager.getProfiles(response.data.id, $scope.defaultProjectId, $scope.profile.id, "").then(function (data) {
                                    if ($("#activeProfileGrid").data("kendoGrid")) {
                                        $("#activeProfileGrid").data("kendoGrid").destroy();
                                    }
                                    $("#activeProfileGrid").html("");
                                    $scope.kpiProfiles = _.filter(data.activeProfiles, function (dataItem) {
                                        //if ($scope.defaultProjectId == dataItem.profile.projectId) {
                                        if (isSetFinalKPIAllowed(dataItem.isFinalKPISet, dataItem.isSurveyPassed, dataItem.iskpiSet, dataItem.participant.isScoreManager, dataItem.participant.isSelfEvaluation, dataItem.isParticipantPassedSurvey, dataItem.profile.profileTypeId)) {
                                            return dataItem;
                                        }
                                        //}
                                    });
                                    $scope.devlopmentContractProfiles = _.filter(data.history, function (dataItem) {
                                        //if ($scope.defaultProjectId == dataItem.profile.projectId) {
                                        if (!$scope.isKnowledge(dataItem.profile.profileTypeId)) {
                                            return dataItem;
                                        }
                                        //}
                                    });
                                    $scope.activeProfilesOptions = {
                                        dataSource: {
                                            type: "json",
                                            data: $scope.kpiProfiles,
                                        },
                                        selectable: false,
                                        sortable: true,
                                        resizable: true,
                                        columns: [

                                            {
                                                field: "profile", title: $translate.instant('COMMON_PROFILE'), width: '20%', sortable: {
                                                    compare: function (a, b) {
                                                        return a.profile.name > b.profile.name ? 1 : (a.profile.name < b.profile.name ? -1 : 0);
                                                    }
                                                }, template: "<div>{{dataItem.profile.name}}</div>"
                                            },
                                            {
                                                field: "profile", title: $translate.instant('COMMON_PROFILE_TYPE'), width: '15%', sortable: {
                                                    compare: function (a, b) {
                                                        return a.profile.profileTypeName > b.profile.profileTypeName ? 1 : (a.profile.profileTypeName < b.profile.profileTypeName ? -1 : 0);
                                                    }
                                                }, template: "<div>{{getProfileTypeName(dataItem.profile.profileTypeId)}}</div>"
                                            },
                                            {
                                                field: "stage", title: $translate.instant('COMMON_STAGE'), width: '8%', sortable: {
                                                    compare: function (a, b) {
                                                        return a.stage.name > b.stage.name ? 1 : (a.stage.name < b.stage.name ? -1 : 0);
                                                    }
                                                }, template: "<div>{{dataItem.stage.name}}</div>"
                                            },
                                            {
                                                field: "role",
                                                title: $translate.instant('COMMON_ROLE'),
                                                width: '8%',
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
                                                field: "evaluatee", title: $translate.instant('COMMON_PARTICIPANT'), width: '10%', sortable: {
                                                    compare: function (a, b) {
                                                        var a1 = (a.evaluatee == null) ? "" : (a.evaluatee.firstName + " " + a.evaluatee.lastName);
                                                        var b1 = (b.evaluatee == null) ? "" : (b.evaluatee.firstName + " " + b.evaluatee.lastName);
                                                        return a1 > b1 ? 1 : (a1 < b1 ? -1 : 0);
                                                    }
                                                }, template: "<div>{{dataItem.evaluatee.firstName}} {{dataItem.evaluatee.lastName}}</div>"
                                            },
                                            {
                                                field: "status", title: $translate.instant('MYPROJECTS_INVITED_AT'), width: '8%', sortable: {
                                                    compare: function (a, b) {
                                                        var a1 = (a.status == null || a.status.invitedAt == null) ? null : moment((a.status.invitedAt));
                                                        var b1 = (b.status == null || b.status.invitedAt == null) ? null : moment((b.status.invitedAt));
                                                        return a1 == null ? -1 : (b1 == null ? 1 : (a1.isAfter(b1) ? 1 : (b1.isAfter(a1) ? -1 : 0)));
                                                    }
                                                }, template: "<div> {{dataItem.status.invitedAt | date:'yyyy-MM-dd HH:mm'}} </div>"
                                            },
                                            {
                                                field: "stage", title: $translate.instant('COMMON_DUE_DATE'), width: '8%', sortable: {
                                                    compare: function (a, b) {
                                                        var a1 = moment((a.stage.endDateTime));
                                                        var b1 = moment((b.stage.endDateTime));
                                                        return a1.isAfter(b1) ? 1 : (b1.isAfter(a1) ? -1 : 0);
                                                    }
                                                }, template: "<div>{{dataItem.stage.endDateTime | date:'yyyy-MM-dd HH:mm'}} </div>"
                                            },
                                            {
                                                field: "submited",
                                                title: $translate.instant('MYPROJECTS_SUBMITTED'),
                                                width: '5%',
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
                                                field: "ended", title: $translate.instant('MYPROJECTS_SUBMITTED_AT'), width: '8%', sortable: {
                                                    compare: function (a, b) {
                                                        var a1 = (a.status == null || a.status.endedAt == null) ? null : moment((a.status.endedAt));
                                                        var b1 = (b.status == null || b.status.endedAt == null) ? null : moment((b.status.endedAt));
                                                        return a1 == null ? -1 : (b1 == null ? 1 : (a1.isAfter(b1) ? 1 : (b1.isAfter(a1) ? -1 : 0)));
                                                    }
                                                }, template: "<div>{{dataItem.status.endedAt | date:'yyyy-MM-dd HH:mm'}}</div>"
                                            },
                                            {
                                                field: "kpiSet",
                                                title: $translate.instant('MYPROJECTS_KPI_SET'),
                                                width: '5%',
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
                                                field: "action", title: $translate.instant('COMMON_ACTION'), width: '20%',
                                                template: function () {
                                                    return "<div class='icon-groups'>" +
                                                        "<button class='btn btn-cstm cancel' ng-disabled='dataItem.isExpired' ng-click='setFinalKPI(dataItem.profile.id, dataItem.stage.id, dataItem.participant.id, dataItem.participant.evaluateeId)' >" +
                                                        "<span>{{dataItem.previousStage ? 'Set Trainings and Actions' : 'Set Final KPIs, Goals and Trainings'}}</span>" +
                                                        "</button>" +

                                                        "</div>"

                                                }

                                            }
                                        ]
                                    };

                                    var linkFn = $compile($("#activeProfileGrid"));
                                    linkFn($scope);
                                });
                            })
                        }
                        else if (index == 2) {
                            if ($("#developmentContractGrid").data("kendoGrid")) {
                                $("#developmentContractGrid").data("kendoGrid").destroy();
                            }
                            $("#developmentContractGrid").html("");
                            //$scope.devlopmentContractProfiles = _.filter(data.history, function (dataItem) {
                            //    //if ($scope.defaultProjectId == dataItem.profile.projectId) {
                            //    if (!$scope.isKnowledge(dataItem.profile.profileTypeId)) {
                            //        return dataItem;
                            //    }
                            //    //}
                            //});

                            $scope.developmentContractGridOptions = {
                                dataSource: {
                                    type: "json",
                                    data: $scope.devlopmentContractProfiles,
                                },
                                selectable: false,
                                sortable: {
                                    mode: "single",
                                    allowUnsort: true
                                },
                                resizable: true,
                                columns: [
                                    {
                                        field: "profile", title: $translate.instant('COMMON_PROFILE'), width: '10%',
                                        sortable: {
                                            compare: function (a, b) {
                                                return a.profile.name > b.profile.name ? 1 : (a.profile.name < b.profile.name ? -1 : 0);
                                            }
                                        },
                                        template: "<div>{{dataItem.profile.name}}</div>"
                                    },
                                    {
                                        field: "profile", title: $translate.instant('COMMON_PROFILE_TYPE'), width: '15%', sortable: {
                                            compare: function (a, b) {
                                                return a.profile.profileTypeName > b.profile.profileTypeName ? 1 : (a.profile.profileTypeName < b.profile.profileTypeName ? -1 : 0);
                                            }
                                        }, template: "<div>{{history.getProfileTypeName(dataItem.profile.profileTypeId)}}</div>"
                                    },
                                    {
                                        field: "stage", title: $translate.instant('COMMON_STAGE'), width: '10%',
                                        sortable: {
                                            compare: function (a, b) {
                                                return a.stage.name > b.stage.name ? 1 : (a.stage.name < b.stage.name ? -1 : 0);
                                            }
                                        }, template: "<div>{{dataItem.stage.name}}</div>"
                                    },
                                    {
                                        field: "role", title: $translate.instant('COMMON_ROLE'), width: '10%',
                                        sortable: {
                                            compare: function (a, b) {
                                                var a1 = getEvaluationRole(a.participant.evaluationRoleId);
                                                var b1 = getEvaluationRole(b.participant.evaluationRoleId);
                                                return a1 > b1 ? 1 : (a1 < b1 ? -1 : 0);
                                            }
                                        },
                                        template: "<div>{{history.getEvaluationRole(dataItem.participant.evaluationRoleId)}}</div>"
                                    },
                                    {
                                        field: "evaluatee", title: $translate.instant('COMMON_PARTICIPANT'), width: '10%',
                                        sortable: {
                                            compare: function (a, b) {
                                                var a1 = (a.evaluatee == null) ? "" : (a.evaluatee.firstName + " " + a.evaluatee.lastName);
                                                var b1 = (b.evaluatee == null) ? "" : (b.evaluatee.firstName + " " + b.evaluatee.lastName);
                                                return a1 > b1 ? 1 : (a1 < b1 ? -1 : 0);
                                            }
                                        }, template: "<div>{{dataItem.evaluatee.firstName}} {{dataItem.evaluatee.lastName}}</div>"
                                    },
                                    {
                                        field: "stage", title: $translate.instant('COMMON_DUE_DATE'), width: '10%', sortable: {
                                            compare: function (a, b) {
                                                var a1 = moment((a.stage.endDateTime));
                                                var b1 = moment((b.stage.endDateTime));
                                                return a1.isAfter(b1) ? 1 : (b1.isAfter(a1) ? -1 : 0);
                                            }
                                        }, template: "<div>{{dataItem.stage.endDateTime | date:'yyyy-MM-dd HH:mm'}} </div>"
                                    },
                                    {
                                        field: "submited",
                                        title: $translate.instant('MYPROJECTS_SUBMITTED'),
                                        width: '10%',
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
                                        field: "ended", title: $translate.instant('MYPROJECTS_SUBMITTED_AT'), width: '10%', sortable: {
                                            compare: function (a, b) {
                                                var a1 = (a.status == null || a.status.endedAt == null) ? null : moment((a.status.endedAt));
                                                var b1 = (b.status == null || b.status.endedAt == null) ? null : moment((b.status.endedAt));
                                                return a1 == null ? -1 : (b1 == null ? 1 : (a1.isAfter(b1) ? 1 : (b1.isAfter(a1) ? -1 : 0)));
                                            }
                                        }, template: "<div>{{dataItem.status.endedAt | date:'yyyy-MM-dd HH:mm'}}</div>"
                                    },
                                    {
                                        field: "kpiSet", title: $translate.instant('MYPROJECTS_KPI_SET'), width: '5%', sortable: {
                                            compare: function (a, b) {
                                                var a1 = a.iskpiSet ? 1 : 0;
                                                var b1 = b.iskpiSet ? 1 : 0;
                                                return a1 > b1 ? 1 : (a1 < b1 ? -1 : 0);
                                            }
                                        }, template: "<input type='checkbox' #= iskpiSet ? checked='checked' : '' # disabled='disabled' />"
                                    },
                                    {
                                        field: "", title: $translate.instant('COMMON_ACTION'), width: '20%', template: "<div class='icon-groups'>" +

                                            "<button class='btn btn-cstm cancel' ng-show='!isKnowledge(dataItem.profile.profileTypeId)' ng-click='goToDevContract(dataItem.profile.id, dataItem.stage.id, dataItem.participant.id, dataItem.participant.evaluateeId)' >" +
                                            "<span>View Development contract</span>" +
                                            "</button>" +
                                            "</div>"
                                    },
                                ]
                            }
                            var linkFn = $compile($("#developmentContractGrid"));
                            linkFn($scope);
                            //authService.getCurrentUser().then(function (response) {
                            //    profileTrainingManager.getProfiles(response.data.id, $scope.defaultProjectId, $scope.profile.id, "").then(function (data) {

                            //    });
                            //})
                        }
                        else if (index == 3) {

                        }
                        else {
                            $scope.handleTitle(tab, navigation, index);
                        }
                    },
                    onTabShow: function (tab, navigation, index) {
                        $scope.currentStepIndex = 0;
                        var total = navigation.find('li').length;
                        var current = index + 1;
                        var $percent = (current / total) * 100;
                        $('#form_trainingmanagement_wizard').find('.progress-bar').css({
                            width: $percent + '%'
                        });
                        $scope.setIndex(current);
                    }
                });
            }

            $scope.getProfileTypeName = getProfileTypeName;
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
            $scope.getEvaluationRole = getEvaluationRole;
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
            $scope.isSetFinalKPIAllowed = isSetFinalKPIAllowed;
            function isSetFinalKPIAllowed(isFinalKPISet, isSurveyPassed, iskpiSet, isScoreManager, isSelfEvaluation, isParticipantPassedSurvey, profileTypeId) {
                return (profileTypeId == profilesTypesEnum.soft) && !isFinalKPISet && isSurveyPassed && iskpiSet && (isScoreManager || isSelfEvaluation) && isParticipantPassedSurvey;
            }


            $scope.isKnowledge = function (profileTypeId) {
                return (profileTypeId == profilesTypesEnum.knowledgetest);
            };

            $scope.goToDevContract = goToDevContract;
            function goToDevContract(profileId, stageId, participantId, evaluateeId) {
                $location.path("/home/previewFinalKPI/" + profileId + "/" + stageId + "/" + participantId + "/" + evaluateeId + "/devContract");
            }
            $scope.handleTitle = function (tab, navigation, index) {
                var total = navigation.find('li').length;
                var current = index + 1;

                // set done steps
                var li_list = navigation.find('li');
                for (var i = 0; i < index; i++) {
                    //jQuery(li_list[i]).addClass("done");
                }

                if (current == 1) {
                    $scope.currentStepIndex = 1;
                    $('#form_profilesetup_wizard').find('.button-previous').hide();
                } else {
                    $scope.currentStepIndex = current;
                    $('#form_profilesetup_wizard').find('.button-previous').show();
                }
                if (current >= total) {
                    $('#form_profilesetup_wizard').find('.button-next').hide();
                    $('#form_profilesetup_wizard').find('.button-submit').show();

                } else {
                    $('#form_profilesetup_wizard').find('.button-next').show();
                    $('#form_profilesetup_wizard').find('.button-submit').hide();
                }

            }
            $scope.setIndex = function (current) {
                $scope.currentStepIndex = current;
                if (current == 1) {
                    $scope.currentStepIndex = 1;
                    $('#form_trainingmanagement_wizard').find('.button-previous').hide();
                } else {
                    $scope.currentStepIndex = current;
                    $('#form_trainingmanagement_wizard').find('.button-previous').show();
                }
                if (current >= 3) {
                    $('#form_trainingmanagement_wizard').find('.button-next').hide();
                    $('#form_trainingmanagement_wizard').find('.button-submit').show();
                } else {
                    $('#form_trainingmanagement_wizard').find('.button-next').show();
                    $('#form_trainingmanagement_wizard').find('.button-submit').hide();
                }
            }
            //PresetTrainnig
            $scope.openNewPresetTrainnigModal = function (performanceGroupId) {
                $scope.pgSkills = [];
                _.each($scope.profile.performanceGroups, function (item) {
                    if (item.id == performanceGroupId) {
                        _.each(item.link_PerformanceGroupSkills, function (skillItem) {
                            $scope.pgSkills.push(skillItem);
                        })
                    }
                });

                var ipsSkillFiter = {
                    organizationId: $scope.profile.organizationId,
                    performanceGroupId: performanceGroupId,
                }

                var endDate = "";
                if ($scope.profile.stageGroups.length > 0) {
                    endDate = moment(kendo.parseDate($scope.profile.stageGroups[0].endDate)).format('L LT')
                }

                $scope.newTraining = {
                    id: 0,
                    name: 'New Training',
                    typeId: null,
                    levelId: null,
                    why: '',
                    what: '',
                    how: '',
                    additionalInfo: '',
                    startDate: moment(new Date()).format('L LT'),
                    endDate: endDate,
                    duration: 30,
                    durationMetricId: $scope.defaultDurationMetric ? $scope.defaultDurationMetric.id : null,
                    frequency: "FREQ=WEEKLY;BYDAY=WE",
                    howMany: 1,
                    exerciseMetricId: null,
                    howManySets: 1,
                    howManyActions: 1,
                    isActive: true,
                    organizationId: $scope.currentUser.organizationId,
                    trainingMaterial: { id: 0, name: "", description: "", title: "", materialType: "", resourceType: "" },
                    trainingMaterials: new kendo.data.ObservableArray([]),
                    userId: $scope.userId,
                    skillId: null,
                    notificationTemplateId: null,
                    isNotificationByEmail: true,
                    emailNotificationIntervalId: null,
                    emailBefore: null,
                    isNotificationBySMS: false,
                    smsNotificationIntervalId: null,
                    performanceGroupId: performanceGroupId,
                }
                $("#presetTrainingModal").modal("show");
            }
            $scope.openNewPresetTrainnigMaterialModal = function (performanceGroupId) {
                $scope.trainingMaterial = {
                    id: 0,
                    description: "",
                    title: "",
                    materialType: "",
                    resourceType: "",
                    link: "",
                    name: "",
                },
                    $("#presetTrainingMaterialModal").modal("show");
            }
            $scope.openEditPresetTrainnigMaterialModal = function (trainnigMaterialId) {
                var trainingMaterial = _.find($scope.newTraining.trainingMaterials, function (trainingMaterialItem) {
                    return trainingMaterialItem.id == trainnigMaterialId;
                });
                if (trainingMaterial) {
                    $scope.trainingMaterial = {
                        id: trainingMaterial.id,
                        description: trainingMaterial.description,
                        title: trainingMaterial.title,
                        materialType: trainingMaterial.materialType,
                        resourceType: trainingMaterial.resourceType,
                        link: trainingMaterial.link,
                        name: trainingMaterial.name,
                    },
                        $("#presetTrainingMaterialModal").modal("show");
                }
            }
            $scope.addNewPresetTrainnigMaterial = function () {
                if ($scope.trainingMaterial.id == 0) {
                    $scope.trainingMaterial.id = ($scope.newTraining.trainingMaterials.length + 1) * -1;
                    $scope.newTraining.trainingMaterials.push($scope.trainingMaterial);
                }
                else {
                    _.each($scope.newTraining.trainingMaterials, function (trainingMaterialItem) {
                        if (trainingMaterialItem.id == $scope.trainingMaterial.id) {
                            trainingMaterialItem = $scope.trainingMaterial;
                        }
                    })
                    //Edit
                }
            }
            $scope.openEditPresetTrainnigModal = function (performanceGroupId, trainingId) {
                $scope.pgSkills = [];
                _.each($scope.profile.performanceGroups, function (item) {
                    if (item.id == performanceGroupId) {
                        _.each(item.link_PerformanceGroupSkills, function (skillItem) {
                            $scope.pgSkills.push(skillItem);
                        });
                    }
                });
                _.each($scope.profile.performanceGroups, function (item) {
                    if (item.id == performanceGroupId) {
                        _.each(item.link_PerformanceGroupSkills, function (skillItem) {
                            _.each(skillItem.trainings, function (trainingItem) {
                                if (trainingItem.id == trainingId) {
                                    trainingItem.startDate = moment(kendo.parseDate(trainingItem.startDate)).format('L LT');
                                    trainingItem.endDate = moment(kendo.parseDate(trainingItem.endDate)).format('L LT');
                                    trainingItem["skillId"] = skillItem.skillId;
                                    $scope.newTraining = angular.copy(trainingItem);
                                }
                            })
                        })
                    }
                });
                $("#presetTrainingModal").modal("show");
            }
            $scope.removePresetTrainnigMaterialModal = function (trainnigMaterialId) {
                dialogService.showYesNoDialog($translate.instant('COMMON_CONFIRM'), $translate.instant('COMMON_ARE_YOU_SURE_YOU_WANT_TO_DELETE')).then(
                    function () {
                        var index = _.findIndex($scope.newTraining.trainingMaterials, function (item) {
                            return item.id == trainnigMaterialId;
                        })
                        $scope.newTraining.trainingMaterials.splice(index, 1);
                        _.each($scope.newTraining.trainingMaterials, function (tmItem, tmindex) {
                            if (tmItem.id < 0) {
                                tmItem.id = (tmindex + 1) * -1;
                            }
                        })
                        dialogService.showNotification($translate.instant('MYPROJECTS_PROJECTPROFILES_TRAINING_MATERIAL_REMOVED_SUCCESSFULLY'), "success")
                    },
                    function () {
                        //alert('No clicked');
                    });




            }

            //Skills
            $scope.isSkillModalDisabled = false;
            $scope.openEditSkillModal = function (performanceGroupId, skillId) {
                $scope.isSkillModalDisabled = false;
                _.each($scope.profile.performanceGroups, function (item) {
                    if (item.id == performanceGroupId) {
                        _.each(item.link_PerformanceGroupSkills, function (skillItem) {
                            if (skillItem.id == skillId) {
                                if (skillItem.weight) {
                                    skillItem.weight = parseInt(skillItem.weight);
                                }
                                $scope.link_PerformanceGroupSkill = angular.copy(skillItem);;
                                return (false);
                            }
                        })
                    }
                });
                $("#skillModal").modal("show");
                $("#skillModal .modal-title").html($translate.instant('MYPROJECTS_PROJECTPROFILES_EDIT_SKILL_DETAILS'))
            }
            $scope.openViewSkillModal = function (performanceGroupId, skillId) {
                $scope.isSkillModalDisabled = true;
                _.each($scope.profile.performanceGroups, function (item) {
                    if (item.id == performanceGroupId) {
                        _.each(item.link_PerformanceGroupSkills, function (skillItem) {
                            if (skillItem.id == skillId) {
                                if (skillItem.weight) {
                                    skillItem.weight = parseInt(skillItem.weight);
                                }
                                $scope.link_PerformanceGroupSkill = angular.copy(skillItem);;
                                return (false);
                            }
                        })
                    }
                });
                $("#skillModal").modal("show");
                $("#skillModal .modal-title").html($translate.instant('MYPROJECTS_PROJECTPROFILES_VIEW_SKILL_DETAILS'))
            }
            $scope.addNewSkill = function () {
                if ($scope.link_PerformanceGroupSkill.id == 0) {
                    if ($scope.link_PerformanceGroupSkill.performanceGroupId > 0) {
                        _.each($scope.profile.performanceGroups, function (item) {
                            if (item.id == $scope.link_PerformanceGroupSkill.performanceGroupId) {
                                $scope.link_PerformanceGroupSkill.id = (item.link_PerformanceGroupSkills.length + 1) * -1
                                $scope.link_PerformanceGroupSkill.skillId = (item.link_PerformanceGroupSkills.length + 1) * -1
                                if ($scope.link_PerformanceGroupSkill.skill) {

                                    $scope.link_PerformanceGroupSkill.skill["name"] = $scope.link_PerformanceGroupSkill.name;
                                    $scope.link_PerformanceGroupSkill.skill["description"] = $scope.link_PerformanceGroupSkill.description;
                                    if ($scope.link_PerformanceGroupSkill.skill.trainingDescriptions) {
                                    }

                                }
                                else {
                                    $scope.link_PerformanceGroupSkill.skill = {
                                        name: $scope.link_PerformanceGroupSkill.name,
                                        description: $scope.link_PerformanceGroupSkill.description,
                                    }
                                }
                                var skillIds = [$scope.link_PerformanceGroupSkill];
                                softProfileManager.addPerformanceGroupSkill($scope.link_PerformanceGroupSkill.performanceGroupId, skillIds).then(function (skilldata) {
                                    $scope.link_PerformanceGroupSkill.id = skilldata[0].id;
                                    $scope.link_PerformanceGroupSkill.skill.id = skilldata[0].skillId;
                                    $scope.link_PerformanceGroupSkill.skillId = skilldata[0].skillId;
                                    item.link_PerformanceGroupSkills.push($scope.link_PerformanceGroupSkill);
                                });

                            }
                        });


                    }
                    else {
                        _.each($scope.profile.performanceGroups, function (item) {
                            if (item.id == $scope.link_PerformanceGroupSkill.performanceGroupId) {
                                $scope.link_PerformanceGroupSkill.id = (item.link_PerformanceGroupSkills.length + 1) * -1
                                $scope.link_PerformanceGroupSkill.skillId = (item.link_PerformanceGroupSkills.length + 1) * -1
                                if ($scope.link_PerformanceGroupSkill.skill) {

                                    $scope.link_PerformanceGroupSkill.skill["name"] = $scope.link_PerformanceGroupSkill.name;
                                    $scope.link_PerformanceGroupSkill.skill["description"] = $scope.link_PerformanceGroupSkill.description;
                                    if ($scope.link_PerformanceGroupSkill.skill.trainingDescriptions) {
                                    }

                                }
                                else {
                                    $scope.link_PerformanceGroupSkill.skill = {
                                        name: $scope.link_PerformanceGroupSkill.name,
                                        description: $scope.link_PerformanceGroupSkill.description,
                                    }
                                }
                                item.link_PerformanceGroupSkills.push($scope.link_PerformanceGroupSkill);
                            }
                        });
                    }
                }
                else {
                    //Edit
                    if ($scope.link_PerformanceGroupSkill.id > 0) {
                        var skill = {
                            id: $scope.link_PerformanceGroupSkill.skillId,
                            name: $scope.link_PerformanceGroupSkill.name,
                            description: $scope.link_PerformanceGroupSkill.description
                        };

                        apiService.update("skills", skill).then(function (data) {
                            if (data) {
                                var skillIds = [$scope.link_PerformanceGroupSkill];
                                apiService.update("Performance_groups/" + $scope.link_PerformanceGroupSkill.performanceGroupId + "/newskills", skillIds).then(function (dataResult) {
                                    _.each($scope.profile.performanceGroups, function (item) {
                                        if (item.id == $scope.link_PerformanceGroupSkill.performanceGroupId) {
                                            _.each(item.link_PerformanceGroupSkills, function (skillItem) {
                                                if (skillItem.id == $scope.link_PerformanceGroupSkill.id) {
                                                    skillItem.skill = {
                                                        name: $scope.link_PerformanceGroupSkill.name,
                                                        description: $scope.link_PerformanceGroupSkill.description,
                                                    }
                                                    skillItem.name = $scope.link_PerformanceGroupSkill.name;
                                                    skillItem.description = $scope.link_PerformanceGroupSkill.description;
                                                    skillItem.benchmark = $scope.link_PerformanceGroupSkill.benchmark;
                                                    skillItem.weight = $scope.link_PerformanceGroupSkill.weight;
                                                    skillItem.csf = $scope.link_PerformanceGroupSkill.csf;
                                                    skillItem.action = $scope.link_PerformanceGroupSkill.action;
                                                    return (false);
                                                }
                                            })
                                        }
                                    });
                                    dialogService.showNotification($translate.instant('MYPROJECTS_PROJECTPROFILES_SKILL_UPDATED_SUCCESSFULLY'), 'info')
                                }, function (error) {
                                    dialogService.showNotification(error, 'warning');
                                })

                                //$state.go('^');
                            }
                            else {
                                dialogService.showNotification($translate.instant('MYPROJECTS_PROJECTPROFILES_SAVE_FAILED'), 'warning');
                            }
                        }, function (error) {
                            dialogService.showNotification(error, "warning");
                        })
                    }
                    else {
                        _.each($scope.profile.performanceGroups, function (item) {
                            if (item.id == $scope.link_PerformanceGroupSkill.performanceGroupId) {
                                _.each(item.link_PerformanceGroupSkills, function (skillItem) {
                                    if (skillItem.id == $scope.link_PerformanceGroupSkill.id) {
                                        skillItem.skill = {
                                            name: $scope.link_PerformanceGroupSkill.name,
                                            description: $scope.link_PerformanceGroupSkill.description,
                                        }
                                        skillItem.name = $scope.link_PerformanceGroupSkill.name;
                                        skillItem.description = $scope.link_PerformanceGroupSkill.description;
                                        skillItem.benchmark = $scope.link_PerformanceGroupSkill.benchmark;
                                        skillItem.weight = $scope.link_PerformanceGroupSkill.weight;
                                        skillItem.csf = $scope.link_PerformanceGroupSkill.csf;
                                        skillItem.action = $scope.link_PerformanceGroupSkill.action;
                                        return (false);
                                    }
                                })
                            }
                        });
                    }

                }
            }
            $scope.openSkillTraningMaterialsModal = function (performanceGroupId, skillId) {
                $scope.trainingMaterials = [];
                _.each($scope.profile.performanceGroups, function (item) {
                    if (item.id == performanceGroupId) {
                        _.each(item.link_PerformanceGroupSkills, function (skillItem) {
                            if (skillItem.id == skillId) {
                                _.each(skillItem.trainings, function (trainingItem) {
                                    _.each(trainingItem.trainingMaterials, function (trainingMaterialItem) {
                                        $scope.trainingMaterials.push(trainingMaterialItem);
                                    });
                                })

                                return (false);
                            }
                        })
                    }
                });
                $("#viewTrainingTemplateTrainingMaterials").modal("show");
                if ($("#training-material").hasClass("cbp-caption-active")) {
                    $("#training-material").cubeportfolio('destroy');
                }
                setTimeout(function () {
                    $("#training-material").cubeportfolio({
                        filters: "#training-material-filters",
                        layoutMode: "grid",
                        defaultFilter: "*",
                        animationType: "quicksand",
                        gapHorizontal: 35,
                        gapVertical: 30,
                        gridAdjustment: "responsive",
                        mediaQueries: [{
                            width: 1500,
                            cols: 5
                        }, {
                            width: 1100,
                            cols: 4
                        }, {
                            width: 800,
                            cols: 3
                        }, {
                            width: 480,
                            cols: 2
                        }, {
                            width: 320,
                            cols: 1
                        }],
                        caption: "overlayBottomReveal",
                        displayType: "sequentially",
                        displayTypeSpeed: 80,
                        lightboxDelegate: ".cbp-lightbox",
                        lightboxGallery: !0,
                        lightboxTitleSrc: "data-title",
                        lightboxCounter: '<div class="cbp-popup-lightbox-counter">{{current}} of {{total}}</div>',
                        singlePageDelegate: ".cbp-singlePage",
                        singlePageDeeplinking: !0,
                        singlePageStickyNavigation: !0,
                        singlePageCounter: '<div class="cbp-popup-singlePage-counter">{{current}} of {{total}}</div>',
                        singlePageCallback: function (i, t) {
                            var l = this;
                            if ($(t).data("link")) {
                                i = $(t).data("link");
                            }
                            i = decodeURIComponent(i);
                            if (i.indexOf("youtube") > -1) {
                                var v = getParameterByName(i, 'v');
                                i = "https://www.youtube.com/embed/" + v;
                            }

                            var IsInsecureLink = false;
                            if (i.indexOf("https") == -1) {
                                IsInsecureLink = true;
                            }

                            $scope.materialInfo = _.find($scope.trainingMaterials, function (info) {
                                return t.id == info.id;
                            });
                            //var training = null;

                            if ($scope.materialInfo) {
                                $scope.materialInfo["skill"] = "";
                                $scope.materialInfo["skillDescription"] = "";
                                $scope.materialInfo.link = i;

                                $scope.materialInfo.IsInsecureLink = IsInsecureLink;
                                if ($scope.newTraining.skillId) {
                                    var skill = _.find($scope.pgSkills, function (item) {
                                        return item.skillId == $scope.newTraining.skillId;
                                    })
                                    if (skill) {
                                        $scope.materialInfo["skill"] = skill.name;
                                        $scope.materialInfo["skillDescription"] = skill.description;
                                    }
                                }

                                var compiledeHTML = $compile("<training-template-material-popup material-info='materialInfo'></training-template-material-popup>")($scope);
                                l.updateSinglePage(compiledeHTML);
                            }
                            else {
                                l.updateSinglePage("<div>There is something wrong!!</div>");
                            }
                        }
                    });
                }, 500);
            }
            $scope.isSkillModalDisabled = function () {
                return $scope.isSkillModalDisabled;
            }
            $scope.skillChanged = function () {
                if ($scope.newTraining.skillId > 0) {
                    profileTrainingManager.getTrainingTemplatesBySkill($scope.newTraining.skillId).then(function (data) {
                        $scope.trainingTemplates = data;
                        var trainingTemplate = _.max($scope.trainingTemplates, function (o) { return o.id; });
                        if (trainingTemplate) {
                            var newTraining = {
                                id: 0,
                                name: $scope.newTraining.name,
                                typeId: trainingTemplate.typeId,
                                levelId: trainingTemplate.levelId,
                                why: trainingTemplate.why,
                                what: trainingTemplate.what,
                                how: trainingTemplate.how,
                                additionalInfo: trainingTemplate.additionalInfo,
                                startDate: $scope.newTraining.startDate,
                                endDate: $scope.newTraining.endDate,
                                duration: trainingTemplate.duration ? trainingTemplate.duration : 30,
                                durationMetricId: trainingTemplate.durationMetricId ? trainingTemplate.durationMetricId : ($scope.defaultDurationMetric ? $scope.defaultDurationMetric.id : null),
                                frequency: "FREQ=WEEKLY;BYDAY=WE",
                                howMany: trainingTemplate.howMany ? trainingTemplate.howMany : 1,
                                exerciseMetricId: trainingTemplate.exerciseMetricId,
                                howManySets: trainingTemplate.howManySets ? trainingTemplate.howManySets : 1,
                                howManyActions: trainingTemplate.howManyActions ? trainingTemplate.howManyActions : 1,
                                isActive: true,
                                organizationId: $scope.currentUser.organizationId,
                                trainingMaterial: { id: 0, name: "", description: "", title: "", materialType: "", resourceType: "" },
                                trainingMaterials: new kendo.data.ObservableArray([]),
                                userId: $scope.currentUser.userId,
                                skillId: $scope.newTraining.skillId,
                                notificationTemplateId: trainingTemplate.notificationTemplateId,
                                isNotificationByEmail: true,
                                emailNotificationIntervalId: trainingTemplate.emailNotificationIntervalId,
                                emailBefore: null,
                                isNotificationBySMS: false,
                                smsNotificationIntervalId: null,
                                performanceGroupId: $scope.newTraining.performanceGroupId,
                            }
                            _.each(trainingTemplate.trainingMaterials, function (item, index) {
                                item.id = (index + 1) * -1
                                newTraining.trainingMaterials.push(item);
                            });
                            $scope.newTraining = newTraining;
                        }
                    });
                }
            }
            $scope.searchTrainigTemplate = function () {
                $scope.trainingTemplates = [];
                profileTrainingManager.getTrainingTemplatesBySkill($scope.newTraining.skillId).then(function (data) {
                    $scope.trainingTemplates = data;
                    $("#presetTrainingTemplateModal").modal("show");
                });

            }

            $scope.viewTrainingTemplate = function (trainingId) {
                var trainingTemplate = _.find($scope.trainingTemplates, function (trainingTemplateItem) {
                    return trainingTemplateItem.id == trainingId;
                });
                if (trainingTemplate) {
                    var newTraining = {
                        id: trainingTemplate.id,
                        name: trainingTemplate.name,
                        typeId: trainingTemplate.typeId,
                        levelId: trainingTemplate.levelId,
                        why: trainingTemplate.why,
                        what: trainingTemplate.what,
                        how: trainingTemplate.how,
                        additionalInfo: trainingTemplate.additionalInfo,
                        duration: trainingTemplate.duration,
                        durationMetricId: trainingTemplate.durationMetricId,
                        frequency: trainingTemplate.frequency,
                        howMany: trainingTemplate.howMany,
                        exerciseMetricId: trainingTemplate.exerciseMetricId,
                        howManySets: trainingTemplate.howManySets,
                        howManyActions: trainingTemplate.howManyActions,
                        organizationId: $scope.currentUser.organizationId,
                        trainingMaterial: { id: 0, name: "", description: "", title: "", materialType: "", resourceType: "" },
                        trainingMaterials: new kendo.data.ObservableArray([]),
                        userId: $scope.currentUser.userId,
                        skillId: $scope.newTraining.skillId,
                        notificationTemplateId: trainingTemplate.notificationTemplateId,
                        isNotificationByEmail: trainingTemplate.isNotificationByEmail,
                        emailNotificationIntervalId: trainingTemplate.emailNotificationIntervalId,
                        emailBefore: trainingTemplate.emailBefore,
                        isNotificationBySMS: trainingTemplate.isNotificationBySMS,
                        smsNotificationIntervalId: trainingTemplate.smsNotificationIntervalId,
                    }
                    _.each(trainingTemplate.trainingMaterials, function (item, index) {
                        newTraining.trainingMaterials.push(item);
                    });
                    $scope.viewTraining = newTraining;
                    $("#viewpresetTrainingTemplateModal").modal("show");
                }
            }
            $scope.viewTrainingTemplateTrainingMaterials = function (trainingId) {
                var trainingTemplate = _.find($scope.trainingTemplates, function (trainingTemplateItem) {
                    return trainingTemplateItem.id == trainingId;
                });
                if (trainingTemplate) {
                    $scope.trainingMaterials = [];
                    _.each(trainingTemplate.trainingMaterials, function (item, index) {
                        $scope.trainingMaterials.push(item);
                    });
                    $("#viewTrainingTemplateTrainingMaterials").modal("show");
                    if ($("#training-material").hasClass("cbp-caption-active")) {
                        $("#training-material").cubeportfolio('destroy');
                    }
                    setTimeout(function () {
                        $("#training-material").cubeportfolio({
                            filters: "#training-material-filters",
                            layoutMode: "grid",
                            defaultFilter: "*",
                            animationType: "quicksand",
                            gapHorizontal: 35,
                            gapVertical: 30,
                            gridAdjustment: "responsive",
                            mediaQueries: [{
                                width: 1500,
                                cols: 5
                            }, {
                                width: 1100,
                                cols: 4
                            }, {
                                width: 800,
                                cols: 3
                            }, {
                                width: 480,
                                cols: 2
                            }, {
                                width: 320,
                                cols: 1
                            }],
                            caption: "overlayBottomReveal",
                            displayType: "sequentially",
                            displayTypeSpeed: 80,
                            lightboxDelegate: ".cbp-lightbox",
                            lightboxGallery: !0,
                            lightboxTitleSrc: "data-title",
                            lightboxCounter: '<div class="cbp-popup-lightbox-counter">{{current}} of {{total}}</div>',
                            singlePageDelegate: ".cbp-singlePage",
                            singlePageDeeplinking: !0,
                            singlePageStickyNavigation: !0,
                            singlePageCounter: '<div class="cbp-popup-singlePage-counter">{{current}} of {{total}}</div>',
                            singlePageCallback: function (i, t) {
                                var l = this;
                                if ($(t).data("link")) {
                                    i = $(t).data("link");
                                }
                                i = decodeURIComponent(i);
                                if (i.indexOf("youtube") > -1) {
                                    var v = getParameterByName(i, 'v');
                                    i = "https://www.youtube.com/embed/" + v;
                                }

                                var IsInsecureLink = false;
                                if (i.indexOf("https") == -1) {
                                    IsInsecureLink = true;
                                }

                                $scope.materialInfo = _.find($scope.trainingMaterials, function (info) {
                                    return t.id == info.id;
                                });
                                //var training = null;

                                if ($scope.materialInfo) {
                                    $scope.materialInfo["skill"] = "";
                                    $scope.materialInfo["skillDescription"] = "";
                                    $scope.materialInfo.link = i;

                                    $scope.materialInfo.IsInsecureLink = IsInsecureLink;
                                    if ($scope.newTraining.skillId) {
                                        var skill = _.find($scope.pgSkills, function (item) {
                                            return item.skillId == $scope.newTraining.skillId;
                                        })
                                        if (skill) {
                                            $scope.materialInfo["skill"] = skill.name;
                                            $scope.materialInfo["skillDescription"] = skill.description;
                                        }
                                    }

                                    var compiledeHTML = $compile("<training-template-material-popup material-info='materialInfo'></training-template-material-popup>")($scope);
                                    l.updateSinglePage(compiledeHTML);
                                }
                                else {
                                    l.updateSinglePage("<div>There is something wrong!!</div>");
                                }
                            }
                        });
                    }, 500);
                }
            }
            function getParameterByName(url, name) {
                var match = RegExp('[?&]' + name + '=([^&]*)').exec(url);
                return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
            }
            $scope.trainingMaterialClass = function (type) {
                //{ { :  : material.materialType == 'Image' ? (material.name.length > 0 ? getLink(material.name) : material.link) : 'images/url.png' } }
                if (type == "Video") {
                    return "tm-video";
                }
                else if (type == "Document") {
                    return "tm-document";
                }
                else if (type == "Audio") {
                    return "tm-audio";
                }
                else if (type == "Image") {
                    return "tm-image";
                }
                else {
                    return "tm-link";
                }
            }
            $scope.viewPresetTrainnigMaterialModal = function (trainnigMaterialId) {
                var trainingMaterial = _.find($scope.viewTraining.trainingMaterials, function (trainingMaterialItem) {
                    return trainingMaterialItem.id == trainnigMaterialId;
                });
                if (trainingMaterial) {
                    $scope.viewTrainingMaterial = {
                        id: trainingMaterial.id,
                        description: trainingMaterial.description,
                        title: trainingMaterial.title,
                        materialType: trainingMaterial.materialType,
                        resourceType: trainingMaterial.resourceType,
                        link: trainingMaterial.link,
                        name: trainingMaterial.name,
                    },
                        $("#viewPresetTrainingMaterialModal").modal("show");
                }
            }
            $scope.selectTrainingTemplate = function (trainingId) {
                var trainingTemplate = _.find($scope.trainingTemplates, function (trainingTemplateItem) {
                    return trainingTemplateItem.id == trainingId;
                })
                if (trainingTemplate) {
                    var newTraining = {
                        id: 0,
                        name: $scope.newTraining.name,
                        typeId: trainingTemplate.typeId,
                        levelId: trainingTemplate.levelId,
                        why: trainingTemplate.why,
                        what: trainingTemplate.what,
                        how: trainingTemplate.how,
                        additionalInfo: trainingTemplate.additionalInfo,
                        startDate: $scope.newTraining.startDate,
                        endDate: $scope.newTraining.endDate,
                        duration: trainingTemplate.duration ? trainingTemplate.duration : 30,
                        durationMetricId: trainingTemplate.durationMetricId ? trainingTemplate.durationMetricId : ($scope.defaultDurationMetric ? $scope.defaultDurationMetric.id : null),
                        frequency: "FREQ=WEEKLY;BYDAY=WE",
                        howMany: trainingTemplate.howMany ? trainingTemplate.howMany : 1,
                        exerciseMetricId: trainingTemplate.exerciseMetricId,
                        howManySets: trainingTemplate.howManySets ? trainingTemplate.howManySets : 1,
                        howManyActions: trainingTemplate.howManyActions ? trainingTemplate.howManyActions : 1,
                        isActive: true,
                        organizationId: $scope.currentUser.organizationId,
                        trainingMaterial: { id: 0, name: "", description: "", title: "", materialType: "", resourceType: "" },
                        trainingMaterials: new kendo.data.ObservableArray([]),
                        userId: $scope.currentUser.userId,
                        skillId: $scope.newTraining.skillId,
                        notificationTemplateId: trainingTemplate.notificationTemplateId,
                        isNotificationByEmail: true,
                        emailNotificationIntervalId: trainingTemplate.emailNotificationIntervalId,
                        emailBefore: null,
                        isNotificationBySMS: false,
                        smsNotificationIntervalId: null,
                        performanceGroupId: $scope.newTraining.performanceGroupId,
                    }
                    _.each(trainingTemplate.trainingMaterials, function (item, index) {
                        item.id = (index + 1) * -1
                        newTraining.trainingMaterials.push(item);
                    });
                    $scope.newTraining = newTraining;
                    $("#viewpresetTrainingTemplateModal").modal("hide");
                    $("#presetTrainingTemplateModal").modal("hide");
                }
            }
            $scope.addNewTraining = function () {
                var item = angular.copy($scope.newTraining);
                var sd = kendo.parseDate(item.startDate);
                var ed = kendo.parseDate(item.endDate);
                item.startDate = sd;
                item.endDate = ed;
                if (item.id > 0) {
                    profileTrainingManager.updateTraining(item).then(function (data) {
                        if (data) {
                            _.each($scope.profile.performanceGroups, function (item) {
                                if (item.id == $scope.newTraining.performanceGroupId) {
                                    _.each(item.link_PerformanceGroupSkills, function (pgSkillItem) {
                                        if (pgSkillItem.skillId == $scope.newTraining.skillId) {
                                            _.each(pgSkillItem.trainings, function (trainingItem) {
                                                trainingItem = $scope.newTraining;
                                            });
                                        }
                                    });
                                }
                            });
                            dialogService.showNotification($translate.instant('MYPROJECTS_PROJECTPROFILES_TRAINING_SAVED_SUCCESSFULLY'), 'info')
                        }
                        else {
                            dialogService.showNotification($translate.instant('MYPROJECTS_PROJECTPROFILES_SAVE_FAILED'), 'warning');
                        }

                    }, function (error) {
                        dialogService.showNotification(error, "warning");
                    });
                }
                else {
                    var skill = null;
                    var skill = _.find($scope.pgSkills, function (skillItem) {
                        return skillItem.skillId == $scope.newTraining.skillId;
                    });
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
                        item.skills = [skill.skill];
                        item.skill = skill.skill;
                        item.skillId = skill.skill.id;
                        item.skillName = skill.skill.name;
                    }

                    profileTrainingManager.addNewTraining(item).then(function (data) {
                        item.id = data.id;
                        $scope.newTraining.id = item.id;

                        if (item.id > 0) {

                            var trainingIds = [];
                            trainingIds.push({ trainingId: item.id, skillId: $scope.newTraining.skillId });

                            profileTrainingManager.SetPerformanceGroupTraining($scope.newTraining.performanceGroupId, trainingIds).then(function (data) {
                                if (data) {
                                    _.each($scope.profile.performanceGroups, function (item) {
                                        if (item.id == $scope.newTraining.performanceGroupId) {
                                            _.each(item.link_PerformanceGroupSkills, function (pgSkillItem) {
                                                if (pgSkillItem.skillId == $scope.newTraining.skillId) {
                                                    pgSkillItem.trainings.push($scope.newTraining);
                                                }
                                            });
                                        }
                                    });

                                    dialogService.showNotification($translate.instant('MYPROJECTS_PROJECTPROFILES_TRAINING_SAVED_SUCCESSFULLY'), 'info');
                                }
                            });



                            //$state.go('^');
                        } else {
                            dialogService.showNotification($translate.instant('MYPROJECTS_PROJECTPROFILES_SAVE_FAILED'), 'warning');
                        }
                    }, function (error) {
                        dialogService.showNotification(error, "warning");
                    });
                }
            }

            $scope.StartDateOpen = function (event) {
                var datepicker = $(event.sender.element).data("kendoDateTimePicker");
                datepicker.setOptions({
                    min: new Date(moment({ hour: 0, minute: -1, seconds: 0, milliseconds: 0 })._d)
                });
            }
            $scope.StartDateChange = function () {
                if (!(new Date($scope.newTraining.startDate) > new Date($scope.newTraining.endDate))) {
                    $scope.newTraining.endDate = "";
                }
            };
            $scope.EndDateOpen = function (event) {
                var datepicker = $(event.sender.element).data("kendoDateTimePicker")
                datepicker.setOptions({
                    min: new Date(moment({ hour: 0, minute: 0, seconds: 0, milliseconds: 0 })._d)
                });

            };


            $scope.showError = function () {
                dialogService.showNotification($translate.instant('MYPROJECTS_PROJECTPROFILES_SOMETHING_WENT_WRONG'), "error");
            }
            $scope.openLink = function (link) {
                var win = window.open(link);
                win.focus();
            };
            $scope.removeTraining = function (performanceGroupId, trainingId) {
                profileTrainingManager.checkTrainingInUse(trainingId).then(function (data) {
                    if (data) {
                        dialogService.showYesNoDialog($translate.instant('COMMON_CONFIRM'), $translate.instant('COMMON_ARE_YOU_SURE_YOU_WANT_TO_DELETE')).then(
                            function () {

                                profileTrainingManager.removeTraining(trainingId).then(function (data) {
                                    if (data) {
                                        _.each($scope.profile.performanceGroups, function (item) {
                                            if (item.id == performanceGroupId) {
                                                _.each(item.link_PerformanceGroupSkills, function (skillItem) {

                                                    var index = _.findIndex(skillItem.trainings, function (trainingItem) {
                                                        return trainingItem.id == trainingId;
                                                    })
                                                    if (index > -1) {
                                                        skillItem.trainings.splice(index, 1);
                                                        dialogService.showNotification($translate.instant('MYPROJECTS_PROJECTPROFILES_TRAINING_REMOVED_SUCESSFULLY'), 'success');
                                                    }

                                                })
                                            }
                                        });
                                    }
                                }, function (message) {
                                    dialogService.showNotification($translate.instant('MYPROJECTS_PROJECTPROFILES_TRAINING_CANNOT_BE_REMOVED') + message, 'error');
                                });
                            },
                            function () {
                                //alert('No clicked');
                            });
                    }
                }, function (message) {
                    dialogService.showNotification($translate.instant('MYPROJECTS_PROJECTPROFILES_TRAINING_CANNOT_BE_REMOVED') + message, 'error');
                });

            };


            $scope.openAddReason = function () {
                $("#AddReasonModal").modal('show');
            }
            $scope.checkAll = false;
            $scope.selectAllDescription = function () {
                $scope.checkAll = !$scope.checkAll;
                if ($scope.checkAll) {
                    _.each($scope.reasonDescriptions, function (item) {
                        item.isChecked = true;
                    });
                }
                else {
                    _.each($scope.reasonDescriptions, function (item) {
                        item.isChecked = false;
                    });
                }

            }
            $scope.addWhyReasons = function () {
                $scope.checkAll = false;
                $scope.selectedReasons = [];
                $scope.reasonDescriptions = [];
                var skillId = $scope.newTraining.skillId;
                if (skillId) {
                    profileTrainingManager.getReasonDescriptions(skillId).then(function (data) {
                        $scope.reasonDescriptions = _.filter(data, function (item) {
                            item["isChecked"] = false;
                            return item.descriptionType == 0;
                        });

                    });
                    $scope.trainingDescription = {
                        id: 0,
                        descriptionType: 0,
                        description: "",
                        skillId: skillId
                    }
                    $("#DescriptionReasonModal").modal('show');
                } else {
                    dialogService.showNotification($translate.instant('MYPROJECTS_PROJECTPROFILES_PLEASE_SELECT_THE_SKILL'), "warning");
                }
            }

            $scope.addWhatReasons = function () {
                $scope.checkAll = false;
                $scope.selectedReasons = [];
                $scope.reasonDescriptions = [];
                var skillId = $scope.newTraining.skillId;
                if (skillId) {
                    profileTrainingManager.getReasonDescriptions(skillId).then(function (data) {
                        $scope.reasonDescriptions = _.filter(data, function (item) {
                            item["isChecked"] = false;
                            return item.descriptionType == 1;
                        });

                    });
                    $scope.trainingDescription = {
                        id: 0,
                        descriptionType: 1,
                        description: "",
                        skillId: skillId
                    }
                    $("#DescriptionReasonModal").modal('show');




                } else {
                    dialogService.showNotification($translate.instant('MYPROJECTS_PROJECTPROFILES_PLEASE_SELECT_THE_SKILL'), "warning");
                }
            }

            $scope.addHowReasons = function () {
                $scope.checkAll = false;
                $scope.selectedReasons = [];
                $scope.reasonDescriptions = [];
                var skillId = $scope.newTraining.skillId;
                if (skillId) {
                    profileTrainingManager.getReasonDescriptions(skillId).then(function (data) {
                        $scope.reasonDescriptions = _.filter(data, function (item) {
                            item["isChecked"] = false;
                            return item.descriptionType == 2;
                        });
                    });
                    $scope.trainingDescription = {
                        id: 0,
                        descriptionType: 2,
                        description: "",
                        skillId: skillId
                    }

                    $("#DescriptionReasonModal").modal('show');


                } else {
                    dialogService.showNotification($translate.instant('MYPROJECTS_PROJECTPROFILES_PLEASE_SELECT_THE_SKILL'), "warning");
                }
            }

            $scope.addSelectedDescriptions = function () {

                $scope.selectedReasons = _.filter($scope.reasonDescriptions, function (dataItem) {
                    return dataItem.isChecked == true;
                })
                if ($scope.trainingDescription.descriptionType == 0) {
                    var why = [$scope.newTraining.why]
                    _.each($scope.selectedReasons, function (item) {
                        why.push(item.description);
                    })
                    $scope.newTraining.why = why.join(',')
                }
                if ($scope.trainingDescription.descriptionType == 1) {
                    var what = [$scope.newTraining.what]
                    _.each($scope.selectedReasons, function (item) {
                        what.push(item.description);
                    })
                    $scope.newTraining.what = what.join(',');

                }
                if ($scope.trainingDescription.descriptionType == 2) {
                    var how = [$scope.newTraining.how]
                    _.each($scope.selectedReasons, function (item) {
                        how.push(item.description);
                    })
                    $scope.newTraining.how = how.join(',');
                }
                $("#DescriptionReasonModal").modal('hide');
            }

            $scope.addNewReason = function () {
                profileTrainingManager.addNewReason($scope.trainingDescription).then(function (data) {
                    if (data) {
                        $scope.trainingDescription.id = data;
                        $scope.reasonDescriptions.push($scope.trainingDescription);
                        $("#AddReasonModal").modal('hide');
                    }
                })
            }
        }]);
