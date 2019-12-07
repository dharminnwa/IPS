'use strict';

angular.module('ips.performanceGroups')
    .controller('KTPerformanceGroupEditCtrl', ['$scope', '$location', 'authService', 'apiService', '$stateParams',
        '$window', '$rootScope', 'cssInjector', 'profilesService', 'performanceGroupsService', '$state', 'dialogService',
        'performanceGroup', 'isProfileInUse', 'industries', 'profileLevels', 'scales', 'perspectives', 'objectives', 'mainSkills',
        'organizations', 'isTemplateState', 'loadQuery', 'questions', 'trainingLevels', 'trainingTypes', 'skills', 'duration', 'exMetrics','notificationIntervals', 'questionTabService', '$controller',
        'profilesTypesEnum', 'profileTypeId',
        function ($scope, $location, authService, apiService, $stateParams, $window, $rootScope, cssInjector, profilesService,
                  performanceGroupsService, $state, dialogService, performanceGroup, isProfileInUse, industries, profileLevels, scales,
                  perspectives, objectives, mainSkills, organizations, isTemplateState, loadQuery, questions, trainingLevels,
                  trainingTypes, skills,duration,exMetrics,notificationIntervals, questionTabService, $controller, profilesTypesEnum, profileTypeId) {
            $scope.tabsTemplates = ['../app/views/performanceGroups/tabTemplates/skills.html', '../app/views/performanceGroups/tabTemplates/kt-questions.html', '../app/views/performanceGroups/tabTemplates/trainings.html', '../app/views/performanceGroups/tabTemplates/balanceScorecard.html'];
            $controller('BasePerformanceGroupEditCtrl', {
                $scope: $scope,
                $location: $location,
                authService: authService,
                apiService: apiService,
                $stateParams: $stateParams,
                $window: $window,
                $rootScope: $rootScope,
                cssInjector: cssInjector,
                profilesService: profilesService,
                performanceGroupsService: performanceGroupsService,
                $state: $state,
                dialogService: dialogService,
                performanceGroup: performanceGroup,
                isProfileInUse: isProfileInUse,
                industries: industries,
                profileLevels: profileLevels,
                scales: scales,
                perspectives: perspectives,
                objectives: objectives,
                mainSkills: mainSkills,
                organizations: organizations,
                isTemplateState: isTemplateState,
                loadQuery: loadQuery,
                questions: questions,
                trainingLevels: trainingLevels,
                trainingTypes: trainingTypes,
                skills: skills,
                duration: duration,
                exMetrics: exMetrics,
                notificationIntervals:notificationIntervals,
                questionTabService: questionTabService,
                profilesTypesEnum: profilesTypesEnum,
                profileTypeId: profileTypeId
            });
        }]);