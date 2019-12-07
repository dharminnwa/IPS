angular.module('ips.trainings', ['ui.router', 'kendo.directives'])
    .service('trainingsService', ['apiService', '$translate', function (apiService, $translate) {
        var trainings = new kendo.data.ObservableArray([]);

        this.addRange = function (items) {
            trainings.splice(0, trainings.length);
            trainings.push.apply(trainings, items);
        };

        this.getSkills = function () {
            return apiService.getAll("Skills?$orderby=Name").then(function (data) {
                //data.unshift({ id: null, name: "root", parentId: "0" });
                //data = _.filter(data, function (item) {
                //    return item.isTemplate != true;
                //})
                data.unshift({ id: null, name: $translate.instant('SOFTPROFILE_SELECT_SKILL'), parentId: "0" });
                return data;
            });
        }
        this.getSkillsByFilterOptions = function (ipsFilterOptions) {
            return apiService.add("skills/GetFilteredSkill", ipsFilterOptions).then(function (data) {
                return data;
            });
        }

        this.getTrainingTypes = function () {
            return apiService.getAll("trainingTypes?$orderby=Name").then(function (data) {
                angular.forEach(data, function (key, value) {
                    key.text = key.name;
                    key.value = key.id;
                });
                data.unshift({ name: $translate.instant('SOFTPROFILE_SELECT_TYPE'), id: null, text: "", value: null });
                return data;
            });
        }

        this.getTrainingLevels = function () {
            return apiService.getAll("TrainingLevels?$orderby=Name").then(function (data) {

                angular.forEach(data, function (key, value) {
                    key.text = key.name;
                    key.value = key.id;
                });
                data.unshift({ name: $translate.instant('SOFTPROFILE_SELECT_LEVEL'), id: null, text: "", value: null });
                return data;
            });
        }

        this.getOrganizations = function () {
            return apiService.getAll("organization?$select=Id,Name&$orderby=Name").then(function (data) {
                data.unshift({ id: null, name: $translate.instant('SOFTPROFILE_SELECT_ORGANIZATION') });
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

        this.getPerformanceGroups = function () {
            return apiService.getAll("Performance_groups/GetAllWithProfile").then(function (data) {
                data.unshift({ id: null, name: $translate.instant('SOFTPROFILE_SELECT_PERFORMANCE_GROUP') });
                return data;
            });
        };

        this.add = function (item) {
            trainings.push(item);
        };
        this.update = function (item, index) {
            trainings.splice(index, 1, item);
        };

        this.getAll = function (query) {
            if (!query) {
                query = "";
            }
            ;

            return apiService.getAll("trainings").then(function (data) {
                angular.forEach(data, function (key, value) {
                    if (key.skills.length > 0) {
                        key.skillName = key.skills[0].name;
                    }
                    else {
                        key.skillName = "";
                    }
                });
                trainings.splice(0, trainings.length);
                trainings.push.apply(trainings, data);
                return data;
            });
        }
        this.getAllTemplates = function (query) {
            if (!query) {
                query = "";
            }
            ;

            return apiService.getAll("trainings/GetTemplates").then(function (data) {
                angular.forEach(data, function (key, value) {
                    if (key.skills.length > 0) {
                        key.skillName = key.skills[0].name;
                    }
                    else {
                        key.skillName = "";
                    }
                });
                trainings.splice(0, trainings.length);
                trainings.push.apply(trainings, data);
                return data;
            });
        }

        this.getById = function (id) {
            if (id > 0) {
                return apiService.getById("trainings/GetTrainingDetailById", id, "").then(function (data) {
                    //return apiService.getById("trainings", id, "").then(function (data) {
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
                data.unshift({ id: null, name: $translate.instant('SOFTPROFILE_SELECT_PROFILE_LEVEL') });
                return data;
            });
        }
        this.getProfileTargetGroups = function () {
            return apiService.getAll("JobPosition/GetDDL").then(function (data) {
                data.unshift({ id: null, name: $translate.instant('SOFTPROFILE_SELECT_TARGET_GROUP') });
                return data;
            });
        }
        this.getIndustries = function () {
            return apiService.getAll("Industries/GeAllIndustries").then(function (data) {
                data.unshift({ id: null, name: $translate.instant('SOFTPROFILE_SELECT_INDUSTRY') });
                return data;
            });
        }

        this.get = function (index) {
            return trainings[index];
        }

        this.remove = function (index) {
            return trainings.splice(index, 1);
        }

        this.list = function () {
            return trainings;
        }

        this.dataSource = function () {
            return new kendo.data.DataSource({
                type: "json",
                data: trainings,
                pageSize: 10,
                schema: {
                    model: {
                        id: "id",
                        fields: {
                            id: { type: 'number', },
                            name: { type: 'string' },
                            description: { type: 'string' },
                            levelId: { type: 'number' }
                        }
                    }
                }
            });
        }

    }])