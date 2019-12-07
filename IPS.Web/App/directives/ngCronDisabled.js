app.directive('ngCronDisabled', [function () {
    return {
        restrict: 'A',        
        link: function ($scope, element, attrs) {
            var disabled = attrs.enabled == "false";
            if (disabled == true) {
                var innerElements = element[0].querySelectorAll('select');
                angular.forEach(innerElements, function (value, key) {
                    value.disabled = true;
                });
            }
        }
    }
}]);