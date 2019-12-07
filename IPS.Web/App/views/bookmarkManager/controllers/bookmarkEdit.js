(function () {
    'use strict';

    angular
        .module('ips.bookmarks')

        .config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
            $stateProvider
                .state('home.bookmarkManager.bookmarkEdit:bookmarkId', {
                    url: "/bookmarkEdit/:bookmarkId",
                    templateUrl: "views/bookmarkManager/views/bookmarkEdit.html",
                    controller: "bookmarkEditCtrl as bmkEdit",
                    resolve: {
                        pageName: function ($translate) {
                            return $translate.instant('COMMON_EDIT');
                        },
                        bookmark: function ($stateParams, bookmarkService) {
                            return bookmarkService.getBookmarkById($stateParams.bookmarkId).then(function (data) {
                                return data;
                            });
                        }
                    },
                    data: {
                        displayName: '{{pageName}} {{bookmark.Title}}',
                        paneLimit: 1,
                        depth: 3
                    }
                });
        }])

        .controller('bookmarkEditCtrl', bookmarkEditCtrl);

    bookmarkEditCtrl.$inject = ['bookmarkService', 'bookmark', 'dialogService', '$state', '$translate'];

    function bookmarkEditCtrl(bookmarkService, bookmark, dialogService, $state, $translate) {
        var vm = this;
        vm.bookmark = bookmark;

        function goBack() {
            history.back();
        }

        function save() {
            bookmarkService.updateBookmark(vm.bookmark).then(
                function (data) {
                    notification($translate.instant('BOOKMARKMANAGER_BOOKMARK_SAVED_SUCCESSFULLY'));
                },
                function (data) {
                    notification($translate.instant('BOOKMARKMANAGER_SAVE_BOOKMARK_FAILED'));
                })
        }

        function remove() {
            dialogService.showYesNoDialog($translate.instant('COMMON_CONFIRM'), $translate.instant('COMMON_ARE_YOU_SURE_YOU_WANT_TO_DELETE')).then(
                function () {
                    if (vm.bookmark) {
                        bookmarkService.removeBookmark(vm.bookmark.id).then(
                            function (data) {
                                $state.go($state.current, {}, { reload: true });
                                notification($translate.instant('BOOKMARKMANAGER_BOOKMARK_REMOVE_SUCCESSFULLY'));
                            },
                            function (data) {
                                notification($translate.instant('BOOKMARKMANAGER_BOOKMARK_REMOVE_FAILED'));
                            });
                    }
                },
                function () {
                });
        }

        function notification(message) {
            vm.notificationSavedSuccess.show(message, "info");
        }

        vm.goBack = goBack;
        vm.remove = remove;
        vm.save = save;
    }

})();