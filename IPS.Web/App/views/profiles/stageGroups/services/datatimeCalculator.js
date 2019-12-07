(function () {
    'use strict';

    angular
        .module('ips')
        .factory('datetimeCalculator', datetimeCalculator);

    datetimeCalculator.$inject = [];

    function datetimeCalculator() {
        var self = {
            shiftStageDates: shiftStageDates,

            shiftStageDatesReversed: shiftStageDatesReversed,

            checkEndLimit: checkEndLimit,

            checkStartLimit: checkStartLimit,

            adjustStageTime: adjustStageTime,

            getTimeDifference: getTimeDifference,

            isFirstDateEarlier: isFirstDateEarlier,

            isValidDatePatern: isValidDatePatern
        };

        return self;

        function shiftStageDates(stages, difference, checkParams, startFrom) {
            if (!checkParams) {
                var checkParams = ['startDateTime', 'endDateTime', 'greenAlarmTime', 'redAlarmTime', 'yellowAlarmTime'];
            }
            (!startFrom) ? startFrom = 0 : '';
            if (stages && stages.length > 0 && difference) {
                for (var i = startFrom, len = stages.length; i < len; i++) {
                    adjustStageTime(stages[i], difference, checkParams);
                }
            }
        }

        function shiftStageDatesReversed(stages, difference, checkParams, startFrom) {
            if (!checkParams) {
                var checkParams = ['startDateTime', 'endDateTime', 'greenAlarmTime', 'redAlarmTime', 'yellowAlarmTime'];
            }
            (!startFrom) ? startFrom = 0 : '';
            if (stages && stages.length > 0 && difference) {
                for (var i = startFrom; i >= 0 ; i--) {
                    adjustStageTime(stages[i], difference, checkParams);
                }
            }
        }

        function checkEndLimit(stageGroupData, stage) {
            if (stageGroupData && stageGroupData.endDate && stage.endDateTime) {
                if (isFirstDateEarlier(stageGroupData.endDate, stage.endDateTime)) {
                    var newDate = moment(stage.endDateTime);
                    newDate.add(1, 'd');
                    stageGroupData.endDate = newDate.format('L');
                }
            }
        }

        function checkStartLimit(stageGroupData, stage) {
            if (stageGroupData && stageGroupData.startDate && stage.startDateTime) {
                if (!isFirstDateEarlier(stageGroupData.startDate, stage.startDateTime)) {
                    var newDate = moment(stage.startDateTime);
                    newDate.add(-1, 'd');
                    stageGroupData.startDate = newDate.format('L');
                }
            }
        }

        function adjustStageTime(stage, difference, checkParams) {
            for (var object in stage) {
                for (var i = 0, len = checkParams.length; i < len; i++) {
                    if (object == checkParams[i]) {
                        var date = moment(stage[object]);
                        date.add(difference, 'minutes');
                        stage[object] = date.format('L LT');
                    }
                }
            }
        }

        function getTimeDifference(firstDate, secondDate, measure) {
            (measure) ? '' : measure = 'minutes';
            var first = moment(firstDate);
            var second = moment(secondDate);
            return first.diff(second, measure);
        }

        function isFirstDateEarlier(firstDate, secondDate) {
            return (getTimeDifference(firstDate, secondDate) < 0);
        }

        function isValidDatePatern(date, patern) {
            return moment(date, patern, true).isValid();
        }
    }

})();