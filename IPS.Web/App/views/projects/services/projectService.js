angular.module('ips.projects')
.service('projectsService', ['apiService', '$translate', function (apiService, $translate ) {
    this.getOrganizations = function () {
        return apiService.getAll("organizations/GetDDL").then(function (data) {
            data.unshift({ id: null, name: $translate.instant('TASKPROSPECTING_SELECT_ORGANIZATION')});
            return data;
        });
    }
    this.GetUsersbyOrganizationId = function (organizationId) {
        return apiService.getById("api/organizations/GetUsersbyOrganizationId", organizationId).then(function (data) {
            data.unshift({ id: null, name: $translate.instant('TASKPROSPECTING_SELECT_USER')});
            return data;
        });
    }
}])