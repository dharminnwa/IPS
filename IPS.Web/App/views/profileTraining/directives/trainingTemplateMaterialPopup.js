angular
       .module('ips.profiles')
.directive('trainingTemplateMaterialPopup', ['$compile', '$sce', function ($compile, $sce) {
    return {
        restrict: 'E',
        templateUrl: 'views/profileTraining/directives/trainingMaterialContent.html',
        scope: {
            materialInfo: '=?',
        },
        controller: function ($scope, $compile, $sce, apiService, dialogService) {
            $scope.ratings = [
            { value: 1, background: "#f00" },
            { value: 2, background: "#ff0" },
            { value: 3, background: "#0f3" },
            { value: 4, background: "#06f" },
            { value: 5, background: "#f99" },
            ];
            $scope.materialInfo.link = $sce.trustAsResourceUrl($scope.materialInfo.link);
        }
    };
}])