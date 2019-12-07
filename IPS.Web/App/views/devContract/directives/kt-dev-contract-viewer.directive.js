app.directive('ktDevContractViewer', function () {
    return {
        restrict: 'EA',
        templateUrl: 'views/devContract/directives/kt-dev-contract-viewer.html',
        scope: {},
        replace: true,
        controller: ['$stateParams', '$element', 'globalVariables',
            function ($stateParams, $element, globalVariables) {
                var reportViewer = $($element).find('#reportViewer');
                reportViewer.empty();

                var params = { ParticipantId: $stateParams.participantId, Culture: globalVariables.lang.currentCulture};
                if ($stateParams.stageId && $stateParams.stageId != 'null') {
                    params.StageId = $stateParams.stageId;
                }
                if ($stateParams.stageEvolutionId && $stateParams.stageEvolutionId != 'null') {
                    params.StageEvolutionId = $stateParams.stageEvolutionId;
                }
                reportViewer
                    .telerik_ReportViewer({
                        serviceUrl: "/api/api/reports/",
                        templateUrl: webConfig.reportViewerTemplate,
                        reportSource: {
                            report: "KTDevContractReport.trdx",
                            parameters: params
                        }
                    });
            }],
        link: function ($scope, element, attrs) {
        }
    }
});

