app.directive('trainingDiaryViewer', function () {
    return {
        restrict: 'EA',
        templateUrl: 'views/devContract/directives/training-diary-viewer.html',
        scope: {},
        replace: true,
        controller: ['$stateParams', '$element', 'globalVariables',
            function ($stateParams, $element, globalVariables) {
                var reportViewer = $($element).find('#reportViewer');
                reportViewer.empty();

                var params = {
                    ParticipantId: $stateParams.participantId,
                    TrainingMaterialsController: webConfig.trainingMaterialsController,
                    Culture: globalVariables.lang.currentCulture
                };
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
                            report: "TrainingDiary.trdx",
                            parameters: params
                        }
                    });
            }],
        link: function ($scope, element, attrs) {
        }
    }
});

