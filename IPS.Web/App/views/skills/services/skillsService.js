(function () {
    'use strict';

    angular
        .module('ips.skills', ['ui.router'])
        .service('skillsService', ['apiService', '$translate', function (apiService, $translate) {
            this.getSkills = function () {
                return apiService.getAll("skills?$orderby=Name").then(function (data) {
                    return data;
                });
            }

            var getItemById = function (id, myArray) {
                if (myArray.filter) {
                    return myArray.filter(function (obj) {
                        if (obj.id == id) {
                            return obj
                        }
                    })[0]
                }
                return undefined;
            }

            var getItemByName = function (name, myArray) {
                if (myArray.filter) {
                    return myArray.filter(function (obj) {
                        if (obj.name == name) {
                            return obj
                        }
                    })[0]
                }
                return undefined;
            }

            this.getSkillsWithTrainings = function (query) {
                if (!query) { query = ""; };
                return apiService.getAll("skills/GetSkillsWithTrainings?$orderby=Name&$expand=Trainings,Organization,Link_PerformanceGroupSkills($expand=PerformanceGroup),Link_PerformanceGroupSkills1($expand=PerformanceGroup)" + query).then(function (data) {

                    angular.forEach(data, function (key, value) {
                        if (!key.organizationId) {
                            key.organizationName = "";
                        } else {
                            key.organizationName = key.organization.name;
                        }
                        key.performanceGroups = [];
                        key.performanceGroupsView = "";
                        key.skillName = "";
                        key.subSkillName = "";
                        if (!key.parentId) {
                            key.skillName = key.name;
                            if (key.link_PerformanceGroupSkills.length > 0) {
                                angular.forEach(key.link_PerformanceGroupSkills, function (pgkey, value) {
                                    if (pgkey.performanceGroup) {
                                        if (!getItemByName(pgkey.performanceGroup.name, key.performanceGroups)) {
                                            key.performanceGroups.push(pgkey.performanceGroup);
                                        }
                                    }
                                });
                            }
                        } else {
                            key.subSkillName = key.name;
                            if (key.link_PerformanceGroupSkills1.length > 0) {
                                angular.forEach(key.link_PerformanceGroupSkills1, function (pgkey, value) {
                                    if (pgkey.performanceGroup) {
                                        if (!getItemByName(pgkey.performanceGroup.name, key.performanceGroups)) {
                                            key.performanceGroups.push(pgkey.performanceGroup);
                                        }

                                    }
                                });
                            }
                        }
                        key.performanceGroups.sort(function (a, b) { 
                            if ( a.name < b.name )
                                return -1;
                            if ( a.name > b.name )
                                return 1;
                            return 0;
                            });
                        var i;
                        for (i = 0; i < key.performanceGroups.length; i++) {
                            key.performanceGroupsView += "<div>" + key.performanceGroups[i].name + "</div>";
                        }

                    });
                    return data;
                });
            }

            this.getOrganizations = function () {
                return apiService.getAll("organization?$select=Id,Name&$expand=Departments($select=Id,Name),Teams($select=Id,Name),Users($select=Id,FirstName,LastName)").then(function (data) {
                    data = _.sortBy(data, function (organization) { return organization.name; });
                    data.unshift({ id: null, name: $translate.instant('SOFTPROFILE_SELECT_ORGANIZATION') });
                    return data;
                });
            }

            this.getIndustries = function () {
                return apiService.getAll("industries?$filter=ParentId eq null&$select=Id,Name&$orderby=Name&$expand=SubIndustries").then(function (data) {
                    data.unshift({ id: null, name: $translate.instant('SOFTPROFILE_SELECT_INDUSTRY') });
                    return data;
                });
            };

            this.getProfileLevels = function () {
                return apiService.getAll("Profile_Levels?$select=Id,Name&$orderby=Name").then(function (data) {
                    data.unshift({ id: null, name: $translate.instant('SOFTPROFILE_SELECT_PROFILE_LEVEL') });
                    return data;
                });
            };

            this.getPerformanceGroups = function (query) {
                return apiService.getAll("Performance_groups?$orderby=Name&$expand=Profile" + query).then(function (data) {
                    data.unshift({ id: null, name: $translate.instant('SOFTPROFILE_SELECT_PERFORMANCE_GROUP') });
                    return data;
                });
            };

            this.getProfileTypes = function () {
                return apiService.getAll("ProfileType?$select=Id,Name&$orderby=Name").then(function (data) {
                    data.unshift({ id: null, name: $translate.instant('SOFTPROFILE_SELECT_PROFILE_TYPES') });
                    return data;
                });
            };
            

            this.getById = function (id) {
                if (id > 0) {
                    return apiService.getById("skills", id, "$expand=Skill1,JobPositions,Industries").then(function (data) {
                        data.viewName = data.name;
                        if (data.skill1) {
                            data.parentName = data.skill1.name;
                        }
                        else {
                            data.parentName = "root";
                        }
                        return data;
                    });
                }
                else {
                    return {
                        id: 0,
                        name: "",
                        viewName: $translate.instant('SOFTPROFILE_NEW_SKILL'),
                        description: "",
                        parentId: null,
                        parentName: "root",
                        structureLevelId: null,
                        rootIndustryId: null,
                        subIndustryId: null,
                        industry: null,
                        isTemplate: true,
                        isActive: true,
                        jobPositions: [],
                        industries: []
                    };
                }

            }
        }])
})();
