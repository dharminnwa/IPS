(function () {
    'use strict';

    angular
        .module('ips.bookmarks')

    .config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
        $stateProvider
            .state('home.bookmarkManager', {
                url: "/bookmarkManager",
                templateUrl: "views/bookmarkManager/views/bookmarkManager.html",
                controller: "bookmarkManagerCtrl as bmkManager",
                resolve: {
                    pageName: function ($translate) {
                        return $translate.instant('BOOKMARKMANAGER_BOOKMARK_MANAGER');
                    },
                    bookmarks: function (bookmarkService) {
                        return bookmarkService.getBookmarks().then(function (data) {
                            return data;
                        });
                    }
                },
                data: {
                    displayName: '{{pageName}}',//'Bookmark manager',
                    paneLimit: 1,
                    depth: 2
                }
            });
    }])

    .controller('bookmarkManagerCtrl', bookmarkManagerCtrl);

    bookmarkManagerCtrl.$inject = ['$scope', 'cssInjector', '$location', '$state', 'dialogService', 'bookmarkService', 'bookmarks', '$translate'];

    function bookmarkManagerCtrl($scope, cssInjector, $location, $state, dialogService, bookmarkService, bookmarks, $translate) {
        var vm = this;

        function removeBookmark(id) {
            dialogService.showYesNoDialog($translate.instant('COMMON_CONFIRM'), $translate.instant('COMMON_ARE_YOU_SURE_YOU_WANT_TO_DELETE')).then(
            function () {
                bookmarkService.removeBookmark(id).then(function (data) {
                    $state.go($state.current, {}, { reload: true });
                })

                notification($translate.instant('BOOKMARKMANAGER_BOOKMARK_REMOVE_SUCCESSFULLY'));
            },
            function () {
                notification($translate.instant('BOOKMARKMANAGER_BOOKMARK_REMOVE_FAILED'));
            });
        }

        function goBack() {
            history.back();
        }

        function editBookmark(id) {
            $location.path("/home/bookmarkManager/bookmarkEdit/" + id);
        }

        function notification(message) {
            vm.notificationSavedSuccess.show(message, "info");
        }

        vm.editBookmark = editBookmark;
        vm.removeBookmark = removeBookmark;

        vm.goBack = goBack;

        vm.gridOptions = {
            dataSource: {
                type: "json",
                transport: {
                    read: function (options) {
                        options.success(bookmarks);
                    }
                },
                sort: {
                    field: "name",
                    dir: "asc"
                },
                pageSize: 10,
            },
            pageable: true,
            selectable: false,
            sortable: true,
            columns: [
                { field: "title", title: $translate.instant('COMMON_TITLE'), width: '30%' },
                { field: "url", title: $translate.instant('COMMON_URL'), width: '30%' },
                { field: "seqNo", title: $translate.instant('BOOKMARKMANAGER_SEQUENCE_NUMBER'), width: '30%' },
                {
                    field: "", title: "", width: '30%', template: "<div class='icon-groups'>" +
                        "<a class='icon-groups icon-groups-item edit-icon' ng-click='bmkManager.editBookmark(dataItem.id)'></a></div>" +
                        "<div class='icon-groups'><a class='icon-groups icon-groups-item remove-icon' ng-click='bmkManager.removeBookmark(dataItem.id)' ></a>" +
                        "</div>",
                },
            ]
        };
    }

})();