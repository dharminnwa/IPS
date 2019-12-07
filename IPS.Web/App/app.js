'use strict';

// Declare app level module which depends on views, and components
var app = angular.module('ips', [
    'ngFileUpload',
    'ui.router',
    'ui.utils',
    'ui.bootstrap',
    'angular-cron-jobs',
    'LocalStorageModule',
    'ips.finalKPI',
    'ips.teamFinalKPI',
    'ips.nav',
    'ips.home',
    'ips.myDashboard',
    'ips.blog',
    'ips.help',
    'ips.about',
    'ips.login',
    'ips.forgotPassword',
    'ips.scales',
    'ips.personalnfo',
    'ips.organization',
    'ips.department',
    'ips.team',
    'ips.user',
    'ips.notification',
    'ips.organization.security',
    'ips.performance',
    'ips.projects',
    'ips.emails',
    'ips.attachments',
    'ips.trainings',
    'ips.trainingdiary',
    'ips.starttraining',
    'ips.evaluatetraining',
    'ips.roleLevel',
    'ips.reports',
    'ips.profiles',
    'ips.admin.users',
    'ips.admin.user',
    'ips.admin.changePassword',
    'ips.changePassword',
    'ips.industries',
    'ips.profileCategories',
    'ips.skills',
    'ips.medalRules',
    'ips.stageGroups',
    'ips.questions',
    'ips.performanceGroups',
    'ips.bscPerspectives',
    'ips.bscGoals',
    'ips.survey',
    'ips.activeProfiles',
    'ips.activeProjects',
    'ips.KPI',
    'angular.css.injector',
    'ips.tasksSettings',
    'ips.devContract',
    'ips.todos',
    'ips.trainingdiary',
    'kendo.directives',
    'angularUtils.directives.uiBreadcrumbs',
    'growing-panes',
    'flow',
    //'angularFileUpload',
    'ips.surveyAnalysis',
    'ips.bookmarks',
    'ips.measureUnits',
    'ui.bootstrap',
    'angularjs-dropdown-multiselect',
    'angularUtils.directives.dirPagination',
    'ngCkeditor',
    'ips.cms',
    'ips.helpcontent',
    'ips.helpcategory',
    'ips.plan',
    'ips.template',
    'ips.portfolio',
    'ips.homeland',
    'ips.taskProspecting',
    'ips.serviceProspecting',
    'ngProgress',
    'as.sortable',
    'timer',
    'pascalprecht.translate',
    'tmh.dynamicLocale'
])
    .config(['$stateProvider', '$urlRouterProvider', '$locationProvider', 'cssInjectorProvider', function ($stateProvider, $urlRouterProvider, $locationProvider, cssInjectorProvider) {

        $stateProvider
            .state('home.settings', {
                abstract: true,
                url: '/settings',
                template: '<ui-view/>',
                data: {
                    proxy: 'settings.scales',
                    displayName: "Scales"
                }
            })
            .state('home.organizations', {
                abstract: true,
                url: '/organizations',
                template: '<ui-view/>',
                data: {
                    proxy: 'organizations.organizations',
                    displayName: "Organizations"
                }
            })
            .state('home.cms', {
                abstract: true,
                url: '/cms',
                template: '<ui-view/>',
                data: {
                    proxy: 'cms',
                    displayName: 'Cms'
                }
            })
            .state('home.template', {
                abstract: true,
                url: '/template',
                template: '<ui-view/>',
                data: {
                    proxy: 'template',
                    displayName: 'Template'
                }
            })
            .state('home.portfolio', {
                abstract: true,
                url: '/portfolio',
                template: '<ui-view/>',
                data: {
                    proxy: 'portfolio',
                    displayName: 'Portfolio'
                }
            })
            .state('home.helpcontent', {
                abstract: true,
                url: '/content',
                template: '<ui-view/>',
                data: {
                    proxy: 'helpcontent.content',
                    displayName: 'Content'

                }

            })
            .state('home.helpcategory', {
                abstract: true,
                url: '/category',
                template: '<ui-view/>',
                data: {
                    proxy: 'helpcontent.content',
                    displayName: 'category'

                }

            })
            .state('home.plan', {
                abstract: true,
                url: '/plan',
                template: '<ui-view/>',
                data: {
                    proxy: 'helpcontent.content',
                    displayName: 'category'

                }

            })
            .state('home.profiles', {
                abstract: true,
                url: '/profiles',
                template: '<ui-view/>',
                data: {
                    proxy: 'profiles.soft',

                }
            })
            .state('home.training', {
                abstract: true,
                url: '/training',
                template: '<ui-view/>',
                data: {
                    proxy: 'training.trainingsdiary',
                    resource: "Trainings"
                }
            })

            .state('home.roleLevel', {
                abstract: true,
                url: '/roleLevel',
                template: '<ui-view/>',
                data: {
                    proxy: 'roleLevel.roleLevels',
                    resource: "Security"
                }
            })
            .state('home.performance', {
                abstract: true,
                url: '/performance',
                template: '<ui-view/>',
                data: {
                    proxy: 'performance.dashboard'
                }
            })
            .state('home.todos', {
                abstract: true,
                url: '/todos',
                template: '<ui-view/>',
                data: {
                    proxy: 'todos.todos',

                }

            })
            .state('home.administration', {
                abstract: true,
                url: '/administration',
                template: '<ui-view/>',
                data: {
                    proxy: 'administration.security',
                }
            })
            .state('home.homeland', {
                abstract: true,
                url: '/homeland',
                template: '<ui-view/>',
                data: {
                    proxy: 'administration.security'
                }
            })
            .state('home.administration.settings', {
                abstract: true,
                url: '/settings',
                template: '<ui-view/>',
                data: {
                    proxy: 'administration.security'
                }
            })
            .state('home.bsc', {
                abstract: true,
                url: '/bsc',
                template: '<ui-view/>',
                data: {
                    proxy: 'home.bsc.bscGoals'
                }
            })
            .state('home.salesProspecting', {
                abstract: true,
                url: '/salesProspecting',
                template: '<ui-view/>',
                data: {
                    proxy: 'salesProspecting.todaySalesProspecting',
                    //resource: "Sales Prospecting"
                }
            })
            .state('home.serviceProspecting', {
                abstract: true,
                url: '/serviceProspecting',
                template: '<ui-view/>',
                data: {
                    proxy: 'serviceProspecting.todayServiceProspecting',
                    //resource: "Sales Prospecting"
                }
            })
            ;

        //$locationProvider.html5Mode(true);
        $urlRouterProvider.otherwise("/home");
        //$urlRouterProvider.when('/home');

        cssInjectorProvider.setSinglePageMode(true);
    }])
    // prevent double click
    .config(['$provide', function ($provide) {
        $provide.decorator('ngClickDirective', ['$delegate', '$timeout', function ($delegate, $timeout) {
            var original = $delegate[0].compile;
            var delay = 500;
            $delegate[0].compile = function (element, attrs, transclude) {

                var disabled = false;
                function onClick(evt) {
                    if (disabled) {
                        evt.preventDefault();
                        evt.stopImmediatePropagation();
                    } else {
                        disabled = true;
                        $timeout(function () { disabled = false; }, delay, false);
                    }
                }

                element.on('click', onClick);

                return original(element, attrs, transclude);
            };
            return $delegate;
        }]);
    }])
    .config(['$translateProvider', function ($translateProvider) {
        $translateProvider
            .useStaticFilesLoader({
                prefix: 'cultures/',
                suffix: '.json'
            })
            // remove the warning from console log by putting the sanitize strategy
            .useSanitizeValueStrategy('sanitizeParameters')
            .preferredLanguage('nb-NO');
    }])
    .config(function (tmhDynamicLocaleProvider) {
        tmhDynamicLocaleProvider.localeLocationPattern('../Scripts/angular-locale/angular-locale_{{locale}}.min.js');
        tmhDynamicLocaleProvider.defaultLocale('nb-NO');
    });
app.factory('globalVariables', function () {
    return {
        returnToURL: '',
        lang: {
            currentUICulture: 'nb-NO',
            currentCulture: 'nb-NO'
        }
    };
});

// Manage navigation bar actions
app.controller('navCtrl', ['$scope', '$location', '$interval', 'authService', '$rootScope', '$state', 'globalVariables', '$translate', 'tmhDynamicLocale', 'userDashboardManager', 'localStorageService', '$compile', 'dialogService', function ($scope, $location, $interval, authService, $rootScope, $state, globalVariables, $translate, tmhDynamicLocale, userDashboardManager, localStorageService, $compile, dialogService) {
    $scope.langugeList = [{ langCode: "en-US", langName: 'English' }, { langCode: "nb-NO", langName: 'Norwegian' }]

    $scope.setCulture = function (culture, reloadState) {
        $translate.use(culture);
        tmhDynamicLocale.set(culture);
        window.kendo.culture(culture);
        moment.locale(culture);  //Make sure moment.min.js has included the locales; otherwise, download a new moment.min.js with them.
        globalVariables.lang.currentUICulture = culture;
        globalVariables.lang.currentCulture = culture;

        $scope.selectedLanguageText = _.find($scope.langugeList, function (item) {
            return item.langCode === culture;
        });

        if (reloadState) {
            $state.reload();
        }
    };

    $scope.setCulture("nb-NO", false);

    $scope.isActive = function (viewLocation) {
        return $location.url().indexOf(viewLocation) != -1;
    };

    $scope.getHeader = function (viewLocation) {
        if (!$rootScope.Title) {
            $rootScope.Title = "";
        }
        return $rootScope.Title;
    };

    $scope.isHavePermitions = function (resourseName) {
        var isApplicableToAllResources = true;
        var res = false;
        //var permitions = jQuery.parseJSON($scope.authentication.user.permitions); //TODO: remove this line because permissions are now already deserialized
        var permitions = $scope.authentication.user.permitions;

        //angular.forEach(permitions, function (orgPermitions, index) {
        //    angular.forEach(orgPermitions.RolePermissionsAllResources, function (item, index) {
        //        if (item.ResourseName == resourseName) {
        //            if (item.IsRead) {
        //                res = true;
        //            }
        //        }
        //    });
        //});

        angular.forEach(permitions, function (orgPermitions, index) {
            angular.forEach(orgPermitions.RolePermissionsOwnResources, function (item, index) {
                if (_.trim(item.ResourseName).toLowerCase() == resourseName.toLowerCase()) {
                    if (item.IsRead) {
                        res = true;
                    }
                }
            });
        });


        return res;
    };
    $scope.isHavePermitions1 = function (resourseName, id) {
        console.log(id + " resourseName = " + resourseName);
    }
    $scope.logOut = function () {
        authService.logOut();
        $location.path('/login');
    };

    $scope.authentication = authService.authentication;
    $scope.currentUser = $scope.authentication.user;
    $scope.unReadMessages = [];
    $scope.searchUserText = null;
    $scope.searchedUsers = [];
    $scope.serachUser = function (value) {
        $scope.searchedUsers = [];
        if (value != null && value != "") {
            userDashboardManager.getUsersBySearchText(value).then(function (data) {
                $scope.searchedUsers = data;
            })
        }
    }
    $scope.sendEmail = function (userEmail) {
        if (userEmail) {
            localStorageService.set("userEmail", userEmail);
            $('ul.dropdown-menu.mega-dropdown-menu').parent().removeClass('open');
            $location.path("/newemail");
        }
        else {
            dialogService.showNotification("No Email for this user please update email into user profile page.", "error")
        }
    }
    $scope.openAttachmentPopupMode = { isOpenNewAttachmentPopup: false };
    $scope.selectedUserId = 0;
    $scope.addAttachment = function (userId) {
        $scope.selectedUserId = userId;
        //var html = '';
        //var linkFn = $compile(html);
        //var content = linkFn($scope);
        //$("#commonPopupDiv").html(content);
        $scope.openAttachmentPopupMode.isOpenNewAttachmentPopup = true;
    }
    $scope.isStandaloneMode = authService.isStandaloneMode;

    $scope.checkState = function () {
        if (angular.isDefined($scope.stopTimer)) return;
        $scope.stopTimer = $interval(function () {

            if (authService.authentication.isAuth) {
                authService.getCurrentUser().then(function (response) {
                    var user = response.data;
                    if (!user.isActive) {
                        $scope.logOut();
                    }
                }, ifError);

            }

        }, 120000);
    };
    $scope.checkUnreadMessages = function () {
        if (authService.authentication.isAuth) {
            if (angular.isDefined($scope.stopUnreadMessageTimer)) return;
            $scope.stopUnreadMessageTimer = $interval(function () {

                authService.getUnreadMessages().then(function (result) {
                    $scope.unReadMessages = result.data;
                    _.each($scope.unReadMessages.messages, function (item) {
                        item.sentTime = moment(kendo.parseDate(item.sentTime)).format("L LT");
                    })
                })

            }, 60000)
        }
    }
    $scope.viewEmail = function (id) {
        $location.path("/viewemail/" + id);
    }
    $scope.gotoHome = function () {
        localStorageService.set("selectedMenuItem", null);
        $state.go("home");
        //$location.path("/home");

    }
    function ifError(err) {
        if (err.error_description != undefined) {
            $scope.message = err.error_description;
        }
        else {
            $scope.message = err;
        }

        $scope.$apply();

        $scope.logOut();
    }

    $scope.checkState();
    $scope.checkUnreadMessages()
    $scope.apiServiceBaseUri = serviceBase;
    if ($scope.currentUser) {
        $rootScope.menuItems = [
            
            {
                id: "0",
                text: "MY_DASHBOARD",
                icon: "ips-icon-dashboard",
                li_attr: {},
                a_attr: {
                    href: "/myDashboard"
                },
                parentId: null
            },
            {
                id: "1",
                text: "USER_MANAGEMENT",
                icon: "ips-icon-management",
                li_attr: {},
                a_attr: {},
                parentId: null
            },
            {
                id: "1.a",
                parentId: "1",
                text: "ORG_MANAGEMENT",
                icon: "ips-icon-organization",
                li_attr: {},
                a_attr: {},
            },
            {
                id: "1.a.1",
                parentId: "1.a",
                text: "LEFTMENU_ORGANIZATIONS",
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
                text: "ORGANIZATIONS_USERS",
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
                text: "COMMON_DEPARTMENTS",
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
                text: "COMMON_TEAMS",
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
                text: "CRM_COMMON_CUSTOMERS",
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
                text: "LEFTMENU_IMPORT_ORGANIZATIONS",
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
                text: "LEFTMENU_INDUSTRIES",
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
                text: "LEFTMENU_SECURITY",
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
                text: "ROLE_MANAGEMENT",
                icon: "ips-icon-role",
                resource: "Security",
                li_attr: {},
                a_attr: {},
            },
            {
                id: "1.d.1",
                parentId: "1.d",
                text: "LEFTMENU_ROLE_LEVELS",
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

                text: "LEFTMENU_NEW_ROLE_LEVEL_TEMPLATES",
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
                text: "LEFTMENU_SET_ROLE_LEVEL_PERMISSION",
                icon: "ips-icon-permission",
                resource: "Security",
                li_attr: {},
                a_attr: {
                    href: "/home/roleLevel/setPermission/null/null",
                },
            },
            {
                id: "2",
                text: "COMMON_PLAN",
                icon: "ips-icon-plan",
                // array of strings or objects
                li_attr: {},  // attributes for the generated LI node
                a_attr: {},  // attributes for the generated A node
                parentId: null,
            },
            {
                id: "2.b",
                parentId: "2",
                text: "COMMON_PROJECT",
                icon: "fa fa-sun-o",
                resource: "Projects",
                li_attr: {},
                a_attr: {},
            },
            {
                id: "2.b.1",
                parentId: "2.b",
                text: "MYPROJECTS_NEW_PROJECT",
                icon: "ips-icon-new-project",
                resource: "Projects",
                li_attr: {},
                a_attr: {
                    href: "/newproject"
                },
            },

            {
                id: "2.a",
                parentId: "2",
                text: "COMMON_PROFILE",
                icon: "ips-icon-profile-management",
                li_attr: {},
                a_attr: {},
            },
            {
                id: "2.a.1",
                parentId: "2.a",
                text: "COMMON_NEW_SOFT_PROFILE",
                icon: "ips-icon-soft-profile",
                li_attr: {},
                a_attr: {
                    href: "/home/soft/profile/0"
                },
            },
            {
                id: "2.a.2",
                parentId: "2.a",
                text: "COMMON_NEW_KNOWLEDGE_PROFILE",
                icon: "ips-icon-knowledge-profile",
                li_attr: {},
                a_attr: {
                    href: "/home/knowledge/profile/0"
                },
            },

            {
                id: "2.c",
                parentId: "2",
                text: "LEFTMENU_TRAININGS",
                icon: "ips-icon-training",
                li_attr: {},
                a_attr: {},
            },
            {
                id: "2.c.3",
                parentId: "2.c",
                text: "COMMON_NEW_PERSONAL_TRAINING",
                icon: "ips-icon-personal-training",
                li_attr: {},
                a_attr: {
                    href: "/home/training/newPersonalTraining"
                },
            },
            {
                id: "2.c.4",
                parentId: "2.c",
                text: "MYPROJECTS_TRAINING_TEMPLATES",
                icon: "ips-icon-training-templates",
                li_attr: {},
                a_attr: {
                    href: "/home/training/trainingTemplates"
                },
            },
            {
                id: "2.c.5",
                parentId: "2.c",
                text: "LEFTMENU_TRAINING_SETTINGS",
                icon: "ips-icon-training-setting",
                li_attr: {},
                a_attr: {
                    href: "/home/training/trainingSetting"
                },
            },
            {
                id: "2.d",
                parentId: "2",
                text: "COMMON_TASKS",
                icon: "ips-icon-task",
                li_attr: {},
                a_attr: {},
            },
            {
                id: "2.d.1",
                parentId: "2.d",
                text: "TASKPROSPECTING_NEW_TASK",
                icon: "ips-icon-new-task",
                li_attr: {},
                a_attr: {
                    href: "/home/todos/new"
                },
            },
            {
                id: "2.d.2",
                parentId: "2.d",
                text: "TASKMANAGEMENT_TASK_SETTINGS",
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
                text: "LEFTMENU_PROSPECTING",
                icon: "ips-icon-sales-prospecting-management",
                li_attr: {},
                a_attr: {},
            },
            {
                id: "2.e.1",
                parentId: "2.e",
                text: "COMMON_NEW_PROSPECTING_GOAL",
                icon: "ips-icon-add-sales",
                li_attr: {},
                a_attr: {
                    href: "/newSalesProspecting",
                },
            },

            {
                id: "2.f",
                parentId: "2",
                text: "LEFTMENU_SERVICE_PROSPECTING",
                icon: "ips-icon-service-prospecting-management",
                li_attr: {},
                a_attr: {},
            },
            {
                id: "2.f.1",
                parentId: "2.f",
                text: "COMMON_NEW_PROSPECTING_GOAL",
                icon: "ips-icon-add-sales",
                li_attr: {},
                a_attr: {
                    href: "/newServiceProspecting",
                },
            },

            {
                id: "2.g",
                parentId: "2",
                text: "SOFTPROFILE_NOTIFICATIONS",
                icon: "ips-icon-notification",
                li_attr: {},
                a_attr: {
                    href: "/home/notificationTemplates/" + $scope.currentUser.organizationId,
                },
            },

            {
                id: "3",
                text: "RUN",
                icon: "ips-icon-play",
                li_attr: {},  // attributes for the generated LI node
                a_attr: {},  // attributes for the generated A node
                parentId: null,
            },
            {
                id: "3.a",
                parentId: "3",
                text: "LEFTMENU_SOFT_PROFILE",
                icon: "ips-icon-active-profile",
                li_attr: {},
                a_attr: {
                    href: "/home/soft/activeProfiles"
                },
            },
            {
                id: "3.b",
                parentId: "3",
                text: "LEFTMENU_KNOWLEDGE_PROFILE",
                icon: "ips-icon-knowledge-profile",
                li_attr: {},
                a_attr: {
                    href: "/home/knowledge/activeProfiles"
                },
            },
            {
                id: "3.c",
                parentId: "3",
                text: "COMMON_TRAINING",
                icon: "ips-icon-training",
                li_attr: {},
                a_attr: {
                },
            },
            {
                id: "3.c.1",
                parentId: "3.c",
                text: "HOME_OWN_TRAININGS",
                icon: "ips-icon-personal-training",
                li_attr: {},
                a_attr: {
                    href: "/home/training/todayPersonalTrainings"
                },
            },
            {
                id: "3.c.2",
                parentId: "3.c",
                text: "HOME_PROFILE_TRAININGS",
                icon: "ips-icon-profile-training",
                li_attr: {},
                a_attr: {
                    href: "/home/training/todayProfileTrainings"
                },
            },

            {
                id: "3.d",
                parentId: "3",
                text: "COMMON_TASKS",
                icon: "ips-icon-task",
                li_attr: {},
                a_attr: {
                },
            },
            {
                id: "3.d.1",
                parentId: "3.d",
                text: "HOME_TODAYS_TASKS",
                icon: "ips-icon-personal-task",
                li_attr: {},
                a_attr: {
                    href: "/home/todos/todayTasks"
                },
            },
            {
                id: "3.e",
                parentId: "3",
                text: "MYPROJECTS_ACTIVE_PROJECTS",
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
                text: "LEFTMENU_PROSPECTING",
                icon: "ips-icon-sales-prospecting-management",
                li_attr: {},
                a_attr: {},
            },
            {
                id: "3.f.1",
                parentId: "3.f",
                text: "COMMON_TODAY_LEFTMENU_PROSPECTING",
                icon: "ips-icon-add-sales",
                li_attr: {},
                a_attr: {
                    href: "/home/salesProspecting/todaySalesProspecting"
                },
            },

            {
                id: "3.g",
                parentId: "3",
                text: "LEFTMENU_SERVICE_PROSPECTING",
                icon: "ips-icon-service-prospecting-management",
                li_attr: {},
                a_attr: {},
            },
            {
                id: "3.g.1",
                parentId: "3.g",
                text: "COMMON_TODAY_SERVICE_PROSPECTING",
                icon: "ips-icon-service",
                li_attr: {},
                a_attr: {
                    href: "/home/serviceProspecting/todayServiceProspecting"
                },
            },
            {
                id: "4",
                text: "MEASURE_ANALYZE",
                icon: "ips-icon-measure",
                li_attr: {},  // attributes for the generated LI node
                a_attr: {},  // attributes for the generated A node
                parentId: null,
            },
            {
                id: "4.a",
                parentId: "4",
                text: "COMMON_PROJECT",
                icon: "fa fa-sun-o",
                li_attr: {},  // attributes for the generated LI node
                a_attr: {},  // attributes for the generated A node
            },
            {
                id: "4.a.1",
                parentId: "4.a",
                text: "MYPROJECTS_PENDING_PROJECTS",
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
                text: "MYPROJECTS_EXPIRED_PROJECTS",
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
                text: "MYPROJECTS_COMPLETED_PROJECTS",
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
                text: "COMMON_HISTORY",
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
                text: "COMMON_PROFILES",
                icon: "ips-icon-profile-management",
                li_attr: {},  // attributes for the generated LI node
                a_attr: {},  // attributes for the generated A node
            },

            {
                id: "4.b.1",
                parentId: "4.b",
                text: "LEFTMENU_SOFT_PROFILE",
                icon: "ips-icon-soft-profile",
                li_attr: {},
                a_attr: {},
            },
            {
                id: "4.b.1.1",
                parentId: "4.b.1",
                text: "MYPROFILES_EXPIRED_PROFILES",
                icon: "ips-icon-expired-profile",
                li_attr: {},
                a_attr: {
                    href: "/home/soft/expiredProfiles"
                },
            },
            {
                id: "4.b.1.2",
                parentId: "4.b.1",
                text: "MYPROFILES_COMPLETED_PROFILES",
                icon: "ips-icon-completed-profile",
                resource: "Profiles",
                li_attr: {},
                a_attr: {
                    href: "/home/soft/completedProfiles"
                },
            },
            {
                id: "4.b.1.3",
                parentId: "4.b.1",
                text: "MYPROFILES_HISTORIC_PROFILES",
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
                text: "LEFTMENU_DASHBOARD",
                icon: "ips-icon-dashboard",
                li_attr: {},
                a_attr: {
                    href: "/home/soft/dashboard"
                },
            },
            {
                id: "4.b.1.5",
                parentId: "4.b.1",
                text: "COMMON_SCORECARD",
                icon: "ips-icon-pass-score",
                li_attr: {},
                a_attr: {
                    href: "/home/soft/scorecard"
                },
            },

            {
                id: "4.b.2",
                parentId: "4.b",
                text: "LEFTMENU_KNOWLEDGE_PROFILE",
                icon: "ips-icon-knowledge-profile",
                resource: "Profiles",
                li_attr: {},
                a_attr: {},
            },

            {
                id: "4.b.2.1",
                parentId: "4.b.2",
                text: "MYPROFILES_EXPIRED_PROFILES",
                resource: "Profiles",
                icon: "ips-icon-expired-profile",
                li_attr: {},
                a_attr: {
                    href: "/home/knowledge/expiredProfiles"
                },
            },
            {
                id: "4.b.2.2",
                parentId: "4.b.2",
                text: "MYPROFILES_COMPLETED_PROFILES",
                resource: "Profiles",
                icon: "ips-icon-completed-profile",
                li_attr: {},
                a_attr: {
                    href: "/home/knowledge/completedProfiles"
                },
            },
            {
                id: "4.b.2.3",
                parentId: "4.b.2",
                text: "MYPROFILES_HISTORIC_PROFILES",
                icon: "ips-icon-historic-profile",
                li_attr: {},
                a_attr: {
                    href: "/home/knowledge/historyProfiles"
                },
            },
            {
                id: "4.b.2.4",
                parentId: "4.b.2",
                text: "LEFTMENU_DASHBOARD",
                icon: "ips-icon-dashboard",
                li_attr: {},
                a_attr: {
                    href: "/home/knowledge/dashboard"
                },
            },
            {
                id: "4.b.2.4",
                parentId: "4.b.2",
                text: "LEFTMENU_SCORECARD",
                icon: "ips-icon-pass-score",
                li_attr: {},
                a_attr: {
                    href: "/home/knowledge/scorecard"
                },
            },
            {
                id: "4.c",
                parentId: "4",
                text: "COMMON_TRAINING",
                icon: "ips-icon-training",
                li_attr: {},
                a_attr: {},
            },
            {
                id: "4.c.1",
                parentId: "4.c",
                text: "COMMON_PERSONAL_TRAININGS",
                icon: "ips-icon-personal-training",
                li_attr: {},
                a_attr: {},
            },
            {
                id: "4.c.1.1",
                parentId: "4.c.1",
                text: "COMMON_UPCOMING_TRAININGS",
                icon: "ips-icon-upcoming-1",
                li_attr: {},
                a_attr: {
                    href: "/home/training/upcomingPersonalTrainings"
                },
            },
            {
                id: "4.c.1.2",
                parentId: "4.c.1",
                text: "COMMON_COMPLETED_TRAININGS",
                icon: "ips-icon-complete",
                li_attr: {},
                a_attr: {
                    href: "/home/training/completedPersonalTrainings"
                },
            },
            {
                id: "4.c.1.3",
                parentId: "4.c.1",
                text: "TRAININGDAIRY_TRAINING_SUMMARY",
                icon: "ips-icon-summary",
                li_attr: {},
                a_attr: {
                    href: "/home/training/personalTrainingSummary"
                },
            },
            {
                id: "4.c.1.4",
                parentId: "4.c.1",
                text: "COMMON_PERSONAL_TRAININGS_DIARY",
                icon: "fa fa-suitcase",
                li_attr: {},
                a_attr: {
                    href: "/home/training/personaltrainingdiary"
                },
            },
            {
                id: "4.c.2",
                parentId: "4.c",
                text: "HOME_PROFILE_TRAININGS",
                icon: "ips-icon-profile-training",
                resource: "Profiles",
                li_attr: {},
                a_attr: {},
            },
            {
                id: "4.c.2.1",
                parentId: "4.c.2",
                text: "COMMON_UPCOMING_TRAININGS",
                icon: "ips-icon-upcoming-1",
                resource: "Profiles",
                li_attr: {},
                a_attr: {
                    href: "/home/training/upcomingProfileTrainings"
                },
            },
            {
                id: "4.c.2.2",
                parentId: "4.c.2",
                text: "COMMON_COMPLETED_TRAININGS",
                icon: "ips-icon-complete",
                resource: "Profiles",
                li_attr: {},
                a_attr: {
                    href: "/home/training/completedProfileTrainings"
                },
            },

            {
                id: "4.c.2.3",
                parentId: "4.c.2",
                text: "TRAININGDAIRY_TRAINING_SUMMARY",
                icon: "ips-icon-summary",
                resource: "Profiles",
                li_attr: {},
                a_attr: {
                    href: "/home/training/profileTrainingSummary"
                },
            },

            {
                id: "4.c.2.4",
                parentId: "4.c.2",
                text: "COMMON_PROFILE_TRAININGS_DIARY",
                icon: "fa fa-suitcase",
                resource: "Profiles",
                li_attr: {},
                a_attr: {
                    href: "/home/training/profiletrainingdiary"
                },
            },

            {
                id: "4.d",
                parentId: "4",
                text: "COMMON_TASKS",
                icon: "ips-icon-task",
                li_attr: {},
                a_attr: {},
            },
            {
                id: "4.d.1",
                parentId: "4.d",
                text: "COMMON_PERSONAL_TASKS",
                icon: "ips-icon-personal-task",
                resource: "Task",
                li_attr: {},
                a_attr: {
                },
            },
            {
                id: "4.d.1.1",
                parentId: "4.d.1",
                text: "COMMON_UPCOMING_PERSONAL_TASKS",
                icon: "ips-icon-upcoming-1",
                resource: "Task",
                li_attr: {},
                a_attr: {
                    href: "/home/todos/upcomingPersonalTasks"
                },
            },
            {
                id: "4.d.1.2",
                parentId: "4.d.1",
                text: "COMMON_COMPLETED_PERSONAL_TASKS",
                icon: "ips-icon-complete",
                resource: "Task",
                li_attr: {},
                a_attr: {
                    href: "/home/todos/completedPersonalTasks"
                },
            },

            {
                id: "4.d.2",
                parentId: "4.d",
                text: "COMMON_CORPORATE_TASKS",
                icon: "ips-icon-personal-training",
                resource: "Task",
                li_attr: {},
                a_attr: {
                },
            },
            {
                id: "4.d.2.1",
                parentId: "4.d.2",
                text: "COMMON_UPCOMING_CORPORATE_TASKS",
                icon: "ips-icon-upcoming-1",
                resource: "Task",
                li_attr: {},
                a_attr: {
                    href: "/home/todos/upcomingCorporateTasks"
                },
            },
            {
                id: "4.d.2.2",
                parentId: "4.d.2",
                text: "COMMON_COMPLETED_CORPORATE_TASKS",
                icon: "ips-icon-complete",
                li_attr: {},
                resource: "Task",
                a_attr: {
                    href: "/home/todos/completedCorporateTasks"
                },
            },
            {
                id: "4.e",
                parentId: "4",
                text: "LEFTMENU_PROSPECTING",
                icon: "ips-icon-sales-prospecting-management",
                li_attr: {},
                a_attr: {

                },
            },
            {
                id: "4.e.1",
                parentId: "4.e",
                text: "COMMON_RESULT",
                icon: "ips-icon-result",
                li_attr: {},
                a_attr: {
                    href: "/home/salesProspecting/measure"
                },
            },
            {
                id: "4.e.2",
                parentId: "4.e",
                text: "COMMON_UPCOMING_PROSPECTING_GOAL",
                icon: "ips-icon-result",
                li_attr: {},
                a_attr: {
                    href: "/home/salesProspecting/upcomingSalesProspecting"
                },
            },
            {
                id: "4.e.3",
                parentId: "4.e",
                text: "COMMON_COMPLETED_PROSPECTING_GOAL",
                icon: "ips-icon-result",
                li_attr: {},
                a_attr: {
                    href: "/home/salesProspecting/completedSalesProspecting"
                },
            },

            {
                id: "4.f",
                parentId: "4",
                text: "LEFTMENU_SERVICE_PROSPECTING",
                icon: "ips-icon-service-prospecting-management",
                li_attr: {},
                a_attr: {

                },
            },
            {
                id: "4.f.1",
                parentId: "4.f",
                text: "COMMON_RESULT",
                icon: "ips-icon-result",
                li_attr: {},
                a_attr: {
                    href: "/home/serviceProspecting/measure"
                },
            },
            {
                id: "4.f.2",
                parentId: "4.f",
                text: "COMMON_UPCOMING_PROSPECTING_GOAL",
                icon: "ips-icon-result",
                li_attr: {},
                a_attr: {
                    href: "/home/serviceProspecting/upcomingServiceProspecting"
                },
            },
            {
                id: "4.f.3",
                parentId: "4.f",
                text: "COMMON_COMPLETED_PROSPECTING_GOAL",
                icon: "ips-icon-result",
                li_attr: {},
                a_attr: {
                    href: "/home/serviceProspecting/completedServiceProspecting"
                },
            }

        ];
        $scope.topMenuItems = _.filter($rootScope.menuItems, function (item) {
            return item.parentId == null;
        });
        $scope.secondaryMenuItems = [];
        _.each($scope.topMenuItems, function (topmenuItem) {
            _.each($rootScope.menuItems, function (menuItem) {
                if (menuItem.parentId == topmenuItem.id) {
                    $scope.secondaryMenuItems.push(menuItem)
                };
            });
        })

        $scope.thirdMenuItems = [];
        _.each($scope.secondaryMenuItems, function (secondarymenuItem) {
            _.each($rootScope.menuItems, function (menuItem) {
                if (menuItem.parentId == secondarymenuItem.id) {
                    $scope.thirdMenuItems.push(menuItem)
                };
            });
        })

        $scope.forthMenuItems = [];
        _.each($scope.thirdMenuItems, function (thirdmenuItem) {
            _.each($scope.menuItems, function (menuItem) {
                if (menuItem.parentId == thirdmenuItem.id) {
                    $scope.forthMenuItems.push(menuItem)
                };
            });
        })
    }

    $scope.showParentMenuFilterFn = function (item) {
        if (!item.parentId) {
            return true;
        }
        else {
            return false
        }
    }
    $scope.hasSubmenu = function (menuid) {
        return _.any($rootScope.menuItems, function (item) {
            return item.parentId == menuid;
        });
    }


    $scope.filterSubmenu = function (parentId) {
        var result = [];
        var menus = _.filter($rootScope.menuItems, function (item) {
            return item.parentId == parentId;
        });
        _.each(menus, function (menuItem) {
            var ishaveSubMenu = _.any($rootScope.menuItems, function (item) {
                return item.parentId == menuItem.id;
            })
            if (ishaveSubMenu) {
                result.push(menuItem)
            }
        })
        return result;
    }
    $scope.filterNoSubmenu = function (parentId) {
        var result = [];
        var menus = _.filter($rootScope.menuItems, function (item) {
            return item.parentId == parentId;
        });
        _.each(menus, function (menuItem) {
            var ishaveSubMenu = _.any($rootScope.menuItems, function (item) {
                return item.parentId == menuItem.id;
            })
            if (!ishaveSubMenu) {
                result.push(menuItem)
            }
        })
        return result;
    }
    $scope.showSubMenuFilterFn = function (item) {
        if (!item.parentId) {
            return true;
        }
        else {
            return false
        }
    }

}]);

var serviceBase = webConfig.serviceBase;

app.constant('ngAuthSettings', {
    apiServiceBaseUri: serviceBase,
    clientId: 'ngAuthApp'
});

app.config(function ($httpProvider) {
    $httpProvider.interceptors.push('authInterceptorService');
});

app.run(['authService', '$rootScope', '$state', '$stateParams', '$location', 'ngProgressFactory', 'progressBar', 'localStorageService', 'dialogService', 'globalVariables', '$translate', function (authService, $rootScope, $state, $stateParams, $location, ngProgressFactory, progressBar, localStorageService, dialogService, globalVariables, $translate) {
    //Commented by Feng[03rd/Oct/2018]: if the initial URL is not /login but targetting to a resource directly, we need to navigate to that resource successfully.
    var resourceURL = window.location.href.split('#')[1];

    if (resourceURL.indexOf('/login') === -1) {
        setTimeout(function () {
            if (authService.authentication.isAuth) {
                if (resourceURL == '/home') {
                    //$state.go("home");
                    //$location.path('/');
                } else {
                    $location.path('/home');
                }
                setTimeout(function () {
                    if (resourceURL != '/home') {
                        $location.path(resourceURL);
                    }
                    $(".k-window-content").each(function () {
                        $(this).data("kendoWindow").close();
                    });
                }, 1);
            }
            else {
                globalVariables.returnToURL = resourceURL;
                $location.path('/login');
            }
        }, 1);
    }

    var progress = ngProgressFactory.createInstance();
    progress.setColor("#FF7F00");
    authService.fillAuthData();

    $rootScope.$state = $state;
    $rootScope.$stateParams = $stateParams;
    $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
        progress.start();
        progressBar.startProgress();
        if (toState.data) {
            if (toState.data.resource) {
                if (isHavePermitions(toState.data.resource, toParams)) {
                    if (fromState.name == "home.training.start") {
                        if (localStorageService.get("isTrainingStart") == "true") {
                            progressBar.stopProgress();
                            progress.complete();
                            dialogService.showNotification($translate.instant('COMMON_YOU_ARE_NOT_ALLOWED_TO_LEAVE_THIS_PAGE'), "error");
                            event.preventDefault();
                        }
                    }
                    else {
                        if (toState.authenticate && !authService.authentication.isAuth) {
                            $rootScope.returnToState = toState.url;
                            $rootScope.returnToStateName = toState.name;
                            $rootScope.returnToStateParams = toParams;
                            $location.path('/login');
                        }
                    }
                }
                else {
                    progressBar.stopProgress();
                    progress.complete();
                    dialogService.showNotification($translate.instant('COMMON_ACCESS_DENIED'), "error");
                    event.preventDefault();
                }
            }
            else {
                progressBar.stopProgress();

            }
        }
        else {
            progressBar.stopProgress();

        }
    });
    $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
        progress.complete();
        progressBar.stopProgress();
        Layout.setSidebarMenuActiveLink("match", null, null);
        Layout.fixContentHeight();

        var path = $location.path();
        var selectedMenu = _.find($rootScope.menuItems, function (item) {
            if (item.a_attr) {
                return item.a_attr.href == path;
            }
        });
        if (selectedMenu) {
            $rootScope.parentItems = [];
            findAllParent(selectedMenu.id);
            $rootScope.parentItems = _.uniq($rootScope.parentItems).reverse();
            if ($rootScope.parentItems.length > 0) {
                var filterParentMenus = _.filter($rootScope.parentItems, function (item) {
                    return item.id != selectedMenu.id;
                });
                if (filterParentMenus.length > 0) {
                    var lastParent = filterParentMenus[filterParentMenus.length - 1];
                    if (lastParent) {
                        localStorageService.set("selectedMenuItem", lastParent);
                    }
                }
            }

            $(".page-sidebar-menu li.active").removeClass("active");
            $(".page-sidebar-menu li[data-id='" + selectedMenu.id + "']").find(".nav-link").eq(0).click();
            $(".page-sidebar-menu li[data-id='" + selectedMenu.id + "']").addClass("active");

            _.each($rootScope.parentItems, function (item) {
                //$(".page-sidebar-menu li[data-id='" + item.id + "']").find(".nav-link").eq(0).click();
                $(".page-sidebar-menu li[data-id='" + item.id + "']").addClass("active");
                $(".page-sidebar-menu li[data-id='" + item.id + "']").addClass("open");
                $(".page-sidebar-menu li[data-id='" + item.id + "']").find(".nav-link").find(".arrow").addClass("open");
            })
            $(".page-sidebar-menu li[data-id='" + selectedMenu.id + "']").addClass("active");

        }
        else {
            var selectedMenuItem = localStorageService.get("selectedMenuItem");
            if (selectedMenuItem) {
                $rootScope.parentItems = [];
                findAllParent(selectedMenuItem.id);
                $rootScope.parentItems = _.uniq($rootScope.parentItems).reverse();

                $(".page-sidebar-menu li.active").removeClass("active");
                $(".page-sidebar-menu li[data-id='" + selectedMenuItem.id + "']").addClass("active");
                _.each($rootScope.parentItems, function (item) {
                    //$(".page-sidebar-menu li[data-id='" + item.id + "']").find(".nav-link").eq(0).click();
                    $(".page-sidebar-menu li[data-id='" + item.id + "']").addClass("active");
                    $(".page-sidebar-menu li[data-id='" + item.id + "']").addClass("open");
                    $(".page-sidebar-menu li[data-id='" + item.id + "']").find(".nav-link").find(".arrow").addClass("open");
                })

            }
            else {
                $rootScope.parentItems = [];
                $(".nav-item").removeClass("active");
                $(".nav-item.start").addClass("active");
            }
        }

        if (toState.name == "home") {
            if (toState.name != fromState.name) {
                $state.reload()
            }
        }
        else if (toState.name == "login") {
            if (authService.authentication.isAuth) {
                $state.go("home")
            }
        }
    })
    function findAllParent(id) {
        for (var d in $rootScope.menuItems) {
            if ($rootScope.menuItems[d].id == id) {
                $rootScope.parentItems.push($rootScope.menuItems[d])
                if ($rootScope.menuItems[d].parentId) {
                    findAllParent($rootScope.menuItems[d].parentId)
                }
            }
        }
    }
    $('ul.dropdown-menu.mega-dropdown-menu').on('click', function (event) {
        // The event won't be propagated up to the document NODE and 
        // therefore delegated events won't be fired
        event.stopPropagation();
    });
    $('body').on('click', '.portlet > .portlet-title > .actions > .collapse1, .portlet .portlet-title > .actions > .expand', function (e) {
        e.preventDefault();
        var el = $(this).closest(".portlet").children(".portlet-body");
        if ($(this).hasClass("collapse1")) {
            $(this).removeClass("collapse1").addClass("expand");
            $(this).find(".fa").removeClass("fa-angle-down").addClass("fa-angle-up")
            el.slideUp(200);
        } else {
            $(this).removeClass("expand").addClass("collapse1");
            $(this).find(".fa").removeClass("fa-angle-up").addClass("fa-angle-down")
            el.slideDown(200);
        }
    });
    App.init();


    function isHavePermitions(resourseName, toParams) {
        var res = false;
        var permitions = authService.authentication.user.permitions;
        if (authService.authentication.user.isSuperAdmin) {
            return true;
        }

        var hasOrganizationPermission = false;
        if (toParams.organizationId) {
            if (authService.authentication.user.organizationId == toParams.organizationId) {
                hasOrganizationPermission = true;
            }
            else if (authService.authentication.user.subOrganizationIds.indexOf(parseInt(toParams.organizationId)) > -1) {
                hasOrganizationPermission = true;
            }
        }
        else {
            hasOrganizationPermission = true;
        }
        var hasUserDataPermission = true;
        if (toParams.userId) {
            if (toParams.userId == authService.authService.userId) {
                hasUserDataPermission = true;
            }
            else if (authService.authentication.user.accessibleUserIds.indexOf(toParams.userId)) {
                hasUserDataPermission = true;
            }
            else {
                hasUserDataPermission = false;
            }
        }

        if (hasOrganizationPermission && hasUserDataPermission) {
            if (resourseName) {
                angular.forEach(permitions, function (orgPermitions, index) {
                    angular.forEach(orgPermitions.RolePermissionsOwnResources, function (item, index) {
                        if (_.trim(item.ResourseName).toLowerCase() == resourseName.toLowerCase()) {
                            if (item.IsRead) {
                                res = true;
                            }
                        }
                    });
                });
            }
            else {
                res = true;
            }
        }

        return res;
    };

    //$("body").on("click", ".sidebar-toggler", function (e) {
    //    var a = $("body")
    //      , t = $(".page-sidebar")
    //      , i = $(".page-sidebar-menu");
    //    $(".sidebar-search", t).removeClass("open"),
    //    a.hasClass("page-sidebar-closed") ? (a.removeClass("page-sidebar-closed"),
    //    i.removeClass("page-sidebar-menu-closed")) : (a.addClass("page-sidebar-closed"),
    //    i.addClass("page-sidebar-menu-closed"),
    //    a.hasClass("page-sidebar-fixed") && i.trigger("mouseleave")),
    //    $(window).trigger("resize")
    //});

    //$(".page-sidebar-menu").on("click", "li > a.nav-toggle, li > a > span.nav-toggle", function (e) {
    //    var a = $(this).closest(".nav-item").children(".nav-link");
    //    if (!(App.getViewPort().width >= t && !$(".page-sidebar-menu").attr("data-initialized") && $("body").hasClass("page-sidebar-closed") && 1 === a.parent("li").parent(".page-sidebar-menu").size())) {
    //        var i = a.next().hasClass("sub-menu");
    //        if (!(App.getViewPort().width >= t && 1 === a.parents(".page-sidebar-menu-hover-submenu").size())) {
    //            if (i === !1)
    //                return void (App.getViewPort().width < t && $(".page-sidebar").hasClass("in") && $(".page-header .responsive-toggler").click());
    //            var s = a.parent().parent()
    //              , n = a
    //              , r = $(".page-sidebar-menu")
    //              , l = a.next()
    //              , d = r.data("auto-scroll")
    //              , p = parseInt(r.data("slide-speed"))
    //              , c = r.data("keep-expanded");
    //            c || (s.children("li.open").children("a").children(".arrow").removeClass("open"),
    //            s.children("li.open").children(".sub-menu:not(.always-open)").slideUp(p),
    //            s.children("li.open").removeClass("open"));
    //            var h = -200;
    //            l.is(":visible") ? ($(".arrow", n).removeClass("open"),
    //            n.parent().removeClass("open"),
    //            l.slideUp(p, function () {
    //                d === !0 && $("body").hasClass("page-sidebar-closed") === !1 && ($("body").hasClass("page-sidebar-fixed") ? r.slimScroll({
    //                    scrollTo: n.position().top
    //                }) : App.scrollTo(n, h)),
    //                o()
    //            })) : i && ($(".arrow", n).addClass("open"),
    //            n.parent().addClass("open"),
    //            l.slideDown(p, function () {
    //                d === !0 && $("body").hasClass("page-sidebar-closed") === !1 && ($("body").hasClass("page-sidebar-fixed") ? r.slimScroll({
    //                    scrollTo: n.position().top
    //                }) : App.scrollTo(n, h)),
    //                o()
    //            })),
    //            e.preventDefault()
    //        }
    //    }
    //})



}]);