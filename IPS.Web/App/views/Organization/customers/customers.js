angular
    .module('ips.organization')
    .config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
        var baseCRMCustomerResolve = {
            pageName: function ($translate) {
                return "CRM Customers";
            },
            organizations: function (organizationManager) {
                return organizationManager.getOrganizations().then(function (data) {
                    var organization_obj = [data.length];
                    for (var i = 0; i < data.length; i++) {
                        organization_obj[i] = {
                            id: data[i].id,
                            name: data[i].name,
                            logoLink: data[i].logoLink,
                            industryName: data[i].industry == null ? '' : data[i].industry.name,
                            countryImage: data[i].country == null ? '' : data[i].country.flagImage,
                            contactName: data[i].contactName
                        };
                    }
                    return organization_obj
                });
            },
            organizationUsers: function ($stateParams, organizationManager, authService) {
                if ($stateParams.organizationId > 0) {
                    return organizationManager.getOrganizationUsers($stateParams.organizationId).then(function (data) {
                        if (data) {
                            return data;
                        }
                    });
                }
                else {
                    return organizationManager.getOrganizationUsers(authService.authentication.user.organizationId).then(function (data) {
                        if (data) {
                            return data;
                        }
                    });
                }
            },
        };

        $stateProvider
            .state('home.organizations.customers', {
                url: "/customers/:organizationId",
                templateUrl: "views/organization/customers/customers.html",
                controller: "CustomersCtrl",
                resolve: baseCRMCustomerResolve,
                data: {
                    displayName: '{{pageName}}',//'Organizations',
                    paneLimit: 1,
                    depth: 2,
                    resource: "Organizations"
                }
            })

    }])
    .controller('CustomersCtrl', ['$scope', 'cssInjector', '$stateParams', 'authService', 'organizationManager', 'organizationCustomerService', '$location', 'dialogService', 'Upload', 'progressBar', 'localStorageService', '$compile', '$translate', 'globalVariables', 'organizations', 'organizationUsers',
        function ($scope, cssInjector, $stateParams, authService, organizationManager, organizationCustomerService, $location, dialogService, Upload, progressBar, localStorageService, $compile, $translate, globalVariables, organizations, organizationUsers) {
            cssInjector.removeAll();
            cssInjector.add('views/Organization/customers/customers.css');
            moment.locale(globalVariables.lang.currentUICulture);
            $scope.currentUser = authService.authentication.user;
            $scope.selectedOrganizationId = null;
            $scope.selectedOrganization = null;
            $scope.organizationUsers = organizationUsers;
            $scope.organizations = organizations;
            if ($stateParams.organizationId > 0) {
                $scope.selectedOrganizationId = $stateParams.organizationId;
                $scope.selectedOrganization = _.find(organizations, function (item) {
                    return item.id == $stateParams.organizationId;
                })

            }

            $scope.changeOrganization = function (organizationId) {
                if (organizationId > 0) {
                    $scope.selectedOrganizationId = organizationId;
                    $scope.selectedOrganization = _.find(organizations, function (item) {
                        return item.id == organizationId;
                    })
                    organizationManager.getOrganizationUsers(organizationId).then(function (usersData) {
                        organizationUsers = usersData;
                        $scope.organizationUsers = usersData;
                    });
                    var gridObj = $("#organization-customers-grid").data("kendoGrid");
                    if (gridObj) {
                        gridObj.dataSource.filter([]);
                        gridObj.dataSource.read();
                    }
                }
            }
            $scope.fileName = null;
            $scope.customers = [];
            $scope.customerFilterEnum = {
                CallsOnly: 1,
                FollowupOnly: 2,
                MeetingsOnly: 3,
                NotAgreed: 4,
                OfferSent: 5,
                OfferClose: 6,
            };
            $scope.customerFilterOptions = [
                { id: 0, name: "--" + $translate.instant('COMMON_SELECT') + "--" },
                { id: 1, name: $translate.instant('COMMON_CALLS_ONLY') },
                { id: 2, name: $translate.instant('COMMON_FOLLOWUP_ONLY') },
                { id: 3, name: $translate.instant('COMMON_MEETINGS_AGREED') },
                { id: 4, name: $translate.instant('COMMON_NOT_AGREED') },
                { id: 5, name: $translate.instant('COMMON_OFFER_SENT') },
                { id: 6, name: $translate.instant('COMMON_OFFER_CLOSE') },
            ];
            $scope.customerFilterText = $scope.customerFilterOptions[0].name;
            $scope.changeCustomerFilter = function (value, text) {
                $scope.customerFilterText = text;
                var filterSetting = [];
                if ($scope.salesManId) {
                    filterSetting.push({
                        field: 'assignedUserId',
                        operator: 'eq',
                        value: $scope.salesManId
                    })
                }
                if (value == $scope.customerFilterEnum.CallsOnly) {
                    filterSetting.push({
                        field: 'isCalled',
                        operator: 'eq',
                        value: true
                    });
                    filterSetting.push({
                        field: 'isTalked',
                        operator: 'eq',
                        value: false
                    });
                }
                else if (value == $scope.customerFilterEnum.FollowupOnly) {
                    filterSetting.push({
                        field: 'isFollowUp',
                        operator: 'eq',
                        value: true
                    });
                    filterSetting.push({
                        field: 'isOfferSent',
                        operator: 'eq',
                        value: false
                    });
                }
                else if (value == $scope.customerFilterEnum.MeetingsOnly) {
                    filterSetting.push({
                        field: 'isMeeting',
                        operator: 'eq',
                        value: true
                    });
                    filterSetting.push({
                        field: 'isOfferSent',
                        operator: 'eq',
                        value: false
                    });
                }
                else if (value == $scope.customerFilterEnum.NotAgreed) {
                    filterSetting.push({
                        field: 'isTalked',
                        operator: 'eq',
                        value: true
                    });
                    filterSetting.push({
                        field: 'isNotInterested',
                        operator: 'eq',
                        value: true
                    });
                }
                else if (value == $scope.customerFilterEnum.OfferSent) {
                    filterSetting.push({
                        field: 'isOfferSent',
                        operator: 'eq',
                        value: true
                    });
                    filterSetting.push({
                        field: 'isOfferClosed',
                        operator: 'eq',
                        value: false
                    });
                }
                else if (value == $scope.customerFilterEnum.OfferClose) {
                    filterSetting.push({
                        field: 'isOfferClosed',
                        operator: 'eq',
                        value: true
                    });
                }
                var gridObj = $("#organization-customers-grid").data("kendoGrid");
                if (gridObj) {
                    gridObj.dataSource.filter(filterSetting);
                }
            }

            $scope.loadOrganizationCustomerGrid = function () {
                $scope.organizationCustomersOptions = {
                    dataSource: {
                        type: "json",
                        transport: {
                            read: function (options) {
                                var isFilterExist = false;
                                var gridObj = $("#organization-customers-grid").data("kendoGrid");
                                if (gridObj) {
                                    if (gridObj.dataSource._filter) {
                                        if (gridObj.dataSource._filter.filters.length > 0) {
                                            isFilterExist = true;
                                        }
                                    }
                                }
                                if (!isFilterExist) {

                                    if ($scope.selectedOrganizationId) {
                                        progressBar.startProgress();
                                        organizationCustomerService.getCustomers($scope.selectedOrganizationId).then(function (data) {
                                            progressBar.stopProgress();
                                            _.each(data, function (item) {
                                                item.uploadDate = kendo.parseDate(item.uploadDate);
                                                item.date = kendo.parseDate(item.date);
                                            });
                                            $scope.customers = data;
                                            $scope.salesManId = null;
                                            $scope.salesMans = [];
                                            if ($scope.organizationUsers) {
                                                if ($scope.currentUser.isAdmin) {
                                                    $scope.salesMans = _.clone($scope.organizationUsers);
                                                    $scope.salesMans.unshift({ id: null, firstName: "All" });
                                                }
                                                else {
                                                    _.each($scope.organizationUsers, function (item) {
                                                        if ($scope.currentUser.userId == item.id) {
                                                            $scope.salesMans.push(item);
                                                            $scope.salesManId = item.id;
                                                        }
                                                    })
                                                }
                                                setTimeout(function () {
                                                    $scope.salesmanChanged();
                                                }, 100);
                                            }
                                            options.success(data);
                                        })
                                    }
                                    else {
                                        options.success([]);
                                    }

                                }
                                else {
                                    options.success($scope.customers);
                                }
                            }
                        },
                        pageSize: 100,
                    },
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
                    selectable: false,
                    sortable: true,
                    resizable: true,
                    columns: [
                        {
                            field: "uploadDate", title: $translate.instant('ORGANIZATIONS_UPLOAD_DATE'),
                            template: function (dataItem) {
                                if (dataItem.uploadDate) {
                                    return moment(kendo.parseDate(dataItem.uploadDate)).format("L LT");
                                }
                                else {
                                    return "";
                                }
                            },
                            filterable: false,
                        },
                        {
                            field: "name", title: $translate.instant('COMMON_NAME'), filterable: {
                                ui: nameFilter,
                            },
                        },
                        { field: "email", title: $translate.instant('COMMON_EMAIL') },
                        { field: "mobile", title: $translate.instant('COMMON_MOBILE') },
                        {
                            field: "date", title: $translate.instant('COMMON_SALE_DATE'),
                            template: function (dataItem) {
                                if (dataItem.date) {
                                    return moment(kendo.parseDate(dataItem.date)).format("L LT");
                                }
                                else {
                                    return "";
                                }
                            },
                            filterable: false,
                        },
                        {
                            field: "model", title: $translate.instant('COMMON_MODEL'), filterable: {
                                ui: modelFilter,
                            }
                        },
                        {
                            field: "type", title: $translate.instant('COMMON_TYPE'), filterable: {
                                ui: typeFilter,
                            }
                        },
                        {
                            field: "postCode", title: $translate.instant('COMMON_ZIP'), filterable: {
                                ui: postCodeFilter,
                            }
                        },
                        {
                            field: "seller", title: $translate.instant('COMMON_SELLER'), filterable: {
                                ui: sellerFilter,
                            }
                        },
                        {
                            field: "isCalled", title: $translate.instant('COMMON_IS_CALLED'), editable: false, filterable: false, template: function (dataItem) {
                                if (dataItem.isCalled) {
                                    return "Yes";
                                }
                                else {
                                    return "No";
                                }
                            }
                        },
                        {
                            field: "isFollowUp", title: $translate.instant('COMMON_FOLLOW_UP'), editable: false, filterable: false, template: function (dataItem) {
                                if (dataItem.isFollowUp) {
                                    return "Yes";
                                }
                                else {
                                    return "No";
                                }
                            }
                        },
                        {
                            field: "isMeeting", title: $translate.instant('COMMON_IS_MEETING'), editable: false, filterable: false, template: function (dataItem) {
                                if (dataItem.isMeeting) {
                                    return "Yes";
                                }
                                else {
                                    return "No";
                                }
                            }
                        },
                        {
                            field: "isOfferSent", title: $translate.instant('COMMON_OFFER_SENT'), editable: false, filterable: false, template: function (dataItem) {
                                if (dataItem.isOfferSent) {
                                    return "Yes";
                                }
                                else {
                                    return "No";
                                }
                            }
                        },
                        {
                            field: "isOfferClosed", title: $translate.instant('COMMON_OFFER_CLOSED'), editable: false, filterable: false, template: function (dataItem) {
                                if (dataItem.isOfferClosed) {
                                    return "Yes";
                                }
                                else {
                                    return "No";
                                }
                            }
                        },
                        {
                            field: "", title: $translate.instant('COMMON_ACTIONS'), template: function (dataItem) {
                                return "<div class='icon-groups'>" +
                                    "<a class='fa fa-eye fa-lg' title='View Customer' ng-click='organizationCustomers.viewCustomer(" + dataItem.customerId + ")'></a>" +
                                    "</div>";
                            }
                        },
                    ]
                }
                $scope.tooltipOptions = $(".organization-customers-grid").kendoTooltip({
                    filter: "th.k-header",
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
                }).data("tooltiptext");
            }
            $scope.loadOrganizationCustomerGrid();
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
                    placeholder: "--Enter Name--",
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
                    optionLabel: "--Select Model--"
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
                    optionLabel: "--Select Type--"
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
                    optionLabel: "--Select--"
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
                    optionLabel: "--Select--"
                });
            }
            $scope.onFileSelect = function ($files) {
                for (var i = 0; i < $files.length; i++) {
                    var $file = $files[i];
                    var fileMimeTypeArr = ["text/comma-separated-values", "text/csv", "application/csv", "application/vnd.ms-excel"];
                    if (fileMimeTypeArr.indexOf($file.type) > -1) {
                        (function (index) {
                            progressBar.startProgress();
                            Upload.upload({
                                url: "../api/api/upload/customerCSV",
                                method: "POST",
                                file: $file
                            }).progress(function (evt) {
                                console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));
                            }).success(function (data) {
                                progressBar.stopProgress();
                                $scope.fileName = data;
                            }).error(function (data) {
                                dialogService.showNotification(data, 'warning');
                            });
                        })(i);
                    }
                    else {
                        angular.element("#customerCsvUploadFile").val(null)
                        dialogService.showNotification($translate.instant('ORGANIZATIONS_SELECT_VALID_CSV'), "warning")
                    }
                }
            };
            $scope.salesMans = [];
            $scope.salesManId = null;
            $scope.salesmanChanged = function () {
                angular.element("#customerCsvUploadFile").val(null);
                $scope.salesManFiles = [];
                if ($scope.salesManId) {
                    var gridObj = $("#organization-customers-grid").data("kendoGrid");
                    if (gridObj) {
                        gridObj.dataSource.filter({
                            field: 'assignedUserId',
                            operator: 'eq',
                            value: $scope.salesManId
                        });
                    }
                    $scope.salesManFile = "All";
                    var grid = $("#organization-customers-grid").data("kendoGrid");
                    if (grid) {
                        var myData = new kendo.data.Query(grid.dataSource.data()).filter(grid.dataSource.filter()).data;
                        _.each(myData, function (item) {
                            if (item.csvFileName) {
                                $scope.salesManFiles.push(item.csvFileName)
                            }
                        });
                        $scope.salesManFiles = _.uniq($scope.salesManFiles);
                        $scope.salesManFiles.unshift("All");
                    }
                }
                else {
                    var gridObj = $("#organization-customers-grid").data("kendoGrid");
                    if (gridObj) {
                        //gridObj.dataSource.filter([]);
                    }
                }
            }
            $scope.salesmanChangedManually = function () {
                $scope.salesManFiles = [];
                angular.element("#customerCsvUploadFile").val(null);
                if ($scope.salesManId) {
                    var gridObj = $("#organization-customers-grid").data("kendoGrid");
                    if (gridObj) {
                        gridObj.dataSource.filter({
                            field: 'assignedUserId',
                            operator: 'eq',
                            value: $scope.salesManId
                        });
                    }
                    $scope.salesManFile = "All";
                    var grid = $("#organization-customers-grid").data("kendoGrid");
                    if (grid) {
                        var myData = new kendo.data.Query(grid.dataSource.data()).filter(grid.dataSource.filter()).data;
                        _.each(myData, function (item) {
                            if (item.csvFileName) {
                                $scope.salesManFiles.push(item.csvFileName)
                            }
                        });
                        $scope.salesManFiles = _.uniq($scope.salesManFiles);
                        $scope.salesManFiles.unshift("All");
                    }
                }
                else {
                    var gridObj = $("#organization-customers-grid").data("kendoGrid");
                    if (gridObj) {
                        gridObj.dataSource.filter([]);
                    }
                }
            }
            $scope.salesManFileChanged = function () {
                if ($scope.salesManFile) {
                    if ($scope.salesManFile != "All") {
                        var gridObj = $("#organization-customers-grid").data("kendoGrid");
                        if (gridObj) {
                            var filter = { logic: "and", filters: [] };
                            filter.filters.push({ field: "assignedUserId", operator: "eq", value: $scope.salesManId });
                            filter.filters.push({ field: "csvFileName", operator: "eq", value: $scope.salesManFile });
                            gridObj.dataSource.filter(filter);
                        }
                    }
                    else {
                        var gridObj = $("#organization-customers-grid").data("kendoGrid");
                        if (gridObj) {
                            var filter = { logic: "and", filters: [] };
                            filter.filters.push({ field: "assignedUserId", operator: "eq", value: $scope.salesManId });
                            gridObj.dataSource.filter(filter);
                        }
                    }
                }
            }
            $scope.saveCustomer = function () {
                if ($scope.fileName && $scope.selectedOrganization.id && $scope.salesManId) {
                    progressBar.startProgress();
                    organizationCustomerService.importCSV($scope.fileName, $scope.selectedOrganizationId, $scope.salesManId).then(function (data) {
                        progressBar.stopProgress();
                        if (data) {
                            $scope.fileName = null;
                            angular.element("#customerCsvUploadFile").val(null)
                            var gridObj = $("#organization-customers-grid").data("kendoGrid");
                            if (gridObj) {
                                gridObj.dataSource.filter([]);
                                gridObj.dataSource.read();
                                setTimeout(function () {
                                    $scope.salesmanChanged();
                                    $scope.salesManFile = $scope.fileName;
                                    $scope.salesManFileChanged();
                                }, 100)
                            }
                        }
                    },
                        function (data) {
                            progressBar.stopProgress();
                            dialogService.showNotification($translate.instant('ORGANIZATIONS_CUSTOMER_IMPORT_FAILED'), "warning");
                        });
                }
            }
            $scope.viewCustomer = function (id) {
                $location.path($location.path() + '/customer/' + id);
                //$location.path("/organizations/customer/" + id);
            }
            App.initSlimScroll(".scroller");
        }])