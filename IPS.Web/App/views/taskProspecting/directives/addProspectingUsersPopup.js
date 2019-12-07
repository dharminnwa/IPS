angular.module('ips.taskProspecting')
    .directive('addProspectingUsersPopup', [function () {
        return {
            restrict: 'E',
            templateUrl: 'views/taskProspecting/directives/addProspectingUsersPopup.html',
            scope: {
                prospectingCustomer: '=',
                prospectingGoalNames: "=",
                prospectingGoalActivityInfoes: "=",
                prospectingCustomerGoalActivities: "=",
                openAddCustomerPopupMode: '=',
            },
            controller: 'addProspectingUsersPopupCtrl'
        };
    }])

    .controller('addProspectingUsersPopupCtrl', ['$scope', 'taskProspectingManager', 'dialogService', '$translate',
        function ($scope, taskProspectingManager, dialogService, $translate) {
            $scope.addSalesCustomersWindow;
            $scope.isSelectedAll = false;

            $scope.newProspectingCustomers = [];
            $scope.users = [];
            var endDay = moment();
            $scope.endOfDay = endDay.endOf('day')._d;
            $scope.initOnPopupOpen = function () {
                if ($scope.prospectingCustomer) {
                    $scope.prospectingCustomerInfo = $scope.prospectingCustomer;
                }
            };

            $scope.changeProspectingCustomerGoal = function () {
                var info = _.find($scope.prospectingGoalNames, function (item) {
                    return item.id == $scope.prospectingCustomer.prospectingGoalId;
                });
                if (info) {
                    $scope.prospectingCustomer.goalName = info.name;

                    taskProspectingManager.GetUsersForGoalId(info.id).then(function (data) {
                        $scope.users = data;
                        $scope.customerDataSource = new kendo.data.DataSource({
                            type: "json",
                            data: $scope.users,
                            pageSize: 100,
                            schema: {
                                model: {
                                    fields: {
                                        id: {
                                            type: 'number',
                                        },
                                        name: {
                                            type: 'string'
                                        },
                                        phone: {
                                            type: 'string'
                                        },
                                        detail: {
                                            type: 'string'
                                        },
                                       
                                    }
                                }
                            }
                        });
                        $scope.salesCustmerGridOptions = {
                            dataBound: function (e) {
                                console.log("dataBound");
                                if (!$scope.isSelectedAll) {
                                    if ($("#salesCustomerGrid").data("kendoGrid")) {
                                        var customerDatas = $("#salesCustomerGrid").data("kendoGrid").dataSource.data();
                                        if (customerDatas) {
                                            _.each(customerDatas, function (dataItem) {
                                                var isSelected = _.any($scope.newProspectingCustomers, function (selectedItem) {
                                                    return selectedItem.customerSaleDataId == dataItem.id && selectedItem.customerId == dataItem.customerId;
                                                });
                                                if (isSelected) {
                                                    dataItem.isSelected = true;
                                                }
                                                else {
                                                    dataItem.isSelected = false;
                                                }
                                            });
                                        }
                                    }
                                }
                                else {
                                    //$scope.selectAllTriggered = false;
                                    $scope.newProspectingCustomers = [];
                                    var grid = $("#salesCustomerGrid").data("kendoGrid");
                                    var customerDatas = new kendo.data.Query(grid.dataSource.data()).filter(grid.dataSource.filter()).data;
                                    if (customerDatas) {
                                        _.each(customerDatas, function (dataItem) {
                                            var customerInfo = _.clone($scope.prospectingCustomer);
                                            customerInfo.customerId = dataItem.customerId,
                                                customerInfo.name = dataItem.name,
                                                customerInfo.phone = dataItem.mobile,
                                                customerInfo.detail = dataItem.email,
                                                customerInfo.customerSaleDataId = dataItem.id,
                                                customerInfo.postCode = dataItem.id,
                                                customerInfo.customerSalesData = {
                                                    model: dataItem.model,
                                                    type: dataItem.type,
                                                    seller: dataItem.seller,
                                                }
                                            dataItem.isSelected = true;
                                            $scope.newProspectingCustomers.push(customerInfo);
                                        });
                                    }
                                }
                            },
                            dataSource: $scope.customerDataSource,
                            columnMenu: false,
                            filterable: {
                                extra: false,
                                operators: {
                                    string: {
                                        eq: "Is equal to",
                                    }
                                }
                            },
                            pageable: {
                                pageSizes: [20, 50, 100],
                                numeric: true
                            },
                            selectable: true,
                            sortable: true,
                            columns: [
                                {
                                    field: "id",
                                    headerTemplate: function () {
                                        return "<input type='checkbox' data-ng-model='isSelectedAll' ng-change=\"selectAllCustomers(isSelectedAll)\">"
                                    },
                                    width: '50px',
                                    template: function (dataItem) {
                                        return "<input id='chk_customer_" + dataItem.customerId + "' type='checkbox' data-ng-model='dataItem.isSelected' ng-change=\"changeCustomerSelection(dataItem.isSelected,dataItem.customerId,dataItem)\">";
                                    },
                                    sortable: false,
                                    filterable: false,
                                },
                                
                                {
                                    field: "name", title: $translate.instant('COMMON_NAME'),
                                    filterable: {
                                        extra: false,
                                        ui: nameFilter,
                                        operators: {
                                            string: {
                                                eq: "Is equal to",
                                                startswith: "Start With"
                                            }
                                        }
                                    },
                                    width: '150px'
                                },
                                {
                                    field: "phone", title: $translate.instant('TASKPROSPECTING_MOBILE'), filterable: false, width: '150px'
                                },
                                {
                                    field: "detail", title: $translate.instant('TASKPROSPECTING_EMAIL'), filterable: false, width: '150px'
                                },
                                
                                
                            ],
                            filter: function () {
                                if (e.filter == null) {
                                }
                            }
                        };
                        
                    })

                }
            }

            $scope.changeProspectingCustomerCsvFile = function () {
                var grid = $("#salesCustomerGrid").data("kendoGrid");
                if (grid.dataSource._filter) {

                    var CSVFilter = _.find(grid.dataSource._filter.filters, function (item) {
                        return item.field == "csvFileName";
                    })
                    if (CSVFilter) {
                        if ($scope.prospectingCustomer.csvFileName != -1) {
                            CSVFilter.value = $scope.prospectingCustomer.csvFileName;
                        }
                        else {
                            var CSVFilterIndex = _.findIndex(grid.dataSource._filter.filters, function (item) {
                                return item.field == "csvFileName";
                            })
                            if (CSVFilterIndex > -1) {
                                grid.dataSource._filter.filters.splice(CSVFilterIndex, 1);
                            }
                        }
                    }
                    else {
                        if ($scope.prospectingCustomer.csvFileName != -1) {
                            grid.dataSource._filter.filters.push({ field: "csvFileName", operator: "eq", value: $scope.prospectingCustomer.csvFileName })
                        }
                    }

                }
                else {
                    var filter = { logic: "and", filters: [] };
                    filter.filters.push({ field: "csvFileName", operator: "eq", value: $scope.prospectingCustomer.csvFileName });
                    grid.dataSource.filter(filter);
                }
                var customerDatas = new kendo.data.Query(grid.dataSource.data()).filter(grid.dataSource.filter()).data;
            }
            $scope.changeCustomerSelection = function (value, customerId, dataItem) {
                $scope.selectAllTriggered = true;
                if (value) {
                    var customerInfo = _.clone($scope.prospectingCustomer);
                    customerInfo.customerId = customerId,
                        customerInfo.name = dataItem.name,
                        customerInfo.phone = dataItem.mobile,
                        customerInfo.detail = dataItem.email,
                        customerInfo.customerSaleDataId = dataItem.id,
                        $scope.newProspectingCustomers.push(customerInfo)
                }
                else {
                    var customerIndex = _.findIndex($scope.newProspectingCustomers, function (item) {
                        return item.customerId == customerId;
                    });
                    if (customerIndex > -1) {
                        $scope.newProspectingCustomers.splice(customerIndex, 1);
                    }
                }
                if ($("#salesCustomerGrid").data("kendoGrid")) {
                    var grid = $("#salesCustomerGrid").data("kendoGrid");
                    var customerDatas = new kendo.data.Query(grid.dataSource.data()).filter(grid.dataSource.filter()).data;
                    if ($scope.newProspectingCustomers.length == customerDatas.length) {
                        $scope.isSelectedAll = true;
                    }
                    else {
                        $scope.isSelectedAll = false;
                    }
                }
            }
            $scope.selectAllCustomers = function (value) {
                $scope.selectAllTriggered = true;
                $scope.isSelectedAll = value;
                if (value) {
                    if ($("#salesCustomerGrid").data("kendoGrid")) {
                        //var customerDatas = $("#salesCustomerGrid").data("kendoGrid").dataSource.data();
                        var grid = $("#salesCustomerGrid").data("kendoGrid");
                        var customerDatas = new kendo.data.Query(grid.dataSource.data()).filter(grid.dataSource.filter()).data;
                        if (customerDatas) {
                            _.each(customerDatas, function (dataItem) {
                                var customerInfo = _.clone($scope.prospectingCustomer);
                                customerInfo.customerId = dataItem.customerId,
                                    customerInfo.name = dataItem.name,
                                    customerInfo.phone = dataItem.mobile,
                                    customerInfo.detail = dataItem.email,
                                    customerInfo.customerSaleDataId = dataItem.id,
                                    customerInfo.postCode = dataItem.id,
                                    customerInfo.customerSalesData = {
                                        model: dataItem.model,
                                        type: dataItem.type,
                                        seller: dataItem.seller,
                                    }
                                dataItem.isSelected = true;
                                $scope.newProspectingCustomers.push(customerInfo);
                            });
                        }
                    }
                }
                else {
                    $scope.newProspectingCustomers = [];
                    if ($("#salesCustomerGrid").data("kendoGrid")) {
                        var customerDatas = $("#salesCustomerGrid").data("kendoGrid").dataSource.data();
                        if (customerDatas) {
                            _.each(customerDatas, function (dataItem) {
                                dataItem.isSelected = false;
                            });
                        }
                    }
                }
            }
            $scope.saveProspectingCustomer = function () {

                var grid = $("#salesCustomerGrid").data("kendoGrid");
                var gridData = new kendo.data.Query(grid.dataSource.data()).filter(grid.dataSource.filter()).data;
                var selectedCustomers = _.filter(gridData, function (item) {
                    return item.isSelected == true;
                });
                if (selectedCustomers.length > 0) {
                    $scope.addedProspectingCustomers = [];
                    var totalCustomerToAdd = selectedCustomers.length;
                    var totalAddedCustomer = 0;
                    _.each(selectedCustomers, function (dataItem) {
                        var customerInfo = _.clone($scope.prospectingCustomer);
                        customerInfo.userId = dataItem.userId;
                        customerInfo.name = dataItem.name;
                        customerInfo.phone = dataItem.phone;
                        customerInfo.detail = dataItem.detail;
                        dataItem.isSelected = true;
                        $scope.addedProspectingCustomers.push(customerInfo);
                    });
                    _.each($scope.addedProspectingCustomers, function (prospectingCustomerItem, customerIndex) {
                        if (prospectingCustomerItem.id == 0) {
                            prospectingCustomerItem.prospectingGoalId = $scope.prospectingCustomer.prospectingGoalId,
                                prospectingCustomerItem.scheduleDate = $scope.prospectingCustomer.scheduleDate,
                                taskProspectingManager.addProspectingCustomer(prospectingCustomerItem).then(function (data) {
                                    var prospectingCustomer = data;
                                    prospectingCustomer.scheduleDate = kendo.parseDate(prospectingCustomer.scheduleDate);
                                    prospectingCustomer.skills = [];
                                    totalAddedCustomer += 1;
                                    if (prospectingCustomer.prospectingGoalId) {
                                        taskProspectingManager.getSkillsByProspectingGoalId(prospectingCustomer.prospectingGoalId).then(function (skillDatas) {
                                            skillDatas = _.sortBy(skillDatas, 'seqNo');
                                            _.each(skillDatas, function (skillDataItem) {
                                                prospectingCustomer.skills.push({ skillId: skillDataItem.id, skillName: skillDataItem.name });
                                            });
                                            var goal = _.find($scope.prospectingGoalNames, function (item) {
                                                return item.id == prospectingCustomer.prospectingGoalId;
                                            });
                                            if (goal) {
                                                prospectingCustomer["goalName"] = goal.name;
                                            }
                                            if ($scope.$parent) {
                                                $scope.$parent.prospectingCustomers.push(prospectingCustomer);
                                                if ($scope.$parent.isActivityStart && $scope.$parent.activityStartedProspectingGoalId == prospectingCustomer.prospectingGoalId) {
                                                    $scope.$parent.prospectingActivityCustomers.push(prospectingCustomer);

                                                }
                                            }

                                        })
                                    }
                                    if (customerIndex == (totalCustomerToAdd - 1)) {
                                        dialogService.showNotification(totalAddedCustomer + " " + $translate.instant('TASKPROSPECTING_CUSTOMERS_ADDED_SUCCESSFULLY'), "warning");
                                        $scope.cancelProspectingCustomer();
                                    }
                                });
                        }
                    });
                    if ($scope.prospectingCustomer.id > 0) {
                        taskProspectingManager.updateProspectingCustomer($scope.prospectingCustomer).then(function (data) {
                            _.each($scope.$parent.prospectingCustomers, function (item) {
                                if (item.id == $scope.prospectingCustomer.id) {
                                    item.prospectingGoalId = $scope.prospectingCustomer.prospectingGoalId;
                                    item.phone = $scope.prospectingCustomer.phone;
                                    item.detail = $scope.prospectingCustomer.detail;
                                    item.name = $scope.prospectingCustomer.name;
                                }
                            });
                        })
                    }
                    else {
                        if (totalAddedCustomer > 0) {
                            dialogService.showNotification(totalAddedCustomer + " " + $translate.instant('TASKPROSPECTING_CUSTOMERS_ADDED_SUCCESSFULLY'), "warning");
                            $scope.cancelProspectingCustomer();
                        }
                    }
                }
                else {
                    dialogService.showNotification($translate.instant('TASKPROSPECTING_PLEASE_SELECT_ATLEAST_ONE_CUSTOMER'), "warning");
                }
            }


            $scope.addNewCustomer = function () {
                $scope.customer = {
                    id: 0,
                    name: "",
                    email: "",
                    mobile: "",
                    postCode: "",
                    csvFileName: "Manually Added",
                    customerSalesDatas: [{
                        date: moment(new Date()).format("L"),
                        model: "",
                        type: "",
                        registrationNo: "",
                        offer: 0,
                        seller: "",
                        csvFileName: "Manually Added",
                    }]
                }
                $("#addNewCustomer").modal("show");
            }
            $scope.saveNewCustomer = function () {
                taskProspectingManager.checkCustomerExist($scope.customer.mobile).then(function (isExist) {
                    if (!isExist) {
                        var customer = _.clone($scope.customer);
                        _.each(customer.customerSalesDatas, function (item) {
                            item.date = kendo.parseDate(item.date);
                        })
                        taskProspectingManager.AddNewCustomer(customer).then(function (data) {
                            if (data.id > 0) {
                                dialogService.showNotification($translate.instant('TASKPROSPECTING_NEW_CUSOTMER_ADDED_SUCCESSFULLY'), "info");
                                $("#addNewCustomer").modal("hide");
                                $scope.changeProspectingCustomerGoal();
                            }
                            else {
                            }
                        })
                    }
                    else {
                        dialogService.showNotification($translate.instant('TASKPROSPECTING_MOBILE_NUMBER_ALREADY_REGISTERED'), "warning");
                    }
                })
            }
            function nameFilter(element) {
                var names = [];
                _.each($scope.customers, function (item) {
                    if (item.name) {
                        names.push(item.name);
                    }
                })
                names = _.uniq(names);
                element.kendoAutoComplete({
                    dataSource: names,
                    placeholder: "--" + $translate.instant('TASKPROSPECTING_ENTER_NAME') + "--",
                    filtering: function (e) {
                        var filter = e.filter;
                        if (filter.operator == "startswith") {
                            if (e.sender.value() == "") {
                                e.sender.value("");
                            }
                        }
                    }
                });
            }
            $scope.$on("kendoRendered", function (event) {
                if (event.targetScope.addSalesCustomersWindow) {
                    $scope.addSalesCustomersWindow = event.targetScope.addSalesCustomersWindow;
                }
            })
            $scope.cancelProspectingCustomer = function () {
                $scope.openAddCustomerPopupMode.isPopupOpen = false;
                var dialog = $scope.addSalesCustomersWindow.data("kendoWindow");
                if (dialog) {
                    dialog.close();
                    dialog.destroy();
                }
            }
            $scope.$watch('openAddCustomerPopupMode.isPopupOpen', function (newValue, oldValue) {
                $scope.addSalesCustomersWindow = $("#addSalesCustomersWindow");
                if ($scope.addSalesCustomersWindow) {
                    if ($scope.openAddCustomerPopupMode.isPopupOpen) {
                        $scope.initOnPopupOpen();
                        if (!($scope.addSalesCustomersWindow.data("kendoWindow"))) {
                            $scope.addSalesCustomersWindow.kendoWindow({
                                width: "55%",
                                height: "600px",
                                title: $translate.instant('TASKPROSPECTING_ADD_CUSTOMER'),
                                modal: true,
                                visible: false,
                                close: function () { this.destroy(); },
                                actions: ['Maximize', 'Close']
                            });
                            var dialog = $scope.addSalesCustomersWindow.data("kendoWindow");
                            dialog.open().center();
                        }
                    }
                    else {
                        var dialog = $scope.addSalesCustomersWindow.data("kendoWindow");
                        if (dialog) {
                            dialog.close();
                            dialog.destroy();
                        }
                        $scope.openAddCustomerPopupMode.isPopupOpen = false;
                        //$scope.editingTraining = null;
                        //$scope.taskDetailWindow.close();
                    }
                }
            });
        }])