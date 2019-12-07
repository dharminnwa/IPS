(function () {
    'use strict';

    angular
        .module('ips.measureUnits')
        .controller('measureUnitsCtrl', measureUnitsCtrl);

    measureUnitsCtrl.$inject = ['dialogService', 'measureUnitsService', 'cssInjector', '$translate'];

    function measureUnitsCtrl(dialogService, measureUnitsService, cssInjector, $translate) {
        var vm = this;

        cssInjector.removeAll();
        cssInjector.add('views/measureUnits/measureUnits.css');

        activate();

        vm.measureUnitsGridOptions;
        vm.add = add;

        function activate() {
            var measureUnitsGridOptions = {
                dataSource: getDataSource(),
                sortable: true,
                pageable: true,
                edit: onGridEditing,
                editable: {
                    mode: "inline",
                    confirmation: false
                },
                columns: [
                    {
                        field: "name", title: $translate.instant('COMMON_NAME'), width: '50%'
                    },
                    {
                        command: [{ name: "edit", text: "", width: '25%' },
                        {
                            name: "btnDelete", text: "", width: '25%',
                            className: "btn-delete",
                            click: function (e) {
                                e.preventDefault();
                                var tr = $(e.target).closest("tr");
                                var data = this.dataItem(tr);
                                dialogService.showYesNoDialog($translate.instant('COMMON_CONFIRM'), $translate.instant('COMMON_ARE_YOU_SURE_YOU_WANT_TO_DELETE')).then(
                                    function () {
                                        measureUnitsService.remove(data.id).then(function (data) {
                                            var grid = $("#measureUnitsGrid").data("kendoGrid");
                                            var dataSource = getDataSource();
                                            grid.setDataSource(dataSource);
                                            grid.refresh();
                                        })
                                    },
                                    function (message) {
                                        dialogService.showNotification(message, "warning");
                                    });
                            }
                        }], title: $translate.instant('COMMON_ACTIONS'), width: 60,
                            headerAttributes: {
                                "data-title": $translate.instant('COMMON_ACTIONS')
                            }
                    },
                ],
            }

            vm.tooltipOptions = {
                filter: "th.k-header", // show tooltip only on these elements
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

            // required to assign here because of Kendo one way data binding
            vm.measureUnitsGridOptions = measureUnitsGridOptions;
        }

        function getDataSource() {
            var dataSource = new kendo.data.DataSource({
                type: "json",
                transport: {
                    read: function (options) {
                        measureUnitsService.get().then(function (data) {
                            dialogService.showNotification($translate.instant('SOFTPROFILE_SAVED_SUCCESFULLY'), "info");
                            options.success(data);
                        }, function (message) {
                            dialogService.showNotification(message, "warning");
                        });

                    },
                    update: function (options) {
                        var item = { id: options.data.id, name: options.data.name };
                        measureUnitsService.update(item).then(function (data) {
                            options.success();
                        }, function (message) {
                            dialogService.showNotification(message, "warning");
                        })

                    },
                    create: function (options) {
                        var item = { id: options.data.id, name: options.data.name };
                        measureUnitsService.add(item).then(function (data) {
                            options.data.id = data;
                            dialogService.showNotification($translate.instant('SOFTPROFILE_SAVED_SUCCESFULLY'), "info");
                            options.success(options.data);
                        }, function (message) {
                            dialogService.showNotification(message, "warning");
                        })

                    },
                },
                pageSize: 10,
                schema: {
                    model: {
                        id: "id",
                        fields: {
                            id: { type: 'number', },
                            name: {
                                type: 'string',
                                validation: {
                                    required: true,
                                    namevalidation: function (input) {
                                        if (input.is("[name='name']") && input.val() != "") {
                                            input.attr("data-namevalidation-msg", $translate.instant('SOFTPROFILE_NAME_ALREADY_EXIST'));
                                            var len = vm.measureUnitsGridOptions.dataSource.total();
                                            var row = input.closest('tr')[0];
                                            var uid = $(row).attr('data-uid');
                                            var dataitem = dataSource.getByUid(uid);
                                            for (var i = 0; i < len - 1; i++) {
                                                var item = vm.measureUnitsGridOptions.dataSource.at(i);
                                                if (item.id != dataitem.id) {
                                                    if (input.val().toLowerCase() == item.name.toLowerCase()) {
                                                        return false;
                                                    }
                                                }
                                            }
                                        }
                                        return true;
                                    }
                                }
                            },
                        }
                    }
                },
                error: function (err) {
                    this.cancelChanges();
                },
            });

            return dataSource;
        }

        function add() {
            var grid = $("#measureUnitsGrid").data("kendoGrid");
            grid.addRow();
        }

        function onGridEditing(arg) {
            arg.container.find("input[name='name']").attr('maxlength', '50');
        }
    }
})();