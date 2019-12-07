(function () {
    'use strict';

    angular
        .module('ips')
        .controller('NotificationModalCtrl', NotificationModalCtrl);

    NotificationModalCtrl.$inject = ['$scope', '$modalInstance', 'cssInjector', 'notificationManager', '$state', 'previousItem', '$translate'];

    function NotificationModalCtrl($scope, $modalInstance, cssInjector, notificationManager, $state, previousItem, $translate) {
        cssInjector.add('views/notificationTemplates/notificationTemplates.css');
        var vm = this;
        vm.confirm = confirm;
        vm.cancel = cancel;
        vm.notifications = new kendo.data.ObservableArray([]);
        vm.selectedNotification;
        vm.evaluationRoles;
        vm.cultures;
        vm.filter;
        vm.searchText = "";
        vm.doFilter = doFilter;
        vm.doSearch = doSearch;
        vm.previousItem = previousItem;
        vm.stages;
        vm.selectableStages;

        activate();

        function activate() {
            getStages();
            getControllerData();
        }

        function getStages() {
            vm.stages = notificationManager.getStageTypes();
            vm.selectableStages = angular.copy(vm.stages);
            vm.selectableStages.unshift({ 'value': null, 'text': $translate.instant('NOTIFICATION_SELECT_STAGE_TYPE') });
        }

        function getControllerData() {
            var query = '?$expand=Culture,EvaluationRole';
            vm.filter = {
                evaluationRoleId: null,
                cultureId: null,
                stageTypeId: null,
                email: "3",
                sms: "3"
            }

            notificationManager.getNotifications(query).then(function (data) {
                fromNotificationData(data);
            });

            notificationManager.getEvaluationRoles().then(function (data) {
                vm.evaluationRoles = data;
                vm.evaluationRoles.unshift({ id: null, name: $translate.instant('NOTIFICATION_SELECT_EVALUATION_ROLE') });
            });

            notificationManager.getCultures().then(function (data) {
                vm.cultures = data;
                vm.cultures.unshift({ id: null, cultureName: $translate.instant('NOTIFICATION_SELECT_CULTURE') });
            });
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
                    stageTypeId: notificationData[i].stageTypeId
                };
            }

            if (vm.notifications.length > 0) {
                vm.notifications.splice(0, vm.notifications.length);
            }

            vm.notifications.push.apply(vm.notifications, organization_obj);
        }

        function doFilter() {

            var query = "?$expand=Culture,EvaluationRole";
            var customQuery = '';

            if (vm.filter.evaluationRoleId) {
                customQuery += "(EvaluationRoleId eq " + vm.filter.evaluationRoleId + ")";
            }

            if (vm.filter.cultureId) {
                (customQuery) ? customQuery += "and" : '';
                customQuery += "(CultureId eq " + vm.filter.cultureId + ")";
            }

            if (vm.filter.stageTypeId) {
                (customQuery) ? customQuery += "and" : '';
                customQuery += "(StageTypeId eq " + vm.filter.stageTypeId + ")";
            }

            if (vm.filter.email) {
                (customQuery) ? customQuery += "and" : '';
                customQuery += getEmailAndSMSCustomQuery('EmailBody', vm.filter.email);
            }

            if (vm.filter.sms) {
                (customQuery) ? customQuery += "and" : '';
                customQuery += getEmailAndSMSCustomQuery('SMSMessage', vm.filter.sms);
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

        function doSearch(searchText) {
            vm.notificationGrid.dataSource.filter([
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


        function confirm() {
            var selected = vm.notificationGrid.dataItem(vm.notificationGrid.select());
            $modalInstance.close(selected.id);
        }

        function cancel() {
            $modalInstance.close(vm.previousItem);
        }

        vm.gridOptions = {
            dataSource: {
                type: "json",
                data: vm.notifications,
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
                        }
                    }
                }
            },
            columnMenu: true,
            filterable: true,
            pageable: true,
            sortable: true,
            selectable: true,
            columns: [
                { field: "name", width: "20%", title: $translate.instant('COMMON_NAME') },
                { field: "culture", width: "15%", title: $translate.instant('COMMON_CULTURE') },
                { field: "role", width: "20%", title: $translate.instant('COMMON_ROLE') },
                { field: "stageTypeId", width: "20%", title: $translate.instant('COMMON_STAGE'), values: vm.stages },
                { field: "email", title: $translate.instant('COMMON_EMAIL'), width: "12%", filterable: false, template: '<input type="checkbox" #= email ? checked="checked" : "" # disabled="disabled" />' },
                { field: "sms", title: $translate.instant('COMMON_SMS'), width: "12%", filterable: false, template: '<input type="checkbox" #= sms ? checked="checked" : "" # disabled="disabled" />' },
            ]
        };
    }
})();