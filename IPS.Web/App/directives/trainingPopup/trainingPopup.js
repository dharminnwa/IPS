'use strict';

angular
    .module('ips')

    .controller('trainingPopupCtrl', ['$scope', 'trainingsService', 'dialogService', 'apiService', 'Upload', 'trainingSaveModeEnum', 'todosManager', 'reminderEnum', '$translate','globalVariables',
        function ($scope, trainingsService, dialogService, apiService, Upload, trainingSaveModeEnum, todosManager, reminderEnum, $translate, globalVariables) {
            $scope.winTrainingMaterial;
            $scope.newTrainingWindow;
            $scope.trainingsSearchWindow;
            $scope.searchGridInstance;
            $scope.trainings = new kendo.data.ObservableArray([]);
            $scope.searchAddDisabled = true;
            $scope.currentTrainingIndex = -1;
            $scope.filter;
            $scope.performanceGroups = [];
            $scope.organizations
            $scope.trainingTypes;
            $scope.trainingLevels;
            $scope.durationMetrics;
            $scope.exerciseMetrics;
            $scope.trainingMaterials = new kendo.data.ObservableArray([]);
            $scope.isEditTM = false;
            $scope.newTraining;
            $scope.reminders = [
                { value: -1440, text: $translate.instant('COMMON_BEFORE_1_DAY') },
                { value: -60, text: $translate.instant('COMMON_BEFORE_1_HOUR') },
                { value: -30, text: $translate.instant('COMMON_BEFORE_30_MIN') },
                { value: -15, text: $translate.instant('COMMON_BEFORE_15_MIN') },
                { value: -5, text: $translate.instant('COMMON_BEFORE_5_MIN') }];
            $scope.trainingSaveModeEnum = trainingSaveModeEnum;
            moment.locale(globalVariables.lang.currentUICulture);

            function getCleanTraining() {
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
                var presetTraining = [];
                if ($scope.$parent.scorecardAnswer.agreement.trainings) {
                    presetTraining = $scope.$parent.scorecardAnswer.agreement.trainings.filter(function (item) {
                        return item.id > 0
                    });
                    if (presetTraining.length > 0) {
                        presetTraining = presetTraining[0];
                        _.forEach(presetTraining.trainingMaterials, function (tm, i) {
                            tm.id = (i + 1) * -1;
                            $scope.trainingMaterials.push(tm);
                        });
                        var kendoGrid = $("#trainingMaterialGrid").data("kendoGrid");
                        if (kendoGrid) {
                            kendoGrid.setOptions($scope.getOptions());
                        }
                    }
                }
                return {
                    name: ($scope.scorecardAnswer.skill == null ? "Recurrent Training" : "Recurrent Training for " + $scope.scorecardAnswer.skill.name),
                    typeId: ($scope.scorecardAnswer.trainings.length > 0 ? $scope.scorecardAnswer.trainings[0].typeId : null),
                    levelId: ($scope.scorecardAnswer.trainings.length > 0 ? $scope.scorecardAnswer.trainings[0].levelId : null),
                    why: (presetTraining.why != null ? presetTraining.why : null),
                    what: (presetTraining.what != null ? presetTraining.what : null),
                    how: (presetTraining.how != null ? presetTraining.how : null),
                    additionalInfo: (presetTraining.additionalInfo != null ? presetTraining.additionalInfo : null),
                    startDate: moment(new Date()).format('L LT'),
                    endDate: moment(new Date()).format('L LT'),
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
                    evaluatorFeedbackRecurrence: null,
                };
            }

            function getCleanFilter() {
                return {
                    organizationId: null,
                    performanceGroupName: 'Select Performance Group...',
                    trainingLevelId: null,
                    trainingTypeId: null,
                    isShowActive: true,
                    isShowInactive: false,
                    isTemplate: false,
                    searchText: "",
                    profileLevelId: null,
                    jobPositionId: null,
                    industryId: null,
                    subIndustryId: null
                };
            }

            function getTrainingMaterials(trainingMaterials) {
                $scope.trainingMaterials.splice(0, $scope.trainingMaterials.length);
                angular.forEach(trainingMaterials, function (item, index) {
                    $scope.trainingMaterials.push(item);
                });
            }

            $scope.init = function () {      }

            $scope.$on("kendoRendered", function (event) {
                if (event.targetScope.winTrainingMaterial) {
                    $scope.winTrainingMaterial = event.targetScope.winTrainingMaterial;
                }
                if (event.targetScope.newTrainingWindow) {
                    $scope.newTrainingWindow = event.targetScope.newTrainingWindow;
                }
                if (event.targetScope.trainingsSearchWindow) {
                    $scope.trainingsSearchWindow = event.targetScope.trainingsSearchWindow;
                }
                if (event.targetScope.searchTrainingsGrid) {
                    $scope.searchGridInstance = event.targetScope.searchTrainingsGrid;
                }
            });

            $scope.addWhyReasons = function () {
                var skillId = $scope.scorecardAnswer.skill.id;
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

            $scope.addWhatReasons = function () {
                var skillId = $scope.scorecardAnswer.skill.id;
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

            $scope.addHowReasons = function () {
                var skillId = $scope.scorecardAnswer.skill.id;
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
                $scope.winTrainingMaterial.open().center();
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
                    columnMenu: true,
                    filterable: true,
                    pageable: true,
                    columns: [
                        {
                            field: "title", title: $translate.instant('COMMON_TITLE'), width: "45%", template: function (dataItem) {
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
                        { field: "materialType", title: $translate.instant('COMMON_MATERIAL_TYPE'), width: "30%" },
                        { field: "description", title: $translate.instant('COMMON_DESCRIPTION'), width: "30%", template: "<div class='readmoreText' title='#= description #'>#= description # </div>" },
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

            $scope.tooltipOptions = $(".training-material-grid").kendoTooltip({
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

            $scope.addTrainingMaterial = function () {
                $scope.newTraining.trainingMaterial = { name: "", description: "", title: "", materialType: "", resourceType: "" };
                $scope.newTraining.trainingMaterial.id = ($scope.trainingMaterials.length + 1) * -1;

                $scope.winTrainingMaterial.open().center();
                $scope.isEditTM = false;
            };

            $scope.closeNewTraining = function () {
                $scope.openTrainingPopupMode.isOpenNewTrainingPopup = false;
            }

            $scope.saveChangesForTraining = function () {
                $scope.newTraining.trainingMaterials = angular.copy($scope.trainingMaterials);
                $scope.trainingMaterials.splice(0, $scope.trainingMaterials.length);
                $scope.newTraining.id = 0;
                $scope.saveTraining();
            }

            $scope.saveTraining = function () {
                var item = _.clone($scope.newTraining);
                var skill = $scope.scorecardAnswer.skill;
                var skills = $scope.scorecardAnswer.skills;
                item.startDate = kendo.parseDate(item.startDate);
                item.endDate = kendo.parseDate(item.endDate);
                if (item.id > 0) {
                    if (skill) {
                        if (skill.skill1) {
                            item.skills = [skill.skill1];
                            item.skill = skill.skill1;
                            item.skillId = skill.skill1.id;
                            item.skillName = skill.skill1.name;
                        } else if (skill.subSkill) {
                            item.skills = [skill.subSkill];
                            item.skill = skill.subSkill;
                            item.skillId = skill.subSkill.id;
                            item.skillName = skill.subSkill.name;
                        } else {
                            item.skills = [skill];
                            item.skill = skill;
                            item.skillId = skill.id;
                            item.skillName = skill.name;
                        }
                    }
                    else if (skills) {
                        item.skills = skills;
                    }
                    apiService.update("trainings", item).then(function (data) {
                        if (data) {
                            $scope.newTraining = data;
                            $scope.newTraining.startDate = moment(kendo.parseDate($scope.newTraining.startDate)).format("L LT");
                            $scope.newTraining.endDate = moment(kendo.parseDate($scope.newTraining.endDate)).format("L LT");
                            dialogService.showNotification($translate.instant('MYPROFILES_TRAINING_SAVED_SUCCESSFULLY'), 'info');
                            $scope.$parent.$parent.scorecardAnswer.agreement.trainings.splice($scope.currentTrainingIndex, 1, $scope.newTraining);
                            $scope.openTrainingPopupMode.isOpenNewTrainingPopup = false;
                        }
                        else {
                            dialogService.showNotification($translate.instant('MYPROFILES_SAVE_FAILED'), 'warning');
                        }

                    }, function (error) {
                        dialogService.showNotification(error, "warning");
                    });
                }
                else {
                    if (skill) {
                        if (skill.skill1) {
                            item.skills = [skill.skill1];
                            item.skill = skill.skill1;
                            item.skillId = skill.skill1.id;
                            item.skillName = skill.skill1.name;
                        } else if (skill.subSkill) {
                            item.skills = [skill.subSkill];
                            item.skill = skill.subSkill;
                            item.skillId = skill.subSkill.id;
                            item.skillName = skill.subSkill.name;
                        } else {
                            item.skills = [skill];
                            item.skill = skill;
                            item.skillId = skill.id;
                            item.skillName = skill.name;
                        }
                    }
                    else if (skills) {
                        item.skills = skills;
                    }
                    apiService.add("trainings", item).then(function (data) {
                        $scope.newTraining = data;
                        $scope.newTraining.startDate = moment(kendo.parseDate($scope.newTraining.startDate)).format("L LT");
                        $scope.newTraining.endDate = moment(kendo.parseDate($scope.newTraining.endDate)).format("L LT");
                        $scope.newTraining.pgSkillId = null;

                        if ($scope.newTraining.id > 0) {
                            dialogService.showNotification($translate.instant('MYPROFILES_TRAINING_SAVED_SUCCESSFULLY'), 'info');
                            if (!$scope.$parent.$parent.scorecardAnswer.agreement) {
                                $scope.$parent.$parent.scorecardAnswer.agreement = {
                                    trainings: []
                                }
                            }
                            if ($scope.$parent.$parent.scorecardAnswer.agreement && !$scope.$parent.$parent.scorecardAnswer.agreement.trainings) {
                                $scope.$parent.$parent.scorecardAnswer.agreement['trainings'] = [];
                            }

                            $scope.$parent.$parent.scorecardAnswer.agreement.trainings.push($scope.newTraining);
                            $scope.openTrainingPopupMode.isOpenNewTrainingPopup = false;

                        } else {
                            dialogService.showNotification($translate.instant('MYPROFILES_SAVE_FAILED'), 'warning');
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
                            console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));
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
                $scope.winTrainingMaterial.close();
            };

            $scope.okTrainingMaterial = function () {
                if (($scope.newTraining.trainingMaterial.materialType) && ($scope.newTraining.trainingMaterial.materialType.name)) {
                    $scope.newTraining.trainingMaterial.materialType = $scope.newTraining.trainingMaterial.materialType.name;
                }
                else {
                    $scope.newTraining.trainingMaterial.materialType = "";
                }
                $scope.winTrainingMaterial.close();
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
                return moment(kendo.parseDate(dt)).isValid() ? moment(kendo.parseDate(dt)).format('L LT') : null;
            };

            $scope.editTraining = function (trainingId, trainings, index) {
                $scope.currentTrainingIndex = index;
                if ($scope.editingTraining) {
                    $scope.newTraining = $scope.editingTraining;
                    $scope.skills = $scope.editingTraining.skills;
                }
                else {
                    $scope.newTraining = angular.copy($scope.private.getById(trainingId, trainings));
                }
                $scope.newTraining.startDate = $scope.getDate($scope.newTraining.startDate);
                $scope.newTraining.endDate = $scope.getDate($scope.newTraining.endDate);

                if ($scope.newTraining && $scope.newTraining.trainingMaterials && $scope.newTraining.trainingMaterials.length > 0) {
                    getTrainingMaterials($scope.newTraining.trainingMaterials);
                }
                $scope.isEditTM = true;
                $scope.openTrainingPopupMode.isOpenNewTrainingPopup = true;
            };

            $scope.searchGridOptions = {
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
                    { field: "why", title: $translate.instant('COMMON_WHY'), width: "20%", class: "table-cell" },
                    { field: "what", title: $translate.instant('COMMON_WHAT'), width: "20%", class: "table-cell" },
                    { field: "how", title: $translate.instant('COMMON_HOW'), width: "20%", class: "table-cell" },
                    {
                        field: "performanceGroup", title: $translate.instant('COMMON_PERFORMANCE_GROUP'), width: "20%", hidden: true, template: "<div ng-repeat="
                            + "'performanceGroup in dataItem.link_PerformanceGroupSkills | uniquePerformanceGroup'> {{performanceGroup}} </div>"
                    },
                ]
            };

            $scope.tooltipOptions = $(".searchTrainingGrid").kendoTooltip({
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

            $scope.doSearch = function () {
                $scope.searchGridInstance.dataSource.filter([
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
            };

            $scope.doFilter = function () {
                var query = "";
                if ($scope.filter.organizationId > 0) {
                    query += "(OrganizationId eq " + $scope.filter.organizationId + ")";
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
                if ($scope.scorecardAnswer.skill) {
                    if (query) { query += "and"; }
                    query += "(Skills/any(s:s/Id eq " + $scope.scorecardAnswer.skill.id + "))";
                    $scope.filter.skillId = $scope.scorecardAnswer.skill.id;
                }
                else if ($scope.scorecardAnswer.skills) {
                    _.forEach($scope.scorecardAnswer.skills, function (s) {
                        if (query) { query += "and"; }
                        query += "(Skills/any(s:s/Id eq " + s.id + "))";
                    });
                }
                if ($scope.filter.performanceGroupName != 'Select Performance Group...') {
                    if (query) { query += "and"; }
                    query += "(Link_PerformanceGroupSkills/any(j:j/PerformanceGroup/Name eq '" + $scope.filter.performanceGroupName + "'))";
                }
                if ($scope.filter.industryId > 0) {
                    $scope.subIndustries = _.filter($scope.industries, function (item) {
                        return item.parentId == $scope.filter.industryId;
                    });
                } else {
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
                    $scope.doSearch();
                });
            };
            $scope.mainIndustryChange = function () {
                $scope.subIndustries = [];
                $scope.filter.subIndustryId = null;
                if ($scope.filter.industryId > 0) {
                    $scope.subIndustries = _.filter($scope.industries, function (item) {
                        return item.parentId == $scope.filter.industryId;
                    });
                }
                $scope.doFilter();
            }
            $scope.fiterOrganizationChanged = function () {
                $scope.filter.performanceGroupName = "Select Performance Group...";
                $scope.performanceGroups = _.filter($scope.AllPerformanceGroups, function (item) {
                    return item.organizationId == $scope.filter.organizationId;
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
                    trainingsService.getSkillsByFilterOptions(ipsSkillFiter).then(function (data) {
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
                trainingsService.getSkillsByFilterOptions(ipsSkillFiter).then(function (data) {
                    $scope.skills = data;
                });
                $scope.filter.skillId = 0;
                $scope.doFilter();
            }
            $scope.cancelSearchWindow = function () {
                $scope.openTrainingPopupMode.isOpenAddExistingTrainingPopup = false;
            };
            $scope.clearFilter = function () {
                $scope.filter = getCleanFilter();
                $scope.filter.searchText = "";
                $scope.doSearch();
                $scope.doFilter();
            };
            $scope.addSelectedTrainings = function () {
                for (var i = 0, len = $scope.trainings.length; i < len; i++) {
                    if ($scope.trainings[i].isChecked) {
                        if (!$scope.$parent.$parent.scorecardAnswer.agreement) {
                            $scope.$parent.$parent.scorecardAnswer.agreement = {
                                trainings: []
                            }
                        }
                        if (!$scope.$parent.$parent.scorecardAnswer.agreement.trainings) {
                            $scope.$parent.$parent.scorecardAnswer.agreement['trainings'] = [];
                        }
                        trainingsService.getById($scope.trainings[i].id).then(function (data) {
                            if ($scope.$parent.$parent.scorecardAnswer.agreement.stage) {
                                data.startDate = kendo.parseDate($scope.$parent.$parent.scorecardAnswer.agreement.stage.startDateTime);
                                data.endDate = kendo.parseDate($scope.$parent.$parent.scorecardAnswer.agreement.stage.endDateTime);
                            }
                            $scope.$parent.$parent.scorecardAnswer.agreement.trainings.push(data);
                        })
                    }
                }
                $scope.cancelSearchWindow();
            };
            $scope.startDateOpen = function (event) {
            };
            $scope.startDateChange = function () {
                if (!(kendo.parseDate($scope.newTraining.startDate) < kendo.parseDate($scope.newTraining.endDate))) {
                    $scope.newTraining.endDate = "";
                }
            };
            $scope.endDateOpen = function (event) {
                var datepicker = $(event.sender.element).data("kendoDateTimePicker")
                var maxDate = $scope.$parent.scorecardAnswer.agreement.stage.endDateTime;
                var nextStage = getNextStage();
                if (nextStage) {
                    maxDate = kendo.parseDate(moment(kendo.parseDate(nextStage.endDateTime)).add('days', -1).format('L LT'));
                }
                datepicker.setOptions({
                    min: kendo.parseDate($scope.newTraining.startDate),
                    max: maxDate,
                });
            };
            $scope.showNotificationTemplate = function (id) {
                todosManager.getNotificationTemplateById(id).then(function (data) {
                    $scope.templateInfo = data;
                    $("#emailBody").html("");
                    $("#emailBody").html(data.emailBody);
                    $("#notificationTemplateModal").modal("show");
                });
            }
            $scope.$watch('openTrainingPopupMode.isOpenNewTrainingPopup', function (newValue, oldValue) {
                if ($scope.newTrainingWindow) {
                    if ($scope.openTrainingPopupMode.isOpenNewTrainingPopup) {
                        $scope.skills = [$scope.scorecardAnswer.skill];
                        OpenNewTrainingPopup();
                        if ($scope.saveMode == 0) {
                            $scope.newTraining = getCleanTraining();
                            $scope.newTraining.skillId = $scope.scorecardAnswer.skill.id;
                            $scope.trainingMaterials.splice(0, $scope.trainingMaterials.length);
                            if ($scope.$parent.scorecardAnswer.agreement.stage) {
                                $scope.newTraining.endDate = moment(kendo.parseDate($scope.$parent.scorecardAnswer.agreement.stage.endDateTime)).format('L LT');
                            }
                            else {
                                if ($scope.$parent.kpi) {
                                    var currentStage = $scope.$parent.kpi.getCurrentStage();
                                    if (currentStage) {
                                        $scope.newTraining.endDate = moment(kendo.parseDate(currentStage.endDateTime)).format('L LT');
                                    }
                                }
                            }
                            if ($scope.$parent.$parent.scorecardAnswer.agreement.stage) {
                                if ($scope.$parent.$parent.scorecardAnswer.agreement.stage.evaluationStartDate != null) {
                                    $scope.newTraining.endDate = moment(kendo.parseDate($scope.$parent.$parent.scorecardAnswer.agreement.stage.evaluationEndDate)).format('L LT');
                                }
                            }
                            else {
                                if ($scope.$parent.kpi) {
                                    var currentStage = $scope.$parent.kpi.getCurrentStage();
                                    if (currentStage) {
                                        $scope.newTraining.endDate = moment(kendo.parseDate(currentStage.endDateTime)).format('L LT');
                                    }
                                }
                            }
                            $scope.newTraining.skillId = $scope.scorecardAnswer.skill.id;
                            $scope.skills = [$scope.scorecardAnswer.skill];
                        }
                        else if ($scope.editingTrainingIndex >= 0) {
                            $scope.newTraining = getCleanTraining();
                            $scope.newTraining.skillId = $scope.scorecardAnswer.skill.id;
                            $scope.skills = [$scope.scorecardAnswer.skill];
                            if ($scope.scorecardAnswer.agreement.trainings.length > 0) {
                                $scope.editTraining($scope.scorecardAnswer.agreement.trainings[$scope.editingTrainingIndex].id,
                                    $scope.scorecardAnswer.agreement.trainings, $scope.editingTrainingIndex);
                            }
                            else if ($scope.scorecardAnswer.trainings.length > 0) {
                                $scope.editTraining($scope.scorecardAnswer.trainings[$scope.editingTrainingIndex].id,
                                    $scope.scorecardAnswer.trainings, $scope.editingTrainingIndex);
                            }
                        }
                        $scope.newTrainingWindow.open().center();
                    }
                    else {
                        $scope.openTrainingPopupMode.isOpenNewTrainingPopup = false;
                        $scope.newTrainingWindow.close();
                    }
                }
            });
            function getNextStage() {
                var nextStage = null;
                if ($scope.$parent.kpi) {
                    if ($scope.$parent.kpi.stages) {
                        var currentStageIndex = null;
                        angular.forEach($scope.$parent.kpi.stages, function (item, index) {
                            if (item.id.toString() === $scope.$parent.scorecardAnswer.agreement.stage.id) {
                                currentStageIndex = index;
                            }
                            if (currentStageIndex > -1) {
                                nextStage = $scope.$parent.kpi.stages[currentStageIndex + 1];
                                return (false);
                            }
                        });
                    }
                }
                return nextStage;
            }
            $scope.$watch('openTrainingPopupMode.isOpenAddExistingTrainingPopup', function (newValue, oldValue) {
                if ($scope.trainingsSearchWindow) {
                    if ($scope.openTrainingPopupMode.isOpenAddExistingTrainingPopup) {
                        $scope.skills = [$scope.scorecardAnswer.skill];
                        OpenAddExistingTrainingPopup();
                        $scope.trainingsSearchWindow.open().center();
                        $scope.filter = getCleanFilter();
                        $scope.clearFilter();
                    }
                    else {
                        $scope.openTrainingPopupMode.isOpenAddExistingTrainingPopup = false;
                        $scope.newTraining = getCleanTraining();
                        $scope.trainingsSearchWindow.close();
                    }
                }
            });

            function OpenNewTrainingPopup() {
                trainingsService.getTrainingTypes().then(function (data) {
                    $scope.trainingTypes = data;
                });
                trainingsService.getTrainingLevels().then(function (data) {
                    $scope.trainingLevels = data;
                });
                trainingsService.getDurationMetrics().then(function (data) {
                    $scope.durationMetrics = data;
                });
                trainingsService.getExerciseMetrics().then(function (data) {
                    $scope.exerciseMetrics = data;
                });
            }

            function OpenAddExistingTrainingPopup() {
                trainingsService.getOrganizations().then(function (data) {
                    $scope.organizations = data;
                });
                trainingsService.getPerformanceGroups().then(function (data) {
                    $scope.AllPerformanceGroups = data;
                    $scope.performanceGroups = data;
                });
                trainingsService.getProfileLevels().then(function (data) {
                    $scope.profileLevels = data;
                });
                trainingsService.getProfileTargetGroups().then(function (data) {
                    $scope.targetGroups = data;
                });
                trainingsService.getIndustries().then(function (data) {
                    $scope.industries = data;
                    $scope.mainIndustries = _.filter(data, function (i) {
                        return i.parentId == null;
                    });
                });
            }
        }])

    .directive('trainingPopup', [function () {
        return {
            restrict: 'E',
            templateUrl: 'directives/trainingPopup/trainingPopup.html',
            scope: {
                scorecardAnswer: '=',
                organizationId: '=?',
                saveMode: '=',
                openTrainingPopupMode: '=',
                editingTrainingIndex: '=?',
                editingTraining: '=?',
                notificationTemplates: '=?'
            },
            controller: 'trainingPopupCtrl'
        };
    }]);