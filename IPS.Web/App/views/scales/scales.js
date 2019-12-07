'use strict';

angular.module('ips.scales', ['ui.router', 'kendo.directives'])

    .config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
        $stateProvider
            .state('home.profiles.soft.scales', {
                url: "/scales",
                templateUrl: "views/scales/scales.html",
                controller: "ScalesCtrl",
                resolve: {
                    pageName: function ($translate) {
                        return $translate.instant('SOFTPROFILE_SCALES');
                    },
                    scales: function ($stateParams, scaleService) {
                        return scaleService.load();
                    },
                    profileTypes: function ($stateParams, scaleService) {
                        return scaleService.getProfileTypes();
                    },
                    categories: function ($stateParams, scaleService) {
                        return scaleService.getCategories();
                    },
                    measureUnits: function ($stateParams, scaleService) {
                        return scaleService.getMeasureUnits();
                    }
                },
                data: {
                    displayName: '{{pageName}}',//'Scales',
                    paneLimit: 1,
                    depth: 3,
                    resource: "Scales"
                }
            })
            .state('home.profiles.soft.scales.edit', {
                url: "/edit/:scaleId/:index",
                templateUrl: "views/scales/scales.edit.html",
                controller: "ScaleEditCtrl",
                resolve: {
                    scale: function ($stateParams, scaleService) {
                        return scaleService.getById($stateParams.scaleId);
                    }
                },
                data: {
                    displayName: '{{ scale.viewName }}',
                    paneLimit: 1,
                    depth: 4,
                    resource: "Scales"
                }
            })
    }])

    .service('scaleService', ['apiService', '$translate', function (apiService, $translate) {
        var scales = new kendo.data.ObservableArray([]);

        this.addRange = function (items) {
            scales.splice(0, scales.length);
            scales.push.apply(scales, items);
        };

        this.load = function (query) {
            if (!query) { query = "&$filter=IsTemplate eq true"; }
            else { query += "and(IsTemplate eq true)"; }
            return apiService.getAll("scales?$expand=ScaleCategory,MeasureUnit,ProfileType1" + query).then(function (data) {
                scales.splice(0, scales.length);
                scales.push.apply(scales, data);
                return data;
            });
        }

        this.add = function (item) {
            scales.push(item);
        };

        this.update = function (item, index) {
            scales.splice(index, 1, item);
        };

        this.getById = function (id) {
            if (id > 0) {
                return apiService.getById("scales", id, "$expand=ScaleRanges,ScaleCategory,ProfileType1").then(function (data) {
                    data.viewName = data.name;
                    return data;
                });
            }
            else {
                return {
                    id: -1,
                    name: "",
                    viewName: $translate.instant('SOFTPROFILE_NEW_SCALE'),
                    description: "",
                    scaleCategoryId: 1,
                    measureUnitId: 1,
                    profileType: 1,
                    isTemplate: true,
                    scaleStart: 1,
                    scaleEnd: 10,
                    scaleInterval: 3,
                    scaleCategory: {},
                    measureUnit: {},
                    profileType1: {},
                    scaleRanges: [{
                        color: "#f00",
                        description: "Low",
                        id: -1,
                        max: 3,
                        min: 1,
                        scaleId: -1,
                    }, {
                        color: "#ff0",
                        description: "Medium",
                        id: -1,
                        max: 6,
                        min: 3,
                        scaleId: -1,
                    }, {
                        color: "#0f0",
                        description: "High",
                        id: -1,
                        max: 10,
                        min: 7,
                        scaleId: -1
                    }]
                };
            }

        }
        this.get = function (index) {
            return scales[index];
        };

        this.remove = function (index) {
            return scales.splice(index, 1);
        };


        this.list = function () {
            return scales;
        };

        this.dataSource = function () {
            console.log(scales);
            return new kendo.data.DataSource({
                type: "json",
                data: scales,
                schema: {
                    model: {
                        id: "id",
                        fields: {
                            id: { type: 'number', },
                            name: { type: 'string' },
                            description: { type: 'string' },
                            scaleCategoryId: { type: 'number' },
                            profileType1: { name: { type: 'string' } },
                            scaleCategory: { name: { type: 'string' } },
                            measureUnit: { name: { type: 'string' } }
                        }
                    }
                }
            });
        };

        this.getProfileTypes = function () {
            return apiService.getAll("ProfileType?$select=Id,Name&$orderby=Name").then(function (data) {
                data.unshift({ id: null, name: $translate.instant('SOFTPROFILE_SCALES_SELECT_PROFILE_TYPE') });
                return data;
            });
        }

        this.getCategories = function () {
            return apiService.getAll("Scale_Categories?$select=Id,Name&$orderby=Name").then(function (data) {
                data.unshift({ id: null, name: $translate.instant('SOFTPROFILE_SELECT_CATEGORY') });
                return data;
            });
        };

        this.getMeasureUnits = function () {
            return apiService.getAll("MeasureUnit?$select=Id,Name&$orderby=Name").then(function (data) {
                data.unshift({ id: null, name: $translate.instant('SOFTPROFILE_SELECT_MEASURE_UNIT') });
                return data;
            });
        };

    }])

    .controller('ScalesCtrl', ['$scope', '$location', 'apiService', '$window', '$rootScope', 'cssInjector', 'scaleService', 'scales', 'profileTypes', 'categories', 'measureUnits', '$translate', function ($scope, $location, apiService, $window, $rootScope, cssInjector, scaleService, scales, profileTypes, categories, measureUnits, $translate) {
        cssInjector.removeAll();
        cssInjector.add('views/scales/scales.css');

        scaleService.addRange(scales);

        if (profileTypes) { $scope.profileTypes = profileTypes; } else { $scope.profileTypes = [] }
        if (categories) { $scope.categories = categories; } else { $scope.categories = [] }
        if (measureUnits) { $scope.measureUnits = measureUnits; } else { $scope.measureUnits = [] }

        $scope.deleteItem = { id: -1, index: -1 };
        $scope.deleteItemData = function (id, index) {
            $scope.deleteItem.id = id;
            $scope.deleteItem.index = index;
        }

        $scope.editScale = function (id, index) {
            $location.path($location.path() + '/edit/' + id + '/' + index);
        };

        $scope.removeScale = function () {
            apiService.remove("scales", $scope.deleteItem.id).then(function (data) {
                if (data) {
                    scaleService.remove($scope.deleteItem.index);
                }
            });
        };

        $scope.createNewScale = function () {
            $location.path($location.path() + '/edit/0/0');
        }

        $scope.cloneScale = function (id, index) {
            $location.path($location.path() + '/edit/' + id + '/-1');
        }

        $scope.gridOptions = {
            dataSource: scaleService.dataSource(),
            sortable: true,
            //selectable: true,
            columns: [
                { field: "name", title: $translate.instant('COMMON_NAME'), width: "180px" },
                { field: "description", title: $translate.instant('COMMON_DESCRIPTION'), width: "220px" },
                { field: "profileType1.name", title: $translate.instant('COMMON_PROFILE_TYPE'), width: "130px" },
                { field: "scaleCategory.name", title: $translate.instant('SOFTPROFILE_SCALE_CATEGORY'), width: "200px" },
                { field: "measureUnit.name", title: $translate.instant('SOFTPROFILE_MEASURE_UNIT'), width: "150px" },
                {
                    field: "actions", title: $translate.instant('COMMON_ACTIONS'), width: "130px", sortable: false,
                    template: function (dataItem) {
                        return "<div class='icon-groups'><a class='fa fa-pencil fa-lg' ng-click='editScale(" + dataItem.id + ", " + scaleService.list().indexOf(dataItem) + ")' ></a><a class='fa fa-copy fa-lg' ng-click='cloneScale(" + dataItem.id + ", " + scaleService.list().indexOf(dataItem) + ")'></a><a class='fa fa-trash fa-lg' ng-click='deleteItemData(" + dataItem.id + ", " + scaleService.list().indexOf(dataItem) + "); removal.open().center();'></a></div>";
                    },
                },
            ],
        };

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

        $scope.doSearch = function (searchText) {
            $("#scalesGrid").data("kendoGrid").dataSource.filter([
                {
                    logic: "or",
                    filters: [
                        {
                            field: "name",
                            operator: "contains",
                            value: searchText
                        },
                        {
                            field: "description",
                            operator: "contains",
                            value: searchText
                        },
                    ]
                }]);
        }

        $scope.filter = {
            profileType: null,
            scaleCategory: null,
            measureUnit: null
        };

        $scope.doFilter = function () {

            var query = "";

            if ($scope.filter.profileType) {
                query += "(ProfileType eq " + $scope.filter.profileType + ")";
            }

            if ($scope.filter.scaleCategory) {
                if (query) { query += "and"; }
                query += "(ScaleCategoryId eq " + $scope.filter.scaleCategory + ")";
            }

            if ($scope.filter.measureUnit) {
                if (query) { query += "and"; }
                query += "(MeasureUnitId eq " + $scope.filter.measureUnit + ")";
            }

            if (query) {
                query = "&$filter=" + query;
            } else {
                query = "";
            }

            scaleService.load(query);

        };

    }])

    .controller('ScaleEditCtrl', ['$scope', '$location', 'apiService', '$rootScope', 'cssInjector', '$stateParams', '$state', 'scaleService', 'scale', '$translate', function ($scope, $location, apiService, $rootScope, cssInjector, $stateParams, $state, scaleService, scale, $translate) {

        $scope.scaleId = $stateParams.scaleId;
        $scope.index = $stateParams.index;
        $scope.scale = scale;

        if ($scope.scaleId > 0) {
            $state.current.data.displayName = $translate.instant('COMMON_EDIT');
            if ($scope.index < 0) {
                $scope.scale.name = "Clone of " + $scope.scale.name
                $scope.scaleId = -1;
                $scope.scale.id = -1;
            }
        }

        $scope.saveScale = function () {

            var item = angular.copy($scope.scale);

            item.scaleCategory = null;
            item.measureUnit = null;
            item.profileType1 = null;

            if (item.id > 0) {
                apiService.update("scales", item).then(function (data) {
                    scaleService.update($scope.scale, $scope.index);
                    (data) ? notification($translate.instant('SOFTPROFILE_SCALE_SAVED_SUCCESSFULLY')) : notification($translate.instant('SOFTPROFILE_SAVE_FAILED'));
                });
            }
            else {
                apiService.add("scales", item).then(function (data) {
                    $scope.scale.id = data;
                    scaleService.add($scope.scale);
                    ($scope.scale.id > 0) ? notification($translate.instant('SOFTPROFILE_SCALE_SAVED_SUCCESSFULLY')) : notification($translate.instant('SOFTPROFILE_SAVE_FAILED'));
                });
            }

        }

        $scope.notificationOptions = {
            position: {
                top: 30,
                right: 30
            }
        }

        function notification(message) {
            $scope.notificationSavedSuccess.show(message, "info");
        }

        $scope.back = function () {
            $state.go('^');
        }
    }])