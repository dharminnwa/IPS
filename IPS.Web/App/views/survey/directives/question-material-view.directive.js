'use strict';

angular
    .module('ips.survey')

    .controller('questionMaterialViewCtrl', ['$scope', 'materialTypeEnum', '$sce',
        function ($scope, materialTypeEnum, $sce) {
            $scope.$sce = $sce;
            this.config = {
                preload: "none",
                tracks: [],
                theme: {
                    url: "http://www.videogular.com/styles/themes/default/latest/videogular.css"
                },
                plugins: {
                    controls: {
                        autoHide: true,
                        autoHideTime: 5000
                    }
                }
            };
            $scope.materialTypeEnum = materialTypeEnum;
            $scope.downloadFileUrl = webConfig.serviceBase + "api/download/questionMaterials";
        }])
    .directive('questionMaterialView', [function () {
        return {
            restrict: 'E',
            templateUrl: 'views/survey/directives/question-material-view.html',
            scope: {
                material: '=material'
            },
            controller: 'questionMaterialViewCtrl'
        };
    }]);