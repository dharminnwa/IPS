'use strict';

angular.module('ips.profiles')
    .controller('ProfileEditCtrl', ['$scope',
        '$location', 'authService', 'apiService', '$stateParams', '$window', '$rootScope',
        'cssInjector', 'profilesService', '$state', 'profile', 'isInUse', 'isReadOnly', 'industries',
        'profileLevels', 'jobTitles', 'organizations', 'profileCategories',
        'dialogService', 'treeItems', '$translate',
        function ($scope, $location, authService, apiService, $stateParams, $window, $rootScope,
            cssInjector, profilesService, $state, profile, isInUse, isReadOnly, industries,
            profileLevels, jobTitles, organizations, profileCategories,
            dialogService, treeItems, $translate) {
            $scope.industry = { id: -1, name: "" };
            $scope.subIndustry = { id: -1, name: "" };
            $scope.profileLevel = { id: -1, name: "" };
            $scope.profileCategory = { id: -1, name: "" };
            $scope.jobTitles = [];
            $scope.selectedProfile = profile;
            $scope.isInUse = isInUse;
            $scope.isReadOnly = isReadOnly;
            (!$scope.selectedProfile.questionDisplayRuleId) ? $scope.selectedProfile.questionDisplayRuleId = 1 : '';
            $scope.industries = industries;
            $scope.treeItems = treeItems;

            $scope.questionDisplayRule = [
                {
                    id: 1,
                    name: $translate.instant('SOFTPROFILE_PERFORMANCE_GROUP_PER_STEP')
                },
                {
                    id: 2,
                    name: $translate.instant('SOFTPROFILE_QUESTION_PER_STEP')
                },
                {
                    id: 3,
                    name: $translate.instant('SOFTPROFILE_ALL_QUESTIONS_ON_THE_SINGLE_PAGE')
                }
            ]

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
                        if (item.link == undefined) {
                            item.link = "/home/profiles/profiles/" + $scope.profileUrlModifier + "/edit/" + $stateParams.profileId + "/performanceGroups/" + $scope.selectedProfile.organizationId + "/edit/" + item.id
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
            };

            $scope.profileLevels = profileLevels;
            $scope.jobTitles = jobTitles;

            $scope.organizations = organizations;
            $scope.profileCategories = profileCategories;

            $scope.selectOptions = {
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

            $scope.treeIndicator = profilesService.treeIndicator;

            $scope.$watch("treeIndicator.value", function (newval, oldval) {
                profilesService.treeIndicator.value = false;
                profilesService.getTreeItems($stateParams.profileId, $scope.profileUrlModifier).then(function (data) {
                    var ds = new kendo.data.HierarchicalDataSource({
                        data: data,
                        loadOnDemand: false
                    });

                    var treeview = $("#treeview").data("kendoTreeView");

                    if (treeview) {
                        treeview.setDataSource(ds);
                    }

                });
            });

            $scope.profileTreeOptions = new kendo.data.HierarchicalDataSource({
                data: $scope.treeItems,
                loadOnDemand: false
            });

            $scope.profileTreeItemChenged = function (link) {
                $location.path(link);
            };

            $scope.bindIndustry = function () {
                if ($scope.selectedProfile.industry == null) {
                    $scope.selectedProfile.rootIndustryId = null;
                    $scope.selectedProfile.rootIndustryName = "";
                    $scope.selectedProfile.subIndustryId = null;
                    $scope.selectedProfile.subIndustryName = "";
                }
                else if ($scope.selectedProfile.industry.parentId != null) {
                    $scope.industry = $scope.private.getById($scope.selectedProfile.industry.parentId, $scope.industries);
                    $scope.selectedProfile.rootIndustryId = $scope.selectedProfile.industry.parentId;
                    $scope.selectedProfile.rootIndustryName = $scope.industry.name;
                    $scope.selectedProfile.subIndustryId = $scope.selectedProfile.industry.id;
                    $scope.selectedProfile.subIndustryName = $scope.selectedProfile.industry.name;
                }
                else if ($scope.selectedProfile.industry.id > 0) {
                    $scope.industry = $scope.private.getById($scope.selectedProfile.industry.id, $scope.industries);
                    $scope.selectedProfile.rootIndustryName = $scope.industry.name;
                    $scope.selectedProfile.rootIndustryId = $scope.selectedProfile.industry.id;
                    $scope.selectedProfile.subIndustryId = null;
                    $scope.selectedProfile.subIndustryName = "";
                }
                else {
                    $scope.selectedProfile.rootIndustryId = null;
                    $scope.selectedProfile.rootIndustryName = "";
                    $scope.selectedProfile.subIndustryId = null;
                    $scope.selectedProfile.subIndustryName = "";
                }
            };

            $scope.industryUpdate = function (industryId) {
                $scope.industry = $scope.private.getById(industryId, $scope.industries);
                $scope.selectedProfile.industryId = industryId;
                $scope.selectedProfile.rootIndustryName = $scope.industry.name;
                $scope.selectedProfile.subIndustryId = null;
                $scope.selectedProfile.subIndustryName = "";
            };

            $scope.subIndustryUpdate = function (subIndustryId) {
                $scope.selectedProfile.industryId = subIndustryId;
                var industry = $scope.private.getById(subIndustryId, $scope.industries);
                $scope.selectedProfile.subIndustryName = industry.name;
            };

            $scope.selectedProfileSave = function (goToPG) {
                var item = $scope.prepareSelectedProfileForSave();

                if ($scope.selectedProfile.id > 0) {
                    apiService.update("profiles", item).then(function (data) {
                        profilesService.reload($scope.profileTypeId);
                        dialogService.showNotification($translate.instant('SOFTPROFILE_PROFILE_SAVED_SUCCESSFULLY'), 'info');
                        if (goToPG) {
                            $location.path("/home/profiles/profiles/" + $scope.profileUrlModifier + "/edit/" + $stateParams.profileId + "/performanceGroups/" + $scope.selectedProfile.organizationId);
                        }
                        else {
                            $state.go($state.current, {}, { reload: true });
                        }

                    }, function (message) {
                        dialogService.showNotification(message, 'warning');
                    });
                }
                else {
                    apiService.add("profiles", item).then(function (data) {
                        item.id = data;
                        profilesService.reload($scope.profileTypeId);
                        if (item.id > 0) {
                            dialogService.showNotification($translate.instant('SOFTPROFILE_PROFILE_SAVED_SUCCESSFULLY'), 'info');
                            if (goToPG) {
                                var orgId = $scope.selectedProfile.organizationId ? $scope.selectedProfile.organizationId : 0;
                                $location.path("/home/profiles/profiles/" + $scope.profileUrlModifier + "/edit/" + item.id + "/performanceGroups/" + orgId);
                            }
                            else {
                                $location.path("/home/profiles/profiles/" + $scope.profileUrlModifier + "/edit/" + item.id);
                                //$state.go($state.current, {}, { reload: true });
                            }
                        } else {
                            dialogService.showNotification($translate.instant('SOFTPROFILE_SAVE_FAILED'), 'warning');
                        }
                    }, function (message) {
                        dialogService.showNotification(message, 'warning');
                    });
                }
            };

            $scope.saveProfile = function (goToPG) {
                var item = $scope.prepareSelectedProfileForSave();

                if ($scope.selectedProfile.id > 0) {
                    apiService.update("profiles", item).then(function (data) {
                        profilesService.reload($scope.profileTypeId);
                        dialogService.showNotification($translate.instant('SOFTPROFILE_PROFILE_SAVED_SUCCESSFULLY'), 'info');
                        if (goToPG) {
                            $location.path("/home/" + $scope.profileUrlModifier + "/" + item.id + "/performancegroups");
                        }
                        else {
                            $state.go($state.current, {}, { reload: true });
                        }

                    }, function (message) {
                        dialogService.showNotification(message, 'warning');
                    });
                }
                else {
                    apiService.add("profiles", item).then(function (data) {
                        item.id = data;
                        profilesService.reload($scope.profileTypeId);
                        if (item.id > 0) {
                            dialogService.showNotification($translate.instant('SOFTPROFILE_PROFILE_SAVED_SUCCESSFULLY'), 'info');
                            if (goToPG) {
                                ///soft/profile /: profileId / performancegroups
                                $location.path("/home/" + $scope.profileUrlModifier +"/" + item.id + "/performancegroups");
                            }
                            else {
                                $state.go($state.current, {}, { reload: true });
                                //$state.go($state.current, {}, { reload: true });
                            }
                        } else {
                            dialogService.showNotification($translate.instant('SOFTPROFILE_SAVE_FAILED'), 'warning');
                        }
                    }, function (message) {
                        dialogService.showNotification(message, 'warning');
                    });
                }
            };

            $scope.removeProfile = function () {
                dialogService.showYesNoDialog($translate.instant('COMMON_CONFIRM'), $translate.instant('COMMON_ARE_YOU_SURE_YOU_WANT_TO_DELETE')).then(
                    function () {
                        var item = $scope.private.getById($scope.selectedProfile.id, profilesService.list())
                        var index = profilesService.list().indexOf(item);
                        profilesService.remove($scope.selectedProfile.id, index);
                        dialogService.showNotification($translate.instant('SOFTPROFILE_PROFILE_REMOVED_SUCCESFULLY'), 'info');
                        $state.go('^', null, { reload: true });
                    },
                    function () {
                        //alert('No clicked');
                    });
            };

            $scope.back = function () {
                $state.go('^', null, { reload: true });
            };

            $scope.bindIndustry();

        }]);