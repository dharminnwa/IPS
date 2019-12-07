(function () {
    'use strict';

    angular.module('ips.projects', ['ui.router', 'kendo.directives', 'growing-panes'])
    .factory('projectsManager', projectsManager);

    projectsManager.$inject = ['$q', 'apiService', '$translate'];
    function projectsManager($q, apiService, $translate) {

        var self = {
            getOrganizations: function () {
                return $q.when(getOrganizations());
            },
            GetUsersbyOrganizationId: function (organizationId) {
                return $q.when(GetUsersbyOrganizationId(organizationId));
            },
            getProjectRoles: function () {
                return $q.when(getProjectRoles());
            },
            saveProject: function (project) {
                return $q.when(saveProject(project));
            },
            updateProject: function (project) {
                return $q.when(updateProject(project));
            },
            getProjectById: function (projectId) {
                return $q.when(getProjectById(projectId));
            },
            getAllProject: function () {
                return $q.when(getAllProject());
            },
            getUserProjects: function () {
                return $q.when(getUserProjects());
            },


            getUserInfo: function (userId) {
                return $q.when(getUserInfo(userId));
            },
            getNotificationTemplates: function () {
                return $q.when(getNotificationTemplates());
            },

            getDurationMetrics: function () {
                return $q.when(getDurationMetrics());
            },

            isProjectInUse: function (projectId) {
                return $q.when(isProjectInUse(projectId));
            },
            removeProject: function (projectId) {
                return $q.when(removeProject(projectId));
            },
            hasProjectProfiles: function (projectId) {
                return $q.when(hasProjectProfiles(projectId));
            },
            getProjectStatus: function (projectId) {
                return $q.when(getProjectStatus(projectId));
            },
            getProjectTrainings: function (projectId) {
                return $q.when(getProjectTrainings(projectId));
            },

            sendStageParticipantReminder: function (stageId, participantId) {
                return $q.when(sendStageParticipantReminder(stageId, participantId));
            },
            sendStageEvaluationReminder: function (stageId, participantId) {
                return $q.when(sendStageEvaluationReminder(stageId, participantId));
            },
            GetUserProfileScorecard: function (profileId, userid) {
                return $q.when(GetUserProfileScorecard(profileId, userid));
            },
            loadScorecardData: function (profileId, participantIds, evaluatorIds, stageId, typeOfProfile, stageGroupId) {
                return $q.when(loadScorecardData(profileId, false, participantIds, evaluatorIds, stageId, typeOfProfile, null, stageGroupId));
            },
            loadKTScorecardData: function (profileId, participantIds, stageId, isStartStage, evolutionStageId) {
                return $q.when(loadKTScorecardData(profileId, participantIds, stageId, isStartStage, evolutionStageId));
            },
            getParticipantsBy: function (profileId, stageId, projectIds, departmentIds, teamIds, profileStageGroupId) {
                return $q.when(getParticipantsBy(profileId, stageId, projectIds, departmentIds, teamIds, profileStageGroupId));
            },
            getSalesActivityData: function (profileId) {
                return $q.when(getSalesActivityData(profileId));
            },
            getUserSalesActivityData: function (profileId, userId) {
                return $q.when(getUserSalesActivityData(profileId, userId));
            },
            getProjectTasks: function (projectId) {
                return $q.when(getProjectTasks(projectId));
            },
            getUserTaskSalesActivityData: function (activityResultFilterOptionModel) {
                return $q.when(getUserTaskSalesActivityData(activityResultFilterOptionModel));
            },
            getUserTaskAggregatedSalesActivityData: function (activityResultFilterOptionModel) {
                return $q.when(getUserTaskAggregatedSalesActivityData(activityResultFilterOptionModel));
            },
            getProjectTaskAggregatedActivityData: function (projectId) {
                return $q.when(getProjectTaskAggregatedActivityData(projectId));
            },
            startProject: function (projectId) {
                return $q.when(startProject(projectId));
            }
        }
        return self;
        function getOrganizations() {

            var deferred = $q.defer();
            var apiName = 'organizations/GetDDL';
            apiService.getAll(apiName).then(function (data) {
                data.unshift({ id: null, name: $translate.instant('TASKPROSPECTING_SELECT_ORGANIZATION') });
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }
        function GetUsersbyOrganizationId(organizationId) {

            var deferred = $q.defer();
            var apiName = 'organizations/GetUsersbyOrganizationId';
            apiService.getById(apiName, organizationId).then(function (data) {
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;

        }

        function getProjectRoles() {

            var deferred = $q.defer();
            var apiName = 'projects/GetProjectRoles';
            apiService.getAll(apiName).then(function (data) {
                data.unshift({ id: null, name: $translate.instant('NOTIFICATION_SELECT_ROLE') + "..." });
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }
        function saveProject(project) {
            var deferred = $q.defer();
            var apiName = 'projects/save';
            apiService.add(apiName, project).then(function (data) {
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }


        function getAllProject() {
            var deferred = $q.defer();
            var apiName = 'projects/getProjects';
            apiService.getAll(apiName).then(function (data) {
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }

        function getUserProjects() {
            var deferred = $q.defer();
            var apiName = 'projects/GetUserProjects';
            apiService.getAll(apiName).then(function (data) {
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }
        function getProjectById(projectId) {
            var deferred = $q.defer();
            var apiName = 'projects/getProjectById';
            apiService.getById(apiName, projectId).then(function (data) {
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }

        function updateProject(project) {
            var deferred = $q.defer();
            var apiName = 'projects/update';
            apiService.add(apiName, project).then(function (data) {
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }
        function getUserInfo(userId) {

            var deferred = $q.defer();
            var apiName = 'projects/GetUserInfo';
            apiService.getById(apiName, userId).then(function (data) {
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
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

        function getDurationMetrics() {
            var deferred = $q.defer();
            var apiName = 'DurationMetric/GetDDL';
            apiService.getAll(apiName, null).then(function (data) {
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;


        }

        function isProjectInUse(projectId) {
            var deferred = $q.defer();
            apiService.getById("projects/is_in_use", projectId, "").then(function (data) {
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }

        function removeProject(projectId) {
            var deferred = $q.defer();
            apiService.remove("project", projectId, "").then(function (data) {
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }

        function hasProjectProfiles(projectId) {


            var deferred = $q.defer();
            apiService.getById("Profiles/GetProjectProfiles", projectId).then(function (data) {
                if (data.length > 0) {
                    deferred.resolve(true);
                }
                else {
                    deferred.resolve(false);
                }
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;


        }


        function getProjectStatus(projectId) {


            var deferred = $q.defer();
            apiService.getById("project/GetProjectStatus", projectId).then(function (data) {
                if (data) {
                    deferred.resolve(data);
                }
                else {
                    deferred.resolve(null);
                }
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;


        }

        function getProjectTrainings(projectId) {
            var deferred = $q.defer();
            apiService.getById("trainingdiary/GetProjectTrainings", projectId).then(function (data) {
                if (data) {
                    deferred.resolve(data);
                }
                else {
                    deferred.resolve(null);
                }
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }




        function sendStageParticipantReminder(stageId, participantId) {
            var deferred = $q.defer();
            var apiName = 'project/SendStageParticipantReminder/' + stageId + "/" + participantId;
            apiService.getAll(apiName, "").then(function (data) {
                deferred.resolve(data);
            },
            function (data) {
                deferred.reject(data);
            });
            return deferred.promise;
        }


        function sendStageEvaluationReminder(stageId, evaluatorId) {
            var deferred = $q.defer();
            var apiName = 'project/SendStageEvaluationReminder/' + stageId + "/" + evaluatorId;
            apiService.getAll(apiName, "").then(function (data) {
                deferred.resolve(data);
            },
            function (data) {
                deferred.reject(data);
            });
            return deferred.promise;
        }



        function loadScorecardData(profileId, isBenchmarkNeeded, participantIds, evaluatorIds, stageId, typeOfProfile, statusOn, stageGroupId) {


            var participantsStr = getParamsString(participantIds);
            var evaluatorsStr = evaluatorIds;
            return apiService.getAll("performance/profilescorecard/" + profileId + "/" + isBenchmarkNeeded + "/" + participantsStr + "/" + evaluatorsStr + "/" + stageId + "/" + typeOfProfile + "/" + statusOn + "/" + stageGroupId);
            //return apiService.getAll("performance/profilescorecard/24/false/573;/585;/323/1/null");
        }


        function GetUserProfileScorecard(userId, profileId) {
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

        function loadKTScorecardData(profileId, participantIds, stageId, isStartStage, evolutionStageId) {
            var participantsStr = getParamsString(participantIds);
            return apiService.getAll("performance/ktscorecarddata/" + profileId + "/" + participantsStr + "/"
                + stageId + "/" + isStartStage + "/" + evolutionStageId);
        }

        function getParamsString(idsArray) {
            var idsStr = null;
            if (idsArray && idsArray.length > 0) {
                idsStr = "";
                angular.forEach(idsArray, function (item) {
                    idsStr += item + ";";
                });
            }
            return idsStr;
        }


        function getParticipantsBy(profileId, stageId, projectIds, departmentIds, teamIds, profileStageGroupId) {

            var deferred = $q.defer();
            apiService.getAll("performance/profileparticipantsbystageid/" + profileId + "/" + stageId + "/"
                       + getParamsString(projectIds) + "/" + getParamsString(departmentIds) + "/" + getParamsString(teamIds) + "/" + profileStageGroupId).then(function (data) {
                           if (data) {
                               deferred.resolve(data);
                           }
                           else {
                               deferred.resolve(null);
                           }
                       },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;


        }

        function getSalesActivityData(profileId) {
            var deferred = $q.defer();
            var apiName = 'project/getSalesActivityData/' + profileId;
            apiService.getAll(apiName, "").then(function (data) {
                deferred.resolve(data);
            },
            function (data) {
                deferred.reject(data);
            });
            return deferred.promise;
        }

        function getUserSalesActivityData(profileId, userId) {
            var deferred = $q.defer();
            var apiName = 'project/getUserSalesActivityData/' + profileId + '/' + userId;
            apiService.getAll(apiName, "").then(function (data) {
                deferred.resolve(data);
            },
            function (data) {
                deferred.reject(data);
            });
            return deferred.promise;
        }

        function getProjectTasks(projectId) {
            var deferred = $q.defer();
            apiService.getById("project/GetProjectTask", projectId).then(function (data) {
                if (data) {
                    deferred.resolve(data);
                }
                else {
                    deferred.resolve(null);
                }
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }

        function getUserTaskSalesActivityData(activityResultFilterOptionModel) {
            var deferred = $q.defer();
            var apiName = 'tasks/getUserTaskSalesActivityData';
            apiService.add(apiName, activityResultFilterOptionModel).then(function (data) {
                deferred.resolve(data);
            },
            function (data) {
                deferred.reject(data);
            });
            return deferred.promise;
        }
        function getUserTaskAggregatedSalesActivityData(activityResultFilterOptionModel) {
            var deferred = $q.defer();
            var apiName = 'tasks/getUserTaskAggregatedSalesActivityData';
            apiService.add(apiName, activityResultFilterOptionModel).then(function (data) {
                deferred.resolve(data);
            },
            function (data) {
                deferred.reject(data);
            });
            return deferred.promise;
        }
        function getProjectTaskAggregatedActivityData(projectId) {
            var deferred = $q.defer();
            var apiName = 'project/GetProjectAggregatedData';
            apiService.getById(apiName, projectId,null).then(function (data) {
                deferred.resolve(data);
            },
            function (data) {
                deferred.reject(data);
            });
            return deferred.promise;
        }

        function startProject(projectId) {
            var deferred = $q.defer();
            var apiName = 'project/Start';
            apiService.getById(apiName, projectId, null).then(function (data) {
                deferred.resolve(data);
            },
            function (data) {
                deferred.reject(data);
            });
            return deferred.promise;
        }
        
    }

})();