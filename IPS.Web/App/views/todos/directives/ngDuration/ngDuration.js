app.directive('ngDuration', ['apiService', function (apiService, $compile) {
    return {
        restrict: 'EA',
        templateUrl: 'views/todos/directives/ngDuration/ngDuration.html',
        scope: {
            ngModel: '=',
            ngProperty: '@',
            isReadonly: '=?'
        },
        replace: true,
        controller: ['$scope', '$element', '$location', '$state', function ($scope, $element, $location, $state) {

            function init(model) {
                if (model) {
                    $scope.hours = Math.floor(model[$scope.ngProperty] / 60);
                    $scope.minutes = model[$scope.ngProperty] - ($scope.hours * 60);
                }
                $scope.$watch('hours', function (newValue, oldValue) {
                    if (newValue) {
                        $scope.ngModel[$scope.ngProperty] = ($scope.hours * 60) + parseInt($scope.minutes, 10);
                    }
                    else {
                        $scope.hours = 0;
                        if ($scope.ngModel) {
                            $scope.ngModel[$scope.ngProperty] = ($scope.hours * 60) + parseInt($scope.minutes, 10);
                        }
                    }
                }, false);

                $scope.$watch('minutes', function (newValue, oldValue) {
                    if (newValue) {
                        if ($scope.ngModel) {
                            $scope.ngModel[$scope.ngProperty] = ($scope.hours * 60) + parseInt($scope.minutes, 10);
                        }
                    }
                    else {
                        $scope.minutes = 0;
                        if ($scope.ngModel) {
                            $scope.ngModel[$scope.ngProperty] = ($scope.hours * 60) + parseInt($scope.minutes, 10);
                        }
                    }
                }, false);
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

