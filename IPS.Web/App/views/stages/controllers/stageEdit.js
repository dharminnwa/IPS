(function () {
    'use strict';

    angular
        .module('ips.stages')

        .config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
            var baseResolve = {
                selectedStage: function (stageGroupManager, $stateParams, globalVariables) {
                    return stageGroupManager.getStageById($stateParams.stageId).then(function (data) {
                        moment.locale(globalVariables.lang.currentUICulture);
                        (data.startDate) ? data.startDate = moment(kendo.parseDate(data.startDate)).format('L LT') : '';
                        (data.endDate) ? data.endDate = moment(kendo.parseDate(data.endDate)).format('L LT') : '';

                        if (data.startStageStartDate) {
                            data.startStageStartDate = moment(kendo.parseDate(data.startStageStartDate)).format('L LT');
                        }
                        if (data.startStageEndDate) {
                            data.startStageEndDate = moment(kendo.parseDate(data.startStageEndDate)).format('L LT');
                        }
                        if (data.milestoneStartDate) {
                            data.milestoneStartDate = moment(kendo.parseDate(data.milestoneStartDate)).format('L LT');
                        }
                        if (data.milestoneEndDate) {
                            data.milestoneEndDate = moment(kendo.parseDate(data.milestoneEndDate)).format('L LT');
                        }
                        return data;
                    });
                }
            };
            $stateProvider
                .state('home.profiles.soft.edit.stageGroups.edit', {
                    url: "/edit/:stageId",
                    templateUrl: "views/profiles/stageGroups/views/stageGroupsEdit.html",
                    controller: "stageGroupsEditCtrl as stageEdit",
                    resolve: baseResolve,
                    data: {
                        displayName: '{{selectedStage.name}}',
                        paneLimit: 1,
                        depth: 5,
                        resource: "Profiles"
                    }
                })
                .state('home.profiles.knowledgetest.edit.stageGroups.edit', {
                    url: "/edit/:stageId",
                    templateUrl: "views/profiles/stageGroups/views/stageGroupsEdit.html",
                    controller: "stageGroupsEditCtrl as stageEdit",
                    resolve: baseResolve,
                    data: {
                        displayName: '{{selectedStage.name}}',
                        paneLimit: 1,
                        depth: 5,
                        resource: "Profiles"
                    }
                });
        }])

        .controller('stageGroupsEditCtrl', stageGroupsEditCtrl);

    stageGroupsEditCtrl.$inject = ['selectedStage', '$location', 'stageGroupManager', 'dialogService', '$stateParams', 'globalVariables', '$translate'];

    function stageGroupsEditCtrl(selectedStage, $location, stageGroupManager, dialogService, $stateParams, globalVariables, $translate) {
        var vm = this;

        vm.stageInfo = selectedStage;
        moment.locale(globalVariables.lang.currentUICulture);
        function isEdit() {
            return ($location.path().indexOf('stageGroups/edit') > -1);
        }

        function save() {
            (isEdit()) ? updateStage() : '';
        }

        function updateStage() {
            if (vm.stageInfo) {
                var stageinfo = _.clone(vm.stageInfo);
                stageinfo.startDate = kendo.parseDate(stageinfo.startDate);
                stageinfo.endDate = kendo.parseDate(stageinfo.endDate);
                stageinfo.startStageStartDate = kendo.parseDate(stageinfo.startStageStartDate);
                stageinfo.startStageEndDate = kendo.parseDate(stageinfo.startStageEndDate);
                stageinfo.milestoneStartDate = kendo.parseDate(stageinfo.milestoneStartDate);
                stageinfo.milestoneEndDate = kendo.parseDate(stageinfo.milestoneEndDate);
                stageGroupManager.updateStage(vm.stageInfo).then(
                    function (data) {
                        stageGroupManager.returnToPerviousPage();
                    },
                    function (data) {
                        console.log(data);
                    }
                );
            }
        }

        function removeStage() {
            dialogService.showYesNoDialog($translate.instant('COMMON_CONFIRM'), $translate.instant('COMMON_ARE_YOU_SURE_YOU_WANT_TO_DELETE')).then(
                function () {
                    stageGroupManager.removeStage($stateParams.stageId).then(
                        function (data) {
                            stageGroupManager.returnToPerviousPage();
                        },
                        function (data) {
                            console.log(data);
                        }
                    );
                },
                function () {
                });
        }

        function goBack() {
            history.back();
        }

        vm.removeStage = removeStage;

        vm.goBack = goBack;

        vm.save = save;

        vm.isEdit = isEdit;
    }

})();