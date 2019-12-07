(function () {
    'use strict';

    angular
        .module('ips.notification')
        .config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
            var baseNotificationTemplateResolve = {
                pageName: function ($translate) {
                    return $translate.instant('NOTIFICATION_NOTIFICATION_TEMPLATES');
                },
                notifications: function (notificationManager) {
                    var query = '?$expand=Culture,EvaluationRole';
                    return notificationManager.getNotifications(query).then(function (data) {
                        return data;
                    });
                },
                evaluationRoles: function (notificationManager) {
                    return notificationManager.getEvaluationRoles().then(function (data) {
                        return data;
                    });
                },
                cultures: function (notificationManager) {
                    return notificationManager.getCultures().then(function (data) {
                        return data;
                    });
                },
                stageTypes: function (notificationManager) {
                    return notificationManager.getStageTypes();
                },
                stateTypes: function (notificationManager) {
                    return notificationManager.getStateTypes();
                },
                templateTypes: function (notificationManager) {
                    return notificationManager.getNotificationTemplateTypes();
                },
                organizations: function (notificationManager) {
                    return notificationManager.getOrganizations();
                }
            };
            $stateProvider
            .state('home.notificationTemplates', {
                    url: "/notificationTemplates/:organizationId",
                    templateUrl: "views/notificationTemplates/views/notificationTemplates.html",
                    controller: "notificationTemplatesCtrl",
                    resolve: baseNotificationTemplateResolve,
                    data: {
                        displayName: '{{pageName}}',//'Notification Templates',
                        paneLimit: 1,
                        depth: 2,
                        resource: "Notification Templates"
                    }
                });
        }])
        .controller('notificationTemplatesCtrl', notificationTemplatesCtrl);

    notificationTemplatesCtrl.$inject = ['$scope', '$stateParams', 'cssInjector', 'notificationManager', 'notifications', '$state', 'evaluationRoles', 'cultures', 'stageTypes', 'dialogService', 'templateTypes', 'stateTypes', 'organizations', '$translate', 'authService'];

    function notificationTemplatesCtrl($scope, $stateParams, cssInjector, notificationManager, notifications, $state, evaluationRoles, cultures, stageTypes, dialogService, templateTypes, stateTypes, organizations, $translate, authService) {
        cssInjector.removeAll();
        cssInjector.add('views/notificationTemplates/notificationTemplates.css');
        $scope.authentication = authService.authentication;
        $scope.currentUser = $scope.authentication.user;

        $scope.notifications = new kendo.data.ObservableArray([]);

        $scope.selectedNotification;
        $scope.evaluationRoles = evaluationRoles;
        $scope.cultures = cultures;
        $scope.filter = {
            evaluationRoleId: null,
            cultureId: null,
            stageTypeId: null,
            organizationId: null,
            notificationTemplateTypeId: null,
            isDefualt: false,
            email: "3",
            sms: "3"
        };
        $scope.searchText = "";
        $scope.doFilter = doFilter;
        $scope.stages = stageTypes;
        $scope.stateTypes = stateTypes;
        $scope.stateTypeValues = _.filter(stateTypes, function (item) {
            return item.value != null;
        });
        $scope.organizationsValues = [];
        _.each(organizations, function (item) {
            $scope.organizationsValues.push({ value: item.id, text: item.name });
        })
        if ($scope.currentUser) {
            if ($scope.currentUser.isSuperAdmin) {
                organizations.unshift({ 'id': null, 'name': $translate.instant('COMMON_SELECT_ORGANIZATION') });
            }
        }
        $scope.organizations = organizations;



        $scope.templateTypes = [{ 'value': null, 'text': $translate.instant('NOTIFICATION_SELECT_TEMPLATE_TYPE') }];
        $scope.templateTypeValues = [];
        _.each(templateTypes, function (item) {
            $scope.templateTypes.push({ value: item.id, text: item.name });
            $scope.templateTypeValues.push({ value: item.id, text: item.name })
        });

        $scope.profileTypeValues = [{ 'value': 1, 'text': $translate.instant('COMMON_SOFT_PROFILE') },
        { 'value': 5, 'text': $translate.instant('NOTIFICATION_KNOWLEDGE') }
        ];
        $scope.profileTypes = [{ 'value': null, 'text': $translate.instant('NOTIFICATION_SELECT_PROFILE_TYPE') },
        { 'value': 1, 'text': $translate.instant('COMMON_SOFT_PROFILE') },
        { 'value': 5, 'text': $translate.instant('NOTIFICATION_KNOWLEDGE') }
        ];

        $scope.projectTypeValues = [{ 'value': 1, 'text': $translate.instant('NOTIFICATION_CORPORATE') },
        { 'value': 2, 'text': $translate.instant('NOTIFICATION_PERSONAL') }
        ];
        $scope.projectTypes = [{ 'value': null, 'text': "Select Project Type" },
        { 'value': 1, 'text': $translate.instant('NOTIFICATION_CORPORATE') },
        { 'value': 2, 'text': $translate.instant('NOTIFICATION_PERSONAL') }
        ];
        $scope.selectableStages = angular.copy(stageTypes);

        activate();

        function activate() {
            fromNotificationData(notifications);
            prepareSelectArrays();
        }

        function prepareSelectArrays() {
            $scope.cultures.unshift({ id: null, cultureName: $translate.instant('NOTIFICATION_SELECT_CULTURE') });
            $scope.evaluationRoles.unshift({ id: null, name: $translate.instant('NOTIFICATION_SELECT_EVALUATION_ROLE') });
            $scope.selectableStages.unshift({ 'value': null, 'text': $translate.instant('NOTIFICATION_SELECT_STAGE_TYPE') });
        }

        function remove(id) {
            if ($scope.selectedNotification) {
                notificationManager.removeNotification($scope.selectedNotification).then(
                    function (data) {
                        $state.go($state.current, {}, { reload: true });
                    },
                    function (data) {
                        dialogService.showNotification($translate.instant('NOTIFICATION_NOTIFICATION_TEMPLATE_IS_IN_USE'), "error");
                    }
                );
            }
        }

        function setSelectedId(id) {
            $scope.selectedNotification = id;
        }

        function goBack() {
            history.back();
        }

        function fromNotificationData(notificationData) {
            var organization_obj = [notificationData.length];
            for (var i = 0, len = notificationData.length; i < len; i++) {
                organization_obj[i] = {
                    id: notificationData[i].id,
                    name: notificationData[i].name,
                    culture: (notificationData[i].culture) ? notificationData[i].culture.cultureName : '',
                    email: (notificationData[i].emailBody) ? true : false,
                    sms: (notificationData[i].smsMessage) ? true : false,
                    role: (notificationData[i].evaluationRole) ? notificationData[i].evaluationRole.name : '',
                    stageTypeId: notificationData[i].stageTypeId,
                    stateTypeId: notificationData[i].stateTypeId,
                    profileTypeId: notificationData[i].profileTypeId,
                    projectTypeId: notificationData[i].projectTypeId,
                    notificationTemplateTypeId: notificationData[i].notificationTemplateTypeId,
                    isDefualt: notificationData[i].isDefualt,
                    organizationId: notificationData[i].organizationId
                };
            }

            if ($scope.notifications.length > 0) {
                $scope.notifications.splice(0, $scope.notifications.length);
            }

            $scope.notifications.push.apply($scope.notifications, organization_obj);
        }

        function doFilter() {

            var query = "?$expand=Culture,EvaluationRole";
            var customQuery = '';

            if ($scope.filter.evaluationRoleId) {
                customQuery += "(EvaluationRoleId eq " + $scope.filter.evaluationRoleId + ")";
            }

            if ($scope.filter.organizationId) {
                (customQuery) ? customQuery += "and" : '';
                customQuery += "(OrganizationId eq " + $scope.filter.organizationId + ")";
            }

            if ($scope.filter.notificationTemplateTypeId) {
                (customQuery) ? customQuery += "and" : '';
                customQuery += "(NotificationTemplateTypeId eq " + $scope.filter.notificationTemplateTypeId + ")";
            }


            if ($scope.filter.cultureId) {
                (customQuery) ? customQuery += "and" : '';
                customQuery += "(CultureId eq " + $scope.filter.cultureId + ")";
            }

            if ($scope.filter.stageTypeId) {
                (customQuery) ? customQuery += "and" : '';
                customQuery += "(StageTypeId eq " + $scope.filter.stageTypeId + ")";
            }

            if ($scope.filter.email) {
                (customQuery) ? customQuery += "and" : '';
                customQuery += getEmailAndSMSCustomQuery('EmailBody', $scope.filter.email);
            }

            if ($scope.filter.sms) {
                (customQuery) ? customQuery += "and" : '';
                customQuery += getEmailAndSMSCustomQuery('SMSMessage', $scope.filter.sms);
            }

            if ($scope.filter.isDefualt) {
                (customQuery) ? customQuery += "and" : '';
                customQuery += "(IsDefualt eq " + $scope.filter.isDefualt + ")";
            }


            if (customQuery) { customQuery = "&$filter=" + customQuery; }
            notificationManager.getNotifications(query + customQuery).then(function (data) {
                fromNotificationData(data);
            });
        }

        function getEmailAndSMSCustomQuery(type, value) {
            switch (value) {
                case "1": return "(" + type + " ne null)";
                case "2": return "(" + type + " eq null)";
                case "3": return "((" + type + " eq null) or (" + type + " ne null))";
                default: return '';

            }
            return query;
        }

        $scope.organizationChange = function () {
            doFilter();
            $scope.departments = [];
            if ($scope.filter.organizationId) {
                notificationManager.getDepartments($scope.filter.organizationId).then(function (data) {
                    $scope.departments = data;
                });
            }
        }
        $scope.doSearch = function (searchText) {
            $scope.gridInstance.dataSource.filter([
                {
                    logic: "or",
                    filters: [
                        {
                            field: "name",
                            operator: "contains",
                            value: searchText
                        },
                        {
                            field: "culture",
                            operator: "contains",
                            value: searchText
                        },
                        {
                            field: "role",
                            operator: "contains",
                            value: searchText
                        }
                    ]
                }]);
        }

        $scope.$on("kendoRendered", function (event) {
            if (event.targetScope.notificationGrid) {
                $scope.gridInstance = event.targetScope.notificationGrid;
            }
        });

        $scope.editNotification = notificationManager.editNotification;
        $scope.cloneNotification = function (id) {
            dialogService.showYesNoDialog($translate.instant('COMMON_CONFIRM'), $translate.instant('NOTIFICATION_ARE_YOU_SURE_YOU_WANT_TO_CLONE_THIS_NOTIFICATION_TEMPLATE')).then(
                function () {
                    notificationManager.cloneNotification(id).then(function (data) {
                        if (data) {
                            dialogService.showNotification($translate.instant('NOTIFICATION_NOTIFICATION_TEMPLATE_CLONED'), "success");
                            doFilter();
                        }
                    }, function () {
                        dialogService.showNotification($translate.instant('NOTIFICATION_NOTIFICATION_TEMPLATE_CLONING_FAILD'), "error");
                    })
                },
                function () {
                });

        }
        $scope.addNotification = notificationManager.addNotification;
        $scope.setSelectedId = setSelectedId;
        $scope.remove = remove;
        $scope.goBack = goBack;

        $scope.gridOptions = {
            dataSource: {
                type: "json",
                data: $scope.notifications,
                sort: {
                    field: "name",
                    dir: "asc"
                },
                pageSize: 10,
                schema: {
                    model: {
                        id: "id",
                        fields: {
                            id: { type: "number" },
                            name: { type: "string" },
                            evaluationRoleId: { type: "string" },
                            stageTypeId: { type: "number" },
                            stateTypeId: { type: "number" },
                            profileTypeId: { type: "number" },
                            notificationTemplateTypeId: { type: "number" },
                            organizationId: { type: "number" },
                        }
                    }
                }
            },
            columnMenu: false,
            filterable: true,
            pageable: true,
            sortable: true,
            columns: [
                { field: "name", width: "150px", title: $translate.instant('COMMON_NAME') },
                { field: "organizationId", width: "150px", title: "Organization", values: $scope.organizationsValues },
                { field: "notificationTemplateTypeId", width: "150px", title: $translate.instant('COMMON_TYPE'), values: $scope.templateTypes },
                { field: "culture", width: "150px", title: $translate.instant('COMMON_CULTURE') },
                { field: "role", width: "150px", title: $translate.instant('COMMON_ROLE') },
                { field: "stageTypeId", width: "150px", title: $translate.instant('COMMON_STAGE'), values: $scope.stages },
                { field: "profileTypeId", width: "150px", title: $translate.instant('COMMON_PROFILE_TYPE'), values: $scope.profileTypeValues },
                { field: "email", title: $translate.instant('COMMON_EMAIL'), width: "110px", filterable: false, template: '<input type="checkbox" #= email ? checked="checked" : "" # disabled="disabled" />' },
                { field: "sms", title: $translate.instant('COMMON_SMS'), width: "100px", filterable: false, template: '<input type="checkbox" #= sms ? checked="checked" : "" # disabled="disabled" />' },
                { field: "isDefualt", title: $translate.instant('COMMON_DEFAULT'), width: "150px", filterable: false, template: '<input type="checkbox" #= isDefualt ? checked="checked" : "" # disabled="disabled" />' },
                {
                    field: "name", title: $translate.instant('COMMON_ACTIONS'), width: "150px", filterable: false, sortable: false, menu: false, template: function (dataItem) {
                        return "<div class='icon-groups'><a class='fa fa-pencil-square-o ips-icon' ng-click='editNotification(" + dataItem.id + "," + dataItem.organizationId + ")'></a></div><div class='icon-groups'><a class='fa fa-trash ips-icon' ng-click='setSelectedId(dataItem.id); removal.open(" + dataItem.id + ").center()' ></a> <a class='fa fa-copy ips-icon' ng-click='cloneNotification(" + dataItem.id + ")'></a></div>";
                    },
                },
            ]
        };

        $scope.tooltipOptions = {
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
        };

        if ($stateParams.organizationId > 0) {
            $scope.filter.organizationId = parseInt($stateParams.organizationId);
            $scope.organizationChange();
        }
    }
})();