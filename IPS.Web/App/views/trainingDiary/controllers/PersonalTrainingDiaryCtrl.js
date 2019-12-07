angular.module('ips.trainingdiary')
    .config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
        var basePersonalTrainingDiaryResolve = {
            pageName: function ($translate) {
                return $translate.instant('COMMON_PERSONAL_TRAININGS');
            },
        };
        $stateProvider
            .state('home.training.personaltrainingdiary', {
                url: "/personaltrainingdiary",
                templateUrl: "views/trainingDiary/views/personaltrainingdiary.html",
                controller: "PersonalTrainingDiaryCtrl",
                resolve: basePersonalTrainingDiaryResolve,
                data: {
                    displayName: '{{pageName}}',//'Training Diary',
                    paneLimit: 1,
                    depth: 2
                }
            })

    }])
    .controller("PersonalTrainingDiaryCtrl", ['$scope', 'cssInjector', '$stateParams', '$location', 'trainingdiaryManager', 'dialogService', 'apiService', 'authService', 'trainingSaveModeEnum', 'trainingsDiaryService', 'progressBar', 'localStorageService', '$compile', 'eventTypeEnum', 'trainingDiaryViewEnum', 'trainingStatusEnum', 'evaluationFeedbackEnum', 'Upload', '$translate', 'globalVariables',
        function ($scope, cssInjector, $stateParams, $location, trainingdiaryManager, dialogService, apiService, authService, trainingSaveModeEnum, trainingsDiaryService, progressBar, localStorageService, $compile, eventTypeEnum, trainingDiaryViewEnum, trainingStatusEnum, evaluationFeedbackEnum, Upload, $translate, globalVariables) {
            cssInjector.removeAll();
            cssInjector.add('views/trainingDiary/trainingDiary.min.css');
            cssInjector.add('views/trainingDiary/td-profile.css');
            cssInjector.add('views/trainingDiary/td-materials.css');

            moment.locale(globalVariables.lang.currentUICulture);
            var authData = localStorageService.get('authorizationData');
            $scope.currentUser = authData;
            trainingsDiaryService.getOrganizations().then(function (data) {
                $scope.organizations = data;
            });
            trainingsDiaryService.getDurationMetrics().then(function (data) {
                $scope.durationMetrics = data;
            });
            $scope.ownTraings = [];
            $scope.ownTrainingStatuses = {
                InProgress: 0,
                UpComing: 1,
                Completed: 2
            };
            $scope.ownTrainingView = null;
            $scope.ownTrainingStatusChanged = function (event, status) {
                $scope.activeTraining = { id: 0, name: "", description: "", priority: "" };
                $scope.isOwnView = true;
                $scope.ownTrainingView = [];
                $scope.isActiveOwnView = false;
                progressBar.startProgress();
                trainingdiaryManager.getOwnTrainingCounts($scope.currentUser.user.userId).then(function (data) {
                    $scope.ownTrainingCount = data;
                }, function (e) {
                    dialogService.showNotification($translate.instant('TRAININGDAIRY_THERE_IS_SOMETHING_WENT_WRONG'), "error");
                    progressBar.stopProgress();
                });
                trainingdiaryManager.getUserOwnTraining($scope.currentUser.user.userId, status).then(function (data) {
                    progressBar.stopProgress();
                    $scope.isActiveOwnView = true;
                    $scope.ownTrainingView = [];
                    if (data) {
                        if (data.length > 0) {
                            $scope.ownTrainingView = data;
                            $scope.activeTraining = $scope.ownTrainingView[0];
                            $("#ownTrainingFeedbackGrid").html("");
                            $("#ownTrainingFeedbackGrid").kendoGrid({
                                dataBound: $scope.onUserAssignGridDataBound,
                                dataSource: {
                                    type: "json",
                                    data: $scope.activeTraining.trainingFeedbacks,
                                    pageSize: 10,
                                },
                                columnMenu: true,
                                filterable: {
                                    extra: false,
                                    operators: {
                                        string: {
                                            startswith: "Starts with",
                                            eq: "Is equal to",
                                            neq: "Is not equal to"
                                        }
                                    }
                                },
                                pageable: true,
                                columns: [
                                    {
                                        field: "feedbackDateTime", title: $translate.instant('COMMON_DATE'), width: "15%", template: function (data, value) {
                                            if (data.feedbackDateTime) {
                                                return moment(kendo.parseDate(data.feedbackDateTime)).format('L LT');
                                            }
                                            else {
                                                return "";
                                            }
                                        }
                                    },
                                    {
                                        field: "rating", title: $translate.instant('COMMON_RATING'), width: "15%", template: function (data) {
                                            var template = "";
                                            for (var i = 0; i < data.rating; i++) {
                                                template += "<span><label class='fa fa-star fa-fw selected'></label></span>";
                                            }
                                            return template;
                                        }
                                    },
                                    { field: "workedWell", title: $translate.instant('COMMON_WORKED_WELL'), width: "20%" },
                                    { field: "workedNotWell", title: $translate.instant('COMMON_WORKED_NOT_WELL'), width: "20%" },
                                    { field: "whatNextDescription", title: $translate.instant('COMMON_WHAT_NEXT'), width: "20%" },
                                    { field: "timeSpentMinutes", title: $translate.instant('COMMON_TIME_SPENT') + "(" + $translate.instant('COMMON_MINUTES') + ")", width: "10%" },
                                ],
                            });
                            $("#ownTrainingFeedbackGrid").kendoTooltip({
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
                            $("#ownTrainingMaterialGrid").html("");
                            $("#ownTrainingMaterialGrid").kendoGrid({
                                dataBound: $scope.onUserAssignGridDataBound,
                                dataSource: {
                                    type: "json",
                                    data: $scope.activeTraining.trainingMaterials,
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
                                columnMenu: false,
                                filterable: {
                                    extra: false,
                                    operators: {
                                        string: {
                                            startswith: "Starts with",
                                            eq: "Is equal to",
                                            neq: "Is not equal to"
                                        }
                                    }
                                },
                                pageable: true,
                                sortable: true,
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
                                    }
                                ],
                            });
                            $("#ownTrainingMaterialGrid").kendoTooltip({
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
                            App.initSlimScroll(".scroller")
                        }
                    }
                }, function (e) {
                    dialogService.showNotification($translate.instant('TRAININGDAIRY_THERE_IS_SOMETHING_WENT_WRONG'), "error");
                    progressBar.stopProgress();
                });

                if ($(event.target).is("li")) {
                    $(event.target).addClass("active")
                }
                else {
                    $(event.target).parents("li").addClass("active");
                }
            }
            $scope.ownTrainingChanged = function (id, element) {
                var training = _.filter($scope.ownTrainingView, function (item) {
                    return item.id == id;
                });
                if (training.length > 0) {
                    $scope.activeTraining = training[0];
                    $("#ownTrainingFeedbackGrid").html("");
                    $("#ownTrainingFeedbackGrid").kendoGrid({
                        dataBound: $scope.onUserAssignGridDataBound,
                        dataSource: {
                            type: "json",
                            data: $scope.activeTraining.trainingFeedbacks,
                            pageSize: 10,
                        },
                        columnMenu: true,
                        filterable: {
                            extra: false,
                            operators: {
                                string: {
                                    startswith: "Starts with",
                                    eq: "Is equal to",
                                    neq: "Is not equal to"
                                }
                            }
                        },
                        pageable: true,
                        columns: [
                            {
                                field: "feedbackDateTime", title: $translate.instant('COMMON_DATE'), width: "15%", template: function (data, value) {
                                    if (data.feedbackDateTime) {
                                        return moment(kendo.parseDate(data.feedbackDateTime)).format('L LT')
                                    }
                                    else {
                                        return "";
                                    }
                                }
                            },
                            {
                                field: "rating", title: $translate.instant('COMMON_RATING'), width: "15%", template: function (data) {
                                    var template = "";
                                    for (var i = 0; i < data.rating; i++) {
                                        template += "<span><label class='fa fa-star fa-fw selected'></label></span>";
                                    }
                                    return template;
                                }
                            },
                            { field: "workedWell", title: $translate.instant('COMMON_WORKED_WELL'), width: "20%" },
                            { field: "workedNotWell", title: $translate.instant('COMMON_WORKED_NOT_WELL'), width: "20%" },
                            { field: "whatNextDescription", title: $translate.instant('COMMON_WHAT_NEXT'), width: "20%" },
                            { field: "timeSpentMinutes", title: $translate.instant('COMMON_TIME_SPENT') + "(" + $translate.instant('COMMON_MINUTES') + ")", width: "10%" }
                        ],
                    });
                    $("#ownTrainingFeedbackGrid").kendoTooltip({
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
                    $("#ownTrainingMaterialGrid").html("");
                    $("#ownTrainingMaterialGrid").kendoGrid({
                        dataBound: $scope.onUserAssignGridDataBound,
                        dataSource: {
                            type: "json",
                            data: $scope.activeTraining.trainingMaterials,
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
                        columnMenu: false,
                        filterable: {
                            extra: false,
                            operators: {
                                string: {
                                    startswith: "Starts with",
                                    eq: "Is equal to",
                                    neq: "Is not equal to"
                                }
                            }
                        },
                        pageable: true,
                        sortable: true,
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
                            }
                        ],
                    });
                    $("#ownTrainingMaterialGrid").kendoTooltip({
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
                else {
                    $scope.activeTraining = { id: 0, name: "", description: "", priority: "" };
                }
                $(".todo-tasklist-item").removeClass("active");
                if ($(element.target).hasClass("todo-tasklist-item")) {
                    $(element.target).addClass("active");
                }
                else {
                    $(element.target).parents(".todo-tasklist-item").addClass("active");
                }
            }
            $scope.ownTrainingComplete = function (id) {
                if (id > 0) {
                    $scope.trainingFeedBack = {
                        trainingId: 0,
                        rating: 0,
                        workedWell: "",
                        workedNotWell: "",
                        whatNextDescription: "",
                        taskId: 0,
                        timeSpentMinutes: 0,
                    };
                    $scope.trainingFeedBack.trainingId = id;
                    $("#trainingFeedbackModal").modal('show');
                }
            }
            $scope.isTrainingActive = function () {
                if ($scope.activeTraining) {
                    if ($scope.activeTraining.id > 0) {
                        return true;
                    }
                    else {
                        return false;
                    }
                }
                else {
                    return false;
                }
            }
            $scope.init = function () {
                if ($(".todo-project-list li").length > 0) {
                    $scope.ownTrainingStatusChanged($(".todo-project-list li").eq(0), $scope.ownTrainingStatuses.InProgress)
                }
            }

            $scope.activeTraining = { id: 0, name: "", description: "" };

            $scope.openTrainingPopupMode = {
                isOpenNewTrainingPopup: false,
                isOpenAddExistingTrainingPopup: false
            }

            $scope.openTrainingNotePopupMode = {
                isOpenNewTrainingNotePopup: false,
            }
            $scope.skills = [];
            $scope.notificationTemplates = [];
            $scope.activeSkill = null;
            $scope.isOwnView = true;
            $scope.isActiveOwnView = false;

            $scope.activeTraining = { id: 0, name: "", description: "" };
            $scope.editingTraining = null;


            $scope.downloadTrainingMaterial = function (uri, name) {
                var link = document.createElement("a");
                link.download = name;
                link.href = uri;
                link.click();
            };
            $scope.openLink = function (link, name) {
                if (name) {
                    link = webConfig.serviceBase + "api/download/trainingMaterials/" + name
                }
                var win = window.open(link);
                win.focus();
            }
            $scope.getLink = function (name) {
                if (name) {
                    return webConfig.serviceBase + "api/download/trainingMaterials/" + name
                }
            }
            $scope.ratings = [
                { value: 1, background: "#f00" },
                { value: 2, background: "#ff0" },
                { value: 3, background: "#0f3" },
                { value: 4, background: "#06f" },
                { value: 5, background: "#f99" },
            ];

            $scope.selectedFilteredTrainingId = null;
            $scope.starMouseHover = function (el) {
                var onStar = parseInt($(el.target).data('value'), 10); // The star currently mouse on
                // Now highlight all the stars that's not after the current hovered star
                $(el.target).parents("#stars").children('li.star').each(function (e) {
                    if (e < onStar) {
                        $(this).addClass('hover');
                    }
                    else {
                        $(this).removeClass('hover');
                    }
                });
            }
            $scope.starMouseOut = function (el) {
                $(el.target).parents("#stars").children('li.star').each(function (e) {
                    $(this).removeClass('hover');
                });
            }
            $scope.ratingCSS = function (starValue, ratingValue) {
                if (starValue <= ratingValue) {
                    return "selected";
                }
            }
            /* 2. Action to perform on click */
            $scope.starClick = function (el) {
                var onStar = parseInt($(el.target).data('value'), 10); // The star currently selected
                var stars = $(el.target).parents("#stars").children('li.star');
                for (var i = 0; i < stars.length; i++) {
                    $(stars[i]).removeClass('selected');
                }
                for (var i = 0; i < onStar; i++) {
                    $(stars[i]).addClass('selected');
                }
                var ratingValue = parseInt($('#stars li.selected label').last().data('value'), 10);
                if (ratingValue > 1) {
                    $scope.trainingFeedBack.rating = ratingValue;;
                }
                else {
                    $scope.trainingFeedBack.rating = 0;
                }
            };
            $scope.$on("kendoRendered", function (event) {
                if (event.targetScope.winTrainingMaterial) {
                    $scope.winTrainingMaterial = event.targetScope.winTrainingMaterial;
                }
                if (event.targetScope.searchTrainingsGrid) {
                    $scope.searchGridInstance = event.targetScope.searchTrainingsGrid;
                }
            });
            $scope.priorityClass = function (priority, index, trainingIndex) {
                var result = "";
                if (priority == 1) {
                    result = "weak"
                }
                else if (priority == 2) {
                    result = "strong"
                }
                if (index == 0 && trainingIndex == 0) {
                    result += " active";
                }
                return result;
            }
            $scope.trainingMaterialImageSrc = function (type, name, link) {
                if (type == "Video") {
                    return "images/video.png"
                }
                else if (type == "Document") {
                    return "images/document.png"
                }
                else if (type == "Audio") {
                    return "images/audio.png"
                }
                else if (type == "Image") {
                    if (name.length > 0) {
                        return getLink(material.name);
                    }
                    else {
                        return link
                    }
                }
                else {
                    return "images/url.png"
                }
            }
            $scope.trainingMaterialClass = function (type) {
                if (type == "Video") {
                    return "tm-video";
                }
                else if (type == "Document") {
                    return "tm-document";
                }
                else if (type == "Audio") {
                    return "tm-audio";
                }
                else if (type == "Image") {
                    return "tm-image";
                }
                else {
                    return "tm-link";
                }
            }

            $scope.addOwnTraining = function () {
                $scope.activeSkill = null;
                $scope.saveMode = trainingSaveModeEnum.createkpi;
                $scope.openTrainingPopupMode.isOpenNewTrainingPopup = true;
            }
            $scope.SendPersonalTrainingNotification = function (skill, evaluationAgreement) {
                if (evaluationAgreement.participantId) {
                    if (evaluationAgreement.trainings.length > 0) {
                        //Profile
                        _.forEach(evaluationAgreement.trainings, function (trainingItem) {
                            if ($scope.IsAllowAddKPITraining(trainingItem.startDate, trainingItem.endDate)) {
                                if (trainingItem.id > 0) {
                                    var obj = { trainingId: trainingItem.id, participantId: evaluationAgreement.participantId, trainingType: "Personal" };
                                    trainingdiaryManager.SendTrainingNotification(obj);
                                }
                            }
                        });
                    }
                }
            }
            $scope.isTrainingDoneToday = function (id) {
                var result = true;
                if ($scope.isActiveOwnView) {
                    var trainingDetail = _.filter($scope.ownTrainingView, function (item) {
                        return item.id == id;
                    })
                    if (trainingDetail.length > 0) {
                        trainingDetail = trainingDetail[0];
                        if (trainingDetail.trainingFeedbacks.length > 0) {
                        }
                    }
                }
                else {
                    result = false;
                }
                return result;
            }

            $scope.startTraining = function (id, element, agreementId) {
                if (id > 0) {
                    dialogService.showYesNoDialog($translate.instant('COMMON_CONFIRM'), $translate.instant('TRAININGDAIRY_REVIEW_TRAINING_NOTES_AND_FEEDBACK_TO_PERFORM_BETTER_TRAINING') + "</br>" + $translate.instant('TRAININGDAIRY_ARE_YOU_SURE_YOU_WANT_TO_START_TRAINING')).then(
                        function () {
                            $location.path("/home/training/start/" + id);
                        },
                        function () {
                        });
                }
            }
            $scope.isEvaluationFeedbackViewOnly = function () {
                return $scope.evaluationFeedbackViewOnly;
            }
            $scope.updateEvaluationFeedback = function () {
                var ratingValue = parseInt($('#stars li.selected label').last().data('value'), 10);
                if (ratingValue) {
                    $scope.evaluationFeedback.rating = ratingValue;
                }
                trainingdiaryManager.updateTraningFeedback($scope.evaluationFeedback).then(function (data) {
                    if (data) {
                        dialogService.showNotification($translate.instant('TRAININGDAIRY_FEEDBACK_SAVED_SUCCESSFULLY'), "success");
                        $scope.evaluationFeedbackDDLChanged();
                        $("#tdFeedbackModal").modal("hide");
                    }
                    else {
                        dialogService.showNotification($translate.instant('TRAININGDAIRY_FEEDBACK_NOT_SAVED'), "warning");
                    }
                });
            }


            $scope.onUserAssignGridDataBound = function (e) {
                var grid = e.sender;
                if (grid.dataSource.total() == 0) {
                    var colCount = grid.columns.length;
                    $(e.sender.wrapper)
                        .find('tbody')
                        .append('<tr class="kendo-data-row"><td colspan="' + colCount + '" class="no-data">There is no data to show in the grid.</td></tr>');
                }
                else {
                    $compile(e.sender.element)($scope);
                }
            };


            $scope.addTrainingNote = function (trainingId) {
                if (trainingId > 0) {
                    $scope.selectedTrainingId = trainingId;
                    var html = '<training-note-window  training-id="selectedTrainingId" ' +
                        ' open-training-note-popup-mode="openTrainingNotePopupMode" > ' +
                        ' </training-note-window>';
                    var linkFn = $compile(html);
                    var content = linkFn($scope);
                    $("#training-note-popup-div").html(content);
                    $scope.openTrainingNotePopupMode.isOpenNewTrainingNotePopup = true;
                }
            }
            $scope.hasTrainingNotes = function (trainingId) {

                var isExist = _.any($scope.trainingNotesAvailableFor, function (value) {
                    return value == trainingId;
                });
                return isExist;
            }
            $scope.viewTrainingNotes = function (title, trainingId) {
                $scope.trainingNotes = [];
                trainingsDiaryService.getTrainingNotes(trainingId).then(function (data) {
                    $scope.trainingNotes = [];
                    _.each(data, function (trainingNotes) {
                        trainingNotes["title"] = title;
                        $scope.trainingNotes.push(trainingNotes);
                    });
                    var columns = [
                        { field: "title", title: $translate.instant('COMMON_TITLE'), width: "20%" },
                        { field: "goal", title: $translate.instant('COMMON_GOAL'), width: "20%" },
                        { field: "otherInfo", title: $translate.instant('COMMON_OTHER_INFO'), width: "15%" },
                        { field: "measureInfo", title: $translate.instant('COMMON_MEASURE_INFO'), width: "15%" },
                        { field: "proceedInfo", title: $translate.instant('COMMON_PROCEED_INFO'), width: "20%" },
                    ];
                    var windowDiv = $('#gridDialogWindow');
                    var dialog = windowDiv.data("kendoWindow");
                    if (dialog) {
                        dialog.close();
                    }
                    dialogService.showGridDialog($translate.instant('TRAININGDAIRY_TRAINING_NOTES') + " - " + title, $scope.trainingNotes, columns);
                })
            }
            $scope.viewHistory = function (title, eventType, id) {
                if (eventType == eventTypeEnum.OwnTraining || eventType == eventTypeEnum.EvaluateParticipantTraining) {
                    if (id > 0) {
                        trainingsDiaryService.getById(id).then(function (item) {
                            var event = new kendo.data.SchedulerEvent({
                                id: item.id,
                                name: item.name,
                                start: kendo.parseDate(item.startDate), //item1.start,
                                end: kendo.parseDate(item.endDate),
                                recurrenceRule: item.frequency,
                                eventType: item.eventType,
                                isPaused: false
                            });
                            var occurrences = event.expand(kendo.parseDate(item.startDate), kendo.parseDate(item.endDate));
                            var recurrenceHistory = [];
                            var recurrence = -1;
                            angular.forEach(occurrences, function (item1, index1) {
                                var isRecurrenceDone = _.filter(item.trainingFeedbacks, function (itemfeedback) {
                                    if (itemfeedback.recurrencesStartTime) {
                                        return itemfeedback.trainingId == item.id && kendo.parseDate(itemfeedback.recurrencesStartTime).getTime() == item1.start.getTime() && itemfeedback.isParticipantPaused == false;;
                                    }
                                });
                                var startedAt = null;
                                var endedAt = null;
                                if (isRecurrenceDone.length > 0) {
                                    var ascRecurrenceDone = _.sortByOrder(isRecurrenceDone, function (o) { return new moment(kendo.parseDate(o.startedAt)).format('L LT'); }, ['asc']);
                                    startedAt = ascRecurrenceDone[0].startedAt;
                                    endedAt = ascRecurrenceDone[ascRecurrenceDone.length - 1].feedbackDateTime;
                                }
                                if (!isRecurrenceDone.length > 0) {
                                    var isRecurrencePaused = _.filter(item.trainingFeedbacks, function (itemfeedback) {
                                        if (itemfeedback.recurrencesStartTime) {
                                            return itemfeedback.trainingId == item.id && kendo.parseDate(itemfeedback.recurrencesStartTime).getTime() == item1.start.getTime() && itemfeedback.isParticipantPaused == true;
                                        }
                                    });
                                    if (isRecurrencePaused.length > 0) {
                                        item1.isPaused = true;
                                        _.each(isRecurrencePaused, function (pausedItem) {
                                            item1.timeSpentMinutes += pausedItem.timeSpentMinutes != null ? parseInt(pausedItem.timeSpentMinutes) : 0;
                                        });
                                    }
                                }
                                var endTime = moment(kendo.parseDate(item1.start)).endOf("day")._d;
                                if (occurrences[index1 + 1]) {
                                    recurrenceHistory.push({
                                        "orginalId": item.id,
                                        "id": recurrence,
                                        "name": item1.name,
                                        "start": kendo.parseDate(item1.start), //"/Date(1523511510858)/", //item1.start,
                                        "end": endTime, //"/Date(1523511510858)/"
                                        "eventType": eventTypeEnum.OwnTraining,
                                        "isDone": isRecurrenceDone.length > 0 ? true : false,
                                        "startedAt": isRecurrenceDone.length > 0 ? startedAt : false,
                                        "rating": isRecurrenceDone.length > 0 ? isRecurrenceDone[0].rating : '',
                                        "feedbackDateTime": isRecurrenceDone.length > 0 ? isRecurrenceDone[0].feedbackDateTime : '',
                                        "workedWell": isRecurrenceDone.length > 0 ? isRecurrenceDone[0].workedWell : '',
                                        "workedNotWell": isRecurrenceDone.length > 0 ? isRecurrenceDone[0].workedNotWell : '',
                                        "whatNextDescription": isRecurrenceDone.length > 0 ? isRecurrenceDone[0].whatNextDescription : '',
                                        "timeSpentMinutes": item1.timeSpentMinutes,
                                        "isPaused": item1.isPaused
                                    })
                                }
                                else {
                                    if (endTime.getTime() > kendo.parseDate(item.endDate).getTime()) {
                                        endTime = moment(kendo.parseDate(item.endDate))._d;
                                    }
                                    if (item1.start.getTime() != endTime.getTime()) {
                                        recurrenceHistory.push({
                                            "orginalId": item.id,
                                            "id": recurrence,
                                            "name": item1.name,
                                            "start": kendo.parseDate(item1.start), //"/Date(1523511510858)/", //item1.start,
                                            "end": endTime, //"/Date(1523511510858)/"
                                            "eventType": eventTypeEnum.OwnTraining,
                                            "isDone": isRecurrenceDone.length > 0 ? true : false,
                                            "startedAt": isRecurrenceDone.length > 0 ? startedAt : false,
                                            "rating": isRecurrenceDone.length > 0 ? isRecurrenceDone[0].rating : '',
                                            "feedbackDateTime": isRecurrenceDone.length > 0 ? isRecurrenceDone[0].feedbackDateTime : '',
                                            "workedWell": isRecurrenceDone.length > 0 ? isRecurrenceDone[0].workedWell : '',
                                            "workedNotWell": isRecurrenceDone.length > 0 ? isRecurrenceDone[0].workedNotWell : '',
                                            "whatNextDescription": isRecurrenceDone.length > 0 ? isRecurrenceDone[0].whatNextDescription : '',
                                            "timeSpentMinutes": item1.timeSpentMinutes,
                                            "isPaused": item1.isPaused
                                        })
                                    }
                                }
                                recurrence = recurrence - 1;
                            });
                            var columns = [
                                { field: "name", title: $translate.instant('COMMON_NAME') },
                                {
                                    field: "start", title: $translate.instant('COMMON_RECURRENCE_START_TIME'), template: function (dataItem) {
                                        if (dataItem.start) {
                                            return moment(kendo.parseDate(dataItem.start)).format('L LT');
                                        }
                                        else {
                                            return '';
                                        }
                                    }
                                },
                                {
                                    field: "end", title: $translate.instant('COMMON_RECURRENCE_END_TIME'), template: function (dataItem) {
                                        if (dataItem.end) {
                                            return moment(kendo.parseDate(dataItem.end)).format('L LT');
                                        }
                                        else {
                                            return '';
                                        }
                                    }
                                },
                                {
                                    field: "startedAt", title: $translate.instant('COMMON_STARTED_AT'), template: function (dataItem) {
                                        if (dataItem.startedAt) {
                                            return moment(kendo.parseDate(dataItem.startedAt)).format('L LT');
                                        }
                                        else {
                                            return '';
                                        }
                                    }
                                },
                                {
                                    field: "feedbackDateTime", title: $translate.instant('COMMON_FEEDBACK_TIME'), template: function (dataItem) {
                                        if (dataItem.feedbackDateTime) {
                                            return moment(kendo.parseDate(dataItem.feedbackDateTime)).format('L LT');
                                        }
                                        else {
                                            return '';
                                        }
                                    }
                                },
                                { field: "workedWell", title: $translate.instant('COMMON_WORKED_WELL') },
                                { field: "workedNotWell", title: $translate.instant('COMMON_WORKED_NOT_WELL') },
                                { field: "whatNextDescription", title: $translate.instant('COMMON_WHAT_NEXT') },
                                {
                                    field: "rating", title: $translate.instant('COMMON_RATING'), template: function (data) {
                                        var template = "";
                                        for (var i = 0; i < data.rating; i++) {
                                            template += "<span><label class='fa fa-star fa-fw selected'></label></span>";
                                        }
                                        return template;
                                    }
                                },
                                {
                                    field: "isDone", title: $translate.instant('COMMON_IS_DONE'), template: function (dataItem) {
                                        if (dataItem.isDone) {
                                            return trainingStatus.Done;
                                        }
                                        else {
                                            var today = new Date();
                                            if (dataItem.start.getTime() > today.getTime()) {
                                                return trainingStatus.UpComing;
                                            }
                                            else {
                                                if (dataItem.end.getTime() > today.getTime()) {
                                                    if (dataItem.isPaused) {
                                                        return trainingStatus.Paused;
                                                    }
                                                    else {
                                                        return trainingStatus.Active;
                                                    }
                                                }
                                                else {
                                                    if (dataItem.isPaused) {
                                                        return trainingStatus.PausedExpired //"Expired after paused";
                                                    }
                                                    else {
                                                        return trainingStatus.Expired;
                                                    }
                                                }
                                            }
                                        }
                                    }
                                },
                            ];
                            var windowDiv = $('#gridDialogWindow');
                            var dialog = windowDiv.data("kendoWindow");
                            if (dialog) {
                                dialog.close();
                            }
                            dialogService.showGridDialog($translate.instant('TRAININGDAIRY_TRAINING_FEEDBACKS') + " - " + title, recurrenceHistory, columns);
                        })
                    }
                    else {
                        dialogService.showNotification($translate.instant('TRAININGDAIRY_YOU_CAN_NOT_OPEN') + $translate.instant('TRAININGDAIRY_FREE_TEXT') + $translate.instant('COMMON_TRAINING'), "info");
                    }
                }

            }
            $scope.addNewTM = function (trainingId) {
                $scope.trainingMaterial = {
                    id: 0,
                    title: null,
                    name: null,
                    description: null,
                    trainingId: trainingId,
                    materialType: null,
                    resourceType: null,
                    link: null
                };
                $scope.winNewTrainingMaterialVisible = true;
                $scope.winNewTrainingMaterial.open().center();
                $scope.winNewTrainingMaterial.element.parent().find(".k-window-title").html($scope.activeTraining.skills[0].name + ": New Training Material");
            }
            $scope.upload = [];
            $scope.onTMSelect = function ($files) {
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
                            if (!$scope.trainingMaterial.title) { $scope.trainingMaterial.title = $file.name; }
                            (data) ? $scope.trainingMaterial.name = data : '';
                        }).error(function (data) {
                            dialogService.showNotification(data, 'warning');
                        });
                    })(i);
                }
            };
            $scope.cancelTrainingMaterial = function () {
                $scope.winNewTrainingMaterialVisible = true;
                $scope.winNewTrainingMaterial.close();
            };
            $scope.SaveNewTrainingMaterial = function () {
                if (($scope.trainingMaterial.materialType) && ($scope.trainingMaterial.materialType.name)) {
                    $scope.trainingMaterial.materialType = $scope.trainingMaterial.materialType.name;
                }
                else {
                    $scope.trainingMaterial.materialType = "";
                }
                trainingdiaryManager.saveNewTrainingMaterial($scope.trainingMaterial).then(function (data) {
                    $scope.activeTraining.trainingMaterials.push($scope.trainingMaterial);
                    $scope.profileTrainingMaterials.push($scope.trainingMaterial);
                    $scope.winNewTrainingMaterial.close();
                    $("#trainingmaterialGrid").data("kendoGrid").dataSource.read();
                })
            };
            $scope.getTrainingSpentTime = function (training) {
                var spentTimes = 0;
                _.each(training.trainingFeedbacks, function (trainingFeedbackItem) {
                    spentTimes += trainingFeedbackItem.timeSpentMinutes;
                });
                if (spentTimes > 60) {
                    return (spentTimes / 60).toFixed(2) + " Hours";
                }
                else {
                    return spentTimes + " Min";
                }
            }
            $scope.getTrainingPlannedTime = function (trainingObj) {
                var plannedTime = 0;
                var event = new kendo.data.SchedulerEvent({
                    id: trainingObj.id,
                    start: kendo.parseDate(trainingObj.startDate), //item1.start,
                    end: kendo.parseDate(trainingObj.endDate),
                    recurrenceRule: trainingObj.frequency,
                    isAllDay: moment(kendo.parseDate(trainingObj.startDate)).format("HHmmss") == "000000",
                });
                var occurrences = event.expand(kendo.parseDate(trainingObj.startDate), kendo.parseDate(trainingObj.endDate));
                var recurrence = -1;
                if (trainingObj.durationMetricId == 1) {
                    //Hour
                    plannedTime += (trainingObj.duration * 60);
                }
                if (trainingObj.durationMetricId == 3) {
                    //Minutes
                    plannedTime += (trainingObj.duration);
                }
                if (trainingObj.durationMetricId == 4) {
                    //Seconds
                    plannedTime += (trainingObj.duration / 60);
                }
                if (trainingObj.durationMetricId == 5) {
                    //Days
                    plannedTime += (trainingObj.duration * 1440);
                }
                plannedTime = (plannedTime * occurrences.length);
                if (plannedTime > 60) {
                    return (plannedTime / 60).toFixed(2) + " Hours";
                }
                else {
                    return plannedTime + " Min";
                }
            }
        }])