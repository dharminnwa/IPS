(function () {
    'use strict';

    angular
        .module('ips.profiles')
        .directive('profileLevel', profileLevel);

    profileLevel.$inject = ['profileLevelService', '$translate'];

    function profileLevel(profileLevelService, $translate) {

        var directive = {
            restrict: 'E',
            templateUrl: 'views/profiles/directives/profileLevel/profileLevelView.html',
            scope: {
                lookUpName: '@name',
                lookUpType: '@type',
                selectedLookup: '=selected'
            },
            controller: profileLevelController
        };

        return directive;

        function profileLevelController($scope) {

            getProfileLevels();

            function getProfileLevels() {
                profileLevelService.getProfileLevels().then(function (data) {
                    $scope.profileLevels = data;
                })
            }

            function addProfileLevel() {
                profileLevelService.newProfileLevel($scope.newProfileLevel).then(function (data) {
                    refreshItems(data);
                    $scope.notificationSavedSuccess.show($translate.instant('SOFTPROFILE_PROFILE_LEVEL_SAVED_SUCCESFULLY'), "info");
                }, function (data) {
                    $scope.notificationSavedSuccess.show($translate.instant('SOFTPROFILE_ERROR_SAVING_PROFILE_LEVEL'), "error");
                });
            }

            function refreshItems(profileLevelId) {
                profileLevelService.getProfileLevels().then(function (data) {
                    $scope.profileLevels = data;
                    $scope.selectedLookup = profileLevelId;
                });
            }

            function getById(id, myArray) {
                return myArray.filter(function (obj) {
                    if (obj.id == id) {
                        return obj
                    }
                })[0]
            }

            $scope.addProfileLevel = addProfileLevel;
        }
    }
})();