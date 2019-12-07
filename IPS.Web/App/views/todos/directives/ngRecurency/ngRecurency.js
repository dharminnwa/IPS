app.directive('ngRecurency', ['apiService', function (apiService, $compile) {
    return {
        restrict: 'EA',
        templateUrl: 'views/todos/directives/ngRecurency/ngRecurency.html',
        scope: {
            ngModel: '=',
            ngProperty: '@',
            ngValue: '='
        },
        replace: true,
        controller: ['$scope', '$element', '$location', '$state', function ($scope, $element, $location, $state) {
            function onRecurrenceEditorChange() {
                $scope.ngModel[$scope.ngProperty] = $($element).find("#recurrenceEditor").data("kendoRecurrenceEditor").value();
                $scope.$apply();
            }
            $($element).find("#recurrenceEditor").kendoRecurrenceEditor({
                change: function () {
                    onRecurrenceEditorChange();
                }
            });
            function init(model) {
                if (model) {
                    if ($scope.ngModel[$scope.ngProperty]) {
                        if ($($element).find("#recurrenceEditor").data("kendoRecurrenceEditor")) {
                            $($element).find("#recurrenceEditor").data("kendoRecurrenceEditor").value($scope.ngModel[$scope.ngProperty]);
                        }
                    }
                }
            }
            $scope.init = init;
            $scope.init($scope.ngModel);
        }],
        link: function ($scope, element, attrs) {
            $scope.$watch('ngModel', function (newValue, oldValue) {
                if (newValue) {
                    $scope.init(newValue);
                }
            }, false);
        }
    }
}]);

