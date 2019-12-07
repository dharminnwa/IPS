(function () {
    'use strict';

    angular
        .module('ips.stageGroups')

    .config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
        $stateProvider
            .state('home.profiles.soft.edit.stageGroups', {
                url: "/stageGroups/:filter",
                templateUrl: "views/profiles/stageGroups/views/stageGroups.html",
                controller: "stageGroupsCtrl as stageGroups",
                resolve: {
                    pageName: function ($translate) {
                        return $translate.instant('SOFTPROFILE_STAGE_GROUPS');
                    },
                    groups: function (stageGroupManager, $stateParams) {
                        return stageGroupManager.getStages("?$filter=Profiles/any(s:s/Id eq " + $stateParams.profileId + ")");
                    },
                    profileTypeId: function (profilesTypesEnum) {
                        return profilesTypesEnum.soft;
                    }
                },
                data: {
                    displayName: '{{pageName}}',//'Stage Groups',
                    paneLimit: 1,
                    depth: 4,
                    resource: "Profiles"
                }
            })
            .state('home.profiles.knowledgetest.edit.stageGroups', {
                url: "/stageGroups/:filter",
                templateUrl: "views/profiles/stageGroups/views/stageGroups.html",
                controller: "stageGroupsCtrl as stageGroups",
                resolve: {
                    pageName: function ($translate) {
                        return $translate.instant('SOFTPROFILE_STAGE_GROUPS');
                    },
                    groups: function (stageGroupManager, $stateParams) {
                        return stageGroupManager.getStages("?$filter=Profiles/any(s:s/Id eq " + $stateParams.profileId + ")");
                    },
                    profileTypeId: function (profilesTypesEnum) {
                        return profilesTypesEnum.knowledgetest;
                    }
                },
                data: {
                    displayName: '{{pageName}}',//'Stage Groups',
                    paneLimit: 1,
                    depth: 4,
                    resource: "Profiles"
                }
            });
    }])

    .controller('stageGroupsCtrl', stageGroupsCtrl);

    stageGroupsCtrl.$inject = ['cssInjector', '$stateParams', '$location', 'stageGroupManager', 'dialogService', '$state',
        'profilesTypesEnum', 'profileTypeId', '$translate'];

    function stageGroupsCtrl(cssInjector, $stateParams, $location, stageGroupManager, dialogService, $state,
        profilesTypesEnum, profileTypeId, $translate) {

        cssInjector.add('views/profiles/stageGroups/stageGroups.css');
        var vm = this;

        function newStage() {
            $location.path($location.path() + "/basicEdit/0");
        }

        function editStage(id){
            $location.path($location.path() + "/edit/" + id);
        }

        function removeStageGroup(id) {
            stageGroupManager.isStageGroupInUse(id).then(
                function (data) {
                    if (data == true) {
                        dialogService.showNotification($translate.instant('SOFTPROFILE_STAGE_GROUP_CANNOT_BE_REMOVED') + ' ' + $translate.instant('SOFTPROFILE_THIS_STAGE_GROUP_IS_IN_USE'), 'warning');
                    } else {
                        dialogService.showYesNoDialog($translate.instant('COMMON_CONFIRM'), $translate.instant('COMMON_ARE_YOU_SURE_YOU_WANT_TO_DELETE')).then(
                            function () {
                                stageGroupManager.removeStageGroup(id).then(
                                function (data) {
                                    $state.go($state.current, {}, { reload: true });
                                },
                                function (data) {
                                    console.log(data);
                                }
                                );
                            },
                            function () {
                            }
                         );
                    }
                }
                );
        }

        vm.newStage = newStage;

        vm.editStage = editStage;

        vm.removeStageGroup = removeStageGroup;

        var getStageGridColumns = function () {
            var columns = [];
            var columnWidth = profileTypeId == profilesTypesEnum.soft ? '20%' : '25%';
            columns.push({ field: "name", title: $translate.instant('SOFTPROFILE_STAGE_NAME'), width: columnWidth });
            columns.push({ field: "startDate", title: $translate.instant('COMMON_START_DATE'), width: columnWidth, template: '<div>{{dataItem.startDate | date:"short"}}</div>' });
            columns.push({ field: "endDate", title: $translate.instant('COMMON_DUE_DATE'), width: columnWidth, template: '<div>{{dataItem.endDate | date:"short"}}</div>' });
            if (profileTypeId == profilesTypesEnum.soft) {
                columns.push({ field: "", title: $translate.instant('SOFTPROFILE_CURRENT_STAGE'), width: columnWidth });
            }
            columns.push({
                field: "", title: "", width: columnWidth, template: "<div class='icon-groups'>" +
                    "<a class='icon-groups icon-groups-item edit-icon' ng-click='stageGroups.editStage(dataItem.id)'></a>" +
                    "<a class='icon-groups icon-groups-item remove-icon' ng-click='stageGroups.removeStageGroup(dataItem.id)' ></a>" +
                "</div>"
            });
            return columns;
        }
        vm.stageGroupOptions = {
            dataSource: {
                type: "json",
                transport: {
                    read: function (options) {
                        if ($stateParams.filter == "all") {
                            options.success(stageGroupManager.allStages);
                        }
                        else if ($stateParams.filter == "active") {
                            options.success(stageGroupManager.activeStages());
                        }
                        else if ($stateParams.filter == "history") {
                            options.success(stageGroupManager.historyStages());
                        }
                    }
                }
            },
            selectable: false,
            sortable: true,
            columns: getStageGridColumns()
        }

        vm.tooltipOptions = {
            filter: "th", // show tooltip only on these elements
            position: "top",
            animation: {
                open: {
                    effects: "fade:in",
                    duration: 200
                },
                close: {
                    effects: "fade:out",
                    duration: 200
                }
            },
            // show tooltip only if the text of the target overflows with ellipsis
            show: function (e) {
                if (this.content.text() != "") {
                    $('[role="tooltip"]').css("visibility", "visible");
                }
            }
        };
    }
})();