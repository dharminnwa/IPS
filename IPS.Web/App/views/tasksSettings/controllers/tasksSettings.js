(function () {
    'use strict';

    angular
        .module('ips.tasksSettings')

        .config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
            $stateProvider
                .state('home.todos.tasksSettings', {
                    url: "/tasksSettings",
                    templateUrl: "views/tasksSettings/views/tasksSettings.html",
                    controller: "tasksSettingsCtrl as tasksSettings",
                    resolve: {
                        pageName: function ($translate) {
                            return $translate.instant('TASKPROSPECTING_TASKS_SETTINGS');
                        },
                        organizations: function ($stateParams, tasksSettingsService, $translate) {
                            return tasksSettingsService.getOrganizations().then(function (data) {
                                data.unshift({ id: null, name: $translate.instant('TASKPROSPECTING_SELECT_ORGANIZATION') });
                                return data;
                            });
                        }
                    },
                    data: {
                        displayName: '{{pageName}}',//'Tasks Settings',
                        paneLimit: 1,
                        depth: 2,
                        resource: "Task Setting"
                    }
                })
                .state('home.todos.todos.tasksSettings', {
                    url: "/tasksSettings",
                    templateUrl: "views/tasksSettings/views/tasksSettings.html",
                    controller: "tasksSettingsCtrl as tasksSettings",
                    resolve: {
                        pageName: function ($translate) {
                            return $translate.instant('TASKPROSPECTING_TASKS_SETTINGS');
                        },
                        organizations: function ($stateParams, tasksSettingsService, $translate) {
                            return tasksSettingsService.getOrganizations().then(function (data) {
                                data.unshift({ id: null, name: $translate.instant('TASKPROSPECTING_SELECT_ORGANIZATION') });
                                return data;
                            });
                        }
                    },
                    data: {
                        displayName: '{{pageName}}',//'Tasks Settings',
                        paneLimit: 1,
                        depth: 3,
                        resource: "Task Setting"
                    }
                });
        }])
        .controller('tasksSettingsCtrl', tasksSettingsCtrl);
    tasksSettingsCtrl.$inject = ['cssInjector', '$stateParams', '$location', 'tasksSettingsService', 'dialogService', 'apiService', '$state', 'organizations', '$translate'];
    function tasksSettingsCtrl(cssInjector, $stateParams, $location, tasksSettingsService, dialogService, apiService, $state, organizations, $translate) {
        cssInjector.removeAll();
        cssInjector.add('views/tasksSettings/tasksSettings.css');
        var vm = this;
        vm.organizations = organizations;
        vm.organizationId = null;
        vm.departments = [{ id: null, name: $translate.instant('TASKPROSPECTING_SELECT_DEPARTMENT') }];
        vm.departmentId = null;
        vm.teams = [{ id: null, name: $translate.instant('TASKPROSPECTING_SELECT_TEAM') }];
        vm.teamId = null;
        vm.users = [{ id: null, firstName: $translate.instant('TASKPROSPECTING_SELECT_USER'), lastName: "" }];
        vm.userId = null;
        vm.listId = null;
        vm.settingsTypeId = 0;
        vm.settingsTypes = [{ id: 0, name: $translate.instant('COMMON_CATEGORY') }, { id: 1, name: $translate.instant('COMMON_PRIORITY') }, { id: 2, name: $translate.instant('COMMON_STATUS') }, { id: 3, name: $translate.instant('TASKPROSPECTING_SCALE_RATING') }];
        vm.IsGenerateAllowed = false;
        vm.taskScale = {
            id: -1,
            name: "5 star",
            description: "",
            scaleStart: 1,
            scaleEnd: 5,
            scaleInterval: 5,
            organizationId: 0,
            departmentId: 0,
            teamId: 0,
            userId: 0,
            taskScaleRanges: [{
                color: "#f00",
                description: "Low",
                id: -1,
                max: 3,
                min: 1,
                taskScalesId: -1,
            }, {
                color: "#ff0",
                description: "Medium",
                id: -1,
                max: 6,
                min: 3,
                taskScalesId: -1,
            }, {
                color: "#0f0",
                description: "High",
                id: -1,
                max: 10,
                min: 7,
                taskScalesId: -1
            }]
        };
        vm.categories = [];

        function getDataSource() {
            var dataSource = new kendo.data.DataSource({
                type: "json",
                transport: {
                    read: function (options) {
                        if ((vm.organizationId) && (vm.settingsTypeId == 0)) {
                            tasksSettingsService.getTaskCategories(vm.organizationId, vm.departmentId, vm.teamId, vm.userId).then(function (data) {
                                if (data != 404) {
                                    vm.IsGenerateAllowed = false;
                                    vm.listId = data.id;
                                    options.success(data.taskCategoryListItems);
                                } else {
                                    vm.IsGenerateAllowed = true;
                                    vm.listId = null;
                                    options.error(data);

                                }
                            }, function (message) {
                                dialogService.showNotification(message, "warning");
                            });
                        }

                        if ((vm.organizationId) && (vm.settingsTypeId == 1)) {
                            tasksSettingsService.getTaskPriorities(vm.organizationId, vm.departmentId, vm.teamId, vm.userId).then(function (data) {
                                if (data != 404) {
                                    vm.IsGenerateAllowed = false;
                                    vm.listId = data.id;
                                    options.success(data.taskPriorityListItems);
                                } else {
                                    vm.IsGenerateAllowed = true;
                                    vm.listId = null;
                                    options.error(data);
                                }
                            }, function (message) {
                                dialogService.showNotification(message, "warning");
                            });
                        }

                        if ((vm.organizationId) && (vm.settingsTypeId == 2)) {
                            tasksSettingsService.getTaskStatuses(vm.organizationId, vm.departmentId, vm.teamId, vm.userId).then(function (data) {
                                if (data != 404) {
                                    vm.IsGenerateAllowed = false;
                                    vm.listId = data.id;
                                    options.success(data.taskStatusListItems);
                                } else {
                                    vm.IsGenerateAllowed = true;
                                    vm.listId = null;
                                    options.error(data);
                                }
                            }, function (message) {
                                dialogService.showNotification(message, "warning");
                            });
                        }
                    },
                    update: function (options) {
                        if ((vm.organizationId) && (vm.settingsTypeId == 0)) {
                            var item = { id: options.data.id, name: options.data.name, description: options.data.description, categoryListId: options.data.categoryListId, color: options.data.color, textColor: options.data.textColor };
                            apiService.update("TaskCategories/listItem", item).then(function (data) {
                                options.success();
                            }, function (message) {
                                dialogService.showNotification(message, "warning");
                            })
                        }

                        if ((vm.organizationId) && (vm.settingsTypeId == 1)) {
                            var item = { id: options.data.id, name: options.data.name, description: options.data.description, priorityListId: options.data.priorityListId };
                            apiService.update("TaskPriorities/listItem", item).then(function (data) {
                                options.success();
                            }, function (message) {
                                dialogService.showNotification(message, "warning");
                            })
                        }


                        if ((vm.organizationId) && (vm.settingsTypeId == 2)) {
                            var item = { id: options.data.id, name: options.data.name, description: options.data.description, taskStatusListId: options.data.taskStatusListId };
                            apiService.update("TaskStatuses/listItem", item).then(function (data) {
                                options.success();
                            }, function (message) {
                                dialogService.showNotification(message, "warning");
                            })
                        }

                    },
                    create: function (options) {
                        if ((vm.organizationId) && (vm.settingsTypeId == 0)) {
                            var item = { id: options.data.id, name: options.data.name, description: options.data.description, categoryListId: vm.listId, color: options.data.color, textColor: options.data.textColor };

                            apiService.add("TaskCategories/listItem", item).then(function (data) {
                                options.data.id = data;
                                dialogService.showNotification($translate.instant('TASKPROSPECTING_SAVED_SUCCESFULLY'), "info");
                                options.success(options.data);
                            }, function (message) {
                                dialogService.showNotification(message, "warning");
                            })
                        }

                        if ((vm.organizationId) && (vm.settingsTypeId == 1)) {
                            var item = { id: options.data.id, name: options.data.name, description: options.data.description, priorityListId: vm.listId };
                            apiService.add("TaskPriorities/listItem", item).then(function (data) {
                                options.data.id = data;
                                dialogService.showNotification($translate.instant('TASKPROSPECTING_SAVED_SUCCESFULLY'), "info");
                                options.success(options.data);
                            }, function (message) {
                                dialogService.showNotification(message, "warning");
                            })
                        }


                        if ((vm.organizationId) && (vm.settingsTypeId == 2)) {
                            var item = { id: options.data.id, name: options.data.name, description: options.data.description, taskStatusListId: vm.listId };
                            apiService.add("TaskStatuses/listItem", item).then(function (data) {
                                options.data.id = data;
                                dialogService.showNotification($translate.instant('TASKPROSPECTING_SAVED_SUCCESFULLY'), "info");
                                options.success(options.data);
                            }, function (message) {
                                dialogService.showNotification(message, "warning");
                            })
                        }

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
                        }
                    }
                },
                error: function (err) {
                    this.cancelChanges();
                },
            });

            return dataSource;
        }
        function getasksRatingScaleDataSource() {
            tasksSettingsService.getTaskScale(vm.organizationId, vm.departmentId, vm.teamId, vm.userId).then(function (data) {
                vm.taskScale = data;
                //vm.taskScale.taskScaleRanges = data.taskScaleRanges;
                vm.fillGrid();
            });

        }



        function add() {
            if (vm.organizationId) {
                var grid = null;
                if (vm.settingsTypeId == 0) {
                    grid = $("#tasksCategoriesGrid").data("kendoGrid");
                }
                else {
                    grid = $("#taskSettingsGrid").data("kendoGrid");
                }

                grid.addRow();
            }
            else {
                dialogService.showNotification($translate.instant('TASKPROSPECTING_ORGANIZATION_NOT_SELECTED'), 'warning');
            }

        }

        function createNewList() {
            if ((vm.organizationId) && (vm.settingsTypeId == 0)) {
                apiService.add("TaskCategories/" + vm.organizationId + "/" + vm.departmentId + "/" + vm.teamId + "/" + vm.userId + "/list").then(function (data) {
                    reloadSelected();
                }, function (message) {
                    dialogService.showNotification(message, "warning");
                })
            }
            if ((vm.organizationId) && (vm.settingsTypeId == 1)) {
                apiService.add("TaskPriorities/" + vm.organizationId + "/" + vm.departmentId + "/" + vm.teamId + "/" + vm.userId + "/list").then(function (data) {
                    reloadSelected();
                }, function (message) {
                    dialogService.showNotification(message, "warning");
                })
            }
            if ((vm.organizationId) && (vm.settingsTypeId == 2)) {
                apiService.add("TaskStatuses/" + vm.organizationId + "/" + vm.departmentId + "/" + vm.teamId + "/" + vm.userId + "/list").then(function (data) {
                    reloadSelected();
                }, function (message) {
                    dialogService.showNotification(message, "warning");
                })
            }
        }

        function organizationChanged() {
            vm.IsGenerateAllowed = false;
            if (vm.organizationId) {

                tasksSettingsService.getDepartments(vm.organizationId).then(function (data) {
                    data.unshift({ id: null, name: $translate.instant('TASKPROSPECTING_SELECT_DEPARTMENT') });
                    vm.departments = data;
                });

                tasksSettingsService.getTeams(vm.organizationId).then(function (data) {
                    data.unshift({ id: null, name: $translate.instant('TASKPROSPECTING_SELECT_TEAM') });
                    vm.teams = data;
                });

                tasksSettingsService.getUsers(vm.organizationId).then(function (data) {
                    data.unshift({ id: null, firstName: $translate.instant('TASKPROSPECTING_SELECT_USER'), lastName: "" });
                    vm.users = data;
                });

                reloadSelected();
            }
        }

        function reloadSelected() {
            vm.IsGenerateAllowed = false;
            if (vm.organizationId) {
                if (vm.settingsTypeId == 3) {
                    getasksRatingScaleDataSource();
                }
                else {

                    if (vm.settingsTypeId == 0) {
                        var grid = $("#tasksCategoriesGrid").data("kendoGrid");
                        var dataSource = getDataSource();
                        grid.setDataSource(dataSource);
                        grid.refresh();
                    }
                    else {
                        grid = $("#taskSettingsGrid").data("kendoGrid");
                        if (grid) {
                            grid.setDataSource(dataSource);
                            grid.refresh();
                        }
                    }
                    vm.IsGenerateAllowed = true;
                }
            }
        }

        function filterUsers(item) {
            if (item.id == null) {
                return true;
            }

            if (vm.teamId) {
                angular.forEach(item.teams, function (team, index) {
                    if (team.id == vm.teamId) {
                        fResult = true;
                    }
                })

                return fResult;
            }

            if (!vm.departmentId) {
                return true;
            }

            var fResult = false;
            angular.forEach(item.departments, function (department, index) {
                if (department.id == vm.departmentId) {
                    fResult = true;
                }
            })

            angular.forEach(item.departments1, function (department, index) {
                if (department.id == vm.departmentId) {
                    fResult = true;
                }
            })



            return fResult;
        }

        vm.add = add;
        vm.filterUsers = filterUsers;
        vm.organizationChanged = organizationChanged;
        vm.reloadSelected = reloadSelected;
        vm.createNewList = createNewList;

        vm.fillGrid = function () {
            var data = new kendo.data.ObservableArray(vm.taskScale.taskScaleRanges);
            console.log(data);
            var ds = new kendo.data.DataSource({
                data: data,
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
                            taskScalesId: { type: 'number' }
                        }
                    }
                }
            });

            vm.gridRnagesOptions = {
                dataSource: ds,
                pageable: true,
                editable: true,
                edit: onGridEditing,
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


            $("#gridRnages").kendoGrid(vm.gridRnagesOptions).data("kendoGrid");

        }
        vm.getColor = function (id) {
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
        vm.getRangesByKey = function (key) {
            if (key == "1_8_3") {
                return [{
                    id: -1,
                    taskScalesId: vm.taskScale.id,
                    min: 1,
                    max: 3,
                    description: '',
                    color: vm.getColor(0),
                },
                {
                    id: -1,
                    taskScalesId: vm.taskScale.id,
                    min: 4,
                    max: 6,
                    description: '',
                    color: vm.getColor(1),
                },
                {
                    id: -1,
                    taskScalesId: vm.taskScale.id,
                    min: 7,
                    max: 8,
                    description: '',
                    color: vm.getColor(2),
                }
                ]
            }
            else if (key == "1_50_3") {
                return [{
                    id: -1,
                    taskScalesId: vm.taskScale.id,
                    min: 1,
                    max: 30,
                    description: '',
                    color: vm.getColor(2),
                },
                {
                    id: -1,
                    taskScalesId: vm.taskScale.id,
                    min: 31,
                    max: 40,
                    description: '',
                    color: vm.getColor(1),
                },
                {
                    id: -1,
                    taskScalesId: vm.taskScale.id,
                    min: 41,
                    max: 50,
                    description: '',
                    color: vm.getColor(0),
                }
                ]
            }
            else if (key == "1_50_4") {
                return [{
                    id: -1,
                    taskScalesId: vm.taskScale.id,
                    min: 1,
                    max: 30,
                    description: '',
                    color: vm.getColor(3),
                }, {
                    id: -1,
                    taskScalesId: vm.taskScale.id,
                    min: 31,
                    max: 40,
                    description: '',
                    color: vm.getColor(2),
                },
                {
                    id: -1,
                    taskScalesId: vm.taskScale.id,
                    min: 41,
                    max: 45,
                    description: '',
                    color: vm.getColor(1),
                },
                {
                    id: -1,
                    taskScalesId: vm.taskScale.id,
                    min: 45,
                    max: 50,
                    description: '',
                    color: vm.getColor(0),
                }
                ]
            } else if (key == "1_50_5") {
                return [{
                    id: -1,
                    taskScalesId: vm.taskScale.id,
                    min: 1,
                    max: 30,
                    description: '',
                    color: vm.getColor(4),
                }, {
                    id: -1,
                    taskScalesId: vm.taskScale.id,
                    min: 31,
                    max: 35,
                    description: '',
                    color: vm.getColor(3),
                }, {
                    id: -1,
                    taskScalesId: vm.taskScale.id,
                    min: 35,
                    max: 40,
                    description: '',
                    color: vm.getColor(2),
                },
                {
                    id: -1,
                    taskScalesId: vm.taskScale.id,
                    min: 41,
                    max: 45,
                    description: '',
                    color: vm.getColor(1),
                },
                {
                    id: -1,
                    taskScalesId: vm.taskScale.id,
                    min: 45,
                    max: 50,
                    description: '',
                    color: vm.getColor(0),
                }
                ]
            }
            return [];
        }
        vm.generateScales = function () {

            vm.taskScale.taskScaleRanges = [];

            vm.taskScale.taskScaleRanges = vm.getRangesByKey(vm.taskScale.scaleStart + "_" + vm.taskScale.scaleEnd + "_" + vm.taskScale.scaleInterval);

            if (vm.taskScale.taskScaleRanges.length == 0) {
                var step = (vm.taskScale.scaleEnd - vm.taskScale.scaleStart + 1) / vm.taskScale.scaleInterval;
                var stepTop = Math.ceil((vm.taskScale.scaleEnd - vm.taskScale.scaleStart + 1) / vm.taskScale.scaleInterval);
                var stepFloor = Math.floor((vm.taskScale.scaleEnd - vm.taskScale.scaleStart + 1) / vm.taskScale.scaleInterval);

                //if (stepTop == stepFloor) { stepFloor = stepFloor - 1;}
                for (var i = 0; i < vm.taskScale.scaleInterval; i++) {
                    var color = vm.getColor(i);

                    var range = {
                        id: -1,
                        taskScalesId: vm.taskScale.id,
                        min: Math.floor(vm.taskScale.scaleStart + (step * i)),
                        max: Math.floor(vm.taskScale.scaleStart + step * i + step - 1),
                        description: '',
                        color: color,
                    };
                    if (i == vm.taskScale.scaleInterval - 1) {
                        range.max = vm.taskScale.scaleEnd;
                    }
                    vm.taskScale.taskScaleRanges.push(range)
                }
            }

            vm.fillGrid();
        };
        vm.saveTaskScale = function () {
            var item = angular.copy(vm.taskScale);
            item.organizationId = vm.organizationId;
            item.departmentId = vm.departmentId;
            item.teamId = vm.teamId;
            item.userId = vm.userId;

            var gridRangesData = $("#gridRnages").data("kendoGrid");
            if (gridRangesData) {
                item.taskScaleRanges = [];
                var gridRangesDataSource = gridRangesData.dataSource.data();
                _.forEach(gridRangesDataSource, function (scaleItem) {
                    var obj = {
                        color: scaleItem.color, //"#f00",
                        description: scaleItem.description,
                        id: scaleItem.id,
                        max: scaleItem.max,
                        min: scaleItem.min,
                        taskScalesId: item.id,
                    };
                    item.taskScaleRanges.push(obj);
                });
            }

            if (item.id > 0) {
                apiService.update("TaskScale", item).then(function (data) {

                    (data) ? notification($translate.instant('TASKPROSPECTING_TASK_SCALE_SAVED_SUCCESSFULLY')) : notification($translate.instant('TASKPROSPECTING_SAVE_FAILED'));
                    getasksRatingScaleDataSource();
                });
            }
            else {

                apiService.add("TaskScale", item).then(function (data) {

                    vm.taskScale.id = data;
                    (vm.taskScale.id > 0) ? notification($translate.instant('TASKPROSPECTING_TASK_SCALE_SAVED_SUCCESSFULLY')) : notification($translate.instant('TASKPROSPECTING_SAVE_FAILED'));
                    getasksRatingScaleDataSource();
                });
            }

        }

        function onGridEditing(arg) {
            arg.container.find("input[name='name']").attr('maxlength', '50');
            arg.container.find("input[name='description']").attr('maxlength', '500');
        }

        vm.tasksCategoriesGridOptions = {
            dataSource: getDataSource(),
            sortable: true,
            pageable: true,
            edit: onGridEditing,
            editable: {
                mode: "inline",
                confirmation: false
            },
            columns: [
                { field: "name", title: $translate.instant('COMMON_NAME'), width: "200px" },
                { field: "description", title: $translate.instant('COMMON_DESCRIPTION'), width: "200px" },
                {
                    field: "color", title: $translate.instant('TASKMANAGEMENT_BACKGROUND_COLOR'), width: "250px",
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
                },
                {
                    field: "textColor", title: $translate.instant('TASKMANAGEMENT_TEXT_COLOR'), width: "120px",
                    template: function (dataItem) {
                        return "<div style='background-color: " + dataItem.textColor + ";'>&nbsp;</div>";
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
                },
                {
                    command: [{ name: "edit", text: "", width: 30 },
                    {
                        name: "btnDelete", text: "", width: 30,
                        className: "btn-delete",
                        //template: "<a class=\"k-button k-button-icontext " ><span class=\"k-icon k-delete\"></span></a>",
                        click: function (e) {
                            e.preventDefault();
                            var tr = $(e.target).closest("tr"); /* get the current table row (tr) */
                            var data = this.dataItem(tr);
                            dialogService.showYesNoDialog($translate.instant('COMMON_CONFIRM'), $translate.instant('COMMON_ARE_YOU_SURE_YOU_WANT_TO_DELETE')).then(
                                function () {
                                    if ((vm.organizationId) && (vm.settingsTypeId == 0)) {

                                        apiService.remove("TaskCategories/listItem", data.id).then(function (data) {
                                            var grid = $("#tasksCategoriesGrid").data("kendoGrid");
                                            var dataSource = getDataSource();
                                            grid.setDataSource(dataSource);
                                            grid.refresh();
                                        })
                                    }

                                    if ((vm.organizationId) && (vm.settingsTypeId == 1)) {
                                        apiService.remove("TaskPriorities/listItem", data.id).then(function (data) {
                                            var grid = $("#tasksCategoriesGrid").data("kendoGrid");
                                            var dataSource = getDataSource();
                                            grid.setDataSource(dataSource);
                                            grid.refresh();
                                        })
                                    }

                                    if ((vm.organizationId) && (vm.settingsTypeId == 2)) {
                                        apiService.remove("TaskStatuses/listItem", data.id).then(function (data) {
                                            var grid = $("#tasksCategoriesGrid").data("kendoGrid");
                                            var dataSource = getDataSource();
                                            grid.setDataSource(dataSource);
                                            grid.refresh();
                                        })
                                    }
                                },
                                function () {

                                });
                        }
                    }],
                    field: "action", title: $translate.instant('COMMON_ACTIONS'), width: "150px", filterable: false, sortable: false,
                    headerAttributes: {
                        "data-title": $translate.instant('COMMON_ACTIONS')
                    }
                },
            ],
        };
        vm.tasksGridOptions = {
            dataSource: getDataSource(),
            sortable: true,
            pageable: true,
            edit: onGridEditing,
            editable: {
                mode: "inline",
                confirmation: false
            },
            columns: [
                { field: "name", title: $translate.instant('COMMON_NAME'), width: 300 },
                { field: "description", title: $translate.instant('COMMON_DESCRIPTION'), width: 300 },
                {
                    command: [{ name: "edit", text: "", width: 30 },
                    {
                        name: "btnDelete", text: "", width: 30,
                        className: "btn-delete",
                        //template: "<a class=\"k-button k-button-icontext " ><span class=\"k-icon k-delete\"></span></a>",
                        click: function (e) {
                            e.preventDefault();
                            var tr = $(e.target).closest("tr"); /* get the current table row (tr) */
                            var data = this.dataItem(tr);
                            dialogService.showYesNoDialog($translate.instant('COMMON_CONFIRM'), $translate.instant('COMMON_ARE_YOU_SURE_YOU_WANT_TO_DELETE')).then(
                                function () {
                                    if ((vm.organizationId) && (vm.settingsTypeId == 0)) {

                                        apiService.remove("TaskCategories/listItem", data.id).then(function (data) {
                                            var grid = $("#tasksCategoriesGrid").data("kendoGrid");
                                            var dataSource = getDataSource();
                                            grid.setDataSource(dataSource);
                                            grid.refresh();
                                        })
                                    }

                                    if ((vm.organizationId) && (vm.settingsTypeId == 1)) {
                                        apiService.remove("TaskPriorities/listItem", data.id).then(function (data) {
                                            var grid = $("#tasksCategoriesGrid").data("kendoGrid");
                                            var dataSource = getDataSource();
                                            grid.setDataSource(dataSource);
                                            grid.refresh();
                                        })
                                    }

                                    if ((vm.organizationId) && (vm.settingsTypeId == 2)) {
                                        apiService.remove("TaskStatuses/listItem", data.id).then(function (data) {
                                            var grid = $("#tasksCategoriesGrid").data("kendoGrid");
                                            var dataSource = getDataSource();
                                            grid.setDataSource(dataSource);
                                            grid.refresh();
                                        })
                                    }
                                },
                                function () {

                                });
                        }
                    }], field: "actions", title: $translate.instant('COMMON_ACTIONS'), width: 60, filterable: false, sortable: false,
                },
            ],
        };
        vm.tooltipOptions = {
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

        function notification(message) {
            dialogService.showNotification(message, "info");
        }
    }
})();