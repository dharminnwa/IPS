'use strict';

angular.module('ips.industries', ['ui.router', 'kendo.directives'])
    .config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
        var baseIndustriesResolve = {
            pageName: function ($translate) {
                return $translate.instant('LEFTMENU_INDUSTRIES');
            },
            organizations: function (industriesManager) {
                return industriesManager.getOrganizations().then(function (data) {
                    return data;
                });
            }
        };
        $stateProvider
            .state('home.organizations.industries', {
                url: "/industries/:organizationId",
                templateUrl: "views/industries/industries.html",
                controller: "IndustriesCtrl",
                resolve: baseIndustriesResolve,
                data: {
                    displayName: '{{pageName}}',//'Industries',
                    paneLimit: 1,
                    depth: 2,
                    resource: "Industries"
                }
            });
    }])
    .factory('industriesManager', ['$q', 'apiService', function ($q, apiService) {
        var self = {
            getOrganizations: function (query) {
                return $q.when(getOrganizations(query));
            },
            getAllIndustriesByOrganizationId: function (id, query) {
                return $q.when(getAllIndustriesByOrganizationId(id, query));
            },
            updateIndustry: function (industyItem) {
                return $q.when(updateIndustry(industyItem));
            },
            removeIndustry: function (id) {
                return $q.when(removeIndustry(id));
            },
            addIndustry: function (industyItem) {
                return $q.when(addIndustry(industyItem))
            },
            checkIsIndustryExist: function (organizationId, name) {
                return $q.when(checkIsIndustryExist(organizationId, name))
            },
            getAllSubIndustriesByParentId: function (parentId) {
                return $q.when(getAllSubIndustriesByParentId(parentId));
            }
        };

        return self;

        function getOrganizations(query) {
            var deferred = $q.defer();
            var apiName = 'organization';
            (!query) ? query = '' : '';
            apiService.getAll(apiName, query).then(function (data) {
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }

        function getAllIndustriesByOrganizationId(id, query) {
            var deferred = $q.defer();
            var apiName = 'Industries/GetAllIndustriesByOrganizationId';
            (!query) ? query = '' : '';
            apiService.getById(apiName, id, query).then(function (data) {
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }

        function updateIndustry(industyItem) {
            var deferred = $q.defer();
            var apiName = 'industries';
            apiService.update(apiName, industyItem).then(function (data) {
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }

        function removeIndustry(id) {
            var deferred = $q.defer();
            var apiName = 'industries';
            apiService.remove(apiName, id).then(function (data) {
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }

        function addIndustry(industyItem) {

            var deferred = $q.defer();
            var apiName = 'industries';
            apiService.add(apiName, industyItem).then(function (data) {
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }

        function checkIsIndustryExist(organizationId, name) {
            var deferred = $q.defer();
            var apiName = 'Industries/IsIndustryExist/' + organizationId + "/" + name;
            apiService.getAll(apiName, null).then(function (data) {
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }

        function getAllSubIndustriesByParentId(id, query) {
            var deferred = $q.defer();
            var apiName = 'Industries/GetAllSubIndustriesByParentId';
            (!query) ? query = '' : '';
            apiService.getById(apiName, id, query).then(function (data) {
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }
    }])
    .controller('IndustriesCtrl', ['$scope', '$stateParams', 'industriesManager', 'organizations', 'cssInjector', '$translate', function ($scope, $stateParams, industriesManager, organizations, cssInjector, $translate) {
        cssInjector.removeAll();
        cssInjector.add('views/industries/industries.css');
        $scope.organizations = organizations;
        $scope.selectedOrganization = null;
        $scope.notificationOptions = {
            position: {
                top: 30,
                right: 30
            }
        }
        $scope.changeOrganization = function (organizationId) {
            if (organizationId > 0) {
                $scope.selectedOrganization = _.find(organizations, function (item) {
                    return item.id == organizationId;
                });
                if ($scope.selectedOrganization) {
                    var grid = $("#industriesGrid").data("kendoGrid");
                    if (grid) {
                        grid.dataSource.read();
                    }
                }
            }
        }
        $scope.add = function () {
            var grid = $("#industriesGrid").data("kendoGrid");
            grid.addRow();
        }
        $scope.notification = function (message, type, callback) {

            var notificationBox = $("#notificationBox").kendoNotification($scope.notificationOptions).data("kendoNotification").show(message, type);
            if (callback) {
                callback();
            }
        }

        $scope.remove = function (options) {
            $scope.removal = $("#removal").kendoWindow({
                title: $translate.instant('COMMON_CONFIRM'),
                modal: true,
                visible: false,
                resizable: false
            }).data("kendoWindow");

            $scope.removal.open().center();

            $("#removalYes").click(function () {
                industriesManager.removeIndustry(options.data.id).then(function (data) {
                    options.success();
                })
                $scope.removal.close();
            });

            $("#removalNo").click(function () {
                options.error({}, 500, "destroyCanceled");
                $scope.removal.close();
            });
        }

        $scope.gridOptions = {
            dataSource: {
                type: "json",
                transport: {
                    read: function (options) {
                        if ($scope.selectedOrganization) {
                            industriesManager.getAllIndustriesByOrganizationId($scope.selectedOrganization.id).then(function (data) {
                                options.success(data);
                            })
                        }
                        else {
                            industriesManager.getAllIndustriesByOrganizationId($scope.selectedOrganization).then(function (data) {
                                options.success(data);
                            })
                        }
                    },
                    update: function (options) {
                        var item = {
                            id: options.data.id,
                            name: options.data.name,
                            description: options.data.description,
                            parentId: options.data.parentId,
                            organizationId: $scope.selectedOrganization.id,
                        };
                        industriesManager.updateIndustry(item).then(function (data) {
                            options.success();
                        })
                    },
                    destroy: function (options) {
                        $scope.remove(options);
                    },
                    create: function (options) {
                        var item = { id: options.data.id, name: options.data.name, description: options.data.description, parentId: null, organizationid: $scope.selectedOrganization.id };
                        industriesManager.checkIsIndustryExist($scope.selectedOrganization.id, item.name).then(function (data) {
                            if (data) {
                                $scope.notification($translate.instant('INDUSTRIES_INDUSTRY_NAME_SHOULD_BE_UNIQUE'), "warning");
                            }
                            else {
                                industriesManager.addIndustry(item).then(function (data) {
                                    options.data.id = data;
                                    options.data.parentId = null;
                                    $scope.notification($translate.instant('INDUSTRIES_INDUSTRY_SAVED_SUCCESFULLY'), "info");
                                    options.success(options.data);
                                })
                            }
                        })
                    },
                },
                pageSize: 10,
                schema: {
                    model: {
                        id: "id",
                        fields: {
                            id: { type: 'number', },
                            name: { type: 'string' },
                            description: { type: 'string' },
                            ParentId: { type: 'number' },
                        }
                    }
                },
                error: function (err) {
                    this.cancelChanges();
                },
            },
            filterable: {
                mode: 'row'
            },
            sortable: true,
            pageable: true,
            editable: {
                mode: "inline",
                confirmation: false
            },
            columns: [
                { field: "name", title: $translate.instant('COMMON_NAME'), width: 300 },
                { field: "description", title: $translate.instant('COMMON_DESCRIPTION'), width: 350 },
                {
                    field: "action", sortable: false, searchable: false, filterable: false, command: [{ name: "edit", text: "", iconClass: "fa fa-pencil fa-lg" }, { name: "destroy", text: "", iconClass: "fa fa-trash fa-lg" }], title: $translate.instant('COMMON_ACTIONS'), width: "100px",
                    headerAttributes: {
                        "data-title": $translate.instant('COMMON_ACTIONS')
                    }
                },
            ],
        };

        $scope.detailGridOptions = function (dataItem) {
            return {
                dataSource: {
                    type: "json",
                    transport: {
                        read: function (options) {
                            industriesManager.getAllSubIndustriesByParentId(dataItem.id).then(function (data) {
                                options.success(data);
                            })
                        },
                        update: function (options) {
                            var item = { id: options.data.id, name: options.data.name, description: options.data.description, parentId: options.data.parentId, organizationId: $scope.selectedOrganization.id };
                            industriesManager.updateIndustry(item).then(function (data) {
                                options.success();
                            })
                        },
                        destroy: function (options) {
                            $scope.remove(options);
                        },
                        create: function (options) {
                            var item = { id: options.data.id, name: options.data.name, description: options.data.description, parentId: dataItem.id, organizationId: $scope.selectedOrganization.id };

                            industriesManager.checkIsIndustryExist($scope.selectedOrganization.id, item.name).then(function (data) {
                                if (data) {
                                    $scope.notification($translate.instant('INDUSTRIES_INDUSTRY_NAME_SHOULD_BE_UNIQUE'), "warning");
                                }
                                else {
                                    industriesManager.addIndustry(item).then(function (data) {
                                        options.data.id = data;
                                        options.data.parentId = null;
                                        $scope.notification($translate.instant('INDUSTRIES_INDUSTRY_SAVED_SUCCESFULLY'), "info");
                                        options.success(options.data);
                                    })
                                }
                            })
                        },
                    },
                    error: function (err) {
                        this.cancelChanges();
                    },
                    pageSize: 10,
                    schema: {
                        model: {
                            id: "id",
                            fields: {
                                id: { type: 'number', },
                                name: { type: 'string' },
                                description: { type: 'string' },
                                ParentId: { type: 'number' },
                            }
                        }
                    }
                },
                scrollable: false,
                sortable: true,
                pageable: true,
                editable: {
                    mode: "inline",
                    confirmation: false
                },
                toolbar: [{ name: "create", text: "", width: 30 }],
                columns: [
                    { field: "name", title: $translate.instant('COMMON_NAME'), width: 300 },
                    { field: "description", title: $translate.instant('COMMON_DESCRIPTION'), width: 350 },
                    {
                        command: [{ name: "edit", text: "", width: 30, iconClass: "fa fa-pencil fa-lg" }, {
                            name: "destroy", text: "", width: 30, iconClass: "fa fa-trash fa-lg",
                        }], title: $translate.instant('COMMON_ACTIONS'), width: "100px",
                        headerAttributes: {
                            "data-title": $translate.instant('COMMON_ACTIONS')
                        }
                    },
                ]
            };
        };

        $scope.tooltipOptions = {
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

        if ($stateParams.organizationId > 0) {
            $scope.changeOrganization($stateParams.organizationId);
            App.initSlimScroll(".scroller");
        }

       
    }]);