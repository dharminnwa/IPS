angular.module('ips.serviceProspecting')
    .directive('addCustomersPopup', [function () {
        return {
            restrict: 'E',
            templateUrl: 'views/serviceProspecting/directives/addCustomersPopup.html',
            scope: {
                prospectingCustomer: '=',
                prospectingGoalNames: "=",
                prospectingGoalActivityInfoes: "=",
                prospectingCustomerGoalActivities: "=",
                openAddCustomerPopupMode: '=',
            },
            controller: 'addCustomersPopupCtrl'
        };
    }])

    .controller('addCustomersPopupCtrl', ['$scope', 'serviceProspectingManager', 'dialogService', '$translate',
        function ($scope, serviceProspectingManager, dialogService, $translate) {
            $scope.addCustomersWindow;
            $scope.isSelectedAll = false;
            $scope.customerTypeOptions = [
                {
                    id: null, name: "--" + $translate.instant('COMMON_SELECT') + "--",
                },
                {
                    id: 1, name: $translate.instant('TASKPROSPECTING_DIRECT_CUSTOMERS'),
                },
                {
                    id: 2, name: $translate.instant('TASKPROSPECTING_PHASE2') + " - " + $translate.instant('TASKPROSPECTING_CLOSED_CUSTOMERS'),
                }
            ];
            $scope.prospectingCustomerTypeEnum = {
                DirectCutomer: 1,
                MeetingCustomer: 2,
            }
            $scope.newProspectingCustomers = [];
            $scope.customers = [];
            var endDay = moment();
            $scope.endOfDay = endDay.endOf('day')._d;
            var startDay = moment();
            $scope.startOfDay = startDay.startOf('day')._d;
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
                    $scope.prospectingCustomerGoalActivities = [];
                    _.each($scope.prospectingGoalActivityInfoes, function (goalActivityInfoItem) {
                        if (goalActivityInfoItem.prospectingGoalId == info.id) {
                            _.each(goalActivityInfoItem.prospectingActivities, function (item) {
                                if (!(item.stopTime)) {
                                    if (moment(kendo.parseDate(item.activityStart)).isAfter(moment($scope.startOfDay))) {
                                        $scope.prospectingCustomerGoalActivities.push(item);
                                    }
                                }

                            })
                        }
                    })
                }
            }
            $scope.changeProspectingCustomerActivity = function () {
                $scope.prospectingCustomer.prospectingGoalActivityId
                var activity = _.find($scope.prospectingCustomerGoalActivities, function (item) {
                    return item.id == $scope.prospectingCustomer.prospectingGoalActivityId;
                });
                if (activity) {
                    $scope.prospectingCustomer.scheduleDate = moment(kendo.parseDate(activity.activityStart)).format("L LT");
                }
            }
            $scope.changeProspectingCustomerType = function () {
                $scope.selectAllTriggered = false;
                $scope.isSelectedAll = false;
                $scope.newProspectingCustomers = [];
                if ($scope.prospectingCustomer.prospectingCustomerTypeId == $scope.prospectingCustomerTypeEnum.DirectCutomer) {

                    serviceProspectingManager.GetUserCustomersForGoalId($scope.prospectingCustomer.prospectingGoalId).then(function (data) {

                        $scope.customers = data;
                        $scope.customerSataSource = new kendo.data.DataSource({
                            type: "json",
                            data: $scope.customers,
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
                                        model: {
                                            type: 'string'
                                        },
                                        date: {
                                            type: 'date'
                                        },
                                        uploadDate: {
                                            type: 'date'
                                        },
                                        type: {
                                            type: 'string'
                                        },
                                        csvFileName: {
                                            type: 'string'
                                        },
                                    }
                                }
                            }
                        });
                        $scope.custmerGridOptions = {
                            dataBound: function (e) {
                                console.log("dataBound");
                                if (!$scope.isSelectedAll) {
                                    if ($("#customerGrid").data("kendoGrid")) {
                                        var customerDatas = $("#customerGrid").data("kendoGrid").dataSource.data();
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
                                    var grid = $("#customerGrid").data("kendoGrid");
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
                            dataSource: $scope.customerSataSource,
                            columnMenu: false,
                            filterable: {
                                extra: false,
                                operators: {
                                    string: {
                                        eq: "Is equal to",
                                        startswith: "Start With"
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
                                    field: "csvFileName", title: $translate.instant('TASKPROSPECTING_CSV_FILE'),
                                    filterable: {
                                        ui: csvFilter,
                                    },
                                    width: '150px'
                                },
                                {
                                    field: "uploadDate", title: $translate.instant('TASKPROSPECTING_UPLOAD_DATE'),
                                    template: function (dataItem) {
                                        if (dataItem.uploadDate) {
                                            return moment(kendo.parseDate(dataItem.uploadDate)).format("L LT");
                                        }
                                        else {
                                            return "";
                                        }
                                    },
                                    filterable: false,
                                    width: '150px'
                                },
                                {
                                    field: "name", title: $translate.instant('COMMON_NAME'), filterable: {
                                        ui: nameFilter,
                                    },
                                    width: '150px'
                                },
                                {
                                    field: "mobile", title: $translate.instant('COMMON_MOBILE'), filterable: false, width: '150px'
                                },
                                {
                                    field: "email", title: $translate.instant('COMMON_EMAIL'), filterable: false, width: '150px'
                                },
                                {
                                    field: "date", title: $translate.instant('COMMON_DATE'),
                                    template: function (dataItem) {
                                        if (dataItem.date) {
                                            return moment(kendo.parseDate(dataItem.date)).format("L LT");
                                        }
                                        else {
                                            return "";
                                        }
                                    },
                                    filterable: false, width: '150px'
                                },
                                {
                                    field: "model", title: $translate.instant('COMMON_MODEL'), filterable: {
                                        ui: modelFilter,
                                    },
                                    width: '150px'
                                },
                                {
                                    field: "type", title: $translate.instant('COMMON_TYPE'), filterable: {
                                        ui: typeFilter,
                                    }, width: '150px'
                                },
                                {
                                    field: "postCode", title: $translate.instant('COMMON_ZIP'), filterable: {
                                        ui: postCodeFilter,
                                    }, width: '100px'
                                },
                                {
                                    field: "seller", title: $translate.instant('COMMON_SELLER'), filterable: {
                                        ui: sellerFilter,
                                    }, width: '150px'
                                },
                                {
                                    field: "isFollowUp", title: $translate.instant('TASKPROSPECTING_IS_FOLLOW_UP'), template: function (dataItem) {
                                        if (dataItem.isFollowUp) {
                                            return '<span class="text-red"> Follow-up Scheduled for ' + moment(kendo.parseDate(dataItem.followUpDate)).format("L LT") + '</span>';
                                        }
                                        else {
                                            return '';
                                        }

                                    }, width: '150px'
                                }
                            ],
                        };
                        $scope.names = [];
                        $scope.models = [];
                        $scope.types = [];
                        $scope.csvFileNames = [];
                        _.each($scope.customers, function (item) {
                            $scope.names.push(item.name);
                            $scope.models.push(item.model);
                            $scope.types.push(item.type);
                            if (item.csvFileName == null || item.csvFileName == "null") {
                                $scope.csvFileNames.push({ value: item.csvFileName, text: $translate.instant('TASKPROSPECTING_MANUALLY_ADDED') });
                            }
                            else {
                                $scope.csvFileNames.push({ value: item.csvFileName, text: item.csvFileName });
                            }
                            $scope.csvFileNames.unshift({ value: -1, text: $translate.instant('COMMON_ALL') });
                        });
                        $scope.names = _.uniq($scope.names);
                        $scope.models = _.uniq($scope.models);
                        $scope.types = _.uniq($scope.types);
                        $scope.csvFileNames = _.uniq($scope.csvFileNames, function (item) {
                            return item.text;
                        });
                    })
                }
                else if ($scope.prospectingCustomer.prospectingCustomerTypeId == $scope.prospectingCustomerTypeEnum.MeetingCustomer) {
                    serviceProspectingManager.GetMeetingProspectingCustomersForGoalId($scope.prospectingCustomer.prospectingGoalId).then(function (data) {
                        $scope.customers = data;
                        $scope.customerSataSource = new kendo.data.DataSource({
                            type: "json",
                            data: $scope.customers,
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
                                        model: {
                                            type: 'string'
                                        },
                                        date: {
                                            type: 'date'
                                        },
                                        uploadDate: {
                                            type: 'date'
                                        },
                                        type: {
                                            type: 'string'
                                        },
                                    }
                                }
                            }
                        });
                        $scope.custmerGridOptions = {
                            dataBound: function (e) {
                                console.log("dataBound");
                                if (!$scope.isSelectedAll) {
                                    if ($("#customerGrid").data("kendoGrid")) {
                                        var customerDatas = $("#customerGrid").data("kendoGrid").dataSource.data();
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
                                    var grid = $("#customerGrid").data("kendoGrid");
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
                            dataSource: $scope.customerSataSource,
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
                                    field: "uploadDate", title: $translate.instant('TASKPROSPECTING_UPLOAD_DATE'),
                                    template: function (dataItem) {
                                        if (dataItem.uploadDate) {
                                            return moment(kendo.parseDate(dataItem.uploadDate)).format("L LT");
                                        }
                                        else {
                                            return "";
                                        }
                                    },
                                    filterable: false,
                                    width: '150px'
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
                                    field: "mobile", title: $translate.instant('COMMON_MOBILE'), filterable: false, width: '150px'
                                },
                                {
                                    field: "email", title: $translate.instant('COMMON_EMAIL'), filterable: false, width: '150px'
                                },
                                {
                                    field: "date", title: $translate.instant('COMMON_DATE'),
                                    template: function (dataItem) {
                                        if (dataItem.date) {
                                            return moment(kendo.parseDate(dataItem.date)).format("L LT");
                                        }
                                        else {
                                            return "";
                                        }
                                    },
                                    filterable: false, width: '150px'
                                },
                                {
                                    field: "model", title: $translate.instant('COMMON_MODEL'), filterable: {
                                        ui: modelFilter,
                                    },
                                    width: '150px'
                                },
                                {
                                    field: "type", title: $translate.instant('COMMON_TYPE'), filterable: {
                                        ui: typeFilter,
                                    }, width: '150px'
                                },
                                {
                                    field: "postCode", title: $translate.instant('COMMON_ZIP'), filterable: {
                                        ui: postCodeFilter,
                                    }, width: '100px'
                                },
                                {
                                    field: "seller", title: $translate.instant('COMMON_SELLER'), filterable: {
                                        ui: sellerFilter,
                                    }, width: '150px'
                                },
                                {
                                    field: "isFollowUp", title: $translate.instant('TASKPROSPECTING_IS_FOLLOW_UP'), template: function (dataItem) {
                                        if (dataItem.isFollowUp) {
                                            return '<span class="text-red"> Follow-up Scheduled for ' + moment(kendo.parseDate(dataItem.followUpDate)).format("L LT") + '</span>';
                                        }
                                        else {
                                            return '';
                                        }

                                    }, width: '150px'
                                }
                            ],
                        };
                        $scope.names = [];
                        _.each($scope.customers, function (item) {
                            $scope.names.push(item.name);
                        })
                        $scope.names = _.uniq($scope.names);
                        $scope.models = [];
                        _.each($scope.customers, function (item) {
                            $scope.models.push(item.model);
                        })
                        $scope.models = _.uniq($scope.models);
                        $scope.types = [];
                        _.each($scope.customers, function (item) {
                            $scope.types.push(item.type);
                        })
                        $scope.types = _.uniq($scope.types);
                    })
                }
            }
            $scope.changeProspectingCustomerCsvFile = function () {
                var grid = $("#customerGrid").data("kendoGrid");
                if (grid.dataSource._filter) {
                    var CSVFilter = _.find(grid.dataSource._filter.filters, function (item) {
                        return item.field == "csvFileName";
                    })
                    if (CSVFilter) {
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
                        grid.dataSource._filter.filters.push({ field: "csvFileName", operator: "eq", value: $scope.prospectingCustomer.csvFileName })
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
                if ($("#customerGrid").data("kendoGrid")) {
                    var grid = $("#customerGrid").data("kendoGrid");
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
                    if ($("#customerGrid").data("kendoGrid")) {
                        //var customerDatas = $("#customerGrid").data("kendoGrid").dataSource.data();
                        var grid = $("#customerGrid").data("kendoGrid");
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
                    if ($("#customerGrid").data("kendoGrid")) {
                        var customerDatas = $("#customerGrid").data("kendoGrid").dataSource.data();
                        if (customerDatas) {
                            _.each(customerDatas, function (dataItem) {
                                dataItem.isSelected = false;
                            });
                        }
                    }
                }
            }

            $scope.saveProspectingCustomer = function () {
                var grid = $("#customerGrid").data("kendoGrid");
                var gridData = new kendo.data.Query(grid.dataSource.data()).filter(grid.dataSource.filter()).data;
                var selectedCustomers = _.filter(gridData, function (item) {
                    return item.isSelected == true;
                });

                if (selectedCustomers.length > 0) {
                    $scope.addedProspectingCustomers = [];
                    _.each(selectedCustomers, function (dataItem) {
                        var customerInfo = _.clone($scope.prospectingCustomer);
                        customerInfo.customerId = dataItem.customerId;
                        customerInfo.name = dataItem.name;
                        customerInfo.phone = dataItem.mobile;
                        customerInfo.detail = dataItem.email;
                        customerInfo.customerSaleDataId = dataItem.id;
                        customerInfo.postCode = dataItem.id;
                        customerInfo.customerSalesData = {
                            model: dataItem.model,
                            type: dataItem.type,
                            seller: dataItem.seller,
                        };
                        dataItem.isSelected = true;
                        $scope.addedProspectingCustomers.push(customerInfo);
                    });
                    var totalCustomerToAdd = $scope.addedProspectingCustomers.length;
                    var totalAddedCustomer = 0;
                    _.each($scope.addedProspectingCustomers, function (prospectingCustomerItem, customerIndex) {
                        if (prospectingCustomerItem.id == 0) {
                            prospectingCustomerItem.prospectingGoalId = $scope.prospectingCustomer.prospectingGoalId,
                                prospectingCustomerItem.scheduleDate = $scope.prospectingCustomer.scheduleDate,
                                serviceProspectingManager.addProspectingCustomer(prospectingCustomerItem).then(function (data) {
                                    var prospectingCustomer = data;
                                    prospectingCustomer.scheduleDate = kendo.parseDate(prospectingCustomer.scheduleDate);
                                    prospectingCustomer.skills = [];
                                    totalAddedCustomer += 1;
                                    if (prospectingCustomer.prospectingGoalId) {
                                        serviceProspectingManager.getSkillsByProspectingGoalId(prospectingCustomer.prospectingGoalId).then(function (skillDatas) {
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
                        serviceProspectingManager.updateProspectingCustomer($scope.prospectingCustomer).then(function (data) {
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

                    }
                }
                else {
                    dialogService.showNotification($translate.instant('TASKPROSPECTING_PLEASE_SELECT_ATLEAST_ONE_CUSTOMER'), "warning");
                }
            }


            function csvFilter(element) {
                var names = [];
                _.each($scope.customers, function (item) {
                    if (item.csvFileName) {
                        names.push(item.csvFileName);
                    }
                })
                names = _.uniq(names);
                element.kendoDropDownList({
                    dataSource: names,
                    optionLabel: "--" + $translate.instant('TASKPROSPECTING_SELECT_CSV') + "--"
                });
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
            function modelFilter(element) {
                var models = [];
                _.each($scope.customers, function (item) {
                    if (item.model) {
                        models.push(item.model);
                    }
                })
                models = _.uniq(models);
                element.kendoDropDownList({
                    dataSource: models,
                    optionLabel: "--" + $translate.instant('TASKPROSPECTING_SELECT_MODEL') + "--"
                });
            }
            function typeFilter(element) {
                var types = [];
                _.each($scope.customers, function (item) {
                    if (item.type) {
                        types.push(item.type);
                    }
                })
                types = _.uniq(types);
                element.kendoDropDownList({
                    dataSource: types,
                    optionLabel: "--" + $translate.instant('TASKPROSPECTING_SELECT_TYPE') + "--"
                });
            }
            function sellerFilter(element) {
                var types = [];
                _.each($scope.customers, function (item) {
                    if (item.seller) {
                        types.push(item.seller);
                    }
                })
                types = _.uniq(types);
                element.kendoDropDownList({
                    dataSource: types,
                    optionLabel: "--" + $translate.instant('COMMON_SELECT') + "--"
                });
            }
            function postCodeFilter(element) {
                var types = [];
                _.each($scope.customers, function (item) {
                    if (item.postCode) {
                        types.push(item.postCode);
                    }
                })
                types = _.uniq(types);
                element.kendoDropDownList({
                    dataSource: types,
                    optionLabel: "--" + $translate.instant('COMMON_SELECT') + "--"
                });
            }
            $scope.$on("kendoRendered", function (event) {
                if (event.targetScope.addCustomersWindow) {
                    $scope.addCustomersWindow = event.targetScope.addCustomersWindow;
                }
            })
            $scope.cancelProspectingCustomer = function () {
                $scope.openAddCustomerPopupMode.isPopupOpen = false;
                var dialog = $scope.addCustomersWindow.data("kendoWindow");
                if (dialog) {
                    dialog.close();
                    dialog.destroy();
                }
            }
            $scope.$watch('openAddCustomerPopupMode.isPopupOpen', function (newValue, oldValue) {
                $scope.addCustomersWindow = $("#addCustomersWindow");
                if ($scope.addCustomersWindow) {
                    if ($scope.openAddCustomerPopupMode.isPopupOpen) {
                        $scope.initOnPopupOpen();
                        if (!($scope.addCustomersWindow.data("kendoWindow"))) {
                            $scope.addCustomersWindow.kendoWindow({
                                width: "55%",
                                height: "600px",
                                title: $translate.instant('TASKPROSPECTING_ADD_CUSTOMERS'),
                                modal: true,
                                visible: false,
                                close: function () { this.destroy(); },
                                actions: ['Maximize', 'Close']
                            });
                            var dialog = $scope.addCustomersWindow.data("kendoWindow");
                            dialog.open().center();
                        }
                    }
                    else {
                        var dialog = $scope.addCustomersWindow.data("kendoWindow");
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