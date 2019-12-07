angular.module('ips.trainingdiary')
    .directive('ownTrainingPopup', [function () {
        return {
            restrict: 'E',
            templateUrl: 'views/trainingDiary/directives/ownTrainingPopup.html',
            scope: {
                organizationId: '=?',
                userId: '=',
                saveMode: '=',
                openTrainingPopupMode: '=',
                editingTraining: '=?',
                skill: '=?',
                evaluationAgreement: '=?',
                skills: '=?',
                notificationTemplates: '=?'
            },
            controller: 'ownTrainingPopupCtrl'
        };
    }])
    .controller('ownTrainingPopupCtrl', ['$scope', 'trainingsDiaryService', 'dialogService', 'apiService', 'Upload', 'trainingSaveModeEnum', 'finalKPIService', 'trainingdiaryManager', 'reminderEnum', 'progressBar', '$translate', 'globalVariables',
        function ($scope, trainingsDiaryService, dialogService, apiService, Upload, trainingSaveModeEnum, finalKPIService, trainingdiaryManager, reminderEnum, progressBar, $translate, globalVariables) {
            $scope.winOwnTrainingMaterial;
            $scope.newOwnTrainingWindow;
            $scope.ownTrainingsSearchWindow;
            $scope.ownTrainingSearchGridInstance;
            $scope.templateInfo;
            $scope.reminders = [
                { value: -1440, text: $translate.instant('COMMON_BEFORE_1_DAY') },
                { value: -60, text: $translate.instant('COMMON_BEFORE_1_HOUR') },
                { value: -30, text: $translate.instant('COMMON_BEFORE_30_MIN') },
                { value: -15, text: $translate.instant('COMMON_BEFORE_15_MIN') },
                { value: -5, text: $translate.instant('COMMON_BEFORE_5_MIN') }];
            moment.locale(globalVariables.lang.currentUICulture);
            $scope.newTraining = {
                name: $translate.instant('TRAININGDAIRY_OWN_TRAINING_POPUP_NEW_TRAINING'),
                typeId: null,
                levelId: null,
                why: '',
                what: '',
                how: '',
                additionalInfo: '',
                startDate: moment(new Date()).format('L LT'),
                endDate: '',
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
                skillId: null,
                notificationTemplateId: null,
                isNotificationByEmail: true,
                emailNotificationIntervalId: null,
                emailBefore: reminderEnum[0].value,
                isNotificationBySMS: false,
                smsNotificationIntervalId: null,
            }
            $scope.trainings = new kendo.data.ObservableArray([]);
            $scope.allTrainings = new kendo.data.ObservableArray([]);
            $scope.searchAddDisabled = true;
            $scope.currentTrainingIndex = -1;
            $scope.filter;
            $scope.performanceGroups = [];
            $scope.organizations;
            $scope.trainingTypes;
            $scope.trainingLevels;
            $scope.durationMetrics;
            $scope.exerciseMetrics;
            $scope.subIndustries = [];
            $scope.ownTrainingMaterials = new kendo.data.ObservableArray([]);
            $scope.isEditTM = false;
            $scope.trainingSaveModeEnum = trainingSaveModeEnum;
            $scope.ratings = [
                { value: 1, background: "#f00" },
                { value: 2, background: "#ff0" },
                { value: 3, background: "#0f3" },
                { value: 4, background: "#06f" },
                { value: 5, background: "#f99" },
            ];
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
                $scope.openTrainingPopupMode.isOpenAddExistingTrainingPopup = true;
            };
            $scope.startDateOpen = function (event) {
                moment.locale(globalVariables.lang.currentUICulture);
                var datepicker = $(event.sender.element).data("kendoDateTimePicker");
                $scope.newTraining.startDate = moment(new Date()).format('L LT');
                datepicker.setOptions({
                    min: kendo.parseDate($scope.newTraining.startDate)
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
                    min: kendo.parseDate($scope.newTraining.startDate)
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
                $scope.ownTrainingsearchGridOptions = {
                    dataBound: $scope.onUserAssignGridDataBound,

                    dataSource: new kendo.data.DataSource({
                        type: "json",
                        data: $scope.allTrainings,
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
                        { field: "how", title: $translate.instant('COMMON_HOW'), width: "20%", template: "<div class='readmoreText' title='#= how #'>#= how # </div>" }
                    ]
                };

                $(".mytooltip").kendoTooltip({
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
            $scope.$on("kendoRendered", function (event) {
                if (event.targetScope.winOwnTrainingMaterial) {
                    $scope.winOwnTrainingMaterial = event.targetScope.winOwnTrainingMaterial;
                }
                if (event.targetScope.newOwnTrainingWindow) {
                    $scope.newOwnTrainingWindow = event.targetScope.newOwnTrainingWindow;
                }
                if (event.targetScope.ownTrainingsSearchWindow) {
                    $scope.ownTrainingsSearchWindow = event.targetScope.ownTrainingsSearchWindow;
                }
                if (event.targetScope.ownTrainingSearchTrainingsGrid) {
                    $scope.ownTrainingSearchGridInstance = event.targetScope.ownTrainingSearchTrainingsGrid;
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
                $scope.newTraining.trainingMaterial = angular.copy($scope.private.getById(id, $scope.ownTrainingMaterials));
                $scope.winOwnTrainingMaterial.open().center();
                $scope.isEditTM = true;
            };
            $scope.remove = function (id) {
                var index = _.findIndex($scope.ownTrainingMaterials, function (tr) { return tr.id == id; });
                $scope.ownTrainingMaterials.splice(index, 1);
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
            $scope.getOwnTrainingGridOptions = function () {

                return {
                    dataBound: $scope.onUserAssignGridDataBound,
                    dataSource: new kendo.data.DataSource({
                        type: "json",
                        data: $scope.ownTrainingMaterials,
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
                    columnMenu: true,
                    filterable: true,
                    pageable: true,
                    columns: [
                        {
                            field: "title", title: $translate.instant('COMMON_TITLE'), width: "25%", template: function (dataItem) {
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
                        { field: "materialType", title: $translate.instant('COMMON_MATERIAL_TYPE'), width: "15%" },
                        { field: "description", title: $translate.instant('COMMON_DESCRIPTION'), width: "30%", template: "<div class='readmoreText' title='#= description #'>#= description # </div>" },
                        {
                            field: "link", title: $translate.instant('COMMON_URL'), width: "30%", template: function (dataItem) {
                                if (dataItem.link) {
                                    return "<div><a class='' ng-click='openLink(\"" + dataItem.link + "\");'>" + dataItem.link + "</a></div>";
                                }
                                else {
                                    return "Not Available";
                                }
                            }
                        },
                        {
                            field: "actions", title: $translate.instant('COMMON_ACTIONS'), width: "15%", filterable: false,
                            template: function (dataItem) {
                                return "<div class='icon-groups'>"
                                    + "<a class='icon-groups icon-groups-item edit-icon' ng-click='editTrainingMaterial(" + dataItem.id + ");'></a>"
                                    + "<a class='icon-groups icon-groups-item delete-icon' ng-click='remove(" + dataItem.id + ");'></a>"
                                    + "</div>";
                            }
                        }
                    ]
                };

            };
            $scope.addTrainingMaterial = function () {
                $scope.newTraining.trainingMaterial = { name: "", description: "", title: "", materialType: "", resourceType: "" };
                $scope.newTraining.trainingMaterial.id = ($scope.ownTrainingMaterials.length + 1) * -1;

                $scope.winOwnTrainingMaterial.open().center();
                $scope.isEditTM = false;
            };
            $scope.closeNewTraining = function () {
                $scope.openTrainingPopupMode.isOpenNewTrainingPopup = false;
            }
            $scope.saveChangesForTraining = function () {
                $scope.newTraining.trainingMaterials = angular.copy($scope.ownTrainingMaterials);
                $scope.ownTrainingMaterials.splice(0, $scope.ownTrainingMaterials.length);
                $scope.newTraining.id = 0;
                $scope.saveTraining();
            }
            $scope.saveTraining = function () {
                var item = _.clone($scope.newTraining);
                item.userId = $scope.userId;
                item.startDate = kendo.parseDate(item.startDate);
                item.endDate = kendo.parseDate(item.endDate);
                if (item.id > 0) {
                    apiService.update("trainings", item).then(function (data) {
                        if (data) {
                            $scope.newTraining = data;
                            dialogService.showNotification($translate.instant('TRAININGDAIRY_TRAINING_SAVED_SUCCESSFULLY'), 'info');
                            $scope.openTrainingPopupMode.isOpenNewTrainingPopup = false;
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
                            $scope.openTrainingPopupMode.isOpenNewTrainingPopup = false;
                            if ($scope.evaluationAgreement) {
                                $scope.evaluationAgreement.trainings.push(data);
                                submit([$scope.evaluationAgreement]);
                            }
                        }
                        else {
                            dialogService.showNotification($translate.instant('TRAININGDAIRY_SAVE_FAILED'), 'warning');
                        }
                    }, function (error) {
                        dialogService.showNotification(error, "warning");
                    });
                }
            }

            $scope.saveSameTraining = function () {
                $scope.newTraining.trainingMaterials = angular.copy($scope.ownTrainingMaterials);
                $scope.ownTrainingMaterials.splice(0, $scope.ownTrainingMaterials.length);
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
                $scope.winOwnTrainingMaterial.close();
            };
            $scope.okTrainingMaterial = function () {
                if (($scope.newTraining.trainingMaterial.materialType) && ($scope.newTraining.trainingMaterial.materialType.name)) {
                    $scope.newTraining.trainingMaterial.materialType = $scope.newTraining.trainingMaterial.materialType.name;
                }
                else {
                    $scope.newTraining.trainingMaterial.materialType = "";
                }
                $scope.winOwnTrainingMaterial.close();
                if ($scope.isEditTM) {
                    var item = $scope.private.getById($scope.newTraining.trainingMaterial.id, $scope.ownTrainingMaterials);
                    var index = $scope.ownTrainingMaterials.indexOf(item);
                    $scope.ownTrainingMaterials.splice(index, 1, $scope.newTraining.trainingMaterial);
                } else {
                    $scope.ownTrainingMaterials.push(angular.copy($scope.newTraining.trainingMaterial));
                }
            };
            $scope.disableButton = function () {
                var res = true;
                angular.forEach($scope.allTrainings, function (item) {
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

            $scope.doSearch = function () {

                if ($scope.ownTrainingSearchGridInstance) {

                    $scope.ownTrainingSearchGridInstance.dataSource.filter([
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
                    var pg = _.find($scope.performanceGroups, function (item) {
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
                    if ($scope.allTrainings) {
                        $scope.allTrainings.splice(0, $scope.allTrainings.length);
                        $scope.allTrainings.push.apply($scope.allTrainings, data);
                    }
                    progressBar.stopProgress();
                });

            };
            $scope.filterOrganizationChanged = function () {
                $scope.filter.performanceGroupName = "Select Performance Group...";
                $scope.performanceGroups = _.filter($scope.AllPerformanceGroups, function (item) {
                    return item.organizationId == $scope.filter.organizationId || item.id == null;
                });
                var filterPG = _.find($scope.performanceGroups, function (pgItem) {
                    return pgItem.id == $scope.filter.performanceGroupId
                })
                if (!(filterPG)) {
                    $scope.filter.performanceGroupId = null;
                }
                //$scope.filter.performanceGroupId = null;
                $scope.filter.skillId = null;
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
                    var x = $("#ownSubIndustry").data("kendoMultiSelect");
                    if (x) {
                        x.destroy();
                    }
                    $("#ownSubIndustry").kendoMultiSelect($scope.selectOptions);
                }
                $scope.doFilter();
            }
            $scope.cancelSearchWindow = function () {
                $scope.openTrainingPopupMode.isOpenAddExistingTrainingPopup = false;
            };
            $scope.clearFilter = function () {
                $scope.filter = getCleanFilter();
                $scope.filter.searchText = "";
                $scope.doSearch();
                $scope.filterOrganizationChanged();
            };
            $scope.addSelectedTrainings = function () {

                var selectedTrainings = _.filter($scope.allTrainings, function (item) {
                    return item.isChecked == true;
                })

                if (selectedTrainings.length > 0) {
                    var notificationTemplateId = null;
                    var notificationTemplate = _.filter($scope.notificationTemplates, function (item) {
                        return item.name.indexOf("Personal Training Reminder Notification") > -1
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
                    $scope.newTraining = selectedTrainings[0];
                    trainingsDiaryService.getById($scope.newTraining.id).then(function (data) {
                        if (data) {
                            moment.locale(globalVariables.lang.currentUICulture);
                            $scope.newTraining.id = 0;
                            var presetTraining = data;
                            $scope.newTraining.skillId = (presetTraining.skills.length > 0 ? (presetTraining.skills[0].id).toString() : null);
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


                                $scope.ownTrainingMaterials.splice(0, $scope.ownTrainingMaterials.length);
                            _.forEach(presetTraining.trainingMaterials, function (item) {
                                $scope.ownTrainingMaterials.push(item);
                            });
                        }
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
                $scope.winTrainingType.open().center();
            }
            $scope.cancelTrainingType = function () {
                $scope.winTrainingType.close();
            }
            $scope.okTrainingType = function () {
                apiService.add("TrainingTypes", { id: 0, name: $scope.trainingType }).then(function (data) {
                    dialogService.showNotification($translate.instant('TRAININGDAIRY_TRAINING_TYPE_SUCCESSFULLY_ADDED'), "info");
                    $scope.getTrainingTypes();
                    $scope.winTrainingType.close();
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
            $scope.$watch('openTrainingPopupMode.isOpenNewTrainingPopup', function (newValue, oldValue) {
                if ($scope.newOwnTrainingWindow) {
                    if ($scope.openTrainingPopupMode.isOpenNewTrainingPopup) {
                        $scope.initOnPopupOpen();
                        if ($scope.saveMode == 0 || $scope.saveMode == 3) {
                            $scope.newTraining = getCleanTraining();
                            $scope.ownTrainingMaterials.splice(0, $scope.ownTrainingMaterials.length);
                            $("#ownTrainigMaterial").html("");
                            $("#ownTrainigMaterial").kendoGrid({
                                dataBound: $scope.onUserAssignGridDataBound,
                                dataSource: {
                                    type: "json",
                                    data: $scope.ownTrainingMaterials,
                                    pageSize: 10,
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
                                },
                                columnMenu: true,
                                filterable: true,
                                pageable: true,
                                columns: [
                                    {
                                        field: "title", title: $translate.instant('COMMON_TITLE'), width: "25%", template: function (dataItem) {
                                            if (dataItem.name) {
                                                return "<div><a class='' ng-click='downloadTrainingMaterial(\"" + webConfig.trainingMaterialsController + dataItem.name + "\", \"" + dataItem.title + "\");'>" + dataItem.title + "</a></div>";
                                            } else if (dataItem.link) {
                                                return "<div><a class='' ng-click='openLink(\"" + dataItem.link + "\");'>" + dataItem.title + "</a></div>";
                                            } else {
                                                return "<div>" + dataItem.title + "</div>";
                                            }


                                        },
                                    },
                                    { field: "materialType", title: $translate.instant('COMMON_MATERIAL_TYPE'), width: "15%" },
                                    { field: "description", title: $translate.instant('COMMON_DESCRIPTION'), width: "30%", template: "<div class='readmoreText' title='#= description #'>#= description # </div>" },
                                    {
                                        field: "link", title: $translate.instant('COMMON_URL'), width: "30%", template: function (dataItem) {
                                            if (dataItem.link) {
                                                return "<div><a class='' ng-click='openLink(\"" + dataItem.link + "\");'>" + dataItem.link + "</a></div>";
                                            }
                                            else {
                                                return "Not Available";
                                            }
                                        }
                                    },
                                ],
                            });
                            $("#ownTrainigMaterial").kendoTooltip({
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
                        else if ($scope.saveMode == trainingSaveModeEnum.edit) {
                            $scope.newTraining = $scope.editingTraining;
                        }
                        else if ($scope.saveMode == trainingSaveModeEnum.view) {
                            $scope.newTraining = $scope.editingTraining;
                        }
                        else if ($scope.editingTrainingIndex >= 0) {

                        }
                        $scope.newOwnTrainingWindow.open().center();
                    }
                    else {
                        $scope.openTrainingPopupMode.isOpenNewTrainingPopup = false;
                        $scope.newOwnTrainingWindow.close();

                    }
                }
            });
            $scope.$watch('openTrainingPopupMode.isOpenAddExistingTrainingPopup', function (newValue, oldValue) {
                if ($scope.ownTrainingsSearchWindow) {
                    if ($scope.openTrainingPopupMode.isOpenAddExistingTrainingPopup) {
                        $scope.ownTrainingsSearchWindow.open().center();
                        $scope.clearFilter();
                    }
                    else {
                        $scope.openTrainingPopupMode.isOpenAddExistingTrainingPopup = false;
                        $scope.ownTrainingsSearchWindow.close();

                    }
                }
            });

            function submit(evaluationAgreements, isRestartPhase) {
                {
                    finalKPIService.updateFinalKPI(evaluationAgreements).then(function () {
                        dialogService.showNotification($translate.instant('TRAININGDAIRY_KPI_TRAINING_ADDED_SUCCESSFULLY'), "info");
                    },
                        function (data) {
                            dialogService.showNotification($translate.instant('TRAININGDAIRY_KPI_TRAINING_SUBMIT_FAILED'), "warning");
                        })
                }
            }
            function getCleanTraining() {
                moment.locale(globalVariables.lang.currentUICulture);
                var notificationTemplateId = null;
                var notificationTemplate = _.filter($scope.notificationTemplates, function (item) {
                    return item.name.indexOf("Personal Training Reminder Notification") > -1
                });
                if (notificationTemplate.length > 0) {
                    notificationTemplateId = notificationTemplate[0].id;
                }
                var durationMetric = _.filter($scope.durationMetrics, function (item) {
                    return item.name.indexOf("Minute") > -1
                })
                var durationMetricId = null;
                if (durationMetric.length > 0) {
                    durationMetricId = durationMetric[0].id;
                }
                return {
                    name: 'New Training',
                    typeId: null,
                    levelId: null,
                    why: '',
                    what: '',
                    how: '',
                    additionalInfo: '',
                    startDate: moment(new Date()).format('L LT'),
                    endDate: '',
                    duration: 30,
                    durationMetricId: durationMetricId,
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
                    skillId: null,
                    notificationTemplateId: notificationTemplateId,
                    isNotificationByEmail: true,
                    emailNotificationIntervalId: null,
                    emailBefore: reminderEnum[0].value,
                    isNotificationBySMS: false,
                    smsNotificationIntervalId: null,
                };
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
                $scope.ownTrainingMaterials.splice(0, $scope.ownTrainingMaterials.length);
                angular.forEach(trainingMaterials, function (item, index) {
                    $scope.ownTrainingMaterials.push(item);
                });
            }
        }])