(function () {
    'use strict';

    angular
        .module('ips')
        .directive('todosList', todosList);

    todosList.$inject = ['lookupService', 'todoService', 'todoManager', '$rootScope'];

    function todosList(lookupService, todoService, todoManager, $rootScope) {

        return {
            restrict: 'E',
            replace: true,
            templateUrl: 'views/home/directives/todos-list.html',
            controller: function ($scope) {

                //$scope.todos = todoService.todos;

                function reload() {
                    todoService.load().then(function (data) {

                        var ds = [];
                        angular.forEach(data, function (item, index) {
                            var event = new kendo.data.SchedulerEvent({
                                id: item.id,
                                title: item.title,
                                start: new Date(item.startDate),
                                end: new Date(item.dueDate),
                                taskCategoryListItem: item.taskCategoryListItem,
                                recurrenceRule: item.recurrenceRule,
                                buttonStyle: {
                                    'color': item.taskCategoryListItem.textColor ? item.taskCategoryListItem.textColor : "#000",
                                    'background-color': item.taskCategoryListItem.color ? item.taskCategoryListItem.color : "#000"
                                }
                            });

                            var occurrences = event.expand(kendo.parseDate(item.startDate), kendo.parseDate(item.dueDate));

                            angular.forEach(occurrences, function (item1, index1) {
                                ds.push(new kendo.data.SchedulerEvent({
                                    id: item1.id == 0 ? item1.recurrenceId : item1.id,
                                    title: item1.title,
                                    start: item1.start,
                                    end: item1.end,
                                    taskCategoryListItem: item1.taskCategoryListItem,
                                    buttonStyle: item1.buttonStyle
                                }));
                            });
                        });



                        /*angular.forEach(data, function (item, index) {
                            if (moment(item.startDate) < moment() && moment(item.dueDate) > moment()) {
                                item.start = moment(item.startDate).format("YYYY/M/D hh:mm");
                                item.end = moment(item.dueDate).format("YYYY/M/D hh:mm");
                                ds.push(new kendo.data.SchedulerEvent(item));
                            }
                        });*/

                        $scope.occurrencesToday = getOccurrences(0, ds);
                        $scope.occurrencesWeek = getOccurrences(1, ds);
                        $scope.occurrencesMonth = getOccurrences(2, ds);
                        $scope.occurrencesYear = getOccurrences(3, ds);
                    });
                };
                reload();

                $rootScope.$on('$stateChangeStart', function (event, toState, toParams) {
                    if (toState.name == 'home') {
                        reload();
                    }
                });
                
                function getOccurrences(interval, ds) {
                    var start = moment().startOf('day');
                    var end;
                    switch (interval) {
                        case 0:
                            end = moment().endOf('day');
                            break;
                        case 1:
                            end = moment().endOf('week');
                            break;
                        case 2:
                            end = moment().endOf('month');
                            break;
                        case 3:
                            end = moment().endOf('year');
                            break;
                        default:
                            end = moment().endOf('week');
                    }

                    //var occurrences = $scope.todos.expand(new Date(start.format("YYYY/M/D")), new Date(end.format("YYYY/M/D")));

                    var res = [];
                    angular.forEach(ds, function (item, index) {
                        if (moment(item.start) >= start && moment(item.start) <= end) {
                            item.start = interval == 0 ? moment(item.start).format('HH:mm') : moment(item.start).format("YYYY-MM-DD HH:mm");
                            res.push(item);
                        }
                    });

                    res.sort(function (a, b) {
                        a = kendo.parseDate(a.start);
                        b = kendo.parseDate(b.start);
                        return a < b ? -1 : a > b ? 1 : 0;
                    });

                    /*$scope.todos = new kendo.data.SchedulerDataSource({
                        data: res
                    });*
                    $scope.todos.fetch();*/

                    return res;
                }

                function getWeek(getdate) {
                    var a, b, c, d, e, f, g, n, s, w;

                    var $y = getdate.getFullYear();
                    var $m = getdate.getMonth() + 1;
                    var $d = getdate.getDate();

                    if ($m <= 2) {
                        a = $y - 1;
                        b = (a / 4 | 0) - (a / 100 | 0) + (a / 400 | 0);
                        c = ((a - 1) / 4 | 0) - ((a - 1) / 100 | 0) + ((a - 1) / 400 | 0);
                        s = b - c;
                        e = 0;
                        f = $d - 1 + (31 * ($m - 1));
                    } else {
                        a = $y;
                        b = (a / 4 | 0) - (a / 100 | 0) + (a / 400 | 0);
                        c = ((a - 1) / 4 | 0) - ((a - 1) / 100 | 0) + ((a - 1) / 400 | 0);
                        s = b - c;
                        e = s + 1;
                        f = $d + ((153 * ($m - 3) + 2) / 5) + 58 + s;
                    }

                    g = (a + b) % 7;
                    d = (f + g - e) % 7;
                    n = (f + 3 - d) | 0;

                    if (n < 0) {
                        w = 53 - ((g - s) / 5 | 0);
                    } else if (n > 364 + s) {
                        w = 1;
                    } else {
                        w = (n / 7 | 0) + 1;
                    }

                    $y = $m = $d = null;

                    return w;
                }
                /*
                $scope.isToday = function(item){
                    var dueDate = moment(item.dueDate);
                    if (moment().diff(dueDate, 'days') == 0) {
                        return true;
                    }
                    else{
                        return false;
                    }
                };

                $scope.isThisWeek = function (item) {
                    var dueDate = moment(item.dueDate);
                    var week = getWeek(dueDate.toDate())
                    var currentWeek = getWeek(moment().toDate());
                    var year = Number(dueDate.format("YYYY"));
                    var currentYear = Number(moment().format("YYYY"));

                    if ((dueDate.diff(moment(), 'days') >= 0) && (week == currentWeek) && (year == currentYear)) {
                        return true;
                    }
                    else {
                        return false;
                    }
                };

                $scope.isThisMonth = function (item) {
                    var dueDate = moment(item.dueDate);
                    var months = Number(dueDate.format("MM"));
                    var currentMonths = Number(moment().format("MM"));
                    var year = Number(dueDate.format("YYYY"));
                    var currentYear = Number(moment().format("YYYY"));

                    if ((dueDate.diff(moment(), 'days') >= 0) && (months == currentMonths) && (year == currentYear)) {
                        return true;
                    }
                    else {
                        return false;
                    }
                };

                $scope.isThisYear = function (item) {
                    var dueDate = moment(item.dueDate);
                    var year = Number(dueDate.format("YYYY"));
                    var currentYear = Number(moment().format("YYYY"));

                    if ((dueDate.diff(moment(), 'days') >= 0) && (year == currentYear)) {
                        return true;
                    }
                    else {
                        return false;
                    }
                };

                $scope.compleated = function (item) {
                    item.isCompleted = !item.isCompleted;
                    todoManager.isCompleted(item.id, item.isCompleted).then(function (data) {

                    });
                }*/
            }
        }
    }
})();
