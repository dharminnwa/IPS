(function () {
    'use strict';

    angular
        .module('ips.profiles')

        .factory('profileTrainingManager', profileTrainingManager);

    profileTrainingManager.$inject = ['$q', 'apiService', '$state'];

    function profileTrainingManager($q, apiService, $state) {

        var self = {
            addNewTraining: function (training) {
                return $q.when(addNewTraining(training));
            },
            SetPerformanceGroupTraining: function (performanceGroupId, trainings) {
                return $q.when(SetPerformanceGroupTraining(performanceGroupId, trainings));
            },
            updateTraining: function (training) {
                return $q.when(updateTraining(training));
            },
            getTrainingTypes: function () {
                return $q.when(getTrainingTypes());
            },
            getTrainingLevels: function () {
                return $q.when(getTrainingLevels());
            },
            getDurationMetrics: function () {
                return $q.when(getDurationMetrics());
            },
            getExerciseMetrics: function () {
                return $q.when(getExerciseMetrics());
            },
            getSkillsByFilterOptions: function (ipsSkillFiter) {
                return $q.when(getSkillsByFilterOptions(ipsSkillFiter));
            },
            checkTrainingInUse: function (trainingId) {
                return $q.when(checkTrainingInUse(trainingId));
            },
            removeTraining: function (trainingId) {
                return $q.when(removeTraining(trainingId));
            },
            getTrainingTemplatesBySkill: function (skillId) {
                return $q.when(getTrainingTemplatesBySkill(skillId));
            },
            getProfiles: function (id,projectId,profileId, query) {
                return $q.when(getProfiles(id, projectId, profileId, query));
            },
            addNewReason: function (trainingDescription) {
                return $q.when(addNewReason(trainingDescription));
            },
            getReasonDescriptions: function (skillId) {
                return $q.when(getReasonDescriptions(skillId));
            },
        };

        return self;


        function getProfiles(id, projectId, profileId, query) {
            var deferred = $q.defer();
            //var apiName = 'performance/userprofiles/' + id + '/' + projectId + '/' + profileId;
            (query) ? '' : query = '';
            var apiName = 'performance';
            query = '?$expand=EvaluationRole';
            apiService.getById(apiName,id, query).then(function (data) {
            //apiService.getAll(apiName, query).then(function (data) {
                deferred.resolve(data);
            },
            function (data) {
                deferred.reject(data);
            });
            return deferred.promise;
        }

        function addNewTraining(training) {
            var deferred = $q.defer();
            var apiName = 'trainings';
            apiService.add(apiName, training).then(function (data) {
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }

        function addNewReason(trainingDescription) {
            var deferred = $q.defer();
            var apiName = 'trainingDescriptions';
            apiService.add(apiName, trainingDescription).then(function (data) {
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }
        function updateTraining(training) {
            var deferred = $q.defer();
            var apiName = "trainings";
            apiService.update(apiName, training).then(function (data) {
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }
        function checkTrainingInUse(trainingId) {
            var deferred = $q.defer();
            apiService.getById("trainings/checkperformancegrouptraininginuse", trainingId).then(
                   function () {
                       deferred.resolve(true);
                   }, function (message) {
                       deferred.reject(message);
                   })
            return deferred.promise;
        }

        function removeTraining(trainingId) {
            var deferred = $q.defer();
            apiService.remove("trainings/deleteperformancegrouptraining", trainingId).then(
                   function (data) {
                       deferred.resolve(data);
                   }, function (message) {
                       deferred.reject(message);
                   })
            return deferred.promise;
        }

        function SetPerformanceGroupTraining(performanceGroupId, trainings) {
            var deferred = $q.defer();
            var apiName = "Performance_groups/" + performanceGroupId + "/trainings";
            apiService.add(apiName, trainings).then(function (data) {
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }

        function getTrainingTypes() {
            return apiService.getAll("TrainingTypes/GetDDL").then(function (data) {
                data.unshift({ name: "Select Type...", id: null, text: "", value: null });
                return data;
            });
        }
        function getTrainingLevels() {
            return apiService.getAll("TrainingLevel/GetDDL").then(function (data) {
                data.unshift({ name: "Select Level...", id: null, text: "", value: null });
                return data;
            });
        }


        function getDurationMetrics() {
            return apiService.getAll("DurationMetric/GetDDL").then(function (data) {
                return data;
            });
        }
        function getExerciseMetrics() {
            return apiService.getAll("ExerciseMetric/GetDDL").then(function (data) {
                return data;
            });
        }

        function getSkillsByFilterOptions(ipsFilterOptions) {
            return apiService.add("skills/GetFilteredSkill", ipsFilterOptions).then(function (data) {
                return data;
            });
        }


        function getTrainingTemplatesBySkill(skillId) {
            return apiService.getById("trainings/getTrainingTemplatesBySkill", skillId).then(function (data) {
                return data;
            });
        }
        function getReasonDescriptions(skillId) {
            return apiService.getById("trainingdescriptions/getTrainingDescriptionsBySkillId/", skillId).then(function (data) {
                return data;
            });
        }

    }

})();