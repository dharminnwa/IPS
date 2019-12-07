"use strict";
angular.module("ips.nav", []).directive("toggleNavCollapsedMin", ["$rootScope", function ($rootScope) {
    return {
        restrict: "A",
        link: function (scope, ele) {
            var app;
            app = $("#app");
            ele.on("click", function (e) {
                if (app.hasClass("nav-collapsed-min")) {
                    app.removeClass("nav-collapsed-min");
                } else {
                    app.find('ul.in').removeClass('in');
                    app.addClass("nav-collapsed-min");
                    $rootScope.$broadcast("nav:reset");
                }
                e.preventDefault();
                return void (0);
            });

            return void (0);
        }
    }
}]).directive("highlightActive", [function () {
    return {
        restrict: "A",
        controller: ["$scope", "$element", "$attrs", "$location", function ($scope, $element, $attrs, $location) {
            var highlightActiveShow, links, path;
            $($element).find('.ips-left-navbar-item').click(function (e) {
                if ($('body.nav-collapsed-min').length == 1
                    && $(e.target).closest('li').hasClass('ips-left-navbar-item')) {
                    e.stopPropagation();
                }
            });

            return links = $element.find("a"), path = function () {
                return $location.path()
            }, highlightActiveShow = function (links, path) {
                path = "#" + path

                var hightlightParentRecursive = function (current) {
                    var itemToHighlight = current.closest('ul').closest('li');
                    itemToHighlight.addClass("active bubble");
                    if (itemToHighlight.hasClass('ips-left-navbar-item')) {
                        return;
                    } else {
                        hightlightParentRecursive(itemToHighlight);
                    }
                };

                angular.forEach(links, function (link) {
                    var $li, $link, href;

                    $link = angular.element(link);
                    $li = $link.parent("li");
                    href = ($link.attr("data-root-of") ? $link.attr("data-root-of") : $link.attr("href"));

                    // remove class active bubble if it was set
                    if (path !== '#') {
                        $li.hasClass("active bubble") && $li.removeClass("active bubble");
                    }

                    if (path === href) {
                        $li.addClass("active bubble");
                        hightlightParentRecursive($li);
                    }
                });
            }, highlightActiveShow(links, $location.path()), $scope.$watch(path, function (newVal, oldVal) {
                highlightActiveShow(links, $location.path());
            })
        }]
    }
}]).directive("toggleOffCanvas", [function () {
    return {
        restrict: "A",
        link: function (scope, ele) {
            return ele.on("click", function () {
                return $("#app").toggleClass("on-canvas")
            })
        }
    }
}]).controller("NavContainerCtrl", ["$scope", function ($scope) {

}]).controller("NavCtrl", ["$scope", /*"taskStorage",*/ "filterFilter", function ($scope, /*taskStorage,*/ filterFilter) {
    /*var tasks;
    return tasks = $scope.tasks = taskStorage.get(), $scope.taskRemainingCount = filterFilter(tasks, {
        completed: !1
    }).length, $scope.$on("taskRemaining:changed", function(event, count) {
        return $scope.taskRemainingCount = count
    })*/
    Layout.init();
}]).controller("DashboardCtrl", ["$scope", function () { }])

