'use strict';

angular
    .module('ips.questions')
    .directive("correctAnswer", function(){
        return {
            restrict: "E",
            templateUrl: 'views/profiles/questions/questionBank/directives/correct-answer.html'
        }
    });