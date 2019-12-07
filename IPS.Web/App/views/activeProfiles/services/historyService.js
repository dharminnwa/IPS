(function () {
    'use strict';

    angular
        .module('ips.activeProfiles')
        .factory('surveryHistory', surveryHistory);

    surveryHistory.$inject = ['$q', 'apiService', '$state'];

    function surveryHistory($q, apiService, $state) {

        var self = {

            returnToPerviousPage: returnToPerviousPage,

        };

        return self;

        function returnToPerviousPage() {
            $state.go(
                $state.$current.parent.self.name,
                null,
                { reload: true }
                );
        }
    }

})();