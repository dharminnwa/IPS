(function () {
    'use strict';

    angular
        .module('ips.activeProfiles')
        .factory('activeProfilesService', activeProfilesService);

    activeProfilesService.$inject = ['$q', 'apiService', '$state'];

    function activeProfilesService($q, apiService, $state) {

        var profiles = {};

        var self = {

            profiles: profiles,

            getProfiles: function (id, query) {
                return $q.when(getProfiles(id, query));
            },

            getActiveProfiles: function () {
                return $q.when(getActiveProfiles());
            },

            getCompletedProfiles: function () {
                return $q.when(getCompletedProfiles());
            },

            getHistoryProfiles: function () {
                return $q.when(getHistoryProfiles());
            },

            returnToPerviousPage: returnToPerviousPage,

            addPreviousStageRCT: function (profileId, stageId, participantId, evaluateeId) {
                return $q.when(addPreviousStageRCT(profileId, stageId, participantId, evaluateeId));
            },

        };

        return self;

        function getProfiles(id, query) {
            var deferred = $q.defer();
            var apiName = 'performance';
            (query) ? '' : query = '';
            apiService.getById(apiName, id, query).then(function (data) {
                profiles = {};
                profiles = data;
                deferred.resolve('success');
            },
            function (data) {
                deferred.reject(data);
            });
            return deferred.promise;
        }

        function addPreviousStageRCT(profileId, stageId, participantId, evaluateeId) {

            if (!evaluateeId) {
                evaluateeId = 0;
            }
            var deferred = $q.defer();
            var apiName = 'performance/AddPreviousStageRCT/' + profileId + '/' + stageId + '/' + participantId + '/' + evaluateeId;
            apiService.getAll(apiName).then(function (data) {
                profiles = {};
                profiles = data;
                deferred.resolve('success');
            },
            function (data) {
                deferred.reject(data);
            });
            return deferred.promise;
        }

        function getActiveProfiles() {
            var deferred = $q.defer();
            var activeProfiles = new kendo.data.ObservableArray([]);
            if (profiles) {
                activeProfiles.push.apply(activeProfiles, profiles.activeProfiles);
            }

            deferred.resolve(activeProfiles);

            return deferred.promise;
        }

        function getCompletedProfiles() {
            var deferred = $q.defer();
            var completedProfiles = new kendo.data.ObservableArray([]);;
            if (profiles) {
                completedProfiles.push.apply(completedProfiles, profiles.completedProfiles);
            }

            deferred.resolve(completedProfiles);

            return deferred.promise;
        }

        function getHistoryProfiles() {
            var deferred = $q.defer();
            var historyProfiles = new kendo.data.ObservableArray([]);;
            if (profiles) {
                historyProfiles.push.apply(historyProfiles, profiles.history);
            }

            deferred.resolve(historyProfiles);

            return deferred.promise;
        }

        function returnToPerviousPage() {
            $state.go(
                $state.$current.parent.self.name,
                null,
                { reload: true }
                );
        }
    }

})();