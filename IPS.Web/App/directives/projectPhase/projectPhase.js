
(function () {
    'use strict';

    angular
        .module('ips')
        .directive('projectPhases', projectPhases);

    projectPhases.$inject = ['projectPhaseService', '$location', 'authService', 'dialogService', 'projectPhasesEnum', 'phasesLevelEnum', '$translate'];

    function projectPhases(projectPhaseService, $location) {
        var directive = {
            restrict: 'E',
            scope: {
                projectId: '=projectId',
                currentPhaseLevel: '=currentPhaseLevel',
                currentPhase: '=currentPhase',
                profileId: '=?profileId',
            },
            templateUrl: 'directives/projectPhase/views/projectPhase.html',
            controller: projectphaseController,
            controllerAs: 'projectphase',
        };

        return directive;

        function projectphaseController($scope, projectPhaseService, $location, authService, dialogService, projectPhasesEnum, phasesLevelEnum, $translate) {
            $scope.projectId;
            $scope.profileId;
            $scope.currentPhaseLevel;
            $scope.currentPhase;
            $scope.projectPhasesEnum = projectPhasesEnum;
            $scope.phasesLevelEnum = phasesLevelEnum;

            $scope.levels = {
                planning: {
                    name: $translate.instant('MYPROJECTS_PLANNING'),
                    childLevels: [
                    {
                        id: 1,
                            name: $translate.instant('MYPROJECTS_PROJECT_SETUP'),
                        //childLevels: ["Project Details", "Mission - Vision - Goals-Strategy Setup", "Steering Group", "Confirm"]
                    },
                    {
                        id: 2,
                        name: $translate.instant('MYPROJECTS_PROFILE_AND_TRAINING_SETUP'),
                        //childLevels: ["Profile Details", "Performance Group - Skills – Questions – Trainings", "Final Profile"]
                    },
                    {
                        id: 3,
                        name: $translate.instant('MYPROJECTS_SEND_OUTS'),
                        //childLevels: ["Participants", "Milestones ", "Recurrent Training"]
                    }]
                },
                execution: {
                    name: $translate.instant('COMMON_ACTION'),
                    childLevels: [
                    {
                            Name: $translate.instant('MYPROJECTS_START_A_PROJECT'),
                        ChildLevel: ["Project Details", "Mission - Vision - Goals-Strategy Setup", "Steering Group", "Confirm"]
                    },
                    {
                        Name: $translate.instant('MYPROJECTS_TRAINING_PLAN'),
                        ChildLevel: ["Profile Details", "Performance Group - Skills – Questions – Trainings", "Final Profile"]
                    },
                    {
                        Name: $translate.instant('MYPROJECTS_RUN_TRAINING'),
                        ChildLevel: ["Participants", "Milestones ", "Recurrent Training"]
                    },
                    {
                        Name: $translate.instant('MYPROJECTS_TRACK_TRAINING'),
                        ChildLevel: ["Participants", "Milestones ", "Recurrent Training"]
                    },
                    {
                        Name: $translate.instant('COMMON_EVALUATE_TRAINING'),
                        ChildLevel: ["Participants", "Milestones ", "Recurrent Training"]
                    }
                    ]
                },
                measure: {
                    name: $translate.instant('MYPROJECTS_EVALUATION'),
                    childLevels: ["Project Setup", "Profile and Training Setup", "Send outs"]
                },
            };


            $scope.isActive = function (phaseValue) {
                if (phaseValue == $scope.currentPhase) {
                    return 'active';
                }
            }
            $scope.isActivePhaseLevelClass = function (phaseValue) {
                if (phaseValue == $scope.currentPhaseLevel) {
                    return 'done';
                }
            }
            $scope.isActivePhaseLevel = function (phaseValue) {
                if (phaseValue == $scope.currentPhaseLevel) {
                    return true;
                }
            }
            $scope.gotoPhase = function (phase) {
                if (phase != $scope.currentPhase) {
                    if (projectPhasesEnum.project == phase) {
                        if ($scope.projectId > 0) {
                            $location.path("/editproject/" + $scope.projectId);
                        }
                        else {
                            $location.path("/home/myProjects");
                        }
                    }
                    else if (projectPhasesEnum.profile == phase) {
                        if ($scope.profileId) {
                            $location.path("/profile/" + $scope.profileId);
                        }
                        else if ($scope.projectId) {
                            $location.path("/projectprofiles/" + $scope.projectId);
                        }
                        else {
                            dialogService.showNotification($translate.instant('MYPROJECTS_PLEASE_COMPLETE_PROJECT_SETUP'), "info")
                        }
                    }
                    else if (projectPhasesEnum.training == phase) {
                        if ($scope.profileId) {
                            $location.path("/profiletrainings/" + $scope.profileId);
                            ////$location.path("/projectTrainings/" + $scope.projectId);
                        }
                    }
                    else if (projectPhasesEnum.measure == phase) {
                        dialogService.showNotification($translate.instant('MYPROJECTS_UNDER_CONSTRUCTION'), "info")
                    }
                }

            }
            $scope.gotoPlanningPhase = function (phase) {
                if (phase != $scope.currentPhase) {
                    if (phase == 1) {
                        if ($scope.projectId > 0) {
                            $location.path("/editproject/" + $scope.projectId);
                        }
                        else {
                            $location.path("/home/myProjects");
                        }
                    }
                    else if (phase == 2) {
                        if ($scope.profileId) {
                            $location.path("/profile/" + $scope.profileId);
                        }
                        else if ($scope.projectId) {
                            $location.path("/projectprofiles/" + $scope.projectId);
                        }
                        else {
                            dialogService.showNotification($translate.instant('MYPROJECTS_PLEASE_COMPLETE_PROJECT_SETUP'), "info")
                        }
                    }
                    else if (phase == 3) {
                        if ($scope.profileId) {
                            $location.path("/profileSendOut/" + $scope.profileId);
                        }
                        else
                        {
                            dialogService.showNotification($translate.instant('MYPROJECTS_PLEASE_SELECT_ANY_PROFILE_OR_COMPLETE_PROFILE_SETUP'), "info")
                        }

                    }
                }

            }
        }
    }
})();