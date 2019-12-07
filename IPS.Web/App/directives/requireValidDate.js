(function () {
    "use strict";

    function getValidator(controller, $scope) {
        var _controller = controller;

        function isValidDate(date) {
            var dateAsMoment = moment(kendo.parseDate(date), "L");
            var minMoment = moment($scope.model.minDate, "L");
            var today = moment(new Date());

            console.log("checking validity: " + date + ": " + $scope.model.minDate);

            if (dateAsMoment.isValid() && dateAsMoment.isAfter(minMoment, "day")) {
                if ($scope.model.laterThanToday)
                {
                    if (dateAsMoment.isAfter(today, "day")) 
                        return true;
                }
                else
                    return true;
            }

            return false;
        }

        function validate(value) {
            var valid = isValidDate(value);

            _controller.$setValidity('invalidDate', valid);

            return valid ? value : undefined;
        }

        return validate;
    }

    var directive = function () {
        function link($scope, element, attributes, controller) {
            var validator = getValidator(controller, $scope);

            $scope.$watch(function (scope) { return scope.model.minDate; }, function (value) {
                if (value != undefined) {
                    validator = getValidator(controller, $scope);
                    controller.$$parseAndValidate();
                }
            });

            controller.$parsers.unshift(validator);

            controller.$formatters.unshift(validator);
        }

        return {
            restrict: "A",
            link: link,
            require: 'ngModel',
            scope: {
                model: "=requireValidDate"
            }
        };
    };

    angular.module("ips").directive("requireValidDate", [directive]);
}());