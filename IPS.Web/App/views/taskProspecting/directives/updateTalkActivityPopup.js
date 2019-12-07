angular.module('ips.taskProspecting')
    .directive('upadteTalkActivityPopup', [function () {
        return {
            restrict: 'E',
            templateUrl: 'views/taskProspecting/directives/updateTalkActivityPopup.html',
            scope: {
                activityId: '=',
                prospectingCustomerId: "=",
                skillId: "=",
                prospectingActivityCustomerResults: "=",
                prospectingActivityFilterForResult: "=",
                openUpdateTalkActivityPopupMode: '=',
            },
            controller: 'upadteTalkActivityPopupCtrl'
        };
    }])
    .controller('upadteTalkActivityPopupCtrl', ['$scope', 'taskProspectingManager', 'dialogService', '$translate', 'progressBar',
        function ($scope, taskProspectingManager, dialogService, $translate, progressBar) {
            $scope.updateTalkActivityPopupWindow = null;
            $scope.customerActivityResultdata = [];
            $scope.customerSales = new kendo.data.ObservableArray([]);
            $scope.salesCategoryOptions = [
                { name: $translate.instant('TASKPROSPECTING_SALE_PRODUCT'), value: 1 },
                { name: $translate.instant('TASKPROSPECTING_SALE_SERVICE'), value: 2 },
                { name: $translate.instant('TASKPROSPECTING_SERVICE_REPAIR'), value: 3 },
                { name: $translate.instant('TASKPROSPECTING_SERVICE_PRODUCT'), value: 4 }
            ];
            $scope.initOnPopupOpen = function () {
                //$scope.fillGrid();
                $scope.editCustomerResult($scope.activityId, $scope.prospectingCustomerId, $scope.skillId);
            }
            $scope.editCustomerResult = function (activityId, prospectingCustomerId, skillId) {
                var prospectingCustomerResults = [];
                taskProspectingManager.getCustomerActivityResult(activityId, prospectingCustomerId).then(function (data) {
                    $scope.customerActivityResultData = _.clone(data);
                    var resultData = _.find(data, function (item) {
                        return item.skillId == skillId;
                    });
                    if (resultData) {
                        if (resultData.isMeeting) {
                            if (resultData.skill.seqNo == 2) {
                                data = _.sortBy(data, function (item) {
                                    return item.skill.seqNo;
                                });
                                var skillIndex = _.findIndex(data, function (item) {
                                    return item.skillId == skillId;
                                });
                                if (skillIndex > -1) {
                                    if (data[skillIndex + 1] != null) {
                                        resultData.nextSkillId = data[skillIndex + 1] != null ? data[skillIndex + 1].skillId : null;
                                        //resultData.prospectingSchedules = data[skillIndex + 1].prospectingSchedules;
                                    }
                                }
                            }
                            else if (resultData.skill.seqNo == 3) {
                                data = _.sortBy(data, function (item) {
                                    return item.skill.seqNo;
                                });
                                var skillIndex = _.findIndex(data, function (item) {
                                    return item.skillId == skillId;
                                });
                                if (skillIndex > -1) {
                                    if (data[skillIndex - 1] != null) {
                                        resultData.description = data[skillIndex - 1].description;
                                        resultData.duration = data[skillIndex - 1].duration;
                                        resultData.customerInterestRate = data[skillIndex - 1].customerInterestRate;
                                        resultData.reason = data[skillIndex - 1].reason;
                                    }
                                }
                            }
                        }

                    }
                    _.each($scope.$parent.viewProspectingActivityResultData, function (viewItem) {
                        _.each(viewItem.prospectingCustomerResults, function (item) {
                            prospectingCustomerResults.push(item);
                        })
                    });
                    var resultItem = _.find(prospectingCustomerResults, function (resultItem) {
                        return resultItem.prospectingCustomerId == prospectingCustomerId && resultItem.skillId == skillId && resultItem.prospectingActivityId == activityId;
                    });
                    if (resultData) {
                        $scope.prospectingActivityCustomerResult = resultData;
                        if (resultData.prospectingSchedules.length > 0) {
                            $scope.prospectingSchedule = resultData.prospectingSchedules[0];
                            $scope.prospectingSchedule.scheduleDate = moment(kendo.parseDate($scope.prospectingSchedule.scheduleDate)).format("L LT");
                            $scope.prospectingSchedule.agenda = resultData.prospectingSchedules[0].agenda;
                        }
                        else {
                            $scope.prospectingSchedule = {
                                prospectingCustomerId: prospectingCustomerId,
                                prospectingActivityId: $scope.prospectingActivityFilterForResult.id,
                                prospectingCustomerResultId: 0,
                                isMeeting: true,
                                isFollowUp: false,
                                scheduleDate: moment(new Date()).format("L LT"),
                                agenda: null
                            }
                        }

                        if (resultData.isSales) {
                            $scope.customerSales = new kendo.data.ObservableArray([]);
                            if (resultData.prospectingCustomerSalesAgreedDatas) {
                                _.each(resultData.prospectingCustomerSalesAgreedDatas, function (item) {
                                    var salesCategoy = _.find($scope.salesCategoryOptions, function (categoryItem) {
                                        return categoryItem.value == item.salesCategoryId;
                                    });
                                    if (salesCategoy) {
                                        item["salesCategory"] = { name: salesCategoy.name, value: salesCategoy.value }
                                    }
                                    item.deliveryDate = moment(kendo.parseDate(item.deliveryDate)).format("L LT");
                                    var obj = new kendo.data.ObservableObject(item);
                                    $scope.customerSales.push(obj);
                                })
                                var grid = $("#updateProspectingSalesGrid").data("kendoGrid");
                                var dataSource = getDataSource();
                                grid.setDataSource(dataSource);
                                grid.refresh();
                            }
                            //resultData.customerSales = data[skillIndex + 1].customerSales;
                        }
                        //$("#updateResultTalkedActvityModal").modal("show");
                    }
                })
            }

            $scope.updateCustomerActivityResult = function () {
                var isExist = _.any($scope.$parent.prospectingActivityCustomerResults, function (resultItem) {
                    return resultItem.prospectingCustomerId == $scope.prospectingActivityCustomerResult.prospectingCustomerId && resultItem.skillId == $scope.prospectingActivityCustomerResult.skillId && resultItem.prospectingActivityId == $scope.prospectingActivityFilterForResult.id;
                })
                if (isExist) {
                    _.each($scope.$parent.prospectingActivityCustomerResults, function (resultItem) {
                        if (resultItem.prospectingCustomerId == $scope.prospectingActivityCustomerResult.prospectingCustomerId && resultItem.skillId == $scope.prospectingActivityCustomerResult.skillId && resultItem.prospectingActivityId == $scope.prospectingActivityFilterForResult.id) {
                            resultItem.isDone = $scope.prospectingActivityCustomerResult.isDone;
                            $scope.prospectingSchedule.prospectingType = $scope.$parent.prospectingType;
                            $scope.prospectingSchedule.prospectingCustomerResultId = resultItem.id;
                            $scope.prospectingSchedule.prospectingCustomer = null;
                            $scope.prospectingActivityCustomerResult.prospectingSchedules = [$scope.prospectingSchedule];

                            if ($scope.prospectingActivityCustomerResult.isSales) {
                                $scope.prospectingActivityCustomerResult.prospectingCustomerSalesAgreedDatas = $scope.customerSales
                                _.each($scope.prospectingActivityCustomerResult.prospectingCustomerSalesAgreedDatas, function (item) {
                                    if (item.salesCategory) {
                                        item.salesCategoryId = item.salesCategory.value;
                                    }
                                })
                            }
                            $scope.meetingAggredProspectingActivityCustomerResult = null;
                            if ($scope.prospectingActivityCustomerResult.isMeeting) {
                                if ($scope.prospectingActivityCustomerResult.nextSkillId == undefined) {
                                    _.each($scope.prospectingGoals, function (goalItem) {
                                        var skillIndex = _.findIndex(goalItem.prospectingSkillGoals, function (skillItem) {
                                            return skillItem.skillId == $scope.prospectingActivityCustomerResult.skillId;
                                        });
                                        if (skillIndex > -1) {
                                            $scope.prospectingActivityCustomerResult.nextSkillId = goalItem.prospectingSkillGoals[skillIndex + 1] != null ? goalItem.prospectingSkillGoals[skillIndex + 1].skillId : null;
                                        }
                                    });
                                }
                                if ($scope.prospectingActivityCustomerResult.nextSkillId) {

                                    var oldMeetingAggredResult = _.find($scope.customerActivityResultData, function (item) {
                                        return item.skillId == $scope.prospectingActivityCustomerResult.nextSkillId;
                                    });
                                    if (oldMeetingAggredResult) {
                                        $scope.meetingAggredProspectingActivityCustomerResult = {
                                            id: oldMeetingAggredResult.id,
                                            prospectingCustomerId: $scope.prospectingActivityCustomerResult.prospectingCustomerId,
                                            prospectingActivityId: $scope.prospectingActivityCustomerResult.prospectingActivityId,
                                            skillId: $scope.prospectingActivityCustomerResult.nextSkillId,
                                            isDone: true,
                                            reason: $scope.prospectingActivityCustomerResult.reason,
                                            description: $scope.prospectingActivityCustomerResult.description,
                                            duration: $scope.prospectingActivityCustomerResult.duration,
                                            customerInterestRate: $scope.prospectingActivityCustomerResult.customerInterestRate,
                                            isFollowUp: false,
                                            isNoMeeting: false,
                                            isMeeting: true,
                                            prospectingSchedules: [],
                                            prospectingType: $scope.$parent.prospectingType,
                                        };
                                        if ($scope.prospectingSchedule) {
                                            $scope.prospectingSchedule.isFollowUp = false;
                                            $scope.prospectingSchedule.isMeeting = true;
                                            $scope.prospectingSchedule.prospectingType = $scope.$parent.prospectingType;
                                            $scope.prospectingSchedule.prospectingCustomerResultId = oldMeetingAggredResult.id;
                                            $scope.meetingAggredProspectingActivityCustomerResult.prospectingSchedules = [$scope.prospectingSchedule];
                                        }
                                    }
                                    else {
                                        $scope.meetingAggredProspectingActivityCustomerResult = {
                                            id: 0,
                                            prospectingCustomerId: $scope.prospectingActivityCustomerResult.prospectingCustomerId,
                                            prospectingActivityId: $scope.prospectingActivityCustomerResult.prospectingActivityId,
                                            skillId: $scope.prospectingActivityCustomerResult.nextSkillId,
                                            isDone: true,
                                            reason: $scope.prospectingActivityCustomerResult.reason,
                                            description: $scope.prospectingActivityCustomerResult.description,
                                            duration: $scope.prospectingActivityCustomerResult.duration,
                                            customerInterestRate: $scope.prospectingActivityCustomerResult.customerInterestRate,
                                            isFollowUp: false,
                                            isNoMeeting: false,
                                            isMeeting: true,
                                            prospectingSchedules: [],
                                            prospectingType: $scope.$parent.prospectingType,
                                        };
                                        if ($scope.prospectingSchedule) {
                                            $scope.prospectingSchedule.isFollowUp = false;
                                            $scope.prospectingSchedule.isMeeting = true;
                                            $scope.prospectingSchedule.prospectingType = $scope.$parent.prospectingType;
                                            $scope.meetingAggredProspectingActivityCustomerResult.prospectingSchedules.push($scope.prospectingSchedule);
                                        }
                                    }

                                }
                            }
                            if ($scope.meetingAggredProspectingActivityCustomerResult) {
                                //First Save as Talked and then after Svale Meeting with Schedule
                                taskProspectingManager.saveCustomerActivityResult($scope.prospectingActivityCustomerResult).then(function (data) {
                                    if (data) {
                                        $scope.$parent.prospectingActivityCustomerResults.push(data);
                                        _.each($scope.$parent.viewProspectingActivityResultData, function (viewItem) {
                                            if (viewItem.activityId == $scope.prospectingActivityFilterForResult.id && viewItem.prospectingCustomer.id == data.prospectingCustomerId) {
                                                viewItem.prospectingCustomerResults.push(data);
                                            }
                                        });
                                        taskProspectingManager.saveCustomerActivityResult($scope.meetingAggredProspectingActivityCustomerResult).then(function (data) {
                                            if (data) {
                                                dialogService.showNotification($translate.instant('TASKPROSPECTING_ACTVITY_RESULT_STORED_SUCCESSFULLY'), "info");
                                                $scope.$parent.prospectingActivityCustomerResults.push(data);
                                                _.each($scope.$parent.viewProspectingActivityResultData, function (viewItem) {
                                                    if (viewItem.activityId == $scope.prospectingActivityFilterForResult.id && viewItem.prospectingCustomer.id == data.prospectingCustomerId) {
                                                        viewItem.prospectingCustomerResults.push(data);
                                                    }
                                                });
                                                $scope.$parent.GetProjectProspectingGoalResultSummaryByUserId($scope.$parent.topBoxFilterOption.userId, $scope.$parent.topBoxFilterOption.projectId);
                                                $scope.$parent.calculateActivityResult();
                                                $scope.$parent.resultFilterOptionChanged();
                                                $scope.cancelProspectingCustomerTalked();
                                            }
                                        })
                                    }
                                })
                            }
                            else {
                                taskProspectingManager.saveCustomerActivityResult($scope.prospectingActivityCustomerResult).then(function (data) {
                                    if (data) {
                                        resultItem = data;
                                        _.each($scope.$parent.viewProspectingActivityResultData, function (viewItem) {
                                            if (viewItem.activityId == $scope.prospectingActivityFilterForResult.id && viewItem.prospectingCustomer.id == data.prospectingCustomerId) {
                                                viewItem.prospectingCustomerResults.push(data);
                                                $scope.$parent.GetProjectProspectingGoalResultSummaryByUserId($scope.$parent.topBoxFilterOption.userId, $scope.$parent.topBoxFilterOption.projectId);
                                                $scope.$parent.calculateActivityResult();
                                                $scope.$parent.resultFilterOptionChanged();
                                                $scope.cancelProspectingCustomerTalked();
                                            }
                                        });
                                    }
                                });
                            }
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
                        if ($scope.prospectingActivityCustomerResult.nextSkillId == undefined) {
                            _.each($scope.prospectingGoals, function (goalItem) {
                                var skillIndex = _.findIndex(goalItem.prospectingSkillGoals, function (skillItem) {
                                    return skillItem.skillId == $scope.prospectingActivityCustomerResult.skillId;
                                });
                                if (skillIndex > -1) {
                                    $scope.prospectingActivityCustomerResult.nextSkillId = goalItem.prospectingSkillGoals[skillIndex + 1] != null ? goalItem.prospectingSkillGoals[skillIndex + 1].skillId : null;
                                }
                            });
                        }
                        if ($scope.prospectingActivityCustomerResult.nextSkillId) {
                            $scope.meetingAggredProspectingActivityCustomerResult = {
                                id: 0,
                                prospectingCustomerId: $scope.prospectingActivityCustomerResult.prospectingCustomerId,
                                prospectingActivityId: $scope.prospectingActivityCustomerResult.prospectingActivityId,
                                skillId: $scope.prospectingActivityCustomerResult.nextSkillId,
                                isDone: true,
                                reason: $scope.prospectingActivityCustomerResult.reason,
                                description: null,
                                duration: null,
                                customerInterestRate: null,
                                isFollowUp: false,
                                isNoMeeting: false,
                                isMeeting: true,
                                prospectingSchedules: [],
                                prospectingType: $scope.$parent.prospectingType,
                            };
                            if ($scope.prospectingSchedule) {
                                $scope.prospectingSchedule.isFollowUp = false;
                                $scope.prospectingSchedule.isMeeting = true;
                                $scope.prospectingSchedule.prospectingType = $scope.$parent.prospectingType;
                                $scope.meetingAggredProspectingActivityCustomerResult.prospectingSchedules.push($scope.prospectingSchedule);
                            }
                        }
                    }
                    if ($scope.meetingAggredProspectingActivityCustomerResult) {
                        //First Save as Talked and then after Svale Meeting with Schedule
                        taskProspectingManager.saveCustomerActivityResult($scope.prospectingActivityCustomerResult).then(function (data) {
                            if (data) {
                                $scope.$parent.prospectingActivityCustomerResults.push(data);
                                _.each($scope.$parent.viewProspectingActivityResultData, function (viewItem) {
                                    if (viewItem.activityId == $scope.prospectingActivityFilterForResult.id && viewItem.prospectingCustomer.id == data.prospectingCustomerId) {
                                        viewItem.prospectingCustomerResults.push(data);
                                    }
                                });
                                taskProspectingManager.saveCustomerActivityResult($scope.meetingAggredProspectingActivityCustomerResult).then(function (data) {
                                    if (data) {
                                        dialogService.showNotification($translate.instant('TASKPROSPECTING_ACTVITY_RESULT_STORED_SUCCESSFULLY'), "info");
                                        $scope.$parent.prospectingActivityCustomerResults.push(data);
                                        _.each($scope.$parent.viewProspectingActivityResultData, function (viewItem) {
                                            if (viewItem.activityId == $scope.prospectingActivityFilterForResult.id && viewItem.prospectingCustomer.id == data.prospectingCustomerId) {
                                                viewItem.prospectingCustomerResults.push(data);
                                            }
                                        });
                                        $scope.$parent.GetProjectProspectingGoalResultSummaryByUserId($scope.$parent.topBoxFilterOption.userId, $scope.$parent.topBoxFilterOption.projectId);
                                        $scope.$parent.calculateActivityResult();
                                        $scope.$parent.resultFilterOptionChanged();
                                        $scope.cancelProspectingCustomerTalked();
                                    }
                                })
                            }
                        })
                    }
                    else {
                        if ($scope.prospectingSchedule && $scope.prospectingActivityCustomerResult.isFollowUp) {
                            $scope.prospectingSchedule.isFollowUp = true;
                            $scope.prospectingSchedule.isMeeting = false;
                            $scope.prospectingSchedule.prospectingType = $scope.$parent.prospectingType;
                            $scope.$parent.prospectingActivityCustomerResult.prospectingSchedules.push($scope.prospectingSchedule);

                        }
                        taskProspectingManager.saveCustomerActivityResult($scope.prospectingActivityCustomerResult).then(function (data) {
                            if (data) {
                                dialogService.showNotification($translate.instant('TASKPROSPECTING_ACTVITY_RESULT_STORED_SUCCESSFULLY'), "info");
                                $scope.$parent.prospectingActivityCustomerResults.push(data);
                                _.each($scope.$parent.viewProspectingActivityResultData, function (viewItem) {
                                    if (viewItem.activityId == $scope.prospectingActivityFilterForResult.id && viewItem.prospectingCustomer.id == data.prospectingCustomerId) {
                                        viewItem.prospectingCustomerResults.push(data);
                                    }
                                });
                                $scope.$parent.GetProjectProspectingGoalResultSummaryByUserId($scope.$parent.topBoxFilterOption.userId, $scope.$parent.topBoxFilterOption.projectId);
                                $scope.$parent.calculateActivityResult();
                                $scope.$parent.resultFilterOptionChanged();
                                $scope.cancelProspectingCustomerTalked();
                            }
                        })
                    }
                }
            }
            $scope.cancelProspectingCustomerTalked = function () {
                $scope.openUpdateTalkActivityPopupMode.isPopupOpen = false;
                var dialog = $scope.updateTalkActivityPopupWindow.data("kendoWindow");
                if (dialog) {
                    dialog.close();
                    dialog.destroy();
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
            $scope.gridUpdateCustomerSalesOptions = {
                dataSource: getDataSource(),
                pageable: true,
                toolbar: [{ name: "create", text: $translate.instant('TASKPROSPECTING_ADD_NEW_SALES_RECORD') }],
                editable: {
                    mode: "inline",
                },
                save: function () {
                    this.refresh();
                },
                edit: function (e) {
                    if (!e.model.id > 0) {
                        if (e.model.isNew()) {
                            e.model.id = ($scope.customerSales.length) * -1;
                            e.model.prospectingCustomerId = $scope.prospectingCustomerId;
                            e.model.prospectingActivityId = $scope.activityId;
                        }
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
                                autoBind: false,
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
                    type: "json",
                    data: $scope.customerSales,
                    pageSize: 10,
                    schema: {
                        model: {
                            id: "id",
                            fields: {
                                id: { type: 'number' },
                                salesCategory: { defaultValue: { name: "--" + $translate.instant('COMMON_SELECT') + "--", value: null } },
                                salesCategoryId: { type: 'number', validation: { required: true } },
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
                ds.read();
                return ds;
            }
            $scope.$on("kendoRendered", function (event) {
                if (event.targetScope.updateTalkActivityPopupWindow) {
                    $scope.updateTalkActivityPopupWindow = event.targetScope.updateTalkActivityPopupWindow;
                }
            })
            $scope.$watch('openUpdateTalkActivityPopupMode.isPopupOpen', function (newValue, oldValue) {
                $scope.updateTalkActivityPopupWindow = $("#updateTalkActivityPopupWindow");
                if ($scope.updateTalkActivityPopupWindow) {
                    if ($scope.openUpdateTalkActivityPopupMode.isPopupOpen) {
                        $scope.initOnPopupOpen();
                        if (!($scope.updateTalkActivityPopupWindow.data("kendoWindow"))) {
                            $scope.updateTalkActivityPopupWindow.kendoWindow({
                                width: "55%",
                                height: "600px",
                                title: $translate.instant('TASKPROSPECTING_PROSPECTING_CUSTOMER_TALKED'),
                                modal: true,
                                visible: false,
                                close: function () { this.destroy(); },
                                actions: ['Maximize', 'Close']
                            });
                            var dialog = $scope.updateTalkActivityPopupWindow.data("kendoWindow");
                            dialog.open().center();
                        }
                    }
                    else {
                        var dialog = $scope.updateTalkActivityPopupWindow.data("kendoWindow");
                        if (dialog) {
                            dialog.close();
                            dialog.destroy();
                        }
                        $scope.openUpdateTalkActivityPopupMode.isPopupOpen = false;
                    }
                }
            });
        }])