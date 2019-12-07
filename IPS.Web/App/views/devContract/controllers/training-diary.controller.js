'use strict';

angular
    .module('ips.devContract')

    .config(['$stateProvider', function ($stateProvider) {
        $stateProvider
            .state('home.ktFinalKPI.trainingDiary', {
                url: "/trainingDiary",
                templateUrl: "views/devContract/views/training-diary.html",
                controller: "trainingDiaryCtrl",
                resolve: {
                    pageName: function ($translate) {
                        return $translate.instant('LEFTMENU_TRAINING_DIARY');
                    }
                },
                data: {
                    displayName: '{{pageName}}',//'Training Diary',
                    paneLimit: 1,
                    depth: 3
                }
            })
    }])

    .controller('trainingDiaryCtrl', ['cssInjector', '$scope', '$stateParams', function (cssInjector) {
        cssInjector.add('views/devContract/training-diary.css');
    }]);