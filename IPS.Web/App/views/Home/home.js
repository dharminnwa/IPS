'use strict';

angular.module('ips.home', ['ui.router', 'growing-panes'])
    .config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
        $stateProvider
            .state('home', {
                url: "/home",
                templateUrl: "views/home/home.html",
                controller: "HomeCtrl",
                authenticate: true,
                resolve: {
                    pageName: function ($translate) {
                        return $translate.instant('LEFTMENU_HOME');
                    },
                    allcategories: function (todosManager, authService) {
                        if (authService.authentication.isAuth) {
                            return todosManager.getAllCategories().then(function (data) {
                                angular.forEach(data, function (item, value) {
                                    item.value = item.id;
                                });
                                return data;
                            });
                        } else {
                            return [];
                        }
                    },
                },
                data: {
                    displayName: '{{pageName}}',//'Home',
                    depth: 1,
                    paneLimit: 1,
                }
            });
    }])
    .controller('HomeCtrl', ['$scope', '$location', 'authService', 'progressBar', '$rootScope', 'cssInjector', 'todoManager', 'todosManager', 'allcategories', 'userDashboardManager', 'dialogService', '$compile', 'trainingSaveModeEnum', 'profilesTypesEnum', 'softProfileTypesEnum', 'ktProfileTypesEnum', 'localStorageService', 'globalVariables', '$translate', 'projectRolesEnum',
        function ($scope, $location, authService, progressBar, $rootScope, cssInjector, todoManager, todosManager, allcategories, userDashboardManager, dialogService, $compile, trainingSaveModeEnum, profilesTypesEnum, softProfileTypesEnum, ktProfileTypesEnum, localStorageService, globalVariables, $translate, projectRolesEnum) {
            cssInjector.removeAll();
            cssInjector.add('views/home/home.css');
            cssInjector.add('css/calendar.css');
            $scope.authentication = authService.authentication;
            $scope.currentUser = $scope.authentication.user;

            $scope.selectedMenuItem = null;
            
            $scope.menuItems = [

                {
                    id: "0",
                    text: $translate.instant("MY_DASHBOARD"),
                    icon: "ips-icon-dashboard",
                    li_attr: {},
                    a_attr: {
                        href: "/myDashboard"
                    },
                    parentId: null
                },
                {
                    id: "1",
                    text: $translate.instant("USER_MANAGEMENT"),
                    icon: "ips-icon-management",

                    li_attr: {},
                    a_attr: {},
                    parentId: null
                },
                {
                    id: "1.a",
                    parentId: "1",
                    text: $translate.instant("ORG_MANAGEMENT"),
                    icon: "ips-icon-organization",
                    li_attr: {},
                    a_attr: {},
                },
                {
                    id: "1.a.1",
                    parentId: "1.a",
                    text: $translate.instant("LEFTMENU_ORGANIZATIONS"),
                    icon: "ips-icon-organization",
                    resource: "Organizations",

                    li_attr: {},
                    a_attr: {
                        href: "/home/organizations/organizations"
                    },
                },
                {
                    id: "1.a.2",
                    parentId: "1.a",
                    text: $translate.instant("ORGANIZATIONS_USERS"),
                    resource: "Organizations",
                    icon: "ips-icon-user-1",

                    li_attr: {},
                    resource: "Organizations",
                    a_attr: {
                        href: "/home/organizations/users/" + $scope.currentUser.organizationId,
                    },
                },
                {
                    id: "1.a.3",
                    parentId: "1.a",
                    text: $translate.instant("COMMON_DEPARTMENTS"),
                    icon: "ips-icon-department",

                    li_attr: {},
                    resource: "Organizations",
                    a_attr: {
                        href: "/home/organizations/departments/" + $scope.currentUser.organizationId,
                    },
                },
                {
                    id: "1.a.4",
                    parentId: "1.a",
                    text: $translate.instant("COMMON_TEAMS"),
                    icon: "ips-icon-team",
                    li_attr: {},
                    resource: "Organizations",
                    a_attr: {
                        href: "/home/organizations/teams/" + $scope.currentUser.organizationId,
                    },
                },
                {
                    id: "1.a.5",
                    parentId: "1.a",
                    text: $translate.instant("CRM_COMMON_CUSTOMERS"),
                    icon: "ips-icon-customer",
                    li_attr: {},
                    resource: "Organizations",
                    a_attr: {
                        href: "/home/organizations/customers/" + $scope.currentUser.organizationId,
                    },
                },
                {
                    id: "1.a.6",
                    parentId: "1.a",
                    text: $translate.instant("LEFTMENU_IMPORT_ORGANIZATIONS"),
                    icon: "fa fa-male",
                    li_attr: {},
                    resource: "Organizations",
                    a_attr: {
                        href: "home/organizations/import/" + $scope.currentUser.organizationId,
                    },
                },
                {
                    id: "1.b",
                    parentId: "1",
                    text: $translate.instant("LEFTMENU_INDUSTRIES"),
                    icon: "ips-icon-industry",
                    li_attr: {},
                    resource: "Industries",
                    a_attr: {
                        href: "/home/organizations/industries/" + $scope.currentUser.organizationId,
                    },
                },
                {
                    id: "1.c",
                    parentId: "1",
                    text: $translate.instant("LEFTMENU_SECURITY"),
                    icon: "ips-icon-security",
                    li_attr: {},
                    resource: "Security",
                    a_attr: {
                        href: "/home/administration/security",
                    },
                },
                {
                    id: "1.d",
                    parentId: "1",
                    text: $translate.instant("ROLE_MANAGEMENT"),
                    icon: "ips-icon-role",
                    resource: "Security",
                    li_attr: {},
                    a_attr: {},
                },
                {
                    id: "1.d.1",
                    parentId: "1.d",
                    text: $translate.instant("LEFTMENU_ROLE_LEVELS"),
                    icon: "ips-icon-level",
                    resource: "Security",
                    li_attr: {},
                    a_attr: {
                        href: "/home/roleLevel/roleLevels",
                    },
                },
                {
                    id: "1.d.2",
                    parentId: "1.d",

                    text: $translate.instant("LEFTMENU_NEW_ROLE_LEVEL_TEMPLATES"),
                    icon: "ips-icon-template",
                    resource: "Security",
                    li_attr: {},
                    a_attr: {
                        href: "/home/roleLevel/roleLevelPermissionTemplate",
                    },
                },
                {
                    id: "1.d.3",
                    parentId: "1.d",
                    text: $translate.instant("LEFTMENU_SET_ROLE_LEVEL_PERMISSION"),
                    icon: "ips-icon-permission",
                    resource: "Security",
                    li_attr: {},
                    a_attr: {
                        href: "/home/roleLevel/setPermission/null/null",
                    },
                },
                {
                    id: "2",
                    text: $translate.instant("COMMON_PLAN"),
                    icon: "ips-icon-plan",
                    // array of strings or objects
                    li_attr: {},  // attributes for the generated LI node
                    a_attr: {},  // attributes for the generated A node
                },
                {
                    id: "2.b",
                    parentId: "2",
                    text: $translate.instant("COMMON_PROJECT"),
                    icon: "fa fa-sun-o",
                    resource: "Projects",
                    li_attr: {},
                    a_attr: {},
                },
                {
                    id: "2.b.1",
                    parentId: "2.b",
                    text: $translate.instant("MYPROJECTS_NEW_PROJECT"),
                    icon: "ips-icon-new-project",
                    li_attr: {},
                    a_attr: {
                        href: "/newproject"
                    },
                },

                {
                    id: "2.a",
                    parentId: "2",
                    text: $translate.instant("COMMON_PROFILE"),
                    icon: "ips-icon-profile-management",
                    li_attr: {},
                    a_attr: {},
                },
                {
                    id: "2.a.1",
                    parentId: "2.a",
                    text: $translate.instant("COMMON_NEW") + " " + $translate.instant("COMMON_SOFT_PROFILE"),
                    icon: "ips-icon-soft-profile",
                    li_attr: {},
                    a_attr: {
                        href: "/home/soft/profile/0"
                    },
                },
                {
                    id: "2.a.2",
                    parentId: "2.a",
                    text: $translate.instant("COMMON_NEW") + " " + $translate.instant("LEFTMENU_KNOWLEDGE_PROFILE"),
                    icon: "ips-icon-knowledge-profile",
                    li_attr: {},
                    a_attr: {
                        href: "/home/knowledge/profile/0"
                    },
                },

                {
                    id: "2.c",
                    parentId: "2",
                    text: $translate.instant("LEFTMENU_TRAININGS"),
                    icon: "ips-icon-training",
                    li_attr: {},
                    a_attr: {},
                },
                {
                    id: "2.c.3",
                    parentId: "2.c",
                    text: $translate.instant("COMMON_NEW_PERSONAL_TRAINING"),
                    icon: "ips-icon-personal-training",
                    li_attr: {},
                    a_attr: {
                        href: "/home/training/newPersonalTraining"
                    },
                },
                {
                    id: "2.c.4",
                    parentId: "2.c",
                    text: $translate.instant("MYPROJECTS_TRAINING_TEMPLATES"),
                    icon: "ips-icon-training-templates",
                    li_attr: {},
                    a_attr: {
                        href: "/home/training/trainingTemplates"
                    },
                },
                {
                    id: "2.c.5",
                    parentId: "2.c",
                    text: $translate.instant("LEFTMENU_TRAINING_SETTINGS"),
                    icon: "ips-icon-training-setting",
                    li_attr: {},
                    a_attr: {
                        href: "/home/training/trainingSetting"
                    },
                },
                {
                    id: "2.d",
                    parentId: "2",
                    text: $translate.instant("COMMON_TASKS"),
                    icon: "ips-icon-task",
                    li_attr: {},
                    a_attr: {},
                },
                {
                    id: "2.d.1",
                    parentId: "2.d",
                    text: $translate.instant("TASKPROSPECTING_NEW_TASK"),
                    icon: "ips-icon-new-task",
                    li_attr: {},
                    a_attr: {
                        href: "/home/todos/new"
                    },
                },
                {
                    id: "2.d.2",
                    parentId: "2.d",
                    text: $translate.instant("TASKMANAGEMENT_TASK_SETTINGS"),
                    icon: "ips-icon-task-setting",
                    resource: "Task Setting",
                    li_attr: {},
                    a_attr: {
                        href: "/home/todos/tasksSettings"
                    },
                },

                {
                    id: "2.e",
                    parentId: "2",
                    text: $translate.instant("LEFTMENU_PROSPECTING"),
                    icon: "ips-icon-sales-prospecting-management",
                    li_attr: {},
                    a_attr: {},
                },
                {
                    id: "2.e.1",
                    parentId: "2.e",
                    text: $translate.instant("COMMON_NEW_PROSPECTING_GOAL"),
                    icon: "ips-icon-add-sales",
                    li_attr: {},
                    a_attr: {
                        href: "/newSalesProspecting",
                    },
                },

                {
                    id: "2.f",
                    parentId: "2",
                    text: $translate.instant("LEFTMENU_SERVICE_PROSPECTING"),
                    icon: "ips-icon-service-prospecting-management",
                    li_attr: {},
                    a_attr: {},
                },
                {
                    id: "2.f.1",
                    parentId: "2.f",
                    text: $translate.instant("COMMON_NEW_PROSPECTING_GOAL"),
                    icon: "ips-icon-add-sales",
                    li_attr: {},
                    a_attr: {
                        href: "/newServiceProspecting",
                    },
                },

                {
                    id: "2.g",
                    parentId: "2",
                    text: $translate.instant("SOFTPROFILE_NOTIFICATIONS"),
                    icon: "ips-icon-notification",
                    li_attr: {},
                    a_attr: {
                        href: "/home/notificationTemplates/" + $scope.currentUser.organizationId,
                    },
                },

                {
                    id: "3",
                    text: $translate.instant("RUN"),
                    icon: "ips-icon-play",
                    li_attr: {},  // attributes for the generated LI node
                    a_attr: {},  // attributes for the generated A node
                },
                {
                    id: "3.a",
                    parentId: "3",
                    text: $translate.instant("LEFTMENU_SOFT_PROFILE"),
                    icon: "ips-icon-active-profile",
                    li_attr: {},
                    a_attr: {
                        href: "/home/soft/activeProfiles"
                    },
                },
                {
                    id: "3.b",
                    parentId: "3",
                    text: $translate.instant("LEFTMENU_KNOWLEDGE_PROFILE"),
                    icon: "ips-icon-knowledge-profile",
                    li_attr: {},
                    a_attr: {
                        href: "/home/knowledge/activeProfiles"
                    },
                },
                {
                    id: "3.c",
                    parentId: "3",
                    text: $translate.instant("COMMON_TRAINING"),
                    icon: "ips-icon-training",
                    li_attr: {},
                    a_attr: {
                    },
                },
                {
                    id: "3.c.1",
                    parentId: "3.c",
                    text: $translate.instant("HOME_OWN_TRAININGS"),
                    icon: "ips-icon-personal-training",
                    li_attr: {},
                    a_attr: {
                        href: "/home/training/todayPersonalTrainings"
                    },
                },
                {
                    id: "3.c.2",
                    parentId: "3.c",
                    text: $translate.instant("HOME_PROFILE_TRAININGS"),
                    icon: "ips-icon-profile-training",
                    li_attr: {},
                    a_attr: {
                        href: "/home/training/todayProfileTrainings"
                    },
                },

                {
                    id: "3.d",
                    parentId: "3",
                    text: $translate.instant("COMMON_TASKS"),
                    icon: "ips-icon-task",
                    li_attr: {},
                    a_attr: {
                    },
                },
                {
                    id: "3.d.1",
                    parentId: "3.d",
                    text: $translate.instant("HOME_TODAYS_TASKS"),
                    icon: "ips-icon-personal-task",
                    li_attr: {},
                    a_attr: {
                        href: "/home/todos/todayTasks"
                    },
                },
                {
                    id: "3.e",
                    parentId: "3",
                    text: $translate.instant("MYPROJECTS_ACTIVE_PROJECTS"),
                    icon: "fa fa-toggle-on",
                    resource: "Projects",
                    li_attr: {},
                    a_attr: {
                        href: "/home/activeProjects"
                    },
                },
                {
                    id: "3.f",
                    parentId: "3",
                    text: $translate.instant("LEFTMENU_PROSPECTING"),
                    icon: "ips-icon-sales-prospecting-management",
                    li_attr: {},
                    a_attr: {},
                },
                {
                    id: "3.f.1",
                    parentId: "3.f",
                    text: $translate.instant("COMMON_TODAY") + "  " + $translate.instant("LEFTMENU_PROSPECTING"),
                    icon: "ips-icon-add-sales",
                    li_attr: {},
                    a_attr: {
                        href: "/home/salesProspecting/todaySalesProspecting"
                    },
                },
                {
                    id: "3.g",
                    parentId: "3",
                    text: $translate.instant("LEFTMENU_SERVICE_PROSPECTING"),
                    icon: "ips-icon-service-prospecting-management",
                    li_attr: {},
                    a_attr: {},
                },
                {
                    id: "3.g.1",
                    parentId: "3.g",
                    text: $translate.instant("COMMON_TODAY_SERVICE_PROSPECTING"),
                    icon: "ips-icon-service",
                    li_attr: {},
                    a_attr: {
                        href: "/home/serviceProspecting/todayServiceProspecting"
                    },
                },
                {
                    id: "4",
                    text: $translate.instant("MEASURE_ANALYZE"),
                    icon: "ips-icon-measure",
                    li_attr: {},  // attributes for the generated LI node
                    a_attr: {},  // attributes for the generated A node
                },
                {
                    id: "4.a",
                    parentId: "4",
                    text: $translate.instant("COMMON_PROJECT"),
                    icon: "fa fa-sun-o",
                    li_attr: {},  // attributes for the generated LI node
                    a_attr: {},  // attributes for the generated A node
                },
                {
                    id: "4.a.1",
                    parentId: "4.a",
                    text: $translate.instant("MYPROJECTS_PENDING_PROJECTS"),
                    icon: "fa fa-calendar",
                    resource: "Projects",
                    li_attr: {},
                    a_attr: {
                        href: "/home/pendingProjects"
                    },
                },
                {
                    id: "4.a.2",
                    parentId: "4.a",
                    text: $translate.instant("MYPROJECTS_EXPIRED_PROJECTS"),
                    icon: "fa fa-calendar",
                    resource: "Projects",
                    li_attr: {},
                    a_attr: {
                        href: "/home/expiredProjects"
                    },
                },
                {
                    id: "4.a.3",
                    parentId: "4.a",
                    text: $translate.instant("MYPROJECTS_COMPLETED_PROJECTS"),
                    icon: "fa fa-check-square",
                    resource: "Projects",
                    li_attr: {},
                    a_attr: {
                        href: "/home/completedProjects"
                    },
                },
                {
                    id: "4.a.4",
                    parentId: "4.a",
                    text: $translate.instant("COMMON_HISTORY"),
                    icon: "fa fa-clock-o",
                    resource: "Projects",
                    li_attr: {},
                    a_attr: {
                        href: "/home/historyProjects"
                    },
                },

                {
                    id: "4.b",
                    parentId: "4",
                    text: $translate.instant("COMMON_PROFILES"),
                    icon: "ips-icon-profile-management",
                    li_attr: {},  // attributes for the generated LI node
                    a_attr: {},  // attributes for the generated A node
                },

                {
                    id: "4.b.1",
                    parentId: "4.b",
                    text: $translate.instant("LEFTMENU_SOFT_PROFILE"),
                    icon: "ips-icon-soft-profile",
                    li_attr: {},
                    a_attr: {},
                },
                {
                    id: "4.b.1.1",
                    parentId: "4.b.1",
                    text: $translate.instant("MYPROFILES_EXPIRED_PROFILES"),
                    icon: "ips-icon-expired-profile",
                    resource: "Profiles",
                    li_attr: {},
                    a_attr: {
                        href: "/home/soft/expiredProfiles"
                    },
                },
                {
                    id: "4.b.1.2",
                    parentId: "4.b.1",
                    text: $translate.instant("MYPROFILES_COMPLETED_PROFILES"),
                    resource: "Profiles",
                    icon: "ips-icon-completed-profile",
                    li_attr: {},
                    a_attr: {
                        href: "/home/soft/completedProfiles"
                    },
                },
                {
                    id: "4.b.1.3",
                    parentId: "4.b.1",
                    text: $translate.instant("MYPROFILES_HISTORIC_PROFILES"),
                    icon: "ips-icon-historic-profile",
                    resource: "Profiles",
                    li_attr: {},
                    a_attr: {
                        href: "/home/soft/historyProfiles"
                    },
                },

                {
                    id: "4.b.1.4",
                    parentId: "4.b.1",
                    text: $translate.instant("LEFTMENU_DASHBOARD"),
                    icon: "ips-icon-dashboard",
                    resource: "Profiles",
                    li_attr: {},
                    a_attr: {
                        href: "/home/soft/dashboard"
                    },
                },
                {
                    id: "4.b.1.5",
                    parentId: "4.b.1",
                    text: $translate.instant("LEFTMENU_SCORECARD"),
                    icon: "ips-icon-pass-score",
                    li_attr: {},
                    a_attr: {
                        href: "/home/soft/scorecard"
                    },
                },

                {
                    id: "4.b.2",
                    parentId: "4.b",
                    text: $translate.instant("LEFTMENU_KNOWLEDGE_PROFILE"),
                    icon: "ips-icon-knowledge-profile",
                    li_attr: {},
                    a_attr: {},
                },

                {
                    id: "4.b.2.1",
                    parentId: "4.b.2",
                    text: $translate.instant("MYPROFILES_EXPIRED_PROFILES"),
                    icon: "ips-icon-expired-profile",
                    li_attr: {},
                    a_attr: {
                        href: "/home/knowledge/expiredProfiles"
                    },
                },
                {
                    id: "4.b.2.2",
                    parentId: "4.b.2",
                    text: $translate.instant("MYPROFILES_COMPLETED_PROFILES"),
                    icon: "ips-icon-completed-profile",
                    li_attr: {},
                    a_attr: {
                        href: "/home/knowledge/completedProfiles"
                    },
                },
                {
                    id: "4.b.2.3",
                    parentId: "4.b.2",
                    text: $translate.instant("COMMON_HISTORY") + " " + $translate.instant("COMMON_PROFILES"),
                    icon: "ips-icon-historic-profile",
                    li_attr: {},
                    a_attr: {
                        href: "/home/knowledge/historyProfiles"
                    },
                },
                {
                    id: "4.b.2.4",
                    parentId: "4.b.2",
                    text: $translate.instant("LEFTMENU_DASHBOARD"),
                    icon: "ips-icon-dashboard",
                    li_attr: {},
                    a_attr: {
                        href: "/home/knowledge/dashboard"
                    },
                },
                {
                    id: "4.b.2.5",
                    parentId: "4.b.2",
                    text: $translate.instant("LEFTMENU_SCORECARD"),
                    icon: "ips-icon-pass-score",
                    li_attr: {},
                    a_attr: {
                        href: "/home/knowledge/scorecard"
                    },
                },
                {
                    id: "4.c",
                    parentId: "4",
                    text: $translate.instant("COMMON_TRAINING"),
                    icon: "ips-icon-training",
                    li_attr: {},
                    a_attr: {},
                },
                {
                    id: "4.c.1",
                    parentId: "4.c",
                    text: $translate.instant("COMMON_PERSONAL_TRAININGS"),
                    icon: "ips-icon-personal-training",
                    li_attr: {},
                    a_attr: {},
                },
                {
                    id: "4.c.1.1",
                    parentId: "4.c.1",
                    text: $translate.instant("COMMON_UPCOMING") + " " + $translate.instant("COMMON_TRAINING"),
                    icon: "ips-icon-upcoming-1",
                    li_attr: {},
                    a_attr: {
                        href: "/home/training/upcomingPersonalTrainings"
                    },
                },
                {
                    id: "4.c.1.2",
                    parentId: "4.c.1",
                    text: $translate.instant("COMMON_COMPLETED") + " " + $translate.instant("COMMON_TRAINING"),
                    icon: "ips-icon-complete",
                    li_attr: {},
                    a_attr: {
                        href: "/home/training/completedPersonalTrainings"
                    },
                },
                {
                    id: "4.c.1.3",
                    parentId: "4.c.1",
                    text: $translate.instant("NOTIFICATION_PERSONAL") + " " + $translate.instant("TRAININGDAIRY_TRAINING_SUMMARY"),
                    icon: "ips-icon-summary",
                    li_attr: {},
                    a_attr: {
                        href: "/home/training/personalTrainingSummary"
                    },
                },
                {
                    id: "4.c.1.4",
                    parentId: "4.c.1",
                    text: $translate.instant("COMMON_PERSONAL_TRAININGS_DIARY"),
                    icon: "fa fa-suitcase",
                    li_attr: {},
                    a_attr: {
                        href: "/home/training/personaltrainingdiary"
                    },
                },
                {
                    id: "4.c.2",
                    parentId: "4.c",
                    text: $translate.instant("HOME_PROFILE_TRAININGS"),
                    icon: "ips-icon-profile-training",
                    li_attr: {},
                    a_attr: {},
                },
                {
                    id: "4.c.2.1",
                    parentId: "4.c.2",
                    text: $translate.instant("COMMON_UPCOMING") + " " + $translate.instant("HOME_PROFILE_TRAININGS"),
                    icon: "ips-icon-upcoming-1",
                    li_attr: {},
                    a_attr: {
                        href: "/home/training/upcomingProfileTrainings"
                    },
                },
                {
                    id: "4.c.2.2",
                    parentId: "4.c.2",
                    text: $translate.instant("COMMON_COMPLETED") + " " + $translate.instant("HOME_PROFILE_TRAININGS"),
                    icon: "ips-icon-complete",
                    li_attr: {},
                    a_attr: {
                        href: "/home/training/completedProfileTrainings"
                    },
                },
                {
                    id: "4.c.2.3",
                    parentId: "4.c.2",
                    text: $translate.instant("COMMON_PROFILE") + " " + $translate.instant("TRAININGDAIRY_TRAINING_SUMMARY"),
                    icon: "ips-icon-summary",
                    li_attr: {},
                    a_attr: {
                        href: "/home/training/profileTrainingSummary"
                    },
                },
                {
                    id: "4.c.2.4",
                    parentId: "4.c.2",
                    text: $translate.instant("COMMON_PROFILE_TRAININGS_DIARY"),
                    icon: "fa fa-suitcase",
                    li_attr: {},
                    a_attr: {
                        href: "/home/training/profiletrainingdiary"
                    },
                },
                {
                    id: "4.d",
                    parentId: "4",
                    text: $translate.instant("COMMON_TASKS"),
                    icon: "ips-icon-task",
                    li_attr: {},
                    a_attr: {},
                },
                {
                    id: "4.d.1",
                    parentId: "4.d",
                    text: $translate.instant("NOTIFICATION_PERSONAL") + " " + $translate.instant("COMMON_TASKS"),
                    icon: "ips-icon-personal-task",
                    li_attr: {},
                    a_attr: {
                    },
                },
                {
                    id: "4.d.1.1",
                    parentId: "4.d.1",
                    text: $translate.instant("NOTIFICATION_PERSONAL") + " " + $translate.instant("COMMON_UPCOMING") + "  " + $translate.instant("COMMON_TASKS"),
                    icon: "ips-icon-upcoming-1",
                    li_attr: {},
                    a_attr: {
                        href: "/home/todos/upcomingPersonalTasks"
                    },
                },
                {
                    id: "4.d.1.2",
                    parentId: "4.d.1",
                    text: $translate.instant("NOTIFICATION_PERSONAL") + " " + $translate.instant("COMMON_COMPLETED") + "  " + $translate.instant("COMMON_TASKS"),
                    icon: "ips-icon-complete",
                    li_attr: {},
                    a_attr: {
                        href: "/home/todos/completedPersonalTasks"
                    },
                },
                {
                    id: "4.d.2",
                    parentId: "4.d",
                    text: $translate.instant("COMMON_CORPORATE_TASKS"),
                    icon: "ips-icon-personal-training",
                    li_attr: {},
                    a_attr: {
                    },
                },
                {
                    id: "4.d.2.1",
                    parentId: "4.d.2",
                    text: $translate.instant("NOTIFICATION_CORPORATE") + " " + $translate.instant("COMMON_UPCOMING") + "  " + $translate.instant("COMMON_TASKS"),
                    icon: "ips-icon-upcoming-1",
                    li_attr: {},
                    a_attr: {
                        href: "/home/todos/upcomingCorporateTasks"
                    },
                },
                {
                    id: "4.d.2.2",
                    parentId: "4.d.2",
                    text: $translate.instant("NOTIFICATION_CORPORATE") + " " + $translate.instant("COMMON_COMPLETED") + "  " + $translate.instant("COMMON_TASKS"),
                    icon: "ips-icon-complete",
                    li_attr: {},
                    a_attr: {
                        href: "/home/todos/completedCorporateTasks"
                    },
                },
                {
                    id: "4.e",
                    parentId: "4",
                    text: $translate.instant("LEFTMENU_PROSPECTING"),
                    icon: "ips-icon-add-sales",
                    li_attr: {},
                    a_attr: {
                    },
                },
                {
                    id: "4.e.1",
                    parentId: "4.e",
                    text: $translate.instant("COMMON_RESULT"),
                    icon: "ips-icon-result",
                    li_attr: {},
                    a_attr: {
                        href: "/home/salesProspecting/measure"
                    },
                },
                {
                    id: "4.e.2",
                    parentId: "4.e",
                    text: $translate.instant("COMMON_UPCOMING_PROSPECTING_GOAL"),
                    icon: "ips-icon-result",
                    li_attr: {},
                    a_attr: {
                        href: "/home/salesProspecting/upcomingSalesProspecting"
                    },
                },
                {
                    id: "4.e.3",
                    parentId: "4.e",
                    text: $translate.instant("COMMON_COMPLETED_PROSPECTING_GOAL"),
                    icon: "ips-icon-result",
                    li_attr: {},
                    a_attr: {
                        href: "/home/salesProspecting/completedSalesProspecting"
                    },
                },
                {
                    id: "4.f",
                    parentId: "4",
                    text: $translate.instant("LEFTMENU_SERVICE_PROSPECTING"),
                    icon: "ips-icon-service-prospecting-management",
                    li_attr: {},
                    a_attr: {

                    },
                },
                {
                    id: "4.f.1",
                    parentId: "4.f",
                    text: $translate.instant("COMMON_RESULT"),
                    icon: "ips-icon-result",
                    li_attr: {},
                    a_attr: {
                        href: "/home/serviceProspecting/measure"
                    },
                },
                {
                    id: "4.f.2",
                    parentId: "4.f",
                    text: $translate.instant("COMMON_UPCOMING_PROSPECTING_GOAL"),
                    icon: "ips-icon-result",
                    li_attr: {},
                    a_attr: {
                        href: "/home/serviceProspecting/upcomingServiceProspecting"
                    },
                },
                {
                    id: "4.f.3",
                    parentId: "4.f",
                    text: $translate.instant("COMMON_COMPLETED_PROSPECTING_GOAL"),
                    icon: "ips-icon-result",
                    li_attr: {},
                    a_attr: {
                        href: "/home/serviceProspecting/completedServiceProspecting"
                    },
                },

            ];

            $scope.selectMenu = function (menuItem) {

                if (menuItem) {
                    if (menuItem.a_attr.href) {
                        $location.path(menuItem.a_attr.href);
                    }
                    else {
                        var ishavesubmenu = _.any($scope.menuItems, function (item) {
                            return item.parentId == menuItem.id;
                        });
                        if (ishavesubmenu) {
                            $scope.selectedMenuItem = menuItem;
                            localStorageService.set("selectedMenuItem", menuItem);
                            $scope.parentItems = [];
                            findAllParent($scope.selectedMenuItem.id);
                            $scope.parentItems = _.uniq($scope.parentItems).reverse();
                            $(".page-sidebar-menu li.active").removeClass("active");
                            $(".page-sidebar-menu li[data-id='" + menuItem.id + "']").addClass("active");

                            _.each($scope.parentItems, function (item) {
                                //$(".page-sidebar-menu li[data-id='" + item.id + "']").find(".nav-link").eq(0).click();
                                $(".page-sidebar-menu li[data-id='" + item.id + "']").addClass("active");
                                $(".page-sidebar-menu li[data-id='" + item.id + "']").addClass("open");
                                $(".page-sidebar-menu li[data-id='" + item.id + "']").find(".nav-link").find(".arrow").addClass("open");
                            })
                        }
                        else {
                            dialogService.showNotification("No submenu or url exist for selected menu");
                        }
                    }
                }
                else {
                    $scope.selectedMenuItem = null;
                    localStorageService.set("selectedMenuItem", null);
                    $scope.parentItems = [];
                }

            }
            if (localStorageService.get("selectedMenuItem")) {
                $scope.selectMenu(localStorageService.get("selectedMenuItem"));
            }
            else {
                $scope.parentItems = [];
            }
            $scope.filterMenu = function (item) {
                if ($scope.selectedMenuItem) {
                    return item.parentId == $scope.selectedMenuItem.id;
                }
                else {
                    return item.parentId == null
                }
            }

            $scope.filterParentMenu = function () {
                if ($scope.selectedMenuItem) {
                    var ishaveparent = _.any($scope.menuItems, function (item) {
                        return item.parentId == $scope.selectedMenuItem.parentId;
                    });
                }
            }

            function findAllParent(id) {
                for (var d in $scope.menuItems) {
                    if ($scope.menuItems[d].id == id) {
                        $scope.parentItems.push($scope.menuItems[d])
                        if ($scope.menuItems[d].parentId) {
                            findAllParent($scope.menuItems[d].parentId)
                        }
                    }
                }
            }



            $scope.isHavePermitions = function (resourseName) {
                if (resourseName) {
                    var isApplicableToAllResources = true;
                    var res = false;
                    var permitions = $scope.authentication.user.permitions;
                    angular.forEach(permitions, function (orgPermitions, index) {
                        angular.forEach(orgPermitions.RolePermissionsOwnResources, function (item, index) {
                            if (_.trim(item.ResourseName) == resourseName) {
                                if (item.IsRead) {
                                    res = true;
                                }
                            }
                        });
                    });
                    return res;
                }
                else {
                    return true;
                }
            };

            $scope.scrollOptions = {
                position: 'right',
                height: 'auto !important',
                railVisible: true,
                alwaysVisible: true,
            };
            $scope.ktProfileTypes = {
                start: { id: 1, label: $translate.instant('COMMON_START_STAGE') },
                final: { id: 2, label: $translate.instant('COMMON_FINAL_STAGE') }
            };

            $scope.today = new Date().setHours(0, 0, 0, 0);
            moment.locale(globalVariables.lang.currentUICulture);
            var endDay = moment();
            $scope.endOfDay = endDay.endOf('day')._d;


            $scope.signIn = function () {
                $location.url("/login?target=1");
            }



            //Time Summary


        }])