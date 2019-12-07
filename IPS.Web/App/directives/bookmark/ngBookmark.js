(function () {
    'use strict';

    angular
        .module('ips')
        .directive('ngBookmark', ngBookmark);

    ngBookmark.$inject = ['bookmarkService', '$location', 'authService', '$translate'];

    function ngBookmark(bookmarkService, $location) {

        var directive = {
            restrict: 'E',
            scope:{},
            templateUrl: 'directives/bookmark/views/bookmarkView.html',
            controller: bookmarkController,
            controllerAs: 'bookmark',
        };

        return directive;

        function bookmarkController($scope, bookmarkService, $location, authService, $translate) {
            var vm = this;
            vm.bookmarks;
            vm.isShow = true;
            vm.bookmarksToDisplay = [];
            vm.dropDownbookmarks = [];
            vm.requestQuery = '?$orderby=SeqNo,Title desc';
            vm.newBookmark = {
                seqNo: 0,
                title: $translate.instant('BOOKMARKMANAGER_NEW_BOOKMARK'),
                url: $location.path(),
                userId: parseInt(authService.authentication.user.userId)
            }

            function getBookmarks() {
                if (authService.authentication.isAuth) {
                    bookmarkService.getBookmarks(vm.requestQuery).then(function (data) {
                        clearBookmarks();
                        vm.bookmarks = data;
                        initializeDisplayBookmarks();
                    })
                }
                else {
                    clearBookmarks();
                }
                
            }

            function addNewBookmark() {
                vm.newBookmark.url = $location.path();
                bookmarkService.newBookmark(vm.newBookmark).then(function (data) {
                    bookmarkService.getBookmarks(vm.requestQuery).then(function (data) {
                        clearBookmarks();
                        vm.bookmarks = data;
                        initializeDisplayBookmarks();
                        notification($translate.instant('BOOKMARKMANAGER_BOOKMARK_ADDED_SUCCESSFULLY'));
                    },
                    function () {
                        notification($translate.instant('BOOKMARKMANAGER_BOOKMARK_ADD_FAILED'));
                    })
                });
            }

            function clearBookmarks() {
                (vm.bookmarks && vm.bookmarks.length > 0) ? vm.bookmarks.splice(0, vm.bookmarks.length) : '';
                (vm.bookmarksToDisplay && vm.bookmarksToDisplay.length > 0) ? vm.bookmarksToDisplay.splice(0, vm.bookmarksToDisplay.length) : '';
                (vm.dropDownbookmarks && vm.dropDownbookmarks.length > 0) ? vm.dropDownbookmarks.splice(0, vm.dropDownbookmarks.length) : '';
            }

            function isCurrentPageBookmark() {
                if (vm.bookmarks) {
                    var finded = getByNestedId($location.path(), vm.bookmarks, 'url');
                    return (finded) ? true : false;
                }

                return false;
            }

            function initializeDisplayBookmarks() {
                if (vm.bookmarks) {
                    for (var i = 0, len = vm.bookmarks.length; i < len; i++) {
                        if (i < 10) {
                            vm.bookmarksToDisplay.push(vm.bookmarks[i]);
                        } else {
                            vm.dropDownbookmarks.push(vm.bookmarks[i]);
                        }
                    }
                }
            }

            function getByNestedId(id, myArray, searchParam) {
                (!searchParam) ? searchParam = 'id' : '';
                return myArray.filter(function (obj) {
                    if (obj) {
                        var founded = index(obj, searchParam);
                        if (founded == id) {
                            return obj
                        }
                    }
                })[0]
            }

            function index(obj, is, value) {
                if (typeof is == 'string')
                    return index(obj, is.split('.'), value);
                else if (is.length == 1 && value !== undefined)
                    return obj[is[0]] = value;
                else if (is.length == 0)
                    return obj;
                else if (obj[is[0]]) {
                    return index(obj[is[0]], is.slice(1), value);
                }
            }

            function selectFromBookmarkList() {
                if (vm.selectedBookmark && vm.selectedBookmark.url) {
                    goToBookmark(vm.selectedBookmark.url);
                    vm.selectedBookmark = null;
                }
            }

            function goToBookmark(url) {
                $location.path(url);
            }

            function notification(message) {
                vm.notificationSavedSuccess.show(message, "info");
            }

            function isBookmarked() {
                return (isCurrentPageBookmark()) ? 'bookmarked' : '';
            }

            function goToManager() {
                $location.path("/home/bookmarkManager");
            }

            $scope.$location = $location;

            $scope.$watch('$location.path()', function (newValue) {
                if(newValue == '/login'){
                    vm.isShow = false;
                }
                else {
                    vm.isShow = true;
                    getBookmarks();
                }
            });

            vm.addNewBookmark = addNewBookmark;
            vm.selectFromBookmarkList = selectFromBookmarkList;
            vm.goToBookmark = goToBookmark;
            vm.goToManager = goToManager;
            vm.isBookmarked = isBookmarked;
        }
    }
})();