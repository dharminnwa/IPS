﻿/// <reference path="ngReportViewer.html" />
app.directive('ngReportViewer', ['apiService', function (apiService, $compile) {
    return {
        restrict: 'EA',
        templateUrl: 'views/devContract/directives/ngReportViewer/ngReportViewer.html',
        scope: {
        
        },
        replace: true,
        controller: ['$scope', 'apiService', 'dialogService', '$stateParams', '$element', 'dialogService', '$location', '$state', 'notificationManager', '$parse', 'globalVariables', function ($scope, apiService, dialogService, $stateParams, $element, dialogService, $location, $state, notificationManager, $parse, globalVariables) {
            $($element).find('#reportViewer').empty();
            
            var apiName = 'stages/survey_info/' + $stateParams.stageId + "/" + $stateParams.evaluatorId;
            var agreementsStageId = $stateParams.stageId;
            apiService.getAll(apiName).then(function (data) {
                if (typeof data.agreements !== 'undefined' && data.agreements != null && data.agreements.length > 0) {
                    agreementsStageId = data.agreements[0].stageId;
                }
                $($element).find('#reportViewer')
                .telerik_ReportViewer({
                    serviceUrl: "/api/api/reports/",
                    templateUrl: '../../../../Scripts/kendo/Reporting-Q1-2015/Html5/ReportViewer/templates/telerikReportViewerTemplate-9.0.15.324.html',
                    reportSource: {
                        report: "DevContractReport.trdx",
                        parameters: { StageId: agreementsStageId, ParticipantId: $stateParams.evaluateeId == "null" ? $stateParams.evaluatorId : $stateParams.evaluateeId, Culture: globalVariables.lang.currentCulture }
                    }
                });
                },
                function (data) {
                });
        }],
        link: function ($scope, element, attrs) {
        }
    }
}]);

