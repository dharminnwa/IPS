(function () {
    'use strict';

    var serviceId = 'dialogService';
    app.factory(serviceId, ['$q', 'apiService', '$translate', dialogService]);

    function dialogService($q, apiService, $translate) {
        var service = {
            showYesNoDialog: showYesNoDialog,
            showNotification: showNotification,
            showGridDialog: showGridDialog,
            showSelectableGridDialog: showSelectableGridDialog,
            showSelectableGridDialogForDatasource: showSelectableGridDialogForDatasource,
            showKTGridDialog: showKTGridDialog,
            showKTAnswerDetailDialog: showKTAnswerDetailDialog,
            showKTScoreCardDetailDialog: showKTScoreCardDetailDialog,
            showKTDevelopmentContractDetailDialog: showKTDevelopmentContractDetailDialog,
            showKTAnswerDetailDialogNew: showKTAnswerDetailDialogNew,
            showKTScoreCardDetailDialogNew: showKTScoreCardDetailDialogNew,
            showKTDevelopmentContractDetailDialogNew: showKTDevelopmentContractDetailDialogNew,
            showRestartEvalutionDialog: showRestartEvalutionDialog
        };

        return service;

        function showYesNoDialog(title, message) {
            var deferred = $q.defer();

            var html =
                '<div id="myDialogWindow"> ' +
                ' <div style="text-align: center; width:100%"> ' +
                '   <div style="margin:10px 0 15px 0">' + message + '</div> ' +
                '   <button class="btn btn-cstm primary" id="yesButton">' + $translate.instant('COMMON_YES') + '</button> ' +
                '   <button class="btn btn-cstm primary" id="noButton"">' + $translate.instant('COMMON_NO') + '</button> ' +
                '   </div> ' +
                '</div> ';

            $('body').append(html);

            var windowDiv = $('#myDialogWindow');
            windowDiv.kendoWindow({
                width: "250px",
                title: title,
                modal: true,
                visible: false,
                close: function () { this.destroy(); }
            });

            var dialog = windowDiv.data("kendoWindow");

            $('#yesButton').click(function (e) {
                dialog.close();
                $('#myDialogWindow').remove();
                deferred.resolve();
            });

            $('#noButton').click(function (e) {
                dialog.close();
                $('#myDialogWindow').remove();
                deferred.reject();
            });

            dialog.center();
            dialog.open();

            return deferred.promise;
        }

        function showSelectableGridDialog(title, titleColumnField, controller, orderby, getQuery, parameters, isHideAction) {
            var deferred = $q.defer();

            var html =
                '<div id="selectableGridDialogWindow"> ' +
                ' <div style="text-align: center; width:100%"> ' +
                '<div class="profiles-menu" style="text-align: left; width:100%">' +
                '<img src="images/organization/organization-icon.png" />' +
                ' <span></span>';
            if (!isHideAction) {
                html += '<a class="add-button pull-right" id="selectableGridDialogAddButton"></a>';
            }

            html += '</div>' +
                '   <div id="selectableGrid" style="text-align: left; width:100%"></div> ' +
                '   <button class="btn btn-cstm primary cancel pull-right" id="selectableGridDialogCancelButton"">' + $translate.instant('COMMON_CANCEL') + '</button> ' +
                '   <button class="btn btn-cstm primary pull-right" id="selectableGridDialogOkButton">' + $translate.instant('COMMON_OK') + '</button> ' +
                '   </div> ' +
                '</div> ';

            $('body').append(html);

            var windowDiv = $('#selectableGridDialogWindow');
            windowDiv.kendoWindow({
                width: "700px",
                title: title,
                modal: true,
                visible: false,
                close: function () { this.destroy(); }
            });


            //var gridData = new kendo.data.ObservableArray([]);

            var query = "";
            if (orderby) {
                query += "$orderby=" + orderby
            }

            if (query != "") {
                query += "&$filter=" + getQuery;
            }
            else {
                query += "$filter=" + getQuery;
            }



            if (query != "") {
                query = "?" + query;
            }


            var gridColumns = [{ template: "<input type='checkbox' class='checkbox' />" }];

            if (typeof titleColumnField === 'string') {
                gridColumns.push({ field: titleColumnField, title: $translate.instant('COMMON_TITLE'), width: "80%" });
            } else {
                angular.forEach(titleColumnField, function (key, index) {
                    gridColumns.push({ field: key, title: key.charAt(0).toUpperCase() + key.slice(1), width: "40%" });
                });
            }

            var transport = {
                read: function (options) {
                    apiService.getAll(controller + query).then(function (data) {
                        options.success(data);
                    })
                }
            };

            if (!isHideAction) {
                gridColumns.push({ command: [{ name: "edit", text: "", width: 30 }, { name: "destroy", text: "", width: 30 }], title: $translate.instant('COMMON_ACTIONS'), width: "15%", filterable: false })
                transport.update = function (options) {
                    var item = { id: options.data.models[0].id, description: options.data.models[0].description };

                    if ((parameters) && (parameters.length > 0)) {
                        angular.forEach(parameters, function (param, index) {
                            item[param.key] = param.value
                        });
                    }

                    apiService.update(controller, item).then(function (data) {
                        options.success();
                    })
                };
                transport.destroy = function (options) {
                    showYesNoDialog($translate.instant('COMMON_CONFIRM'), $translate.instant('COMMON_ARE_YOU_SURE_YOU_WANT_TO_DELETE')).then(
                        function () {
                            apiService.remove(controller, options.data.models[0].id).then(function (data) {
                                options.success();
                            })
                        },
                        function () {
                            options.error({}, 500, "destroyCanceled");
                        })
                };
                transport.create = function (options) {
                    var item = { id: options.data.models[0].id, description: options.data.models[0].description };

                    if ((parameters) && (parameters.length > 0)) {
                        angular.forEach(parameters, function (param, index) {
                            item[param.key] = param.value
                        });
                    }

                    apiService.add(controller, item).then(function (data) {
                        options.data.models[0].id = data;
                        options.success(options.data.models[0]);
                    })
                };
            }

            var grid = $("#selectableGrid").kendoGrid({
                dataSource: {
                    type: "json",
                    transport: transport,
                    pageSize: 10,
                    batch: true,
                    schema: {
                        model: {
                            id: "id",
                            fields: {
                                id: { type: 'number', },
                                description: { type: 'string', validation: { required: true } },
                            }
                        }
                    }
                },
                sortable: true,
                pageable: true,
                filterable: {
                    mode: 'row'
                },
                editable: {
                    mode: "inline",
                    confirmation: false
                },
                columns: gridColumns,
            }).data("kendoGrid");


            var dialog = windowDiv.data("kendoWindow");

            grid.table.on("click", ".checkbox", selectRow);
            var checkedRows = [];
            //on click of the checkbox:
            function selectRow() {
                var checked = this.checked,
                    row = $(this).closest("tr"),
                    grid = $("#selectableGrid").data("kendoGrid");
                var dataItem = grid.dataItem(row);

                if (checked) {
                    //-select the row
                    checkedRows.push(dataItem);
                    row.addClass("k-state-selected");
                } else {
                    //-remove selection
                    checkedRows.splice(checkedRows.indexOf(dataItem), 1);
                    row.removeClass("k-state-selected");
                }
            }

            $('#selectableGridDialogAddButton').click(function (e) {
                var grid = $("#selectableGrid").data("kendoGrid");
                grid.addRow();
            });

            $('#selectableGridDialogOkButton').click(function (e) {
                dialog.close();
                $('#selectableGridDialogWindow').remove();
                deferred.resolve(checkedRows);
            });

            $('#selectableGridDialogCancelButton').click(function (e) {
                dialog.close();
                $('#selectableGridDialogWindow').remove();
                deferred.reject();
            });

            dialog.center();
            dialog.open();

            return deferred.promise;
        }

        function getDate(dt) {
            return moment(kendo.parseDate(dt)).format('L');
        }
        function getDateTime(dt) {
            return moment(kendo.parseDate(dt)).format('L LT');
        }

        function showSelectableGridDialogForDatasource(title, columns, dataCollection) {
            var deferred = $q.defer();

            var html =
                '<div id="selectableGridDialogWindow"> ' +
                ' <div style="text-align: center; width:100%"> ' +
                '<div class="profiles-menu" style="text-align: left; width:100%">' +
                '<img src="images/organization/organization-icon.png" />' +
                ' <span></span>';

            html += '</div>' +
                '   <div id="selectableGrid" style="text-align: left; width:100%"></div> ' +
                '   <button class="btn btn-cstm primary cancel pull-right" id="selectableGridDialogCancelButton"">' + $translate.instant('COMMON_CANCEL') + '</button> ' +
                '   <button class="btn btn-cstm primary pull-right" id="selectableGridDialogOkButton">' + $translate.instant('COMMON_OK') + '</button> ' +
                '   </div> ' +
                '</div> ';

            $('body').append(html);

            var windowDiv = $('#selectableGridDialogWindow');
            windowDiv.kendoWindow({
                width: "700px",
                title: title,
                modal: true,
                visible: false,
                close: function () { this.destroy(); }
            });

            var gridColumns = [{ template: "<input type='checkbox' class='checkbox' />" }];

            var columnWidth = "30%";
            if (columns.length > 0)
                gridColumns.push({ field: columns[0].field, title: columns[0].title, width: columnWidth * 2 });
            if (columns.length > 1) {
                for (var i = 1; i < columns.length; i++) {
                    gridColumns.push({ field: columns[i].field, title: columns[i].title, width: columnWidth });
                }
            }
            for (var i = 0; i < dataCollection.length; i++) {
                dataCollection[i].startDateText = getDateTime(dataCollection[i].startDate);
                dataCollection[i].endDateText = getDateTime(dataCollection[i].endDate);
            }

            var grid = $("#selectableGrid").kendoGrid({
                dataSource: {
                    type: "json",
                    data: dataCollection,
                    pageSize: 10,
                    batch: true,
                    schema: {
                        model: {
                            id: "id",
                            fields: {
                                id: { type: 'number', },
                                description: { type: 'string', validation: { required: true } },
                            }
                        }
                    }
                },
                sortable: true,
                pageable: true,
                /*filterable: {
                    mode: 'row'
                },*/
                columns: gridColumns,
            }).data("kendoGrid");


            var dialog = windowDiv.data("kendoWindow");

            grid.table.on("click", ".checkbox", selectRow);
            var checkedRows = [];
            //on click of the checkbox:
            function selectRow() {
                var checked = this.checked,
                    row = $(this).closest("tr"),
                    grid = $("#selectableGrid").data("kendoGrid");
                var dataItem = grid.dataItem(row);

                if (checked) {
                    //-select the row
                    checkedRows.push(dataItem);
                    row.addClass("k-state-selected");
                } else {
                    //-remove selection
                    checkedRows.splice(checkedRows.indexOf(dataItem), 1);
                    row.removeClass("k-state-selected");
                }
            }

            $('#selectableGridDialogOkButton').click(function (e) {
                dialog.close();
                $('#selectableGridDialogWindow').remove();
                deferred.resolve(checkedRows);
            });

            $('#selectableGridDialogCancelButton').click(function (e) {
                dialog.close();
                $('#selectableGridDialogWindow').remove();
                deferred.reject();
            });

            dialog.center();
            dialog.open();

            return deferred.promise;
        }

        function showGridDialog(title, dataCollection, columnsTemplate) {
            var deferred = $q.defer();
            var html =
                '<div id="gridDialogWindow"> ' +
                ' <div style="text-align: center; width:100%"> ' +
                ' <div class="profiles-menu" style="text-align: left; width:100%">' +
                ' <span></span>';

            html += '</div>' +
                '   <div id="detailsGrid" style="text-align: left; width:100%, font-size: 11pt"></div> ' +
                '   </div> ' +
                '</div> ';

            $('body').append(html);

            var windowDiv = $('#gridDialogWindow');
            windowDiv.kendoWindow({
                width: "55%",
                title: title,
                modal: true,
                visible: false,
                close: onGridDialogClose,
                actions: ['Maximize', 'Close']
            });

            $("#detailsGrid").kendoGrid({
                dataSource: {
                    type: "json",
                    data: dataCollection,
                    pageSize: 10,
                },
                scrollable: true,
                sortable: true,
                resizable: true,
                pageable: true,
                columns: columnsTemplate
            }).data("kendoGrid");

            var dialog = windowDiv.data("kendoWindow");

            dialog.maximize().open();
            dialog.center();
            return deferred.promise;
        }

        function showKTGridDialog(title, ktdatasource, columns) {
            var deferred = $q.defer();
            var html =
                '<div id="ktGridDialogWindow"> ' +
                ' <div style="text-align: center; width:100%"> ' +
                ' <div class="profiles-menu" style="text-align: left; width:100%">' +
                ' <span><button style="margin: 5px;" ng-click="getKTScoreCardDetail()">' + $translate.instant('COMMON_SCORECARD') + 'Score Card</button><button style="margin: 5px;" ng-click="getKTAllAnswers()">' + $translate.instant('COMMON_ANALYZE') + '</button> <button style="margin: 5px;" ng-click="getKTDevelopmentContractDetail()">' + $translate.instant('COMMON_DEVELOPMENT_CONTRACT') + '</button></span>';

            html += '</div>' +
                '   <div id="ktDetailsGrid" style="text-align: left; width:100%, font-size: 11pt"></div> ' +
                '   </div> ' +
                '</div> ';

            $('body').append(html);

            var windowDiv = $('#ktGridDialogWindow');
            windowDiv.kendoWindow({
                width: "55%",
                title: title,
                modal: true,
                visible: false,
                close: onKTGridDialogClose,
                actions: ['Maximize', 'Close']
            });

            var colorMainPart = "black";
            var colorComparePart = "blue";
            var columnWidth = 10;
            var columnWidthText = columnWidth + "%";
            var grid = $("#ktDetailsGrid").kendoTreeList({
                dataSource: ktdatasource,
                loadOnDemand: false,
                sortable: true,
                filterable: {
                    mode: "row"
                },
                columnMenu: true,
                columns: columns
            });
            grid.data("kendoTreeList").thead.kendoTooltip({
                filter: "th",
                content: function (e) {
                    var target = e.target; // element for which the tooltip is shown
                    return $(target).text();
                }
            });
            var dialog = windowDiv.data("kendoWindow");

            dialog.maximize().open();
            dialog.center();
            return deferred.promise;
        }
        function showKTAnswerDetailDialog(participantName, profileid, stageid, participantid, index) {
            var deferred = $q.defer();
            var html =
                '<div id="ktAnswerDetailGridDialogWindow"> ' +
                ' <div style="text-align: center; width:100%"> ' +
                ' <div class="profiles-menu" style="text-align: left; width:100%">' +
                ' <span></span>';

            html += '</div>' +
                //'   <div id="ktAnswerDetailGrid" style="text-align: left; width:100%, font-size: 11pt"></div> ' +
                '   <div kt-answer-detail profile-id="' + profileid + '"  stage-id="' + stageid + '" participant-id="' + participantid + '" index="' + index + '"></div> ' + '   </div> ' +
                '</div> ';

            $('body').append(html);

            var windowDiv = $('#ktAnswerDetailGridDialogWindow');
            windowDiv.kendoWindow({
                width: "55%",
                title: "Answer Detail of " + participantName,
                modal: true,
                visible: false,
                close: onKTAnswerDetailGridDialogClose,
                actions: ['Maximize', 'Close']
            });
            //var colorMainPart = "black";
            //var colorComparePart = "blue";
            //var columnWidth = 10;
            //var columnWidthText = columnWidth + "%";
            //var grid = $("#ktAnswerDetailGrid").kendoTreeList({
            //    dataSource: ktdatasource,
            //    loadOnDemand: false,
            //    sortable: true,
            //    filterable: {
            //        mode: "row"
            //    },
            //    columnMenu: true,
            //    columns: columns
            //});
            //grid.data("kendoTreeList").thead.kendoTooltip({
            //    filter: "th",
            //    content: function (e) {
            //        var target = e.target; // element for which the tooltip is shown
            //        return $(target).text();
            //    }
            //});
            var dialog = windowDiv.data("kendoWindow");


            dialog.maximize().open();
            dialog.center();
            return deferred.promise;
        }
        function showKTAnswerDetailDialogNew(participantName, profileid, stageid, participantid, index) {
            var deferred = $q.defer();
            var html =
                '<div id="ktAnswerDetailGridDialogWindow"> ' +
                ' <div style="text-align: center; width:100%"> ' +
                ' <div class="profiles-menu" style="text-align: left; width:100%">' +
                ' <span></span>';

            html += '</div>' +
                //'   <div id="ktAnswerDetailGrid" style="text-align: left; width:100%, font-size: 11pt"></div> ' +
                '   <div kt-answer-detail-new profile-id="' + profileid + '"  stage-id="' + stageid + '" participant-id="' + participantid + '" index="' + index + '"></div> ' + '   </div> ' +
                '</div> ';

            $('body').append(html);

            var windowDiv = $('#ktAnswerDetailGridDialogWindow');
            windowDiv.kendoWindow({
                width: "55%",
                title: "Answer Detail of " + participantName,
                modal: true,
                visible: false,
                close: onKTAnswerDetailGridDialogClose,
                actions: ['Maximize', 'Close']
            });
            //var colorMainPart = "black";
            //var colorComparePart = "blue";
            //var columnWidth = 10;
            //var columnWidthText = columnWidth + "%";
            //var grid = $("#ktAnswerDetailGrid").kendoTreeList({
            //    dataSource: ktdatasource,
            //    loadOnDemand: false,
            //    sortable: true,
            //    filterable: {
            //        mode: "row"
            //    },
            //    columnMenu: true,
            //    columns: columns
            //});
            //grid.data("kendoTreeList").thead.kendoTooltip({
            //    filter: "th",
            //    content: function (e) {
            //        var target = e.target; // element for which the tooltip is shown
            //        return $(target).text();
            //    }
            //});
            var dialog = windowDiv.data("kendoWindow");


            dialog.maximize().open();
            dialog.center();
            return deferred.promise;
        }

        //Score Card Detail Popup
        function showKTScoreCardDetailDialogNew(profileid, stageid, participantid, stageevolutionid) {
            var deferred = $q.defer();
            var html =
                '<div id="ktScoreCardDetailDialogWindow"> ' +
                ' <div style="text-align: center; width:100%"> ' +
                ' <div class="profiles-menu" style="text-align: left; width:100%">' +
                ' <span></span>';

            html += '</div>' +
                '   <div kt-score-card-detail-new profile-id="' + profileid + '" stage-id="' + stageid + '" participant-id="' + participantid + '" stage-evolution-id="' + stageevolutionid + '"></div> ' +
                '   </div> ' +
                '</div> ';

            $('body').append(html);

            var windowDiv = $('#ktScoreCardDetailDialogWindow');
            windowDiv.kendoWindow({
                width: "55%",
                title: "Score Card",
                modal: true,
                visible: false,
                close: onKTScoreCardDetailDialogClose,
                actions: ['Maximize', 'Close']
            });

            var dialog = windowDiv.data("kendoWindow");
            dialog.maximize().open();
            dialog.center();
            return deferred.promise;
        }
        function showKTScoreCardDetailDialog(profileid, stageid, participantid, stageevolutionid) {
            var deferred = $q.defer();
            var html =
                '<div id="ktScoreCardDetailDialogWindow"> ' +
                ' <div style="text-align: center; width:100%"> ' +
                ' <div class="profiles-menu" style="text-align: left; width:100%">' +
                ' <span></span>';

            html += '</div>' +
                '   <div kt-score-card-detail profile-id="' + profileid + '" stage-id="' + stageid + '" participant-id="' + participantid + '" stage-evolution-id="' + stageevolutionid + '"></div> ' +
                '   </div> ' +
                '</div> ';

            $('body').append(html);

            var windowDiv = $('#ktScoreCardDetailDialogWindow');
            windowDiv.kendoWindow({
                width: "55%",
                title: "Score Card",
                modal: true,
                visible: false,
                close: onKTScoreCardDetailDialogClose,
                actions: ['Maximize', 'Close']
            });

            var dialog = windowDiv.data("kendoWindow");
            dialog.maximize().open();
            dialog.center();
            return deferred.promise;
        }

        //Development Contract Detail Popup
        function showKTDevelopmentContractDetailDialog(profileid, stageid, participantid, stageevolutionid) {
            var deferred = $q.defer();
            var html =
                '<div id="ktDevelopmentContractDetailDialogWindow"> ' +
                ' <div style="text-align: center; width:100%"> ' +
                ' <div class="profiles-menu" style="text-align: left; width:100%">' +
                ' <span></span>';

            html += '</div>' +
                '   <div kt-development-contract profile-id="' + profileid + '" stage-id="' + stageid + '" participant-id="' + participantid + '" stage-evolution-id="' + stageevolutionid + '"></div> ' +
                '   </div> ' +
                '</div> ';

            $('body').append(html);

            var windowDiv = $('#ktDevelopmentContractDetailDialogWindow');
            windowDiv.kendoWindow({
                width: "55%",
                title: "Score Card",
                modal: true,
                visible: false,
                close: onKTDevelopmentContractDetailDialogClose,
                actions: ['Maximize', 'Close']
            });

            var dialog = windowDiv.data("kendoWindow");
            dialog.maximize().open();
            dialog.center();
            return deferred.promise;
        }
        function showKTDevelopmentContractDetailDialogNew(profileid, stageid, participantid, stageevolutionid) {
            var deferred = $q.defer();
            var html =
                '<div id="ktDevelopmentContractDetailDialogWindow"> ' +
                ' <div style="text-align: center; width:100%"> ' +
                ' <div class="profiles-menu" style="text-align: left; width:100%">' +
                ' <span></span>';

            html += '</div>' +
                '   <div kt-development-contract-new profile-id="' + profileid + '" stage-id="' + stageid + '" participant-id="' + participantid + '" stage-evolution-id="' + stageevolutionid + '"></div> ' +
                '   </div> ' +
                '</div> ';

            $('body').append(html);

            var windowDiv = $('#ktDevelopmentContractDetailDialogWindow');
            windowDiv.kendoWindow({
                width: "55%",
                title: "Score Card",
                modal: true,
                visible: false,
                close: onKTDevelopmentContractDetailDialogClose,
                actions: ['Maximize', 'Close']
            });

            var dialog = windowDiv.data("kendoWindow");
            dialog.maximize().open();
            dialog.center();
            return deferred.promise;
        }

        // Restart Evalution Dialog popup
        function showRestartEvalutionDialog(message) {
            var deferred = $q.defer();

            var html =
                '<div id="restartEvalutionDialogWindow"> ' +
                '   <div id="" style="text-align: center; width:100%"><h3>' + message + '</h3></div> ' +
                '   <button class="btn btn-cstm primary cancel pull-right" id="restartEvalutionDialogCancelButton"">' + $translate.instant('COMMON_NO') + '</button> ' +
                    '   <button class="btn btn-cstm primary pull-right" id="restartEvalutionDialogOkButton">' + $translate.instant('COMMON_YES') + '</button> ' +
                '</div> ';

            $('body').append(html);

            var windowDiv = $('#restartEvalutionDialogWindow');
            windowDiv.kendoWindow({
                width: "700px",
                title: 'Confirm',
                modal: true,
                visible: false,
                close: function () { this.destroy(); }
            });

            var dialog = windowDiv.data("kendoWindow");
            
            //on click of the checkbox:
           

            $('#restartEvalutionDialogOkButton').click(function (e) {
                dialog.close();
                $('#restartEvalutionDialogWindow').remove();
                deferred.resolve(true);
            });

            $('#restartEvalutionDialogCancelButton').click(function (e) {
                dialog.close();
                $('#restartEvalutionDialogWindow').remove();
                deferred.resolve(false);
            });

            dialog.center();
            dialog.open();

            return deferred.promise;
        }

        function showFinishEvalutionDialog(message) {
            var deferred = $q.defer();

            var html =
                '<div id="finishEvalutionDialogWindow"> ' +
                ' <div style="text-align: center; width:100%"> ' +
                '<div class="profiles-menu" style="text-align: left; width:100%">' +
                '<img src="images/organization/organization-icon.png" />' +
                ' <span></span>';

            html += '</div>' +
                '   <div id="" style="text-align: center; width:100%">' + message + '</div> ' +
                '   <button class="btn btn-cstm primary cancel pull-right" id="finishEvalutionDialogCancelButton"">' + $translate.instant('COMMON_CANCEL') + '</button> ' +
                '   <button class="btn btn-cstm primary pull-right" id="finishEvalutionDialogOkButton">' + $translate.instant('COMMON_OK') + '</button> ' +
                '   </div> ' +
                '</div> ';

            $('body').append(html);

            var windowDiv = $('#finishEvalutionDialogWindow');
            windowDiv.kendoWindow({
                width: "700px",
                title: 'Confirm',
                modal: true,
                visible: false,
                close: function () { this.destroy(); }
            });

            var dialog = windowDiv.data("kendoWindow");

            //on click of the checkbox:


            $('#finishEvalutionDialogOkButton').click(function (e) {
                dialog.close();
                $('#finishEvalutionDialogWindow').remove();
                deferred.resolve(true);
            });

            $('#finishEvalutionDialogCancelButton').click(function (e) {
                dialog.close();
                $('#finishEvalutionDialogWindow').remove();
                deferred.resolve(false);
            });

            dialog.center();
            dialog.open();

            return deferred.promise;
        }

        function onGridDialogClose(e) {
            $('#gridDialogWindow').remove();
            this.destroy();
        }

        function onKTGridDialogClose(e) {
            $('#ktGridDialogWindow').remove();
            this.destroy();
        }
        function onKTAnswerDetailGridDialogClose(e) {
            $('#ktAnswerDetailGridDialogWindow').remove();
            this.destroy();
        }

        //To destory ScoreCard Detail Popup on close
        function onKTScoreCardDetailDialogClose(e) {
            $('#ktScoreCardDetailDialogWindow').remove();
            this.destroy();
        }

        function onKTDevelopmentContractDetailDialogClose(e) {
            $('#ktDevelopmentContractDetailDialogWindow').remove();
            this.destroy();
        }
        function showNotification(message, type) {
            if ($("#notificationBox").length == 0) {
                var html = '<div id="notificationBox"></div>';

                var notificationOptions = {
                    position: {
                        top: 30,
                        right: 30
                    }
                }

                $('body').append(html);
            }

            $("#notificationBox").kendoNotification(notificationOptions).data("kendoNotification").show(message, type);
        }
    }
})();