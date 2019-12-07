(function () {
    'use strict';

    angular
        .module('ips.devContract')

        .config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
            $stateProvider
                .state('home.finalKPI.devContract', {
                    url: "/devContract",
                    templateUrl: "views/devContract/views/devContract.html",
                    controller: "devContractCtrl as devContract",
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
                .state('home.previewFinalKPI.devContract', {
                    url: "/devContract",
                    templateUrl: "views/devContract/views/devContract.html",
                    controller: "devContractCtrl as devContract",
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
                .state('home.previewFinalKPI.rctContract', {
                    url: "/rctContract",
                    templateUrl: "views/devContract/views/rctContract.html",
                    controller: "devContractCtrl as devContract",
                    resolve: {
                        pageName: function ($translate) {
                            return $translate.instant('MYPROFILES_RCT_CONTRACT');
                        }
                    },
                    data: {
                        displayName: '{{pageName}}',//'RCT Contract',
                        paneLimit: 1,
                        depth: 3
                    }
                });
        }])

        .controller('devContractCtrl', devContractCtrl);
    devContractCtrl.$inject = ['cssInjector', '$stateParams', '$state'];
    function devContractCtrl(cssInjector, $stateParams, $location, $state) {
        //cssInjector.removeAll();
        cssInjector.add('views/devContract/devContract.css');
        var vm = this;

        function init() {

        }

        init();

    }

})();