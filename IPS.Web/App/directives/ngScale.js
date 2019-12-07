app.directive('ngScale', ['apiService', '$compile', function (apiService, $compile) {
    return {
        restrict: 'EA',
        require: '^ngModel',
        templateUrl: 'templates/scale/scale.html',
        scope: {
            ngModel: '=',
            ngIsTamplate: '=',
            ngIsRequired: '='
        },
        replace: true,
        controller: ['$scope', 'apiService', '$compile', '$element', '$translate', function ($scope, apiService, $compile, $element, $translate) {

            //$scope.categories = [];
            //$scope.measureUnits = [];

            $scope.fillGrid = function () {
                $scope.scale.scaleRanges = new kendo.data.ObservableArray($scope.scale.scaleRanges);
                console.log($scope.scale.scaleRanges);
                var ds = new kendo.data.DataSource({
                    data: $scope.scale.scaleRanges,
                    pageSize: 10,
                    schema: {
                        model: {
                            id: "id",
                            fields: {
                                id: { type: 'number', },
                                min: { type: 'number' },
                                max: { type: 'number' },
                                description: { type: 'string' },
                                color: { type: 'string' },
                                scaleId: { type: 'number' }
                            }
                        }
                    }
                });

                $scope.gridRnagesOptions = {
                    dataSource: ds,
                    pageable: true,
                    editable: true,
                    columns: [
                        { field: "min", title: $translate.instant('COMMON_START'), width: "120px" },
                        { field: "max", title: $translate.instant('COMMON_END'), width: "120px" },
                        { field: "description", title: $translate.instant('COMMON_DESCRIPTION'), width: "120px" },
                        {
                            field: "color", title: $translate.instant('COMMON_COLOR'), width: "120px",
                            template: function (dataItem) {
                                return "<div style='background-color: " + dataItem.color + ";'>&nbsp;</div>";
                            },
                            editor: function (container, options) {
                                // create an input element
                                var input = $("<input/>");
                                // set its name to the field to which the column is bound ('name' in this case)
                                input.attr("name", options.field);
                                // append it to the container
                                input.appendTo(container);
                                // initialize a Kendo UI AutoComplete
                                input.kendoColorPicker({
                                    value: options.model.Color,
                                    buttons: false,
                                    palette: "basic",
                                });


                            }
                        }]
                };
                $scope.tooltipOptions = $("#gridRnages").kendoTooltip({
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

                if ($scope.elementId != "") {
                    $("#" + $scope.elementId).find("#gridRnages").kendoGrid($scope.gridRnagesOptions).data("kendoGrid");
                }
                else {
                    $("#gridRnages").kendoGrid($scope.gridRnagesOptions).data("kendoGrid");
                }
            }

            $scope.init = function init(model, elementId) {

                $scope.scale = model;
                $scope.elementId = elementId;

                if ($scope.scale != null) {
                    if ($scope.scale.measureUnitId && $scope.measureUnits) {
                        $scope.scale.measureUnit = $scope.getById($scope.scale.measureUnitId, $scope.measureUnits);
                    }

                    if ($scope.scale.scaleCategoryId && $scope.measureUnits) {
                        $scope.scale.scaleCategory = $scope.getById($scope.scale.scaleCategoryId, $scope.categories);
                    }

                    if ($scope.scale.profileType && $scope.profileTypes) {
                        $scope.scale.profileType1 = $scope.getById($scope.scale.profileType, $scope.profileTypes);
                    }

                    if ($scope.scale.scaleRanges) {
                        if ($scope.scale.scaleRanges.length > 0) {
                            $scope.scale.scaleInterval = $scope.scale.scaleRanges.length;
                            $scope.scale.scaleStart = $scope.scale.scaleRanges[0].min;
                            $scope.scale.scaleEnd = $scope.scale.scaleRanges[$scope.scale.scaleRanges.length - 1].max;
                            $scope.fillGrid();
                        }
                    }
                }
            };

            $scope.init($scope.ngModel);

            $scope.scaleCategoryUpdate = function () {
                $scope.scale.scaleCategoryId = $scope.scale.scaleCategory.id;
            }

            $scope.measureUnitUpdate = function () {
                $scope.scale.measureUnitId = $scope.scale.measureUnit.id;
            }

            $scope.profileTypeUpdate = function () {
                $scope.scale.profileType = $scope.scale.profileType1.id;
            }


            $scope.getById = function getById(id, myArray) {
                if (myArray.filter) {
                    return myArray.filter(function (obj) {
                        if (obj.id == id) {
                            return obj
                        }
                    })[0]
                }
                return undefined;
            }

            $scope.getColor = function (id) {
                var color = '#fff';
                switch (id) {
                    case 0:
                        color = '#f00'
                        break
                    case 1:
                        color = '#ff0'
                        break
                    case 2:
                        color = '#0f3'
                        break
                    case 3:
                        color = '#06f'
                        break
                    case 4:
                        color = '#f99'
                        break
                    case 5:
                        color = '#99f'
                        break
                    case 6:
                        color = '#990'
                        break
                    case 7:
                        color = '#096'
                        break
                    case 8:
                        color = '#c60'
                        break
                    case 9:
                        color = '#30c'
                        break
                    default:
                        color = '#fff'
                }
                return color;
            }

            $scope.getRangesByKey = function (key) {
                if (key == "1_8_3") {
                    return [{
                        id: -1,
                        scaleId: $scope.scale.id,
                        min: 1,
                        max: 3,
                        description: '',
                        color: $scope.getColor(0),
                    },
                    {
                        id: -1,
                        scaleId: $scope.scale.id,
                        min: 4,
                        max: 6,
                        description: '',
                        color: $scope.getColor(1),
                    },
                    {
                        id: -1,
                        scaleId: $scope.scale.id,
                        min: 7,
                        max: 8,
                        description: '',
                        color: $scope.getColor(2),
                    }
                    ]
                }
                else if (key == "1_50_3") {
                    return [{
                        id: -1,
                        scaleId: $scope.scale.id,
                        min: 1,
                        max: 30,
                        description: '',
                        color: $scope.getColor(2),
                    },
                    {
                        id: -1,
                        scaleId: $scope.scale.id,
                        min: 31,
                        max: 40,
                        description: '',
                        color: $scope.getColor(1),
                    },
                    {
                        id: -1,
                        scaleId: $scope.scale.id,
                        min: 41,
                        max: 50,
                        description: '',
                        color: $scope.getColor(0),
                    }
                    ]
                }
                else if (key == "1_50_4") {
                    return [{
                        id: -1,
                        scaleId: $scope.scale.id,
                        min: 1,
                        max: 30,
                        description: '',
                        color: $scope.getColor(3),
                    }, {
                        id: -1,
                        scaleId: $scope.scale.id,
                        min: 31,
                        max: 40,
                        description: '',
                        color: $scope.getColor(2),
                    },
                    {
                        id: -1,
                        scaleId: $scope.scale.id,
                        min: 41,
                        max: 45,
                        description: '',
                        color: $scope.getColor(1),
                    },
                    {
                        id: -1,
                        scaleId: $scope.scale.id,
                        min: 45,
                        max: 50,
                        description: '',
                        color: $scope.getColor(0),
                    }
                    ]
                } else if (key == "1_50_5") {
                    return [{
                        id: -1,
                        scaleId: $scope.scale.id,
                        min: 1,
                        max: 30,
                        description: '',
                        color: $scope.getColor(4),
                    }, {
                        id: -1,
                        scaleId: $scope.scale.id,
                        min: 31,
                        max: 35,
                        description: '',
                        color: $scope.getColor(3),
                    }, {
                        id: -1,
                        scaleId: $scope.scale.id,
                        min: 35,
                        max: 40,
                        description: '',
                        color: $scope.getColor(2),
                    },
                    {
                        id: -1,
                        scaleId: $scope.scale.id,
                        min: 41,
                        max: 45,
                        description: '',
                        color: $scope.getColor(1),
                    },
                    {
                        id: -1,
                        scaleId: $scope.scale.id,
                        min: 45,
                        max: 50,
                        description: '',
                        color: $scope.getColor(0),
                    }
                    ]
                }
                return [];
            }

            $scope.generateScales = function () {

                $scope.scale.scaleRanges = [];

                $scope.scale.scaleRanges = $scope.getRangesByKey($scope.scale.scaleStart + "_" + $scope.scale.scaleEnd + "_" + $scope.scale.scaleInterval);

                if ($scope.scale.scaleRanges.length == 0) {
                    var step = ($scope.scale.scaleEnd - $scope.scale.scaleStart + 1) / $scope.scale.scaleInterval;
                    var stepTop = Math.ceil(($scope.scale.scaleEnd - $scope.scale.scaleStart + 1) / $scope.scale.scaleInterval);
                    var stepFloor = Math.floor(($scope.scale.scaleEnd - $scope.scale.scaleStart + 1) / $scope.scale.scaleInterval);

                    //if (stepTop == stepFloor) { stepFloor = stepFloor - 1;}
                    for (var i = 0; i < $scope.scale.scaleInterval; i++) {
                        var color = $scope.getColor(i);

                        var range = {
                            id: -1,
                            scaleId: $scope.scale.id,
                            min: Math.floor($scope.scale.scaleStart + (step * i)),
                            max: Math.floor($scope.scale.scaleStart + step * i + step - 1),
                            description: '',
                            color: color,
                        };
                        if (i == $scope.scale.scaleInterval - 1) {
                            range.max = $scope.scale.scaleEnd;
                        }
                        $scope.scale.scaleRanges.push(range)
                    }
                }

                $scope.fillGrid();
            };
        }],
        link: function ($scope, element, attrs) {

            $scope.$watch('ngModel', function (newValue, oldValue) {
                if (newValue) {
                    $scope.init(newValue, element[0].id);
                }
            }, false);

            apiService.getAll("MeasureUnit?$select=Id,Name&$orderby=Name").then(function (data) {
                $scope.measureUnits = data;
                if (($scope.scale != null) && ($scope.scale.measureUnitId)) {
                    $scope.scale.measureUnit = $scope.getById($scope.scale.measureUnitId, $scope.measureUnits);
                }

            });

            apiService.getAll("Scale_Categories?$select=Id,Name&$orderby=Name").then(function (data) {
                $scope.categories = data;

                if (($scope.scale != null) && ($scope.scale.scaleCategoryId)) {
                    $scope.scale.scaleCategory = $scope.getById($scope.scale.scaleCategoryId, $scope.categories);
                }
            });

            apiService.getAll("ProfileType?$select=Id,Name&$orderby=Name").then(function (data) {
                $scope.profileTypes = data;

                if (($scope.scale != null) && ($scope.scale.profileType)) {
                    $scope.scale.profileType1 = $scope.getById($scope.scale.profileType, $scope.profileTypes);
                }
            });
        }
    }
}]);

app.directive('ngScaleView', ['apiService', '$compile', function (apiService, $compile) {
    return {
        restrict: 'EA',
        require: '^ngModel',
        templateUrl: 'templates/scale/scaleview.html',
        scope: {
            ngModel: '=',
            ngIsTamplate: '=',
            ngIsRequired: '='
        },
        replace: true,
        controller: ['$scope', 'apiService', '$compile', '$element', '$translate', function ($scope, apiService, $compile, $element, $translate) {

            //$scope.categories = [];
            //$scope.measureUnits = [];

            $scope.fillGrid = function () {
                $scope.scaleView.scaleRanges = new kendo.data.ObservableArray($scope.scaleView.scaleRanges);
                console.log($scope.scaleView.scaleRanges);
                var ds = new kendo.data.DataSource({
                    data: $scope.scaleView.scaleRanges,
                    pageSize: 10,
                    schema: {
                        model: {
                            id: "id",
                            fields: {
                                id: { type: 'number', },
                                min: { type: 'number' },
                                max: { type: 'number' },
                                description: { type: 'string' },
                                color: { type: 'string' },
                                scaleId: { type: 'number' }
                            }
                        }
                    }
                });

                $scope.fpGridRnagesOptions = {
                    dataSource: ds,
                    pageable: true,
                    editable: false,
                    columns: [
                        { field: "min", title: $translate.instant('COMMON_START'), width: "120px" },
                        { field: "max", title: $translate.instant('COMMON_END'), width: "120px" },
                        { field: "description", title: $translate.instant('COMMON_DESCRIPTION'), width: "120px" },
                        {
                            field: "color", title: $translate.instant('COMMON_COLOR'), width: "120px",
                            template: function (dataItem) {
                                return "<div style='background-color: " + dataItem.color + ";'>&nbsp;</div>";
                            },
                            editor: function (container, options) {
                                // create an input element
                                var input = $("<input/>");
                                // set its name to the field to which the column is bound ('name' in this case)
                                input.attr("name", options.field);
                                // append it to the container
                                input.appendTo(container);
                                // initialize a Kendo UI AutoComplete
                                input.kendoColorPicker({
                                    value: options.model.Color,
                                    buttons: false,
                                    palette: "basic",
                                });


                            }
                        }]
                };
                $scope.tooltipOptions = $("#fpgridRnages").kendoTooltip({
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

                if ($scope.elementId != "") {
                    $("#" + $scope.elementId).find("#fpgridRnages").kendoGrid($scope.fpGridRnagesOptions).data("kendoGrid");
                }
                else {
                    $("#fpgridRnages").kendoGrid($scope.fpGridRnagesOptions).data("kendoGrid");
                }
            }

            $scope.init = function init(model, elementId) {

                $scope.scaleView = model;
                $scope.elementId = elementId;
                if ($scope.scaleView != null) {
                    if ($scope.scaleView.measureUnitId && $scope.scaleViewMeasureUnits) {
                        $scope.scaleView.measureUnit = $scope.getById($scope.scaleView.measureUnitId, $scope.scaleViewMeasureUnits);
                    }

                    if ($scope.scaleView.scaleCategoryId && $scope.scaleViewCategories) {
                        $scope.scaleView.scaleCategory = $scope.getById($scope.scaleView.scaleCategoryId, $scope.scaleViewCategories);
                    }

                    if ($scope.scaleView.profileType && $scope.scaleViewProfileTypes) {
                        $scope.scaleView.profileType1 = $scope.getById($scope.scaleView.profileType, $scope.scaleViewProfileTypes);
                    }

                    if ($scope.scaleView.scaleRanges) {
                        if ($scope.scaleView.scaleRanges.length > 0) {
                            $scope.scaleView.scaleInterval = $scope.scaleView.scaleRanges.length;
                            $scope.scaleView.scaleStart = $scope.scaleView.scaleRanges[0].min;
                            $scope.scaleView.scaleEnd = $scope.scaleView.scaleRanges[$scope.scaleView.scaleRanges.length - 1].max;
                            $scope.fillGrid();
                        }
                    }
                }
            };

            $scope.init($scope.ngModel);

            $scope.scaleCategoryUpdate = function () {
                $scope.scaleView.scaleCategoryId = $scope.scaleView.scaleCategory.id;
            }

            $scope.measureUnitUpdate = function () {
                $scope.scaleView.measureUnitId = $scope.scaleView.measureUnit.id;
            }

            $scope.profileTypeUpdate = function () {
                $scope.scaleView.profileType = $scope.scaleView.profileType1.id;
            }


            $scope.getById = function getById(id, myArray) {
                if (myArray.filter) {
                    return myArray.filter(function (obj) {
                        if (obj.id == id) {
                            return obj
                        }
                    })[0]
                }
                return undefined;
            }

            $scope.getColor = function (id) {
                var color = '#fff';
                switch (id) {
                    case 0:
                        color = '#f00'
                        break
                    case 1:
                        color = '#ff0'
                        break
                    case 2:
                        color = '#0f3'
                        break
                    case 3:
                        color = '#06f'
                        break
                    case 4:
                        color = '#f99'
                        break
                    case 5:
                        color = '#99f'
                        break
                    case 6:
                        color = '#990'
                        break
                    case 7:
                        color = '#096'
                        break
                    case 8:
                        color = '#c60'
                        break
                    case 9:
                        color = '#30c'
                        break
                    default:
                        color = '#fff'
                }
                return color;
            }

            $scope.getRangesByKey = function (key) {
                if (key == "1_8_3") {
                    return [{
                        id: -1,
                        scaleId: $scope.scaleView.id,
                        min: 1,
                        max: 3,
                        description: '',
                        color: $scope.getColor(0),
                    },
                    {
                        id: -1,
                        scaleId: $scope.scaleView.id,
                        min: 4,
                        max: 6,
                        description: '',
                        color: $scope.getColor(1),
                    },
                    {
                        id: -1,
                        scaleId: $scope.scaleView.id,
                        min: 7,
                        max: 8,
                        description: '',
                        color: $scope.getColor(2),
                    }
                    ]
                }
                else if (key == "1_50_3") {
                    return [{
                        id: -1,
                        scaleId: $scope.scaleView.id,
                        min: 1,
                        max: 30,
                        description: '',
                        color: $scope.getColor(2),
                    },
                    {
                        id: -1,
                        scaleId: $scope.scaleView.id,
                        min: 31,
                        max: 40,
                        description: '',
                        color: $scope.getColor(1),
                    },
                    {
                        id: -1,
                        scaleId: $scope.scaleView.id,
                        min: 41,
                        max: 50,
                        description: '',
                        color: $scope.getColor(0),
                    }
                    ]
                }
                else if (key == "1_50_4") {
                    return [{
                        id: -1,
                        scaleId: $scope.scaleView.id,
                        min: 1,
                        max: 30,
                        description: '',
                        color: $scope.getColor(3),
                    }, {
                        id: -1,
                        scaleId: $scope.scaleView.id,
                        min: 31,
                        max: 40,
                        description: '',
                        color: $scope.getColor(2),
                    },
                    {
                        id: -1,
                        scaleId: $scope.scaleView.id,
                        min: 41,
                        max: 45,
                        description: '',
                        color: $scope.getColor(1),
                    },
                    {
                        id: -1,
                        scaleId: $scope.scaleView.id,
                        min: 45,
                        max: 50,
                        description: '',
                        color: $scope.getColor(0),
                    }
                    ]
                } else if (key == "1_50_5") {
                    return [{
                        id: -1,
                        scaleId: $scope.scaleView.id,
                        min: 1,
                        max: 30,
                        description: '',
                        color: $scope.getColor(4),
                    }, {
                        id: -1,
                        scaleId: $scope.scaleView.id,
                        min: 31,
                        max: 35,
                        description: '',
                        color: $scope.getColor(3),
                    }, {
                        id: -1,
                        scaleId: $scope.scaleView.id,
                        min: 35,
                        max: 40,
                        description: '',
                        color: $scope.getColor(2),
                    },
                    {
                        id: -1,
                        scaleId: $scope.scaleView.id,
                        min: 41,
                        max: 45,
                        description: '',
                        color: $scope.getColor(1),
                    },
                    {
                        id: -1,
                        scaleId: $scope.scaleView.id,
                        min: 45,
                        max: 50,
                        description: '',
                        color: $scope.getColor(0),
                    }
                    ]
                }
                return [];
            }

            $scope.generateScales = function () {

                $scope.scaleView.scaleRanges = [];

                $scope.scaleView.scaleRanges = $scope.getRangesByKey($scope.scaleView.scaleStart + "_" + $scope.scaleView.scaleEnd + "_" + $scope.scaleView.scaleInterval);

                if ($scope.scaleView.scaleRanges.length == 0) {
                    var step = ($scope.scaleView.scaleEnd - $scope.scaleView.scaleStart + 1) / $scope.scaleView.scaleInterval;
                    var stepTop = Math.ceil(($scope.scaleView.scaleEnd - $scope.scaleView.scaleStart + 1) / $scope.scaleView.scaleInterval);
                    var stepFloor = Math.floor(($scope.scaleView.scaleEnd - $scope.scaleView.scaleStart + 1) / $scope.scaleView.scaleInterval);

                    //if (stepTop == stepFloor) { stepFloor = stepFloor - 1;}
                    for (var i = 0; i < $scope.scaleView.scaleInterval; i++) {
                        var color = $scope.getColor(i);

                        var range = {
                            id: -1,
                            scaleId: $scope.scaleView.id,
                            min: Math.floor($scope.scaleView.scaleStart + (step * i)),
                            max: Math.floor($scope.scaleView.scaleStart + step * i + step - 1),
                            description: '',
                            color: color,
                        };
                        if (i == $scope.scaleView.scaleInterval - 1) {
                            range.max = $scope.scaleView.scaleEnd;
                        }
                        $scope.scaleView.scaleRanges.push(range)
                    }
                }

                $scope.fillGrid();
            };
        }],
        link: function ($scope, element, attrs) {

            $scope.$watch('ngModel', function (newValue, oldValue) {
                if (newValue) {
                    $scope.init(newValue, element[0].id);
                }
            }, false);

            apiService.getAll("MeasureUnit?$select=Id,Name&$orderby=Name").then(function (data) {
                $scope.scaleViewMeasureUnits = data;
                if (($scope.scaleView != null) && ($scope.scaleView.measureUnitId)) {
                    $scope.scaleView.measureUnit = $scope.getById($scope.scaleView.measureUnitId, $scope.scaleViewMeasureUnits);
                }
            });

            apiService.getAll("Scale_Categories?$select=Id,Name&$orderby=Name").then(function (data) {
                $scope.scaleViewCategories = data;

                if (($scope.scaleView != null) && ($scope.scaleView.scaleCategoryId)) {
                    $scope.scaleView.scaleCategory = $scope.getById($scope.scaleView.scaleCategoryId, $scope.scaleViewCategories);
                }
            });

            apiService.getAll("ProfileType?$select=Id,Name&$orderby=Name").then(function (data) {
                $scope.scaleViewProfileTypes = data;

                if (($scope.scaleView != null) && ($scope.scaleView.profileType)) {
                    $scope.scaleView.profileType1 = $scope.getById($scope.scaleView.profileType, $scope.scaleViewProfileTypes);
                }
            });
        }
    }
}]);

app.directive('ngProspectingGoalScale', ['apiService', '$compile', function (apiService, $compile) {
    return {
        restrict: 'EA',
        require: '^ngModel',
        templateUrl: 'templates/scale/prospectingGoalScale.html',
        scope: {
            ngModel: '=',
            ngIsTamplate: '=',
            ngIsRequired: '='
        },
        replace: true,
        controller: ['$scope', 'apiService', '$compile', '$element', '$translate', function ($scope, apiService, $compile, $element, $translate) {

            //$scope.categories = [];
            //$scope.measureUnits = [];

            $scope.fillGrid = function () {
                $scope.prospectingGoalScale.prospectingGoalScaleRanges = new kendo.data.ObservableArray($scope.prospectingGoalScale.prospectingGoalScaleRanges);
                console.log($scope.prospectingGoalScale.prospectingGoalScaleRanges);
                var ds = new kendo.data.DataSource({
                    data: $scope.prospectingGoalScale.prospectingGoalScaleRanges,
                    pageSize: 10,
                    schema: {
                        model: {
                            id: "id",
                            fields: {
                                id: { type: 'number', },
                                min: { type: 'number' },
                                max: { type: 'number' },
                                description: { type: 'string' },
                                color: { type: 'string' },
                                scaleId: { type: 'number' }
                            }
                        }
                    }
                });

                $scope.gridRnagesOptions = {
                    dataSource: ds,
                    pageable: true,
                    editable: true,
                    columns: [
                        { field: "min", title: $translate.instant('COMMON_START'), width: "120px" },
                        { field: "max", title: $translate.instant('COMMON_END'), width: "120px" },
                        { field: "description", title: $translate.instant('COMMON_DESCRIPTION'), width: "120px" },
                        {
                            field: "color", title: $translate.instant('COMMON_COLOR'), width: "120px",
                            template: function (dataItem) {
                                return "<div style='background-color: " + dataItem.color + ";'>&nbsp;</div>";
                            },
                            editor: function (container, options) {
                                // create an input element
                                var input = $("<input/>");
                                // set its name to the field to which the column is bound ('name' in this case)
                                input.attr("name", options.field);
                                // append it to the container
                                input.appendTo(container);
                                // initialize a Kendo UI AutoComplete
                                input.kendoColorPicker({
                                    value: options.model.Color,
                                    buttons: false,
                                    palette: "basic",
                                });


                            }
                        }]
                };
                $scope.tooltipOptions = $("#gridProspectingGpalScaleRanges").kendoTooltip({
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

                if ($scope.elementId != "") {
                    $("#" + $scope.elementId).find("#gridProspectingGpalScaleRanges").kendoGrid($scope.gridRnagesOptions).data("kendoGrid");
                }
                else {
                    $("#gridProspectingGpalScaleRanges").kendoGrid($scope.gridRnagesOptions).data("kendoGrid");
                }

                $("#gridProspectingGpalScaleRanges").kendoTooltip({
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
            }

            $scope.init = function init(model, elementId) {

                $scope.prospectingGoalScale = model;
                $scope.elementId = elementId;

                if ($scope.prospectingGoalScale != null) {
                    if ($scope.measureUnits) {
                        if (!($scope.prospectingGoalScale.measureUnitId > 0)) {
                            var measureUnit = _.find($scope.measureUnits, function (item) {
                                return item.name.indexIf("Number") > -1;
                            });
                            var measureUnitId = null;
                            if (measureUnit) {
                                measureUnitId = measureUnit.id;
                            }
                            if (!($scope.prospectingGoalScale.measureUnitId > 0)) {
                                $scope.prospectingGoalScale.measureUnitId = measureUnitId;
                            }
                        }
                        $scope.prospectingGoalScale.measureUnit = $scope.getById($scope.prospectingGoalScale.measureUnitId, $scope.measureUnits);
                    }

                    if ($scope.categories) {
                        if (!($scope.prospectingGoalScale.scaleCategoryId > 0)) {
                            var category = $scope.categories[$scope.categories.length - 1];
                            var categoryId = null;
                            if (category) {
                                categoryId = category.id;
                            }
                            if (!($scope.prospectingGoalScale.scaleCategoryId > 0)) {
                                $scope.prospectingGoalScale.scaleCategoryId = categoryId;
                            }
                        }
                        $scope.prospectingGoalScale.scaleCategory = $scope.getById($scope.prospectingGoalScale.scaleCategoryId, $scope.categories);
                    }

                    if ($scope.prospectingGoalScale.prospectingGoalScaleRanges) {
                        if ($scope.prospectingGoalScale.prospectingGoalScaleRanges.length > 0) {
                            $scope.prospectingGoalScale.scaleInterval = $scope.prospectingGoalScale.prospectingGoalScaleRanges.length;
                            $scope.prospectingGoalScale.scaleStart = $scope.prospectingGoalScale.prospectingGoalScaleRanges[0].min;
                            $scope.prospectingGoalScale.scaleEnd = $scope.prospectingGoalScale.prospectingGoalScaleRanges[$scope.prospectingGoalScale.prospectingGoalScaleRanges.length - 1].max;
                            $scope.fillGrid();
                        }
                    }
                }

                if ($scope.prospectingGoalScale.scaleStart && $scope.prospectingGoalScale.scaleEnd && $scope.prospectingGoalScale.scaleInterval) {
                    if ($scope.prospectingGoalScale.scaleStart > 0 && $scope.prospectingGoalScale.scaleEnd > 0 && $scope.prospectingGoalScale.scaleInterval > 0 && $scope.prospectingGoalScale.name == null) {
                        $scope.generateScales();
                    }
                }
            };



            $scope.scaleCategoryUpdate = function () {
                $scope.prospectingGoalScale.scaleCategoryId = $scope.prospectingGoalScale.scaleCategory.id;
            }

            $scope.measureUnitUpdate = function () {
                $scope.prospectingGoalScale.measureUnitId = $scope.prospectingGoalScale.measureUnit.id;
            }

            $scope.getById = function getById(id, myArray) {
                if (myArray.filter) {
                    return myArray.filter(function (obj) {
                        if (obj.id == id) {
                            return obj
                        }
                    })[0]
                }
                return undefined;
            }

            $scope.getColor = function (id) {
                var color = '#fff';
                switch (id) {
                    case 0:
                        color = '#f00'
                        break
                    case 1:
                        color = '#ff0'
                        break
                    case 2:
                        color = '#0f3'
                        break
                    case 3:
                        color = '#06f'
                        break
                    case 4:
                        color = '#f99'
                        break
                    case 5:
                        color = '#99f'
                        break
                    case 6:
                        color = '#990'
                        break
                    case 7:
                        color = '#096'
                        break
                    case 8:
                        color = '#c60'
                        break
                    case 9:
                        color = '#30c'
                        break
                    default:
                        color = '#fff'
                }
                return color;
            }

            $scope.getRangesByKey = function (key) {
                if (key == "1_8_3") {
                    return [{
                        id: -1,
                        scaleId: $scope.prospectingGoalScale.id,
                        min: 1,
                        max: 3,
                        description: '',
                        color: $scope.getColor(0),
                    },
                    {
                        id: -1,
                        scaleId: $scope.prospectingGoalScale.id,
                        min: 4,
                        max: 6,
                        description: '',
                        color: $scope.getColor(1),
                    },
                    {
                        id: -1,
                        scaleId: $scope.prospectingGoalScale.id,
                        min: 7,
                        max: 8,
                        description: '',
                        color: $scope.getColor(2),
                    }
                    ]
                }
                else if (key == "1_50_3") {
                    return [{
                        id: -1,
                        scaleId: $scope.prospectingGoalScale.id,
                        min: 1,
                        max: 30,
                        description: '',
                        color: $scope.getColor(2),
                    },
                    {
                        id: -1,
                        scaleId: $scope.prospectingGoalScale.id,
                        min: 31,
                        max: 40,
                        description: '',
                        color: $scope.getColor(1),
                    },
                    {
                        id: -1,
                        scaleId: $scope.prospectingGoalScale.id,
                        min: 41,
                        max: 50,
                        description: '',
                        color: $scope.getColor(0),
                    }
                    ]
                }
                else if (key == "1_50_4") {
                    return [{
                        id: -1,
                        scaleId: $scope.prospectingGoalScale.id,
                        min: 1,
                        max: 30,
                        description: '',
                        color: $scope.getColor(3),
                    }, {
                        id: -1,
                        scaleId: $scope.prospectingGoalScale.id,
                        min: 31,
                        max: 40,
                        description: '',
                        color: $scope.getColor(2),
                    },
                    {
                        id: -1,
                        scaleId: $scope.prospectingGoalScale.id,
                        min: 41,
                        max: 45,
                        description: '',
                        color: $scope.getColor(1),
                    },
                    {
                        id: -1,
                        scaleId: $scope.prospectingGoalScale.id,
                        min: 45,
                        max: 50,
                        description: '',
                        color: $scope.getColor(0),
                    }
                    ]
                } else if (key == "1_50_5") {
                    return [{
                        id: -1,
                        scaleId: $scope.prospectingGoalScale.id,
                        min: 1,
                        max: 30,
                        description: '',
                        color: $scope.getColor(4),
                    }, {
                        id: -1,
                        scaleId: $scope.prospectingGoalScale.id,
                        min: 31,
                        max: 35,
                        description: '',
                        color: $scope.getColor(3),
                    }, {
                        id: -1,
                        scaleId: $scope.prospectingGoalScale.id,
                        min: 35,
                        max: 40,
                        description: '',
                        color: $scope.getColor(2),
                    },
                    {
                        id: -1,
                        scaleId: $scope.prospectingGoalScale.id,
                        min: 41,
                        max: 45,
                        description: '',
                        color: $scope.getColor(1),
                    },
                    {
                        id: -1,
                        scaleId: $scope.prospectingGoalScale.id,
                        min: 45,
                        max: 50,
                        description: '',
                        color: $scope.getColor(0),
                    }
                    ]
                }
                return [];
            }

            $scope.generateScales = function () {

                $scope.prospectingGoalScale.prospectingGoalScaleRanges = [];

                $scope.prospectingGoalScale.prospectingGoalScaleRanges = $scope.getRangesByKey($scope.prospectingGoalScale.scaleStart + "_" + $scope.prospectingGoalScale.scaleEnd + "_" + $scope.prospectingGoalScale.scaleInterval);

                if ($scope.prospectingGoalScale.prospectingGoalScaleRanges.length == 0) {
                    var step = ($scope.prospectingGoalScale.scaleEnd - $scope.prospectingGoalScale.scaleStart + 1) / $scope.prospectingGoalScale.scaleInterval;
                    var stepTop = Math.ceil(($scope.prospectingGoalScale.scaleEnd - $scope.prospectingGoalScale.scaleStart + 1) / $scope.prospectingGoalScale.scaleInterval);
                    var stepFloor = Math.floor(($scope.prospectingGoalScale.scaleEnd - $scope.prospectingGoalScale.scaleStart + 1) / $scope.prospectingGoalScale.scaleInterval);

                    //if (stepTop == stepFloor) { stepFloor = stepFloor - 1;}
                    for (var i = 0; i < $scope.prospectingGoalScale.scaleInterval; i++) {
                        var color = $scope.getColor(i);
                        if (i == 0) {
                            var range = {
                                id: -1,
                                scaleId: $scope.prospectingGoalScale.id,
                                min: Math.floor($scope.prospectingGoalScale.scaleStart + (step * i)),
                                max: Math.floor($scope.prospectingGoalScale.scaleStart + step * i + step - 1),
                                description: '',
                                color: color,
                            };
                            if (i == $scope.prospectingGoalScale.scaleInterval - 1) {
                                range.max = $scope.prospectingGoalScale.scaleEnd;
                            }
                            $scope.prospectingGoalScale.prospectingGoalScaleRanges.push(range);
                        }
                        else {
                            var range = {
                                id: -1,
                                scaleId: $scope.prospectingGoalScale.id,
                                min: $scope.prospectingGoalScale.prospectingGoalScaleRanges[i - 1].max,
                                max: Math.floor($scope.prospectingGoalScale.scaleStart + step * i + step - 1),
                                description: '',
                                color: color,
                            };
                            if (i == $scope.prospectingGoalScale.scaleInterval - 1) {
                                range.max = $scope.prospectingGoalScale.scaleEnd;
                            }
                            $scope.prospectingGoalScale.prospectingGoalScaleRanges.push(range);
                        }
                    }
                }

                $scope.fillGrid();
            };
            $scope.init($scope.ngModel);
        }],
        link: function ($scope, element, attrs) {

            $scope.$watch('ngModel', function (newValue, oldValue) {
                if (newValue) {
                    $scope.init(newValue, element[0].id);
                }
            }, false);

            apiService.getAll("MeasureUnit?$select=Id,Name&$orderby=Name").then(function (data) {
                $scope.measureUnits = data;
                if (($scope.prospectingGoalScale != null) && ($scope.prospectingGoalScale.measureUnitId)) {
                    $scope.prospectingGoalScale.measureUnit = $scope.getById($scope.prospectingGoalScale.measureUnitId, $scope.measureUnits);
                }

            });

            apiService.getAll("Scale_Categories?$select=Id,Name&$orderby=Name").then(function (data) {
                $scope.categories = data;

                if (($scope.prospectingGoalScale != null) && ($scope.prospectingGoalScale.scaleCategoryId)) {
                    $scope.prospectingGoalScale.scaleCategory = $scope.getById($scope.prospectingGoalScale.scaleCategoryId, $scope.categories);
                }
            });


        }
    }
}]);
