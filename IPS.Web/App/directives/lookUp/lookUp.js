(function () {
    'use strict';

    angular
        .module('ips')
        .directive('lookUp', lookUp);

    lookUp.$inject = ['lookupService', '$translate'];

    function lookUp(lookupService) {

        var allLookUps = [];

        var directive = {
            restrict: 'E',
            templateUrl: 'directives/lookUp/lookUpView.html',
            scope: {
                lookUpName: '@name',
                lookUpType: '@type',
                selectedLookup: '=selected',
                selectedLookupId: '=lookupid',
                isDisabled: '=ngDisabled'
            },
            controller: lookUpController
        };

        return directive;
        
        function lookUpController($scope, $translate) {

            $scope.newLookUp = {
                lookupItemType: $scope.lookUpType
            };

            getLookUps();

            $scope.addNewLookup = addNewLookup;

            function addNewLookup() {
                lookupService.newLookup($scope.newLookUp).then(function (data) {
                    refreshItems(data);
                    $scope.notificationSavedSuccess.show($translate.instant('COMMON_LOOKUP_SAVED_SUCCESFULLY'), "info");
                }, function (data) {
                    $scope.notificationSavedSuccess.show($translate.instant('COMMON_ERROR_SAVING_LOOKUP'), "error");
                });
            }

            function refreshItems(lookup) {
                lookupService.getLookups($scope.lookUpType).then(function (data) {
                    $scope.allLookUps = data;
                    $scope.selectedLookup = getById(lookup, data)
                });
            }

            function getLookUps() {
                lookupService.getLookups($scope.lookUpType).then(function (data) {
                    $scope.allLookUps = data;
                    ($scope.selectedLookupId) ? $scope.selectedLookup = getById($scope.selectedLookupId, data) : '';
                });
            }

            function getById(id, myArray) {
                return myArray.filter(function (obj) {
                    if (obj.id == id) {
                        return obj
                    }
                })[0]
            }
        }
    }
})();