angular.module('ips.roleLevel')
.service('roleLevelPermissionTemplateService', ['apiService', function (apiService) {
    var self = {
        getResources: function () {
            return getResources();
        },
        getOperations: function () {
            return getOperations();
        },
        getRoleLevelPermissionTemplates: function () {
            return GetRoleLevelPermissionTemplates();
        },
        getRoleLevelPermissionTemplateById: function (id) {
            return GetRoleLevelPermissionTemplateById(id);
        },
        saveRoleLevelPermissionTemplate: function (permissionTemplates) {
            return SaveRoleLevelPermissionTemplate(permissionTemplates);
        }

    };
    return self;

    function getResources() {
        return apiService.getAll("resourcesmanagement/getresources");
    }

    function getOperations() {
        return apiService.getAll("resourcesmanagement/getoperations");
    }
    function GetRoleLevelPermissionTemplateById(templateId) {
        return apiService.getById("rolelevelpermissiontemplate/GetPermissionTemplateById", templateId, "");
    }
    function GetRoleLevelPermissionTemplates() {
        return apiService.getAll("rolelevelpermissiontemplate/GetPermissionTemplates");
    }
    function SaveRoleLevelPermissionTemplate(permissionTemplates) {
        var apiName = 'rolelevelpermissiontemplate/save';
        return apiService.add(apiName, permissionTemplates).then(function (data) {
            return data;
        });
    }
}])