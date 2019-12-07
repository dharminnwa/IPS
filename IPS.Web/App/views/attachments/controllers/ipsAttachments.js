angular.module('ips.attachments')
    .config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
        var baseAttachmensResolve = {
            attachments: function (ipsAttachmentsManager) {
                return ipsAttachmentsManager.getUserAttachments().then(function (data) {
                    return data;
                });
            },
            pageName: function ($translate) {
                return $translate.instant('ALL_ATTACHMENTS');//'All attachments';
            },
        };

        var baseAttachmenViewResolve = {
            attachment: function (ipsAttachmentsManager, $stateParams) {
                return ipsAttachmentsManager.getAttachmentById($stateParams.id).then(function (data) {
                    return data;
                });
            },
            pageName: function ($translate) {
                return $translate.instant('ALL_ATTACHMENTS');//'All attachments';
            },
        };

        $stateProvider
            .state('attachments', {
                url: "/attachments",
                templateUrl: "views/attachments/views/attachments.html",
                controller: "attachmentListCtrl",
                resolve: baseAttachmensResolve,
                data: {
                    displayName: '{{pageName}}',
                    resource: "Attachment"
                }
            })

            .state('viewattachment', {
                url: "/viewattachment/:id",
                templateUrl: "views/attachments/views/viewAttachment.html",
                controller: "attachmentCtrl",
                resolve: baseAttachmenViewResolve,
                data: {
                    displayName: '{{pageName}}',
                    resource: "Attachment"
                }
            })
    }])
    .controller('attachmentListCtrl', ['$scope', '$location', '$compile', 'cssInjector', 'attachments', '$translate',
        function ($scope, $location, $compile, cssInjector, attachments, $translate) {
            cssInjector.removeAll();
            //cssInjector.add('css/components.min.css');
            //cssInjector.add('css/default.min.css');
            cssInjector.add('views/attachments/attachments.css');
            $scope.attachments = new kendo.data.ObservableArray([]); //attachments;
            _.each(attachments, function (attachmentItem) {
                $scope.attachments.push(attachmentItem);
            })
            $scope.dataSource = function () {
                return new kendo.data.DataSource({
                    type: "json",
                    data: $scope.attachments,
                    pageSize: 10,
                    schema: {
                        model: {
                            id: "id",
                            fields: {
                                id: { type: 'number', },
                                title: { type: 'string' },
                                description: { type: 'string' },
                                createdOn: { type: 'datetime' },
                            }
                        }
                    },
                    //sort: { field: "createdOn", dir: "desc" },
                });
            };

            $scope.viewAttachment = function (id) {
                $location.path("/viewattachment/" + id);
            }

            $scope.loadattachmentsGrid = function () {
                if ($("#attachmentsGrid").data("kendoGrid")) {
                    $("#attachmentsGrid").kendoGrid("destroy");
                    $("#attachmentsGrid").html("");
                }
                $("#attachmentsGrid").kendoGrid({
                    dataBound: function (e) {
                        var rows = this.items();
                        var items = this.dataSource.view();
                        $(rows).each(function () {
                            var index = $(this).index() + 1;
                            var item = items[$(this).index()];
                            if (!item.isRead) {
                                $(this).addClass("bold");
                            }
                            var rowLabel = $(this).find(".row-number");
                            $(rowLabel).html(index);
                        });
                    },
                    dataSource: $scope.dataSource(),
                    filterable: {
                        extra: false,
                        operators: {
                            string: {
                                eq: "Is equal to",
                                startswith: "Start With"
                            }
                        }
                    },
                    pageable: true,
                    selectable: true,
                    sortable: true,
                    columns: [
                        { field: 'rowNumber', title: "#", template: "<span class='row-number'></span>", filterable: false, sortable: false, width: "50px" },
                        {
                            field: "title", title: $translate.instant('COMMON_TITLE')
                        },
                        { field: "description", title: $translate.instant('COMMON_DESCRIPTION') },
                        {
                            field: "createdOn", title: $translate.instant('COMMON_CREATEDON'), filterable: false,
                            template: function (dataItem) {
                                return moment(kendo.parseDate(dataItem.createdOn)).format("L LT");
                            }
                        },
                        {
                            field: "id", title: "# of files", filterable: false,
                            template: function (dataItem) {
                                return dataItem.ipsAttachmentFileDetails.length;
                            }
                        },
                        {
                            field: "", sortable: false, filterable: false, title: $translate.instant('COMMON_ACTIONS'), template: function (dataItem) {
                                return "<div class='icon-groups'>" +
                                    "<a class='fa fa-lg fa-eye' title='View Email' ng-click='viewAttachment(" + dataItem.id + ")'></a>" +
                                    "</div>"
                            }
                        }
                        //{ field: "", title: "", width: 100, filterable: false }, \"" + dataItem.link + "\"
                    ]
                });
                var linkFn = $compile($("#attachmentsGrid"));
                linkFn($scope);
            }
            $scope.tooltipOptions = {
                filter: "th", // show tooltip only on these elements
                position: "top",
                animation: {
                    open: {
                        effects: "fade:in",
                        duration: 200
                    },
                    close: {
                        effects: "fade:out",
                        duration: 200
                    }
                },
                // show tooltip only if the text of the target overflows with ellipsis
                show: function (e) {
                    if (this.content.text() != "") {
                        $('[role="tooltip"]').css("visibility", "visible");
                    }
                }
            };

            $scope.loadattachmentsGrid();

        }])
    .controller('attachmentCtrl', ['$scope', '$location', 'authService', 'attachmentService', '$compile', 'cssInjector', 'dialogService', 'attachment','$translate',
        function ($scope, $location, authService, attachmentService, $compile, cssInjector, dialogService, attachment, $translate) {
            cssInjector.removeAll();
            cssInjector.add('views/attachments/attachments.css');
            $scope.currentUser = authService.authentication.user;
            $scope.attachmentInfo = attachment;
            $scope.getOptions = function () {
                return {
                    dataBound: $scope.onUserAssignGridDataBound,
                    dataSource: new kendo.data.DataSource({
                        type: "json",
                        data: $scope.attachmentInfo.ipsAttachmentFileDetails,
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
                            field: "fileName", title: $translate.instant('COMMON_TITLE'), width: "100px", template: function (dataItem) {

                                return "<a href='javascript:;' ng-click='downloadAttachment(\"" + webConfig.userAttachmentController + dataItem.fileName + "\", \"" + dataItem.fileName + "\");'>" + dataItem.fileName + "</a>"

                            }
                        },

                    ]
                };
            };
            $scope.selectedUsers = [];
            
            $scope.downloadAttachment = function (uri, name) {
                var link = document.createElement("a");
                link.download = name;
                link.href = uri;
                link.click();
            }

            $scope.onUserAssignGridDataBound = function (e) {
                var grid = e.sender;
                if (grid.dataSource.total() == 0) {
                    var colCount = grid.columns.length;
                    $(e.sender.wrapper)
                        .find('tbody')
                        .append('<tr class="kendo-data-row"><td colspan="' + colCount + '" class="no-data">There is no data to show in the grid.</td></tr>');
                }
                else {
                    var linkFn = $compile($("#attachmentFilesGrid"));
                    linkFn($scope);
                }
            };
            $("#attachmentFilesGrid").kendoGrid({
                dataBound: $scope.onUserAssignGridDataBound,
                dataSource: new kendo.data.DataSource({
                    type: "json",
                    data: $scope.attachmentInfo.ipsAttachmentFileDetails,
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
                        field: "fileName", title: $translate.instant('COMMON_TITLE'), width: "100px", template: function (dataItem) {

                            return "<a href='javascript:;' ng-click='downloadAttachment(\"" + webConfig.userAttachmentController + dataItem.fileName + "\", \"" + dataItem.fileName + "\");'>" + dataItem.fileName + "</a>"

                        }
                    },

                ]
            })
            var kendoGrid = $("#attachmentFilesGrid").data("kendoGrid");
            if (kendoGrid) {
                kendoGrid.setOptions($scope.getOptions());
            }
        }])