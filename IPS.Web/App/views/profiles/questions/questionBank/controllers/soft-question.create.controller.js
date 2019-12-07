'use strict';

angular
    .module('ips.questions')

    .controller('softQuestionNewCtrl', ['$scope', 'cssInjector', '$location', 'profileType', 'questionBankManager', 'organizations', 'skills',
        'answerTypes', 'profileTypes', 'scales', 'structureLevels', 'industries', 'authService', 'dialogService', '$controller',
        function ($scope, cssInjector, $location, profileType, questionBankManager, organizations, skills, answerTypes,
                  profileTypes, scales, structureLevels, industries, authService, dialogService, $controller) {
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
            })
        }]);