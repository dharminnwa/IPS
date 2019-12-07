(function () {
    'use strict';

    angular
        .module('ips.todos', ['ui.router', 'kendo.directives', 'growing-panes'])
        .factory('todosManager', todosManager);

    todosManager.$inject = ['$q', 'apiService'];

    function todosManager($q, apiService) {
        var self = {

            getTaskListByUserId: function (query) {
                return $q.when(getTaskListByUserId(query));
            },

            getTaskListById: function (id, query) {
                return $q.when(getTaskListById(id, query));
            },

            getTasksByUserId: function (query) {
                return $q.when(getTasksByUserId(query));
            },

            getAllCategories: function () {
                return $q.when(getAllCategories());
            },

            getAllPriorities: function () {
                return $q.when(getAllPriorities());
            },

            getAllStatuses: function () {
                return $q.when(getAllStatuses());
            },

            getTaskCategoriesById: function (id) {
                return $q.when(getTaskCategoriesById(id));
            },

            getTaskPrioritiesById: function (id) {
                return $q.when(getTaskPrioritiesById(id));
            },

            getTaskStatusesById: function (id) {
                return $q.when(getTaskStatusesById(id));
            },

            getTaskById: function (id) {
                return $q.when(getTaskById(id));
            },
            getTodosById: function () {
                return $q.when(getTodosById());
            },
            getUsers: function () {
                return $q.when(getUsers());
            },

            createTask: function (task) {
                return $q.when(createTask(task));
            },

            updateTask: function (task) {
                return $q.when(updateTask(task));
            },

            removeTask: function (id) {
                return $q.when(removeTask(id));
            },

            isCompleted: function (taskId, isCompleted) {
                return $q.when(isTaskCompleted(taskId, isCompleted));
            },

            getTrainings: function (query) {
                return $q.when(getTrainings(query));
            },
            getProfiles: function (organizationId, query, profileStatus) {
                return $q.when(getProfiles(organizationId, query, profileStatus));
            },

            getProfileStages: function (profileId, participantId, isShowParticipantsSameStages) {
                if (!isShowParticipantsSameStages) {
                    return apiService.getAll("performance/profileevaluationstages/" + profileId + "/" + participantId);
                }
                else {
                    var participantsStr = getParamsString(participantId);
                    return apiService.getAll("performance/profileevaluationparticipantssamestages/" + profileId + "/" + participantsStr);
                }
            },
            getKPITraining: function (stageId, evaluateeId) {
                return $q.when(getKPITraining(stageId, evaluateeId));
            },
            getKPITrainingById: function (id) {
                return $q.when(getKPITrainingById(id));
            },

            getNotificationTemplates: function () {
                return $q.when(getNotificationTemplates('?$orderby=Name'));
            },
            getNotificationTemplateById: function (id) {
                return $q.when(getNotificationTemplateById(id));
            },
            saveTraningFeedback: function (training) {
                return $q.when(saveTraningFeedback(training));
            },
            getTrainingById: function (trainingId) {
                return $q.when(getTrainingById(trainingId));
            },
            getProjects: function () {
                return $q.when(getProjects());
            },
            getProjectMembers: function (projectId) {
                return $q.when(getProjectMembers(projectId));
            },
            getTaskProspectingProjectMembers: function (projectId) {
                return $q.when(getTaskProspectingProjectMembers(projectId));
            },
            getServiceProspectingProjectMembers: function (projectId) {
                return $q.when(getServiceProspectingProjectMembers(projectId));
            },
            cloneTask: function (taskId) {
                return $q.when(cloneTask(taskId));
            },
            getTaskScaleRatingByUserId: function (userId) {
                return $q.when(getTaskScaleRatingByUserId(userId));
            }
        };

        return self;

        function getTaskListByUserId(query) {
            var deferred = $q.defer();
            var apiName = 'tasks/list/user';
            (!query) ? query = '' : '';
            apiService.getAll(apiName, query).then(function (data) {
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

        function getTasksByUserId(query) {
            var deferred = $q.defer();
            var apiName = 'tasks/user?$expand=TaskCategoryListItem,TaskPriorityListItem,TaskStatusListItem,TrainingFeedbacks';
            (!query) ? query = '' : query = "&" + query;
            apiService.getAll(apiName, query).then(function (data) {
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

        function getTaskCategoriesById(id) {
            var deferred = $q.defer();
            var apiName = 'taskCategories';
            var query = '$expand=TaskCategoryListItems($orderby=Name)';
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
            var apiName = 'TaskPriorities';
            var query = '$expand=TaskPriorityListItems($orderby=Name)';
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
            var apiName = 'taskstatuses';
            var query = '$expand=TaskStatusListItems($orderby=Name)';
            apiService.getById(apiName, id, query).then(function (data) {
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }

        function getUsers(query) {
            var deferred = $q.defer();
            var apiName = '/User/CoWorkers?$orderby=FirstName,LastName';
            (!query) ? query = '' : '';
            apiService.getAll(apiName, query).then(function (data) {
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }

        function createTask(task) {
            var deferred = $q.defer();
            var apiName = 'tasks';
            apiService.add(apiName, task).then(function (data) {
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }

        function updateTask(task) {
            var deferred = $q.defer();
            var apiName = 'tasks';
            apiService.update(apiName, task).then(function (data) {
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }

        function removeTask(id) {
            var deferred = $q.defer();
            var apiName = 'tasks';
            apiService.remove(apiName, id).then(function (data) {
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }

        function isTaskCompleted(taskId, isCompleted) {
            var deferred = $q.defer();
            var apiName = "tasks/" + taskId + "/IsCompleted/" + isCompleted;
            apiService.update(apiName).then(function (data) {
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }

        function getAllCategories(query) {
            var deferred = $q.defer();
            var apiName = 'TaskCategories/items';
            (!query) ? query = '' : '';
            apiService.getAll(apiName).then(function (data) {
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }

        function getAllPriorities(query) {
            var deferred = $q.defer();
            var apiName = 'TaskPriorities/items';
            (!query) ? query = '' : '';
            apiService.getAll(apiName).then(function (data) {
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }

        function getAllStatuses(query) {
            var deferred = $q.defer();
            var apiName = 'taskstatuses/items';
            (!query) ? query = '' : '';
            apiService.getAll(apiName).then(function (data) {
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }

        function getTrainings(query) {
            var deferred = $q.defer();
            var apiName = 'tasks/trainings';
            (!query) ? query = '' : '';
            apiService.getAll(apiName, query).then(function (data) {
                deferred.resolve(data);
            }, function (data) {
                deferred.reject(data);
            });
            return deferred.promise;
        }

        function getTrainingById(trainingId) {
            var deferred = $q.defer();
            var apiName = 'tasks/getTrainingById/' + trainingId;
            apiService.getAll(apiName, null).then(function (data) {
                deferred.resolve(data);
            }, function (data) {
                deferred.reject(data);
            });
            return deferred.promise;
        }


        function getProfiles(organizationId, query, profileStatus) {

            (query) ? '' : query = '';

            if (profileStatus.toString() == "") {
                profileStatus = null;
            }

            return apiService.getAll("performance/GetEvaluatedProfiles/" + organizationId + "/" + profileStatus);
        }

        function getProfileStages(profileId, participantId, isShowParticipantsSameStages) {
            if (!isShowParticipantsSameStages) {
                return apiService.getAll("performance/profileevaluationstages/" + profileId + "/" + participantId);
            }
            else {
                var participantsStr = getParamsString(participantId);
                return apiService.getAll("performance/profileevaluationparticipantssamestages/" + profileId + "/" + participantsStr);
            }
        }

        function getNotificationTemplates(query) {
            var deferred = $q.defer();
            var apiName = 'NotificationTemplates';
            (query) ? '' : query = '';
            apiService.getAll(apiName, query).then(function (data) {
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }
        function getNotificationTemplateById(id) {
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

        function getKPITraining(profileid, stageId) {
            var deferred = $q.defer();
            var apiName = 'performance/GetProfileKPITrainings/' + profileid + "/" + stageId;
            apiService.getById(apiName, '').then(function (data) {
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }

        function getKPITrainingById(id) {

            var deferred = $q.defer();

            apiService.getById("trainings", id, "$expand=TrainingMaterials,Skills,TrainingFeedbacks").then(function (data) {
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
            //(query) ? '' : query = '';
            apiService.add(apiName, training).then(function (data) {
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }

        function getProjects() {
            var deferred = $q.defer();
            var apiName = 'projects/GetUserProjects';
            apiService.getAll(apiName, "").then(function (data) {
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }

        function getProjectMembers(projectId) {
            var deferred = $q.defer();
            var apiName = 'project/getProjectMembers/' + projectId;
            apiService.getAll(apiName, null).then(function (data) {
                deferred.resolve(data);
            }, function (data) {
                deferred.reject(data);
            });
            return deferred.promise;
        }
        function getTaskProspectingProjectMembers(projectId) {
            var deferred = $q.defer();
            var apiName = 'project/getTaskProspectingProjectMembers/' + projectId;
            apiService.getAll(apiName, null).then(function (data) {
                deferred.resolve(data);
            }, function (data) {
                deferred.reject(data);
            });
            return deferred.promise;
        }
        function getServiceProspectingProjectMembers(projectId) {
            var deferred = $q.defer();
            var apiName = 'project/getServiceProspectingProjectMembers/' + projectId;
            apiService.getAll(apiName, null).then(function (data) {
                deferred.resolve(data);
            }, function (data) {
                deferred.reject(data);
            });
            return deferred.promise;
        }

        function cloneTask(taskId) {
            var deferred = $q.defer();
            var apiName = 'tasks/CloneTask/' + taskId;

            apiService.getAll(apiName, "").then(function (data) {
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }

        function getTodosById(query) {
            var deferred = $q.defer();
            var apiName = 'tasks/user?$expand=TaskCategoryListItem,TaskPriorityListItem,TaskStatusListItem';
            (!query) ? query = '' : '';
            apiService.getAll(apiName, query).then(function (data) {
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }

        function getTaskScaleRatingByUserId(userId) {
            var deferred = $q.defer();
            apiService.getAll("TaskScaleRatings/" + userId + "?$expand=TaskScaleRanges").then(function (data) {
                deferred.resolve(data.taskScaleRanges);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        };
    }

})();