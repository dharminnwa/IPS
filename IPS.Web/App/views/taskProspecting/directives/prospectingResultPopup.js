angular.module('ips.taskProspecting')
    .directive('prospectingResultPopup', [function () {
        return {
            restrict: 'E',
            templateUrl: 'views/taskProspecting/directives/prospectingResultPopup.html',
            scope: {
                prospectingGoalId: '=',
                skillId: "=",
                seqNo: "=",
                prospectingGoalActivityInfoes: "=",
                skillsForAll: "=",
                topBoxFilterOption: "=",
                openProspectingResultPopupMode: '=',
            },
            controller: 'prospectingResultPopupCtrl'
        };
    }])
    .controller('prospectingResultPopupCtrl', ['$scope', 'taskProspectingManager', 'dialogService', '$translate', 'progressBar',
        function ($scope, taskProspectingManager, dialogService, $translate, progressBar) {
            $scope.prospectingResultWindow = null;
            $scope.resultFilterOptionEnums = {
                Monthly: 1,
                Weekly: 2,
                Total: 3,
                Today: 4,
            };
            var startDay = moment();
            $scope.todayStartDate = moment().startOf("day")._d;
            var endDay = moment();
            $scope.todayEndDate = moment().endOf('day')._d;
            $scope.initOnPopupOpen = function () {
                progressBar.startProgress();
                taskProspectingManager.getProspectingSkillResultByGoalId($scope.prospectingGoalId, $scope.skillId).then(function (data) {
                    progressBar.stopProgress();
                    _.each($scope.skillsForAll, function (item) {
                        if (item.seqNo == $scope.seqNo) {
                            $scope.prospectingResultFor = item.skillName;
                        }
                    })

                    var columns = [];
                    var aggregates = [];
                    if (data.length > 0) {
                        columns.push({
                            field: "customerName", title: $translate.instant('COMMON_NAME'),
                        });
                        columns.push({
                            field: "mobile", title: $translate.instant('COMMON_MOBILE'), attributes: {
                                "class": "text-center"
                            },
                            headerAttributes: {
                                "class": "text-center",
                            }
                        });
                        if ($scope.seqNo == 2) {
                            columns.push({
                                field: "duration", title: $translate.instant('COMMON_DURATION'),
                                template: function (data) {
                                    if (data.duration) {
                                        return "<span class='text-center'>" + data.duration + " Min<\span>";
                                    }
                                    else {
                                        return "";
                                    }
                                },
                                headerAttributes: {
                                    "class": "text-center",
                                },
                                attributes: {
                                    "class": "text-center"
                                }
                            });
                            columns.push({
                                field: "customerInterestRate", title: $translate.instant('TASKPROSPECTING_CUSTOMER_INTEREST_RATE'),
                                template: function (data) {
                                    if (data.customerInterestRate) {
                                        return "<span class='text-center'>" + data.customerInterestRate + "%<\span>";
                                    }
                                    else {
                                        return "";
                                    }
                                },
                                headerAttributes: {
                                    "class": "text-center",
                                },
                                attributes: {
                                    "class": "text-center"
                                }
                            });
                            columns.push({
                                field: "reason", title: $translate.instant('TASKPROSPECTING_REASON'),
                                headerAttributes: {
                                    "class": "text-center",
                                },
                                attributes: {
                                    "class": "text-center"
                                }

                            });
                            columns.push({
                                field: "result", title: $translate.instant('COMMON_IS_MEETING'),
                                template: function (data) {
                                    if (data.isMeeting) {
                                        return "<span class='text-center' title='" + data.description + "'>" + data.result + " at " + moment(kendo.parseDate(data.scheduleTime)).format('L LT') + "<\span>"
                                    }
                                    else {
                                        return ""
                                    }
                                },
                                headerAttributes: {
                                    "class": "text-center",
                                },
                                attributes: {
                                    "class": "text-center"
                                }
                            });
                            columns.push({
                                field: "result", title: $translate.instant('COMMON_FOLLOW_UP'),
                                template: function (data) {
                                    if (data.isFollowUp) {
                                        return "<span class='text-center' title='" + data.description + "'>" + data.result + " at " + moment(kendo.parseDate(data.scheduleTime)).format('L LT') + "<\span>"
                                    }
                                    else {
                                        return ""
                                    }
                                },
                                headerAttributes: {
                                    "class": "text-center",
                                },
                                attributes: {
                                    "class": "text-center"
                                }
                            });
                        }
                        if ($scope.seqNo == 3) {
                            columns.push({
                                field: "result", title: $translate.instant('COMMON_IS_MEETING'),
                                template: function (data) {
                                    if (data.isMeeting) {
                                        return "<span class='text-center' title='" + data.description + "'>" + data.result + " at " + moment(kendo.parseDate(data.scheduleTime)).format('L LT') + "<\span>"
                                    }
                                    else {
                                        return ""
                                    }
                                },
                                headerAttributes: {
                                    "class": "text-center",
                                },
                                attributes: {
                                    "class": "text-center"
                                }
                            });
                        }
                        var gridData = [];
                        _.each(data, function (datItem) {
                            if ($scope.seqNo == 3) {
                                datItem.isMeeting = true;
                                datItem.isFollowUp = false;
                                datItem.isNoMeeting = false;
                            }
                            var rowdata = {
                                customerName: datItem.prospectingCustomer.name,
                                prospectingActivityId: datItem.prospectingActivityId,
                                mobile: datItem.prospectingCustomer.phone,
                                duration: datItem.duration,
                                isNoMeeting: datItem.isNoMeeting,
                                isFollowUp: datItem.isFollowUp,
                                isMeeting: datItem.isMeeting,
                                customerInterestRate: datItem.customerInterestRate,
                                reason: datItem.reason,
                                result: datItem.isMeeting ? 'Meeting Scheduled' : (datItem.isFollowUp ? 'Follow up Scheduled' : 'Not Interested'),
                                description: datItem.description,
                                scheduleTime: datItem.scheduleTime,
                            }
                            if ($scope.seqNo == 1) {
                                rowdata.result = "Called";
                            }


                            gridData.push(rowdata);
                        })
                    }
                    var prospectingGoalActivityInfoes = _.filter($scope.prospectingGoalActivityInfoes, function (item) {
                        return item.prospectingGoalId == $scope.prospectingGoalId;
                    });
                    var activities = [];
                    _.each(prospectingGoalActivityInfoes, function (item) {
                        _.each(item.prospectingActivities, function (prospectingActivity) {
                            activities.push(prospectingActivity);
                        })
                    });
                    var allStartDates = [];
                    var allEndDates = [];
                    _.each(activities, function (item) {
                        allStartDates.push(moment(kendo.parseDate(item.activityStart)).format("L"))
                        allEndDates.push(moment(kendo.parseDate(item.activityEnd)).format("L LT"))
                    });
                    if ($scope.resultFilterOptionEnums.Total == $scope.topBoxFilterOption.topboxResultOptionId) {

                    }
                    else if ($scope.resultFilterOptionEnums.Today == $scope.topBoxFilterOption.topboxResultOptionId) {
                        var todayActivities = _.filter(activities, function (activityItem) {
                            return kendo.parseDate(activityItem.activityStart) >= $scope.todayStartDate && kendo.parseDate(activityItem.activityEnd) <= $scope.todayEndDate
                        });
                        gridData = _.filter(gridData, function (item) {
                            var isItemExist = _.any(todayActivities, function (todayItem) {
                                return todayItem.id == item.prospectingActivityId;
                            });
                            return isItemExist;
                        })
                    }
                    else if ($scope.resultFilterOptionEnums.Weekly == $scope.topBoxFilterOption.topboxResultOptionId) {
                        var weeklyActivities = _.filter(activities, function (activityItem) {
                            return kendo.parseDate(activityItem.activityStart) >= $scope.weekStartDate && kendo.parseDate(activityItem.activityEnd) <= $scope.weekEndDate
                        });
                        gridData = _.filter(gridData, function (item) {
                            var isItemExist = _.any(weeklyActivities, function (weeklyItem) {
                                return weeklyItem.id == item.prospectingActivityId;
                            });
                            return isItemExist;
                        })
                    }
                    else if ($scope.resultFilterOptionEnums.Monthly == $scope.topBoxFilterOption.topboxResultOptionId) {
                        var monthlyActivities = _.filter(activities, function (activityItem) {
                            return kendo.parseDate(activityItem.activityStart) >= $scope.monthStartDate && kendo.parseDate(activityItem.activityEnd) <= $scope.monthEndDate
                        });
                        gridData = _.filter(gridData, function (item) {
                            var isItemExist = _.any(monthlyActivities, function (monthlyItem) {
                                return monthlyItem.id == item.prospectingActivityId;
                            });

                            return isItemExist;
                        })
                    }
                    if ($("#prospectingResultGrid").data("kendoGrid")) {
                        $("#prospectingResultGrid").kendoGrid("destroy");
                        $("#prospectingResultGrid").html("");
                    }
                    $("#prospectingResultGrid").kendoGrid({
                        dataSource: {
                            type: "json",
                            data: gridData,
                            //group: { field: "profileid", field: "skill" },
                            pageSize: 10,
                        },
                        groupable: false, // this will remove the group bar
                        columnMenu: false,
                        filterable: false,
                        pageable: true,
                        sortable: true,
                        columns: columns,
                    });
                    $("#prospectingResultGrid").kendoTooltip({
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
                    });
                })
            }
            $scope.$on("kendoRendered", function (event) {
                if (event.targetScope.prospectingResultWindow) {
                    $scope.prospectingResultWindow = event.targetScope.prospectingResultWindow;
                }
            })
            $scope.$watch('openProspectingResultPopupMode.isPopupOpen', function (newValue, oldValue) {
                $scope.prospectingResultWindow = $("#prospectingResultWindow");
                if ($scope.prospectingResultWindow) {
                    if ($scope.openProspectingResultPopupMode.isPopupOpen) {
                        $scope.initOnPopupOpen();
                        if (!($scope.prospectingResultWindow.data("kendoWindow"))) {
                            $scope.prospectingResultWindow.kendoWindow({
                                width: "55%",
                                height: "600px",
                                title: $translate.instant('TASKPROSPECTING_RESULT'),
                                modal: true,
                                visible: false,
                                close: function () { this.destroy(); },
                                actions: ['Maximize', 'Close']
                            });
                            var dialog = $scope.prospectingResultWindow.data("kendoWindow");
                            dialog.open().center();
                        }
                    }
                    else {
                        var dialog = $scope.prospectingResultWindow.data("kendoWindow");
                        if (dialog) {
                            dialog.close();
                            dialog.destroy();
                        }
                        $scope.openProspectingResultPopupMode.isPopupOpen = false;
                    }
                }
            });
        }])