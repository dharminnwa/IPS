angular.module('ips.trainingdiary')
    .directive('projectTrainingPopup', [function () {
        return {
            restrict: 'E',
            templateUrl: 'views/trainingDiary/directives/ProjectTrainingPopup.html',
            scope: {
                organizationId: '=?',
                userId: '=',
                saveMode: '=',
                openProjectTrainingPopupMode: '=',
                editingTraining: '=?',
                skill: '=?',
                evaluationAgreement: '=?',
                skills: '=?',
                notificationTemplates: '=?',
                stage: '='
            },
            controller: 'projectTrainingPopupCtrl'
        };
    }])

    .controller('projectTrainingPopupCtrl', ['$scope', 'trainingsDiaryService', 'dialogService', 'apiService', 'Upload', 'trainingSaveModeEnum', 'finalKPIService', 'trainingdiaryManager', 'reminderEnum', 'progressBar', 'globalVariables', '$translate',
        function ($scope, trainingsDiaryService, dialogService, apiService, Upload, trainingSaveModeEnum, finalKPIService, trainingdiaryManager, reminderEnum, progressBar, globalVariables, $translate) {
            $scope.projectTrainingswinTrainingMaterial;
            $scope.newProjectTrainingWindow;
            $scope.projectTrainingsSearchWindow;
            $scope.searchProjectTrainingGridInstance;
            $scope.templateInfo;
            $scope.reminders = [
                { value: -1440, text: $translate.instant('COMMON_BEFORE_1_DAY') },
                { value: -60, text: $translate.instant('COMMON_BEFORE_1_HOUR') },
                { value: -30, text: $translate.instant('COMMON_BEFORE_30_MIN') },
                { value: -15, text: $translate.instant('COMMON_BEFORE_15_MIN') },
                { value: -5, text: $translate.instant('COMMON_BEFORE_5_MIN') }];
            moment.locale(globalVariables.lang.currentUICulture);
            $scope.newTraining = {
                name: 'Recurrent Training for ',
                typeId: null,
                levelId: null,
                why: '',
                what: '',
                how: '',
                additionalInfo: '',
                startDate: moment(new Date()).format('L LT'),
                endDate: moment(new Date()).format('L LT'),
                duration: 30,
                durationMetricId: null,
                frequency: "FREQ=WEEKLY;BYDAY=WE",
                howMany: 1,
                exerciseMetricId: null,
                howManySets: 1,
                howManyActions: 1,
                isActive: true,
                organizationId: $scope.organizationId,
                trainingMaterial: { id: 0, name: "", description: "", title: "", materialType: "", resourceType: "" },
                trainingMaterials: new kendo.data.ObservableArray([]),
                userId: $scope.userId,
                skills: [],
                skillId: ($scope.skill == null ? null : $scope.skill.id),
                notificationTemplateId: null,
                isNotificationByEmail: true,
                emailNotificationIntervalId: null,
                emailBefore: reminderEnum[0].value,
                isNotificationBySMS: false,
                smsNotificationIntervalId: null,

            }
            $scope.trainings = new kendo.data.ObservableArray([]);
            $scope.searchAddDisabled = true;
            $scope.currentTrainingIndex = -1;
            $scope.filter;
            $scope.performanceGroups = [];
            $scope.organizations
            $scope.trainingTypes;
            $scope.trainingLevels;
            $scope.ratings = [
                { value: 1, background: "#f00" },
                { value: 2, background: "#ff0" },
                { value: 3, background: "#0f3" },
                { value: 4, background: "#06f" },
                { value: 5, background: "#f99" },
            ];

            $scope.durationMetrics;
            $scope.exerciseMetrics;
            $scope.subIndustries = [];
            $scope.trainingMaterials = new kendo.data.ObservableArray([]);
            $scope.isEditTM = false;
            $scope.trainingSaveModeEnum = trainingSaveModeEnum;
            $scope.endDateOptions = {
                min: $scope.newTraining.startDate
            };

            $scope.openSearchWindow = function () {
                trainingsDiaryService.getOrganizations().then(function (data) {
                    $scope.organizations = data;
                });
                trainingsDiaryService.getPerformanceGroupsWithProfile().then(function (data) {
                    $scope.AllPerformanceGroups = data;
                    $scope.performanceGroups = data;
                });
                trainingsDiaryService.getIndustries().then(function (data) {
                    $scope.industries = data;
                    $scope.mainIndustries = _.filter(data, function (i) {
                        return i.parentId == null;
                    });
                });
                trainingsDiaryService.getProfileLevels().then(function (data) {
                    $scope.profileLevels = data;
                });
                trainingsDiaryService.getProfileTargetGroups().then(function (data) {
                    $scope.targetGroups = data;
                });
                $scope.saveMode = trainingSaveModeEnum.createkpi;
                $scope.openProjectTrainingPopupMode.isOpenAddExistingTrainingPopup = true;
            };
            $scope.startDateOpen = function (event) {
                var datepicker = $(event.sender.element).data("kendoDateTimePicker");
                moment.locale(globalVariables.lang.currentUICulture);
                $scope.newTraining.startDate = moment(new Date()).format('L LT');
                datepicker.setOptions({
                    min: kendo.parseDate($scope.newTraining.startDate),
                    max: kendo.parseDate($scope.$parent.activeStage.endDate)
                });
            };
            $scope.startDateChange = function () {
                if (!(kendo.parseDate($scope.newTraining.startDate) < kendo.parseDate($scope.newTraining.endDate))) {
                    $scope.newTraining.endDate = "";
                }
            };
            $scope.endDateOpen = function (event) {
                var datepicker = $(event.sender.element).data("kendoDateTimePicker")
                datepicker.setOptions({
                    min: kendo.parseDate($scope.newTraining.startDate),
                    max: kendo.parseDate($scope.$parent.activeStage.endDate)
                });

            };
            $scope.reminders = [
                { value: -1440, text: $translate.instant('COMMON_BEFORE_1_DAY') },
                { value: -60, text: $translate.instant('COMMON_BEFORE_1_HOUR') },
                { value: -30, text: $translate.instant('COMMON_BEFORE_30_MIN') },
                { value: -15, text: $translate.instant('COMMON_BEFORE_15_MIN') },
                { value: -5, text: $translate.instant('COMMON_BEFORE_5_MIN') }];

            $scope.initOnPopupOpen = function () {
                trainingsDiaryService.getDurationMetrics().then(function (data) {
                    $scope.durationMetrics = data;
                });
                trainingsDiaryService.getExerciseMetrics().then(function (data) {
                    $scope.exerciseMetrics = data;
                });
                trainingsDiaryService.getTrainingTypes().then(function (data) {
                    $scope.trainingTypes = data;
                });
                trainingsDiaryService.getTrainingLevels().then(function (data) {
                    $scope.trainingLevels = data;
                });
                trainingsDiaryService.getSkills().then(function (data) {
                    $scope.allSkills = data;
                    $scope.skills = data;
                });
                trainingdiaryManager.getNotificationTemplates().then(function (data) {
                    data.unshift({ id: null, name: "Select Template..." });
                    $scope.notificationTemplates = data;
                });

                if ($scope.skill) {
                    $scope.newTraining.skillId = $scope.skill.id;
                }
                if ($scope.editingTraining) {
                    $scope.trainingMaterials = new kendo.data.ObservableArray([]);
                    _.forEach($scope.editingTraining.trainingMaterials, function (tmitem) {
                        $scope.trainingMaterials.push(tmitem);
                    });

                    var kendoGrid = $("#projectTrainingMaterialsGrid").data("kendoGrid")
                    if (kendoGrid) {
                        kendoGrid.setOptions($scope.getOptions());
                    }
                }
            }
            $scope.$on("kendoRendered", function (event) {
                if (event.targetScope.projectTrainingswinTrainingMaterial) {
                    $scope.projectTrainingswinTrainingMaterial = event.targetScope.projectTrainingswinTrainingMaterial;
                }
                if (event.targetScope.projectTrainingswinTrainingType) {
                    $scope.projectTrainingswinTrainingType = event.targetScope.projectTrainingswinTrainingType;
                }
                //if (event.targetScope.projectTrainingsSearchWindow) {
                //    $scope.projectTrainingsSearchWindow = event.targetScope.projectTrainingsSearchWindow;
                //}
                //if (event.targetScope.newProjectTrainingWindow) {
                //    $scope.newProjectTrainingWindow = event.targetScope.newProjectTrainingWindow;
                //}
                if (event.targetScope.searchProjectTrainingsGrid) {
                    $scope.searchProjectTrainingGridInstance = event.targetScope.searchProjectTrainingsGrid;
                }

            });
            $scope.addWhyReasons = function () {

                if ($scope.skill) {
                    var skillId = $scope.skill.id;
                    if (skillId) {
                        var getQuery = "(SkillId eq " + skillId + ")and(DescriptionType eq 0)";
                        var parameters = [{ key: "SkillId", value: skillId }, { key: "DescriptionType", value: "0" }];

                        dialogService.showSelectableGridDialog($translate.instant('TRAININGDAIRY_SELECT_WHY_REASONS'), "description", "TrainingDescriptions", "Description", getQuery, parameters, false).then(
                            function (data) {
                                angular.forEach(data, function (item, index) {
                                    $scope.newTraining.why += item.description + "\n";
                                });
                            });
                    } else {
                        dialogService.showNotification($translate.instant('TRAININGDAIRY_PLEASE_SELECT_THE_SKILL'), "warning");
                    }
                }
                else {
                    var skillId = $scope.newTraining.skillId;
                    if (skillId) {
                        var getQuery = "(SkillId eq " + skillId + ")and(DescriptionType eq 0)";
                        var parameters = [{ key: "SkillId", value: skillId }, { key: "DescriptionType", value: "0" }];

                        dialogService.showSelectableGridDialog($translate.instant('TRAININGDAIRY_SELECT_WHY_REASONS'), "description", "TrainingDescriptions", "Description", getQuery, parameters, false).then(
                            function (data) {
                                angular.forEach(data, function (item, index) {
                                    $scope.newTraining.why += item.description + "\n";
                                });
                            });
                    }
                    else {
                        dialogService.showNotification($translate.instant('TRAININGDAIRY_PLEASE_SELECT_THE_SKILL'), "warning");
                    }
                }

            }
            $scope.addWhatReasons = function () {
                if ($scope.skill) {
                    var skillId = $scope.skill.id;
                    if (skillId) {
                        var getQuery = "(SkillId eq " + skillId + ")and(DescriptionType eq 1)";
                        var parameters = [{ key: "SkillId", value: skillId }, { key: "DescriptionType", value: "1" }];
                        dialogService.showSelectableGridDialog($translate.instant('TRAININGDAIRY_SELECT_WHAT_REASONS'), "description", "TrainingDescriptions", "Description", getQuery, parameters, false).then(
                            function (data) {
                                angular.forEach(data, function (item, index) {
                                    $scope.newTraining.what += item.description + "\n";
                                });
                            });
                    } else {
                        dialogService.showNotification($translate.instant('TRAININGDAIRY_PLEASE_SELECT_THE_SKILL'), "warning");
                    }
                }
                else {

                    var skillId = $scope.newTraining.skillId;
                    if (skillId) {
                        var getQuery = "(SkillId eq " + skillId + ")and(DescriptionType eq 1)";
                        var parameters = [{ key: "SkillId", value: skillId }, { key: "DescriptionType", value: "1" }];
                        dialogService.showSelectableGridDialog($translate.instant('TRAININGDAIRY_SELECT_WHAT_REASONS'), "description", "TrainingDescriptions", "Description", getQuery, parameters, false).then(
                            function (data) {
                                angular.forEach(data, function (item, index) {
                                    $scope.newTraining.what += item.description + "\n";
                                });
                            });
                    } else {
                        dialogService.showNotification($translate.instant('TRAININGDAIRY_PLEASE_SELECT_THE_SKILL'), "warning");
                    }

                }
            }
            $scope.addHowReasons = function () {
                if ($scope.skill) {
                    var skillId = $scope.skill.id;
                    if (skillId) {
                        var getQuery = "(SkillId eq " + skillId + ")and(DescriptionType eq 2)";
                        var parameters = [{ key: "SkillId", value: skillId }, { key: "DescriptionType", value: "2" }];
                        dialogService.showSelectableGridDialog($translate.instant('TRAININGDAIRY_SELECT_HOW_REASONS'), "description", "TrainingDescriptions", "Description", getQuery, parameters, false).then(
                            function (data) {
                                angular.forEach(data, function (item, index) {
                                    $scope.newTraining.how += item.description + "\n";
                                });
                            });
                    } else {
                        dialogService.showNotification($translate.instant('TRAININGDAIRY_PLEASE_SELECT_THE_SKILL'), "warning");
                    }
                }
                else {

                    var skillId = $scope.newTraining.skillId;
                    if (skillId) {
                        var getQuery = "(SkillId eq " + skillId + ")and(DescriptionType eq 2)";
                        var parameters = [{ key: "SkillId", value: skillId }, { key: "DescriptionType", value: "2" }];
                        dialogService.showSelectableGridDialog($translate.instant('TRAININGDAIRY_SELECT_HOW_REASONS'), "description", "TrainingDescriptions", "Description", getQuery, parameters, false).then(
                            function (data) {
                                angular.forEach(data, function (item, index) {
                                    $scope.newTraining.how += item.description + "\n";
                                });
                            });
                    }
                    else {
                        dialogService.showNotification($translate.instant('TRAININGDAIRY_PLEASE_SELECT_THE_SKILL'), "warning");
                    }

                }
            }
            $scope.onUserAssignGridDataBound = function (e) {
                var grid = e.sender;
                if (grid.dataSource.total() == 0) {
                    var colCount = grid.columns.length;
                    $(e.sender.wrapper)
                        .find('tbody')
                        .append('<tr class="kendo-data-row"><td colspan="' + colCount + '" class="no-data">There is no data to show in the grid.</td></tr>');
                }
            };
            $scope.downloadTrainingMaterial = function (uri, name) {
                var link = document.createElement("a");
                link.download = name;
                link.href = uri;
                link.click();
            };
            $scope.openLink = function (link) {
                var win = window.open(link);
                win.focus();
            };
            $scope.editTrainingMaterial = function (id) {
                $scope.newTraining.trainingMaterial = angular.copy($scope.private.getById(id, $scope.trainingMaterials));
                $scope.projectTrainingswinTrainingMaterial.open().center();
                $scope.isEditTM = true;
            };
            $scope.remove = function (id) {
                var index = _.findIndex($scope.trainingMaterials, function (tr) { return tr.id == id; });
                $scope.trainingMaterials.splice(index, 1);
            }
            $scope.private = {
                getById: function (id, myArray) {
                    if (myArray.filter) {
                        return myArray.filter(function (obj) {
                            if (obj.id == id) {
                                return obj;
                            }
                        })[0];
                    }
                    return undefined;
                }
            };
            $scope.getOptions = function () {
                return {
                    dataBound: $scope.onUserAssignGridDataBound,
                    dataSource: new kendo.data.DataSource({
                        type: "json",
                        data: $scope.trainingMaterials,
                        schema: {
                            model: {
                                id: "id",
                                fields: {
                                    id: { type: 'number', },
                                    name: { type: 'string' },
                                    description: { type: 'string' }
                                }
                            }
                        }
                    }),
                    columnMenu: false,
                    filterable: true,
                    sortable: true,
                    pageable: true,
                    resizable: true,
                    columns: [
                        {
                            field: "title", title: $translate.instant('COMMON_TITLE'), width: "100px", template: function (dataItem) {
                                if (dataItem.name) {
                                    return "<div><a class='' ng-click='downloadTrainingMaterial(\""
                                        + webConfig.trainingMaterialsController + dataItem.name + "\", \""
                                        + dataItem.title + "\");'>" + dataItem.title + "</a></div>";
                                } else if (dataItem.link) {
                                    return "<div><a class='' ng-click='openLink(\"" + dataItem.link + "\");'>" + dataItem.title + "</a></div>";
                                } else {
                                    return "<div>" + dataItem.title + "</div>";
                                }


                            }
                        },
                        { field: "materialType", title: $translate.instant('COMMON_MATERIAL_TYPE'), width: "160px" },
                        { field: "description", title: $translate.instant('COMMON_DESCRIPTION'), width: "150px", template: "<div class='readmoreText' title='#= description #'>#= description # </div>" },
                        {
                            field: "link", title: $translate.instant('COMMON_URL'), width: "150px", template: function (dataItem) {
                                if (dataItem.link) {
                                    return "<div><a class='' ng-click='openLink(\"" + dataItem.link + "\");'>" + dataItem.link + "</a></div>";
                                }
                                else {
                                    return "Not Available";
                                }
                            }
                        },
                        {
                            field: "actions", title: $translate.instant('COMMON_ACTIONS'), width: "100px", filterable: false,
                            template: function (dataItem) {
                                return "<div class='icon-groups'>"
                                    + "<a class='fa fa-pencil fa-lg' ng-click='editTrainingMaterial(" + dataItem.id + ");'></a>"
                                    + "<a class='fa fa-trash fa-lg' ng-click='remove(" + dataItem.id + ");'></a>"
                                    + "</div>";
                            }
                        }
                    ]
                };
            };
            $scope.addTrainingMaterial = function () {
                $scope.newTraining.trainingMaterial = { name: "", description: "", title: "", materialType: "", resourceType: "" };
                $scope.newTraining.trainingMaterial.id = ($scope.trainingMaterials.length + 1) * -1;

                $scope.projectTrainingswinTrainingMaterial.open().center();
                $scope.isEditTM = false;
            };
            $scope.closeNewTraining = function () {
                $scope.openProjectTrainingPopupMode.isOpenNewTrainingPopup = false;

            }
            $scope.saveChangesForTraining = function () {
                $scope.newTraining.trainingMaterials = angular.copy($scope.trainingMaterials);
                $scope.trainingMaterials.splice(0, $scope.trainingMaterials.length);
                $scope.newTraining.id = 0;
                $scope.saveTraining();
            }
            $scope.saveTraining = function () {
                var item = _.clone($scope.newTraining);
                item.startDate = kendo.parseDate(item.startDate);
                item.endDate = kendo.parseDate(item.endDate);
                if (!(item.userId > 0)) {
                    item.userId = null;
                }
                if (item.id > 0) {
                    apiService.update("trainings", item).then(function (data) {
                        if (data) {
                            $scope.newTraining = data;
                            dialogService.showNotification($translate.instant('TRAININGDAIRY_TRAINING_SAVED_SUCCESSFULLY'), 'info');
                            $scope.openProjectTrainingPopupMode.isOpenNewTrainingPopup = false;
                            var dialog = $scope.newProjectTrainingWindow.data("kendoWindow");
                            if (dialog) {
                                $scope.projectTrainingsSearchWindow = $("#projectTrainingsSearchWindow");
                                var projectTrainingsSearchWindowDialog = $scope.projectTrainingsSearchWindow.data("kendoWindow");
                                if (projectTrainingsSearchWindowDialog) {
                                    projectTrainingsSearchWindowDialog.destroy();
                                }
                                dialog.close();
                                dialog.destroy();
                            }
                        }
                        else {
                            dialogService.showNotification($translate.instant('TRAININGDAIRY_SAVE_FAILED'), 'warning');
                        }

                    }, function (error) {
                        dialogService.showNotification(error, "warning");
                    });
                }
                else {
                    if ($scope.skill) {
                        item.skills = [$scope.skill];
                        item.userId = null;
                    }
                    apiService.add("trainings", item).then(function (data) {
                        $scope.newTraining = data;
                        $scope.newTraining.pgSkillId = null;

                        if ($scope.newTraining.id > 0) {
                            dialogService.showNotification($translate.instant('TRAININGDAIRY_TRAINING_SAVED_SUCCESSFULLY'), 'info');
                            $scope.openProjectTrainingPopupMode.isOpenNewTrainingPopup = false;
                            var dialog = $scope.newProjectTrainingWindow.data("kendoWindow");
                            if (dialog) {

                                $scope.projectTrainingsSearchWindow = $("#projectTrainingsSearchWindow");
                                var projectTrainingsSearchWindowDialog = $scope.projectTrainingsSearchWindow.data("kendoWindow");
                                if (projectTrainingsSearchWindowDialog) {
                                    projectTrainingsSearchWindowDialog.destroy();
                                }
                                dialog.close();
                                dialog.destroy();
                            }
                            if ($scope.evaluationAgreement) {
                                $scope.evaluationAgreement.trainings.push(data);

                                submit([$scope.evaluationAgreement]);
                            }

                        } else {
                            dialogService.showNotification($translate.instant('TRAININGDAIRY_SAVE_FAILED'), 'warning');
                        }
                    }, function (error) {
                        dialogService.showNotification(error, "warning");
                    });
                }
            }

            $scope.saveSameTraining = function () {
                $scope.newTraining.trainingMaterials = angular.copy($scope.trainingMaterials);
                $scope.trainingMaterials.splice(0, $scope.trainingMaterials.length);
                $scope.saveTraining();
            }
            $scope.upload = [];
            $scope.onFileSelect = function ($files) {
                for (var i = 0; i < $files.length; i++) {
                    var $file = $files[i];
                    (function (index) {
                        $scope.upload[index] = Upload.upload({
                            url: "../api/api/upload/trainingMaterials",
                            method: "POST",
                            file: $file
                        }).progress(function (evt) {
                        }).success(function (data) {
                            $scope.newTraining.trainingMaterial.resourceType = $file.type;
                            if (!$scope.newTraining.trainingMaterial.title) { $scope.newTraining.trainingMaterial.title = $file.name; }
                            (data) ? $scope.newTraining.trainingMaterial.name = data : '';

                        }).error(function (data) {
                            dialogService.showNotification(data, 'warning');
                        });
                    })(i);
                }
            };
            $scope.cancelTrainingMaterial = function () {
                $scope.projectTrainingswinTrainingMaterial.close();
            };
            $scope.okTrainingMaterial = function () {
                if (($scope.newTraining.trainingMaterial.materialType) && ($scope.newTraining.trainingMaterial.materialType.name)) {
                    $scope.newTraining.trainingMaterial.materialType = $scope.newTraining.trainingMaterial.materialType.name;
                }
                else {
                    $scope.newTraining.trainingMaterial.materialType = "";
                }
                $scope.projectTrainingswinTrainingMaterial.close();
                if ($scope.isEditTM) {
                    var item = $scope.private.getById($scope.newTraining.trainingMaterial.id, $scope.trainingMaterials);
                    var index = $scope.trainingMaterials.indexOf(item);
                    $scope.trainingMaterials.splice(index, 1, $scope.newTraining.trainingMaterial);
                } else {
                    $scope.trainingMaterials.push(angular.copy($scope.newTraining.trainingMaterial));
                }
            };
            $scope.disableButton = function () {
                var res = true;
                angular.forEach($scope.trainings, function (item) {
                    if (item.isChecked) {
                        res = false;
                        return;
                    }
                });
                $scope.searchAddDisabled = res;
            };
            $scope.getDate = function (dt) {
                moment.locale(globalVariables.lang.currentUICulture);
                return moment(kendo.parseDate(dt)).isValid() ? moment(kendo.parseDate(dt)).format('L LT') : null;
            };
            $scope.projectTrainingSearchGridOptions = {
                dataBound: $scope.onUserAssignGridDataBound,

                dataSource: new kendo.data.DataSource({
                    type: "json",
                    data: $scope.trainings,
                    pageSize: 10,
                    schema: {
                        model: {
                            id: "id",
                            fields: {
                                id: { type: 'number' },
                                name: { type: 'string' },
                                description: { type: 'string' },
                                levelId: { type: 'number' }
                            }
                        }
                    }
                }),

                columnMenu: true,
                filterable: true,
                resizable: true,
                pageable: true,
                sortable: true,
                columns: [
                    {
                        field: "isChecked", title: ' ', width: "5%", template: "<input type='checkbox' ng-change='disableButton()'"
                            + " ng-model='dataItem.isChecked' />"
                    },
                    {
                        field: "name", title: $translate.instant('COMMON_NAME'), width: "10%", template: "<a href ng-click='"
                            + "editTraining(dataItem.id, trainings, $index)'>{{dataItem.name}}</a>"
                    },
                    { field: "levelId", title: $translate.instant('COMMON_LEVEL'), width: "18%", values: $scope.trainingLevels },
                    { field: "typeId", title: $translate.instant('COMMON_TYPE'), width: "18%", values: $scope.trainingTypes },
                    { field: "why", title: $translate.instant('COMMON_WHY'), width: "20%", template: "<div class='readmoreText' title='#= why #'>#= why # </div>" },
                    { field: "what", title: $translate.instant('COMMON_WHAT'), width: "20%", template: "<div class='readmoreText' title='#= what #'>#= what # </div>" },
                    { field: "how", title: $translate.instant('COMMON_HOW'), width: "20%", template: "<div class='readmoreText' title='#= how #'>#= how # </div>" },
                    //{
                    //    field: "performanceGroup", title: "Performance Group", width: "20%", hidden: true, template: "<div ng-repeat="
                    //    + "'performanceGroup in dataItem.link_PerformanceGroupSkills | uniquePerformanceGroup'> {{performanceGroup}} </div>"
                    //},
                ]
            };
            $scope.doSearch = function () {
                if ($scope.searchProjectTrainingGridInstance) {
                    $scope.searchProjectTrainingGridInstance.dataSource.filter([
                        {
                            logic: "or",
                            filters: [
                                {
                                    field: "name",
                                    operator: "contains",
                                    value: $scope.filter.searchText
                                },
                                {
                                    field: "skillName",
                                    operator: "contains",
                                    value: $scope.filter.searchText
                                }
                                ,
                                {
                                    field: "why",
                                    operator: "contains",
                                    value: $scope.filter.searchText
                                },
                                {
                                    field: "what",
                                    operator: "contains",
                                    value: $scope.filter.searchText
                                },
                                {
                                    field: "how",
                                    operator: "contains",
                                    value: $scope.filter.searchText
                                }
                            ]
                        }]);
                }
            };
            $scope.doFilter = function () {
                progressBar.startProgress();
                var query = "";

                if ($scope.filter.organizationId > 0) {
                    query += "(OrganizationId eq " + $scope.filter.organizationId + ")";

                }
                else {
                    $scope.performanceGroups = $scope.AllPerformanceGroups;
                }

                if ($scope.filter.trainingLevelId > 0) {
                    if (query) { query += "and"; }
                    query += "(LevelId eq " + $scope.filter.trainingLevelId + ")";
                }

                if ($scope.filter.isTemplate) {
                    if (query) { query += "and"; }
                    query += "(IsTemplate eq " + $scope.filter.isTemplate + ")";
                }


                if ($scope.filter.trainingTypeId > 0) {
                    if (query) { query += "and"; }
                    query += "(TypeId eq " + $scope.filter.trainingTypeId + ")";
                }

                if ($scope.filter.isShowActive != $scope.filter.isShowInactive) {
                    if ($scope.filter.isShowActive) {
                        if (query) { query += "and"; }
                        query += "(IsActive eq " + $scope.filter.isShowActive + ")";
                    }
                }

                if ($scope.filter.performanceGroupId != null) {

                    if (query) {
                        query += "and";
                    }
                    query += ""
                    var pg = _.find($scope.AllPerformanceGroups, function (item) {
                        return item.id == $scope.filter.performanceGroupId;
                    })
                    query += "(Link_PerformanceGroupSkills/any(j:j/PerformanceGroup/Name eq '" + pg.name + "'))";

                }


                if ($scope.filter.skillId > 0) {
                    if (query) {
                        query += "and";
                    }
                    query += "(Skills/any(s:s/Id eq " + $scope.filter.skillId + "))";
                }

                if ($scope.filter.industryId > 0) {
                    $scope.subIndustries = _.filter($scope.industries, function (item) {
                        return item.parentId == $scope.filter.industryId;
                    });

                }
                else {
                    $scope.subIndustries = [];
                    $scope.filter.subIndustryId = null;
                }

                if (query) { query = "&$filter=" + query; }

                if (!query) { query = ""; }
                var result = apiService.add('trainings/FilterTraining', $scope.filter).then(function (data) {
                    angular.forEach(data, function (key, value) {
                        if (key.skills.length > 0) {
                            key.skillName = key.skills[0].name;
                        }
                        else {
                            key.skillName = "";
                        }
                    });
                    $scope.trainings.splice(0, $scope.trainings.length);
                    $scope.trainings.push.apply($scope.trainings, data);
                    progressBar.stopProgress();
                });
            };
            $scope.filterOrganizationChanged = function () {
                $scope.filter.performanceGroupName = "Select Performance Group...";
                $scope.performanceGroups = _.filter($scope.AllPerformanceGroups, function (item) {
                    return item.organizationId == $scope.filter.organizationId || item.id == null;
                });
                $scope.filter.profileLevelId = null;
                $scope.filter.skillId = null;
                var filterPG = _.find($scope.performanceGroups, function (pgItem) {
                    return pgItem.id == $scope.filter.performanceGroupId
                })
                if (!(filterPG)) {
                    $scope.filter.performanceGroupId = null;
                }
                if ($scope.filter.organizationId > 0) {
                    $scope.skills = [];
                    var ipsSkillFiter = {
                        organizationId: $scope.filter.organizationId,
                        performanceGroupId: $scope.filter.performanceGroupId,
                    }
                    trainingsDiaryService.getSkillsByFilterOptions(ipsSkillFiter).then(function (data) {
                        $scope.skills = data;
                    });
                }

                $scope.filter.industryId = null;
                $scope.filter.subIndustryId = null;
                $scope.doFilter();
            }
            $scope.performanceGroupChanged = function () {
                $scope.skills = [];
                var ipsSkillFiter = {
                    organizationId: $scope.filter.organizationId,
                    performanceGroupId: $scope.filter.performanceGroupId,
                }
                trainingsDiaryService.getSkillsByFilterOptions(ipsSkillFiter).then(function (data) {
                    $scope.skills = data;
                });
                $scope.filter.skillId = 0;
                $scope.doFilter();
            }

            $scope.mainIndustryChange = function () {
                $scope.subIndustries = [];
                $scope.filter.subIndustryId = null;
                if ($scope.filter.industryId > 0) {
                    $scope.subIndustries = _.filter($scope.industries, function (item) {
                        return item.parentId == $scope.filter.industryId;
                    });
                    var dataSource = new kendo.data.DataSource({
                        data: $scope.subIndustries,
                    });
                    $scope.selectOptions = {
                        placeholder: $translate.instant('TRAININGDAIRY_SELECT_SUB_INDUSTRY'),
                        dataTextField: "name",
                        dataValueField: "id",
                        valuePrimitive: true,
                        autoBind: false,
                        dataSource: dataSource,
                        change: function (e) {
                            var value = this.value();
                            if (value.length > 0) {

                                $scope.filter.subIndustryId = value[0];
                            }
                            else {
                                $scope.filter.subIndustryId = null;
                            }
                            $scope.filter.subIndustryIds = value;
                            $scope.doFilter();
                        }
                    };
                    var projectTrainingSubIndustry = $("#projectTrainingSubIndustry").data("kendoMultiSelect");
                    if (projectTrainingSubIndustry) {
                        projectTrainingSubIndustry.destroy();
                    }
                    $("#projectTrainingSubIndustry").kendoMultiSelect($scope.selectOptions);

                }

                $scope.doFilter();
            }
            $scope.cancelSearchWindow = function () {
                $scope.openProjectTrainingPopupMode.isOpenAddExistingTrainingPopup = false;
                var dialog = $scope.projectTrainingsSearchWindow.data("kendoWindow");
                if (dialog) {
                    dialog.close();
                }
            };
            $scope.clearFilter = function () {
                $scope.filter = getCleanFilter();
                $scope.filter.searchText = "";
                $scope.doSearch();
                $scope.filterOrganizationChanged();
            };
            $scope.addSelectedTrainings = function () {
                var selectedTrainings = _.filter($scope.trainings, function (item) {
                    return item.isChecked == true;
                });
                if (selectedTrainings.length > 0) {
                    $scope.newTraining = selectedTrainings[0];
                    var notificationTemplateId = null;
                    var notificationTemplate = _.filter($scope.notificationTemplates, function (item) {
                        return item.name.indexOf("Profile Training Reminder Notification") > -1
                    });
                    if (notificationTemplate.length > 0) {
                        notificationTemplateId = notificationTemplate[0].id;
                    }
                    $scope.newTraining.notificationTemplateId = $scope.newTraining.notificationTemplateId > 0 ? $scope.newTraining.notificationTemplateId : notificationTemplateId;
                    var durationMetric = _.filter($scope.durationMetrics, function (item) {
                        return item.name.indexOf("Minute") > -1
                    })
                    var durationMetricId = null;
                    if (durationMetric.length > 0) {
                        durationMetricId = durationMetric[0].id;
                    }


                    trainingsDiaryService.getById($scope.newTraining.id).then(function (data) {
                        moment.locale(globalVariables.lang.currentUICulture);
                        var presetTraining = data;

                        $scope.newTraining.id = 0;

                        $scope.newTraining.skillId = (presetTraining.skills.length > 0 ? presetTraining.skills[0].id : null);
                        $scope.newTraining.typeId = (presetTraining.typeId != null ? presetTraining.typeId : null),
                            $scope.newTraining.levelId = (presetTraining.levelId != null ? presetTraining.levelId : null),
                            $scope.newTraining.why = (presetTraining.why != null ? presetTraining.why : null),
                            $scope.newTraining.what = (presetTraining.what != null ? presetTraining.what : null),
                            $scope.newTraining.how = (presetTraining.how != null ? presetTraining.how : null),
                            $scope.newTraining.additionalInfo = (presetTraining.additionalInfo != null ? presetTraining.additionalInfo : null),
                            $scope.newTraining.startDate = moment(new Date()).format('L LT'),

                            $scope.newTraining.duration = (presetTraining.duration != null ? presetTraining.duration : 30),
                            $scope.newTraining.durationMetricId = (presetTraining.durationMetricId != null ? presetTraining.durationMetricId : durationMetricId),
                            $scope.newTraining.frequency = (presetTraining.frequency != null ? presetTraining.frequency : "FREQ=WEEKLY;BYDAY=WE"),
                            $scope.newTraining.howMany = (presetTraining.howMany != null ? presetTraining.howMany : 1),
                            $scope.newTraining.exerciseMetricId = (presetTraining.exerciseMetricId != null ? presetTraining.exerciseMetricId : null),
                            $scope.newTraining.howManySets = (presetTraining.howManySets != null ? presetTraining.howManySets : 0),
                            $scope.newTraining.howManyActions = (presetTraining.howManyActions != null ? presetTraining.howManyActions : 1),
                            $scope.newTraining.isActive = true,
                            $scope.newTraining.organizationId = $scope.organizationId,
                            $scope.newTraining.trainingMaterial = { id: 0, name: "", description: "", title: "", materialType: "", resourceType: "" },
                            $scope.newTraining.trainingMaterials = new kendo.data.ObservableArray([]),
                            $scope.newTraining.userId = $scope.userId,
                            $scope.newTraining.skills = [],
                            $scope.newTraining.skillId = ($scope.skill == null ? null : $scope.skill.id),
                            $scope.newTraining.notificationTemplateId = (presetTraining.notificationTemplateId != null ? presetTraining.notificationTemplateId : notificationTemplateId),
                            $scope.newTraining.isNotificationByEmail = true,
                            $scope.newTraining.emailNotificationIntervalId = null,
                            $scope.newTraining.emailBefore = (presetTraining.emailBefore != null ? presetTraining.emailBefore : reminderEnum[0].value),
                            $scope.newTraining.isNotificationBySMS = (presetTraining.isNotificationBySMS != null ? presetTraining.isNotificationBySMS : false),
                            $scope.newTraining.smsNotificationIntervalId = null,


                            $scope.trainingMaterials.splice(0, $scope.trainingMaterials.length);
                        _.forEach(presetTraining.trainingMaterials, function (item) {
                            $scope.trainingMaterials.push(item);
                        })
                    })

                }
                $scope.cancelSearchWindow();
            };
            //add training type
            $scope.getTrainingTypes = function () {
                trainingsDiaryService.getTrainingTypes().then(function (data) {
                    $scope.trainingTypes = data;
                });
            }
            $scope.trainingType = "";
            $scope.addTrainingType = function () {
                $scope.trainingType = "";
                $scope.projectTrainingswinTrainingType.open().center();
            }
            $scope.cancelTrainingType = function () {
                $scope.projectTrainingswinTrainingType.close();
            }
            $scope.okTrainingType = function () {
                apiService.add("TrainingTypes", { id: 0, name: $scope.trainingType }).then(function (data) {
                    dialogService.showNotification($translate.instant('TRAININGDAIRY_TRAINING_TYPE_SUCCESSFULLY_ADDED'), "info");
                    $scope.getTrainingTypes();
                    $scope.projectTrainingswinTrainingType.close();
                }, function (message) {
                    dialogService.showNotification(message, "warning");
                });


            }
            $scope.showNotificationTemplate = function (id) {
                trainingdiaryManager.getNotificationTemplateById(id).then(function (data) {
                    $scope.templateInfo = data;
                    $("#emailBody").html("");
                    $("#emailBody").html(data.emailBody);
                    $("#notificationTemplateModal").modal("show");
                });
            }
            $scope.selectSubIndustryOptions = {
                placeholder: $translate.instant('TRAININGDAIRY_SELECT_SUB_INDUSTRY'),
                dataTextField: "name",
                dataValueField: "id",
                valuePrimitive: false,
                autoBind: false,
                dataSource: {
                    type: "json",
                    data: $scope.subIndustries,
                }
            };

            $scope.isDisabled = function () {
                return ($scope.saveMode == trainingSaveModeEnum.view);
            }
            $scope.$watch('openProjectTrainingPopupMode.isOpenNewTrainingPopup', function (newValue, oldValue) {
                $scope.newProjectTrainingWindow = $("#newProjectTrainingWindow");
                if ($scope.newProjectTrainingWindow) {

                    if ($scope.openProjectTrainingPopupMode.isOpenNewTrainingPopup) {
                        $scope.initOnPopupOpen();
                        if ($scope.saveMode == 0) {
                            $scope.newTraining = getCleanTraining();
                            $scope.trainingMaterials.splice(0, $scope.trainingMaterials.length);
                            $scope.newTraining.skillId = ($scope.skill ? $scope.skill.id : null);
                        }
                        else if ($scope.saveMode == trainingSaveModeEnum.view) {
                            if ($scope.editingTraining) {
                                $scope.newTraining = $scope.editingTraining;
                            }
                        }
                        else if ($scope.saveMode == trainingSaveModeEnum.edit) {
                            if ($scope.editingTraining) {
                                $scope.newTraining = $scope.editingTraining;
                            }
                        }

                        if (!($scope.newProjectTrainingWindow.data("kendoWindow"))) {
                            $scope.newProjectTrainingWindow.kendoWindow({
                                width: "55%",
                                height: "70%",
                                title: $translate.instant('COMMON_TRAINING_DETAIL'),
                                modal: true,
                                visible: false,
                                draggable: true,
                                close: function () { this.destroy(); },
                                actions: ['Maximize', 'Close'],
                                position: {
                                    top: 100, // or "100px"
                                }
                            });

                            $scope.projectTrainingsSearchWindow = $("#projectTrainingsSearchWindow");
                            $scope.projectTrainingsSearchWindow.kendoWindow({
                                width: "55%",
                                title: $translate.instant('TRAININGDAIRY_SEARCH_TRAININGS'),
                                modal: true,
                                visible: false,
                                close: function () {
                                    $scope.openProjectTrainingPopupMode.isOpenAddExistingTrainingPopup = false;
                                },
                                actions: ['Maximize', 'Close']
                            });

                            var dialog = $scope.newProjectTrainingWindow.data("kendoWindow");




                            dialog.open().center();
                        }
                    }
                    else {
                        $scope.openProjectTrainingPopupMode.isOpenNewTrainingPopup = false;
                        var dialog = $scope.newProjectTrainingWindow.data("kendoWindow");
                        if (dialog) {
                            $scope.projectTrainingsSearchWindow = $("#projectTrainingsSearchWindow");
                            var projectTrainingsSearchWindowDialog = $scope.projectTrainingsSearchWindow.data("kendoWindow");
                            if (projectTrainingsSearchWindowDialog) {
                                projectTrainingsSearchWindowDialog.destroy();
                            }
                            dialog.close();
                            dialog.destroy();


                        }

                    }
                }
                else {

                }
            });
            $scope.$watch('openProjectTrainingPopupMode.isOpenAddExistingTrainingPopup', function (newValue, oldValue) {
                $scope.projectTrainingsSearchWindow = $("#projectTrainingsSearchWindow");
                if ($scope.projectTrainingsSearchWindow) {
                    if ($scope.openProjectTrainingPopupMode.isOpenAddExistingTrainingPopup) {
                        $scope.newTraining = getCleanTraining();
                        if ($scope.projectTrainingsSearchWindow.data("kendoWindow")) {
                            var dialog = $scope.projectTrainingsSearchWindow.data("kendoWindow");
                            dialog.open().center();
                        }
                        else {
                            $scope.projectTrainingsSearchWindow.kendoWindow({
                                width: "55%",
                                title: $translate.instant('TRAININGDAIRY_SEARCH_TRAININGS'),
                                modal: true,
                                visible: false,
                                close: function () {
                                    $scope.openProjectTrainingPopupMode.isOpenAddExistingTrainingPopup = false;
                                },
                                actions: ['Maximize', 'Close']
                            });
                            var dialog = $scope.projectTrainingsSearchWindow.data("kendoWindow");
                            dialog.open().center();
                        }
                        //$scope.projectTrainingsSearchWindow.open().center();
                        $scope.clearFilter();
                    }
                    else {
                        $scope.openProjectTrainingPopupMode.isOpenAddExistingTrainingPopup = false;
                        var dialog = $scope.projectTrainingsSearchWindow.data("kendoWindow");
                        if (dialog) {
                            dialog.close();

                        }

                    }
                }
            });


            function getCleanTraining() {
                moment.locale(globalVariables.lang.currentUICulture);
                $scope.trainingMaterials = new kendo.data.ObservableArray([]);
                var durationMetric = _.filter($scope.durationMetrics, function (item) {
                    return item.name.indexOf("Minute") > -1
                })
                var durationMetricId = null;
                if (durationMetric.length > 0) {
                    durationMetricId = durationMetric[0].id;
                }

                var notificationTemplateId = null;
                var notificationTemplate = _.filter($scope.notificationTemplates, function (item) {
                    return item.name.indexOf("Profile Training Reminder Notification") > -1
                });
                if (notificationTemplate.length > 0) {
                    notificationTemplateId = notificationTemplate[0].id;
                }
                var presetTraining = {
                    name: 'Recurrent Training for ',
                    typeId: null,
                    levelId: null,
                    why: null,
                    what: null,
                    how: null,
                    additionalInfo: null,
                    duration: 0,
                    durationMetricId: null,
                    frequency: "FREQ=WEEKLY;BYDAY=WE",
                    howMany: 1,
                    exerciseMetricId: null,
                    howManySets: 1,
                    howManyActions: 1,
                    isActive: true,
                    organizationId: $scope.organizationId,
                    trainingMaterial: { id: 0, name: "", description: "", title: "", materialType: "", resourceType: "" },
                    trainingMaterials: new kendo.data.ObservableArray([]),
                    userId: $scope.userId,
                    skills: [],
                    skillId: ($scope.skill == null ? null : $scope.skill.id),
                    notificationTemplateId: null,
                    isNotificationByEmail: true,
                    emailNotificationIntervalId: null,
                    emailBefore: reminderEnum[0].value,
                    isNotificationBySMS: false,
                    smsNotificationIntervalId: null,
                };
                if ($scope.evaluationAgreement) {
                    if ($scope.evaluationAgreement.trainings) {
                        var presetTraining = $scope.evaluationAgreement.trainings.filter(function (item) {
                            return item.id > 0
                        })
                        if (presetTraining.length > 0) {
                            presetTraining = presetTraining[0];
                            _.forEach(presetTraining.trainingMaterials, function (tm, i) {
                                tm.id = (i + 1) * -1;
                                $scope.trainingMaterials.push(tm);
                            });
                            var kendoGrid = $("#projectTrainingMaterialsGrid").data("kendoGrid")
                            if (kendoGrid) {
                                kendoGrid.setOptions($scope.getOptions());
                            }
                        }
                    }
                }
                return {
                    id: 0,
                    name: ($scope.skill == null ? "Recurrent Training" : "Recurrent Training for " + $scope.skill.name),
                    typeId: (presetTraining.typeId != null ? presetTraining.typeId : null),
                    levelId: (presetTraining.levelId != null ? presetTraining.levelId : null),
                    why: (presetTraining.why != null ? presetTraining.why : null),
                    what: (presetTraining.what != null ? presetTraining.what : null),
                    how: (presetTraining.how != null ? presetTraining.how : null),
                    additionalInfo: (presetTraining.additionalInfo != null ? presetTraining.additionalInfo : null),
                    startDate: moment(new Date()).format('L LT'),
                    endDate: moment(kendo.parseDate($scope.stage.endDate)).format('L LT'),
                    duration: (presetTraining.duration != null ? presetTraining.duration : 30),
                    durationMetricId: (presetTraining.durationMetricId != null ? presetTraining.durationMetricId : durationMetricId),
                    frequency: (presetTraining.frequency != null ? presetTraining.frequency : "FREQ=WEEKLY;BYDAY=WE"),
                    howMany: (presetTraining.howMany != null ? presetTraining.howMany : 1),
                    exerciseMetricId: (presetTraining.exerciseMetricId != null ? presetTraining.exerciseMetricId : null),
                    howManySets: (presetTraining.howManySets != null ? presetTraining.howManySets : 0),
                    howManyActions: (presetTraining.howManyActions != null ? presetTraining.howManyActions : 1),
                    isActive: true,
                    organizationId: $scope.organizationId,
                    trainingMaterial: { id: 0, name: "", description: "", title: "", materialType: "", resourceType: "" },
                    trainingMaterials: new kendo.data.ObservableArray([]),
                    userId: $scope.userId,
                    skills: [],
                    skillId: ($scope.skill == null ? null : $scope.skill.id),
                    notificationTemplateId: (presetTraining.notificationTemplateId != null ? presetTraining.notificationTemplateId : notificationTemplateId),
                    isNotificationByEmail: true,
                    emailNotificationIntervalId: null,
                    emailBefore: (presetTraining.emailBefore != null ? presetTraining.emailBefore : reminderEnum[0].value),
                    isNotificationBySMS: (presetTraining.isNotificationBySMS != null ? presetTraining.isNotificationBySMS : false),
                    smsNotificationIntervalId: null,
                }
            }
            function getCleanFilter() {
                return {
                    organizationId: ($scope.organizationId ? parseInt($scope.organizationId) : null),
                    performanceGroupName: 'Select Performance Group...',
                    performanceGroupId: null,
                    trainingLevelId: null,
                    trainingTypeId: null,
                    isShowActive: true,
                    isShowInactive: false,
                    isTemplate: false,
                    searchText: "",
                    profileLevelId: null,
                    jobPositionId: null,
                    industryId: null,
                    subIndustryIds: [],
                    skillId: null
                };
            }
            function getTrainingMaterials(trainingMaterials) {
                $scope.trainingMaterials.splice(0, $scope.trainingMaterials.length);
                angular.forEach(trainingMaterials, function (item, index) {
                    $scope.trainingMaterials.push(item);
                });
            }
            function submit(evaluationAgreements, isRestartPhase) {
                finalKPIService.updateFinalKPI(evaluationAgreements).then(function () {
                    dialogService.showNotification($translate.instant('TRAININGDAIRY_KPI_TRAINING_ADDED_SUCCESSFULLY'), "info");
                },
                    function (data) {
                        dialogService.showNotification($translate.instant('TRAININGDAIRY_KPI_TRAINING_SUBMIT_FAILED'), "warning");
                    })
            }
        }])