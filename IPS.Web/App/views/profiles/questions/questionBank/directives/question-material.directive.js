'use strict';

angular
    .module('ips.questions')

    .controller('questionMaterialCtrl', ['$scope', 'dialogService', 'Upload', 'materialTypeEnum', '$translate',
        function ($scope, dialogService, Upload, materialTypeEnum, $translate) {
            $scope.materialTypes = [
                { name: $translate.instant('COMMON_IMAGE'), value: materialTypeEnum.image},
                { name: $translate.instant('COMMON_DOCUMENT'), value: materialTypeEnum.document},
                { name: $translate.instant('COMMON_AUDIO'), value: materialTypeEnum.audio},
                { name: $translate.instant('COMMON_LINK'), value: materialTypeEnum.link},
                { name: $translate.instant('COMMON_VIDEO'), value: materialTypeEnum.video}
            ];

            $scope.downloadFileUrl = webConfig.serviceBase + "api/download/questionMaterials";
            $scope.materialTypeEnum = materialTypeEnum;
            $scope.questionFileModel = null;

            $scope.onQuestionFileSelect = function ($files) {
                for (var index = 0; index < $files.length; index++) {
                    var $file = $files[index];
                    delete $scope.material.documentId;
                    Upload.upload({
                        url: webConfig.serviceBase + "api/upload/questionMaterials",
                        method: "POST",
                        file: $file
                    }).success(function (data) {
                        $scope.material.documentId = data.id;
                    }).error(function (data) {
                        dialogService.showNotification(data, 'warning');
                    });
                }
            };

            $scope.changeQuestionMaterialType = function () {
                switch (parseInt($scope.material.materialType)) {
                    case materialTypeEnum.image:
                    case materialTypeEnum.document:
                    case materialTypeEnum.video:
                    case materialTypeEnum.audio:
                        delete $scope.material.link;
                        break;
                    case materialTypeEnum.link:
                        delete $scope.material.documentId;
                        break;
                    default:
                        delete $scope.material.link;
                        delete $scope.material.documentId;
                        break;
                }
            };
        }])
    .directive('questionMaterial', [function () {
        return {
            restrict: 'E',
            templateUrl: 'views/profiles/questions/questionBank/directives/question-material.html',
            scope: {
                material: '=material'
            },
            controller: 'questionMaterialCtrl'
        };
    }]);
