'use strict';

angular
    .module('ips.questions')

    .controller('ktQuestionNewCtrl', ['$scope', 'cssInjector', '$location', 'profileType', 'questionBankManager', 'organizations', 'skills',
        'answerTypes', 'profileTypes', 'scales', 'structureLevels', 'industries', 'authService', 'dialogService', '$controller', 'materialTypeEnum', '$translate',
        function ($scope, cssInjector, $location, profileType, questionBankManager, organizations, skills, answerTypes,
            profileTypes, scales, structureLevels, industries, authService, dialogService, $controller, materialTypeEnum, $translate) {
            $controller('baseQuestionNewCtrl', {
                $scope: $scope,
                cssInjector: cssInjector,
                $location: $location,
                profileType: profileType,
                questionBankManager: questionBankManager,
                organizations: organizations,
                skills: skills,
                answerTypes: answerTypes,
                profileTypes: profileTypes,
                scales: scales,
                structureLevels: structureLevels,
                industries: industries,
                authService: authService,
                dialogService: dialogService
            });

            $controller('correctAnswerCtrl', {
                $scope: $scope,
                questionBankManager: questionBankManager,
                dialogService: dialogService
            });

            $scope.saveQuestion = function () {
                if (!$scope.newQuestion.secondsForQuestion && !$scope.newQuestion.minutesForQuestion) {
                    dialogService.showNotification($translate.instant('SOFTPROFILE_TIME_FOR_QUESTION_CANT_BE_ZERO'), 'warning');
                    return;
                }
                if($scope.newQuestion.questionMaterial && ($scope.newQuestion.questionMaterial.materialType == materialTypeEnum.audio
                    || $scope.newQuestion.questionMaterial.materialType == materialTypeEnum.video
                    || $scope.newQuestion.questionMaterial.materialType == materialTypeEnum.image) && !$scope.newQuestion.questionMaterial.documentId)
                {
                    dialogService.showNotification($translate.instant('SOFTPROFILE_FILE_HAS_NOT_BEEN_UPLOADED'), "warning");
                    return;
                }
                if ($scope.validateModel()) {
                    $scope.save();
                }
            };
            $scope.resetAnswer();
        }]);

