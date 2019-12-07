angular.module('ips.projects')
app.filter('unique', function () {
    return function (arr, field) {
        return _.uniq(arr, function (a) { return a[field]; });
    };
})
    .constant('softProfileTypesEnum', {
        startProfile: { id: 1, label: "Start Profile" },
        finalProfile: { id: 2, label: "Agreed Final Profile" },
        initialKPI: { id: 3, label: "Initial KPI" },
        finalKpi: { id: 4, label: "Agreed Final KPI" },
        initialKPIScores: { id: 3, label: "Initial KPI Scores" },
        finalKPIResults: { id: 4, label: "Agreed Final KPI Results" }
    })
    .config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
        var baseProjectNewResolve = {
            organizations: function (projectsManager) {
                return projectsManager.getOrganizations().then(function (data) {
                    return data;
                });
            },
            projectRoles: function (projectsManager) {
                return projectsManager.getProjectRoles().then(function (data) {
                    return data;
                });
            },
            project: function ($stateParams, projectsManager) {
                var today = kendo.parseDate(moment({ hour: 0, minute: 0, seconds: 0, milliseconds: 0 })._d)
                return {
                    name: "",
                    summary: "",
                    expectedEndDate: moment(today).add("months", 3).format('L LT'),
                    expectedStartDate: moment(today).format('L LT'),
                    missionStatement: "",
                    visionStatement: "",
                    projectSteeringGroups: [],
                    goalStrategies: [],
                    projectGoals: [],
                    projectUsers: [],
                    isActive: false,
                }
            },
            pageName: function ($translate) {
                return $translate.instant('MYPROJECTS_PROJECT_SETUP');//'Project Setup';
            },
            notificationTemplates: function (projectsManager, $translate) {
                return projectsManager.getNotificationTemplates().then(function (data) {
                    data.unshift({ id: null, name: $translate.instant('MYPROJECTS_SELECT_TEMPLATE') });
                    return data;
                });
            },
            durationMetrics: function (projectsManager) {
                return projectsManager.getDurationMetrics();
            }
        };
        var baseProjectsEditResolve = {
            organizations: function (projectsManager) {
                return projectsManager.getOrganizations().then(function (data) {
                    return data;
                });
            },
            projectRoles: function (projectsManager) {
                return projectsManager.getProjectRoles().then(function (data) {
                    return data;
                });
            },
            project: function ($stateParams, projectsManager) {
                if ($stateParams.id > 0) {
                    return projectsManager.getProjectById($stateParams.id).then(function (data) {
                        if (data != null) {
                            data.expectedEndDate = moment(kendo.parseDate(data.expectedEndDate)).format('L LT')
                            data.expectedStartDate = moment(kendo.parseDate(data.expectedStartDate)).format('L LT')
                        }
                        return data;
                    });
                }
                else {
                    var today = kendo.parseDate(moment({ hour: 0, minute: 0, seconds: 0, milliseconds: 0 })._d)
                    return {
                        name: "",
                        summary: "",
                        expectedEndDate: moment(today).add("months", 3).format('L LT'),
                        expectedStartDate: moment(today).format('L LT'),
                        missionStatement: "",
                        visionStatement: "",
                        projectSteeringGroups: [],
                        goalStrategies: [],
                        projectGoals: [],
                        projectUsers: [],
                        isActive: false,
                    }
                }
            },
            pageName: function (project, $translate) {
                return project.name + ': ' + $translate.instant('MYPROJECTS_EDIT_PROJECT');//Edit Project';
            },
            notificationTemplates: function (projectsManager, $translate) {
                return projectsManager.getNotificationTemplates().then(function (data) {
                    data.unshift({ id: null, name: $translate.instant('MYPROJECTS_SELECT_TEMPLATE') });
                    return data;
                });
            },
            durationMetrics: function (projectsManager) {
                return projectsManager.getDurationMetrics();
            }
        };
        var baseProjectsViewResolve = {
            organizations: function (projectsManager) {
                return projectsManager.getOrganizations().then(function (data) {
                    return data;
                });
            },
            projectRoles: function (projectsManager) {
                return projectsManager.getProjectRoles().then(function (data) {
                    return data;
                });
            },
            project: function ($stateParams, projectsManager) {
                if ($stateParams.id > 0) {
                    return projectsManager.getProjectById($stateParams.id).then(function (data) {
                        if (data != null) {
                            data.expectedEndDate = moment(kendo.parseDate(data.expectedEndDate)).format('L LT')
                            data.expectedStartDate = moment(kendo.parseDate(data.expectedStartDate)).format('L LT')
                        }
                        return data;
                    });
                }
                else {
                    var today = kendo.parseDate(moment({ hour: 0, minute: 0, seconds: 0, milliseconds: 0 })._d)
                    return {
                        name: "",
                        summary: "",
                        expectedEndDate: moment(today).add("months", 3).format('L LT'),
                        expectedStartDate: moment(today).format('L LT'),
                        missionStatement: "",
                        visionStatement: "",
                        projectSteeringGroups: [],
                        goalStrategies: [],
                        projectGoals: [],
                        projectUsers: [],
                        isActive: false,
                    }
                }
            },
            pageName: function (project, $translate) {
                return project.name + ': ' + $translate.instant('MYPROJECTS_VIEW_PROJECT');//View Project';
            },
            notificationTemplates: function (projectsManager, $translate) {
                return projectsManager.getNotificationTemplates().then(function (data) {
                    data.unshift({ id: null, name: $translate.instant('MYPROJECTS_SELECT_TEMPLATE') });
                    return data;
                });
            },
            durationMetrics: function (projectsManager) {
                return projectsManager.getDurationMetrics();
            }
        };
        var baseProjectsResolve = {
            projects: function (projectsManager) {
                return projectsManager.getAllProject().then(function (data) {
                    return data;
                });
            },
            pageName: function ($translate) {
                return $translate.instant('MYPROJECTS_ALL_PROJECTS');//'All Projects';
            },
        };
        var baseProjectStatusResolve = {
            project: function (projectsManager, $stateParams) {
                return null;
                //return projectsManager.getProjectStatus($stateParams.id).then(function (data) {
                //    return data;
                //});
            },
            projectTrainings: function (projectsManager, $stateParams) {
                return [];
                //return projectsManager.getProjectTrainings($stateParams.id).then(function (data) {
                //    return data;
                //});
            },
            pageName: function ($translate) {
                return $translate.instant('MYPROJECTS_PROJECT_STATUS');//'Project Status';
            },
        };
        $stateProvider
            .state('projects', {
                url: "/projects",
                templateUrl: "views/projects/views/projects.html",
                controller: "ProjectListCtrl",
                resolve: baseProjectsResolve,
                data: {
                    displayName: '{{pageName}}',
                }
            })
            .state('newproject', {
                url: "/newproject",
                templateUrl: "views/projects/views/projectwizard.html",
                controller: "ProjectsCtrl",
                resolve: baseProjectNewResolve,
                data: {
                    displayName: '{{pageName}}',
                }
            })
            .state('editproject', {
                url: "/editproject/:id",
                templateUrl: "views/projects/views/projectwizard.html",
                controller: "ProjectsCtrl",
                resolve: baseProjectsEditResolve,
                data: {
                    displayName: '{{pageName}}',
                }
            })
            .state('viewproject', {
                url: "/viewproject/:id",
                templateUrl: "views/projects/views/viewprojectwizard.html",
                controller: "ViewProjectsCtrl",
                resolve: baseProjectsViewResolve,
                data: {
                    displayName: '{{pageName}}',
                }
            })
            .state('projectStatus', {
                url: "/projectStatus/:id",
                templateUrl: "views/projects/views/projectStatus.html",
                controller: "ProjectStatusCtrl",
                resolve: baseProjectStatusResolve,
                data: {
                    displayName: '{{pageName}}',
                }
            });
    }])
    .controller('ProjectStatusCtrl', ['$scope', '$location', 'authService', '$window', '$rootScope', 'cssInjector', 'projectsManager', 'dialogService', 'project', 'projectTrainings', '$stateParams', 'localStorageService', '$modal', 'datetimeCalculator', 'evaluationRolesEnum', 'profilesTypesEnum', 'softProfileTypesEnum', 'ktProfileTypesEnum', 'progressBar', '$translate', 'globalVariables',
        function ($scope, $location, authService, $window, $rootScope, cssInjector, projectsManager, dialogService, project, projectTrainings, $stateParams, localStorageService, $modal, datetimeCalculator, evaluationRolesEnum, profilesTypesEnum, softProfileTypesEnum, ktProfileTypesEnum, progressBar, $translate, globalVariables) {
            cssInjector.removeAll();
            cssInjector.add('views/projects/projectStatus.css');
            $scope.project = null;
            $scope.projectTrainings = null;
            $scope.profileFilter = [];
            $scope.trainingFilter = [];
            $scope.members = [];
            $scope.participantRow = "";
            $scope.reportData = [];
            $scope.aggregatedSalesActivities = [];
            $scope.ktProfileTypes = {
                start: { id: 1, label: $translate.instant('COMMON_START_STAGE') },
                final: { id: 2, label: $translate.instant('COMMON_FINAL_STAGE') }
            };

            $scope.trainingHoursToday = 0;
            $scope.trainingHoursWeek = 0;
            $scope.totalTrainingHours = 0;
            moment.locale(globalVariables.lang.currentUICulture);
            var startWeek = moment();
            $scope.weekStartDate = moment(startWeek.startOf("week")._d).format("L LT");
            var endWeek = moment();
            $scope.weekEndDate = moment(endWeek.endOf('week')._d).format("L LT");
            $scope.trainingStartDate = null;
            $scope.trainingEndDate = null;

            $scope.totalProfileTrainingSpentHoursToday = 0;
            $scope.totalProfileTrainingSpentHoursWeek = 0;
            $scope.totalProfileTrainingSpentHours = 0;
            $scope.trainingHoursToday = 0;
            $scope.trainingHoursWeek = 0;
            $scope.totalTrainingHours = 0;
            var startDay = moment();
            $scope.dayStartDate = moment(startDay.startOf("day")._d).format("L LT");
            var endDay = moment();
            $scope.dayEndDate = moment(endDay.endOf('day')._d).format("L LT");
            $scope.profileSteps = [];
            $scope.profileStages = [];
            $scope.selectedProfile = null;
            $scope.selectedParticipants = [];
            $scope.selectedStage = null;
            $scope.selectedStep = null;
            $scope.checkHasPerformanceGroup = function (profileObj) {
                if (profileObj) {
                    if (profileObj.performanceGroups.length > 0) {
                        return "fa-check";
                    }
                    else {
                        return "fa-close";
                    }
                }
                else {
                    return "fa-close";
                }
            }
            $scope.checkHasTrainings = function (profileObj) {
                if (profileObj) {
                    if (profileObj.performanceGroups.length > 0) {
                        var hasTrainings = true;
                        _.forEach(profileObj.performanceGroups, function (performanceGroupsItem) {
                            if (performanceGroupsItem.link_PerformanceGroupSkills.length > 0) {
                                _.forEach(performanceGroupsItem.link_PerformanceGroupSkills, function (link_PerformanceGroupSkillItem) {
                                    if (!(link_PerformanceGroupSkillItem.trainings.length > 0)) {
                                        hasTrainings = false;
                                        return (false);
                                    }
                                })
                                if (!hasTrainings) {
                                    return (false);
                                }
                            }
                            else {
                                hasTrainings = false;
                                return (false);
                            }
                        });
                        if (hasTrainings) {
                            return "fa-check";
                        }
                        else {
                            return "fa-close";
                        }
                    }
                    else {
                        return "fa-close";
                    }
                }
                else {
                    return "fa-close";
                }
            }

            $scope.checkHasSendOut = function (profileObj) {
                if (profileObj) {
                    if (profileObj.stageGroups.length > 0) {
                        // 
                        var hasStages = true;
                        _.forEach(profileObj.stageGroups, function (stageGroupItem) {
                            if (!(stageGroupItem.stages.length > 0)) {
                                hasStages = false;
                                return (false);
                            }
                            else {

                            }
                        });
                        if (hasStages) {
                            return "fa-check";
                        }
                        else {
                            return "fa-close";
                        }
                    }
                    else {
                        return "fa-close";
                    }
                }
                else {
                    return "fa-close";
                }
            }
            $scope.isParticipant = function (evaluationRoleId) {
                return (evaluationRoleId == evaluationRolesEnum.participant);
            }
            $scope.isRunParticipantEvaluationAllowed = function (isSurveyPassed, evaluationRoleId, profileTypeId) {
                return (profileTypeId == profilesTypesEnum.soft) && !isSurveyPassed && (!isParticipant(evaluationRoleId));
            }

            $scope.editProfile = function (id) {
                $location.path("/profile/" + id);
            }
            $scope.profileFilterClick = function ($event) {
                $scope.profileFilter = [];
                if ($("#profileFilterOption").find("input").length > 0) {
                    _.forEach($("#profileFilterOption").find("input"), function (element) {
                        if ($(element).is(":checked")) {
                            $scope.profileFilter.push(parseInt($(element).val()));
                        }
                    })
                }
            }
            $scope.ProfileFilterFn = function (profile) {
                if ($scope.profileFilter.length > 0) {
                    if ($scope.profileFilter.indexOf(profile.user.id) > -1) {
                        return true;
                    }
                    else {
                        return false;
                    }
                }
                else {
                    return true;
                }
            };
            $scope.profileFilterMemberFn = function (member) {
                if ($scope.profileFilter.length > 0) {
                    if ($scope.profileFilter.indexOf(member.userId) > -1) {
                        return true;
                    }
                    else {
                        return false;
                    }
                }
                else {
                    return false;
                }
            }
            $scope.selectProfileFilterOptions = {
                placeholder: $translate.instant('MYPROJECTS_SELECT_USER'),
                dataTextField: "name",
                dataValueField: "id",
                valuePrimitive: false,
                autoBind: false,
                dataSource: {
                    type: "json",
                    data: $scope.members,
                }
            };

            $scope.selectTrainingFilterOptions = {
                placeholder: $translate.instant('MYPROJECTS_SELECT_USER'),
                dataTextField: "name",
                dataValueField: "id",
                valuePrimitive: false,
                autoBind: false,
                dataSource: {
                    type: "json",
                    data: $scope.members,
                }
            };

            $scope.trainingFilterClick = function ($event) {
                $scope.trainingFilter = [];
                if ($("#trainingFilterOption").find("input").length > 0) {
                    _.forEach($("#trainingFilterOption").find("input"), function (element) {
                        if ($(element).is(":checked")) {
                            $scope.trainingFilter.push(parseInt($(element).val()));
                        }
                    })
                }
                $scope.caculateTime();

            }
            $scope.trainingFilterFn = function (training) {
                if ($scope.trainingFilter.length > 0) {
                    if ($scope.trainingFilter.indexOf(training.user.id) > -1) {
                        return true;
                    }
                    else {
                        return false;
                    }
                }
                else {
                    return true;
                }
            };
            $scope.trainingHourPerformance = function (spent, total) {
                if (total != 0) {
                    if (spent >= total) {
                        return "fa-smile-o";
                    }
                    else {
                        return "fa-frown-o";
                    }
                }
                else {
                    return "fa-meh-o";
                }
            }
            $scope.trainingFilterMemberFn = function (member) {
                if ($scope.trainingFilter.length > 0) {
                    if ($scope.trainingFilter.indexOf(member.userId) > -1) {
                        return true;
                    }
                    else {
                        return false;
                    }
                }
                else {
                    return false;
                }
            }

            $scope.caculateTime = function () {
                $scope.totalProfileTrainingSpentHoursToday = 0;
                $scope.totalProfileTrainingSpentHoursWeek = 0;
                $scope.totalProfileTrainingSpentHours = 0;
                $scope.trainingHoursToday = 0;
                $scope.trainingHoursWeek = 0;
                $scope.totalTrainingHours = 0;
                var startDates = [];
                if ($scope.trainingFilter.length > 0) {
                    _.each($scope.projectTrainings, function (projectTraining) {
                        if ($scope.trainingFilter.indexOf(projectTraining.user.id) > -1) {
                            _.each(projectTraining.trainingFeedbacks, function (itemfeedback) {
                                if (itemfeedback.evaluatorId == null) {
                                    if (projectTraining.userId == null) {
                                        if (kendo.parseDate(itemfeedback.recurrencesStartTime) >= kendo.parseDate($scope.dayStartDate) && kendo.parseDate(itemfeedback.recurrencesStartTime) <= kendo.parseDate($scope.dayEndDate)) {
                                            $scope.totalProfileTrainingSpentHoursToday += (itemfeedback.timeSpentMinutes);
                                        }
                                        if (kendo.parseDate(itemfeedback.recurrencesStartTime) >= kendo.parseDate($scope.weekStartDate) && kendo.parseDate(itemfeedback.recurrencesStartTime) <= kendo.parseDate($scope.weekEndDate)) {
                                            $scope.totalProfileTrainingSpentHoursWeek += itemfeedback.timeSpentMinutes;
                                        }
                                        $scope.totalProfileTrainingSpentHours += itemfeedback.timeSpentMinutes;
                                    }
                                }
                            });
                            var event = new kendo.data.SchedulerEvent({
                                id: projectTraining.id,
                                start: kendo.parseDate(projectTraining.startDate), //item1.start,
                                isAllDay: moment(kendo.parseDate(projectTraining.startDate)).format("HHmmss") == "000000",
                                end: kendo.parseDate(projectTraining.endDate),
                                recurrenceRule: projectTraining.frequency,
                            });
                            var occurrences = event.expand(kendo.parseDate(projectTraining.startDate), kendo.parseDate(projectTraining.endDate));
                            angular.forEach(occurrences, function (item1, index1) {
                                if (projectTraining.durationMetricId == 1) {
                                    if (kendo.parseDate(item1.start) >= kendo.parseDate($scope.weekStartDate) && kendo.parseDate(item1.start) <= kendo.parseDate($scope.weekEndDate)) {
                                        $scope.trainingHoursWeek += (projectTraining.duration * 60);
                                    }
                                    $scope.totalTrainingHours += (projectTraining.duration * 60);
                                }
                                if (projectTraining.durationMetricId == 3) {
                                    if (kendo.parseDate(item1.start) >= kendo.parseDate($scope.dayStartDate) && kendo.parseDate(item1.start) <= kendo.parseDate($scope.dayEndDate)) {
                                        $scope.trainingHoursToday += (projectTraining.duration);
                                    }
                                    if (kendo.parseDate(item1.start) >= kendo.parseDate($scope.weekStartDate) && kendo.parseDate(item1.start) <= kendo.parseDate($scope.weekEndDate)) {
                                        $scope.trainingHoursWeek += (projectTraining.duration);
                                    }

                                    $scope.totalTrainingHours += (projectTraining.duration);
                                }
                                if (projectTraining.durationMetricId == 4) {
                                    //Seconds
                                    if (kendo.parseDate(item1.start) >= kendo.parseDate($scope.dayStartDate) && kendo.parseDate(item1.start) <= kendo.parseDate($scope.dayEndDate)) {
                                        $scope.trainingHoursToday += (projectTraining.duration / 60);
                                    }
                                    if (kendo.parseDate(item1.start) >= kendo.parseDate($scope.weekStartDate) && kendo.parseDate(item1.start) <= kendo.parseDate($scope.weekEndDate)) {
                                        $scope.trainingHoursWeek += (projectTraining.duration / 60);
                                    }
                                    $scope.totalTrainingHours += (projectTraining.duration / 60);
                                }
                                if (projectTraining.durationMetricId == 5) {
                                    //Days
                                    if (kendo.parseDate(item1.start) >= kendo.parseDate($scope.dayStartDate) && kendo.parseDate(item1.start) <= kendo.parseDate($scope.dayEndDate)) {
                                        $scope.trainingHoursToday += (projectTraining.duration * 1440);
                                    }
                                    if (kendo.parseDate(item1.start) >= kendo.parseDate($scope.weekStartDate) && kendo.parseDate(item1.start) <= kendo.parseDate($scope.weekEndDate)) {
                                        $scope.trainingHoursWeek += (projectTraining.duration * 1440);
                                    }
                                    $scope.totalTrainingHours += (projectTraining.duration * 1440);
                                }

                                startDates.push(item1.start);
                            });
                        }
                    })
                }
                else {
                    _.each($scope.projectTrainings, function (projectTraining) {
                        _.each(projectTraining.trainingFeedbacks, function (itemfeedback) {
                            if (itemfeedback.evaluatorId == null) {
                                if (projectTraining.userId == null) {
                                    if (kendo.parseDate(itemfeedback.recurrencesStartTime) >= kendo.parseDate($scope.dayStartDate) && kendo.parseDate(itemfeedback.recurrencesStartTime) <= kendo.parseDate($scope.dayEndDate)) {
                                        $scope.totalProfileTrainingSpentHoursToday += (itemfeedback.timeSpentMinutes);
                                    }
                                    if (kendo.parseDate(itemfeedback.recurrencesStartTime) >= kendo.parseDate($scope.weekStartDate) && kendo.parseDate(itemfeedback.recurrencesStartTime) <= kendo.parseDate($scope.weekEndDate)) {
                                        $scope.totalProfileTrainingSpentHoursWeek += itemfeedback.timeSpentMinutes;
                                    }
                                    $scope.totalProfileTrainingSpentHours += itemfeedback.timeSpentMinutes;
                                }
                            }
                        });
                        var event = new kendo.data.SchedulerEvent({
                            id: projectTraining.id,
                            start: kendo.parseDate(projectTraining.startDate), //item1.start,
                            isAllDay: moment(kendo.parseDate(projectTraining.startDate)).format("HHmmss") == "000000",
                            end: kendo.parseDate(projectTraining.endDate),
                            recurrenceRule: projectTraining.frequency,
                        });
                        var occurrences = event.expand(kendo.parseDate(projectTraining.startDate), kendo.parseDate(projectTraining.endDate));
                        angular.forEach(occurrences, function (item1, index1) {
                            if (projectTraining.durationMetricId == 1) {
                                //Hour

                                if (kendo.parseDate(item1.start) >= kendo.parseDate($scope.weekStartDate) && kendo.parseDate(item1.start) <= kendo.parseDate($scope.weekEndDate)) {
                                    $scope.trainingHoursWeek += (projectTraining.duration * 60);
                                }

                                $scope.totalTrainingHours += (projectTraining.duration * 60);
                            }
                            if (projectTraining.durationMetricId == 3) {
                                //Minutes

                                if (kendo.parseDate(item1.start) >= kendo.parseDate($scope.dayStartDate) && kendo.parseDate(item1.start) <= kendo.parseDate($scope.dayEndDate)) {
                                    $scope.trainingHoursToday += (projectTraining.duration);
                                }
                                if (kendo.parseDate(item1.start) >= kendo.parseDate($scope.weekStartDate) && kendo.parseDate(item1.start) <= kendo.parseDate($scope.weekEndDate)) {
                                    $scope.trainingHoursWeek += (projectTraining.duration);
                                }

                                $scope.totalTrainingHours += (projectTraining.duration);
                            }
                            if (projectTraining.durationMetricId == 4) {
                                //Seconds

                                if (kendo.parseDate(item1.start) >= kendo.parseDate($scope.dayStartDate) && kendo.parseDate(item1.start) <= kendo.parseDate($scope.dayEndDate)) {
                                    $scope.trainingHoursToday += (projectTraining.duration / 60);
                                }
                                if (kendo.parseDate(item1.start) >= kendo.parseDate($scope.weekStartDate) && kendo.parseDate(item1.start) <= kendo.parseDate($scope.weekEndDate)) {
                                    $scope.trainingHoursWeek += (projectTraining.duration / 60);
                                }
                                $scope.totalTrainingHours += (projectTraining.duration / 60);
                            }
                            if (projectTraining.durationMetricId == 5) {
                                //Days
                                if (kendo.parseDate(item1.start) >= kendo.parseDate($scope.dayStartDate) && kendo.parseDate(item1.start) <= kendo.parseDate($scope.dayEndDate)) {
                                    $scope.trainingHoursToday += (projectTraining.duration * 1440);
                                }
                                if (kendo.parseDate(item1.start) >= kendo.parseDate($scope.weekStartDate) && kendo.parseDate(item1.start) <= kendo.parseDate($scope.weekEndDate)) {
                                    $scope.trainingHoursWeek += (projectTraining.duration * 1440);
                                }
                                $scope.totalTrainingHours += (projectTraining.duration * 1440);
                            }
                            startDates.push(item1.start);
                        });
                    })
                }
                var sortedStartDate = _.sortBy(startDates, function (dateItem) {
                    return -(kendo.parseDate(dateItem).getTime());
                });
                $scope.trainingStartDate = moment(kendo.parseDate(sortedStartDate[sortedStartDate.length - 1])).format("L");
                $scope.trainingEndDate = moment(kendo.parseDate(sortedStartDate[0])).format("L");
            }
            $scope.viewProfile = function (id) {
                $location.path("/viewprofile/" + id);
            }
            $scope.showMembers = function () {
            }
            $scope.sendParticipantReminder = function (stageId, participantId) {
                dialogService.showYesNoDialog($translate.instant('COMMON_CONFIRM'), $translate.instant('MYPROJECTS_ARE_YOU_SURE_WANT_TO_SEND_REMINDER_TO_PARTICIPANT')).then(function () {
                    projectsManager.sendStageParticipantReminder(stageId, participantId).then(function (data) {
                        if (data) {
                            dialogService.showNotification($translate.instant('MYPROJECTS_REMINDER_NOTIFCIATION_SENT'), $translate.instant('COMMON_SUCCESS'));
                        }
                    })
                })

            }
            $scope.sendEvaluationReminder = function (stageId, evaluatorId) {
                dialogService.showYesNoDialog($translate.instant('COMMON_CONFIRM'), $translate.instant('MYPROJECTS_ARE_YOU_SURE_WANT_TO_SEND_REMINDER_TO_EVALUATOR')).then(function () {
                    projectsManager.sendStageEvaluationReminder(stageId, evaluatorId).then(function (data) {
                        if (data) {
                            dialogService.showNotification($translate.instant('MYPROJECTS_REMINDER_NOTIFCIATION_SENT'), $translate.instant('COMMON_SUCCESS'));
                        }
                    });
                })

            }
            $scope.filterableProfiles = [];
            $scope.projectTasks = [];

            $scope.taskActivityResultFilterOptionModel = {
                taskId: 0,
                userId: 0,
                startDate: null,
                endDate: null
            };

            $scope.init = function ($event) {
                progressBar.startProgress();
                projectsManager.getProjectStatus($stateParams.id).then(function (data) {
                    progressBar.stopProgress();
                    $scope.project = data;
                    _.each($scope.project.activeProfiles, function (item) {
                        if (item.stage) {
                            if (item.stage.endDateTime) {
                                item.stage.endDateTime = moment(kendo.parseDate(item.stage.endDateTime)).format("L LT");
                            }
                        }
                        var isadded = _.any($scope.filterableProfiles, function (dataItem) {
                            return dataItem.profile.id == item.profile.id;
                        });
                        if (!isadded) {
                            $scope.filterableProfiles.push(item);
                        }
                    })
                    _.each($scope.project.completedProfiles, function (item) {
                        if (item.stage) {
                            if (item.stage.endDateTime) {
                                item.stage.endDateTime = moment(kendo.parseDate(item.stage.endDateTime)).format("L LT");
                            }
                        }
                        var isadded = _.any($scope.filterableProfiles, function (dataItem) {
                            return dataItem.profile.id == item.profile.id;
                        });
                        if (!isadded) {
                            $scope.filterableProfiles.push(item);
                        }
                    })

                    _.each($scope.project.expiredProfiles, function (item) {
                        if (item.stage) {
                            if (item.stage.endDateTime) {
                                item.stage.endDateTime = moment(kendo.parseDate(item.stage.endDateTime)).format("L LT");
                            }
                        }

                    })

                    var a = moment(kendo.parseDate($scope.project.expectedEndDate));
                    var b = moment(new Date());
                    $scope.remainDays = a.diff(b, 'days');
                    _.forEach($scope.project.members, function (member) {
                        $scope.members.push({ id: member.userId, name: member.user.firstName + " " + member.user.lastName, image: member.user.imagePath })

                    });
                    progressBar.startProgress();
                    projectsManager.getProjectTrainings($stateParams.id).then(function (data) {
                        progressBar.stopProgress();
                        $scope.projectTrainings = data;
                        _.each($scope.projectTrainings, function (projectTrainingItem) {
                            if (projectTrainingItem.startDate) {
                                projectTrainingItem.startDate = moment(kendo.parseDate(projectTrainingItem.startDate)).format("L LT");
                            }
                            _.each(projectTrainingItem.trainingFeedbacks, function (feedbackItem) {
                                if (feedbackItem.recurrencesStartTime) {
                                    feedbackItem.recurrencesStartTime = moment(kendo.parseDate(feedbackItem.recurrencesStartTime)).format("L LT");
                                }
                                if (feedbackItem.recurrencesEndTime) {
                                    feedbackItem.recurrencesEndTime = moment(kendo.parseDate(feedbackItem.recurrencesEndTime)).format("L LT");
                                }
                                if (feedbackItem.feedbackDateTime) {
                                    feedbackItem.feedbackDateTime = moment(kendo.parseDate(feedbackItem.feedbackDateTime)).format("L LT");
                                }
                            });
                        })
                        $scope.caculateTime();
                    });
                    getScorecardData();
                    App.initSlimScroll(".pending_profiles_scroller");
                });

                projectsManager.getProjectTasks($stateParams.id).then(function (data) {
                    $scope.projectTasks = data;
                    $scope.projectTasks.unshift({
                        id: null, title: "All"
                    })
                })
            }

            $scope.scorecardProfileFilterClick = function (profileId) {
                $scope.selectedStep = null;
                $scope.profileSteps = [];
                $scope.profileStages = [];
                _.filter($scope.project.completedProfiles, function (profileItem) {
                    if (profileItem.profile.id == profileId) {
                        $scope.selectedProfileText = profileItem.profile.name
                        $scope.profileStages.push(profileItem.stage);
                        if (profileItem.profile.profileTypeId == profilesTypesEnum.soft) {
                            $scope.profileSteps = getDefaultSoftProfileTypes();
                            $scope.profileType = profilesTypesEnum.soft;
                            $scope.selectedStep = softProfileTypesEnum.finalKpi.id;
                            $scope.selectedStepText = _.find($scope.profileSteps, function (stepItem) {
                                return stepItem.id == $scope.selectedStep;
                            }).label;
                        }
                        else {
                            $scope.profileSteps = getDefaultKTProfileTypes();
                            $scope.profileType = profilesTypesEnum.knowledge;
                        }
                        return (false);
                    }
                });
                $scope.selectedProfile = profileId;

            }

            $scope.scorecardParticipantClick = function (participantuserId) {
                $scope.selectedParticipants = [participantuserId];
                $scope.participantText = $(".filterPartcipantOption[data-value='" + participantuserId + "']").text();
                $scope.participantRow = "";

                if ($scope.selectedParticipants.length > 0) {
                    getScorecardData()
                }
                else {
                    $("#psScorecardGrid").empty();
                }
            }

            $scope.scorecardStageFilterClick = function (stageId) {
                if (stageId) {
                    $scope.selectedStage = stageId;
                    var selectedStageItem = _.find($scope.profileStages, function (stageItem) {
                        return stageItem.id == stageId;
                    });
                    if (selectedStageItem) {
                        $scope.selectedStageText = selectedStageItem.name;
                        $scope.stageGroupId = selectedStageItem.stageGroupId;

                    }
                    getParticipants();
                }
            }

            $scope.profileStepClick = function (stepId) {
                $scope.selectedStep = stepId;
                $scope.selectedStepText = _.find($scope.profileSteps, function (stepItem) {
                    return stepItem.id == stepId;
                }).label;
                if ($scope.selectedParticipants.length > 0) {
                    getScorecardData()
                }
                else {
                    $("#psScorecardGrid").empty();
                }
            }

            $scope.TabChange = function (tab) {
                if (tab == "PendingProfiles") {
                    App.initSlimScroll(".pending_profiles_scroller");
                }
                if (tab == "ActiveProfiles") {
                    App.initSlimScroll(".active_profiles_scroller");
                }
                if (tab == "ExpiredProfiles") {
                    App.initSlimScroll(".expired_profiles_scroller");
                }
                if (tab == "CompletedProfiles") {
                    App.initSlimScroll(".completed_profiles_scroller");
                }
                if (tab == "TrainingsCompleted") {
                    App.initSlimScroll(".trainings_completed_scroller");
                }
            }
            $scope.getTaskSalesActivityData = function (taskId) {
                $scope.selectedTask = _.find($scope.projectTasks, function (item) {
                    return item.id == taskId;
                });
                if (taskId != null) {
                    var projectTask = _.find($scope.projectTasks, function (item) {
                        return item.id == taskId;
                    });
                    if (projectTask) {
                        $scope.taskActivityResultFilterOptionModel = {
                            taskId: taskId,
                            userId: projectTask.assignedToUserId,
                            startDate: null,
                            endDate: null
                        };
                        progressBar.startProgress();
                        projectsManager.getUserTaskAggregatedSalesActivityData($scope.taskActivityResultFilterOptionModel).then(function (data) {
                            progressBar.stopProgress();
                            $scope.aggregatedSalesActivities = [];
                            var columns = [];
                            var aggregates = [];
                            if (data.length > 0) {
                                columns.push({ field: "prospectingName", title: $translate.instant('MYPROJECTS_PROJECTSTATUS_PROSPECTING_NAME'), footerTemplate: "Total" });
                                //columns.push({ field: "userName", title: 'Member' });
                                columns.push({ field: "goalStartDate", title: $translate.instant('COMMON_START_DATE') });
                                columns.push({ field: "goalEndDate", title: $translate.instant('COMMON_END_DATE') });
                                //columns.push({ field: "skillName", title: 'skill Name' })
                                if (data[0].prospectingSkillGoalResults.length > 0) {
                                    _.each(data[0].prospectingSkillGoalResults, function (skillGoalItem) {
                                        columns.push({
                                            field: skillGoalItem.skillName + "_Goal", title: skillGoalItem.skillName + " " + $translate.instant('COMMON_GOAL'), aggregates: ["sum"], footerTemplate: "<div class='text-center'> #= sum # </div>", attributes: {
                                                "class": "text-center"
                                            }
                                        })
                                        columns.push({
                                            field: skillGoalItem.skillName + "_Count", title: skillGoalItem.skillName + " " + $translate.instant('MYPROJECTS_PROJECTSTATUS_COUNT'), aggregates: ["sum"], footerTemplate: "<div class='text-center'> #= sum # </div>", attributes: {
                                                "class": "text-center"
                                            }, template: function (data, value) {
                                                return data[skillGoalItem.skillName + "_Count"] + " <i class='fa fa-eye' ng-click='viewProspectingResults(" + data.prospectingGoalId + "," + skillGoalItem.skillId + "," + skillGoalItem.seqNo + ")'></i>"
                                            }
                                        })
                                        columns.push({
                                            field: skillGoalItem.skillName + "_Result", title: skillGoalItem.skillName + " " + $translate.instant('COMMON_RESULT'), attributes: {
                                                "class": "text-center"
                                            },
                                            template: "<span>#=" + skillGoalItem.skillName + "_Result" + "#%<\span>",
                                            footerTemplate: function (data) {
                                                var avgResult = ((data[skillGoalItem.skillName + "_Count"].sum / data[skillGoalItem.skillName + "_Goal"].sum) * 100)
                                                var resultAvg = Math.round(avgResult * 100) / 100;
                                                return "<div class='text-center'>" + resultAvg + "%</div>"
                                            },
                                        })

                                        aggregates.push({
                                            field: skillGoalItem.skillName + "_Goal", aggregate: "sum"
                                        })
                                        aggregates.push({
                                            field: skillGoalItem.skillName + "_Count", aggregate: "sum"
                                        })
                                    });
                                }
                            }
                            var gridData = [];
                            _.each(data, function (datItem) {
                                var userItem = _.find($rootScope.organizationUsers, function (memberItem) {
                                    return memberItem.id == datItem.userId;
                                });
                                var rowdata = {
                                    goalStartDate: moment(kendo.parseDate(datItem.goalStartDate)).format('L LT'),
                                    goalEndDate: moment(kendo.parseDate(datItem.goalEndDate)).format('L LT'),
                                    participantId: datItem.participantId,
                                    //userName: userItem.firstName + " " + userItem.lastName
                                    prospectingName: datItem.prospectingName,
                                    prospectingGoalId: 0,
                                }
                                _.each(datItem.prospectingSkillGoalResults, function (skillGoalItem) {
                                    rowdata.prospectingGoalId = skillGoalItem.prospectingGoalId;
                                    rowdata[skillGoalItem.skillName + "_Goal"] = skillGoalItem.goal;
                                    rowdata[skillGoalItem.skillName + "_Count"] = skillGoalItem.count;
                                    rowdata[skillGoalItem.skillName + "_Result"] = skillGoalItem.result;
                                });
                                gridData.push(rowdata);
                            })
                            if ($("#taskAggregatedSalesActivitiesGrid").data("kendoGrid")) {
                                $("#taskAggregatedSalesActivitiesGrid").kendoGrid("destroy");
                                $("#taskAggregatedSalesActivitiesGrid").html("");
                            }
                            $("#taskAggregatedSalesActivitiesGrid").kendoGrid({
                                //dataBound: $scope.onUserAssignGridDataBound,
                                dataSource: {
                                    type: "json",
                                    data: gridData,
                                    pageSize: 10,
                                    aggregate: aggregates,
                                },
                                groupable: false, // this will remove the group bar
                                columnMenu: false,
                                filterable: false,
                                pageable: true,
                                sortable: true,
                                columns: columns,
                            });
                            $("#taskAggregatedSalesActivitiesGrid").kendoTooltip({
                                filter: "th", // show tooltip only on these elements
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
                            });
                        });
                    }
                }
                else {
                    //progressBar.startProgress();
                    projectsManager.getProjectTaskAggregatedActivityData($scope.project.id).then(function (data) {
                        progressBar.stopProgress();
                        $scope.aggregatedSalesActivities = [];
                        var columns = [];
                        var aggregates = [];
                        if (data.length > 0) {
                            columns.push({ field: "prospectingName", title: $translate.instant('MYPROJECTS_PROJECTSTATUS_PROSPECTING_NAME'), footerTemplate: "Total" });
                            //columns.push({ field: "userName", title: 'Member' });
                            columns.push({ field: "goalStartDate", title: $translate.instant('COMMON_START_DATE') });
                            columns.push({ field: "goalEndDate", title: $translate.instant('COMMON_END_DATE') });
                            //columns.push({ field: "skillName", title: 'skill Name' })
                            if (data[0].prospectingSkillGoalResults.length > 0) {
                                _.each(data[0].prospectingSkillGoalResults, function (skillGoalItem) {
                                    columns.push({
                                        field: skillGoalItem.skillName + "_Goal", title: skillGoalItem.skillName + " " + $translate.instant('COMMON_GOAL'), aggregates: ["sum"], footerTemplate: "<div class='text-center'> #= sum # </div>", attributes: {
                                            "class": "text-center"
                                        }
                                    })
                                    columns.push({
                                        field: skillGoalItem.skillName + "_Count", title: skillGoalItem.skillName + " " + $translate.instant('MYPROJECTS_PROJECTSTATUS_COUNT'), aggregates: ["sum"], footerTemplate: "<div class='text-center'> #= sum # </div>", attributes: {
                                            "class": "text-center"
                                        }, template: function (data, value) {
                                            return data[skillGoalItem.skillName + "_Count"] + " <i class='fa fa-eye' ng-click='viewProspectingResults(" + data.prospectingGoalId + "," + skillGoalItem.skillId + "," + skillGoalItem.seqNo + ")'></i>"
                                        }
                                    })
                                    columns.push({
                                        field: skillGoalItem.skillName + "_Result", title: skillGoalItem.skillName + " " + $translate.instant('COMMON_RESULT'), attributes: {
                                            "class": "text-center"
                                        },
                                        template: "<span>#=" + skillGoalItem.skillName + "_Result" + "#%<\span>",
                                        footerTemplate: function (data) {
                                            var avgResult = ((data[skillGoalItem.skillName + "_Count"].sum / data[skillGoalItem.skillName + "_Goal"].sum) * 100)
                                            var resultAvg = Math.round(avgResult * 100) / 100;
                                            return "<div class='text-center'>" + resultAvg + "%</div>"
                                        },
                                    })

                                    aggregates.push({
                                        field: skillGoalItem.skillName + "_Goal", aggregate: "sum"
                                    })
                                    aggregates.push({
                                        field: skillGoalItem.skillName + "_Count", aggregate: "sum"
                                    })
                                });
                            }
                        }
                        var gridData = [];
                        var skillsForAll = [];
                        _.each(data, function (datItem, index) {
                            var userItem = _.find($rootScope.organizationUsers, function (memberItem) {
                                return memberItem.id == datItem.userId;
                            });
                            var rowdata = {
                                goalStartDate: moment(kendo.parseDate(datItem.goalStartDate)).format('L LT'),
                                goalEndDate: moment(kendo.parseDate(datItem.goalEndDate)).format('L LT'),
                                participantId: datItem.participantId,
                                //userName: userItem.firstName + " " + userItem.lastName
                                prospectingName: datItem.prospectingName,
                                prospectingGoalId: 0,
                            }
                            _.each(datItem.prospectingSkillGoalResults, function (skillGoalItem) {
                                if (index == 0) {
                                    skillsForAll.push(skillGoalItem);
                                    rowdata.prospectingGoalId = skillGoalItem.prospectingGoalId;
                                    rowdata[skillGoalItem.skillName + "_Goal"] = skillGoalItem.goal;
                                    rowdata[skillGoalItem.skillName + "_Count"] = skillGoalItem.count;
                                    rowdata[skillGoalItem.skillName + "_Result"] = skillGoalItem.result;
                                } else {
                                    var skill = _.find(skillsForAll, function (item) {
                                        return item.seqNo == skillGoalItem.seqNo;
                                    });
                                    rowdata.prospectingGoalId = skillGoalItem.prospectingGoalId;
                                    rowdata[skill.skillName + "_Goal"] = skillGoalItem.goal;
                                    rowdata[skill.skillName + "_Count"] = skillGoalItem.count;
                                    rowdata[skill.skillName + "_Result"] = skillGoalItem.result;
                                }
                            });
                            gridData.push(rowdata);
                        })
                        if ($("#taskAggregatedSalesActivitiesGrid").data("kendoGrid")) {
                            $("#taskAggregatedSalesActivitiesGrid").kendoGrid("destroy");
                            $("#taskAggregatedSalesActivitiesGrid").html("");
                        }
                        $("#taskAggregatedSalesActivitiesGrid").kendoGrid({
                            //dataBound: $scope.onUserAssignGridDataBound,
                            dataSource: {
                                type: "json",
                                data: gridData,
                                pageSize: 10,
                                aggregate: aggregates,
                            },
                            groupable: false, // this will remove the group bar
                            columnMenu: false,
                            filterable: false,
                            pageable: true,
                            sortable: true,
                            columns: columns,
                        });
                        $("#taskAggregatedSalesActivitiesGrid").kendoTooltip({
                            filter: "th", // show tooltip only on these elements
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
                        });

                        var linkFn = $compile($("#taskAggregatedSalesActivitiesGrid"));
                        linkFn($scope);
                        App.initSlimScroll(".scroller");
                    });
                }

            }
            $scope.getSalesActivityData = function (profileId) {
                if ($scope.salesActivityProfileId != profileId) {
                    progressBar.startProgress();
                    $scope.salesActivityProfileId = profileId;
                    projectsManager.getSalesActivityData(profileId).then(function (data) {
                        progressBar.stopProgress();
                        $scope.aggregatedSalesActivities = [];
                        var columns = [];
                        var aggregates = [];
                        if (data.length > 0) {
                            columns.push({ field: "userName", title: $translate.instant('MYPROJECTS_PROJECTSTATUS_MEMBER'), footerTemplate: "Total" });
                            columns.push({ field: "goalStartDate", title: $translate.instant('COMMON_START_DATE') });
                            columns.push({ field: "goalEndDate", title: $translate.instant('COMMON_END_DATE') });
                            //columns.push({ field: "skillName", title: 'skill Name' })
                            if (data[0].prospectingSkillGoalResults.length > 0) {
                                _.each(data[0].prospectingSkillGoalResults, function (skillGoalItem) {
                                    columns.push({
                                        field: skillGoalItem.skillName + "_Goal", title: skillGoalItem.skillName + " " + $translate.instant('COMMON_GOAL'), aggregates: ["sum"], footerTemplate: "<div class='text-center'> #= sum # </div>", attributes: {
                                            "class": "text-center"
                                        }
                                    })
                                    columns.push({
                                        field: skillGoalItem.skillName + "_Count", title: skillGoalItem.skillName + " " + $translate.instant('MYPROJECTS_PROJECTSTATUS_COUNT'), aggregates: ["sum"], footerTemplate: "<div class='text-center'> #= sum # </div>", attributes: {
                                            "class": "text-center"
                                        }
                                    })
                                    columns.push({
                                        field: skillGoalItem.skillName + "_Result", title: skillGoalItem.skillName + " " + $translate.instant('COMMON_RESULT'),
                                        attributes: {
                                            "class": "text-center"
                                        },
                                        template: "<span>#=" + skillGoalItem.skillName + "_Result" + "#%<\span>",
                                        footerTemplate: function (data) {
                                            var avgResult = ((data[skillGoalItem.skillName + "_Count"].sum / data[skillGoalItem.skillName + "_Goal"].sum) * 100)
                                            var resultAvg = Math.round(avgResult * 100) / 100;
                                            return "<div class='text-center'>" + resultAvg + "%</div>"
                                        }
                                    })

                                    aggregates.push({ field: skillGoalItem.skillName + "_Goal", aggregate: "sum" })
                                    aggregates.push({ field: skillGoalItem.skillName + "_Count", aggregate: "sum" })
                                });
                            }
                        }
                        var gridData = [];
                        _.each(data, function (datItem) {
                            var userItem = _.find($scope.members, function (memberItem) {
                                return memberItem.id == datItem.userId;
                            });
                            var rowdata = {
                                goalStartDate: moment(kendo.parseDate(datItem.goalStartDate)).format('L LT'),
                                goalEndDate: moment(kendo.parseDate(datItem.goalEndDate)).format('L LT'),
                                participantId: datItem.participantId,
                                userName: userItem.name
                            }
                            _.each(datItem.prospectingSkillGoalResults, function (skillGoalItem) {
                                rowdata[skillGoalItem.skillName + "_Goal"] = skillGoalItem.goal;
                                rowdata[skillGoalItem.skillName + "_Count"] = skillGoalItem.count;
                                rowdata[skillGoalItem.skillName + "_Result"] = skillGoalItem.result;
                            });
                            gridData.push(rowdata);
                            var userItem = _.find($scope.members, function (memberItem) {
                                return memberItem.id == datItem.userId;
                            });
                        })
                        if ($("#aggregatedSalesActivitiesGrid").data("kendoGrid")) {
                            $("#aggregatedSalesActivitiesGrid").kendoGrid("destroy");
                            $("#aggregatedSalesActivitiesGrid").html("");
                        }
                        $("#aggregatedSalesActivitiesGrid").kendoGrid({
                            dataBound: $scope.onUserAssignGridDataBound,
                            dataSource: {
                                type: "json",
                                data: gridData,
                                pageSize: 10,
                                aggregate: aggregates,
                            },
                            groupable: false, // this will remove the group bar
                            columnMenu: false,
                            filterable: false,
                            pageable: true,
                            sortable: true,
                            columns: columns,
                        });
                        $("#aggregatedSalesActivitiesGrid").kendoTooltip({
                            filter: "th", // show tooltip only on these elements
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
                        });
                        App.initSlimScroll(".scroller");

                    });

                    var seleteduserId = $(".memeber-activities .active").data("userid");
                    if (seleteduserId) {
                        $scope.getUserSalesActivityData(seleteduserId);
                    }
                }
            }

            $scope.getUserSalesActivityData = function (userid) {
                progressBar.startProgress();
                projectsManager.getUserSalesActivityData($scope.salesActivityProfileId, userid).then(function (data) {
                    progressBar.stopProgress();

                    var columns = [];
                    var aggregates = [];
                    if (data.length > 0) {
                        columns.push({
                            field: "prospectingGoalName", title: $translate.instant('MYPROJECTS_PROJECTSTATUS_SALES_ACTIVITY'), hidden: true,
                        });
                        columns.push({ field: "goalStartDate", title: $translate.instant('COMMON_START_DATE'), hidden: true, });
                        columns.push({ field: "goalEndDate", title: $translate.instant('COMMON_END_DATE'), hidden: true, });
                        columns.push({ field: "actvitiyName", title: $translate.instant('MYPROJECTS_PROJECTSTATUS_ACTIVITY_NAME'), footerTemplate: "Total" });
                        columns.push({ field: "actvitiyStart", title: $translate.instant('MYPROJECTS_PROJECTSTATUS_ACTIVITY_START') });
                        columns.push({ field: "actvitiyEnd", title: $translate.instant('MYPROJECTS_PROJECTSTATUS_ACTIVITY_END') });
                        if (data[0].prospectingSkillGoalResults.length > 0) {
                            _.each(data[0].prospectingSkillGoalResults, function (skillGoalItem) {
                                columns.push({ field: skillGoalItem.skillName + "_Count", title: skillGoalItem.skillName + " " + $translate.instant('MYPROJECTS_PROJECTSTATUS_COUNT'), aggregates: ["sum"], footerTemplate: " #= sum # " });
                                aggregates.push({ field: skillGoalItem.skillName + "_Count", aggregate: "sum" })
                            });
                        }


                        var gridData = [];
                        _.each(data, function (datItem) {
                            var userItem = _.find($scope.members, function (memberItem) {
                                return memberItem.id == datItem.userId;
                            });
                            var rowdata = {
                                actvitiyName: datItem.actvitiyName,
                                prospectingGoalName: datItem.prospectingGoalName,
                                goalStartDate: moment(kendo.parseDate(datItem.goalStartDate)).format('L LT'),
                                goalEndDate: moment(kendo.parseDate(datItem.goalEndDate)).format('L LT'),
                                actvitiyStart: moment(kendo.parseDate(datItem.actvitiyStart)).format('L LT'),
                                actvitiyEnd: moment(kendo.parseDate(datItem.actvitiyEnd)).format('L LT'),
                            }
                            _.each(datItem.prospectingSkillGoalResults, function (skillGoalItem) {
                                rowdata[skillGoalItem.skillName + "_Count"] = skillGoalItem.count;
                            });
                            gridData.push(rowdata);

                        })

                    }

                    if ($("#memeberActivityGrid").data("kendoGrid")) {
                        $("#memeberActivityGrid").kendoGrid("destroy");
                        $("#memeberActivityGrid").html("");
                    }
                    $("#memeberActivityGrid").kendoGrid({
                        dataBound: $scope.onUserAssignGridDataBound,
                        dataSource: {
                            type: "json",
                            data: gridData,
                            //group: { field: "profileid", field: "skill" },
                            pageSize: 10,
                            group: {
                                field: "prospectingGoalName",
                                dir: "asc",
                            },
                            aggregate: aggregates,
                        },
                        groupable: false, // this will remove the group bar
                        columnMenu: false,
                        filterable: {
                            extra: false,
                            operators: {
                                string: {
                                    startswith: "Starts with",
                                    eq: "Is equal to",
                                    neq: "Is not equal to"
                                }
                            }
                        },
                        pageable: true,
                        sortable: true,
                        columns: columns,
                    });
                    $("#memeberActivityGrid").kendoTooltip({
                        filter: "th", // show tooltip only on these elements
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
                    });
                })
            }
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
                //types.push(softProfileTypesEnum.startProfile);
                //types.push(softProfileTypesEnum.finalProfile);
                //types.push(softProfileTypesEnum.initialKPI);
                //types.push(softProfileTypesEnum.finalKpi);

                return types;
            };
            function getDefaultKTProfileTypes() {
                var types = [];
                types.push(ktProfileTypes.start);
                types.push(ktProfileTypes.final);
                return types;
            }


            function getParticipants() {
                projectsManager.getParticipantsBy($scope.selectedProfile, $scope.selectedStage, null,
                    null, null, $scope.stageGroupId).then(function (data) {
                        $scope.members = [];
                        _.forEach(data, function (item) {
                            $scope.members.push({ id: item.userId, name: item.firstName + " " + item.lastName, isSelfEvaluation: item.isSelfEvaluation });
                        });

                    });

            }
            function roleFilter(element) {
                element.kendoDropDownList({
                    dataSource: [
                        { name: "Participant", value: $translate.instant('COMMON_PARTICIPANT') },
                        { name: "Evaluator", value: $translate.instant('COMMON_EVALUATOR') }
                    ],
                    dataTextField: "name",
                    dataValueField: "value"
                })
            }
            function getEvaluationRole(evaluationRoleId) {
                switch (evaluationRoleId) {
                    case 1:
                        return $translate.instant('COMMON_EVALUATOR');
                        break;
                    case 2:
                        return $translate.instant('COMMON_PARTICIPANT');
                        break;
                    default:
                        return '';
                }
            }

            function getScorecardData() {
                $scope.reportData = [];
                var scorcarddata = [];
                if ($scope.selectedProfile != null) {
                    projectsManager.GetUserProfileScorecard($scope.selectedParticipants[0], $scope.selectedProfile).then(function (data) {
                        if (data.length > 0) {
                            var profile = data[0];
                            _.forEach(profile.ipsTrainingDiaryStages, function (stage) {
                                _.forEach(stage.evaluationAgreement, function (evaluationAgreement) {
                                    var scoreCardObj = { profileid: 0, profile: "", stageId: 0, stage: "", skill: "", start: "", end: "", performance: "", progress: 0, finalGoal: 0, score: 0, evalutorId: null, kpitype: null, role: "" };
                                    scoreCardObj.role = getEvaluationRole(profile.profile.evalutorRoleId)
                                    scoreCardObj.evalutorId = profile.profile.evalutorId;
                                    scoreCardObj.profileid = profile.profile.id;
                                    scoreCardObj.profile = profile.profile.name;
                                    scoreCardObj.stage = stage.name;
                                    scoreCardObj.stageId = stage.id;
                                    scoreCardObj.start = moment(kendo.parseDate(stage.startDate)).format("L LT");
                                    scoreCardObj.end = moment(kendo.parseDate(stage.endDate)).format("L LT");
                                    scoreCardObj.kpitype = (evaluationAgreement.kpiType == 1 ? "weak" : evaluationAgreement.kpiType == 2 ? "strong" : "");
                                    scoreCardObj.score = evaluationAgreement.finalScore;
                                    scoreCardObj.skill = (evaluationAgreement.question.skills.length > 0 ? evaluationAgreement.question.skills[0].name : "");
                                    var stageIndex = profile.ipsTrainingDiaryStages.findIndex(function (item) { return item.id == evaluationAgreement.stageId })
                                    if (stageIndex > -1) {
                                        if (stageIndex == 0) {
                                            scoreCardObj.finalGoal = evaluationAgreement.shortGoal;
                                            if (evaluationAgreement.finalScore == evaluationAgreement.shortGoal) {
                                                scoreCardObj.performance = "Equal"
                                            }
                                            else {
                                                scoreCardObj.performance = (evaluationAgreement.finalScore > evaluationAgreement.shortGoal ? "arrow-circle-up" : "arrow-circle-down");
                                            }
                                            var avg = (evaluationAgreement.finalScore / evaluationAgreement.shortGoal);
                                            if (!isNaN(avg)) {
                                                scoreCardObj.progress = parseFloat(avg * 100).toFixed(2)
                                            }
                                        }
                                        else if (stageIndex == 1) {
                                            scoreCardObj.finalGoal = evaluationAgreement.midGoal;

                                            if (evaluationAgreement.finalScore == evaluationAgreement.midGoal) {
                                                scoreCardObj.performance = "arrow-h"
                                            }
                                            else {
                                                scoreCardObj.performance = (evaluationAgreement.finalScore > evaluationAgreement.midGoal ? "arrow-circle-up" : "arrow-circle-down");
                                            }
                                            var avg = (evaluationAgreement.finalScore / evaluationAgreement.midGoal);
                                            if (!isNaN(avg)) {
                                                scoreCardObj.progress = parseFloat(avg * 100).toFixed(2)
                                            }
                                        }
                                        else if (stageIndex == 2) {
                                            scoreCardObj.finalGoal = evaluationAgreement.longGoal;

                                            if (evaluationAgreement.finalScore == evaluationAgreement.longGoal) {
                                                scoreCardObj.performance = "arrow-h"
                                            }
                                            else {
                                                scoreCardObj.performance = (evaluationAgreement.finalScore > evaluationAgreement.longGoal ? "arrow-circle-up" : "arrow-circle-down");
                                            }
                                            var avg = (evaluationAgreement.finalScore / evaluationAgreement.longGoal);
                                            if (!isNaN(avg)) {
                                                scoreCardObj.progress = parseFloat(avg * 100).toFixed(2)
                                            }
                                        }
                                        else if (stageIndex == 3) {
                                            scoreCardObj.finalGoal = evaluationAgreement.finalGoal;

                                            if (evaluationAgreement.finalScore == evaluationAgreement.finalGoal) {
                                                scoreCardObj.performance = "arrow-h"
                                            }
                                            else {
                                                scoreCardObj.performance = (evaluationAgreement.finalScore > evaluationAgreement.finalGoal ? "arrow-circle-up" : "arrow-circle-down");
                                            }
                                            var avg = (evaluationAgreement.finalScore / evaluationAgreement.finalGoal);
                                            if (!isNaN(avg)) {
                                                scoreCardObj.progress = parseFloat(avg * 100).toFixed(2)
                                            }
                                        }
                                        else if (stageIndex == 4) {
                                            scoreCardObj.finalGoal = evaluationAgreement.finalGoal;

                                            if (evaluationAgreement.finalScore == evaluationAgreement.finalGoal) {
                                                scoreCardObj.performance = "Equal"
                                            }
                                            else {
                                                scoreCardObj.performance = (evaluationAgreement.finalScore > evaluationAgreement.finalGoal ? "arrow-circle-up" : "arrow-circle-down");
                                            }
                                            var avg = (evaluationAgreement.finalScore / evaluationAgreement.finalGoal);
                                            if (!isNaN(avg)) {
                                                scoreCardObj.progress = parseFloat(avg * 100).toFixed(2)
                                            }
                                        }
                                    }
                                    scorcarddata.push(scoreCardObj);
                                });
                            });
                        }

                        if ($("#psScorecardGrid").data("kendoGrid")) {
                            $("#psScorecardGrid").kendoGrid("destroy");
                            $("#psScorecardGrid").html("");
                        }
                        $("#psScorecardGrid").kendoGrid({
                            dataBound: $scope.onUserAssignGridDataBound,
                            dataSource: {
                                type: "json",
                                data: scorcarddata,
                                group: { field: "profileid", field: "skill" },
                                pageSize: 10,
                            },
                            groupable: false, // this will remove the group bar
                            columnMenu: false,

                            filterable: {
                                extra: false,
                                operators: {
                                    string: {
                                        startswith: "Starts with",
                                        eq: "Is equal to",
                                        neq: "Is not equal to"
                                    }
                                }
                            },
                            pageable: true,
                            sortable: true,
                            columns: [
                                {
                                    field: "start", title: $translate.instant('COMMON_PERIOD'),
                                    template: function (data, value) {
                                        return moment(kendo.parseDate(data.start)).format('L LT') + " - " + moment(kendo.parseDate(data.end)).format('L LT')
                                    }
                                },
                                {
                                    field: "profile", title: $translate.instant('COMMON_PROFILE'),
                                },
                                {
                                    field: "role",
                                    title: $translate.instant('COMMON_ROLE'),
                                    filterable: {
                                        ui: roleFilter
                                    }
                                },
                                { field: "stage", title: $translate.instant('COMMON_STAGE') },
                                { field: "skill", title: $translate.instant('COMMON_SKILL') + "(" + $translate.instant('COMMON_HISTORY') + ")" },
                                {
                                    field: "kpitype", title: $translate.instant('COMMON_KPI_TYPE'), template: "<span title='#=kpitype#' class='scale-circle #=kpitype#'></span>",
                                    filterable: false, sortable: false,
                                },
                                { field: "finalGoal", title: $translate.instant('COMMON_GOAL') },
                                { field: "score", title: $translate.instant('MYPROJECTS_RESULTS') },
                                { field: "performance", title: $translate.instant('COMMON_PERFORMANCE'), template: "<div class='fa fa-#: performance #'></div>", filterable: false, sortable: false, },
                                { field: "progress", title: $translate.instant('COMMON_PROGRESS'), template: "<span> #: progress #%</span>", width: "10%", },
                                { field: "id", title: $translate.instant('COMMON_ACTION'), template: "<div class='btn btn-sm btn-info' ng-click='gotoDevelopmentContractDetail(#:profileid#,#:stageId#,#:evalutorId#,null)'>View </span>", filterable: false, sortable: false, }
                            ],
                        });
                        $("#psScorecardGrid").kendoTooltip({
                            filter: "th", // show tooltip only on these elements
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
                        });
                        App.initSlimScroll(".scroller");
                    })
                }
                else {
                    $("#psScorecardGrid").kendoGrid({
                        dataBound: $scope.onUserAssignGridDataBound,
                        dataSource: {
                            type: "json",
                            data: scorcarddata,
                            group: { field: "profileid", field: "skill" },
                            pageSize: 10,
                        },
                        groupable: false, // this will remove the group bar
                        columnMenu: false,

                        filterable: {
                            extra: false,
                            operators: {
                                string: {
                                    startswith: "Starts with",
                                    eq: "Is equal to",
                                    neq: "Is not equal to"
                                }
                            }
                        },
                        pageable: true,
                        sortable: true,
                        columns: [
                            {
                                field: "start", title: $translate.instant('COMMON_PERIOD'),
                                //headerTemplate: function () {
                                //    return " <i class='fa fa-info-circle' title='Period'></i> Period"
                                //},
                                template: function (data, value) {
                                    return moment(kendo.parseDate(data.start)).format('L LT') + " - " + moment(kendo.parseDate(data.end)).format('L LT')
                                }
                            },
                            {
                                field: "profile", title: $translate.instant('COMMON_PROFILE'),
                                //headerTemplate: function () {
                                //    return " <i class='fa fa-info-circle title='Profile'></i> Profile"
                                //},
                            },
                            {
                                field: "role",
                                title: $translate.instant('COMMON_ROLE'),
                                filterable: {
                                    ui: roleFilter
                                }
                            },
                            { field: "stage", title: $translate.instant('COMMON_STAGE') },
                            { field: "skill", title: $translate.instant('COMMON_SKILL') + "(" + $translate.instant('COMMON_KPI') + ")" },
                            {
                                field: "kpitype", title: $translate.instant('COMMON_KPI_TYPE'), template: "<span title='#=kpitype#' class='scale-circle #=kpitype#'></span>",
                                filterable: false, sortable: false,
                            },
                            { field: "finalGoal", title: $translate.instant('COMMON_GOAL') },
                            { field: "score", title: $translate.instant('MYPROJECTS_RESULTS') },
                            { field: "performance", title: $translate.instant('COMMON_PERFORMANCE'), template: "<div class='fa fa-#: performance #'></div>", filterable: false, sortable: false, },
                            { field: "progress", title: $translate.instant('COMMON_PROGRESS'), template: "<span> #: progress #%</span>", width: "10%", },
                            { field: "id", title: $translate.instant('COMMON_ACTION'), template: "<div class='btn btn-sm btn-info' ng-click='gotoDevelopmentContractDetail(#:profileid#,#:stageId#,#:evalutorId#,null)'>View </span>", filterable: false, sortable: false, }
                        ],
                    });
                    $("#psScorecardGrid").kendoTooltip({
                        filter: "th", // show tooltip only on these elements
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
                    });
                    App.initSlimScroll(".scroller");
                }

            }
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

        }])
    .controller('ViewProjectsCtrl', ['$scope', '$location', 'authService', '$window', '$rootScope', 'cssInjector', 'projectsManager', 'organizations', 'projectRoles', 'dialogService', 'project', '$stateParams', 'localStorageService', 'projectPhasesEnum', 'phasesLevelEnum', 'notificationTemplates', '$modal', 'datetimeCalculator', 'durationMetrics', '$translate',
        function ($scope, $location, authService, $window, $rootScope, cssInjector, projectsManager, organizations, projectRoles, dialogService, project, $stateParams, localStorageService, projectPhasesEnum, phasesLevelEnum, notificationTemplates, $modal, datetimeCalculator, durationMetrics, $translate) {
            cssInjector.removeAll();
            cssInjector.add('views/profiles/new-soft-profile.css');
            //cssInjector.add('css/default.min.css');

            cssInjector.add('views/projects/new-project.css');
            //cssInjector.add('views/projects/projects.css');
            //cssInjector.add('views/softprofilewizard/softprofilewizard.css');
            $scope.organizations = organizations;
            $scope.projectRoles = projectRoles;
            $scope.notificationTemplates = notificationTemplates;
            $scope.isEdit = $stateParams.id > 0 ? true : false;
            $scope.project = project;
            $scope.durationMetrics = durationMetrics;
            $scope.projectGlobalSetting = {
                id: 0,
                projectId: 0,
                softProfileMonthSpan: 0,
                softProfileWeekSpan: 6,
                softProfileDaySpan: 0,
                softProfileHourSpan: 0,
                softProfileMinuteSpan: 0,
                softProfileRecurrentTrainingTimeSpan: "FREQ=WEEKLY;BYDAY=FR;WKST=SU",
                knowledgeProfileMonthSpan: 0,
                knowledgeProfileWeekSpan: 6,
                knowledgeProfileDaySpan: 0,
                knowledgeProfileHourSpan: 0,
                knowledgeProfileMinuteSpan: 0,
                knowledgeProfileRecurrentTrainingTimeSpan: "FREQ=WEEKLY;BYDAY=FR;WKST=SU",
                //Notifications -Start 
                softProfileStartEmailNotification: true,
                softProfileStartSmsNotification: false,
                softProfileStartExternalStartNotificationTemplateId: null,
                softProfileStartEvaluatorStartNotificationTemplateId: null,
                softProfileStartTrainerStartNotificationTemplateId: null,
                softProfileStartManagerStartNotificationTemplateId: null,
                softProfileStartFinalScoreManagerStartNotificationTemplateId: null,
                softProfileStartProjectManagerStartNotificationTemplateId: null,

                softProfileStartExternalCompletedNotificationTemplateId: null,
                softProfileStartEvaluatorCompletedNotificationTemplateId: null,
                softProfileStartTrainerCompletedNotificationTemplateId: null,
                softProfileStartManagerCompletedNotificationTemplateId: null,
                softProfileStartFinalScoreManagerCompletedNotificationTemplateId: null,
                softProfileStartProjectManagerCompletedNotificationTemplateId: null,
                softProfileStartExternalResultsNotificationTemplateId: null,
                softProfileStartEvaluatorResultsNotificationTemplateId: null,
                softProfileStartTrainerResultsNotificationTemplateId: null,
                softProfileStartManagerResultsNotificationTemplateId: null,
                softProfileStartFinalScoreManagerResultsNotificationTemplateId: null,
                softProfileStartProjectManagerResultsNotificationTemplateId: null,

                //Alarms
                softProfileStartGreenAlarmParticipantTemplateId: null,
                softProfileStartGreenAlarmEvaluatorTemplateId: null,
                softProfileStartGreenAlarmManagerTemplateId: null,
                softProfileStartGreenAlarmTrainerTemplateId: null,
                softProfileStartGreenAlarmFinalScoreManagerTemplateId: null,
                softProfileStartGreenAlarmProjectManagerTemplateId: null,
                softProfileStartYellowAlarmParticipantTemplateId: null,
                softProfileStartYellowAlarmEvaluatorTemplateId: null,
                softProfileStartYellowAlarmManagerTemplateId: null,
                softProfileStartYellowAlarmTrainerTemplateId: null,
                softProfileStartYellowAlarmFinalScoreManagerTemplateId: null,
                softProfileStartYellowAlarmProjectManagerTemplateId: null,

                softProfileStartRedAlarmParticipantTemplateId: null,
                softProfileStartRedAlarmEvaluatorTemplateId: null,
                softProfileStartRedAlarmManagerTemplateId: null,
                softProfileStartRedAlarmTrainerTemplateId: null,
                softProfileStartRedAlarmFinalScoreManagerTemplateId: null,
                softProfileStartRedAlarmProjectManagerTemplateId: null,
                //Notifications - Short
                softProfileShortGoalEmailNotification: true,
                softProfileShortGoalSmsNotification: false,
                softProfileShortGoalExternalStartNotificationTemplateId: null,
                softProfileShortGoalEvaluatorStartNotificationTemplateId: null,
                softProfileShortGoalTrainerStartNotificationTemplateId: null,
                softProfileShortGoalManagerStartNotificationTemplateId: null,
                softProfileShortGoalExternalCompletedNotificationTemplateId: null,
                softProfileShortGoalEvaluatorCompletedNotificationTemplateId: null,
                softProfileShortGoalTrainerCompletedNotificationTemplateId: null,
                softProfileShortGoalManagerCompletedNotificationTemplateId: null,
                softProfileShortGoalExternalResultsNotificationTemplateId: null,
                softProfileShortGoalEvaluatorResultsNotificationTemplateId: null,
                softProfileShortGoalTrainerResultsNotificationTemplateId: null,
                softProfileShortGoalManagerResultsNotificationTemplateId: null,
                //Alarms
                softProfileShortGoalGreenAlarmParticipantTemplateId: null,
                softProfileShortGoalGreenAlarmEvaluatorTemplateId: null,
                softProfileShortGoalGreenAlarmManagerTemplateId: null,
                softProfileShortGoalGreenAlarmTrainerTemplateId: null,
                softProfileShortGoalYellowAlarmParticipantTemplateId: null,
                softProfileShortGoalYellowAlarmEvaluatorTemplateId: null,
                softProfileShortGoalYellowAlarmManagerTemplateId: null,
                softProfileShortGoalYellowAlarmTrainerTemplateId: null,
                softProfileShortGoalRedAlarmParticipantTemplateId: null,
                softProfileShortGoalRedAlarmEvaluatorTemplateId: null,
                softProfileShortGoalRedAlarmManagerTemplateId: null,
                softProfileShortGoalRedAlarmTrainerTemplateId: null,


                //Notifications - Long
                softProfileMidGoalEmailNotification: true,
                softProfileMidGoalSmsNotification: false,
                softProfileMidGoalExternalStartNotificationTemplateId: null,
                softProfileMidGoalEvaluatorStartNotificationTemplateId: null,
                softProfileMidGoalTrainerStartNotificationTemplateId: null,
                softProfileMidGoalManagerStartNotificationTemplateId: null,
                softProfileMidGoalExternalCompletedNotificationTemplateId: null,
                softProfileMidGoalEvaluatorCompletedNotificationTemplateId: null,
                softProfileMidGoalTrainerCompletedNotificationTemplateId: null,
                softProfileMidGoalManagerCompletedNotificationTemplateId: null,
                softProfileMidGoalExternalResultsNotificationTemplateId: null,
                softProfileMidGoalEvaluatorResultsNotificationTemplateId: null,
                softProfileMidGoalTrainerResultsNotificationTemplateId: null,
                softProfileMidGoalManagerResultsNotificationTemplateId: null,
                //Alarms
                softProfileMidGoalGreenAlarmParticipantTemplateId: null,
                softProfileMidGoalGreenAlarmEvaluatorTemplateId: null,
                softProfileMidGoalGreenAlarmManagerTemplateId: null,
                softProfileMidGoalGreenAlarmTrainerTemplateId: null,
                softProfileMidGoalYellowAlarmParticipantTemplateId: null,
                softProfileMidGoalYellowAlarmEvaluatorTemplateId: null,
                softProfileMidGoalYellowAlarmManagerTemplateId: null,
                softProfileMidGoalYellowAlarmTrainerTemplateId: null,
                softProfileMidGoalRedAlarmParticipantTemplateId: null,
                softProfileMidGoalRedAlarmEvaluatorTemplateId: null,
                softProfileMidGoalRedAlarmManagerTemplateId: null,
                softProfileMidGoalRedAlarmTrainerTemplateId: null,


                //Notifications
                softProfileLongTermGoalEmailNotification: true,
                softProfileLongTermGoalSmsNotification: false,
                softProfileLongTermGoalExternalStartNotificationTemplateId: null,
                softProfileLongTermGoalEvaluatorStartNotificationTemplateId: null,
                softProfileLongTermGoalTrainerStartNotificationTemplateId: null,
                softProfileLongTermGoalManagerStartNotificationTemplateId: null,
                softProfileLongTermGoalExternalCompletedNotificationTemplateId: null,
                softProfileLongTermGoalEvaluatorCompletedNotificationTemplateId: null,
                softProfileLongTermGoalTrainerCompletedNotificationTemplateId: null,
                softProfileLongTermGoalManagerCompletedNotificationTemplateId: null,
                softProfileLongTermGoalExternalResultsNotificationTemplateId: null,
                softProfileLongTermGoalEvaluatorResultsNotificationTemplateId: null,
                softProfileLongTermGoalTrainerResultsNotificationTemplateId: null,
                softProfileLongTermGoalManagerResultsNotificationTemplateId: null,
                //Alarms
                softProfileLongTermGoalGreenAlarmParticipantTemplateId: null,
                softProfileLongTermGoalGreenAlarmEvaluatorTemplateId: null,
                softProfileLongTermGoalGreenAlarmManagerTemplateId: null,
                softProfileLongTermGoalGreenAlarmTrainerTemplateId: null,
                softProfileLongTermGoalYellowAlarmParticipantTemplateId: null,
                softProfileLongTermGoalYellowAlarmEvaluatorTemplateId: null,
                softProfileLongTermGoalYellowAlarmManagerTemplateId: null,
                softProfileLongTermGoalYellowAlarmTrainerTemplateId: null,
                softProfileLongTermGoalRedAlarmParticipantTemplateId: null,
                softProfileLongTermGoalRedAlarmEvaluatorTemplateId: null,
                softProfileLongTermGoalRedAlarmManagerTemplateId: null,
                softProfileLongTermGoalRedAlarmTrainerTemplateId: null,

                //Notifications
                softProfileFinalGoalEmailNotification: true,
                softProfileFinalGoalSmsNotification: false,
                softProfileFinalGoalExternalStartNotificationTemplateId: null,
                softProfileFinalGoalEvaluatorStartNotificationTemplateId: null,
                softProfileFinalGoalTrainerStartNotificationTemplateId: null,
                softProfileFinalGoalManagerStartNotificationTemplateId: null,
                softProfileFinalGoalExternalCompletedNotificationTemplateId: null,
                softProfileFinalGoalEvaluatorCompletedNotificationTemplateId: null,
                softProfileFinalGoalTrainerCompletedNotificationTemplateId: null,
                softProfileFinalGoalManagerCompletedNotificationTemplateId: null,
                softProfileFinalGoalExternalResultsNotificationTemplateId: null,
                softProfileFinalGoalEvaluatorResultsNotificationTemplateId: null,
                softProfileFinalGoalTrainerResultsNotificationTemplateId: null,
                softProfileFinalGoalManagerResultsNotificationTemplateId: null,
                //Alarms
                softProfileFinalGoalGreenAlarmParticipantTemplateId: null,
                softProfileFinalGoalGreenAlarmEvaluatorTemplateId: null,
                softProfileFinalGoalGreenAlarmManagerTemplateId: null,
                softProfileFinalGoalGreenAlarmTrainerTemplateId: null,
                softProfileFinalGoalYellowAlarmParticipantTemplateId: null,
                softProfileFinalGoalYellowAlarmEvaluatorTemplateId: null,
                softProfileFinalGoalYellowAlarmManagerTemplateId: null,
                softProfileFinalGoalYellowAlarmTrainerTemplateId: null,
                softProfileFinalGoalRedAlarmParticipantTemplateId: null,
                softProfileFinalGoalRedAlarmEvaluatorTemplateId: null,
                softProfileFinalGoalRedAlarmManagerTemplateId: null,
                softProfileFinalGoalRedAlarmTrainerTemplateId: null,

                //Notifications
                knowledgeProfileEmailNotification: true,
                knowledgeProfileSmsNotification: false,
                knowledgeProfileExternalStartNotificationTemplateId: null,
                knowledgeProfileEvaluatorStartNotificationTemplateId: null,
                knowledgeProfileTrainerStartNotificationTemplateId: null,
                knowledgeProfileManagerStartNotificationTemplateId: null,
                knowledgeProfileFinalScoreManagerStartNotificationTemplateId: null,
                knowledgeProfileProjectManagerStartNotificationTemplateId: null,
                knowledgeProfileExternalCompletedNotificationTemplateId: null,
                knowledgeProfileEvaluatorCompletedNotificationTemplateId: null,
                knowledgeProfileTrainerCompletedNotificationTemplateId: null,
                knowledgeProfileManagerCompletedNotificationTemplateId: null,
                knowledgeProfileFinalScoreManagerCompletedNotificationTemplateId: null,
                knowledgeProfileProjectManagerCompletedNotificationTemplateId: null,
                knowledgeProfileExternalResultsNotificationTemplateId: null,
                knowledgeProfileEvaluatorResultsNotificationTemplateId: null,
                knowledgeProfileTrainerResultsNotificationTemplateId: null,
                knowledgeProfileManagerResultsNotificationTemplateId: null,
                knowledgeProfileFinalScoreManagerResultsNotificationTemplateId: null,
                knowledgeProfileProjectManagerResultsNotificationTemplateId: null,
                //Alarms
                knowledgeProfileGreenAlarmParticipantTemplateId: null,
                knowledgeProfileGreenAlarmEvaluatorTemplateId: null,
                knowledgeProfileGreenAlarmManagerTemplateId: null,
                knowledgeProfileGreenAlarmTrainerTemplateId: null,
                knowledgeProfileYellowAlarmParticipantTemplateId: null,
                knowledgeProfileYellowAlarmEvaluatorTemplateId: null,
                knowledgeProfileYellowAlarmManagerTemplateId: null,
                knowledgeProfileYellowAlarmTrainerTemplateId: null,
                knowledgeProfileRedAlarmParticipantTemplateId: null,
                knowledgeProfileRedAlarmEvaluatorTemplateId: null,
                knowledgeProfileRedAlarmManagerTemplateId: null,
                knowledgeProfileRedAlarmTrainerTemplateId: null,
                softProfileHowMany: 30,
                softProfileMetricId: 3,
                softProfileHowManySets: 1,
                softProfileHowManyActions: 1,
                knowledgeProfileHowMany: 30,
                knowledgeProfileMetricId: 3,
                knowledgeProfileHowManySets: 1,
                knowledgeProfileHowManyActions: 1,
                softProfilePersonalTrainingReminderNotificationTemplateId: null,
                softProfileProfileTrainingReminderNotificationTemplateId: null,
                knowledgeProfilePersonalTrainingReminderNotificationTemplateId: null,
                knowledgeProfileProfileTrainingReminderNotificationTemplateId: null,

                startStageStartDate: null,
                startStageEndDate: null,
                shortGoalStartDate: null,
                shortGoalEndDate: null,
                midGoalStartDate: null,
                midGoalEndDate: null,
                longTermGoalStartDate: null,
                longTermGoalEndDate: null,
                finalGoalStartDate: null,
                finalGoalEndDate: null,
                knowledgeProfileStartDate: null,
                knowledgeProfileEndDate: null,
                trainerId: null,
                managerId: null,
                softProfileStartGreenAlarmTime: null,
                softProfileStartYellowAlarmTime: null,
                softProfileStartRedAlarmTime: null,
                softProfileShortGoalGreenAlarmTime: null,
                softProfileShortGoalYellowAlarmTime: null,
                softProfileShortGoalRedAlarmTime: null,
                softProfileMidGoalGreenAlarmTime: null,
                softProfileMidGoalYellowAlarmTime: null,
                softProfileMidGoalRedAlarmTime: null,
                softProfileLongTermGoalGreenAlarmTime: null,
                softProfileLongTermGoalYellowAlarmTime: null,
                softProfileLongTermGoalRedAlarmTime: null,
                softProfileFinalGoalGreenAlarmTime: null,
                softProfileFinalGoalYellowAlarmTime: null,
                softProfileFinalGoalRedAlarmTime: null,
                knowledgeProfileGreenAlarmTime: null,
                knowledgeProfileYellowAlarmTime: null,
                knowledgeProfileRedAlarmTime: null

            }

            $scope.projectDefaultNotificationSettings = {
                evaluatorsCompletedNotificationId: null,
                evaluatorsResultNotificationId: null,
                evaluatorGreenNotificationId: null,
                evaluatorRedNotificationId: null,
                evaluatorYellowNotificationId: null,
                evaluatorsStartNotificationId: null,
                finalScoreManagersCompletedNotificationId: null,
                finalScoreManagersGreenNotificationId: null,
                finalScoreManagersRedNotificationId: null,
                finalScoreManagersResultNotificationId: null,
                finalScoreManagersStartNotificationId: null,
                finalScoreManagersYellowNotificationId: null,
                greenAlarmBefore: null,
                managerGreenNotificationId: null,
                managerRedNotificationId: null,
                managerYellowNotificationId: null,
                managersCompletedNotificationId: null,
                managersResultNotificationId: null,
                managersStartNotificationId: null,
                participantGreenNotificationId: null,
                participantRedNotificationId: null,
                participantYellowNotificationId: null,
                participantsCompletedNotificationId: null,
                participantsResultNotificationId: null,
                participantsStartNotificationId: null,
                projectManagersCompletedNotificationId: null,
                projectManagersGreenNotificationId: null,
                projectManagersRedNotificationId: null,
                projectManagersResultNotificationId: null,
                projectManagersStartNotificationId: null,
                projectManagersYellowNotificationId: null,
                redAlarmBefore: null,
                trainerGreenNotificationId: null,
                trainerRedNotificationId: null,
                trainerYellowNotificationId: null,
                trainersCompletedNotificationId: null,
                trainersResultNotificationId: null,
                trainersStartNotificationId: null,
                yellowAlarmBefore: null,
            };
            $scope.users = [];

            $scope.projectPhasesEnum = projectPhasesEnum;
            $scope.phasesLevelEnum = phasesLevelEnum;
            $scope.projectSteeringGroups = [];
            $scope.projectGoalStrategies = [];
            $scope.setDefaults = function () {
                if ($scope.projectGlobalSetting) {
                    $scope.projectGlobalSetting.softProfileStartEmailNotification = true;
                    $scope.projectGlobalSetting.softProfileStartSmsNotification = false;

                    $scope.projectGlobalSetting.softProfileStartExternalStartNotificationTemplateId = 78;
                    $scope.projectGlobalSetting.softProfileStartEvaluatorStartNotificationTemplateId = 20;


                    $scope.projectGlobalSetting.softProfileStartGreenAlarmParticipantTemplateId = 62;
                    $scope.projectGlobalSetting.softProfileStartGreenAlarmEvaluatorTemplateId = 65;
                    $scope.projectGlobalSetting.softProfileStartGreenAlarmManagerTemplateId = 70;
                    $scope.projectGlobalSetting.softProfileStartGreenAlarmTrainerTemplateId = 73;
                    $scope.projectGlobalSetting.softProfileStartYellowAlarmParticipantTemplateId = 66;
                    $scope.projectGlobalSetting.softProfileStartYellowAlarmEvaluatorTemplateId = 79;
                    $scope.projectGlobalSetting.softProfileStartYellowAlarmManagerTemplateId = 71;
                    $scope.projectGlobalSetting.softProfileStartYellowAlarmTrainerTemplateId = 74;
                    $scope.projectGlobalSetting.softProfileStartRedAlarmParticipantTemplateId = 67;
                    $scope.projectGlobalSetting.softProfileStartRedAlarmEvaluatorTemplateId = 77;
                    $scope.projectGlobalSetting.softProfileStartRedAlarmManagerTemplateId = 72;
                    $scope.projectGlobalSetting.softProfileStartRedAlarmTrainerTemplateId = 75;


                    $scope.projectGlobalSetting.knowledgeProfileEmailNotification = true;
                    $scope.projectGlobalSetting.knowledgeProfileSmsNotification = false;

                    $scope.projectGlobalSetting.knowledgeProfileExternalStartNotificationTemplateId = 16;
                    $scope.projectGlobalSetting.knowledgeProfileEvaluatorStartNotificationTemplateId = 96;

                    $scope.projectGlobalSetting.knowledgeProfileGreenAlarmParticipantTemplateId = 62;
                    $scope.projectGlobalSetting.knowledgeProfileGreenAlarmEvaluatorTemplateId = 65;
                    $scope.projectGlobalSetting.knowledgeProfileGreenAlarmManagerTemplateId = 70;
                    $scope.projectGlobalSetting.knowledgeProfileGreenAlarmTrainerTemplateId = 73;
                    $scope.projectGlobalSetting.knowledgeProfileYellowAlarmParticipantTemplateId = 66;
                    $scope.projectGlobalSetting.knowledgeProfileYellowAlarmEvaluatorTemplateId = 79;
                    $scope.projectGlobalSetting.knowledgeProfileYellowAlarmManagerTemplateId = 71;
                    $scope.projectGlobalSetting.knowledgeProfileYellowAlarmTrainerTemplateId = 74;
                    $scope.projectGlobalSetting.knowledgeProfileRedAlarmParticipantTemplateId = 67;
                    $scope.projectGlobalSetting.knowledgeProfileRedAlarmEvaluatorTemplateId = 77;
                    $scope.projectGlobalSetting.knowledgeProfileRedAlarmManagerTemplateId = 72;
                    $scope.projectGlobalSetting.knowledgeProfileRedAlarmTrainerTemplateId = 75;


                    $scope.projectGlobalSetting.softProfileShortGoalEmailNotification = true;
                    $scope.projectGlobalSetting.softProfileShortGoalSmsNotification = false;

                    $scope.projectGlobalSetting.softProfileShortGoalExternalStartNotificationTemplateId = null; //28;
                    $scope.projectGlobalSetting.softProfileShortGoalEvaluatorStartNotificationTemplateId = 30;

                    $scope.projectGlobalSetting.softProfileShortGoalGreenAlarmParticipantTemplateId = 62;
                    $scope.projectGlobalSetting.softProfileShortGoalGreenAlarmEvaluatorTemplateId = 65;
                    $scope.projectGlobalSetting.softProfileShortGoalGreenAlarmManagerTemplateId = 70;
                    $scope.projectGlobalSetting.softProfileShortGoalGreenAlarmTrainerTemplateId = 73;
                    $scope.projectGlobalSetting.softProfileShortGoalYellowAlarmParticipantTemplateId = 66;
                    $scope.projectGlobalSetting.softProfileShortGoalYellowAlarmEvaluatorTemplateId = 79;
                    $scope.projectGlobalSetting.softProfileShortGoalYellowAlarmManagerTemplateId = 71;
                    $scope.projectGlobalSetting.softProfileShortGoalYellowAlarmTrainerTemplateId = 74;
                    $scope.projectGlobalSetting.softProfileShortGoalRedAlarmParticipantTemplateId = 67;
                    $scope.projectGlobalSetting.softProfileShortGoalRedAlarmEvaluatorTemplateId = 75;
                    $scope.projectGlobalSetting.softProfileShortGoalRedAlarmManagerTemplateId = 72;
                    $scope.projectGlobalSetting.softProfileShortGoalRedAlarmTrainerTemplateId = 75;

                    $scope.projectGlobalSetting.softProfileMidGoalEmailNotification = true;
                    $scope.projectGlobalSetting.softProfileMidGoalSmsNotification = false;
                    $scope.projectGlobalSetting.softProfileMidGoalExternalStartNotificationTemplateId = 27;
                    $scope.projectGlobalSetting.softProfileMidGoalEvaluatorStartNotificationTemplateId = 31;

                    $scope.projectGlobalSetting.softProfileMidGoalGreenAlarmParticipantTemplateId = 62;
                    $scope.projectGlobalSetting.softProfileMidGoalGreenAlarmEvaluatorTemplateId = 65;
                    $scope.projectGlobalSetting.softProfileMidGoalGreenAlarmManagerTemplateId = 70;
                    $scope.projectGlobalSetting.softProfileMidGoalGreenAlarmTrainerTemplateId = 73;
                    $scope.projectGlobalSetting.softProfileMidGoalYellowAlarmParticipantTemplateId = 66;
                    $scope.projectGlobalSetting.softProfileMidGoalYellowAlarmEvaluatorTemplateId = 79;
                    $scope.projectGlobalSetting.softProfileMidGoalYellowAlarmManagerTemplateId = 71;
                    $scope.projectGlobalSetting.softProfileMidGoalYellowAlarmTrainerTemplateId = 74;
                    $scope.projectGlobalSetting.softProfileMidGoalRedAlarmParticipantTemplateId = 67;
                    $scope.projectGlobalSetting.softProfileMidGoalRedAlarmEvaluatorTemplateId = 77;
                    $scope.projectGlobalSetting.softProfileMidGoalRedAlarmManagerTemplateId = 72;
                    $scope.projectGlobalSetting.softProfileMidGoalRedAlarmTrainerTemplateId = 75;



                    $scope.projectGlobalSetting.softProfileLongTermGoalEmailNotification = true;
                    $scope.projectGlobalSetting.softProfileLongTermGoalSmsNotification = false;
                    $scope.projectGlobalSetting.softProfileLongTermGoalExternalStartNotificationTemplateId = 29;
                    $scope.projectGlobalSetting.softProfileLongTermGoalEvaluatorStartNotificationTemplateId = 32;

                    $scope.projectGlobalSetting.softProfileLongTermGoalGreenAlarmParticipantTemplateId = 62;
                    $scope.projectGlobalSetting.softProfileLongTermGoalGreenAlarmEvaluatorTemplateId = 65;
                    $scope.projectGlobalSetting.softProfileLongTermGoalGreenAlarmManagerTemplateId = 70;
                    $scope.projectGlobalSetting.softProfileLongTermGoalGreenAlarmTrainerTemplateId = 73;
                    $scope.projectGlobalSetting.softProfileLongTermGoalYellowAlarmParticipantTemplateId = 66;
                    $scope.projectGlobalSetting.softProfileLongTermGoalYellowAlarmEvaluatorTemplateId = 79;
                    $scope.projectGlobalSetting.softProfileLongTermGoalYellowAlarmManagerTemplateId = 71;
                    $scope.projectGlobalSetting.softProfileLongTermGoalYellowAlarmTrainerTemplateId = 74;
                    $scope.projectGlobalSetting.softProfileLongTermGoalRedAlarmParticipantTemplateId = 67;
                    $scope.projectGlobalSetting.softProfileLongTermGoalRedAlarmEvaluatorTemplateId = 77;
                    $scope.projectGlobalSetting.softProfileLongTermGoalRedAlarmManagerTemplateId = 72;
                    $scope.projectGlobalSetting.softProfileLongTermGoalRedAlarmTrainerTemplateId = 75;

                    $scope.projectGlobalSetting.softProfileFinalGoalEmailNotification = true;
                    $scope.projectGlobalSetting.softProfileFinalGoalSmsNotification = false;
                    $scope.projectGlobalSetting.softProfileFinalGoalExternalStartNotificationTemplateId = 19;
                    $scope.projectGlobalSetting.softProfileFinalGoalEvaluatorStartNotificationTemplateId = 80;

                    $scope.projectGlobalSetting.softProfileFinalGoalGreenAlarmParticipantTemplateId = 62;
                    $scope.projectGlobalSetting.softProfileFinalGoalGreenAlarmEvaluatorTemplateId = 65;
                    $scope.projectGlobalSetting.softProfileFinalGoalGreenAlarmManagerTemplateId = 70;
                    $scope.projectGlobalSetting.softProfileFinalGoalGreenAlarmTrainerTemplateId = 73;
                    $scope.projectGlobalSetting.softProfileFinalGoalYellowAlarmParticipantTemplateId = 66;
                    $scope.projectGlobalSetting.softProfileFinalGoalYellowAlarmEvaluatorTemplateId = 79;
                    $scope.projectGlobalSetting.softProfileFinalGoalYellowAlarmManagerTemplateId = 71;
                    $scope.projectGlobalSetting.softProfileFinalGoalYellowAlarmTrainerTemplateId = 74;
                    $scope.projectGlobalSetting.softProfileFinalGoalRedAlarmParticipantTemplateId = 67;
                    $scope.projectGlobalSetting.softProfileFinalGoalRedAlarmEvaluatorTemplateId = 77;
                    $scope.projectGlobalSetting.softProfileFinalGoalRedAlarmManagerTemplateId = 72;
                    $scope.projectGlobalSetting.softProfileFinalGoalRedAlarmTrainerTemplateId = 75;


                    $scope.projectGlobalSetting.softProfilePersonalTrainingReminderNotificationTemplateId = 111;
                    $scope.projectGlobalSetting.softProfileProfileTrainingReminderNotificationTemplateId = 110;
                    $scope.projectGlobalSetting.knowledgeProfilePersonalTrainingReminderNotificationTemplateId = 111;
                    $scope.projectGlobalSetting.knowledgeProfileProfileTrainingReminderNotificationTemplateId = 110;
                }
            };

            $scope.changeSoftProfileTimeSpan = function () {
                var newDate = kendo.parseDate($scope.project.expectedStartDate);
                var calculatedDate = moment(newDate).add({ months: $scope.projectGlobalSetting.softProfileMonthSpan, days: $scope.projectGlobalSetting.softProfileDaySpan + ($scope.projectGlobalSetting.softProfileWeekSpan * 7), hours: $scope.projectGlobalSetting.softProfileHourSpan, minutes: $scope.projectGlobalSetting.softProfileMinuteSpan });
                var diffTime = null;
                var a = moment(kendo.parseDate($scope.project.expectedEndDate));
                var b = moment(kendo.parseDate($scope.project.expectedStartDate));
                diffTime = a.diff(b) / 5;

                $scope.projectGlobalSetting.startStageStartDate = moment(kendo.parseDate(newDate)).format('L LT')
                $scope.projectGlobalSetting.startStageEndDate = moment(kendo.parseDate($scope.projectGlobalSetting.startStageStartDate)).add($scope.projectGlobalSetting.softProfileActualTimeSpan).format('L LT');
                var startdatetime = kendo.parseDate($scope.projectGlobalSetting.startStageStartDate);
                var enddatetime = kendo.parseDate($scope.projectGlobalSetting.startStageEndDate);
                var TotalDiffrence = enddatetime.getTime() - startdatetime.getTime();
                var greenAlarmAt = parseInt(TotalDiffrence * 0.20);
                var yellowAlarmAt = parseInt(TotalDiffrence * 0.60);
                var redAlarmAt = parseInt(TotalDiffrence * 0.90);
                $scope.projectGlobalSetting.softProfileStartGreenAlarmTime = moment(new Date(startdatetime.getTime() + greenAlarmAt)).format('L LT');
                $scope.projectGlobalSetting.softProfileStartYellowAlarmTime = moment(new Date(startdatetime.getTime() + yellowAlarmAt)).format('L LT');
                $scope.projectGlobalSetting.softProfileStartRedAlarmTime = moment(new Date(enddatetime.getTime())).add(1, 'minutes').format('L LT');
                $scope.projectGlobalSetting.shortGoalStartDate = moment(kendo.parseDate($scope.projectGlobalSetting.startStageEndDate)).format('L LT');
                $scope.projectGlobalSetting.shortGoalEndDate = moment(kendo.parseDate($scope.projectGlobalSetting.shortGoalStartDate)).add($scope.projectGlobalSetting.softProfileActualTimeSpan).format('L LT');
                var startdatetime = kendo.parseDate($scope.projectGlobalSetting.shortGoalStartDate);
                var enddatetime = kendo.parseDate($scope.projectGlobalSetting.shortGoalEndDate);
                var TotalDiffrence = enddatetime.getTime() - startdatetime.getTime();
                var greenAlarmAt = parseInt(TotalDiffrence * 0.20);
                var yellowAlarmAt = parseInt(TotalDiffrence * 0.60);
                var redAlarmAt = parseInt(TotalDiffrence * 0.90);
                $scope.projectGlobalSetting.softProfileShortGoalGreenAlarmTime = moment(new Date(startdatetime.getTime() + greenAlarmAt)).format('L LT');
                $scope.projectGlobalSetting.softProfileShortGoalYellowAlarmTime = moment(new Date(startdatetime.getTime() + yellowAlarmAt)).format('L LT');
                $scope.projectGlobalSetting.softProfileShortGoalRedAlarmTime = moment(new Date(enddatetime.getTime())).add(1, 'minutes').format('L LT');
                $scope.projectGlobalSetting.midGoalStartDate = moment(kendo.parseDate($scope.projectGlobalSetting.shortGoalEndDate)).format('L LT')
                $scope.projectGlobalSetting.midGoalEndDate = moment(kendo.parseDate($scope.projectGlobalSetting.midGoalStartDate)).add($scope.projectGlobalSetting.softProfileActualTimeSpan).format('L LT');
                var startdatetime = kendo.parseDate($scope.projectGlobalSetting.midGoalStartDate);
                var enddatetime = kendo.parseDate($scope.projectGlobalSetting.midGoalEndDate);
                var TotalDiffrence = enddatetime.getTime() - startdatetime.getTime();
                var greenAlarmAt = parseInt(TotalDiffrence * 0.20);
                var yellowAlarmAt = parseInt(TotalDiffrence * 0.60);
                var redAlarmAt = parseInt(TotalDiffrence * 0.90);
                $scope.projectGlobalSetting.softProfileMidGoalGreenAlarmTime = moment(new Date(startdatetime.getTime() + greenAlarmAt)).format('L LT');
                $scope.projectGlobalSetting.softProfileMidGoalYellowAlarmTime = moment(new Date(startdatetime.getTime() + yellowAlarmAt)).format('L LT');
                $scope.projectGlobalSetting.softProfileMidGoalRedAlarmTime = moment(new Date(enddatetime.getTime())).add(1, 'minutes').format('L LT');
                $scope.projectGlobalSetting.longTermGoalStartDate = moment(kendo.parseDate($scope.projectGlobalSetting.midGoalEndDate)).format('L LT')
                $scope.projectGlobalSetting.longTermGoalEndDate = moment(kendo.parseDate($scope.projectGlobalSetting.longTermGoalStartDate)).add($scope.projectGlobalSetting.softProfileActualTimeSpan).format('L LT');
                var startdatetime = kendo.parseDate($scope.projectGlobalSetting.longTermGoalStartDate);
                var enddatetime = kendo.parseDate($scope.projectGlobalSetting.longTermGoalEndDate);
                var TotalDiffrence = enddatetime.getTime() - startdatetime.getTime();
                var greenAlarmAt = parseInt(TotalDiffrence * 0.20);
                var yellowAlarmAt = parseInt(TotalDiffrence * 0.60);
                var redAlarmAt = parseInt(TotalDiffrence * 0.90);
                $scope.projectGlobalSetting.softProfileLongTermGoalGreenAlarmTime = moment(new Date(startdatetime.getTime() + greenAlarmAt)).format('L LT');
                $scope.projectGlobalSetting.softProfileLongTermGoalYellowAlarmTime = moment(new Date(startdatetime.getTime() + yellowAlarmAt)).format('L LT');
                $scope.projectGlobalSetting.softProfileLongTermGoalRedAlarmTime = moment(new Date(enddatetime.getTime())).add(1, 'minutes').format('L LT');
                $scope.projectGlobalSetting.finalGoalStartDate = moment(kendo.parseDate($scope.projectGlobalSetting.longTermGoalEndDate)).format('L LT');
                $scope.projectGlobalSetting.finalGoalEndDate = moment(kendo.parseDate($scope.projectGlobalSetting.finalGoalStartDate)).add($scope.projectGlobalSetting.softProfileActualTimeSpan).format('L LT');
                var startdatetime = kendo.parseDate($scope.projectGlobalSetting.finalGoalStartDate);
                var enddatetime = kendo.parseDate($scope.projectGlobalSetting.finalGoalEndDate);
                var TotalDiffrence = enddatetime.getTime() - startdatetime.getTime();
                var greenAlarmAt = parseInt(TotalDiffrence * 0.20);
                var yellowAlarmAt = parseInt(TotalDiffrence * 0.60);
                var redAlarmAt = parseInt(TotalDiffrence * 0.90);
                $scope.projectGlobalSetting.softProfileFinalGoalGreenAlarmTime = moment(new Date(startdatetime.getTime() + greenAlarmAt)).format('L LT');
                $scope.projectGlobalSetting.softProfileFinalGoalYellowAlarmTime = moment(new Date(startdatetime.getTime() + yellowAlarmAt)).format('L LT');
                $scope.projectGlobalSetting.softProfileFinalGoalRedAlarmTime = moment(new Date(enddatetime.getTime())).add(1, 'minutes').format('L LT');
            }
            $scope.changeKnowledgeProfileTimeSpan = function () {
                var newDate = kendo.parseDate($scope.project.expectedStartDate);
                var calculatedDate = moment(newDate).add({ months: $scope.projectGlobalSetting.knowledgeProfileMonthSpan, days: $scope.projectGlobalSetting.knowledgeProfileDaySpan + ($scope.projectGlobalSetting.knowledgeProfileWeekSpan * 7), hours: $scope.projectGlobalSetting.knowledgeProfileHourSpan, minutes: $scope.projectGlobalSetting.knowledgeProfileMinuteSpan });
                $scope.projectGlobalSetting.knowledgeProfileStartDate = moment(newDate).format('L LT')
                $scope.projectGlobalSetting.knowledgeProfileEndDate = moment(kendo.parseDate($scope.projectGlobalSetting.knowledgeProfileStartDate)).add($scope.projectGlobalSetting.knowledgeProfileActualTimeSpan).format('L LT');
                var startdatetime = kendo.parseDate($scope.projectGlobalSetting.knowledgeProfileStartDate);
                var enddatetime = kendo.parseDate($scope.projectGlobalSetting.knowledgeProfileEndDate);
                var TotalDiffrence = enddatetime.getTime() - startdatetime.getTime();
                var greenAlarmAt = parseInt(TotalDiffrence * 0.20);
                var yellowAlarmAt = parseInt(TotalDiffrence * 0.60);
                var redAlarmAt = parseInt(TotalDiffrence * 0.90);
                $scope.projectGlobalSetting.knowledgeProfileGreenAlarmTime = moment(new Date(startdatetime.getTime() + greenAlarmAt)).format('L LT');
                $scope.projectGlobalSetting.knowledgeProfileYellowAlarmTime = moment(new Date(startdatetime.getTime() + yellowAlarmAt)).format('L LT');
                $scope.projectGlobalSetting.knowledgeProfileRedAlarmTime = moment(new Date(enddatetime.getTime())).add(1, 'minutes').format('L LT');
            }
           

            $scope.goToNotificationTemplate = function (id) {
                if (id) {
                    var template = _.find(notificationTemplates, function (item) {
                        return item.id == id;
                    });
                    if (template) {
                        $location.path("/home/notificationTemplates/" + template.organizationId + "/edit/" + id);
                    }
                }
            }
            $scope.isDateTimeValid = function (date, isRequered) {
                if (isRequered) {
                    return datetimeCalculator.isValidDatePatern(date, 'L LT');
                } else {
                    return !date || datetimeCalculator.isValidDatePatern(date, 'L LT');
                }
            };

            $scope.checkChoseFromList = function (id, modelName, previous) {

                if (id == -1) {
                    var previousItem = (previous) ? parseInt(previous) : null;
                    var modalInstance = $modal.open({
                        animation: $scope.animationsEnabled,
                        templateUrl: 'views/profiles/stageGroups/views/notificationModal.html',
                        controller: 'NotificationModalCtrl',
                        controllerAs: 'modal',
                        size: 'lg',
                        resolve: {
                            previousItem: function () {
                                return previousItem;
                            }
                        }
                    });

                    modalInstance.result.then(function (selectedItem) {
                        setNotificationModel(modelName, selectedItem);
                    });
                }
            }

            $scope.StartDateOpen = function () {
                var datepicker = $(event.sender.element).data("kendoDateTimePicker");
                datepicker.setOptions({
                    min: kendo.parseDate(moment({ hour: 0, minute: -1, seconds: 0, milliseconds: 0 })._d)
                });
            }
            $scope.StartDateChange = function () {
                if (!(kendo.parseDate($scope.project.startDate) > kendo.parseDate($scope.project.endDate))) {
                    $scope.project.endDate = "";
                }
            };
            $scope.EndDateOpen = function (event) {
                var datepicker = $(event.sender.element).data("kendoDateTimePicker")
                datepicker.setOptions({
                    min: kendo.parseDate(moment({ hour: 0, minute: 0, seconds: 0, milliseconds: 0 })._d)
                });

            };
            $scope.currentStepIndex = 0;
            $scope.init = function () {
                $('#form_projectsetup_wizard').bootstrapWizard({
                    'nextSelector': '.button-next',
                    'previousSelector': '.button-previous',
                    onTabClick: function (tab, navigation, index, clickedIndex) {
                        if (clickedIndex == 1) {

                        }
                        else if (clickedIndex == 2) {

                        }
                        else if (clickedIndex == 3) {

                        }
                        else if (clickedIndex == 4) {
                        }
                        else {
                            $scope.handleTitle(tab, navigation, index);
                        }
                    },
                    onNext: function (tab, navigation, index) {
                        if (index == 1) {

                        }
                        else if (index == 2) {


                        }
                        else if (index == 3) {

                        }
                        else if (index == 4) {

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
                        $('#form_projectsetup_wizard').find('.progress-bar').css({
                            width: $percent + '%'
                        });
                        if (current == 3) {
                            $scope.setTimeSpan();
                            $scope.changeSoftProfileTimeSpan();
                            $scope.changeKnowledgeProfileTimeSpan();
                        }
                        if (current == 4) {
                            $scope.managers = [];
                            $scope.trainers = [];
                            _.forEach($scope.projectSteeringGroups, function (item) {
                                if (item.roleId == 5) {
                                    _.each(item.users, function (steeringGroupUser) {
                                        if (steeringGroupUser) {
                                            $scope.managers.push(steeringGroupUser);
                                        }
                                    })
                                }
                                if (item.roleId == 6) {
                                    _.each(item.users, function (steeringGroupUser) {
                                        if (steeringGroupUser) {
                                            $scope.trainers.push(steeringGroupUser);
                                        }
                                    })
                                }
                            });
                            if (!$scope.isEdit) {
                                $scope.changeSoftProfileTimeSpan();
                                $scope.changeKnowledgeProfileTimeSpan();
                            }
                        }
                        $scope.setIndex(navigation, current);
                    }
                });
            }
            if ($scope.isEdit) {
                _.each($scope.project.projectSteeringGroups, function (item) {
                    if (item.users.length > 0) {
                        item.roleId = item.users[0].roleId;
                    }
                    $scope.projectSteeringGroups.push(item);
                });
                _.each($scope.project.projectGoals, function (item) {
                    $scope.projectGoalStrategies.push(item);
                });
                if ($scope.project.projectGlobalSettings.length > 0) {
                    $scope.projectGlobalSetting = $scope.project.projectGlobalSettings[0];

                    if (!($scope.projectGlobalSetting.startStageEndDate)) {
                        $scope.changeSoftProfileTimeSpan();
                        $scope.changeKnowledgeProfileTimeSpan();
                    }
                    else {
                        $scope.projectGlobalSetting.startStageStartDate = moment(kendo.parseDate($scope.projectGlobalSetting.startStageStartDate)).format('L LT');
                        $scope.projectGlobalSetting.startStageEndDate = moment(kendo.parseDate($scope.projectGlobalSetting.startStageEndDate)).format('L LT');
                        $scope.projectGlobalSetting.shortGoalStartDate = moment(kendo.parseDate($scope.projectGlobalSetting.shortGoalStartDate)).format('L LT');
                        $scope.projectGlobalSetting.shortGoalEndDate = moment(kendo.parseDate($scope.projectGlobalSetting.shortGoalEndDate)).format('L LT');
                        $scope.projectGlobalSetting.midGoalStartDate = moment(kendo.parseDate($scope.projectGlobalSetting.midGoalStartDate)).format('L LT');
                        $scope.projectGlobalSetting.midGoalEndDate = moment(kendo.parseDate($scope.projectGlobalSetting.midGoalEndDate)).format('L LT');
                        $scope.projectGlobalSetting.longTermGoalStartDate = moment(kendo.parseDate($scope.projectGlobalSetting.longTermGoalStartDate)).format('L LT');
                        $scope.projectGlobalSetting.longTermGoalEndDate = moment(kendo.parseDate($scope.projectGlobalSetting.longTermGoalEndDate)).format('L LT');
                        $scope.projectGlobalSetting.finalGoalStartDate = moment(kendo.parseDate($scope.projectGlobalSetting.finalGoalStartDate)).format('L LT');
                        $scope.projectGlobalSetting.finalGoalEndDate = moment(kendo.parseDate($scope.projectGlobalSetting.finalGoalEndDate)).format('L LT');
                        $scope.projectGlobalSetting.knowledgeProfileStartDate = moment(kendo.parseDate($scope.projectGlobalSetting.knowledgeProfileStartDate)).format('L LT');
                        $scope.projectGlobalSetting.knowledgeProfileEndDate = moment(kendo.parseDate($scope.projectGlobalSetting.knowledgeProfileEndDate)).format('L LT');


                        $scope.projectGlobalSetting.softProfileStartGreenAlarmTime = moment(kendo.parseDate($scope.projectGlobalSetting.softProfileStartGreenAlarmTime)).format('L LT');
                        $scope.projectGlobalSetting.softProfileStartYellowAlarmTime = moment(kendo.parseDate($scope.projectGlobalSetting.softProfileStartYellowAlarmTime)).format('L LT');
                        $scope.projectGlobalSetting.softProfileStartRedAlarmTime = moment(kendo.parseDate($scope.projectGlobalSetting.softProfileStartRedAlarmTime)).format('L LT');
                        $scope.projectGlobalSetting.softProfileShortGoalGreenAlarmTime = moment(kendo.parseDate($scope.projectGlobalSetting.softProfileShortGoalGreenAlarmTime)).format('L LT');
                        $scope.projectGlobalSetting.softProfileShortGoalYellowAlarmTime = moment(kendo.parseDate($scope.projectGlobalSetting.softProfileShortGoalYellowAlarmTime)).format('L LT');
                        $scope.projectGlobalSetting.softProfileShortGoalRedAlarmTime = moment(kendo.parseDate($scope.projectGlobalSetting.softProfileShortGoalRedAlarmTime)).format('L LT');
                        $scope.projectGlobalSetting.softProfileMidGoalGreenAlarmTime = moment(kendo.parseDate($scope.projectGlobalSetting.softProfileMidGoalGreenAlarmTime)).format('L LT');
                        $scope.projectGlobalSetting.softProfileMidGoalYellowAlarmTime = moment(kendo.parseDate($scope.projectGlobalSetting.softProfileMidGoalYellowAlarmTime)).format('L LT');
                        $scope.projectGlobalSetting.softProfileMidGoalRedAlarmTime = moment(kendo.parseDate($scope.projectGlobalSetting.softProfileMidGoalRedAlarmTime)).format('L LT');
                        $scope.projectGlobalSetting.softProfileLongTermGoalGreenAlarmTime = moment(kendo.parseDate($scope.projectGlobalSetting.softProfileLongTermGoalGreenAlarmTime)).format('L LT');
                        $scope.projectGlobalSetting.softProfileLongTermGoalYellowAlarmTime = moment(kendo.parseDate($scope.projectGlobalSetting.softProfileLongTermGoalYellowAlarmTime)).format('L LT');
                        $scope.projectGlobalSetting.softProfileLongTermGoalRedAlarmTime = moment(kendo.parseDate($scope.projectGlobalSetting.softProfileLongTermGoalRedAlarmTime)).format('L LT');
                        $scope.projectGlobalSetting.softProfileFinalGoalGreenAlarmTime = moment(kendo.parseDate($scope.projectGlobalSetting.softProfileFinalGoalGreenAlarmTime)).format('L LT');
                        $scope.projectGlobalSetting.softProfileFinalGoalYellowAlarmTime = moment(kendo.parseDate($scope.projectGlobalSetting.softProfileFinalGoalYellowAlarmTime)).format('L LT');
                        $scope.projectGlobalSetting.softProfileFinalGoalRedAlarmTime = moment(kendo.parseDate($scope.projectGlobalSetting.softProfileFinalGoalRedAlarmTime)).format('L LT');

                        $scope.projectGlobalSetting.knowledgeProfileGreenAlarmTime = moment(kendo.parseDate($scope.projectGlobalSetting.knowledgeProfileGreenAlarmTime)).format('L LT');
                        $scope.projectGlobalSetting.knowledgeProfileYellowAlarmTime = moment(kendo.parseDate($scope.projectGlobalSetting.knowledgeProfileYellowAlarmTime)).format('L LT');
                        $scope.projectGlobalSetting.knowledgeProfileRedAlarmTime = moment(kendo.parseDate($scope.projectGlobalSetting.knowledgeProfileRedAlarmTime)).format('L LT');

                    }
                }
                else {
                    $scope.setDefaults();
                }
            }
            else {
                $scope.setDefaults();
            }

            $scope.next = function () {
                if ($scope.currentStepIndex == 1) {
                    if ((!$scope.formProjectSetup.$valid)) {
                        dialogService.showNotification($translate.instant('MYPROJECTS_PLEASE_FILL_ALL_THE_REQUIRED_FIELDS'), "error");
                        return false;
                    }
                    else {
                        $scope.currentStepIndex = 2;
                    }
                }
                else if ($scope.currentStepIndex == 2) {

                    if ((!$scope.formProjectMissionVisionSetup.$valid)) {
                        dialogService.showNotification($translate.instant('MYPROJECTS_PLEASE_FILL_ALL_THE_REQUIRED_FIELDS'), "error");
                        return false;
                    }
                    else if ((!$scope.projectGoalStrategies.length > 0)) {
                        dialogService.showNotification($translate.instant('MYPROJECTS_ADD_ATLEAST_ONE_GOAL_STRATEGY'), "error");
                        return false;
                    }
                    else {
                        $scope.currentStepIndex = 3;
                    }
                }
                else if ($scope.currentStepIndex == 3) {

                    if ($scope.projectSteeringGroups.length > 0) {
                        var hasError = false;
                        _.each($scope.projectSteeringGroups, function (projectSteeringGroupItem) {
                            if (!(projectSteeringGroupItem.users.length > 0)) {
                                dialogService.showNotification($translate.instant('MYPROJECTS_ADD_ATLEAST_ONE_MEMBER_IN') + " " + projectSteeringGroupItem.name + " " + $translate.instant('MYPROJECTS_STEERING_GROUP'), "error");
                                hasError = true;
                                return (false);
                            }
                        });
                        if (hasError) {
                            return false;
                        }
                        else {
                            $scope.currentStepIndex = 4;
                        }

                    }
                    else {
                        dialogService.showNotification($translate.instant('MYPROJECTS_ADD_ATLEAST_ONE_STEERING_GROUP'), "error");
                        return false;
                    }


                }
                else if ($scope.currentStepIndex == 4) {
                    if (!$scope.formGlobalSettingSetup.$valid) {
                        dialogService.showNotification($translate.instant('MYPROJECTS_PLEASE_SET_ALL_REQUIRED_SETTING'), "error");
                        return false;
                    }
                    else {
                        $scope.currentStepIndex = 5;
                    }
                }
                $scope.onTabShow();
            }
            $scope.back = function () {
                if ($scope.currentStepIndex > 1) {
                    $scope.currentStepIndex = $scope.currentStepIndex - 1;
                }
                //if ($scope.currentStepIndex == 2) {

                //    if ((!$scope.formProjectMissionVisionSetup.$valid)) {
                //        dialogService.showNotification($translate.instant('MYPROJECTS_PLEASE_FILL_ALL_THE_REQUIRED_FIELDS'), "error");
                //        return false;
                //    }
                //    else if ((!$scope.projectGoalStrategies.length > 0)) {
                //        dialogService.showNotification($translate.instant('MYPROJECTS_ADD_ATLEAST_ONE_GOAL_STRATEGY'), "error");
                //        return false;
                //    }
                //    else {
                //        $scope.currentStepIndex = 1;
                //    }
                //}
                //else if ($scope.currentStepIndex == 3) {

                //    if ($scope.projectSteeringGroups.length > 0) {
                //        var hasError = false;
                //        _.each($scope.projectSteeringGroups, function (projectSteeringGroupItem) {
                //            if (!(projectSteeringGroupItem.users.length > 0)) {
                //                dialogService.showNotification($translate.instant('MYPROJECTS_ADD_ATLEAST_ONE_MEMBER_IN') + " " + projectSteeringGroupItem.name + " " + $translate.instant('MYPROJECTS_STEERING_GROUP'), "error");
                //                hasError = true;
                //                return (false);
                //            }
                //        });
                //        if (hasError) {
                //            return false;
                //        }
                //        else {
                //            $scope.currentStepIndex = 2;
                //        }

                //    }
                //    else {
                //        dialogService.showNotification($translate.instant('MYPROJECTS_ADD_ATLEAST_ONE_STEERING_GROUP'), "error");
                //        return false;
                //    }


                //}
                //else if ($scope.currentStepIndex == 4) {
                //    if (!$scope.formGlobalSettingSetup.$valid) {
                //        dialogService.showNotification($translate.instant('MYPROJECTS_PLEASE_SET_ALL_REQUIRED_SETTING'), "error");
                //        return false;
                //    }
                //    else {
                //        $scope.currentStepIndex = 3;
                //    }
                //}
                //else if ($scope.currentStepIndex == 5) {
                //    $scope.currentStepIndex = 4;
                //}
                $scope.onTabShow();
            }
            $scope.tabClick = function (clickedIndex) {
                if (clickedIndex > $scope.currentStepIndex) {
                    if ($scope.currentStepIndex == 1) {
                        if ((!$scope.formProjectSetup.$valid)) {
                            dialogService.showNotification($translate.instant('MYPROJECTS_PLEASE_FILL_ALL_THE_REQUIRED_FIELDS'), "error");
                            return false;
                        }
                    }
                    else if ($scope.currentStepIndex == 2) {
                        if ((!$scope.formProjectMissionVisionSetup.$valid)) {
                            dialogService.showNotification($translate.instant('MYPROJECTS_PLEASE_FILL_ALL_THE_REQUIRED_FIELDS'), "error");
                            return false;
                        }
                        else if ((!$scope.projectGoalStrategies.length > 0)) {
                            dialogService.showNotification($translate.instant('MYPROJECTS_ADD_ATLEAST_ONE_GOAL_STRATEGY'), "error");
                            return false;
                        }

                    }
                    else if ($scope.currentStepIndex == 3) {
                        if ($scope.projectSteeringGroups.length > 0) {
                            var hasError = false;
                            _.each($scope.projectSteeringGroups, function (projectSteeringGroupItem) {
                                if (!(projectSteeringGroupItem.users.length > 0)) {
                                    dialogService.showNotification($translate.instant('MYPROJECTS_ADD_ATLEAST_ONE_MEMBER_IN') + " " + projectSteeringGroupItem.name + " " + $translate.instant('MYPROJECTS_STEERING_GROUP'), "error");
                                    hasError = true;
                                    return (false);
                                }
                            });
                            if (hasError) {
                                return false;
                            }
                        }
                        else {
                            dialogService.showNotification($translate.instant('MYPROJECTS_ADD_ATLEAST_ONE_STEERING_GROUP'), "error");
                            return false;
                        }
                    }
                    else if ($scope.currentStepIndex == 4) {
                        if (!$scope.formGlobalSettingSetup.$valid) {
                            dialogService.showNotification($translate.instant('MYPROJECTS_PLEASE_SET_ALL_REQUIRED_SETTING'), "error");
                            return false;
                        }
                    }
                    $scope.currentStepIndex = clickedIndex;
                    $scope.onTabShow();
                }
                else {
                    $scope.currentStepIndex = clickedIndex;
                    $scope.onTabShow();
                }
            }
            $scope.onTabShow = function () {
                var current = $scope.currentStepIndex;
                if (current == 3) {
                    $scope.setTimeSpan();
                    $scope.changeSoftProfileTimeSpan();
                    $scope.changeKnowledgeProfileTimeSpan();
                }
                if (current == 4) {
                    $scope.managers = [];
                    $scope.trainers = [];
                    _.forEach($scope.projectSteeringGroups, function (item) {
                        if (item.roleId == 5) {
                            _.each(item.users, function (steeringGroupUser) {
                                if (steeringGroupUser) {
                                    $scope.managers.push(steeringGroupUser);
                                }
                            })
                            //item.users = $scope.steeringGroupDetail.users;
                        }
                        if (item.roleId == 6) {
                            _.each(item.users, function (steeringGroupUser) {
                                if (steeringGroupUser) {
                                    $scope.trainers.push(steeringGroupUser);
                                }
                            })
                        }
                    });
                    if (!$scope.isEdit) {
                        $scope.changeSoftProfileTimeSpan();
                        $scope.changeKnowledgeProfileTimeSpan();
                    }
                }
                if (current == 5) {
                    $scope.project.projectSteeringGroups = $scope.projectSteeringGroups;
                    $scope.project.projectGoals = $scope.projectGoalStrategies;
                }
                var tabId = $(".wizardStep[data-step='" + $scope.currentStepIndex + "']").data("target");
                if (tabId) {
                    if ($(tabId).length > 0) {
                        $(".wizardStep.active").removeClass("active");
                        $(".wizard.tab-pane.active").removeClass("active");
                        $(".wizardStep[data-step=" + $scope.currentStepIndex + "]").addClass("active");
                        $(tabId).addClass("active");
                    }
                    //$scope.setIndex(navigation, current);
                }
            }
            $scope.isLocked = function () {
                return true;
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
                    $('#form_projectsetup_wizard').find('.button-previous').hide();
                } else {
                    $scope.currentStepIndex = current;
                    $('#form_projectsetup_wizard').find('.button-previous').show();


                }
                if (current >= total) {
                    $('#form_projectsetup_wizard').find('.button-next').hide();
                    $('#form_projectsetup_wizard').find('.button-submit').show();

                } else {
                    $('#form_projectsetup_wizard').find('.button-next').show();
                    $('#form_projectsetup_wizard').find('.button-submit').hide();
                }

            }

            $scope.setIndex = function (navigation, current) {
                var total = navigation.find('li').length;
                $scope.currentStepIndex = current;
                if (current == 1) {
                    $scope.currentStepIndex = 1;
                    $('#form_projectsetup_wizard').find('.button-previous').hide();
                } else {
                    $scope.currentStepIndex = current;
                    $('#form_projectsetup_wizard').find('.button-previous').show();
                }
                if (current >= total) {
                    $('#form_projectsetup_wizard').find('.button-next').hide();
                    $('#form_projectsetup_wizard').find('.button-submit').show();
                    $scope.project.projectSteeringGroups = $scope.projectSteeringGroups;
                    $scope.project.projectGoals = $scope.projectGoalStrategies;
                } else {
                    $('#form_projectsetup_wizard').find('.button-next').show();
                    $('#form_projectsetup_wizard').find('.button-submit').hide();
                }
            }
            $scope.isFormContinueDisabled = function () {
                if ($scope.currentStepIndex == 1) {
                    if ((!$scope.formProjectSetup.$valid)) {
                        return true;
                    }

                }
                if ($scope.currentStepIndex == 2) {
                    if ((!$scope.projectGoalStrategies.length > 0)) {
                        return true;
                    }
                }
                if ($scope.currentStepIndex == 3) {
                    if (!$scope.projectSteeringGroups.length > 0) {
                        return true;
                    }
                    else {
                        _.each($scope.projectSteeringGroups, function (projectSteeringGroupItem) {
                            if (!(projectSteeringGroupItem.users.length > 0)) {
                                return true;
                                return (false);
                            }
                        });
                    }

                }
                return false;
            }

            $scope.isFormContinueDisabledClass = function () {
                if ($scope.currentStepIndex == 1) {
                    if (!($scope.formProjectSetup.$valid)) {
                        return "btn-cstm";
                    }

                }
                if ($scope.currentStepIndex == 2) {

                    if (!$scope.projectGoalStrategies.length > 0) {
                        return "btn-cstm";
                    }


                }
                if ($scope.currentStepIndex == 3) {
                    if (!$scope.projectSteeringGroups.length > 0) {
                        return "btn-cstm";
                    }
                    _.each($scope.projectSteeringGroups, function (projectSteeringGroupItem) {
                        if (!(projectSteeringGroupItem.users.length > 0)) {
                            return "btn-cstm";
                            return (false);
                        }
                    });
                }

                return "green";
            }
            $scope.steeringGroupUserCustomTexts = { buttonDefaultText: $translate.instant('MYPROJECTS_SELECT_USERS') };
            $scope.steeringGroupUserModel = [];
            $scope.steeringGroupUsers = [];//[{ id: 1, firstName: "User", lastName: "1", roleName: "" }, { id: 2, firstName: "User", lastName: "2", roleName: "" }, { id: 3, firstName: "User", lastName: "3", roleName: "" }, { id: 4, firstName: "User", lastName: "4", roleName: "" }, { id: 5, firstName: "User", lastName: "5", roleName: "" }]
            $scope.steeringGroupUsersOptions = getMultiSelectOptions($scope.steeringGroupUsers);
            $scope.smartButtonSettings = {
                smartButtonMaxItems: 3,
                smartButtonTextConverter: function (itemText, originalItem) {
                    return itemText;
                },
                template: '<b>{{option.label}}</b>'
            };
            $scope.steeringGroupUsersButtonSettings = {
                smartButtonMaxItems: 2,
                smartButtonTextConverter: function (itemText, originalItem) {
                    return itemText;
                },
                itemTemplate: '<b>{{option.label}}</b>'
            };
            $scope.steeringGroupUsersEvents = {
                onItemSelect: function (item) {
                    steeringGroupUsersChanged();
                },
                onItemDeselect: function (item) {
                    steeringGroupUsersChanged();
                },
                onSelectAll: function () {
                    //$scope.steeringGroupUserModel = getKendoMultiSelectAllModel($scope.filter.mainEvaluatorsOptions);
                    steeringGroupUsersChanged();
                },
                onDeselectAll: function () {
                    $scope.steeringGroupUserModel = [];
                    steeringGroupUsersChanged();
                }
            };
            function getMultiSelectOptions(data) {
                var options = [];
                _.forEach(data, function (item, index) {
                    options.push({ id: item.id, label: item.firstName + " " + item.lastName });
                });
                return options;
            }
            function steeringGroupUsersChanged() {
            };
            $scope.setTimeSpan = function () {
                var diffTime = null;
                var a = moment(kendo.parseDate($scope.project.expectedEndDate));
                var b = moment(kendo.parseDate($scope.project.expectedStartDate));
                // For Knowledge Profile
                diffTime = a.diff(b);
                var duration = moment.duration(diffTime);
                $scope.projectGlobalSetting.knowledgeProfileActualTimeSpan = diffTime,
                    $scope.projectGlobalSetting.knowledgeProfileMonthSpan = duration.months();
                $scope.projectGlobalSetting.knowledgeProfileWeekSpan = 0; // duration.weeks();
                $scope.projectGlobalSetting.knowledgeProfileDaySpan = duration.days();
                if ($scope.projectGlobalSetting.knowledgeProfileWeekSpan > 0) {
                    $scope.projectGlobalSetting.knowledgeProfileDaySpan = $scope.projectGlobalSetting.knowledgeProfileDaySpan - ($scope.projectGlobalSetting.knowledgeProfileWeekSpan * 7);
                }
                if (duration.years() > 0) {
                    $scope.projectGlobalSetting.knowledgeProfileMonthSpan = $scope.projectGlobalSetting.knowledgeProfileMonthSpan + (duration.years() * 12);
                }

                $scope.projectGlobalSetting.knowledgeProfileHourSpan = duration.hours();
                $scope.projectGlobalSetting.knowledgeProfileMinuteSpan = duration.minutes();


                // For Soft Profile   
                diffTime = a.diff(b) / 5 // 1
                duration = moment.duration(diffTime);
                $scope.projectGlobalSetting.softProfileActualTimeSpan = diffTime,
                    $scope.projectGlobalSetting.softProfileMonthSpan = duration.months();
                $scope.projectGlobalSetting.softProfileWeekSpan = duration.weeks();
                $scope.projectGlobalSetting.softProfileDaySpan = duration.days();
                if ($scope.projectGlobalSetting.softProfileWeekSpan > 0) {
                    $scope.projectGlobalSetting.softProfileDaySpan = $scope.projectGlobalSetting.softProfileDaySpan - ($scope.projectGlobalSetting.softProfileWeekSpan * 7);
                }
                if (duration.years() > 0) {
                    $scope.projectGlobalSetting.softProfileMonthSpan = $scope.projectGlobalSetting.softProfileMonthSpan + (duration.years() * 12);
                }
                $scope.projectGlobalSetting.softProfileHourSpan = duration.hours();
                $scope.projectGlobalSetting.softProfileMinuteSpan = duration.minutes();

            }
            //handler popover close
            $('[data-toggle="m-popover"]').popover({
                placement: 'bottom',
                html: 'true',
                title: '<span class="text-info"><strong>Info</strong></span> <i class="fa fa-close pull-right"></i>',
                content: 'test'
            })
            $(document).on("click", ".popover .fa-close", function () {
                $(this).parents(".popover").popover('hide');
            });
        }])

    .controller('ProjectsCtrl', ['$scope', '$location', 'authService', '$window', '$rootScope', 'cssInjector', 'projectsManager', 'organizations', 'projectRoles', 'dialogService', 'project', '$stateParams', 'localStorageService', 'projectPhasesEnum', 'phasesLevelEnum', 'notificationTemplates', '$modal', 'datetimeCalculator', 'durationMetrics', 'templateTypeEnum', 'stageTypesEnum', 'evaluationRolesEnum', '$translate', 'profilesTypesEnum',
        function ($scope, $location, authService, $window, $rootScope, cssInjector, projectsManager, organizations, projectRoles, dialogService, project, $stateParams, localStorageService, projectPhasesEnum, phasesLevelEnum, notificationTemplates, $modal, datetimeCalculator, durationMetrics, templateTypeEnum, stageTypesEnum, evaluationRolesEnum, $translate, profilesTypesEnum) {
            cssInjector.removeAll();
            cssInjector.add('views/profiles/new-soft-profile.css');
            //cssInjector.add('css/components.min.css');
            //cssInjector.add('css/default.min.css');
            cssInjector.add('views/projects/new-project.css');
            //cssInjector.add('views/projects/projects.css');
            //cssInjector.add('views/softprofilewizard/softprofilewizard.css');
            $scope.organizations = organizations;
            $scope.projectRoles = projectRoles;
            $scope.notificationTemplates = notificationTemplates;
            $scope.isEdit = $stateParams.id > 0 ? true : false;
            $scope.project = project;
            $scope.durationMetrics = durationMetrics;
            $scope.projectGlobalSetting = {
                id: 0,
                projectId: 0,
                softProfileMonthSpan: 0,
                softProfileWeekSpan: 6,
                softProfileDaySpan: 0,
                softProfileHourSpan: 0,
                softProfileMinuteSpan: 0,
                softProfileRecurrentTrainingTimeSpan: "FREQ=WEEKLY;BYDAY=FR;WKST=SU",
                knowledgeProfileMonthSpan: 0,
                knowledgeProfileWeekSpan: 6,
                knowledgeProfileDaySpan: 0,
                knowledgeProfileHourSpan: 0,
                knowledgeProfileMinuteSpan: 0,
                knowledgeProfileRecurrentTrainingTimeSpan: "FREQ=WEEKLY;BYDAY=FR;WKST=SU",
                //Notifications -Start 
                softProfileStartEmailNotification: true,
                softProfileStartSmsNotification: false,
                softProfileStartExternalStartNotificationTemplateId: null,
                softProfileStartEvaluatorStartNotificationTemplateId: null,
                softProfileStartTrainerStartNotificationTemplateId: null,
                softProfileStartManagerStartNotificationTemplateId: null,
                softProfileStartFinalScoreManagerStartNotificationTemplateId: null,
                softProfileStartProjectManagerStartNotificationTemplateId: null,
                softProfileStartExternalCompletedNotificationTemplateId: null,
                softProfileStartEvaluatorCompletedNotificationTemplateId: null,
                softProfileStartTrainerCompletedNotificationTemplateId: null,
                softProfileStartManagerCompletedNotificationTemplateId: null,
                softProfileStartFinalScoreManagerCompletedNotificationTemplateId: null,
                softProfileStartProjectManagerCompletedNotificationTemplateId: null,

                softProfileStartExternalResultsNotificationTemplateId: null,
                softProfileStartEvaluatorResultsNotificationTemplateId: null,
                softProfileStartTrainerResultsNotificationTemplateId: null,
                softProfileStartManagerResultsNotificationTemplateId: null,
                softProfileStartFinalScoreManagerResultsNotificationTemplateId: null,
                softProfileStartProjectManagerResultsNotificationTemplateId: null,
                //Alarms
                softProfileStartGreenAlarmParticipantTemplateId: null,
                softProfileStartGreenAlarmEvaluatorTemplateId: null,
                softProfileStartGreenAlarmManagerTemplateId: null,
                softProfileStartGreenAlarmTrainerTemplateId: null,
                softProfileStartGreenAlarmFinalScoreManagerTemplateId: null,
                softProfileStartGreenAlarmProjectManagerTemplateId: null,

                softProfileStartYellowAlarmParticipantTemplateId: null,
                softProfileStartYellowAlarmEvaluatorTemplateId: null,
                softProfileStartYellowAlarmManagerTemplateId: null,
                softProfileStartYellowAlarmTrainerTemplateId: null,
                softProfileStartYellowAlarmFinalScoreManagerTemplateId: null,
                softProfileStartYellowAlarmProjectManagerTemplateId: null,
                softProfileStartRedAlarmParticipantTemplateId: null,
                softProfileStartRedAlarmEvaluatorTemplateId: null,
                softProfileStartRedAlarmManagerTemplateId: null,
                softProfileStartRedAlarmTrainerTemplateId: null,
                softProfileStartRedAlarmFinalScoreManagerTemplateId: null,
                softProfileStartRedAlarmProjectManagerTemplateId: null,
                //Notifications - Short
                softProfileShortGoalEmailNotification: true,
                softProfileShortGoalSmsNotification: false,
                softProfileShortGoalExternalStartNotificationTemplateId: null,
                softProfileShortGoalEvaluatorStartNotificationTemplateId: null,
                softProfileShortGoalTrainerStartNotificationTemplateId: null,
                softProfileShortGoalManagerStartNotificationTemplateId: null,
                softProfileShortGoalExternalCompletedNotificationTemplateId: null,
                softProfileShortGoalEvaluatorCompletedNotificationTemplateId: null,
                softProfileShortGoalTrainerCompletedNotificationTemplateId: null,
                softProfileShortGoalManagerCompletedNotificationTemplateId: null,
                softProfileShortGoalExternalResultsNotificationTemplateId: null,
                softProfileShortGoalEvaluatorResultsNotificationTemplateId: null,
                softProfileShortGoalTrainerResultsNotificationTemplateId: null,
                softProfileShortGoalManagerResultsNotificationTemplateId: null,
                //Alarms
                softProfileShortGoalGreenAlarmParticipantTemplateId: null,
                softProfileShortGoalGreenAlarmEvaluatorTemplateId: null,
                softProfileShortGoalGreenAlarmManagerTemplateId: null,
                softProfileShortGoalGreenAlarmTrainerTemplateId: null,
                softProfileShortGoalYellowAlarmParticipantTemplateId: null,
                softProfileShortGoalYellowAlarmEvaluatorTemplateId: null,
                softProfileShortGoalYellowAlarmManagerTemplateId: null,
                softProfileShortGoalYellowAlarmTrainerTemplateId: null,
                softProfileShortGoalRedAlarmParticipantTemplateId: null,
                softProfileShortGoalRedAlarmEvaluatorTemplateId: null,
                softProfileShortGoalRedAlarmManagerTemplateId: null,
                softProfileShortGoalRedAlarmTrainerTemplateId: null,


                //Notifications - Long
                softProfileMidGoalEmailNotification: true,
                softProfileMidGoalSmsNotification: false,
                softProfileMidGoalExternalStartNotificationTemplateId: null,
                softProfileMidGoalEvaluatorStartNotificationTemplateId: null,
                softProfileMidGoalTrainerStartNotificationTemplateId: null,
                softProfileMidGoalManagerStartNotificationTemplateId: null,
                softProfileMidGoalExternalCompletedNotificationTemplateId: null,
                softProfileMidGoalEvaluatorCompletedNotificationTemplateId: null,
                softProfileMidGoalTrainerCompletedNotificationTemplateId: null,
                softProfileMidGoalManagerCompletedNotificationTemplateId: null,
                softProfileMidGoalExternalResultsNotificationTemplateId: null,
                softProfileMidGoalEvaluatorResultsNotificationTemplateId: null,
                softProfileMidGoalTrainerResultsNotificationTemplateId: null,
                softProfileMidGoalManagerResultsNotificationTemplateId: null,
                //Alarms
                softProfileMidGoalGreenAlarmParticipantTemplateId: null,
                softProfileMidGoalGreenAlarmEvaluatorTemplateId: null,
                softProfileMidGoalGreenAlarmManagerTemplateId: null,
                softProfileMidGoalGreenAlarmTrainerTemplateId: null,
                softProfileMidGoalYellowAlarmParticipantTemplateId: null,
                softProfileMidGoalYellowAlarmEvaluatorTemplateId: null,
                softProfileMidGoalYellowAlarmManagerTemplateId: null,
                softProfileMidGoalYellowAlarmTrainerTemplateId: null,
                softProfileMidGoalRedAlarmParticipantTemplateId: null,
                softProfileMidGoalRedAlarmEvaluatorTemplateId: null,
                softProfileMidGoalRedAlarmManagerTemplateId: null,
                softProfileMidGoalRedAlarmTrainerTemplateId: null,


                //Notifications
                softProfileLongTermGoalEmailNotification: true,
                softProfileLongTermGoalSmsNotification: false,
                softProfileLongTermGoalExternalStartNotificationTemplateId: null,
                softProfileLongTermGoalEvaluatorStartNotificationTemplateId: null,
                softProfileLongTermGoalTrainerStartNotificationTemplateId: null,
                softProfileLongTermGoalManagerStartNotificationTemplateId: null,
                softProfileLongTermGoalExternalCompletedNotificationTemplateId: null,
                softProfileLongTermGoalEvaluatorCompletedNotificationTemplateId: null,
                softProfileLongTermGoalTrainerCompletedNotificationTemplateId: null,
                softProfileLongTermGoalManagerCompletedNotificationTemplateId: null,
                softProfileLongTermGoalExternalResultsNotificationTemplateId: null,
                softProfileLongTermGoalEvaluatorResultsNotificationTemplateId: null,
                softProfileLongTermGoalTrainerResultsNotificationTemplateId: null,
                softProfileLongTermGoalManagerResultsNotificationTemplateId: null,
                //Alarms
                softProfileLongTermGoalGreenAlarmParticipantTemplateId: null,
                softProfileLongTermGoalGreenAlarmEvaluatorTemplateId: null,
                softProfileLongTermGoalGreenAlarmManagerTemplateId: null,
                softProfileLongTermGoalGreenAlarmTrainerTemplateId: null,
                softProfileLongTermGoalYellowAlarmParticipantTemplateId: null,
                softProfileLongTermGoalYellowAlarmEvaluatorTemplateId: null,
                softProfileLongTermGoalYellowAlarmManagerTemplateId: null,
                softProfileLongTermGoalYellowAlarmTrainerTemplateId: null,
                softProfileLongTermGoalRedAlarmParticipantTemplateId: null,
                softProfileLongTermGoalRedAlarmEvaluatorTemplateId: null,
                softProfileLongTermGoalRedAlarmManagerTemplateId: null,
                softProfileLongTermGoalRedAlarmTrainerTemplateId: null,

                //Notifications
                softProfileFinalGoalEmailNotification: true,
                softProfileFinalGoalSmsNotification: false,
                softProfileFinalGoalExternalStartNotificationTemplateId: null,
                softProfileFinalGoalEvaluatorStartNotificationTemplateId: null,
                softProfileFinalGoalTrainerStartNotificationTemplateId: null,
                softProfileFinalGoalManagerStartNotificationTemplateId: null,
                softProfileFinalGoalExternalCompletedNotificationTemplateId: null,
                softProfileFinalGoalEvaluatorCompletedNotificationTemplateId: null,
                softProfileFinalGoalTrainerCompletedNotificationTemplateId: null,
                softProfileFinalGoalManagerCompletedNotificationTemplateId: null,
                softProfileFinalGoalExternalResultsNotificationTemplateId: null,
                softProfileFinalGoalEvaluatorResultsNotificationTemplateId: null,
                softProfileFinalGoalTrainerResultsNotificationTemplateId: null,
                softProfileFinalGoalManagerResultsNotificationTemplateId: null,
                //Alarms
                softProfileFinalGoalGreenAlarmParticipantTemplateId: null,
                softProfileFinalGoalGreenAlarmEvaluatorTemplateId: null,
                softProfileFinalGoalGreenAlarmManagerTemplateId: null,
                softProfileFinalGoalGreenAlarmTrainerTemplateId: null,
                softProfileFinalGoalYellowAlarmParticipantTemplateId: null,
                softProfileFinalGoalYellowAlarmEvaluatorTemplateId: null,
                softProfileFinalGoalYellowAlarmManagerTemplateId: null,
                softProfileFinalGoalYellowAlarmTrainerTemplateId: null,
                softProfileFinalGoalRedAlarmParticipantTemplateId: null,
                softProfileFinalGoalRedAlarmEvaluatorTemplateId: null,
                softProfileFinalGoalRedAlarmManagerTemplateId: null,
                softProfileFinalGoalRedAlarmTrainerTemplateId: null,

                //Notifications
                knowledgeProfileEmailNotification: true,
                knowledgeProfileSmsNotification: false,
                knowledgeProfileExternalStartNotificationTemplateId: null,
                knowledgeProfileEvaluatorStartNotificationTemplateId: null,
                knowledgeProfileTrainerStartNotificationTemplateId: null,
                knowledgeProfileFinalScoreManagerStartNotificationTemplateId: null,
                knowledgeProfileProjectManagerStartNotificationTemplateId: null,
                knowledgeProfileManagerStartNotificationTemplateId: null,
                knowledgeProfileExternalCompletedNotificationTemplateId: null,
                knowledgeProfileEvaluatorCompletedNotificationTemplateId: null,
                knowledgeProfileTrainerCompletedNotificationTemplateId: null,
                knowledgeProfileManagerCompletedNotificationTemplateId: null,
                knowledgeProfileFinalScoreManagerCompletedNotificationTemplateId: null,
                knowledgeProfileProjectManagerCompletedNotificationTemplateId: null,

                knowledgeProfileExternalResultsNotificationTemplateId: null,
                knowledgeProfileEvaluatorResultsNotificationTemplateId: null,
                knowledgeProfileTrainerResultsNotificationTemplateId: null,
                knowledgeProfileManagerResultsNotificationTemplateId: null,
                knowledgeProfileFinalScoreManagerResultsNotificationTemplateId: null,
                knowledgeProfileProjectManagerResultsNotificationTemplateId: null,

                //Alarms
                knowledgeProfileGreenAlarmParticipantTemplateId: null,
                knowledgeProfileGreenAlarmEvaluatorTemplateId: null,
                knowledgeProfileGreenAlarmManagerTemplateId: null,
                knowledgeProfileGreenAlarmFinalScoreManagerTemplateId: null,
                knowledgeProfileGreenAlarmProjectManagerTemplateId: null,
                knowledgeProfileGreenAlarmTrainerTemplateId: null,
                knowledgeProfileYellowAlarmParticipantTemplateId: null,
                knowledgeProfileYellowAlarmEvaluatorTemplateId: null,
                knowledgeProfileYellowAlarmManagerTemplateId: null,
                knowledgeProfileYellowAlarmFinalScoreManagerTemplateId: null,
                knowledgeProfileYellowAlarmProjectManagerTemplateId: null,
                knowledgeProfileYellowAlarmTrainerTemplateId: null,
                knowledgeProfileRedAlarmParticipantTemplateId: null,
                knowledgeProfileRedAlarmEvaluatorTemplateId: null,
                knowledgeProfileRedAlarmManagerTemplateId: null,
                knowledgeProfileRedAlarmFinalScoreManagerTemplateId: null,
                knowledgeProfileRedAlarmProjectManagerTemplateId: null,
                knowledgeProfileRedAlarmTrainerTemplateId: null,
                softProfileHowMany: 30,
                softProfileMetricId: 3,
                softProfileHowManySets: 1,
                softProfileHowManyActions: 1,
                knowledgeProfileHowMany: 30,
                knowledgeProfileMetricId: 3,
                knowledgeProfileHowManySets: 1,
                knowledgeProfileHowManyActions: 1,
                softProfilePersonalTrainingReminderNotificationTemplateId: null,
                softProfileProfileTrainingReminderNotificationTemplateId: null,
                knowledgeProfilePersonalTrainingReminderNotificationTemplateId: null,
                knowledgeProfileProfileTrainingReminderNotificationTemplateId: null,

                startStageStartDate: null,
                startStageEndDate: null,
                shortGoalStartDate: null,
                shortGoalEndDate: null,
                midGoalStartDate: null,
                midGoalEndDate: null,
                longTermGoalStartDate: null,
                longTermGoalEndDate: null,
                finalGoalStartDate: null,
                finalGoalEndDate: null,
                knowledgeProfileStartDate: null,
                knowledgeProfileEndDate: null,
                trainerId: null,
                managerId: null,
                softProfileStartGreenAlarmTime: null,
                softProfileStartYellowAlarmTime: null,
                softProfileStartRedAlarmTime: null,
                softProfileShortGoalGreenAlarmTime: null,
                softProfileShortGoalYellowAlarmTime: null,
                softProfileShortGoalRedAlarmTime: null,
                softProfileMidGoalGreenAlarmTime: null,
                softProfileMidGoalYellowAlarmTime: null,
                softProfileMidGoalRedAlarmTime: null,
                softProfileLongTermGoalGreenAlarmTime: null,
                softProfileLongTermGoalYellowAlarmTime: null,
                softProfileLongTermGoalRedAlarmTime: null,
                softProfileFinalGoalGreenAlarmTime: null,
                softProfileFinalGoalYellowAlarmTime: null,
                softProfileFinalGoalRedAlarmTime: null,
                knowledgeProfileGreenAlarmTime: null,
                knowledgeProfileYellowAlarmTime: null,
                knowledgeProfileRedAlarmTime: null

            }
            $scope.projectDefaultNotificationSettings = {
                id: 0,
                evaluatorsCompletedNotificationId: null,
                evaluatorsResultNotificationId: null,
                evaluatorsStartNotificationId: null,
                evaluatorGreenNotificationId: null,
                evaluatorRedNotificationId: null,
                evaluatorYellowNotificationId: null,
                finalScoreManagersCompletedNotificationId: null,
                finalScoreManagersGreenNotificationId: null,
                finalScoreManagersRedNotificationId: null,
                finalScoreManagersResultNotificationId: null,
                finalScoreManagersStartNotificationId: null,
                finalScoreManagersYellowNotificationId: null,
                greenAlarmBefore: null,
                managerGreenNotificationId: null,
                managerRedNotificationId: null,
                managerYellowNotificationId: null,
                managersCompletedNotificationId: null,
                managersResultNotificationId: null,
                managersStartNotificationId: null,
                participantGreenNotificationId: null,
                participantRedNotificationId: null,
                participantYellowNotificationId: null,
                participantsCompletedNotificationId: null,
                participantsResultNotificationId: null,
                participantsStartNotificationId: null,
                projectManagersCompletedNotificationId: null,
                projectManagersGreenNotificationId: null,
                projectManagersRedNotificationId: null,
                projectManagersResultNotificationId: null,
                projectManagersStartNotificationId: null,
                projectManagersYellowNotificationId: null,
                redAlarmBefore: null,
                trainerGreenNotificationId: null,
                trainerRedNotificationId: null,
                trainerYellowNotificationId: null,
                trainersCompletedNotificationId: null,
                trainersResultNotificationId: null,
                trainersStartNotificationId: null,
                yellowAlarmBefore: null,
            };



            $scope.users = [];

            $scope.projectPhasesEnum = projectPhasesEnum;
            $scope.phasesLevelEnum = phasesLevelEnum;
            $scope.projectSteeringGroups = [];
            $scope.projectGoalStrategies = [];
            $scope.setDefaults = function () {
                if ($scope.projectGlobalSetting) {
                    $scope.projectGlobalSetting.softProfileStartEmailNotification = true;
                    $scope.projectGlobalSetting.softProfileStartSmsNotification = false;
                    //$scope.projectGlobalSetting.softProfileStartExternalStartNotificationTemplateId = 78;
                    var participantStartNotification = _.filter(notificationTemplates, function (item) {
                        return item.evaluationRoleId == evaluationRolesEnum.participant && item.notificationTemplateTypeId == templateTypeEnum.MilestoneStartNotification && item.stageTypeId == stageTypesEnum.StartProfile && item.profileTypeId == profilesTypesEnum.soft && item.isDefualt == true ;
                    });
                    if (participantStartNotification.length > 0) {
                        $scope.projectGlobalSetting.softProfileStartExternalStartNotificationTemplateId = participantStartNotification[0].id;
                    }



                    //$scope.projectGlobalSetting.softProfileStartEvaluatorStartNotificationTemplateId = 20;
                    var evaluatorStartNotification = _.filter(notificationTemplates, function (item) {
                        return item.evaluationRoleId == evaluationRolesEnum.evaluator && item.notificationTemplateTypeId == templateTypeEnum.MilestoneStartNotification && item.stageTypeId == stageTypesEnum.StartProfile && item.profileTypeId == profilesTypesEnum.soft  && item.isDefualt == true
                    });
                    if (evaluatorStartNotification.length > 0) {
                        $scope.projectGlobalSetting.softProfileStartEvaluatorStartNotificationTemplateId = evaluatorStartNotification[0].id;
                    }

                    var trainerStartNotification = _.filter(notificationTemplates, function (item) {
                        return item.evaluationRoleId == evaluationRolesEnum.trainer && item.notificationTemplateTypeId == templateTypeEnum.MilestoneStartNotification && item.stageTypeId == stageTypesEnum.StartProfile && item.profileTypeId == profilesTypesEnum.soft  && item.isDefualt == true
                    });
                    if (trainerStartNotification.length > 0) {
                        $scope.projectGlobalSetting.softProfileStartTrainerStartNotificationTemplateId = trainerStartNotification[0].id;
                    }

                    var managerStartNotification = _.filter(notificationTemplates, function (item) {
                        return item.evaluationRoleId == evaluationRolesEnum.manager && item.notificationTemplateTypeId == templateTypeEnum.MilestoneStartNotification && item.stageTypeId == stageTypesEnum.StartProfile && item.profileTypeId == profilesTypesEnum.soft && item.isDefualt == true
                    });
                    if (managerStartNotification.length > 0) {
                        $scope.projectGlobalSetting.softProfileStartManagerStartNotificationTemplateId = managerStartNotification[0].id;
                    }
                    var participantCompleteNotification = _.filter(notificationTemplates, function (item) {
                        return item.evaluationRoleId == evaluationRolesEnum.participant
                            && item.notificationTemplateTypeId == templateTypeEnum.MilestoneCompleteNotification
                            && item.stageTypeId == stageTypesEnum.StartProfile
                            && item.profileTypeId == profilesTypesEnum.soft 
                            && item.isDefualt == true;
                    });
                    if (participantCompleteNotification.length > 0) {
                        $scope.projectGlobalSetting.softProfileStartExternalCompletedNotificationTemplateId = participantCompleteNotification[0].id;
                    }

                    var evaluatorCompleteNotification = _.filter(notificationTemplates, function (item) {
                        return item.evaluationRoleId == evaluationRolesEnum.evaluator && item.notificationTemplateTypeId == templateTypeEnum.MilestoneCompleteNotification && item.stageTypeId == stageTypesEnum.StartProfile && item.profileTypeId == profilesTypesEnum.soft  && item.isDefualt == true;
                    });
                    if (evaluatorCompleteNotification.length > 0) {
                        $scope.projectGlobalSetting.softProfileStartEvaluatorCompletedNotificationTemplateId = evaluatorCompleteNotification[0].id;
                        $scope.projectGlobalSetting.softProfileStartFinalScoreManagerCompletedNotificationTemplateId = evaluatorCompleteNotification[0].id;
                    }

                    var trainerCompleteNotification = _.filter(notificationTemplates, function (item) {
                        return item.evaluationRoleId == evaluationRolesEnum.trainer && item.notificationTemplateTypeId == templateTypeEnum.MilestoneCompleteNotification && item.stageTypeId == stageTypesEnum.StartProfile && item.profileTypeId == profilesTypesEnum.soft  && item.isDefualt == true;
                    });
                    if (trainerCompleteNotification.length > 0) {
                        $scope.projectGlobalSetting.softProfileStartTrainerCompletedNotificationTemplateId = trainerCompleteNotification[0].id;
                    }

                    var managerCompleteNotification = _.filter(notificationTemplates, function (item) {
                        return item.evaluationRoleId == evaluationRolesEnum.manager && item.notificationTemplateTypeId == templateTypeEnum.MilestoneCompleteNotification && item.stageTypeId == stageTypesEnum.StartProfile && item.profileTypeId == profilesTypesEnum.soft  && item.isDefualt == true
                    });
                    if (managerCompleteNotification.length > 0) {
                        $scope.projectGlobalSetting.softProfileStartManagerCompletedNotificationTemplateId = managerCompleteNotification[0].id;
                        $scope.projectGlobalSetting.softProfileStartProjectManagerCompletedNotificationTemplateId = managerCompleteNotification[0].id;
                    }


                    //$scope.projectGlobalSetting.softProfileStartGreenAlarmParticipantTemplateId = 62;
                    var participantGreenNotification = _.filter(notificationTemplates, function (item) {
                        return item.evaluationRoleId == evaluationRolesEnum.participant && item.stageTypeId == stageTypesEnum.StartProfile && item.notificationTemplateTypeId == templateTypeEnum.GreenMilestoneAlarm && item.isDefualt == true;
                    });
                    if (participantGreenNotification.length > 0) {
                        $scope.projectGlobalSetting.softProfileStartGreenAlarmParticipantTemplateId = participantGreenNotification[0].id;
                    }

                    //$scope.projectGlobalSetting.softProfileStartGreenAlarmEvaluatorTemplateId = 65;
                    var evaluatorGreenNotification = _.filter(notificationTemplates, function (item) {
                        return item.evaluationRoleId == evaluationRolesEnum.evaluator && item.stageTypeId == stageTypesEnum.StartProfile && item.notificationTemplateTypeId == templateTypeEnum.GreenMilestoneAlarm && item.isDefualt == true;
                    });
                    if (evaluatorGreenNotification.length > 0) {
                        $scope.projectGlobalSetting.softProfileStartGreenAlarmEvaluatorTemplateId = evaluatorGreenNotification[0].id;
                        $scope.projectGlobalSetting.softProfileStartGreenAlarmFinalScoreManagerTemplateId = evaluatorGreenNotification[0].id;
                    }

                    //$scope.projectGlobalSetting.softProfileStartGreenAlarmManagerTemplateId = 70;
                    var managerGreenNotification = _.filter(notificationTemplates, function (item) {
                        return item.evaluationRoleId == evaluationRolesEnum.manager && item.stageTypeId == stageTypesEnum.StartProfile && item.notificationTemplateTypeId == templateTypeEnum.GreenMilestoneAlarm && item.isDefualt == true;
                    });
                    if (managerGreenNotification.length > 0) {
                        $scope.projectGlobalSetting.softProfileStartGreenAlarmManagerTemplateId = managerGreenNotification[0].id;
                        $scope.projectGlobalSetting.softProfileStartGreenAlarmProjectManagerTemplateId = managerGreenNotification[0].id;
                    }

                    //$scope.projectGlobalSetting.softProfileStartGreenAlarmTrainerTemplateId = 73;
                    var trainerGreenNotification = _.filter(notificationTemplates, function (item) {
                        return item.evaluationRoleId == evaluationRolesEnum.trainer && item.stageTypeId == stageTypesEnum.StartProfile && item.notificationTemplateTypeId == templateTypeEnum.GreenMilestoneAlarm && item.isDefualt == true;
                    });
                    if (trainerGreenNotification.length > 0) {
                        $scope.projectGlobalSetting.softProfileStartGreenAlarmTrainerTemplateId = trainerGreenNotification[0].id;
                    }

                    //$scope.projectGlobalSetting.softProfileStartYellowAlarmParticipantTemplateId = 66;
                    var participantYellowNotification = _.filter(notificationTemplates, function (item) {
                        return item.evaluationRoleId == evaluationRolesEnum.participant && item.stageTypeId == stageTypesEnum.StartProfile && item.notificationTemplateTypeId == templateTypeEnum.YellowMilestoneAlarm && item.isDefualt == true;
                    });
                    if (participantYellowNotification.length > 0) {
                        $scope.projectGlobalSetting.softProfileStartYellowAlarmParticipantTemplateId = participantYellowNotification[0].id;
                    }
                    //$scope.projectGlobalSetting.softProfileStartYellowAlarmEvaluatorTemplateId = 79;
                    var evaluatorYellowNotification = _.filter(notificationTemplates, function (item) {
                        return item.evaluationRoleId == evaluationRolesEnum.evaluator && item.stageTypeId == stageTypesEnum.StartProfile && item.notificationTemplateTypeId == templateTypeEnum.YellowMilestoneAlarm && item.isDefualt == true;
                    });
                    if (evaluatorYellowNotification.length > 0) {
                        $scope.projectGlobalSetting.softProfileStartYellowAlarmEvaluatorTemplateId = evaluatorYellowNotification[0].id;
                        $scope.projectGlobalSetting.softProfileStartYellowAlarmFinalScoreManagerTemplateId = evaluatorYellowNotification[0].id;
                    }

                    //$scope.projectGlobalSetting.softProfileStartYellowAlarmManagerTemplateId = 71;
                    var managerYellowNotification = _.filter(notificationTemplates, function (item) {
                        return item.evaluationRoleId == evaluationRolesEnum.manager && item.stageTypeId == stageTypesEnum.StartProfile && item.notificationTemplateTypeId == templateTypeEnum.YellowMilestoneAlarm && item.isDefualt == true;
                    });
                    if (managerYellowNotification.length > 0) {
                        $scope.projectGlobalSetting.softProfileStartYellowAlarmManagerTemplateId = managerYellowNotification[0].id;
                        $scope.projectGlobalSetting.softProfileStartYellowAlarmProjectManagerTemplateId = managerYellowNotification[0].id;
                    }

                    //$scope.projectGlobalSetting.softProfileStartYellowAlarmTrainerTemplateId = 74;
                    var trainerYellowNotification = _.filter(notificationTemplates, function (item) {
                        return item.evaluationRoleId == evaluationRolesEnum.trainer && item.stageTypeId == stageTypesEnum.StartProfile && item.notificationTemplateTypeId == templateTypeEnum.YellowMilestoneAlarm && item.isDefualt == true;
                    });
                    if (trainerYellowNotification.length > 0) {
                        $scope.projectGlobalSetting.softProfileStartYellowAlarmTrainerTemplateId = trainerYellowNotification[0].id;
                    }

                    //$scope.projectGlobalSetting.softProfileStartRedAlarmParticipantTemplateId = 67;
                    var participantRedNotification = _.filter(notificationTemplates, function (item) {
                        return item.evaluationRoleId == evaluationRolesEnum.participant && item.stageTypeId == stageTypesEnum.StartProfile && item.notificationTemplateTypeId == templateTypeEnum.RedMilestoneAlarm && item.isDefualt == true;
                    });
                    if (participantRedNotification.length > 0) {
                        $scope.projectGlobalSetting.softProfileStartRedAlarmParticipantTemplateId = participantRedNotification[0].id;
                    }

                    //$scope.projectGlobalSetting.softProfileStartRedAlarmEvaluatorTemplateId = 77;
                    var evaluatorRedNotification = _.filter(notificationTemplates, function (item) {
                        return item.evaluationRoleId == evaluationRolesEnum.evaluator && item.stageTypeId == stageTypesEnum.StartProfile && item.notificationTemplateTypeId == templateTypeEnum.RedMilestoneAlarm && item.isDefualt == true;
                    });
                    if (evaluatorRedNotification.length > 0) {
                        $scope.projectGlobalSetting.softProfileStartRedAlarmEvaluatorTemplateId = evaluatorRedNotification[0].id;
                        $scope.projectGlobalSetting.softProfileStartRedAlarmFinalScoreManagerTemplateId = evaluatorRedNotification[0].id;
                    }

                    //$scope.projectGlobalSetting.softProfileStartRedAlarmManagerTemplateId = 72;
                    var managerRedNotification = _.filter(notificationTemplates, function (item) {
                        return item.evaluationRoleId == evaluationRolesEnum.manager && item.stageTypeId == stageTypesEnum.StartProfile && item.notificationTemplateTypeId == templateTypeEnum.RedMilestoneAlarm && item.isDefualt == true;
                    });
                    if (managerRedNotification.length > 0) {
                        $scope.projectGlobalSetting.softProfileStartRedAlarmManagerTemplateId = managerRedNotification[0].id;
                        $scope.projectGlobalSetting.softProfileStartRedAlarmProjectManagerTemplateId = managerRedNotification[0].id;
                    }

                    //$scope.projectGlobalSetting.softProfileStartRedAlarmTrainerTemplateId = 75;

                    var trainerRedNotification = _.filter(notificationTemplates, function (item) {
                        return item.evaluationRoleId == evaluationRolesEnum.trainer && item.stageTypeId == stageTypesEnum.StartProfile && item.notificationTemplateTypeId == templateTypeEnum.RedMilestoneAlarm && item.isDefualt == true;
                    });
                    if (trainerRedNotification.length > 0) {
                        $scope.projectGlobalSetting.softProfileStartRedAlarmTrainerTemplateId = trainerRedNotification[0].id;
                    }

                    $scope.projectGlobalSetting.knowledgeProfileEmailNotification = true;
                    $scope.projectGlobalSetting.knowledgeProfileSmsNotification = false;

                    //KTPRofile Templates
                    var participantStartNotification = _.filter(notificationTemplates, function (item) {
                        return item.evaluationRoleId == evaluationRolesEnum.participant && item.profileTypeId == profilesTypesEnum.knowledgetest && item.notificationTemplateTypeId == templateTypeEnum.MilestoneStartNotification && item.isDefualt == true;
                    });
                    if (participantStartNotification.length > 0) {
                        $scope.projectGlobalSetting.knowledgeProfileExternalStartNotificationTemplateId = participantStartNotification[0].id;
                    }

                    var evaluatorStartNotification = _.filter(notificationTemplates, function (item) {
                        return item.evaluationRoleId == evaluationRolesEnum.evaluator && item.profileTypeId == profilesTypesEnum.knowledgetest && item.notificationTemplateTypeId == templateTypeEnum.MilestoneStartNotification && item.isDefualt == true
                    });
                    if (evaluatorStartNotification.length > 0) {
                        $scope.projectGlobalSetting.knowledgeProfileEvaluatorStartNotificationTemplateId = evaluatorStartNotification[0].id;
                    }



                    var participantCompletedNotification = _.filter(notificationTemplates, function (item) {
                        return item.evaluationRoleId == evaluationRolesEnum.participant && item.profileTypeId == profilesTypesEnum.knowledgetest && item.notificationTemplateTypeId == templateTypeEnum.MilestoneCompleteNotification && item.isDefualt == true;
                    });
                    if (participantCompletedNotification.length > 0) {
                        $scope.projectGlobalSetting.knowledgeProfileExternalCompletedNotificationTemplateId = participantCompletedNotification[0].id;
                    }


                    var evaluatorCompleteNotification = _.filter(notificationTemplates, function (item) {
                        return item.evaluationRoleId == evaluationRolesEnum.evaluator && item.profileTypeId == profilesTypesEnum.knowledgetest && item.notificationTemplateTypeId == templateTypeEnum.MilestoneCompleteNotification  && item.isDefualt == true;
                    });
                    if (evaluatorCompleteNotification.length > 0) {
                        $scope.projectGlobalSetting.knowledgeProfileEvaluatorCompletedNotificationTemplateId = evaluatorCompleteNotification[0].id;
                        $scope.projectGlobalSetting.knowledgeProfileFinalScoreManagerCompletedNotificationTemplateId = evaluatorCompleteNotification[0].id;
                    }

                    var trainerCompleteNotification = _.filter(notificationTemplates, function (item) {
                        return item.evaluationRoleId == evaluationRolesEnum.trainer && item.profileTypeId == profilesTypesEnum.knowledgetest && item.notificationTemplateTypeId == templateTypeEnum.MilestoneCompleteNotification  && item.isDefualt == true;
                    });
                    if (trainerCompleteNotification.length > 0) {
                        $scope.projectGlobalSetting.knowledgeProfileTrainerCompletedNotificationTemplateId = trainerCompleteNotification[0].id;
                    }

                    var managerCompleteNotification = _.filter(notificationTemplates, function (item) {
                        return item.evaluationRoleId == evaluationRolesEnum.manager & item.profileTypeId == profilesTypesEnum.knowledgetest && item.notificationTemplateTypeId == templateTypeEnum.MilestoneCompleteNotification && item.isDefualt == true
                    });
                    if (managerCompleteNotification.length > 0) {
                        $scope.projectGlobalSetting.knowledgeProfileManagerCompletedNotificationTemplateId = managerCompleteNotification[0].id;
                        $scope.projectGlobalSetting.knowledgeProfileProjectManagerCompletedNotificationTemplateId = managerCompleteNotification[0].id;
                    }


                    


                    var participantGreenNotification = _.filter(notificationTemplates, function (item) {
                        return item.evaluationRoleId == evaluationRolesEnum.participant && item.profileTypeId == profilesTypesEnum.knowledgetest && item.notificationTemplateTypeId == templateTypeEnum.GreenMilestoneAlarm && item.isDefualt == true;
                    });
                    if (participantGreenNotification.length > 0) {
                        $scope.projectGlobalSetting.knowledgeProfileGreenAlarmParticipantTemplateId = participantGreenNotification[0].id;
                    }


                    var evaluatorGreenNotification = _.filter(notificationTemplates, function (item) {
                        return item.evaluationRoleId == evaluationRolesEnum.evaluator && item.profileTypeId == profilesTypesEnum.knowledgetest && item.notificationTemplateTypeId == templateTypeEnum.GreenMilestoneAlarm && item.isDefualt == true;
                    });
                    if (evaluatorGreenNotification.length > 0) {
                        $scope.projectGlobalSetting.knowledgeProfileGreenAlarmEvaluatorTemplateId = evaluatorGreenNotification[0].id;
                    }

                    var managerGreenNotification = _.filter(notificationTemplates, function (item) {
                        return item.evaluationRoleId == evaluationRolesEnum.manager && item.profileTypeId == profilesTypesEnum.knowledgetest && item.notificationTemplateTypeId == templateTypeEnum.GreenMilestoneAlarm && item.isDefualt == true;
                    });
                    if (managerGreenNotification.length > 0) {
                        $scope.projectGlobalSetting.knowledgeProfileGreenAlarmManagerTemplateId = managerGreenNotification[0].id;
                    }

                    var trainerGreenNotification = _.filter(notificationTemplates, function (item) {
                        return item.evaluationRoleId == evaluationRolesEnum.trainer && item.profileTypeId == profilesTypesEnum.knowledgetest && item.notificationTemplateTypeId == templateTypeEnum.GreenMilestoneAlarm && item.isDefualt == true;
                    });
                    if (trainerGreenNotification.length > 0) {
                        $scope.projectGlobalSetting.knowledgeProfileGreenAlarmTrainerTemplateId = trainerGreenNotification[0].id;
                    }


                    var participantYellowNotification = _.filter(notificationTemplates, function (item) {
                        return item.evaluationRoleId == evaluationRolesEnum.participant && item.profileTypeId == profilesTypesEnum.knowledgetest && item.notificationTemplateTypeId == templateTypeEnum.YellowMilestoneAlarm && item.isDefualt == true;
                    });
                    if (participantYellowNotification.length > 0) {
                        $scope.projectGlobalSetting.knowledgeProfileYellowAlarmParticipantTemplateId = participantYellowNotification[0].id;
                    }
                    var evaluatorYellowNotification = _.filter(notificationTemplates, function (item) {
                        return item.evaluationRoleId == evaluationRolesEnum.evaluator && item.profileTypeId == profilesTypesEnum.knowledgetest && item.notificationTemplateTypeId == templateTypeEnum.YellowMilestoneAlarm && item.isDefualt == true;
                    });
                    if (evaluatorYellowNotification.length > 0) {
                        $scope.projectGlobalSetting.knowledgeProfileYellowAlarmEvaluatorTemplateId = evaluatorYellowNotification[0].id;
                        $scope.projectGlobalSetting.knowledgeProfileYellowAlarmFinalScoreManagerTemplateId = evaluatorYellowNotification[0].id;
                    }

                    var managerYellowNotification = _.filter(notificationTemplates, function (item) {
                        return item.evaluationRoleId == evaluationRolesEnum.manager && item.profileTypeId == profilesTypesEnum.knowledgetest && item.notificationTemplateTypeId == templateTypeEnum.YellowMilestoneAlarm && item.isDefualt == true;
                    });
                    if (managerYellowNotification.length > 0) {
                        $scope.projectGlobalSetting.knowledgeProfileYellowAlarmManagerTemplateId = managerYellowNotification[0].id;
                        $scope.projectGlobalSetting.knowledgeProfileYellowAlarmProjectManagerTemplateId = managerYellowNotification[0].id;
                    }

                    var trainerYellowNotification = _.filter(notificationTemplates, function (item) {
                        return item.evaluationRoleId == evaluationRolesEnum.trainer && item.profileTypeId == profilesTypesEnum.knowledgetest && item.notificationTemplateTypeId == templateTypeEnum.YellowMilestoneAlarm && item.isDefualt == true;
                    });
                    if (trainerYellowNotification.length > 0) {
                        $scope.projectGlobalSetting.knowledgeProfileYellowAlarmTrainerTemplateId = trainerYellowNotification[0].id;
                    }


                    //$scope.projectGlobalSetting.softProfileStartRedAlarmParticipantTemplateId = 67;
                    var participantRedNotification = _.filter(notificationTemplates, function (item) {
                        return item.evaluationRoleId == evaluationRolesEnum.participant && item.profileTypeId == profilesTypesEnum.knowledgetest && item.notificationTemplateTypeId == templateTypeEnum.RedMilestoneAlarm && item.isDefualt == true;
                    });
                    if (participantRedNotification.length > 0) {
                        $scope.projectGlobalSetting.knowledgeProfileRedAlarmParticipantTemplateId = participantRedNotification[0].id;
                    }

                    //$scope.projectGlobalSetting.softProfileStartRedAlarmEvaluatorTemplateId = 77;
                    var evaluatorRedNotification = _.filter(notificationTemplates, function (item) {
                        return item.evaluationRoleId == evaluationRolesEnum.evaluator && item.profileTypeId == profilesTypesEnum.knowledgetest && item.notificationTemplateTypeId == templateTypeEnum.RedMilestoneAlarm && item.isDefualt == true;
                    });
                    if (evaluatorRedNotification.length > 0) {
                        $scope.projectGlobalSetting.knowledgeProfileRedAlarmEvaluatorTemplateId = evaluatorRedNotification[0].id;
                        $scope.projectGlobalSetting.knowledgeProfileRedAlarmFinalScoreManagerTemplateId = evaluatorRedNotification[0].id;
                    }

                    //$scope.projectGlobalSetting.softProfileStartRedAlarmManagerTemplateId = 72;
                    var managerRedNotification = _.filter(notificationTemplates, function (item) {
                        return item.evaluationRoleId == evaluationRolesEnum.manager && item.profileTypeId == profilesTypesEnum.knowledgetest && item.notificationTemplateTypeId == templateTypeEnum.RedMilestoneAlarm && item.isDefualt == true;
                    });
                    if (managerRedNotification.length > 0) {
                        $scope.projectGlobalSetting.knowledgeProfileRedAlarmManagerTemplateId = managerRedNotification[0].id;
                        $scope.projectGlobalSetting.knowledgeProfileRedAlarmProjectManagerTemplateId = managerRedNotification[0].id;
                    }
                    var trainerRedNotification = _.filter(notificationTemplates, function (item) {
                        return item.evaluationRoleId == evaluationRolesEnum.trainer && item.profileTypeId == profilesTypesEnum.knowledgetest && item.notificationTemplateTypeId == templateTypeEnum.RedMilestoneAlarm && item.isDefualt == true;
                    });
                    if (trainerRedNotification.length > 0) {
                        $scope.projectGlobalSetting.knowledgeProfileRedAlarmTrainerTemplateId = trainerRedNotification[0].id;
                    }

                    $scope.projectGlobalSetting.softProfileShortGoalEmailNotification = true;
                    $scope.projectGlobalSetting.softProfileShortGoalSmsNotification = false;

                    $scope.projectGlobalSetting.softProfileShortGoalExternalStartNotificationTemplateId = null //28;
                    $scope.projectGlobalSetting.softProfileShortGoalEvaluatorStartNotificationTemplateId = 30;

                    $scope.projectGlobalSetting.softProfileShortGoalGreenAlarmParticipantTemplateId = 62;
                    $scope.projectGlobalSetting.softProfileShortGoalGreenAlarmEvaluatorTemplateId = 65;
                    $scope.projectGlobalSetting.softProfileShortGoalGreenAlarmManagerTemplateId = 70;
                    $scope.projectGlobalSetting.softProfileShortGoalGreenAlarmTrainerTemplateId = 73;
                    $scope.projectGlobalSetting.softProfileShortGoalYellowAlarmParticipantTemplateId = 66;
                    $scope.projectGlobalSetting.softProfileShortGoalYellowAlarmEvaluatorTemplateId = 79;
                    $scope.projectGlobalSetting.softProfileShortGoalYellowAlarmManagerTemplateId = 71;
                    $scope.projectGlobalSetting.softProfileShortGoalYellowAlarmTrainerTemplateId = 74;
                    $scope.projectGlobalSetting.softProfileShortGoalRedAlarmParticipantTemplateId = 67;
                    $scope.projectGlobalSetting.softProfileShortGoalRedAlarmEvaluatorTemplateId = 75;
                    $scope.projectGlobalSetting.softProfileShortGoalRedAlarmManagerTemplateId = 72;
                    $scope.projectGlobalSetting.softProfileShortGoalRedAlarmTrainerTemplateId = 75;

                    $scope.projectGlobalSetting.softProfileMidGoalEmailNotification = true;
                    $scope.projectGlobalSetting.softProfileMidGoalSmsNotification = false;
                    $scope.projectGlobalSetting.softProfileMidGoalExternalStartNotificationTemplateId = 27;
                    $scope.projectGlobalSetting.softProfileMidGoalEvaluatorStartNotificationTemplateId = 31;

                    $scope.projectGlobalSetting.softProfileMidGoalGreenAlarmParticipantTemplateId = 62;
                    $scope.projectGlobalSetting.softProfileMidGoalGreenAlarmEvaluatorTemplateId = 65;
                    $scope.projectGlobalSetting.softProfileMidGoalGreenAlarmManagerTemplateId = 70;
                    $scope.projectGlobalSetting.softProfileMidGoalGreenAlarmTrainerTemplateId = 73;
                    $scope.projectGlobalSetting.softProfileMidGoalYellowAlarmParticipantTemplateId = 66;
                    $scope.projectGlobalSetting.softProfileMidGoalYellowAlarmEvaluatorTemplateId = 79;
                    $scope.projectGlobalSetting.softProfileMidGoalYellowAlarmManagerTemplateId = 71;
                    $scope.projectGlobalSetting.softProfileMidGoalYellowAlarmTrainerTemplateId = 74;
                    $scope.projectGlobalSetting.softProfileMidGoalRedAlarmParticipantTemplateId = 67;
                    $scope.projectGlobalSetting.softProfileMidGoalRedAlarmEvaluatorTemplateId = 77;
                    $scope.projectGlobalSetting.softProfileMidGoalRedAlarmManagerTemplateId = 72;
                    $scope.projectGlobalSetting.softProfileMidGoalRedAlarmTrainerTemplateId = 75;



                    $scope.projectGlobalSetting.softProfileLongTermGoalEmailNotification = true;
                    $scope.projectGlobalSetting.softProfileLongTermGoalSmsNotification = false;
                    $scope.projectGlobalSetting.softProfileLongTermGoalExternalStartNotificationTemplateId = 29;
                    $scope.projectGlobalSetting.softProfileLongTermGoalEvaluatorStartNotificationTemplateId = 32;

                    $scope.projectGlobalSetting.softProfileLongTermGoalGreenAlarmParticipantTemplateId = 62;
                    $scope.projectGlobalSetting.softProfileLongTermGoalGreenAlarmEvaluatorTemplateId = 65;
                    $scope.projectGlobalSetting.softProfileLongTermGoalGreenAlarmManagerTemplateId = 70;
                    $scope.projectGlobalSetting.softProfileLongTermGoalGreenAlarmTrainerTemplateId = 73;
                    $scope.projectGlobalSetting.softProfileLongTermGoalYellowAlarmParticipantTemplateId = 66;
                    $scope.projectGlobalSetting.softProfileLongTermGoalYellowAlarmEvaluatorTemplateId = 79;
                    $scope.projectGlobalSetting.softProfileLongTermGoalYellowAlarmManagerTemplateId = 71;
                    $scope.projectGlobalSetting.softProfileLongTermGoalYellowAlarmTrainerTemplateId = 74;
                    $scope.projectGlobalSetting.softProfileLongTermGoalRedAlarmParticipantTemplateId = 67;
                    $scope.projectGlobalSetting.softProfileLongTermGoalRedAlarmEvaluatorTemplateId = 77;
                    $scope.projectGlobalSetting.softProfileLongTermGoalRedAlarmManagerTemplateId = 72;
                    $scope.projectGlobalSetting.softProfileLongTermGoalRedAlarmTrainerTemplateId = 75;

                    $scope.projectGlobalSetting.softProfileFinalGoalEmailNotification = true;
                    $scope.projectGlobalSetting.softProfileFinalGoalSmsNotification = false;
                    $scope.projectGlobalSetting.softProfileFinalGoalExternalStartNotificationTemplateId = 19;
                    $scope.projectGlobalSetting.softProfileFinalGoalEvaluatorStartNotificationTemplateId = 80;

                    $scope.projectGlobalSetting.softProfileFinalGoalGreenAlarmParticipantTemplateId = 62;
                    $scope.projectGlobalSetting.softProfileFinalGoalGreenAlarmEvaluatorTemplateId = 65;
                    $scope.projectGlobalSetting.softProfileFinalGoalGreenAlarmManagerTemplateId = 70;
                    $scope.projectGlobalSetting.softProfileFinalGoalGreenAlarmTrainerTemplateId = 73;
                    $scope.projectGlobalSetting.softProfileFinalGoalYellowAlarmParticipantTemplateId = 66;
                    $scope.projectGlobalSetting.softProfileFinalGoalYellowAlarmEvaluatorTemplateId = 79;
                    $scope.projectGlobalSetting.softProfileFinalGoalYellowAlarmManagerTemplateId = 71;
                    $scope.projectGlobalSetting.softProfileFinalGoalYellowAlarmTrainerTemplateId = 74;
                    $scope.projectGlobalSetting.softProfileFinalGoalRedAlarmParticipantTemplateId = 67;
                    $scope.projectGlobalSetting.softProfileFinalGoalRedAlarmEvaluatorTemplateId = 77;
                    $scope.projectGlobalSetting.softProfileFinalGoalRedAlarmManagerTemplateId = 72;
                    $scope.projectGlobalSetting.softProfileFinalGoalRedAlarmTrainerTemplateId = 75;


                    $scope.projectGlobalSetting.softProfilePersonalTrainingReminderNotificationTemplateId = 111;
                    $scope.projectGlobalSetting.softProfileProfileTrainingReminderNotificationTemplateId = 110;
                    $scope.projectGlobalSetting.knowledgeProfilePersonalTrainingReminderNotificationTemplateId = 111;
                    $scope.projectGlobalSetting.knowledgeProfileProfileTrainingReminderNotificationTemplateId = 110;
                }

            };

            $scope.setDefaultNotificationSettings = function () {
                if ($scope.projectDefaultNotificationSettings) {
                    // Evaluator Green
                    var evaluatorGreenNotification = _.filter(notificationTemplates, function (item) {
                        return item.evaluationRoleId == evaluationRolesEnum.evaluator && item.stageTypeId == stageTypesEnum.Milestone && item.notificationTemplateTypeId == templateTypeEnum.GreenMilestoneAlarm && item.isDefualt == true
                    });
                    if (evaluatorGreenNotification.length > 0) {
                        $scope.projectDefaultNotificationSettings.evaluatorGreenNotificationId = evaluatorGreenNotification[0].id;
                        $scope.projectDefaultNotificationSettings.finalScoreManagersGreenNotificationId = evaluatorGreenNotification[0].id;
                    }
                    // Evaluator Yellow
                    var evaluatorYellowNotification = _.filter(notificationTemplates, function (item) {
                        return item.evaluationRoleId == evaluationRolesEnum.evaluator && item.stageTypeId == stageTypesEnum.Milestone && item.notificationTemplateTypeId == templateTypeEnum.YellowMilestoneAlarm && item.isDefualt == true
                    })
                    if (evaluatorYellowNotification.length > 0) {
                        $scope.projectDefaultNotificationSettings.evaluatorYellowNotificationId = evaluatorYellowNotification[0].id;
                        $scope.projectDefaultNotificationSettings.finalScoreManagersYellowNotificationId = evaluatorYellowNotification[0].id;

                    }
                    // Evaluator Red
                    var evaluatorRedNotification = _.filter(notificationTemplates, function (item) {
                        return item.evaluationRoleId == evaluationRolesEnum.evaluator && item.stageTypeId == stageTypesEnum.Milestone && item.notificationTemplateTypeId == templateTypeEnum.RedMilestoneAlarm && item.isDefualt == true
                    })
                    if (evaluatorRedNotification.length > 0) {
                        $scope.projectDefaultNotificationSettings.evaluatorRedNotificationId = evaluatorRedNotification[0].id;
                        $scope.projectDefaultNotificationSettings.finalScoreManagersRedNotificationId = evaluatorRedNotification[0].id;

                    }

                    // participant Green
                    var participantGreenNotification = _.filter(notificationTemplates, function (item) {
                        return item.evaluationRoleId == evaluationRolesEnum.participant && item.stageTypeId == stageTypesEnum.Milestone && item.notificationTemplateTypeId == templateTypeEnum.GreenMilestoneAlarm && item.isDefualt == true
                    });
                    if (participantGreenNotification.length > 0) {
                        $scope.projectDefaultNotificationSettings.participantGreenNotificationId = participantGreenNotification[0].id;
                    }
                    // participant Yellow
                    var participantYellowNotification = _.filter(notificationTemplates, function (item) {
                        return item.evaluationRoleId == evaluationRolesEnum.participant && item.stageTypeId == stageTypesEnum.Milestone && item.notificationTemplateTypeId == templateTypeEnum.YellowMilestoneAlarm && item.isDefualt == true
                    })
                    if (participantYellowNotification.length > 0) {
                        $scope.projectDefaultNotificationSettings.participantYellowNotificationId = participantYellowNotification[0].id;
                    }
                    // participant Red
                    var participantRedNotification = _.filter(notificationTemplates, function (item) {
                        return item.evaluationRoleId == evaluationRolesEnum.participant && item.stageTypeId == stageTypesEnum.Milestone && item.notificationTemplateTypeId == templateTypeEnum.RedMilestoneAlarm && item.isDefualt == true
                    })
                    if (participantRedNotification.length > 0) {
                        $scope.projectDefaultNotificationSettings.participantRedNotificationId = participantRedNotification[0].id;
                    }

                    // trainer Green
                    var trainerGreenNotification = _.filter(notificationTemplates, function (item) {
                        return item.evaluationRoleId == evaluationRolesEnum.trainer && item.stageTypeId == stageTypesEnum.Milestone && item.notificationTemplateTypeId == templateTypeEnum.GreenMilestoneAlarm && item.isDefualt == true
                    });
                    if (trainerGreenNotification.length > 0) {
                        $scope.projectDefaultNotificationSettings.trainerGreenNotificationId = trainerGreenNotification[0].id;
                    }
                    // trainer Yellow
                    var trainerYellowNotification = _.filter(notificationTemplates, function (item) {
                        return item.evaluationRoleId == evaluationRolesEnum.trainer && item.stageTypeId == stageTypesEnum.Milestone && item.notificationTemplateTypeId == templateTypeEnum.YellowMilestoneAlarm && item.isDefualt == true
                    })
                    if (trainerYellowNotification.length > 0) {
                        $scope.projectDefaultNotificationSettings.trainerYellowNotificationId = trainerYellowNotification[0].id;
                    }
                    // trainer Red
                    var trainerRedNotification = _.filter(notificationTemplates, function (item) {
                        return item.evaluationRoleId == evaluationRolesEnum.trainer && item.stageTypeId == stageTypesEnum.Milestone && item.notificationTemplateTypeId == templateTypeEnum.RedMilestoneAlarm && item.isDefualt == true
                    })
                    if (trainerRedNotification.length > 0) {
                        $scope.projectDefaultNotificationSettings.trainerRedNotificationId = trainerRedNotification[0].id;
                    }


                    // manager Green
                    var managerGreenNotification = _.filter(notificationTemplates, function (item) {
                        return item.evaluationRoleId == evaluationRolesEnum.manager && item.stageTypeId == stageTypesEnum.Milestone && item.notificationTemplateTypeId == templateTypeEnum.GreenMilestoneAlarm && item.isDefualt == true
                    });
                    if (managerGreenNotification.length > 0) {
                        $scope.projectDefaultNotificationSettings.managerGreenNotificationId = managerGreenNotification[0].id;
                        $scope.projectDefaultNotificationSettings.projectManagersGreenNotificationId = managerGreenNotification[0].id;
                    }
                    // manager Yellow
                    var managerYellowNotification = _.filter(notificationTemplates, function (item) {
                        return item.evaluationRoleId == evaluationRolesEnum.manager && item.stageTypeId == stageTypesEnum.Milestone && item.notificationTemplateTypeId == templateTypeEnum.YellowMilestoneAlarm && item.isDefualt == true
                    })
                    if (managerYellowNotification.length > 0) {
                        $scope.projectDefaultNotificationSettings.managerYellowNotificationId = managerYellowNotification[0].id;
                        $scope.projectDefaultNotificationSettings.projectManagersYellowNotificationId = managerYellowNotification[0].id;
                    }
                    // manager Red
                    var managerRedNotification = _.filter(notificationTemplates, function (item) {
                        return item.evaluationRoleId == evaluationRolesEnum.manager && item.stageTypeId == stageTypesEnum.Milestone && item.notificationTemplateTypeId == templateTypeEnum.RedMilestoneAlarm && item.isDefualt == true
                    })
                    if (managerRedNotification.length > 0) {
                        $scope.projectDefaultNotificationSettings.managerRedNotificationId = managerRedNotification[0].id;
                        $scope.projectDefaultNotificationSettings.projectManagersRedNotificationId = managerRedNotification[0].id;

                    }
                    // Evaluator Start
                    var evaluatorStartNotification = _.filter(notificationTemplates, function (item) {
                        return item.evaluationRoleId == evaluationRolesEnum.evaluator && item.stageTypeId == stageTypesEnum.Milestone && item.notificationTemplateTypeId == templateTypeEnum.MilestoneStartNotification && item.isDefualt == true
                    });
                    if (evaluatorStartNotification.length > 0) {
                        $scope.projectDefaultNotificationSettings.evaluatorsStartNotificationId = evaluatorStartNotification[0].id;
                        $scope.projectDefaultNotificationSettings.finalScoreManagersStartNotificationId = evaluatorStartNotification[0].id;
                    }
                    // Evaluator Completed
                    var evaluatorCompletedNotification = _.filter(notificationTemplates, function (item) {
                        return item.evaluationRoleId == evaluationRolesEnum.evaluator && item.stageTypeId == stageTypesEnum.Milestone && item.notificationTemplateTypeId == templateTypeEnum.MilestoneCompleteNotification && item.isDefualt == true
                    })
                    if (evaluatorCompletedNotification.length > 0) {
                        $scope.projectDefaultNotificationSettings.evaluatorsCompletedNotificationId = evaluatorCompletedNotification[0].id;
                        $scope.projectDefaultNotificationSettings.finalScoreManagersCompletedNotificationId = evaluatorCompletedNotification[0].id;

                    }
                    // Evaluator Result
                    var evaluatorResultNotification = _.filter(notificationTemplates, function (item) {
                        return item.evaluationRoleId == evaluationRolesEnum.evaluator && item.stageTypeId == stageTypesEnum.Milestone && item.notificationTemplateTypeId == templateTypeEnum.MilestoneResultNotification && item.isDefualt == true
                    })
                    if (evaluatorResultNotification.length > 0) {
                        $scope.projectDefaultNotificationSettings.evaluatorsResultNotificationId = evaluatorResultNotification[0].id;
                        $scope.projectDefaultNotificationSettings.finalScoreManagersResultNotificationId = evaluatorResultNotification[0].id;

                    }


                    // participant Start
                    var participantStartNotification = _.filter(notificationTemplates, function (item) {
                        return item.evaluationRoleId == evaluationRolesEnum.participant && item.stageTypeId == stageTypesEnum.Milestone && item.notificationTemplateTypeId == templateTypeEnum.MilestoneStartNotification && item.isDefualt == true
                    });
                    if (participantStartNotification.length > 0) {
                        $scope.projectDefaultNotificationSettings.participantsStartNotificationId = participantStartNotification[0].id;
                    }
                    // participant Complete
                    var participantCompleteNotification = _.filter(notificationTemplates, function (item) {
                        return item.evaluationRoleId == evaluationRolesEnum.participant && item.stageTypeId == stageTypesEnum.Milestone && item.notificationTemplateTypeId == templateTypeEnum.MilestoneCompleteNotification && item.isDefualt == true
                    })
                    if (participantCompleteNotification.length > 0) {
                        $scope.projectDefaultNotificationSettings.participantsCompletedNotificationId = participantCompleteNotification[0].id;
                    }
                    // participant Result
                    var participantResultNotification = _.filter(notificationTemplates, function (item) {
                        return item.evaluationRoleId == evaluationRolesEnum.participant && item.stageTypeId == stageTypesEnum.Milestone && item.notificationTemplateTypeId == templateTypeEnum.MilestoneResultNotification && item.isDefualt == true
                    })
                    if (participantResultNotification.length > 0) {
                        $scope.projectDefaultNotificationSettings.participantsResultNotificationId = participantResultNotification[0].id;
                    }


                    // trainer Start
                    var trainerStartNotification = _.filter(notificationTemplates, function (item) {
                        return item.evaluationRoleId == evaluationRolesEnum.trainer && item.stageTypeId == stageTypesEnum.Milestone && item.notificationTemplateTypeId == templateTypeEnum.MilestoneStartNotification && item.isDefualt == true
                    });
                    if (trainerStartNotification.length > 0) {
                        $scope.projectDefaultNotificationSettings.trainersStartNotificationId = trainerStartNotification[0].id;
                    }
                    // trainer Complete
                    var trainerCompleteNotification = _.filter(notificationTemplates, function (item) {
                        return item.evaluationRoleId == evaluationRolesEnum.trainer && item.stageTypeId == stageTypesEnum.Milestone && item.notificationTemplateTypeId == templateTypeEnum.MilestoneCompleteNotification && item.isDefualt == true
                    })
                    if (trainerCompleteNotification.length > 0) {
                        $scope.projectDefaultNotificationSettings.trainersCompletedNotificationId = trainerCompleteNotification[0].id;
                    }
                    // trainer Result
                    var trainerResultNotification = _.filter(notificationTemplates, function (item) {
                        return item.evaluationRoleId == evaluationRolesEnum.trainer && item.stageTypeId == stageTypesEnum.Milestone && item.notificationTemplateTypeId == templateTypeEnum.MilestoneResultNotification && item.isDefualt == true
                    })
                    if (trainerResultNotification.length > 0) {
                        $scope.projectDefaultNotificationSettings.trainersResultNotificationId = trainerResultNotification[0].id;
                    }


                    // manager Start
                    var managerStartNotification = _.filter(notificationTemplates, function (item) {
                        return item.evaluationRoleId == evaluationRolesEnum.manager && item.stageTypeId == stageTypesEnum.Milestone && item.notificationTemplateTypeId == templateTypeEnum.MilestoneStartNotification && item.isDefualt == true
                    });
                    if (managerStartNotification.length > 0) {
                        $scope.projectDefaultNotificationSettings.managersStartNotificationId = managerStartNotification[0].id;
                        $scope.projectDefaultNotificationSettings.projectManagersStartNotificationId = managerStartNotification[0].id;
                    }
                    // manager Complete
                    var managerCompleteNotification = _.filter(notificationTemplates, function (item) {
                        return item.evaluationRoleId == evaluationRolesEnum.manager && item.stageTypeId == stageTypesEnum.Milestone && item.notificationTemplateTypeId == templateTypeEnum.MilestoneCompleteNotification && item.isDefualt == true
                    })
                    if (managerCompleteNotification.length > 0) {
                        $scope.projectDefaultNotificationSettings.managersCompletedNotificationId = managerCompleteNotification[0].id;
                        $scope.projectDefaultNotificationSettings.projectManagersCompletedNotificationId = managerCompleteNotification[0].id;
                    }
                    // manager Result
                    var managerResultNotification = _.filter(notificationTemplates, function (item) {
                        return item.evaluationRoleId == evaluationRolesEnum.manager && item.stageTypeId == stageTypesEnum.Milestone && item.notificationTemplateTypeId == templateTypeEnum.MilestoneResultNotification && item.isDefualt == true
                    })
                    if (managerResultNotification.length > 0) {
                        $scope.projectDefaultNotificationSettings.managersResultNotificationId = managerResultNotification[0].id;
                        $scope.projectDefaultNotificationSettings.projectManagersResultNotificationId = managerResultNotification[0].id;

                    }

                }
            }

            $scope.changeSoftProfileTimeSpan = function () {
                var newDate = kendo.parseDate($scope.project.expectedStartDate);

                var calculatedDate = moment(newDate).add({ months: $scope.projectGlobalSetting.softProfileMonthSpan, days: $scope.projectGlobalSetting.softProfileDaySpan + ($scope.projectGlobalSetting.softProfileWeekSpan * 7), hours: $scope.projectGlobalSetting.softProfileHourSpan, minutes: $scope.projectGlobalSetting.softProfileMinuteSpan });

                var diffTime = null;
                var a = moment(kendo.parseDate($scope.project.expectedEndDate));
                var b = moment(kendo.parseDate($scope.project.expectedStartDate));
                // For Knowledge Profile
                diffTime = a.diff(b) / 5;

                $scope.projectGlobalSetting.startStageStartDate = moment(kendo.parseDate(newDate)).format('L LT')
                $scope.projectGlobalSetting.startStageEndDate = moment(kendo.parseDate($scope.projectGlobalSetting.startStageStartDate)).add($scope.projectGlobalSetting.softProfileActualTimeSpan).format('L LT');
                var startdatetime = kendo.parseDate($scope.projectGlobalSetting.startStageStartDate);
                var enddatetime = kendo.parseDate($scope.projectGlobalSetting.startStageEndDate);
                var TotalDiffrence = enddatetime.getTime() - startdatetime.getTime();
                var greenAlarmAt = parseInt(TotalDiffrence * 0.20);
                var yellowAlarmAt = parseInt(TotalDiffrence * 0.60);
                var redAlarmAt = parseInt(TotalDiffrence * 0.90);
                $scope.projectGlobalSetting.softProfileStartGreenAlarmTime = moment(new Date(startdatetime.getTime() + greenAlarmAt)).format('L LT');
                $scope.projectGlobalSetting.softProfileStartYellowAlarmTime = moment(new Date(startdatetime.getTime() + yellowAlarmAt)).format('L LT');
                $scope.projectGlobalSetting.softProfileStartRedAlarmTime = moment(new Date(enddatetime.getTime())).add(1, 'minutes').format('L LT');

                $scope.projectGlobalSetting.shortGoalStartDate = moment(kendo.parseDate($scope.projectGlobalSetting.startStageEndDate)).format('L LT')
                $scope.projectGlobalSetting.shortGoalEndDate = moment(kendo.parseDate($scope.projectGlobalSetting.shortGoalStartDate)).add($scope.projectGlobalSetting.softProfileActualTimeSpan).format('L LT');


                var startdatetime = kendo.parseDate($scope.projectGlobalSetting.shortGoalStartDate);
                var enddatetime = kendo.parseDate($scope.projectGlobalSetting.shortGoalEndDate);
                var TotalDiffrence = enddatetime.getTime() - startdatetime.getTime();
                var greenAlarmAt = parseInt(TotalDiffrence * 0.20);
                var yellowAlarmAt = parseInt(TotalDiffrence * 0.60);
                var redAlarmAt = parseInt(TotalDiffrence * 0.90);
                $scope.projectGlobalSetting.softProfileShortGoalGreenAlarmTime = moment(new Date(startdatetime.getTime() + greenAlarmAt)).format('L LT');
                $scope.projectGlobalSetting.softProfileShortGoalYellowAlarmTime = moment(new Date(startdatetime.getTime() + yellowAlarmAt)).format('L LT');
                $scope.projectGlobalSetting.softProfileShortGoalRedAlarmTime = moment(new Date(enddatetime.getTime())).add(1, 'minutes').format('L LT');


                $scope.projectGlobalSetting.midGoalStartDate = moment(kendo.parseDate($scope.projectGlobalSetting.shortGoalEndDate)).format('L LT')
                $scope.projectGlobalSetting.midGoalEndDate = moment(kendo.parseDate($scope.projectGlobalSetting.midGoalStartDate)).add($scope.projectGlobalSetting.softProfileActualTimeSpan).format('L LT');

                var startdatetime = kendo.parseDate($scope.projectGlobalSetting.midGoalStartDate);
                var enddatetime = kendo.parseDate($scope.projectGlobalSetting.midGoalEndDate);
                var TotalDiffrence = enddatetime.getTime() - startdatetime.getTime();
                var greenAlarmAt = parseInt(TotalDiffrence * 0.20);
                var yellowAlarmAt = parseInt(TotalDiffrence * 0.60);
                var redAlarmAt = parseInt(TotalDiffrence * 0.90);
                $scope.projectGlobalSetting.softProfileMidGoalGreenAlarmTime = moment(new Date(startdatetime.getTime() + greenAlarmAt)).format('L LT');
                $scope.projectGlobalSetting.softProfileMidGoalYellowAlarmTime = moment(new Date(startdatetime.getTime() + yellowAlarmAt)).format('L LT');
                $scope.projectGlobalSetting.softProfileMidGoalRedAlarmTime = moment(new Date(enddatetime.getTime())).add(1, 'minutes').format('L LT');


                $scope.projectGlobalSetting.longTermGoalStartDate = moment(kendo.parseDate($scope.projectGlobalSetting.midGoalEndDate)).format('L LT')
                $scope.projectGlobalSetting.longTermGoalEndDate = moment(kendo.parseDate($scope.projectGlobalSetting.longTermGoalStartDate)).add($scope.projectGlobalSetting.softProfileActualTimeSpan).format('L LT');

                var startdatetime = kendo.parseDate($scope.projectGlobalSetting.longTermGoalStartDate);
                var enddatetime = kendo.parseDate($scope.projectGlobalSetting.longTermGoalEndDate);
                var TotalDiffrence = enddatetime.getTime() - startdatetime.getTime();
                var greenAlarmAt = parseInt(TotalDiffrence * 0.20);
                var yellowAlarmAt = parseInt(TotalDiffrence * 0.60);
                var redAlarmAt = parseInt(TotalDiffrence * 0.90);
                $scope.projectGlobalSetting.softProfileLongTermGoalGreenAlarmTime = moment(new Date(startdatetime.getTime() + greenAlarmAt)).format('L LT');
                $scope.projectGlobalSetting.softProfileLongTermGoalYellowAlarmTime = moment(new Date(startdatetime.getTime() + yellowAlarmAt)).format('L LT');
                $scope.projectGlobalSetting.softProfileLongTermGoalRedAlarmTime = moment(new Date(enddatetime.getTime())).add(1, 'minutes').format('L LT');

                $scope.projectGlobalSetting.finalGoalStartDate = moment(kendo.parseDate($scope.projectGlobalSetting.longTermGoalEndDate)).format('L LT')
                $scope.projectGlobalSetting.finalGoalEndDate = moment(kendo.parseDate($scope.projectGlobalSetting.finalGoalStartDate)).add($scope.projectGlobalSetting.softProfileActualTimeSpan).format('L LT');
                var startdatetime = kendo.parseDate($scope.projectGlobalSetting.finalGoalStartDate);
                var enddatetime = kendo.parseDate($scope.projectGlobalSetting.finalGoalEndDate);
                var TotalDiffrence = enddatetime.getTime() - startdatetime.getTime();
                var greenAlarmAt = parseInt(TotalDiffrence * 0.20);
                var yellowAlarmAt = parseInt(TotalDiffrence * 0.60);
                var redAlarmAt = parseInt(TotalDiffrence * 0.90);
                $scope.projectGlobalSetting.softProfileFinalGoalGreenAlarmTime = moment(new Date(startdatetime.getTime() + greenAlarmAt)).format('L LT');
                $scope.projectGlobalSetting.softProfileFinalGoalYellowAlarmTime = moment(new Date(startdatetime.getTime() + yellowAlarmAt)).format('L LT');
                $scope.projectGlobalSetting.softProfileFinalGoalRedAlarmTime = moment(new Date(enddatetime.getTime())).add(1, 'minutes').format('L LT');


            }
            $scope.changeKnowledgeProfileTimeSpan = function () {
                var newDate = kendo.parseDate($scope.project.expectedStartDate);

                var calculatedDate = moment(newDate).add({ months: $scope.projectGlobalSetting.knowledgeProfileMonthSpan, days: $scope.projectGlobalSetting.knowledgeProfileDaySpan + ($scope.projectGlobalSetting.knowledgeProfileWeekSpan * 7), hours: $scope.projectGlobalSetting.knowledgeProfileHourSpan, minutes: $scope.projectGlobalSetting.knowledgeProfileMinuteSpan });

                $scope.projectGlobalSetting.knowledgeProfileStartDate = moment(newDate).format('L LT')
                $scope.projectGlobalSetting.knowledgeProfileEndDate = moment(kendo.parseDate($scope.projectGlobalSetting.knowledgeProfileStartDate)).add($scope.projectGlobalSetting.knowledgeProfileActualTimeSpan).format('L LT');

                var startdatetime = kendo.parseDate($scope.projectGlobalSetting.knowledgeProfileStartDate);
                var enddatetime = kendo.parseDate($scope.projectGlobalSetting.knowledgeProfileEndDate);
                var TotalDiffrence = enddatetime.getTime() - startdatetime.getTime();
                var greenAlarmAt = parseInt(TotalDiffrence * 0.20);
                var yellowAlarmAt = parseInt(TotalDiffrence * 0.60);
                var redAlarmAt = parseInt(TotalDiffrence * 0.90);
                $scope.projectGlobalSetting.knowledgeProfileGreenAlarmTime = moment(new Date(startdatetime.getTime() + greenAlarmAt)).format('L LT');
                $scope.projectGlobalSetting.knowledgeProfileYellowAlarmTime = moment(new Date(startdatetime.getTime() + yellowAlarmAt)).format('L LT');
                $scope.projectGlobalSetting.knowledgeProfileRedAlarmTime = moment(new Date(enddatetime.getTime())).add(1, 'minutes').format('L LT');
            }
            $scope.goToNotificationTemplate = function (id) {
                if (id) {
                    var template = _.find(notificationTemplates, function (item) {
                        return item.id == id;
                    });
                    if (template) {
                        $location.path("/home/notificationTemplates/" + template.organizationId + "/edit/" + id);
                    }
                }
            }
            $scope.isDateTimeValid = function (date, isRequered) {
                if (isRequered) {
                    return datetimeCalculator.isValidDatePatern(date, 'L LT');
                } else {
                    return !date || datetimeCalculator.isValidDatePatern(date, 'L LT');
                }
            };

            $scope.checkChoseFromList = function (id, modelName, previous) {

                if (id == -1) {
                    var previousItem = (previous) ? parseInt(previous) : null;
                    var modalInstance = $modal.open({
                        animation: $scope.animationsEnabled,
                        templateUrl: 'views/profiles/stageGroups/views/notificationModal.html',
                        controller: 'NotificationModalCtrl',
                        controllerAs: 'modal',
                        size: 'lg',
                        resolve: {
                            previousItem: function () {
                                return previousItem;
                            }
                        }
                    });

                    modalInstance.result.then(function (selectedItem) {
                        setNotificationModel(modelName, selectedItem);
                    });
                }
            }

            $scope.StartDateOpen = function () {
                var datepicker = $(event.sender.element).data("kendoDateTimePicker");
                datepicker.setOptions({
                    min: kendo.parseDate(moment({ hour: 0, minute: -1, seconds: 0, milliseconds: 0 })._d)
                });
            }
            $scope.StartDateChange = function () {
                if (!(kendo.parseDate($scope.project.expectedStartDate) > kendo.parseDate($scope.project.expectedEndDate))) {
                    $scope.project.expectedEndDate = "";
                }
            };
            $scope.EndDateOpen = function (event) {
                var datepicker = $(event.sender.element).data("kendoDateTimePicker")
                datepicker.setOptions({
                    min: kendo.parseDate(moment({ hour: 0, minute: 0, seconds: 0, milliseconds: 0 })._d)
                });

            };
            $scope.currentStepIndex = 1;
            $scope.init = function () {
                //$('#form_projectsetup_wizard').bootstrapWizard({
                //    'nextSelector': '.button-next',
                //    'previousSelector': '.button-previous',
                //    onTabClick: function (tab, navigation, index, clickedIndex) {
                //        if (clickedIndex == 1) {
                //            if ((!$scope.formProjectSetup.$valid)) {
                //                dialogService.showNotification($translate.instant('MYPROJECTS_PLEASE_FILL_ALL_THE_REQUIRED_FIELDS'), "error");
                //                return false;
                //            }


                //        }
                //        else if (clickedIndex == 2) {
                //            if ((!$scope.formProjectMissionVisionSetup.$valid)) {
                //                dialogService.showNotification($translate.instant('MYPROJECTS_PLEASE_FILL_ALL_THE_REQUIRED_FIELDS'), "error");
                //                return false;
                //            }
                //            else if ((!$scope.projectGoalStrategies.length > 0)) {
                //                dialogService.showNotification($translate.instant('MYPROJECTS_ADD_ATLEAST_ONE_GOAL_STRATEGY'), "error");
                //                return false;
                //            }

                //        }
                //        else if (clickedIndex == 3) {
                //            if ($scope.projectSteeringGroups.length > 0) {
                //                var hasError = false;
                //                _.each($scope.projectSteeringGroups, function (projectSteeringGroupItem) {
                //                    if (!(projectSteeringGroupItem.users.length > 0)) {
                //                        dialogService.showNotification($translate.instant('MYPROJECTS_ADD_ATLEAST_ONE_MEMBER_IN') + " " + projectSteeringGroupItem.name + " " + $translate.instant('MYPROJECTS_STEERING_GROUP'), "error");
                //                        hasError = true;
                //                        return (false);
                //                    }
                //                });
                //                if (hasError) {
                //                    return false;
                //                }
                //            }
                //            else {
                //                dialogService.showNotification($translate.instant('MYPROJECTS_ADD_ATLEAST_ONE_STEERING_GROUP'), "error");
                //                return false;
                //            }
                //        }
                //        else if (clickedIndex == 4) {
                //            if (!$scope.formGlobalSettingSetup.$valid) {
                //                dialogService.showNotification($translate.instant('MYPROJECTS_PLEASE_SET_ALL_REQUIRED_SETTING'), "error");
                //                return false;
                //            }
                //        }
                //        else {
                //            $scope.handleTitle(tab, navigation, index);
                //        }
                //    },
                //    onNext: function (tab, navigation, index) {
                //        if (index == 1) {
                //            if ((!$scope.formProjectSetup.$valid)) {
                //                dialogService.showNotification($translate.instant('MYPROJECTS_PLEASE_FILL_ALL_THE_REQUIRED_FIELDS'), "error");
                //                return false;
                //            }
                //        }
                //        else if (index == 2) {

                //            if ((!$scope.formProjectMissionVisionSetup.$valid)) {
                //                dialogService.showNotification($translate.instant('MYPROJECTS_PLEASE_FILL_ALL_THE_REQUIRED_FIELDS'), "error");
                //                return false;
                //            }
                //            else if ((!$scope.projectGoalStrategies.length > 0)) {
                //                dialogService.showNotification($translate.instant('MYPROJECTS_ADD_ATLEAST_ONE_GOAL_STRATEGY'), "error");
                //                return false;
                //            }
                //        }
                //        else if (index == 3) {

                //            if ($scope.projectSteeringGroups.length > 0) {
                //                var hasError = false;
                //                _.each($scope.projectSteeringGroups, function (projectSteeringGroupItem) {
                //                    if (!(projectSteeringGroupItem.users.length > 0)) {
                //                        dialogService.showNotification($translate.instant('MYPROJECTS_ADD_ATLEAST_ONE_MEMBER_IN') + " " + projectSteeringGroupItem.name + " " + $translate.instant('MYPROJECTS_STEERING_GROUP'), "error");
                //                        hasError = true;
                //                        return (false);
                //                    }
                //                });
                //                if (hasError) {
                //                    return false;
                //                }

                //            }
                //            else {
                //                dialogService.showNotification($translate.instant('MYPROJECTS_ADD_ATLEAST_ONE_STEERING_GROUP'), "error");
                //                return false;
                //            }


                //        }
                //        else if (index == 4) {
                //            if (!$scope.formGlobalSettingSetup.$valid) {
                //                dialogService.showNotification($translate.instant('MYPROJECTS_PLEASE_SET_ALL_REQUIRED_SETTING'), "error");
                //                return false;
                //            }
                //        }
                //        else {
                //            $scope.handleTitle(tab, navigation, index);
                //        }
                //    },
                //    onTabShow: function (tab, navigation, index) {
                //        $scope.currentStepIndex = 0;
                //        var total = navigation.find('li').length;
                //        var current = index + 1;
                //        var $percent = (current / total) * 100;
                //        $('#form_projectsetup_wizard').find('.progress-bar').css({
                //            width: $percent + '%'
                //        });
                //        if (current == 3) {
                //            $scope.setTimeSpan();
                //            $scope.changeSoftProfileTimeSpan();
                //            $scope.changeKnowledgeProfileTimeSpan();
                //        }
                //        if (current == 4) {
                //            $scope.managers = [];
                //            $scope.trainers = [];
                //            _.forEach($scope.projectSteeringGroups, function (item) {
                //                if (item.roleId == 5) {
                //                    _.each(item.users, function (steeringGroupUser) {
                //                        if (steeringGroupUser) {
                //                            $scope.managers.push(steeringGroupUser);
                //                        }
                //                    })
                //                    //item.users = $scope.steeringGroupDetail.users;
                //                }
                //                if (item.roleId == 6) {
                //                    _.each(item.users, function (steeringGroupUser) {
                //                        if (steeringGroupUser) {
                //                            $scope.trainers.push(steeringGroupUser);
                //                        }
                //                    })
                //                }
                //            });
                //            if (!$scope.isEdit) {
                //                $scope.changeSoftProfileTimeSpan();
                //                $scope.changeKnowledgeProfileTimeSpan();
                //            }
                //        }
                //        $scope.setIndex(navigation, current);
                //    }
                //});
            }
            if ($scope.isEdit) {
                _.each($scope.project.projectSteeringGroups, function (item) {
                    if (item.users.length > 0) {
                        item.roleId = item.users[0].roleId;
                    }


                    $scope.projectSteeringGroups.push(item);
                });
                _.each($scope.project.projectGoals, function (item) {
                    $scope.projectGoalStrategies.push(item);
                });
                if ($scope.project.projectGlobalSettings.length > 0) {
                    $scope.projectGlobalSetting = $scope.project.projectGlobalSettings[0];

                    if (!($scope.projectGlobalSetting.startStageEndDate)) {
                        $scope.changeSoftProfileTimeSpan();
                        $scope.changeKnowledgeProfileTimeSpan();
                    }
                    else {
                        $scope.projectGlobalSetting.startStageStartDate = moment(kendo.parseDate($scope.projectGlobalSetting.startStageStartDate)).format('L LT');
                        $scope.projectGlobalSetting.startStageEndDate = moment(kendo.parseDate($scope.projectGlobalSetting.startStageEndDate)).format('L LT');
                        $scope.projectGlobalSetting.shortGoalStartDate = moment(kendo.parseDate($scope.projectGlobalSetting.shortGoalStartDate)).format('L LT');
                        $scope.projectGlobalSetting.shortGoalEndDate = moment(kendo.parseDate($scope.projectGlobalSetting.shortGoalEndDate)).format('L LT');
                        $scope.projectGlobalSetting.midGoalStartDate = moment(kendo.parseDate($scope.projectGlobalSetting.midGoalStartDate)).format('L LT');
                        $scope.projectGlobalSetting.midGoalEndDate = moment(kendo.parseDate($scope.projectGlobalSetting.midGoalEndDate)).format('L LT');
                        $scope.projectGlobalSetting.longTermGoalStartDate = moment(kendo.parseDate($scope.projectGlobalSetting.longTermGoalStartDate)).format('L LT');
                        $scope.projectGlobalSetting.longTermGoalEndDate = moment(kendo.parseDate($scope.projectGlobalSetting.longTermGoalEndDate)).format('L LT');
                        $scope.projectGlobalSetting.finalGoalStartDate = moment(kendo.parseDate($scope.projectGlobalSetting.finalGoalStartDate)).format('L LT');
                        $scope.projectGlobalSetting.finalGoalEndDate = moment(kendo.parseDate($scope.projectGlobalSetting.finalGoalEndDate)).format('L LT');
                        $scope.projectGlobalSetting.knowledgeProfileStartDate = moment(kendo.parseDate($scope.projectGlobalSetting.knowledgeProfileStartDate)).format('L LT');
                        $scope.projectGlobalSetting.knowledgeProfileEndDate = moment(kendo.parseDate($scope.projectGlobalSetting.knowledgeProfileEndDate)).format('L LT');


                        $scope.projectGlobalSetting.softProfileStartGreenAlarmTime = moment(kendo.parseDate($scope.projectGlobalSetting.softProfileStartGreenAlarmTime)).format('L LT');
                        $scope.projectGlobalSetting.softProfileStartYellowAlarmTime = moment(kendo.parseDate($scope.projectGlobalSetting.softProfileStartYellowAlarmTime)).format('L LT');
                        $scope.projectGlobalSetting.softProfileStartRedAlarmTime = moment(kendo.parseDate($scope.projectGlobalSetting.softProfileStartRedAlarmTime)).format('L LT');
                        $scope.projectGlobalSetting.softProfileShortGoalGreenAlarmTime = moment(kendo.parseDate($scope.projectGlobalSetting.softProfileShortGoalGreenAlarmTime)).format('L LT');
                        $scope.projectGlobalSetting.softProfileShortGoalYellowAlarmTime = moment(kendo.parseDate($scope.projectGlobalSetting.softProfileShortGoalYellowAlarmTime)).format('L LT');
                        $scope.projectGlobalSetting.softProfileShortGoalRedAlarmTime = moment(kendo.parseDate($scope.projectGlobalSetting.softProfileShortGoalRedAlarmTime)).format('L LT');
                        $scope.projectGlobalSetting.softProfileMidGoalGreenAlarmTime = moment(kendo.parseDate($scope.projectGlobalSetting.softProfileMidGoalGreenAlarmTime)).format('L LT');
                        $scope.projectGlobalSetting.softProfileMidGoalYellowAlarmTime = moment(kendo.parseDate($scope.projectGlobalSetting.softProfileMidGoalYellowAlarmTime)).format('L LT');
                        $scope.projectGlobalSetting.softProfileMidGoalRedAlarmTime = moment(kendo.parseDate($scope.projectGlobalSetting.softProfileMidGoalRedAlarmTime)).format('L LT');
                        $scope.projectGlobalSetting.softProfileLongTermGoalGreenAlarmTime = moment(kendo.parseDate($scope.projectGlobalSetting.softProfileLongTermGoalGreenAlarmTime)).format('L LT');
                        $scope.projectGlobalSetting.softProfileLongTermGoalYellowAlarmTime = moment(kendo.parseDate($scope.projectGlobalSetting.softProfileLongTermGoalYellowAlarmTime)).format('L LT');
                        $scope.projectGlobalSetting.softProfileLongTermGoalRedAlarmTime = moment(kendo.parseDate($scope.projectGlobalSetting.softProfileLongTermGoalRedAlarmTime)).format('L LT');
                        $scope.projectGlobalSetting.softProfileFinalGoalGreenAlarmTime = moment(kendo.parseDate($scope.projectGlobalSetting.softProfileFinalGoalGreenAlarmTime)).format('L LT');
                        $scope.projectGlobalSetting.softProfileFinalGoalYellowAlarmTime = moment(kendo.parseDate($scope.projectGlobalSetting.softProfileFinalGoalYellowAlarmTime)).format('L LT');
                        $scope.projectGlobalSetting.softProfileFinalGoalRedAlarmTime = moment(kendo.parseDate($scope.projectGlobalSetting.softProfileFinalGoalRedAlarmTime)).format('L LT');

                        $scope.projectGlobalSetting.knowledgeProfileGreenAlarmTime = moment(kendo.parseDate($scope.projectGlobalSetting.knowledgeProfileGreenAlarmTime)).format('L LT');
                        $scope.projectGlobalSetting.knowledgeProfileYellowAlarmTime = moment(kendo.parseDate($scope.projectGlobalSetting.knowledgeProfileYellowAlarmTime)).format('L LT');
                        $scope.projectGlobalSetting.knowledgeProfileRedAlarmTime = moment(kendo.parseDate($scope.projectGlobalSetting.knowledgeProfileRedAlarmTime)).format('L LT');

                    }
                }
                else {
                    $scope.setDefaults();
                }
                if ($scope.project.projectDefaultNotificationSettings) {
                    if ($scope.project.projectDefaultNotificationSettings.length > 0) {
                        $scope.projectDefaultNotificationSettings = $scope.project.projectDefaultNotificationSettings[0];
                    }
                    else {
                        $scope.setDefaultNotificationSettings();
                    }
                }
                else {
                    $scope.setDefaultNotificationSettings();
                }
            }
            else {
                $scope.setDefaults();
                $scope.setDefaultNotificationSettings();
            }

            $scope.next = function () {
                if ($scope.currentStepIndex == 1) {
                    if ((!$scope.formProjectSetup.$valid)) {
                        dialogService.showNotification($translate.instant('MYPROJECTS_PLEASE_FILL_ALL_THE_REQUIRED_FIELDS'), "error");
                        return false;
                    }
                    else {
                        $scope.currentStepIndex = 2;
                    }
                }
                else if ($scope.currentStepIndex == 2) {

                    if ((!$scope.formProjectMissionVisionSetup.$valid)) {
                        dialogService.showNotification($translate.instant('MYPROJECTS_PLEASE_FILL_ALL_THE_REQUIRED_FIELDS'), "error");
                        return false;
                    }
                    else if ((!$scope.projectGoalStrategies.length > 0)) {
                        dialogService.showNotification($translate.instant('MYPROJECTS_ADD_ATLEAST_ONE_GOAL_STRATEGY'), "error");
                        return false;
                    }
                    else {
                        $scope.currentStepIndex = 3;
                    }
                }
                else if ($scope.currentStepIndex == 3) {

                    if ($scope.projectSteeringGroups.length > 0) {
                        var hasError = false;
                        _.each($scope.projectSteeringGroups, function (projectSteeringGroupItem) {
                            if (!(projectSteeringGroupItem.users.length > 0)) {
                                dialogService.showNotification($translate.instant('MYPROJECTS_ADD_ATLEAST_ONE_MEMBER_IN') + " " + projectSteeringGroupItem.name + " " + $translate.instant('MYPROJECTS_STEERING_GROUP'), "error");
                                hasError = true;
                                return (false);
                            }
                        });
                        if (hasError) {
                            return false;
                        }
                        else {
                            $scope.currentStepIndex = 4;
                        }

                    }
                    else {
                        dialogService.showNotification($translate.instant('MYPROJECTS_ADD_ATLEAST_ONE_STEERING_GROUP'), "error");
                        return false;
                    }


                }
                else if ($scope.currentStepIndex == 4) {
                    if (!$scope.formGlobalSettingSetup.$valid) {
                        dialogService.showNotification($translate.instant('MYPROJECTS_PLEASE_SET_ALL_REQUIRED_SETTING'), "error");
                        return false;
                    }
                    else {
                        $scope.currentStepIndex = 5;
                    }
                }
                $scope.onTabShow();
            }
            $scope.back = function () {
                if ($scope.currentStepIndex > 1) {
                    $scope.currentStepIndex = $scope.currentStepIndex - 1;
                }
                //if ($scope.currentStepIndex == 2) {

                //    if ((!$scope.formProjectMissionVisionSetup.$valid)) {
                //        dialogService.showNotification($translate.instant('MYPROJECTS_PLEASE_FILL_ALL_THE_REQUIRED_FIELDS'), "error");
                //        return false;
                //    }
                //    else if ((!$scope.projectGoalStrategies.length > 0)) {
                //        dialogService.showNotification($translate.instant('MYPROJECTS_ADD_ATLEAST_ONE_GOAL_STRATEGY'), "error");
                //        return false;
                //    }
                //    else {
                //        $scope.currentStepIndex = 1;
                //    }
                //}
                //else if ($scope.currentStepIndex == 3) {

                //    if ($scope.projectSteeringGroups.length > 0) {
                //        var hasError = false;
                //        _.each($scope.projectSteeringGroups, function (projectSteeringGroupItem) {
                //            if (!(projectSteeringGroupItem.users.length > 0)) {
                //                dialogService.showNotification($translate.instant('MYPROJECTS_ADD_ATLEAST_ONE_MEMBER_IN') + " " + projectSteeringGroupItem.name + " " + $translate.instant('MYPROJECTS_STEERING_GROUP'), "error");
                //                hasError = true;
                //                return (false);
                //            }
                //        });
                //        if (hasError) {
                //            return false;
                //        }
                //        else {
                //            $scope.currentStepIndex = 2;
                //        }

                //    }
                //    else {
                //        dialogService.showNotification($translate.instant('MYPROJECTS_ADD_ATLEAST_ONE_STEERING_GROUP'), "error");
                //        return false;
                //    }


                //}
                //else if ($scope.currentStepIndex == 4) {
                //    if (!$scope.formGlobalSettingSetup.$valid) {
                //        dialogService.showNotification($translate.instant('MYPROJECTS_PLEASE_SET_ALL_REQUIRED_SETTING'), "error");
                //        return false;
                //    }
                //    else {
                //        $scope.currentStepIndex = 3;
                //    }
                //}
                //else if ($scope.currentStepIndex == 5) {
                //    $scope.currentStepIndex = 4;
                //}
                $scope.onTabShow();
            }
            $scope.tabClick = function (clickedIndex) {
                if (clickedIndex > $scope.currentStepIndex) {
                    if ($scope.currentStepIndex == 1) {
                        if ((!$scope.formProjectSetup.$valid)) {
                            dialogService.showNotification($translate.instant('MYPROJECTS_PLEASE_FILL_ALL_THE_REQUIRED_FIELDS'), "error");
                            return false;
                        }
                    }
                    else if ($scope.currentStepIndex == 2) {
                        if ((!$scope.formProjectMissionVisionSetup.$valid)) {
                            dialogService.showNotification($translate.instant('MYPROJECTS_PLEASE_FILL_ALL_THE_REQUIRED_FIELDS'), "error");
                            return false;
                        }
                        else if ((!$scope.projectGoalStrategies.length > 0)) {
                            dialogService.showNotification($translate.instant('MYPROJECTS_ADD_ATLEAST_ONE_GOAL_STRATEGY'), "error");
                            return false;
                        }

                    }
                    else if ($scope.currentStepIndex == 3) {
                        if ($scope.projectSteeringGroups.length > 0) {
                            var hasError = false;
                            _.each($scope.projectSteeringGroups, function (projectSteeringGroupItem) {
                                if (!(projectSteeringGroupItem.users.length > 0)) {
                                    dialogService.showNotification($translate.instant('MYPROJECTS_ADD_ATLEAST_ONE_MEMBER_IN') + " " + projectSteeringGroupItem.name + " " + $translate.instant('MYPROJECTS_STEERING_GROUP'), "error");
                                    hasError = true;
                                    return (false);
                                }
                            });
                            if (hasError) {
                                return false;
                            }
                        }
                        else {
                            dialogService.showNotification($translate.instant('MYPROJECTS_ADD_ATLEAST_ONE_STEERING_GROUP'), "error");
                            return false;
                        }
                    }
                    else if ($scope.currentStepIndex == 4) {
                        if (!$scope.formGlobalSettingSetup.$valid) {
                            dialogService.showNotification($translate.instant('MYPROJECTS_PLEASE_SET_ALL_REQUIRED_SETTING'), "error");
                            return false;
                        }
                    }
                    $scope.currentStepIndex = clickedIndex;
                    $scope.onTabShow();
                }
                else {
                    $scope.currentStepIndex = clickedIndex;
                    $scope.onTabShow();
                }
            }
            $scope.onTabShow = function () {
                var current = $scope.currentStepIndex;
                if (current == 3) {
                    $scope.setTimeSpan();
                    $scope.changeSoftProfileTimeSpan();
                    $scope.changeKnowledgeProfileTimeSpan();
                }
                if (current == 4) {
                    $scope.managers = [];
                    $scope.trainers = [];
                    _.forEach($scope.projectSteeringGroups, function (item) {
                        if (item.roleId == 5) {
                            _.each(item.users, function (steeringGroupUser) {
                                if (steeringGroupUser) {
                                    $scope.managers.push(steeringGroupUser);
                                }
                            })
                            //item.users = $scope.steeringGroupDetail.users;
                        }
                        if (item.roleId == 6) {
                            _.each(item.users, function (steeringGroupUser) {
                                if (steeringGroupUser) {
                                    $scope.trainers.push(steeringGroupUser);
                                }
                            })
                        }
                    });
                    if (!$scope.isEdit) {
                        $scope.changeSoftProfileTimeSpan();
                        $scope.changeKnowledgeProfileTimeSpan();
                    }
                }
                if (current == 5) {
                    $scope.project.projectSteeringGroups = $scope.projectSteeringGroups;
                    $scope.project.projectGoals = $scope.projectGoalStrategies;
                }
                var tabId = $(".wizardStep[data-step='" + $scope.currentStepIndex + "']").data("target");
                if (tabId) {
                    if ($(tabId).length > 0) {
                        $(".wizardStep.active").removeClass("active");
                        $(".wizard.tab-pane.active").removeClass("active");
                        $(".wizardStep[data-step=" + $scope.currentStepIndex + "]").addClass("active");
                        $(tabId).addClass("active");
                    }
                    //$scope.setIndex(navigation, current);
                }
            }
            $scope.isLocked = function () {
                return $scope.currentStepIndex == 5;
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
                    $('#form_projectsetup_wizard').find('.button-previous').hide();
                } else {
                    $scope.currentStepIndex = current;
                    $('#form_projectsetup_wizard').find('.button-previous').show();


                }
                if (current >= total) {
                    $('#form_projectsetup_wizard').find('.button-next').hide();
                    $('#form_projectsetup_wizard').find('.button-submit').show();

                } else {
                    $('#form_projectsetup_wizard').find('.button-next').show();
                    $('#form_projectsetup_wizard').find('.button-submit').hide();
                }

            }
            $scope.openNewSteeringGroupModal = function () {
                $scope.steeringGroupDetail = {
                    id: 0,
                    organizationId: null,
                    name: $translate.instant('MYPROJECTS_GROUP1'),
                    roleName: "",
                    roleId: null,
                    users: [],
                };
                $scope.steeringGroupUserModel = [];
                $("#steeringGroupModal").modal("show");
            }
            $scope.cancelSteeringGroup = function () {

            }
            $scope.addNewSteeringGroup = function () {
                if ($scope.formSteeringGroup.$valid) {
                    if ($scope.steeringGroupDetail.id == 0) {
                        $scope.steeringGroupDetail.id = ($scope.projectSteeringGroups.length + 1) * -1;
                        $scope.projectSteeringGroups.push($scope.steeringGroupDetail)
                    }
                    else {
                        _.forEach($scope.projectSteeringGroups, function (item) {
                            if (item.id == $scope.steeringGroupDetail.id) {
                                item.name = $scope.steeringGroupDetail.name;
                                if (item.roleId != $scope.steeringGroupDetail.roleId) {

                                    _.each(item.users, function (steeringGroupUser) {
                                        if (steeringGroupUser) {
                                            var role = _.find($scope.projectRoles, function (roleItem) {
                                                return roleItem.id == $scope.steeringGroupDetail.roleId;
                                            });
                                            if (role) {
                                                steeringGroupUser.roleName = role.name;
                                                item.roleName = $scope.steeringGroupDetail.roleName;

                                            }
                                            steeringGroupUser.roleId = $scope.steeringGroupDetail.roleId;
                                            item.roleId = $scope.steeringGroupDetail.roleId;
                                        }
                                    })
                                }

                                //item.users = $scope.steeringGroupDetail.users;
                            }
                        });
                        //$scope.projectSteeringGroups.push($scope.steeringGroupDetail)
                    }
                }
            }

            $scope.openNewSteeringGroupUser = function (steeringGroupId) {
                $scope.steeringGroupDetail = _.find($scope.projectSteeringGroups, function (item, itemIndex) {
                    return item.id == steeringGroupId;
                });
                if ($scope.steeringGroupDetail.users.length > 0) {
                    $scope.steeringGroupDetail.roleId = $scope.steeringGroupDetail.users[0].roleId;
                }
                $scope.steeringGroupUserModel = [];
                $scope.organizationChange();
                $("#steeringGroupUserModal").modal("show");
            }

            $scope.addNewSteeringGroupUser = function () {
                if ($scope.formSteeringGroupUser.$valid) {
                    if ($scope.steeringGroupUserModel.length > 0) {
                        if ($scope.steeringGroupDetail.id != 0) {
                            _.forEach($scope.steeringGroupUserModel, function (item, index) {
                                var steeringGroupUser = _.find($scope.steeringGroupUsers, function (groupUsersItem) {
                                    return item.id == groupUsersItem.id;
                                });
                                if (steeringGroupUser) {
                                    var role = _.find($scope.projectRoles, function (roleItem) {
                                        return roleItem.id == $scope.steeringGroupDetail.roleId;
                                    });
                                    if (role) {
                                        steeringGroupUser.roleName = role.name;
                                    }
                                    steeringGroupUser["roleId"] = $scope.steeringGroupDetail.roleId;
                                    steeringGroupUser["userId"] = steeringGroupUser.id;
                                    steeringGroupUser["organizationId"] = $scope.steeringGroupDetail.organizationId;
                                    projectsManager.getUserInfo(steeringGroupUser.id).then(function (userData) {
                                        steeringGroupUser["userInfo"] = userData;
                                        $scope.steeringGroupDetail.users.push(steeringGroupUser);
                                    })

                                    //$scope.steeringGroupDetail.users.push({ userId: steeringGroupUser.id, roleId: $scope.steeringGroupDetail.roleId, steeringGroupId: $scope.steeringGroupDetail.id });
                                }
                            });
                            _.each($scope.projectSteeringGroups, function (item) {
                                if (item.id == $scope.steeringGroupDetail.id) {
                                    item.users = $scope.steeringGroupDetail.users;
                                }
                            })
                        }
                    }
                    else {
                        dialogService.showNotification($translate.instant('MYPROJECTS_PLEASE_SELECT_ATLEAST_ONE_USER'), "warning");
                    }
                }
            }

            $scope.editSteeringGroup = function (steeringGroupId) {
                var steeringGroupDetail = _.find($scope.projectSteeringGroups, function (item, itemIndex) {
                    return item.id == steeringGroupId;
                });
                if (steeringGroupDetail) {
                    $scope.steeringGroupDetail = angular.copy(steeringGroupDetail);
                    if ($scope.steeringGroupDetail.users.length > 0) {
                        $scope.steeringGroupDetail.roleId = $scope.steeringGroupDetail.users[0].roleId;
                    }
                    $("#steeringGroupModal").modal("show");
                }
                else {
                    dialogService.showNotification($translate.instant('MYPROJECTS_STEERING_GROUP_NOT_FOUND'), "error");
                }
            }
            $scope.deleteSteeringGroup = function (steeringGroupId) {
                dialogService.showYesNoDialog($translate.instant('COMMON_CONFIRM'), $translate.instant('COMMON_ARE_YOU_SURE_YOU_WANT_TO_DELETE')).then(
                    function () {
                        var steeringGroupIndex = _.findIndex($scope.projectSteeringGroups, function (item) {
                            return item.id == steeringGroupId;
                        });
                        $scope.projectSteeringGroups.splice(steeringGroupIndex, 1);
                    },
                    function () {
                        //alert('No clicked');
                    });
            }
            $scope.deletesteeringGroupUser = function (steeringGroupId, userId) {

                dialogService.showYesNoDialog($translate.instant('COMMON_CONFIRM'), $translate.instant('COMMON_ARE_YOU_SURE_YOU_WANT_TO_DELETE')).then(
                    function () {
                        _.forEach($scope.projectSteeringGroups, function (item) {
                            if (item.id == steeringGroupId) {
                                var userIndex = _.findIndex(item.users, function (userItem) { return userItem.id == userId });
                                item.users.splice(userIndex, 1);
                            }
                        });
                    },
                    function () {
                        //alert('No clicked');
                    });



            }
            $scope.setIndex = function (navigation, current) {
                var total = navigation.find('li').length;
                $scope.currentStepIndex = current;
                if (current == 1) {
                    $scope.currentStepIndex = 1;
                    $('#form_projectsetup_wizard').find('.button-previous').hide();
                } else {
                    $scope.currentStepIndex = current;
                    $('#form_projectsetup_wizard').find('.button-previous').show();
                }
                if (current >= total) {
                    $('#form_projectsetup_wizard').find('.button-next').hide();
                    $('#form_projectsetup_wizard').find('.button-submit').show();
                    $scope.project.projectSteeringGroups = $scope.projectSteeringGroups;
                    $scope.project.projectGoals = $scope.projectGoalStrategies;
                } else {
                    $('#form_projectsetup_wizard').find('.button-next').show();
                    $('#form_projectsetup_wizard').find('.button-submit').hide();
                }
            }
            $scope.isFormContinueDisabled = function () {
                if ($scope.currentStepIndex == 1) {
                    if ((!$scope.formProjectSetup.$valid)) {
                        return true;
                    }

                }
                if ($scope.currentStepIndex == 2) {
                    if ((!$scope.projectGoalStrategies.length > 0)) {
                        return true;
                    }
                }
                if ($scope.currentStepIndex == 3) {
                    if (!$scope.projectSteeringGroups.length > 0) {
                        return true;
                    }
                    else {
                        _.each($scope.projectSteeringGroups, function (projectSteeringGroupItem) {
                            if (!(projectSteeringGroupItem.users.length > 0)) {
                                return true;
                                return (false);
                            }
                        });
                    }

                }
                return false;
            }

            $scope.isFormContinueDisabledClass = function () {
                if ($scope.currentStepIndex == 1) {
                    if (!($scope.formProjectSetup.$valid)) {
                        return "btn-cstm";
                    }

                }
                if ($scope.currentStepIndex == 2) {

                    if (!$scope.projectGoalStrategies.length > 0) {
                        return "btn-cstm";
                    }


                }
                if ($scope.currentStepIndex == 3) {
                    if (!$scope.projectSteeringGroups.length > 0) {
                        return "btn-cstm";
                    }
                    _.each($scope.projectSteeringGroups, function (projectSteeringGroupItem) {
                        if (!(projectSteeringGroupItem.users.length > 0)) {
                            return "btn-cstm";
                            return (false);
                        }
                    });
                }

                return "green";
            }
            $scope.steeringGroupUserCustomTexts = { buttonDefaultText: $translate.instant('MYPROJECTS_SELECT_USERS') };
            $scope.steeringGroupUserModel = [];
            $scope.steeringGroupUsers = [];//[{ id: 1, firstName: "User", lastName: "1", roleName: "" }, { id: 2, firstName: "User", lastName: "2", roleName: "" }, { id: 3, firstName: "User", lastName: "3", roleName: "" }, { id: 4, firstName: "User", lastName: "4", roleName: "" }, { id: 5, firstName: "User", lastName: "5", roleName: "" }]
            $scope.steeringGroupUsersOptions = getMultiSelectOptions($scope.steeringGroupUsers);
            $scope.smartButtonSettings = {
                smartButtonMaxItems: 3,
                smartButtonTextConverter: function (itemText, originalItem) {
                    return itemText;
                },
                itemTemplate: '<b>{{option.label}}</b>'
            };
            $scope.steeringGroupUsersButtonSettings = {
                smartButtonMaxItems: 2,
                smartButtonTextConverter: function (itemText, originalItem) {
                    return itemText;
                },
                itemTemplate: '<b>{{option.label}}</b>'
            };

            $scope.steeringGroupUsersEvents = {
                onItemSelect: function (item) {
                    steeringGroupUsersChanged();
                },
                onItemDeselect: function (item) {
                    steeringGroupUsersChanged();
                },
                onSelectAll: function () {
                    //$scope.steeringGroupUserModel = getKendoMultiSelectAllModel($scope.filter.mainEvaluatorsOptions);
                    steeringGroupUsersChanged();
                },
                onDeselectAll: function () {
                    $scope.steeringGroupUserModel = [];
                    steeringGroupUsersChanged();
                }
            };
            function getMultiSelectOptions(data) {
                var options = [];
                _.forEach(data, function (item, index) {
                    options.push({ id: item.id, label: item.firstName + " " + item.lastName });
                });
                return options;
            }
            function steeringGroupUsersChanged() {
            };

            $scope.openNewGoalStrategyModal = function () {
                $scope.goalStrategyDetail = {
                    id: 0,
                    goal: $translate.instant('MYPROJECTS_GOAL1'),
                    strategy: $translate.instant('MYPROJECTS_STRATEGY1')
                };
                $("#goalStrategyModal").modal("show");
            }
            $scope.cancelGoalStrategy = function () {

            }
            $scope.addNewGoalStrategy = function () {
                if ($scope.formGoalStrategy.$valid) {
                    if ($scope.goalStrategyDetail.id == 0) {
                        $scope.goalStrategyDetail.id = ($scope.projectGoalStrategies.length + 1) * -1;
                        $scope.projectGoalStrategies.push($scope.goalStrategyDetail);
                    }
                    else {
                        _.forEach($scope.projectGoalStrategies, function (item) {
                            if (item.id == $scope.goalStrategyDetail.id) {
                                item.goal = $scope.goalStrategyDetail.goal;
                                item.strategy = $scope.goalStrategyDetail.strategy;
                            }
                        })
                    }
                }
            }
            $scope.editGoalStrategy = function (goalStrategyId) {

                $scope.goalStrategyDetail = _.find($scope.projectGoalStrategies, function (item, itemIndex) {
                    return item.id == goalStrategyId;
                });
                $("#goalStrategyModal").modal("show");
            }
            $scope.deleteGoalStrategy = function (goalStrategyId) {
                dialogService.showYesNoDialog($translate.instant('COMMON_CONFIRM'), $translate.instant('COMMON_ARE_YOU_SURE_YOU_WANT_TO_DELETE')).then(
                    function () {
                        var index = _.findIndex($scope.projectGoalStrategies, function (item, itemIndex) {
                            return item.id == goalStrategyId;
                        });
                        $scope.projectGoalStrategies.splice(index, 1);
                    },
                    function () {
                        //alert('No clicked');
                    });
            }

            $scope.organizationChange = function () {
                projectsManager.GetUsersbyOrganizationId($scope.steeringGroupDetail.organizationId).then(function (data) {
                    $scope.steeringGroupUsers = $scope.removeAlreadyAddedUser(data);

                    $scope.steeringGroupUsersOptions = getMultiSelectOptions($scope.steeringGroupUsers);

                });
            }

            $scope.saveProject = function () {
                if ($scope.isEdit) {
                    if ($scope.project.id > 0) {
                        $scope.project.projectGlobalSettings = [$scope.projectGlobalSetting];
                        $scope.project.projectDefaultNotificationSettings = [$scope.projectDefaultNotificationSettings];
                        var project = _.clone($scope.project);
                        project.expectedEndDate = kendo.parseDate(project.expectedEndDate);
                        project.expectedStartDate = kendo.parseDate(project.expectedStartDate);

                        project.projectGlobalSettings[0].startStageStartDate = kendo.parseDate(project.projectGlobalSettings[0].startStageStartDate);
                        project.projectGlobalSettings[0].startStageEndDate = kendo.parseDate(project.projectGlobalSettings[0].startStageEndDate);
                        project.projectGlobalSettings[0].shortGoalStartDate = kendo.parseDate(project.projectGlobalSettings[0].shortGoalStartDate);
                        project.projectGlobalSettings[0].shortGoalEndDate = kendo.parseDate(project.projectGlobalSettings[0].shortGoalEndDate);
                        project.projectGlobalSettings[0].midGoalStartDate = kendo.parseDate(project.projectGlobalSettings[0].midGoalStartDate);
                        project.projectGlobalSettings[0].midGoalEndDate = kendo.parseDate(project.projectGlobalSettings[0].midGoalEndDate);
                        project.projectGlobalSettings[0].longTermGoalStartDate = kendo.parseDate(project.projectGlobalSettings[0].longTermGoalStartDate);
                        project.projectGlobalSettings[0].longTermGoalEndDate = kendo.parseDate(project.projectGlobalSettings[0].longTermGoalEndDate);
                        project.projectGlobalSettings[0].finalGoalStartDate = kendo.parseDate(project.projectGlobalSettings[0].finalGoalStartDate);
                        project.projectGlobalSettings[0].finalGoalEndDate = kendo.parseDate(project.projectGlobalSettings[0].finalGoalEndDate);
                        project.projectGlobalSettings[0].knowledgeProfileStartDate = kendo.parseDate(project.projectGlobalSettings[0].knowledgeProfileStartDate);
                        project.projectGlobalSettings[0].knowledgeProfileEndDate = kendo.parseDate(project.projectGlobalSettings[0].knowledgeProfileEndDate);

                        projectsManager.updateProject(project).then(function (data) {
                            if (data > 0) {
                                var message = $translate.instant('MYPROJECTS_DO_YOU_WANT_TO_CONTINUE_WITH_PROFILE_STEP')
                                projectsManager.hasProjectProfiles($scope.project.id).then(function (data) {
                                    if (data) {
                                        message = $translate.instant('MYPROJECTS_YOU_ALREADY_HAVE_PROFILES_FOR_THIS_PROJECT') + $translate.instant('MYPROJECTS_DO_YOU_WANT_TO_ADD_MORE_PROFILES')
                                    }
                                    dialogService.showNotification($translate.instant('MYPROJECTS_PROJECT_DETAIL_UPDATED_SUCCESSFULLY'), "success");
                                    if (!$scope.project.isActive) {
                                        dialogService.showYesNoDialog($translate.instant('COMMON_CONFIRM'), $translate.instant('MYPROJECTS_DO_YOU_WANT_TO') + "/'" + $translate.instant('MYPROJECTS_START_THE_PROJECT_NOW') + "/'?</br>" + $translate.instant('MYPROJECTS_IT_WILL_SEND_OUT_INVITATIONS_TO_RUN_THE_PROFILES_TO_ALL_SELECTED_USERS') + $translate.instant('MYPROJECTS_IF_NOT_YOU_MAY_AT_ANY_TIME_LOG_INTO') + "/'" + $translate.instant('MYPROJECTS_MY_PROJECTS') + "/'" + $translate.instant('MYPROJECTS_IN_THE_UPPER_RIGHT_CORNER_BELOW_YOUR_NAME_TO_MANAGE_YOUR_PROJECTS') + $translate.instant('MYPROJECTS_THANK_YOU')).then(function () {
                                            projectsManager.startProject(project.id).then(function () {
                                                dialogService.showNotification($translate.instant('MYPROJECTS_PROJECT_HAS_BEEN_STARTED'), "success");
                                                $location.path("/home/activeProjects");
                                            });
                                        });
                                    }
                                })


                                //$location.path("/projects");
                            }
                            else {
                                dialogService.showNotification($translate.instant('MYPROJECTS_PROJECT_DETAIL_UPDATE_FAILED'), "error");
                            }
                        });
                    }
                }
                else {
                    $scope.project.projectGlobalSettings = [$scope.projectGlobalSetting];
                    $scope.project.projectDefaultNotificationSettings = [$scope.projectDefaultNotificationSettings];

                    var project = _.clone($scope.project);
                    project.expectedEndDate = kendo.parseDate(project.expectedEndDate);
                    project.expectedStartDate = kendo.parseDate(project.expectedStartDate);
                    project.projectGlobalSettings[0].startStageStartDate = kendo.parseDate(project.projectGlobalSettings[0].startStageStartDate);
                    project.projectGlobalSettings[0].startStageEndDate = kendo.parseDate(project.projectGlobalSettings[0].startStageEndDate);
                    project.projectGlobalSettings[0].shortGoalStartDate = kendo.parseDate(project.projectGlobalSettings[0].shortGoalStartDate);
                    project.projectGlobalSettings[0].shortGoalEndDate = kendo.parseDate(project.projectGlobalSettings[0].shortGoalEndDate);
                    project.projectGlobalSettings[0].midGoalStartDate = kendo.parseDate(project.projectGlobalSettings[0].midGoalStartDate);
                    project.projectGlobalSettings[0].midGoalEndDate = kendo.parseDate(project.projectGlobalSettings[0].midGoalEndDate);
                    project.projectGlobalSettings[0].longTermGoalStartDate = kendo.parseDate(project.projectGlobalSettings[0].longTermGoalStartDate);
                    project.projectGlobalSettings[0].longTermGoalEndDate = kendo.parseDate(project.projectGlobalSettings[0].longTermGoalEndDate);
                    project.projectGlobalSettings[0].finalGoalStartDate = kendo.parseDate(project.projectGlobalSettings[0].finalGoalStartDate);
                    project.projectGlobalSettings[0].finalGoalEndDate = kendo.parseDate(project.projectGlobalSettings[0].finalGoalEndDate);
                    project.projectGlobalSettings[0].knowledgeProfileStartDate = kendo.parseDate(project.projectGlobalSettings[0].knowledgeProfileStartDate);
                    project.projectGlobalSettings[0].knowledgeProfileEndDate = kendo.parseDate(project.projectGlobalSettings[0].knowledgeProfileEndDate);
                    projectsManager.saveProject(project).then(function (data) {
                        if (data.id > 0) {
                            var message = $translate.instant('MYPROJECTS_DO_YOU_WANT_TO_START_THIS_PROJECT')
                            dialogService.showNotification($translate.instant('MYPROJECTS_PROJECT_SAVED_SUCCESSFULLY'), "success");
                            if (!$scope.project.isActive) {
                                dialogService.showYesNoDialog($translate.instant('COMMON_CONFIRM'), $translate.instant('MYPROJECTS_DO_YOU_WANT_TO') + "/'" + $translate.instant('MYPROJECTS_START_THE_PROJECT_NOW') + "/'?</br>" + $translate.instant('MYPROJECTS_IT_WILL_SEND_OUT_INVITATIONS_TO_RUN_THE_PROFILES_TO_ALL_SELECTED_USERS') + $translate.instant('MYPROJECTS_IF_NOT_YOU_MAY_AT_ANY_TIME_LOG_INTO') + "/'" + $translate.instant('MYPROJECTS_MY_PROJECTS') + "/'" + $translate.instant('MYPROJECTS_IN_THE_UPPER_RIGHT_CORNER_BELOW_YOUR_NAME_TO_MANAGE_YOUR_PROJECTS') + $translate.instant('MYPROJECTS_THANK_YOU')).then(function () {
                                    projectsManager.startProject(data.id).then(function () {
                                        dialogService.showNotification($translate.instant('MYPROJECTS_PROJECT_HAS_BEEN_STARTED'), "success");
                                        $location.path("/home/activeProjects");
                                    });
                                });
                            }
                        }
                        else {
                            dialogService.showNotification($translate.instant('MYPROJECTS_PROJECT_SAVED_FAILED'), "error");
                        }
                    });
                }
            }
            $scope.removeAlreadyAddedUser = function (data) {
                var ignoreUserIds = [];
                _.each($scope.projectSteeringGroups, function (item) {
                    _.each(item.users, function (userItem) {
                        ignoreUserIds.push(userItem.userId);
                    })

                });
                data = _.filter(data, function (dataItem) {
                    return ignoreUserIds.indexOf(dataItem.id) == -1
                })
                return data;
            }
            $scope.setTimeSpan = function () {

                var diffTime = null;
                var a = moment(kendo.parseDate($scope.project.expectedEndDate));
                var b = moment(kendo.parseDate($scope.project.expectedStartDate));
                // For Knowledge Profile
                diffTime = a.diff(b);
                var duration = moment.duration(diffTime);
                $scope.projectGlobalSetting.knowledgeProfileActualTimeSpan = diffTime,
                    $scope.projectGlobalSetting.knowledgeProfileMonthSpan = duration.months();
                $scope.projectGlobalSetting.knowledgeProfileWeekSpan = 0; // duration.weeks();
                $scope.projectGlobalSetting.knowledgeProfileDaySpan = duration.days();
                if ($scope.projectGlobalSetting.knowledgeProfileWeekSpan > 0) {
                    $scope.projectGlobalSetting.knowledgeProfileDaySpan = $scope.projectGlobalSetting.knowledgeProfileDaySpan - ($scope.projectGlobalSetting.knowledgeProfileWeekSpan * 7);
                }
                if (duration.years() > 0) {
                    $scope.projectGlobalSetting.knowledgeProfileMonthSpan = $scope.projectGlobalSetting.knowledgeProfileMonthSpan + (duration.years() * 12);
                }

                $scope.projectGlobalSetting.knowledgeProfileHourSpan = duration.hours();
                $scope.projectGlobalSetting.knowledgeProfileMinuteSpan = duration.minutes();


                // For Soft Profile   
                diffTime = a.diff(b) / 5 // 1
                duration = moment.duration(diffTime);
                $scope.projectGlobalSetting.softProfileActualTimeSpan = diffTime,
                    $scope.projectGlobalSetting.softProfileMonthSpan = duration.months();
                $scope.projectGlobalSetting.softProfileWeekSpan = duration.weeks();
                $scope.projectGlobalSetting.softProfileDaySpan = duration.days();
                if ($scope.projectGlobalSetting.softProfileWeekSpan > 0) {
                    $scope.projectGlobalSetting.softProfileDaySpan = $scope.projectGlobalSetting.softProfileDaySpan - ($scope.projectGlobalSetting.softProfileWeekSpan * 7);
                }
                if (duration.years() > 0) {
                    $scope.projectGlobalSetting.softProfileMonthSpan = $scope.projectGlobalSetting.softProfileMonthSpan + (duration.years() * 12);
                }
                $scope.projectGlobalSetting.softProfileHourSpan = duration.hours();
                $scope.projectGlobalSetting.softProfileMinuteSpan = duration.minutes();

            }
            //handler popover close
            $('[data-toggle="m-popover"]').popover({
                placement: 'bottom',
                html: 'true',
                title: '<span class="text-info"><strong>Info</strong></span> <i class="fa fa-close pull-right"></i>',
                content: 'test'
            })
            $(document).on("click", ".popover .fa-close", function () {
                $(this).parents(".popover").popover('hide');
            });

            $scope.EvaluatorStartNotificationTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if (item.stageTypeId == stageTypesEnum.StartProfile && item.notificationTemplateTypeId == templateTypeEnum.MilestoneStartNotification && item.evaluationRoleId == evaluationRolesEnum.evaluator && item.profileTypeId == profilesTypesEnum.soft) {
                    return true;
                }
                else {
                    return false;
                }
            }
            $scope.ParticipantStartNotificationTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if (item.stageTypeId == stageTypesEnum.StartProfile && item.notificationTemplateTypeId == templateTypeEnum.MilestoneStartNotification && item.evaluationRoleId == evaluationRolesEnum.participant && item.profileTypeId == profilesTypesEnum.soft) {
                    return true;
                }
                else {
                    return false;
                }
            }
            $scope.ManagerStartNotificationTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if (item.stageTypeId == stageTypesEnum.StartProfile && item.notificationTemplateTypeId == templateTypeEnum.MilestoneStartNotification && item.evaluationRoleId == evaluationRolesEnum.manager && item.profileTypeId == profilesTypesEnum.soft) {
                    return true;
                }
                else {
                    return false;
                }
            }
            $scope.TrainerStartNotificationTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if (item.stageTypeId == stageTypesEnum.StartProfile && item.notificationTemplateTypeId == templateTypeEnum.MilestoneStartNotification && item.evaluationRoleId == evaluationRolesEnum.trainer && item.profileTypeId == profilesTypesEnum.soft) {
                    return true;
                }
                else {
                    return false;
                }
            }
            $scope.ProjectManagerStartNotificationTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if (item.stageTypeId == stageTypesEnum.StartProfile && item.notificationTemplateTypeId == templateTypeEnum.MilestoneStartNotification && item.evaluationRoleId == evaluationRolesEnum.manager && item.profileTypeId == profilesTypesEnum.soft) {
                    return true;
                }
                else {
                    return false;
                }
            }

            $scope.EvaluatorCompleteNotificationTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if (item.stageTypeId == stageTypesEnum.StartProfile && item.notificationTemplateTypeId == templateTypeEnum.MilestoneCompleteNotification && item.evaluationRoleId == evaluationRolesEnum.evaluator && item.profileTypeId == profilesTypesEnum.soft) {
                    return true;
                }
                else {
                    return false;
                }
            }
            $scope.ParticipantCompleteNotificationTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if (item.stageTypeId == stageTypesEnum.StartProfile && item.notificationTemplateTypeId == templateTypeEnum.MilestoneCompleteNotification && item.evaluationRoleId == evaluationRolesEnum.participant && item.profileTypeId == profilesTypesEnum.soft) {
                    return true;
                }
                else {
                    return false;
                }
            }
            $scope.ManagerCompleteNotificationTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if (item.stageTypeId == stageTypesEnum.StartProfile && item.notificationTemplateTypeId == templateTypeEnum.MilestoneCompleteNotification && item.evaluationRoleId == evaluationRolesEnum.manager && item.profileTypeId == profilesTypesEnum.soft) {
                    return true;
                }
                else {
                    return false;
                }
            }
            $scope.TrainerCompleteNotificationTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if (item.stageTypeId == stageTypesEnum.StartProfile && item.notificationTemplateTypeId == templateTypeEnum.MilestoneCompleteNotification && item.evaluationRoleId == evaluationRolesEnum.trainer && item.profileTypeId == profilesTypesEnum.soft) {
                    return true;
                }
                else {
                    return false;
                }
            }
            $scope.ProjectManagerCompleteNotificationTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if (item.stageTypeId == stageTypesEnum.StartProfile && item.notificationTemplateTypeId == templateTypeEnum.MilestoneCompleteNotification && item.evaluationRoleId == evaluationRolesEnum.manager && item.profileTypeId == profilesTypesEnum.soft) {
                    return true;
                }
                else {
                    return false;
                }
            }


            $scope.EvaluatorResultNotificationTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if (item.stageTypeId == stageTypesEnum.StartProfile && item.notificationTemplateTypeId == templateTypeEnum.MilestoneResultNotification && item.evaluationRoleId == evaluationRolesEnum.evaluator && item.profileTypeId == profilesTypesEnum.soft) {
                    return true;
                }
                else {
                    return false;
                }
            }
            $scope.ParticipantResultNotificationTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if (item.stageTypeId == stageTypesEnum.StartProfile && item.notificationTemplateTypeId == templateTypeEnum.MilestoneResultNotification && item.evaluationRoleId == evaluationRolesEnum.participant && item.profileTypeId == profilesTypesEnum.soft) {
                    return true;
                }
                else {
                    return false;
                }
            }
            $scope.ManagerResultNotificationTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if (item.stageTypeId == stageTypesEnum.StartProfile && item.notificationTemplateTypeId == templateTypeEnum.MilestoneResultNotification && item.evaluationRoleId == evaluationRolesEnum.manager && item.profileTypeId == profilesTypesEnum.soft) {
                    return true;
                }
                else {
                    return false;
                }
            }
            $scope.TrainerResultNotificationTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if (item.stageTypeId == stageTypesEnum.StartProfile && item.notificationTemplateTypeId == templateTypeEnum.MilestoneResultNotification && item.evaluationRoleId == evaluationRolesEnum.trainer && item.profileTypeId == profilesTypesEnum.soft) {
                    return true;
                }
                else {
                    return false;
                }
            }
            $scope.ProjectManagerResultNotificationTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if (item.stageTypeId == stageTypesEnum.StartProfile && item.notificationTemplateTypeId == templateTypeEnum.MilestoneResultNotification && item.evaluationRoleId == evaluationRolesEnum.manager && item.profileTypeId == profilesTypesEnum.soft) {
                    return true;
                }
                else {
                    return false;
                }
            }

            $scope.StartStageGreenAlarmEvaluatorTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if (item.stageTypeId == stageTypesEnum.StartProfile && item.notificationTemplateTypeId == templateTypeEnum.GreenMilestoneAlarm && item.evaluationRoleId == evaluationRolesEnum.evaluator) {
                    return true;
                }
                else {
                    return false;
                }
            }
            $scope.StartStageGreenAlarmParticipantTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if (item.stageTypeId == stageTypesEnum.StartProfile && item.notificationTemplateTypeId == templateTypeEnum.GreenMilestoneAlarm && item.evaluationRoleId == evaluationRolesEnum.participant) {
                    return true;
                }
                else {
                    return false;
                }
            }
            $scope.StartStageGreenAlarmManagerTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if (item.stageTypeId == stageTypesEnum.StartProfile && item.notificationTemplateTypeId == templateTypeEnum.GreenMilestoneAlarm && item.evaluationRoleId == evaluationRolesEnum.manager) {
                    return true;
                }
                else {
                    return false;
                }
            }
            $scope.StartStageGreenAlarmTrainerTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if (item.stageTypeId == stageTypesEnum.StartProfile && item.notificationTemplateTypeId == templateTypeEnum.GreenMilestoneAlarm && item.evaluationRoleId == evaluationRolesEnum.trainer) {
                    return true;
                }
                else {
                    return false;
                }
            }
            $scope.StartStageGreenAlarmProjectManagerTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if (item.stageTypeId == stageTypesEnum.StartProfile && item.notificationTemplateTypeId == templateTypeEnum.GreenMilestoneAlarm && item.evaluationRoleId == evaluationRolesEnum.manager) {
                    return true;
                }
                else {
                    return false;
                }
            }

            $scope.StartStageYellowAlarmEvaluatorTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if (item.stageTypeId == stageTypesEnum.StartProfile && item.notificationTemplateTypeId == templateTypeEnum.YellowMilestoneAlarm && item.evaluationRoleId == evaluationRolesEnum.evaluator) {
                    return true;
                }
                else {
                    return false;
                }
            }
            $scope.StartStageYellowAlarmParticipantTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if (item.stageTypeId == stageTypesEnum.StartProfile && item.notificationTemplateTypeId == templateTypeEnum.YellowMilestoneAlarm && item.evaluationRoleId == evaluationRolesEnum.participant) {
                    return true;
                }
                else {
                    return false;
                }
            }
            $scope.StartStageYellowAlarmManagerTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if (item.stageTypeId == stageTypesEnum.StartProfile && item.notificationTemplateTypeId == templateTypeEnum.YellowMilestoneAlarm && item.evaluationRoleId == evaluationRolesEnum.manager) {
                    return true;
                }
                else {
                    return false;
                }
            }
            $scope.StartStageYellowAlarmTrainerTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if (item.stageTypeId == stageTypesEnum.StartProfile && item.notificationTemplateTypeId == templateTypeEnum.YellowMilestoneAlarm && item.evaluationRoleId == evaluationRolesEnum.trainer) {
                    return true;
                }
                else {
                    return false;
                }
            }
            $scope.StartStageYellowAlarmProjectManagerTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if (item.stageTypeId == stageTypesEnum.StartProfile && item.notificationTemplateTypeId == templateTypeEnum.YellowMilestoneAlarm && item.evaluationRoleId == evaluationRolesEnum.manager) {
                    return true;
                }
                else {
                    return false;
                }
            }

            $scope.StartStageRedAlarmEvaluatorTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if (item.stageTypeId == stageTypesEnum.StartProfile && item.notificationTemplateTypeId == templateTypeEnum.RedMilestoneAlarm && item.evaluationRoleId == evaluationRolesEnum.evaluator) {
                    return true;
                }
                else {
                    return false;
                }
            }
            $scope.StartStageRedAlarmParticipantTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if (item.stageTypeId == stageTypesEnum.StartProfile && item.notificationTemplateTypeId == templateTypeEnum.RedMilestoneAlarm && item.evaluationRoleId == evaluationRolesEnum.participant) {
                    return true;
                }
                else {
                    return false;
                }
            }
            $scope.StartStageRedAlarmManagerTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if (item.stageTypeId == stageTypesEnum.StartProfile && item.notificationTemplateTypeId == templateTypeEnum.RedMilestoneAlarm && item.evaluationRoleId == evaluationRolesEnum.manager) {
                    return true;
                }
                else {
                    return false;
                }
            }
            $scope.StartStageRedAlarmTrainerTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if (item.stageTypeId == stageTypesEnum.StartProfile && item.notificationTemplateTypeId == templateTypeEnum.RedMilestoneAlarm && item.evaluationRoleId == evaluationRolesEnum.trainer) {
                    return true;
                }
                else {
                    return false;
                }
            }
            $scope.StartStageRedAlarmProjectManagerTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if (item.stageTypeId == stageTypesEnum.StartProfile && item.notificationTemplateTypeId == templateTypeEnum.RedMilestoneAlarm && item.evaluationRoleId == evaluationRolesEnum.manager) {
                    return true;
                }
                else {
                    return false;
                }
            }

            $scope.ShortGoalEvaluatorTemplates = function (item) {
                if (item.stageTypeId == stageTypesEnum.ShortGoal && item.evaluationRoleId == evaluationRolesEnum.evaluator) {
                    return true;
                }
                else {
                    return false;
                }
            }
            $scope.ShortGoalParticipantTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if (item.stageTypeId == stageTypesEnum.ShortGoal && item.evaluationRoleId == evaluationRolesEnum.participant) {
                    return true;
                }
                else {
                    return false;
                }
            }
            $scope.ShortGoalManagerTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if (item.stageTypeId == stageTypesEnum.ShortGoal && item.evaluationRoleId == evaluationRolesEnum.manager) {
                    return true;
                }
                else {
                    return false;
                }
            }
            $scope.ShortGoalTrainerTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if (item.stageTypeId == stageTypesEnum.ShortGoal && item.evaluationRoleId == evaluationRolesEnum.trainer) {
                    return true;
                }
                else {
                    return false;
                }
            }
            $scope.ShortGoalProjectManagerTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if (item.stageTypeId == stageTypesEnum.ShortGoal && item.evaluationRoleId == evaluationRolesEnum.manager) {
                    return true;
                }
                else {
                    return false;
                }
            }

            $scope.ShortGoalGreenAlarmEvaluatorTemplates = function (item) {
                if (item.stageTypeId == stageTypesEnum.ShortGoal && item.evaluationRoleId == evaluationRolesEnum.evaluator) {
                    return true;
                }
                else {
                    return false;
                }
            }
            $scope.ShortGoalGreenAlarmParticipantTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if (item.stageTypeId == stageTypesEnum.ShortGoal && item.evaluationRoleId == evaluationRolesEnum.participant) {
                    return true;
                }
                else {
                    return false;
                }
            }
            $scope.ShortGoalGreenAlarmManagerTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if (item.stageTypeId == stageTypesEnum.ShortGoal && item.evaluationRoleId == evaluationRolesEnum.manager) {
                    return true;
                }
                else {
                    return false;
                }
            }
            $scope.ShortGoalGreenAlarmTrainerTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if (item.stageTypeId == stageTypesEnum.ShortGoal && item.evaluationRoleId == evaluationRolesEnum.trainer) {
                    return true;
                }
                else {
                    return false;
                }
            }
            $scope.ShortGoalGreenAlarmProjectManagerTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if (item.stageTypeId == stageTypesEnum.ShortGoal && item.evaluationRoleId == evaluationRolesEnum.manager) {
                    return true;
                }
                else {
                    return false;
                }
            }


            $scope.ShortGoalYellowAlarmEvaluatorTemplates = function (item) {
                if (item.stageTypeId == stageTypesEnum.ShortGoal && item.evaluationRoleId == evaluationRolesEnum.evaluator) {
                    return true;
                }
                else {
                    return false;
                }
            }
            $scope.ShortGoalYellowAlarmParticipantTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if (item.stageTypeId == stageTypesEnum.ShortGoal && item.evaluationRoleId == evaluationRolesEnum.participant) {
                    return true;
                }
                else {
                    return false;
                }
            }
            $scope.ShortGoalYellowAlarmManagerTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if (item.stageTypeId == stageTypesEnum.ShortGoal && item.evaluationRoleId == evaluationRolesEnum.manager) {
                    return true;
                }
                else {
                    return false;
                }
            }
            $scope.ShortGoalYellowAlarmTrainerTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if (item.stageTypeId == stageTypesEnum.ShortGoal && item.evaluationRoleId == evaluationRolesEnum.trainer) {
                    return true;
                }
                else {
                    return false;
                }
            }
            $scope.ShortGoalYellowAlarmProjectManagerTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if (item.stageTypeId == stageTypesEnum.ShortGoal && item.evaluationRoleId == evaluationRolesEnum.manager) {
                    return true;
                }
                else {
                    return false;
                }
            }

            $scope.ShortGoalRedAlarmEvaluatorTemplates = function (item) {
                if (item.stageTypeId == stageTypesEnum.ShortGoal && item.evaluationRoleId == evaluationRolesEnum.evaluator) {
                    return true;
                }
                else {
                    return false;
                }
            }
            $scope.ShortGoalRedAlarmParticipantTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if (item.stageTypeId == stageTypesEnum.ShortGoal && item.evaluationRoleId == evaluationRolesEnum.participant) {
                    return true;
                }
                else {
                    return false;
                }
            }
            $scope.ShortGoalRedAlarmManagerTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if (item.stageTypeId == stageTypesEnum.ShortGoal && item.evaluationRoleId == evaluationRolesEnum.manager) {
                    return true;
                }
                else {
                    return false;
                }
            }
            $scope.ShortGoalRedAlarmTrainerTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if (item.stageTypeId == stageTypesEnum.ShortGoal && item.evaluationRoleId == evaluationRolesEnum.trainer) {
                    return true;
                }
                else {
                    return false;
                }
            }
            $scope.ShortGoalRedAlarmProjectManagerTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if (item.stageTypeId == stageTypesEnum.ShortGoal && item.evaluationRoleId == evaluationRolesEnum.manager) {
                    return true;
                }
                else {
                    return false;
                }
            }


            $scope.MidGoalEvaluatorTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if (item.stageTypeId == stageTypesEnum.MidGoal && item.evaluationRoleId == evaluationRolesEnum.evaluator) {
                    return true;
                }
                else {
                    return false;
                }
            }
            $scope.MidGoalParticipantTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if (item.stageTypeId == stageTypesEnum.MidGoal && item.evaluationRoleId == evaluationRolesEnum.participant) {
                    return true;
                }
                else {
                    return false;
                }
            }
            $scope.MidGoalManagerTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if (item.stageTypeId == stageTypesEnum.MidGoal && item.evaluationRoleId == evaluationRolesEnum.manager) {
                    return true;
                }
                else {
                    return false;
                }
            }
            $scope.MidGoalTrainerTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if (item.stageTypeId == stageTypesEnum.MidGoal && item.evaluationRoleId == evaluationRolesEnum.trainer) {
                    return true;
                }
                else {
                    return false;
                }
            }
            $scope.MidGoalProjectManagerTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if (item.stageTypeId == stageTypesEnum.MidGoal && item.evaluationRoleId == evaluationRolesEnum.manager) {
                    return true;
                }
                else {
                    return false;
                }
            }

            $scope.MidGoalGreenAlarmEvaluatorTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if (item.stageTypeId == stageTypesEnum.MidGoal && item.evaluationRoleId == evaluationRolesEnum.evaluator) {
                    return true;
                }
                else {
                    return false;
                }
            }
            $scope.MidGoalGreenAlarmParticipantTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if (item.stageTypeId == stageTypesEnum.MidGoal && item.evaluationRoleId == evaluationRolesEnum.participant) {
                    return true;
                }
                else {
                    return false;
                }
            }
            $scope.MidGoalGreenAlarmManagerTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if (item.stageTypeId == stageTypesEnum.MidGoal && item.evaluationRoleId == evaluationRolesEnum.manager) {
                    return true;
                }
                else {
                    return false;
                }
            }
            $scope.MidGoalGreenAlarmTrainerTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if (item.stageTypeId == stageTypesEnum.MidGoal && item.evaluationRoleId == evaluationRolesEnum.trainer) {
                    return true;
                }
                else {
                    return false;
                }
            }
            $scope.MidGoalGreenAlarmProjectManagerTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if (item.stageTypeId == stageTypesEnum.MidGoal && item.evaluationRoleId == evaluationRolesEnum.manager) {
                    return true;
                }
                else {
                    return false;
                }
            }

            $scope.MidGoalYellowAlarmEvaluatorTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if (item.stageTypeId == stageTypesEnum.MidGoal && item.evaluationRoleId == evaluationRolesEnum.evaluator) {
                    return true;
                }
                else {
                    return false;
                }
            }
            $scope.MidGoalYellowAlarmParticipantTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if (item.stageTypeId == stageTypesEnum.MidGoal && item.evaluationRoleId == evaluationRolesEnum.participant) {
                    return true;
                }
                else {
                    return false;
                }
            }
            $scope.MidGoalYellowAlarmManagerTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if (item.stageTypeId == stageTypesEnum.MidGoal && item.evaluationRoleId == evaluationRolesEnum.manager) {
                    return true;
                }
                else {
                    return false;
                }
            }
            $scope.MidGoalYellowAlarmTrainerTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if (item.stageTypeId == stageTypesEnum.MidGoal && item.evaluationRoleId == evaluationRolesEnum.trainer) {
                    return true;
                }
                else {
                    return false;
                }
            }
            $scope.MidGoalYellowAlarmProjectManagerTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if (item.stageTypeId == stageTypesEnum.MidGoal && item.evaluationRoleId == evaluationRolesEnum.manager) {
                    return true;
                }
                else {
                    return false;
                }
            }

            $scope.MidGoalRedAlarmEvaluatorTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if (item.stageTypeId == stageTypesEnum.MidGoal && item.evaluationRoleId == evaluationRolesEnum.evaluator) {
                    return true;
                }
                else {
                    return false;
                }
            }
            $scope.MidGoalRedAlarmParticipantTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if (item.stageTypeId == stageTypesEnum.MidGoal && item.evaluationRoleId == evaluationRolesEnum.participant) {
                    return true;
                }
                else {
                    return false;
                }
            }
            $scope.MidGoalRedAlarmManagerTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if (item.stageTypeId == stageTypesEnum.MidGoal && item.evaluationRoleId == evaluationRolesEnum.manager) {
                    return true;
                }
                else {
                    return false;
                }
            }
            $scope.MidGoalRedAlarmTrainerTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if (item.stageTypeId == stageTypesEnum.MidGoal && item.evaluationRoleId == evaluationRolesEnum.trainer) {
                    return true;
                }
                else {
                    return false;
                }
            }
            $scope.MidGoalRedAlarmProjectManagerTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if (item.stageTypeId == stageTypesEnum.MidGoal && item.evaluationRoleId == evaluationRolesEnum.manager) {
                    return true;
                }
                else {
                    return false;
                }
            }


            $scope.LongTermGoalEvaluatorTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if (item.stageTypeId == stageTypesEnum.LongTermGoal && item.evaluationRoleId == evaluationRolesEnum.evaluator) {
                    return true;
                }
                else {
                    return false;
                }
            }
            $scope.LongTermGoalParticipantTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if (item.stageTypeId == stageTypesEnum.LongTermGoal && item.evaluationRoleId == evaluationRolesEnum.participant) {
                    return true;
                }
                else {
                    return false;
                }
            }
            $scope.LongTermGoalManagerTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if (item.stageTypeId == stageTypesEnum.LongTermGoal && item.evaluationRoleId == evaluationRolesEnum.manager) {
                    return true;
                }
                else {
                    return false;
                }
            }
            $scope.LongTermGoalTrainerTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if (item.stageTypeId == stageTypesEnum.LongTermGoal && item.evaluationRoleId == evaluationRolesEnum.trainer) {
                    return true;
                }
                else {
                    return false;
                }
            }
            $scope.LongTermGoalProjectManagerTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if (item.stageTypeId == stageTypesEnum.LongTermGoal && item.evaluationRoleId == evaluationRolesEnum.manager) {
                    return true;
                }
                else {
                    return false;
                }
            }

            $scope.LongTermGoalGreenAlarmEvaluatorTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if (item.stageTypeId == stageTypesEnum.LongTermGoal && item.evaluationRoleId == evaluationRolesEnum.evaluator) {
                    return true;
                }
                else {
                    return false;
                }
            }
            $scope.LongTermGoalGreenAlarmParticipantTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if (item.stageTypeId == stageTypesEnum.LongTermGoal && item.evaluationRoleId == evaluationRolesEnum.participant) {
                    return true;
                }
                else {
                    return false;
                }
            }
            $scope.LongTermGoalGreenAlarmManagerTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if (item.stageTypeId == stageTypesEnum.LongTermGoal && item.evaluationRoleId == evaluationRolesEnum.manager) {
                    return true;
                }
                else {
                    return false;
                }
            }
            $scope.LongTermGoalGreenAlarmTrainerTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if (item.stageTypeId == stageTypesEnum.LongTermGoal && item.evaluationRoleId == evaluationRolesEnum.trainer) {
                    return true;
                }
                else {
                    return false;
                }
            }
            $scope.LongTermGoalGreenAlarmProjectManagerTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if (item.stageTypeId == stageTypesEnum.LongTermGoal && item.evaluationRoleId == evaluationRolesEnum.manager) {
                    return true;
                }
                else {
                    return false;
                }
            }

            $scope.LongTermGoalYellowAlarmEvaluatorTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if (item.stageTypeId == stageTypesEnum.LongTermGoal && item.evaluationRoleId == evaluationRolesEnum.evaluator) {
                    return true;
                }
                else {
                    return false;
                }
            }
            $scope.LongTermGoalYellowAlarmParticipantTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if (item.stageTypeId == stageTypesEnum.LongTermGoal && item.evaluationRoleId == evaluationRolesEnum.participant) {
                    return true;
                }
                else {
                    return false;
                }
            }
            $scope.LongTermGoalYellowAlarmManagerTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if (item.stageTypeId == stageTypesEnum.LongTermGoal && item.evaluationRoleId == evaluationRolesEnum.manager) {
                    return true;
                }
                else {
                    return false;
                }
            }
            $scope.LongTermGoalYellowAlarmTrainerTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if (item.stageTypeId == stageTypesEnum.LongTermGoal && item.evaluationRoleId == evaluationRolesEnum.trainer) {
                    return true;
                }
                else {
                    return false;
                }
            }
            $scope.LongTermGoalYellowAlarmProjectManagerTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if (item.stageTypeId == stageTypesEnum.LongTermGoal && item.evaluationRoleId == evaluationRolesEnum.manager) {
                    return true;
                }
                else {
                    return false;
                }
            }


            $scope.LongTermGoalRedAlarmEvaluatorTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if (item.stageTypeId == stageTypesEnum.LongTermGoal && item.evaluationRoleId == evaluationRolesEnum.evaluator) {
                    return true;
                }
                else {
                    return false;
                }
            }
            $scope.LongTermGoalRedAlarmParticipantTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if (item.stageTypeId == stageTypesEnum.LongTermGoal && item.evaluationRoleId == evaluationRolesEnum.participant) {
                    return true;
                }
                else {
                    return false;
                }
            }
            $scope.LongTermGoalRedAlarmManagerTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if (item.stageTypeId == stageTypesEnum.LongTermGoal && item.evaluationRoleId == evaluationRolesEnum.manager) {
                    return true;
                }
                else {
                    return false;
                }
            }
            $scope.LongTermGoalRedAlarmTrainerTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if (item.stageTypeId == stageTypesEnum.LongTermGoal && item.evaluationRoleId == evaluationRolesEnum.trainer) {
                    return true;
                }
                else {
                    return false;
                }
            }
            $scope.LongTermGoalRedAlarmProjectManagerTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if (item.stageTypeId == stageTypesEnum.LongTermGoal && item.evaluationRoleId == evaluationRolesEnum.manager) {
                    return true;
                }
                else {
                    return false;
                }
            }



            $scope.FinalGoalEvaluatorTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if (item.stageTypeId == stageTypesEnum.FinalGoal && item.evaluationRoleId == evaluationRolesEnum.evaluator) {
                    return true;
                }
                else {
                    return false;
                }
            }
            $scope.FinalGoalParticipantTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if (item.stageTypeId == stageTypesEnum.FinalGoal && item.evaluationRoleId == evaluationRolesEnum.participant) {
                    return true;
                }
                else {
                    return false;
                }
            }
            $scope.FinalGoalManagerTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if (item.stageTypeId == stageTypesEnum.FinalGoal && item.evaluationRoleId == evaluationRolesEnum.manager) {
                    return true;
                }
                else {
                    return false;
                }
            }
            $scope.FinalGoalTrainerTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if (item.stageTypeId == stageTypesEnum.FinalGoal && item.evaluationRoleId == evaluationRolesEnum.trainer) {
                    return true;
                }
                else {
                    return false;
                }
            }
            $scope.FinalGoalProjectManagerTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if (item.stageTypeId == stageTypesEnum.FinalGoal && item.evaluationRoleId == evaluationRolesEnum.manager) {
                    return true;
                }
                else {
                    return false;
                }
            }


            $scope.FinalGoalGreenAlarmEvaluatorTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if (item.stageTypeId == stageTypesEnum.FinalGoal && item.evaluationRoleId == evaluationRolesEnum.evaluator) {
                    return true;
                }
                else {
                    return false;
                }
            }
            $scope.FinalGoalGreenAlarmParticipantTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if (item.stageTypeId == stageTypesEnum.FinalGoal && item.evaluationRoleId == evaluationRolesEnum.participant) {
                    return true;
                }
                else {
                    return false;
                }
            }
            $scope.FinalGoalGreenAlarmManagerTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if (item.stageTypeId == stageTypesEnum.FinalGoal && item.evaluationRoleId == evaluationRolesEnum.manager) {
                    return true;
                }
                else {
                    return false;
                }
            }
            $scope.FinalGoalGreenAlarmTrainerTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if (item.stageTypeId == stageTypesEnum.FinalGoal && item.evaluationRoleId == evaluationRolesEnum.trainer) {
                    return true;
                }
                else {
                    return false;
                }
            }
            $scope.FinalGoalGreenAlarmProjectManagerTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if (item.stageTypeId == stageTypesEnum.FinalGoal && item.evaluationRoleId == evaluationRolesEnum.manager) {
                    return true;
                }
                else {
                    return false;
                }
            }

            $scope.FinalGoalYellowAlarmEvaluatorTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if (item.stageTypeId == stageTypesEnum.FinalGoal && item.evaluationRoleId == evaluationRolesEnum.evaluator) {
                    return true;
                }
                else {
                    return false;
                }
            }
            $scope.FinalGoalYellowAlarmParticipantTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if (item.stageTypeId == stageTypesEnum.FinalGoal && item.evaluationRoleId == evaluationRolesEnum.participant) {
                    return true;
                }
                else {
                    return false;
                }
            }
            $scope.FinalGoalYellowAlarmManagerTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if (item.stageTypeId == stageTypesEnum.FinalGoal && item.evaluationRoleId == evaluationRolesEnum.manager) {
                    return true;
                }
                else {
                    return false;
                }
            }
            $scope.FinalGoalYellowAlarmTrainerTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if (item.stageTypeId == stageTypesEnum.FinalGoal && item.evaluationRoleId == evaluationRolesEnum.trainer) {
                    return true;
                }
                else {
                    return false;
                }
            }
            $scope.FinalGoalYellowAlarmProjectManagerTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if (item.stageTypeId == stageTypesEnum.FinalGoal && item.evaluationRoleId == evaluationRolesEnum.manager) {
                    return true;
                }
                else {
                    return false;
                }
            }

            $scope.FinalGoalRedAlarmEvaluatorTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if (item.stageTypeId == stageTypesEnum.FinalGoal && item.evaluationRoleId == evaluationRolesEnum.evaluator) {
                    return true;
                }
                else {
                    return false;
                }
            }
            $scope.FinalGoalRedAlarmParticipantTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if (item.stageTypeId == stageTypesEnum.FinalGoal && item.evaluationRoleId == evaluationRolesEnum.participant) {
                    return true;
                }
                else {
                    return false;
                }
            }
            $scope.FinalGoalRedAlarmManagerTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if (item.stageTypeId == stageTypesEnum.FinalGoal && item.evaluationRoleId == evaluationRolesEnum.manager) {
                    return true;
                }
                else {
                    return false;
                }
            }
            $scope.FinalGoalRedAlarmTrainerTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if (item.stageTypeId == stageTypesEnum.FinalGoal && item.evaluationRoleId == evaluationRolesEnum.trainer) {
                    return true;
                }
                else {
                    return false;
                }
            }
            $scope.FinalGoalRedAlarmProjectManagerTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if (item.stageTypeId == stageTypesEnum.FinalGoal && item.evaluationRoleId == evaluationRolesEnum.manager) {
                    return true;
                }
                else {
                    return false;
                }
            }


            $scope.EvaluatorMilestoneStartTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if (item.stageTypeId == stageTypesEnum.Milestone && item.notificationTemplateTypeId == templateTypeEnum.MilestoneStartNotification && item.evaluationRoleId == evaluationRolesEnum.evaluator && item.profileTypeId == profilesTypesEnum.soft) {
                    return true;
                }
                else {
                    return false;
                }
            }
            $scope.ParticipantMilestoneStartTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if (item.stageTypeId == stageTypesEnum.Milestone && item.notificationTemplateTypeId == templateTypeEnum.MilestoneStartNotification && item.evaluationRoleId == evaluationRolesEnum.participant && item.profileTypeId == profilesTypesEnum.soft) {
                    return true;
                }
                else {
                    return false;
                }
            }
            $scope.FinalScoreManagerMilestoneStartTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if (item.stageTypeId == stageTypesEnum.Milestone && item.notificationTemplateTypeId == templateTypeEnum.MilestoneStartNotification && item.evaluationRoleId == evaluationRolesEnum.evaluator && item.profileTypeId == profilesTypesEnum.soft) {
                    return true;
                }
                else {
                    return false;
                }
            }
            $scope.ManagerMilestoneStartTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if (item.stageTypeId == stageTypesEnum.Milestone && item.notificationTemplateTypeId == templateTypeEnum.MilestoneStartNotification && item.evaluationRoleId == evaluationRolesEnum.manager && item.profileTypeId == profilesTypesEnum.soft) {
                    return true;
                }
                else {
                    return false;
                }
            }
            $scope.TrainerMilestoneStartTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if (item.stageTypeId == stageTypesEnum.Milestone && item.notificationTemplateTypeId == templateTypeEnum.MilestoneStartNotification && item.evaluationRoleId == evaluationRolesEnum.trainer && item.profileTypeId == profilesTypesEnum.soft) {
                    return true;
                }
                else {
                    return false;
                }
            }
            $scope.ProjectManagerMilestoneStartTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if (item.stageTypeId == stageTypesEnum.Milestone && item.notificationTemplateTypeId == templateTypeEnum.MilestoneStartNotification && item.evaluationRoleId == evaluationRolesEnum.manager && item.profileTypeId == profilesTypesEnum.soft) {
                    return true;
                }
                else {
                    return false;
                }
            }


            $scope.EvaluatorMilestoneCompleteTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if (item.stageTypeId == stageTypesEnum.Milestone && item.notificationTemplateTypeId == templateTypeEnum.MilestoneCompleteNotification && item.evaluationRoleId == evaluationRolesEnum.evaluator) {
                    return true;
                }
                else {
                    return false;
                }
            }
            $scope.ParticipantMilestoneCompleteTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if (item.stageTypeId == stageTypesEnum.Milestone && item.notificationTemplateTypeId == templateTypeEnum.MilestoneCompleteNotification && item.evaluationRoleId == evaluationRolesEnum.participant) {
                    return true;
                }
                else {
                    return false;
                }
            }
            $scope.FinalScoreManagerMilestoneCompleteTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if (item.stageTypeId == stageTypesEnum.Milestone && item.notificationTemplateTypeId == templateTypeEnum.MilestoneCompleteNotification && item.evaluationRoleId == evaluationRolesEnum.evaluator) {
                    return true;
                }
                else {
                    return false;
                }
            }
            $scope.ManagerMilestoneCompleteTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if (item.stageTypeId == stageTypesEnum.Milestone && item.notificationTemplateTypeId == templateTypeEnum.MilestoneCompleteNotification && item.evaluationRoleId == evaluationRolesEnum.manager) {
                    return true;
                }
                else {
                    return false;
                }
            }
            $scope.TrainerMilestoneCompleteTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if (item.stageTypeId == stageTypesEnum.Milestone && item.notificationTemplateTypeId == templateTypeEnum.MilestoneCompleteNotification && item.evaluationRoleId == evaluationRolesEnum.trainer) {
                    return true;
                }
                else {
                    return false;
                }
            }
            $scope.ProjectManagerMilestoneCompleteTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if (item.stageTypeId == stageTypesEnum.Milestone && item.notificationTemplateTypeId == templateTypeEnum.MilestoneCompleteNotification && item.evaluationRoleId == evaluationRolesEnum.manager) {
                    return true;
                }
                else {
                    return false;
                }
            }

            $scope.EvaluatorMilestoneResultTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if (item.stageTypeId == stageTypesEnum.Milestone && item.notificationTemplateTypeId == templateTypeEnum.MilestoneResultNotification && item.evaluationRoleId == evaluationRolesEnum.evaluator) {
                    return true;
                }
                else {
                    return false;
                }
            }
            $scope.ParticipantMilestoneResultTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if (item.stageTypeId == stageTypesEnum.Milestone && item.notificationTemplateTypeId == templateTypeEnum.MilestoneResultNotification && item.evaluationRoleId == evaluationRolesEnum.participant) {
                    return true;
                }
                else {
                    return false;
                }
            }
            $scope.FinalScoreManagerMilestoneResultTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if (item.stageTypeId == stageTypesEnum.Milestone && item.notificationTemplateTypeId == templateTypeEnum.MilestoneResultNotification && item.evaluationRoleId == evaluationRolesEnum.evaluator) {
                    return true;
                }
                else {
                    return false;
                }
            }
            $scope.ManagerMilestoneResultTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if (item.stageTypeId == stageTypesEnum.Milestone && item.notificationTemplateTypeId == templateTypeEnum.MilestoneResultNotification && item.evaluationRoleId == evaluationRolesEnum.manager) {
                    return true;
                }
                else {
                    return false;
                }
            }
            $scope.TrainerMilestoneResultTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if (item.stageTypeId == stageTypesEnum.Milestone && item.notificationTemplateTypeId == templateTypeEnum.MilestoneResultNotification && item.evaluationRoleId == evaluationRolesEnum.trainer) {
                    return true;
                }
                else {
                    return false;
                }
            }
            $scope.ProjectManagerMilestoneResultTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if (item.stageTypeId == stageTypesEnum.Milestone && item.notificationTemplateTypeId == templateTypeEnum.MilestoneResultNotification && item.evaluationRoleId == evaluationRolesEnum.manager) {
                    return true;
                }
                else {
                    return false;
                }
            }

            $scope.MilestoneGreenAlarmEvaluatorTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if (item.stageTypeId == stageTypesEnum.Milestone && item.notificationTemplateTypeId == templateTypeEnum.GreenMilestoneAlarm && item.evaluationRoleId == evaluationRolesEnum.evaluator) {
                    return true;
                }
                else {
                    return false;
                }
            }
            $scope.MilestoneGreenAlarmParticipantTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if (item.stageTypeId == stageTypesEnum.Milestone && item.notificationTemplateTypeId == templateTypeEnum.GreenMilestoneAlarm && item.evaluationRoleId == evaluationRolesEnum.participant) {
                    return true;
                }
                else {
                    return false;
                }
            }
            $scope.MilestoneGreenAlarmFinalScoreManagerTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if (item.stageTypeId == stageTypesEnum.Milestone && item.notificationTemplateTypeId == templateTypeEnum.GreenMilestoneAlarm && item.evaluationRoleId == evaluationRolesEnum.evaluator) {
                    return true;
                }
                else {
                    return false;
                }
            }
            $scope.MilestoneGreenAlarmManagerTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if (item.stageTypeId == stageTypesEnum.Milestone && item.notificationTemplateTypeId == templateTypeEnum.GreenMilestoneAlarm && item.evaluationRoleId == evaluationRolesEnum.manager) {
                    return true;
                }
                else {
                    return false;
                }
            }
            $scope.MilestoneGreenAlarmTrainerTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if (item.stageTypeId == stageTypesEnum.Milestone && item.notificationTemplateTypeId == templateTypeEnum.GreenMilestoneAlarm && item.evaluationRoleId == evaluationRolesEnum.trainer) {
                    return true;
                }
                else {
                    return false;
                }
            }
            $scope.MilestoneGreenAlarmProjectManagerTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if (item.stageTypeId == stageTypesEnum.Milestone && item.notificationTemplateTypeId == templateTypeEnum.GreenMilestoneAlarm && item.evaluationRoleId == evaluationRolesEnum.manager) {
                    return true;
                }
                else {
                    return false;
                }
            }


            $scope.MilestoneYellowAlarmEvaluatorTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if (item.stageTypeId == stageTypesEnum.Milestone && item.notificationTemplateTypeId == templateTypeEnum.YellowMilestoneAlarm && item.evaluationRoleId == evaluationRolesEnum.evaluator) {
                    return true;
                }
                else {
                    return false;
                }
            }
            $scope.MilestoneYellowAlarmParticipantTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if (item.stageTypeId == stageTypesEnum.Milestone && item.notificationTemplateTypeId == templateTypeEnum.YellowMilestoneAlarm && item.evaluationRoleId == evaluationRolesEnum.participant) {
                    return true;
                }
                else {
                    return false;
                }
            }
            $scope.MilestoneYellowAlarmManagerTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if (item.stageTypeId == stageTypesEnum.Milestone && item.notificationTemplateTypeId == templateTypeEnum.YellowMilestoneAlarm && item.evaluationRoleId == evaluationRolesEnum.manager) {
                    return true;
                }
                else {
                    return false;
                }
            }
            $scope.MilestoneYellowAlarmFinalScoreManagerTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if (item.stageTypeId == stageTypesEnum.Milestone && item.notificationTemplateTypeId == templateTypeEnum.YellowMilestoneAlarm && item.evaluationRoleId == evaluationRolesEnum.evaluator) {
                    return true;
                }
                else {
                    return false;
                }
            }
            $scope.MilestoneYellowAlarmTrainerTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if (item.stageTypeId == stageTypesEnum.Milestone && item.notificationTemplateTypeId == templateTypeEnum.YellowMilestoneAlarm && item.evaluationRoleId == evaluationRolesEnum.trainer) {
                    return true;
                }
                else {
                    return false;
                }
            }
            $scope.MilestoneYellowAlarmProjectManagerTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if (item.stageTypeId == stageTypesEnum.Milestone && item.notificationTemplateTypeId == templateTypeEnum.YellowMilestoneAlarm && item.evaluationRoleId == evaluationRolesEnum.manager) {
                    return true;
                }
                else {
                    return false;
                }
            }

            $scope.MilestoneRedAlarmEvaluatorTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if (item.stageTypeId == stageTypesEnum.Milestone && item.notificationTemplateTypeId == templateTypeEnum.RedMilestoneAlarm && item.evaluationRoleId == evaluationRolesEnum.evaluator) {
                    return true;
                }
                else {
                    return false;
                }
            }
            $scope.MilestoneRedAlarmParticipantTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if (item.stageTypeId == stageTypesEnum.Milestone && item.notificationTemplateTypeId == templateTypeEnum.RedMilestoneAlarm && item.evaluationRoleId == evaluationRolesEnum.participant) {
                    return true;
                }
                else {
                    return false;
                }
            }
            $scope.MilestoneRedAlarmManagerTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if (item.stageTypeId == stageTypesEnum.Milestone && item.notificationTemplateTypeId == templateTypeEnum.RedMilestoneAlarm && item.evaluationRoleId == evaluationRolesEnum.manager) {
                    return true;
                }
                else {
                    return false;
                }
            }
            $scope.MilestoneRedAlarmFinalScoreManagerTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if (item.stageTypeId == stageTypesEnum.Milestone && item.notificationTemplateTypeId == templateTypeEnum.RedMilestoneAlarm && item.evaluationRoleId == evaluationRolesEnum.evaluator) {
                    return true;
                }
                else {
                    return false;
                }
            }
            $scope.MilestoneRedAlarmTrainerTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if (item.stageTypeId == stageTypesEnum.Milestone && item.notificationTemplateTypeId == templateTypeEnum.RedMilestoneAlarm && item.evaluationRoleId == evaluationRolesEnum.trainer) {
                    return true;
                }
                else {
                    return false;
                }
            }
            $scope.MilestoneRedAlarmProjectManagerTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if (item.stageTypeId == stageTypesEnum.Milestone && item.notificationTemplateTypeId == templateTypeEnum.RedMilestoneAlarm && item.evaluationRoleId == evaluationRolesEnum.manager) {
                    return true;
                }
                else {
                    return false;
                }
            }







            $scope.PersonalTrainingTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if (item.notificationTemplateTypeId == templateTypeEnum.PersonalTrainingNotification) {
                    return true;
                }
                else {
                    return false;
                }
            }

            $scope.ProfileTrainingTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if (item.notificationTemplateTypeId == templateTypeEnum.ProfileTrainingNotification) {
                    return true;
                }
                else {
                    return false;
                }
            }

            // KT 

            $scope.KTEvaluatorStartNotificationTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if ( item.notificationTemplateTypeId == templateTypeEnum.MilestoneStartNotification && item.evaluationRoleId == evaluationRolesEnum.evaluator && item.profileTypeId == profilesTypesEnum.knowledgetest) {
                    return true;
                }
                else {
                    return false;
                }
            }
            $scope.KTParticipantStartNotificationTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if ( item.notificationTemplateTypeId == templateTypeEnum.MilestoneStartNotification && item.evaluationRoleId == evaluationRolesEnum.participant && item.profileTypeId == profilesTypesEnum.knowledgetest) {
                    return true;
                }
                else {
                    return false;
                }
            }
            $scope.KTManagerStartNotificationTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if ( item.notificationTemplateTypeId == templateTypeEnum.MilestoneStartNotification && item.evaluationRoleId == evaluationRolesEnum.manager && item.profileTypeId == profilesTypesEnum.knowledgetest) {
                    return true;
                }
                else {
                    return false;
                }
            }
            $scope.KTTrainerStartNotificationTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if ( item.notificationTemplateTypeId == templateTypeEnum.MilestoneStartNotification && item.evaluationRoleId == evaluationRolesEnum.trainer && item.profileTypeId == profilesTypesEnum.knowledgetest) {
                    return true;
                }
                else {
                    return false;
                }
            }
            $scope.KTProjectManagerStartNotificationTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if ( item.notificationTemplateTypeId == templateTypeEnum.MilestoneStartNotification && item.evaluationRoleId == evaluationRolesEnum.manager && item.profileTypeId == profilesTypesEnum.knowledgetest) {
                    return true;
                }
                else {
                    return false;
                }
            }

            $scope.KTEvaluatorCompleteNotificationTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if ( item.notificationTemplateTypeId == templateTypeEnum.MilestoneCompleteNotification && item.evaluationRoleId == evaluationRolesEnum.evaluator && item.profileTypeId == profilesTypesEnum.knowledgetest) {
                    return true;
                }
                else {
                    return false;
                }
            }
            $scope.KTParticipantCompleteNotificationTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if ( item.notificationTemplateTypeId == templateTypeEnum.MilestoneCompleteNotification && item.evaluationRoleId == evaluationRolesEnum.participant && item.profileTypeId == profilesTypesEnum.knowledgetest) {
                    return true;
                }
                else {
                    return false;
                }
            }
            $scope.KTManagerCompleteNotificationTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if ( item.notificationTemplateTypeId == templateTypeEnum.MilestoneCompleteNotification && item.evaluationRoleId == evaluationRolesEnum.manager && item.profileTypeId == profilesTypesEnum.knowledgetest) {
                    return true;
                }
                else {
                    return false;
                }
            }
            $scope.KTTrainerCompleteNotificationTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if ( item.notificationTemplateTypeId == templateTypeEnum.MilestoneCompleteNotification && item.evaluationRoleId == evaluationRolesEnum.trainer && item.profileTypeId == profilesTypesEnum.knowledgetest) {
                    return true;
                }
                else {
                    return false;
                }
            }
            $scope.KTProjectManagerCompleteNotificationTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if ( item.notificationTemplateTypeId == templateTypeEnum.MilestoneCompleteNotification && item.evaluationRoleId == evaluationRolesEnum.manager && item.profileTypeId == profilesTypesEnum.knowledgetest) {
                    return true;
                }
                else {
                    return false;
                }
            }


            $scope.KTEvaluatorResultNotificationTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if ( item.notificationTemplateTypeId == templateTypeEnum.MilestoneResultNotification && item.evaluationRoleId == evaluationRolesEnum.evaluator && item.profileTypeId == profilesTypesEnum.knowledgetest) {
                    return true;
                }
                else {
                    return false;
                }
            }
            $scope.KTParticipantResultNotificationTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if ( item.notificationTemplateTypeId == templateTypeEnum.MilestoneResultNotification && item.evaluationRoleId == evaluationRolesEnum.participant && item.profileTypeId == profilesTypesEnum.knowledgetest) {
                    return true;
                }
                else {
                    return false;
                }
            }
            $scope.KTManagerResultNotificationTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if ( item.notificationTemplateTypeId == templateTypeEnum.MilestoneResultNotification && item.evaluationRoleId == evaluationRolesEnum.manager && item.profileTypeId == profilesTypesEnum.knowledgetest) {
                    return true;
                }
                else {
                    return false;
                }
            }
            $scope.KTTrainerResultNotificationTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if ( item.notificationTemplateTypeId == templateTypeEnum.MilestoneResultNotification && item.evaluationRoleId == evaluationRolesEnum.trainer && item.profileTypeId == profilesTypesEnum.knowledgetest) {
                    return true;
                }
                else {
                    return false;
                }
            }
            $scope.KTProjectManagerResultNotificationTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if ( item.notificationTemplateTypeId == templateTypeEnum.MilestoneResultNotification && item.evaluationRoleId == evaluationRolesEnum.manager && item.profileTypeId == profilesTypesEnum.knowledgetest) {
                    return true;
                }
                else {
                    return false;
                }
            }



            $scope.KTGreenAlarmEvaluatorTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if (item.profileTypeId == profilesTypesEnum.knowledgetest && item.notificationTemplateTypeId == templateTypeEnum.GreenMilestoneAlarm && item.evaluationRoleId == evaluationRolesEnum.evaluator) {
                    return true;
                }
                else {
                    return false;
                }
            }
            $scope.KTGreenAlarmParticipantTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if (item.profileTypeId == profilesTypesEnum.knowledgetest && item.notificationTemplateTypeId == templateTypeEnum.GreenMilestoneAlarm && item.evaluationRoleId == evaluationRolesEnum.participant) {
                    return true;
                }
                else {
                    return false;
                }
            }
            $scope.KTGreenAlarmManagerTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if (item.profileTypeId == profilesTypesEnum.knowledgetest && item.notificationTemplateTypeId == templateTypeEnum.GreenMilestoneAlarm && item.evaluationRoleId == evaluationRolesEnum.manager) {
                    return true;
                }
                else {
                    return false;
                }
            }
            $scope.KTGreenAlarmTrainerTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if (item.profileTypeId == profilesTypesEnum.knowledgetest && item.notificationTemplateTypeId == templateTypeEnum.GreenMilestoneAlarm && item.evaluationRoleId == evaluationRolesEnum.trainer) {
                    return true;
                }
                else {
                    return false;
                }
            }
            $scope.KTGreenAlarmProjectManagerTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if (item.profileTypeId == profilesTypesEnum.knowledgetest && item.notificationTemplateTypeId == templateTypeEnum.GreenMilestoneAlarm && item.evaluationRoleId == evaluationRolesEnum.manager) {
                    return true;
                }
                else {
                    return false;
                }
            }

            $scope.KTYellowAlarmEvaluatorTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if (item.profileTypeId == profilesTypesEnum.knowledgetest && item.notificationTemplateTypeId == templateTypeEnum.YellowMilestoneAlarm && item.evaluationRoleId == evaluationRolesEnum.evaluator) {
                    return true;
                }
                else {
                    return false;
                }
            }
            $scope.KTYellowAlarmParticipantTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if (item.profileTypeId == profilesTypesEnum.knowledgetest && item.notificationTemplateTypeId == templateTypeEnum.YellowMilestoneAlarm && item.evaluationRoleId == evaluationRolesEnum.participant) {
                    return true;
                }
                else {
                    return false;
                }
            }
            $scope.KTYellowAlarmManagerTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if (item.profileTypeId == profilesTypesEnum.knowledgetest && item.notificationTemplateTypeId == templateTypeEnum.YellowMilestoneAlarm && item.evaluationRoleId == evaluationRolesEnum.manager) {
                    return true;
                }
                else {
                    return false;
                }
            }
            $scope.KTYellowAlarmTrainerTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if (item.profileTypeId == profilesTypesEnum.knowledgetest && item.notificationTemplateTypeId == templateTypeEnum.YellowMilestoneAlarm && item.evaluationRoleId == evaluationRolesEnum.trainer) {
                    return true;
                }
                else {
                    return false;
                }
            }
            $scope.KTYellowAlarmProjectManagerTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if (item.profileTypeId == profilesTypesEnum.knowledgetest && item.notificationTemplateTypeId == templateTypeEnum.YellowMilestoneAlarm && item.evaluationRoleId == evaluationRolesEnum.manager) {
                    return true;
                }
                else {
                    return false;
                }
            }

            $scope.KTRedAlarmEvaluatorTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if (item.profileTypeId == profilesTypesEnum.knowledgetest && item.notificationTemplateTypeId == templateTypeEnum.RedMilestoneAlarm && item.evaluationRoleId == evaluationRolesEnum.evaluator) {
                    return true;
                }
                else {
                    return false;
                }
            }
            $scope.KTRedAlarmParticipantTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if (item.profileTypeId == profilesTypesEnum.knowledgetest && item.notificationTemplateTypeId == templateTypeEnum.RedMilestoneAlarm && item.evaluationRoleId == evaluationRolesEnum.participant) {
                    return true;
                }
                else {
                    return false;
                }
            }
            $scope.KTRedAlarmManagerTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if (item.profileTypeId == profilesTypesEnum.knowledgetest && item.notificationTemplateTypeId == templateTypeEnum.RedMilestoneAlarm && item.evaluationRoleId == evaluationRolesEnum.manager) {
                    return true;
                }
                else {
                    return false;
                }
            }
            $scope.KTRedAlarmTrainerTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if (item.profileTypeId == profilesTypesEnum.knowledgetest && item.notificationTemplateTypeId == templateTypeEnum.RedMilestoneAlarm && item.evaluationRoleId == evaluationRolesEnum.trainer) {
                    return true;
                }
                else {
                    return false;
                }
            }
            $scope.KTRedAlarmProjectManagerTemplates = function (item) {
                if (item.id == null) {
                    return true;
                }
                if (item.profileTypeId == profilesTypesEnum.knowledgetest && item.notificationTemplateTypeId == templateTypeEnum.RedMilestoneAlarm && item.evaluationRoleId == evaluationRolesEnum.manager) {
                    return true;
                }
                else {
                    return false;
                }
            }


        }
    ])
    .controller('ProjectListCtrl', ['$scope', '$location', 'authService', '$window', '$rootScope', 'cssInjector', 'projectsManager', 'dialogService', 'projects', '$translate',
        function ($scope, $location, authService, $window, $rootScope, cssInjector, projectsManager, dialogService, projects, $translate) {
            cssInjector.removeAll();
            //cssInjector.add('css/components.min.css');
            //cssInjector.add('css/default.min.css');
            cssInjector.add('views/projects/projects.css');
            $scope.projects = new kendo.data.ObservableArray([]); //projects;
            _.each(projects, function (projectItem) {
                $scope.projects.push(projectItem);
            })
            $scope.dataSource = function () {
                return new kendo.data.DataSource({
                    type: "json",
                    data: $scope.projects,
                    pageSize: 10,
                    schema: {
                        model: {
                            id: "id",
                            fields: {
                                id: { type: 'number', },
                                name: { type: 'string' },
                                missionStatement: { type: 'string' },
                                visionStatement: { type: 'string' },
                                goalStatement: { type: 'object' },
                                stratagiesStatement: { type: 'object' },
                                expectedStartDate: { type: 'date' },
                                expectedEndDate: { type: 'date' },
                                //jobPosition1: { name: { type: 'string' } }
                            }
                        }
                    }
                });
            };


            $scope.editproject = function (id) {
                $location.path("/editproject/" + id);
            }

            $scope.viewprojectprofiles = function (projectId) {
                $location.path("/projectprofiles/" + projectId);
            }
            $scope.newProject = function () {
                $location.path("/newproject");
            }
            $scope.gridOptions = {
                dataBound: function enumerator() {
                    var rows = this.items();
                    $(rows).each(function () {
                        var index = $(this).index() + 1;
                        var rowLabel = $(this).find(".row-number");
                        $(rowLabel).html(index);

                        var missionStatement = $(this).find(".missionStatement").text();
                        if (missionStatement.length > 25) {
                            $(this).find(".missionStatement").append("<a href='javascript:;' class='fa fa-info viewMissionStatement'></a>")
                        }

                        var visionStatement = $(this).find(".visionStatement").text();
                        if (visionStatement.length > 25) {
                            $(this).find(".visionStatement").append("<a href='javascript:;' class='fa fa-info viewVisionStatement'></a>")
                        }

                        var goalStatement = $(this).find(".goalStatement").text();
                        if (goalStatement.length > 25) {
                            $(this).find(".goalStatement").append("<a href='javascript:;' class='fa fa-info viewGoalStatement'></a>")
                        }
                        var stratagiesStatement = $(this).find(".stratagiesStatement").text();
                        if (stratagiesStatement.length > 25) {
                            $(this).find(".stratagiesStatement").append("<a href='javascript:;' class='fa fa-info viewStratagiesStatement'></a>")
                        }
                    });
                },
                dataSource: $scope.dataSource(),
                pageable: true,
                selectable: true,
                sortable: false,
                detailInit: detailInit,
                columns: [
                    { field: 'rowNumber', title: "#", template: "<span class='row-number'></span>", filterable: false },
                    { field: "name", title: $translate.instant('COMMON_NAME') },
                    {
                        field: "expectedStartDate", title: $translate.instant('COMMON_START_DATE'), filterable: false, template: '<div>{{dataItem.expectedStartDate | date:"short"}}</div>'
                    },
                    { field: "expectedEndDate", title: $translate.instant('COMMON_END_DATE'), filterable: false, template: '<div>{{dataItem.expectedEndDate | date:"short"}}</div>' },
                    {
                        field: "missionStatement", title: $translate.instant('MYPROJECTS_MISSION'),
                        attributes: {
                            "class": "missionStatement"
                        },
                        template: '<div class="statement-cell"> {{dataItem.missionStatement}}</div>'
                    },
                    {
                        field: "visionStatement", title: $translate.instant('MYPROJECTS_VISION'), attributes: {
                            "class": "visionStatement"
                        },
                        template: '<div class="statement-cell"> {{dataItem.visionStatement}}</div>'
                    },
                    {
                        field: "goalStatement", title: $translate.instant('MYPROJECTS_GOALS'),
                        attributes: {
                            "class": "goalStatement"
                        }, template: function (dataItem) {
                            if (dataItem.goalStatement) {
                                return '<div class="statement-cell">' + dataItem.goalStatement.join(",") + '</div>';
                            }
                        }
                    },
                    {
                        field: "stratagiesStatement", title: $translate.instant('MYPROJECTS_STRATEGIES'),
                        attributes: {
                            "class": "stratagiesStatement"
                        },
                        template: function (dataItem) {
                            if (dataItem.stratagiesStatement) {
                                return '<div class="statement-cell">' + dataItem.stratagiesStatement.join(",") + '</div>';
                            }
                        }
                    },
                    {
                        field: "", title: $translate.instant('COMMON_ACTIONS'), template: "<div class='icon-groups'>" +
                            "<a class='fa fa-pencil' title='Edit Project' ng-click='editproject(dataItem.id)'></a>" +
                            "<a class='fa fa-list' title='View Project Profiles' ng-click='viewprojectprofiles(dataItem.id)'></a>" +
                            "<a class='fa fa-trash' title='Delete Project Profiles' ng-click='deleteProject(dataItem.id)'></a>" +
                            "</div>"
                    }
                    //{ field: "", title: "", width: 100, filterable: false },
                ],


            };
            function isEllipsisActive(e) {
                return (e.offsetWidth < e.scrollWidth);
            }
            $('body').on('click', '.viewVisionStatement', function () {
                $("#viewPopupInfo .modal-title").html("Vision");
                $("#viewPopupInfo .content-text").html($(this).parent().find(".statement-cell").text());
                $("#viewPopupInfo").modal("show");
            })
            $('body').on('click', '.viewMissionStatement', function () {
                $("#viewPopupInfo .modal-title").html("Mission");
                $("#viewPopupInfo .content-text").html($(this).parent().find(".statement-cell").text());
                $("#viewPopupInfo").modal("show");
            })
            $('body').on('click', '.viewStratagiesStatement', function () {
                $("#viewPopupInfo .modal-title").html("Strategies");
                $("#viewPopupInfo .content-text").html($(this).parent().find(".statement-cell").text());
                $("#viewPopupInfo").modal("show");
            })
            $('body').on('click', '.viewGoalStatement', function () {
                $("#viewPopupInfo .modal-title").html("Goal")
                $("#viewPopupInfo .content-text").html($(this).parent().find(".statement-cell").text());
                $("#viewPopupInfo").modal("show");
            })
            function detailInit(e) {
                $("<h3>Goal and Strategies of " + e.data.name + "</h3>").appendTo(e.detailCell)
                projectsManager.getProjectById(e.data.id).then(function (data) {
                    $("<div/>").appendTo(e.detailCell).kendoGrid({
                        dataSource: data.projectGoals,
                        scrollable: false,
                        sortable: true,
                        pageable: true,
                        columns: [
                            { field: "id", hidden: true },
                            { field: "goal", title: $translate.instant('MYPROJECTS_GOALS') },
                            { field: "strategy", title: $translate.instant('MYPROJECTS_STRATEGIES') },
                        ]
                    });
                    var users = [];
                    _.each(data.projectSteeringGroups, function (steeringGroupItem) {
                        _.each(steeringGroupItem.users, function (userItem) {
                            users.push({ name: userItem.firstName + " " + userItem.lastName, groupName: steeringGroupItem.name, roleName: userItem.roleName })
                        })
                    });
                    $("<h3>Steering Group of " + e.data.name + "</h3>").appendTo(e.detailCell);
                    $("<div/>").appendTo(e.detailCell).kendoGrid({
                        dataSource: users,
                        scrollable: false,
                        sortable: true,
                        pageable: true,
                        columns: [
                            { field: "id", hidden: true },
                            { field: "name", title: $translate.instant('COMMON_NAME') },
                            { field: "groupName", title: $translate.instant('MYPROJECTS_GROUP_NAME') },
                            { field: "roleName", title: $translate.instant('COMMON_ROLE') },
                        ]
                    });

                });



            }

            $scope.deleteProject = function (projectId) {
                projectsManager.isProjectInUse(projectId).then(function (data) {
                    if (data) {
                        dialogService.showNotification($translate.instant('MYPROJECTS_YOU_CAN_NOT_DELETE_PROJECT') + $translate.instant('MYPROJECTS_THIS_PROJECT_IS_IN_USE'), "warning");
                    }
                    else {
                        dialogService.showYesNoDialog($translate.instant('COMMON_CONFIRM'), $translate.instant('MYPROJECTS_ARE_YOU_SURE_YOU_WANT_TO_DELETE_PROJECT')).then(
                            function () {
                                projectsManager.removeProject(projectId).then(function (data) {
                                    if (data) {
                                        dialogService.showNotification($translate.instant('MYPROJECTS_PROJECT_REMOVED_SUCCESFULLY'), "info");
                                        $scope.projects.splice(0, $scope.projects.length);
                                        projectsManager.getAllProject().then(function (data) {
                                            _.each(data, function (projectItem) {
                                                $scope.projects.push(projectItem);
                                            });
                                        });



                                    }
                                });
                            },
                            function () {
                            });
                    }
                })
            }

            $scope.setTimeSpan = function () {

                var diffTime = null;
                var a = moment(kendo.parseDate($scope.project.expectedEndDate));
                var b = moment(kendo.parseDate($scope.project.expectedStartDate));
                // For Knowledge Profile
                diffTime = a.diff(b);
                var duration = moment.duration(diffTime);
                $scope.projectGlobalSetting.knowledgeProfileActualTimeSpan = diffTime,
                    $scope.projectGlobalSetting.knowledgeProfileMonthSpan = duration.months();
                $scope.projectGlobalSetting.knowledgeProfileWeekSpan = duration.weeks();
                $scope.projectGlobalSetting.knowledgeProfileDaySpan = duration.days();
                if ($scope.projectGlobalSetting.knowledgeProfileWeekSpan > 0) {
                    $scope.projectGlobalSetting.knowledgeProfileDaySpan = $scope.projectGlobalSetting.knowledgeProfileDaySpan - ($scope.projectGlobalSetting.knowledgeProfileWeekSpan * 7);
                }
                $scope.projectGlobalSetting.knowledgeProfileHourSpan = duration.hours();
                $scope.projectGlobalSetting.knowledgeProfileMinuteSpan = duration.minutes();


                // For Soft Profile   
                diffTime = a.diff(b) / 5 // 1
                duration = moment.duration(diffTime);
                $scope.projectGlobalSetting.softProfileActualTimeSpan = diffTime,
                    $scope.projectGlobalSetting.softProfileMonthSpan = duration.months();
                $scope.projectGlobalSetting.softProfileWeekSpan = duration.weeks();
                $scope.projectGlobalSetting.softProfileDaySpan = duration.days();
                if ($scope.projectGlobalSetting.softProfileWeekSpan > 0) {
                    $scope.projectGlobalSetting.softProfileDaySpan = $scope.projectGlobalSetting.softProfileDaySpan - ($scope.projectGlobalSetting.softProfileWeekSpan * 7);
                }
                $scope.projectGlobalSetting.softProfileHourSpan = duration.hours();
                $scope.projectGlobalSetting.softProfileMinuteSpan = duration.minutes();

            }

        }])