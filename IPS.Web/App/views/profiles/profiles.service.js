'use strict';

angular.module('ips.profiles')
    .service('profilesService', ['apiService', 'dialogService', '$q', 'progressBar', '$translate', function (apiService, dialogService, $q, progressBar, $translate) {
        var profiles = new kendo.data.ObservableArray([]);
        var projectProfiles = new kendo.data.ObservableArray([]);
        var performanceGroups;

        var organizationId = -1;

        function processTable(data, idField, foreignKey, rootLevel, profileId, organizationId, profileType) {
            var hash = {};

            for (var i = 0; i < data.length; i++) {
                var item = data[i];
                item.text = item.name;
                if (item.link == undefined) {
                    item.link = "/home/profiles/profiles/" + profileType + "/edit/" + profileId + "/performanceGroups/" + organizationId + "/edit/" + item.id
                }
                item.expanded = true;
                var id = item[idField];
                var parentId = item[foreignKey];

                hash[id] = hash[id] || [];
                hash[parentId] = hash[parentId] || [];

                item.items = hash[id];
                hash[parentId].push(item);
            }
            return hash[rootLevel];
        }

        this.OrganizationId = organizationId;

        this.init = function () {

        };
        this.createSkillsHash = function (skills) {
            var hash = {};
            for (var key in skills) {
                var skill = skills[key];
                hash[skill.id] = skill;
            }
            return hash;
        };

        this.flattenSkillsList = function (skills) {
            var hash = this.createSkillsHash(skills);

            var createSkillItem = function (nodeId, item, hash) {
                if (nodeId) {
                    item.name = hash[nodeId].name + " / " + item.name;
                    createSkillItem(hash[nodeId].parentId, item, hash);
                }
                return item;
            };
            var flatItems = [];

            for (var key in skills) {
                var skill = skills[key];
                var flatItemRaw = { id: skill.id, name: skill.name };
                if (skill.id) {
                    var flatItem = createSkillItem(skill.parentId, flatItemRaw, hash);
                    flatItems.push(flatItem);
                }
            }
            flatItems.sort(function (a, b) {
                var nameA = a.name.toLowerCase(), nameB = b.name.toLowerCase();
                if (nameA < nameB)
                    return -1;
                if (nameA > nameB)
                    return 1;
                return 0;
            });
            return flatItems;
        };

        this.jobPositionList = function () {
            return apiService.getAll("JobTitles?$select=Id,JobPosition1&$orderby=JobPosition1").then(function (data) {
                return data;
            });
        };

        this.getPerformanceGroups = function (query) {
            return apiService.getAll("Performance_groups?$select=Id,Name&$expand=Profile&$orderby=Name" + query).then(function (data) {
                data.unshift({ id: null, name: $translate.instant('SOFTPROFILE_SELECT_PERFORMANCE_GROUP') });

                return data;
            });
        };

        this.getIndustries = function () {
            return apiService.getAll("industries?$filter=ParentId eq null&$select=Id,Name&$orderby=Name&$expand=SubIndustries").then(function (data) {
                angular.forEach(data, function (key, index) {
                    key.text = key.name;
                    key.value = key.id;
                });
                data.unshift({ id: null, name: $translate.instant('SOFTPROFILE_SELECT_INDUSTRY'), text: "", value: null });

                return data;
            });
        };
        this.getMeasureUnits = function () {
            return apiService.getAll("MeasureUnit?$select=Id,Name&$orderby=Name").then(function (data) {
                return data;
            });
        };
        this.getScaleSettingsRules = function () {
            return apiService.getAll("Scale_settings_rules?$orderby=Name").then(function (data) {
                //data.unshift({ id: null, name: "Select Scale Settings Rule..." });
                return data;
            });
        };

        this.getMedalRules = function () {
            return apiService.getAll("ktmedalrule").then(function (data) {
                return data;
            });
        };

        this.getMedalRule = function (id) {
            return apiService.getById('ktmedalrule', id);
        };

        this.getProfileLevels = function () {
            return apiService.getAll("Profile_Levels?$select=Id,Name&$orderby=Name").then(function (data) {
                data.unshift({ id: null, name: $translate.instant('SOFTPROFILE_SELECT_PROFILE_LEVEL') });
                return data;
            });
        };

        this.getJobTitles = function () {
            return apiService.getAll("JobTitles?$select=Id,JobPosition1&$orderby=JobPosition1").then(function (data) {
                return data;
            });
        };

        this.getScales = function () {
            return apiService.getAll("scales?$expand=ScaleRanges,ScaleCategory,ProfileType1&$filter=(ProfileType eq 1 or ProfileType eq null) and IsTemplate eq true").then(function (data) {
                return data;
            });
        };
        this.getScaleById = function (scaleId) {
            return apiService.getById("scales", scaleId, "$expand=ScaleRanges,ScaleCategory,ProfileType1").then(function (data) {
                return data;
            });
        };

        this.getOrganizations = function () {
            return apiService.getAll("organization?$select=Id,Name&$orderby=Name&$expand=Departments($select=Id,Name),Teams($select=Id,Name),Users($select=Id,FirstName,LastName)").then(function (data) {
                data.unshift({ id: null, name: $translate.instant('SOFTPROFILE_SELECT_ORGANIZATION') });
                return data;
            });
        };

        this.getProfileCategories = function () {
            return apiService.getAll("ProfileCategory?$select=Id,Name&$orderby=Name&$filter=OrganizationId eq " + (organizationId != "" ? organizationId : -1) + " or OrganizationId eq null").then(function (data) {
                data.unshift({ id: null, name: $translate.instant('SOFTPROFILE_SELECT_PROFILE_CATEGORY') });
                return data;
            });
        };

        this.getAllProject = function () {
            var deferred = $q.defer();
            var apiName = 'projects/getProjects';
            apiService.getAll(apiName).then(function (data) {
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }

        this.getProjectById = function (projectId) {
            var apiName = 'projects/getProjectById';
            return apiService.getById(apiName, projectId).then(function (data) {
                return data;
            });
        }

        this.getFilteredProfileSkill = function (ipsFilterOptions) {
            return apiService.add("skills/GetFilteredProfileSkill", ipsFilterOptions).then(function (data) {
                return data;
            });
        }

        this.getProfileTargetGroups = function () {
            return apiService.getAll("JobPosition/GetDDL").then(function (data) {
                data.unshift({ id: null, name: $translate.instant('SOFTPROFILE_SELECT_TARGET_GROUP') });
                return data;
            });
        }

        this.getProfileTags = function () {
            return apiService.getAll("ProfileTags/GetDDL").then(function (data) {
                data.unshift({ id: null, name: $translate.instant('SOFTPROFILE_SELECT_TAGS_GROUP') });
                return data;
            });
        }

        this.getProjectProfiles = function (projectId) {
            projectProfiles = new kendo.data.ObservableArray([]);
            return apiService.getById("Profiles/GetProjectProfiles", projectId).then(function (data) {
                if (data.length > 0) {
                    projectProfiles.push.apply(projectProfiles, data);
                }
                return data;
            });
        }
        this.getProjectProfileTemplates = function (projectId, profileType) {
            return apiService.getAll("profiles/getProfileTemplates/" + projectId + "/" + profileType).then(function (data) {
                return data;
            });
        }

        this.getFilteredProfileTemplates = function (options) {
            return apiService.add("profiles/getFilteresProfileTemplates", options).then(function (data) {
                return data;
            });
        }

        this.getProjectPerformanceGroupTemplates = function (projectId) {
            return apiService.getById("performance_groups/getPerformanceGroupTemplates", projectId).then(function (data) {
                return data;
            });
        }


        this.changeProfileStatus = function (profileId) {
            return apiService.add("Profiles/ChangeProfileStatus/" + profileId, null).then(function (data) {
                return data;
            });
        }

        this.reload = function (profileTypeId, query, callback) {
            if (query == undefined) {
                query = "";
            }
            progressBar.startProgress();
            apiService.getAll("profiles?$orderby=Name&$expand=Industry,JobPositions,Organization&$filter=ProfileTypeId eq " + profileTypeId + query).then(function (data) {
                progressBar.stopProgress();
                profiles.splice(0, profiles.length);
                if (data.length > 0) {
                    profiles.push.apply(profiles, data);
                }
                if (callback) {
                    progressBar.stopProgress();
                    callback();
                }
            });
        };


        this.reloadProjectProfile = function (projectId) {
            apiService.getById("Profiles/GetProjectProfiles", projectId).then(function (data) {
                projectProfiles.splice(0, projectProfiles.length);
                if (data.length > 0) {
                    projectProfiles.push.apply(projectProfiles, data);
                }
            });
        };

        this.add = function (item) {
            profiles.push(item);
        };

        this.update = function (item, index) {
            profiles.splice(index, 1, item);
        };

        this.get = function (index) {
            return profiles[index];
        };

        this.getById = function (id, profileType) {
            if (id > 0) {
                return apiService.getById("profiles", id, "$expand=Project,KTMedalRule,StageGroups,Scale($expand=ScaleRanges,ScaleCategory,MeasureUnit),Industry,JobPositions,PerformanceGroups($expand=ScorecardPerspective,Link_PerformanceGroupSkills($expand=Skill,Skill1,Questions,Trainings($expand=TrainingMaterials)))").then(function (data) {
                    data.viewName = data.name;
                    return data;
                });
            } else {
                var profileTypeId = 1;
                if (profileType == 'knowledgetest') {
                    profileTypeId = 5;
                }
                var profile = {
                    id: -1,
                    name: "",
                    viewName: $translate.instant('SOFTPROFILE_NEW_PROFILE'),
                    profileTypeId: profileTypeId,
                    description: "",
                    organizationId: null,
                    industryId: null,
                    rootIndustryId: null,
                    subIndustryId: -1,
                    scaleSettingsRuleId: 1,
                    isActive: true,
                    isTemplate: false,
                    industry: { id: null, name: "", parentId: null },
                    categoryId: null,
                    scaleId: null,
                    levelId: null,
                    kpiStrong: 3,
                    kpiWeak: 3,
                    performanceGroups: [],
                    stageGroups: [],
                    jobPositions: []
                };
                if (profileType == 'soft') {
                    profile.scale = {
                        id: null,
                        name: "",
                        description: "",
                        scaleCategoryId: undefined,
                        measureUnitId: undefined,
                        profileType: undefined,
                        isTemplate: true,
                        scaleCategory: {},
                        measureUnit: {},
                        profileType1: {}
                    };
                }
                return profile;
            }
        };
        this.getSkillById = function (id) {
            if (id > 0) {
                return apiService.getById("skills", id, "").then(function (data) {
                    return {
                        trainings: [],
                        questions: [],
                        skill1: null,
                        skill: null,
                        id: 0,
                        name: data.name,
                        description: data.description,
                        performanceGroupId: 0,
                        skillId: data.id,
                        subSkillId: null,
                        benchmark: 0,
                        weight: 0,
                        csf: null,
                        action: null
                    };
                });
            }
            else {
                return {
                    trainings: [],
                    questions: [],
                    skill1: null,
                    skill: null,
                    id: 0,
                    name: "",
                    description: "",
                    performanceGroupId: 0,
                    skillId: 0,
                    subSkillId: null,
                    benchmark: 0,
                    weight: 0,
                    csf: null,
                    action: null
                };
            }

        }
        this.getCSFListBySkillId = function (skillId) {
            if (skillId > 0) {
                return apiService.getById("skills/GetSkillCSFList", skillId, "").then(function (data) {
                    return data;
                });
            }
            else {
                return [];
            }

        }
        this.getActionListBySkillId = function (skillId) {
            if (skillId > 0) {
                return apiService.getById("skills/GetSkillActionList", skillId, "").then(function (data) {
                    return data;
                });
            }
            else {
                return [];
            }

        }
        this.getUserById = function (id) {
            var apiName = 'user';
            var query = '$expand=Departments1,Link_TeamUsers($expand=Team),UserType,JobPositions';
            return apiService.getById(apiName, id, query).then(function (data) {
                return data;
            });
        };
        this.getOrganizationUsers = function (organzationId) {
            var deferred = $q.defer();
            var apiName = 'organizations/GetOrganizationUsersbyOrganizationId';
            apiService.getById(apiName, organzationId, null).then(function (data) {
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }
        this.remove = function (id, index) {
            apiService.remove("profiles", id).then(function (data) {
                if (data) {
                    return profiles.splice(index, 1);
                }
            });
        };
        this.removeProjectProfile = function (id, index) {
            apiService.remove("profiles", id).then(function (data) {
                if (data) {
                    return projectProfiles.splice(index, 1);
                }
            });
        };

        this.isProfileInUse = function (id) {
            var deferred = $q.defer();
            apiService.getById("profiles/is_in_use", id, "").then(function (data) {
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        };

        this.list = function () {
            return profiles;
        };

        this.dataSource = function () {
            return new kendo.data.DataSource({
                type: "json",
                data: profiles,
                pageSize: 10,
                schema: {
                    model: {
                        id: "id",
                        fields: {
                            id: { type: 'number', },
                            name: { type: 'string' },
                            description: { type: 'string' },
                            industryName: { type: 'string' },
                            //jobPosition1: { name: { type: 'string' } }
                        }
                    }
                }
            });
        };

        this.projectProfilesDataSource = function () {
            return new kendo.data.DataSource({
                type: "json",
                data: projectProfiles,
                pageSize: 10,
                schema: {
                    model: {
                        id: "id",
                        fields: {
                            id: { type: 'number', },
                            name: { type: 'string' },
                            profileTypeId: { type: 'number', },
                            profileType: { type: 'object' },
                            description: { type: 'string' },
                            industryId: { type: 'number' },
                            jobPositions: { type: 'object' },
                            measureUnitId: { type: 'number' },
                            project: { type: 'object' },
                            kpiWeak: { type: 'number' },
                            kpiStrong: { type: 'number' },
                            createdOn: { type: 'datetime' },
                            modifiedOn: { type: 'datetime' },
                            isActive: { type: 'boolean' },
                            //jobPosition1: { name: { type: 'string' } }
                        }
                    }
                }
            });
        };

        function getTreeItems(profileId, profileType) {
            var deferred = $q.defer();
            var treeItems = [];
            if (profileId > 0) {
                apiService.getById("profiles", profileId, "$expand=StageGroups,Scale($expand=ScaleRanges,ScaleCategory,MeasureUnit),Industry,JobPositions,PerformanceGroups($expand=ScorecardPerspective,Link_PerformanceGroupSkills($expand=Skill,Skill1,Questions,Trainings))").then(function (data) {
                    treeItems = data.performanceGroups;

                    treeItems.push({
                        name: data.name,
                        id: -2,
                        parentId: 0,
                        link: "/home/profiles/profiles/" + profileType + "/edit/" + profileId
                    });
                    treeItems.push({
                        name: "Final Profile",
                        id: -3,
                        parentId: -2,
                        link: "/home/profiles/profiles/" + profileType + "/edit/" + profileId + "/preview"
                    });
                    treeItems.push({
                        name: "Performance Groups",
                        id: null,
                        parentId: 0,
                        link: "/home/profiles/profiles/" + profileType + "/edit/" + profileId + "/performanceGroups/" + data.organizationId
                    });
                    treeItems.push({
                        name: "Send Outs",
                        id: -1,
                        parentId: 0,
                        link: "/home/profiles/profiles/" + profileType + "/edit/" + profileId + "/stageGroups/all"
                    });
                    treeItems.push({
                        name: "Active",
                        id: -4,
                        parentId: -1,
                        link: "/home/profiles/profiles/" + profileType + "/edit/" + profileId + "/stageGroups/active"
                    });
                    treeItems.push({
                        name: "History",
                        id: -5,
                        parentId: -1,
                        link: "/home/profiles/profiles/" + profileType + "/edit/" + profileId + "/stageGroups/history"
                    });

                    if (data.stageGroups.length > 0) {
                        angular.forEach(data.stageGroups, function (sg, index) {
                            if (/*(moment(sg.startDate) <= moment()) &&*/ (moment(sg.endDate) >= moment())) {
                                treeItems.push({
                                    name: sg.name,
                                    id: sg.id,
                                    parentId: -4,
                                    link: "/home/profiles/profiles/" + profileType + "/edit/" + profileId + "/stageGroups/active/edit/" + sg.id
                                });
                            } else if (moment(sg.endDate) < moment()) {
                                treeItems.push({
                                    name: sg.name,
                                    id: sg.id,
                                    parentId: -5,
                                    link: "/home/profiles/profiles/" + profileType + "/edit/" + profileId + "/stageGroups/history/edit/" + sg.id
                                });
                            }
                        })
                    }
                    ;

                    var treeTable = processTable(treeItems, "id", "parentId", 0, profileId, data.organizationId, profileType);
                    deferred.resolve(treeTable);
                },
                    function (data) {
                        deferred.reject(data);
                    });
            }
            else {
                deferred.resolve(treeItems);
            }
            return deferred.promise;
        }

        this.getTreeItems = function (profileId, profileType) {
            return $q.when(getTreeItems(profileId, profileType));
        };

        this.updateTree = function () {
            treeIndicator.value = true;
        };

        var treeIndicator = {
            value: false
        };

        this.treeIndicator = treeIndicator;
    }]);