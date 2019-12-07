(function () {
    'use strict';

    angular
        .module('ips.profiles')
        .directive('profileCategory', profileCategory);

    profileCategory.$inject = ['profileCategoryService', '$translate'];

    function profileCategory(profileCategoryService, $translate) {

        var directive = {
            restrict: 'E',
            templateUrl: 'views/profiles/directives/profileCategory/profileCategoryView.html',
            scope: {
                lookUpName: '@name',
                lookUpType: '@type',
                selectedLookup: '=selected',
                organizationId: '=organization'
            },
            controller: profileCategoryController
        };

        return directive;

        function profileCategoryController($scope) {

            getProfileCategories();

            $scope.newProfileCategory = {
                organizationId: ($scope.organizationId) ? $scope.organizationId : '',
            }

            function getProfileCategories() {
                profileCategoryService.getProfileCategories().then(function (data) {
                    $scope.profileCategories = data;
                })
            }

            function addProfileCategory() {
                profileCategoryService.newProfileCategory($scope.newProfileCategory).then(function (data) {
                    refreshItems(data);
                    $scope.notificationSavedSuccess.show($translate.instant('SOFTPROFILE_PROFILE_CATEGORY_SAVED_SUCCESFULLY'), "info");
                }, function (data) {
                    $scope.notificationSavedSuccess.show($translate.instant('SOFTPROFILE_ERROR_SAVING_PROFILE_CATEGORY'), "error");
                });
            }

            function refreshItems(profileLevelId) {
                profileCategoryService.getProfileCategories().then(function (data) {
                    $scope.profileCategories = data;
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

            $scope.addProfileCategory = addProfileCategory;
        }
    }
})();