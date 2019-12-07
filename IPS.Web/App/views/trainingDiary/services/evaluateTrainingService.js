angular.module('ips.evaluatetraining', ['ui.router', 'kendo.directives'])
    .service('evaluateTrainingService', ['apiService', '$translate', function (apiService, $translate) {
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
}])