(function () {
    'use strict';

    angular
        .module('ips.performance')

        .config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
            var scorecardPageResolve = {
                Scorecard: function ($translate) {
                    return $translate.instant('COMMON_SCORECARD');
                }
            };
            $stateProvider
                .state('home.performance.bscScorecard', {
                    url: "/bscScorecard",
                    templateUrl: "views/performance/bscScorecard/bscScorecard.html",
                    controller: "bscScorecardCtrl as scorecard",
                    resolve: {
                        Scorecard: function ($translate) {
                            return $translate.instant('COMMON_SCORECARD');
                        },
                        organizations: function (bscScorecardsService, $translate) {
                            return bscScorecardsService.getOrganizations('&$orderby=Name').then(function (data) {
                                data.unshift({ id: null, name: $translate.instant('TASKPROSPECTING_SELECT_ORGANIZATION') });
                                //data.unshift({ id: null, name: "select organization" });
                                return data;
                            });
                        },
                        profiles: function (bscScorecardsService, $translate) {
                            return bscScorecardsService.getProfiles().then(function (data) {
                                data.unshift({ id: null, name: $translate.instant('COMMON_SELECT_PROFILE') });
                                //data.unshift({ id: null, name: "select profile" });
                                return data;
                            });
                        }
                    },
                    data: {
                        displayName: '{{Scorecard}}', //'Scorecard',
                        paneLimit: 1,
                        depth: 2
                    }
                });
        }])

        .controller('bscScorecardCtrl', bscScorecardCtrl);

    bscScorecardCtrl.$inject = ['cssInjector', 'bscScorecardsService', 'organizations', 'profiles', '$translate'];

    function bscScorecardCtrl(cssInjector, bscScorecardsService, organizations, profiles, $translate) {
        cssInjector.removeAll();
        cssInjector.add('views/performance/bscScorecard/bscScorecard.css');
        var vm = this;

        vm.organizations = organizations;
        vm.profiles = profiles;
        vm.organizationId = null;
        vm.profileId = null;
        vm.isShowReport = false;

        function goBack() {
            history.back();
        }

        function filterProfiles(item) {
            if (item.id == null) {
                return true;
            }

            if (item.organizationId == vm.organizationId) {
                return true;
            }
            return false;
        }


        function onUserAssignGridDataBound(e) {
            var grid = e.sender;
            if (grid.dataSource.total() == 0) {
                var colCount = grid.columns.length;
                $(e.sender.wrapper)
                    .find('tbody')
                    .append('<tr class="kendo-data-row"><td colspan="' + colCount + '" class="no-data">There is no data to show in the grid.</td></tr>');
            }
        };

        function loadScorecard(profileId) {
            if (profileId != null) {
                bscScorecardsService.loadScorecardData(profileId, null, null).then(function (data) {
                    vm.isShowReport = true;
                    vm.reportData = data;
                });
            }
        }

        function dataSource() {

        }

        vm.gridOptions = {
            dataBound: onUserAssignGridDataBound,
            dataSource: bscScorecardsService.dataSource(),
            columnMenu: true,
            filterable: true,
            pageable: true,
            sortable: true,
            columns: [{
                title: $translate.instant('COMMON_PERFORMANCE_GROUPS'),
                columns: [
                    { field: "pgName", title: $translate.instant('COMMON_NAME'), width: "10%" },
                    { field: "pgScore", title: $translate.instant('COMMON_SCORE'), width: "10%", template: "<div class='center-text'>{{dataItem.pgScore}}</div>" },
                    { field: "pgTrend", title: $translate.instant('SCORECARD_TREND'), width: "10%", template: "<div class='trend-{{dataItem.pgTrend}}'></div>" },
                ]
            },
            {
                title: $translate.instant('LEFTMENU_SKILLS'),
                columns: [
                    { field: "sName", title: $translate.instant('COMMON_NAME'), width: "10%" },
                    { field: "sScore", title: $translate.instant('COMMON_SCORE'), width: "10%", template: "<div class='center-text'>{{dataItem.sScore}}</div>" },
                    { field: "sTrend", title: $translate.instant('SCORECARD_TREND'), width: "10%", template: "<div class='trend-{{dataItem.sTrend}}'></div>" },
                ]
            },
            {
                title: $translate.instant('LEFTMENU_QUESTIONS'),
                columns: [
                    { field: "qName", title: $translate.instant('MYPROFILES_QUESTION'), width: "10%" },
                    { field: "qScore", title: $translate.instant('COMMON_SCORE'), width: "10%", template: "<div class='center-text'>{{dataItem.qScore}}</div>" },
                    { field: "qTrend", title: $translate.instant('SCORECARD_TREND'), width: "10%", template: "<div class='trend-{{dataItem.qTrend}}'></div>" },
                ]
            },
            ],
        };

        vm.goBack = goBack;
        vm.filterProfiles = filterProfiles;
        vm.loadScorecard = loadScorecard;
    }

})();