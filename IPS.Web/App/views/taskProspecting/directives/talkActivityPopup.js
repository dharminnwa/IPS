angular.module('ips.taskProspecting')
    .directive('talkActivityPopup', [function () {
        return {
            restrict: 'E',
            templateUrl: 'views/taskProspecting/directives/talkActivityPopup.html',
            scope: {
                prospectingActivityCustomerResult: '=',
                prospectingSchedule: "=",
                prospectingActivityCustomerResults: "=",
                activityStartedFor: "=",
                openTalkActivityPopupMode: '=',
                isFollowUpResult: '=?'
            },
            controller: 'talkActivityPopupCtrl'
        };
    }])
    .controller('talkActivityPopupCtrl', ['$scope', 'taskProspectingManager', 'dialogService', '$translate', 'progressBar', 'localStorageService', 'todosManager',
        function ($scope, taskProspectingManager, dialogService, $translate, progressBar, localStorageService, todosManager) {
            $scope.talkActivityPopupWindow = null;
            $scope.customerSales = new kendo.data.ObservableArray([]);
            $scope.salesCategoryOptions = [
                { name: $translate.instant('TASKPROSPECTING_SALE_PRODUCT'), value: 1 },
                { name: $translate.instant('TASKPROSPECTING_SALE_SERVICE'), value: 2 },
                { name: $translate.instant('TASKPROSPECTING_SERVICE_REPAIR'), value: 3 },
                { name: $translate.instant('TASKPROSPECTING_SERVICE_PRODUCT'), value: 4 }
            ];
            $scope.customerResultEnum = {
                FollowUp: 1,
                Meeting: 2,
                Sales: 3,
                NotInterested: 4
            }
            $scope.goalTask = null;
            $scope.initOnPopupOpen = function () {
                //$scope.fillGrid();
                if (localStorageService.get("goalTaskId")) {
                    todosManager.getTaskById(localStorageService.get("goalTaskId")).then(function (data) {
                        $scope.goalTask = data;
                    });
                }
            }
            $scope.isValid = function () {
                var result = false;
                if (($scope.prospectingActivityCustomerResult.isMeeting || $scope.prospectingActivityCustomerResult.isNoMeeting || $scope.prospectingActivityCustomerResult.isFollowUp || $scope.prospectingActivityCustomerResult.isSales)) {
                    if ($scope.prospectingActivityCustomerResult.isSales) {
                        if ($scope.customerSales.length > 0) {
                            result = true;
                        }
                        else {
                            result = false;
                        }
                    }
                    else {
                        result = true;
                    }
                }
                return result;
            }
            $scope.saveCustomerActivityResult = function () {
                var isExist = _.any($scope.$parent.prospectingActivityCustomerResults, function (resultItem) {
                    return resultItem.prospectingCustomerId == $scope.prospectingActivityCustomerResult.prospectingCustomerId && resultItem.skillId == $scope.prospectingActivityCustomerResult.skillId && resultItem.prospectingActivityId == $scope.activityStartedFor;
                })
                if ($scope.isFollowUpResult) {
                    isExist = false;
                }
                if (isExist) {
                    _.each($scope.$parent.prospectingActivityCustomerResults, function (resultItem) {
                        if (resultItem.prospectingCustomerId == $scope.prospectingActivityCustomerResult.prospectingCustomerId && resultItem.skillId == $scope.prospectingActivityCustomerResult.skillId && resultItem.prospectingActivityId == $scope.activityStartedFor) {
                            resultItem.isDone = $scope.prospectingActivityCustomerResult.isDone;
                        }
                    })
                }
                else {
                    //Add New 
                    if ($scope.prospectingActivityCustomerResult.isSales) {
                        $scope.prospectingActivityCustomerResult.prospectingCustomerSalesAgreedDatas = $scope.customerSales
                        _.each($scope.prospectingActivityCustomerResult.prospectingCustomerSalesAgreedDatas, function (item) {
                            if (item.salesCategory) {
                                item.salesCategoryId = item.salesCategory.value;
                            }
                        })
                    }
                    $scope.prospectingActivityCustomerResult.prospectingSchedules = [];
                    $scope.meetingAggredProspectingActivityCustomerResult = null;
                    if ($scope.prospectingActivityCustomerResult.isMeeting) {
                        if ($scope.prospectingActivityCustomerResult.nextSkillId) {
                            $scope.meetingAggredProspectingActivityCustomerResult = {
                                id: 0,
                                prospectingCustomerId: $scope.prospectingActivityCustomerResult.prospectingCustomerId,
                                prospectingActivityId: $scope.activityStartedFor,
                                skillId: $scope.prospectingActivityCustomerResult.nextSkillId,
                                isDone: true,
                                reason: $scope.prospectingActivityCustomerResult.reason,
                                description: null,
                                duration: null,
                                customerInterestRate: $scope.prospectingActivityCustomerResult.customerInterestRate,
                                isFollowUp: false,
                                isNoMeeting: false,
                                isMeeting: true,
                                prospectingSchedules: [],
                                prospectingType: $scope.prospectingType
                            };
                            if ($scope.prospectingSchedule) {
                                $scope.prospectingSchedule.isFollowUp = false;
                                $scope.prospectingSchedule.isMeeting = true;
                                $scope.prospectingSchedule.prospectingType = $scope.prospectingType;
                                $scope.meetingAggredProspectingActivityCustomerResult.prospectingSchedules.push($scope.prospectingSchedule);
                            }
                        }
                    }
                    if ($scope.meetingAggredProspectingActivityCustomerResult) {
                        //First Save as Talked and then after Svale Meeting with Schedule
                        taskProspectingManager.saveCustomerActivityResult($scope.prospectingActivityCustomerResult).then(function (data) {
                            if (data) {
                                $scope.$parent.prospectingActivityCustomerResults.push(data);
                                taskProspectingManager.saveCustomerActivityResult($scope.meetingAggredProspectingActivityCustomerResult).then(function (data) {
                                    if (data) {
                                        dialogService.showNotification($translate.instant('TASKPROSPECTING_ACTVITY_RESULT_STORED_SUCCESSFULLY'), "info");
                                        if ($scope.$parent.prospectingActivityCustomerResults) {
                                            $scope.$parent.prospectingActivityCustomerResults.push(data);
                                            $scope.$parent.calculateActivityResult();
                                            $scope.cancelProspectingCustomerTalked();
                                        }
                                    }
                                })
                            }
                        })
                    }
                    else {
                        if ($scope.prospectingSchedule && $scope.prospectingActivityCustomerResult.isFollowUp) {
                            $scope.prospectingSchedule.isFollowUp = true;
                            $scope.prospectingSchedule.isMeeting = false;
                            $scope.prospectingSchedule.prospectingType = $scope.prospectingType;
                            $scope.prospectingActivityCustomerResult.prospectingSchedules.push($scope.prospectingSchedule);
                        }
                        taskProspectingManager.saveCustomerActivityResult($scope.prospectingActivityCustomerResult).then(function (data) {
                            if (data) {
                                dialogService.showNotification($translate.instant('TASKPROSPECTING_ACTVITY_RESULT_STORED_SUCCESSFULLY'), "info");
                                if ($scope.$parent.prospectingActivityCustomerResults) {
                                    $scope.$parent.prospectingActivityCustomerResults.push(data);
                                    $scope.$parent.calculateActivityResult();
                                    $scope.cancelProspectingCustomerTalked();
                                }
                            }
                        })
                    }
                }
            }
            $scope.cancelProspectingCustomerTalked = function () {
                $scope.openTalkActivityPopupMode.isPopupOpen = false;
                var dialog = $scope.talkActivityPopupWindow.data("kendoWindow");
                if (dialog) {
                    dialog.close();
                    dialog.destroy();
                }
            }
            $scope.addNewSalesRow = function () {
                var index = ($scope.customerSales.length + 1) * -1;
                $scope.customerSales.push({
                    id: index,
                    salesCategory: null,
                    salesCategoryId: null,
                    description: "",
                    amount: 0,
                    deliveryDate: moment(new Date()).format("L LT")
                });

                var grid = $("#prospectingSalesGrid").data("kendoGrid");
                var dataSource = getDataSource();
                grid.setDataSource(dataSource);
                grid.refresh();

            }
            $scope.activityCheckBoxChange = function (customerResultType) {
                if (customerResultType == $scope.customerResultEnum.FollowUp) {
                    if ($scope.prospectingActivityCustomerResult.isFollowUp) {
                        $scope.prospectingActivityCustomerResult.isMeeting = false;
                        $scope.prospectingActivityCustomerResult.isSales = false;
                        $scope.prospectingActivityCustomerResult.isNoMeeting = false;
                        $scope.prospectingActivityCustomerResult.salesNotification = null;
                        getNotificationTempalate();
                    }
                }
                else if (customerResultType == $scope.customerResultEnum.Meeting) {
                    if ($scope.prospectingActivityCustomerResult.isMeeting) {
                        $scope.prospectingActivityCustomerResult.isFollowUp = false;
                        $scope.prospectingActivityCustomerResult.isNoMeeting = false;
                        getNotificationTempalate();
                    }
                }

                else if (customerResultType == $scope.customerResultEnum.Sales) {
                    if ($scope.prospectingActivityCustomerResult.isSales) {
                        $scope.prospectingActivityCustomerResult.isNoMeeting = false;
                        $scope.prospectingActivityCustomerResult.isFollowUp = false;
                        getSalesNotificationTemplate();
                    }
                    else {
                        $scope.prospectingActivityCustomerResult.salesNotification = null;
                    }
                }
                else if (customerResultType == $scope.customerResultEnum.NotInterested) {
                    if ($scope.prospectingActivityCustomerResult.isNoMeeting) {
                        $scope.prospectingActivityCustomerResult.isFollowUp = false;
                        $scope.prospectingActivityCustomerResult.isMeeting = false;
                        $scope.prospectingActivityCustomerResult.isSales = false;
                        $scope.prospectingActivityCustomerResult.salesNotification = null;
                        $scope.customerSales = new kendo.data.ObservableArray([]);
                    }
                }
            }


            function getSalesNotificationTemplate() {
                if ($scope.prospectingActivityCustomerResult.isSales) {
                    if ($scope.goalTask.salesNotificationTemplateId) {
                        todosManager.getNotificationTemplateById($scope.goalTask.salesNotificationTemplateId).then(function (data) {
                            if (data) {
                                $scope.prospectingActivityCustomerResult.salesNotification = data.emailBody;
                            }
                        })
                    }
                }
            }
            function getNotificationTempalate() {
                if ($scope.prospectingActivityCustomerResult.isMeeting) {
                    if ($scope.goalTask.meetingNotificationTemplateId) {
                        todosManager.getNotificationTemplateById($scope.goalTask.meetingNotificationTemplateId).then(function (data) {
                            if (data) {
                                $scope.prospectingSchedule.notification = data.emailBody;
                            }
                        })
                    }
                }
                else if ($scope.prospectingActivityCustomerResult.isFollowUp) {
                    if ($scope.goalTask.followUpNotificationTemplateId) {
                        todosManager.getNotificationTemplateById($scope.goalTask.followUpNotificationTemplateId).then(function (data) {
                            if (data) {
                                $scope.prospectingSchedule.notification = data.emailBody;
                            }
                        })
                    }
                }
                else {

                    $scope.prospectingSchedule.notification = null;
                }
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

            $scope.gridCustomerSalesOptions = {
                dataSource: getDataSource(),
                pageable: true,
                toolbar: [{ name: "create", text: $translate.instant('TASKPROSPECTING_ADD_NEW_SALES_RECORD') }],
                editable: { mode: "inline", update: true, destroy: true },
                edit: function (e) {
                    if (e.model.isNew()) {
                        e.model.id = ($scope.customerSales.length) * -1;
                        e.model.prospectingCustomerId = $scope.prospectingActivityCustomerResult.prospectingCustomerId;
                        e.model.prospectingActivityId = $scope.activityStartedFor;
                    }
                },
                cancel: function (e) {
                    $(e.sender.element).data('kendoGrid').dataSource.cancelChanges();
                    e.preventDefault();
                    var grid = $(e.sender.element).data("kendoGrid");
                    var dataSource = getDataSource();
                    grid.setDataSource(dataSource);
                    grid.refresh();
                },
                columns: [
                    {
                        field: "salesCategory", title: $translate.instant('COMMON_CATEGORY'), width: "120px",
                        template: function (dataItem) {
                            if (dataItem.salesCategory) {
                                return dataItem.salesCategory.name;
                            }
                            else {
                                return null
                            }
                        },
                        editor: function (container, options) {
                            // create an input element
                            var input = $("<input/>");
                            // set its name to the field to which the column is bound ('name' in this case)
                            input.attr("name", options.field);
                            // append it to the container
                            input.appendTo(container);
                            // initialize a Kendo UI AutoComplete
                            input.kendoDropDownList({
                                autoBind: true,
                                dataSource: $scope.salesCategoryOptions,
                                dataTextField: "name",
                                dataValueField: "value",
                                optionLabel: "--" + $translate.instant('TASKPROSPECTING_SELECT_CATEGORY') + "--",
                                change: function (e) {
                                    var grid = $("#prospectingSalesGrid").data("kendoGrid");
                                    var dataItem = grid.dataItem($(this.element).closest("tr"));
                                    if (dataItem) {
                                        dataItem.salesCategory = e.sender.dataItem();
                                    }
                                },
                                select: function (e) {
                                    var grid = $("#prospectingSalesGrid").data("kendoGrid");
                                    var dataItem = grid.dataItem($(this.element).closest("tr"));
                                    if (dataItem) {
                                        dataItem.salesCategory = e.sender.dataItem();
                                    }
                                }
                            });
                        }
                    },
                    { field: "description", title: $translate.instant('COMMON_DESCRIPTION'), width: "120px" },
                    {
                        field: "amount", title: $translate.instant('COMMON_AMOUNT'), width: "120px", aggregates: ["sum"],
                        footerTemplate: function (data) {
                            return "<div class='text-center'> " + data["amount"].sum + " </div>";
                        },
                        attributes: {
                            "class": "text-center"
                        }
                    },
                    {
                        field: "deliveryDate", title: $translate.instant('TASKPROSPECTING_DELIVERY_DATE'), width: "120px",
                        template: function (dataItem) {
                            return moment(kendo.parseDate(dataItem.deliveryDate)).format("L LT");
                        },
                        editor: function (container, options) {
                            // create an input element
                            var input = $("<input/>");
                            // set its name to the field to which the column is bound ('name' in this case)
                            input.attr("name", options.field);
                            // append it to the container
                            input.appendTo(container);
                            // initialize a Kendo UI AutoComplete
                            input.kendoDateTimePicker({
                                dateInput: true,
                                min: new Date(),
                            });
                        }
                    },
                    {
                        command: [{ name: "edit", text: "", width: 30 },
                        { name: "destroy", text: " ", width: 50 }],
                        title: $translate.instant('COMMON_ACTIONS'), width: "150px", filterable: false, sortable: false,
                        headerAttributes: {
                            "data-title": $translate.instant('COMMON_ACTIONS')
                        }
                    },

                ]
            };

            function getDataSource() {
                var ds = new kendo.data.DataSource({
                    data: $scope.customerSales,
                    pageSize: 10,
                    schema: {
                        model: {
                            id: "id",
                            fields: {
                                id: { type: 'number' },
                                salesCategory: { defaultValue: { name: "--" + $translate.instant('COMMON_SELECT') + "--", value: null } },
                                salesCategoryId: { type: 'number' },
                                description: { type: 'string' },
                                deliveryDate: { type: 'date', validation: { required: true } },
                                amount: {
                                    type: 'number', validation: { required: true }
                                }
                            }
                        }
                    },
                    aggregate: [{
                        field: "amount", aggregate: "sum"
                    }],
                });
                return ds;
            }
            $scope.$on("kendoRendered", function (event) {
                if (event.targetScope.talkActivityPopupWindow) {
                    $scope.talkActivityPopupWindow = event.targetScope.talkActivityPopupWindow;
                }
            })
            $scope.$watch('openTalkActivityPopupMode.isPopupOpen', function (newValue, oldValue) {
                $scope.talkActivityPopupWindow = $("#talkActivityPopupWindow");
                if ($scope.talkActivityPopupWindow) {
                    if ($scope.openTalkActivityPopupMode.isPopupOpen) {
                        $scope.initOnPopupOpen();
                        if (!($scope.talkActivityPopupWindow.data("kendoWindow"))) {
                            $scope.talkActivityPopupWindow.kendoWindow({
                                width: "55%",
                                height: "600px",
                                title: $translate.instant('TASKPROSPECTING_PROSPECTING_CUSTOMER_TALKED'),
                                modal: true,
                                visible: false,
                                close: function () { this.destroy(); },
                                actions: ['Maximize', 'Close']
                            });
                            var dialog = $scope.talkActivityPopupWindow.data("kendoWindow");
                            dialog.open().center();
                        }
                    }
                    else {
                        var dialog = $scope.talkActivityPopupWindow.data("kendoWindow");
                        if (dialog) {
                            dialog.close();
                            dialog.destroy();
                        }
                        $scope.openTalkActivityPopupMode.isPopupOpen = false;
                    }
                }
            });
        }])