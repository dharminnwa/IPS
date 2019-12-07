'use strict';

angular
    .module('ips.performanceGroups')
    .controller('ktQuestionTabCtrl', ['$scope', '$controller', 'dialogService', 'materialTypeEnum', '$translate',
        function ($scope, $controller, dialogService, materialTypeEnum, $translate) {
            $controller('baseQuestionTabCtrl', {
                $scope: $scope,
                profileTypeId: 5
            });

            $controller('correctAnswerCtrl', {
                $scope: $scope
            });

            $scope.createQuestion = function () {
                if (!$scope.newQuestion.secondsForQuestion && !$scope.newQuestion.minutesForQuestion) {
                    dialogService.showNotification($translate.instant('SOFTPROFILE_TIME_FOR_QUESTION_CANT_BE_ZERO'), 'warning');
                    return;
                }
                if($scope.newQuestion.questionMaterial
                    && ($scope.newQuestion.questionMaterial.materialType == materialTypeEnum.audio
                    || $scope.newQuestion.questionMaterial.materialType == materialTypeEnum.video
                    || $scope.newQuestion.questionMaterial.materialType == materialTypeEnum.image) && !$scope.newQuestion.questionMaterial.documentId)
                {
                    dialogService.showNotification($translate.instant('SOFTPROFILE_FILE_HAS_NOT_BEEN_UPLOADED'), "warning");
                    return;
                }
                if ($scope.validateModel()) {
                    $scope.addNewQuestion();
                }
            };

            $scope.resetAnswer();
        }]);