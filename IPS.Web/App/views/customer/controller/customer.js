'use strict';
angular.module('ips.organization')
    .config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
        var baseCustomerResolve = {
            pageName: function ($translate) {
                return $translate.instant('ORGANIZATIONS_CUSTOMER');
            },
            customerInfo: function ($stateParams, organizationCustomerService) {
                return organizationCustomerService.getCustomerById($stateParams.customerId).then(function (data) {
                    return data;
                });
            },
            customerHistory: function ($stateParams, organizationCustomerService) {
                return organizationCustomerService.getCustomerHistoryById($stateParams.customerId).then(function (data) {
                    return data;
                });
            },
        };
        $stateProvider
            .state('home.organizations.organizations.customer', {
                url: "/customer/:customerId",
                templateUrl: "views/customer/views/customer.html",
                controller: "customerCtrl as customerCtrl",
                resolve: baseCustomerResolve,
                data: {
                    displayName: '{{pageName}}',//'Customer',
                    paneLimit: 1,
                    depth: 3
                }
            })
    }])
    .controller("customerCtrl", ['$scope', 'cssInjector', '$stateParams', '$location', 'dialogService', 'localStorageService', '$compile', 'customerInfo', 'customerHistory', 'organizationCustomerService', '$translate','globalVariables',
        function ($scope, cssInjector, $stateParams, $location, dialogService, localStorageService, $compile, customerInfo, customerHistory, organizationCustomerService, $translate, globalVariables) {
            cssInjector.removeAll();
            cssInjector.add('views/customer/customerinfo.css');
            moment.locale(globalVariables.lang.currentUICulture);
            $scope.resultTypeEnum = {
                All: 0,
                Registered: 1,
                AddedForProspecting: 2,
                Calls: 3,
                Talks: 4,
                Meetings: 5,
            },
                $scope.resultTypeFilterOptions = [
                    { id: 0, name: '--' + $translate.instant('COMMON_SELECT') + '--' },
                    { id: 2, name: $translate.instant('ORGANIZATIONS_ADDED_FOR_PROSPECTING') },
                    { id: 3, name: $translate.instant('COMMON_CALLS') },
                    { id: 4, name: $translate.instant('COMMON_TALKS') },
                    { id: 5, name: $translate.instant('COMMON_MEETINGS') },
                ]
            $scope.init = function () {
                if (customerInfo != null) {
                    $scope.customerInfo = customerInfo;
                    $scope.customerHistory = customerHistory;
                    $scope.filterHistoryChange($scope.resultTypeEnum.All);
                }
                else {
                    dialogService.showNotification($translate.instant('ORGANIZATIONS_CUSTOMER_INFO_NOT_FOUND'), "warning");
                }
            }
            $scope.filterHistoryChange = function (value) {
                $scope.selectedHistoryFilterValue = value;
                $scope.selectedHistoryFilterText = _.find($scope.resultTypeFilterOptions, function (item) {
                    return item.id == value;
                }).name;
            }
            $scope.filterHistory = function (item) {
                if ($scope.selectedHistoryFilterValue > 0) {
                    if ($scope.selectedHistoryFilterValue == $scope.resultTypeEnum.AddedForProspecting) {
                        if (item.resultType == $scope.resultTypeEnum.AddedForProspecting) {
                            return true;
                        }
                    }
                    if ($scope.selectedHistoryFilterValue == $scope.resultTypeEnum.Calls) {
                        if (item.resultType == $scope.resultTypeEnum.Calls && item.seqNo == 1) {
                            return true;
                        }
                    }
                    if ($scope.selectedHistoryFilterValue == $scope.resultTypeEnum.Talks) {
                        if (item.resultType == $scope.resultTypeEnum.Calls && item.seqNo == 2) {
                            return true;
                        }
                    }
                    if ($scope.selectedHistoryFilterValue == $scope.resultTypeEnum.Meetings) {
                        if (item.resultType == $scope.resultTypeEnum.Calls && item.seqNo == 3) {
                            return true;
                        }
                    }
                }
                else {
                    return true;
                }
            }
            $scope.viewActivityResult = function (activityId, customerId) {
                $scope.customerActivityResults = [];
                organizationCustomerService.getCustomerActivityResult(activityId, customerId).then(function (data) {
                    _.each(data, function (item) {
                        if (item.prospectingSchedules) {
                            _.each(item.prospectingSchedules, function (prospectingScheduleItem) {
                                prospectingScheduleItem.scheduleDate = moment(kendo.parseDate(prospectingScheduleItem.scheduleDate)).format('L LT');
                            });
                        }
                    })
                    if (data.length > 2) {
                        data[1].prospectingSchedules = data[2].prospectingSchedules;
                        data.splice(2, 1);
                    }
                    $scope.customerActivityResults = data;
                    $("#customerActivityResultModel").modal("show");
                })
            }
            $scope.init();
        }])