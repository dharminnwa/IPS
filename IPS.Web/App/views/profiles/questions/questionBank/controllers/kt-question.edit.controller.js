'use strict';

angular
    .module('ips.questions')

    .controller('ktQuestionEditCtrl', ['$scope', 'cssInjector', '$stateParams', '$location', 'profileType',
        'questionBankManager', 'question', 'organizations', 'skills', 'answerTypes', 'profileTypes', 'structureLevels',
        'industries', 'authService', 'dialogService', '$controller', 'isProfileInUse', 'materialTypeEnum', '$translate',
        function ($scope, cssInjector, $stateParams, $location, profileType, questionBankManager, question, organizations, skills,
            answerTypes, profileTypes, structureLevels, industries, authService, dialogService, $controller, isProfileInUse, materialTypeEnum, $translate) {
            $controller('baseQuestionEditCtrl',
                {
                    $scope: $scope,
                    cssInjector: cssInjector,
                    $stateParams: $stateParams,
                    $location: $location,
                    profileType: profileType,
                    questionBankManager: questionBankManager,
                    question: question,
                    organizations: organizations,
                    skills: skills,
                    answerTypes: answerTypes,
                    profileTypes: profileTypes,
                    structureLevels: structureLevels,
                    industries: industries,
                    authService: authService,
                    dialogService: dialogService,
                    isProfileInUse: isProfileInUse
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
        }]);