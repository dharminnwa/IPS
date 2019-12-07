(function () {
    'use strict';

    angular
        .module('ips')
        .directive('jobPosition', jobPosition);

    jobPosition.$inject = ['lookupService', 'jobPositionManager','$translate'];

    function jobPosition(lookupService, jobPositionManager, $translate) {

        var allJobPositions = [];

        var directive = {
            restrict: 'E',
            templateUrl: 'views/organization/directives/jobPositionView.html',
            scope: {
                selectedJobPositions: '=selected',
                isEdit: '=isEnabled',
                id: '@id'
            },
            controller: jobPositionController
        };

        return directive;

        function jobPositionController($scope) {

            $scope.allJobPositions = new kendo.data.ObservableArray([]);

            $scope.newLookUp = {};

            function addJobPosition() {
                jobPositionManager.addJobPosition($scope.newJobPosition).then(function (data) {
                    refreshItems(data);
                    $scope.notificationSavedSuccess.show($translate.instant('ORGANIZATIONS_JOB_POSITION_SAVED_SUCCESFULLY'), "info");
                }, function (data) {
                    $scope.notificationSavedSuccess.show($translate.instant('ORGANIZATIONS_ERROR_SAVING_JOB_POSITION'), "error");
                });
            }

            function refreshItems(id) {
                jobPositionManager.getJobPositionById(id).then(function (data) {
                    (!$scope.selectedJobPositions) ? $scope.selectedJobPositions = [] : '';
                    var selected = $scope.selectedJobPositions;
                    selected.push({
                        jobPosition1: data.jobPosition1,
                        id: data.id
                    });
                    $scope.allJobPositions.push(data);
                    $scope.selectedJobPositions = selected;
                });
            }

            $scope.addJobPosition = addJobPosition;
            
            $scope.jobPostionOptions = {
                placeholder: $translate.instant('ORGANIZATIONS_USER_JOB_POSITIONS'),
                dataTextField: "jobPosition1",
                dataValueField: "id",
                valuePrimitive: false,
                autoBind: false,
                dataSource: {
                    type: "json",
                    transport: {
                        read: function (options) {
                            jobPositionManager.getJobPositions().then(function (data) {
                                $scope.allJobPositions.splice(0, $scope.allJobPositions.length);
                                $scope.allJobPositions.push.apply($scope.allJobPositions, data);
                                options.success($scope.allJobPositions);
                            });
                        }
                    }
                }
            }
        }
    }
})();