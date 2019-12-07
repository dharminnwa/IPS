(function () {
    'use strict';

    angular
        .module('ips.stages')

        .config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
            $stateProvider
                .state('home.profiles.soft.edit.stageGroups', {
                    url: "/stageGroups",
                    templateUrl: "views/profiles/stageGroups/views/stageGroups.html",
                    controller: "stageGroupsCtrl as stageGroups",
                    resolve: {
                        pageName: function ($translate) {
                            return $translate.instant('SOFTPROFILE_STAGE_GROUPS');
                        },
                        groups: function (stageGroupManager) {
                            return stageGroupManager.getStages();
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

    stageGroupsCtrl.$inject = ['cssInjector', '$stateParams', '$location', 'stageGroupManager', 'dialogService', '$state', '$translate'];

    function stageGroupsCtrl(cssInjector, $stateParams, $location, stageGroupManager, dialogService, $state, $translate) {
        cssInjector.add('views/profiles/stageGroups/stageGroups.css');
        var vm = this;

        function isEdit() {
            return ($location.path().indexOf('stageGroups/new') > -1);
        }

        function newStage() {
            $location.path("/home/profiles/profiles/soft/edit/" + $stateParams.profileId + "/stageGroups/new");
        }

        function editStage(id) {
            $location.path("/home/profiles/profiles/soft/edit/" + $stateParams.profileId + "/stageGroups/edit/" + id);
        }

        function removeStage(id) {
            dialogService.showYesNoDialog($translate.instant('COMMON_CONFIRM'), $translate.instant('COMMON_ARE_YOU_SURE_YOU_WANT_TO_DELETE')).then(
                function () {
                    stageGroupManager.removeStage(id).then(
                        function (data) {
                            $state.go($state.current, {}, { reload: true });
                        },
                        function (data) {
                            console.log(data);
                        }
                    );
                },
                function () {
                });
        }

        vm.isEdit = isEdit;

        vm.newStage = newStage;

        vm.editStage = editStage;

        vm.removeStage = removeStage;

        vm.stageGroupOptions = {
            dataSource: {
                type: "json",
                transport: {
                    read: function (options) {
                        options.success(stageGroupManager.allStages)
                    }
                }
            },
            selectable: false,
            sortable: true,
            columns: [
                { field: "name", title: $translate.instant('SOFTPROFILE_STAGE_NAME'), width: '20%' },
                {
                    field: "startDate", title: $translate.instant('COMMON_START_DATE'), width: '20%',
                    template: function (dataItem) {
                        if (dataItem.startDate) {
                            return moment(kendo.parseDate(dataItem.startDate)).format("L LT");
                        }
                        else {
                            return "";
                        }
                    },
                    //template: '<div>{{dataItem.endDate | date:"yyyy-MM-dd"}}</div>'
                },
                {
                    field: "endDate", title: $translate.instant('COMMON_DUE_DATE'), width: '20%',
                    template: function (dataItem) {
                        if (dataItem.endDate) {
                            return moment(kendo.parseDate(dataItem.endDate)).format("L LT");
                        }
                        else {
                            return "";
                        }
                    },
                    //template: '<div>{{dataItem.endDate | date:"yyyy-MM-dd"}}</div>'
                },
                { field: "", title: $translate.instant('SOFTPROFILE_CURRENT_STAGE'), width: '20%' },
                {
                    field: "", title: "", width: '20%', template: "<div class='icon-groups'>" +
                        "<a class='icon-groups icon-groups-item edit-icon' ng-click='stageGroups.editStage(dataItem.id)'></a>" +
                        "<a class='icon-groups icon-groups-item remove-icon' ng-click='stageGroups.removeStage(dataItem.id)' ></a>" +
                        "</div>"
                },
            ]
        }
    }
})();