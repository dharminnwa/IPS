(function () {
    'use strict';

    angular
        .module('ips')
        .filter('uniquePerformanceGroup', uniquePerformanceGroup);

    function uniquePerformanceGroup() {
        return function (arr) {
            var r = [];
            if (typeof arr !== "undefined" && arr != null) {
                for (var i = 0, l = arr.length; i < l; i++) {
                    if (!(r.indexOf(arr[i].performanceGroup.name) > -1)) {
                        r.push(arr[i].performanceGroup.name);
                    }
                }
            }
            return r;
        };
    }
})();