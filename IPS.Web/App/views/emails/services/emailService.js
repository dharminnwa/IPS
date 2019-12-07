angular.module('ips.emails')
.service('emailsService', ['apiService', function (apiService) {
    this.getAllEmails = function () {
        return apiService.getAll("emails").then(function (data) {
            data.unshift({ id: null, name: "Select Organization..." });
            return data;
        });
    }
    this.GetEmailById = function (id) {
        return apiService.getById("emails", id).then(function (data) {
            return data;
        });
    }
}])