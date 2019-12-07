app.directive('ngEditTraining', ['apiService', function (apiService, $compile) {
    return {
        restrict: 'EA',
        require: '^ngModel',
        templateUrl: 'directives/ngEditTraining/ngEditTraining.html',
        scope: {
            ngModel: '=',
            ngTrainingLevels: '=',
            ngTrainingTypes: '=',
            ngOrganizations: '=',
            ngSkills: '=',
            ngSkillsHash: '=',
            ngSkillsFlatList: '=',
            ngStandardPanel: '=',
            ngSimplePanel: '=',
            ngDurationMetrics: '=',
            ngExerciseMetrics: '=',
            ngNotificationIntervals: '=',
            ngAllowRemoveAction: '='
        },
        replace: true,
        controller: ['$scope', 'authService', 'apiService', 'profilesService', 'dialogService', '$stateParams', '$element', 'Upload', '$location', '$state', '$translate',
            function ($scope, authService, apiService, profilesService, dialogService, $stateParams, $element, Upload, $location, $state, $translate) {
                $scope.trainingTemplate = angular.copy($scope.ngModel);
                $scope.training = $scope.ngModel;

                $scope.isOrganizationDisabled = $stateParams.organizationId != undefined;
                if ($scope.isOrganizationDisabled) {
                    $scope.training.organizationId = parseInt($stateParams.organizationId);
                }

                $scope.trainingLevels = $scope.ngTrainingLevels;
                $scope.trainingTypes = $scope.ngTrainingTypes;
                $scope.organizations = $scope.ngOrganizations;
                $scope.skills = $scope.ngSkills;

                if ($scope.ngSkillsHash) {
                    $scope.skillsHash = $scope.ngSkillsHash;
                } else {
                    $scope.skillsHash = profilesService.createSkillsHash($scope.skills);
                }
                $scope.skillsFlatList = $scope.ngSkillsFlatList;


                $scope.isStandardPanel = $scope.ngStandardPanel;
                $scope.isSimplePanel = $scope.ngSimplePanel;
                $scope.durationMetrics = $scope.ngDurationMetrics;
                $scope.exerciseMetrics = $scope.ngExerciseMetrics;
                $scope.notificationIntervals = $scope.ngNotificationIntervals;

                if ($scope.training.skills.length > 0) {
                    $scope.training.skill = $scope.training.skills[0];
                    $scope.training.skillId = $scope.training.skills[0].id;
                }

                $scope.authService = authService;
                //local permission values
                var vm = new Object();
                vm[$scope.authService.actions.Create] = null;
                vm[$scope.authService.actions.Read] = null;
                vm[$scope.authService.actions.Update] = null;
                vm[$scope.authService.actions.Delete] = null;
                vm.organizationId = $scope.training.organizationId !== null ? $scope.training.organizationId : 0;
                $scope.isDisabled = function (action) {
                    if (action == undefined) {

                        if ($stateParams.trainingId == 0) {
                            action = $scope.authService.actions.Create;
                        } else {
                            action = $scope.authService.actions.Update;
                        }
                    }

                    if (vm[action] == null) {
                        vm[action] = !authService.hasPermition(vm.organizationId, 'Trainings', action);
                        return vm[action];
                    } else {
                        return vm[action];
                    }
                };

                $scope.isRemoveVisible = function () {
                    return $scope.ngAllowRemoveAction && $scope.training.id > 0;
                };

                $scope.private = {
                    getById: function (id, myArray) {
                        if (myArray.filter) {
                            return myArray.filter(function (obj) {
                                if (obj.id == id) {
                                    return obj
                                }
                            })[0]
                        }
                        return undefined;
                    },
                    processTable: function (data, idField, foreignKey, rootLevel) {
                        var hash = {};

                        for (var i = 0; i < data.length; i++) {
                            var item = data[i];
                            item.text = item.name;
                            var id = item[idField];
                            var parentId = item[foreignKey];

                            hash[id] = hash[id] || [];
                            hash[parentId] = hash[parentId] || [];

                            item.items = hash[id];
                            hash[parentId].push(item);
                        }
                        return hash[rootLevel];
                    }
                }

                $scope.treeSkillsData = new kendo.data.HierarchicalDataSource({
                    data: $scope.private.processTable($scope.skills, "id", "parentId", 0)
                });

                $scope.skillSelected = function () {
                    for (var i = 0; i < $scope.skills.length; i++) {
                        if ($scope.skills[i].id == $scope.training.skillId) {
                            $scope.training.skill = $scope.skills[i];
                            break;
                        }
                    }
                }

                $scope.saveTraining = function () {
                    var item = angular.copy($scope.training);
                    item.startDate = kendo.parseDate(item.startDate);
                    item.endDate = kendo.parseDate(item.endDate);
                    if (item.skillId) {
                        item.skills = [];
                        item.skills.push(item.skill);
                        item.skillName = item.skill.name;
                    }
                    else {
                        item.skills = [];
                    }

                    if (item.id > 0) {
                        apiService.update("trainings", item).then(function (data) {

                            if (data) {
                                var training = $scope.private.getById(item.id, $scope.$parent.trainings);
                                var index = $scope.$parent.trainings.indexOf(training);
                                /*training.name = item.name;
                                 training.viewName = item.name;
                                 training.why = item.why;
                                 training.how = item.how;
                                 training.what = item.what;
                                 training.additionalInfo = item.additionalInfo;
                                 training.skillId = item.skillId;
                                 training.typeId = item.typeId;
                                 training.levelId = item.levelId;*/

                                $scope.$parent.trainings.splice(index, 1, item);

                                dialogService.showNotification($translate.instant('SOFTPROFILE_TRAINING_SAVED_SUCCESSFULLY'), 'info')
                                //$state.go('^');
                            }
                            else {
                                dialogService.showNotification($translate.instant('SOFTPROFILE_SAVE_FAILED'), 'warning');
                            }

                        }, function (error) {
                            dialogService.showNotification(error, "warning");
                        });
                    }
                    else {
                        if ($scope.isSimplePanel) {
                            var skill = $scope.private.getById($scope.training.skillId, $scope.skills);
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
                                item.skills = [skill.skill];
                                item.skill = skill.skill;
                                item.skillId = skill.skill.id;
                                item.skillName = skill.skill.name;
                            }
                        }

                        apiService.add("trainings", item).then(function (data) {
                            item.id = data.id;
                            item.pgSkillId = null;

                            if ($scope.isStandardPanel) {
                                $scope.$parent.trainings.push(item);
                                $scope.training.id = item.id;
                            }


                            if ($scope.isSimplePanel) {
                                item.startDate = moment(kendo.parseDate(item.startDate)).format("L LT");
                                item.endDate = moment(kendo.parseDate(item.endDate)).format("L LT");
                                $scope.$parent.trainings.push(item);
                                $scope.training = angular.copy($scope.trainingTemplate);
                                $scope.trainingMaterials.splice(0, $scope.trainingMaterials.length);
                                $scope.training.trainingMaterials = $scope.trainingMaterials;
                                $("form[name=editTraining] input[name=starDate]").data("kendoDateTimePicker").value(null);
                                $("form[name=editTraining] input[name=endDate]").data("kendoDateTimePicker").value(null);
                            }

                            if (item.id > 0) {
                                dialogService.showNotification($translate.instant('SOFTPROFILE_TRAINING_SAVED_SUCCESSFULLY'), 'info');
                                //$state.go('^');
                            } else {
                                dialogService.showNotification($translate.instant('SOFTPROFILE_SAVE_FAILED'), 'warning');
                            }
                        }, function (error) {
                            dialogService.showNotification(error, "warning");
                        });
                    }
                }

                function stringIsNumber(s) {
                    var x = +s;
                    return x.toString() === s;
                }

                function getSelectedSkillId() {
                    if ($scope.training.skillId) {
                        if (angular.isNumber($scope.training.skillId) || stringIsNumber($scope.training.skillId))
                            return $scope.training.skillId;
                        var ids = $scope.training.skillId.split("_");
                        if (ids.length > 1) {
                            if (stringIsNumber(ids[1]))
                                return ids[1];
                            return ids[0];
                        }
                    }
                    return null;
                }

                $scope.addWhyReasons = function () {
                    var skillId = getSelectedSkillId();
                    if (skillId) {
                        var getQuery = "(SkillId eq " + skillId + ")and(DescriptionType eq 0)";
                        var parameters = [{ key: "SkillId", value: skillId }, { key: "DescriptionType", value: "0" }];

                        dialogService.showSelectableGridDialog($translate.instant('TRAININGDAIRY_SELECT_WHY_REASONS'), "description", "TrainingDescriptions", "Description", getQuery, parameters, false).then(
                            function (data) {
                                angular.forEach(data, function (item, index) {
                                    $scope.training.why += item.description + "\n";
                                });
                            });
                    } else {
                        dialogService.showNotification($translate.instant('SOFTPROFILE_PLEASE_SELECT_THE_SKILL'), "warning");
                    }

                }

                $scope.addWhatReasons = function () {
                    var skillId = getSelectedSkillId();
                    if (skillId) {
                        var getQuery = "(SkillId eq " + skillId + ")and(DescriptionType eq 1)";
                        var parameters = [{ key: "SkillId", value: skillId }, { key: "DescriptionType", value: "1" }];
                        dialogService.showSelectableGridDialog($translate.instant('TRAININGDAIRY_SELECT_WHAT_REASONS'), "description", "TrainingDescriptions", "Description", getQuery, parameters, false).then(
                            function (data) {
                                angular.forEach(data, function (item, index) {
                                    $scope.training.what += item.description + "\n";
                                });
                            });
                    } else {
                        dialogService.showNotification($translate.instant('SOFTPROFILE_PLEASE_SELECT_THE_SKILL'), "warning");
                    }
                }

                $scope.addHowReasons = function () {
                    var skillId = getSelectedSkillId();
                    if (skillId) {
                        var getQuery = "(SkillId eq " + skillId + ")and(DescriptionType eq 2)";
                        var parameters = [{ key: "SkillId", value: skillId }, { key: "DescriptionType", value: "2" }];
                        dialogService.showSelectableGridDialog($translate.instant('TRAININGDAIRY_SELECT_HOW_REASONS'), "description", "TrainingDescriptions", "Description", getQuery, parameters, false).then(
                            function (data) {
                                angular.forEach(data, function (item, index) {
                                    $scope.training.how += item.description + "\n";
                                });
                            });
                    } else {
                        dialogService.showNotification($translate.instant('SOFTPROFILE_PLEASE_SELECT_THE_SKILL'), "warning");
                    }
                }

                $scope.removeTraining = function () {
                    dialogService.showYesNoDialog($translate.instant('COMMON_CONFIRM'), $translate.instant('COMMON_ARE_YOU_SURE_YOU_WANT_TO_DELETE')).then(
                        function () {
                            var item = $scope.private.getById($scope.training.id, $scope.$parent.trainings);
                            var index = $scope.$parent.trainings.indexOf(item);
                            apiService.remove("trainings", id).then(function (data) {
                                if (data) {
                                    $scope.$parent.trainings.splice(index, 1);
                                }
                            });
                        },
                        function () {
                            //alert('No clicked');
                        });
                }

                $scope.back = function () {
                    history.back();
                }

                trainingmaterialsGridOptions = {}

                $scope.onUserAssignGridDataBound = function (e) {
                    var grid = e.sender;
                    if (grid.dataSource.total() == 0) {
                        var colCount = grid.columns.length;
                        $(e.sender.wrapper)
                            .find('tbody')
                            .append('<tr class="kendo-data-row"><td colspan="' + colCount + '" class="no-data">There is no data to show in the grid.</td></tr>');
                    }
                };

                $scope.trainingMaterials = new kendo.data.ObservableArray($scope.training.trainingMaterials);
                $scope.training.trainingFeedbacks = $scope.ngModel.trainingFeedbacks;
                
                $scope.training.trainingMaterials = $scope.trainingMaterials;
                $scope.trainingMaterialsdataSource = new kendo.data.DataSource({
                    type: "json",
                    data: $scope.trainingMaterials,
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
                });


                $scope.openLink = function (link) {
                    var win = window.open(link);
                    win.focus();
                }

                $scope.trainingmaterialsGridOptions = {
                    dataBound: $scope.onUserAssignGridDataBound,
                    dataSource: $scope.trainingMaterialsdataSource,
                    columnMenu: true,
                    filterable: true,
                    pageable: true,
                    columns: [
                        {
                            field: "title", title: $translate.instant('COMMON_TITLE'), width: "45%", template: function (dataItem) {
                                if (dataItem.name) {
                                    return "<div><a class='' ng-click='downloadTrainingmaterial(\"" + webConfig.trainingMaterialsController + dataItem.name + "\", \"" + dataItem.title + "\");'>" + dataItem.title + "</a></div>";
                                } else if (dataItem.link) {
                                    return "<div><a class='' ng-click='openLink(\"" + dataItem.link + "\");'>" + dataItem.title + "</a></div>";
                                } else {
                                    return "<div>" + dataItem.title + "</div>";
                                }


                            },
                        },
                        { field: "materialType", title: $translate.instant('COMMON_MATERIAL_TYPE'), width: "30%" },
                        { field: "description", title: $translate.instant('COMMON_DESCRIPTION'), width: "30%" },
                        {
                            field: "actions", title: $translate.instant('COMMON_ACTIONS'), width: "10%", filterable: false,
                            template: function (dataItem) {
                                return "<div class='icon-groups'><a class='icon-groups icon-groups-item edit-icon' ng-click='editTrainingMaterial(" + dataItem.id + ");'></a><a class='icon-groups icon-groups-item delete-icon' ng-click='removeTrainingMaterial(" + dataItem.id + ");'></a></div>";
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
                                $scope.trainingMaterial.resourceType = $file.type;
                                if (!$scope.trainingMaterial.title) {
                                    $scope.trainingMaterial.title = $file.name;
                                }
                                (data) ? $scope.trainingMaterial.name = data : '';

                            }).error(function (data) {
                                dialogService.showNotification(data, 'warning');
                            });
                        })(i);
                    }
                }

                $scope.downloadTrainingmaterial = function (uri, name) {
                    var link = document.createElement("a");
                    link.download = name;
                    link.href = uri;
                    link.click();
                }

                var isEdit = false;
                $scope.trainingMaterialTemplate = {
                    id: 0,
                    name: "",
                    description: "",
                    title: "",
                    materialType: "",
                    resourceType: ""
                };

                $scope.editTrainingMaterial = function (id) {
                    $scope.trainingMaterial = angular.copy($scope.private.getById(id, $scope.trainingMaterials));
                    $scope.winTrainingMaterial.open().center();
                    isEdit = true;
                };

                $scope.removeTrainingMaterial = function (id) {
                    var index = _.findIndex($scope.trainingMaterials, { 'id': id });
                    $scope.trainingMaterials.splice(index, 1);
                };

                $scope.addTrainingMaterial = function () {
                    $scope.trainingMaterial = angular.copy($scope.trainingMaterialTemplate);
                    $scope.trainingMaterial.id = $scope.trainingMaterials.length * -1;

                    while ($scope.private.getById($scope.trainingMaterial.id, $scope.trainingMaterials)) {
                        $scope.trainingMaterial.id--;
                    }

                    $scope.winTrainingMaterial.open().center();
                    isEdit = false;
                }

                $scope.cancelTrainingMaterial = function () {
                    $scope.winTrainingMaterial.close();
                }

                $scope.okTrainingMaterial = function () {
                    if (($scope.trainingMaterial.materialType) && ($scope.trainingMaterial.materialType.name)) {
                        $scope.trainingMaterial.materialType = $scope.trainingMaterial.materialType.name;
                    }
                    else {
                        $scope.trainingMaterial.materialType = "";
                    }
                    $scope.winTrainingMaterial.close();
                    if (isEdit) {
                        var item = $scope.private.getById($scope.trainingMaterial.id, $scope.trainingMaterials);
                        var index = $scope.trainingMaterials.indexOf(item);
                        $scope.trainingMaterials.splice(index, 1, $scope.trainingMaterial);
                    } else {
                        $scope.trainingMaterials.push($scope.trainingMaterial);
                    }
                }

                $scope.$on("kendoRendered", function (event) {
                    if (event.targetScope.winTrainingMaterial) {
                        $scope.winTrainingMaterial = event.targetScope.winTrainingMaterial;
                    }
                    if (event.targetScope.winTrainingType) {
                        $scope.winTrainingType = event.targetScope.winTrainingType;
                    }
                });

                //add training type
                $scope.getTrainingTypes = function () {
                    apiService.getAll("trainingTypes?$orderby=Name").then(function (data) {
                        angular.forEach(data, function (key, value) {
                            key.text = key.name;
                            key.value = key.id;
                        });
                        data.unshift({ name: $translate.instant('SOFTPROFILE_SELECT_TYPE'), id: null, text: "", value: null });
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
                        dialogService.showNotification($translate.instant('SOFTPROFILE_TRAINING_TYPE_HAS_BEEN_SUCCESSFULLY_ADDED'), "info");
                        //$scope.trainingTypes = $scope.getTrainingTypes();
                        $scope.getTrainingTypes();
                        $scope.winTrainingType.close();
                    }, function (message) {
                        dialogService.showNotification(message, "warning");
                    });


                }
            }],
        link: function ($scope, element, attrs) {

        }
    }
}]);