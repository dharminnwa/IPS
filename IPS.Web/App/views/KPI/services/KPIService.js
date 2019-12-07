(function () {
    'use strict';

    angular
        .module('ips.KPI', ['ui.router'])
        .factory('KPIService', KPIService);

    KPIService.$inject = ['$q', 'apiService', '$translate'];

    function KPIService($q, apiService, $translate) {

        var self = {

            getTableHeaders: getTableHeaders,

            submitKPI: function (answers) {
                return $q.when(submitKPI(answers));
            },
        };

        return self;

        function getTableHeaders() {
            var tableHead = [
                {
                    name: '#',
                    isSort: true,
                    sortBy: 'questionNo',
                    currentSort: true,
                    isHidable: false
                },
                {
                    name: $translate.instant('COMMON_SKILL'),
                    isSort: true,
                    sortBy: 'skillName',
                    currentSort: false,
                    isHidable: false
                },
                {
                    name: $translate.instant('COMMON_PERFORMANCE_GROUP'),
                    isSort: true,
                    sortBy: 'performanceGroupName',
                    currentSort: false,
                    isHidable: false
                },
                {
                    name: $translate.instant('MYPROFILES_QUESTION'),
                    isSort: true,
                    sortBy: 'question.questionText',
                    currentSort: false,
                    isHidable: false
                },
                {
                    name: $translate.instant('COMMON_SCORE'),
                    isSort: true,
                    sortBy: 'answer1',
                    currentSort: false,
                    isHidable: false
                },
                {
                    name: 'KPI',
                    isSort: true,
                    sortBy: 'kPIType',
                    currentSort: false,
                    isHidable: true
                },
                {
                    name: $translate.instant('MYPROFILES_COMMENT'),
                    isSort: false,
                    currentSort: false,
                    isHidable: true
                }
            ]

            return tableHead;
        }

        function submitKPI(answers) {
            var deferred = $q.defer();
            var apiName = 'answers';
            apiService.update(apiName, answers).then(function (data) {
                deferred.resolve(data);
            },
            function (data) {
                deferred.reject(data);
            });
            return deferred.promise;
        }
    }

})();