'use strict';

angular
    .module('ips.questions')

    .controller('softQuestionEditCtrl', ['$scope', 'cssInjector', '$stateParams', '$location', 'profileType',
        'questionBankManager', 'question', 'organizations', 'skills', 'answerTypes', 'profileTypes', 'structureLevels',
        'industries', 'authService', 'dialogService', '$controller', 'isProfileInUse',
        function ($scope, cssInjector, $stateParams, $location, profileType, questionBankManager, question, organizations, skills,
                  answerTypes, profileTypes, structureLevels, industries, authService, dialogService, $controller, isProfileInUse) {
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
        }]);