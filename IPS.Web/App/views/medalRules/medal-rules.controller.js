'use strict';

angular.module('ips.medalRules')
    .config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
        var baseMedalRulesResolve = {
            pageName: function ($translate) {
                return $translate.instant('LEFTMENU_MEDAL_RULES');
            }
        };
        $stateProvider
            .state('home.profiles.knowledgetest.medalRules', {
                url: "/medalrules",
                templateUrl: "views/medalRules/medalRules.html",
                controller: "MedalRulesCtrl",
                resolve: baseMedalRulesResolve,
                data: {
                    displayName: '{{pageName}}',//'Medal Rules',
                    paneLimit: 1,
                    depth: 3,
                    resource: "Medal Rules"
                }
            })
    }])
    .controller('MedalRulesCtrl', ['$scope', '$state', '$location', 'apiService', '$window', '$rootScope', 'cssInjector', 'medalRulesService',
        'dialogService', 'authService', '$translate',
        function ($scope, $state, $location, apiService, $window, $rootScope, cssInjector, medalRulesService,
            dialogService, authService, $translate) {
            cssInjector.removeAll();
            cssInjector.add('views/medalRules/medalRules.css');

            function isDisabled(organizationId, action) {
                if ($scope['MedalRules' + organizationId + action] == undefined) {
                    $scope['MedalRules' + organizationId + action] = !authService.hasPermition(organizationId, 'Medal Rules', action);
                }
                return $scope['MedalRules' + organizationId + action];
            }

            $scope.authService = authService;
            $scope.isDisabled = isDisabled;

            $scope.paramMedalRuleId = $state.params.medalRuleId ? parseInt($state.params.medalRuleId) : 0;

            $scope.medalRules = new kendo.data.ObservableArray([]);

            function loadData() {
                medalRulesService.getAll().then(function (data) {
                    $scope.medalRules.splice(0, $scope.medalRules.length);
                    $scope.medalRules.push.apply($scope.medalRules, data);
                });
            }

            loadData();

            $scope.edit = function (id) {
                $scope.paramMedalRuleId = id;
                $state.go("home.profiles.knowledgetest.medalRules.edit", {medalRuleId: id});
            };

            $scope.remove = function (id) {
                medalRulesService.checkInUse(id).then(
                    function (inUse) {
                        if (inUse) {
                            dialogService.showNotification($translate.instant('SOFTPROFILE_MEDAL_RULE_CANNOT_BE_REMOVED'), 'error');
                        }
                        else {
                            dialogService.showYesNoDialog($translate.instant('COMMON_CONFIRM'), $translate.instant('COMMON_ARE_YOU_SURE_YOU_WANT_TO_DELETE')).then(
                                function () {
                                    medalRulesService.remove(id).then(
                                        function (data) {
                                            loadData();
                                        },
                                        function (message) {
                                            dialogService.showNotification($translate.instant('SOFTPROFILE_MEDAL_RULE_CANNOT_BE_REMOVED') + message, 'error');
                                        });
                                });
                        }
                    }
                );
            };

            $scope.clone = function (id) {
                medalRulesService.clone(id).then(
                    function (data) {
                        dialogService.showNotification($translate.instant('SOFTPROFILE_MEDAL_RULE_CLONED_SUCCESSFULLY'));
                        loadData();
                    }, function (message) {
                    });
            };

            $scope.create = function () {
                $scope.paramMedalRuleId = 0;
                $state.go("home.profiles.knowledgetest.medalRules.edit", {medalRuleId: 0});
            };

            $scope.onUserAssignGridDataBound = function (e) {
                var grid = e.sender;
                if (grid.dataSource.total() == 0) {
                    var colCount = grid.columns.length;
                    $(e.sender.wrapper)
                        .find('tbody')
                        .append('<tr class="kendo-data-row"><td colspan="' + colCount + '" class="no-data">There is no data to show in the grid.</td></tr>');
                }
            };

            var fixedFormat = function (newValue, originalValue) {
                var decimals = (originalValue + "").split(".")[1];
                var accuracy = decimals ? decimals.length : 1;
                return newValue.toFixed(accuracy);
            };

            $scope.gridOptions = {
                dataBound: $scope.onUserAssignGridDataBound,
                dataSource: new kendo.data.DataSource({
                    type: "json",
                    data: $scope.medalRules,
                    pageSize: 10,
                    schema: {
                        model: {
                            id: "id",
                            fields: {
                                id: {type: 'number'},
                                name: {type: 'string'}
                            }
                        }
                    }
                }),
                columnMenu: false,
                filterable: true,
                pageable: true,
                sortable: true,
                resizable: true,
                columns: [
                    { field: "name", title: $translate.instant('COMMON_NAME'), width: "200px"},
                    {
                        field: "notPassed", title: $translate.instant('SOFTPROFILE_NOT_PASSED'), width: "150px", filterable: false,
                        template: function (dataItem) {
                            var res = "<label class='medal-rule-label'>0% - " + fixedFormat(dataItem.bronzeStart - 0.1, dataItem.bronzeStart) + "%</label>";
                            return res;
                        }
                    },
                    {
                        field: "bronze", title: $translate.instant('SOFTPROFILE_BRONZE'), width: "150px", filterable: false,
                        template: function (dataItem) {
                            var res = "<label class='medal-rule-label'>" + dataItem.bronzeStart + "% - " + dataItem.bronzeEnd + "%</label>";
                            return res;
                        }
                    },
                    {
                        field: "silver", title: $translate.instant('SOFTPROFILE_SILVER'), width: "150px", filterable: false,
                        template: function (dataItem) {
                            var res = "<label class='medal-rule-label'>" + fixedFormat(dataItem.bronzeEnd + 0.1, dataItem.bronzeEnd) + "% - " + dataItem.silverEnd + "%</label>";
                            return res;
                        }
                    },
                    {
                        field: "gold", title: $translate.instant('SOFTPROFILE_GOLD'), width: "150px", filterable: false,
                        template: function (dataItem) {
                            var res = "<label class='medal-rule-label'>" + fixedFormat(dataItem.silverEnd + 0.1, dataItem.silverEnd) + "% - 100%</label>";
                            return res;
                        }
                    },
                    {
                        field: "actions", title: $translate.instant('COMMON_ACTIONS'), width: "150px", filterable: false, sortable: false,
                        template: function (dataItem) {
                            var res = "<div class='icon-groups'><a class='fa fa-pencil fa-lg' ng-click='edit(" + dataItem.id + ")' ></a>";

                            res += "<a class='fa fa-copy fa-lg' ng-click='clone(" + dataItem.id + ");'></a>";

                            if (!isDisabled(dataItem.organizationId, authService.actions.Delete)) {
                                res += "<a class='icon-groups icon-groups-item delete-icon' ng-click='remove(" + dataItem.id + ");'></a>";
                            }
                            res += "</div>";
                            return res;
                        }
                    }
                ]
            };

            $scope.tooltipOptions = {
                filter: "th.k-header", // show tooltip only on these elements
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

            $scope.searchText = "";

            $scope.doSearch = function (searchText) {
                $scope.gridInstance.dataSource.filter([
                    {
                        logic: "or",
                        filters: [
                            {
                                field: "name",
                                operator: "contains",
                                value: searchText
                            }
                        ]
                    }]);
            };

            $scope.$on("kendoRendered", function (event) {
                if (event.targetScope.medalRulesGrid) {
                    $scope.gridInstance = event.targetScope.medalRulesGrid;
                }
            });

            $scope.openLink = function (link) {
                var win = window.open(link);
                win.focus();
            }
        }]);