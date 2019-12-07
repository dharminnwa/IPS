(function () {
    'use strict';

    angular
        .module('ips.stages')
        .factory('stagesService', stagesService);

    stagesService.$inject = ['$q', 'apiService', '$state'];

    function stagesService($q, apiService, $state) {

        var allStages = new kendo.data.ObservableArray([]);

        var self = {

            allStages: allStages,

            getStages: function (query) {
                return $q.when(getStages(query));
            },

            getStageById: function(id, query){
                return $q.when(getStageById(id, query));
            },

            addNewStage: function(stageInfo){
                return $q.when(addNewStage(stageInfo));
            },

            updateStage: function (stageInfo) {
                return $q.when(updateStage(stageInfo));
            },

            removeStage: function (id) {
                return $q.when(removeStage(id));
            },

            returnToPerviousPage: returnToPerviousPage,

        };

        return self;

        function getStages(query) {
            var deferred = $q.defer();
            var apiName = 'stageGroups';
            (query) ? '' : query = '';
            apiService.getAll(apiName, query).then(function (data) {
                allStages.splice(0, allStages.length);
                allStages.push.apply(allStages,data)
                deferred.resolve('success');
            },
            function (data) {
                deferred.reject(data);
            });
            return deferred.promise;
        }

        function getStageById(id, query) {
            var deferred = $q.defer();
            var apiName = 'stageGroups';
            (query) ? '' : query = '';
            apiService.getById(apiName, id, query).then(function (data) {
                deferred.resolve(data);
            },
            function (data) {
                deferred.reject(data);
            });
            return deferred.promise;
        } 

        function addNewStage(stageInfo) {
            var deferred = $q.defer();
            var apiName = 'stageGroups';
            apiService.add(apiName, stageInfo).then(function (data) {
                deferred.resolve(data);
            },
            function (data) {
                deferred.reject(data);
            });
            return deferred.promise;
        }

        function updateStage(stageInfo) {
            var deferred = $q.defer();
            var apiName = 'stageGroups';
            apiService.update(apiName, stageInfo).then(function (data) {
                deferred.resolve(data);
            },
            function (data) {
                deferred.reject(data);
            });
            return deferred.promise;
        }

        function removeStage(id) {
            var deferred = $q.defer();
            var apiName = 'stageGroups';
            apiService.remove(apiName, id).then(function (data) {
                deferred.resolve(data);
            },
            function (data) {
                deferred.reject(data);
            });
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