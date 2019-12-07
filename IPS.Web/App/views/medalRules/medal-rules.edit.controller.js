'use strict';

angular.module('ips.medalRules')
    .config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
        $stateProvider
            .state('home.profiles.knowledgetest.medalRules.edit', {
                url: "/edit/:medalRuleId",
                templateUrl: "views/medalRules/medalRules.edit.html",
                controller: "MedalRuleEditCtrl",
                resolve: {
                    medalRule: function ($stateParams, medalRulesService) {
                        return medalRulesService.getById($stateParams.medalRuleId);
                    }
                },
                data: {
                    displayName: '{{medalRule.viewName}}',
                    paneLimit: 1,
                    depth: 4,
                    resource: "Medal Rules"
                }
            })
    }])
    .controller('MedalRuleEditCtrl', ['$scope', '$location', 'apiService', '$rootScope', 'cssInjector', '$stateParams', '$state', 'dialogService',
        'medalRule', 'medalRulesService', '$translate',
        function ($scope, $location, apiService, $rootScope, cssInjector, $stateParams, $state,
            dialogService, medalRule, medalRulesService, $translate) {
            $scope.medalRule = medalRule;

            $scope.minThan = function (value) {
                if (value) {
                    return value - 1;
                }
                return 99;
            };

            $scope.moreThan = function (value) {
                if (value) {
                    return value + 1;
                }
                return 0;
            };

            $scope.save = function () {
                if ($scope.medalRule.id > 0) {
                    medalRulesService.update($scope.medalRule).then(function (data) {
                        dialogService.showNotification($translate.instant('SOFTPROFILE_PROFILE_SAVED_SUCCESSFULLY'), 'info');
                    }, function (message) {
                        dialogService.showNotification(message, 'warning');
                    });
                }
                else {
                    medalRulesService.add($scope.medalRule).then(function (id) {
                        if (id > 0) {
                            dialogService.showNotification($translate.instant('SOFTPROFILE_PROFILE_SAVED_SUCCESSFULLY'), 'info');
                            $location.path("/home/profiles/profiles/knowledgetest/medalrules/edit/" + id);
                        } else {
                            dialogService.showNotification($translate.instant('SOFTPROFILE_SAVE_FAILED'), 'warning');
                        }
                    }, function (message) {
                        dialogService.showNotification(message, 'warning');
                    });
                }
            };

            $scope.remove = function () {
                dialogService.showYesNoDialog($translate.instant('COMMON_CONFIRM'), $translate.instant('COMMON_ARE_YOU_SURE_YOU_WANT_TO_DELETE')).then(
                    function () {
                        medalRulesService.remove($scope.medalRule.id);
                        dialogService.showNotification($translate.instant('SOFTPROFILE_MEDAL_RULE_REMOVED_SUCCESFULLY'), 'info');
                        $state.go('^', null, { reload: true });
                    },
                    function () {
                    });
            };

            $scope.back = function () {
                $state.go('^', null, { reload: true });
            };
        }]);

