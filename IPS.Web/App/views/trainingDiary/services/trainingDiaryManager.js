(function () {
    'use strict';

    angular
        .module('ips.trainingdiary', ['ui.router', 'kendo.directives', 'growing-panes'])
        .factory('trainingdiaryManager', trainingdiaryManager);

    trainingdiaryManager.$inject = ['$q', 'apiService'];

    function trainingdiaryManager($q, apiService) {
        var self = {
            getTaskListByUserId: function (query) {
                return $q.when(getTaskListByUserId(query));
            },
            getTaskCategoriesById: function (id) {
                return $q.when(getTaskCategoriesById(id));
            },
            getTaskStatusesById: function (id) {
                return $q.when(getTaskStatusesById(id));
            },

            getTaskPrioritiesById: function (id) {
                return $q.when(getTaskPrioritiesById(id));
            },

            getNotificationTemplates: function () {
                return $q.when(getNotificationTemplates());
            },
            saveTraningFeedback: function (training) {
                return $q.when(saveTraningFeedback(training));
            },
            updateTraningFeedback: function (trainingFeedback) {
                return $q.when(updateTraningFeedback(trainingFeedback));
            },
            getNotificationTemplateById: function (id) {
                return $q.when(getNotificationTemplateById(id));
            },


            getTaskById: function (id) {
                return $q.when(getTaskById(id));
            },
            getTaskListById: function (id, query) {
                return $q.when(getTaskListById(id, query));
            },
            getTrainigActiveProfiles: function (id) {
                return $q.when(getTrainigActiveProfiles(id));
            },
            getUserProfileStageTrainings: function (userId, profileId) {
                return $q.when(GetUserProfileStageTrainings(userId, profileId))
            },
            getUserOwnTraining: function (id, statusId) {
                return $q.when(getUserOwnTraining(id, statusId));
            },
            getOwnTrainingCounts: function (id) {
                return $q.when(getOwnTrainingCounts(id));
            },
            getOrganizationParticipants: function (organizationId) {
                return $q.when(getOrganizationParticipants(organizationId));
            },
            recurrenceTaskCompleted: function (recurrenceTask) {
                return $q.when(recurrenceTaskCompleted(recurrenceTask));
            },
            getTrainingFeedbacks: function (trainingId) {
                return $q.when(GetTrainingFeedbacks(trainingId));
            },
            getTrainingFeedbackById: function (trainingFeedbackId) {
                return $q.when(getTrainingFeedbackById(trainingFeedbackId));
            },
            getRecurrenceTaskActivity: function (taskId) {
                return $q.when(GetRecurrenceTaskActivity(taskId));
            },
            getTaskDetailById: function (taskid) {
                return $q.when(GetTaskDetailById(taskid));

            },
            saveNewTrainingMaterial: function (trainingMaterial) {
                return $q.when(saveNewTrainingMaterial(trainingMaterial));
            },
            saveTraningNote: function (trainingNote) {
                return $q.when(saveTraningNote(trainingNote));
            },


            getUserPersonalTrainingsForToday: function (userId) {
                return $q.when(getUserPersonalTrainingsForToday(userId));
            },
            getUserProfileTrainingsForToday: function (userId) {
                return $q.when(getUserProfileTrainingsForToday(userId));
            },
            getTrainingDetailById: function (id) {
                return $q.when(getTrainingDetailById(id));
            },
        };

        return self;

        function getNotificationTemplates(query) {
            var deferred = $q.defer();
            var apiName = 'NotificationTemplates/GetDDL';
            (query) ? '' : query = '';
            apiService.getAll(apiName, query).then(function (data) {
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }
        function saveTraningFeedback(training) {
            var deferred = $q.defer();
            var apiName = 'trainings/TrainingFeedback';
            apiService.add(apiName, training).then(function (data) {
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }



        function updateTraningFeedback(trainingFeedback) {
            var deferred = $q.defer();
            var apiName = 'trainingdiary/UpdateTrainingFeedback';
            apiService.add(apiName, trainingFeedback).then(function (data) {
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }

        function getNotificationTemplateById(id) {
            var deferred = $q.defer();
            var apiName = 'NotificationTemplates/GetNotificationTemplateById';
            var query = '';
            apiService.getById(apiName, id, query).then(function (data) {
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }
        function getTaskListByUserId(query) {
            var deferred = $q.defer();
            var apiName = 'tasks/listItem/user';
            (!query) ? query = '' : '';
            apiService.getAll(apiName, query).then(function (data) {
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }

        function getTaskCategoriesById(id) {
            var deferred = $q.defer();
            var apiName = 'TaskCategories/itemsbycategorieslistid';
            var query = '';
            apiService.getById(apiName, id, query).then(function (data) {
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }

        function getTaskPrioritiesById(id) {
            var deferred = $q.defer();
            var apiName = 'TaskPriorities/itemsbyprioritylistid';
            var query = '';
            apiService.getById(apiName, id, query).then(function (data) {
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }

        function getTaskStatusesById(id) {
            var deferred = $q.defer();
            var apiName = 'TaskStatuses/itemsbystatuslistid';
            var query = '';
            apiService.getById(apiName, id, query).then(function (data) {
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }
        function getTaskById(id) {
            var deferred = $q.defer();
            var apiName = 'tasks';
            var query = '';
            apiService.getById(apiName, id, query).then(function (data) {
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }
        function getTaskListById(id, query) {
            var deferred = $q.defer();
            var apiName = 'tasks/list';
            (!query) ? query = '' : '';
            apiService.getById(apiName, id, query).then(function (data) {
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }


        function getTrainigActiveProfiles(id) {
            var deferred = $q.defer();
            var apiName = 'trainingdiary/GetActiveProfilesByUserKey';
            apiService.getById(apiName, id, "").then(function (data) {
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }

        function GetUserProfileStageTrainings(userId, profileId) {
            var deferred = $q.defer();
            var apiName = 'trainingdiary/GetUserProfileStageTrainings/' + userId + "/" + profileId;
            apiService.getAll(apiName, "").then(function (data) {
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }

        function getUserOwnTraining(id, statusId) {
            var deferred = $q.defer();
            var apiName = 'trainingdiary/GetOwnTraining/' + id + '/' + statusId;
            apiService.getAll(apiName, "").then(function (data) {
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }

        function getOwnTrainingCounts(id) {
            var deferred = $q.defer();
            var apiName = 'trainingdiary/GetOwnTrainingCounts';
            apiService.getById(apiName, id, "").then(function (data) {
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }

        function getOrganizationParticipants(organizationId) {
            var deferred = $q.defer();
            var apiName = 'trainingdiary/GetOrganizationParticipants';
            apiService.getById(apiName, organizationId, "").then(function (data) {
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }

        function recurrenceTaskCompleted(recurrenceTask) {
            var deferred = $q.defer();

            var apiName = "trainingdiary/RecurrenceTaskCompleted";
            apiService.add(apiName, recurrenceTask).then(function (data) {
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }

        function saveNewTrainingMaterial(trainingMaterial) {
            var deferred = $q.defer();

            var apiName = "trainingdiary/saveNewTrainingMaterial";
            apiService.add(apiName, trainingMaterial).then(function (data) {
                deferred.resolve(data);
            }, function (data) {
                deferred.reject(data);
            });
            return deferred.promise;
        }

        function GetUserProfileStageTrainings(userId, profileId) {
            var deferred = $q.defer();
            var apiName = 'trainingdiary/GetUserProfileStageTrainings/' + userId + "/" + profileId;
            apiService.getAll(apiName, "").then(function (data) {
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }

        function GetTrainingFeedbacks(trainingId) {
            var deferred = $q.defer();
            var apiName = 'trainings/GetTrainingFeedbacks';
            apiService.getById(apiName, trainingId, "").then(function (data) {
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }

        function getTrainingFeedbackById(trainingFeedbackId) {
            var deferred = $q.defer();
            var apiName = 'trainings/TrainingFeedback';
            apiService.getById(apiName, trainingFeedbackId, "").then(function (data) {
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }

        function GetRecurrenceTaskActivity(taskId) {
            var deferred = $q.defer();
            var apiName = 'tasks/GetRecurrenceTaskActivity';
            apiService.getById(apiName, taskId, "").then(function (data) {
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }

        function GetTaskDetailById(id, query) {
            var deferred = $q.defer();
            var apiName = 'tasks/GetTaskDetailById';
            (!query) ? query = '' : '';
            apiService.getById(apiName, id, query).then(function (data) {
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }


        function saveTraningNote(trainingNote) {
            var deferred = $q.defer();
            var apiName = 'trainings/SaveTrainingNote';
            apiService.add(apiName, trainingNote).then(function (data) {
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }

        function getUserPersonalTrainingsForToday(userId) {
            var deferred = $q.defer();
            var apiName = 'trainingdiary/GetUserPersonalTrainingsForToday';
            apiService.getById(apiName, userId, null).then(function (data) {
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }
        function getUserProfileTrainingsForToday(userId) {
            var deferred = $q.defer();
            var apiName = 'trainingdiary/GetUserProfileTrainingsForToday';
            apiService.getById(apiName, userId, null).then(function (data) {
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }
        function getTrainingDetailById(id) {
            if (id > 0) {
                return apiService.getById("trainings/GetTrainingDetailById", id, "").then(function (data) {
                    data.viewName = data.name;
                    (data.startDate) ? data.startDate = moment(kendo.parseDate(data.startDate)).format('L LT') : '';
                    (data.endDate) ? data.endDate = moment(kendo.parseDate(data.endDate)).format('L LT') : '';
                    (data.frequency) ? '' : data.frequency = "";
                    return data;
                });
            }
            else {
                return {
                    id: 0,
                    name: "",
                    viewName: "New Training",
                    why: "",
                    how: "",
                    what: "",
                    additionalInfo: "",
                    organizationId: null,
                    skillId: null,
                    typeId: null,
                    levelId: null,
                    isTemplate: true,
                    isActive: true,
                    skills: [],
                    trainingMaterials: [],
                    isNotificationByEmail: true,
                    emailNotificationIntervalId: null,
                    isNotificationBySMS: false,
                    smsNotificationIntervalId: null
                };
            }

        }
    }

})();