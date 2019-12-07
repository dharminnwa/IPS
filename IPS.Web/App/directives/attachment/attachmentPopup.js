'use strict';

angular
    .module('ips')

    .controller('attachmentPopupCtrl', ['$scope', 'dialogService', 'Upload', '$translate', 'globalVariables', 'attachmentService', 'localStorageService',
        function ($scope, dialogService, Upload, $translate, globalVariables, attachmentService, localStorageService) {
            $scope.newAttachmentWindow;
            $scope.uploadedAttachmentFiles = [];
            $scope.attachmentInfo = {
                id: 0,
                title: null,
                description: null,
                ipsAttachmentUsers: [],
                ipsAttachmentFileDetails: [],
            }
            var authData = localStorageService.get('authorizationData');
            $scope.currentUser = null;
            if (authData) {
                $scope.currentUser = authData.user;
            }
            $scope.selectedUsers = []
            $scope.toUsersOptions = {
                placeholder: "Users",
                dataTextField: "firstName",
                template: "#=firstName# #=lastName#",
                dataValueField: "id",
                valuePrimitive: true,
                autoBind: false,
                dataSource: {
                    type: "json",
                    transport: {
                        read: function (options) {
                            attachmentService.GetUsersList().then(function (data) {
                                $scope.organizationUsers = [];
                                var authData = localStorageService.get('authorizationData');
                                $scope.currentUser = null;
                                if (authData) {
                                    $scope.currentUser = authData.user;
                                }
                                _.each(data, function (item) {
                                    if (item.email != null && $scope.currentUser != null) {
                                        if (!($scope.currentUser.email == item.email)) {
                                            $scope.organizationUsers.push(item);
                                        }
                                    }
                                });
                                options.success(_.uniq($scope.organizationUsers));
                            })
                        }
                    }
                }
            }
            moment.locale(globalVariables.lang.currentUICulture);

            $scope.closeAttachment = function () {
                $scope.selectedUsers = [];
                $scope.openAttachmentPopupMode.isOpenNewAttachmentPopup = false;
            }

            $scope.newAttachment = function () {
                $scope.ipsAttachmentFile = { fileName: "" };
                $scope.ipsAttachmentFile.id = 0;
                $scope.winAttachment.open().center();
            };
            $scope.onFileSelect = function ($files) {
                for (var i = 0; i < $files.length; i++) {
                    var $file = $files[i];
                    (function (index) {
                        $scope.upload[index] = Upload.upload({
                            url: "../api/api/upload/userAttachments",
                            method: "POST",
                            file: $file
                        }).progress(function (evt) {
                            console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));
                        }).success(function (data) {
                            (data) ? $scope.ipsAttachmentFile.fileName = data : '';
                        }).error(function (data) {
                            dialogService.showNotification(data, 'warning');
                        });
                    })(i);
                }
            };
            $scope.onUserAssignGridDataBound = function (e) {
                var grid = e.sender;
                if (grid.dataSource.total() == 0) {
                    var colCount = grid.columns.length;
                    $(e.sender.wrapper)
                        .find('tbody')
                        .append('<tr class="kendo-data-row"><td colspan="' + colCount + '" class="no-data">There is no data to show in the grid.</td></tr>');
                }
            };
            $scope.getOptions = function () {
                return {
                    dataBound: $scope.onUserAssignGridDataBound,
                    dataSource: new kendo.data.DataSource({
                        type: "json",
                        data: $scope.uploadedAttachmentFiles,
                        schema: {
                            model: {
                                id: "id",
                                fields: {
                                    id: { type: 'number', },
                                    fileName: { type: 'string' },
                                }
                            }
                        }
                    }),
                    columnMenu: false,
                    filterable: true,
                    sortable: true,
                    pageable: true,
                    resizable: true,
                    columns: [
                        {
                            field: "fileName", title: $translate.instant('COMMON_TITLE'), width: "100px"
                        },

                    ]
                };
            };
            $scope.saveAttachmentFile = function () {
                $scope.winAttachment.close();
                $scope.uploadedAttachmentFiles.push(angular.copy($scope.ipsAttachmentFile));

                var kendoGrid = $("#ipsAttachmentFilesGrid").data("kendoGrid")
                if (kendoGrid) {
                    kendoGrid.setOptions($scope.getOptions());
                }

            };
            $scope.cancelAttachmentFile = function () {
                $scope.winAttachment.close();
            };


            $scope.saveAttachmentInfo = function () {
                $scope.attachmentInfo.ipsAttachmentFileDetails = $scope.uploadedAttachmentFiles;
                _.each($scope.selectedUsers, function (userItem) {
                    $scope.attachmentInfo.ipsAttachmentUsers.push({ userId: userItem });
                })
                attachmentService.Save($scope.attachmentInfo).then(function (data) {
                    if (data > 0) {
                        dialogService.showNotification("Attachment added sucessfully", "info");
                        $scope.closeAttachment();
                    }
                })
            }
            $scope.$on("kendoRendered", function (event) {
                if (event.targetScope.newAttachmentWindow) {
                    $scope.newAttachmentWindow = event.targetScope.newAttachmentWindow;
                }
                if (event.targetScope.winAttachment) {
                    $scope.winAttachment = event.targetScope.winAttachment;
                }
            });
            $scope.$watch('openAttachmentPopupMode.isOpenNewAttachmentPopup', function (newValue, oldValue) {
                if ($scope.newAttachmentWindow) {
                    $scope.selectedUsers = [];
                    if ($scope.openAttachmentPopupMode.isOpenNewAttachmentPopup) {
                        $scope.newAttachmentWindow.open().center();
                        if ($scope.userId) {
                            $scope.selectedUsers.push($scope.userId);
                            var x = $("#toUsers").data("kendoMultiSelect");
                            if (x) {
                                if (!($scope.organizationUsers.length > 0)) {
                                    x.dataSource.read();
                                }
                            }
                        }
                    }
                    else {
                        $scope.openAttachmentPopupMode.isOpenNewAttachmentPopup = false;
                        $scope.newAttachmentWindow.close();
                    }
                }
            });

        }])

    .directive('attachmentPopup', [function () {
        return {
            restrict: 'E',
            templateUrl: 'directives/attachment/attachmentPopup.html',
            scope: {
                userId: '=',
                openAttachmentPopupMode: '='
            },
            controller: 'attachmentPopupCtrl'
        };
    }]);