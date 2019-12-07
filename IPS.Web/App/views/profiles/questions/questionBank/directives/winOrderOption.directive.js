'use strict';

angular
    .module('ips.questions')
    .directive("winOrderOption", function(){
        return {
            restrict: "E",
            templateUrl: 'views/profiles/questions/questionBank/directives/winOrderOption.html'
        }
    });