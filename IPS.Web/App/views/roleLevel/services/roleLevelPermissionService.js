angular.module('ips.roleLevel')
.service('roleLevelPermissionService', ['apiService', function (apiService) {
    var self = {
        getResources: function () {
            return getResources();
        },
        getOperations: function () {
            return getOperations();
        },
        getRoleLevelPermissionsByLevelId: function (levelId) {
            return getRoleLevelPermissionsByLevelId(levelId);
        },
        saveRoleLevelPermission: function (roleLevelId, permissions) {
            return SaveRoleLevelPermission(roleLevelId, permissions);
        },
        getAllPermissionsLevels: function () {
            return getAllPermissionsLevels();
        },
        saveAdvancePermission: function (roleLevelId, permissionLevelId) {
            return saveAdvancePermission(roleLevelId, permissionLevelId);
        },
        getAdvancePermissionsByLevelId: function (levelId) {
            return getAdvancePermissionsByLevelId(levelId);
        },
        getResourceDepedencies: function () {
            return getResourceDepedencies();
        }
    };
    return self;

    function getResources() {
        return apiService.getAll("resourcesmanagement/getresources");
    }
    function getResourceDepedencies() {
        return apiService.getAll("resourcesmanagement/getresourcedepedencies");
    }

    function getOperations() {
        return apiService.getAll("resourcesmanagement/getoperations");
    }
    function getRoleLevelPermissionsByLevelId(levelId) {
        return apiService.getById("rolelevelpermission/GetPermissionsByLevelId", levelId, "");
    }

    function SaveRoleLevelPermission(roleLevelId, permissions) {
        var apiName = 'rolelevelpermission/save';
        return apiService.add(apiName, { roleLevelId: roleLevelId, ipsRoleLevelResourcesPermissionModels: permissions }).then(function (data) {
            return data;
        });
    }

    function getAdvancePermissionsByLevelId(levelId) {
        return apiService.getById("rolelevelpermission/GetAdvancePermissionsByLevelId", levelId, "");
    }

    function saveAdvancePermission(roleLevelId, permissionLevelId) {
        var apiName = 'rolelevelpermission/saveAdvancePermission';
        return apiService.add(apiName, { roleLevelId: roleLevelId, permissionLevelId: permissionLevelId }).then(function (data) {
            return data;
        });
    }

    function getAllPermissionsLevels() {
        return apiService.getAll("rolelevelpermission/GetAllPermissionsLevels");
    }
}])