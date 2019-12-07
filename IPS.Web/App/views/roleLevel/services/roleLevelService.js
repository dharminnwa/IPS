(function () {
    angular.module('ips.roleLevel', ['ui.router', 'kendo.directives', 'growing-panes'])
    .service('roleLevelService', ['apiService', function (apiService) {
        var self = {
            getRoleLevelsByOrganizationId: function (organizationId) {
                return getRoleLevelsByOrganizationId(organizationId);
            },
            saveRoleLevel: function (roleLevel) {
                return saveRoleLevel(roleLevel);
            },
            deleteRoleLevel: function (roleLevelId) {
                return deleteRoleLevel(roleLevelId);
            },
            getOrganizations: function () {
                return getOrganizations();
            },
            getRolesByOrganizationId: function (organizationId) {
                return getRolesByOrganizationId(organizationId);
            },
            getRolesByLevelId: function (levelId) {
                return getRolesByLevelId(levelId);
            }
        };
        return self;

        function getRoleLevelsByOrganizationId(organizationId) {
            return apiService.getById("rolelevel/getRoleLevelsByOrganizationId", organizationId, "");
        }

        function saveRoleLevel(roleLevel) {
            var apiName = 'rolelevel/save';
            return apiService.add(apiName, roleLevel).then(function (data) {
                return data;
            });
        }
        function deleteRoleLevel(roleLevelId) {
            var apiName = 'rolelevel/delete';
            return apiService.remove(apiName, roleLevelId).then(function (data) {
                return data;
            });
        }

        function getOrganizations() {
            var apiName = "organizations/GetDDL";
            return apiService.getAll(apiName).then(function (data) {
                data.unshift({ id: 0, name: "Select Organization..." });
                return data;
            });
        }

        function getRolesByOrganizationId(organizationId) {
            return apiService.getById("role/getRolesByOrganizationId", organizationId, "");
        }
        function getRolesByLevelId(levelId) {
            return apiService.getById("role/GetRolesByLevelId", levelId, "");
        }
    }]);
})()