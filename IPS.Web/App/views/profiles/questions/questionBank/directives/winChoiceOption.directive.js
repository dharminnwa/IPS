'use strict';

angular
    .module('ips.questions')
    .directive("winChoiceOption", function(){
    return {
        restrict: "E",
        templateUrl: 'views/profiles/questions/questionBank/directives/winChoiceOption.html'
    }
});