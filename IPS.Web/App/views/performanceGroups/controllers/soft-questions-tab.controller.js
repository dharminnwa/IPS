'use strict';

angular
    .module('ips.performanceGroups')
    .controller('softQuestionTabCtrl', ['$scope', 'cssInjector', 'questionTabService', 'questionBankManager', 'dialogService',
        '$location', 'performanceGroupsService', '$controller',
        function ($scope, cssInjector, questionTabService, questionBankManager, dialogService, $location,
                  performanceGroupsService, $controller) {

            $controller('baseQuestionTabCtrl',
                {
                    $scope: $scope,
                    cssInjector: cssInjector,
                    questionTabService: questionTabService,
                    questionBankManager: questionBankManager,
                    dialogService: dialogService,
                    $location: $location,
                    performanceGroupsService: performanceGroupsService,
                    profileTypeId: 1
                });
        }]);