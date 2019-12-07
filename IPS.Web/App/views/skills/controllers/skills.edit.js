angular.module('ips.skills')

    .config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
        var baseResolve = {
            allowRemoveAction: function () {
                return true;
            },
            skill: function ($stateParams, skillsService) {
                return skillsService.getById($stateParams.skillId);
            },
            skills: function ($stateParams, skillsService) {
                return skillsService.getSkills();
            },
            industries: function ($stateParams, skillsService) {
                return skillsService.getIndustries();
            },
            levels: function ($stateParams, skillsService) {
                return skillsService.getProfileLevels();
            },
            organizations: function ($stateParams, skillsService) {
                return skillsService.getOrganizations();
            },
            profileTypes: function ($stateParams, skillsService) {
                return skillsService.getProfileTypes();
            }
        };
        var ktResolve = _.clone(baseResolve);
        ktResolve.allowRemoveAction = function () {
            return false;
        };
        $stateProvider
            .state('home.profiles.soft.skills.edit', {
                url: "/edit/:skillId",
                templateUrl: "views/skills/skills.edit.html",
                controller: "SkillEditCtrl",
                resolve: baseResolve,
                data: {
                    displayName: '{{skill.viewName}}',
                    paneLimit: 1,
                    depth: 4,
                    resource: "Profiles"
                }
            })
            .state('home.profiles.soft.performanceGroups.edit.editSkill', {
                url: "/editSkill/:skillId",
                templateUrl: "views/skills/skills.edit.html",
                controller: "SkillEditCtrl",
                resolve: baseResolve,
                data: {
                    displayName: '{{skill.viewName}}',
                    paneLimit: 1,
                    depth: 5,
                    resource: "Profiles"
                }
            })
            .state('home.profiles.soft.edit.performanceGroups.edit.editSkill', {
                url: "/editSkill/:skillId",
                templateUrl: "views/skills/skills.edit.html",
                controller: "SkillEditCtrl",
                resolve: baseResolve,
                data: {
                    displayName: '{{skill.viewName}}',
                    paneLimit: 1,
                    depth: 6,
                    resource: "Profiles"
                }
            })
            .state('home.profiles.knowledgetest.skills.edit', {
                url: "/edit/:skillId",
                templateUrl: "views/skills/skills.edit.html",
                controller: "SkillEditCtrl",
                resolve: ktResolve,
                data: {
                    displayName: '{{skill.viewName}}',
                    paneLimit: 1,
                    depth: 4,
                    resource: "Profiles"
                }
            })
            .state('home.profiles.knowledgetest.performanceGroups.edit.editSkill', {
                url: "/editSkill/:skillId",
                templateUrl: "views/skills/skills.edit.html",
                controller: "SkillEditCtrl",
                resolve: ktResolve,
                data: {
                    displayName: '{{skill.viewName}}',
                    paneLimit: 1,
                    depth: 5,
                    resource: "Profiles"
                }
            })
            .state('home.profiles.knowledgetest.edit.performanceGroups.edit.editSkill', {
                url: "/editSkill/:skillId",
                templateUrl: "views/skills/skills.edit.html",
                controller: "SkillEditCtrl",
                resolve: ktResolve,
                data: {
                    displayName: '{{skill.viewName}}',
                    paneLimit: 1,
                    depth: 6,
                    resource: "Profiles"
                }
            });
    }])

    .controller('SkillEditCtrl', ['$scope', '$location', 'apiService', '$rootScope', 'cssInjector', '$stateParams', '$state',
        'dialogService', 'skill', 'skills', 'industries', 'levels', 'organizations', 'profileTypes', 'authService', 'allowRemoveAction', '$translate',
        function ($scope, $location, apiService, $rootScope, cssInjector, $stateParams, $state, dialogService, skill,
            skills, industries, levels, organizations, profileTypes, authService, allowRemoveAction, $translate) {
            $scope.skill = skill;

            $scope.industries = industries;
            $scope.levels = levels;
            $scope.organizations = organizations;
            $scope.profileTypes = profileTypes;

            $scope.industry = {id: -1, name: ""};
            if (($scope.skill.industries) && ($scope.skill.industries.length > 0)) {
                $scope.industry = $scope.skill.industries[0];
                $scope.skill.industry = $scope.skill.industries[0];
                $scope.skill.industryId = $scope.industry.id;
            }

            $scope.selectJobPositionsOptions = {
                placeholder: $translate.instant('SOFTPROFILE_SELECT_TARGET_AUDIENCE'),
                dataTextField: "jobPosition1",
                dataValueField: "id",
                valuePrimitive: false,
                autoBind: false,
                dataSource: {
                    type: "json",
                    transport: {
                        read: function (options) {
                            apiService.getAll("JobTitles?$select=Id,JobPosition1&$orderby=JobPosition1").then(function (data) {
                                options.success(data);
                            })
                        }
                    }
                }
            };


            $scope.private = {
                getById: function (id, myArray) {
                    if (myArray.filter) {
                        return myArray.filter(function (obj) {
                            if (obj.id == id) {
                                return obj
                            }
                        })[0]
                    }
                    return undefined;
                },
                processTable: function (data, idField, foreignKey, rootLevel) {
                    var hash = {};

                    for (var i = 0; i < data.length; i++) {
                        var item = data[i];
                        item.text = item.name;
                        var id = item[idField];
                        var parentId = item[foreignKey];

                        hash[id] = hash[id] || [];
                        hash[parentId] = hash[parentId] || [];

                        item.items = hash[id];
                        hash[parentId].push(item);
                    }
                    return hash[rootLevel];
                }
            }

            skills.push({ id: null, name: $translate.instant('SOFTPROFILE_ROOT'), parentId: "0"});

            $scope.isSkillUpdate = {organizationId: $scope.skill.organizationId, isPermition: null};
            $scope.action = $scope.skill.id > 0 ? authService.actions.Update : authService.actions.Create;
            function isDisabled() {
                if (($scope.isSkillUpdate.organizationId == $scope.skill.organizationId) && ($scope.isSkillUpdate.isPermition != null)) {
                    return $scope.isSkillUpdate.isPermition;
                }
                else {
                    $scope.isSkillUpdate.isPermition = !authService.hasPermition($scope.skill.organizationId, 'Questions', $scope.action);
                    $scope.isSkillUpdate.organizationId = $scope.skill.organizationId;
                    return $scope.isSkillUpdate.isPermition;

                }

            }

            $scope.isDisabled = isDisabled;

            $scope.isRemoveVisible = function () {
                return allowRemoveAction && (skill.id > 0);
            };

            $scope.treeSkillsData = new kendo.data.HierarchicalDataSource({
                data: $scope.private.processTable(skills, "id", "parentId", 0)
            });

            $scope.scaleUpdate = function (scaleId) {
                $scope.skill.scale = $scope.private.getById(scaleId, $scope.scales);
            };

            $scope.skillSelected = function (item) {
                $scope.skill.parentId = item.id;
                $scope.skill.parentName = item.name;
            }

            $scope.saveSkill = function () {
                var item = angular.copy($scope.skill);
                item.industries = [];
                if ($scope.industry.id > 0) {
                    item.industries.push($scope.industry);
                }

                if (item.id > 0) {
                    apiService.update("skills", item).then(function (data) {
                        if ($state.includes("home.profiles.skills.edit")) {
                            $scope.$parent.doFilter();
                        }
                        else {
                            angular.forEach($scope.$parent.skills, function (key, value) {
                                if (key.skillId == item.id) {
                                    key.skillName = item.name;
                                    key.skillDescription = item.description;
                                }
                                if ((key.subSkill) && (key.subSkill.id == item.id)) {
                                    key.subSkillName = item.name;
                                    key.subSkillDescription = item.description;
                                }
                            });
                        }

                        if (data) {
                            dialogService.showNotification($translate.instant('SOFTPROFILE_SKILL_SAVED_SUCCESSFULLY'), 'info')
                            //$state.go('^');
                        }
                        else {
                            dialogService.showNotification($translate.instant('SOFTPROFILE_SAVE_FAILED'), 'warning');
                        }

                    }, function (error) {
                        dialogService.showNotification(error, "warning");
                    });
                }
                else {
                    apiService.add("skills", item).then(function (data) {
                        item.id = data;
                        if ($state.includes("home.profiles.skills.edit")) {
                            $scope.$parent.doFilter();
                        }

                        if (item.id > 0) {
                            dialogService.showNotification($translate.instant('SOFTPROFILE_SKILL_SAVED_SUCCESSFULLY'), 'info');
                            //$state.go('^');
                        } else {
                            dialogService.showNotification($translate.instant('SOFTPROFILE_SAVE_FAILED'), 'warning');
                        }
                    }, function (error) {
                        dialogService.showNotification(error, "warning");
                    });
                }

            }

            $scope.removeSkill = function () {
                dialogService.showYesNoDialog($translate.instant('COMMON_CONFIRM'), $translate.instant('COMMON_ARE_YOU_SURE_YOU_WANT_TO_DELETE')).then(
                    function () {
                        var item = $scope.private.getById($scope.skill.id, $scope.$parent.skills);
                        var index = $scope.$parent.skills.indexOf(item);
                        apiService.remove("skills", id).then(function (data) {
                            if (data) {
                                $scope.$parent.skills.splice(index, 1);
                            }
                        });
                    },
                    function () {
                        //alert('No clicked');
                    });
            }

            $scope.back = function () {
                $state.go('^', null, {reload: true});
            }

            $scope.bindIndustry = function () {
                if ($scope.skill.industry == null) {
                    $scope.skill.rootIndustryId = null;
                    $scope.skill.subIndustryId = null;
                }
                else if ($scope.skill.industry.parentId != null) {
                    $scope.industry = $scope.private.getById($scope.skill.industry.parentId, $scope.industries);
                    $scope.skill.rootIndustryId = $scope.skill.industry.parentId;
                    $scope.skill.subIndustryId = $scope.skill.industry.id;
                }
                else if ($scope.skill.industry.id > 0) {
                    $scope.skill.rootIndustryId = $scope.skill.industry.id;
                    $scope.skill.subIndustryId = null;
                }
                else {
                    $scope.skill.rootIndustryId = null;
                    $scope.skill.subIndustryId = null;
                }
            }

            $scope.industryUpdate = function (industryId) {
                $scope.industry = $scope.private.getById(industryId, $scope.industries);
                $scope.skill.industryId = industryId;
                $scope.skill.subIndustryId = null;
            }

            $scope.subIndustryUpdate = function (subIndustryId) {
                $scope.skill.industryId = subIndustryId;
            }

            $scope.bindIndustry();
        }])