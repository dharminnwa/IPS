(function () {
    'use strict';

    angular
        .module('ips.devContract', ['ui.router', 'kendo.directives', 'growing-panes'])
        .factory('devContractService', devContractService);

    devContractService.$inject = ['$q', 'apiService'];

    function devContractService($q, apiService) {

        var self = {
            //getOrganizations: function () {
            //    return $q.when(getOrganizations());
            //},
            
        };

        return self;

        //function getOrganizations() {
        //    var deferred = $q.defer();
        //    apiService.getAll("organization?$orderby=Name&$select=Name,Id").then(function (data) {
        //        deferred.resolve(data);
        //    },
        //    function (data) {
        //        deferred.reject(data);
        //    });
        //    return deferred.promise;
        //};
       
    }

})();