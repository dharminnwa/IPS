(function () {
    'use strict';

    angular
        .module('ips.measureUnits')

    .config(configuration)

    function configuration($stateProvider) {
        var baseMeasureUnitResolve = {
            pageName: function ($translate) {
                return $translate.instant('LEFTMENU_MEASURE_UNITS');
            }
        };
        $stateProvider
            .state('home.profiles.soft.measureUnits', {
                url: "/measureUnits",
                templateUrl: "views/measureUnits/views/measureUnits.html",
                controller: "measureUnitsCtrl as mUnits",
                resolve: baseMeasureUnitResolve,
                data: {
                    displayName: '{{pageName}}',//'Measure Units',
                    paneLimit: 1,
                    depth: 3,
                    resource: "Measure Units"
                }
            })
    }

    configuration.$inject = ['$stateProvider'];

})();