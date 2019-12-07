(function () {
    'use strict';

    angular
        .module('ips.performance')
        .factory('bscScorecardsService', bscScorecardsService);

    bscScorecardsService.$inject = ['apiService'];

    function bscScorecardsService(apiService) {

        var scorecardData = new kendo.data.ObservableArray([]);

        var self = {

            getOrganizations: function (query) {
                return getOrganizations(query);
            },

            getProfiles: function (query) {
                return getProfiles(query);
            },

            loadScorecardData: function (profileId, userId, statusOn) {
                return loadScorecardData(profileId, userId, statusOn).then(function (data) {
                    scorecardData.splice(0, scorecardData.length);
                    if (data && data.performanceGroups) {
                        scorecardData.push.apply(scorecardData, formScorecardData(data.performanceGroups));
                    }
                }, function (message) {

                });
            },

            dataSource: function () {
                return new kendo.data.DataSource({
                    type: "json",
                    data: scorecardData,
                    pageSize: 10,
                    schema: {
                        model: {
                            id: "id",
                            fields: {
                                pgName: { type: 'string', },
                                pgScore: { type: 'number' },
                                pgTrend: { type: 'string' },
                                sName: { type: 'string', },
                                sScore: { type: 'number' },
                                sTrend: { type: 'string' },
                                qName: { type: 'string', },
                                qScore: { type: 'number' },
                                qTrend: { type: 'string' },
                            }
                        }
                    }
                });
            }
        };

        return self;

        function getOrganizations(query) {
            (query) ? '' : query = '';
            return apiService.getAll("organization?$select=Id,Name" + query);
        }

        function formScorecardData(performanceGroups) {
            var scoreCardData = [];
            goThroughPerformanceGroups(performanceGroups, scoreCardData);
            return scoreCardData;
        }

        function goThroughPerformanceGroups(performanceGroups, scoreCardData) {
            for (var i = 0, len = performanceGroups.length; i < len; i++) {
                var params = {};
                    params['pgName'] = performanceGroups[i].name;
                    params['pgScore'] = performanceGroups[i].score;
                    params['pgTrend'] = performanceGroups[i].trend;
                goThroughSkills(performanceGroups[i].skills, scoreCardData, params);
            }
        }

        function goThroughSkills(skills, scoreCardData, params) {
            for (var i = 0, len = skills.length; i < len; i++) {
                params['sName'] = skills[i].name;
                params['sScore'] = skills[i].score;
                params['sTrend'] = skills[i].trend
                goThroughQuestions(skills[i].questions, scoreCardData, params);
            }
        }

        function goThroughQuestions(questions, scoreCardData, params) {
            for (var i = 0, len = questions.length; i < len; i++) {
                var scoreDataObj = {
                    pgName: params.pgName,
                    pgScore: params.pgScore,
                    pgTrend: params.pgTrend,
                    sName: params.sName,
                    sScore: params.sScore,
                    sTrend: params.sTrend,
                    qName: questions[i].questionText,
                    qScore: questions[i].score,
                    qTrend: questions[i].trend
                }
                scoreCardData.push(scoreDataObj);
            }
        }

        function getProfiles(query) {
            (query) ? '' : query = '';
            return apiService.getAll("profiles?$select=Id,Name,OrganizationId&$expand=StageGroups($expand=EvaluationParticipants($expand=EvaluationRole))&$filter=StageGroups/any(s:s/Id gt 0)" + query);
        }

        function loadScorecardData(profileId, userId, statusOn) {
            return apiService.getAll("performance/profilescorecard/" + profileId + "/" + userId + "/" + statusOn);
        }
    }
})();