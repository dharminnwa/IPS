'use strict';

angular
    .module('ips.devContract')

    .config(['$stateProvider', function ($stateProvider) {
        $stateProvider
            .state('home.ktFinalKPI.devContract', {
                url: "/devContract",
                templateUrl: "views/devContract/views/kt-dev-contract.html",
                controller: "ktDevContractCtrl",
                resolve: {
                    pageName: function ($translate) {
                        return $translate.instant('COMMON_DEVELOPMENT_CONTRACT');
                    }
                },
                data: {
                    displayName: '{{pageName}}',//'Development Contract',
                    paneLimit: 1,
                    depth: 3
                }
            })
    }])

    .controller('ktDevContractCtrl', ['cssInjector', '$scope', '$stateParams', function (cssInjector) {
        cssInjector.add('views/devContract/devContract.css');
    }]);