
angular.module('ips.emails')
    .config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
        var baseEmailsResolve = {
            emails: function (emailsManager) {
                return emailsManager.getAllInboxEmails().then(function (data) {
                    return data;
                });
            },
            pageName: function ($translate) {
                return $translate.instant('EMAIL_ALL_EMAILS');//'All Emails';
            },
        };
        var baseEmailViewResolve = {
            email: function (emailsManager, $stateParams, localStorageService) {
                if ($stateParams.id == 0) {
                    var gmailDetail = localStorageService.get("gmailDetail");
                    if (gmailDetail) {
                        return emailsManager.getGmailById(gmailDetail).then(function (data) {
                            data.sentTime = moment(kendo.parseDate(data.sentTime)).format("L LT")
                            return data;
                        });
                    }
                }
                else {
                    return emailsManager.getEmailById($stateParams.id).then(function (data) {
                        data.sentTime = moment(kendo.parseDate(data.sentTime)).format("L LT")
                        return data;
                    });
                }
            },
            pageName: function ($translate) {
                return $translate.instant('EMAIL_EMAIL_DETAIL');//'Email Detail';
            },
        };
        var baseNewEmailResolve = {
            pageName: function ($translate) {
                return $translate.instant('EMAIL_EMAIL_DETAIL');//'Email Detail';
            },
        };
        $stateProvider
            .state('emails', {
                url: "/emails",
                templateUrl: "views/emails/views/emails.html",
                controller: "EmailListCtrl",
                resolve: baseEmailsResolve,
                data: {
                    displayName: '{{pageName}}',
                    resource: "Emails"
                }
            })
            .state('newemail', {
                url: "/newemail",
                templateUrl: "views/emails/views/newEmail.html",
                controller: "newEmailCtrl",
                resolve: baseNewEmailResolve,
                data: {
                    displayName: '{{pageName}}',
                    resource: "Emails"
                }
            })
            .state('viewemail', {
                url: "/viewemail/:id",
                templateUrl: "views/emails/views/viewEmail.html",
                controller: "EmailCtrl",
                resolve: baseEmailViewResolve,
                data: {
                    displayName: '{{pageName}}',
                    resource: "Emails"
                }
            })
    }])
    .filter('trusted', function ($sce) {
        return function (html) {
            return $sce.trustAsHtml(html)
        }
    })
    .controller('EmailListCtrl', ['$scope', '$location', '$compile', 'authService', 'progressBar', 'cssInjector', 'emailsManager', 'dialogService', 'emails', '$translate', 'localStorageService',
        function ($scope, $location, $compile, authService, progressBar, cssInjector, emailsManager, dialogService, emails, $translate, localStorageService) {
            cssInjector.removeAll();
            //cssInjector.add('css/components.min.css');
            //cssInjector.add('css/default.min.css');
            cssInjector.add('views/emails/emails.css');
            $scope.emails = new kendo.data.ObservableArray([]); //emails;
            $scope.unReadCount = 0;
            $scope.filterOptions = {
                unreadOnly: false
            };
            var unreadMails = _.filter(emails, function (emailItem) {
                return emailItem.isRead == false;
            })
            $scope.unReadCount = unreadMails.length;
            _.each(emails, function (emailItem) {
                $scope.emails.push(emailItem);
            })
            $scope.dataSource = function () {
                return new kendo.data.DataSource({
                    type: "json",
                    data: $scope.emails,
                    pageSize: 10,
                    schema: {
                        model: {
                            id: "id",
                            fields: {
                                id: { type: 'number', },
                                subject: { type: 'string' },
                                toAddress: { type: 'string' },
                                ccAddress: { type: 'string' },
                                sentTime: { type: 'datetime' },
                            }
                        }
                    },
                    sort: { field: "sentTime", dir: "desc" },
                });
            };

            $scope.viewEmail = function (id, messageId) {
                if (messageId != "null") {
                    $scope.gmailDetail.isSentMail = $scope.isGmailSentBox;
                    $scope.gmailDetail.messageId = messageId;
                    localStorageService.set("gmailDetail", $scope.gmailDetail)
                }
                $location.path("/viewemail/" + id);
            }
            $scope.goToNewEmail = function () {
                $location.path("/newemail");
            }
            $scope.isInbox = true;
            $scope.isSentBox = false;
            $scope.isGmailInbox = false;
            $scope.isGmailSentBox = false;
            $scope.isGmailLoggedIn = false;
            $scope.isGmailLoggedFailed = false;
            $scope.loadEmailsGrid = function () {
                if ($("#emailsGrid").data("kendoGrid")) {
                    $("#emailsGrid").kendoGrid("destroy");
                    $("#emailsGrid").html("");
                }
                $("#emailsGrid").kendoGrid({
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
                            field: "subject", title: $translate.instant('EMAIL_SUBJECT'), width: "250px"
                        },
                        { field: "fromAddress", title: $translate.instant('EMAIL_FROM'), width: "200px" },
                        { field: "toAddress", title: $translate.instant('EMAIL_TO'), width: "200px" },
                        { field: "ccAddress", title: $translate.instant('EMAIL_CC'), width: "200px" },
                        {
                            field: "sentTime", title: $translate.instant('EMAIL_SENT_TIME'), filterable: false, width: "170px",
                            template: function (dataItem) {
                                return moment(kendo.parseDate(dataItem.sentTime)).format("L LT");
                            }
                        },
                        {
                            field: "hasAttachment", title: "Attachment", filterable: false, width: "50px",
                            template: function (dataItem) {
                                if (dataItem.hasAttachment) {
                                    return "<i class='fa fa-files-o fa-lg'></i>"
                                }
                                else {
                                    return "";
                                }
                            }
                        },
                        //{ field: "isUserEmail", title: "Is User Email" },
                        //{ field: "isSentEmail", title: "Is Sent Email" },
                        //{ field: "isReceivedEmail", title: "Is Received Email" },
                        {
                            field: "", sortable: false, filterable: false, width: "70px", title: $translate.instant('COMMON_ACTIONS'), template: function (dataItem) {
                                return "<div class=''>" +
                                    "<a class='fa fa-eye fa-lg' title='View Email' ng-click='viewEmail(" + dataItem.id + ",\"" + dataItem.gmailId + "\")'></a>" +
                                    "</div>"
                            }
                        }
                        //{ field: "", title: "", width: 100, filterable: false }, \"" + dataItem.link + "\"
                    ]
                });
                var linkFn = $compile($("#emailsGrid"));
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

            $scope.getInboxMails = function () {
                $scope.isInbox = true;
                $scope.isSentBox = false;
                $scope.isGmailInbox = false;
                $scope.isGmailSentBox = false;
                progressBar.startProgress();
                emailsManager.getAllInboxEmails().then(function (data) {
                    progressBar.stopProgress();
                    $scope.emails = new kendo.data.ObservableArray([]); //emails;
                    _.each(data, function (emailItem) {
                        $scope.emails.push(emailItem);
                    });
                    var grid = $("#emailsGrid").data("kendoGrid");
                    if (grid) {
                        grid.dataSource.filter([]);
                        $scope.filterOptions.unreadOnly = false;
                    }
                    $scope.loadEmailsGrid();
                });
            }
            $scope.gmailDetail = {
                email: null,
                password: null,
                messageId: null,
                isSentMail: false,
            };
            $scope.getGmailInbox = function () {
                $scope.isInbox = false;
                $scope.isSentBox = false;
                $scope.isGmailInbox = true;
                $scope.isGmailSentBox = false;
                if (!$scope.isGmailLoggedIn) {
                    $scope.gmailDetail = {
                        email: authService.authentication.user.email,
                        password: null,
                        messageId: null,
                        isSentMail: false,
                    };
                    $scope.emails = new kendo.data.ObservableArray([]);
                    var grid = $("#emailsGrid").data("kendoGrid");
                    if (grid) {
                        grid.dataSource.filter([]);
                        $scope.filterOptions.unreadOnly = false;
                    }
                    $scope.loadEmailsGrid();
                }
                else {
                    $scope.checkGmailLogin();
                }
            }

            $scope.getGmailSentbox = function () {
                $scope.isInbox = false;
                $scope.isSentBox = false;
                $scope.isGmailInbox = false;
                $scope.isGmailSentBox = true;
                if (!$scope.isGmailLoggedIn) {
                    $scope.gmailDetail = {
                        email: authService.authentication.user.email,
                        password: null,
                        isSentMail: false,
                    };
                    $scope.emails = new kendo.data.ObservableArray([]);
                    $scope.loadEmailsGrid();
                }
                else {
                    $scope.checkGmailLogin();
                }
            }
            $scope.enterKey = function (event) {
                if (event.which === 13) {
                    $scope.checkGmailLogin();
                }
            }
            $scope.checkGmailLogin = function () {
                progressBar.startProgress();
                if ($scope.isGmailInbox) {
                    emailsManager.isGmailValid($scope.gmailDetail).then(function (data) {
                        progressBar.stopProgress();
                        if (data) {
                            $scope.isGmailLoggedIn = true;
                            $scope.isGmailLoggedFailed = false;
                            progressBar.startProgress();
                            emailsManager.getGmailMessages($scope.gmailDetail).then(function (data) {
                                progressBar.stopProgress();
                                $scope.emails = new kendo.data.ObservableArray([]); //emails;
                                _.each(data, function (emailItem) {
                                    $scope.emails.push(emailItem);
                                });
                                $scope.loadEmailsGrid();
                            });
                        }
                        else {
                            $scope.isGmailLoggedIn = false;
                            $scope.isGmailLoggedFailed = true;
                            dialogService.showNotification("Your gmail account  is not able to connect.", "error");
                        }
                    })
                }
                else if ($scope.isGmailSentBox) {
                    progressBar.startProgress();
                    emailsManager.isGmailValid($scope.gmailDetail).then(function (data) {
                        progressBar.stopProgress();
                        if (data) {
                            $scope.isGmailLoggedIn = true;
                            $scope.isGmailLoggedFailed = false;
                            emailsManager.getGmailSentMessages($scope.gmailDetail).then(function (data) {
                                $scope.emails = new kendo.data.ObservableArray([]); //emails;
                                _.each(data, function (emailItem) {
                                    $scope.emails.push(emailItem);
                                });
                                $scope.loadEmailsGrid();
                            });
                        }
                        else {
                            $scope.isGmailLoggedIn = false;
                            $scope.isGmailLoggedFailed = true;
                            dialogService.showNotification("Your gmail account  is not able to connect.", "error");
                        }
                    })
                }
            }
            $scope.getSentMails = function () {
                $scope.isInbox = false;
                $scope.isSentBox = true;
                $scope.isGmailInbox = false;
                $scope.isGmailSentBox = false;
                progressBar.startProgress();
                emailsManager.getAllSentEmails().then(function (data) {
                    progressBar.stopProgress();
                    $scope.emails = new kendo.data.ObservableArray([]); //emails;
                    _.each(data, function (emailItem) {
                        $scope.emails.push(emailItem);
                    });
                    var grid = $("#emailsGrid").data("kendoGrid");
                    if (grid) {
                        grid.dataSource.filter([]);
                        $scope.filterOptions.unreadOnly = false;
                    }
                    $scope.loadEmailsGrid();
                });
            }
            //$scope.loadEmailsGrid();
            $scope.isGmail = function () {
                var result = false;
                //var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                var re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
                if (re.test($scope.gmailDetail.email)) {
                    //Email valid. Procees to test if it's from the right domain (Second argument is to check that the string ENDS with this domain, and that it doesn't just contain it)
                    if ($scope.gmailDetail.email.indexOf("@gmail.com", $scope.gmailDetail.email.length - "@gmail.com".length) !== -1) {
                        //VALID
                        result = true;
                    }
                }
                return result;
            }

            $scope.isValidEmailId = function (value) {
                var result = false;
                var re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
                if (re.test(value)) {
                    //VALID
                    result = true;
                }
                return result;
            }
            $scope.showUnReadonly = function () {
                var gridFilters = [{}];
                var grid = $("#emailsGrid").data("kendoGrid");
                if (grid) {
                    if (grid.dataSource.filter()) {
                        gridFilters = grid.dataSource.filter();
                        var isUnreadFilterApplied = _.any(gridFilters.filters, function (item) {
                            return item.field == "isRead";
                        });

                        if ($scope.filterOptions.unreadOnly) {
                            if (!isUnreadFilterApplied) {
                                gridFilters.filters.push({ field: "isRead", operator: "eq", value: false })
                            }
                            else {
                                var index = _.indexOf(gridFilters.filters, function (item) {
                                    return item.field == "isRead";
                                });
                                if (index > -1) {
                                    gridFilters.filters.splice(index, 1);
                                }
                            }
                        }
                        else {
                            var index = _.findIndex(gridFilters.filters, function (item) {
                                return item.field == "isRead";
                            });
                            if (index > -1) {
                                gridFilters.filters.splice(index, 1);
                            }
                        }


                    }
                    else {

                        if ($scope.filterOptions.unreadOnly) {
                            gridFilters = {
                                logic: "and",
                                filters: [{
                                    field: "isRead",
                                    operator: "eq",
                                    value: false,
                                }],
                            }
                        }
                        else {
                            var index = _.findIndex(gridFilters.filters, function (item) {
                                return item.field == "isRead";
                            });
                            if (index > -1) {
                                gridFilters.filters.splice(index, 1);
                            }
                        }
                    }

                    grid.dataSource.filter(gridFilters)
                }
            }

            $scope.markEmailsAsRead = function () {
                $scope.selectedEmailIds = [];
                var grid = $("#emailsGrid").data("kendoGrid");
                if (grid) {
                    _.filter(grid.dataSource.data(), function (item) {
                        if (item.isRead == false) {
                            $scope.selectedEmailIds.push(item.id);
                        }
                    })

                    if ($scope.selectedEmailIds.length > 0) {
                        dialogService.showYesNoDialog($translate.instant('COMMON_CONFIRM'), $translate.instant('COMMON_ARE_YOU_SURE_YOU_WANT_TO_MARK_AS_READ')).then(
                            function () {
                                emailsManager.markEmailsAsRead($scope.selectedEmailIds).then(function (data) {
                                    $scope.loadEmailsGrid();
                                    $scope.unReadCount = 0;
                                    _.each($scope.emails, function (item) {
                                        if (item.isRead == false) {
                                            item.isRead = true;
                                        }

                                    })
                                });
                            },
                            function () {
                                //alert('No clicked');
                            });
                    }
                }
            }
        }])
    .controller('EmailCtrl', ['$scope', '$location', 'authService', '$window', '$rootScope', 'cssInjector', 'emailsManager', 'dialogService', 'email',
        function ($scope, $location, authService, $window, $rootScope, cssInjector, emailsManager, dialogService, email) {
            cssInjector.removeAll();
            //cssInjector.add('css/components.min.css');
            //cssInjector.add('css/default.min.css');
            cssInjector.add('views/emails/emails.css');
            $scope.email = email;
            $scope.backtoEmails = function () {
                $location.path("/emails");
            };
            $scope.init = function () {
                if ((!email.isRead) && (authService.authentication.user.userId != email.fromUserId)) {
                    emailsManager.markEmailAsRead(email.id).then(function () {

                    })
                }
            }
            $scope.downloadAttachment = function (fileName) {
                var link = document.createElement("a");
                var uri = webConfig.emailAttachmentController + fileName
                link.download = fileName;
                link.href = uri;
                link.click();
            }
            $scope.downloadGmailAttachment = function (fileName) {
                var link = document.createElement("a");
                var uri = webConfig.gmailAttachmentController + fileName
                link.download = fileName;
                link.href = uri;
                link.click();
            }


        }])
    .controller('newEmailCtrl', ['$scope', 'authService', '$location', 'Upload', 'cssInjector', 'emailsManager', 'dialogService', '$translate', 'localStorageService', 'progressBar',
        function ($scope, authService, $location, Upload, cssInjector, emailsManager, dialogService, $translate, localStorageService, progressBar) {
            cssInjector.removeAll();
            cssInjector.add('views/emails/emails.css');
            $scope.toAddressOrganizationUserEmails = new kendo.data.ObservableArray([]);
            $scope.ccAddressOrganizationUserEmails = new kendo.data.ObservableArray([]);
            $scope.bccAddressOrganizationUserEmails = new kendo.data.ObservableArray([]);
            $scope.currentUser = null;
            $scope.IsSendToFixedUser = false;
            $scope.toEmail = null;
            if (localStorageService.get("userEmail")) {
                $scope.IsSendToFixedUser = true;
                $scope.toEmail = localStorageService.get("userEmail")
                localStorageService.remove("userEmail")
            }
            $scope.currentUser = authService.authentication.user;
            $scope.selectedBCCCSVFile = null;
            $scope.bccCSVFiles = [];

            $scope.selectedToAddress = [];
            if ($scope.toEmail) {
                $scope.selectedToAddress.push($scope.toEmail);
                //$scope.toAddressOptions = {
                //    placeholder: $translate.instant('EMAIL_TO'),
                //    //dataTextField: "email",
                //    //dataValueField: "email",
                //    valuePrimitive: true,
                //    values: $scope.selectedToAddress,
                //    autoBind: false,
                //    value: [$scope.toEmail],
                //    dataSource: {
                //        type: "json",
                //        data: [$scope.toEmail]
                //    },
                //    enable: false,

                //    noDataTemplate: $("#noDataTemplate").html(),
                //}
            }
            else {
                //$scope.toAddressOptions = {
                //    placeholder: $translate.instant('EMAIL_TO'),
                //    valuePrimitive: true,
                //    values: $scope.selectedToAddress,
                //    autoBind: false,
                //    dataSource: $scope.toAddressDataSource,
                //};
            }

            $scope.selectedCCAddress = [];
            if ($scope.toEmail) {
                //$scope.ccAddressOptions = {
                //    placeholder: $translate.instant('EMAIL_CC'),
                //    //dataTextField: "email",
                //    //dataValueField: "email",
                //    valuePrimitive: false,
                //    autoBind: false,

                //    dataSource: {
                //        type: "json",
                //        data: []
                //    },
                //    enable: false,
                //}
            }
            else {
                //$scope.ccAddressOptions = {
                //    placeholder: $translate.instant('EMAIL_CC'),
                //    //dataTextField: "email",
                //    //dataValueField: "email",
                //    valuePrimitive: false,
                //    autoBind: false,
                //    dataSource: {
                //        type: "json",

                //        transport: {
                //            read: function (options) {
                //                emailsManager.getUsersByEmail("").then(function (data) {
                //                    $scope.organizationUserEmails = [];
                //                    _.each(data, function (item) {
                //                        if (item.email != null) {
                //                            if (!($scope.selectedToAddress.indexOf(item.email) > -1 || $scope.selectedCCAddress.indexOf(item.email) > -1 || $scope.selectedBCCAddress.indexOf(item.email) > -1 || $scope.currentUser.email == item.email)) {
                //                                $scope.organizationUserEmails.push(item.email);
                //                            }
                //                        }
                //                        options.success(_.uniq($scope.organizationUserEmails));
                //                    });
                //                })
                //            }
                //        }
                //    }
                //}
            }
            $scope.selectedBCCAddress = [];
            if ($scope.toEmail) {
                //$scope.bccAddressOptions = {
                //    placeholder: $translate.instant('EMAIL_BCC'),
                //    //dataTextField: "email",
                //    //dataValueField: "email",
                //    valuePrimitive: false,
                //    autoBind: false,
                //    enable: false,
                //    dataSource: {
                //        type: "json",
                //        data: []
                //    }
                //}
            }
            else {
                //$scope.bccAddressOptions = {
                //    placeholder: $translate.instant('EMAIL_BCC'),
                //    //dataTextField: "email",
                //    //dataValueField: "email",
                //    valuePrimitive: false,
                //    autoBind: false,
                //    dataSource: {
                //        type: "json",
                //        transport: {
                //            read: function (options) {
                //                emailsManager.getUsersByEmail("").then(function (data) {
                //                    $scope.organizationUserEmails = [];
                //                    _.each(data, function (item) {
                //                        if (item.email != null) {
                //                            if (!($scope.selectedToAddress.indexOf(item.email) > -1 || $scope.selectedCCAddress.indexOf(item.email) > -1 || $scope.selectedBCCAddress.indexOf(item.email) > -1 || $scope.currentUser.email == item.email)) {
                //                                $scope.organizationUserEmails.push(item.email);
                //                            }
                //                        }
                //                        options.success(_.uniq($scope.organizationUserEmails));

                //                    });
                //                })
                //            }
                //        }
                //    }
                //}
            }


            $scope.newEmail = {
                subject: null,
                message: null,
                toAddress: null,
                ccAddress: null,
                bccAddress: null,
                toUserId: null,
                fromUserId: null,
                ipsEMailAttachments: []
            }
            $scope.AllAddress = new kendo.data.ObservableArray([]);

            $scope.init = function () {
                progressBar.startProgress();
                emailsManager.getUsersByEmail("").then(function (data) {
                    progressBar.stopProgress();
                    $scope.AllAddress = new kendo.data.ObservableArray([]);
                    $scope.toAddressOrganizationUserEmails = new kendo.data.ObservableArray([]);
                    $scope.bccCSVFiles = [];
                    _.each(data, function (item) {
                        if (item.email != null) {
                            if (!($scope.selectedToAddress.indexOf(item.email) > -1 || $scope.selectedCCAddress.indexOf(item.email) > -1 || $scope.selectedBCCAddress.indexOf(item.email) > -1 || $scope.currentUser.email == item.email)) {
                                $scope.toAddressOrganizationUserEmails.push(item.email);
                                $scope.ccAddressOrganizationUserEmails.push(item.email);
                                $scope.bccAddressOrganizationUserEmails.push(item.email);
                                $scope.AllAddress.push({ email: item.email, csvFileName: item.csvFileName, firstName: item.firstName, lastName: item.lastName, isChecked: false });
                                $scope.bccCSVFiles.push({ value: item.csvFileName, text: item.csvFileName })
                            }
                        }
                    });
                    $scope.bccCSVFiles.unshift({ value: null, text: "-- " + $translate.instant("COMMON_SELECT") + " --" });
                    $scope.bccCSVFiles = _.unique($scope.bccCSVFiles, function (item) {
                        return item.value;
                    });
                    

                    $scope.toAddressDataSource = new kendo.data.DataSource({
                        type: "json",
                        data: $scope.toAddressOrganizationUserEmails,
                    });
                    $scope.ccAddressDataSource = new kendo.data.DataSource({
                        type: "json",
                        data: $scope.ccAddressOrganizationUserEmails,
                    });
                    $scope.bccAddressDataSource = new kendo.data.DataSource({
                        type: "json",
                        data: $scope.bccAddressOrganizationUserEmails,
                    });
                    if (!$scope.toEmail) {
                        $scope.toAddressWidget = $("#toAddress").kendoMultiSelect({
                            filter: "contains",
                            dataSource: $scope.toAddressDataSource,
                        }).data('kendoMultiSelect');
                        $scope.toAddressWidget.input.on('keydown', onToAddressKeyPress);

                    }

                    $scope.ccAddressWidget = $("#ccAddress").kendoMultiSelect({
                        filter: "contains",
                        dataSource: $scope.ccAddressDataSource,
                    }).data('kendoMultiSelect');
                    $scope.ccAddressWidget.input.on('keydown', onCCAddressKeyPress);

                    $scope.bccAddressWidget = $("#bccAddress").kendoMultiSelect({
                        filter: "contains",
                        dataSource: $scope.ccAddressDataSource,
                    }).data('kendoMultiSelect');
                    $scope.bccAddressWidget.input.on('keydown', onBCCAddressKeyPress);

                })
            }
            $scope.changeBCCCSVFile = function (selectedBCCCSVFile) {
                $scope.bccAddressOrganizationUserEmails = new kendo.data.ObservableArray([]);
                $scope.selectedBCCCSVFile = selectedBCCCSVFile;
                _.each($scope.AllAddress, function (item) {
                    if ($scope.selectedBCCCSVFile != null) {
                        if (item.csvFileName == $scope.selectedBCCCSVFile) {
                            $scope.bccAddressOrganizationUserEmails.push(item.email);
                        }
                    }
                    else {
                        $scope.bccAddressOrganizationUserEmails.push(item.email);
                    }
                });
                $scope.bccAddressDataSource = new kendo.data.DataSource({
                    type: "json",
                    data: $scope.bccAddressOrganizationUserEmails,
                });
                $scope.bccAddressWidget.value([]);
                $scope.bccAddressWidget.setDataSource($scope.bccAddressDataSource);
                $scope.bccAddressWidget.refresh();
                if ($scope.selectedBCCCSVFile != null) {
                    $scope.bccAddressWidget.value($scope.bccAddressOrganizationUserEmails);
                }
            }
            function onToAddressKeyPress(e) {
                if (event.which == 13 || event.keyCode == 13 || event.which == 9 || event.keyCode == 9) {
                    selectToAddressValue($scope.toAddressWidget.input.val());
                }

            }
            function selectToAddressValue(value) {
                if ($scope.isValidEmailId(value)) {
                    var newEmail = addEmailToAddressSource(value);
                    addToAddressSelectedValues(newEmail);
                }
                else {
                    dialogService.showNotification("Invalid Email! Please enter valid email address");
                }
            }
            function addEmailToAddressSource(newEmail) {
                if (newEmail == "") {
                    return;
                }
                var newItem = newEmail;
                //$scope.selectedToAddress.push(newItem);
                $scope.toAddressOrganizationUserEmails.push(newItem);
                $scope.toAddressDataSource = new kendo.data.DataSource({
                    type: "json",
                    data: $scope.toAddressOrganizationUserEmails,
                });
                $scope.toAddressWidget.setDataSource($scope.toAddressDataSource);
                $scope.toAddressWidget.refresh();
                return newItem;
            }
            function addToAddressSelectedValues(productId) {
                var existingProduct = $scope.toAddressWidget.dataSource.data().find(function (element) {
                    return element === productId;
                });
                if (existingProduct) {
                    // Add to selected values

                    $scope.toAddressWidget.value($scope.toAddressWidget.value().concat([existingProduct]));
                    $scope.selectedToAddress = $scope.toAddressWidget.value();
                }
            }


            function onCCAddressKeyPress(e) {
                if (event.which == 13 || event.keyCode == 13 || event.which == 9 || event.keyCode == 9) {
                    selectCCAddressValue($scope.ccAddressWidget.input.val());
                }

            }
            function selectCCAddressValue(value) {
                if ($scope.isValidEmailId(value)) {
                    var newEmail = addEmailCCAddressSource(value);
                    addCCAddressSelectedValues(newEmail);
                }
                else {
                    dialogService.showNotification("Invalid Email! Please enter valid email address");
                }
            }
            function addEmailCCAddressSource(newEmail) {
                if (newEmail == "") {
                    return;
                }
                var newItem = newEmail;
                //$scope.selectedToAddress.push(newItem);
                $scope.ccAddressOrganizationUserEmails.push(newItem);
                $scope.ccAddressDataSource = new kendo.data.DataSource({
                    type: "json",
                    data: $scope.ccAddressOrganizationUserEmails,
                });
                $scope.ccAddressWidget.setDataSource($scope.ccAddressDataSource);
                $scope.ccAddressWidget.refresh();
                return newItem;
            }
            function addCCAddressSelectedValues(productId) {
                var existingProduct = $scope.ccAddressWidget.dataSource.data().find(function (element) {
                    return element === productId;
                });
                if (existingProduct) {
                    // Add to selected values
                    $scope.ccAddressWidget.value($scope.ccAddressWidget.value().concat([existingProduct]));
                    $scope.selectedCCAddress = $scope.ccAddressWidget.value();
                }
            }


            function onBCCAddressKeyPress(e) {
                if (event.which == 13 || event.keyCode == 13 || event.which == 9 || event.keyCode == 9) {
                    selectBCCAddressValue($scope.bccAddressWidget.input.val());
                }

            }
            function selectBCCAddressValue(value) {
                if ($scope.isValidEmailId(value)) {
                    var newEmail = addEmailBCCAddressSource(value);
                    addBCCAddressSelectedValues(newEmail);
                }
                else {
                    dialogService.showNotification("Invalid Email! Please enter valid email address");
                }
            }
            function addEmailBCCAddressSource(newEmail) {
                if (newEmail == "") {
                    return;
                }
                var newItem = newEmail;
                //$scope.selectedToAddress.push(newItem);
                $scope.bccAddressOrganizationUserEmails.push(newItem);
                $scope.bccAddressDataSource = new kendo.data.DataSource({
                    type: "json",
                    data: $scope.bccAddressOrganizationUserEmails,
                });
                $scope.bccAddressWidget.setDataSource($scope.bccAddressDataSource);
                $scope.bccAddressWidget.refresh();
                return newItem;
            }
            function addBCCAddressSelectedValues(productId) {
                var existingProduct = $scope.bccAddressWidget.dataSource.data().find(function (element) {
                    return element === productId;
                });
                if (existingProduct) {
                    // Add to selected values
                    $scope.bccAddressWidget.value($scope.bccAddressWidget.value().concat([existingProduct]));
                    $scope.selectedBCCAddress = $scope.bccAddressWidget.value();
                }
            }


            $scope.ccAddressClick = function () {
                $scope.isCCAddress = (!$scope.isCCAddress);
            }
            $scope.bccAddressClick = function () {
                $scope.isBCCAddress = (!$scope.isBCCAddress);
            }
            $scope.backtoEmails = function () {
                $location.path("/emails");
            }
            $scope.upload = [];
            $scope.emailAttachments = [];
            $scope.onFileSelect = function ($files) {
                for (var i = 0; i < $files.length; i++) {
                    var $file = $files[i];
                    (function (index) {
                        $scope.upload[index] = Upload.upload({
                            url: "../api/api/upload/emailAttachment",
                            method: "POST",
                            file: $file
                        }).progress(function (evt) {
                            console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));
                        }).success(function (data) {
                            $scope.emailAttachement = {
                                resourceType: $file.type,
                                title: $file.name,
                                name: data,
                                size: $file.size,
                                index: index,
                            }
                            $scope.emailAttachments.push($scope.emailAttachement);
                        }).error(function (data) {
                            dialogService.showNotification(data, 'warning');
                        });
                    })(i);
                }
            };
            $scope.removeAttachment = function (fileName) {
                $scope.emailAttachments = _.filter($scope.emailAttachments, function (item) {
                    return item.name != fileName;
                });
                emailsManager.removeEmailAttachment(fileName).then(function (data) {
                });
            }
            $scope.sendEmail = function () {
                _.each($scope.emailAttachments, function (dataItem) {
                    $scope.newEmail.ipsEMailAttachments.push({ fileName: dataItem.name });
                })
                if ($scope.toAddressWidget) {
                    $scope.selectedToAddress = $scope.toAddressWidget.value();
                }
                $scope.selectedCCAddress = $scope.ccAddressWidget.value();
                $scope.selectedBCCAddress = $scope.bccAddressWidget.value();
                if ($scope.selectedToAddress.length > 0) {
                    $scope.newEmail.toAddress = $scope.selectedToAddress.join(',');
                    $scope.newEmail.ccAddress = $scope.selectedCCAddress.join(',');
                    $scope.newEmail.bccAddress = $scope.selectedBCCAddress.join(',');
                    emailsManager.sendEmail($scope.newEmail).then(function (data) {
                        if (data) {
                            dialogService.showNotification("Mail sent", "info");
                            $location.path("/emails");
                        }
                    })
                }
            }
            $scope.cancelEmail = function () {
                $scope.newEmail = {
                    subject: null,
                    message: null,
                    toAddress: null,
                    ccAddress: null,
                    bccAddress: null,
                    toUserId: null,
                    fromUserId: null,
                    ipsEMailAttachments: []
                }
                $scope.selectedToAddress = [];
                $scope.selectedCCAddress = [];
                $scope.selectedBCCAddress = [];
                $("#attachmentFiles").val("");
                $scope.upload = [];
                $scope.emailAttachments = [];
            }
            $scope.downloadAttachment = function (fileName) {
                var link = document.createElement("a");
                var uri = webConfig.emailAttachmentController + fileName
                link.download = fileName;
                link.href = uri;
                link.click();
            }

            $scope.isValidEmailId = function (value) {
                var result = false;
                var re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
                if (re.test(value)) {
                    //VALID
                    result = true;
                }
                return result;
            }

            setSignature();
            function setSignature() {

                authService.getCurrentUser().then(function (data) {
                    var html = "</br></br><div>Best Regards</div><div>" + authService.authentication.user.firstName + " " + authService.authentication.user.lastName + "</div> <div>" + data.data.organizationName
                        + "</div>";
                    $scope.newEmail.message = html;
                })

            }

        }])




