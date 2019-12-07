(function () {
    'use strict';

    angular
        .module('ips.notification', ['ui.router'])
        .factory('notificationManager', notificationManager);

    notificationManager.$inject = ['$location', '$q', 'apiService', '$state', '$translate'];

    function notificationManager($location, $q, apiService, $state, $translate) {
        var self = {

            addNotification: addNotification,

            editNotification: editNotification,

            getCultures: function () {
                return $q.when(getCultures());
            },

            getNotifications: function (query) {
                return $q.when(getNotifications(query));
            },

            getNotificationById: function (id) {
                return $q.when(getNotificationById(id));
            },

            saveNotification: function (notification) {
                return $q.when(saveNotification(notification));
            },
            cloneNotification: function (id) {
                return $q.when(cloneNotification(id));
            },
            updateNotification: function (notification) {
                return $q.when(updateNotification(notification))
            },

            removeNotification: function (id) {
                return $q.when(removeNotification(id))
            },

            getEvaluationRoles: function () {
                return $q.when(getEvaluationRoles())
            },

            returnToPerviousPage: returnToPerviousPage,

            getStageTypes: getStageTypes,
            getNotificationTemplateTypes: function () {
                return $q.when(getNotificationTemplateTypes())
            },
            getOrganizations: function () {
                return $q.when(getOrganizations());
            },
            getStateTypes: getStateTypes,
            getDepartments: function (organzationId) {
                return $q.when(getDepartments(organzationId));
            }

        };

        return self;

        function addNotification(organizationId) {
            $location.path("/home/notificationTemplates/" + organizationId + "/new");
        }

        function editNotification(id, organizationId) {
            $location.path("/home/notificationTemplates/" + organizationId + "/edit/" + id);
        }

        function getCultures() {
            var deferred = $q.defer();
            var apiName = 'culture';
            apiService.getAll(apiName).then(function (data) {
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }

        function getNotifications(query) {
            var deferred = $q.defer();
            var apiName = 'NotificationTemplates';
            (!query) ? query = '' : '';
            apiService.getAll(apiName, query).then(function (data) {
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }

        function getEvaluationRoles() {
            var deferred = $q.defer();
            var apiName = 'EvaluationRoles';
            var query = '?$orderby=Name';
            apiService.getAll(apiName, query).then(function (data) {
                angular.forEach(data, function (key, index) {
                    key.text = key.name;
                    key.value = key.id;
                });
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }

        function getNotificationById(id) {
            var deferred = $q.defer();
            var apiName = 'NotificationTemplates';
            var query = '$expand=Culture'
            apiService.getById(apiName, id, query).then(function (data) {
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }

        function saveNotification(notification) {
            var deferred = $q.defer();
            var apiName = 'NotificationTemplates';
            apiService.add(apiName, notification).then(function (data) {
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }

        function cloneNotification(id) {
            var deferred = $q.defer();
            var apiName = 'NotificationTemplates/clone/' + id;
            apiService.add(apiName, null).then(function (data) {
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }

        function updateNotification(notification) {
            var deferred = $q.defer();
            var apiName = 'NotificationTemplates';
            apiService.update(apiName, notification).then(function (data) {
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }

        function removeNotification(id) {
            var deferred = $q.defer();
            var apiName = 'NotificationTemplates';
            apiService.remove(apiName, id).then(function (data) {
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }

        function returnToPerviousPage() {
            $state.go(
                $state.$current.parent.self.name,
                null,
                { reload: true }
            );
        }

        function getStageTypes() {
            return [
                {
                    'value': 1,
                    'text': $translate.instant('NOTIFICATIONTEMPLATES_START_PROFILE')
                },
                {
                    'value': 2,
                    'text': $translate.instant('NOTIFICATIONTEMPLATES_SHORT_GOAL')
                },
                {
                    'value': 3,
                    'text': $translate.instant('NOTIFICATIONTEMPLATES_MID_GOAL')
                },
                {
                    'value': 4,
                    'text': $translate.instant('NOTIFICATIONTEMPLATES_LONG_TERM_GOAL')
                },
                {
                    'value': 5,
                    'text': $translate.instant('NOTIFICATIONTEMPLATES_FINAL_GOAL')
                },
                {
                    'value': 6,
                    'text': $translate.instant('NOTIFICATIONTEMPLATES_MILESTONE')
                },
                {
                    'value': 7,
                    'text': $translate.instant('NOTIFICATIONTEMPLATES_TASK_CREATION')
                },
                {
                    'value': 8,
                    'text': $translate.instant('NOTIFICATIONTEMPLATES_TASK_REMINDER')
                },
                {
                    'value': 9,
                    'text': $translate.instant('NOTIFICATIONTEMPLATES_MEETING_SCHEDULE')
                },
                {
                    'value': 10,
                    'text': $translate.instant('NOTIFICATIONTEMPLATES_FOLLOWUP_SCHEDULE')
                },
                {
                    'value': 11,
                    'text': $translate.instant('NOTIFICATIONTEMPLATES_SALES_AGREED')
                },
            ];
        }

        function getStateTypes() {
            return [
                {
                    'value': 1,
                    'text': $translate.instant('NOTIFICATIONTEMPLATES_GREEN_ALARM')
                },
                {
                    'value': 2,
                    'text': $translate.instant('NOTIFICATIONTEMPLATES_YELLOW_ALARM')
                },
                {
                    'value': 3,
                    'text': $translate.instant('NOTIFICATIONTEMPLATES_RED_ALARM')
                },
                {
                    'value': 4,
                    'text': $translate.instant('COMMON_START')
                },
                {
                    'value': 5,
                    'text': $translate.instant('COMMON_COMPLETED')
                },
                {
                    'value': 6,
                    'text': $translate.instant('NOTIFICATIONTEMPLATES_RESULTS')
                }
            ];
        }

        function getNotificationTemplateTypes(query) {
            var deferred = $q.defer();
            var apiName = 'NotificationTemplates/GetNotificationTemplateTypesDDL';
            (query) ? '' : query = '';
            apiService.getAll(apiName, query).then(function (data) {
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }

        function getOrganizations(query) {
            (query) ? '' : query = '';
            return apiService.getAll("organization?$select=Id,Name" + query);
        }

        function getDepartments(orgId) {
            var deferred = $q.defer();
            apiService.getAll("departments/getDepartmentsByOrgId/" + orgId).then(function (data) {
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        };
    }

})();