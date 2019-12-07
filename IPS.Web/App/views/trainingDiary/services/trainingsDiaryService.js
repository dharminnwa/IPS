angular.module('ips.trainingdiary')
    .service('trainingsDiaryService', ['apiService', '$translate', function (apiService, $translate) {
        var trainings = new kendo.data.ObservableArray([]);
        this.getSkills = function () {
            return apiService.getAll("skills/GetDDL").then(function (data) {
                data.unshift({ id: null, name: "Select Skill...", parentId: "0" });
                return data;
            });
        }
        this.getTrainingsSkills = function () {
            return apiService.getAll("skills/GetTrainingsSkills").then(function (data) {
                return data;
            });
        }
        this.getSkillsByFilterOptions = function (ipsFilterOptions) {
            return apiService.add("skills/GetFilteredSkill", ipsFilterOptions).then(function (data) {
                data.unshift({ name: "Select Skill...", id: null, text: "", value: null });
                return data;
            });
        }
        this.getTrainingTypes = function () {
            return apiService.getAll("TrainingTypes/GetDDL").then(function (data) {
                data.unshift({ name: "Select Type...", id: null, text: "", value: null });
                return data;
            });
        }
        this.getTrainingLevels = function () {
            return apiService.getAll("TrainingLevel/GetDDL").then(function (data) {
                data.unshift({ name: "Select Level...", id: null, text: "", value: null });
                return data;
            });
        }
        this.getOrganizations = function () {
            return apiService.getAll("organizations/GetDDL").then(function (data) {
                data.unshift({ id: null, name: "Select Organization..." });
                return data;
            });
        }
        this.getDurationMetrics = function () {
            return apiService.getAll("DurationMetric/GetDDL").then(function (data) {
                return data;
            });
        }
        this.getExerciseMetrics = function () {
            return apiService.getAll("ExerciseMetric/GetDDL").then(function (data) {
                return data;
            });
        }
        this.getNotificationIntervals = function () {
            return apiService.getAll("notificationIntervals/getAllNotificationIntervals").then(function (data) {
                return data;
            });
        };
        this.getPerformanceGroupsWithProfile = function () {
            return apiService.getAll("Performance_groups/GetAllWithProfile").then(function (data) {
                data.unshift({ id: null, name: "Select Performance Group..." });
                return data;
            });
        };
        this.getById = function (id) {
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
                    viewName: $translate.instant('TRAININGDAIRY_OWN_TRAINING_POPUP_NEW_TRAINING'),
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
        this.getProfileLevels = function () {
            return apiService.getAll("StructureLevel/GetDDL").then(function (data) {
                data.unshift({ id: null, name: "Select Profile Level..." });
                return data;
            });
        }
        this.getProfileTargetGroups = function () {
            return apiService.getAll("JobPosition/GetDDL").then(function (data) {
                data.unshift({ id: null, name: "Select Target Group..." });
                return data;
            });
        }
        this.getIndustries = function () {
            return apiService.getAll("Industries/GeAllIndustries").then(function (data) {
                data.unshift({ id: null, name: "Select Industry..." });
                return data;
            });
        }
        this.getEventsByUserId = function (obj) {

            return apiService.add("trainingdiary/getEventsByUserId/", obj).then(function (data) {
                return data;
            });
        }
        this.setEventsByUserId = function (obj) {
            return apiService.add("trainingdiary/setEventsByUserId/", obj).then(function (data) {
                return data;
            });
        }
        this.getUserStats = function (id) {
            var apiName = 'trainingdiary/GetUserStats';
            var query = '';
            return apiService.getById(apiName, id, query).then(function (data) {
                return data;
            });
        }
        this.SendTrainingNotification = function (paramObj) {
            return apiService.ajax('trainingdiary/SendTrainingNotification', 'post', paramObj);
        }
        this.getTrainigPassedProfiles = function (id, startDate, endDate) {

            var apiName = 'trainingdiary/GetPassedProfilesByUserKey';
            var profileFilterModel = {
                userKey: id,
                startDate: kendo.parseDate(startDate),
                endDate: kendo.parseDate(endDate),
            }
            return apiService.add(apiName, profileFilterModel).then(function (data) {
                return data;
            });
        }

        this.getUserTrainingsForTimeCalculation = function (id) {
            var apiName = 'trainingdiary/GetUserTrainingsForTimeCalculation';
            var query = '';
            return apiService.getById(apiName, id, query).then(function (data) {
                return data;
            });
        }

        this.getTrainingNotes = function (trainingId) {
            var apiName = 'trainingdiary/getTrainingNotes';
            var query = '';
            return apiService.getById(apiName, trainingId, query).then(function (data) {
                return data;
            });
        }
    }])